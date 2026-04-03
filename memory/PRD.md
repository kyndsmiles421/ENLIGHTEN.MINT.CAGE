# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a full-stack wellness platform with orbital navigation, physics-based interactions, and a tiered subscription ecosystem.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Canvas 2D
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API

## Core System — Bipolar Gravity Ecosystem

### Sovereign Crossbar (fixed top-12, below Navigation)
- Fixed at top-12 (48px below nav) holding 5 draggable module poles
- Poles: Divine Director (Mixer), Trade Circle, Star Charts, Meditation, Wellness
- SNAP_THRESHOLD = 150px, Luminous Tether, Tether Breakaway particles
- Vacuum Catch Zone: Y < 115px (adjusted for nav offset)

### SuanpanPhysics Engine
- Inverse-Square Gravity: F = G * m1 * m2 / r² (G=800)
- Variable Inertia: TIER_FRICTION 0.970→0.997 (T0→T4)
- Luminous Trail: TIER_TRAIL_LENGTH 4→24 frames
- Predictive Snap: calcPredictiveSnap(spherePos, wellPos, wellRadius)
- Tiered Bubble Expansion: getBubbleExpandDuration(tier) = 300ms→850ms

### Weighted Authority (Mastery Tier → Physics)
| Tier | Gravity | Bloom | Friction |
|------|---------|-------|----------|
| 1 Novice | 1.0x | 1.0x | 0.980 |
| 2 Practitioner | 1.3x | 1.4x | 0.988 |
| 3 Specialist | 1.8x | 2.0x | 0.993 |
| 4 Sovereign | 2.5x | 3.0x | 0.997 |

### NebulaSphere (Canvas 2D)
- Golden ratio vertices, 3D→2D projection, priority-based bloom
- Luminous Trail: position-history ghost trail (tier-scaled)
- Double-tap → Bubble Burst portal expansion
- Predictive Snap haptics near gravity well

### Bubble Burst Portal (Multi-Screen)
- Tiered clip-path expansion: T1=300ms chime, T4=850ms bass rumble
- Web Audio tone: 2000Hz sine → 60Hz triangle + sub-bass harmonic
- Horizontal snap-scroll between active bubbles, lazy page loading

## Phonic Resonance Architecture

### Route-Based Solfeggio Frequencies
| Domain | Frequency | Purpose |
|--------|-----------|---------|
| Spotless Solutions | 432Hz | Steady, grounding |
| Enlightenment Cafe | 528Hz | Transformation |
| Tech/Dev | 741Hz | Expression, solutions |
| Meditation | 396Hz | Liberation from fear |
| Star Charts | 852Hz | Spiritual order |
| Wellness | 639Hz | Connecting |
| Creative/Music | 963Hz | Cosmic consciousness |

### Generative Flourish (AI Phonic Improvisation)
- Backend tracks movement history (routes, durations, velocity)
- POST /api/phonic/generate-flourish → Gemini 3 Flash generates sonic profile
- Fallback: algorithmic blending (dominant freq * 0.6 + time-of-day bias * 0.4)
- Patterns: steady, ascending, descending, arpeggio, ambient, pulsing
- 5-minute refresh interval

### Phase-Locked Proximity Harmonics
- Compatible spheres phase-lock into harmonic intervals (3rds, 5ths, octaves)
- Intensity follows inverse-square distance (1/d²)
- Strong resonance (>50% intensity) snaps to perfect harmonic ratio
- 6 harmonic pairs defined with freq_a, freq_b, interval, ratio

### Predictive Sonic Tug
- Cross-fade to destination frequency as sphere approaches gravity well
- Inverse-square volume increase: vol = intensity² * 0.04
- Doppler-like frequency shift: freq * (1 + intensity * 0.02)

### Movement Tracking
- Route visits recorded with timestamps, duration, velocity
- Movement summary: dominant frequency, route diversity, total duration
- Time-of-day bias: morning=432Hz, midday=528Hz, afternoon=741Hz, evening=396Hz, night=639Hz

