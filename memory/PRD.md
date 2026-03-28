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
14. "Begin Journey" / "Continue Journey" smart landing buttons
15. Light mode full text readability polish
16. Performance optimization — instant page nav, 30fps background
17. Music Lounge — 10 ambient tracks with Web Audio API
18. Quick Reset Mantras with Natural TTS (shimmer voice)
19. Send a Blessing community feed
20. Cosmic Mixer floating widget (frequencies, ambient, mantras, light, vibration)
21. Share Button in Navigation and Landing page
22. **Akashic Records** (/akashic-records) — Guided meditative AI session under Divination. 6 gateway prompts (Soul Purpose, Past Lives, Karmic Patterns, Soul Relationships, Soul Healing, Soul Gifts). Multi-turn conversation with Akashic Records Keeper persona via GPT-4o. Session history saved to MongoDB.
23. **Sacred Encyclopedia** (/encyclopedia) — 12 world spiritual traditions under Explore (Hinduism, Buddhism, Taoism, Sufism, Kabbalah, Indigenous/Shamanic, Mystical Christianity, Ancient Egyptian, Greek Philosophy, Zen, Yoga & Tantra, African). Each has key concepts, sacred texts, notable figures, practices. AI-powered "Ask Deeper" exploration on any element. Custom question box per tradition.

## Critical Config
- Admin: /admin-setup, password=cosmic-creator-2026
- Creator email: kyndsmiles@gmail.com (auto-activated in routes/auth.py)
- Stripe: Emergent test key
- AI: Emergent LLM Key
- Language: English only (translation toggle removed)
- Performance: framer-motion page transitions removed (do not re-add)

## Key API Endpoints
- /api/akashic/prompts (GET, no auth)
- /api/akashic/sessions (GET/POST, auth)
- /api/akashic/chat (POST, auth)
- /api/encyclopedia/traditions (GET, no auth)
- /api/encyclopedia/traditions/{id} (GET, no auth)
- /api/encyclopedia/explore (POST, auth — AI deep dive)

## Backlog
- P2: Refactor star_cultures.py (move coords to JSON/MongoDB)
