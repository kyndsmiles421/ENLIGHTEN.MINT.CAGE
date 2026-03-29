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

### Creator Dashboard (NEW Mar 2026)
- Auto-activated admin view for `kyndsmiles@gmail.com` only
- **Overview**: Total users, Active today/week/month, App installs (PWA downloads), Mood logs, Journal entries, Sage sessions, Feedback counts (new/in-review/resolved)
- **14-day Active Users chart** with bar graph
- **Top Features by Usage** — ranked page visits with progress bars
- **Feedback management** — View all submissions, filter by status, update status (New → In Review → Resolved → Dismissed)
- **Comments moderation** — View all community comments, delete inappropriate content
- **Users tab** — Total registered, PWA installs, new this week, recent signups list
- **Popular tab** — Full feature usage rankings
- **Nav integration**: Gold "Creator" badge + "Creator Studio" link in profile dropdown (admin only)
- **Access control**: All `/api/creator/*` endpoints return 403 for non-creator users

### PWA Install Tracking (NEW Mar 2026)
- Tracks `appinstalled` browser events to MongoDB
- Creator Dashboard shows install count

### SmartDock (Mar 2026)
- Unified floating dock replaces 3 overlapping widgets
- Bottom-right dock with Sage, Mixer, Tones icons; no background dimming

### Cosmic Mixer Page (Mar 2026)
- Full-page mixer at `/cosmic-mixer` with 5 audio layers

### Customizable Dashboard (Mar 2026)
- "Customize" button enters edit mode to reorder/hide sections
- Pinned Shortcuts grid (phone-home-screen style)
- Persisted to MongoDB via `/api/dashboard/layout`

### Bug Fixes (Mar 2026)
- Quick Reset modal invisible: glass-card bg + `createPortal`
- Video player at bottom of page: `createPortal` escape transform
- Quick Reset touch sensitivity: removed `onTouchEnd`, `touchAction: 'pan-y'`
- Global CSS: `transform: none` in `.page-enter` keyframe

### All Prior Features
- Dashboard with sparklines, Smart Suggestions
- Help Center, Feedback, Community Comments
- Quick Reset (33 emotions + search), Star Chart (20 cultures, pinch zoom)
- Sacred Texts, Encyclopedia, Crystals (VR + TTS + AI Pairing)
- Blessings (AI + stats), Accessibility, Guided Tour, Myths & Legends
- 40+ pages, AI Avatar, Cosmic Mixer, etc.

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Key Technical Notes
- `.page-enter` keyframe must use `transform: none` (not `translateY(0)`)
- All modals inside framer-motion pages need `createPortal(document.body)` to render correctly

## Backlog
- P2: Capacitor mobile app build
- P3: Crystal Pairing share, Blessing notifications, Mood trends analytics
