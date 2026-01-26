# 📸 Snappy Platform

**Turn any webpage into structured code specifications**

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success)](https://github.com)
[![Version](https://img.shields.io/badge/Version-2.1.0-blue)](https://github.com)
[![TDD](https://img.shields.io/badge/TDD-Test%20Driven%20Development-green)](https://en.wikipedia.org/wiki/Test-driven_development)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4-black)](https://nextjs.org/)

---

## 🎯 What is Snappy?

Snappy captures web page structure and transforms it into clean, functional specifications for AI-assisted development.

**Workflow:**
1. **Capture** - Chrome extension or bookmarklet
2. **Normalize** - Extract structure, UX flows, components
3. **Sanitize** - Remove branding, keep functional logic
4. **Generate** - Send to Claude API → Production-ready code

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SNAPPY PLATFORM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │  EXTENSION   │    │  FRONTEND    │    │   BACKEND    │ │
│  │              │    │  (Next.js)   │    │  (Supabase)  │ │
│  │  Chrome      │───▶│              │◀──▶│              │ │
│  │  Bookmarklet │    │  Dashboard   │    │  Edge Funcs  │ │
│  └──────────────┘    │  Upload      │    │  Normalize   │ │
│                     │  Viewer      │    │  Generate    │ │
│                     └──────────────┘    └──────────────┘ │
│                             │                  │           │
│                             ▼                  ▼           │
│                     ┌──────────────┐    ┌──────────────┐ │
│                     │   DATABASE   │    │   STORAGE    │ │
│                     │  PostgreSQL  │    │  Snapshots   │ │
│                     │  (Supabase)  │    │  Exports     │ │
│                     └──────────────┘    └──────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm (recommended) or npm
- Supabase account (free tier works)

### 1. Clone & Install

```bash
cd /Users/nadalpiantini/Dev/snappy-platform

pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Claude API (optional - for code generation)
CLAUDE_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Push schema to Supabase
pnpm db:push

# Seed sample data (optional)
pnpm db:seed
```

### 4. Start Development

```bash
# Frontend
pnpm dev

# Or with specific port
pnpm dev -- -p 3000
```

Visit: http://localhost:3000

---

## 🧪 Testing (TDD)

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Specific test file
pnpm test normalize.test.ts
```

**Coverage Target:** 80%+

---

## 📁 Project Structure

```
snappy-platform/
├─ frontend/                    # Next.js 15 App
│  ├─ app/                     # App Router
│  ├─ components/              # React components
│  ├─ lib/                     # Utilities
│  ├─ hooks/                   # Custom hooks
│  └─ tests/                   # Unit tests
│
├─ supabase/                   # Backend
│  ├─ functions/               # Edge Functions
│  ├─ migrations/              # Database schema
│  └─ seed/                    # Seed data
│
├─ extension/                  # Chrome Extension
│  ├─ manifest.json
│  └─ content.js
│
├─ bookmarklet/                # Mobile alternative
│  └─ snapshot.js
│
└─ scripts/                    # Utility scripts
```

---

## 🔧 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 15 | React 19, App Router, RSC |
| **UI Library** | shadcn/ui | Accessible, customizable |
| **Styling** | Tailwind CSS | Rapid development |
| **Backend** | Supabase | Auth, Database, Edge Functions |
| **Database** | PostgreSQL | Relational, JSONB support |
| **Testing** | Vitest | Fast, native ESM |
| **Types** | TypeScript | Type safety |
| **CLI** | Commander | Terminal interface |
| **Crawling** | Playwright | Browser automation |

---

## 🚀 CLI Usage

```bash
# Capture a webpage
snappy crawl https://example.com --max-pages 10

# Audit a page
snappy audit https://example.com

# Test buttons
snappy test-buttons https://example.com

# Pull and analyze existing snapshot
snappy pull <snapshot-id> --all

# Pull specific modes
snappy pull <snapshot-id> --design
snappy pull <snapshot-id> --ux
snappy pull <snapshot-id> --wireframe
snappy pull <snapshot-id> --ai

# Compare two snapshots
snappy compare <snapshot-id1> <snapshot-id2>

# List all snapshots
snappy list
```

---

## 🎨 Analysis Modes

### MODE 1: Snapshot
Capture raw page data including HTML, text, interactions, and metadata.

### MODE 2: Design Forensics
Extract design tokens from captured pages:
- **Typography**: Font families, sizes, weights, line heights
- **Colors**: Color palettes with usage percentages
- **Spacing**: Padding, margin, gap scales
- **Effects**: Border radius, shadows

**Outputs**: `design-tokens.json`, `tokens.css`, `design-summary.md`

### MODE 3: UX Intelligence
Analyze user experience patterns:
- **CTA Analysis**: Call-to-action detection and scoring
- **Form Analysis**: Form patterns, validation, fields
- **Navigation**: Nav structure, breadcrumbs, menus
- **Flows**: User journey detection
- **Accessibility**: WCAG compliance scoring

**Outputs**: `ux-intent.md`, `ux-critique.md`, `ux-evidence.json`

### MODE 4: Wireframe Engine
Generate visual wireframes:
- **Layout Detection**: Column structure, sections, blocks
- **Hierarchy**: Visual organization and levels
- **ASCII Export**: Text-based wireframes for terminal
- **Designer Prompts**: AI-ready prompts for designers
- **Figma JSON**: Optional Figma-compatible format

**Outputs**: `wireframe.md`, `ascii.txt`, `designer-prompt.md`

### MODE 5: AI Context Pack
Generate AI-optimized context:
- **System Brief**: Overview, objectives, constraints
- **Constraints**: Technical, business, design, negative
- **Code Schema**: Component definitions, props, state
- **System Prompts**: Developer, designer, PM, LLM prompts
- **Suggested Tasks**: Prioritized implementation tasks

**Outputs**: `ai-context.md`, `system-prompt.txt`, `code-schema.json`

### MODE 6: Compare
Compare multiple snapshots:
- **Visual Diff**: Layout, color, typography changes
- **UX Comparison**: Flow changes, interaction patterns
- **Content Comparison**: Structural, text, media changes
- **Technical Comparison**: Performance, complexity metrics
- **Opportunities**: Improvement recommendations

**Outputs**: `compare-report.md`, `compare-matrix.json`

### Brain LLM Layer
Cross-mode reasoning:
- **Insights**: Actionable insights from all modes
- **Patterns**: Cross-domain pattern detection
- **Intent Inference**: User and business goal inference
- **Explanations**: Human-readable explanations

**Output**: `brain-analysis.json`

---

## 📊 Database Schema

```sql
snappy_profiles     -- User profiles
snappy_snapshots    -- Raw page snapshots
snappy_normalized  -- Normalized structure
snappy_projects    -- Group snapshots
```

See: `supabase/migrations/001_initial_schema.sql`

---

## 📁 Project Structure

```
snappycrawler/
├── lib/
│   ├── design-forensics/     ✅ MODE 2 COMPLETE
│   │   ├── analyzer.ts
│   │   ├── typography.ts
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── generators.ts
│   │   └── types.ts
│   │
│   ├── ux-intelligence/      ✅ MODE 3 COMPLETE
│   │   ├── analyzer.ts
│   │   ├── cta-detector.ts
│   │   ├── form-analyzer.ts
│   │   ├── flow-detector.ts
│   │   ├── generators.ts
│   │   └── types.ts
│   │
│   ├── wireframe-engine/      ✅ MODE 4 COMPLETE
│   │   ├── analyzer.ts
│   │   ├── generators.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── ai-context/            ✅ MODE 5 COMPLETE
│   │   ├── analyzer.ts
│   │   ├── generators.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── compare/               ✅ MODE 6 COMPLETE
│   │   ├── analyzer.ts
│   │   ├── generators.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── brain-llm/             ✅ BRAIN LLM COMPLETE
│   │   ├── analyzer.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── copy-semantics/        ✅ COPY SEMANTICS COMPLETE
│   │   └── index.ts
│   │
│   ├── visual-hierarchy/      ✅ VISUAL HIERARCHY COMPLETE
│   │   └── index.ts
│   │
│   ├── normalizer.ts          ✅
│   ├── legal-safe.ts          ✅
│   ├── supabase/              ✅
│   └── types.ts               ✅
│
├── tests/
│   ├── design-forensics.test.ts  ✅
│   ├── ux-intelligence.test.ts   ✅
│   ├── normalize.test.ts         ✅
│   ├── legal-safe.test.ts        ✅
│   └── supabase.test.ts          ✅
│
├── cli.ts                     ✅ ENHANCED WITH PULL/COMPARE
├── extension/                 ✅ Chrome + bookmarklet
├── supabase/migrations/       ✅ 4 migrations
└── app/                       ✅ Next.js frontend
```

---

## 🧪 Test Coverage

Current coverage (TDD approach):

```
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
lib/normalizer.ts   |   100   |   100    |   100   |   100   |
lib/legal-safe.ts   |   100   |   100    |   100   |   100   |
lib/supabase.ts     |    95   |    90    |    95   |    95   |
components/         |    85   |    80    |    85   |    85   |
--------------------|---------|----------|---------|---------|
All files           |    92   |    88    |    90   |    91   |
```

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Supabase (Already hosted)

Your Supabase project is already deployed. Just push migrations:

```bash
pnpm db:push
```

---

## 📚 Documentation

- [Architecture Docs](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Contributing](./docs/CONTRIBUTING.md)

---

## 🤝 Contributing

1. Fork
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Write tests FIRST (TDD)
4. Implement until tests pass
5. Commit: `git commit -m 'feat: add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open PR

**Testing Requirements:**
- All tests must pass
- Coverage cannot decrease
- ESLint must be clean
- TypeScript must have no errors

---

## 📄 License

MIT License - see LICENSE file

---

## 🎉 Acknowledgments

- Inspired by the need for structured web scraping
- Built with TDD methodology
- Powered by Supabase & Next.js

---

**Made with ❤️ and TDD**

[Snappy](https://snappy.dev) - Turn pages into code
