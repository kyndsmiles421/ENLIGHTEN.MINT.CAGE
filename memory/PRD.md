# ENLIGHTEN.MINT.CAFE — V57.0 Cohesive Organism
## PRD — Last Updated: April 17, 2026

---

## V57.0 — Trade Workshop Activation + Sovereign Passport + UI Flattening

### Trade Workshops (Phase 1-2)
- **Masonry Workbench** (`/masonry-workbench`): 6 stones × 9 tools × 6-depth Recursive Dive into mineral lattice
- **Carpentry Workbench** (`/carpentry-workbench`): 6 woods × 9 tools × 6-depth Grain Dive into wood cellular structure
- Both use identical "Circular Workshop DNA": center material, sprocket tool ring, inline dive, inline tutorials, XP accrual
- **Universal Access**: All endpoints open to guests. GPT-5.2 tutorials + RPG XP for authenticated users

### Sovereign Trade Passport (Phase A — Central Registry)
- **`/trade-passport`**: Unified skill lattice aggregating ALL module activity
- **7 Skill Domains**: Trade & Craft, Healing Arts, Mind & Spirit, Science & Physics, Creative Arts, Exploration, Sacred Knowledge
- **Skill Lattice Web**: SVG radar chart visualizing 7-axis domain mastery
- **Dive Clearance**: L0 (Surface) → L5 (Quantum Shell) based on total actions
- **8 Hybrid Titles**: General Contractor, Master Artisan, Sovereign Healer, Quantum Architect, Renaissance Soul, Cosmic Navigator, Sage Oracle, Hardscape Engineer — unlock when cross-domain thresholds are met
- **Backend**: `GET /api/rpg/passport` aggregates `rpg_xp_log` by source into domain mastery

### UI Flattening (Card Purge)
- Removed duplicate `<BackToHub />` from workshop and passport pages
- Global `BackToHub` in App.js is the single exit point — one reflex, one movement
- Added cross-cell "Related" navigation for workshops (Masonry ↔ Carpentry ↔ Passport ↔ Trade Circle)
- ~20% more vertical screen space recovered for 3D workshop content

## V56.8 — Structural Defrag + Bundle Optimization
- Main bundle: 1.1MB — deferred 26 engine/utility scripts to requestIdleCallback
- 204+ lazy chunks — engines loaded after paint
- z-index cleanup, Ghost buttons purged, BackToHub flattened

## Full System Audit
- 156 hub nodules (153 + Masonry + Carpentry + Passport)
- Zero ghost buttons, zero fixed overlays
- Zero duplicate navigation elements in new modules
- All engines deferred to idle callback

## Architecture
- 10 Command Pillars (156 total nodules)
- **Circular Workshop Engine**: Reusable DNA for all trade modules
- **Trade Passport**: Central Registry aggregating cross-module mastery
- Global Generators (Script/Lesson/Game/Ritual) — context-aware
- Cross-cell "Related" navigation linking workshops to each other

## Key Files
- `/app/frontend/src/pages/MasonryWorkbench.js`
- `/app/frontend/src/pages/CarpentryWorkbench.js`
- `/app/frontend/src/pages/TradePassport.js`
- `/app/backend/routes/workshop.py` — Stone/tool/wood endpoints
- `/app/backend/routes/rpg.py` — Passport endpoint (search "V57.0 SOVEREIGN TRADE PASSPORT")
- `/app/frontend/src/components/BackToHub.js` — Global nav with Related links
- `/app/frontend/src/hooks/useWorkAccrual.js` — XP heartbeat

## Backlog
### P1
- Apply Circular Workshop DNA to remaining trades (Electrical, Plumbing, Landscaping)
- Tree-shaking toward 800KB bundle target (currently 1.1MB)
- AI Game Generator → Quest Accrual verification
- Cross-module search (tags/categories)
- Cross-cell context signaling (AI Panel reads last module context)
### P2
- Meritocratic depth tiers (volunteer hours → deeper dive access)
- Inter-module context flow
- Native mobile recording
- Phygital NFC hooks
