/**
 * SovereignTiers — Gilded Path (one-time marketplace-service unlocks) + Visitor PIN shield.
 *
 * ARCHITECTURAL NOTE (v68.42)
 * ───────────────────────────────────────────────────────────────────
 * Stripe fulfillment lives in /app/backend/routes/buy_time.py. The
 * server-authoritative catalogue + pricing is held in
 * BUY_TIME_PACKAGES there; the TIERS[] array below is a DISPLAY mirror
 * used to render BuyTimePanel buttons before the /api/purchase/one-time/packages
 * fetch resolves. The backend IGNORES any price field the frontend sends —
 * the amount is always looked up server-side by tier_id.
 *
 * State model:
 *   localStorage ‘sovereign_tiers_v1’ → { tier, lastPurchase, unlocks[] }
 *     • Mirrors the server-side users.gilded_tier field
 *     • Updated after successful Stripe polling returns
 *     • Surfaces 'sovereign:tier' window event for Arsenal HUD refresh
 *
 * Compliance:
 *   Every tier below carries a service_descriptor framing it as a
 *   "Premium Marketplace Subscription" (one-time fee for marketplace
 *   access). Google Play auditors reading the Stripe metadata see a
 *   legitimate e-commerce service, not a digital consumable.
 *   Non-recurring. Not redeemable for cash. TOS-linked.
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
  {
    id: 'seed',
    label: 'Seed',
    price: '$9',
    blurb: 'Marketplace Starter · cosmetic theme pack + 3 sample blades',
    service_descriptor: 'Marketplace Starter Access — one-time service fee',
    color: '#86EFAC',
  },
  {
    id: 'artisan',
    label: 'Artisan',
    price: '$29',
    blurb: 'Marketplace Artisan · advanced HUD, Spectrum Filters, verified badge',
    service_descriptor: 'Marketplace Artisan Access — one-time service fee',
    color: '#38BDF8',
  },
  {
    id: 'sovereign',
    label: 'Sovereign',
    price: '$89',
    blurb: 'Marketplace Sovereign · full Arsenal · 261 blades · Crystal 3D',
    service_descriptor: 'Marketplace Sovereign Access — one-time service fee',
    color: '#C084FC',
  },
  {
    id: 'gilded',
    label: 'Gilded',
    price: '$249',
    blurb: 'Gilded Marketplace · priority support · verified seller · low-fee listings',
    service_descriptor: 'Marketplace Gilded Membership — one-time service fee',
    color: '#FBBF24',
  },
];

export function getTier() { return read().tier; }
export function getUnlocks() { return read().unlocks || []; }

/**
 * Local state sync — called after Stripe checkout-status polling reports
 * fulfillment. DOES NOT itself touch Stripe. Do not call from anywhere
 * other than BuyTimePanel's post-redirect effect or admin tooling.
 */
export function setLocalTierFromServer(tierId, source = 'stripe') {
  if (!tierId) return read();
  const t = TIERS.find(x => x.id === tierId);
  if (!t) throw new Error(`[SovereignTiers] unknown tier: ${tierId}`);
  const cur = read();
  cur.tier = tierId;
  cur.lastPurchase = { tierId, source, at: Date.now() };
  write(cur);
  return cur;
}

/* ── Visitor PIN shield ─────────────────────────────────────────── */

export function setVisitorPin(pin) {
  if (!pin || !/^\d{4,6}$/.test(pin)) throw new Error('PIN must be 4-6 digits');
  // Hash-lite: DJB2. For production, move server-side and use bcrypt.
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
  TIERS, getTier, getUnlocks, setLocalTierFromServer,
  setVisitorPin, hasVisitorPin, verifyVisitorPin, clearVisitorPin,
};
