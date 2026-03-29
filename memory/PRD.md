# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js (Star Chart with UnrealBloomPass)
- **Backend**: FastAPI + Motor Async MongoDB
- **AI**: OpenAI GPT-4o, TTS tts-1-hd, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key in pod)
- **3D**: Three.js + UnrealBloomPass + EffectComposer
- **DnD**: @dnd-kit for draggable dashboard widgets
- **Sound**: Web Audio API synthesized interaction sounds + Celestial Ambient Soundscapes
- **Mobile**: Capacitor configured for App Store / Play Store wrapping

## All Implemented Features

### Core
- 6-Pillar Navigation, JWT Auth + Stripe, PWA, Accessibility

### Gaming-Level Star Chart
- UnrealBloomPass bloom, Milky Way band, 15k stars, camera momentum, 10 nebulae, constellation journey mode, 8 world cultures

### AI Avatar Generator
- **AI Manifestation tab**: Text description + 4 styles (Ethereal, Stylized, Realistic, Abstract) + Advanced Options (Element, Spirit Animal, Sacred Geometry, Aura Color) -> GPT Image 1 generation
- **Energy Builder tab**: Canvas-based manual avatar with body type, aura, pose, robe, glow, chakras, particles, energy trails
- **Avatar Gallery**: View all generated avatars, click to set any as active
- **Global Avatar Display**: Active avatar shown in Navigation profile button and Dashboard greeting area
- Backend endpoints: `/api/ai-visuals/generate-avatar`, `/api/ai-visuals/my-avatar`, `/api/ai-visuals/my-avatars`, `/api/ai-visuals/set-active-avatar`

### Context-Aware Human Voices (tts-1-hd)
- All 35 NarrationPlayer instances + 6 direct TTS calls pass `context` parameter
- 25+ voice-context mappings: Shimmer for meditation/breathing, Fable for star chart/oracle, Sage for coaching, Onyx for creation stories, Nova for knowledge/encyclopedia
- All backend TTS endpoints use `tts-1-hd` model

### AI & Voice
- Voice AI Sage, Sora 2 Video Gallery + Cinematic Intro Video, Monthly Soul Reports, OpenAI TTS mantras

### Immersive Visuals (Applied to ALL 60+ pages)
- Fluid mesh gradients, deep glassmorphism, page entrance animations, immersive-page class, cosmic scrollbars

### Ambient Audio
- Celestial Ambient Soundscapes: auto-adapting per page
- Global Sound Engine: Web Audio API synthesized clicks, hovers, success, error, whoosh, chime, open, close sounds

### Split Screen
- Side-by-side multitasking via fixed overlay panel, 26+ pages, resizable, collapsible

### Cosmic Mixer
- Floating panel with frequencies, ambient sounds, mantras, light therapy, haptic vibration
- **Fixed**: Backdrop dismiss (tap outside to close), auto-close on route change, no longer blocks buttons

### Dashboard
- Cosmic Mood Ring, draggable widgets, dynamic personalized dashboard, Growth Timeline, Avatar greeting

### Mobile App (Capacitor)
- `capacitor.config.ts` configured with app ID `com.cosmiccollective.app`
- Plugins: SplashScreen, StatusBar, Haptics, Keyboard, PushNotifications, Browser, Share
- Dark theme native background (#0B0C15) — no white flash
- Full guide at `frontend/MOBILE_APP_GUIDE.md`

### Content
- 40+ content pages: Meditation, Breathing, Divination, Journal, Crystals, Music, etc.

## Bug Fix Log
- **Blank screen bug**: Conflicting `.page-enter` CSS definitions. Fixed by removing old transition pattern.
- **Avatar generation bug**: `user["email"]` in ai_visuals.py. Fixed to use `user["id"]`.
- **Page dimming on auth**: `page-enter` animation started from opacity:0. Changed to 0.7 with faster 0.25s transition.
- **Guided Tour blocking**: Auto-launched on first visit covering entire page. Removed auto-launch.
- **Cosmic Mixer blocking buttons**: No backdrop dismiss, no auto-close. Added backdrop + route-change auto-close.

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Backlog
- **P2**: Refactor star_cultures.py — move data to MongoDB/JSON
