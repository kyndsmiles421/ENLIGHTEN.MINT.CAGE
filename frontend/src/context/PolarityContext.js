/**
 * PolarityContext.js — The Global Gravity System
 * 
 * The "Vertical Torus" architecture - gravity flows from
 * Hollow Earth (dense, grounded) to Matrix (light, floating).
 * 
 * Layer Depth:
 * - Hollow Earth (0.0-0.3): Heavy, dark obsidian glass
 * - Core (0.4-0.6): Balanced transition zone
 * - Matrix (0.7-1.0): Light, prismatic white-gold
 * 
 * gravity = Math.sin(layerDepth * Math.PI / 2)
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LAYER CLASSIFICATION — Route to Depth Mapping
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LAYER_MAP = {
  // Hollow Earth — Dense, foundational, grounded (0.0-0.3)
  hollow: {
    depth: 0.15,
    routes: ['/meditation', '/breathing', '/frequencies', '/mantras', '/wellness'],
    feel: 'dense',
    sageMode: 'hollow',
    audioFlavor: 'thud',
    translucency: 'obsidian', // dark glass
  },
  
  // Core — The heart center, balanced (0.4-0.6)
  core: {
    depth: 0.5,
    routes: ['/dashboard', '/journal', '/settings', '/profile'],
    feel: 'balanced',
    sageMode: 'core',
    audioFlavor: 'neutral',
    translucency: 'amber', // warm glass
  },
  
  // Matrix — Expansive, celestial, floating (0.7-1.0)
  matrix: {
    depth: 0.85,
    routes: ['/oracle', '/explore', '/community', '/achievements', '/ritual', '/tarot', '/iching'],
    feel: 'expansive',
    sageMode: 'matrix',
    audioFlavor: 'shimmer',
    translucency: 'prismatic', // white-gold glass
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRAVITY CALCULATIONS
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
 * Calculate UI physics based on gravity
 */
const calculatePhysics = (gravity) => ({
  // Dock behavior
  dockSnapStrength: 1 - gravity * 0.6, // Heavy at bottom, light at top
  dockMagneticPull: gravity * 0.8, // Pulls toward 160px line in Matrix
  dockDragResistance: 1 - gravity * 0.5, // Harder to drag in Hollow
  
  // Visual density
  blurIntensity: 12 + (1 - gravity) * 12, // More blur in Hollow (24px max)
  opacity: 0.85 + gravity * 0.1, // Slightly more opaque in Matrix
  
  // Animation timing
  transitionSpeed: 0.3 + gravity * 0.2, // Faster in Matrix
  springDamping: 25 - gravity * 10, // Bouncier in Matrix
  
  // Color temperature
  warmth: 1 - gravity, // Warmer (amber) in Hollow, cooler in Matrix
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
      };
    case 'amber':
      return {
        background: `rgba(15, 12, 10, ${0.88})`,
        border: `rgba(201, 169, 98, ${0.25})`,
        glow: 'rgba(201, 169, 98, 0.15)',
        accent: '#C9A962',
      };
    case 'prismatic':
      return {
        background: `rgba(20, 20, 30, ${0.82 + gravity * 0.08})`,
        border: `rgba(255, 255, 255, ${0.15 + gravity * 0.1})`,
        glow: `rgba(200, 200, 255, ${0.1 + gravity * 0.15})`,
        accent: '#E8E4FF',
      };
    default:
      return {
        background: 'rgba(10, 10, 18, 0.9)',
        border: 'rgba(255, 255, 255, 0.1)',
        glow: 'rgba(192, 132, 252, 0.1)',
        accent: '#C084FC',
      };
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PolarityContext = createContext(null);

export function PolarityProvider({ children }) {
  const location = useLocation();
  const [currentLayer, setCurrentLayer] = useState(null);
  const [previousLayer, setPreviousLayer] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Calculate current layer from route
  useEffect(() => {
    const layer = getLayerFromPath(location.pathname);
    
    if (currentLayer && layer.name !== currentLayer.name) {
      // Layer transition detected
      setPreviousLayer(currentLayer);
      setIsTransitioning(true);
      
      // Transition duration based on layer distance
      const distance = Math.abs(layer.depth - currentLayer.depth);
      const duration = 300 + distance * 500; // 300-800ms
      
      setTimeout(() => setIsTransitioning(false), duration);
    }
    
    setCurrentLayer(layer);
  }, [location.pathname, currentLayer]);
  
  // Calculate gravity and physics
  const gravity = useMemo(() => {
    if (!currentLayer) return 0.5;
    return calculateGravity(currentLayer.depth);
  }, [currentLayer]);
  
  const physics = useMemo(() => calculatePhysics(gravity), [gravity]);
  
  const colors = useMemo(() => {
    if (!currentLayer) return getTranslucencyColors('amber', 0.5);
    return getTranslucencyColors(currentLayer.translucency, gravity);
  }, [currentLayer, gravity]);
  
  // Determine if crossing the 0.5 threshold (Sage inversion point)
  const crossedThreshold = useMemo(() => {
    if (!previousLayer || !currentLayer) return false;
    const prevGravity = calculateGravity(previousLayer.depth);
    const currGravity = gravity;
    return (prevGravity < 0.5 && currGravity >= 0.5) || (prevGravity >= 0.5 && currGravity < 0.5);
  }, [previousLayer, currentLayer, gravity]);
  
  // Get Sage mode for current layer
  const sageMode = currentLayer?.sageMode || 'core';
  
  // Audio flavor for stop button
  const audioFlavor = currentLayer?.audioFlavor || 'neutral';
  
  // Layer transition direction
  const transitionDirection = useMemo(() => {
    if (!previousLayer || !currentLayer) return 'none';
    return currentLayer.depth > previousLayer.depth ? 'ascending' : 'descending';
  }, [previousLayer, currentLayer]);
  
  // Helper to check if in specific layer
  const isInHollow = gravity < 0.35;
  const isInCore = gravity >= 0.35 && gravity < 0.65;
  const isInMatrix = gravity >= 0.65;
  
  const value = {
    // Layer info
    currentLayer,
    previousLayer,
    layerName: currentLayer?.name || 'core',
    
    // Gravity system
    gravity,
    depth: currentLayer?.depth || 0.5,
    
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
      colors: getTranslucencyColors('amber', 0.5),
      physics: calculatePhysics(0.5),
    };
  }
  return ctx;
}

// Export utilities
export { calculateGravity, getLayerFromPath, getTranslucencyColors, calculatePhysics, LAYER_MAP };

export default PolarityContext;
