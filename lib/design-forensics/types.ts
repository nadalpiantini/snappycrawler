// ============================================
// Design Forensics Type Definitions
// ============================================

// ===========================================
// CAPTURED DATA (from Chrome Extension)
// ===========================================

/**
 * Raw design styles captured by the Chrome extension
 * using window.getComputedStyle() on strategic elements
 */
export interface CapturedDesignStyles {
  typography: TypographySample[]
  colors: ColorSample[]
  spacing: SpacingSample[]
  effects: EffectsSample[]
}

export interface TypographySample {
  tag: string                    // h1, h2, p, button, a, span, etc.
  fontFamily: string             // Computed font family
  fontSize: string               // In px (e.g., "16px")
  fontWeight: string             // 400, 500, 600, 700, etc.
  lineHeight: string             // Unitless or px
  letterSpacing?: string         // em or px
  textTransform?: string         // uppercase, capitalize, none
  color: string                  // rgb() or rgba() format
  sampleText: string             // First 50 chars for context
}

export interface ColorSample {
  value: string                  // rgb() or rgba() format
  source: 'background' | 'text' | 'border' | 'shadow'
  element: string                // Element tag or description
  frequency?: number             // How often this appears
}

export interface SpacingSample {
  property: 'padding' | 'margin' | 'gap' | 'padding-top' | 'padding-bottom' | 'margin-top' | 'margin-bottom'
  value: string                  // px value (e.g., "16px")
  context?: string               // Element description
}

export interface EffectsSample {
  type: 'border-radius' | 'box-shadow' | 'border'
  value: string                  // Raw CSS value
  element?: string               // Element type
}

// ===========================================
// ANALYZED OUTPUT (Design Tokens)
// ===========================================

/**
 * Final design tokens produced by analysis
 * Can be exported as JSON, CSS, or Markdown
 */
export interface DesignTokens {
  meta: DesignTokensMeta
  typography: TypographyTokens
  colors: ColorTokens
  spacing: SpacingTokens
  radii: RadiiTokens
  shadows: ShadowTokens
  components?: ComponentTokens
}

export interface DesignTokensMeta {
  source: string                 // URL of analyzed page
  analyzedAt: string             // ISO timestamp
  confidence: number             // 0-1 analysis confidence score
  version: string                // Token schema version
}

// Typography tokens
export interface TypographyTokens {
  fontFamilies: {
    heading: string
    body: string
    mono?: string
  }
  scale: {
    h1: TypographyScaleToken
    h2: TypographyScaleToken
    h3: TypographyScaleToken
    h4?: TypographyScaleToken
    body: TypographyScaleToken
    bodySmall: TypographyScaleToken
    caption?: TypographyScaleToken
    button: TypographyScaleToken
    link?: TypographyScaleToken
  }
}

export interface TypographyScaleToken {
  fontFamily: string
  fontSize: string               // e.g., "48px"
  fontWeight: string             // e.g., "700"
  lineHeight: string             // e.g., "1.2" or "56px"
  letterSpacing?: string
}

// Color tokens with semantic roles
export interface ColorTokens {
  primary: string                // Main brand/action color
  secondary?: string             // Secondary accent
  accent?: string                // Highlight color
  background: {
    default: string              // Page background
    surface: string              // Card/modal background
    muted?: string               // Subtle backgrounds
    inverse?: string             // Dark mode or contrast
  }
  text: {
    default: string              // Primary text
    muted: string                // Secondary text
    inverse?: string             // Text on dark backgrounds
    link?: string                // Link color
  }
  border: string                 // Default border color
  error?: string
  success?: string
  warning?: string
}

// Spacing tokens
export interface SpacingTokens {
  unit: number                   // Base unit (typically 4 or 8)
  scale: number[]                // e.g., [4, 8, 12, 16, 24, 32, 48, 64]
}

// Border radius tokens
export interface RadiiTokens {
  none: string                   // "0px"
  sm: string                     // Small (e.g., "4px")
  md: string                     // Medium (e.g., "8px")
  lg: string                     // Large (e.g., "16px")
  xl?: string                    // Extra large
  full: string                   // Fully rounded (e.g., "9999px")
}

// Shadow tokens
export interface ShadowTokens {
  none?: string
  sm?: string                    // Subtle shadow
  md?: string                    // Medium shadow
  lg?: string                    // Large shadow
  xl?: string                    // Extra large
}

// Component-specific tokens (optional)
export interface ComponentTokens {
  button?: {
    primary: ComponentVariantStyles
    secondary?: ComponentVariantStyles
    ghost?: ComponentVariantStyles
  }
  card?: {
    default: ComponentVariantStyles
  }
  input?: {
    default: ComponentVariantStyles
  }
}

export interface ComponentVariantStyles {
  background: string
  color: string
  padding: string
  borderRadius: string
  border?: string
  boxShadow?: string
  fontSize?: string
  fontWeight?: string
}

// ===========================================
// UTILITY TYPES
// ===========================================

/**
 * RGB color representation for color manipulation
 */
export interface RGBColor {
  r: number
  g: number
  b: number
  a?: number
}

/**
 * HSL color representation for role inference
 */
export interface HSLColor {
  h: number                      // Hue 0-360
  s: number                      // Saturation 0-100
  l: number                      // Lightness 0-100
}

/**
 * Color with metadata for analysis
 */
export interface AnalyzedColor {
  hex: string
  rgb: RGBColor
  hsl: HSLColor
  frequency: number
  sources: ColorSample['source'][]
  luminance: number              // For contrast calculation
}

/**
 * Output format options for generators
 */
export type OutputFormat = 'json' | 'css' | 'markdown' | 'all'

/**
 * Generator output bundle
 */
export interface DesignForensicsOutput {
  tokens: DesignTokens
  json: string                   // design-tokens.json content
  css: string                    // tokens.css content
  markdown: string               // design-summary.md content
}

// ===========================================
// DATABASE TYPES
// ===========================================

/**
 * Design analysis stored in snappy_normalized_snapshots.design_analysis
 */
export interface StoredDesignAnalysis {
  tokens: DesignTokens
  capturedAt: string
  version: string
}
