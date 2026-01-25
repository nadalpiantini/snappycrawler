// ============================================
// SNAPPY - Auto-Install Schema via Playwright
// ============================================

const { chromium } = require('playwright')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const sqlContent = fs.readFileSync('./supabase/migrations/001_initial_schema.sql', 'utf-8')

async function autoInstallSchema() {
  console.log('📸 Snappy Platform - Auto-Install Schema')
  console.log('')
  console.log('🌐 Opening Supabase Dashboard with Playwright...')
  console.log('')

  const browser = await chromium.launch({
    headless: false, // headed mode
    slowMo: 100 // slower for visibility
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  })

  const page = await context.newPage()

  try {
    // Navigate to Supabase dashboard
    console.log(`🔗 Navigating to: ${supabaseUrl}`)
    await page.goto(supabaseUrl)

    // Wait for page load
    await page.waitForLoadState('networkidle')

    console.log('')
    console.log('⚠️  MANUAL STEP REQUIRED:')
    console.log('')
    console.log('1. Log in to Supabase if needed')
    console.log('2. In the dashboard, click "SQL Editor" in left sidebar')
    console.log('3. Copy and paste the schema below:')
    console.log('')
    console.log('='.repeat(60))
    console.log(sqlContent)
    console.log('='.repeat(60))
    console.log('')
    console.log('4. Click "Run" button')
    console.log('5. Verify tables created with this query:')
    console.log('')
    console.log("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'snappy_%';")
    console.log('')
    console.log('✅ Tables expected:')
    console.log('   - snappy_profiles')
    console.log('   - snappy_snapshots')
    console.log('   - snappy_normalized_snapshots')
    console.log('   - snappy_projects')
    console.log('   - snappy_project_snapshots')
    console.log('')
    console.log('📝 Press Ctrl+C when done...')

    // Keep browser open
    await new Promise(() => {}) // Never resolve

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await browser.close()
  }
}

autoInstallSchema()
