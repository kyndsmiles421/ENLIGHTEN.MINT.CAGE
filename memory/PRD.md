# ENLIGHTEN.MINT.CAFE — V57.0 Cohesive Organism
## PRD — Last Updated: April 17, 2026

---

## V57.0 — Full Systemic Activation

### Trade Workshops (Cells 1-2)
- **Masonry Workbench** (`/masonry-workbench`): 6 stones × 9 tools × 6-depth Recursive Dive
- **Carpentry Workbench** (`/carpentry-workbench`): 6 woods × 9 tools × 6-depth Grain Dive
- Universal guest access. GPT-5.2 tutorials + RPG XP for authenticated users

### Sovereign Trade Passport (Central Registry)
- **`/trade-passport`**: 7 Skill Domains, 8 Hybrid Titles, Dive Clearance L0-L5
- Skill Lattice Web (SVG radar chart), domain mastery rows, expandable title cards
- `GET /api/rpg/passport` aggregates `rpg_xp_log` across all module sources

### UI Flattening (System-Wide Card Purge)
- Removed ALL duplicate `<BackToHub />` — only global instance in App.js remains
- 0 pages have local BackToHub renders (verified via grep audit)
- Cross-cell "Related" navigation wired for workshops (Masonry ↔ Carpentry ↔ Passport ↔ Trade Circle)

### Neural Context Signal (Cross-Cell Memory)
- AI Panel tracks `window.__moduleJourney` (last 5 module visits)
- Generator context includes journey thread: "User came from Carpentry, now in Masonry"
- `MODULE_SIBLINGS` map connects related cells for intelligent context flow
- Journey breadcrumb visible in Generator UI section

### XP Audit (Vitality Pulse Verification)
- 153/156 pages fire `__workAccrue` (16 excluded: auth/admin/settings/landing — correct)
- Full pipeline verified: Workshop → XP log → Passport → Domain mastery (instant)
- ProgressionToast recognizes all trade sources (Masonry_Skill, Carpentry_Skill, masonry_dive, carpentry_dive, etc.)

## V56.8 — Structural Defrag + Bundle Optimization
- Main bundle: 1.1MB — deferred 26 engines to requestIdleCallback
- 204+ lazy chunks, z-index cleanup, ghost buttons purged

## Architecture
- 156 hub nodules across 10 Command Pillars
- Circular Workshop Engine (reusable DNA)
- Trade Passport Central Registry (7 domains, 8 hybrid titles)
- Neural Context Signal (cross-cell AI memory)
- Global Generators with journey-aware context
- useWorkAccrual heartbeat → VitalityBar + ProgressionToast

## Key Files
- `/app/frontend/src/pages/MasonryWorkbench.js`
- `/app/frontend/src/pages/CarpentryWorkbench.js`
- `/app/frontend/src/pages/TradePassport.js`
- `/app/backend/routes/workshop.py`
- `/app/backend/routes/rpg.py` (Passport endpoint)
- `/app/frontend/src/components/console/AIPanel.js` (Neural Context Signal)
- `/app/frontend/src/components/BackToHub.js` (Related navigation)

## Backlog
### P1
- Batch-replicate Circular Workshop DNA to remaining trades (Electrical, Plumbing, Landscaping)
- 800KB bundle seal (tree-shake Generators/Creators from initial load)
- Intent-based search (index tags/categories from Trade Passport domains)
### P2
- Meritocratic depth tiers (volunteer hours → deeper dive access)
- Sovereign Leaderboard (anonymous community mastery ranking)
- Native mobile recording, Phygital NFC hooks
