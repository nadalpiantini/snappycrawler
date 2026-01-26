// ============================================
// User Flow Detector Module
// ============================================

import type {
  InteractionElement,
  CapturedForm,
  NavigationElement,
  NavItem,
  CTAAnalysis,
  FormAnalysis,
  NavigationAnalysis,
  UserFlowAnalysis,
  UserFlow,
  FlowType,
  FlowStep,
  ConversionFunnel,
  FunnelStage,
  EntryPoint,
  ExitPoint,
  NavigationStructure,
  AnalyzedNavItem,
  BreadcrumbAnalysis,
  FooterNavigation,
  FooterSection,
  NavigationPattern,
  NavigationStats,
  PageType
} from './types'

/**
 * Detect user flows from analyzed components
 */
export function detectUserFlows(
  ctas: CTAAnalysis,
  forms: FormAnalysis,
  navigation: NavigationAnalysis
): UserFlowAnalysis {
  const primaryFlow = detectPrimaryFlow(ctas, forms)
  const alternativeFlows = detectAlternativeFlows(ctas, forms, navigation)
  const conversionFunnel = buildConversionFunnel(ctas, forms)
  const entryPoints = identifyEntryPoints(ctas, navigation)
  const exitPoints = identifyExitPoints(navigation)

  return {
    primaryFlow,
    alternativeFlows,
    conversionFunnel,
    entryPoints,
    exitPoints
  }
}

/**
 * Detect primary user flow
 */
function detectPrimaryFlow(ctas: CTAAnalysis, forms: FormAnalysis): UserFlow | null {
  // Determine flow type from primary CTA and forms
  const primaryCTA = ctas.primary
  const primaryForm = forms.forms[0]

  if (!primaryCTA && !primaryForm) {
    return null
  }

  // Infer flow type
  const flowType = inferFlowType(primaryCTA, primaryForm)

  // Build flow steps
  const steps = buildFlowSteps(flowType, primaryCTA, primaryForm)

  // Calculate complexity
  const complexity = calculateComplexity(steps, forms)

  return {
    name: getFlowName(flowType),
    type: flowType,
    steps,
    estimatedTime: estimateTime(steps),
    complexity,
    confidence: calculateFlowConfidence(flowType, primaryCTA, primaryForm)
  }
}

/**
 * Infer flow type from CTA and form
 */
function inferFlowType(
  cta: CTAAnalysis['primary'],
  form: FormAnalysis['forms'][0] | undefined
): FlowType {
  // Check form type first
  if (form) {
    switch (form.type) {
      case 'login': return 'login'
      case 'signup': return 'signup'
      case 'checkout':
      case 'payment': return 'purchase'
      case 'contact': return 'contact'
      case 'newsletter': return 'subscription'
      case 'search': return 'search'
    }
  }

  // Check CTA type
  if (cta) {
    switch (cta.type) {
      case 'signup':
      case 'get-started':
      case 'free-trial': return 'signup'
      case 'login': return 'login'
      case 'purchase': return 'purchase'
      case 'subscribe':
      case 'newsletter': return 'subscription'
      case 'contact':
      case 'demo': return 'contact'
    }
  }

  return 'browse'
}

/**
 * Build flow steps
 */
