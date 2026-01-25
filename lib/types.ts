// Raw snapshot structure (from extension)
export interface RawSnapshot {
  url: string
  title: string
  html: string
  text: string[]
  ux: UXEvent[]
  timestamp?: string
  screenshot?: string  // Base64 data URL (jpeg)
  meta?: {
    viewport?: {
      width: number
      height: number
    }
    userAgent?: string
    timestamp?: string
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
