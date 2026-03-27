# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals. Wrap as a PWA, implement Push Notifications, add a "Quantum Mechanics" avenue, expand Star Chart to global cultures, build a "Trade Circle" barter marketplace. Implement a 5-tier Stripe subscription and credit system, add a hidden Creator/Admin role for unlimited access, add accessibility settings (Light Mode, reduce motion/particles), integrate a "Crystals & Stones" encyclopedia with a "Virtual Rock Hounding" game, and add a "Quantum Entanglement" social meditation feature.

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Context API
- Backend: FastAPI, Motor Async MongoDB
- Monetization: Stripe (Test Mode, Emergent environment key)
- AI: OpenAI GPT-4o, TTS/STT, Sora 2 — all via Emergent LLM Key
- PWA: Service Worker, Push Notifications

## Completed Features (All Verified)
1. 6-pillar navigation system (Today, Practice, Divination, Sanctuary, Nourish, Explore)
2. Multi-cultural 3D Star Chart (8 cultures: Hindu/Vedic, Norse, Polynesian, etc.)
3. Voice AI Sage (GPT-4o + TTS/STT)
4. Sora 2 Video Gallery
5. Push Notifications with scheduler
6. Analytics dashboard
7. Trade Circle marketplace with Karma reputation system
8. 5-tier Stripe Subscription system (Free, Starter, Plus, Premium, Super User)
9. Credit pack purchases
10. API tier-gating for premium AI features
11. Hidden Creator/Admin role (/admin-setup, password: cosmic-creator-2026)
12. Accessibility Settings (Sound toggles, 5 themes, reduce motion/particles)
13. 5 Color Themes: Dark Cosmic, Deep Midnight, Warm Earth, Sacred Forest, Light Celestial
14. Crystals & Stones Encyclopedia + Virtual Rock Hounding game
15. Quantum Entanglement social meditations
16. "Begin Journey" branding (replaced "Sign In" app-wide)
17. Simplified Chinese (中文) language translations
18. **Light Celestial Theme — Full text readability polish (Mar 27, 2026)**
    - CosmicBackground hidden in light mode
    - Navigation, SearchCommand, NotificationSettings, dropdowns: theme-aware backgrounds
    - App wrapper uses CSS var(--bg-primary) instead of hardcoded #0B0C15
    - 12+ page headings converted from #F8FAFC to var(--text-primary)
    - Subtitles converted from rgba(248,250,252,0.45) to var(--text-muted)
    - Dashboard coherence badges: darker accent colors in light mode
    - Settings Section/Toggle/Slider: theme-aware borders and backgrounds
    - Comprehensive CSS overrides for inline white text, borders, and backgrounds
    - Pastel badge tag darkening filter for light mode
    - Shimmer text animation: darker gradient in light mode
    - Production cleanup: zero debug console.logs

## Key Architecture
- Frontend entry: /app/frontend/src/App.js
- Theme system: /app/frontend/src/context/SensoryContext.js (5 themes, CSS vars)
- Credits: /app/frontend/src/context/CreditContext.js + /app/backend/routes/subscriptions.py
- Light mode CSS: /app/frontend/src/index.css (bottom section — body[data-theme="light"] rules)

## Critical Config
- Admin setup: /admin-setup page, password=cosmic-creator-2026, sets is_admin=true
- Stripe: Uses Emergent test key (no user key needed)
- All AI features use Emergent LLM Key

## Backlog / Future Tasks
- P2: Refactor star_cultures.py — move hardcoded coordinate arrays to JSON/MongoDB
- P3: Convert remaining inline rgba(248,250,252,...) styles in secondary pages to CSS variables
