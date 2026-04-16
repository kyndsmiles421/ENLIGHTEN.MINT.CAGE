/**
 * SacredGeometry.js — V54.9 Universal Geometric Engine
 * 
 * The mathematical law governing the ENLIGHTEN.MINT.CAFE spatial engine.
 * Fibonacci, Phi (φ), Sacred Geometry, and Vector Calculus unified.
 * 
 * Core Equation:
 *   Z^{xyz} · (φ^(x+y+z) / Z^{xyz}) - ∫₀⁹ Grid(t)dt ± Σ(n=1→81) Fib(n)
 */

// ═══ FUNDAMENTAL CONSTANTS ═══
export const PHI = 1.618033988749895;
export const PHI_INV = 1 / PHI; // 0.618...
export const PHI_SQ = PHI * PHI; // 2.618...
export const SQRT5 = Math.sqrt(5);
export const TAU = Math.PI * 2;
export const GRID_SIZE = 9;
export const TOTAL_NODES = GRID_SIZE * GRID_SIZE; // 81

// ═══ FIBONACCI SEQUENCE (first 21 values) ═══
export const FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765];

// Fibonacci Z-depth steps (9 segments using Fibonacci spacing)
// Normalized to 0-1 range: [0, 1, 1, 2, 3, 5, 8, 13, 21] → cumulative → normalized
const FIB_9_RAW = [0, 1, 1, 2, 3, 5, 8, 13, 21];
const FIB_9_CUMULATIVE = FIB_9_RAW.reduce((acc, v, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + v);
  return acc;
}, []);
const FIB_9_MAX = FIB_9_CUMULATIVE[FIB_9_CUMULATIVE.length - 1];
export const FIB_DEPTH_STEPS = FIB_9_CUMULATIVE.map(v => v / FIB_9_MAX);

// ═══ FIBONACCI BREATHING CYCLE ═══
// Instead of a uniform sine wave, breath phases follow Fibonacci timing
// 1s inhale → 1s hold → 2s exhale → 3s hold → 5s deep inhale → ...
export const FIB_BREATH_CYCLE = [1, 1, 2, 3, 5, 3, 2, 1, 1]; // 19s total cycle
export const FIB_BREATH_TOTAL = FIB_BREATH_CYCLE.reduce((a, b) => a + b, 0);
export const FIB_BREATH_PHASES = ['inhale', 'hold', 'exhale', 'hold', 'deep-inhale', 'hold', 'exhale', 'hold', 'rest'];

/**
 * Get the current Fibonacci breathing phase based on elapsed time
 * @param {number} elapsedMs - milliseconds since breath cycle started
 * @returns {{ phase: string, progress: number, intensity: number }}
 */
export function getFibBreathPhase(elapsedMs) {
  const elapsedS = (elapsedMs / 1000) % FIB_BREATH_TOTAL;
  let accumulated = 0;
  for (let i = 0; i < FIB_BREATH_CYCLE.length; i++) {
    accumulated += FIB_BREATH_CYCLE[i];
    if (elapsedS < accumulated) {
      const phaseProgress = (elapsedS - (accumulated - FIB_BREATH_CYCLE[i])) / FIB_BREATH_CYCLE[i];
      const isExpand = FIB_BREATH_PHASES[i].includes('inhale');
      const isContract = FIB_BREATH_PHASES[i] === 'exhale';
      const intensity = isExpand ? phaseProgress : isContract ? 1 - phaseProgress : (i === FIB_BREATH_CYCLE.length - 1 ? 0.3 : 0.5);
      return { phase: FIB_BREATH_PHASES[i], progress: phaseProgress, intensity, index: i };
    }
  }
  return { phase: 'rest', progress: 0, intensity: 0.3, index: 0 };
}

// ═══ PHI-RATIO PROXIMITY EXTRUSION ═══
/**
 * Calculate Phi-scaled proximity extrusion.
 * Objects expand at the Golden Ratio instead of linearly.
 * @param {number} distance - normalized 0-1 distance from avatar
 * @param {number} zDepth - room Z-depth in px
 * @returns {{ scale: number, translateZ: number, opacity: number }}
 */
