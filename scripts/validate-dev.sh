#!/bin/bash
# =============================================================================
# validate-dev.sh — ITSM-006-8 : Validate Development Environment
# =============================================================================
# Vérifie que l'environnement de développement est correctement configuré.
# Usage : bash scripts/validate-dev.sh
# =============================================================================

set -e

ERRORS=0
WARNINGS=0

pass() { echo "  ✅ $1"; }
warn() { echo "  ⚠️  $1"; WARNINGS=$((WARNINGS + 1)); }
fail() { echo "  ❌ $1"; ERRORS=$((ERRORS + 1)); }
section() { echo ""; echo "── $1 ──────────────────────────────────"; }

echo "🔍 Validating ITSM development environment..."

# =============================================================================
# 1. Tools
# =============================================================================
section "Tools"

if command -v node &>/dev/null; then
  NODE_VERSION=$(node --version)
  pass "Node.js $NODE_VERSION"
else
  fail "Node.js not found — install Node.js 20+"
fi

if command -v npm &>/dev/null; then
  pass "npm $(npm --version)"
else
  fail "npm not found"
fi

if command -v docker &>/dev/null; then
  pass "Docker $(docker --version | awk '{print $3}' | tr -d ',')"
else
  warn "Docker not found — required for containerized development"
fi

if command -v git &>/dev/null; then
  pass "Git $(git --version | awk '{print $3}')"
else
  fail "Git not found"
fi

# =============================================================================
# 2. Environment files
# =============================================================================
section "Environment files"

[ -f "backend/.env" ] && pass "backend/.env exists" || fail "backend/.env missing — run: copy backend/.env.example backend/.env"
[ -f "frontend/.env" ] && pass "frontend/.env exists" || warn "frontend/.env missing — run: copy frontend/.env.example frontend/.env"
[ -f ".env" ] && pass ".env (root) exists" || warn ".env (root) missing — run: copy .env.example .env"

# =============================================================================
# 3. Dependencies
# =============================================================================
section "Dependencies"

[ -d "backend/node_modules" ] && pass "backend/node_modules installed" || fail "backend/node_modules missing — run: cd backend && npm install"
[ -d "frontend/node_modules" ] && pass "frontend/node_modules installed" || fail "frontend/node_modules missing — run: cd frontend && npm install"

# =============================================================================
# 4. TypeScript
# =============================================================================
section "TypeScript"

if cd backend && npx tsc --noEmit &>/dev/null; then
  pass "Backend TypeScript OK"
else
  fail "Backend TypeScript errors — run: cd backend && npx tsc --noEmit"
fi
cd ..

if cd frontend && npx tsc --noEmit &>/dev/null; then
  pass "Frontend TypeScript OK"
else
  fail "Frontend TypeScript errors — run: cd frontend && npx tsc --noEmit"
fi
cd ..

# =============================================================================
# 5. Lint
# =============================================================================
section "Lint"

if cd backend && npx eslint src/ &>/dev/null; then
  pass "Backend ESLint OK"
else
  fail "Backend ESLint errors — run: cd backend && npx eslint src/"
fi
cd ..

if cd frontend && npx eslint src/ &>/dev/null; then
  pass "Frontend ESLint OK"
else
  fail "Frontend ESLint errors — run: cd frontend && npx eslint src/"
fi
cd ..

# =============================================================================
# 6. Docker services
# =============================================================================
section "Docker services"

if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "itsm-db"; then
    pass "itsm-db container running"
  else
    warn "itsm-db not running — run: docker-compose up db"
  fi

  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "itsm-backend"; then
    pass "itsm-backend container running"
  else
    warn "itsm-backend not running — run: docker-compose up"
  fi
else
  warn "Docker not running — start Docker Desktop"
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "════════════════════════════════════════"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ Environment is fully operational — ready for development!"
elif [ $ERRORS -eq 0 ]; then
  echo "⚠️  Environment OK with $WARNINGS warning(s)"
else
  echo "❌ $ERRORS error(s) and $WARNINGS warning(s) found — fix before developing"
  exit 1
fi
