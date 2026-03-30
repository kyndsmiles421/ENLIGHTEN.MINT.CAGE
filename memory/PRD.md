# The Cosmic Collective - Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals. Features include PWA, Push Notifications, Quantum Mechanics, Global Star Chart cultures, Trade Circle barter marketplace, Stripe subscription, Creator role, Crystals & Stones, Virtual Rock Hounding, Guided Tour, Cinematic Intro Videos, Gaming-Level Immersive Graphics, Split Screen Multitasking, AI Avatar Generator, Context-aware AI voices, Mobile App scaffolding, Myths & Legends encyclopedia, Sacred Texts Audiobook Reader, VR Immersive modes, Star Chart astrology, Comprehensive Sacred Scriptures with AI Scene Recreations (Vision Mode), Global Immersion toggles.

Recent Additions: Starseed Choose Your Own Adventure (Single-player RPG & Multiplayer WoW-style realm), Cooperative Boss encounters, Loot/Inventory, Multiverse realms (Starseed Worlds), Spore-like Spiritual Avatar Creator, Avatar Showcase Gallery, Gem Resonance, Cosmic Ledger (Cross-Origin Persistence), and Expanded Cosmic Mixer.

## Tech Stack
- Frontend: React, Tailwind CSS, Canvas API, Context API (SensoryContext), Framer Motion
- Backend: FastAPI, Motor Async MongoDB
- AI: OpenAI GPT-4o (text), GPT Image 1 (images), TTS/STT (Whisper), Sora 2 (video) — all via Emergent LLM Key
- Payments: Stripe (test key)
- Package: emergentintegrations library

## Core Architecture
```
/app/backend/routes/ — FastAPI route modules
/app/frontend/src/pages/ — React page components  
/app/frontend/src/components/ — Shared components
/app/frontend/src/components/ui/ — Shadcn UI
```

## What's Been Implemented (Complete)
- Full authentication (JWT), user profiles, settings
- Interactive Creator Dashboard
- 3D Star Chart with global cultures
- Sacred Scriptures library with Vision Mode (AI scene recreation)
- Starseed RPG: Single-player adventure, Multiplayer realm bosses, Alliances
- Spore-style Spiritual Avatar Creator
- Avatar Showcase Gallery with "Radiate" upvoting
- Multiverse "Worlds" system with equippable gems/artifacts
- Gem Resonance in story/combat calculations
- Cosmic Ledger (Cross-Origin Persistence) — global state, achievements, legendary paths, realm leaderboards
- Color-coded combat toasts (purple/gold resonance, red weakness, cyan equipment)
- Expanded Cosmic Mixer (15 frequencies, 11 ambient sounds, 18 mantras, 16 world instruments)
- Multi-select mixer: layer multiple frequencies, sounds, and instruments simultaneously
- Improved mantra voice quality (nova voice, natural breathing patterns)
- Homepage rearrange drag-and-drop fix (dnd-kit compatibility)
- PWA with service worker, push notifications
- Cinematic intro videos (Sora 2)
- Split Screen multitasking
- Guided app tour
- Stripe subscription system
- Crystals & Stones with narration
- Trade Circle marketplace
- Myths & Legends encyclopedia
- VR immersive modes (partial)

## Prioritized Backlog
### P1
- Refactor massive files (StarseedAdventure.js, StarseedRealm.js, SpiritualAvatarCreator.js) into smaller reusable components

### P2
- Mobile App Store scaffolding (Capacitor native build)
- VR Immersive modes completion/verification

### P3  
- Additional realm leaderboard categories
- Cross-platform sync improvements
