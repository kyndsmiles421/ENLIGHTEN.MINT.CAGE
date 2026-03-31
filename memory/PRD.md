# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (unified LLM via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Daily Quest System — Wellness-to-RPG Habit Loop (Mar 31, 2026) — NEW
- **6 Daily Quests**: Still Mind (meditation +50 XP), Inner Scribe (journal +30 XP), Emotional Compass (mood +20 XP), Breath of Life (breathing +25 XP), Harmonic Resonance (soundscape +20 XP), 3-Breath Reset (micro-quest +10 XP)
- **Perfect Day Bonus**: +100 XP for completing all 5 pillar quests in one day
- **Streak System**: 3-day = 1.5x, 7-day = 2x, 14-day = 2.5x (capped) XP multiplier
- **Auto-triggers**: Mood, journal, and meditation endpoints automatically award quest XP
- **Frontend**: Quests tab (default) with quest board, streak display, Perfect Day progress bar, 3-Breath Reset button
- **Backend**: `/api/rpg/quests/daily`, `/api/rpg/quests/complete`, `/api/rpg/quests/breath-reset`, `/api/rpg/quests/streak`

### Wellness MMORPG — Cosmic Realm (Mar 31, 2026)
- **Frontend**: RPGPage.js with 6 tabs (Quests, Character, Inventory, World Map, Bosses, Circle)
- **Character**: Equipment slots (Head, Body, Conduit, Trinket), stat bars, currencies
- **Inventory**: Item cards with rarity, equip/use, Starter Kit
- **World Map**: 9 regions with fog-of-war, secret locations
- **Bosses**: 3 cooperative bosses with battle UI (3 attack types)
- **Circle**: Party system with invite codes
- **Backend**: Full `/api/rpg/*` routes

### Trial Graduation Modal (Mar 31, 2026)
- Personalized graduation experience when 7-day Plus trial expires

### Error Handling & Resilience (Mar 31, 2026)
- CosmicErrorBoundary, Global Axios Interceptor, Cosmic-themed loaders

### Core Platform
- Auth, dashboard, wellness, AI Coach, Star Chart (20 cultures), Oracle, Sacred Texts
- Trade Circle, Gamification, Starseed (8 origins), Multiverse Realms (6 dimensions)
- MixerContext (Global Audio), SmartDock, Soundscapes, Stripe Premium Tiers
- Multi-Language (7), VR, PWA

## Test Report History
- Iteration 145-149: All 100% pass
- Iteration 150: RPG MMORPG (Backend 17/17, Frontend 100%)
- Iteration 151: Daily Quest System (Backend 17/17, Frontend 100%)

## Credentials
- Admin: kyndsmiles@gmail.com / password
- RPG Test: rpg_test@test.com / password123

## Upcoming Tasks

### Phase 1: Passive & Group Progression (P1)
- **Trinket Boosts**: Background XP multipliers from equipped items
- **Circle/Coven Goals**: Shared objectives requiring group participation for rare rewards

### Phase 2: Content Expansion (P2)
- Virtual Rock Hounding (raw material searching)
- Myths & Legends Encyclopedia (Cosmic Realm lore)
- Global Immersion Level Toggles

### Phase 3: Advanced Systems (P3)
- 8-Slot Equipment Expansion (Hands, Feet, Relic)
- Gem Resonance Engine (Amethyst→meditation bonus, Rose Quartz→mood, Clear Quartz→wildcard)
- Elemental Crafting (forging gear with affinities/enchanting)
- Spore-like Spiritual Avatar Creator
- AI Scene Recreations

## Architecture Rules
- **Audio**: Always `useMixer()`, never `new AudioContext()`
- **AI**: Always `.with_model("gemini", "gemini-3-flash-preview")`
- **Errors**: Use `getCosmicErrorMessage()` + `CosmicError`
- **Trial**: Auto-expiry in `get_user_credits()`, graduation modal via `TrialGraduation.js`
- **RPG Terminology**: "Conduits" not "Weapons", "Circle" not "Party"
- **Quest Integration**: Import `award_quest_xp` from `routes.rpg` in wellness endpoints

## Key DB Collections
- `rpg_characters`, `rpg_inventory`, `rpg_equipped`, `rpg_currencies`
- `rpg_discoveries`, `rpg_boss_encounters`, `rpg_parties`
- `rpg_quest_log`: Daily quest completions (user_id, quest_id, date, xp_awarded)
- `rpg_streaks`: User streak tracking (user_id, last_date, days)
