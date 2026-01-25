#!/bin/bash

# ============================================
# SNAPPY - Schema Installation Guide
# ============================================

echo "📸 Snappy Platform - Database Installation"
echo "============================================="
echo ""

# Show SQL content
echo "📄 SQL Schema to Install:"
echo ""
echo "────────────────────────────────────────────────────────────────────"
cat supabase/migrations/001_initial_schema.sql
echo "────────────────────────────────────────────────────────────────────"
echo ""

# Open Supabase dashboard
echo "🌐 Opening Supabase Dashboard..."
echo ""

open "https://nqzhxukuvmdlpewqytpv.supabase.co"

echo ""
echo "⚠️  STEPS TO FOLLOW:"
echo ""
echo "1. Log in to Supabase (if needed)"
echo "2. Click 'SQL Editor' in left sidebar"
echo "3. Copy the SQL above (between the lines)"
echo "4. Paste in SQL Editor"
echo "5. Click 'Run' (or Ctrl+Enter)"
echo ""
echo "✅ Verify installation:"
echo ""
echo "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'snappy_%';"
echo ""
echo "Expected tables:"
echo "  ✅ snappy_profiles"
echo "  ✅ snappy_snapshots"
echo "  ✅ snappy_normalized_snapshots"
echo "  ✅ snappy_projects"
echo "  ✅ snappy_project_snapshots"
echo ""
echo "📝 SQL saved to: tmp_schema.sql (for easy copy)"
echo ""

# Save SQL to temp file
cp supabase/migrations/001_initial_schema.sql ./tmp_schema.sql

echo "🚀 After installation:"
echo "   pnpm dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
