/**
 * ADVANCED SOVEREIGN ENGINE
 * Location Calibration: [44.08, -103.23]
 * 
 * Core engine for:
 * - Solar Temporal Variance ("Earth Breath")
 * - 13-Node Harmonic Skeleton (12 Cycle + 1 Source)
 * - Resonance Scaling (Observer Effect)
 * - Z → Opacity (Crystalline Depth)
 */

const SovereignEngine = {
  // ═══════════════════════════════════════════════════════════════════════════
  // A. SOLAR TEMPORAL VARIANCE (The "Earth Breath")
  // ═══════════════════════════════════════════════════════════════════════════
  
  getSolarOffset: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    // Sine wave calibrated for Rapid City's latitude variance
    return Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // B. THE 13-NODE HARMONIC SKELETON
  // ═══════════════════════════════════════════════════════════════════════════
  
  renderSkeleton: (mouseX, mouseY) => {
    const solarFactor = SovereignEngine.getSolarOffset();
    
    return Array.from({ length: 13 }).map((_, i) => {
      // Node 12 is the Sovereign Source (Center)
      if (i === 12) {
        return {
          nodeId: 'SOURCE_12',
          x: 0, 
          y: 0, 
          z: Math.sin(Date.now() * 0.0005) * 5,
          scale: 1.5,
          isSovereign: true,
          opacity: 1.0,
          vibration: Math.sin(Date.now() * 0.001) * 0.1
        };
      }

      // Nodes 0-11: The Fractal Cycle (Zodiac)
      const angle = (i / 12) * Math.PI * 2;
      const radius = 10 + (solarFactor * 2); // Radius breathes with the seasons
      
      const baseX = Math.cos(angle) * radius;
      const baseY = Math.sin(angle) * radius;
      const baseZ = Math.sin(Date.now() * 0.001 + i) * 2;

      // Resonance Scaling (Observer Effect)
      const dist = Math.hypot(mouseX - baseX, mouseY - baseY);
      const resonance = Math.max(0, 1 - dist / 300);

      return {
        nodeId: `CYCLE_${i}`,
        x: baseX,
        y: baseY,
        z: baseZ,
        scale: 1 + (resonance * 0.4),
        vibration: Math.sin(Date.now() * 0.01) * resonance,
        // Z-Coordinate maps to Opacity (Crystalline Depth)
        opacity: Math.max(0.2, (baseZ + 5) / 10) 
      };
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // C. GET SOVEREIGN NODE (Quick accessor)
  // ═══════════════════════════════════════════════════════════════════════════
  
  getSovereignNode: (mouseX = 0, mouseY = 0) => {
    const skeleton = SovereignEngine.renderSkeleton(mouseX, mouseY);
    return skeleton.find(n => n.isSovereign);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // D. GET CYCLE NODES (Quick accessor)
  // ═══════════════════════════════════════════════════════════════════════════
  
  getCycleNodes: (mouseX = 0, mouseY = 0) => {
    const skeleton = SovereignEngine.renderSkeleton(mouseX, mouseY);
    return skeleton.filter(n => !n.isSovereign);
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.SovereignEngine = SovereignEngine;
}

export default SovereignEngine;
