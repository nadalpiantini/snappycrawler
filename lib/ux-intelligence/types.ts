// ============================================
// UX Intelligence Type Definitions
// ============================================

// ===========================================
// CAPTURED DATA (from Chrome Extension)
// ===========================================

/**
 * Enhanced UX data captured by Chrome extension
 */
export interface CapturedUXData {
  interactions: InteractionElement[]
  forms: CapturedForm[]
  navigation: NavigationElement[]
  modals: ModalElement[]
  media: MediaElement[]
  accessibility: AccessibilityData
}

export interface InteractionElement {
  type: 'button' | 'link' | 'input' | 'select' | 'checkbox' | 'radio' | 'toggle'
  tag: string
  text: string
  href?: string | null
  id?: string | null
  className?: string | null
  ariaLabel?: string | null
  role?: string | null
  position: ElementPosition
  styles: InteractionStyles
  isVisible: boolean
  isDisabled: boolean
}

export interface InteractionStyles {
  backgroundColor: string
  color: string
  fontSize: string
  fontWeight: string
  padding: string
  borderRadius: string
  border: string
  boxShadow?: string
}

export interface ElementPosition {
  x: number
  y: number
  width: number
  height: number
  viewportPosition: 'above-fold' | 'below-fold'
}

export interface CapturedForm {
  id?: string | null
  action?: string | null
  method?: string | null
  fields: FormField[]
  submitButton?: SubmitButton | null
  position: ElementPosition
}

export interface SubmitButton {
  type: string
  tag: string
  text: string
}

export interface FormField {
  type: string          // text, email, password, tel, number, etc.
  name?: string | null
  id?: string | null
  label?: string | null
  placeholder?: string | null
  required: boolean
  autocomplete?: string | null
  pattern?: string | null
  minLength?: number | null
  maxLength?: number | null
}

export interface NavigationElement {
  type: 'nav' | 'menu' | 'breadcrumb' | 'pagination' | 'tabs' | 'sidebar'
  items: NavItem[]
  position: ElementPosition
  isSticky: boolean
}

export interface NavItem {
  text: string
  href?: string
  isActive: boolean
  hasDropdown: boolean
  children?: NavItem[]
}

export interface ModalElement {
  type: 'modal' | 'dialog' | 'popup' | 'toast' | 'tooltip'
  trigger?: string
  hasOverlay: boolean
  hasCloseButton: boolean
  position: 'center' | 'top' | 'bottom' | 'side'
}

export interface MediaElement {
  type: 'image' | 'video' | 'audio' | 'iframe' | 'canvas'
  src?: string | null
  alt?: string | null
  dimensions: { width: number; height: number }
  isLazyLoaded: boolean
}

export interface AccessibilityData {
  hasSkipLink: boolean
  landmarkRegions: string[]
  headingStructure: HeadingLevel[]
  focusableElements: number
  ariaLabelsCount: number
  imagesWithAlt: number
  imagesWithoutAlt: number
  colorContrastIssues: number
}

export interface HeadingLevel {
  level: number
  count: number
  examples: string[]
}

// ===========================================
// ANALYZED OUTPUT (UX Tokens)
// ===========================================

/**
 * Complete UX Intelligence analysis output
 */
export interface UXAnalysis {
  meta: UXAnalysisMeta
  ctas: CTAAnalysis
  forms: FormAnalysis
  navigation: NavigationAnalysis
  userFlows: UserFlowAnalysis
  accessibility: AccessibilityAnalysis
  patterns: DetectedPatterns
  recommendations: UXRecommendation[]
}

export interface UXAnalysisMeta {
  source: string
  analyzedAt: string
  confidence: number
  version: string
  pageType: PageType
}

export type PageType =
  | 'landing'
  | 'product'
  | 'pricing'
  | 'blog'
  | 'documentation'
  | 'dashboard'
  | 'auth'
  | 'checkout'
  | 'profile'
  | 'search'
  | 'listing'
  | 'detail'
  | 'error'
  | 'unknown'

// ===========================================
// CTA ANALYSIS
// ===========================================

