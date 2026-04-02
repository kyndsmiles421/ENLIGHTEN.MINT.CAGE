# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform. V2 "Sovereign Core" — Unified Simulation Architecture. Every system feeds into every other. Spatial Operating System governed by mathematical constants.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Three.js (imperative WebGL)
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API (free), Stripe (pending)
- **LLM Pattern**: `LlmChat(api_key, session_id, system_message)` + `.with_model("gemini", "gemini-3-flash-preview")` + `await .send_message(UserMessage(text=...))`

## Architecture
```
/app/backend/routes/
├── gravity.py, archives.py, atmosphere.py, mastery.py
├── observatory.py, workshop.py, trade_circle.py
├── content_factory.py, revenue.py, forge.py  (AI-powered, LlmChat fixed)
├── nature.py, teachings.py, voice_command.py  (AI-powered, LlmChat fixed)
├── oracle.py, creation_stories.py             (AI-powered, working)

/app/frontend/src/
├── components/orbital/ (9 files: GravityField, CentralOrb, etc.)
├── components/StrokeTracer.js, CosmicPrescription.js
├── hooks/useHubAudio.js, useGravityManager.js
├── pages/OrbitalHub.js, Archives.js, SuanpanMixer.js
```

## Iteration History

### Iteration 210 — Dimensional Rift Fix (Apr 2, 2026) — LATEST
**Critical Bugfix**: Fixed 7 backend files using deprecated LlmChat API:
- Old: `LlmChat(api_key=KEY)` + `.chat([UserMessage(content=...)])`
- New: `LlmChat(api_key=KEY, session_id='...', system_message='...')` + `.send_message(UserMessage(text=...))`
- Files fixed: content_factory.py, revenue.py, forge.py (2 calls), nature.py, teachings.py, voice_command.py
- Result: All AI endpoints now returning valid responses (mantras, interpretations, names)
- Tests: 100% Backend / 100% Frontend

### Iteration 209 — Ring Rotation + Inspect + Homepage Wiring
- Orbital ring rotation with momentum/friction/snap-to-grid
- Long-press inspect (SatelliteInspector with Trinity View)
- Homepage wiring (no dead ends)
- Snapped satellite "active" label

### Iteration 208 — Archives + Suanpan + Tidal Force
- Deep-Dive Archives (6 entries, 5+ languages, stroke tracing)
- Suanpan abacus frequency mixer
- Tidal force mesh warping + harmonic chords

### Iteration 207 — Einstein Spatial Curvature
- 12 gravity nodes, WebGL mesh deformation

### Iteration 206 — Abyss Refactor + Atmospheric Synchrony
- 70% viewport, Fibonacci spiral, Zen Reset, weather audio

## Upcoming Tasks (P1)
- **AI Living Synthesis**: Gemini analysis when hovering connections between traditions
- **Enhanced Archive Visualizations**: Tier-dependent immersion depth (3D for high-tier)
- **Stroke-order in Abyss**: Trace characters directly in Hub
- **Vedic Math Sutras**: Interactive frequency calculations
- **I Ching Logic Gates**: Hexagram puzzles for tier advancement
- **Orbital Constellations**: Pull 3+ related satellites together → hidden content

## Future/Backlog (P2)
- Culinary Spice Rack UI, TCM Botany, Cosmic Map GPS wells
- Trade Circle marketplace, Stripe, AR, Phygital recipes

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
