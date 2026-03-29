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

### Scheduled Recurring Live Sessions (NEW Mar 2026)
- **Recurring series**: Hosts can create recurring session templates with recurrence patterns (Daily, Weekdays, Weekends, Weekly)
- **Subscription system**: Users subscribe to recurring series and receive push notifications before sessions start
- **Auto-spawn**: Backend endpoint spawns scheduled sessions from recurring templates within a 15-minute window
- **Tab UI**: Live Sessions page now has "Live & Upcoming" and "Recurring Schedule" tabs
- **Create modal**: One-Time / Recurring toggle with recurrence options, day-of-week picker (weekly), and UTC time picker
- **Recurring cards**: Show recurrence badge, subscriber count, host info, next occurrence date

### Live Sessions (Mar 2026)
- **Browse & Create**: `/live` page with session cards (Live Now / Upcoming / Session Types)
- **8 session types**: Group Meditation, Yoga Flow, Breathwork Circle, Sound Bath, Mantra Chanting, Prayer Circle, Qigong Practice, Open Circle
- **6 virtual scenes**: Cosmic Temple, Zen Garden, Ocean Shore, Mountain Peak, Sacred Fire, Northern Lights
- **Host controls**: Start/End session, guided commands (Begin, Breathe In/Out, Hold, Focus, Release, Om, End)
- **Avatar Circle**: Users' AI avatars arranged in a circle with glowing rings and gentle floating animation
- **Real-time chat + reactions**: WebSocket-powered (with REST fallback)
- **Scene backgrounds**: Ambient particle effects matching each virtual environment
- **Session lifecycle**: Scheduled -> Active -> Ended, host-only control

### SmartDock (Mar 2026)
- Vertical pill layout on right side of screen
- No longer blocks bottom content (Sacred Symbols, etc.)
- Panels (Sage, Mixer, Tones) open to the left
- Expand/collapse for 5+ items

### Mood Insights & Trends (Mar 2026)
- AI weekly emotional summary (GPT-4o)
- Stats: Day Streak, Total Logged, Avg Intensity
- Most Frequent Emotions breakdown, Weekly activity chart

### Crystal Pairing Share (Mar 2026)
- Share button (Web Share API + clipboard fallback)
- Public share endpoint

### Blessing Notifications (Mar 2026)
- In-app notifications + push when receiving a blessing
- Notification inbox in nav bell with unread badge

### Creator Dashboard (Mar 2026)
- Admin-only: Total users, active users, PWA installs, feedback management, comments moderation

### Customizable Dashboard, Bug Fixes (Mar 2026)
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
- P3: Live session recording/replay
- P3: AI-generated guided meditation audio for sessions

## Critical Implementation Notes
- **Modals & Overlays**: Always use `createPortal(document.body)` for fixed overlays — Framer Motion `page-enter` transforms break `position: fixed` centering.
- **WebSockets**: Kubernetes ingress may block `wss://` — LiveRoom has REST polling fallback.
- **MongoDB**: Exclude `_id` from all responses. Use `datetime.now(timezone.utc)` for timestamps.
