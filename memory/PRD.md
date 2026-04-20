# ENLIGHTEN.MINT.CAFE — Product Requirements Document (V68.29)

## Vision
Sovereign Unified Engine / PWA targeting Google Play Store submission as a Wellness / Mental Acuity app.

## Core Rules
- **Flatland Rule**, **Metabolic Seal** (<800KB), **Closed-Loop Economy** (Sparks earn-only), **System-wide Gamification**, **Epilepsy Safety**, **Silence Shield**, **Spotify Loophole**.

## V68.29 — Drill-Down Chains + Portal Props (Feb 2026)
1. ✅ **ChamberProp portal fix** — every interactive prop is now rendered through `ReactDOM.createPortal(..., document.body)` with the `.chamber-prop-portal` CSS class forcing `position: fixed !important`. Framer-motion's transform containment no longer collapses props into the HUD pane. Confirmed: Meditation props (BREATHE 22%/55%, RING BELL 82%/22%, MANDALA 82%/78%) render at their true viewport coordinates with **NONE** overlapping.
2. ✅ **Drill-down chains** — `ChamberMiniGame` accepts `nextGame` prop (single config or array). On completion the user taps **"CONTINUE DEEPER →"** and the same overlay swaps stage without closing. Each stage can override mode/verb/icon/title/target-count/zone/completion-msg/completion-xp. Emits `<zone>:<mode>:go_deeper` brain signal.
3. ✅ **Herbology drill-down** — PLUCK (collect, 8 herbs) → BREW (break, 4 × 4 hits grinding) → DOSE (rhythm, 5 PHI-aligned pours). User earns 12 + 14 + 18 = 44 completion-sparks plus micro-sparks per tap.
4. ✅ **UniversalWorkshop drill-down** — every trade workshop auto-chains the current tool's game into up to 4 remaining tools. Masonry chisel → mallet → trowel → rubber float → level, all themed STRIKE with adaptive difficulty. Select-state stays in sync via `onGoDeeper` callback updating `selTool`.
5. ✅ **SovereignMath.safeChamberLayout(n, opts)** — PHI-weighted collision-safe arc layout helper (unused today, available for future pages that want auto-placed props).

## V68.28 — Sovereign Advancement (shipped)
- PHI-Fader audio (every mixer gain uses `phiVolumeCurve`)
- Fibonacci snap-grid CSS vars (`--fib-1..10`, `--phi-ease`)
- Resonance Haptics (`ChamberMiniGame.haptic()` vibrates at the active mixer tone period)
- Sovereign Quest Pulse (1.618s heartbeat + light-surge ring on milestone)

## V68.27 — Resonance Presets
19 trade recipes baked into MixerContext (`applyResonancePreset`), auto-primed on workshop entry (Silence Shield respected).

## V68.26 — System-Wide Gamification
- `GameModuleWrapper` auto-wraps 6 game modules via `MODULE_CHAMBER_MAP`.
- `InteractiveModule` auto-wraps 9 catalogs via `CATEGORY_CHAMBER_MAP`.
- `UniversalWorkshop` themes every trade via `MODULE_GAME_THEME` (STRIKE / SAW / KNEAD / ALIGN / MATCH / PLANT / CARE / VERSE).
- `ChamberMiniGame` — progressive, adaptive, brain-signal-wired, mixer-tick-listening game machine.

## Console Tabs
11 tabs tier-gated (BASE / SEED / ARTISAN / SOVEREIGN). Owner account (kyndsmiles@gmail.com) sees all 11.

## Deferred (v1.1)
- #1 Recursive LOD, #6 Accelerometer shimmer, #8 Space-fold torus, #9 AI TTS resonance, #10 Sovereign Audit export, token refresh polish, backdrop WebP compression.

## Key Files
- `/app/frontend/src/utils/SovereignMath.js` — PHI kernel + snap-grid + safeChamberLayout
- `/app/frontend/src/components/HolographicChamber.js` — chamber shell + light-surge
- `/app/frontend/src/components/ChamberProp.js` — portal + fixed-position prop
- `/app/frontend/src/components/games/ChamberMiniGame.js` — game machine + drill-down
- `/app/frontend/src/components/UniversalWorkshop.js` — trade drill-down through all tools
- `/app/frontend/src/context/SovereignUniverseContext.js` — brain + 1.618s pulse + surge fire
- `/app/frontend/src/context/MixerContext.js` — φ volumes + resonance presets + mixer-tick
- `/app/frontend/src/index.css` — Fibonacci grid tokens + `.chamber-prop-portal` pin

## Credentials
Owner — `kyndsmiles@gmail.com` / `Sovereign2026!` (role=admin, is_owner=true, tier=creator)
