# ENLIGHTEN.MINT.CAFE — V53.6 SAME PLANE / ZERO CARDS
## Last Verified: April 16, 2026

### V53.6: Card Layer Elimination
- glass-card CSS stripped to just `position: relative` — no background, no border, no border-radius, no overflow:hidden
- glass-card-deep, sovereign-glass, sovereign-glass-strong — all stripped to `position: relative`
- glass-card::before pseudo-element — display:none
- glass-card-hover — simple translateY only, no box-shadow layers
- ExpandableInfoCard — NO card wrapper, just border-bottom divider line, content sits on plane
- body background: transparent, html: #06060C, SceneEngine shows through everything

### Design Philosophy (FINAL — DO NOT DEVIATE)
- ONE PLANE. No card layers. No overlays. No vignettes.
- Content floats directly on the SceneEngine background
- Text-shadow for readability against any background
- Every content item connects to AI Deep Dive for progressive exploration
- Borders: thin divider lines only (1px solid rgba(255,255,255,0.04))

### Architecture
- SceneEngine: position:fixed, z-index:0, full-bleed realm backgrounds, NO overlay
- Content: position:relative, z-index:1, transparent backgrounds throughout
- ExpandableInfoCard: flat list items with dividers, built-in DeepDive
- FeaturedVideos: z-index:50 player, inline cards

### Upcoming
- Universal MediaVault (P1)
- Phygital NFC hooks (P2)
