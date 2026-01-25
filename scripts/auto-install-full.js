// ============================================
// SNAPPY - Auto-Install Complete (Playwright)
// ============================================

const { chromium } = require('playwright')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const sqlContent = fs.readFileSync('./supabase/migrations/001_initial_schema.sql', 'utf-8')

async function autoInstall() {
  console.log('📸 Snappy Platform - Auto-Install Schema')
  console.log('==========================================')
  console.log('')
  console.log('🌐 Launching browser...')

  const browser = await chromium.launch({
    headless: false, // HEADED - ver el navegador
    slowMo: 50
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  })

  const page = await context.newPage()

  try {
    // Navigate to Supabase
    console.log(`🔗 Navigating to: ${supabaseUrl}`)
    await page.goto(supabaseUrl, { waitUntil: 'networkidle' })

    console.log('✅ Page loaded')
    console.log('')
    console.log('⚠️  Browser is open. Please:')
    console.log('1. Log in to Supabase (if not logged in)')
    console.log('2. Wait for automation to complete...')
    console.log('')

    // Wait a bit for manual login if needed
    console.log('⏳ Waiting 10 seconds for login...')
    await page.waitForTimeout(10000)

    // Try to find and click SQL Editor
    console.log('🔍 Looking for SQL Editor...')

    try {
      // Try to find SQL Editor link/button
      await page.waitForSelector('a[href*="sql"], button:has-text("SQL"), text=SQL Editor', {
        timeout: 5000
      })

      const sqlButton = await page.locator('a[href*="sql"], button:has-text("SQL"), text=SQL Editor').first()
      await sqlButton.click()

      console.log('✅ Clicked SQL Editor')
      await page.waitForTimeout(3000)

      // Try to find SQL editor textarea
      console.log('📝 Looking for SQL editor...')

      const sqlEditor = await page.locator('textarea, .monaco-editor textarea, [contenteditable="true"]').first()

      if (await sqlEditor.count() > 0) {
        console.log('✅ Found SQL editor')
        console.log('📝 Pasting SQL...')

        // Paste SQL content
        await sqlEditor.fill(sqlContent)

        console.log('✅ SQL pasted')
        await page.waitForTimeout(1000)

        // Try to find and click Run button
        console.log('🔘 Looking for Run button...')

        const runButton = await page.locator('button:has-text("Run"), button:has-text("Execute"), [role="button"]').first()

        if (await runButton.count() > 0) {
          await runButton.click()
          console.log('✅ Clicked Run button')
          console.log('')
          console.log('⏳ Waiting for execution...')
          await page.waitForTimeout(5000)
          console.log('✅ Schema installation complete!')
        } else {
          console.log('⚠️  Could not find Run button')
          console.log('   Please click Run manually')
        }
      } else {
        console.log('⚠️  Could not find SQL editor textarea')
        console.log('   Please paste SQL manually')
      }

    } catch (error) {
      console.log('⚠️  Automation could not find SQL Editor')
      console.log('   Please navigate manually')
    }

    console.log('')
    console.log('📋 SQL to paste (if manual):')
    console.log('='.repeat(60))
    console.log(sqlContent)
    console.log('='.repeat(60))
    console.log('')
    console.log('✅ Expected tables after installation:')
    console.log('   - snappy_profiles')
    console.log('   - snappy_snapshots')
    console.log('   - snappy_normalized_snapshots')
    console.log('   - snappy_projects')
    console.log('   - snappy_project_snapshots')
    console.log('')
    console.log('📝 Press Ctrl+C when done...')

    // Keep browser open
    await new Promise(() => {})

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await browser.close()
  }
}

autoInstall()
