# ENLIGHTEN.MINT.CAFE — v1.0.2 Automated Regression Report

Ran on preview (desktop 1440×900, phone 412×915, tablet 600×1024 + 800×1280).
Authenticated as owner `kyndsmiles@gmail.com`.

## Results — 4/4 pass

| Check | Status | Evidence |
|---|---|---|
| **9×9 Sovereign Lattice** | ✅ PASS | 81 circles, **all 9 node types** present (CORE, ORACLE, PORTAL, RELAY, SHIELD, VAULT, LEDGER, GENERATOR, MIXER). SVG rendered at 272×272px. Visible resonance path + pulse animation on the user's current node. |
| **Rock Hounding Crystal Portrait** | ✅ PASS | Mining at Depth 1 produced 1 `specimen-card` with 1 unique `crystal-portrait-*` SVG + 1 `specimen-info-toggle` (the "Learn" expand button). |
| **Cosmic Mixer — full width** | ✅ PASS | Two `max-w-6xl` containers measured at **1152px** wide at 1440px viewport. All 14 Solfeggio + Founder's Harmonic + Vernal Awakening rendering. |
| **Orbital Hub — Starseed satellite** | ✅ PASS | After adding `/orbital-hub` route alias. Starseed + Soundscape + Mood Engine labels all resolvable in DOM. |

## Bugs discovered & fixed during the sweep
1. **`/orbital-hub` was a 404** — App.js only registered `/hub`. Added `/orbital-hub` as alias.
2. **Lattice rendered as dim 2px dots** — `r=1.4–2.0` and `opacity=0.15–0.27` made unvisited nodes invisible. Increased `cellSize` 20→28, boosted `r` to 2.2–4.5 and `opacity` to 0.45–1.0. Added `data-node-type` for test verification.

## Build artifacts
- `/app/build_artifacts/enlighten-mint-cafe-v1.0.2.aab` · 33 MB · SHA-256 `35bc66e2d2...c8935f`
- `/app/build_artifacts/enlighten-v1.0.2.apk` · 33 MB · SHA-256 `ce4a093303...b91f` (signed, v2+v3 schemes)

## Play Store listing deliverables
- **Feature graphic** `/app/build_artifacts/playstore/feature_graphic_1024x500.png` (Obsidian Void + gold Om)
- **Phone screenshots** (5): hub, orbital, mixer, rock-hounding, landing
- **Tablet 7" screenshots** (2): hub, mixer
- **Tablet 10" screenshots** (2): hub, mixer
- **Listing copy** `/app/build_artifacts/playstore/LISTING_COPY.md` — app name, short desc, full desc, category, contact
- **Data Safety form** `/app/memory/DATA_SAFETY.md`
- **Privacy Policy** `/app/frontend/public/privacy.html` (also served in-app at `/privacy.html`)
