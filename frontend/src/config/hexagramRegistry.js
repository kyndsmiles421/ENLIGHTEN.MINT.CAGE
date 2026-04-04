/**
 * hexagramRegistry.js — The 9 Master Controllers
 * 
 * THE RULE OF NINES: 9 Languages × 9 Hexagrams × 9 Depth Resonances
 * 
 * These 9 hexagrams form the "State Controllers" for the Zero Point experience.
 * Each hexagram has:
 * - Binary pattern (6-bit)
 * - Haptic signature (Yang = long pulse, Yin = short-short)
 * - Ghost geometry SVG path
 * - Paired language
 * - Depth resonance tier
 * 
 * THE FOUNDATIONAL NINE (Creation Cycle):
 * 1. Qián (Creative) — Pure Yang, Heaven
 * 2. Kūn (Receptive) — Pure Yin, Earth  
 * 11. Tài (Peace) — Heaven-Earth Harmony
 * 12. Pǐ (Standstill) — Stagnation/Reversal
 * 63. Jì Jì (After Completion) — Perfect Balance [THE SOURCE]
 * 64. Wèi Jì (Before Completion) — Potential Energy
 * 29. Kǎn (The Abysmal) — Water/Depth
 * 30. Lí (The Clinging) — Fire/Clarity
 * 15. Qiān (Modesty) — The Sage's Path
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HAPTIC ENCODING: Binary to Vibration Pattern
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Yang (1) = Solid line = Long pulse (40ms)
// Yin (0) = Broken line = Two short taps (12ms, 8ms gap, 12ms)
const YANG_PULSE = [40];
const YIN_PULSE = [12, 8, 12];
const LINE_GAP = 25; // Gap between lines

/**
 * Convert 6-bit binary to haptic pattern
 * Reads from Line 1 (LSB/bottom) to Line 6 (MSB/top)
 */
