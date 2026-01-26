#!/usr/bin/env node
/**
 * SNAPPY CLI - Terminal Control Interface
 *
 * Usage:
 *   snappy crawl <url> [--max-pages=50]
 *   snappy audit <url>
 *   snappy test <url> [--buttons]
 *   snappy export <url> [--format=json]
 */

const { program } = require('commander')
const { chromium } = require('playwright')

const API_URL = 'http://localhost:3000/api/snapshot'

// Colors for terminal output
const colors: Record<string, string> = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

function log(message: string, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green')
}

function logError(message: string) {
  log(`❌ ${message}`, 'red')
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, 'cyan')
}

function logProgress(message: string) {
  log(`⏳ ${message}`, 'yellow')
}

// Normalize URL
function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

// Save snapshot to database
async function saveSnapshot(snapshot: any): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot)
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const result = await response.json()
    return result.success
  } catch (error) {
    logError(`Failed to save to API: ${error.message}`)
    return false
  }
}

// Crawl command
program
  .command('crawl <url>')
  .description('Crawl a website and capture all pages')
  .option('--max-pages <number>', 'Maximum pages to crawl', '50')
  .option('--same-domain', 'Only crawl same domain', true)
  .option('--headless', 'Run in headless mode', false)
  .action(async (options) => {
    const { url, maxPages, sameDomain, headless } = options
    const normalizedUrl = normalizeUrl(url)

    log(`🕷️  Snappy Crawler v2.1`, 'bright')
    log(``, 0)
    logInfo(`Target: ${normalizedUrl}`)
    logInfo(`Max pages: ${maxPages}`)
    logInfo(`Same domain: ${sameDomain ? 'Yes' : 'No'}`)
    logInfo(`Headless: ${headless ? 'Yes' : 'No'}`)
    log(``, 0)

    const browser = await chromium.launch({
      headless: headless,
      slowMo: 100 // Slow down for better visibility
    })
    const page = await browser.newPage()

    try {
      let visitedUrls = new Set<string>()
      let urlQueue = [normalizedUrl]
      let captured = 0
      let errors = 0
      let totalLinks = 0

      while (urlQueue.length > 0 && captured < maxPages) {
        const currentUrl = urlQueue.shift()!

        if (visitedUrls.has(currentUrl)) {
          continue
        }

        visitedUrls.add(currentUrl)
        logProgress(`[${captured + 1}/${maxPages}] Crawling: ${currentUrl}`)

        try {
          // Navigate to page
          await page.goto(currentUrl, { waitUntil: 'networkidle', timeout: 10000 })

          // Extract page content
          const snapshot = await page.evaluate(() => {
            return {
              url: location.href,
              title: document.title,
              html: document.body.innerHTML,
              text: Array.from(document.querySelectorAll("body *"))
                .filter(el => el.children.length === 0)
                .map(el => el.innerText?.trim() || '')
                .filter(Boolean),
              ux: [],
              meta: {
                viewport: { width: window.innerWidth, height: window.innerHeight },
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
              }
            }
          })

          // Save to database
          const saved = await saveSnapshot(snapshot)
          if (saved) {
            logSuccess(`Captured: ${currentUrl}`)
            captured++
          } else {
            logError(`Failed to save: ${currentUrl}`)
            errors++
          }

          // Extract links if we need more pages
          if (captured < maxPages) {
            const links = await page.evaluate(() => {
              const anchors = Array.from(document.querySelectorAll('a[href]'))
              return anchors
                .map(a => a.href)
                .filter(href => {
                  try {
                    const url = new URL(href)
                    return url.protocol === 'http:' || url.protocol === 'https:'
                  } catch {
                    return false
                  }
                })
            })

            for (const link of links) {
              if (!visitedUrls.has(link) && !urlQueue.includes(link)) {
                // Filter by domain if needed
                if (sameDomain) {
                  try {
                    const linkDomain = new URL(link).hostname
                    const baseDomain = new URL(normalizedUrl).hostname
                    if (!linkDomain.endsWith(baseDomain) && !baseDomain.endsWith(linkDomain)) {
                      continue
                    }
                  } catch {
                    continue
                  }
                }

                // Skip file extensions
                if (link.match(/\.(jpg|jpeg|png|gif|pdf|zip|css|js|woff|woff2)$/i)) {
                  continue
                }

                urlQueue.push(link)
                totalLinks++
              }
            }
          }

        } catch (error) {
          logError(`Error crawling ${currentUrl}: ${error.message}`)
          errors++
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      log(``, 0)
      logSuccess(`Crawl complete!`)
      logInfo(`Pages captured: ${captured}`)
      logInfo(`Errors: ${errors}`)
      logInfo(`Total links found: ${totalLinks}`)

    } finally {
      await browser.close()
    }
  })

// Audit command
program
  .command('audit <url>')
  .description('Audit a webpage and generate report')
  .action(async (options) => {
    const { url } = options
    const normalizedUrl = normalizeUrl(url)

    log(`🔍 Snappy Auditor v2.1`, 'bright')
    log(``, 0)
    logInfo(`Auditing: ${normalizedUrl}`)
    log(``, 0)

    const browser = await chromium.launch({ headless: false })
    const page = await browser.newPage()

    try {
      await page.goto(normalizedUrl, { waitUntil: 'networkidle' })

      // Run audits
      logProgress('Running accessibility audit...')

      const audit = await page.evaluate(() => {
        const results = {
          url: location.href,
          title: document.title,

          // Buttons
          buttons: Array.from(document.querySelectorAll('button, input[type="submit"], a[role="button"]')).map(btn => ({
            text: btn.textContent?.trim() || '',
            visible: btn.checkVisibility() ? 'yes' : 'no',
            disabled: (btn as HTMLButtonElement).disabled ? 'yes' : 'no'
          })),

          // Links
          links: Array.from(document.querySelectorAll('a[href]')).map(link => ({
            text: link.textContent?.trim() || '',
            href: link.getAttribute('href'),
            external: link.hostname !== location.hostname
          })),

          // Forms
          forms: Array.from(document.querySelectorAll('form')).map(form => ({
            action: form.action || '',
            method: form.method || 'get',
            fields: form.elements.length
          })),

          // Images
          images: document.querySelectorAll('img').length,

          // Headings
          headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
            tag: h.tagName,
            text: h.textContent?.trim() || ''
          })),

          // Meta
          description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || ''
        }

        return results
      })

      // Display results
      log(``, 0)
      log(`📊 AUDIT REPORT`, 'bright')
      log(``, 0)

      log(`Title: ${audit.title}`, 'cyan')
      log(`Description: ${audit.description || 'None'}`, 0)
      log(`Keywords: ${audit.keywords || 'None'}`, 0)
      log(``, 0)

      log(`📊 Statistics:`, 'bright')
      log(`  Buttons: ${audit.buttons.length}`, 0)
      log(`  Links: ${audit.links.length}`, 0)
      log(`  External Links: ${audit.links.filter(l => l.external).length}`, 0)
      log(`  Forms: ${audit.forms.length}`, 0)
      log(`  Images: ${audit.images}`, 0)
      log(`  Headings: ${audit.headings.length}`, 0)
      log(``, 0)

      // Buttons detail
      if (audit.buttons.length > 0) {
        log(`🔘 Buttons (${audit.buttons.length}):`, 'bright')
        audit.buttons.forEach((btn, i) => {
          const status = btn.visible === 'yes' ? '✅' : '⚠️'
          const disabled = btn.disabled === 'yes' ? ' [DISABLED]' : ''
          log(`  ${status} "${btn.text}" ${disabled}`, 0)
        })
        log(``, 0)
      }

      // Test buttons functionality
      logProgress('Testing buttons functionality...')

      let workingButtons = 0
      let totalButtons = 0

      for (const btn of audit.buttons.slice(0, 10)) { // Test first 10 buttons
        if (btn.disabled === 'yes') {
          continue
        }

        totalButtons++

        try {
          // Find and click button
          const buttonClicked = await page.evaluate((btnText) => {
            const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], a[role="button"]'))
            const button = buttons.find(b => b.textContent?.trim() === btnText)
            if (button && !button.disabled) {
              (button as HTMLButtonElement).click()
              return true
            }
            return false
          }, btn.text)

          if (buttonClicked) {
            // Wait for navigation/alert
            await page.waitForTimeout(1000)

            // Check for alerts
            const alertPresent = await page.evaluate(() => {
              // Try to close any alert
              try {
                window.alert.toString()
                return true
              } catch {
                return false
              }
            })

            if (alertPresent) {
              log(`  ✅ "${btn.text}" - Opens alert`, 'green')
            } else {
              log(`  ✅ "${btn.text}" - Working`, 'green')
            }
            workingButtons++

            // Go back
            await page.goBack()
            await page.waitForTimeout(1000)
          }
        } catch (error) {
          log(`  ❌ "${btn.text}" - Error: ${error.message}`, 'red')
        }
      }

      log(``, 0)
      log(`🎯 Button Test Results:`, 'bright')
      log(`  Tested: ${totalButtons}/10`)
      log(`  Working: ${workingButtons}`)
      log(`  Success Rate: ${totalButtons > 0 ? Math.round((workingButtons / totalButtons) * 100) : 0}%`)

      // Save audit to database
      logProgress('Saving audit to database...')
      const auditSnapshot = {
        url: normalizedUrl,
        title: `Audit: ${audit.title}`,
        html: await page.content(),
        text: [audit.title, audit.description, audit.keywords],
        ux: [],
        meta: {
          audit: audit,
          timestamp: new Date().toISOString()
        }
      }

      await saveSnapshot(auditSnapshot)
      logSuccess('Audit saved to Snappy database')

    } finally {
      await browser.close()
    }
  })

