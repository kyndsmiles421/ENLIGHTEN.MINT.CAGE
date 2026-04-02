# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics. A "Phygital Marketplace" with a centralized "Central Bank" economic model, AI Content Broker revenue engine, and closed-loop content factory.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Iteration 198 — Music Theory Conservatory Module (Apr 2, 2026) — LATEST

**Music Theory / Conservatory (`/theory`):**
- Interactive Circle of Fifths visualized as a 12-sided dodecahedron with sacred geometry SVG lines
- 12 key nodes (C, G, D, A, E, B, F#, Db, Ab, Eb, Bb, F) — tap to play orchestral harmonics via MixerContext
- Three tabs: Circle of Fifths (theory), Practice (Solfeggio targets), Voice (real-time singing)
- Practice Mode: 6 Solfeggio frequency targets (432Hz-963Hz) with live Chladni pattern canvas
- Vocal Resonance: Web Audio API mic pitch detection via autocorrelation, accuracy bar, note detection
- Chladni patterns animate in real-time, "lock" to gold when hitting target frequency (>95% accuracy)
- Play Reference Tone button to hear target frequencies
- Lazy-loaded route at `/theory` in App.js
- Navigation link under Sanctuary category

**Resolution Context (Seed of Life Nodule):**
- 3-state performance toggle: Low (battery saver), Medium (balanced), High (unified field)
- Controls particle count, blur quality, animation scale, Moiré, Aura Wake, audio quality
- Seed of Life SVG icon in profile dropdown
- Fixed useResolution hook violation (moved from IIFE callback to component level)

**Orchestral Audio Engine (MixerContext upgrade):**
- Rich layered harmonics: fundamental + octave + fifth overtones
- Detuned unison for warmth, gentle vibrato LFO
- ADSR envelope with 0.8s attack ramp
- Reverb via delay feedback network

**Tests:** Iteration 198 — 100% Backend (11/11) / 100% Frontend

### Power Spot Admin Dashboard & Celestial UI Toggle (Apr 2, 2026)

**Power Spot Admin Dashboard (`/admin/power-spot`):**
- Leaflet map for GPS pin placement, CRUD for Power Spots
- "Go Live" toggle, Active Broadcasts panel, Live GPS tracking
- 500m proximity notifications on Cosmic Map

**Celestial Dimensional Toggle (in CosmicMap):**
- Ground/Celestial layer toggle, canvas-based Star Chart
- 6 constellation nodes with frequency alignment

### Synchronicity Events — Coven/Party System & Group Forging (Apr 2, 2026)

- WebSocket coven system at `/api/ws/sync`, create/join/leave with invite codes
- Real-time member tracking on Leaflet map
- Group Forging: averaged accuracy across coven members
- Coven Leaderboard with Roman numeral rankings

### Multi-State Emotion Layering (Apr 2, 2026)

- Multiple mood selection with additive sacred geometry Moiré patterns
- Tesla 3-6-9 nodal resonance visualization
- Frequency Recipe generation (culinary metaphor blends)
- Chorded frequency synthesis

### Aura Wake Physics (Apr 2, 2026)

- Trailing geometric ripples on Cosmic Map avatar
- CSS-based particle wake system

### Avatar Customization System (Apr 2, 2026)

- 12 sacred symbols, 10 colors, display name (max 20 chars)
- GET/PUT `/api/auth/avatar`

## Key Routes
- `/theory` — Music Theory Conservatory
- `/cosmic-map` — GPS Harvesting + Coven Panel + Aura Wake
- `/admin/power-spot` — Power Spot Admin Dashboard
- `/mood` — Multi-State Mood Tracker
- `/cosmic-mixer` — Frequency Mixer

## Key API Endpoints
- `POST /api/moods` — Log mood with frequencies
- `GET /api/moods/frequency-recipe` — Tesla Harmony Blend
- `WS /api/ws/sync` — Real-time Coven tracking
- `POST /api/sync/group-forge` — Group forging
- `GET /api/sync/leaderboard` — Coven rankings

## Upcoming Tasks (P1)
- Einstein Spatial Curvature (Gravitational Wells) — map GPS grid curvature
- Culinary Mode Mixer UI — "Spice Rack" frequency layout
- Botany: Plant identifier and gardening section

## Future/Backlog (P2)
- AR mechanics with `react-three-fiber` / AR.js
- Phygital Marketplace & Server-Side Escrow
- Tiered Subscription Matrix via Stripe

## Test Credentials
- User: `grad_test_522@test.com` / `password`

## Known Issues
- `GET /api/energy-gates/status` returns 500 (pre-existing, unrelated to current sprint)
