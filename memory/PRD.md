# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform. V2 "Sovereign Core" — Unified Simulation Architecture. Recursive 3D orbital interface replacing flat-page navigation, governed by mathematical constants (ODE, Chaos Theory, I Ching state-machine).

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Three.js
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API, Stripe (pending)

## Architecture
```
/app/frontend/src/
├── context/
│   ├── SensoryContext.js (GLOBAL AUDIO: sovereignMute, fade, killAll, source registry)
│   ├── CosmicStateContext.js (UNIFIED MATH: ODE energies, stability, hexagram, tier-gated)
│   ├── AuthContext.js, MixerContext.js, TempoContext.js, LanguageContext.js
├── components/
│   ├── OrbitalHubBase.js (UNIVERSAL 3D CANVAS: sun/planet, gravity engine, deep-dive,
│   │                       gravitational pull zones, precision hitboxes, depth breadcrumbs)
│   ├── ResonancePulse.js (audio breadcrumb glow + HexagramGlitch + HexagramBadge)
│   ├── CosmicSparkline.js (SVG ODE curve + hexagram badge overlay)
│   ├── NanoGuide.js, FiveElementsWheel.js, SmartDock.js, CosmicAssistant.js
│   ├── MissionControl.js (raycaster-transparent, hexagram logic gate, 9 action links)
│   ├── orbital/ (9 files), trade/
├── pages/
│   ├── OrbitalHub.js (+CosmicSparkline, +ResonancePulse)
│   ├── BotanyOrbital.js (plant center + element/garden/resonance/balance/identify/alchemy)
│   ├── TradeCircleOrbital.js (trade center + category/stats/escrow/forge/genesis/karma)
│   ├── CodexOrbital.js (knowledge center + 8 section planets + DEEP-DIVE RECURSION)
│   ├── HexagramJournal.js (Book of Changes: transition history)
│   ├── Botany.js, StarChart.js, TradeCircle.js, Codex.js, SuanpanMixer.js, Archives.js

/app/backend/routes/
├── hexagram.py (64-hexagram state-machine)
├── hexagram_journal.py (transition history)
├── cosmic_state.py (unified math + hexagram bundle)
├── sovereign_math.py (ODEs, Lorenz Chaos, Rodrigues Matrix)
├── sovereign_codex.py (Mastery-tiered help entries, Nano-Guides)
├── botany.py, mastery.py, trade_circle.py, energy_gates.py
```

## OrbitalHubBase System
```
Gravity Constants Engine:
  - baseRadius = min(containerSize*0.3, 120 + nodeCount*14)
  - Auto-scale if overlap, max containerSize*0.42
  - Speed: stable=0.3x, shifting=0.7x, volatile=1.2x

Gravitational Pull Zones:
  - pullRadius = orbitRadius * 0.6
  - damping = 0.05 + 0.95 * (dist/pullRadius)^2
  - Quadratic easing: frozen at surface, full speed at edge

Deep-Dive Recursion:
  - Click planet with subPlanets → flyingIn animation (500ms)
  - Planet moves to (0,0), becomes new sun
  - diveStack tracks recursion levels
  - Breadcrumbs show L0, L1, L2...
  - Back button pops stack

Precision Protocol:
  - Sphere mesh: pointer-events: auto
  - Effects (pulse, trails): pointer-events: none
```

## Orbital Pages
```
/botany-orbital:  Sun=Botanical Codex, Planets=5 elements + garden + resonance + balance + identify + alchemy(gated)
/trade-orbital:   Sun=Trade Circle, Planets=categories + stats + escrow + forge(gated) + genesis(gated) + karma
/codex-orbital:   Sun=Sovereign Codex, Planets=8 sections → Deep-dive → individual entries
```

## I Ching Hexagram State-Machine
```
6-bit: [equilibrium≥40, tier≥synth, elements≥3, archives≥2, recipes≥1, trades≥1]
Changing Lines: near-threshold conditions trigger HexagramGlitch CSS flicker
Journal: POST /api/hexagram/journal/record (deduped), GET /api/hexagram/journal
```

## Iteration History

### Iteration 220 — Phase 2: Trade + Codex Orbital Migration + Gravitational Pull (Apr 2, 2026) — LATEST
- **Trade Circle Orbital**: Category planets from listings + Stats/Escrow/Karma + Forge/Genesis (gated)
- **Codex Orbital**: 8 section planets + deep-dive recursion → entries become sub-orbit
- **Gravitational Pull Zones**: Quadratic proximity damping slows orbit near planets
- **Deep-Dive Fly-in**: Planet→(0,0) animation then becomes new sun with sub-orbit
- **Depth Breadcrumbs**: L0/L1 indicators + back navigation through recursion
- **Mission Control**: 9 action links including all orbital pages
- Tests: Backend 100%, Frontend 95% (platform badge overlap, not fixable)

### Iteration 219 — Orbital Architecture + Hexagram Journal
- OrbitalHubBase, BotanyOrbital, HexagramJournal, I Ching gate integration

### Iteration 218 — I Ching Logic Gates + Resonance Pulse + Sparkline
### Iteration 217 — Sovereign Math + Codex + Raycaster Fix
### Iterations 211-216 — Botany, Elements, Marketplace, Audio Engine, Cinematic UX

## Upcoming Tasks (P1)
- **Phase 3 Polish**: Light trails + bloom on orbital paths
- **Spatial Audio 3D**: Web Audio spatializer wired to orbital node proximity
- **ODE ↔ Orbit Speed CSS**: Direct variable binding from energy scores

## Future/Backlog (P2)
- Multi-Civilization Star Charts (Hopi, Egyptian, Vedic)
- Sovereign Tier Perks (custom element nodes, global trade circle)
- Wisdom Prescriptions (hexagram + journal + gravity + mastery)

## Key Rules
- LlmChat: Always session_id + system_message
- MongoDB: Exclude _id
- Audio: Check sovereignMute
- Coordinates: isFinite() before Three.js
- Events: stopPropagation() on panels
- Cosmic State: useCosmicState() hook, 60s cache
- Hexagram: Compute from ODE, never hardcode
- Orbital: Sphere=auto, effects=none

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
