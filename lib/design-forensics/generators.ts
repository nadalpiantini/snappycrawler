// ============================================
// Design Tokens Output Generators
// ============================================

import type { DesignTokens, DesignForensicsOutput } from './types'

/**
 * Generate all output formats at once
 */
export function generateAllOutputs(tokens: DesignTokens): DesignForensicsOutput {
  return {
    tokens,
    json: generateDesignTokensJSON(tokens),
    css: generateTokensCSS(tokens),
    markdown: generateDesignSummary(tokens)
  }
}

/**
 * Generate W3C-compatible design tokens JSON
 */
export function generateDesignTokensJSON(tokens: DesignTokens): string {
  const output = {
    $schema: 'https://design-tokens.org/schema.json',
    $description: `Design tokens extracted from ${tokens.meta.source}`,

    color: {
      primary: { $value: tokens.colors.primary, $type: 'color' },
      background: {
        default: { $value: tokens.colors.background.default, $type: 'color' },
        surface: { $value: tokens.colors.background.surface, $type: 'color' },
        ...(tokens.colors.background.muted && {
          muted: { $value: tokens.colors.background.muted, $type: 'color' }
        })
      },
      text: {
        default: { $value: tokens.colors.text.default, $type: 'color' },
        muted: { $value: tokens.colors.text.muted, $type: 'color' },
        ...(tokens.colors.text.inverse && {
          inverse: { $value: tokens.colors.text.inverse, $type: 'color' }
        })
      },
      border: { $value: tokens.colors.border, $type: 'color' },
      ...(tokens.colors.secondary && {
        secondary: { $value: tokens.colors.secondary, $type: 'color' }
      }),
      ...(tokens.colors.error && {
        error: { $value: tokens.colors.error, $type: 'color' }
      }),
      ...(tokens.colors.success && {
        success: { $value: tokens.colors.success, $type: 'color' }
      })
    },

    typography: {
      fontFamily: {
        heading: { $value: tokens.typography.fontFamilies.heading, $type: 'fontFamily' },
        body: { $value: tokens.typography.fontFamilies.body, $type: 'fontFamily' },
        ...(tokens.typography.fontFamilies.mono && {
          mono: { $value: tokens.typography.fontFamilies.mono, $type: 'fontFamily' }
        })
      },
      scale: Object.entries(tokens.typography.scale).reduce((acc, [key, value]) => {
        acc[key] = {
          fontSize: { $value: value.fontSize, $type: 'dimension' },
          fontWeight: { $value: value.fontWeight, $type: 'fontWeight' },
          lineHeight: { $value: value.lineHeight, $type: 'number' }
        }
        return acc
      }, {} as Record<string, unknown>)
    },

    spacing: {
      unit: { $value: `${tokens.spacing.unit}px`, $type: 'dimension' },
      scale: tokens.spacing.scale.reduce((acc, value, index) => {
        acc[index + 1] = { $value: `${value}px`, $type: 'dimension' }
        return acc
      }, {} as Record<string, unknown>)
    },

    radii: {
      none: { $value: tokens.radii.none, $type: 'dimension' },
      sm: { $value: tokens.radii.sm, $type: 'dimension' },
      md: { $value: tokens.radii.md, $type: 'dimension' },
      lg: { $value: tokens.radii.lg, $type: 'dimension' },
      full: { $value: tokens.radii.full, $type: 'dimension' }
    },

    ...(Object.keys(tokens.shadows).length > 0 && {
      shadow: Object.entries(tokens.shadows).reduce((acc, [key, value]) => {
        if (value) {
          acc[key] = { $value: value, $type: 'shadow' }
        }
        return acc
      }, {} as Record<string, unknown>)
    }),

    $meta: {
      source: tokens.meta.source,
      analyzedAt: tokens.meta.analyzedAt,
      confidence: tokens.meta.confidence,
      version: tokens.meta.version
    }
  }

  return JSON.stringify(output, null, 2)
}

/**
 * Generate CSS custom properties from tokens
 */
