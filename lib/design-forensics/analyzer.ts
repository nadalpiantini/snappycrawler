// ============================================
// Design Forensics Analyzer - Main Orchestrator
// ============================================

import type {
  CapturedDesignStyles,
  DesignTokens,
  DesignTokensMeta
} from './types'

import { analyzeTypography } from './typography'
import { analyzeColors } from './colors'
import { analyzeSpacing, analyzeRadii, analyzeShadows } from './spacing'

/**
 * Main analysis function - orchestrates all analysis modules
 * @param capturedStyles - Raw design styles from Chrome extension
 * @param sourceUrl - URL of the analyzed page
 * @returns DesignTokens with all extracted design information
 */
export async function analyzeDesign(
  capturedStyles: CapturedDesignStyles,
  sourceUrl?: string
): Promise<DesignTokens> {
  // Validate input
  if (!capturedStyles) {
    throw new Error('No captured styles provided')
  }

  // Analyze each design dimension in parallel
  const [typography, colors, spacing, radii, shadows] = await Promise.all([
    Promise.resolve(analyzeTypography(capturedStyles.typography || [])),
    Promise.resolve(analyzeColors(capturedStyles.colors || [])),
    Promise.resolve(analyzeSpacing(capturedStyles.spacing || [])),
    Promise.resolve(analyzeRadii(capturedStyles.effects || [])),
    Promise.resolve(analyzeShadows(capturedStyles.effects || []))
  ])

  // Calculate confidence score
  const confidence = calculateConfidence(capturedStyles)

  // Build metadata
  const meta: DesignTokensMeta = {
    source: sourceUrl || 'unknown',
    analyzedAt: new Date().toISOString(),
    confidence,
    version: '1.0.0'
  }

  // Assemble final tokens
  const tokens: DesignTokens = {
    meta,
    typography,
    colors,
    spacing,
    radii,
    shadows
  }

  return tokens
}

/**
 * Calculate analysis confidence score (0-1)
 * Higher = more data available = more reliable results
 */
function calculateConfidence(styles: CapturedDesignStyles): number {
  const weights = {
    typography: 0.35,  // Typography is most important
    colors: 0.30,      // Colors are critical
    spacing: 0.20,     // Spacing helps consistency
    effects: 0.15      // Nice to have
  }

  const typographyScore = Math.min(1, (styles.typography?.length || 0) / 15)
  const colorsScore = Math.min(1, (styles.colors?.length || 0) / 20)
  const spacingScore = Math.min(1, (styles.spacing?.length || 0) / 10)
  const effectsScore = Math.min(1, (styles.effects?.length || 0) / 10)

  const confidence =
    typographyScore * weights.typography +
    colorsScore * weights.colors +
    spacingScore * weights.spacing +
    effectsScore * weights.effects

  // Round to 2 decimal places
  return Math.round(confidence * 100) / 100
}

/**
 * Quick validation of captured styles
 */
export function validateCapturedStyles(styles: unknown): styles is CapturedDesignStyles {
  if (!styles || typeof styles !== 'object') return false

  const s = styles as Record<string, unknown>

  return (
    Array.isArray(s.typography) &&
    Array.isArray(s.colors) &&
    Array.isArray(s.spacing) &&
    Array.isArray(s.effects)
  )
}

/**
 * Get summary statistics of captured styles
 */
export function getCaptureSummary(styles: CapturedDesignStyles): {
  typographySamples: number
  colorSamples: number
  spacingSamples: number
  effectsSamples: number
  estimatedSize: string
} {
  const typographySamples = styles.typography?.length || 0
  const colorSamples = styles.colors?.length || 0
  const spacingSamples = styles.spacing?.length || 0
  const effectsSamples = styles.effects?.length || 0

  // Rough estimate of JSON size
  const estimatedBytes =
    typographySamples * 200 +  // ~200 bytes per typography sample
    colorSamples * 80 +        // ~80 bytes per color
    spacingSamples * 50 +      // ~50 bytes per spacing
    effectsSamples * 100       // ~100 bytes per effect

  const estimatedSize =
    estimatedBytes < 1024
      ? `${estimatedBytes} B`
      : `${(estimatedBytes / 1024).toFixed(1)} KB`

  return {
    typographySamples,
    colorSamples,
    spacingSamples,
    effectsSamples,
    estimatedSize
  }
}
