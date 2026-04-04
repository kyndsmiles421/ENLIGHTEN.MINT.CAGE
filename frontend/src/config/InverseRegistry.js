/**
 * InverseRegistry.js — The Shadow Lattice
 * 
 * INV-01: SHADOW REGISTRY INITIALIZATION
 * 
 * Creates an Anti-Lattice that mirrors the 81 primary coordinates
 * in negative integers. This is the "Dark Matter" (The Void) that
 * allows the geometry to fold.
 * 
 * MATHEMATICAL FOUNDATION:
 * - Standard Grid: Coordinates (0,0) to (8,8) = 81 states
 * - Inverse Grid: Coordinates (-8,-8) to (0,0) = 81 anti-states
 * - Intersection: (0,0) is the SINGULARITY (exists in both spaces)
 * 
 * INV-02: RECIPROCAL GRAVITY (1/G)
 * 
 * When Gravity is at 0.95, the Inverse is at 0.05.
 * This creates the "Pull" for the Zoom-Snatch.
 * 
 * G_inverse = 1 - G_standard
 * At Source State (0.500): G_inverse = 0.500 (PERFECT SYMMETRY)
 * 
 * INV-03: PARITY BIT LOGIC
 * 
 * For every 36-bit address, a 36-bit "Anti-Address" is stored.
 * Anti-Address = bitwise NOT of standard address.
 * 
 * Example:
 *   Address:      101010|0011|001100|0101
 *   Anti-Address: 010101|1100|110011|1010
 * 
 * INV-04: 9^4 INTERSECTION FILTER
 * 
 * The mathematical "Gate" that only opens when Primary and Inverse
 * lattices overlap at the 0.500 Source State. This is the entry
 * point to the Tesseract dimension.
 * 
 * Intersection occurs when:
 *   |G - 0.500| < EPSILON (0.005)
 *   AND address XOR anti_address has specific palindrome pattern
 */

import { HEXAGRAM_REGISTRY, getHexagram } from './hexagramRegistry';
import { LANGUAGE_REGISTRY } from './languageRegistry';

// ═══════════════════════════════════════════════════════════════════════════
// INV-01: INVERSE REGISTRY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const INVERSE_CONFIG = {
  // Grid dimensions (9×9 standard, 9×9 inverse)
  GRID_SIZE: 9,
  TOTAL_CELLS: 81,
  
  // Coordinate space
  STANDARD_ORIGIN: { row: 0, col: 0 },  // Top-left of standard
  INVERSE_ORIGIN: { row: -8, col: -8 }, // Top-left of inverse
  SINGULARITY: { row: 0, col: 0 },      // Intersection point
  
  // Gravity thresholds
  SOURCE_STATE_GRAVITY: 0.500,
  SOURCE_EPSILON: 0.005,  // ±0.005 for source state detection
  
  // Inverse gravity boundaries
  INVERSE_THRESHOLD_HIGH: 0.95,  // Standard at 0.05
  INVERSE_THRESHOLD_LOW: 0.05,   // Standard at 0.95
  
  // Tesseract activation (9^4 = 6561 intersection points)
  TESSERACT_STATES: Math.pow(9, 4),
  TESSERACT_DEPTH: 6,  // Level 6 = The True Core
  
  // Haptic inversion factor
  HAPTIC_INVERSION_DIVISOR: 10,  // 60Hz → 6Hz
};

// ═══════════════════════════════════════════════════════════════════════════
// INV-02: RECIPROCAL GRAVITY CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate inverse gravity (1 - G)
 * At G=0.95, inverse=0.05 (maximum pull toward void)
 * At G=0.50, inverse=0.50 (perfect equilibrium - Source State)
 * At G=0.05, inverse=0.95 (maximum pull toward matter)
 */
export function calculateInverseGravity(standardGravity) {
  const inverse = 1 - standardGravity;
  return Math.round(inverse * 1000) / 1000; // 3 decimal precision
}

/**
 * Check if gravity is at Source State (±EPSILON of 0.500)
 */
