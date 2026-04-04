import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ORBITAL STATE SENTINEL — Finite State Machine for Orb Interactions
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Prevents illegal state transitions like:
 * - Extracting while already navigating
 * - Double-tap glitches
 * - Interrupt mid-animation bugs
 * 
 * Valid transitions:
 * IDLE → BLOOMED (tap core)
 * BLOOMED → EXTRACTED (tap/drag orb)
 * BLOOMED → IDLE (tap core to collapse)
 * EXTRACTED → NAVIGATING (tap extracted orb)
 * EXTRACTED → BLOOMED (tap X to snapback)
 * NAVIGATING → IDLE (navigation complete)
 */

// ═══ STATE DEFINITIONS ═══
export const OrbitalStates = {
  IDLE: 'IDLE',
  BLOOMED: 'BLOOMED',
  EXTRACTED: 'EXTRACTED',
  NAVIGATING: 'NAVIGATING',
};

// ═══ VALID TRANSITIONS ═══
const VALID_TRANSITIONS = {
  [OrbitalStates.IDLE]: [OrbitalStates.BLOOMED],
  [OrbitalStates.BLOOMED]: [OrbitalStates.EXTRACTED, OrbitalStates.IDLE],
  [OrbitalStates.EXTRACTED]: [OrbitalStates.NAVIGATING, OrbitalStates.BLOOMED],
  [OrbitalStates.NAVIGATING]: [OrbitalStates.IDLE],
};

// ═══ ACTIONS ═══
const ACTIONS = {
  BLOOM: 'BLOOM',
  EXTRACT: 'EXTRACT',
  NAVIGATE: 'NAVIGATE',
  COLLAPSE: 'COLLAPSE',
  SNAPBACK: 'SNAPBACK',
  RESET: 'RESET',
};

// ═══ STATE → ACTION MAPPING ═══
const ACTION_TRANSITIONS = {
  [ACTIONS.BLOOM]: { from: [OrbitalStates.IDLE], to: OrbitalStates.BLOOMED },
  [ACTIONS.EXTRACT]: { from: [OrbitalStates.BLOOMED], to: OrbitalStates.EXTRACTED },
  [ACTIONS.NAVIGATE]: { from: [OrbitalStates.EXTRACTED], to: OrbitalStates.NAVIGATING },
  [ACTIONS.COLLAPSE]: { from: [OrbitalStates.BLOOMED], to: OrbitalStates.IDLE },
  [ACTIONS.SNAPBACK]: { from: [OrbitalStates.EXTRACTED], to: OrbitalStates.BLOOMED },
  [ACTIONS.RESET]: { from: Object.values(OrbitalStates), to: OrbitalStates.IDLE },
};

// ═══ INITIAL STATE ═══
const initialState = {
  currentState: OrbitalStates.IDLE,
  extractedOrbId: null,
  navigationTarget: null,
  transitionLocked: false,
  lastTransitionTime: 0,
  transitionHistory: [],
};

// ═══ REDUCER ═══
function orbitalReducer(state, action) {
  const now = Date.now();
  const MIN_TRANSITION_GAP = 100; // Prevent rapid-fire transitions
  
  // Transition lock check
  if (state.transitionLocked && action.type !== ACTIONS.RESET) {
    console.warn(`[Sentinel] Blocked: Transition locked during ${state.currentState}`);
    return state;
  }
  
  // Debounce rapid transitions
  if (now - state.lastTransitionTime < MIN_TRANSITION_GAP && action.type !== ACTIONS.RESET) {
    console.warn(`[Sentinel] Blocked: Too rapid (${now - state.lastTransitionTime}ms)`);
    return state;
  }

  const transition = ACTION_TRANSITIONS[action.type];
  if (!transition) {
    console.warn(`[Sentinel] Unknown action: ${action.type}`);
    return state;
  }

  // Validate transition is allowed from current state
  if (!transition.from.includes(state.currentState)) {
    console.warn(`[Sentinel] Invalid: ${action.type} not allowed from ${state.currentState}`);
    return state;
  }

  // Build new state
  const newState = {
    ...state,
    currentState: transition.to,
    lastTransitionTime: now,
    transitionHistory: [
      ...state.transitionHistory.slice(-9), // Keep last 10
      { from: state.currentState, to: transition.to, action: action.type, time: now },
    ],
  };

  // Handle specific action payloads
  switch (action.type) {
    case ACTIONS.EXTRACT:
      return { ...newState, extractedOrbId: action.payload?.orbId || null };
    case ACTIONS.NAVIGATE:
      return { 
        ...newState, 
        navigationTarget: action.payload?.path || null,
        transitionLocked: true, // Lock during navigation
      };
    case ACTIONS.SNAPBACK:
    case ACTIONS.COLLAPSE:
      return { ...newState, extractedOrbId: null };
    case ACTIONS.RESET:
      return { ...initialState, lastTransitionTime: now };
    default:
      return newState;
  }
}

