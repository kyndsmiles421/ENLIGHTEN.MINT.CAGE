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
│   ├── CosmicStateContext.js (UNIFIED MATH STATE: ODE energies, stability, tier-gated data)
│   ├── AuthContext.js, MixerContext.js, TempoContext.js, LanguageContext.js
├── components/
│   ├── SmartDock.js (Zen Toggle dock button with long-press kill-all)
│   ├── FiveElementsWheel.js (proximity scaling + ODE energy arcs + stability indicator)
│   ├── CosmicAssistant.js (Dynamic Docking via MutationObserver)
│   ├── MissionControl.js (raycaster-transparent backdrop, pulse animations, NanoGuide)
│   ├── NanoGuide.js (localized 3-point quick-start tooltips, links to Codex)
│   ├── orbital/ (9 files), trade/
├── pages/
│   ├── OrbitalHub.js, Archives.js, SuanpanMixer.js (+export, +NanoGuide), Botany.js (+NanoGuide)
│   ├── StarChart.js (Dolly-Zoom with Rodrigues matrix keyframes, NanoGuide)
│   ├── TradeCircle.js (gravity-weighted + botanical + NanoGuide)
│   ├── Codex.js (Sovereign Codex: searchable, section-filtered, tier-gated help)

/app/backend/routes/
├── botany.py (catalog, garden, resonance, AI identify, gravity nodes)
├── mastery.py (balance-score algorithm, wheel-interaction tracking)
├── trade_circle.py (botanical-listing, gravity-weighted, suanpan-export bridge)
├── sovereign_math.py (ODEs, Lorenz Chaos, Rodrigues Matrix, Garden Derivatives)
├── sovereign_codex.py (Mastery-tiered help entries, Nano-Guides)
├── cosmic_state.py (UNIFIED master endpoint: tier-gated math bundle)
├── gravity.py, archives.py, atmosphere.py, observatory.py
├── content_factory.py, revenue.py, forge.py, nature.py, teachings.py, voice_command.py
```

## Unified Cosmic State Endpoint
```
GET /api/cosmic-state → tier-gated data bundle:
- Observer+: energies, stability, total_rate_of_change, garden_masses
- Synthesizer+: derivatives, deviations from mean
- Archivist+: 24hr ODE trajectory, peak/trough analysis, ODE parameters
- Sovereign: chaos prediction (Lorenz attractor, Lyapunov exponent, sensitivity)
```

## Global Audio Engine
```
SensoryContext provides:
- sovereignMute: boolean (localStorage persisted)
- sovereignMuteToggle(): logarithmic fade (500ms) + context.suspend()/resume()
- sovereignKillAll(): stops all oscillators, suspends all contexts
- All sound functions gate on sovereignMute
```

## Mastery Tier Algorithm
```
balance_score = diversity(30%) + equilibrium(30%) + consistency(20%) + exploration(20%)
Tiers: Observer(0-20) → Synthesizer(20.1-40) → Archivist(40.1-60) → Navigator(60.1-80) → Sovereign(80.1-100)
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

## Iteration History

### Iteration 217 — Phase A: Sovereign Math + Codex + Raycaster (Apr 2, 2026) — LATEST
- **Unified Cosmic State**: Single `GET /api/cosmic-state` endpoint consolidates ODE, Chaos, Matrix data
- **Sovereign Codex**: 14 tier-gated help entries, searchable, section-filtered, progressive disclosure
- **NanoGuide Tooltips**: Deployed on Botany, Trade Circle, Star Chart, Suanpan Mixer, Mission Control
- **ODE Energy Arcs**: Five Elements Wheel shows real-time energy levels as proportional arc indicators
- **Stability Indicator**: stable (green) / shifting (yellow) / volatile (red) status below wheel
- **Matrix Star Chart**: Rodrigues rotation keyframes drive camera traverse phase (fallback to lerp)
- **Mission Control Fix**: pointer-events: none on backdrop for 3D click-through, pulse animations
- **CosmicStateContext**: Global state provider for math data with 60s cache
- Tests: 100% (Iteration 217)

### Previous Iterations
- 216: Global Audio Engine (Zen Toggle, logarithmic fades, sovereign kill-all)
- 215: Cinematic UX (Dynamic Docking, Dolly-Zoom, Proximity Scaling)
- 214: System Triage (widget overlap, snap-shut, coordinate freeze)
- 213: Resonance + Balance Score + Suanpan Bridge
- 212: Five Elements Wheel + Phygital Marketplace
- 211: Botany Module (12 TCM plants, AI identify)
- 210: Dimensional Rift Fix (LlmChat signature)

## Upcoming Tasks (P1)
- **Active Resonance Pulse**: Rhythmic glow ring on nodes currently producing audio
- **Phase B: I Ching Logic Gates**: 64 hexagrams as boolean state-machine transitions, Changing Lines flicker

## Future/Backlog (P2)
- **Sovereign Tier Perks**: Custom element nodes, Global Trade Circle
- **Multi-Civilization Star Charts**: Hopi, Egyptian, Vedic maps (GPS-based)
- **Wisdom Prescriptions**: Personalized ritual plans from journal + gravity + mastery
- **Light Trails + Bloom**: Mission Control sphere trails on drag velocity

## Key Technical Rules
- **LlmChat**: Always `session_id` + `system_message`
- **WebGL**: Imperative mutation only
- **MongoDB**: Exclude `_id`
- **Audio**: All sound functions must check `sovereignMute`
- **Coordinates**: `isFinite()` before Three.js
- **Events**: `stopPropagation()` on floating panels
- **Cosmic State**: Use `useCosmicState()` hook for math data, 60s cache

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
