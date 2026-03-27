# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems and personalized AI guidance.

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Vanilla Three.js
- Backend: FastAPI, Motor (Async MongoDB)
- Integrations: Emergent LLM Key (OpenAI GPT-5.2, Whisper STT, TTS-1-HD, GPT Image 1, Sora 2)
- Mobile: Progressive Web App (PWA) — installable on iOS + Android

## All Implemented Features

### Core Platform
- Auth, profiles, dashboard (categorized), mood tracking, journaling, affirmations, gamification
- Global Search Command Palette (Cmd+K, 60-item index, fuzzy matching)
- 6-category mega-menu navigation + Sage direct link + Profile dropdown
- Mobile accordion navigation

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
- AI Cinematic Visuals (GPT Image 1) — Creation Stories, VR Theater, Forecasts, Dreams, Cosmic Portrait
- Sora 2 AI Video Generation — 15 creation story video clips (4s each) with batch generation
- Video Gallery (Cosmic Cinema) — browse/generate/watch all 15 stories

### Social & Explore
- Community feed, forecast/meditation sharing
- Creation Stories (15 cultures, TTS narration, Cinema mode)
- VR Sanctuary (meditation + constellation journeys + Story Theater)
- Journey, Games, Classes, Videos, Challenges, Friends

### Launch-Ready UX (Feb 2026)
- Navigation: 60-item flat → 6 categorized mega-menu dropdowns
- Landing: 24 cards → 6 category pillar cards
- Dashboard: Flat grid → 5 categorized quick action sections
- Scroll-to-top on route change
- Back-to-top floating action button
- Glass-card hover micro-interactions
- Touch feedback for mobile

### PWA / Mobile App (Feb 2026)
- Full Progressive Web App with manifest.json (display: standalone)
- App shortcuts: Breathwork, Meditation, Sage, Daily Briefing
- Service worker with network-first caching
- App icons (192, 512, Apple touch icon, favicon)
- Apple meta tags (apple-mobile-web-app-capable, black-translucent status bar)
- Safe area insets for notched devices
- Install prompt with iOS/Android detection
- OG/Twitter social sharing meta tags

### Code Architecture
- StarChart.js split: 2042 → 1424 lines (extracted StarChartOverlays.js + StarChartAudio.js)
- Backend batch video generation with async task queue

## Test: 60 iterations, all 100% pass rate
## Credentials: test@test.com / password
## Status: LAUNCH READY

## How to Install as Mobile App
- **Android**: Open in Chrome → tap "Add to Home Screen" or "Install" in menu
- **iOS**: Open in Safari → tap Share → "Add to Home Screen"
- App launches in standalone mode (no browser chrome)
