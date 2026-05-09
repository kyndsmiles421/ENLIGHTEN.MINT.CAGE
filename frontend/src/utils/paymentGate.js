/**
 * paymentGate.js — handler-level guard for every Stripe checkout call.
 *
 * Usage at the top of ANY function that creates a Stripe checkout session:
 *
 *   import { guardCheckoutForTWA } from '../utils/paymentGate';
 *
 *   const handleBuy = async (pack) => {
 *     if (guardCheckoutForTWA('pack_buy')) return;   // ← always first line
 *     // ...normal Stripe flow continues on web / iOS / desktop
 *   };
 *
 * When running inside the Google Play TWA, the guard opens
 * https://enlighten-mint-cafe.me/economy?from=android in the user's default
 * external browser (via window.open with noopener) and returns TRUE so the
 * caller aborts — no Stripe SDK call leaves the APK. This is the
 * Spotify/Netflix/Kindle pattern that preserves 100% of Stripe revenue and
 * keeps us compliant with Google Play 2026 billing policy.
 *
 * On non-TWA platforms the guard is a no-op (returns FALSE) and the caller
 * proceeds with its normal Stripe checkout flow.
 */
import { detectAndroidTWA } from '../hooks/useIsAndroidTWA';

const WEB_TOPUP_URL = 'https://enlighten-mint-cafe.me/economy?from=android';

export function guardCheckoutForTWA(reason = 'checkout') {
  if (!detectAndroidTWA()) return false;
  try {
    // Small toast/log so the user knows why the external browser opened.
    // (Silent if window.alert stubs aren't available.)
    console.info('[PaymentGate] TWA detected — routing', reason, '→ web.');
    window.open(WEB_TOPUP_URL, '_blank', 'noopener,noreferrer');
  } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  return true;
}

export { WEB_TOPUP_URL };
