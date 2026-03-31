# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (unified LLM via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Dual Currency Economy & Shop System (Mar 31, 2026) — NEW
- **Celestial Gems** (hard/premium): Purchased via Stripe ($0.99=100, $4.99=600+100 bonus, $9.99=1500+300 bonus)
- **Cosmic Dust** (soft/earned): Earned through quests, exploration, bosses
- **Currency Conversion**: 1 Gem = 10 Dust, with conversion UI
- **Dust Shop**: 8 items (consumables, uncommon gear: Elixirs, Prayer Beads, Monk's Hood, Moonstone)
- **Gem Shop**: 9 premium items (rare/epic/legendary: Starlight Nectar, Oracle Veil, Astral Armor, Ethereal Tuning Fork, Eye of the Cosmos)
- **Equipment Slot Unlocks**: Slots 5-8 locked behind gems (Hands=50, Feet=75, Relic=125, Aura=200)
- **Stripe Checkout**: One-tap gem purchase with checkout status polling and auto-fulfillment
- **Backend**: `/api/rpg/shop`, `/api/rpg/shop/buy`, `/api/rpg/shop/convert`, `/api/rpg/shop/unlock-slot`, `/api/rpg/shop/purchase-gems`, `/api/rpg/shop/checkout-status/{id}`
- **Frontend**: Shop tab with 4 sub-views (Dust Shop, Gem Shop, Buy Gems, Slots)

### Daily Quest System — Wellness-to-RPG Habit Loop (Mar 31, 2026)
- 6 daily quests bridging wellness to RPG progression
- Perfect Day bonus (+100 XP), streak multipliers (capped at 2.5x)
- Auto-triggers from mood/journal/meditation endpoints

### Wellness MMORPG — Cosmic Realm (Mar 31, 2026)
- RPGPage with 7 tabs (Quests, Character, Inventory, Shop, World Map, Bosses, Circle)
- Full RPG system: stats, equipment, fog-of-war map, cooperative bosses, party system

### Core Platform
- Auth, Dashboard, AI Coach, Star Chart (20 cultures), Oracle, Sacred Texts
- Trade Circle, Gamification, Starseed (8 origins), Multiverse Realms (6 dimensions)
- Gemini 3 Flash AI (35+ instances), Cosmic Concierge, Error Boundaries
- 7-Day Trial System, Trial Graduation Modal, Stripe Premium Tiers
- MixerContext (Global Audio), SmartDock, Soundscapes, Multi-Language (7), VR, PWA

## Test Report History
- Iteration 145-149: All 100% pass
- Iteration 150: RPG MMORPG — 100%
- Iteration 151: Daily Quest System — 100%
- Iteration 152: Dual Currency Economy — 100% (18/18 backend, all frontend)

## Credentials
- Admin: kyndsmiles@gmail.com / password
- RPG Test: rpg_test@test.com / password123

## Upcoming Tasks

### Phase 1: Passive & Group Progression (P1)
- Trinket Boosts: Background XP multipliers from equipped items
- Circle/Coven Goals: Shared objectives for group rewards

### Phase 2: Content Expansion (P2)
- Virtual Rock Hounding (raw material searching)
- Myths & Legends Encyclopedia (Cosmic Realm lore)
- Global Immersion Level Toggles

### Phase 3: Advanced Systems (P3)
- Gem Resonance Engine (Amethyst→meditation, Rose Quartz→mood, Clear Quartz→wildcard)
- Elemental Crafting (forging gear with affinities/enchanting)
- Spore-like Spiritual Avatar Creator
- AI Scene Recreations

## Architecture Rules
- **Audio**: Always `useMixer()`, never `new AudioContext()`
- **AI**: Always `.with_model("gemini", "gemini-3-flash-preview")`
- **RPG Terminology**: "Conduits" not "Weapons", "Circle" not "Party"
- **Currency Mapping**: `stardust_shards` = Celestial Gems (hard), `cosmic_dust` = Cosmic Dust (soft)
- **Equipment Phase 1**: 4 base slots + 4 premium-unlock slots
- **Quest Integration**: Import `award_quest_xp` from `routes.rpg` in wellness endpoints

## Key DB Collections
- `rpg_characters`, `rpg_inventory`, `rpg_equipped`, `rpg_currencies`
- `rpg_discoveries`, `rpg_boss_encounters`, `rpg_parties`
- `rpg_quest_log`, `rpg_streaks`
- `rpg_purchases`: Shop purchase records (item_id, cost, currency)
- `rpg_slot_unlocks`: Unlocked extra equipment slots per user
- `rpg_transactions`: Currency conversion and slot unlock audit log
- `payment_transactions`: Stripe checkout sessions for gem purchases
