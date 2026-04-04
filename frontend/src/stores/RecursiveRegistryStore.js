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
  
  // Version counter for atomic updates
  version: 0,
};

// ═══════════════════════════════════════════════════════════════════════════
// SUBSCRIBERS
// ═══════════════════════════════════════════════════════════════════════════

const subscribers = new Set();

function notifySubscribers() {
  subscribers.forEach(callback => callback());
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
    
    registryState = {
      ...registryState,
      isVoidMode: isVoid,
      version: registryState.version + 1,
    };
    
    notifySubscribers();
    console.log('[SYNC-01] VoidMode broadcast:', isVoid);
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
    
    // Setters
    setLanguage,
    setDepth,
    setHexagram,
    setGravity,
    setVoidMode,
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
