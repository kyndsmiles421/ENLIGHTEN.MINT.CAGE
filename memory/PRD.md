# ENLIGHTEN.MINT.CAFE — V37.0 SOVEREIGN MIXER (UNIFIED ORGANISM)
## Last Verified: April 13, 2026

### Architecture: One Cohesive Organism
- **Full-screen content** — modules fill the entire viewport
- **Thin bottom nav bar** (44px) — 8 tool tabs: Mix, Rec, Audio, Text, Layer, FX, AI, Out
- **Slide-up tool panels** — tap a tab to open, tap again to close
- **Fullscreen mode** — hide the nav bar completely, tiny exit button in corner
- **No more 2/3-1/3 split** — the mixer and content are ONE unified experience

### Production Studio Features (V37.0)
- **Mix Tab**: 7 pillar faders (PRA/DIV/SAN/NOU/EXP/SAG/COU), master fader, mute/solo per module, tap module label = navigate
- **Rec Tab**: Video/Audio/Screen capture via MediaRecorder API, auto-download .webm
- **Audio Tab**: Record Voice, Import Audio, Master Volume slider (controls all <audio>/<video> elements)
- **Text Tab**: 6 text styles (Title/Subtitle/Caption/Quote/Label/Watermark), text overlays render live on screen
- **Layer Tab**: Image/Logo/Frame overlays, rendered live on screen
- **FX Tab**: Real CSS filters applied to #app-stage (Blur/Brightness/Contrast/Hue/Saturate/Sepia/Invert), continuous sliders, RESET button
- **AI Tab**: Placeholder for Sage AI integration (Image to Video, AI Art, Text to Image, TTS, AI Music, AI Avatar)
- **Export Tab**: Aspect ratio selector (16:9/9:16/1:1/4:3/4:5), Export/Broadcast buttons

### Complete Feature Set
- 7-pillar hub with 65+ navigable modules
- V34.2 Inverse Exponential Math (phi^3 ceiling)
- Marketplace with 15 purchasable mixer items
- 3-step onboarding for new users
- Dust accrual on 63+ pages with resonance tracking
- Cross-module Related navigation on 40+ pages
- Crystal Encryption skins
- Zero ghost elements (CSS ghost purge with mixer exclusions)

### Security Audit: PASS
- SHA-256 hashing (zero MD5)
- secrets module for economy randomness
- Zero bare excepts, zero unused imports
- Zero eval() usage

### PWA: READY
- Package: cafe.enlighten.mint
- Generate AAB: https://www.pwabuilder.com
- Full guide: /app/twa/PLAY_STORE_GUIDE.md

### Key Technical Notes
- Ghost Purge CSS at index.css:4930-4958 has :not() exclusions for [data-sovereign-mixer] and [data-testid="sovereign-mixer"]
- Mixer renders via createPortal(document.body) to escape CSS containment
- FX filters apply via useEffect → document.getElementById('app-stage').style.filter
- Master volume controls ALL audio/video elements on the page
- Text/image overlays render as fixed-position elements in the portal

### Blocked
- Play Store AAB deployment: Waiting on user's Google Play Console identity verification

### Upcoming Tasks
- Sovereign "Live" Sessions (P2) with Sage AI moderator
- Phygital Marketplace foraging (P2) with NFC crystal cards
- AI tab integration with LLM backend (Sage AI)
