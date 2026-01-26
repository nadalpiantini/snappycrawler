// ============================================
// COMPARE - Tests
// ============================================

import { describe, it, expect, beforeEach } from 'vitest'
import {
  compareSnapshots,
  validateCompareInput,
  getCompareSummary,
  generateAllOutputs,
  generateCompareReport,
  generateComparisonMatrix,
  DEFAULT_COMPARE_CONFIG,
  type CompareInput,
  type SnapshotComparison,
  type VisualDiff,
  type UXComparison
} from '../lib/compare'

describe('Compare Mode', () => {
  describe('validateCompareInput', () => {
    it('should accept valid input with 2+ snapshots', () => {
      const input: CompareInput = {
        snapshots: [
          {
            url: 'https://example.com/v1',
            title: 'Version 1',
            html: '<html><body><h1>V1</h1></body></html>',
            text: ['V1'],
            ux: []
          },
          {
            url: 'https://example.com/v2',
            title: 'Version 2',
            html: '<html><body><h1>V2</h1></body></html>',
            text: ['V2'],
            ux: []
          }
        ]
      }

      expect(() => validateCompareInput(input)).not.toThrow()
    })

    it('should reject input with less than 2 snapshots', () => {
      const input: CompareInput = {
        snapshots: [
          {
            url: 'https://example.com',
            title: 'Test',
            html: '<html></html>',
            text: [],
            ux: []
          }
        ]
      }

      expect(() => validateCompareInput(input)).toThrow('Compare requires at least 2 snapshots')
    })

    it('should reject snapshots without URL', () => {
      const input: CompareInput = {
        snapshots: [
          { url: '', title: '', html: '', text: [], ux: [] } as any,
          { url: 'https://example.com', title: '', html: '', text: [], ux: [] }
        ]
      }

      expect(() => validateCompareInput(input)).toThrow()
    })
  })

  describe('compareSnapshots', () => {
    let input: CompareInput

    beforeEach(() => {
      input = {
        snapshots: [
          {
            url: 'https://example.com/v1',
            title: 'Version 1',
            html: '<html><body><header>Header</header><section>Content</section></body></html>',
            text: ['Header', 'Content'],
            ux: []
          },
          {
            url: 'https://example.com/v2',
            title: 'Version 2',
            html: '<html><body><header>New Header</header><section>Content</section><footer>Footer</footer></body></html>',
            text: ['New Header', 'Content', 'Footer'],
            ux: []
          }
        ],
        names: ['V1', 'V2']
      }
    })

    it('should compare snapshots successfully', async () => {
      const result = await compareSnapshots(input)

      expect(result).toBeDefined()
      expect(result.meta).toBeDefined()
      expect(result.visualDiff).toBeDefined()
      expect(result.uxComparison).toBeDefined()
      expect(result.contentComparison).toBeDefined()
      expect(result.technicalComparison).toBeDefined()
      expect(result.opportunities).toBeInstanceOf(Array)
      expect(result.recommendations).toBeInstanceOf(Array)
    })

    it('should generate metadata', async () => {
      const result = await compareSnapshots(input)

      expect(result.meta.snapshotCount).toBe(2)
      expect(result.meta.urls).toEqual(['https://example.com/v1', 'https://example.com/v2'])
      expect(result.meta.names).toEqual(['V1', 'V2'])
      expect(result.meta.totalDifferences).toBeGreaterThanOrEqual(0)
    })

    it('should detect visual differences', async () => {
      const result = await compareSnapshots(input)

      expect(result.visualDiff.summary.totalChanges).toBeGreaterThanOrEqual(0)
      expect(result.visualDiff.layoutChanges).toBeInstanceOf(Array)
      expect(result.visualDiff.componentChanges).toBeInstanceOf(Array)
    })

    it('should compare UX aspects', async () => {
      const result = await compareSnapshots(input)

      expect(result.uxComparison.flowChanges).toBeInstanceOf(Array)
      expect(result.uxComparison.interactionChanges).toBeInstanceOf(Array)
      expect(result.uxComparison.accessibilityComparison).toBeDefined()
      expect(result.uxComparison.usabilityComparison).toBeDefined()
    })

    it('should identify opportunities', async () => {
      const result = await compareSnapshots(input)

      expect(result.opportunities).toBeInstanceOf(Array)
      result.opportunities.forEach(opp => {
        expect(opp.id).toBeDefined()
        expect(opp.category).toBeDefined()
        expect(opp.title).toBeDefined()
        expect(opp.impact).toBeDefined()
      })
    })

    it('should generate recommendations', async () => {
      const result = await compareSnapshots(input)

      expect(result.recommendations).toBeInstanceOf(Array)
      result.recommendations.forEach(rec => {
        expect(rec.id).toBeDefined()
        expect(rec.type).toBeDefined()
        expect(rec.title).toBeDefined()
      })
    })
  })

  describe('generateAllOutputs', () => {
    it('should generate all output formats', async () => {
      const input: CompareInput = {
        snapshots: [
          {
            url: 'https://example.com/v1',
            title: 'V1',
            html: '<html><body><h1>V1</h1></body></html>',
            text: ['V1'],
            ux: []
          },
          {
            url: 'https://example.com/v2',
            title: 'V2',
            html: '<html><body><h1>V2</h1></body></html>',
            text: ['V2'],
            ux: []
          }
        ]
      }

      const comparison = await compareSnapshots(input)
      const outputs = await generateAllOutputs(comparison)

      expect(outputs.report).toBeDefined()
      expect(outputs.matrix).toBeDefined()
    })
  })

  describe('generateCompareReport', () => {
    it('should generate markdown report', async () => {
      const input: CompareInput = {
        snapshots: [
          {
            url: 'https://example.com/v1',
            title: 'V1',
            html: '<html><body><h1>V1</h1></body></html>',
            text: ['V1'],
            ux: []
          },
          {
            url: 'https://example.com/v2',
            title: 'V2',
            html: '<html><html><body><h1>V2</h1></body></html>',
            text: ['V2'],
            ux: []
          }
        ]
      }

      const comparison = await compareSnapshots(input)
      const report = generateCompareReport(comparison)

      expect(typeof report).toBe('string')
      expect(report).toContain('# Snapshot Comparison Report')
    })
  })

  describe('generateComparisonMatrix', () => {
    it('should generate comparison matrix', async () => {
      const input: CompareInput = {
        snapshots: [
          {
            url: 'https://example.com/v1',
            title: 'V1',
            html: '<html><body><h1>V1</h1></body></html>',
            text: ['V1'],
            ux: []
          },
          {
            url: 'https://example.com/v2',
            title: 'V2',
            html: '<html><body><h1>V2</h1></body></html>',
            text: ['V2'],
            ux: []
          }
        ]
      }

      const comparison = await compareSnapshots(input)
      const matrix = generateComparisonMatrix(comparison)

      expect(matrix).toBeDefined()
      expect(matrix.dimensions).toBeInstanceOf(Array)
      expect(matrix.scores).toBeInstanceOf(Array)
    })
  })

  describe('getCompareSummary', () => {
    it('should return summary string', () => {
      const input: CompareInput = {
        snapshots: [
          {
            url: 'https://example.com/v1',
            title: 'V1',
            html: '<html><body></body></html>',
            text: [],
            ux: []
          },
          {
            url: 'https://example.com/v2',
            title: 'V2',
            html: '<html><body></body></html>',
            text: [],
            ux: []
          }
        ],
        names: ['Version 1', 'Version 2']
      }

      const summary = getCompareSummary(input)

      expect(typeof summary).toBe('string')
      expect(summary).toContain('2 snapshot(s)')
      expect(summary).toContain('Version 1')
      expect(summary).toContain('Version 2')
    })
  })
})
