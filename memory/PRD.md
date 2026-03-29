# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js
- **Backend**: FastAPI + Motor Async MongoDB + WebSockets
- **AI**: OpenAI GPT-4o, TTS tts-1-hd, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key in pod)
- **Mobile**: Capacitor configured

## Implemented Features

### SmartDock: Minimize + Drag + Persist (Mar 2026)
- **Fully minimizable**: Dock collapses to a small sparkle dot; tap to restore
- **Draggable**: Grip handle at top allows repositioning anywhere on screen
- **Position persistence**: Both position and minimized state saved to localStorage
- **Smart border-radius**: Adjusts from flat-edge to fully rounded when moved away from screen edge
- **Vertical pill layout**: Icons for Sage, Mixer, Tones, Feedback, Help

### Interactive Cosmic Mood Ring (Mar 2026)
- **Clickable card**: Tapping navigates to `/mood` Mood Tracker page
- **Quick Log panel**: 8 moods (Happy, Peaceful, Energized, Grateful, Stressed, Anxious, Sad, Tired) with one-tap logging
- **Empty state CTA**: Shows prompt when no mood data exists
- **Auto-refresh**: Ring data refreshes after quick logging

### Session Replay & Download (Mar 2026)
- **Auto-recording**: Chat + commands saved when sessions end
- **Past Sessions tab**: Third tab on `/live` with Replay and Download buttons
- **Replay Modal**: Command timeline auto-player + chat sidebar
- **Download**: Export as structured JSON files

### Scheduled Recurring Live Sessions (Mar 2026)
- Recurring series (Daily, Weekdays, Weekends, Weekly) with subscriptions + push notifications
- Auto-spawn from templates, tab UI, One-Time/Recurring toggle

### Live Sessions, Mood Insights, Crystal Pairing, Blessings, Creator Dashboard, Customizable Dashboard
- All previously documented and tested

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Backlog
- P2: Trade Circle barter marketplace
- P2: Stripe subscription system
- P2: Virtual Rock Hounding
- P2: Mobile App Store scaffolding (Capacitor)
- P2: Myths & Legends encyclopedia
- P2: Sacred Texts Audiobook Reader
- P2: Music Lounge enhancements
- P3: AI Avatar Generator enhancements
- P3: Split Screen Multitasking
- P3: VR Immersive modes

## Critical Implementation Notes
- **Modals & Overlays**: Always use `createPortal(document.body)` — Framer Motion page transitions break `position: fixed` centering.
- **WebSockets**: Kubernetes ingress may block `wss://` — LiveRoom has REST polling fallback.
- **MongoDB**: Exclude `_id` from all responses. Use `datetime.now(timezone.utc)` for timestamps.
