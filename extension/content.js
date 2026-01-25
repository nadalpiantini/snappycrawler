// ============================================
// SNAPPY v2.0 - Page Snapshot Exporter
// ============================================

console.log('📸 Snappy: Service worker loaded')

// Attach UX listeners on first load
function attachUXListeners() {
  if (window.__SNAPPY_ATTACHED__) {
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

// Main capture function
chrome.action.onClicked.addListener(async (tab) => {
  console.log('📸 Snappy: Icon clicked', tab.id)

  if (!tab.id) {
    console.error('📸 Snappy: No tab ID')
    return
  }

  // Check if URL is accessible
  if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://'))) {
    console.error('❌ Cannot access chrome:// URLs')
    // Show error badge
    chrome.action.setIcon({
      path: {
        '16': 'icons/icon16.png',
        '48': 'icons/icon48.png',
        '128': 'icons/icon128.png'
      },
      tabId: tab.id
    })
    chrome.action.setTitle({
      title: '❌ Cannot access chrome:// pages. Use on a normal website.',
      tabId: tab.id
    })
    return
  }

  try {
    // Inject UX tracking
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: attachUXListeners
    })

    // Wait a bit for listeners to attach
    await new Promise(resolve => setTimeout(resolve, 100))

    // Capture snapshot
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
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

          return snapshot
        } catch (err) {
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

    // Create JSON blob and convert to data URL (service worker compatible)
    const jsonStr = JSON.stringify(result, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })

    // Convert blob to data URL (base64) for service worker
    const reader = new FileReader()
    const dataUrl = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve('data:application/json,{}')
      reader.readAsDataURL(blob)
    })

    // Extract hostname for filename
    const hostname = new URL(result.url).hostname.replace(/^www\./, '')

    // Download snapshot
    await chrome.downloads.download({
      url: dataUrl,
      filename: `snappy-${hostname}-${Date.now()}.json`,
      saveAs: false // Auto-download without prompt
    })

    // Show success badge
    chrome.action.setTitle({
      title: '✅ Snapshot captured!',
      tabId: tab.id
    })

    console.log('📸 Snappy: Snapshot captured successfully!')

    // Reset badge after 3 seconds
    setTimeout(() => {
      chrome.action.setTitle({
        title: 'Snappy - Page Snapshot Exporter',
        tabId: tab.id
      })
    }, 3000)

  } catch (error) {
    console.error('📸 Snappy: Capture failed', error)

    // Show error badge
    chrome.action.setTitle({
      title: `❌ Error: ${error.message}`,
      tabId: tab.id
    })

    // Reset after 3 seconds
    setTimeout(() => {
      chrome.action.setTitle({
        title: 'Snappy - Page Snapshot Exporter',
        tabId: tab.id
      })
    }, 3000)
  }
})
