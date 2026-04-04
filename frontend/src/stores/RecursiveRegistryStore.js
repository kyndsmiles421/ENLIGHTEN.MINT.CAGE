/**
 * RecursiveRegistryStore.js — SYNC-01: Global Registry Singleton
 * 
 * THE ATOMIC STATE BROADCAST
 * 
 * Uses React 18's useSyncExternalStore pattern to ensure language/symbolic
 * state changes are ATOMIC across all 6 recursive depth layers.
 * 
 * PROBLEM SOLVED:
 * - Language "ghosting" during deep navigation (L1->L5)
 * - State drift causing "Maximum update depth exceeded" cascades
 * - Asynchronous re-renders across layers
 * 
 * ARCHITECTURE:
 * - Single Source of Truth: ONE store object
 * - Atomic Updates: State changes complete before any component re-renders
 * - Version Counter: Forces synchronous re-render on all subscribers
 * 
 * USAGE:
 * import { useRecursiveRegistry } from '../stores/RecursiveRegistryStore';
 * const { language, depth, setLanguage, setDepth } = useRecursiveRegistry();
 */

// ═══════════════════════════════════════════════════════════════════════════
// STORE STATE
// ═══════════════════════════════════════════════════════════════════════════

let registryState = {
  // Language state
  language: localStorage.getItem('cosmic_lang') || 'en',
  previousLanguage: null,
  isRecoding: false,
  
  // Depth state (for recursive layers)
  currentDepth: 0,
  maxDepth: 6,
  
  // Symbolic state (hexagram, gravity)
  activeHexagram: 63,  // Default: Jì Jì (SOURCE)
  gravity: 0.5,
  isVoidMode: false,
  
  // VOID-01: Global Bloom State (persists across depth transitions)
  bloomState: {
    isActive: false,
    opacity: 0,
    color: 'jade',  // 'jade' | 'void' (purple)
    exitVelocity: 0,  // Used to carry momentum across transitions
    depthAtActivation: 0,
  },
  
  // HUD-01: Lattice expansion state for widget breathing
  latticeScale: 1.0,  // 1.0 = normal, >1 = expanded
  widgetScale: 1.0,   // Inverse of lattice scale for "breathing"
  
  // Version counter for atomic updates
  version: 0,
};

// ═══════════════════════════════════════════════════════════════════════════
// SUBSCRIBERS
// ═══════════════════════════════════════════════════════════════════════════

const subscribers = new Set();
let notifyScheduled = false;
let notifyCount = 0;
const MAX_NOTIFY_PER_FRAME = 10;  // LOOP-FIX: Prevent infinite notify loops

