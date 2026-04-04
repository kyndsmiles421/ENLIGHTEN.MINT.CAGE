/**
 * OrbitalWidgetSystem.js — Spherical Widget Positioning Engine
 * 
 * THE SOLAR SYSTEM UI
 * 
 * Transforms flat z-index chaos into a clean orbital layout where:
 * - Widgets orbit around a central focal point
 * - Collision avoidance ensures no overlaps
 * - Depth layering creates true 3D separation
 * - Active widgets "orbit forward" while inactive recede
 * 
 * ORBITAL PATHS:
 * - Inner Orbit (r=80px): Primary actions, always visible
 * - Middle Orbit (r=160px): Secondary widgets, contextual
 * - Outer Orbit (r=240px): Background elements, fade on focus
 * 
 * COLLISION AVOIDANCE:
 * - Each widget claims an angular sector
 * - If sectors overlap, widgets rotate to nearest free position
 * - Minimum angular separation: 45° between widgets
 */

// ═══════════════════════════════════════════════════════════════════════════
// ORBITAL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const ORBITAL_CONFIG = {
  // Orbital radii (distance from screen center/anchor)
  ORBITS: {
    CORE: 0,        // Center point (the anchor)
    INNER: 100,     // Primary widgets
    MIDDLE: 200,    // Secondary widgets  
    OUTER: 300,     // Background/tertiary
  },
  
  // Angular positions (degrees, 0° = right, 90° = bottom)
  POSITIONS: {
    TOP: 270,
    TOP_RIGHT: 315,
    RIGHT: 0,
    BOTTOM_RIGHT: 45,
    BOTTOM: 90,
    BOTTOM_LEFT: 135,
    LEFT: 180,
    TOP_LEFT: 225,
  },
  
  // Minimum angular separation between widgets (degrees)
  MIN_SEPARATION: 45,
  
  // Z-index layers (higher = closer to viewer)
  Z_LAYERS: {
    BACKGROUND: 10,
    RECEDED: 50,
    NEUTRAL: 100,
    ACTIVE: 200,
    FOCUSED: 500,
    OVERLAY: 1000,
  },
  
  // Opacity by depth
  OPACITY: {
    BACKGROUND: 0.4,
    RECEDED: 0.6,
    NEUTRAL: 0.85,
    ACTIVE: 1.0,
  },
  
  // Scale by depth (perspective effect)
  SCALE: {
    BACKGROUND: 0.85,
    RECEDED: 0.9,
    NEUTRAL: 1.0,
    ACTIVE: 1.05,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// WIDGET REGISTRY (tracks active widgets and their positions)
// ═══════════════════════════════════════════════════════════════════════════

let widgetRegistry = new Map();
let registryVersion = 0;

/**
 * Register a widget in the orbital system
 * @param {string} id - Unique widget identifier
 * @param {Object} config - Widget configuration
 */
export function registerWidget(id, config) {
  const {
    preferredAngle = 0,
    orbit = 'MIDDLE',
    priority = 'NEUTRAL',
    angularWidth = 60, // How much angular space the widget needs
  } = config;
  
  widgetRegistry.set(id, {
    id,
    preferredAngle,
    currentAngle: preferredAngle,
    orbit,
    priority,
    angularWidth,
    isActive: false,
    isVisible: true,
  });
  
  registryVersion++;
  resolveCollisions();
}

/**
 * Unregister a widget
 */
export function unregisterWidget(id) {
  widgetRegistry.delete(id);
  registryVersion++;
  resolveCollisions();
}

/**
 * Set widget active state
 */
export function setWidgetActive(id, isActive) {
  const widget = widgetRegistry.get(id);
  if (widget) {
    widget.isActive = isActive;
    widget.priority = isActive ? 'ACTIVE' : 'NEUTRAL';
    registryVersion++;
    resolveCollisions();
  }
}

/**
 * Set widget visibility
 */
export function setWidgetVisible(id, isVisible) {
  const widget = widgetRegistry.get(id);
  if (widget) {
    widget.isVisible = isVisible;
    registryVersion++;
    resolveCollisions();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLISION AVOIDANCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Resolve angular collisions between widgets
 * Widgets are spread out to maintain minimum separation
 */
function resolveCollisions() {
  const visibleWidgets = Array.from(widgetRegistry.values())
    .filter(w => w.isVisible)
    .sort((a, b) => {
      // Active widgets have priority for their preferred positions
      if (a.isActive !== b.isActive) return b.isActive - a.isActive;
      return a.preferredAngle - b.preferredAngle;
    });
  
  // Group by orbit
  const orbitGroups = {};
  visibleWidgets.forEach(w => {
    if (!orbitGroups[w.orbit]) orbitGroups[w.orbit] = [];
    orbitGroups[w.orbit].push(w);
  });
  
  // Resolve collisions within each orbit
  Object.values(orbitGroups).forEach(group => {
    if (group.length <= 1) {
      // Single widget, use preferred position
      group.forEach(w => w.currentAngle = w.preferredAngle);
      return;
    }
    
    // Multiple widgets - spread them out
    const minSep = ORBITAL_CONFIG.MIN_SEPARATION;
    const totalNeeded = group.reduce((sum, w) => sum + Math.max(w.angularWidth, minSep), 0);
    
    if (totalNeeded <= 360) {
      // Enough space - just ensure minimum separation
      let currentAngle = group[0].preferredAngle;
      group.forEach((w, i) => {
        if (i === 0) {
          w.currentAngle = currentAngle;
        } else {
          const prevWidget = group[i - 1];
          const minGap = (prevWidget.angularWidth + w.angularWidth) / 2 + minSep;
          const preferredGap = normalizeAngle(w.preferredAngle - prevWidget.currentAngle);
          
          if (preferredGap < minGap) {
            // Too close, push it out
            currentAngle = normalizeAngle(prevWidget.currentAngle + minGap);
          } else {
            currentAngle = w.preferredAngle;
          }
          w.currentAngle = currentAngle;
        }
      });
    } else {
      // Not enough space - distribute evenly
      const angleStep = 360 / group.length;
      group.forEach((w, i) => {
        w.currentAngle = normalizeAngle(group[0].preferredAngle + (i * angleStep));
      });
    }
  });
}

/**
 * Normalize angle to 0-360 range
 */
function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

// ═══════════════════════════════════════════════════════════════════════════
// POSITION CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate the screen position for a widget
 * @param {string} id - Widget ID
 * @param {Object} anchor - Anchor point {x, y} (defaults to screen center)
 * @returns {Object} Position and style info
 */
export function getWidgetPosition(id, anchor = null) {
  const widget = widgetRegistry.get(id);
  if (!widget) {
    return {
      x: 0, y: 0,
      zIndex: ORBITAL_CONFIG.Z_LAYERS.NEUTRAL,
      opacity: 1,
      scale: 1,
    };
  }
  
  // Default anchor is viewport center
  const anchorX = anchor?.x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
  const anchorY = anchor?.y ?? (typeof window !== 'undefined' ? window.innerHeight / 2 : 400);
  
  // Get orbital radius
  const radius = ORBITAL_CONFIG.ORBITS[widget.orbit] || ORBITAL_CONFIG.ORBITS.MIDDLE;
  
  // Convert angle to radians
  const angleRad = (widget.currentAngle * Math.PI) / 180;
  
  // Calculate position
  const x = anchorX + radius * Math.cos(angleRad);
  const y = anchorY + radius * Math.sin(angleRad);
  
  // Get depth-based properties
  const priorityLevel = widget.isActive ? 'ACTIVE' : 'NEUTRAL';
  const zIndex = ORBITAL_CONFIG.Z_LAYERS[priorityLevel];
  const opacity = ORBITAL_CONFIG.OPACITY[priorityLevel];
  const scale = ORBITAL_CONFIG.SCALE[priorityLevel];
  
  return {
    x,
    y,
    angle: widget.currentAngle,
    radius,
    zIndex,
    opacity,
    scale,
    isActive: widget.isActive,
    isVisible: widget.isVisible,
  };
}

/**
 * Get CSS style object for orbital positioning
 * @param {string} id - Widget ID
 * @param {Object} options - Additional options
 */
export function getOrbitalStyle(id, options = {}) {
  const { 
    anchor = null,
    useTransform = true,
    includeTransition = true,
  } = options;
  
  const pos = getWidgetPosition(id, anchor);
  
  const style = {
    position: 'fixed',
    zIndex: pos.zIndex,
    opacity: pos.opacity,
  };
  
  if (useTransform) {
    style.left = '50%';
    style.top = '50%';
    style.transform = `translate(-50%, -50%) translate(${pos.x - (anchor?.x ?? window.innerWidth / 2)}px, ${pos.y - (anchor?.y ?? window.innerHeight / 2)}px) scale(${pos.scale})`;
  } else {
    style.left = pos.x;
    style.top = pos.y;
    style.transform = `translate(-50%, -50%) scale(${pos.scale})`;
  }
  
  if (includeTransition) {
    style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out';
  }
  
  return style;
}

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * useOrbitalWidget - Hook for managing a widget's orbital position
 * 
 * @param {string} id - Unique widget identifier
 * @param {Object} config - Widget configuration
 * @returns {Object} Position, style, and control functions
 */
export function useOrbitalWidget(id, config = {}) {
  const {
    preferredAngle = 0,
    orbit = 'MIDDLE',
    angularWidth = 60,
    autoRegister = true,
  } = config;
  
  const [version, setVersion] = useState(0);
  
  // Register on mount
  useEffect(() => {
    if (autoRegister) {
      registerWidget(id, { preferredAngle, orbit, angularWidth });
    }
    
    // Subscribe to changes
    const interval = setInterval(() => {
      if (registryVersion !== version) {
        setVersion(registryVersion);
      }
    }, 50);
    
    return () => {
      clearInterval(interval);
      if (autoRegister) {
        unregisterWidget(id);
      }
    };
  }, [id, preferredAngle, orbit, angularWidth, autoRegister, version]);
  
  const position = useMemo(() => getWidgetPosition(id), [id, version]);
  const style = useMemo(() => getOrbitalStyle(id), [id, version]);
  
  const setActive = useCallback((active) => {
    setWidgetActive(id, active);
  }, [id]);
  
  const setVisible = useCallback((visible) => {
    setWidgetVisible(id, visible);
  }, [id]);
  
  return {
    position,
    style,
    setActive,
    setVisible,
    isActive: position.isActive,
    isVisible: position.isVisible,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESET WIDGET POSITIONS
// ═══════════════════════════════════════════════════════════════════════════

export const WIDGET_PRESETS = {
  // Sage/Character dialogue - bottom right
  SAGE_DIALOGUE: {
    preferredAngle: ORBITAL_CONFIG.POSITIONS.BOTTOM_RIGHT,
    orbit: 'INNER',
    angularWidth: 90,
  },
  
  // Navigation dock - left side
  NAV_DOCK: {
    preferredAngle: ORBITAL_CONFIG.POSITIONS.LEFT,
    orbit: 'MIDDLE',
    angularWidth: 120,
  },
  
  // Tooltips/Hints - top
  TOOLTIP: {
    preferredAngle: ORBITAL_CONFIG.POSITIONS.TOP,
    orbit: 'OUTER',
    angularWidth: 60,
  },
  
  // Action buttons - bottom
  ACTIONS: {
    preferredAngle: ORBITAL_CONFIG.POSITIONS.BOTTOM,
    orbit: 'INNER',
    angularWidth: 90,
  },
  
  // Status indicators - top right
  STATUS: {
    preferredAngle: ORBITAL_CONFIG.POSITIONS.TOP_RIGHT,
    orbit: 'OUTER',
    angularWidth: 45,
  },
  
  // Hexagram display - right
  HEXAGRAM: {
    preferredAngle: ORBITAL_CONFIG.POSITIONS.RIGHT,
    orbit: 'MIDDLE',
    angularWidth: 90,
  },
};

export default {
  ORBITAL_CONFIG,
  WIDGET_PRESETS,
  registerWidget,
  unregisterWidget,
  setWidgetActive,
  setWidgetVisible,
  getWidgetPosition,
  getOrbitalStyle,
  useOrbitalWidget,
};
