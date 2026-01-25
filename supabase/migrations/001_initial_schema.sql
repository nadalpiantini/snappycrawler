-- ============================================
-- SNAPPY PLATFORM - Database Schema (SUJETO10)
-- ============================================
-- Prefijo: snappy_ para todas las tablas
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.snappy_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SNAPSHOTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.snappy_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.snappy_profiles(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT snappy_snapshots_url_not_empty CHECK (length(url) > 0)
);

-- ============================================
-- NORMALIZED SNAPSHOTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.snappy_normalized_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  snapshot_id UUID REFERENCES public.snappy_snapshots(id) ON DELETE CASCADE NOT NULL,
  normalized_data JSONB NOT NULL,
  legal_safe BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.snappy_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.snappy_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT snappy_projects_name_not_empty CHECK (length(name) > 0)
);

-- ============================================
-- PROJECT SNAPSHOTS JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.snappy_project_snapshots (
  project_id UUID REFERENCES public.snappy_projects(id) ON DELETE CASCADE NOT NULL,
  snapshot_id UUID REFERENCES public.snappy_snapshots(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (project_id, snapshot_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_snappy_profiles_email ON public.snappy_profiles(email);

-- Snapshots
CREATE INDEX IF NOT EXISTS idx_snappy_snapshots_user_id ON public.snappy_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_snappy_snapshots_url ON public.snappy_snapshots(url);
CREATE INDEX IF NOT EXISTS idx_snappy_snapshots_created_at ON public.snappy_snapshots(created_at DESC);

-- Normalized Snapshots
CREATE INDEX IF NOT EXISTS idx_snappy_normalized_snapshots_snapshot_id ON public.snappy_normalized_snapshots(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_snappy_normalized_snapshots_legal_safe ON public.snappy_normalized_snapshots(legal_safe);

-- Projects
CREATE INDEX IF NOT EXISTS idx_snappy_projects_user_id ON public.snappy_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_snappy_projects_name ON public.snappy_projects(name);

-- Project Snapshots
CREATE INDEX IF NOT EXISTS idx_snappy_project_snapshots_project_id ON public.snappy_project_snapshots(project_id);
CREATE INDEX IF NOT EXISTS idx_snappy_project_snapshots_snapshot_id ON public.snappy_project_snapshots(snapshot_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.snappy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snappy_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snappy_normalized_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snappy_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snappy_project_snapshots ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles
CREATE POLICY "Users can view own profile"
  ON public.snappy_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.snappy_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.snappy_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Snapshots
CREATE POLICY "Users can view own snapshots"
  ON public.snappy_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snapshots"
  ON public.snappy_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own snapshots"
  ON public.snappy_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own snapshots"
  ON public.snappy_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- Normalized Snapshots
CREATE POLICY "Users can view own normalized snapshots"
  ON public.snappy_normalized_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.snappy_snapshots
      WHERE snappy_snapshots.id = snappy_normalized_snapshots.snapshot_id
      AND snappy_snapshots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert normalized snapshots"
  ON public.snappy_normalized_snapshots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.snappy_snapshots
      WHERE snappy_snapshots.id = snappy_normalized_snapshots.snapshot_id
      AND snappy_snapshots.user_id = auth.uid()
    )
  );

-- Projects
CREATE POLICY "Users can view own projects"
  ON public.snappy_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.snappy_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.snappy_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.snappy_projects FOR DELETE
  USING (auth.uid() = user_id);

-- Project Snapshots
CREATE POLICY "Users can view own project snapshots"
  ON public.snappy_project_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.snappy_projects
      WHERE snappy_projects.id = snappy_project_snapshots.project_id
      AND snappy_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert to own projects"
  ON public.snappy_project_snapshots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.snappy_projects
      WHERE snappy_projects.id = snappy_project_snapshots.project_id
      AND snappy_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete from own projects"
  ON public.snappy_project_snapshots FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.snappy_projects
      WHERE snappy_projects.id = snappy_project_snapshots.project_id
      AND snappy_projects.user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Profiles updated_at
CREATE TRIGGER update_snappy_profiles_updated_at
  BEFORE UPDATE ON public.snappy_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Projects updated_at
CREATE TRIGGER update_snappy_projects_updated_at
  BEFORE UPDATE ON public.snappy_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function: Get snapshot with normalized data
CREATE OR REPLACE FUNCTION get_snappy_snapshot_with_normalized(p_snapshot_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_snapshot JSONB;
  v_normalized JSONB;
BEGIN
  -- Get snapshot
  SELECT row_to_json(s) INTO v_snapshot
  FROM public.snappy_snapshots s
  WHERE s.id = p_snapshot_id;

  -- Get normalized data
  SELECT row_to_json(n) INTO v_normalized
  FROM public.snappy_normalized_snapshots n
  WHERE n.snapshot_id = p_snapshot_id
  LIMIT 1;

  -- Merge results
  RETURN COALESCE(
    v_snapshot || '{"normalized":' || COALESCE(v_normalized::TEXT, 'null') || '}',
    v_snapshot
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA (optional)
-- ============================================

-- Create demo user function (for testing)
CREATE OR REPLACE FUNCTION create_snappy_demo_user()
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- This would be called from a backend script with proper auth
  v_user_id := uuid_generate_v4();

  INSERT INTO public.snappy_profiles (id, email)
  VALUES (v_user_id, 'demo@snappy.dev');

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;
