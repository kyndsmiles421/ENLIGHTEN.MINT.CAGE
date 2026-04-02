# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a full-stack wellness platform. V4 "Intelligence Layer" — Hexagram-based AI recommendations, keyframe automation (Volume + Frequency), and 4-tier subscription ecosystem.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Three.js
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API

## Two-Axis Progression (Mastery + Subscription)
### Mastery: Observer → Synthesizer → Archivist → Navigator → Sovereign (earned)
### Mixer: Discovery → Player → Ultra Player → Sovereign (paid, separate)

## 4-Tier Mixer Subscription
```
Discovery (Free):    3 tracks, 5 AI/mo, 44.1kHz, 15-30s Sacred Assembly, 1.0x bonus
Player ($9.99):      8 tracks, 40 AI/mo, 48kHz, 5-8s, 1.1x bonus
Ultra Player ($24.99): 20 tracks + keyframes, 150 AI/mo, 88.2kHz, 2-3s, 1.15x bonus
Sovereign ($49.99):  Unlimited + nested, 250+ AI + NPU, 96kHz Spatial, instant, 1.25x
```

## API Endpoints
```
Mixer Director:
  GET  /api/mixer/subscription, POST /api/mixer/subscription/upgrade
  POST /api/mixer/projects, GET /api/mixer/projects, GET /api/mixer/projects/{id}
  DELETE /api/mixer/projects/{id}
  GET  /api/mixer/sources (21 tier-gated sources)
  GET  /api/mixer/bonus-packs, POST /api/mixer/bonus-packs/purchase
  GET  /api/mixer/bonus-packs/owned
  GET  /api/mixer/recommendations (Hexagram-based)

Generators:
  GET  /api/trade-circle/generators/catalog
  POST /api/trade-circle/purchase
  GET  /api/vault/generators, POST /api/vault/generators/toggle
```

## Hexagram Recommendation Engine
```
Lower Trigram (bits 0-2) → Soul/Vocal pack mapping:
  Earth→Vedic, Thunder→Hopi, Water→Vedic, Lake→Hopi
  Mountain→Solfeggio, Fire→Solfeggio, Wind→Vedic, Heaven→Solfeggio

Upper Trigram (bits 3-5) → Environment/Visual pack mapping:
  Earth→DeepEarth, Thunder→SacredGeometry, Water→DeepEarth, Lake→SacredGeometry
  Mountain→DeepEarth, Fire→SacredGeometry, Wind→SacredGeometry, Heaven→DeepEarth

Stagnation Detection:
  Hexagrams 12,23,29,36,39,47 + avg_freq > 600Hz → grounding override
  Inserts Deep Earth Resonance as priority recommendation

Tone Logic:
  Owned packs → "soft" (gentle reminder to activate)
  Unowned packs → "active" (explains energetic need + purchase conversion)
```

## Keyframe Automation (Ultra Player+)
```
Per-track automation lanes: Volume (0-1) + Frequency (0-maxHz)
SVG-based curve drawing: click to add control points
Golden Ratio snap lines: Phi intervals for harmonic alignment
Stored as: keyframes_volume/keyframes_frequency arrays in track data
Saved/loaded with project CRUD
Double-click control point to remove
```

## Bonus Wrapped Packs (5 packs)
```
Vedic Vocal Suite (Player, 25c)         → +10% AI Gen Speed
Hopi Chant Collection (Player, 30c)     → +15 AI Credits
Solfeggio Master Scale (Ultra, 40c)     → +15% Render Speed
Sacred Geometry Visual Pack (Ultra, 35c) → +10% Export Speed
Deep Earth Resonance Suite (Sov, 50c)   → +20% Processing Speed
```

## Iteration History
### Iteration 225 — Intelligence Layer (Apr 2, 2026) — LATEST
- Hexagram-based recommendation engine (trigram mapping, stagnation detection, soft/active tone)
- Keyframe Automation UI (Volume + Frequency SVG curves with Golden Ratio snap)
- Expandable automation lanes per track (gated to Ultra Player+)
- Recommendation cards in Packs panel with hexagram context
- Auth timing fix (wait for token before API calls)
- Tests: Backend 100% (21/21), Frontend auth fix applied

### Iteration 224 — 4-Tier + Bonus Packs (Apr 2, 2026)
### Iteration 223 — Divine Director v1 (Apr 2, 2026)
### Iteration 222 — Tiered Payable Bonuses (Apr 2, 2026)
### Iterations 217-221 — Orbital Architecture, Audio, I Ching

## Upcoming (P1)
- AI "Mantra DJ" Auto-Edit (cross-faded auto-composition)
- Ripple Editing (sync-locked layer shifting with keyframe preservation)
- Nested Sacred Projects (Sovereign-only collapsible blocks)
- Snippet "Try-On" (10s locked instrument preview)
- Predictive Micro-Interactions

## Future/Backlog (P2)
- Pan + Reverb keyframe lanes
- NPU Priority / GPU edge hooks
- Haptic Tuning, Gesture timeline
- Multi-Civilization Star Charts

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
