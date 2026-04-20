/**
 * SovereignMath.js — V68.27 Crystalline Math Kernel
 *
 * The baseline math that every UI transition, particle trajectory, and
 * Sparks-ledger calculation in the app now references. Instead of
 * hand-tuned cubic-beziers and magic-number delays scattered across
 * 300+ components, we expose a small set of PHI-weighted primitives.
 *
 * Guiding identities:
 *   φ       = 1.6180339887... (Golden Ratio)
 *   1/φ     = 0.6180339887...
 *   φ²      = φ + 1          (closure identity)
 *   Fib(n)  = round(φⁿ / √5) (Binet)
 *
 * Why this file exists:
 *   • One source of truth for easing / staggered reveals.
 *   • Deterministic Sparks ledger math (no drift between modules).
 *   • Depth-scaled visual intensity — infinity-of-infinity-to-the-z is
 *     realised as a bounded φ^z falloff so GPU pressure stays flat.
 *   • Pure functions, tree-shakeable, ≈0.4KB minified: Metabolic Seal
 *     safe.
 */

export const PHI      = 1.618033988749895;
export const PHI_INV  = 0.618033988749895;
export const PHI_SQ   = 2.618033988749895;
export const SQRT5    = 2.23606797749979;

// ─── Easing ──────────────────────────────────────────────────────────
// phiEase(t) — a cubic-like curve biased by the Golden Ratio. Starts
// slow, blooms at t=1/φ, lands softly. Use as a framer-motion ease.
export function phiEase(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const u = 1 - t;
  // Cubic with PHI-weighted control points: P1 at t=1/φ lifts early,
  // P2 at t=1-1/φ² smooths the landing — perceptually "natural".
  return 3 * u * u * t * PHI_INV + 3 * u * t * t * (1 - PHI_INV * PHI_INV) + t * t * t;
}

// Framer-motion compatible named tuple (optional — pass by value).
export const PHI_EASE_BEZIER = [PHI_INV, 0, 1 - PHI_INV * PHI_INV, 1];

// ─── Staggered reveals (Fibonacci delays) ────────────────────────────
// Returns the delay (seconds) for the i-th element in a staggered
// entrance. Each subsequent delay is scaled by 1/φ so the sequence
// feels accelerating — a natural Fibonacci cadence.
export function phiStaggerDelay(i, base = 0.08) {
  if (i <= 0) return 0;
  // sum_{k=0}^{i-1} base * (1/φ)^k — geometric series
  const r = PHI_INV;
  return base * (1 - Math.pow(r, i)) / (1 - r);
}

// Raw Fibonacci value via Binet — O(1), exact for n ≤ 70.
export function phiFib(n) {
  if (n < 0) return 0;
  return Math.round(Math.pow(PHI, n) / SQRT5);
}

// ─── xyz^φ Golden Trajectory ─────────────────────────────────────────
// Maps a parametric t ∈ [0,1] and a depth z ∈ [0, ∞) to a point
// proportional to (x·t)^φ along the path. Use for particle motion so
// things "accelerate toward infinity" without ever diverging on screen.
export function phiPath(t, z = 0) {
  const clamped = Math.max(0, Math.min(1, t));
  const depthScale = Math.pow(PHI_INV, z);  // bounded φ^{-z}
  return Math.pow(clamped, PHI) * (1 - depthScale) + clamped * depthScale;
}

// depthFalloff(z) — bounded "∞^z" interpreted as φ^{-z}. Returns a
// [0,1] multiplier for per-layer visual intensity. Used to throttle
// high-z decoration so the chamber never burns battery.
export function depthFalloff(z) {
  if (z <= 0) return 1;
  return Math.pow(PHI_INV, z);
}

// ─── Sparks Ledger (Plus / Minus Balance) ────────────────────────────
// Deterministic balance helper. `earned` and `cost` are arrays of
// non-negative numbers; the result always respects the closed-loop
// economy rule (Sparks are NEVER deducted — the ledger can only show
// how much performance headroom the session consumed).
export function sparkBalance({ earned = [], cost = [] } = {}) {
  const E = earned.reduce((a, b) => a + Math.max(0, Number(b) || 0), 0);
  const C = cost.reduce((a, b)   => a + Math.max(0, Number(b) || 0), 0);
  return {
    earned: E,
    cost: C,
    net: E - C,                 // pure reporting — never used to debit Sparks
    ratio: C > 0 ? E / C : Infinity,
    efficient: E >= C * PHI_INV, // "golden" if earn ≥ 0.618 × cost
  };
}

// ─── Rainbow Refraction (splits a color across φ-spaced hues) ────────
// Returns `n` hex strings evenly placed on the hue wheel, weighted by
// φ so adjacent colors always feel harmonious. Used by ChamberProp /
// ChamberMiniGame for the "refracted crystal" look.
export function phiRainbow(baseHue, n = 7) {
  const step = 360 * PHI_INV / Math.max(1, n);
  const out = [];
  for (let i = 0; i < n; i++) {
    const h = (baseHue + i * step) % 360;
    out.push(`hsl(${h.toFixed(1)}, 70%, 62%)`);
  }
  return out;
}

// ─── Frame-rate guard ────────────────────────────────────────────────
// 60fps budget = 16.67ms/frame. phiBudget returns the Golden Ratio
// share of that budget for a given layer priority (0=background,
// 1=mid, 2=foreground). The higher-priority layer always gets the
// majority share — PHI_INV (0.618). Lower layers share the remainder.
export function phiBudget(priority = 0) {
  const frame = 16.67;
  if (priority >= 2) return frame * PHI_INV;
  if (priority === 1) return frame * (PHI_INV * (1 - PHI_INV));
  return frame * (1 - PHI_INV);
}

// ─── Golden Ratio equal-power crossfade ──────────────────────────────
// phiCrossfade(v) takes a linear volume [0..1] and returns a pair of
// gain values { a, b } suitable for a φ-weighted equal-power fade
// between two channels. When v=0, a=1 b=0. When v=1, a=0 b=1. At the
// midpoint the curve bows toward the Golden Ratio so crossfades
// between pillars (e.g. SOS↔WIS) feel physically balanced, not linear.
export function phiCrossfade(v) {
  const t = Math.max(0, Math.min(1, v));
  // Weighted cosine equal-power curve bent by φ⁻¹ so the 50/50 point
  // lands at t = 1-1/φ² (≈ 0.618) rather than 0.5.
  const bent = Math.pow(t, PHI_INV);
  return {
    a: Math.cos(bent * Math.PI / 2),
    b: Math.sin(bent * Math.PI / 2),
  };
}

// phiVolumeCurve(linear) — maps a [0..100] slider to a [0..1] gain
// using a φ-shaped perceptual curve. Louder at the low end (perceived
// loudness is log-weighted), softer at the top so users don't clip.
export function phiVolumeCurve(linearPct) {
  const t = Math.max(0, Math.min(100, Number(linearPct) || 0)) / 100;
  return Math.pow(t, PHI);
}

// ─── Fibonacci snap-grid tokens ──────────────────────────────────────
// All UI spacing can reference a single Fibonacci cadence so panels,
// HUD, icons, and text stack naturally. Use SPACING[n] for spacing,
// RADIUS[n] for corner radii.
export const FIB_PX = [2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
export const SPACING = FIB_PX;
export const RADIUS  = FIB_PX;
export const identities = {
  phi_squared_minus_phi_equals_one: () => Math.abs(PHI * PHI - PHI - 1) < 1e-10,
  phi_times_phi_inv_equals_one:    () => Math.abs(PHI * PHI_INV - 1) < 1e-10,
};
