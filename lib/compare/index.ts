// ============================================
// COMPARE - Public API
// ============================================

// Type exports
export type {
  // Input types
  CompareInput,
  CompareOptions,

  // Comparison types
  SnapshotComparison,
  ComparisonMeta,
  MajorChange,

  // Visual diff types
  VisualDiff,
  LayoutChange,
  LayoutChangeType,
  ColorChange,
  TypographyChange,
  SpacingChange,
  ComponentChange,
  VisualDiffSummary,

  // UX comparison types
  UXComparison,
  FlowChange,
  InteractionChange,
  InteractionChangeType,
  AccessibilityComparison,
  UsabilityComparison,
  PatternChange,

  // Content comparison types
  ContentComparison,
  StructuralChange,
  TextChange,
  MediaChange,
  MessagingComparison,
  ToneChange,
  CTAChange,
  ValuePropChange,

  // Technical comparison types
  TechnicalComparison,
  PerformanceComparison,
  ComplexityComparison,
  TechnologyChange,
  BestPracticesComparison,

  // Opportunity types
  Opportunity,
  OpportunityCategory,

  // Recommendation types
  Recommendation,
  RecommendationType,

  // Matrix types
  ComparisonMatrix,
  ComparisonDimension,
  ComparisonScore,

  // Config
  CompareConfig
} from './types'

// Main comparison function
export {
  compareSnapshots,
  validateCompareInput,
  getCompareSummary
} from './analyzer'

// Output generators
export {
  generateAllOutputs,
  generateCompareReport,
  generateComparisonMatrix,
  formatChangeSummary,
  getMajorChangesOnly,
  getHighImpactOpportunities,
  getTopRecommendations
} from './generators'

// Constants
export { DEFAULT_COMPARE_CONFIG } from './types'

// Default output
export { getDefaultSnapshotComparison } from './analyzer'
