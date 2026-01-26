// ============================================
// BRAIN LLM - Cross-Mode Reasoning Analyzer
// ============================================

import {
  BrainInput,
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
  BrainConfig,
  DEFAULT_BRAIN_CONFIG
} from './types'

// ============================================
// MAIN ANALYZER
// ============================================

export async function analyzeWithBrain(
  input: BrainInput,
  config: BrainConfig = DEFAULT_BRAIN_CONFIG
): Promise<BrainAnalysis> {
  // Validate input
  validateBrainInput(input)

  // Generate insights from all modes
  const insights = generateInsights(input, config)

  // Detect patterns across modes
  const patterns = detectPatterns(input, config)

  // Infer user intent
  const intentInference = inferIntent(input)

  // Cross-mode analysis
  const crossModeFindings = analyzeCrossMode(input)

  // Generate explanations
  const explanations = generateExplanations(input, insights, patterns)

  // Create metadata
  const meta: BrainMeta = {
    analyzedAt: new Date().toISOString(),
    sourceUrl: input.snapshot.url,
    modesUsed: getAvailableModes(input),
    confidence: calculateBrainConfidence(input),
    version: '1.0.0'
  }

  return {
    meta,
    insights,
    patterns,
    intentInference,
    crossModeFindings,
    explanations
  }
}

// ============================================
// VALIDATION
// ============================================

export function validateBrainInput(input: BrainInput): void {
  if (!input.snapshot) {
    throw new Error('BrainInput requires snapshot')
  }

  if (!input.snapshot.url) {
    throw new Error('Snapshot must contain URL')
  }
}

function getAvailableModes(input: BrainInput): string[] {
  const modes: string[] = ['snapshot']

  if (input.wireframe) modes.push('wireframe')
  if (input.aiContext) modes.push('ai-context')
  if (input.comparison) modes.push('compare')

  return modes
}

// ============================================
// INSIGHT GENERATION
// ============================================

function generateInsights(input: BrainInput, config: BrainConfig): Insight[] {
  const insights: Insight[] = []

  // UX insights from wireframe
  if (input.wireframe) {
    insights.push(...generateUXInsights(input))
  }

  // Business insights from AI context
  if (input.aiContext) {
    insights.push(...generateBusinessInsights(input))
  }

  // Technical insights
  insights.push(...generateTechnicalInsights(input))

  // Accessibility insights
  insights.push(...generateAccessibilityInsights(input))

  return insights
}

function generateUXInsights(input: BrainInput): Insight[] {
  const insights: Insight[] = []

  if (!input.wireframe) return insights

  const { wireframe } = input

  // Layout complexity insight
  if (wireframe.structure.columns > 2) {
    insights.push({
      id: 'insight-ux-1',
      category: 'ux-opportunity',
      title: 'Complex Layout Detected',
      description: `Page uses ${wireframe.structure.columns}-column layout which may reduce readability on smaller screens`,
      evidence: [
        {
          source: 'wireframe',
          type: 'data',
          claim: `Layout has ${wireframe.structure.columns} columns`,
          confidence: 0.9
        }
      ],
      confidence: 0.85,
      impact: 'medium',
      actionable: true,
      recommendations: [
        'Consider simplifying to 1-2 columns for better mobile experience',
        'Use responsive breakpoints to stack columns on mobile',
        'Test with real users to validate layout effectiveness'
      ]
    })
  }

  // Sticky elements insight
  if (wireframe.structure.hasStickyHeader || wireframe.structure.hasStickyFooter) {
    insights.push({
      id: 'insight-ux-2',
      category: 'design-consistency',
      title: 'Sticky Navigation Detected',
      description: 'Page uses sticky elements which can improve UX but reduce available screen space',
      evidence: [
        {
          source: 'wireframe',
          type: 'observation',
          claim: `Sticky elements: ${[wireframe.structure.hasStickyHeader ? 'header' : '', wireframe.structure.hasStickyFooter ? 'footer' : ''].filter(Boolean).join(', ')}`,
          confidence: 0.95
        }
      ],
      confidence: 0.9,
      impact: 'low',
      actionable: false,
      recommendations: [
        'Ensure sticky elements don\'t cover critical content',
        'Consider adding dismiss button for persistent elements'
      ]
    })
  }

  return insights
}

