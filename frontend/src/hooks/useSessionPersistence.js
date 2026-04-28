/**
 * useSessionPersistence.js — Time-Capsule Beacon (V68.59)
 *
 * On every tab-hide / pagehide / unload event, snapshots the
 * ContextBus + last-known engine load and fires a sendBeacon POST
 * to `/api/time-capsules/archive`. Survives the browser tearing the
 * page down (sendBeacon queues the request even after document
 * detach). On mobile the `pagehide` event is the reliable signal —
 * `beforeunload` is suppressed by Safari/Chrome iOS.
 *
 * Auth: sendBeacon cannot set Authorization headers (only safe
 * Content-Types). We embed the JWT in the JSON payload itself; the
 * backend extracts it from `body.token`. Documented trade-off in the
 * route file.
 *
 * Dedup: a session-stable `session_id` (uuid) is generated on first
 * mount and reused for the lifetime of the page. The backend
 * de-dups within a 5-second window so visibilitychange + pagehide
 * (which often fire together on mobile) don't write twice.
 *
 * Mounted once at SovereignProviders so it persists across every
 * route. Single global listener.
 */
import { useEffect, useRef } from 'react';
import { read as readContextBus } from '../state/ContextBus';

const ENDPOINT = `${process.env.REACT_APP_BACKEND_URL}/api/time-capsules/archive`;

function uuid4() {
  // RFC4122-ish — good enough for client session identification
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11)
    .replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
}

function getSessionId() {
  try {
    let id = sessionStorage.getItem('emcafe_session_id');
    if (!id) {
      id = uuid4();
      sessionStorage.setItem('emcafe_session_id', id);
    }
    return id;
  } catch { return uuid4(); }
}

function getToken() {
  try {
    return localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
  } catch { return ''; }
}

function getLatestEngineState() {
  // Latest gauge state, written by useEngineLoad on every tick.
  // Hook publishes this to window.__sovereignGauge so the beacon can
  // read without subscribing (would create a double-mount loop).
  const g = (typeof window !== 'undefined' && window.__sovereignGauge) || null;
  return g ? { gauge_load: g.load, gauge_state: g.state } : {};
}

function getActiveModule() {
  // Tools dispatch sovereign:state-shift; the dispatcher writes the
  // current id to window.__sovereignActiveModule (cheap, no React).
  return (typeof window !== 'undefined' && window.__sovereignActiveModule) || 'IDLE';
}

function fire() {
  try {
    const token = getToken();
    if (!token) return; // Nothing to archive for guest sessions
    const payload = {
      token,
      session_id: getSessionId(),
      snapshot: readContextBus(),
      active_module: getActiveModule(),
      client_ts: new Date().toISOString(),
      ...getLatestEngineState(),
    };
    const body = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, body);
    } else {
      // Fallback for ancient WebViews. keepalive lets fetch survive
      // unload like sendBeacon does.
      fetch(ENDPOINT, {
        method: 'POST',
        body,
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {});
    }
  } catch { /* noop — beacons are best-effort */ }
}

export function useSessionPersistence() {
  const lastFireRef = useRef(0);

  useEffect(() => {
    // Throttle: don't beacon more than once every 8 seconds. If the
    // user toggles tabs rapidly, only the first hide writes.
    const fireThrottled = () => {
      const now = Date.now();
      if (now - lastFireRef.current < 8000) return;
      lastFireRef.current = now;
      fire();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') fireThrottled();
    };
    const onPageHide = () => fireThrottled();
    // beforeunload kept as a belt-and-braces fallback for desktop
    const onBeforeUnload = () => fireThrottled();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);
}
