# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics. A "Phygital Marketplace" with a centralized "Central Bank" economic model, AI Content Broker revenue engine, and closed-loop content factory.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Iteration 200 — Linguistic & Phonics Integration (Apr 2, 2026) — LATEST

**Phase 1: Phonetic-Geometric Bridge (Phonics Tab in Conservatory):**
- New "Phonics" tab in `/theory` page with Vowel Formant Tracker
- 5 cardinal vowels (A, E, I, O, U) mapped to sacred geometries via F1/F2 formant frequencies
- VowelChladniCanvas component: unique Chladni patterns per vowel with bloom animation
- FFT-based formant peak detection from live microphone input
- "Geometric Bloom" triggers when vowel sustained >90% confidence for 1.5 seconds
- Session bloom history tracking with visual indicators
- Auto-records mastery progress to backend on bloom

**Phase 2: Mastery Economy (Backend):**
- `mastery_tiers` collection tracking user progression across 3 tiers
- Tier 1 (Vowel Initiate): Master 5 vowels → unlocks basic phonetics + medium resolution
- Tier 2 (Harmonic Adept): Tesla 3-6-9 Harmonics → unlocks sacred root syllables + culinary spice rack
- Tier 3 (Unified Resonance): Full mastery → unlocks unified field + orchestral chord synthesis
- Endpoints: `GET /api/mastery/tier`, `POST /api/mastery/progress`, `GET /api/mastery/lessons`, `GET /api/mastery/vowel-reference`
- `mastery_events` collection for bloom event recording
- Tier advancement notifications via toast

**Phase 3: Trade Circle Linguistic Assets (Backend):**
- New asset types: `phonetic_mantra`, `vocal_signature`
- `POST /api/trade-circle/escrow/linguistic/create` — create escrow (requires Tier 1 mastery)
- `POST /api/trade-circle/escrow/{id}/verify` — resonance verification (≥85% accuracy completes trade)
- `GET /api/trade-circle/escrows` — user escrow history
- `POST /api/trade-circle/listings/linguistic` — create linguistic asset listings (requires Tier 1)
- Karma awards on completed escrow trades

**Tests:** Iteration 200 — 100% Backend (18/18) / 100% Frontend

### Iteration 198 — Music Theory Conservatory Module (Apr 2, 2026)

- Interactive Circle of Fifths dodecahedron (12 key nodes)
- Chladni pattern canvas with live microphone pitch detection
- Practice Mode: 6 Solfeggio frequency targets (432-963Hz)
- Voice tab: Real-time voice-to-geometry mapping
- Orchestral Audio Engine (MixerContext): layered harmonics, ADSR, vibrato
- ResolutionContext: 3-state performance toggle (Low/Medium/High)

### Power Spot Admin Dashboard & Celestial UI Toggle (Apr 2, 2026)

- Leaflet map for GPS Power Spot CRUD, Go-Live, Live GPS tracking
- 500m proximity notifications on Cosmic Map
- Celestial layer toggle with Star Chart canvas

### Synchronicity Events — Coven/Party System (Apr 2, 2026)

- WebSocket coven system at `/api/ws/sync`
- Group Forging with averaged accuracy
- Coven Leaderboard with Roman numeral rankings

### Multi-State Emotion Layering (Apr 2, 2026)

- Multiple mood selection with Moiré sacred geometry patterns
- Tesla 3-6-9 nodal resonance, Frequency Recipe generation

## Key Routes
- `/theory` — Music Theory Conservatory (Circle of Fifths, Practice, Phonics, Voice)
- `/cosmic-map` — GPS Harvesting + Coven Panel + Aura Wake
- `/admin/power-spot` — Power Spot Admin Dashboard
- `/mood` — Multi-State Mood Tracker
- `/cosmic-mixer` — Frequency Mixer
- `/trade-circle` — Trade Circle with Linguistic Assets

## Key API Endpoints
- `GET /api/mastery/tier` — User mastery tier and progress
- `POST /api/mastery/progress` — Record mastery achievements
- `GET /api/mastery/lessons` — Available lessons and completion
- `GET /api/mastery/vowel-reference` — Vowel formant data
- `POST /api/trade-circle/escrow/linguistic/create` — Linguistic asset escrow
- `POST /api/trade-circle/escrow/{id}/verify` — Resonance verification
- `POST /api/trade-circle/listings/linguistic` — Linguistic listings

## Upcoming Tasks (P1)
- Einstein Spatial Curvature (Gravitational Wells) — map GPS grid curvature
- Culinary Mode Mixer UI — "Spice Rack" frequency layout
- Botany: Plant identifier and gardening section

## Future/Backlog (P2)
- AR mechanics with `react-three-fiber` / AR.js
- Phygital Marketplace expansion
- Tiered Subscription Matrix via Stripe

## Test Credentials
- User: `grad_test_522@test.com` / `password`

## Known Issues
- `GET /api/energy-gates/status` returns 500 (pre-existing, unrelated)
