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
- Mood tracking, Journaling, Breathing exercises, Meditation, Yoga
- Quantum Coherence, Sleep tracking, Gratitude journal
- Acupressure, Energy healing, Reiki
- Nutrition tracking, Recipe finder, Herbal remedies

### Divination & Spirituality
- Oracle/Tarot, Rune casting, I-Ching, Numerology, Palmistry
- Crystal ball, Pendulum, Animal totems, Creation stories (120+)
- 3D Star Chart with AI astrology readings

### Sacred Scriptures Library (136 books)
- Bible (66), Quran (114), Torah (5), Kabbalah (2+), Lost Books (50+)
- AI chapter summaries, Vision Mode (canvas scene recreations)
- Guided Scripture Journeys (cross-tradition reading paths)

### Starseed Choose Your Own Adventure RPG
- 6 Origins: Pleiadian, Sirian, Arcturian, Lyran, Andromedan, Orion
- AI branching narrative (GPT-4o), RPG stats, XP/leveling, achievements
- AI-generated scene artwork (GPT Image 1)
- Cinematic cosmic canvas background (stars, nebulas, shooting stars)
- Routes: `/starseed-adventure`

### Cosmic Realm — Multiplayer System *(NEW)*
- **Live Star Map** — Canvas-rendered constellation showing active player nodes
- **Cross-Path Encounters** — AI-generated shared scenes when two starseeds meet
- **NPC Encounters** — When no other players online, encounter named AI characters
- **World Events** — 7 rotating cosmic events every 6 hours with stat bonuses
- **Leaderboard** — Top players ranked by level with crown badges
- **Alliance System** — Create/join cosmic alliances (max 6 members)
- **Encounter History** — Track past encounters and achievements
- Routes: `/starseed-realm`

### Platform Features
- Creator Dashboard, Live WebRTC, Production Console
- Wellness Games, Community, Blessings, Trade Circle
- Stripe subscriptions, Push notifications (PWA)
- Global Immersion Level toggle (Calm/Standard/Full)
- Split-screen multitasking, Share functionality

### Dashboard Integration
- Sacred Scriptures section with chapters/journeys stats, continue reading
- Smart suggestions engine with scripture and journey recommendations
- Starseed Adventure + Cosmic Realm shortcuts in Explore grid

## 3rd Party Integrations
- OpenAI GPT-4o — Emergent LLM Key
- OpenAI TTS (tts-1-hd) / Whisper STT — Emergent LLM Key
- OpenAI GPT Image 1 — Emergent LLM Key
- Sora 2 Video Generation — Emergent LLM Key
- Stripe Payments — Emergent Environment Test Key

## Key Architecture
- Immersion Levels: Visual effects MUST check `useSensory()` values
- AI Text: Bible reader expects markdown headers
- Sacred Scriptures: `/bible` route, Starseed: `/starseed-adventure`, Realm: `/starseed-realm`

## Upcoming / Backlog
- **P1:** Starseed enhancements (more chapters, cross-origin interactions)
- **P2:** Mobile App Store scaffolding (Capacitor)
- **P2:** VR Immersive modes completion
- **P2:** Refactoring Bible.js, CosmicMixer.js

## Test Reports
- Iteration 113: Bible, Vision Mode, Immersion toggle
- Iteration 114: Dashboard Scripture integration, Starseed Adventure RPG
- Iteration 115: Cosmic Realm multiplayer (encounters, alliances, leaderboard, world events)