function binaryToHaptic(binary) {
  const pattern = [];
  const bits = binary.toString(2).padStart(6, '0').split('').reverse(); // LSB first
  
  bits.forEach((bit, index) => {
    if (bit === '1') {
      pattern.push(...YANG_PULSE);
    } else {
      pattern.push(...YIN_PULSE);
    }
    
    // Add gap between lines (except after last)
    if (index < 5) {
      pattern.push(LINE_GAP);
    }
  });
  
  return pattern;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SVG GHOST GEOMETRY GENERATORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LINE_HEIGHT = 4;
const LINE_WIDTH = 50;
const LINE_SPACING = 10;
const YIN_GAP = 8;
const VIEWBOX_HEIGHT = 6 * LINE_HEIGHT + 5 * LINE_SPACING;
const VIEWBOX_WIDTH = LINE_WIDTH + 10;

/**
 * Generate SVG path for a hexagram
 */
function generateHexagramSVG(binary) {
  const bits = binary.toString(2).padStart(6, '0').split('').reverse();
  const paths = [];
  
  bits.forEach((bit, index) => {
    const y = (5 - index) * (LINE_HEIGHT + LINE_SPACING) + 5;
    const x = 5;
    
    if (bit === '1') {
      // Yang: Solid line
      paths.push(`<rect x="${x}" y="${y}" width="${LINE_WIDTH}" height="${LINE_HEIGHT}" rx="1" fill="currentColor" opacity="0.6"/>`);
    } else {
      // Yin: Broken line (two segments)
      const segWidth = (LINE_WIDTH - YIN_GAP) / 2;
      paths.push(`<rect x="${x}" y="${y}" width="${segWidth}" height="${LINE_HEIGHT}" rx="1" fill="currentColor" opacity="0.4"/>`);
      paths.push(`<rect x="${x + segWidth + YIN_GAP}" y="${y}" width="${segWidth}" height="${LINE_HEIGHT}" rx="1" fill="currentColor" opacity="0.4"/>`);
    }
  });
  
  return `<svg viewBox="0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}" xmlns="http://www.w3.org/2000/svg">${paths.join('')}</svg>`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THE FOUNDATIONAL NINE HEXAGRAMS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HEXAGRAM_REGISTRY = {
  // ═══════════════════════════════════════════════════════════════════
  // 1. QIÁN (The Creative) — Pure Yang, Heaven
  // Position: Apex of the Nine / The Source of All Yang
  // ═══════════════════════════════════════════════════════════════════
  1: {
    number: 1,
    name: 'Qián',
    meaning: 'The Creative',
    translation: {
      en: 'The Creative',
      zh: '乾',
      sa: 'सृजनशील',
      ja: '乾',
    },
    binary: 0b111111, // 63 decimal
    binaryString: '111111',
    symbol: '☰',
    
    // Elemental properties
    element: 'heaven',
    nature: 'pure_yang',
    energy: 'initiating',
    
    // Haptic signature
    hapticPattern: binaryToHaptic(0b111111),
    hapticCharacter: 'ascending_thunder', // 6 long pulses
    
    // Visual
    svg: generateHexagramSVG(0b111111),
    glowColor: '#FFD700', // Gold
    ghostOpacity: 0.15,
    
    // Language pairing
    pairedLanguage: 'ja', // Japanese - Technical precision
    
    // Depth resonance (9-tier system)
    depthTier: 9, // Highest
    gravityRange: [0.89, 1.0],
    
    // Audio frequency
    baseFrequency: 528, // Transformation / DNA repair
  },
  
  // ═══════════════════════════════════════════════════════════════════
  // 2. KŪN (The Receptive) — Pure Yin, Earth
  // Position: Foundation of the Nine / The Source of All Yin
  // ═══════════════════════════════════════════════════════════════════
  2: {
    number: 2,
    name: 'Kūn',
    meaning: 'The Receptive',
    translation: {
      en: 'The Receptive',
      zh: '坤',
      sa: 'ग्रहणशील',
      ja: '坤',
    },
    binary: 0b000000, // 0 decimal
    binaryString: '000000',
    symbol: '☷',
    
    element: 'earth',
    nature: 'pure_yin',
    energy: 'receiving',
    
    hapticPattern: binaryToHaptic(0b000000),
    hapticCharacter: 'earth_tremor', // 6 broken patterns
    
    svg: generateHexagramSVG(0b000000),
    glowColor: '#8B4513', // Sienna
    ghostOpacity: 0.12,
    
    pairedLanguage: 'lkt', // Lakota - Grounded, earth-connected
    
    depthTier: 1, // Lowest / Foundation
    gravityRange: [0.0, 0.11],
    
    baseFrequency: 396, // Liberation from fear
  },
  
  // ═══════════════════════════════════════════════════════════════════
  // 11. TÀI (Peace) — Heaven below Earth
  // Position: The Harmony Point
  // ═══════════════════════════════════════════════════════════════════
  11: {
    number: 11,
    name: 'Tài',
    meaning: 'Peace',
    translation: {
      en: 'Peace',
      zh: '泰',
      sa: 'शान्ति',
      ja: '泰',
    },
    binary: 0b000111, // Earth over Heaven (lines 1-3 yang, 4-6 yin)
    binaryString: '000111',
    symbol: '☯',
    
    element: 'harmony',
    nature: 'balanced_ascending',
    energy: 'flourishing',
    
    hapticPattern: binaryToHaptic(0b000111),
    hapticCharacter: 'rising_calm', // 3 solid + 3 broken
    
    svg: generateHexagramSVG(0b000111),
    glowColor: '#90EE90', // Light green
    ghostOpacity: 0.18,
    
    pairedLanguage: 'hi', // Hindi - Spiritual harmony
    
    depthTier: 4,
    gravityRange: [0.33, 0.44],
    
    baseFrequency: 639, // Connecting/Relationships
  },
  
  // ═══════════════════════════════════════════════════════════════════
  // 12. PǏ (Standstill) — Earth below Heaven
  // Position: The Reversal Point
  // ═══════════════════════════════════════════════════════════════════
  12: {
    number: 12,
    name: 'Pǐ',
    meaning: 'Standstill',
    translation: {
      en: 'Standstill',
      zh: '否',
      sa: 'स्थिरता',
      ja: '否',
    },
    binary: 0b111000, // Heaven over Earth (lines 1-3 yin, 4-6 yang)
    binaryString: '111000',
    symbol: '☯',
    
    element: 'stagnation',
    nature: 'balanced_descending',
    energy: 'withdrawing',
    
    hapticPattern: binaryToHaptic(0b111000),
    hapticCharacter: 'descending_weight', // 3 broken + 3 solid
    
    svg: generateHexagramSVG(0b111000),
    glowColor: '#4A4A6A', // Slate
    ghostOpacity: 0.14,
    
    pairedLanguage: 'dak', // Dakota - Flowing, transitional
    
    depthTier: 6,
    gravityRange: [0.56, 0.67],
    
    baseFrequency: 417, // Facilitating change
  },
  
  // ═══════════════════════════════════════════════════════════════════
  // 63. JÌ JÌ (After Completion) — THE SOURCE STATE
  // Position: Perfect Balance / Zero Point Home
  // ═══════════════════════════════════════════════════════════════════
  63: {
    number: 63,
    name: 'Jì Jì',
    meaning: 'After Completion',
    translation: {
      en: 'After Completion',
      zh: '既濟',
      sa: 'पूर्णता',
      ja: '既済',
    },
    binary: 0b010101, // Perfect alternation (water over fire)
    binaryString: '010101',
    symbol: '☵',
    
    element: 'completion',
    nature: 'perfect_balance',
    energy: 'equilibrium',
    
    hapticPattern: binaryToHaptic(0b010101),
    hapticCharacter: 'resonant_hum', // Alternating pattern creates "hum"
    
    svg: generateHexagramSVG(0b010101),
    glowColor: '#FFFFFF', // Pure white
    ghostOpacity: 0.25,
    
    pairedLanguage: 'sa', // Sanskrit - Sacred completion
    
    depthTier: 5, // THE CENTER (Zero Point)
    gravityRange: [0.44, 0.56], // Encompasses 0.50
    isSourceState: true, // Special flag for Zero Point
    
    baseFrequency: 432, // Universal harmony
    
    // Source State specific properties
    sourceState: {
      precisionThreshold: 0.5000,
      whiteOutDuration: 1500, // ms
      silenceDuration: 2000, // ms
      resonantHumFrequency: 136.1, // Om frequency
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════
  // 64. WÈI JÌ (Before Completion) — Potential Energy
  // Position: The Threshold / Just Before Source
  // ═══════════════════════════════════════════════════════════════════
  64: {
    number: 64,
    name: 'Wèi Jì',
    meaning: 'Before Completion',
    translation: {
      en: 'Before Completion',
      zh: '未濟',
      sa: 'अपूर्णता',
      ja: '未済',
    },
    binary: 0b101010, // Inverse of 63 (fire over water)
    binaryString: '101010',
    symbol: '☲',
    
    element: 'potential',
    nature: 'approaching_balance',
    energy: 'anticipating',
    
    hapticPattern: binaryToHaptic(0b101010),
    hapticCharacter: 'flickering_potential', // Inverse hum
    
    svg: generateHexagramSVG(0b101010),
    glowColor: '#FF6B6B', // Coral
    ghostOpacity: 0.2,
    
    pairedLanguage: 'en', // English - Modern bridging
    
    depthTier: 4.5, // Just before center
    gravityRange: [0.40, 0.48],
    
    baseFrequency: 741, // Awakening intuition
  },
  
  // ═══════════════════════════════════════════════════════════════════
  // 29. KǍN (The Abysmal) — Water, Depth
  // Position: The Descent
  // ═══════════════════════════════════════════════════════════════════
  29: {
    number: 29,
    name: 'Kǎn',
    meaning: 'The Abysmal',
    translation: {
      en: 'The Abysmal',
      zh: '坎',
      sa: 'गहन',
      ja: '坎',
    },
    binary: 0b010010, // Water doubled
    binaryString: '010010',
    symbol: '☵',
    
    element: 'water',
    nature: 'deep_yin',
    energy: 'flowing_down',
    
    hapticPattern: binaryToHaptic(0b010010),
    hapticCharacter: 'water_drops', // Sparse, deep
    
    svg: generateHexagramSVG(0b010010),
    glowColor: '#4169E1', // Royal blue
    ghostOpacity: 0.16,
    
    pairedLanguage: 'zh-cmn', // Mandarin - Tonal depth
    
    depthTier: 2,
    gravityRange: [0.11, 0.22],
    
    baseFrequency: 285, // Healing tissue
  },
  
  // ═══════════════════════════════════════════════════════════════════
  // 30. LÍ (The Clinging) — Fire, Clarity
  // Position: The Ascent
  // ═══════════════════════════════════════════════════════════════════
  30: {
    number: 30,
    name: 'Lí',
    meaning: 'The Clinging',
    translation: {
      en: 'The Clinging',
      zh: '離',
      sa: 'ज्योति',
      ja: '離',
    },
    binary: 0b101101, // Fire doubled
    binaryString: '101101',
    symbol: '☲',
    
    element: 'fire',
    nature: 'bright_yang',
    energy: 'illuminating',
    
    hapticPattern: binaryToHaptic(0b101101),
    hapticCharacter: 'fire_crackle', // Intense bursts
    
    svg: generateHexagramSVG(0b101101),
    glowColor: '#FF4500', // Orange red
    ghostOpacity: 0.2,
    
    pairedLanguage: 'zh-yue', // Cantonese - Bright, complex tones
    
    depthTier: 8,
    gravityRange: [0.78, 0.89],
    
    baseFrequency: 852, // Spiritual awakening
  },
  
  // ═══════════════════════════════════════════════════════════════════
  // 15. QIĀN (Modesty) — The Sage's Path
  // Position: The Humble Center
  // ═══════════════════════════════════════════════════════════════════
  15: {
    number: 15,
    name: 'Qiān',
    meaning: 'Modesty',
    translation: {
      en: 'Modesty',
      zh: '謙',
      sa: 'विनम्रता',
      ja: '謙',
    },
    binary: 0b000100, // Mountain within earth
    binaryString: '000100',
    symbol: '☷',
    
    element: 'mountain',
    nature: 'humble_yang',
    energy: 'centering',
    
    hapticPattern: binaryToHaptic(0b000100),
    hapticCharacter: 'mountain_stillness', // Mostly soft, one firm
    
    svg: generateHexagramSVG(0b000100),
    glowColor: '#9370DB', // Medium purple
    ghostOpacity: 0.14,
    
    pairedLanguage: 'es', // Spanish - Warm, flowing
    
    depthTier: 3,
    gravityRange: [0.22, 0.33],
    
    baseFrequency: 174, // Foundation
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORDERED SEQUENCE (The Ritual Cycle)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// The sequence for Zero Point cycling (intentional, not random)
// Follows the "descent and return" pattern
export const HEXAGRAM_SEQUENCE = [
  1,   // Qián - Creative (Start at Heaven)
  12,  // Pǐ - Standstill (Descend)
  15,  // Qiān - Modesty (Continue descent)
  29,  // Kǎn - Abysmal (Reach depth)
  2,   // Kūn - Receptive (Touch Earth)
  11,  // Tài - Peace (Begin ascent)
  64,  // Wèi Jì - Before Completion (Approach center)
  63,  // Jì Jì - After Completion [THE SOURCE] (Zero Point)
  30,  // Lí - Clinging (Fire of clarity)
  // Returns to 1 (Qián) to complete the cycle
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LANGUAGE-HEXAGRAM PAIRING MAP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const LANGUAGE_HEXAGRAM_MAP = {
  'ja': 1,       // Japanese ↔ Qián (Creative/Technical precision)
  'lkt': 2,      // Lakota ↔ Kūn (Receptive/Earth connection)
  'hi': 11,      // Hindi ↔ Tài (Peace/Spiritual harmony)
  'dak': 12,     // Dakota ↔ Pǐ (Standstill/Transitional)
  'sa': 63,      // Sanskrit ↔ Jì Jì (Completion/Sacred Source)
  'en': 64,      // English ↔ Wèi Jì (Potential/Modern bridge)
  'zh-cmn': 29,  // Mandarin ↔ Kǎn (Abysmal/Tonal depth)
  'zh-yue': 30,  // Cantonese ↔ Lí (Clinging/Complex tones)
  'es': 15,      // Spanish ↔ Qiān (Modesty/Warm flow)
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get hexagram by number
 */
export function getHexagram(number) {
  return HEXAGRAM_REGISTRY[number] || null;
}

/**
 * Get hexagram for a language code
 */
export function getHexagramForLanguage(langCode) {
  const hexNumber = LANGUAGE_HEXAGRAM_MAP[langCode];
  return hexNumber ? HEXAGRAM_REGISTRY[hexNumber] : null;
}

/**
 * Get the Source State hexagram (63)
 */
export function getSourceHexagram() {
  return HEXAGRAM_REGISTRY[63];
}

/**
 * Get hexagram for current gravity position
 */
export function getHexagramForGravity(gravity) {
  for (const hex of Object.values(HEXAGRAM_REGISTRY)) {
    const [min, max] = hex.gravityRange;
    if (gravity >= min && gravity <= max) {
      return hex;
    }
  }
  // Default to center
  return HEXAGRAM_REGISTRY[63];
}

/**
 * Get the next hexagram in the ritual sequence
 */
export function getNextInSequence(currentNumber) {
  const currentIndex = HEXAGRAM_SEQUENCE.indexOf(currentNumber);
  if (currentIndex === -1) return HEXAGRAM_REGISTRY[HEXAGRAM_SEQUENCE[0]];
  const nextIndex = (currentIndex + 1) % HEXAGRAM_SEQUENCE.length;
  return HEXAGRAM_REGISTRY[HEXAGRAM_SEQUENCE[nextIndex]];
}

/**
 * Check if at Source State (Hexagram 63)
 */
export function isSourceState(hexNumber) {
  return hexNumber === 63;
}

/**
 * Get all hexagrams as ordered array
 */
export function getOrderedHexagrams() {
  return HEXAGRAM_SEQUENCE.map(num => HEXAGRAM_REGISTRY[num]);
}

export default HEXAGRAM_REGISTRY;