function generateBusinessInsights(input: BrainInput): Insight[] {
  const insights: Insight[] = []

  if (!input.aiContext) return insights

  const { aiContext } = input

  // Conversion optimization
  if (aiContext.systemBrief.overview.pageType === 'landing' ||
      aiContext.systemBrief.overview.pageType === 'checkout') {
    insights.push({
      id: 'insight-biz-1',
      category: 'business-value',
      title: 'Conversion Optimization Opportunity',
      description: 'This page is critical for conversions and should be optimized carefully',
      evidence: [
        {
          source: 'ai-context',
          type: 'data',
          claim: `Page type: ${aiContext.systemBrief.overview.pageType}`,
          confidence: 1.0
        }
      ],
      confidence: 0.95,
      impact: 'high',
      actionable: true,
      recommendations: [
        'A/B test CTA placement and messaging',
        'Minimize form fields to reduce friction',
        'Add social proof near conversion points',
        'Implement exit-intent capture'
      ]
    })
  }

  return insights
}

function generateTechnicalInsights(input: BrainInput): Insight[] {
  const insights: Insight[] = []

  const { snapshot } = input
  const html = snapshot.html || ''

  // DOM complexity
  const elementCount = (html.match(/</g) || []).length

  if (elementCount > 500) {
    insights.push({
      id: 'insight-tech-1',
      category: 'performance',
      title: 'High DOM Complexity',
      description: `Page has ${elementCount} DOM elements which may impact performance`,
      evidence: [
        {
          source: 'snapshot',
          type: 'metric',
          claim: `${elementCount} DOM elements detected`,
          confidence: 1.0
        }
      ],
      confidence: 0.9,
      impact: 'medium',
      actionable: true,
      recommendations: [
        'Consider virtualization for long lists',
        'Implement lazy loading for below-fold content',
        'Remove unnecessary wrapper elements',
        'Use code splitting to reduce initial bundle'
      ]
    })
  }

  // JavaScript dependency
  if (html.includes('<script')) {
    const scriptCount = (html.match(/<script/g) || []).length

    if (scriptCount > 10) {
      insights.push({
        id: 'insight-tech-2',
        category: 'performance',
        title: 'Multiple Script Tags',
        description: `Page has ${scriptCount} script tags which may slow down initial load`,
        evidence: [
          {
            source: 'snapshot',
            type: 'metric',
            claim: `${scriptCount} script tags detected`,
            confidence: 1.0
          }
        ],
        confidence: 0.85,
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Consolidate and minify scripts',
          'Defer non-critical JavaScript',
          'Consider using async/defer attributes',
          'Evaluate if all scripts are necessary'
        ]
      })
    }
  }

  return insights
}

