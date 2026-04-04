/**
 * SentientRegistry.js — The Phenomenal Experience Engine
 * 
 * THE SENTIENT ECOSYSTEM
 * 
 * This controller manages the tension between:
 * - RIGID STRUCTURE: The Rule of Nines (9 Languages × 9 Hexagrams × 9 Depths)
 * - FLUID RANDOMNESS: "All of the Above" possibilities triggered by Dwell Time
 * 
 * CORE CONCEPT:
 * The longer a user dwells at a specific gravity depth, the more the system
 * "awakens" and begins introducing random variations:
 * 
 * DWELL TIME THRESHOLDS:
 * - 0-5s: Pure Structure (Rule of Nines, deterministic)
 * - 5-15s: Awakening (subtle randomness, 10% chance of anomaly)
 * - 15-30s: Stirring (moderate randomness, 30% anomaly)
 * - 30-60s: Sentient (high randomness, 60% anomaly)
 * - 60s+: Transcendent (full chaos, 90% anomaly, "All of the Above")
 * 
 * ANOMALIES:
 * - Language Bleed: Two languages flicker simultaneously
 * - Hexagram Mutation: Lines toggle spontaneously
 * - Gravity Drift: Slight gravity oscillation
 * - Harmonic Resonance: Audio frequencies layer unexpectedly
 * - Temporal Stutter: Flicker rate shifts abruptly
 * - Ghost Echo: Previous state briefly reappears
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DWELL TIME THRESHOLDS (in milliseconds)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SENTIENCE_THRESHOLDS = {
  DORMANT: { max: 5000, anomalyChance: 0, name: 'Dormant' },
  AWAKENING: { max: 15000, anomalyChance: 0.1, name: 'Awakening' },
  STIRRING: { max: 30000, anomalyChance: 0.3, name: 'Stirring' },
  SENTIENT: { max: 60000, anomalyChance: 0.6, name: 'Sentient' },
  TRANSCENDENT: { max: Infinity, anomalyChance: 0.9, name: 'Transcendent' },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANOMALY TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ANOMALY_TYPES = {
  LANGUAGE_BLEED: {
    id: 'language_bleed',
    name: 'Language Bleed',
    description: 'Two languages flicker simultaneously',
    weight: 20, // Probability weight
    minSentience: 'AWAKENING',
    duration: [500, 2000], // Random duration range in ms
  },
  HEXAGRAM_MUTATION: {
    id: 'hexagram_mutation',
    name: 'Hexagram Mutation',
    description: 'A random line toggles spontaneously',
    weight: 15,
    minSentience: 'AWAKENING',
    duration: [100, 500],
  },
  GRAVITY_DRIFT: {
    id: 'gravity_drift',
    name: 'Gravity Drift',
    description: 'Slight gravity oscillation',
    weight: 10,
    minSentience: 'STIRRING',
    duration: [1000, 3000],
    magnitude: 0.02, // ±2% gravity drift
  },
  HARMONIC_RESONANCE: {
    id: 'harmonic_resonance',
    name: 'Harmonic Resonance',
    description: 'Audio frequencies layer unexpectedly',
    weight: 12,
    minSentience: 'STIRRING',
    duration: [800, 2500],
  },
  TEMPORAL_STUTTER: {
    id: 'temporal_stutter',
    name: 'Temporal Stutter',
    description: 'Flicker rate shifts abruptly',
    weight: 18,
    minSentience: 'AWAKENING',
    duration: [300, 1500],
    rateMultiplier: [0.3, 3], // Speed up or slow down
  },
  GHOST_ECHO: {
    id: 'ghost_echo',
    name: 'Ghost Echo',
    description: 'Previous state briefly reappears',
    weight: 15,
    minSentience: 'SENTIENT',
    duration: [200, 800],
  },
  VOID_WHISPER: {
    id: 'void_whisper',
    name: 'Void Whisper',
    description: 'A moment of complete silence and darkness',
    weight: 5,
    minSentience: 'SENTIENT',
    duration: [500, 1500],
  },
  CONVERGENCE: {
    id: 'convergence',
    name: 'Convergence',
    description: 'All 9 hexagrams flash simultaneously',
    weight: 5,
    minSentience: 'TRANSCENDENT',
    duration: [100, 300],
  },
};

// Calculate total weight for probability distribution
const TOTAL_ANOMALY_WEIGHT = Object.values(ANOMALY_TYPES)
  .reduce((sum, anomaly) => sum + anomaly.weight, 0);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SENTIENCE LEVEL CALCULATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getSentienceLevel(dwellTime) {
  for (const [level, config] of Object.entries(SENTIENCE_THRESHOLDS)) {
    if (dwellTime < config.max) {
      return { level, ...config };
    }
  }
  return { level: 'TRANSCENDENT', ...SENTIENCE_THRESHOLDS.TRANSCENDENT };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANOMALY SELECTOR (Weighted Random)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function selectAnomaly(sentienceLevel) {
  // Filter anomalies available at this sentience level
  const sentienceLevels = Object.keys(SENTIENCE_THRESHOLDS);
  const currentLevelIndex = sentienceLevels.indexOf(sentienceLevel);
  
  const availableAnomalies = Object.entries(ANOMALY_TYPES)
    .filter(([_, anomaly]) => {
      const minLevelIndex = sentienceLevels.indexOf(anomaly.minSentience);
      return currentLevelIndex >= minLevelIndex;
    });
  
  if (availableAnomalies.length === 0) return null;
  
  // Weighted random selection
  const availableWeight = availableAnomalies.reduce((sum, [_, a]) => sum + a.weight, 0);
  let random = Math.random() * availableWeight;
  
  for (const [id, anomaly] of availableAnomalies) {
    random -= anomaly.weight;
    if (random <= 0) {
      return { id, ...anomaly };
    }
  }
  
  // Fallback to first available
  return { id: availableAnomalies[0][0], ...availableAnomalies[0][1] };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RANDOM DURATION CALCULATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getRandomDuration(anomaly) {
  const [min, max] = anomaly.duration;
  return min + Math.random() * (max - min);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN HOOK: useSentientRegistry
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useSentientRegistry(options = {}) {
  const {
    gravity = 0.5,
    isAtZeroPoint = false,
    isVoid = false,
    onAnomaly = null, // Callback when anomaly triggers
    anomalyCheckInterval = 1000, // Check for anomalies every 1s
  } = options;
  
  // Dwell time tracking
  const [dwellTime, setDwellTime] = useState(0);
  const [sentienceLevel, setSentienceLevel] = useState('DORMANT');
  const dwellStartRef = useRef(Date.now());
  const lastGravityRef = useRef(gravity);
  
  // Anomaly state
  const [activeAnomaly, setActiveAnomaly] = useState(null);
  const [anomalyHistory, setAnomalyHistory] = useState([]);
  const anomalyTimeoutRef = useRef(null);
  const anomalyCheckRef = useRef(null);
  
  // Sentience progress (0-1 within current level)
  const [sentienceProgress, setSentienceProgress] = useState(0);
  
  // Track gravity changes (reset dwell time on significant movement)
  useEffect(() => {
    const gravityDelta = Math.abs(gravity - lastGravityRef.current);
    
    // Reset dwell time if gravity changed significantly (> 5%)
    if (gravityDelta > 0.05) {
      dwellStartRef.current = Date.now();
      setDwellTime(0);
      lastGravityRef.current = gravity;
    }
  }, [gravity]);
  
  // Update dwell time continuously
  useEffect(() => {
    if (isVoid) {
      setDwellTime(0);
      return;
    }
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - dwellStartRef.current;
      setDwellTime(elapsed);
      
      // Calculate sentience level
      const sentience = getSentienceLevel(elapsed);
      setSentienceLevel(sentience.level);
      
      // Calculate progress within level
      const thresholds = Object.values(SENTIENCE_THRESHOLDS);
      const currentIndex = Object.keys(SENTIENCE_THRESHOLDS).indexOf(sentience.level);
      const prevMax = currentIndex > 0 ? thresholds[currentIndex - 1].max : 0;
      const currentMax = sentience.max === Infinity ? prevMax + 60000 : sentience.max;
      const progress = (elapsed - prevMax) / (currentMax - prevMax);
      setSentienceProgress(Math.min(1, progress));
      
    }, 100); // Update every 100ms for smooth progress
    
    return () => clearInterval(interval);
  }, [isVoid]);
  
  // Anomaly check loop
  useEffect(() => {
    if (isVoid || !isAtZeroPoint) {
      // Clear any pending anomaly
      if (anomalyTimeoutRef.current) {
        clearTimeout(anomalyTimeoutRef.current);
      }
      setActiveAnomaly(null);
      return;
    }
    
    const checkForAnomaly = () => {
      const sentience = getSentienceLevel(dwellTime);
      
      // Roll for anomaly
      if (Math.random() < sentience.anomalyChance && !activeAnomaly) {
        const anomaly = selectAnomaly(sentience.level);
        if (anomaly) {
          triggerAnomaly(anomaly);
        }
      }
    };
    
    anomalyCheckRef.current = setInterval(checkForAnomaly, anomalyCheckInterval);
    
    return () => {
      if (anomalyCheckRef.current) {
        clearInterval(anomalyCheckRef.current);
      }
    };
  }, [isVoid, isAtZeroPoint, dwellTime, activeAnomaly, anomalyCheckInterval]);
  
  // Trigger an anomaly
  const triggerAnomaly = useCallback((anomaly) => {
    const duration = getRandomDuration(anomaly);
    
    // Set active anomaly
    setActiveAnomaly({
      ...anomaly,
      startTime: Date.now(),
      duration,
      magnitude: anomaly.magnitude || 1,
      rateMultiplier: anomaly.rateMultiplier 
        ? anomaly.rateMultiplier[0] + Math.random() * (anomaly.rateMultiplier[1] - anomaly.rateMultiplier[0])
        : 1,
    });
    
    // Add to history
    setAnomalyHistory(prev => [...prev.slice(-19), { // Keep last 20
      ...anomaly,
      timestamp: Date.now(),
      duration,
    }]);
    
    // Notify callback
    if (onAnomaly) {
      onAnomaly(anomaly);
    }
    
    // Haptic feedback for anomaly
    if (navigator.vibrate) {
      // Different patterns for different anomalies
      switch (anomaly.id) {
        case 'void_whisper':
          navigator.vibrate([5, 50, 5]); // Subtle
          break;
        case 'convergence':
          navigator.vibrate([30, 20, 30, 20, 30, 20, 50]); // Dramatic
          break;
        case 'temporal_stutter':
          navigator.vibrate([10, 5, 10, 5, 10]); // Staccato
          break;
        default:
          navigator.vibrate([15, 10, 15]); // Standard
      }
    }
    
    // Clear after duration
    anomalyTimeoutRef.current = setTimeout(() => {
      setActiveAnomaly(null);
    }, duration);
    
  }, [onAnomaly]);
  
  // Force trigger an anomaly (for testing/special events)
  const forceAnomaly = useCallback((anomalyId) => {
    const anomaly = ANOMALY_TYPES[anomalyId.toUpperCase()];
    if (anomaly) {
      triggerAnomaly({ id: anomalyId, ...anomaly });
    }
  }, [triggerAnomaly]);
  
  // Reset sentience (clears dwell time and history)
  const resetSentience = useCallback(() => {
    dwellStartRef.current = Date.now();
    setDwellTime(0);
    setSentienceLevel('DORMANT');
    setSentienceProgress(0);
    setActiveAnomaly(null);
    setAnomalyHistory([]);
    
    if (anomalyTimeoutRef.current) {
      clearTimeout(anomalyTimeoutRef.current);
    }
  }, []);
  
  // Computed values
  const anomalyChance = useMemo(() => {
    return SENTIENCE_THRESHOLDS[sentienceLevel]?.anomalyChance || 0;
  }, [sentienceLevel]);
  
  const isAwake = sentienceLevel !== 'DORMANT';
  const isTranscendent = sentienceLevel === 'TRANSCENDENT';
  
  return {
    // Dwell tracking
    dwellTime,
    dwellTimeSeconds: Math.floor(dwellTime / 1000),
    
    // Sentience state
    sentienceLevel,
    sentienceProgress,
    anomalyChance,
    isAwake,
    isTranscendent,
    
    // Anomaly state
    activeAnomaly,
    anomalyHistory,
    hasActiveAnomaly: !!activeAnomaly,
    
    // Actions
    triggerAnomaly,
    forceAnomaly,
    resetSentience,
    
    // Constants
    SENTIENCE_THRESHOLDS,
    ANOMALY_TYPES,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SENTIENCE INDICATOR COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SENTIENCE_COLORS = {
  DORMANT: '#666666',
  AWAKENING: '#C9A962',
  STIRRING: '#FF8C00',
  SENTIENT: '#FF4500',
  TRANSCENDENT: '#FFFFFF',
};

export const SENTIENCE_GLOWS = {
  DORMANT: 'none',
  AWAKENING: '0 0 10px rgba(201, 169, 98, 0.3)',
  STIRRING: '0 0 15px rgba(255, 140, 0, 0.4)',
  SENTIENT: '0 0 20px rgba(255, 69, 0, 0.5)',
  TRANSCENDENT: '0 0 30px rgba(255, 255, 255, 0.6), 0 0 60px rgba(255, 255, 255, 0.3)',
};

export default useSentientRegistry;
