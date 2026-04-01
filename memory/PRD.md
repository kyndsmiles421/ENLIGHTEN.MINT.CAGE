# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (unified LLM via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Procedural Loop Engine — Dream Realms (Apr 1, 2026) — NEW
- **Infinite Scenario Generator**: Procedurally generates unique "Dream Realms" seeded by user's elemental balance + birth resonance + cosmic weather. No two users see the same realm.
- **Nexus-Seeded Biomes**: 11 biome templates (fire_excess → "Solar Flare Desert", water_deficient → "Drought Sanctum", etc.) with dynamic naming via cosmic weather suffix
- **Tighten vs Expand Mechanics**: Inactive users face harder loops (difficulty scales with decay); active users expand the realm for more rewards
- **Escape Velocity**: Harmony Score is "escape velocity" — must reach threshold (base 60, +3 per iteration) to break the loop
- **Legendary Frequency Discovery**: Breaking a loop reveals unique Hz combos (111-1111 Hz range, legendary/epic/mythic rarity) with procedural mantra pairings
- **Decoded Modifier Hooks**: Loop completion permanently boosts elemental resonance via nexus_decoded_modifiers
- **AI Narratives**: Gemini generates unique realm entry descriptions and tighten narratives with fallback text
- **5-Rule Visual Distortion System**:
  - Rule 1 (Entropy): Harmony Score → lens clarity. High=crisp, Low=blur+flicker+derez
  - Rule 2 (Elemental Tinting): Dominant element → color grade (Wood=green sway, Fire=bloom, Water=refraction, Earth=amber, Metal=shimmer)
  - Rule 3 (Decay Distortion): Inactivity → glitch-shift scanlines and wireframe flickers
  - Rule 4 (Geometric Fracturing): Destructive cycle → jagged edges and corner fractures
  - Rule 5 (Mantra Feedback): Challenge completion → cleaning ripple animation clearing distortion
- **Backend**: `/api/dream-realms/active`, `/dream-realms/complete-challenge`, `/dream-realms/abandon`, `/dream-realms/history`, `/dream-realms/legendary-frequencies`
- **Frontend**: Full DreamRealms page with DistortionCompositor, EscapeGauge, ChallengeCards, LegendaryCards, LoopBrokenOverlay, TightenBanner, History/Discoveries tabs
- **Test**: Iteration 156 — 100% (23/23 backend, all frontend verified)

### Elemental Nexus — 5th Realm (Mar 31, 2026)
- **Dynamic Decay & Momentum**: 3-day half-life decay on element values during inactivity
- **Birth Resonance Calibration**: Natal baseline from birth date personalizes ideal element ratios
- **Frequency-Task Pairing**: Hz frequencies mapped to alignment tasks (Wood=528Hz, Fire=396Hz, Earth=174Hz, Metal=285Hz, Water=432Hz)
- **Bridge UI Transitions**: Trend indicators, constructive/destructive cycle glow, shift indicators
- **Decoded Modifiers Hook**: Architecture slot for Phase 2 Forgotten Languages
- **Cosmic Weather Dashboard Widget**: Streamlined card showing zodiac, lunar, forecast
- **Test**: Iteration 155 — 100% (28/28)

### Multiversal Layered Map System (Mar 31, 2026)
- 4 self-contained universes, 27 regions, interlocking logic engine, portal system, NPC dialogues
- **Test**: Iteration 154 — 100% (33/33)

### Cosmic Insights & Weather System (Mar 31, 2026)
- AI forecasts, tool recommendations, RPG bonuses, featured reports, scholar's bonus
- **Test**: Iteration 153 — 100%

### Dual Currency Economy & Shop System (Mar 31, 2026)
- Celestial Gems (Stripe) + Cosmic Dust (gameplay), dual-tier shop, equipment slots
- **Test**: Iteration 152 — 100%

### Daily Quest System (Mar 31, 2026)
- 6 daily quests, Perfect Day bonus, streak multipliers
- **Test**: Iteration 151 — 100%

### Core Platform
- Auth, Dashboard, AI Coach, Star Chart, Oracle, Sacred Texts
- Trade Circle, Gamification, Starseed, Multiverse Realms, Cosmic Concierge
- 7-Day Trial, Stripe Subscriptions, MixerContext, SmartDock
- Multi-Language (7), VR, PWA, Error Boundaries

## Credentials
- Admin: kyndsmiles@gmail.com / password
- RPG Test: rpg_test@test.com / password123

## Upcoming Tasks

### P1 — Forgotten Languages System (Phase 2)
- Daily Deciphering widget, Five-tier script discovery
- Visual Ciphers reactive to elemental balance (Fire-high = easier Fire scripts)
- Phonetic-to-Breath loop (hum frequencies to decode)
- Progressive Reveal (higher tiers need higher Harmony Scores)
- Decoded Modifiers → permanent natal resonance offsets
- Script mastery tied to Resonance

### P1 — Other
- Party System (Circle/Coven shared objectives)
- Passive Trinket XP Boosts

### P2 — Backlog
- Virtual Rock Hounding, Elemental Crafting
- Myths & Legends Encyclopedia, Global Immersion Toggles
- PDF Soul Map exports, Lunar Cycle global events

### P3 — Future
- Gem Resonance Engine, Avatar Creator, AI Scene Recreations

## Architecture Rules
- **API Prefix**: Frontend must use `${REACT_APP_BACKEND_URL}/api`
- **AuthHeaders**: `useAuth()` returns `authHeaders` as an object (not a function)
- **AI**: `.with_model("gemini", "gemini-3-flash-preview")`
- **RPG Terminology**: "Conduits" not "Weapons", "Circle" not "Party"
- **Nexus**: Half-life 3 days, natal from `nexus_birth_resonance`, decoded modifiers from `nexus_decoded_modifiers`
- **Dream Realms**: Biome seeded by worst imbalance + cosmic weather, escape velocity = 60 + 3*iteration

## Key DB Collections
- Dream Realms: `dream_realms`, `legendary_frequencies`
- Nexus: `nexus_alignments`, `nexus_birth_resonance`, `nexus_decoded_modifiers`, `nexus_harmony_history`
- RPG: `rpg_characters`, `rpg_inventory`, `rpg_equipped`, `rpg_currencies`, `rpg_quest_log`, `rpg_streaks`
- Shop: `rpg_purchases`, `rpg_slot_unlocks`, `rpg_transactions`
- Reports: `cosmic_weather_cache`
- Multiverse: `multiverse_state`
