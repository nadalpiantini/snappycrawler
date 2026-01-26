// ============================================
// LLM MODULE - Public API
// ============================================

// Configuration & Token Management
export type {
  LLMConfig,
  TokenStorage
} from './config'

export {
  DEEPSEEK_CONFIG,
  ensureTokenDir,
  saveToken,
  loadToken,
  hasToken,
  clearToken,
  getLLMConfig,
  getLLMConfigFromEnv,
  getLLMConfigFromBackend
} from './config'

// DeepSeek Client
export type {
  Message,
  ChatRequest,
  ChatResponse
} from './deepseek-client'

export {
  DeepSeekClient,
  createDeepSeekClient,
  DeepSeekPromptOptimizer,
  DeepSeekError,
  handleDeepSeekError
} from './deepseek-client'

// Prompts
export {
  generateDeveloperPrompt,
  generateDesignerPrompt,
  generatePMPrompt,
  generateLLMPrompt,
  generateGenericPrompt,
  generateCodePrompt,
  generateDebugPrompt,
  generateRefactorPrompt,
  generateAnalysisPrompt
} from './prompts'
