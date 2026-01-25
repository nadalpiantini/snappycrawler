# 📸 Snappy Platform

**Turn any webpage into structured code specifications**

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

---

## 📊 Database Schema

```sql
profiles          -- User profiles
snapshots         -- Raw page snapshots
normalized        -- Normalized structure
projects          -- Group snapshots
legal_safe        -- Sanitized versions
```

See: `supabase/migrations/001_initial_schema.sql`

---

## 🔐 Features

### ✅ MVP (Phase 1)
- [x] Upload snapshot (drag & drop)
- [x] Normalize automatically
- [x] View snapshot structure
- [x] List all snapshots
- [x] Delete snapshots
- [x] Database persistence

### 🚧 Core (Phase 2)
- [ ] User authentication
- [ ] Multi-tenant support
- [ ] Dashboard with projects
- [ ] Claude API integration
- [ ] Prompt builder
- [ ] Code export

### 🎯 Complete (Phase 3)
- [ ] Diff viewer (compare snapshots)
- [ ] Share snapshots
- [ ] Version history
- [ ] Advanced filters
- [ ] Export multiple formats

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
