# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending wellness tracking with mystical/divination systems, personalized AI guidance, and cinematic visuals. Add quantum mechanics as a complementary avenue. Wrap as PWA, Push Notifications, Multi-Cultural Star Chart, Trade Circle barter marketplace, Subscription/Monetization, Settings/Accessibility.

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Vanilla Three.js
- Backend: FastAPI, Motor (Async MongoDB)
- Integrations: Emergent LLM Key (OpenAI GPT-5.2, Whisper STT, TTS-1-HD, GPT Image 1, Sora 2)
- Payments: Stripe (via emergentintegrations library)
- Mobile: PWA (iOS + Android), Push Notifications (pywebpush)

## All Implemented Features

### Core Platform
- Auth, profiles, dashboard, mood tracking, journaling, affirmations, gamification
- "Begin Journey" CTA (replaced all "Sign In" / "Login" with cosmic language)
- Global Search (Cmd+K), 6-category mega-menu nav, notification bell
- Mobile accordion navigation

### Admin/Creator Role (Mar 2026)
- Admin role with unlimited AI, all features unlocked, bypasses all credit checks
- Setup via POST /api/auth/set-admin with one-time setup key
- Nav badge shows "Creator" in gold for admin users
- Pricing page shows "Creator / Admin" badge
- Setup key: cosmic-creator-2026 (configurable via ADMIN_SETUP_KEY env)

### Settings & Accessibility (Mar 2026)
- Sound & Audio: Ambient toggle, Sound Effects toggle, Volume slider
- Visual: 4 Color Themes (Dark Cosmic, Deep Midnight, Warm Earth, Sacred Forest)
- Accessibility: Reduce Motion, Reduce Particles, Reduce Flashing toggles
- CosmicBackground respects all prefs
- Persists in localStorage, Reset to Defaults

### 5-Tier Subscription System with Stripe
- Free $0/50 cr/mo, Starter $4.99/100, Plus $9.99/300, Premium $24.99/Unlimited, Super User $49.99/Unlimited
- Pay-As-You-Go: $5=100, $10=225, $20=500 credits
- Stripe Checkout, payment polling, credit deduction, low-credits nudge
- Tier-Gated Features (17 features locked by tier), monthly credit refresh cron
- CreditContext global state

### Trade Circle with Karma, Star Chart (8 cultures), Analytics, Quantum, PWA, Push Notifications

## Test: 71 iterations, all 100% pass rate
## Credentials: test@test.com / password (admin)
## Admin Setup Key: cosmic-creator-2026

## Future/Backlog (Next Session)
- Light Mode theme
- Crystals & Stones section (encyclopedia, collection, AI advisor)
- Virtual Rock Hounding game
- Quantum Entanglement social feature
- Production launch final polish
