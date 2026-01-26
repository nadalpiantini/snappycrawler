// ============================================
// AI CONTEXT PACK - Analyzer
// ============================================

import { RawSnapshot } from '../types'
import {
  generateDeveloperPrompt as deepSeekDeveloperPrompt,
  generateDesignerPrompt as deepSeekDesignerPrompt,
  generatePMPrompt as deepSeekPMPrompt,
  generateLLMPrompt as deepSeekLLMPrompt,
  generateGenericPrompt as deepSeekGenericPrompt
} from '../llm/prompts'
import {
  AIContextInput,
  AIContextOutput,
  AIContextMeta,
  SystemBrief,
  SystemPrompts,
  Constraints,
  CodeSchema,
  SuggestedTasks,
  BriefOverview,
  BriefContext,
  BriefObjective,
  BriefConstraint,
  BriefAssumption,
  TechnicalConstraint,
  BusinessConstraint,
  DesignConstraint,
  NegativeConstraint,
  ComponentSchema,
  UtilitySchema,
  HookSchema,
  TypeSchema,
  DataFlowSchema,
  StateManagementSchema,
  TaskSuggestion,
  AIContextConfig,
  DEFAULT_AI_CONTEXT_CONFIG
} from './types'

// ============================================
// MAIN ANALYZER
// ============================================

export async function analyzeAIContext(
  input: AIContextInput,
  config: AIContextConfig = DEFAULT_AI_CONTEXT_CONFIG
): Promise<AIContextOutput> {
  // Validate input
  validateAIContextInput(input)

  // Generate system brief
  const systemBrief = generateSystemBrief(input)

  // Extract constraints
  const constraints = extractConstraints(input)

  // Generate code schema
  const codeSchema = generateCodeSchema(input)

  // Suggest tasks
  const suggestedTasks = suggestTasks(input, codeSchema)

  // Generate system prompts
  const systemPrompts = generateSystemPrompts(input, systemBrief, constraints)

  // Create metadata
  const meta: AIContextMeta = {
    generatedAt: new Date().toISOString(),
    sourceUrl: input.snapshot.url,
    pageType: detectPageType(input),
    targetAudience: input.targetAudience || 'developer',
    version: '1.0.0',
    confidence: calculateConfidence(input)
  }

  return {
    meta,
    systemBrief,
    constraints,
    codeSchema,
    suggestedTasks,
    systemPrompts
  }
}

// ============================================
// VALIDATION
// ============================================

export function validateAIContextInput(input: AIContextInput): void {
  if (!input.snapshot) {
    throw new Error('AIContextInput requires snapshot')
  }

  if (!input.snapshot.url) {
    throw new Error('Snapshot must contain URL')
  }
}