// ═══ CONTEXT ═══
const OrbitalSentinelContext = createContext(null);

// ═══ PROVIDER ═══
export function OrbitalSentinelProvider({ children }) {
  const [state, dispatch] = useReducer(orbitalReducer, initialState);

  // ═══ ACTION DISPATCHERS ═══
  const bloom = useCallback(() => {
    dispatch({ type: ACTIONS.BLOOM });
  }, []);

  const extract = useCallback((orbId) => {
    dispatch({ type: ACTIONS.EXTRACT, payload: { orbId } });
  }, []);

  const navigate = useCallback((path) => {
    dispatch({ type: ACTIONS.NAVIGATE, payload: { path } });
  }, []);

  const collapse = useCallback(() => {
    dispatch({ type: ACTIONS.COLLAPSE });
  }, []);

  const snapback = useCallback(() => {
    dispatch({ type: ACTIONS.SNAPBACK });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: ACTIONS.RESET });
  }, []);

  const unlockTransition = useCallback(() => {
    dispatch({ type: ACTIONS.RESET }); // Reset after navigation completes
  }, []);

  // ═══ STATE QUERIES ═══
  const isIdle = state.currentState === OrbitalStates.IDLE;
  const isBloomed = state.currentState === OrbitalStates.BLOOMED;
  const isExtracted = state.currentState === OrbitalStates.EXTRACTED;
  const isNavigating = state.currentState === OrbitalStates.NAVIGATING;

  const canBloom = state.currentState === OrbitalStates.IDLE && !state.transitionLocked;
  const canExtract = state.currentState === OrbitalStates.BLOOMED && !state.transitionLocked;
  const canNavigate = state.currentState === OrbitalStates.EXTRACTED && !state.transitionLocked;
  const canCollapse = state.currentState === OrbitalStates.BLOOMED && !state.transitionLocked;
  const canSnapback = state.currentState === OrbitalStates.EXTRACTED && !state.transitionLocked;

  const value = useMemo(() => ({
    // State
    state: state.currentState,
    extractedOrbId: state.extractedOrbId,
    navigationTarget: state.navigationTarget,
    isLocked: state.transitionLocked,
    
    // Boolean queries
    isIdle, isBloomed, isExtracted, isNavigating,
    canBloom, canExtract, canNavigate, canCollapse, canSnapback,
    
    // Actions
    bloom, extract, navigate, collapse, snapback, reset, unlockTransition,
    
    // Debug
    history: state.transitionHistory,
  }), [
    state, isIdle, isBloomed, isExtracted, isNavigating,
    canBloom, canExtract, canNavigate, canCollapse, canSnapback,
    bloom, extract, navigate, collapse, snapback, reset, unlockTransition,
  ]);

  return (
    <OrbitalSentinelContext.Provider value={value}>
      {children}
    </OrbitalSentinelContext.Provider>
  );
}

// ═══ HOOK ═══
export function useOrbitalSentinel() {
  const context = useContext(OrbitalSentinelContext);
  if (!context) {
    throw new Error('useOrbitalSentinel must be used within OrbitalSentinelProvider');
  }
  return context;
}

export default OrbitalSentinelProvider;
