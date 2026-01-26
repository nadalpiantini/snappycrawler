// ============================================
// AI CONTEXT PACK - Public API
// ============================================

// Type exports
export type {
  // Input types
  AIContextInput,

  // System brief types
  SystemBrief,
  BriefOverview,
  BriefContext,
  BriefObjective,
  BriefConstraint,
  BriefAssumption,

  // Constraints types
  Constraints,
  TechnicalConstraint,
  BusinessConstraint,
  DesignConstraint,
  NegativeConstraint,

  // Code schema types
  CodeSchema,
  ComponentSchema,
  ComponentProp,
  ComponentState,
  UtilitySchema,
  UtilityFunction,
  HookSchema,
  HookParam,
  TypeSchema,
  DataFlowSchema,
  StateManagementSchema,

  // Tasks types
  SuggestedTasks,
  TaskSuggestion,

  // Output types
  AIContextOutput,
  AIContextMeta,
  SystemPrompts,

  // Config
  AIContextConfig
} from './types'

// Main analysis function
export {
  analyzeAIContext,
  validateAIContextInput,
  getContextSummary
} from './analyzer'

// Output generators
export {
  generateAllOutputs,
  generateSystemBriefMarkdown,
  generateConstraintsJSON,
  generateCodeSchemaJSON,
  generateTasksJSON,
  generateFullContext,
  formatSystemPrompt,
  getPromptByRole
} from './generators'

// Constants
export { DEFAULT_AI_CONTEXT_CONFIG } from './types'

// Default output
export { getDefaultAIContextOutput } from './analyzer'
