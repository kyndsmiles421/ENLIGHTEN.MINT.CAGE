# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform. V2 "Sovereign Core" — Unified Simulation Architecture. Spatial Operating System governed by mathematical constants, transitioning from flat-page navigation to recursive 3D orbital interfaces.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Three.js (imperative WebGL)
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API, Stripe (pending)

## Architecture
```
/app/frontend/src/
├── context/
│   ├── SensoryContext.js (GLOBAL AUDIO ENGINE: sovereignMute, fade, killAll, source registry)
│   ├── CosmicStateContext.js (UNIFIED MATH STATE: ODE energies, stability, hexagram, tier-gated)
│   ├── AuthContext.js, MixerContext.js, TempoContext.js, LanguageContext.js
├── components/
│   ├── OrbitalHubBase.js (UNIVERSAL 3D ORBITAL CANVAS: sun/planet layout, gravity engine, deep-dive zoom)
│   ├── SmartDock.js (Zen Toggle dock)
│   ├── FiveElementsWheel.js (proximity scaling + ODE energy arcs + stability)
│   ├── CosmicAssistant.js (Dynamic Docking)
│   ├── MissionControl.js (raycaster-transparent, hexagram logic gate, links to orbital/journal)
│   ├── NanoGuide.js (3-point quick-start tooltips)
│   ├── ResonancePulse.js (audio breadcrumb glow rings + HexagramGlitch + HexagramBadge)
│   ├── CosmicSparkline.js (SVG ODE energy curve + hexagram badge)
│   ├── orbital/ (9 files), trade/
├── pages/
│   ├── OrbitalHub.js (+CosmicSparkline, +ResonancePulse on satellites)
│   ├── BotanyOrbital.js (Botany as recursive 3D orbital: plant center + element/garden/resonance planets)
│   ├── HexagramJournal.js (Book of Changes: transition history with expandable entries)
│   ├── Botany.js, StarChart.js, TradeCircle.js, Codex.js, SuanpanMixer.js, Archives.js

/app/backend/routes/
├── hexagram.py (64-hexagram state-machine, changing lines, transitions)
├── hexagram_journal.py (record + retrieve hexagram transition history)
├── cosmic_state.py (unified math + hexagram bundle)
├── sovereign_math.py (ODEs, Lorenz Chaos, Rodrigues Matrix)
├── sovereign_codex.py (Mastery-tiered help entries, Nano-Guides)
├── botany.py, mastery.py, trade_circle.py, energy_gates.py, gravity.py
├── archives.py, atmosphere.py, observatory.py, content_factory.py
├── revenue.py, forge.py, nature.py, teachings.py, voice_command.py
```

## OrbitalHubBase System
```
Gravity Constants Engine:
  - baseRadius = min(containerSize * 0.3, 120 + nodeCount * 14)
  - Auto-scale if nodes would overlap (min 76px spacing)
  - Speed mapping: stable=0.3x, shifting=0.7x, volatile=1.2x
  - Drag rotation: angular velocity with 0.96 damping

Interaction Precision Protocol:
  - Sphere meshes: pointer-events: auto (exclusive hitboxes)
  - Visual effects (ResonancePulse, trails): pointer-events: none
  - Connection lines: SVG pointer-events: none

I Ching Gate Logic:
  - Each planet can have `requiredBit` (0-5)
  - If hexagram.bits[requiredBit] is 0, node is locked (opacity 0.2, non-interactive)
  - HexagramGlitch wraps entire canvas when transitioning
```

## I Ching Hexagram State-Machine
```
6-bit boolean array → Hexagram #1-64:
  Bit 0: Garden equilibrium ≥ 40
  Bit 1: Mastery tier ≥ Synthesizer
  Bit 2: ≥ 3/5 elements explored
  Bit 3: ≥ 2 archive categories unlocked
  Bit 4: Frequency recipe created (Suanpan)
  Bit 5: Trade completed
```

## Hexagram Journal (Book of Changes)
```
POST /api/hexagram/journal/record → compute + record if changed
GET /api/hexagram/journal?limit=50 → sorted desc, expandable entries
Entry: { hexagram_number, chinese, pinyin, name, bits, trigrams,
         solfeggio_hz, equilibrium_score, stability, tier,
         changing_lines, previous_hexagram, energies, timestamp }
```

## Iteration History

### Iteration 219 — Orbital Architecture + Hexagram Journal (Apr 2, 2026) — LATEST
- **OrbitalHubBase**: Universal 3D orbital canvas with gravity constants, drag rotation, precision hitboxes
- **BotanyOrbital**: Botany as 3D orbital — plant center + 9 orbiting planets (elements, garden, resonance, balance, identify, alchemy)
- **Hexagram Journal**: "Book of Changes" — records transitions with timestamps, expandable entries showing trigrams/energies/equilibrium
- **Deep-dive panels**: Click planet → detail panel with relevant data (plant lists, resonance scores, etc.)
- **I Ching gate integration**: Alchemy node locked behind hexagram bit 2 (elements explored ≥ 3)
- **Mission Control**: Added Book of Changes + Botany Orbital action links
- Tests: Backend 100%, Frontend 95% (one z-index fix applied)

### Iteration 218 — I Ching Logic Gates + Resonance Pulse + Sparkline
- 64-hexagram state-machine, Resonance Pulse, CosmicSparkline on Hub
- HexagramGlitch CSS flicker, HexagramBadge components
- Mission Control logic gate section, Codex hexagram header

### Iteration 217 — Sovereign Math + Codex + Raycaster Fix
- Unified Cosmic State endpoint, Sovereign Codex (14 entries), NanoGuide tooltips
- ODE energy arcs, stability indicator, Matrix keyframes, raycaster fix

### Previous (211-216)
- Botany, Five Elements Wheel, Marketplace, Resonance, Balance Score
- Suanpan bridge, System Triage, Cinematic UX, Audio Engine

## Upcoming Tasks (P1)
- **Phase 2: Trade Circle Orbital** — wrap Trade Circle in OrbitalHubBase
- **Phase 2: Codex Orbital** — wrap Codex in OrbitalHubBase
- **Deep-dive recursion** — planet→sun spawns sub-orbit with depth indicator
- **Spatial Audio 3D Spatializer** — Web Audio 3D on orbital nodes

## Future/Backlog (P2)
- Multi-Civilization Star Charts (Hopi, Egyptian, Vedic)
- Sovereign Tier Perks (custom element nodes, global trade circle)
- Wisdom Prescriptions (from hexagram + journal + gravity + mastery)
- Light Trails + Bloom (orbital paths)
- ODE stability → orbit speed mapping (CSS variable driven)

## Key Technical Rules
- **LlmChat**: Always `session_id` + `system_message`
- **WebGL**: Imperative mutation only
- **MongoDB**: Exclude `_id`
- **Audio**: All sound functions must check `sovereignMute`
- **Coordinates**: `isFinite()` before Three.js
- **Events**: `stopPropagation()` on floating panels
- **Cosmic State**: Use `useCosmicState()` hook, 60s cache
- **Hexagram**: Compute from ODE energies, never hardcode
- **Orbital precision**: Sphere = pointer-events: auto, effects = pointer-events: none

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
