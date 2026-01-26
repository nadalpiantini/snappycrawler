// ============================================
// COMPARE - Type Definitions
// ============================================

import { RawSnapshot } from '../types'

// ============================================
// INPUT TYPES
// ============================================

export interface CompareInput {
  snapshots: RawSnapshot[]
  names?: string[]
  options?: CompareOptions
}

export interface CompareOptions {
  includeVisualDiff: boolean
  includeUXComparison: boolean
  includePerformanceMetrics: boolean
  detailLevel: 'summary' | 'standard' | 'detailed'
}

// ============================================
// COMPARISON TYPES
// ============================================

export interface SnapshotComparison {
  meta: ComparisonMeta
  visualDiff: VisualDiff
  uxComparison: UXComparison
  contentComparison: ContentComparison
  technicalComparison: TechnicalComparison
  opportunities: Opportunity[]
  recommendations: Recommendation[]
}

export interface ComparisonMeta {
  comparedAt: string
  snapshotCount: number
  urls: string[]
  names: string[]
  totalDifferences: number
  majorChanges: MajorChange[]
}

export interface MajorChange {
  type: 'structural' | 'content' | 'design' | 'ux'
  description: string
  impact: 'high' | 'medium' | 'low'
  snapshots: number[] // Affected snapshot indices
}

// ============================================
// VISUAL DIFF TYPES
// ============================================

export interface VisualDiff {
  layoutChanges: LayoutChange[]
  colorChanges: ColorChange[]
  typographyChanges: TypographyChange[]
  spacingChanges: SpacingChange[]
  componentChanges: ComponentChange[]
  summary: VisualDiffSummary
}

export interface LayoutChange {
  type: LayoutChangeType
  description: string
  from: any
  to: any
  impact: 'high' | 'medium' | 'low'
}

export type LayoutChangeType =
  | 'structure'      // Overall layout structure
  | 'columns'        // Number of columns
  | 'sections'       // Added/removed sections
  | 'hierarchy'      // Hierarchy changes
  | 'responsive'     // Responsive breakpoints

export interface ColorChange {
  property: string
  from: string
  to: string
  impact: 'high' | 'medium' | 'low'
  category: 'primary' | 'secondary' | 'accent' | 'neutral'
}

export interface TypographyChange {
  property: string
  from: any
  to: any
  impact: 'high' | 'medium' | 'low'
  category: 'size' | 'weight' | 'family' | 'line-height'
}

export interface SpacingChange {
  type: 'padding' | 'margin' | 'gap'
  from: string
  to: string
  impact: 'low' | 'medium'
}

export interface ComponentChange {
  component: string
  action: 'added' | 'removed' | 'modified'
  description: string
  impact: 'high' | 'medium' | 'low'
}

export interface VisualDiffSummary {
  totalChanges: number
  highImpact: number
  mediumImpact: number
  lowImpact: number
  categoriesChanged: string[]
}

// ============================================
// UX COMPARISON TYPES
// ============================================

export interface UXComparison {
  flowChanges: FlowChange[]
  interactionChanges: InteractionChange[]
  accessibilityComparison: AccessibilityComparison
  usabilityComparison: UsabilityComparison
  patternChanges: PatternChange[]
}

export interface FlowChange {
  flowName: string
  action: 'added' | 'removed' | 'modified' | 'simplified' | 'complexified'
  description: string
  stepsBefore: number
  stepsAfter: number
  impact: 'high' | 'medium' | 'low'
}

export interface InteractionChange {
  element: string
  changeType: InteractionChangeType
  description: string
  impact: 'high' | 'medium' | 'low'
}

export type InteractionChangeType =
  | 'added'
  | 'removed'
  | 'relocated'
  | 'redesigned'
  | 'simplified'

export interface AccessibilityComparison {
  scoreBefore: number
  scoreAfter: number
  improvements: string[]
  regressions: string[]
  unchanged: string[]
}

export interface UsabilityComparison {
  complexityBefore: 'simple' | 'moderate' | 'complex'
  complexityAfter: 'simple' | 'moderate' | 'complex'
  cognitiveLoad: 'reduced' | 'same' | 'increased'
  discoverability: 'improved' | 'same' | 'degraded'
}