function buildFlowSteps(
  flowType: FlowType,
  cta: CTAAnalysis['primary'],
  form: FormAnalysis['forms'][0] | undefined
): FlowStep[] {
  const steps: FlowStep[] = []

  switch (flowType) {
    case 'signup':
      steps.push(
        { order: 1, action: 'Click signup CTA', element: cta?.text || 'Sign Up button', isRequired: true, hasAlternative: true },
        { order: 2, action: 'Fill registration form', element: 'Registration form', isRequired: true, hasAlternative: false },
        { order: 3, action: 'Submit form', element: 'Submit button', isRequired: true, hasAlternative: false },
        { order: 4, action: 'Verify email', element: 'Email verification', isRequired: false, hasAlternative: true }
      )
      break

    case 'login':
      steps.push(
        { order: 1, action: 'Click login CTA', element: cta?.text || 'Log In button', isRequired: true, hasAlternative: true },
        { order: 2, action: 'Enter credentials', element: 'Login form', isRequired: true, hasAlternative: false },
        { order: 3, action: 'Submit login', element: 'Submit button', isRequired: true, hasAlternative: false }
      )
      break

    case 'purchase':
      steps.push(
        { order: 1, action: 'Add to cart', element: 'Add to Cart button', isRequired: true, hasAlternative: false },
        { order: 2, action: 'View cart', element: 'Cart', isRequired: true, hasAlternative: true },
        { order: 3, action: 'Proceed to checkout', element: 'Checkout button', isRequired: true, hasAlternative: false },
        { order: 4, action: 'Enter shipping info', element: 'Shipping form', isRequired: true, hasAlternative: false },
        { order: 5, action: 'Enter payment info', element: 'Payment form', isRequired: true, hasAlternative: false },
        { order: 6, action: 'Complete purchase', element: 'Place Order button', isRequired: true, hasAlternative: false }
      )
      break

    case 'contact':
      steps.push(
        { order: 1, action: 'Navigate to contact', element: cta?.text || 'Contact link', isRequired: true, hasAlternative: true },
        { order: 2, action: 'Fill contact form', element: 'Contact form', isRequired: true, hasAlternative: false },
        { order: 3, action: 'Submit inquiry', element: 'Submit button', isRequired: true, hasAlternative: false }
      )
      break

    case 'subscription':
      steps.push(
        { order: 1, action: 'Enter email', element: 'Email input', isRequired: true, hasAlternative: false },
        { order: 2, action: 'Subscribe', element: 'Subscribe button', isRequired: true, hasAlternative: false }
      )
      break

    case 'search':
      steps.push(
        { order: 1, action: 'Enter search query', element: 'Search input', isRequired: true, hasAlternative: false },
        { order: 2, action: 'Submit search', element: 'Search button', isRequired: true, hasAlternative: true },
        { order: 3, action: 'Browse results', element: 'Search results', isRequired: true, hasAlternative: false }
      )
      break

    default:
      steps.push(
        { order: 1, action: 'Browse content', element: 'Page content', isRequired: false, hasAlternative: true },
        { order: 2, action: 'Interact with CTAs', element: 'Various CTAs', isRequired: false, hasAlternative: true }
      )
  }

  return steps
}

/**
 * Calculate flow complexity
 */
function calculateComplexity(
  steps: FlowStep[],
  forms: FormAnalysis
): 'simple' | 'moderate' | 'complex' {
  const totalFields = forms.forms.reduce((sum, f) => sum + f.fields.length, 0)

  if (steps.length <= 2 && totalFields <= 3) {
    return 'simple'
  }
  if (steps.length <= 4 && totalFields <= 8) {
    return 'moderate'
  }
  return 'complex'
}

/**
 * Estimate time for flow
 */
function estimateTime(steps: FlowStep[]): string {
  const avgTimePerStep = 30 // seconds
  const totalSeconds = steps.filter(s => s.isRequired).length * avgTimePerStep

  if (totalSeconds < 60) {
    return `${totalSeconds} seconds`
  }
  return `${Math.ceil(totalSeconds / 60)} minute(s)`
}

/**
 * Calculate flow confidence
 */
function calculateFlowConfidence(
  flowType: FlowType,
  cta: CTAAnalysis['primary'],
  form: FormAnalysis['forms'][0] | undefined
): number {
  let confidence = 0.4

  if (cta && cta.confidence > 0.7) {
    confidence += 0.3
  }
  if (form && form.confidence > 0.7) {
    confidence += 0.3
  }
  if (flowType !== 'browse') {
    confidence += 0.1
  }

  return Math.min(1, confidence)
}

/**
 * Get flow name
 */
