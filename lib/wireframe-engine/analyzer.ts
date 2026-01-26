// ============================================
// WIREFRAME ENGINE - Visual Structure Analyzer
// ============================================

import { RawSnapshot } from '../types'
import {
  WireframeInput,
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
  WireframeOutput,
  WireframeMeta,
  WireframeRationale,
  UXDecision,
  WireframeAnalysisConfig,
  DEFAULT_WIREFRAME_CONFIG
} from './types'

// ============================================
// MAIN ANALYZER
// ============================================

export async function analyzeWireframe(
  input: WireframeInput,
  config: WireframeAnalysisConfig = DEFAULT_WIREFRAME_CONFIG
): Promise<WireframeOutput> {
  // Validate input
  validateWireframeInput(input)

  // Detect structure
  const blocks = detectBlocks(input.snapshot, config)

  // Build hierarchy
  const hierarchy = buildHierarchy(blocks)

  // Detect layout
  const layout = detectLayout(blocks, input.snapshot)

  // Detect flows
  const flows = detectFlows(blocks, input.snapshot)

  // Generate rationale
  const rationale = generateRationale(blocks, layout, hierarchy, input)

  // Create metadata
  const meta: WireframeMeta = {
    generatedAt: new Date().toISOString(),
    sourceUrl: input.snapshot.url,
    pageType: detectPageType(blocks, layout),
    totalBlocks: blocks.length,
    maxDepth: hierarchy.tree.depth,
    confidence: calculateConfidence(blocks, hierarchy),
    version: '1.0.0'
  }

  return {
    meta,
    structure: layout,
    hierarchy,
    blocks,
    flows,
    rationale
  }
}

// ============================================
// VALIDATION
// ============================================

export function validateWireframeInput(input: WireframeInput): void {
  if (!input.snapshot) {
    throw new Error('WireframeInput requires snapshot')
  }

  if (!input.snapshot.html) {
    throw new Error('Snapshot must contain HTML')
  }

  if (!input.snapshot.url) {
    throw new Error('Snapshot must contain URL')
  }
}

export function getAnalysisSummary(input: WireframeInput): string {
  const { snapshot } = input

  return `
Wireframe Analysis Summary
==========================
URL: ${snapshot.url}
Title: ${snapshot.title || 'Untitled'}
Has Design Data: ${!!input.designTokens}
Has UX Data: ${!!input.uxData}
Text Elements: ${snapshot.text?.length || 0}
UX Events: ${snapshot.ux?.length || 0}
  `.trim()
}

// ============================================
// BLOCK DETECTION
// ============================================

function detectBlocks(
  snapshot: RawSnapshot,
  config: WireframeAnalysisConfig
): VisualBlock[] {
  const blocks: VisualBlock[] = []
  const doc = parseHTML(snapshot.html)

  // Detect semantic landmarks
  const landmarks = detectLandmarks(doc)
  blocks.push(...landmarks)

  // Detect sections
  const sections = detectSections(doc, landmarks)
  blocks.push(...sections)

  // Detect interactive blocks
  if (config.detectFormBlocks) {
    const forms = detectFormBlocks(doc, snapshot)
    blocks.push(...forms)
  }

  if (config.detectNavigationBlocks) {
    const navs = detectNavigationBlocks(doc, snapshot)
    blocks.push(...navs)
  }

  // Detect media blocks
  if (config.detectMediaBlocks) {
    const media = detectMediaBlocks(doc)
    blocks.push(...media)
  }

  // Detect cards/grids
  const cards = detectCardBlocks(doc)
  blocks.push(...cards)

  // Infer empty blocks
  if (config.inferEmptyBlocks) {
    const empty = inferEmptyBlocks(doc, blocks)
    blocks.push(...empty)
  }

  // Sort by position
  return sortBlocksByPosition(blocks)
}

function parseHTML(html: string): Document {
  const parser = new DOMParser()
  return parser.parseFromString(html, 'text/html')
}

