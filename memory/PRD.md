# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Iteration 201 — Brand Cleanup + Architect's Workshop (Apr 2, 2026) — LATEST

**Brand Cleanup:**
- Renamed "Positive Energy Bar Filling Kit" → "Cosmic Resonance Bar Kit" in science_history.py
- All HTML/manifest already correctly branded "The Cosmic Collective"

**Architect's Workshop (`/workshop`):**
- 4-tab Physics Engine: Sacred Geometry, Golden Ratio, Resonance Mechanics, Materials Library
- **Sacred Geometry**: 5 Platonic Solids (Tetrahedron/Cube/Octahedron/Dodecahedron/Icosahedron) with SVG visualizations, element mappings, structural analysis, construction applications, Euler's formula verification
- **Golden Ratio Calculator**: Input any dimension → get φ major/minor splits, nested divisions (φ^1 through φ^5), golden spiral SVG, real-world examples (DNA, Parthenon, Nautilus)
- **Resonance Mechanics**: Harmonic oscillation visualizer (nodes/antinodes on vibrating string, slider for harmonics 1-8), Inverse Square Law calculator (power + distance → dB SPL with falloff curve)
- **Materials Library**: 8 materials (Water, Sand, Glass, Steel, Oak, Concrete, Copper, Quartz Crystal) with density, speed of sound, resonance notes
- Backend: `workshop.py` with 5 endpoints (constants, platonic-solids, materials, golden-ratio, harmonic-nodes, inverse-square)
- Nav link under Explore category
- Tests: 100% Backend (26/26) / 100% Frontend

### Iteration 200 — Linguistic & Phonics Integration (Apr 2, 2026)

- Phonics tab in Conservatory: Vowel Formant Tracker (A/E/I/O/U), FFT detection, VowelChladniCanvas, Geometric Bloom
- Mastery Economy: 3-tier backend (Tier 1: vowels, Tier 2: Tesla 3-6-9, Tier 3: Unified Field)
- Trade Circle Linguistic Assets: phonetic_mantra/vocal_signature escrow with resonance verification

### Iteration 198 — Music Theory Conservatory (Apr 2, 2026)

- Circle of Fifths dodecahedron, Chladni patterns, mic pitch detection, Practice Mode
- Orchestral Audio Engine (MixerContext), ResolutionContext 3-state toggle

### Earlier Iterations (Apr 2, 2026)

- Power Spot Admin Dashboard + Live GPS tracking + 500m proximity
- Synchronicity Events: WebSocket Covens, Group Forging, Leaderboard
- Multi-State Emotion Layering: Moiré geometry, Tesla 3-6-9, Frequency Recipes
- Aura Wake Physics on Cosmic Map avatar
- Avatar Customization System

## Key Routes
- `/workshop` — Architect's Workshop (Sacred Geometry, Golden Ratio, Resonance, Materials)
- `/theory` — Music Theory Conservatory (Circle of Fifths, Practice, Phonics, Voice)
- `/cosmic-map` — GPS Harvesting + Coven Panel + Aura Wake
- `/admin/power-spot` — Power Spot Admin Dashboard
- `/mood` — Multi-State Mood Tracker
- `/trade-circle` — Trade Circle with Linguistic Assets

## Key API Endpoints
- `GET /api/workshop/platonic-solids` — 5 Platonic Solids with structural data
- `GET /api/workshop/materials` — 8 materials resonance library
- `GET /api/workshop/constants` — Universal constants (φ, g, c_s, h, f_s)
- `POST /api/workshop/golden-ratio` — Golden Ratio calculator
- `POST /api/workshop/harmonic-nodes` — Harmonic oscillation nodes/antinodes
- `POST /api/workshop/inverse-square` — Inverse Square Law calculator
- `GET /api/mastery/tier` — User mastery tier and progress
- `POST /api/mastery/progress` — Record mastery achievements
- `POST /api/trade-circle/escrow/linguistic/create` — Linguistic asset escrow

## Upcoming Tasks (P1)
- Einstein Spatial Curvature (Gravitational Wells) — map GPS grid curvature
- Culinary Mode Mixer UI — "Spice Rack" frequency layout
- Botany: Plant identifier and gardening section
- Blueprint Mode: drag-and-drop layout tool using φ proportions

## Future/Backlog (P2)
- AR mechanics with `react-three-fiber` / AR.js
- Phygital Marketplace expansion
- Tiered Subscription Matrix via Stripe
- Cosmic Truck Blueprint template
- Load Distribution Calculator

## Test Credentials
- User: `grad_test_522@test.com` / `password`
