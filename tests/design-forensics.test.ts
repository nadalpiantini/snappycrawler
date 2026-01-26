import { describe, it, expect } from 'vitest'
import {
  analyzeDesign,
  validateCapturedStyles,
  getCaptureSummary,
  analyzeTypography,
  analyzeColors,
  analyzeSpacing,
  analyzeRadii,
  analyzeShadows,
  generateDesignTokensJSON,
  generateTokensCSS,
  generateDesignSummary,
  generateAllOutputs,
  type CapturedDesignStyles,
  type TypographySample,
  type ColorSample,
  type SpacingSample,
  type EffectsSample
} from '../lib/design-forensics'

// Mock data for tests
const mockTypographySamples: TypographySample[] = [
  { tag: 'h1', fontFamily: 'Inter, sans-serif', fontSize: '48px', fontWeight: '700', lineHeight: '56px', color: 'rgb(0, 0, 0)', sampleText: 'Main Heading' },
  { tag: 'h1', fontFamily: 'Inter, sans-serif', fontSize: '48px', fontWeight: '700', lineHeight: '56px', color: 'rgb(0, 0, 0)', sampleText: 'Another Heading' },
  { tag: 'h2', fontFamily: 'Inter, sans-serif', fontSize: '36px', fontWeight: '600', lineHeight: '44px', color: 'rgb(0, 0, 0)', sampleText: 'Subheading' },
  { tag: 'h3', fontFamily: 'Inter, sans-serif', fontSize: '24px', fontWeight: '600', lineHeight: '32px', color: 'rgb(0, 0, 0)', sampleText: 'Section Title' },
  { tag: 'p', fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '24px', color: 'rgb(51, 51, 51)', sampleText: 'Body text content' },
  { tag: 'p', fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '24px', color: 'rgb(51, 51, 51)', sampleText: 'More body text' },
  { tag: 'button', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '500', lineHeight: '20px', color: 'rgb(255, 255, 255)', sampleText: 'Click Me' }
]

const mockColorSamples: ColorSample[] = [
  { value: 'rgb(255, 255, 255)', source: 'background', element: 'body' },
  { value: 'rgb(255, 255, 255)', source: 'background', element: 'main' },
  { value: 'rgb(248, 249, 250)', source: 'background', element: 'div' },
  { value: 'rgb(26, 26, 26)', source: 'text', element: 'h1' },
  { value: 'rgb(51, 51, 51)', source: 'text', element: 'p' },
  { value: 'rgb(107, 114, 128)', source: 'text', element: 'span' },
  { value: 'rgb(59, 130, 246)', source: 'background', element: 'button' },
  { value: 'rgb(229, 231, 235)', source: 'border', element: 'div' }
]

const mockSpacingSamples: SpacingSample[] = [
  { property: 'padding', value: '16px' },
  { property: 'padding', value: '24px' },
  { property: 'margin', value: '32px' },
  { property: 'gap', value: '8px' },
  { property: 'padding', value: '48px' },
  { property: 'margin', value: '16px 24px' }
]

