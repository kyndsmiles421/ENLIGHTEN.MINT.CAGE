# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform. V2 "Sovereign Core" — Unified Simulation Architecture. Spatial Operating System governed by mathematical constants. Every system feeds into every other.

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API, Three.js (imperative WebGL)
- **Backend**: FastAPI, MongoDB (Motor), httpx
- **Integrations**: Gemini 3 Flash (Emergent LLM Key), NWS Weather API, Stripe (pending)
- **LLM Pattern**: `LlmChat(api_key, session_id, system_message).with_model("gemini", "gemini-3-flash-preview")`

## Architecture
```
/app/backend/routes/
├── gravity.py, archives.py, atmosphere.py
├── mastery.py (+balance-score algorithm, wheel-interaction tracking)
├── trade_circle.py (+botanical-listing, gravity-weighted, suanpan-export bridge)
├── botany.py (+resonance/{element} predictive synergy engine)
├── content_factory.py, revenue.py, forge.py, nature.py, teachings.py, voice_command.py (AI routes)
├── oracle.py, creation_stories.py, observatory.py, workshop.py

/app/frontend/src/
├── components/
│   ├── FiveElementsWheel.js (interactive SVG pentagon + resonance meter + garden balance)
│   ├── orbital/ (9 files), StrokeTracer.js, trade/
├── pages/
│   ├── OrbitalHub.js, Archives.js, SuanpanMixer.js (+export bridge), Botany.js, TradeCircle.js
```

## Energetic Profile Schema
```
Mass = Base(60) + Element + Nature + Meridian + Rarity
Element → Solfeggio: Wood=396Hz, Fire=528Hz, Earth=639Hz, Metal=741Hz, Water=852Hz
Nature → Weight: Hot=15, Warm=10, Neutral=5, Cool=10, Cold=15
Rarity → Bonus: common=0, uncommon=5, rare=10, legendary=20
```

## Five Elements Cycles
```
Generating (Sheng): Wood→Fire→Earth→Metal→Water→Wood
Controlling (Ke): Wood→Earth, Fire→Metal, Earth→Water, Metal→Wood, Water→Fire
```

## Mastery Tier Algorithm (Balance Score)
```
balance_score = diversity(30%) + equilibrium(30%) + consistency(20%) + exploration(20%)
- Diversity: How many of 5 elements interacted with (garden + wheel + archives)
- Equilibrium: How balanced the garden is (penalty for single-element dominance)
- Consistency: Streak of daily nurture actions
- Exploration: Unique species + archives unlocked
Tiers: Observer(0-20) → Synthesizer(20.1-40) → Archivist(40.1-60) → Navigator(60.1-80) → Sovereign(80.1-100)
Sovereign perks: Custom element nodes, Global Trade Circle, All locks removed, Hexagram keys
```

## Iteration History

### Iteration 213 — Resonance + Balance Score + Suanpan Bridge (Apr 2, 2026) — LATEST
**Feature 1**: Resonance Compatibility (Predictive Energy Forecast)
- `GET /api/botany/resonance/{element}` — synergy calculations for each garden plant
- Synergy types: harmony, generating, generated_by, controlled, controlling, neutral
- Stage multiplier (Seed=0.5x → Transcendent=1.5x) affects all scores
- Forecast: surge/favorable/balanced/strained/depleted based on net_flow
- Projection: "Adding X plant would amplify/strain by N points"

**Feature 2**: Mastery Tier Balance Score
- `GET /api/mastery/balance-score` — 4-component formula with diversity/equilibrium/consistency/exploration
- Single-element dominance penalty in equilibrium (deviation from ideal 5-element distribution)
- `POST /api/mastery/wheel-interaction` — records element clicks for diversity tracking
- Frontend: Mastery Tier panel in Botany sidebar with score bar + breakdown

**Feature 3**: Suanpan → Trade Circle Bridge
- `POST /api/trade-circle/suanpan-export` — one-click export of frequency recipes
- Auto-derives element/nature/mass from frequency via SOLFEGGIO_MAP
- Source tagged as "suanpan_mixer" for provenance tracking
- Frontend: Trade button on Mixer with recipe name input, Export Now action
- Tests: 23/23 passed (100% backend, 100% frontend)

### Previous Iterations
- 212: Five Elements Wheel + Phygital Marketplace categories
- 211: Botany & Gardening Module (12 plants, garden, AI identify)
- 210: Dimensional Rift Fix (LlmChat signature)
- 209: Ring Rotation + Inspect + Homepage Wiring
- 208: Archives + Suanpan + Tidal Force
- 207: Einstein Spatial Curvature + WebGL
- 206: Abyss Refactor + Atmospheric Synchrony

## Upcoming Tasks (P1)
- **Wisdom Prescriptions**: Personalized ritual plans from journal + gravity + mastery
- **Enhanced Trade Circle UI**: Apply visual_scale/visual_depth to physically size/position cards
- **AI Living Synthesis**: Gemini analysis when hovering connections between traditions

## Future/Backlog (P2)
- **I Ching Logic Gates**: 64 hexagrams as Boolean state-machine transitions. 6 binary inputs = compound key → progressive disclosure locks. "Changing Lines" (Yao) for transition states when garden balance shifts.
- **Sovereign Tier Perks**: Custom element nodes on wheel, Global Trade Circle (no coordinate restrictions)
- Multi-Civilization Star Charts (GPS-based with Hopi/Egyptian/Vedic overlays)
- Progressive Disclosure Locks (tier-gated access)
- Orbital Constellations (3+ related satellites → hidden content)

## Key Technical Rules
- **LlmChat**: Always include `session_id` + `system_message`
- **WebGL**: Imperative mutation only (no declarative `<bufferAttribute>`)
- **MongoDB**: Always exclude `_id` from responses
- **Auth timing**: Always check `loading` + `token` before API calls

## Test Credentials
- User: `grad_test_522@test.com` / `password`
- Auth key: `zen_token`
