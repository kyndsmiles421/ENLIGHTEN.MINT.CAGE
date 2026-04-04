/**
 * RDive36.js — The Recursive Dive Engine (36-Bit Address System)
 * 
 * PATENT SPECIFICATION: RDive-36
 * "A method for navigating infinite nested coordinate spaces using a 36-bit
 * binary address derived from sequential hexagram selections at each recursion depth."
 * 
 * GEOMETRY OF DATA:
 * - L0 (Surface): 9×9 = 81 states (The Enlightenment Cafe Home)
 * - L1 (Deep): 81×81 = 6,561 states
 * - L2 (Core): 6,561×81 = 531,441 states
 * - Total: 9^(2n) addressable states where n = recursion depth
 * 
 * 36-BIT ADDRESS FORMAT:
 * | L0 Hex (6-bit) | L0 Lang (4-bit) | L1 Hex (6-bit) | L1 Lang (4-bit) | ... |
 * Example: "101010|0011|001100|0101|111000|1000" = specific coordinate
 * 
 * ZOOM-SNATCH NAVIGATION:
 * - Gravity slider to 1.0 threshold triggers dive
 * - Current lattice collapses, selected coordinate expands
 * - Ghosting overlay preserves parent context
 * 
 * HAPTIC FREQUENCY SCALING:
 * - L0: 60Hz (Alert/Active)
 * - L1: 51Hz
 * - L2: 42Hz
 * - L3: 33Hz (Deep/Meditative)
 * - Formula: 60 - (9 * depth) Hz
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { HEXAGRAM_SEQUENCE, HEXAGRAM_REGISTRY } from '../config/hexagramRegistry';
import { LANGUAGE_REGISTRY } from '../config/languageRegistry';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const RDIVE_CONFIG = {
  // Recursion limits
  MAX_DEPTH: 6, // 6 levels = 36 bits
  BITS_PER_HEXAGRAM: 6,
  BITS_PER_LANGUAGE: 4,
  
  // Zoom-Snatch thresholds
  DIVE_THRESHOLD: 0.95, // Gravity > 0.95 triggers dive
  SURFACE_THRESHOLD: 0.05, // Gravity < 0.05 triggers surface
  SNATCH_DURATION: 800, // ms for zoom animation
  
  // Haptic frequency scaling
  BASE_HAPTIC_HZ: 60,
  HZ_DROP_PER_LEVEL: 9, // 60 → 51 → 42 → 33 → 24 → 15
  
  // Ghost overlay
  GHOST_OPACITY_DECAY: 0.3, // Each parent layer is 30% more faded
  MAX_GHOST_LAYERS: 3, // Show up to 3 parent ghosts
  
  // Lattice size
  LATTICE_SIZE: 9, // 9×9 grid per level
  TOTAL_CELLS: 81, // 9×9
};

// Language indices for 4-bit encoding
const LANGUAGE_INDICES = {
  'en': 0, 'es': 1, 'ja': 2, 'zh-cmn': 3, 'zh-yue': 4,
  'sa': 5, 'hi': 6, 'lkt': 7, 'dak': 8,
};
const INDEX_TO_LANGUAGE = Object.fromEntries(
  Object.entries(LANGUAGE_INDICES).map(([k, v]) => [v, k])
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 36-BIT ADDRESS ENCODING/DECODING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Encode a coordinate path into a 36-bit address string
 * @param {Array} path - Array of {hexagram: number, language: string} objects
 * @returns {string} 36-bit binary string with | separators
 */
export function encodeRDiveAddress(path) {
  const segments = path.map(({ hexagram, language }) => {
    // Get 6-bit hexagram value
    const hexBinary = hexagram.toString(2).padStart(6, '0');
    
    // Get 4-bit language index
    const langIndex = LANGUAGE_INDICES[language] ?? 0;
    const langBinary = langIndex.toString(2).padStart(4, '0');
    
    return `${hexBinary}${langBinary}`;
  });
  
  // Pad to 36 bits if needed
  while (segments.length < RDIVE_CONFIG.MAX_DEPTH) {
    segments.push('0000000000'); // 6 + 4 = 10 bits per level
  }
  
  return segments.join('|');
}

/**
 * Decode a 36-bit address string into coordinate path
 * @param {string} address - 36-bit binary string
 * @returns {Array} Path array with hexagram and language at each depth
 */
export function decodeRDiveAddress(address) {
  const segments = address.split('|').filter(s => s.length > 0);
  
  return segments.map(segment => {
    const hexBinary = segment.slice(0, 6);
    const langBinary = segment.slice(6, 10);
    
    const hexagram = parseInt(hexBinary, 2);
    const langIndex = parseInt(langBinary, 2);
    const language = INDEX_TO_LANGUAGE[langIndex] || 'en';
    
    return { hexagram, language };
  });
}

