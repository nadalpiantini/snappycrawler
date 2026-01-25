# Snappy Platform - Development Guide

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm (recommended) or npm
- Supabase account (free tier)
- Git

### 1. Clone & Install

```bash
cd /Users/nadalpiantini/Dev/snappy-platform
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Setup

```bash
# Create Supabase project first, then:
pnpm db:push
pnpm db:seed  # Optional: add sample data
```

### 4. Start Development

```bash
pnpm dev
```

Visit: http://localhost:3000

---

## Testing (TDD)

### Run All Tests

```bash
pnpm test
```

### Watch Mode

```bash
pnpm test:watch
```

### Coverage

```bash
pnpm test:coverage
```

**Target**: 80%+ coverage

### Test Structure

```
frontend/tests/
├── setup.ts              # Test configuration
├── normalize.test.ts     # Normalizer tests
├── legal-safe.test.ts    # Sanitizer tests
└── supabase.test.ts      # Database client tests
```

### TDD Workflow

1. **Write Test** (RED)
   ```bash
   pnpm test:watch  # Test fails
   ```

2. **Implement** (GREEN)
   ```typescript
   // Write minimum code to pass
   ```

3. **Refactor** (REFACTOR)
   ```typescript
   // Clean up while tests pass
   ```

---

## Coding Standards

### TypeScript

- **Strict mode enabled**
- **No `any` types** (use `unknown` if needed)
- **Explicit return types** for public functions

```typescript
// ✅ Good
function normalizeSnapshot(raw: RawSnapshot): NormalizedSnapshot {
  return { ... }
}

// ❌ Bad
function normalizeSnapshot(raw) {
  return { ... }
}
```

### React Components

- **Functional components** with hooks
- **TypeScript props** interfaces
- **Client components** marked with `'use client'`

```typescript
'use client'

interface Props {
  snapshot: RawSnapshot
  onUpload: (data: RawSnapshot) => void
}

export function Component({ snapshot, onUpload }: Props) {
  return <div>...</div>
}
```

### File Naming

- **Components**: PascalCase (e.g., `SnapshotUploader.tsx`)
- **Utilities**: camelCase (e.g., `normalizeSnapshot.ts`)
- **Tests**: `.test.ts` suffix (e.g., `normalize.test.ts`)

### Imports

**Order**:
1. React imports
2. Third-party libraries
3. Local components (alias `@/`)
4. Types
5. Styles

```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RawSnapshot } from '@/lib/types'
import './styles.css'
```

---

## Git Workflow

### Branching

```
main          ──── Production releases
  ├── develop  ──── Integration branch
      ├── feature/xxx
      ├── bugfix/xxx
      └── hotfix/xxx
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add snapshot uploader component
fix: resolve normalization bug
docs: update architecture documentation
test: add tests for legal-safe sanitizer
refactor: improve normalizer performance
```

### Pull Request Process

1. Create feature branch
2. Implement with tests
3. Ensure all tests pass
4. Run `pnpm typecheck` and `pnpm lint`
5. Create PR with description
6. Request review
7. Address feedback
8. Merge when approved

---

## Project Structure

```
snappy-platform/
├── frontend/                   # Next.js app
│   ├── app/                   # App Router pages
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── SnapshotUploader.tsx
│   │   └── SnapshotViewer.tsx
│   ├── lib/                   # Utilities & logic
│   │   ├── normalizer.ts
│   │   ├── legal-safe.ts
│   │   ├── supabase/
│   │   └── utils.ts
│   └── tests/                # Test files
│
├── supabase/                  # Backend
│   ├── functions/            # Edge Functions
│   └── migrations/           # Database schema
│
├── extension/                # Chrome Extension
│   ├── manifest.json
│   └── content.js
│
├── bookmarklet/              # Mobile alternative
│   └── snapshot.js
│
└── scripts/                  # Utility scripts
    ├── normalize.js
    └── seed-db.js
```

---

## Adding New Features

### 1. Frontend Component

```bash
# Create component
touch frontend/components/MyComponent.tsx

# Add tests
touch frontend/tests/my-component.test.tsx

# Write TDD
pnpm test:watch
```

### 2. Database Migration

```sql
-- supabase/migrations/002_add_feature.sql
CREATE TABLE new_table (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  -- columns
);

ALTER TABLE existing_table ADD COLUMN new_column TEXT;
```

```bash
pnpm db:push
```

### 3. Edge Function

```bash
mkdir supabase/functions/my-function
```

```typescript
// supabase/functions/my-function/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { data } = await req.json()

  return new Response(
    JSON.stringify({ result: data }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

```bash
supabase functions deploy my-function
```

---

## Debugging

### Frontend

```typescript
// Add console.log with emoji
console.log('📸 Snapshot:', snapshot)
console.error('❌ Error:', error)

// Use React DevTools
// Use browser debugger (F12)
```

### Backend

```bash
# View Supabase logs
supabase functions logs my-function

# Check database
supabase db reset --dry-run
```

### Database

```sql
-- Query via Supabase SQL Editor
SELECT * FROM snapshots ORDER BY created_at DESC LIMIT 10;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'snapshots';
```

---

## Performance Tips

### Frontend

- **Use React.memo()** for expensive components
- **Code splitting** with `dynamic()`
- **Image optimization** with Next.js Image
- **Lazy loading** below fold

### Backend

- **Index frequently queried columns**
- **Use JSONB efficiently**
- **Enable query caching**
- **Batch operations**

---

## Common Tasks

### Add New Normalization Rule

1. Update `frontend/lib/normalizer.ts`
2. Add test case in `normalize.test.ts`
3. Run `pnpm test`
4. Commit changes

### Update Database Schema

1. Create migration: `migrations/002_update.sql`
2. Run `pnpm db:push`
3. Update types if needed
4. Test locally

### Deploy to Production

```bash
# Frontend
vercel --prod

# Backend (Supabase already deployed)
pnpm db:push
```

---

## Getting Help

### Documentation

- [README.md](../README.md) - Overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [API.md](./API.md) - API reference

### Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Community

- GitHub Issues
- Discussions
- Discord (coming soon)

---

**Happy Coding! 🚀**

Remember: TDD, commit often, stay safe.