export function getContextSummary(input: AIContextInput): string {
  const { snapshot, targetAudience } = input

  return `
AI Context Analysis Summary
===========================
URL: ${snapshot.url}
Title: ${snapshot.title || 'Untitled'}
Target Audience: ${targetAudience || 'developer'}
Has Design Tokens: ${!!input.designTokens}
Has UX Analysis: ${!!input.uxAnalysis}
Has Wireframe: ${!!input.wireframe}
  `.trim()
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculateConfidence(input: AIContextInput): number {
  const scores: number[] = []

  // Has snapshot data
  if (input.snapshot?.html) scores.push(0.3)
  if (input.snapshot?.text?.length > 0) scores.push(0.2)

  // Has additional analysis
  if (input.designTokens) scores.push(0.2)
  if (input.uxAnalysis) scores.push(0.15)
  if (input.wireframe) scores.push(0.15)

  const confidence = scores.reduce((sum, score) => sum + score, 0)
  return Math.min(1, confidence)
}

// ============================================
// SYSTEM BRIEF GENERATION
// ============================================

function generateSystemBrief(input: AIContextInput): SystemBrief {
  const overview = generateOverview(input)
  const context = generateContext(input)
  const objectives = generateObjectives(input)
  const constraints = generateBriefConstraints(input)
  const assumptions = generateAssumptions(input)

  return {
    overview,
    context,
    objectives,
    constraints,
    assumptions
  }
}

function generateOverview(input: AIContextInput): BriefOverview {
  const { snapshot, uxAnalysis } = input

  return {
    pageTitle: snapshot.title || 'Untitled Page',
    url: snapshot.url,
    pageType: detectPageType(input),
    primaryPurpose: detectPrimaryPurpose(input),
    targetUsers: detectTargetUsers(input),
    coreValue: detectCoreValue(input)
  }
}

function detectPageType(input: AIContextInput): string {
  const { snapshot, uxAnalysis } = input

  // Check for form patterns
  const hasForms = snapshot.ux?.some(e => e.type === 'submit')
  if (hasForms && snapshot.html?.includes('login')) return 'auth'
  if (hasForms && snapshot.html?.includes('signup')) return 'signup'
  if (hasForms && snapshot.html?.includes('checkout')) return 'checkout'
  if (hasForms) return 'form'

  // Check for content patterns
  if (snapshot.html?.includes('blog') || snapshot.html?.includes('article')) return 'blog'
  if (snapshot.html?.includes('product')) return 'product'
  if (snapshot.html?.includes('cart')) return 'cart'

  // Check for listing patterns
  if (snapshot.html?.includes('listing') || snapshot.html?.includes('directory')) return 'listing'

  return 'content'
}

function detectPrimaryPurpose(input: AIContextInput): string {
  const pageType = detectPageType(input)

  const purposes: Record<string, string> = {
    auth: 'User authentication',
    signup: 'User registration',
    checkout: 'Purchase completion',
    form: 'Data collection',
    blog: 'Content delivery',
    product: 'Product information',
    cart: 'Order review',
    listing: 'Item browsing',
    content: 'Information delivery'
  }

  return purposes[pageType] || 'Information delivery'
}

function detectTargetUsers(input: AIContextInput): string[] {
  const users: string[] = []

  const { snapshot } = input

  // Detect user types from content
  if (snapshot.html?.includes('admin') || snapshot.html?.includes('dashboard')) {
    users.push('administrators')
  }

  if (snapshot.html?.includes('pricing') || snapshot.html?.includes('enterprise')) {
    users.push('business customers')
  }

  if (snapshot.html?.includes('developer') || snapshot.html?.includes('api')) {
    users.push('developers')
  }

  // Default
  if (users.length === 0) {
    users.push('general users')
  }

  return users
}

function detectCoreValue(input: AIContextInput): string {
  const { snapshot, uxAnalysis } = input

  // Look for value propositions
  const valueKeywords = [
    'fast', 'easy', 'simple', 'secure', 'free',
    'best', 'professional', 'powerful', 'innovative'
  ]

  const text = (snapshot.text || []).join(' ').toLowerCase()

  for (const keyword of valueKeywords) {
    if (text.includes(keyword)) {
      return `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} experience`
    }
  }

  return 'Efficient user experience'
}

function generateContext(input: AIContextInput): BriefContext {
  const { snapshot } = input

  return {
    businessDomain: detectBusinessDomain(snapshot.url),
    industryVertical: detectIndustryVertical(snapshot),
    companyStage: detectCompanyStage(snapshot),
    marketPosition: 'Emerging player',
    competitorContext: 'Standard web application'
  }
}

function detectBusinessDomain(url: string): string {
  if (url.includes('saas') || url.includes('app')) return 'SaaS'
  if (url.includes('shop') || url.includes('store')) return 'E-commerce'
  if (url.includes('blog') || url.includes('news')) return 'Media'
  if (url.includes('edu') || url.includes('learn')) return 'Education'
  return 'Web Application'
}

function detectIndustryVertical(snapshot: RawSnapshot): string | undefined {
  const { html, url } = snapshot

  if (url.includes('fintech') || html?.includes('finance')) return 'Fintech'
  if (url.includes('health') || html?.includes('medical')) return 'Healthcare'
  if (url.includes('edu') || html?.includes('learning')) return 'EdTech'

  return undefined
}

function detectCompanyStage(snapshot: RawSnapshot): 'startup' | 'growth' | 'enterprise' | 'unknown' {
  const { url } = snapshot

  // Known companies
  if (url.includes('google.com') || url.includes('microsoft.com') || url.includes('amazon.com')) {
    return 'enterprise'
  }

  // Check for startup patterns
  if (url.includes('beta') || url.includes('early')) {
    return 'startup'
  }

  return 'growth'
}

function generateObjectives(input: AIContextInput): BriefObjective[] {
  const objectives: BriefObjective[] = []

  const { snapshot } = input

  // Primary objective
  objectives.push({
    priority: 'critical',
    goal: 'Enable users to complete primary action efficiently',
    successMetric: 'Completion rate > 80%',
    userImpact: 'Users can achieve their goals without friction'
  })

  // Secondary objectives based on page type
  const pageType = detectPageType(input)

  if (pageType === 'auth' || pageType === 'signup') {
    objectives.push({
      priority: 'critical',
      goal: 'Secure user authentication',
      successMetric: 'Zero security breaches',
      userImpact: 'User data remains protected'
    })
  }

  if (pageType === 'checkout' || pageType === 'cart') {
    objectives.push({
      priority: 'high',
      goal: 'Smooth checkout process',
      successMetric: 'Cart abandonment < 30%',
      userImpact: 'Users can complete purchases easily'
    })
  }

  objectives.push({
    priority: 'medium',
    goal: 'Provide clear navigation and wayfinding',
    successMetric: 'User can find content in < 3 clicks',
    userImpact: 'Reduced cognitive load'
  })

  return objectives
}

function generateBriefConstraints(input: AIContextInput): BriefConstraint[] {
  const constraints: BriefConstraint[] = []

  // Technical constraints
  constraints.push({
    type: 'technical',
    description: 'Must work across modern browsers',
    reason: 'Cross-platform compatibility',
    alternatives: ['Progressive enhancement', 'Graceful degradation']
  })

  constraints.push({
    type: 'accessibility',
    description: 'Must meet WCAG 2.1 AA standards',
    reason: 'Legal compliance and inclusivity',
    alternatives: ['WCAG AAA (stricter)', 'Section 508']
  })

  constraints.push({
    type: 'performance',
    description: 'Page load < 3 seconds on 4G',
    reason: 'User experience expectations',
    alternatives: ['Progressive loading', 'Code splitting']
  })

  // Design constraints
  if (input.designTokens) {
    constraints.push({
      type: 'design',
      description: 'Must follow established design system',
      reason: 'Brand consistency',
      alternatives: ['Custom design', 'Third-party library']
    })
  }

  return constraints
}

function generateAssumptions(input: AIContextInput): BriefAssumption[] {
  const assumptions: BriefAssumption[] = []

  // User behavior assumptions
  assumptions.push({
    category: 'user-behavior',
    assumption: 'Users are familiar with standard web patterns',
    confidence: 'high',
    validationMethod: 'User testing with target audience',
    impactIfWrong: 'Higher drop-off rates, confusion'
  })

  assumptions.push({
    category: 'technical',
    assumption: 'Users have modern browsers with JavaScript enabled',
    confidence: 'high',
    validationMethod: 'Browser analytics review',
    impactIfWrong: 'Core functionality unavailable to some users'
  })

  // Business assumptions
  const pageType = detectPageType(input)

  if (pageType === 'checkout' || pageType === 'cart') {
    assumptions.push({
      category: 'business',
      assumption: 'Users are ready to purchase',
      confidence: 'medium',
      validationMethod: 'Conversion funnel analysis',
      impactIfWrong: 'Low conversion rates'
    })
  }

  assumptions.push({
    category: 'market',
    assumption: 'Users prefer web over mobile app',
    confidence: 'medium',
    validationMethod: 'Platform usage analytics',
    impactIfWrong: 'Investment in wrong platform'
  })

  return assumptions
}

// ============================================
// CONSTRAINTS EXTRACTION
// ============================================

function extractConstraints(input: AIContextInput): Constraints {
  const technical = extractTechnicalConstraints(input)
  const business = extractBusinessConstraints(input)
  const design = extractDesignConstraints(input)
  const negative = extractNegativeConstraints(input)

  return {
    technical,
    business,
    design,
    negative
  }
}

function extractTechnicalConstraints(input: AIContextInput): TechnicalConstraint[] {
  const constraints: TechnicalConstraint[] = []

  // Browser compatibility
  constraints.push({
    aspect: 'Browser Support',
    limitation: 'Must support Chrome, Firefox, Safari, Edge (last 2 versions)',
    priority: 'high'
  })

  // Performance
  constraints.push({
    aspect: 'Performance',
    limitation: 'Initial load < 3s, Time to Interactive < 5s',
    workaround: 'Code splitting, lazy loading',
    priority: 'critical'
  })

  // Responsive
  constraints.push({
    aspect: 'Responsive Design',
    limitation: 'Must support 320px - 2560px viewport widths',
    priority: 'critical'
  })

  return constraints
}

function extractBusinessConstraints(input: AIContextInput): BusinessConstraint[] {
  const constraints: BusinessConstraint[] = []

  // Legal
  constraints.push({
    rule: 'Must comply with GDPR/CCPA as applicable',
    reason: 'Legal compliance',
    source: 'legal',
    enforceable: true
  })

  // Authentication
  if (detectPageType(input) === 'auth' || detectPageType(input) === 'signup') {
    constraints.push({
      rule: 'Must verify email before account activation',
      reason: 'Fraud prevention',
      source: 'policy',
      enforceable: true
    })
  }

  return constraints
}

function extractDesignConstraints(input: AIContextInput): DesignConstraint[] {
  const constraints: DesignConstraint[] = []

  if (input.designTokens) {
    constraints.push({
      element: 'Color System',
      constraint: 'Must use provided color tokens',
      rationale: 'Brand consistency',
      flexibility: 'strict'
    })

    constraints.push({
      element: 'Typography',
      constraint: 'Must use provided type scale',
      rationale: 'Visual hierarchy',
      flexibility: 'moderate'
    })
  }

  return constraints
}

function extractNegativeConstraints(input: AIContextInput): NegativeConstraint[] {
  const constraints: NegativeConstraint[] = []

  constraints.push({
    category: 'User Experience',
    dont: [
      'Don\'t use native alerts (alert(), confirm())',
      'Don\'t auto-play audio/video',
      'Don\'t hijack scroll behavior',
      'Don\'t block content with modals without user action'
    ],
    reason: 'Negative user experience and accessibility issues',
    examples: [
      'Use custom modals instead of alerts',
      'Provide play button for media',
      'Allow user to control scroll',
      'Show modals only after user interaction'
    ]
  })

  constraints.push({
    category: 'Performance',
    dont: [
      'Don\'t load large images without optimization',
      'Don\'t render unnecessary DOM elements',
      'Don\'t bundle unused code',
      'Don\'t make synchronous network requests'
    ],
    reason: 'Performance degradation and poor UX',
    examples: [
      'Use responsive images (WebP, AVIF)',
      'Virtual DOM or lazy rendering',
      'Code splitting by route',
      'Use async/await or promises'
    ]
  })

  constraints.push({
    category: 'Security',
    dont: [
      'Don\'t store sensitive data in localStorage',
      'Don\'t expose API keys in client code',
      'Don\'t trust client-side validation',
      'Don\'t use eval() or similar'
    ],
    reason: 'Security vulnerabilities',
    examples: [
      'Use httpOnly cookies or session storage',
      'Proxy API calls through backend',
      'Always validate on server',
      'Use safer alternatives'
    ]
  })

  return constraints
}

// ============================================
// CODE SCHEMA GENERATION
// ============================================

function generateCodeSchema(input: AIContextInput): CodeSchema {
  const components = generateComponentSchema(input)
  const utilities = generateUtilitySchema(input)
  const hooks = generateHookSchema(input)
  const types = generateTypeSchema(input)
  const dataFlow = generateDataFlowSchema(input)
  const stateManagement = generateStateManagementSchema(input)

  return {
    components,
    utilities,
    hooks,
    types,
    dataFlow,
    stateManagement
  }
}

function generateComponentSchema(input: AIContextInput): ComponentSchema[] {
  const components: ComponentSchema[] = []

  // Detect components from HTML structure
  const { snapshot } = input

  // Header component
  if (snapshot.html?.includes('<header') || snapshot.html?.includes('navbar')) {
    components.push({
      name: 'Header',
      purpose: 'Site branding and navigation',
      props: [
        { name: 'logo', type: 'string', required: false, description: 'Company logo' },
        { name: 'navigation', type: 'array', required: true, description: 'Navigation items' },
        { name: 'user', type: 'object', required: false, description: 'User information' }
      ],
      dependencies: ['Navigation', 'Logo'],
      complexity: 'moderate'
    })
  }

  // Form components
  const hasForms = snapshot.ux?.some(e => e.type === 'submit')
  if (hasForms) {
    components.push({
      name: 'Form',
      purpose: 'User input and data collection',
      props: [
        { name: 'onSubmit', type: 'function', required: true, description: 'Form submit handler' },
        { name: 'fields', type: 'array', required: true, description: 'Form field definitions' },
        { name: 'initialValues', type: 'object', required: false, description: 'Initial form values' }
      ],
      state: [
        { name: 'values', type: 'object', initial: '{}', description: 'Current form values' },
        { name: 'errors', type: 'object', initial: '{}', description: 'Validation errors' },
        { name: 'touched', type: 'object', initial: '{}', description: 'Touched fields' }
      ],
      dependencies: ['Field', 'Button'],
      complexity: 'complex'
    })
  }

  // Button component
  components.push({
    name: 'Button',
    purpose: 'Interactive actions',
    props: [
      { name: 'onClick', type: 'function', required: true, description: 'Click handler' },
      { name: 'variant', type: 'string', required: false, defaultValue: 'primary', description: 'Button style' },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: false, description: 'Disabled state' },
      { name: 'loading', type: 'boolean', required: false, defaultValue: false, description: 'Loading state' }
    ],
    dependencies: [],
    complexity: 'simple'
  })

  return components
}

