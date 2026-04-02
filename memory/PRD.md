# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform. V2 "Sovereign Core" — Unified Simulation Architecture. Recursive 3D orbital interface with 4-tier audio system, I Ching state-machine, convolution reverb, and mantras/affirmations library.

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
│   ├── SuanpanMixer.js, Archives.js

/app/backend/routes/
├── mantras_sovereign.py (43 entries: 10 ancient mantras, 10 phonic resonances,
│                          15 affirmations, 8 wisdom prescriptions — all tier-gated)
├── hexagram.py, hexagram_journal.py, cosmic_state.py, sovereign_math.py
├── sovereign_codex.py, botany.py, mastery.py, trade_circle.py
```

## 4-Tier Audio Resolution System
```
Standard (Observer):    44.1kHz/16-bit, basic synthesis, 0.8s reverb, 0.1 mix
Apprentice (Synthesizer): 48kHz/16-bit, harmonic overtones, 1.5s reverb, 0.2 mix
Artisan (Archivist):    88.2kHz/24-bit, multi-sampled + convolution reverb, 2.5s decay, 0.3 mix
Sovereign (Navigator+): 96kHz/24-bit, lossless + sympathetic resonance + full reverb, 4.0s decay, 0.4 mix

Convolution Reverb: Synthetic temple impulse response with:
  - Early reflections (40Hz exponential decay, 50ms window)
  - Modal resonances (62Hz, 125Hz standing waves)
  - Exponential decay envelope (3.0/decay rate)

Singing Bowl Synthesis: Inharmonic partials at ratios 2.71, 4.16, 5.43
  - Beating effect via 1.5Hz detuning
  - Duration: 2s (standard) → 6s (sovereign)

Confirmation Chime: Pitch-mapped to node index (semitone spacing from 440Hz)
  - Standard: fundamental only
  - Apprentice+: harmonic overtone (2x frequency)
  - Sovereign: sub-harmonic (0.5x) with sympathetic reverb
```

## Mantras & Affirmations Library (43 entries)
```
Ancient Mantras (10): Om, Om Mani Padme Hum, Gayatri, So Ham, etc.
  - Each mapped to tradition, chakra, and solfeggio Hz

Phonic Resonances (10): 174Hz–1074Hz solfeggio scale
  - Tier-gated from Observer (174-528Hz) to Sovereign (1074Hz)

Affirmations (15): Element-mapped positive expressions
  - Observer (5), Synthesizer (3), Archivist (3), Navigator (3), Sovereign (1)

Wisdom Prescriptions (8): Hexagram-range-linked guidance
  - Each covers 8 hexagrams, tier-gated from Synthesizer to Sovereign
  - GET /api/mantras/wisdom-prescription computes contextual match
```

## Orbital Transition Portal
```
5 destinations: Botany, Trade, Codex, Hub, Stars
Wormhole effect: 5 expanding concentric rings (0.6s, staggered 80ms)
  - Singing bowl tone (528Hz) on transition
  - Destination label fades in at center
  - 600ms animation → navigate → 300ms settle
Position: fixed bottom-12, z-40
Current page: color accent + expanded label + indicator dot
```

## Iteration History

### Iteration 221 — Sovereign Sensory + Mantras + Portal (Apr 2, 2026) — LATEST
- **4-Tier Audio**: Standard→Sovereign with convolution reverb and sympathetic resonance
- **Confirmation Chimes**: Pitch-mapped semitone on every node interaction
- **Singing Bowl Synthesis**: Multi-sampled with inharmonic partials and beating
- **Mantras Library**: 43 entries across 4 categories, tier-gated, hexagram-linked
- **Wisdom Prescriptions**: Contextual guidance from hexagram + element + solfeggio
- **Orbital Transition Portal**: Wormhole animation between 5 orbital destinations
- Tests: 100% (Iteration 221 — 19/19 features verified)

### Iteration 220 — Trade + Codex Orbital + Gravitational Pull
### Iteration 219 — Orbital Architecture + Hexagram Journal
### Iteration 218 — I Ching Logic Gates + Resonance Pulse + Sparkline
### Iteration 217 — Sovereign Math + Codex + Raycaster Fix
### Iterations 211-216 — Foundation (Botany, Elements, Marketplace, Audio, Cinematic)

## Upcoming Tasks (P1)
- **Spatial Audio 3D Spatializer**: Wire Web Audio panners to orbital node proximity
- **Phase 3 Polish**: Light trails + bloom on orbital paths
- **Mantra Playback UI**: Play/trigger mantras from orbital nodes with singing bowl

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

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