export interface CTAAnalysis {
  primary: CTA | null
  secondary: CTA[]
  tertiary: CTA[]
  stats: CTAStats
}

export interface CTA {
  text: string
  type: CTAType
  action: CTAAction
  urgency: 'high' | 'medium' | 'low'
  confidence: number
  position: 'hero' | 'header' | 'body' | 'footer' | 'sticky' | 'modal'
  styling: CTAStyling
  element: Partial<InteractionElement>
}

export type CTAType =
  | 'signup'
  | 'login'
  | 'purchase'
  | 'subscribe'
  | 'download'
  | 'contact'
  | 'learn-more'
  | 'get-started'
  | 'free-trial'
  | 'demo'
  | 'newsletter'
  | 'social'
  | 'navigation'
  | 'other'

export type CTAAction =
  | 'form-submit'
  | 'page-navigation'
  | 'external-link'
  | 'modal-trigger'
  | 'download'
  | 'scroll'
  | 'unknown'

export interface CTAStyling {
  prominence: 'high' | 'medium' | 'low'
  style: 'solid' | 'outline' | 'ghost' | 'link'
  size: 'large' | 'medium' | 'small'
  hasIcon: boolean
  isAnimated: boolean
}

export interface CTAStats {
  totalCount: number
  aboveFold: number
  belowFold: number
  inHeader: number
  inFooter: number
  primaryCount: number
  secondaryCount: number
}

// ===========================================
// FORM ANALYSIS
// ===========================================

export interface FormAnalysis {
  forms: AnalyzedForm[]
  patterns: FormPattern[]
  stats: FormStats
}

export interface AnalyzedForm {
  type: FormType
  confidence: number
  fields: AnalyzedField[]
  validation: FormValidation
  uxScore: number
  issues: FormIssue[]
  position: ElementPosition
}

export type FormType =
  | 'login'
  | 'signup'
  | 'contact'
  | 'newsletter'
  | 'search'
  | 'checkout'
  | 'payment'
  | 'profile'
  | 'feedback'
  | 'survey'
  | 'filter'
  | 'settings'
  | 'other'

export interface AnalyzedField {
  type: string
  purpose: FieldPurpose
  label?: string | null
  isRequired: boolean
  hasValidation: boolean
  validationType?: string
  position: number
}

export type FieldPurpose =
  | 'email'
  | 'password'
  | 'name'
  | 'phone'
  | 'address'
  | 'city'
  | 'zip'
  | 'country'
  | 'card-number'
  | 'card-expiry'
  | 'card-cvv'
  | 'message'
  | 'search'
  | 'quantity'
  | 'date'
  | 'file'
  | 'other'

export interface FormValidation {
  hasClientValidation: boolean
  hasRequiredFields: boolean
  hasPatternValidation: boolean
  hasRealTimeValidation: boolean
}

export interface FormIssue {
  type: 'accessibility' | 'usability' | 'security' | 'performance'
  severity: 'critical' | 'major' | 'minor'
  message: string
  field?: string
}

export interface FormPattern {
  name: string
  description: string
  isPresent: boolean
}

export interface FormStats {
  totalForms: number
  avgFieldCount: number
  hasPasswordField: boolean
  hasPaymentFields: boolean
  formTypes: Record<FormType, number>
}

// ===========================================
// NAVIGATION ANALYSIS
// ===========================================

export interface NavigationAnalysis {
  primary: NavigationStructure | null
  secondary: NavigationStructure[]
  breadcrumbs: BreadcrumbAnalysis | null
  footer: FooterNavigation | null
  patterns: NavigationPattern[]
  stats: NavigationStats
}

export interface NavigationStructure {
  type: 'horizontal' | 'vertical' | 'hamburger' | 'mega-menu'
  items: AnalyzedNavItem[]
  depth: number
  isSticky: boolean
  hasMobileVersion: boolean
}

export interface AnalyzedNavItem {
  text: string
  href?: string
  isActive: boolean
  importance: 'primary' | 'secondary' | 'utility'
  hasSubmenu: boolean
  submenuItems?: AnalyzedNavItem[]
}

