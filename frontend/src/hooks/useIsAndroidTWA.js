/**
 * useIsAndroidTWA — detects if the PWA is running inside Google Play as a
 * Trusted Web Activity (TWA). This is the "Spotify / Netflix" gatekeeper
 * signal: when TRUE, we must NOT show any Stripe Buy / Top-Up / Checkout
 * button inside the app — Google Play policy mandates their IAB system for
 * in-app digital goods. Users must be routed to the web (enlighten-mint-cafe.me)
 * to top up credits in their mobile browser instead.
 *
 * Detection priority (most reliable → least):
 *   1. document.referrer starts with "android-app://"       (TWA definitive)
 *   2. window.matchMedia('(display-mode: standalone)')      (installed PWA)
 *      AND navigator.userAgent matches Android              (Android-only)
 *   3. ?twa=1 query param                                   (manual override)
 *   4. localStorage['force_twa'] === '1'                    (QA override)
 *
 * The hook is SSR-safe and returns `false` until the client mounts to avoid
 * hydration flicker.
 */
import { useEffect, useState } from 'react';

export function detectAndroidTWA() {
  if (typeof window === 'undefined') return false;
  try {
    // 1. Hard signal — TWA launches with android-app:// referrer.
    if (typeof document !== 'undefined' &&
        typeof document.referrer === 'string' &&
        document.referrer.startsWith('android-app://')) {
      return true;
    }
    // 2. Installed PWA on Android (heuristic — covers users who already
    //    accepted "install" before we shipped TWA).
    const ua = (navigator.userAgent || '').toLowerCase();
    const isAndroid = ua.includes('android');
    const standalone =
      window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    if (isAndroid && standalone) return true;
    // 3. Query-string override (marketing or deep-link forcing TWA mode).
    const params = new URLSearchParams(window.location.search);
    if (params.get('twa') === '1') return true;
    // 4. QA override.
    if (window.localStorage && window.localStorage.getItem('force_twa') === '1') {
      return true;
    }
  } catch { /* privacy mode / disabled storage — fall through */ }
  return false;
}

export default function useIsAndroidTWA() {
  const [isTWA, setIsTWA] = useState(false);
  useEffect(() => { setIsTWA(detectAndroidTWA()); }, []);
  return isTWA;
}
