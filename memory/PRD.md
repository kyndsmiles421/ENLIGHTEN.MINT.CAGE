# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a full-stack wellness platform with orbital navigation, physics-based interactions, and a tiered subscription ecosystem.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Canvas 2D, Three.js
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API
- **PWA**: Service Worker with Solfeggio wave table caching

## Core System — Bipolar Gravity Ecosystem

### Sovereign Crossbar (fixed top-12, below Navigation)
- Fixed at top-12 (48px below nav), z-[200], 5 draggable module poles
- SNAP_THRESHOLD = 150px, Luminous Tether, Tether Breakaway particles
- Vacuum Catch Zone: Y < 115px

### SuanpanPhysics Engine
- Inverse-Square Gravity, Variable Inertia (TIER_FRICTION 0.970→0.997)
- Luminous Trail (TIER_TRAIL_LENGTH 4→24 frames)
- Predictive Snap (calcPredictiveSnap)
- Tiered Bubble Expansion (getBubbleExpandDuration 300ms→850ms)

### Weighted Authority
| Tier | Gravity | Bloom | Friction |
|------|---------|-------|----------|
| 1 Novice | 1.0x | 1.0x | 0.980 |
| 2 Practitioner | 1.3x | 1.4x | 0.988 |
| 3 Specialist | 1.8x | 2.0x | 0.993 |
| 4 Sovereign | 2.5x | 3.0x | 0.997 |

### NebulaSphere (Canvas 2D)
- Golden ratio vertices, 3D→2D projection, Luminous Trail
- Double-tap → Bubble Burst portal, Predictive Snap haptics

### Bubble Burst Portal
- Tiered clip-path expansion: T1=300ms chime → T4=850ms bass rumble
- Horizontal snap-scroll, lazy page loading, globe curvature vignette

## Phonic Resonance Architecture

### Solfeggio Frequencies
| Domain | Frequency |
|--------|-----------|
| Spotless Solutions | 432Hz |
| Enlightenment Cafe | 528Hz |
| Tech/Dev | 741Hz |
| Meditation | 396Hz |
| Star Charts | 852Hz |
| Wellness | 639Hz |
| Creative/Music | 963Hz |

### Generative Flourish (AI Phonic Improvisation)
- Movement tracking → Gemini 3 Flash sonic profile (algorithmic fallback)
- Patterns: steady, ascending, descending, arpeggio, ambient, pulsing
- 5-minute refresh, time-of-day bias

### Phase-Locked Proximity Harmonics
- Compatible spheres phase-lock into harmonic intervals (1/d²)
- **Haptic Sync**: Interval-specific vibration patterns
  - unison: [5], second: [8,15,8], third: [10,20,10,20,10] (soft)
  - fourth: [15,15,15], fifth: [20,10,20,10,20] (strong)
  - octave: [30,5,30,5,40] (sharp)
- 400ms debounce per pair

### Predictive Sonic Tug
- Cross-fade to destination frequency, Doppler-like shift

### Harmonic Memory
- Tracks favorite sphere pairings (>0.6 intensity for 3s → bookmark)
- On next session, adjusts initial sphere positions using closeness_factor (0→0.8)
- Closer factor = tighter starting radius + angle offset

## PWA Offline Resilience
- Service Worker caches 7 Solfeggio wave tables (sine samples, 44100Hz, 2s duration)
- App shell caching for offline navigation
- Cache paths: /solfeggio/{freq} for direct access