function detectLandmarks(doc: Document): VisualBlock[] {
  const landmarks: VisualBlock[] = []

  // Header
  const header = doc.querySelector('header')
  if (header) {
    landmarks.push(createBlockFromElement(header, 'header', 0))
  }

  // Footer
  const footer = doc.querySelector('footer')
  if (footer) {
    landmarks.push(createBlockFromElement(footer, 'footer', 0))
  }

  // Main
  const main = doc.querySelector('main')
  if (main) {
    landmarks.push(createBlockFromElement(main, 'content', 1))
  }

  // Nav
  const navs = doc.querySelectorAll('nav')
  navs.forEach((nav, index) => {
    landmarks.push(createBlockFromElement(nav, 'navigation', 0))
  })

  // Aside (sidebar)
  const asides = doc.querySelectorAll('aside')
  asides.forEach((aside) => {
    landmarks.push(createBlockFromElement(aside, 'sidebar', 1))
  })

  return landmarks
}

function detectSections(
  doc: Document,
  existingBlocks: VisualBlock[]
): VisualBlock[] {
  const sections: VisualBlock[] = []

  // Find section elements not already in landmarks
  const allSections = doc.querySelectorAll('section, article, aside')
  const processedIds = new Set(existingBlocks.map(b => b.id))

  allSections.forEach((section) => {
    const id = section.id || `section-${sections.length}`
    if (!processedIds.has(id)) {
      sections.push(createBlockFromElement(section, 'section', 1))
    }
  })

  // Detect hero sections
  const heroes = detectHeroSections(doc)
  sections.push(...heroes)

  return sections
}

function detectHeroSections(doc: Document): VisualBlock[] {
  const heroes: VisualBlock[] = []

  // Look for hero patterns
  const heroSelectors = [
    '.hero',
    '[class*="hero"]',
    '.banner',
    '[class*="banner"]',
    '.jumbotron',
    'header > div:first-of-type'
  ]

  heroSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector)
    elements.forEach(el => {
      const block = createBlockFromElement(el, 'hero', 1)
      block.metadata.tags.push('hero')
      heroes.push(block)
    })
  })

  return heroes
}

function detectFormBlocks(doc: Document, snapshot: RawSnapshot): VisualBlock[] {
  const forms: VisualBlock[] = []

  // Find all forms
  const formElements = doc.querySelectorAll('form')
  formElements.forEach((form, index) => {
    const block = createBlockFromElement(form, 'form', 2)

    // Extract form fields
    const fields = form.querySelectorAll('input, select, textarea')
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]')

    block.content.hasForm = true
    block.metadata.tags.push('form')
    block.metadata.tags.push(`${fields.length} fields`)

    if (submitButton) {
      block.metadata.tags.push('has-submit')
    }

    forms.push(block)
  })

  return forms
}

function detectNavigationBlocks(doc: Document, snapshot: RawSnapshot): VisualBlock[] {
  const navs: VisualBlock[] = []

  // Look for navigation patterns
  const navSelectors = [
    'nav',
    '.nav',
    '[role="navigation"]',
    '.navbar',
    '[class*="nav"]'
  ]

  navSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector)
    elements.forEach(el => {
      // Skip if already detected as landmark
      if (!navs.find(n => n.id === getElementId(el))) {
        const block = createBlockFromElement(el, 'navigation', 0)
        block.metadata.tags.push('navigation')
        navs.push(block)
      }
    })
  })

  return navs
}

function detectMediaBlocks(doc: Document): VisualBlock[] {
  const media: VisualBlock[] = []

  // Look for galleries, carousels, image grids
  const mediaSelectors = [
    '.gallery',
    '.carousel',
    '.slider',
    '[class*="gallery"]',
    '[class*="carousel"]'
  ]

  mediaSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector)
    elements.forEach(el => {
      const block = createBlockFromElement(el, 'content', 2)
      block.content.hasMedia = true
      block.metadata.tags.push('media')
      media.push(block)
    })
  })

  return media
}

function detectCardBlocks(doc: Document): VisualBlock[] {
  const cards: VisualBlock[] = []

  // Look for card patterns
  const cardSelectors = [
    '.card',
    '[class*="card"]',
    '.grid > div',
    '.flex > div'
  ]

  cardSelectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector)
    elements.forEach(el => {
      const block = createBlockFromElement(el, 'card', 2)
      block.metadata.tags.push('card')
      cards.push(block)
    })
  })

  return cards
}

function inferEmptyBlocks(
  doc: Document,
  existingBlocks: VisualBlock[]
): VisualBlock[] {
  // Look for large whitespace areas or dividers
  const empty: VisualBlock[] = []

  const hrElements = doc.querySelectorAll('hr, .divider, [class*="divider"]')
  hrElements.forEach(el => {
    const block = createBlockFromElement(el, 'divider', 2)
    block.metadata.tags.push('divider')
    empty.push(block)
  })

  return empty
}