const mockEffectsSamples: EffectsSample[] = [
  { type: 'border-radius', value: '4px' },
  { type: 'border-radius', value: '8px' },
  { type: 'border-radius', value: '16px' },
  { type: 'box-shadow', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  { type: 'box-shadow', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  { type: 'box-shadow', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
]

const mockCapturedStyles: CapturedDesignStyles = {
  typography: mockTypographySamples,
  colors: mockColorSamples,
  spacing: mockSpacingSamples,
  effects: mockEffectsSamples
}

// ============================================
// Typography Analysis Tests
// ============================================
describe('analyzeTypography', () => {
  it('should return default typography for empty samples', () => {
    const result = analyzeTypography([])

    expect(result.fontFamilies).toHaveProperty('heading')
    expect(result.fontFamilies).toHaveProperty('body')
    expect(result.scale).toHaveProperty('h1')
    expect(result.scale).toHaveProperty('body')
  })

  it('should detect heading font family', () => {
    const result = analyzeTypography(mockTypographySamples)

    expect(result.fontFamilies.heading).toContain('Inter')
  })

  it('should detect body font family', () => {
    const result = analyzeTypography(mockTypographySamples)

    expect(result.fontFamilies.body).toContain('Inter')
  })

  it('should build complete typography scale', () => {
    const result = analyzeTypography(mockTypographySamples)

    expect(result.scale).toHaveProperty('h1')
    expect(result.scale).toHaveProperty('h2')
    expect(result.scale).toHaveProperty('h3')
    expect(result.scale).toHaveProperty('body')
    expect(result.scale).toHaveProperty('button')
  })

  it('should extract font sizes correctly', () => {
    const result = analyzeTypography(mockTypographySamples)

    expect(result.scale.h1.fontSize).toBe('48px')
    expect(result.scale.h2.fontSize).toBe('36px')
    expect(result.scale.body.fontSize).toBe('16px')
  })

  it('should extract font weights correctly', () => {
    const result = analyzeTypography(mockTypographySamples)

    expect(result.scale.h1.fontWeight).toBe('700')
    expect(result.scale.body.fontWeight).toBe('400')
    expect(result.scale.button.fontWeight).toBe('500')
  })

  it('should detect monospace fonts when present', () => {
    const samplesWithMono: TypographySample[] = [
      ...mockTypographySamples,
      { tag: 'code', fontFamily: 'Fira Code, monospace', fontSize: '14px', fontWeight: '400', lineHeight: '20px', color: 'rgb(0, 0, 0)', sampleText: 'code sample' }
    ]

    const result = analyzeTypography(samplesWithMono)

    expect(result.fontFamilies.mono).toBeDefined()
    expect(result.fontFamilies.mono).toContain('Fira Code')
  })
})

// ============================================
// Colors Analysis Tests
// ============================================
describe('analyzeColors', () => {
  it('should return default colors for empty samples', () => {
    const result = analyzeColors([])

    expect(result.primary).toBeDefined()
    expect(result.background.default).toBeDefined()
    expect(result.text.default).toBeDefined()
  })

  it('should detect primary color from saturated elements', () => {
    const result = analyzeColors(mockColorSamples)

    // Blue button should be detected as primary
    expect(result.primary).toMatch(/^#[A-F0-9]{6}$/i)
  })

  it('should detect background colors', () => {
    const result = analyzeColors(mockColorSamples)

    // White should be detected as default background
    expect(result.background.default.toUpperCase()).toBe('#FFFFFF')
    expect(result.background.surface).toBeDefined()
  })

  it('should detect text colors', () => {
    const result = analyzeColors(mockColorSamples)

    expect(result.text.default).toBeDefined()
    expect(result.text.muted).toBeDefined()
  })

  it('should detect border color', () => {
    const result = analyzeColors(mockColorSamples)

    expect(result.border).toBeDefined()
    expect(result.border).toMatch(/^#[A-F0-9]{6}$/i)
  })

  it('should handle hex color input', () => {
    const hexSamples: ColorSample[] = [
      { value: '#FF5733', source: 'background', element: 'button' },
      { value: '#FFFFFF', source: 'background', element: 'body' },
      { value: '#333333', source: 'text', element: 'p' }
    ]

    const result = analyzeColors(hexSamples)

    expect(result.background.default).toBeDefined()
    expect(result.text.default).toBeDefined()
  })

  it('should handle rgba color input', () => {
    const rgbaSamples: ColorSample[] = [
      { value: 'rgba(255, 255, 255, 1)', source: 'background', element: 'body' },
      { value: 'rgba(0, 0, 0, 0.8)', source: 'text', element: 'p' }
    ]

    const result = analyzeColors(rgbaSamples)

    expect(result.background.default).toBeDefined()
    expect(result.text.default).toBeDefined()
  })
})

// ============================================
// Spacing Analysis Tests
// ============================================
describe('analyzeSpacing', () => {
  it('should return default spacing for empty samples', () => {
    const result = analyzeSpacing([])

    expect(result.unit).toBe(4)
    expect(result.scale).toBeInstanceOf(Array)
    expect(result.scale.length).toBeGreaterThan(0)
  })

  it('should detect base unit from samples', () => {
    const result = analyzeSpacing(mockSpacingSamples)

    // Should detect 8 as base unit (8, 16, 24, 32, 48 are all divisible by 8)
    expect([4, 8]).toContain(result.unit)
  })

  it('should generate spacing scale', () => {
    const result = analyzeSpacing(mockSpacingSamples)

    expect(result.scale.length).toBeGreaterThanOrEqual(4)
    expect(result.scale[0]).toBeLessThan(result.scale[1])
  })

  it('should handle shorthand padding values', () => {
    const shorthandSamples: SpacingSample[] = [
      { property: 'padding', value: '16px 24px 16px 24px' },
      { property: 'margin', value: '8px 16px' }
    ]

    const result = analyzeSpacing(shorthandSamples)

    expect(result.scale.length).toBeGreaterThan(0)
  })
})

describe('analyzeRadii', () => {
  it('should return default radii for empty samples', () => {
    const result = analyzeRadii([])

    expect(result.none).toBe('0px')
    expect(result.sm).toBeDefined()
    expect(result.md).toBeDefined()
    expect(result.lg).toBeDefined()
    expect(result.full).toBeDefined()
  })

  it('should detect radii from samples', () => {
    const result = analyzeRadii(mockEffectsSamples)

    expect(result.sm).toMatch(/^\d+px$/)
    expect(result.md).toMatch(/^\d+px$/)
    expect(result.lg).toMatch(/^\d+px$/)
  })

  it('should map values to semantic scale', () => {
    const result = analyzeRadii(mockEffectsSamples)

    // sm should be smaller than md, md smaller than lg
    const sm = parseInt(result.sm)
    const md = parseInt(result.md)
    const lg = parseInt(result.lg)

    expect(sm).toBeLessThanOrEqual(md)
    expect(md).toBeLessThanOrEqual(lg)
  })
})

describe('analyzeShadows', () => {
  it('should return empty object for empty samples', () => {
    const result = analyzeShadows([])

    expect(result).toEqual({})
  })

  it('should categorize shadows by intensity', () => {
    const result = analyzeShadows(mockEffectsSamples)

    expect(result.sm).toBeDefined()
    expect(result.md).toBeDefined()
    expect(result.lg).toBeDefined()
  })

  it('should preserve shadow CSS values', () => {
    const result = analyzeShadows(mockEffectsSamples)

    if (result.sm) {
      expect(result.sm).toContain('rgba')
    }
  })
})

// ============================================
// Main Analyzer Tests
// ============================================
describe('analyzeDesign', () => {
  it('should return complete design tokens', async () => {
    const result = await analyzeDesign(mockCapturedStyles, 'https://example.com')

    expect(result).toHaveProperty('meta')
    expect(result).toHaveProperty('typography')
    expect(result).toHaveProperty('colors')
    expect(result).toHaveProperty('spacing')
    expect(result).toHaveProperty('radii')
    expect(result).toHaveProperty('shadows')
  })

  it('should include metadata', async () => {
    const result = await analyzeDesign(mockCapturedStyles, 'https://example.com')

    expect(result.meta.source).toBe('https://example.com')
    expect(result.meta.analyzedAt).toBeDefined()
    expect(result.meta.confidence).toBeGreaterThan(0)
    expect(result.meta.version).toBe('1.0.0')
  })

  it('should calculate confidence score', async () => {
    const result = await analyzeDesign(mockCapturedStyles, 'https://example.com')

    expect(result.meta.confidence).toBeGreaterThanOrEqual(0)
    expect(result.meta.confidence).toBeLessThanOrEqual(1)
  })

  it('should handle empty captured styles', async () => {
    const emptyStyles: CapturedDesignStyles = {
      typography: [],
      colors: [],
      spacing: [],
      effects: []
    }

    const result = await analyzeDesign(emptyStyles)

    expect(result.meta.confidence).toBe(0)
    expect(result.typography).toBeDefined()
    expect(result.colors).toBeDefined()
  })

  it('should throw error for null input', async () => {
    await expect(analyzeDesign(null as any)).rejects.toThrow('No captured styles provided')
  })
})

describe('validateCapturedStyles', () => {
  it('should return true for valid captured styles', () => {
    expect(validateCapturedStyles(mockCapturedStyles)).toBe(true)
  })

  it('should return false for null', () => {
    expect(validateCapturedStyles(null)).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(validateCapturedStyles(undefined)).toBe(false)
  })

  it('should return false for missing arrays', () => {
    expect(validateCapturedStyles({ typography: [] })).toBe(false)
    expect(validateCapturedStyles({ typography: [], colors: [] })).toBe(false)
  })

  it('should return false for non-array values', () => {
    expect(validateCapturedStyles({
      typography: 'not an array',
      colors: [],
      spacing: [],
      effects: []
    })).toBe(false)
  })
})

describe('getCaptureSummary', () => {
  it('should return sample counts', () => {
    const summary = getCaptureSummary(mockCapturedStyles)

    expect(summary.typographySamples).toBe(mockTypographySamples.length)
    expect(summary.colorSamples).toBe(mockColorSamples.length)
    expect(summary.spacingSamples).toBe(mockSpacingSamples.length)
    expect(summary.effectsSamples).toBe(mockEffectsSamples.length)
  })

  it('should estimate data size', () => {
    const summary = getCaptureSummary(mockCapturedStyles)

    expect(summary.estimatedSize).toMatch(/^\d+(\.\d+)?\s*(B|KB)$/)
  })

  it('should handle empty styles', () => {
    const summary = getCaptureSummary({
      typography: [],
      colors: [],
      spacing: [],
      effects: []
    })

    expect(summary.typographySamples).toBe(0)
    expect(summary.colorSamples).toBe(0)
    expect(summary.estimatedSize).toBe('0 B')
  })
})

// ============================================
// Output Generator Tests
// ============================================
describe('generateDesignTokensJSON', () => {
  it('should generate valid JSON string', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const json = generateDesignTokensJSON(tokens)

    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('should include W3C schema reference', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const json = generateDesignTokensJSON(tokens)
    const parsed = JSON.parse(json)

    expect(parsed.$schema).toBe('https://design-tokens.org/schema.json')
  })

  it('should include color tokens with type', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const json = generateDesignTokensJSON(tokens)
    const parsed = JSON.parse(json)

    expect(parsed.color.primary.$type).toBe('color')
    expect(parsed.color.primary.$value).toMatch(/^#[A-F0-9]{6}$/i)
  })

  it('should include typography tokens', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const json = generateDesignTokensJSON(tokens)
    const parsed = JSON.parse(json)

    expect(parsed.typography.fontFamily.heading.$type).toBe('fontFamily')
    expect(parsed.typography.scale.h1.fontSize.$type).toBe('dimension')
  })

  it('should include spacing tokens', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const json = generateDesignTokensJSON(tokens)
    const parsed = JSON.parse(json)

    expect(parsed.spacing.unit.$type).toBe('dimension')
    expect(parsed.spacing.scale).toBeDefined()
  })
})

describe('generateTokensCSS', () => {
  it('should generate valid CSS', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const css = generateTokensCSS(tokens)

    expect(css).toContain(':root {')
    expect(css).toContain('}')
  })

  it('should include color variables', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const css = generateTokensCSS(tokens)

    expect(css).toContain('--color-primary:')
    expect(css).toContain('--color-background:')
    expect(css).toContain('--color-text:')
  })

  it('should include typography variables', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const css = generateTokensCSS(tokens)

    expect(css).toContain('--font-heading:')
    expect(css).toContain('--font-body:')
    expect(css).toContain('--text-h1:')
  })

  it('should include spacing variables', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const css = generateTokensCSS(tokens)

    expect(css).toContain('--space-1:')
  })

  it('should include radius variables', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const css = generateTokensCSS(tokens)

    expect(css).toContain('--radius-sm:')
    expect(css).toContain('--radius-md:')
    expect(css).toContain('--radius-lg:')
  })

  it('should include shadow variables when present', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const css = generateTokensCSS(tokens)

    // Shadows were in mock data
    expect(css).toContain('--shadow-')
  })
})

