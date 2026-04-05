/**
 * THE NODULE GENERATOR
 * Generates interlocked, vibrating spherical components automatically.
 * 
 * React-compatible utility for spherical nodule positioning and rendering.
 */

/**
 * Calculate spherical coordinates using the Fibonacci sphere algorithm
 * Creates evenly distributed points on a sphere surface
 */
export const calculateSphericalPosition = (index, total, radius = 150) => {
  const phi = Math.acos(-1 + (2 * index) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;

  const x = radius * Math.cos(theta) * Math.sin(phi);
  const y = radius * Math.sin(theta) * Math.sin(phi);
  const z = radius * Math.cos(phi);

  return { x, y, z };
};

/**
 * Calculate z-index based on depth for proper overlapping
 */
export const calculateZIndex = (z, baseRadius = 150) => {
  return Math.round(z + baseRadius);
};

/**
 * Generate CSS transform for 3D positioning
 */
export const getSphericalTransform = (index, total, radius = 150, centerOffset = true) => {
  const { x, y, z } = calculateSphericalPosition(index, total, radius);
  const translate = centerOffset ? 'translate(-50%, -50%)' : '';
  return {
    transform: `${translate} translate3d(${x}px, ${y}px, ${z}px)`,
    zIndex: calculateZIndex(z, radius),
  };
};

/**
 * NoduleGenerator Class - For vanilla JS usage or imperative DOM manipulation
 */
export class NoduleGenerator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.baseRadius = 150;
  }

  setRadius(radius) {
    this.baseRadius = radius;
    return this;
  }

  generate(noduleList) {
    if (!this.container) {
      console.warn('NoduleGenerator: Container not found');
      return;
    }
    
    this.container.innerHTML = '';
    const total = noduleList.length;

    noduleList.forEach((data, i) => {
      const nodule = this.createNoduleElement(data);
      this.positionSpherically(nodule, i, total);
      this.container.appendChild(nodule);
    });
  }

  createNoduleElement(data) {
    const div = document.createElement('div');
    div.className = 'rotation-point';
    div.setAttribute('data-nodule-id', data.id || data.label);
    
    div.innerHTML = `
      <div class="nodule-vibration" style="background: radial-gradient(circle, ${data.color} 0%, transparent 75%);"></div>
      <div class="nodule-content">
        <span class="icon">${data.icon}</span>
        <span class="label">${data.label}</span>
      </div>
    `;

    if (data.onClick) {
      div.onclick = () => data.onClick(data);
    } else {
      div.onclick = () => this.handleInteraction(data);
    }
    
    return div;
  }

  positionSpherically(el, index, total) {
    const { x, y, z } = calculateSphericalPosition(index, total, this.baseRadius);
    el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px)`;
    el.style.zIndex = calculateZIndex(z, this.baseRadius);
  }

  handleInteraction(data) {
    console.log(`Mission Control: Initiating ${data.label} sequence...`);
    // Dispatch custom event for React to catch
    window.dispatchEvent(new CustomEvent('nodule-interaction', { detail: data }));
  }
}

/**
 * React Hook for spherical nodule positioning
 * @param {Array} nodules - Array of nodule data objects
 * @param {number} radius - Sphere radius
 * @returns {Array} - Nodules with calculated position styles
 */
export const useSphericalNodules = (nodules, radius = 150) => {
  return nodules.map((nodule, index) => ({
    ...nodule,
    style: getSphericalTransform(index, nodules.length, radius),
    position: calculateSphericalPosition(index, nodules.length, radius),
  }));
};

/**
 * Default nodule configurations for The Cosmic Collective
 */
export const COSMIC_NODULES = [
  { id: 'oracle', label: 'ORACLE', icon: '👁️', color: 'rgba(255, 215, 0, 0.6)', path: '/oracle' },
  { id: 'stars', label: 'STARS', icon: '✨', color: 'rgba(138, 43, 226, 0.6)', path: '/stars' },
  { id: 'matrix', label: 'MATRIX', icon: '🕸️', color: 'rgba(0, 255, 255, 0.6)', path: '/tesseract' },
  { id: 'core', label: 'CORE', icon: '⚛️', color: 'rgba(255, 69, 0, 0.6)', path: '/dashboard' },
  { id: 'tarot', label: 'TAROT', icon: '🎴', color: 'rgba(156, 39, 176, 0.6)', path: '/tarot' },
  { id: 'iching', label: 'I CHING', icon: '☯️', color: 'rgba(76, 175, 80, 0.6)', path: '/iching' },
  { id: 'mood', label: 'MOOD', icon: '💜', color: 'rgba(233, 30, 99, 0.6)', path: '/mood' },
  { id: 'harmonics', label: 'HARMONICS', icon: '🎵', color: 'rgba(33, 150, 243, 0.6)', path: '/harmonics' },
];

export default NoduleGenerator;
