#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# INFINITY SOVEREIGN — Android Build Script
# Run this on a machine with Node 22+, Java 17+, and Android SDK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

echo "╔═══════════════════════════════════════════════╗"
echo "║  INFINITY SOVEREIGN — Android Build Pipeline  ║"
echo "╚═══════════════════════════════════════════════╝"

# Prerequisites check
echo ""
echo "Checking prerequisites..."
node --version | grep -q "v2[2-9]\|v[3-9]" || { echo "ERROR: Node 22+ required. Current: $(node --version)"; exit 1; }
java --version 2>/dev/null || { echo "ERROR: Java 17+ required for Android build"; exit 1; }
echo "Prerequisites OK"

# Step 1: Production build
echo ""
echo "Step 1/4: Building production bundle..."
cd frontend
GENERATE_SOURCEMAP=false CI=false yarn build
echo "Build complete. Main bundle: $(du -h build/static/js/main.*.js | cut -f1)"

# Step 2: Sync to Capacitor
echo ""
echo "Step 2/4: Syncing to Capacitor Android..."
npx cap sync android
echo "Sync complete"

# Step 3: Generate keystore (if not exists)
KEYSTORE="android/infinity-sovereign.keystore"
if [ ! -f "$KEYSTORE" ]; then
    echo ""
    echo "Step 3/4: Generating upload keystore..."
    echo "IMPORTANT: Remember this password — you cannot recover it!"
    keytool -genkeypair \
        -v \
        -storetype PKCS12 \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass infinity2026 \
        -keypass infinity2026 \
        -alias infinity-sovereign \
        -keystore "$KEYSTORE" \
        -dname "CN=Steven Michael, OU=INFINITY SOVEREIGN, O=Enlighten.Mint.Cafe, L=Rapid City, ST=South Dakota, C=US"
    echo ""
    echo "████████████████████████████████████████████████"
    echo "█  KEYSTORE GENERATED: $KEYSTORE"
    echo "█  BACK THIS FILE UP IMMEDIATELY!"
    echo "█  If you lose it, you cannot update the app."
    echo "████████████████████████████████████████████████"
else
    echo ""
    echo "Step 3/4: Keystore exists at $KEYSTORE"
fi

# Step 4: Build the AAB
echo ""
echo "Step 4/4: Building signed Android App Bundle (.aab)..."
cd android

# Create signing config if not in gradle
if ! grep -q "infinity-sovereign" app/build.gradle; then
    echo "Adding signing config to build.gradle..."
fi

./gradlew bundleRelease \
    -Pandroid.injected.signing.store.file="../$KEYSTORE" \
    -Pandroid.injected.signing.store.password=infinity2026 \
    -Pandroid.injected.signing.key.alias=infinity-sovereign \
    -Pandroid.injected.signing.key.password=infinity2026

AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
if [ -f "$AAB_PATH" ]; then
    echo ""
    echo "╔═══════════════════════════════════════════════╗"
    echo "║  BUILD SUCCESSFUL!                            ║"
    echo "║  .AAB file: android/$AAB_PATH"
    echo "║  Size: $(du -h $AAB_PATH | cut -f1)"
    echo "║                                               ║"
    echo "║  Upload this to Google Play Console:          ║"
    echo "║  Production > Create new release > Upload     ║"
    echo "╚═══════════════════════════════════════════════╝"
else
    echo "ERROR: AAB file not found at $AAB_PATH"
    echo "Check the Gradle output above for errors."
fi
