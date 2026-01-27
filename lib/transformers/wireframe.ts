// ============================================
// WIREFRAME TRANSFORMER - HTML → WireframeInput
// ============================================

import type { WireframeInput } from '../wireframe-engine/types'
import type { RawSnapshot } from '../types'

/**
 * Transform snapshot HTML to WireframeInput
 */
export function transformHTMLToWireframeInput(
  html: string,
  url: string,
  uxAnalysis?: any
): WireframeInput {
  // Create a basic RawSnapshot from the HTML
  const snapshot: RawSnapshot = {
    html,
    title: '', // Could extract from title tag
    text: [], // Could extract text content
    ux: [],
    url,
    page_type: 'unknown'
  }

  return {
    snapshot,
    uxData: uxAnalysis || undefined
  }
}

/**
 * Extract basic layout structure from HTML
 */
interface LayoutNode {
  tag: string
  className?: string
  id?: string
  children: LayoutNode[]
  text?: string
  depth: number
}

function extractLayoutStructure(html: string): LayoutNode[] {
  const structure: LayoutNode[] = []
  const stack: Array<{ node: LayoutNode; depth: number }> = []

  // Simple HTML parser - split by tags
  const tagRegex = /<(\/)?([a-z0-9]+)([^>]*)?\/?>/gi
  let match: RegExpExecArray | null
  let depth = 0
  const maxDepth = 10

  while ((match = tagRegex.exec(html)) !== null) {
    const isClosing = match[1] === '/'
    const tag = match[2]
    const attrs = match[3] || ''

    if (isClosing) {
      // Pop from stack
      if (stack.length > 0) {
        const { node, depth: nodeDepth } = stack.pop()!
        if (structure.length === 0 || nodeDepth === 0) {
          structure.push(node)
        } else {
          // Add to parent
          const parent = stack[stack.length - 1]
          if (parent && parent.depth < maxDepth - 1) {
            parent.node.children.push(node)
          }
        }
      }
    } else if (tag !== 'br' && tag !== 'hr' && tag !== 'img') {
      // Opening tag - create node
      const node: LayoutNode = {
        tag,
        className: extractAttr(attrs, 'class'),
        id: extractAttr(attrs, 'id'),
        children: [],
        depth
      }

      // Push to stack
      stack.push({ node, depth })

      // Check depth
      if (depth >= maxDepth) {
        // Too deep, add to structure
        structure.push(node)
      }

      depth++
    }
  }

  return structure
}

/**
 * Extract visual hierarchy from HTML
 */
interface HierarchyNode {
  element: string
  depth: number
  type: string
  visible: boolean
}

function extractHierarchy(html: string): HierarchyNode[] {
  const hierarchy: HierarchyNode[] = []
  const tagRegex = /<([a-z0-9]+)([^>]*)?\/?>/gi
  let match: RegExpExecArray | null
  let depth = 0
  const maxDepth = 10

  // Tags that represent visual hierarchy levels
  const hierarchyTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'section', 'article', 'header', 'footer', 'nav', 'main']

  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[1]
    const attrs = match[2] || ''

    // Skip non-hierarchy tags
    if (!hierarchyTags.includes(tag)) continue

    // Check if element is hidden
    const style = parseInlineStyle(attrs)
    const hidden = style.display === 'none' || style.visibility === 'hidden'

    hierarchy.push({
      element: tag,
      depth,
      type: inferType(tag, attrs),
      visible: !hidden
    })

    depth++
    if (depth >= maxDepth) break
  }

  return hierarchy
}

/**
 * Extract main sections from HTML
 */
interface Section {
  type: string
  tag?: string
  id?: string
  class?: string
  content?: string
}

function extractSections(html: string): Section[] {
  const sections: Section[] = []

  // Define section patterns
  const sectionPatterns = [
    { regex: /<(header|nav|main|footer|section|article|aside)[^>]*>/gi, type: 'layout' },
    { regex: /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, type: 'heading' },
    { regex: /<(button|a)[^>]*class="[^"]*button[^"]*"[^>]*>(.*?)<\/\1>/gi, type: 'cta' }
  ]

  sectionPatterns.forEach(({ regex, type }) => {
    let match: RegExpExecArray | null
    while ((match = regex.exec(html)) !== null) {
      const attrs = match[0] // Full tag with attributes
      const content = match[1] || ''

      sections.push({
        type,
        tag: attrs.match(/<(\w+)/)?.[1] || '',
        id: extractAttr(attrs, 'id'),
        class: extractAttr(attrs, 'class'),
        content: content.slice(0, 50) // Limit content length
      })

      if (sections.length >= 30) break // Limit sections
    }
  })

  return sections
}

/**
 * Infer element type
 */
function inferType(tag: string, attrs: string): string {
  const attrLower = attrs.toLowerCase()

  if (tag.startsWith('h')) {
    return 'heading'
  }

  if (attrLower.includes('button') || attrLower.includes('btn')) {
    return 'button'
  }

  if (tag === 'a') {
    return 'link'
  }

  if (tag === 'img') {
    return 'image'
  }

  if (tag === 'nav') {
    return 'navigation'
  }

  return 'container'
}

/**
 * Parse inline styles
 */
function parseInlineStyle(styleStr: string): Record<string, string> {
  const styles: Record<string, string> = {}

  if (!styleStr) return styles

  styleStr.split(';').forEach(rule => {
    const [property, value] = rule.split(':').map(s => s.trim())
    if (property && value) {
      styles[property] = value
    }
  })

  return styles
}

/**
 * Extract attribute from HTML
 */
function extractAttr(html: string, attr: string): string | undefined {
  const regex = new RegExp(`${attr}=["']([^"']*)["']`, 'i')
  const match = regex.exec(html)
  return match ? match[1] : undefined
}
