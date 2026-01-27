// Raw snapshot structure (from extension)
export interface RawSnapshot {
  url: string
  title: string
  html: string
  text: string[]
  ux: UXEvent[]
  timestamp?: string
  screenshot?: string  // Base64 data URL (jpeg)
  page_type?: string  // Detected page type (homepage, product, checkout, etc.)
  meta?: {
    viewport?: {
      width: number
      height: number
    }
    userAgent?: string
    timestamp?: string
  }
  // Design Forensics: computed styles from strategic elements
  designStyles?: {
    typography: Array<{
      tag: string
      fontFamily: string
      fontSize: string
      fontWeight: string
      lineHeight: string
      letterSpacing?: string
      color: string
      sampleText: string
    }>
    colors: Array<{
      value: string
      source: 'background' | 'text' | 'border' | 'shadow'
      element: string
    }>
    spacing: Array<{
      property: 'padding' | 'margin' | 'gap'
      value: string
    }>
    effects: Array<{
      type: 'border-radius' | 'box-shadow'
      value: string
    }>
  }
  // UX Intelligence: interactive elements and accessibility data
  uxData?: {
    interactions: Array<{
      type: 'button' | 'link' | 'input' | 'select' | 'checkbox' | 'radio' | 'toggle' | 'other'
      tag: string
      text: string
      href?: string | null
      id?: string | null
      className?: string | null
      ariaLabel?: string | null
      role?: string | null
      position: {
        x: number
        y: number
        width: number
        height: number
        viewportPosition: 'above-fold' | 'below-fold'
      }
      styles: {
        backgroundColor: string
        color: string
        fontSize: string
        fontWeight: string
        padding: string
        borderRadius: string
        border: string
        boxShadow?: string
      }
      isVisible: boolean
      isDisabled: boolean
    }>
    forms: Array<{
      id?: string | null
      action?: string | null
      method?: string | null
      fields: Array<{
        type: string
        name?: string | null
        id?: string | null
        label?: string | null
        placeholder?: string | null
        required: boolean
        autocomplete?: string | null
        pattern?: string | null
        minLength?: number | null
        maxLength?: number | null
      }>
      submitButton?: {
        type: string
        tag: string
        text: string
      } | null
      position: {
        x: number
        y: number
        width: number
        height: number
        viewportPosition: 'above-fold' | 'below-fold'
      }
    }>
    navigation: Array<{
      type: 'nav' | 'menu' | 'breadcrumb' | 'pagination' | 'tabs' | 'sidebar'
      items: Array<{
        text: string
        href?: string | null
        isActive: boolean
        hasDropdown: boolean
        children?: Array<{ text: string; href?: string | null }>
      }>
      position: {
        x: number
        y: number
        width: number
        height: number
        viewportPosition: 'above-fold' | 'below-fold'
      }
      isSticky: boolean
    }>
    modals: Array<{
      type: 'modal' | 'dialog' | 'popup' | 'toast' | 'tooltip'
      trigger?: string | null
      hasOverlay: boolean
      hasCloseButton: boolean
      position: 'center' | 'top' | 'bottom' | 'side'
    }>
    media: Array<{
      type: 'image' | 'video' | 'audio' | 'iframe' | 'canvas'
      src?: string | null
      alt?: string | null
      dimensions: { width: number; height: number }
      isLazyLoaded: boolean
    }>
    accessibility: {
      hasSkipLink: boolean
      landmarkRegions: string[]
      headingStructure: Array<{
        level: number
        count: number
        examples: string[]
      }>
      focusableElements: number
      ariaLabelsCount: number
      imagesWithAlt: number
      imagesWithoutAlt: number
      colorContrastIssues: number
    } | null
  }
}

export interface UXEvent {
  type: 'click' | 'submit' | 'scroll' | 'input'
  tag?: string
  text?: string
  id?: string | null
  class?: string | null
  action?: string
  fields?: Field[]
}

export interface Field {
  name: string | null
  type: string | null
}

// Normalized snapshot structure
export interface NormalizedSnapshot {
  meta: {
    source: string
    title: string
    captured_at: string
  }
  sections: Section[]
  components: Component[]
  ux_flows: UXFlow[]
}

export interface Section {
  label: string
  type: string
  source: string
}

export interface Component {
  type: string
  behavior: string
  inferred: boolean
  fields?: Field[]
}

export interface UXFlow {
  step: number
  action: string
  target?: string
  label?: string
  fields?: Field[]
}

// Legal-safe snapshot structure
export interface LegalSafeSnapshot {
  meta: {
    source: string
    title: string
    captured_at: string
    legal_mode: boolean
  }
  structure: {
    pages_count: number
    has_auth: boolean
    has_checkout: boolean
    has_navigation: boolean
  }
  components: LegalSafeComponent[]
  ux_flows: LegalSafeUXFlow[]
  sections: LegalSafeSection[]
}

export interface LegalSafeComponent {
  type: string
  behavior: string
  fields: LegalSafeField[]
}

export interface LegalSafeField {
  name: string
  type: string | null
}

export interface LegalSafeUXFlow {
  step: number
  action: string
  target?: string
  label?: string
}

export interface LegalSafeSection {
  type: string
  label: string
}

// Database types
export interface DatabaseSnapshot {
  id: string
  user_id: string
  url: string
  title: string
  raw_data: RawSnapshot
  created_at: string
}

export interface DatabaseNormalized {
  id: string
  snapshot_id: string
  normalized_data: NormalizedSnapshot
  legal_safe: boolean
  created_at: string
}

export interface DatabaseProject {
  id: string
  user_id: string
  name: string
  description?: string
  created_at: string
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface SnapshotListResponse {
  snapshots: DatabaseSnapshot[]
  total: number
}
