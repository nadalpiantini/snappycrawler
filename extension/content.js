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
    // Capture screenshot FIRST (before any DOM manipulation)
    let screenshot = null
    try {
      screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, {
        format: 'jpeg',
        quality: 60  // Compress for storage
      })
      console.log('📸 Snappy: Screenshot captured')
    } catch (screenshotErr) {
      console.warn('📸 Snappy: Screenshot failed (optional)', screenshotErr.message)
    }

    // Inject UX tracking
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: attachUXListeners
    })

    // Wait a bit for listeners to attach
    await new Promise(resolve => setTimeout(resolve, 100))

    // Capture snapshot with design styles
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

          // ============================================
          // Design Forensics: Capture computed styles
          // ============================================
          const captureDesignStyles = () => {
            const styles = {
              typography: [],
              colors: [],
              spacing: [],
              effects: []
            }

            // Typography: headings, paragraphs, buttons, links
            let typographyCount = 0
            document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,button,a,[role="button"],span,label').forEach((el) => {
              if (typographyCount >= 30) return
              const cs = getComputedStyle(el)
              const text = el.innerText?.trim()
              if (!text || text.length < 2) return

              styles.typography.push({
                tag: el.tagName.toLowerCase(),
                fontFamily: cs.fontFamily,
                fontSize: cs.fontSize,
                fontWeight: cs.fontWeight,
                lineHeight: cs.lineHeight,
                letterSpacing: cs.letterSpacing,
                color: cs.color,
                sampleText: text.slice(0, 50)
              })
              typographyCount++
            })

            // Colors: backgrounds from major containers
            let colorCount = 0
            document.querySelectorAll('body,main,header,footer,section,article,nav,aside,div[class*="card"],div[class*="modal"],div[class*="container"]').forEach((el) => {
              if (colorCount >= 25) return
              const cs = getComputedStyle(el)
              if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') {
                styles.colors.push({
                  value: cs.backgroundColor,
                  source: 'background',
                  element: el.tagName.toLowerCase()
                })
                colorCount++
              }
            })

            // Text colors
            let textColorCount = 0
            document.querySelectorAll('h1,h2,h3,p,span,a,button').forEach((el) => {
              if (textColorCount >= 15) return
              const cs = getComputedStyle(el)
              if (el.innerText?.trim()) {
                styles.colors.push({
                  value: cs.color,
                  source: 'text',
                  element: el.tagName.toLowerCase()
                })
                textColorCount++
              }
            })

            // Spacing
            let spacingCount = 0
            document.querySelectorAll('section,article,div[class*="container"],main,header').forEach((el) => {
              if (spacingCount >= 20) return
              const cs = getComputedStyle(el)
              if (cs.padding && cs.padding !== '0px') {
                styles.spacing.push({ property: 'padding', value: cs.padding })
                spacingCount++
              }
              if (cs.gap && cs.gap !== 'normal' && cs.gap !== '0px') {
                styles.spacing.push({ property: 'gap', value: cs.gap })
                spacingCount++
              }
            })

            // Effects: border-radius, shadows
            let effectCount = 0
            document.querySelectorAll('button,[class*="btn"],input,div[class*="card"]').forEach((el) => {
              if (effectCount >= 20) return
              const cs = getComputedStyle(el)
              if (cs.borderRadius && cs.borderRadius !== '0px') {
                styles.effects.push({ type: 'border-radius', value: cs.borderRadius, element: el.tagName.toLowerCase() })
                effectCount++
              }
              if (cs.boxShadow && cs.boxShadow !== 'none') {
                styles.effects.push({ type: 'box-shadow', value: cs.boxShadow, element: el.tagName.toLowerCase() })
                effectCount++
              }
            })

            return styles
          }

          // ============================================
          // UX Intelligence: Capture interactive elements
          // ============================================
          const captureUXData = () => {
            const uxData = {
              interactions: [],
              forms: [],
              navigation: [],
              modals: [],
              media: [],
              accessibility: null
            }

            const viewportHeight = window.innerHeight

            // Helper to get element position
            const getPosition = (el) => {
              const rect = el.getBoundingClientRect()
              return {
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                viewportPosition: rect.top < viewportHeight ? 'above-fold' : 'below-fold'
              }
            }

            // Capture interactive elements (buttons, links, inputs)
            let interactionCount = 0
            document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [type="submit"]').forEach((el) => {
              if (interactionCount >= 50) return
              const cs = getComputedStyle(el)
              const isVisible = cs.display !== 'none' && cs.visibility !== 'hidden' && el.offsetParent !== null

              let elType = 'other'
              if (el.tagName === 'BUTTON' || el.type === 'submit' || el.role === 'button') elType = 'button'
              else if (el.tagName === 'A' || el.role === 'link') elType = 'link'
              else if (el.tagName === 'INPUT') elType = el.type === 'checkbox' ? 'checkbox' : el.type === 'radio' ? 'radio' : 'input'
              else if (el.tagName === 'SELECT') elType = 'select'

              uxData.interactions.push({
                type: elType,
                tag: el.tagName.toLowerCase(),
                text: (el.innerText || el.value || el.placeholder || '').trim().slice(0, 100),
                href: el.href || null,
                id: el.id || null,
                className: el.className?.slice?.(0, 100) || null,
                ariaLabel: el.getAttribute('aria-label') || null,
                role: el.role || el.getAttribute('role') || null,
                position: getPosition(el),
                styles: {
                  backgroundColor: cs.backgroundColor,
                  color: cs.color,
                  fontSize: cs.fontSize,
                  fontWeight: cs.fontWeight,
                  padding: cs.padding,
                  borderRadius: cs.borderRadius,
                  border: cs.border,
                  boxShadow: cs.boxShadow
                },
                isVisible,
                isDisabled: el.disabled || el.getAttribute('aria-disabled') === 'true'
              })
              interactionCount++
            })

            // Capture forms
            let formCount = 0
            document.querySelectorAll('form').forEach((form) => {
              if (formCount >= 10) return
              const fields = []

              form.querySelectorAll('input, select, textarea').forEach((field) => {
                fields.push({
                  type: field.type || field.tagName.toLowerCase(),
                  name: field.name || null,
                  id: field.id || null,
                  label: document.querySelector(`label[for="${field.id}"]`)?.innerText?.trim() || null,
                  placeholder: field.placeholder || null,
                  required: field.required,
                  autocomplete: field.autocomplete || null,
                  pattern: field.pattern || null,
                  minLength: field.minLength > 0 ? field.minLength : null,
                  maxLength: field.maxLength > 0 ? field.maxLength : null
                })
              })

              const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], button:not([type])')

              uxData.forms.push({
                id: form.id || null,
                action: form.action || null,
                method: form.method || null,
                fields,
                submitButton: submitBtn ? {
                  type: 'button',
                  tag: submitBtn.tagName.toLowerCase(),
                  text: (submitBtn.innerText || submitBtn.value || '').trim()
                } : null,
                position: getPosition(form)
              })
              formCount++
            })

            // Capture navigation elements
            let navCount = 0
            document.querySelectorAll('nav, [role="navigation"], header ul, footer ul, [class*="menu"], [class*="nav"]').forEach((nav) => {
              if (navCount >= 10) return
              const items = []

              nav.querySelectorAll('a, button').forEach((item) => {
                items.push({
                  text: (item.innerText || '').trim().slice(0, 50),
                  href: item.href || null,
                  isActive: item.classList.contains('active') || item.getAttribute('aria-current') === 'page',
                  hasDropdown: item.getAttribute('aria-haspopup') === 'true' || item.querySelector('ul, [class*="dropdown"]') !== null,
                  children: []
                })
              })

              if (items.length > 0) {
                const cs = getComputedStyle(nav)
                uxData.navigation.push({
                  type: nav.tagName === 'NAV' ? 'nav' : 'menu',
                  items,
                  position: getPosition(nav),
                  isSticky: cs.position === 'sticky' || cs.position === 'fixed'
                })
                navCount++
              }
            })

            // Capture modals/dialogs
            document.querySelectorAll('[role="dialog"], [role="alertdialog"], [class*="modal"], [class*="popup"], [class*="overlay"]').forEach((modal) => {
              const cs = getComputedStyle(modal)
              if (cs.display !== 'none') {
                uxData.modals.push({
                  type: modal.role === 'alertdialog' ? 'dialog' : 'modal',
                  trigger: null,
                  hasOverlay: modal.className.includes('overlay') || modal.querySelector('[class*="overlay"]') !== null,
                  hasCloseButton: modal.querySelector('[class*="close"], button[aria-label*="close"]') !== null,
                  position: 'center'
                })
              }
            })

            // Capture media elements
            let mediaCount = 0
            document.querySelectorAll('img, video, audio, iframe, canvas').forEach((media) => {
              if (mediaCount >= 20) return
              uxData.media.push({
                type: media.tagName.toLowerCase(),
                src: media.src?.slice(0, 200) || null,
                alt: media.alt || null,
                dimensions: { width: media.width || 0, height: media.height || 0 },
                isLazyLoaded: media.loading === 'lazy' || media.getAttribute('data-src') !== null
              })
              mediaCount++
            })

            // Capture accessibility data
            const headings = []
            for (let i = 1; i <= 6; i++) {
              const h = document.querySelectorAll(`h${i}`)
              if (h.length > 0) {
                headings.push({
                  level: i,
                  count: h.length,
                  examples: Array.from(h).slice(0, 2).map(el => el.innerText?.trim()?.slice(0, 50) || '')
                })
              }
            }

            const images = document.querySelectorAll('img')
            const imagesWithAlt = Array.from(images).filter(img => img.alt && img.alt.trim()).length

            uxData.accessibility = {
              hasSkipLink: document.querySelector('a[href="#main"], a[href="#content"], .skip-link, [class*="skip"]') !== null,
              landmarkRegions: [...new Set(Array.from(document.querySelectorAll('main, nav, header, footer, aside, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]')).map(el => el.tagName.toLowerCase()))],
              headingStructure: headings,
              focusableElements: document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').length,
              ariaLabelsCount: document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]').length,
              imagesWithAlt,
              imagesWithoutAlt: images.length - imagesWithAlt,
              colorContrastIssues: 0 // Would need more complex analysis
            }

            return uxData
          }

          const snapshot = {
            url: location.href,
            title: document.title,
            html: document.body.innerHTML,
            text: [...new Set(visibleText)], // Deduplicate
            ux: uxEvents,
            designStyles: captureDesignStyles(), // Design Forensics data
            uxData: captureUXData(), // UX Intelligence data
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

    // Add screenshot to result if captured
    if (screenshot) {
      result.screenshot = screenshot
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
