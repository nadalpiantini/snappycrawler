// ============================================
// WIREFRAME ENGINE - Output Generators
// ============================================

import {
  WireframeOutput,
  ASCIIWireframe,
  ASCIIOptions,
  DesignerPrompt,
  DesignerSection,
  DesignerComponent,
  DesignerConstraint,
  FigmaWireframe,
  FigmaNode,
  FigmaComponent,
  FigmaStyle
} from './types'

// ============================================
// MAIN GENERATOR EXPORT
// ============================================

export async function generateAllOutputs(
  wireframe: WireframeOutput
): Promise<{
  ascii: ASCIIWireframe
  designerPrompt: DesignerPrompt
  figma?: FigmaWireframe
}> {
  return {
    ascii: generateASCIIWireframe(wireframe),
    designerPrompt: generateDesignerPrompt(wireframe),
    figma: generateFigmaJSON(wireframe)
  }
}

// ============================================
// ASCII WIREFRAME GENERATOR
// ============================================

export function generateASCIIWireframe(
  wireframe: WireframeOutput,
  options: Partial<ASCIIOptions> = {}
): ASCIIWireframe {
  const opts: ASCIIOptions = {
    width: 80,
    height: 40,
    showLabels: true,
    showIndices: false,
    detailed: true,
    ...options
  }

  const header = generateASCIIHeader(wireframe)
  const layout = generateASCIILayout(wireframe, opts)
  const legend = generateASCIILegend(wireframe)
  const notes = generateASCIINotes(wireframe)

  return {
    header,
    layout,
    legend,
    notes
  }
}

function generateASCIIHeader(wireframe: WireframeOutput): string {
  return `
╔══════════════════════════════════════════════════════════════════╗
║                    WIREFRAME - SNAPPY PLATFORM                  ║
╠══════════════════════════════════════════════════════════════════╣
║  URL: ${wireframe.meta.sourceUrl.substring(0, 60).padEnd(60)}║
║  Type: ${wireframe.meta.pageType.padEnd(61)}║
║  Blocks: ${String(wireframe.meta.totalBlocks).padEnd(58)}║
║  Layout: ${wireframe.structure.type.padEnd(59)}║
╚══════════════════════════════════════════════════════════════════╝
  `.trim()
}

function generateASCIILayout(
  wireframe: WireframeOutput,
  options: ASCIIOptions
): string[] {
  const layout: string[] = []
  const { blocks, structure } = wireframe

  // Generate layout based on structure type
  switch (structure.type) {
    case 'single-column':
      layout.push(...generateSingleColumnLayout(blocks, options))
      break

    case 'two-column':
      layout.push(...generateTwoColumnLayout(blocks, structure, options))
      break

    case 'grid':
      layout.push(...generateGridLayout(blocks, options))
      break

    default:
      layout.push(...generateSingleColumnLayout(blocks, options))
  }

  return layout
}

