#!/bin/bash

# Project Archive Creation Script
# Creates a complete .zip archive of the Arabic Election Campaign System

set -e

echo "📦 Creating project archive..."

# Get project name and version
PROJECT_NAME="arabic-election-system"
VERSION=$(node -p "require('./package.json').version")
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_NAME="${PROJECT_NAME}-v${VERSION}-${TIMESTAMP}"

echo "🏷️  Archive name: ${ARCHIVE_NAME}.zip"

# Create temporary directory for archive preparation
TEMP_DIR="temp-archive"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR/$ARCHIVE_NAME"

echo "📁 Preparing files for archive..."

# Copy project files (excluding node_modules, dist, and other build artifacts)
rsync -av \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='temp-archive' \
  --exclude='backups' \
  --exclude='*.zip' \
  --exclude='.DS_Store' \
  --exclude='Thumbs.db' \
  . "$TEMP_DIR/$ARCHIVE_NAME/"

# Create deployment guide
cat > "$TEMP_DIR/$ARCHIVE_NAME/DEPLOYMENT.md" << EOF
# نظام إدارة الحملة الانتخابية - دليل النشر

## متطلبات النظام

- Node.js 18+
- npm 9+
- Supabase CLI
- Git

## خطوات النشر

### 1. إعداد البيئة المحلية

\`\`\`bash
# تثبيت التبعيات
npm install

# نسخ ملف البيئة
cp .env.example .env

# تحديث متغيرات البيئة في .env
\`\`\`

### 2. إعداد Supabase

\`\`\`bash
# تسجيل الدخول إلى Supabase
supabase login

# ربط المشروع
supabase link --project-ref your-project-ref

# تطبيق المايجريشن
supabase db push

# نشر الوظائف
supabase functions deploy
\`\`\`

### 3. البناء والنشر

#### Netlify
\`\`\`bash
# بناء المشروع
npm run build

# نشر على Netlify
netlify deploy --prod --dir=dist
\`\`\`

#### Vercel
\`\`\`bash
# نشر على Vercel
vercel --prod
\`\`\`

#### Docker
\`\`\`bash
# بناء الصورة
docker build -f docker/Dockerfile -t arabic-election-system .

# تشغيل الحاوية
docker run -p 3000:80 arabic-election-system
\`\`\`

### 4. إعداد النسخ الاحتياطي

\`\`\`bash
# جعل سكريبت النسخ الاحتياطي قابل للتنفيذ
chmod +x scripts/backup.js

# إضافة مهمة cron للنسخ الاحتياطي اليومي
0 2 * * * cd /path/to/project && node scripts/backup.js
\`\`\`

## الأمان

- تأكد من تحديث جميع متغيرات البيئة
- فعل HTTPS في الإنتاج
- راجع سياسات RLS في Supabase
- قم بعمل نسخ احتياطية منتظمة

## الدعم

للحصول على الدعم، راجع الوثائق أو اتصل بفريق التطوير.
EOF

# Create production checklist
cat > "$TEMP_DIR/$ARCHIVE_NAME/PRODUCTION-CHECKLIST.md" << EOF
# قائمة مراجعة الإنتاج

## ✅ قبل النشر

- [ ] تحديث متغيرات البيئة (.env.production)
- [ ] اختبار جميع الوظائف في بيئة التطوير
- [ ] مراجعة سياسات الأمان في Supabase
- [ ] تفعيل HTTPS
- [ ] إعداد النسخ الاحتياطي التلقائي
- [ ] اختبار الأداء والسرعة
- [ ] مراجعة سياسات RLS
- [ ] تفعيل مراقبة الأخطاء

## ✅ بعد النشر

- [ ] اختبار تسجيل الدخول
- [ ] اختبار رفع الملفات
- [ ] اختبار إرسال الإشعارات
- [ ] مراجعة السجلات (logs)
- [ ] اختبار النسخ الاحتياطي
- [ ] تدريب المستخدمين
- [ ] إعداد المراقبة والتنبيهات

## 🔧 إعدادات الإنتاج

### متغيرات البيئة المطلوبة
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

### إعدادات الأمان
- تفعيل RLS على جميع الجداول
- سياسات Storage محدودة بالمالك
- تشفير البيانات الحساسة
- تسجيل العمليات الحساسة

### المراقبة
- مراقبة استخدام قاعدة البيانات
- مراقبة حجم التخزين
- تتبع الأخطاء والاستثناءات
- مراقبة الأداء
EOF

# Create version info
cat > "$TEMP_DIR/$ARCHIVE_NAME/VERSION.json" << EOF
{
  "name": "نظام إدارة الحملة الانتخابية",
  "version": "$VERSION",
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "features": [
    "Phone-based OTP authentication",
    "Role-based access control",
    "Real-time notifications",
    "GPS tracking for monitors",
    "Document upload and management",
    "Interactive dashboard with charts",
    "Regional heatmap visualization",
    "Automated backup system",
    "Arabic RTL interface"
  ],
  "technologies": [
    "React 18",
    "TypeScript",
    "Tailwind CSS",
    "Supabase",
    "ApexCharts",
    "Lucide Icons"
  ]
}
EOF

echo "🗜️  Creating ZIP archive..."

# Create the ZIP file
cd "$TEMP_DIR"
zip -r "../${ARCHIVE_NAME}.zip" "$ARCHIVE_NAME"
cd ..

# Cleanup
rm -rf "$TEMP_DIR"

echo "✅ Archive created successfully!"
echo "📦 Archive: ${ARCHIVE_NAME}.zip"
echo "📊 Archive size: $(du -h "${ARCHIVE_NAME}.zip" | cut -f1)"

# Show archive contents
echo "📋 Archive contents:"
unzip -l "${ARCHIVE_NAME}.zip" | head -20
echo "..."
echo "Total files: $(unzip -l "${ARCHIVE_NAME}.zip" | tail -1 | awk '{print $2}')"