function createBlockFromElement(
  element: Element,
  type: BlockType,
  level: number
): VisualBlock {
  const bounds = getElementBounds(element)

  return {
    id: getElementId(element),
    type,
    label: getElementLabel(element, type),
    level,
    position: {
      order: 0, // Will be calculated later
      index: 0  // Will be calculated later
    },
    bounds,
    content: getElementContent(element),
    style: getElementStyle(element),
    children: [],
    metadata: {
      confidence: 0.8,
      source: 'dom',
      tags: []
    }
  }
}

function getElementId(element: Element): string {
  return element.id ||
    element.className?.split(' ')[0] ||
    `block-${Math.random().toString(36).substr(2, 9)}`
}

function getElementLabel(element: Element, type: BlockType): string {
  // Try to get meaningful label
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel

  const title = element.getAttribute('title')
  if (title) return title

  const text = element.textContent?.trim().substring(0, 50)
  if (text) return text

  return type.charAt(0).toUpperCase() + type.slice(1)
}

function getElementBounds(element: Element): VisualBlock['bounds'] {
  // In real implementation, would use actual DOM measurements
  // For now, return placeholders
  return {
    x: 0,
    y: 0,
    width: 100,
    height: 100
  }
}

function getElementContent(element: Element): VisualBlock['content'] {
  const text = element.textContent?.trim() || null
  const elementCount = element.querySelectorAll('*').length
  const hasMedia = element.querySelectorAll('img, video, canvas').length > 0
  const hasForm = element.querySelectorAll('form, input, select, textarea').length > 0
  const hasNavigation = element.querySelectorAll('nav, a').length > 5

  return {
    text,
    elementCount,
    hasMedia,
    hasForm,
    hasNavigation
  }
}

function getElementStyle(element: Element): VisualBlock['style'] {
  const computed = window.getComputedStyle(element as Element)
  const position = (element as Element).getAttribute('data-position')

  return {
    isSticky: computed?.position === 'sticky' || computed?.position === 'fixed',
    isFullWidth: computed?.width === '100%',
    isCentered: computed?.marginLeft === 'auto' && computed?.marginRight === 'auto',
    backgroundColor: computed?.backgroundColor || null,
    hasBackground: computed?.backgroundColor !== 'transparent' &&
                    computed?.backgroundColor !== 'rgba(0, 0, 0, 0)'
  }
}

function sortBlocksByPosition(blocks: VisualBlock[]): VisualBlock[] {
  // Sort by Y position, then X position
  return blocks.sort((a, b) => {
    if (a.bounds.y !== b.bounds.y) {
      return a.bounds.y - b.bounds.y
    }
    return a.bounds.x - b.bounds.x
  }).map((block, index) => ({
    ...block,
    position: {
      ...block.position,
      index
    }
  }))
}

// ============================================
// HIERARCHY BUILDING
// ============================================

function buildHierarchy(blocks: VisualBlock[]): VisualHierarchy {
  // Sort by level
  const byLevel = new Map<number, VisualBlock[]>()
  blocks.forEach(block => {
    if (!byLevel.has(block.level)) {
      byLevel.set(block.level, [])
    }
    byLevel.get(block.level)!.push(block)
  })

  // Create hierarchy levels
  const levels: HierarchyLevel[] = []
  byLevel.forEach((levelBlocks, levelNum) => {
    const dominantRole = getDominantRole(levelBlocks)
    const avgWidth = levelBlocks.reduce((sum, b) => sum + b.bounds.width, 0) / levelBlocks.length
    const avgHeight = levelBlocks.reduce((sum, b) => sum + b.bounds.height, 0) / levelBlocks.length

    levels.push({
      level: levelNum,
      name: getLevelName(levelNum, dominantRole),
      blocks: levelBlocks,
      dominantRole,
      avgBlockSize: {
        width: avgWidth,
        height: avgHeight
      }
    })
  })

  // Build tree
  const tree = buildHierarchyTree(blocks)

  // Calculate flows (will be done separately)
  const flow: VisualFlow[] = []

  return {
    levels: levels.sort((a, b) => a.level - b.level),
    tree,
    flow
  }
}