function generateSingleColumnLayout(
  blocks: any[],
  options: ASCIIOptions
): string[] {
  const lines: string[] = []
  const width = options.width

  // Header
  lines.push('┌' + '─'.repeat(width - 2) + '┐')
  const header = blocks.find((b: any) => b.type === 'header')
  if (header && options.showLabels) {
    const label = ` ${header.label} `
    lines.push(
      '│' +
      label.padStart(Math.floor(width / 2) + Math.floor(label.length / 2)) +
      ' '.repeat(width - 2 - Math.floor(width / 2) - Math.floor(label.length / 2)) +
      '│'
    )
  }
  lines.push('├' + '─'.repeat(width - 2) + '┤')

  // Hero section
  const hero = blocks.find((b: any) => b.type === 'hero')
  if (hero) {
    lines.push('│' + ' '.repeat(width - 2) + '│')
    if (options.showLabels) {
      const label = hero.label.substring(0, width - 4)
      lines.push('│ ' + label.padEnd(width - 4) + ' │')
    }
    lines.push('│' + ' '.repeat(width - 2) + '│')
    lines.push('│' + '     [CTA]'.padEnd(width - 1) + '│')
    lines.push('│' + ' '.repeat(width - 2) + '│')
    lines.push('├' + '─'.repeat(width - 2) + '┤')
  }

  // Content sections
  const sections = blocks.filter((b: any) => b.type === 'section' || b.type === 'content')
  sections.slice(0, 5).forEach((section: any) => {
    lines.push('│' + ' '.repeat(width - 2) + '│')
    if (options.showLabels) {
      const label = section.label.substring(0, width - 4)
      lines.push('│ ' + label.padEnd(width - 4) + ' │')
    }
    lines.push('│' + ' '.repeat(width - 2) + '│')
    lines.push('├' + '─'.repeat(width - 2) + '┤')
  })

  // Footer
  lines.push('│' + ' '.repeat(width - 2) + '│')
  const footer = blocks.find((b: any) => b.type === 'footer')
  if (footer && options.showLabels) {
    const label = footer.label.substring(0, width - 4)
    lines.push('│ ' + label.padEnd(width - 4) + ' │')
  }
  lines.push('└' + '─'.repeat(width - 2) + '┘')

  return lines
}

function generateTwoColumnLayout(
  blocks: any[],
  structure: any,
  options: ASCIIOptions
): string[] {
  const lines: string[] = []
  const width = options.width
  const sidebarWidth = 20
  const contentWidth = width - sidebarWidth - 3

  // Header
  lines.push('┌' + '─'.repeat(width - 2) + '┐')
  const header = blocks.find((b: any) => b.type === 'header')
  if (header && options.showLabels) {
    lines.push('│ ' + header.label.padEnd(width - 4) + ' │')
  }
  lines.push('└' + '─'.repeat(width - 2) + '┘')

  // Hero
  const hero = blocks.find((b: any) => b.type === 'hero')
  if (hero) {
    lines.push('┌' + '─'.repeat(width - 2) + '┐')
    lines.push('│' + ' '.repeat(width - 2) + '│')
    lines.push('│  ' + hero.label.padEnd(width - 6) + '  │')
    lines.push('│' + ' '.repeat(width - 2) + '│')
    lines.push('└' + '─'.repeat(width - 2) + '┘')
  }

  // Two column section
  const sidebar = blocks.find((b: any) => b.type === 'sidebar')
  const content = blocks.filter((b: any) => b.type === 'section' || b.type === 'content')

  lines.push('┌' + '─'.repeat(sidebarWidth) + '┬' + '─'.repeat(contentWidth) + '┐')

  if (sidebar && options.showLabels) {
    lines.push(
      '│ ' +
      sidebar.label.substring(0, sidebarWidth - 2).padEnd(sidebarWidth - 2) +
      ' │ ' +
      'Content Area'.padEnd(contentWidth - 2) +
      ' │'
    )
  }

  lines.push('│' + ' '.repeat(sidebarWidth) + '│' + ' '.repeat(contentWidth) + '│')

  content.slice(0, 3).forEach((section: any) => {
    lines.push('│' + ' '.repeat(sidebarWidth) + '│' + ' '.repeat(contentWidth) + '│')
    if (options.showLabels) {
      lines.push(
        '│' +
        ' '.repeat(sidebarWidth) +
        '│ ' +
        section.label.substring(0, contentWidth - 4).padEnd(contentWidth - 4) +
        ' │'
      )
    }
    lines.push('│' + ' '.repeat(sidebarWidth) + '│' + ' '.repeat(contentWidth) + '│')
    lines.push('├' + '─'.repeat(sidebarWidth) + '┼' + '─'.repeat(contentWidth) + '┤')
  })

  lines.push('└' + '─'.repeat(sidebarWidth) + '┴' + '─'.repeat(contentWidth) + '┘')

  // Footer
  lines.push('┌' + '─'.repeat(width - 2) + '┐')
  const footer = blocks.find((b: any) => b.type === 'footer')
  if (footer && options.showLabels) {
    lines.push('│ ' + footer.label.substring(0, width - 4).padEnd(width - 4) + ' │')
  }
  lines.push('└' + '─'.repeat(width - 2) + '┘')

  return lines
}

