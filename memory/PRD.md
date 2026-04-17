# ENLIGHTEN.MINT.CAFE — V57.0 Trade Workshop Activation
## PRD — Last Updated: April 17, 2026

---

## V57.0 — Masonry & Carpentry 3D Circular Workshops
- **Masonry Workbench** (`/masonry-workbench`): 6 stones (Granite, Marble, Limestone, Slate, Sandstone, Basalt), 9 tools in sprocket ring, 6-depth Recursive Dive into mineral lattice, inline tutorial generation via GPT-5.2 Global Bridge, XP accrual on every action
- **Carpentry Workbench** (`/carpentry-workbench`): 6 woods (White Oak, Black Walnut, Eastern White Pine, American Cherry, Hard Maple, Western Red Cedar), 9 tools in sprocket ring, 6-depth Grain Dive into wood cellular structure, inline tutorial generation, XP accrual
- **Universal Access (Sovereign Handshake)**: All workshop endpoints open to guests — no auth gate. Guests get basic tool tutorials; authenticated users get GPT-5.2 generative tutorials + RPG XP bridge
- **Neural Pulse verified**: Every tool action fires `__workAccrue` → buffer → heartbeat sync → Transmuter dust + RPG XP → VitalityBar pulse → ProgressionToast recognition
- **Both workshops surfaced** in Sovereign Hub under "Sovereign Council" pillar (155 total nodules)
- **Zero modals, zero fixed overlays** — everything inline, bottom toolbar unobscured

## V56.8 — Structural Defrag + Bundle Optimization
- **Main bundle: 1.1MB** (from 1.2MB) — deferred 26 engine/utility scripts to requestIdleCallback
- **202 lazy chunks** (from 183) — engines now separate chunks loaded after paint
- **z-index cleanup**: AnimatedRoutes z-10→z-1, Avatar3D z-3→z-1
- **BackToHub**: Changed from fixed z-50 to sticky z-10 with gradient fade
- **Ghost buttons purged** from 7 pages
- **Related dropdown**: inline positioning, no fixed overlay

## Full System Audit
- 155 hub nodules (153 + Masonry Workbench + Carpentry Workbench)
- Zero ghost buttons, zero fixed overlays (except Navigation bar)
- Production build: 1.1MB core + 204 lazy chunks
- All engines deferred to idle callback for faster first paint

## Architecture
- 10 Command Pillars (155 total nodules)
- **Circular Workshop Engine**: Reusable DNA for all trade modules (center material, sprocket tool ring, recursive dive, tutorial bridge, XP accrual)
- Global Generators (Script/Lesson/Game/Ritual) — context-aware from AI panel
- Adaptive AI (8 perspectives per topic)
- Cross-module Sage Board
- 152/168 pages with XP hooks

## Key Files
- `/app/frontend/src/pages/MasonryWorkbench.js` — Masonry 3D Workshop
- `/app/frontend/src/pages/CarpentryWorkbench.js` — Carpentry 3D Workshop
- `/app/backend/routes/workshop.py` — All trade workshop endpoints (stones, tools, woods, actions)
- `/app/frontend/src/pages/SovereignHub.js` — 155-nodule command map
- `/app/frontend/src/components/console/AIPanel.js` — Global Generator Bridge
- `/app/frontend/src/hooks/useWorkAccrual.js` — XP/Dust heartbeat system

## Backlog
### P1
- Apply "Circular Workshop" engine to remaining Trade modules (Electrical, Plumbing, etc.)
- Further tree-shaking toward 800KB bundle target
- AI Game Generator → Quest Accrual verification
- Cross-module search improvement (tags/categories, not just exact names)
### P2
- Native mobile recording, Phygital NFC
- Meritocratic depth tiers (volunteer hours → deeper dive access)
- Inter-module context flow ("Herbology discovery influences Aromatherapy suggestions")
