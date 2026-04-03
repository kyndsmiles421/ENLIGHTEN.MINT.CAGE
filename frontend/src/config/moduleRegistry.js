/**
 * Module Registry 3.0 — Universal Synthesis Interface
 * 
 * Every pluggable module is tagged with Affinities for cross-widget synthesis.
 * The Mixer reads this registry to render draggable bubbles.
 * When two modules with matching affinities collide, they "Magnetize" (Synergy).
 * 
 * Types:
 *   frequency  — Solfeggio tone oscillator
 *   sound      — Ambient nature loop
 *   instrument — World instrument drone
 *   logic-gate — Computational module (I Ching, etc.)
 *   engine     — Visualization engine (Fractal, GPS Map)
 *
 * Affinities: audio, spiritual, healing, nature, grounding, awakening,
 *             creative, geometric, spatial, non-linear, elemental, cosmic
 *
 * Tier Access:
 *   0 = Foundation (free): 528Hz + base sounds
 *   1 = Civilization: Full frequency set + instruments + synthesis
 *   2 = Sovereignty: Engines + marketplace selling rights
 */

export const MODULE_TYPES = {
  FREQUENCY: 'frequency',
  SOUND: 'sound',
  INSTRUMENT: 'instrument',
  LOGIC_GATE: 'logic-gate',
  ENGINE: 'engine',
};

export const AFFINITIES = {
  AUDIO: 'audio',
  SPIRITUAL: 'spiritual',
  HEALING: 'healing',
  NATURE: 'nature',
  GROUNDING: 'grounding',
  AWAKENING: 'awakening',
  CREATIVE: 'creative',
  GEOMETRIC: 'geometric',
  SPATIAL: 'spatial',
  NON_LINEAR: 'non-linear',
  ELEMENTAL: 'elemental',
  COSMIC: 'cosmic',
};

// ─── Core Frequency Modules ───
const FREQ_MODULES = [
  { id: 'freq_396', type: 'frequency', name: 'Liberation', hz: 396, color: '#EF4444', desc: 'Release fear & guilt', ring: 0, tier: 1, affinities: ['audio', 'grounding', 'healing'], weight: 'light' },
  { id: 'freq_417', type: 'frequency', name: 'Change', hz: 417, color: '#FB923C', desc: 'Facilitate change', ring: 0, tier: 1, affinities: ['audio', 'creative', 'non-linear'], weight: 'light' },
  { id: 'freq_432', type: 'frequency', name: 'Calm', hz: 432, color: '#22C55E', desc: 'Natural harmony', ring: 0, tier: 1, affinities: ['audio', 'nature', 'healing', 'grounding'], weight: 'light' },
  { id: 'freq_528', type: 'frequency', name: 'Transform', hz: 528, color: '#34D399', desc: 'DNA repair & miracles', ring: 0, tier: 0, affinities: ['audio', 'healing', 'spiritual', 'cosmic'], weight: 'light' },
  { id: 'freq_639', type: 'frequency', name: 'Connect', hz: 639, color: '#3B82F6', desc: 'Harmonizing relationships', ring: 0, tier: 1, affinities: ['audio', 'spiritual', 'healing'], weight: 'light' },
  { id: 'freq_741', type: 'frequency', name: 'Intuition', hz: 741, color: '#8B5CF6', desc: 'Awakening intuition', ring: 1, tier: 1, affinities: ['audio', 'awakening', 'non-linear', 'creative'], weight: 'light' },
  { id: 'freq_852', type: 'frequency', name: 'Awaken', hz: 852, color: '#C084FC', desc: 'Spiritual order', ring: 1, tier: 1, affinities: ['audio', 'awakening', 'spiritual', 'cosmic'], weight: 'light' },
  { id: 'freq_963', type: 'frequency', name: 'Crown', hz: 963, color: '#E879F9', desc: 'Divine connection', ring: 1, tier: 1, affinities: ['audio', 'cosmic', 'spiritual', 'awakening'], weight: 'light' },
];

// ─── Ambient Sound Modules ───
const SOUND_MODULES = [
  { id: 'sound_ocean', type: 'sound', name: 'Ocean', soundId: 'ocean', color: '#06B6D4', desc: 'Tidal waves', ring: 2, tier: 0, affinities: ['audio', 'nature', 'elemental', 'grounding'], weight: 'medium' },
  { id: 'sound_rain', type: 'sound', name: 'Rain', soundId: 'rain', color: '#6366F1', desc: 'Gentle rainfall', ring: 2, tier: 0, affinities: ['audio', 'nature', 'elemental', 'healing'], weight: 'medium' },
  { id: 'sound_forest', type: 'sound', name: 'Forest', soundId: 'forest', color: '#22C55E', desc: 'Birds & leaves', ring: 2, tier: 1, affinities: ['audio', 'nature', 'grounding', 'spatial'], weight: 'medium' },
  { id: 'sound_fire', type: 'sound', name: 'Fire', soundId: 'fire', color: '#F97316', desc: 'Crackling hearth', ring: 2, tier: 1, affinities: ['audio', 'elemental', 'grounding', 'creative'], weight: 'medium' },
  { id: 'sound_wind', type: 'sound', name: 'Wind', soundId: 'wind', color: '#94A3B8', desc: 'Howling breeze', ring: 2, tier: 1, affinities: ['audio', 'nature', 'elemental', 'spatial'], weight: 'medium' },
  { id: 'sound_bowl', type: 'sound', name: 'Bowls', soundId: 'singing-bowl', color: '#EAB308', desc: 'Tibetan singing', ring: 2, tier: 1, affinities: ['audio', 'spiritual', 'healing', 'awakening'], weight: 'medium' },
];

