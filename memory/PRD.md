# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion + Three.js
- **Backend**: FastAPI + Motor Async MongoDB
- **AI**: OpenAI GPT-4o, TTS tts-1-hd, Sora 2, GPT Image 1, Whisper — all via Emergent LLM Key
- **Payments**: Stripe (test key in pod)
- **Mobile**: Capacitor configured

## All Implemented Features

### Mood Insights & Trends (NEW Mar 2026)
- AI-generated weekly emotional summary with patterns and recommendations (GPT-4o)
- Stats: Day Streak, Total Logged, Average Intensity
- Most Frequent Emotions breakdown with colored progress bars
- Weekly activity chart
- Mood Tracker unified with Quick Reset: 33+ emotions, search, group filters

### Crystal Pairing Share (NEW Mar 2026)
- Share button on crystal pairing results (Web Share API + clipboard fallback)
- Public share endpoint: GET /api/crystals/pairing/{id}/share
- Formatted share text with crystal names, guidance excerpt, and link

### Blessing Notifications (NEW Mar 2026)
- In-app notification created when someone sends you a blessing
- Push notification via web push (existing VAPID infrastructure)
- Notification inbox in nav bell dropdown with unread count badge
- Mark as read / Mark all read functionality
- Auto-polls every 30 seconds

### Creator Dashboard (Mar 2026)
- Admin-only view for kyndsmiles@gmail.com
- Overview: Total users, Active today/week/month, PWA installs, Feedback counts
- Feedback management with status workflow
- Comments moderation, Users tab, Popular features ranking

### SmartDock (Mar 2026)
- Unified floating dock (Sage, Mixer, Tones)
- No background dimming

### Customizable Dashboard (Mar 2026)
- Reorder/hide sections, Pinned Shortcuts grid
- Persisted to MongoDB

### Bug Fixes (Mar 2026)
- Quick Reset modal invisible (createPortal + opaque bg)
- Video player at bottom (createPortal)
- Touch sensitivity on Quick Reset (removed onTouchEnd, touchAction: pan-y)
- Global CSS transform: none fix

### All Prior Features
- 40+ pages, AI Avatar, Star Chart (20 cultures), Sacred Texts, Crystals, Blessings, VR modes, etc.

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Backlog
- P2: Capacitor mobile app build
