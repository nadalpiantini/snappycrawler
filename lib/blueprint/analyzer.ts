// Blueprint Analyzer - Transforms raw snapshots into comprehensible product blueprints
// This is the core intelligence layer that interprets, not just captures

import type { RawSnapshot, NormalizedSnapshot } from '../types'
import type {
  Blueprint,
  BlueprintMeta,
  BlueprintOverview,
  ProductIntent,
  StructuralModel,
  InferredJourney,
  DesignDNA,
  BlueprintInsights,
  BuilderTakeaways,
  PageType,
  ClarityLevel,
  ComplexityLevel,
  InteractivityLevel,
  SectionType,
  ConceptualSection,
  JourneyStage,
  Alert,
  FrictionPoint,
  PersuasionTechnique,
  StealableElement,
  ImprovementSuggestion,
  Insight,
  LayoutBalance,
  DesignPersonality,
} from './types'

// ============================================
// MAIN ANALYZER
// ============================================

export async function analyzeBlueprint(
  raw: RawSnapshot,
  normalized?: NormalizedSnapshot
): Promise<Blueprint> {
  const startTime = Date.now()

  // Run all lenses in parallel
  const [overview, intent, structure, journey, designDna, insights] = await Promise.all([
    analyzeOverview(raw),
    analyzeIntent(raw),
    analyzeStructure(raw, normalized),
    analyzeJourney(raw),
    analyzeDesignDNA(raw),
    analyzeInsights(raw),
  ])

  // Generate takeaways based on all analysis
  const takeaways = generateTakeaways(overview, intent, structure, journey, designDna, insights)

  const processingTime = Date.now() - startTime

  return {
    meta: {
      id: crypto.randomUUID(),
      url: raw.url,
      title: raw.title,
      capturedAt: raw.timestamp || new Date().toISOString(),
      analyzedAt: new Date().toISOString(),
      version: '1.0.0',
      confidence: calculateOverallConfidence(raw),
    },
    overview,
    intent,
    structure,
    journey,
    designDna,
    insights,
    takeaways,
  }
}

// ============================================
// LENS 1: OVERVIEW (Executive Snapshot)
// ============================================

async function analyzeOverview(raw: RawSnapshot): Promise<BlueprintOverview> {
  const pageType = detectPageType(raw)
  const primaryGoal = inferPrimaryGoal(raw, pageType)
  const clarityScore = assessClarity(raw)
  const complexityScore = assessComplexity(raw)
  const interactivityLevel = assessInteractivity(raw)
  const alerts = generateAlerts(raw, clarityScore, complexityScore)

  return {
    pageType,
    primaryGoal,
    clarityScore,
    complexityScore,
    interactivityLevel,
    alerts,
    oneLiner: generateOneLiner(pageType, primaryGoal, clarityScore),
  }
}

function detectPageType(raw: RawSnapshot): PageType {
  // Use existing page_type if available
  if (raw.page_type) {
    const typeMap: Record<string, PageType> = {
      homepage: 'homepage',
      landing: 'landing',
      product: 'product',
      pricing: 'pricing',
      checkout: 'checkout',
      dashboard: 'dashboard',
      blog: 'blog',
      documentation: 'docs',
      login: 'auth',
      signup: 'auth',
      profile: 'profile',
      settings: 'settings',
    }
    return typeMap[raw.page_type.toLowerCase()] || 'unknown'
  }

  // Infer from content
  const text = raw.text.join(' ').toLowerCase()
  const url = raw.url.toLowerCase()

  if (url.includes('/pricing') || text.includes('pricing') && text.includes('plan')) return 'pricing'
  if (url.includes('/checkout') || text.includes('checkout')) return 'checkout'
  if (url.includes('/dashboard') || url.includes('/app')) return 'dashboard'
  if (url.includes('/blog') || url.includes('/post')) return 'blog'
  if (url.includes('/docs') || url.includes('/documentation')) return 'docs'
  if (url.includes('/login') || url.includes('/signin')) return 'auth'
  if (url.includes('/signup') || url.includes('/register')) return 'auth'
  if (url.includes('/settings')) return 'settings'
  if (url.includes('/profile')) return 'profile'

  // Check for landing page signals
  const hasHeroSignals = text.includes('get started') || text.includes('try') || text.includes('sign up')
  const hasFeatures = text.includes('features') || text.includes('how it works')
  const hasPricing = text.includes('pricing') || text.includes('plans')

  if (hasHeroSignals && (hasFeatures || hasPricing)) return 'landing'
  if (url === '/' || url.endsWith('.com') || url.endsWith('.io')) return 'homepage'

  return 'marketing'
}

