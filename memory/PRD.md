# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform. V3 "Divine Director" — Professional-grade multi-track spiritual composition engine with 4-tier subscription system, Bonus Wrapped marketplace, Sacred Assembly materialization, and Speed Bridge commerce.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Three.js
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API, Stripe (pending)

## Two-Axis Progression System

### Mastery Tiers (Earned through practice)
Observer → Synthesizer → Archivist → Navigator → Sovereign

### Mixer Subscription Tiers (Paid infrastructure — separate from mastery)
```
Discovery (Free, Cold Path):  3 tracks, 5 AI/mo, Basic Tones, 44.1kHz, 15-30s Sacred Assembly
Player ($9.99/mo, Gentle):    8 tracks, 40 AI/mo, Extended (80+), 48kHz, 5-8s loading, +10% bonus
Ultra Player ($24.99/mo):     20 tracks + keyframes, 150 AI/mo, 3K+ effects, 88.2kHz, 2-3s, +15%
Sovereign ($49.99/mo, Hot):   Unlimited + nested, 250+ AI + NPU, Full Phonic, 96kHz Spatial, instant, +25%
```

## Architecture
```
/app/backend/routes/
├── mixer_director.py     # 4-tier subscription, projects CRUD, 21 sources, 5 bonus packs
├── generators.py         # 8 tiered payable generators with hybrid bloom logic
├── mantras_sovereign.py  # 4-tier audio & wisdom prescriptions (43 entries)
├── hexagram.py           # I Ching logic gates (64 hexagrams)
├── cosmic_state.py       # Unified math state (ODEs, chaos)
├── trade_circle.py       # Marketplace & exports

/app/frontend/src/pages/
├── SuanpanMixer.js       # "Divine Director" — multi-track timeline with 4-tier system
```

## API Endpoints — Mixer Director
```
GET  /api/mixer/subscription           — 4-tier status, config, 10-row comparison, all_tiers
POST /api/mixer/subscription/upgrade   — atomic tier upgrade (instant latency lift)
POST /api/mixer/projects               — save project (layer cap enforced: 3/8/20/unlimited)
GET  /api/mixer/projects               — list projects
GET  /api/mixer/projects/{id}          — load project with tracks
DELETE /api/mixer/projects/{id}        — delete project
GET  /api/mixer/sources                — 21 tier-gated track sources
GET  /api/mixer/bonus-packs            — 5 bonus wrapped packs with ownership/gating
POST /api/mixer/bonus-packs/purchase   — buy pack, deduct credits, apply bonus atomically
GET  /api/mixer/bonus-packs/owned      — owned packs with track data
```

## Bonus Wrapped Packs (5 packs)
```
Vedic Vocal Suite (Player, 25c)        → +10% AI Gen Speed, 3 tracks
Hopi Chant Collection (Player, 30c)    → +15 Monthly AI Credits, 3 tracks
Solfeggio Master Scale (Ultra, 40c)    → +15% Render Speed, 4 tracks
Sacred Geometry Visual Pack (Ultra, 35c) → +10% Export Speed, 3 tracks
Deep Earth Resonance Suite (Sov, 50c)  → +20% Processing Speed, 4 tracks
```

## Track Source Library (21 sources across 4 tiers)
```
Discovery (4): OM, UT, MI, Schumann
Player (5): RE, FA, SOL, Sacred Forest, Cosmic Rain
Ultra Player (5): LA, Temple Bells, Singing Bowl, So Ham, Om Shanti
Sovereign (7): SI, Celestial Gate, Om Mani Padme Hum, Gayatri, Deep Space, Sacred Geometry, Living Mandala
```

## UI Components — Divine Director
- **Sacred Assembly Loader**: Concentric rotating rings with phase progression for Discovery tier
- **Speed Bridge Modal**: 4-tier comparison with instant upgrade buttons
- **Bonus Packs Panel**: Collapsible shop showing 5 packs with purchase/ownership
- **Track Rows**: Waveform visualization bars, grip handles, volume/mute/solo/remove
- **Ghost/Shadow Tracks**: Locked sources as translucent layers for upselling
- **Suanpan Panel**: Collapsible bead abacus as frequency source

## Iteration History

### Iteration 224 — 4-Tier System + Bonus Wrapped Packs (Apr 2, 2026) — LATEST
- Expanded from 3 to 4 mixer tiers (Discovery/Player/Ultra Player/Sovereign)
- 5 Bonus Wrapped packs with permanent functional bonuses (+speed, +AI credits)
- Sacred Assembly loader animation for Discovery tier (15-30s aesthetic throttling)
- Enhanced track UI: waveform visualization bars, grip handles
- 21 tier-gated track sources (up from 17)
- Fixed auth timing issue (wait for authLoading before API calls)
- Tests: Backend 100%, Frontend fix applied for auth timing

### Iteration 223 — Divine Director v1 (Apr 2, 2026)
### Iteration 222 — Tiered Payable Bonuses & Generators (Apr 2, 2026)
### Iterations 217-221 — Orbital Architecture, Audio, I Ching, Mantras

## Upcoming Tasks (P1)
- Keyframe Automation: Draw volume/frequency curves over timeline
- AI "Mantra DJ" Auto-Edit: Goal-based auto-composition with cross-fades
- Ripple Editing: Sync-locked layer shifting
- Nested Sacred Projects: Group sequences into reusable blocks
- Snippet "Try-On": 10-second locked instrument preview
- Predictive Micro-Interactions: Surface compatible harmonics

## Future/Backlog (P2)
- NPU Priority / GPU edge hooks
- Haptic Tuning (micro-vibrations on bloom alignment)
- Gesture-based timeline (pinch-to-zoom, scrub)
- Multi-Civilization Star Charts
- External audio asset hosting

## Key Rules
- MongoDB: Exclude _id | Audio: Check sovereignMute
- Orbital: Sphere=auto, effects=pointer-events:none
- Generators: Purchase through /api/trade-circle/purchase
- Mixer: Layer cap enforced on save, atomic upgrade lifts instantly
- Subscriptions: 2 axes — mastery (earned) + mixer (paid)
- Auth: Wait for authLoading before making API calls

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
