# ENLIGHTEN.MINT.CAFE — V54.3 REALM ELEVATION + CRYSTALLINE TUNNELS
## Last Verified: April 16, 2026

### V54.3: Elevation Realms + Room Modes
- **3 Elevation Realms**: HOLLOW_EARTH (Y:-1200), SURFACE (Y:0), AIR (Y:+1200)
  - HOLLOW_EARTH: Crystalline tunnel walls (25% width), crystal vein lines, dense particles (24), heat haze blur
  - SURFACE: Standard side wall gradients (16px)
  - AIR: Open sky, no side walls, top radial glow
- **Room Modes**:
  - `rhythmic` (Breathing): Grid pulses with breath cycle — zDepth:-500 (shorter/contained)
  - `stillness` (Meditation): zDepth:-1200 (full depth). Stillness timer tracks seconds without scroll. After 30s, hidden octants reveal (deeper content materializes)
  - `standard`: Normal proximity reveal
- **Realm assignments**: Crystals/Oracle/Frequencies/Elixirs/Sacred Texts → HOLLOW_EARTH. Breathing/Star Chart → AIR. Everything else → SURFACE.
- **SpatialContext enhanced**: Now exposes `realm`, `stillnessTimer`, `hiddenRevealed`, `mode`

### 9x9 Grid Architecture (LOCKED)
```
Elevation (Y-axis):
  Y:+1200 → Air Temple (Breathing, Observatory)
  Y:0     → Surface Realm (Kitchen, Garden, Studio)
  Y:-1200 → Crystalline Depths (Crystals, Oracle, Frequencies)

Depth (Z-axis per room):
  Z:100   → Mixer HUD (static)
  Z:0     → Room entrance
  Z:-500  → Breath Chamber back wall (short room)
  Z:-800  → Crystal Chamber back wall
  Z:-1200 → Meditation Hall back wall (deepest room)
```

### Upcoming
- Wrap remaining pages in SpatialRoom (Breathing, Meditation, Yoga, Teachings, Encyclopedia, etc.)
- Breathing grid pulse (perspective oscillates with inhale/exhale)
- Room fold/extrude transitions between modules
- Avatar visual presence in rooms
