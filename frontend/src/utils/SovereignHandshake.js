/**
 * SovereignHandshake.js — Bi-Directional Harmonic Flow
 * Orchestrates: Refractor → RainbowKey → Render
 * 
 * States:
 * - IDLE
 * - INITIATING
 * - CALIBRATING_SPECTRUM
 * - ATTESTED
 * - FAILED
 */

import SovereignRefractor from './SovereignRefractor';
import RainbowKeyGenerator from './RainbowKeyGenerator';
import SovereignEngine from './SovereignEngine';

const SovereignHandshake = {
  // State
  currentState: 'IDLE',
  lastResult: null,
  listeners: [],

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  
  setState(newState) {
    this.currentState = newState;
    console.log(`[Handshake] State: ${newState}`);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('SOVEREIGN_STATE_CHANGE', {
      detail: { state: newState, timestamp: Date.now() }
    }));
    
    // Notify listeners
    this.listeners.forEach(fn => fn(newState));
  },

  onStateChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(fn => fn !== callback);
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTE HANDSHAKE (Main Flow)
  // ═══════════════════════════════════════════════════════════════════════════
  
  async execute(intention) {
    try {
      // 1. INITIATING: Start the Ceremony (Outbound)
      this.setState('INITIATING');
      const payload = await SovereignRefractor.startCeremony(intention);
      console.log('[Handshake] Payload generated:', payload.hash?.substring(0, 16));

      // 2. CALIBRATING: Skeleton enters resonance mode
      this.setState('CALIBRATING_SPECTRUM');
      this.pulseUI();

      // 3. MINTING: Generate Rainbow Key (Inbound)
      const rainbowResponse = await RainbowKeyGenerator.mintKey(payload);

      if (rainbowResponse.status === 'SOVEREIGN_ATTESTED') {
        // 4. ATTESTED: Success — render key to Node 12
        this.setState('ATTESTED');
        
        this.renderRainbowKey(rainbowResponse.key);
        this.applySpectralSignature(rainbowResponse.spectralSignature);
        
        this.lastResult = {
          success: true,
          intention,
          key: rainbowResponse.key,
          spectralSignature: rainbowResponse.spectralSignature,
          timestamp: Date.now()
        };
        
        // Dispatch completion event
        window.dispatchEvent(new CustomEvent('SOVEREIGN_HANDSHAKE_COMPLETE', {
          detail: this.lastResult
        }));
        
        return this.lastResult;
      } else {
        throw new Error(rainbowResponse.error || 'Mint failed');
      }
    } catch (error) {
      this.setState('FAILED');
      console.error('[Handshake] Failed:', error);
      
      this.lastResult = {
        success: false,
        error: error.message
      };
      
      return this.lastResult;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UI PULSE (Calibrating visual feedback)
  // ═══════════════════════════════════════════════════════════════════════════
  
  pulseUI() {
    const nodes = document.querySelectorAll('.crystal-skeleton-node, .refractor-skeleton-node');
    nodes.forEach((node, i) => {
      node.style.animation = `sovereignPulse 0.5s ease-in-out ${i * 0.05}s infinite alternate`;
    });
    
    // Inject keyframes if not present
    if (!document.getElementById('sovereign-pulse-style')) {
      const style = document.createElement('style');
      style.id = 'sovereign-pulse-style';
      style.textContent = `
        @keyframes sovereignPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  },

  stopPulse() {
    const nodes = document.querySelectorAll('.crystal-skeleton-node, .refractor-skeleton-node');
    nodes.forEach(node => {
      node.style.animation = '';
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER RAINBOW KEY (To Node 12 — Sovereign Source)
  // ═══════════════════════════════════════════════════════════════════════════
  
  renderRainbowKey(key) {
    this.stopPulse();
    
    // Find or create Node 12 display
    let sovereignDisplay = document.getElementById('sovereign-key-display');
    
    if (!sovereignDisplay) {
      sovereignDisplay = document.createElement('div');
      sovereignDisplay.id = 'sovereign-key-display';
      sovereignDisplay.setAttribute('data-testid', 'sovereign-key-display');
      sovereignDisplay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        text-align: center;
        pointer-events: none;
      `;
      document.body.appendChild(sovereignDisplay);
    }
    
    // Render key with animation
    sovereignDisplay.innerHTML = `
      <div class="sovereign-key-container" style="
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 215, 0, 0.5);
        border-radius: 16px;
        padding: 24px 32px;
        animation: keyReveal 0.5s ease-out;
      ">
        <div style="
          font-size: 10px;
          letter-spacing: 0.3em;
          color: rgba(255, 215, 0, 0.7);
          margin-bottom: 12px;
        ">RAINBOW KEY</div>
        <div class="rainbow-key-value" style="
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 18px;
          color: #FFD700;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
          letter-spacing: 0.1em;
        ">${key}</div>
        <div style="
          margin-top: 16px;
          font-size: 9px;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.2em;
        ">SOVEREIGN ATTESTED</div>
      </div>
    `;
    
    // Inject reveal animation
    if (!document.getElementById('key-reveal-style')) {
      const style = document.createElement('style');
      style.id = 'key-reveal-style';
      style.textContent = `
        @keyframes keyReveal {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
    
    console.log('[Handshake] Rainbow Key rendered to Node 12:', key);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (sovereignDisplay) {
        sovereignDisplay.style.opacity = '0';
        sovereignDisplay.style.transition = 'opacity 1s ease';
        setTimeout(() => sovereignDisplay.remove(), 1000);
      }
    }, 10000);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // APPLY SPECTRAL SIGNATURE (Map hex codes to node colors)
  // ═══════════════════════════════════════════════════════════════════════════
  
  applySpectralSignature(signature) {
    // Apply to skeleton nodes
    const allNodes = document.querySelectorAll('.crystal-skeleton-node, .refractor-skeleton-node');
    
    allNodes.forEach((node, i) => {
      const nodeId = node.getAttribute('data-node-id') || node.getAttribute('data-testid');
      
      // Try to match signature
      let spec = signature[`CYCLE_${i}`];
      if (nodeId === 'SOURCE_12' || i === 12) {
        spec = signature['SOURCE_12'];
      }
      
      if (spec) {
        node.style.background = spec.color;
        node.style.boxShadow = spec.glow;
        node.style.transition = 'all 0.5s ease';
      }
    });
    
    console.log('[Handshake] Spectral signature applied to nodes');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RESET
  // ═══════════════════════════════════════════════════════════════════════════
  
  reset() {
    this.setState('IDLE');
    this.stopPulse();
    this.lastResult = null;
    
    const display = document.getElementById('sovereign-key-display');
    if (display) display.remove();
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.SovereignHandshake = SovereignHandshake;
  
  // Convenience function
  window.executeSovereignHandshake = (intention) => SovereignHandshake.execute(intention);
}

export default SovereignHandshake;

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useSovereignHandshake() {
  const { useState, useEffect, useCallback, useMemo } = require('react');
  
  const [state, setState] = useState('IDLE');
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = SovereignHandshake.onStateChange((newState) => {
      setState(newState);
      setIsProcessing(['INITIATING', 'CALIBRATING_SPECTRUM'].includes(newState));
    });
    
    const handleComplete = (e) => {
      setResult(e.detail);
    };
    
    window.addEventListener('SOVEREIGN_HANDSHAKE_COMPLETE', handleComplete);
    
    return () => {
      unsubscribe();
      window.removeEventListener('SOVEREIGN_HANDSHAKE_COMPLETE', handleComplete);
    };
  }, []);

  const execute = useCallback(async (intention) => {
    const res = await SovereignHandshake.execute(intention);
    setResult(res);
    return res;
  }, []);

  const reset = useCallback(() => {
    SovereignHandshake.reset();
    setResult(null);
  }, []);

  return useMemo(() => ({
    state,
    result,
    isProcessing,
    isAttested: state === 'ATTESTED',
    isFailed: state === 'FAILED',
    execute,
    reset
  }), [state, result, isProcessing, execute, reset]);
}
