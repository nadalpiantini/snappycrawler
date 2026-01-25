// ============================================
// SNAPPY v2.0 - Page Snapshot Exporter (DEBUG)
// ============================================

console.log('📸 Snappy: Service worker loaded')

// Attach UX listeners on first load
function attachUXListeners() {
  if (window.__SNAPPY_ATTACHED__) {
    console.log('📸 Snappy: UX listeners already attached')
    return
  }

  window.__SNAPPY_ATTACHED__ = true
  window.__SNAPPY_EVENTS__ = []

  // Track clicks
  document.addEventListener('click', (e) => {
    const el = e.target
    window.__SNAPPY_EVENTS__.push({
      type: 'click',
      tag: el.tagName,
      text: el.innerText?.slice(0, 120) || '',
      id: el.id || null,
      class: el.className || null,
      timestamp: new Date().toISOString()
    })
  }, true)

  // Track form submissions
  document.addEventListener('submit', (e) => {
    const form = e.target
    window.__SNAPPY_EVENTS__.push({
      type: 'submit',
      action: form.action || null,
      fields: Array.from(form.elements).map(f => ({
        name: f.name || null,
        type: f.type || null
      })),
      timestamp: new Date().toISOString()
    })
  }, true)

  console.log('📸 Snappy: UX tracking enabled')
}

// Test function - simple alert
function testPageAccess() {
  alert('✅ Snappy tiene acceso a esta página!')
  return {
    url: location.href,
    title: document.title,
    success: true
  }
}

// Main capture function
chrome.action.onClicked.addListener(async (tab) => {
  console.log('📸 Snappy: Icon clicked', tab.id)
  console.log('📸 Snappy: Tab URL', tab.url)

  if (!tab.id) {
    console.error('📸 Snappy: No tab ID')
    return
  }

  // Check if URL is accessible
  if (tab.url.startsWith('chrome://')) {
    console.error('❌ No se puede usar en chrome:// URLs')
    alert('❌ Snappy no funciona en páginas chrome://\n\nAbre una página web normal (google.com, localhost:3000, etc.)')
    return
  }

  try {
    // First, test with a simple function
    console.log('📸 Snappy: Testing page access...')
    const testResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: testPageAccess
    })

    console.log('📸 Snappy: Test results', testResults)

    if (!testResults || !testResults[0]) {
      throw new Error('Test failed - no results')
    }

    // Inject UX tracking
    console.log('📸 Snappy: Injecting UX listeners...')
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: attachUXListeners
    })

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 200))

    // Capture snapshot
    console.log('📸 Snappy: Capturing snapshot...')
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        console.log('📸 Snappy: Inside page context')

        try {
          // Extract visible text (leaf nodes only)
          const visibleText = Array.from(document.querySelectorAll("body *"))
            .filter(el => el.children.length === 0)
            .map(el => el.innerText?.trim() || '')
            .filter(Boolean)

          // Get UX events
          const uxEvents = window.__SNAPPY_EVENTS__ || []

          const snapshot = {
            url: location.href,
            title: document.title,
            html: document.body.innerHTML,
            text: [...new Set(visibleText)], // Deduplicate
            ux: uxEvents,
            meta: {
              viewport: {
                width: window.innerWidth,
                height: window.innerHeight
              },
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          }

          console.log('📸 Snappy: Snapshot captured', snapshot)
          return snapshot
        } catch (err) {
          console.error('📸 Snappy: Error in page context', err)
          return { error: err.message }
        }
      }
    })

    if (!results || !results[0] || !results[0].result) {
      throw new Error('No snapshot result received')
    }

    const result = results[0].result

    if (result.error) {
      throw new Error(result.error)
    }

    // Create JSON blob
    const jsonStr = JSON.stringify(result, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // Extract hostname for filename
    const hostname = new URL(result.url).hostname.replace(/^www\./, '')

    console.log('📸 Snappy: Downloading snapshot...')
    console.log('📸 Snappy: Snapshot size:', jsonStr.length, 'bytes')

    // Download snapshot
    await chrome.downloads.download({
      url,
      filename: `snappy-${hostname}-${Date.now()}.json`,
      saveAs: true
    })

    console.log('📸 Snappy: Snapshot captured successfully!')
    alert(`✅ Snapshot capturado!\n\nURL: ${result.url}\nTamaño: ${jsonStr.length} bytes`)
  } catch (error) {
    console.error('📸 Snappy: Capture failed', error)
    alert(`❌ Error: ${error.message}\n\nRevisa la consola (F12) para más detalles.`)
  }
})
