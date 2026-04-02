# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform. V3 "Divine Director" — Professional-grade multi-track spiritual composition engine with tiered subscription infrastructure, Speed Bridge commerce, and ghost-track upselling.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Three.js
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API, Stripe (pending)

## Architecture
```
/app/backend/routes/
├── mixer_director.py    # NEW: Mixer subscription tiers + multi-track project CRUD + sources
├── generators.py        # Tiered payable bonuses (8 generators, hybrid bloom logic)
├── mantras_sovereign.py # 4-tier audio & wisdom prescriptions
├── hexagram.py          # I Ching logic gates
├── hexagram_journal.py  # Hexagram journal entries
├── cosmic_state.py      # Unified math state
├── sovereign_math.py    # ODEs & Chaos Theory math engine
├── trade_circle.py      # Marketplace & exports
├── botany.py            # Botanical elements

/app/frontend/src/pages/
├── SuanpanMixer.js      # REWRITTEN: "Divine Director" multi-track timeline
├── BotanyOrbital.js     # 3D botanical orbital (z-fix: bottom-24 right-20)
├── TradeCircleOrbital.js # 3D trade orbital (z-fix applied)
├── CodexOrbital.js      # 3D codex orbital (z-fix applied)
├── OrbitalHub.js        # Hub page
```

## Two-Axis Progression System (Separate but Coupled)

### Mastery Tiers (Earned through practice)
```
Observer → Synthesizer → Archivist → Navigator → Sovereign
Controls: mantras access, hexagram depth, ODE complexity
```

### Mixer Subscription Tiers (Paid infrastructure)
```
Discovery (Free, Cold Path):
  - 3 Static Tracks, 5 AI Credits/mo, Basic Tones, Standard Stereo
  - 15-30s "Sacred Assembly" materialization delay
  - Shadow/ghost tracks showing locked Sovereign features

Resonance ($14.99/mo, Warm Path):
  - 10 Tracks + Keyframes, 100 AI Credits/mo, 3000+ Sound Effects, HD Lossless
  - 2-3s stabilization delay
  - Shadow tracks still visible

Sovereign ($49.99/mo, Hot Path):
  - Unlimited layers + Nested Projects, 200+ Credits + NPU Priority
  - Full Phonic Library, Ultra-Lossless / Atmos Spatial
  - Instant (GPU edge), no shadow tracks
```

### API Endpoints — Mixer Director
```
GET  /api/mixer/subscription       — tier status, config, comparison table, all tiers
POST /api/mixer/subscription/upgrade — atomic tier upgrade (instant latency lift)
POST /api/mixer/projects            — save project (layer cap enforced)
GET  /api/mixer/projects            — list user's projects
GET  /api/mixer/projects/{id}       — load specific project with tracks
DELETE /api/mixer/projects/{id}     — delete project
GET  /api/mixer/sources             — track source library (tier-gated, 17 sources)
```

### API Endpoints — Generators
```
GET  /api/trade-circle/generators/catalog — full catalog with ownership
POST /api/trade-circle/purchase           — buy generator (tier→credits→deduct→unlock)
GET  /api/vault/generators                — owned generators with bloom coefficients
POST /api/vault/generators/toggle         — toggle generator on/off
```

## Multi-Track Project Data Model
```
mixer_projects: {
  id, user_id, name, track_count, tier_at_save,
  tracks: [{ index, type, source_id, source_label, volume, muted, solo,
             start_time, duration, frequency, color, locked }],
  created_at, updated_at
}

mixer_subscriptions: {
  user_id, tier, ai_credits_remaining, speed_bonus_pct, created_at
}
```

## Track Source Library (17 sources)
```
Discovery:  OM (136.1Hz), UT (174Hz), MI (528Hz), Schumann (7.83Hz)
Resonance:  RE (285Hz), FA (639Hz), SOL (741Hz), LA (852Hz),
            Sacred Forest, Temple Bells, Cosmic Rain
Sovereign:  SI (963Hz), Celestial Gate (1074Hz), Om Mani Padme Hum,
            Gayatri Mantra, Deep Space Resonance, Sacred Geometry Visual
```

## Speed Bridge Commerce
When user hits layer cap or tries locked source, "Speed Bridge" modal shows:
- 3-tier comparison (Discovery/Resonance/Sovereign)
- Features per tier, pricing, and "Upgrade" buttons
- "Your composition has reached Divine Complexity" messaging

## Iteration History

### Iteration 223 — Divine Director Multi-Track Mixer (Apr 2, 2026) — LATEST
- **Mixer Subscription System**: 3-tier (Discovery/Resonance/Sovereign) separate from mastery
- **Multi-Track Projects**: Full CRUD with layer cap enforcement per subscription tier
- **Divine Director UI**: Professional DAW-style timeline with track stack, volume/mute/solo/remove
- **Suanpan Integration**: Collapsible frequency source panel preserved within timeline
- **Ghost/Shadow Tracks**: Locked sources shown as translucent layers for upselling
- **Speed Bridge Modal**: 3-tier comparison with atomic upgrade flow
- **Track Source Library**: 17 tier-gated sources (phonic tones, mantras, ambience, visuals)
- **Transport Controls**: Play/Stop all tracks with solo isolation
- Tests: 100% pass (Iteration 223 — 17 features verified)

### Iteration 222 — Tiered Payable Bonuses & Generator Console (Apr 2, 2026)
- Generator system: 8 generators, hybrid bloom logic, purchase/vault/toggle
- Tests: 100% (14 features verified)

### Earlier Iterations (217-221)
- Orbital Architecture, 4-Tier Audio, I Ching, Mantras Library, Convolution Reverb

## Upcoming Tasks (P1)
- **Keyframe Automation**: Draw volume curves over time per track
- **AI "Mantra DJ" Auto-Edit**: Analyze session goal, auto-join best moments with cross-fades
- **Ripple Editing**: Shortening segment auto-shifts subsequent layers
- **Nested Sacred Projects**: Group mantra sequences into reusable blocks (Sovereign only)
- **Snippet "Try-On"**: 10-second high-fidelity preview of locked instruments over active mix

## Future/Backlog (P2)
- NPU Priority / GPU edge acceleration hooks
- Haptic Guidance for tuned layers (micro-vibrations on alignment)
- Gesture-based timeline controls (pinch-to-zoom, scrub)
- Bonus-Wrapped Trade Circle assets (+10% speed boost mechanics)
- Multi-Civilization Star Charts (Hopi, Egyptian, Vedic)
- External audio asset hosting (real instrument samples)
- Predictive Micro-Interactions (anticipate compatible chants)
- Atomic State Management for subscription changes

## Key Rules
- MongoDB: Exclude _id | Audio: Check sovereignMute
- Orbital: Sphere=auto, effects=none | Reverb: getConvolver()
- Generators: Purchase through /api/trade-circle/purchase only
- Mixer: Layer cap enforced on save, atomic upgrade lifts instantly
- Subscriptions: Separate from mastery — two independent axes

## Test Credentials
- User: `grad_test_522@test.com` / `password` (Currently: Resonance tier)
- Auth key: `zen_token`
