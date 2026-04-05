/**
 * FRONT-END: SovereignRefractor.js
 * Infrastructure: Crystalline Skeleton + Quadruple Helix Vortex
 * Calibration: Rapid City / Black Hills [44.08, -103.23]
 * 
 * Uses SovereignEngine for skeleton rendering
 */

import SovereignV9 from './SovereignV9';
import SovereignEngine from './SovereignEngine';

const SovereignRefractor = {
  // Mouse state
  mouseX: 0,
  mouseY: 0,

  // Initialize mouse tracking
  initMouseTracking() {
    if (typeof window !== 'undefined' && !this._mouseInitialized) {
      window.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX - window.innerWidth / 2;
        this.mouseY = e.clientY - window.innerHeight / 2;
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
  // 2. CRYSTALLINE SKELETON (Delegates to SovereignEngine)
  // ═══════════════════════════════════════════════════════════════════════════
  
  renderSkeleton() {
    this.initMouseTracking();
    return SovereignEngine.renderSkeleton(this.mouseX, this.mouseY);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. INFINITE LIGHT VORTEX (Z-Linked Opacity)
  // ═══════════════════════════════════════════════════════════════════════════
  
  calculateVortex(strands, skeleton = null) {
    const nodes = skeleton || this.renderSkeleton();
    
    return strands.map((s, i) => {
      const hue = (s.factor * 100) % 360;
      const node = nodes[i % nodes.length];
      // Use node's computed opacity (Z-based from engine)
      return `hsla(${hue}, 100%, 60%, ${node?.opacity?.toFixed(2) || 0.8})`;
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. THE CEREMONY DISPATCH
  // ═══════════════════════════════════════════════════════════════════════════
  
  async startCeremony(intention) {
    // A. Start 7.83Hz Schumann Resonance
    SovereignV9.init();
    SovereignV9.startBinaural();

    // B. Generate the Helix Strands
    const strands = this.generateStrands(intention);
    
    // C. Get skeleton with solar + resonance factors
    const skeleton = this.renderSkeleton();
    
    // D. Execute 54-Layer L² Fractal Compute
    const solarOffset = SovereignEngine.getSolarOffset();
    const fractalHash = await SovereignV9.generateHash(
      intention + solarOffset + Date.now()
    );

    // E. Return payload for back-end Key Script
    return {
      hash: fractalHash,
      timestamp: Date.now(),
      strands: strands,
      solarOffset: solarOffset,
      location: "BLACK_HILLS_STABLE",
      skeleton: {
        cycle: skeleton.filter(n => !n.isSovereign),
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
