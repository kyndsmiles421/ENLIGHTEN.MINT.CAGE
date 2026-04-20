/**
 * SovereignTrial — 24-Hour Sovereign Access protocol.
 *
 * On the very first launch (no prior trial record), the Sovereign gets
 * 24 hours of Tier 4 (Gilded) access. When the clock hits zero, the
 * trial expires and tier drops back to 'free'. A custom event
 * 'sovereign:trial' fires on every state change so HUD can react.
 *
 * The Sovereign can always purchase a real tier to persist access.
 * Visitor Mode overrides trial — visitors always see Tier 1 Observer.
 */

const LS_KEY = 'sovereign_trial_v1';
const TRIAL_MS = 24 * 60 * 60 * 1000; // 24 hours

function read() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); }
  catch { return null; }
}

function write(obj) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sovereign:trial', { detail: obj }));
  }
}

/** Ensure a trial record exists. First call = starts the 24h clock. */
export function ensureTrial() {
  let t = read();
  if (!t) {
    t = { startedAt: Date.now(), endsAt: Date.now() + TRIAL_MS, status: 'active' };
    write(t);
  }
  return t;
}

export function getTrial() {
  const t = read();
  if (!t) return null;
  // Auto-expire if past endsAt and still marked active
  if (t.status === 'active' && Date.now() >= t.endsAt) {
    t.status = 'expired';
    write(t);
  }
  return t;
}

export function msRemaining() {
  const t = getTrial();
  if (!t || t.status !== 'active') return 0;
  return Math.max(0, t.endsAt - Date.now());
}

export function isActive() {
  const t = getTrial();
  return !!(t && t.status === 'active' && Date.now() < t.endsAt);
}

/** Reset — for testing or if the Sovereign wants to re-experience. */
export function resetTrial() {
  localStorage.removeItem(LS_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sovereign:trial', { detail: null }));
  }
}

if (typeof window !== 'undefined') {
  window.__sovereignTrial = { ensureTrial, getTrial, msRemaining, isActive, resetTrial };
}

export default { ensureTrial, getTrial, msRemaining, isActive, resetTrial };
