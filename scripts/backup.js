#!/usr/bin/env node

/**
 * Automated Backup Script for Arabic Election Campaign System
 * 
 * This script creates automated backups of the Supabase database
 * and can be scheduled to run periodically using cron jobs.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Tables to backup
const TABLES_TO_BACKUP = [
  'users',
  'voters', 
  'monitors',
  'voting_centers',
  'families',
  'notifications',
  'reports',
  'issues',
  'salaries',
  'route_history',
  'audit_logs'
];

/**
 * Create backup directory if it doesn't exist
 */
async function ensureBackupDir() {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
  }
}

/**
 * Backup a single table
 */
async function backupTable(tableName) {
  try {
    console.log(`📊 Backing up table: ${tableName}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      throw error;
    }

    return {
      table: tableName,
      count: data?.length || 0,
      data: data || []
    };
  } catch (error) {
    console.error(`❌ Error backing up table ${tableName}:`, error.message);
    return {
      table: tableName,
      count: 0,
      data: [],
      error: error.message
    };
  }
}

/**
 * Create full database backup
 */
async function createFullBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `backup-${timestamp}`;
  
  console.log(`🚀 Starting full backup: ${backupId}`);
  
  try {
    // Record backup start in database
    const { data: backupRecord } = await supabase
      .from('backup_metadata')
      .insert({
        backup_type: 'full',
        status: 'running',
        tables_included: TABLES_TO_BACKUP,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    const backup = {
      id: backupId,
      timestamp: new Date().toISOString(),
      type: 'full',
      tables: {}
    };

    let totalRecords = 0;
    const errors = [];

    // Backup each table
    for (const tableName of TABLES_TO_BACKUP) {
      const tableBackup = await backupTable(tableName);
      backup.tables[tableName] = tableBackup;
      
      if (tableBackup.error) {
        errors.push(`${tableName}: ${tableBackup.error}`);
      } else {
        totalRecords += tableBackup.count;
      }
    }

    // Save backup to file
    const backupPath = path.join(BACKUP_DIR, `${backupId}.json`);
    await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
    
    const stats = await fs.stat(backupPath);
    const fileSizeKB = Math.round(stats.size / 1024);

    // Update backup record
    await supabase
      .from('backup_metadata')
      .update({
        status: errors.length > 0 ? 'completed_with_errors' : 'completed',
        file_path: backupPath,
        file_size: stats.size,
        completed_at: new Date().toISOString(),
        error_message: errors.length > 0 ? errors.join('; ') : null
      })
      .eq('backup_id', backupRecord?.backup_id);

    console.log(`✅ Backup completed: ${backupId}`);
    console.log(`📁 File: ${backupPath} (${fileSizeKB} KB)`);
    console.log(`📊 Total records: ${totalRecords}`);
    
    if (errors.length > 0) {
      console.log(`⚠️  Errors encountered:`);
      errors.forEach(error => console.log(`   - ${error}`));
    }

    return { success: true, backupId, path: backupPath, totalRecords, errors };

  } catch (error) {
    console.error(`❌ Backup failed:`, error.message);
    
    // Update backup record with failure
    if (backupRecord?.backup_id) {
      await supabase
        .from('backup_metadata')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('backup_id', backupRecord.backup_id);
    }

    return { success: false, error: error.message };
  }
}

/**
 * Clean old backups (keep last 30 days)
 */
async function cleanOldBackups() {
  try {
    console.log('🧹 Cleaning old backups...');
    
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files.filter(file => file.startsWith('backup-') && file.endsWith('.json'));
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let deletedCount = 0;
    
    for (const file of backupFiles) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < thirtyDaysAgo) {
        await fs.unlink(filePath);
        deletedCount++;
        console.log(`🗑️  Deleted old backup: ${file}`);
      }
    }
    
    console.log(`✅ Cleaned ${deletedCount} old backup files`);
    
  } catch (error) {
    console.error('❌ Error cleaning old backups:', error.message);
  }
}

/**
 * Main backup function
 */
async function main() {
  console.log('🔄 Arabic Election System - Automated Backup');
  console.log('='.repeat(50));
  
  await ensureBackupDir();
  
  const result = await createFullBackup();
  
  if (result.success) {
    await cleanOldBackups();
    console.log('✅ Backup process completed successfully');
    process.exit(0);
  } else {
    console.error('❌ Backup process failed');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Arabic Election System - Backup Script

Usage: node backup.js [options]

Options:
  --help, -h     Show this help message
  --clean-only   Only clean old backups, don't create new backup

Environment Variables:
  SUPABASE_URL              Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY Supabase service role key
  BACKUP_DIR               Backup directory (default: ./backups)

Examples:
  node backup.js                    # Create full backup
  node backup.js --clean-only       # Clean old backups only

Cron Job Example (daily at 2 AM):
  0 2 * * * cd /path/to/project && node scripts/backup.js >> /var/log/election-backup.log 2>&1
  `);
  process.exit(0);
}

if (args.includes('--clean-only')) {
  cleanOldBackups().then(() => {
    console.log('✅ Cleanup completed');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  });
} else {
  main();
}