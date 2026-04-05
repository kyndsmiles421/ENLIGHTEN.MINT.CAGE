/**
 * THE ENLIGHTENMENT CAFE: SILENCE SHIELD v1.0
 * Protocol: No Automated Interface System (No-AIS)
 * 
 * EXECUTION: This module auto-activates on import
 * 
 * PHILOSOPHY:
 * - Hard-suppress ALL automated popups, AI prompts, and portal triggers
 * - Only USER-INITIATED actions can display elements
 * - Complete sovereignty over the interface
 * 
 * Usage:
 *   import { SilenceShield } from './SilenceShield';
 *   SilenceShield.manualSummon('element-id');
 *   SilenceShield.manualDismiss('element-id');
 */

const SilenceShield = (() => {
  // State tracking
  let isActive = false;
  let blockedCount = 0;
  const activeElements = new Set();
  const blockedLog = [];

  // 1. THE VOID: Hard-suppress any element associated with pop-ups/AI prompts
  const injectKillSwitchCSS = () => {
    if (typeof document === 'undefined') return;
    
    // Check if already injected
    if (document.getElementById('silence-shield-css')) return;
    
    const style = document.createElement('style');
    style.id = 'silence-shield-css';
    style.innerHTML = `
      /* ═══════════════════════════════════════════════════════════════════════
         SILENCE SHIELD v1.0 — No-AIS Protocol
         ═══════════════════════════════════════════════════════════════════════ */
      
      /* Immediate visual deletion of any AIS/Sora/Portal elements */
      .sora-seer,
      .auto-prompt,
      .glow-portal,
      .ai-suggestion,
      .auto-popup,
      .system-notification:not(.user-triggered),
      .promotional-overlay,
      .auto-modal,
      [data-ais-auto="true"],
      [data-auto-display="true"],
      [data-sora-prompt],
      [data-auto-summon] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        left: -9999px !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
      }
      
      /* Ensure only manual selections can surface */
      .user-active-selection {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        position: relative !important;
        left: auto !important;
        width: auto !important;
        height: auto !important;
        z-index: 9999 !important;
      }
      
      /* Manual flex variant */
      .user-active-selection.flex-layout {
        display: flex !important;
      }
      
      /* Manual grid variant */
      .user-active-selection.grid-layout {
        display: grid !important;
      }
      
      /* Silence Shield indicator */
      .silence-shield-indicator {
        position: fixed;
        bottom: 10px;
        left: 10px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #00FFC2;
        box-shadow: 0 0 8px #00FFC2;
        z-index: 99999;
        pointer-events: none;
        animation: shield-pulse 2s ease-in-out infinite;
      }
      
      @keyframes shield-pulse {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      
      /* Blocked attempt flash (for debugging) */
      .silence-shield-blocked-flash {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, #EF4444, transparent);
        z-index: 99999;
        animation: blocked-flash 0.3s ease-out forwards;
        pointer-events: none;
      }
      
      @keyframes blocked-flash {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  };

  // 2. THE GATEKEEPER: Intercepts all function calls to "open" or "show"
  const initializeLogicShield = () => {
    if (typeof window === 'undefined') return;
    
    // Store original functions
    const originalOpen = window.open;
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;
    
    // Override window.open
    window.open = (url, name, specs) => {
      blockedCount++;
      blockedLog.push({
        type: 'window.open',
        url,
        name,
        timestamp: Date.now()
      });
      console.warn("[SilenceShield] Blocked: Automated window.open attempt silenced.", { url, name });
      flashBlocked();
      return null;
    };
    
    // Restore window.open for trusted sources
    window.__silenceShield_trustedOpen = originalOpen;
    
    // Global listener that kills 'automated' events before they reach the UI
    if (typeof document !== 'undefined') {
      // Block AIS triggers
      document.addEventListener('ais-trigger', (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        blockedCount++;
        blockedLog.push({
          type: 'ais-trigger',
          detail: e.detail,
          timestamp: Date.now()
        });
        console.warn("[SilenceShield] Blocked: AIS trigger neutralized.", e.detail);
        flashBlocked();
      }, true);
      
      // Block auto-display events
      document.addEventListener('auto-display', (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        blockedCount++;
        console.warn("[SilenceShield] Blocked: auto-display event.", e.detail);
        flashBlocked();
      }, true);
      
      // Block sora-prompt events
      document.addEventListener('sora-prompt', (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        blockedCount++;
        console.warn("[SilenceShield] Blocked: sora-prompt event.", e.detail);
        flashBlocked();
      }, true);
      
      // Mutation observer to catch dynamically added AIS elements
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              if (
                node.classList?.contains('auto-prompt') ||
                node.classList?.contains('sora-seer') ||
                node.classList?.contains('glow-portal') ||
                node.dataset?.aisAuto === 'true' ||
                node.dataset?.autoDisplay === 'true'
              ) {
                node.remove();
                blockedCount++;
                console.warn("[SilenceShield] Removed: Dynamically added AIS element.", node.className);
                flashBlocked();
              }
            }
          });
        });
      });
      
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  };

  // Flash indicator when something is blocked
  const flashBlocked = () => {
    if (typeof document === 'undefined') return;
    const flash = document.createElement('div');
    flash.className = 'silence-shield-blocked-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
  };

  // Add shield indicator
  const addIndicator = () => {
    if (typeof document === 'undefined') return;
    if (document.querySelector('.silence-shield-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'silence-shield-indicator';
    indicator.title = 'Silence Shield Active';
    document.body.appendChild(indicator);
  };

  // 3. THE CHOICE-ONLY ENGINE
  return {
    // Activate the shield (call once at app start)
    activate: () => {
      if (isActive) {
        console.log("[SilenceShield] Already active.");
        return;
      }
      
      injectKillSwitchCSS();
      initializeLogicShield();
      
      // Add indicator when DOM is ready
      if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', addIndicator);
        } else {
          addIndicator();
        }
      }
      
      isActive = true;
      console.log("[SilenceShield] ACTIVE — User-Choice-Only Mode engaged.");
    },
    
    // Deactivate (for testing purposes)
    deactivate: () => {
      isActive = false;
      const css = document.getElementById('silence-shield-css');
      if (css) css.remove();
      const indicator = document.querySelector('.silence-shield-indicator');
      if (indicator) indicator.remove();
      console.log("[SilenceShield] Deactivated.");
    },
    
    // Manual summon - use for user-triggered elements
    manualSummon: (elementId, displayType = 'block') => {
      if (typeof document === 'undefined') return false;
      
      const el = document.getElementById(elementId);
      if (el) {
        el.classList.remove('auto-prompt', 'sora-seer', 'glow-portal');
        el.classList.add('user-active-selection');
        if (displayType === 'flex') el.classList.add('flex-layout');
        if (displayType === 'grid') el.classList.add('grid-layout');
        el.removeAttribute('data-ais-auto');
        el.removeAttribute('data-auto-display');
        activeElements.add(elementId);
        console.log(`[SilenceShield] User choice confirmed: ${elementId}`);
        return true;
      }
      return false;
    },
    
    // Manual dismiss
    manualDismiss: (elementId) => {
      if (typeof document === 'undefined') return false;
      
      const el = document.getElementById(elementId);
      if (el) {
        el.classList.remove('user-active-selection', 'flex-layout', 'grid-layout');
        activeElements.delete(elementId);
        console.log(`[SilenceShield] User dismissed: ${elementId}`);
        return true;
      }
      return false;
    },
    
    // Dismiss all active elements
    dismissAll: () => {
      activeElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.remove('user-active-selection', 'flex-layout', 'grid-layout');
        }
      });
      activeElements.clear();
      console.log("[SilenceShield] All elements dismissed.");
    },
    
    // Check if shield is active
    isActive: () => isActive,
    
    // Get blocked count
    getBlockedCount: () => blockedCount,
    
    // Get blocked log
    getBlockedLog: () => [...blockedLog],
    
    // Get active elements
    getActiveElements: () => [...activeElements],
    
    // Clear blocked log
    clearBlockedLog: () => {
      blockedLog.length = 0;
      blockedCount = 0;
    },
    
    // Trusted open (bypasses shield)
    trustedOpen: (url, name, specs) => {
      if (typeof window !== 'undefined' && window.__silenceShield_trustedOpen) {
        return window.__silenceShield_trustedOpen(url, name, specs);
      }
      return null;
    }
  };
})();

// AUTO-ACTIVATE on import
if (typeof window !== 'undefined') {
  // Activate when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SilenceShield.activate());
  } else {
    SilenceShield.activate();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK WRAPPER
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from 'react';

export function useSilenceShield() {
  const [blockedCount, setBlockedCount] = useState(0);
  const [activeElements, setActiveElements] = useState([]);

  // Poll for updates (since SilenceShield is a vanilla JS singleton)
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockedCount(SilenceShield.getBlockedCount());
      setActiveElements(SilenceShield.getActiveElements());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const summon = useCallback((elementId, displayType) => {
    const result = SilenceShield.manualSummon(elementId, displayType);
    setActiveElements(SilenceShield.getActiveElements());
    return result;
  }, []);

  const dismiss = useCallback((elementId) => {
    const result = SilenceShield.manualDismiss(elementId);
    setActiveElements(SilenceShield.getActiveElements());
    return result;
  }, []);

  const dismissAll = useCallback(() => {
    SilenceShield.dismissAll();
    setActiveElements([]);
  }, []);

  return useMemo(() => ({
    isActive: SilenceShield.isActive(),
    blockedCount,
    activeElements,
    blockedLog: SilenceShield.getBlockedLog(),
    summon,
    dismiss,
    dismissAll,
    trustedOpen: SilenceShield.trustedOpen,
    shield: SilenceShield
  }), [blockedCount, activeElements, summon, dismiss, dismissAll]);
}

// ═══════════════════════════════════════════════════════════════════════════
// REACT COMPONENT: Shield Status
// ═══════════════════════════════════════════════════════════════════════════

export function ShieldStatus({ minimal = false }) {
  const { isActive, blockedCount } = useSilenceShield();

  if (minimal) {
    return (
      <div
        title={`Silence Shield: ${isActive ? 'Active' : 'Inactive'} | ${blockedCount} blocked`}
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: isActive ? '#00FFC2' : '#EF4444',
          boxShadow: `0 0 8px ${isActive ? '#00FFC2' : '#EF4444'}`,
          cursor: 'help'
        }}
      />
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      background: 'rgba(0,0,0,0.8)',
      border: `1px solid ${isActive ? '#00FFC2' : '#EF4444'}`,
      borderRadius: '4px',
      fontSize: '9px',
      letterSpacing: '0.15em',
      color: 'white'
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: isActive ? '#00FFC2' : '#EF4444',
        boxShadow: `0 0 6px ${isActive ? '#00FFC2' : '#EF4444'}`
      }} />
      <span>SHIELD {isActive ? 'ACTIVE' : 'INACTIVE'}</span>
      {blockedCount > 0 && (
        <span style={{ color: '#FFD700' }}>({blockedCount})</span>
      )}
    </div>
  );
}

export { SilenceShield };
export default SilenceShield;
