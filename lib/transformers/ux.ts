// ============================================
// UX TRANSFORMER - HTML → CapturedUXData
// ============================================

import type {
  CapturedUXData,
  CapturedForm,
  NavigationElement,
  FormField,
  NavItem,
  InteractionElement,
  ModalElement,
  MediaElement,
  AccessibilityData
} from '../ux-intelligence/types'

/**
 * Transform snapshot HTML to CapturedUXData
 */
export function transformHTMLToUXData(
  html: string,
  url: string
): CapturedUXData {
  return {
    // Extract interactions (buttons, links, inputs)
    interactions: extractInteractions(html),
    // Extract forms
    forms: extractForms(html),
    // Extract navigation
    navigation: extractNavigation(html),
    // Extract modals (empty for now - need more sophisticated parsing)
    modals: [],
    // Extract media (empty for now - need more sophisticated parsing)
    media: [],
    // Extract accessibility data
    accessibility: extractAccessibility(html)
  }
}

/**
 * Extract text content from HTML
 */
function extractTextContent(html: string): string[] {
  const texts: string[] = []

  // Remove script and style tags
  const cleaned = html
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<[^>]+>/g, ' ')

  // Split by whitespace and filter
  cleaned.split(/\s+/).forEach(text => {
    const trimmed = text.trim()
    if (trimmed.length > 2 && trimmed.length < 100) {
      texts.push(trimmed)
    }
  })

  return texts.slice(0, 100)
}

/**
 * Extract CTAs from HTML
 */
interface CTA {
  text: string
  type: string
  element: string
  position: number
}

function extractCTAs(html: string): CTA[] {
  const ctas: CTA[] = []
  const ctaRegex = /<(button|a)[^>]*>([^<]*)<\/\1>/gi
  let match: RegExpExecArray | null
  let position = 0

  while ((match = ctaRegex.exec(html)) !== null) {
    const element = match[1]
    const text = match[2].trim()

    if (text && text.length < 100) {
      ctas.push({
        text,
        type: element,
        element: match[0],
        position
      })
    }

    position++
  }

  return ctas.slice(0, 20)
}

/**
 * Extract forms from HTML
 */
function extractForms(html: string): CapturedForm[] {
  const forms: CapturedForm[] = []
  const formRegex = /<form[^>]*>(.*?)<\/form>/gis
  let match: RegExpExecArray | null
  let formIndex = 0

  while ((match = formRegex.exec(html)) !== null) {
    const formContent = match[1]
    const fields: FormField[] = []

    // Extract input fields
    const inputRegex = /<(input|textarea|select)[^>]*>/gi
    let inputMatch: RegExpExecArray | null

    while ((inputMatch = inputRegex.exec(formContent)) !== null) {
      const tag = inputMatch[1]
      const attrs = inputMatch[0]

      fields.push({
        type: tag,
        name: extractAttr(attrs, 'name'),
        placeholder: extractAttr(attrs, 'placeholder'),
        required: attrs.includes('required')
      })
    }

    forms.push({
      id: extractAttr(match[0], 'id') || `form-${formIndex}`,
      action: extractAttr(match[0], 'action') || null,
      method: extractAttr(match[0], 'method') || 'POST',
      fields,
      position: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        viewportPosition: 'above-fold'
      }
    })

    formIndex++
  }

  return forms
}

/**
 * Extract navigation from HTML
 */
function extractNavigation(html: string): NavigationElement[] {
  const navs: NavigationElement[] = []

  // Find nav elements
  const navRegex = /<(nav|header)[^>]*>(.*?)<\/\1>/gis
  let match: RegExpExecArray | null
  let navIndex = 0

  while ((match = navRegex.exec(html)) !== null) {
    const tag = match[1]
    const navContent = match[2]
    const items: NavItem[] = []

    // Extract links
    const linkRegex = /<a[^>]*href=['"]([^'"]*)['"][^>]*>([^<]*)<\/a>/gi
    let linkMatch: RegExpExecArray | null

    while ((linkMatch = linkRegex.exec(navContent)) !== null) {
      items.push({
        text: linkMatch[2].trim(),
        href: linkMatch[1] || undefined,
        isActive: false,
        hasDropdown: false
      })
    }

    navs.push({
      type: tag === 'nav' ? 'nav' : 'menu',
      items,
      position: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        viewportPosition: navIndex === 0 ? 'above-fold' : 'below-fold'
      },
      isSticky: navIndex === 0
    })

    navIndex++
  }

  return navs
}

