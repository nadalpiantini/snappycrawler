// ============================================
// VISUAL HIERARCHY - Scoring System
// ============================================

import { RawSnapshot } from '../types'

export interface HierarchyAnalysis {
  meta: HierarchyMeta
  scores: ElementScore[]
  summary: HierarchySummary
  levels: HierarchyLevel[]
}

export interface HierarchyMeta {
  analyzedAt: string
  sourceUrl: string
  totalElements: number
}

export interface ElementScore {
  element: string
  overallScore: number
  size: number
  contrast: number
  position: number
  weight: number
  confidence: number
}

export interface HierarchySummary {
  averageScore: number
  clarity: 'clear' | 'moderate' | 'unclear'
  issues: string[]
  recommendations: string[]
}

export interface HierarchyLevel {
  level: number
  name: string
  elements: string[]
  score: number
}

export async function analyzeVisualHierarchy(snapshot: RawSnapshot): Promise<HierarchyAnalysis> {
  const html = snapshot.html || ''

  // Parse and score elements
  const scores = await scoreElements(html)

  // Calculate summary
  const summary = calculateSummary(scores)

  // Determine hierarchy levels
  const levels = determineLevels(scores)

  return {
    meta: {
      analyzedAt: new Date().toISOString(),
      sourceUrl: snapshot.url,
      totalElements: scores.length
    },
    scores,
    summary,
    levels
  }
}

async function scoreElements(html: string): Promise<ElementScore[]> {
  const scores: ElementScore[] = []

  // Score heading hierarchy
  const headings = html.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || []

  headings.forEach((heading, index) => {
    const level = parseInt(heading[2])
    const text = heading.replace(/<[^>]+>/g, '')

    scores.push({
      element: `h${level}: ${text.substring(0, 30)}`,
      overallScore: calculateHeadingScore(level, index, headings.length),
      size: calculateSizeScore(level, 6),
      contrast: 0.8, // Placeholder
      position: calculatePositionScore(level, index, headings.length),
      weight: calculateWeightScore(level),
      confidence: 0.8
    })
  })

  // Score buttons
  const buttons = html.match(/<button[^>]*>.*?<\/button>/gi) || []

  buttons.forEach((button, index) => {
    const text = button.replace(/<[^>]+>/g, '')

    scores.push({
      element: `button: ${text.substring(0, 30)}`,
      overallScore: 0.7,
      size: 0.7,
      contrast: 0.8,
      position: index === 0 ? 0.9 : 0.6,
      weight: 0.8,
      confidence: 0.7
    })
  })

  return scores
}

function calculateHeadingScore(level: number, position: number, total: number): number {
  // H1 should be first and have highest score
  const idealPosition = level - 1
  const positionScore = 1 - Math.abs(position - idealPosition) / total

  const sizeScore = (7 - level) / 6

  return (positionScore * 0.6) + (sizeScore * 0.4)
}

function calculateSizeScore(level: number, maxLevel: number): number {
  // Higher level (lower number) = higher score
  return (maxLevel - level + 1) / maxLevel
}

function calculatePositionScore(level: number, position: number, total: number): number {
  // Early position = higher score
  return 1 - (position / total)
}

function calculateWeightScore(level: number): number {
  // H1 is boldest
  return (7 - level) / 6
}

function calculateSummary(scores: ElementScore[]): HierarchySummary {
  if (scores.length === 0) {
    return {
      averageScore: 0,
      clarity: 'unclear',
      issues: ['No elements scored'],
      recommendations: ['Add clear heading structure']
    }
  }

  const averageScore = scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length

  const clarity = averageScore > 0.7 ? 'clear' : averageScore > 0.4 ? 'moderate' : 'unclear'

  const issues: string[] = []
  const recommendations: string[] = []

  // Check for issues
  const lowScores = scores.filter(s => s.overallScore < 0.4)
  if (lowScores.length > scores.length / 2) {
    issues.push('Many elements have low hierarchy scores')
    recommendations.push('Improve visual hierarchy through size and weight')
  }

  const veryLowScores = scores.filter(s => s.overallScore < 0.3)
  if (veryLowScores.length > 0) {
    issues.push(`${veryLowScores.length} element(s) with poor hierarchy`)
  }

  if (averageScore < 0.5) {
    recommendations.push('Redesign layout with clearer visual hierarchy')
    recommendations.push('Use size, color, and position to establish hierarchy')
  }

  return {
    averageScore,
    clarity,
    issues,
    recommendations
  }
}

function determineLevels(scores: ElementScore[]): HierarchyLevel[] {
  // Group scores into levels
  const level1 = scores.filter(s => s.overallScore >= 0.8)
  const level2 = scores.filter(s => s.overallScore >= 0.6 && s.overallScore < 0.8)
  const level3 = scores.filter(s => s.overallScore >= 0.4 && s.overallScore < 0.6)
  const level4 = scores.filter(s => s.overallScore < 0.4)

  return [
    {
      level: 1,
      name: 'Primary',
      elements: level1.map(s => s.element),
      score: average(level1.map(s => s.overallScore))
    },
    {
      level: 2,
      name: 'Secondary',
      elements: level2.map(s => s.element),
      score: average(level2.map(s => s.overallScore))
    },
    {
      level: 3,
      name: 'Tertiary',
      elements: level3.map(s => s.element),
      score: average(level3.map(s => s.overallScore))
    },
    {
      level: 4,
      name: 'Minimal',
      elements: level4.map(s => s.element),
      score: average(level4.map(s => s.overallScore))
    }
  ].filter(l => l.elements.length > 0)
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((sum, v) => sum + v, 0) / arr.length
}
