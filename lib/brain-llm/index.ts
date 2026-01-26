// ============================================
// BRAIN LLM - Public API
// ============================================

// Type exports
export type {
  // Input types
  BrainInput,

  // Analysis types
  BrainAnalysis,
  BrainMeta,
  Insight,
  InsightCategory,
  Evidence,
  Pattern,
  PatternType,
  PatternOccurrence,
  IntentInference,
  UserGoal,
  BusinessGoal,
  CrossModeFinding,
  Explanation,

  // Config
  BrainConfig
} from './types'

// Main analysis function
export {
  analyzeWithBrain,
  validateBrainInput,
  getBrainSummary
} from './analyzer'

// Constants
export { DEFAULT_BRAIN_CONFIG } from './types'

// Default output
export { getDefaultBrainAnalysis } from './analyzer'
