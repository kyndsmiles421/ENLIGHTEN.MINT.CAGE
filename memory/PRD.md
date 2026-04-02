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
├── botany.py (+resonance/{element} predictive synergy engine)
├── content_factory.py, revenue.py, forge.py, nature.py, teachings.py, voice_command.py (AI)
├── oracle.py, creation_stories.py, observatory.py, workshop.py

/app/frontend/src/
├── components/
│   ├── FiveElementsWheel.js (SVG pentagon + resonance meter + garden balance)
│   ├── SmartDock.js (bottom-left dock — event isolation fixed)
│   ├── CosmicAssistant.js (bottom-right chat — position: 148px)
│   ├── CosmicMixer.js (bottom-right mixer — position: 80px)
│   ├── orbital/ (9 files), StrokeTracer.js, trade/
├── pages/
│   ├── OrbitalHub.js, Archives.js, SuanpanMixer.js (+export), Botany.js, TradeCircle.js
│   ├── StarChart.js (coordinate NaN guards)
```

## Mastery Tier Algorithm (Balance Score)
```
balance_score = diversity(30%) + equilibrium(30%) + consistency(20%) + exploration(20%)
Tiers: Observer(0-20) → Synthesizer(20.1-40) → Archivist(40.1-60) → Navigator(60.1-80) → Sovereign(80.1-100)
Sovereign perks: Custom element nodes, Global Trade Circle, All locks removed, Hexagram keys
```

## Iteration History

### Iteration 214 — System Triage (Apr 2, 2026) — LATEST
**Bug Fix 1**: Widget Overlap — CosmicAssistant moved from bottom:88px → bottom:148px (68px separation from CosmicMixer at 80px)
**Bug Fix 2**: SmartDock Snap-Shut — Panel containers wrapped with onClick+onPointerDown stopPropagation to prevent event bubbling
**Bug Fix 3**: StarChart Coordinate Freeze — raDecToXYZ guards with isFinite() for ra, dec, radius; safe fallbacks for NaN/Infinity
**Bug Fix 4**: Balance Score Persistence — Cached in localStorage ('cosmic_balance_score') so UI doesn't flash on re-fetch
- Tests: 100% frontend (Iteration 214), all 4 bugs verified

### Iteration 213 — Resonance + Balance Score + Suanpan Bridge
- Resonance Compatibility (predictive synergy, energy forecast)
- Mastery Tier Balance Score (4-component formula, diversity/equilibrium/consistency/exploration)
- Suanpan → Trade Circle one-click export
- Tests: 23/23 passed

### Previous: 212 (Five Elements Wheel + Phygital), 211 (Botany), 210 (LlmChat Fix), 209-206

## Upcoming Tasks (P1)
- **Wisdom Prescriptions**: Personalized ritual plans from journal + gravity + mastery
- **Enhanced Trade Circle UI**: Apply visual_scale/visual_depth to physically size/position cards
- **AI Living Synthesis**: Gemini analysis when hovering connections between traditions

## Future/Backlog (P2)
- **I Ching Logic Gates**: 64 hexagrams as Boolean state-machine transitions. 6 binary inputs = compound key. "Changing Lines" (Yao) for transition states when garden balance shifts — wheel shows specific lines changing (yin↔yang) as heads-up before access locks transition.
- **Sovereign Tier Perks**: Custom element nodes on wheel, Global Trade Circle
- Multi-Civilization Star Charts (GPS-based)
- Progressive Disclosure Locks
- Orbital Constellations

## Key Technical Rules
- **LlmChat**: Always include `session_id` + `system_message`
- **WebGL**: Imperative mutation only (no declarative `<bufferAttribute>`)
- **MongoDB**: Always exclude `_id` from responses
- **Auth timing**: Check `loading` + `token` before API calls
- **Coordinates**: Always validate with `isFinite()` before passing to Three.js
- **Event bubbling**: Use `e.stopPropagation()` on floating panel containers

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
