# The Cosmic Collective — Product Requirements Document

## Vision
A highly immersive full-stack wellness platform blending wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Canvas API, Shadcn/UI
- **Backend:** FastAPI, Motor Async MongoDB
- **AI:** GPT-4o (text), GPT Image 1 (images), OpenAI TTS/Whisper, Sora 2
- **Payments:** Stripe | **Auth:** JWT-based

## Core Features Implemented

### Wellness & Divination
- Mood tracking, Journaling, Breathing, Meditation, Yoga, Quantum Coherence, Sleep, Gratitude, Acupressure, Energy healing, Reiki, Nutrition, Recipes, Herbal remedies
- Oracle/Tarot, Runes, I-Ching, Numerology, Palmistry, Crystal ball, Pendulum, Animal totems, Creation stories (120+), 3D Star Chart

### Sacred Scriptures Library (136 books)
- Bible (66), Quran (114), Torah (5), Kabbalah (2+), Lost Books (50+)
- AI chapter summaries, Vision Mode, Guided Scripture Journeys

### Starseed Choose Your Own Adventure RPG
- 6 Origins, AI branching narrative, RPG stats, XP/leveling, achievements
- AI-generated scene artwork (GPT Image 1), Cinematic cosmic canvas
- Boss Loot Drops, Inventory System, Simple Avatar Generation
- **Gem-Gated Narrative Branches (Resonance System):** Equipped gems unlock hidden story paths (Water → peaceful aquatic dialogue, Shadow → shortcuts, etc.)

### Cosmic Realm — Multiplayer System
- Live Star Map, Cross-Path Encounters, NPC Encounters, World Events
- Leaderboard, Alliance System with Chat
- Cooperative Boss Encounters (5 bosses, 3-phase battles)
- **Equipment Combat Integration:** Damage = (Base + Equipment Bonus) × Resonance Multiplier. Socketed gems provide visual glow. Set bonuses grant special abilities (Star Strike, Void Step, Portal Sight)

### Multiverse Realms System
- 4 Realms: Astral Sanctum, Shadow Nexus, Crystal Caverns, Void Between
- Portal Unlock (level + gems + story choices), Exploration, Realm-specific loot

### Gem & Equipment System
- 15 Gem Types (6 Elemental, 6 Starseed, 3 Cosmic), 16 Equipment Items, 3 Sets
- 4 Slots, Gem Sockets, Enchanting (Fortify/Attune/Awaken), 6 Crafting Recipes

### Spiritual Avatar Creator — Spore-Style
- 6-Step Builder: Base Form, Aura, Cosmic Features, Markings, Accessories, Background
- 48+ Options, Multi-Select, Level-Gated Evolution, AI Render (GPT Image 1)
- Cinematic Generation Animation, Profile Integration, PNG Download

### Avatar Showcase Gallery (NEW)
- Community gallery with "Radiate" cosmic upvoting (energy glow on thumbnails)
- Attribute filtering by Base Form and Aura
- "View Traits" one-tap inspiration (shows all 6 category selections)
- Publish from Avatar Creator, sort by Most Radiated/Recent
- Self-radiate protection, pagination

### Platform Features
- Creator Dashboard, Live WebRTC, Production Console, Wellness Games
- Stripe subscriptions, Push notifications (PWA), Global Immersion toggle
- Split-screen, Typography contrast enhancements, Cinematic loading states

## Routes
- `/starseed-adventure` — CYOA RPG | `/starseed-realm` — Multiplayer
- `/starseed-worlds` — Multiverse | `/spiritual-avatar` — Avatar Creator
- `/avatar-gallery` — Showcase Gallery | `/bible` — Scriptures

## 3rd Party Integrations
- OpenAI GPT-4o, GPT Image 1, TTS/Whisper, Sora 2 — Emergent LLM Key
- Stripe — Emergent Environment Test Key

## Test Reports
- Iteration 118: Avatar Gallery + Gem Resonance + Combat Integration (100% backend/frontend)
- Iteration 117: Multiverse + Avatar Creator + Equipment (100%)
- Iteration 116: Alliance Chat + Boss Encounters
- Iteration 115: Cosmic Realm | 114: Dashboard/Adventure | 113: Bible/Vision Mode

## Upcoming / Backlog
- **P1:** Cross-origin unlockables (achievements carry between origins)
- **P1:** Starseed depth (more chapters, storylines)
- **P2:** Mobile App Store scaffolding (Capacitor)
- **P2:** VR Immersive modes completion
- **P3:** Refactoring large files
