# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals. Incorporate quantum mechanics theory throughout the entire app, making AI, VR, and all experiences interchangeable and coinciding. Architecture for easy adaptation to future technologies.

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Vanilla Three.js
- Backend: FastAPI, Motor (Async MongoDB)
- Integrations: Emergent LLM Key (OpenAI GPT-5.2, Whisper STT, TTS-1-HD, GPT Image 1, Sora 2)
- Mobile: Progressive Web App (PWA) — installable on iOS + Android
- Push Notifications: pywebpush (VAPID Web Push)

## All Implemented Features

### Core Platform
- Auth, profiles, dashboard (categorized), mood tracking, journaling, affirmations, gamification
- Global Search Command Palette (Cmd+K, 60-item index, fuzzy matching)
- 6-category mega-menu navigation + Sage direct link + Profile dropdown + Notification bell
- Mobile accordion navigation

### Quantum Mechanics Framework (Feb 2026)
- Modular `quantum_framework.py` with 8 quantum principles mapped to spiritual parallels
- Quantum-enhanced AI coaching: all 6 Sage modes infused with quantum consciousness terminology
- Quantum visual prompts: all AI-generated images enriched with quantum field aesthetics
- 3 guided quantum meditations (Superposition Stillness, Quantum Entanglement, Quantum Tunneling)
- Quantum Realm VR journey (6 waypoints blending physics + mysticism)
- Quantum Field portal in VR Sanctuary
- Future-tech adaptation hooks: spatial computing, neural interface, haptic feedback, AI agents
- Quantum-infused landing page tagline and "How it works" section
- Quantum terminology woven into Dream Oracle analysis
- GET /api/ai-visuals/quantum-principles endpoint for frontend access

### Push Notifications (Feb 2026)
- VAPID key pair generation and storage in backend .env
- Service Worker push event listener with notification display
- Notification click handler with URL routing
- Backend endpoints: subscribe, unsubscribe, status, preferences, send-test
- MongoDB collections: push_subscriptions, notification_prefs
- Navigation bell icon with notification settings dropdown panel
- Preference toggles: Daily Relaxation, Cosmic Insights, Practice Reminders
- Test notification sender with quantum-themed message
- Utility function `send_push_to_user()` for programmatic push delivery
- Auto-cleanup of expired/invalid subscriptions (410/404 handling)

### Wellness Practice
- Mudras (25), Yantras, Tantra, Qigong/Tai Chi, Videos, Meditations, Breathwork
- Frequencies/Solfeggio, Soundscapes, Nourishment/Recipes, Sacred Rituals
- Light Therapy, Mantras, Affirmations, Ho'oponopono

### Mystical & Divination
- Oracle/Tarot, Astrology, Numerology, Cardology, Cosmic Calendar
- Aromatherapy, Herbology, Acupressure, Reiki & Aura
- Multi-Cultural Star Chart (Mayan/Egyptian/Aboriginal/Lakota, 20 constellations)
- Cosmic Profile analytics, Forecasts (6 systems x 4 periods)
- Dream Journal, Animal Totems, Mayan Astrology

### AI Features
- Sage AI Coach (text + voice via Whisper STT + TTS "sage" voice) — quantum-enhanced
- AI Cinematic Visuals (GPT Image 1) — quantum visual overlays
- Sora 2 AI Video Generation — 15 creation story video clips (4s each)
- Video Gallery (Cosmic Cinema) — browse/generate/watch all 15 stories
- Dream Oracle with quantum consciousness analysis

### Social & Explore
- Community feed, forecast/meditation sharing
- Creation Stories (15 cultures, TTS narration, Cinema mode)
- VR Sanctuary (quantum meditation + constellation journeys + Story Theater + Quantum Field portal)
- Journey, Games, Classes, Videos, Challenges, Friends

### Launch-Ready UX (Feb 2026)
- Navigation: 6 categorized mega-menu dropdowns + notification bell
- Landing: 6 category pillar cards with quantum messaging
- Dashboard: 5 categorized quick action sections
- Scroll-to-top, back-to-top, glass-card hover interactions
- Touch feedback for mobile

### PWA / Mobile App (Feb 2026)
- Full Progressive Web App with manifest.json (display: standalone)
- App shortcuts: Breathwork, Meditation, Sage, Daily Briefing
- Service worker with network-first caching + push notifications
- App icons, Apple meta tags, safe area insets
- Install prompt with iOS/Android detection

## Architecture
```
/app/backend/
├── quantum_framework.py       # Quantum principles, meditations, visual themes, future hooks
├── routes/
│   ├── notifications.py       # Push subscription + preferences + send
│   ├── coach.py               # Quantum-enhanced AI coaching
│   ├── ai_visuals.py          # Quantum visual generation + principles API
│   └── ... (40+ route files)
├── deps.py
└── server.py

/app/frontend/
├── public/sw.js               # Service Worker with push listener
├── src/
│   ├── components/
│   │   ├── NotificationSettings.js  # Bell dropdown panel
│   │   ├── Navigation.js            # With notification bell
│   │   └── ...
│   ├── pages/
│   │   ├── VirtualReality.js        # Quantum portal + journeys
│   │   ├── Landing.js               # Quantum messaging
│   │   └── ...
│   └── i18n/translations.js         # Quantum taglines
```

## Test: 61 iterations, all 100% pass rate
## Credentials: test@test.com / password
## Status: LAUNCH READY

## How to Install as Mobile App
- **Android**: Open in Chrome → tap "Add to Home Screen" or "Install" in menu
- **iOS**: Open in Safari → tap Share → "Add to Home Screen"
- App launches in standalone mode (no browser chrome)