function generateAccessibilityInsights(input: BrainInput): Insight[] {
  const insights: Insight[] = []

  const { snapshot } = input
  const html = snapshot.html || ''

  // Image alt tags
  const images = (html.match(/<img/g) || []).length
  const alts = (html.match(/alt=/g) || []).length

  if (alts < images) {
    insights.push({
      id: 'insight-a11y-1',
      category: 'accessibility',
      title: 'Missing Alt Tags',
      description: `${images - alts} images missing alt tags for screen readers`,
      evidence: [
        {
          source: 'snapshot',
          type: 'metric',
          claim: `${images} images, ${alts} with alt tags`,
          confidence: 1.0
        }
      ],
      confidence: 0.95,
      impact: 'medium',
      actionable: true,
      recommendations: [
        'Add descriptive alt text to all images',
        'Use empty alt="" for decorative images',
        'Prioritize hero and CTA images first'
      ]
    })
  }

  // Heading structure
  const headings = html.match(/<h[1-6]/g) || []
  const hasH1 = html.includes('<h1')

  if (!hasH1 && headings.length > 0) {
    insights.push({
      id: 'insight-a11y-2',
      category: 'accessibility',
      title: 'Missing H1 Heading',
      description: 'Page lacks H1 heading which is important for accessibility and SEO',
      evidence: [
        {
          source: 'snapshot',
          type: 'observation',
          claim: 'No H1 tag found',
          confidence: 1.0
        }
      ],
      confidence: 0.9,
      impact: 'medium',
      actionable: true,
      recommendations: [
        'Add a single, descriptive H1 heading',
        'Ensure H1 describes the page\'s main purpose',
        'Follow proper heading hierarchy (h1 > h2 > h3...)'
      ]
    })
  }

  return insights
}

// ============================================
// PATTERN DETECTION
// ============================================

function detectPatterns(input: BrainInput, config: BrainConfig): Pattern[] {
  const patterns: Pattern[] = []

  // Detect visual patterns
  patterns.push(...detectVisualPatterns(input))

  // Detect interaction patterns
  patterns.push(...detectInteractionPatterns(input))

  // Detect content patterns
  patterns.push(...detectContentPatterns(input))

  return patterns
}

function detectVisualPatterns(input: BrainInput): Pattern[] {
  const patterns: Pattern[] = []
  const { snapshot, wireframe } = input
  const html = snapshot.html || ''

  // Hero pattern
  if (html.includes('hero') || html.includes('banner') || wireframe?.blocks.some(b => b.type === 'hero')) {
    patterns.push({
      id: 'pattern-visual-1',
      name: 'Hero Section',
      type: 'visual',
      description: 'Prominent hero section at the top of the page',
      occurrences: [
        {
          location: 'top-of-page',
          context: 'Primary content area',
          frequency: 1
        }
      ],
      strength: 'strong',
      crossDomain: false,
      implications: [
        'Establishes clear value proposition',
        'Provides focused call-to-action',
        'Standard landing page pattern'
      ]
    })
  }

  // Card pattern
  const cards = (html.match(/card/g) || []).length
  if (cards >= 3) {
    patterns.push({
      id: 'pattern-visual-2',
      name: 'Card Layout',
      type: 'visual',
      description: `Grid-based card layout with ${cards} cards`,
      occurrences: [
        {
          location: 'content-area',
          context: 'Content organization',
          frequency: cards
        }
      ],
      strength: cards > 6 ? 'strong' : 'moderate',
      crossDomain: false,
      implications: [
        'Efficient content scanning',
        'Modular design system',
        'Responsive-friendly pattern'
      ]
    })
  }

  return patterns
}

function detectInteractionPatterns(input: BrainInput): Pattern[] {
  const patterns: Pattern[] = []
  const { snapshot } = input

  // Form pattern
  const hasForms = snapshot.ux?.some(e => e.type === 'submit')
  if (hasForms) {
    patterns.push({
      id: 'pattern-int-1',
      name: 'Form Interaction',
      type: 'interaction',
      description: 'User input forms present',
      occurrences: [
        {
          location: 'form-sections',
          context: 'Data collection',
          frequency: snapshot.ux?.filter(e => e.type === 'submit').length || 0
        }
      ],
      strength: 'moderate',
      crossDomain: false,
      implications: [
        'Direct user engagement',
        'Conversion opportunity',
        'Requires validation strategy'
      ]
    })
  }

  // Navigation pattern
  const navCount = (snapshot.html?.match(/<nav/g) || []).length
  if (navCount > 0) {
    patterns.push({
      id: 'pattern-int-2',
      name: 'Navigation Structure',
      type: 'interaction',
      description: `${navCount} navigation area(s)`,
      occurrences: [
        {
          location: 'page-layout',
          context: 'Wayfinding',
          frequency: navCount
        }
      ],
      strength: navCount > 1 ? 'strong' : 'moderate',
      crossDomain: false,
      implications: [
        'Clear information architecture',
        'Multiple navigation paths may indicate complex content',
        'Consider consolidating if navCount > 2'
      ]
    })
  }

  return patterns
}

