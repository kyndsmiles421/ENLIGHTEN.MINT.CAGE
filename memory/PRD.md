# ENLIGHTEN.MINT.CAFE — V56.2 Immersive Teacher Scenes + Adaptive AI
## Product Requirements Document
### Last Updated: April 17, 2026

---

## Original Problem Statement
Build "The Cosmic Collective" / "ENLIGHTEN.MINT.CAFE", an esoteric, immersive full-stack wellness platform blending standard wellness tracking with deep mathematical/divination systems, personalized AI, and Wellness MMORPG mechanics.

---

## Architecture
- **Frontend**: React PWA (166 pages, 161 lazy-loaded), Framer Motion
- **Backend**: FastAPI (170+ routes), MongoDB
- **Economy**: Credits-only, Phi-escrow (1.618%)
- **AI**: GPT-5.2 via Emergent LLM Key — adaptive per user
- **Deployment**: TWA for Google Play Store

---

## Implemented Features

### V55.0 — Foundation
- Avatar, Sacred Geometry, Economy, TWA, OmniBridge, 160+ page migration

### V56.0 — Discovery Engine + Progression
- InteractiveModule (8 pages), ProgressionToast, RPG Bridge, VitalityBar, milestones, Tarot 3D

### V56.1 — Interactive Simulations
- I Ching Coin Toss, Yoga Guided Flow, ProgressGate, Daily Challenges, XP on 150 pages

### V56.2 — Mobile Performance + Adaptive AI + Immersive Scenes (April 17, 2026)
- **Mobile perf**: Removed 3D transforms, simplified transitions, capped particles
- **Adaptive AI Deep Dive**: Backend tracks user visit history per topic. 8 rotating perspectives (practical→cultural→scientific→narrative→mistakes→daily life→esoteric→progressive). "Go Deeper" button fetches fresh content each time. Never shows same content twice.
- **Immersive Teacher Scenes**: Each of 11 teachers has a unique visual world:
  - Buddha: Golden bodhi tree, warm amber
  - Jesus: Divine light rays, golden clouds
  - Muhammad: Sacred geometric dome (no figure, respectful), emerald green
  - Krishna: Cosmic blue divine statue
  - Lao Tzu: Misty mountain temple
  - Rumi: Whirling dervish dance, magenta
  - Thich Nhat Hanh: Bamboo zen garden
  - Yogananda: Forest ashram, orange
  - Ram Dass: Cosmic nebula, purple
  - Alan Watts: Stars/infinity, cyan
  - Thoth: Egyptian temple hieroglyphs, gold
- **Every quote has a Listen button** for TTS narration
- **Guided Tour** replaces glitchy Cinematic Walkthrough — actually navigates rooms
- **Items shuffle** on each visit in InteractiveModule

---

## Verified API Endpoints (15+)
All data APIs confirmed working with item counts.

---

## Backlog
### P1
- Bundle size (1.71MB → <1MB)
### P2
- Native mobile recording
- Phygital NFC hooks
