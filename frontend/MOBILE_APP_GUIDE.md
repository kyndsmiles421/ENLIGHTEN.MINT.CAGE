# The Cosmic Collective — Mobile App Store Guide

## Overview
Your app is fully configured with **Capacitor** to be wrapped as a native iOS and Android app. Your existing React code, styles, backend connection, and all features remain 100% intact.

---

## What's Already Done (in this codebase)
- Capacitor core + plugins installed
- `capacitor.config.ts` configured with your app ID, theme colors, splash screen, status bar, push notifications, and keyboard handling
- App ID: `com.cosmiccollective.app`

---

## Steps to Build for App Stores

### Prerequisites (on your local machine)
- **Node.js 18+**
- **For iOS**: macOS + Xcode 15+ + Apple Developer Account ($99/year)
- **For Android**: Android Studio + JDK 17 + Google Play Developer Account ($25 one-time)

### 1. Clone your repo and install dependencies
```bash
cd frontend
yarn install
```

### 2. Build the production web app
```bash
yarn build
```

### 3. Add native platforms
```bash
npx cap add ios
npx cap add android
```
This creates `ios/` and `android/` folders with the native projects.

### 4. Sync your web build into native projects
```bash
npx cap sync
```
Run this every time you update your web code.

### 5. Set your production API URL
In `capacitor.config.ts`, you can add a `server.url` if you want to point to your live deployed backend instead of bundling the build:
```ts
server: {
  url: 'https://your-production-domain.com',
  cleartext: false,
}
```
Or leave it as-is to use the bundled `build/` folder (recommended for store apps).

Make sure your `frontend/.env` has the production `REACT_APP_BACKEND_URL` before running `yarn build`.

---

## iOS (App Store)

### Open in Xcode
```bash
npx cap open ios
```

### Configure in Xcode
1. **Signing**: Select your Apple Developer Team under Signing & Capabilities
2. **Bundle ID**: Verify it shows `com.cosmiccollective.app`
3. **App Icons**: Replace the icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/` with your cosmic branding (1024x1024 master icon needed)
4. **Splash Screen**: Replace `ios/App/App/Assets.xcassets/Splash.imageset/` with your splash image
5. **Display Name**: Already set to "The Cosmic Collective"

### Build & Submit
1. Select a physical device or "Any iOS Device" as build target
2. Product → Archive
3. Distribute App → App Store Connect
4. Complete your App Store Connect listing (screenshots, description, category: Health & Fitness)

### Recommended App Store Category
- Primary: **Health & Fitness**
- Secondary: **Lifestyle**

---

## Android (Google Play)

### Open in Android Studio
```bash
npx cap open android
```

### Configure in Android Studio
1. **App Icons**: Replace `android/app/src/main/res/mipmap-*/` with your cosmic icons (use Android Studio's Image Asset tool)
2. **Splash Screen**: The dark background (#0B0C15) is already configured
3. **Signing**: Create a release keystore for Play Store submission

### Build Release APK/AAB
```bash
cd android
./gradlew bundleRelease
```
The `.aab` file will be at `android/app/build/outputs/bundle/release/`

### Submit to Google Play
1. Go to Google Play Console
2. Create app → Upload your `.aab`
3. Complete listing (screenshots, description, category: Health & Fitness)

---

## App Icon Sizes Needed

### iOS
| Size | Usage |
|------|-------|
| 1024x1024 | App Store |
| 180x180 | iPhone App Icon |
| 167x167 | iPad Pro |
| 152x152 | iPad |
| 120x120 | iPhone Spotlight |

### Android
| Size | Density |
|------|---------|
| 192x192 | xxxhdpi |
| 144x144 | xxhdpi |
| 96x96 | xhdpi |
| 72x72 | hdpi |
| 48x48 | mdpi |
| 512x512 | Play Store |

---

## Useful Commands Reference
```bash
# Build web app
yarn build

# Sync web → native
npx cap sync

# Open iOS project
npx cap open ios

# Open Android project  
npx cap open android

# Live reload during development (connects to dev server)
npx cap run ios --livereload --external
npx cap run android --livereload --external

# Update Capacitor plugins
npx cap update
```

---

## Push Notifications Setup
The `@capacitor/push-notifications` plugin is installed. To activate:
- **iOS**: Enable Push Notifications capability in Xcode, configure APNs key in Apple Developer Portal
- **Android**: Add `google-services.json` from Firebase Console to `android/app/`

---

## Notes
- Your PWA service worker (`sw.js`) works alongside Capacitor — offline support carries over
- All Web Audio API sounds (ambient soundscapes, UI sounds) work in native shells
- Three.js Star Chart renders via WebGL inside the native WebView — fully supported
- The dark theme (#0B0C15) is set as the native background so there's no white flash on load
