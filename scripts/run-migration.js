#!/usr/bin/env node

/**
 * Migration Runner Script
 * 
 * This script helps you run database migrations.
 * 
 * Usage:
 *   node scripts/run-migration.js
 * 
 * Or if you have Supabase CLI installed:
 *   supabase db push
 */

const fs = require('fs')
const path = require('path')

const migrationFile = path.join(__dirname, '../migrations/001_create_bookings_table.sql')

console.log('📦 Database Migration Runner\n')
console.log('=' .repeat(50))

if (!fs.existsSync(migrationFile)) {
  console.error('❌ Migration file not found:', migrationFile)
  process.exit(1)
}

const sql = fs.readFileSync(migrationFile, 'utf-8')

console.log('\n📄 Migration SQL:')
console.log('-'.repeat(50))
console.log(sql)
console.log('-'.repeat(50))

console.log('\n📋 Instructions:')
console.log('\n1. Open your Supabase dashboard: https://app.supabase.com')
console.log('2. Select your project')
console.log('3. Go to SQL Editor')
console.log('4. Copy the SQL above and paste it into the editor')
console.log('5. Click "Run" to execute the migration')
console.log('\n✅ After running, verify the "bookings" table exists in Table Editor\n')

console.log('💡 Alternative: If you have Supabase CLI installed, run:')
console.log('   supabase db push\n')
