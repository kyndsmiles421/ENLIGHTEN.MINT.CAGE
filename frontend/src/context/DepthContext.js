/**
 * DepthContext.js — The 36-Bit Fractal Filing System
 * 
 * Manages the 6-level recursive navigation with a 36-bit address tracker.
 * 
 * ARCHITECTURE:
 * - 6 layers deep (d = 0-5), each with a 6-bit hexagram address
 * - 36-bit coordinate string: "101010|001100|111000|010101|110011|111111"
 * - 64^6 = 68,719,476,736 unique "rooms"
 * 
 * PATENT CLAIM:
 * "A method for hierarchical data navigation where a 6-bit symbolic state (Hexagram)
 * acts as a folder containing a secondary 6-bit state, creating a 36-bit address
 * space mapped to physical gyroscopic and haptic feedback."
 * 
 * VOLUMETRIC VISUAL SCALE:
 * - Macro (d=0-1): Solid lines, stone textures, heavy haptics
 * - Mid (d=2-3): Translucent glass lines, energy pulses
 * - Core (d=4-5): Pure light, geometric points, no text
 * 
 * LINE MEANINGS (I Ching tradition):
 * - Line 1 (Bottom): The Root / Beginning / Foundation
 * - Line 2: The Inner Self / Relationship / Trust
 * - Line 3: The Transition / Difficulty / Movement
 * - Line 4: The Outer Self / Position / Approach
 * - Line 5: The Ruler / Leadership / Responsibility
 * - Line 6 (Top): The Sage / Completion / Transformation
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { usePolarity } from './PolarityContext';
import { useLanguage } from './LanguageContext';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MAX_DEPTH = 5; // 6 levels (0-5), one for each hexagram line
export const SURFACE_DEPTH = 0; // The Macro Torus

// Line flavor definitions (I Ching meanings)
export const LINE_FLAVORS = {
  0: { // Line 1 - The Root
    name: 'Root',
    nameKey: 'line.root',
    translations: { en: 'Root', es: 'Raíz', ja: '根', zh: '根' },
    element: 'earth',
    energy: 'foundation',
    color: '#8B4513', // Sienna brown
    hapticWeight: 1.0, // Heaviest
    description: 'The beginning, the seed, the foundation of all things.',
  },
  1: { // Line 2 - The Inner Self
    name: 'Inner',
    nameKey: 'line.inner',
    translations: { en: 'Inner', es: 'Interior', ja: '内', zh: '内' },
    element: 'water',
    energy: 'relationship',
    color: '#4169E1', // Royal blue
    hapticWeight: 0.85,
    description: 'The inner self, relationships, trust and intuition.',
  },
  2: { // Line 3 - The Transition
    name: 'Transition',
    nameKey: 'line.transition',
    translations: { en: 'Transition', es: 'Transición', ja: '転換', zh: '过渡' },
    element: 'fire',
    energy: 'movement',
    color: '#FF6347', // Tomato red
    hapticWeight: 0.7,
    description: 'The point of difficulty, movement through challenge.',
  },
  3: { // Line 4 - The Outer Self
    name: 'Outer',
    nameKey: 'line.outer',
    translations: { en: 'Outer', es: 'Exterior', ja: '外', zh: '外' },
    element: 'wind',
    energy: 'approach',
    color: '#20B2AA', // Light sea green
    hapticWeight: 0.55,
    description: 'The outer self, position in the world, approach to others.',
  },
  4: { // Line 5 - The Ruler
    name: 'Ruler',
    nameKey: 'line.ruler',
    translations: { en: 'Ruler', es: 'Regente', ja: '主', zh: '主' },
    element: 'metal',
    energy: 'leadership',
    color: '#FFD700', // Gold
    hapticWeight: 0.4,
    description: 'The ruler, leadership, taking responsibility.',
  },
  5: { // Line 6 - The Sage
    name: 'Sage',
    nameKey: 'line.sage',
    translations: { en: 'Sage', es: 'Sabio', ja: '聖人', zh: '圣人' },
    element: 'heaven',
    energy: 'transformation',
    color: '#E6E6FA', // Lavender (lightest)
    hapticWeight: 0.25, // Lightest - Glass
    description: 'The sage, completion, transformation into the next cycle.',
  },
};

// Depth-specific haptic patterns (Stone → Glass progression)
export const DEPTH_HAPTICS = {
  0: { // Surface - Stone
    tap: [50],
    dive: [80, 40, 80],
    surface: [60, 30, 60],
    select: [30],
  },
  1: { // Level 1 - Earth
    tap: [40],
    dive: [60, 30, 60],
    surface: [50, 25, 50],
    select: [25],
  },
  2: { // Level 2 - Wood
    tap: [30],
    dive: [45, 20, 45],
    surface: [40, 20, 40],
    select: [20],
  },
  3: { // Level 3 - Water
    tap: [22],
    dive: [35, 15, 35],
    surface: [30, 15, 30],
    select: [15],
  },
  4: { // Level 4 - Metal
    tap: [15],
    dive: [25, 10, 25],
    surface: [22, 10, 22],
    select: [12],
  },
  5: { // Level 5 - Glass/Light (OMEGA POINT)
    tap: [10, 5, 10],
    dive: [15, 8, 15, 8, 15],
    surface: [12, 6, 12],
    select: [8, 4, 8],
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VOLUMETRIC VISUAL SCALE — Stone → Glass → Pure Light
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const VOLUMETRIC_SCALE = {
  0: { // Macro Surface
    texture: 'stone',
    lineOpacity: 1.0,
    lineWidth: 1.0, // Full width
    glowIntensity: 0.3,
    textVisible: true,
    particleCount: 0,
    backgroundColor: 'rgba(8, 8, 15, 0.95)',
  },
  1: { // Earth Layer
    texture: 'earth',
    lineOpacity: 0.95,
    lineWidth: 0.95,
    glowIntensity: 0.4,
    textVisible: true,
    particleCount: 10,
    backgroundColor: 'rgba(15, 12, 10, 0.92)',
  },
  2: { // Wood Layer
    texture: 'wood',
    lineOpacity: 0.85,
    lineWidth: 0.88,
    glowIntensity: 0.5,
    textVisible: true,
    particleCount: 25,
    backgroundColor: 'rgba(12, 18, 12, 0.88)',
  },
  3: { // Water Layer - Transition to Glass
    texture: 'glass',
    lineOpacity: 0.7,
    lineWidth: 0.78,
    glowIntensity: 0.65,
    textVisible: true,
    particleCount: 50,
    backgroundColor: 'rgba(10, 15, 25, 0.82)',
  },
  4: { // Metal Layer - Near Pure
    texture: 'crystal',
    lineOpacity: 0.5,
    lineWidth: 0.65,
    glowIntensity: 0.8,
    textVisible: false, // Text dissolves
    particleCount: 100,
    backgroundColor: 'rgba(18, 18, 28, 0.75)',
  },
  5: { // OMEGA POINT - Pure Light
    texture: 'light',
    lineOpacity: 0.25,
    lineWidth: 0.4, // Lines become geometric points
    glowIntensity: 1.0,
    textVisible: false,
    particleCount: 200,
    backgroundColor: 'rgba(25, 25, 40, 0.65)',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 36-BIT ADDRESS UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Convert a hexagram number (0-63) to a 6-bit binary string
 */
