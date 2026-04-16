# ENLIGHTEN.MINT.CAFE — V53.8 ZERO-STACK ARCHITECTURE
## Last Verified: April 16, 2026

### V53.8: Zero-Stack — No Modals, No Overlays, No Z-Index Boxes
- **ALL fixed overlay patterns purged** from every page and component file
- **DeepDive.js rewritten**: From fixed z-50 modal to in-place height expansion
- **ContemplationModal**: Converted to in-place expansion within page flow
- **ALL backdropFilter:blur removed** from all pages and components
- **ALL inline dark backgrounds removed** across entire codebase
- **glass-card class removed** from all JSX files
- **Star Chart**: constellation-visual canvas renders star patterns
- **53+ routes verified**, 0 crashes, 0 fixed overlays found (except mixer nav)

### ZERO-STACK DIRECTIVE (DO NOT VIOLATE)
- NO position:fixed with z-index >= 50 (except mixer nav)
- NO modals. NO dialogs. NO popups.
- NO backdrop-filter blur on ANY content element
- NO dark backgrounds blocking the SceneEngine
- Content EXPANDS IN-PLACE using height animation
- The background IS the interface
- When you tap something, the world BECOMES that thing

### Architecture
- SceneEngine: position:fixed z-index:0 — full-bleed background, NO overlay
- Content: position:relative z-index:1 — transparent, flows naturally
- Interaction: AnimatePresence + height:auto — in-place expansion
- Mixer: Bottom nav bar — the ONE exception for fixed positioning

### Upcoming
- MediaVault (P1)
- Phygital NFC (P2)
