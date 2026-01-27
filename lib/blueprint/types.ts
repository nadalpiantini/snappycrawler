// Blueprint Types - Product Blueprint Interpreter
// Transforms snapshots into comprehensible product models

export interface Blueprint {
  meta: BlueprintMeta
  overview: BlueprintOverview
  intent: ProductIntent
  structure: StructuralModel
  journey: InferredJourney
  designDna: DesignDNA
  insights: BlueprintInsights
  takeaways: BuilderTakeaways
}

// ============================================
// META
// ============================================

export interface BlueprintMeta {
  id: string
  url: string
  title: string
  capturedAt: string
  analyzedAt: string
  version: string
  confidence: number // 0-1 overall confidence
}

// ============================================
// SECTION 1: OVERVIEW (Executive Summary)
// ============================================

export interface BlueprintOverview {
  pageType: PageType
  primaryGoal: string
  clarityScore: ClarityLevel
  complexityScore: ComplexityLevel
  interactivityLevel: InteractivityLevel
  alerts: Alert[]
  oneLiner: string // "This is a conversion-focused landing page..."
}

export type PageType =
  | 'landing'
  | 'homepage'
  | 'product'
  | 'pricing'
  | 'checkout'
  | 'dashboard'
  | 'blog'
  | 'docs'
  | 'auth'
  | 'profile'
  | 'settings'
  | 'marketing'
  | 'app'
  | 'unknown'

export type ClarityLevel = 'high' | 'medium' | 'low'
export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'dense'
export type InteractivityLevel = 'static' | 'light' | 'moderate' | 'heavy' | 'app-like'

export interface Alert {
  type: 'warning' | 'info' | 'success' | 'error'
  message: string
  severity: 'low' | 'medium' | 'high'
}

// ============================================
// SECTION 2: INTENT (Product Intent Lens)
// ============================================

export interface ProductIntent {
  primaryAction: string // What the page wants users to do
  valueProposition: string // What it promises
  targetAudience: string[] // Who it's for
  persuasionTechniques: PersuasionTechnique[]
  coherenceScore: number // 0-1, how well aligned is the message
  frictionPoints: FrictionPoint[]
  strengths: string[]
  weaknesses: string[]
}

export interface PersuasionTechnique {
  name: string // "Social Proof", "Urgency", "Authority"
  evidence: string // Where it appears
  effectiveness: 'strong' | 'moderate' | 'weak'
}

export interface FrictionPoint {
  location: string
  issue: string
  impact: 'minor' | 'moderate' | 'major'
  suggestion: string
}

// ============================================
// SECTION 3: STRUCTURE (Component Thinking Lens)
// ============================================

export interface StructuralModel {
  sections: ConceptualSection[]
  hierarchy: HierarchyNode[]
  patterns: StructuralPattern[]
  redundancies: Redundancy[]
  balance: LayoutBalance
  flowDirection: 'linear' | 'branching' | 'circular' | 'scattered'
}

export interface ConceptualSection {
  type: SectionType
  label: string
  position: 'above-fold' | 'mid-page' | 'below-fold' | 'footer'
  importance: 'critical' | 'supporting' | 'secondary' | 'tertiary'
  hasContent: boolean
  hasCta: boolean
  notes: string[]
}

export type SectionType =
  | 'hero'
  | 'navigation'
  | 'features'
  | 'benefits'
  | 'social-proof'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'cta-block'
  | 'content'
  | 'media'
  | 'form'
  | 'footer'
  | 'sidebar'
  | 'modal'
  | 'unknown'

export interface HierarchyNode {
  element: string
  depth: number
  type: string
  children?: HierarchyNode[]
}

export interface StructuralPattern {
  name: string // "Hero → Features → Proof → CTA"
  isCommon: boolean
  effectiveness: string
}

export interface Redundancy {
  type: string
  count: number
  suggestion: string
}

