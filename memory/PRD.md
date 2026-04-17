# ENLIGHTEN.MINT.CAFE — V63.0 Architectural Singularity
## PRD — Last Updated: April 17, 2026

---

## V63.0 — Ancestor Migration + Intent Search + 4 New Cells

### Strike 1: Ancestor Migration
- Masonry & Carpentry now live in the dynamic registry at `/workshop/masonry` and `/workshop/carpentry`
- Data imported from workshop.py into MODULES dict — zero duplication
- Old manual page routes still work for backwards compatibility
- Total fractal uniformity: every workshop uses the same DNA

### Strike 2: Intent-Based Neural Search
- `GET /api/workshop/search?q=safety` returns cross-domain results
- 17 modules tagged with weighted intent keywords (10 tags each)
- Scoring: title match (10), domain match (8), tag match (3), material/tool match (7/4)
- "safety" bridges Child Care + Nursing + Electrical + First Aid
- "consciousness" bridges Meditation + Hermetics
- "structure" bridges Masonry + Carpentry + Welding

### Strike 3: 4 New Cells
- **HVAC** (`/workshop/hvac`): Ductwork, Refrigerant R-410A, Smart Thermostat × 9 tools
- **Robotics** (`/workshop/robotics`): Servo Motor, Microcontroller, Sensor Array × 9 tools
- **First Aid** (`/workshop/first_aid`): Wound/Bleeding, CPR/AED, Shock Management × 9 tools
- **Hermetics** (`/workshop/hermetics`): Emerald Tablet, The Kybalion, Alchemical Process × 9 tools

### System Totals
- **171 hub nodules**, **17 workshop cells** in Master Registry
- **63 materials** with 6-depth Recursive Dives, **153 tools**
- **791KB main bundle** (unchanged — all new cells are lazy chunks)
- **7 Passport domains** with all new skills mapped
- **Intent search** across all modules with weighted cross-domain tagging

## Architecture
- `DynamicWorkshop.js` → reads `/api/workshop/registry` → renders any module
- `workshop_v60.py` → all module data, universal endpoints, registry, search
- Single route `/workshop/:moduleId` handles infinite modules
- Adding a module = 1 data block + 1 registry entry (no frontend code)

## Backlog
### P1
- Expand V62-V63 modules to 6 materials (parity)
- Frontend search UI component
- Remove old manual workshop page files (cleanup)
### P2
- More cells: Public Speaking, Philosophy, Pedagogy, Anatomy, Machining
- Meritocratic depth tiers, Sovereign Leaderboard
- Predictive navigation
