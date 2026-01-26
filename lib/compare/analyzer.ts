// ============================================
// COMPARE - Analyzer
// ============================================

import { RawSnapshot } from '../types'
import {
  CompareInput,
  SnapshotComparison,
  ComparisonMeta,
  VisualDiff,
  UXComparison,
  ContentComparison,
  TechnicalComparison,
  Opportunity,
  Recommendation,
  MajorChange,
  LayoutChange,
  ComponentChange,
  VisualDiffSummary,
  FlowChange,
  InteractionChange,
  AccessibilityComparison,
  UsabilityComparison,
  PatternChange,
  StructuralChange,
  TextChange,
  MediaChange,
  MessagingComparison,
  PerformanceComparison,
  ComplexityComparison,
  TechnologyChange,
  BestPracticesComparison,
  CompareConfig,
  DEFAULT_COMPARE_CONFIG
} from './types'

// ============================================
// MAIN ANALYZER
// ============================================

export async function compareSnapshots(
  input: CompareInput,
  config: CompareConfig = DEFAULT_COMPARE_CONFIG
): Promise<SnapshotComparison> {
  // Validate input
  validateCompareInput(input)

  const { snapshots, names } = input

  // Compare visual aspects
  const visualDiff = compareVisuals(snapshots, config)

  // Compare UX aspects
  const uxComparison = compareUX(snapshots, config)

  // Compare content
  const contentComparison = compareContent(snapshots, config)

  // Compare technical aspects
  const technicalComparison = compareTechnical(snapshots, config)

  // Generate meta
  const meta = generateComparisonMeta(snapshots, names, visualDiff, uxComparison)

  // Identify opportunities
  const opportunities = identifyOpportunities(snapshots, visualDiff, uxComparison, contentComparison)

  // Generate recommendations
  const recommendations = generateRecommendations(visualDiff, uxComparison, contentComparison, technicalComparison)

  return {
    meta,
    visualDiff,
    uxComparison,
    contentComparison,
    technicalComparison,
    opportunities,
    recommendations
  }
}

// ============================================
// VALIDATION
// ============================================

export function validateCompareInput(input: CompareInput): void {
  if (!input.snapshots || input.snapshots.length < 2) {
    throw new Error('Compare requires at least 2 snapshots')
  }

  input.snapshots.forEach((snapshot, index) => {
    if (!snapshot.url) {
      throw new Error(`Snapshot ${index} missing URL`)
    }
  })
}

export function getCompareSummary(input: CompareInput): string {
  const { snapshots, names } = input

  return `
Snapshot Comparison Summary
===========================
Comparing ${snapshots.length} snapshot(s)
${names ? names.map((n, i) => `${i + 1}. ${n} (${snapshots[i].url})`).join('\n') : snapshots.map((s, i) => `${i + 1}. ${s.url}`).join('\n')}
  `.trim()
}

// ============================================
// VISUAL COMPARISON
// ============================================

function compareVisuals(
  snapshots: RawSnapshot[],
  config: CompareConfig
): VisualDiff {
  const layoutChanges = detectLayoutChanges(snapshots)
  const colorChanges = detectColorChanges(snapshots)
  const typographyChanges = detectTypographyChanges(snapshots)
  const spacingChanges = detectSpacingChanges(snapshots)
  const componentChanges = detectComponentChanges(snapshots)
  const summary = generateVisualDiffSummary(
    layoutChanges,
    colorChanges,
    typographyChanges,
    spacingChanges,
    componentChanges
  )

  return {
    layoutChanges,
    colorChanges,
    typographyChanges,
    spacingChanges,
    componentChanges,
    summary
  }
}