function detectContentPatterns(input: BrainInput): Pattern[] {
  const patterns: Pattern[] = []
  const { snapshot } = input

  // Text length pattern
  const totalText = (snapshot.text || []).join(' ').length
  const textLength = totalText

  if (textLength > 5000) {
    patterns.push({
      id: 'pattern-content-1',
      name: 'Content-Heavy Page',
      type: 'content',
      description: `Page contains approximately ${Math.round(textLength / 1000)}K characters`,
      occurrences: [
        {
          location: 'throughout',
          context: 'Content delivery',
          frequency: 1
        }
      ],
      strength: textLength > 10000 ? 'strong' : 'moderate',
      crossDomain: false,
      implications: [
        'May require pagination or lazy loading',
        'Consider breaking into multiple pages',
        'Table of contents could help navigation'
      ]
    })
  }

  return patterns
}

// ============================================
// INTENT INFERENCE
// ============================================

function inferIntent(input: BrainInput): IntentInference {
  const primaryIntent = inferPrimaryIntent(input)
  const secondaryIntents = inferSecondaryIntents(input)
  const userGoals = inferUserGoals(input)
  const businessGoals = inferBusinessGoals(input)

  const confidence = calculateIntentConfidence(input)

  return {
    primaryIntent,
    secondaryIntents,
    confidence,
    reasoning: generateIntentReasoning(input, primaryIntent, userGoals),
    userGoals,
    businessGoals
  }
}

function inferPrimaryIntent(input: BrainInput): string {
  const { snapshot, aiContext } = input

  // Check explicit context
  if (aiContext?.systemBrief.overview.primaryPurpose) {
    return aiContext.systemBrief.overview.primaryPurpose
  }

  // Infer from page structure
  const html = snapshot.html || ''

  if (html.includes('login') || html.includes('signin')) {
    return 'User authentication'
  }

  if (html.includes('signup') || html.includes('register')) {
    return 'User registration'
  }

  if (html.includes('checkout') || html.includes('cart')) {
    return 'Purchase completion'
  }

  if (html.includes('pricing') || html.includes('plan')) {
    return 'Plan comparison and selection'
  }

  if (html.includes('blog') || html.includes('article')) {
    return 'Content consumption'
  }

  return 'Information delivery'
}

function inferSecondaryIntents(input: BrainInput): string[] {
  const intents: string[] = []
  const { snapshot } = input

  const html = snapshot.html || ''

  // Navigation intent
  if (html.includes('<nav') || html.includes('menu')) {
    intents.push('Site exploration')
  }

  // Contact intent
  if (html.includes('contact') || html.includes('support')) {
    intents.push('Get help or information')
  }

  // Social intent
  if (html.includes('share') || html.includes('social')) {
    intents.push('Social engagement')
  }

  return intents
}

function inferUserGoals(input: BrainInput): UserGoal[] {
  const goals: UserGoal[] = []

  // Common user goals based on page type
  const primaryIntent = inferPrimaryIntent(input)

  if (primaryIntent.includes('authentication') || primaryIntent.includes('registration')) {
    goals.push({
      goal: 'Access account or create new account',
      priority: 'high',
      evidence: ['Form-based authentication flow detected']
    })
  }

  if (primaryIntent.includes('purchase')) {
    goals.push({
      goal: 'Complete purchase transaction',
      priority: 'high',
      evidence: ['Checkout flow detected', 'Payment form present']
    })
  }

  goals.push({
    goal: 'Find information quickly',
    priority: 'medium',
    evidence: ['Navigation elements present']
  })

  return goals
}