function generateGridLayout(
  blocks: any[],
  options: ASCIIOptions
): string[] {
  const lines: string[] = []
  const width = options.width
  const cols = 3
  const colWidth = Math.floor((width - 2 - (cols - 1)) / cols)

  // Header
  lines.push('┌' + '─'.repeat(width - 2) + '┐')
  const header = blocks.find((b: any) => b.type === 'header')
  if (header && options.showLabels) {
    lines.push('│ ' + header.label.padEnd(width - 4) + ' │')
  }
  lines.push('└' + '─'.repeat(width - 2) + '┘')

  // Grid separator
  const gridLine = '┌' + Array(cols).fill('─'.repeat(colWidth)).join('┬') + '┐'

  // Cards grid
  const cards = blocks.filter((b: any) => b.type === 'card')
  const rows = Math.ceil(cards.length / cols)

  for (let row = 0; row < Math.min(rows, 4); row++) {
    lines.push(gridLine)

    for (let col = 0; col < cols; col++) {
      const cardIndex = row * cols + col
      const card = cards[cardIndex]

      if (card && options.showLabels) {
        const label = card.label.substring(0, colWidth - 2)
        lines.push(
          '│ ' +
          label.padEnd(colWidth - 2) +
          (col < cols - 1 ? '' : ' │')
        )
      } else {
        lines.push(
          '│' +
          ' '.repeat(colWidth) +
          (col < cols - 1 ? '' : ' │')
        )
      }
    }

    lines.push(
      '│' +
      Array(cols).fill(' '.repeat(colWidth)).join('│') +
      '│'
    )
    lines.push('└' + Array(cols).fill('─'.repeat(colWidth)).join('┴') + '┘')
  }

  // Footer
  const footer = blocks.find((b: any) => b.type === 'footer')
  if (footer) {
    lines.push('┌' + '─'.repeat(width - 2) + '┐')
    lines.push('│ ' + footer.label.substring(0, width - 4).padEnd(width - 4) + ' │')
    lines.push('└' + '─'.repeat(width - 2) + '┘')
  }

  return lines
}

function generateASCIILegend(wireframe: WireframeOutput): string[] {
  const legend: string[] = []

  legend.push('')
  legend.push('LEGEND:')
  legend.push('───────')

  const blockTypes = new Set(wireframe.blocks.map(b => b.type))
  blockTypes.forEach(type => {
    const count = wireframe.blocks.filter(b => b.type === type).length
    legend.push(`  ${type.padEnd(15)} ${count} block(s)`)
  })

  return legend
}

function generateASCIINotes(wireframe: WireframeOutput): string[] {
  const notes: string[] = []

  notes.push('')
  notes.push('NOTES:')
  notes.push('──────')

  if (wireframe.rationale.keyPatterns.length > 0) {
    notes.push('')
    notes.push('Key Patterns:')
    wireframe.rationale.keyPatterns.forEach(pattern => {
      notes.push(`  • ${pattern}`)
    })
  }

  if (wireframe.rationale.recommendations.length > 0) {
    notes.push('')
    notes.push('Recommendations:')
    wireframe.rationale.recommendations.forEach(rec => {
      notes.push(`  • ${rec}`)
    })
  }

  return notes
}

// ============================================
// DESIGNER PROMPT GENERATOR
// ============================================

export function generateDesignerPrompt(
  wireframe: WireframeOutput
): DesignerPrompt {
  const sections = generateDesignerSections(wireframe)
  const components = generateDesignerComponents(wireframe)
  const constraints = generateDesignerConstraints(wireframe)
  const recommendations = generateDesignerRecommendations(wireframe)

  return {
    summary: generateDesignerSummary(wireframe),
    layout: generateDesignerLayout(wireframe),
    sections,
    components,
    constraints,
    recommendations
  }
}

