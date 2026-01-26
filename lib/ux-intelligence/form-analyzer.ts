// ============================================
// Form Analyzer Module
// ============================================

import type {
  CapturedForm,
  FormField,
  FormAnalysis,
  AnalyzedForm,
  FormType,
  AnalyzedField,
  FieldPurpose,
  FormValidation,
  FormIssue,
  FormPattern,
  FormStats
} from './types'

// Field patterns for classification
const FIELD_PATTERNS: Record<FieldPurpose, RegExp[]> = {
  'email': [/email/i, /e-mail/i, /correo/i],
  'password': [/password/i, /pwd/i, /pass/i, /contraseña/i],
  'name': [/name/i, /nombre/i, /full.?name/i, /first.?name/i, /last.?name/i],
  'phone': [/phone/i, /tel/i, /mobile/i, /cell/i, /teléfono/i],
  'address': [/address/i, /street/i, /dirección/i, /addr/i],
  'city': [/city/i, /ciudad/i, /town/i],
  'zip': [/zip/i, /postal/i, /código/i, /postcode/i],
  'country': [/country/i, /país/i, /nation/i],
  'card-number': [/card.?number/i, /cc.?num/i, /credit/i, /tarjeta/i],
  'card-expiry': [/expir/i, /valid/i, /fecha/i, /mm.?yy/i],
  'card-cvv': [/cvv/i, /cvc/i, /security.?code/i, /código/i],
  'message': [/message/i, /comment/i, /mensaje/i, /textarea/i, /description/i],
  'search': [/search/i, /query/i, /buscar/i, /find/i],
  'quantity': [/quantity/i, /qty/i, /amount/i, /cantidad/i],
  'date': [/date/i, /birthday/i, /dob/i, /fecha/i],
  'file': [/file/i, /upload/i, /attach/i, /archivo/i],
  'other': []
}

// Form type detection patterns
const FORM_TYPE_PATTERNS: Record<FormType, { fields: FieldPurpose[], minMatch: number }> = {
  'login': { fields: ['email', 'password'], minMatch: 2 },
  'signup': { fields: ['email', 'password', 'name'], minMatch: 2 },
  'contact': { fields: ['email', 'name', 'message'], minMatch: 2 },
  'newsletter': { fields: ['email'], minMatch: 1 },
  'search': { fields: ['search'], minMatch: 1 },
  'checkout': { fields: ['email', 'address', 'city', 'zip'], minMatch: 3 },
  'payment': { fields: ['card-number', 'card-expiry', 'card-cvv'], minMatch: 2 },
  'profile': { fields: ['name', 'email', 'phone'], minMatch: 2 },
  'feedback': { fields: ['message'], minMatch: 1 },
  'survey': { fields: ['other'], minMatch: 0 },
  'filter': { fields: ['other'], minMatch: 0 },
  'settings': { fields: ['other'], minMatch: 0 },
  'other': { fields: [], minMatch: 0 }
}

/**
 * Analyze captured forms
 */
export function analyzeForms(forms: CapturedForm[]): FormAnalysis {
  if (!forms || forms.length === 0) {
    return getDefaultFormAnalysis()
  }

  const analyzedForms = forms.map(form => analyzeForm(form))
  const patterns = detectFormPatterns(analyzedForms)
  const stats = calculateFormStats(analyzedForms)

  return {
    forms: analyzedForms,
    patterns,
    stats
  }
}

/**
 * Analyze a single form
 */
function analyzeForm(form: CapturedForm): AnalyzedForm {
  const analyzedFields = form.fields.map((field, index) => analyzeField(field, index))
  const type = detectFormType(analyzedFields)
  const validation = analyzeValidation(form, analyzedFields)
  const issues = detectFormIssues(form, analyzedFields)
  const uxScore = calculateUXScore(form, analyzedFields, issues)
  const confidence = calculateFormConfidence(type, analyzedFields)

  return {
    type,
    confidence,
    fields: analyzedFields,
    validation,
    uxScore,
    issues,
    position: form.position
  }
}

/**
 * Analyze a single field
 */
function analyzeField(field: FormField, position: number): AnalyzedField {
  const purpose = detectFieldPurpose(field)
  const hasValidation = !!(field.pattern || field.minLength || field.maxLength)

  return {
    type: field.type,
    purpose,
    label: field.label,
    isRequired: field.required,
    hasValidation,
    validationType: field.pattern ? 'pattern' : (field.type === 'email' ? 'email' : undefined),
    position
  }
}

/**
 * Detect field purpose from name, id, label, placeholder
 */
function detectFieldPurpose(field: FormField): FieldPurpose {
  const searchText = [
    field.name,
    field.id,
    field.label,
    field.placeholder,
    field.autocomplete
  ].filter(Boolean).join(' ').toLowerCase()

  // Check input type first
  if (field.type === 'email') return 'email'
  if (field.type === 'password') return 'password'
  if (field.type === 'tel') return 'phone'
  if (field.type === 'search') return 'search'
  if (field.type === 'file') return 'file'
  if (field.type === 'date') return 'date'
  if (field.type === 'number' && /qty|quantity|amount/i.test(searchText)) return 'quantity'

  // Check patterns
  for (const [purpose, patterns] of Object.entries(FIELD_PATTERNS)) {
    if (patterns.some(p => p.test(searchText))) {
      return purpose as FieldPurpose
    }
  }

  return 'other'
}

/**
 * Detect form type based on fields
 */
