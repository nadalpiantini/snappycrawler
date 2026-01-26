# SnappyCrawler - Complete Documentation

**Version**: 2.1.0
**Status**: Production Ready
**Last Updated**: 2026-01-26

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [CLI Reference](#cli-reference)
4. [Analysis Modes](#analysis-modes)
   - [MODE 1: Snapshot](#mode-1-snapshot)
   - [MODE 2: Design Forensics](#mode-2-design-forensics)
   - [MODE 3: UX Intelligence](#mode-3-ux-intelligence)
   - [MODE 4: Wireframe Engine](#mode-4-wireframe-engine)
   - [MODE 5: AI Context Pack](#mode-5-ai-context-pack)
   - [MODE 6: Compare](#mode-6-compare)
   - [Brain LLM](#brain-llm)
   - [Copy Semantics](#copy-semantics)
   - [Visual Hierarchy](#visual-hierarchy)
5. [API Reference](#api-reference)
6. [Examples](#examples)

---

## Overview

SnappyCrawler is a **motor de inteligencia de producto digital** that observes web products, extracts their DNA (design, UX, logic), and generates actionable artifacts for humans and LLMs.

### Core Principles

1. **No clonar código literal** - Extract patterns, not code
2. **No ser un scraper genérico** - AI-first analysis
3. **Generar inteligencia trazable** - Every inference has evidence
4. **Ser vibecoder-native** - Built for AI-assisted development

### Key Features

- 🔍 **Multi-mode Analysis**: 6 distinct analysis modes
- 🧠 **Cross-mode Reasoning**: Brain LLM layer for insights
- 📊 **Evidence-based**: All conclusions backed by data
- 🚀 **CLI-first**: Designed for terminal workflows
- 📦 **Modular**: Use only the modes you need

---

## Installation

```bash
# Clone repository
cd /Users/nadalpiantini/Dev/snappycrawler

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Set up database
pnpm db:push

# Run tests
pnpm test
```

---

## CLI Reference

### Capture Commands

```bash
# Crawl a website
snappy crawl <url> [options]

# Audit a page
snappy audit <url>

# Test buttons
snappy test-buttons <url> [options]

# Export snapshot
snappy export <url> [options]
```

### Analysis Commands

```bash
# Pull and analyze (NEW!)
snappy pull <snapshot-id> [options]

# Compare snapshots (NEW!)
snappy compare <snapshot-id1> <snapshot-id2> [options]

# List snapshots (NEW!)
snappy list [options]
```

### Pull Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `--design` | Extract design tokens | - |
| `--ux` | Extract UX intelligence | - |
| `--wireframe` | Generate wireframe | - |
| `--ai` | Generate AI context | - |
| `--all` | Run all analysis modes | - |

---

## Analysis Modes

### MODE 1: Snapshot

**Purpose**: Capture raw page data

**Captures**:
- HTML structure
- Text content
- Interaction events
- Metadata (viewport, timestamp)
- Screenshot (optional)

**Output**: `snapshot.json`

**Usage**:
```bash
snappy export https://example.com --output snapshot.json
```

---

### MODE 2: Design Forensics

**Purpose**: Extract design tokens and patterns

**Extracts**:
- **Typography**: Font families, sizes, weights, line heights
- **Colors**: Color palettes with usage percentages
- **Spacing**: Padding, margin, gap scales
- **Effects**: Border radius, shadows

**Outputs**:
- `design-tokens.json` - Machine-readable tokens
- `tokens.css` - CSS variables
- `design-summary.md` - Human-readable summary

**API**:
```typescript
import { analyzeDesign } from './lib/design-forensics'

const result = await analyzeDesign(snapshot)
console.log(result.colors)
console.log(result.typography)
```

**Use Cases**:
- Bootstrapping design systems
- Competitor analysis
- Design tokens extraction
- Style guide generation

---

### MODE 3: UX Intelligence

**Purpose**: Analyze user experience patterns

**Analyzes**:
- **CTAs**: Detection, scoring, styling
- **Forms**: Patterns, validation, fields
- **Navigation**: Structure, breadcrumbs, menus
- **Flows**: User journey detection
- **Accessibility**: WCAG compliance

**Outputs**:
- `ux-intent.md` - User intent analysis
- `ux-critique.md` - UX recommendations
- `ux-evidence.json` - Evidence layer

**API**:
```typescript
import { analyzeUX } from './lib/ux-intelligence'

const result = await analyzeUX(snapshot)
console.log(result.ctaAnalysis)
console.log(result.formAnalysis)
```

**Use Cases**:
- UX audit and optimization
- Conversion rate optimization
- Accessibility improvements
- User journey mapping

---

### MODE 4: Wireframe Engine

**Purpose**: Generate visual wireframes

**Generates**:
- **Layout Detection**: Columns, sections, blocks
- **Hierarchy**: Visual organization levels
- **ASCII Export**: Terminal-friendly wireframes
- **Designer Prompts**: AI-ready design briefs
- **Figma JSON**: Optional Figma format

**Outputs**:
- `wireframe.md` - Layout description
- `ascii.txt` - ASCII wireframe
- `designer-prompt.md` - Designer instructions

**API**:
```typescript
import { analyzeWireframe, generateASCIIWireframe } from './lib/wireframe-engine'

const wireframe = await analyzeWireframe({ snapshot })
const ascii = generateASCIIWireframe(wireframe)
console.log(ascii.layout)
```

**Use Cases**:
- Rapid prototyping
- Design system documentation
- Developer handoff
- Architecture visualization

---

### MODE 5: AI Context Pack

**Purpose**: Generate AI-optimized context

**Generates**:
- **System Brief**: Overview, objectives, constraints
- **Constraints**: Technical, business, design, negative
- **Code Schema**: Components, props, state
- **System Prompts**: Developer, designer, PM, LLM prompts
- **Suggested Tasks**: Prioritized implementation

**Outputs**:
- `ai-context.md` - Complete context
- `system-prompt.txt` - System prompts
- `code-schema.json` - Component definitions

**API**:
```typescript
import { analyzeAIContext } from './lib/ai-context'

const result = await analyzeAIContext({ snapshot })
console.log(result.systemBrief)
console.log(result.codeSchema)
```

**Use Cases**:
- LLM context preparation
- Code generation prompts
- Task estimation
- System architecture

---

### MODE 6: Compare

**Purpose**: Compare multiple snapshots

**Compares**:
- **Visual**: Layout, colors, typography changes
- **UX**: Flows, interactions, accessibility
- **Content**: Structure, text, media changes
- **Technical**: Performance, complexity, best practices

**Outputs**:
- `compare-report.md` - Comparison report
- `compare-matrix.json` - Scoring matrix

**API**:
```typescript
import { compareSnapshots } from './lib/compare'

const result = await compareSnapshots({
  snapshots: [snapshot1, snapshot2],
  names: ['V1', 'V2']
})
console.log(result.visualDiff)
console.log(result.opportunities)
```

**Use Cases**:
- A/B testing analysis
- Version comparison
- Regression detection
- Competitor benchmarking

---

### Brain LLM

**Purpose**: Cross-mode reasoning and insights

**Provides**:
- **Insights**: Actionable UX, design, performance insights
- **Patterns**: Cross-domain pattern detection
- **Intent Inference**: User and business goal inference
- **Explanations**: Human-readable explanations

**Output**:
- `brain-analysis.json` - Complete analysis

**API**:
```typescript
import { analyzeWithBrain } from './lib/brain-llm'

const result = await analyzeWithBrain({
  snapshot,
  wireframe,
  aiContext
})
console.log(result.insights)
console.log(result.patterns)
```

**Use Cases**:
- Cross-mode analysis
- Opportunity identification
- Strategic recommendations
- Automated auditing

---

### Copy Semantics

**Purpose**: Text analysis and tone detection

**Analyzes**:
- **Tone**: Professional, friendly, urgent, casual
- **Voice**: Persona and formality level
- **Urgency**: High/medium/low scoring
- **Framing**: Positive/negative, loss aversion
- **Pronouns**: First/second/third person usage
- **Verbs**: Action-oriented detection

**API**:
```typescript
import { analyzeCopySemantics } from './lib/copy-semantics'

const result = await analyzeCopySemantics(snapshot)
console.log(result.tone)
console.log(result.urgency)
```

**Use Cases**:
- Content audit
- Brand voice analysis
- Copy optimization
- Messaging strategy

---

### Visual Hierarchy

**Purpose**: Element scoring and hierarchy analysis

**Analyzes**:
- **Element Scores**: Size, contrast, position, weight
- **Hierarchy Levels**: Primary, secondary, tertiary
- **Clarity**: Clear/moderate/unclear
- **Issues**: Detected hierarchy problems

**API**:
```typescript
import { analyzeVisualHierarchy } from './lib/visual-hierarchy'

const result = await analyzeVisualHierarchy(snapshot)
console.log(result.scores)
console.log(result.summary)
```

**Use Cases**:
- UX audit
- Design review
- Accessibility improvements
- Conversion optimization

---

## API Reference

### Core Modules

```typescript
// Design Forensics
import { analyzeDesign } from './lib/design-forensics'
const design = await analyzeDesign(snapshot)

// UX Intelligence
import { analyzeUX } from './lib/ux-intelligence'
const ux = await analyzeUX(snapshot)

// Wireframe Engine
import { analyzeWireframe } from './lib/wireframe-engine'
const wireframe = await analyzeWireframe({ snapshot })

// AI Context
import { analyzeAIContext } from './lib/ai-context'
const aiContext = await analyzeAIContext({ snapshot })

// Compare
import { compareSnapshots } from './lib/compare'
const comparison = await compareSnapshots({ snapshots: [s1, s2] })

// Brain LLM
import { analyzeWithBrain } from './lib/brain-llm'
const brain = await analyzeWithBrain({ snapshot, wireframe, aiContext })

// Copy Semantics
import { analyzeCopySemantics } from './lib/copy-semantics'
const copy = await analyzeCopySemantics(snapshot)

// Visual Hierarchy
import { analyzeVisualHierarchy } from './lib/visual-hierarchy'
const hierarchy = await analyzeVisualHierarchy(snapshot)
```

### Data Types

```typescript
// Raw Snapshot
interface RawSnapshot {
  url: string
  title: string
  html: string
  text: string[]
  ux: UXEvent[]
  timestamp?: string
  designStyles?: DesignStyles
  uxData?: UXData
}

// UX Event
interface UXEvent {
  type: 'click' | 'submit' | 'scroll' | 'input'
  tag?: string
  text?: string
  id?: string | null
  class?: string | null
  action?: string
  fields?: Field[]
}
```

---

## Examples

### Example 1: Complete Analysis Workflow

```bash
# 1. Capture a page
snappy export https://example.com --output example.json

# 2. List snapshots to get ID
snappy list

# 3. Pull all analysis
snappy pull <snapshot-id> --all

# 4. View generated files
cat snappy-analysis-*.json
```

### Example 2: Design System Extraction

```bash
# Pull design tokens only
snappy pull <snapshot-id> --design

# Output includes:
# - design-tokens.json
# - tokens.css
# - design-summary.md
```

### Example 3: Comparison Workflow

```bash
# Compare two versions
snappy compare snapshot-id-v1 snapshot-id-v2

# Output includes:
# - compare-report.md
# - compare-matrix.json
```

### Example 4: Programmatic Usage

```typescript
import { runFullAnalysis } from './lib/cli-integration'

// Run complete analysis
const results = await runFullAnalysis(snapshot)

console.log('Design:', results.design.colors)
console.log('UX:', results.ux.ctas)
console.log('Wireframe:', results.wireframe.structure)
console.log('AI Context:', results.aiContext.systemBrief)
console.log('Brain:', results.brain.insights)
```

---

## Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

### Test Files

- `tests/wireframe-engine.test.ts` - Wireframe Engine tests
- `tests/ai-context.test.ts` - AI Context tests
- `tests/compare.test.ts` - Compare mode tests
- `tests/brain-llm.test.ts` - Brain LLM tests

---

## Performance Optimization

### Handling Large Snapshots

For snapshots >1MB, the system automatically:
- Streams processing
- Uses lazy evaluation
- Implements memory management

### Optimization Strategies

```typescript
// Use specific modes to reduce processing time
snappy pull <id> --design --ux  // Only 2 modes

// Process in parallel
await Promise.all([
  analyzeDesign(snapshot),
  analyzeUX(snapshot)
])
```

---

## Deployment

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=production
```

### Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests FIRST (TDD)
4. Implement your changes
5. Run tests and ensure they pass
6. Submit a pull request

---

## License

MIT License - see LICENSE file

---

**Made with ❤️ by the SnappyCrawler Team**
*Last updated: January 26, 2026*
