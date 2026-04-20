# ENLIGHTEN.MINT.CAFE — Product Requirements Document

## Vision
Sovereign Unified Engine / PWA targeting Google Play Store submission as a Wellness / Mental Acuity app.

## Core Rules (non-negotiable)
- **Flatland Rule**: no popup modals or fixed overlay "boxes on boxes". Everything renders inline in the current holographic chamber.
- **Metabolic Seal**: initial bundle strictly under 800KB. Lazy-load heavy modules.
- **Closed-Loop Economy**: Sparks = earned-only merit XP, never spent. Dust = purchased / spendable currency.
- **System-wide Gamification**: every module (Geology, Herbology, Carpentry, Physics, Academy, Meditation, Culinary, Aromatherapy, etc.) renders inside a `HolographicChamber` and presents themed interactive props, not flat 2D grids.
- **Epilepsy Safety**: every animation respects `SensoryContext.reduceFlashing` / `reduceMotion` (WCAG 2.3.1).
- **Spotify Loophole**: Android TWA users do not see Stripe native surfaces — they are routed to external web top-ups (`<PaymentGate>` wraps every Stripe surface).

## System-Wide Gamification Plug-in Points (V68.26)
One change to each of these covers every module — no per-page duplication:

1. **`/app/frontend/src/components/game/GameModuleWrapper.js`**
   - Auto-wraps every game module in `HolographicChamber` via `MODULE_CHAMBER_MAP`.
   - Modules using it: RockHounding, EvolutionLab, RefinementLab, SmartDock, CosmicStore, ForgottenLanguages.

2. **`/app/frontend/src/components/InteractiveModule.js`**
   - Auto-wraps every catalog in `HolographicChamber` via `CATEGORY_CHAMBER_MAP`.
   - Catalogs using it: Crystals, Herbology, Aromatherapy, Elixirs, Mudras, Nourishment, Reiki, Acupressure, Botany.

3. **`/app/frontend/src/components/UniversalWorkshop.js`**
   - Wraps every trade workshop in `HolographicChamber` + replaces flat SVG block + letter tool-ring with **themed holographic material prop + tool-hotspot ring** that opens real chamber mini-games.
   - Per-trade `MODULE_GAME_THEME` drives the mode/verb/icon: masonry=STRIKE (break), carpentry=SAW (break), culinary=KNEAD (break), electrical=ALIGN (rhythm), plumbing=MATCH (rhythm), landscaping=PLANT (collect), nursing/childcare/eldercare=CARE (rhythm), bible=VERSE (collect).

4. **`/app/frontend/src/components/games/ChamberMiniGame.js`** — Progressive / adaptive game machine.
   - Three real mechanics: `collect` (catch floating targets), `break` (tap N× to destroy), `rhythm` (tap when marker aligns with PHI golden band).
   - Per-zone adaptive tier persisted in `localStorage.emcafe_gamelvl_<zone>` — every completion bumps the tier, scales targetCount + hitsPerTarget + completionXP upward (capped at level 9).
   - Wires every hit/completion/entry/mixer-assist to the `SovereignUniverse` main brain via `checkQuestLogic(<zone>:<mode>:<kind>)` → `POST /api/quests/auto_detect`.
   - Credits Sparks XP via `POST /api/sparks/immersion`.
   - Listens for `sovereign:mixer-tick` CustomEvents so Cosmic Mixer nodules have a **function** in every open chamber (each mixer toggle = +1 assist spark + stage flash + brain signal).

## Key Files
- `/app/frontend/src/components/HolographicChamber.js` — universal chamber wrapper (cinematic backdrop via `/api/ai-visuals/chamber`, scanlines, shimmer, hologram portrait corner, Flatland-safe inline HUD pane). Backdrop fetch is now **public** (guests included).
- `/app/frontend/src/components/ChamberProp.js` — standard interactive hotspot with 100ms haptic press-confirm and epilepsy-safe pulse variant.
- `/app/frontend/src/components/games/ChamberMiniGame.js` — progressive adaptive game machine.
- `/app/frontend/src/context/SensoryContext.js` — single source of truth for immersion/animation/particle/flashing preferences.
- `/app/frontend/src/context/SovereignUniverseContext.js` — main brain (window.SovereignUniverse + checkQuestLogic + refreshGlobalUI + awardSpark).
- `/app/frontend/src/context/MixerContext.js` — broadcasts `sovereign:mixer-tick` on every nodule toggle.
- `/app/backend/routes/ai_visuals.py` — chamber backdrop generator (public, Gemini Nano Banana, cached forever per chamber_id).
- `/app/backend/routes/sparks.py` — `/api/sparks/immersion` endpoint.

## Completed (V68.26 — Feb 2026)
- [x] System-wide gamification rollout (meditation was the V68.24 exemplar)
- [x] Geology / RockHounding → inherits geology chamber via GameModuleWrapper
- [x] Herbology → holographic apothecary garden + PLUCK HERBS (collect) + BREW ELIXIR (break) mini-games
- [x] Apothecary / Aromatherapy → holographic essence atelier + BLEND ESSENCES (rhythm PHI) + CATCH ESSENCE (collect)
- [x] Carpentry → holographic timber-framer's workshop + SAW THE TIMBER break-game per material
- [x] Masonry → holographic stonemason's workshop + STRIKE THE STONE break-game per material
- [x] Culinary / Cooking / Baking → holographic artisan bakery + KNEAD / STIR / SHAPE break-games
- [x] Electrical / Plumbing / Nursing / Childcare / Eldercare → themed rhythm games
- [x] Landscaping / Gardening / Herbalism → themed collect games
- [x] Bible Study → themed verse-collect game
- [x] Academy → wrapped in holographic lecture-hall chamber
- [x] SovereignLab (Physics) → wrapped in cinematic physics-lab chamber
- [x] Meditation chamber (V68.24 exemplar — BreathPacer + Mandala)
- [x] Backend chamber endpoint is now PUBLIC (guests see same holographic rooms as authed users)
- [x] Progressive / adaptive difficulty (adaptive tier persisted per zone)
- [x] Brain wiring via `SovereignUniverse.checkQuestLogic` on entry / hit / complete / mixer-assist
- [x] Cosmic Mixer nodules broadcast `sovereign:mixer-tick` → chambers react (assist sparks, stage flash, brain signal)

## Backlog (v1.1)
- P1: Quad-Pane SplitScreen (expand current 2-pane to 2x2)
- P1: Phase 4b Real GLB Avatar Generator (Ready Player Me / Meshy AI)
- P2: Time Capsule yearly GDPR export cron via Resend

## Tech Stack
- React 19 (PWA), FastAPI, MongoDB
- R3F / Three.js for 3D
- Emergent LLM Key → Gemini Nano Banana (chamber backdrops), GPT-5.2 text, Sora 2, OpenAI image
- Stripe (dust top-ups, TWA-hidden on Android)
- Resend (email)

## Credentials
Owner — `kyndsmiles@gmail.com` / `Sovereign2026!`