function generateUtilitySchema(input: AIContextInput): UtilitySchema[] {
  const utilities: UtilitySchema[] = []

  // API utilities
  utilities.push({
    category: 'API',
    functions: [
      {
        name: 'fetchData',
        purpose: 'Generic API request handler',
        signature: 'async function fetchData<T>(url: string, options?: RequestInit): Promise<T>',
        example: 'const user = await fetchData<User>("/api/user")'
      },
      {
        name: 'handleError',
        purpose: 'Centralized error handling',
        signature: 'function handleError(error: Error, context?: string): void',
        example: 'handleError(error, "fetching user")'
      }
    ]
  })

  // Validation utilities
  utilities.push({
    category: 'Validation',
    functions: [
      {
        name: 'validateEmail',
        purpose: 'Email format validation',
        signature: 'function validateEmail(email: string): boolean',
        example: 'validateEmail("user@example.com") // true'
      },
      {
        name: 'validateRequired',
        purpose: 'Required field validation',
        signature: 'function validateRequired(value: any): boolean',
        example: 'validateRequired("") // false'
      }
    ]
  })

  return utilities
}

function generateHookSchema(input: AIContextInput): HookSchema[] {
  const hooks: HookSchema[] = []

  // Data fetching hook
  hooks.push({
    name: 'useFetch',
    purpose: 'Data fetching with loading and error states',
    params: [
      { name: 'url', type: 'string', required: true, description: 'API endpoint' },
      { name: 'options', type: 'RequestInit', required: false, description: 'Fetch options' }
    ],
    returns: '{ data: T | null, loading: boolean, error: Error | null, refetch: () => void }',
    usage: 'const { data, loading } = useFetch<User>("/api/user")'
  })

  // Form hook
  hooks.push({
    name: 'useForm',
    purpose: 'Form state management',
    params: [
      { name: 'initialValues', type: 'object', required: true, description: 'Initial form values' },
      { name: 'validate', type: 'function', required: false, description: 'Validation function' }
    ],
    returns: '{ values, errors, handleChange, handleSubmit, reset }',
    usage: 'const { values, handleSubmit } = useForm({ email: "" })'
  })

  // Local storage hook
  hooks.push({
    name: 'useLocalStorage',
    purpose: 'Persist state to localStorage',
    params: [
      { name: 'key', type: 'string', required: true, description: 'Storage key' },
      { name: 'initialValue', type: 'any', required: true, description: 'Initial value' }
    ],
    returns: '[value, setValue]',
    usage: 'const [theme, setTheme] = useLocalStorage("theme", "light")'
  })

  return hooks
}