function detectLayoutChanges(snapshots: RawSnapshot[]): LayoutChange[] {
  const changes: LayoutChange[] = []

  // Compare structure between snapshots
  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1]
    const curr = snapshots[i]

    // Detect column changes
    const prevColumns = countColumns(prev)
    const currColumns = countColumns(curr)

    if (prevColumns !== currColumns) {
      changes.push({
        type: 'columns',
        description: `Column count changed from ${prevColumns} to ${currColumns}`,
        from: { columns: prevColumns },
        to: { columns: currColumns },
        impact: Math.abs(prevColumns - currColumns) > 1 ? 'high' : 'medium'
      })
    }

    // Detect section changes
    const prevSections = countSections(prev)
    const currSections = countSections(curr)

    if (prevSections !== currSections) {
      changes.push({
        type: 'sections',
        description: `Section count changed from ${prevSections} to ${currSections}`,
        from: { sections: prevSections },
        to: { sections: currSections },
        impact: 'medium'
      })
    }

    // Detect hierarchy changes
    const prevDepth = getDOMDepth(prev)
    const currDepth = getDOMDepth(curr)

    if (Math.abs(prevDepth - currDepth) > 2) {
      changes.push({
        type: 'hierarchy',
        description: `DOM depth changed from ${prevDepth} to ${currDepth}`,
        from: { depth: prevDepth },
        to: { depth: currDepth },
        impact: currDepth > prevDepth ? 'high' : 'low'
      })
    }
  }

  return changes
}

function countColumns(snapshot: RawSnapshot): number {
  // Simplified column detection
  const html = snapshot.html || ''

  if (html.includes('grid') && html.includes('grid-template-columns')) {
    const match = html.match(/grid-template-columns:\s*repeat\((\d+)/)
    return match ? parseInt(match[1]) : 1
  }

  if (html.includes('sidebar') || html.includes('aside')) {
    return 2
  }

  return 1
}

function countSections(snapshot: RawSnapshot): number {
  const html = snapshot.html || ''
  const matches = html.match(/<section/g) || []
  return matches.length
}

function getDOMDepth(snapshot: RawSnapshot): number {
  // Simplified depth calculation
  const html = snapshot.html || ''
  const maxDepth = (html.match(/\</g) || []).length / 10 // Rough estimate
  return Math.min(Math.max(maxDepth, 1), 20)
}

function detectColorChanges(snapshots: RawSnapshot[]): any[] {
  const changes: any[] = []

  // Would extract colors from designStyles if available
  // For now, return empty array

  return changes
}

function detectTypographyChanges(snapshots: RawSnapshot[]): any[] {
  const changes: any[] = []

  // Would extract typography from designStyles if available
  // For now, return empty array

  return changes
}

function detectSpacingChanges(snapshots: RawSnapshot[]): any[] {
  const changes: any[] = []

  // Would extract spacing from designStyles if available
  // For now, return empty array

  return changes
}

function detectComponentChanges(snapshots: RawSnapshot[]): ComponentChange[] {
  const changes: ComponentChange[] = []

  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1]
    const curr = snapshots[i]

    // Detect added forms
    const prevForms = (prev.html?.match(/<form/g) || []).length
    const currForms = (curr.html?.match(/<form/g) || []).length

    if (currForms > prevForms) {
      changes.push({
        component: 'Form',
        action: 'added',
        description: `${currForms - prevForms} form(s) added`,
        impact: 'medium'
      })
    } else if (currForms < prevForms) {
      changes.push({
        component: 'Form',
        action: 'removed',
        description: `${prevForms - currForms} form(s) removed`,
        impact: 'medium'
      })
    }

    // Detect navigation changes
    const prevNavs = (prev.html?.match(/<nav/g) || []).length
    const currNavs = (curr.html?.match(/<nav/g) || []).length

    if (prevNavs !== currNavs) {
      changes.push({
        component: 'Navigation',
        action: prevNavs < currNavs ? 'added' : 'removed',
        description: `Navigation ${prevNavs < currNavs ? 'added' : 'removed'}`,
        impact: 'high'
      })
    }

    // Detect header/footer changes
    const prevHeader = prev.html?.includes('<header')
    const currHeader = curr.html?.includes('<header')

    if (prevHeader !== currHeader) {
      changes.push({
        component: 'Header',
        action: currHeader ? 'added' : 'removed',
        description: `Header ${currHeader ? 'added' : 'removed'}`,
        impact: 'high'
      })
    }
  }

  return changes
}

