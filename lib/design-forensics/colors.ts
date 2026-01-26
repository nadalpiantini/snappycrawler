// ============================================
// Color Analysis Module
// ============================================

import type {
  ColorSample,
  ColorTokens,
  RGBColor,
  HSLColor,
  AnalyzedColor
} from './types'

/**
 * Analyze color samples and infer semantic roles
 */
export function analyzeColors(samples: ColorSample[]): ColorTokens {
  if (!samples || samples.length === 0) {
    return getDefaultColors()
  }

  // Parse and analyze all colors
  const analyzedColors = parseAndAnalyzeColors(samples)

  // Categorize by source
  const backgrounds = analyzedColors.filter(c => c.sources.includes('background'))
  const textColors = analyzedColors.filter(c => c.sources.includes('text'))
  const borderColors = analyzedColors.filter(c => c.sources.includes('border'))

  // Infer roles
  const bgDefault = findDefaultBackground(backgrounds)
  const bgSurface = findSurfaceColor(backgrounds, bgDefault)
  const textDefault = findDefaultTextColor(textColors, bgDefault)
  const textMuted = findMutedTextColor(textColors, textDefault)
  const primary = findPrimaryColor(analyzedColors, bgDefault)
  const border = findBorderColor(borderColors, bgDefault)

  return {
    primary,
    background: {
      default: bgDefault,
      surface: bgSurface
    },
    text: {
      default: textDefault,
      muted: textMuted
    },
    border
  }
}

/**
 * Parse all color samples into analyzed format
 */
function parseAndAnalyzeColors(samples: ColorSample[]): AnalyzedColor[] {
  const colorMap = new Map<string, AnalyzedColor>()

  for (const sample of samples) {
    const rgb = parseColor(sample.value)
    if (!rgb) continue

    const hex = rgbToHex(rgb)
    const existing = colorMap.get(hex)

    if (existing) {
      existing.frequency++
      if (!existing.sources.includes(sample.source)) {
        existing.sources.push(sample.source)
      }
    } else {
      colorMap.set(hex, {
        hex,
        rgb,
        hsl: rgbToHsl(rgb),
        frequency: 1,
        sources: [sample.source],
        luminance: calculateLuminance(rgb)
      })
    }
  }

  return Array.from(colorMap.values())
}

/**
 * Parse CSS color string to RGB
 */
function parseColor(colorStr: string): RGBColor | null {
  // Handle rgb() and rgba()
  const rgbMatch = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
    }
  }

  // Handle hex colors
  const hexMatch = colorStr.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16)
    }
  }

  // Handle short hex
  const shortHexMatch = colorStr.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i)
  if (shortHexMatch) {
    return {
      r: parseInt(shortHexMatch[1] + shortHexMatch[1], 16),
      g: parseInt(shortHexMatch[2] + shortHexMatch[2], 16),
      b: parseInt(shortHexMatch[3] + shortHexMatch[3], 16)
    }
  }

  return null
}

/**
 * Convert RGB to hex string
 */
