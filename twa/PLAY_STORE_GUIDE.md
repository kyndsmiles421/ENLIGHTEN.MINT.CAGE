# ENLIGHTEN.MINT.CAFE — Google Play Store Deployment Guide

## Package Details
- **Package Name**: `cafe.enlighten.mint`
- **App Name**: ENLIGHTEN.MINT.CAFE  
- **Short Name**: Enlighten
- **Version**: 1.0.0 (versionCode: 1)
- **Min SDK**: 19 (Android 4.4+)
- **Category**: Health & Fitness

## Signing Key Info
- **Keystore**: `/app/twa/enlighten.keystore`
- **Alias**: `enlighten-key`
- **Password**: `enlighten2026` (CHANGE FOR PRODUCTION)
- **SHA256**: `3E:3A:69:90:70:14:4B:6C:B9:11:23:AE:11:3C:4B:C7:6F:DF:0C:C5:E2:71:CF:36:B8:59:D2:3F:D7:85:77:E2`

## PWA Compliance Status: ALL PASS
- [x] Web App Manifest with name, icons, start_url, display
- [x] Service Worker with fetch handler + offline support
- [x] HTTPS served
- [x] 192x192 icon (any purpose)
- [x] 512x512 icon (any purpose)
- [x] 192x192 maskable icon (safe zone padded)
- [x] 512x512 maskable icon (safe zone padded)
- [x] Offline fallback page
- [x] assetlinks.json configured at /.well-known/
- [x] start_url set to /sovereign-hub
- [x] Background sync for offline submissions
- [x] Push notification capability

## How to Generate AAB

### Option A: PWABuilder (Easiest — No Setup Required)
1. Go to https://www.pwabuilder.com
2. Enter: `https://zero-scale-physics.preview.emergentagent.com`
3. Click "Package for stores" → "Android"
4. Use these settings:
   - Package ID: `cafe.enlighten.mint`
   - App name: `ENLIGHTEN.MINT.CAFE`
   - Version: `1.0.0`
   - Version code: `1`
5. Download the generated `.aab` file
6. Upload to Google Play Console

### Option B: Bubblewrap CLI (Local Build)
```bash
# Prerequisites: Node.js 18+, JDK 17+
npm install -g @bubblewrap/cli

# Run the generator script
cd /app/twa
chmod +x generate-aab.sh
./generate-aab.sh
```

### Option C: Android Studio
1. Import the TWA project from `/app/twa/build/`
2. Build → Generate Signed Bundle/APK
3. Select "Android App Bundle"
4. Use the keystore at `/app/twa/enlighten.keystore`

## Google Play Console Upload Steps
1. Complete identity verification (pending)
2. Create new app
3. Set up store listing:
   - Title: ENLIGHTEN.MINT.CAFE
   - Short description: Sovereign Wellness Engine — Sacred Geometry, Divination, AI Coaching
   - Full description: (see below)
   - Category: Health & Fitness
   - Content rating: Everyone
4. Upload AAB to Production track
5. Submit for review

## Store Listing — Full Description
ENLIGHTEN.MINT.CAFE is a sovereign wellness platform combining ancient wisdom with modern technology.

FEATURES:
- 7 Pillar Navigation: Practice, Divination, Sanctuary, Nourishment, Exploration, AI Coaching, Sovereign Council
- Oracle & Tarot: AI-powered divination readings
- Breathwork & Meditation: Guided sessions with biometric feedback
- Star Charts & Numerology: Personal cosmic mapping
- Sage AI Coach: Personalized spiritual guidance
- Crystal Encryption Skins: Transform your entire interface
- Gamified Economy: Earn Fans through engagement
- Zen Garden & Soundscapes: Immersive relaxation environments
- Dream Journal & Journaling: Track your inner journey
- Community & Teachings: Connect with like-minded seekers

Built on sacred geometry principles with Phi (1.618) mathematics, Fibonacci sequences, and solfeggio frequencies woven into every interaction.

## Digital Asset Links
The `assetlinks.json` is already deployed at:
`https://zero-scale-physics.preview.emergentagent.com/.well-known/assetlinks.json`

If you regenerate the signing key, update the SHA256 fingerprint in:
`/app/frontend/public/.well-known/assetlinks.json`

## Important Notes
- When you deploy to a PRODUCTION domain (not preview), update:
  1. `twa-manifest.json` → host field
  2. `assetlinks.json` → deploy to production domain
  3. Manifest → all URLs
- Keep the keystore file SAFE. If lost, you cannot update the app.
