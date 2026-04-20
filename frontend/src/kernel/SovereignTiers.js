/**
 * SovereignTiers — Buy-Time catalogue + Visitor PIN shield.
 *
 * Pure in-app logic (no Stripe call wired yet — that's a Phase 3 task).
 * Records intent + grants a cosmetic unlock. Real payment integration
 * happens via Stripe integration_playbook_expert in a dedicated session.
 *
 * Tiers:
 *   seed     · Cosmetic skin pack + 3 sample labs unlocked
 *   artisan  · Advanced HUD + Spectrum Filters
 *   sovereign · Full Arsenal unlock (all 261 blades) + instant Crystal Fidelity 3D
 *   gilded   · Sovereign + priority support + Visitor-Mode invitations
 *
 * Earned path always remains available. Buying time skips the gate; it
 * never replaces the signal. 528Hz exclusive to LabStage passes.
 */

const LS_KEY = 'sovereign_tiers_v1';
const LS_PIN = 'sovereign_visitor_pin_v1';

function read() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{"tier":"free","unlocks":[]}'); }
  catch { return { tier: 'free', unlocks: [] }; }
}

function write(obj) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sovereign:tier', { detail: obj }));
  }
}

export const TIERS = [
  { id: 'seed',      label: 'Seed',      price: '$9',   blurb: 'Cosmetic skin pack + 3 sample labs',      color: '#86EFAC' },
  { id: 'artisan',   label: 'Artisan',   price: '$29',  blurb: 'Advanced HUD + Spectrum Filters',         color: '#38BDF8' },
  { id: 'sovereign', label: 'Sovereign', price: '$89',  blurb: 'Full Arsenal · 261 blades · Crystal 3D',  color: '#C084FC' },
  { id: 'gilded',    label: 'Gilded',    price: '$249', blurb: 'Sovereign + priority support + invites',  color: '#FBBF24' },
];

export function getTier() { return read().tier; }
export function getUnlocks() { return read().unlocks || []; }

export function purchaseTier(tierId) {
  const t = TIERS.find(x => x.id === tierId);
  if (!t) throw new Error(`[SovereignTiers] unknown tier: ${tierId}`);
  const cur = read();
  cur.tier = tierId;
  cur.lastPurchase = { tierId, at: Date.now() };
  write(cur);
  return cur;
}

/* ── Visitor PIN shield ─────────────────────────────────────────── */

export function setVisitorPin(pin) {
  if (!pin || !/^\d{4,6}$/.test(pin)) throw new Error('PIN must be 4-6 digits');
  // Hash-lite: store SHA-like via simple DJB2. For production, move
  // server-side and use bcrypt.
  let h = 5381;
  for (let i = 0; i < pin.length; i++) h = ((h << 5) + h) + pin.charCodeAt(i);
  localStorage.setItem(LS_PIN, String(h));
}

export function hasVisitorPin() {
  return !!localStorage.getItem(LS_PIN);
}

export function verifyVisitorPin(pin) {
  if (!pin) return false;
  let h = 5381;
  for (let i = 0; i < pin.length; i++) h = ((h << 5) + h) + pin.charCodeAt(i);
  return String(h) === localStorage.getItem(LS_PIN);
}

export function clearVisitorPin() {
  localStorage.removeItem(LS_PIN);
}

export default {
  TIERS, getTier, getUnlocks, purchaseTier,
  setVisitorPin, hasVisitorPin, verifyVisitorPin, clearVisitorPin,
};
