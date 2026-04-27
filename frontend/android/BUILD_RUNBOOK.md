# ENLIGHTEN.MINT.CAFE — Production AAB Build Runbook (V68.56)

The build pipeline runs on **your local machine**, not in this preview
environment (which has no JDK + Android SDK). This runbook gives you
the exact, copy-paste sequence.

## Prerequisites (one-time)

- **Java 17 JDK** (`brew install openjdk@17` on Mac)
- **Android Studio Hedgehog (2023.1)** or newer with SDK Platform 34
- **Android Build-Tools 34.0.0**
- Your `enlighten-mint-cafe.keystore` (already in `android/`)
- `keystore.properties` with `storeFile`, `storePassword`,
  `keyAlias`, `keyPassword` filled in (already in `android/app/`)

---

## Step 1 — Production React Build

From repo root:

```bash
cd frontend
yarn install
yarn build       # outputs ./build/  (the webDir Capacitor copies)
```

The `build/` folder is the entire app inside a single bundle.
Webpack already minifies and tree-shakes; the Tuning Panel,
ContextBus, ResonanceAnalyzer, and CrystallineLattice3D all live
inside the chunk-split JS files in `build/static/js/`.

---

## Step 2 — Capacitor Sync (copies `build/` into android/)

```bash
yarn cap sync android
```

This populates `android/app/src/main/assets/public/` with the React
bundle. **After this step, the V68.56 `ignoreAssetsPattern` will
strip ~18 MB of marketing files from the final AAB:**

- `showcase.mp4`, `showcase.webm`     — 7 MB
- `store-assets/`                     — 8.4 MB
- `proof/`, `proof2/`                 — 2.6 MB
- `docs/`, `qr/`, `qr-code.png`       — ~80 KB

Verify the strip by checking the AAB's `base/assets/` after build.

---

## Step 3 — Android Build

```bash
cd android
./gradlew clean
./gradlew bundleRelease       # produces app/build/outputs/bundle/release/app-release.aab
```

V68.56 changes that take effect on this build:

- `minifyEnabled true` → R8 strips unused Capacitor plugin classes
- `shrinkResources true` → unreferenced XML / drawable resources removed
- `proguard-android-optimize.txt` (instead of plain `proguard-android.txt`)
- AAB language / density / ABI splits enabled
- Asset patterns excluded
- versionCode bumped 6 → 7, versionName bumped 1.0.5 → 1.0.6

---

## Step 4 — Inspect the AAB before upload

```bash
# Size check — should be visibly smaller than your last 1.0.5 build
ls -la app/build/outputs/bundle/release/app-release.aab

# Inspect the bundle (uses bundletool)
bundletool dump manifest --bundle app/build/outputs/bundle/release/app-release.aab
bundletool extract-apks --bundle=app/build/outputs/bundle/release/app-release.aab \
    --output=/tmp/preview.apks --mode=universal
```

Sanity verify:
- `showcase.mp4` is **not** present in the extracted APK assets
- `landing.html`, `index.html`, `icon_*.png`, `maskable_*.png` ARE present
- The R3F crystalline lattice JS chunk is in `assets/public/static/js/`

---

## Step 5 — Upload to Play Console (Internal Testing first)

1. Play Console → app → **Testing → Internal testing**
2. Create new release → upload `app-release.aab`
3. Fill release notes (V68.56 changelog from `/app/memory/PRD.md`)
4. **Roll out to internal testers** (NOT production)
5. Verify on at least 3 device architectures:
   - `arm64-v8a` (modern phones)
   - `armeabi-v7a` (older phones)
   - `x86_64` (emulators)

Confirm the 3D lattice renders correctly on each. The R3F canvas
needs WebGL 2.0; fallback to 2D MiniLattice happens automatically
via `SovereignPreferences.visual.crystalFidelity`.

---

## Step 6 — Promote to Production

After internal testers confirm:
1. Internal testing release → **Promote to Production**
2. Staged rollout: 10% → 50% → 100% over 7 days
3. Monitor Crashlytics for `NoClassDefFoundError` (would indicate a
   missing `-keep` rule in `proguard-rules.pro`)

---

## Common Issues

| Symptom | Likely cause | Fix |
|---|---|---|
| `NoClassDefFoundError com.getcapacitor.X` at startup | R8 stripped a plugin class | Add `-keep class com.getcapacitor.X` to `proguard-rules.pro` |
| 3D lattice doesn't render in release but works in debug | WebGL context lost / blocked | Verify `allowMixedContent: true` in `capacitor.config.json` |
| `showcase.mp4 not found` 404 | Web build still references it | It's referenced **only** in marketing pages; safe in AAB |
| Build fails: keystore not found | `keystore.properties` paths wrong | Use absolute path or path relative to `android/app/` |

---

## Reference

Files modified by V68.56:
- `/app/frontend/android/app/build.gradle`        — minify, shrink, splits, version, asset strip
- `/app/frontend/android/app/proguard-rules.pro`  — Capacitor + WebView keep rules

The keystore (`enlighten-mint-cafe.keystore`) and `keystore.properties`
were left **untouched** — your existing signing identity is preserved
so this release is a true upgrade of the previous 1.0.5 build.
