/**
 * scene_dome_geometry.js — Refractal Dome Three.js Mathematics
 * 
 * THE ARCHITECTURE:
 * 1. Icosahedron base (golden ratio vertices)
 * 2. Geodesic subdivision for structural complexity
 * 3. Wireframe + Edges for crystalline "Refractal" aesthetic
 * 4. Particle atmosphere with Brownian motion
 * 
 * Uses additive blending for ethereal glow effects.
 */

import * as THREE from 'three';

/**
 * Generates the structural mathematics for the Celestial Dome.
 * Uses an Icosahedron with golden ratio proportions, subdivided
 * to create a geodesic structure, then 'shattered' to create
 * a complex 'Refractal' (crystalline/wireframe) visual.
 * 
 * @param {number} radius - Dome radius
 * @param {number} subdivisions - Geodesic detail level (0-4 recommended)
 * @param {number} color - Hex color value
 * @returns {Object} - { mesh, edgesMaterial, coreMaterial }
 */
export function generateRefractalDome(radius = 10, subdivisions = 2, color = 0xA855F7) {
  // 1. Base Mathematics: The icosahedron (golden ratio based vertices)
  const geometry = new THREE.IcosahedronGeometry(radius, subdivisions);
  
  // 2. Refractal Material (Wireframe/Crystalline)
  const material = new THREE.MeshBasicMaterial({
    color: color, 
    wireframe: true, 
    transparent: true,
    opacity: 0.1, // Near invisible default - reveals on interaction
    blending: THREE.AdditiveBlending // Glow effect
  });

  const mesh = new THREE.Mesh(geometry, material);

  // 3. Mathematical Modification: Create edges/glow lines
  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.2, // Subtle structure
  });
  
  const edgesLine = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  mesh.add(edgesLine); // Add structure to the core mesh

  return { mesh, edgesMaterial, coreMaterial: material };
}

/**
 * Generates nested inner dome rings for depth perception.
 * Creates concentric crystalline shells.
 * 
 * @param {number} count - Number of inner shells
 * @param {number} outerRadius - Outer dome radius
 * @param {number} baseColor - Starting color
 * @returns {THREE.Group} - Group containing all inner domes
 */
export function generateInnerRings(count = 3, outerRadius = 10, baseColor = 0x00FFC2) {
  const group = new THREE.Group();
  
  for (let i = 0; i < count; i++) {
    const ratio = 1 - ((i + 1) / (count + 1));
    const innerRadius = outerRadius * ratio;
    const subdivisions = Math.max(1, 2 - i); // Less detail for inner rings
    
    // Color shifts from mint to gold as we go inward
    const colorShift = new THREE.Color(baseColor);
    colorShift.lerp(new THREE.Color(0xFFD700), i / count);
    
    const { mesh, edgesMaterial } = generateRefractalDome(
      innerRadius, 
      subdivisions, 
      colorShift.getHex()
    );
    
    // Slightly different rotation for parallax effect
    mesh.rotation.x = (Math.PI / 6) * (i + 1);
    mesh.rotation.y = (Math.PI / 4) * (i + 1);
    
    group.add(mesh);
  }
  
  return group;
}

/**
 * Bio-Sync Particle System. Based on subtle Brownian motion principles.
 * Creates a volumetric atmosphere of floating particles.
 * 
 * @param {number} count - Number of particles
 * @param {number} domeRadius - Containment radius
 * @returns {THREE.Points} - Particle system
 */
export function generateParticleAtmosphere(count = 2000, domeRadius = 15) {
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const sizes = [];
  
  const colorPalette = [
    new THREE.Color(0x00FFC2), // Mint
    new THREE.Color(0xA855F7), // Purple
    new THREE.Color(0xFFD700), // Gold
  ];
  
  for (let i = 0; i < count; i++) {
    // Distribute randomly within a sphere using spherical coordinates
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.pow(Math.random(), 0.5) * domeRadius; // Slight center bias
    
    positions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    
    // Random color from palette
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors.push(color.r, color.g, color.b);
    
    // Random size variation
    sizes.push(0.02 + Math.random() * 0.08);
  }
  
  particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  particlesGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true, // Key for VR depth perception
    vertexColors: true,
    blending: THREE.AdditiveBlending,
  });
  
  return new THREE.Points(particlesGeometry, particlesMaterial);
}

