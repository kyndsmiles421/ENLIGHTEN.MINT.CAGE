/**
 * @project THE_ENLIGHTENMENT_CAFE
 * @component STABILIZER_CORE_V2
 * @access PROPRIETARY
 * 
 * Physics Engine:
 * - Inverse Attraction: Pulls modules toward target coordinates
 * - Opposite Repulsion: Pushes away from 1cm buffered hexagonal edge
 * - Velocity Damping: Smooth stabilization
 */

const SovereignStabilizer = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTANTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  K_INVERSE: 0.15,        // Inverse attraction coefficient
  R_LIMIT: 47.94,         // (86.6 - 1cm) * 0.56 = 44% reduction
  F_REPULSE: 400,         // Repulsion force multiplier
  DAMPING: 0.82,          // Velocity damping factor

  // ═══════════════════════════════════════════════════════════════════════════
  // STABILIZE (Core physics tick)
  // ═══════════════════════════════════════════════════════════════════════════
  
  stabilize(module, target) {
    // Initialize velocity if not present
    if (!module.v) module.v = { x: 0, y: 0 };
    if (!module.p) module.p = { x: module.x || 0, y: module.y || 0 };

    // A. INVERSE ATTRACTION: Pull toward target coords
    module.v.x += (target.x - module.p.x) * this.K_INVERSE;
    module.v.y += (target.y - module.p.y) * this.K_INVERSE;

    // B. OPPOSITE REPULSION: Push away from 1cm buffered edge
    const d = Math.sqrt(module.p.x ** 2 + module.p.y ** 2);
    
    if (d > this.R_LIMIT) {
      const f_opp = (d - this.R_LIMIT) * this.F_REPULSE;
      module.v.x -= (module.p.x / d) * f_opp;
      module.v.y -= (module.p.y / d) * f_opp;
    }

    // C. VELOCITY DAMPING: Smooth stabilization
    module.v.x *= this.DAMPING;
    module.v.y *= this.DAMPING;

    // D. APPLY VELOCITY TO POSITION
    module.p.x += module.v.x;
    module.p.y += module.v.y;

    return module;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STABILIZE SKELETON (Apply to all 13 nodes)
  // ═══════════════════════════════════════════════════════════════════════════
  
  stabilizeSkeleton(skeleton, targets = null) {
    return skeleton.map((node, i) => {
      // SOURCE node stays at center
      if (node.isSovereign || node.id === 'SOURCE') {
        return { ...node, p: { x: 0, y: 0 }, v: { x: 0, y: 0 } };
      }

      // Use provided target or node's natural position
      const target = targets?.[i] || { x: node.x, y: node.y };
      
      return this.stabilize({ ...node, p: { x: node.x, y: node.y } }, target);
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANCHOR TO TARGET (Snap module to user-defined coords)
  // ═══════════════════════════════════════════════════════════════════════════
  
  anchorTo(module, targetX, targetY) {
    return this.stabilize(module, { x: targetX, y: targetY });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK BOUNDARY (Is module within safe zone?)
  // ═══════════════════════════════════════════════════════════════════════════
  
  isWithinBoundary(module) {
    const d = Math.sqrt((module.p?.x || module.x) ** 2 + (module.p?.y || module.y) ** 2);
    return d <= this.R_LIMIT;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GET BOUNDARY DISTANCE (How far from edge?)
  // ═══════════════════════════════════════════════════════════════════════════
  
  getBoundaryDistance(module) {
    const d = Math.sqrt((module.p?.x || module.x) ** 2 + (module.p?.y || module.y) ** 2);
    return this.R_LIMIT - d; // Positive = inside, Negative = outside
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANIMATION LOOP HELPER
  // ═══════════════════════════════════════════════════════════════════════════
  
  createStabilizationLoop(getModules, setModules, targets = null) {
    let frameId;
    
    const tick = () => {
      const modules = getModules();
      const stabilized = this.stabilizeSkeleton(modules, targets);
      setModules(stabilized);
      frameId = requestAnimationFrame(tick);
    };
    
    tick();
    
    return () => cancelAnimationFrame(frameId);
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.SovereignStabilizer = SovereignStabilizer;
}

export default SovereignStabilizer;
