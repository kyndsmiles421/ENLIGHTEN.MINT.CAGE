/**
 * FIBONACCI WEB CALCULATOR
 * 
 * Calculates positions along a Golden Spiral (Fibonacci pattern)
 * Creates natural, organic-looking distributions like sunflower seeds or galaxies.
 */

// The Golden Angle in radians (~137.5 degrees)
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Calculates a 2D Golden Spiral Web
 * @param {number} total - Number of points to generate
 * @param {number} scale - Distance scaling factor
 * @returns {Array} - Array of coordinate objects
 */
export const calculateFibonacciWeb = (total, scale = 50) => {
  const points = [];

  for (let i = 0; i < total; i++) {
    const r = Math.sqrt(i) * scale; // Radius grows with square root of index
    const theta = i * GOLDEN_ANGLE;  // Constant angular increment

    points.push({
      x: r * Math.cos(theta),
      y: r * Math.sin(theta),
      z: i * 5, // Subtle depth tilt for 3D effect
      phi: theta,
      radius: r,
      index: i,
    });
  }
  return points;
};

/**
 * Calculates a 3D Golden Spiral (helix)
 * @param {number} total - Number of points
 * @param {number} scale - Radial scale
 * @param {number} zScale - Vertical scale (helix height)
 * @returns {Array} - Array of 3D coordinates
 */
export const calculateFibonacciHelix = (total, scale = 50, zScale = 10) => {
  const points = [];

  for (let i = 0; i < total; i++) {
    const r = Math.sqrt(i) * scale;
    const theta = i * GOLDEN_ANGLE;
    const z = i * zScale;

    points.push({
      x: r * Math.cos(theta),
      y: r * Math.sin(theta),
      z: z,
      phi: theta,
      radius: r,
      index: i,
    });
  }
  return points;
};

/**
 * Calculates a Phyllotaxis pattern (sunflower-like)
 * @param {number} total - Number of points
 * @param {number} scale - Size scaling
 * @param {number} divergence - Divergence angle (default: golden angle)
 * @returns {Array} - Array of coordinates
 */
export const calculatePhyllotaxis = (total, scale = 10, divergence = GOLDEN_ANGLE) => {
  const points = [];

  for (let i = 1; i <= total; i++) {
    const r = scale * Math.sqrt(i);
    const theta = i * divergence;

    points.push({
      x: r * Math.cos(theta),
      y: r * Math.sin(theta),
      radius: r,
      angle: theta,
      index: i,
    });
  }
  return points;
};

/**
 * Generate SVG path for spiral tethers connecting all points
 * @param {Array} points - Array of coordinate objects
 * @param {number} centerX - Center X offset
 * @param {number} centerY - Center Y offset
 * @returns {string} - SVG path d attribute
 */
export const generateSpiralPath = (points, centerX = 500, centerY = 500) => {
  if (points.length < 2) return '';
  
  const pathPoints = points.map(p => `${p.x + centerX},${p.y + centerY}`);
  return `M ${pathPoints.join(' L ')}`;
};

/**
 * Generate smooth Bezier curve path through points
 * @param {Array} points - Array of coordinate objects
 * @param {number} centerX - Center X offset
 * @param {number} centerY - Center Y offset
 * @returns {string} - SVG path d attribute with curves
 */
export const generateSmoothSpiralPath = (points, centerX = 500, centerY = 500) => {
  if (points.length < 2) return '';
  
  let path = `M ${points[0].x + centerX},${points[0].y + centerY}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    
    // Control point for smooth curve
    const cpX = (prev.x + curr.x) / 2 + centerX;
    const cpY = (prev.y + curr.y) / 2 + centerY;
    
    path += ` Q ${prev.x + centerX},${prev.y + centerY} ${cpX},${cpY}`;
  }
  
  return path;
};

/**
 * Generate multiple spiral arms (like a galaxy)
 * @param {number} pointsPerArm - Points per spiral arm
 * @param {number} numArms - Number of arms
 * @param {number} scale - Size scaling
 * @returns {Array} - Array of arm arrays
 */
export const generateGalaxyArms = (pointsPerArm = 20, numArms = 3, scale = 30) => {
  const arms = [];
  const armOffset = (2 * Math.PI) / numArms;

  for (let arm = 0; arm < numArms; arm++) {
    const armPoints = [];
    
    for (let i = 0; i < pointsPerArm; i++) {
      const r = Math.sqrt(i) * scale;
      const theta = i * GOLDEN_ANGLE + (arm * armOffset);

      armPoints.push({
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
        arm: arm,
        index: i,
      });
    }
    
    arms.push(armPoints);
  }
  
  return arms;
};

export default {
  GOLDEN_ANGLE,
  calculateFibonacciWeb,
  calculateFibonacciHelix,
  calculatePhyllotaxis,
  generateSpiralPath,
  generateSmoothSpiralPath,
  generateGalaxyArms,
};
