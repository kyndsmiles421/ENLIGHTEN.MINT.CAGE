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
22. **Akashic Records** (/akashic-records) — Guided AI session under Divination with 6 gateway prompts. Multi-turn conversation with Akashic Records Keeper persona.
23. **Sacred Encyclopedia** (/encyclopedia) — 12 world spiritual traditions with AI "Ask Deeper" exploration.
24. **Natural TTS Mantras** — OpenAI TTS (shimmer voice) replacing browser SpeechSynthesis across Cosmic Mixer and MantraCard.
25. **Star Chart Mobile Fix** — Culture selection buttons accessible via scrollable toolbar.
26. **Personalized Dashboard** — Dynamic time-of-day greeting, daily rotating wisdom quote (31 quotes, deterministic per date), "Continue Where You Left Off" (recent activities), "New For You" (undiscovered features), progress stats (sessions, AI convos, mood/journal entries, features found, streak days).
27. **Activity Tracking Engine** — Lightweight background tracker logs page visits and interactions to MongoDB. Powers all personalization.
28. **Spiritual Reading List** (/reading-list) — 24 curated sacred texts from 15+ traditions. Save/complete/filter by level. AI "Cosmic Librarian" personalized recommendations. Personalization based on user's explored traditions.
29. **Daily Rotating Content** — Wisdom quotes, greetings, featured traditions all change daily but stay consistent within one day.

## Critical Config
- Admin: /admin-setup, password=cosmic-creator-2026
- Creator email: kyndsmiles@gmail.com (auto-activated in routes/auth.py)
- Stripe: Emergent test key
- AI: Emergent LLM Key
- Language: English only
- Performance: framer-motion page transitions removed (do not re-add)
- Auth localStorage key: zen_token

## Key API Endpoints
- /api/activity/track (POST, auth) — Track page visits
- /api/dashboard/personalized (GET, auth) — Full personalized dashboard
- /api/reading-list (GET, auth) — Curated reading list with personalization
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
