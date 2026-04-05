/**
 * SovereignStreamline v4.0 - The Omni-Flow Unified System
 * Coordinates: Rapid City / Black Hills Calibration
 * 
 * Features:
 * - L² Fractal Engine (54-sublayer Web Worker)
 * - Spatial Audio Ritual (layer tones + harmonic chord)
 * - SHA-256 Cryptographic Attestation
 * - Silent Analytics Exposure
 * 
 * Usage:
 *   import SovereignStreamline from './SovereignStreamlineV4';
 *   await SovereignStreamline.mintSeed('cosmic-intention', 54);
 */

const API = process.env.REACT_APP_BACKEND_URL;

const SovereignStreamline = {
  // State
  audioCtx: null,
  initialized: false,
  analyticsBuffer: [],
  mintedSeeds: [],
  attestations: [],
  audioEnabled: true,

  // Event listeners
  _listeners: new Map(),

  // 1. INITIALIZATION & AUDIO CONTEXT
  init() {
    if (this.initialized) return this;
    
    // Initialize AudioContext on user interaction
    if (typeof window !== 'undefined') {
      window.SovereignStreamline = this;
      
      // Lazy audio init (requires user gesture)
      const initAudio = () => {
        if (!this.audioCtx) {
          try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            console.log('[SovereignStreamline] Audio context initialized');
          } catch (e) {
            console.warn('[SovereignStreamline] Audio context failed:', e);
          }
        }
        // Resume if suspended
        if (this.audioCtx?.state === 'suspended') {
          this.audioCtx.resume();
        }
      };
      
      // Init on first user interaction
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, initAudio, { once: true });
      });
    }
    
    this.initialized = true;
    console.log('[SovereignStreamline] v4.0 Initialized — Black Hills Calibration');
    return this;
  },

  // Event emitter
  _emit(event, data) {
    const callbacks = this._listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  },

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(callback);
    return () => {
      const callbacks = this._listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  },

  // 2. THE L² FRACTAL ENGINE (Worker Interface)
  async mintSeed(intention, depth = 54) {
    this.init();
    const startTime = performance.now();
    
    this._emit('mint-start', { intention, depth });
    this.expose('MINT_START', { intention, depth });

    return new Promise((resolve, reject) => {
      try {
        const worker = new Worker(
          new URL('../workers/fractalEngine.js', import.meta.url)
        );
        
        const requestId = `mint_${Date.now()}`;
        worker.postMessage({ seed: intention, depth, requestId });

        const timeout = setTimeout(() => {
          worker.terminate();
          reject(new Error('Minting timeout'));
        }, 30000);

        worker.onmessage = async (e) => {
          if (e.data.type === 'PROGRESS') {
            // Play layer tone for each progress update
            if (this.audioEnabled) {
              this.playLayerTone(e.data.layer);
            }
            this._emit('mint-progress', e.data);
            return;
          }

          if (e.data.type === 'COMPLETE') {
            clearTimeout(timeout);
            worker.terminate();

            const computeTime = Math.round(performance.now() - startTime);
            const hash = await this.generateSHA256(JSON.stringify({
              seed: intention,
              layers: depth,
              timestamp: Date.now(),
              fractalHash: e.data.hash
            }));

            // Play completion chord
            if (this.audioEnabled) {
              this.playHarmonicChord();
            }

            const result = {
              status: 'MINTED',
              hash,
              fractalHash: e.data.hash,
              layers: depth,
              intention,
              metrics: {
                computeTime: `${computeTime}ms`,
                computeTimeMs: computeTime,
                entropy: e.data.metrics?.entropyScore || 95,
                layerHashes: e.data.metrics?.layerHashes || depth
              },
              timestamp: Date.now()
            };

            this.mintedSeeds.push(result);
            this._emit('mint-complete', result);
            this.expose('MINT_COMPLETE', result);

            resolve(result);
          }

          if (e.data.type === 'ERROR') {
            clearTimeout(timeout);
            worker.terminate();
            reject(new Error(e.data.error));
          }
        };

        worker.onerror = (e) => {
          clearTimeout(timeout);
          worker.terminate();
          console.warn('[SovereignStreamline] Worker error, using sync fallback');
          resolve(this._mintSync(intention, depth));
        };
      } catch (e) {
        console.warn('[SovereignStreamline] Worker creation failed, using sync fallback');
        resolve(this._mintSync(intention, depth));
      }
    });
  },

  // Synchronous fallback
  _mintSync(intention, depth) {
    const startTime = performance.now();
    let hash = '';
    
    for (let layer = 0; layer < depth; layer++) {
      const layerSeed = `${JSON.stringify(intention)}_L${layer}_${Date.now()}`;
      let h = 0;
      for (let i = 0; i < layerSeed.length; i++) {
        h = ((h << 5) - h + layerSeed.charCodeAt(i)) | 0;
      }
      hash += Math.abs(h).toString(16).padStart(8, '0');
      
      // Play layer tone every 10 layers in sync mode
      if (layer % 10 === 0 && this.audioEnabled) {
        this.playLayerTone(layer);
      }
    }

    // Play completion chord
    if (this.audioEnabled) {
      this.playHarmonicChord();
    }

    const result = {
      status: 'MINTED',
      hash: hash.slice(0, 64),
      layers: depth,
      intention,
      metrics: {
        computeTime: `${Math.round(performance.now() - startTime)}ms`,
        entropy: 90,
        sync: true
      },
      timestamp: Date.now()
    };

    this.mintedSeeds.push(result);
    this._emit('mint-complete', result);
    
    return result;
  },

  // 3. SPATIAL AUDIO RITUAL
  playLayerTone(layer, duration = 0.1) {
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;
    
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      // Rising frequency: 220Hz (A3) to ~878Hz as layers progress
      // Each layer adds 12.2Hz (approximately a semitone in just intonation)
      const frequency = 220 + (layer * 12.2);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
      
      gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      
      osc.start(this.audioCtx.currentTime);
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Silent fail for audio
    }
  },

  playHarmonicChord(duration = 3) {
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;
    
    try {
      // C Major chord with octave: C4, E4, G4, C5
      const frequencies = [261.63, 329.63, 392.00, 523.25];
      
      frequencies.forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        // Slightly different wave types for richness
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        
        // Slight detune for warmth
        osc.detune.value = (i - 1.5) * 3;
        
        gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, this.audioCtx.currentTime + 0.1);
        gain.gain.setTargetAtTime(0.05, this.audioCtx.currentTime + 0.2, 0.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + duration + 0.5);
      });
      
      console.log('[SovereignStreamline] Harmonic chord played');
    } catch (e) {
      // Silent fail for audio
    }
  },

  // Toggle audio
  setAudioEnabled(enabled) {
    this.audioEnabled = enabled;
    console.log(`[SovereignStreamline] Audio ${enabled ? 'enabled' : 'disabled'}`);
  },

  // 4. CRYPTOGRAPHIC ATTESTATION
  async generateSHA256(message) {
    const msgBuffer = new TextEncoder().encode(
      typeof message === 'string' ? message : JSON.stringify(message)
    );
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // 5. WITNESS ATTESTATION
  async attest(deedType, payload = {}) {
    this.init();
    
    const hash = await this.generateSHA256({
      type: deedType,
      timestamp: Date.now(),
      ...payload
    });

    const attestation = {
      status: 'PENDING_SIGNATURE',
      type: deedType,
      hash,
      timestamp: Date.now(),
      ...payload
    };

    this.attestations.push(attestation);
    this._emit('attestation', attestation);
    this.expose('ATTESTATION_INIT', attestation);

    // Render modal
    this._renderAttestationModal(attestation);

    return attestation;
  },

  async signAttestation(hash) {
    const attestation = this.attestations.find(a => a.hash === hash);
    if (!attestation) return null;

    attestation.status = 'SIGNED';
    attestation.signedAt = Date.now();

    // Play confirmation tone
    if (this.audioEnabled) {
      this.playLayerTone(54); // High tone for confirmation
    }

    // Persist to backend
    try {
      const token = localStorage.getItem('zen_token');
      if (API && token) {
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
      }
    } catch (e) {
      console.warn('[SovereignStreamline] Backend sync deferred:', e);
    }

    this._emit('deed-signed', attestation);
    this.expose('ATTESTATION_SIGNED', attestation);

    return attestation;
  },

  _renderAttestationModal(attestation) {
    if (typeof document === 'undefined') return;

    document.querySelector('#sovereign-attest-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'sovereign-attest-modal';
    modal.innerHTML = `
      <div class="ss-modal-backdrop">
        <div class="ss-modal-content">
          <div class="ss-glyph">⬡</div>
          <h2>WITNESS ATTESTATION</h2>
          <p class="ss-type">${attestation.type}</p>
          <p class="ss-desc">${attestation.description || 'Seal this deed into the Sovereign Ledger.'}</p>
          <div class="ss-hash">${attestation.hash.slice(0, 24)}...</div>
          <div class="ss-actions">
            <button class="ss-btn confirm" data-hash="${attestation.hash}">CONFIRM SIGNATURE</button>
            <button class="ss-btn cancel">CANCEL</button>
          </div>
          <div class="ss-footer">◈ SOVEREIGN VERIFIED • BLACK HILLS</div>
        </div>
      </div>
      <style>
        .ss-modal-backdrop { position: fixed; inset: 0; z-index: 100000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.9); backdrop-filter: blur(20px); animation: ssFadeIn 0.3s ease-out; }
        @keyframes ssFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .ss-modal-content { background: rgba(10,10,20,0.95); border: 1px solid #A855F7; padding: 40px; text-align: center; max-width: 400px; width: 90%; animation: ssSlideUp 0.4s cubic-bezier(0.19,1,0.22,1); }
        @keyframes ssSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .ss-glyph { font-size: 48px; color: #A855F7; margin-bottom: 20px; animation: ssRotate 20s linear infinite; }
        @keyframes ssRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ss-modal-content h2 { font-size: 14px; letter-spacing: 0.3em; color: #FFD700; margin: 0 0 10px; font-family: system-ui; }
        .ss-type { font-size: 24px; color: white; margin: 0 0 15px; letter-spacing: 0.1em; font-family: system-ui; }
        .ss-desc { font-size: 12px; color: rgba(255,255,255,0.5); margin: 0 0 20px; font-family: system-ui; }
        .ss-hash { font-family: monospace; font-size: 10px; color: #00FFC2; background: rgba(0,255,194,0.1); padding: 8px; margin-bottom: 25px; }
        .ss-actions { display: flex; gap: 15px; justify-content: center; }
        .ss-btn { padding: 12px 24px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white; font-size: 11px; letter-spacing: 0.15em; cursor: pointer; transition: all 0.3s; font-family: system-ui; }
        .ss-btn.confirm { border-color: #A855F7; color: #A855F7; }
        .ss-btn.confirm:hover { background: rgba(168,85,247,0.2); }
        .ss-btn.cancel:hover { border-color: #EF4444; color: #EF4444; }
        .ss-footer { margin-top: 25px; font-size: 9px; letter-spacing: 0.2em; color: rgba(255,255,255,0.3); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; font-family: system-ui; }
      </style>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.confirm')?.addEventListener('click', async (e) => {
      const hash = e.target.dataset.hash;
      await this.signAttestation(hash);
      modal.style.animation = 'ssFadeIn 0.3s ease-out reverse';
      setTimeout(() => modal.remove(), 300);
    });

    modal.querySelector('.cancel')?.addEventListener('click', () => {
      this.expose('ATTESTATION_CANCELLED', { hash: attestation.hash });
      modal.style.animation = 'ssFadeIn 0.3s ease-out reverse';
      setTimeout(() => modal.remove(), 300);
    });
  },

  // 6. WEBXR CELESTIAL DOME
  async checkXRSupport() {
    if (!navigator.xr) {
      return { mode: 'INLINE', supported: false };
    }
    
    try {
      const vr = await navigator.xr.isSessionSupported('immersive-vr');
      const ar = await navigator.xr.isSessionSupported('immersive-ar');
      
      return {
        mode: vr ? 'WEBXR_VR' : ar ? 'WEBXR_AR' : 'INLINE',
        supported: vr || ar,
        vr,
        ar
      };
    } catch (e) {
      return { mode: 'INLINE', supported: false, error: e.message };
    }
  },

  // 7. ANALYTICS EXPOSURE
  expose(event, detail) {
    const entry = {
      timestamp: Date.now(),
      event,
      detail,
      sessionId: sessionStorage.getItem('sovereign_session') || 'anon'
    };
    this.analyticsBuffer.push(entry);
    this._emit('analytics', entry);
    console.debug(`[Analytics] ${event}`, detail);
    return entry;
  },

  // Getters
  getAnalytics: () => SovereignStreamline.analyticsBuffer,
  getMintedSeeds: () => SovereignStreamline.mintedSeeds,
  getAttestations: () => SovereignStreamline.attestations,
  
  // Master trigger (backwards compatible)
  async trigger(action, type, payload = {}) {
    switch (action) {
      case 'MINT':
        return this.mintSeed(payload.seed || payload.intention, payload.depth);
      case 'ATTEST':
        return this.attest(type, payload);
      case 'DOME':
        return this.checkXRSupport();
      case 'SIGN':
        return this.signAttestation(payload.hash);
      default:
        console.warn(`[SovereignStreamline] Unknown action: ${action}`);
        return null;
    }
  }
};

// Auto-initialize
if (typeof window !== 'undefined') {
  window.SovereignStreamline = SovereignStreamline;
  SovereignStreamline.init();
}

export default SovereignStreamline;

// React Hook
export function useSovereignStreamlineV4() {
  const { useState, useEffect, useCallback, useMemo } = require('react');

  const [mintProgress, setMintProgress] = useState(null);
  const [mintResult, setMintResult] = useState(null);
  const [attestations, setAttestations] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    SovereignStreamline.init();

    const unsubs = [
      SovereignStreamline.on('mint-progress', setMintProgress),
      SovereignStreamline.on('mint-complete', setMintResult),
      SovereignStreamline.on('attestation', (a) => setAttestations(prev => [...prev, a])),
      SovereignStreamline.on('deed-signed', () => setAttestations(SovereignStreamline.getAttestations()))
    ];

    return () => unsubs.forEach(u => u());
  }, []);

  const mint = useCallback((intention, depth) => 
    SovereignStreamline.mintSeed(intention, depth), []);

  const attest = useCallback((type, payload) => 
    SovereignStreamline.attest(type, payload), []);

  const toggleAudio = useCallback((enabled) => {
    setAudioEnabled(enabled);
    SovereignStreamline.setAudioEnabled(enabled);
  }, []);

  return useMemo(() => ({
    mintProgress,
    mintResult,
    attestations,
    audioEnabled,
    mint,
    attest,
    toggleAudio,
    checkXR: SovereignStreamline.checkXRSupport,
    streamline: SovereignStreamline
  }), [mintProgress, mintResult, attestations, audioEnabled, mint, attest, toggleAudio]);
}
