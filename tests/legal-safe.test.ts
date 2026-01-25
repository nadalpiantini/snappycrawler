import { describe, it, expect } from 'vitest'
import { sanitizeSnapshot, LegalSafeSnapshot } from '../lib/legal-safe'

describe('sanitizeSnapshot - Legal-Safe Mode', () => {
  const mockNormalizedSnapshot = {
    meta: {
      source: 'https://branded-site.com',
      title: 'Amazing Product - Sign Up Now',
      captured_at: '2025-01-25T10:00:00Z'
    },
    sections: [
      { type: 'content', label: 'Welcome to Amazing Product' },
      { type: 'content', label: '© 2024 Amazing Company Inc' }
    ],
    components: [
      {
        type: 'form',
        behavior: 'auth',
        fields: [
          { name: 'user_email', type: 'email' },
          { name: 'user_password', type: 'password' }
        ]
      }
    ],
    ux_flows: [
      { step: 1, action: 'click', target: 'BUTTON', label: 'Sign up for free' }
    ]
  }

  it('should create legal-safe structure', () => {
    const result = sanitizeSnapshot(mockNormalizedSnapshot)

    expect(result).toHaveProperty('meta')
    expect(result).toHaveProperty('structure')
    expect(result).toHaveProperty('components')
    expect(result).toHaveProperty('ux_flows')
    expect(result).toHaveProperty('sections')
  })

  it('should redact title', () => {
    const result = sanitizeSnapshot(mockNormalizedSnapshot)

    expect(result.meta.title).toBe('[SANITIZED]')
  })

  it('should set legal_mode flag to true', () => {
    const result = sanitizeSnapshot(mockNormalizedSnapshot)

    expect(result.meta.legal_mode).toBe(true)
  })

  it('should preserve metadata source and timestamp', () => {
    const result = sanitizeSnapshot(mockNormalizedSnapshot)

    expect(result.meta.source).toBe('https://branded-site.com')
    expect(result.meta.captured_at).toBe('2025-01-25T10:00:00Z')
  })

  it('should analyze structure correctly', () => {
    const result = sanitizeSnapshot(mockNormalizedSnapshot)

    expect(result.structure.has_auth).toBe(true)
    expect(result.structure.has_checkout).toBe(false)
    expect(result.structure.has_navigation).toBe(false)
  })

  it('should normalize field names', () => {
    const result = sanitizeSnapshot(mockNormalizedSnapshot)

    const formComponent = result.components.find(c => c.type === 'form')
    expect(formComponent).toBeDefined()

    expect(formComponent!.fields[0].name).toBe('field_email')
    expect(formComponent!.fields[1].name).toBe('field_password')
  })

  it('should preserve field types', () => {
    const result = sanitizeSnapshot(mockNormalizedSnapshot)

    const formComponent = result.components.find(c => c.type === 'form')
    expect(formComponent).toBeDefined()

    expect(formComponent!.fields[0].type).toBe('email')
    expect(formComponent!.fields[1].type).toBe('password')
  })

  it('should sanitize UX flow labels', () => {
    const result = sanitizeSnapshot(mockNormalizedSnapshot)

    expect(result.ux_flows[0].label).toBe('Register')
    expect(result.ux_flows[0].label).not.toContain('Sign up for free')
  })

  it('should sanitize section labels', () => {
    const result = sanitizeSnapshot(mockNormalizedSnapshot)

    // Should remove copyright notices
    const hasCopyright = result.sections.some(s =>
      s.label.includes('©') || s.label.includes('copyright')
    )
    expect(hasCopyright).toBe(false)
  })

  it('should redact brand names from sections', () => {
    const result = sanitizeSnapshot(mockNormalizedSnapshot)

    // Brand names should be replaced
    const brandedSection = result.sections.find(s =>
      s.label.includes('Amazing Product')
    )
    expect(brandedSection).toBeUndefined()
  })

  it('should preserve UX flow structure', () => {
    const result = sanitizeSnapshot(mockNormalizedSnapshot)

    expect(result.ux_flows).toHaveLength(1)
    expect(result.ux_flows[0]).toMatchObject({
      step: 1,
      action: 'click',
      target: 'BUTTON'
    })
  })

  it('should handle unknown field names', () => {
    const snapshotWithUnknownFields = {
      ...mockNormalizedSnapshot,
      components: [
        {
          type: 'form',
          behavior: 'custom',
          fields: [
            { name: 'unknown_custom_field', type: 'text' },
            { name: '', type: 'text' }
          ]
        }
      ]
    }

    const result = sanitizeSnapshot(snapshotWithUnknownFields)

    expect(result.components[0].fields[0].name).toBe('field_custom')
    expect(result.components[0].fields[1].name).toBe('field_unknown')
  })

  it('should replace common copy with generic alternatives', () => {
    const testCases = [
      { input: 'Sign up', expected: 'Register' },
      { input: 'Log in', expected: 'Login' },
      { input: 'Get started', expected: 'Start' },
      { input: 'Subscribe', expected: 'Join' }
    ]

    testCases.forEach(({ input, expected }) => {
      const testSnapshot = {
        ...mockNormalizedSnapshot,
        ux_flows: [{ step: 1, action: 'click', target: 'BUTTON', label: input }]
      }

      const result = sanitizeSnapshot(testSnapshot)
      expect(result.ux_flows[0].label).toBe(expected)
    })
  })

  it('should handle empty components array', () => {
    const emptySnapshot = {
      ...mockNormalizedSnapshot,
      components: []
    }

    const result = sanitizeSnapshot(emptySnapshot)
    expect(result.components).toEqual([])
  })

  it('should detect navigation components', () => {
    const navSnapshot = {
      ...mockNormalizedSnapshot,
      components: [
        { type: 'nav', behavior: 'navigation', inferred: true }
      ]
    }

    const result = sanitizeSnapshot(navSnapshot)
    expect(result.structure.has_navigation).toBe(true)
  })

  it('should detect checkout/payment forms', () => {
    const checkoutSnapshot = {
      ...mockNormalizedSnapshot,
      components: [
        { type: 'form', behavior: 'payment', fields: [] }
      ]
    }

    const result = sanitizeSnapshot(checkoutSnapshot)
    expect(result.structure.has_checkout).toBe(true)
  })
})