function generateTypeSchema(input: AIContextInput): TypeSchema[] {
  const types: TypeSchema[] = []

  // Common types
  types.push({
    name: 'User',
    definition: 'interface User { id: string; email: string; name?: string }',
    usage: ['Auth components', 'Profile display', 'User references']
  })

  types.push({
    name: 'ApiResponse',
    definition: 'interface ApiResponse<T> { data: T | null; error: string | null }',
    usage: ['API responses', 'Error handling']
  })

  return types
}

function generateDataFlowSchema(input: AIContextInput): DataFlowSchema[] {
  const flows: DataFlowSchema[] = []

  // Auth flow
  const pageType = detectPageType(input)
  if (pageType === 'auth' || pageType === 'signup') {
    flows.push({
      source: 'LoginForm',
      destination: 'AuthService',
      trigger: 'User submits form',
      transformation: 'Validate credentials → Generate token'
    })
  }

  // Form submission flow
  flows.push({
    source: 'Form',
    destination: 'API',
    trigger: 'User submits',
    transformation: 'Validate → Transform → Send'
  })

  return flows
}

function generateStateManagementSchema(input: AIContextInput): StateManagementSchema {
  return {
    approach: 'local',
    globalState: [],
    localState: [
      {
        name: 'formData',
        type: 'object',
        scope: 'component',
        persistence: false
      }
    ],
    dataFlow: []
  }
}

