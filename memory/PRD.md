# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (unified LLM via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor (native), Firebase (CI/CD)
- **Node**: v20 (default for services), v22 (Capacitor only via nvm)

## Core Architecture
```
/app/
├── backend/ (FastAPI on 0.0.0.0:8001, routed via /api prefix)
│   ├── server.py
│   ├── deps.py
│   ├── routes/ (75+ route files — ALL unified under Gemini 3 Flash)
│   └── tests/
├── frontend/ (React on port 3000)
│   ├── src/
│   │   ├── context/ (Auth, Avatar, Credit, Language, MixerContext, Sensory, Tempo, VoiceCommand)
│   │   ├── pages/ (~42 pages)
│   │   ├── components/ (CosmicToolbar, SmartDock, CosmicAssistant, ui/)
│   │   └── App.js
│   └── public/ (sw.js, manifest.json)
├── .github/workflows/build.yml (CI/CD)
└── memory/PRD.md
```

## What's Been Implemented

### Core Platform
- Full auth (JWT), user profiles, dashboard, wellness tracking
- AI Coach (spiritual/wellness modes with session history)
- Star Chart astrology with 20 global cultures
- Oracle, Numerology, Cardology divination systems
- Sacred Texts reader with virtualized lists (react-window)
- Trade Circle barter marketplace with Trust Scores & Cosmic Handshakes
- Gamification, achievements, daily challenges
- Community features, social sharing

### Gemini AI Integration — Unified Brain (Mar 2026)
- **ALL ~35 LlmChat instances across the entire codebase migrated to Gemini 3 Flash** (`gemini-3-flash-preview`)
- **Cosmos Floating Assistant**: Context-aware floating chat widget powered by Gemini, accessible from every page
  - **26-page context map**: Detects which page the user is on and tailors greetings + responses
  - Page-specific quick actions that change dynamically
  - Session management: Create, load, delete chat sessions
  - Persistent conversation history in MongoDB (`gemini_sessions`)
- **Context-Aware AI**: Backend injects page context into Gemini system prompt for relevant guidance
- **Endpoints**: `/api/gemini/chat`, `/api/gemini/translate`, `/api/gemini/sessions`, `/api/gemini/sessions/{id}`
- **Routes migrated**: coach.py, ai_blend.py, translation.py, oracle.py, meditations.py, wellness.py, sacred_texts.py, bible.py, forecasts.py, crystals.py, harmonics.py, encyclopedia.py, creation_stories.py, akashic.py, starseed_adventure.py, starseed_realm.py, dynamic.py, nature.py, teachings.py, meals.py, reiki.py, voice_command.py, blessings.py, media.py, knowledge.py, astrology_reading.py

### Starseed & Multiverse Realms (Mar 2026)
- **Starseed Journey**: Choose-your-own-adventure with 8 star origins
- **Multiverse Realms**: 6 dimensional realms with immersive soundscapes via MixerContext
- **Starseed Sub-Systems**: Character creation, scene generation, inventory, boss encounters, multiplayer realm mechanics, world exploration, gem/equipment crafting
- Dashboard quick actions link to Multiverse Realms and Starseed Journey

### Audio & Mixer (Feb 2026)
- **MixerContext (Global Audio Engine)**: App-wide audio persistence via React Context
- SmartDock Mini Controls, Session Recording (Soundscapes), Mood Presets, Timed Sessions
- Light Therapy, Haptic Vibration, Tempo Engine, Layer Crossfade, Master FX Bus

### Premium Tier Gating & Revenue (Feb 2026)
- Tier-Gated Features, useGatedFeature() hook, Stripe integration

### Multi-Language Support (Feb 2026)
- LanguageContext with 7 languages, AI Translation (Gemini), RTL support for Arabic

### VR & Native
- WebXR Virtual Reality, Capacitor native scaffolding, PWA with Push Notifications

### UI/UX
- Draggable CosmicToolbar & SmartDock, Split View, Full Immersive mode

## Key DB Collections
- `gemini_sessions`: Cosmos assistant chat sessions
- `gemini_translations`: Cached AI translations
- `mixer_sessions`: Saved soundscapes
- `coach_sessions`: Spiritual Coach conversations
- `starseed_journeys`: Completed adventure results
- `realm_visits`: Multiverse realm visit logs

## Credentials
- Test user: kyndsmiles@gmail.com / password
- App URL: https://zen-energy-bar.preview.emergentagent.com

## Upcoming Tasks (Prioritized)

### P1 — Next
- Cooperative Boss Encounters (community meditation/frequency goals)
- Loot/Inventory System (manage gems & digital assets)

### P2 — Backlog
- Virtual Rock Hounding (gem resonance tie-in)
- Myths & Legends Encyclopedia
- Global Immersion Level Toggles
- Language preference persistence to user profile

### P3 — Future
- Spore-like Spiritual Avatar Creator enhancements
- Gem Resonance engine
- AI Scene Recreations (Vision Mode)

## Architecture Notes
- **Audio Rule**: NEVER instantiate `new AudioContext()` in components — always use `useMixer()`
- **AI Rule**: ALL LLM calls go through `gemini-3-flash-preview` via `.with_model("gemini", "gemini-3-flash-preview")`
- **Starseed Files**: 4 separate files by concern (core, characters, multiplayer, exploration) — intentionally separated, not consolidated
