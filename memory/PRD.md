# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Iteration 202 — Orbital Hub Navigation System (Apr 2, 2026) — LATEST

**Orbital Hub (`/hub`):**
- Central pulsing orb → tap opens Mission Control overlay
- 12 orbiting satellites (6 inner core tools + 6 outer deeper tools) → click navigates to full-page routes
- Inner ring (radius 160px, full speed): Mood Engine, Soundscape, Cosmic Map, Breathwork, Meditation, Conservatory
- Outer ring (radius 245px, 0.55x speed): Workshop, Star Chart, Trade Circle, Oracle, Games, Journal
- Cosmic dust particles (40 floating particles with random drift)
- SVG connection lines from orb to satellites (brighten on hover)
- requestAnimationFrame-driven smooth orbital rotation
- Navbar hidden on hub page for full immersion

**Mission Control Overlay:**
- Profile, Dashboard, Settings, Mastery Tiers, Analytics, Admin quick-nav actions
- Resolution toggle (Low/Medium/High) with 3-dot indicator
- "The Cosmic Collective Portal" link
- Sign Out button
- Blurred backdrop with centered panel

**OrbCorner (Tether Button):**
- Fixed bottom-left (z-45) pulsing orb on all non-hub pages
- Click returns to /hub, right-click opens Mission Control
- Hidden on /hub, /, /auth, /intro

**Tests:** Iteration 202 — 100% Backend / 100% Frontend

### Iteration 201 — Brand Cleanup + Architect's Workshop (Apr 2, 2026)

- Renamed "Positive Energy Bar" → "Cosmic Resonance Bar Kit"
- Workshop (`/workshop`): 4-tab Physics Engine — Sacred Geometry (5 Platonic Solids), Golden Ratio calculator, Resonance Mechanics (harmonics + inverse square), Materials Library (8 materials)

### Iteration 200 — Linguistic & Phonics Integration (Apr 2, 2026)

- Phonics tab: Vowel Formant Tracker (A/E/I/O/U), FFT detection, VowelChladniCanvas, Geometric Bloom
- Mastery Economy: 3-tier backend (Tier 1: vowels, Tier 2: Tesla 3-6-9, Tier 3: Unified Field)
- Trade Circle Linguistic Assets: phonetic_mantra/vocal_signature escrow with resonance verification

### Iteration 198 — Music Theory Conservatory (Apr 2, 2026)

- Circle of Fifths dodecahedron, Chladni patterns, mic pitch detection, Practice Mode
- Orchestral Audio Engine, ResolutionContext 3-state toggle

### Earlier Iterations

- Power Spot Admin, Synchronicity Events (WebSocket Covens), Multi-State Emotion Layering, Aura Wake, Avatar Customization

## Key Routes
- `/hub` — Orbital Hub (central orb + satellite navigation)
- `/workshop` — Architect's Workshop
- `/theory` — Music Theory Conservatory
- `/cosmic-map` — GPS Harvesting + Coven Panel
- `/mood` — Multi-State Mood Tracker
- `/trade-circle` — Trade Circle with Linguistic Assets

## Upcoming Tasks (P1)
- Einstein Spatial Curvature (Gravitational Wells) on Cosmic Map
- Culinary Mode Mixer UI — "Spice Rack" frequency layout
- Botany: Plant identifier and gardening section
- Guided Tour / Progressive Disclosure (unlock tools via mastery)
- Focus Mode vs Utility Mode toggle (UI Density)
- Atmospheric audio cues when hovering satellite zones

## Future/Backlog (P2)
- AR mechanics with `react-three-fiber` / AR.js
- Phygital Marketplace expansion
- Tiered Subscription Matrix via Stripe
- Blueprint Mode (drag-and-drop φ layout)
- Cosmic Truck digital twin

## Test Credentials
- User: `grad_test_522@test.com` / `password`
