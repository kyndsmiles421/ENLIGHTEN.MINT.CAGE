# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals. PWA, Push Notifications, Quantum Mechanics, global Star Chart cultures, Trade Circle barter marketplace, Stripe subscription system, hidden Creator role, Accessibility settings, Crystals & Stones, Virtual Rock Hounding, Quantum Entanglement, Music Lounge, Send a Blessing, floating Cosmic Mixer, Guided App Tour, and Cinematic Intro Videos.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion (micro-animations only) + Three.js (Star Chart with bloom)
- **Backend**: FastAPI + Motor Async MongoDB
- **AI**: OpenAI GPT-4o (text), OpenAI TTS tts-1 (voice), Sora 2 (video gen), Whisper (STT) — all via Emergent LLM Key
- **Payments**: Stripe (test key in pod)
- **PWA**: Service worker, manifest, install prompt
- **3D**: Three.js + UnrealBloomPass + EffectComposer for gaming-level star chart
- **DnD**: @dnd-kit for draggable dashboard widgets

## User Personas
- Spiritually-minded wellness seekers wanting immersive mystical digital experiences
- Return users who want personalized, evolving content
- Admin/Creator role: kyndsmiles@gmail.com

## Core Requirements (All Implemented)
1. 6-Pillar Navigation: Today, Practice, Divination, Sanctuary, Nourish, Explore
2. 3D Star Chart with 8 world cultures — enhanced with bloom, Milky Way, 15k stars
3. Voice AI Sage (coach) with OpenAI TTS
4. Sora 2 Video Gallery + Cinematic Intro Video
5. Trade Circle barter marketplace
6. Cosmic Mixer (ambient sounds, binaural frequencies, light therapy, OpenAI TTS mantras)
7. Akashic Records guided sessions
8. Encyclopedia of 12 Spiritual Teachings
9. Dynamic Return-User Dashboard with streak, greetings, draggable widgets
10. Spiritual Reading List with AI librarian
11. 12-Week Growth Timeline with heatmap and milestones
12. AI-generated Monthly Soul Reports
13. Interactive Guided Tour for new users
14. Cosmic Mood Ring — animated canvas orb shifting colors based on mood/activity
15. Immersive visual system: fluid mesh gradients, deep glassmorphism, portal-pulse animations

## Latest Enhancements (Current Session)
- **Gaming-level Star Chart**: UnrealBloomPass bloom post-processing, Milky Way galactic band, 15000 background stars with spectral class coloring, camera momentum/inertia, 10 vibrant nebulae, enhanced star diffraction spikes
- **Cosmic Mood Ring**: Animated canvas orb on dashboard that shifts colors based on mood history — layers, floating particles, breathing pulse, trend indicators
- **Immersive Visual Overhaul**: Fluid mesh gradient background (4 animated layers), enhanced glass morphism, 7 nebulae + 8 star colors in CosmicBackground, portal-pulse animations, stagger reveal, color-shift glow
- **Draggable Dashboard Widgets**: @dnd-kit integration — users can rearrange their sanctuary layout
- **Sora 2 Intro Video**: Fixed stale job detection + video player autoPlay/onCanPlay

## Architecture
```
/app/
├── backend/
│   ├── routes/ (ai_visuals.py, dynamic.py, akashic.py, encyclopedia.py, social.py, etc.)
│   ├── server.py
│   ├── static/videos/
├── frontend/
│   ├── src/
│   │   ├── components/ (CosmicMixer.js, GuidedTour.js, IntroVideo.js, CosmicMoodRing.js, CosmicBackground.js, etc.)
│   │   ├── pages/ (Landing.js, StarChart.js, GrowthTimeline.js, SoulReports.js, etc.)
│   │   ├── context/ (AuthContext.js, SensoryContext.js, etc.)
```

## Key DB Collections
- activity_log: {user_id, activity_type, timestamp, metadata}
- soul_reports: {user_id, month, report_markdown, stats}
- ai_video_cache: {cache_key, video_url, filename, created_at}
- mood_logs: {user_id, mood, energy, timestamp}

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com

## Backlog
- **P2**: Refactor star_cultures.py — move massive hardcoded coordinate arrays into MongoDB collection or JSON seed file
