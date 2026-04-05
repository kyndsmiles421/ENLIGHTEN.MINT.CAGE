/**
 * SOVEREIGN APEX: The Unified Control Point
 * 
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────┐
 * │                    SOVEREIGN APEX                       │
 * │         (The ONE controller that rules them all)        │
 * ├─────────────────────────────────────────────────────────┤
 * │                                                         │
 * │   ▼ HOURGLASS ENGINE          ◇ CRYSTALLINE CORE       │
 * │   (Flow & Transformation)     (Structure & Geometry)    │
 * │                                                         │
 * │   Inputs → Taper → Apex → Expand   9^9^9 - 1 Formula   │
 * │                                                         │
 * │   ════════════════════════════════════════════════════ │
 * │                                                         │
 * │              UNIFIED SOVEREIGN OUTPUT                   │
 * │   - Meditation Paths                                    │
 * │   - Crystalline Geometries                              │
 * │   - Game Environments                                   │
 * │   - UI Aesthetics                                       │
 * │   - Sovereign Exit (always guaranteed)                  │
 * │                                                         │
 * └─────────────────────────────────────────────────────────┘
 * 
 * PHILOSOPHY:
 * "The Cube provides structure (the room).
 *  The Inverted Triangle provides freedom (the choice).
 *  The Cone provides direction (the purpose)."
 * 
 * The Sovereign Apex IS all three — unified into a single point of truth.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { HourglassEngine } from './HourglassEngine';
import { CrystallineCore, SACRED_GEOMETRIES, CRYSTALLINE_STATES } from './CrystallineCore';

// ═══════════════════════════════════════════════════════════════════════════
// THE SOVEREIGN APEX: Unified Controller
// ═══════════════════════════════════════════════════════════════════════════

class SovereignApex {
  static instance = null;
  
  constructor() {
    // The two engines
    this.hourglass = HourglassEngine.getApex();
    this.crystalline = CrystallineCore.getCore();
    
    // Unified state
    this.sovereignState = {
      // From Hourglass
      singularSeed: 0,
      inverseValue: 0,
      sovereignChoices: null,
      
      // From Crystalline
      crystallineVibration: 0,
      sanctuary: null,
      geometry: null,
      
      // Unified
      harmonized: false,
      cycleCount: 0,
      lastExecution: null,
    };
    
    this.subscribers = new Set();
    
    console.log('[SovereignApex] Unified controller initialized');
    console.log('[SovereignApex] Hourglass + Crystalline = HARMONIZED');
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // SINGLETON ACCESS
  // ─────────────────────────────────────────────────────────────────────────
  
  static getInstance() {
    if (!SovereignApex.instance) {
      SovereignApex.instance = new SovereignApex();
    }
    return SovereignApex.instance;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // THE UNIFIED EXECUTION: Orchestrates both engines
  // ─────────────────────────────────────────────────────────────────────────
  
  execute(input) {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║           SOVEREIGN APEX: UNIFIED EXECUTION               ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    
    const {
      userMood = 'neutral',
      vibrationalFrequency = 5,
      gameStats = {},
      wellnessData = {},
      depthLevel = 0,
      hexagramAddress = '',
      isVoidMode = false,
      userSeed = 7.83,
    } = input;
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Execute Hourglass (Flow)
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log('\n[SovereignApex] Phase 1: Hourglass Flow...');
    
    const hourglassInput = {
      userMood,
      vibrationalFrequency,
      gameStats,
      wellnessData,
      depthLevel,
      hexagramAddress,
      isVoidMode,
    };
    
    const sovereignChoices = this.hourglass.executeCycle(hourglassInput);
    const hourglassState = this.hourglass.getApexState();
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Execute Crystalline (Structure)
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log('\n[SovereignApex] Phase 2: Crystalline Structure...');
    
    // Use the singular seed from Hourglass to inform Crystalline depth
    const crystallineDepth = Math.min(
      Math.floor(hourglassState.singularSeed) + depthLevel,
      this.crystalline.getMaxDepth()
    );
    
    const sanctuary = this.crystalline.generateSovereignSanctuary(
      userSeed * hourglassState.singularSeed,
      crystallineDepth
    );
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: Harmonize (Unify the outputs)
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log('\n[SovereignApex] Phase 3: Harmonization...');
    
    const unifiedOutput = this.harmonize(sovereignChoices, sanctuary, input);
    
    // Update sovereign state
    this.sovereignState = {
      singularSeed: hourglassState.singularSeed,
      inverseValue: hourglassState.inverseValue,
      sovereignChoices,
      crystallineVibration: sanctuary.powerScale,
      sanctuary,
      geometry: sanctuary.geometryData,
      harmonized: true,
      cycleCount: this.sovereignState.cycleCount + 1,
      lastExecution: Date.now(),
    };
    
    // Notify subscribers
    this.notifySubscribers(unifiedOutput);
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║           SOVEREIGN APEX: EXECUTION COMPLETE              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    return unifiedOutput;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // HARMONIZE: Merge Hourglass choices with Crystalline structure
  // ─────────────────────────────────────────────────────────────────────────
  
  harmonize(choices, sanctuary, input) {
    const { isVoidMode, depthLevel } = input;
    
    // The unified sovereign experience
    return {
      // ═══ FLOW (from Hourglass) ═══
      flow: {
        meditationPath: choices.meditationPath,
        cafeRecommendation: choices.cafeRecommendation,
        frequencySeed: choices.frequencySeed,
        expandedPaths: choices.expandedPaths,
        inverseMagnitude: choices.inverseMagnitude,
      },
      
      // ═══ STRUCTURE (from Crystalline) ═══
      structure: {
        geometry: sanctuary.geometry,
        geometryData: sanctuary.geometryData,
        powerScale: sanctuary.powerScale,
        frequency: sanctuary.frequency,
        facets: sanctuary.facets,
        element: sanctuary.element,
        vibrationMode: sanctuary.vibrationMode,
      },
      
      // ═══ ENVIRONMENT (Unified) ═══
      environment: {
        name: choices.gameEnvironment,
        aesthetic: choices.uiAesthetic,
        crystallineState: sanctuary.status,
        depth: depthLevel,
        isVoidMode,
      },
      
      // ═══ NAVIGATION (9 paths, always with exit) ═══
      navigation: {
        expansionPaths: sanctuary.expansionPaths,
        flowPaths: choices.expandedPaths,
        hasSovereignExit: true,
        exitPath: sanctuary.expansionPaths.find(p => p.isSovereignExit),
      },
      
      // ═══ SOVEREIGN GUARANTEE ═══
      sovereign: {
        hasExit: true,
        exitLabel: sanctuary.exitLabel,
        status: sanctuary.status,
        harmonized: true,
        formula: '9^9^9 - 1 = Infinite possibilities with guaranteed return',
      },
      
      // ═══ METRICS ═══
      metrics: {
        hourglassSeed: choices.frequencySeed,
        crystallineVibration: sanctuary.powerScale,
        harmonicRatio: choices.frequencySeed / (sanctuary.powerScale || 1),
        totalPaths: sanctuary.expansionPaths.length + choices.expandedPaths.length,
        depth: depthLevel,
      },
      
      // ═══ TIMESTAMP ═══
      generatedAt: Date.now(),
    };
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // QUICK ACCESS: Get current state without execution
  // ─────────────────────────────────────────────────────────────────────────
  
  getState() {
    return { ...this.sovereignState };
  }
  
  isHarmonized() {
    return this.sovereignState.harmonized;
  }
  
  getCycleCount() {
    return this.sovereignState.cycleCount;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // ENGINE ACCESS
  // ─────────────────────────────────────────────────────────────────────────
  
  getHourglass() {
    return this.hourglass;
  }
  
  getCrystalline() {
    return this.crystalline;
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION
  // ─────────────────────────────────────────────────────────────────────────
  
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  
  notifySubscribers(output) {
    this.subscribers.forEach(callback => callback(output));
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────────────────────────────────
  
  reset() {
    this.hourglass.reset();
    this.crystalline.reset();
    this.sovereignState = {
      singularSeed: 0,
      inverseValue: 0,
      sovereignChoices: null,
      crystallineVibration: 0,
      sanctuary: null,
      geometry: null,
      harmonized: false,
      cycleCount: 0,
      lastExecution: null,
    };
    console.log('[SovereignApex] Full reset complete');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK: useSovereignApex
// ═══════════════════════════════════════════════════════════════════════════

export function useSovereignApex() {
  const apex = SovereignApex.getInstance();
  const [output, setOutput] = useState(null);
  const [state, setState] = useState(apex.getState());
  
  useEffect(() => {
    return apex.subscribe((newOutput) => {
      setOutput(newOutput);
      setState(apex.getState());
    });
  }, [apex]);
  
  const execute = useCallback((input) => {
    return apex.execute(input);
  }, [apex]);
  
  const reset = useCallback(() => {
    apex.reset();
    setOutput(null);
    setState(apex.getState());
  }, [apex]);
  
  // Convenience accessors
  const flow = useMemo(() => output?.flow || null, [output]);
  const structure = useMemo(() => output?.structure || null, [output]);
  const environment = useMemo(() => output?.environment || null, [output]);
  const navigation = useMemo(() => output?.navigation || null, [output]);
  const sovereign = useMemo(() => output?.sovereign || null, [output]);
  
  return {
    // Full output
    output,
    
    // Parsed sections
    flow,
    structure,
    environment,
    navigation,
    sovereign,
    
    // State
    state,
    isHarmonized: state.harmonized,
    cycleCount: state.cycleCount,
    
    // Actions
    execute,
    reset,
    
    // Engine access
    hourglass: apex.getHourglass(),
    crystalline: apex.getCrystalline(),
    apex,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export { SovereignApex };
export default SovereignApex;