export interface LayoutBalance {
  visualWeight: 'balanced' | 'top-heavy' | 'bottom-heavy' | 'left-heavy' | 'right-heavy'
  whitespace: 'generous' | 'adequate' | 'cramped'
  density: 'sparse' | 'moderate' | 'dense'
}

// ============================================
// SECTION 4: JOURNEY (User Journey Lens)
// ============================================

export interface InferredJourney {
  stages: JourneyStage[]
  primaryPath: string[]
  alternativePaths: string[][]
  entryPoint: string
  idealExit: string
  dropOffRisks: DropOffRisk[]
  estimatedTimeOnPage: string
  scrollDepthExpected: string
}

export interface JourneyStage {
  order: number
  action: string // "See headline", "Scan features", "Click CTA"
  element: string
  emotion: 'curious' | 'interested' | 'convinced' | 'hesitant' | 'confused' | 'ready'
  friction: number // 0-1
  notes: string[]
}

export interface DropOffRisk {
  location: string
  reason: string
  probability: 'low' | 'medium' | 'high'
  mitigation: string
}

// ============================================
// SECTION 5: DESIGN DNA (Design Personality Lens)
// ============================================

export interface DesignDNA {
  personality: DesignPersonality
  system: DesignSystem
  characteristics: DesignCharacteristic[]
  moodBoard: string[] // Descriptive words
  influences: string[] // "Apple-like", "Startup-vibes", etc.
}

export interface DesignPersonality {
  spectrum: {
    minimal: number // 0-100
    dense: number
    conservative: number
    expressive: number
    systematic: number
    improvised: number
    playful: number
    serious: number
  }
  primaryTrait: string
  secondaryTrait: string
  description: string
}

export interface DesignSystem {
  hasConsistentTypography: boolean
  hasConsistentSpacing: boolean
  hasColorSystem: boolean
  hasComponentPatterns: boolean
  maturityLevel: 'polished' | 'developing' | 'inconsistent' | 'chaotic'
  observations: string[]
}

export interface DesignCharacteristic {
  trait: string
  evidence: string
  impact: 'positive' | 'neutral' | 'negative'
}

// ============================================
// SECTION 6: INSIGHTS (Reuse & Improve Lens)
// ============================================

export interface BlueprintInsights {
  stealThis: StealableElement[]
  fixThis: ImprovementSuggestion[]
  patterns: ReusablePattern[]
  antiPatterns: AntiPattern[]
}

export interface StealableElement {
  what: string
  why: string
  where: string
  howToUse: string
  difficulty: 'easy' | 'moderate' | 'advanced'
}

export interface ImprovementSuggestion {
  issue: string
  location: string
  impact: 'low' | 'medium' | 'high'
  suggestion: string
  effort: 'quick-fix' | 'moderate' | 'significant'
}

export interface ReusablePattern {
  name: string
  description: string
  useCase: string
  implementation: string
}

export interface AntiPattern {
  name: string
  issue: string
  consequence: string
  alternative: string
}

// ============================================
// SECTION 7: TAKEAWAYS (Builder Lessons)
// ============================================

export interface BuilderTakeaways {
  topInsights: Insight[]
  errorsToAvoid: string[]
  actionableIdea: ActionableIdea
  learningMoment: string
  builderQuestion: string // Question to ask yourself
}

export interface Insight {
  title: string
  description: string
  applicability: 'universal' | 'situational' | 'niche'
}

export interface ActionableIdea {
  title: string
  description: string
  timeToImplement: 'minutes' | 'hours' | 'days'
  impact: 'incremental' | 'meaningful' | 'transformative'
}

// ============================================
// ANALYSIS REQUEST/RESPONSE
// ============================================

export interface BlueprintAnalysisRequest {
  snapshotId: string
  includeScreenshot?: boolean
  depth?: 'quick' | 'standard' | 'deep'
}

export interface BlueprintAnalysisResponse {
  success: boolean
  blueprint: Blueprint | null
  error?: string
  processingTime?: number
}
