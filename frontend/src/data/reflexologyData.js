/**
 * Reflexology Atlas — 32 foot reflex zones.
 *
 * Coordinates are in percent (0–100) within a 140×360px foot SVG where
 * (0,0) is the top-left of the foot silhouette. Left and Right feet share
 * most coordinates; zones with `sideOnly` fire on one foot only (heart is
 * left-foot-only, liver + gallbladder + ileocecal are right-foot-only).
 *
 * `solfeggio` pairs each zone to the Solfeggio frequency that resonates
 * most closely with the organ-system it maps to (convention drawn from
 * Ingham/Marquardt charts crossed with Solfeggio frequency therapy work).
 *
 * All content is educational — not medical advice. The app never promises
 * healing, only practice.
 */

export const ELEMENT_COLOR = {
  fire:  '#EF4444',
  water: '#3B82F6',
  wood:  '#22C55E',
  metal: '#94A3B8',
  earth: '#F59E0B',
  light: '#F4D58D',
};

export const FOOT_ZONES = [
  // ── Head & Brain (big toe = the head) ──
  {
    id: 'brain', name: 'Brain', system: 'nervous', organ: 'Cerebrum',
    side: 'both', x: 46, y: 6, r: 7, sideOnly: null,
    element: 'light', solfeggio: 963,
    technique: 'Tiny rotations on the fleshy pad of the big toe.',
    duration: 60,
    benefits: ['Mental clarity', 'Focus', 'Headache relief'],
  },
  {
    id: 'pituitary', name: 'Pituitary', system: 'endocrine', organ: 'Pituitary gland',
    side: 'both', x: 46, y: 14, r: 5,
    element: 'light', solfeggio: 852,
    technique: 'Pinpoint press — center of the big toe pad.',
    duration: 30,
    benefits: ['Hormone balance', 'Master gland activation'],
  },
  {
    id: 'pineal', name: 'Pineal', system: 'endocrine', organ: 'Pineal gland',
    side: 'both', x: 52, y: 12, r: 4,
    element: 'light', solfeggio: 963,
    technique: 'Gentle press — upper-outer edge of the big toe.',
    duration: 30,
    benefits: ['Circadian rhythm', 'Dream recall', 'Third-eye clarity'],
  },
  {
    id: 'sinus', name: 'Sinuses', system: 'respiratory', organ: 'Sinus cavities',
    side: 'both', x: 38, y: 18, r: 4,
    element: 'metal', solfeggio: 741,
    technique: 'Thumb-walk the underside of all toes — left to right.',
    duration: 60,
    benefits: ['Sinus pressure relief', 'Allergy support', 'Breath clarity'],
  },
  {
    id: 'eye', name: 'Eyes', system: 'sensory', organ: 'Ocular',
    side: 'both', x: 34, y: 24, r: 4,
    element: 'wood', solfeggio: 417,
    technique: 'Press-and-hold at the base of toes 2 & 3 (plantar side).',
    duration: 45,
    benefits: ['Visual fatigue relief', 'Dry-eye support'],
  },
  {
    id: 'ear', name: 'Ears', system: 'sensory', organ: 'Auditory',
    side: 'both', x: 60, y: 24, r: 4,
    element: 'water', solfeggio: 852,
    technique: 'Press-and-hold at the base of toes 4 & 5 (plantar side).',
    duration: 45,
    benefits: ['Tinnitus ease', 'Inner-ear balance'],
  },
  // ── Neck / Throat ──
  {
    id: 'neck', name: 'Neck', system: 'structural', organ: 'Cervical spine',
    side: 'both', x: 46, y: 22, r: 5,
    element: 'metal', solfeggio: 741,
    technique: 'Gentle rotations at the base of the big toe, both sides.',
    duration: 30,
    benefits: ['Neck tension release', 'Posture reset'],
  },
  {
    id: 'thyroid', name: 'Thyroid', system: 'endocrine', organ: 'Thyroid gland',
    side: 'both', x: 30, y: 28, r: 5,
    element: 'metal', solfeggio: 741,
    technique: 'Thumb-walk the ball of the foot — medial quadrant.',
    duration: 45,
    benefits: ['Metabolic balance', 'Energy regulation', 'Voice clarity'],
  },

  // ── Chest / Lungs / Heart ──
  {
    id: 'lung', name: 'Lungs', system: 'respiratory', organ: 'Pulmonary',
    side: 'both', x: 46, y: 32, r: 9,
    element: 'metal', solfeggio: 528,
    technique: 'Thumb-walk across the ball of the foot, side to side.',
    duration: 90,
    benefits: ['Breath depth', 'Grief release', 'Oxygen uptake'],
  },
  {
    id: 'heart', name: 'Heart', system: 'cardiovascular', organ: 'Heart',
    side: 'left', sideOnly: 'left', x: 40, y: 34, r: 6,
    element: 'fire', solfeggio: 639,
    technique: 'Sustained tender press — left foot only, ball, inner-medial.',
    duration: 60,
    benefits: ['Emotional release', 'HRV coherence', 'Circulation'],
  },
  {
    id: 'diaphragm', name: 'Diaphragm', system: 'respiratory', organ: 'Diaphragm',
    side: 'both', x: 46, y: 40, r: 7,
    element: 'metal', solfeggio: 528,
    technique: 'Slow horizontal thumb-walk along the ridge below the ball.',
    duration: 45,
    benefits: ['Breath expansion', 'Tension release'],
  },

  // ── Upper abdomen / Digestion ──
  {
    id: 'solar-plexus', name: 'Solar Plexus', system: 'nervous', organ: 'Celiac plexus',
    side: 'both', x: 46, y: 44, r: 5,
    element: 'fire', solfeggio: 528,
    technique: 'Deep, slow press — center of the foot just below the ball.',
    duration: 90,
    benefits: ['Anxiety calm', 'Nervous system reset', 'Grounding'],
  },
  {
    id: 'stomach', name: 'Stomach', system: 'digestive', organ: 'Stomach',
    side: 'both', x: 38, y: 46, r: 6,
    element: 'earth', solfeggio: 417,
    technique: 'Circular thumb kneading — upper arch, medial.',
    duration: 60,
    benefits: ['Digestive ease', 'Nausea relief'],
  },
  {
    id: 'pancreas', name: 'Pancreas', system: 'endocrine', organ: 'Pancreas',
    side: 'both', x: 44, y: 50, r: 5,
    element: 'earth', solfeggio: 417,
    technique: 'Thumb-press — upper arch, slightly medial.',
    duration: 45,
    benefits: ['Blood-sugar balance', 'Sweet-craving ease'],
  },
  {
    id: 'liver', name: 'Liver', system: 'digestive', organ: 'Liver',
    side: 'right', sideOnly: 'right', x: 62, y: 46, r: 8,
    element: 'wood', solfeggio: 396,
    technique: 'Thumb-walk the entire upper lateral arch — right foot only.',
    duration: 60,
    benefits: ['Detox support', 'Anger release', 'Hormonal clearing'],
  },
  {
    id: 'gallbladder', name: 'Gallbladder', system: 'digestive', organ: 'Gallbladder',
    side: 'right', sideOnly: 'right', x: 58, y: 50, r: 4,
    element: 'wood', solfeggio: 396,
    technique: 'Small circles — right foot, mid-lateral arch.',
    duration: 30,
    benefits: ['Bile flow', 'Fat digestion', 'Decision-making clarity'],
  },

  // ── Lower abdomen / Elimination ──
  {
    id: 'adrenal', name: 'Adrenals', system: 'endocrine', organ: 'Adrenal glands',
    side: 'both', x: 44, y: 54, r: 4,
    element: 'water', solfeggio: 417,
    technique: 'Pin-point press — above the kidney zone, mid-arch.',
    duration: 45,
    benefits: ['Stress recovery', 'Fatigue lift', 'Cortisol regulation'],
  },
  {
    id: 'kidney', name: 'Kidneys', system: 'urinary', organ: 'Kidneys',
    side: 'both', x: 44, y: 58, r: 5,
    element: 'water', solfeggio: 396,
    technique: 'Slow press-and-hold — center arch, both feet.',
    duration: 60,
    benefits: ['Fluid balance', 'Fear release', 'Lower-back ease'],
  },
  {
    id: 'transverse-colon', name: 'Transverse Colon', system: 'digestive', organ: 'Transverse colon',
    side: 'both', x: 46, y: 62, r: 7,
    element: 'earth', solfeggio: 285,
    technique: 'Horizontal thumb-walk — mid-arch, side to side.',
    duration: 45,
    benefits: ['Regularity', 'Bloat relief'],
  },
  {
    id: 'ascending-colon', name: 'Ascending Colon', system: 'digestive', organ: 'Ascending colon',
    side: 'right', sideOnly: 'right', x: 62, y: 64, r: 4,
    element: 'earth', solfeggio: 285,
    technique: 'Upward thumb-walk along the lateral arch — right foot only.',
    duration: 30,
    benefits: ['Constipation ease', 'Large-intestine flow'],
  },
  {
    id: 'descending-colon', name: 'Descending Colon', system: 'digestive', organ: 'Descending colon',
    side: 'left', sideOnly: 'left', x: 30, y: 64, r: 4,
    element: 'earth', solfeggio: 285,
    technique: 'Downward thumb-walk along the lateral arch — left foot only.',
    duration: 30,
    benefits: ['Elimination support'],
  },
  {
    id: 'small-intestine', name: 'Small Intestine', system: 'digestive', organ: 'Small intestine',
    side: 'both', x: 46, y: 70, r: 7,
    element: 'earth', solfeggio: 285,
    technique: 'Slow horizontal zig-zag across the lower arch.',
    duration: 60,
    benefits: ['Nutrient absorption', 'Gut-brain calm'],
  },
  {
    id: 'bladder', name: 'Bladder', system: 'urinary', organ: 'Bladder',
    side: 'both', x: 30, y: 76, r: 4,
    element: 'water', solfeggio: 396,
    technique: 'Gentle press — inner foot, just above the heel.',
    duration: 30,
    benefits: ['Urinary support', 'Pelvic release'],
  },

  // ── Pelvic / Reproductive ──
  {
    id: 'ovary-testis', name: 'Ovary / Testis', system: 'reproductive', organ: 'Gonads',
    side: 'both', x: 70, y: 82, r: 4,
    element: 'water', solfeggio: 639,
    technique: 'Press-and-hold — outer ankle bone.',
    duration: 45,
    benefits: ['Hormonal balance', 'Reproductive vitality'],
  },
  {
    id: 'uterus-prostate', name: 'Uterus / Prostate', system: 'reproductive', organ: 'Pelvic organ',
    side: 'both', x: 22, y: 82, r: 4,
    element: 'water', solfeggio: 639,
    technique: 'Press-and-hold — inner ankle bone.',
    duration: 45,
    benefits: ['Cycle regulation', 'Pelvic health'],
  },

  // ── Spine (runs the whole medial edge) ──
  {
    id: 'spine', name: 'Spine', system: 'structural', organ: 'Vertebral column',
    side: 'both', x: 18, y: 42, r: 4,
    element: 'metal', solfeggio: 174,
    technique: 'Long thumb-walk down the entire inner edge of the foot.',
    duration: 120,
    benefits: ['Postural alignment', 'Full-body reset'],
  },
  {
    id: 'shoulder', name: 'Shoulder', system: 'structural', organ: 'Shoulder joint',
    side: 'both', x: 82, y: 30, r: 4,
    element: 'metal', solfeggio: 174,
    technique: 'Circular press — outer edge, just below the little toe.',
    duration: 30,
    benefits: ['Upper-back ease', 'Tension dump'],
  },
  {
    id: 'hip-knee', name: 'Hip & Knee', system: 'structural', organ: 'Hip / Knee',
    side: 'both', x: 82, y: 68, r: 5,
    element: 'wood', solfeggio: 174,
    technique: 'Kneading circles — outer lateral edge, lower third.',
    duration: 45,
    benefits: ['Joint lubrication', 'Gait reset'],
  },
  {
    id: 'sciatic', name: 'Sciatic Nerve', system: 'nervous', organ: 'Sciatic',
    side: 'both', x: 46, y: 90, r: 6,
    element: 'water', solfeggio: 174,
    technique: 'Horizontal thumb-walk across the heel.',
    duration: 60,
    benefits: ['Low-back & leg pain ease'],
  },

  // ── Lymphatic / Immune ──
  {
    id: 'lymph-upper', name: 'Upper Lymphatics', system: 'immune', organ: 'Lymph nodes',
    side: 'both', x: 46, y: 28, r: 4,
    element: 'metal', solfeggio: 528,
    technique: 'Gentle stroking in the webbing between each toe.',
    duration: 45,
    benefits: ['Immune flow', 'Edema reduction'],
  },
  {
    id: 'spleen', name: 'Spleen', system: 'immune', organ: 'Spleen',
    side: 'left', sideOnly: 'left', x: 62, y: 46, r: 5,
    element: 'earth', solfeggio: 528,
    technique: 'Slow circles — left foot only, upper lateral arch.',
    duration: 45,
    benefits: ['Immune support', 'Over-thinking release'],
  },
  {
    id: 'ileocecal', name: 'Ileocecal Valve', system: 'digestive', organ: 'Ileocecal',
    side: 'right', sideOnly: 'right', x: 70, y: 72, r: 3,
    element: 'earth', solfeggio: 285,
    technique: 'Pin-point press — right foot, lower lateral arch.',
    duration: 20,
    benefits: ['Digestive gate reset', 'Bloating ease'],
  },
];

/** A curated "starter routine" — 8 zones in order, ~8 min total. */
export const STARTER_ROUTINE = [
  'solar-plexus',
  'diaphragm',
  'lung',
  'thyroid',
  'kidney',
  'liver',
  'adrenal',
  'spine',
];

/** All unique body systems in the atlas, for filter chips. */
export const SYSTEMS = Array.from(new Set(FOOT_ZONES.map(z => z.system))).sort();
