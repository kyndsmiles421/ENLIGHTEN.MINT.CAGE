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

### Weighted Authority (Mastery Tier → Physics)
Mastery tier multipliers applied to gravity and bloom:
| Tier | Gravity Multiplier | Bloom Multiplier |
|------|--------------------|------------------|
| 1 Novice/Seeker | 1.0x | 1.0x |
| 2 Practitioner | 1.3x | 1.4x |
| 3 Specialist | 1.8x | 2.0x |
| 4 Sovereign | 2.5x | 3.0x |

Flow: SovereignContext → OrbitalNavigation → NebulaPlayground → NebulaSphere

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
- **Double-tap activation** → triggers Bubble Burst portal expansion

### Bubble Burst Portal (Multi-Screen)
- Double-tap on NebulaSphere expands to full-screen overlay
- clipPath circle animation from sphere origin to full viewport
- Horizontal snap-scroll between active bubbles
- Lazy-loads target page content inside each bubble
- Globe-like curvature vignette overlay
- Navigation dots + arrows + close controls
- Keyboard support: Arrow keys to navigate, Escape to close

### Gravity Well (Mixer as "Black Hole")
- GRAVITY_WELL_RADIUS = 180px at viewport center
- Intensity-based visual pulsing (stronger as spheres approach)
- Inner snap zone at 30% radius triggers magnetic lock
- Haptic pattern: [30, 15, 50] on snap lock
- Cross-domain injection on collision
- SupernovaPulse: outer shockwave + inner flash + rings
- NPU Burst mode for 2s during merge
- Auto-reattach to crossbar after 1.5s

### Sovereign HUD
- Compact widget (bottom-left) showing active/idle state
- Expandable panel: Canvas stream visualization, stats grid, recent tasks
- NPU Burst indicator (pulsing border)
- 3 channels: Nexus Path (P1), Sensory Stream (P2), Background Orbit (P3)

## Sovereign Mastery — 4-Tier Certification System

### 4-Tier Scale
| Tier | Name | Codename | Requirement |
|------|------|----------|-------------|
| 1 | Novice / Seeker | The Awakener | Complete Core Orientation |
| 2 | Practitioner | The Forger | 10 Mixer Collisions |
| 3 | Specialist | The Artisan | Avenue Certification |
| 4 | Sovereign / Super-User | The Nexus | Mastery of all 12 Units |

### 3 Avenues
1. **Spotless Solutions**: Sanitation Technology & Eco-Acoustic Maintenance (5 lessons, 1100 XP)
2. **Enlightenment Cafe**: Alternative Chemistry & Harmonic Nutrition (5 lessons, 1100 XP)
3. **Tech/Dev Path**: Modular UI/UX & Sentient Gravity Engineering (5 lessons, 1100 XP)

### Certificate Generation
- Auto-generates on avenue completion (all 5 lessons)
- Verification code: SVC-{uuid}
- Publicly verifiable via /api/sovereign-mastery/certificates/{cert_id}/verify

### MasteryPath Page (/mastery-path)
- 3 tabs: Overview, Avenues, Certificates
- TierRing SVG with animated progress
- Weighted Authority display (Gravity x, Bloom x)
- AvenueCards with expandable curriculum and Complete buttons
- CertificateCards with verification codes

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
│   ├── NebulaSphere.js         # Canvas 2D sphere with squared physics + bubble activation
│   ├── NebulaPlayground.js     # Sphere orchestration + gravity well + resonance
│   ├── SovereignHUD.js         # Priority queue visibility + NPU meter
│   ├── OrbitalNavigation.js    # Wrapper: Crossbar + Playground + HUD + BubblePortal
│   ├── BubblePortal.js         # Full-screen bubble expansion overlay
│   ├── CommandMode.js          # Global Ctrl+K command interface
├── context/
│   ├── SovereignContext.js     # EventBus + Priority Queue + Mastery multipliers
├── pages/
│   ├── MasteryPath.js          # 4-Tier certification page
│   ├── SuanpanPhysics.js       # Bipolar gravity engine
│   ├── SuanpanMixer.js         # Main mixer orchestrator
│   ├── SuanpanCore.js          # Math/constants/TrackRow
│   ├── SuanpanSovereign.js     # Tier logic/purchasing
│   ├── SuanpanVfx.js           # Visual effects

/app/backend/routes/
│   ├── sovereign_mastery.py    # 4-Tier Mastery & Certificates API
│   ├── mastery.py              # Legacy/Vowel mastery
│   ├── sovereign_arch.py       # Sovereign architecture
```

## Iteration History
### Iteration 237 — Sovereign Mastery + Bubble Burst (Apr 3, 2026) — LATEST
- MasteryPath.js page wired at /mastery-path (lazy loaded)
- 4-Tier Mastery Scale with avenue certification
- Weighted Authority: tier multipliers → SuanpanPhysics (gravity + bloom)
- BubblePortal: full-screen clipPath expansion from NebulaSphere double-tap
- Horizontal snap-scroll between active bubbles with lazy page loading
- Tests: Backend 19/19 (100%), Frontend 100%

### Iteration 236 — Bipolar Gravity Ecosystem (Apr 3, 2026)
- SuanpanPhysics.js engine: inverse-square gravity, repulsion launch, perimeter buffer, orbital decay, vacuum catch, rotational inertia, proximity resonance
- Luminous Tether + Tether Breakaway particles on Crossbar
- NebulaSphere with full physics integration + resonance glow + snap lock
- NebulaPlayground with resonance tethers, intensity-based gravity well, enhanced supernova
- Tests: Backend 100% (18/18), Frontend 100%

### Iteration 235 — Orbital Navigation (Apr 3, 2026)
- SovereignCrossbar, NebulaSphere, NebulaPlayground, SovereignHUD, OrbitalNavigation

### Iteration 234 — Triple-Domain Decomposition (Apr 3, 2026)
- SuanpanMixer decomposed → Core/Sovereign/Vfx + Priority Queue

### Earlier: 233 (Sovereign State), 232 (Sovereign Architecture), 231-223 (Features)

## Upcoming (P1)
- Phase 3 Polish / Generative Flourish: AI phonic resonance from movement history
- Predictive Phonic Pre-Loading: Warm up frequencies as sphere approaches Mixer

## Future/Backlog (P2)
- Multi-Civilization Star Charts: Hopi, Egyptian, Vedic astronomical models
- External audio asset hosting (real instrument multi-samples)
- Haptic API for mobile tactile feedback
- Pan + Reverb keyframe lanes
- PWA offline mode

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
