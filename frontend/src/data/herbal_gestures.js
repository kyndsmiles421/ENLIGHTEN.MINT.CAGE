/**
 * herbal_gestures.js — Knowledge-as-Substance Registry
 * ─────────────────────────────────────────────────────
 * Each entity in the unified Inlay can declare gesture-bound
 * knowledge fragments that REPLACE the abstract leaf/flame
 * icons during play. Tap a Mint leaf → instead of just "+2",
 * the leaf flips to "tear, don't cut — menthol crystals shatter
 * under blade pressure" before dissolving.
 *
 * Lookup order at runtime (ChamberMiniGame.js):
 *   1. Active entity id from ContextBus.entityState.activeEntity
 *   2. If id present in HERBAL_GESTURES → use its mode-specific list
 *   3. Else fall back to GENERIC[mode]
 *
 * Each entry is shape:
 *   { collect: [...]  pluck-mode fragments,
 *     break:   [...]  grind-mode fragments,
 *     rhythm:  [...]  dose-mode fragments,
 *     pace:    "fast" | "moderate" | "slow"   // drives game speed
 *     teach:   { collect: <topic-override>, break: …, rhythm: … } }
 *
 * Adding a new herb = one entry. No code changes elsewhere.
 */

/* Generic fallback — used for herbs without bespoke gestures yet. */
const GENERIC = {
  collect: [
    'Tear, don\u2019t cut',
    'Honor before harvest',
    'Top third only',
    'Dawn carries the oils',
    'Leave the seven',
  ],
  break: [
    'Bruise, don\u2019t pulverize',
    'Cold mortar preserves',
    'Spiral inward',
    'Stop at fragrance',
    'Clockwise releases',
  ],
  rhythm: [
    'Drop · pause · drop',
    'Build, don\u2019t flood',
    'Listen to the body',
    'Less is the law',
    'Time is the medicine',
  ],
  pace: 'moderate',
};

/* Bespoke entries. The id MUST match the canonical id in
   /api/entity/index (e.g., "peppermint" not "mint"). */
