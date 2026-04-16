# ENLIGHTEN.MINT.CAFE — V56.1 Interactive Simulations
## Product Requirements Document
### Last Updated: April 16, 2026

---

## Original Problem Statement
Build "The Cosmic Collective" / "ENLIGHTEN.MINT.CAFE", an esoteric, immersive full-stack wellness platform blending standard wellness tracking with deep mathematical/divination systems, personalized AI, and Wellness MMORPG mechanics.

---

## Architecture
- **Frontend**: React PWA (166 pages, 161 lazy-loaded), 3D Spatial Room Engine, Framer Motion
- **Backend**: FastAPI with auto-discovered routes (170+), MongoDB
- **Economy**: Credits-only ($10/hr = 10 Credits/hr), Phi-escrow (1.618%)
- **3D System**: CSS translate3d/perspective, 9x9xZ grid, Fibonacci depth steps
- **AI**: GPT-5.2 via Emergent LLM Key

---

## Implemented Features

### V55.0 — Foundation
- Avatar Integration, Sacred Geometry Engine, Sovereign Economy, TWA, OmniBridge, 160+ page migration

### V56.0 — Vitality Overlay + Discovery Engine
- InteractiveModule → Discovery Exploration Engine (8 pages: Crystals 12, Herbology 12, Aromatherapy 12, Elixirs 10, Mudras 25, Nourishment 8, Reiki 10, Acupressure 10)
- SpatialRoom atmosphere (cave walls, particles, fog, portal flash, scene images, room name badges)
- ProgressionToast, useWorkAccrual RPG Bridge, VitalityBar, 8 cross-system milestones
- CinematicWalkthrough 3D camera, Oracle/Tarot 3D cards

### V56.1 — Interactive Simulations + Cross-Module Challenges
- **I Ching Coin Toss**: Yarrow stalk probability model (6.25% Old Yin, 31.25% Young Yang, 43.75% Young Yin, 18.75% Old Yang). 3D animated coin flips, hexagram builds bottom-up line by line (6 lines), auto-fires oracle reading on completion. Changing lines highlighted in gold.
- **Yoga Guided Flow**: Timed pose sequence with breath sync ring (inhale/hold/exhale phases). Displays poses one at a time with countdown timer. Awards +5 XP per pose, +25 XP for full sequence completion. Breath patterns vary by difficulty (default/restorative/power/meditation).
- **Progressive Content Gating**: ProgressGate component checks milestones via /api/rpg/milestones before rendering content. Shows locked state with progress bar toward requirement.
- **Cross-Module Daily Challenges API**: 4 elemental challenges (Earth, Air, Fire, Water) with multi-room tasks and XP multipliers (1.2-1.3x). Tasks span breathing, crystals, oracle, yoga, meditation, herbs, reiki, mood tracking. GET /api/challenges/daily-cross-module + POST /api/challenges/daily-cross-module/claim.

---

## All Verified Data Endpoints (15 APIs confirmed)
| Endpoint | Items | Status |
|----------|-------|--------|
| GET /api/crystals | 12 | OK |
| GET /api/herbology/herbs | 12 | OK |
| GET /api/aromatherapy/oils | 12 | OK |
| GET /api/elixirs/all | 10 | OK |
| GET /api/mudras | 25 | OK |
| GET /api/nourishment | 8 | OK |
| GET /api/reiki/positions | 10 | OK |
| GET /api/acupressure/points | 10 | OK |
| GET /api/yoga/styles | 7 | OK |
| GET /api/oracle/zodiac | 12 | OK |
| GET /api/frequencies | 12 | OK |
| GET /api/rpg/character | - | OK |
| GET /api/rpg/milestones | 8 | OK |
| POST /api/transmuter/work-submit | - | OK |
| GET /api/challenges/daily-cross-module | 4 | OK |

---

## Prioritized Backlog

### P1
- Wire ProgressGate into DreamRealms/StarseedAdventure pages
- Build frontend UI for Cross-Module Daily Challenges display
- Add more room scene environments

### P2
- Native mobile recording
- Phygital NFC hooks
- Vitality Dashboard (optional)

---

## Technical Notes
- Economy uses CREDITS ONLY. Never "$" or "USD"
- InteractiveModule powers 8 pages — changes system-wide
- Never batch-purge 3D CSS (Flatland Trap)
- Code splitting: 161/166 pages lazy-loaded
