# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (unified LLM via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor (native)
- **Node**: v20 (default for services), v22 (Capacitor only via nvm)

## Core Architecture
```
/app/
├── backend/ (FastAPI on 0.0.0.0:8001, routed via /api prefix)
│   ├── server.py, deps.py
│   ├── routes/ (75+ route files — ALL unified under Gemini 3 Flash)
│   └── tests/
├── frontend/ (React on port 3000)
│   ├── src/
│   │   ├── context/ (Auth, Avatar, Credit, Language, MixerContext, Sensory, Tempo, VoiceCommand, useGatedFeature)
│   │   ├── pages/ (~42 pages)
│   │   ├── components/ (CosmicToolbar, SmartDock, CosmicAssistant, TrialBanner, ui/)
│   │   └── App.js
│   └── public/ (sw.js, manifest.json)
└── memory/PRD.md
```

## What's Been Implemented

### 7-Day Free Plus Trial (Mar 31, 2026) — NEW
- **Auto-activated on registration**: New users get Plus tier, 300 credits, 7-day trial
- **Trial info in API**: `/api/subscriptions/my-plan` returns trial.active, trial.days_left, trial.expires_at
- **Auto-expiry**: `get_user_credits()` checks trial_expires_at and auto-downgrades to free tier
- **Feature access during trial**: `check-access` returns `is_trial: true` with `trial_days_left`
- **TrialBanner component**: Shows on Dashboard with urgency state (normal vs last 2 days)
- **Admin bypass**: Admin users (role=admin) are not affected by trial logic

### Gemini AI — Unified Brain (Mar 31, 2026) — NEW
- **ALL ~35 LlmChat instances migrated to Gemini 3 Flash** (`gemini-3-flash-preview`)
- **Context-Aware Cosmos Floating Assistant**: 26-page context map, detects current page, tailors greetings + AI responses
- **Endpoints**: `/api/gemini/chat`, `/api/gemini/translate`, `/api/gemini/sessions`, `/api/gemini/sessions/{id}`
- **Latency**: Coach ~2.8s, Cosmos ~2.4s, Translation ~1s — all well within acceptable range

### Core Platform
- Full auth (JWT), user profiles, dashboard, wellness tracking
- AI Coach (spiritual/wellness modes, dream oracle, voice chat)
- Star Chart astrology with 20 global cultures
- Oracle, Numerology, Cardology divination systems
- Sacred Texts reader with virtualized lists
- Trade Circle barter marketplace with Trust Scores
- Gamification, achievements, daily challenges
- Starseed Journey (8 origins, branching narrative)
- Multiverse Realms (6 dimensional realms with MixerContext soundscapes)

### Audio & Mixer
- MixerContext (Global Audio Engine via React Context)
- SmartDock Mini Controls, Session Recording (Soundscapes)
- Mood Presets, Timed Sessions, Light Therapy, Haptic Vibration, Tempo Engine

### Premium Tier Gating & Revenue
- 5 tiers: Free, Starter ($4.99), Plus ($9.99), Premium ($24.99), Super User ($49.99)
- Stripe checkout for subscriptions + credit packs
- useGatedFeature() hook + TrialBanner

### Multi-Language Support
- LanguageContext with 7 languages, Gemini-powered AI Translation, RTL for Arabic

### VR & Native
- WebXR Virtual Reality, Capacitor native scaffolding, PWA with Push Notifications

## Key DB Collections
- `user_credits`: Tier, balance, trial info (trial_active, trial_started_at, trial_expires_at)
- `gemini_sessions`: Cosmos assistant chat sessions
- `gemini_translations`: Cached AI translations
- `mixer_sessions`: Saved soundscapes
- `coach_sessions`: Spiritual Coach conversations

## Credentials
- Admin: kyndsmiles@gmail.com / password
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

## Architecture Rules
- **Audio**: NEVER instantiate `new AudioContext()` in components — always use `useMixer()`
- **AI**: ALL LLM calls use `.with_model("gemini", "gemini-3-flash-preview")`
- **Trial**: Auto-expiry checked in `get_user_credits()` — no cron job needed
