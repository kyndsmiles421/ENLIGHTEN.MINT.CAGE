# ENLIGHTEN.MINT.CAFE — V64.1 The Sovereign Seal
## PRD — Last Updated: April 17, 2026

## V64.1 — Oracle Vision + Route Purge

### 22 Workshop Cells in Master Registry
**Trade & Craft (9):** Masonry, Carpentry, Electrical, Plumbing, Landscaping, Welding, Automotive, HVAC, Machining
**Healing Arts (5):** Nursing, Child Care, Elderly Care, First Aid, Nutrition
**Sacred Knowledge (3):** Bible Study, Hermetics, Philosophy
**Science & Physics (2):** Robotics, Anatomy
**Mind & Spirit (1):** Meditation
**Exploration (2):** Public Speaking, Pedagogy

### Parity Status
- 13 modules at 6 materials (full parity)
- 9 modules at 3 materials (Welding, Automotive, Nutrition, Meditation, Speaking, Philosophy, Pedagogy, Anatomy, Machining)

### Intent-Based Neural Search (Oracle)
- `GET /api/workshop/search?q=` — cross-domain weighted search
- 22 modules x 10 tags each = 220 intent keywords
- Bridges physical, biological, and metaphysical domains
- **Frontend Oracle Search UI** — inline in SovereignHub, groups results by domain, domain bridge bar with glow, "N domains bridged" indicator
- Pillar glow: Hub accordion pillars glow when their domain has active search results

### Architecture
- `DynamicWorkshop.js` + `/workshop/:moduleId` = infinite modules from one route
- `OracleSearch.js` = inline neural search with domain-grouped results and bridge indicators
- `workshop_v60.py` = all data + universal endpoints + registry + search
- `SovereignProviders.js` = 26 contexts consolidated
- **791KB main bundle** with 210+ lazy chunks
- **176 hub nodules** total
- `BackToHub.js` = fully remapped to dynamic `/workshop/` routes (zero legacy `-workbench` paths)

### Session Summary (V57-V64.1)
- V57: 2 manual workshops (Masonry + Carpentry)
- V58: Dead import purge (1.1MB → 1.03MB)
- V59: SovereignProviders consolidation (1.03MB → 791KB) — TARGET HIT
- V60: UniversalWorkshop + 5 new cells
- V61: Parity + Social Pillar + Neural Clusters
- V62: Dynamic Router + 4 cells + search endpoint
- V63: Ancestor migration + 4 more cells + intent tags
- V64: 5 final cells + parity expansion + complete
- V64.1: Oracle Search UI (frontend) + BackToHub route purge — COMPLETE

## Completed (V64.1)
- [x] Oracle Search UI in SovereignHub (inline, domain-grouped, bridge indicators)
- [x] BackToHub.js legacy route purge (all -workbench → /workshop/)
- [x] Pillar glow effect when search results bridge domains
- [x] 22 workshop cells in master registry
- [x] 791KB Metabolic Seal maintained
- [x] Dynamic workshop router
- [x] TradePassport global RPG tracking

## Backlog
### P1
- Expand remaining 9 modules to 6 materials
- Update Passport domain sources for new V64 skills
- Verify XP flow for all 22 registry modules
- Ensure 36-bit Recursive Dive consistency (6 depths in all modules)
### P2
- More cells (Economics, Music Theory, Permaculture, etc.)
- Meritocratic depth tiers
- Sovereign Leaderboard
- Predictive navigation
- Native mobile screen recording
- Phygital Marketplace NFC hooks
