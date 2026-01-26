// ============================================
// UX Intelligence Analyzer - Main Orchestrator
// ============================================

import type {
  CapturedUXData,
  UXAnalysis,
  UXAnalysisMeta,
  PageType,
  DetectedPatterns,
  UXRecommendation,
  AccessibilityAnalysis,
  AccessibilityIssue,
  AccessibilityStats,
  LayoutPattern,
  InteractionPattern,
  ContentPattern,
  EngagementPattern
} from './types'

import { analyzeCTAs, getDefaultCTAAnalysis } from './cta-detector'
import { analyzeForms, getDefaultFormAnalysis } from './form-analyzer'
import {
  detectUserFlows,
  analyzeNavigation,
  detectPageType,
  getDefaultUserFlowAnalysis,
  getDefaultNavigationAnalysis
} from './flow-detector'

/**
 * Main UX Intelligence analysis function
 */
export function analyzeUX(capturedData: CapturedUXData, source: string = 'unknown'): UXAnalysis {
  // Validate input
  if (!validateCapturedData(capturedData)) {
    return getDefaultUXAnalysis(source)
  }

  // Run all analyzers
  const ctas = analyzeCTAs(capturedData.interactions || [])
  const forms = analyzeForms(capturedData.forms || [])
  const navigation = analyzeNavigation(capturedData.navigation || [])
  const userFlows = detectUserFlows(ctas, forms, navigation)
  const accessibility = analyzeAccessibility(capturedData.accessibility)
  const pageType = detectPageType(ctas, forms, navigation)

  // Detect patterns
  const patterns = detectPatterns(capturedData, ctas, forms, navigation)

  // Generate recommendations
  const recommendations = generateRecommendations(
    ctas,
    forms,
    navigation,
    accessibility,
    patterns
  )

  // Calculate overall confidence
  const confidence = calculateOverallConfidence(ctas, forms, navigation, userFlows)

  // Build meta
  const meta: UXAnalysisMeta = {
    source,
    analyzedAt: new Date().toISOString(),
    confidence,
    version: '1.0.0',
    pageType
  }

  return {
    meta,
    ctas,
    forms,
    navigation,
    userFlows,
    accessibility,
    patterns,
    recommendations
  }
}

/**
 * Validate captured data has minimum required fields
 */
export function validateCapturedData(data: CapturedUXData): boolean {
  if (!data) return false

  // At least one data type should be present
  const hasInteractions = Array.isArray(data.interactions) && data.interactions.length > 0
  const hasForms = Array.isArray(data.forms) && data.forms.length > 0
  const hasNavigation = Array.isArray(data.navigation) && data.navigation.length > 0
  const hasAccessibility = !!data.accessibility

  return hasInteractions || hasForms || hasNavigation || hasAccessibility
}

/**
 * Get summary of captured data
 */
export function getCaptureSummary(data: CapturedUXData): {
  interactions: number
  forms: number
  navigation: number
  modals: number
  media: number
  hasAccessibility: boolean
} {
  return {
    interactions: data.interactions?.length || 0,
    forms: data.forms?.length || 0,
    navigation: data.navigation?.length || 0,
    modals: data.modals?.length || 0,
    media: data.media?.length || 0,
    hasAccessibility: !!data.accessibility
  }
}

/**
 * Analyze accessibility data
 */
