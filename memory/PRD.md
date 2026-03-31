# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (unified LLM via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor

## What's Been Implemented

### Trial Graduation Modal (Mar 31, 2026) — NEW
- **Personalized graduation experience**: When 7-day Plus trial expires, shows a warm modal with:
  - "Your cosmic trial has concluded" header
  - Activity highlight cards showing what the user explored (coaching sessions, Cosmos chats, soundscapes, journal entries, etc.)
  - Total cosmic interactions count
  - Credits used during trial
  - "Keep your Plus access" upgrade button → `/pricing?from=trial&highlight=plus`
  - "Continue with free plan" dismiss option
- **Smart dismissal**: Stores `expired_at` timestamp in localStorage so modal only shows once per trial expiry
- **Backend**: `/api/subscriptions/trial-summary` aggregates activity from 9 collections (coach, cosmos, mixer, journal, mood, meditation, oracle, starseed, realms)

### Error Handling & Resilience (Mar 31, 2026)
- CosmicErrorBoundary, Global Axios Interceptor, Cosmic-themed loaders and fallbacks
- Inline chat errors for Coach and Cosmos assistant

### 7-Day Free Plus Trial (Mar 31, 2026)
- Auto-activated on registration, auto-expires, trial-aware Pricing page
- TrialBanner with urgency state, "KEEP YOUR TRIAL FEATURES" badge on Plus card

### Gemini AI — Unified Brain (Mar 31, 2026)
- ALL ~35 LlmChat instances on Gemini 3 Flash
- Context-Aware Cosmos Floating Assistant (26-page map, translucent glass button)

### Star Chart Fuzzy Search (Mar 31, 2026)
- Fuzzy match handles partial names and typos

### Core Platform
- Auth, dashboard, wellness, AI Coach, Star Chart (20 cultures), Oracle, Sacred Texts
- Trade Circle, Gamification, Starseed (8 origins), Multiverse Realms (6 dimensions)
- MixerContext (Global Audio), SmartDock, Soundscapes, Stripe Premium Tiers
- Multi-Language (7), VR, PWA

## Test Report History
- Iteration 145-148: All 100% pass
- Iteration 149: Trial Graduation (Backend 11/11, Frontend 10/10)

## Credentials
- Admin: kyndsmiles@gmail.com / password
- Expired trial test: grad_test_522@test.com / testpass123

## Upcoming Tasks

### P1 — Next
- Cooperative Boss Encounters (community meditation/frequency goals)
- Loot/Inventory System (manage gems & digital assets)

### P2 — Backlog
- Virtual Rock Hounding, Myths & Legends Encyclopedia
- Global Immersion Level Toggles, Language preference persistence

### P3 — Future
- Spore-like Spiritual Avatar Creator, Gem Resonance engine, AI Scene Recreations

## Architecture Rules
- **Audio**: Always `useMixer()`, never `new AudioContext()`
- **AI**: Always `.with_model("gemini", "gemini-3-flash-preview")`
- **Errors**: Use `getCosmicErrorMessage()` + `CosmicError` for themed fallbacks
- **Trial**: Auto-expiry in `get_user_credits()`, graduation modal via `TrialGraduation.js`
