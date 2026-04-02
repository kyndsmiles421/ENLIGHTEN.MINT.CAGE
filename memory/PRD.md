# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform. V2 "Sovereign Core" — Unified Simulation Architecture. Recursive 3D orbital interface with 4-tier audio system, I Ching state-machine, convolution reverb, mantras/affirmations library, and tiered payable generator bonuses.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Three.js
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API, Stripe (pending)

## Architecture
```
/app/frontend/src/
├── context/
│   ├── SensoryContext.js (4-TIER AUDIO ENGINE: convolution reverb, confirmation chimes,
│   │                       singing bowl synthesis, sympathetic resonance, tier mapping)
│   ├── CosmicStateContext.js (UNIFIED MATH: ODE energies, stability, hexagram, tier-gated)
│   ├── AuthContext.js, MixerContext.js, TempoContext.js, LanguageContext.js
├── components/
│   ├── OrbitalHubBase.js (UNIVERSAL 3D: gravity engine, gravitational pull zones,
│   │                       deep-dive fly-in, confirmation chimes, depth breadcrumbs, portal)
│   ├── OrbitalTransitionPortal.js (WORMHOLE NAV: 5 destinations, expanding ring animation)
│   ├── ResonancePulse.js (audio breadcrumb + HexagramGlitch + HexagramBadge)
│   ├── CosmicSparkline.js (SVG ODE curve + hexagram badge)
│   ├── NanoGuide.js, FiveElementsWheel.js, SmartDock.js, CosmicAssistant.js, MissionControl.js
│   ├── orbital/ (9 files), trade/
├── pages/
│   ├── OrbitalHub.js, BotanyOrbital.js, TradeCircleOrbital.js, CodexOrbital.js
│   ├── HexagramJournal.js, Botany.js, StarChart.js, TradeCircle.js, Codex.js
│   ├── SuanpanMixer.js (+ Generator Console slide-over), Archives.js

/app/backend/routes/
├── generators.py (TIERED PAYABLE BONUSES: 8 generators across 3 types,
│                   hybrid deterministic+RNG bloom logic, purchase/vault/toggle endpoints)
├── mantras_sovereign.py (43 entries: 10 ancient mantras, 10 phonic resonances,
│                          15 affirmations, 8 wisdom prescriptions — all tier-gated)
├── hexagram.py, hexagram_journal.py, cosmic_state.py, sovereign_math.py
├── sovereign_codex.py, botany.py, mastery.py, trade_circle.py
```

## Generator System (Tiered Payable Bonuses)
```
Three generator types purchasable with Trade Circle credits:

Sub-Harmonic Generators:
  - Sub-Harmonic Pulse (Synthesizer, 8c): 1.5Hz beating effect
  - Deep Earth Resonator (Archivist, 15c): 7.83Hz Schumann resonance
  - Sovereign Bass Field (Sovereign, 30c): Multi-layered sympathetic stack

Mantra Extensions:
  - Phonic Flourish (Synthesizer, 10c): 174-528Hz phonic layer, 2 layers
  - Harmonic Density Weave (Archivist, 20c): 174-963Hz, 5 overtones
  - Celestial Gate Resonance (Sovereign, 35c): 174-1074Hz, hexagram modulation

Ultra-Lossless Rendering:
  - Hi-Fi Session Boost (Archivist, 5c): 88.2kHz/24-bit single session
  - Ultra-Lossless Sovereign Render (Sovereign, 12c): 96kHz/24-bit unlimited

Hybrid Logic:
  Deterministic Core: frequencies fixed from hexagram state (hex_factor)
  Bloom: seeded RNG (SHA-256 of user_id:generator_id) modulates reverb
         color and decay within variance bounds (10-25% range)

API Endpoints:
  GET  /api/trade-circle/generators/catalog — full catalog with ownership
  POST /api/trade-circle/purchase — buy generator (tier→credits→deduct→unlock)
  GET  /api/vault/generators — owned generators with live bloom coefficients
  POST /api/vault/generators/toggle — toggle generator on/off
```

## 4-Tier Audio Resolution System
```
Standard (Observer):    44.1kHz/16-bit, basic synthesis, 0.8s reverb, 0.1 mix
Apprentice (Synthesizer): 48kHz/16-bit, harmonic overtones, 1.5s reverb, 0.2 mix
Artisan (Archivist):    88.2kHz/24-bit, multi-sampled + convolution reverb, 2.5s decay, 0.3 mix
Sovereign (Navigator+): 96kHz/24-bit, lossless + sympathetic resonance + full reverb, 4.0s decay, 0.4 mix
```

## Mantras & Affirmations Library (43 entries)
```
Ancient Mantras (10): Om, Om Mani Padme Hum, Gayatri, So Ham, etc.
Phonic Resonances (10): 174Hz–1074Hz solfeggio scale
Affirmations (15): Element-mapped positive expressions
Wisdom Prescriptions (8): Hexagram-range-linked guidance
```

## Orbital Transition Portal
```
5 destinations: Botany, Trade, Codex, Hub, Stars
Wormhole effect: 5 expanding concentric rings (0.6s, staggered 80ms)
Position: fixed bottom-12, z-40
```

## Iteration History

### Iteration 222 — Tiered Payable Bonuses & Generator Console (Apr 2, 2026) — LATEST
- **Generator System**: 8 generators across 3 types (sub-harmonic, mantra extension, ultra-lossless)
- **Hybrid Bloom Logic**: Deterministic hexagram core + seeded RNG reverb/decay modulation
- **Purchase Flow**: Tier validation → credit check → deduction → unlock with bloom coefficients
- **Mixer Console**: Slide-over panel on SuanpanMixer with generator cards, purchase, toggle
- **Bloom Visual Effects**: Active generators produce animated glow overlay
- **Z-Index Fix**: Orbital page buttons moved to bottom-24 right-20 to clear platform badge
- Tests: 100% (Iteration 222 — 14 features verified)

### Iteration 221 — Sovereign Sensory + Mantras + Portal (Apr 2, 2026)
### Iteration 220 — Trade + Codex Orbital + Gravitational Pull
### Iteration 219 — Orbital Architecture + Hexagram Journal
### Iteration 218 — I Ching Logic Gates + Resonance Pulse + Sparkline
### Iteration 217 — Sovereign Math + Codex + Raycaster Fix
### Iterations 211-216 — Foundation (Botany, Elements, Marketplace, Audio, Cinematic)

## Upcoming Tasks (P1)
- **Phase 3 Polish**: Light trails + bloom effects on orbital paths
- **Generative Flourish Bonus**: AI improvised phonic resonance based on movement history
- **Spatial Audio 3D Spatializer**: Wire Web Audio panners to orbital node proximity

## Future/Backlog (P2)
- Multi-Civilization Star Charts (Hopi, Egyptian, Vedic)
- Sovereign Tier Perks, Wisdom Prescriptions personalization
- External audio asset hosting (real instrument samples)
- Haptic API integration for mobile tactile feedback

## Key Rules
- LlmChat: Always session_id + system_message | MongoDB: Exclude _id
- Audio: Check sovereignMute | Coordinates: isFinite() before Three.js
- Events: stopPropagation() on panels | Cosmic State: 60s cache
- Hexagram: Compute from ODE | Orbital: Sphere=auto, effects=none
- Reverb: getConvolver() creates on first use, resets on tier change
- Generators: Purchase through /api/trade-circle/purchase only

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
