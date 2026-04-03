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
Frame Budget:            12ms target
```

### Variable Inertia (Tiered Friction)
| Tier | Friction | Feel |
|------|----------|------|
| 0 Unranked | 0.970 | Very snappy, high friction |
| 1 Novice | 0.980 | Standard |
| 2 Practitioner | 0.988 | Smoother |
| 3 Specialist | 0.993 | Cinematic weight |
| 4 Sovereign | 0.997 | Glacial momentum, planetary feel |

Luminous Trail lengths: T0=4, T1=6, T2=10, T3=16, T4=24 frames

### Weighted Authority (Mastery Tier → Physics)
| Tier | Gravity Multiplier | Bloom Multiplier |
|------|--------------------|------------------|
| 1 Novice/Seeker | 1.0x | 1.0x |
| 2 Practitioner | 1.3x | 1.4x |
| 3 Specialist | 1.8x | 2.0x |
| 4 Sovereign | 2.5x | 3.0x |

Flow: SovereignContext → OrbitalNavigation → NebulaPlayground → NebulaSphere

### Predictive Snap Haptics
- CalcPredictiveSnap: Returns intensity (0→1) as sphere approaches gravity well
- Engaged zone: < 60% of well radius
- Haptic pulse every 150ms, intensity 10-50ms based on proximity

### NebulaSphere (Canvas 2D)
- Golden ratio vertex distribution (120 points, Fibonacci spiral)
- 3D→2D perspective projection with rotation
- Priority-based bloom (P1=brightest, P3=subdued)
- **Luminous Trail**: Position-history ghost trail (tier-scaled length/opacity)
- **Double-tap activation** → triggers Bubble Burst portal expansion
- **Predictive Snap**: Haptic pulse intensifying near gravity well

### Bubble Burst Portal (Multi-Screen)
- Double-tap on NebulaSphere expands to full-screen overlay
- **Tiered Clip-Path**: T1=300ms snap-open, T4=850ms cinematic unfolding
- **Web Audio Tone**: T1=2000Hz sine chime, T4=60Hz triangle bass rumble + sub-bass harmonic
- **Tiered Haptic**: T1=[20,10,10]ms, T4=[80,10,40]ms
- Horizontal snap-scroll between active bubbles
- Lazy-loads target page content inside each bubble
- Globe curvature vignette overlay
- Keyboard: Arrow keys navigate, Escape closes

### Phonic Resonance Engine
Route-based ambient Web Audio frequency with binaural offset:
| Domain | Frequency | Purpose |
|--------|-----------|---------|
| Spotless Solutions | 432Hz | Steady, grounding, natural |
| Enlightenment Cafe | 528Hz | Transformation, miracles |
| Tech/Dev | 741Hz | Expression, solutions |
| Meditation | 396Hz | Liberation from fear |
| Star Charts | 852Hz | Spiritual order, third eye |
| Wellness | 639Hz | Connecting, relationships |
| Creative/Music | 963Hz | Cosmic consciousness |

- 7Hz binaural offset (theta wave entrainment)
- 2-second smooth crossfade on route transitions
- Initializes on first user click (browser autoplay policy)
- Volume: 0.025 (ambient background)

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

## File Architecture
```
/app/frontend/src/
├── components/
│   ├── SovereignCrossbar.js    # Kinetic crossbar + elastic poles + tether
│   ├── NebulaSphere.js         # Canvas 2D sphere + tiered friction + luminous trail + predictive snap
│   ├── NebulaPlayground.js     # Sphere orchestration + gravity well + resonance
│   ├── SovereignHUD.js         # Priority queue visibility + NPU meter
│   ├── OrbitalNavigation.js    # Wrapper: Crossbar + Playground + HUD + BubblePortal + PhonicResonance
│   ├── BubblePortal.js         # Tiered clip-path expansion + Web Audio tone + horizontal snap-scroll
├── context/
│   ├── SovereignContext.js     # EventBus + Priority Queue + Mastery multipliers
├── hooks/
│   ├── usePhonicResonance.js   # Route-based Solfeggio ambient audio + binaural offset
├── pages/
│   ├── MasteryPath.js          # 4-Tier certification page
│   ├── SuanpanPhysics.js       # Bipolar gravity engine + tiered friction/trail/predictive snap exports

/app/backend/routes/
│   ├── sovereign_mastery.py    # 4-Tier Mastery & Certificates API
```

## Iteration History
### Iteration 238 — Sentient Streamline Enhancement (Apr 3, 2026) — LATEST
- Variable Inertia: TIER_FRICTION (0.970→0.997), TIER_TRAIL_LENGTH (4→24 frames)
- Luminous Trail: Canvas position-history ghost trail on NebulaSphere drag
- Predictive Snap: Haptic pulse intensifying as sphere approaches gravity well
- Tiered Bubble Portal: Expansion duration (300→850ms), Web Audio tone (2000Hz→60Hz), tiered haptics
- Phonic Resonance Engine: Route-based Solfeggio frequencies with 7Hz binaural offset
- Tests: Backend 10/10 (100%), Frontend 100%

### Iteration 237 — Sovereign Mastery + Bubble Burst (Apr 3, 2026)
- MasteryPath.js wired at /mastery-path (4-Tier, 3 Avenues, Certificates)
- Weighted Authority: tier multipliers → SuanpanPhysics
- BubblePortal: clipPath expansion, horizontal snap-scroll
- Tests: Backend 19/19 (100%), Frontend 100%

### Iterations 234-236 — Foundation (Apr 3, 2026)
- Mixer decomposition, Priority Queue, Orbital Navigation, Bipolar Gravity

## Upcoming (P1)
- Phase 3 Polish: AI-driven generative flourish (movement history → phonic improvisation)
- Predictive Phonic Pre-Loading: Warm up frequencies as sphere approaches Mixer

## Future/Backlog (P2)
- Multi-Civilization Star Charts (Hopi, Egyptian, Vedic)
- External audio asset hosting (real instrument multi-samples)
- Haptic API for mobile tactile feedback
- PWA offline mode

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
