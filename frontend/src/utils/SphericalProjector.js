/**
 * SPHERICAL PROJECTOR
 * Projects UI Elements onto a 3D Spherical Field
 * Converts flat array indices to (x, y, z) coordinates using Fibonacci distribution.
 */

/**
 * Projects a single index onto a sphere surface
 * @param {number} index - Element index in the array
 * @param {number} total - Total number of elements
 * @param {number} radius - Sphere radius in pixels
 * @returns {Object} - 3D coordinates and rotation values
 */
export const projectToSphere = (index, total, radius = 250) => {
  // Golden ratio offset for even distribution (Fibonacci sphere)
  const phi = Math.acos(-1 + (2 * index) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;

  return {
    x: radius * Math.cos(theta) * Math.sin(phi),
    y: radius * Math.sin(theta) * Math.sin(phi),
    z: radius * Math.cos(phi),
    // Rotation values for facing the center
    rotationY: (theta * 180) / Math.PI,
    rotationX: (phi * 180) / Math.PI - 90,
    // Depth-based values for visual effects
    depth: Math.cos(phi), // -1 to 1, where 1 is front
    opacity: 0.4 + 0.6 * ((Math.cos(phi) + 1) / 2), // 0.4 to 1.0
  };
};

/**
 * Projects an entire array of elements onto a sphere
 * @param {Array} elements - Array of elements to project
 * @param {number} radius - Sphere radius
 * @returns {Array} - Elements with added coordinate data
 */
export const projectArrayToSphere = (elements, radius = 250) => {
  return elements.map((element, index) => ({
    ...element,
    coords: projectToSphere(index, elements.length, radius),
  }));
};

/**
 * Calculate z-index based on Z position (depth sorting)
 * @param {number} z - Z coordinate
 * @param {number} radius - Sphere radius (for normalization)
 * @returns {number} - z-index value
 */
export const calculateDepthIndex = (z, radius = 250) => {
  return Math.round((z + radius) / 2);
};

/**
 * Get CSS transform string for 3D positioning
 * @param {Object} coords - Coordinate object from projectToSphere
 * @returns {string} - CSS transform value
 */
export const getCSSTransform = (coords) => {
  return `translate3d(${coords.x}px, ${coords.y}px, ${coords.z}px) rotateY(${coords.rotationY}deg) rotateX(${coords.rotationX}deg)`;
};

/**
 * Interpolate between two sphere projections (for animations)
 * @param {Object} from - Starting coordinates
 * @param {Object} to - Ending coordinates  
 * @param {number} t - Interpolation factor (0 to 1)
 * @returns {Object} - Interpolated coordinates
 */
export const lerpSphereCoords = (from, to, t) => {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    z: from.z + (to.z - from.z) * t,
    rotationY: from.rotationY + (to.rotationY - from.rotationY) * t,
    rotationX: from.rotationX + (to.rotationX - from.rotationX) * t,
  };
};

/**
 * Generate orbital ring positions (for rings around a sphere)
 * @param {number} count - Number of points on the ring
 * @param {number} radius - Ring radius
 * @param {number} tilt - Tilt angle in degrees
 * @param {number} yOffset - Vertical offset
 * @returns {Array} - Array of coordinate objects
 */
export const generateOrbitalRing = (count, radius = 200, tilt = 0, yOffset = 0) => {
  const points = [];
  const tiltRad = (tilt * Math.PI) / 180;
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * Math.sin(tiltRad) + yOffset,
      z: Math.sin(angle) * radius * Math.cos(tiltRad),
      angle: (angle * 180) / Math.PI,
    });
  }
  
  return points;
};

export default {
  projectToSphere,
  projectArrayToSphere,
  calculateDepthIndex,
  getCSSTransform,
  lerpSphereCoords,
  generateOrbitalRing,
};
