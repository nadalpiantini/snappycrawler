// ============================================
// SNAPPY - Install Database Schema
// ============================================

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

console.log('📸 Snappy Platform - Database Installation')
console.log('')
console.log(`🔗 URL: ${supabaseUrl}`)

// This script installs the schema by reading the SQL file
// We'll use the REST API to execute the SQL

async function installSchema() {
  try {
    // Read the SQL migration file
    const sqlContent = fs.readFileSync('./supabase/migrations/001_initial_schema.sql', 'utf-8')

    console.log('📄 SQL file loaded')
    console.log('')
    console.log('⚠️  To complete installation, follow these steps:')
    console.log('')
    console.log('1. Open Supabase Dashboard:')
    console.log(`   ${supabaseUrl}`)
    console.log('')
    console.log('2. Go to SQL Editor (in left sidebar)')
    console.log('')
    console.log('3. Copy and paste the content of:')
    console.log('   supabase/migrations/001_initial_schema.sql')
    console.log('')
    console.log('4. Click "Run" (or Ctrl+Enter)')
    console.log('')
    console.log('5. Verify tables created:')
    console.log('   SELECT tablename FROM pg_tables')
    console.log('   WHERE schemaname = \'public\'')
    console.log('   AND tablename LIKE \'snappy_%\';')
    console.log('')
    console.log('✅ Expected tables:')
    console.log('   - snappy_profiles')
    console.log('   - snappy_snapshots')
    console.log('   - snappy_normalized_snapshots')
    console.log('   - snappy_projects')
    console.log('   - snappy_project_snapshots')
    console.log('')

    // Optionally save SQL to clipboard file for easy copy
    fs.writeFileSync('./tmp_schema.sql', sqlContent)
    console.log('💡 SQL file saved to: ./tmp_schema.sql')
    console.log('   (You can copy this file easily to Supabase SQL Editor)')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

installSchema()
  .then(() => {
    console.log('✅ Installation guide complete!')
    console.log('')
    console.log('🚀 Next: Run `pnpm dev` after installing the schema')
  })
  .catch((error) => {
    console.error('💥 Error:', error)
    process.exit(1)
  })
