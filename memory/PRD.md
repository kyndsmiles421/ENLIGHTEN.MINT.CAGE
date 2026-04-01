# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Full Integrated Evolution & Discovery Protocol (Apr 1, 2026)

**Refinement Lab — Digital Tumbler & Extraction Tools:**
- 3 extraction tools: Brush (Mohs 1-4), Pick (4-7), Chisel (7-10)
- Quality-based extraction: optimal tool match = 85-100% quality
- Digital Tumbler: 3-slot time-gated refinement (4h common → 48h mythic)
- Nexus subscribers get 50% speed boost on tumble time
- Instant-finish microtransaction (1 credit per remaining hour)
- Polished specimens unlock Starseed components + spiritual data
- **Test**: Iteration 164 — 100%

**SmartDock Nexus — The Relic Pedestal:**
- Slot any collected stone to trigger global app transformation
- Audio: Stone's Hz frequency auto-blends into soundscape
- Visual: UI palette shifts to match stone's chakra correspondence
- Functional: Unlocks tier-specific mantras and teachings
- 14 chakra palettes mapped (Root through Crown/Soul Star)
- Cosmic Ledger auto-logs all slotting activity
- **Test**: Iteration 164 — 100%

**Starseed Resource Conversion:**
- 30 unique specimen-to-component mappings
- Categories: defense, power, communication, navigation, life_support, energy, knowledge
- Power scales with extraction quality
- Component inventory with category aggregation
- **Test**: Iteration 164 — 100%

**Wisdom Evolution — 4-Tier Cognitive Growth:**
- Seeds (0 interactions): Simple affirmations
- Roots (5+ interactions): Curated folklore, history, geological facts
- Branches (15+ interactions): Philosophy, alchemy, meditation scripts
- Canopy (30+ interactions): User-planted peer-reviewed wisdom
- 10 fully curated specimens (Peridot, Emerald, Obsidian, Diamond, Clear Quartz, Moonstone, Lapis, Ruby, Amber, Sapphire)
- Canopy marketplace with planting rewards (25 XP + 15 Dust)
- **Test**: Iteration 164 — 100%

**Perpetual Evolution Protocol (PEP):**
- VC = (Interaction × Growth_Rate) - (Time × Decay_Rate)
- 3-Stage Evolution: Raw (1×) → Refined (2×, VC≥50) → Transcendental (3×, VC≥150)
- -1%/24h decay (paused for Igneous+ subscribers)
- Preservation Salts consumable (30-day freeze)
- **Test**: Iteration 163 — 100%

**Seasonal Cycles (90-day Geological Rotations):**
- Compression (Metamorphic): deep work, 396 Hz
- Eruption (Igneous): manifestation, 528 Hz
- Erosion (Sedimentary): reflection, 852 Hz

### Cosmic Marketplace & Monetization (Apr 1, 2026)
- Cosmic Credits: Stripe-purchasable + earnable (Dust conversion 100:1)
- 7 Consumables, 5 Cosmetics, Nexus Pass ($9.99/mo)
- Active Effects integrate with GameModuleWrapper
- Geological subscription tiers: Sedimentary(Free)/Igneous/Metamorphic
- **Test**: Iteration 162 — 100%

### Earlier Systems (All 100% Tested)
- Brain/Skin/Bridge, 5-Layer Universe, Forgotten Languages
- Universal Game Core, Rock Hounding, Adaptive Dashboard
- Dream Realms, Elemental Nexus, Multiversal Map
- Dual Currency, Daily Quests, RPG, Auth, AI Coach, Star Chart, Oracle

## Credentials
- RPG Test: rpg_test@test.com / password123

## Key Architecture

### The Five Pillars
1. **The Brain** (`/api/dream-realms/scenario-state`) — Environment
2. **The Skin** (`GameModuleWrapper`) — Visual distortions + premium overlays
3. **The Bridge** (`/api/game-core/commit-reward`) — Rewards
4. **Marketplace Hook** (`/api/marketplace/*`) — Economy
5. **Evolution Engine** (`/api/evolution/*` + `/api/refinement/*` + `/api/smartdock/*` + `/api/wisdom/*`) — PEP + Discovery

### Key DB Collections
- **Refinement**: `refinement_extractions`, `refinement_tumbler`, `starseed_components`
- **SmartDock**: `smartdock_state`, `cosmic_ledger_entries`
- **Wisdom**: `wisdom_canopy`
- **Evolution**: `evolution_tracker`
- **Marketplace**: `cosmic_credits`, `marketplace_inventory`, `marketplace_active_effects`, `marketplace_equipped`, `marketplace_transactions`, `nexus_subscriptions`

## Upcoming Tasks
### P1
- **Elemental Crafting** — Combine specimens using Universal Game Template
- **Party System** — Circle/Coven for shared objectives
- **GPS Hotspot Spawning** — Location-based mineral discovery (Black Hills)

### P2 — Backlog
- P2P Wisdom Trading Marketplace (10% platform fee)
- Sponsorship Hooks & Promo Codes
- Expansion Packs (themed specimen collections)
- Cosmic Mixer "grind minerals into pigments" audio system
- Camera-based scanning interface
- Myths & Legends Encyclopedia
- Global Immersion Toggles
- Avatar Creator & AI Scene Recreations
- On-device inference (Nano-Banana SLM)
- 3D mesh morphing for PEP visual evolution
- Dashboard.js / RockHounding.js refactoring
