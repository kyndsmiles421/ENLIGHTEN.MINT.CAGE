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
- SVG ring visualization in SovereignHUD, fetches every 30s
- Collapsed HUD pill shows score badge

## PWA Offline Resilience
- Service Worker caches 7 Solfeggio wave tables (44.1kHz, 2s sine samples)
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

### Culture: /api/culture-layers/
- GET / (list), GET /{layer_id} (full data)

### Mastery: /api/sovereign-mastery/
- GET status, POST record, GET avenues, GET certificates

## File Architecture
```
/app/frontend/src/
├── components/
│   ├── SovereignCrossbar.js, NebulaSphere.js, NebulaPlayground.js
│   ├── SovereignHUD.js (+ Session Harmony Score)
│   ├── OrbitalNavigation.js, BubblePortal.js
│   ├── CultureLayerPanel.js
├── hooks/
│   ├── usePhonicResonance.js (+ ProximityHarmonics + SonicTug + HapticSync)
├── pages/
│   ├── MasteryPath.js, SuanpanPhysics.js, StarChart.js (+ CultureLayerPanel)
/app/frontend/public/
│   ├── sw.js (Solfeggio cache)

/app/backend/routes/
│   ├── phonic.py (movement + flourish + harmonics + memory + harmony-score)
│   ├── culture_layers.py (Hopi/Egyptian/Vedic)
│   ├── sovereign_mastery.py
```

## Iteration History
### Iteration 241 — Session Harmony Score + CultureLayer Integration (Apr 3, 2026) — LATEST
- Session Harmony Score: POST /api/phonic/harmony-score, SVG ring in SovereignHUD, 6 grades, 3 breakdown bars
- CultureLayerPanel injected into StarChart page (top-28 left-4)
- Tests: Backend 8/8 (100%), Frontend 100%

### Iteration 240 — Haptic Sync + PWA + Culture Layers + Harmonic Memory
### Iteration 239 — Phonic Architecture + UI Fix
### Iteration 238 — Sentient Streamline Enhancement
### Iteration 237 — Sovereign Mastery + Bubble Burst
### Iterations 234-236 — Foundation

## Upcoming (P1)
- External audio asset hosting (real instrument multi-samples for richer textures)
- Edge Functions for phonic logic (ultra-low-latency)

## Future/Backlog (P2)
- Pan + Reverb keyframe lanes in Mixer
- Deep Haptic API for mobile-first tactile navigation
- GPS-based Cosmic Map

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
