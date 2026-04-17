# ENLIGHTEN.MINT.CAFE — V56.2 Mobile Performance Fix
## Product Requirements Document
### Last Updated: April 17, 2026

---

## Original Problem Statement
Build "The Cosmic Collective" / "ENLIGHTEN.MINT.CAFE", an esoteric, immersive full-stack wellness platform blending standard wellness tracking with deep mathematical/divination systems, personalized AI, and Wellness MMORPG mechanics.

---

## Architecture
- **Frontend**: React PWA (166 pages, 161 lazy-loaded), Framer Motion
- **Backend**: FastAPI (170+ routes), MongoDB
- **Economy**: Credits-only ($10/hr = 10 Credits/hr), Phi-escrow (1.618%)
- **AI**: GPT-5.2 via Emergent LLM Key
- **Deployment**: TWA for Google Play Store

---

## Implemented Features

### V55.0 — Foundation
- Avatar, Sacred Geometry, Economy, TWA, OmniBridge, 160+ page migration

### V56.0 — Discovery Engine
- InteractiveModule rewrite (8 pages: Crystals, Herbology, Aromatherapy, Elixirs, Mudras, Nourishment, Reiki, Acupressure)
- ProgressionToast, useWorkAccrual RPG Bridge, VitalityBar, 8 milestones, Tarot 3D cards

### V56.1 — Interactive Simulations + Cross-Module Challenges
- I Ching Coin Toss (yarrow stalk probabilities), Yoga Guided Flow (breath sync)
- ProgressGate on DreamRealms + StarseedAdventure
- 4 Daily Elemental Challenges (Earth/Air/Fire/Water) with XP multipliers
- XP hooks on 150/166 pages
- DailyChallenges UI on Sovereign Hub

### V56.2 — Mobile Performance Fix (April 17, 2026)
- **Removed ALL 3D CSS transforms** from page transitions (no rotateY, translateZ, blur, preserve-3d)
- **Mobile transitions**: simple opacity+scale (0.97, 0.25s) instead of 3D rotations
- **Particle count capped at 8 on mobile** (was 24-32)
- **Scene images disabled on mobile** (window.innerWidth >= 768 check)
- **Removed portal flash** (was causing glitch on mobile entry)
- **Removed backdropFilter blur** from room headers
- **Simplified cave walls** (4 gradient divs instead of 16 crystal vein lines)
- **CinematicWalkthrough → Guided Tour**: No longer transforms #app-stage. Actually navigates between rooms using useNavigate() with auto-advance timer and HUD overlay.

---

## Verified API Endpoints (15+)
crystals(12), herbology(12), aromatherapy(12), elixirs(10), mudras(25), nourishment(8), reiki(10), acupressure(10), yoga(7), oracle zodiac(12), frequencies(12), RPG character, RPG milestones(8), work-submit, daily challenges(4)

---

## Backlog

### P1
- Bundle size optimization (1.71MB → target <1MB)
- More room-specific simulations

### P2
- Native mobile recording
- Phygital NFC hooks