function getDominantRole(blocks: VisualBlock[]): BlockRole {
  const roleCount = new Map<BlockRole, number>()

  blocks.forEach(block => {
    const role = inferBlockRole(block)
    roleCount.set(role, (roleCount.get(role) || 0) + 1)
  })

  let maxCount = 0
  let dominant: BlockRole = 'content'

  roleCount.forEach((count, role) => {
    if (count > maxCount) {
      maxCount = count
      dominant = role
    }
  })

  return dominant
}

function inferBlockRole(block: VisualBlock): BlockRole {
  switch (block.type) {
    case 'header':
    case 'footer':
    case 'navigation':
      return 'landmark'
    case 'section':
    case 'sidebar':
      return 'container'
    case 'content':
    case 'card':
      return 'content'
    case 'form':
      return 'interactive'
    case 'divider':
      return 'structural'
    default:
      return 'content'
  }
}

function getLevelName(level: number, role: BlockRole): string {
  if (level === 0) return 'Page Layout'
  if (level === 1) return 'Major Sections'
  if (level === 2) return 'Components'
  return `Level ${level}`
}

function buildHierarchyTree(blocks: VisualBlock[]): HierarchyTree {
  // Find root (level 0)
  const roots = blocks.filter(b => b.level === 0)
  const root = roots[0] || {
    ...blocks[0],
    level: 0
  }

  // Calculate tree metrics
  const depths = blocks.map(b => b.level)
  const maxDepth = Math.max(...depths, 0)

  // Calculate branching factor
  const levelCounts = new Map<number, number>()
  blocks.forEach(b => {
    levelCounts.set(b.level, (levelCounts.get(b.level) || 0) + 1)
  })
  const avgBranching = Array.from(levelCounts.values())
    .reduce((sum, count) => sum + count, 0) / levelCounts.size

  // Find longest path
  const longestPath = maxDepth + 1

  return {
    root,
    depth: maxDepth,
    totalBlocks: blocks.length,
    avgBranchingFactor: avgBranching,
    longestPath
  }
}

// ============================================
// LAYOUT DETECTION
// ============================================

function detectLayout(
  blocks: VisualBlock[],
  snapshot: RawSnapshot
): LayoutStructure {
  // Detect column layout
  const sidebars = blocks.filter(b => b.type === 'sidebar')
  const columnCount = sidebars.length + 1

  // Detect layout type
  const layoutType = detectLayoutType(blocks, columnCount)

  // Detect responsive
  const isResponsive = detectResponsive(snapshot)

  return {
    type: layoutType,
    columns: columnCount,
    rows: calculateRows(blocks),
    hasSidebar: sidebars.length > 0,
    sidebarPosition: detectSidebarPosition(sidebars),
    hasStickyHeader: blocks.some(b => b.type === 'header' && b.style.isSticky),
    hasStickyFooter: blocks.some(b => b.type === 'footer' && b.style.isSticky),
    maxContentWidth: detectMaxContentWidth(blocks),
    isResponsive,
    breakpoints: isResponsive ? ['768px', '1024px', '1200px'] : []
  }
}

function detectLayoutType(blocks: VisualBlock[], columnCount: number): LayoutType {
  const hasHeader = blocks.some(b => b.type === 'header')
  const hasFooter = blocks.some(b => b.type === 'footer')
  const hasSidebar = blocks.some(b => b.type === 'sidebar')
  const hasHero = blocks.some(b => b.type === 'hero')

  if (hasHero && !hasSidebar && columnCount === 1) {
    return 'overlay'
  }

  if (columnCount === 1) {
    return 'single-column'
  }

  if (columnCount === 2) {
    return 'two-column'
  }

  if (columnCount === 3) {
    return 'three-column'
  }

  // Check for grid patterns
  const cards = blocks.filter(b => b.type === 'card')
  if (cards.length > 3) {
    return 'grid'
  }

  return 'single-column'
}

function calculateRows(blocks: VisualBlock[]): number {
  // Group by Y position
  const rows = new Set<number>()
  blocks.forEach(b => rows.add(Math.floor(b.bounds.y / 100)))
  return rows.size
}

function detectSidebarPosition(sidebars: VisualBlock[]): 'left' | 'right' | 'both' {
  if (sidebars.length === 0) return 'left'
  if (sidebars.length === 1) {
    return sidebars[0].bounds.x < 400 ? 'left' : 'right'
  }
  return 'both'
}