function analyzeAccessibility(data?: CapturedUXData['accessibility']): AccessibilityAnalysis {
  if (!data) {
    return getDefaultAccessibilityAnalysis()
  }

  const issues: AccessibilityIssue[] = []

  // Check skip links
  if (!data.hasSkipLink) {
    issues.push({
      type: 'navigation',
      severity: 'moderate',
      description: 'No skip link found for keyboard navigation',
      wcagCriteria: '2.4.1',
      affectedElements: 1,
      suggestion: 'Add a skip link at the beginning of the page to bypass navigation'
    })
  }

  // Check landmark regions
  if (data.landmarkRegions.length === 0) {
    issues.push({
      type: 'structure',
      severity: 'moderate',
      description: 'No ARIA landmark regions found',
      wcagCriteria: '1.3.1',
      affectedElements: 1,
      suggestion: 'Add landmark roles (main, nav, header, footer) for screen readers'
    })
  }

  // Check heading structure
  const headingIssues = analyzeHeadingStructure(data.headingStructure)
  issues.push(...headingIssues)

  // Check images without alt
  if (data.imagesWithoutAlt > 0) {
    issues.push({
      type: 'images',
      severity: data.imagesWithoutAlt > 5 ? 'serious' : 'moderate',
      description: `${data.imagesWithoutAlt} image(s) missing alt text`,
      wcagCriteria: '1.1.1',
      affectedElements: data.imagesWithoutAlt,
      suggestion: 'Add descriptive alt text to all informative images'
    })
  }

  // Check color contrast issues
  if (data.colorContrastIssues > 0) {
    issues.push({
      type: 'color',
      severity: 'serious',
      description: `${data.colorContrastIssues} color contrast issue(s) detected`,
      wcagCriteria: '1.4.3',
      affectedElements: data.colorContrastIssues,
      suggestion: 'Ensure text has sufficient contrast ratio (4.5:1 for normal text)'
    })
  }

  // Calculate score and level
  const { score, level } = calculateAccessibilityScore(issues, data)

  // Determine passes
  const passes: string[] = []
  if (data.hasSkipLink) passes.push('Skip link present')
  if (data.landmarkRegions.length > 0) passes.push('Landmark regions defined')
  if (data.imagesWithoutAlt === 0) passes.push('All images have alt text')
  if (data.ariaLabelsCount > 0) passes.push('ARIA labels in use')
  if (data.focusableElements > 0) passes.push('Focusable elements present')

  // Build stats
  const stats: AccessibilityStats = {
    totalIssues: issues.length,
    criticalIssues: issues.filter(i => i.severity === 'critical').length,
    hasSkipLinks: data.hasSkipLink,
    hasLandmarks: data.landmarkRegions.length > 0,
    headingOrder: determineHeadingOrder(data.headingStructure),
    imagesWithAlt: data.imagesWithAlt,
    imagesTotal: data.imagesWithAlt + data.imagesWithoutAlt,
    focusVisible: true, // Would need JS analysis
    keyboardNavigable: data.focusableElements > 0
  }

  return {
    score,
    level,
    issues,
    passes,
    stats
  }
}

/**
 * Analyze heading structure for issues
 */
function analyzeHeadingStructure(
  headings: CapturedUXData['accessibility']['headingStructure']
): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []

  if (!headings || headings.length === 0) {
    issues.push({
      type: 'structure',
      severity: 'moderate',
      description: 'No headings found on page',
      wcagCriteria: '1.3.1',
      affectedElements: 0,
      suggestion: 'Add semantic headings (h1-h6) to structure content'
    })
    return issues
  }

  // Check for h1
  const h1 = headings.find(h => h.level === 1)
  if (!h1 || h1.count === 0) {
    issues.push({
      type: 'structure',
      severity: 'serious',
      description: 'No h1 heading found',
      wcagCriteria: '1.3.1',
      affectedElements: 1,
      suggestion: 'Add exactly one h1 element as the main page heading'
    })
  } else if (h1.count > 1) {
    issues.push({
      type: 'structure',
      severity: 'moderate',
      description: `Multiple h1 headings found (${h1.count})`,
      wcagCriteria: '1.3.1',
      affectedElements: h1.count,
      suggestion: 'Use only one h1 per page for main heading'
    })
  }

  // Check for skipped levels
  const levels = headings.map(h => h.level).sort((a, b) => a - b)
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      issues.push({
        type: 'structure',
        severity: 'minor',
        description: `Heading level skipped (h${levels[i - 1]} to h${levels[i]})`,
        wcagCriteria: '1.3.1',
        affectedElements: 1,
        suggestion: 'Maintain sequential heading order without skipping levels'
      })
    }
  }

  return issues
}

/**
 * Calculate accessibility score and WCAG level
 */
function calculateAccessibilityScore(
  issues: AccessibilityIssue[],
  data: CapturedUXData['accessibility']
): { score: number; level: 'A' | 'AA' | 'AAA' | 'fail' } {
  let score = 100

  // Deduct for issues
  issues.forEach(issue => {
    if (issue.severity === 'critical') score -= 25
    else if (issue.severity === 'serious') score -= 15
    else if (issue.severity === 'moderate') score -= 10
    else if (issue.severity === 'minor') score -= 5
  })

  // Bonus for good practices
  if (data.hasSkipLink) score += 5
  if (data.landmarkRegions.length >= 3) score += 5
  if (data.ariaLabelsCount > 10) score += 5

  score = Math.max(0, Math.min(100, score))

  // Determine level
  let level: 'A' | 'AA' | 'AAA' | 'fail' = 'fail'
  const hasCritical = issues.some(i => i.severity === 'critical')
  const hasSerious = issues.some(i => i.severity === 'serious')

  if (!hasCritical && !hasSerious && score >= 90) {
    level = 'AAA'
  } else if (!hasCritical && score >= 70) {
    level = 'AA'
  } else if (score >= 50) {
    level = 'A'
  }

  return { score, level }
}

