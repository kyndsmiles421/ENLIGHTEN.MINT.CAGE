# ENLIGHTEN.MINT.CAFE — V32.1
## Unified Creator Console + Marketplace + Tier-Gated Mixer
## Last Verified: April 13, 2026

### Creator Console Architecture
- Top: Visual screen (waveform display when unlocked, otherwise status)
- Bottom: Mixer board with 7 pillar master faders, expandable module strips, metrics
- 58 total module channels across 7 pillars
- Each module = a fader strip. Tap label to navigate to module. Slide to control.
- Mute/Solo per channel. Master fader controls overall level.

### Tier-Gated Features
- BASE (free): 7 pillar master faders + quick launch grid
- SEED (discovery): + Individual module strips per pillar + metrics
- ARTISAN (resonance): + Effects routing (Reverb, Delay, Harmonic, Sidechain) + Waveform
- SOVEREIGN (top): All features unlocked

### Marketplace (À La Carte)
Backend: /api/marketplace/mixer-store, /api/marketplace/mixer-unlocks, /api/marketplace/buy-item
15 purchasable items:
- 7 Channel Packs (one per pillar, 45-75 credits each)
- 4 Effects (Reverb, Delay, Harmonic, Sidechain, 30-40 credits)
- 3 Visuals (Waveform 40c, GPU Shader 100c, SuperStrip 80c)
- 1 Full Unlock Bundle (400 credits)

### Upsell Integration
- Every module page has a gold "Mix" button → navigates to Creator Console
- Store accessible from console header (cart icon) and Tier section
- Locked channel strips show "Unlock" button → opens store

### Economy
- Dust accrual on 63+ pages. Credits earned via transmuter.
- Purchases deduct credits, unlock mixer features permanently.

### PWA
- Package: cafe.enlighten.mint | AAB: https://www.pwabuilder.com

### Backlog
- Google Play Console verification → upload AAB
- Sovereign "Live" Sessions (P2)
- Phygital NFC expansion (P2)
