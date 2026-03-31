# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Tech Stack
- **Frontend**: React (CRA + craco), TailwindCSS, Framer Motion, Shadcn/UI, Web Audio API
- **Backend**: FastAPI, MongoDB (Motor)
- **Integrations**: Gemini 3 Flash (unified LLM via Emergent LLM Key), OpenAI TTS/STT, Stripe, Capacitor (native)

## What's Been Implemented

### Error Handling & Resilience (Mar 31, 2026) — NEW
- **CosmicErrorBoundary**: React Error Boundary wraps all routes — "A dimensional rift appeared" with Try Again / Return Home
- **Global Axios Interceptor**: Catches 429/500/502/503 with cosmic-themed toasts, 3s cooldown to prevent spam
- **CosmicFeedback components**: CosmicLoader (spinning gradient ring), CosmicInlineLoader, CosmicPageLoader, CosmicError (with retry)
- **Page-level error states**: Starseed, MultiverseRealms show loaders during fetch and error fallbacks with retry
- **Inline chat errors**: Coach + Cosmos assistant show error messages as chat bubbles, not disruptive toasts
- **No silent failures**: Replaced all `.catch(() => {})` on critical paths with themed error handling

### 7-Day Free Plus Trial (Mar 31, 2026)
- Auto-activated on registration, auto-expires, trial-aware Pricing with "KEEP YOUR TRIAL FEATURES" badge

### Gemini AI — Unified Brain (Mar 31, 2026)
- ALL ~35 LlmChat instances on Gemini 3 Flash, Context-Aware Cosmos Assistant (26-page map)

### Star Chart Fuzzy Search (Mar 31, 2026)
- Fuzzy match handles partial names and typos across Western + cultural constellations

### Core Platform (Previously Built)
- Auth, profiles, dashboard, wellness tracking, AI Coach, Star Chart (20 cultures)
- Oracle, Numerology, Cardology, Sacred Texts, Trade Circle, Gamification
- Starseed Journey (8 origins), Multiverse Realms (6 dimensions)
- MixerContext (Global Audio), SmartDock, Session Recording, Premium Tier Gating (Stripe)
- Multi-Language (7 languages), VR, PWA

## Test Report History
- Iteration 145: Gemini chat + context-aware (100%)
- Iteration 146: Trial registration + auto-expiry (100%)
- Iteration 147: Dumb functionality checklist (Backend 21/21, Frontend 12/12)
- Iteration 148: Error handling layer (Backend 14/14, Frontend 4/4)

## Credentials
- Admin: kyndsmiles@gmail.com / password
- App URL: https://zen-energy-bar.preview.emergentagent.com

## Upcoming Tasks

### P1 — Next
- Trial Graduation modal (personalized summary when trial ends)
- Cooperative Boss Encounters (community meditation/frequency goals)
- Loot/Inventory System

### P2 — Backlog
- Virtual Rock Hounding, Myths & Legends Encyclopedia
- Global Immersion Level Toggles, Language preference persistence

### P3 — Future
- Spore-like Spiritual Avatar Creator, Gem Resonance engine, AI Scene Recreations

## Architecture Rules
- **Audio**: Always use `useMixer()`, never `new AudioContext()`
- **AI**: Always use `.with_model("gemini", "gemini-3-flash-preview")`
- **Errors**: Use `getCosmicErrorMessage()` for themed messages, `CosmicError` for fallback UI
- **Trial**: Auto-expiry in `get_user_credits()` — no cron needed