function detectMaxContentWidth(blocks: VisualBlock[]): number | null {
  const mainContent = blocks.find(b => b.type === 'content')
  if (mainContent) {
    return mainContent.bounds.width
  }
  return null
}

function detectResponsive(snapshot: RawSnapshot): boolean {
  // Check for viewport meta tag
  if (snapshot.html?.includes('viewport')) {
    return true
  }

  // Check for responsive patterns
  const responsivePatterns = [
    'media',
    'responsive',
    'flex',
    'grid'
  ]

  return responsivePatterns.some(pattern =>
    snapshot.html?.toLowerCase().includes(pattern)
  )
}

// ============================================
// FLOW DETECTION
// ============================================

function detectFlows(
  blocks: VisualBlock[],
  snapshot: RawSnapshot
): VisualFlow[] {
  const flows: VisualFlow[] = []

  // Detect navigation flows
  const navBlocks = blocks.filter(b => b.type === 'navigation')
  navBlocks.forEach(nav => {
    flows.push({
      id: `flow-${nav.id}`,
      type: 'navigation',
      from: nav.id,
      to: 'page-navigation',
      label: nav.label,
      trigger: 'click'
    })
  })

  // Detect CTA flows
  const ctaBlocks = blocks.filter(b =>
    b.metadata.tags.some(t => t.includes('cta') || t.includes('button'))
  )
  ctaBlocks.forEach(cta => {
    flows.push({
      id: `flow-${cta.id}`,
      type: 'cta-click',
      from: cta.id,
      to: 'action',
      label: cta.label,
      trigger: 'click'
    })
  })

  // Detect form flows
  const formBlocks = blocks.filter(b => b.type === 'form')
  formBlocks.forEach(form => {
    flows.push({
      id: `flow-${form.id}`,
      type: 'form-submit',
      from: form.id,
      to: 'submit',
      label: form.label,
      trigger: 'submit'
    })
  })

  return flows
}

// ============================================
// PAGE TYPE DETECTION
// ============================================

function detectPageType(blocks: VisualBlock[], layout: LayoutStructure): string {
  const hasHero = blocks.some(b => b.type === 'hero')
  const hasForm = blocks.some(b => b.type === 'form')
  const hasManyCards = blocks.filter(b => b.type === 'card').length > 3

  if (hasHero && !hasForm) {
    return 'landing'
  }

  if (hasForm && layout.type === 'single-column') {
    return 'checkout'
  }

  if (hasManyCards && layout.type === 'grid') {
    return 'listing'
  }

  if (layout.type === 'dashboard') {
    return 'dashboard'
  }

  return 'content'
}

// ============================================
// RATIONALE GENERATION
// ============================================

function generateRationale(
  blocks: VisualBlock[],
  layout: LayoutStructure,
  hierarchy: VisualHierarchy,
  input: WireframeInput
): WireframeRationale {
  const layoutStrategy = generateLayoutStrategy(layout)
  const hierarchyApproach = generateHierarchyApproach(hierarchy)
  const keyPatterns = detectKeyPatterns(blocks, layout)
  const uxDecisions = generateUXDecisions(blocks, layout)
  const recommendations = generateRecommendations(blocks, layout, hierarchy)

  return {
    layoutStrategy,
    hierarchyApproach,
    keyPatterns,
    uxDecisions,
    recommendations
  }
}

function generateLayoutStrategy(layout: LayoutStructure): string {
  const strategies: Record<LayoutType, string> = {
    'single-column': 'Single-column layout for focused content flow',
    'two-column': 'Two-column layout with main content and sidebar',
    'three-column': 'Three-column holy grail layout',
    'grid': 'Grid-based layout for card-based content',
    'masonry': 'Masonry layout for dynamic content arrangement',
    'holy-grail': 'Classic holy grail layout with header, footer, and columns',
    'dashboard': 'Dashboard layout with multiple content regions',
    'split-screen': 'Split-screen layout for equal content weighting',
    'overlay': 'Overlay layout with hero section',
    'unknown': 'Standard content layout'
  }

  return strategies[layout.type] || strategies['single-column']
}

function generateHierarchyApproach(hierarchy: VisualHierarchy): string {
  const depth = hierarchy.tree.depth

  if (depth <= 2) {
    return 'Flat hierarchy for simple navigation'
  }

  if (depth <= 4) {
    return 'Balanced hierarchy with clear information architecture'
  }

  return 'Deep hierarchical structure with multiple organization levels'
}

