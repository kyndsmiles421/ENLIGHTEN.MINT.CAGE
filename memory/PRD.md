# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, cinematic visuals, and Wellness MMORPG mechanics.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Full-Stack Click Audit & E2E Optimization (Apr 1, 2026) — NEW

**QuestCard Fix (RPG Page — Critical):**
- Converted QuestCard from non-interactive `div` to clickable `button`
- Added `onNavigate` prop mapping quest IDs to activity pages: meditation→`/meditation`, journal→`/journal`, mood→`/mood`
- Added `ChevronRight` indicator on navigable quests
- Quests with direct completion (`breath_reset`, `breathing`, `soundscape`) still have `onComplete` inline

**IntroVideo Mute Button (Landing — Critical):**
- Fixed event propagation: added `e.stopPropagation()` and `e.preventDefault()`
- Added `onTouchEnd` handler for mobile touch responsiveness
- Increased button hit target (p-3, larger icon)
- Added `touchAction: 'manipulation'` and z-index 20

**RPG Tabs Mobile Fix:**
- Added `touchAction: 'manipulation'` and `onTouchEnd` for mobile tab switching
- Added `overflow-x-auto` with `WebkitOverflowScrolling: touch` for horizontal scroll
- Tabs flex-shrink-0 for proper mobile layout

**Ghost Click Audit — No Issues Found:**
- All overlay components (BackgroundPicker, GuidedTour, DeepDive, StarseedInventory) properly conditional-rendered with `if (!isOpen) return null`
- All visual overlay layers (CosmicMixer) use `pointer-events-none`
- SmartDock positioned at `bottom:80, left:12` — small element, no full-screen blocking
- No z-index collisions between nav (z-50), SmartDock (z-9997), and overlays (z-9999)
- **Test**: Iteration 166 — 100% (Frontend + Backend)

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
