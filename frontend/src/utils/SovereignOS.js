/**
 * THE ENLIGHTENMENT CAFE: SOVEREIGN OPERATING SYSTEM (v2.0)
 * 
 * Integrates:
 * - SilenceShield (No-AIS Protocol)
 * - CafeUI (Crossbar-Fix & Layer Management)
 * - Karma-Attestation (Witness Claims)
 * - WebXR-Dome (Celestial Session Launcher)
 * 
 * Usage:
 *   import { EnlightenmentOS, CafeUI } from './SovereignOS';
 *   EnlightenmentOS.init();
 *   EnlightenmentOS.userAction('OPEN_MATRIX');
 */

// ═══════════════════════════════════════════════════════════════════════════
// CAFE UI: De-Conflict Protocol
// ═══════════════════════════════════════════════════════════════════════════

export const CafeUI = (() => {
  let styleInjected = false;

  // 1. DOCKING LOGIC: Moves everything else to the background
  const setDockingState = (isMatrixActive) => {
    if (typeof document === 'undefined') return;
    
    const bottomBar = document.querySelector('.bottom-crossbar, .smart-dock, [data-dock="bottom"]');
    const sideWidgets = document.querySelectorAll('.floating-widget, .overlapping-widget, .pokemon-kirby-style');

    if (isMatrixActive) {
      // Push secondary widgets to a "Docked" state (low opacity/no interaction)
      bottomBar?.classList.add('docked-under');
      sideWidgets.forEach(w => w.classList.add('minimized', 'docked-widget'));
      console.log("[CafeUI] Matrix in focus. Docking background elements.");
    } else {
      bottomBar?.classList.remove('docked-under');
      sideWidgets.forEach(w => w.classList.remove('minimized', 'docked-widget'));
      console.log("[CafeUI] Background elements restored.");
    }
  };

  // CSS Injection for de-conflict rules
  const injectDeConflictCSS = () => {
    if (typeof document === 'undefined' || styleInjected) return;
    
    const style = document.createElement('style');
    style.id = 'cafe-ui-deconflict-css';
    style.innerHTML = `
      /* ═══════════════════════════════════════════════════════════════════════
         CAFE UI: De-Conflict Protocol CSS
         ═══════════════════════════════════════════════════════════════════════ */
      
      /* The Bottom Crossbar (Coffee/Parchment/Learning) */
      .bottom-crossbar,
      .smart-dock,
      [data-dock="bottom"] {
        position: fixed;
        bottom: 20px;
        z-index: 500;
        transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
      }

      /* When the Matrix is open, the bar fades back to keep the view clean */
      .docked-under {
        opacity: 0.3 !important;
        pointer-events: none !important;
        filter: blur(2px);
        transform: translateY(10px);
      }

      /* Docked widgets */
      .docked-widget {
        opacity: 0.2 !important;
        filter: grayscale(1);
        pointer-events: none !important;
        transform: scale(0.95);
      }

      .minimized {
        transform: translateX(-100%) !important;
        opacity: 0 !important;
      }

      /* The Matrix Integration Panel */
      #matrix-integration-panel,
      #matrix-panel,
      .matrix-panel {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 600px;
        border-radius: 15px;
        box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8);
        z-index: 9999 !important;
        transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s;
      }

      .matrix-panel.hidden {
        transform: translateX(-50%) translateY(100%);
        opacity: 0;
        pointer-events: none;
      }

      .matrix-panel.visible {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
        pointer-events: auto;
      }

      /* Sovereign Layer Priority */
      .sovereign-layer-1 { z-index: 100; }
      .sovereign-layer-2 { z-index: 500; }
      .sovereign-layer-3 { z-index: 1000; }
      .sovereign-layer-matrix { z-index: 9999; }
      .sovereign-layer-shield { z-index: 99999; }

      /* Focus overlay */
      .sovereign-focus-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 8000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
      }

      .sovereign-focus-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);
    styleInjected = true;
  };

  return {
    // 2. THE MATRIX OVERRIDE: Forces it to be the "Top Layer"
    toggleMatrix: (isOpen) => {
      if (typeof document === 'undefined') return;
      
      const matrixMenu = document.getElementById('matrix-integration-panel') || 
                         document.querySelector('.matrix-panel');
      
      if (!matrixMenu) {
        console.warn("[CafeUI] Matrix panel not found in DOM");
        return;
      }

      if (isOpen) {
        matrixMenu.classList.remove('hidden');
        matrixMenu.classList.add('visible');
        matrixMenu.style.zIndex = "10000";
        setDockingState(true);
      } else {
        matrixMenu.classList.remove('visible');
        matrixMenu.classList.add('hidden');
        setDockingState(false);
      }
    },

    // Initialize CSS
    init: () => {
      injectDeConflictCSS();
    },

    // Set docking state directly
    dock: (isDocked) => setDockingState(isDocked),

    // Check if CSS is injected
    isInitialized: () => styleInjected
  };
})();

// ═══════════════════════════════════════════════════════════════════════════
// ENLIGHTENMENT OS v2.0: Sovereign Operating System
// ═══════════════════════════════════════════════════════════════════════════

export const EnlightenmentOS = (() => {
  // 1. STATE & SOVEREIGNTY CONFIG
  const State = {
    isManualOnly: true,
    matrixIntegration: 0.71,
    blockedIntrusions: [],
    activeLayer: 'BASE',
    karmaAttestations: [],
    xrSessionActive: false,
    initialized: false
  };

  // Event listeners
  const listeners = new Map();

  // Emit events
  const emit = (event, data) => {
    const callbacks = listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  };

  // 2. THE SILENCE SHIELD (No-AIS Protocol)
  const activateSilenceShield = () => {
    if (typeof document === 'undefined') return;
    
    // Check if already injected
    if (document.getElementById('sovereign-silence-shield-css')) return;
    
    const style = document.createElement('style');
    style.id = 'sovereign-silence-shield-css';
    style.innerHTML = `
      /* Hard-Kill all automated popups, Sora, and Glow-Portals */
      .sora-seer,
      .auto-prompt,
      .glow-portal,
      .popup-overlap,
      [data-ais-auto="true"],
      [data-auto-summon="true"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
        z-index: -9999 !important;
        position: absolute !important;
        left: -99999px !important;
      }
      
      /* UI De-Conflict: Matrix sits above the Crossbar, no overlap */
      #matrix-panel,
      .matrix-panel { 
        z-index: 9999 !important; 
        bottom: 100px !important; 
      }
      
      .bottom-crossbar { 
        z-index: 1000; 
        position: fixed; 
        bottom: 20px; 
      }
    `;
    document.head.appendChild(style);

    // Intercept automated triggers
    if (typeof window !== 'undefined') {
      const originalOpen = window.open;
      window.open = (url, name, specs) => {
        State.blockedIntrusions.push({ 
          type: 'Window.Open', 
          url,
          name,
          time: Date.now() 
        });
        console.warn("[SovereignOS] Blocked window.open:", url);
        emit('intrusion-blocked', { type: 'window.open', url });
        return null;
      };
      
      // Store original for trusted opens
      window.__sovereign_trustedOpen = originalOpen;
    }

    console.log("[SovereignOS] SilenceShield ACTIVE — User-Choice-Only Mode engaged.");
  };

  // 3. SOVEREIGN LAYERING (The Crossbar & Widget Fix)
  const manageLayers = (focusTarget) => {
    if (typeof document === 'undefined') return;
    
    const widgets = document.querySelectorAll('.overlapping-widget, .pokemon-kirby-style, .floating-widget');
    const crossbar = document.querySelector('.bottom-crossbar, .smart-dock');

    State.activeLayer = focusTarget;

    if (focusTarget === 'MATRIX') {
      widgets.forEach(w => w.classList.add('docked-widget'));
      if (crossbar) crossbar.style.opacity = '0.5';
      console.log("[SovereignOS] Widgets docked. Matrix in focus.");
      emit('layer-change', { layer: 'MATRIX', docked: true });
    } else if (focusTarget === 'DOME') {
      widgets.forEach(w => w.classList.add('docked-widget'));
      if (crossbar) crossbar.style.opacity = '0.3';
      console.log("[SovereignOS] Widgets docked. Celestial Dome in focus.");
      emit('layer-change', { layer: 'DOME', docked: true });
    } else {
      widgets.forEach(w => w.classList.remove('docked-widget'));
      if (crossbar) crossbar.style.opacity = '1';
      console.log("[SovereignOS] Layer reset to BASE.");
      emit('layer-change', { layer: 'BASE', docked: false });
    }
  };

  // 4. P1: WITNESS ATTESTATION (Karma Claims)
  const attestKarma = async (claimID, claimData = {}) => {
    console.log(`[SovereignOS] Processing Witness Attestation for: ${claimID}`);
    
    // Generate attestation hash
    const rawData = `SOVEREIGN_ATTEST_${claimID}_${Date.now()}`;
    let hashHex = '';
    
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawData));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      hashHex = `fallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
    
    const attestation = {
      claimID,
      status: 'Verified',
      timestamp: Date.now(),
      sovereign: true,
      hash: hashHex,
      data: claimData
    };
    
    State.karmaAttestations.push(attestation);
    emit('karma-attested', attestation);
    
    console.log(`[SovereignOS] Attestation Complete:`, attestation);
    return attestation;
  };

  // 5. P2: CELESTIAL DOME (WebXR Session)
  const launchCelestialDome = async () => {
    if (!State.isManualOnly) {
      console.warn("[SovereignOS] Dome launch blocked — not in manual mode");
      return null;
    }

    console.log("[SovereignOS] Initializing Celestial Dome Session...");
    manageLayers('DOME');

    // Check for WebXR support
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      try {
        const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
        if (isSupported) {
          console.log("[SovereignOS] WebXR VR supported. Ready to launch.");
          State.xrSessionActive = true;
          emit('xr-ready', { mode: 'immersive-vr' });
          return { supported: true, mode: 'immersive-vr' };
        } else {
          // Try AR
          const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
          if (arSupported) {
            console.log("[SovereignOS] WebXR AR supported.");
            State.xrSessionActive = true;
            emit('xr-ready', { mode: 'immersive-ar' });
            return { supported: true, mode: 'immersive-ar' };
          }
        }
      } catch (e) {
        console.warn("[SovereignOS] WebXR check failed:", e);
      }
    }

    // Fallback to inline (standard WebGL)
    console.log("[SovereignOS] WebXR not available. Using inline mode.");
    emit('xr-ready', { mode: 'inline' });
    return { supported: false, mode: 'inline' };
  };

  // 6. EXIT DOME
  const exitCelestialDome = () => {
    State.xrSessionActive = false;
    manageLayers('BASE');
    emit('xr-exit', {});
    console.log("[SovereignOS] Exited Celestial Dome.");
  };

  // PUBLIC API
  return {
    // Initialize the OS
    init: () => {
      if (State.initialized) {
        console.log("[SovereignOS] Already initialized.");
        return;
      }
      
      activateSilenceShield();
      CafeUI.init();
      State.initialized = true;
      
      console.log("[SovereignOS] v2.0 Initialized — Sovereign Mode Active.");
      emit('initialized', State);
    },

    // THE MASTER TRIGGER: Use this for Matrix/Parchment/Coffee icons
    userAction: (actionType, id, data) => {
      console.log(`[SovereignOS] User Action: ${actionType}`, id, data);
      
      switch (actionType) {
        case 'OPEN_MATRIX':
          CafeUI.toggleMatrix(true);
          manageLayers('MATRIX');
          return { success: true, layer: 'MATRIX' };
          
        case 'CLOSE_MATRIX':
          CafeUI.toggleMatrix(false);
          manageLayers('BASE');
          return { success: true, layer: 'BASE' };
          
        case 'CLAIM_KARMA':
          return attestKarma(id, data);
          
        case 'ENTER_DOME':
          return launchCelestialDome();
          
        case 'EXIT_DOME':
          exitCelestialDome();
          return { success: true };
          
        case 'DOCK_WIDGETS':
          manageLayers('MATRIX');
          return { success: true, docked: true };
          
        case 'UNDOCK_WIDGETS':
          manageLayers('BASE');
          return { success: true, docked: false };
          
        default:
          console.warn(`[SovereignOS] Unknown action: ${actionType}`);
          return { success: false, error: 'Unknown action' };
      }
    },

    // Get shield report
    getShieldReport: () => [...State.blockedIntrusions],

    // Get karma attestations
    getAttestations: () => [...State.karmaAttestations],

    // Get current state
    getState: () => ({ ...State }),

    // Subscribe to events
    on: (event, callback) => {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event).push(callback);
      return () => {
        const callbacks = listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      };
    },

    // Set manual mode
    setManualOnly: (enabled) => {
      State.isManualOnly = enabled;
      console.log(`[SovereignOS] Manual-Only Mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    },

    // Trusted window open (bypasses shield)
    trustedOpen: (url, name, specs) => {
      if (typeof window !== 'undefined' && window.__sovereign_trustedOpen) {
        return window.__sovereign_trustedOpen(url, name, specs);
      }
      return null;
    }
  };
})();

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK: useSovereignOS
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from 'react';

export function useSovereignOS() {
  const [state, setState] = useState(EnlightenmentOS.getState());
  const [blockedCount, setBlockedCount] = useState(0);
  const [attestations, setAttestations] = useState([]);
  const [xrReady, setXrReady] = useState(null);

  // Initialize and subscribe to events
  useEffect(() => {
    EnlightenmentOS.init();

    const unsubBlock = EnlightenmentOS.on('intrusion-blocked', () => {
      setBlockedCount(EnlightenmentOS.getShieldReport().length);
    });

    const unsubKarma = EnlightenmentOS.on('karma-attested', (attestation) => {
      setAttestations(EnlightenmentOS.getAttestations());
    });

    const unsubXR = EnlightenmentOS.on('xr-ready', (data) => {
      setXrReady(data);
    });

    const unsubLayer = EnlightenmentOS.on('layer-change', () => {
      setState(EnlightenmentOS.getState());
    });

    return () => {
      unsubBlock();
      unsubKarma();
      unsubXR();
      unsubLayer();
    };
  }, []);

  // Actions
  const openMatrix = useCallback(() => {
    return EnlightenmentOS.userAction('OPEN_MATRIX');
  }, []);

  const closeMatrix = useCallback(() => {
    return EnlightenmentOS.userAction('CLOSE_MATRIX');
  }, []);

  const claimKarma = useCallback((claimID, data) => {
    return EnlightenmentOS.userAction('CLAIM_KARMA', claimID, data);
  }, []);

  const enterDome = useCallback(() => {
    return EnlightenmentOS.userAction('ENTER_DOME');
  }, []);

  const exitDome = useCallback(() => {
    return EnlightenmentOS.userAction('EXIT_DOME');
  }, []);

  return useMemo(() => ({
    // State
    state,
    activeLayer: state.activeLayer,
    isManualOnly: state.isManualOnly,
    xrSessionActive: state.xrSessionActive,
    blockedCount,
    attestations,
    xrReady,

    // Actions
    openMatrix,
    closeMatrix,
    claimKarma,
    enterDome,
    exitDome,
    userAction: EnlightenmentOS.userAction,

    // Reports
    getShieldReport: EnlightenmentOS.getShieldReport,
    getAttestations: EnlightenmentOS.getAttestations,

    // Direct access
    os: EnlightenmentOS,
    ui: CafeUI
  }), [state, blockedCount, attestations, xrReady, openMatrix, closeMatrix, claimKarma, enterDome, exitDome]);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTO-INITIALIZE
// ═══════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EnlightenmentOS.init());
  } else {
    EnlightenmentOS.init();
  }
}

export default EnlightenmentOS;
