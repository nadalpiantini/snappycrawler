// ============================================
// BRAIN LLM - Tests
// ============================================

import { describe, it, expect, beforeEach } from 'vitest'
import {
  analyzeWithBrain,
  validateBrainInput,
  getBrainSummary,
  DEFAULT_BRAIN_CONFIG,
  type BrainInput,
  type BrainAnalysis,
  type Insight,
  type Pattern
} from '../lib/brain-llm'

describe('Brain LLM', () => {
  describe('validateBrainInput', () => {
    it('should accept valid input', () => {
      const input: BrainInput = {
        snapshot: {
          url: 'https://example.com',
          title: 'Test',
          html: '<html></html>',
          text: [],
          ux: []
        }
      }

      expect(() => validateBrainInput(input)).not.toThrow()
    })

    it('should reject input without snapshot', () => {
      const input = {} as any

      expect(() => validateBrainInput(input)).toThrow('BrainInput requires snapshot')
    })

    it('should reject input without URL', () => {
      const input: BrainInput = {
        snapshot: {
          url: '',
          title: 'Test',
          html: '<html></html>',
          text: [],
          ux: []
        }
      }

      expect(() => validateBrainInput(input)).toThrow('Snapshot must contain URL')
    })
  })

  describe('analyzeWithBrain', () => {
    let input: BrainInput

    beforeEach(() => {
      // Generate HTML with many elements to trigger DOM complexity insight
      const manyDivs = Array(100).fill('<div class="item">Content</div>').join('')

      input = {
        snapshot: {
          url: 'https://example.com',
          title: 'Complex Page',
          html: `
            <html>
            <body>
              <header>
                <nav>Navigation</nav>
              </header>
              <section class="hero">
                <h1>Hero Section</h1>
                <button>CTA Button</button>
              </section>
              <section>
                <h2>Content Section</h2>
                <p>Content here</p>
                <img src="test.jpg">
                <img src="test2.jpg">
                ${manyDivs}
              </section>
              <footer>Footer</footer>
            </body>
            </html>
          `,
          text: ['Navigation', 'Hero Section', 'CTA Button', 'Content Section', 'Footer'],
          ux: [
            { type: 'click', tag: 'button', text: 'CTA Button' },
            { type: 'submit', tag: 'form', text: 'Submit' }
          ]
        }
      }
    })

    it('should analyze with brain successfully', async () => {
      const result = await analyzeWithBrain(input)

      expect(result).toBeDefined()
      expect(result.meta).toBeDefined()
      expect(result.insights).toBeInstanceOf(Array)
      expect(result.patterns).toBeInstanceOf(Array)
      expect(result.intentInference).toBeDefined()
      expect(result.crossModeFindings).toBeInstanceOf(Array)
      expect(result.explanations).toBeInstanceOf(Array)
    })

    it('should generate insights', async () => {
      const result = await analyzeWithBrain(input)

      expect(result.insights.length).toBeGreaterThan(0)
      result.insights.forEach(insight => {
        expect(insight.id).toBeDefined()
        expect(insight.category).toBeDefined()
        expect(insight.title).toBeDefined()
        expect(insight.confidence).toBeGreaterThanOrEqual(0)
        expect(insight.confidence).toBeLessThanOrEqual(1)
      })
    })

    it('should detect patterns', async () => {
      const result = await analyzeWithBrain(input)

      expect(result.patterns.length).toBeGreaterThanOrEqual(0)
      result.patterns.forEach(pattern => {
        expect(pattern.id).toBeDefined()
        expect(pattern.name).toBeDefined()
        expect(pattern.type).toBeDefined()
      })
    })

    it('should infer intent', async () => {
      const result = await analyzeWithBrain(input)

      expect(result.intentInference.primaryIntent).toBeDefined()
      expect(result.intentInference.secondaryIntents).toBeInstanceOf(Array)
      expect(result.intentInference.confidence).toBeGreaterThan(0)
      expect(result.intentInference.userGoals).toBeInstanceOf(Array)
      expect(result.intentInference.businessGoals).toBeInstanceOf(Array)
    })

    it('should generate cross-mode findings', async () => {
      const result = await analyzeWithBrain(input)

      expect(result.crossModeFindings).toBeInstanceOf(Array)
      result.crossModeFindings.forEach(finding => {
        expect(finding.title).toBeDefined()
        expect(finding.consistency).toBeDefined()
      })
    })

    it('should generate explanations', async () => {
      const result = await analyzeWithBrain(input)

      expect(result.explanations.length).toBeGreaterThan(0)
      result.explanations.forEach(explanation => {
        expect(explanation.topic).toBeDefined()
        expect(explanation.explanation).toBeDefined()
        expect(explanation.complexity).toBeDefined()
      })
    })

    it('should track available modes', async () => {
      const result = await analyzeWithBrain(input)

      expect(result.meta.modesUsed).toBeInstanceOf(Array)
      expect(result.meta.modesUsed).toContain('snapshot')
    })
  })

  describe('getBrainSummary', () => {
    it('should return summary string', () => {
      const input: BrainInput = {
        snapshot: {
          url: 'https://example.com',
          title: 'Test',
          html: '<html><body></body></html>',
          text: [],
          ux: []
        }
      }

      const summary = getBrainSummary(input)

      expect(typeof summary).toBe('string')
      expect(summary).toContain('https://example.com')
    })
  })
})
