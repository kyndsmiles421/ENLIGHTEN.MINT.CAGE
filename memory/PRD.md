# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: OpenAI GPT-4o (Emergent LLM Key), OpenAI TTS, Stripe, Capacitor (native), Firebase (CI/CD)
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
│   │   ├── pages/ (~40 pages)
│   │   ├── components/ (CosmicToolbar, SmartDock, ui/)
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
- Mood Presets (5 curated combos), Timed Sessions (4 multi-phase journeys)
- Light Therapy overlays, Haptic Vibration feedback
- Tempo Engine with LFO modulation, tap tempo, presets
- Layer Crossfade controls, Master FX Bus

### Instant Frequency Play (Feb 2026)
- Dashboard recommendations & suggestions include `action: play_frequency` + `frequency_hz` fields
- MOOD_FREQUENCY_MAP maps 10 moods to healing frequencies (e.g. anxious→417Hz, happy→528Hz)
- Dashboard "For You" and "Suggested for You" sections play frequencies instantly on click via MixerContext
- Frequencies page rewired to use MixerContext (audio persists across navigation, no more isolated AudioContext)
- All quick widgets now action-first: click = do the thing, not just navigate

### Premium Tier Gating & Revenue Infrastructure (Feb 2026)
- **Tier-Gated Features**: `ai_frequency_blend`, `ai_translation`, `ai_coaching_blend` require Plus tier ($9.99/mo)
- **useGatedFeature() hook**: Reusable frontend gate check with upgrade toast + navigate to /pricing
- **Plus tier perks updated**: AI-Personalized Frequency Blends, AI-Powered Content Translation, AI Coaching Sound Blends

### AI-Personalized Frequency Blend (Feb 2026)
- `POST /api/mixer/ai-blend`: Analyzes user's 7-day mood journal history
- **Free users**: Algorithmic blend (rule-based mood→frequency mapping, instant, no credit cost)
- **Plus+ users**: GPT-4o deep analysis of emotional patterns → custom multi-layer blend with poetic name + insight
- Auto-loads the blend into the Mixer (frequencies + sounds + drone activate instantly)
- UI: "AI Frequency Blend" accordion section on Cosmic Mixer page with Generate button, result panel with tags

### Multi-Language Support (Feb 2026)
- **LanguageContext** with 7 languages: English, Spanish, French, Hindi, Japanese, Arabic, Portuguese
- **Static translations (Free)**: 60+ UI keys translated for nav, common actions, mixer, dashboard, auth, pricing
- **AI Translation endpoint** (`POST /api/translate`): GPT-4o dynamic content translation, Plus-tier gated, cached in MongoDB
- **Language selector**: Globe icon in SmartDock with panel showing all 7 languages, saves to localStorage
- RTL support for Arabic (`document.documentElement.dir`)

### VR & Native
- WebXR Virtual Reality scene with 3D Spatial Audio and Gaze Interaction Reticle
- Capacitor native scaffolding (Android/iOS), app icons & splash screens
- GitHub Actions CI/CD for Firebase App Distribution
- PWA with Push Notifications (VAPID keys, service worker)

### UI/UX
- Draggable CosmicToolbar & SmartDock with collision management, dynamic z-index
- Minimizable toolbar, safe default positions
- Split View multitasking, Full Immersive mode

## Key DB Collections
- `mixer_sessions`: Saved soundscapes with full snapshots
- `mixer_presets`: Curated and user-created mixer presets
- `mixer_playlists`: Multi-step journey playlists
- `trade_circle_listings`, `trade_circle_offers`: Marketplace with handshakes
- `user_profiles`: Trust scores, achievements, preferences

## Credentials
- Test user: kyndsmiles@gmail.com / password
- App URL: https://zen-energy-bar.preview.emergentagent.com

## Upcoming Tasks (Prioritized)
### P1 — Next
- Apply `useLanguage().t()` translations to more pages (Dashboard, Mixer, Settings, Pricing)
- Add language preference to user profile (persist across devices via backend)
- Settings page language section

### P1 — Backlog
- Starseed Choose Your Own Adventure module
- Multiverse Realms integration

### P2 — Future
- Cooperative Boss encounters
- Loot/Inventory system & Virtual Rock Hounding
- Global Immersion Level toggles
- Spore-like Spiritual Avatar Creator enhancements
- Gem Resonance engine
- Myths & Legends encyclopedia
