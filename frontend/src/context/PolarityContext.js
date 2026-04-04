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
// SUPERNOVA DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SUPERNOVA_THRESHOLD = 0.5;
const SUPERNOVA_DURATION = 2500; // ms for full expansion cycle

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
  
  // Supernova State
  const [supernovaActive, setSupernovaActive] = useState(false);
  const [supernovaPhase, setSupernovaPhase] = useState('idle'); // idle, expanding, peak, contracting
  const supernovaTimeoutRef = useRef(null);
  
  // Emergency Void State (STOP button override)
  const [isVoid, setIsVoid] = useState(false);
  
  // Compass rotation state (for inertial physics)
  const [compassRotation, setCompassRotation] = useState(0);
  const [compassVelocity, setCompassVelocity] = useState(0);
  const [compassFrozen, setCompassFrozen] = useState(false);
  
  // Calculate current layer from route
  useEffect(() => {
    const layer = getLayerFromPath(location.pathname);
    
    if (currentLayer && layer.name !== currentLayer.name) {
      // Layer transition detected
      setPreviousLayer(currentLayer);
      setIsTransitioning(true);
      
      // Check for Supernova trigger (crossing the threshold)
      const prevGravity = calculateGravity(currentLayer.depth);
      const newGravity = calculateGravity(layer.depth);
      const crossedThreshold = 
        (prevGravity < SUPERNOVA_THRESHOLD && newGravity >= SUPERNOVA_THRESHOLD) ||
        (prevGravity >= SUPERNOVA_THRESHOLD && newGravity < SUPERNOVA_THRESHOLD);
      
      if (crossedThreshold && !isVoid) {
        triggerSupernova(prevGravity < newGravity ? 'ascending' : 'descending');
      }
      
      // Transition duration based on layer distance
      const distance = Math.abs(layer.depth - currentLayer.depth);
      const duration = 300 + distance * 500;
      
      setTimeout(() => setIsTransitioning(false), duration);
    }
    
    setCurrentLayer(layer);
  }, [location.pathname]);
  
  // Trigger Supernova expansion
  const triggerSupernova = useCallback((direction) => {
    if (supernovaActive) return;
    
    setSupernovaActive(true);
    setSupernovaPhase('expanding');
    
    // Haptic burst at start
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 100]);
    }
    
    // Phase timing
    setTimeout(() => setSupernovaPhase('peak'), SUPERNOVA_DURATION * 0.4);
    setTimeout(() => setSupernovaPhase('contracting'), SUPERNOVA_DURATION * 0.6);
    setTimeout(() => {
      setSupernovaPhase('idle');
      setSupernovaActive(false);
    }, SUPERNOVA_DURATION);
    
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
    if (!currentLayer) return 0.5;
    return calculateGravity(currentLayer.depth);
  }, [currentLayer, isVoid]);
  
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
  
  // Rotation direction based on layer
  const rotationDirection = useMemo(() => {
    if (isVoid || compassFrozen) return 0;
    if (isInHollow) return 1;  // Clockwise
    if (isInMatrix) return -1; // Counter-clockwise
    return 0; // Still at core
  }, [isVoid, compassFrozen, isInHollow, isInMatrix]);
  
  const value = {
    // Layer info
    currentLayer,
    previousLayer,
    layerName: currentLayer?.name || 'core',
    
    // Gravity system
    gravity,
    depth: currentLayer?.depth || 0.5,
    
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
    
    // Supernova
    supernovaActive,
    supernovaPhase,
    triggerSupernova,
    SUPERNOVA_DURATION,
    
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