export function phiExtrusion(distance, zDepth = 1200) {
  if (distance < 0.01) {
    // Direct collision — full Phi extrusion
    return { scale: PHI_INV + 0.4, translateZ: 24, opacity: 1 };
  }
  // Golden Ratio falloff: closer items scale faster
  const phiScale = Math.pow(PHI_INV, distance * 3);
  const scale = 0.94 + phiScale * 0.1;
  const translateZ = phiScale * 20 - (1 - phiScale) * 20;
  const opacity = Math.max(0.15, phiScale);
  return { scale, translateZ, opacity };
}

// ═══ TOROIDAL FLOW ═══
/**
 * Calculate toroidal displacement for room fold/extrude transitions.
 * Maps the 9x9 grid onto a torus surface.
 * @param {number} x - grid X (0-8)
 * @param {number} y - grid Y (0-8)
 * @param {number} z - depth (0-1)
 */
export function toroidalDisplacement(x, y, z) {
  const nx = (x / (GRID_SIZE - 1)) * TAU; // 0 → 2π
  const ny = (y / (GRID_SIZE - 1)) * TAU;
  const R = 1; // Major radius
  const r = PHI_INV * z; // Minor radius scales with depth via Phi

  return {
    tx: (R + r * Math.cos(ny)) * Math.cos(nx),
    ty: (R + r * Math.cos(ny)) * Math.sin(nx),
    tz: r * Math.sin(ny),
    rho: (PHI * Math.sqrt(x * x + y * y)) / Math.max(0.01, z * GRID_SIZE),
    angle: Math.atan2(y, x) * 180 / Math.PI,
  };
}

// ═══ GOLDEN SPIRAL PATH ═══
/**
 * Generate Golden Spiral points for the avatar trail.
 * @param {number} count - number of points
 * @param {number} scale - radius scale
 * @returns {Array<{x: number, y: number, angle: number}>}
 */
export function goldenSpiralPoints(count, scale = 30) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = i * TAU * PHI_INV; // Golden angle
    const radius = scale * Math.sqrt(i / count) * PHI;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      angle: (angle * 180 / Math.PI) % 360,
    });
  }
  return points;
}

// ═══ SEED OF LIFE GEOMETRY ═══
/**
 * Generate Seed of Life circle positions (7 overlapping circles).
 * Center circle + 6 surrounding circles at 60° intervals.
 * @param {number} radius - circle radius
 * @returns {Array<{cx: number, cy: number}>}
 */
export function seedOfLifeCircles(radius = 40) {
  const circles = [{ cx: 0, cy: 0 }]; // Center
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * Math.PI / 180;
    circles.push({
      cx: Math.cos(angle) * radius,
      cy: Math.sin(angle) * radius,
    });
  }
  return circles;
}

// ═══ METATRON'S CUBE VERTICES ═══
/**
 * 13 vertices of Metatron's Cube (Fruit of Life + connections).
 * Used as the geometric backbone of the 9x9 grid.
 */
export function metatronVertices(scale = 50) {
  const vertices = [{ x: 0, y: 0 }]; // Center
  // Inner ring (6 points)
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * Math.PI / 180;
    vertices.push({ x: Math.cos(angle) * scale, y: Math.sin(angle) * scale });
  }
  // Outer ring (6 points)
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 + 30) * Math.PI / 180;
    vertices.push({ x: Math.cos(angle) * scale * PHI, y: Math.sin(angle) * scale * PHI });
  }
  return vertices;
}

// ═══ SACRED TRANSITION CALCULATOR ═══
/**
 * Calculate sacred transition transform for any avatar position.
 * Combines Phi expansion, toroidal displacement, and Fibonacci depth.
 * @param {{x: number, y: number, z: number}} avatarPos
 * @returns {{ transform: string, opacity: number, perspective: number }}
 */
export function sacredTransition(avatarPos) {
  const { x, y, z } = avatarPos;
  const expansionFactor = Math.pow(PHI, z / (GRID_SIZE * 14.8)); // Normalized Phi expansion
  const torus = toroidalDisplacement(x, y, z);
  const fibDepthIndex = Math.min(8, Math.floor(z * 8));
  const fibDepth = FIB_DEPTH_STEPS[fibDepthIndex] * 1200;

  return {
    transform: `scale3d(${expansionFactor.toFixed(4)}, ${expansionFactor.toFixed(4)}, 1) translate3d(0px, 0px, ${-fibDepth}px)`,
    opacity: Math.min(1, 1 / expansionFactor),
    perspective: 600 + torus.rho * 200,
    fibDepth,
    torusAngle: torus.angle,
  };
}

