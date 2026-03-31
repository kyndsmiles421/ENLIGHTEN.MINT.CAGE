# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (unified LLM via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Elemental Nexus — 5th Realm (Mar 31, 2026) — NEW
- **Dynamic Decay & Momentum**: Half-life logic (3-day half-life) causes element values to decay toward neutral during inactivity, encouraging consistent engagement
- **Birth Resonance Calibration**: One-time natal baseline from birth date (zodiac sign + numerological life path number) shifts ideal element ratios per user
- **Frequency-Task Pairing**: Each alignment task maps to specific Hz frequencies and mantras (Wood=528Hz, Fire=396Hz, Earth=174Hz, Metal=285Hz, Water=432Hz)
- **Bridge UI Transitions**: Animated flow visualization on alignment completion, constructive/destructive cycle glow on Harmony Score, shift indicators on element rings, trend sparkline
- **Decoded Modifiers Hook**: Architecture slot in `nexus.py` for Phase 2 Forgotten Languages to permanently offset natal resonance
- **Cosmic Weather Dashboard Widget**: Streamlined card on Dashboard showing zodiac season, lunar phase, AI forecast, frequency/XP chips
- **Backend**: `/api/nexus/state`, `/api/nexus/align`, `/api/nexus/birth-resonance` (GET/POST), `/api/nexus/history`
- **Frontend**: Full Nexus page with HarmonyGauge, ElementRings, DecayBar, ElementFlowVis, BirthResonanceCard, AlignmentCards with frequency info
- **Test**: Iteration 155 — 100% (28/28 backend, all frontend verified)

### Multiversal Layered Map System (Mar 31, 2026)
- **4 Self-Contained Universes**: Terrestrial (Earth/vitality), Ethereal (Water/harmony), Astral (Fire/wisdom), Void (Air/resonance)
- **27 total regions** across all 4 planes with unique NPCs, tools, and descriptions
- **Interlocking Logic Engine**: Actions in one universe create ripples in the other three
- **Portal System**: Cross-universe portals connecting planes
- **NPC Dialogue System**: 21+ unique dialogue themes with resonance-based progression
- **Cosmic Weather Integration**: Zodiac season determines ascendant universe (+20% XP bonus)

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
- Iteration 155: Elemental Nexus Phase 1 — 100% (28/28)

## Credentials
- Admin: kyndsmiles@gmail.com / password
- RPG Test: rpg_test@test.com / password123
- Multiverse Test: multiverse_test@test.com / password123

## Upcoming Tasks

### P1 — Phase 2: Forgotten Languages System
- Daily Deciphering widget (home screen puzzle with geometric scripts)
- Five-tier script discovery tied to game world (Earth→Aether progression)
- Mantra/frequency unlock through decoded languages
- Phonetic approach (vocal tones → breathing exercises)
- Visual Cipher (geometric shapes → emotional states/elements, react to elemental balance)
- Boss door/vault gatekeeping via language mastery
- Script mastery tied to Resonance (Fire-high = easier Fire scripts)
- Phonetic-to-Breath loop (hum frequencies to decode)
- Progressive Reveal (higher tiers need higher Harmony Scores)
- Decoded Modifiers → permanent natal resonance offsets via nexus.py hook

### P1 — Other
- Party System (Circle/Coven shared objectives)
- Passive Trinket XP Boosts
- Wellness-to-Universe auto-linking (mood→Terrestrial, meditation→Ethereal, etc.)

### P2 — Backlog
- Virtual Rock Hounding, Myths & Legends Encyclopedia
- Global Immersion Level Toggles, PDF Soul Map exports
- Lunar Cycle global events, Month-Ahead forecasts
- Elemental Crafting (forging gear with elemental affinities)

### P3 — Future
- Gem Resonance Engine, Avatar Creator, AI Scene Recreations

## Architecture Rules
- **API Prefix**: Frontend must use `${REACT_APP_BACKEND_URL}/api`
- **AuthHeaders**: `useAuth()` returns `authHeaders` as an object (not a function)
- **AI**: `.with_model("gemini", "gemini-3-flash-preview")`
- **RPG Terminology**: "Conduits" not "Weapons", "Circle" not "Party"
- **Currency**: `stardust_shards` = Celestial Gems, `cosmic_dust` = Cosmic Dust
- **Multiverse**: State tracked in `multiverse_state` collection, ripples capped at 50
- **Nexus**: Half-life decay at 3 days, natal baseline from `nexus_birth_resonance`, decoded modifiers from `nexus_decoded_modifiers`
- **Element Frequencies**: Wood=528Hz, Fire=396Hz, Earth=174Hz, Metal=285Hz, Water=432Hz

## Key DB Collections
- RPG: `rpg_characters`, `rpg_inventory`, `rpg_equipped`, `rpg_currencies`, `rpg_quest_log`, `rpg_streaks`
- Shop: `rpg_purchases`, `rpg_slot_unlocks`, `rpg_transactions`, `payment_transactions`
- Reports: `cosmic_weather_cache`
- Multiverse: `multiverse_state`
- Nexus: `nexus_alignments`, `nexus_birth_resonance`, `nexus_decoded_modifiers`, `nexus_harmony_history`
