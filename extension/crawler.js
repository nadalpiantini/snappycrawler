// ============================================
// SNAPPY v2.1 - Auto-Crawler (JavaScript)
// ============================================

console.log('🕷️ Snappy Crawler loaded')
console.log('DEBUG: Script executing...')

// State
let isCrawling = false
let shouldStop = false
let captured = 0
let errors = 0
let success = 0
let visitedUrls = new Set()
let urlQueue = []
let crawlDomain = ''

// DOM elements
console.log('DEBUG: Getting DOM elements...')
const startBtn = document.getElementById('startBtn')
const stopBtn = document.getElementById('stopBtn')
const progressDiv = document.getElementById('progress')
const statusEl = document.getElementById('status')
const capturedEl = document.getElementById('captured')
const totalEl = document.getElementById('total')
const successEl = document.getElementById('success')
const errorsEl = document.getElementById('errors')
const progressFill = document.getElementById('progressFill')
const logEl = document.getElementById('log')

console.log('DEBUG: startBtn =', startBtn)
console.log('DEBUG: stopBtn =', stopBtn)
console.log('DEBUG: All elements retrieved')

// Get current tab
async function getCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  return tabs[0]
}

// Log message
function log(message, type = 'info') {
  const entry = document.createElement('div')
  entry.className = 'log-entry ' + type
  entry.textContent = '[' + new Date().toLocaleTimeString() + '] ' + message
  logEl.appendChild(entry)
  logEl.scrollTop = logEl.scrollHeight
}

// Update UI
function updateStats() {
  capturedEl.textContent = captured.toString()
  totalEl.textContent = urlQueue.length.toString()
  successEl.textContent = success.toString()
  errorsEl.textContent = errors.toString()

  const total = parseInt(totalEl.textContent) || 1
  const progress = (captured / total) * 100
  progressFill.style.width = progress + '%'
}

// Capture single page
async function capturePage(url) {
  console.log('DEBUG: capturePage() called with URL =', url)
  try {
    // Navigate to URL
    console.log('DEBUG: Getting current tab...')
    const tab = await getCurrentTab()
    console.log('DEBUG: Tab =', tab)

    if (!tab || !tab.id) {
      console.error('DEBUG: No active tab!')
      throw new Error('No active tab')
    }

    await chrome.tabs.update(tab.id, { url: url })

    // Wait for page to load
    await new Promise(function(resolve) {
      setTimeout(resolve, 2000)
    })

    // Inject capture script
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: function() {
        // Attach UX listeners
        if (!window.__SNAPPY_ATTACHED__) {
          window.__SNAPPY_ATTACHED__ = true
          window.__SNAPPY_EVENTS__ = []

          document.addEventListener('click', function(e) {
            const el = e.target
            window.__SNAPPY_EVENTS__.push({
              type: 'click',
              tag: el.tagName,
              text: (el.innerText || '').slice(0, 120) || '',
              id: el.id || null,
              class: el.className || null,
              timestamp: new Date().toISOString()
            })
          }, true)

          document.addEventListener('submit', function(e) {
            const form = e.target
            window.__SNAPPY_EVENTS__.push({
              type: 'submit',
              action: form.action || null,
              fields: Array.from(form.elements).map(function(f) {
                return {
                  name: f.name || null,
                  type: f.type || null
                }
              }),
              timestamp: new Date().toISOString()
            })
          }, true)
        }

        // Extract content
        const visibleText = Array.from(document.querySelectorAll("body *"))
          .filter(function(el) { return el.children.length === 0 })
          .map(function(el) { return (el.innerText || '').trim() || '' })
          .filter(Boolean)

        const uxEvents = window.__SNAPPY_EVENTS__ || []

        return {
          url: location.href,
          title: document.title,
          html: document.body.innerHTML,
          text: [...new Set(visibleText)],
          ux: uxEvents,
          meta: {
            viewport: { width: window.innerWidth, height: window.innerHeight },
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        }
      }
    })

    if (!results || !results[0] || !results[0].result) {
      throw new Error('Failed to capture page')
    }

    const snapshot = results[0].result

    // Save to DB if enabled
    const saveToDb = document.getElementById('saveToDb').checked
    console.log('DEBUG: saveToDb =', saveToDb)

    if (saveToDb) {
      console.log('DEBUG: Sending to API...')
      const serverBase = document.getElementById('apiServer').value
      const apiURL = serverBase + '/api/crawl'
      console.log('DEBUG: API URL =', apiURL)
      console.log('DEBUG: Snapshot data =', snapshot)

      const response = await fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot)
      })

      console.log('DEBUG: API response status =', response.status)

      if (!response.ok) {
        console.error('DEBUG: API error!')
        throw new Error('API error: ' + response.status)
      }

      console.log('DEBUG: Saved successfully!')
      log('✅ Saved to DB: ' + url, 'success')
    } else {
      console.log('DEBUG: Skipping DB save')
      log('📸 Captured: ' + url, 'success')
    }

    // Download JSON if enabled
    const downloadFiles = document.getElementById('downloadFiles').checked
    if (downloadFiles) {
      const jsonStr = JSON.stringify(snapshot, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })

      const reader = new FileReader()
      const dataUrl = await new Promise(function(resolve) {
        reader.onload = function() { resolve(reader.result) }
        reader.readAsDataURL(blob)
      })

      const hostname = new URL(url).hostname.replace(/^www\./, '')
      await chrome.downloads.download({
        url: dataUrl,
        filename: 'snappy-' + hostname + '-' + Date.now() + '.json',
        saveAs: false
      })

      log('📥 Downloaded: ' + url, 'success')
    }

    return { success: true }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    log('❌ Failed: ' + url + ' - ' + errorMsg, 'error')
    return { success: false, error: errorMsg }
  }
}

