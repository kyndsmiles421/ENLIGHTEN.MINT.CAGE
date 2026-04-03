# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a full-stack wellness platform. V4 "Intelligence Layer" — Hexagram-based AI recommendations, keyframe automation (Volume + Frequency), and 4-tier subscription ecosystem. V5 "Orbital Navigation" — Pole-to-Sphere kinetic interaction model with gravity well merging.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Canvas 2D
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API

## Core Navigation — Orbital Architecture

### Sovereign Crossbar (Top of screen)
- 5 module poles: Divine Director (Mixer), Trade Circle, Star Charts, Meditation, Wellness
- Each pole is draggable with Framer Motion spring physics
- Quadratic tension formula at SNAP_THRESHOLD = 150px
- Hidden on unauthenticated pages (/, /auth, /intro)
- Toggle button to show/hide

### Elastic Pole Mechanics
- SVG-based elastic pole visualization during drag
- Quadratic curve bending based on drag distance
- Snap indicator ring at 80%+ threshold
- Haptic vibration (navigator.vibrate) on snap
- Module detaches and transforms into NebulaSphere

### NebulaSphere (Canvas 2D)
- Golden ratio vertex distribution (120 points)
- 3D-to-2D perspective projection with rotation
- Priority-based bloom: P1=brightest, P3=subdued
- Zero-G floating physics with toss/spin via drag momentum
- Latitude/longitude grid lines
- Label + priority indicator on sphere surface

### Gravity Well (Mixer as "Black Hole")
- GRAVITY_WELL_RADIUS = 160px centered at viewport
- Concentric ring indicator when spheres active
- Auto-attraction when sphere enters inner 40% of radius
- Cross-domain injection on drop:
  - Star Chart → Frequency re-tuning (planetary alignment)
  - Trade → +10% NPU speed boost
  - Meditation → 8D Binaural Stellar Wash track injection
  - Wellness → AI harmonic volume synchronization
- SupernovaPulse animation on collision (shockwave + flash + ring)
- NPU Burst mode for 2s during merge
- Auto-reattach to crossbar after 1.5s

### Sovereign HUD (Bottom-left)
- Compact widget showing active/idle state + queue depth
- Expandable panel with:
  - Canvas-based stream visualization (3 priority channels converging)
  - Stats grid: Completed / Queue / Errors
  - Recent tasks feed
  - NPU Burst indicator

## 4-Tier Mixer Subscription
```
Discovery (Free):    3 tracks, 5 AI/mo, 44.1kHz, 15-30s Assembly
Player ($9.99):      8 tracks, 40 AI/mo, 48kHz, 5-8s
Ultra Player ($24.99): 20 tracks + keyframes, 150 AI/mo, 88.2kHz
Sovereign ($49.99):  Unlimited + nested, 250+ AI + NPU, 96kHz Spatial
```

## Sovereign Architecture (4-Tier Model)
| Tier | Codename | Price | AI Brain |
|------|----------|-------|----------|
| Standard | The Seed | Free | Single-Node Logic |
| Apprentice | The Bloom | $9.99/mo | Multi-Node + Glass Box |
| Artisan | The Architect | $24.99/mo | Collaborative Agents |
| Sovereign | The Super User | $49.99/mo | Autonomous Master |

## Priority Queue / Backpressure
```
Priority 1 (Nexus Path):      UI thread — 3 concurrent, zero latency
Priority 2 (Sensory Stream):  Audio/AI — 2 concurrent, requestIdleCallback
Priority 3 (Background Orbit): Export/GPS — 1 concurrent, throttled
NPU Burst: blocks P2/P3 during intensive processing
Frame budget: 12ms (under 16ms browser threshold)
```

## Frontend Architecture
```
/app/frontend/src/
├── components/
│   ├── SovereignCrossbar.js   # Kinetic crossbar + elastic poles
│   ├── NebulaSphere.js        # Canvas 2D sphere with projection math
│   ├── NebulaPlayground.js    # Sphere orchestration + gravity well + supernova
│   ├── SovereignHUD.js        # Priority queue visibility + NPU meter
│   ├── OrbitalNavigation.js   # Wrapper combining Crossbar/Playground/HUD
│   ├── CommandMode.js         # Global Ctrl+K command interface
├── context/
│   ├── SovereignContext.js    # EventBus + Priority Queue
├── pages/
│   ├── SuanpanMixer.js        # Main orchestrator (imports from 3 domains)
│   ├── SuanpanCore.js         # Foundation math, constants, TrackRow
│   ├── SuanpanSovereign.js    # Tier logic: SpeedBridgeModal, BonusPackCard
│   ├── SuanpanVfx.js          # Visual effects: SacredAssemblyLoader, LightTrail, BloomGlow
```

## API Endpoints
```
Sovereign: GET /api/sovereign/status, POST /api/sovereign/command
Pub/Sub: POST /api/sovereign/events/publish, GET /api/sovereign/events/recent
Mixer: GET /api/mixer/subscription, POST /api/mixer/subscription/upgrade
       POST /api/mixer/projects, GET /api/mixer/projects, GET /api/mixer/projects/{id}
       GET /api/mixer/sources, GET /api/mixer/bonus-packs
       POST /api/mixer/bonus-packs/purchase, GET /api/mixer/recommendations
       POST /api/mixer/auto-compose, GET /api/mixer/templates
       GET /api/mixer/recording/config, GET /api/mixer/ai/capabilities
```

## Iteration History
### Iteration 235 — Orbital Navigation (Pole to Sphere) (Apr 3, 2026) — LATEST
- SovereignCrossbar with 5 elastic pole modules
- NebulaSphere with Canvas 2D projection math + golden ratio vertices
- NebulaPlayground with gravity well, supernova pulse, cross-domain injection
- SovereignHUD with priority queue stats + NPU burst meter
- OrbitalNavigation wrapper integrated into App.js
- Mixer EventBus handler for sphere_merge cross-domain injection
- Tests: Backend 100% (14/14), Frontend 100%

### Iteration 234 — Triple-Domain Decomposition (Apr 3, 2026)
- SuanpanMixer.js decomposed → Core/Sovereign/Vfx
- Priority Queue with 3 levels + NPU burst backpressure
- Tests: Backend 100%, Frontend 100%

### Earlier iterations: 233 (Sovereign State), 232 (Sovereign Architecture), 231 (Templates/Camera/Mic), 230 (Content Library), 229 (Consciousness Widget), 228 (AI Mantra DJ), 227 (Backend Refactoring), 226 (Ripple Editing), 225 (Intelligence Layer), 224 (4-Tier + Bonus Packs), 223 (Divine Director v1)

## Upcoming (P1)
- Phase 3 Polish: Light trails and bloom effects refinement
- Generative Flourish Bonus: AI phonic resonance based on movement history
- Predictive phonic pre-loading: Warm up frequencies as sphere approaches Mixer
- SuanpanCore.js flexibility for non-Western astronomical models

## Future/Backlog (P2)
- Multi-Civilization Star Charts (Hopi, Egyptian, Vedic)
- External audio asset hosting (real instrument multi-samples)
- Haptic API for mobile tactile feedback
- Pan + Reverb keyframe lanes

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