const hexToBinary = (hex) => {
  return hex.toString(2).padStart(6, '0');
};

/**
 * Convert a 6-bit binary string to hexagram number
 */
const binaryToHex = (binary) => {
  return parseInt(binary, 2);
};

/**
 * Generate the full 36-bit address from depth hexagrams
 * Format: "101010|001100|111000|010101|110011|111111"
 * @param {number[]} hexagrams - Array of hexagram numbers at each depth
 * @returns {string} 36-bit address with | separators
 */
const generateAddress36 = (hexagrams) => {
  return hexagrams.map(hexToBinary).join('|');
};

/**
 * Parse a 36-bit address back to hexagram array
 */
const parseAddress36 = (address) => {
  return address.split('|').map(binaryToHex);
};

/**
 * Calculate the "room number" - a unique ID for the current position
 * This is the decimal representation of the full 36-bit path
 */
const calculateRoomNumber = (hexagrams) => {
  // Each layer is 6 bits, so multiply by 64^(5-layer)
  let room = 0n; // Use BigInt for 36-bit numbers
  hexagrams.forEach((hex, layer) => {
    room += BigInt(hex) * (64n ** BigInt(5 - layer));
  });
  return room;
};

/**
 * Get a human-readable coordinate string
 * Format: "G24.L1.G7.L3.G11.L5" (Gate.Line pairs)
 */
