# Play Store Status — REAL CURRENT STATE (V69.2)

## ⚠️ Correction Notice

The earlier version of this file claimed no Android scaffold existed. **That was wrong.** Full Capacitor + iOS + TWA + signed AAB + Play Store listing assets all exist already. This file has been replaced with the honest current state.

The authoritative Android documentation is `/app/build_artifacts/BUILD_INFO.md` — refer to that for keystore credentials, fingerprints, and the upload playbook. This file is just the "what changed since v1.0.4" delta.

---

## Last AAB built: v1.0.4 — April 21, 2026

Located at `/app/build_artifacts/enlighten-mint-cafe-v1.0.4.aab` (33 MB, signed).

## Code shipped AFTER v1.0.4 (these are NOT in the existing AAB)

This is what a v1.0.5 rebuild will add to the Play Store version. **694 frontend files have been modified since April 21.** Headline additions:

| Version | Shipped |
|---|---|
| V68.94 | Companion concept bridges (Maryam/Dharma/Emptiness/etc.), Today's Cross-Tradition Pairing, Never-Trapped audit (Tesseract z-index fix) |
| V68.95 | Sentient Portal Batch — realm element → Companion bridge, ContextBus ripple on realm entry, per-element icons |
| V68.96 | Sage realm-awareness (worldMetadata pass-through), spiritual-shield word fixes |
| V68.97 | Sentience SLO baseline established (19.6%), 3 idle engines wired (Hourglass/Singularity/Production) |
| V69.0 | `useSentience` hook, `/api/admin/sentience` SLO endpoint, Aromatherapy + Mantras hook adopters |
| V69.1 | Acupressure + Mudras + Crystals hook adopters |
| V69.2 | `SentientEngineWrapper` (auto-commit lifecycle for all pull()-mounted engines), Architect's Badge HUD, sentience hits genuine 100% |
| V69.2 polish | "Healing" → "Sovereign/Tradition/Resonance" rename in 3 borderline files |

**Bottom line:** the existing v1.0.4 AAB is shippable today. It will not have the Companion chips, Realms, Sentience badge, or Sage realm-awareness. Those landed after April 21.

## To ship v1.0.5 with everything (recommended)

Per `BUILD_INFO.md`, the rebuild flow on a machine with Node 22 + JDK 21 + Android SDK:

```bash
# 1. Bump the version (CRITICAL — Play Store rejects re-uploads of same versionCode)
# Edit: /app/frontend/android/app/build.gradle
#   versionCode 1   →  2
#   versionName "1.0.4"  →  "1.0.5"

# 2. Rebuild web bundle
cd /app/frontend
yarn build

# 3. Sync into Android
npx cap sync android

# 4. Build the signed AAB
cd android
./gradlew :app:bundleRelease --no-daemon

# 5. Output:
ls app/build/outputs/bundle/release/app-release.aab
```

Then upload `app-release.aab` to Play Console (existing app entry, new release).

## To ship v1.0.4 as-is (faster, less complete)

If you want to ship today and add the V69.x work in v1.0.5 next week:

1. Upload `/app/build_artifacts/enlighten-mint-cafe-v1.0.4.aab` to Play Console
2. Reuse the screenshots and listing copy in `/app/build_artifacts/playstore/`
3. Submit. Wait 24-48h for internal track review.

## What I WAS right about (after correction)

The audit findings about **what makes the app Play Store-compliant** still stand:

- ✅ Privacy/Terms pages reachable without auth (verified 200 responses)
- ✅ Account deletion endpoint exists end-to-end
- ✅ Medical disclaimer mounted
- ✅ Sage system prompt has explicit medical-claim guard
- ✅ Manifest categories safe (entertainment/education/lifestyle/games — no "health")
- ✅ Service worker, icons, all required PWA fields
- ✅ TWA suitability check passes
- ✅ Sentience SLO 100% (V69.2)
- ✅ 45/45 regression tests passing

## Borderline-language fixes shipped in V69.2

| File | Was | Now |
|---|---|---|
| `pages/Herbology.js` | "Healing Herb Garden" | "Sovereign Herb Garden" |
| `pages/Frequencies.js` | "Sound Healing Videos" | "Sound Resonance Videos" |
| `components/InteractiveModule.js` | "Healing" header | "Tradition" |

These are in the v1.0.5 rebuild, not v1.0.4.

## Bottom line — your call

**Option A** — ship v1.0.4 today (faster, no rebuild, missing 10 days of work).
**Option B** — bump to v1.0.5, rebuild (30 min), ship the full V69.2 bow tomorrow.

I recommend **B**. The Sentience SLO badge alone is worth the rebuild — it's the kind of detail Play Store reviewers and tech-curious users notice and remember.

What's NOT a blocker either way: more feature work. The app is ready.