function generateDesignerSummary(wireframe: WireframeOutput): string {
  const { meta, structure, rationale } = wireframe

  return `
Design a ${meta.pageType} page for ${meta.sourceUrl}

Layout Strategy: ${rationale.layoutStrategy}
Hierarchy Approach: ${rationale.hierarchyApproach}

The page has ${meta.totalBlocks} main blocks organized in a ${structure.type} layout.
Key patterns: ${rationale.keyPatterns.join(', ')}.
  `.trim()
}

function generateDesignerLayout(wireframe: WireframeOutput): string {
  const { structure, blocks } = wireframe

  const parts: string[] = []

  parts.push(`**Layout Type:** ${structure.type}`)
  parts.push(`**Columns:** ${structure.columns}`)
  parts.push(`**Sidebar:** ${structure.hasSidebar ? `Yes (${structure.sidebarPosition})` : 'No'}`)
  parts.push(`**Sticky Elements:** ${structure.hasStickyHeader ? 'Header ' : ''}${structure.hasStickyFooter ? 'Footer' : ''}`)

  if (structure.maxContentWidth) {
    parts.push(`**Max Content Width:** ${structure.maxContentWidth}px`)
  }

  if (structure.isResponsive) {
    parts.push(`**Responsive:** Yes (${structure.breakpoints.join(', ')})`)
  }

  return parts.join('\n')
}

function generateDesignerSections(wireframe: WireframeOutput): DesignerSection[] {
  const sections: DesignerSection[] = []

  // Group blocks by type
  const blockGroups = new Map<string, any[]>()
  wireframe.blocks.forEach(block => {
    if (!blockGroups.has(block.type)) {
      blockGroups.set(block.type, [])
    }
    blockGroups.get(block.type)!.push(block)
  })

  // Generate section for each block type
  blockGroups.forEach((blocks, type) => {
    const priority = getSectionPriority(type)
    const section: DesignerSection = {
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      purpose: getSectionPurpose(type),
      content: blocks.slice(0, 3).map(b => b.label || 'Unnamed block'),
      priority
    }

    sections.push(section)
  })

  return sections.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })
}

function getSectionPriority(type: string): 'high' | 'medium' | 'low' {
  const high = ['header', 'hero', 'navigation']
  const medium = ['content', 'section', 'form']

  if (high.includes(type)) return 'high'
  if (medium.includes(type)) return 'medium'
  return 'low'
}

function getSectionPurpose(type: string): string {
  const purposes: Record<string, string> = {
    header: 'Site branding and primary navigation',
    hero: 'Primary call-to-action and value proposition',
    navigation: 'User navigation and wayfinding',
    content: 'Main content area',
    section: 'Thematic content grouping',
    card: 'Individual content unit',
    form: 'User input and data collection',
    sidebar: 'Supplementary content and navigation',
    footer: 'Site information and secondary links'
  }

  return purposes[type] || 'Content container'
}

function generateDesignerComponents(wireframe: WireframeOutput): DesignerComponent[] {
  const components: DesignerComponent[] = []

  // Detect interactive components
  wireframe.blocks.forEach(block => {
    if (block.content.hasForm) {
      components.push({
        name: `${block.label} Form`,
        type: 'form',
        description: `${block.content.elementCount} elements`,
        state: 'editable',
        interactions: ['submit', 'validate']
      })
    }

    if (block.metadata.tags.some(t => t.includes('button') || t.includes('cta'))) {
      components.push({
        name: block.label,
        type: 'button',
        description: 'Call-to-action',
        state: 'interactive',
        interactions: ['click', 'hover']
      })
    }
  })

  return components
}

