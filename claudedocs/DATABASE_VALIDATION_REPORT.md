# Snappy Platform Database Validation Report

**Date**: 2026-01-25
**Database**: Supabase (nqzhxukuvmdlpewqytpv)
**Validator**: Backend Architect Agent

---

## Executive Summary

| Check | Status | Notes |
|-------|--------|-------|
| Table exists | PASS | `snappy_snapshots` exists with correct structure |
| Column structure | PASS | All expected columns present |
| RLS enabled | PASS | Row Level Security is enabled |
| Anon read policy | FAIL | Policy exists but returns 0 rows |
| Indexes | PARTIAL | Expected indexes defined in migration |
| Data integrity | WARN | System user profile missing |
| Total snapshots | 47 | All owned by system user |

---

## 1. Table Structure Validation

### Expected vs Actual Columns

| Column | Expected Type | Actual | Status |
|--------|---------------|--------|--------|
| id | UUID (PK) | UUID | PASS |
| user_id | UUID (FK) | UUID | PASS |
| url | TEXT NOT NULL | TEXT | PASS |
| title | TEXT | TEXT | PASS |
| raw_data | JSONB NOT NULL | JSONB | PASS |
| created_at | TIMESTAMPTZ | TIMESTAMPTZ | PASS |

**Result**: All columns match expected schema.

### Constraints

| Constraint | Expected | Actual | Status |
|------------|----------|--------|--------|
| Primary Key | `id` | Present | PASS |
| Foreign Key | `user_id -> snappy_profiles(id)` | REMOVED | INFO |
| URL not empty | `CHECK (length(url) > 0)` | Present | PASS |
| user_id NOT NULL | Required | Still enforced | PASS |

**Note**: Foreign key constraint was intentionally removed per `solucion-final.sql` to allow extension to save snapshots without authenticated users.

---

## 2. Row Level Security (RLS)

### RLS Status

```
Table: snappy_snapshots
RLS Enabled: YES
```

### Expected Policies (from migration)

| Policy | Operation | Target | Status |
|--------|-----------|--------|--------|
| Users can view own snapshots | SELECT | authenticated | UNKNOWN |
| Users can insert own snapshots | INSERT | authenticated | UNKNOWN |
| Users can update own snapshots | UPDATE | authenticated | UNKNOWN |
| Users can delete own snapshots | DELETE | authenticated | UNKNOWN |
| Allow anonymous read of system snapshots | SELECT | anon | FAIL |

### Anon Access Test Results

```
Test: Anonymous user reading system user snapshots
Expected: Should return 47 snapshots (all belong to system user)
Actual: Returns 0 snapshots
Status: FAIL
```

**Root Cause Analysis**:
The policy `Allow anonymous read of system snapshots` from `002_allow_anonymous_read.sql` may not have been applied to the production database.

---

## 3. Index Validation

### Expected Indexes (from migration)

| Index Name | Columns | Purpose |
|------------|---------|---------|
| idx_snappy_snapshots_user_id | user_id | Filter by user |
| idx_snappy_snapshots_url | url | URL lookups |
| idx_snappy_snapshots_created_at | created_at DESC | Recent snapshots |

**Status**: Cannot verify via client API. Recommend checking via Supabase Dashboard or SQL Editor.

---

## 4. Data Statistics

### Snapshot Counts

| Metric | Value |
|--------|-------|
| Total snapshots | 47 |
| Unique URLs | 25 |
| System user snapshots | 47 |
| Regular user snapshots | 0 |

### Related Tables

| Table | Row Count | Status |
|-------|-----------|--------|
| snappy_profiles | 0 | WARN - System user missing |
| snappy_snapshots | 47 | OK |
| snappy_normalized_snapshots | 43 | OK |
| snappy_projects | 0 | OK (empty) |
| snappy_project_snapshots | 0 | OK (empty) |

---

## 5. Data Integrity Issues

### Issue 1: System User Profile Missing

**Problem**: The system user profile (`00000000-0000-0000-0000-000000000000`) does not exist in `snappy_profiles`, yet 47 snapshots reference this user_id.

**Impact**:
- Foreign key constraint was removed to work around this
- Anon RLS policy may not function correctly

**Resolution**: Run the following SQL:

```sql
INSERT INTO public.snappy_profiles (id, email, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system@snappy.local',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
```

### Issue 2: Anon RLS Policy Not Working

**Problem**: Anonymous users cannot read system user snapshots.

**Resolution**: Apply or verify the policy:

```sql
-- Drop existing policy if any
DROP POLICY IF EXISTS "Allow anonymous read of system snapshots" ON public.snappy_snapshots;

-- Create policy
CREATE POLICY "Allow anonymous read of system snapshots"
  ON public.snappy_snapshots FOR SELECT
  TO anon
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
```

---

## 6. Security Assessment

### Positive Findings

1. RLS is enabled on all snappy_ tables
2. Anonymous INSERT is correctly blocked
3. Service role bypasses RLS as expected

### Concerns

1. Foreign key constraint removed (reduces referential integrity)
2. Anon read policy not functioning (may affect public API)

---

## 7. Recommendations

### Critical (Fix Immediately)

1. **Apply anon read policy** - Run migration 002 or manually apply the policy
2. **Create system user profile** - Required for proper data integrity

### Important (Fix Soon)

3. **Verify indexes exist** - Check via Supabase Dashboard > Table Editor > Indexes
4. **Consider restoring FK constraint** - After creating system user profile

### Nice to Have

5. **Add monitoring** - Track RLS policy effectiveness
6. **Add UNIQUE constraint on URL per user** - Prevent duplicate snapshots

---

## 8. Fix Script

Run the following in Supabase SQL Editor to resolve critical issues:

```sql
-- 1. Create system user profile
INSERT INTO public.snappy_profiles (id, email, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system@snappy.local',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Verify/Create anon read policy for snapshots
DROP POLICY IF EXISTS "Allow anonymous read of system snapshots" ON public.snappy_snapshots;

CREATE POLICY "Allow anonymous read of system snapshots"
  ON public.snappy_snapshots FOR SELECT
  TO anon
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- 3. Verify/Create anon read policy for normalized snapshots
DROP POLICY IF EXISTS "Allow anonymous read of system normalized snapshots" ON public.snappy_normalized_snapshots;

CREATE POLICY "Allow anonymous read of system normalized snapshots"
  ON public.snappy_normalized_snapshots FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.snappy_snapshots
      WHERE snappy_snapshots.id = snappy_normalized_snapshots.snapshot_id
      AND snappy_snapshots.user_id = '00000000-0000-0000-0000-000000000000'::uuid
    )
  );

-- 4. Verify changes
SELECT id, email FROM public.snappy_profiles WHERE id = '00000000-0000-0000-0000-000000000000';

SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'snappy_snapshots' AND policyname LIKE '%anonymous%';
```

---

## Appendix: Verification Commands

After applying fixes, verify with:

```bash
# Test anon access
npx tsx -e "
const { createClient } = require('@supabase/supabase-js')
const client = createClient(
  'https://nqzhxukuvmdlpewqytpv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xemh4dWt1dm1kbHBld3F5dHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTk0MDksImV4cCI6MjA2MjIzNTQwOX0.9raKtf_MAUoZ7lUOek4lazhWTfmxPvufW1-al82UHmk'
)
const { data, count } = await client.from('snappy_snapshots').select('*', { count: 'exact' }).limit(5)
console.log('Anon can read:', count, 'snapshots')
"
```

---

**Report Generated**: 2026-01-25
**Next Review**: After applying recommended fixes