function inferBusinessGoals(input: BrainInput): BusinessGoal[] {
  const goals: BusinessGoal[] = []

  const { snapshot, aiContext } = input

  // Conversion goals
  const html = snapshot.html || ''

  if (html.includes('buy') || html.includes('purchase') || html.includes('cart')) {
    goals.push({
      goal: 'Drive product sales',
      priority: 'high',
      kpi: 'Conversion rate'
    })
  }

  if (html.includes('signup') || html.includes('subscribe')) {
    goals.push({
      goal: 'Grow user base',
      priority: 'high',
      kpi: 'Sign-up completion rate'
    })
  }

  if (html.includes('contact') || html.includes('lead')) {
    goals.push({
      goal: 'Generate leads',
      priority: 'medium',
      kpi: 'Lead form submissions'
    })
  }

  // Engagement goals
  goals.push({
    goal: 'Increase user engagement',
    priority: 'medium',
    kpi: 'Time on page, bounce rate'
  })

  return goals
}

function calculateIntentConfidence(input: BrainInput): number {
  let confidence = 0.5

  // Higher confidence if we have AI context
  if (input.aiContext) {
    confidence += 0.3
  }

  // Higher confidence if we have wireframe
  if (input.wireframe) {
    confidence += 0.1
  }

  return Math.min(1, confidence)
}

function generateIntentReasoning(
  input: BrainInput,
  primaryIntent: string,
  userGoals: UserGoal[]
): string {
  const reasons: string[] = []

  reasons.push(`Primary intent inferred as "${primaryIntent}" based on page structure`)

  if (userGoals.length > 0) {
    reasons.push(`User goals identified: ${userGoals.map(g => g.goal).join(', ')}`)
  }

  if (input.aiContext) {
    reasons.push('Supported by AI context analysis')
  }

  return reasons.join('. ')
}

// ============================================
// CROSS-MODE ANALYSIS
// ============================================

function analyzeCrossMode(input: BrainInput): CrossModeFinding[] {
  const findings: CrossModeFinding[] = []

  // Check consistency between wireframe and AI context
  if (input.wireframe && input.aiContext) {
    findings.push(analyzeLayoutConsistency(input))
  }

  // Check UX and technical alignment
  findings.push(analyzeUXTechnicalAlignment(input))

  return findings
}

function analyzeLayoutConsistency(input: BrainInput): CrossModeFinding {
  const { wireframe, aiContext } = input

  const isConsistent = wireframe!.structure.type === 'single-column' ||
                      aiContext!.codeSchema.components.length < 10

  return {
    title: 'Layout-Component Consistency',
    description: isConsistent ?
      'Layout structure matches component complexity' :
      'Layout may be more complex than necessary',
    modesInvolved: ['wireframe', 'ai-context'],
    consistency: isConsistent ? 'consistent' : 'contradictory',
    implications: isConsistent ? [
      'Clear architectural vision',
      'Maintainable code structure'
    ] : [
      'Consider simplifying layout or component structure',
      'May benefit from component consolidation'
    ],
    confidence: 0.7
  }
}

function analyzeUXTechnicalAlignment(input: BrainInput): CrossModeFinding {
  const { snapshot } = input

  const html = snapshot.html || ''
  const hasComplexUX = (snapshot.ux?.length || 0) > 5
  const hasComplexDOM = (html.match(/</g) || []).length > 300

  const isAligned = !hasComplexUX || !hasComplexDOM

  return {
    title: 'UX-Technical Alignment',
    description: isAligned ?
      'UX complexity matches technical implementation' :
      'UX may benefit from DOM simplification',
    modesInvolved: ['snapshot', 'ux-intelligence'],
    consistency: isAligned ? 'consistent' : 'contradictory',
    implications: isAligned ? [
      'Efficient implementation',
      'Good performance characteristics'
    ] : [
      'Consider virtual DOM for complex interactions',
      'May benefit from code splitting'
    ],
    confidence: 0.6
  }
}

