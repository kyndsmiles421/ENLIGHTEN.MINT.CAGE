#!/usr/bin/env bash
# .git/hooks/pre-push — V1.2.4 Compliance Gate
#
# Auto-installed by /app/scripts/install_git_hooks.sh
# Blocks any push that fails:
#   • Empty catch block scan
#   • Forbidden medical-claim terms in render strings
#   • Workshop API integration tests (no "undefined", no "Healing Arts" leaks)
#
# To bypass in genuine emergency: git push --no-verify
# (NOT recommended — every bypass becomes a 3am production incident.)

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
GUARD="$REPO_ROOT/scripts/compliance_guard.sh"

if [ ! -x "$GUARD" ]; then
  echo "⚠  compliance_guard.sh not found or not executable; skipping pre-push gate."
  exit 0
fi

echo "🛡  Running compliance guard before push…"
echo ""

# Read REACT_APP_BACKEND_URL from frontend/.env if present so runtime tests
# can hit the live backend; fall back to localhost for offline pushes.
if [ -f "$REPO_ROOT/frontend/.env" ]; then
  export REACT_APP_BACKEND_URL=$(grep '^REACT_APP_BACKEND_URL=' "$REPO_ROOT/frontend/.env" | cut -d '=' -f2)
fi

if "$GUARD"; then
  echo ""
  echo "✅ Compliance gate passed — push allowed."
  exit 0
else
  echo ""
  echo "❌ Compliance gate FAILED — push blocked."
  echo "   Fix the issues above, or bypass with: git push --no-verify"
  exit 1
fi
