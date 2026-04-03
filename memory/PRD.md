# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a full-stack wellness platform with orbital navigation, physics-based interactions, and a tiered subscription ecosystem.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Canvas 2D, Three.js
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API
- **PWA**: Service Worker with Solfeggio wave table + instrument caching

## Core System — Bipolar Gravity Ecosystem

### Sovereign Crossbar (fixed top-12, below Navigation)
- Fixed at top-12 (48px below nav), z-[200], 5 draggable module poles
- SNAP_THRESHOLD = 150px, Luminous Tether, Vacuum Catch Y < 115px

### SuanpanPhysics Engine
- Inverse-Square Gravity, Variable Inertia (TIER_FRICTION 0.970→0.997)
- Luminous Trail (4→24 frames), Predictive Snap, Bubble Expansion (300→850ms)

### Weighted Authority
| Tier | Gravity | Bloom | Friction |
|------|---------|-------|----------|
| 1 | 1.0x | 1.0x | 0.980 |
| 2 | 1.3x | 1.4x | 0.988 |
| 3 | 1.8x | 2.0x | 0.993 |
| 4 | 2.5x | 3.0x | 0.997 |

### NebulaSphere (Canvas 2D)
- Golden ratio vertices, Luminous Trail, Double-tap → Bubble Burst, Predictive Snap haptics

### Bubble Burst Portal
- Tiered clip-path (T1=300ms chime → T4=850ms bass rumble), horizontal snap-scroll

## Phonic Resonance Architecture

### Solfeggio Frequencies
Spotless=432Hz, Cafe=528Hz, Tech=741Hz, Meditation=396Hz, Stars=852Hz, Wellness=639Hz, Creative=963Hz

### Generative Flourish
- Movement tracking → Gemini 3 Flash sonic profile (algorithmic fallback)
- Patterns: steady, ascending, descending, arpeggio, ambient, pulsing

### Phase-Locked Proximity Harmonics + Haptic Sync
- Interval-specific haptics: soft [10,20,10,20,10] for 3rds → sharp [30,5,30,5,40] for octaves
- Inverse-square intensity (1/d²), 400ms debounce

### Predictive Sonic Tug
- Cross-fade to destination frequency, Doppler-like shift

### Harmonic Memory
- Tracks pairings >0.6 intensity for 3s → bookmark
- Adjusts initial sphere positions using closeness_factor

### Session Harmony Score
- 0-100 score with 6 grades: Dormant → Seeking → Awakening → Resonant → Harmonious → Transcendent
- Breakdown: resonance_alignment (40pts), exploration_diversity (30pts), harmonic_depth (30pts)
- SVG ring in Control Center (SmartDock HarmonyNPU panel), fetches every 30s (batched)
- Compact badge on dock pill when panel is closed

