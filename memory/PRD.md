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
9. Hidden Creator/Admin role (/admin-setup, pw: cosmic-creator-2026)
10. 5 Color Themes: Dark Cosmic, Deep Midnight, Warm Earth, Sacred Forest, Light Celestial
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
22. Akashic Records (/akashic-records) — Guided AI session, 6 gateway prompts, multi-turn conversation
23. Sacred Encyclopedia (/encyclopedia) — 12 world spiritual traditions, AI "Ask Deeper"
24. Natural TTS Mantras — OpenAI TTS replacing browser SpeechSynthesis
25. Star Chart Mobile Fix — Scrollable toolbar, World Skies first
26. Personalized Dashboard — Dynamic greeting, daily wisdom, continue/new-for-you, progress stats
27. Activity Tracking Engine — Background page visit tracker powering all personalization
28. Spiritual Reading List (/reading-list) — 24 sacred texts, save/complete, AI Cosmic Librarian
29. Daily Rotating Content — Date-seeded wisdom, greetings, featured traditions
30. **Spiritual Growth Timeline** (/growth-timeline) — 12-week activity heatmap, category breakdown, 15 milestone badges (earned/locked), recent highlights, full journey stats, Share Journey. Under Today pillar and linked from dashboard.

## Critical Config
- Admin: /admin-setup, password=cosmic-creator-2026
- Creator email: kyndsmiles@gmail.com (auto-activated in routes/auth.py)
- Stripe: Emergent test key
- AI: Emergent LLM Key
- Language: English only
- Auth localStorage key: zen_token
- Performance: framer-motion page transitions removed (do not re-add)

## Key API Endpoints
- /api/activity/track (POST, auth) — Track page visits
- /api/dashboard/personalized (GET, auth) — Personalized dashboard
- /api/timeline (GET, auth) — Growth timeline with heatmap, milestones, stats
- /api/reading-list (GET, auth) — Reading list with personalization
- /api/reading-list/save (POST, auth) — Save/complete books
- /api/reading-list/ai-recommendation (POST, auth) — AI librarian
- /api/akashic/prompts (GET, no auth)
- /api/akashic/sessions (GET/POST, auth)
- /api/akashic/chat (POST, auth)
- /api/encyclopedia/traditions (GET, no auth)
- /api/encyclopedia/traditions/{id} (GET, no auth)
- /api/encyclopedia/explore (POST, auth)

## Backlog
- P2: Refactor star_cultures.py (move coords to JSON/MongoDB)