export function generateTokensCSS(tokens: DesignTokens): string {
  const lines: string[] = [
    '/* ============================================',
    ` * Design Tokens - ${tokens.meta.source}`,
    ` * Generated: ${tokens.meta.analyzedAt}`,
    ` * Confidence: ${Math.round(tokens.meta.confidence * 100)}%`,
    ' * ============================================ */',
    '',
    ':root {',
    '  /* Colors */',
    `  --color-primary: ${tokens.colors.primary};`,
    `  --color-background: ${tokens.colors.background.default};`,
    `  --color-surface: ${tokens.colors.background.surface};`,
    ...(tokens.colors.background.muted ? [`  --color-background-muted: ${tokens.colors.background.muted};`] : []),
    `  --color-text: ${tokens.colors.text.default};`,
    `  --color-text-muted: ${tokens.colors.text.muted};`,
    ...(tokens.colors.text.inverse ? [`  --color-text-inverse: ${tokens.colors.text.inverse};`] : []),
    `  --color-border: ${tokens.colors.border};`,
    ...(tokens.colors.secondary ? [`  --color-secondary: ${tokens.colors.secondary};`] : []),
    ...(tokens.colors.error ? [`  --color-error: ${tokens.colors.error};`] : []),
    ...(tokens.colors.success ? [`  --color-success: ${tokens.colors.success};`] : []),
    '',
    '  /* Typography - Font Families */',
    `  --font-heading: ${tokens.typography.fontFamilies.heading};`,
    `  --font-body: ${tokens.typography.fontFamilies.body};`,
    ...(tokens.typography.fontFamilies.mono ? [`  --font-mono: ${tokens.typography.fontFamilies.mono};`] : []),
    '',
    '  /* Typography - Scale */',
    `  --text-h1: ${tokens.typography.scale.h1.fontSize};`,
    `  --text-h2: ${tokens.typography.scale.h2.fontSize};`,
    `  --text-h3: ${tokens.typography.scale.h3.fontSize};`,
    `  --text-body: ${tokens.typography.scale.body.fontSize};`,
    `  --text-sm: ${tokens.typography.scale.bodySmall.fontSize};`,
    ...(tokens.typography.scale.caption ? [`  --text-caption: ${tokens.typography.scale.caption.fontSize};`] : []),
    `  --text-button: ${tokens.typography.scale.button.fontSize};`,
    '',
    '  /* Spacing Scale */',
    ...tokens.spacing.scale.map((value, index) =>
      `  --space-${index + 1}: ${value}px;`
    ),
    '',
    '  /* Border Radius */',
    `  --radius-none: ${tokens.radii.none};`,
    `  --radius-sm: ${tokens.radii.sm};`,
    `  --radius-md: ${tokens.radii.md};`,
    `  --radius-lg: ${tokens.radii.lg};`,
    `  --radius-full: ${tokens.radii.full};`
  ]

  // Add shadows if present
  if (tokens.shadows.sm || tokens.shadows.md || tokens.shadows.lg) {
    lines.push('')
    lines.push('  /* Shadows */')
    if (tokens.shadows.sm) lines.push(`  --shadow-sm: ${tokens.shadows.sm};`)
    if (tokens.shadows.md) lines.push(`  --shadow-md: ${tokens.shadows.md};`)
    if (tokens.shadows.lg) lines.push(`  --shadow-lg: ${tokens.shadows.lg};`)
  }

  lines.push('}')

  return lines.join('\n')
}

/**
 * Generate markdown summary of design system
 */