describe('generateDesignSummary', () => {
  it('should generate markdown content', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const markdown = generateDesignSummary(tokens)

    expect(markdown).toContain('# Design System Summary')
  })

  it('should include source information', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const markdown = generateDesignSummary(tokens)

    expect(markdown).toContain('**Source**: https://example.com')
  })

  it('should include confidence percentage', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const markdown = generateDesignSummary(tokens)

    expect(markdown).toMatch(/\*\*Confidence\*\*: \d+%/)
  })

  it('should include typography section', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const markdown = generateDesignSummary(tokens)

    expect(markdown).toContain('## Typography')
    expect(markdown).toContain('### Font Families')
  })

  it('should include colors section', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const markdown = generateDesignSummary(tokens)

    expect(markdown).toContain('## Colors')
  })

  it('should include spacing section', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const markdown = generateDesignSummary(tokens)

    expect(markdown).toContain('## Spacing')
    expect(markdown).toContain('**Base Unit**:')
  })

  it('should include generator attribution', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const markdown = generateDesignSummary(tokens)

    expect(markdown).toContain('SnappyCrawler Design Forensics')
  })
})

describe('generateAllOutputs', () => {
  it('should return all output formats', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const outputs = generateAllOutputs(tokens)

    expect(outputs).toHaveProperty('tokens')
    expect(outputs).toHaveProperty('json')
    expect(outputs).toHaveProperty('css')
    expect(outputs).toHaveProperty('markdown')
  })

  it('should preserve original tokens', async () => {
    const tokens = await analyzeDesign(mockCapturedStyles, 'https://example.com')
    const outputs = generateAllOutputs(tokens)

    expect(outputs.tokens).toBe(tokens)
  })
})