function generateVisualDiffSummary(
  layoutChanges: LayoutChange[],
  colorChanges: any[],
  typographyChanges: any[],
  spacingChanges: any[],
  componentChanges: ComponentChange[]
): VisualDiffSummary {
  const totalChanges =
    layoutChanges.length +
    colorChanges.length +
    typographyChanges.length +
    spacingChanges.length +
    componentChanges.length

  const highImpact =
    layoutChanges.filter(c => c.impact === 'high').length +
    componentChanges.filter(c => c.impact === 'high').length

  const mediumImpact =
    layoutChanges.filter(c => c.impact === 'medium').length +
    componentChanges.filter(c => c.impact === 'medium').length

  const lowImpact =
    layoutChanges.filter(c => c.impact === 'low').length +
    componentChanges.filter(c => c.impact === 'low').length

  const categoriesChanged: string[] = []
  if (layoutChanges.length > 0) categoriesChanged.push('layout')
  if (colorChanges.length > 0) categoriesChanged.push('colors')
  if (typographyChanges.length > 0) categoriesChanged.push('typography')
  if (spacingChanges.length > 0) categoriesChanged.push('spacing')
  if (componentChanges.length > 0) categoriesChanged.push('components')

  return {
    totalChanges,
    highImpact,
    mediumImpact,
    lowImpact,
    categoriesChanged
  }
}

// ============================================
// UX COMPARISON
// ============================================

function compareUX(
  snapshots: RawSnapshot[],
  config: CompareConfig
): UXComparison {
  const flowChanges = detectFlowChanges(snapshots)
  const interactionChanges = detectInteractionChanges(snapshots)
  const accessibilityComparison = compareAccessibility(snapshots)
  const usabilityComparison = compareUsability(snapshots)
  const patternChanges = detectPatternChanges(snapshots)

  return {
    flowChanges,
    interactionChanges,
    accessibilityComparison,
    usabilityComparison,
    patternChanges
  }
}

function detectFlowChanges(snapshots: RawSnapshot[]): FlowChange[] {
  const changes: FlowChange[] = []

  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1]
    const curr = snapshots[i]

    // Count form submissions (flows)
    const prevFlows = (prev.ux?.filter(e => e.type === 'submit') || []).length
    const currFlows = (curr.ux?.filter(e => e.type === 'submit') || []).length

    if (prevFlows !== currFlows) {
      changes.push({
        flowName: 'Form Submission',
        action: currFlows > prevFlows ? 'added' : 'removed',
        description: `Form submission ${currFlows > prevFlows ? 'added' : 'removed'}`,
        stepsBefore: prevFlows,
        stepsAfter: currFlows,
        impact: 'medium'
      })
    }
  }

  return changes
}

function detectInteractionChanges(snapshots: RawSnapshot[]): InteractionChange[] {
  const changes: InteractionChange[] = []

  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1]
    const curr = snapshots[i]

    // Compare button/CTA counts
    const prevButtons = (prev.ux?.filter(e => e.tag === 'button') || []).length
    const currButtons = (curr.ux?.filter(e => e.tag === 'button') || []).length

    if (prevButtons !== currButtons) {
      changes.push({
        element: 'Button/CTA',
        changeType: currButtons > prevButtons ? 'added' : 'removed',
        description: `${Math.abs(currButtons - prevButtons)} button(s) ${currButtons > prevButtons ? 'added' : 'removed'}`,
        impact: 'medium'
      })
    }

    // Compare link counts
    const prevLinks = (prev.html?.match(/<a/g) || []).length
    const currLinks = (curr.html?.match(/<a/g) || []).length

    if (Math.abs(currLinks - prevLinks) > 5) {
      changes.push({
        element: 'Link',
        changeType: currLinks > prevLinks ? 'added' : 'removed',
        description: `${Math.abs(currLinks - prevLinks)} link(s) ${currLinks > prevLinks ? 'added' : 'removed'}`,
        impact: 'low'
      })
    }
  }

  return changes
}

