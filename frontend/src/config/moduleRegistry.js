/**
 * Module Registry — The Skeleton's Central Configuration
 * 
 * Every pluggable module in the system is defined here.
 * The Mixer reads this registry to render draggable bubbles.
 * To add a new "utilization", add an entry here — the skeleton handles the rest.
 * 
 * Types:
 *   frequency  — Solfeggio tone oscillator (handled by MixerContext.toggleFreq)
 *   sound      — Ambient nature loop (handled by MixerContext.toggleSound)
 *   instrument — World instrument drone (handled by MixerContext.toggleDrone)
 *   logic-gate — Computational module (future: I Ching, Fractal)
 *   engine     — Visualization engine (future: L2 Fractal, GPS Map)
 */

export const MODULE_TYPES = {
  FREQUENCY: 'frequency',
  SOUND: 'sound',
  INSTRUMENT: 'instrument',
  LOGIC_GATE: 'logic-gate',
  ENGINE: 'engine',
};

// ─── Core Frequency Modules ───
const FREQ_MODULES = [
  { id: 'freq_396', type: 'frequency', name: 'Liberation', hz: 396, color: '#EF4444', desc: 'Release fear & guilt', ring: 0 },
  { id: 'freq_417', type: 'frequency', name: 'Change', hz: 417, color: '#FB923C', desc: 'Facilitate change', ring: 0 },
  { id: 'freq_432', type: 'frequency', name: 'Calm', hz: 432, color: '#22C55E', desc: 'Natural harmony', ring: 0 },
  { id: 'freq_528', type: 'frequency', name: 'Transform', hz: 528, color: '#34D399', desc: 'DNA repair & miracles', ring: 0 },
  { id: 'freq_639', type: 'frequency', name: 'Connect', hz: 639, color: '#3B82F6', desc: 'Harmonizing relationships', ring: 0 },
  { id: 'freq_741', type: 'frequency', name: 'Intuition', hz: 741, color: '#8B5CF6', desc: 'Awakening intuition', ring: 1 },
  { id: 'freq_852', type: 'frequency', name: 'Awaken', hz: 852, color: '#C084FC', desc: 'Spiritual order', ring: 1 },
  { id: 'freq_963', type: 'frequency', name: 'Crown', hz: 963, color: '#E879F9', desc: 'Divine connection', ring: 1 },
];

// ─── Ambient Sound Modules ───
const SOUND_MODULES = [
  { id: 'sound_ocean', type: 'sound', name: 'Ocean', soundId: 'ocean', color: '#06B6D4', desc: 'Tidal waves', ring: 2 },
  { id: 'sound_rain', type: 'sound', name: 'Rain', soundId: 'rain', color: '#6366F1', desc: 'Gentle rainfall', ring: 2 },
  { id: 'sound_forest', type: 'sound', name: 'Forest', soundId: 'forest', color: '#22C55E', desc: 'Birds & leaves', ring: 2 },
  { id: 'sound_fire', type: 'sound', name: 'Fire', soundId: 'fire', color: '#F97316', desc: 'Crackling hearth', ring: 2 },
  { id: 'sound_wind', type: 'sound', name: 'Wind', soundId: 'wind', color: '#94A3B8', desc: 'Howling breeze', ring: 2 },
  { id: 'sound_bowl', type: 'sound', name: 'Bowls', soundId: 'singing-bowl', color: '#EAB308', desc: 'Tibetan singing', ring: 2 },
];

// ─── Instrument Drone Modules ───
const INSTRUMENT_MODULES = [
  { id: 'inst_tanpura', type: 'instrument', name: 'Tanpura', droneId: 'tanpura-drone', color: '#F59E0B', desc: 'Indian drone', ring: 3 },
  { id: 'inst_flute', type: 'instrument', name: 'Flute', droneId: 'flute-drone', color: '#2DD4BF', desc: 'Bansuri whisper', ring: 3 },
  { id: 'inst_bowl', type: 'instrument', name: 'Singing Bowl', droneId: 'bowl-drone', color: '#EAB308', desc: 'Himalayan resonance', ring: 3 },
  { id: 'inst_harp', type: 'instrument', name: 'Harp', droneId: 'harp-drone', color: '#A78BFA', desc: 'Celestial strings', ring: 3 },
];

// ─── Future Logic Gate Modules (Skeleton-ready) ───
const LOGIC_MODULES = [
  { id: 'ICHING_01', type: 'logic-gate', name: 'I Ching', color: '#FBBF24', desc: 'Hexagram oracle', ring: 4, locked: true },
  { id: 'FRACTAL_L2', type: 'engine', name: 'Fractal L²', color: '#C084FC', desc: 'Infinite depth', ring: 4, locked: true },
  { id: 'GPS_MAP', type: 'engine', name: 'Cosmic Map', color: '#2DD4BF', desc: 'Geospatial sacred', ring: 4, locked: true },
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