function getFlowName(flowType: FlowType): string {
  const names: Record<FlowType, string> = {
    'signup': 'User Registration',
    'login': 'User Authentication',
    'purchase': 'Purchase Flow',
    'onboarding': 'Onboarding',
    'search': 'Search & Discovery',
    'browse': 'Content Browsing',
    'contact': 'Contact Inquiry',
    'subscription': 'Newsletter Subscription'
  }
  return names[flowType]
}

/**
 * Detect alternative flows
 */
function detectAlternativeFlows(
  ctas: CTAAnalysis,
  forms: FormAnalysis,
  navigation: NavigationAnalysis
): UserFlow[] {
  const flows: UserFlow[] = []

  // Check secondary CTAs for alternative flows
  ctas.secondary.forEach(cta => {
    const flowType = inferFlowType(cta, undefined)
    if (flowType !== 'browse') {
      flows.push({
        name: `Alternative: ${getFlowName(flowType)}`,
        type: flowType,
        steps: buildFlowSteps(flowType, cta, undefined),
        estimatedTime: '1-2 minute(s)',
        complexity: 'simple',
        confidence: cta.confidence * 0.8
      })
    }
  })

  // Check additional forms
  forms.forms.slice(1).forEach(form => {
    const flowType = inferFlowType(null, form)
    if (flowType !== 'browse') {
      flows.push({
        name: `Alternative: ${getFlowName(flowType)}`,
        type: flowType,
        steps: buildFlowSteps(flowType, null, form),
        estimatedTime: '1-2 minute(s)',
        complexity: 'simple',
        confidence: form.confidence * 0.8
      })
    }
  })

  return flows.slice(0, 3) // Limit to 3 alternative flows
}

/**
 * Build conversion funnel
 */
function buildConversionFunnel(
  ctas: CTAAnalysis,
  forms: FormAnalysis
): ConversionFunnel | null {
  if (!ctas.primary && forms.forms.length === 0) {
    return null
  }

  const stages: FunnelStage[] = [
    { name: 'Awareness', action: 'Land on page', position: 1 },
    { name: 'Interest', action: 'Engage with content', position: 2 }
  ]

  if (ctas.primary) {
    stages.push({
      name: 'Consideration',
      action: 'Click primary CTA',
      ctaText: ctas.primary.text,
      position: 3
    })
  }

  if (forms.forms.some(f => ['signup', 'checkout', 'contact'].includes(f.type))) {
    stages.push({
      name: 'Conversion',
      action: 'Complete form submission',
      position: 4
    })
  }

  return {
    stages,
    dropOffPoints: [
      'Form abandonment',
      'Long page load',
      'Missing information'
    ],
    optimizationSuggestions: [
      'Add progress indicators to multi-step forms',
      'Reduce form field count',
      'Add trust signals near CTAs'
    ]
  }
}

/**
 * Identify entry points
 */
function identifyEntryPoints(
  ctas: CTAAnalysis,
  navigation: NavigationAnalysis
): EntryPoint[] {
  const entryPoints: EntryPoint[] = []

  // Primary CTA as entry point
  if (ctas.primary) {
    entryPoints.push({
      type: 'cta',
      text: ctas.primary.text,
      prominence: ctas.primary.styling.prominence
    })
  }

  // Navigation items as entry points
  if (navigation.primary) {
    navigation.primary.items.slice(0, 3).forEach(item => {
      entryPoints.push({
        type: 'navigation',
        text: item.text,
        prominence: item.importance === 'primary' ? 'high' : 'medium'
      })
    })
  }

  // Secondary CTAs
  ctas.secondary.slice(0, 2).forEach(cta => {
    entryPoints.push({
      type: 'cta',
      text: cta.text,
      prominence: 'medium'
    })
  })

  return entryPoints
}

/**
 * Identify exit points
 */
function identifyExitPoints(navigation: NavigationAnalysis): ExitPoint[] {
  const exitPoints: ExitPoint[] = []

  // External links
  if (navigation.stats.externalLinks > 0) {
    exitPoints.push({
      type: 'external-link',
      destination: 'External websites'
    })
  }

  // Footer links often lead to exit
  if (navigation.footer) {
    if (navigation.footer.hasSocialLinks) {
      exitPoints.push({
        type: 'external-link',
        destination: 'Social media'
      })
    }
  }

  return exitPoints
}

