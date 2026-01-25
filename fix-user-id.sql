-- Fix user_id constraint to allow anonymous snapshots
-- This allows the Chrome extension to save snapshots without authentication

-- Step 1: Drop existing NOT NULL constraint
ALTER TABLE public.snappy_snapshots
ALTER COLUMN user_id DROP NOT NULL;

-- Step 2: Verify the change
SELECT
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'snappy_snapshots'
  AND column_name = 'user_id';

-- Expected result: is_nullable = 'YES'
