# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Architecture
- **Frontend:** React + Tailwind CSS + Framer Motion + Web Audio API + Context API
- **Backend:** FastAPI + Motor Async MongoDB
- **AI:** OpenAI GPT-4o, GPT Image 1, TTS (nova), Whisper STT — via Emergent LLM Key
- **Payments:** Stripe (test key)
- **PWA:** Service worker + manifest

## Core Features (Implemented)
- Landing page with Sora 2 cinematic intro, Guided App Tour
- Auth (JWT-based), Creator Dashboard (DND widgets)
- Star Chart (3D, multi-culture), Crystals & Stones
- Starseed Adventure (AI RPG), Starseed Realm (Multiplayer)
- Starseed Worlds (Multiverse portals)
- Spiritual Avatar Creator + Gallery (Radiate votes)
- Cosmic Ledger (cross-origin persistence)
- Cosmic Mixer (multi-layer audio, accordion UI, voice commands, tempo sync)
- Meditation, Breathwork, Yoga, Journal, Zen Garden
- Sacred Texts with AI Scene Recreations
- Stripe subscription system

## Completed This Session (2026-03-30)

### Phase 1: Sticky Master Controls Footer
- Pinned bottom bar on Mixer with Stop All + Master Volume + Mute + active layer count
- Wellness-first UX: always accessible, no hunting through accordions

### Phase 2: Major Refactoring (P1)
- Extracted 15 reusable components into `/frontend/src/components/starseed/`
- StarseedAdventure: 945 → 210 lines (78% reduction)
- StarseedRealm: 1290 → 431 lines (67% reduction)
- SpiritualAvatarCreator: 737 → 341 lines (54% reduction)

### Phase 3: Quick Meditate FAB
- Global floating action button visible on all authenticated pages (hidden on Mixer/Auth/Home)
- One-tap "Deep Zen" preset: 528Hz + 174Hz + Ocean Waves + 60 BPM
- Haptic heartbeat pattern at 60 BPM
- 2-second fade-in on activation, 1.5-second fade-out on deactivation
- Self-contained Web Audio engine (doesn't conflict with Mixer)

### Phase 4: Founder Badge System
- Backend: /api/starseed/realm/claim-founder + /api/starseed/realm/founder-status
- Founder badge with exclusive aura color (#FCD34D) and haptic pattern
- Exclusive "Founder's Harmonic" frequency (432.11Hz) unlocked in Mixer
- Badge icon shown on leaderboard entries, Realm ranks

### Phase 5: Enhanced Multi-Category Leaderboard
- "Shining Brightest" — Level & XP (original, renamed with wellness framing)
- "Brightest Aura" — Total Gallery Radiate votes received
- "Most Helpful" — Alliance chat activity + contributions
- "Founders" — Chronological list of early explorers
- All categories show Founder badge icons where applicable

## Backlog (Prioritized)
### P2 — Mobile App Store Scaffolding (Capacitor)
- Native build checks, haptics integration
- Founder haptic patterns would enhance native experience

### P2 — VR Immersive Modes
- Completion and verification
- Clean component architecture ready for VR overlay rendering

## Technical Constraints
- `@dnd-kit/sortable` MUST stay at 8.0.0
- Mixer uses JavaScript `Map` objects for multi-select
- Emergent LLM Key for all AI integrations
- MongoDB `_id` exclusion in all API responses

## Key API Endpoints
- `/api/voice/command` — Whisper STT + GPT intent
- `/api/starseed/realm/claim-founder` — Founder badge claim
- `/api/starseed/realm/founder-status` — Check founder status
- `/api/starseed/realm/leaderboard` — Enhanced 4-category leaderboard
- `/api/cosmic_ledger/*`, `/api/spiritual_avatar/*`, `/api/starseed/*`

## Test Credentials
- Email: kyndsmiles@gmail.com
- Password: password
