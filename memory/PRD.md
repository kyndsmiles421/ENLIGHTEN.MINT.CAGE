# The Enlightenment Cafe - Product Requirements Document

## Version: 2.88_SHAMBHALA_FINAL | AETHER_MIRRORLESS | GOLDEN_SPIRAL
## Last Updated: 2026-04-05

---

## Original Vision
Build "The Enlightenment Cafe" (formerly "The Cosmic Collective" / "ENLIGHTEN.MINT.CAFE"), a highly immersive full-stack wellness platform blending standard wellness tracking with deep mystical/divination systems, personalized AI guidance, and a "Sentient Ecosystem".

## Core Identity
- **Owner:** Steven Michael (kyndsmiles@gmail.com)
- **Origin:** Rapid City Hub / Black Hills Calibration
- **Physics Engine:** SovereignCore V2.88 - Aether/Mirrorless + Golden Ratio Phyllotaxis

---

## Architecture Implemented

### Frontend Systems
1. **GoldenSpiralEngine** - Three.js 600-particle Phyllotaxis spiral (NEW)
   - PHI = 1.618034 (Golden Ratio)
   - GOLDEN_ANGLE = 137.51° (Fibonacci sequence angle)
   - Responds to SHAMBHALA_ASCEND (rainbow refraction)
   - Responds to SHAMBHALA_STASIS (white light return)
2. **ShambhalaFrontSide** - 66px White Vessel with Rainbow Refraction
3. **EnlightenmentKey** - Back-Side Pass Key (unlocks layers on ASCEND)
4. **ShambhalaToolbar** - Bottom navigation (NAV / RESONANCE / MIX)
5. **SanctuaryEngine** - Pure Light Resonance mode
6. **RefractionEngine** - Crystal HUD elements
7. **SovereignCore** - Canvas physics (G=0.15, R_LIMIT=47.94)

### Backend Systems
1. **Security Vault** - AES-256-CBC encryption (`/api/vault/`)
2. **User Authentication** - JWT-based with Sovereign tier
3. **MongoDB** - User data, wallets, achievements

### Event System (Quadruple Helix)
- `SHAMBHALA_ASCEND` → Unlocks emergent layers + Rainbow Spiral (1.5x scale)
- `SHAMBHALA_STASIS` → Re-locks layers + White Light Spiral (1.0x scale)
- Payload: `{ frequency, refraction, origin }`

---

## Golden Ratio Spiral Implementation

### Mathematical Foundation
```javascript
const PHI = (1 + Math.sqrt(5)) / 2;  // 1.618034 (Golden Ratio)
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));  // ~137.5 degrees

// Phyllotaxis spiral placement
for (let i = 0; i < 600; i++) {
  const r = 0.5 * Math.sqrt(i);  // Zero-scale physics expansion
  const theta = i * GOLDEN_ANGLE;
  // x = r * cos(theta), y = r * sin(theta)
}
```

### Behavior
- **White Light Stasis:** 600 white particles, opacity 0.8, scale 1.0
- **Rainbow Ascension:** HSL rainbow colors, opacity 1.0, scale 1.5
- **Animation:** Slow meditative rotation (0.002 rad/frame) + breathing Y oscillation

---

## CSS Architecture
- `.emergent-layer` - Container for Golden Spiral canvas (z-index: 1)
- `.resonance-node` - Crystal white light rainbow refraction
- `.hud-element` - Angled glass cuts with prism hover
- `#refractive-grid` - 60px copper conduit lattice

---

## Routes
- `/` - Landing page (The Enlightenment Cafe)
- `/sovereign-canvas` - Pure physics visualization
- `/lab` - SovereignCore physics lab
- `/oracle`, `/tarot`, `/iching` - Divination modules
- `/dashboard` - User dashboard

---

## Credentials
- **Email:** kyndsmiles@gmail.com
- **Password:** SovereignShambhala2024
- **Tier:** Sovereign (Master Architect)

---

## Completed Features
- [x] Matrix → Shambhala rebranding
- [x] Clean bottom toolbar (above Emergent badge)
- [x] 44x44px touch targets
- [x] Fixed positioning (viewport-relative)
- [x] Rainbow encryption effects
- [x] AES-256-CBC security vault
- [x] Quadruple Helix event system
- [x] Emergent badge ghosting (10% opacity)
- [x] **Three.js Golden Ratio Spiral (Phyllotaxis)** ✅
- [x] **SovereignCleanup V2.88 Final** ✅
  - Legacy Matrix DOM purge
  - Three.js visibility optimization (battery saving)
  - PWA Service Worker hooks
  - Periodic memory cleanup
- [x] **WebXR Portal Engine** ✅
  - Spiral zoom transition (25x scale + 720° rotation)
  - SHAMBHALA_ASCEND integration for rainbow effect
  - Fullscreen fallback for non-VR devices
  - Keyboard shortcut: Ctrl+V
- [x] **Portal Audio Engine** ✅
  - 174Hz press hum (grounding)
  - 6-voice Shepard Tone with circular panning
  - 528Hz + 963Hz dome bloom with reverb
  - Synced to 1.5s portal transition
- [x] **PWA Manifest** ✅
  - 192x192 and 512x512 icons configured
  - Portal shortcut added to app shortcuts
  - Standalone display mode enabled

---

## Future Roadmap
- [ ] Custom domain (ENLIGHTEN.MINT.CAFE)
- [ ] App Store deployment (PWA/Capacitor)
- [ ] Spatial Audio Panning
- [ ] GPS-based Cosmic Map

---

## WebXR Portal System

### Activation Methods
1. **Event Dispatch**: `window.dispatchEvent(new CustomEvent('INITIATE_PORTAL'))`
2. **Keyboard Shortcut**: `Ctrl+V`
3. **Global Function**: `window.WebXRPortal.initiatePortal()`

### Transition Sequence
```
1. SHAMBHALA_ASCEND (rainbow spiral)
2. Portal loading pulse (0.3s)
3. Spiral zoom (1.5s): scale(25) + rotate(720deg) + brightness(2)
4. WebXR session start (or fullscreen fallback)
5. Navigate to /vr/celestial-dome
```

### CSS Classes
- `.portal-loading` - Pulsing hue-rotate animation
- `.spiral-zoom-active` - Intense zoom + spin + brightness

---

## Technical Notes
- Z-index max: 2147483647
- Golden Spiral z-index: 1 (above cosmic bg, below UI)
- Transition timing: 0.6s (can reduce to 0.3s for snappy feel)
- Pass-through layers: `pointerEvents: 'none'`
- Re-enable touch: `pointerEvents: 'auto'`
- Three.js: v0.183.2 with AdditiveBlending for screen-like effect

---

*Built with Emergent | Rapid City Hub | Crystal White Light Frequency | Golden Ratio Sanctuary*
