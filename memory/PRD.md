# ENLIGHTEN.MINT.CAFE — V60.0 Total Organism Activation
## PRD — Last Updated: April 17, 2026

---

## V60.0 — Universal Workshop DNA + 5 New Cells

### Universal Workshop Engine
- **`UniversalWorkshop.js`**: ONE component powering ALL workshop cells
- Props-driven: moduleId, title, icon, accentColor, skillKey → renders any cell
- Page wrappers are 8 lines each — pure config, zero logic duplication
- **`workshop_v60.py`**: Universal backend with dynamic `/workshop/{module_id}/materials|tools|tool-action` endpoints

### 5 New Sovereign Cells (Batch Activated)
- **Electrical** (`/electrical-workbench`): Copper Wire, Romex, EMT Conduit × 9 tools (Wire Stripper through Torque Driver)
- **Plumbing** (`/plumbing-workbench`): Copper Type L, PVC Sch 40, PEX-A × 9 tools (Pipe Wrench through Deburring Tool)
- **Landscaping** (`/landscaping-workbench`): Loam Topsoil, Crushed Gravel, Compost × 9 tools (Spade through Line Level)
- **Nursing** (`/nursing-workbench`): Patient Vitals, Wound Assessment, Medication Admin × 9 tools (Stethoscope through Therapeutic Presence)
- **Bible Study** (`/bible-study-workbench`): Genesis, Psalms, Gospel of John × 9 tools (Greek/Hebrew Lexicon through Lectio Divina)
- All have 6-depth Recursive Dives from surface to quantum/molecular/spiritual level

### Trade Passport Domain Integration
- Trade & Craft domain: +Electrical_Skill, +Plumbing_Skill, +Landscaping_Skill
- Healing Arts domain: +Nursing_Skill
- Sacred Knowledge domain: +Bible_Study_Skill
- ProgressionToast recognizes all new skill sources

## V59.0 — 800KB Metabolic Seal
- **Main bundle: 791KB** (250KB gzipped) — target was 800KB
- SovereignProviders: 26 contexts consolidated into single lazy chunk
- 30+ dead imports purged, engines deferred to requestIdleCallback

## V57.0-V58.0 — Foundation
- Masonry + Carpentry workshops (original DNA)
- Trade Passport (7 domains, 8 hybrid titles, dive clearance)
- Neural Context Signal, system-wide card purge, XP audit

## Architecture
- **161 hub nodules** across 10 Command Pillars
- **UniversalWorkshop.js**: Single component for all workshop cells
- **workshop_v60.py**: Dynamic endpoints for all V60+ modules
- Trade Passport aggregates 7 domains from rpg_xp_log
- 791KB main bundle + 210+ lazy chunks

## Key Files
- `/app/frontend/src/components/UniversalWorkshop.js` — Universal cell engine
- `/app/frontend/src/components/SovereignProviders.js` — Consolidated 26-provider tree
- `/app/backend/routes/workshop_v60.py` — 5 new module data + universal endpoints
- `/app/backend/routes/workshop.py` — Original masonry/carpentry data
- `/app/backend/routes/rpg.py` — Passport with updated domain sources

## Backlog
### P1
- Add more materials to each workshop (3 → 6 for parity with Masonry/Carpentry)
- Intent-based search across Passport domains
- Cross-cell Related navigation for new workshops
### P2
- Child Care, Elderly Care, Meditation workshops
- Meritocratic depth tiers
- Sovereign Leaderboard
- Native mobile recording, Phygital NFC