const getCoordinateString = (breadcrumbs, currentHexagram) => {
  let coords = `G${currentHexagram}`;
  breadcrumbs.forEach(b => {
    coords = `G${b.hexagram}.L${b.line + 1}.${coords}`;
  });
  return coords;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CRYSTALLINE SEED — Session Data Capsule
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @typedef {Object} CrystallineSeed
 * @property {string} address36 - The 36-bit address
 * @property {BigInt} roomNumber - Unique room ID
 * @property {string} coordinate - Human-readable path
 * @property {number} depth - Depth reached
 * @property {number} timestamp - When seed was crystallized
 * @property {Object[]} path - Full breadcrumb trail
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BREADCRUMB STRUCTURE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Each breadcrumb entry represents a dive point
 * @typedef {Object} BreadcrumbEntry
 * @property {number} depth - The depth level (0-5)
 * @property {number} hexagram - The hexagram number (0-63) at this level
 * @property {number} line - The line that was dived through (0-5)
 * @property {string} lineName - Human-readable line name
 * @property {number} timestamp - When this dive occurred
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DepthContext = createContext(null);

export function DepthProvider({ children }) {
  const { hexagram, isVoid, freezeCompass } = usePolarity();
  const { language, vibrate } = useLanguage();
  
  // Core depth state
  const [depth, setDepth] = useState(SURFACE_DEPTH);
  const [selectedLine, setSelectedLine] = useState(null); // 0-5 or null
  const [breadcrumbs, setBreadcrumbs] = useState([]); // Array of BreadcrumbEntry
  const [isDiving, setIsDiving] = useState(false);
  const [isSurfacing, setIsSurfacing] = useState(false);
  
  // Track hexagram at each depth level
  const [depthHexagrams, setDepthHexagrams] = useState([hexagram]); // Index = depth
  
  // Pinch gesture state
  const pinchStartRef = useRef(null);
  const [isPinching, setIsPinching] = useState(false);
  
  // Get current line flavor
  const currentLineFlavor = useMemo(() => {
    if (selectedLine === null) return null;
    return LINE_FLAVORS[selectedLine];
  }, [selectedLine]);
  
  // Get haptic pattern for current depth
  const currentHaptics = useMemo(() => {
    return DEPTH_HAPTICS[Math.min(depth, MAX_DEPTH)] || DEPTH_HAPTICS[0];
  }, [depth]);
  
  // Calculate cumulative "flavor" from breadcrumb trail
  const cumulativeFlavor = useMemo(() => {
    if (breadcrumbs.length === 0) return null;
    
    // Blend colors from all dived lines
    const colors = breadcrumbs.map(b => LINE_FLAVORS[b.line]?.color || '#FFFFFF');
    const weights = breadcrumbs.map((_, i) => 1 / (i + 1)); // More recent = more weight
    
    // Calculate average haptic weight
    const avgHapticWeight = breadcrumbs.reduce((sum, b) => {
      return sum + (LINE_FLAVORS[b.line]?.hapticWeight || 0.5);
    }, 0) / breadcrumbs.length;
    
    return {
      colors,
      primaryColor: colors[colors.length - 1], // Most recent dive
      hapticWeight: avgHapticWeight,
      elements: breadcrumbs.map(b => LINE_FLAVORS[b.line]?.element),
      path: breadcrumbs.map(b => `${b.lineName}@${b.hexagram}`).join(' → '),
    };
  }, [breadcrumbs]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LINE SELECTION (Tap to target)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const selectLine = useCallback((lineIndex) => {
    if (isVoid || depth >= MAX_DEPTH) return;
    
    // Toggle selection
    if (selectedLine === lineIndex) {
      setSelectedLine(null);
    } else {
      setSelectedLine(lineIndex);
      
      // Haptic feedback for selection
      if (navigator.vibrate) {
        navigator.vibrate(currentHaptics.select);
      }
    }
  }, [isVoid, depth, selectedLine, currentHaptics]);
  
  const clearSelection = useCallback(() => {
    setSelectedLine(null);
  }, []);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DIVE (Pinch-in after line selection)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const dive = useCallback(() => {
    if (isVoid || depth >= MAX_DEPTH || selectedLine === null) return;
    
    setIsDiving(true);
    
    // Record breadcrumb
    const newBreadcrumb = {
      depth,
      hexagram: depthHexagrams[depth] || hexagram,
      line: selectedLine,
      lineName: LINE_FLAVORS[selectedLine]?.name || `Line ${selectedLine + 1}`,
      timestamp: Date.now(),
    };
    
    setBreadcrumbs(prev => [...prev, newBreadcrumb]);
    
    // Calculate new hexagram based on line flavor
    // The new hexagram is influenced by which line we dived through
    // This creates the "line-specific content" effect
    const currentHex = depthHexagrams[depth] || hexagram;
    const lineInfluence = selectedLine; // 0-5
    
    // XOR with line position creates deterministic but varied sub-hexagrams
    const newHexagram = (currentHex ^ (1 << lineInfluence)) % 64;
    
    // Update depth hexagrams
    setDepthHexagrams(prev => {
      const updated = [...prev];
      updated[depth + 1] = newHexagram;
      return updated;
    });
    
    // Haptic dive feedback (depth-scaled)
    if (navigator.vibrate) {
      navigator.vibrate(currentHaptics.dive);
    }
    
    // Increment depth
    setDepth(prev => Math.min(prev + 1, MAX_DEPTH));
    
    // Clear selection after dive
    setSelectedLine(null);
    
    // Animation complete
    setTimeout(() => setIsDiving(false), 400);
    
  }, [isVoid, depth, selectedLine, hexagram, depthHexagrams, currentHaptics]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SURFACE (Pinch-out or breadcrumb tap)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const surface = useCallback((targetDepth = null) => {
    if (depth === SURFACE_DEPTH) return;
    
    setIsSurfacing(true);
    
    // Determine target depth
    const newDepth = targetDepth !== null 
      ? Math.max(SURFACE_DEPTH, Math.min(targetDepth, depth - 1))
      : depth - 1;
    
    // Trim breadcrumbs to new depth
    setBreadcrumbs(prev => prev.slice(0, newDepth));
    
    // Trim depth hexagrams
    setDepthHexagrams(prev => prev.slice(0, newDepth + 1));
    
    // Haptic surface feedback
    if (navigator.vibrate) {
      navigator.vibrate(currentHaptics.surface);
    }
    
    // Update depth
    setDepth(newDepth);
    
    // Clear selection
    setSelectedLine(null);
    
    // Animation complete
    setTimeout(() => setIsSurfacing(false), 400);
    
  }, [depth, currentHaptics]);
  
  // Surface to specific breadcrumb (Power User move)
  const surfaceTo = useCallback((targetDepth) => {
    if (targetDepth >= depth || targetDepth < SURFACE_DEPTH) return;
    surface(targetDepth);
  }, [depth, surface]);
  
  // Surface all the way to macro (d=0)
  const surfaceToMacro = useCallback(() => {
    if (depth === SURFACE_DEPTH) return;
    
    setIsSurfacing(true);
    
    // Clear all breadcrumbs
    setBreadcrumbs([]);
    setDepthHexagrams([hexagram]);
    
    // Heavy haptic for full surface
    if (navigator.vibrate) {
      navigator.vibrate([60, 30, 60, 30, 100]);
    }
    
    setDepth(SURFACE_DEPTH);
    setSelectedLine(null);
    
    setTimeout(() => setIsSurfacing(false), 500);
    
  }, [depth, hexagram]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PINCH GESTURE HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const handlePinchStart = useCallback((distance) => {
    pinchStartRef.current = distance;
    setIsPinching(true);
  }, []);
  
  const handlePinchMove = useCallback((distance) => {
    if (!pinchStartRef.current) return;
    
    const delta = distance - pinchStartRef.current;
    const threshold = 50; // pixels
    
    if (delta < -threshold && selectedLine !== null) {
      // Pinch-in with selection = DIVE
      dive();
      pinchStartRef.current = null;
      setIsPinching(false);
    } else if (delta > threshold) {
      // Pinch-out = SURFACE
      surface();
      pinchStartRef.current = null;
      setIsPinching(false);
    }
  }, [selectedLine, dive, surface]);
  
  const handlePinchEnd = useCallback(() => {
    pinchStartRef.current = null;
    setIsPinching(false);
  }, []);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY FUNCTIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Get translated line name
  const getLineName = useCallback((lineIndex, lang = language) => {
    const flavor = LINE_FLAVORS[lineIndex];
    if (!flavor) return `Line ${lineIndex + 1}`;
    return flavor.translations[lang] || flavor.translations.en || flavor.name;
  }, [language]);
  
  // Check if we can dive (line selected and not at max depth)
  const canDive = depth < MAX_DEPTH && selectedLine !== null && !isVoid;
  
  // Check if we can surface (not at surface level)
  const canSurface = depth > SURFACE_DEPTH;
  
  // Get current depth's hexagram
  const currentHexagram = depthHexagrams[depth] ?? hexagram;
  
  // Depth percentage (0% at surface, 100% at max)
  const depthPercent = (depth / MAX_DEPTH) * 100;
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 36-BIT ADDRESS SYSTEM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Generate the full 36-bit address
  const address36 = useMemo(() => {
    // Pad array to 6 elements for full address
    const fullPath = [...depthHexagrams];
    while (fullPath.length < 6) {
      fullPath.push(0); // Unvisited layers are 0
    }
    return generateAddress36(fullPath);
  }, [depthHexagrams]);
  
  // Calculate unique room number (BigInt)
  const roomNumber = useMemo(() => {
    return calculateRoomNumber(depthHexagrams);
  }, [depthHexagrams]);
  
  // Human-readable coordinate string
  const coordinateString = useMemo(() => {
    return getCoordinateString(breadcrumbs, currentHexagram);
  }, [breadcrumbs, currentHexagram]);
  
  // Get volumetric visual scale for current depth
  const volumetricScale = useMemo(() => {
    return VOLUMETRIC_SCALE[Math.min(depth, MAX_DEPTH)] || VOLUMETRIC_SCALE[0];
  }, [depth]);
  
  // Check if at OMEGA POINT (deepest level)
  const isAtOmegaPoint = depth === MAX_DEPTH;
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRYSTALLINE SEED — Save session data
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const crystallizeSeed = useCallback(() => {
    return {
      address36,
      roomNumber: roomNumber.toString(), // Convert BigInt to string for JSON
      coordinate: coordinateString,
      depth,
      timestamp: Date.now(),
      path: breadcrumbs.map(b => ({
        hexagram: b.hexagram,
        line: b.line,
        lineName: b.lineName,
      })),
      hexagrams: [...depthHexagrams],
    };
  }, [address36, roomNumber, coordinateString, depth, breadcrumbs, depthHexagrams]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONTEXT VALUE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const value = useMemo(() => ({
    // State
    depth,
    depthPercent,
    selectedLine,
    breadcrumbs,
    isDiving,
    isSurfacing,
    isPinching,
    
    // Derived state
    currentHexagram,
    currentLineFlavor,
    currentHaptics,
    cumulativeFlavor,
    canDive,
    canSurface,
    
    // 36-Bit Address System
    address36,
    roomNumber,
    coordinateString,
    depthHexagrams,
    
    // Volumetric Visual Scale
    volumetricScale,
    isAtOmegaPoint,
    
    // Crystalline Seed
    crystallizeSeed,
    
    // Actions
    selectLine,
    clearSelection,
    dive,
    surface,
    surfaceTo,
    surfaceToMacro,
    
    // Pinch handlers
    handlePinchStart,
    handlePinchMove,
    handlePinchEnd,
    
    // Utilities
    getLineName,
    
    // Constants
    MAX_DEPTH,
    SURFACE_DEPTH,
    LINE_FLAVORS,
    DEPTH_HAPTICS,
    VOLUMETRIC_SCALE,
  }), [
    depth,
    depthPercent,
    selectedLine,
    breadcrumbs,
    isDiving,
    isSurfacing,
    isPinching,
    currentHexagram,
    currentLineFlavor,
    currentHaptics,
    cumulativeFlavor,
    canDive,
    canSurface,
    address36,
    roomNumber,
    coordinateString,
    depthHexagrams,
    volumetricScale,
    isAtOmegaPoint,
    crystallizeSeed,
    selectLine,
    clearSelection,
    dive,
    surface,
    surfaceTo,
    surfaceToMacro,
    handlePinchStart,
    handlePinchMove,
    handlePinchEnd,
    getLineName,
  ]);
  
  return (
    <DepthContext.Provider value={value}>
      {children}
    </DepthContext.Provider>
  );
}

export function useDepth() {
  const ctx = useContext(DepthContext);
  if (!ctx) {
    // Safe fallback for components outside provider
    return {
      depth: 0,
      depthPercent: 0,
      selectedLine: null,
      breadcrumbs: [],
      isDiving: false,
      isSurfacing: false,
      isPinching: false,
      currentHexagram: 7,
      currentLineFlavor: null,
      currentHaptics: DEPTH_HAPTICS[0],
      cumulativeFlavor: null,
      canDive: false,
      canSurface: false,
      // 36-Bit Address System
      address36: '000111|000000|000000|000000|000000|000000',
      roomNumber: 0n,
      coordinateString: 'G7',
      depthHexagrams: [7],
      // Volumetric
      volumetricScale: VOLUMETRIC_SCALE[0],
      isAtOmegaPoint: false,
      crystallizeSeed: () => ({}),
      // Actions
      selectLine: () => {},
      clearSelection: () => {},
      dive: () => {},
      surface: () => {},
      surfaceTo: () => {},
      surfaceToMacro: () => {},
      handlePinchStart: () => {},
      handlePinchMove: () => {},
      handlePinchEnd: () => {},
      getLineName: (i) => `Line ${i + 1}`,
      MAX_DEPTH,
      SURFACE_DEPTH,
      LINE_FLAVORS,
      DEPTH_HAPTICS,
      VOLUMETRIC_SCALE,
    };
  }
  return ctx;
}

export default DepthContext;