// ============================================
// Integration Tests
// ============================================
describe('Design Forensics Integration', () => {
  it('should process real-world-like data', async () => {
    const realisticSamples: CapturedDesignStyles = {
      typography: [
        { tag: 'h1', fontFamily: '"Inter", sans-serif', fontSize: '3rem', fontWeight: '700', lineHeight: '1.2', color: 'rgb(15, 23, 42)', sampleText: 'Welcome' },
        { tag: 'p', fontFamily: '"Inter", sans-serif', fontSize: '1rem', fontWeight: '400', lineHeight: '1.75', color: 'rgb(51, 65, 85)', sampleText: 'Lorem ipsum' },
        { tag: 'button', fontFamily: '"Inter", sans-serif', fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.25rem', color: 'rgb(255, 255, 255)', sampleText: 'Get Started' }
      ],
      colors: [
        { value: 'rgb(255, 255, 255)', source: 'background', element: 'body' },
        { value: 'rgb(248, 250, 252)', source: 'background', element: 'section' },
        { value: 'rgb(15, 23, 42)', source: 'text', element: 'h1' },
        { value: 'rgb(51, 65, 85)', source: 'text', element: 'p' },
        { value: 'rgb(99, 102, 241)', source: 'background', element: 'button' },
        { value: 'rgb(226, 232, 240)', source: 'border', element: 'input' }
      ],
      spacing: [
        { property: 'padding', value: '1rem' },
        { property: 'padding', value: '2rem' },
        { property: 'gap', value: '1.5rem' },
        { property: 'margin', value: '4rem' }
      ],
      effects: [
        { type: 'border-radius', value: '0.375rem' },
        { type: 'border-radius', value: '0.5rem' },
        { type: 'box-shadow', value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' }
      ]
    }

    const tokens = await analyzeDesign(realisticSamples, 'https://startup.io')

    // Should produce valid tokens
    expect(tokens.meta.source).toBe('https://startup.io')
    expect(tokens.meta.confidence).toBeGreaterThan(0)

    // Typography should be extracted
    expect(tokens.typography.fontFamilies.heading).toContain('Inter')

    // Colors should be mapped semantically
    expect(tokens.colors.primary).toMatch(/^#[A-F0-9]{6}$/i)
    expect(tokens.colors.background.default.toUpperCase()).toBe('#FFFFFF')

    // All outputs should be generated
    const outputs = generateAllOutputs(tokens)
    expect(outputs.json).toBeTruthy()
    expect(outputs.css).toBeTruthy()
    expect(outputs.markdown).toBeTruthy()
  })
})
