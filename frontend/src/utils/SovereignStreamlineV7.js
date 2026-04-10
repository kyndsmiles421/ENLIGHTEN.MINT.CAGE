/**
 * SovereignStreamline v7.0 — Unified Resonant Core
 * Calibration: Rapid City / Black Hills Master Node
 * 
 * Features:
 * - Schumann Binaural (7.83Hz brainwave entrainment)
 * - Metatron's Cube Omni-Point System (13 nodes)
 * - Splitting Tetrahedron with Inversed Spin
 * - L² 54-Layer Fractal Engine
 * - GPS Geofencing (Black Hills proximity)
 * - Sovereign Ledger Persistence
 * 
 * Usage:
 *   import SovereignStreamline from './SovereignStreamlineV7';
 *   const result = await SovereignStreamline.startCeremony('cosmic-intention');
 */

const API = process.env.REACT_APP_BACKEND_URL;

// Black Hills Master Node Coordinates (Rapid City, SD)
const BLACK_HILLS_COORDS = {
  latitude: 44.08,
  longitude: -103.23,
  radiusKm: 50 // 50km activation radius
};

const SovereignStreamline = {
  // Core State
  ctx: null,
  binauralNodes: {},
  isRitualActive: false,
  initialized: false,
  geoLockStatus: 'STANDARD_PHASE',
  
  // Event listeners
  _listeners: new Map(),

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. RESONANCE INITIALIZATION (Binaural + Spatial)
  // ═══════════════════════════════════════════════════════════════════════════
  
  initAudio() {
    if (this.ctx && this.ctx.state !== 'closed') return this.ctx;
    
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      console.log('[SovereignStreamline] Audio context initialized');
      return this.ctx;
    } catch (e) {
      console.warn('[SovereignStreamline] Audio context failed:', e);
      return null;
    }
  },

  /**
   * Start Schumann Resonance Binaural Beat
   * Base: 100Hz, Offset: 107.83Hz (7.83Hz delta)
   * Creates meditative theta wave entrainment
   */
  startBinaural() {
    if (!this.ctx) this.initAudio();
    if (!this.ctx || this.binauralNodes.active) return;

    try {
      // Left ear: 100Hz base frequency
      const left = this.ctx.createOscillator();
      left.type = 'sine';
      left.frequency.value = 100;

      // Right ear: 107.83Hz (7.83Hz Schumann offset)
      const right = this.ctx.createOscillator();
      right.type = 'sine';
      right.frequency.value = 107.83;

      // Stereo panners for binaural separation
      const pannerL = this.ctx.createStereoPanner();
      pannerL.pan.value = -1; // Full left

      const pannerR = this.ctx.createStereoPanner();
      pannerR.pan.value = 1; // Full right

      // Master gain (subtle, not overwhelming)
      const gain = this.ctx.createGain();
      gain.gain.value = 0; // Start at 0
      gain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 0.5); // Fade in

      // Connect nodes
      left.connect(pannerL);
      pannerL.connect(gain);

      right.connect(pannerR);
      pannerR.connect(gain);

      gain.connect(this.ctx.destination);

      // Start oscillators
      left.start();
      right.start();

      this.binauralNodes = { left, right, gain, pannerL, pannerR, active: true };
      console.log('[SovereignStreamline] Schumann binaural started (7.83Hz entrainment)');
      
      this._emit('binaural-start', { baseFreq: 100, offsetFreq: 107.83, delta: 7.83 });
    } catch (e) {
      console.warn('[SovereignStreamline] Binaural start failed:', e);
    }
  },

  stopBinaural() {
    if (!this.binauralNodes.active) return;

    try {
      const { gain, left, right } = this.binauralNodes;
      
      // Fade out smoothly
      gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      
      // Stop oscillators after fade
      setTimeout(() => {
        try {
          left?.stop();
          right?.stop();
        } catch (e) {}
        this.binauralNodes = { active: false };
      }, 1500);

      console.log('[SovereignStreamline] Schumann binaural stopped');
      this._emit('binaural-stop', {});
    } catch (e) {
      console.warn('[SovereignStreamline] Binaural stop failed:', e);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. OMNI-POINT SYSTEM (Metatron's Cube Geometry)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate 13 Metatron's Cube interaction nodes
   * Plus 4 tetrahedron vertices for splitting geometry
   */
  generateTouchPoints(scale = 2) {
    const points = [];
    
    // Metatron's Cube Centers (13-circle sacred geometry)
    // Center point
    points.push({
      id: 'metatron-center',
      x: 0, y: 0, z: 0,
      type: 'CORE',
      action: 'WITNESS'
    });
    
    // Inner hexagon (6 points)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      points.push({
        id: `metatron-inner-${i}`,
        x: Math.cos(angle) * scale,
        y: Math.sin(angle) * scale,
        z: 0,
        type: 'INTERACTABLE',
        action: 'RESONATE'
      });
    }
    
    // Outer hexagon (6 points, rotated 30°)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
      points.push({
        id: `metatron-outer-${i}`,
        x: Math.cos(angle) * scale * 1.732,
        y: Math.sin(angle) * scale * 1.732,
        z: 0,
        type: 'INTERACTABLE',
        action: 'GEOLOCK'
      });
    }
    
    // Tetrahedron vertices (for splitting animation)
    const tetraScale = scale * 1.5;
    [
      { x: 0, y: tetraScale, z: 0 },
      { x: tetraScale * 0.866, y: -tetraScale * 0.5, z: 0 },
      { x: -tetraScale * 0.866, y: -tetraScale * 0.5, z: 0 },
      { x: 0, y: 0, z: tetraScale }
    ].forEach((pos, i) => {
      points.push({
        id: `tetra-vertex-${i}`,
        ...pos,
        type: 'TETRAHEDRON',
        action: 'SPLIT'
      });
    });

    return points;
  },

  /**
   * Get dual-inversed rotation state for animation
   * Tetrahedron: Squared acceleration
   * Metatron: Inversed squared (counter-drag)
   */
  getRotationState(time) {
    const base = (time * 0.001) % 360;
    const safeDivisor = Math.max(Math.pow(base, 2), 0.001); // Prevent division by zero
    
    return {
      tetrahedron: Math.pow(base, 2),           // Squared (accelerating)
      metatron: 1 / safeDivisor,                // Inversed squared (decelerating)
      splitFactor: Math.sin(base * 0.1) * 2,    // "Breath" displacement
      breathPhase: (Math.sin(base * 0.05) + 1) / 2  // 0-1 for opacity
    };
  },

  /**
   * Calculate full vector state for Three.js rendering
   */
  calculateVectorState() {
    const time = Date.now();
    const rotation = this.getRotationState(time);
    const points = this.generateTouchPoints();
    
    return {
      rotation,
      activeNodes: points.map(p => ({
        ...p,
        opacity: rotation.breathPhase,
        scale: 1 + Math.sin(time * 0.001 + p.x) * 0.1
      })),
      displacement: rotation.splitFactor,
      timestamp: time
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. OMNI-POINT DISPATCHER
  // ═══════════════════════════════════════════════════════════════════════════

  async dispatch(pointId, action, payload = {}) {
    console.log(`[Omni-Point] Interaction at: ${pointId}, Action: ${action}`);
    this._emit('omni-dispatch', { pointId, action, payload });

    // Activate silence shield
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('SHIELD_ACTIVATE'));
    }

    switch (action) {
      case 'WITNESS':
        const hash = await this.generateSHA256(payload.intention || pointId);
        const attestation = {
          pointId,
          hash,
          type: 'ATTESTATION',
          timestamp: Date.now(),
          geoLock: this.geoLockStatus
        };
        this.saveLedger(attestation);
        this._emit('witness', attestation);
        return attestation;

      case 'RESONATE':
        this.playLayerTone(payload.layer || parseInt(pointId.split('-').pop()) * 4);
        return { resonated: true, layer: payload.layer };

      case 'GEOLOCK':
        const status = await this.checkGeoLock();
        this._emit('geolock', status);
        return status;

      case 'SPLIT':
        // Trigger tetrahedron split animation
        this._emit('tetra-split', { pointId, factor: this.getRotationState(Date.now()).splitFactor });
        return { split: true };

      default:
        console.warn(`[Omni-Point] Unknown action: ${action}`);
        return null;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. THE VECTOR-FRACTAL CEREMONY (L² 54-Layer)
  // ═══════════════════════════════════════════════════════════════════════════

  async startCeremony(intention, options = {}) {
    this.initAudio();
    this.isRitualActive = true;
    
    // Start binaural entrainment
    if (options.binaural !== false) {
      this.startBinaural();
    }

    // Activate silence shield
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('SHIELD_ACTIVATE'));
    }

    this._emit('ceremony-start', { intention });

    const startTime = performance.now();
    const depth = options.depth || 54;

    return new Promise((resolve, reject) => {
      try {
        const worker = new Worker(
          new URL('../workers/fractalEngine.js', import.meta.url)
        );

        const requestId = `ceremony_${Date.now()}`;
        worker.postMessage({ seed: intention, depth, requestId });

        const timeout = setTimeout(() => {
          worker.terminate();
          this.stopBinaural();
          reject(new Error('Ceremony timeout'));
        }, 60000);

        worker.onmessage = async (e) => {
          if (e.data.type === 'PROGRESS') {
            this.playLayerTone(e.data.layer);
            this._emit('ceremony-progress', e.data);
            return;
          }

          if (e.data.type === 'COMPLETE') {
            clearTimeout(timeout);
            worker.terminate();

            const computeTime = Math.round(performance.now() - startTime);
            const hash = await this.generateSHA256(JSON.stringify({
              seed: intention,
              fractalHash: e.data.hash,
              layers: depth,
              timestamp: Date.now()
            }));

            // Play completion chord
            this.playHarmonicChord();
            
            // Stop binaural after chord
            setTimeout(() => this.stopBinaural(), 3000);

            const result = {
              status: 'MINTED',
              hash,
              fractalHash: e.data.hash,
              layers: depth,
              intention,
              metrics: {
                computeTime: `${computeTime}ms`,
                computeTimeMs: computeTime,
                entropy: e.data.metrics?.entropyScore || 97
              },
              geometry: this.calculateVectorState(),
              geoLock: this.geoLockStatus,
              location: this.geoLockStatus === 'GOLDEN_LOCK_ACTIVE' 
                ? 'BLACK_HILLS_CALIBRATED' 
                : 'STANDARD_PHASE',
              timestamp: Date.now()
            };

            // Persist to sovereign ledger
            this.saveLedger(result);
            
            this.isRitualActive = false;
            this._emit('ceremony-complete', result);
            
            resolve(result);
          }

          if (e.data.type === 'ERROR') {
            clearTimeout(timeout);
            worker.terminate();
            this.stopBinaural();
            this.isRitualActive = false;
            reject(new Error(e.data.error));
          }
        };

        worker.onerror = (e) => {
          clearTimeout(timeout);
          worker.terminate();
          this.stopBinaural();
          this.isRitualActive = false;
          // Fallback to sync
          this._mintSync(intention, depth).then(resolve).catch(reject);
        };
      } catch (e) {
        this.stopBinaural();
        this.isRitualActive = false;
        this._mintSync(intention, depth).then(resolve).catch(reject);
      }
    });
  },

  // Synchronous fallback
  async _mintSync(intention, depth = 54) {
    const startTime = performance.now();
    let hash = '';

    for (let layer = 0; layer < depth; layer++) {
      const layerSeed = `${JSON.stringify(intention)}_L${layer}_${Date.now()}`;
      let h = 0;
      for (let i = 0; i < layerSeed.length; i++) {
        h = ((h << 5) - h + layerSeed.charCodeAt(i)) | 0;
      }
      hash += Math.abs(h).toString(16).padStart(8, '0');

      if (layer % 10 === 0) {
        this.playLayerTone(layer);
      }
    }

    this.playHarmonicChord();

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
      geometry: this.calculateVectorState(),
      geoLock: this.geoLockStatus,
      timestamp: Date.now()
    };

    this.saveLedger(result);
    this._emit('ceremony-complete', result);

    return result;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. GPS GEOFENCING (Black Hills Proximity)
  // ═══════════════════════════════════════════════════════════════════════════

  async checkGeoLock() {
    if (!navigator.geolocation) {
      this.geoLockStatus = 'GEO_UNAVAILABLE';
      return { status: this.geoLockStatus, supported: false };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const distance = this._haversineDistance(
            latitude, longitude,
            BLACK_HILLS_COORDS.latitude, BLACK_HILLS_COORDS.longitude
          );

          if (distance <= BLACK_HILLS_COORDS.radiusKm) {
            this.geoLockStatus = 'GOLDEN_LOCK_ACTIVE';
            console.log(`[GeoLock] BLACK_HILLS_NODE_LOCKED (${distance.toFixed(1)}km from center)`);
          } else {
            this.geoLockStatus = 'STANDARD_PHASE';
            console.log(`[GeoLock] Standard phase (${distance.toFixed(1)}km from Black Hills)`);
          }

          resolve({
            status: this.geoLockStatus,
            distance: distance.toFixed(1),
            coords: { latitude, longitude },
            targetCoords: BLACK_HILLS_COORDS
          });
        },
        (error) => {
          this.geoLockStatus = 'GEO_DENIED';
          resolve({ status: this.geoLockStatus, error: error.message });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  },

  _haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. SPATIAL AUDIO (Layer Tones + Harmonic Chord)
  // ═══════════════════════════════════════════════════════════════════════════

  playLayerTone(layer, duration = 0.1) {
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Rising frequency: 220Hz (A3) to ~878Hz
      const frequency = 220 + (layer * 12.2);
      
      osc.type = 'sine';
      osc.frequency.value = frequency;

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },

  playHarmonicChord(duration = 3) {
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      // C Major chord: C4, E4, G4, C5
      const frequencies = [261.63, 329.63, 392.00, 523.25];

      frequencies.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = (i - 1.5) * 3;

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.1);
        gain.gain.setTargetAtTime(0.05, this.ctx.currentTime + 0.2, 0.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration + 0.5);
      });

      console.log('[SovereignStreamline] Harmonic chord played');
    } catch (e) {}
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. SOVEREIGN LEDGER (Persistence)
  // ═══════════════════════════════════════════════════════════════════════════

  getLedger() {
    try {
      return JSON.parse(localStorage.getItem('SOVEREIGN_LEDGER') || '[]');
    } catch {
      return [];
    }
  },

  saveLedger(entry) {
    try {
      const ledger = this.getLedger();
      ledger.unshift(entry);
      // Keep last 100 entries
      localStorage.setItem('SOVEREIGN_LEDGER', JSON.stringify(ledger.slice(0, 100)));
      this._emit('ledger-update', { entry, total: ledger.length });
    } catch (e) {
      console.warn('[Ledger] Save failed:', e);
    }
  },

  clearLedger() {
    localStorage.removeItem('SOVEREIGN_LEDGER');
    this._emit('ledger-clear', {});
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. CRYPTOGRAPHIC UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  async generateSHA256(message) {
    const msgBuffer = new TextEncoder().encode(
      typeof message === 'string' ? message : JSON.stringify(message)
    );
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. EVENT SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════

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
      const idx = callbacks.indexOf(callback);
      if (idx > -1) callbacks.splice(idx, 1);
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  init() {
    if (this.initialized) return this;

    // Expose globally
    if (typeof window !== 'undefined') {
      window.SovereignStreamline = this;
      
      // Lazy audio init on user interaction
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, () => this.initAudio(), { once: true });
      });

      // Check geo lock on init
      this.checkGeoLock().catch(() => {});
    }

    this.initialized = true;
    console.log('[SovereignStreamline] v7.0 Initialized — Black Hills Master Node');
    return this;
  },

  // Backward compatibility
  async trigger(action, type, payload = {}) {
    switch (action) {
      case 'MINT':
        return this.startCeremony(payload.seed || payload.intention, payload);
      case 'ATTEST':
        return this.dispatch('center', 'WITNESS', { intention: type, ...payload });
      case 'DOME':
        return this.checkXRSupport();
      default:
        return this.dispatch(type, action, payload);
    }
  },

  async checkXRSupport() {
    if (!navigator.xr) return { mode: 'INLINE', supported: false };
    
    try {
      const vr = await navigator.xr.isSessionSupported('immersive-vr');
      const ar = await navigator.xr.isSessionSupported('immersive-ar');
      return { mode: vr ? 'WEBXR_VR' : ar ? 'WEBXR_AR' : 'INLINE', supported: vr || ar, vr, ar };
    } catch (e) {
      return { mode: 'INLINE', supported: false };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. MATRIX LIBERATION (v7.1 — Fixes "Box" issue)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get Matrix-decoupled style for fixed positioning
   * Uses Vector Offsets synced with Tetrahedron "breath"
   */
  getMatrixStyle() {
    const time = Date.now() * 0.001;
    const split = Math.sin(time) * 15; // Syncs with Tetrahedron "breath"
    return {
      position: 'fixed',
      top: '20%',
      left: `calc(10% + ${split}px)`,
      zIndex: 9999,
      transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
      border: 'none',
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(10px)'
    };
  },

  /**
   * Apply Matrix Fluidity to container element
   * Forces fixed coordinate system to decouple from DOM box model
   */
  applyMatrixFluidity(selector = '.matrix-container') {
    const matrix = document.querySelector(selector);
    if (matrix) {
      matrix.style.position = 'fixed';
      matrix.style.zIndex = '9999';
      matrix.style.border = 'none';
      matrix.style.background = 'transparent';
      // Syncs with the Metatron "Breath" (Splitting Tetrahedron)
      matrix.style.transform = `translateY(${Math.sin(Date.now() / 1000) * 10}px)`;
    }
    return this;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. OMNI-POINT TOUCH-PRINTING (v7.1 — Splitting Tetrahedron Vertices)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize DOM touch points for the Splitting Tetrahedron
   * Maps interaction nodes to vertices with auto-resonance on touch
   */
  initTouchPoints(container = document.body) {
    const vertices = [
      { x: 0, y: -200, label: 'Apex' },
      { x: -150, y: 150, label: 'Base-Left' },
      { x: 150, y: 150, label: 'Base-Right' }
    ];
    
    vertices.forEach((v, i) => {
      const node = document.createElement('div');
      node.className = 'omni-point-vertex';
      node.setAttribute('data-vertex', v.label);
      node.setAttribute('data-testid', `omni-vertex-${i}`);
      node.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(168,85,247,0.2) 100%);
        transform: translate(${v.x}px, ${v.y}px);
        cursor: pointer;
        z-index: 9998;
        box-shadow: 0 0 20px rgba(168,85,247,0.5);
        transition: all 0.3s ease;
      `;
      
      node.onclick = () => {
        // Start resonance on touch
        this.startBinaural();
        this.playLayerTone(i * 18); // Spread across frequency range
        node.style.transform = `translate(${v.x}px, ${v.y}px) scale(1.5)`;
        setTimeout(() => {
          node.style.transform = `translate(${v.x}px, ${v.y}px) scale(1)`;
        }, 300);
      };
      
      container.appendChild(node);
    });
    
    console.log('[SovereignStreamline] Omni-Point vertices initialized');
    return this;
  },

  /**
   * Remove DOM touch points
   */
  removeTouchPoints() {
    document.querySelectorAll('.omni-point-vertex').forEach(el => el.remove());
    return this;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 13. EMERGENCY RESET (v7.1 — Shield Bypass)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Hard emergency reset - bypasses SilenceShield
   * Dispatches SHIELD_DEACTIVATE event before reload
   */
  emergencyReset() {
    console.log('[SovereignStreamline] Emergency Reset Triggered');
    
    // Deactivate silence shield
    window.dispatchEvent(new CustomEvent('SHIELD_DEACTIVATE'));
    
    // Stop all audio
    this.stopBinaural();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
    }
    
    // Clear local state
    this.isRitualActive = false;
    this.binauralNodes = { active: false };
    
    // Hard reload after brief delay
    setTimeout(() => {
      window.location.reload();
    }, 100);
  },

  /**
   * Render physical emergency reset button (v7.1)
   * Absolute top-left, bypassing all DOM clipping
   */
  renderEmergencyResetButton() {
    // Skip on /hub route - it has its own V25.0 STOP button
    if (window.location.pathname === '/hub') return;
    
    // Check if already exists
    if (document.getElementById('sovereign-emergency-reset')) return;
    
    const btn = document.createElement('button');
    btn.id = 'sovereign-emergency-reset';
    btn.innerHTML = '🛑 STOP';
    btn.setAttribute('data-testid', 'sovereign-emergency-reset');
    btn.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 100000;
      background: rgba(220, 38, 38, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid white;
      font-weight: bold;
      cursor: pointer;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
      transition: all 0.2s ease;
    `;
    
    btn.onmouseenter = () => {
      btn.style.background = 'rgba(220, 38, 38, 1)';
      btn.style.transform = 'scale(1.05)';
    };
    btn.onmouseleave = () => {
      btn.style.background = 'rgba(220, 38, 38, 0.8)';
      btn.style.transform = 'scale(1)';
    };
    
    btn.onclick = () => this.emergencyReset();
    
    document.body.appendChild(btn);
    console.log('[SovereignStreamline] Emergency Reset button rendered');
    return btn;
  }
};

// Auto-initialize
if (typeof window !== 'undefined') {
  window.SovereignStreamline = SovereignStreamline;
  SovereignStreamline.init();
}

export default SovereignStreamline;

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useSovereignV7() {
  const { useState, useEffect, useCallback, useMemo } = require('react');

  const [isRitualActive, setIsRitualActive] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [geoLock, setGeoLock] = useState('UNKNOWN');
  const [ledger, setLedger] = useState([]);
  const [vectorState, setVectorState] = useState(null);

  useEffect(() => {
    SovereignStreamline.init();
    setLedger(SovereignStreamline.getLedger());

    const unsubs = [
      SovereignStreamline.on('ceremony-start', () => setIsRitualActive(true)),
      SovereignStreamline.on('ceremony-progress', setProgress),
      SovereignStreamline.on('ceremony-complete', (r) => { setResult(r); setIsRitualActive(false); }),
      SovereignStreamline.on('geolock', (g) => setGeoLock(g.status)),
      SovereignStreamline.on('ledger-update', () => setLedger(SovereignStreamline.getLedger()))
    ];

    // Animation loop for vector state
    let frameId;
    const updateVector = () => {
      setVectorState(SovereignStreamline.calculateVectorState());
      frameId = requestAnimationFrame(updateVector);
    };
    updateVector();

    return () => {
      unsubs.forEach(u => u());
      cancelAnimationFrame(frameId);
    };
  }, []);

  const startCeremony = useCallback((intention, options) =>
    SovereignStreamline.startCeremony(intention, options), []);

  const dispatch = useCallback((pointId, action, payload) =>
    SovereignStreamline.dispatch(pointId, action, payload), []);

  const checkGeoLock = useCallback(() =>
    SovereignStreamline.checkGeoLock(), []);

  return useMemo(() => ({
    isRitualActive,
    progress,
    result,
    geoLock,
    ledger,
    vectorState,
    touchPoints: SovereignStreamline.generateTouchPoints(),
    startCeremony,
    dispatch,
    checkGeoLock,
    startBinaural: () => SovereignStreamline.startBinaural(),
    stopBinaural: () => SovereignStreamline.stopBinaural(),
    streamline: SovereignStreamline
  }), [isRitualActive, progress, result, geoLock, ledger, vectorState, startCeremony, dispatch, checkGeoLock]);
}
