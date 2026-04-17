# ENLIGHTEN.MINT.CAFE — V56.3 No-Overlap Clean UI
## Product Requirements Document
### Last Updated: April 17, 2026

---

## Original Problem Statement
Immersive full-stack wellness MMORPG. Every button works, every tap gives content, AI adapts per user.

---

## Architecture
- **Frontend**: React PWA (166 pages, 161 lazy-loaded), Framer Motion
- **Backend**: FastAPI (170+ routes), MongoDB
- **AI**: GPT-5.2 via Emergent LLM Key — adaptive per user (8 rotating perspectives)

---

## V56.3 Changes (April 17, 2026)
- **Removed ALL fixed overlapping elements**: SpatialRoom header badge, ProgressionToast, CinematicWalkthrough HUD — all removed from fixed positioning
- **Oracle 3D orbital rings removed** — were causing absolute-positioned elements to block zodiac grid taps
- **Oracle astrology tab verified**: All 12 zodiac signs visible and tappable, no overlap
- **Immersive scene headers** on 8 InteractiveModule pages (Crystals, Herbology, etc)
- **Cross-module Sage Board** with contextual navigation suggestions
- **Bottom toolbar (ORBIT/MIX/CULTURE/REC/AUDIO/TEXT/LAYER/FX/AI/OUT/ME)** fully accessible, no overlap
- **Adaptive AI Deep Dive** — 8 rotating perspectives, never same content twice
- **11 teacher visual worlds** (Buddha=bodhi tree, Jesus=divine light, Muhammad=geometric dome, etc)

---

## Key Rules
- NO fixed position overlays on content
- NO z-index above 5 on content elements
- Bottom toolbar must always be accessible
- Every button must navigate somewhere or trigger a function
- AI content must vary per user visit

---

## Backlog
### P1
- Bundle optimization
### P2
- Native mobile recording, Phygital NFC
