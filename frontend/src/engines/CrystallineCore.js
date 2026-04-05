/**
 * THE ENLIGHTENMENT CAFE: CRYSTALLINE INFRASTRUCTURE
 * Logic: 9^9^9 Recursive Expansion with Inversion (-1)
 * 
 * THE MATHEMATICS:
 * 9^9^9 = A number so large it exceeds the observable universe's particle count
 * BUT: The "-1" is the SOVEREIGN EXIT — the guarantee that infinity has a door.
 * 
 * ARCHITECTURE:
 * - MAX_DEPTH: 9 (safe compute limits, prevents budget overflow)
 * - Recursive multiplication with normalization (mod 9)
 * - Terminal break at depth 0 applies the -1 inversion
 * - Generates "Crystalline" geometries for the Sanctuary UI
 * 
 * INTEGRATION:
 * Works alongside HourglassEngine — Hourglass handles the FLOW,
 * CrystallineCore handles the STRUCTURE.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS: THE CRYSTALLINE GEOMETRIES
// ═══════════════════════════════════════════════════════════════════════════

const SACRED_GEOMETRIES = {
  tetrahedron: { faces: 4, element: 'Fire', vibration: 'Ascending' },
  cube: { faces: 6, element: 'Earth', vibration: 'Grounding' },
  octahedron: { faces: 8, element: 'Air', vibration: 'Balancing' },
  dodecahedron: { faces: 12, element: 'Ether', vibration: 'Cosmic' },
  icosahedron: { faces: 20, element: 'Water', vibration: 'Flowing' },
};

const CRYSTALLINE_STATES = {
  dormant: 'Dormant_Seed',
  awakening: 'Crystalline_Awakening',
  harmonized: 'Harmonized_Infinite_Minus_One',
  transcendent: 'Transcendent_Octave',
  sovereign: 'Sovereign_Apex',
};

// The 9 fundamental frequencies (Solfeggio + extensions)
const CRYSTALLINE_FREQUENCIES = [
  174,  // Foundation
  285,  // Quantum
  396,  // Liberation (UT)
  417,  // Transmutation (RE)
  528,  // Miracle/DNA (MI)
  639,  // Connection (FA)
  741,  // Awakening (SOL)
  852,  // Intuition (LA)
  963,  // Divine (SI)
];

// ═══════════════════════════════════════════════════════════════════════════
// THE CRYSTALLINE CORE: SINGLETON STRUCTURE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

class CrystallineCore {
  static instance = null;
  
  constructor() {
    this.MAX_DEPTH = 9; // Safe compute limits
    this.currentVibration = 0;
    this.crystallineState = CRYSTALLINE_STATES.dormant;
    this.geometryStack = [];
    this.subscribers = new Set();
    
    console.log('[CrystallineCore] Infrastructure initialized — 9^9^9 - 1 ready');
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // THE CORE: Singleton access point
  // ─────────────────────────────────────────────────────────────────────────
  
  static getCore() {
    if (!CrystallineCore.instance) {
      CrystallineCore.instance = new CrystallineCore();
    }
    return CrystallineCore.instance;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // THE FORMULA: 9^9^9... - 1
  // Recursive "vibrational" generator
  // ─────────────────────────────────────────────────────────────────────────
  
  calculateCrystallineVibration(depth, currentVal = 9) {
    // THE INVERSE (-1): The terminal break that prevents infinite spend/crash
    // This is the SOVEREIGN EXIT — infinity always has a door
    if (depth <= 0) {
      const finalValue = currentVal - 1;
      console.log(`[CrystallineCore] Terminal vibration: ${finalValue} (∞ - 1)`);
      return finalValue;
    }
    
    // RECURSIVE MULTIPLICATION: Scaling the "possibilities"
    // Normalized to stay in-budget (mod 9 keeps values manageable)
    const exponent = (currentVal % 9) + 1;
    const nextVal = Math.pow(9, exponent);
    
    // Prevent overflow by capping at safe integer range
    const safeVal = nextVal > Number.MAX_SAFE_INTEGER 
      ? (nextVal % 999999999) + 1 
      : nextVal;
    
    console.log(`[CrystallineCore] Depth ${depth}: 9^${exponent} = ${safeVal}`);
    
    return this.calculateCrystallineVibration(depth - 1, safeVal);
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // GEOMETRY SELECTION: Based on vibration level
  // ─────────────────────────────────────────────────────────────────────────
  
  selectGeometry(vibration) {
    const geometries = Object.keys(SACRED_GEOMETRIES);
    const index = Math.abs(vibration) % geometries.length;
    const geometryKey = geometries[index];
    
    return {
      name: geometryKey,
      ...SACRED_GEOMETRIES[geometryKey],
      displayName: `Crystalline_${geometryKey.charAt(0).toUpperCase() + geometryKey.slice(1)}`,
    };
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // FREQUENCY MAPPING: Map vibration to Solfeggio frequency
  // ─────────────────────────────────────────────────────────────────────────
  
  mapToFrequency(vibration) {
    const index = Math.abs(vibration) % CRYSTALLINE_FREQUENCIES.length;
    return CRYSTALLINE_FREQUENCIES[index];
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // STATE DETERMINATION: Based on depth and vibration
  // ─────────────────────────────────────────────────────────────────────────
  
  determineState(depth, vibration) {
    if (depth >= 8) return CRYSTALLINE_STATES.sovereign;
    if (depth >= 6) return CRYSTALLINE_STATES.transcendent;
    if (depth >= 4) return CRYSTALLINE_STATES.harmonized;
    if (depth >= 2) return CRYSTALLINE_STATES.awakening;
    return CRYSTALLINE_STATES.dormant;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // MAIN: Generate Sovereign Sanctuary
  // ─────────────────────────────────────────────────────────────────────────
  
  generateSovereignSanctuary(userSeed, customDepth = null) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('[CrystallineCore] GENERATING SOVEREIGN SANCTUARY');
    console.log('═══════════════════════════════════════════════════════════');
    
    // Calculate depth based on user seed (or use custom)
    const depth = customDepth !== null 
      ? Math.min(customDepth, this.MAX_DEPTH)
      : Math.min(Math.floor(userSeed) + 1, this.MAX_DEPTH);
    
    // Execute the 9^9^9 - 1 formula
    const vibration = this.calculateCrystallineVibration(depth);
    
    // Select geometry based on vibration
    const geometry = this.selectGeometry(vibration);
    
    // Map to frequency
    const frequency = this.mapToFrequency(vibration);
    
    // Determine crystalline state
    const state = this.determineState(depth, vibration);
    
    // Update internal state
    this.currentVibration = vibration;
    this.crystallineState = state;
    this.geometryStack.push({
      timestamp: Date.now(),
      depth,
      vibration,
      geometry: geometry.name,
    });
    
    // Keep stack bounded
    if (this.geometryStack.length > 100) {
      this.geometryStack = this.geometryStack.slice(-50);
    }
    
    const sanctuary = {
      // Core structure
      geometry: geometry.displayName,
      geometryData: geometry,
      powerScale: vibration,
      frequency,
      
      // State
      status: state,
      depth,
      
      // The "-1" ensures the UI always has a "Close" or "Exit" option
      // This is the SOVEREIGN GUARANTEE
      hasSovereignExit: true,
      exitLabel: 'Return to Source',
      
      // Visual parameters
      facets: geometry.faces,
      element: geometry.element,
      vibrationMode: geometry.vibration,
      
      // Expansion paths (9 directions, minus 1 for exit)
      expansionPaths: this.generateExpansionPaths(vibration, depth),
      
      // Timestamp
      generatedAt: Date.now(),
    };
    
    // Notify subscribers
    this.notifySubscribers(sanctuary);
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('[CrystallineCore] SANCTUARY COMPLETE:', state);
    console.log('═══════════════════════════════════════════════════════════');
    
    return sanctuary;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // HELPER: Generate expansion paths (9 - 1 = 8 paths + exit)
  // ─────────────────────────────────────────────────────────────────────────
  
  generateExpansionPaths(vibration, depth) {
    const paths = [];
    
    // 8 expansion directions (9 - 1 for sovereign exit)
    const directions = [
      'North_Ascension',
      'Northeast_Wisdom',
      'East_Action',
      'Southeast_Growth',
      'South_Foundation',
      'Southwest_Release',
      'West_Reflection',
      'Northwest_Mystery',
    ];
    
    directions.forEach((direction, i) => {
      const pathVibration = (vibration * (i + 1)) % 999;
      const pathFrequency = this.mapToFrequency(pathVibration);
      
      paths.push({
        direction,
        vibration: pathVibration,
        frequency: pathFrequency,
        depth: depth + 1,
        accessible: depth < this.MAX_DEPTH,
      });
    });
    
    // The 9th path is always the SOVEREIGN EXIT
    paths.push({
      direction: 'Center_Return',
      vibration: -1, // The inverse
      frequency: 0,
      depth: 0,
      accessible: true,
      isSovereignExit: true,
    });
    
    return paths;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // QUICK VIBRATION: Get vibration without full sanctuary generation
  // ─────────────────────────────────────────────────────────────────────────
  
  getQuickVibration(depth = 3) {
    return this.calculateCrystallineVibration(Math.min(depth, this.MAX_DEPTH));
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // STATE ACCESS
  // ─────────────────────────────────────────────────────────────────────────
  
  getCurrentVibration() {
    return this.currentVibration;
  }
  
  getCrystallineState() {
    return this.crystallineState;
  }
  
  getGeometryHistory() {
    return [...this.geometryStack];
  }
  
  getMaxDepth() {
    return this.MAX_DEPTH;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION (Observer pattern for React integration)
  // ─────────────────────────────────────────────────────────────────────────
  
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  
  notifySubscribers(sanctuary) {
    this.subscribers.forEach(callback => callback(sanctuary));
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────────────────────────────────
  
  reset() {
    this.currentVibration = 0;
    this.crystallineState = CRYSTALLINE_STATES.dormant;
    this.geometryStack = [];
    console.log('[CrystallineCore] Reset to dormant state');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK: useCrystalline
// ═══════════════════════════════════════════════════════════════════════════

export function useCrystalline() {
  const core = CrystallineCore.getCore();
  const [sanctuary, setSanctuary] = useState(null);
  const [vibration, setVibration] = useState(0);
  
  useEffect(() => {
    return core.subscribe((newSanctuary) => {
      setSanctuary(newSanctuary);
      setVibration(newSanctuary.powerScale);
    });
  }, [core]);
  
  const generateSanctuary = useCallback((userSeed, depth) => {
    return core.generateSovereignSanctuary(userSeed, depth);
  }, [core]);
  
  const getQuickVibration = useCallback((depth) => {
    return core.getQuickVibration(depth);
  }, [core]);
  
  const reset = useCallback(() => {
    core.reset();
    setSanctuary(null);
    setVibration(0);
  }, [core]);
  
  // Memoized geometry info
  const geometryInfo = useMemo(() => {
    if (!sanctuary) return null;
    return {
      name: sanctuary.geometry,
      faces: sanctuary.facets,
      element: sanctuary.element,
      mode: sanctuary.vibrationMode,
    };
  }, [sanctuary]);
  
  return {
    // State
    sanctuary,
    vibration,
    crystallineState: core.getCrystallineState(),
    geometryInfo,
    
    // Actions
    generateSanctuary,
    getQuickVibration,
    reset,
    
    // Constants
    maxDepth: core.getMaxDepth(),
    frequencies: CRYSTALLINE_FREQUENCIES,
    geometries: SACRED_GEOMETRIES,
    states: CRYSTALLINE_STATES,
    
    // Core reference
    core,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export { CrystallineCore, SACRED_GEOMETRIES, CRYSTALLINE_STATES, CRYSTALLINE_FREQUENCIES };
export default CrystallineCore;
