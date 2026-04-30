/**
 * languageRegistry.js — The Plugin Registry for Languages
 * 
 * PHASE 1: Unified Language Schema
 * Each language definition includes:
 * - Text/UI translations (standard i18n)
 * - Haptic texture profile (category-based)
 * - Phonetic synthesis parameters (Web Audio)
 * - Zero-Point flicker behavior
 * 
 * CATEGORIES:
 * - Ancient (Sanskrit, Lakota, Dakota): Crystalline, high-frequency haptics
 * - Modern (English, Spanish, Hindi): Smooth, balanced haptics
 * - Technical/Matrix (Japanese, Mandarin, Cantonese): Rapid, binary haptics
 * 
 * EXTENSIBILITY:
 * Drop a .json file in /config/languages/ and the registry auto-loads it
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HAPTIC CATEGORY DEFINITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HAPTIC_CATEGORIES = {
  ancient: {
    name: 'Ancient / Crystalline',
    description: 'Sharp, high-frequency "crystalline" haptics',
    basePattern: [5, 3, 8, 3, 5], // Short sharp bursts
    flickerMultiplier: 1.4, // More intense during flicker
    audioProfile: 'granular', // Granular noise synthesis
  },
  modern: {
    name: 'Modern / Balanced',
    description: 'Smooth, standard haptic pulses',
    basePattern: [15, 8, 15], // Balanced rhythm
    flickerMultiplier: 1.0,
    audioProfile: 'sine', // Clean sine waves
  },
  technical: {
    name: 'Technical / Binary',
    description: 'Rapid, "binary" flickering haptics',
    basePattern: [3, 2, 3, 2, 3, 2, 5], // Rapid binary
    flickerMultiplier: 1.2,
    audioProfile: 'square', // Square wave digital
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHONETIC SYNTHESIS PROFILES (Web Audio API)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PHONETIC_PROFILES = {
  // Ancient languages - Granular noise with resonant peaks
  sanskrit: {
    waveform: 'custom', // Granular synthesis
    baseFrequency: 432, // Sacred tuning
    resonantPeaks: [136.1, 272.2, 408.3], // Om harmonics
    grainDensity: 0.8, // High grain density
    attackTime: 0.02,
    releaseTime: 0.15,
    character: 'resonant_chant',
  },
  lakota: {
    waveform: 'custom',
    baseFrequency: 220, // Lower, grounded
    resonantPeaks: [110, 220, 330], // Earth-tone harmonics
    grainDensity: 0.6,
    attackTime: 0.05, // Guttural attack
    releaseTime: 0.2,
    character: 'guttural_stops', // Western dialect - more stops
  },
  dakota: {
    waveform: 'custom',
    baseFrequency: 246.94, // B3 - slightly higher
    resonantPeaks: [123.47, 246.94, 370.41],
    grainDensity: 0.5, // Smoother flow
    attackTime: 0.03,
    releaseTime: 0.25,
    character: 'flowing_vowels', // Eastern dialect - smoother
  },
  
  // Modern languages - Clean sine waves with natural envelope
  english: {
    waveform: 'sine',
    baseFrequency: 261.63, // C4
    resonantPeaks: null,
    grainDensity: 0,
    attackTime: 0.01,
    releaseTime: 0.1,
    character: 'balanced',
  },
  spanish: {
    waveform: 'sine',
    baseFrequency: 293.66, // D4 - slightly brighter
    resonantPeaks: null,
    grainDensity: 0,
    attackTime: 0.015,
    releaseTime: 0.12,
    character: 'rhythmic_flow',
  },
  hindi: {
    waveform: 'sine',
    baseFrequency: 277.18, // C#4
    resonantPeaks: [138.59, 277.18], // Subtle harmonics
    grainDensity: 0.2,
    attackTime: 0.02,
    releaseTime: 0.15,
    character: 'nasal_resonance',
  },
  
  // Technical languages - Square/saw waves for digital feel
  japanese: {
    waveform: 'square',
    baseFrequency: 329.63, // E4 - precise
    resonantPeaks: null,
    grainDensity: 0,
    attackTime: 0.005, // Sharp attack
    releaseTime: 0.08,
    character: 'precise_staccato',
  },
  mandarin: {
    waveform: 'sawtooth',
    baseFrequency: 349.23, // F4
    resonantPeaks: [174.61, 349.23, 523.25], // Tonal harmonics
    grainDensity: 0.3,
    attackTime: 0.01,
    releaseTime: 0.2, // Tonal glides
    character: 'tonal_glide',
  },
  cantonese: {
    waveform: 'sawtooth',
    baseFrequency: 369.99, // F#4 - slightly higher for 9 tones
    resonantPeaks: [184.99, 369.99, 554.37],
    grainDensity: 0.35,
    attackTime: 0.008,
    releaseTime: 0.18,
    character: 'tonal_complex', // More tonal complexity
  },

  // V68.85 — Lyrical / Sister-language profiles
  urdu: {
    // Sister to Hindi (same Hindustani spoken root) but lyrical /
    // poetic register. Slightly softer attack + longer release than
    // Hindi to honor the Nastaliq-script flow.
    waveform: 'sine',
    baseFrequency: 277.18, // C#4 - matches Hindi base (shared spoken root)
    resonantPeaks: [138.59, 207.65, 277.18, 369.99], // 4-peak harmonic stack
    grainDensity: 0.15, // softer grain than Hindi (0.2)
    attackTime: 0.035, // longer, softer entry — lyrical
    releaseTime: 0.28, // longer release — poetic flow
    character: 'lyrical_flow',
  },
  hawaiian: {
    // V68.84 cross-link — ʻŌlelo Hawaiʻi resonance profile so the
    // phonetic synthesizer can sing in Hawaiian when the Aloha-flow
    // language is selected. C5 resonance (Aloha-bright).
    waveform: 'sine',
    baseFrequency: 261.63, // C4 — open, breath-of-life
    resonantPeaks: [130.81, 261.63, 392.0],
    grainDensity: 0.1,
    attackTime: 0.04,
    releaseTime: 0.32,
    character: 'aloha_breath',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UNIFIED LANGUAGE DEFINITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const LANGUAGE_REGISTRY = {
  // ═══════════════════════════════════════════════════════════════════
  // ANCIENT LANGUAGES (Category: Crystalline)
  // ═══════════════════════════════════════════════════════════════════
  sa: {
    code: 'sa',
    label: 'Sanskrit',
    native: 'संस्कृतम्',
    flag: 'SA',
    category: 'ancient',
    phonetic: 'sanskrit',
    direction: 'ltr',
    characterDensity: 0.7,
    
    // Haptic profile - Sharp, crystalline
    haptics: {
      tap: [8, 3, 8],
      flick: [5, 3, 8, 3, 5, 3, 10],
      supernova: [10, 5, 15, 5, 10, 5, 20],
      collapse: [20, 8, 25, 8, 30],
      lineToggle: [5, 3, 5],
      zeroPointBurst: [3, 2, 5, 2, 3], // Flicker sync pattern
    },
    
    // Zero-Point behavior
    zeroPoint: {
      weight: 1.2, // Appears more often in rotation
      flickerGlyph: 'ॐ', // Om symbol during rapid flicker
      glitchIntensity: 0.8,
    },
    
    // Sample translation keys
    translations: {
      'common.peace': 'शान्तिः',
      'common.harmony': 'सामञ्जस्यम्',
      'flicker.greeting': 'नमस्ते',
    },
  },
  
  lkt: {
    code: 'lkt',
    label: 'Lakota',
    native: 'Lakȟótiyapi',
    flag: 'LKT',
    category: 'ancient',
    phonetic: 'lakota',
    direction: 'ltr',
    characterDensity: 1.1,
    dialect: 'western', // Teton Sioux
    
    haptics: {
      tap: [12, 5, 12], // Heavier, guttural
      flick: [8, 4, 10, 4, 8, 4, 15],
      supernova: [15, 6, 20, 6, 15, 6, 30],
      collapse: [30, 10, 35, 10, 40],
      lineToggle: [8, 4, 8],
      zeroPointBurst: [5, 3, 8, 3, 5],
    },
    
    zeroPoint: {
      weight: 1.0,
      flickerGlyph: '◈', // Medicine wheel symbol
      glitchIntensity: 0.7,
    },
    
    translations: {
      'common.peace': 'Wólaȟotaŋ',
      'common.harmony': 'Wóuŋčiye',
      'flicker.greeting': 'Háu',
    },
  },
  
  dak: {
    code: 'dak',
    label: 'Dakota',
    native: 'Dakȟótiyapi',
    flag: 'DAK',
    category: 'ancient',
    phonetic: 'dakota',
    direction: 'ltr',
    characterDensity: 1.05,
    dialect: 'eastern', // Santee-Sisseton
    
    haptics: {
      tap: [10, 6, 10], // Smoother than Lakota
      flick: [6, 4, 8, 4, 6, 4, 12],
      supernova: [12, 5, 16, 5, 12, 5, 25],
      collapse: [25, 8, 30, 8, 35],
      lineToggle: [6, 4, 6],
      zeroPointBurst: [4, 3, 6, 3, 4],
    },
    
    zeroPoint: {
      weight: 0.8,
      flickerGlyph: '◇', // Diamond (gentler symbol)
      glitchIntensity: 0.6,
    },
    
    translations: {
      'common.peace': 'Wóokiye',
      'common.harmony': 'Okíciyapi',
      'flicker.greeting': 'Hau Kodá',
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════
  // MODERN LANGUAGES (Category: Balanced)
  // ═══════════════════════════════════════════════════════════════════
  en: {
    code: 'en',
    label: 'English',
    native: 'English',
    flag: 'EN',
    category: 'modern',
    phonetic: 'english',
    direction: 'ltr',
    characterDensity: 1.0,
    
    haptics: {
      tap: [15],
      flick: [20, 10, 20],
      supernova: [50, 30, 50, 30, 100],
      collapse: [100, 50, 100],
      lineToggle: [10],
      zeroPointBurst: [10, 8, 12],
    },
    
    zeroPoint: {
      weight: 1.0,
      flickerGlyph: '∞',
      glitchIntensity: 0.5,
    },
    
    translations: {
      'common.peace': 'Peace',
      'common.harmony': 'Harmony',
      'flicker.greeting': 'Hello',
    },
  },
  
  es: {
    code: 'es',
    label: 'Spanish',
    native: 'Español',
    flag: 'ES',
    category: 'modern',
    phonetic: 'spanish',
    direction: 'ltr',
    characterDensity: 1.15,
    
    haptics: {
      tap: [12, 8],
      flick: [15, 10, 15, 10, 15],
      supernova: [40, 25, 40, 25, 40, 25, 80],
      collapse: [80, 40, 80, 40],
      lineToggle: [8, 5, 8],
      zeroPointBurst: [8, 6, 10, 6, 8],
    },
    
    zeroPoint: {
      weight: 1.0,
      flickerGlyph: '∿',
      glitchIntensity: 0.5,
    },
    
    translations: {
      'common.peace': 'Paz',
      'common.harmony': 'Armonía',
      'flicker.greeting': 'Hola',
    },
  },
  
  hi: {
    code: 'hi',
    label: 'Hindi',
    native: 'हिंदी',
    flag: 'HI',
    category: 'modern',
    phonetic: 'hindi',
    direction: 'ltr',
    characterDensity: 0.9,
    
    haptics: {
      tap: [20],
      flick: [25, 12, 25],
      supernova: [55, 30, 55, 30, 110],
      collapse: [110, 45, 110],
      lineToggle: [15, 8],
      zeroPointBurst: [12, 8, 15, 8, 12],
    },
    
    zeroPoint: {
      weight: 1.1, // Slightly higher weight (cultural resonance)
      flickerGlyph: 'ॐ',
      glitchIntensity: 0.6,
    },
    
    translations: {
      'common.peace': 'शांति',
      'common.harmony': 'सामंजस्य',
      'flicker.greeting': 'नमस्ते',
    },
  },

  // V68.85 — Urdu (lyrical sister to Hindi, RTL Nastaliq).
  ur: {
    code: 'ur',
    label: 'Urdu',
    native: 'اُردُو',
    flag: 'UR',
    category: 'modern',
    phonetic: 'urdu',
    direction: 'rtl',
    characterDensity: 0.92,

    haptics: {
      tap: [18],
      flick: [22, 12, 22],
      supernova: [52, 28, 52, 28, 105],
      collapse: [105, 44, 105],
      lineToggle: [14, 8],
      zeroPointBurst: [11, 9, 14, 9, 11],
    },

    zeroPoint: {
      weight: 1.05,
      flickerGlyph: 'ﷲ', // Allah glyph — multi-denominational respect
      glitchIntensity: 0.55,
    },

    translations: {
      'common.peace': 'امن',
      'common.harmony': 'ہم آہنگی',
      'flicker.greeting': 'السلام علیکم',
    },
  },

  // V68.84 — Hawaiian / ʻŌlelo Hawaiʻi (Aloha-flow, breath-of-life).
  haw: {
    code: 'haw',
    label: 'Hawaiian',
    native: 'ʻŌlelo Hawaiʻi',
    flag: 'HAW',
    category: 'modern',
    phonetic: 'hawaiian',
    direction: 'ltr',
    characterDensity: 1.05,

    haptics: {
      tap: [16],
      flick: [22, 12, 22, 12],
      supernova: [55, 30, 55, 30, 110],
      collapse: [110, 50, 110],
      lineToggle: [13, 7],
      zeroPointBurst: [10, 7, 13, 7, 10],
    },

    zeroPoint: {
      weight: 1.0,
      flickerGlyph: 'ʻ', // ʻOkina — sacred Hawaiian glottal mark
      glitchIntensity: 0.5,
    },

    translations: {
      'common.peace': 'Maluhia',
      'common.harmony': 'Lōkahi',
      'flicker.greeting': 'Aloha',
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════
  // TECHNICAL / MATRIX LANGUAGES (Category: Binary)
  // ═══════════════════════════════════════════════════════════════════
  ja: {
    code: 'ja',
    label: 'Japanese',
    native: '日本語',
    flag: 'JA',
    category: 'technical',
    phonetic: 'japanese',
    direction: 'ltr',
    characterDensity: 0.6,
    
    haptics: {
      tap: [25],
      flick: [30, 5, 30],
      supernova: [60, 10, 60, 10, 60, 10, 150],
      collapse: [150, 20, 150],
      lineToggle: [20, 5],
      zeroPointBurst: [5, 3, 5, 3, 5, 3, 8], // Rapid binary
    },
    
    zeroPoint: {
      weight: 1.1,
      flickerGlyph: '気',
      glitchIntensity: 0.9, // High glitch
    },
    
    translations: {
      'common.peace': '平和',
      'common.harmony': '調和',
      'flicker.greeting': 'こんにちは',
    },
  },
  
  'zh-cmn': {
    code: 'zh-cmn',
    label: 'Mandarin',
    native: '普通话',
    flag: 'ZH',
    category: 'technical',
    phonetic: 'mandarin',
    direction: 'ltr',
    characterDensity: 0.55,
    parentLanguage: 'zh', // For sub-selection UI
    
    haptics: {
      tap: [30],
      flick: [35, 8, 35],
      supernova: [70, 15, 70, 15, 70, 15, 180],
      collapse: [180, 30, 180],
      lineToggle: [25, 8],
      zeroPointBurst: [6, 4, 6, 4, 6, 4, 10],
    },
    
    zeroPoint: {
      weight: 1.0,
      flickerGlyph: '道',
      glitchIntensity: 0.85,
    },
    
    translations: {
      'common.peace': '和平',
      'common.harmony': '和谐',
      'flicker.greeting': '你好',
    },
  },
  
  'zh-yue': {
    code: 'zh-yue',
    label: 'Cantonese',
    native: '廣東話',
    flag: 'ZH',
    category: 'technical',
    phonetic: 'cantonese',
    direction: 'ltr',
    characterDensity: 0.55,
    parentLanguage: 'zh', // For sub-selection UI
    
    haptics: {
      tap: [28],
      flick: [32, 7, 32],
      supernova: [65, 12, 65, 12, 65, 12, 160],
      collapse: [160, 25, 160],
      lineToggle: [22, 7],
      zeroPointBurst: [5, 3, 5, 3, 5, 3, 9],
    },
    
    zeroPoint: {
      weight: 0.9,
      flickerGlyph: '氣',
      glitchIntensity: 0.88,
    },
    
    translations: {
      'common.peace': '和平',
      'common.harmony': '和諧',
      'flicker.greeting': '你好',
    },
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ZERO-POINT FLICKER ROTATION CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ZERO_POINT_CONFIG = {
  // Gravity boundaries for Zero-Point activation
  gravityLow: 0.48,
  gravityHigh: 0.52,
  gravityCenter: 0.50,
  
  // Flicker speed (gravity-reactive)
  baseIntervalMs: 120, // At edges (0.48 or 0.52)
  peakIntervalMs: 35,  // At exact center (0.50)
  
  // Visual glitch parameters
  blurRange: [0, 4], // px blur at edges vs center
  brightnessRange: [1.0, 1.3],
  hueShift: [-15, 15], // degrees
  
  // Haptic burst timing
  hapticSyncEnabled: true,
  
  // Audio synthesis
  audioEnabled: true,
  audioVolume: 0.15, // Low ambient level
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get all languages in the flicker rotation
 * @param {Object} options - Filter options
 * @returns {Array} Language objects sorted by weight
 */