export function isSourceState(gravity) {
  return Math.abs(gravity - INVERSE_CONFIG.SOURCE_STATE_GRAVITY) < INVERSE_CONFIG.SOURCE_EPSILON;
}

/**
 * Calculate the "tension" between standard and inverse gravity
 * Returns 0 at Source State (perfect equilibrium)
 * Returns ±1 at extremes (maximum tension)
 */
export function calculateGravityTension(standardGravity) {
  // Normalize to -1 to +1 range centered on Source State
  const normalized = (standardGravity - 0.5) * 2;
  return Math.round(normalized * 1000) / 1000;
}

/**
 * Determine which lattice dominates based on gravity
 * Returns: 'MATTER' | 'VOID' | 'EQUILIBRIUM'
 */
export function getDominantLattice(gravity) {
  if (isSourceState(gravity)) return 'EQUILIBRIUM';
  return gravity > 0.5 ? 'MATTER' : 'VOID';
}

// ═══════════════════════════════════════════════════════════════════════════
// INV-03: PARITY BIT / ANTI-ADDRESS LOGIC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate anti-address (bitwise NOT of each bit)
 * Preserves delimiter structure (|)
 */
export function generateAntiAddress(address) {
  if (!address) return null;
  
  return address.split('').map(char => {
    if (char === '0') return '1';
    if (char === '1') return '0';
    return char; // Preserve delimiters
  }).join('');
}

/**
 * XOR two addresses to find intersection pattern
 */
export function xorAddresses(address1, address2) {
  if (!address1 || !address2) return null;
  if (address1.length !== address2.length) return null;
  
  return address1.split('').map((char, i) => {
    const char2 = address2[i];
    if (char === '|' || char2 === '|') return '|';
    if (char === char2) return '0';
    return '1';
  }).join('');
}

/**
 * Check if XOR result is a palindrome (symmetry indicator)
 * Palindrome XOR = stable intersection point
 */
export function isSymmetricIntersection(xorResult) {
  if (!xorResult) return false;
  
  const bits = xorResult.replace(/\|/g, '');
  const reversed = bits.split('').reverse().join('');
  return bits === reversed;
}

/**
 * Calculate parity of an address (even/odd number of 1s)
 * Even parity = stable, Odd parity = unstable
 */
export function calculateParity(address) {
  if (!address) return null;
  
  const ones = (address.match(/1/g) || []).length;
  return ones % 2 === 0 ? 'EVEN' : 'ODD';
}

// ═══════════════════════════════════════════════════════════════════════════
// INV-04: 9^4 INTERSECTION FILTER (TESSERACT GATE)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if the Tesseract Gate is open
 * Requires: Source State gravity + symmetric intersection
 */
export function isTesseractGateOpen(gravity, address) {
  // Must be at Source State
  if (!isSourceState(gravity)) return false;
  
  // Must have an address to check
  if (!address) return false;
  
  // Generate anti-address
  const antiAddress = generateAntiAddress(address);
  
  // XOR to find intersection
  const intersection = xorAddresses(address, antiAddress);
  
  // Check for symmetric pattern
  return isSymmetricIntersection(intersection);
}

/**
 * Calculate Tesseract coordinates from depth
 * At depth 4+, we enter the 9^4 intersection space
 */