// ============================================
// TASK SUGGESTIONS
// ============================================

function suggestTasks(input: AIContextInput, codeSchema: CodeSchema): SuggestedTasks {
  const implementation = suggestImplementationTasks(input, codeSchema)
  const testing = suggestTestingTasks(input)
  const documentation = suggestDocumentationTasks(input)
  const optimization = suggestOptimizationTasks(input)

  return {
    implementation,
    testing,
    documentation,
    optimization
  }
}

function suggestImplementationTasks(input: AIContextInput, codeSchema: CodeSchema): TaskSuggestion[] {
  const tasks: TaskSuggestion[] = []

  // Component implementation tasks
  codeSchema.components.forEach(component => {
    tasks.push({
      id: `impl-${component.name.toLowerCase()}`,
      title: `Implement ${component.name} component`,
      description: `Create ${component.name} component with ${component.props.length} props`,
      priority: component.complexity === 'complex' ? 'p0' : 'p1',
      estimatedEffort: component.complexity === 'complex' ? 'large' : 'medium',
      dependencies: component.dependencies,
      acceptanceCriteria: [
        `Component accepts all defined props`,
        `Component handles edge cases`,
        `Component is accessible`,
        `Component has unit tests`
      ]
    })
  })

  return tasks
}

function suggestTestingTasks(input: AIContextInput): TaskSuggestion[] {
  const tasks: TaskSuggestion[] = []

  tasks.push({
    id: 'test-unit',
    title: 'Write unit tests for components',
    description: 'Add comprehensive unit tests using Jest/Vitest',
    priority: 'p1',
    estimatedEffort: 'medium',
    dependencies: [],
    acceptanceCriteria: [
      'All components have unit tests',
      'Coverage > 80%',
      'All tests pass'
    ]
  })

  tasks.push({
    id: 'test-e2e',
    title: 'Write E2E tests for critical flows',
    description: 'Add Playwright/Cypress tests for user journeys',
    priority: 'p2',
    estimatedEffort: 'large',
    dependencies: [],
    acceptanceCriteria: [
      'Critical flows covered',
      'Tests run in CI',
      'All tests pass'
    ]
  })

  return tasks
}