// ─── Instrument Drone Modules ───
const INSTRUMENT_MODULES = [
  { id: 'inst_tanpura', type: 'instrument', name: 'Tanpura', droneId: 'tanpura-drone', color: '#F59E0B', desc: 'Indian drone', ring: 3, tier: 1, affinities: ['audio', 'spiritual', 'grounding', 'non-linear'], weight: 'heavy' },
  { id: 'inst_flute', type: 'instrument', name: 'Flute', droneId: 'flute-drone', color: '#2DD4BF', desc: 'Bansuri whisper', ring: 3, tier: 1, affinities: ['audio', 'nature', 'healing', 'creative'], weight: 'heavy' },
  { id: 'inst_bowl', type: 'instrument', name: 'Singing Bowl', droneId: 'bowl-drone', color: '#EAB308', desc: 'Himalayan resonance', ring: 3, tier: 1, affinities: ['audio', 'spiritual', 'healing', 'cosmic'], weight: 'heavy' },
  { id: 'inst_harp', type: 'instrument', name: 'Harp', droneId: 'harp-drone', color: '#A78BFA', desc: 'Celestial strings', ring: 3, tier: 1, affinities: ['audio', 'cosmic', 'creative', 'awakening'], weight: 'heavy' },
];

// ─── Future Logic Gate & Engine Modules ───
const LOGIC_MODULES = [
  { id: 'ICHING_01', type: 'logic-gate', name: 'I Ching', color: '#FBBF24', desc: 'Hexagram oracle', ring: 4, tier: 2, locked: true, affinities: ['non-linear', 'spiritual', 'geometric', 'cosmic'], weight: 'heavy' },
  { id: 'FRACTAL_L2', type: 'engine', name: 'Fractal L\u00B2', color: '#C084FC', desc: 'Infinite depth', ring: 4, tier: 2, locked: true, affinities: ['geometric', 'cosmic', 'creative', 'non-linear'], weight: 'heavy' },
  { id: 'GPS_MAP', type: 'engine', name: 'Cosmic Map', color: '#2DD4BF', desc: 'Geospatial sacred', ring: 4, tier: 2, locked: true, affinities: ['spatial', 'nature', 'grounding', 'elemental'], weight: 'heavy' },
];

// ─── Combined Registry ───
export const moduleRegistry = Object.fromEntries(
  [...FREQ_MODULES, ...SOUND_MODULES, ...INSTRUMENT_MODULES, ...LOGIC_MODULES].map(m => [m.id, m])
);

// Grouped for UI rendering
export const MODULE_GROUPS = [
  { id: 'frequencies', label: 'Solfeggio', color: '#C084FC', modules: FREQ_MODULES },
  { id: 'sounds', label: 'Ambient', color: '#3B82F6', modules: SOUND_MODULES },
  { id: 'instruments', label: 'Instruments', color: '#F59E0B', modules: INSTRUMENT_MODULES },
  { id: 'engines', label: 'Engines', color: '#94A3B8', modules: LOGIC_MODULES },
];

// Get all unlocked modules for the mixer
export function getActiveModules() {
  return Object.values(moduleRegistry).filter(m => !m.locked);
}

// Get module by ID
export function getModuleById(id) {
  return moduleRegistry[id] || null;
}

// Get modules available at a given tier level
export function getModulesForTier(tier) {
  return Object.values(moduleRegistry).filter(m => (m.tier ?? 0) <= tier && !m.locked);
}

// ─── Synergy Engine ───

/**
 * Check if two modules have synergy (shared affinities).
 * Returns the shared affinities and a synergy score (0-1).
 */
export function checkSynergy(modA, modB) {
  if (!modA?.affinities || !modB?.affinities) return { synergy: false, shared: [], score: 0 };
  const setA = new Set(modA.affinities);
  const shared = modB.affinities.filter(a => setA.has(a));
  const totalUnique = new Set([...modA.affinities, ...modB.affinities]).size;
  const score = totalUnique > 0 ? shared.length / totalUnique : 0;
  return {
    synergy: shared.length >= 2,
    shared,
    score: Math.round(score * 100) / 100,
  };
}

/**
 * Get the best synergy partner for a module from a list of candidates.
 */
export function getBestSynergy(mod, candidates) {
  let best = null;
  let bestScore = 0;
  for (const c of candidates) {
    if (c.id === mod.id) continue;
    const result = checkSynergy(mod, c);
    if (result.score > bestScore) {
      bestScore = result.score;
      best = { module: c, ...result };
    }
  }
  return best;
}

/**
 * Generate a synthesis name from two synergized modules.
 */
export function getSynthesisName(modA, modB) {
  const { shared } = checkSynergy(modA, modB);
  const primary = shared[0] || 'cosmic';
  const SYNTHESIS_NAMES = {
    'audio+spiritual': 'Sacred Resonance',
    'audio+healing': 'Healing Frequency',
    'audio+nature': 'Nature Harmony',
    'audio+cosmic': 'Celestial Chord',
    'audio+creative': 'Creative Pulse',
    'spiritual+cosmic': 'Divine Connection',
    'spiritual+healing': 'Soul Mending',
    'nature+grounding': 'Earth Anchor',
    'nature+elemental': 'Elemental Flow',
    'geometric+cosmic': 'Sacred Geometry',
    'geometric+non-linear': 'Fractal Logic',
    'spatial+nature': 'Terrain Resonance',
    'awakening+cosmic': 'Ascension Wave',
  };
  const key1 = shared.length >= 2 ? `${shared[0]}+${shared[1]}` : primary;
  const key2 = shared.length >= 2 ? `${shared[1]}+${shared[0]}` : '';
  return SYNTHESIS_NAMES[key1] || SYNTHESIS_NAMES[key2] || `${modA.name} \u00D7 ${modB.name}`;
}
