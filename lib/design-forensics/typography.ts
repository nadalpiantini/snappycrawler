// ============================================
// Typography Analysis Module
// ============================================

import type {
  TypographySample,
  TypographyTokens,
  TypographyScaleToken
} from './types'

/**
 * Analyze typography samples and infer hierarchy
 */
export function analyzeTypography(samples: TypographySample[]): TypographyTokens {
  if (!samples || samples.length === 0) {
    return getDefaultTypography()
  }

  // Group samples by tag
  const byTag = groupByTag(samples)

  // Find font families for headings and body
  const fontFamilies = inferFontFamilies(byTag)

  // Build typography scale
  const scale = buildTypographyScale(byTag, fontFamilies)

  return {
    fontFamilies,
    scale
  }
}

/**
 * Group typography samples by HTML tag
 */
function groupByTag(samples: TypographySample[]): Map<string, TypographySample[]> {
  const groups = new Map<string, TypographySample[]>()

  for (const sample of samples) {
    const tag = normalizeTag(sample.tag)
    const existing = groups.get(tag) || []
    existing.push(sample)
    groups.set(tag, existing)
  }

  return groups
}

/**
 * Normalize tag names to standard categories
 */
function normalizeTag(tag: string): string {
  const lower = tag.toLowerCase()

  // Map common tags to semantic roles
  if (['h1'].includes(lower)) return 'h1'
  if (['h2'].includes(lower)) return 'h2'
  if (['h3'].includes(lower)) return 'h3'
  if (['h4', 'h5', 'h6'].includes(lower)) return 'h4'
  if (['p', 'div', 'span', 'li'].includes(lower)) return 'body'
  if (['button', 'input[type="submit"]'].includes(lower)) return 'button'
  if (['a'].includes(lower)) return 'link'
  if (['label', 'small', 'caption'].includes(lower)) return 'caption'

  return 'body'
}

/**
 * Infer heading and body font families from samples
 */
function inferFontFamilies(
  byTag: Map<string, TypographySample[]>
): TypographyTokens['fontFamilies'] {
  // Collect fonts from headings
  const headingSamples = [
    ...(byTag.get('h1') || []),
    ...(byTag.get('h2') || []),
    ...(byTag.get('h3') || [])
  ]

  // Collect fonts from body text
  const bodySamples = [
    ...(byTag.get('body') || []),
    ...(byTag.get('caption') || [])
  ]

  // Find most common font for each
  const headingFont = findMostCommonFont(headingSamples) || 'system-ui, sans-serif'
  const bodyFont = findMostCommonFont(bodySamples) || 'system-ui, sans-serif'

  // Check for monospace fonts
  const allSamples = [...headingSamples, ...bodySamples]
  const monoFont = findMonospaceFont(allSamples)

  return {
    heading: cleanFontFamily(headingFont),
    body: cleanFontFamily(bodyFont),
    ...(monoFont ? { mono: cleanFontFamily(monoFont) } : {})
  }
}

/**
 * Find the most common font family in samples
 */
function findMostCommonFont(samples: TypographySample[]): string | null {
  if (samples.length === 0) return null

  const fontCounts = new Map<string, number>()

  for (const sample of samples) {
    const font = cleanFontFamily(sample.fontFamily)
    fontCounts.set(font, (fontCounts.get(font) || 0) + 1)
  }

  let maxCount = 0
  let mostCommon: string | null = null

  for (const [font, count] of fontCounts) {
    if (count > maxCount) {
      maxCount = count
      mostCommon = font
    }
  }

  return mostCommon
}

/**
 * Find monospace font if present
 */
function findMonospaceFont(samples: TypographySample[]): string | null {
  for (const sample of samples) {
    const font = sample.fontFamily.toLowerCase()
    if (
      font.includes('mono') ||
      font.includes('courier') ||
      font.includes('consolas') ||
      font.includes('menlo') ||
      font.includes('fira code')
    ) {
      return sample.fontFamily
    }
  }
  return null
}

/**
 * Clean font family string (remove quotes, get first font)
 */
