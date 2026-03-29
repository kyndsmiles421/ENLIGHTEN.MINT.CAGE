# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js (Star Chart with UnrealBloomPass)
- **Backend**: FastAPI + Motor Async MongoDB
- **AI**: OpenAI GPT-4o, TTS tts-1, Sora 2, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key in pod)
- **3D**: Three.js + UnrealBloomPass + EffectComposer
- **DnD**: @dnd-kit for draggable dashboard widgets
- **Sound**: Web Audio API synthesized interaction sounds

## All Implemented Features

### Core
- 6-Pillar Navigation, JWT Auth + Stripe, PWA, Accessibility

### Gaming-Level Star Chart
- UnrealBloomPass bloom, Milky Way band, 15k stars, camera momentum, 10 nebulae, constellation journey mode, 8 world cultures

### AI & Voice
- Voice AI Sage, Sora 2 Video Gallery + Cinematic Intro Video, Monthly Soul Reports, OpenAI TTS mantras

### Immersive Visuals (Applied to ALL 60+ pages)
- Fluid mesh gradients, deep glassmorphism, page entrance animations, immersive-page class, cosmic scrollbars

### Global Sound Engine
- Web Audio API synthesized clicks, hovers, success, error, whoosh, chime, open, close sounds

### Split Screen
- Side-by-side multitasking via fixed overlay panel, 26+ pages, resizable, collapsible

### Dashboard
- Cosmic Mood Ring, draggable widgets, dynamic personalized dashboard, Growth Timeline

### Content
- 40+ content pages: Meditation, Breathing, Divination, Journal, Crystals, Music, etc.

## Critical Bug Fix Log
- **Blank screen bug**: Conflicting `.page-enter` CSS definitions (opacity:0 base + animation). Fixed by removing old transition pattern.

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com

## Backlog
- **P2**: Refactor star_cultures.py — move data to MongoDB/JSON
