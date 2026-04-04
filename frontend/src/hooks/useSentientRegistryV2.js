/**
 * SentientRegistry_v2.js — The Nervous System for the 9×9 Lattice
 * 
 * BEHAVIORAL MEMORY UPGRADE
 * 
 * The Registry now tracks user's journey through the coordinate space:
 * - Frequently visited coordinates "harden" (smoother flicker, melodic haptics)
 * - Rarely visited coordinates stay "wild" (chaotic flicker, sharp haptics)
 * - Creates a PERSONALIZED TOPOGRAPHY unique to each user
 * 
 * RECURSIVE DIVE (36-BIT SCALE)
 * 
 * When hitting the 9th state edge, the entire 9×9 grid nests into a single cell
 * of a new meta-grid, allowing infinite depth exploration.
 * 
 * EXPANDED ANOMALY SYSTEM
 * 
 * - Language Bleed: Overlapping text between gravity positions
 * - Ghosting: Breadcrumb trail of last 3 positions
 * - Haptic Pitch-Shifting: Bass→shimmer as depth increases
 * - Coordinate Resonance: Familiar paths trigger harmonic feedback
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { HEXAGRAM_SEQUENCE, HEXAGRAM_REGISTRY } from '../config/hexagramRegistry';
import { LANGUAGE_REGISTRY, LANGUAGE_HEXAGRAM_MAP } from '../config/languageRegistry';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COORDINATE SYSTEM: Language × Hexagram × Depth = 9×9×∞ lattice
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// The 9 languages indexed
const LANGUAGE_KEYS = ['en', 'es', 'ja', 'zh-cmn', 'zh-yue', 'sa', 'hi', 'lkt', 'dak'];

// Create coordinate key
function createCoordinateKey(langCode, hexNumber, depthLevel = 0) {
  return `${langCode}:${hexNumber}:${depthLevel}`;
}

// Parse coordinate key
function parseCoordinateKey(key) {
  const [langCode, hexNumber, depthLevel] = key.split(':');
  return { langCode, hexNumber: parseInt(hexNumber), depthLevel: parseInt(depthLevel) };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BEHAVIORAL MEMORY — Coordinate Visit Tracking
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VISIT_DECAY_RATE = 0.95; // Memory fades over time
const HARDENING_THRESHOLD = 5; // Visits needed to "harden" a path
const MAX_VISIT_COUNT = 20; // Cap to prevent overflow

// Stability levels based on visit frequency
export const STABILITY_LEVELS = {
  WILD: { min: 0, max: 2, flickerMultiplier: 1.5, hapticStyle: 'chaotic' },
  FORMING: { min: 3, max: 5, flickerMultiplier: 1.2, hapticStyle: 'rhythmic' },
  STABLE: { min: 6, max: 10, flickerMultiplier: 1.0, hapticStyle: 'smooth' },
  HARDENED: { min: 11, max: 15, flickerMultiplier: 0.8, hapticStyle: 'melodic' },
  CRYSTALLIZED: { min: 16, max: MAX_VISIT_COUNT, flickerMultiplier: 0.6, hapticStyle: 'harmonic' },
};

function getStabilityLevel(visitCount) {
  for (const [level, config] of Object.entries(STABILITY_LEVELS)) {
    if (visitCount >= config.min && visitCount <= config.max) {
      return { level, ...config };
    }
  }
  return { level: 'CRYSTALLIZED', ...STABILITY_LEVELS.CRYSTALLIZED };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GHOSTING — Breadcrumb Trail
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MAX_BREADCRUMBS = 5; // Track last 5 positions

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HAPTIC PITCH-SHIFTING — Depth-based frequency scaling
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HAPTIC_DEPTH_PROFILES = {
  0: { name: 'Foundation', baseMs: 50, pattern: [50, 30, 50], character: 'bass_thrum' },
  1: { name: 'Earth', baseMs: 40, pattern: [40, 25, 40, 25, 40], character: 'deep_pulse' },
  2: { name: 'Stone', baseMs: 30, pattern: [30, 20, 30, 20, 30, 20], character: 'mid_rumble' },
  3: { name: 'Water', baseMs: 20, pattern: [20, 15, 20, 15, 20, 15, 20], character: 'flowing' },
  4: { name: 'Air', baseMs: 12, pattern: [12, 8, 12, 8, 12, 8, 12, 8], character: 'light_tap' },
  5: { name: 'Light', baseMs: 6, pattern: [6, 4, 6, 4, 6, 4, 6, 4, 8], character: 'shimmer' },
};

function getDepthHapticPattern(depthLevel) {
  const clamped = Math.min(5, Math.max(0, depthLevel));
  return HAPTIC_DEPTH_PROFILES[clamped];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPANDED ANOMALY POOL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const EXPANDED_ANOMALIES = {
  // Original anomalies
  LANGUAGE_BLEED: {
    id: 'language_bleed',
    name: 'Language Bleed',
    description: 'Text from two languages overlaps at gravity boundaries',
    weight: 18,
    minStability: 'WILD',
    duration: [800, 2500],
    visual: 'overlay',
  },
  GHOSTING: {
    id: 'ghosting',
    name: 'Ghosting',
    description: 'Breadcrumb trail of previous positions becomes visible',
    weight: 15,
    minStability: 'FORMING',
    duration: [2000, 5000],
    visual: 'trail',
  },
  HAPTIC_SHIFT: {
    id: 'haptic_shift',
    name: 'Haptic Pitch-Shift',
    description: 'Sudden frequency shift in haptic feedback',
    weight: 12,
    minStability: 'WILD',
    duration: [500, 1500],
    visual: 'none',
  },
  COORDINATE_RESONANCE: {
    id: 'coordinate_resonance',
    name: 'Coordinate Resonance',
    description: 'Familiar path triggers harmonic audio feedback',
    weight: 10,
    minStability: 'STABLE',
    duration: [1500, 4000],
    visual: 'glow',
  },
  HEXAGRAM_MUTATION: {
    id: 'hexagram_mutation',
    name: 'Hexagram Mutation',
    description: 'A random line toggles spontaneously',
    weight: 14,
    minStability: 'WILD',
    duration: [100, 500],
    visual: 'flash',
  },
  TEMPORAL_STUTTER: {
    id: 'temporal_stutter',
    name: 'Temporal Stutter',
    description: 'Flicker rate shifts dramatically',
    weight: 16,
    minStability: 'FORMING',
    duration: [300, 1500],
    rateMultiplier: [0.3, 3],
    visual: 'none',
  },
  VOID_WHISPER: {
    id: 'void_whisper',
    name: 'Void Whisper',
    description: 'Moment of complete silence and darkness',
    weight: 6,
    minStability: 'STABLE',
    duration: [500, 1500],
    visual: 'blackout',
  },
  CONVERGENCE: {
    id: 'convergence',
    name: 'Convergence',
    description: 'All 9 hexagrams flash simultaneously',
    weight: 4,
    minStability: 'HARDENED',
    duration: [100, 300],
    visual: 'flash_all',
  },
  META_NEST: {
    id: 'meta_nest',
    name: 'Meta-Nest Vision',
    description: 'Brief glimpse of the recursive depth structure',
    weight: 3,
    minStability: 'CRYSTALLIZED',
    duration: [1000, 2500],
    visual: 'fractal',
  },
  PATH_ECHO: {
    id: 'path_echo',
    name: 'Path Echo',
    description: 'Audio from a previously visited coordinate plays faintly',
    weight: 8,
    minStability: 'FORMING',
    duration: [1200, 3000],
    visual: 'none',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RITUAL CYCLE — Auto-animated prayer wheel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const RITUAL_CYCLE_CONFIG = {
  // Duration per hexagram state (ms)
  stateDuration: 3000,
  
  // Transition style
  transitionDuration: 500,
  
  // The sequence follows descent-and-return
  sequence: HEXAGRAM_SEQUENCE, // [1, 12, 15, 29, 2, 11, 64, 63, 30]
  
  // Auto-pause at Source State (Hexagram 63)
  pauseAtSource: true,
  sourcePauseDuration: 6000,
  
  // Haptic pulse between states
  transitionHaptic: [20, 30, 20],
  
  // Audio: Frequency glide between hexagram base frequencies
  audioGlide: true,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN HOOK: useSentientRegistryV2
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useSentientRegistryV2(options = {}) {
  const {
    gravity = 0.5,
    currentLanguage = 'en',
    currentHexagram = 63,
    depthLevel = 0,
    isAtZeroPoint = false,
    isVoid = false,
    onAnomaly = null,
  } = options;
  
  // ═══════════════════════════════════════════════════════════════════
  // COORDINATE MEMORY (Behavioral Tracking)
  // ═══════════════════════════════════════════════════════════════════
  
  // Visit counts per coordinate (persisted to localStorage)
  const [visitMemory, setVisitMemory] = useState(() => {
    try {
      const saved = localStorage.getItem('cosmic_visit_memory');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  // Breadcrumb trail (last N positions)
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  // Current coordinate
  const currentCoordinate = useMemo(() => {
    return createCoordinateKey(currentLanguage, currentHexagram, depthLevel);
  }, [currentLanguage, currentHexagram, depthLevel]);
  
  // Current stability level
  const currentStability = useMemo(() => {
    const visits = visitMemory[currentCoordinate] || 0;
    return getStabilityLevel(visits);
  }, [visitMemory, currentCoordinate]);
  
  // Track visit when coordinate changes
  const lastCoordinateRef = useRef(currentCoordinate);
  
  useEffect(() => {
    if (currentCoordinate !== lastCoordinateRef.current && !isVoid) {
      // Record visit
      setVisitMemory(prev => {
        const newMemory = { ...prev };
        const current = newMemory[currentCoordinate] || 0;
        newMemory[currentCoordinate] = Math.min(MAX_VISIT_COUNT, current + 1);
        
        // Persist to localStorage
        try {
          localStorage.setItem('cosmic_visit_memory', JSON.stringify(newMemory));
        } catch {}
        
        return newMemory;
      });
      
      // Add to breadcrumbs
      setBreadcrumbs(prev => {
        const newCrumbs = [
          ...prev.slice(-(MAX_BREADCRUMBS - 1)),
          {
            coordinate: lastCoordinateRef.current,
            timestamp: Date.now(),
            gravity,
          }
        ];
        return newCrumbs;
      });
      
      lastCoordinateRef.current = currentCoordinate;
    }
  }, [currentCoordinate, isVoid, gravity]);
  
  // ═══════════════════════════════════════════════════════════════════
  // HAPTIC DEPTH SHIFTING
  // ═══════════════════════════════════════════════════════════════════
  
  const depthHapticProfile = useMemo(() => {
    return getDepthHapticPattern(depthLevel);
  }, [depthLevel]);
  
  // Fire depth-appropriate haptic
  const fireDepthHaptic = useCallback(() => {
    if (!navigator.vibrate) return;
    
    const profile = getDepthHapticPattern(depthLevel);
    
    // Modify pattern based on stability
    const stabilityMultiplier = currentStability.flickerMultiplier;
    const adjustedPattern = profile.pattern.map(ms => 
      Math.round(ms * stabilityMultiplier)
    );
    
    navigator.vibrate(adjustedPattern);
  }, [depthLevel, currentStability]);
  
  // ═══════════════════════════════════════════════════════════════════
  // ANOMALY SYSTEM (Expanded)
  // ═══════════════════════════════════════════════════════════════════
  
  const [activeAnomaly, setActiveAnomaly] = useState(null);
  const [anomalyHistory, setAnomalyHistory] = useState([]);
  const anomalyTimeoutRef = useRef(null);
  
  // Get available anomalies based on current stability
  const availableAnomalies = useMemo(() => {
    const stabilityOrder = Object.keys(STABILITY_LEVELS);
    const currentIndex = stabilityOrder.indexOf(currentStability.level);
    
    return Object.entries(EXPANDED_ANOMALIES)
      .filter(([_, anomaly]) => {
        const minIndex = stabilityOrder.indexOf(anomaly.minStability);
        return currentIndex >= minIndex;
      })
      .map(([id, anomaly]) => ({ id, ...anomaly }));
  }, [currentStability]);
  
  // Select random anomaly (weighted)
  const selectAnomaly = useCallback(() => {
    if (availableAnomalies.length === 0) return null;
    
    const totalWeight = availableAnomalies.reduce((sum, a) => sum + a.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const anomaly of availableAnomalies) {
      random -= anomaly.weight;
      if (random <= 0) return anomaly;
    }
    
    return availableAnomalies[0];
  }, [availableAnomalies]);
  
  // Trigger anomaly
  const triggerAnomaly = useCallback((anomaly) => {
    if (!anomaly) return;
    
    const [minDur, maxDur] = anomaly.duration;
    const duration = minDur + Math.random() * (maxDur - minDur);
    
    const activeAnomalyData = {
      ...anomaly,
      startTime: Date.now(),
      duration,
      coordinate: currentCoordinate,
      stability: currentStability.level,
      rateMultiplier: anomaly.rateMultiplier 
        ? anomaly.rateMultiplier[0] + Math.random() * (anomaly.rateMultiplier[1] - anomaly.rateMultiplier[0])
        : 1,
    };
    
    setActiveAnomaly(activeAnomalyData);
    setAnomalyHistory(prev => [...prev.slice(-29), activeAnomalyData]);
    
    if (onAnomaly) {
      onAnomaly(activeAnomalyData);
    }
    
    // Haptic feedback varies by anomaly
    fireAnomalyHaptic(anomaly.id);
    
    // Clear after duration
    if (anomalyTimeoutRef.current) {
      clearTimeout(anomalyTimeoutRef.current);
    }
    anomalyTimeoutRef.current = setTimeout(() => {
      setActiveAnomaly(null);
    }, duration);
    
  }, [currentCoordinate, currentStability, onAnomaly]);
  
  // Anomaly-specific haptics
  const fireAnomalyHaptic = useCallback((anomalyId) => {
    if (!navigator.vibrate) return;
    
    const patterns = {
      language_bleed: [10, 5, 10, 5, 30],
      ghosting: [5, 20, 5, 20, 5],
      haptic_shift: [50, 10, 20, 10, 50],
      coordinate_resonance: [30, 20, 30, 20, 30, 20, 50],
      hexagram_mutation: [15, 5, 15],
      temporal_stutter: [5, 5, 5, 5, 5, 5, 5, 5],
      void_whisper: [5],
      convergence: [20, 10, 20, 10, 20, 10, 40],
      meta_nest: [10, 10, 20, 10, 30, 10, 40],
      path_echo: [15, 30, 15],
    };
    
    navigator.vibrate(patterns[anomalyId] || [15, 10, 15]);
  }, []);
  
  // ═══════════════════════════════════════════════════════════════════
  // RITUAL CYCLE (Auto-animated prayer wheel)
  // ═══════════════════════════════════════════════════════════════════
  
  const [ritualActive, setRitualActive] = useState(false);
  const [ritualIndex, setRitualIndex] = useState(0);
  const [ritualPaused, setRitualPaused] = useState(false);
  const ritualIntervalRef = useRef(null);
  
  const currentRitualHexagram = useMemo(() => {
    if (!ritualActive) return null;
    const hexNum = RITUAL_CYCLE_CONFIG.sequence[ritualIndex];
    return HEXAGRAM_REGISTRY[hexNum];
  }, [ritualActive, ritualIndex]);
  
  // Start ritual cycle
  const startRitualCycle = useCallback(() => {
    setRitualActive(true);
    setRitualIndex(0);
    setRitualPaused(false);
    
    // Haptic start signal
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 100]);
    }
  }, []);
  
  // Stop ritual cycle
  const stopRitualCycle = useCallback(() => {
    setRitualActive(false);
    setRitualIndex(0);
    setRitualPaused(false);
    
    if (ritualIntervalRef.current) {
      clearTimeout(ritualIntervalRef.current);
      ritualIntervalRef.current = null;
    }
  }, []);
  
  // Ritual cycle loop
  useEffect(() => {
    if (!ritualActive || ritualPaused) return;
    
    const { sequence, stateDuration, pauseAtSource, sourcePauseDuration, transitionHaptic } = RITUAL_CYCLE_CONFIG;
    
    const advanceRitual = () => {
      setRitualIndex(prev => {
        const next = (prev + 1) % sequence.length;
        
        // Check if approaching Source State (Hexagram 63)
        const nextHex = sequence[next];
        if (nextHex === 63 && pauseAtSource) {
          setRitualPaused(true);
          
          // Auto-resume after pause
          setTimeout(() => {
            setRitualPaused(false);
          }, sourcePauseDuration);
        }
        
        // Transition haptic
        if (navigator.vibrate) {
          navigator.vibrate(transitionHaptic);
        }
        
        return next;
      });
    };
    
    ritualIntervalRef.current = setTimeout(advanceRitual, stateDuration);
    
    return () => {
      if (ritualIntervalRef.current) {
        clearTimeout(ritualIntervalRef.current);
      }
    };
  }, [ritualActive, ritualPaused, ritualIndex]);
  
  // ═══════════════════════════════════════════════════════════════════
  // MEMORY DECAY (Optional: call periodically to fade old memories)
  // ═══════════════════════════════════════════════════════════════════
  
  const decayMemory = useCallback(() => {
    setVisitMemory(prev => {
      const decayed = {};
      for (const [coord, visits] of Object.entries(prev)) {
        const newVisits = Math.floor(visits * VISIT_DECAY_RATE);
        if (newVisits > 0) {
          decayed[coord] = newVisits;
        }
      }
      
      try {
        localStorage.setItem('cosmic_visit_memory', JSON.stringify(decayed));
      } catch {}
      
      return decayed;
    });
  }, []);
  
  // Clear all memory
  const clearMemory = useCallback(() => {
    setVisitMemory({});
    setBreadcrumbs([]);
    try {
      localStorage.removeItem('cosmic_visit_memory');
    } catch {}
  }, []);
  
  // ═══════════════════════════════════════════════════════════════════
  // TOPOGRAPHY VISUALIZATION DATA
  // ═══════════════════════════════════════════════════════════════════
  
  // Generate 9x9 grid visualization data
  const topographyGrid = useMemo(() => {
    const grid = [];
    
    for (let langIdx = 0; langIdx < 9; langIdx++) {
      const row = [];
      for (let hexIdx = 0; hexIdx < 9; hexIdx++) {
        const langCode = LANGUAGE_KEYS[langIdx];
        const hexNum = HEXAGRAM_SEQUENCE[hexIdx];
        const coordKey = createCoordinateKey(langCode, hexNum, depthLevel);
        const visits = visitMemory[coordKey] || 0;
        const stability = getStabilityLevel(visits);
        
        row.push({
          langCode,
          hexNum,
          coordKey,
          visits,
          stability: stability.level,
          isCurrentPosition: coordKey === currentCoordinate,
        });
      }
      grid.push(row);
    }
    
    return grid;
  }, [visitMemory, currentCoordinate, depthLevel]);
  
  // ═══════════════════════════════════════════════════════════════════
  // RETURN VALUE
  // ═══════════════════════════════════════════════════════════════════
  
  return {
    // Coordinate & Memory
    currentCoordinate,
    visitMemory,
    currentVisits: visitMemory[currentCoordinate] || 0,
    
    // Stability
    currentStability,
    stabilityLevel: currentStability.level,
    flickerMultiplier: currentStability.flickerMultiplier,
    hapticStyle: currentStability.hapticStyle,
    
    // Breadcrumbs / Ghosting
    breadcrumbs,
    
    // Depth Haptics
    depthHapticProfile,
    fireDepthHaptic,
    
    // Anomalies
    activeAnomaly,
    anomalyHistory,
    availableAnomalies,
    selectAnomaly,
    triggerAnomaly,
    hasActiveAnomaly: !!activeAnomaly,
    
    // Ritual Cycle
    ritualActive,
    ritualIndex,
    ritualPaused,
    currentRitualHexagram,
    startRitualCycle,
    stopRitualCycle,
    ritualProgress: ritualActive ? (ritualIndex + 1) / HEXAGRAM_SEQUENCE.length : 0,
    
    // Topography
    topographyGrid,
    
    // Memory Management
    decayMemory,
    clearMemory,
    
    // Constants
    STABILITY_LEVELS,
    EXPANDED_ANOMALIES,
    HAPTIC_DEPTH_PROFILES,
    RITUAL_CYCLE_CONFIG,
  };
}

export default useSentientRegistryV2;
