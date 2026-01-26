// ============================================
// AI CONTEXT PACK - Type Definitions
// ============================================

import { RawSnapshot } from '../types'

// ============================================
// INPUT TYPES
// ============================================

export interface AIContextInput {
  snapshot: RawSnapshot
  designTokens?: any
  uxAnalysis?: any
  wireframe?: any
  targetAudience?: 'developer' | 'designer' | 'pm' | 'llm'
}

// ============================================
// SYSTEM BRIEF TYPES
// ============================================

export interface SystemBrief {
  overview: BriefOverview
  context: BriefContext
  objectives: BriefObjective[]
  constraints: BriefConstraint[]
  assumptions: BriefAssumption[]
}

export interface BriefOverview {
  pageTitle: string
  url: string
  pageType: string
  primaryPurpose: string
  targetUsers: string[]
  coreValue: string
}

export interface BriefContext {
  businessDomain: string
  industryVertical?: string
  companyStage: 'startup' | 'growth' | 'enterprise' | 'unknown'
  marketPosition: string
  competitorContext?: string
}

export interface BriefObjective {
  priority: 'critical' | 'high' | 'medium' | 'low'
  goal: string
  successMetric: string
  userImpact: string
}

export interface BriefConstraint {
  type: ConstraintType
  description: string
  reason: string
  alternatives: string[]
}

export type ConstraintType =
  | 'technical'     // Tech stack limitations
  | 'business'       // Business rules
  | 'design'         // Design system constraints
  | 'legal'          // Legal/compliance
  | 'accessibility'  // A11y requirements
  | 'performance'    // Performance targets
  | 'security'       // Security requirements

export interface BriefAssumption {
  category: AssumptionCategory
  assumption: string
  confidence: 'high' | 'medium' | 'low'
  validationMethod: string
  impactIfWrong: string
}

export type AssumptionCategory =
  | 'user-behavior'
  | 'technical'
  | 'business'
  | 'market'
  | 'design'

// ============================================
// CONSTRAINTS TYPES
// ============================================

export interface Constraints {
  technical: TechnicalConstraint[]
  business: BusinessConstraint[]
  design: DesignConstraint[]
  negative: NegativeConstraint[]
}

export interface TechnicalConstraint {
  aspect: string
  limitation: string
  workaround?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface BusinessConstraint {
  rule: string
  reason: string
  source: 'legal' | 'policy' | 'strategy' | 'unknown'
  enforceable: boolean
}

export interface DesignConstraint {
  element: string
  constraint: string
  rationale: string
  flexibility: 'strict' | 'moderate' | 'flexible'
}

export interface NegativeConstraint {
  category: string
  dont: string[]
  reason: string
  examples: string[]
}

// ============================================
// CODE SCHEMA TYPES
// ============================================

export interface CodeSchema {
  components: ComponentSchema[]
  utilities: UtilitySchema[]
  hooks: HookSchema[]
  types: TypeSchema[]
  dataFlow: DataFlowSchema[]
  stateManagement: StateManagementSchema
}

export interface ComponentSchema {
  name: string
  purpose: string
  props: ComponentProp[]
  state?: ComponentState[]
  children?: ComponentSchema[]
  dependencies: string[]
  complexity: 'simple' | 'moderate' | 'complex'
}

export interface ComponentProp {
  name: string
  type: PropType
  required: boolean
  defaultValue?: any
  description: string
}

export type PropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'function'
  | 'ReactNode'
  | 'custom'

export interface ComponentState {
  name: string
  type: PropType
  initial: any
  description: string
}

export interface UtilitySchema {
  category: string
  functions: UtilityFunction[]
}

export interface UtilityFunction {
  name: string
  purpose: string
  signature: string
  example: string
}

export interface HookSchema {
  name: string
  purpose: string
  params: HookParam[]
  returns: string
  usage: string
}

export interface HookParam {
  name: string
  type: string
  required: boolean
  description: string
}

export interface TypeSchema {
  name: string
  definition: string
  usage: string[]
}

export interface DataFlowSchema {
  source: string
  destination: string
  trigger: string
  transformation?: string
}

export interface StateManagementSchema {
  approach: 'local' | 'context' | 'redux' | 'zustand' | 'jotai' | 'unknown'
  globalState: StateSchema[]
  localState: StateSchema[]
  dataFlow: DataFlowSchema[]
}

export interface StateSchema {
  name: string
  type: string
  scope: string
  persistence: boolean
}

// ============================================
// SUGGESTED TASKS TYPES
// ============================================

export interface SuggestedTasks {
  implementation: TaskSuggestion[]
  testing: TaskSuggestion[]
  documentation: TaskSuggestion[]
  optimization: TaskSuggestion[]
}

export interface TaskSuggestion {
  id: string
  title: string
  description: string
  priority: 'p0' | 'p1' | 'p2' | 'p3'
  estimatedEffort: 'small' | 'medium' | 'large' | 'xlarge'
  dependencies: string[]
  acceptanceCriteria: string[]
}

// ============================================
// OUTPUT TYPES
// ============================================

export interface AIContextOutput {
  meta: AIContextMeta
  systemBrief: SystemBrief
  constraints: Constraints
  codeSchema: CodeSchema
  suggestedTasks: SuggestedTasks
  systemPrompts: SystemPrompts
}

export interface AIContextMeta {
  generatedAt: string
  sourceUrl: string
  pageType: string
  targetAudience: string
  version: string
  confidence: number
}

export interface SystemPrompts {
  developer: string
  designer: string
  pm: string
  llm: string
  generic: string
}

// ============================================
// CONFIG
// ============================================

export interface AIContextConfig {
  includeSystemBrief: boolean
  includeConstraints: boolean
  includeCodeSchema: boolean
  includeTasks: boolean
  detailLevel: 'minimal' | 'standard' | 'comprehensive'
  targetAudience?: 'developer' | 'designer' | 'pm' | 'llm'
}

export const DEFAULT_AI_CONTEXT_CONFIG: AIContextConfig = {
  includeSystemBrief: true,
  includeConstraints: true,
  includeCodeSchema: true,
  includeTasks: true,
  detailLevel: 'standard'
}