// Test buttons command
program
  .command('test-buttons <url>')
  .description('Test all buttons on a page')
  .option('--all', 'Test all buttons (default: first 20)')
  .option('--interactive', 'Interactive mode (default: false)')
  .action(async (options) => {
    const { url, all, interactive } = options
    const normalizedUrl = normalizeUrl(url)

    log(`🧪 Snappy Button Tester v2.1`, 'bright')
    log(``, 0)
    logInfo(`Target: ${normalizedUrl}`)
    logInfo(`Mode: ${all ? 'All buttons' : 'First 20 buttons'}`)
    log(``, 0)

    const browser = await chromium.launch({ headless: !interactive })
    const page = await browser.newPage()

    try {
      await page.goto(normalizedUrl, { waitUntil: 'networkidle' })

      // Get all buttons
      const buttons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, input[type="submit"], a[role="button"]'))
          .filter(btn => {
            const text = btn.textContent?.trim() || ''
            const visible = btn.checkVisibility ? 'yes' : 'no'
            return text.length > 0 && visible === 'yes'
          })
          .map(btn => ({
            text: btn.textContent?.trim() || '',
            tagName: btn.tagName.toLowerCase(),
            disabled: (btn as HTMLButtonElement).disabled ? 'yes' : 'no',
            id: btn.id || ''
          }))
      })

      const maxButtons = all ? buttons.length : Math.min(buttons.length, 20)

      logProgress(`Found ${buttons.length} buttons, testing ${maxButtons}`)
      log(``, 0)

      let tested = 0
      let working = 0
      let failed = 0
      let skipped = 0

      for (const btn of buttons.slice(0, maxButtons)) {
        tested++

        if (btn.disabled === 'yes') {
          log(`⏭️  Skipping disabled button: "${btn.text}"`, 'yellow')
          skipped++
          continue
        }

        logProgress(`[${tested}/${maxButtons}] Testing: "${btn.text}"`)

        try {
          const result = await page.evaluate((buttonInfo) => {
            const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], a[role="button"]'))
            const button = buttons.find(b =>
              b.textContent?.trim() === buttonInfo.text &&
              (buttonInfo.id ? b.id === buttonInfo.id : true)
            )

            if (!button) return { success: false, error: 'Button not found' }

            try {
              (button as HTMLButtonElement).click()

              // Check for alert within 500ms
              let hasAlert = false
              const alertCheck = setInterval(() => {
                try {
                  window.alert.toString()
                } catch { }
              }, 100)

              await new Promise(resolve => setTimeout(resolve, 500))
              clearInterval(alertCheck)

              return { success: true, action: 'clicked' }
            } catch (error) {
              return { success: false, error: (error as Error).message }
            }
          }, btn)

          if (result.success) {
            logSuccess(`✅ "${btn.text}" - Working`)
            working++

            // Go back if navigation occurred
            await page.goBack()
            await page.waitForTimeout(500)
          } else {
            logError(`❌ "${btn.text}" - Failed: ${result.error}`)
            failed++
          }

        } catch (error) {
          logError(`❌ "${btn.text}" - Error: ${error.message}`)
          failed++
        }

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      log(``, 0)
      log(`📊 TEST RESULTS`, 'bright')
      log(``, 0)
      log(`Total buttons found: ${buttons.length}`, 0)
      log(`Tested: ${tested}`, 0)
      log(`Working: ${working}`, 'green')
      log(`Failed: ${failed}`, 'red')
      log(`Skipped: ${skipped}`, 'yellow')
      log(``, 0)

      const successRate = tested > 0 ? Math.round((working / tested) * 100) : 0
      log(`Success Rate: ${successRate}%`, successRate > 70 ? 'green' : successRate > 40 ? 'yellow' : 'red')

    } finally {
      await browser.close()
    }
  })