function notifySubscribers() {
  // LOOP-FIX: Guard against infinite loops
  if (notifyScheduled) return;
  
  notifyCount++;
  if (notifyCount > MAX_NOTIFY_PER_FRAME) {
    console.warn('[LOOP-FIX] Max notifications exceeded, throttling');
    notifyScheduled = true;
    requestAnimationFrame(() => {
      notifyScheduled = false;
      notifyCount = 0;
      subscribers.forEach(callback => callback());
    });
    return;
  }
  
  subscribers.forEach(callback => callback());
  
  // Reset count after frame
  if (!notifyScheduled) {
    notifyScheduled = true;
    requestAnimationFrame(() => {
      notifyScheduled = false;
      notifyCount = 0;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE API
// ═══════════════════════════════════════════════════════════════════════════

export const RecursiveRegistryStore = {
  // Get current snapshot (for useSyncExternalStore)
  getSnapshot() {
    return registryState;
  },
  
  // Get server snapshot (for SSR - same as client)
  getServerSnapshot() {
    return registryState;
  },
  
  // Subscribe to changes
  subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // ATOMIC STATE SETTERS
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Set language ATOMICALLY across all layers
   * @param {string} newLang - Language code
   */
  setLanguage(newLang) {
    if (newLang === registryState.language) return;
    
    // Atomic state update
    registryState = {
      ...registryState,
      previousLanguage: registryState.language,
      language: newLang,
      isRecoding: true,
      version: registryState.version + 1,
    };
    
    // Persist to localStorage
    localStorage.setItem('cosmic_lang', newLang);
    
    // Notify ALL subscribers atomically
    notifySubscribers();
    
    // Clear recoding flag after animation
    setTimeout(() => {
      registryState = {
        ...registryState,
        isRecoding: false,
        version: registryState.version + 1,
      };
      notifySubscribers();
    }, 500);
    
    console.log('[SYNC-01] Language broadcast:', newLang);
  },
  
  /**
   * Set depth ATOMICALLY
   * @param {number} newDepth - Depth level (0-6)
   */
  setDepth(newDepth) {
    const clampedDepth = Math.max(0, Math.min(newDepth, registryState.maxDepth));
    if (clampedDepth === registryState.currentDepth) return;
    
    registryState = {
      ...registryState,
      currentDepth: clampedDepth,
      version: registryState.version + 1,
    };
    
    notifySubscribers();
    console.log('[SYNC-01] Depth broadcast:', clampedDepth);
  },
  
  /**
   * Set hexagram ATOMICALLY
   * @param {number} hexNumber - Hexagram number (1-64)
   */
  setHexagram(hexNumber) {
    if (hexNumber === registryState.activeHexagram) return;
    
    registryState = {
      ...registryState,
      activeHexagram: hexNumber,
      version: registryState.version + 1,
    };
    
    notifySubscribers();
    console.log('[SYNC-01] Hexagram broadcast:', hexNumber);
  },
  
  /**
   * Set gravity ATOMICALLY
   * @param {number} gravity - Gravity value (0-1)
   */
  setGravity(gravity) {
    const clampedGravity = Math.max(0, Math.min(1, gravity));
    if (Math.abs(clampedGravity - registryState.gravity) < 0.001) return;
    
    registryState = {
      ...registryState,
      gravity: clampedGravity,
      version: registryState.version + 1,
    };
    
    notifySubscribers();
  },
  
  /**
   * Set void mode ATOMICALLY
   * @param {boolean} isVoid - Void mode state
   */
  setVoidMode(isVoid) {
    if (isVoid === registryState.isVoidMode) return;
    
    // VOID-01: Update bloom color based on mode
    const newBloomState = {
      ...registryState.bloomState,
      color: isVoid ? 'void' : 'jade',
    };
    
    registryState = {
      ...registryState,
      isVoidMode: isVoid,
      bloomState: newBloomState,
      version: registryState.version + 1,
    };
    
    notifySubscribers();
    console.log('[SYNC-01] VoidMode broadcast:', isVoid);
  },
  
  /**
   * VOID-01: Set bloom state ATOMICALLY
   * Persists jade/void opacity across depth transitions
   * @param {Object} bloom - Bloom state updates
   */
  setBloomState(bloom) {
    const newBloomState = {
      ...registryState.bloomState,
      ...bloom,
    };
    
    registryState = {
      ...registryState,
      bloomState: newBloomState,
      version: registryState.version + 1,
    };
    
    notifySubscribers();
    
    if (bloom.isActive !== undefined) {
      console.log('[VOID-01] Bloom state:', bloom.isActive ? 'ACTIVE' : 'INACTIVE', 
        'opacity:', newBloomState.opacity.toFixed(2));
    }
  },
  
  /**
   * HUD-01: Set lattice scale and auto-calculate widget scale
   * Widgets "inhale" as lattice "exhales"
   * @param {number} scale - Lattice scale (1.0 = normal)
   */
  setLatticeScale(scale) {
    const clampedScale = Math.max(0.5, Math.min(2.0, scale));
    if (Math.abs(clampedScale - registryState.latticeScale) < 0.01) return;
    
    // HUD-01: Calculate inverse widget scale for "breathing" effect
    // When lattice is 1.2x, widgets should be ~0.85x (inverse relationship)
    const widgetScale = Math.max(0.7, Math.min(1.0, 1 / Math.pow(clampedScale, 0.5)));
    
    registryState = {
      ...registryState,
      latticeScale: clampedScale,
      widgetScale: widgetScale,
      version: registryState.version + 1,
    };
    
    notifySubscribers();
    console.log('[HUD-01] Lattice scale:', clampedScale.toFixed(2), 
      'Widget scale:', widgetScale.toFixed(2));
  },
  
  /**
   * Batch update multiple values ATOMICALLY
   * Prevents multiple re-renders when updating several values at once
   * @param {Object} updates - Object with state updates
   */
  batchUpdate(updates) {
    let hasChanges = false;
    const newState = { ...registryState };
    
    if (updates.language !== undefined && updates.language !== registryState.language) {
      newState.previousLanguage = registryState.language;
      newState.language = updates.language;
      newState.isRecoding = true;
      localStorage.setItem('cosmic_lang', updates.language);
      hasChanges = true;
    }
    
    if (updates.depth !== undefined && updates.depth !== registryState.currentDepth) {
      newState.currentDepth = Math.max(0, Math.min(updates.depth, registryState.maxDepth));
      hasChanges = true;
    }
    
    if (updates.hexagram !== undefined && updates.hexagram !== registryState.activeHexagram) {
      newState.activeHexagram = updates.hexagram;
      hasChanges = true;
    }
    
    if (updates.gravity !== undefined && Math.abs(updates.gravity - registryState.gravity) >= 0.001) {
      newState.gravity = Math.max(0, Math.min(1, updates.gravity));
      hasChanges = true;
    }
    
    if (updates.isVoidMode !== undefined && updates.isVoidMode !== registryState.isVoidMode) {
      newState.isVoidMode = updates.isVoidMode;
      hasChanges = true;
    }
    
    if (hasChanges) {
      newState.version = registryState.version + 1;
      registryState = newState;
      notifySubscribers();
      console.log('[SYNC-01] Batch update:', Object.keys(updates).join(', '));
      
      // Clear recoding flag if language changed
      if (updates.language !== undefined) {
        setTimeout(() => {
          registryState = {
            ...registryState,
            isRecoding: false,
            version: registryState.version + 1,
          };
          notifySubscribers();
        }, 500);
      }
    }
  },
  
  /**
   * Reset to initial state
   */
  reset() {
    registryState = {
      language: 'en',
      previousLanguage: null,
      isRecoding: false,
      currentDepth: 0,
      maxDepth: 6,
      activeHexagram: 63,
      gravity: 0.5,
      isVoidMode: false,
      version: registryState.version + 1,
    };
    localStorage.setItem('cosmic_lang', 'en');
    notifySubscribers();
    console.log('[SYNC-01] Registry reset');
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK (useSyncExternalStore pattern)
// ═══════════════════════════════════════════════════════════════════════════

import { useSyncExternalStore, useCallback } from 'react';

/**
 * useRecursiveRegistry — Hook for accessing the global registry
 * 
 * Uses useSyncExternalStore for ATOMIC updates across all components.
 * When ANY value changes, ALL subscribed components re-render SYNCHRONOUSLY.
 * 
 * @returns {Object} Registry state and setters
 */
export function useRecursiveRegistry() {
  const state = useSyncExternalStore(
    RecursiveRegistryStore.subscribe,
    RecursiveRegistryStore.getSnapshot,
    RecursiveRegistryStore.getServerSnapshot
  );
  
  // Memoized setters (stable references)
  const setLanguage = useCallback((lang) => RecursiveRegistryStore.setLanguage(lang), []);
  const setDepth = useCallback((depth) => RecursiveRegistryStore.setDepth(depth), []);
  const setHexagram = useCallback((hex) => RecursiveRegistryStore.setHexagram(hex), []);
  const setGravity = useCallback((g) => RecursiveRegistryStore.setGravity(g), []);
  const setVoidMode = useCallback((v) => RecursiveRegistryStore.setVoidMode(v), []);
  const setBloomState = useCallback((bloom) => RecursiveRegistryStore.setBloomState(bloom), []);
  const setLatticeScale = useCallback((scale) => RecursiveRegistryStore.setLatticeScale(scale), []);
  const batchUpdate = useCallback((updates) => RecursiveRegistryStore.batchUpdate(updates), []);
  const reset = useCallback(() => RecursiveRegistryStore.reset(), []);
  
  return {
    // State
    language: state.language,
    previousLanguage: state.previousLanguage,
    isRecoding: state.isRecoding,
    currentDepth: state.currentDepth,
    maxDepth: state.maxDepth,
    activeHexagram: state.activeHexagram,
    gravity: state.gravity,
    isVoidMode: state.isVoidMode,
    version: state.version,
    
    // VOID-01: Bloom state
    bloomState: state.bloomState,
    
    // HUD-01: Lattice/widget scales for breathing effect
    latticeScale: state.latticeScale,
    widgetScale: state.widgetScale,
    
    // Setters
    setLanguage,
    setDepth,
    setHexagram,
    setGravity,
    setVoidMode,
    setBloomState,
    setLatticeScale,
    batchUpdate,
    reset,
  };
}

/**
 * Selector hook for performance optimization
 * Only re-renders when selected value changes
 * 
 * @param {Function} selector - Function to select specific state
 * @returns {any} Selected state
 */
export function useRegistrySelector(selector) {
  return useSyncExternalStore(
    RecursiveRegistryStore.subscribe,
    () => selector(RecursiveRegistryStore.getSnapshot()),
    () => selector(RecursiveRegistryStore.getServerSnapshot())
  );
}

export default RecursiveRegistryStore;
