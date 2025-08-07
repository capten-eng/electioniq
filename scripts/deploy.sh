#!/bin/bash

# Arabic Election Campaign System - Deployment Script
# This script helps deploy the application to various environments

set -e

echo "🚀 Arabic Election Campaign System - Deployment Script"
echo "======================================================"

# Configuration
PROJECT_NAME="arabic-election-system"
BUILD_DIR="dist"
BACKUP_DIR="backups"

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

# Check requirements
check_requirements() {
    log_info "Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Copying from .env.example"
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_warning "Please update .env with your actual values before continuing"
            exit 1
        else
            log_error ".env.example not found"
            exit 1
        fi
    fi
    
    log_success "Requirements check passed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    npm install
    log_success "Dependencies installed"
}

# Build application
build_application() {
    log_info "Building application..."
    
    # Clean previous build
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
    fi
    
    # Build
    npm run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build failed - $BUILD_DIR directory not found"
        exit 1
    fi
    
    log_success "Application built successfully"
}

# Deploy to static hosting
deploy_static() {
    local target_dir="$1"
    
    if [ -z "$target_dir" ]; then
        log_error "Target directory not specified"
        exit 1
    fi
    
    log_info "Deploying to static hosting: $target_dir"
    
    # Create target directory if it doesn't exist
    mkdir -p "$target_dir"
    
    # Copy built files
    cp -r "$BUILD_DIR"/* "$target_dir/"
    
    log_success "Deployed to $target_dir"
}

# Deploy with PM2
deploy_pm2() {
    log_info "Deploying with PM2..."
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        log_info "Installing PM2..."
        npm install -g pm2
    fi
    
    # Stop existing process
    pm2 stop "$PROJECT_NAME" 2>/dev/null || true
    pm2 delete "$PROJECT_NAME" 2>/dev/null || true
    
    # Start new process
    pm2 serve "$BUILD_DIR" 3000 --name "$PROJECT_NAME"
    pm2 save
    
    log_success "Deployed with PM2"
}

# Deploy with Docker
deploy_docker() {
    log_info "Deploying with Docker..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Build Docker image
    docker build -t "$PROJECT_NAME" .
    
    # Stop existing container
    docker stop "$PROJECT_NAME" 2>/dev/null || true
    docker rm "$PROJECT_NAME" 2>/dev/null || true
    
    # Run new container
    docker run -d \
        --name "$PROJECT_NAME" \
        -p 3000:8080 \
        --restart unless-stopped \
        "$PROJECT_NAME"
    
    log_success "Deployed with Docker"
}

# Deploy with Docker Compose
deploy_docker_compose() {
    log_info "Deploying with Docker Compose..."
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Stop existing services
    docker-compose down 2>/dev/null || true
    
    # Build and start services
    docker-compose up -d --build
    
    log_success "Deployed with Docker Compose"
}

# Create backup before deployment
create_backup() {
    log_info "Creating backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Run backup script if it exists
    if [ -f "scripts/backup.js" ]; then
        node scripts/backup.js
        log_success "Database backup created"
    else
        log_warning "Backup script not found, skipping database backup"
    fi
    
    # Create project archive
    if [ -f "scripts/create-archive.sh" ]; then
        chmod +x scripts/create-archive.sh
        ./scripts/create-archive.sh
        log_success "Project archive created"
    fi
}

# Setup systemd service
setup_systemd() {
    local service_file="/etc/systemd/system/$PROJECT_NAME.service"
    local current_dir=$(pwd)
    
    log_info "Setting up systemd service..."
    
    # Create service file
    sudo tee "$service_file" > /dev/null <<EOF
[Unit]
Description=Arabic Election Campaign System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$current_dir
ExecStart=/usr/bin/npm run preview
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable "$PROJECT_NAME"
    sudo systemctl start "$PROJECT_NAME"
    
    log_success "Systemd service configured"
}

# Setup nginx configuration
setup_nginx() {
    local domain="$1"
    local port="${2:-3000}"
    
    if [ -z "$domain" ]; then
        log_error "Domain not specified"
        exit 1
    fi
    
    log_info "Setting up Nginx configuration for $domain"
    
    # Create nginx config
    sudo tee "/etc/nginx/sites-available/$PROJECT_NAME" > /dev/null <<EOF
server {
    listen 80;
    server_name $domain;
    
    location / {
        proxy_pass http://localhost:$port;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    # Enable site
    sudo ln -sf "/etc/nginx/sites-available/$PROJECT_NAME" "/etc/nginx/sites-enabled/"
    
    # Test nginx config
    sudo nginx -t
    
    # Reload nginx
    sudo systemctl reload nginx
    
    log_success "Nginx configured for $domain"
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build                    Build the application"
    echo "  deploy-static <dir>      Deploy to static hosting directory"
    echo "  deploy-pm2              Deploy using PM2"
    echo "  deploy-docker           Deploy using Docker"
    echo "  deploy-compose          Deploy using Docker Compose"
    echo "  setup-systemd           Setup systemd service"
    echo "  setup-nginx <domain>    Setup Nginx reverse proxy"
    echo "  backup                  Create backup before deployment"
    echo "  full-deploy <method>    Full deployment (backup + build + deploy)"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 deploy-static /var/www/html"
    echo "  $0 deploy-pm2"
    echo "  $0 setup-nginx example.com"
    echo "  $0 full-deploy pm2"
}

# Main deployment logic
main() {
    local command="$1"
    
    case "$command" in
        "build")
            check_requirements
            install_dependencies
            build_application
            ;;
        "deploy-static")
            check_requirements
            install_dependencies
            build_application
            deploy_static "$2"
            ;;
        "deploy-pm2")
            check_requirements
            install_dependencies
            build_application
            deploy_pm2
            ;;
        "deploy-docker")
            check_requirements
            deploy_docker
            ;;
        "deploy-compose")
            check_requirements
            deploy_docker_compose
            ;;
        "setup-systemd")
            setup_systemd
            ;;
        "setup-nginx")
            setup_nginx "$2" "$3"
            ;;
        "backup")
            create_backup
            ;;
        "full-deploy")
            local method="$2"
            if [ -z "$method" ]; then
                log_error "Deployment method not specified"
                show_usage
                exit 1
            fi
            
            create_backup
            check_requirements
            install_dependencies
            build_application
            
            case "$method" in
                "static")
                    deploy_static "$3"
                    ;;
                "pm2")
                    deploy_pm2
                    ;;
                "docker")
                    deploy_docker
                    ;;
                "compose")
                    deploy_docker_compose
                    ;;
                *)
                    log_error "Unknown deployment method: $method"
                    exit 1
                    ;;
            esac
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"