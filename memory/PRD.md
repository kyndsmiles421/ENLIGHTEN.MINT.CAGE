# ENLIGHTEN.MINT.CAFE — Product Requirements Document (V68.28)

## Vision
Sovereign Unified Engine / PWA targeting Google Play Store submission as a Wellness / Mental Acuity app.

## Core Rules (non-negotiable)
- **Flatland Rule**: no popup modals or fixed overlay "boxes on boxes". Everything renders inline in the current holographic chamber.
- **Metabolic Seal**: initial bundle strictly under 800KB. The `SovereignMath` kernel is ≈0.5KB — shared by every chamber.
- **Closed-Loop Economy**: Sparks = earned-only merit XP, never spent. Dust = purchased / spendable currency.
- **System-wide Gamification**: every module renders inside a `HolographicChamber` with themed interactive props.
- **Epilepsy Safety**: all animations + haptics respect `SensoryContext.reduceFlashing` / `reduceMotion`.
- **Silence Shield**: Cosmic Mixer never auto-primes resonance presets when muted; light-surge ring skipped when reduceFlashing.
- **Spotify Loophole**: Stripe surfaces hidden on Android TWA.

## V68.28 — Sovereign Advancement (shipped Feb 2026)
1. ✅ **Step #2 — PHI-Fader audio engine**: `phiVolumeCurve(x) = (x/100)^φ` applied to master gain, freq/sound/drone channels, and per-channel volume. Perceptual equal-power crossfades.
2. ✅ **Step #3 — Fibonacci snap-grid**: CSS variables `--fib-1 .. --fib-10` (2, 3, 5, 8, 13, 21, 34, 55, 89, 144 px) + `--phi-ease: cubic-bezier(0.618, 0, 0.618, 1)` exposed on `:root` in `index.css`. Any component can reference.
3. ✅ **Step #5 — Haptic Resonance**: `ChamberMiniGame.haptic()` reads `window.__sovereignHz` (dominant active mixer frequency) and vibrates at a single period of that tone (8–40ms clamp). Falls back to 10ms if no mixer is active.
4. ✅ **Step #7 — Sovereign Quest Pulse**: `SovereignUniverseContext` fires `sovereign:pulse` every 1618ms when the tab is visible. Auto-refreshes quest + wallet state every 10 beats. `sovereign:light-surge` fires on every milestone advancement; `HolographicChamber` renders a color-shifted radial ring from centre to edges (gated by reduceFlashing).

## V68.28 — SovereignMath Kernel (`/app/frontend/src/utils/SovereignMath.js`)
- `PHI`, `PHI_INV`, `PHI_SQ`, `SQRT5`
- `phiEase(t)` + `PHI_EASE_BEZIER`
- `phiStaggerDelay(i, base)` — Fibonacci cadence
- `phiFib(n)` — Binet exact Fibonacci
- `phiPath(t, z)` — xyz^φ trajectory
- `depthFalloff(z) = φ^{-z}` — bounded "Infinity^z"
- `sparkBalance({earned, cost})` — closed-loop ledger
- `phiRainbow(baseHue, n)` — refracted crystal hues
- `phiBudget(priority)` — 60fps frame budget split
- `phiCrossfade(v)` — cos/sin PHI-bent equal-power crossfade
- `phiVolumeCurve(linearPct)` — perceptual loudness curve
- `FIB_PX`, `SPACING`, `RADIUS` — snap-grid constants

## V68.27 — Resonance Presets (baked into MixerContext)
19 trade recipes. `UniversalWorkshop` auto-primes on chamber entry (Silence-Shield respected).

## V68.26 — System-Wide Gamification Plug-in Points
1. `GameModuleWrapper` auto-wraps every game module (RockHounding / EvolutionLab / RefinementLab / SmartDock / CosmicStore / ForgottenLanguages) in `HolographicChamber` via `MODULE_CHAMBER_MAP`.
2. `InteractiveModule` auto-wraps every catalog (Crystals / Herbology / Aromatherapy / Elixirs / Mudras / Nourishment / Reiki / Acupressure / Botany) via `CATEGORY_CHAMBER_MAP`.
3. `UniversalWorkshop` wraps every trade + replaces the flat SVG cube with themed holographic material props + tool-hotspot ring that opens `ChamberMiniGame` (STRIKE / SAW / KNEAD / ALIGN / MATCH / PLANT / CARE / VERSE).
4. `ChamberMiniGame` — progressive/adaptive game machine (`collect` / `break` / `rhythm`). Per-zone tier persisted in localStorage. Fires `checkQuestLogic` + Sparks on entry/hit/complete/mixer-assist. Listens for `sovereign:mixer-tick` → mixer nodules act as in-chamber assists.

## V68.27 — Slug Aliases (DynamicWorkshop.js)
`culinary`, `cooking`, `baking` → nutrition data. `gardening`, `herbalism` → landscaping.

## Console Tabs (11 tiered surfaces)
| # | Icon | Label | Min Tier | Function |
|---|---|---|---|---|
| 1 | Orbit | BASE | TorusPanel — 7-pillar 3D nav |
| 2 | Mix | BASE | MixPanel — master + 7 pillar sliders |
| 3 | Culture | SEED | CulturalMixerPanel |
| 4 | Audio | SEED | AudioPanel — record/import/master |
| 5 | Text | ARTISAN | TextPanel overlays |
| 6 | Layer | ARTISAN | OverlayPanel image overlays |
| 7 | Rec | ARTISAN | RecordPanel capture |
| 8 | FX | SOVEREIGN | EffectsPanel filters |
| 9 | AI | SOVEREIGN | AIPanel features |
| 10 | Out | SOVEREIGN | ExportPanel |
| 11 | Me | BASE | AccountPanel |

## Deferred to v1.1 (intentional)
- **Step #1** — Recursive Visual Scaling LOD (R3F deep work)
- **Step #4** — auto-throttle (partially lives in SensoryContext + depthFalloff — no gap for launch)
- **Step #6** — accelerometer crystal shimmer (iOS permission prompt)
- **Step #8** — space-fold torus transition
- **Step #9** — AI TTS harmonised with resonance (needs OpenAI TTS playbook)
- **Step #10** — Sovereign Audit PDF + WebM export
- **Token refresh** polish (some 401s on cross-page navigation)
- **Chamber backdrop compression** 1.8MB → ~400KB WebP

## Key Files
- `/app/frontend/src/utils/SovereignMath.js` — PHI kernel
- `/app/frontend/src/components/HolographicChamber.js` — chamber shell + light-surge ring
- `/app/frontend/src/components/ChamberProp.js` — interactive hotspot
- `/app/frontend/src/components/games/ChamberMiniGame.js` — progressive game machine (resonance haptics)
- `/app/frontend/src/context/SensoryContext.js` — immersion/epilepsy prefs
- `/app/frontend/src/context/SovereignUniverseContext.js` — main brain + 1.618s pulse + light-surge fire
- `/app/frontend/src/context/MixerContext.js` — φ volume curves + resonance presets + mixer-tick broadcaster
- `/app/frontend/src/components/UniversalWorkshop.js` — trade workshop gamification
- `/app/frontend/src/components/game/GameModuleWrapper.js` — module→chamber auto-wrap
- `/app/frontend/src/components/InteractiveModule.js` — catalog→chamber auto-wrap
- `/app/backend/routes/ai_visuals.py` — public chamber backdrops

## Credentials
Owner — `kyndsmiles@gmail.com` / `Sovereign2026!` (role=admin, is_owner=true, tier=creator)
