# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Sweat Equity, Encounters & Living Journal (Apr 1, 2026) — NEW

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
### P1
- **Elemental Crafting** — Combine specimens using Universal Game Template
- **Party System** — Circle/Coven for shared objectives
- **GPS Hotspot Spawning** — Location-based mineral discovery
- **Biometric Sync** — Heart-rate data influences stone visual glow

### P2 — Backlog
- P2P Wisdom Trading Marketplace (10% platform fee)
- Sponsorship Hooks & Promo Codes
- Expansion Packs (themed specimen collections)
- Cosmic Mixer "grind minerals into pigments" audio system
- Camera-based scanning interface
- Myths & Legends Encyclopedia, Global Immersion Toggles
- Avatar Creator & AI Scene Recreations
- On-device inference (Nano-Banana SLM)
- 3D mesh morphing for PEP visual evolution
- Encounter frontend pages (boss/rival/vein UI)
- Dashboard.js / RockHounding.js refactoring
