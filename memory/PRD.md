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
- Global Search Command Palette (Cmd+K, 60-item index, fuzzy matching)
- 6-category mega-menu navigation + Sage direct link + Profile dropdown + Notification bell
- Mobile accordion navigation
- Original landing page: "A Gathering Place for Conscious Minds"
- Original coach modes: Spiritual Guidance, Life Coaching, Shadow Work, Manifestation, Healing Guide, Dream Oracle

### Quantum Mechanics Avenue (Additive, Feb 2026)
- Modular `quantum_framework.py` with 8 quantum principles mapped to spiritual parallels
- 5 guided quantum meditations accessible via VR Sanctuary (Superposition Stillness, Quantum Entanglement, Quantum Tunneling, Wave-Particle Duality, Observer Effect Awakening)
- Quantum Field portal in VR Sanctuary (sits alongside existing portals)
- Quantum Realm VR journey (6 waypoints blending physics + mysticism)
- Quantum Coherence Dashboard Widget (animated SVG ring, 0-100 score from practice data)
- Quantum visual themes library for future AI generation use
- GET /api/ai-visuals/quantum-principles endpoint
- GET /api/notifications/quantum-coherence endpoint
- Subtle quantum awareness in Sage AI (only when contextually relevant, not forced)
- Future-tech adaptation hooks: spatial computing, neural interface, haptic feedback, AI agents

### Push Notifications (Feb 2026)
- VAPID key pair in backend .env
- Service Worker push event listener + notification click handler
- Backend: subscribe, unsubscribe, status, preferences, send-test, send-scheduled
- MongoDB collections: push_subscriptions, notification_prefs
- Navigation bell icon with settings dropdown
- Preference toggles: Daily Relaxation, Cosmic Insights, Practice Reminders
- Morning/Evening reminder time pickers (configurable hours)
- 10 rotating themed reminder messages (5 morning, 5 evening)
- Batch scheduled delivery endpoint for cron

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
- Sage AI Coach (text + voice via Whisper STT + TTS "sage" voice)
- AI Cinematic Visuals (GPT Image 1)
- Sora 2 AI Video Generation — 15 creation story clips
- Video Gallery (Cosmic Cinema)
- Dream Oracle

### Social & Explore
- Community feed, forecast/meditation sharing
- Creation Stories (15 cultures, TTS narration, Cinema mode)
- VR Sanctuary (meditation + constellation journeys + Story Theater + Quantum Field portal)
- Journey, Games, Classes, Videos, Challenges, Friends

### PWA / Mobile App
- Full PWA with manifest.json, service worker, push notifications
- App shortcuts, icons, Apple meta tags, safe area insets
- Install prompt with iOS/Android detection

## Test: 63 iterations, all 100% pass rate
## Credentials: test@test.com / password
## Status: LAUNCH READY

## Future/Backlog
- Cron job for automated daily push delivery
- Quantum Entanglement social feature (paired meditations)
- Spatial computing VR headset support
- Neural interface integration
- User analytics dashboard
