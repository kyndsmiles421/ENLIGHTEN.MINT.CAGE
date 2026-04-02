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
│   ├── AuthContext.js, MixerContext.js, TempoContext.js, LanguageContext.js
├── components/
│   ├── SmartDock.js (Zen Toggle dock button with long-press kill-all)
│   ├── FiveElementsWheel.js (proximity scaling + resonance meter)
│   ├── CosmicAssistant.js (Dynamic Docking via MutationObserver)
│   ├── CosmicMixer.js (broadcasts data-mixer-open)
│   ├── orbital/ (9 files), trade/
├── pages/
│   ├── OrbitalHub.js, Archives.js, SuanpanMixer.js (+export), Botany.js
│   ├── StarChart.js (3-phase Dolly-Zoom)
│   ├── TradeCircle.js (gravity-weighted + botanical + frequency recipes)

/app/backend/routes/
├── botany.py (catalog, garden, resonance, AI identify, gravity nodes)
├── mastery.py (balance-score algorithm, wheel-interaction tracking)
├── trade_circle.py (botanical-listing, gravity-weighted, suanpan-export bridge)
├── gravity.py, archives.py, atmosphere.py, observatory.py
├── content_factory.py, revenue.py, forge.py, nature.py, teachings.py, voice_command.py (AI)
```

## Global Audio Engine
```
SensoryContext provides:
- sovereignMute: boolean (localStorage persisted)
- sovereignMuteToggle(): logarithmic fade (500ms) + context.suspend()/resume()
- sovereignKillAll(): stops all oscillators, suspends all contexts, clears source registry
- registerAudioContext(ctx): external AudioContexts subscribe to master switch
- registerAudioSource(source): visual breadcrumb tracking registry
- All sound functions (playClick, playChime, playCelebration, startAmbient) gate on sovereignMute

UI: Zen Toggle in SmartDock
- Quick tap: toggle mute (logarithmic fade)
- Long-press (1s): kill ALL audio sources (emergency brake)
- Green icon = active, Red icon = muted
- Active source count badge on button
- body[data-audio-muted] for cross-component awareness
```

## Mastery Tier Algorithm
```
balance_score = diversity(30%) + equilibrium(30%) + consistency(20%) + exploration(20%)
Tiers: Observer(0-20) → Synthesizer(20.1-40) → Archivist(40.1-60) → Navigator(60.1-80) → Sovereign(80.1-100)
```

## Iteration History

### Iteration 216 — Global Audio Engine (Apr 2, 2026) — LATEST
- **Zen Toggle**: Volume2/VolumeX button in SmartDock with green/red color states
- **Logarithmic Fade**: 500ms exponentialRampToValueAtTime on mute/unmute
- **Sovereign Kill All**: Long-press (1s) stops all oscillators, suspends all AudioContexts
- **Persistence**: localStorage (`cosmic_prefs.sovereignMute`) + body attribute (`data-audio-muted`)
- **Audio Source Registry**: Components can register/unregister active audio for visual tracking
- **Gate All Sound**: playClick, playChime, playCelebration, startAmbient check `sovereignMute`
- Tests: 100% (Iteration 216)

### Previous Iterations
- 215: Cinematic UX (Dynamic Docking, Dolly-Zoom, Proximity Scaling)
- 214: System Triage (widget overlap, snap-shut, coordinate freeze)
- 213: Resonance + Balance Score + Suanpan Bridge
- 212: Five Elements Wheel + Phygital Marketplace
- 211: Botany Module (12 TCM plants, AI identify)
- 210: Dimensional Rift Fix (LlmChat signature)
- 206-209: WebGL, Archives, Suanpan, Orbital Rotation

## Upcoming Tasks (P1)
- **Wisdom Prescriptions**: Personalized ritual plans from journal + gravity + mastery
- **Audio Breadcrumb Visualizer**: Pulsing glow ring on any node/sphere currently producing sound
- **Enhanced Trade Circle UI**: visual_scale/visual_depth to physically size listing cards

## Future/Backlog (P2)
- **I Ching Logic Gates**: 64 hexagrams, Changing Lines with glitch animation + Solfeggio hum
- **Sovereign Tier Perks**: Custom element nodes, Global Trade Circle
- **Light Trails + Bloom**: Mission Control sphere trails on drag velocity
- Multi-Civilization Star Charts (GPS-based)
- Progressive Disclosure Locks

## Key Technical Rules
- **LlmChat**: Always `session_id` + `system_message`
- **WebGL**: Imperative mutation only
- **MongoDB**: Exclude `_id`
- **Audio**: All sound functions must check `sovereignMute` before firing
- **Coordinates**: `isFinite()` before Three.js
- **Events**: `stopPropagation()` on floating panels

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