function compareAccessibility(snapshots: RawSnapshot[]): AccessibilityComparison {
  // Simplified accessibility comparison
  const beforeScore = calculateAccessibilityScore(snapshots[0])
  const afterScore = calculateAccessibilityScore(snapshots[snapshots.length - 1])

  const improvements: string[] = []
  const regressions: string[] = []
  const unchanged: string[] = []

  if (afterScore > beforeScore) {
    improvements.push(`Accessibility score improved from ${beforeScore} to ${afterScore}`)
  } else if (afterScore < beforeScore) {
    regressions.push(`Accessibility score decreased from ${beforeScore} to ${afterScore}`)
  } else {
    unchanged.push('Accessibility score unchanged')
  }

  return {
    scoreBefore: beforeScore,
    scoreAfter: afterScore,
    improvements,
    regressions,
    unchanged
  }
}

function calculateAccessibilityScore(snapshot: RawSnapshot): number {
  const html = snapshot.html || ''
  let score = 50

  // Check for alt tags
  const images = html.match(/<img/g) || []
  const alts = html.match(/alt=/g) || []
  score += Math.min((alts.length / Math.max(images.length, 1)) * 20, 20)

  // Check for headings
  const headings = html.match(/<h[1-6]/g) || []
  score += Math.min(headings.length * 5, 15)

  // Check for ARIA
  const arias = html.match(/aria-/g) || []
  score += Math.min(arias.length * 2, 15)

  return Math.min(score, 100)
}

function compareUsability(snapshots: RawSnapshot[]): UsabilityComparison {
  const complexityBefore = getComplexity(snapshots[0])
  const complexityAfter = getComplexity(snapshots[snapshots.length - 1])

  const domElementsBefore = (snapshots[0].html?.match(/</g) || []).length
  const domElementsAfter = (snapshots[snapshots.length - 1].html?.match(/</g) || []).length

  return {
    complexityBefore,
    complexityAfter,
    cognitiveLoad: domElementsAfter < domElementsBefore ? 'reduced' : domElementsAfter > domElementsBefore ? 'increased' : 'same',
    discoverability: 'same' // Simplified
  }
}

function getComplexity(snapshot: RawSnapshot): 'simple' | 'moderate' | 'complex' {
  const elements = (snapshot.html?.match(/</g) || []).length

  if (elements < 100) return 'simple'
  if (elements < 300) return 'moderate'
  return 'complex'
}

function detectPatternChanges(snapshots: RawSnapshot[]): PatternChange[] {
  const changes: PatternChange[] = []

  const patterns = ['hero', 'card', 'grid', 'form', 'modal']

  for (const pattern of patterns) {
    const prevHas = snapshots[0].html?.includes(pattern)
    const currHas = snapshots[snapshots.length - 1].html?.includes(pattern)

    if (prevHas !== currHas) {
      changes.push({
        pattern,
        action: currHas ? 'added' : 'removed',
        description: `${pattern.charAt(0).toUpperCase() + pattern.slice(1)} pattern ${currHas ? 'added' : 'removed'}`,
        impact: 'medium'
      })
    }
  }

  return changes
}

// ============================================
// CONTENT COMPARISON
// ============================================

function compareContent(
  snapshots: RawSnapshot[],
  config: CompareConfig
): ContentComparison {
  const structuralChanges = detectStructuralChanges(snapshots)
  const textChanges = detectTextChanges(snapshots)
  const mediaChanges = detectMediaChanges(snapshots)
  const messagingComparison = compareMessaging(snapshots)

  return {
    structuralChanges,
    textChanges,
    mediaChanges,
    messagingComparison
  }
}

