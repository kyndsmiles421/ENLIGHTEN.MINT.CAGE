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

### Cosmic Realm — Multiplayer System
- **Live Star Map** — Canvas constellation with active player nodes
- **Cross-Path Encounters** — AI-generated shared scenes
- **NPC Encounters** — Named AI characters when no players online
- **World Events** — 7 rotating events every 6 hours with stat bonuses
- **Leaderboard** — Top players ranked by level with crowns
- **Alliance System** — Create/join (max 6 members)
- **Alliance Chat** — In-character messaging for alliance members *(NEW)*
- **Cooperative Boss Encounters** — 5 cosmic bosses, 3-phase battles *(NEW)*
  - The Void Leviathan (Epic, HP:300, Void)
  - The Entropy Weaver (Legendary, HP:400, Chaos)
  - The Fallen Archon (Epic, HP:350, Crystal-Shadow)
  - The Dream Parasite (Hard, HP:250, Psychic)
  - Zar'ghul the Star Devourer (Legendary, HP:450, Fire-Void)
  - Weakness/resistance system (1.5x/0.6x damage)
  - NPC allies for solo play, XP rewards, achievements

### Platform Features
- Creator Dashboard, Live WebRTC, Production Console
- Wellness Games, Community, Blessings, Trade Circle
- Stripe subscriptions, Push notifications (PWA)
- Global Immersion Level toggle (Calm/Standard/Full)
- Split-screen multitasking, Share functionality

## Routes
- `/starseed-adventure` — CYOA RPG
- `/starseed-realm` — Multiplayer Realm (map, bosses, alliances, chat, leaderboard)
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
- **P3:** Refactoring Bible.js, CosmicMixer.js

## Test Reports
- Iteration 113: Bible, Vision Mode, Immersion toggle
- Iteration 114: Dashboard Scripture, Starseed Adventure RPG
- Iteration 115: Cosmic Realm (encounters, alliances, leaderboard, world events)
- Iteration 116: Alliance Chat + Boss Encounters (18/18 backend, all frontend passed)