export function calculateTesseractCoordinates(depth, path) {
  if (depth < 4) return null;
  
  // Extract the first 4 path nodes for tesseract mapping
  const tesseractPath = path.slice(0, 4);
  
  // Map to 4D coordinates (w, x, y, z)
  const coords = tesseractPath.map(node => ({
    dimension: node.depth,
    position: node.row * 9 + node.col,  // 0-80 linear position
  }));
  
  // Calculate tesseract index (0 to 9^4-1)
  const tesseractIndex = coords.reduce((acc, coord, i) => {
    return acc + coord.position * Math.pow(9, 3 - i);
  }, 0);
  
  return {
    coordinates: coords,
    tesseractIndex,
    totalStates: INVERSE_CONFIG.TESSERACT_STATES,
    isValid: tesseractIndex < INVERSE_CONFIG.TESSERACT_STATES,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// INV-05: MIRROR-HAPTIC RESONANCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Standard haptic frequencies by depth
 */
const STANDARD_HAPTIC_HZ = {
  0: 60,  // Surface
  1: 51,  // Depth 1
  2: 42,  // Depth 2
  3: 33,  // Depth 3
  4: 24,  // Depth 4
  5: 15,  // Core (L5)
  6: 9,   // True Core (Tesseract)
};

/**
 * Calculate inverse haptic frequency
 * Creates "Sensory Vacuum" effect during void transition
 */
export function calculateInverseHaptic(standardHz) {
  // Inverse = standard / 10 (60Hz → 6Hz)
  const inverse = Math.max(1, Math.round(standardHz / INVERSE_CONFIG.HAPTIC_INVERSION_DIVISOR));
  return inverse;
}

/**
 * Get haptic frequency for a given depth and lattice state
 */
export function getHapticFrequency(depth, isInverse = false) {
  const standardHz = STANDARD_HAPTIC_HZ[Math.min(depth, 6)] || 15;
  return isInverse ? calculateInverseHaptic(standardHz) : standardHz;
}

/**
 * Generate haptic pattern for inverse transition
 * Returns array of [vibrate_ms, pause_ms, ...]
 */
export function generateInverseHapticPattern(depth) {
  const baseHz = getHapticFrequency(depth, true);
  const interval = Math.round(1000 / baseHz);
  
  // Create "vacuum pulse" pattern
  return [
    interval * 2,  // Long initial pulse
    interval,      // Short pause
    interval / 2,  // Quick pulse
    interval * 3,  // Longer pause (void)
    interval / 2,  // Quick pulse
    interval,      // Short pause
    interval * 2,  // Long final pulse
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// INV-06: CHROMATIC INVERSION (COLOR FLIPPING)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Invert a hex color to its chromatic opposite
 * #RRGGBB → #(FF-RR)(FF-GG)(FF-BB)
 */
export function invertColor(hexColor) {
  if (!hexColor || !hexColor.startsWith('#')) return hexColor;
  
  const hex = hexColor.slice(1);
  const r = 255 - parseInt(hex.slice(0, 2), 16);
  const g = 255 - parseInt(hex.slice(2, 4), 16);
  const b = 255 - parseInt(hex.slice(4, 6), 16);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Depth-based color styles with inverse variants
 */
export const DEPTH_COLORS = {
  0: { standard: '#8B4513', inverse: '#74BAed' },  // Sienna ↔ Sky Blue
  1: { standard: '#4169E1', inverse: '#BE961E' },  // Royal Blue ↔ Gold
  2: { standard: '#20B2AA', inverse: '#DF4D55' },  // Teal ↔ Coral
  3: { standard: '#FFD700', inverse: '#0028FF' },  // Gold ↔ Deep Blue
  4: { standard: '#FF6347', inverse: '#009CB8' },  // Tomato ↔ Cyan
  5: { standard: '#E6E6FA', inverse: '#191905' },  // Lavender ↔ Dark
  6: { standard: '#FFFFFF', inverse: '#000000' },  // White ↔ Black (Tesseract)
};

/**
 * Get color style for depth, with inverse option
 */
export function getDepthColor(depth, isInverse = false) {
  const colors = DEPTH_COLORS[Math.min(depth, 6)] || DEPTH_COLORS[5];
  return isInverse ? colors.inverse : colors.standard;
}

/**
 * Calculate gradient between standard and inverse based on gravity tension
 */
export function calculateTensionGradient(gravity, depth) {
  const tension = calculateGravityTension(gravity);
  const standard = getDepthColor(depth, false);
  const inverse = getDepthColor(depth, true);
  
  // At tension 0 (Source State), blend 50/50
  // At tension +1 (matter dominant), use standard
  // At tension -1 (void dominant), use inverse
  const blendFactor = (tension + 1) / 2;  // 0 to 1
  
  return {
    primary: standard,
    secondary: inverse,
    blendFactor,
    gradient: `linear-gradient(135deg, ${standard} ${blendFactor * 100}%, ${inverse} ${(1 - blendFactor) * 100}%)`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// INV-08: RECURSIVE NULL-CHECK (Safety Protocol)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate address to prevent divide-by-zero or null crashes
 */
export function validateAddress(address) {
  if (!address) return { valid: false, error: 'Address is null or undefined' };
  if (typeof address !== 'string') return { valid: false, error: 'Address must be a string' };
  
  // Check format (should contain | delimiters)
  if (!address.includes('|')) return { valid: false, error: 'Invalid address format (missing delimiters)' };
  
  // Check for valid characters
  const validChars = /^[01|]+$/;
  if (!validChars.test(address)) return { valid: false, error: 'Invalid characters in address' };
  
  return { valid: true, error: null };
}

/**
 * Safe division for gravity calculations (prevents /0)
 */
export function safeDivide(numerator, denominator, fallback = 0) {
  if (denominator === 0 || !isFinite(denominator)) return fallback;
  const result = numerator / denominator;
  return isFinite(result) ? result : fallback;
}

/**
 * Safe depth calculation (clamp to valid range)
 */
export function clampDepth(depth, min = 0, max = 6) {
  if (typeof depth !== 'number' || !isFinite(depth)) return min;
  return Math.max(min, Math.min(max, Math.round(depth)));
}

// ═══════════════════════════════════════════════════════════════════════════
// INVERSE REGISTRY STATE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create an inverse cell from a standard cell
 */
export function createInverseCell(standardCell) {
  return {
    row: -standardCell.row,
    col: -standardCell.col,
    hexagram: 63 - standardCell.hexagram,  // Inverse hexagram (0↔63)
    language: INVERSE_CONFIG.GRID_SIZE - 1 - (standardCell.col % INVERSE_CONFIG.GRID_SIZE),
    isInverse: true,
  };
}

/**
 * Generate the full inverse grid (81 anti-cells)
 */
export function generateInverseGrid() {
  const grid = [];
  
  for (let row = 0; row < INVERSE_CONFIG.GRID_SIZE; row++) {
    const rowData = [];
    for (let col = 0; col < INVERSE_CONFIG.GRID_SIZE; col++) {
      const standardCell = {
        row,
        col,
        hexagram: (row * 9 + col) % 64,
        isInverse: false,
      };
      
      rowData.push({
        standard: standardCell,
        inverse: createInverseCell(standardCell),
      });
    }
    grid.push(rowData);
  }
  
  return grid;
}

/**
 * The Singularity cell (0,0) - exists in both spaces
 */
export const SINGULARITY_CELL = {
  row: 0,
  col: 0,
  hexagram: 0,  // Hexagram 1 (Qián - The Creative)
  antiHexagram: 63,  // Hexagram 64 (Wèi Jì - Before Completion)
  isSingularity: true,
  description: 'The point where Matter and Void intersect',
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Config
  INVERSE_CONFIG,
  DEPTH_COLORS,
  SINGULARITY_CELL,
  
  // INV-02: Gravity
  calculateInverseGravity,
  isSourceState,
  calculateGravityTension,
  getDominantLattice,
  
  // INV-03: Parity/Anti-Address
  generateAntiAddress,
  xorAddresses,
  isSymmetricIntersection,
  calculateParity,
  
  // INV-04: Tesseract Gate
  isTesseractGateOpen,
  calculateTesseractCoordinates,
  
  // INV-05: Haptics
  calculateInverseHaptic,
  getHapticFrequency,
  generateInverseHapticPattern,
  
  // INV-06: Colors
  invertColor,
  getDepthColor,
  calculateTensionGradient,
  
  // INV-08: Safety
  validateAddress,
  safeDivide,
  clampDepth,
  
  // Grid generation
  createInverseCell,
  generateInverseGrid,
};
