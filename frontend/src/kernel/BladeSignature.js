/**
 * BladeSignature — derives the Sovereign's current title from their
 * calibration (4 materials) + mastery (per-domain scores).
 *
 * Pure function. No side effects. Call anytime to read the LIVE truth.
 *
 *   getSignature() => {
 *     title:       'Celestial Architect',
 *     subtitle:    'Metal 0.85 · Oil 0.62 · Forge Grip',
 *     materials:   [['metal', 0.85], ['oil', 0.62], ...],
 *     dominantDomain: 'geology',
 *     pinned:      false,
 *   }
 *
 * When the Sovereign pins a title via SovereignPreferences.identity.pinnedSignature,
 * that overrides the auto-derived title until they unpin.
 */

import SovereignPreferences from './SovereignPreferences';
import MasteryLedger from './MasteryLedger';

/**
 * Title map: four axes (rank-ordered 1st/2nd) → cinematic title.
 *
 * Axes are the TOP-TWO materials the Sovereign weighs above 0.6. When
 * only one axis qualifies, the subtitle signature uses a "Solo Grip."
 */
const TITLE_MAP = {
  'metal+glass':  'Celestial Architect',
  'metal+oil':    'Forge Alchemist',
  'metal+gold':   'Sovereign Engineer',
  'glass+metal':  'Sacred Geometrician',
  'glass+oil':    'Refracted Artisan',
  'glass+gold':   'Resonance Composer',
  'oil+metal':    'Precision Chef',
  'oil+glass':    'Elemental Healer',
  'oil+gold':     'Elixir Merchant',
  'gold+metal':   'Council Strategist',
  'gold+glass':   'Sovereign Curator',
  'gold+oil':     'Trade Apothecary',
  // Solo grips (when only ONE axis > 0.6)
  'metal':        'Forge Engineer',
  'glass':        'Crystalline Poet',
  'oil':          'Sovereign Chef',
  'gold':         'Council Elder',
  // No strong axis — balanced
  'balanced':     'Sovereign-in-Training',
};

function rankedMaterials(cal) {
  return ['metal', 'glass', 'oil', 'gold']
    .map(k => [k, cal[k] ?? 0.5])
    .sort((a, b) => b[1] - a[1]);
}

function deriveTitle(cal) {
  const ranked = rankedMaterials(cal);
  const dominant = ranked.filter(([, v]) => v >= 0.6);
  if (dominant.length === 0) return { title: TITLE_MAP.balanced, gripKind: 'balanced' };
  if (dominant.length === 1) return { title: TITLE_MAP[dominant[0][0]] || TITLE_MAP.balanced, gripKind: 'solo' };
  const key = `${dominant[0][0]}+${dominant[1][0]}`;
  return { title: TITLE_MAP[key] || TITLE_MAP[dominant[0][0]] || TITLE_MAP.balanced, gripKind: 'duo' };
}

function dominantDomainFromMastery() {
  const scores = MasteryLedger.allScores();
  let topDomain = null;
  let topScore = -1;
  for (const [domain, s] of Object.entries(scores)) {
    if (s.score > topScore) { topDomain = domain; topScore = s.score; }
  }
  return topDomain;
}

export function getSignature() {
  const prefs = SovereignPreferences.get();
  const pinned = prefs.identity?.pinnedSignature || null;
  const cal = prefs.calibration;
  const ranked = rankedMaterials(cal);
  const derived = deriveTitle(cal);
  const dominantDomain = dominantDomainFromMastery();

  const top2 = ranked.slice(0, 2).filter(([, v]) => v >= 0.6);
  const subtitle = top2.length
    ? top2.map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)} ${v.toFixed(2)}`).join(' · ') +
      (derived.gripKind === 'duo' ? ' · Dual Grip'
        : derived.gripKind === 'solo' ? ' · Solo Grip'
        : ' · Balanced')
    : 'Calibration at centre · all blades available';

  return {
    title: pinned || derived.title,
    derivedTitle: derived.title,
    subtitle,
    materials: ranked,
    dominantDomain,
    pinned: !!pinned,
  };
}

export function pinSignature(title) {
  const prefs = SovereignPreferences.get();
  const next = { ...prefs, identity: { ...(prefs.identity || {}), pinnedSignature: title } };
  try { localStorage.setItem('sovereign_preferences_v1', JSON.stringify(next)); } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sovereign:preferences', { detail: next }));
  }
}

export function unpinSignature() { pinSignature(null); }

export default { getSignature, pinSignature, unpinSignature };
