// ============================================
// CTA Detector Module
// ============================================

import type {
  InteractionElement,
  CTAAnalysis,
  CTA,
  CTAType,
  CTAAction,
  CTAStyling,
  CTAStats
} from './types'

// CTA keyword patterns for classification
const CTA_PATTERNS: Record<CTAType, RegExp[]> = {
  'signup': [
    /sign\s*up/i, /create\s*account/i, /register/i, /join/i, /get\s*started/i
  ],
  'login': [
    /log\s*in/i, /sign\s*in/i, /login/i, /signin/i
  ],
  'purchase': [
    /buy\s*now/i, /purchase/i, /add\s*to\s*cart/i, /checkout/i, /order/i, /shop/i
  ],
  'subscribe': [
    /subscribe/i, /membership/i, /upgrade/i, /go\s*premium/i, /pro/i
  ],
  'download': [
    /download/i, /get\s*app/i, /install/i, /get\s*it/i
  ],
  'contact': [
    /contact/i, /get\s*in\s*touch/i, /talk\s*to/i, /speak\s*with/i, /schedule/i, /book/i
  ],
  'learn-more': [
    /learn\s*more/i, /read\s*more/i, /see\s*more/i, /view/i, /explore/i, /discover/i
  ],
  'get-started': [
    /get\s*started/i, /start\s*now/i, /begin/i, /try/i, /launch/i
  ],
  'free-trial': [
    /free\s*trial/i, /try\s*free/i, /start\s*free/i, /free\s*for/i, /no\s*credit/i
  ],
  'demo': [
    /demo/i, /request\s*demo/i, /see\s*demo/i, /live\s*demo/i, /watch/i
  ],
  'newsletter': [
    /newsletter/i, /email\s*updates/i, /stay\s*updated/i, /notify/i
  ],
  'social': [
    /follow/i, /share/i, /tweet/i, /like/i, /connect/i
  ],
  'navigation': [
    /next/i, /previous/i, /back/i, /continue/i, /skip/i
  ],
  'other': []
}

// Urgency keywords
const URGENCY_KEYWORDS = {
  high: [/now/i, /today/i, /limited/i, /hurry/i, /last\s*chance/i, /ending/i, /exclusive/i],
  medium: [/free/i, /save/i, /discount/i, /off/i, /special/i, /bonus/i],
  low: []
}

/**
 * Analyze interactive elements and identify CTAs
 */
export function analyzeCTAs(interactions: InteractionElement[]): CTAAnalysis {
  // Filter to buttons and prominent links
  const candidates = interactions.filter(el =>
    el.type === 'button' ||
    (el.type === 'link' && isProminentLink(el))
  )

  // Score and classify each candidate
  const scored = candidates
    .map(el => scoreCTA(el))
    .filter((cta): cta is CTA => cta !== null)
    .sort((a, b) => b.confidence - a.confidence)

  // Identify primary CTA (highest confidence, above fold preferred)
  const primary = findPrimaryCTA(scored)

  // Categorize remaining CTAs
  const secondary = scored
    .filter(cta => cta !== primary && cta.confidence >= 0.5)
    .slice(0, 5)

  const tertiary = scored
    .filter(cta => cta !== primary && !secondary.includes(cta))
    .slice(0, 10)

  // Calculate stats
  const stats = calculateCTAStats(interactions, scored)

  return {
    primary,
    secondary,
    tertiary,
    stats
  }
}

/**
 * Determine if a link is prominent enough to be a CTA
 */
function isProminentLink(el: InteractionElement): boolean {
  const styles = el.styles

  // Check for button-like styling
  const hasBackground = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
    styles.backgroundColor !== 'transparent'
  const hasBorder = styles.border && !styles.border.includes('none')
  const hasPadding = styles.padding && styles.padding !== '0px'
  const hasLargeText = parseFloat(styles.fontSize) >= 14

  // Links with button styling
  if (hasBackground || (hasBorder && hasPadding)) {
    return true
  }

  // Large text with padding
  if (hasLargeText && hasPadding) {
    return true
  }

  // Check text patterns
  const text = el.text.toLowerCase()
  for (const patterns of Object.values(CTA_PATTERNS)) {
    if (patterns.some(p => p.test(text))) {
      return true
    }
  }

  return false
}

/**
 * Score and classify a CTA candidate
 */
