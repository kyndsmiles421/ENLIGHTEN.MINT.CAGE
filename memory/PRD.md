# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform. V2 "Sovereign Core" — Unified Simulation Architecture. Every system feeds into every other. Moving from "app screens" to a Spatial Operating System governed by mathematical constants.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Three.js (imperative WebGL)
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API (free), Stripe (pending)

## Architecture
```
/app/backend/routes/
├── gravity.py          # 12 gravity nodes, interact, field params
├── archives.py         # 6 archive entries, stroke tracing, comparative linguistics
├── atmosphere.py       # NWS Weather data
├── mastery.py          # Tier tracking
├── observatory.py      # Planet sonification
├── workshop.py         # Platonic solids
├── trade_circle.py     # Linguistic escrow

/app/frontend/src/
├── components/orbital/
│   ├── constants.js           # 15 satellites, audio maps
│   ├── GravityField.js        # WebGL mesh + tidal force
│   ├── CentralOrb.js          # Abyss expansion
│   ├── AbyssSatellite.js      # Drag-to-extract
│   ├── ActiveSatellite.js     # Gravity-responsive, snap, inspect
│   ├── SatelliteInspector.js  # Trinity View overlay
│   ├── ConnectionLines.js     # SVG tethers
│   ├── WeatherRibbon.js       # Live weather
│   ├── CosmicDust.js          # Particles
├── components/
│   ├── StrokeTracer.js        # Canvas stroke tracing
│   ├── CosmicPrescription.js  # Wired to live systems
├── hooks/
│   ├── useHubAudio.js         # Audio + harmonic chords
│   ├── useGravityManager.js   # Gravity physics
├── pages/
│   ├── OrbitalHub.js          # Rotation/momentum/snap/inspect
│   ├── Archives.js            # Trinity View + linguistics
│   ├── SuanpanMixer.js        # Abacus frequency mixer
```

## Iteration History

### Iteration 209 — Ring Rotation + Inspect + Homepage Wiring (Apr 2, 2026) — LATEST

**Orbital Ring Rotation (Physical Dial):**
- User-initiated drag rotation with pointer events
- Momentum physics: angular velocity tracked from drag deltas
- Friction: velocity *= 0.94 each frame (exponential decay)
- Snap-to-grid: when velocity < 0.015, nearest satellite snaps to top (-PI/2)
- Idle drift: 0.04 rad/s when ring is at rest

**Long-Press Inspect:**
- 500ms hold on satellite → SatelliteInspector overlay opens
- Shows satellite icon, label, description with animated glow
- Loads archive data (Trinity View: Origin/Synthesis/Frequency tabs)
- Multi-language script preview (Sanskrit ॐ, Chinese 道, Aramaic ܐ, etc.)
- Frequency playback button
- Short click (< 500ms) → navigate to satellite's route

**Snap-to-Grid:**
- Snapped satellite shows "active" label with enhanced glow
- Snap indicator dot at 12 o'clock position on orbit ring
- Enhanced border and boxShadow for snapped satellite

**Homepage Wiring (No Dead Ends):**
- CosmicPrescription frequency chip → plays immediately via toggleFreq
- Archives button → navigate to /archives
- Suanpan button → navigate to /suanpan
- Enter Abyss button → navigate to /hub

### Iteration 208 — Archives + Suanpan + Tidal Force
- Deep-Dive Archives with 6 entries across 5+ ancient languages
- StrokeTracer for character unlocking
- Suanpan Mixer with abacus beads
- Tidal Force mesh warping + harmonic chords

### Iteration 207 — Einstein Spatial Curvature
- 12 gravity nodes, WebGL mesh deformation, gravity-responsive physics, mastery tiers

### Iteration 206 — Abyss + Atmospheric Synchrony
- 70% viewport, Fibonacci spiral, Zen Reset, weather-driven audio

## Mastery Tiers
- Observer → Synthesizer (120s + 5 interactions) → Archivist (600s + 15) → Navigator (1800s + 30) → Sovereign (3600s + 50)

## Upcoming Tasks (P1)
- **AI-Powered Living Synthesis**: Gemini-generated analysis when hovering connections between traditions (Om ↔ Dao), dynamic frequency intersection visualization
- **Stroke-Order Drawing in Abyss**: Trace characters directly in the Hub to activate gravity nodes
- **Vedic Math Sutras**: Interactive calculation techniques for Spice Rack
- **I Ching Binary Logic Gates**: Hexagram puzzles for tier advancement
- **Enhanced Archives Visualizations**: Subscription-tier-dependent immersion depth (deep 3D visualizations for high-tier users)

## Future/Backlog (P2)
- Culinary Spice Rack UI revamp
- TCM integration for Botany module
- Cosmic Map with GPS gravitational wells
- Trade Circle gravity-weighted marketplace
- Phygital Marketplace + Stripe
- AR mechanics
- Frequency-to-botanical recipe codes

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