// ═══ CHAKRA COLOR MAPPING ═══
// 7 chakra levels mapped to avatar color progression
export const CHAKRA_COLORS = [
  { level: 1, name: 'Root', color: '#EF4444', glow: 'rgba(239,68,68,0.4)' },
  { level: 2, name: 'Sacral', color: '#F97316', glow: 'rgba(249,115,22,0.4)' },
  { level: 3, name: 'Solar Plexus', color: '#FCD34D', glow: 'rgba(252,211,77,0.4)' },
  { level: 4, name: 'Heart', color: '#22C55E', glow: 'rgba(34,197,94,0.4)' },
  { level: 5, name: 'Throat', color: '#38BDF8', glow: 'rgba(56,189,248,0.4)' },
  { level: 6, name: 'Third Eye', color: '#8B5CF6', glow: 'rgba(139,92,246,0.4)' },
  { level: 7, name: 'Crown', color: '#D946EF', glow: 'rgba(217,70,239,0.4)' },
];

/**
 * Get chakra color based on XP/mastery level
 * @param {number} xp - total exploration XP
 * @returns {{ color: string, glow: string, name: string, level: number }}
 */
export function getChakraColor(xp = 0) {
  const level = Math.min(7, Math.max(1, Math.ceil(xp / 500)));
  return CHAKRA_COLORS[level - 1];
}

// ═══ VELOCITY INTEGRAL (Stillness Reward) ═══
/**
 * Calculate the integral of avatar velocity over time.
 * If the area under the curve is zero for 30s, trigger the Fractal Octant reveal.
 * @param {Array<number>} velocityHistory - recent velocity samples
 * @param {number} dt - time step in seconds
 * @returns {{ integral: number, isStill: boolean }}
 */
export function velocityIntegral(velocityHistory, dt = 1) {
  const integral = velocityHistory.reduce((sum, v) => sum + Math.abs(v) * dt, 0);
  return {
    integral,
    isStill: integral < 0.01 && velocityHistory.length >= 30,
  };
}


// ═══ FIBONACCI ESCROW ENGINE ═══
/**
 * Calculate φ-based escrow for volunteer compensation.
 * Anchors the volunteer rate ($15-$18/hr) in mathematical fairness.
 * Escrow = rate × φ% (1.618%)
 * @param {number} hours - volunteer hours
 * @param {number} rate - hourly rate (default: 15)
 * @returns {{ gross: number, escrow: number, net: number, fans: number, credits: number }}
 */
export function fibonacciEscrow(hours, rate = 15) {
  const gross = hours * rate;
  const escrowRate = PHI / 100; // 1.618%
  const escrow = gross * escrowRate;
  const net = gross - escrow;
  const fans = hours * 10; // 10 Fans/hr
  const credits = hours * 5; // 5 Credits/hr
  return { gross: Math.round(gross * 100) / 100, escrow: Math.round(escrow * 100) / 100, net: Math.round(net * 100) / 100, fans, credits };
}

// ═══ REALM TILE SCALING ═══
/**
 * Calculate Fibonacci-based scaling for realm tiles.
 * Tiles scale by φ^(position mod 3 - 1) for natural visual rhythm.
 * @param {number} index - tile index
 * @returns {number} scale factor
 */
export function realmTileScale(index) {
  return Math.pow(PHI, (index % 3) - 1);
}

// ═══ METATRON NODE DEPLOYMENT COST ═══
/**
 * Calculate the cost to deploy a Metatron's Cube node.
 * Cost = base × Fib(nodeIndex) with φ-escrow.
 * @param {number} nodeIndex - which node (0-12)
 * @param {number} baseRate - base cost (default: 15)
 * @returns {{ cost: number, escrow: number, total: number }}
 */
export function metatronNodeCost(nodeIndex, baseRate = 15) {
  const fibMultiplier = FIB[Math.min(nodeIndex, FIB.length - 1)] || 1;
  const cost = baseRate * Math.max(1, fibMultiplier);
  const escrow = cost * (PHI / 100);
  return { cost: Math.round(cost), escrow: Math.round(escrow * 100) / 100, total: Math.round(cost + escrow) };
}
