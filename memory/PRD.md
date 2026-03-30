# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals.

## Architecture
- **Frontend:** React + Tailwind CSS + Framer Motion + Web Audio API (GainNodes, LFOs for Tempo sync) + Context API
- **Backend:** FastAPI + Motor Async MongoDB
- **AI:** OpenAI GPT-4o (text/intent), GPT Image 1, TTS (nova), Whisper STT — all via Emergent LLM Key
- **Payments:** Stripe (test key)
- **PWA:** Service worker + manifest

## Core Pages & Features (Implemented)
- Landing page with Sora 2 cinematic intro, Guided App Tour
- Auth (JWT-based)
- Creator Dashboard with DND widget rearranging (@dnd-kit/sortable@8.0.0)
- Star Chart (3D, multi-culture)
- Starseed Adventure (AI RPG with branching scenes, image generation)
- Starseed Realm (Multiplayer: encounters, alliances, chat, boss fights, loot)
- Starseed Worlds (Multiverse portals)
- Spiritual Avatar Creator (Spore-like, AI-generated images)
- Avatar Gallery (community showcase + Radiate votes)
- Cosmic Ledger (cross-origin persistence, milestones)
- Cosmic Mixer (multi-layer audio: 15+ frequencies, 11 ambient, 16 instruments, 18 mantras)
  - Global Tempo & Beat Engine (TempoContext with LFOs)
  - Voice Commands (Whisper STT + GPT intent parsing)
  - Accordion UI (mobile-first)
  - **Sticky Master Controls Footer** (Stop All + Master Volume, always visible)
- Crystals & Stones encyclopedia
- Meditation, Breathwork, Yoga, Journal, Zen Garden
- Sacred Texts with AI Scene Recreations
- Stripe subscription system

## Completed This Session (2026-03-30)
1. **Sticky Master Controls Footer** on Cosmic Mixer — pinned bottom bar with Stop All + Master Volume + Mute toggle + active layer count. Wellness-first UX for stress relief.
2. **Major Refactoring (P1)** — Extracted 15 reusable components from 3 massive files:
   - `StarseedAdventure.js`: 945 → 210 lines (78% reduction)
   - `StarseedRealm.js`: 1290 → 431 lines (67% reduction)
   - `SpiritualAvatarCreator.js`: 737 → 341 lines (54% reduction)
   - New components: `/app/frontend/src/components/starseed/` (constants, StatBar, XPBar, CosmicCanvas, SceneImage, CharacterSelect, GameScene, RealmStarMap, WorldEventBanner, EncounterScene, EncounterResult, AllianceChat, BossEncounterPanel, AvatarComponents)

## Backlog (Prioritized)
### P2 — Realm Leaderboard Enhancements
- Add "Brightest Aura" / "Most Helpful" categories based on Gallery Radiate votes
- Add "Founder" badge for early portal explorers (future live events tie-in)
- Positive wellness-themed framing (not competitive stress)

### P2 — Mobile App Store Scaffolding (Capacitor)
- Native build checks
- Haptics integration

### P2 — VR Immersive Modes
- Completion and verification
- Leverages newly cleaned component architecture

## Technical Constraints
- `@dnd-kit/sortable` MUST stay at 8.0.0 (version 10 breaks with core@6.3.1)
- Mixer uses JavaScript `Map` objects for multi-select state
- Emergent LLM Key for all AI integrations
- MongoDB `_id` exclusion in all API responses

## Key API Endpoints
- `/api/voice/command` — Whisper STT + GPT intent
- `/api/cosmic_ledger/*` — Global spiritual state
- `/api/starseed/origins`, `/api/starseed/generate-scene`, `/api/starseed/realm/*`
- `/api/spiritual_avatar/*`
- `/api/starseed/worlds/explore`

## Test Credentials
- Email: kyndsmiles@gmail.com
- Password: password
