// ============================================
// COPY SEMANTICS - Text Analysis Layer
// ============================================

import { RawSnapshot } from '../types'

export interface CopyAnalysis {
  meta: CopyMeta
  tone: ToneAnalysis
  voice: VoiceProfile
  urgency: UrgencyScore
  framing: FramingAnalysis
  pronouns: PronounUsage
  verbs: VerbAnalysis
  recommendations: string[]
}

export interface CopyMeta {
  analyzedAt: string
  sourceUrl: string
  totalWords: number
  totalCharacters: number
}

export interface ToneAnalysis {
  primary: string
  secondary: string[]
  confidence: number
  examples: string[]
}

export interface VoiceProfile {
  persona: string
  characteristics: string[]
  formality: 'formal' | 'neutral' | 'casual'
}

export interface UrgencyScore {
  level: 'high' | 'medium' | 'low'
  score: number
  triggers: string[]
}

export interface FramingAnalysis {
  positive: string[]
  negative: string[]
  neutral: string[]
  lossAversion: boolean
  socialProof: boolean
}

export interface PronounUsage {
  firstPerson: number
  secondPerson: number
  thirdPerson: number
  inclusive: boolean
}

export interface VerbAnalysis {
  dominant: string[]
  actionOriented: boolean
  examples: string[]
}

export async function analyzeCopySemantics(snapshot: RawSnapshot): Promise<CopyAnalysis> {
  const text = (snapshot.text || []).join(' ')

  return {
    meta: {
      analyzedAt: new Date().toISOString(),
      sourceUrl: snapshot.url,
      totalWords: text.split(/\s+/).length,
      totalCharacters: text.length
    },
    tone: analyzeTone(text),
    voice: analyzeVoice(text),
    urgency: analyzeUrgency(text),
    framing: analyzeFraming(text),
    pronouns: analyzePronouns(text),
    verbs: analyzeVerbs(text),
    recommendations: generateCopyRecommendations(text)
  }
}

function analyzeTone(text: string): ToneAnalysis {
  const lower = text.toLowerCase()

  const toneMap: Record<string, string[]> = {
    professional: ['professional', 'expert', 'leading', 'trusted', 'enterprise'],
    friendly: ['hello', 'welcome', 'friend', 'happy', 'love', 'enjoy'],
    urgent: ['now', 'today', 'limited', 'hurry', 'fast', 'quick'],
    casual: ['hey', 'guys', 'awesome', 'cool', 'stuff'],
    formal: ['hereby', 'pursuant', 'therefore', 'notwithstanding']
  }

  let maxCount = 0
  let primary = 'neutral'
  const secondary: string[] = []
  const examples: string[] = []

  Object.entries(toneMap).forEach(([tone, keywords]) => {
    const count = keywords.filter(kw => lower.includes(kw)).length
    if (count > maxCount) {
      maxCount = count
      primary = tone
    }
    if (count > 0) {
      secondary.push(tone)
    }
  })

  return {
    primary,
    secondary: secondary.filter(t => t !== primary),
    confidence: Math.min(0.9, maxCount / 5),
    examples
  }
}

function analyzeVoice(text: string): VoiceProfile {
  const lower = text.toLowerCase()

  const formalIndicators = (lower.match(/ hereby|pursuant|therefore/g) || []).length
  const casualIndicators = (lower.match(/ hey|guys|awesome|cool/g) || []).length

  let formality: 'formal' | 'neutral' | 'casual' = 'neutral'
  if (formalIndicators > 2) formality = 'formal'
  if (casualIndicators > 2) formality = 'casual'

  const characteristics: string[] = []
  if (formality === 'formal') characteristics.push('uses formal language')
  if (formality === 'casual') characteristics.push('conversational tone')
  if (lower.includes('we') || lower.includes('our')) characteristics.push('first-person plural')
  if (lower.includes('you') || lower.includes('your')) characteristics.push('direct address')

  return {
    persona: formality === 'formal' ? 'professional' : formality === 'casual' ? 'friendly' : 'neutral',
    characteristics,
    formality
  }
}

function analyzeUrgency(text: string): UrgencyScore {
  const lower = text.toLowerCase()

  const urgentKeywords = ['now', 'today', 'limited', 'hurry', 'fast', 'quick', 'immediate', 'don\'t miss']
  const found = urgentKeywords.filter(kw => lower.includes(kw))

  const score = Math.min(1, found.length / 3)
  const level = score > 0.6 ? 'high' : score > 0.3 ? 'medium' : 'low'

  return {
    level,
    score,
    triggers: found
  }
}

function analyzeFraming(text: string): FramingAnalysis {
  const lower = text.toLowerCase()

  const positive = ['benefit', 'gain', 'save', 'free', 'best', 'top', 'love', 'happy']
  const negative = ['loss', 'miss', 'fail', 'never', 'worst', 'avoid', 'risk', 'problem']

  const positiveFound = positive.filter(p => lower.includes(p))
  const negativeFound = negative.filter(n => lower.includes(n))

  const lossAversion = lower.includes('don\'t miss') || lower.includes('lose')
  const socialProof = lower.includes('join') || lower.includes('subscribers') || lower.includes('customers')

  return {
    positive: positiveFound,
    negative: negativeFound,
    neutral: [],
    lossAversion,
    socialProof
  }
}

function analyzePronouns(text: string): PronounUsage {
  const lower = text.toLowerCase()

  const firstPerson = (lower.match(/\b(I|we|my|our|us|me)\b/g) || []).length
  const secondPerson = (lower.match(/\b(you|your|yours)\b/g) || []).length
  const thirdPerson = (lower.match(/\b(he|she|it|they|them|his|her|its|their)\b/g) || []).length

  const inclusive = lower.includes('they') || lower.includes('them') || lower.includes('or')

  return {
    firstPerson,
    secondPerson,
    thirdPerson,
    inclusive
  }
}

function analyzeVerbs(text: string): VerbAnalysis {
  const words = text.toLowerCase().split(/\s+/)
  const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'])

  const actionVerbs = new Set([
    'get', 'take', 'make', 'create', 'build', 'start', 'join', 'sign', 'buy',
    'learn', 'discover', 'find', 'see', 'watch', 'read', 'explore', 'try'
  ])

  const verbs: string[] = []
  words.forEach(word => {
    if (actionVerbs.has(word) && !stopwords.has(word)) {
      verbs.push(word)
    }
  })

  const dominant = verbs.slice(0, 5)

  return {
    dominant,
    actionOriented: verbs.length > 3,
    examples: verbs.slice(0, 10)
  }
}

function generateCopyRecommendations(text: string): string[] {
  const recommendations: string[] = []

  const wordCount = text.split(/\s+/).length

  if (wordCount > 1000) {
    recommendations.push('Consider shortening copy to improve readability')
  }

  const lower = text.toLowerCase()

  if (!lower.includes('you')) {
    recommendations.push('Add direct address ("you") to increase engagement')
  }

  if (!lower.includes('because') && !lower.includes('why')) {
    recommendations.push('Add reasoning to increase persuasion')
  }

  return recommendations
}
