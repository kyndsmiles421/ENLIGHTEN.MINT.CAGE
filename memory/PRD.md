# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with mystical/divination systems, AI guidance, cinematic visuals, and MMORPG mechanics. V2 "Sovereign Core" — Unified Simulation Architecture where every system feeds into every other.

## Tech Stack
- **Frontend**: React 19 (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Three.js (imperative)
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API (free), Stripe (pending)
- **Note**: React Three Fiber (R3F v9) was attempted but incompatible with React 19 reconciler → switched to imperative Three.js for WebGL

## What's Been Implemented

### Iteration 207 — Einstein Spatial Curvature + GravityManager (Apr 2, 2026) — LATEST

**Backend Gravity System:**
- `/api/gravity/nodes` — 12 seeded gravity nodes with rich data models:
  - Categories: vedic, hermetic, egyptian, hopi, sacred_geometry, star_chart, frequency
  - Each node: `{ id, label, type, frequency, origin_language, star_coordinate: {ra, dec, constellation}, gravity_mass, tier_required, category, description, trinity: {origin, synthesis, frequency_hz} }`
  - Tier-based unlocking (observer → synthesizer → archivist → navigator → sovereign)
- `/api/gravity/field` — Field parameters for WebGL mesh
- `/api/gravity/interact` — Records interactions, accumulates dwell_seconds, auto-progresses mastery tiers

**WebGL Gravity Field:**
- Imperative Three.js mesh deformation (64x64 subdivision wireframe plane)
- Grid physically "sags" around gravity nodes — high-mass nodes create deeper wells
- Point lights at well positions glow with category-specific colors
- 200 star dust particles rotate slowly in background
- Gentle ambient wave animation on the mesh surface
- Error boundary protects against WebGL failures

**Gravity-Responsive UI Physics:**
- `useGravityManager` hook calculates per-satellite spring damping and stiffness
- Satellites near high-mass nodes move slower (higher damping, lower stiffness)
- Both backend gravity nodes and active satellites contribute to mesh deformation

**Tests:** 100% Backend / 100% Frontend (Iteration 207)

### Iteration 206 — Abyss Refactor + Atmospheric Synchrony (Apr 2, 2026)
- Split OrbitalHub.js (582 lines) into 9 modular files
- Abyss 70% viewport expansion, Fibonacci spiral, drag-to-extract with haptics
- Double-tap Zen Reset, active satellite dimming
- Weather-driven ambient audio drone, temperature-modulated pitch
- Weather-responsive central orb pulse speed

### Earlier Iterations (198-205)
- MusicTheory.js, Workshop.js, Observatory.js, Atmosphere.py
- Mastery Tiers, Linguistic Escrow, NWS Weather API
- Orbital Hub navigation system, Mission Control, OrbCorner

## Architecture
```
/app/
├── backend/
│   ├── routes/
│   │   ├── gravity.py          # 12 gravity nodes, interact, field params
│   │   ├── atmosphere.py       # NWS Weather data API
│   │   ├── mastery.py          # Tier tracking & unlocks
│   │   ├── observatory.py      # Planet properties & sonification
│   │   ├── workshop.py         # Platonic solids, Golden ratio
│   │   ├── trade_circle.py     # Linguistic/Phonetic asset Escrow
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── orbital/
│   │   │   │   ├── constants.js       # ALL_SATELLITES, ZONE_AUDIO, WEATHER_*
│   │   │   │   ├── GravityField.js    # Imperative Three.js WebGL mesh
│   │   │   │   ├── CentralOrb.js      # 70% Abyss + weather pulse
│   │   │   │   ├── AbyssSatellite.js  # Drag-to-extract + haptics
│   │   │   │   ├── ActiveSatellite.js # Gravity-responsive physics
│   │   │   │   ├── ConnectionLines.js # SVG tether lines
│   │   │   │   ├── WeatherRibbon.js   # Weather + ambience indicator
│   │   │   │   ├── CosmicDust.js      # Particle overlay
│   │   ├── hooks/
│   │   │   ├── useHubAudio.js         # Satellite + weather ambience
│   │   │   ├── useGravityManager.js   # Gravity physics calculations
│   │   ├── pages/
│   │   │   ├── OrbitalHub.js          # Lean orchestrator (~200 lines)
```

## Gravity Node Data Model
```json
{
  "id": "om-vedic",
  "label": "The Sacred Om",
  "type": "teaching",
  "frequency": 136.1,
  "origin_language": "Sanskrit",
  "star_coordinate": {"ra": 18.62, "dec": 38.78, "constellation": "Lyra"},
  "gravity_mass": 92,
  "tier_required": "observer",
  "category": "vedic",
  "trinity": {
    "origin": "Mandukya Upanishad text...",
    "synthesis": "136.1Hz aligns with Earth's orbital year-tone...",
    "frequency_hz": 136.1
  }
}
```

## Mastery Tier Progression
- **Observer** (default): Basic hub access
- **Synthesizer**: 120s dwell + 5 interactions
- **Archivist**: 600s dwell + 15 interactions
- **Navigator**: 1800s dwell + 30 interactions
- **Sovereign**: 3600s dwell + 50 interactions

## Upcoming Tasks (P1)
- **Culinary "Spice Rack" Mixer**: Refactor frequency selector into shelf/aromatic layout. Mix frequencies + contemplation intensity → botanical recipe codes. Frequency changes propagate to gravity field (interconnected systems).
- **Deep-Dive Archives / Trinity View**: Every tradition gets three layers (Origin, Synthesis, Frequency). Progressive disclosure locked behind mastery tiers. Multi-language overlays.
- **Botany/Gardening Module**: Camera-based plant ID (PlantNet API) + curated database. Energetic profiles. Wellness sync (plants → sound baths + teachings).

## Future/Backlog (P2)
- Cosmic Map with Gravitational Wells (GPS sags at significant locations)
- Multi-civilization star chart overlays (Hopi, Egyptian, Vedic)
- Trade Circle as transactional layer with gravity-weighted marketplace listings
- Phygital Marketplace + Stripe subscriptions
- AR mechanics with Three.js/AR.js
- Spice Rack recipe → real-world botanical infusion codes (Positive Energy Bar bridge)

## Test Credentials
- User: `grad_test_522@test.com` / `password`