function detectFormType(fields: AnalyzedField[]): FormType {
  const purposes = fields.map(f => f.purpose)
  let bestMatch: FormType = 'other'
  let bestScore = 0

  for (const [formType, config] of Object.entries(FORM_TYPE_PATTERNS)) {
    const matchCount = config.fields.filter(p => purposes.includes(p)).length

    if (matchCount >= config.minMatch && matchCount > bestScore) {
      bestScore = matchCount
      bestMatch = formType as FormType
    }
  }

  // Special case: distinguish login from signup
  if (bestMatch === 'login' || bestMatch === 'signup') {
    const hasName = purposes.includes('name')
    const hasConfirmPassword = fields.filter(f => f.purpose === 'password').length > 1

    if (hasName || hasConfirmPassword) {
      return 'signup'
    }
    return 'login'
  }

  return bestMatch
}

/**
 * Analyze form validation
 */
function analyzeValidation(form: CapturedForm, fields: AnalyzedField[]): FormValidation {
  return {
    hasClientValidation: fields.some(f => f.hasValidation),
    hasRequiredFields: fields.some(f => f.isRequired),
    hasPatternValidation: fields.some(f => f.validationType === 'pattern'),
    hasRealTimeValidation: false // Would need JS analysis
  }
}

/**
 * Detect form UX issues
 */
function detectFormIssues(form: CapturedForm, fields: AnalyzedField[]): FormIssue[] {
  const issues: FormIssue[] = []

  // Missing labels
  const unlabeled = fields.filter(f => !f.label)
  if (unlabeled.length > 0) {
    issues.push({
      type: 'accessibility',
      severity: 'major',
      message: `${unlabeled.length} field(s) missing labels`,
      field: unlabeled[0].type
    })
  }

  // Password without autocomplete
  const passwordFields = fields.filter(f => f.purpose === 'password')
  if (passwordFields.length > 0) {
    issues.push({
      type: 'usability',
      severity: 'minor',
      message: 'Consider adding autocomplete hints for password fields'
    })
  }

  // Too many fields
  if (fields.length > 10) {
    issues.push({
      type: 'usability',
      severity: 'major',
      message: `Form has ${fields.length} fields - consider splitting into steps`
    })
  }

  // No required fields marked
  if (!fields.some(f => f.isRequired)) {
    issues.push({
      type: 'usability',
      severity: 'minor',
      message: 'No required fields marked - users may be confused'
    })
  }

  // Email without validation
  const emailFields = fields.filter(f => f.purpose === 'email' && !f.hasValidation)
  if (emailFields.length > 0) {
    issues.push({
      type: 'usability',
      severity: 'minor',
      message: 'Email field lacks validation pattern'
    })
  }

  return issues
}

/**
 * Calculate UX score (0-100)
 */
function calculateUXScore(
  form: CapturedForm,
  fields: AnalyzedField[],
  issues: FormIssue[]
): number {
  let score = 100

  // Deduct for issues
  issues.forEach(issue => {
    if (issue.severity === 'critical') score -= 25
    else if (issue.severity === 'major') score -= 15
    else if (issue.severity === 'minor') score -= 5
  })

  // Bonus for good practices
  if (fields.every(f => f.label)) score += 5
  if (fields.some(f => f.hasValidation)) score += 5
  if (form.submitButton) score += 5

  // Penalty for too many fields
  if (fields.length > 5) score -= (fields.length - 5) * 2

  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate form type confidence
 */
function calculateFormConfidence(type: FormType, fields: AnalyzedField[]): number {
  if (type === 'other') return 0.3

  const config = FORM_TYPE_PATTERNS[type]
  const purposes = fields.map(f => f.purpose)
  const matchCount = config.fields.filter(p => purposes.includes(p)).length
  const ratio = matchCount / Math.max(config.fields.length, 1)

  return Math.min(1, 0.5 + ratio * 0.5)
}

/**
 * Detect common form patterns
 */
function detectFormPatterns(forms: AnalyzedForm[]): FormPattern[] {
  const patterns: FormPattern[] = [
    {
      name: 'Single-step form',
      description: 'All fields visible at once',
      isPresent: forms.every(f => f.fields.length <= 6)
    },
    {
      name: 'Multi-step wizard',
      description: 'Form split into multiple steps',
      isPresent: forms.some(f => f.fields.length > 6)
    },
    {
      name: 'Inline validation',
      description: 'Real-time field validation',
      isPresent: forms.some(f => f.validation.hasRealTimeValidation)
    },
    {
      name: 'Progressive disclosure',
      description: 'Fields revealed based on previous input',
      isPresent: false // Would need dynamic analysis
    },
    {
      name: 'Social login option',
      description: 'OAuth/social sign-in available',
      isPresent: false // Would need button analysis
    },
    {
      name: 'Guest checkout',
      description: 'Purchase without account creation',
      isPresent: forms.some(f => f.type === 'checkout')
    }
  ]

  return patterns
}

/**
 * Calculate form statistics
 */
function calculateFormStats(forms: AnalyzedForm[]): FormStats {
  const allFields = forms.flatMap(f => f.fields)
  const formTypes: Record<FormType, number> = {} as Record<FormType, number>

  forms.forEach(f => {
    formTypes[f.type] = (formTypes[f.type] || 0) + 1
  })

  return {
    totalForms: forms.length,
    avgFieldCount: forms.length > 0
      ? Math.round(allFields.length / forms.length)
      : 0,
    hasPasswordField: allFields.some(f => f.purpose === 'password'),
    hasPaymentFields: allFields.some(f =>
      ['card-number', 'card-expiry', 'card-cvv'].includes(f.purpose)
    ),
    formTypes
  }
}

/**
 * Get default form analysis
 */
export function getDefaultFormAnalysis(): FormAnalysis {
  return {
    forms: [],
    patterns: [],
    stats: {
      totalForms: 0,
      avgFieldCount: 0,
      hasPasswordField: false,
      hasPaymentFields: false,
      formTypes: {} as Record<FormType, number>
    }
  }
}