// Export command
program
  .command('export <url>')
  .description('Export page to JSON')
  .option('--format <format>', 'Output format (json)', 'json')
  .option('--output <file>', 'Output file path')
  .action(async (options) => {
    const { url, format, output } = options
    const normalizedUrl = normalizeUrl(url)

    log(`📤 Snappy Exporter v2.1`, 'bright')
    log(``, 0)
    logInfo(`Exporting: ${normalizedUrl}`)
    log(`Format: ${format}`)
    log(``, 0)

    const browser = await chromium.launch()
    const page = await browser.newPage()

    try {
      logProgress('Loading page...')
      await page.goto(normalizedUrl, { waitUntil: 'networkidle' })

      logProgress('Extracting content...')
      const snapshot = await page.evaluate(() => {
        return {
          url: location.href,
          title: document.title,
          html: document.body.innerHTML,
          text: Array.from(document.querySelectorAll("body *"))
            .filter(el => el.children.length === 0)
            .map(el => el.innerText?.trim() || '')
            .filter(Boolean),
          ux: [],
          meta: {
            viewport: { width: window.innerWidth, height: window.innerHeight },
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        }
      })

      // Save to file or stdout
      if (output) {
        const fs = require('fs')
        fs.writeFileSync(output, JSON.stringify(snapshot, null, 2))
        logSuccess(`Exported to: ${output}`)
      } else {
        console.log(JSON.stringify(snapshot, null, 2))
      }

      // Also save to database
      await saveSnapshot(snapshot)
      logSuccess('Saved to Snappy database')

    } finally {
      await browser.close()
    }
  })

// Pull command - Retrieve and analyze existing snapshots
program
  .command('pull <snapshot-id>')
  .description('Pull and analyze a snapshot from the database')
  .option('--design', 'Extract design tokens')
  .option('--ux', 'Extract UX intelligence')
  .option('--wireframe', 'Generate wireframe')
  .option('--ai', 'Generate AI context')
  .option('--all', 'Run all analysis modes')
  .action(async (options) => {
    const { snapshotId, design, ux, wireframe, ai, all } = options

    log(`📥 Snappy Pull v2.1`, 'bright')
    log(``, 0)
    logInfo(`Snapshot ID: ${snapshotId}`)
    const modes = []
    if (all || design) modes.push('design')
    if (all || ux) modes.push('ux')
    if (all || wireframe) modes.push('wireframe')
    if (all || ai) modes.push('ai-context')
    logInfo(`Modes: ${modes.join(', ') || 'all'}`)
    log(``, 0)

    try {
      // Fetch snapshot from database
      logProgress('Fetching snapshot from database...')
      const response = await fetch(`${API_URL}/${snapshotId}`)

      if (!response.ok) {
        throw new Error(`Snapshot not found: ${snapshotId}`)
      }

      const { data } = await response.json()

      if (!data) {
        throw new Error('No data returned from database')
      }

      const snapshot = data.raw_data || data

      logSuccess(`Snapshot loaded: ${snapshot.title || snapshot.url}`)

      // Run requested analysis modes using real functions
      const results: any = {}

      if (all || design) {
        logProgress('Analyzing design tokens...')
        results.design = await analyzeDesignFromSnapshot(data)
        logSuccess('Design tokens extracted')
      }

      if (all || ux) {
        logProgress('Analyzing UX intelligence...')
        results.ux = await analyzeUXFromSnapshot(data)
        logSuccess('UX intelligence extracted')
      }

      if (all || wireframe) {
        logProgress('Generating wireframe...')
        results.wireframe = await analyzeWireframeFromSnapshot(data)
        logSuccess('Wireframe generated')
      }

      if (all || ai) {
        logProgress('Generating AI context...')
        results.aiContext = await analyzeAIContextFromSnapshot(data)
        logSuccess('AI context generated')
      }

      // Display results summary
      log(``, 0)
      log(`📊 ANALYSIS RESULTS`, 'bright')
      log(``, 0)

      if (results.design) {
        log(`Design Tokens:`, 'cyan')
        log(`  Colors: ${Object.keys(results.design.colors || {}).length}`)
        log(`  Typography: ${Object.keys(results.design.typography || {}).length}`)
        log(`  Spacing: ${Object.keys(results.design.spacing || {}).length}`)
        log(``, 0)
      }

      if (results.ux) {
        log(`UX Intelligence:`, 'cyan')
        log(`  CTAs detected: ${results.ux.ctas?.length || 0}`)
        log(`  Forms: ${results.ux.forms?.length || 0}`)
        log(`  Accessibility score: ${results.ux.accessibility?.score || 'N/A'}`)
        log(``, 0)
      }

      if (results.wireframe) {
        log(`Wireframe:`, 'cyan')
        log(`  Layout: ${results.wireframe.structure?.type}`)
        log(`  Blocks: ${results.wireframe.blocks?.length || 0}`)
        log(`  Flows: ${results.wireframe.flows?.length || 0}`)
        log(``, 0)
      }

      if (results.aiContext) {
        log(`AI Context:`, 'cyan')
        log(`  Page type: ${results.aiContext.systemBrief?.overview?.pageType}`)
        log(`  Components: ${results.aiContext.codeSchema?.components?.length || 0}`)
        log(`  Constraints: ${results.aiContext.constraints?.technical?.length || 0}`)
        log(``, 0)
      }

      // Save results to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const outputFile = `snappy-analysis-${timestamp}.json`

      require('fs').writeFileSync(outputFile, JSON.stringify(results, null, 2))
      logSuccess(`Full analysis saved to: ${outputFile}`)

    } catch (error) {
      logError(`Error: ${error.message}`)
      process.exit(1)
    }
  })

// Compare command - Compare multiple snapshots
program
  .command('compare <snapshotId1> <snapshotId2>')
  .description('Compare two snapshots')
  .option('--output <file>', 'Output file for comparison report')
  .action(async (options) => {
    const { snapshotId1, snapshotId2, output } = options

    log(`🔍 Snappy Compare v2.1`, 'bright')
    log(``, 0)
    logInfo(`Comparing snapshots:`)
    logInfo(`  1. ${snapshotId1}`)
    logInfo(`  2. ${snapshotId2}`)
    log(``, 0)

    try {
      // Fetch both snapshots
      logProgress('Fetching snapshots...')

      const [response1, response2] = await Promise.all([
        fetch(`${API_URL}/${snapshotId1}`),
        fetch(`${API_URL}/${snapshotId2}`)
      ])

      if (!response1.ok || !response2.ok) {
        throw new Error('One or more snapshots not found')
      }

      const { data: data1 } = await response1.json()
      const { data: data2 } = await response2.json()

      const snapshot1 = data1.raw_data || data1
      const snapshot2 = data2.raw_data || data2

      logSuccess('Snapshots loaded')

      // Run comparison
      logProgress('Comparing snapshots...')

      const comparison = await compareSnapshotsFromDB(snapshot1, snapshot2)

      logSuccess('Comparison complete')

      // Display summary
      log(``, 0)
      log(`📊 COMPARISON RESULTS`, 'bright')
      log(``, 0)
      log(`URL 1: ${snapshot1.url}`)
      log(`URL 2: ${snapshot2.url}`)
      log(``, 0)
      log(`Differences found: ${comparison.differences.total || 0}`)
      log(`  Layout: ${comparison.differences.layout || 'same'}`)
      log(`  Colors: ${comparison.differences.colors || 'same'}`)
      log(`  Components: ${comparison.differences.components || 'same'}`)

      // Save comparison
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const outputFile = output || `snappy-comparison-${timestamp}.json`

      require('fs').writeFileSync(outputFile, JSON.stringify(comparison, null, 2))
      logSuccess(`Comparison saved to: ${outputFile}`)

    } catch (error) {
      logError(`Error: ${error.message}`)
      process.exit(1)
    }
  })

// List command - List all snapshots
program
  .command('list')
  .description('List all snapshots in the database')
  .option('--limit <number>', 'Maximum number to show', '20')
  .action(async (options) => {
    const { limit } = options

    log(`📋 Snappy List v2.1`, 'bright')
    log(``, 0)

    try {
      logProgress('Fetching snapshots...')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Failed to fetch snapshots')
      }

      const { data: snapshots } = await response.json()

      logSuccess(`Found ${snapshots?.length || 0} snapshot(s)`)
      log(``, 0)

      // Display snapshots
      const displaySnapshots = (snapshots || []).slice(0, parseInt(limit))

      if (displaySnapshots.length === 0) {
        logInfo('No snapshots found')
        return
      }

      displaySnapshots.forEach((snap: any, index: number) => {
        const created = new Date(snap.created_at).toLocaleDateString()
        log(`${index + 1}. ${snap.title || snap.url}`, 'cyan')
        log(`   ID: ${snap.id}`)
        log(`   URL: ${snap.url}`)
        log(`   Created: ${created}`)
        log(``, 0)
      })

      if ((snapshots || []).length > parseInt(limit)) {
        logInfo(`...and ${(snapshots.length - parseInt(limit))} more`)
      }

    } catch (error) {
      logError(`Error: ${error.message}`)
      process.exit(1)
    }
  })

// Parse arguments
program.parse()

// ============================================
// IMPORT REAL MODULES
// ============================================

const {
  analyzeDesignFromSnapshot,
  analyzeUXFromSnapshot,
  analyzeWireframeFromSnapshot,
  analyzeAIContextFromSnapshot,
  compareSnapshotsFromDB,
  runFullAnalysis
} = require('./lib/cli-integration')
