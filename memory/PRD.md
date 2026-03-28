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
17. **Music Lounge** — 10 ambient/piano/cosmic/nature/uplifting tracks with Web Audio API synth, category filters, shuffle/radio mode, now-playing bar, volume control, favorites
18. **Quick Reset Mantras** — Protective and uplifting mantras with tradition labels
19. **Send a Blessing** community feed
20. **Cosmic Mixer** floating widget (frequencies, ambient sounds, mantras, light therapy, vibration)
21. **Share Button** in Navigation and Landing page
22. **Natural TTS Mantras** — Replaced browser SpeechSynthesis with OpenAI TTS (shimmer voice, 0.8x speed) across Cosmic Mixer and Landing page MantraCard for warm, human-sounding mantra audio
23. **Star Chart Mobile Fix** — Culture selection buttons now accessible on mobile via scrollable toolbar with World Skies as first button

## Critical Config
- Admin: /admin-setup, password=cosmic-creator-2026
- Creator email: kyndsmiles@gmail.com (auto-activated in routes/auth.py)
- Stripe: Emergent test key
- AI: Emergent LLM Key
- Language: English only (translation toggle removed)
- Performance: framer-motion page transitions removed (do not re-add)

## Backlog
- P2: Refactor star_cultures.py (move coords to JSON/MongoDB)
