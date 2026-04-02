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
├── botany.py                                   (NEW: TCM Five Elements, AI Identify)

/app/frontend/src/
├── components/orbital/ (9 files: GravityField, CentralOrb, etc.)
├── components/StrokeTracer.js, CosmicPrescription.js
├── hooks/useHubAudio.js, useGravityManager.js
├── pages/OrbitalHub.js, Archives.js, SuanpanMixer.js, Botany.js
```

## Iteration History

### Iteration 211 — Botany & Gardening Module + Archives Fix (Apr 2, 2026) — LATEST
**New Feature**: Full TCM Botany module with energetic profiles
- 12-plant catalog with Five Elements mapping (Wood/Fire/Earth/Metal/Water)
- TCM Nature classification (Hot/Warm/Neutral/Cool/Cold)
- Gravity mass formula: base(60) + element_weight + nature_weight + meridian_bonus + rarity_bonus
- Element → Solfeggio frequency: Wood=396Hz, Fire=528Hz, Earth=639Hz, Metal=741Hz, Water=852Hz
- Personal garden (max 24) with daily nurture & 6 growth stages (Seed→Transcendent)
- AI plant identification via Gemini (returns TCM profile)
- Five Elements map with generating/controlling cycles
- Gravity nodes endpoint for Spatial OS integration
- Rarity-based tier locking (common=observer, uncommon=synthesizer, rare=archivist, legendary=navigator)
**Bugfix**: Archives auth timing - now checks `loading` + `token` before API calls
- Tests: 100% Backend / 100% Frontend (18 tests)

### Iteration 210 — Dimensional Rift Fix (Apr 2, 2026)
**Critical Bugfix**: Fixed 7 backend files using deprecated LlmChat API
- Tests: 100% Backend / 100% Frontend

### Iteration 209 — Ring Rotation + Inspect + Homepage Wiring
### Iteration 208 — Archives + Suanpan + Tidal Force
### Iteration 207 — Einstein Spatial Curvature
### Iteration 206 — Abyss Refactor + Atmospheric Synchrony

## Energetic Profile Schema (Botany)
```
Plant {
  element: Wood|Fire|Earth|Metal|Water    → frequency (Solfeggio)
  nature: Hot|Warm|Neutral|Cool|Cold      → gravity weight
  tastes: Sour|Bitter|Sweet|Pungent|Salty → element correspondence
  meridians: [Spleen, Lung, Heart, ...]   → meridian bonus to mass
  rarity: common|uncommon|rare|legendary  → mastery tier gate
  gravity_mass: calculated(60-100)
  frequency: derived from element
}
```

## Upcoming Tasks (P1)
- **Phygital Marketplace / Trade Circle**: Gravity-weighted items with literal mass, Suanpan recipe trading
- **Wisdom Prescriptions**: Personalized ritual plans from journal + gravity + mastery
- **AI Living Synthesis**: Gemini analysis when hovering connections between traditions
- **Enhanced Archive Visualizations**: Tier-dependent 3D immersion
- **I Ching Logic Gates**: Hexagram puzzles for tier advancement
- **Orbital Constellations**: Pull 3+ related satellites together → hidden content

## Future/Backlog (P2)
- Multi-Civilization Star Charts (GPS-based with Hopi/Egyptian/Vedic overlays)
- Progressive Disclosure Locks (tier-gated access to deeper archives/market levels)
- Culinary Spice Rack UI, Cosmic Map GPS wells
- AR integration, Phygital recipe scanning

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