export function generateDesignSummary(tokens: DesignTokens): string {
  const confidence = Math.round(tokens.meta.confidence * 100)

  const lines: string[] = [
    '# Design System Summary',
    '',
    `**Source**: ${tokens.meta.source}`,
    `**Analyzed**: ${new Date(tokens.meta.analyzedAt).toLocaleString()}`,
    `**Confidence**: ${confidence}%`,
    '',
    '---',
    '',
    '## Typography',
    '',
    '### Font Families',
    '',
    `- **Heading**: ${tokens.typography.fontFamilies.heading}`,
    `- **Body**: ${tokens.typography.fontFamilies.body}`,
    ...(tokens.typography.fontFamilies.mono ? [`- **Mono**: ${tokens.typography.fontFamilies.mono}`] : []),
    '',
    '### Scale',
    '',
    '| Level | Size | Weight | Line Height |',
    '|-------|------|--------|-------------|',
    `| H1 | ${tokens.typography.scale.h1.fontSize} | ${tokens.typography.scale.h1.fontWeight} | ${tokens.typography.scale.h1.lineHeight} |`,
    `| H2 | ${tokens.typography.scale.h2.fontSize} | ${tokens.typography.scale.h2.fontWeight} | ${tokens.typography.scale.h2.lineHeight} |`,
    `| H3 | ${tokens.typography.scale.h3.fontSize} | ${tokens.typography.scale.h3.fontWeight} | ${tokens.typography.scale.h3.lineHeight} |`,
    `| Body | ${tokens.typography.scale.body.fontSize} | ${tokens.typography.scale.body.fontWeight} | ${tokens.typography.scale.body.lineHeight} |`,
    `| Small | ${tokens.typography.scale.bodySmall.fontSize} | ${tokens.typography.scale.bodySmall.fontWeight} | ${tokens.typography.scale.bodySmall.lineHeight} |`,
    `| Button | ${tokens.typography.scale.button.fontSize} | ${tokens.typography.scale.button.fontWeight} | ${tokens.typography.scale.button.lineHeight} |`,
    '',
    '---',
    '',
    '## Colors',
    '',
    '### Palette',
    '',
    '| Role | Color | Preview |',
    '|------|-------|---------|',
    `| Primary | \`${tokens.colors.primary}\` | ![](https://via.placeholder.com/20/${tokens.colors.primary.replace('#', '')}/${tokens.colors.primary.replace('#', '')}) |`,
    `| Background | \`${tokens.colors.background.default}\` | ![](https://via.placeholder.com/20/${tokens.colors.background.default.replace('#', '')}/${tokens.colors.background.default.replace('#', '')}) |`,
    `| Surface | \`${tokens.colors.background.surface}\` | ![](https://via.placeholder.com/20/${tokens.colors.background.surface.replace('#', '')}/${tokens.colors.background.surface.replace('#', '')}) |`,
    `| Text | \`${tokens.colors.text.default}\` | ![](https://via.placeholder.com/20/${tokens.colors.text.default.replace('#', '')}/${tokens.colors.text.default.replace('#', '')}) |`,
    `| Text Muted | \`${tokens.colors.text.muted}\` | ![](https://via.placeholder.com/20/${tokens.colors.text.muted.replace('#', '')}/${tokens.colors.text.muted.replace('#', '')}) |`,
    `| Border | \`${tokens.colors.border}\` | ![](https://via.placeholder.com/20/${tokens.colors.border.replace('#', '')}/${tokens.colors.border.replace('#', '')}) |`,
    '',
    '---',
    '',
    '## Spacing',
    '',
    `**Base Unit**: ${tokens.spacing.unit}px`,
    '',
    '### Scale',
    '',
    '```',
    ...tokens.spacing.scale.map((value, index) =>
      `--space-${index + 1}: ${value}px`
    ),
    '```',
    '',
    '---',
    '',
    '## Border Radius',
    '',
    '| Token | Value |',
    '|-------|-------|',
    `| sm | ${tokens.radii.sm} |`,
    `| md | ${tokens.radii.md} |`,
    `| lg | ${tokens.radii.lg} |`,
    `| full | ${tokens.radii.full} |`
  ]

  // Add shadows if present
  if (tokens.shadows.sm || tokens.shadows.md || tokens.shadows.lg) {
    lines.push('')
    lines.push('---')
    lines.push('')
    lines.push('## Shadows')
    lines.push('')
    lines.push('```css')
    if (tokens.shadows.sm) lines.push(`--shadow-sm: ${tokens.shadows.sm};`)
    if (tokens.shadows.md) lines.push(`--shadow-md: ${tokens.shadows.md};`)
    if (tokens.shadows.lg) lines.push(`--shadow-lg: ${tokens.shadows.lg};`)
    lines.push('```')
  }

  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('*Generated by SnappyCrawler Design Forensics*')

  return lines.join('\n')
}
