// ============================================
// UX Intelligence - Public API
// ============================================

// Type exports
export type {
  // Captured data types
  CapturedUXData,
  InteractionElement,
  InteractionStyles,
  ElementPosition,
  CapturedForm,
  SubmitButton,
  FormField,
  NavigationElement,
  NavItem,
  ModalElement,
  MediaElement,
  AccessibilityData,
  HeadingLevel,

  // Output types
  UXAnalysis,
  UXAnalysisMeta,
  PageType,
  CTAAnalysis,
  CTA,
  CTAType,
  CTAAction,
  CTAStyling,
  CTAStats,
  FormAnalysis,
  AnalyzedForm,
  FormType,
  AnalyzedField,
  FieldPurpose,
  FormValidation,
  FormIssue,
  FormPattern,
  FormStats,
  NavigationAnalysis,
  NavigationStructure,
  AnalyzedNavItem,
  BreadcrumbAnalysis,
  FooterNavigation,
  FooterSection,
  NavigationPattern,
  NavigationStats,
  UserFlowAnalysis,
  UserFlow,
  FlowType,
  FlowStep,
  ConversionFunnel,
  FunnelStage,
  EntryPoint,
  ExitPoint,
  AccessibilityAnalysis,
  AccessibilityIssue,
  AccessibilityStats,
  DetectedPatterns,
  LayoutPattern,
  InteractionPattern,
  ContentPattern,
  EngagementPattern,
  UXRecommendation,
  UXIntelligenceOutput
} from './types'

// Main analysis function
export {
  analyzeUX,
  validateCapturedData,
  getCaptureSummary,
  getDefaultUXAnalysis
} from './analyzer'

// Individual analyzers (for advanced usage)
export { analyzeCTAs, getDefaultCTAAnalysis } from './cta-detector'
export { analyzeForms, getDefaultFormAnalysis } from './form-analyzer'
export {
  detectUserFlows,
  analyzeNavigation,
  detectPageType,
  getDefaultUserFlowAnalysis,
  getDefaultNavigationAnalysis
} from './flow-detector'

// Output generators
export {
  generateAllOutputs,
  generateUXJSON,
  generateUXMarkdown,
  generateUXChecklist,
  generateUXSummary
} from './generators'
