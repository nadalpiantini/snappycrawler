// ============================================
// DESIGN TRANSFORMER - HTML → CapturedDesignStyles
// ============================================

import type * as cheerio from 'cheerio'
import type {
  CapturedDesignStyles,
  TypographySample,
  ColorSample,
  SpacingSample,
  EffectsSample
} from '../design-forensics/types'

/**
 * Transform snapshot HTML to CapturedDesignStyles
 */
export async function transformHTMLToDesignStyles(
  html: string,
  url: string
): Promise<CapturedDesignStyles> {
  // Dynamic import to avoid SSR issues
  const cheerio = await import('cheerio')
  const $ = cheerio.load(html)

  // Extract all computed styles by parsing inline styles and class attributes
  const typography = extractTypography($)
  const colors = extractColors($)
  const spacing = extractSpacing($)
  const effects = extractEffects($)

  return {
    typography,
    colors,
    spacing,
    effects
  }
}

/**
 * Extract typography samples from HTML
 */
function extractTypography($: cheerio.CheerioAPI): TypographySample[] {
  const samples: TypographySample[] = []
  const seen = new Set<string>()

  // Common text elements to analyze
  const selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button', 'span', 'div', 'li']

  selectors.forEach(selector => {
    $(selector).each((_, el) => {
      const $el = $(el)
      const text = $el.text().trim().slice(0, 50)

      if (!text) return

      // Extract inline styles or use defaults
      const styles = parseInlineStyle($el.attr('style'))

      // Generate sample data
      const sample: TypographySample = {
        tag: selector,
        fontFamily: styles.fontFamily || 'sans-serif',
        fontSize: styles.fontSize || '16px',
        fontWeight: styles.fontWeight || '400',
        lineHeight: styles.lineHeight || '1.5',
        letterSpacing: styles.letterSpacing,
        textTransform: styles.textTransform,
        color: styles.color || 'rgb(0, 0, 0)',
        sampleText: text
      }

      // Create unique key to avoid duplicates
      const key = `${sample.tag}-${sample.fontFamily}-${sample.fontSize}-${sample.fontWeight}`

      if (!seen.has(key) && samples.length < 50) {
        seen.add(key)
        samples.push(sample)
      }
    })
  })

  return samples.slice(0, 30) // Limit to top 30 samples
}

/**
 * Extract color samples from HTML
 */
function extractColors($: cheerio.CheerioAPI): ColorSample[] {
  const samples: ColorSample[] = []
  const colorMap = new Map<string, { count: number; elements: string[] }>()

  // Extract colors from inline styles
  $('[style]').each((_, el) => {
    const $el = $(el)
    const styles = parseInlineStyle($el.attr('style'))

    // Extract background colors
    if (styles.backgroundColor) {
      const color = normalizeColor(styles.backgroundColor)
      if (color) {
        if (!colorMap.has(color)) {
          colorMap.set(color, { count: 0, elements: [] })
        }
        const data = colorMap.get(color)!
        data.count++
        data.elements.push($el[0].name)
      }
    }

    // Extract text colors
    if (styles.color) {
      const color = normalizeColor(styles.color)
      if (color) {
        if (!colorMap.has(color)) {
          colorMap.set(color, { count: 0, elements: [] })
        }
        const data = colorMap.get(color)!
        data.count++
        data.elements.push($el[0].name)
      }
    }
  })

  // Convert to ColorSample array
  colorMap.forEach((data, value) => {
    const source = inferColorSource(data.elements)
    const frequency = data.count

    // Create a sample for each unique element type (up to 5)
    const uniqueElements = [...new Set(data.elements)].slice(0, 5)
    uniqueElements.forEach((element, index) => {
      samples.push({
        value,
        source,
        element: `${element}${frequency > 1 ? ` (${index === 0 ? frequency : '+'}${index === 0 ? 'x' : ''})` : ''}`,
        frequency: index === 0 ? frequency : undefined
      })
    })
  })

  return samples.sort((a, b) => (b.frequency || 0) - (a.frequency || 0)).slice(0, 20)
}

/**
 * Extract spacing samples from HTML
 */
