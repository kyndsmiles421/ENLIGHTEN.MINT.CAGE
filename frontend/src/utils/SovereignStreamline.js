/**
 * ENLIGHTENMENT CAFE: STREAMLINE v3.0 (THE OMNI-FLOW)
 * 
 * Feature: Analytics Exposure + Karma Attestation + Fractal Render
 * 
 * Integrates with SovereignOS v2.0
 * 
 * Usage:
 *   import { SovereignStreamline } from './SovereignStreamline';
 *   SovereignStreamline.trigger('ATTEST', 'MEDITATION-01');
 *   SovereignStreamline.trigger('MINT', { seed: 'cosmic', value: 100 });
 *   SovereignStreamline.trigger('DOME');
 */

// ═══════════════════════════════════════════════════════════════════════════
// SOVEREIGN STREAMLINE v3.0
// ═══════════════════════════════════════════════════════════════════════════

export const SovereignStreamline = (() => {
  const AppState = {
    analyticsBuffer: [],       // Exposed data stream
    isWebXRLive: false,
    fractalDepth: 54,          // 54-sublayer L² Engine
    sovereignID: 'SM-1979',
    mintingQueue: [],
    attestationsPending: [],
    crossbarSynced: false,
    initialized: false
  };

  // Event emitter for React integration
  const listeners = new Map();
  const emit = (event, data) => {
    const callbacks = listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  };

  // 1. ANALYTICS EXPOSURE (Silent Tracking)
  const exposeData = (event, detail) => {
    const entry = {
      timestamp: Date.now(),
      event,
      detail,
      sovereignID: AppState.sovereignID,
      sessionID: sessionStorage.getItem('sovereign_session') || generateSessionID()
    };
    AppState.analyticsBuffer.push(entry);
    
    // Emit for React listeners
    emit('analytics', entry);
    
    // Silent debug (no user-facing output)
    console.debug(`[Analytics-Exposed]: ${event}`, detail);
    
    // Optional: Send to backend (batched)
    if (AppState.analyticsBuffer.length >= 10) {
      flushAnalytics();
    }
    
    return entry;
  };

  // Generate session ID
  const generateSessionID = () => {
    const id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('sovereign_session', id);
    return id;
  };

  // Flush analytics to backend
  const flushAnalytics = async () => {
    if (AppState.analyticsBuffer.length === 0) return;
    
    const batch = [...AppState.analyticsBuffer];
    AppState.analyticsBuffer = [];
    
    try {
      const API = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('zen_token');
      
      if (API && token) {
        await fetch(`${API}/api/analytics/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ events: batch })
        });
      }
    } catch (e) {
      // Re-queue on failure
      AppState.analyticsBuffer.unshift(...batch);
      console.debug('[Analytics] Batch flush deferred');
    }
  };

  // 2. P1: WITNESS ATTESTATION UI (The Minimalist Signature)
  const renderAttestationUI = (deedType, options = {}) => {
    if (typeof document === 'undefined') return null;
    
    exposeData('ATTESTATION_INIT', { type: deedType, options });
    
    // Remove existing modal
    document.querySelector('#witness-modal')?.remove();
    
    const modal = document.createElement('div');
    modal.id = 'witness-modal';
    modal.className = 'sacred-geometry-overlay';
    modal.innerHTML = `
      <div class="attestation-container">
        <div class="sacred-geometry-bg"></div>
        <div class="attestation-content">
          <div class="attestation-glyph">⬡</div>
          <h3 class="attestation-title">WITNESS ATTESTATION</h3>
          <p class="attestation-type">${deedType.toUpperCase()}</p>
          <p class="attestation-desc">${options.description || 'Seal this deed into the Sovereign Ledger.'}</p>
          <div class="attestation-hash" id="attestation-preview-hash">Generating hash...</div>
          <div class="attestation-actions">
            <button class="attest-btn confirm" data-deed="${deedType}">CONFIRM SIGNATURE</button>
            <button class="attest-btn cancel">CANCEL</button>
          </div>
          <div class="attestation-footer">
            <span class="sovereignty-mark">◈ SOVEREIGN VERIFIED</span>
          </div>
        </div>
      </div>
    `;
    
    // Add styles
    if (!document.getElementById('attestation-styles')) {
      const styles = document.createElement('style');
      styles.id = 'attestation-styles';
      styles.innerHTML = getAttestationCSS();
      document.head.appendChild(styles);
    }
    
    document.body.appendChild(modal);
    
    // Generate preview hash
    generatePreviewHash(deedType).then(hash => {
      const hashEl = document.getElementById('attestation-preview-hash');
      if (hashEl) hashEl.textContent = hash.slice(0, 16) + '...';
    });
    
    // Event listeners
    modal.querySelector('.confirm')?.addEventListener('click', () => {
      signDeed(deedType, options);
    });
    
    modal.querySelector('.cancel')?.addEventListener('click', () => {
      modal.classList.add('closing');
      setTimeout(() => modal.remove(), 300);
      exposeData('ATTESTATION_CANCELLED', { type: deedType });
    });
    
    // Animate in
    requestAnimationFrame(() => modal.classList.add('visible'));
    
    return modal;
  };

  // Generate preview hash
  const generatePreviewHash = async (deedType) => {
    const rawData = `PREVIEW_${deedType}_${Date.now()}`;
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawData));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return `0x${Math.random().toString(16).slice(2)}`;
  };

  // Sign the deed
  const signDeed = async (deedType, options = {}) => {
    const rawData = `SOVEREIGN_DEED_${deedType}_${Date.now()}_${AppState.sovereignID}`;
    let hash;
    
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawData));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      hash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
    }
    
    const attestation = {
      type: deedType,
      hash,
      timestamp: Date.now(),
      sovereignID: AppState.sovereignID,
      verified: true,
      options
    };
    
    AppState.attestationsPending.push(attestation);
    exposeData('DEED_SIGNED', attestation);
    emit('deed-signed', attestation);
    
    // Remove modal with success animation
    const modal = document.querySelector('#witness-modal');
    if (modal) {
      modal.classList.add('success');
      setTimeout(() => {
        modal.classList.add('closing');
        setTimeout(() => modal.remove(), 300);
      }, 1000);
    }
    
    // Persist to backend
    try {
      const API = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('zen_token');
      
      if (API && token) {
        await fetch(`${API}/api/sanctuary/deed-simple`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            deed_type: deedType,
            description: options.description || `${deedType} attestation`,
            karma_value: options.karmaValue || 100,
            witness_hash: hash
          })
        });
      }
    } catch (e) {
      console.warn('[Attestation] Backend sync deferred:', e);
    }
    
    console.log(`[Attestation] Deed signed: ${deedType} → ${hash.slice(0, 16)}...`);
    return attestation;
  };

  // 3. P2: WEBXR CELESTIAL DOME (Streamlined Entry)
  const initCelestialDome = async () => {
    exposeData('XR_DOME_START', { mode: 'VR_AR_FALLBACK' });
    
    if (typeof navigator === 'undefined' || !navigator.xr) {
      console.log('[CelestialDome] WebXR not available. Using inline mode.');
      emit('xr-mode', { mode: 'inline', supported: false });
      return { mode: 'inline', supported: false };
    }
    
    try {
      // Check VR support
      const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
      if (vrSupported) {
        AppState.isWebXRLive = true;
        exposeData('XR_VR_AVAILABLE', { mode: 'immersive-vr' });
        emit('xr-mode', { mode: 'immersive-vr', supported: true });
        console.log('[CelestialDome] VR mode available.');
        return { mode: 'immersive-vr', supported: true };
      }
      
      // Check AR support
      const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
      if (arSupported) {
        AppState.isWebXRLive = true;
        exposeData('XR_AR_AVAILABLE', { mode: 'immersive-ar' });
        emit('xr-mode', { mode: 'immersive-ar', supported: true });
        console.log('[CelestialDome] AR mode available.');
        return { mode: 'immersive-ar', supported: true };
      }
    } catch (e) {
      console.warn('[CelestialDome] XR check error:', e);
    }
    
    // Fallback to inline
    exposeData('XR_INLINE_FALLBACK', { mode: 'inline' });
    emit('xr-mode', { mode: 'inline', supported: false });
    console.log('[CelestialDome] Using inline mode.');
    return { mode: 'inline', supported: false };
  };

  // Request XR Session
  const requestXRSession = async (mode = 'immersive-vr') => {
    if (!navigator.xr) return null;
    
    try {
      const session = await navigator.xr.requestSession(mode, {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['bounded-floor', 'hand-tracking']
      });
      
      AppState.isWebXRLive = true;
      exposeData('XR_SESSION_START', { mode, sessionId: session.sessionId });
      emit('xr-session', { session, mode });
      
      session.addEventListener('end', () => {
        AppState.isWebXRLive = false;
        exposeData('XR_SESSION_END', { mode });
        emit('xr-session-end', { mode });
      });
      
      return session;
    } catch (e) {
      console.error('[CelestialDome] Session request failed:', e);
      exposeData('XR_SESSION_ERROR', { error: e.message });
      return null;
    }
  };

  // 4. L² FRACTAL ENGINE (Multi-Threaded Seed Minting)
  const mintSeedThreaded = (seedData) => {
    exposeData('MINTING_START', { seedData, layers: AppState.fractalDepth });
    
    // Check for Web Worker support
    if (typeof Worker !== 'undefined') {
      // Create inline worker for fractal computation
      const workerCode = `
        self.onmessage = function(e) {
          const { layers, data } = e.data;
          let hash = '';
          let iterations = 0;
          
          // Simulate 54-layer fractal computation
          for (let layer = 0; layer < layers; layer++) {
            const layerSeed = JSON.stringify(data) + layer + Date.now();
            // Simple hash-like computation
            let h = 0;
            for (let i = 0; i < layerSeed.length; i++) {
              h = ((h << 5) - h + layerSeed.charCodeAt(i)) | 0;
            }
            hash += Math.abs(h).toString(16).padStart(8, '0');
            iterations++;
          }
          
          self.postMessage({
            hash: hash.slice(0, 64),
            layers: iterations,
            timestamp: Date.now()
          });
        };
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      
      worker.postMessage({ layers: AppState.fractalDepth, data: seedData });
      
      worker.onmessage = (e) => {
        const result = {
          ...e.data,
          seedData,
          sovereignID: AppState.sovereignID
        };
        
        exposeData('MINTING_COMPLETE', result);
        emit('seed-minted', result);
        
        console.log(`[L² Fractal] Seed minted via ${AppState.fractalDepth}-layer engine:`, e.data.hash.slice(0, 16));
        worker.terminate();
      };
      
      worker.onerror = (e) => {
        console.error('[L² Fractal] Worker error:', e);
        exposeData('MINTING_ERROR', { error: e.message });
        // Fallback to main thread
        mintSeedSync(seedData);
      };
      
      return { async: true, workerId: Date.now() };
    } else {
      // Fallback to synchronous minting
      return mintSeedSync(seedData);
    }
  };

  // Synchronous minting fallback
  const mintSeedSync = (seedData) => {
    let hash = '';
    for (let layer = 0; layer < AppState.fractalDepth; layer++) {
      const layerSeed = JSON.stringify(seedData) + layer + Date.now();
      let h = 0;
      for (let i = 0; i < layerSeed.length; i++) {
        h = ((h << 5) - h + layerSeed.charCodeAt(i)) | 0;
      }
      hash += Math.abs(h).toString(16).padStart(8, '0');
    }
    
    const result = {
      hash: hash.slice(0, 64),
      layers: AppState.fractalDepth,
      timestamp: Date.now(),
      seedData,
      sovereignID: AppState.sovereignID,
      sync: true
    };
    
    exposeData('MINTING_COMPLETE', result);
    emit('seed-minted', result);
    
    console.log('[L² Fractal] Seed minted (sync):', result.hash.slice(0, 16));
    return result;
  };

  // 5. THE GLOBAL CROSSBAR SYNC (Streamlined Navigation)
  const syncCrossbar = () => {
    if (typeof document === 'undefined') return;
    
    const matrix = document.querySelector('#matrix-panel, .matrix-panel, #matrix-integration-panel');
    const nav = document.querySelector('.bottom-crossbar, .smart-dock, [data-dock="bottom"]');
    
    if (matrix && nav) {
      const gap = 100; // 100px of "Nature/Sanctuary" breathing room
      const navHeight = nav.offsetHeight || 60;
      matrix.style.bottom = `${navHeight + gap}px`;
      AppState.crossbarSynced = true;
      console.debug('[Crossbar] Synced with gap:', gap);
    }
  };

  // Attestation CSS
  const getAttestationCSS = () => `
    .sacred-geometry-overlay {
      position: fixed;
      inset: 0;
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0);
      backdrop-filter: blur(0px);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    }
    
    .sacred-geometry-overlay.visible {
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(20px);
      opacity: 1;
    }
    
    .sacred-geometry-overlay.closing {
      opacity: 0;
      transform: scale(0.95);
    }
    
    .sacred-geometry-overlay.success .attestation-container {
      border-color: #00FFC2;
      box-shadow: 0 0 60px rgba(0, 255, 194, 0.3);
    }
    
    .sacred-geometry-overlay.success .attestation-glyph {
      color: #00FFC2;
      animation: pulse-success 0.5s ease-out;
    }
    
    @keyframes pulse-success {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); }
      100% { transform: scale(1); }
    }
    
    .attestation-container {
      position: relative;
      background: rgba(10, 10, 20, 0.95);
      border: 1px solid rgba(168, 85, 247, 0.3);
      padding: 40px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1) 0.1s;
    }
    
    .sacred-geometry-overlay.visible .attestation-container {
      transform: translateY(0);
      opacity: 1;
    }
    
    .sacred-geometry-bg {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at center, rgba(168, 85, 247, 0.05) 0%, transparent 70%);
      pointer-events: none;
    }
    
    .attestation-content {
      position: relative;
      z-index: 1;
    }
    
    .attestation-glyph {
      font-size: 48px;
      color: #A855F7;
      margin-bottom: 20px;
      animation: glyph-rotate 20s linear infinite;
    }
    
    @keyframes glyph-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .attestation-title {
      font-size: 14px;
      letter-spacing: 0.3em;
      color: #FFD700;
      margin: 0 0 10px 0;
      font-weight: 400;
    }
    
    .attestation-type {
      font-size: 24px;
      color: white;
      margin: 0 0 15px 0;
      font-weight: 300;
      letter-spacing: 0.1em;
    }
    
    .attestation-desc {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      margin: 0 0 20px 0;
      line-height: 1.6;
    }
    
    .attestation-hash {
      font-family: monospace;
      font-size: 10px;
      color: #00FFC2;
      background: rgba(0, 255, 194, 0.1);
      padding: 8px 12px;
      border-radius: 4px;
      margin-bottom: 25px;
      word-break: break-all;
    }
    
    .attestation-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
    }
    
    .attest-btn {
      padding: 12px 24px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: transparent;
      color: white;
      font-size: 11px;
      letter-spacing: 0.15em;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .attest-btn.confirm {
      border-color: #A855F7;
      color: #A855F7;
    }
    
    .attest-btn.confirm:hover {
      background: rgba(168, 85, 247, 0.2);
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
    }
    
    .attest-btn.cancel:hover {
      border-color: #EF4444;
      color: #EF4444;
    }
    
    .attestation-footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .sovereignty-mark {
      font-size: 9px;
      letter-spacing: 0.2em;
      color: rgba(255, 255, 255, 0.3);
    }
  `;

  // PUBLIC API
  return {
    // Initialize streamline
    streamline: () => {
      if (AppState.initialized) return;
      
      syncCrossbar();
      
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', syncCrossbar);
        window.addEventListener('orientationchange', syncCrossbar);
      }
      
      // Flush analytics on page unload
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', flushAnalytics);
      }
      
      AppState.initialized = true;
      console.log("[SovereignStreamline] v3.0 Flow Optimized. Analytics Exposed.");
    },
    
    // Sign a deed (can be called directly)
    signDeed,
    
    // Master trigger
    trigger: (action, data, options = {}) => {
      exposeData('TRIGGER', { action, data });
      
      switch (action) {
        case 'ATTEST':
          return renderAttestationUI(data, options);
        case 'MINT':
          return mintSeedThreaded(data);
        case 'DOME':
          return initCelestialDome();
        case 'XR_SESSION':
          return requestXRSession(data);
        case 'SYNC':
          syncCrossbar();
          return { synced: true };
        default:
          console.warn('[Streamline] Unknown action:', action);
          return null;
      }
    },
    
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
    
    // Get analytics buffer
    getAnalytics: () => [...AppState.analyticsBuffer],
    
    // Get attestations
    getAttestations: () => [...AppState.attestationsPending],
    
    // Get state
    getState: () => ({ ...AppState }),
    
    // Flush analytics manually
    flushAnalytics,
    
    // Expose data manually
    expose: exposeData
  };
})();

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK: useSovereignStreamline
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from 'react';