function suggestDocumentationTasks(input: AIContextInput): TaskSuggestion[] {
  const tasks: TaskSuggestion[] = []

  tasks.push({
    id: 'docs-components',
    title: 'Document component APIs',
    description: 'Add JSDoc comments and usage examples',
    priority: 'p2',
    estimatedEffort: 'medium',
    dependencies: [],
    acceptanceCriteria: [
      'All components documented',
      'Usage examples provided',
      'Props documented with types'
    ]
  })

  return tasks
}

function suggestOptimizationTasks(input: AIContextInput): TaskSuggestion[] {
  const tasks: TaskSuggestion[] = []

  tasks.push({
    id: 'opt-performance',
    title: 'Optimize bundle size',
    description: 'Implement code splitting and lazy loading',
    priority: 'p2',
    estimatedEffort: 'medium',
    dependencies: [],
    acceptanceCriteria: [
      'Bundle size < 200KB',
      'Code splitting implemented',
      'Lazy loading for non-critical components'
    ]
  })

  return tasks
}

// ============================================
// SYSTEM PROMPTS GENERATION
// ============================================

function generateSystemPrompts(
  input: AIContextInput,
  systemBrief: SystemBrief,
  constraints: Constraints
): SystemPrompts {
  return {
    developer: generateDeveloperPrompt(systemBrief, constraints),
    designer: generateDesignerPrompt(systemBrief, constraints),
    pm: generatePMPrompt(systemBrief, constraints),
    llm: generateLLMPrompt(systemBrief, constraints),
    generic: generateGenericPrompt(systemBrief, constraints)
  }
}

