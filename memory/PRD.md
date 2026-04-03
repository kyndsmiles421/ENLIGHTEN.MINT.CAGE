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
  POST /api/mixer/projects/ripple (Ripple editing)
  POST /api/mixer/tracks/toggle-lock (Lock toggle)
  POST /api/mixer/auto-compose (AI Mantra DJ)
  GET  /api/mixer/auto-compose/goals (Goal catalog)

Generators:
  GET  /api/trade-circle/generators/catalog
  POST /api/trade-circle/purchase
  GET  /api/vault/generators, POST /api/vault/generators/toggle
```

## AI Mantra DJ Auto-Compose
```
6 Wellness Goals:
  Deep Sleep:     Delta/theta waves, descending volume, 90s base, 8s crossfade
  Laser Focus:    Alpha-beta entrainment, sustained volume, 60s base, 4s crossfade
  Energy Surge:   High-frequency activation, ascending volume, 45s base, 3s crossfade
  Sacred Healing: Solfeggio cascade, wave volume, 75s base, 6s crossfade
  Deep Meditation: Theta-alpha bridge, arc volume, 120s base, 10s crossfade
  Earth Grounding: Sub-bass resonance, sustained volume, 60s base, 5s crossfade

Behavior:
  - Selects tier-gated sources matching goal frequencies
  - Staggers tracks with cross-fade overlap
  - Adds hexagram resonance tone as sustain layer
  - Deducts 1 AI credit per composition
  - Returns ready-to-use track arrangement
```

## Backend Architecture (Refactored Apr 3, 2026)
```
/app/backend/
├── server.py          # Auto-router discovery, GZip, CORS, WebSocket, Stripe
├── deps.py            # MongoDB client (pooled), JWT auth, helpers
├── db_indexes.py      # 80+ indexes across 46 collections (startup)
├── tasks.py           # Background loops (push scheduler, credit refresh)
├── models.py          # Pydantic models
├── routes/            # 120+ auto-discovered route modules
```

## Iteration History
### Iteration 230 — Mixer Content Library Expansion (Apr 3, 2026) — LATEST
- Fixed broken video URLs (Pexels 403s for Starfield & Campfire)
- STOCK_SOURCES: 21 → 60 (12 discovery, 14 player, 16 ultra, 18 sovereign)
- VIDEO_OVERLAYS: 5 → 8 (all working URLs, tier-gated)
- LIGHT_MODES: 6 → 12, FRACTAL_TYPES: 6 → 12, VISUAL_FILTERS: 12 → 15
- TIER_COMPARISON: 10 → 14 rows (new: Sound Sources, Videos, Lights, Fractals, Filters)
- All items now have tier tags + tier badge rendering in picker UI
- Auto-compose goals updated with expanded source IDs
- Tests: Backend 100% (13/13), Frontend 100%

### Iteration 229 — Consciousness Widget Fix (Apr 3, 2026)
- ConsciousnessPanel made fully interactive (was "dead" widget)
- Header click → /mastery-avenues, level nodes → feature pages
- Quick XP actions (Breathe, Mood, Journal, Meditate) with navigation
- Recent XP activity toggle, locked level toast notifications
- Breathing.js duplicate key fix
- Tests: Backend 100% (15/15), Frontend 100% (12/12)

### Iteration 228 — AI Mantra DJ (Apr 3, 2026)
- 6 wellness goal auto-composition engine
- Cross-fade overlap + volume curves (5 types)
- Hexagram resonance integration
- Frontend DJ Auto button + goal card panel
- revenue.py fidelity_status bug fix
- Tests: Backend 100% (20/20), Frontend 100%

### Iteration 227 — Backend Refactoring (Apr 3, 2026)
- Auto-router discovery (136 imports → auto)
- 80+ DB indexes, GZip compression, pool tuning
- Tests: Backend 100% (24/24), Frontend 100%

### Iteration 226 — Ripple Editing (Apr 2, 2026)
### Iteration 225 — Intelligence Layer (Apr 2, 2026)
### Iteration 224 — 4-Tier + Bonus Packs (Apr 2, 2026)
### Iteration 223 — Divine Director v1 (Apr 2, 2026)

## Upcoming (P1)
- Phase 3 Polish: Light trails and bloom effects
- Generative Flourish Bonus: AI phonic resonance
- SuanpanMixer.js decomposition (1200+ lines)

## Future/Backlog (P2)
- Multi-Civilization Star Charts (Hopi, Egyptian, Vedic)
- External audio asset hosting
- Haptic API for mobile tactile feedback
- Pan + Reverb keyframe lanes
- NPU Priority / GPU edge hooks

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
