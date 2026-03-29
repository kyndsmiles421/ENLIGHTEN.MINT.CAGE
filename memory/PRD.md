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

### SmartDock (NEW Mar 2026)
- Unified floating dock replaces 3 overlapping widgets (FloatingAssistant, QuickMeditationWidget, CosmicMixer)
- Bottom-right dock with Sage, Mixer, Tones icons
- No background dimming — panels open inline

### Cosmic Mixer Page (NEW Mar 2026)
- Full-page mixer at `/cosmic-mixer` with 5 audio layers

### Customizable Dashboard (NEW Mar 2026)
- "Customize" button enters edit mode to reorder/hide sections
- Pinned Shortcuts grid (phone-home-screen style)
- Persisted to MongoDB via `/api/dashboard/layout`

### Quick Reset Modal Fix (Mar 2026)
- Fixed invisible modal: glass-card bg was 3% opacity, replaced with solid dark background
- Fixed position:fixed breaking: `page-enter` animation used `transform: translateY(0)` which creates a containing block; changed to `transform: none`
- Applied createPortal for Landing page Quick Reset modal

### Dashboard (UPGRADED Mar 2026)
- Mini sparklines, Smart Suggestions, clickable stat cards
- 2x2 compact grid

### Help Center, Feedback, Community Comments (Mar 2026)
### Quick Reset (33 emotions + search)
### Star Chart (20 cultures, pinch zoom, culture-aware stories)
### Sacred Texts, Encyclopedia, Crystals (VR + TTS + AI Pairing)
### Blessings (AI + stats), Accessibility, Guided Tour, Myths & Legends
### All other features (40+ pages, AI Avatar, Cosmic Mixer, etc.)

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Known CSS Fix
- `.page-enter` keyframe must use `transform: none` (not `translateY(0)`) to avoid breaking `position: fixed` modals site-wide

## Backlog
- P1: Creator Dashboard (admin view for feedback, comments, usage analytics)
- P2: Capacitor mobile app build
- P3: Crystal Pairing share, Blessing notifications, Mood trends analytics
