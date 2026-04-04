/**
 * PolarityContext.js — The Master Clock of the Vertical Torus
 * 
 * The "Global Gravity System" that governs the entire app:
 * - 6-Bit Hexagram Bitmask (000000 → 111111 = 64 gates)
 * - Gravity flows from Hollow Earth (dense) to Matrix (light)
 * - Supernova Detection: triggers when crossing the 0.5 threshold
 * 
 * HEXAGRAM SQUARED (H²):
 * - Each bit represents a line (1=Yang solid, 0=Yin broken)
 * - Line 1 (LSB) = Root/Earth, Line 6 (MSB) = Crown/Heaven
 * - The decimal value (0-63) maps to 64 I Ching hexagrams
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6-BIT HEXAGRAM CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 64 Gates: 000000 (0) = Pure Yin to 111111 (63) = Pure Yang
const HEXAGRAM_MIN = 0b000000; // 0 - The Receptive (Pure Yin)
const HEXAGRAM_MAX = 0b111111; // 63 - The Creative (Pure Yang)

// Special hexagram states
const HEXAGRAM_STATES = {
  RECEPTIVE: 0b000000,      // 0 - Pure Yin, maximum receptivity
  CREATIVE: 0b111111,       // 63 - Pure Yang, maximum creation
  PEACE: 0b000111,          // 7 - Earth over Heaven (harmony)
  STANDSTILL: 0b111000,     // 56 - Heaven over Earth (stagnation)
  REVOLUTION: 0b011001,     // 25 - Lake over Fire (transformation)
  VOID: 0b000000,           // Emergency state - all lines broken
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LAYER CLASSIFICATION — Route to Depth Mapping
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LAYER_MAP = {
  // Hollow Earth — Dense, foundational, grounded (0.0-0.3)
  hollow: {
    depth: 0.15,
    routes: ['/meditation', '/breathing', '/frequencies', '/mantras', '/wellness', '/yoga', '/exercises'],
    feel: 'dense',
    sageMode: 'hollow',
    audioFlavor: 'thud',
    translucency: 'obsidian', // dark glass
    rotationDirection: 1, // Clockwise
    hexagramRange: [0, 21], // Lower third of 64 gates
  },
  
  // Core — The heart center, balanced (0.4-0.6)
  core: {
    depth: 0.5,
    routes: ['/dashboard', '/journal', '/settings', '/profile', '/mood'],
    feel: 'balanced',
    sageMode: 'core',
    audioFlavor: 'neutral',
    translucency: 'amber', // warm glass
    rotationDirection: 0, // Still point
    hexagramRange: [22, 42], // Middle third
  },
  
  // Matrix — Expansive, celestial, floating (0.7-1.0)
  matrix: {
    depth: 0.85,
    routes: ['/oracle', '/explore', '/community', '/achievements', '/ritual', '/tarot', '/iching', '/star-chart', '/numerology', '/dreams'],
    feel: 'expansive',
    sageMode: 'matrix',
    audioFlavor: 'shimmer',
    translucency: 'prismatic', // white-gold glass
    rotationDirection: -1, // Counter-clockwise
    hexagramRange: [43, 63], // Upper third
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRAVITY & HEXAGRAM CALCULATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate gravity from layer depth
 * @param {number} depth - 0 to 1
 * @returns {number} gravity - 0 (grounded) to 1 (floating)
 */
const calculateGravity = (depth) => Math.sin(depth * Math.PI / 2);

/**
 * Get layer info from pathname
 */
const getLayerFromPath = (pathname) => {
  for (const [layerName, layer] of Object.entries(LAYER_MAP)) {
    if (layer.routes.some(route => pathname.startsWith(route))) {
      return { name: layerName, ...layer };
    }
  }
  // Default to core for unmatched routes
  return { name: 'core', ...LAYER_MAP.core };
};

/**
 * Convert decimal to 6-bit binary string
 */
const toBinaryString = (decimal) => {
  return decimal.toString(2).padStart(6, '0');
};

