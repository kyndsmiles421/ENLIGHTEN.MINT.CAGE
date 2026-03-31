# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (unified LLM via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Multiversal Layered Map System (Mar 31, 2026) — NEW
- **4 Self-Contained Universes**: Terrestrial (Earth/vitality), Ethereal (Water/harmony), Astral (Fire/wisdom), Void (Air/resonance)
- **27 total regions** across all 4 planes with unique NPCs, tools, and descriptions
- **Interlocking Logic Engine**: Actions in one universe create ripples in the other three:
  - Terrestrial→Ethereal (reveal NPCs), Terrestrial→Astral (boost loot), Terrestrial→Void (calm chaos)
  - Ethereal→Terrestrial (grow flora), Ethereal→Astral (amplify stars), Ethereal→Void (weaken shadows)
  - Astral→Terrestrial (reveal secrets), Astral→Ethereal (charge nexus), Astral→Void (illuminate)
  - Void→Terrestrial (deepen roots), Void→Ethereal (expand aura), Void→Astral (bend time)
- **Portal System**: Cross-universe portals connecting planes (Terrestrial↔Ethereal↔Astral↔Void)
- **NPC Dialogue System**: 21+ unique dialogue themes with resonance-based progression
- **Cosmic Weather Integration**: Zodiac season determines ascendant universe (+20% XP bonus)
- **The Origin Point**: Nexus region in the Void where all 4 planes converge
- **Backend**: `/api/multiverse/state`, `/api/multiverse/explore`, `/api/multiverse/interact-npc`, `/api/multiverse/travel`, `/api/multiverse/ripples`
- **Frontend**: Full interactive SVG map, universe selectors, region detail panels, resonance bars, ripple feed

### Cosmic Insights & Weather System (Mar 31, 2026)
- AI-generated daily forecasts, tool recommendations, RPG elemental affinities
- Featured Reports Dashboard, Stories-style Highlights, Deep-Dive Monthly Analysis (gem-locked)
- Scholar's Bonus (+25 XP/week)

### Dual Currency Economy & Shop System (Mar 31, 2026)
- Celestial Gems (hard, Stripe) + Cosmic Dust (soft, gameplay)
- Dual-tier shop (17 items), equipment slot unlocks, gem packs

### Daily Quest System (Mar 31, 2026)
- 6 daily quests, Perfect Day bonus, streak multipliers (capped 2.5x)

### Wellness MMORPG — Cosmic Realm (Mar 31, 2026)
- RPGPage: Quests, Character, Inventory, Shop, World Map, Bosses, Circle

### Core Platform
- Auth, Dashboard, AI Coach, Star Chart, Oracle, Sacred Texts
- Trade Circle, Gamification, Starseed, Multiverse Realms, Cosmic Concierge
- 7-Day Trial, Stripe Subscriptions, MixerContext, SmartDock
- Multi-Language (7), VR, PWA, Error Boundaries

## Test Report History
- Iterations 145-149: All 100% pass
- Iteration 150: RPG MMORPG — 100%
- Iteration 151: Daily Quest System — 100%
- Iteration 152: Dual Currency Economy — 100%
- Iteration 153: Cosmic Insights & Weather — 100%
- Iteration 154: Multiversal Map — 100% (33/33)

## Credentials
- Admin: kyndsmiles@gmail.com / password
- RPG Test: rpg_test@test.com / password123
- Multiverse Test: multiverse_test@test.com / password123

## Upcoming Tasks

### P1 — Next
- Passive Trinket XP Boosts
- Natal Forecast (gem-locked personalized astrology)
- Circle/Coven shared group objectives
- Wellness-to-Universe auto-linking (mood→Terrestrial resonance, meditation→Ethereal, etc.)

### P2 — Backlog
- Virtual Rock Hounding, Myths & Legends Encyclopedia
- Global Immersion Level Toggles, PDF Soul Map exports
- Lunar Cycle global events, Month-Ahead forecasts

### P3 — Future
- Gem Resonance Engine, Elemental Crafting, Avatar Creator, AI Scene Recreations

## Architecture Rules
- **API Prefix**: Frontend must use `${REACT_APP_BACKEND_URL}/api`
- **AuthHeaders**: `useAuth()` returns `authHeaders` as an object (not a function)
- **AI**: `.with_model("gemini", "gemini-3-flash-preview")`
- **RPG Terminology**: "Conduits" not "Weapons", "Circle" not "Party"
- **Currency**: `stardust_shards` = Celestial Gems, `cosmic_dust` = Cosmic Dust
- **Multiverse**: State tracked in `multiverse_state` collection, ripples capped at 50

## Key DB Collections
- RPG: `rpg_characters`, `rpg_inventory`, `rpg_equipped`, `rpg_currencies`, `rpg_quest_log`, `rpg_streaks`
- Shop: `rpg_purchases`, `rpg_slot_unlocks`, `rpg_transactions`, `payment_transactions`
- Reports: `cosmic_weather_cache`
- Multiverse: `multiverse_state` (discovered regions, NPC met, portals, ripple_log, universe_resonance)
