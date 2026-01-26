// ============================================
// WIREFRAME ENGINE - Type Definitions
// ============================================

import { RawSnapshot } from '../types'

// ============================================
// INPUT TYPES - What we receive from other modes
// ============================================

export interface WireframeInput {
  snapshot: RawSnapshot
  designTokens?: {
    colors?: Record<string, string>
    typography?: Record<string, any>
    spacing?: Record<string, string>
  }
  uxData?: {
    interactions?: any[]
    forms?: any[]
    navigation?: any[]
  }
}

// ============================================
// ANALYSIS TYPES - Structure detection
// ============================================

export interface VisualBlock {
  id: string
  type: BlockType
  label: string
  level: number // Hierarchy depth (0 = root)
  position: {
    order: number // Sibling order
    index: number // Global index
  }
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  content: {
    text: string | null
    elementCount: number
    hasMedia: boolean
    hasForm: boolean
    hasNavigation: boolean
  }
  style: {
    isSticky: boolean
    isFullWidth: boolean
    isCentered: boolean
    backgroundColor: string | null
    hasBackground: boolean
  }
  children: VisualBlock[]
  metadata: {
    confidence: number
    source: 'dom' | 'inferred'
    tags: string[]
  }
}

export type BlockType =
  | 'header'      // Top navigation, logo
  | 'hero'        // Main hero section
  | 'navigation'  // Nav menu, sidebar
  | 'content'     // Main content area
  | 'sidebar'     // Side column
  | 'section'     // Generic section
  | 'card'        // Card component
  | 'list'        // List/grid of items
  | 'form'        // Form container
  | 'footer'      // Footer section
  | 'modal'       // Modal/popup
  | 'divider'     // Separator
  | 'empty'       // Empty/whitespace
  | 'unknown'

export interface LayoutStructure {
  type: LayoutType
  columns: number
  rows: number
  hasSidebar: boolean
  sidebarPosition: 'left' | 'right' | 'both'
  hasStickyHeader: boolean
  hasStickyFooter: boolean
  maxContentWidth: number | null
  isResponsive: boolean
  breakpoints: string[]
}

export type LayoutType =
  | 'single-column'     // Standard vertical layout
  | 'two-column'        // Content + sidebar
  | 'three-column'      // Left + content + right
  | 'grid'             // Grid-based layout
  | 'masonry'          // Masonry/ Pinterest-style
  | 'holy-grail'       // Classic holy grail
  | 'dashboard'        // Dashboard layout
  | 'split-screen'     // Split 50/50
  | 'overlay'          // Overlay/hero style
  | 'unknown'

// ============================================
// HIERARCHY TYPES - Visual organization
// ============================================

export interface VisualHierarchy {
  levels: HierarchyLevel[]
  tree: HierarchyTree
  flow: VisualFlow[]
}

export interface HierarchyLevel {
  level: number
  name: string
  blocks: VisualBlock[]
  dominantRole: BlockRole
  avgBlockSize: {
    width: number
    height: number
  }
}

export type BlockRole =
  | 'landmark'     // Major landmark (header, main, footer)
  | 'container'    // Contains other blocks
  | 'content'      // Contains actual content
  | 'interactive'  // Interactive element
  | 'decorative'   // Decorative only
  | 'structural'   // Structural purpose

export interface HierarchyTree {
  root: VisualBlock
  depth: number
  totalBlocks: number
  avgBranchingFactor: number
  longestPath: number
}

export interface VisualFlow {
  id: string
  type: FlowType
  from: string // Block ID
  to: string   // Block ID
  label: string
  trigger: FlowTrigger
}

export type FlowType =
  | 'navigation'    // Click navigation
  | 'scroll'        // Scroll trigger
  | 'form-submit'   // Form submission
  | 'cta-click'     // CTA button
  | 'modal-open'    // Open modal
  | 'external-link' // External link

export type FlowTrigger =
  | 'click'
  | 'hover'
  | 'scroll'
  | 'submit'
  | 'auto'

// ============================================
// OUTPUT TYPES - Generated artifacts
// ============================================

export interface WireframeOutput {
  meta: WireframeMeta
  structure: LayoutStructure
  hierarchy: VisualHierarchy
  blocks: VisualBlock[]
  flows: VisualFlow[]
  rationale: WireframeRationale
}

export interface WireframeMeta {
  generatedAt: string
  sourceUrl: string
  pageType: string
  totalBlocks: number
  maxDepth: number
  confidence: number
  version: string
}

export interface WireframeRationale {
  layoutStrategy: string
  hierarchyApproach: string
  keyPatterns: string[]
  uxDecisions: UXDecision[]
  recommendations: string[]
}

export interface UXDecision {
  aspect: string
  decision: string
  reasoning: string
  alternatives: string[]
}

// ============================================
// ASCII OUTPUT TYPES
// ============================================

export interface ASCIIWireframe {
  header: string
  layout: string[]
  legend: string[]
  notes: string[]
}

export interface ASCIIOptions {
  width: number
  height: number
  showLabels: boolean
  showIndices: boolean
  detailed: boolean
}

// ============================================
// DESIGNER PROMPT TYPES
// ============================================

export interface DesignerPrompt {
  summary: string
  layout: string
  sections: DesignerSection[]
  components: DesignerComponent[]
  constraints: DesignerConstraint[]
  recommendations: string[]
}

export interface DesignerSection {
  name: string
  purpose: string
  content: string[]
  priority: 'high' | 'medium' | 'low'
}

export interface DesignerComponent {
  name: string
  type: string
  description: string
  state: string
  interactions: string[]
}

export interface DesignerConstraint {
  type: 'layout' | 'content' | 'interaction' | 'accessibility'
  constraint: string
  reason: string
}

// ============================================
// FIGMA JSON TYPES (Optional)
// ============================================

export interface FigmaNode {
  id: string
  name: string
  type: string
  children?: FigmaNode[]
  properties: Record<string, any>
}

export interface FigmaWireframe {
  document: FigmaNode
  components: FigmaComponent[]
  styles: FigmaStyle[]
}

export interface FigmaComponent {
  id: string
  name: string
  description: string
  node: FigmaNode
}

export interface FigmaStyle {
  id: string
  name: string
  type: 'color' | 'text' | 'effect' | 'grid'
  value: any
}

// ============================================
// ANALYSIS CONFIG
// ============================================

export interface WireframeAnalysisConfig {
  minBlockSize: number
  maxDepth: number
  inferEmptyBlocks: boolean
  detectMediaBlocks: boolean
  detectFormBlocks: boolean
  detectNavigationBlocks: boolean
  confidence: 'strict' | 'balanced' | 'permissive'
}

export const DEFAULT_WIREFRAME_CONFIG: WireframeAnalysisConfig = {
  minBlockSize: 50,      // pixels
  maxDepth: 10,
  inferEmptyBlocks: true,
  detectMediaBlocks: true,
  detectFormBlocks: true,
  detectNavigationBlocks: true,
  confidence: 'balanced'
}
