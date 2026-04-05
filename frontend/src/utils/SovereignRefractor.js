/**
 * FRONT-END: SovereignRefractor.js
 * Infrastructure: Crystalline Skeleton + Quadruple Helix Vortex
 * Calibration: Rapid City / Black Hills [44.08, -103.23]
 * 
 * ARCHITECTURE:
 * - Nodes 0-11: Fractal Cycle (Orbital/Zodiac)
 * - Node 12: Sovereign Point (Central Source — Rainbow Key Display)
 * - Solar Temporal Variance for encryption salt
 * - Resonance-based Vibrational Scaling (mouse observation)
 */

import SovereignV9 from './SovereignV9';

const SovereignRefractor = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CALIBRATION CONSTANTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  CALIBRATION: {
    lat: 44.08,
    lon: -103.23,
    secret: 'BLACK_HILLS_SOVEREIGN_NODE'
  },

  // Mouse tracking state
  mouseX: 0,
  mouseY: 0,

  // Initialize mouse tracking
  initMouseTracking() {
    if (typeof window !== 'undefined' && !this._mouseInitialized) {
      window.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      });
      this._mouseInitialized = true;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. QUADRUPLE HELIX DATA MULTIPLICATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  generateStrands: (intention) => {
    const time = Date.now();
    return [
      { id: 'phi-strand', factor: 1.618, data: `${intention}:${time}:0` },
      { id: 'e-strand',   factor: 2.718, data: `${intention}:${time}:1` },
      { id: 'pi-strand',  factor: 3.141, data: `${intention}:${time}:2` },
      { id: 'geo-strand', factor: 0.4408, data: `${intention}:${time}:3` }
    ];
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. BLACK HILLS SOLAR OFFSET (Temporal Variance)
  // ═══════════════════════════════════════════════════════════════════════════
  
  getSolarOffset() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    // Solar variance approximation for 44.08°N latitude
    return Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
  },

  generateSalt() {
    const solarFactor = this.getSolarOffset().toFixed(4);
    return `${this.CALIBRATION.lat}:${this.CALIBRATION.lon}:${solarFactor}:${this.CALIBRATION.secret}`;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. THE CRYSTALLINE SKELETON (12 Orbital + 1 Central Source)
  // ═══════════════════════════════════════════════════════════════════════════
  
  renderSkeleton() {
    this.initMouseTracking();
    const time = Date.now();
    const nodes = [];
    
    // Nodes 0-11: Fractal Cycle (Orbital/Zodiac Ring)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const baseNode = {
        nodeId: i,
        type: 'ORBITAL',
        x: Math.cos(angle) * 10,
        y: Math.sin(angle) * 10,
        z: Math.sin(time * 0.001 + i) * 2,
        isMatrixAnchor: i === 7, // 71% Matrix bar tethers here
        zodiacSign: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                     'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][i]
      };
      
      // Resonance-based scaling (mouse observation)
      const distance = Math.hypot(this.mouseX - (window.innerWidth/2 + baseNode.x * 20), 
                                   this.mouseY - (window.innerHeight/2 + baseNode.y * 20));
      const resonance = Math.max(0, 1 - distance / 500);
      
      nodes.push({
        ...baseNode,
        vibration: Math.sin(time * 0.002) * resonance,
        scale: 1 + (resonance * 0.5), // Nodes grow when "observed"
        resonance
      });
    }
    
    // Node 12: Sovereign Point (Central Source — Rainbow Key Display)
    const sovereignResonance = Math.max(0, 1 - Math.hypot(
      this.mouseX - window.innerWidth/2, 
      this.mouseY - window.innerHeight/2
    ) / 300);
    
    nodes.push({
      nodeId: 12,
      type: 'SOVEREIGN',
      x: 0,
      y: 0,
      z: Math.sin(time * 0.0005) * 3, // Slower, deeper breath
      isMatrixAnchor: false,
      isSovereignPoint: true,
      vibration: Math.sin(time * 0.001) * sovereignResonance,
      scale: 1.5 + (sovereignResonance * 0.8), // Larger base, more responsive
      resonance: sovereignResonance,
      displayKey: true // This node displays the Rainbow Key
    });
    
    return nodes;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. INFINITE LIGHT VORTEX (Z-Linked Opacity)
  // ═══════════════════════════════════════════════════════════════════════════
  
  calculateVortex(strands, skeleton = null) {
    const nodes = skeleton || this.renderSkeleton();
    
    return strands.map((s, i) => {
      const hue = (s.factor * 100) % 360;
      // Map Z coordinate (-2 to +2) to opacity (0.3 to 1.0)
      const zValue = nodes[i % nodes.length]?.z || 0;
      const opacity = 0.3 + ((zValue + 2) / 4) * 0.7;
      return `hsla(${hue}, 100%, 60%, ${opacity.toFixed(2)})`;
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. THE CEREMONY DISPATCH (Bi-directional Harmonic Handshake)
  // ═══════════════════════════════════════════════════════════════════════════
  
  async startCeremony(intention) {
    // A. Start 7.83Hz Schumann Resonance
    SovereignV9.init();
    SovereignV9.startBinaural();

    // B. Generate the Helix Strands
    const strands = this.generateStrands(intention);
    
    // C. Generate Solar-Enhanced Salt
    const salt = this.generateSalt();
    
    // D. Execute 54-Layer L² Fractal Compute with salt
    const fractalHash = await SovereignV9.generateHash(intention + salt + Date.now());

    // E. Get Skeleton with Resonance State
    const skeleton = this.renderSkeleton();
    const sovereignNode = skeleton.find(n => n.isSovereignPoint);

    // F. Return the "Payload" for Bi-directional Handshake
    return {
      hash: fractalHash,
      timestamp: Date.now(),
      strands: strands,
      salt: salt,
      solarOffset: this.getSolarOffset(),
      location: "BLACK_HILLS_STABLE",
      skeleton: {
        orbital: skeleton.filter(n => n.type === 'ORBITAL'),
        sovereign: sovereignNode
      },
      handshake: {
        direction: 'OUTBOUND',
        expectsResponse: true,
        responseTarget: 'SOVEREIGN_NODE_12'
      }
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. RECEIVE RAINBOW KEY (Inbound Harmonic Handshake)
  // ═══════════════════════════════════════════════════════════════════════════
  
  receiveRainbowKey(rainbowKey) {
    console.log('[Refractor] Inbound handshake — Rainbow Key received:', rainbowKey);
    
    // Dispatch to Sovereign Node (Node 12) for display
    window.dispatchEvent(new CustomEvent('SOVEREIGN_RAINBOW_KEY', {
      detail: {
        key: rainbowKey,
        targetNode: 12,
        direction: 'INBOUND',
        timestamp: Date.now()
      }
    }));
    
    return {
      acknowledged: true,
      displayNode: 12,
      key: rainbowKey
    };
  }
};

// Initialize mouse tracking on load
if (typeof window !== 'undefined') {
  SovereignRefractor.initMouseTracking();
  window.SovereignRefractor = SovereignRefractor;
}

export default SovereignRefractor;