function detectKeyPatterns(blocks: VisualBlock[], layout: LayoutStructure): string[] {
  const patterns: string[] = []

  if (layout.hasStickyHeader) {
    patterns.push('Sticky header for persistent navigation')
  }

  if (layout.hasStickyFooter) {
    patterns.push('Sticky footer for fixed actions')
  }

  if (blocks.some(b => b.type === 'hero')) {
    patterns.push('Hero section for primary messaging')
  }

  if (blocks.filter(b => b.type === 'card').length > 3) {
    patterns.push('Card-based content organization')
  }

  if (layout.isResponsive) {
    patterns.push('Responsive design with breakpoints')
  }

  return patterns
}

function generateUXDecisions(
  blocks: VisualBlock[],
  layout: LayoutStructure
): UXDecision[] {
  const decisions: UXDecision[] = []

  // Header decision
  const hasHeader = blocks.some(b => b.type === 'header')
  if (hasHeader) {
    decisions.push({
      aspect: 'Navigation',
      decision: 'Sticky header for persistent access',
      reasoning: 'Keeps navigation available as user scrolls',
      alternatives: ['Static header', 'Floating nav button', 'Sidebar nav']
    })
  }

  // Layout decision
  decisions.push({
    aspect: 'Layout',
    decision: `${layout.type} layout`,
    reasoning: getLayoutReasoning(layout),
    alternatives: ['Single column', 'Grid', 'Masonry']
  })

  return decisions
}

function getLayoutReasoning(layout: LayoutStructure): string {
  switch (layout.type) {
    case 'single-column':
      return 'Optimal for focused reading and linear content consumption'
    case 'two-column':
      return 'Balances primary content with supplementary information'
    case 'grid':
      return 'Efficient for browsing multiple items simultaneously'
    default:
      return 'Matches content structure and user needs'
  }
}

function generateRecommendations(
  blocks: VisualBlock[],
  layout: LayoutStructure,
  hierarchy: VisualHierarchy
): string[] {
  const recommendations: string[] = []

  // Mobile recommendations
  if (!layout.isResponsive) {
    recommendations.push('Consider adding responsive breakpoints for mobile devices')
  }

  // Navigation recommendations
  const hasNav = blocks.some(b => b.type === 'navigation')
  if (!hasNav) {
    recommendations.push('Add clear navigation to help users find content')
  }

  // Hierarchy recommendations
  if (hierarchy.tree.depth > 5) {
    recommendations.push('Consider flattening hierarchy to reduce cognitive load')
  }

  return recommendations
}

// ============================================
// CONFIDENCE CALCULATION
// ============================================

function calculateConfidence(
  blocks: VisualBlock[],
  hierarchy: VisualHierarchy
): number {
  let confidence = 0.8

  // Reduce confidence if few blocks
  if (blocks.length < 5) {
    confidence -= 0.2
  }

  // Reduce confidence if shallow hierarchy
  if (hierarchy.tree.depth < 2) {
    confidence -= 0.1
  }

  // Increase confidence if clear landmarks
  const hasLandmarks = blocks.some(b =>
    ['header', 'main', 'footer', 'nav'].includes(b.type)
  )
  if (hasLandmarks) {
    confidence += 0.1
  }

  return Math.max(0, Math.min(1, confidence))
}

// ============================================
// DEFAULT OUTPUT (for testing)
// ============================================

export function getDefaultWireframeOutput(): WireframeOutput {
  return {
    meta: {
      generatedAt: new Date().toISOString(),
      sourceUrl: 'https://example.com',
      pageType: 'content',
      totalBlocks: 0,
      maxDepth: 0,
      confidence: 0.5,
      version: '1.0.0'
    },
    structure: {
      type: 'single-column',
      columns: 1,
      rows: 1,
      hasSidebar: false,
      sidebarPosition: 'left',
      hasStickyHeader: false,
      hasStickyFooter: false,
      maxContentWidth: null,
      isResponsive: true,
      breakpoints: []
    },
    hierarchy: {
      levels: [],
      tree: {
        root: {} as any,
        depth: 0,
        totalBlocks: 0,
        avgBranchingFactor: 0,
        longestPath: 0
      },
      flow: []
    },
    blocks: [],
    flows: [],
    rationale: {
      layoutStrategy: '',
      hierarchyApproach: '',
      keyPatterns: [],
      uxDecisions: [],
      recommendations: []
    }
  }
}
