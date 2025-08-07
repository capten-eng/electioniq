#!/bin/bash

# Arabic Election Campaign System - Production Setup Script
# This script sets up the production environment on a fresh server

set -e

echo "🏗️  Arabic Election Campaign System - Production Setup"
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuration
PROJECT_NAME="arabic-election-system"
PROJECT_USER="election"
PROJECT_DIR="/opt/$PROJECT_NAME"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Please run this script as root (use sudo)"
        exit 1
    fi
}

# Update system packages
update_system() {
    log_info "Updating system packages..."
    apt update && apt upgrade -y
    log_success "System updated"
}

# Install Node.js
install_nodejs() {
    log_info "Installing Node.js..."
    
    # Install NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Verify installation
    node_version=$(node --version)
    npm_version=$(npm --version)
    
    log_success "Node.js $node_version and npm $npm_version installed"
}

# Install Nginx
install_nginx() {
    log_info "Installing Nginx..."
    apt install -y nginx
    
    # Start and enable Nginx
    systemctl start nginx
    systemctl enable nginx
    
    log_success "Nginx installed and started"
}

# Install PM2
install_pm2() {
    log_info "Installing PM2..."
    npm install -g pm2
    
    # Setup PM2 startup script
    pm2 startup systemd -u "$PROJECT_USER" --hp "/home/$PROJECT_USER"
    
    log_success "PM2 installed"
}

# Install Docker (optional)
install_docker() {
    log_info "Installing Docker..."
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Add user to docker group
    usermod -aG docker "$PROJECT_USER"
    
    log_success "Docker and Docker Compose installed"
}

# Create project user
create_project_user() {
    log_info "Creating project user..."
    
    # Create user if it doesn't exist
    if ! id "$PROJECT_USER" &>/dev/null; then
        useradd -m -s /bin/bash "$PROJECT_USER"
        log_success "User $PROJECT_USER created"
    else
        log_info "User $PROJECT_USER already exists"
    fi
    
    # Create project directory
    mkdir -p "$PROJECT_DIR"
    chown "$PROJECT_USER:$PROJECT_USER" "$PROJECT_DIR"
    
    log_success "Project directory created at $PROJECT_DIR"
}

# Setup firewall
setup_firewall() {
    log_info "Setting up firewall..."
    
    # Install ufw if not installed
    apt install -y ufw
    
    # Configure firewall rules
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw allow 3000  # Application port
    
    # Enable firewall
    ufw --force enable
    
    log_success "Firewall configured"
}

# Setup SSL with Let's Encrypt (optional)
setup_ssl() {
    local domain="$1"
    
    if [ -z "$domain" ]; then
        log_warning "Domain not provided, skipping SSL setup"
        return
    fi
    
    log_info "Setting up SSL for $domain..."
    
    # Install Certbot
    apt install -y certbot python3-certbot-nginx
    
    # Get SSL certificate
    certbot --nginx -d "$domain" --non-interactive --agree-tos --email "admin@$domain"
    
    # Setup auto-renewal
    crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -
    
    log_success "SSL configured for $domain"
}

# Setup monitoring (optional)
setup_monitoring() {
    log_info "Setting up basic monitoring..."
    
    # Install htop and other monitoring tools
    apt install -y htop iotop nethogs
    
    # Setup log rotation
    cat > /etc/logrotate.d/$PROJECT_NAME << EOF
/var/log/$PROJECT_NAME/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $PROJECT_USER $PROJECT_USER
    postrotate
        systemctl reload nginx
    endscript
}
EOF
    
    log_success "Basic monitoring setup completed"
}

# Setup backup cron job
setup_backup_cron() {
    log_info "Setting up backup cron job..."
    
    # Create backup script
    cat > /usr/local/bin/election-backup << EOF
#!/bin/bash
cd $PROJECT_DIR
sudo -u $PROJECT_USER npm run backup
EOF
    
    chmod +x /usr/local/bin/election-backup
    
    # Add to crontab (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/election-backup") | crontab -
    
    log_success "Backup cron job configured"
}

