import { RawSnapshot, NormalizedSnapshot } from './types'

/**
 * Normalize a raw snapshot into structured format
 * @param rawSnapshot - Raw snapshot data from extension
 * @returns Normalized snapshot with sections, components, and UX flows
 */
export function normalizeSnapshot(rawSnapshot: RawSnapshot): NormalizedSnapshot {
  const sections = extractSections(rawSnapshot.text)
  const components = inferComponents(rawSnapshot.html)
  const uxFlows = extractUXFlows(rawSnapshot.ux)

  return {
    meta: {
      source: rawSnapshot.url,
      title: rawSnapshot.title,
      captured_at: rawSnapshot.timestamp || rawSnapshot.meta?.timestamp || new Date().toISOString()
    },
    sections,
    components,
    ux_flows: uxFlows
  }
}

/**
 * Extract sections from visible text
 */
function extractSections(texts: string[]): NormalizedSnapshot['sections'] {
  // Filter texts by length (20-120 chars) and deduplicate
  const validTexts = texts.filter(text => text.length >= 20 && text.length <= 120)
  const uniqueTexts = Array.from(new Set(validTexts))

  return uniqueTexts.map(text => ({
    label: text.slice(0, 60), // Truncate to 60 chars
    type: 'content',
    source: 'visible-text'
  }))
}

/**
 * Infer components from HTML structure
 */
function inferComponents(html: string): NormalizedSnapshot['components'] {
  const components: NormalizedSnapshot['components'] = []

  // Detect forms
  if (html.includes('<form')) {
    components.push({
      type: 'form',
      behavior: 'user_input',
      inferred: true
    })
  }

  // Detect buttons
  if (html.includes('<button') || html.includes('<input type="submit"')) {
    components.push({
      type: 'button',
      behavior: 'cta',
      inferred: true
    })
  }

  // Detect navigation
  if (html.includes('<nav') || html.includes('navigation')) {
    components.push({
      type: 'nav',
      behavior: 'navigation',
      inferred: true
    })
  }

  return components
}

/**
 * Extract UX flows from events
 */
function extractUXFlows(events: RawSnapshot['ux']): NormalizedSnapshot['ux_flows'] {
  return events.map((event, index) => {
    const flow: NormalizedSnapshot['ux_flows'][0] = {
      step: index + 1,
      action: event.type
    }

    if (event.type === 'click' && event.tag) {
      flow.target = event.tag
      flow.label = event.text || undefined
    }

    if (event.type === 'submit') {
      flow.fields = event.fields || []
    }

    return flow
  })
}

// Re-export types for convenience
export type { NormalizedSnapshot, RawSnapshot }
