# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (unified LLM via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Wellness MMORPG — Cosmic Realm (Mar 31, 2026) — NEW
- **Frontend**: Full RPGPage.js (662 lines) with 5 tabs:
  - **Character**: Equipment slots (Head, Body, Conduit, Trinket), stat bars (Wisdom, Vitality, Resonance, Harmony, Focus), currencies display, passive XP tracking
  - **Inventory**: Item cards with rarity colors, equip/use buttons, Starter Kit claim
  - **World Map**: 9 regions with fog-of-war, SVG connection lines, secret locations with unlock conditions
  - **Bosses**: 3 cooperative bosses (Shadow of Doubt, Storm of Anxiety, Void Leviathan), HP bars, phase tracking, battle UI with 3 attack types
  - **Circle**: Party creation/joining with invite codes, member list, leave functionality
- **Backend**: `/api/rpg/*` endpoints for characters, inventory, world map, bosses, parties
- **XP Bug Fix**: Fixed xp_for_level returning non-zero for level 1 (caused -100 xp_current)
- **Routing**: Registered at `/rpg` in App.js, accessible via "Cosmic RPG" in Dashboard Explore group

### Trial Graduation Modal (Mar 31, 2026)
- Personalized graduation experience when 7-day Plus trial expires
- Backend: `/api/subscriptions/trial-summary` aggregates data across 9 collections

### Error Handling & Resilience (Mar 31, 2026)
- CosmicErrorBoundary, Global Axios Interceptor, Cosmic-themed loaders and fallbacks

### 7-Day Free Plus Trial (Mar 31, 2026)
- Auto-activated on registration, auto-expires, trial-aware Pricing page

### Gemini AI — Unified Brain (Mar 31, 2026)
- ALL ~35 LlmChat instances on Gemini 3 Flash
- Context-Aware Cosmos Floating Assistant (26-page map, translucent glass button)

### Core Platform
- Auth, dashboard, wellness, AI Coach, Star Chart (20 cultures), Oracle, Sacred Texts
- Trade Circle, Gamification, Starseed (8 origins), Multiverse Realms (6 dimensions)
- MixerContext (Global Audio), SmartDock, Soundscapes, Stripe Premium Tiers
- Multi-Language (7), VR, PWA

## Test Report History
- Iteration 145-149: All 100% pass
- Iteration 150: RPG MMORPG (Backend 17/17, Frontend 100%) — ALL PASSED

## Credentials
- Admin: kyndsmiles@gmail.com / password
- RPG Test: rpg_test@test.com / password123 (Level 3, starter kit claimed)

## Upcoming Tasks

### P1 — Next
- Passive Progression: Equipped trinkets provide background XP boosts when app is closed
- Party System enhancements: Circle/Coven features for group goals

### P2 — Backlog
- Virtual Rock Hounding (tie-in to gem resonance)
- Myths & Legends Encyclopedia
- Global Immersion Level Toggles
- Language preference persistence

### P3 — Future
- Spore-like Spiritual Avatar Creator
- Gem Resonance engine
- AI Scene Recreations
- Crafting system (forge tools, elemental affinities)
- 8-slot equipment expansion (Hands, Feet, Relic)

## Architecture Rules
- **Audio**: Always `useMixer()`, never `new AudioContext()`
- **AI**: Always `.with_model("gemini", "gemini-3-flash-preview")`
- **Errors**: Use `getCosmicErrorMessage()` + `CosmicError` for themed fallbacks
- **Trial**: Auto-expiry in `get_user_credits()`, graduation modal via `TrialGraduation.js`
- **RPG Terminology**: "Conduits" not "Weapons", "Circle" not "Party"
- **Equipment**: Phase 1 = 4 slots (Head, Body, Conduit, Trinket)

## Key DB Collections
- `rpg_characters`: level, xp, stats, stat_points, party_id
- `rpg_inventory`: items with rarity, stats, slots
- `rpg_equipped`: currently equipped items per slot
- `rpg_currencies`: cosmic_dust, stardust_shards, soul_fragments
- `rpg_discoveries`: fog-of-war region tracking
- `rpg_boss_encounters`: active boss fights with participants
- `rpg_parties`: circle/coven groups with invite codes