function generateDesignerConstraints(wireframe: WireframeOutput): DesignerConstraint[] {
  const constraints: DesignerConstraint[] = []

  // Layout constraints
  const { structure } = wireframe

  if (structure.columns > 1) {
    constraints.push({
      type: 'layout',
      constraint: `Must maintain ${structure.columns}-column structure`,
      reason: 'Preserves information hierarchy'
    })
  }

  if (structure.hasStickyHeader) {
    constraints.push({
      type: 'layout',
      constraint: 'Header must remain sticky on scroll',
      reason: 'Maintains navigation access'
    })
  }

  // Responsive constraints
  if (structure.isResponsive) {
    constraints.push({
      type: 'layout',
      constraint: `Must support breakpoints: ${structure.breakpoints.join(', ')}`,
      reason: 'Cross-device compatibility'
    })
  }

  // Content constraints
  const hasHero = wireframe.blocks.some(b => b.type === 'hero')
  if (hasHero) {
    constraints.push({
      type: 'content',
      constraint: 'Hero section must be above the fold',
      reason: 'Primary messaging visibility'
    })
  }

  // Accessibility constraints
  constraints.push({
    type: 'accessibility',
    constraint: 'All interactive elements must be keyboard accessible',
    reason: 'WCAG 2.1 compliance'
  })

  constraints.push({
    type: 'accessibility',
    constraint: 'All images must have alt text',
    reason: 'Screen reader compatibility'
  })

  return constraints
}

function generateDesignerRecommendations(wireframe: WireframeOutput): string[] {
  const recommendations: string[] = []

  // Add rationale recommendations
  recommendations.push(...wireframe.rationale.recommendations)

  // Add layout-specific recommendations
  const { structure } = wireframe

  if (!structure.isResponsive) {
    recommendations.push('Consider implementing responsive design for mobile devices')
  }

  if (structure.type === 'single-column' && wireframe.blocks.length > 10) {
    recommendations.push('Consider grouping related content into sections to improve scannability')
  }

  // Add hierarchy recommendations
  if (wireframe.hierarchy.tree.depth > 5) {
    recommendations.push('Consider flattening content hierarchy to reduce cognitive load')
  }

  return recommendations
}

// ============================================
// FIGMA JSON GENERATOR (Optional)
// ============================================

export function generateFigmaJSON(
  wireframe: WireframeOutput
): FigmaWireframe | undefined {
  // Only generate if explicitly requested
  // This is a simplified version - real Figma JSON would be much more complex

  const document = createFigmaDocument(wireframe)
  const components = createFigmaComponents(wireframe)
  const styles = createFigmaStyles(wireframe)

  return {
    document,
    components,
    styles
  }
}

function createFigmaDocument(wireframe: WireframeOutput): FigmaNode {
  return {
    id: 'wireframe-root',
    name: wireframe.meta.pageType,
    type: 'DOCUMENT',
    properties: {
      version: wireframe.meta.version,
      generatedAt: wireframe.meta.generatedAt
    },
    children: wireframe.blocks.map(block => ({
      id: block.id,
      name: block.label,
      type: 'FRAME',
      properties: {
        bounds: block.bounds,
        type: block.type,
        level: block.level
      }
    }))
  }
}

function createFigmaComponents(wireframe: WireframeOutput): FigmaComponent[] {
  const components: FigmaComponent[] = []

  wireframe.blocks.forEach(block => {
    if (['card', 'form', 'button'].includes(block.type)) {
      components.push({
        id: `comp-${block.id}`,
        name: `${block.type} component`,
        description: block.label,
        node: {
          id: block.id,
          name: block.label,
          type: block.type.toUpperCase(),
          properties: {
            bounds: block.bounds
          }
        }
      })
    }
  })

  return components
}

function createFigmaStyles(wireframe: WireframeOutput): FigmaStyle[] {
  const styles: FigmaStyle[] = []

  // Would extract actual styles from design tokens if available
  // For now, return empty array

  return styles
}

// ============================================
// UTILITIES
// ============================================

export function getDefaultASCIIOptions(): ASCIIOptions {
  return {
    width: 80,
    height: 40,
    showLabels: true,
    showIndices: false,
    detailed: true
  }
}

export function getDefaultDesignerPrompt(): DesignerPrompt {
  return {
    summary: '',
    layout: '',
    sections: [],
    components: [],
    constraints: [],
    recommendations: []
  }
}
