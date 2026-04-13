#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# ENLIGHTEN.MINT.CAFE — Play Store AAB Generation Script
# ═══════════════════════════════════════════════════════════════
#
# This script generates a signed AAB (Android App Bundle) for
# Google Play Store submission using Bubblewrap CLI.
#
# PREREQUISITES:
#   - Node.js 18+ installed
#   - npm install -g @bubblewrap/cli
#   - Java JDK 17+ installed
#
# USAGE:
#   chmod +x generate-aab.sh
#   ./generate-aab.sh
#
# OUTPUT:
#   ./build/app-release-signed.aab (upload this to Play Console)
#
# ═══════════════════════════════════════════════════════════════

set -e

echo ""
echo "  ═══════════════════════════════════════════"
echo "  ENLIGHTEN.MINT.CAFE — AAB Generator"
echo "  Package: cafe.enlighten.mint"  
echo "  Version: 1.0.0 (versionCode: 1)"
echo "  ═══════════════════════════════════════════"
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js not found. Install from https://nodejs.org"; exit 1; }
command -v java >/dev/null 2>&1 || { echo "ERROR: Java JDK not found. Install JDK 17+"; exit 1; }

# Install bubblewrap if needed
if ! command -v bubblewrap &>/dev/null; then
  echo "Installing @bubblewrap/cli..."
  npm install -g @bubblewrap/cli
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/twa-build"
MANIFEST_URL="https://zero-scale-physics.preview.emergentagent.com/manifest.json"

echo "[1/4] Initializing TWA project..."
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

bubblewrap init --manifest="$MANIFEST_URL" --directory="$BUILD_DIR"

echo ""
echo "[2/4] Copying signing keystore..."
if [ -f "$SCRIPT_DIR/enlighten.keystore" ]; then
  cp "$SCRIPT_DIR/enlighten.keystore" "$BUILD_DIR/enlighten.keystore"
  echo "  Using existing keystore"
else
  echo "  Generating new signing key..."
  keytool -genkeypair \
    -alias enlighten-key \
    -keyalg RSA -keysize 2048 \
    -validity 10000 \
    -keystore "$BUILD_DIR/enlighten.keystore" \
    -storepass enlighten2026 \
    -keypass enlighten2026 \
    -dname "CN=ENLIGHTEN.MINT.CAFE, OU=Sovereign, O=Enlighten Mint, L=Rapid City, ST=SD, C=US"
fi

echo ""
echo "[3/4] Building signed AAB..."
cd "$BUILD_DIR"
bubblewrap build --skipPwaValidation

echo ""
echo "[4/4] Build complete!"
echo ""
echo "  ═══════════════════════════════════════════"
echo "  OUTPUT: $BUILD_DIR/app-release-signed.aab"
echo ""
echo "  NEXT STEPS:"
echo "  1. Log into Google Play Console"
echo "  2. Create new app → ENLIGHTEN.MINT.CAFE"
echo "  3. Go to Release → Production"
echo "  4. Upload the .aab file"
echo "  5. Fill in store listing details"
echo "  ═══════════════════════════════════════════"
echo ""

# Display SHA256 for Digital Asset Links
echo "  IMPORTANT: If using a NEW keystore, update assetlinks.json"
echo "  SHA256 Fingerprint:"
keytool -list -v -keystore "$BUILD_DIR/enlighten.keystore" -storepass enlighten2026 -alias enlighten-key 2>/dev/null | grep "SHA256:" || echo "  (run: keytool -list -v -keystore enlighten.keystore -storepass enlighten2026)"
echo ""
