# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with mystical/divination systems, AI guidance, cinematic visuals, and MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API (free), Stripe (pending)

## What's Been Implemented

### Iteration 205 — Abyss UX + NWS Weather + Weather Ribbon (Apr 2, 2026) — LATEST

**Abyss System (Customizable Orbit):**
- `is_active` state per satellite persisted to `hub_preferences` collection
- Default 6 active (Mood, Soundscape, Map, Breathwork, Meditation, Conservatory), 7 dormant
- Short click orb → Mission Control. Long-press (500ms) → reveals Abyss with dormant dots
- Dormant satellites: tiny glimmering color-coded dots swirling inside the central orb
- Click dormant dot → activates satellite (springs into orbit)
- Right-click active satellite → returns to Abyss with collapse sound
- Dynamic orbit radius adjusts based on active satellite count
- Endpoints: `GET/POST /api/hub/preferences`

**NWS Weather Integration:**
- Free National Weather Service API proxy (no key needed)
- 3-step fetch: grid point → nearest station observation → hourly forecast
- Weather-to-frequency mapping: clear=528Hz/crystalline, fog=369Hz/ethereal, rain=285Hz/heavy, snow=432Hz/soft, thunderstorm=174Hz/electric
- Temperature adjusts pitch, cloud cover + humidity determine "seeing quality" for stargazing
- Geolocation-aware (browser GPS → NWS) with Rapid City fallback
- Endpoint: `GET /api/weather/current?lat=&lon=`

**Weather Ribbon:**
- Glassmorphic semi-transparent ribbon at top of hub (backdrop-filter blur, 35% opacity)
- Shows: conditions icon + description, temperature, humidity, seeing quality
- Never blocks scenery — always visible, never a popup

**Glassmorphism Fix:**
- Mission Control backdrop reduced from 0.7 to 0.35 opacity with stronger blur(20px)
- Panel background reduced from 0.95 to 0.72 with blur(24px)
- Cosmic background remains visible through all overlays

**Tests:** 100% Backend / 100% Frontend

### Iteration 203 — Observatory (Apr 2, 2026)
- Orrery, Deep Sky (10 stars), Live Events (meteor showers, moon phase), Data Sonification

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
- Einstein Spatial Curvature (Gravitational Wells) on Cosmic Map
- Culinary Mode Mixer UI — "Spice Rack" frequency layout
- Botany: Plant identifier and gardening section
- Progressive Disclosure — unlock satellites via mastery tiers
- "Atmospheric Synchrony" mode — auto-tune audio to weather

## Future/Backlog (P2)
- AR mechanics, Phygital Marketplace, Stripe subscriptions
- Blueprint Mode, Cosmic Truck digital twin
- Debug overlay for Observatory frequency values

## Test Credentials
- User: `grad_test_522@test.com` / `password`
