# ENLIGHTEN.MINT.CAFE — V54.4 GLOBAL SPATIAL ENGINE
## Last Verified: April 16, 2026

### V54.4: SpatialRouter — ALL Pages Auto-Wrapped
- **SpatialRouter.js**: Global wrapper that auto-applies SpatialRoom based on route
  - 50+ route-to-room mappings defined
  - Fold/extrude transition on route change (AnimatePresence + scaleZ)
  - Excluded routes: /, /landing, /auth, /intro, /sovereign-hub
- **ALL 160+ pages** now get SpatialRoom wrapping automatically
- **Breathing Perspective Pulse**: In rhythmic mode, perspective oscillates 60%-100% of roomDepth via requestAnimationFrame sine wave (~4s breath cycle)
- **Meditation Stillness Reward**: Timer tracks scroll inactivity. After 30s still at any coordinate, hidden octants materialize

### 9x9 Grid Engine (LOCKED)
- GRID_SIZE=9, TOTAL_NODES=81, ROOM_DEPTH=1200, OCTANT_DEPTH=133
- 3 Realms: HOLLOW_EARTH (crystalline tunnels), SURFACE (standard), AIR (open sky)
- Avatar Badge: [x,y] coordinate + 9-segment depth indicator + % mapped
- Proximity reveal: Items materialize based on Z-distance from avatar
- Breathing pulse: Perspective oscillates with inhale/exhale
- Stillness reward: 30s without scroll → hidden content reveals

### Architecture
```
SpatialRouter (global, in MixerProvider)
  └── SpatialRoom (per-route, with realm/mode)
       ├── DepthParticles (Z-space ambient)
       ├── AvatarBadge (coordinate pointer)
       ├── Realm Atmosphere (HOLLOW_EARTH walls / AIR glow / SURFACE standard)
       └── Content (perspective + translateZ entry)
            └── InteractiveModule (where applicable)
                 └── ProximityItem (scroll-based Z-reveal)
                      └── InteractiveItem (tap → expand → DeepDive → XP)
```
