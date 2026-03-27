# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals. Add quantum mechanics as a complementary avenue/page within the app — not a rebrand. Architecture for easy adaptation to future technologies.

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Vanilla Three.js
- Backend: FastAPI, Motor (Async MongoDB)
- Integrations: Emergent LLM Key (OpenAI GPT-5.2, Whisper STT, TTS-1-HD, GPT Image 1, Sora 2)
- Mobile: Progressive Web App (PWA) — installable on iOS + Android
- Push Notifications: pywebpush (VAPID Web Push)

## All Implemented Features

### Core Platform (Unchanged Identity)
- Auth, profiles, dashboard (categorized), mood tracking, journaling, affirmations, gamification
- Global Search Command Palette (Cmd+K, 60+ item index, fuzzy matching)
- 6-category mega-menu navigation + Sage direct link + Profile dropdown + Notification bell
- Mobile accordion navigation
- Original landing page: "A Gathering Place for Conscious Minds"
- Original coach modes: Spiritual Guidance, Life Coaching, Shadow Work, Manifestation, Healing Guide, Dream Oracle

### Analytics & Achievements (Feb 2026)
- **Analytics Page** (/analytics) with 3 tabs: Overview, Achievements, Activity
- **Overview Tab**: Feature usage bar chart (6 tracked features), coherence history graph, totals (sessions, divinations, coaching)
- **Achievements Tab**: 15 badges with auto-unlock logic
  - Practice: First Breath, Inner Stillness, Mood Tracker, Journal Keeper
  - Streaks: Three-Day Flow, Week Warrior, Moon Cycle Master
  - Quantum: Quantum Observer (55+), Wave Rider (80+), Entangled Soul (7 days at 80+), Zero-Point Master (4 types/week)
  - Social: Oracle Seeker, Sage Student, Dream Weaver, Community Light
- **Activity Tab**: 14-day stacked bar chart (moods/journals/meditations/breathwork), streak stats (current/longest/total)
- Coherence history recording (daily snapshots for trend tracking)
- Analytics accessible from: profile dropdown, Cmd+K search, Quantum Coherence widget click

### Quantum Mechanics Avenue (Additive, Feb 2026)
- Modular `quantum_framework.py` with 8 quantum principles mapped to spiritual parallels
- 5 guided quantum meditations accessible via VR Sanctuary
- Quantum Field portal in VR Sanctuary (sits alongside existing portals)
- Quantum Realm VR journey (6 waypoints)
- Quantum Coherence Dashboard Widget (animated SVG ring, 0-100 score)
- Quantum visual themes library for AI generation
- Subtle quantum awareness in Sage AI (only when contextually relevant)
- Future-tech adaptation hooks: spatial computing, neural interface, haptic feedback, AI agents

### Push Notifications (Feb 2026)
- VAPID key pair, service worker push listener, notification click routing
- Backend: subscribe, unsubscribe, status, preferences, send-test, send-scheduled
- Navigation bell icon with settings dropdown
- Morning/Evening reminder time pickers
- 10 rotating themed reminder messages (5 morning, 5 evening)
- **Background auto-scheduler**: asyncio loop every 30min, sends at user-preferred hours
- Auto-cleanup of expired subscriptions

### Wellness Practice
- Mudras (25), Yantras, Tantra, Qigong/Tai Chi, Videos, Meditations, Breathwork
- Frequencies/Solfeggio, Soundscapes, Nourishment/Recipes, Sacred Rituals
- Light Therapy, Mantras, Affirmations, Ho'oponopono

### Mystical & Divination
- Oracle/Tarot, Astrology, Numerology, Cardology, Cosmic Calendar
- Aromatherapy, Herbology, Acupressure, Reiki & Aura
- Multi-Cultural Star Chart (Mayan/Egyptian/Aboriginal/Lakota)
- Cosmic Profile, Forecasts (6 systems x 4 periods), Dream Journal, Animal Totems, Mayan Astrology

### AI Features
- Sage AI Coach (text + voice via Whisper STT + TTS), AI Cinematic Visuals (GPT Image 1)
- Sora 2 AI Video Generation (15 creation stories), Video Gallery (Cosmic Cinema)
- Dream Oracle

### Social & Explore
- Community feed, forecast/meditation sharing, Creation Stories, VR Sanctuary
- Journey, Games, Classes, Videos, Challenges, Friends

### PWA / Mobile App
- Full PWA with manifest.json, service worker, push notifications, install prompt
- App shortcuts, icons, Apple meta tags, safe area insets

## Architecture
```
/app/backend/
├── quantum_framework.py
├── routes/
│   ├── notifications.py       # Push + coherence + scheduled delivery
│   ├── achievements.py        # 15 badges + analytics + coherence history
│   ├── coach.py, ai_visuals.py, cosmic_profile.py, ...
├── server.py                  # Background push scheduler loop
└── deps.py

/app/frontend/src/
├── pages/Analytics.js         # 3-tab analytics + achievements
├── pages/Dashboard.js         # Quantum Coherence Widget → /analytics
├── pages/VirtualReality.js    # Quantum portal + meditations
├── components/
│   ├── NotificationSettings.js, Navigation.js, SearchCommand.js
```

## Test: 64 iterations, all 100% pass rate
## Credentials: test@test.com / password
## Status: LAUNCH READY

## Future/Backlog
- Quantum Entanglement social feature (paired meditations)
- Spatial computing VR headset support
- Neural interface integration
