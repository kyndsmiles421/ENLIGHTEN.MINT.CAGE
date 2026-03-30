# The Cosmic Collective — Product Requirements Document

## Vision
A highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Canvas API, Shadcn/UI
- **Backend:** FastAPI, Motor Async MongoDB
- **AI:** GPT-4o (text), GPT Image 1 (images), OpenAI TTS/Whisper, Sora 2
- **Payments:** Stripe
- **Auth:** JWT-based

## Core Features Implemented

### Wellness & Practice
- Mood tracking, Journaling, Breathing, Meditation, Yoga, Quantum Coherence
- Sleep tracking, Gratitude journal, Acupressure, Energy healing, Reiki
- Nutrition tracking, Recipes, Herbal remedies

### Divination & Spirituality
- Oracle/Tarot, Runes, I-Ching, Numerology, Palmistry, Crystal ball, Pendulum
- Animal totems, Creation stories (120+), 3D Star Chart with AI astrology

### Sacred Scriptures Library (136 books)
- Bible (66), Quran (114), Torah (5), Kabbalah (2+), Lost Books (50+)
- AI chapter summaries, Vision Mode, Guided Scripture Journeys
- Dashboard: chapters read, journeys, continue reading, smart suggestions

### Starseed Choose Your Own Adventure RPG
- 6 Origins: Pleiadian, Sirian, Arcturian, Lyran, Andromedan, Orion
- AI branching narrative (GPT-4o), RPG stats, XP/leveling, achievements
- AI-generated scene artwork (GPT Image 1)
- Cinematic cosmic canvas (stars, nebulas, shooting stars)
- Boss Loot Drops & Basic Inventory System
- Simple Avatar Generation (quick mode)

### Cosmic Realm — Multiplayer System
- Live Star Map, Cross-Path Encounters, NPC Encounters
- World Events (7 rotating every 6 hours), Leaderboard
- Alliance System with Chat, Cooperative Boss Encounters (5 bosses, 3-phase battles)

### Multiverse Realms System
- **4 Distinct Realms:** Astral Sanctum, Shadow Nexus, Crystal Caverns, Void Between
- **Portal Unlock System:** Layered conditions (level + gems + story choices)
- **Exploration:** Discover gems, equipment, encounter enemies, gain XP
- **Realm-specific loot tables**

### Cosmic Gem & Relic System
- **15 Gem Types:** 6 Elemental, 6 Starseed (origin-specific), 3 Cosmic (legendary)
- **Discovery Methods:** Exploration, boss drops, secret locations
- **Gem Collection:** Per-character tracking with full catalog

### Full RPG Equipment System
- **4 Slots:** Weapon, Armor, Accessory, Talisman
- **3 Equipment Sets:** Celestial Guardian, Void Walker, Starforged (2pc/4pc set bonuses)
- **16 Equipment Items** including 4 standalone legendaries
- **Gem Sockets:** 1-3 per item, socket/unsocket for bonus stats
- **Enchanting:** Fortify, Attune, Awaken using gems as fuel
- **Crafting:** 6 recipes (forge equipment and legendary gems from materials)

### Spiritual Avatar Creator — Spore-Style
- **6-Step Builder:** Base Form, Aura, Cosmic Features, Markings, Accessories, Background
- **48+ Customization Options** with multi-select categories
- **Level-Gated Evolution:** Features unlock as character levels up
- **AI Render:** GPT Image 1 composite portrait from selections
- **Cinematic Generation Animation:** Multi-phase "transmitting to the cosmos" loading with particle convergence canvas
- **Profile Integration:** Avatar saved as profile picture, downloadable as PNG

### UI/UX Polish (Latest)
- **Enhanced Typography Contrast:** Text shadows on wisdom quotes, lore text, and hero subtitle for readability at any brightness level
- **Cinematic Loading States:** Multi-phase cosmic animation for avatar generation with progress bar, elapsed timer, and rotating phase messages
- **Fluid Micro-Interactions:** Pulsing glow buttons, spring animations, selection glow effects, staggered reveals on discovery modals
- **Glassmorphic Modals:** Exploration results with backdrop blur, radial glow, spring entrance animations

### Platform Features
- Creator Dashboard, Live WebRTC, Production Console
- Wellness Games, Community, Blessings, Trade Circle
- Stripe subscriptions, Push notifications (PWA)
- Global Immersion Level toggle (Calm/Standard/Full)
- Split-screen multitasking, Share functionality

## Routes
- `/starseed-adventure` — CYOA RPG (nav to Realm, Multiverse, Avatar Creator)
- `/starseed-realm` — Multiplayer Realm
- `/starseed-worlds` — Multiverse (exploration, gems, equipment, crafting)
- `/spiritual-avatar` — Spiritual Avatar Creator
- `/bible` — Sacred Scriptures Library

## 3rd Party Integrations
- OpenAI GPT-4o, GPT Image 1, TTS/Whisper, Sora 2 — Emergent LLM Key
- Stripe Payments — Emergent Environment Test Key

## Upcoming / Backlog
- **P1:** Wire gem discoveries into single-player adventure story choices
- **P1:** Integrate equipment stat bonuses into boss battle combat
- **P1:** Starseed depth (more chapters, cross-origin unlockables)
- **P2:** Mobile App Store scaffolding (Capacitor)
- **P2:** VR Immersive modes completion
- **P2:** Avatar Showcase Gallery (community sharing + voting)
- **P3:** Refactoring large files (StarseedAdventure.js, StarseedRealm.js)

## Test Reports
- Iteration 117: Multiverse Realms + Spiritual Avatar Creator + Equipment System (100% pass)
- Iteration 116: Alliance Chat + Boss Encounters (18/18 backend)
- Iteration 115: Cosmic Realm (encounters, alliances, leaderboard)
- Iteration 114: Dashboard Scripture, Starseed Adventure RPG
- Iteration 113: Bible, Vision Mode, Immersion toggle
