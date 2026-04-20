# ENLIGHTEN.MINT.CAFE — Product Requirements Document (V68.27)

## Vision
Sovereign Unified Engine / PWA targeting Google Play Store submission as a Wellness / Mental Acuity app.

## Core Rules (non-negotiable)
- **Flatland Rule**: no popup modals or fixed overlay "boxes on boxes". Everything renders inline in the current holographic chamber.
- **Metabolic Seal**: initial bundle strictly under 800KB. Lazy-load heavy modules. The `SovereignMath` kernel is ~0.4KB — shared by every chamber.
- **Closed-Loop Economy**: Sparks = earned-only merit XP, never spent. Dust = purchased / spendable currency.
- **System-wide Gamification**: every module (Geology, Herbology, Carpentry, Physics, Academy, Meditation, Culinary, Aromatherapy, etc.) renders inside a `HolographicChamber` and presents themed interactive props, not flat 2D grids.
- **Epilepsy Safety**: every animation respects `SensoryContext.reduceFlashing` / `reduceMotion` (WCAG 2.3.1).
- **Silence Shield**: the Cosmic Mixer never auto-primes resonance presets when the user has muted or when `immersion === 'calm'`. Respected inside `UniversalWorkshop`.
- **Spotify Loophole**: Android TWA users do not see Stripe native surfaces — `<PaymentGate>` wraps every Stripe surface.

## V68.27 — The Crystalline Math Kernel
`/app/frontend/src/utils/SovereignMath.js` centralises every PHI-weighted primitive used across the app. Zero magic numbers scattered across components.

Exports:
- `PHI`, `PHI_INV`, `PHI_SQ`, `SQRT5` — identity constants.
- `phiEase(t)` + `PHI_EASE_BEZIER` — Golden-Ratio-biased cubic for every chamber transition.
- `phiStaggerDelay(i, base)` — Fibonacci cadence for staggered reveals.
- `phiFib(n)` — exact Fibonacci via Binet.
- `phiPath(t, z)` — xyz^φ trajectory for particle motion.
- `depthFalloff(z)` — bounded φ^{-z} multiplier used to throttle per-layer visual intensity (the "Infinity^z" scaling governed by φ so depth never diverges).
- `sparkBalance({earned, cost})` — deterministic closed-loop ledger. Reports `net` for diagnostics only; Sparks remain non-spendable.
- `phiRainbow(baseHue, n)` — Refracted Crystal Rainbow hue splitter.
- `phiBudget(priority)` — 60fps frame budget split by Golden Ratio across priority layers.

Used by: `HolographicChamber` (backdrop fade + content entrance now use `PHI_EASE_BEZIER`), `UniversalWorkshop` (entrance stagger), `ChamberMiniGame` (indirectly via transitions), more to follow as legacy components are migrated.

## V68.26 — System-Wide Gamification Plug-in Points
One change to each of these covers every module. No per-page duplication.

1. **`/app/frontend/src/components/game/GameModuleWrapper.js`** — auto-wraps every game module in `HolographicChamber` via `MODULE_CHAMBER_MAP`. Modules: RockHounding, EvolutionLab, RefinementLab, SmartDock, CosmicStore, ForgottenLanguages.
2. **`/app/frontend/src/components/InteractiveModule.js`** — auto-wraps every catalog via `CATEGORY_CHAMBER_MAP`. Catalogs: Crystals, Herbology, Aromatherapy, Elixirs, Mudras, Nourishment, Reiki, Acupressure, Botany.
3. **`/app/frontend/src/components/UniversalWorkshop.js`** — wraps every trade workshop + replaces the old flat SVG cube + letter-circle tool-ring with a **themed holographic material prop + tool-hotspot ring** that opens a bespoke mini-game per trade. Per-trade `MODULE_GAME_THEME`: masonry=STRIKE (break), carpentry=SAW (break), culinary=KNEAD (break), electrical=ALIGN (rhythm), plumbing=MATCH (rhythm), landscaping=PLANT (collect), nursing/childcare/eldercare=CARE (rhythm), bible=VERSE (collect). Now also auto-primes the matching `RESONANCE_PRESET` on entry (respects Silence Shield).
4. **`/app/frontend/src/components/games/ChamberMiniGame.js`** — progressive / adaptive game machine. Three mechanics (`collect` / `break` / `rhythm`). Per-zone adaptive tier persisted in `localStorage.emcafe_gamelvl_<zone>`. Every completion bumps the tier and scales targetCount + hitsPerTarget + completionXP. Fires brain signals to `SovereignUniverse.checkQuestLogic` on `<zone>:<mode>:(enter|hit|complete|mixer_assist)` → `POST /api/quests/auto_detect`. Credits Sparks via `POST /api/sparks/immersion`. Listens for `sovereign:mixer-tick` CustomEvents → mixer nodules have a **function** in every chamber.