## Multi-Civilization Star Charts
### Culture Layer System
- **Hopi**: Hotomkam (Orion's Belt/Three Mesas), Tsootsma (Pleiades/Wuwuchim), Saquasohuh (Blue Star Kachina/Sirius). Color: #D97706, Freq: 432Hz
- **Egyptian**: Sah (Osiris/Orion), Sopdet (Isis/Sirius), Meskhetiu (Thoth/Ursa Major). Color: #B45309, Freq: 528Hz
- **Vedic**: Ashwini, Rohini, Pushya, Swati (Nakshatras). Color: #7C3AED, Freq: 741Hz
- Lazy-loaded via /api/culture-layers/{id}
- CultureLayerPanel toggle component with teachings display
- Also integrated into existing star_cultures_data.json (21 total cultures)

## Sovereign Mastery — 4-Tier Certification System
| Tier | Name | Requirement |
|------|------|-------------|
| 1 | Novice / Seeker | Core Orientation |
| 2 | Practitioner | 10 Mixer Collisions |
| 3 | Specialist | Avenue Certification |
| 4 | Sovereign | Mastery of 12 Units |

### 3 Avenues
1. Spotless Solutions (5 lessons, 1100 XP)
2. Enlightenment Cafe (5 lessons, 1100 XP)
3. Tech/Dev Path (5 lessons, 1100 XP)

## API Endpoints
### Phonic
- POST /api/phonic/record-movement
- POST /api/phonic/generate-flourish
- GET /api/phonic/harmonic-pairs
- GET /api/phonic/movement-summary
- POST /api/phonic/record-harmonic
- GET /api/phonic/harmonic-memory

### Culture Layers
- GET /api/culture-layers/
- GET /api/culture-layers/{layer_id}

### Sovereign Mastery
- GET /api/sovereign-mastery/status
- POST /api/sovereign-mastery/record
- GET /api/sovereign-mastery/avenues
- GET /api/sovereign-mastery/certificates

## File Architecture
```
/app/frontend/src/
├── components/
│   ├── SovereignCrossbar.js    # Kinetic crossbar (top-12)
│   ├── NebulaSphere.js         # Canvas 2D + tiered physics + luminous trail
│   ├── NebulaPlayground.js     # Sphere orchestration + proximity harmonics + harmonic memory
│   ├── SovereignHUD.js         # Priority queue + NPU meter
│   ├── OrbitalNavigation.js    # Wrapper + PhonicResonance + SonicTug
│   ├── BubblePortal.js         # Tiered clip-path + Web Audio
│   ├── CultureLayerPanel.js    # Culture layer toggle UI
├── hooks/
│   ├── usePhonicResonance.js   # Main + ProximityHarmonics + SonicTug + HapticSync
├── pages/
│   ├── MasteryPath.js          # 4-Tier certification
│   ├── SuanpanPhysics.js       # Bipolar gravity engine
/app/frontend/public/
│   ├── sw.js                   # Service Worker + Solfeggio cache

/app/backend/routes/
│   ├── phonic.py               # Movement + Flourish + Harmonics + Memory
│   ├── culture_layers.py       # Hopi/Egyptian/Vedic culture data
│   ├── sovereign_mastery.py    # 4-Tier Mastery
/app/backend/data/
│   ├── star_cultures_data.json # 21 star cultures
```

## Iteration History
### Iteration 240 — Haptic Sync + PWA + Culture Layers + Harmonic Memory (Apr 3, 2026) — LATEST
- Haptic Sync: interval-specific vibration patterns (soft 3rds → sharp octaves)
- PWA Offline: Service Worker with 7 Solfeggio wave table cache
- Multi-Civilization Star Charts: Hopi/Egyptian/Vedic culture layers + CultureLayerPanel
- Harmonic Memory: bookmark favorite pairings, pre-position on next session
- Tests: Backend 12/12 (100%), Frontend 100%

### Iteration 239 — Phonic Architecture + UI Fix
### Iteration 238 — Sentient Streamline Enhancement
### Iteration 237 — Sovereign Mastery + Bubble Burst
### Iterations 234-236 — Foundation

## Upcoming (P1)
- Integrate CultureLayerPanel into StarChart page UI
- External audio asset hosting (real instrument multi-samples)

## Future/Backlog (P2)
- Edge Functions for phonic logic
- Pan + Reverb keyframe lanes
- Haptic API deep integration for mobile

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
