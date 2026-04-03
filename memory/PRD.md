# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a full-stack wellness platform with orbital navigation, physics-based interactions, and a tiered subscription ecosystem.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Canvas 2D
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API

## Core System — Bipolar Gravity Ecosystem

### Sovereign Crossbar
- Fixed top-of-screen kinetic bar holding 5 module poles
- Poles: Divine Director (Mixer), Trade Circle, Star Charts, Meditation, Wellness
- Each pole draggable with mass-based Framer Motion spring physics
- SNAP_THRESHOLD = 150px triggers haptic vibration + detachment
- Luminous Tether: SVG elastic light string between crossbar and dragging module
- Tether Breakaway: 8-particle bloom shower on detachment
- Vacuum Catch Zone: Glows when spheres approach top (reattachment zone)
- Hidden on /, /auth, /intro

### SuanpanPhysics Engine
```
Inverse-Square Gravity:  F = G * m1 * m2 / r²  (G=800, magnetic snap at 30% radius)
Repulsion Launch:        1/-r² inverted at crossbar (sling-shot effect)
Perimeter Buffer:        Elastic walls at 60px margin (soft bounce)
Orbital Decay:           Idle spheres settle to top-third (REST_HEIGHT_RATIO=0.33)
Vacuum Catch:            y < 65px AND velocity.y < -5 (2s grace period after launch)
Rotational Inertia:      Mass-based spin (heavier = slower but longer)
Proximity Resonance:     Compatible spheres glow within 180px
Cluster Formation:       < 80px distance merges into unit
Friction:                0.985 per frame
Frame Budget:            12ms target
```

### Module Mass (Rotational Inertia)
| Module | Mass | Feel |
|--------|------|------|
| Mixer (Divine Director) | 3.0 | Heavy, slow spin, long momentum |
| Star Charts | 2.2 | Substantial |
| Trade Circle | 1.8 | Medium |
| Meditation | 1.2 | Light |
| Wellness | 1.0 | Snappy |

### Resonance Compatibility
```
starchart  ↔ [mixer, meditation]
meditation ↔ [mixer, starchart, wellness]
wellness   ↔ [mixer, meditation]
trade      ↔ [mixer]
mixer      ↔ [starchart, meditation, wellness, trade]
```

### NebulaSphere (Canvas 2D)
- Golden ratio vertex distribution (120 points, Fibonacci spiral)
- 3D→2D perspective projection with rotation
- Priority-based bloom (P1=brightest, P3=subdued)
- Physics loop: gravity, perimeter, orbital decay, friction, vacuum catch
- Resonance glow ring when near compatible sphere
- Snap lock pulsing ring at gravity well center
- Mass label + priority indicator on sphere surface

### Gravity Well (Mixer as "Black Hole")
- GRAVITY_WELL_RADIUS = 180px at viewport center
- Intensity-based visual pulsing (stronger as spheres approach)
- Inner snap zone at 30% radius triggers magnetic lock
- Haptic pattern: [30, 15, 50] on snap lock
- Cross-domain injection on collision:
  - Star Chart → frequency re-tuning (planetary alignment)
  - Trade → +10% NPU speed boost
  - Meditation → 8D Binaural Stellar Wash injection
  - Wellness → AI harmonic volume synchronization
- SupernovaPulse: outer shockwave + inner flash + primary ring + secondary ring
- NPU Burst mode for 2s during merge
- Auto-reattach to crossbar after 1.5s

### Sovereign HUD
- Compact widget (bottom-left) showing active/idle state
- Expandable panel: Canvas stream visualization, stats grid, recent tasks
- NPU Burst indicator (pulsing border)
- 3 channels: Nexus Path (P1), Sensory Stream (P2), Background Orbit (P3)

## Mixer (Divine Director) — Triple-Domain Architecture
```
SuanpanCore.js      — Foundation math, constants, TrackRow, KeyframeLane, SuanpanSource
SuanpanSovereign.js — SpeedBridgeModal, BonusPackCard, RecommendationCard
SuanpanVfx.js       — SacredAssemblyLoader, LightTrailCanvas, BloomGlow
SuanpanMixer.js     — Main orchestrator (imports from all 3 domains)
```

## Priority Queue / Backpressure
```
Priority 1 (Nexus Path):      3 concurrent, zero latency
Priority 2 (Sensory Stream):  2 concurrent, requestIdleCallback
Priority 3 (Background Orbit): 1 concurrent, throttled
NPU Burst: blocks P2/P3 during intensive processing
```

## 4-Tier Subscription
| Tier | Price | Tracks | AI Credits | Quality |
|------|-------|--------|------------|---------|
| Discovery | Free | 3 | 5/mo | 44.1kHz |
| Player | $9.99/mo | 8 | 40/mo | 48kHz |
| Ultra Player | $24.99/mo | 20 | 150/mo | 88.2kHz |
| Sovereign | $49.99/mo | Unlimited | 250+ | 96kHz Spatial |

## File Architecture
```
/app/frontend/src/
├── components/
│   ├── SovereignCrossbar.js    # Kinetic crossbar + elastic poles + tether
│   ├── NebulaSphere.js         # Canvas 2D sphere with squared physics
│   ├── NebulaPlayground.js     # Sphere orchestration + gravity well + resonance
│   ├── SovereignHUD.js         # Priority queue visibility + NPU meter
│   ├── OrbitalNavigation.js    # Wrapper: Crossbar + Playground + HUD
│   ├── CommandMode.js          # Global Ctrl+K command interface
├── context/
│   ├── SovereignContext.js     # EventBus + Priority Queue
├── pages/
│   ├── SuanpanPhysics.js       # Bipolar gravity engine
│   ├── SuanpanMixer.js         # Main mixer orchestrator
│   ├── SuanpanCore.js          # Math/constants/TrackRow
│   ├── SuanpanSovereign.js     # Tier logic/purchasing
│   ├── SuanpanVfx.js           # Visual effects
```

## Iteration History
### Iteration 236 — Bipolar Gravity Ecosystem (Apr 3, 2026) — LATEST
- SuanpanPhysics.js engine: inverse-square gravity, repulsion launch, perimeter buffer, orbital decay, vacuum catch (2s grace), rotational inertia, proximity resonance
- Luminous Tether + Tether Breakaway particles on Crossbar
- NebulaSphere with full physics integration + resonance glow + snap lock
- NebulaPlayground with resonance tethers, intensity-based gravity well, enhanced supernova
- Tests: Backend 100% (18/18), Frontend 100%

### Iteration 235 — Orbital Navigation (Apr 3, 2026)
- SovereignCrossbar, NebulaSphere, NebulaPlayground, SovereignHUD, OrbitalNavigation
- Tests: Backend 100%, Frontend 100%

### Iteration 234 — Triple-Domain Decomposition (Apr 3, 2026)
- SuanpanMixer decomposed → Core/Sovereign/Vfx + Priority Queue

### Earlier: 233 (Sovereign State), 232 (Sovereign Architecture), 231-223 (Features)

## Upcoming (P1)
- Predictive Phonic Pre-Loading: Warm up frequencies as sphere approaches Mixer
- Generative Flourish Bonus: AI phonic resonance from movement history
- Multi-Civilization Star Charts: Non-Western astronomical models in SuanpanCore.js

## Future/Backlog (P2)
- External audio asset hosting (real instrument multi-samples)
- Haptic API for mobile tactile feedback
- Pan + Reverb keyframe lanes
- PWA offline mode

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