// ============================================
// EXPLANATION GENERATION
// ============================================

function generateExplanations(
  input: BrainInput,
  insights: Insight[],
  patterns: Pattern[]
): Explanation[] {
  const explanations: Explanation[] = []

  // Explain page structure
  explanations.push({
    topic: 'Page Structure',
    explanation: explainPageStructure(input),
    complexity: 'moderate',
    evidence: [],
    confidence: 0.8,
    audience: 'general'
  })

  // Explain user journey
  explanations.push({
    topic: 'User Journey',
    explanation: explainUserJourney(input),
    complexity: 'simple',
    evidence: [],
    confidence: 0.7,
    audience: 'business'
  })

  // Explain technical implementation
  explanations.push({
    topic: 'Technical Implementation',
    explanation: explainTechnicalImplementation(input),
    complexity: 'complex',
    evidence: [],
    confidence: 0.6,
    audience: 'technical'
  })

  return explanations
}

function explainPageStructure(input: BrainInput): string {
  const { snapshot, wireframe } = input

  const parts: string[] = []

  parts.push(`This page is organized as a ${wireframe?.structure.type || 'standard'} layout`)

  if (wireframe?.structure.hasSidebar) {
    parts.push(`with a ${wireframe.structure.sidebarPosition}-positioned sidebar`)
  }

  if (wireframe?.structure.columns) {
    parts.push(`using ${wireframe.structure.columns} column(s)`)
  }

  parts.push(`containing ${wireframe?.blocks.length || 'multiple'} main sections`)

  return parts.join(' ') + '.'
}

function explainUserJourney(input: BrainInput): string {
  const { snapshot, aiContext } = input

  const primaryIntent = inferPrimaryIntent(input)

  return `Users visit this page primarily to ${primaryIntent.toLowerCase()}. ` +
    `The page provides ${snapshot.ux?.length || 0} interaction points for user engagement. ` +
    (aiContext?.systemBrief.overview.targetUsers.length ?
      `Target users include ${aiContext.systemBrief.overview.targetUsers.join(' and ')}.` :
      'The page serves general users.')
}

function explainTechnicalImplementation(input: BrainInput): string {
  const { snapshot } = input

  const html = snapshot.html || ''
  const elementCount = (html.match(/</g) || []).length
  const scriptCount = (html.match(/<script/g) || []).length
  const hasForms = snapshot.ux?.some(e => e.type === 'submit')

  return `The page is implemented with ${elementCount} DOM elements ` +
    `and ${scriptCount} script tag(s). ` +
    (hasForms ? 'Form handling is present with server-side submission. ' : '') +
    `The implementation follows standard web technologies.`
}

// ============================================
// CONFIDENCE CALCULATION
// ============================================

function calculateBrainConfidence(input: BrainInput): number {
  let confidence = 0.5

  // Increase confidence based on available modes
  if (input.wireframe) confidence += 0.15
  if (input.aiContext) confidence += 0.15
  if (input.comparison) confidence += 0.1

  return Math.min(1, confidence)
}

// ============================================
// DEFAULT OUTPUT
// ============================================

export function getDefaultBrainAnalysis(): BrainAnalysis {
  return {
    meta: {
      analyzedAt: new Date().toISOString(),
      sourceUrl: '',
      modesUsed: [],
      confidence: 0.5,
      version: '1.0.0'
    },
    insights: [],
    patterns: [],
    intentInference: {
      primaryIntent: '',
      secondaryIntents: [],
      confidence: 0.5,
      reasoning: '',
      userGoals: [],
      businessGoals: []
    },
    crossModeFindings: [],
    explanations: []
  }
}

export function getBrainSummary(input: BrainInput): string {
  return `
Brain LLM Analysis Summary
=========================
URL: ${input.snapshot.url}
Modes Available: ${getAvailableModes(input).join(', ')}
  `.trim()
}
