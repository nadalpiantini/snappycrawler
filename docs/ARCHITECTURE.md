# Snappy Platform - Architecture

## Overview

Snappy is a full-stack platform that captures web page structure and transforms it into clean, functional code specifications.

```
┌─────────────────────────────────────────────────────────────┐
│                    SNAPPY ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │  CAPTURE     │    │  PROCESS     │    │  GENERATE    │ │
│  │              │    │              │    │              │ │
│  │ - Extension  │───▶│ - Normalize  │───▶│ - Code       │ │
│  │ - Bookmarklet│    │ - Sanitize   │    │ - Deploy     │ │
│  │ - Manual     │    │ - Analyze    │    │ - Export     │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│                             │                  │           │
│                             ▼                  ▼           │
│                     ┌──────────────┐    ┌──────────────┐ │
│                     │  DATABASE    │    │   STORAGE    │ │
│                     │  PostgreSQL  │    │  Snapshots   │ │
│                     │  (Supabase)  │    │  Exports     │ │
│                     └──────────────┘    └──────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
| Technology | Purpose | Why |
|------------|---------|-----|
| **Next.js 15** | React Framework | App Router, RSC, React 19 |
| **TypeScript 5** | Type Safety | Catch errors at compile time |
| **Tailwind CSS** | Styling | Rapid development, consistent |
| **shadcn/ui** | Component Library | Accessible, customizable |
| **React Query** | Data Fetching | Caching, background updates |
| **Zustand** | State Management | Lightweight, simple |

### Backend
| Technology | Purpose | Why |
|------------|---------|-----|
| **Supabase** | Backend-as-a-Service | Auth, Database, Edge Functions |
| **PostgreSQL** | Database | JSONB support, relational |
| **Row Level Security** | Security | Multi-tenant data isolation |

### Development
| Technology | Purpose | Why |
|------------|---------|-----|
| **Vitest** | Testing | Fast, native ESM |
| **TypeScript** | Type Checking | 100% type safety |
| **ESLint** | Linting | Code quality |
| **Prettier** | Formatting | Consistent style |

## Data Flow

### 1. Capture Phase

```
User Action (Click Extension)
        ↓
content.js injects script
        ↓
Capture HTML + Text + UX Events
        ↓
Create JSON blob
        ↓
Download snapshot.json
```

### 2. Process Phase

```
Upload snapshot.json
        ↓
Validate structure
        ↓
normalizeSnapshot()
        ↓
Extract sections (text analysis)
        ↓
Infer components (HTML parsing)
        ↓
Extract UX flows (event sequence)
        ↓
Save to database
```

### 3. Generate Phase

```
User clicks "Generate Code"
        ↓
Fetch normalized snapshot
        ↓
Build optimized prompt
        ↓
Send to Claude API
        ↓
Stream response
        ↓
Generate downloadable files
```

## Database Schema

### Tables

```sql
profiles          -- User profiles
snapshots         -- Raw page snapshots
normalized        -- Normalized structure
projects          -- Group snapshots
legal_safe        -- Sanitized versions
```

### Relationships

```
profiles (1) ────< (N) snapshots
        │                     │
        │                     │
        └─── projects (1) ───< (N) project_snapshots (N) ────┘
```

## Key Algorithms

### 1. Text Extraction

```javascript
// Extract visible text from leaf nodes only
const visibleText = Array.from(document.querySelectorAll("body *"))
  .filter(el => el.children.length === 0)
  .map(el => el.innerText?.trim())
  .filter(Boolean)
```

**Why**: Captures user-visible text, excludes markup

### 2. Component Inference

```javascript
// Detect components by HTML patterns
const hasForm = html.includes('<form')
const hasButton = html.includes('<button')
const hasNav = html.includes('<nav')
```

**Why**: Simple pattern matching, extensible

### 3. UX Flow Extraction

```javascript
// Track events in sequence
events.map((event, index) => ({
  step: index + 1,
  action: event.type,
  target: event.tag,
  label: event.text
}))
```

**Why**: Preserves interaction order

## Security

### Row Level Security (RLS)

Every table has RLS policies:

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own snapshots"
  ON snapshots FOR SELECT
  USING (auth.uid() = user_id);
```

### Data Sanitization

Legal-safe mode removes:
- Brand names and trademarks
- Copyright notices
- Contact information (emails, phones)
- Genericized copy ("Sign up" → "Register")

## Performance

### Optimization Strategies

1. **Database Indexes**
   ```sql
   CREATE INDEX idx_snapshots_user_created
     ON snapshots(user_id, created_at DESC);
   ```

2. **JSONB Queries**
   ```sql
   -- Efficient JSONB operations
   SELECT * FROM snapshots
     WHERE raw_data->>'url' LIKE '%example.com';
   ```

3. **Edge Functions**
   - Server-side processing
   - Close to database
   - Auto-scaling

### Caching Strategy

- React Query: 5min stale time
- Static pages: Next.js ISR
- API responses: Supabase cache

## Testing Strategy

### TDD Approach

```
1. Write test (RED)
2. Implement code (GREEN)
3. Refactor (REFACTOR)
```

### Coverage Targets

| Component | Target | Current |
|-----------|--------|---------|
| Normalizer | 100% | ✅ 100% |
| Legal-Safe | 100% | ✅ 100% |
| Supabase Client | 95% | ✅ 95% |
| UI Components | 80% | 🚧 0% |

## Deployment

### Frontend (Vercel)

```bash
vercel deploy
```

### Backend (Supabase)

```bash
supabase db push
supabase functions deploy
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
CLAUDE_API_KEY=xxx (optional)
```

## Error Handling

### Client-Side

```javascript
try {
  const result = await operation()
} catch (error) {
  // Log to monitoring
  console.error('Operation failed:', error)

  // Show user-friendly message
  toast.error('Something went wrong')
}
```

### Server-Side

```javascript
// Edge Functions
return new Response(
  JSON.stringify({ error: 'Invalid input' }),
  { status: 400 }
)
```

## Monitoring

### Metrics to Track

- Snapshot capture success rate
- Normalization processing time
- API response times
- Error rates by endpoint

### Tools

- Vercel Analytics
- Supabase Dashboard
- (Future) Sentry for error tracking

## Scalability

### Current Capacity (Single Tenant)

| Resource | Limit |
|----------|-------|
| Snapshots | 10,000+ |
| Concurrent users | 100+ |
| Storage | 1GB (free tier) |

### Scaling Strategy

1. **Multi-tenant**: Already built-in (user_id isolation)
2. **Horizontal**: Add more Edge Functions
3. **Vertical**: Upgrade Supabase plan
4. **CDN**: Vercel edge caching

## Future Enhancements

### Phase 2 (Core)
- [ ] User authentication (Supabase Auth)
- [ ] Projects organization
- [ ] Claude API integration
- [ ] Prompt builder

### Phase 3 (Complete)
- [ ] Diff viewer (compare snapshots)
- [ ] Share snapshots (public/private links)
- [ ] Export multiple formats (React, Vue, Svelte)
- [ ] Version history

### Phase 4 (Advanced)
- [ ] AI-powered component detection
- [ ] Automatic accessibility analysis
- [ ] Performance metrics
- [ ] SEO analysis

## Contributing

See [DEVELOPMENT.md](./DEVELOPMENT.md) for:
- Setup instructions
- Coding standards
- Testing guidelines
- PR workflow

---

**Last Updated**: 2025-01-25
**Version**: 1.0.0
