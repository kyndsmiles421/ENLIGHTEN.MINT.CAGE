# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Context API
- Backend: FastAPI, Motor Async MongoDB
- Monetization: Stripe (Test Mode, Emergent environment key)
- AI: OpenAI GPT-4o, TTS/STT, Sora 2 — all via Emergent LLM Key

## All Completed Features
1. 6-pillar navigation (Today, Practice, Divination, Sanctuary, Nourish, Explore)
2. Multi-cultural 3D Star Chart (8 cultures) with mobile-friendly scrollable toolbar
3. Voice AI Sage (GPT-4o + TTS/STT)
4. Sora 2 Video Gallery
5. PWA + Push Notifications
6. Analytics dashboard
7. Trade Circle marketplace with Karma system
8. 5-tier Stripe Subscriptions + Credit packs
9. Hidden Creator/Admin role
10. 5 Color Themes
11. Accessibility: Sound toggles, reduce motion/particles
12. Crystals & Stones Encyclopedia + Rock Hounding game
13. Quantum Entanglement social meditations
14. Smart landing buttons (Begin/Continue Journey)
15. Light mode text readability polish
16. Performance optimization — instant page nav, 30fps background
17. Music Lounge — 10 ambient tracks with Web Audio API
18. Quick Reset Mantras with Natural TTS (shimmer voice)
19. Send a Blessing community feed
20. Cosmic Mixer floating widget (frequencies, ambient, mantras, light, vibration)
21. Share Button in Navigation and Landing page
22. Akashic Records (/akashic-records) — Guided AI session, 6 gateway prompts
23. Sacred Encyclopedia (/encyclopedia) — 12 world spiritual traditions, AI deep dives
24. Natural TTS Mantras — OpenAI TTS replacing browser SpeechSynthesis
25. Star Chart Mobile Fix — Scrollable toolbar, World Skies first
26. Personalized Dashboard — Dynamic greeting, daily wisdom, continue/new-for-you, progress
27. Activity Tracking Engine — Background page visit tracker
28. Spiritual Reading List (/reading-list) — 24 sacred texts, AI Cosmic Librarian
29. Daily Rotating Content — Date-seeded wisdom, greetings, featured traditions
30. Spiritual Growth Timeline (/growth-timeline) — 12-week heatmap, 15 milestones, stats
31. Light Therapy Fix — Visible color washes with breathing pulse animation
32. **Soul Reports** (/soul-reports) — AI-generated monthly reflections analyzing traditions explored, growth patterns, emotional landscape, and personalized guidance. Saved to MongoDB for revisiting. Share button. Month selector for last 6 months.

## Critical Config
- Admin: /admin-setup, password=cosmic-creator-2026
- Creator email: kyndsmiles@gmail.com
- Stripe: Emergent test key
- AI: Emergent LLM Key
- Language: English only
- Auth localStorage key: zen_token
- Performance: framer-motion page transitions removed (do not re-add)

## Key API Endpoints
- /api/soul-reports (GET) — List all reports
- /api/soul-reports/{month} (GET) — Get specific month's report
- /api/soul-reports/generate (POST) — Generate AI report for a month
- /api/activity/track (POST) — Track page visits
- /api/dashboard/personalized (GET) — Personalized dashboard
- /api/timeline (GET) — Growth timeline
- /api/reading-list (GET/POST) — Reading list
- /api/akashic/* — Akashic Records
- /api/encyclopedia/* — Sacred Encyclopedia

## Backlog
- P2: Refactor star_cultures.py (move coords to JSON/MongoDB)
