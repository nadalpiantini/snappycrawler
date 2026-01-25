-- Create a system user for anonymous snapshots
-- This allows the extension to save snapshots without authentication

-- Step 1: Create system user profile
INSERT INTO public.snappy_profiles (id, name, email, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'System User',
  'system@snappy.local',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Verify it was created
SELECT * FROM public.snappy_profiles WHERE id = '00000000-0000-0000-0000-000000000000';

-- Expected: 1 row with id = 00000000-0000-0000-0000-000000000000
