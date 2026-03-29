# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js (Star Chart with UnrealBloomPass)
- **Backend**: FastAPI + Motor Async MongoDB
- **AI**: OpenAI GPT-4o, TTS tts-1, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key in pod)
- **3D**: Three.js + UnrealBloomPass + EffectComposer
- **DnD**: @dnd-kit for draggable dashboard widgets
- **Sound**: Web Audio API synthesized interaction sounds + Celestial Ambient Soundscapes

## All Implemented Features

### Core
- 6-Pillar Navigation, JWT Auth + Stripe, PWA, Accessibility

### Gaming-Level Star Chart
- UnrealBloomPass bloom, Milky Way band, 15k stars, camera momentum, 10 nebulae, constellation journey mode, 8 world cultures

### AI Avatar Generator (NEW - Feb 2026)
- **AI Manifestation tab**: Text description input + 4 styles (Ethereal, Stylized, Realistic, Abstract) + Advanced Options (Element, Spirit Animal, Sacred Geometry, Aura Color) -> GPT Image 1 generation
- **Energy Builder tab**: Canvas-based manual avatar with body type, aura, pose, robe, glow, chakras, particles, energy trails
- **Avatar Gallery**: View all generated avatars, click to set any as active
- **Global Avatar Display**: Active avatar shown in Navigation profile button and Dashboard greeting area
- Backend: `/api/ai-visuals/generate-avatar`, `/api/ai-visuals/my-avatar`, `/api/ai-visuals/my-avatars`, `/api/ai-visuals/set-active-avatar`
- Context: `AvatarContext.js` provides avatar data globally via `useAvatar()`

### AI & Voice
- Voice AI Sage, Sora 2 Video Gallery + Cinematic Intro Video, Monthly Soul Reports, OpenAI TTS mantras

### Immersive Visuals (Applied to ALL 60+ pages)
- Fluid mesh gradients, deep glassmorphism, page entrance animations, immersive-page class, cosmic scrollbars

### Ambient Audio
- Celestial Ambient Soundscapes: auto-adapting per page (star-chart, meditation, breathing, divination, sanctuary, explore)
- Global Sound Engine: Web Audio API synthesized clicks, hovers, success, error, whoosh, chime, open, close sounds

### Split Screen
- Side-by-side multitasking via fixed overlay panel, 26+ pages, resizable, collapsible

### Dashboard
- Cosmic Mood Ring, draggable widgets, dynamic personalized dashboard, Growth Timeline, Avatar greeting

### Content
- 40+ content pages: Meditation, Breathing, Divination, Journal, Crystals, Music, etc.

## Critical Bug Fix Log
- **Blank screen bug**: Conflicting `.page-enter` CSS definitions (opacity:0 base + animation). Fixed by removing old transition pattern.
- **Avatar generation bug**: `user["email"]` referenced in `ai_visuals.py` but JWT only contains `id` and `name`. Fixed to use `user["id"]` for DB lookups.

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com

## Backlog
- **P2**: Refactor star_cultures.py — move data to MongoDB/JSON
