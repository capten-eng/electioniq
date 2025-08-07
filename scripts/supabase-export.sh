#!/bin/bash

# Supabase Export Script for Arabic Election Campaign System
# This script exports the complete Supabase schema and functions

set -e

echo "🚀 Starting Supabase Export Process..."

# Create export directory
EXPORT_DIR="supabase-export-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$EXPORT_DIR"

echo "📁 Created export directory: $EXPORT_DIR"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Login to Supabase (if not already logged in)
echo "🔐 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "Please login to Supabase:"
    supabase login
fi

# Export database schema
echo "📊 Exporting database schema..."
supabase db dump --schema-only > "$EXPORT_DIR/schema.sql"

# Export database data
echo "💾 Exporting database data..."
supabase db dump --data-only > "$EXPORT_DIR/data.sql"

# Export edge functions
echo "⚡ Exporting edge functions..."
if [ -d "supabase/functions" ]; then
    cp -r supabase/functions "$EXPORT_DIR/"
    echo "✅ Edge functions exported"
else
    echo "⚠️  No edge functions found"
fi

# Export migrations
echo "🔄 Exporting migrations..."
if [ -d "supabase/migrations" ]; then
    cp -r supabase/migrations "$EXPORT_DIR/"
    echo "✅ Migrations exported"
else
    echo "⚠️  No migrations found"
fi

# Export configuration
echo "⚙️  Exporting configuration..."
if [ -f "supabase/config.toml" ]; then
    cp supabase/config.toml "$EXPORT_DIR/"
    echo "✅ Configuration exported"
fi

# Create README for the export
cat > "$EXPORT_DIR/README.md" << EOF
# Supabase Export - Arabic Election Campaign System

Export created on: $(date)

## Contents

- \`schema.sql\` - Complete database schema
- \`data.sql\` - Database data export
- \`functions/\` - Edge functions
- \`migrations/\` - Database migrations
- \`config.toml\` - Supabase configuration

## Restoration Instructions

1. Create a new Supabase project
2. Run: \`supabase db reset\`
3. Apply schema: \`psql -f schema.sql\`
4. Import data: \`psql -f data.sql\`
5. Deploy functions: \`supabase functions deploy\`

## Security Note

This export may contain sensitive data. Store securely and limit access.
EOF

echo "✅ Export completed successfully!"
echo "📦 Export location: $EXPORT_DIR"
echo "📋 Files exported:"
ls -la "$EXPORT_DIR"