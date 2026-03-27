# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending wellness tracking with mystical/divination systems, personalized AI guidance, and cinematic visuals. Add quantum mechanics as a complementary avenue. Wrap as PWA, Push Notifications, Multi-Cultural Star Chart, Trade Circle barter marketplace, Subscription/Monetization system, Settings & Accessibility.

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Vanilla Three.js
- Backend: FastAPI, Motor (Async MongoDB)
- Integrations: Emergent LLM Key (OpenAI GPT-5.2, Whisper STT, TTS-1-HD, GPT Image 1, Sora 2)
- Payments: Stripe (via emergentintegrations library)
- Mobile: PWA (iOS + Android), Push Notifications (pywebpush)

## All Implemented Features

### Core Platform
- Auth, profiles, dashboard, mood tracking, journaling, affirmations, gamification
- Global Search (Cmd+K), 6-category mega-menu nav, notification bell
- Mobile accordion navigation

### Settings & Accessibility (Mar 2026)
- **Sound & Audio**: Ambient Soundscape toggle, Sound Effects toggle, Ambient Volume slider (0-100%)
- **Visual & Display**: 4 Color Themes (Dark Cosmic, Deep Midnight, Warm Earth, Sacred Forest)
- **Accessibility**: Reduce Motion, Reduce Particles, Reduce Flashing toggles
- **CosmicBackground** respects all prefs (fewer stars, no shooting stars, lower opacity)
- Settings persist in localStorage (`cosmic_prefs`)
- Themes apply instantly via CSS variables on document root
- Reset to Defaults button
- Account quick links (Subscription, Notifications, Profile)
- Accessible from profile dropdown and /settings URL

### 5-Tier Subscription System with Stripe (Mar 2026)
- **Free** $0/mo (50 credits/mo refreshed monthly), **Starter** $4.99/mo (100), **Plus** $9.99/mo (300 + perks), **Premium** $24.99/mo (Unlimited + premium perks), **Super User** $49.99/mo (Unlimited + pro/business perks)
- Pay-As-You-Go: $5=100, $10=225, $20=500 credits
- AI Costs: Text=1, TTS/Whisper=1, Image=3, Sora Video=10
- Stripe Checkout, payment polling, auto-fulfillment, credit deduction (402 guard)
- **Low Credits Nudge**: Floating toast when balance <= 10, upgrade/top-up buttons
- **CreditContext**: Global credit state shared across all components
- **Tier-Gated Features**: 17 features locked by tier (Plus: 6, Premium: 6, Super User: 5)
- **Monthly Credit Refresh Cron**: Background asyncio loop resets balances on 1st of month
- Nav credits badge, Pricing page, Full Perk Comparison

### Trade Circle with Karma System
- Pure barter (no currency), Offer flow, Karma (6 tiers), Review system, Leaderboard

### Multi-Cultural Star Chart (8 Cultures, 40 Constellations)
### Analytics & Achievements (15 badges)
### Quantum Mechanics Avenue (Additive)
### Push Notifications, PWA, 40+ pages, 6 AI integrations

## Key DB Collections
- `user_credits`: balance, tier, subscription_active, total_credits_used
- `payment_transactions`: session_id, type, amount, payment_status
- `credit_log`: amount, reason, created_at

## Test: 70 iterations, all 100% pass rate
## Credentials: test@test.com / password

## Future/Backlog
- Production launch final checks (console logs, route optimization)
- Refactor star_cultures.py into JSON seed file
- Quantum Entanglement social feature
