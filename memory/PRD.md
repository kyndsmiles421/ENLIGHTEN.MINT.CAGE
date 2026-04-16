# ENLIGHTEN.MINT.CAFE — V54.1 SPATIAL ROOM ARCHITECTURE
## Last Verified: April 16, 2026

### V54.1: From Pages to Spatial Rooms
- **SpatialRoom.js**: CSS 3D perspective wrapper that transforms flat pages into spatial environments
  - 1200px perspective with 40% origin for depth
  - Unique room themes: floor color, wall gradients, ambient particles, room icon+name
  - Entry transition: translateZ(-80px) → translateZ(0) with rotateX for "walking in" feel
  - Side wall gradients for peripheral depth cues
  - Floating ambient particles in room accent color
- **17 room themes defined**: nourishment, herbology, crystals, aromatherapy, meditation, breathing, yoga, elixirs, acupressure, oracle, star_chart, teachings, encyclopedia, frequencies, sacred_texts, community, default
- **7 pages wrapped in SpatialRoom**: Nourishment, Herbology, Crystals, Aromatherapy, Elixirs, Acupressure (+ MealPlanning)

### InteractiveModule Architecture (V54.0)
- Universal component: search, filter, mastery bar, visual tiles, tap-to-expand, DeepDive AI, XP rewards
- 7 pages rebuilt with InteractiveModule
- ExplorationReward gamification: +5 XP per interaction, Novice→Master levels

### Zero-Stack Directive
- NO overlays, NO modals, NO z-index boxes
- Content expands IN-PLACE within the spatial room
- Mixer bar is part of the Z-space HUD

### Room Theme Map
| Room | Color | Icon | Floor |
|------|-------|------|-------|
| Crystal Chamber | #8B5CF6 | 💎 | #0d0d1a |
| Herb Garden Sanctum | #84CC16 | 🌿 | #0f1a0d |
| Living Kitchen | #22C55E | 🍃 | #0d1a0f |
| Essence Temple | #C084FC | 🌸 | #1a0d1a |
| Meditation Hall | #D8B4FE | 🧘 | #0d0d18 |
| Breath Chamber | #2DD4BF | 🌬 | #0d1518 |
| Alchemy Lab | #FCD34D | 🧪 | #1a160d |

### Upcoming
- Wrap remaining pages (Breathing, Meditation, Yoga, etc.) in SpatialRoom
- Avatar presence indicator in each room
- Proximity-based content reveal (scroll = movement through room)