export interface PatternChange {
  pattern: string
  action: 'added' | 'removed' | 'modified'
  description: string
  impact: 'medium'
}

// ============================================
// CONTENT COMPARISON TYPES
// ============================================

export interface ContentComparison {
  structuralChanges: StructuralChange[]
  textChanges: TextChange[]
  mediaChanges: MediaChange[]
  messagingComparison: MessagingComparison
}

export interface StructuralChange {
  type: 'section-added' | 'section-removed' | 'section-moved'
  section: string
  description: string
}

export interface TextChange {
  element: string
  type: 'added' | 'removed' | 'modified'
  from: string
  to: string
  impact: 'low'
}

export interface MediaChange {
  type: 'image' | 'video' | 'icon'
  action: 'added' | 'removed' | 'replaced'
  description: string
}

export interface MessagingComparison {
  toneChanges: ToneChange[]
  ctaChanges: CTAChange[]
  valuePropChanges: ValuePropChange[]
}

export interface ToneChange {
  from: string
  to: string
  description: string
}

export interface CTAChange {
  cta: string
  change: 'text' | 'placement' | 'style' | 'removed'
  description: string
}

export interface ValuePropChange {
  from: string
  to: string
  description: string
}

// ============================================
// TECHNICAL COMPARISON TYPES
// ============================================

export interface TechnicalComparison {
  performanceMetrics: PerformanceComparison
  codeComplexity: ComplexityComparison
  technologyChanges: TechnologyChange[]
  bestPractices: BestPracticesComparison
}

export interface PerformanceComparison {
  loadTimeBefore?: number
  loadTimeAfter?: number
  sizeBefore?: number
  sizeAfter?: number
  requestsBefore?: number
  requestsAfter?: number
  improvement: 'better' | 'same' | 'worse'
}

export interface ComplexityComparison {
  domElementsBefore: number
  domElementsAfter: number
  depthBefore: number
  depthAfter: number
  complexityChange: 'simpler' | 'same' | 'more-complex'
}

export interface TechnologyChange {
  type: 'added' | 'removed' | 'upgraded'
  technology: string
  description: string
}

export interface BestPracticesComparison {
  improvements: string[]
  regressions: string[]
}

// ============================================
// OPPORTUNITY TYPES
// ============================================

export interface Opportunity {
  id: string
  category: OpportunityCategory
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'small' | 'medium' | 'large'
  priority: number
  snapshots: number[] // Relevant snapshot indices
}

export type OpportunityCategory =
  | 'ux-improvement'
  | 'performance'
  | 'accessibility'
  | 'conversion'
  | 'maintenance'
  | 'innovation'

// ============================================
// RECOMMENDATION TYPES
// ============================================

export interface Recommendation {
  id: string
  type: RecommendationType
  title: string
  description: string
  rationale: string
  effort: 'small' | 'medium' | 'large'
  impact: 'high' | 'medium' | 'low'
  priority: number
}

export type RecommendationType =
  | 'implement'
  | 'remove'
  | 'modify'
  | 'consolidate'
  | 'experiment'

// ============================================
// COMPARISON MATRIX TYPES
// ============================================

export interface ComparisonMatrix {
  dimensions: ComparisonDimension[]
  scores: ComparisonScore[]
}

export interface ComparisonDimension {
  name: string
  weight: number
  category: 'visual' | 'ux' | 'content' | 'technical'
}

export interface ComparisonScore {
  snapshotIndex: number
  dimension: string
  score: number
  normalizedScore: number
  notes: string
}

// ============================================
// CONFIG
// ============================================

export interface CompareConfig {
  includeVisualDiff: boolean
  includeUXComparison: boolean
  includeContentComparison: boolean
  includeTechnicalComparison: boolean
  sensitivity: 'strict' | 'balanced' | 'lenient'
}

export const DEFAULT_COMPARE_CONFIG: CompareConfig = {
  includeVisualDiff: true,
  includeUXComparison: true,
  includeContentComparison: true,
  includeTechnicalComparison: true,
  sensitivity: 'balanced'
}
