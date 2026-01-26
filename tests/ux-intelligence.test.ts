import { describe, it, expect } from 'vitest'
import {
  analyzeUX,
  validateCapturedData,
  getCaptureSummary,
  getDefaultUXAnalysis,
  analyzeCTAs,
  getDefaultCTAAnalysis,
  analyzeForms,
  getDefaultFormAnalysis,
  detectUserFlows,
  analyzeNavigation,
  detectPageType,
  getDefaultUserFlowAnalysis,
  getDefaultNavigationAnalysis,
  generateAllOutputs,
  generateUXJSON,
  generateUXMarkdown,
  generateUXChecklist,
  generateUXSummary,
  type CapturedUXData,
  type InteractionElement,
  type CapturedForm,
  type NavigationElement
} from '../lib/ux-intelligence'

// ============================================
// Mock Data
// ============================================

const mockInteractions: InteractionElement[] = [
  {
    type: 'button',
    tag: 'button',
    text: 'Sign Up Free',
    href: undefined,
    id: 'signup-btn',
    className: 'btn-primary',
    ariaLabel: 'Sign up for free account',
    role: 'button',
    position: { x: 100, y: 200, width: 150, height: 50, viewportPosition: 'above-fold' },
    styles: {
      backgroundColor: 'rgb(99, 102, 241)',
      color: 'rgb(255, 255, 255)',
      fontSize: '16px',
      fontWeight: '600',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    isVisible: true,
    isDisabled: false
  },
  {
    type: 'button',
    tag: 'button',
    text: 'Log In',
    href: undefined,
    id: 'login-btn',
    className: 'btn-secondary',
    ariaLabel: null,
    role: 'button',
    position: { x: 260, y: 200, width: 100, height: 50, viewportPosition: 'above-fold' },
    styles: {
      backgroundColor: 'transparent',
      color: 'rgb(99, 102, 241)',
      fontSize: '16px',
      fontWeight: '500',
      padding: '12px 24px',
      borderRadius: '8px',
      border: '1px solid rgb(99, 102, 241)',
      boxShadow: 'none'
    },
    isVisible: true,
    isDisabled: false
  },
  {
    type: 'link',
    tag: 'a',
    text: 'Learn More',
    href: 'https://example.com/features',
    id: null,
    className: 'text-link',
    ariaLabel: null,
    role: null,
    position: { x: 100, y: 400, width: 80, height: 24, viewportPosition: 'above-fold' },
    styles: {
      backgroundColor: 'transparent',
      color: 'rgb(99, 102, 241)',
      fontSize: '14px',
      fontWeight: '400',
      padding: '0',
      borderRadius: '0',
      border: 'none'
    },
    isVisible: true,
    isDisabled: false
  },
  {
    type: 'link',
    tag: 'a',
    text: 'Buy Now',
    href: 'https://example.com/checkout',
    id: 'buy-btn',
    className: 'btn-purchase',
    ariaLabel: null,
    role: null,
    position: { x: 100, y: 1200, width: 140, height: 48, viewportPosition: 'below-fold' },
    styles: {
      backgroundColor: 'rgb(34, 197, 94)',
      color: 'rgb(255, 255, 255)',
      fontSize: '18px',
      fontWeight: '700',
      padding: '14px 28px',
      borderRadius: '12px',
      border: 'none'
    },
    isVisible: true,
    isDisabled: false
  }
]

const mockForms: CapturedForm[] = [
  {
    id: 'login-form',
    action: '/api/auth/login',
    method: 'POST',
    fields: [
      { type: 'email', name: 'email', id: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true, autocomplete: 'email', pattern: null, minLength: null, maxLength: null },
      { type: 'password', name: 'password', id: 'password', label: 'Password', placeholder: '••••••••', required: true, autocomplete: 'current-password', pattern: null, minLength: 8, maxLength: null }
    ],
    submitButton: { type: 'button', tag: 'button', text: 'Sign In' },
    position: { x: 100, y: 300, width: 400, height: 300, viewportPosition: 'above-fold' }
  },
  {
    id: 'newsletter-form',
    action: '/api/subscribe',
    method: 'POST',
    fields: [
      { type: 'email', name: 'email', id: 'newsletter-email', label: null, placeholder: 'Enter your email', required: true, autocomplete: 'email', pattern: null, minLength: null, maxLength: null }
    ],
    submitButton: { type: 'button', tag: 'button', text: 'Subscribe' },
    position: { x: 100, y: 1500, width: 400, height: 100, viewportPosition: 'below-fold' }
  }
]

const mockNavigation: NavigationElement[] = [
  {
    type: 'nav',
    items: [
      { text: 'Home', href: '/', isActive: true, hasDropdown: false },
      { text: 'Features', href: '/features', isActive: false, hasDropdown: true },
      { text: 'Pricing', href: '/pricing', isActive: false, hasDropdown: false },
      { text: 'About', href: '/about', isActive: false, hasDropdown: false }
    ],
    position: { x: 0, y: 0, width: 1200, height: 60, viewportPosition: 'above-fold' },
    isSticky: true
  }
]

const mockCapturedData: CapturedUXData = {
  interactions: mockInteractions,
  forms: mockForms,
  navigation: mockNavigation,
  modals: [],
  media: [
    { type: 'image', src: 'https://example.com/hero.jpg', alt: 'Hero image', dimensions: { width: 1200, height: 600 }, isLazyLoaded: false },
    { type: 'image', src: 'https://example.com/feature.png', alt: null, dimensions: { width: 400, height: 300 }, isLazyLoaded: true }
  ],
  accessibility: {
    hasSkipLink: true,
    landmarkRegions: ['main', 'nav', 'header', 'footer'],
    headingStructure: [
      { level: 1, count: 1, examples: ['Welcome to Our Platform'] },
      { level: 2, count: 3, examples: ['Features', 'Testimonials'] },
      { level: 3, count: 5, examples: ['Fast', 'Secure'] }
    ],
    focusableElements: 25,
    ariaLabelsCount: 8,
    imagesWithAlt: 5,
    imagesWithoutAlt: 1,
    colorContrastIssues: 0
  }
}

// ============================================
// CTA Detector Tests
// ============================================
describe('analyzeCTAs', () => {
  it('should return default analysis for empty input', () => {
    const result = analyzeCTAs([])

    expect(result.primary).toBeNull()
    expect(result.secondary).toEqual([])
    expect(result.tertiary).toEqual([])
    expect(result.stats.totalCount).toBe(0)
  })

  it('should identify primary CTA', () => {
    const result = analyzeCTAs(mockInteractions)

    expect(result.primary).not.toBeNull()
    expect(result.primary?.type).toBe('signup')
    expect(result.primary?.text).toBe('Sign Up Free')
  })

  it('should classify CTA types correctly', () => {
    const result = analyzeCTAs(mockInteractions)

    // Primary is signup
    expect(result.primary?.type).toBe('signup')

    // Should detect login and learn-more
    const types = [result.primary?.type, ...result.secondary.map(c => c.type), ...result.tertiary.map(c => c.type)]
    expect(types).toContain('signup')
    expect(types).toContain('login')
    expect(types).toContain('learn-more')
    expect(types).toContain('purchase')
  })

  it('should calculate confidence scores', () => {
    const result = analyzeCTAs(mockInteractions)

    expect(result.primary?.confidence).toBeGreaterThan(0)
    expect(result.primary?.confidence).toBeLessThanOrEqual(1)
  })

  it('should detect urgency levels', () => {
    const urgentCTA: InteractionElement = {
      ...mockInteractions[0],
      text: 'Buy Now - Limited Time Only!'
    }

    const result = analyzeCTAs([urgentCTA])

    expect(result.primary?.urgency).toBe('high')
  })

  it('should analyze CTA styling', () => {
    const result = analyzeCTAs(mockInteractions)

    expect(result.primary?.styling).toHaveProperty('prominence')
    expect(result.primary?.styling).toHaveProperty('style')
    expect(result.primary?.styling).toHaveProperty('size')
  })

  it('should track CTA statistics', () => {
    const result = analyzeCTAs(mockInteractions)

    expect(result.stats.totalCount).toBeGreaterThan(0)
    expect(result.stats.aboveFold).toBeGreaterThanOrEqual(0)
    expect(result.stats.belowFold).toBeGreaterThanOrEqual(0)
  })

  it('should skip disabled elements', () => {
    const disabledCTA: InteractionElement = {
      ...mockInteractions[0],
      isDisabled: true
    }

    const result = analyzeCTAs([disabledCTA])

    expect(result.primary).toBeNull()
  })
})

describe('getDefaultCTAAnalysis', () => {
  it('should return valid default structure', () => {
    const result = getDefaultCTAAnalysis()

    expect(result.primary).toBeNull()
    expect(result.secondary).toEqual([])
    expect(result.tertiary).toEqual([])
    expect(result.stats).toBeDefined()
  })
})

// ============================================
// Form Analyzer Tests
// ============================================
describe('analyzeForms', () => {
  it('should return default analysis for empty input', () => {
    const result = analyzeForms([])

    expect(result.forms).toEqual([])
    expect(result.stats.totalForms).toBe(0)
  })

  it('should detect form types', () => {
    const result = analyzeForms(mockForms)

    expect(result.forms.length).toBe(2)
    expect(result.forms[0].type).toBe('login')
    expect(result.forms[1].type).toBe('newsletter')
  })

  it('should analyze field purposes', () => {
    const result = analyzeForms(mockForms)

    const loginForm = result.forms[0]
    expect(loginForm.fields.length).toBe(2)
    expect(loginForm.fields[0].purpose).toBe('email')
    expect(loginForm.fields[1].purpose).toBe('password')
  })

  it('should calculate UX scores', () => {
    const result = analyzeForms(mockForms)

    result.forms.forEach(form => {
      expect(form.uxScore).toBeGreaterThanOrEqual(0)
      expect(form.uxScore).toBeLessThanOrEqual(100)
    })
  })

  it('should detect form validation', () => {
    const result = analyzeForms(mockForms)

    expect(result.forms[0].validation.hasRequiredFields).toBe(true)
  })

  it('should identify form issues', () => {
    const formWithIssues: CapturedForm[] = [{
      id: 'bad-form',
      action: '/submit',
      method: 'POST',
      fields: [
        { type: 'text', name: 'field1', id: 'f1', label: null, placeholder: 'Enter value', required: false, autocomplete: null, pattern: null, minLength: null, maxLength: null },
        { type: 'text', name: 'field2', id: 'f2', label: null, placeholder: null, required: false, autocomplete: null, pattern: null, minLength: null, maxLength: null }
      ],
      submitButton: null,
      position: { x: 0, y: 0, width: 300, height: 200, viewportPosition: 'above-fold' }
    }]

    const result = analyzeForms(formWithIssues)

    expect(result.forms[0].issues.length).toBeGreaterThan(0)
    expect(result.forms[0].issues.some(i => i.type === 'accessibility')).toBe(true)
  })

  it('should calculate form statistics', () => {
    const result = analyzeForms(mockForms)

    expect(result.stats.totalForms).toBe(2)
    expect(result.stats.hasPasswordField).toBe(true)
    expect(result.stats.hasPaymentFields).toBe(false)
  })

  it('should detect payment forms', () => {
    const paymentForm: CapturedForm = {
      id: 'payment-form',
      action: '/checkout',
      method: 'POST',
      fields: [
        { type: 'text', name: 'card_number', id: 'card', label: 'Card Number', placeholder: '1234 5678 9012 3456', required: true, autocomplete: 'cc-number', pattern: null, minLength: null, maxLength: null },
        { type: 'text', name: 'expiry', id: 'exp', label: 'Expiry', placeholder: 'MM/YY', required: true, autocomplete: 'cc-exp', pattern: null, minLength: null, maxLength: null },
        { type: 'text', name: 'cvv', id: 'cvv', label: 'CVV', placeholder: '123', required: true, autocomplete: 'cc-csc', pattern: null, minLength: null, maxLength: null }
      ],
      submitButton: { type: 'button', tag: 'button', text: 'Pay Now' },
      position: { x: 0, y: 0, width: 400, height: 300, viewportPosition: 'above-fold' }
    }

    const result = analyzeForms([paymentForm])

    expect(result.forms[0].type).toBe('payment')
    expect(result.stats.hasPaymentFields).toBe(true)
  })
})

describe('getDefaultFormAnalysis', () => {
  it('should return valid default structure', () => {
    const result = getDefaultFormAnalysis()

    expect(result.forms).toEqual([])
    expect(result.patterns).toEqual([])
    expect(result.stats.totalForms).toBe(0)
  })
})

// ============================================
// User Flow & Navigation Tests
// ============================================
describe('analyzeNavigation', () => {
  it('should return default analysis for empty input', () => {
    const result = analyzeNavigation([])

    expect(result.primary).toBeNull()
    expect(result.secondary).toEqual([])
  })

  it('should identify primary navigation', () => {
    const result = analyzeNavigation(mockNavigation)

    expect(result.primary).not.toBeNull()
    expect(result.primary?.items.length).toBe(4)
  })

  it('should detect sticky navigation', () => {
    const result = analyzeNavigation(mockNavigation)

    expect(result.primary?.isSticky).toBe(true)
  })

  it('should identify active items', () => {
    const result = analyzeNavigation(mockNavigation)

    expect(result.primary?.items[0].isActive).toBe(true)
  })

  it('should detect dropdown menus', () => {
    const result = analyzeNavigation(mockNavigation)

    const featuresItem = result.primary?.items.find(i => i.text === 'Features')
    expect(featuresItem?.hasSubmenu).toBe(true)
  })

  it('should calculate navigation statistics', () => {
    const result = analyzeNavigation(mockNavigation)

    expect(result.stats.totalLinks).toBeGreaterThan(0)
  })
})

describe('detectUserFlows', () => {
  it('should detect primary user flow', () => {
    const ctas = analyzeCTAs(mockInteractions)
    const forms = analyzeForms(mockForms)
    const navigation = analyzeNavigation(mockNavigation)

    const result = detectUserFlows(ctas, forms, navigation)

    expect(result.primaryFlow).not.toBeNull()
  })

  it('should identify entry points', () => {
    const ctas = analyzeCTAs(mockInteractions)
    const forms = analyzeForms(mockForms)
    const navigation = analyzeNavigation(mockNavigation)

    const result = detectUserFlows(ctas, forms, navigation)

    expect(result.entryPoints.length).toBeGreaterThan(0)
  })

  it('should build conversion funnel', () => {
    const ctas = analyzeCTAs(mockInteractions)
    const forms = analyzeForms(mockForms)
    const navigation = analyzeNavigation(mockNavigation)

    const result = detectUserFlows(ctas, forms, navigation)

    if (result.conversionFunnel) {
      expect(result.conversionFunnel.stages.length).toBeGreaterThan(0)
    }
  })
})

describe('detectPageType', () => {
  it('should detect landing page', () => {
    const ctas = analyzeCTAs(mockInteractions)
    const forms = analyzeForms(mockForms)
    const navigation = analyzeNavigation(mockNavigation)

    const result = detectPageType(ctas, forms, navigation)

    // With signup CTA and login form, should be landing or auth
    expect(['landing', 'auth']).toContain(result)
  })

  it('should detect checkout page', () => {
    const checkoutCTA: InteractionElement = {
      ...mockInteractions[0],
      text: 'Proceed to Checkout'
    }
    const checkoutForm: CapturedForm = {
      ...mockForms[0],
      fields: [
        { type: 'text', name: 'card_number', id: 'card', label: 'Card', placeholder: null, required: true, autocomplete: null, pattern: null, minLength: null, maxLength: null },
        { type: 'text', name: 'address', id: 'addr', label: 'Address', placeholder: null, required: true, autocomplete: null, pattern: null, minLength: null, maxLength: null }
      ]
    }

    const ctas = analyzeCTAs([checkoutCTA])
    const forms = analyzeForms([checkoutForm])
    const navigation = analyzeNavigation([])

    const result = detectPageType(ctas, forms, navigation)

    // With checkout CTA and address/card fields, should detect checkout or related page type
    expect(['checkout', 'payment', 'product']).toContain(result)
  })
})

// ============================================
// Main Analyzer Tests
// ============================================
describe('analyzeUX', () => {
  it('should return complete UX analysis', () => {
    const result = analyzeUX(mockCapturedData, 'https://example.com')

    expect(result).toHaveProperty('meta')
    expect(result).toHaveProperty('ctas')
    expect(result).toHaveProperty('forms')
    expect(result).toHaveProperty('navigation')
    expect(result).toHaveProperty('userFlows')
    expect(result).toHaveProperty('accessibility')
    expect(result).toHaveProperty('patterns')
    expect(result).toHaveProperty('recommendations')
  })

  it('should include metadata', () => {
    const result = analyzeUX(mockCapturedData, 'https://example.com')

    expect(result.meta.source).toBe('https://example.com')
    expect(result.meta.analyzedAt).toBeDefined()
    expect(result.meta.confidence).toBeGreaterThan(0)
    expect(result.meta.version).toBe('1.0.0')
    expect(result.meta.pageType).toBeDefined()
  })

  it('should analyze accessibility', () => {
    const result = analyzeUX(mockCapturedData, 'https://example.com')

    expect(result.accessibility.score).toBeGreaterThan(0)
    expect(result.accessibility.level).toBeDefined()
    expect(result.accessibility.stats.hasSkipLinks).toBe(true)
    expect(result.accessibility.stats.hasLandmarks).toBe(true)
  })

  it('should detect patterns', () => {
    const result = analyzeUX(mockCapturedData, 'https://example.com')

    expect(result.patterns).toHaveProperty('layout')
    expect(result.patterns).toHaveProperty('interaction')
    expect(result.patterns).toHaveProperty('content')
    expect(result.patterns).toHaveProperty('engagement')
  })

  it('should generate recommendations', () => {
    const result = analyzeUX(mockCapturedData, 'https://example.com')

    expect(Array.isArray(result.recommendations)).toBe(true)
    result.recommendations.forEach(rec => {
      expect(rec).toHaveProperty('category')
      expect(rec).toHaveProperty('priority')
      expect(rec).toHaveProperty('title')
      expect(rec).toHaveProperty('description')
    })
  })

  it('should calculate overall confidence', () => {
    const result = analyzeUX(mockCapturedData, 'https://example.com')

    expect(result.meta.confidence).toBeGreaterThanOrEqual(0)
    expect(result.meta.confidence).toBeLessThanOrEqual(1)
  })

  it('should handle minimal data', () => {
    const minimalData: CapturedUXData = {
      interactions: [],
      forms: [],
      navigation: [],
      modals: [],
      media: [],
      accessibility: {
        hasSkipLink: false,
        landmarkRegions: [],
        headingStructure: [],
        focusableElements: 0,
        ariaLabelsCount: 0,
        imagesWithAlt: 0,
        imagesWithoutAlt: 0,
        colorContrastIssues: 0
      }
    }

    const result = analyzeUX(minimalData, 'https://example.com')

    // Minimal data gets minimum confidence floor of 0.1
    expect(result.meta.confidence).toBe(0.1)
    expect(result.ctas.primary).toBeNull()
  })
})

describe('validateCapturedData', () => {
  it('should return true for valid data', () => {
    expect(validateCapturedData(mockCapturedData)).toBe(true)
  })

  it('should return false for null', () => {
    expect(validateCapturedData(null as any)).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(validateCapturedData(undefined as any)).toBe(false)
  })

  it('should return false for completely empty data', () => {
    const emptyData: CapturedUXData = {
      interactions: [],
      forms: [],
      navigation: [],
      modals: [],
      media: [],
      accessibility: null as any  // Truly empty - no accessibility data
    }

    // Should return false if no data at all
    expect(validateCapturedData(emptyData)).toBe(false)
  })

  it('should return true if accessibility data present', () => {
    const dataWithAccessibility: CapturedUXData = {
      interactions: [],
      forms: [],
      navigation: [],
      modals: [],
      media: [],
      accessibility: {
        hasSkipLink: false,
        landmarkRegions: [],
        headingStructure: [],
        focusableElements: 0,
        ariaLabelsCount: 0,
        imagesWithAlt: 0,
        imagesWithoutAlt: 0,
        colorContrastIssues: 0
      }
    }

    // Presence of accessibility object counts as having data
    expect(validateCapturedData(dataWithAccessibility)).toBe(true)
  })

  it('should return true if at least one data type present', () => {
    const dataWithInteractions: CapturedUXData = {
      interactions: mockInteractions,
      forms: [],
      navigation: [],
      modals: [],
      media: [],
      accessibility: {
        hasSkipLink: false,
        landmarkRegions: [],
        headingStructure: [],
        focusableElements: 0,
        ariaLabelsCount: 0,
        imagesWithAlt: 0,
        imagesWithoutAlt: 0,
        colorContrastIssues: 0
      }
    }

    expect(validateCapturedData(dataWithInteractions)).toBe(true)
  })
})

describe('getCaptureSummary', () => {
  it('should return counts of captured elements', () => {
    const summary = getCaptureSummary(mockCapturedData)

    expect(summary.interactions).toBe(mockInteractions.length)
    expect(summary.forms).toBe(mockForms.length)
    expect(summary.navigation).toBe(mockNavigation.length)
    expect(summary.hasAccessibility).toBe(true)
  })

  it('should handle empty data', () => {
    const emptyData: CapturedUXData = {
      interactions: [],
      forms: [],
      navigation: [],
      modals: [],
      media: [],
      accessibility: null as any
    }

    const summary = getCaptureSummary(emptyData)

    expect(summary.interactions).toBe(0)
    expect(summary.forms).toBe(0)
    expect(summary.hasAccessibility).toBe(false)
  })
})

describe('getDefaultUXAnalysis', () => {
  it('should return valid default structure', () => {
    const result = getDefaultUXAnalysis('https://example.com')

    expect(result.meta.source).toBe('https://example.com')
    expect(result.meta.confidence).toBe(0)
    expect(result.ctas.primary).toBeNull()
    expect(result.forms.forms).toEqual([])
  })
})

// ============================================
// Output Generator Tests
// ============================================
describe('generateUXJSON', () => {
  it('should generate valid JSON string', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const json = generateUXJSON(analysis)

    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('should include all analysis sections', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const json = generateUXJSON(analysis)
    const parsed = JSON.parse(json)

    expect(parsed).toHaveProperty('meta')
    expect(parsed).toHaveProperty('ctas')
    expect(parsed).toHaveProperty('forms')
    expect(parsed).toHaveProperty('navigation')
    expect(parsed).toHaveProperty('userFlows')
    expect(parsed).toHaveProperty('accessibility')
  })
})

describe('generateUXMarkdown', () => {
  it('should generate markdown content', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const markdown = generateUXMarkdown(analysis)

    expect(markdown).toContain('# UX Intelligence Report')
  })

  it('should include source information', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const markdown = generateUXMarkdown(analysis)

    expect(markdown).toContain('**Source:** https://example.com')
  })

  it('should include CTA section', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const markdown = generateUXMarkdown(analysis)

    expect(markdown).toContain('## Call-to-Action Analysis')
  })

  it('should include form section', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const markdown = generateUXMarkdown(analysis)

    expect(markdown).toContain('## Form Analysis')
  })

  it('should include accessibility section', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const markdown = generateUXMarkdown(analysis)

    expect(markdown).toContain('## Accessibility Analysis')
    expect(markdown).toContain('**Score:**')
  })

  it('should include recommendations', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const markdown = generateUXMarkdown(analysis)

    expect(markdown).toContain('## Recommendations')
  })
})