function generateDeveloperPrompt(brief: SystemBrief, constraints: Constraints): string {
  return deepSeekDeveloperPrompt(brief, constraints)
}

function generateDesignerPrompt(brief: SystemBrief, constraints: Constraints): string {
  return deepSeekDesignerPrompt(brief, constraints)
}

function generatePMPrompt(brief: SystemBrief, constraints: Constraints): string {
  return deepSeekPMPrompt(brief, constraints)
}

function generateLLMPrompt(brief: SystemBrief, constraints: Constraints): string {
  return deepSeekLLMPrompt(brief, constraints)
}

function generateGenericPrompt(brief: SystemBrief, constraints: Constraints): string {
  return deepSeekGenericPrompt(brief, constraints)
}

export function getDefaultAIContextOutput(): AIContextOutput {
  return {
    meta: {
      generatedAt: new Date().toISOString(),
      sourceUrl: '',
      pageType: 'content',
      targetAudience: 'developer',
      version: '1.0.0',
      confidence: 0.5
    },
    systemBrief: {
      overview: {
        pageTitle: '',
        url: '',
        pageType: '',
        primaryPurpose: '',
        targetUsers: [],
        coreValue: ''
      },
      context: {
        businessDomain: '',
        companyStage: 'unknown',
        marketPosition: ''
      },
      objectives: [],
      constraints: [],
      assumptions: []
    },
    constraints: {
      technical: [],
      business: [],
      design: [],
      negative: []
    },
    codeSchema: {
      components: [],
      utilities: [],
      hooks: [],
      types: [],
      dataFlow: [],
      stateManagement: {
        approach: 'local',
        globalState: [],
        localState: [],
        dataFlow: []
      }
    },
    suggestedTasks: {
      implementation: [],
      testing: [],
      documentation: [],
      optimization: []
    },
    systemPrompts: {
      developer: '',
      designer: '',
      pm: '',
      llm: '',
      generic: ''
    }
  }
}