function scoreCTA(el: InteractionElement): CTA | null {
  const text = el.text.trim()

  // Skip empty or very short text
  if (!text || text.length < 2) {
    return null
  }

  // Skip if disabled
  if (el.isDisabled) {
    return null
  }

  // Determine CTA type
  const type = classifyCTAType(text)

  // Determine action
  const action = determineCTAAction(el)

  // Determine urgency
  const urgency = determineUrgency(text)

  // Calculate styling analysis
  const styling = analyzeCTAStyling(el)

  // Determine position
  const position = determinePosition(el)

  // Calculate confidence score
  const confidence = calculateConfidence(el, type, styling, position)

  return {
    text,
    type,
    action,
    urgency,
    confidence,
    position,
    styling,
    element: {
      type: el.type,
      tag: el.tag,
      href: el.href,
      className: el.className,
      position: el.position
    }
  }
}

/**
 * Classify CTA type based on text
 */
function classifyCTAType(text: string): CTAType {
  for (const [type, patterns] of Object.entries(CTA_PATTERNS)) {
    if (patterns.some(p => p.test(text))) {
      return type as CTAType
    }
  }
  return 'other'
}

/**
 * Determine what action the CTA triggers
 */
function determineCTAAction(el: InteractionElement): CTAAction {
  const href = el.href?.toLowerCase() || ''
  const text = el.text.toLowerCase()

  if (el.type === 'button' && !href) {
    if (text.includes('submit') || text.includes('send')) {
      return 'form-submit'
    }
    return 'modal-trigger'
  }

  if (href.startsWith('http') && !href.includes(window?.location?.hostname || '')) {
    return 'external-link'
  }

  if (href.includes('#')) {
    return 'scroll'
  }

  if (href.includes('.pdf') || href.includes('.zip') || href.includes('download')) {
    return 'download'
  }

  if (href) {
    return 'page-navigation'
  }

  return 'unknown'
}

/**
 * Determine urgency level
 */
function determineUrgency(text: string): 'high' | 'medium' | 'low' {
  if (URGENCY_KEYWORDS.high.some(p => p.test(text))) {
    return 'high'
  }
  if (URGENCY_KEYWORDS.medium.some(p => p.test(text))) {
    return 'medium'
  }
  return 'low'
}

/**
 * Analyze CTA styling
 */
function analyzeCTAStyling(el: InteractionElement): CTAStyling {
  const styles = el.styles

  // Determine prominence
  const prominence = determineProminence(styles, el.position)

  // Determine style type
  const style = determineStyleType(styles)

  // Determine size
  const size = determineSize(styles, el.position)

  // Check for icon (approximation based on text length vs width)
  const hasIcon = el.position.width > (el.text.length * 10 + 40)

  // Check for animation (approximation)
  const isAnimated = styles.boxShadow?.includes('transition') || false

  return {
    prominence,
    style,
    size,
    hasIcon,
    isAnimated
  }
}

/**
 * Determine CTA prominence
 */
function determineProminence(
  styles: InteractionElement['styles'],
  position: InteractionElement['position']
): 'high' | 'medium' | 'low' {
  const hasStrongBackground = isStrongColor(styles.backgroundColor)
  const isLarge = position.width > 150 && position.height > 40
  const isAboveFold = position.viewportPosition === 'above-fold'

  if (hasStrongBackground && isLarge && isAboveFold) {
    return 'high'
  }
  if (hasStrongBackground || isLarge) {
    return 'medium'
  }
  return 'low'
}

/**
 * Check if color is strong/saturated
 */
function isStrongColor(color: string): boolean {
  // Parse rgb/rgba
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return false

  const [, r, g, b] = match.map(Number)

  // Check if not white, black, or gray
  const isGray = Math.abs(r - g) < 20 && Math.abs(g - b) < 20
  const isLight = r > 240 && g > 240 && b > 240
  const isDark = r < 20 && g < 20 && b < 20

  return !isGray && !isLight && !isDark
}

/**
 * Determine style type
 */
function determineStyleType(
  styles: InteractionElement['styles']
): 'solid' | 'outline' | 'ghost' | 'link' {
  const hasBackground = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
    styles.backgroundColor !== 'transparent'
  const hasBorder = styles.border && !styles.border.includes('none') &&
    !styles.border.includes('0px')

  if (hasBackground && !hasBorder) {
    return 'solid'
  }
  if (hasBorder && !hasBackground) {
    return 'outline'
  }
  if (!hasBackground && !hasBorder) {
    return 'link'
  }
  return 'ghost'
}

