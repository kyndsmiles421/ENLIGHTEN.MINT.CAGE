# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a full-stack wellness platform. V4 "Intelligence Layer" — Hexagram-based AI recommendations, keyframe automation (Volume + Frequency), and 4-tier subscription ecosystem.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Three.js
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API

## Two-Axis Progression (Mastery + Subscription)
### Mastery: Observer → Synthesizer → Archivist → Navigator → Sovereign (earned)
### Mixer: Discovery → Player → Ultra Player → Sovereign (paid, separate)

## 4-Tier Mixer Subscription
```
Discovery (Free):    3 tracks, 5 AI/mo, 44.1kHz, 15-30s Sacred Assembly, 1.0x bonus
Player ($9.99):      8 tracks, 40 AI/mo, 48kHz, 5-8s, 1.1x bonus
Ultra Player ($24.99): 20 tracks + keyframes, 150 AI/mo, 88.2kHz, 2-3s, 1.15x bonus
Sovereign ($49.99):  Unlimited + nested, 250+ AI + NPU, 96kHz Spatial, instant, 1.25x
```

## API Endpoints
```
Mixer Director:
  GET  /api/mixer/subscription, POST /api/mixer/subscription/upgrade
  POST /api/mixer/projects, GET /api/mixer/projects, GET /api/mixer/projects/{id}
  DELETE /api/mixer/projects/{id}
  GET  /api/mixer/sources (21 tier-gated sources)
  GET  /api/mixer/bonus-packs, POST /api/mixer/bonus-packs/purchase
  GET  /api/mixer/bonus-packs/owned
  GET  /api/mixer/recommendations (Hexagram-based)

Generators:
  GET  /api/trade-circle/generators/catalog
  POST /api/trade-circle/purchase
  GET  /api/vault/generators, POST /api/vault/generators/toggle
```

## Hexagram Recommendation Engine
```
Lower Trigram (bits 0-2) → Soul/Vocal pack mapping:
  Earth→Vedic, Thunder→Hopi, Water→Vedic, Lake→Hopi
  Mountain→Solfeggio, Fire→Solfeggio, Wind→Vedic, Heaven→Solfeggio

Upper Trigram (bits 3-5) → Environment/Visual pack mapping:
  Earth→DeepEarth, Thunder→SacredGeometry, Water→DeepEarth, Lake→SacredGeometry
  Mountain→DeepEarth, Fire→SacredGeometry, Wind→SacredGeometry, Heaven→DeepEarth

Stagnation Detection:
  Hexagrams 12,23,29,36,39,47 + avg_freq > 600Hz → grounding override
  Inserts Deep Earth Resonance as priority recommendation

Tone Logic:
  Owned packs → "soft" (gentle reminder to activate)
  Unowned packs → "active" (explains energetic need + purchase conversion)
```

## Keyframe Automation (Ultra Player+)
```
Per-track automation lanes: Volume (0-1) + Frequency (0-maxHz)
SVG-based curve drawing: click to add control points
Golden Ratio snap lines: Phi intervals for harmonic alignment
Stored as: keyframes_volume/keyframes_frequency arrays in track data
Saved/loaded with project CRUD
Double-click control point to remove
```

## Bonus Wrapped Packs (5 packs)
```
Vedic Vocal Suite (Player, 25c)         → +10% AI Gen Speed
Hopi Chant Collection (Player, 30c)     → +15 AI Credits
Solfeggio Master Scale (Ultra, 40c)     → +15% Render Speed
Sacred Geometry Visual Pack (Ultra, 35c) → +10% Export Speed
Deep Earth Resonance Suite (Sov, 50c)   → +20% Processing Speed
```

## Backend Architecture (Refactored Apr 3, 2026)
```
/app/backend/
├── server.py          # Auto-router discovery, GZip, CORS, WebSocket, Stripe webhook
├── deps.py            # MongoDB client (pooled), JWT auth, helpers
├── db_indexes.py      # 80+ indexes across 46 collections (startup)
├── tasks.py           # Background loops (push scheduler, credit refresh)
├── models.py          # Pydantic models
├── routes/            # 120+ auto-discovered route modules
│   ├── auth.py, mixer_director.py, generators.py, etc.
```

### Refactoring Completed (Iteration 227)
- server.py: 476 → 164 lines (65% reduction) via auto-router discovery
- Zero indexes → 80+ indexes on 46 collections (db_indexes.py)
- GZip compression middleware (500+ byte responses)
- MongoDB connection pool: maxPoolSize=50, minPoolSize=5
- Background tasks extracted to tasks.py

## Iteration History
### Iteration 227 — Backend Refactoring (Apr 3, 2026) — LATEST
- Auto-router discovery replaces 136 manual imports
- Database indexes for all 46 heavily-queried collections
- GZip compression middleware
- MongoDB connection pooling optimization
- Background task extraction
- Tests: Backend 100% (24/24), Frontend 100%

### Iteration 226 — Ripple Editing (Apr 2, 2026)
- Ripple Edit computation (delta shifts unlocked tracks)
- Lock Toggle UI per track
- Keyframe clamping on duration change
- Tests: Backend 100% (13/13), Frontend 100%

### Iteration 225 — Intelligence Layer (Apr 2, 2026)
- Hexagram-based recommendation engine
- Keyframe Automation UI (Volume + Frequency SVG curves)
- Auth timing fix

### Iteration 224 — 4-Tier + Bonus Packs (Apr 2, 2026)
### Iteration 223 — Divine Director v1 (Apr 2, 2026)
### Iteration 222 — Tiered Payable Bonuses (Apr 2, 2026)
### Iterations 217-221 — Orbital Architecture, Audio, I Ching

## Upcoming (P0)
- AI "Mantra DJ" Auto-Edit (cross-faded auto-composition)

## Upcoming (P1)
- Phase 3 Polish: Light trails and bloom effects
- Generative Flourish Bonus: AI improvised phonic resonance

## Future/Backlog (P2)
- Multi-Civilization Star Charts (Hopi, Egyptian, Vedic)
- External audio asset hosting
- Haptic API for mobile tactile feedback
- Sovereign Tier Perks, Wisdom Prescriptions
- Pan + Reverb keyframe lanes
- NPU Priority / GPU edge hooks

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
