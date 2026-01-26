// ============================================
// Spacing Analysis Module
// ============================================

import type {
  SpacingSample,
  EffectsSample,
  SpacingTokens,
  RadiiTokens,
  ShadowTokens
} from './types'

/**
 * Analyze spacing samples and infer scale
 */
export function analyzeSpacing(samples: SpacingSample[]): SpacingTokens {
  if (!samples || samples.length === 0) {
    return getDefaultSpacing()
  }

  // Extract all numeric values from samples
  const values = extractSpacingValues(samples)

  if (values.length === 0) {
    return getDefaultSpacing()
  }

  // Find base unit (GCD of common values)
  const baseUnit = findBaseUnit(values)

  // Generate scale based on detected values
  const scale = generateSpacingScale(values, baseUnit)

  return {
    unit: baseUnit,
    scale
  }
}

/**
 * Analyze border radius samples
 */
export function analyzeRadii(samples: EffectsSample[]): RadiiTokens {
  const radiusSamples = samples.filter(s => s.type === 'border-radius')

  if (radiusSamples.length === 0) {
    return getDefaultRadii()
  }

  // Extract values
  const values = radiusSamples
    .map(s => parseRadiusValue(s.value))
    .filter((v): v is number => v !== null && v >= 0)
    .sort((a, b) => a - b)

  // Deduplicate
  const uniqueValues = [...new Set(values)]

  if (uniqueValues.length === 0) {
    return getDefaultRadii()
  }

  // Map to standard scale
  return mapRadiiToScale(uniqueValues)
}

/**
 * Analyze shadow samples
 */
export function analyzeShadows(samples: EffectsSample[]): ShadowTokens {
  const shadowSamples = samples.filter(s => s.type === 'box-shadow')

  if (shadowSamples.length === 0) {
    return {}
  }

  // Categorize shadows by intensity
  const categorized = categorizeShadows(shadowSamples)

  return {
    sm: categorized.sm,
    md: categorized.md,
    lg: categorized.lg
  }
}

/**
 * Extract numeric values from spacing samples
 */
function extractSpacingValues(samples: SpacingSample[]): number[] {
  const values: number[] = []

  for (const sample of samples) {
    const parsed = parseSpacingValue(sample.value)
    if (parsed !== null) {
      values.push(...parsed)
    }
  }

  return values.filter(v => v > 0)
}

/**
 * Parse spacing value string to numbers
 * Handles: "16px", "16px 24px", "16px 24px 16px 24px"
 */
function parseSpacingValue(value: string): number[] | null {
  // Remove 'px', 'rem', 'em' and split by spaces
  const parts = value
    .replace(/px|rem|em/gi, '')
    .trim()
    .split(/\s+/)

  const numbers = parts
    .map(p => parseFloat(p))
    .filter(n => !isNaN(n) && n >= 0)

  return numbers.length > 0 ? numbers : null
}

/**
 * Parse radius value (may be shorthand like "8px 8px 0 0")
 */
function parseRadiusValue(value: string): number | null {
  // Take first value if shorthand
  const firstValue = value.split(/\s+/)[0]
  const num = parseFloat(firstValue.replace(/px|rem|em|%/gi, ''))

  return isNaN(num) ? null : num
}

/**
 * Find base unit (typically 4 or 8)
 */
function findBaseUnit(values: number[]): number {
  const candidates = [4, 5, 6, 8, 10]
  let bestUnit = 4
  let bestScore = 0

  for (const unit of candidates) {
    // Count how many values are divisible by this unit
    const divisibleCount = values.filter(v => v % unit === 0).length
    const score = divisibleCount / values.length

    if (score > bestScore) {
      bestScore = score
      bestUnit = unit
    }
  }

  // If no clear winner, default to 4
  if (bestScore < 0.5) {
    return 4
  }

  return bestUnit
}

/**
 * Generate spacing scale from detected values
 */
function generateSpacingScale(values: number[], baseUnit: number): number[] {
  // Standard multiples of base unit
  const standardScale = [
    baseUnit,
    baseUnit * 2,
    baseUnit * 3,
    baseUnit * 4,
    baseUnit * 6,
    baseUnit * 8,
    baseUnit * 12,
    baseUnit * 16
  ]

  // Find which standard values are close to detected values
  const detectedSet = new Set<number>()

  for (const value of values) {
    // Round to nearest standard value
    const nearest = standardScale.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    )
    detectedSet.add(nearest)
  }

  // Sort and return
  const result = [...detectedSet].sort((a, b) => a - b)

  // Ensure we have at least 4 values in the scale
  if (result.length < 4) {
    return standardScale.slice(0, 8)
  }

  return result
}

/**
 * Map radii values to semantic scale
 */
function mapRadiiToScale(values: number[]): RadiiTokens {
  // Remove duplicates and sort
  const unique = [...new Set(values)].sort((a, b) => a - b)

  // Always include none
  const result: RadiiTokens = {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '16px',
    full: '9999px'
  }

  if (unique.length === 0) {
    return result
  }

  // Map detected values to scale
  if (unique.length >= 1) {
    result.sm = `${unique[0]}px`
  }
  if (unique.length >= 2) {
    result.md = `${unique[Math.floor(unique.length / 2)]}px`
  }
  if (unique.length >= 3) {
    result.lg = `${unique[unique.length - 1]}px`
  }

  // Check for very large values (full/pill)
  const maxValue = Math.max(...unique)
  if (maxValue >= 50) {
    result.full = `${maxValue}px`
  }

  return result
}

/**
 * Categorize shadows by visual intensity
 */
function categorizeShadows(samples: EffectsSample[]): { sm?: string; md?: string; lg?: string } {
  const shadows = samples.map(s => ({
    value: s.value,
    intensity: estimateShadowIntensity(s.value)
  }))

  // Sort by intensity
  shadows.sort((a, b) => a.intensity - b.intensity)

  const result: { sm?: string; md?: string; lg?: string } = {}

  // Map to scale based on intensity
  if (shadows.length >= 1) {
    result.sm = shadows[0].value
  }
  if (shadows.length >= 2) {
    result.md = shadows[Math.floor(shadows.length / 2)].value
  }
  if (shadows.length >= 3) {
    result.lg = shadows[shadows.length - 1].value
  }

  return result
}

/**
 * Estimate shadow intensity (higher = more prominent)
 */
function estimateShadowIntensity(shadow: string): number {
  if (shadow === 'none') return 0

  // Extract numeric values from shadow
  const numbers = shadow.match(/\d+/g)?.map(Number) || []

  // Intensity based on blur radius and spread (typically 3rd and 4th values)
  const blur = numbers[2] || 0
  const spread = numbers[3] || 0

  // Also consider alpha/opacity
  const alphaMatch = shadow.match(/rgba?\([^)]+,\s*([\d.]+)\s*\)/)
  const alpha = alphaMatch ? parseFloat(alphaMatch[1]) : 1

  return (blur + spread) * alpha
}

/**
 * Get default spacing when no samples available
 */
function getDefaultSpacing(): SpacingTokens {
  return {
    unit: 4,
    scale: [4, 8, 12, 16, 24, 32, 48, 64]
  }
}

/**
 * Get default radii
 */
function getDefaultRadii(): RadiiTokens {
  return {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '16px',
    full: '9999px'
  }
}
