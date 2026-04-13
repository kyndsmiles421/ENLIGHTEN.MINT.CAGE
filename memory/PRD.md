# ENLIGHTEN.MINT.CAFE — V38.0 SAME PLANE ARCHITECTURE
## Last Verified: April 13, 2026

### Architecture: Same Plane, Zero Floating
- **Flex column**: `[content | panel | nav]` — all siblings, all `position: static`
- **Zero `position: fixed`** on any mixer element
- **Zero portals** — no `createPortal`, everything renders inline
- **Zero z-index** on mixer elements
- Content fills available space (flex: 1, overflow: auto)
- Tool panel slides up inline, pushing content up (not overlaying)
- Nav bar is bottom sibling of the flex, not a floating bar

### Production Studio Features (V38.0)
- **Mix Tab**: 7 pillar faders, master fader, mute/solo per module, tap module = navigate
- **Rec Tab**: Video/Audio/Screen capture via MediaRecorder API
- **Audio Tab**: Record Voice, Import Audio, Master Volume
- **Text Tab**: 6 text styles, overlays positioned within content area
- **Layer Tab**: Image/Logo/Frame overlays within content area
- **FX Tab**: Real CSS filters on #app-stage (Blur/Brightness/Contrast/Hue/Saturate/Sepia/Invert)
- **AI Tab**: Sage AI placeholder
- **Export Tab**: Aspect ratio + Broadcast

### Complete Feature Set
- 7-pillar hub with 65+ modules
- V34.2 Inverse Exponential Math (phi^3 ceiling)
- Marketplace with 15 mixer items
- 3-step onboarding
- Dust accrual with resonance tracking
- Crystal Encryption skins
- PWA ready (cafe.enlighten.mint)

### Blocked
- Play Store AAB: Waiting on Google identity verification

### Upcoming
- Sage AI integration for AI tab
- Sovereign "Live" Sessions
- Phygital Marketplace (NFC crystal cards)
