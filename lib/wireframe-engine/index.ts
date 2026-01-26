// ============================================
// WIREFRAME ENGINE - Public API
// ============================================

// Type exports
export type {
  // Input types
  WireframeInput,

  // Analysis types
  VisualBlock,
  BlockType,
  LayoutStructure,
  LayoutType,
  VisualHierarchy,
  HierarchyLevel,
  HierarchyTree,
  BlockRole,
  VisualFlow,
  FlowType,

  // Output types
  WireframeOutput,
  WireframeMeta,
  WireframeRationale,
  UXDecision,

  // ASCII types
  ASCIIWireframe,
  ASCIIOptions,

  // Designer prompt types
  DesignerPrompt,
  DesignerSection,
  DesignerComponent,
  DesignerConstraint,

  // Figma types
  FigmaNode,
  FigmaWireframe,
  FigmaComponent,
  FigmaStyle,

  // Config
  WireframeAnalysisConfig
} from './types'

// Main analysis function
export {
  analyzeWireframe,
  validateWireframeInput,
  getAnalysisSummary
} from './analyzer'

// Output generators
export {
  generateAllOutputs,
  generateASCIIWireframe,
  generateDesignerPrompt,
  generateFigmaJSON,
  getDefaultASCIIOptions,
  getDefaultDesignerPrompt
} from './generators'

// Constants
export { DEFAULT_WIREFRAME_CONFIG } from './types'

// Default output
export { getDefaultWireframeOutput } from './analyzer'
