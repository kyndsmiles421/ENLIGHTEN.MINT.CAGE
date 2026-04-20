# ENLIGHTEN.MINT.CAFE — Native Android Bundle (v1.0.0)

**Built:** `2026-04-20` (first Play Store-ready native build)
**Size:** 33 MB signed `.AAB`
**Min SDK:** 24 (Android 7.0)   **Target SDK:** 36 (Android 15)

## Artifacts
| File | Purpose |
|---|---|
| `enlighten-mint-cafe-v1.0.0.aab` | The signed Android App Bundle — upload to Google Play Console |
| `enlighten-mint-cafe-UPLOAD-KEY.keystore` | **GUARD THIS.** Losing it = you can never update the app |
| `KEYSTORE_FINGERPRINTS.txt` | SHA-1 & SHA-256 fingerprints (used by Play Console, Firebase, Google Sign-In) |
| `aab-sha256.txt` | Integrity hash of the AAB file |

## Signing Credentials (store these in a password manager NOW)
- **Keystore alias:** `enlightenmintcafe`
- **Keystore password:** `Sovereign2026!`
- **Key password:** `Sovereign2026!` (same)
- **Validity:** 30 years (until 2056-04-12)
- **Algorithm:** RSA 4096, SHA384withRSA

### SHA fingerprints
- **SHA-1:** `C3:A5:5D:38:05:45:E6:12:AD:E0:74:F9:56:B0:0D:66:E8:F8:3D:19`
- **SHA-256:** `3F:E1:E1:E2:F6:A2:4B:D1:0D:57:A4:F2:4A:DE:CC:0B:67:4F:D3:11:3A:81:3D:95:CD:E2:1E:97:5E:CE:4D:07`

## App Identity
- **Package (applicationId):** `cafe.mint.enlighten`
- **Display name:** `Enlighten Mint Cafe`
- **Version code:** `1`   **Version name:** `1.0.0`
- **Icon:** Obsidian Void (#000000) background + gold Om foreground (adaptive, all 5 densities)

## Upload Playbook — Google Play Console

1. Create / open your app in Play Console → **Production** or **Internal testing**.
2. **Setup → App integrity → App signing**: Let **Google Play App Signing** manage the signing key. Upload `enlighten-mint-cafe-UPLOAD-KEY.keystore` **only if asked** for the upload key (Play keeps its own signing key; yours is just the upload key).
3. **Release → Create new release → Upload** → pick `enlighten-mint-cafe-v1.0.0.aab`.
4. Fill the **Content rating**, **Data safety**, **Target audience** (adult / wellness), **Ads** (none), **Privacy Policy URL**.
5. Add **512×512 Play Store icon** → `frontend/resources/play-store-icon-512.png`.
6. Add screenshots (phone + 7" tablet + 10" tablet) and a 1024×500 feature graphic.
7. Submit for review.

## Re-Builds (v1.0.1+)

```bash
source /root/.nvm/nvm.sh && nvm use 22
export JAVA_HOME=/opt/jdk21
export ANDROID_HOME=/opt/android-sdk
export PATH=$JAVA_HOME/bin:$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# 1. Bump versionCode in android/app/build.gradle (increment for every upload)
# 2. Rebuild web
cd /app/frontend && yarn build

# 3. Sync + Gradle bundle
npx cap sync android
cd android && ./gradlew :app:bundleRelease --no-daemon

# Output → app/build/outputs/bundle/release/app-release.aab
```

## Environment Notes (for reproducibility)
- Container arch: `aarch64` (ARM64). Google ships AAPT2 as x86_64 only, so we wrap it
  with `qemu-x86_64-static`. The wrapper is applied at
  `/opt/android-sdk/build-tools/36.0.0/aapt2` (`aapt2.real` = the x86_64 binary).
- `gradle.properties` sets `android.aapt2FromMavenOverride` → system wrapped aapt2.
- `libc6:amd64` is installed via dpkg multi-arch so qemu's target glibc is present.

## Post-Flight Defrag Backlog (V1.1)
- Migrate `capacitor-cordova-android-plugins` off deprecated Gradle 8 APIs (will break on Gradle 9).
- Enable R8 minification (`minifyEnabled true`) — currently off to shorten first-build time.
- Add App Bundle ABI splits (`armeabi-v7a`, `arm64-v8a`, `x86_64`) once native libs enter the tree.