/**
 * Determine heading order status
 */
function determineHeadingOrder(
  headings: CapturedUXData['accessibility']['headingStructure']
): 'correct' | 'incorrect' | 'missing' {
  if (!headings || headings.length === 0) return 'missing'

  const levels = headings.filter(h => h.count > 0).map(h => h.level).sort((a, b) => a - b)

  if (levels.length === 0) return 'missing'
  if (levels[0] !== 1) return 'incorrect'

  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) return 'incorrect'
  }

  return 'correct'
}

/**
 * Detect UX patterns
 */
function detectPatterns(
  data: CapturedUXData,
  ctas: ReturnType<typeof analyzeCTAs>,
  forms: ReturnType<typeof analyzeForms>,
  navigation: ReturnType<typeof analyzeNavigation>
): DetectedPatterns {
  return {
    layout: detectLayoutPatterns(data, navigation),
    interaction: detectInteractionPatterns(data, ctas),
    content: detectContentPatterns(data),
    engagement: detectEngagementPatterns(ctas, forms)
  }
}

/**
 * Detect layout patterns
 */
function detectLayoutPatterns(
  data: CapturedUXData,
  navigation: ReturnType<typeof analyzeNavigation>
): LayoutPattern[] {
  const patterns: LayoutPattern[] = []

  // Hero section detection
  const hasHeroCTA = data.interactions?.some(
    el => el.position.viewportPosition === 'above-fold' && el.type === 'button'
  )
  if (hasHeroCTA) {
    patterns.push({
      name: 'Hero Section',
      confidence: 0.8,
      description: 'Large above-fold section with prominent CTA'
    })
  }

  // Fixed navigation
  if (navigation.primary?.isSticky) {
    patterns.push({
      name: 'Sticky Header',
      confidence: 0.9,
      description: 'Navigation remains visible while scrolling'
    })
  }

  // Multi-column layout
  if (navigation.footer && navigation.footer.columns > 2) {
    patterns.push({
      name: 'Multi-Column Footer',
      confidence: 0.85,
      description: 'Footer organized into multiple link columns'
    })
  }

  // Card layout (if many similarly-sized elements)
  const cards = data.interactions?.filter(el =>
    el.className?.includes('card') || el.tag === 'article'
  ) || []
  if (cards.length >= 3) {
    patterns.push({
      name: 'Card Layout',
      confidence: 0.7,
      description: 'Content organized in card-based grid'
    })
  }

  return patterns
}

/**
 * Detect interaction patterns
 */
function detectInteractionPatterns(
  data: CapturedUXData,
  ctas: ReturnType<typeof analyzeCTAs>
): InteractionPattern[] {
  const patterns: InteractionPattern[] = []

  // Hover interactions (buttons/links)
  const interactiveElements = data.interactions?.filter(
    el => el.type === 'button' || el.type === 'link'
  ) || []
  if (interactiveElements.length > 0) {
    patterns.push({
      name: 'Click Interactions',
      type: 'click',
      elements: interactiveElements.slice(0, 5).map(el => el.text || el.tag)
    })
  }

  // Scroll-triggered elements
  const belowFoldCTAs = ctas.secondary.filter(
    c => c.element.position?.viewportPosition === 'below-fold'
  )
  if (belowFoldCTAs.length > 0) {
    patterns.push({
      name: 'Scroll Discovery',
      type: 'scroll',
      elements: belowFoldCTAs.map(c => c.text)
    })
  }

  // Modal triggers
  if (data.modals && data.modals.length > 0) {
    patterns.push({
      name: 'Modal Dialogs',
      type: 'click',
      elements: data.modals.map(m => m.type)
    })
  }

  return patterns
}

/**
 * Detect content patterns
 */
