# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js
- **Backend**: FastAPI + Motor Async MongoDB
- **AI**: OpenAI GPT-4o, TTS tts-1-hd, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key in pod)
- **3D**: Three.js + UnrealBloomPass + EffectComposer
- **Mobile**: Capacitor configured

## All Implemented Features

### Dashboard (UPGRADED Mar 2026)
- **Mini sparklines** on stat cards (7-day trend graphs for moods, journals, activity)
- **Smart Suggestions** — personalized next-steps based on user activity
- Stat cards navigate: Streak→Growth Timeline, Moods→Mood Tracker, Journal→Journal, Games→Games
- 2x2 compact grid, "?" help button, no auto-blocking walkthrough

### Floating AI Assistant (NEW Mar 2026)
- **"?" button** visible on every page (except auth)
- Opens Sage AI Coach mini-chat panel with session management
- Quick action buttons: Help Center, Submit Feedback, Quick Reset

### Help Center (NEW Mar 2026)
- **FAQs** — 12 questions with search + category filters + accordion
- **Guides** — 9 feature tutorials with direct navigation
- **Contact** — links to AI Coach and Feedback form

### Feedback & Suggestions (NEW Mar 2026)
- **Submit feedback** — type (Suggestion/Feedback/Bug/Question) + category + message
- **History** — view your submitted feedback with status
- **Creator dashboard** — creator email sees all feedback

### Community Comments (NEW Mar 2026)
- **Reusable component** — integrated on Crystals and Blessings pages
- Post comments, like comments, expand/collapse thread
- Per-feature comment threads

### Quick Reset (33 emotions + search)
### Star Chart (20 cultures, pinch zoom, culture-aware stories/journey)
### Sacred Texts, Encyclopedia, Crystals (VR + TTS + AI Pairing)
### Blessings (AI + stats), Accessibility, Guided Tour, Myths & Legends
### All other features (40+ pages, AI Avatar, Cosmic Mixer, etc.)

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Backlog
- No P0/P1 remaining
- P2: Capacitor mobile app build
- P3: Crystal Pairing share, Blessing notifications, Mood trends
