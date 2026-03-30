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
- Quantum Coherence measurement, Sleep tracking, Gratitude journal
- Acupressure, Energy healing, Reiki
- Nutrition tracking, Recipe finder, Herbal remedies

### Divination & Spirituality
- Oracle/Tarot readings, Rune casting, I-Ching
- Numerology, Palmistry, Crystal ball, Pendulum
- Animal totems, Creation stories (120+ across 20 civilizations)
- 3D Star Chart with AI astrology readings

### Sacred Scriptures Library (136 books)
- Bible (66 books), Quran (114 surahs), Torah (5 books)
- Kabbalah (Zohar + Sefer Yetzirah), Lost Books (50+ texts)
- AI-powered chapter summaries with Retelling, Key Verses, Commentary
- **Vision Mode** — animated canvas AI scene recreations
- **Guided Scripture Journeys** — cross-tradition reading paths

### Starseed Choose Your Own Adventure RPG *(NEW)*
- 6 Starseed Origins: Pleiadian, Sirian, Arcturian, Lyran, Andromedan, Orion
- AI-powered branching narrative (GPT-4o dynamic story generation)
- RPG stats: Wisdom, Courage, Compassion, Intuition, Resilience
- XP system, leveling, chapter progression, achievements
- AI-generated scene artwork (GPT Image 1) with fallback stock backgrounds
- Cinematic cosmic canvas background (stars, nebulas, shooting stars)
- Immersion-level aware (respects Calm/Standard/Full toggle)

### Platform Features
- Creator Dashboard, Live WebRTC sessions, Production Console
- Wellness Games (Sacred Symbols, Breath of Life, etc.)
- Community, Blessings, Trade Circle marketplace
- Stripe subscription system, Push notifications (PWA)
- Global Immersion Level toggle (Calm/Standard/Full) for accessibility
- Split-screen multitasking, Share functionality

### Dashboard Integration
- Sacred Scriptures section with chapters read, active journeys, continue reading
- Smart suggestions engine with scripture and journey recommendations
- Starseed Adventure shortcut in Explore actions

## 3rd Party Integrations
- OpenAI GPT-4o — Emergent LLM Key
- OpenAI TTS (tts-1-hd) / Whisper STT — Emergent LLM Key
- OpenAI GPT Image 1 — Emergent LLM Key
- Sora 2 Video Generation — Emergent LLM Key
- Stripe Payments — Emergent Environment Test Key

## Upcoming / Backlog
- **P1:** Starseed adventure enhancements (more chapters, cross-origin interactions)
- **P2:** Mobile App Store scaffolding (Capacitor native builds)
- **P2:** VR Immersive modes completion
- **P2:** Refactoring Bible.js (extract ChapterReader), CosmicMixer.js

## Key Architecture Notes
- Immersion Levels: Any visual effects MUST check `useSensory()` values
- AI Text: Bible reader expects markdown headers (## Retelling, ## Key Verses, ## Commentary)
- Sacred Scriptures route: `/bible` (contains all traditions)
- Starseed Adventure route: `/starseed-adventure`
