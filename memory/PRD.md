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

### Interactive Cosmic Mood Ring (Mar 2026)
- **Clickable card**: Tapping the ring navigates to `/mood` Mood Tracker page
- **Quick Log panel**: 8 mood options (Happy, Peaceful, Energized, Grateful, Stressed, Anxious, Sad, Tired) with one-tap logging
- **Empty state CTA**: When no mood data, shows "Tap to log your mood and watch the ring come alive"
- **Visual feedback**: Hover glow, "Open Mood Tracker" hint on hover, animated orb
- **Auto-refresh**: Ring data refreshes after quick logging a mood

### Session Replay & Download (Mar 2026)
- **Auto-recording**: When live sessions end, chat log + guided commands are saved as recordings
- **Past Sessions tab**: Third tab on `/live` page showing recording cards with Replay and Download buttons
- **Replay Modal**: Full-screen modal with guided command timeline player (auto-plays with 4s intervals), chat sidebar, and step-by-step navigation
- **Download**: Export recordings as structured JSON files with session details, commands, and chat

### Scheduled Recurring Live Sessions (Mar 2026)
- Recurring series with recurrence patterns (Daily, Weekdays, Weekends, Weekly)
- Subscription system with push notifications
- Auto-spawn from templates within 15-minute window
- Tab UI, create modal with One-Time/Recurring toggle

### Live Sessions (Mar 2026)
- Browse & Create sessions, 8 session types, 6 virtual scenes
- Host controls with guided commands
- Avatar Circle, real-time chat + reactions via WebSocket (with REST fallback)

### SmartDock (Mar 2026)
- Vertical pill layout on right side of screen
- Panels (Sage, Mixer, Tones) open to the left

### Mood Insights, Crystal Pairing, Blessings, Creator Dashboard, Customizable Dashboard
- All previously documented features

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
