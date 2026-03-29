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
- **Unified floating dock** replaces 3 overlapping widgets (FloatingAssistant, QuickMeditationWidget, CosmicMixer)
- Bottom-right dock with icons: Sage (AI assistant), Mixer (link to full Cosmic Mixer page), Tones (solfeggio frequency player)
- Expand to show Feedback and Help shortcuts
- Usage-based sorting (most-used icons appear first)
- **No background dimming** — panels open inline above dock
- Portal-based rendering at z-[80]

### Cosmic Mixer Page (NEW Mar 2026)
- Full-page mixer at `/cosmic-mixer` route (previously only floating widget)
- 5 audio layers: Solfeggio Frequencies (9), Ambient Sounds (5), Mantras (6 with TTS), Light Therapy (6 modes), Haptic Vibration
- Master volume control, stop-all button
- Back button returns to previous page

### Customizable Dashboard (NEW Mar 2026)
- **"Customize" button** — enter edit mode to reorder, hide/show dashboard sections
- **9 reorderable sections**: Stats Cards, My Shortcuts, Suggested for You, Quantum Coherence, Daily Challenge, Daily Wisdom, Recent Moods, For You, Explore & Practice
- **Pinned Shortcuts** — phone-home-screen style icon grid; users pin their favorites from 33+ actions
- **Add Shortcuts sheet** — bottom sheet to browse all actions by category and pin/unpin
- **Drag-and-drop** section reordering (desktop) + up/down arrow buttons (mobile)
- **Persisted to MongoDB** via GET/PUT `/api/dashboard/layout`

### Dashboard (UPGRADED Mar 2026)
- **Mini sparklines** on stat cards (7-day trend graphs for moods, journals, activity)
- **Smart Suggestions** — personalized next-steps based on user activity
- Stat cards navigate: Streak→Growth Timeline, Moods→Mood Tracker, Journal→Journal, Games→Games
- 2x2 compact grid, "?" help button, no auto-blocking walkthrough

### Floating AI Assistant (Moved to SmartDock Mar 2026)
- "?" Sage button accessible from SmartDock on every page (except auth)
- Opens AI Coach mini-chat panel with session management
- Quick action buttons: Help Center, Submit Feedback

### Help Center (NEW Mar 2026)
- **FAQs** — 12 questions with search + category filters + accordion
- **Guides** — 9 feature tutorials with direct navigation
- **Contact** — links to AI Coach and Feedback form

### Feedback & Suggestions (NEW Mar 2026)
- **Submit feedback** — type (Suggestion/Feedback/Bug/Question) + category + message
- **History** — view your submitted feedback with status
- **Creator dashboard** — creator email sees all feedback

### Community Comments (NEW Mar 2026)
- **Reusable component** — integrated on Crystals and Blessings pages
- Post comments, like comments, expand/collapse thread

### Quick Reset (33 emotions + search)
### Star Chart (20 cultures, pinch zoom, culture-aware stories/journey)
### Sacred Texts, Encyclopedia, Crystals (VR + TTS + AI Pairing)
### Blessings (AI + stats), Accessibility, Guided Tour, Myths & Legends
### All other features (40+ pages, AI Avatar, Cosmic Mixer, etc.)

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com / password

## Backlog
- P1: Creator Dashboard (admin view for feedback, comments, usage analytics)
- P2: Capacitor mobile app build
- P3: Crystal Pairing share, Blessing notifications, Mood trends analytics
