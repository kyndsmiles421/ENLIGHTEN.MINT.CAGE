/**
 * CRYSTAL REFRACTION ENGINE
 * Mission Control: Crystal Light Interface
 * HUD elements with prism effects and angled glass cuts
 */

const RefractionEngine = {
  // CSS Variables
  vars: {
    crystalWhite: 'rgba(255, 255, 255, 0.95)',
    prismBleed: 'linear-gradient(90deg, #ff000022, #00ff0022, #0000ff22)',
    hudGlow: '0 0 15px rgba(255, 255, 255, 0.4)'
  },

  // Initialize the HUD system
  initializeHUD() {
    console.log("[RefractionEngine] Crystal Light Interface Online.");
    return this;
  },

  // Create a HUD element
  createHUDElement(options = {}) {
    const {
      id = `hud-${Date.now()}`,
      x = 0,
      y = 0,
      width = 100,
      height = 50,
      cut = 'default', // default, left-cut, diamond-cut, hex-cut
      content = ''
    } = options;

    const el = document.createElement('div');
    el.id = id;
    el.className = `hud-element ${cut !== 'default' ? cut : ''}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.innerHTML = content;

    return el;
  },

  // Apply prism effect to an element
  applyPrismEffect(element) {
    element.style.borderImage = 'linear-gradient(to right, violet, indigo, blue, green, yellow, orange, red) 1';
    element.style.borderColor = 'transparent';
  },

  // Create a spherical plane container
  createSphericalPlane(parentId) {
    const plane = document.createElement('div');
    plane.className = 'spherical-plane';
    plane.style.width = '100%';
    plane.style.height = '100%';
    
    const parent = document.getElementById(parentId);
    if (parent) {
      parent.appendChild(plane);
    }
    
    return plane;
  }
};

// Auto-initialize
if (typeof window !== 'undefined') {
  window.RefractionEngine = RefractionEngine;
  RefractionEngine.initializeHUD();
}

export default RefractionEngine;