function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase()
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(rgb: RGBColor): HSLColor {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * Calculate relative luminance for contrast calculations
 */
function calculateLuminance(rgb: RGBColor): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    v = v / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate contrast ratio between two colors
 */
function contrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Find the default background color (most common, likely page bg)
 */
function findDefaultBackground(backgrounds: AnalyzedColor[]): string {
  if (backgrounds.length === 0) return '#FFFFFF'

  // Sort by frequency and prefer light colors
  const sorted = [...backgrounds].sort((a, b) => {
    // Prioritize high frequency
    const freqDiff = b.frequency - a.frequency
    if (freqDiff !== 0) return freqDiff

    // Among same frequency, prefer lighter colors (higher lightness)
    return b.hsl.l - a.hsl.l
  })

  // Filter to only light backgrounds (lightness > 80%) if available
  const lightBgs = sorted.filter(c => c.hsl.l > 80)
  if (lightBgs.length > 0) {
    return lightBgs[0].hex
  }

  // Check for dark mode (most common is dark)
  const darkBgs = sorted.filter(c => c.hsl.l < 20)
  if (darkBgs.length > 0 && darkBgs[0].frequency > sorted[0].frequency / 2) {
    return darkBgs[0].hex
  }

  return sorted[0]?.hex || '#FFFFFF'
}

/**
 * Find surface color (cards, modals - slightly different from bg)
 */
function findSurfaceColor(backgrounds: AnalyzedColor[], defaultBg: string): string {
  if (backgrounds.length < 2) {
    // Generate a slightly different shade
    const bgRgb = parseColor(defaultBg)
    if (!bgRgb) return '#F8F9FA'

    const bgHsl = rgbToHsl(bgRgb)
    // If light bg, make surface slightly darker; if dark, slightly lighter
    const newL = bgHsl.l > 50 ? bgHsl.l - 3 : bgHsl.l + 3
    return hslToHex({ ...bgHsl, l: Math.max(0, Math.min(100, newL)) })
  }

  // Find second most common background
  const sorted = [...backgrounds]
    .filter(c => c.hex !== defaultBg)
    .sort((a, b) => b.frequency - a.frequency)

  return sorted[0]?.hex || '#F8F9FA'
}

/**
 * Find default text color (high contrast with background)
 */
function findDefaultTextColor(textColors: AnalyzedColor[], bgColor: string): string {
  if (textColors.length === 0) return '#1A1A1A'

  const bgRgb = parseColor(bgColor)
  const bgLum = bgRgb ? calculateLuminance(bgRgb) : 1

  // Find text color with best contrast
  let bestColor = textColors[0]
  let bestContrast = 0

  for (const color of textColors) {
    const contrast = contrastRatio(color.luminance, bgLum)
    if (contrast > bestContrast) {
      bestContrast = contrast
      bestColor = color
    }
  }

  // Ensure minimum contrast
  if (bestContrast < 4.5) {
    return bgLum > 0.5 ? '#1A1A1A' : '#FFFFFF'
  }

  return bestColor.hex
}

/**
 * Find muted text color (lower contrast than default)
 */
function findMutedTextColor(textColors: AnalyzedColor[], defaultText: string): string {
  const defaultRgb = parseColor(defaultText)
  if (!defaultRgb) return '#6B7280'

  const defaultHsl = rgbToHsl(defaultRgb)

  // Find colors similar to default but lighter (less contrast)
  const candidates = textColors.filter(c => {
    const hueDiff = Math.abs(c.hsl.h - defaultHsl.h)
    const satDiff = Math.abs(c.hsl.s - defaultHsl.s)
    return hueDiff < 30 && satDiff < 20 && c.hsl.l !== defaultHsl.l
  })

  if (candidates.length > 0) {
    // Sort by lightness difference from default
    const sorted = candidates.sort((a, b) => {
      const diffA = Math.abs(a.hsl.l - defaultHsl.l)
      const diffB = Math.abs(b.hsl.l - defaultHsl.l)
      return diffA - diffB
    })
    return sorted[0].hex
  }

  // Generate muted variant
  const mutedL = defaultHsl.l > 50 ? defaultHsl.l - 20 : defaultHsl.l + 30
  return hslToHex({ ...defaultHsl, s: Math.max(0, defaultHsl.s - 20), l: mutedL })
}

/**
 * Find primary/accent color (saturated, used on interactive elements)
 */
function findPrimaryColor(allColors: AnalyzedColor[], bgColor: string): string {
  const bgRgb = parseColor(bgColor)
  const bgLum = bgRgb ? calculateLuminance(bgRgb) : 1

  // Look for saturated colors that aren't too close to black/white
  const candidates = allColors.filter(c => {
    return c.hsl.s > 40 && c.hsl.l > 20 && c.hsl.l < 80
  })

  if (candidates.length === 0) {
    return '#3B82F6' // Default blue
  }

  // Prefer colors with good contrast to background
  const withContrast = candidates.map(c => ({
    ...c,
    contrast: contrastRatio(c.luminance, bgLum)
  }))

  // Sort by: contrast > 3, then by saturation, then by frequency
  const sorted = withContrast.sort((a, b) => {
    if (a.contrast >= 3 && b.contrast < 3) return -1
    if (b.contrast >= 3 && a.contrast < 3) return 1
    if (a.hsl.s !== b.hsl.s) return b.hsl.s - a.hsl.s
    return b.frequency - a.frequency
  })

  return sorted[0].hex
}

/**
 * Find border color
 */
function findBorderColor(borderColors: AnalyzedColor[], bgColor: string): string {
  if (borderColors.length === 0) {
    // Generate subtle border from background
    const bgRgb = parseColor(bgColor)
    if (!bgRgb) return '#E5E7EB'

    const bgHsl = rgbToHsl(bgRgb)
    const borderL = bgHsl.l > 50 ? bgHsl.l - 15 : bgHsl.l + 15
    return hslToHex({ h: bgHsl.h, s: Math.max(0, bgHsl.s - 30), l: borderL })
  }

  // Use most common border color
  const sorted = [...borderColors].sort((a, b) => b.frequency - a.frequency)
  return sorted[0].hex
}

/**
 * Convert HSL to hex
 */
function hslToHex(hsl: HSLColor): string {
  const { h, s, l } = hsl
  const sNorm = s / 100
  const lNorm = l / 100

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let r = 0, g = 0, b = 0

  if (h >= 0 && h < 60) { r = c; g = x; b = 0 }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0 }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }

  return rgbToHex({
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  })
}

/**
 * Get default colors when no samples available
 */
function getDefaultColors(): ColorTokens {
  return {
    primary: '#3B82F6',
    background: {
      default: '#FFFFFF',
      surface: '#F9FAFB'
    },
    text: {
      default: '#1F2937',
      muted: '#6B7280'
    },
    border: '#E5E7EB'
  }
}