function inferPrimaryGoal(raw: RawSnapshot, pageType: PageType): string {
  const goals: Record<PageType, string> = {
    landing: 'Convert visitors into users through compelling value proposition',
    homepage: 'Communicate brand value and guide visitors to relevant sections',
    product: 'Showcase product details and drive purchase decision',
    pricing: 'Help visitors choose the right plan and convert',
    checkout: 'Complete the purchase with minimal friction',
    dashboard: 'Enable users to accomplish their primary tasks efficiently',
    blog: 'Deliver valuable content and build authority',
    docs: 'Help users find answers and implement solutions',
    auth: 'Authenticate users with minimal friction',
    profile: 'Allow users to manage their identity and preferences',
    settings: 'Enable users to customize their experience',
    marketing: 'Generate interest and capture leads',
    app: 'Provide core application functionality',
    unknown: 'Purpose unclear from available information',
  }

  return goals[pageType]
}

function assessClarity(raw: RawSnapshot): ClarityLevel {
  let score = 0

  // Check for clear headline
  const hasH1 = raw.html.includes('<h1')
  if (hasH1) score += 30

  // Check for clear CTA
  const hasCTA = raw.uxData?.interactions.some(
    (i) => i.type === 'button' && i.position.viewportPosition === 'above-fold'
  )
  if (hasCTA) score += 30

  // Check for reasonable text density (not too much, not too little)
  const textLength = raw.text.join(' ').length
  if (textLength > 200 && textLength < 5000) score += 20

  // Check for navigation
  const hasNav = raw.uxData?.navigation && raw.uxData.navigation.length > 0
  if (hasNav) score += 20

  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

function assessComplexity(raw: RawSnapshot): ComplexityLevel {
  const interactions = raw.uxData?.interactions.length || 0
  const forms = raw.uxData?.forms.length || 0
  const navItems = raw.uxData?.navigation.reduce((acc, nav) => acc + nav.items.length, 0) || 0
  const textBlocks = raw.text.length

  const complexityScore = interactions + (forms * 5) + navItems + (textBlocks / 10)

  if (complexityScore < 20) return 'simple'
  if (complexityScore < 50) return 'moderate'
  if (complexityScore < 100) return 'complex'
  return 'dense'
}

function assessInteractivity(raw: RawSnapshot): InteractivityLevel {
  const interactions = raw.uxData?.interactions.length || 0
  const forms = raw.uxData?.forms.length || 0
  const modals = raw.uxData?.modals.length || 0

  const score = interactions + (forms * 3) + (modals * 2)

  if (score === 0) return 'static'
  if (score < 10) return 'light'
  if (score < 30) return 'moderate'
  if (score < 60) return 'heavy'
  return 'app-like'
}

function generateAlerts(raw: RawSnapshot, clarity: ClarityLevel, complexity: ComplexityLevel): Alert[] {
  const alerts: Alert[] = []

  if (clarity === 'low') {
    alerts.push({
      type: 'warning',
      message: 'Low clarity detected - primary message may be unclear to visitors',
      severity: 'high',
    })
  }

  if (complexity === 'dense') {
    alerts.push({
      type: 'warning',
      message: 'High density may overwhelm users - consider simplifying',
      severity: 'medium',
    })
  }

  const aboveFoldCTAs = raw.uxData?.interactions.filter(
    (i) => i.type === 'button' && i.position.viewportPosition === 'above-fold'
  ).length || 0

  if (aboveFoldCTAs === 0) {
    alerts.push({
      type: 'warning',
      message: 'No clear call-to-action above the fold',
      severity: 'high',
    })
  }

  if (aboveFoldCTAs > 3) {
    alerts.push({
      type: 'info',
      message: 'Multiple CTAs above fold may dilute focus',
      severity: 'low',
    })
  }

  const accessibility = raw.uxData?.accessibility
  if (accessibility && accessibility.imagesWithoutAlt > 0) {
    alerts.push({
      type: 'error',
      message: `${accessibility.imagesWithoutAlt} images missing alt text - accessibility issue`,
      severity: 'medium',
    })
  }

  return alerts
}

function generateOneLiner(pageType: PageType, goal: string, clarity: ClarityLevel): string {
  const clarityText = {
    high: 'clearly communicates',
    medium: 'attempts to communicate',
    low: 'struggles to communicate',
  }[clarity]

  const typeText = pageType === 'unknown' ? 'page' : `${pageType} page`

  return `This ${typeText} ${clarityText} its purpose: ${goal.toLowerCase()}`
}

// ============================================
// LENS 2: INTENT (Product Intent)
// ============================================

async function analyzeIntent(raw: RawSnapshot): Promise<ProductIntent> {
  const primaryAction = inferPrimaryAction(raw)
  const valueProposition = extractValueProposition(raw)
  const targetAudience = inferTargetAudience(raw)
  const persuasionTechniques = detectPersuasionTechniques(raw)
  const frictionPoints = identifyFrictionPoints(raw)

  const coherenceScore = calculateCoherenceScore(raw, primaryAction, valueProposition)

  return {
    primaryAction,
    valueProposition,
    targetAudience,
    persuasionTechniques,
    coherenceScore,
    frictionPoints,
    strengths: identifyIntentStrengths(raw, persuasionTechniques),
    weaknesses: identifyIntentWeaknesses(raw, frictionPoints, coherenceScore),
  }
}

function inferPrimaryAction(raw: RawSnapshot): string {
  // Look for primary CTA text
  const buttons = raw.uxData?.interactions.filter((i) => i.type === 'button') || []
  const aboveFoldButtons = buttons.filter((b) => b.position.viewportPosition === 'above-fold')

  if (aboveFoldButtons.length > 0) {
    const primaryButton = aboveFoldButtons[0]
    const text = primaryButton.text.toLowerCase()

    if (text.includes('sign up') || text.includes('get started')) return 'Sign up for the service'
    if (text.includes('try') || text.includes('free')) return 'Start a free trial'
    if (text.includes('buy') || text.includes('purchase')) return 'Make a purchase'
    if (text.includes('learn') || text.includes('more')) return 'Learn more about the offering'
    if (text.includes('contact') || text.includes('demo')) return 'Request contact or demo'
    if (text.includes('download')) return 'Download a resource'
    if (text.includes('subscribe')) return 'Subscribe to content'

    return `Click "${primaryButton.text}" to proceed`
  }

  // Fallback to form analysis
  const forms = raw.uxData?.forms || []
  if (forms.length > 0) {
    const hasEmail = forms[0].fields.some((f) => f.type === 'email')
    if (hasEmail) return 'Submit email address'
  }

  return 'Explore content and navigate to relevant sections'
}

function extractValueProposition(raw: RawSnapshot): string {
  // Look for h1 or first prominent text
  const text = raw.text.slice(0, 10).join(' ')

  // Simple heuristic: first sentence-like text that isn't navigation
  const sentences = text.match(/[A-Z][^.!?]*[.!?]/g) || []
  if (sentences.length > 0 && sentences[0]) {
    return sentences[0]
  }

  return raw.title || 'Value proposition not clearly stated'
}

function inferTargetAudience(raw: RawSnapshot): string[] {
  const audiences: string[] = []
  const text = raw.text.join(' ').toLowerCase()

  if (text.includes('developer') || text.includes('api') || text.includes('code')) {
    audiences.push('Developers')
  }
  if (text.includes('business') || text.includes('enterprise') || text.includes('team')) {
    audiences.push('Business professionals')
  }
  if (text.includes('startup') || text.includes('founder')) {
    audiences.push('Startup founders')
  }
  if (text.includes('marketer') || text.includes('marketing')) {
    audiences.push('Marketers')
  }
  if (text.includes('designer') || text.includes('design')) {
    audiences.push('Designers')
  }
  if (text.includes('everyone') || text.includes('anyone')) {
    audiences.push('General audience')
  }

  return audiences.length > 0 ? audiences : ['General audience']
}

function detectPersuasionTechniques(raw: RawSnapshot): PersuasionTechnique[] {
  const techniques: PersuasionTechnique[] = []
  const text = raw.text.join(' ').toLowerCase()

  // Social Proof
  if (text.includes('trusted by') || text.includes('used by') || text.includes('customers')) {
    techniques.push({
      name: 'Social Proof',
      evidence: 'Customer count or trust indicators present',
      effectiveness: text.includes('million') || text.includes('000+') ? 'strong' : 'moderate',
    })
  }

  // Urgency
  if (text.includes('limited') || text.includes('now') || text.includes('today only')) {
    techniques.push({
      name: 'Urgency',
      evidence: 'Time-sensitive language detected',
      effectiveness: text.includes('limited time') ? 'strong' : 'weak',
    })
  }

  // Authority
  if (text.includes('award') || text.includes('certified') || text.includes('featured in')) {
    techniques.push({
      name: 'Authority',
      evidence: 'Credentials or recognition mentioned',
      effectiveness: 'moderate',
    })
  }

  // Free Value
  if (text.includes('free') || text.includes('no credit card')) {
    techniques.push({
      name: 'Risk Reduction',
      evidence: 'Free tier or no-commitment offer',
      effectiveness: 'strong',
    })
  }

  // Testimonials
  if (raw.uxData?.media?.some((m) => m.type === 'image') && text.includes('"')) {
    techniques.push({
      name: 'Testimonials',
      evidence: 'Quote-style content with potential testimonials',
      effectiveness: 'moderate',
    })
  }

  return techniques
}

function identifyFrictionPoints(raw: RawSnapshot): FrictionPoint[] {
  const frictionPoints: FrictionPoint[] = []

  // Check for long forms
  const forms = raw.uxData?.forms || []
  forms.forEach((form, index) => {
    if (form.fields.length > 5) {
      frictionPoints.push({
        location: `Form ${index + 1}`,
        issue: `Form has ${form.fields.length} fields - may reduce conversions`,
        impact: form.fields.length > 8 ? 'major' : 'moderate',
        suggestion: 'Consider progressive disclosure or reducing required fields',
      })
    }
  })

  // Check for competing CTAs
  const aboveFoldButtons = raw.uxData?.interactions.filter(
    (i) => i.type === 'button' && i.position.viewportPosition === 'above-fold'
  ) || []

  if (aboveFoldButtons.length > 3) {
    frictionPoints.push({
      location: 'Above the fold',
      issue: 'Multiple competing calls-to-action',
      impact: 'moderate',
      suggestion: 'Establish clear visual hierarchy with one primary CTA',
    })
  }

  // Check for missing above-fold CTA
  if (aboveFoldButtons.length === 0) {
    frictionPoints.push({
      location: 'Above the fold',
      issue: 'No clear call-to-action visible without scrolling',
      impact: 'major',
      suggestion: 'Add a prominent CTA button in the hero section',
    })
  }

  return frictionPoints
}

function calculateCoherenceScore(raw: RawSnapshot, action: string, value: string): number {
  let score = 0.5 // Start at neutral

  // Check if CTA aligns with value proposition
  const text = raw.text.join(' ').toLowerCase()
  const hasAlignedCTA = raw.uxData?.interactions.some((i) =>
    i.type === 'button' && action.toLowerCase().includes(i.text.toLowerCase().split(' ')[0])
  )
  if (hasAlignedCTA) score += 0.2

  // Check for consistent messaging
  const hasRepeatedKeywords = raw.text.slice(0, 5).some((t) =>
    raw.text.slice(5, 15).some((t2) =>
      t.toLowerCase().split(' ').some((word) =>
        word.length > 4 && t2.toLowerCase().includes(word)
      )
    )
  )
  if (hasRepeatedKeywords) score += 0.15

  // Check for clear visual hierarchy
  const hasH1 = raw.html.includes('<h1')
  if (hasH1) score += 0.15

  return Math.min(score, 1)
}

function identifyIntentStrengths(raw: RawSnapshot, techniques: PersuasionTechnique[]): string[] {
  const strengths: string[] = []

  if (techniques.some((t) => t.effectiveness === 'strong')) {
    strengths.push('Uses effective persuasion techniques')
  }

  const aboveFoldCTA = raw.uxData?.interactions.filter(
    (i) => i.type === 'button' && i.position.viewportPosition === 'above-fold'
  ).length || 0

  if (aboveFoldCTA === 1) {
    strengths.push('Clear, singular call-to-action above the fold')
  }

  if (raw.uxData?.accessibility?.landmarkRegions.includes('main')) {
    strengths.push('Well-structured content with clear landmarks')
  }

  return strengths
}

function identifyIntentWeaknesses(
  raw: RawSnapshot,
  frictionPoints: FrictionPoint[],
  coherenceScore: number
): string[] {
  const weaknesses: string[] = []

  if (coherenceScore < 0.5) {
    weaknesses.push('Message coherence could be improved')
  }

  frictionPoints.forEach((fp) => {
    if (fp.impact === 'major') {
      weaknesses.push(fp.issue)
    }
  })

  const textLength = raw.text.join(' ').length
  if (textLength > 10000) {
    weaknesses.push('Content may be too long for the page type')
  }

  return weaknesses
}

// ============================================
// LENS 3: STRUCTURE (Component Thinking)
// ============================================

async function analyzeStructure(raw: RawSnapshot, normalized?: NormalizedSnapshot): Promise<StructuralModel> {
  const sections = identifySections(raw)
  const hierarchy = buildHierarchy(raw)
  const patterns = detectStructuralPatterns(sections)
  const redundancies = findRedundancies(sections, raw)
  const balance = assessLayoutBalance(raw)

  return {
    sections,
    hierarchy,
    patterns,
    redundancies,
    balance,
    flowDirection: inferFlowDirection(sections),
  }
}

function identifySections(raw: RawSnapshot): ConceptualSection[] {
  const sections: ConceptualSection[] = []

  // Navigation
  if (raw.uxData?.navigation && raw.uxData.navigation.length > 0) {
    const nav = raw.uxData.navigation[0]
    sections.push({
      type: 'navigation',
      label: 'Main Navigation',
      position: nav.position.viewportPosition === 'above-fold' ? 'above-fold' : 'mid-page',
      importance: 'supporting',
      hasContent: true,
      hasCta: false,
      notes: [`${nav.items.length} navigation items`],
    })
  }

  // Hero section (inferred from above-fold content)
  const aboveFoldInteractions = raw.uxData?.interactions.filter(
    (i) => i.position.viewportPosition === 'above-fold'
  ) || []

  if (aboveFoldInteractions.length > 0 || raw.text.length > 0) {
    sections.push({
      type: 'hero',
      label: 'Hero Section',
      position: 'above-fold',
      importance: 'critical',
      hasContent: raw.text.length > 0,
      hasCta: aboveFoldInteractions.some((i) => i.type === 'button'),
      notes: [],
    })
  }

  // Forms
  raw.uxData?.forms.forEach((form, i) => {
    sections.push({
      type: 'form',
      label: `Form ${i + 1}`,
      position: form.position.viewportPosition === 'above-fold' ? 'above-fold' : 'mid-page',
      importance: 'critical',
      hasContent: true,
      hasCta: !!form.submitButton,
      notes: [`${form.fields.length} fields`],
    })
  })

  // Footer (inferred)
  const hasFooterNav = raw.uxData?.navigation.some((n) => n.type === 'nav' && n.items.length > 5)
  if (hasFooterNav) {
    sections.push({
      type: 'footer',
      label: 'Footer',
      position: 'footer',
      importance: 'supporting',
      hasContent: true,
      hasCta: false,
      notes: [],
    })
  }

  return sections
}

function buildHierarchy(raw: RawSnapshot): { element: string; depth: number; type: string }[] {
  const hierarchy: { element: string; depth: number; type: string }[] = []

  // Build from navigation
  raw.uxData?.navigation.forEach((nav) => {
    hierarchy.push({ element: 'Navigation', depth: 0, type: nav.type })
    nav.items.forEach((item) => {
      hierarchy.push({ element: item.text, depth: 1, type: 'nav-item' })
    })
  })

  // Add sections
  hierarchy.push({ element: 'Content', depth: 0, type: 'main' })

  return hierarchy
}

function detectStructuralPatterns(sections: ConceptualSection[]): { name: string; isCommon: boolean; effectiveness: string }[] {
  const patterns: { name: string; isCommon: boolean; effectiveness: string }[] = []

  const sectionTypes = sections.map((s) => s.type)

  // Common landing page pattern
  if (sectionTypes.includes('hero') && sectionTypes.includes('navigation')) {
    patterns.push({
      name: 'Standard Landing Page',
      isCommon: true,
      effectiveness: 'Proven effective for conversion-focused pages',
    })
  }

  // Form-focused pattern
  if (sectionTypes.filter((s) => s === 'form').length >= 1) {
    patterns.push({
      name: 'Form-Centric Layout',
      isCommon: true,
      effectiveness: 'Good for lead capture or signup flows',
    })
  }

  return patterns
}

function findRedundancies(sections: ConceptualSection[], raw: RawSnapshot): { type: string; count: number; suggestion: string }[] {
  const redundancies: { type: string; count: number; suggestion: string }[] = []

  // Check for multiple CTAs with same text
  const buttonTexts = raw.uxData?.interactions
    .filter((i) => i.type === 'button')
    .map((i) => i.text.toLowerCase()) || []

  const duplicates = buttonTexts.filter((text, index) => buttonTexts.indexOf(text) !== index)
  if (duplicates.length > 0) {
    redundancies.push({
      type: 'Duplicate CTA text',
      count: duplicates.length + 1,
      suggestion: 'Consider varying CTA copy or consolidating buttons',
    })
  }

  return redundancies
}

function assessLayoutBalance(raw: RawSnapshot): LayoutBalance {
  const interactions = raw.uxData?.interactions.length || 0
  const textBlocks = raw.text.length

  const whitespace: LayoutBalance['whitespace'] =
    interactions < 20 && textBlocks < 30 ? 'generous' :
    textBlocks > 50 ? 'cramped' : 'adequate'

  const density: LayoutBalance['density'] =
    textBlocks < 20 ? 'sparse' :
    textBlocks > 60 ? 'dense' : 'moderate'

  return {
    visualWeight: 'balanced' as const, // Would need visual analysis for accuracy
    whitespace,
    density,
  }
}

function inferFlowDirection(sections: ConceptualSection[]): 'linear' | 'branching' | 'circular' | 'scattered' {
  if (sections.length < 3) return 'linear'
  if (sections.some((s) => s.type === 'sidebar')) return 'branching'
  return 'linear'
}

// ============================================
// LENS 4: JOURNEY (User Journey)
// ============================================

async function analyzeJourney(raw: RawSnapshot): Promise<InferredJourney> {
  const stages = inferJourneyStages(raw)
  const primaryPath = stages.map((s) => s.action)
  const dropOffRisks = identifyDropOffRisks(raw, stages)

  return {
    stages,
    primaryPath,
    alternativePaths: [],
    entryPoint: 'Page load',
    idealExit: inferIdealExit(raw),
    dropOffRisks,
    estimatedTimeOnPage: estimateTimeOnPage(raw),
    scrollDepthExpected: estimateScrollDepth(raw),
  }
}

function inferJourneyStages(raw: RawSnapshot): JourneyStage[] {
  const stages: JourneyStage[] = []

  // Stage 1: First impression
  stages.push({
    order: 1,
    action: 'See headline and hero',
    element: 'Hero section',
    emotion: 'curious',
    friction: 0,
    notes: ['First 3 seconds are critical'],
  })

  // Stage 2: Understand value
  stages.push({
    order: 2,
    action: 'Read value proposition',
    element: 'Main headline',
    emotion: 'interested',
    friction: 0.1,
    notes: [],
  })

  // Stage 3: Evaluate (if features present)
  if (raw.text.length > 10) {
    stages.push({
      order: 3,
      action: 'Scan key features or content',
      element: 'Content sections',
      emotion: 'interested',
      friction: 0.2,
      notes: [],
    })
  }

  // Stage 4: Decide
  const hasCTA = raw.uxData?.interactions.some((i) => i.type === 'button')
  if (hasCTA) {
    stages.push({
      order: 4,
      action: 'Consider taking action',
      element: 'CTA button',
      emotion: 'ready',
      friction: 0.3,
      notes: [],
    })
  }

  return stages
}

function identifyDropOffRisks(raw: RawSnapshot, stages: JourneyStage[]): { location: string; reason: string; probability: 'low' | 'medium' | 'high'; mitigation: string }[] {
  const risks: { location: string; reason: string; probability: 'low' | 'medium' | 'high'; mitigation: string }[] = []

  // Long forms
  raw.uxData?.forms.forEach((form) => {
    if (form.fields.length > 5) {
      risks.push({
        location: 'Form section',
        reason: 'Too many required fields',
        probability: 'high',
        mitigation: 'Reduce fields or use progressive disclosure',
      })
    }
  })

  // No clear CTA
  const aboveFoldCTAs = raw.uxData?.interactions.filter(
    (i) => i.type === 'button' && i.position.viewportPosition === 'above-fold'
  ).length || 0

  if (aboveFoldCTAs === 0) {
    risks.push({
      location: 'Above the fold',
      reason: 'No clear next step visible',
      probability: 'high',
      mitigation: 'Add prominent CTA in hero section',
    })
  }

  return risks
}

function inferIdealExit(raw: RawSnapshot): string {
  const buttons = raw.uxData?.interactions.filter((i) => i.type === 'button') || []
  if (buttons.length > 0) {
    return `Click "${buttons[0].text}" button`
  }

  const forms = raw.uxData?.forms || []
  if (forms.length > 0) {
    return 'Submit form'
  }

  return 'Navigate to relevant section'
}

function estimateTimeOnPage(raw: RawSnapshot): string {
  const textLength = raw.text.join(' ').length
  const readingTime = Math.ceil(textLength / 200) // ~200 words per minute

  if (readingTime < 1) return 'Under 1 minute'
  if (readingTime < 3) return '1-3 minutes'
  if (readingTime < 5) return '3-5 minutes'
  return '5+ minutes'
}

function estimateScrollDepth(raw: RawSnapshot): string {
  const sections = raw.uxData?.interactions.filter((i) => i.position.viewportPosition === 'below-fold').length || 0

  if (sections === 0) return 'No scroll needed'
  if (sections < 5) return 'Light scrolling (25-50%)'
  if (sections < 10) return 'Moderate scrolling (50-75%)'
  return 'Deep scrolling expected (75%+)'
}

// ============================================
// LENS 5: DESIGN DNA
// ============================================

async function analyzeDesignDNA(raw: RawSnapshot): Promise<DesignDNA> {
  const personality = assessPersonality(raw)
  const system = assessDesignSystem(raw)
  const characteristics = identifyCharacteristics(raw)

  return {
    personality,
    system,
    characteristics,
    moodBoard: generateMoodBoard(personality),
    influences: inferInfluences(raw, personality),
  }
}

function assessPersonality(raw: RawSnapshot): DesignPersonality {
  const colors = raw.designStyles?.colors || []
  const typography = raw.designStyles?.typography || []
  const spacing = raw.designStyles?.spacing || []

  // Calculate spectrum based on design elements
  const colorCount = colors.length
  const fontCount = typography.length
  const spacingValues = spacing.length

  const spectrum = {
    minimal: colorCount < 5 ? 80 : colorCount < 10 ? 50 : 20,
    dense: colorCount > 15 ? 80 : colorCount > 10 ? 50 : 20,
    conservative: 50, // Would need color analysis
    expressive: 50,
    systematic: spacingValues > 5 ? 70 : 40,
    improvised: spacingValues < 3 ? 70 : 30,
    playful: 40,
    serious: 60,
  }

  const primaryTrait = spectrum.minimal > 60 ? 'Minimal' : spectrum.dense > 60 ? 'Dense' : 'Balanced'
  const secondaryTrait = spectrum.systematic > 60 ? 'Systematic' : 'Flexible'

  return {
    spectrum,
    primaryTrait,
    secondaryTrait,
    description: `${primaryTrait} design with ${secondaryTrait.toLowerCase()} approach`,
  }
}

function assessDesignSystem(raw: RawSnapshot): {
  hasConsistentTypography: boolean
  hasConsistentSpacing: boolean
  hasColorSystem: boolean
  hasComponentPatterns: boolean
  maturityLevel: 'polished' | 'developing' | 'inconsistent' | 'chaotic'
  observations: string[]
} {
  const typography = raw.designStyles?.typography || []
  const spacing = raw.designStyles?.spacing || []
  const colors = raw.designStyles?.colors || []

  const uniqueFonts = new Set(typography.map((t) => t.fontFamily)).size
  const uniqueSpacing = new Set(spacing.map((s) => s.value)).size
  const uniqueColors = new Set(colors.map((c) => c.value)).size

  const hasConsistentTypography = uniqueFonts <= 3
  const hasConsistentSpacing = uniqueSpacing <= 8
  const hasColorSystem = uniqueColors <= 10

  const maturityScore = (hasConsistentTypography ? 1 : 0) + (hasConsistentSpacing ? 1 : 0) + (hasColorSystem ? 1 : 0)

  const maturityLevel: 'polished' | 'developing' | 'inconsistent' | 'chaotic' =
    maturityScore === 3 ? 'polished' :
    maturityScore === 2 ? 'developing' :
    maturityScore === 1 ? 'inconsistent' : 'chaotic'

  const observations: string[] = []
  if (!hasConsistentTypography) observations.push(`${uniqueFonts} different fonts detected - consider consolidating`)
  if (!hasConsistentSpacing) observations.push('Spacing appears inconsistent - consider establishing a spacing scale')
  if (!hasColorSystem) observations.push(`${uniqueColors} colors in use - consider defining a color palette`)

  return {
    hasConsistentTypography,
    hasConsistentSpacing,
    hasColorSystem,
    hasComponentPatterns: raw.uxData?.interactions.length ? raw.uxData.interactions.length > 5 : false,
    maturityLevel,
    observations,
  }
}

function identifyCharacteristics(raw: RawSnapshot): { trait: string; evidence: string; impact: 'positive' | 'neutral' | 'negative' }[] {
  const characteristics: { trait: string; evidence: string; impact: 'positive' | 'neutral' | 'negative' }[] = []

  // Check typography characteristics
  const typography = raw.designStyles?.typography || []
  if (typography.some((t) => parseInt(t.fontSize) > 32)) {
    characteristics.push({
      trait: 'Bold typography',
      evidence: 'Large headline sizes detected',
      impact: 'positive',
    })
  }

  // Check color usage
  const colors = raw.designStyles?.colors || []
  const backgrounds = colors.filter((c) => c.source === 'background')
  if (backgrounds.some((c) => c.value.includes('rgb(255') || c.value === '#ffffff')) {
    characteristics.push({
      trait: 'Clean backgrounds',
      evidence: 'Predominantly white/light backgrounds',
      impact: 'positive',
    })
  }

  return characteristics
}

function generateMoodBoard(personality: { primaryTrait: string; secondaryTrait: string }): string[] {
  const words: string[] = []

  if (personality.primaryTrait === 'Minimal') {
    words.push('Clean', 'Focused', 'Refined', 'Simple')
  } else if (personality.primaryTrait === 'Dense') {
    words.push('Rich', 'Detailed', 'Comprehensive', 'Feature-packed')
  } else {
    words.push('Balanced', 'Approachable', 'Professional')
  }

  if (personality.secondaryTrait === 'Systematic') {
    words.push('Organized', 'Consistent', 'Structured')
  }

  return words
}

function inferInfluences(raw: RawSnapshot, personality: { primaryTrait: string }): string[] {
  const influences: string[] = []

  if (personality.primaryTrait === 'Minimal') {
    influences.push('Apple-inspired minimalism')
  }

  const hasGradients = raw.designStyles?.colors.some((c) => c.value.includes('gradient'))
  if (hasGradients) {
    influences.push('Modern SaaS aesthetic')
  }

  return influences.length > 0 ? influences : ['Contemporary web design']
}

// ============================================
// LENS 6: INSIGHTS (Reuse & Improve)
// ============================================

async function analyzeInsights(raw: RawSnapshot): Promise<BlueprintInsights> {
  return {
    stealThis: findStealableElements(raw),
    fixThis: findImprovements(raw),
    patterns: findReusablePatterns(raw),
    antiPatterns: findAntiPatterns(raw),
  }
}

function findStealableElements(raw: RawSnapshot): StealableElement[] {
  const elements: StealableElement[] = []

  // Good CTA patterns
  const primaryCTA = raw.uxData?.interactions.find(
    (i) => i.type === 'button' && i.position.viewportPosition === 'above-fold'
  )
  if (primaryCTA) {
    elements.push({
      what: 'CTA placement',
      why: 'Primary action is visible above the fold',
      where: 'Hero section',
      howToUse: 'Place your main CTA prominently in the initial viewport',
      difficulty: 'easy',
    })
  }

  // Navigation structure
  const nav = raw.uxData?.navigation[0]
  if (nav && nav.items.length > 3 && nav.items.length < 8) {
    elements.push({
      what: 'Navigation structure',
      why: 'Balanced number of navigation items (not overwhelming)',
      where: 'Header',
      howToUse: 'Keep main navigation to 4-7 items for clarity',
      difficulty: 'easy',
    })
  }

  return elements
}

function findImprovements(raw: RawSnapshot): ImprovementSuggestion[] {
  const improvements: ImprovementSuggestion[] = []

  // Accessibility issues
  const accessibility = raw.uxData?.accessibility
  if (accessibility) {
    if (accessibility.imagesWithoutAlt > 0) {
      improvements.push({
        issue: 'Missing alt text on images',
        location: 'Throughout page',
        impact: 'medium',
        suggestion: 'Add descriptive alt text to all images',
        effort: 'quick-fix',
      })
    }

    if (!accessibility.hasSkipLink) {
      improvements.push({
        issue: 'No skip navigation link',
        location: 'Page start',
        impact: 'low',
        suggestion: 'Add skip link for keyboard users',
        effort: 'quick-fix',
      })
    }
  }

  // Form improvements
  raw.uxData?.forms.forEach((form, i) => {
    const fieldsWithoutLabels = form.fields.filter((f) => !f.label)
    if (fieldsWithoutLabels.length > 0) {
      improvements.push({
        issue: 'Form fields without visible labels',
        location: `Form ${i + 1}`,
        impact: 'medium',
        suggestion: 'Add visible labels for better accessibility and UX',
        effort: 'quick-fix',
      })
    }
  })

  return improvements
}

function findReusablePatterns(raw: RawSnapshot): { name: string; description: string; useCase: string; implementation: string }[] {
  const patterns: { name: string; description: string; useCase: string; implementation: string }[] = []

  // Sticky navigation
  const stickyNav = raw.uxData?.navigation.find((n) => n.isSticky)
  if (stickyNav) {
    patterns.push({
      name: 'Sticky Navigation',
      description: 'Navigation remains visible while scrolling',
      useCase: 'Long pages where users need constant access to navigation',
      implementation: 'position: sticky; top: 0;',
    })
  }

  return patterns
}

function findAntiPatterns(raw: RawSnapshot): { name: string; issue: string; consequence: string; alternative: string }[] {
  const antiPatterns: { name: string; issue: string; consequence: string; alternative: string }[] = []

  // Too many CTAs
  const ctaCount = raw.uxData?.interactions.filter((i) => i.type === 'button').length || 0
  if (ctaCount > 10) {
    antiPatterns.push({
      name: 'CTA Overload',
      issue: `${ctaCount} buttons detected on page`,
      consequence: 'Decision paralysis - users may not click anything',
      alternative: 'Reduce to 2-3 primary actions per viewport',
    })
  }

  return antiPatterns
}

// ============================================
// TAKEAWAYS
// ============================================

function generateTakeaways(
  overview: BlueprintOverview,
  intent: ProductIntent,
  structure: StructuralModel,
  journey: InferredJourney,
  designDna: DesignDNA,
  insights: BlueprintInsights
): BuilderTakeaways {
  const topInsights: Insight[] = []

  // Generate insights based on analysis
  if (overview.clarityScore === 'high') {
    topInsights.push({
      title: 'Clear Value Proposition',
      description: 'This page communicates its purpose effectively',
      applicability: 'universal',
    })
  }

  if (intent.persuasionTechniques.some((t) => t.effectiveness === 'strong')) {
    topInsights.push({
      title: 'Effective Persuasion',
      description: 'Strong persuasion techniques are in use',
      applicability: 'universal',
    })
  }

  if (designDna.system.maturityLevel === 'polished') {
    topInsights.push({
      title: 'Mature Design System',
      description: 'Consistent visual language throughout',
      applicability: 'universal',
    })
  }

  // Ensure we have at least 3 insights
  while (topInsights.length < 3) {
    topInsights.push({
      title: 'Standard Implementation',
      description: 'Page follows common web conventions',
      applicability: 'universal',
    })
  }

  // Errors to avoid
  const errorsToAvoid: string[] = []
  insights.antiPatterns.forEach((ap) => errorsToAvoid.push(ap.issue))
  intent.frictionPoints.forEach((fp) => {
    if (fp.impact === 'major') errorsToAvoid.push(fp.issue)
  })

  return {
    topInsights: topInsights.slice(0, 3),
    errorsToAvoid: errorsToAvoid.slice(0, 2),
    actionableIdea: {
      title: insights.stealThis[0]?.what || 'Apply the best patterns observed',
      description: insights.stealThis[0]?.howToUse || 'Study and adapt the effective elements',
      timeToImplement: 'hours',
      impact: 'meaningful',
    },
    learningMoment: generateLearningMoment(overview, intent),
    builderQuestion: generateBuilderQuestion(overview, intent),
  }
}

function generateLearningMoment(overview: BlueprintOverview, intent: ProductIntent): string {
  if (overview.clarityScore === 'high' && intent.coherenceScore > 0.7) {
    return 'Clarity and coherence are achieved when every element supports a single goal.'
  }
  if (overview.clarityScore === 'low') {
    return 'Confusion often stems from trying to accomplish too many things at once.'
  }
  return 'Good product pages balance information with clear calls to action.'
}

function generateBuilderQuestion(overview: BlueprintOverview, intent: ProductIntent): string {
  if (intent.frictionPoints.length > 0) {
    return 'What is the ONE action you want visitors to take, and is it obvious?'
  }
  return 'If someone landed here for 5 seconds, what would they remember?'
}

// ============================================
// UTILITIES
// ============================================

function calculateOverallConfidence(raw: RawSnapshot): number {
  let confidence = 0.5

  // More data = higher confidence
  if (raw.uxData) confidence += 0.2
  if (raw.designStyles) confidence += 0.2
  if (raw.screenshot) confidence += 0.1

  return Math.min(confidence, 1)
}

export { analyzeOverview, analyzeIntent, analyzeStructure, analyzeJourney, analyzeDesignDNA, analyzeInsights }