describe('generateUXChecklist', () => {
  it('should generate checklist format', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const checklist = generateUXChecklist(analysis)

    expect(checklist).toContain('# UX Checklist')
    expect(checklist).toMatch(/- \[[x ]\]/)
  })

  it('should include CTA checklist items', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const checklist = generateUXChecklist(analysis)

    expect(checklist).toContain('## Call-to-Action')
  })

  it('should include form checklist items', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const checklist = generateUXChecklist(analysis)

    expect(checklist).toContain('## Forms')
  })

  it('should include accessibility checklist items', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const checklist = generateUXChecklist(analysis)

    expect(checklist).toContain('## Accessibility')
  })

  it('should include progress percentage', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const checklist = generateUXChecklist(analysis)

    // Format: **Progress:** X/Y (Z%) - colon inside bold markers
    expect(checklist).toMatch(/\*\*Progress:\*\* \d+\/\d+ \(\d+%\)/)
  })
})

describe('generateUXSummary', () => {
  it('should return summary object', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const summary = generateUXSummary(analysis)

    expect(summary).toHaveProperty('pageType')
    expect(summary).toHaveProperty('confidence')
    expect(summary).toHaveProperty('primaryCTA')
    expect(summary).toHaveProperty('formCount')
    expect(summary).toHaveProperty('accessibilityScore')
    expect(summary).toHaveProperty('accessibilityLevel')
    expect(summary).toHaveProperty('highPriorityIssues')
  })

  it('should include primary CTA text', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const summary = generateUXSummary(analysis)

    expect(summary.primaryCTA).toBe('Sign Up Free')
  })

  it('should count forms correctly', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const summary = generateUXSummary(analysis)

    expect(summary.formCount).toBe(2)
  })
})

