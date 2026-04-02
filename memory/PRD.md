# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with mystical/divination systems, AI guidance, cinematic visuals, and MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API (free), Stripe (pending)

## What's Been Implemented

### Iteration 206 — Abyss Refactor + Atmospheric Synchrony + Drag-to-Extract (Apr 2, 2026) — LATEST

**Major Refactoring:**
- Split `OrbitalHub.js` (582 lines) into 9 modular files:
  - `components/orbital/constants.js` — ALL_SATELLITES, ZONE_AUDIO, WEATHER_AUDIO_MAP, WEATHER_EFFECTS
  - `components/orbital/CosmicDust.js` — Particle effect
  - `components/orbital/WeatherRibbon.js` — Weather display with ambience indicator
  - `components/orbital/AbyssSatellite.js` — Drag-to-extract with surface tension
  - `components/orbital/ActiveSatellite.js` — Orbiting satellite with dimming
  - `components/orbital/ConnectionLines.js` — SVG lines with dimming
  - `components/orbital/CentralOrb.js` — 70% viewport expansion + weather pulse
  - `hooks/useHubAudio.js` — Satellite hover + weather ambience audio
  - `pages/OrbitalHub.js` — Lean orchestrator (~180 lines)

**Abyss UX (P0 — Complete):**
- Central orb expands to 70% of viewport (min(innerWidth, innerHeight) * 0.35 radius)
- Dormant satellites arrange in Fibonacci spiral (golden angle = PI*(3-sqrt(5)))
- Drag-to-extract: drag a dormant satellite past the surface tension boundary to activate
- Haptic pulse (navigator.vibrate) on satellite extraction
- Surface tension ring visual indicator at 90% of Abyss radius
- Active satellites dim (opacity 0.2, blur 2px) when Abyss is open
- Active orbit radius pushes outward 35% when Abyss expands
- Abyss backdrop (fixed overlay) click-to-close
- Double-tap Zen Reset (two taps within 300ms) — collapses ALL satellites to dormant

**Atmospheric Synchrony (P1 — Complete):**
- Weather-driven ambient audio drone via useHubAudio hook
- Weather categories map to audio: clear=528Hz/sine, fog=369Hz/sine, rain=285Hz/triangle, snow=432Hz/sine, thunderstorm=174Hz/sawtooth, wind=256Hz/triangle
- LFO modulation per weather type (fog: slow 0.15Hz, thunderstorm: fast 4Hz)
- Temperature modulates pitch (±0.3Hz per degree from 60°F)
- Ambience activates on first user interaction (respects browser autoplay policy)
- WeatherRibbon shows pulsing "synced" indicator when ambience is active
- Central orb pulse speed adapts to weather (clear: 5s, thunderstorm: 1.5s)

**Tests:** 100% Backend / 100% Frontend (Iteration 206)

### Iteration 205 — Abyss UX + NWS Weather + Weather Ribbon (Apr 2, 2026)
- Abyss activation/deactivation system, boolean persistence, elastic orbits
- NWS Weather API proxy, geolocation-aware, weather-to-frequency mapping
- Glassmorphic weather ribbon, seeing quality for stargazing

### Iteration 203 — Observatory (Apr 2, 2026)
- Orrery, Deep Sky (10 stars), Live Events, Data Sonification

### Iteration 202 — Orbital Hub Navigation (Apr 2, 2026)
- Central orb, 13 satellites, Mission Control, OrbCorner, cosmic dust

### Iteration 201 — Workshop + Brand Cleanup (Apr 2, 2026)
- Sacred Geometry, Golden Ratio, Resonance Mechanics, Materials Library

### Iteration 200 — Phonics + Mastery Economy (Apr 2, 2026)
- Vowel Formant Tracker, 3-tier mastery, linguistic asset escrow

### Iteration 198 — Conservatory (Apr 2, 2026)
- Circle of Fifths, Chladni, Orchestral Engine, ResolutionContext

## Key Routes
- `/hub` — Orbital Hub (Abyss + Weather + Satellites)
- `/observatory` — The Observatory
- `/workshop` — Architect's Workshop
- `/theory` — Music Theory Conservatory
- `/cosmic-map` — GPS Harvesting
- `/mood` — Mood Tracker

## Upcoming Tasks (P1)
- Einstein Spatial Curvature (Gravitational Wells) on Cosmic Map — GPS grid "sags" around high-energy zones/covens
- Culinary Mode Mixer UI — "Spice Rack" frequency layout for the Cosmic Mixer
- Botany/Gardening Module — Plant identifier and gardening wellness section

## Future/Backlog (P2)
- Progressive Disclosure — Lock satellites behind Mastery tier requirements
- AR mechanics with react-three-fiber / AR.js
- Phygital Marketplace, Stripe subscriptions
- Blueprint Mode, Cosmic Truck digital twin
- Debug overlay for Observatory frequency values

## Test Credentials
- User: `grad_test_522@test.com` / `password`

## Architecture Notes
- `OrbitalHub.js` is now a lean ~180-line orchestrator
- All orbital sub-components are isolated in `components/orbital/`
- Audio hooks live in `hooks/useHubAudio.js`
- Weather ambience respects browser autoplay policy (starts on first user gesture)
