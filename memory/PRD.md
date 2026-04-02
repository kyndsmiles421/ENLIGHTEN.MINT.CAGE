# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform. V2 "Sovereign Core" — Unified Simulation Architecture. Spatial Operating System governed by mathematical constants.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Three.js (imperative WebGL)
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API, Stripe (pending)
- **LLM Pattern**: `LlmChat(api_key, session_id, system_message).with_model("gemini", "gemini-3-flash-preview")`

## Architecture
```
/app/backend/routes/
├── gravity.py, archives.py, atmosphere.py
├── mastery.py (+balance-score algorithm, wheel-interaction tracking)
├── trade_circle.py (+botanical-listing, gravity-weighted, suanpan-export bridge)
├── botany.py (+resonance/{element} predictive synergy, catalog, garden, AI identify)
├── content_factory.py, revenue.py, forge.py, nature.py, teachings.py, voice_command.py (AI)

/app/frontend/src/
├── components/
│   ├── FiveElementsWheel.js (SVG pentagon + proximity scaling + resonance meter)
│   ├── SmartDock.js (event-isolated panels with stopPropagation)
│   ├── CosmicAssistant.js (Dynamic Docking — spring physics repositioning)
│   ├── CosmicMixer.js (broadcasts data-mixer-open via body attribute)
│   ├── orbital/ (9 files), StrokeTracer.js, trade/
├── pages/
│   ├── OrbitalHub.js, Archives.js, SuanpanMixer.js (+export), Botany.js
│   ├── StarChart.js (3-phase Dolly-Zoom: pullback→traverse→approach)
│   ├── TradeCircle.js
```

## Mastery Tier Algorithm (Balance Score)
```
balance_score = diversity(30%) + equilibrium(30%) + consistency(20%) + exploration(20%)
Tiers: Observer(0-20) → Synthesizer(20.1-40) → Archivist(40.1-60) → Navigator(60.1-80) → Sovereign(80.1-100)
Sovereign perks: Custom element nodes, Global Trade Circle, All locks removed, Hexagram keys
```

## Cinematic UX Features
- **Dynamic Docking**: CosmicAssistant uses MutationObserver on `data-mixer-open` body attribute. When mixer opens, assistant spring-transitions to avoid overlap (cubic-bezier(0.34, 1.56, 0.64, 1))
- **Proximity Scaling**: Five Elements Wheel nodes scale up to 15% as cursor approaches (distance < 80px). Shows proximity glow ring + frequency hint text
- **Dolly-Zoom**: Star Chart 3-phase camera: pullback (1.8x radius), traverse (shortest-path rotation), approach (target zoom)
- **Event Isolation**: SmartDock panels wrapped with onClick+onPointerDown stopPropagation

## Iteration History

### Iteration 215 — Cinematic UX Dynamics (Apr 2, 2026) — LATEST
**Enhancement 1**: Dynamic Docking — CosmicAssistant observes mixer state via MutationObserver, repositions with spring physics when mixer opens (bottom:148→20, right:20→80). 72px gap verified.
**Enhancement 2**: Star Chart Dolly-Zoom — 3-phase camera (pullback→traverse→approach) replaces linear interpolation for cinematic constellation navigation.
**Enhancement 3**: Proximity Scaling — Wheel nodes grow up to 15% with glow ring and frequency hints as cursor approaches within 80px.
**Enhancement 4**: SmartDock Event Isolation — Panel wrappers prevent click bubbling. Panels stay open during interaction.
- Tests: 100% (8/8) — Iteration 215

### Previous Iterations
- 214: System Triage (widget overlap, snap-shut, coordinate freeze, state persistence)
- 213: Resonance Compatibility + Balance Score + Suanpan Bridge
- 212: Five Elements Wheel + Phygital Marketplace
- 211: Botany Module (12 plants, TCM profiles, AI identify)
- 210: Dimensional Rift Fix (LlmChat)
- 206-209: WebGL, Archives, Suanpan, Orbital Rotation

## Upcoming Tasks (P1)
- **Wisdom Prescriptions**: Personalized ritual plans from journal + gravity + mastery
- **Enhanced Trade Circle UI**: Apply visual_scale/visual_depth to physically size listing cards
- **AI Living Synthesis**: Gemini analysis when hovering connections between traditions

## Future/Backlog (P2)
- **I Ching Logic Gates**: 64 hexagrams as Boolean state-machine transitions. 6 binary inputs = compound key. "Changing Lines" (Yao) with glitch animation + Solfeggio hum as threshold approaches
- **Sovereign Tier Perks**: Custom element nodes on wheel, Global Trade Circle
- **Light Trails**: Mission Control sphere trail renderer on drag velocity
- **Bloom Filter**: Sphere radiance when Garden Balance hits equilibrium
- Multi-Civilization Star Charts (GPS-based)
- Progressive Disclosure Locks
- Orbital Constellations

## Key Technical Rules
- **LlmChat**: Always `session_id` + `system_message`
- **WebGL**: Imperative mutation only
- **MongoDB**: Exclude `_id`
- **Auth**: Check `loading` + `token` before API calls
- **Coordinates**: `isFinite()` before Three.js
- **Events**: `stopPropagation()` on floating panels
- **Dynamic Docking**: Use body `data-*` attributes + MutationObserver for cross-component state

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