function detectStructuralChanges(snapshots: RawSnapshot[]): StructuralChange[] {
  const changes: StructuralChange[] = []

  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1]
    const curr = snapshots[i]

    // Detect header changes
    const prevHeader = prev.html?.includes('<header')
    const currHeader = curr.html?.includes('<header')

    if (prevHeader && !currHeader) {
      changes.push({
        type: 'section-removed',
        section: 'Header',
        description: 'Header section removed'
      })
    } else if (!prevHeader && currHeader) {
      changes.push({
        type: 'section-added',
        section: 'Header',
        description: 'Header section added'
      })
    }

    // Detect footer changes
    const prevFooter = prev.html?.includes('<footer')
    const currFooter = curr.html?.includes('<footer')

    if (prevFooter && !currFooter) {
      changes.push({
        type: 'section-removed',
        section: 'Footer',
        description: 'Footer section removed'
      })
    } else if (!prevFooter && currFooter) {
      changes.push({
        type: 'section-added',
        section: 'Footer',
        description: 'Footer section added'
      })
    }
  }

  return changes
}

function detectTextChanges(snapshots: RawSnapshot[]): TextChange[] {
  const changes: TextChange[] = []

  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1]
    const curr = snapshots[i]

    // Compare titles
    if (prev.title !== curr.title) {
      changes.push({
        element: 'Page Title',
        type: 'modified',
        from: prev.title || 'Untitled',
        to: curr.title || 'Untitled',
        impact: 'low'
      })
    }

    // Compare text arrays
    const prevText = prev.text || []
    const currText = curr.text || []

    const added = currText.filter(t => !prevText.includes(t))
    const removed = prevText.filter(t => !currText.includes(t))

    added.slice(0, 3).forEach(text => {
      changes.push({
        element: 'Content',
        type: 'added',
        from: '',
        to: text.substring(0, 50),
        impact: 'low'
      })
    })

    removed.slice(0, 3).forEach(text => {
      changes.push({
        element: 'Content',
        type: 'removed',
        from: text.substring(0, 50),
        to: '',
        impact: 'low'
      })
    })
  }

  return changes
}

function detectMediaChanges(snapshots: RawSnapshot[]): MediaChange[] {
  const changes: MediaChange[] = []

  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1]
    const curr = snapshots[i]

    // Compare image counts
    const prevImages = (prev.html?.match(/<img/g) || []).length
    const currImages = (curr.html?.match(/<img/g) || []).length

    if (prevImages !== currImages) {
      changes.push({
        type: 'image',
        action: currImages > prevImages ? 'added' : 'removed',
        description: `${Math.abs(currImages - prevImages)} image(s) ${currImages > prevImages ? 'added' : 'removed'}`
      })
    }
  }

  return changes
}

function compareMessaging(snapshots: RawSnapshot[]): MessagingComparison {
  const toneChanges: any[] = []
  const ctaChanges: any[] = []
  const valuePropChanges: any[] = []

  // Simplified messaging comparison
  // Would use NLP for real tone analysis

  return {
    toneChanges,
    ctaChanges,
    valuePropChanges
  }
}

// ============================================
// TECHNICAL COMPARISON
// ============================================

function compareTechnical(
  snapshots: RawSnapshot[],
  config: CompareConfig
): TechnicalComparison {
  const performanceMetrics = comparePerformance(snapshots)
  const codeComplexity = compareCodeComplexity(snapshots)
  const technologyChanges = detectTechnologyChanges(snapshots)
  const bestPractices = compareBestPractices(snapshots)

  return {
    performanceMetrics,
    codeComplexity,
    technologyChanges,
    bestPractices
  }
}

function comparePerformance(snapshots: RawSnapshot[]): PerformanceComparison {
  // Simplified performance comparison
  // Real implementation would use actual metrics

  return {
    loadTimeBefore: undefined,
    loadTimeAfter: undefined,
    sizeBefore: undefined,
    sizeAfter: undefined,
    requestsBefore: undefined,
    requestsAfter: undefined,
    improvement: 'same'
  }
}

