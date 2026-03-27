# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective," a highly immersive full-stack wellness platform blending wellness tracking with mystical/divination systems, personalized AI guidance, and cinematic visuals. Add quantum mechanics as a complementary avenue. Architecture for future technologies.

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion, Vanilla Three.js
- Backend: FastAPI, Motor (Async MongoDB)
- Integrations: Emergent LLM Key (OpenAI GPT-5.2, Whisper STT, TTS-1-HD, GPT Image 1, Sora 2)
- Mobile: PWA (iOS + Android), Push Notifications (pywebpush)

## All Implemented Features

### Core Platform
- Auth, profiles, dashboard, mood tracking, journaling, affirmations, gamification
- Global Search (Cmd+K), 6-category mega-menu nav, notification bell
- Mobile accordion navigation

### Trade Circle with Karma System (Feb-Mar 2026)
- **Pure barter marketplace** -- no currency, goods and services only
- Listings with title, description, category (goods/services/both), offering, seeking
- Full CRUD: create, browse, update, delete listings
- **Offer/proposal flow**: make offers, accept/decline, auto-decline remaining on accept
- Listing statuses: active, traded
- Offer statuses: pending, accepted, declined
- Search and category filtering
- **Trade Karma Reputation Score**:
  - Points: +10 trade completed, +3 review given, +1 listing created, +1 offer made
  - 6 Tiers: Seedling (0+), Sprout (10+), Bloom (30+), Guardian (60+), Elder (100+), Luminary (200+)
  - Karma Profile modal with points, tier, trades, rating, reviews
  - Karma Leaderboard tab showing top traders
  - Review system: rate 1-5 stars + optional comment after completed trades
  - Both trade parties can leave reviews; duplicate prevention
  - Tier guide and earning rules displayed in Karma Board tab
- Stats dashboard: active listings, trades completed, my listings, pending offers, trade karma
- 4 tabs: Browse, My Listings, My Offers (sent + received), Karma Board
- Activity feed integration
- Accessible via Explore nav menu + Cmd+K search

### Analytics & Achievements
- Analytics Page (/analytics): Overview, Achievements, Activity tabs
- 15 achievement badges with auto-unlock
- Feature usage charts, 14-day activity graph, coherence history, streak stats

### Quantum Mechanics Avenue (Additive)
- 8 quantum principles, 5 guided meditations, VR Quantum Field portal + journey
- Quantum Coherence Dashboard Widget, future-tech hooks

### Push Notifications
- VAPID Web Push, service worker, bell UI with time preferences
- Background auto-scheduler (asyncio 30min loop)

### Multi-Cultural Star Chart (8 Cultures, 40 Constellations)
- Mayan, Egyptian, Aboriginal, Lakota, Chinese, **Vedic**, **Norse**, **Polynesian**
- Each culture: 5 constellations with RA/Dec coordinates, mythology, lessons, figure paths
- Cultural overlay on 3D star chart with color-coded lines, labels, and mythology sprites
- Culture picker dropdown, story explorer panel with constellation tabs

### Wellness, Mystical, AI, Social, PWA
- Full feature set (40+ pages, 6 AI integrations, VR Sanctuary, Creation Stories, etc.)

## Test: 68 iterations, all 100% pass rate
## Credentials: test@test.com / password
## Status: LAUNCH READY

## Key DB Collections (Trade Karma)
- `trade_karma`: { user_id, points, breakdown, created_at, updated_at }
- `karma_log`: { id, user_id, action, points, related_id, created_at }
- `trade_reviews`: { id, offer_id, listing_id, reviewer_id, reviewer_name, reviewee_id, reviewee_name, rating, comment, created_at }

## Future/Backlog
- Production launch final checks (remove stray console logs, optimize routes)
- Refactor star_cultures.py into JSON seed file or MongoDB collection
- Quantum Entanglement social feature (paired meditations)
- Spatial computing VR headset support
- Neural interface integration
