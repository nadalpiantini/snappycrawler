import { NormalizedSnapshot, LegalSafeSnapshot, LegalSafeComponent } from './types'

/**
 * Sanitize a normalized snapshot to be legal-safe
 * Removes branding, normalizes copy, and preserves functional structure
 * @param normalized - Normalized snapshot
 * @returns Legal-safe snapshot with sanitized content
 */
export function sanitizeSnapshot(normalized: NormalizedSnapshot): LegalSafeSnapshot {
  return {
    meta: {
      source: normalized.meta.source,
      title: '[SANITIZED]',
      captured_at: normalized.meta.captured_at,
      legal_mode: true
    },
    structure: analyzeStructure(normalized),
    components: sanitizeComponents(normalized.components),
    ux_flows: sanitizeUXFlows(normalized.ux_flows),
    sections: sanitizeSections(normalized.sections)
  }
}

/**
 * Analyze structure to detect features
 */
function analyzeStructure(normalized: NormalizedSnapshot): LegalSafeSnapshot['structure'] {
  return {
    pages_count: 1,
    has_auth: normalized.components.some(c => c.type === 'form' && c.behavior === 'user_input'),
    has_checkout: normalized.components.some(c => c.type === 'form' && c.behavior === 'payment'),
    has_navigation: normalized.components.some(c => c.type === 'nav')
  }
}

/**
 * Sanitize components (normalize field names)
 */
function sanitizeComponents(components: NormalizedSnapshot['components']): LegalSafeComponent[] {
  return components.map(comp => {
    const sanitized: LegalSafeComponent = {
      type: comp.type,
      behavior: comp.behavior === 'user_input' ? 'auth' : comp.behavior,
      fields: []
    }

    if (comp.fields) {
      sanitized.fields = comp.fields.map(f => ({
        name: normalizeFieldName(f.name),
        type: f.type
      }))
    }

    return sanitized
  })
}

/**
 * Normalize field names to generic alternatives
 */
function normalizeFieldName(rawName: string | null): string {
  if (!rawName) return 'field_unknown'

  const lower = rawName.toLowerCase()

  // Field name patterns
  const patterns: Record<string, string[]> = {
    field_email: ['email', 'correo', 'e-mail', 'user_email', 'email_address'],
    field_password: ['password', 'pass', 'clave', 'contraseña', 'user_password', 'pwd'],
    field_name: ['name', 'nombre', 'full_name', 'user_name', 'fullname'],
    field_phone: ['phone', 'teléfono', 'telefono', 'mobile', 'telephone', 'phone_number'],
    field_address: ['address', 'dirección', 'direccion', 'street', 'location']
  }

  for (const [generic, variants] of Object.entries(patterns)) {
    if (variants.some(v => lower.includes(v))) {
      return generic
    }
  }

  return 'field_custom'
}

/**
 * Sanitize UX flows (replace copy)
 */
function sanitizeUXFlows(flows: NormalizedSnapshot['ux_flows']): LegalSafeSnapshot['ux_flows'] {
  return flows.map(flow => ({
    ...flow,
    label: flow.label ? sanitizeCopy(flow.label) : undefined
  }))
}

/**
 * Sanitize sections (remove branding, copyright)
 */
function sanitizeSections(sections: NormalizedSnapshot['sections']): LegalSafeSnapshot['sections'] {
  return sections.map(section => ({
    type: section.type,
    label: sanitizeText(section.label)
  })).filter(section => section.label.length > 0)
}

/**
 * Sanitize copy text (replace with generic alternatives)
 */
function sanitizeCopy(text: string): string {
  const replacements: Record<string, string> = {
    'Sign up': 'Register',
    'Log in': 'Login',
    'Get started': 'Start',
    'Subscribe': 'Join',
    'sign up': 'register',
    'log in': 'login'
  }

  let sanitized = text

  Object.entries(replacements).forEach(([original, generic]) => {
    sanitized = sanitized.replaceAll(original, generic)
  })

  return sanitized
}

/**
 * Sanitize text (remove branding, copyright, domains)
 */
function sanitizeText(text: string): string {
  let sanitized = text

  // Redact patterns
  const redactPatterns = [
    /\b[A-Z][a-z]+\.com\b/g,  // Domain names
    /\©\s*\d{4}\s*/g,          // Copyright
    /by\s+[A-Z][a-z]{3,}/gi,   // "by CompanyName"
    /from\s+[A-Z][a-z]{3,}/gi  // "from CompanyName"
  ]

  redactPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]')
  })

  // Apply copy replacements
  sanitized = sanitizeCopy(sanitized)

  return sanitized.trim()
}

// Re-export types
export type { LegalSafeSnapshot }
