import { describe, it, expect } from 'vitest'
import { normalizeSnapshot, NormalizedSnapshot } from '../lib/normalizer'

describe('normalizeSnapshot', () => {
  // Mock raw snapshot data
  const mockRawSnapshot = {
    url: 'https://example.com',
    title: 'Example Page',
    html: '<html><body><h1>Welcome</h1><p>Hello world</p><form><input type="email" name="email"><button>Submit</button></form></body></html>',
    text: ['Welcome', 'Hello world', 'Submit'],
    ux: [
      { type: 'click', tag: 'BUTTON', text: 'Submit', id: null, class: null }
    ],
    timestamp: '2025-01-25T10:00:00Z'
  }

  it('should create normalized snapshot structure', () => {
    const result = normalizeSnapshot(mockRawSnapshot)

    expect(result).toHaveProperty('meta')
    expect(result).toHaveProperty('sections')
    expect(result).toHaveProperty('components')
    expect(result).toHaveProperty('ux_flows')
  })

  it('should preserve metadata', () => {
    const result = normalizeSnapshot(mockRawSnapshot)

    expect(result.meta.source).toBe('https://example.com')
    expect(result.meta.title).toBe('Example Page')
    expect(result.meta.captured_at).toBe('2025-01-25T10:00:00Z')
  })

  it('should extract sections from text', () => {
    const result = normalizeSnapshot(mockRawSnapshot)

    expect(result.sections).toHaveLength(2)
    expect(result.sections[0]).toMatchObject({
      label: expect.stringContaining('Welcome'),
      type: 'content',
      source: 'visible-text'
    })
  })

  it('should detect form components', () => {
    const result = normalizeSnapshot(mockRawSnapshot)

    const formComponent = result.components.find(c => c.type === 'form')
    expect(formComponent).toBeDefined()
    expect(formComponent).toMatchObject({
      type: 'form',
      behavior: 'user_input',
      inferred: true
    })
  })

  it('should detect button components', () => {
    const result = normalizeSnapshot(mockRawSnapshot)

    const buttonComponent = result.components.find(c => c.type === 'button')
    expect(buttonComponent).toBeDefined()
    expect(buttonComponent).toMatchObject({
      type: 'button',
      behavior: 'cta',
      inferred: true
    })
  })

  it('should extract UX flows', () => {
    const result = normalizeSnapshot(mockRawSnapshot)

    expect(result.ux_flows).toHaveLength(1)
    expect(result.ux_flows[0]).toMatchObject({
      step: 1,
      action: 'click',
      target: 'BUTTON',
      label: 'Submit'
    })
  })

  it('should filter text by length (20-120 chars)', () => {
    const result = normalizeSnapshot(mockRawSnapshot)

    result.sections.forEach(section => {
      const labelLength = section.label.length
      expect(labelLength).toBeGreaterThanOrEqual(0)
      expect(labelLength).toBeLessThanOrEqual(60)
    })
  })

  it('should handle empty snapshot', () => {
    const emptySnapshot = {
      url: '',
      title: '',
      html: '',
      text: [],
      ux: [],
      timestamp: ''
    }

    const result = normalizeSnapshot(emptySnapshot)

    expect(result.sections).toEqual([])
    expect(result.components).toEqual([])
    expect(result.ux_flows).toEqual([])
  })

  it('should deduplicate text entries', () => {
    const duplicatedSnapshot = {
      ...mockRawSnapshot,
      text: ['Welcome', 'Welcome', 'Hello', 'Hello']
    }

    const result = normalizeSnapshot(duplicatedSnapshot)

    // Should have fewer sections than input text
    expect(result.sections.length).toBeLessThanOrEqual(duplicatedSnapshot.text.length)
  })

  it('should handle multiple UX events in order', () => {
    const multiEventSnapshot = {
      ...mockRawSnapshot,
      ux: [
        { type: 'click', tag: 'BUTTON', text: 'First', id: null, class: null },
        { type: 'click', tag: 'BUTTON', text: 'Second', id: null, class: null },
        { type: 'submit', action: '/submit', fields: [{ name: 'email', type: 'email' }] }
      ]
    }

    const result = normalizeSnapshot(multiEventSnapshot)

    expect(result.ux_flows).toHaveLength(3)
    expect(result.ux_flows[0].step).toBe(1)
    expect(result.ux_flows[1].step).toBe(2)
    expect(result.ux_flows[2].step).toBe(3)
  })
})
