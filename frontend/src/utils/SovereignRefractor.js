/**
 * SOVEREIGN REFRACTOR: INFINITY^INFINITY
 * Infrastructure: 12 Orbital + 1 Source [Vogel-Phyllotaxis]
 * Calibration: Rapid City / Black Hills [44.08, -103.23]
 * 
 * Geometry:
 * - Golden Angle: 137.508° (Vogel spiral)
 * - Hexagonal Boundary Constraint
 * - Unity Vector: -1 + 2 = 1
 */

import SovereignV9 from './SovereignV9';

// Helper: Get day of year
const dayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
};

const SovereignRefractor = {
  // Mouse state
  mouseX: 0,
  mouseY: 0,

  // ═══════════════════════════════════════════════════════════════════════════
  // THE HEXAGONAL BORDER CONSTRAINT
  // 1cm buffer around edge of system at 360°
  // ═══════════════════════════════════════════════════════════════════════════
  
  EDGE_BUFFER: 1, // 1cm around edge
  
  getHexBoundary: (angle) => {
    // Hexagonal constraint with 1cm edge buffer at 360°
    const hexFactor = 1 / (Math.cos(angle % (Math.PI / 3) - Math.PI / 6));
    const edgeBuffer = SovereignRefractor.EDGE_BUFFER;
    return hexFactor - (edgeBuffer / 100); // Subtract 1cm from max radius
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // QUADRUPLE HELIX GENERATION (Unity Vector Anchored)
  // ═══════════════════════════════════════════════════════════════════════════
  
  generateQuadHelix: (intention) => {
    const time = Date.now();
    const unityVector = -1 + 2; // The +1 Unity Anchor
    
    return [
      { id: 'phi', f: 1.618, d: `${intention}:${time}:α` },
      { id: 'e',   f: 2.718, d: `${intention}:${time}:β` },
      { id: 'pi',  f: 3.141, d: `${intention}:${time}:γ` },
      { id: 'geo', f: 44.08, d: `${intention}:${time}:δ` }
    ].map(s => ({ ...s, factor: s.f * unityVector }));
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOVEREIGN SKELETON [Vogel-Phyllotaxis Spiral]
  // Golden Angle: 137.508° — The divine proportion in plant growth
  // ═══════════════════════════════════════════════════════════════════════════
  
  renderSovereignSkeleton: (mouseX, mouseY) => {
    const solar = Math.sin((2 * Math.PI / 365) * (dayOfYear() - 81));
    const GOLDEN_ANGLE = 137.508 * (Math.PI / 180); // Radians
    
    return Array.from({ length: 13 }).map((_, i) => {
      // Node 12: SOURCE (Central Sovereign Point)
      if (i === 12) {
        return { 
          id: 'SOURCE', 
          x: 0, 
          y: 0, 
          z: 10 * solar, 
          scale: 1.5,
          isSovereign: true,
          opacity: 1.0
        };
      }

      // Nodes 0-11: Vogel Spiral with Hex Boundary
      const theta = i * GOLDEN_ANGLE;
      const r_max = 20 * SovereignRefractor.getHexBoundary(theta);
      const r = Math.sqrt(i + 1) * (r_max / 4);
      
      const baseX = Math.cos(theta) * r;
      const baseY = Math.sin(theta) * r;

      // Resonance Scaling (The Observer Effect)
      const dist = Math.hypot((mouseX || 0) - baseX, (mouseY || 0) - baseY);
      const resonance = Math.max(0, 1 - dist / 250);

      return {
        id: `NODE_${i}`,
        x: baseX,
        y: baseY,
        z: Math.sin(Date.now() * 0.001 + i) * 5,
        opacity: Math.max(0.1, (resonance + 0.2)),
        scale: 1 + (resonance * 0.5),
        resonance,
        theta,
        radius: r
      };
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MOUSE TRACKING
  // ═══════════════════════════════════════════════════════════════════════════
  
  initMouseTracking() {
    if (typeof window !== 'undefined' && !this._mouseInitialized) {
      window.addEventListener('mousemove', (e) => {
        // Convert to centered coordinates
        this.mouseX = e.clientX - window.innerWidth / 2;
        this.mouseY = e.clientY - window.innerHeight / 2;
      });
      this._mouseInitialized = true;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONVENIENCE WRAPPER
  // ═══════════════════════════════════════════════════════════════════════════
  
  renderSkeleton() {
    this.initMouseTracking();
    return this.renderSovereignSkeleton(this.mouseX, this.mouseY);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VORTEX CALCULATION (Z-linked opacity)
  // ═══════════════════════════════════════════════════════════════════════════
  
  calculateVortex(strands, skeleton = null) {
    const nodes = skeleton || this.renderSkeleton();
    
    return strands.map((s, i) => {
      const hue = (s.factor * 100) % 360;
      const node = nodes[i % nodes.length];
      return `hsla(${Math.abs(hue)}, 100%, 60%, ${node?.opacity?.toFixed(2) || 0.8})`;
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CEREMONY DISPATCH
  // ═══════════════════════════════════════════════════════════════════════════
  
  async startCeremony(intention) {
    // A. Start 7.83Hz Schumann Resonance
    SovereignV9.init();
    SovereignV9.startBinaural();

    // B. Generate Quad Helix with Unity Vector
    const strands = this.generateQuadHelix(intention);
    
    // C. Get Vogel-Phyllotaxis skeleton
    const skeleton = this.renderSkeleton();
    
    // D. Solar factor
    const solar = Math.sin((2 * Math.PI / 365) * (dayOfYear() - 81));
    
    // E. Compute fractal hash
    const fractalHash = await SovereignV9.generateHash(
      intention + solar + Date.now()
    );

    return {
      hash: fractalHash,
      timestamp: Date.now(),
      strands,
      solarOffset: solar,
      location: "BLACK_HILLS_STABLE",
      geometry: 'VOGEL_PHYLLOTAXIS',
      skeleton: {
        orbital: skeleton.filter(n => !n.isSovereign),
        sovereign: skeleton.find(n => n.isSovereign)
      }
    };
  }
};

// Initialize
if (typeof window !== 'undefined') {
  SovereignRefractor.initMouseTracking();
  window.SovereignRefractor = SovereignRefractor;
}

export default SovereignRefractor;
