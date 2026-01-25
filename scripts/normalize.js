#!/usr/bin/env node

// ============================================
// SNAPPY - Normalize Script (CLI)
// ============================================

const fs = require('fs')
const path = require('path')

// Import normalizer functions
function normalizeSnapshot(rawSnapshot) {
  const sections = extractSections(rawSnapshot.text)
  const components = inferComponents(rawSnapshot.html)
  const uxFlows = extractUXFlows(rawSnapshot.ux)

  return {
    meta: {
      source: rawSnapshot.url,
      title: rawSnapshot.title,
      captured_at: rawSnapshot.timestamp
    },
    sections,
    components,
    ux_flows: uxFlows
  }
}

function extractSections(texts) {
  const validTexts = texts.filter(text => text.length >= 20 && text.length <= 120)
  const uniqueTexts = Array.from(new Set(validTexts))

  return uniqueTexts.map(text => ({
    label: text.slice(0, 60),
    type: 'content',
    source: 'visible-text'
  }))
}

function inferComponents(html) {
  const components = []

  if (html.includes('<form')) {
    components.push({
      type: 'form',
      behavior: 'user_input',
      inferred: true
    })
  }

  if (html.includes('<button') || html.includes('<input type="submit"')) {
    components.push({
      type: 'button',
      behavior: 'cta',
      inferred: true
    })
  }

  if (html.includes('<nav') || html.includes('navigation')) {
    components.push({
      type: 'nav',
      behavior: 'navigation',
      inferred: true
    })
  }

  return components
}

function extractUXFlows(events) {
  return events.map((event, index) => {
    const flow = {
      step: index + 1,
      action: event.type
    }

    if (event.type === 'click' && event.tag) {
      flow.target = event.tag
      flow.label = event.text || undefined
    }

    if (event.type === 'submit') {
      flow.fields = event.fields || []
    }

    return flow
  })
}

// CLI Interface
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('❌ Error: Missing input file')
    console.log('\nUsage: node scripts/normalize.js <input-file> [output-file]')
    console.log('\nExamples:')
    console.log('  node scripts/normalize.js snapshot.json')
    console.log('  node scripts/normalize.js snapshot.json normalized.json')
    process.exit(1)
  }

  const inputFile = args[0]
  const outputFile = args[1] || inputFile.replace('.json', '.normalized.json')

  console.log(`📸 Snappy Normalizer`)
  console.log(`   Input:  ${inputFile}`)
  console.log(`   Output: ${outputFile}\n`)

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.log(`❌ Error: Input file not found: ${inputFile}`)
    process.exit(1)
  }

  try {
    // Read raw snapshot
    console.log('1️⃣ Reading raw snapshot...')
    const rawContent = fs.readFileSync(inputFile, 'utf-8')
    const rawSnapshot = JSON.parse(rawContent)
    console.log('   ✅ Snapshot loaded')

    // Validate snapshot structure
    if (!rawSnapshot.url || !rawSnapshot.html || !Array.isArray(rawSnapshot.text)) {
      console.log('❌ Error: Invalid snapshot format')
      console.log('   Required: url, html, text (array)')
      process.exit(1)
    }

    // Normalize
    console.log('\n2️⃣ Normalizing snapshot...')
    const normalized = normalizeSnapshot(rawSnapshot)
    console.log(`   ✅ Extracted ${normalized.sections.length} sections`)
    console.log(`   ✅ Found ${normalized.components.length} components`)
    console.log(`   ✅ Captured ${normalized.ux_flows.length} UX flows`)

    // Write output
    console.log('\n3️⃣ Writing normalized snapshot...')
    fs.writeFileSync(outputFile, JSON.stringify(normalized, null, 2))
    console.log(`   ✅ Saved to: ${outputFile}`)

    console.log('\n✅ Normalization complete!')
    console.log('\n📊 Summary:')
    console.log(`   URL:     ${normalized.meta.source}`)
    console.log(`   Title:   ${normalized.meta.title}`)
    console.log(`   Sections: ${normalized.sections.length}`)
    console.log(`   Components: ${normalized.components.length}`)
    console.log(`   UX Flows: ${normalized.ux_flows.length}`)

  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`)
    if (error.message.includes('JSON')) {
      console.log('   Hint: Make sure the input file is valid JSON')
    }
    process.exit(1)
  }
}

// Run
main()
