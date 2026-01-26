// ============================================
// UX Intelligence Output Generators
// ============================================

import type {
  UXAnalysis,
  UXIntelligenceOutput,
  UXRecommendation
} from './types'

/**
 * Generate all output formats
 */
export function generateAllOutputs(analysis: UXAnalysis): UXIntelligenceOutput {
  return {
    analysis,
    json: generateUXJSON(analysis),
    markdown: generateUXMarkdown(analysis),
    checklist: generateUXChecklist(analysis)
  }
}

/**
 * Generate JSON output (for API responses)
 */
export function generateUXJSON(analysis: UXAnalysis): string {
  return JSON.stringify(analysis, null, 2)
}

/**
 * Generate Markdown report
 */
export function generateUXMarkdown(analysis: UXAnalysis): string {
  const lines: string[] = []
  const { meta, ctas, forms, navigation, userFlows, accessibility, patterns, recommendations } = analysis

  // Header
  lines.push('# UX Intelligence Report')
  lines.push('')
  lines.push(`**Source:** ${meta.source}`)
  lines.push(`**Analyzed:** ${new Date(meta.analyzedAt).toLocaleString()}`)
  lines.push(`**Page Type:** ${meta.pageType}`)
  lines.push(`**Confidence:** ${Math.round(meta.confidence * 100)}%`)
  lines.push('')

  // Executive Summary
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(generateExecutiveSummary(analysis))
  lines.push('')

  // CTAs Section
  lines.push('## Call-to-Action Analysis')
  lines.push('')
  if (ctas.primary) {
    lines.push('### Primary CTA')
    lines.push(`- **Text:** "${ctas.primary.text}"`)
    lines.push(`- **Type:** ${ctas.primary.type}`)
    lines.push(`- **Position:** ${ctas.primary.position}`)
    lines.push(`- **Urgency:** ${ctas.primary.urgency}`)
    lines.push(`- **Confidence:** ${Math.round(ctas.primary.confidence * 100)}%`)
    lines.push('')
  } else {
    lines.push('*No primary CTA detected*')
    lines.push('')
  }

  if (ctas.secondary.length > 0) {
    lines.push('### Secondary CTAs')
    ctas.secondary.forEach((cta, i) => {
      lines.push(`${i + 1}. **"${cta.text}"** - ${cta.type} (${cta.position})`)
    })
    lines.push('')
  }

  lines.push('### CTA Statistics')
  lines.push(`- Total CTAs: ${ctas.stats.totalCount}`)
  lines.push(`- Above fold: ${ctas.stats.aboveFold}`)
  lines.push(`- Below fold: ${ctas.stats.belowFold}`)
  lines.push(`- In header: ${ctas.stats.inHeader}`)
  lines.push(`- In footer: ${ctas.stats.inFooter}`)
  lines.push('')

  // Forms Section
  lines.push('## Form Analysis')
  lines.push('')
  if (forms.forms.length > 0) {
    forms.forms.forEach((form, i) => {
      lines.push(`### Form ${i + 1}: ${form.type}`)
      lines.push(`- **Fields:** ${form.fields.length}`)
      lines.push(`- **UX Score:** ${form.uxScore}/100`)
      lines.push(`- **Confidence:** ${Math.round(form.confidence * 100)}%`)
      lines.push('')

      if (form.fields.length > 0) {
        lines.push('**Fields:**')
        form.fields.forEach(field => {
          const required = field.isRequired ? '(required)' : ''
          lines.push(`- ${field.purpose} ${required}`)
        })
        lines.push('')
      }

      if (form.issues.length > 0) {
        lines.push('**Issues:**')
        form.issues.forEach(issue => {
          lines.push(`- [${issue.severity.toUpperCase()}] ${issue.message}`)
        })
        lines.push('')
      }
    })
  } else {
    lines.push('*No forms detected*')
    lines.push('')
  }

  lines.push('### Form Statistics')
  lines.push(`- Total forms: ${forms.stats.totalForms}`)
  lines.push(`- Average fields: ${forms.stats.avgFieldCount}`)
  lines.push(`- Has password fields: ${forms.stats.hasPasswordField ? 'Yes' : 'No'}`)
  lines.push(`- Has payment fields: ${forms.stats.hasPaymentFields ? 'Yes' : 'No'}`)
  lines.push('')

  // Navigation Section
  lines.push('## Navigation Analysis')
  lines.push('')
  if (navigation.primary) {
    lines.push('### Primary Navigation')
    lines.push(`- **Type:** ${navigation.primary.type}`)
    lines.push(`- **Items:** ${navigation.primary.items.length}`)
    lines.push(`- **Depth:** ${navigation.primary.depth}`)
    lines.push(`- **Sticky:** ${navigation.primary.isSticky ? 'Yes' : 'No'}`)
    lines.push('')

    if (navigation.primary.items.length > 0) {
      lines.push('**Menu Items:**')
      navigation.primary.items.forEach(item => {
        const active = item.isActive ? ' (active)' : ''
        const submenu = item.hasSubmenu ? ' ▾' : ''
        lines.push(`- ${item.text}${submenu}${active}`)
      })
      lines.push('')
    }
  } else {
    lines.push('*No primary navigation detected*')
    lines.push('')
  }

  if (navigation.breadcrumbs) {
    lines.push('### Breadcrumbs')
    lines.push(`Path: ${navigation.breadcrumbs.items.join(' > ')}`)
    lines.push('')
  }

  if (navigation.footer) {
    lines.push('### Footer Navigation')
    lines.push(`- **Columns:** ${navigation.footer.columns}`)
    lines.push(`- **Social links:** ${navigation.footer.hasSocialLinks ? 'Yes' : 'No'}`)
    lines.push(`- **Legal links:** ${navigation.footer.hasLegalLinks ? 'Yes' : 'No'}`)
    lines.push('')
  }

  // User Flows Section
  lines.push('## User Flow Analysis')
  lines.push('')
  if (userFlows.primaryFlow) {
    lines.push('### Primary Flow')
    lines.push(`- **Name:** ${userFlows.primaryFlow.name}`)
    lines.push(`- **Type:** ${userFlows.primaryFlow.type}`)
    lines.push(`- **Complexity:** ${userFlows.primaryFlow.complexity}`)
    lines.push(`- **Estimated time:** ${userFlows.primaryFlow.estimatedTime}`)
    lines.push('')

    if (userFlows.primaryFlow.steps.length > 0) {
      lines.push('**Steps:**')
      userFlows.primaryFlow.steps.forEach(step => {
        const required = step.isRequired ? '' : ' (optional)'
        lines.push(`${step.order}. ${step.action}${required}`)
      })
      lines.push('')
    }
  }

  if (userFlows.conversionFunnel) {
    lines.push('### Conversion Funnel')
    userFlows.conversionFunnel.stages.forEach(stage => {
      lines.push(`${stage.position}. **${stage.name}** - ${stage.action}`)
    })
    lines.push('')

    if (userFlows.conversionFunnel.dropOffPoints.length > 0) {
      lines.push('**Potential Drop-off Points:**')
      userFlows.conversionFunnel.dropOffPoints.forEach(point => {
        lines.push(`- ${point}`)
      })
      lines.push('')
    }
  }

  // Accessibility Section
  lines.push('## Accessibility Analysis')
  lines.push('')
  lines.push(`**Score:** ${accessibility.score}/100`)
  lines.push(`**WCAG Level:** ${accessibility.level}`)
  lines.push('')

  if (accessibility.passes.length > 0) {
    lines.push('### Passing Checks')
    accessibility.passes.forEach(pass => {
      lines.push(`✅ ${pass}`)
    })
    lines.push('')
  }

  if (accessibility.issues.length > 0) {
    lines.push('### Issues')
    accessibility.issues.forEach(issue => {
      lines.push(`- **[${issue.severity.toUpperCase()}]** ${issue.description}`)
      lines.push(`  - WCAG: ${issue.wcagCriteria}`)
      lines.push(`  - Fix: ${issue.suggestion}`)
    })
    lines.push('')
  }

  // Patterns Section
  lines.push('## Detected Patterns')
  lines.push('')

  if (patterns.layout.length > 0) {
    lines.push('### Layout Patterns')
    patterns.layout.forEach(p => {
      lines.push(`- **${p.name}** (${Math.round(p.confidence * 100)}%) - ${p.description}`)
    })
    lines.push('')
  }

  if (patterns.engagement.length > 0) {
    lines.push('### Engagement Patterns')
    patterns.engagement.forEach(p => {
      lines.push(`- **${p.name}** (${p.type})`)
    })
    lines.push('')
  }

  // Recommendations Section
  lines.push('## Recommendations')
  lines.push('')

  const highPriority = recommendations.filter(r => r.priority === 'high')
  const mediumPriority = recommendations.filter(r => r.priority === 'medium')
  const lowPriority = recommendations.filter(r => r.priority === 'low')

  if (highPriority.length > 0) {
    lines.push('### 🔴 High Priority')
    highPriority.forEach((rec, i) => {
      lines.push(`${i + 1}. **${rec.title}**`)
      lines.push(`   - ${rec.description}`)
      lines.push(`   - Impact: ${rec.impact}`)
      lines.push(`   - Effort: ${rec.effort}`)
      if (rec.implementation) {
        lines.push(`   - Implementation: ${rec.implementation}`)
      }
    })
    lines.push('')
  }

  if (mediumPriority.length > 0) {
    lines.push('### 🟡 Medium Priority')
    mediumPriority.forEach((rec, i) => {
      lines.push(`${i + 1}. **${rec.title}** - ${rec.description}`)
    })
    lines.push('')
  }

  if (lowPriority.length > 0) {
    lines.push('### 🟢 Low Priority')
    lowPriority.forEach((rec, i) => {
      lines.push(`${i + 1}. **${rec.title}** - ${rec.description}`)
    })
    lines.push('')
  }

  // Footer
  lines.push('---')
  lines.push(`*Generated by SnappyCrawler UX Intelligence v${meta.version}*`)

  return lines.join('\n')
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(analysis: UXAnalysis): string {
  const { ctas, forms, accessibility, recommendations } = analysis
  const parts: string[] = []

  // Page type
  parts.push(`This appears to be a **${analysis.meta.pageType}** page.`)

  // CTA summary
  if (ctas.primary) {
    parts.push(`The primary call-to-action is "${ctas.primary.text}" (${ctas.primary.type}).`)
  } else {
    parts.push('No clear primary CTA was detected.')
  }

  // Forms summary
  if (forms.forms.length > 0) {
    const formTypes = forms.forms.map(f => f.type).join(', ')
    parts.push(`${forms.forms.length} form(s) detected: ${formTypes}.`)
  }

  // Accessibility summary
  parts.push(`Accessibility score is ${accessibility.score}/100 (${accessibility.level}).`)

  // Recommendations summary
  const highCount = recommendations.filter(r => r.priority === 'high').length
  if (highCount > 0) {
    parts.push(`**${highCount} high-priority recommendations** require attention.`)
  } else {
    parts.push('No critical issues detected.')
  }

  return parts.join(' ')
}

/**
 * Generate UX checklist
 */
export function generateUXChecklist(analysis: UXAnalysis): string {
  const lines: string[] = []
  const { ctas, forms, navigation, accessibility, recommendations } = analysis

  lines.push('# UX Checklist')
  lines.push('')

  // CTA Checklist
  lines.push('## Call-to-Action')
  lines.push(ctas.primary ? '- [x] Primary CTA present' : '- [ ] Add primary CTA')
  lines.push(ctas.stats.aboveFold > 0 ? '- [x] CTA above the fold' : '- [ ] Add CTA above fold')
  lines.push(ctas.primary?.styling.prominence === 'high'
    ? '- [x] CTA visually prominent'
    : '- [ ] Improve CTA visibility')
  lines.push('')

  // Form Checklist
  lines.push('## Forms')
  if (forms.forms.length > 0) {
    forms.forms.forEach((form, i) => {
      lines.push(`### Form ${i + 1} (${form.type})`)
      lines.push(form.validation.hasRequiredFields
        ? '- [x] Required fields marked'
        : '- [ ] Mark required fields')
      lines.push(form.validation.hasClientValidation
        ? '- [x] Client-side validation'
        : '- [ ] Add client-side validation')
      lines.push(form.fields.every(f => f.label)
        ? '- [x] All fields labeled'
        : '- [ ] Add labels to all fields')
      lines.push(form.uxScore >= 70
        ? '- [x] Good UX score'
        : `- [ ] Improve form UX (current: ${form.uxScore}/100)`)
    })
  } else {
    lines.push('*No forms detected*')
  }
  lines.push('')

  // Navigation Checklist
  lines.push('## Navigation')
  lines.push(navigation.primary
    ? '- [x] Primary navigation present'
    : '- [ ] Add primary navigation')
  lines.push(navigation.primary?.isSticky
    ? '- [x] Sticky navigation'
    : '- [ ] Consider sticky navigation')
  lines.push(navigation.breadcrumbs
    ? '- [x] Breadcrumbs present'
    : '- [ ] Add breadcrumbs')
  lines.push(navigation.footer
    ? '- [x] Footer navigation present'
    : '- [ ] Add footer navigation')
  lines.push('')

  // Accessibility Checklist
  lines.push('## Accessibility')
  lines.push(accessibility.stats.hasSkipLinks
    ? '- [x] Skip link present'
    : '- [ ] Add skip link')
  lines.push(accessibility.stats.hasLandmarks
    ? '- [x] ARIA landmarks present'
    : '- [ ] Add ARIA landmarks')
  lines.push(accessibility.stats.headingOrder === 'correct'
    ? '- [x] Heading order correct'
    : '- [ ] Fix heading hierarchy')
  lines.push(accessibility.stats.imagesTotal === accessibility.stats.imagesWithAlt
    ? '- [x] All images have alt text'
    : `- [ ] Add alt text (${accessibility.stats.imagesTotal - accessibility.stats.imagesWithAlt} missing)`)
  lines.push(accessibility.stats.criticalIssues === 0
    ? '- [x] No critical issues'
    : `- [ ] Fix ${accessibility.stats.criticalIssues} critical issue(s)`)
  lines.push('')

  // Recommendations as checklist
  lines.push('## Recommendations')
  recommendations.forEach(rec => {
    const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'
    lines.push(`- [ ] ${priority} ${rec.title}`)
  })
  lines.push('')

  // Summary
  const totalItems = lines.filter(l => l.startsWith('- [')).length
  const checkedItems = lines.filter(l => l.startsWith('- [x]')).length
  const percentage = Math.round((checkedItems / totalItems) * 100)

  lines.push('---')
  lines.push(`**Progress:** ${checkedItems}/${totalItems} (${percentage}%)`)

  return lines.join('\n')
}

/**
 * Generate summary for API response
 */
export function generateUXSummary(analysis: UXAnalysis): {
  pageType: string
  confidence: number
  primaryCTA: string | null
  formCount: number
  accessibilityScore: number
  accessibilityLevel: string
  highPriorityIssues: number
  topRecommendation: string | null
} {
  return {
    pageType: analysis.meta.pageType,
    confidence: analysis.meta.confidence,
    primaryCTA: analysis.ctas.primary?.text || null,
    formCount: analysis.forms.forms.length,
    accessibilityScore: analysis.accessibility.score,
    accessibilityLevel: analysis.accessibility.level,
    highPriorityIssues: analysis.recommendations.filter(r => r.priority === 'high').length,
    topRecommendation: analysis.recommendations[0]?.title || null
  }
}
