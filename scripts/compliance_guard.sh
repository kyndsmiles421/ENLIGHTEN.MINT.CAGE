#!/usr/bin/env bash
# /app/scripts/compliance_guard.sh
# V1.2.2 — Compliance & Code-Hygiene CI Guard
#
# Run this before every deploy and as a pre-commit hook.
# Fails (exit 1) if it finds:
#   1. Empty catch blocks    (silent failures = malpractice)
#   2. User-visible medical-claim terms in render-path JSX
#
# Intentionally allowed:
#   - Annotated catches: } catch { /* SSR-safe */ }, /* graceful */
#   - Legal-shield files: MedicalDisclaimerSplash, WellnessDisclaimer, TermsPage
#   - Internal route paths and programmatic ID keys

set -e
cd "$(dirname "$0")/.."

FAIL=0
SRC_DIR="frontend/src"

echo "═══════════════════════════════════════════════════════════"
echo "ENLIGHTEN.MINT.CAFE — V1.2.2 Compliance & Hygiene CI Guard"
echo "═══════════════════════════════════════════════════════════"

# ──────────────────────────────────────────────────────────────
# 1. EMPTY CATCH BLOCK PURGE
# ──────────────────────────────────────────────────────────────
echo ""
echo "[1/2] Empty catch blocks…"
EMPTY_CATCH=$(grep -rnE "\} catch \{\s*\}|\} catch \(\w+\) \{\s*\}|\} catch \{\s*/\*\s*noop\s*\*/\s*\}" \
  "$SRC_DIR" --include="*.js" --include="*.jsx" 2>/dev/null || true)

if [ -n "$EMPTY_CATCH" ]; then
  echo "❌ FAIL — Empty catch blocks found (silent failures forbidden):"
  echo "$EMPTY_CATCH"
  echo ""
  echo "→ Replace with: } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }"
  echo "→ Or document with: } catch { /* SSR-safe */ } or /* graceful */"
  FAIL=1
else
  echo "✅ Pass — no silent catches."
fi

# ──────────────────────────────────────────────────────────────
# 2. MEDICAL-CLAIM TERM PURGE (USER-VISIBLE STRINGS)
# ──────────────────────────────────────────────────────────────
echo ""
echo "[2/2] Forbidden medical-claim terms in render strings…"

# Files we EXEMPT (legal shields and intentional API-ID metadata)
EXEMPT='MedicalDisclaimerSplash|WellnessDisclaimer|TermsPage|/api/healing|api/healing|api_healing'

# Look for render-path strings: JSX text children, title=, label=, placeholder=, desc:, name:
# Skip route paths (/light-therapy, /aromatherapy) and programmatic ID keys (id: 'healing')
  # User-facing kicker labels and rendered text
HITS=$(grep -rniE \
    "(title|label|placeholder|description|desc|tagline|subtitle|content|heading|name|message|prompt|narration|caption|kicker)\s*[:=]\s*[\"'][^\"']*\b(healing|therapy|treatment|cure[ds]?|patient[s]?|clinical|aromatherapy|light therapy|chromotherapy)\b" \
    "$SRC_DIR" --include="*.js" --include="*.jsx" 2>/dev/null \
  | grep -viE "$EXEMPT" \
  | grep -viE "Aromatic Resonance|Light Resonance|Resonance|Alignment|Chromatic" \
  | grep -viE "//\s|/\*\s" \
  || true)

# Also catch JSX inline text content (children) like > Chromotherapy <
INLINE=$(grep -rniE \
    ">\s*(Chromotherapy|Light Therapy|Aromatherapy|Reiki Healing|Sound Healing|Crystal Healing)\s*<" \
    "$SRC_DIR" --include="*.js" --include="*.jsx" 2>/dev/null \
  | grep -viE "$EXEMPT" \
  || true)

if [ -n "$HITS" ] || [ -n "$INLINE" ]; then
  echo "❌ FAIL — Medical-claim terms in user-visible strings:"
  [ -n "$HITS" ] && echo "$HITS"
  [ -n "$INLINE" ] && echo "$INLINE"
  echo ""
  echo "→ Approved replacements: Resonance, Alignment, Resonant Arts,"
  echo "                          Aromatic Resonance, Light Resonance, Sound Resonance"
  FAIL=1
else
  echo "✅ Pass — no medical-claim leaks in render path."
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
if [ $FAIL -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED — compliance & hygiene clean."
  exit 0
else
  echo "❌ ONE OR MORE CHECKS FAILED — fix before deploy."
  exit 1
fi
