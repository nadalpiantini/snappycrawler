// ============================================
// WIREFRAME ENGINE - Tests
// ============================================

import { describe, it, expect, beforeEach } from 'vitest'
import {
  analyzeWireframe,
  validateWireframeInput,
  getAnalysisSummary,
  generateAllOutputs,
  generateASCIIWireframe,
  generateDesignerPrompt,
  DEFAULT_WIREFRAME_CONFIG,
  type WireframeInput,
  type WireframeOutput,
  type VisualBlock,
  type LayoutStructure
} from '../lib/wireframe-engine'

describe('Wireframe Engine', () => {
  describe('validateWireframeInput', () => {
    it('should accept valid input', () => {
      const input: WireframeInput = {
        snapshot: {
          url: 'https://example.com',
          title: 'Test Page',
          html: '<html><body><h1>Test</h1></body></html>',
          text: ['Test'],
          ux: [],
          timestamp: new Date().toISOString()
        }
      }

      expect(() => validateWireframeInput(input)).not.toThrow()
    })

    it('should reject input without snapshot', () => {
      const input = {} as any

      expect(() => validateWireframeInput(input)).toThrow('WireframeInput requires snapshot')
    })

    it('should reject input without URL', () => {
      const input: WireframeInput = {
        snapshot: {
          url: '',
          title: 'Test',
          html: '<html></html>',
          text: [],
          ux: []
        }
      }

      expect(() => validateWireframeInput(input)).toThrow('Snapshot must contain URL')
    })
  })

  describe('analyzeWireframe', () => {
    let input: WireframeInput

    beforeEach(() => {
      input = {
        snapshot: {
          url: 'https://example.com',
          title: 'Test Page',
          html: `
            <html>
            <body>
              <header>Header</header>
              <section class="hero">Hero Content</section>
              <section>Content</section>
              <footer>Footer</footer>
            </body>
            </html>
          `,
          text: ['Header', 'Hero Content', 'Content', 'Footer'],
          ux: [],
          timestamp: new Date().toISOString()
        }
      }
    })

    it('should analyze wireframe successfully', async () => {
      const result = await analyzeWireframe(input)

      expect(result).toBeDefined()
      expect(result.meta).toBeDefined()
      expect(result.structure).toBeDefined()
      expect(result.hierarchy).toBeDefined()
      expect(result.blocks).toBeInstanceOf(Array)
      expect(result.flows).toBeInstanceOf(Array)
      expect(result.rationale).toBeDefined()
    })

    it('should detect header block', async () => {
      const result = await analyzeWireframe(input)

      const headerBlock = result.blocks.find(b => b.type === 'header')
      expect(headerBlock).toBeDefined()
      expect(headerBlock?.label).toBe('Header')
    })

    it('should detect footer block', async () => {
      const result = await analyzeWireframe(input)

      const footerBlock = result.blocks.find(b => b.type === 'footer')
      expect(footerBlock).toBeDefined()
      expect(footerBlock?.label).toBe('Footer')
    })

    it('should detect hero section', async () => {
      const result = await analyzeWireframe(input)

      const heroBlock = result.blocks.find(b => b.type === 'hero')
      expect(heroBlock).toBeDefined()
    })

    it('should detect layout structure', async () => {
      const result = await analyzeWireframe(input)

      expect(result.structure.type).toBeDefined()
      expect(result.structure.columns).toBeGreaterThan(0)
    })

    it('should build hierarchy', async () => {
      const result = await analyzeWireframe(input)

      expect(result.hierarchy.levels).toBeInstanceOf(Array)
      expect(result.hierarchy.tree).toBeDefined()
      expect(result.hierarchy.tree.depth).toBeGreaterThanOrEqual(0)
    })

    it('should generate rationale', async () => {
      const result = await analyzeWireframe(input)

      expect(result.rationale.layoutStrategy).toBeDefined()
      expect(result.rationale.keyPatterns).toBeInstanceOf(Array)
      expect(result.rationale.uxDecisions).toBeInstanceOf(Array)
      expect(result.rationale.recommendations).toBeInstanceOf(Array)
    })
  })

  describe('generateAllOutputs', () => {
    it('should generate all output formats', async () => {
      const input: WireframeInput = {
        snapshot: {
          url: 'https://example.com',
          title: 'Test',
          html: '<html><body><h1>Test</h1></body></html>',
          text: ['Test'],
          ux: []
        }
      }

      const wireframe = await analyzeWireframe(input)
      const outputs = await generateAllOutputs(wireframe)

      expect(outputs.ascii).toBeDefined()
      expect(outputs.designerPrompt).toBeDefined()
      expect(outputs.ascii.layout).toBeInstanceOf(Array)
    })
  })

  describe('generateASCIIWireframe', () => {
    it('should generate ASCII wireframe', async () => {
      const input: WireframeInput = {
        snapshot: {
          url: 'https://example.com',
          title: 'Test Page',
          html: '<html><body><h1>Test</h1><p>Content</p></body></html>',
          text: ['Test', 'Content'],
          ux: []
        }
      }

      const wireframe = await analyzeWireframe(input)
      const ascii = generateASCIIWireframe(wireframe)

      expect(ascii.header).toBeDefined()
      expect(ascii.layout).toBeInstanceOf(Array)
      expect(ascii.legend).toBeInstanceOf(Array)
      expect(ascii.notes).toBeInstanceOf(Array)
    })

    it('should include header in ASCII', async () => {
      const input: WireframeInput = {
        snapshot: {
          url: 'https://example.com',
          title: 'Test',
          html: '<html><body><header>Header</header><p>Content</p></body></html>',
          text: ['Header', 'Content'],
          ux: []
        }
      }

      const wireframe = await analyzeWireframe(input)
      const ascii = generateASCIIWireframe(wireframe)

      expect(ascii.header).toContain('WIREFRAME')
    })
  })

  describe('generateDesignerPrompt', () => {
    it('should generate designer prompt', async () => {
      const input: WireframeInput = {
        snapshot: {
          url: 'https://example.com',
          title: 'Landing Page',
          html: '<html><body><h1>Hero</h1><button>CTA</button></body></html>',
          text: ['Hero', 'CTA'],
          ux: [{ type: 'click', tag: 'button', text: 'CTA' }]
        }
      }

      const wireframe = await analyzeWireframe(input)
      const prompt = generateDesignerPrompt(wireframe)

      expect(prompt.summary).toBeDefined()
      expect(prompt.layout).toBeDefined()
      expect(prompt.sections).toBeInstanceOf(Array)
      expect(prompt.components).toBeInstanceOf(Array)
      expect(prompt.constraints).toBeInstanceOf(Array)
      expect(prompt.recommendations).toBeInstanceOf(Array)
    })

    it('should include design constraints', async () => {
      const input: WireframeInput = {
        snapshot: {
          url: 'https://example.com',
          title: 'Test',
          html: '<html><body><h1>Test</h1></body></html>',
          text: ['Test'],
          ux: []
        }
      }

      const wireframe = await analyzeWireframe(input)
      const prompt = generateDesignerPrompt(wireframe)

      expect(prompt.constraints.length).toBeGreaterThan(0)
    })
  })

  describe('getAnalysisSummary', () => {
    it('should return summary string', () => {
      const input: WireframeInput = {
        snapshot: {
          url: 'https://example.com',
          title: 'Test',
          html: '<html><body></body></html>',
          text: [],
          ux: []
        }
      }

      const summary = getAnalysisSummary(input)

      expect(typeof summary).toBe('string')
      expect(summary).toContain('https://example.com')
      expect(summary).toContain('Test')
    })
  })
})