function detectContentPatterns(data: CapturedUXData): ContentPattern[] {
  const patterns: ContentPattern[] = []

  // Navigation content
  if (data.navigation && data.navigation.length > 0) {
    patterns.push({
      name: 'Primary Navigation',
      sections: data.navigation.map(n => n.type),
      order: 1
    })
  }

  // Form content
  if (data.forms && data.forms.length > 0) {
    patterns.push({
      name: 'Interactive Forms',
      sections: data.forms.map((_, i) => `Form ${i + 1}`),
      order: 2
    })
  }

  // Media content
  if (data.media && data.media.length > 0) {
    const mediaTypes = [...new Set(data.media.map(m => m.type))]
    patterns.push({
      name: 'Media Content',
      sections: mediaTypes,
      order: 3
    })
  }

  return patterns
}

/**
 * Detect engagement patterns
 */
function detectEngagementPatterns(
  ctas: ReturnType<typeof analyzeCTAs>,
  forms: ReturnType<typeof analyzeForms>
): EngagementPattern[] {
  const patterns: EngagementPattern[] = []

  // Urgency patterns
  const urgentCTAs = [...(ctas.secondary || []), ctas.primary]
    .filter(c => c && c.urgency === 'high')
  if (urgentCTAs.length > 0) {
    patterns.push({
      name: 'Urgency Messaging',
      type: 'urgency',
      elements: urgentCTAs.map(c => c!.text)
    })
  }

  // Social proof (would need content analysis)
  // For now, check for social-type CTAs
  const socialCTAs = ctas.tertiary?.filter(c => c.type === 'social') || []
  if (socialCTAs.length > 0) {
    patterns.push({
      name: 'Social Integration',
      type: 'social-proof',
      elements: socialCTAs.map(c => c.text)
    })
  }

  // Newsletter/subscription
  const newsletterForms = forms.forms.filter(f => f.type === 'newsletter')
  if (newsletterForms.length > 0) {
    patterns.push({
      name: 'Newsletter Capture',
      type: 'personalization',
      elements: ['Email subscription form']
    })
  }

  // Free trial emphasis
  const freeTrialCTAs = [...(ctas.secondary || []), ctas.primary]
    .filter(c => c && c.type === 'free-trial')
  if (freeTrialCTAs.length > 0) {
    patterns.push({
      name: 'Free Trial Offer',
      type: 'scarcity',
      elements: freeTrialCTAs.map(c => c!.text)
    })
  }

  return patterns
}

/**
 * Generate UX recommendations
 */