# Create systemd service
create_systemd_service() {
    log_info "Creating systemd service..."
    
    cat > /etc/systemd/system/$PROJECT_NAME.service << EOF
[Unit]
Description=Arabic Election Campaign System
After=network.target

[Service]
Type=simple
User=$PROJECT_USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/npm run preview
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$PROJECT_NAME

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd
    systemctl daemon-reload
    systemctl enable $PROJECT_NAME
    
    log_success "Systemd service created"
}

# Setup Nginx configuration
setup_nginx_config() {
    local domain="${1:-localhost}"
    local port="${2:-3000}"
    
    log_info "Setting up Nginx configuration..."
    
    cat > "$NGINX_AVAILABLE/$PROJECT_NAME" << EOF
server {
    listen 80;
    server_name $domain;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
    
    location / {
        proxy_pass http://localhost:$port;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static assets caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
    
    # Security
    location ~ /\\. {
        deny all;
    }
}
EOF
    
    # Enable site
    ln -sf "$NGINX_AVAILABLE/$PROJECT_NAME" "$NGINX_ENABLED/"
    
    # Test configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    log_success "Nginx configuration created"
}

# Install security updates automatically
setup_auto_updates() {
    log_info "Setting up automatic security updates..."
    
    apt install -y unattended-upgrades
    
    # Configure automatic updates
    cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}ESMApps:\${distro_codename}-apps-security";
    "\${distro_id}ESM:\${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF
    
    # Enable automatic updates
    echo 'APT::Periodic::Update-Package-Lists "1";' > /etc/apt/apt.conf.d/20auto-upgrades
    echo 'APT::Periodic::Unattended-Upgrade "1";' >> /etc/apt/apt.conf.d/20auto-upgrades
    
    log_success "Automatic security updates configured"
}

# Show final instructions
show_final_instructions() {
    log_success "Production setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Copy your project files to $PROJECT_DIR"
    echo "2. Update the .env file with your production values"
    echo "3. Install project dependencies: sudo -u $PROJECT_USER npm install"
    echo "4. Build the application: sudo -u $PROJECT_USER npm run build"
    echo "5. Start the service: systemctl start $PROJECT_NAME"
    echo ""
    echo "Useful commands:"
    echo "- Check service status: systemctl status $PROJECT_NAME"
    echo "- View logs: journalctl -u $PROJECT_NAME -f"
    echo "- Restart service: systemctl restart $PROJECT_NAME"
    echo "- Check Nginx status: systemctl status nginx"
    echo ""
    echo "Security reminders:"
    echo "- Change default SSH port"
    echo "- Setup SSH key authentication"
    echo "- Configure fail2ban"
    echo "- Regular security updates are enabled"
}

# Main setup function
main() {
    local domain="$1"
    local install_docker="${2:-no}"
    
    log_info "Starting production setup..."
    
    check_root
    update_system
    install_nodejs
    install_nginx
    create_project_user
    install_pm2
    
    if [ "$install_docker" = "yes" ]; then
        install_docker
    fi
    
    setup_firewall
    setup_monitoring
    setup_backup_cron
    create_systemd_service
    setup_nginx_config "$domain"
    setup_auto_updates
    
    if [ -n "$domain" ] && [ "$domain" != "localhost" ]; then
        setup_ssl "$domain"
    fi
    
    show_final_instructions
}

# Show usage
show_usage() {
    echo "Usage: $0 [domain] [install_docker]"
    echo ""
    echo "Parameters:"
    echo "  domain         Domain name for the application (optional, default: localhost)"
    echo "  install_docker Whether to install Docker (yes/no, default: no)"
    echo ""
    echo "Examples:"
    echo "  $0                           # Setup with localhost"
    echo "  $0 example.com               # Setup with domain"
    echo "  $0 example.com yes           # Setup with domain and Docker"
}

# Check arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_usage
    exit 0
fi

# Run main function
main "$@"