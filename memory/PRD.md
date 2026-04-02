# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform. V2 "Sovereign Core" — Unified Simulation Architecture. Spatial Operating System governed by mathematical constants.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Three.js (imperative WebGL)
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API, Stripe (pending)

## Architecture
```
/app/frontend/src/
├── context/
│   ├── SensoryContext.js (GLOBAL AUDIO ENGINE: sovereignMute, fade, killAll, source registry)
│   ├── CosmicStateContext.js (UNIFIED MATH STATE: ODE energies, stability, hexagram, tier-gated)
│   ├── AuthContext.js, MixerContext.js, TempoContext.js, LanguageContext.js
├── components/
│   ├── SmartDock.js (Zen Toggle dock button with long-press kill-all)
│   ├── FiveElementsWheel.js (proximity scaling + ODE energy arcs + stability indicator)
│   ├── CosmicAssistant.js (Dynamic Docking via MutationObserver)
│   ├── MissionControl.js (raycaster-transparent backdrop, pulse animations, hexagram logic gate)
│   ├── NanoGuide.js (localized 3-point quick-start tooltips, links to Codex)
│   ├── ResonancePulse.js (audio breadcrumb glow rings + HexagramGlitch + HexagramBadge)
│   ├── CosmicSparkline.js (SVG ODE energy curve + hexagram badge overlay)
│   ├── orbital/ (9 files), trade/
├── pages/
│   ├── OrbitalHub.js (+CosmicSparkline widget, +ResonancePulse on satellites)
│   ├── Archives.js, SuanpanMixer.js (+NanoGuide), Botany.js (+NanoGuide, +CosmicState)
│   ├── StarChart.js (Dolly-Zoom with Rodrigues matrix keyframes, NanoGuide)
│   ├── TradeCircle.js (gravity-weighted + botanical + NanoGuide)
│   ├── Codex.js (Sovereign Codex: searchable, section-filtered, tier-gated, hexagram badge)

/app/backend/routes/
├── botany.py (catalog, garden, resonance, AI identify, gravity nodes)
├── mastery.py (balance-score algorithm, wheel-interaction tracking)
├── trade_circle.py (botanical-listing, gravity-weighted, suanpan-export bridge)
├── sovereign_math.py (ODEs, Lorenz Chaos, Rodrigues Matrix, Garden Derivatives)
├── sovereign_codex.py (Mastery-tiered help entries, Nano-Guides)
├── cosmic_state.py (UNIFIED master endpoint: tier-gated math + hexagram bundle)
├── hexagram.py (I Ching 64-hexagram state-machine, changing lines, transitions)
├── energy_gates.py (credits fix applied)
├── gravity.py, archives.py, atmosphere.py, observatory.py
├── content_factory.py, revenue.py, forge.py, nature.py, teachings.py, voice_command.py
```

## I Ching Hexagram State-Machine
```
6-bit boolean array → Hexagram #1-64:
  Bit 0: Garden equilibrium ≥ 40 (balance score)
  Bit 1: Mastery tier ≥ Synthesizer
  Bit 2: ≥ 3 of 5 elements explored (diversity)
  Bit 3: ≥ 2 archive categories unlocked
  Bit 4: Frequency recipe created (Suanpan export)
  Bit 5: Trade completed in Trade Circle

Changing Lines: conditions near threshold → trigger glitch/flicker UI
Target Hexagram: computed when changing lines exist (bits flip)
Solfeggio: each hexagram mapped to sacred frequency (174-963Hz cycle)
Trigrams: upper (bits 3-5) / lower (bits 0-2) → Heaven/Lake/Fire/Thunder/Wind/Water/Mountain/Earth
```

## Unified Cosmic State Endpoint
```
GET /api/cosmic-state → tier-gated data bundle:
- Observer+: energies, stability, total_rate_of_change, garden_masses, hexagram
- Synthesizer+: derivatives, deviations from mean
- Archivist+: 24hr ODE trajectory, peak/trough analysis, ODE parameters
- Sovereign: chaos prediction (Lorenz attractor, Lyapunov exponent, sensitivity)
```

