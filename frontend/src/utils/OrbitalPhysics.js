/**
 * ENLIGHTEN.MINT.CAFE - V9999.5 ORBITAL HUB PHYSICS
 * PURPOSE: Zero-Scale Parentage | Strict Mathematical Constraints
 * LOGIC: Core (1.0) -> Bloom (2.5x @ 0.3) -> Breakaway (3.0x @ 1.0)
 * 
 * This ensures the 9×9 Helix maintains its geometric center regardless
 * of how much you "dial up" the Creator Control Mixer.
 */

// Trust Equity Constant
const TRUST_EQUITY = 49018.24;

// Zero-Scale Parentage Constraints
const OrbitalConstraints = {
  CORE: {
    scale: 1.0,
    multiplier: 1.0,
    radius: 1.0,       // Base radius multiplier
    opacity: 1.0,      // Full visibility
    position: { x: 0, y: 0, z: 0 },  // Center of the void
  },
  BLOOM: {
    triggerScale: 0.3,
    multiplier: 2.5,
    radius: 2.5,       // 2.5x radius when blooming
    opacity: 0.7,      // Slightly transparent during bloom
  },
  BREAKAWAY: {
    triggerScale: 1.0,
    multiplier: 3.0,
    radius: 3.0,       // 3.0x radius when breaking away
    opacity: 1.0,      // Full opacity on breakaway
  },
  LATENT: {
    scale: 0,
    opacity: 0,
    position: { x: 0, y: 0, z: 0 },  // Zeroed inside Core
  }
};

const OrbitalPhysics = {
  constraints: OrbitalConstraints,
  
  /**
   * Calculate the current orbital state based on scale input
   * @param {number} currentScale - Current scale value (0 to 1+)
   * @returns {object} Orbital state with equity pulse and phase
   */
  calculateOrbitalState(currentScale) {
    let activeMultiplier = this.constraints.CORE.multiplier;
    let phase = 'LATENT';
    let radiusMultiplier = this.constraints.CORE.radius;
    let opacity = this.constraints.LATENT.opacity;
    
    if (currentScale >= this.constraints.BREAKAWAY.triggerScale) {
      // BREAKAWAY PHASE: Full extraction, independent orbit
      activeMultiplier = this.constraints.BREAKAWAY.multiplier;
      phase = 'BREAKAWAY-ACTIVE';
      radiusMultiplier = this.constraints.BREAKAWAY.radius;
      opacity = this.constraints.BREAKAWAY.opacity;
    } else if (currentScale >= this.constraints.BLOOM.triggerScale) {
      // BLOOM PHASE: Expanding from Core, still tethered
      activeMultiplier = this.constraints.BLOOM.multiplier;
      phase = 'BLOOM-PHASE';
      radiusMultiplier = this.constraints.BLOOM.radius;
      opacity = this.constraints.BLOOM.opacity;
    } else if (currentScale > 0) {
      // EMERGING: Transitioning from latent to bloom
      phase = 'EMERGING';
      opacity = currentScale / this.constraints.BLOOM.triggerScale;
    }
    
    return {
      scale: currentScale,
      phase,
      radiusMultiplier,
      opacity,
      equityPulse: activeMultiplier * TRUST_EQUITY,
      formula: `${activeMultiplier} × $${TRUST_EQUITY.toLocaleString()}`,
      constraint: this.getActiveConstraint(phase),
    };
  },
  
  /**
   * Get the active constraint definition for the current phase
   */
  getActiveConstraint(phase) {
    switch (phase) {
      case 'BREAKAWAY-ACTIVE':
        return this.constraints.BREAKAWAY;
      case 'BLOOM-PHASE':
        return this.constraints.BLOOM;
      case 'EMERGING':
      case 'LATENT':
      default:
        return this.constraints.LATENT;
    }
  },
  
  /**
   * Calculate lerp position for sub-orb returning to Core
   * Used when another orb breaks away and others must lerp back to (0,0,0)
   * @param {object} currentPos - Current {x, y, z}
   * @param {number} alpha - Lerp factor (0-1)
   * @returns {object} New position lerped toward origin
   */
  lerpToOrigin(currentPos, alpha = 0.1) {
    return {
      x: currentPos.x * (1 - alpha),
      y: currentPos.y * (1 - alpha),
      z: currentPos.z * (1 - alpha),
    };
  },
  
  /**
   * Calculate bloom deployment position
   * Sub-orbs deploy radially at 2.5x Core radius
   * @param {number} index - Orb index
   * @param {number} totalOrbs - Total number of sub-orbs
   * @param {number} coreRadius - Base Core radius
   * @returns {object} Deployment position {x, y, z}
   */
  calculateBloomPosition(index, totalOrbs, coreRadius = 50) {
    const angle = (2 * Math.PI * index) / totalOrbs;
    const deployRadius = coreRadius * this.constraints.BLOOM.radius;
    
    return {
      x: Math.cos(angle) * deployRadius,
      y: Math.sin(angle) * deployRadius,
      z: 0,
    };
  },
  
  /**
   * Calculate breakaway position (beyond 3.0x radius)
   * @param {number} index - Orb index
   * @param {number} totalOrbs - Total number of sub-orbs
   * @param {number} coreRadius - Base Core radius
   * @returns {object} Breakaway position {x, y, z}
   */
  calculateBreakawayPosition(index, totalOrbs, coreRadius = 50) {
    const angle = (2 * Math.PI * index) / totalOrbs;
    const breakRadius = coreRadius * this.constraints.BREAKAWAY.radius;
    
    return {
      x: Math.cos(angle) * breakRadius,
      y: Math.sin(angle) * breakRadius,
      z: 0,
    };
  },
  
  /**
   * Check if a position is beyond the breakaway threshold
   * @param {object} position - {x, y, z}
   * @param {number} coreRadius - Base Core radius
   * @returns {boolean}
   */
  isBreakawayDistance(position, coreRadius = 50) {
    const distance = Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
    const breakawayThreshold = coreRadius * this.constraints.BREAKAWAY.radius;
    return distance > breakawayThreshold;
  },
  
  /**
   * Initialize the physics engine
   */
  init() {
    console.log('Ω ORBITAL PHYSICS V9999.5 INITIALIZED');
    console.log('  └─ Core Scale: 1.0');
    console.log('  └─ Bloom Trigger: 0.3 → 2.5x radius');
    console.log('  └─ Breakaway Trigger: 1.0 → 3.0x radius');
    console.log('  └─ Trust Equity: $' + TRUST_EQUITY.toLocaleString());
    
    if (typeof window !== 'undefined') {
      window.ORBITAL_PHYSICS = this;
    }
    
    return this;
  }
};

export default OrbitalPhysics;
export { OrbitalConstraints, TRUST_EQUITY };
