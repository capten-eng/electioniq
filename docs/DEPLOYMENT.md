# دليل النشر - نظام إدارة الحملة الانتخابية العربية
# Deployment Guide - Arabic Election Campaign Management System

هذا الدليل يوضح كيفية نشر النظام على خادم الإنتاج.

This guide explains how to deploy the system to a production server.

## 🚀 خيارات النشر / Deployment Options

### 1. النشر التلقائي / Automated Deployment

استخدم سكريبت النشر المدمج:
Use the built-in deployment script:

```bash
# إعداد الخادم الجديد / Setup new server
sudo ./scripts/setup-production.sh your-domain.com

# نشر كامل / Full deployment
./scripts/deploy.sh full-deploy pm2
```

### 2. النشر اليدوي / Manual Deployment

#### أ. إعداد البيئة / Environment Setup

```bash
# تحديث النظام / Update system
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js / Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت PM2 / Install PM2
sudo npm install -g pm2

# تثبيت Nginx / Install Nginx
sudo apt install -y nginx
```

#### ب. إعداد المشروع / Project Setup

```bash
# إنشاء مستخدم المشروع / Create project user
sudo useradd -m -s /bin/bash election
sudo mkdir -p /opt/arabic-election-system
sudo chown election:election /opt/arabic-election-system

# نسخ الملفات / Copy files
sudo -u election cp -r . /opt/arabic-election-system/
cd /opt/arabic-election-system

# تثبيت التبعيات / Install dependencies
sudo -u election npm install

# إعداد البيئة / Setup environment
sudo -u election cp .env.example .env
sudo -u election nano .env  # Update with your values

# بناء التطبيق / Build application
sudo -u election npm run build
```

#### ج. إعداد PM2 / PM2 Setup

```bash
# بدء التطبيق / Start application
sudo -u election pm2 serve dist 3000 --name "arabic-election-system"

# حفظ إعدادات PM2 / Save PM2 configuration
sudo -u election pm2 save

# إعداد بدء تلقائي / Setup auto-start
sudo pm2 startup systemd -u election --hp /home/election
```

#### د. إعداد Nginx / Nginx Setup

```bash
# إنشاء إعدادات Nginx / Create Nginx configuration
sudo tee /etc/nginx/sites-available/arabic-election-system << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# تفعيل الموقع / Enable site
sudo ln -s /etc/nginx/sites-available/arabic-election-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. النشر باستخدام Docker / Docker Deployment

```bash
# بناء الصورة / Build image
docker build -t arabic-election-system .

# تشغيل الحاوية / Run container
docker run -d \
  --name arabic-election-system \
  -p 3000:8080 \
  --restart unless-stopped \
  arabic-election-system

# أو استخدام Docker Compose / Or use Docker Compose
docker-compose up -d
```

## 🔐 إعداد SSL / SSL Setup

### استخدام Let's Encrypt

```bash
# تثبيت Certbot / Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL / Get SSL certificate
sudo certbot --nginx -d your-domain.com

# إعداد التجديد التلقائي / Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 المراقبة / Monitoring

### إعداد السجلات / Log Setup

```bash
# عرض سجلات PM2 / View PM2 logs
pm2 logs arabic-election-system

# عرض سجلات Nginx / View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# عرض سجلات النظام / View system logs
sudo journalctl -u nginx -f
```

### مراقبة الأداء / Performance Monitoring

```bash
# مراقبة PM2 / Monitor PM2
pm2 monit

# مراقبة الموارد / Monitor resources
htop
iotop
nethogs
```

## 🔄 النسخ الاحتياطي / Backup

### إعداد النسخ الاحتياطي التلقائي / Automated Backup Setup

```bash
# إنشاء سكريبت النسخ الاحتياطي / Create backup script
sudo tee /usr/local/bin/election-backup << 'EOF'
#!/bin/bash
cd /opt/arabic-election-system
sudo -u election npm run backup
EOF

sudo chmod +x /usr/local/bin/election-backup

# إضافة مهمة cron / Add cron job
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/election-backup
```

### النسخ الاحتياطي اليدوي / Manual Backup

```bash
# نسخ احتياطي لقاعدة البيانات / Database backup
npm run backup

# نسخ احتياطي للمشروع / Project backup
npm run archive

# تصدير Supabase / Supabase export
npm run supabase:export
```

## 🛡️ الأمان / Security

### إعدادات الجدار الناري / Firewall Settings

```bash
# تثبيت وإعداد UFW / Install and configure UFW
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### تحديثات الأمان / Security Updates

```bash
# تفعيل التحديثات التلقائية / Enable automatic updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### إعدادات SSH / SSH Configuration

```bash
# تحرير إعدادات SSH / Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# إعدادات مقترحة / Recommended settings:
# Port 2222  # Change default port
# PermitRootLogin no
# PasswordAuthentication no  # Use key-based auth
# AllowUsers election

sudo systemctl restart ssh
```

## 🔧 استكشاف الأخطاء / Troubleshooting

### مشاكل شائعة / Common Issues

#### التطبيق لا يبدأ / Application Won't Start

```bash
# فحص حالة PM2 / Check PM2 status
pm2 status
pm2 logs arabic-election-system

# فحص المنافذ / Check ports
sudo netstat -tlnp | grep :3000

# فحص الذاكرة / Check memory
free -h
```

#### مشاكل Nginx / Nginx Issues

```bash
# فحص إعدادات Nginx / Test Nginx configuration
sudo nginx -t

# فحص حالة Nginx / Check Nginx status
sudo systemctl status nginx

# إعادة تحميل Nginx / Reload Nginx
sudo systemctl reload nginx
```

#### مشاكل قاعدة البيانات / Database Issues

```bash
# فحص الاتصال بـ Supabase / Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" "YOUR_SUPABASE_URL/rest/v1/"

# فحص متغيرات البيئة / Check environment variables
cat .env
```

### أوامر مفيدة / Useful Commands

```bash
# إعادة تشغيل التطبيق / Restart application
pm2 restart arabic-election-system

# إعادة تشغيل Nginx / Restart Nginx
sudo systemctl restart nginx

# فحص استخدام القرص / Check disk usage
df -h

# فحص العمليات / Check processes
ps aux | grep node
```

## 📈 تحسين الأداء / Performance Optimization

### إعدادات Nginx / Nginx Optimization

```nginx
# إضافة إلى إعدادات Nginx / Add to Nginx configuration
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# تخزين مؤقت للملفات الثابتة / Static file caching
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### إعدادات PM2 / PM2 Optimization

```bash
# تشغيل عدة نسخ / Run multiple instances
pm2 start ecosystem.config.js

# مراقبة الذاكرة / Monitor memory
pm2 install pm2-auto-pull
```

## 🔄 التحديثات / Updates

### تحديث التطبيق / Application Updates

```bash
# سحب التحديثات / Pull updates
git pull origin main

# تثبيت التبعيات الجديدة / Install new dependencies
npm install

# بناء التطبيق / Build application
npm run build

# إعادة تشغيل / Restart
pm2 restart arabic-election-system
```

### تحديث النظام / System Updates

```bash
# تحديث الحزم / Update packages
sudo apt update && sudo apt upgrade -y

# تحديث Node.js / Update Node.js
sudo npm install -g n
sudo n stable

# تحديث PM2 / Update PM2
sudo npm install -g pm2@latest
pm2 update
```

---

للحصول على مساعدة إضافية، راجع الوثائق أو اتصل بفريق الدعم.

For additional help, refer to the documentation or contact the support team.