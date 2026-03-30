# The Cosmic Collective — Native Build Guide

## Prerequisites
- Node.js >= 22.0.0
- Android Studio (for Android builds)
- Xcode 15+ (for iOS builds, macOS only)
- Java 17+ (for Android)

## Setup Steps

### 1. Install Dependencies
```bash
cd frontend
yarn install
```

### 2. Build the Web App
```bash
npx craco build
```

### 3. Add Native Platforms
```bash
npx cap add android
npx cap add ios
```

### 4. Generate App Icons & Splash Screens
The source assets are in `/frontend/resources/`:
- `icon.png` (1024x1024) — App icon
- `splash.png` (1024x1536) — Splash screen

Install the asset generator:
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#0B0C15' --splashBackgroundColor '#0B0C15'
```

### 5. Sync Web Assets to Native
```bash
npx cap sync
```

### 6. Open in IDE
```bash
npx cap open android   # Opens Android Studio
npx cap open ios        # Opens Xcode
```

### 7. Run on Device
```bash
npx cap run android
npx cap run ios
```

## Configuration
All native config is in `capacitor.config.ts`:
- **App ID:** `com.cosmiccollective.app`
- **App Name:** `The Cosmic Collective`
- **Background:** `#0B0C15` (matching dark theme)
- **Splash:** 2.5s auto-hide, immersive, dark bg
- **StatusBar:** Dark style, #0B0C15 bg
- **Haptics:** Enabled (used in CosmicToolbar & SmartDock)
- **Push Notifications:** Badge, sound, alert

## Plugins Integrated
| Plugin | Purpose |
|--------|---------|
| `@capacitor/haptics` | Tactile feedback on toolbar/dock interactions |
| `@capacitor/splash-screen` | Branded launch screen |
| `@capacitor/status-bar` | Dark theme status bar |
| `@capacitor/keyboard` | Body resize on keyboard open |
| `@capacitor/push-notifications` | Push notifications |
| `@capacitor/share` | Native share sheet |
| `@capacitor/browser` | In-app browser |
| `@capacitor/app` | App lifecycle events |

## Notes
- The `webDir` is set to `build` (output of `craco build`)
- Android uses `https` scheme for secure context
- iOS uses automatic content inset for safe areas
- The PWA service worker will be disabled in native mode (Capacitor handles caching)
- **Node 22 via nvm:** Use `nvm use 22` before running Capacitor CLI commands. The dev server runs on Node 20.
- **Platforms synced:** Both `android/` and `ios/` directories are generated with the latest web build.
- To rebuild and re-sync: `nvm use 22 && npx craco build && npx cap sync`