export function useSovereignStreamline() {
  const [analytics, setAnalytics] = useState([]);
  const [attestations, setAttestations] = useState([]);
  const [xrMode, setXrMode] = useState(null);
  const [mintedSeed, setMintedSeed] = useState(null);

  useEffect(() => {
    SovereignStreamline.streamline();

    const unsubAnalytics = SovereignStreamline.on('analytics', (entry) => {
      setAnalytics(prev => [...prev.slice(-99), entry]); // Keep last 100
    });

    const unsubDeed = SovereignStreamline.on('deed-signed', (attestation) => {
      setAttestations(prev => [...prev, attestation]);
    });

    const unsubXR = SovereignStreamline.on('xr-mode', (mode) => {
      setXrMode(mode);
    });

    const unsubMint = SovereignStreamline.on('seed-minted', (seed) => {
      setMintedSeed(seed);
    });

    return () => {
      unsubAnalytics();
      unsubDeed();
      unsubXR();
      unsubMint();
    };
  }, []);

  const attest = useCallback((deedType, options) => {
    return SovereignStreamline.trigger('ATTEST', deedType, options);
  }, []);

  const mint = useCallback((seedData) => {
    return SovereignStreamline.trigger('MINT', seedData);
  }, []);

  const enterDome = useCallback(() => {
    return SovereignStreamline.trigger('DOME');
  }, []);

  const requestXR = useCallback((mode) => {
    return SovereignStreamline.trigger('XR_SESSION', mode);
  }, []);

  return useMemo(() => ({
    analytics,
    attestations,
    xrMode,
    mintedSeed,
    attest,
    mint,
    enterDome,
    requestXR,
    expose: SovereignStreamline.expose,
    getState: SovereignStreamline.getState,
    streamline: SovereignStreamline
  }), [analytics, attestations, xrMode, mintedSeed, attest, mint, enterDome, requestXR]);
}

// AUTO-INITIALIZE
if (typeof window !== 'undefined') {
  // Expose globally for console access
  window.SovereignStreamline = SovereignStreamline;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SovereignStreamline.streamline());
  } else {
    SovereignStreamline.streamline();
  }
}

export default SovereignStreamline;