## V68.27 — Resonance Presets (baked into MixerContext)
`/app/frontend/src/context/MixerContext.js` exports `RESONANCE_PRESETS` and `applyResonancePreset(key)`. 19 trade/chamber recipes:
- Masonry Mastery → 528Hz + Singing Bowl + Sitar Drone
- Grain Attunement (Carpentry) → 432Hz + Forest + Cedar Flute
- Hearth Resonance (Culinary/Cooking) → 396Hz + Fire + Hang Drum
- Current Alignment (Electrical) → 40Hz + 111Hz + Thunder + Cello
- Flow Balance (Plumbing) → 417Hz + Stream + Shakuhachi
- Healing Presence (Nursing) → 528Hz + 741Hz + Ocean + Harp
- Lullaby Rhythm (Childcare) → 432Hz + Rain + Kalimba
- Dignity Circle (Eldercare) → 639Hz + Singing Bowl + Cello
- Root Tending (Landscaping/Gardening) → 174Hz + 285Hz + Forest + Didgeridoo
- Herb Bloom (Herbalism/Herbology) → 528Hz + Forest + Cedar Flute
- Sacred Study (Bible) → 639Hz + 852Hz + Cave + Harp
- Still Chamber (Meditation) → 7.83Hz + 528Hz + Singing Bowl + Bowl Drone
- Crystal Lattice (Geology) → 111Hz + 528Hz + Cave + Bowl Drone
- Resonance Lab (Physics) → 40Hz + 963Hz + Night + Cello
- Scholar's Calm (Academy) → 432Hz + 852Hz + Forest + Harmonium
- Essence Weave (Aromatherapy) → 639Hz + 741Hz + Stream + Oud

Primed once per session per chamber via `sessionStorage.emcafe_resonance_primed_<chamberKey>`. User retains full manual control via the Cosmic Mixer.

## V68.27 — Slug Aliases
`/app/frontend/src/components/DynamicWorkshop.js` exposes `MODULE_ALIAS` so friendly URLs work without backend duplication:
- `/workshop/culinary`, `/workshop/cooking`, `/workshop/baking` → data from `nutrition` module, KNEAD / STIR / SHAPE game theming.
- `/workshop/gardening`, `/workshop/herbalism` → data from `landscaping` module.

`UniversalWorkshop` accepts optional `dataModuleId` to decouple data-fetch slug from theme slug.

## Key Files
- `/app/frontend/src/utils/SovereignMath.js` — PHI kernel
- `/app/frontend/src/components/HolographicChamber.js` — chamber wrapper (public backdrop fetch, PHI-eased transitions)
- `/app/frontend/src/components/ChamberProp.js` — hotspot with 100ms haptic press-confirm
- `/app/frontend/src/components/games/ChamberMiniGame.js` — progressive adaptive game machine
- `/app/frontend/src/context/SensoryContext.js` — immersion / animation / particle / flashing prefs
- `/app/frontend/src/context/SovereignUniverseContext.js` — main brain
- `/app/frontend/src/context/MixerContext.js` — resonance presets + mixer-tick broadcaster
- `/app/backend/routes/ai_visuals.py` — public chamber backdrops (Gemini Nano Banana, cached)
- `/app/backend/routes/sparks.py` — `/api/sparks/immersion`
- `/app/backend/routes/quests.py` — `/api/quests/auto_detect`

## Completed
### V68.26 — Feb 2026
- [x] System-wide gamification rollout
- [x] Public chamber backdrops (guests included)
- [x] Progressive / adaptive difficulty per zone
- [x] Brain wiring via `SovereignUniverse.checkQuestLogic`
- [x] Cosmic Mixer → chamber `sovereign:mixer-tick` broadcast

### V68.27 — Feb 2026
- [x] SovereignMath PHI kernel + kernel wiring into HolographicChamber transitions
- [x] Baked-in Resonance Presets (19 trade recipes)
- [x] Auto-prime resonance on chamber entry (Silence-Shield aware)
- [x] Slug aliases for culinary / cooking / baking / gardening / herbalism
- [x] Pointer-event audit — no phantom layers (single wrap per page, `pointerEvents:'none'` on decorative layers, z-index stack: backdrop=0 / veil=1 / scanline=2 / presence=2 / content=3 / shimmer=4 / hologram=5 / chrome=6 / game overlay=30 / distortion=30 / HUD=40)

## Backlog (v1.1)
- P1: Quad-Pane SplitScreen (2x2 grid)
- P1: Real GLB Avatar via Ready Player Me / Meshy
- P2: Time Capsule yearly export cron via Resend
- P2: Migrate remaining legacy easings to `phiEase` sweep
- P3: Add `useSparkLedger` hook for live balance display if user wants a visible ledger

## Credentials
Owner — `kyndsmiles@gmail.com` / `Sovereign2026!`
