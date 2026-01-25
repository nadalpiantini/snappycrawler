-- ============================================
-- SNAPPY PLATFORM - Allow Anonymous Read Access
-- ============================================
-- Allows unauthenticated users to read snapshots created by system user
-- System user UUID: 00000000-0000-0000-0000-000000000000
-- ============================================

-- Policy: Allow anonymous users to read system user snapshots
CREATE POLICY "Allow anonymous read of system snapshots"
  ON public.snappy_snapshots FOR SELECT
  TO anon
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Also allow reading normalized snapshots for system user's snapshots
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
