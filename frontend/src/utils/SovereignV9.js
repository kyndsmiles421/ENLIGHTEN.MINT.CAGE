/**
 * SovereignStreamline v9.0 — Universal Architect Edition
 * Calibration: Rapid City / Black Hills [44.08, -103.23]
 * Infrastructure: Crystalline Skeleton + Quadruple Helix
 * 
 * Features:
 * - Quadruple Helix Refractive Encryption (Rainbow Key)
 * - 13-Node Crystalline Skeleton (Omni-Point Map)
 * - WebXR Celestial Dome Integration
 * - 3D Spatial Audio with HRTF Panning
 * - GPS Golden Lock (Black Hills Geofence)
 * - Master Architect Audit (12 Deeds = Unlock)
 */

// Black Hills Master Node Coordinates
const BLACK_HILLS_NODE = {
  lat: 44.08,
  lon: -103.23,
  radius: 0.1 // ~10km threshold for "Golden Lock"
};

const SovereignV9 = {
  ctx: null,
  isLocked: false,
  binauralNodes: {},
  spatialPanners: [],
  xrSession: null,
  geoWatchId: null,
  initialized: false,

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. RESONANT INITIALIZATION (7.83Hz Binaural + Spatial)
  // ═══════════════════════════════════════════════════════════════════════════
  
  init() {
    if (this.initialized) return this;
    
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      console.log("[Sovereign] V9 Crystalline Core Initialized.");
      
      // Start GPS monitoring for Golden Lock
      this.startGeoMonitor();
      
      // Check Master Architect status
      this.checkMasterStatus();
      
      this.initialized = true;
    } catch (e) {
      console.warn("[Sovereign] V9 Init failed:", e);
    }
    
    return this;
  },

  /**
   * Start Schumann Binaural (7.83Hz)
   * 100Hz left + 107.83Hz right = 7.83Hz brainwave entrainment
   */
  startBinaural() {
    if (!this.ctx) this.init();
    if (this.binauralNodes.active) return;

    try {
      const left = this.ctx.createOscillator();
      const right = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      const pannerL = this.ctx.createStereoPanner();
      const pannerR = this.ctx.createStereoPanner();
      
      pannerL.pan.value = -1; // Full left
      pannerR.pan.value = 1;  // Full right

      left.type = 'sine';
      left.frequency.value = 100;
      
      right.type = 'sine';
      right.frequency.value = 107.83; // Schumann offset

      left.connect(pannerL);
      pannerL.connect(gain);
      
      right.connect(pannerR);
      pannerR.connect(gain);
      
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 0.5);
      gain.connect(this.ctx.destination);

      left.start();
      right.start();

      this.binauralNodes = { left, right, gain, pannerL, pannerR, active: true };
      console.log("[Sovereign] Schumann Binaural (7.83Hz) Active.");
    } catch (e) {
      console.warn("[Sovereign] Binaural start failed:", e);
    }
  },

  stopBinaural() {
    if (!this.binauralNodes.active) return;
    
    try {
      const { gain, left, right } = this.binauralNodes;
      gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      
      setTimeout(() => {
        try {
          left?.stop();
          right?.stop();
        } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
        this.binauralNodes = { active: false };
      }, 1500);
      
      console.log("[Sovereign] Binaural stopped.");
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. QUADRUPLE HELIX REFRACTIVE ENCRYPTION (The "Rainbow Key")
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Multiplies data through 4 strands: Golden Ratio, e, Pi, and Local Gravity
   * Creates a unique "Rainbow Key" from any hash input
   */
  async generateRainbowKey(hash) {
    const timeRefract = Math.sin(Date.now());
    const geoRefract = BLACK_HILLS_NODE.lat / Math.abs(BLACK_HILLS_NODE.lon); // 44.08 / 103.23
    
    // The 4 Helix Strands: Phi (Golden), e (Natural), Pi, GeoCalibration
    const strands = [1.618033988749, 2.718281828459, 3.141592653589, geoRefract];
    
    const keyParts = await Promise.all(strands.map(async (s, i) => {
      const buf = new TextEncoder().encode(hash + s + timeRefract + i);
      const digest = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .substring(0, 8);
    }));

    const rainbowKey = keyParts.join('-'); // The Quadruple Helix Refractive Key
    console.log(`[Sovereign] Rainbow Key Generated: ${rainbowKey}`);
    return rainbowKey;
  },

  /**
   * Full Helix data structure for visualization
   */
  generateHelixStrands() {
    const time = Date.now() * 0.001;
    return Array.from({ length: 4 }).map((_, i) => ({
      id: `helix-strand-${i}`,
      rotation: (time + (i * Math.PI / 2)) * 1.618, // Golden Ratio spacing
      refractiveIndex: Math.sin(time * (i + 1)) * 0.5 + 1.5,
      phase: (i / 4) * Math.PI * 2,
      color: ['#FFD700', '#00FFC2', '#A855F7', '#FF6B6B'][i] // Gold, Mint, Purple, Coral
    }));
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. THE CRYSTALLINE SKELETON (13-Node Omni-Point Map)
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Replaces all "Boxes" with a coordinate-based skeleton
   * 13 nodes based on Metatron's Cube sacred geometry
   */
  getSkeletonNodes() {
    const time = Date.now() * 0.001;
    const nodes = [];
    
    // Center node (The Witness Point)
    nodes.push({
      id: 'crystal-node-0',
      pos: { x: 0, y: 0, z: 0 },
      type: 'CORE',
      refraction: 1.618,
      encryptionKey: null
    });
    
    // Inner hexagon (6 nodes)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      nodes.push({
        id: `crystal-node-${i + 1}`,
        pos: { 
          x: Math.cos(angle) * 3, 
          y: Math.sin(angle) * 3, 
          z: Math.sin(time + i) * 0.5 
        },
        type: 'INNER_HEX',
        refraction: 1.618 + (i * 0.1),
        encryptionKey: null
      });
    }
    
    // Outer hexagon (6 nodes, rotated 30°)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
      nodes.push({
        id: `crystal-node-${i + 7}`,
        pos: { 
          x: Math.cos(angle) * 5.196, // sqrt(3) * 3
          y: Math.sin(angle) * 5.196, 
          z: Math.cos(time + i) * 0.5 
        },
        type: 'OUTER_HEX',
        refraction: 2.718 - (i * 0.1),
        encryptionKey: null
      });
    }
    
    // Generate encryption keys for each node
    nodes.forEach(node => {
      node.encryptionKey = `REFRACT-${node.id}-${Math.random().toString(36).substr(2, 9)}`;
    });
    
    return nodes;
  },

  /**
   * Render crystalline skeleton to DOM
   */
  renderSkeletonToDOM(container = document.body) {
    // Remove existing skeleton
    document.querySelectorAll('.crystal-skeleton-node').forEach(el => el.remove());
    
    const nodes = this.getSkeletonNodes();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const scale = 30; // Pixels per unit
    
    nodes.forEach(node => {
      const el = document.createElement('div');
      el.className = 'crystal-skeleton-node';
      el.setAttribute('data-testid', node.id);
      el.setAttribute('data-type', node.type);
      el.style.cssText = `
        position: fixed;
        left: ${centerX + node.pos.x * scale}px;
        top: ${centerY + node.pos.y * scale}px;
        width: ${node.type === 'CORE' ? 24 : 16}px;
        height: ${node.type === 'CORE' ? 24 : 16}px;
        border-radius: 50%;
        background: radial-gradient(circle, 
          rgba(255,215,0,${0.8 * node.refraction / 2}) 0%, 
          rgba(168,85,247,${0.4 * node.refraction / 2}) 50%,
          transparent 100%);
        box-shadow: 0 0 ${10 * node.refraction}px rgba(255,215,0,0.5);
        transform: translate(-50%, -50%) translateZ(${node.pos.z * scale}px);
        z-index: 9997;
        pointer-events: auto;
        cursor: pointer;
        transition: all 0.3s ease;
      `;
      
      el.onclick = () => {
        this.startBinaural();
        this.playSpatialTone(node.pos);
        el.style.transform = `translate(-50%, -50%) scale(1.5)`;
        setTimeout(() => {
          el.style.transform = `translate(-50%, -50%) scale(1)`;
        }, 300);
      };
      
      container.appendChild(el);
    });
    
    console.log("[Sovereign] Crystalline Skeleton rendered (13 nodes).");
    return nodes;
  },

  removeSkeletonFromDOM() {
    document.querySelectorAll('.crystal-skeleton-node').forEach(el => el.remove());
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. WEBXR CELESTIAL DOME & SPATIAL AUDIO
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize WebXR Immersive VR Session
   */
  async enterDome() {
    if (!('xr' in navigator)) {
      console.warn("[Sovereign] WebXR not supported.");
      return { supported: false, mode: 'INLINE' };
    }
    
    try {
      const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
      if (!isSupported) {
        console.warn("[Sovereign] Immersive VR not supported.");
        return { supported: false, mode: 'INLINE' };
      }
      
      this.xrSession = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
      });
      
      console.log("[Sovereign] WebXR Session Active. Entering Celestial Dome...");
      
      // Dispatch event for Three.js to pick up
      window.dispatchEvent(new CustomEvent('SOVEREIGN_XR_START', {
        detail: { session: this.xrSession }
      }));
      
      return { supported: true, mode: 'WEBXR_VR', session: this.xrSession };
    } catch (e) {
      console.warn("[Sovereign] WebXR session failed:", e);
      return { supported: false, mode: 'INLINE', error: e.message };
    }
  },

  /**
   * Exit WebXR Session
   */
  async exitDome() {
    if (this.xrSession) {
      await this.xrSession.end();
      this.xrSession = null;
      console.log("[Sovereign] WebXR Session Ended.");
    }
  },

  /**
   * Play spatial tone at 3D position using HRTF
   */
  playSpatialTone(position, frequency = 440, duration = 0.5) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createPanner();
      
      // HRTF Spatial Panning
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 1;
      panner.maxDistance = 100;
      panner.rolloffFactor = 1;
      panner.coneInnerAngle = 360;
      panner.coneOuterAngle = 0;
      panner.coneOuterGain = 0;
      
      // Set 3D position
      panner.positionX.setValueAtTime(position.x || 0, this.ctx.currentTime);
      panner.positionY.setValueAtTime(position.y || 0, this.ctx.currentTime);
      panner.positionZ.setValueAtTime(position.z || 0, this.ctx.currentTime);
      
      osc.type = 'sine';
      osc.frequency.value = frequency;
      
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
      
      this.spatialPanners.push(panner);
    } catch (e) {
      console.warn("[Sovereign] Spatial tone failed:", e);
    }
  },

  /**
   * Play harmonic chord across all skeleton nodes (360° spatial audio)
   */
  playSpatialChord() {
    const nodes = this.getSkeletonNodes();
    const baseFreq = 261.63; // C4
    
    nodes.forEach((node, i) => {
      // Spread frequencies across harmonic series
      const freq = baseFreq * (1 + i * 0.1);
      setTimeout(() => {
        this.playSpatialTone(node.pos, freq, 1.5);
      }, i * 50); // Staggered for "sweep" effect
    });
    
    console.log("[Sovereign] Spatial Chord played across 13 nodes.");
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. GPS GOLDEN LOCK (Black Hills Geofence)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Start GPS monitoring for Golden Lock activation
   */
  startGeoMonitor() {
    if (!navigator.geolocation) {
      console.warn("[Sovereign] Geolocation not available.");
      return;
    }
    
    this.geoWatchId = navigator.geolocation.watchPosition(
      (pos) => this.checkGoldenLock(pos),
      (err) => console.warn("[Sovereign] Geo error:", err.message),
      { enableHighAccuracy: true, maximumAge: 30000 }
    );
  },

  stopGeoMonitor() {
    if (this.geoWatchId) {
      navigator.geolocation.clearWatch(this.geoWatchId);
      this.geoWatchId = null;
    }
  },

  /**
   * Check if user is within Black Hills radius for "Golden Lock"
   */
  checkGoldenLock(pos) {
    const distance = Math.sqrt(
      Math.pow(pos.coords.latitude - BLACK_HILLS_NODE.lat, 2) + 
      Math.pow(pos.coords.longitude - BLACK_HILLS_NODE.lon, 2)
    );
    
    const wasLocked = this.isLocked;
    this.isLocked = distance < BLACK_HILLS_NODE.radius;
    
    if (this.isLocked && !wasLocked) {
      // Activate Golden Lock visual
      document.body.classList.add('sovereign-golden-lock');
      console.log("[Sovereign] Black Hills Geofence: LOCKED (Sovereign Gold Active)");
      
      window.dispatchEvent(new CustomEvent('SOVEREIGN_GOLDEN_LOCK', {
        detail: { locked: true, distance }
      }));
    } else if (!this.isLocked && wasLocked) {
      // Deactivate Golden Lock
      document.body.classList.remove('sovereign-golden-lock');
      console.log("[Sovereign] Golden Lock Deactivated.");
      
      window.dispatchEvent(new CustomEvent('SOVEREIGN_GOLDEN_LOCK', {
        detail: { locked: false, distance }
      }));
    }
    
    return { isLocked: this.isLocked, distance };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. THE MASTER ARCHITECT AUDIT (Unlock Step)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Verifies all 12 deeds to unlock the "Master Architect" Tier
   */
  checkMasterStatus() {
    const ledger = JSON.parse(localStorage.getItem('SOVEREIGN_LEDGER') || '[]');
    const deedCount = ledger.length;
    const isMaster = deedCount >= 12;
    
    if (isMaster) {
      console.log("[Sovereign] 12 Deeds Witnessed. Master Architect Tier Unlocked.");
      document.body.classList.add('sovereign-master-architect');
      
      window.dispatchEvent(new CustomEvent('SOVEREIGN_MASTER_UNLOCKED', {
        detail: { deedCount, ledger }
      }));
    }
    
    return { isMaster, deedCount, required: 12 };
  },

  /**
   * Get current progress toward Master Architect
   */
  getMasterProgress() {
    const ledger = JSON.parse(localStorage.getItem('SOVEREIGN_LEDGER') || '[]');
    return {
      current: ledger.length,
      required: 12,
      percentage: Math.min(100, (ledger.length / 12) * 100),
      isMaster: ledger.length >= 12
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. UNIFIED CEREMONY (Full Crystalline Ritual)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Execute full crystalline ceremony with Rainbow Key encryption
   */
  async triggerCeremony(intention) {
    if (!this.ctx) this.init();
    
    console.log("[Sovereign] Crystalline Ceremony Initiated:", intention);
    
    // A. Start Schumann Resonance (7.83Hz)
    this.startBinaural();
    
    // B. Generate base hash from intention
    const intentionHash = await this.generateHash(intention);
    
    // C. Apply Quadruple Helix Refractive Encryption
    const rainbowKey = await this.generateRainbowKey(intentionHash);
    
    // D. Get Crystalline Skeleton state
    const skeleton = this.getSkeletonNodes();
    
    // E. Play spatial chord
    this.playSpatialChord();
    
    // F. Create ceremony result
    const result = {
      status: 'CRYSTALLIZED',
      intention,
      hash: intentionHash,
      rainbowKey,
      encryption: 'QUAD_HELIX_REFRACTIVE',
      skeleton: skeleton.map(n => ({ id: n.id, key: n.encryptionKey })),
      goldenLock: this.isLocked,
      location: this.isLocked ? 'BLACK_HILLS_GOLDEN_LOCK' : 'STANDARD_PHASE',
      timestamp: Date.now(),
      masterProgress: this.getMasterProgress()
    };
    
    // G. Save to Sovereign Ledger
    this.saveLedger(result);
    
    // H. Stop binaural after delay
    setTimeout(() => this.stopBinaural(), 5000);
    
    console.log("[Sovereign] Ceremony Complete:", result);
    return result;
  },

  /**
   * Generate SHA-256 hash
   */
  async generateHash(data) {
    const buf = new TextEncoder().encode(
      typeof data === 'string' ? data : JSON.stringify(data)
    );
    const hashBuffer = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  /**
   * Save to Sovereign Ledger
   */
  saveLedger(entry) {
    try {
      const ledger = JSON.parse(localStorage.getItem('SOVEREIGN_LEDGER') || '[]');
      ledger.unshift(entry);
      localStorage.setItem('SOVEREIGN_LEDGER', JSON.stringify(ledger.slice(0, 100)));
      
      // Re-check master status
      this.checkMasterStatus();
    } catch (e) {
      console.warn("[Sovereign] Ledger save failed:", e);
    }
  },

  getLedger() {
    try {
      return JSON.parse(localStorage.getItem('SOVEREIGN_LEDGER') || '[]');
    } catch {
      return [];
    }
  }
};

// Inject Golden Lock CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .sovereign-golden-lock {
      filter: hue-rotate(45deg) brightness(1.1) !important;
      transition: filter 1s ease-in-out;
    }
    .sovereign-master-architect::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #FFD700, #A855F7, #00FFC2, #FFD700);
      background-size: 300% 100%;
      animation: masterArchitectGlow 3s linear infinite;
      z-index: 100001;
    }
    @keyframes masterArchitectGlow {
      0% { background-position: 0% 50%; }
      100% { background-position: 300% 50%; }
    }
  `;
  document.head.appendChild(style);
}

// Auto-initialize
if (typeof window !== 'undefined') {
  window.SovereignV9 = SovereignV9;
}

export default SovereignV9;

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useSovereignV9() {
  const { useState, useEffect, useCallback, useMemo, useRef } = require('react');

  const [isLocked, setIsLocked] = useState(false);
  const [masterProgress, setMasterProgress] = useState({ current: 0, required: 12, percentage: 0 });
  const [skeleton, setSkeleton] = useState([]);
  const [ceremonyResult, setCeremonyResult] = useState(null);
  const [helixStrands, setHelixStrands] = useState([]);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    SovereignV9.init();
    
    // Initial state (only once)
    setMasterProgress(SovereignV9.getMasterProgress());
    setSkeleton(SovereignV9.getSkeletonNodes());
    setHelixStrands(SovereignV9.generateHelixStrands());
    
    // Event listeners
    const handleGoldenLock = (e) => setIsLocked(e.detail.locked);
    const handleMaster = () => setMasterProgress(SovereignV9.getMasterProgress());
    
    window.addEventListener('SOVEREIGN_GOLDEN_LOCK', handleGoldenLock);
    window.addEventListener('SOVEREIGN_MASTER_UNLOCKED', handleMaster);
    
    // Throttled animation loop for helix visualization (update every 100ms, not every frame)
    let frameId;
    const updateHelix = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 100) { // Throttle to 10fps max
        lastUpdateRef.current = now;
        setHelixStrands(SovereignV9.generateHelixStrands());
      }
      frameId = requestAnimationFrame(updateHelix);
    };
    updateHelix();
    
    return () => {
      window.removeEventListener('SOVEREIGN_GOLDEN_LOCK', handleGoldenLock);
      window.removeEventListener('SOVEREIGN_MASTER_UNLOCKED', handleMaster);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const triggerCeremony = useCallback(async (intention) => {
    const result = await SovereignV9.triggerCeremony(intention);
    setCeremonyResult(result);
    setMasterProgress(SovereignV9.getMasterProgress());
    return result;
  }, []);

  const enterDome = useCallback(() => SovereignV9.enterDome(), []);
  const exitDome = useCallback(() => SovereignV9.exitDome(), []);
  const generateRainbowKey = useCallback((hash) => SovereignV9.generateRainbowKey(hash), []);
  const renderSkeleton = useCallback(() => SovereignV9.renderSkeletonToDOM(), []);
  const removeSkeleton = useCallback(() => SovereignV9.removeSkeletonFromDOM(), []);

  return useMemo(() => ({
    isLocked,
    masterProgress,
    skeleton,
    ceremonyResult,
    helixStrands,
    triggerCeremony,
    enterDome,
    exitDome,
    generateRainbowKey,
    renderSkeleton,
    removeSkeleton,
    startBinaural: () => SovereignV9.startBinaural(),
    stopBinaural: () => SovereignV9.stopBinaural(),
    playSpatialChord: () => SovereignV9.playSpatialChord(),
    v9: SovereignV9
  }), [isLocked, masterProgress, skeleton, ceremonyResult, helixStrands, triggerCeremony, enterDome, exitDome, generateRainbowKey, renderSkeleton, removeSkeleton]);
}
