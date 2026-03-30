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
- Live Star Map — Canvas constellation with active player nodes
- Cross-Path Encounters — AI-generated shared scenes
- NPC Encounters — Named AI characters when no players online
- World Events — 7 rotating events every 6 hours with stat bonuses
- Leaderboard — Top players ranked by level with crowns
- Alliance System — Create/join (max 6 members)
- Alliance Chat — In-character messaging for alliance members
- Cooperative Boss Encounters — 5 cosmic bosses, 3-phase battles
  - Weakness/resistance system, NPC allies for solo play, XP rewards

### Multiverse Realms System (NEW)
- **4 Distinct Realms:** Astral Sanctum (Novice), Shadow Nexus (Veteran), Crystal Caverns (Expert), Void Between (Master)
- **Portal Unlock System:** Layered conditions (level + gems + story choices)
- **Exploration:** Discover gems, equipment, encounter enemies, gain XP
- **Realm-specific loot:** Unique gems and equipment per realm

### Cosmic Gem & Relic System (NEW)
- **15 Gem Types:** 6 Elemental, 6 Starseed (origin-specific), 3 Cosmic (legendary)
- **Discovery Methods:** Exploration, boss drops, secret locations
- **Gem Collection:** Per-character tracking with full catalog

### Full RPG Equipment System (NEW)
- **4 Slots:** Weapon, Armor, Accessory, Talisman
- **3 Equipment Sets:** Celestial Guardian, Void Walker, Starforged (2-piece and 4-piece set bonuses)
- **16 Equipment Items:** Including 4 standalone legendaries
- **Gem Sockets:** 1-3 sockets per item, socket/unsocket gems for bonus stats
- **Enchanting:** 3 enchantment types (Fortify, Attune, Awaken) using gems as fuel
- **Crafting:** 6 recipes to forge equipment and legendary gems from materials

### Spiritual Avatar Creator — Spore-Style (NEW)
- **6-Step Builder:** Base Form, Aura, Cosmic Features, Markings, Accessories, Background
- **48+ Customization Options:** 8 base forms, 8 auras, 12 cosmic features, 8 markings, 10 accessories, 8 backgrounds
- **Multi-Select Categories:** Mix and match up to 3-4 traits per category
- **Level-Gated Evolution:** Features unlock as character levels up (e.g., Third Eye at Lvl 3, Tentacles at Lvl 5)
- **AI Render:** GPT Image 1 generates composite portrait from selections
- **Profile Integration:** Generated avatar saved as profile picture across app
- **Download:** Users can download their avatar as PNG

### Platform Features
- Creator Dashboard, Live WebRTC, Production Console
- Wellness Games, Community, Blessings, Trade Circle
- Stripe subscriptions, Push notifications (PWA)
- Global Immersion Level toggle (Calm/Standard/Full)
- Split-screen multitasking, Share functionality

## Routes
- `/starseed-adventure` — CYOA RPG (with nav to Realm, Multiverse, Avatar Creator)
- `/starseed-realm` — Multiplayer Realm (map, bosses, alliances, chat, leaderboard)
- `/starseed-worlds` — Multiverse Realms (exploration, gems, equipment, crafting)
- `/spiritual-avatar` — Spiritual Avatar Creator (Spore-style builder)
- `/bible` — Sacred Scriptures Library

## 3rd Party Integrations
- OpenAI GPT-4o — Emergent LLM Key
- OpenAI GPT Image 1 — Emergent LLM Key
- OpenAI TTS (tts-1-hd) / Whisper STT — Emergent LLM Key
- Sora 2 Video Generation — Emergent LLM Key
- Stripe Payments — Emergent Environment Test Key

## Upcoming / Backlog
- **P1:** Starseed depth (more chapters, cross-origin unlockables)
- **P2:** Mobile App Store scaffolding (Capacitor)
- **P2:** VR Immersive modes completion
- **P3:** Refactoring large files (StarseedAdventure.js, StarseedRealm.js, Bible.js)

## Test Reports
- Iteration 113: Bible, Vision Mode, Immersion toggle
- Iteration 114: Dashboard Scripture, Starseed Adventure RPG
- Iteration 115: Cosmic Realm (encounters, alliances, leaderboard, world events)
- Iteration 116: Alliance Chat + Boss Encounters (18/18 backend, all frontend passed)
- Iteration 117: Multiverse Realms + Spiritual Avatar Creator + Equipment System (20/20 backend, all frontend 100%)