export interface BreadcrumbAnalysis {
  levels: number
  items: string[]
  hasStructuredData: boolean
}

export interface FooterNavigation {
  columns: number
  sections: FooterSection[]
  hasSocialLinks: boolean
  hasLegalLinks: boolean
}

export interface FooterSection {
  title: string
  linkCount: number
  type: 'product' | 'company' | 'resources' | 'legal' | 'social' | 'contact'
}

export interface NavigationPattern {
  name: string
  description: string
  isPresent: boolean
}

export interface NavigationStats {
  totalLinks: number
  externalLinks: number
  internalLinks: number
  maxDepth: number
  hasMobileNav: boolean
}

// ===========================================
// USER FLOW ANALYSIS
// ===========================================

export interface UserFlowAnalysis {
  primaryFlow: UserFlow | null
  alternativeFlows: UserFlow[]
  conversionFunnel: ConversionFunnel | null
  entryPoints: EntryPoint[]
  exitPoints: ExitPoint[]
}

export interface UserFlow {
  name: string
  type: FlowType
  steps: FlowStep[]
  estimatedTime: string
  complexity: 'simple' | 'moderate' | 'complex'
  confidence: number
}

export type FlowType =
  | 'signup'
  | 'login'
  | 'purchase'
  | 'onboarding'
  | 'search'
  | 'browse'
  | 'contact'
  | 'subscription'

export interface FlowStep {
  order: number
  action: string
  element: string
  isRequired: boolean
  hasAlternative: boolean
}

export interface ConversionFunnel {
  stages: FunnelStage[]
  dropOffPoints: string[]
  optimizationSuggestions: string[]
}

export interface FunnelStage {
  name: string
  action: string
  ctaText?: string
  position: number
}

export interface EntryPoint {
  type: 'cta' | 'navigation' | 'search' | 'external'
  text: string
  prominence: 'high' | 'medium' | 'low'
}

export interface ExitPoint {
  type: 'external-link' | 'logout' | 'back' | 'close'
  destination?: string
}

// ===========================================
// ACCESSIBILITY ANALYSIS
// ===========================================

export interface AccessibilityAnalysis {
  score: number                    // 0-100
  level: 'A' | 'AA' | 'AAA' | 'fail'
  issues: AccessibilityIssue[]
  passes: string[]
  stats: AccessibilityStats
}

export interface AccessibilityIssue {
  type: string
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  description: string
  wcagCriteria: string
  affectedElements: number
  suggestion: string
}

export interface AccessibilityStats {
  totalIssues: number
  criticalIssues: number
  hasSkipLinks: boolean
  hasLandmarks: boolean
  headingOrder: 'correct' | 'incorrect' | 'missing'
  imagesWithAlt: number
  imagesTotal: number
  focusVisible: boolean
  keyboardNavigable: boolean
}

// ===========================================
// DETECTED PATTERNS
// ===========================================

export interface DetectedPatterns {
  layout: LayoutPattern[]
  interaction: InteractionPattern[]
  content: ContentPattern[]
  engagement: EngagementPattern[]
}

export interface LayoutPattern {
  name: string
  confidence: number
  description: string
}

export interface InteractionPattern {
  name: string
  type: 'hover' | 'click' | 'scroll' | 'drag' | 'gesture'
  elements: string[]
}

export interface ContentPattern {
  name: string
  sections: string[]
  order: number
}

export interface EngagementPattern {
  name: string
  type: 'gamification' | 'social-proof' | 'urgency' | 'scarcity' | 'personalization'
  elements: string[]
}

// ===========================================
// RECOMMENDATIONS
// ===========================================

export interface UXRecommendation {
  category: 'cta' | 'form' | 'navigation' | 'accessibility' | 'performance' | 'engagement'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  effort: 'low' | 'medium' | 'high'
  implementation?: string
}

// ===========================================
// OUTPUT FORMATS
// ===========================================

export interface UXIntelligenceOutput {
  analysis: UXAnalysis
  json: string
  markdown: string
  checklist: string
}
