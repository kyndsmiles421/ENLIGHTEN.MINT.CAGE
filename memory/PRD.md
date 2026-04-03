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
  POST /api/mixer/projects/ripple (Ripple editing)
  POST /api/mixer/tracks/toggle-lock (Lock toggle)
  POST /api/mixer/auto-compose (AI Mantra DJ)
  GET  /api/mixer/auto-compose/goals (Goal catalog)

Sovereign:
  GET  /api/sovereign/status
  GET  /api/sovereign/tiers
  GET  /api/sovereign/units
  POST /api/sovereign/command (Command Mode)
  POST /api/sovereign/events/publish (Pub/Sub)
  GET  /api/sovereign/events/recent
```

## Sovereign Architecture (4-Tier Model)
| Tier | Codename | Price | AI Brain | Visuals | Audio |
|------|----------|-------|----------|---------|-------|
| Standard | The Seed | Free | Single-Node Logic | 1080p | 44.1kHz Stereo |
| Apprentice | The Bloom | $9.99/mo | Multi-Node + Glass Box | 1440p | 48kHz Spatial |
| Artisan | The Architect | $24.99/mo | Collaborative Agents | 2K | 96kHz Lossless |
| Sovereign | The Super User | $49.99/mo | Autonomous Master | 4K | 192kHz 8D Binaural |

### Cross-Tier Purchasing
12 purchasable units (Thinking Feed, Spatial Audio, Agent Sessions, Asset Export, etc.)

### Glass Box Thinking Feed (Apprentice+)
- Agent Alpha (Geometer): Sacred Geometry mapping
- Agent Beta (Harmonizer): Solfeggio Frequency alignment
- Agent Gamma (Logistics): GPS, permits, inventory (Artisan+)

## Frontend Architecture — Triple-Domain Decomposition (Apr 3, 2026)
```
/app/frontend/src/pages/
├── SuanpanMixer.js      # Main orchestrator (imports from 3 domains)
├── SuanpanCore.js        # Foundation math, constants, TrackRow, KeyframeLane, SuanpanSource
├── SuanpanSovereign.js   # Tier logic: SpeedBridgeModal, BonusPackCard, RecommendationCard
├── SuanpanVfx.js         # Visual effects: SacredAssemblyLoader, LightTrailCanvas, BloomGlow

/app/frontend/src/context/
├── SovereignContext.js   # EventBus + Priority Queue (critical/experience/background)

/app/frontend/src/components/
├── CommandMode.js        # Global Ctrl+K command interface
```

## Priority Queue / Backpressure System (Apr 3, 2026)
```
Priority 1 (Nexus Path):      UI thread, Master Orchestrator — zero latency, 3 concurrent
Priority 2 (Sensory Stream):  Audio/Binaural, AI generation — high fidelity, 2 concurrent
Priority 3 (Background Orbit): Asset export, GPS, saves — throttled, 1 concurrent

Features:
- requestIdleCallback scheduling for non-critical tasks
- NPU Burst mode: blocks background tasks during intensive processing
- Frame budget: 12ms target (under 16ms browser threshold)
- Queue stats: enqueued/completed/errors/pending/active counters
```

## Iteration History
### Iteration 234 — Decomposition + Priority Queue (Apr 3, 2026) — LATEST
- SuanpanMixer.js (1681→~900 lines) decomposed into SuanpanCore/Sovereign/Vfx
- Priority Queue with 3 levels, backpressure, NPU burst mode
- Auto-compose/AI gen routed through experience priority
- Save/upload routed through background priority
- EventBus integration for cross-component commands
- Tests: Backend 100% (18/18), Frontend 100%

### Iteration 233 — Sovereign Centralized State (Apr 3, 2026)
- SovereignContext.js with EventBus Pub/Sub
- CommandMode.js with Ctrl+K shortcut
- Sovereign Tier Middleware (X-Sovereign-Tier headers)
- Tests: Backend 100% (18/18), Frontend 100%

### Iteration 232 — Sovereign Architecture (Apr 3, 2026)
- 4-Tier model, Cross-tier shop, Glass Box Thinking Feed
- Tests: Backend 100% (26/26), Frontend 100%

### Iteration 231 — Templates, Camera, Mic, AI Gen (Apr 3, 2026)
### Iteration 230 — Mixer Content Library Expansion (Apr 3, 2026)
### Iteration 229 — Consciousness Widget Fix (Apr 3, 2026)
### Iteration 228 — AI Mantra DJ (Apr 3, 2026)
### Iteration 227 — Backend Refactoring (Apr 3, 2026)
### Iteration 226 — Ripple Editing (Apr 2, 2026)
### Iteration 225 — Intelligence Layer (Apr 2, 2026)
### Iteration 224 — 4-Tier + Bonus Packs (Apr 2, 2026)
### Iteration 223 — Divine Director v1 (Apr 2, 2026)

## Upcoming (P1)
- Phase 3 Polish: Light trails and bloom effects
- Generative Flourish Bonus: AI phonic resonance based on movement history
- SuanpanCore.js flexibility for non-Western astronomical models

## Future/Backlog (P2)
- Multi-Civilization Star Charts (Hopi, Egyptian, Vedic)
- External audio asset hosting (real instrument multi-samples)
- Haptic API for mobile tactile feedback
- Pan + Reverb keyframe lanes
- NPU Priority / GPU edge hooks

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