/**
 * Analyze navigation structure
 */
export function analyzeNavigation(navElements: NavigationElement[]): NavigationAnalysis {
  if (!navElements || navElements.length === 0) {
    return getDefaultNavigationAnalysis()
  }

  const primary = findPrimaryNavigation(navElements)
  const secondary = navElements
    .filter(n => n !== findPrimaryNav(navElements))
    .map(n => analyzeNavStructure(n))
    .slice(0, 3)

  const breadcrumbs = findBreadcrumbs(navElements)
  const footer = findFooterNav(navElements)
  const patterns = detectNavPatterns(navElements, primary)
  const stats = calculateNavStats(navElements)

  return {
    primary,
    secondary,
    breadcrumbs,
    footer,
    patterns,
    stats
  }
}

/**
 * Find primary navigation
 */
function findPrimaryNav(navElements: NavigationElement[]): NavigationElement | null {
  return navElements.find(n => n.type === 'nav' && n.position.y < 200) || null
}

function findPrimaryNavigation(navElements: NavigationElement[]): NavigationStructure | null {
  const primary = findPrimaryNav(navElements)
  if (!primary) return null
  return analyzeNavStructure(primary)
}

/**
 * Analyze navigation structure
 */
function analyzeNavStructure(nav: NavigationElement): NavigationStructure {
  const items = nav.items.map(item => analyzeNavItem(item))
  const depth = calculateNavDepth(nav.items)

  return {
    type: nav.items.length > 7 ? 'mega-menu' : 'horizontal',
    items,
    depth,
    isSticky: nav.isSticky,
    hasMobileVersion: true // Assume responsive
  }
}

/**
 * Analyze nav item
 */
function analyzeNavItem(item: NavItem): AnalyzedNavItem {
  return {
    text: item.text,
    href: item.href,
    isActive: item.isActive,
    importance: item.isActive ? 'primary' : 'secondary',
    hasSubmenu: item.hasDropdown,
    submenuItems: item.children?.map(c => analyzeNavItem(c))
  }
}

/**
 * Calculate navigation depth
 */
function calculateNavDepth(items: NavItem[], currentDepth = 1): number {
  let maxDepth = currentDepth
  items.forEach(item => {
    if (item.children && item.children.length > 0) {
      const childDepth = calculateNavDepth(item.children, currentDepth + 1)
      maxDepth = Math.max(maxDepth, childDepth)
    }
  })
  return maxDepth
}

/**
 * Find breadcrumbs
 */
function findBreadcrumbs(navElements: NavigationElement[]): BreadcrumbAnalysis | null {
  const breadcrumb = navElements.find(n => n.type === 'breadcrumb')
  if (!breadcrumb) return null

  return {
    levels: breadcrumb.items.length,
    items: breadcrumb.items.map(i => i.text),
    hasStructuredData: false // Would need HTML inspection
  }
}

/**
 * Find footer navigation
 */
function findFooterNav(navElements: NavigationElement[]): FooterNavigation | null {
  const footerNavs = navElements.filter(n => n.position.y > 1000)
  if (footerNavs.length === 0) return null

  const sections: FooterSection[] = footerNavs.map(nav => ({
    title: nav.items[0]?.text || 'Links',
    linkCount: nav.items.length,
    type: inferFooterSectionType(nav.items)
  }))

  return {
    columns: footerNavs.length,
    sections,
    hasSocialLinks: sections.some(s => s.type === 'social'),
    hasLegalLinks: sections.some(s => s.type === 'legal')
  }
}

/**
 * Infer footer section type
 */
