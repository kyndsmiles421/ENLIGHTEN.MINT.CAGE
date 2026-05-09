/**
 * ConsoleConstants.js — Sacred Constants & Data for the Sovereign Mixer
 * Extracted from UnifiedCreatorConsole.js for cleaner architecture.
 */

// ═══ SACRED CONSTANTS — φ³ MATH ENGINE ═══
export const PHI = 1.618033988749895;
export const PHI_CUBED = 4.236067977499790;
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function calculateDustAccrual(tick) {
  return PHI_CUBED * (1 - Math.exp(-0.01 * tick));
}

export function inverseMultiplier(pool) {
  return Math.pow(PHI, -1 / (pool + 1));
}

export const DEFAULT_FILTERS = { blur: 0, brightness: 100, contrast: 100, hueRotate: 0, saturate: 100, sepia: 0, invert: 0 };

export const PILLARS = [
  { key: 'practice', title: 'PRA', full: 'Practice', color: '#D8B4FE', modules: [
    { id: 'breathwork', label: 'Breath', route: '/breathing' }, { id: 'meditation', label: 'Medit', route: '/meditation' },
    { id: 'yoga', label: 'Yoga', route: '/yoga' }, { id: 'mudras', label: 'Mudra', route: '/mudras' },
    { id: 'mantras', label: 'Mantra', route: '/mantras' }, { id: 'light', label: 'Light Resonance', route: '/light-therapy' },
    { id: 'affirm', label: 'Affirm', route: '/affirmations' }, { id: 'ritual', label: 'Ritual', route: '/daily-ritual' },
    { id: 'mood', label: 'Mood', route: '/mood' },
  ]},
  { key: 'divination', title: 'DIV', full: 'Divination', color: '#E879F9', modules: [
    { id: 'oracle', label: 'Oracle', route: '/oracle' }, { id: 'akashic', label: 'Akashic', route: '/akashic-records' },
    { id: 'stars', label: 'Stars', route: '/star-chart' }, { id: 'numbers', label: 'Numer', route: '/numerology' },
    { id: 'dreams', label: 'Dreams', route: '/dreams' }, { id: 'mayan', label: 'Mayan', route: '/mayan' },
    { id: 'calendar', label: 'Calend', route: '/cosmic-calendar' }, { id: 'cards', label: 'Cards', route: '/cardology' },
    { id: 'totems', label: 'Totems', route: '/animal-totems' },
  ]},
  { key: 'sanctuary', title: 'SAN', full: 'Sanctuary', color: '#2DD4BF', modules: [
    { id: 'journal', label: 'Journ', route: '/journal' }, { id: 'sanctuary', label: 'Sancty', route: '/sanctuary' },
    { id: 'herbs', label: 'Herbs', route: '/herbology' }, { id: 'crystals', label: 'Crystl', route: '/crystals' },
  { id: 'aroma', label: 'Aromatic', route: '/aromatherapy' }, { id: 'elixirs', label: 'Elixir', route: '/elixirs' },
    { id: 'zen', label: 'Zen', route: '/zen-garden' }, { id: 'sounds', label: 'Sound', route: '/soundscapes' },
    { id: 'nourish', label: 'Noursh', route: '/nourishment' },
  ]},
  { key: 'body', title: 'BOD', full: 'Body', color: '#FB923C', modules: [
    { id: 'exercises', label: 'Exerc', route: '/exercises' }, { id: 'reiki', label: 'Reiki', route: '/reiki' },
    { id: 'acupressure', label: 'Acu', route: '/acupressure' }, { id: 'tantra', label: 'Tantra', route: '/tantra' },
    { id: 'meals', label: 'Meals', route: '/meals' }, { id: 'hoopono', label: 'Hoopo', route: '/hooponopono' },
    { id: 'yantra', label: 'Yantra', route: '/yantra' },
  ]},
  { key: 'wisdom', title: 'WIS', full: 'Wisdom', color: '#FBBF24', modules: [
    { id: 'sacred', label: 'Sacred', route: '/sacred-texts' }, { id: 'codex', label: 'Codex', route: '/codex' },
    { id: 'teachings', label: 'Teach', route: '/teachings' }, { id: 'learn', label: 'Learn', route: '/learn' },
    { id: 'blessings', label: 'Bless', route: '/blessings' }, { id: 'bible', label: 'Bible', route: '/bible' },
    { id: 'creation', label: 'Create', route: '/creation-stories' }, { id: 'forgotten', label: 'Forgot', route: '/forgotten-languages' },
    { id: 'encyclopedia', label: 'Encyc', route: '/encyclopedia' },
  ]},
  { key: 'sage', title: 'SAG', full: 'Sage AI', color: '#38BDF8', modules: [
    { id: 'coach', label: 'Coach', route: '/coach' },
    { id: 'briefing', label: 'Brief', route: '/daily-briefing' }, { id: 'forecast', label: 'Forcast', route: '/forecasts' },
    { id: 'community', label: 'Commty', route: '/community' }, { id: 'live', label: 'Live', route: '/live-sessions' },
  ]},
  { key: 'cosmos', title: 'COS', full: 'Cosmos', color: '#A78BFA', modules: [
    { id: 'insights', label: 'Insght', route: '/cosmic-insights' }, { id: 'dashboard', label: 'Dash', route: '/dashboard' },
    { id: 'analytics', label: 'Analytc', route: '/analytics' }, { id: 'reports', label: 'Report', route: '/wellness-reports' },
    { id: 'timeline', label: 'Timelne', route: '/growth-timeline' }, { id: 'mastery', label: 'Mastry', route: '/mastery-path' },
    { id: 'starseed', label: 'Strsed', route: '/starseed' }, { id: 'avenues', label: 'Avenue', route: '/mastery-avenues' },
  ]},
];

export const TOTAL = PILLARS.reduce((s, p) => s + p.modules.length, 0);

export function findModule(route) {
  for (const p of PILLARS) {
    const m = p.modules.find(mod => mod.route === route);
    if (m) return { ...m, pillar: p };
  }
  return null;
}