function extractSpacing($: cheerio.CheerioAPI): SpacingSample[] {
  const samples: SpacingSample[] = []
  const paddingSet = new Set<number>()
  const marginSet = new Set<number>()

  $('[style]').each((_, el) => {
    const $el = $(el)
    const styles = parseInlineStyle($el.attr('style'))

    // Extract padding
    if (styles.padding) {
      const px = parsePixels(styles.padding)
      if (px > 0) paddingSet.add(px)
    }

    // Extract margin
    if (styles.margin) {
      const px = parsePixels(styles.margin)
      if (px > 0) marginSet.add(px)
    }
  })

  // Convert padding to samples
  Array.from(paddingSet).sort((a, b) => a - b).forEach((value) => {
    samples.push({
      property: 'padding',
      value: `${value}px`,
      context: 'Padding spacing'
    })
  })

  // Convert margin to samples
  Array.from(marginSet).sort((a, b) => a - b).forEach((value) => {
    samples.push({
      property: 'margin',
      value: `${value}px`,
      context: 'Margin spacing'
    })
  })

  return samples
}

/**
 * Extract effects (border-radius, box-shadow) from HTML
 */
function extractEffects($: cheerio.CheerioAPI): EffectsSample[] {
  const effects: EffectsSample[] = []

  // Extract border-radius
  const radiiSet = new Set<string>()
  $('[style]').each((_, el) => {
    const styles = parseInlineStyle($(el).attr('style'))
    if (styles.borderRadius) {
      radiiSet.add(styles.borderRadius)
    }
  })

  // Extract box-shadow
  const shadowSet = new Set<string>()
  $('[style]').each((_, el) => {
    const styles = parseInlineStyle($(el).attr('style'))
    if (styles.boxShadow) {
      shadowSet.add(styles.boxShadow)
    }
  })

  // Add to effects array
  radiiSet.forEach(radius => {
    effects.push({
      type: 'border-radius',
      value: radius,
      element: 'Border radius effect'
    })
  })

  shadowSet.forEach(shadow => {
    effects.push({
      type: 'box-shadow',
      value: shadow,
      element: 'Box shadow effect'
    })
  })

  return effects
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse inline style string to object
 */
function parseInlineStyle(styleStr?: string): Record<string, string> {
  const styles: Record<string, string> = {}

  if (!styleStr) return styles

  styleStr.split(';').forEach(rule => {
    const [property, value] = rule.split(':').map(s => s.trim())
    if (property && value) {
      // Convert camelCase to kebab-case
      const kebabProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase()
      styles[kebabProperty] = value
    }
  })

  return styles
}

/**
 * Parse pixels from value string
 */
function parsePixels(value: string): number {
  const match = value.match(/(\d+)px/)
  return match ? parseInt(match[1], 10) : 0
}

/**
 * Normalize color to rgb/rgba format
 */
function normalizeColor(color: string): string | null {
  if (!color) return null

  // Already in rgb/rgba format
  if (color.startsWith('rgb')) {
    return color
  }

  // Hex color
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    if (hex.length === 3) {
      const r = hex[0] + hex[0]
      const g = hex[1] + hex[1]
      const b = hex[2] + hex[2]
      return `rgb(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`
    } else if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return `rgb(${r}, ${g}, ${b})`
    }
  }

  // Named colors - basic set
  const namedColors: Record<string, string> = {
    'black': 'rgb(0, 0, 0)',
    'white': 'rgb(255, 255, 255)',
    'red': 'rgb(255, 0, 0)',
    'green': 'rgb(0, 128, 0)',
    'blue': 'rgb(0, 0, 255)',
    'yellow': 'rgb(255, 255, 0)',
    'gray': 'rgb(128, 128, 128)',
    'grey': 'rgb(128, 128, 128)'
  }

  return namedColors[color.toLowerCase()] || null
}

/**
 * Infer the source type of a color based on elements
 */
function inferColorSource(elements: string[]): 'background' | 'text' | 'border' | 'shadow' {
  const elementStr = elements.join(' ').toLowerCase()

  if (elementStr.includes('background') || elementStr.includes('bg')) {
    return 'background'
  }

  if (elementStr.includes('text') || elementStr.includes('color') || elementStr.includes('p') || elementStr.includes('h1') || elementStr.includes('h2')) {
    return 'text'
  }

  if (elementStr.includes('border')) {
    return 'border'
  }

  if (elementStr.includes('shadow') || elementStr.includes('box-shadow')) {
    return 'shadow'
  }

  return 'text' // Default to text if unclear
}

/**
 * Infer the role of a color based on usage
 */
function inferColorRole(color: string, elements: string[]): string {
  const elementStr = elements.join(' ').toLowerCase()

  if (elementStr.includes('button') || elementStr.includes('btn')) {
    return 'button'
  }

  if (elementStr.includes('background') || elementStr.includes('bg')) {
    return 'background'
  }

  if (elementStr.includes('text') || elementStr.includes('p') || elementStr.includes('h1') || elementStr.includes('h2')) {
    return 'text'
  }

  if (elementStr.includes('border')) {
    return 'border'
  }

  return 'accent'
}