function inferFooterSectionType(items: NavItem[]): FooterSection['type'] {
  const texts = items.map(i => i.text.toLowerCase()).join(' ')

  if (/privacy|terms|legal|cookie/i.test(texts)) return 'legal'
  if (/twitter|facebook|linkedin|instagram|social/i.test(texts)) return 'social'
  if (/about|team|career|company/i.test(texts)) return 'company'
  if (/product|feature|pricing/i.test(texts)) return 'product'
  if (/blog|docs|help|support|resource/i.test(texts)) return 'resources'
  if (/contact|email|phone/i.test(texts)) return 'contact'

  return 'resources'
}

/**
 * Detect navigation patterns
 */
function detectNavPatterns(
  navElements: NavigationElement[],
  primary: NavigationStructure | null
): NavigationPattern[] {
  return [
    {
      name: 'Sticky header',
      description: 'Navigation stays fixed on scroll',
      isPresent: navElements.some(n => n.isSticky)
    },
    {
      name: 'Mega menu',
      description: 'Large dropdown with multiple columns',
      isPresent: primary?.type === 'mega-menu'
    },
    {
      name: 'Breadcrumb navigation',
      description: 'Shows hierarchical path',
      isPresent: navElements.some(n => n.type === 'breadcrumb')
    },
    {
      name: 'Tab navigation',
      description: 'Content organized in tabs',
      isPresent: navElements.some(n => n.type === 'tabs')
    },
    {
      name: 'Sidebar navigation',
      description: 'Vertical navigation sidebar',
      isPresent: navElements.some(n => n.type === 'sidebar')
    }
  ]
}

/**
 * Calculate navigation stats
 */
function calculateNavStats(navElements: NavigationElement[]): NavigationStats {
  const allItems = navElements.flatMap(n => flattenNavItems(n.items))

  return {
    totalLinks: allItems.length,
    externalLinks: allItems.filter(i => i.href?.startsWith('http')).length,
    internalLinks: allItems.filter(i => i.href && !i.href.startsWith('http')).length,
    maxDepth: Math.max(...navElements.map(n => calculateNavDepth(n.items))),
    hasMobileNav: true // Assume responsive
  }
}

/**
 * Flatten nav items
 */
function flattenNavItems(items: NavItem[]): NavItem[] {
  const flat: NavItem[] = []
  items.forEach(item => {
    flat.push(item)
    if (item.children) {
      flat.push(...flattenNavItems(item.children))
    }
  })
  return flat
}

/**
 * Detect page type
 */
export function detectPageType(
  ctas: CTAAnalysis,
  forms: FormAnalysis,
  navigation: NavigationAnalysis
): PageType {
  // Check forms first
  if (forms.forms.some(f => f.type === 'login')) return 'auth'
  if (forms.forms.some(f => f.type === 'signup')) return 'auth'
  if (forms.forms.some(f => f.type === 'checkout' || f.type === 'payment')) return 'checkout'
  if (forms.forms.some(f => f.type === 'search')) return 'search'

  // Check CTAs
  if (ctas.primary) {
    if (['signup', 'free-trial', 'get-started'].includes(ctas.primary.type)) return 'landing'
    if (ctas.primary.type === 'purchase') return 'product'
    if (ctas.primary.type === 'subscribe') return 'pricing'
  }

  // Check navigation patterns
  if (navigation.breadcrumbs && navigation.breadcrumbs.levels > 2) return 'detail'

  // Default
  return 'unknown'
}

/**
 * Get default navigation analysis
 */
export function getDefaultNavigationAnalysis(): NavigationAnalysis {
  return {
    primary: null,
    secondary: [],
    breadcrumbs: null,
    footer: null,
    patterns: [],
    stats: {
      totalLinks: 0,
      externalLinks: 0,
      internalLinks: 0,
      maxDepth: 0,
      hasMobileNav: false
    }
  }
}

/**
 * Get default user flow analysis
 */
export function getDefaultUserFlowAnalysis(): UserFlowAnalysis {
  return {
    primaryFlow: null,
    alternativeFlows: [],
    conversionFunnel: null,
    entryPoints: [],
    exitPoints: []
  }
}
