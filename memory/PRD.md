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
2. Multi-cultural 3D Star Chart (8 cultures)
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
14. "Begin Journey" branding, Simplified Chinese translations
15. **Light mode full text readability polish** (Mar 27, 2026)
16. **Performance optimization** (Mar 27, 2026) — removed page transition animations, throttled background to 30fps, reduced particle count

## Critical Config
- Admin: /admin-setup, password=cosmic-creator-2026
- Stripe: Emergent test key (no user key needed)
- AI: Emergent LLM Key

## Backlog
- P2: Refactor star_cultures.py (move coords to JSON/MongoDB)
- P3: Convert remaining inline rgba(248,250,252,...) to CSS vars in detail panels