## Sovereign Math Engine
```
ODE System: dE_i/dt = generation - control - decay + circadian + garden_boost
  - RK4 integration (dt=0.25hr), Gaussian circadian modulation (TCM organ clock)
  - 5 coupled equations for Wood/Fire/Earth/Metal/Water

Chaos Theory: Lorenz Attractor (σ=10, ρ=28, β=8/3)
  - Butterfly effect on frequency recipes
  - Lyapunov exponent estimation for sensitivity classification

Matrix Transforms: 4×4 Rodrigues rotation (homogeneous coordinates)
  - Smoothstep-eased keyframes for Star Chart camera navigation
```

## Mastery Tier Algorithm
```
balance_score = diversity(30%) + equilibrium(30%) + consistency(20%) + exploration(20%)
Tiers: Observer(0-20) → Synthesizer(20.1-40) → Archivist(40.1-60) → Navigator(60.1-80) → Sovereign(80.1-100)
```

## Global Audio Engine
```
SensoryContext provides:
- sovereignMute: boolean (localStorage persisted)
- sovereignMuteToggle(): logarithmic fade (500ms) + context.suspend()/resume()
- sovereignKillAll(): stops all oscillators, suspends all contexts
- audioSources: registry of active audio producers for ResonancePulse visualization
- All sound functions gate on sovereignMute
```

## Iteration History

### Iteration 218 — I Ching Logic Gates + Resonance Pulse + Sparkline (Apr 2, 2026) — LATEST
- **I Ching State-Machine**: 64-hexagram boolean logic from 6 system conditions
- **Hexagram Endpoint**: `GET /api/hexagram/current` — full hexagram data with changing lines, transitions
- **Cosmic State Hexagram**: Unified endpoint now includes hexagram summary for all tiers
- **ResonancePulse**: Audio breadcrumb glow rings on Hub satellites (CSS fallback + Web Audio amplitude)
- **HexagramGlitch**: CSS flicker animation for transitioning hexagrams (hue-rotate, brightness, translate)
- **HexagramBadge**: Full/compact modes showing hexagram lines, trigrams, changing line count
- **CosmicSparkline**: SVG ODE energy curve + stability indicator + hexagram badge on Orbital Hub
- **Mission Control Logic Gate**: Hexagram state displayed with glitch effect in panel
- **Codex Hexagram**: Header shows current hexagram state with transition indicator
- **Energy Gates Fix**: Credits field handling for dict/int/float types
- Tests: 100% (Iteration 218)

### Iteration 217 — Sovereign Math + Codex + Raycaster (Apr 2, 2026)
- Unified Cosmic State endpoint, Sovereign Codex (14 entries), NanoGuide tooltips (5 pages)
- ODE energy arcs on Five Elements Wheel, stability indicator
- Mission Control raycaster fix (pointer-events), passive pulse animations
- Star Chart Rodrigues matrix keyframes, CosmicStateContext global state

### Previous Iterations (211-216)
- Botany Module, Five Elements Wheel, Phygital Marketplace, Resonance Compatibility
- Balance Score algorithm, Suanpan bridge, System Triage, Cinematic UX
- Global Audio Engine (Zen Toggle, logarithmic fades, sovereign kill-all)

## Upcoming Tasks (P1)
- **Phase B: I Ching Logic Gate Deepening**: Map hexagram states to Wisdom Prescription unlocks, Sovereign tier path restrictions, Star Chart interactability gating
- **Resonance Pulse Spatial Audio**: Wire Web Audio API 3D spatializer to pulse rings so volume/panning shifts with Star Chart navigation

## Future/Backlog (P2)
- **Multi-Civilization Star Charts**: Hopi, Egyptian, Vedic maps (GPS-based)
- **Sovereign Tier Perks**: Custom element nodes, Global Trade Circle
- **Wisdom Prescriptions**: Personalized ritual plans from hexagram + journal + gravity + mastery
- **Light Trails + Bloom**: Mission Control sphere trails on drag velocity

## Key Technical Rules
- **LlmChat**: Always `session_id` + `system_message`
- **WebGL**: Imperative mutation only
- **MongoDB**: Exclude `_id`
- **Audio**: All sound functions must check `sovereignMute`
- **Coordinates**: `isFinite()` before Three.js
- **Events**: `stopPropagation()` on floating panels
- **Cosmic State**: Use `useCosmicState()` hook for math data, 60s cache
- **Hexagram**: Compute from ODE energies, never hardcode state

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
