# نظام إدارة الحملة الانتخابية العربية
# Arabic Election Campaign Management System

نظام شامل لإدارة الحملات الانتخابية باللغة العربية مع واجهة RTL وميزات متقدمة.

A comprehensive Arabic election campaign management system with RTL interface and advanced features.

## 🌟 الميزات الرئيسية / Key Features

### 📱 تطبيق الناخبين / Voter Application
- تسجيل الدخول عبر OTP والهاتف / Phone-based OTP authentication
- إدارة الملف الشخصي والعائلة / Profile and family management
- رفع إثبات التصويت / Vote proof upload
- خريطة مراكز الاقتراع / Voting centers map
- الإشعارات والبلاغات / Notifications and reports

### 🛠 تطبيق الإدارة والمراقبة / Admin & Monitor Application
- لوحة تحكم تفاعلية مع الرسوم البيانية / Interactive dashboard with charts
- إدارة المراقبين والناخبين / Monitor and voter management
- تتبع GPS للمراقبين / GPS tracking for monitors
- إدارة الرواتب والتقارير / Salary and report management
- خريطة حرارية للمناطق / Regional heatmap

### 🔐 الأمان والحماية / Security & Protection
- سياسات RLS متقدمة / Advanced RLS policies
- تشفير الملفات والبيانات / File and data encryption
- نسخ احتياطية تلقائية / Automated backups
- تسجيل العمليات الحساسة / Sensitive operations logging

## 🚀 التقنيات المستخدمة / Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Charts**: ApexCharts
- **Icons**: Lucide React
- **Deployment**: Docker, Nginx, PM2

## 📦 التثبيت والإعداد / Installation & Setup

### 1. متطلبات النظام / System Requirements
```bash
Node.js 18+
npm 9+
Git
```

### 2. تحميل المشروع / Download Project
```bash
# Extract the downloaded ZIP file
unzip arabic-election-system.zip
cd arabic-election-system
```

### 3. تثبيت التبعيات / Install Dependencies
```bash
npm install
```

### 4. إعداد البيئة / Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your Supabase credentials
nano .env
```

Required environment variables:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. إعداد Supabase / Supabase Setup

#### Create New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and API keys

#### Import Database Schema
```bash
# Connect to your Supabase project
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Import the schema
\i supabase/schema.sql

# Import storage configuration
\i supabase/storage.config.sql
```

#### Deploy Edge Functions (Optional)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy
```

### 6. تشغيل التطبيق / Run Application

#### Development Mode
```bash
npm run dev
```
Application will be available at `http://localhost:5173`

#### Production Build
```bash
npm run build
```

#### Preview Production Build
```bash
npm run preview
```

## 🌐 النشر / Deployment

### Option 1: Nginx + PM2
```bash
# Build the project
npm run build

# Install PM2 globally
npm install -g pm2

# Serve with PM2
pm2 serve dist 3000 --name "arabic-election-system"

# Configure Nginx
sudo nano /etc/nginx/sites-available/arabic-election-system
```

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/arabic-election-system/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Option 2: Docker
```bash
# Build Docker image
docker build -t arabic-election-system .

# Run with Docker Compose
docker-compose up -d
```

### Option 3: Static Hosting
Upload the `dist` folder contents to any static hosting service (Apache, Nginx, Cloudflare Pages, etc.)

## 🔧 الأدوات المساعدة / Utility Tools

### النسخ الاحتياطي / Backup
```bash
# Manual backup
npm run backup

# Setup automated daily backup (cron)
crontab -e
# Add: 0 2 * * * cd /path/to/project && npm run backup
```

### تصدير Supabase / Supabase Export
```bash
npm run supabase:export
```

### أرشفة المشروع / Project Archive
```bash
npm run archive
```

## 📊 هيكل المشروع / Project Structure

```
arabic-election-system/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities and Supabase client
│   └── data/              # Mock data
├── supabase/              # Database and functions
│   ├── migrations/        # Database migrations
│   ├── functions/         # Edge functions
│   ├── schema.sql         # Complete database schema
│   └── storage.config.sql # Storage buckets and policies
├── scripts/               # Utility scripts
│   ├── backup.js          # Backup script
│   ├── supabase-export.sh # Supabase export
│   └── create-archive.sh  # Project archiver
├── docker/                # Docker configuration
│   ├── Dockerfile         # Docker image
│   ├── docker-compose.yml # Docker compose
│   └── nginx.conf         # Nginx configuration
├── public/                # Static assets
├── dist/                  # Built application (after npm run build)
└── docs/                  # Documentation
```

## 🔐 الأمان / Security

### Database Security
- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Encrypted sensitive data
- Audit logging for sensitive operations

### Application Security
- HTTPS enforcement
- CORS protection
- XSS protection
- CSRF protection
- Content Security Policy

### File Upload Security
- File type validation
- File size limits
- Virus scanning (recommended)
- Secure file storage

## 📈 المراقبة والتحليل / Monitoring & Analytics

### Built-in Features
- Interactive dashboard
- Real-time statistics
- Regional heatmaps
- Performance reports
- GPS tracking for monitors

### Recommended External Tools
- Supabase Analytics
- Google Analytics
- Sentry for error tracking
- Uptime monitoring

## 🔧 التخصيص / Customization

### Branding
- Update colors in `tailwind.config.js`
- Replace logos in `public/` folder
- Modify text content in components

### Features
- Add new user roles in database schema
- Extend dashboard with custom charts
- Add new notification types
- Implement custom reporting

## 🤝 المساهمة / Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Arabic RTL support

## 🐛 استكشاف الأخطاء / Troubleshooting

### Common Issues

#### Supabase Connection Issues
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
curl -H "apikey: YOUR_ANON_KEY" "YOUR_SUPABASE_URL/rest/v1/"
```

#### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

#### Permission Issues
```bash
# Fix file permissions
chmod +x scripts/*.sh
```

### Getting Help
- Check the logs: `npm run dev` or `pm2 logs`
- Review Supabase dashboard for database issues
- Check browser console for frontend errors

## 📄 الترخيص / License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 الدعم / Support

For support and questions:
- Create an issue in the project repository
- Check the documentation in the `docs/` folder
- Review the troubleshooting section above

## 🎯 Demo Credentials

For testing purposes:
- **Phone**: `07700000000`
- **OTP Code**: `123456`
- **Role**: Super Admin

---

تم تطوير هذا النظام بعناية لخدمة العملية الديمقراطية وضمان شفافية الانتخابات.

This system was carefully developed to serve the democratic process and ensure election transparency.