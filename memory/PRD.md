# ENLIGHTEN.MINT.CAFE — V62.0 Dynamic Registry Architecture
## PRD — Last Updated: April 17, 2026

---

## V62.0 — Dynamic Workshop Router + 4 New Cells + Parity II

### Dynamic Workshop Router (The Ghost Router)
- **`DynamicWorkshop.js`**: Single route `/workshop/:moduleId` renders ANY workshop
- Reads config from `GET /api/workshop/registry`, shapes itself dynamically
- Adding a new module: 1 data block in workshop_v60.py, 1 registry entry. Zero frontend code.
- **`GET /api/workshop/registry`**: Returns full manifest of all 11+ workshop modules

### 4 New Cells (V62.0)
- **Welding** (`/workshop/welding`): Mild Steel, Aluminum 6061, Stainless 304 × 9 tools
- **Automotive** (`/workshop/automotive`): Engine Block, Brake System, Electrical Harness × 9 tools
- **Nutrition** (`/workshop/nutrition`): Whole Foods, Fermented Foods, Superfoods × 9 tools
- **Meditation** (`/workshop/meditation`): Inner Silence, Breath Awareness, Visualization × 9 tools

### Parity II (V62.0)
- Child Care expanded to 6: +Toddler Nutrition, Conflict Resolution, Cognitive Play
- Elderly Care expanded to 6: +Palliative Care, Occupational Therapy, End-of-Life Dignity

### Neural Clusters (V62.0)
- Welding ↔ Automotive ↔ Electrical (Trades cluster)
- Nutrition ↔ Herbology ↔ Nursing (Healing cluster)
- Meditation ↔ Yoga ↔ Breathing ↔ Bible Study (Spirit cluster)

### System Totals
- **167 hub nodules**, **13 Circular Workshop cells**
- **51 materials** with 6-depth Recursive Dives, **117 tools**
- **791KB main bundle** (unchanged)
- **11 modules** in the Master Registry, expandable to 200+ with data entries only

## Architecture
- `DynamicWorkshop.js` → reads registry → renders `UniversalWorkshop`
- `workshop_v60.py` → all module data + universal endpoints + Master Registry
- `SovereignProviders.js` → 26 contexts consolidated
- Trade Passport: 7 domains, 8+ hybrid titles, all new skills mapped
- Dynamic route: `/workshop/:moduleId` handles infinite modules

## Backlog
### P1
- Intent-based search across Passport domains
- Expand new V62 modules to 6 materials (parity)
- Migrate existing workshop pages (Masonry/Carpentry) to dynamic router
### P2
- More workshop cells via registry (HVAC, Robotics, Public Speaking, Philosophy, etc.)
- Meritocratic depth tiers
- Sovereign Leaderboard
- Predictive navigation
