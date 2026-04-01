# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Launch Polish & System Integration (Apr 1, 2026) — LATEST

**Latency Pulse Indicator (NEW):**
- `useLatencyPulse.js`: LatencyProvider context, LatencyHUD, LatencyDot, useLatency hook
- Tracks response time on every critical action with color-coded dots (green <150ms, blue <300ms, amber <800ms, red >800ms)
- Integrated into 6 pages: RPGPage, RockHounding, CosmicStore, SmartDockPage, EvolutionLab, RefinementLab
- Global HUD in top-right with auto-clear after 4s

**World Veins & NPC Rivals (Encounter Frontend — NEW):**
- World Veins: collective boss encounters with resonance progress bar, "Contribute Resonance" button
- NPC Rival: Compete/Evade buttons, rival archetype display with dialogue
- Both integrated into RPG Bosses tab below Cosmic Threats

**Tests**: Iterations 166 (100%), 167 (100%/95%), 168 (100%/100%)

### Full-Stack Deep Click Optimization & E2E Audit (Apr 1, 2026)

**QuestCard Fix (RPG Page):**
- Converted QuestCard from non-interactive `div` to clickable `button`
- Added `onNavigate` prop mapping quest IDs to activity pages
- Added `ChevronRight` indicator on navigable quests

**IntroVideo Mute Button (Landing):**
- Title gradient overlay now has `pointerEvents: 'none'`
- Mute button z-index 30 with `pointerEvents: 'auto'`, 44x44 hit target
- Added `onTouchEnd`, `stopPropagation` for mobile

**Universal Inventory Bridge (NEW):**
- `rock_hounding.py` mine-action inserts specimens into `rpg_inventory`
- `refinement.py` collect updates `rpg_inventory` state to polished
- ItemCard shows Raw/Polished state badges

**Transmute Panel (RPG Shop — NEW):**
- "Transmute" tab in shop with Alchemical Exchange panel
- Preset buttons (150/300/450/750), rate display, Transmute button

**RockHounding.js Refactored:**
- 7 components extracted to `/components/game/MiningComponents.js`
- Reduced from ~857 to ~440 lines

**Tests**: Iterations 166 (100%), 167 (Backend 100%, Frontend 95%)

### Sweat Equity, Encounters & Living Journal (Apr 1, 2026)

**Economy Admin (Alchemical Exchange — Sweat Equity):**
- Admin-controlled sliding scale: `dust_per_credit` (10–10000 range)
- Communal modifier: global goals can reduce exchange rate for all users
- Feature Flags: 5 premium modules gatable by subscription OR credit purchase
- Permanent module unlock via credits (Cosmic Mixer 500cc, Starseed Workbench 800cc, Dream Realms Deep 600cc, Wisdom Branches 300cc, Digital Seeds 400cc)
- 3 Communal Goals: Global Enlightenment (rate reduction), Rapid Tumbling (speed), World Vein Resonance (drops)
- **Test**: Iteration 165 — 100% (37/37)

**Environmental Bosses & NPC Rivals:**
- 3 Boss Types: Unstable Vein (60s/5 actions), Crystal Maze (90s/4 actions), Geothermal Surge (45s/6 actions)
- Daily deterministic boss spawns per user
- 2 Rival NPCs: The Sprinter (volume, speed 0.8), The Specialist (precision, speed 0.5)
- Rival competition with stealth/speed buffs and steal mechanics
- Bosses/rivals award XP + Dust + communal contributions
- **Test**: Iteration 165 — 100%

**World Veins (Collective Bosses):**
- Heart Frequency Vein: 528 Hz, 10 participants, rewards Moldavite
- Crown Resonance Vein: 963 Hz, 25 participants, rewards Alexandrite
- Frequency tolerance ±10%, minimum meditation duration
- 72h reward window when cracked

**Living Journal (AI-Generated Narratives):**
- Gemini 3 Flash generates personalized discovery narratives
- Blends geological data + spiritual lore + personal context + current season
- Per-specimen journal with personal reflections (max 1000 chars)
- Auto-contributes to communal enlightenment goal
- **Test**: Iteration 165 — 100%

### Refinement Lab, SmartDock, Wisdom Evolution (Apr 1, 2026)
- Digital Tumbler (3 slots, time-gated, instant-finish), Extraction Tools (Brush/Pick/Chisel)
- SmartDock Nexus (14 chakra palettes, frequency audio blend, mantra display)
- Starseed Components (30 mappings), Wisdom Evolution (4-tier curated + Canopy)
- **Test**: Iteration 164 — 100%

### PEP, Marketplace, Seasonal Cycles (Apr 1, 2026)
- VC system, 3-stage evolution, -1%/24h decay, Preservation Salts
- Cosmic Credits, 7 Consumables, 5 Cosmetics, Nexus Pass ($9.99/mo)
- 90-day Geological Rotations (Compression/Eruption/Erosion)
- **Test**: Iterations 162-163 — 100%

### Earlier Systems (All 100% Tested)
- Brain/Skin/Bridge, 5-Layer Universe, Forgotten Languages
- Universal Game Core, Rock Hounding, Adaptive Dashboard
- Dream Realms, Elemental Nexus, Multiversal Map, Daily Quests, RPG, Auth, AI Coach, Star Chart, Oracle

## Credentials
- RPG Test: rpg_test@test.com / password123

## Key Architecture

### Module Registration (server.py)
economy_admin, encounters, living_journal, evolution, refinement, smartdock, wisdom, marketplace, game_core, rock_hounding, forgotten_languages, dream_realms, rpg, nexus, multiverse_map, reports, subscriptions

### Key DB Collections
- **Economy**: `economy_config`, `module_unlocks`, `communal_progress`, `communal_bonuses`
- **Encounters**: `boss_attempts`, `rival_state`, `world_vein_progress`, `world_vein_cracks`
- **Journal**: `living_journal`
- **Refinement**: `refinement_extractions`, `refinement_tumbler`, `starseed_components`
- **SmartDock**: `smartdock_state`, `cosmic_ledger_entries`
- **Wisdom**: `wisdom_canopy`
- **Evolution**: `evolution_tracker`
- **Marketplace**: `cosmic_credits`, `marketplace_inventory`, `marketplace_active_effects`, `marketplace_equipped`, `marketplace_transactions`, `nexus_subscriptions`

## Upcoming Tasks
### P0
- **Starseed Game Module UI** — Build the Starseed journey interface where refined materials are used for ship components and passing Energy Gates

### P1
- **Elemental Crafting** — Combine specimens using Universal Game Template
- **Party System (Circle/Coven)** — Shared objectives bridging solo play and world bosses
- **GPS Hotspot Spawning** — Location-based mineral discovery
- **Biometric Sync** — Heart-rate data influences stone visual glow
- **Encounter Frontend Pages** — Boss/rival/vein UI (backend exists)
- **RockHounding.js Refactoring** — Abstract ~900-line component into modular files

### P2 — Backlog
- P2P Wisdom Trading Marketplace (10% platform fee)
- Myths & Legends Encyclopedia
- Global Immersion Level toggles
- Avatar Creator & AI Scene Recreations (Vision Mode)
- Sponsorship Hooks & Promo Codes
- Expansion Packs (themed specimen collections)
- Cosmic Mixer "grind minerals into pigments" audio system
- Camera-based scanning interface
- On-device inference (Nano-Banana SLM)
- 3D mesh morphing for PEP visual evolution
- Dashboard.js refactoring
