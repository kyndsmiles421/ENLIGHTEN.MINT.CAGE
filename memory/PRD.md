# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### 5-Layer Universe Structure + Layer-Gated Mining (Apr 1, 2026) — NEW
- **5 Environment States**: Terrestrial → Ethereal → Astral → Void → Nexus
- **Entropy Scaling**: Entropy increases from Terrestrial (0%) to Void (75%), Nexus transcends (0%)
- **Resonance-Gated Layers**: Resonance stat (0/5/15/30/50) determines accessible layers
- **Layer-Aware Loot Tables**: Rock Hounding rewards scale with layer multipliers (1.0x → 3.0x)
- **Distortion Compositor Integration**: Void/Astral layers amplify entropy blur/grain effects
- **Layer HUD**: Universe Layer bar shows all 5 layers with active/locked states and loot multiplier
- **Test**: Iteration 159 — 100% (15/15 backend, all frontend verified)

### Forgotten Languages System Enhanced (Apr 1, 2026) — NEW
- **Streak System**: Consecutive daily decoding with +10%/day XP bonus (max 2.0x)
- **Glyph Journal**: Permanent history of all decoded glyphs with meanings and phonetics
- **Streak Badge**: Visual indicator on daily cipher tab showing streak days and multiplier
- **5 Script Families**: Verdant Runes (wood), Ignis Sigils (fire), Petroglyph Marks (earth), Crystalline Script (metal), Tidal Glyphs (water)
- **Breath-to-Decode**: 3-cycle breath pattern unique per element to unlock glyphs
- **5-Tier Progressive Reveal**: Novice Scribe (0H) → Archon of Tongues (85H)
- **Permanent Nexus Modifiers**: Decoded glyphs permanently boost natal resonance
- **Test**: Iterations 159 — 100%

### Universal Game Core + Rock Hounding Module (Apr 1, 2026)
- **Universal Game Controller**: `useGameController` hook + `GameModuleWrapper` (5-Rule Distortion Compositor)
- **Soul-to-Game Bridge**: `POST /api/game-core/commit-reward`
- **Rock Hounding**: Procedural mines, 30+ specimens, 6-tier rarity, 5 depth layers
- **Template Documentation**: `/app/docs/GAME_MODULE_TEMPLATE.md`
- **Test**: Iteration 158 — 100% (29/29)

### Earlier Systems (All 100% Tested)
- Adaptive Dashboard, Dream Realms, Elemental Nexus
- Multiversal Map (4 universes, 27 regions), Cosmic Weather
- Dual Currency, Daily Quests, RPG, Auth, AI Coach, Star Chart, Oracle

## Credentials
- RPG Test: rpg_test@test.com / password123

## Key Architecture

### 5-Layer Universe System
| Layer | Resonance Req | Loot Mult | XP Mult | Entropy |
|:---:|:---:|:---:|:---:|:---:|
| Terrestrial | 0 | 1.0x | 1.0x | 0% |
| Ethereal | 5 | 1.3x | 1.2x | 15% |
| Astral | 15 | 1.7x | 1.5x | 40% |
| Void | 30 | 2.5x | 2.0x | 75% |
| Nexus | 50 | 3.0x | 3.0x | 0% (transcendent) |

### Game Module Pattern
See `/app/docs/GAME_MODULE_TEMPLATE.md`

### API Conventions
- Prefix: `${REACT_APP_BACKEND_URL}/api`
- Auth: `useAuth()` → `authHeaders`
- AI: `.with_model("gemini", "gemini-3-flash-preview")`
- Element CSS: `--el-wood: #22C55E`, `--el-fire: #EF4444`, `--el-earth: #F59E0B`, `--el-metal: #94A3B8`, `--el-water: #3B82F6`

## Key DB Collections
- Game Core: `game_core_stats`, `game_core_transactions`
- Rock Hounding: `rock_hounding_mines`, `rock_hounding_collection`
- Forgotten Languages: `forgotten_languages_progress`, `forgotten_languages_mastery`, `forgotten_languages_streaks`, `forgotten_languages_journal`
- Nexus: `nexus_alignments`, `nexus_birth_resonance`, `nexus_decoded_modifiers`
- RPG/Other: `rpg_characters`, `rpg_inventory`, `rpg_currencies`, `rpg_quest_log`

## Upcoming Tasks
### P2 — Elemental Crafting
- Second plug-in module using Universal Game Template
- Combine Rock Hounding specimens, layer-gated recipes

### P2 — Party System
- Circle/Coven for shared objectives

### P2 — Backlog
- Myths & Legends Encyclopedia, Global Immersion Toggles
- On-device inference (Nano-Banana SLM), Avatar Creator
- Dashboard.js refactoring (extract components)
