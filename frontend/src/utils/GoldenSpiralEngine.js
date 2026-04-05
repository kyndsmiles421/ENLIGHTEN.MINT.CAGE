/**
 * THE UNIFIED SANCTUARY ENGINE
 * Integrates: Golden Ratio Spiral, Shambhala Events, & Crystal Encryption
 * V2.88_SHAMBHALA - The Path That Glows
 */

import * as THREE from 'three';

const GoldenSpiralEngine = (() => {
  let scene, camera, renderer, spiralPoints;
  let isInitialized = false;
  let animationId = null;
  
  const PHI = (1 + Math.sqrt(5)) / 2; // The Golden Ratio
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees

  const init = () => {
    // Prevent double initialization
    if (isInitialized) {
      console.log('[GoldenSpiralEngine] Already initialized, skipping.');
      return;
    }
    
    // 1. Scene Setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    // Style the canvas
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '1'; // Above cosmic background, below UI
    renderer.domElement.style.pointerEvents = 'none'; // Don't block interactions
    renderer.domElement.style.mixBlendMode = 'screen'; // Additive blend with background
    renderer.domElement.id = 'golden-spiral-canvas';
    
    // Mount to the 'emergent-layer' container or body
    const container = document.querySelector('.emergent-layer') || document.body;
    
    // Remove existing canvas if present
    const existingCanvas = document.getElementById('golden-spiral-canvas');
    if (existingCanvas) {
      existingCanvas.remove();
    }
    
    container.appendChild(renderer.domElement);

    // 2. Create the Golden Ratio Spiral (The Phyllotaxis)
    const pointsCount = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pointsCount * 3);
    const colors = new Float32Array(pointsCount * 3);

    for (let i = 0; i < pointsCount; i++) {
      const r = 0.5 * Math.sqrt(i); // Radius expands with sqrt(i) for zero-scale physics
      const theta = i * GOLDEN_ANGLE; // Angle rotates by Golden Angle

      positions[i * 3] = r * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(theta);
      positions[i * 3 + 2] = 0;

      // Rainbow Refraction Initial Colors - Pure White Light
      colors[i * 3] = 1;     // R
      colors[i * 3 + 1] = 1; // G
      colors[i * 3 + 2] = 1; // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    spiralPoints = new THREE.Points(geometry, material);
    scene.add(spiralPoints);
    camera.position.z = 12; // Closer for more visibility

    // 3. The Shambhala "Pass Key" Listeners
    window.addEventListener('SHAMBHALA_ASCEND', handleAscend);
    window.addEventListener('SHAMBHALA_STASIS', handleStasis);
    
    // Handle resize for mobile devices
    window.addEventListener('resize', handleResize);

    isInitialized = true;
    console.log('[GoldenSpiralEngine] PHI =', PHI.toFixed(6), '| Golden Angle =', (GOLDEN_ANGLE * 180 / Math.PI).toFixed(2) + '°');
    console.log('[GoldenSpiralEngine] Golden Ratio Sanctuary Active. 600 particles in sacred Phyllotaxis.');
    
    animate();
  };

  const handleAscend = (e) => {
    if (!spiralPoints) return;
    
    const { frequency, origin } = e.detail || {};
    console.log(`%c [SPIRAL ASCEND]: ${origin || 'Unknown'} at ${frequency || '0Hz'}`, 
                "color: #fff; background: linear-gradient(to right, violet, indigo, blue, green, yellow, orange, red); padding: 8px; border-radius: 4px;");
    
    // Transition to Rainbow Refraction Mode
    spiralPoints.material.opacity = 1.0;
    
    // Animate colors to rainbow refraction
    const colors = spiralPoints.geometry.attributes.color.array;
    for (let i = 0; i < colors.length / 3; i++) {
      const hue = (i / (colors.length / 3)) * 360;
      const rgb = hslToRgb(hue, 100, 60);
      colors[i * 3] = rgb.r;
      colors[i * 3 + 1] = rgb.g;
      colors[i * 3 + 2] = rgb.b;
    }
    spiralPoints.geometry.attributes.color.needsUpdate = true;
    
    // Expand the galaxy
    animateScale(1.5);
  };

  const handleStasis = () => {
    if (!spiralPoints) return;
    
    console.log('%c [SPIRAL STASIS]: Returning to White Light', 
                "color: #888; background: #111; padding: 8px; border-radius: 4px;");
    
    // Return to White Light Stasis
    spiralPoints.material.opacity = 0.4;
    
    // Reset colors to pure white
    const colors = spiralPoints.geometry.attributes.color.array;
    for (let i = 0; i < colors.length / 3; i++) {
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
    }
    spiralPoints.geometry.attributes.color.needsUpdate = true;
    
    // Contract
    animateScale(1.0);
  };

  const animateScale = (targetScale) => {
    if (!spiralPoints) return;
    
    // Smooth scale transition using lerp
    const currentScale = spiralPoints.scale.x;
    const step = (targetScale - currentScale) * 0.1;
    
    const scaleAnimation = () => {
      if (!spiralPoints) return;
      
      const diff = targetScale - spiralPoints.scale.x;
      if (Math.abs(diff) > 0.01) {
        spiralPoints.scale.x += diff * 0.1;
        spiralPoints.scale.y += diff * 0.1;
        spiralPoints.scale.z += diff * 0.1;
        requestAnimationFrame(scaleAnimation);
      } else {
        spiralPoints.scale.set(targetScale, targetScale, targetScale);
      }
    };
    
    scaleAnimation();
  };

  const animate = () => {
    if (!isInitialized || !spiralPoints) return;
    
    animationId = requestAnimationFrame(animate);
    
    // Slow, meditative rotation
    spiralPoints.rotation.z += 0.002;
    
    // Subtle breathing effect
    const time = Date.now() * 0.001;
    spiralPoints.position.y = Math.sin(time) * 0.2;

    renderer.render(scene, camera);
  };

  const handleResize = () => {
    if (!camera || !renderer) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  // HSL to RGB helper for rainbow colors
  const hslToRgb = (h, s, l) => {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return { r: f(0), g: f(8), b: f(4) };
  };

  const destroy = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    
    window.removeEventListener('SHAMBHALA_ASCEND', handleAscend);
    window.removeEventListener('SHAMBHALA_STASIS', handleStasis);
    window.removeEventListener('resize', handleResize);
    
    if (spiralPoints) {
      spiralPoints.geometry.dispose();
      spiralPoints.material.dispose();
      scene.remove(spiralPoints);
      spiralPoints = null;
    }
    
    if (renderer) {
      renderer.dispose();
      const canvas = document.getElementById('golden-spiral-canvas');
      if (canvas) canvas.remove();
      renderer = null;
    }
    
    scene = null;
    camera = null;
    isInitialized = false;
    
    console.log('[GoldenSpiralEngine] Destroyed.');
  };

  return { 
    start: init, 
    destroy,
    isActive: () => isInitialized,
    getPhi: () => PHI,
    getGoldenAngle: () => GOLDEN_ANGLE
  };
})();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  window.GoldenSpiralEngine = GoldenSpiralEngine;
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Small delay to ensure .emergent-layer exists
      setTimeout(() => GoldenSpiralEngine.start(), 100);
    });
  } else {
    setTimeout(() => GoldenSpiralEngine.start(), 100);
  }
}

export default GoldenSpiralEngine;