## Sovereign Mastery — 4-Tier Certification System
| Tier | Name | Codename | Requirement |
|------|------|----------|-------------|
| 1 | Novice / Seeker | The Awakener | Complete Core Orientation |
| 2 | Practitioner | The Forger | 10 Mixer Collisions |
| 3 | Specialist | The Artisan | Avenue Certification |
| 4 | Sovereign / Super-User | The Nexus | Mastery of all 12 Units |

### 3 Avenues
1. Spotless Solutions (Sanitation Technology, 5 lessons, 1100 XP)
2. Enlightenment Cafe (Alternative Chemistry, 5 lessons, 1100 XP)
3. Tech/Dev Path (Modular UI/UX, 5 lessons, 1100 XP)

## API Endpoints
### Phonic Resonance
- POST /api/phonic/record-movement — Record route visit
- POST /api/phonic/generate-flourish — Generate AI sonic profile
- GET /api/phonic/harmonic-pairs — Resonance pair frequencies
- GET /api/phonic/movement-summary — Aggregated movement data

### Sovereign Mastery
- GET /api/sovereign-mastery/status — Tier info + multipliers
- POST /api/sovereign-mastery/record — Record progress
- GET /api/sovereign-mastery/avenues — Avenue curriculum
- GET /api/sovereign-mastery/certificates — Earned certificates

## File Architecture
```
/app/frontend/src/
├── components/
│   ├── SovereignCrossbar.js    # Kinetic crossbar (top-12) + elastic poles
│   ├── NebulaSphere.js         # Canvas 2D sphere + tiered physics + luminous trail
│   ├── NebulaPlayground.js     # Sphere orchestration + proximity harmonics
│   ├── SovereignHUD.js         # Priority queue + NPU meter
│   ├── OrbitalNavigation.js    # Wrapper + PhonicResonanceProvider + SonicTugProvider
│   ├── BubblePortal.js         # Tiered clip-path expansion + Web Audio
├── hooks/
│   ├── usePhonicResonance.js   # Main hook + useProximityHarmonics + usePredictiveSonicTug
├── context/
│   ├── SovereignContext.js     # EventBus + Priority Queue + Mastery multipliers
├── pages/
│   ├── MasteryPath.js          # 4-Tier certification page
│   ├── SuanpanPhysics.js       # Bipolar gravity engine + tiered exports

/app/backend/routes/
│   ├── phonic.py               # Movement tracking + Generative Flourish + Harmonics
│   ├── sovereign_mastery.py    # 4-Tier Mastery & Certificates
```

## Iteration History
### Iteration 239 — Phonic Architecture + UI Fix (Apr 3, 2026) — LATEST
- Bug fix: SovereignCrossbar top-0 → top-12 (no Navigation overlap)
- VACUUM_CATCH_Y: 65 → 115 (adjusted for crossbar offset)
- Backend phonic API: 4 endpoints (record-movement, generate-flourish, harmonic-pairs, movement-summary)
- Enhanced usePhonicResonance: movement tracking, generative flourish patterns, 5-min refresh
- Phase-Locked Proximity Harmonics: startResonance/stopResonance with 1/d² intensity
- Predictive Sonic Tug: engage/disengage for gravity well approach
- Tests: Backend 12/12 (100%), Frontend 100%

### Iteration 238 — Sentient Streamline Enhancement (Apr 3, 2026)
- Variable Inertia, Luminous Trail, Predictive Snap haptics
- Tiered Bubble Portal (300→850ms, Web Audio tone)
- Phonic Resonance Engine (route-based Solfeggio, binaural offset)

### Iteration 237 — Sovereign Mastery + Bubble Burst (Apr 3, 2026)
- MasteryPath.js, Weighted Authority, BubblePortal

### Iterations 234-236 — Foundation (Apr 3, 2026)
- Mixer decomposition, Priority Queue, Orbital Navigation, Bipolar Gravity

## Upcoming (P1)
- Haptic Sync: Tie Haptic API directly to Phonic Resonance Engine
- PWA Offline Resilience: Service Worker for core Solfeggio oscillators

## Future/Backlog (P2)
- Multi-Civilization Star Charts (Hopi, Egyptian, Vedic) — lazy-loaded culture layers
- External audio asset hosting (real instrument multi-samples)
- Haptic API for mobile tactile feedback
- Edge Functions for phonic logic

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
