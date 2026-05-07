/**
 * UnlockBus.js — V1.1.6 Sovereign Event Bus
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Featherweight pub-sub for "I just unlocked something" events.
 * Producers (TesseractVault::triggerUnlock, future modifier panels)
 * dispatch; consumers (HelixNav3D, future SmartyMe dashboards) ripple.
 *
 * Why not React context? Because the consumer (HelixNav3D) often
 * lives on a completely different route from the producer. A global
 * window-event bus reaches across the whole OS without prop-drilling
 * or lifting state to the App root.
 */

const EVENT_NAME = 'sovereign:unlock';

/**
 * Fire an unlock event. All HelixNav3D instances mounted anywhere in
 * the OS will pick it up and run a 1s ripple wave through their 81
 * nodes.
 *
 * @param {Object} detail
 * @param {string} detail.kind         — 'relic' | 'pillar' | 'modifier'
 * @param {string} [detail.id]         — relic id, route, etc.
 * @param {string} [detail.color]      — accent color for the ripple
 */
export function dispatchUnlock(detail = {}) {
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
  } catch { /* SSR-safe */ }
}

/**
 * Subscribe. Returns a cleanup function.
 * @param {(detail: object) => void} handler
 */
export function onUnlock(handler) {
  if (typeof window === 'undefined') return () => {};
  const wrapped = (e) => handler(e.detail || {});
  window.addEventListener(EVENT_NAME, wrapped);
  return () => window.removeEventListener(EVENT_NAME, wrapped);
}

export default { dispatchUnlock, onUnlock };
