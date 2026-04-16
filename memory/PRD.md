# ENLIGHTEN.MINT.CAFE — V56.0 Vitality Overlay + Discovery Engine
## Product Requirements Document
### Last Updated: April 16, 2026

---

## Original Problem Statement
Build "The Cosmic Collective" / "ENLIGHTEN.MINT.CAFE", an esoteric, immersive full-stack wellness platform blending standard wellness tracking with deep mathematical/divination systems, personalized AI, and Wellness MMORPG mechanics.

**Core Requirements**: PWA, Sovereign Unified Engine, "Zero-Scale Parentage" physics, 3D Spatial Environment (9x9xZ math coordinate system), In-Place Transformations (No Modals/Overlays), Global Gamification.

---

## Architecture
- **Frontend**: React PWA (166 pages), 3D Spatial Room Engine, Framer Motion
- **Backend**: FastAPI with auto-discovered routes (170+), MongoDB
- **Economy**: Credits-only ($10/hr = 10 Credits/hr), Phi-escrow (1.618%)
- **3D System**: CSS translate3d/perspective, 9x9xZ grid, Fibonacci depth steps
- **Cultural**: 10-tradition OmniBridge (Lakota, Egyptian, Vedic, Yoruba, Mayan, Aboriginal, Celtic, Kabbalistic, Taoist, Sufi)
- **AI**: GPT-5.2 via Emergent LLM Key for cross-tradition insights
- **Deployment**: TWA (Trusted Web Activity) for Google Play Store

---

## What's Been Implemented

### V55.0 (Previous Sessions)
- Avatar Integration: AvatarContext → 3D Avatar token in rooms
- Sacred Geometry Engine: Fibonacci breathing, Phi-ratio proximity scaling
- Sovereign Economy: 10 Credits/hr, 10 Fans/hr, 1.618% Phi escrow
- TWA & Manifest Config: com.enlighten.mint.cafe fullscreen manifest
- OmniBridge & Sovereign Library: 10 cultural traditions cross-linked
- 160+ page batch migration to SpatialRoom system
- SpatialRouter auto-wrapping all routes

### V56.0 Vitality Overlay + Discovery Engine (April 16, 2026)

#### System-Wide Gamification
- **InteractiveModule → Discovery Exploration Engine**: Complete rewrite. Items appear as fog-shrouded nodes on a grid. Tap to discover (awards 8 XP with animated popup). Mastery tracking: Novice → Student → Adept → Master. Knowledge Challenge mode with quizzes from discovered items. Discovery state persists in localStorage. Powers 8 pages: Crystals, Herbology, Aromatherapy, Elixirs, Mudras, Nourishment, Reiki, Acupressure.

#### Visual Immersion
- **SpatialRoom atmosphere boost**: Cave walls 30% width with crystal vein lines, atmospheric fog at bottom, larger glowing particles (3-9px at 15-50% opacity), ceiling shadows for HOLLOW_EARTH rooms. Air realm horizon line and sky gradient. Surface realm visible wall edges.
- **Portal Entry Flash**: Accent-colored radial gradient burst on every room entry.
- **Scene Environment Images**: Subtle atmospheric backgrounds for Oracle (tarot cloth), Meditation (candlelit temple), Breathing (sky temple columns), Crystals (underground cavern), Herbology (botanical greenhouse), Star Chart (observatory), Yoga (zen studio), Frequencies (sound visualization), Teachings (temple incense).
- **Room Name Badge**: Visible location marker with room name and realm in top-left of every spatial room.

#### Progression Engine
- **ProgressionToast**: Floating 3D toasts for Stardust gains, level-ups, milestone unlocks.
- **useWorkAccrual RPG Bridge**: Calls POST /rpg/character/gain-xp after every dust sync. Fires vitality-pulse events.
- **VitalityBar**: Real-time level/XP bar in SpatialRoom header.
- **Cross-System Milestones**: 8 milestones tied to activity counts (Air Temple, Crystal Skin, Mystic Cloak, Dream Realms, Ritual Master, Mood Cartographer, Herbalist, Sound Weaver).

#### Cinematic Engine
- **CinematicWalkthrough rewrite**: True 3D camera animation via translate3d+rotateY on #app-stage. 5 sequences with cinematic letterbox bars and HUD.

#### Oracle/Tarot 3D
- **TarotCard**: preserve-3d, Z-depth fan spread, hover translateZ lift, backface-visibility, glow effects.

---

## Key API Endpoints
- POST /api/transmuter/work-submit — Dust accrual
- POST /api/rpg/character/gain-xp — Award XP
- GET /api/rpg/milestones — Cross-system milestone progress
- POST /api/rpg/milestones/claim — Claim milestone rewards
- GET /api/rpg/character — Full character stats

---

## Prioritized Backlog

### P1 (Important)
- Code splitting for dynamic imports (1.70MB bundle)
- More room-specific interactive simulations (I Ching coin toss, yoga guided flows)
- Progressive content gating (lock pages behind milestone completion)

### P2 (Future)
- Native mobile screen recording
- Phygital Marketplace NFC hooks
- Daily challenges spanning multiple modules
- Vitality Dashboard page (optional, user's choice if they want it)

---

## Technical Notes
- Economy uses CREDITS ONLY. Never "$" or "USD".
- Z-axis navigation via translateZ, not vertical scrolling.
- Sacred Geometry math: Phi (1.618), Fibonacci depth steps.
- The "Flatland Trap": Never batch-purge 3D CSS. Each page may have unique 3D implementations.
- InteractiveModule powers 8 pages — changes to it are system-wide.