function compareCodeComplexity(snapshots: RawSnapshot[]): ComplexityComparison {
  const domElementsBefore = (snapshots[0].html?.match(/</g) || []).length
  const domElementsAfter = (snapshots[snapshots.length - 1].html?.match(/</g) || []).length

  const depthBefore = getDOMDepth(snapshots[0])
  const depthAfter = getDOMDepth(snapshots[snapshots.length - 1])

  const complexityChange =
    domElementsAfter < domElementsBefore && depthAfter < depthBefore ? 'simpler' :
    domElementsAfter > domElementsBefore && depthAfter > depthBefore ? 'more-complex' :
    'same'

  return {
    domElementsBefore,
    domElementsAfter,
    depthBefore,
    depthAfter,
    complexityChange
  }
}

function detectTechnologyChanges(snapshots: RawSnapshot[]): TechnologyChange[] {
  const changes: TechnologyChange[] = []

  // Detect library/framework usage changes
  const libraries = ['react', 'vue', 'angular', 'jquery', 'bootstrap', 'tailwind']

  for (const lib of libraries) {
    const prevHas = snapshots[0].html?.toLowerCase().includes(lib)
    const currHas = snapshots[snapshots.length - 1].html?.toLowerCase().includes(lib)

    if (prevHas !== currHas) {
      changes.push({
        type: currHas ? 'added' : 'removed',
        technology: lib,
        description: `${lib} ${currHas ? 'added' : 'removed'}`
      })
    }
  }

  return changes
}

function compareBestPractices(snapshots: RawSnapshot[]): BestPracticesComparison {
  const improvements: string[] = []
  const regressions: string[] = []

  // Check for semantic HTML
  const prevSemantic = (snapshots[0].html?.match(/<(header|main|footer|nav|article|section)/g) || []).length
  const currSemantic = (snapshots[snapshots.length - 1].html?.match(/<(header|main|footer|nav|article|section)/g) || []).length

  if (currSemantic > prevSemantic) {
    improvements.push('Semantic HTML elements increased')
  } else if (currSemantic < prevSemantic) {
    regressions.push('Semantic HTML elements decreased')
  }

  return {
    improvements,
    regressions
  }
}

// ============================================
// META GENERATION
// ============================================

function generateComparisonMeta(
  snapshots: RawSnapshot[],
  names: string[] | undefined,
  visualDiff: VisualDiff,
  uxComparison: UXComparison
): ComparisonMeta {
  const totalDifferences =
    visualDiff.summary.totalChanges +
    uxComparison.flowChanges.length +
    uxComparison.interactionChanges.length

  const majorChanges: MajorChange[] = []

  // Add high-impact visual changes
  visualDiff.layoutChanges
    .filter(c => c.impact === 'high')
    .forEach(change => {
      majorChanges.push({
        type: 'structural',
        description: change.description,
        impact: 'high',
        snapshots: [0, snapshots.length - 1]
      })
    })

  // Add high-impact UX changes
  uxComparison.flowChanges
    .filter(f => f.impact === 'high')
    .forEach(flow => {
      majorChanges.push({
        type: 'ux',
        description: flow.description,
        impact: 'high',
        snapshots: [0, snapshots.length - 1]
      })
    })

  return {
    comparedAt: new Date().toISOString(),
    snapshotCount: snapshots.length,
    urls: snapshots.map(s => s.url),
    names: names || snapshots.map((s, i) => `Snapshot ${i + 1}`),
    totalDifferences,
    majorChanges
  }
}

// ============================================
// OPPORTUNITIES IDENTIFICATION
// ============================================

