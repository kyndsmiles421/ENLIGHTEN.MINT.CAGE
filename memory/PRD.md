# The Cosmic Collective — Product Requirements Document

## Original Problem Statement
Build "The Cosmic Collective", a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and cinematic visuals. PWA, Push Notifications, Quantum Mechanics, global Star Chart cultures, Trade Circle barter marketplace, Stripe subscription system, hidden Creator role, Accessibility settings, Crystals & Stones, Virtual Rock Hounding, Quantum Entanglement, Music Lounge, Send a Blessing, floating Cosmic Mixer, Guided App Tour, and Cinematic Intro Videos.

## Tech Stack
- **Frontend**: React + Tailwind CSS + Framer Motion (micro-animations only) + Three.js (Star Chart with bloom)
- **Backend**: FastAPI + Motor Async MongoDB
- **AI**: OpenAI GPT-4o (text), OpenAI TTS tts-1 (voice), Sora 2 (video gen), Whisper (STT) — all via Emergent LLM Key
- **Payments**: Stripe (test key in pod)
- **PWA**: Service worker, manifest, install prompt
- **3D**: Three.js + UnrealBloomPass + EffectComposer for gaming-level star chart
- **DnD**: @dnd-kit for draggable dashboard widgets
- **Sound**: Web Audio API — synthesized interaction sounds (no audio files)

## User Personas
- Spiritually-minded wellness seekers wanting immersive mystical digital experiences
- Return users who want personalized, evolving content
- Admin/Creator role: kyndsmiles@gmail.com

## All Implemented Features
### Core Platform
1. 6-Pillar Navigation: Today, Practice, Divination, Sanctuary, Nourish, Explore
2. JWT Auth + Stripe subscription tiers
3. PWA with install prompt
4. Accessibility settings (reduce motion, particles, flashing)

### Gaming-Level Star Chart
5. 3D Star Chart with 8 world cultures (Western, Chinese, Vedic, Egyptian, Mayan, Aboriginal, Norse, Polynesian)
6. UnrealBloomPass bloom post-processing for real star glow
7. Milky Way galactic band
8. 15,000 background stars with spectral class coloring
9. Camera momentum/inertia for smooth gliding
10. 10 vibrant nebulae
11. Constellation lines with animated journey mode
12. Mythology overlay and celestial badges

### AI & Voice
13. Voice AI Sage (coach) with OpenAI TTS and conversation history
14. Sora 2 Video Gallery
15. Cinematic Sora 2 Intro Video on Landing page
16. AI-generated Monthly Soul Reports
17. OpenAI TTS mantras in Cosmic Mixer and Landing

### Immersive Visual System
18. Fluid mesh gradient background (4 animated drifting color layers)
19. Deep glassmorphism cards with portal-pulse animations
20. Enhanced CosmicBackground canvas (7 nebulae, 8 star colors)
21. Page entrance animations on ALL pages (page-enter CSS)
22. `immersive-page` class applied to every page for depth overlay
23. Color-shifting glow borders, stagger reveal animations
24. Cosmic scrollbars, gaming-level button states

### Sound Design
25. Global Sound Engine (Web Audio API) — synthesized interaction sounds
26. Click, hover, success, error, whoosh, chime, open, close sounds
27. Auto-attached to all buttons and glass-card-hover elements
28. Cosmic ambient + binaural frequencies in Mixer

### Split Screen
29. Side-by-side multitasking — open any page in a split panel
30. Resizable panel with drag handle
31. 26+ pages available for split view
32. Collapsible/expandable side panel
33. Responsive (full overlay on mobile)

### Dashboard & Personalization
34. Cosmic Mood Ring — animated canvas orb shifting colors based on mood/activity
35. Draggable dashboard widgets via @dnd-kit (mood ring, wisdom, actions, continue, new-for-you, progress)
36. Dynamic Return-User Dashboard with streak, greetings, recommendations
37. 12-Week Growth Timeline with heatmap and milestones

### Content Features
38. Cosmic Mixer floating widget (ambient, frequencies, light therapy, TTS mantras)
39. Akashic Records guided sessions
40. Encyclopedia of 12 Spiritual Teachings
41. Spiritual Reading List with AI librarian
42. Interactive Guided Tour for new users
43. Trade Circle barter marketplace
44. Music Lounge, Blessings Feed, Crystal Encyclopedia, Quantum Meditation
45. And 40+ additional content pages

## Architecture
```
/app/
├── backend/
│   ├── routes/ (ai_visuals.py, dynamic.py, akashic.py, encyclopedia.py, social.py, etc.)
│   ├── server.py
│   ├── static/videos/
├── frontend/
│   ├── src/
│   │   ├── hooks/ (useSoundEngine.js, useActivityTracker.js)
│   │   ├── components/ (SplitScreen.js, CosmicMoodRing.js, CosmicMixer.js, GuidedTour.js, IntroVideo.js, etc.)
│   │   ├── pages/ (Landing.js, StarChart.js, Meditation.js, Breathing.js, etc.)
│   │   ├── context/ (AuthContext.js, SensoryContext.js, etc.)
```

## Key DB Collections
- activity_log: {user_id, activity_type, timestamp, metadata}
- soul_reports: {user_id, month, report_markdown, stats}
- ai_video_cache: {cache_key, video_url, filename, created_at}
- mood_logs: {user_id, mood, energy, timestamp}

## Test Credentials
- User: test@test.com / password
- Admin/Creator: kyndsmiles@gmail.com

## Backlog
- **P2**: Refactor star_cultures.py — move massive hardcoded coordinate arrays into MongoDB collection or JSON seed file
