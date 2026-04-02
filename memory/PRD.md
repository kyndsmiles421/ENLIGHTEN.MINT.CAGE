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
├── observatory.py, workshop.py, trade_circle.py (+ botanical listings, gravity-weighted)
├── content_factory.py, revenue.py, forge.py  (AI-powered, LlmChat fixed)
├── nature.py, teachings.py, voice_command.py  (AI-powered, LlmChat fixed)
├── oracle.py, creation_stories.py
├── botany.py (TCM Five Elements, AI Identify, garden)

/app/frontend/src/
├── components/
│   ├── orbital/ (9 files: GravityField, CentralOrb, etc.)
│   ├── FiveElementsWheel.js (interactive SVG pentagonal wheel)
│   ├── StrokeTracer.js, CosmicPrescription.js
│   ├── trade/ (TradeCircleWidgets, CosmicBroker, EscrowDashboard, etc.)
├── hooks/useHubAudio.js, useGravityManager.js
├── pages/OrbitalHub.js, Archives.js, SuanpanMixer.js, Botany.js, TradeCircle.js
```

## Iteration History

### Iteration 212 — Five Elements Wheel + Phygital Marketplace (Apr 2, 2026) — LATEST
**Enhancement 1**: Interactive Five Elements Wheel (SVG)
- Pentagon layout: Wood/Fire/Earth/Metal/Water nodes with element colors
- Generating cycle (Sheng): dashed outer arrows between adjacent elements
- Controlling cycle (Ke): inner star pattern with red dashed lines
- Click to "solo" an element — filters plant list via `elementFilter` state
- Gravity formula breakdown: `Mass = Base(60) + Element + Nature + Meridian + Rarity`
- Garden Balance bar: color-coded element distribution of user's garden
- Plant counts per element node

**Enhancement 2**: Phygital Marketplace (Gravity-Weighted Trade)
- New trade categories: `botanical` and `frequency_recipe`
- `POST /api/trade-circle/botanical-listing`: creates listings with gravity_mass computed from TCM properties
- `GET /api/trade-circle/gravity-weighted`: returns listings sorted by mass with visual_scale (0.8-1.2x) and visual_depth
- Listing cards show gravity mass badges (`m78 741Hz`)
- Tests: 100% Backend / 100% Frontend (16 tests)

### Iteration 211 — Botany & Gardening Module + Archives Fix (Apr 2, 2026)
- 12-plant TCM catalog, Five Elements → Solfeggio frequency mapping
- Garden (max 24), daily nurture, 6 growth stages, AI identify via Gemini
- Archives auth timing fix
- Tests: 18/18 passed

### Previous Iterations (206-210)
- 206: Abyss Refactor + Atmospheric Synchrony
- 207: Einstein Spatial Curvature + WebGL mesh
- 208: Archives + Suanpan + Tidal Force
- 209: Ring Rotation + Inspect + Homepage Wiring
- 210: Dimensional Rift Fix (LlmChat API signature)

## Energetic Profile Schema (Botany)
```
Mass = Base(60) + Element + Nature + Meridian + Rarity
Element weights: Wood=10, Fire=15, Earth=12, Metal=8, Water=14
Nature weights: Hot=15, Warm=10, Neutral=5, Cool=10, Cold=15
Rarity bonus: common=0, uncommon=5, rare=10, legendary=20
Meridian bonus: count * 3
Solfeggio: Wood=396Hz, Fire=528Hz, Earth=639Hz, Metal=741Hz, Water=852Hz
```

## Five Elements Cycles
```
Generating (Sheng): Wood→Fire→Earth→Metal→Water→Wood
Controlling (Ke): Wood→Earth, Fire→Metal, Earth→Water, Metal→Wood, Water→Fire
```

## Upcoming Tasks (P1)
- **Wisdom Prescriptions**: Personalized ritual plans from journal + gravity + mastery
- **Enhanced Trade Circle UI**: Gravity-weighted visual positioning (heavier items sink in grid)
- **Suanpan Recipe Export**: Allow exporting frequency recipes to Trade Circle as tradeable listings
- **AI Living Synthesis**: Gemini analysis when hovering connections between traditions

## Future/Backlog (P2)
- Multi-Civilization Star Charts (GPS-based with Hopi/Egyptian/Vedic overlays)
- Progressive Disclosure Locks (tier-gated access to deeper archives/market levels)
- I Ching Logic Gates, Orbital Constellations
- AR integration, Phygital recipe scanning
- Culinary Spice Rack UI, Cosmic Map GPS wells

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`

## Key Technical Rules
- **LlmChat**: Always include `session_id` + `system_message`
- **WebGL**: Imperative mutation only (no declarative `<bufferAttribute>`)
- **MongoDB**: Always exclude `_id` from responses