function cleanFontFamily(fontFamily: string): string {
  // Split by comma and get first font
  const firstFont = fontFamily.split(',')[0].trim()

  // Remove quotes
  return firstFont.replace(/['"]/g, '')
}

/**
 * Build the typography scale from grouped samples
 */
function buildTypographyScale(
  byTag: Map<string, TypographySample[]>,
  fontFamilies: TypographyTokens['fontFamilies']
): TypographyTokens['scale'] {
  return {
    h1: buildScaleToken(byTag.get('h1'), fontFamilies.heading, '48px', '700'),
    h2: buildScaleToken(byTag.get('h2'), fontFamilies.heading, '36px', '700'),
    h3: buildScaleToken(byTag.get('h3'), fontFamilies.heading, '24px', '600'),
    h4: buildScaleToken(byTag.get('h4'), fontFamilies.heading, '20px', '600'),
    body: buildScaleToken(byTag.get('body'), fontFamilies.body, '16px', '400'),
    bodySmall: buildBodySmallToken(byTag.get('body'), fontFamilies.body),
    caption: buildScaleToken(byTag.get('caption'), fontFamilies.body, '12px', '400'),
    button: buildScaleToken(byTag.get('button'), fontFamilies.body, '14px', '500'),
    link: buildScaleToken(byTag.get('link'), fontFamilies.body, '16px', '400')
  }
}

/**
 * Build a single typography scale token from samples
 */
function buildScaleToken(
  samples: TypographySample[] | undefined,
  defaultFont: string,
  defaultSize: string,
  defaultWeight: string
): TypographyScaleToken {
  if (!samples || samples.length === 0) {
    return {
      fontFamily: defaultFont,
      fontSize: defaultSize,
      fontWeight: defaultWeight,
      lineHeight: '1.5'
    }
  }

  // Find median/mode values
  const fontSizes = samples.map(s => parseFloat(s.fontSize))
  const fontWeights = samples.map(s => s.fontWeight)
  const lineHeights = samples.map(s => parseLineHeight(s.lineHeight, s.fontSize))

  return {
    fontFamily: cleanFontFamily(samples[0].fontFamily),
    fontSize: `${median(fontSizes)}px`,
    fontWeight: mode(fontWeights) || defaultWeight,
    lineHeight: String(median(lineHeights).toFixed(2))
  }
}

/**
 * Build body small token (smaller than body)
 */
function buildBodySmallToken(
  bodySamples: TypographySample[] | undefined,
  defaultFont: string
): TypographyScaleToken {
  if (!bodySamples || bodySamples.length === 0) {
    return {
      fontFamily: defaultFont,
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.5'
    }
  }

  const bodySize = parseFloat(bodySamples[0].fontSize) || 16
  const smallSize = Math.max(12, bodySize - 2)

  return {
    fontFamily: cleanFontFamily(bodySamples[0].fontFamily),
    fontSize: `${smallSize}px`,
    fontWeight: '400',
    lineHeight: '1.5'
  }
}

/**
 * Parse line height to unitless number
 */
function parseLineHeight(lineHeight: string, fontSize: string): number {
  const lh = parseFloat(lineHeight)
  const fs = parseFloat(fontSize)

  if (isNaN(lh)) return 1.5

  // If line height is in px, convert to unitless
  if (lineHeight.includes('px') && fs > 0) {
    return lh / fs
  }

  // Already unitless
  if (lh < 10) {
    return lh
  }

  // Probably px value without unit, convert
  if (fs > 0) {
    return lh / fs
  }

  return 1.5
}

/**
 * Calculate median of number array
 */
function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Find mode (most common value) in array
 */
function mode<T>(values: T[]): T | null {
  if (values.length === 0) return null

  const counts = new Map<T, number>()
  for (const val of values) {
    counts.set(val, (counts.get(val) || 0) + 1)
  }

  let maxCount = 0
  let modeValue: T | null = null

  for (const [val, count] of counts) {
    if (count > maxCount) {
      maxCount = count
      modeValue = val
    }
  }

  return modeValue
}

/**
 * Get default typography when no samples available
 */
function getDefaultTypography(): TypographyTokens {
  return {
    fontFamilies: {
      heading: 'system-ui, sans-serif',
      body: 'system-ui, sans-serif'
    },
    scale: {
      h1: { fontFamily: 'system-ui', fontSize: '48px', fontWeight: '700', lineHeight: '1.2' },
      h2: { fontFamily: 'system-ui', fontSize: '36px', fontWeight: '700', lineHeight: '1.25' },
      h3: { fontFamily: 'system-ui', fontSize: '24px', fontWeight: '600', lineHeight: '1.3' },
      h4: { fontFamily: 'system-ui', fontSize: '20px', fontWeight: '600', lineHeight: '1.4' },
      body: { fontFamily: 'system-ui', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' },
      bodySmall: { fontFamily: 'system-ui', fontSize: '14px', fontWeight: '400', lineHeight: '1.5' },
      caption: { fontFamily: 'system-ui', fontSize: '12px', fontWeight: '400', lineHeight: '1.5' },
      button: { fontFamily: 'system-ui', fontSize: '14px', fontWeight: '500', lineHeight: '1' }
    }
  }
}
