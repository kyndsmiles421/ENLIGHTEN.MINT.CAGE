# ENLIGHTEN.MINT.CAFE — V68.16 Sovereign Guide
## PRD — Last Updated: Feb 20, 2026

## 🔒 V68.22 (Feb 20, 2026) — Gamified Universe Surfaced (user correction)

**User caught (justified frustration):** "There is an entire gamified virtual reality universe built into this app. I want it utilized and accessible to the user." — and they were right. The app already contained 9 fully built gamified experiences (Starseed Adventure AI-scene RPG, Starseed Worlds multiverse star map, Dream Realms, Multiverse Realms, Cryptic Quest Nodes, Character Sheet RPG, Arcade mini-games, Origin Story, Deep-Focus Realm) — every single one was buried as a small text row in the Sovereign Hub submenus.

**Fix shipped (DOES NOT rebuild any game — surfaces what's there):**
- New **`/realms`** gallery page at `frontend/src/pages/RealmsGallery.js`. Every existing gamified route now has a big visual card with icon, tagline, and "ENTER →" CTA. Featured row (Starseed Adventure + Starseed Worlds) uses larger premium cards. All 9 routes pre-existed and already work — no game logic was touched.
- Added a prominent **⚔ REALMS** button (violet→pink gradient, glowing) to the **Sovereign Hub** top bar — next to Share and My Sanctuary.
- Added the same **⚔ REALMS** button to the **Fractal Engine** top bar, so users inside the 3D lattice can fast-travel into gameplay.
- Data-testids on every card (`realm-card-starseed-adventure`, etc.) for testing.

**Screenshot-verified:** /realms loads with 9 cards, proper theming, featured row at top, grid below. Routes correctly to the existing Starseed/Dream/RPG/Games pages.

**Note on the prior WorkshopGameStage file:** I started building a rock-breaking mini-game for workshops (`frontend/src/components/workshop/WorkshopGameStage.js`) but have NOT wired it into `UniversalWorkshop.js` yet — the user's steer was "use what's already built first" so the file is dormant until we explicitly want workshop gameplay on top of everything else.

## 🔒 V68.21 (Feb 20, 2026) — Sparks vs Dust: hard separation enforced

**User-flagged violation:** the Cosmetic Bundle Store was debiting **Sparks** as if they were a credit currency. Per `CREDIT_SYSTEM.md` §2, Sparks are **earned-only RANK / MERIT / XP** — they can never be spent. Dust is the canonical spendable currency (earned via quests/presence OR acquired via Stripe). Conflating the two breaks the closed-loop model disclosed to Google Play and muddies the "you don't make money by being on the app" promise.

**Fix shipped (all lint-clean, all verified):**
- `cosmetic_bundles.py`: rewrote `_get_credit_balance/_debit_credits` into `_get_dust_balance/_debit_dust`. Now reads/writes **only** `db.users.user_dust_balance`. No Sparks fallback anywhere. Raises 402 with a clear message directing users to top up Dust on the web OR earn via quests.
- Seeded bundles now use canonical `price_dust` field (legacy `price_credits` field auto-migrated via `_ensure_seed`). `GET /api/cosmetic-bundles` returns `dust_balance`, `currency: "dust"`, and `can_afford` computed strictly against Dust.
- Module docstring rewrites the rule in plain English so future agents don't repeat the mistake.
- `SovereignStageHUD` Top-Up pill now labeled **"+ DUST"** (orange) with an explicit title attribute: *"Top up Dust (spendable currency) on the web — Sparks cannot be purchased"*.
- Orb-pickup counter now reads **"+N SPARKS · RANK XP"** so flying through orbs is unambiguously gaining merit/XP, not currency.

**End-to-end proof:**
```
BEFORE: dust=10,000 | sparks=98,801
PURCHASE sovereign_gold (2500 DUST)
AFTER:  dust= 7,500 | sparks=98,801   ← Sparks UNTOUCHED, as required
```

**Rule locked in for future work:**
- ✨ Sparks = earned only. Display rank/merit. Flying through an orb, logging presence, completing a quest → +Sparks. NEVER spent, NEVER purchased.
- ✦ Dust = spendable. Access modules / workshops / cosmetics. Acquired via Stripe (external web only — Google Play TWA routes users to browser) or earned via quest rewards.
- 💵 Zero path from either currency back to USD or crypto.

## 🔒 V68.20 (Feb 20, 2026) — Fractal Engine = Playable Game

**User raised the bar:** "Can you gamify it so it actually functions like moves around in the gaming system?" Yes — the Fractal Engine is now a real action-traversal mini-game.

**What shipped:**
- New `GameController` scene component (inside the R3F Canvas) that owns avatar position state, keyboard/touch input, proximity pillar activation, and orb pickup collisions.
- **Keyboard controls:** WASD + arrow keys translate the holographic avatar within the lattice bounds (radius 3.2, z ∈ [-1.5, 2]). Q/E optionally for depth.
- **On-screen D-pad** (`data-testid="fractal-dpad"`) — 4 directional buttons fixed bottom-left at z-index 999, pointer + touch-safe for mobile. Writes to a shared `moveDirRef` so keyboard and touch compose additively.
- **Spark-orb pickups:** 24 cyan collectable orbs (`SparkOrb` component) seeded randomly in a lattice shell at page load. Flying within 0.38 units collects the orb, fires `+1 SPARK` counter + optimistic HUD event + background `/api/sparks/immersion` credit (6s per orb).
- **Proximity pillar activation:** when the avatar gets within 0.65 units of any of the 7 pillars, it auto-triggers `onActivate` (same handler as a click) — the pillar readout card expands and the user can ENTER DOMAIN. 1.8s debounce prevents re-firing on the same pillar.
- **Stopped the group rotation** so the hologram stays facing the camera (true projection feel); only the crown halo + trinket ring orbit independently.
- Bottom hint updated: `WASD / ARROWS TO FLY · TAP YOUR FORM FOR SANCTUARY · FLY NEAR A PILLAR TO ENTER`.

**Policy CSS ambush disarmed:** a global rule at `index.css:5020` was nuking any element with inline `bottom: + left:` styles via `display:none !important`. Added `:not([data-testid="fractal-dpad"])` to the selector's whitelist so the D-pad actually renders.

**Screenshot-verified end-to-end:** D-pad visible bottom-left, 14+ Spark orbs floating in view, "+1 SPARKS COLLECTED" counter live, avatar hologram preserved with equipment halos. Playwright keyboard sweep moved the avatar and collected orbs successfully.

## 🔒 V68.19 (Feb 20, 2026) — True Holographic Avatar (not cone-with-face)

**User caught, round 2:** "3D version of some shapes put together." The tapered cone body + tiny circular portrait head felt like a 3D model with a photo glued on, not a holographic being. Users wanted the full AI-generated character projected as a floating hologram — the way the original AvatarCreator displayed it.

**Fix shipped:**
- Removed the procedural cone body, icosahedron crystal head, circular framing ring, and abstract eye spheres from `CrystallineSilhouette` entirely.
- The 3D centerpiece is now a **large billboarded holographic plane (2.0 × 2.6 units)** rendering the full AI avatar image, double-sided, depth-test off so it always reads clearly against the starfield.
- A second additive-blended plane at the same position tints the hologram with the user's identity color (profile `theme_color` → equipment body rarity if gear equipped → Sparks tier fallback). This creates the signature "holo glow" rim without a custom shader.
- Hologram **flickers** via opacity wobble (sin wave 3.1Hz + 11.7Hz) in `useFrame` — subtle, alive, never distracting.
- A faint **wireframe icosahedron containment field** (opacity 0.18, identity color) wraps the hologram, giving it dimensional anchor without competing with the face.
- Removed the group.rotation.y spin — the hologram now stays facing the user (stationary projection) with only a gentle vertical float. Crown halo + trinket ring still rotate independently.
- Body-gear rarity color now tints the additive hologram glow (rather than rendering a separate bar), so equipping a Legendary body bathes the whole being in gold.

**Screenshot-verified:** the Fractal Engine centerpiece now shows the ethereal humanoid + lion familiar (the user's real AI avatar) floating inside a violet wireframe field, with gold trinket orbit + violet crown halo and amethyst glow edging the figure. All 7 pillars orbit around it undisturbed.

## 🔒 V68.18 (Feb 20, 2026) — Identity Restored + Profile Discoverability

**User caught:** the 3D silhouette looked "generic" compared to the Dashboard's real AI-generated portrait. And there was no obvious way to find or share your own profile page.

**Root causes:**
- FractalEngine's `CrystallineSilhouette` rendered an abstract procedural head. It never loaded the user's real avatar from `/api/ai-visuals/my-avatar`.
- `ProfilePage` itself showed a letter-initial gradient instead of the AI portrait.
- `/api/profile/me` and `/api/profile/public/:userId` never attached `avatar_b64`, so even the public/shareable profile fell back to the placeholder.
- `SovereignHub` had no prominent "My Profile" button — users had to dig through tile menus to find `/profile`.

**Fixes shipped:**
- `FractalEngine` now fetches `/api/ai-visuals/my-avatar` + `/api/profile/me` and passes `avatarB64` + `profileColor` into `CrystallineSilhouette`. The silhouette's head is now a proper camera-billboarded plane (using `useThree().camera` + `lookAt`) displaying the real AI portrait, framed by a torus ring tinted in the user's theme color.
- Identity priority: **Equipment rarity > Profile `theme_color` > Sparks tier colour** — the user's personal palette beats the merit fallback.
- Clicking the 3D silhouette navigates to `/profile`. Display name floats below the avatar ("TAP YOUR FORM TO OPEN YOUR SANCTUARY").
- `SovereignStageHUD` gained an identity chip (real avatar thumbnail) — persistent across every 3D stage, tap → `/profile`.
- `ProfilePage` now also uses `avatarB64` for the 120px avatar + sidebar chip, not just the gradient.
- Backend `/api/profile/me` and `/api/profile/public/:userId` now attach `avatar_b64` from `db.user_avatars` (`is_active: true`) so **shared profile links show the real AI portrait to anyone who opens them**.
- `SovereignHub` gets a prominent **"My Sanctuary"** Link button next to Sign Out + Share. Hub nav menu also gains `My Sanctuary (Profile)` and `Friends` tiles.

**End-to-end proof (screenshot-verified):**
- Fractal Engine centerpiece renders the ethereal AI face, framed by amethyst ring, with green body (Robe of Tranquility) + violet Saturn crown + gold trinket orbit + display name "HAPPY" floating below.
- `/profile` shows the same portrait at 120px with Share + Edit buttons.
- Sovereign Hub shows "My Sanctuary" button + wallet pills + Share.

## 🔒 V68.17 (Feb 20, 2026) — Gatekeeper Wired + Cosmetic Bundle Store LIVE

**Door D — Stripe × Google Play gating COMPLETE (all 7 real-money surfaces wired):**
- Handler-level `guardCheckoutForTWA()` added at the top of every Stripe checkout call: `EconomyPage.handleSubscribe/handlePurchasePack/handlePurchasePolymath`, `CosmicStore.handleBuyCredits/handleSubscribeNexus`, `MembershipLoom.handleTierSelect`, `EnlightenMintHub.handleStripeCheckout`, `EnlightenmentContext.initiateAetherFlow`, `CosmicBroker.handleBuyCredits`.
- Dust-only endpoints (`/sovereigns/purchase-session`, `/sovereigns/purchase-utility`, `/treasury/purchase`) were audited and confirmed NOT Stripe — left untouched.
- `SovereignStageHUD` now carries a universal **"+" Top-Up pill** — always opens `enlighten-mint-cafe.me/economy?from=hud` in an external browser tab. One-tap Stripe handoff on every platform, zero ambiguity for Play Store reviewers.
- `/app/STRIPE_ANDROID_POLICY.md` documents the full 2026 policy stance.

**Cosmetic Bundle Store LIVE (backend + Mirror integration):**
- New `/app/backend/routes/cosmetic_bundles.py` — `GET /api/cosmetic-bundles` lists + `POST /api/cosmetic-bundles/purchase` debits Sparks and auto-equips the items into `rpg_equipped`. 3 starter bundles seeded once from Mongo (editable live, zero redeploy): **Sovereign Gold** (2500 cr, legendary body + rare head + legendary trinket), **Oracle Violet** (1200 cr, epic head + uncommon body), **Artisan Obsidian** (450 cr, uncommon head + common trinket).
- The Fractal Engine's Metabolic Mirror reads `rpg_equipped` directly, so every bundle purchase creates an *instant* visual transformation of the 3D silhouette at the lattice center — the highest-conversion surface in the app.
- End-to-end verified (screenshot): owner spent 1200 → balance 98,801 → silhouette flipped from gold to green body + violet Saturn crown in the same session. No page refresh.

## 🔒 V68.16 (Feb 20, 2026) — Metabolic Mirror + Stripe Android Gatekeeper

**Door C — Metabolic Mirror (LIVE, visually verified):** the user's 2D RPG equipment from `GET /api/rpg/character` now binds to the 3D `CrystallineSilhouette` at the center of the Fractal Engine:
- `equipped.body` → tapered pillar + inner core colour (via `rarity_color`, fall-back to Sparks tier colour)
- `equipped.head` → spawns a rotating Saturn-halo ring above the crystal head; rotation speed scales with Sparks tier
- `equipped.trinket` → spawns an orbiting accent ring around the heart core
- Dust still drives eye-glow; immersion-tick still pulses the core
- Listens to `sovereign:gear-change` custom event so the RPG loadout screen can force a refresh without a full reload
- Client-side rarity→hex map (`common #9CA3AF`, `uncommon #22C55E`, `rare #3B82F6`, `epic #A855F7`, `legendary #F59E0B`, `mythic #EC4899`) as a safety net when the backend omits `rarity_color`

**Screenshot proof:** owner (100k Sparks → SOVEREIGN gold body) wearing Lotus Headband (common) + Obsidian Amulet (common) renders as a gold pillar with a silver Saturn-halo crown and a silver orbiting trinket ring. Zero page errors.

**Door D — Stripe × Google Play "Multi-Platform Loophole" (scaffold shipped, 14 call sites pending):**
- New `frontend/src/hooks/useIsAndroidTWA.js` — detects Google Play TWA via `document.referrer = android-app://...`, standalone + Android UA, `?twa=1`, or `localStorage.force_twa=1`
- New `frontend/src/components/PaymentGate.js` — drop-in wrapper; off-TWA = pass-through, on-TWA = "Manage credits on web" link to `enlighten-mint-cafe.me/economy?from=android`
- New `/app/STRIPE_ANDROID_POLICY.md` — full policy doc + list of 14 checkout surfaces to wrap before final Play submit
- Revenue preserved: Android TWA users buy on web browser → existing `/api/webhook/stripe` credits by `user_id` → credits appear in-app within seconds. Google takes $0.

## 🔒 V68.13 (Feb 20, 2026) — Mobile Tap Audit + Seven Pillars Sprint

**User caught:** "Begin Guided Session" button on /meditation appeared dead on mobile. Root cause: GuidedSession used `position: relative` and rendered BELOW the grid + SmartDock, so taps were working but the resulting overlay was off-screen/occluded on mobile viewports.

**Fix shipped:**
- Meditation.js now hides the mode toggle + category filters + cards grid while `activeSession` is truthy
- GuidedSession auto-scrolls its own root into view on mount via `scrollIntoView({ behavior: 'smooth' })`
- Added explicit "← Back to Meditations" button for fast exit
- Min-height of 70vh on session root so Pause/Play/Sound/End controls are never buried

**Exhaustive mobile audit followed (iteration_359):**
25 pages validated on iPhone-size viewport (390×844). 100% pass rate. Zero click-to-nothing bugs. Backend 14/14 regression pass. Pytest suite durable at `/app/backend/tests/test_iteration_359_mobile_audit.py`.

**Seven Pillars Sprint shipped earlier today:**
- `GET /api/pillars/resonance` — user's per-pillar WIREFRAME/BLOOM/OBSIDIAN state driven by `lattice_activations` + `quest_progress`
- `<SovereignStageHUD />` — persistent Sparks/Dust/Mission pill across Fractal Engine, VR, Celestial Dome, RPG, with `sovereign:immersion-tick` accrual pulse
- FractalEngine.js — 7 classical pillars (Wellness/Culinary/Academy/Oracle/Craft/Community/Sanctuary) rendered as floating icosahedra orbiting the Crystalline Silhouette (Phase 4a avatar)
- Crystalline Silhouette: procedural Three.js figure with Sparks-reactive aura (violet→gold tier thresholds), Dust-reactive eye glow, immersion-tick core pulse, tilted halo ring
- Portal Routing: click → 1.2s eased camera fly-to → inline readout card → ENTER DOMAIN navigates to real sub-page
- Bonus: Solfeggio resonance tones (528/417/741/963/639/396/852 Hz) on click; OBSIDIAN nodes additionally tone on hover (throttled)
- Credit Policy v2 in CREDIT_SYSTEM.md §7.5: Acquired Credits 14-day window + 30% retention fee; Volunteer/Immersion Credits non-refundable non-exchangeable ("Time-is-Final")

## 🔒 V68.12 (Feb 20, 2026) — The 3D Black-Screen Truth

User caught that iteration_358 missed the real 3D bug: every R3F page was silently throwing `R3F: Cannot set "x-line-number"` recursively on load. iteration_358 tested only SVG pages (MiniLattice on Sovereign Hub), never the actual R3F canvases.

**Root cause (confirmed via source dive + web search):** Collision between Emergent's dev-mode visual-edits Babel plugin (injects `x-line-number`, `x-id`, `x-component` onto every JSX element) and R3F v9.6's stricter `applyProps` reconciler (tries to pierce dashed props as paths `obj.x['line-number']` and throws when the target doesn't exist on Three.js instances).

**Permanent fix shipped:**
- `frontend/patches/@react-three+fiber+9.6.0.patch` — adds `prop.startsWith('x-')` skip to R3F's `RESERVED_PROPS` filter in `applyProps` and `diffProps` (events-*.esm.js, events-*.cjs.dev.js, events-*.cjs.prod.js).
- `package.json` gets `"postinstall": "patch-package"` so the fix auto-reapplies on every `yarn install`.
- `jsconfig.json` gets `"jsx": "react-jsx"` + `craco.config.js` gets `@babel/preset-react` with `runtime: 'automatic'` for React 19 alignment.
- `src/index.js` gets a React DevTools inject-hook guard (belt-and-suspenders).

**Visual rehabilitation (proven with screenshots):**
- `FractalEngine.js` — rebuilt: 3 floating geodesic icosahedrons (cyan/magenta/yellow) on 2000-star field, plain-mesh stack (no drei `<Text>`/`<Stars>`), purple HUD, click-to-reveal atmospheric data card. Zero errors on load.
- `CelestialDome.js` — HUD moved from `flex-end` → `center` so the ACTIVATE button isn't buried under the global SmartDock. Clicking it boots 2000 purple/gold/cyan particles + edge geometry + orbital rings.
- `VirtualReality.js` — Cosmic Sanctuary star size 1.5→2.4 and nebula opacity 0.04-0.08 → 0.18-0.28. The cosmos is now actually visible.
- `MiniLattice` (unchanged, already SVG) — now demonstrably lighting up as user traverses the Sovereign lattice (3/81 nodes + resonance line captured in verification screenshots).

**Disk discipline:** Purged 4.8 GB (`node_modules/.cache`, `enlightenment_cafe_code.zip`, `_captures/`). `/app` back to 51% used.


## 🔒 V68.11 (Feb 20, 2026) — Full Sovereign Audit (Play Store Ship-Gate)
User requested "make sure every function is functioning inside and out and everything is connected and working proper" before production deploy to `enlighten.mint.cafe`. Testing agent iteration_358 ran full regression sweep.

**Result: 100% GREEN — zero critical, zero minor, zero UI/design issues.**

- Backend 15/15 tests passed: auth (register/login/me), GDPR export (real data, 40+ docs / 7 collections), GDPR delete (wipes throwaway user + returns 401 on re-login), owner bypass (sparks=99999, dust=10000, no trial nudge), Resend mailer (ok=true, provider=resend), Stripe (5 tiers + webhook reachable), sampled modules (meditation/journal/trade-circle/rpg/botany/bible/acupressure/breathing/coach).
- Static Play Store compliance: `/privacy.html`, `/delete-account.html`, `/.well-known/assetlinks.json` all 200 with both SHA-256 fingerprints (91:55:43… Play Signing + C1:78:D0… Upload).
- Frontend: Home 3D canvas renders (R3F v9.6.0 black-screen bug confirmed fixed), login flow → Sovereign Hub, 9x9 lattice renders, neural-connector-layer has `pointerEvents=none` (no Flatland Trap), RPG mobile inventory shows 4 tap-visible Equip/Use buttons at 375x812, Pricing shows 5 tiers, Settings toggles work, SPA routes `/privacy` and `/delete-account` render.
- **Metabolic Seal held: 248 KB gzipped main bundle (31% of the 800 KB ceiling).**
- Pytest suite: `/app/backend/tests/test_v68_8_sovereign_audit.py` (durable regression guardrail).

**Deploy status: code is production-ready. Awaiting user to click Deploy + wire `enlighten.mint.cafe` CNAME at DNS registrar.**


Sovereign Unified Engine (PWA). 176+ surfaced nodules, zero hidden modules.
No modals, no overlays — inline expansion only. Core bundle <800KB (Metabolic Seal).
Dynamic Registry (`workshop_v60.py`). RPG + Gamified Economy (Sparks & Dust).

## Architecture Snapshot
- Frontend: React + React-Router + framer-motion, context-driven state, lazy routes.
- Backend: FastAPI auto-discovers `/app/backend/routes/*.py` under `/api` prefix.
- DB: MongoDB (collections: `spark_wallets`, `quest_progress`, `universe_signals`, `rpg_xp_log`, …).
- Emergent LLM key for text/image gen (OpenAI GPT-5.2 + Nano Banana + Sora 2).

## 27 Workshop Cells — 100% Parity
Trade & Craft (10), Healing Arts (6), Sacred Knowledge (4), Science & Physics (3),
Creative Arts (1), Mind & Spirit (1), Exploration (2). 162 materials × 6-depth Dives × 243 tools.

## Changelog

### V68.10 (Feb 19, 2026) — Play Store Compliance Sweep
- **Privacy Policy page** (P0 Play Console blocker). Created `/app/frontend/src/pages/PrivacyPage.js` (React route `/privacy`, 8 color-coded sections, GDPR/COPPA-compliant) + `/app/frontend/public/privacy.html` (pure-HTML fallback for non-JS crawlers). Meta description + `<link rel="canonical">`. Deletion SLA: 14 days (30-day backup purge).
- **Account-deletion flow** (Google Play in-app-delete requirement). New backend route `DELETE /api/auth/me` in `/app/backend/routes/auth.py`:
  - Requires JSON body `{"confirm":"DELETE"}` (400 otherwise)
  - Purges the user row + 28 user-scoped collections + email-keyed tables
  - Returns `{"status":"deleted","user_id":…,"collections_purged":{…}}`
  - Curl-verified: wrong confirm→400, correct confirm→200, subsequent `/auth/me`→404, re-login→401
- **Danger Zone** in Settings (`/app/frontend/src/pages/Settings.js`):
  - Red-bordered inline section (no modal — respects Flatland rule)
  - Collapsed "Permanently Delete Account & Data" button expands in-place
  - Type-DELETE-to-confirm input with live validation
  - Red **🗑 Delete Permanently** button runs axios.delete → logout → localStorage.clear → `window.location = '/'`
  - Footer email fallback for support
- **RPG Cosmic Realm** equip UX fix (`/app/frontend/src/pages/RPGPage.js`):
  - Removed `opacity-0 group-hover:opacity-100` from ItemCard Equip/Use buttons — they were invisible on every touchscreen
  - Empty EquipSlot is now tappable ("Tap to equip") and auto-equips matching inventory item
  - Character tab gained a "N items ready to equip · Open Inventory →" banner when unequipped gear exists
  - Live-tested with owner account: Obsidian Amulet tap-equipped to Trinket, Vitality 1→3 confirmed

### V68.9 (Feb 19, 2026) — Play Store Cover Assets
- Extracted the clean Sri Yantra tile from the user-supplied PWABuilder zip
  (buried inside a 1024×1024 screenshot — the colorful logo region was
  auto-located by saturation-mask bbox against the `windows/LargeTile.scale-400.png`).
- Built a procedural cosmic-nebula background (deep indigo/violet gradient,
  randomized star field, gold aura) so the cover stays sharp independent of
  the source screenshot's resolution.
- Composed 4 assets at `/app/frontend/public/store-assets/`:
  - `feature-graphic-1024x500.png` — Google Play hero banner
  - `app-icon-512.png` — Play Store hi-res icon
  - `app-icon-1024.png` — oversize master (for future stores / OG / Apple)
  - `og-cover-1200x630.png` — WhatsApp / Twitter / LinkedIn link preview
- Wired `og:image` + `twitter:image` in `/app/frontend/public/index.html`
  so social shares of the live site now render the new cover.
- Rebuildable via `/app/backend/scripts/build_store_covers.py` (PIL only).
- Uses serif-bold gold title ("ENLIGHTEN.MINT.CAFE"), white-on-black
  tagline ("THE SOVEREIGN UNIFIED ENGINE"), amber "by INFINITY SOVEREIGN"
  byline, and a bottom-right micro-label ("Sovereign PWA · 176+ Nodules · 9×9
  Crystalline Lattice"). Title size auto-fits to canvas width.

### V68.4 (Feb 18, 2026) — Phase D: The Sovereign Guide
- **Sovereign Universe Kernel** (`/app/frontend/src/context/SovereignUniverseContext.js`)
  - React Context + vanilla `window.SovereignUniverse` bridge (version 68.4)
  - Exposes `checkQuestLogic`, `refreshGlobalUI`, `awardSpark`, `hasCard`
  - Broadcasts `sovereign:update` CustomEvent for non-React listeners
- **Quest Auto-Detect** (`/app/backend/routes/quests.py`)
  - Each step has `auto_signal` (e.g. `geology:material:minerals`, `forestry:dive:wildfire:3`)
  - `POST /api/quests/auto_detect` enforces ordered completion + idempotency
  - Legacy `/quests/advance` preserved
- **Aggregate Endpoint** (`/app/backend/routes/sovereign_universe.py`)
  - `GET /api/universe/state` — wallet + quests in one round-trip
  - `POST /api/universe/signal` — signal breadcrumb log
- **Active Mission HUD** (`/app/frontend/src/components/ActiveMissionHUD.js`)
  - Inline pill beneath Spark Wallet in `SovereignHub.js`
  - Expands inline to reveal step list, hint, jump-to links
  - Shows auto-advance toast ribbons (inline — no fixed overlay)
  - Plays 528Hz Solfeggio ping on step advance, triple-chord on quest complete
  - Inline Gaming Card cinematic on quest complete (no modal)
- **Tier Gating** (`/app/frontend/src/components/TierGate.js`)
  - `/evolution-lab` + `/vr/celestial-dome` require `celestial_navigator` Gaming Card
  - Creator/admin/council bypass. Guests get sign-in CTA.
- **Terminal Signal Triggers** (`/app/frontend/src/components/QuestTerminalTrigger.js`)
  - Mounted on `/tesseract`, `/dream-realms`, `/observatory`
  - Renders inline only when prior quest steps are complete — self-hides otherwise
- **Solfeggio Tone Utility** (`/app/frontend/src/utils/solfeggioTone.js`)
  - Web Audio API bell-envelope oscillators (no new deps)
  - 528Hz "transformation" tone + 528/639/741 chord stack on quest complete
- **Card-earned API fix** (`/app/backend/routes/sparks.py` + `sovereign_universe.py`)
  - `/sparks/wallet`, `/sparks/cards`, `/universe/state` now merge threshold-based
    AND quest-reward cards (e.g. tesseract_key is visible even at 2398 sparks)
- **Workshop Signal Wiring** (`UniversalWorkshop.js`)
  - `handleMatTap` fires `<module>:material:<id>` when user opens a dive
  - "Dive Deeper" fires `<module>:dive:<material>:<depth>`

### V68.3 — Spark Engine + Observatory Overhaul
- 12 Spark reward streams + 6 Gaming Cards
- Observatory: 20 Western Constellations + NASA imagery + continuous audio
- "Resonant Frequency" cross-domain quest

### V68.0 — Five New Modules (Full Parity)
Forestry, Geology, Economics, Music Theory, Permaculture

## Backlog
### P1
- Tesseract / Dream Realms / Observatory pages — fire `checkQuestLogic` on their own activation events (wake_tesseract, dream_realms:fire_extinguish, observatory:decode)
- Membership page polish (Council/Sovereign/Citizen hierarchy copy)
- Spark-sink purchases (unlock individual dives or tools for Sparks)

### P2
- Meritocratic depth gating (higher dives require prior XP)
- Sovereign Leaderboard
- Predictive navigation
- Native mobile screen recording
- Phygital Marketplace NFC hooks

### Known Environment Limits
- Pod is ARM64 — cannot compile Android AAB/APK. Deployment path is PWABuilder.com.
- `/app` disk usage ~90% — avoid large new deps.