describe('generateAllOutputs', () => {
  it('should return all output formats', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const outputs = generateAllOutputs(analysis)

    expect(outputs).toHaveProperty('analysis')
    expect(outputs).toHaveProperty('json')
    expect(outputs).toHaveProperty('markdown')
    expect(outputs).toHaveProperty('checklist')
  })

  it('should preserve original analysis', () => {
    const analysis = analyzeUX(mockCapturedData, 'https://example.com')
    const outputs = generateAllOutputs(analysis)

    expect(outputs.analysis).toBe(analysis)
  })
})

// ============================================
// Integration Tests
// ============================================
describe('UX Intelligence Integration', () => {
  it('should process realistic landing page data', () => {
    const landingPageData: CapturedUXData = {
      interactions: [
        {
          type: 'button',
          tag: 'button',
          text: 'Start Free Trial',
          href: undefined,
          id: 'cta-primary',
          className: 'btn-hero',
          ariaLabel: null,
          role: null,
          position: { x: 500, y: 350, width: 200, height: 56, viewportPosition: 'above-fold' },
          styles: {
            backgroundColor: 'rgb(79, 70, 229)',
            color: 'rgb(255, 255, 255)',
            fontSize: '18px',
            fontWeight: '600',
            padding: '16px 32px',
            borderRadius: '12px',
            border: 'none'
          },
          isVisible: true,
          isDisabled: false
        }
      ],
      forms: [{
        id: 'hero-signup',
        action: '/signup',
        method: 'POST',
        fields: [
          { type: 'email', name: 'email', id: 'email', label: 'Work Email', placeholder: 'you@company.com', required: true, autocomplete: 'email', pattern: null, minLength: null, maxLength: null },
          { type: 'password', name: 'password', id: 'password', label: 'Create Password', placeholder: 'Enter password', required: true, autocomplete: 'new-password', pattern: null, minLength: 8, maxLength: null }
        ],
        submitButton: { type: 'button', tag: 'button', text: 'Get Started' },
        position: { x: 400, y: 400, width: 400, height: 100, viewportPosition: 'above-fold' }
      }],
      navigation: [{
        type: 'nav',
        items: [
          { text: 'Product', href: '/product', isActive: false, hasDropdown: true },
          { text: 'Pricing', href: '/pricing', isActive: false, hasDropdown: false },
          { text: 'Resources', href: '/resources', isActive: false, hasDropdown: true },
          { text: 'Company', href: '/company', isActive: false, hasDropdown: false }
        ],
        position: { x: 0, y: 0, width: 1200, height: 64, viewportPosition: 'above-fold' },
        isSticky: true
      }],
      modals: [],
      media: [],
      accessibility: {
        hasSkipLink: true,
        landmarkRegions: ['main', 'nav', 'header', 'footer'],
        headingStructure: [
          { level: 1, count: 1, examples: ['The Future of Collaboration'] },
          { level: 2, count: 4, examples: ['Why Choose Us', 'Features'] }
        ],
        focusableElements: 30,
        ariaLabelsCount: 12,
        imagesWithAlt: 8,
        imagesWithoutAlt: 0,
        colorContrastIssues: 0
      }
    }

    const analysis = analyzeUX(landingPageData, 'https://startup.io')

    // Page type - with signup form and free trial CTA, could be landing or auth page
    expect(['landing', 'auth']).toContain(analysis.meta.pageType)

    // Primary CTA should be free trial
    expect(analysis.ctas.primary?.type).toBe('free-trial')
    expect(analysis.ctas.primary?.text).toBe('Start Free Trial')

    // Form should be signup type (email + password = signup)
    expect(['signup', 'login']).toContain(analysis.forms.forms[0].type)

    // Accessibility should be good
    expect(analysis.accessibility.score).toBeGreaterThan(70)
    expect(analysis.accessibility.stats.hasSkipLinks).toBe(true)

    // Should generate all outputs
    const outputs = generateAllOutputs(analysis)
    expect(outputs.json).toBeTruthy()
    expect(outputs.markdown).toContain('Start Free Trial')
    expect(outputs.checklist).toContain('[x]')
  })

  it('should process e-commerce checkout data', () => {
    const checkoutData: CapturedUXData = {
      interactions: [
        {
          type: 'button',
          tag: 'button',
          text: 'Place Order',
          href: undefined,
          id: 'submit-order',
          className: 'checkout-submit',
          ariaLabel: 'Complete your purchase',
          role: null,
          position: { x: 700, y: 600, width: 300, height: 60, viewportPosition: 'above-fold' },
          styles: {
            backgroundColor: 'rgb(34, 197, 94)',
            color: 'rgb(255, 255, 255)',
            fontSize: '18px',
            fontWeight: '700',
            padding: '18px 36px',
            borderRadius: '8px',
            border: 'none'
          },
          isVisible: true,
          isDisabled: false
        }
      ],
      forms: [{
        id: 'checkout-form',
        action: '/api/checkout',
        method: 'POST',
        fields: [
          { type: 'email', name: 'email', id: 'email', label: 'Email', placeholder: null, required: true, autocomplete: 'email', pattern: null, minLength: null, maxLength: null },
          { type: 'text', name: 'address', id: 'address', label: 'Shipping Address', placeholder: null, required: true, autocomplete: 'street-address', pattern: null, minLength: null, maxLength: null },
          { type: 'text', name: 'city', id: 'city', label: 'City', placeholder: null, required: true, autocomplete: 'address-level2', pattern: null, minLength: null, maxLength: null },
          { type: 'text', name: 'zip', id: 'zip', label: 'ZIP Code', placeholder: null, required: true, autocomplete: 'postal-code', pattern: null, minLength: null, maxLength: null },
          { type: 'text', name: 'card', id: 'card', label: 'Card Number', placeholder: null, required: true, autocomplete: 'cc-number', pattern: null, minLength: null, maxLength: null }
        ],
        submitButton: { type: 'button', tag: 'button', text: 'Place Order' },
        position: { x: 400, y: 100, width: 500, height: 600, viewportPosition: 'above-fold' }
      }],
      navigation: [],
      modals: [],
      media: [],
      accessibility: {
        hasSkipLink: false,
        landmarkRegions: ['main'],
        headingStructure: [{ level: 1, count: 1, examples: ['Checkout'] }],
        focusableElements: 15,
        ariaLabelsCount: 5,
        imagesWithAlt: 2,
        imagesWithoutAlt: 0,
        colorContrastIssues: 0
      }
    }

    const analysis = analyzeUX(checkoutData, 'https://shop.example.com/checkout')

    // Should detect checkout page
    expect(['checkout', 'payment']).toContain(analysis.meta.pageType)

    // Form should be checkout type
    expect(analysis.forms.forms[0].type).toBe('checkout')

    // Should have payment fields
    expect(analysis.forms.stats.hasPaymentFields).toBe(true)

    // Should flag missing skip link
    expect(analysis.accessibility.stats.hasSkipLinks).toBe(false)
    expect(analysis.accessibility.issues.some(i => i.description.includes('skip'))).toBe(true)
  })
})
