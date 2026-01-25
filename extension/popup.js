// Popup script - runs when user clicks extension icon
console.log('📸 Snappy: Popup loaded')

document.addEventListener('DOMContentLoaded', () => {
  const captureBtn = document.getElementById('captureBtn')
  const statusDiv = document.getElementById('status')
  const errorDiv = document.getElementById('error')

  // Check current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0]

    if (!currentTab) {
      statusDiv.textContent = '❌ No active tab'
      statusDiv.className = 'status error'
      return
    }

    // Check if URL is accessible
    if (currentTab.url && (currentTab.url.startsWith('chrome://') || currentTab.url.startsWith('chrome-extension://'))) {
      statusDiv.textContent = '❌ Cannot use on chrome:// pages'
      statusDiv.className = 'status error'
      captureBtn.disabled = true
      errorDiv.textContent = 'Navigate to a regular website (https://google.com)'
      errorDiv.style.display = 'block'
      return
    }

    statusDiv.textContent = `✅ Ready: ${currentTab.url?.substring(0, 40)}...`
    statusDiv.className = 'status success'
  })

  // Capture button click handler
  captureBtn.addEventListener('click', async () => {
    statusDiv.textContent = '⏳ Capturing...'
    statusDiv.className = 'status info'
    captureBtn.disabled = true
    errorDiv.style.display = 'none'

    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (!tab || !tab.id) {
        throw new Error('No active tab found')
      }

      // Inject content script to capture
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // UX tracking function
          const attachUXListeners = () => {
            if (window.__SNAPPY_ATTACHED__) return
            window.__SNAPPY_ATTACHED__ = true
            window.__SNAPPY_EVENTS__ = []

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
          }

          // Attach UX listeners
          attachUXListeners()

          // Small delay for listeners
          return new Promise(resolve => setTimeout(() => {
            // Capture snapshot
            const visibleText = Array.from(document.querySelectorAll("body *"))
              .filter(el => el.children.length === 0)
              .map(el => el.innerText?.trim() || '')
              .filter(Boolean)

            const uxEvents = window.__SNAPPY_EVENTS__ || []

            const snapshot = {
              url: location.href,
              title: document.title,
              html: document.body.innerHTML,
              text: [...new Set(visibleText)],
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

            resolve(snapshot)
          }, 100))
        }
      })

      if (!result || !result.result) {
        throw new Error('Failed to capture snapshot')
      }

      const snapshot = result.result

      // Create download
      const jsonStr = JSON.stringify(snapshot, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })

      // Convert to data URL
      const reader = new FileReader()
      reader.onload = async () => {
        const dataUrl = reader.result

        const hostname = new URL(snapshot.url).hostname.replace(/^www\./, '')
        const filename = `snappy-${hostname}-${Date.now()}.json`

        // Download
        await chrome.downloads.download({
          url: dataUrl,
          filename: filename,
          saveAs: false
        })

        statusDiv.textContent = '✅ Snapshot captured!'
        statusDiv.className = 'status success'
        captureBtn.textContent = 'Capture Another'
        captureBtn.disabled = false

        // Close popup after success
        setTimeout(() => window.close(), 1500)
      }

      reader.onerror = () => {
        throw new Error('Failed to create data URL')
      }

      reader.readAsDataURL(blob)

    } catch (error) {
      const errorMsg = error.message || 'Unknown error'
      console.error('📸 Snappy: Error', error)

      statusDiv.textContent = '❌ Capture failed'
      statusDiv.className = 'status error'
      errorDiv.textContent = errorMsg
      errorDiv.style.display = 'block'
      captureBtn.textContent = 'Try Again'
      captureBtn.disabled = false
    }
  })
})
