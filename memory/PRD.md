# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Universal Game Core + Rock Hounding Module (Apr 1, 2026) — NEW
- **Universal Game Controller**: Plug-and-play architecture separating Core (XP/Stats/Currency) from Modules (game-specific logic). Any future game reuses the same backend brain.
- **Soul-to-Game Bridge**: `POST /api/game-core/commit-reward` — single endpoint for any game to award XP, Cosmic Dust, modify stats (Wisdom/Vitality/Resonance), and feed element modifiers back to the Nexus.
- **useGameController Hook**: Frontend hook providing Nexus state, distortions, core stats, and commitReward() to any game module.
- **GameModuleWrapper**: Visual shell auto-applying harmony-driven effects (blur, grain, glitch, ambient glow) based on Nexus harmony score.
- **Rock Hounding Module**: First plug-in game — procedural mines tied to Nexus element balance, 30+ real geological specimens, 6-tier rarity system, 5 depth layers, energy management with time-based regen, collection/catalog system.
- **Navigation Wiring**: Links from Dashboard (Nexus Intent Widget), ElementalNexus (Game Modules section), and RPG page (quick access bar).
- **Template Documentation**: `/app/docs/GAME_MODULE_TEMPLATE.md` — developer recipe for adding future game modules.
- **Test**: Iteration 158 — 100% (29/29 backend, all frontend verified)

### Adaptive Dashboard & Resonance Gates (Apr 1, 2026)
- **Branching Resonance Gates**: Dream Realms with 3 portals (Purge/Root/Void)
- **Nexus Intent Widget**: Glassmorphic panel showing elemental drift with pre-filled action button
- **Transition Shader, Typewriter Narrative, Haptic Feedback**
- **Global Element Style Guide**: CSS custom properties for all 5 elements
- **Test**: Iteration 157 — 100% (15/15)

### Procedural Loop Engine — Dream Realms (Apr 1, 2026)
- Infinite scenario generator, 5-Rule Visual Distortion System
- Tighten/Expand mechanics, Escape Velocity, Legendary Frequencies
- **Test**: Iteration 156 — 100% (23/23)

### Elemental Nexus — 5th Realm (Mar 31, 2026)
- Dynamic Decay, Birth Resonance, Frequency-Task Pairing
- **Test**: Iteration 155 — 100% (28/28)

### Earlier Systems (All 100% Tested)
- Multiversal Layered Map (4 universes, 27 regions)
- Cosmic Insights & Weather (AI forecasts)
- Dual Currency Economy (Gems via Stripe + Cosmic Dust)
- Daily Quest System (6 quests, streak multipliers)
- Wellness MMORPG, Core Platform, Auth, AI Coach, Star Chart, Oracle, etc.

## Credentials
- RPG Test: rpg_test@test.com / password123

## Architecture Rules
- **API Prefix**: `${REACT_APP_BACKEND_URL}/api`
- **AuthHeaders**: `useAuth()` returns `authHeaders` as object
- **AI**: `.with_model("gemini", "gemini-3-flash-preview")`
- **Element CSS Vars**: `--el-wood: #22C55E`, `--el-fire: #EF4444`, `--el-earth: #F59E0B`, `--el-metal: #94A3B8`, `--el-water: #3B82F6`
- **Game Module Pattern**: See `/app/docs/GAME_MODULE_TEMPLATE.md`
- **Soul-to-Game Bridge**: `POST /api/game-core/commit-reward` with `{ module_id, xp, dust, stat, stat_delta, element }`

## Key DB Collections
- Game Core: `game_core_stats`, `game_core_transactions`
- Rock Hounding: `rock_hounding_mines`, `rock_hounding_collection`
- RPG: `rpg_characters`, `rpg_inventory`, `rpg_currencies`, `rpg_quest_log`, `rpg_streaks`
- Nexus: `nexus_alignments`, `nexus_birth_resonance`, `nexus_decoded_modifiers`, `nexus_harmony_history`
- Dream Realms: `dream_realms`, `legendary_frequencies`
- Reports: `cosmic_weather_cache`
- Multiverse: `multiverse_state`

## Upcoming Tasks

### P1 — Forgotten Languages System
- Daily Deciphering widget with geometric scripts reactive to elemental balance
- Five-tier progressive reveal (higher tiers need higher Harmony)
- Phonetic-to-Breath loop, Visual Ciphers
- Decoded Modifiers feeding permanent natal resonance offsets

### P2 — Elemental Crafting
- Second plug-in game module using the Universal Game Core template
- Combine specimens from Rock Hounding into crafted items
- Uses the same `useGameController` hook and `GameModuleWrapper`

### P2 — Party System
- Circle/Coven for shared objectives bridging solo play and world bosses

### P2 — Backlog
- Myths & Legends Encyclopedia, Global Immersion Toggles
- On-device inference (Nano-Banana SLM), Avatar Creator
- Gem Resonance Engine, AI Scene Recreations

### Refactoring
- Dashboard.js (1000+ lines) — extract NexusIntentSection to `/components`
