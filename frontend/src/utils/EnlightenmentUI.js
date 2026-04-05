/**
 * THE ENLIGHTENMENT CAFE - CORE UI CONTROLLER
 * Feature: Zero-Auto-Prompt / Manual Choice Architecture
 * 
 * PHILOSOPHY:
 * - NO automated popups, NO surprise modals
 * - Every UI element requires explicit USER_ACTION
 * - The user is in complete control
 * 
 * Usage (Vanilla JS):
 *   EnlightenmentUI.handleAction('oracle-panel');
 *   EnlightenmentUI.setManualMode(true);
 *   EnlightenmentUI.getState();
 * 
 * Usage (React Hook):
 *   const { handleAction, isBlocked, state } = useEnlightenmentUI();
 */

// ═══════════════════════════════════════════════════════════════════════════
// VANILLA JS MODULE (Global Singleton)
// ═══════════════════════════════════════════════════════════════════════════

const EnlightenmentUI = (() => {
  // 1. STAGE: Private Configuration
  const State = {
    matrixProgress: 0.71,
    isManualMode: true,      // STAGE 1: The Global Gatekeeper
    activePillar: null,
    activePopups: new Set(),
    allowedLayers: ['background', 'base-icons', 'nav-static'],
    blockedAttempts: 0,
    lastUserAction: null,
  };

  // Event listeners for state changes
  const listeners = new Set();

  // 2. STAGE: The Logic Hierarchy (Firewall)
  const accessManager = {
    requestDisplay: (elementID, triggerSource) => {
      // STAGE 2: Block anything that isn't a direct user interaction
      if (State.isManualMode && triggerSource !== 'USER_ACTION') {
        State.blockedAttempts++;
        console.warn(`[EnlightenmentUI] Blocked automated attempt: ${elementID} (source: ${triggerSource})`);
        notifyListeners({ type: 'BLOCKED', elementID, triggerSource });
        return false;
      }
      return true;
    },

    isAllowedLayer: (layerID) => {
      return State.allowedLayers.includes(layerID);
    },

    registerAllowedLayer: (layerID) => {
      if (!State.allowedLayers.includes(layerID)) {
        State.allowedLayers.push(layerID);
      }
    }
  };

  // Notify all listeners of state changes
  const notifyListeners = (event) => {
    listeners.forEach(callback => {
      try {
        callback(event, { ...State });
      } catch (e) {
        console.error('[EnlightenmentUI] Listener error:', e);
      }
    });
  };

  // 3. STAGE: Clear all active popups
  const clearAllPopups = () => {
    // DOM-based cleanup
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.active-popup, .auto-popup, .system-popup').forEach(el => {
        el.classList.add('fade-out');
        setTimeout(() => el.remove(), 300);
      });
    }
    State.activePopups.clear();
    notifyListeners({ type: 'POPUPS_CLEARED' });
  };

  // 4. STAGE: Show a specific pillar/panel
  const showPillar = (pillarID) => {
    State.activePillar = pillarID;
    State.activePopups.add(pillarID);
    State.lastUserAction = Date.now();
    notifyListeners({ type: 'PILLAR_ACTIVATED', pillarID });
    
    // Apply DOM class if element exists
    if (typeof document !== 'undefined') {
      const element = document.querySelector(`[data-pillar="${pillarID}"]`);
      if (element) {
        element.classList.add('active-pillar', 'user-triggered');
      }
    }
  };

  // 5. STAGE: Hide a specific pillar
  const hidePillar = (pillarID) => {
    if (State.activePillar === pillarID) {
      State.activePillar = null;
    }
    State.activePopups.delete(pillarID);
    notifyListeners({ type: 'PILLAR_DEACTIVATED', pillarID });
    
    if (typeof document !== 'undefined') {
      const element = document.querySelector(`[data-pillar="${pillarID}"]`);
      if (element) {
        element.classList.remove('active-pillar', 'user-triggered');
      }
    }
  };

  // PUBLIC API
  return {
    // Handle user action - the main entry point
    handleAction: (pillarID, actionType = 'USER_ACTION') => {
      if (accessManager.requestDisplay(pillarID, actionType)) {
        // Remove all current overlays/popups first
        clearAllPopups();
        
        // Manually summon the specific choice
        showPillar(pillarID);
        
        // Haptic feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([10, 5, 10]);
        }
        
        return true;
      }
      return false;
    },

    // Dismiss active pillar
    dismiss: (pillarID) => {
      if (pillarID) {
        hidePillar(pillarID);
      } else {
        clearAllPopups();
        State.activePillar = null;
      }
    },

    // Toggle manual mode
    setManualMode: (enabled) => {
      State.isManualMode = enabled;
      notifyListeners({ type: 'MODE_CHANGED', isManualMode: enabled });
      console.log(`[EnlightenmentUI] Manual mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    },

    // Update matrix progress
    setMatrixProgress: (value) => {
      State.matrixProgress = Math.max(0, Math.min(1, value));
      notifyListeners({ type: 'PROGRESS_UPDATED', progress: State.matrixProgress });
    },

    // Check if an element would be blocked
    wouldBlock: (elementID, triggerSource = 'AUTO') => {
      return State.isManualMode && triggerSource !== 'USER_ACTION';
    },

    // Get current state (immutable copy)
    getState: () => ({ ...State, activePopups: [...State.activePopups] }),

    // Subscribe to state changes
    subscribe: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },

    // Register allowed layer
    allowLayer: (layerID) => {
      accessManager.registerAllowedLayer(layerID);
    },

    // Check if layer is allowed
    isLayerAllowed: (layerID) => {
      return accessManager.isAllowedLayer(layerID);
    },

    // Get blocked attempts count
    getBlockedCount: () => State.blockedAttempts,

    // Reset blocked counter
    resetBlockedCount: () => {
      State.blockedAttempts = 0;
    }
  };
})();

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK WRAPPER
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from 'react';

export function useEnlightenmentUI() {
  const [state, setState] = useState(EnlightenmentUI.getState());
  const [blockedEvent, setBlockedEvent] = useState(null);

  // Subscribe to changes
  useEffect(() => {
    const unsubscribe = EnlightenmentUI.subscribe((event, newState) => {
      setState({ ...newState, activePopups: [...newState.activePopups] });
      
      if (event.type === 'BLOCKED') {
        setBlockedEvent(event);
        // Clear after 2 seconds
        setTimeout(() => setBlockedEvent(null), 2000);
      }
    });

    return unsubscribe;
  }, []);

  // Memoized actions
  const handleAction = useCallback((pillarID) => {
    return EnlightenmentUI.handleAction(pillarID, 'USER_ACTION');
  }, []);

  const dismiss = useCallback((pillarID) => {
    EnlightenmentUI.dismiss(pillarID);
  }, []);

  const setManualMode = useCallback((enabled) => {
    EnlightenmentUI.setManualMode(enabled);
  }, []);

  const setProgress = useCallback((value) => {
    EnlightenmentUI.setMatrixProgress(value);
  }, []);

  // Check if would be blocked (for conditional rendering)
  const wouldBlock = useCallback((elementID) => {
    return EnlightenmentUI.wouldBlock(elementID);
  }, []);

  return useMemo(() => ({
    // State
    state,
    matrixProgress: state.matrixProgress,
    isManualMode: state.isManualMode,
    activePillar: state.activePillar,
    activePopups: state.activePopups,
    blockedAttempts: state.blockedAttempts,
    blockedEvent,

    // Actions
    handleAction,
    dismiss,
    setManualMode,
    setProgress,
    wouldBlock,

    // Direct access to singleton
    controller: EnlightenmentUI
  }), [state, blockedEvent, handleAction, dismiss, setManualMode, setProgress, wouldBlock]);
}

// ═══════════════════════════════════════════════════════════════════════════
// REACT COMPONENT: Manual Mode Indicator
// ═══════════════════════════════════════════════════════════════════════════

export function ManualModeIndicator({ compact = false }) {
  const { isManualMode, blockedAttempts, setManualMode } = useEnlightenmentUI();

  if (compact) {
    return (
      <button
        onClick={() => setManualMode(!isManualMode)}
        className="manual-mode-toggle-compact"
        title={isManualMode ? 'Manual Mode: ON' : 'Manual Mode: OFF'}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: `2px solid ${isManualMode ? '#00FFC2' : '#EF4444'}`,
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: isManualMode ? '#00FFC2' : '#EF4444',
        }}
      >
        {isManualMode ? 'M' : 'A'}
      </button>
    );
  }

  return (
    <div className="manual-mode-indicator" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: 'rgba(0,0,0,0.8)',
      border: `1px solid ${isManualMode ? '#00FFC2' : '#EF4444'}`,
      borderRadius: '4px',
      fontSize: '10px',
      letterSpacing: '0.1em',
    }}>
      <span style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: isManualMode ? '#00FFC2' : '#EF4444',
        boxShadow: `0 0 8px ${isManualMode ? '#00FFC2' : '#EF4444'}`,
      }} />
      <span style={{ color: isManualMode ? '#00FFC2' : '#EF4444' }}>
        {isManualMode ? 'MANUAL MODE' : 'AUTO MODE'}
      </span>
      {blockedAttempts > 0 && (
        <span style={{ color: '#FFD700', marginLeft: '8px' }}>
          ({blockedAttempts} blocked)
        </span>
      )}
      <button
        onClick={() => setManualMode(!isManualMode)}
        style={{
          marginLeft: '8px',
          padding: '4px 8px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'white',
          fontSize: '8px',
          cursor: 'pointer',
        }}
      >
        TOGGLE
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REACT COMPONENT: Blocked Attempt Toast
// ═══════════════════════════════════════════════════════════════════════════

export function BlockedAttemptToast() {
  const { blockedEvent } = useEnlightenmentUI();

  if (!blockedEvent) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '10px 20px',
      background: 'rgba(239, 68, 68, 0.9)',
      border: '1px solid #EF4444',
      borderRadius: '4px',
      color: 'white',
      fontSize: '11px',
      letterSpacing: '0.1em',
      zIndex: 10000,
      animation: 'fadeInUp 0.3s ease-out',
    }}>
      BLOCKED: {blockedEvent.elementID} (auto-trigger denied)
    </div>
  );
}

// Export singleton for direct use
export { EnlightenmentUI };
export default EnlightenmentUI;
