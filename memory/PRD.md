# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Cosmic Marketplace & Monetization System (Apr 1, 2026) — NEW
- **Cosmic Credits**: Virtual currency purchasable via Stripe ($0.99–$24.99) or earnable in-game via mineral sell-back
- **Premium Store** (`/cosmic-store`): 4-tab interface — Consumables, Cosmetics, Credits, Nexus Pass
- **Consumables** (5 items):
  - Clear Vision Tincture (50cc, 30min) — disables all visual distortions
  - 963 Hz Frequency Tuner (80cc, 5min) — rare-only scanner lock
  - Payload Booster (40cc, 60min) — doubles inventory space
  - Dual-Motor Excavator (60cc, 60min) — 3x mining speed
  - Warp Key (120cc, 30min) — instant layer travel, bypasses resonance gates
- **Cosmetics** (5 items):
  - Auras: Violet (200cc), Golden (350cc), Crimson (300cc)
  - Premium Themes: Cyber-Neon (500cc), Hyper-Realistic (500cc)
- **Nexus Pass** ($9.99/month via Stripe): Permanent +60 resonance, all layers unlocked, 500cc monthly, 3x XP
- **Mineral Sell-Back**: Common=1cc, Uncommon=3cc, Rare=8cc, Epic=20cc, Legendary=50cc, Mythic=150cc
- **Active Effects System**: Integrated into GameModuleWrapper (Clear Vision suppresses distortion compositor)
- **Test**: Iteration 162 — 100% (26/26 backend, all frontend verified)

### Brain/Skin/Bridge Integration (Apr 1, 2026)
- **The Brain** (`GET /api/dream-realms/scenario-state`): Unified scenario controller
- **The Skin** (`GameModuleWrapper.js`): 7-layer distortion compositor with Clear Vision override
- **The Bridge** (`POST /api/game-core/commit-reward`): Universal reward endpoint
- **Test**: Iteration 160 — 100%

### 5-Layer Universe Structure (Apr 1, 2026)
- Terrestrial → Ethereal → Astral → Void → Nexus
- Layer gating now considers: Resonance stat + Nexus Passes + Warp Keys + Nexus Subscription
- **Test**: Iteration 159 — 100%

### Forgotten Languages System (Apr 1, 2026)
- 5 Script Families, Breath-to-Decode, 5-Tier Progressive Reveal, Streak system, Glyph Journal
- **Test**: Iterations 159-160 — 100%

### Universal Game Core + Rock Hounding (Apr 1, 2026)
- `useGameController` hook, `GameModuleWrapper`, Soul-to-Game Bridge
- Rock Hounding: Procedural mines, 30+ specimens, 6-tier rarity, 5 depths
- **Test**: Iteration 158 — 100%

### Earlier Systems (All 100% Tested)
- Adaptive Dashboard, Dream Realms, Elemental Nexus, Multiversal Map
- Dual Currency, Daily Quests, RPG, Auth, AI Coach, Star Chart, Oracle

## Credentials
- RPG Test: rpg_test@test.com / password123

## Key Architecture

### The Three Pillars + Marketplace Hook
1. **The Brain** (`/api/dream-realms/scenario-state`) — Computes environment
2. **The Skin** (`GameModuleWrapper`) — Renders distortions (with Clear Vision override)
3. **The Bridge** (`/api/game-core/commit-reward`) — Commits rewards
4. **Marketplace Hook** (`/api/marketplace/*`) — Economy layer for premium items

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
- **Marketplace**: `cosmic_credits`, `marketplace_inventory`, `marketplace_active_effects`, `marketplace_equipped`, `marketplace_transactions`, `nexus_subscriptions`

## Upcoming Tasks
### P1 — Elemental Crafting
- Second plug-in module using Universal Game Template
- Combine Rock Hounding specimens, layer-gated recipes, auto-inherits Brain/Skin/Bridge

### P1 — Party System
- Circle/Coven for shared objectives

### P2 — Backlog
- Myths & Legends Encyclopedia, Global Immersion Toggles
- On-device inference (Nano-Banana SLM), Avatar Creator
- Dashboard.js refactoring (extract components)
- RockHounding.js refactoring (extract NexusPassShop, ActivePassBanner into /components/game/)
