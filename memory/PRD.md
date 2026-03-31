# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (unified LLM via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Cosmic Insights & Weather System (Mar 31, 2026) — NEW
- **Cosmic Weather Engine**: AI-generated daily forecasts tied to zodiac season + lunar phase
  - Tool-specific recommendations (Mixer frequencies, Sacred Text chapters)
  - RPG elemental affinities (Fire/Water/Earth/Air stat boosts)
  - Lunar phase XP bonuses (Full Moon: +25 XP)
  - Quick Reset pulse alerts on high-tension cosmic days
- **Featured Reports Dashboard** (`/cosmic-insights`):
  - Stories-style Highlights Reel (last 24hr top insights with action buttons)
  - Weekly Overview: Moods, Meditations, Journal, Soundscape stats
  - Peak Spiritual Hours heatmap
  - Soundscape Synergy Report (sound-mood correlations)
  - Scholar's Bonus: +25 XP weekly for viewing reports
- **Deep-Dive Monthly Analysis** (gem-locked premium):
  - AI predictions, mood trends (best/worst days), sound-mood correlations
  - Unlockable for 50 Celestial Gems or via Premium subscription
- **Backend**: `/api/reports/cosmic-weather`, `/api/reports/insights`, `/api/reports/deep-dive`, `/api/reports/unlock-deep-dive`, `/api/reports/scholar-bonus`, `/api/reports/elemental-affinities`

### Dual Currency Economy & Shop System (Mar 31, 2026)
- Celestial Gems (hard) via Stripe, Cosmic Dust (soft) via gameplay
- Gem packs ($0.99-$9.99), currency conversion (1 gem = 10 dust)
- Dual-tier shop: Dust Shop (8 items) + Gem Shop (9 premium items)
- Equipment Slot Unlocks: Slots 5-8 (Hands/Feet/Relic/Aura) behind gems

### Daily Quest System — Wellness-to-RPG Habit Loop (Mar 31, 2026)
- 6 daily quests, Perfect Day bonus, streak multipliers (capped 2.5x)
- Auto-triggers from wellness endpoints

### Wellness MMORPG — Cosmic Realm (Mar 31, 2026)
- RPGPage with 7 tabs (Quests, Character, Inventory, Shop, World Map, Bosses, Circle)

### Core Platform
- Auth, Dashboard, AI Coach, Star Chart, Oracle, Sacred Texts, Trade Circle
- Gamification, Starseed, Multiverse Realms, Cosmic Concierge
- 7-Day Trial, Stripe Subscriptions, MixerContext, SmartDock
- Multi-Language (7), VR, PWA, Error Boundaries

## Test Report History
- Iterations 145-149: All 100% pass
- Iteration 150: RPG MMORPG — 100%
- Iteration 151: Daily Quest System — 100%
- Iteration 152: Dual Currency Economy — 100%
- Iteration 153: Cosmic Insights & Weather — 100% (28/28)

## Credentials
- Admin: kyndsmiles@gmail.com / password
- RPG Test: rpg_test@test.com / password123

## Upcoming Tasks

### P1 — Next
- Passive Trinket XP Boosts (background multipliers from equipped items)
- Circle/Coven Goals (shared group objectives for rare rewards)
- Natal Forecast unlockable via gems (30-day personalized astrology)

### P2 — Backlog
- Virtual Rock Hounding (raw material searching)
- Myths & Legends Encyclopedia (Cosmic Realm lore)
- Global Immersion Level Toggles
- Printable PDF "Soul Map" export
- Lunar Cycle global world events (Full Moon collaboration)
- Month-Ahead proactive planning reports

### P3 — Future
- Gem Resonance Engine (Amethyst→meditation, Rose Quartz→mood, Clear Quartz→wildcard)
- Elemental Crafting (forging gear with affinities)
- Spore-like Spiritual Avatar Creator
- AI Scene Recreations

## Architecture Rules
- **API Prefix**: Frontend must use `${REACT_APP_BACKEND_URL}/api` for all API calls
- **Audio**: Always `useMixer()`, never `new AudioContext()`
- **AI**: Always `.with_model("gemini", "gemini-3-flash-preview")`
- **AuthHeaders**: `useAuth()` returns `authHeaders` as an object (not a function)
- **RPG Terminology**: "Conduits" not "Weapons", "Circle" not "Party"
- **Currency Mapping**: `stardust_shards` = Celestial Gems, `cosmic_dust` = Cosmic Dust
- **Cosmic Weather**: Cached daily in `cosmic_weather_cache` collection
- **Quest Integration**: Import `award_quest_xp` from `routes.rpg` in wellness endpoints

## Key DB Collections
- `rpg_characters`, `rpg_inventory`, `rpg_equipped`, `rpg_currencies`
- `rpg_discoveries`, `rpg_boss_encounters`, `rpg_parties`
- `rpg_quest_log`, `rpg_streaks`
- `rpg_purchases`, `rpg_slot_unlocks`, `rpg_transactions`
- `payment_transactions`: Stripe checkout sessions
- `cosmic_weather_cache`: Daily AI forecast cache