function generateRecommendations(
  ctas: ReturnType<typeof analyzeCTAs>,
  forms: ReturnType<typeof analyzeForms>,
  navigation: ReturnType<typeof analyzeNavigation>,
  accessibility: AccessibilityAnalysis,
  patterns: DetectedPatterns
): UXRecommendation[] {
  const recommendations: UXRecommendation[] = []

  // CTA recommendations
  if (!ctas.primary) {
    recommendations.push({
      category: 'cta',
      priority: 'high',
      title: 'Add Primary CTA',
      description: 'No clear primary call-to-action detected above the fold',
      impact: 'Primary CTAs drive 70%+ of conversions',
      effort: 'low',
      implementation: 'Add a prominent button in the hero section'
    })
  } else if (ctas.primary.confidence < 0.5) {
    recommendations.push({
      category: 'cta',
      priority: 'medium',
      title: 'Improve CTA Visibility',
      description: 'Primary CTA has low confidence score',
      impact: 'Higher visibility increases click-through rates',
      effort: 'low',
      implementation: 'Use contrasting colors, larger size, or better positioning'
    })
  }

  // Multiple competing CTAs
  const highPromCTAs = ctas.secondary.filter(c => c.styling.prominence === 'high')
  if (highPromCTAs.length > 2) {
    recommendations.push({
      category: 'cta',
      priority: 'medium',
      title: 'Reduce CTA Competition',
      description: `${highPromCTAs.length} high-prominence CTAs may confuse users`,
      impact: 'Clear hierarchy improves decision-making',
      effort: 'low',
      implementation: 'Establish visual hierarchy with one primary, others secondary'
    })
  }

  // Form recommendations
  forms.forms.forEach((form, i) => {
    if (form.uxScore < 60) {
      recommendations.push({
        category: 'form',
        priority: 'high',
        title: `Improve Form ${i + 1} UX`,
        description: `Form has low UX score (${form.uxScore}/100)`,
        impact: 'Poor form UX causes abandonment',
        effort: 'medium',
        implementation: form.issues.map(issue => issue.message).join('; ')
      })
    }
  })

  // Navigation recommendations
  if (!navigation.primary) {
    recommendations.push({
      category: 'navigation',
      priority: 'high',
      title: 'Add Primary Navigation',
      description: 'No clear primary navigation detected',
      impact: 'Navigation is essential for user orientation',
      effort: 'medium'
    })
  }

  if (!navigation.breadcrumbs) {
    recommendations.push({
      category: 'navigation',
      priority: 'low',
      title: 'Add Breadcrumbs',
      description: 'Breadcrumb navigation not detected',
      impact: 'Breadcrumbs improve navigation and SEO',
      effort: 'low'
    })
  }

  // Accessibility recommendations
  if (accessibility.score < 70) {
    recommendations.push({
      category: 'accessibility',
      priority: 'high',
      title: 'Improve Accessibility',
      description: `Accessibility score is ${accessibility.score}/100`,
      impact: 'Accessibility affects 15%+ of users',
      effort: 'medium',
      implementation: accessibility.issues
        .filter(i => i.severity === 'serious' || i.severity === 'critical')
        .map(i => i.suggestion)
        .slice(0, 3)
        .join('; ')
    })
  }

  // Engagement recommendations
  const hasUrgency = patterns.engagement.some(p => p.type === 'urgency')
  const hasSocialProof = patterns.engagement.some(p => p.type === 'social-proof')

  if (!hasUrgency && ctas.primary?.type === 'purchase') {
    recommendations.push({
      category: 'engagement',
      priority: 'medium',
      title: 'Add Urgency Elements',
      description: 'No urgency messaging detected for purchase flow',
      impact: 'Urgency can increase conversions by 30%+',
      effort: 'low',
      implementation: 'Add limited-time offers, stock indicators, or countdown timers'
    })
  }

  if (!hasSocialProof) {
    recommendations.push({
      category: 'engagement',
      priority: 'medium',
      title: 'Add Social Proof',
      description: 'No social proof elements detected',
      impact: 'Social proof increases trust and conversions',
      effort: 'medium',
      implementation: 'Add testimonials, reviews, trust badges, or user counts'
    })
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations
}

/**
 * Calculate overall analysis confidence
 */
function calculateOverallConfidence(
  ctas: ReturnType<typeof analyzeCTAs>,
  forms: ReturnType<typeof analyzeForms>,
  navigation: ReturnType<typeof analyzeNavigation>,
  userFlows: ReturnType<typeof detectUserFlows>
): number {
  const scores: number[] = []

  // CTA confidence
  if (ctas.primary) {
    scores.push(ctas.primary.confidence)
  }
  ctas.secondary.forEach(c => scores.push(c.confidence * 0.5))

  // Form confidence
  forms.forms.forEach(f => scores.push(f.confidence))

  // Navigation confidence (based on completeness)
  if (navigation.primary) {
    scores.push(0.7)
  }
  if (navigation.breadcrumbs) {
    scores.push(0.5)
  }

  // User flow confidence
  if (userFlows.primaryFlow) {
    scores.push(userFlows.primaryFlow.confidence)
  }

  if (scores.length === 0) return 0.1

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return Math.round(avg * 100) / 100
}

/**
 * Get default accessibility analysis
 */
function getDefaultAccessibilityAnalysis(): AccessibilityAnalysis {
  return {
    score: 50,
    level: 'fail',
    issues: [],
    passes: [],
    stats: {
      totalIssues: 0,
      criticalIssues: 0,
      hasSkipLinks: false,
      hasLandmarks: false,
      headingOrder: 'missing',
      imagesWithAlt: 0,
      imagesTotal: 0,
      focusVisible: false,
      keyboardNavigable: false
    }
  }
}

/**
 * Get default UX analysis for invalid input
 */
export function getDefaultUXAnalysis(source: string): UXAnalysis {
  return {
    meta: {
      source,
      analyzedAt: new Date().toISOString(),
      confidence: 0,
      version: '1.0.0',
      pageType: 'unknown'
    },
    ctas: getDefaultCTAAnalysis(),
    forms: getDefaultFormAnalysis(),
    navigation: getDefaultNavigationAnalysis(),
    userFlows: getDefaultUserFlowAnalysis(),
    accessibility: getDefaultAccessibilityAnalysis(),
    patterns: {
      layout: [],
      interaction: [],
      content: [],
      engagement: []
    },
    recommendations: []
  }
}
