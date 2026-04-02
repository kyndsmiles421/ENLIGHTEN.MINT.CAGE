# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Iteration 203 — Observatory Module (Apr 2, 2026) — LATEST

**The Observatory (`/observatory`):**
- **Orrery Tab**: Interactive SVG solar system with 8 animated planets orbiting the sun. Click any planet to hear its electromagnetic frequency via Web Audio API sonification.
- **Deep Sky Tab**: 10 notable stars (Sirius, Betelgeuse, Rigel, Vega, Polaris, etc.) with expandable detail cards showing distance, temperature, sonified frequency, constellation, and light-departure year.
- **Live Events Tab**: Real-time celestial events (meteor showers, solstices, equinoxes) with countdown. Current moon phase with SVG rendering and illumination percentage.
- **Data Sonification**: POST `/api/observatory/sonify` converts planet EM frequencies or star temperatures into audible tones with harmonic overtones.
- **Light-Time Explorer**: Visual bar chart showing how "old" light from each star is.
- Backend: 4 endpoints (planets, stars, events, sonify)
- Added as Observatory satellite on Orbital Hub outer ring (13 total satellites)

**Tests:** Iteration 203 — 100% Backend (25/25) / 100% Frontend (14/14)

### Iteration 202 — Orbital Hub Navigation (Apr 2, 2026)

- Central pulsing orb → Mission Control overlay (Profile, Settings, Resolution, Portal)
- 13 orbiting satellites (6 inner + 7 outer) with smooth requestAnimationFrame rotation
- Cosmic dust particles, SVG connection lines, immersive full-screen layout
- OrbCorner tether button on all non-hub pages
- Navbar hidden on /hub for immersion

### Iteration 201 — Brand Cleanup + Architect's Workshop (Apr 2, 2026)

- Workshop (`/workshop`): Sacred Geometry, Golden Ratio calculator, Resonance Mechanics, Materials Library

### Iteration 200 — Linguistic & Phonics (Apr 2, 2026)

- Phonics tab, Vowel Formant Tracker, Mastery Economy (3 tiers), Trade Circle escrow

### Iteration 198 — Conservatory (Apr 2, 2026)

- Circle of Fifths, Chladni patterns, Orchestral Engine, ResolutionContext

### Earlier Iterations

- Power Spots, Covens, Multi-State Moods, Aura Wake, Avatar System

## Key Routes
- `/hub` — Orbital Hub (central navigation)
- `/observatory` — The Observatory (Orrery, Deep Sky, Live Events)
- `/workshop` — Architect's Workshop
- `/theory` — Music Theory Conservatory
- `/cosmic-map` — GPS Harvesting
- `/mood` — Mood Tracker
- `/trade-circle` — Trade Circle

## Upcoming Tasks (P1)
- Einstein Spatial Curvature (Gravitational Wells) on Cosmic Map
- Culinary Mode Mixer UI — "Spice Rack" frequency layout
- Botany: Plant identifier and gardening section
- Progressive Disclosure — unlock satellites via mastery tiers
- Atmospheric audio cues when hovering satellite zones
- Focus Mode vs Utility Mode toggle

## Future/Backlog (P2)
- AR mechanics with `react-three-fiber` / AR.js
- Phygital Marketplace expansion
- Tiered Subscription Matrix via Stripe
- Blueprint Mode (drag-and-drop φ layout)
- Cosmic Truck digital twin

## Test Credentials
- User: `grad_test_522@test.com` / `password`