/**
 * Calculate total addressable states at given depth
 * Formula: 9^(2n) where n = depth
 */
export function calculateTotalStates(depth) {
  return Math.pow(9, 2 * depth);
}

/**
 * Get human-readable address
 */
export function formatAddress(path) {
  if (path.length === 0) return 'Surface';
  
  return path.map((coord, i) => {
    const hex = HEXAGRAM_REGISTRY[HEXAGRAM_SEQUENCE[coord.hexagram % 9]];
    return `${hex?.symbol || '☰'}${i + 1}`;
  }).join(' → ');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HAPTIC FREQUENCY SCALING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate haptic frequency for depth
 * L0: 60Hz, L1: 51Hz, L2: 42Hz, L3: 33Hz
 */
export function getHapticFrequency(depth) {
  const { BASE_HAPTIC_HZ, HZ_DROP_PER_LEVEL } = RDIVE_CONFIG;
  return Math.max(15, BASE_HAPTIC_HZ - (HZ_DROP_PER_LEVEL * depth));
}

/**
 * Generate haptic pattern for depth
 * Deeper = longer, slower pulses
 */
export function getDepthHapticPattern(depth) {
  const frequency = getHapticFrequency(depth);
  const periodMs = Math.round(1000 / frequency);
  const pulseCount = 3 + depth; // More pulses at deeper levels
  
  const pattern = [];
  for (let i = 0; i < pulseCount; i++) {
    pattern.push(periodMs); // Vibrate
    pattern.push(Math.round(periodMs / 2)); // Pause
  }
  
  return pattern;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GHOST LAYER CALCULATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get ghost layer data for parent levels
 */
export function getGhostLayers(currentDepth, path) {
  const { MAX_GHOST_LAYERS, GHOST_OPACITY_DECAY } = RDIVE_CONFIG;
  
  const ghosts = [];
  const startDepth = Math.max(0, currentDepth - MAX_GHOST_LAYERS);
  
  for (let d = startDepth; d < currentDepth; d++) {
    const distanceFromCurrent = currentDepth - d;
    const opacity = Math.pow(1 - GHOST_OPACITY_DECAY, distanceFromCurrent);
    
    const coord = path[d];
    if (coord) {
      const hexNum = HEXAGRAM_SEQUENCE[coord.hexagram % 9];
      const hex = HEXAGRAM_REGISTRY[hexNum];
      
      ghosts.push({
        depth: d,
        hexagram: hex,
        language: coord.language,
        opacity: Math.max(0.1, opacity),
        scale: 0.5 + (0.15 * distanceFromCurrent), // Farther = larger ghost
      });
    }
  }
  
  return ghosts.reverse(); // Closest parent first
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CRYSTALLINE SEED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Crystalline Seed — A cryptographic snapshot of a journey
 * Contains: 36-bit address + dwell history + timestamp
 */
export function mintCrystallineSeed(path, dwellHistory, userId = 'anonymous') {
  const address = encodeRDiveAddress(path);
  const timestamp = Date.now();
  
  // Create seed data
  const seed = {
    version: 'RDive36-v1',
    address,
    path: path.map(p => ({
      hex: p.hexagram,
      lang: p.language,
    })),
    depth: path.length,
    totalStates: calculateTotalStates(path.length),
    dwellHistory: dwellHistory.slice(-10), // Last 10 dwell entries
    minter: userId,
    timestamp,
    
    // Unique seed ID (hash of address + timestamp)
    seedId: generateSeedId(address, timestamp),
  };
  
  return seed;
}

/**
 * Generate unique seed ID
 */
function generateSeedId(address, timestamp) {
  // Simple hash for demo (production would use proper crypto)
  const combined = `${address}:${timestamp}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `SEED-${Math.abs(hash).toString(36).toUpperCase()}`;
}

/**
 * Validate a Crystalline Seed
 */
export function validateSeed(seed) {
  if (!seed || seed.version !== 'RDive36-v1') return false;
  if (!seed.address || !seed.seedId) return false;
  
  // Verify address decodes correctly
  try {
    const decoded = decodeRDiveAddress(seed.address);
    return decoded.length === seed.depth;
  } catch {
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN HOOK: useRDive36
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useRDive36(options = {}) {
  const {
    initialPath = [],
    onDive = null,
    onSurface = null,
    onMintSeed = null,
  } = options;
  
  // Current recursion state
  const [path, setPath] = useState(initialPath);
  const [currentDepth, setCurrentDepth] = useState(initialPath.length);
  const [selectedCell, setSelectedCell] = useState(null); // {row, col} in 9×9 grid
  
  // Zoom-Snatch animation state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomDirection, setZoomDirection] = useState(null); // 'dive' | 'surface'
  const [zoomProgress, setZoomProgress] = useState(0);
  
  // Dwell history for seeds
  const [dwellHistory, setDwellHistory] = useState([]);
  const dwellStartRef = useRef(Date.now());
  
  // Track dwell time at current position
  useEffect(() => {
    dwellStartRef.current = Date.now();
    
    return () => {
      const dwellTime = Date.now() - dwellStartRef.current;
      if (dwellTime > 1000) { // Only record if > 1s
        setDwellHistory(prev => [...prev.slice(-49), {
          depth: currentDepth,
          cell: selectedCell,
          dwellMs: dwellTime,
          timestamp: Date.now(),
        }]);
      }
    };
  }, [currentDepth, selectedCell]);
  
  // Current 36-bit address
  const address = useMemo(() => encodeRDiveAddress(path), [path]);
  
  // Human-readable address
  const formattedAddress = useMemo(() => formatAddress(path), [path]);
  
  // Ghost layers for parent context
  const ghostLayers = useMemo(() => 
    getGhostLayers(currentDepth, path), 
    [currentDepth, path]
  );
  
  // Haptic settings for current depth
  const hapticFrequency = useMemo(() => 
    getHapticFrequency(currentDepth), 
    [currentDepth]
  );
  const hapticPattern = useMemo(() => 
    getDepthHapticPattern(currentDepth), 
    [currentDepth]
  );
  
  // Total addressable states at current depth
  const totalStates = useMemo(() => 
    calculateTotalStates(currentDepth || 1), 
    [currentDepth]
  );
  
  // ═══════════════════════════════════════════════════════════════════
  // ZOOM-SNATCH DIVE
  // ═══════════════════════════════════════════════════════════════════
  
  const dive = useCallback((hexagram, language) => {
    if (isZooming || currentDepth >= RDIVE_CONFIG.MAX_DEPTH) return;
    
    setIsZooming(true);
    setZoomDirection('dive');
    setZoomProgress(0);
    
    // Fire dive haptic
    if (navigator.vibrate) {
      navigator.vibrate(hapticPattern);
    }
    
    // Animate zoom
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / RDIVE_CONFIG.SNATCH_DURATION);
      setZoomProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Complete dive
        const newCoord = { hexagram, language };
        setPath(prev => [...prev, newCoord]);
        setCurrentDepth(prev => prev + 1);
        setSelectedCell(null);
        setIsZooming(false);
        setZoomDirection(null);
        
        if (onDive) onDive(newCoord, currentDepth + 1);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isZooming, currentDepth, hapticPattern, onDive]);
  
  // ═══════════════════════════════════════════════════════════════════
  // SURFACE (GO UP ONE LEVEL)
  // ═══════════════════════════════════════════════════════════════════
  
  const surface = useCallback(() => {
    if (isZooming || currentDepth === 0) return;
    
    setIsZooming(true);
    setZoomDirection('surface');
    setZoomProgress(0);
    
    // Fire surface haptic (reverse pattern)
    if (navigator.vibrate) {
      navigator.vibrate([...hapticPattern].reverse());
    }
    
    // Animate zoom out
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / RDIVE_CONFIG.SNATCH_DURATION);
      setZoomProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Complete surface
        setPath(prev => prev.slice(0, -1));
        setCurrentDepth(prev => prev - 1);
        setSelectedCell(null);
        setIsZooming(false);
        setZoomDirection(null);
        
        if (onSurface) onSurface(currentDepth - 1);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isZooming, currentDepth, hapticPattern, onSurface]);
  
  // ═══════════════════════════════════════════════════════════════════
  // JUMP TO SPECIFIC DEPTH
  // ═══════════════════════════════════════════════════════════════════
  
  const jumpToDepth = useCallback((targetDepth) => {
    if (isZooming || targetDepth === currentDepth) return;
    if (targetDepth < 0 || targetDepth > path.length) return;
    
    // Truncate path to target depth
    setPath(prev => prev.slice(0, targetDepth));
    setCurrentDepth(targetDepth);
    setSelectedCell(null);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([20, 10, 20]);
    }
  }, [isZooming, currentDepth, path.length]);
  
  // ═══════════════════════════════════════════════════════════════════
  // EMERGENCY SURFACE (Instant reset to L0 - no animation)
  // Target: <250ms for "Void Collapse" emergency escape
  // ═══════════════════════════════════════════════════════════════════
  
  const emergencySurface = useCallback(() => {
    // Instant reset - no animation, no delays
    setIsZooming(false);
    setZoomDirection(null);
    setZoomProgress(0);
    setPath([]);
    setCurrentDepth(0);
    setSelectedCell(null);
    
    // Heavy haptic confirmation (emergency escape feedback)
    if (navigator.vibrate) {
      navigator.vibrate([100, 30, 100, 30, 150]);
    }
    
    // Callback
    if (onSurface) onSurface(0);
    
    console.log('[RDive36] EMERGENCY SURFACE: Returned to L0');
  }, [onSurface]);
  
  // ═══════════════════════════════════════════════════════════════════
  // MINT CRYSTALLINE SEED
  // ═══════════════════════════════════════════════════════════════════
  
  const mintSeed = useCallback(async (userId = 'anonymous') => {
    const seed = mintCrystallineSeed(path, dwellHistory, userId);
    
    // Save to localStorage
    try {
      const seeds = JSON.parse(localStorage.getItem('cosmic_seeds') || '[]');
      seeds.push(seed);
      localStorage.setItem('cosmic_seeds', JSON.stringify(seeds.slice(-100))); // Keep last 100
    } catch {}
    
    // Also save to backend API
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const backendPayload = {
        address_36bit: seed.address,
        path: path.map((p, i) => ({
          depth: i,
          hexagram_number: p.hexagram,
          language_code: p.language,
          row: Math.floor(p.hexagram / 9),
          col: p.hexagram % 9,
          dwell_time_ms: dwellHistory[i]?.dwellMs || 0,
        })),
        linguistic_state: path.length > 0 ? path[path.length - 1].language : 'en',
        dwell_history: dwellHistory.slice(-10).map(d => ({
          coordinate: `${d.cell?.row || 0}-${d.cell?.col || 0}`,
          visits: 1,
          total_dwell_ms: d.dwellMs || 0,
          stability: d.dwellMs > 30000 ? 'CRYSTALLIZED' : d.dwellMs > 15000 ? 'HARDENED' : d.dwellMs > 5000 ? 'STABLE' : 'FORMING',
        })),
        minter_id: userId,
        constellation_name: null,
      };
      
      await fetch(`${API_URL}/api/seeds/mint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload),
      });
      console.log('[RDive36] Seed saved to backend API');
    } catch (err) {
      console.warn('[RDive36] Failed to save seed to backend:', err);
    }
    
    if (onMintSeed) onMintSeed(seed);
    
    // Celebration haptic
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 100, 50, 150]);
    }
    
    return seed;
  }, [path, dwellHistory, onMintSeed]);
  
  // ═══════════════════════════════════════════════════════════════════
  // LOAD SEED (Navigate to a specific address)
  // ═══════════════════════════════════════════════════════════════════
  
  const loadSeed = useCallback((seed) => {
    if (!validateSeed(seed)) {
      console.error('Invalid seed');
      return false;
    }
    
    const decodedPath = decodeRDiveAddress(seed.address);
    setPath(decodedPath.slice(0, seed.depth));
    setCurrentDepth(seed.depth);
    setSelectedCell(null);
    
    // Arrival haptic
    if (navigator.vibrate) {
      navigator.vibrate(getDepthHapticPattern(seed.depth));
    }
    
    return true;
  }, []);
  
  // ═══════════════════════════════════════════════════════════════════
  // CELL SELECTION (for 9×9 grid)
  // ═══════════════════════════════════════════════════════════════════
  
  const selectGridCell = useCallback((row, col) => {
    setSelectedCell({ row, col });
    
    // Light tap haptic
    if (navigator.vibrate) {
      navigator.vibrate([10]);
    }
  }, []);
  
  // ═══════════════════════════════════════════════════════════════════
  // RETURN VALUE
  // ═══════════════════════════════════════════════════════════════════
  
  return {
    // State
    path,
    currentDepth,
    selectedCell,
    address,
    formattedAddress,
    
    // Zoom animation
    isZooming,
    zoomDirection,
    zoomProgress,
    
    // Ghosts
    ghostLayers,
    
    // Haptics
    hapticFrequency,
    hapticPattern,
    
    // Metrics
    totalStates,
    dwellHistory,
    
    // Actions
    dive,
    surface,
    jumpToDepth,
    emergencySurface, // <250ms reset for Void Collapse
    selectGridCell,
    
    // Seeds
    mintSeed,
    loadSeed,
    
    // Config
    RDIVE_CONFIG,
    MAX_DEPTH: RDIVE_CONFIG.MAX_DEPTH,
  };
}

export default useRDive36;