### Resonance Streak / Golden Pulse
- 3+ consecutive sessions with score ≥ 75 triggers golden pulse + XP award
- XP: 50 base + ((streak // 3) - 1) * 25 per cycle
- Streak dots, best streak, total XP in Control Center panel
- Global golden pulse overlay + XP flash animation

### Organic Audio Engine
- Route-based instrument synthesis: singing_bowl (meditation), flute (star-chart), tabla (elixirs), crystal_bowl (frequencies)
- 2.5s delay after route change for layered organic texture
- Service Worker INSTRUMENT_CACHE for offline support

## Control Center (SmartDock Unified Hub)
- **Architecture**: SovereignHUD data merged into SmartDock as "Control Center" panel
- **Harmony Score**: SVG ring + breakdown bars (Alignment/Explore/Depth)
- **Resonance Streak**: Streak dots + counter + best/XP stats
- **NPU Queue**: Done/Queue/Errors stats + stream visualization canvas
- **Performance**: Canvas only renders when panel is visible (not continuous rAF)
- **Batch Timer**: Single 30s cycle for harmony-score + streak-check (consolidated from 3 timers)
- **Mobile**: Larger touch targets (36px mobile vs 30px desktop), swipe-up gesture to open panel
- **Golden Pulse/XP Flash**: Global overlays via SmartDock portal

## PWA Offline Resilience
- Service Worker caches 7 Solfeggio wave tables (44.1kHz, 2s sine samples)
- Instrument profiles cached for offline support
- App shell caching, /solfeggio/{freq} paths

## Multi-Civilization Star Charts
### Culture Layers (Lazy-loaded)
- **Hopi**: Hotomkam (Orion/Three Mesas), Tsootsma (Pleiades/Wuwuchim), Saquasohuh (Blue Star Kachina). 432Hz
- **Egyptian**: Sah (Osiris/Orion), Sopdet (Isis/Sirius), Meskhetiu (Thoth/Ursa Major). 528Hz
- **Vedic**: Ashwini, Rohini, Pushya, Swati (Nakshatras). 741Hz
- CultureLayerPanel in StarChart (top-28 left-4) with teachings display
- Also in star_cultures_data.json (21 total cultures)

## Sovereign Mastery — 4-Tier Certification
| Tier | Name | Requirement |
|------|------|-------------|
| 1 | Novice / Seeker | Core Orientation |
| 2 | Practitioner | 10 Mixer Collisions |
| 3 | Specialist | Avenue Certification |
| 4 | Sovereign | Mastery of 12 Units |

3 Avenues: Spotless Solutions, Enlightenment Cafe, Tech/Dev (5 lessons each, 1100 XP)

## API Endpoints
### Phonic: /api/phonic/
- POST record-movement, POST generate-flourish, GET harmonic-pairs, GET movement-summary
- POST record-harmonic, GET harmonic-memory, POST harmony-score
- POST streak-check, GET streak-status

### Culture: /api/culture-layers/
- GET / (list), GET /{layer_id} (full data)

### Mastery: /api/sovereign-mastery/
- GET status, POST record, GET avenues, GET certificates

## File Architecture
```
/app/frontend/src/
├── components/
│   ├── SmartDock.js (+ Control Center: Harmony, NPU, Streak)
│   ├── OrbitalMixer.js (Drag-and-Drop Mixer with orbital ring layout, synergy bonds, focus toggle)
│   ├── ConstellationPanel.js (Save/Browse/Load/Like/Sell constellation recipes)
│   ├── SovereignCrossbar.js, NebulaSphere.js, NebulaPlayground.js
│   ├── OrbitalNavigation.js, BubblePortal.js
│   ├── CultureLayerPanel.js
│   ├── PersistentWaveform.js (React.memo)
├── hooks/
│   ├── usePhonicResonance.js (+ ProximityHarmonics + SonicTug + HapticSync)
│   ├── useOrganicAudio.js (External organic instrument synthesis)
│   ├── useHarmonyEngine.js (Consolidated harmony/streak/NPU logic)
├── config/
│   ├── moduleRegistry.js (Plug-and-play module manifest with affinities, tiers, synergy engine)
├── context/
│   ├── FocusContext.js (Auto-immersion focus mode: 3+=focus, 5+=hyper-focus)
├── pages/
│   ├── MasteryPath.js, SuanpanPhysics.js, StarChart.js (+ CultureLayerPanel)
/app/frontend/public/
│   ├── sw.js (Solfeggio + instrument cache)

/app/backend/routes/
│   ├── phonic.py (movement + flourish + harmonics + memory + harmony-score + streak)
│   ├── culture_layers.py (Hopi/Egyptian/Vedic)
│   ├── sovereign_mastery.py
```

## Iteration History
### Iteration 245 — Universal Synthesis Interface Phase 1 (Apr 3, 2026) — LATEST
- **Module Registry 3.0**: Affinity tags (`audio`, `spiritual`, `healing`, `nature`, `cosmic`, etc.) + tier access levels (0=Foundation, 1=Civilization, 2=Sovereignty) + weight system for haptic feedback
- **Synergy Engine**: `checkSynergy()` detects shared affinities between modules, `getSynthesisName()` generates combo names (Sacred Resonance, Celestial Chord, etc.), visual SVG "Molecular Bond" tethers between synergized modules
- **Constellation Recipes**: Full CRUD backend (`/api/constellations`) + save/browse/load/like/sell panel in OrbitalMixer. Tiered limits: Free=3, Pro=50, Elite=unlimited+selling rights
- **Focus Mode 4.0**: Auto-triggers at 3+ active modules, SmartDock collapses to pulsing "Resonance Dot", Navigation/Crossbar/Toolbar dissolve via CSS body class. Hyper-focus at 5+ modules. Manual toggle available.
- **Synergy Counter**: Shows active synergy count in orbital playground
- Tests: Backend 13/13 (100%), Frontend 100%

### Iteration 244 — Module Registry & Orbital Drag-Drop Mixer (Apr 3, 2026)
- **Module Registry** (`/app/frontend/src/config/moduleRegistry.js`): Central plug-and-play manifest with MODULE_TYPES, MODULE_GROUPS, 21 modules across 5 rings (frequencies, sounds, instruments, logic-gates, engines)
- **OrbitalMixer** (`/app/frontend/src/components/OrbitalMixer.js`): Orbital ring layout with DraggableBubble, PlayerHub, magnetic snap zone, haptic feedback
- Dual interaction: **Drag-and-drop** to center hub OR **tap-to-toggle** (accessibility)
- Active modules: glowing border, SVG tether lines, hub dot counter, pulsing ring animation
- Locked modules (I Ching, Fractal L², Cosmic Map) show lock icon and are non-interactive
- **Mode toggle**: Console (existing accordion) vs Playground (orbital) on CosmicMixerPage
- Staggered entrance animation from center hub → orbital positions
- Mobile: 52px touch targets, adjusted ring radii, 60vh container height
- Tests: Backend 10/10 (100%), Frontend 100%

### Iteration 243 — Streamline Consolidation: Control Center (Apr 3, 2026)
- SovereignHUD merged into SmartDock as "Control Center" panel (HarmonyNPUPanel)
- useHarmonyEngine hook: consolidated 3 separate 30s timers into single batch cycle
- Canvas only renders when Control Center panel is open (P1 performance)
- PersistentWaveform wrapped in React.memo (P1 performance)
- Mobile dock: larger touch targets (36px vs 30px), swipe-up gesture
- Leaner PageLoader (removed LoadingMantra spinner)
- Golden Pulse + XP Flash overlays moved to global SmartDock portal
- Tests: Backend 5/5 (100%), Frontend 100%

### Iteration 242 — Resonance Streak + Organic Audio Engine
- Streak-check and streak-status endpoints
- Golden Pulse overlay, XP Flash, streak dots in HUD
- useOrganicAudio hook (singing_bowl, flute, tabla, crystal_bowl synthesis)
- Service Worker INSTRUMENT_CACHE
- Tests: Backend 6/6 (100%), Frontend 100%

### Iteration 241 — Session Harmony Score + CultureLayer Integration
### Iteration 240 — Haptic Sync + PWA + Culture Layers + Harmonic Memory
### Iteration 239 — Phonic Architecture + UI Fix
### Iteration 238 — Sentient Streamline Enhancement
### Iteration 237 — Sovereign Mastery + Bubble Burst
### Iterations 234-236 — Foundation

## Upcoming (P1)
- **Anthropology Class System**: Shaman (Resonance) / Nomad (Navigation) / Architect (Builder) / Merchant (Catalyst) — each class modifies widget synthesis rules
- **Synthesis Handshake**: Full combo-widget logic — Cymatic Visuals (Shaman+Fractal+Audio), Trade Trails (Nomad+GPS+Market), Blueprint UI (Architect+Forge+Merchant)
- **Liquid Tethers**: SVG canvas sub-layer with animated data-stream connections between active synthesis widgets
- **Haptic Phonics**: Varied vibration frequencies mapped to widget weight (heavy instruments vs light frequencies)
- I Ching Logic Gates: First operational "engine" type module plugged into the Module Registry

## Future/Backlog (P2)
- **Oracle Navigation Loop**: I Ching → GPS Map → Artifact discovery → Forge upgrade → Class Stats
- **Harmony Commerce Loop**: Frequency + Fractal → Escrow Contract → Trade Circle → Social Capital
- **Gesture Ring**: Multi-touch frequency/geometry manipulation for Hyper-Focus mode
- 54-Sublayer L² Fractal Engine
- GPS-Based Cosmic Map
- Forge Mini-Game (3D asset generation from hexagram binary)
- Phygital Marketplace / Server-Side Escrow
- Skeleton Loading (Ghost Skeleton UI while complex logic populates)
- Tiered Subscription Matrix: Foundation ($0) → Civilization → Sovereignty

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