export function getFlickerRotation(options = {}) {
  const { excludeCategories = [], includeDialects = true } = options;
  
  return Object.values(LANGUAGE_REGISTRY)
    .filter(lang => {
      if (excludeCategories.includes(lang.category)) return false;
      if (!includeDialects && lang.parentLanguage) return false;
      return true;
    })
    .sort((a, b) => (b.zeroPoint?.weight || 1) - (a.zeroPoint?.weight || 1));
}

/**
 * Get Chinese dialect sub-options
 */
export function getChineseDialects() {
  return Object.values(LANGUAGE_REGISTRY)
    .filter(lang => lang.parentLanguage === 'zh');
}

/**
 * Calculate flicker interval based on gravity distance from center
 * @param {number} gravity - Current gravity (0.48 to 0.52)
 * @returns {number} Interval in milliseconds
 */
export function calculateFlickerInterval(gravity) {
  const { gravityCenter, gravityLow, gravityHigh, baseIntervalMs, peakIntervalMs } = ZERO_POINT_CONFIG;
  
  // Normalize distance from center (0 = at center, 1 = at edge)
  const distanceFromCenter = Math.abs(gravity - gravityCenter) / (gravityHigh - gravityCenter);
  const normalizedDistance = Math.min(distanceFromCenter, 1);
  
  // Interpolate: center = peakInterval (fast), edge = baseInterval (slow)
  return peakIntervalMs + (baseIntervalMs - peakIntervalMs) * normalizedDistance;
}

/**
 * Get haptic category for a language
 */
export function getHapticCategory(langCode) {
  const lang = LANGUAGE_REGISTRY[langCode];
  if (!lang) return HAPTIC_CATEGORIES.modern;
  return HAPTIC_CATEGORIES[lang.category] || HAPTIC_CATEGORIES.modern;
}

/**
 * Get phonetic profile for audio synthesis
 */
export function getPhoneticProfile(langCode) {
  const lang = LANGUAGE_REGISTRY[langCode];
  if (!lang) return PHONETIC_PROFILES.english;
  return PHONETIC_PROFILES[lang.phonetic] || PHONETIC_PROFILES.english;
}

export default LANGUAGE_REGISTRY;