/**
 * Get individual line states from hexagram
 * @returns {Array<boolean>} 6 booleans, index 0 = Line 1 (bottom), index 5 = Line 6 (top)
 */
const getLineStates = (hexagram) => {
  return [
    (hexagram & 0b000001) !== 0, // Line 1 (Root)
    (hexagram & 0b000010) !== 0, // Line 2
    (hexagram & 0b000100) !== 0, // Line 3
    (hexagram & 0b001000) !== 0, // Line 4
    (hexagram & 0b010000) !== 0, // Line 5
    (hexagram & 0b100000) !== 0, // Line 6 (Crown)
  ];
};

/**
 * Toggle a specific line in the hexagram
 * @param {number} hexagram - Current 6-bit value
 * @param {number} lineIndex - 0-5 (Line 1-6)
 * @returns {number} New hexagram value
 */
const toggleLine = (hexagram, lineIndex) => {
  const mask = 1 << lineIndex;
  return hexagram ^ mask;
};

/**
 * Calculate hexagram from gravity (deterministic mapping)
 */
const hexagramFromGravity = (gravity) => {
  // Map gravity 0-1 to hexagram 0-63
  return Math.floor(gravity * 63);
};

/**
 * Calculate UI physics based on gravity
 */
const calculatePhysics = (gravity) => ({
  // Dock behavior
  dockSnapStrength: 1 - gravity * 0.6,
  dockMagneticPull: gravity * 0.8,
  dockDragResistance: 1 - gravity * 0.5,
  
  // Visual density
  blurIntensity: 12 + (1 - gravity) * 12,
  opacity: 0.85 + gravity * 0.1,
  
  // Animation timing
  transitionSpeed: 0.3 + gravity * 0.2,
  springDamping: 25 - gravity * 10,
  
  // Color temperature
  warmth: 1 - gravity,
  
  // Compass physics
  rotationSpeed: 0.5 + gravity * 1.5, // Faster in Matrix
  rotationFriction: 0.98 - gravity * 0.03, // Less friction in Matrix
  rotationDirection: gravity < 0.5 ? 1 : -1, // CW in Hollow, CCW in Matrix
});

/**
 * Get translucency colors based on layer
 */
