# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Adaptive Dashboard & Resonance Gates (Apr 1, 2026) — NEW
- **Branching Resonance Gates**: Dream Realms now start with 3 portals instead of a single loop:
  - **The Purge** (Fire/Metal): High-intensity, puzzle-heavy rebalancing
  - **The Root** (Earth/Wood): Slow-paced, audio-focused grounding
  - **The Void** (Water): Meditative dissolution for deep alignment
- **Nexus Intent Widget**: Glassmorphic panel on Dashboard showing current elemental drift, confidence pulse glow, and pre-filled action button ("Flow Quests | 432 Hz"). Reduces decision fatigue.
- **Transition Shader**: Screen "refracts/melts" with radial ripple when entering a Dream Realm gate
- **Typewriter Narrative**: AI-generated text reveals character-by-character with cursor blink
- **Haptic Feedback**: `navigator.vibrate()` wired to: glitch (decay), thrum (mantra), click (challenge), shatter (loop break)
- **Global Element Style Guide**: CSS custom properties `--el-wood/fire/earth/metal/water` with `-glow` and `-bg` variants
- **Backend**: `POST /api/dream-realms/choose-gate`, `GET /api/nexus/intent`
- **Test**: Iteration 157 — 100% (15/15 backend, all frontend verified)

### Procedural Loop Engine — Dream Realms (Apr 1, 2026)
- Infinite scenario generator seeded by elemental balance + birth resonance + cosmic weather
- 5-Rule Visual Distortion System (Entropy, Tinting, Decay, Fracturing, Mantra Feedback)
- Tighten/Expand mechanics, Escape Velocity, Legendary Frequency discovery
- Decoded modifier hooks feeding back into Nexus engine
- **Test**: Iteration 156 — 100% (23/23)

### Elemental Nexus — 5th Realm (Mar 31, 2026)
- Dynamic Decay (3-day half-life), Birth Resonance, Frequency-Task Pairing
- Bridge UI transitions, Cosmic Weather Dashboard Widget
- **Test**: Iteration 155 — 100% (28/28)

### Earlier Systems (All 100% Tested)
- Multiversal Layered Map (4 universes, 27 regions, interlocking logic engine)
- Cosmic Insights & Weather (AI forecasts, tool recommendations)
- Dual Currency Economy (Gems via Stripe + Cosmic Dust)
- Daily Quest System (6 quests, streak multipliers)
- Wellness MMORPG, Core Platform, Auth, AI Coach, Star Chart, Oracle, etc.

## Credentials
- RPG Test: rpg_test@test.com / password123

## Upcoming Tasks

### P1 — Forgotten Languages System
- Daily Deciphering widget with geometric scripts reactive to elemental balance
- Five-tier progressive reveal (higher tiers need higher Harmony)
- Phonetic-to-Breath loop, Visual Ciphers
- Decoded Modifiers → permanent natal resonance offsets

### P1 — Other
- Party System (Circle/Coven), Cosmic Notifications
- Background Agent (pre-generate short loops on decay detection)

### P2 — Backlog
- Virtual Rock Hounding, Elemental Crafting, Myths & Legends Encyclopedia
- Global Immersion Toggles, On-device inference (Nano-Banana SLM)

### P3 — Future
- Gem Resonance Engine, Avatar Creator, AI Scene Recreations

## Architecture Rules
- **API Prefix**: `${REACT_APP_BACKEND_URL}/api`
- **AuthHeaders**: `useAuth()` returns `authHeaders` as object
- **AI**: `.with_model("gemini", "gemini-3-flash-preview")`
- **Element CSS Vars**: `--el-wood: #22C55E`, `--el-fire: #EF4444`, `--el-earth: #F59E0B`, `--el-metal: #94A3B8`, `--el-water: #3B82F6`
- **Haptic patterns**: glitch=[15,30,15], thrum=[40,20,40,20,40], click=[10], shatter=[50,20,80,20,120]
- **Dream Realms**: Status flow: choosing → active → completed/abandoned/tightened
- **Nexus Intent**: Predictive action routing based on worst elemental drift

## Key DB Collections
- Dream Realms: `dream_realms`, `legendary_frequencies`
- Nexus: `nexus_alignments`, `nexus_birth_resonance`, `nexus_decoded_modifiers`, `nexus_harmony_history`
- RPG: `rpg_characters`, `rpg_inventory`, `rpg_currencies`, `rpg_quest_log`, `rpg_streaks`
- Reports: `cosmic_weather_cache`
- Multiverse: `multiverse_state`
