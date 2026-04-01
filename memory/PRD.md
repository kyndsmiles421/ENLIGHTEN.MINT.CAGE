# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Brain/Skin/Bridge Integration (Apr 1, 2026) — NEW
- **The Brain** (`GET /api/dream-realms/scenario-state`): Unified scenario controller that outputs layer state, difficulty, visual directives, harmony, elements, and biome context. Every game module calls this for environment state.
- **The Skin** (`GameModuleWrapper.js`): Enhanced distortion compositor that renders 7 layered effects based on Brain output — EntropyLayer, ElementalTintLayer, DecayDistortionLayer, FractureLayer, LayerTintOverlay, MantraRipple, GrainOverlay. Now accepts `visualDirectives` and `biomeContext` from the Brain.
- **The Bridge** (`POST /api/game-core/commit-reward`): Universal reward endpoint. Specimens now carry layer metadata (`layer_found`, `layer_name`, `layer_multiplier`) for full traceability.
- **Test**: Iteration 160 — 100% (16/16 backend, all frontend verified)

### 5-Layer Universe Structure (Apr 1, 2026)
- **5 Environment States**: Terrestrial → Ethereal → Astral → Void → Nexus
- Entropy scaling, Resonance-gated layers, Layer-aware loot tables
- Universe Layer HUD bar in game modules
- **Test**: Iteration 159 — 100%

### Forgotten Languages System (Apr 1, 2026)
- 5 Script Families, Breath-to-Decode, 5-Tier Progressive Reveal
- Streak system (+10%/day XP bonus), Glyph Journal
- Permanent Nexus Modifiers from decoded glyphs
- **Test**: Iterations 159-160 — 100%

### Universal Game Core + Rock Hounding (Apr 1, 2026)
- Universal Game Controller hook, GameModuleWrapper, Soul-to-Game Bridge
- Rock Hounding: Procedural mines, 30+ specimens, 6-tier rarity, 5 depths
- **Test**: Iteration 158 — 100%

### Earlier Systems (All 100% Tested)
- Adaptive Dashboard, Dream Realms, Elemental Nexus, Multiversal Map
- Dual Currency, Daily Quests, RPG, Auth, AI Coach, Star Chart, Oracle

## Credentials
- RPG Test: rpg_test@test.com / password123

## Key Architecture

### The Three Pillars (SOP for every game)
1. **The Brain** (`/api/dream-realms/scenario-state`) — Computes environment
2. **The Skin** (`GameModuleWrapper`) — Renders distortions
3. **The Bridge** (`/api/game-core/commit-reward`) — Commits rewards

### 5-Layer Universe System
| Layer | Resonance | Loot | XP | Entropy |
|:---:|:---:|:---:|:---:|:---:|
| Terrestrial | 0 | 1.0x | 1.0x | 0% |
| Ethereal | 5 | 1.3x | 1.2x | 15% |
| Astral | 15 | 1.7x | 1.5x | 40% |
| Void | 30 | 2.5x | 2.0x | 75% |
| Nexus | 50 | 3.0x | 3.0x | 0% |

### Game Module Pattern
See `/app/docs/GAME_MODULE_TEMPLATE.md`

## Key DB Collections
- Game Core: `game_core_stats`, `game_core_transactions`
- Rock Hounding: `rock_hounding_mines`, `rock_hounding_collection`
- Forgotten Languages: `forgotten_languages_progress`, `forgotten_languages_mastery`, `forgotten_languages_streaks`, `forgotten_languages_journal`
- Nexus: `nexus_alignments`, `nexus_birth_resonance`, `nexus_decoded_modifiers`
- Dream Realms: `dream_realms`, `legendary_frequencies`

## Upcoming Tasks
### P2 — Elemental Crafting
- Second plug-in module using Universal Game Template
- Combine Rock Hounding specimens, layer-gated recipes, auto-inherits Brain/Skin/Bridge

### P2 — Party System
- Circle/Coven for shared objectives

### P2 — Backlog
- Myths & Legends Encyclopedia, Global Immersion Toggles
- On-device inference (Nano-Banana SLM), Avatar Creator
- Dashboard.js refactoring (extract components)
