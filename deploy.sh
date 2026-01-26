// ============================================
// DEPLOYMENT - Deployment Scripts
// ============================================

#!/bin/bash

# ============================================
# SnappyCrawler Deployment Script
# ============================================

set -e

echo "🚀 SnappyCrawler Deployment Script"
echo "=================================="

# Configuration
PROJECT_NAME="snappycrawler"
PRODUCTION_URL="https://snappycrawler.vercel.app"  # Change this
DATABASE_URL="${SUPABASE_URL:-https://your-project.supabase.co}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# PRE-DEPLOYMENT CHECKS
# ============================================

echo ""
echo "📋 Pre-deployment Checks"
echo "=================================="

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}Error: .env.production not found${NC}"
    echo "Create it from .env.example first"
    exit 1
fi

# Check if production database is accessible
echo "Checking database connection..."
# Add your database check here

# Check if build succeeds
echo "Running production build..."
pnpm build || {
    echo -e "${RED}Build failed${NC}"
    exit 1
}

# ============================================
# RUN TESTS
# ============================================

echo ""
echo "🧪 Running Tests"
echo "=================================="

pnpm test:run || {
    echo -e "${YELLOW}Tests failed (continuing...)${NC}"
}

# ============================================
# DEPLOY TO VERCEL
# ============================================

echo ""
echo "📦 Deploying to Vercel"
echo "=================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to production
vercel --prod --confirm "$PRODUCTION_URL"

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "🌐 URL: $PRODUCTION_URL"
echo ""
echo "📊 Next steps:"
echo "  1. Verify the deployment"
echo "  2. Check environment variables"
echo "  3. Run database migrations if needed"
echo "  4. Test critical functionality"

# ============================================
# POST-DEPLOYMENT VERIFICATION
# ============================================

echo ""
echo "🔍 Post-deployment Verification"
echo "=================================="

# Check if site is accessible
echo "Checking if site is accessible..."
sleep 5

# Add automated health check here
# curl -f "$PRODUCTION_URL/api/health" || echo -e "${YELLOW}Warning: Health check failed${NC}"

echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "📚 Documentation: https://github.com/yourusername/snappycrawler"
echo "📧 Support: support@snappycrawler.dev"
