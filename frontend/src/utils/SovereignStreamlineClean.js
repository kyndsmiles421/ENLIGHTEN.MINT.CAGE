/**
 * SovereignStreamline v3.1 - The Omni-Flow System (Clean Edition)
 * 
 * Features:
 * - SHA-256 Witness Attestation
 * - 54-Sublayer L² Fractal Engine (Web Worker)
 * - WebXR Celestial Dome Detection
 * - Silent Analytics Exposure
 * 
 * Usage:
 *   import SovereignStreamline from './SovereignStreamlineClean';
 *   const attestation = await SovereignStreamline.trigger('ATTEST', 'MEDITATION', { duration: 300 });
 *   const minted = await SovereignStreamline.trigger('MINT', null, { seed: 'cosmic' });
 *   const dome = await SovereignStreamline.trigger('DOME');
 */

const API = process.env.REACT_APP_BACKEND_URL;

const SovereignStreamline = {
  // State
  _state: {
    analyticsBuffer: [],
    attestations: [],
    mintedSeeds: [],
    xrCapabilities: null,
    initialized: false
  },

  // Event listeners
  _listeners: new Map(),

  // Emit event
  _emit: (event, data) => {
    const callbacks = SovereignStreamline._listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  },

  // Subscribe to events
  on: (event, callback) => {
    if (!SovereignStreamline._listeners.has(event)) {
      SovereignStreamline._listeners.set(event, []);
    }
    SovereignStreamline._listeners.get(event).push(callback);
    return () => {
      const callbacks = SovereignStreamline._listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  },

  // SHA-256 Hash Generation for Witness Attestation
  generateHash: async (data) => {
    const msgUint8 = new TextEncoder().encode(JSON.stringify(data));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Silent Analytics Exposure
  expose: (event, detail) => {
    const entry = {
      timestamp: Date.now(),
      event,
      detail,
      sessionId: sessionStorage.getItem('sovereign_session') || 'anon'
    };
    SovereignStreamline._state.analyticsBuffer.push(entry);
    SovereignStreamline._emit('analytics', entry);
    console.debug(`[Analytics] ${event}`, detail);
    return entry;
  },

  // Trigger Central Dispatch
  trigger: async (action, type, payload = {}) => {
    console.log(`[SovereignStreamline] Dispatching: ${action}`);
    SovereignStreamline.expose('TRIGGER', { action, type });

    switch (action) {
      case 'ATTEST': {
        const hash = await SovereignStreamline.generateHash({
          ...payload,
          type,
          timestamp: Date.now()
        });
        
        const attestation = {
          status: 'PENDING_SIGNATURE',
          type,
          hash,
          timestamp: Date.now(),
          ...payload
        };
        
        SovereignStreamline._state.attestations.push(attestation);
        SovereignStreamline._emit('attestation', attestation);
        
        // Render attestation UI
        SovereignStreamline._renderAttestationModal(attestation);
        
        return attestation;
      }

      case 'MINT': {
        SovereignStreamline.expose('MINT_START', { seed: payload.seed });
        
        // Use Web Worker for fractal computation
        try {
          const worker = new Worker(
            new URL('../workers/fractalEngine.js', import.meta.url)
          );
          
          const requestId = `mint_${Date.now()}`;
          worker.postMessage({ 
            seed: payload.seed, 
            depth: payload.depth || 54,
            requestId 
          });
          
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              worker.terminate();
              reject(new Error('Minting timeout'));
            }, 30000);
            
            worker.onmessage = (e) => {
              if (e.data.type === 'PROGRESS') {
                SovereignStreamline._emit('mint-progress', e.data);
              } else if (e.data.type === 'COMPLETE') {
                clearTimeout(timeout);
                worker.terminate();
                
                const result = {
                  status: 'MINTED',
                  ...e.data,
                  seed: payload.seed
                };
                
                SovereignStreamline._state.mintedSeeds.push(result);
                SovereignStreamline._emit('seed-minted', result);
                SovereignStreamline.expose('MINT_COMPLETE', result);
                
                resolve(result);
              } else if (e.data.type === 'ERROR') {
                clearTimeout(timeout);
                worker.terminate();
                reject(new Error(e.data.error));
              }
            };
            
            worker.onerror = (e) => {
              clearTimeout(timeout);
              worker.terminate();
              reject(e);
            };
          });
        } catch (e) {
          console.warn('[Mint] Worker failed, using sync fallback');
          return SovereignStreamline._mintSync(payload);
        }
      }

      case 'DOME': {
        SovereignStreamline.expose('DOME_CHECK', {});
        
        if (!navigator.xr) {
          const result = {
            mode: 'INLINE_CELESTIAL',
            glContext: 'webgl2',
            xrSupported: false
          };
          SovereignStreamline._state.xrCapabilities = result;
          SovereignStreamline._emit('xr-mode', result);
          return result;
        }
        
        try {
          const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
          const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
          
          const result = {
            mode: vrSupported ? 'WEBXR_IMMERSIVE_VR' : 
                  arSupported ? 'WEBXR_IMMERSIVE_AR' : 'INLINE_CELESTIAL',
            glContext: 'webgl2',
            xrSupported: vrSupported || arSupported,
            vrSupported,
            arSupported
          };
          
          SovereignStreamline._state.xrCapabilities = result;
          SovereignStreamline._emit('xr-mode', result);
          SovereignStreamline.expose('DOME_READY', result);
          
          return result;
        } catch (e) {
          const result = {
            mode: 'INLINE_CELESTIAL',
            glContext: 'webgl2',
            xrSupported: false,
            error: e.message
          };
          SovereignStreamline._state.xrCapabilities = result;
          return result;
        }
      }

      case 'SIGN': {
        // Complete attestation signature
        const attestation = SovereignStreamline._state.attestations.find(
          a => a.hash === payload.hash
        );
        
        if (attestation) {
          attestation.status = 'SIGNED';
          attestation.signedAt = Date.now();
          
          // Persist to backend
          SovereignStreamline._persistAttestation(attestation);
          SovereignStreamline._emit('deed-signed', attestation);
          SovereignStreamline.expose('ATTESTATION_SIGNED', attestation);
        }
        
        return attestation;
      }

      default:
        console.warn(`[SovereignStreamline] Unknown action: ${action}`);
        return null;
    }
  },

  // Sync minting fallback
  _mintSync: (payload) => {
    const seed = payload.seed;
    const depth = payload.depth || 54;
    let hash = '';
    
    for (let layer = 0; layer < depth; layer++) {
      const layerSeed = `${JSON.stringify(seed)}_L${layer}_${Date.now()}`;
      let h = 0;
      for (let i = 0; i < layerSeed.length; i++) {
        h = ((h << 5) - h + layerSeed.charCodeAt(i)) | 0;
      }
      hash += Math.abs(h).toString(16).padStart(8, '0');
    }
    
    const result = {
      status: 'MINTED',
      hash: hash.slice(0, 64),
      layers: depth,
      timestamp: Date.now(),
      seed,
      sync: true
    };
    
    SovereignStreamline._state.mintedSeeds.push(result);
    SovereignStreamline._emit('seed-minted', result);
    
    return result;
  },

  // Persist attestation to backend
  _persistAttestation: async (attestation) => {
    try {
      const token = localStorage.getItem('zen_token');
      if (!API || !token) return;
      
      await fetch(`${API}/api/sanctuary/deed-simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deed_type: attestation.type,
          description: attestation.description || `${attestation.type} attestation`,
          karma_value: attestation.karmaValue || 100,
          witness_hash: attestation.hash
        })
      });
    } catch (e) {
      console.warn('[Attestation] Backend sync failed:', e);
    }
  },

  // Render attestation modal
  _renderAttestationModal: (attestation) => {
    if (typeof document === 'undefined') return;
    
    // Remove existing modal
    document.querySelector('#sovereign-attest-modal')?.remove();
    
    const modal = document.createElement('div');
    modal.id = 'sovereign-attest-modal';
    modal.innerHTML = `
      <div class="sovereign-modal-backdrop">
        <div class="sovereign-modal-content">
          <div class="sovereign-glyph">⬡</div>
          <h2>WITNESS ATTESTATION</h2>
          <p class="sovereign-type">${attestation.type}</p>
          <p class="sovereign-desc">${attestation.description || 'Seal this deed into the Sovereign Ledger.'}</p>
          <div class="sovereign-hash">${attestation.hash.slice(0, 24)}...</div>
          <div class="sovereign-actions">
            <button class="sovereign-btn confirm" data-hash="${attestation.hash}">CONFIRM SIGNATURE</button>
            <button class="sovereign-btn cancel">CANCEL</button>
          </div>
          <div class="sovereign-footer">◈ SOVEREIGN VERIFIED</div>
        </div>
      </div>
      <style>
        .sovereign-modal-backdrop {
          position: fixed; inset: 0; z-index: 100000;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.9); backdrop-filter: blur(20px);
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .sovereign-modal-content {
          background: rgba(10,10,20,0.95); border: 1px solid #A855F7;
          padding: 40px; text-align: center; max-width: 400px; width: 90%;
          animation: slideUp 0.4s cubic-bezier(0.19,1,0.22,1);
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .sovereign-glyph { font-size: 48px; color: #A855F7; margin-bottom: 20px; animation: rotate 20s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .sovereign-modal-content h2 { font-size: 14px; letter-spacing: 0.3em; color: #FFD700; margin: 0 0 10px; }
        .sovereign-type { font-size: 24px; color: white; margin: 0 0 15px; letter-spacing: 0.1em; }
        .sovereign-desc { font-size: 12px; color: rgba(255,255,255,0.5); margin: 0 0 20px; }
        .sovereign-hash { font-family: monospace; font-size: 10px; color: #00FFC2; background: rgba(0,255,194,0.1); padding: 8px; margin-bottom: 25px; }
        .sovereign-actions { display: flex; gap: 15px; justify-content: center; }
        .sovereign-btn { padding: 12px 24px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white; font-size: 11px; letter-spacing: 0.15em; cursor: pointer; transition: all 0.3s; }
        .sovereign-btn.confirm { border-color: #A855F7; color: #A855F7; }
        .sovereign-btn.confirm:hover { background: rgba(168,85,247,0.2); }
        .sovereign-btn.cancel:hover { border-color: #EF4444; color: #EF4444; }
        .sovereign-footer { margin-top: 25px; font-size: 9px; letter-spacing: 0.2em; color: rgba(255,255,255,0.3); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; }
      </style>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('.confirm')?.addEventListener('click', async (e) => {
      const hash = e.target.dataset.hash;
      await SovereignStreamline.trigger('SIGN', null, { hash });
      modal.style.animation = 'fadeIn 0.3s ease-out reverse';
      setTimeout(() => modal.remove(), 300);
    });
    
    modal.querySelector('.cancel')?.addEventListener('click', () => {
      SovereignStreamline.expose('ATTESTATION_CANCELLED', { hash: attestation.hash });
      modal.style.animation = 'fadeIn 0.3s ease-out reverse';
      setTimeout(() => modal.remove(), 300);
    });
  },

  // Get state
  getState: () => ({ ...SovereignStreamline._state }),
  
  // Get analytics
  getAnalytics: () => [...SovereignStreamline._state.analyticsBuffer],
  
  // Get attestations
  getAttestations: () => [...SovereignStreamline._state.attestations],
  
  // Get minted seeds
  getMintedSeeds: () => [...SovereignStreamline._state.mintedSeeds],

  // Initialize
  init: () => {
    if (SovereignStreamline._state.initialized) return;
    
    // Generate session ID
    if (!sessionStorage.getItem('sovereign_session')) {
      sessionStorage.setItem('sovereign_session', `ss_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    }
    
    SovereignStreamline._state.initialized = true;
    console.log('[SovereignStreamline] v3.1 Initialized');
  }
};

// Auto-initialize and expose globally
if (typeof window !== 'undefined') {
  window.SovereignStreamline = SovereignStreamline;
  SovereignStreamline.init();
}

export default SovereignStreamline;

// React Hook
export function useSovereignStreamline() {
  const { useState, useEffect, useCallback, useMemo } = require('react');
  
  const [attestations, setAttestations] = useState([]);
  const [mintedSeeds, setMintedSeeds] = useState([]);
  const [xrMode, setXrMode] = useState(null);
  const [mintProgress, setMintProgress] = useState(null);

  useEffect(() => {
    SovereignStreamline.init();

    const unsubs = [
      SovereignStreamline.on('attestation', (a) => setAttestations(prev => [...prev, a])),
      SovereignStreamline.on('deed-signed', (a) => setAttestations(SovereignStreamline.getAttestations())),
      SovereignStreamline.on('seed-minted', (s) => setMintedSeeds(prev => [...prev, s])),
      SovereignStreamline.on('xr-mode', (m) => setXrMode(m)),
      SovereignStreamline.on('mint-progress', (p) => setMintProgress(p))
    ];

    return () => unsubs.forEach(u => u());
  }, []);

  const attest = useCallback((type, payload) => 
    SovereignStreamline.trigger('ATTEST', type, payload), []);
  
  const mint = useCallback((seed, depth) => 
    SovereignStreamline.trigger('MINT', null, { seed, depth }), []);
  
  const checkDome = useCallback(() => 
    SovereignStreamline.trigger('DOME'), []);

  return useMemo(() => ({
    attestations,
    mintedSeeds,
    xrMode,
    mintProgress,
    attest,
    mint,
    checkDome,
    expose: SovereignStreamline.expose,
    streamline: SovereignStreamline
  }), [attestations, mintedSeeds, xrMode, mintProgress, attest, mint, checkDome]);
}
