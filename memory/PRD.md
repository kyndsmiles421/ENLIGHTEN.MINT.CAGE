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
- **Free Tier** — $0/mo, 50 AI credits refreshed monthly, full basic site access
- **Starter Tier** — $4.99/mo, 100 AI credits/month
- **Plus Tier** — $9.99/mo, 300 AI credits/month + Cosmic Blueprint Report, Featured Trader badge, Extended Oracle Sessions, Guided Stargazing, Advanced Analytics, Custom Meditations, Exclusive Stories, Ad-free, Plus badge
- **Premium Tier** — $24.99/mo, Unlimited AI + Sora Videos, Voice Sessions, Ritual Generator, Priority Trading, Dream Journal, Cosmic Calendar, Quantum Experiments, Monthly Coaching, Export All, Early Access, Premium badge + aura
- **Super User Tier** — $49.99/mo, Unlimited AI + White-Label Reports, API Access, Multi-Profile (5), Private Trade Rooms, VIP Hourly Forecasts, Custom AI Personality, Beta Features, Priority Support, Founding Member pricing lock
- **Pay-As-You-Go Credit Packs**: $5=100, $10=225 (10% bonus), $20=500 (25% bonus)
- **AI Credit Costs**: Text/Oracle=1, TTS/Whisper=1, Image Gen=3, Sora Video=10
- Stripe Checkout integration for subscriptions and one-time purchases
- Payment status polling with auto-fulfillment
- Credit deduction system with insufficient-credits guard (402 error)
- Nav bar credits badge (teal) linking to /pricing
- Profile dropdown "Subscription" link
- Full Perk Comparison expandable sections
- Cancel subscription endpoint (downgrades to free)
- Credit history/log tracking
- Payment transactions collection for audit trail

### Trade Circle with Karma System (Feb-Mar 2026)
- Pure barter marketplace (no currency), goods and services
- Offer/proposal flow, accept/decline, listing CRUD
- Trade Karma: +10 trade, +3 review, +1 listing/offer
- 6 Tiers: Seedling → Sprout → Bloom → Guardian → Elder → Luminary
- Review system (1-5 stars + comment), Karma Profile modal, Leaderboard tab

### Multi-Cultural Star Chart (8 Cultures, 40 Constellations)
- Mayan, Egyptian, Aboriginal, Lakota, Chinese, Vedic, Norse, Polynesian

### Analytics & Achievements
- 15 achievement badges, feature usage charts, 14-day activity graph

### Quantum Mechanics Avenue (Additive only)
- 8 quantum principles, VR portal, Coherence Dashboard Widget

### Push Notifications, PWA, AI Integrations, 40+ pages

## Key DB Collections (Subscriptions)
- `user_credits`: { user_id, balance, tier, subscription_active, subscription_id, credits_refreshed_at, total_spent, total_credits_used }
- `payment_transactions`: { id, session_id, user_id, type, tier_id/pack_id, amount, currency, payment_status, created_at, paid_at }
- `credit_log`: { id, user_id, amount, reason, created_at }

## Test: 69 iterations, all 100% pass rate
## Credentials: test@test.com / password
## Status: LAUNCH READY

## Future/Backlog
- Production launch final checks (remove stray console logs, optimize routes)
- Refactor star_cultures.py into JSON seed file or MongoDB collection
- Implement tier-gated features (block Sora for non-Premium, etc.)
- Monthly credit refresh cron job for free/starter/plus tiers
- Subscription renewal handling via Stripe webhooks
- Quantum Entanglement social feature
