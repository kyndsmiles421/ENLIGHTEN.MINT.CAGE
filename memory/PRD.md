# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Integrated Evolution & Discovery Protocol (Apr 1, 2026) — NEW
**Perpetual Evolution Protocol (PEP):**
- Vitality Coefficient (VC) system: `VC = (Interaction × Growth_Rate) - (Time × Decay_Rate)`
- 3-Stage Visual Evolution: Raw (1×) → Refined (2×, VC≥50) → Transcendental (3×, VC≥150)
- -1% degradation per 24h inactivity (paused for Igneous/Metamorphic subscribers)
- Polish/Attune/Meditate interactions with 10-min cooldown per asset
- Stage transitions with multiplier bonuses on XP and Dust

**Universal Unlock Engine:**
- Full geological metadata on 30+ specimens: crystal system, cleavage, Mohs hardness
- Spiritual metadata: chakra alignment, frequency (Hz), personalized mantras
- Per-specimen evolution tracking with VC progress bars

**Seasonal Cycles (90-day Geological Rotations):**
- The Compression (Metamorphic): minimalist, deep work, 396 Hz
- The Eruption (Igneous): high-contrast, manifestation, 528 Hz
- The Erosion (Sedimentary): soft edges, reflection, 852 Hz

**Gemstone Subscription Tiers:**
- Sedimentary (Free) → Starter → Igneous ($9.99) → Metamorphic ($24.99) → Super User ($49.99)
- Igneous+ tiers: decay paused, rare stone access, advanced teachings

**Alchemical Exchange:**
- Cosmic Dust → Credits conversion at 100:1 ratio
- New consumables: Preservation Salts (30cc, 30-day decay freeze), Digital Luster Polish (75cc)

**Test**: Iteration 163 — 100% (24/24 backend, all frontend verified)

### Cosmic Marketplace & Monetization System (Apr 1, 2026)
- **Cosmic Credits** virtual currency (Stripe-purchasable, earnable via Dust conversion and sell-back)
- **Premium Store** (`/cosmic-store`): Consumables, Cosmetics, Credits, Nexus Pass tabs
- **7 Consumables**: Clear Vision, 963Hz Tuner, Payload Booster, Dual-Motor Excavator, Warp Key, Preservation Salt, Digital Luster Polish
- **5 Cosmetics**: 3 Auras + 2 Premium Themes (Cyber-Neon, Hyper-Realistic)
- **Nexus Pass** ($9.99/month): Permanent +60 resonance, all layers, 500cc monthly, 3× XP
- **Active Effects System**: Integrated into GameModuleWrapper (Clear Vision suppresses distortions)
- **Test**: Iteration 162 — 100%

### Brain/Skin/Bridge Integration (Apr 1, 2026)
- The Brain (`/api/dream-realms/scenario-state`): Unified scenario controller
- The Skin (`GameModuleWrapper.js`): 7-layer distortion compositor with Clear Vision override, premium themes, aura glows
- The Bridge (`/api/game-core/commit-reward`): Universal reward endpoint
- **Test**: Iteration 160 — 100%

### 5-Layer Universe Structure (Apr 1, 2026)
- Terrestrial → Ethereal → Astral → Void → Nexus
- Layer gating: Resonance + Nexus Passes + Warp Keys + Nexus Subscription
- **Test**: Iteration 159 — 100%

### Earlier Systems (All 100% Tested)
- Forgotten Languages, Universal Game Core, Rock Hounding (30+ specimens, 6-tier rarity)
- Adaptive Dashboard, Dream Realms, Elemental Nexus, Multiversal Map
- Dual Currency, Daily Quests, RPG, Auth, AI Coach, Star Chart, Oracle

## Credentials
- RPG Test: rpg_test@test.com / password123

## Key Architecture

### The Four Pillars
1. **The Brain** (`/api/dream-realms/scenario-state`) — Environment computation
2. **The Skin** (`GameModuleWrapper`) — Visual distortions + premium overlays
3. **The Bridge** (`/api/game-core/commit-reward`) — Reward commitment
4. **Marketplace Hook** (`/api/marketplace/*`) — Economy layer
5. **Evolution Engine** (`/api/evolution/*`) — PEP vitality system

### 5-Layer Universe System
| Layer | Resonance | Loot | XP | Entropy |
|:---:|:---:|:---:|:---:|:---:|
| Terrestrial | 0 | 1.0× | 1.0× | 0% |
| Ethereal | 5 | 1.3× | 1.2× | 15% |
| Astral | 15 | 1.7× | 1.5× | 40% |
| Void | 30 | 2.5× | 2.0× | 75% |
| Nexus | 50 | 3.0× | 3.0× | 0% |

### Evolution Stages
| Stage | Min VC | Multiplier | Visual |
|:---:|:---:|:---:|:---:|
| Raw | 0 | 1.0× | Jagged, unrefined |
| Refined | 50 | 2.0× | Polished, internal light |
| Transcendental | 150 | 3.0× | Particle aura, radiant |

## Key DB Collections
- **Evolution**: `evolution_tracker` (per-asset VC, interactions, history, preservation)
- **Marketplace**: `cosmic_credits`, `marketplace_inventory`, `marketplace_active_effects`, `marketplace_equipped`, `marketplace_transactions`, `nexus_subscriptions`
- **Game Core**: `game_core_stats`, `game_core_transactions`, `nexus_passes`
- **Rock Hounding**: `rock_hounding_mines`, `rock_hounding_collection`
- **Forgotten Languages**: `forgotten_languages_progress`, `forgotten_languages_mastery`, `forgotten_languages_streaks`, `forgotten_languages_journal`

## Upcoming Tasks
### P1
- **Elemental Crafting** — Combine specimens using Universal Game Template
- **Party System** — Circle/Coven for shared objectives
- **Wisdom Evolution** — 4-tier teaching system (Seeds → Roots → Branches → Canopy) with hybrid AI

### P2 — Backlog
- P2P Wisdom Trading Marketplace (10% platform fee)
- Sponsorship Hooks & Promo Codes
- Expansion Packs (themed specimen collections)
- SmartDock "Relic Pedestal" visual integration
- Cosmic Mixer "grind minerals into pigments"
- Myths & Legends Encyclopedia
- Global Immersion Toggles
- Avatar Creator & AI Scene Recreations
- On-device inference (Nano-Banana SLM)
- Dashboard.js refactoring
- RockHounding.js refactoring (extract NexusPassShop, ActivePassBanner)
