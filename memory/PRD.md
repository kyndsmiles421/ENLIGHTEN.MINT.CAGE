# ENLIGHTEN.MINT.CAFE — V65.0 Nervous System Lock
## PRD — Last Updated: April 17, 2026

## V65.0 — The Nervous System Lock

### 22 Workshop Cells in Master Registry
**Trade & Craft (9):** Masonry, Carpentry, Electrical, Plumbing, Landscaping, Welding(6), Automotive(3), HVAC, Machining(6)
**Healing Arts (5):** Nursing, Child Care, Elderly Care, First Aid, Nutrition(6)
**Sacred Knowledge (3):** Bible Study, Hermetics, Philosophy(3)
**Science & Physics (2):** Robotics, Anatomy(6)
**Mind & Spirit (1):** Meditation(3)
**Exploration (2):** Public Speaking(3), Pedagogy(6)

### Parity Status
- 18 modules at 6 materials (full parity)
- 4 modules at 3 materials (Automotive, Meditation, Speaking, Philosophy)
- Total materials: 120 (was 93)

### V65.0 Parity Push (5 modules expanded)
- Machining: +Surface Grinding, EDM, Threading
- Anatomy: +Endocrine System, Lymphatic System, Integumentary (Skin)
- Pedagogy: +Curriculum Mapping, Differentiated Instruction, Behavioral Psychology
- Welding: +Flux-Core Arc, Plasma Cutting, Underwater/Hyperbaric
- Nutrition: +Micronutrient Density, Gut Microbiome, Metabolic Flexibility

### XP Wiring (Nervous System)
- All 22 modules correctly mapped to SKILL_DOMAINS in rpg.py
- V65.0 fixed: Machining→Trade, Anatomy→Science, Speaking→Exploration, Pedagogy→Exploration, Philosophy→Sacred
- 13 Hybrid Titles: General Contractor, Master Artisan, Sovereign Healer, Quantum Architect, Renaissance Soul, Cosmic Navigator, Sage Oracle, Hardscape Engineer, Biomechanical Engineer, Climate Architect, Sovereign Medic, Philosopher King, Sacred Engineer

### Oracle Search (Intent-Based Neural Search)
- `GET /api/workshop/search?q=` — cross-domain weighted search
- Frontend OracleSearch.js: inline in SovereignHub, domain-grouped results, bridge indicators, pillar glow
- "foundation" bridges Masonry + Landscaping + Nursing + Child Care + Hermetics + Speaking

### Architecture
- `DynamicWorkshop.js` + `/workshop/:moduleId` = infinite modules from one route
- `OracleSearch.js` = inline neural search with domain-grouped results
- `workshop_v60.py` = master registry + universal endpoints + search
- `SovereignProviders.js` = 26 contexts consolidated
- `BackToHub.js` = fully remapped to dynamic `/workshop/` routes
- **791KB main bundle** (Metabolic Seal intact)

### Session Summary (V57-V65)
- V57-V59: Bundle compression (1.1MB → 791KB)
- V60-V63: Dynamic Router + 22 cells + search endpoint
- V64: Legacy purge + final cells
- V64.1: Oracle Search UI + BackToHub route fix
- V65.0: XP Wiring (5 sources) + Parity Push (15 materials) + 6 Hybrid Titles

## Completed (V65.0)
- [x] Oracle Search UI in SovereignHub (inline, domain-grouped, bridge indicators)
- [x] BackToHub.js legacy route purge (all -workbench → /workshop/)
- [x] Pillar glow effect when search results bridge domains
- [x] XP wiring for all 22 modules → TradePassport domains
- [x] 6 new Hybrid Titles (Biomechanical Engineer, Climate Architect, etc.)
- [x] Parity Push: 5 modules expanded from 3 → 6 materials
- [x] 22 workshop cells in master registry
- [x] 791KB Metabolic Seal maintained

## Backlog
### P1
- Expand remaining 4 modules to 6 materials (Automotive, Meditation, Speaking, Philosophy)
- 36-Bit Recursive Dive audit (spot-check Depth-6 quality across all pillars)
### P2
- More cells (Economics, Music Theory, Permaculture)
- Meritocratic depth tiers
- Sovereign Leaderboard
- Predictive navigation
- Native mobile screen recording
- Phygital Marketplace NFC hooks