function identifyOpportunities(
  snapshots: RawSnapshot[],
  visualDiff: VisualDiff,
  uxComparison: UXComparison,
  contentComparison: ContentComparison
): Opportunity[] {
  const opportunities: Opportunity[] = []

  // Performance opportunities
  if (visualDiff.summary.totalChanges > 10) {
    opportunities.push({
      id: 'opt-1',
      category: 'performance',
      title: 'Optimize Asset Loading',
      description: 'Consider lazy loading and code splitting to improve load times',
      impact: 'medium',
      effort: 'medium',
      priority: 2,
      snapshots: [0]
    })
  }

  // Accessibility opportunities
  const accessibilityScore = uxComparison.accessibilityComparison.scoreAfter
  if (accessibilityScore < 70) {
    opportunities.push({
      id: 'opt-2',
      category: 'accessibility',
      title: 'Improve Accessibility',
      description: 'Add alt tags, improve heading structure, and enhance keyboard navigation',
      impact: 'high',
      effort: 'medium',
      priority: 1,
      snapshots: [snapshots.length - 1]
    })
  }

  // UX opportunities
  if (uxComparison.usabilityComparison.cognitiveLoad === 'increased') {
    opportunities.push({
      id: 'opt-3',
      category: 'ux-improvement',
      title: 'Simplify User Interface',
      description: 'Reduce cognitive load by simplifying layout and content',
      impact: 'medium',
      effort: 'large',
      priority: 3,
      snapshots: [snapshots.length - 1]
    })
  }

  return opportunities
}

// ============================================
// RECOMMENDATIONS GENERATION
// ============================================

function generateRecommendations(
  visualDiff: VisualDiff,
  uxComparison: UXComparison,
  contentComparison: ContentComparison,
  technicalComparison: TechnicalComparison
): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Based on complexity changes
  if (technicalComparison.codeComplexity.complexityChange === 'more-complex') {
    recommendations.push({
      id: 'rec-1',
      type: 'consolidate',
      title: 'Simplify Code Structure',
      description: 'Consider consolidating components to reduce complexity',
      rationale: 'Lower complexity improves maintainability',
      effort: 'large',
      impact: 'medium',
      priority: 2
    })
  }

  // Based on accessibility
  if (uxComparison.accessibilityComparison.scoreAfter < 80) {
    recommendations.push({
      id: 'rec-2',
      type: 'implement',
      title: 'Enhance Accessibility Features',
      description: 'Improve WCAG compliance by adding proper ARIA labels and semantic HTML',
      rationale: 'Accessibility improves user experience for all users',
      effort: 'medium',
      impact: 'high',
      priority: 1
    })
  }

  return recommendations
}

// ============================================
// DEFAULT OUTPUT
// ============================================

export function getDefaultSnapshotComparison(): SnapshotComparison {
  return {
    meta: {
      comparedAt: new Date().toISOString(),
      snapshotCount: 0,
      urls: [],
      names: [],
      totalDifferences: 0,
      majorChanges: []
    },
    visualDiff: {
      layoutChanges: [],
      colorChanges: [],
      typographyChanges: [],
      spacingChanges: [],
      componentChanges: [],
      summary: {
        totalChanges: 0,
        highImpact: 0,
        mediumImpact: 0,
        lowImpact: 0,
        categoriesChanged: []
      }
    },
    uxComparison: {
      flowChanges: [],
      interactionChanges: [],
      accessibilityComparison: {
        scoreBefore: 50,
        scoreAfter: 50,
        improvements: [],
        regressions: [],
        unchanged: []
      },
      usabilityComparison: {
        complexityBefore: 'moderate',
        complexityAfter: 'moderate',
        cognitiveLoad: 'same',
        discoverability: 'same'
      },
      patternChanges: []
    },
    contentComparison: {
      structuralChanges: [],
      textChanges: [],
      mediaChanges: [],
      messagingComparison: {
        toneChanges: [],
        ctaChanges: [],
        valuePropChanges: []
      }
    },
    technicalComparison: {
      performanceMetrics: {
        improvement: 'same'
      },
      codeComplexity: {
        domElementsBefore: 0,
        domElementsAfter: 0,
        depthBefore: 0,
        depthAfter: 0,
        complexityChange: 'same'
      },
      technologyChanges: [],
      bestPractices: {
        improvements: [],
        regressions: []
      }
    },
    opportunities: [],
    recommendations: []
  }
}
