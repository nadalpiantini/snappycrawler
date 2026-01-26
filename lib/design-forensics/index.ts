// ============================================
// Design Forensics - Public API
// ============================================

// Type exports
export type {
  // Captured data types
  CapturedDesignStyles,
  TypographySample,
  ColorSample,
  SpacingSample,
  EffectsSample,

  // Output types
  DesignTokens,
  DesignTokensMeta,
  TypographyTokens,
  TypographyScaleToken,
  ColorTokens,
  SpacingTokens,
  RadiiTokens,
  ShadowTokens,
  ComponentTokens,
  ComponentVariantStyles,

  // Analysis types
  RGBColor,
  HSLColor,
  AnalyzedColor,

  // Full output type
  DesignForensicsOutput
} from './types'

// Main analysis function
export { analyzeDesign, validateCapturedStyles, getCaptureSummary } from './analyzer'

// Individual analyzers (for advanced usage)
export { analyzeTypography } from './typography'
export { analyzeColors } from './colors'
export { analyzeSpacing, analyzeRadii, analyzeShadows } from './spacing'

// Output generators
export {
  generateAllOutputs,
  generateDesignTokensJSON,
  generateTokensCSS,
  generateDesignSummary
} from './generators'
