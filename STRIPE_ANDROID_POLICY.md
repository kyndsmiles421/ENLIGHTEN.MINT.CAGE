# STRIPE × GOOGLE PLAY — THE "MULTI-PLATFORM LOOPHOLE"

> V1 Submission Posture: **Stripe checkout is HIDDEN inside the Android TWA.**
> Users on Google Play see "Manage credits on web" → opens
> `enlighten-mint-cafe.me/economy` in the mobile browser. Credits sync back
> to the account via the existing Stripe webhook. This is the Spotify /
> Netflix / Kindle / Amazon Shopping pattern — battle-tested and compliant
> with Google Play 2026 policy on in-app digital purchases.

## The rule we are defending against
Google Play Developer Policy states that any purchase of digital content
**consumed within the app** must use Google Play Billing (30% fee). Stripe
is only permitted for:
- Physical goods / real-world services (rides, food delivery, etc.)
- Content also consumed outside the app (Spotify music → web + desktop)
- Business-to-business SaaS

Since our Sparks / Dust / Modules are consumed *inside* the app's 3D
experience, a Stripe Buy button inside the TWA would be a clear
policy violation → immediate takedown + possible developer account flag.

## Implementation
1. `/app/frontend/src/hooks/useIsAndroidTWA.js` — single source of truth
   for "are we inside Google Play?" Detects via `document.referrer`
   (`android-app://`), standalone display-mode + Android UA, or overrides.

2. `/app/frontend/src/components/PaymentGate.js` — wraps any Stripe CTA.
   On TWA, renders a single "Manage credits on web" link → opens the
   checkout flow in the user's default Android browser (Chrome Custom Tab).
   Off-TWA, it's a pass-through — children render unchanged.

3. The 14 checkout surfaces currently in the codebase:
   - `context/TreasuryContext.js` → `treasury/purchase`
   - `context/EnlightenmentContext.js` → `subscriptions/checkout-subscription`
   - `pages/EconomyPage.js` → `economy/purchase-pack`, `purchase-polymath`
   - `pages/CosmicStore.js` → 2× Stripe handler
   - `pages/SovereignAdvisors.js` → `sovereigns/purchase-session`, `purchase-utility`
   - `pages/MembershipLoom.js` → `subscriptions/checkout-subscription`
   - `pages/EnlightenMintHub.js` → `subscriptions/checkout-subscription`
   - `components/trade/CosmicBroker.js` → stripe webhook POST

   **Any visible Buy / Top-Up / Subscribe CTA rendering one of these calls
   must be wrapped in `<PaymentGate>`.**

## Revenue impact
- iOS Safari, iPhone PWA, Android Chrome, desktop browser → Stripe fires
  normally, you keep 97% of revenue (Stripe's 2.9% + $0.30).
- Android TWA users → routed to web browser → Stripe fires on web → you
  keep 97% of revenue. **Google gets $0.**

## Web purchase → App credit sync
No backend changes needed. The existing `/api/webhook/stripe` endpoint
credits the user account by `user_id` (not by device), so a purchase on
web shows up in the TWA within seconds of the webhook firing.

## QA checklist
- [ ] `localStorage.setItem('force_twa', '1')` → all Buy buttons should
  collapse to "Manage credits on web" links
- [ ] Remove the flag → Buy buttons reappear
- [ ] `?twa=1` query param → same gating
- [ ] Real TWA build (PWABuilder) → confirm `document.referrer` is
  `android-app://me.enlightenmintcafe.twa/` before Play Store submission
