// ============================================
// AI CONTEXT PACK - Tests
// ============================================

import { describe, it, expect, beforeEach } from 'vitest'
import {
  analyzeAIContext,
  validateAIContextInput,
  getContextSummary,
  generateAllOutputs,
  generateSystemBriefMarkdown,
  DEFAULT_AI_CONTEXT_CONFIG,
  type AIContextInput,
  type AIContextOutput,
  type SystemBrief,
  type CodeSchema
} from '../lib/ai-context'

describe('AI Context Pack', () => {
  describe('validateAIContextInput', () => {
    it('should accept valid input', () => {
      const input: AIContextInput = {
        snapshot: {
          url: 'https://example.com',
          title: 'Test',
          html: '<html></html>',
          text: [],
          ux: []
        }
      }

      expect(() => validateAIContextInput(input)).not.toThrow()
    })

    it('should reject input without snapshot', () => {
      const input = {} as any

      expect(() => validateAIContextInput(input)).toThrow('AIContextInput requires snapshot')
    })

    it('should reject input without URL', () => {
      const input: AIContextInput = {
        snapshot: {
          url: '',
          title: 'Test',
          html: '<html></html>',
          text: [],
          ux: []
        }
      }

      expect(() => validateAIContextInput(input)).toThrow('Snapshot must contain URL')
    })
  })

  describe('analyzeAIContext', () => {
    let input: AIContextInput

    beforeEach(() => {
      input = {
        snapshot: {
          url: 'https://example.com/product',
          title: 'Product Page',
          html: `
            <html>
            <body>
              <h1>Amazing Product</h1>
              <p>Transform your workflow with our AI-powered solution.</p>
              <button>Buy Now - Limited Offer!</button>
            </body>
            </html>
          `,
          text: ['Amazing Product', 'Transform your workflow', 'Buy Now', 'Limited Offer'],
          ux: [{ type: 'submit', tag: 'button', text: 'Buy Now' }]
        }
      }
    })

    it('should analyze AI context successfully', async () => {
      const result = await analyzeAIContext(input)

      expect(result).toBeDefined()
      expect(result.meta).toBeDefined()
      expect(result.systemBrief).toBeDefined()
      expect(result.constraints).toBeDefined()
      expect(result.codeSchema).toBeDefined()
      expect(result.suggestedTasks).toBeDefined()
      expect(result.systemPrompts).toBeDefined()
    })

    it('should generate system brief', async () => {
      const result = await analyzeAIContext(input)

      expect(result.systemBrief.overview).toBeDefined()
      expect(result.systemBrief.overview.pageTitle).toBe('Product Page')
      expect(result.systemBrief.overview.url).toBe('https://example.com/product')
      expect(result.systemBrief.context).toBeDefined()
      expect(result.systemBrief.objectives).toBeInstanceOf(Array)
      expect(result.systemBrief.constraints).toBeInstanceOf(Array)
      expect(result.systemBrief.assumptions).toBeInstanceOf(Array)
    })

    it('should detect page type', async () => {
      const result = await analyzeAIContext(input)

      expect(result.systemBrief.overview.pageType).toBeDefined()
      expect(['content', 'landing', 'checkout', 'form']).toContain(result.systemBrief.overview.pageType)
    })

    it('should detect primary purpose', async () => {
      const result = await analyzeAIContext(input)

      expect(result.systemBrief.overview.primaryPurpose).toBeDefined()
      expect(typeof result.systemBrief.overview.primaryPurpose).toBe('string')
    })

    it('should extract constraints', async () => {
      const result = await analyzeAIContext(input)

      expect(result.constraints.technical).toBeInstanceOf(Array)
      expect(result.constraints.business).toBeInstanceOf(Array)
      expect(result.constraints.design).toBeInstanceOf(Array)
      expect(result.constraints.negative).toBeInstanceOf(Array)
    })

    it('should have negative constraints', async () => {
      const result = await analyzeAIContext(input)

      expect(result.constraints.negative.length).toBeGreaterThan(0)
      expect(result.constraints.negative[0].category).toBeDefined()
      expect(result.constraints.negative[0].dont).toBeInstanceOf(Array)
    })

    it('should generate code schema', async () => {
      const result = await analyzeAIContext(input)

      expect(result.codeSchema.components).toBeInstanceOf(Array)
      expect(result.codeSchema.utilities).toBeInstanceOf(Array)
      expect(result.codeSchema.hooks).toBeInstanceOf(Array)
      expect(result.codeSchema.types).toBeInstanceOf(Array)
    })

    it('should suggest tasks', async () => {
      const result = await analyzeAIContext(input)

      expect(result.suggestedTasks.implementation).toBeInstanceOf(Array)
      expect(result.suggestedTasks.testing).toBeInstanceOf(Array)
      expect(result.suggestedTasks.documentation).toBeInstanceOf(Array)
      expect(result.suggestedTasks.optimization).toBeInstanceOf(Array)
    })

    it('should generate system prompts', async () => {
      const result = await analyzeAIContext(input)

      expect(result.systemPrompts.developer).toBeDefined()
      expect(result.systemPrompts.designer).toBeDefined()
      expect(result.systemPrompts.pm).toBeDefined()
      expect(result.systemPrompts.llm).toBeDefined()
      expect(result.systemPrompts.generic).toBeDefined()
    })
  })

  describe('generateAllOutputs', () => {
    it('should generate all output formats', async () => {
      const input: AIContextInput = {
        snapshot: {
          url: 'https://example.com',
          title: 'Test',
          html: '<html><body><h1>Test</h1></body></html>',
          text: ['Test'],
          ux: []
        }
      }

      const aiContext = await analyzeAIContext(input)
      const outputs = await generateAllOutputs(aiContext)

      expect(outputs.systemBrief).toBeDefined()
      expect(outputs.constraintsJSON).toBeDefined()
      expect(outputs.codeSchemaJSON).toBeDefined()
      expect(outputs.tasksJSON).toBeDefined()
    })
  })

  describe('generateSystemBriefMarkdown', () => {
    it('should generate markdown brief', async () => {
      const input: AIContextInput = {
        snapshot: {
          url: 'https://example.com',
          title: 'Test Page',
          html: '<html><body><h1>Test</h1></body></html>',
          text: ['Test'],
          ux: []
        }
      }

      const aiContext = await analyzeAIContext(input)
      const markdown = generateSystemBriefMarkdown(aiContext)

      expect(typeof markdown).toBe('string')
      expect(markdown).toContain('# System Brief')
      expect(markdown).toContain('## Overview')
    })
  })

  describe('getContextSummary', () => {
    it('should return summary string', () => {
      const input: AIContextInput = {
        snapshot: {
          url: 'https://example.com',
          title: 'Test',
          html: '<html><body></body></html>',
          text: [],
          ux: []
        },
        targetAudience: 'developer'
      }

      const summary = getContextSummary(input)

      expect(typeof summary).toBe('string')
      expect(summary).toContain('https://example.com')
      expect(summary).toContain('developer')
    })
  })
})