// Main crawl function
async function startCrawl() {
  console.log('DEBUG: startCrawl() called!')
  console.log('DEBUG: Getting input elements...')

  const domainInput = document.getElementById('domain')
  const maxPagesInput = document.getElementById('maxPagesValue')
  const sameDomainInput = document.getElementById('sameDomain')

  console.log('DEBUG: domainInput =', domainInput)
  console.log('DEBUG: maxPagesInput =', maxPagesInput)
  console.log('DEBUG: sameDomainInput =', sameDomainInput)

  crawlDomain = domainInput.value.trim()
  console.log('DEBUG: crawlDomain = "' + crawlDomain + '"')

  if (!crawlDomain) {
    console.log('DEBUG: No domain entered, showing alert')
    alert('Please enter a domain to crawl')
    return
  }

  // Normalize domain
  if (!crawlDomain.startsWith('http://') && !crawlDomain.startsWith('https://')) {
    crawlDomain = 'https://' + crawlDomain
  }

  const maxPages = parseInt(maxPagesInput.value) || 50
  const sameDomain = sameDomainInput.checked

  // Update UI
  console.log('DEBUG: Updating UI...')
  isCrawling = true
  shouldStop = false
  progressDiv.classList.add('active')
  logEl.classList.add('active')
  startBtn.style.display = 'none'
  stopBtn.style.display = 'block'
  stopBtn.textContent = '⏹️ Stop'

  console.log('DEBUG: UI updated, logging start message')
  log('🚀 Starting crawl: ' + crawlDomain)
  log('📊 Max pages: ' + maxPages)
  console.log('DEBUG: About to start crawling loop')

  try {
    // Start with the given URL
    urlQueue = [crawlDomain]
    visitedUrls.clear()

    while (urlQueue.length > 0 && !shouldStop && captured < maxPages) {
      const url = urlQueue.shift()

      if (visitedUrls.has(url)) {
        continue
      }

      visitedUrls.add(url)

      // Update status
      statusEl.textContent = 'Crawling: ' + url.substring(0, 35) + '...'
      updateStats()

      // Capture page
      const result = await capturePage(url)

      if (result.success) {
        captured++
        success++

        // Extract links and add to queue
        if (captured < maxPages) {
          const tab = await getCurrentTab()
          if (tab && tab.id) {
            const linksResults = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: function(targetUrl) {
                // Get all links from current page
                const links = document.querySelectorAll('a[href]')
                const extracted = []

                // Protocols that should NEVER be followed
                const skipProtocols = [
                  'mailto:', 'tel:', 'sms:', 'whatsapp:', 'javascript:',
                  'data:', 'blob:', 'file:', 'ftp:', 'chrome:', 'about:'
                ]

                links.forEach(function(link) {
                  try {
                    const href = link.getAttribute('href')
                    if (!href) return

                    // Skip problematic protocols early
                    const hrefLower = href.toLowerCase().trim()
                    const isSkip = skipProtocols.some(function(p) {
                      return hrefLower.startsWith(p)
                    })
                    if (isSkip) return

                    // Skip empty or anchor-only links
                    if (href === '#' || href === '') return

                    const absoluteUrl = new URL(href, targetUrl)

                    // Only allow http/https protocols
                    if (absoluteUrl.protocol === 'http:' || absoluteUrl.protocol === 'https:') {
                      extracted.push(absoluteUrl.href)
                    }
                  } catch {
                    // Invalid URL, skip
                  }
                })

                return extracted
              },
              args: [url]
            })

            if (linksResults && linksResults[0] && linksResults[0].result) {
              const links = linksResults[0].result

              for (const link of links) {
                // Skip if already visited
                if (visitedUrls.has(link)) {
                  continue
                }

                // 🚫 SMART FILTER: Skip problematic URL protocols
                // These would open external apps or cause issues
                const dangerousProtocols = [
                  'mailto:',      // Opens email client
                  'tel:',         // Opens phone dialer
                  'sms:',         // Opens SMS app
                  'whatsapp:',    // Opens WhatsApp
                  'javascript:',  // Executes code
                  'data:',        // Data URLs
                  'blob:',        // Blob URLs
                  'file:',        // Local files
                  'ftp:',         // FTP protocol
                  'chrome:',      // Chrome internal pages
                  'chrome-extension:', // Extensions
                  'about:',       // Browser pages
                  'view-source:', // Source view
                ]

                const linkLower = link.toLowerCase()
                const isProblematic = dangerousProtocols.some(function(protocol) {
                  return linkLower.startsWith(protocol)
                })

                if (isProblematic) {
                  continue
                }

                // Skip anchor-only links (same page)
                if (link.includes('#') && link.split('#')[0] === url.split('#')[0]) {
                  continue
                }

                // Filter by domain if same-domain only
                if (sameDomain) {
                  try {
                    const linkDomain = new URL(link).hostname
                    const baseDomain = new URL(crawlDomain).hostname

                    if (!linkDomain.endsWith(baseDomain) && !baseDomain.endsWith(linkDomain)) {
                      continue
                    }
                  } catch {
                    continue
                  }
                }

                // Skip common file types and non-HTML resources
                if (link.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|pdf|zip|rar|tar|gz|css|js|woff|woff2|ttf|eot|mp3|mp4|avi|mov|wmv|doc|docx|xls|xlsx|ppt|pptx)$/i)) {
                  continue
                }

                // Add to queue if not already there
                if (!urlQueue.includes(link)) {
                  urlQueue.push(link)
                }
              }
            }

            totalEl.textContent = urlQueue.length.toString()
            updateStats()
          }
        }
      } else {
        errors++
        updateStats()
      }

      // Small delay between requests (be nice to servers)
      await new Promise(function(resolve) {
        setTimeout(resolve, 1000)
      })
    }

    // Crawl complete
    if (shouldStop) {
      statusEl.textContent = 'Stopped by user'
      log('⏹️ Crawl stopped by user', 'error')
    } else {
      statusEl.textContent = 'Complete!'
      log('✅ Crawl complete! Captured ' + captured + ' pages', 'success')
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    statusEl.textContent = 'Error'
    log('💥 Fatal error: ' + errorMsg, 'error')
  }

  // Reset UI
  isCrawling = false
  startBtn.style.display = 'block'
  startBtn.textContent = '▶️ Start Crawling'
  stopBtn.style.display = 'none'
}

// Stop crawl
function stopCrawl() {
  shouldStop = true
  statusEl.textContent = 'Stopping...'
  log('⏹️ Stopping crawl...', 'info')
}

// Event listeners
console.log('DEBUG: Attaching event listeners...')
if (startBtn) {
  startBtn.addEventListener('click', function() {
    console.log('DEBUG: startBtn clicked!')
    startCrawl()
  })
  console.log('DEBUG: startBtn listener attached')
} else {
  console.error('DEBUG: startBtn is NULL!')
}

if (stopBtn) {
  stopBtn.addEventListener('click', function() {
    console.log('DEBUG: stopBtn clicked!')
    stopCrawl()
  })
  console.log('DEBUG: stopBtn listener attached')
} else {
  console.error('DEBUG: stopBtn is NULL!')
}

console.log('DEBUG: All event listeners attached successfully')

// Check current tab on load
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  const tab = tabs[0]
  if (tab && tab.url) {
    // Pre-fill domain if on a webpage
    try {
      const url = new URL(tab.url)
      if (url.hostname && !url.hostname.includes('chrome')) {
        document.getElementById('domain').value = url.hostname
      }
    } catch {
      // Invalid URL
    }
  }
})
