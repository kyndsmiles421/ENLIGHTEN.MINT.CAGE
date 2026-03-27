# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending wellness tracking with mystical/divination systems, personalized AI guidance, and cinematic visuals. Add quantum mechanics as a complementary avenue. Wrap as PWA, Push Notifications, Multi-Cultural Star Chart, Trade Circle barter marketplace, Subscription/Monetization system.

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

### 5-Tier Subscription System with Stripe (Mar 2026)
- **Free** — $0/mo, 50 credits/mo refreshed monthly, full basic site access
- **Starter** — $4.99/mo, 100 credits/mo
- **Plus** — $9.99/mo, 300 credits + Cosmic Blueprint, Featured Trader, Extended Oracle, Guided Stargazing, Advanced Analytics, Custom Meditations, Exclusive Stories, Ad-free, Plus badge
- **Premium** — $24.99/mo, Unlimited AI + Sora Videos, Voice Sessions, Ritual Generator, Priority Trading, Dream Journal, Cosmic Calendar, Quantum Experiments, Monthly Coaching, Export All, Early Access, Premium badge + aura
- **Super User** — $49.99/mo, Unlimited AI + White-Label Reports, API Access, Multi-Profile (5), Private Trade Rooms, VIP Hourly Forecasts, Custom AI Personality, Beta Features, Priority Support, Founding Member lock
- **Pay-As-You-Go**: $5=100, $10=225, $20=500 credits
- **AI Costs**: Text/Oracle=1, TTS/Whisper=1, Image=3, Sora Video=10
- Stripe Checkout, payment polling, auto-fulfillment, credit deduction (402 guard)
- Nav credits badge, Pricing page, Full Perk Comparison, Cancel subscription
- **Low Credits Nudge**: Appears when balance ≤10, dismissable, links to Upgrade/Top Up

### CreditContext (Global)
- Shared credit state across all components via React Context
- `useCredits(action)` function for AI feature gating
- Auto-refreshes on navigation

### Trade Circle with Karma System
- Pure barter, Offer flow, Karma (+10 trade, +3 review, +1 listing/offer)
- 6 Tiers, Review system, Leaderboard

### Multi-Cultural Star Chart (8 Cultures, 40 Constellations)
### Analytics & Achievements (15 badges)
### Quantum Mechanics Avenue (Additive)
### Push Notifications, PWA, 40+ pages, 6 AI integrations

## Key DB Collections
- `user_credits`: balance, tier, subscription_active, total_credits_used
- `payment_transactions`: session_id, type, tier_id/pack_id, amount, payment_status
- `credit_log`: amount, reason, created_at
- `trade_karma`, `trade_reviews`, `karma_log`

## Test: 69 iterations, all 100% pass rate
## Credentials: test@test.com / password

## Future/Backlog
- Implement tier-gated features (block Sora for non-Premium, etc.)
- Monthly credit refresh cron job for free/starter/plus tiers
- Subscription renewal via Stripe webhooks
- Production launch final checks (console logs, route optimization)
- Refactor star_cultures.py into JSON seed file
