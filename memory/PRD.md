# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (primary LLM via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor (native), Firebase (CI/CD)
- **Node**: v20 (default for services), v22 (Capacitor only via nvm)

## Core Architecture
```
/app/
├── backend/ (FastAPI on 0.0.0.0:8001, routed via /api prefix)
│   ├── server.py
│   ├── deps.py
│   ├── routes/ (75+ route files)
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

### Gemini AI Integration (Mar 2026)
- **Unified LLM Brain**: Migrated all core AI features to Gemini 3 Flash (`gemini-3-flash-preview`)
- **Cosmos Floating Assistant**: App-wide floating chat widget powered by Gemini, accessible from every page
  - Quick actions: Translation, Wellness guidance
  - Session management: Create, load, delete chat sessions
  - Persistent conversation history in MongoDB (`gemini_sessions`)
- **Endpoints migrated to Gemini**: `/api/gemini/chat`, `/api/gemini/translate`, `/api/gemini/sessions`
- **Coach (Sage)**: Spiritual Coach chat, Dream Oracle analysis, Voice Chat — all now use Gemini 3 Flash
- **AI Blend**: Mood-based frequency blending via Gemini
- **Translation**: Dynamic AI translation via Gemini (replaces OpenAI)

### Audio & Mixer (MAJOR — Feb 2026)
- **MixerContext (Global Audio Engine)**: Extracted from CosmicMixerPage into React Context for app-wide audio persistence
  - 15 Solfeggio/binaural frequencies with per-channel waveform selection
  - 11 ambient nature sounds (rain, ocean, wind, fire, etc.) with per-channel filter sweeps
  - 16 world instrument drones (sitar, tanpura, didgeridoo, etc.) with bandpass filters
  - 18 AI-voiced mantras across world traditions with voice morphing
  - 13-parameter Voice Morph Engine (pitch, formant, reverb, delay, chorus, distortion, EQ, stereo width)
  - Master bus: GainNode → AnalyserNode → DynamicsCompressor → Destination
  - Live waveform visualization (canvas + AnalyserNode)
  - getSnapshot/restoreSnapshot for session recording
- **SmartDock Mini Controls**: Live volume slider, mute toggle, active layer count, Stop All — accessible from any page
- **Session Recording (Soundscapes)**: Save/load/delete/share full mixer snapshots via /api/mixer-presets/sessions
- Mood Presets, Timed Sessions, Light Therapy, Haptic Vibration, Tempo Engine, Layer Crossfade, Master FX Bus

### Starseed & Multiverse Realms (Mar 2026)
- **Starseed Journey**: Choose-your-own-adventure with 8 star origins (Pleiadian, Sirian, Arcturian, etc.)
  - Branching narrative chapters with origin-specific endings
  - Soul frequency assignment, gift reveal, journey save/replay
- **Multiverse Realms**: 6 dimensional realms (Astral Garden, Crystal Caverns, Celestial Ocean, Solar Temple, Void Sanctum, Aurora Bridge)
  - Each realm activates unique soundscape via MixerContext (frequency + ambient + drone)
  - Visit tracking and stats

### Premium Tier Gating & Revenue (Feb 2026)
- Tier-Gated Features: `ai_frequency_blend`, `ai_translation`, `ai_coaching_blend` require Plus tier
- useGatedFeature() hook, Plus tier perks

### Multi-Language Support (Feb 2026)
- LanguageContext with 7 languages, AI Translation (Gemini), RTL support for Arabic

### VR & Native
- WebXR Virtual Reality scene with 3D Spatial Audio
- Capacitor native scaffolding, GitHub Actions CI/CD, PWA with Push Notifications

### UI/UX
- Draggable CosmicToolbar & SmartDock, Split View, Full Immersive mode

## Key DB Collections
- `gemini_sessions`: Cosmos assistant chat sessions
- `gemini_translations`: Cached AI translations
- `mixer_sessions`: Saved soundscapes with full snapshots
- `coach_sessions`: Spiritual Coach conversations
- `starseed_journeys`: Completed starseed adventure results
- `realm_visits`: Multiverse realm visit logs
- `users`, `user_profiles`, `trade_circle_listings`, `trade_circle_offers`

## Credentials
- Test user: kyndsmiles@gmail.com / password
- App URL: https://zen-energy-bar.preview.emergentagent.com

## Upcoming Tasks (Prioritized)

### P1 — Next
- Migrate remaining ~30 secondary LLM route files to Gemini 3 Flash (oracle, meditations, wellness, etc.)
- Add language preference persistence to user profile (sync across devices)
- Settings page language section

### P2 — Backlog
- Cooperative Boss Encounters (community meditation/frequency goals)
- Virtual Rock Hounding (gem resonance tie-in)
- Loot/Inventory System (manage gems & digital assets)
- Myths & Legends Encyclopedia
- Global Immersion Level Toggles

### P3 — Future
- Spore-like Spiritual Avatar Creator enhancements
- Gem Resonance engine
- AI Scene Recreations (Vision Mode)

## Refactoring Notes
- Backend `routes/` has overlapping starseed files (`starseed.py`, `starseed_adventure.py`, `starseed_realm.py`, `starseed_worlds.py`) — needs consolidation