const HERBAL_GESTURES = {
  peppermint: {
    collect: [
      'Tear, don\u2019t cut \u2014 blade shatters menthol',
      'Pinch the stem just above a leaf-pair',
      'Harvest before bloom for peak oil',
      'Dawn dew amplifies the volatiles',
      'Avoid the lower wood-stem leaves',
      'Mentha spreads \u2014 take generously',
    ],
    break: [
      'Cold marble \u2014 heat kills the cool',
      'Crush only until it weeps',
      'The scent IS the dose',
      'Stop before paste',
      'Resin Threshold \u2014 listen for snap',
      'Three turns, no more',
    ],
    rhythm: [
      '2\u20133 drops in warm water',
      'Avoid with reflux',
      'Inhale before swallow',
      'Build to 5 over a week',
      'Never on empty stomach for digestion',
    ],
    pace: 'fast',
    teach: {
      collect: 'Peppermint harvest \u2014 the tear-not-cut technique and menthol preservation',
      break:   'Cold-mortar grinding of Peppermint \u2014 why heat destroys its volatile signature',
      rhythm:  'Peppermint dosing \u2014 reflux contraindications and the menthol titration window',
    },
  },
  holy_basil: {
    collect: [
      'Tulsi greets the sun \u2014 harvest at noon',
      'Bow before plucking \u2014 it is sacred',
      'Take the third leaf, not the first',
      'Five leaves equals a daily medicine',
      'The stem stays \u2014 only the tender tip',
    ],
    break: [
      'Adaptogens grind warm, not cold',
      'Bruise the leaf to release the cortisol-tamer',
      'Mortar stone clockwise \u2014 sun-direction',
      'Stop at sweet pungency',
      'Add ghee for fat-soluble eugenol',
    ],
    rhythm: [
      'Daily, morning, on rising',
      'Tea steep 5 min covered',
      'Avoid before sleep',
      '2g leaf = 1 cup',
      'Stop two weeks before surgery',
    ],
    pace: 'moderate',
    teach: {
      collect: 'Tulsi harvest ritual \u2014 noon-pluck, the sacred third leaf',
      break:   'Tulsi preparation \u2014 warm grind to release adaptogenic eugenol',
      rhythm:  'Tulsi daily protocol \u2014 morning dose, surgical contraindication',
    },
  },
  lavender: {
    collect: [
      'Snip just below the spike',
      'Morning, after the dew burns off',
      'Leave four spikes per plant',
      'Bundle by the eight, hang upside down',
      'Bees first, you second',
    ],
    break: [
      'Linalool flies fast \u2014 grind seconds, not minutes',
      'Cool stone, never warm',
      'A whisper of crush, no more',
      'The bruise IS the medicine',
    ],
    rhythm: [
      '1 drop oil = 1ml carrier',
      'Pulse points, never broken skin',
      'Avoid in early pregnancy',
      'Sleep, not slumber',
    ],
    pace: 'slow',
    teach: {
      collect: 'Lavender harvest \u2014 morning-dew timing and the four-spike rule',
      break:   'Lavender grinding \u2014 protecting linalool from heat and time',
      rhythm:  'Lavender dosing \u2014 carrier ratios and pregnancy caution',
    },
  },
  reishi: {
    collect: [
      'Cut at the fruiting body, not the wood',
      'Autumn brings the medicine',
      'Leave older brackets to spore',
      'Never harvest from city trees',
      'The spore-print confirms the species',
    ],
    break: [
      'Reishi requires double-decoction',
      'First grind dry \u2014 then water-extract',
      'Hours, not minutes',
      'Triterpenes love alcohol; polysaccharides love water',
      'Bitter is the tell',
    ],
    rhythm: [
      'Cycled \u2014 6 weeks on, 1 week off',
      'Evening, with food',
      'Avoid with anticoagulants',
      'Builds slowly \u2014 90 days to feel',
    ],
    pace: 'slow',
    teach: {
      collect: 'Reishi wildcrafting \u2014 fruiting-body cuts and the spore-print verification',
      break:   'Reishi double-decoction \u2014 alcohol vs. water extracts for triterpene/polysaccharide split',
      rhythm:  'Reishi protocol \u2014 cycled dosing and anticoagulant interaction',
    },
  },
  chamomile: {
    collect: [
      'Pluck only fully open flowers',
      'Pinch the head, not the stem',
      'Daily harvest in peak season',
      'Yellow center down = past prime',
    ],
    break: [
      'Whole flower, lightly bruised',
      'Heat ruins the apigenin',
      'Tea, not tincture for sleep',
    ],
    rhythm: [
      '1 tsp dried = 1 cup',
      '5\u201310 min covered',
      'Allergy check: ragweed family',
      '3 cups daily ceiling',
    ],
    pace: 'moderate',
    teach: {
      collect: 'Chamomile harvest \u2014 reading flower maturity for full apigenin yield',
      break:   'Chamomile preparation \u2014 why heat destroys the calming compound',
      rhythm:  'Chamomile dosing \u2014 ragweed cross-allergy and daily ceilings',
    },
  },
  ashwagandha: {
    collect: [
      'Roots, not leaves \u2014 dig in autumn',
      'Two-year plant minimum',
      'Wash at source, never store wet',
      'The bigger root carries deeper memory',
    ],
    break: [
      'Powder, not paste',
      'Warm milk activates the ghrita-bound compounds',
      'Long grind \u2014 the slower the better',
    ],
    rhythm: [
      '3\u20136g daily, with food',
      'Never empty stomach',
      'Avoid with thyroid medication without guidance',
      'Withaferin builds over weeks',
    ],
    pace: 'slow',
    teach: {
      collect: 'Ashwagandha harvest \u2014 autumn root-digging and the two-year rule',
      break:   'Ashwagandha preparation \u2014 milk-decoction and ghrita activation',
      rhythm:  'Ashwagandha protocol \u2014 thyroid interaction and weeks-long onset',
    },
  },
  ginger: {
    collect: [
      'Rhizomes, not roots \u2014 break, don\u2019t pull',
      'Spring harvest = mild, autumn = fierce',
      'Save a finger to replant',
      'Skin off only when fresh',
    ],
    break: [
      'Cross-grain mince releases gingerol',
      'Cooking shifts gingerol to shogaol \u2014 different medicine',
      'Stop at fragrance, not fiber',
    ],
    rhythm: [
      '2g fresh = effective',
      'Avoid with blood-thinners',
      'Morning sickness: small, frequent',
    ],
    pace: 'fast',
    teach: {
      collect: 'Ginger rhizome harvest \u2014 break-don\u2019t-pull and the finger-replant rule',
      break:   'Ginger preparation \u2014 cross-grain mince and the gingerol-to-shogaol cooking shift',
      rhythm:  'Ginger dosing \u2014 anticoagulant caution and morning-sickness microdosing',
    },
  },
};

/**
 * fragmentsFor(entityId, mode) → list[string]
 * Returns the gesture-fragment list for the active herb +
 * mini-game mode. Falls back to GENERIC.
 */
export function fragmentsFor(entityId, mode) {
  const node = entityId ? HERBAL_GESTURES[entityId] : null;
  const list = node?.[mode] || GENERIC[mode] || GENERIC.collect;
  return list;
}

/**
 * paceFor(entityId) → "fast" | "moderate" | "slow"
 * Drives the game's drift/spawn timing so each herb feels
 * mechanically distinct (Mint snaps; Reishi lingers).
 */
export function paceFor(entityId) {
  const node = entityId ? HERBAL_GESTURES[entityId] : null;
  return node?.pace || GENERIC.pace;
}

/**
 * teachOverrideFor(entityId, mode) → topic string or null
 * Replaces the static teach.topic in Herbology.js with an
 * herb-specific lesson when the user has an entity active.
 */
export function teachOverrideFor(entityId, mode) {
  const node = entityId ? HERBAL_GESTURES[entityId] : null;
  return node?.teach?.[mode] || null;
}

export const HERBS_WITH_GESTURES = Object.keys(HERBAL_GESTURES);
