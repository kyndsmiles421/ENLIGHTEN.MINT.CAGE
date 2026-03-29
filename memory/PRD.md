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

### Live Sessions (NEW Mar 2026)
- **Browse & Create**: `/live` page with session cards (Live Now / Upcoming / Session Types)
- **8 session types**: Group Meditation, Yoga Flow, Breathwork Circle, Sound Bath, Mantra Chanting, Prayer Circle, Qigong Practice, Open Circle
- **6 virtual scenes**: Cosmic Temple, Zen Garden, Ocean Shore, Mountain Peak, Sacred Fire, Northern Lights
- **Host controls**: Start/End session, guided commands (Begin, Breathe In/Out, Hold, Focus, Release, Om, End)
- **Avatar Circle**: Users' AI avatars arranged in a circle with glowing rings and gentle floating animation
- **Real-time chat + reactions**: WebSocket-powered (with REST fallback)
- **Scene backgrounds**: Ambient particle effects matching each virtual environment
- **Session lifecycle**: Scheduled → Active → Ended, host-only control

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

### SmartDock, Customizable Dashboard, Bug Fixes (Mar 2026)
- All previously documented features

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Backlog
- P2: Capacitor mobile app build
- P3: Live session recording/replay, AI-generated guided meditation audio for sessions
