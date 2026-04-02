# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with mystical/divination systems, AI guidance, cinematic visuals, and MMORPG mechanics. V2 "Sovereign Core" — Unified Simulation Architecture where every system feeds into every other.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Three.js (imperative WebGL)
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API (free), Stripe (pending)

## Architecture
```
/app/
├── backend/
│   ├── routes/
│   │   ├── gravity.py          # 12 gravity nodes, interact, field params
│   │   ├── archives.py         # 6 archive entries, stroke tracing, comparative linguistics
│   │   ├── atmosphere.py       # NWS Weather data
│   │   ├── mastery.py          # Tier tracking
│   │   ├── observatory.py      # Planet sonification
│   │   ├── workshop.py         # Platonic solids
│   │   ├── trade_circle.py     # Linguistic escrow
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── orbital/
│   │   │   │   ├── constants.js       # 15 satellites, ZONE_AUDIO, WEATHER_*
│   │   │   │   ├── GravityField.js    # WebGL mesh + tidal force
│   │   │   │   ├── CentralOrb.js      # 70% Abyss + weather pulse
│   │   │   │   ├── AbyssSatellite.js  # Drag-to-extract + haptics
│   │   │   │   ├── ActiveSatellite.js # Gravity-responsive physics
│   │   │   │   ├── ConnectionLines.js # SVG tether lines
│   │   │   │   ├── WeatherRibbon.js   # Weather + ambience
│   │   │   │   ├── CosmicDust.js      # Particles
│   │   │   ├── StrokeTracer.js        # Canvas stroke tracing
│   │   ├── hooks/
│   │   │   ├── useHubAudio.js         # Satellite + weather + harmonic chords
│   │   │   ├── useGravityManager.js   # Gravity physics
│   │   ├── pages/
│   │   │   ├── OrbitalHub.js          # Central orchestrator
│   │   │   ├── Archives.js            # Trinity View + linguistics
│   │   │   ├── SuanpanMixer.js        # Abacus frequency mixer
```

## Implemented Features

### Iteration 208 — Phase 2: Archives + Suanpan + Tidal Force (Apr 2, 2026) — LATEST

**Deep-Dive Archives (/archives):**
- 6 archive entries: Om (Vedic), Dao (Chinese), Qi (Chinese), Aleph (Aramaic/Hebrew), Ankh (Egyptian), I Ching (Chinese)
- Trinity View: 3 tabs (Origin, Synthesis, Frequency) with progressive disclosure
- Multi-language scripts: Sanskrit, Chinese (with Oracle Bone → Modern evolution), Aramaic, Hebrew, Egyptian
- StrokeTracer: Canvas-based tactile character tracing with accuracy scoring (>=70% unlocks)
- Comparative Linguistics: "Spirit", "Energy", "Truth" concepts across 5-7 ancient languages each
- Phonetic frequency playback via Web Audio API
- Tier-based content locking (observer sees 3 entries, synthesizer unlocks qi-chinese + ankh-egyptian, archivist unlocks iching-hexagram)

**Suanpan Mixer (/suanpan):**
- Ancient Chinese abacus UI: 4 columns (100s, 10s, 1s, 0.1s)
- Heaven beads (worth 5) and earth beads (worth 1) with spring animations
- 9 Solfeggio presets: Schumann (7.83Hz), OM (136.1), UT (174), RE (285), MI (528), FA (639), SOL (741), LA (852), SI (963)
- Real-time audio emission with frequency display
- Color shifts based on frequency range

**Tidal Force + Harmonic Chords:**
- WebGL mesh deforms in real-time at satellite hover position
- Harmonic chord plays when satellite is proximate to a gravity node (satellite Hz + node Hz + midpoint Hz)
- 2 new satellites added to Hub: Archives + Suanpan (15 total)

### Iteration 207 — Einstein Spatial Curvature (Apr 2, 2026)
- 12 gravity nodes with rich data (frequency, origin_language, star_coordinate, gravity_mass, trinity)
- WebGL mesh deformation (imperative Three.js)
- Gravity-responsive satellite physics
- Mastery tier progression (Observer → Sovereign)

### Iteration 206 — Abyss Refactor + Atmospheric Synchrony (Apr 2, 2026)
- 70% viewport expansion, Fibonacci spiral, drag-to-extract, Zen Reset
- Weather-driven ambient audio drone

## Mastery Tiers
- Observer (default): Om, Dao, Aleph, Sirius, Pleiades, Polaris, Schumann, Solfeggio-528
- Synthesizer (120s + 5 interactions): Gayatri, Flower of Life, Qi, Ankh
- Archivist (600s + 15 interactions): I Ching, Sri Yantra
- Navigator (1800s + 30 interactions): Full access
- Sovereign (3600s + 50 interactions): Full control + Phygital recipes

## Upcoming Tasks (P1)
- **Stroke-Order Drawing Mechanic**: Activate nodes by correct calligraphy drawing in the hub (not just Archives page)
- **Vedic Math Sutras**: Interactive mental calculation techniques for Spice Rack balancing
- **I Ching Binary Logic Gates**: Hexagram-based mastery tier advancement puzzles
- **Culinary Spice Rack UI Revamp**: Shelf/aromatic layout with botanical recipe code generation

## Future/Backlog (P2)
- TCM Integration for Botany module
- Cosmic Map with GPS gravitational wells
- Multi-civilization star chart overlays
- Trade Circle gravity-weighted marketplace
- Phygital Marketplace + Stripe
- AR mechanics
- Frequency-to-botanical recipe code bridge for Positive Energy Bar

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token` in localStorage
