// ============================================
// SNAPPY BOOKMARKLET - Mobile Alternative
// ============================================

// Minified version for bookmarklet:
// javascript:(function(){var s=document.createElement('script');s.src='https://snappy.dev/bookmarklet/snapshot.js';document.body.appendChild(s);})();

// Full version below:

(function() {
  'use strict'

  console.log('📸 Snappy Bookmarklet: Initializing...')

  // Check if already loaded
  if (window.__SNAPPY_BOOKMARKLET__) {
    console.log('📸 Snappy: Already loaded')
    return
  }

  window.__SNAPPY_BOOKMARKLET__ = true
  window.__SNAPPY_EVENTS__ = []

  // Attach UX listeners
  document.addEventListener('click', function(e) {
    const el = e.target
    window.__SNAPPY_EVENTS__.push({
      type: 'click',
      tag: el.tagName,
      text: (el.innerText || '').slice(0, 120),
      id: el.id || null,
      class: el.className || null
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
      })
    })
  }, true)

  // Capture function
  function captureSnapshot() {
    console.log('📸 Snappy: Capturing snapshot...')

    var visibleText = Array.from(document.querySelectorAll("body *"))
      .filter(function(el) { return el.children.length === 0 })
      .map(function(el) { return (el.innerText || '').trim() })
      .filter(Boolean)

    var snapshot = {
      url: location.href,
      title: document.title,
      html: document.body.innerHTML,
      text: Array.from(new Set(visibleText)),
      ux: window.__SNAPPY_EVENTS__ || [],
      meta: {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    }

    var json = JSON.stringify(snapshot, null, 2)
    var blob = new Blob([json], { type: 'application/json' })
    var url = URL.createObjectURL(blob)

    var hostname = new URL(snapshot.url).hostname.replace(/^www\./, '')
    var filename = 'snappy-' + hostname + '-' + Date.now() + '.json'

    var a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()

    URL.revokeObjectURL(url)
    console.log('📸 Snappy: Snapshot downloaded!')
  }

  // Create UI
  var ui = document.createElement('div')
  ui.id = 'snappy-bookmarklet-ui'
  ui.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    background: white;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    font-family: system-ui, -apple-system, sans-serif;
  `

  ui.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px;">
      <div style="font-weight:bold;color:#1e293b;">📸 Snappy</div>
      <button id="snappy-capture" style="
        background:#3b82f6;
        color:white;
        border:none;
        padding:8px 16px;
        border-radius:4px;
        cursor:pointer;
        font-weight:500;
      ">Capture Snapshot</button>
      <button id="snappy-close" style="
        background:#e2e8f0;
        color:#475569;
        border:none;
        padding:6px 12px;
        border-radius:4px;
        cursor:pointer;
        font-size:12px;
      ">Close</button>
    </div>
  `

  document.body.appendChild(ui)

  document.getElementById('snappy-capture').addEventListener('click', captureSnapshot)
  document.getElementById('snappy-close').addEventListener('click', function() {
    ui.remove()
  })

  console.log('📸 Snappy: Ready! Click "Capture Snapshot" when ready.')
})()