/**
 * Generates orbital light rings for ambient illumination.
 * Creates torus-shaped light paths.
 * 
 * @param {number} radius - Ring radius
 * @param {number} color - Ring color
 * @returns {THREE.Mesh} - Torus ring mesh
 */
export function generateLightRing(radius = 8, color = 0x00FFC2) {
  const geometry = new THREE.TorusGeometry(radius, 0.02, 8, 100);
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  
  return new THREE.Mesh(geometry, material);
}

/**
 * Creates the complete Celestial Dome scene.
 * Combines all geometric elements into a unified experience.
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} - { scene, camera, renderer, animateFrame }
 */
export function createCelestialDomeScene(container, options = {}) {
  const {
    domeRadius = 10,
    particleCount = 2000,
    innerRings = 3,
    primaryColor = 0xA855F7,
    secondaryColor = 0x00FFC2,
  } = options;
  
  // Scene setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050510, 0.02);
  
  // Camera
  const camera = new THREE.PerspectiveCamera(
    75, 
    container.clientWidth / container.clientHeight, 
    0.1, 
    1000
  );
  camera.position.set(0, 0, 0); // Inside the dome
  
  // Renderer
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x050510, 1);
  container.appendChild(renderer.domElement);
  
  // Outer Dome
  const outerDome = generateRefractalDome(domeRadius, 2, primaryColor);
  scene.add(outerDome.mesh);
  
  // Inner Rings
  const innerRingGroup = generateInnerRings(innerRings, domeRadius * 0.9, secondaryColor);
  scene.add(innerRingGroup);
  
  // Particle Atmosphere
  const particles = generateParticleAtmosphere(particleCount, domeRadius * 0.95);
  scene.add(particles);
  
  // Light Rings (3 orbital planes)
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const ring = generateLightRing(domeRadius * (0.5 + i * 0.2), i === 0 ? secondaryColor : primaryColor);
    ring.rotation.x = (Math.PI / 3) * i;
    ring.rotation.z = (Math.PI / 6) * i;
    scene.add(ring);
    rings.push(ring);
  }
  
  // Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambientLight);
  
  // Animation state
  const state = {
    breathPhase: 0,
    rotationSpeed: 0.0005,
    particleSpeed: 0.0002,
  };
  
  // Animation frame function
  const animateFrame = (time) => {
    // Bio-sync breath cycle (5.5s)
    state.breathPhase = (Math.sin(time / 875) + 1) / 2;
    const breath = 0.8 + state.breathPhase * 0.4;
    
    // Rotate outer dome slowly
    outerDome.mesh.rotation.y += state.rotationSpeed * breath;
    outerDome.mesh.rotation.x += state.rotationSpeed * 0.3 * breath;
    
    // Counter-rotate inner rings for depth effect
    innerRingGroup.children.forEach((ring, i) => {
      ring.rotation.y -= state.rotationSpeed * (0.5 + i * 0.3);
      ring.rotation.z += state.rotationSpeed * 0.2;
    });
    
    // Animate particles (subtle drift)
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += (Math.random() - 0.5) * state.particleSpeed;
      positions[i + 1] += (Math.random() - 0.5) * state.particleSpeed;
      positions[i + 2] += (Math.random() - 0.5) * state.particleSpeed;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    
    // Pulse light rings
    rings.forEach((ring, i) => {
      ring.rotation.z += 0.002 * (i + 1);
      ring.material.opacity = 0.2 + state.breathPhase * 0.15;
    });
    
    // Pulse dome opacity with breath
    outerDome.coreMaterial.opacity = 0.05 + state.breathPhase * 0.1;
    outerDome.edgesMaterial.opacity = 0.15 + state.breathPhase * 0.15;
    
    renderer.render(scene, camera);
  };
  
  // Handle resize
  const handleResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', handleResize);
  
  // Cleanup function
  const dispose = () => {
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };
  
  return {
    scene,
    camera,
    renderer,
    animateFrame,
    dispose,
    outerDome,
    particles,
    rings,
  };
}

export default {
  generateRefractalDome,
  generateInnerRings,
  generateParticleAtmosphere,
  generateLightRing,
  createCelestialDomeScene,
};