const getTranslucencyColors = (translucency, gravity) => {
  switch (translucency) {
    case 'obsidian':
      return {
        background: `rgba(8, 8, 15, ${0.92 - gravity * 0.1})`,
        border: `rgba(30, 30, 50, ${0.4 + gravity * 0.1})`,
        glow: 'rgba(20, 20, 40, 0.5)',
        accent: '#1a1a2e',
        lineColor: '#4a4a6a', // Muted for Hollow
        lineEmissive: '#2a2a4a',
      };
    case 'amber':
      return {
        background: `rgba(15, 12, 10, ${0.88})`,
        border: `rgba(201, 169, 98, ${0.25})`,
        glow: 'rgba(201, 169, 98, 0.15)',
        accent: '#C9A962',
        lineColor: '#C9A962', // Gold for Core
        lineEmissive: '#8B7355',
      };
    case 'prismatic':
      return {
        background: `rgba(20, 20, 30, ${0.82 + gravity * 0.08})`,
        border: `rgba(255, 255, 255, ${0.15 + gravity * 0.1})`,
        glow: `rgba(200, 200, 255, ${0.1 + gravity * 0.15})`,
        accent: '#E8E4FF',
        lineColor: '#FFD700', // Bright gold for Matrix
        lineEmissive: '#FFA500',
      };
    default:
      return {
        background: 'rgba(10, 10, 18, 0.9)',
        border: 'rgba(255, 255, 255, 0.1)',
        glow: 'rgba(192, 132, 252, 0.1)',
        accent: '#C084FC',
        lineColor: '#C9A962',
        lineEmissive: '#8B7355',
      };
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ZERO-POINT NULL STATE (0.48 - 0.52)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ZERO_POINT_LOW = 0.48;
const ZERO_POINT_HIGH = 0.52;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPERNOVA DETECTION — Velocity-Reactive
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SUPERNOVA_THRESHOLD = 0.5;
const SUPERNOVA_BASE_DURATION = 2500; // ms for full expansion cycle
const SUPERNOVA_MIN_DURATION = 1500; // Faster transitions = shorter burst
const SUPERNOVA_MAX_INTENSITY = 5.0; // 500% max scale
const SUPERNOVA_MIN_INTENSITY = 1.5; // 150% min scale (gentle threshold crossing)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PolarityContext = createContext(null);

export function PolarityProvider({ children }) {
  const location = useLocation();
  const [currentLayer, setCurrentLayer] = useState(null);
  const [previousLayer, setPreviousLayer] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // 6-Bit Hexagram State (The Core Bitmask)
  const [hexagram, setHexagram] = useState(0b000111); // Start at Peace (7)
  
  // Supernova State — Velocity-Reactive
  const [supernovaActive, setSupernovaActive] = useState(false);
  const [supernovaPhase, setSupernovaPhase] = useState('idle'); // idle, expanding, peak, contracting
  const [supernovaIntensity, setSupernovaIntensity] = useState(1); // Scale multiplier (1.0 to 5.0)
  const [supernovaVelocity, setSupernovaVelocity] = useState(0); // How fast the threshold was crossed
  const supernovaTimeoutRef = useRef(null);
  const lastGravityRef = useRef(0.5); // Track previous gravity for velocity calculation
  const lastGravityTimeRef = useRef(Date.now());
  
  // Emergency Void State (STOP button override)
  const [isVoid, setIsVoid] = useState(false);
  
  // Manual Gravity Override (for Zero Point access)
  const [manualGravityEnabled, setManualGravityEnabled] = useState(false);
  const [manualGravityValue, setManualGravityValue] = useState(0.5);
  
  // Compass rotation state (for inertial physics)
  const [compassRotation, setCompassRotation] = useState(0);
  const [compassVelocity, setCompassVelocity] = useState(0);
  const [compassFrozen, setCompassFrozen] = useState(false);
  
  // Calculate current layer from route — with velocity tracking
  useEffect(() => {
    const layer = getLayerFromPath(location.pathname);
    const now = Date.now();
    
    if (currentLayer && layer.name !== currentLayer.name) {
      // Layer transition detected
      setPreviousLayer(currentLayer);
      setIsTransitioning(true);
      
      // Calculate gravity values
      const prevGravity = calculateGravity(currentLayer.depth);
      const newGravity = calculateGravity(layer.depth);
      const gravityDelta = Math.abs(newGravity - prevGravity);
      
      // Calculate velocity (gravity change per second)
      const timeDelta = Math.max(now - lastGravityTimeRef.current, 100); // At least 100ms
      const velocity = (gravityDelta / timeDelta) * 1000; // Normalized to per-second
      
      // Check for Supernova trigger (crossing the threshold)
      const crossedThreshold = 
        (prevGravity < SUPERNOVA_THRESHOLD && newGravity >= SUPERNOVA_THRESHOLD) ||
        (prevGravity >= SUPERNOVA_THRESHOLD && newGravity < SUPERNOVA_THRESHOLD);
      
      if (crossedThreshold && !isVoid) {
        // Calculate intensity based on velocity AND distance traveled
        // Fast transition (velocity > 1.0) + large distance = MAX intensity
        // Slow transition (velocity < 0.3) + small distance = MIN intensity
        const velocityFactor = Math.min(velocity / 0.8, 1); // Normalize velocity (0.8 = "fast")
        const distanceFactor = Math.min(gravityDelta / 0.7, 1); // Normalize distance (0.7 = max travel)
        const combinedFactor = (velocityFactor * 0.6 + distanceFactor * 0.4); // Weight velocity more
        const intensity = SUPERNOVA_MIN_INTENSITY + 
          (SUPERNOVA_MAX_INTENSITY - SUPERNOVA_MIN_INTENSITY) * combinedFactor;
        
        triggerSupernova(
          prevGravity < newGravity ? 'ascending' : 'descending',
          intensity,
          velocity
        );
      }
      
      // Transition duration based on layer distance
      const distance = Math.abs(layer.depth - currentLayer.depth);
      const duration = 300 + distance * 500;
      
      setTimeout(() => setIsTransitioning(false), duration);
    }
    
    // Update tracking refs
    if (currentLayer) {
      lastGravityRef.current = calculateGravity(currentLayer.depth);
    }
    lastGravityTimeRef.current = now;
    
    setCurrentLayer(layer);
  }, [location.pathname]);
  
  // Trigger Supernova expansion — Velocity-Reactive
  const triggerSupernova = useCallback((direction, intensity = 3, velocity = 0.5) => {
    if (supernovaActive) return;
    
    // Store intensity and velocity
    setSupernovaIntensity(intensity);
    setSupernovaVelocity(velocity);
    setSupernovaActive(true);
    setSupernovaPhase('expanding');
    
    // Calculate duration based on intensity (more intense = longer display)
    const duration = SUPERNOVA_MIN_DURATION + 
      (SUPERNOVA_BASE_DURATION - SUPERNOVA_MIN_DURATION) * (intensity / SUPERNOVA_MAX_INTENSITY);
    
    // Haptic burst scales with intensity
    if (navigator.vibrate) {
      // Low intensity = gentle pulse, high intensity = violent rumble
      if (intensity > 4) {
        // Max intensity: Heavy rumble
        navigator.vibrate([80, 30, 80, 30, 80, 30, 150]);
      } else if (intensity > 2.5) {
        // Medium intensity: Strong pulse
        navigator.vibrate([50, 30, 50, 30, 100]);
      } else {
        // Low intensity: Gentle tap
        navigator.vibrate([30, 20, 30]);
      }
    }
    
    // Phase timing scaled to duration
    setTimeout(() => setSupernovaPhase('peak'), duration * 0.35);
    setTimeout(() => setSupernovaPhase('contracting'), duration * 0.6);
    setTimeout(() => {
      setSupernovaPhase('idle');
      setSupernovaActive(false);
      setSupernovaIntensity(1);
      setSupernovaVelocity(0);
    }, duration);
    
  }, [supernovaActive]);
  
  // Emergency Void (STOP button calls this)
  const activateVoid = useCallback(() => {
    setIsVoid(true);
    setHexagram(HEXAGRAM_STATES.VOID);
    setCompassFrozen(true);
    setCompassVelocity(0);
    setSupernovaActive(false);
    setSupernovaPhase('idle');
    
    // Clear any pending supernova
    if (supernovaTimeoutRef.current) {
      clearTimeout(supernovaTimeoutRef.current);
    }
    
    // Heavy haptic confirmation
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, []);
  
  // Deactivate Void (resume normal operation)
  const deactivateVoid = useCallback(() => {
    setIsVoid(false);
    setCompassFrozen(false);
    // Restore hexagram based on current gravity
    const gravity = currentLayer ? calculateGravity(currentLayer.depth) : 0.5;
    setHexagram(hexagramFromGravity(gravity));
  }, [currentLayer]);
  
  // Toggle a hexagram line manually
  const toggleHexagramLine = useCallback((lineIndex) => {
    if (isVoid || compassFrozen) return;
    setHexagram(prev => toggleLine(prev, lineIndex));
    
    // Light haptic tick
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [isVoid, compassFrozen]);
  
  // Set hexagram directly
  const setHexagramValue = useCallback((value) => {
    if (isVoid) return;
    const clamped = Math.max(HEXAGRAM_MIN, Math.min(HEXAGRAM_MAX, value));
    setHexagram(clamped);
  }, [isVoid]);
  
  // Flick the compass (add velocity for inertial spin)
  const flickCompass = useCallback((velocity) => {
    if (compassFrozen) return;
    setCompassVelocity(prev => prev + velocity);
  }, [compassFrozen]);
  
  // Freeze compass (for STOP or focus)
  const freezeCompass = useCallback(() => {
    setCompassFrozen(true);
    setCompassVelocity(0);
  }, []);
  
  // Unfreeze compass
  const unfreezeCompass = useCallback(() => {
    setCompassFrozen(false);
  }, []);
  
  // Calculate gravity and physics
  const gravity = useMemo(() => {
    if (isVoid) return 0;
    // Manual override takes precedence
    if (manualGravityEnabled) return manualGravityValue;
    if (!currentLayer) return 0.5;
    return calculateGravity(currentLayer.depth);
  }, [currentLayer, isVoid, manualGravityEnabled, manualGravityValue]);
  
  // Check if at Zero Point (0.48 - 0.52 gravity range)
  const isAtZeroPoint = useMemo(() => {
    return gravity >= ZERO_POINT_LOW && gravity <= ZERO_POINT_HIGH;
  }, [gravity]);
  
  // Enable/disable manual gravity mode
  const enableManualGravity = useCallback((enabled) => {
    setManualGravityEnabled(enabled);
    if (!enabled) {
      // Reset hexagram to route-based when disabling
      const routeGravity = currentLayer ? calculateGravity(currentLayer.depth) : 0.5;
      setHexagram(hexagramFromGravity(routeGravity));
    }
  }, [currentLayer]);
  
  // Set manual gravity value (0-1)
  const setManualGravity = useCallback((value) => {
    const clamped = Math.max(0, Math.min(1, value));
    setManualGravityValue(clamped);
    // Update hexagram to match manual gravity
    if (!isVoid) {
      setHexagram(hexagramFromGravity(clamped));
    }
  }, [isVoid]);
  
  // Toggle Zero Point Mode (quick shortcut to enable manual gravity near center)
  // Sets to 0.485 to show flicker first - user can fine-tune to 0.50 for Source State
  const toggleZeroPointMode = useCallback(() => {
    if (manualGravityEnabled && Math.abs(manualGravityValue - 0.5) < 0.05) {
      // Already in Zero Point mode, disable
      enableManualGravity(false);
    } else {
      // Enable Zero Point mode at 0.485 (shows flicker, not Source State)
      // This keeps us in Zero Point range (0.48-0.52) but away from Source (0.499-0.501)
      setManualGravityValue(0.485);
      setManualGravityEnabled(true);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([20, 10, 20, 10, 50]);
      }
    }
  }, [manualGravityEnabled, manualGravityValue, enableManualGravity]);
  
  const physics = useMemo(() => calculatePhysics(gravity), [gravity]);
  
  const colors = useMemo(() => {
    if (!currentLayer) return getTranslucencyColors('amber', 0.5);
    return getTranslucencyColors(currentLayer.translucency, gravity);
  }, [currentLayer, gravity]);
  
  // Line states for the 6-line HUD
  const lineStates = useMemo(() => getLineStates(hexagram), [hexagram]);
  
  // Binary string representation
  const hexagramBinary = useMemo(() => toBinaryString(hexagram), [hexagram]);
  
  // Determine if crossing the 0.5 threshold (Sage inversion point)
  const crossedThreshold = useMemo(() => {
    if (!previousLayer || !currentLayer) return false;
    const prevGravity = calculateGravity(previousLayer.depth);
    const currGravity = gravity;
    return (prevGravity < 0.5 && currGravity >= 0.5) || (prevGravity >= 0.5 && currGravity < 0.5);
  }, [previousLayer, currentLayer, gravity]);
  
  // Get Sage mode for current layer
  const sageMode = useMemo(() => {
    if (isVoid) return 'void';
    return currentLayer?.sageMode || 'core';
  }, [currentLayer, isVoid]);
  
  // Audio flavor for stop button haptics
  const audioFlavor = currentLayer?.audioFlavor || 'neutral';
  
  // Layer transition direction
  const transitionDirection = useMemo(() => {
    if (!previousLayer || !currentLayer) return 'none';
    return currentLayer.depth > previousLayer.depth ? 'ascending' : 'descending';
  }, [previousLayer, currentLayer]);
  
  // Layer checks
  const isInHollow = gravity < 0.35;
  const isInCore = gravity >= 0.35 && gravity < 0.65;
  const isInMatrix = gravity >= 0.65;
  
  // Rotation direction based on layer (ZERO at Zero-Point)
  const rotationDirection = useMemo(() => {
    if (isVoid || compassFrozen || isAtZeroPoint) return 0; // Frozen at Zero-Point
    if (isInHollow) return 1;  // Clockwise
    if (isInMatrix) return -1; // Counter-clockwise
    return 0; // Still at core
  }, [isVoid, compassFrozen, isInHollow, isInMatrix, isAtZeroPoint]);
  
  const value = {
    // Layer info
    currentLayer,
    previousLayer,
    layerName: currentLayer?.name || 'core',
    
    // Gravity system
    gravity,
    depth: currentLayer?.depth || 0.5,
    
    // Manual Gravity Control (for Zero Point access)
    manualGravityEnabled,
    manualGravityValue,
    enableManualGravity,
    setManualGravity,
    toggleZeroPointMode,
    
    // 6-Bit Hexagram System
    hexagram,
    hexagramBinary,
    lineStates,
    toggleHexagramLine,
    setHexagramValue,
    HEXAGRAM_STATES,
    
    // Physics
    physics,
    
    // Visual
    colors,
    translucency: currentLayer?.translucency || 'amber',
    
    // Sage integration
    sageMode,
    crossedThreshold,
    
    // Audio
    audioFlavor,
    
    // Transition state
    isTransitioning,
    transitionDirection,
    
    // Layer checks
    isInHollow,
    isInCore,
    isInMatrix,
    isAtZeroPoint, // The Weightless Moment (0.48-0.52)
    
    // Compass state
    compassRotation,
    setCompassRotation,
    compassVelocity,
    setCompassVelocity,
    compassFrozen,
    flickCompass,
    freezeCompass,
    unfreezeCompass,
    rotationDirection,
    
    // Supernova — Velocity-Reactive
    supernovaActive,
    supernovaPhase,
    supernovaIntensity,
    supernovaVelocity,
    triggerSupernova,
    SUPERNOVA_MAX_INTENSITY,
    
    // Void / Emergency
    isVoid,
    activateVoid,
    deactivateVoid,
    
    // Constants
    LAYER_MAP,
  };
  
  return (
    <PolarityContext.Provider value={value}>
      {children}
    </PolarityContext.Provider>
  );
}

export function usePolarity() {
  const ctx = useContext(PolarityContext);
  if (!ctx) {
    // Return safe defaults if outside provider
    return {
      gravity: 0.5,
      depth: 0.5,
      layerName: 'core',
      sageMode: 'core',
      audioFlavor: 'neutral',
      isInHollow: false,
      isInCore: true,
      isInMatrix: false,
      isAtZeroPoint: false, // Zero-Point Null State
      hexagram: 0b000111,
      hexagramBinary: '000111',
      lineStates: [true, true, true, false, false, false],
      colors: getTranslucencyColors('amber', 0.5),
      physics: calculatePhysics(0.5),
      compassRotation: 0,
      compassVelocity: 0,
      compassFrozen: false,
      rotationDirection: 0,
      supernovaActive: false,
      supernovaPhase: 'idle',
      supernovaIntensity: 1,
      supernovaVelocity: 0,
      isVoid: false,
      toggleHexagramLine: () => {},
      setHexagramValue: () => {},
      flickCompass: () => {},
      freezeCompass: () => {},
      unfreezeCompass: () => {},
      activateVoid: () => {},
      deactivateVoid: () => {},
      triggerSupernova: () => {},
    };
  }
  return ctx;
}

// Export utilities
export { 
  calculateGravity, 
  getLayerFromPath, 
  getTranslucencyColors, 
  calculatePhysics, 
  LAYER_MAP,
  toBinaryString,
  getLineStates,
  toggleLine,
  hexagramFromGravity,
  HEXAGRAM_STATES,
};

export default PolarityContext;