/**
 * Determine CTA size
 */
function determineSize(
  styles: InteractionElement['styles'],
  position: InteractionElement['position']
): 'large' | 'medium' | 'small' {
  const fontSize = parseFloat(styles.fontSize) || 14
  const height = position.height

  if (fontSize >= 18 || height >= 50) {
    return 'large'
  }
  if (fontSize >= 14 || height >= 36) {
    return 'medium'
  }
  return 'small'
}

/**
 * Determine CTA position on page
 */
function determinePosition(
  el: InteractionElement
): 'hero' | 'header' | 'body' | 'footer' | 'sticky' | 'modal' {
  const y = el.position.y
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800

  // Check for sticky positioning (approximation)
  const isSticky = el.position.y < 100 && el.position.viewportPosition === 'above-fold'

  if (isSticky && y < 80) {
    return 'header'
  }

  if (y < viewportHeight * 0.6) {
    return 'hero'
  }

  if (y > viewportHeight * 2) {
    return 'footer'
  }

  return 'body'
}

/**
 * Calculate confidence score for CTA
 */
function calculateConfidence(
  el: InteractionElement,
  type: CTAType,
  styling: CTAStyling,
  position: 'hero' | 'header' | 'body' | 'footer' | 'sticky' | 'modal'
): number {
  let score = 0.3 // Base score

  // Type classification confidence
  if (type !== 'other') {
    score += 0.2
  }

  // Styling factors
  if (styling.prominence === 'high') {
    score += 0.2
  } else if (styling.prominence === 'medium') {
    score += 0.1
  }

  if (styling.style === 'solid') {
    score += 0.1
  }

  if (styling.size === 'large') {
    score += 0.1
  }

  // Position factors
  if (position === 'hero') {
    score += 0.15
  } else if (position === 'header') {
    score += 0.1
  }

  // Visibility
  if (el.isVisible) {
    score += 0.05
  }

  // Above fold bonus
  if (el.position.viewportPosition === 'above-fold') {
    score += 0.1
  }

  return Math.min(1, score)
}

/**
 * Find the primary CTA
 */
function findPrimaryCTA(scored: CTA[]): CTA | null {
  if (scored.length === 0) {
    return null
  }

  // Prefer above-fold hero CTAs with high confidence
  const heroCTAs = scored.filter(
    cta => cta.position === 'hero' && cta.styling.prominence === 'high'
  )

  if (heroCTAs.length > 0) {
    return heroCTAs[0]
  }

  // Prefer signup/purchase CTAs
  const conversionCTAs = scored.filter(
    cta => ['signup', 'purchase', 'free-trial', 'get-started'].includes(cta.type)
  )

  if (conversionCTAs.length > 0) {
    return conversionCTAs[0]
  }

  // Default to highest confidence
  return scored[0]
}

/**
 * Calculate CTA statistics
 */
function calculateCTAStats(
  interactions: InteractionElement[],
  scored: CTA[]
): CTAStats {
  const buttons = interactions.filter(el => el.type === 'button')
  const links = interactions.filter(el => el.type === 'link')

  return {
    totalCount: buttons.length + links.length,
    aboveFold: scored.filter(
      cta => cta.element.position?.viewportPosition === 'above-fold'
    ).length,
    belowFold: scored.filter(
      cta => cta.element.position?.viewportPosition === 'below-fold'
    ).length,
    inHeader: scored.filter(cta => cta.position === 'header').length,
    inFooter: scored.filter(cta => cta.position === 'footer').length,
    primaryCount: scored.filter(cta => cta.styling.prominence === 'high').length,
    secondaryCount: scored.filter(cta => cta.styling.prominence === 'medium').length
  }
}

/**
 * Get default CTA analysis for empty input
 */
export function getDefaultCTAAnalysis(): CTAAnalysis {
  return {
    primary: null,
    secondary: [],
    tertiary: [],
    stats: {
      totalCount: 0,
      aboveFold: 0,
      belowFold: 0,
      inHeader: 0,
      inFooter: 0,
      primaryCount: 0,
      secondaryCount: 0
    }
  }
}
