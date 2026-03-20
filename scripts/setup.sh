#!/bin/bash

# ============================================
# SNAPPY PLATFORM - Setup Script
# ============================================

set -e

echo "🚀 Snappy Platform - Setup"
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed"
    echo "Install it: npm install -g pnpm"
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found"
    echo "Copy .env.example to .env.local and add your Supabase credentials"
    exit 1
fi

echo "✅ Dependencies check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Push database schema to Supabase:"
echo "   - Go to https://nqzhxukuvmdlpewqytpv.supabase.co"
echo "   - Open SQL Editor"
echo "   - Copy and paste the content of supabase/migrations/001_initial_schema.sql"
echo "   - Click Run"
echo ""
echo "2. Start development server:"
echo "   pnpm dev"
echo ""
echo "3. Open http://localhost:3000"
echo ""
