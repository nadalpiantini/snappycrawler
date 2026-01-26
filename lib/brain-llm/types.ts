// ============================================
// BRAIN LLM - Cross-Mode Reasoning Layer
// ============================================

import { RawSnapshot } from '../types'
import { WireframeOutput } from '../wireframe-engine/types'
import { AIContextOutput } from '../ai-context/types'
import { SnapshotComparison } from '../compare/types'

// ============================================
// INPUT TYPES
// ============================================

export interface BrainInput {
  snapshot: RawSnapshot
  wireframe?: WireframeOutput
  aiContext?: AIContextOutput
  comparison?: SnapshotComparison
}

// ============================================
// ANALYSIS TYPES
// ============================================

export interface BrainAnalysis {
  meta: BrainMeta
  insights: Insight[]
  patterns: Pattern[]
  intentInference: IntentInference
  crossModeFindings: CrossModeFinding[]
  explanations: Explanation[]
}

export interface BrainMeta {
  analyzedAt: string
  sourceUrl: string
  modesUsed: string[]
  confidence: number
  version: string
}

export interface Insight {
  id: string
  category: InsightCategory
  title: string
  description: string
  evidence: Evidence[]
  confidence: number
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  recommendations: string[]
}

export type InsightCategory =
  | 'ux-opportunity'
  | 'design-consistency'
  | 'performance'
  | 'accessibility'
  | 'business-value'
  | 'technical-debt'
  | 'innovation'

export interface Evidence {
  source: string // Mode name
  type: 'data' | 'observation' | 'metric'
  claim: string
  confidence: number
}

export interface Pattern {
  id: string
  name: string
  type: PatternType
  description: string
  occurrences: PatternOccurrence[]
  strength: 'strong' | 'moderate' | 'weak'
  crossDomain: boolean
  implications: string[]
}

export type PatternType =
  | 'visual'
  | 'interaction'
  | 'content'
  | 'structural'
  | 'technical'

export interface PatternOccurrence {
  location: string
  context: string
  frequency: number
}

export interface IntentInference {
  primaryIntent: string
  secondaryIntents: string[]
  confidence: number
  reasoning: string
  userGoals: UserGoal[]
  businessGoals: BusinessGoal[]
}

export interface UserGoal {
  goal: string
  priority: 'high' | 'medium' | 'low'
  evidence: string[]
}

export interface BusinessGoal {
  goal: string
  priority: 'high' | 'medium' | 'low'
  kpi: string
}

export interface CrossModeFinding {
  title: string
  description: string
  modesInvolved: string[]
  consistency: 'consistent' | 'contradictory' | 'complementary'
  implications: string[]
  confidence: number
}

export interface Explanation {
  topic: string
  explanation: string
  complexity: 'simple' | 'moderate' | 'complex'
  evidence: Evidence[]
  confidence: number
  audience: 'technical' | 'business' | 'general'
}

// ============================================
// CONFIG
// ============================================

export interface BrainConfig {
  includeIntentInference: boolean
  includePatternDetection: boolean
  includeCrossModeAnalysis: boolean
  detailLevel: 'minimal' | 'standard' | 'comprehensive'
}

export const DEFAULT_BRAIN_CONFIG: BrainConfig = {
  includeIntentInference: true,
  includePatternDetection: true,
  includeCrossModeAnalysis: true,
  detailLevel: 'standard'
}
