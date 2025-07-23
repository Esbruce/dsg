#!/usr/bin/env node

/**
 * Simple script to run database migrations
 * Run this with: node scripts/run-migration.js
 */

const fs = require('fs');
const path = require('path');

// Read the migration SQL file
const migrationPath = path.join(__dirname, '../lib/database/migrations/create_rate_limits_table.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📋 Rate Limits Migration SQL:');
console.log('================================');
console.log(migrationSQL);
console.log('================================');
console.log('');
console.log('📝 To apply this migration:');
console.log('');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the SQL above');
console.log('4. Click "Run" to execute the migration');
console.log('');
console.log('🔒 This will create:');
console.log('   - rate_limits table with proper indexes');
console.log('   - RLS policies for security');
console.log('   - Automatic timestamp updates');
console.log('');
console.log('✅ After running the migration, your rate limiting will be persistent and production-ready!'); 