/**
 * Extract attribute value from HTML tag
 */
function extractAttr(html: string, attr: string): string | undefined {
  const regex = new RegExp(`${attr}=["']([^"']*)["']`, 'i')
  const match = regex.exec(html)
  return match ? match[1] : undefined
}

/**
 * Extract interactions (buttons, links, inputs) from HTML
 */
function extractInteractions(html: string): InteractionElement[] {
  const interactions: InteractionElement[] = []

  // Extract buttons and links
  const elementRegex = /<(button|a|input|select|textarea|checkbox|radio)[^>]*>(?:([^<]*)<\/\1>)?/gi
  let match: RegExpExecArray | null
  let index = 0

  while ((match = elementRegex.exec(html)) !== null && index < 50) {
    const tag = match[1]
    const attrs = match[0]
    const text = match[2] || extractAttr(attrs, 'value') || extractAttr(attrs, 'placeholder') || ''

    interactions.push({
      type: tag === 'a' ? 'link' :
            tag === 'input' || tag === 'select' || tag === 'textarea' ? 'input' :
            tag === 'checkbox' || tag === 'radio' ? 'checkbox' : 'button',
      tag,
      text: text.trim().slice(0, 100),
      href: tag === 'a' ? (extractAttr(attrs, 'href') || null) : null,
      id: extractAttr(attrs, 'id') || null,
      className: extractAttr(attrs, 'class') || null,
      ariaLabel: extractAttr(attrs, 'aria-label') || null,
      role: extractAttr(attrs, 'role') || null,
      position: {
        x: 0,
        y: index * 50,
        width: 0,
        height: 0,
        viewportPosition: 'above-fold'
      },
      styles: {
        backgroundColor: 'rgb(0, 0, 0)',
        color: 'rgb(0, 0, 0)',
        fontSize: '16px',
        fontWeight: '400',
        padding: '8px 16px',
        borderRadius: '4px',
        border: 'none'
      },
      isVisible: true,
      isDisabled: attrs.includes('disabled')
    })

    index++
  }

  return interactions
}

/**
 * Extract accessibility data from HTML
 */
function extractAccessibility(html: string): AccessibilityData {
  const hasSkipLink = /skip/i.test(html)

  // Count landmark regions
  const landmarks = html.match(/<(header|main|nav|footer|aside|section|article)[^>]*>/gi) || []
  const landmarkRegions = [...new Set(landmarks.map(l => l.match(/<(\w+)/)?.[1] || ''))]

  // Count heading levels
  const headingCounts: Record<number, number> = {}
  for (let i = 1; i <= 6; i++) {
    const regex = new RegExp(`<h${i}[^>]*>`, 'gi')
    const matches = html.match(regex) || []
    headingCounts[i] = matches.length
  }

  const headingStructure = Object.entries(headingCounts)
    .filter(([_, count]) => count > 0)
    .map(([level, count]) => ({
      level: parseInt(level),
      count,
      examples: [] // Could extract examples if needed
    }))

  // Count focusable elements
  const focusableCount = (html.match(/<(button|a|input|select|textarea)[^>]*>/gi) || []).length

  // Count ARIA labels
  const ariaLabelsCount = (html.match(/aria-label=/gi) || []).length

  // Count images with and without alt
  const imagesWithAlt = (html.match(/<img[^>]*alt=["'][^"']+["'][^>]*>/gi) || []).length
  const imagesWithoutAlt = (html.match(/<img[^>]*>/gi) || []).length - imagesWithAlt

  return {
    hasSkipLink,
    landmarkRegions,
    headingStructure,
    focusableElements: focusableCount,
    ariaLabelsCount,
    imagesWithAlt,
    imagesWithoutAlt,
    colorContrastIssues: 0 // Would need more sophisticated analysis
  }
}
