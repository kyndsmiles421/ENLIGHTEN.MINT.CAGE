# ENLIGHTEN.MINT.CAFE — V56.0 Vitality Overlay
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

### V56.0 Vitality Overlay (April 16, 2026)
- **ProgressionToast**: Floating 3D progression feedback system. Fires on dust/XP gain, level-ups, and milestone unlocks. Mounted globally in App.js.
- **useWorkAccrual RPG Bridge**: Now calls POST /rpg/character/gain-xp after every dust sync. Fires vitality-pulse custom event for visual feedback. Checks milestones locally.
- **Cinematic Walkthrough Rewrite**: True 3D camera animation via translate3d+rotateY on #app-stage. 5 sequences (wellness, divination, nature, sovereign, full) with cinematic letterbox bars and HUD overlay.
- **Oracle/Tarot 3D Restoration**: TarotCard component rebuilt with preserve-3d, Z-depth fan spread, hover translateZ lift, backface-visibility, glow effects.
- **VitalityBar**: Real-time level/XP progress bar in SpatialRoom header. Subscribes to vitality-pulse events for live updates.
- **Cross-System Milestones API**: GET /api/rpg/milestones (progress tracking), POST /api/rpg/milestones/claim (reward XP + items). 8 milestones: Air Temple (3 breathing), Crystal Skin (5 meditations), Mystic Cloak (3 oracle readings), Dream Realms (3 dream journals), Ritual Master (7 daily rituals), Mood Cartographer (10 mood logs), Herbalist (5 herbology), Sound Weaver (5 frequencies).

---

## Key API Endpoints
- POST /api/transmuter/work-submit — Dust accrual with exponential math
- POST /api/rpg/character/gain-xp — Award XP from any source
- GET /api/rpg/milestones — Cross-system milestone progress
- POST /api/rpg/milestones/claim — Claim milestone rewards
- GET /api/rpg/character — Full character stats
- GET /api/omni-bridge/traditions — All 10 cultural traditions
- POST /api/omni-bridge/cross-tradition — GPT-5.2 cultural bridging

---

## Prioritized Backlog

### P0 (Critical)
- All V56.0 features implemented and tested ✅

### P1 (Important)
- Code splitting for dynamic imports (1.70MB bundle)
- Audit remaining pages for batch CSS purge collateral damage

### P2 (Future)
- Native mobile screen recording (currently shows fallback toast)
- Phygital Marketplace NFC hooks
- Progressive content locking (gate pages behind milestone completion)
- Daily challenges spanning multiple modules

---

## Technical Notes
- Economy uses CREDITS ONLY. Never "$" or "USD".
- Z-axis navigation via translateZ, not vertical scrolling.
- Sacred Geometry math: Phi (1.618), Fibonacci depth steps.
- The "Flatland Trap": Never batch-purge 3D CSS. Each page may have unique 3D implementations.
