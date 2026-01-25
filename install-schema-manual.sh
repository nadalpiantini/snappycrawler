#!/bin/bash

# ============================================
# SNAPPY - Install Schema (Manual Execution)
# ============================================

echo "📸 Snappy Platform - Schema Installation"
echo "========================================="
echo ""

# Abrir Supabase Dashboard
echo "🌐 Abriendo Supabase Dashboard..."
open "https://nqzhxukuvmdlpewqytpv.supabase.co/project/default/settings/database"

echo ""
echo "⚠️  INSTRUCCIONES:"
echo ""
echo "1. En la página que se abrió, buscar:"
echo "   - 'Connection string' o 'Database password'"
echo "   - 'URI' o 'Connection pooling string'"
echo ""
echo "2. Copiar el password (o el connection string completo)"
echo ""
echo "3. Ejecutar este comando en otra terminal:"
echo ""
echo "   psql 'postgresql://postgres.nqzhxukuvmdlpewqytpv:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres' < supabase/migrations/001_initial_schema.sql"
echo ""
echo "   O con el connection string completo:"
echo ""
echo "   psql '[CONNECTION_STRING_COMPLETO]' < supabase/migrations/001_initial_schema.sql"
echo ""
echo "✅ Verificar instalación:"
echo ""
echo "   psql 'postgresql://postgres.nqzhxukuvmdlpewqytpv:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres' -c \"SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'snappy_%';\""
echo ""
echo "Expected tables:"
echo "   ✅ snappy_profiles"
echo "   ✅ snappy_snapshots"
echo "   ✅ snappy_normalized_snapshots"
echo "   ✅ snappy_projects"
echo "   ✅ snappy_project_snapshots"
echo ""
echo "📝 SQL también guardado en: tmp_schema.sql"
echo ""

# Copy SQL to temp file
cp supabase/migrations/001_initial_schema.sql ./tmp_schema.sql

echo "💡 Tip: Si prefieres hacerlo vía UI:"
echo ""
echo "   1. Ir a: https://nqzhxukuvmdlpewqytpv.supabase.co"
echo "   2. Click 'SQL Editor' (menú izquierdo)"
echo "   3. Copiar contenido de: tmp_schema.sql"
echo "   4. Pegar en SQL Editor"
echo "   5. Click 'Run'"
echo ""
