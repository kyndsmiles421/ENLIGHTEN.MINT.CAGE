#!/usr/bin/env bash
# /app/scripts/install_git_hooks.sh
# One-time installer for the V1.2.4 compliance pre-push hook.
#
# Usage:   bash /app/scripts/install_git_hooks.sh
# Result:  every `git push` runs compliance_guard.sh first.

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_SOURCE="$REPO_ROOT/scripts/pre-push.sh"
HOOK_DEST="$REPO_ROOT/.git/hooks/pre-push"

if [ ! -d "$REPO_ROOT/.git" ]; then
  echo "❌ Not a git repository: $REPO_ROOT"
  exit 1
fi

cp "$HOOK_SOURCE" "$HOOK_DEST"
chmod +x "$HOOK_DEST"

echo "✅ Installed pre-push hook at: $HOOK_DEST"
echo "   Every future 'git push' now runs:"
echo "     1. Static empty-catch scan"
echo "     2. Forbidden medical-term scan"
echo "     3. 9 runtime API serialization tests"
echo ""
echo "   To verify: cd $REPO_ROOT && bash scripts/compliance_guard.sh"
