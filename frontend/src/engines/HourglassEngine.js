/**
 * THE ENLIGHTENMENT CAFE: HOURGLASS ENGINE
 * Architecture: Double-Cone with Inverted Output
 * 
 * THE GEOMETRY:
 * ▼ TOP CONE (Wide Base): Infinite Inputs — mood, frequency, game stats, wellness
 *   ↓ TAPER: Golden Ratio compression (φ = 0.618)
 *     • APEX (Singular Point): One source of truth
 *   ↓ INVERSE: Hyperbolic expansion (tanh)
 * ▲ BOTTOM CONE (Wide Output): Sovereign Choices — paths, recommendations, environments
 * 
 * THE MULTIPLICATION:
 * infinity^infinity → inverse → singular seed → expanded choices
 */

import { useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS: THE GEOMETRIC RATIOS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 0.6180339887498949; // Golden Ratio (inverse)

// Mood to frequency mapping (vibrational values)
const MOOD_FREQUENCIES = {
  serene: 7.83,      // Schumann resonance
  focused: 14.0,     // Alpha-Beta boundary
  creative: 10.0,    // Alpha peak
  energized: 20.0,   // Beta
  meditative: 4.0,   // Theta
  transcendent: 40.0, // Gamma
  grounded: 1.0,     // Delta
  neutral: 8.0,      // Low Alpha
};

// Environment mappings
const ENVIRONMENTS = {
  crystal: 'Crystal Sanctuary',
  mineral: 'Mineral Deep',
  void: 'Void Expanse',
  jade: 'Jade Garden',
  cosmic: 'Cosmic Observatory',
  quantum: 'Quantum Field',
};

const CAFE_RECOMMENDATIONS = {
  high: '100% Kona Pour-over',
  medium: 'Kau Dark Roast',
  low: 'Decaf Blend',
  void: 'Black Void Espresso',
};

// ═══════════════════════════════════════════════════════════════════════════
// THE HOURGLASS ENGINE: SINGLETON APEX
// ═══════════════════════════════════════════════════════════════════════════

class HourglassEngine {
  static instance = null;
  
  constructor() {
    this.apexState = {
      singularSeed: 0,
      infinityProduct: 1,
      inverseValue: 0,
      timestamp: Date.now(),
      cycleCount: 0,
    };
    this.subscribers = new Set();
    console.log('[HourglassEngine] Apex initialized — the singular point of truth');
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // THE APEX: Singleton access point
  // ─────────────────────────────────────────────────────────────────────────
  
  static getApex() {
    if (!HourglassEngine.instance) {
      HourglassEngine.instance = new HourglassEngine();
    }
    return HourglassEngine.instance;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: THE TOP CONE — Ingest infinite possibilities
  // ─────────────────────────────────────────────────────────────────────────
  
  ingestInfinite(input) {
    const { userMood, vibrationalFrequency, gameStats, wellnessData, depthLevel = 0 } = input;
    
    // Get base frequency from mood
    const moodFreq = MOOD_FREQUENCIES[userMood?.toLowerCase()] || MOOD_FREQUENCIES.neutral;
    
    // Calculate game stat influence
    const gameInfluence = Object.values(gameStats || {}).reduce((acc, val) => {
      return acc + (typeof val === 'number' ? val * 0.01 : 0);
    }, 0);
    
    // Calculate wellness influence
    const wellnessInfluence = typeof wellnessData === 'number' 
      ? wellnessData 
      : (wellnessData?.score || wellnessData?.energy || 1);
    
    // THE MULTIPLICATION: infinity^infinity
    const infinityProduct = Math.pow(
      (moodFreq + (vibrationalFrequency || 0) + gameInfluence + wellnessInfluence),
      Math.max(1, depthLevel + 1)
    );
    
    console.log(`[HourglassEngine] Top Cone ingested: ${infinityProduct.toFixed(4)} (∞^∞ product)`);
    
    return infinityProduct;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: THE TAPER — Compress to singular seed using Golden Ratio
  // ─────────────────────────────────────────────────────────────────────────
  
  processToSeed(infinityProduct) {
    console.log('[HourglassEngine] Tapering infinite possibilities into singular frequency...');
    
    // Apply Golden Ratio compression
    const goldenCompressed = infinityProduct * PHI;
    
    // Normalize using natural log to handle extreme values
    const normalized = Math.log1p(goldenCompressed);
    
    // Final seed value
    const seed = normalized * PHI;
    
    console.log(`[HourglassEngine] Singular Seed: ${seed.toFixed(6)}`);
    
    return seed;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3: THE INVERSE — Apply hyperbolic tangent for bounded infinity
  // ─────────────────────────────────────────────────────────────────────────
  
  applyInverse(seed) {
    // tanh(x) maps any real number to (-1, 1)
    const hyperbolicInverse = Math.tanh(seed);
    
    // Scale back to useful range [0, 10]
    const scaledInverse = (hyperbolicInverse + 1) * 5;
    
    console.log(`[HourglassEngine] Inverse applied: ${scaledInverse.toFixed(4)} (tanh bounded)`);
    
    return scaledInverse;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4: THE BOTTOM CONE — Expand to sovereign choices
  // ─────────────────────────────────────────────────────────────────────────
  
  expandToChoices(seed, inverseValue, input) {
    console.log('[HourglassEngine] Inversing the cone: Generating sovereign user options...');
    
    const { isVoidMode = false, depthLevel = 0 } = input;
    
    // Meditation path based on seed frequency
    const meditationPath = seed > 5 
      ? `Frequency_Alpha_${seed.toFixed(2)}` 
      : `Frequency_Theta_${seed.toFixed(2)}`;
    
    // Cafe recommendation based on inverse value
    let cafeRecommendation;
    if (isVoidMode) {
      cafeRecommendation = CAFE_RECOMMENDATIONS.void;
    } else if (inverseValue > 7) {
      cafeRecommendation = CAFE_RECOMMENDATIONS.high;
    } else if (inverseValue > 4) {
      cafeRecommendation = CAFE_RECOMMENDATIONS.medium;
    } else {
      cafeRecommendation = CAFE_RECOMMENDATIONS.low;
    }
    
    // Game environment based on depth and mode
    let gameEnvironment;
    if (isVoidMode) {
      gameEnvironment = ENVIRONMENTS.void;
    } else if (depthLevel >= 4) {
      gameEnvironment = ENVIRONMENTS.quantum;
    } else if (depthLevel >= 2) {
      gameEnvironment = ENVIRONMENTS.cosmic;
    } else if (seed > 5) {
      gameEnvironment = ENVIRONMENTS.crystal;
    } else {
      gameEnvironment = ENVIRONMENTS.mineral;
    }
    
    // UI aesthetic — always sovereign
    const uiAesthetic = isVoidMode 
      ? 'Void_Sovereign_Amethyst'
      : 'Minimalist_Sovereign_Gold';
    
    // Generate expanded paths (bottom cone widens)
    const expandedPaths = this.generateExpandedPaths(seed, inverseValue, depthLevel);
    
    return {
      meditationPath,
      cafeRecommendation,
      gameEnvironment,
      uiAesthetic,
      frequencySeed: seed,
      expandedPaths,
      inverseMagnitude: inverseValue,
    };
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // HELPER: Generate expanded paths from seed
  // ─────────────────────────────────────────────────────────────────────────
  
  generateExpandedPaths(seed, inverse, depth) {
    const paths = [];
    
    // Number of paths expands with depth (cone widening)
    const pathCount = Math.min(9, Math.floor(seed) + depth);
    
    for (let i = 0; i < pathCount; i++) {
      const pathSeed = (seed * PHI * (i + 1)) % 64;
      const pathType = i % 3 === 0 ? 'Meditation' : i % 3 === 1 ? 'Practice' : 'Insight';
      paths.push(`${pathType}_${pathSeed.toFixed(0)}_L${depth}`);
    }
    
    return paths;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // MAIN CYCLE: Execute the full hourglass flow
  // ─────────────────────────────────────────────────────────────────────────
  
  executeCycle(input) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('[HourglassEngine] EXECUTING HOURGLASS CYCLE');
    console.log('═══════════════════════════════════════════════════════════');
    
    // Step A: Ingest (Top Cone — infinite inputs)
    const infinityProduct = this.ingestInfinite(input);
    
    // Step B: Compress (The Taper — Golden Ratio)
    const singularSeed = this.processToSeed(infinityProduct);
    
    // Step C: The Apex (singular point of truth)
    const inverseValue = this.applyInverse(singularSeed);
    
    // Step D: Expand (Bottom Cone — sovereign choices)
    const choices = this.expandToChoices(singularSeed, inverseValue, input);
    
    // Update apex state
    this.apexState = {
      singularSeed,
      infinityProduct,
      inverseValue,
      timestamp: Date.now(),
      cycleCount: this.apexState.cycleCount + 1,
    };
    
    // Notify subscribers
    this.notifySubscribers();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('[HourglassEngine] CYCLE COMPLETE — Sovereign choices generated');
    console.log('═══════════════════════════════════════════════════════════');
    
    return choices;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // STATE ACCESS
  // ─────────────────────────────────────────────────────────────────────────
  
  getApexState() {
    return { ...this.apexState };
  }
  
  getSingularSeed() {
    return this.apexState.singularSeed;
  }
  
  getCycleCount() {
    return this.apexState.cycleCount;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION (Observer pattern for React integration)
  // ─────────────────────────────────────────────────────────────────────────
  
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  
  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.apexState));
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // RESET (For testing / new sessions)
  // ─────────────────────────────────────────────────────────────────────────
  
  reset() {
    this.apexState = {
      singularSeed: 0,
      infinityProduct: 1,
      inverseValue: 0,
      timestamp: Date.now(),
      cycleCount: 0,
    };
    this.notifySubscribers();
    console.log('[HourglassEngine] Apex reset to origin');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK: useHourglass
// ═══════════════════════════════════════════════════════════════════════════

export function useHourglass() {
  const engine = HourglassEngine.getApex();
  const [apexState, setApexState] = useState(engine.getApexState());
  
  useEffect(() => {
    return engine.subscribe(setApexState);
  }, [engine]);
  
  const executeCycle = useCallback((input) => {
    return engine.executeCycle(input);
  }, [engine]);
  
  const reset = useCallback(() => {
    engine.reset();
  }, [engine]);
  
  return {
    apexState,
    singularSeed: apexState.singularSeed,
    inverseValue: apexState.inverseValue,
    cycleCount: apexState.cycleCount,
    executeCycle,
    reset,
    engine,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export { HourglassEngine };
export default HourglassEngine;
