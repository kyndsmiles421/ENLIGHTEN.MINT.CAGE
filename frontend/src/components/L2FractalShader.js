/**
 * ENLIGHTEN.MINT.CAFE - L² FRACTAL GPU SHADER ENGINE
 * L2FractalShader.js
 * 
 * DYNAMIC PRISMATIC LIQUID @ 120 FPS
 * 
 * This component injects GLSL shaders directly into the WebGL pipeline,
 * rendering the L² Fractal geometry with real-time PHI-based mathematics.
 * 
 * SHADER ARCHITECTURE:
 * - Vertex Shader: Crystal lattice positioning with φ displacement
 * - Fragment Shader: Prismatic refraction with 5-facet pentagonal symmetry
 * - Uniforms: Driven by Main Brain API (u_phi, u_resonance, u_time, etc.)
 * 
 * VISUAL OUTPUT:
 * - Dynamic Prismatic Liquid (not static quartz)
 * - 120 FPS target with RAF optimization
 * - LOx cooling visualization (blue crystalline glow)
 * - 432Hz resonance wave animation
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ═══════════════════════════════════════════════════════════════════════════════
// GLSL VERTEX SHADER - Crystal Lattice Positioning
// ═══════════════════════════════════════════════════════════════════════════════
const VERTEX_SHADER = `
  uniform float u_time;
  uniform float u_phi;
  uniform float u_resonance;
  uniform float u_lattice_charge;
  
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // PHI-based noise function
  float phiNoise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }
  
  void main() {
    vUv = uv;
    vNormal = normalMatrix * normal;
    
    // PHI-weighted displacement
    float displacement = sin(position.x * u_phi + u_time) * 
                        cos(position.y * u_resonance + u_time * 0.7) * 
                        sin(position.z + u_time * 0.5);
    
    // Apply crystalline lattice charge
    displacement *= u_lattice_charge * 0.3;
    
    // Add PHI noise for organic movement
    displacement += phiNoise(position + u_time * 0.1) * 0.05;
    
    vDisplacement = displacement;
    
    // Displace along normal
    vec3 newPosition = position + normal * displacement;
    vPosition = newPosition;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// GLSL FRAGMENT SHADER - Prismatic Refraction
// ═══════════════════════════════════════════════════════════════════════════════
const FRAGMENT_SHADER = `
  uniform float u_time;
  uniform float u_phi;
  uniform float u_resonance;
  uniform float u_shield_intensity;
  uniform float u_lox_cooling;
  uniform float u_refraction_angle;
  uniform float u_processing_load;
  
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Pentagonal symmetry (5 facets, 72° each)
  const float FACETS = 5.0;
  const float PI = 3.14159265359;
  
  // HSL to RGB conversion
  vec3 hsl2rgb(float h, float s, float l) {
    vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
  }
  
  // Prismatic refraction based on angle
  vec3 refract_prismatic(float angle, float intensity) {
    // Map angle to hue (0-360 -> 0-1)
    float hue = mod(angle / 360.0 + u_time * 0.1, 1.0);
    
    // LOx cooling shifts toward blue-purple spectrum
    hue = mix(hue, 0.65, u_lox_cooling * 0.3);
    
    // Saturation based on shield intensity
    float saturation = 0.6 + u_shield_intensity * 0.4;
    
    // Lightness based on processing load
    float lightness = 0.4 + u_processing_load * 0.3;
    
    return hsl2rgb(hue, saturation, lightness);
  }
  
  // Crystalline facet calculation
  float get_facet(vec2 uv) {
    float angle = atan(uv.y - 0.5, uv.x - 0.5);
    float facet = floor((angle + PI) / (2.0 * PI / FACETS));
    return facet / FACETS;
  }
  
  void main() {
    // Calculate pentagonal facet
    float facet = get_facet(vUv);
    float facetAngle = facet * 360.0;
    
    // Add refraction angle offset (72° per facet)
    facetAngle += u_refraction_angle * facet;
    
    // Get prismatic color
    vec3 baseColor = refract_prismatic(facetAngle, vDisplacement);
    
    // Add crystalline highlight based on displacement
    float highlight = smoothstep(0.0, 0.3, abs(vDisplacement)) * 0.5;
    baseColor += vec3(highlight);
    
    // LOx cooling glow (cyan-blue edge)
    vec3 loxGlow = vec3(0.3, 0.8, 1.0) * u_lox_cooling * 0.4;
    baseColor += loxGlow * (1.0 - length(vUv - 0.5));
    
    // Shield integrity creates outer glow
    float edgeFactor = 1.0 - length(vUv - 0.5) * 2.0;
    vec3 shieldGlow = vec3(0.6, 0.3, 1.0) * u_shield_intensity * edgeFactor * 0.3;
    baseColor += shieldGlow;
    
    // PHI resonance wave
    float wave = sin(vPosition.x * u_phi * 10.0 + u_time * 2.0) * 
                 sin(vPosition.y * u_phi * 10.0 + u_time * 1.5) * 0.1;
    baseColor += vec3(wave * 0.5, wave * 0.3, wave);
    
    // Alpha based on displacement and resonance
    float alpha = 0.7 + abs(vDisplacement) * 0.3;
    alpha *= u_resonance;
    
    gl_FragColor = vec4(baseColor, alpha);
  }
`;

/**
 * L² Fractal Shader Component
 * 
 * Props:
 * - size: Canvas size (default: 400)
 * - quality: Render quality ('low' | 'medium' | 'high')
 * - autoRotate: Enable auto-rotation (default: true)
 * - pulseOnHover: Pulse effect on hover (default: true)
 */
export default function L2FractalShader({ 
  size = 400, 
  quality = 'medium',
  autoRotate = true,
  pulseOnHover = true,
  className = '',
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const uniformsRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameTime = useRef(0);
  
  const [isHovered, setIsHovered] = useState(false);
  const [fps, setFps] = useState(0);
  const [shaderParams, setShaderParams] = useState(null);
  
  // Fetch shader parameters from Main Brain API
  const fetchShaderParams = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/main-brain/shader-params`);
      if (res.data.status === 'success') {
        setShaderParams(res.data.shader_uniforms);
      }
    } catch (err) {
      console.warn('[L2FractalShader] Failed to fetch shader params, using defaults');
    }
  }, []);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Fetch initial shader params
    fetchShaderParams();
    
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 2.5;
    cameraRef.current = camera;
    
    // Renderer with high pixel ratio for quality
    const pixelRatio = quality === 'high' ? Math.min(window.devicePixelRatio, 3) :
                       quality === 'medium' ? Math.min(window.devicePixelRatio, 2) : 1;
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: quality !== 'low',
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    
    containerRef.current.appendChild(renderer.domElement);
    
    // Shader uniforms
    const uniforms = {
      u_time: { value: 0.0 },
      u_phi: { value: 1.618033988749895 },
      u_resonance: { value: 0.833346 },
      u_lattice_charge: { value: 0.75 },
      u_shield_intensity: { value: 1.0 },
      u_lox_cooling: { value: 0.915 }, // -183 / 200
      u_refraction_angle: { value: 72.0 },
      u_processing_load: { value: 0.5 },
    };
    uniformsRef.current = uniforms;
    
    // Geometry - Icosahedron for crystalline look
    const geometry = new THREE.IcosahedronGeometry(1, quality === 'high' ? 5 : quality === 'medium' ? 4 : 3);
    
    // Shader material
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;
    
    // Add ambient particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = quality === 'high' ? 500 : quality === 'medium' ? 300 : 150;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 0.5;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x8B5CF6,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Animation loop targeting 120 FPS
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    
    const animate = (time) => {
      animationRef.current = requestAnimationFrame(animate);
      
      // Calculate delta time for smooth animation
      const deltaTime = (time - lastFrameTime.current) / 1000;
      lastFrameTime.current = time;
      
      // FPS calculation
      frameCount++;
      if (time - lastFpsUpdate >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsUpdate = time;
      }
      
      // Update uniforms
      if (uniformsRef.current) {
        uniformsRef.current.u_time.value = time * 0.001;
        
        // Pulse effect on hover
        if (isHovered && pulseOnHover) {
          uniformsRef.current.u_lattice_charge.value = 0.75 + Math.sin(time * 0.005) * 0.25;
        }
      }
      
      // Auto rotation
      if (meshRef.current && autoRotate) {
        meshRef.current.rotation.x += 0.003;
        meshRef.current.rotation.y += 0.005;
      }
      
      // Rotate particles opposite direction
      if (particles) {
        particles.rotation.y -= 0.001;
      }
      
      renderer.render(scene, camera);
    };
    
    animate(0);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      geometry.dispose();
      material.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [size, quality, autoRotate, pulseOnHover, fetchShaderParams, isHovered]);
  
  // Update uniforms when shader params change
  useEffect(() => {
    if (shaderParams && uniformsRef.current) {
      uniformsRef.current.u_phi.value = shaderParams.u_phi || 1.618033988749895;
      uniformsRef.current.u_resonance.value = shaderParams.u_resonance || 0.833346;
      uniformsRef.current.u_lattice_charge.value = shaderParams.u_lattice_charge || 0.75;
      uniformsRef.current.u_shield_intensity.value = shaderParams.u_shield_intensity || 1.0;
      uniformsRef.current.u_lox_cooling.value = shaderParams.u_lox_cooling || 0.915;
      uniformsRef.current.u_refraction_angle.value = shaderParams.u_refraction_angle || 72.0;
      uniformsRef.current.u_processing_load.value = shaderParams.u_processing_load || 0.5;
    }
  }, [shaderParams]);
  
  // Periodic shader param refresh
  useEffect(() => {
    const interval = setInterval(fetchShaderParams, 5000);
    return () => clearInterval(interval);
  }, [fetchShaderParams]);
  
  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="l2-fractal-shader"
    >
      {/* FPS Counter (debug) */}
      <div 
        className="absolute top-2 right-2 text-[8px] font-mono px-1.5 py-0.5 rounded"
        style={{ 
          background: 'rgba(0,0,0,0.5)', 
          color: fps >= 60 ? '#22C55E' : fps >= 30 ? '#F59E0B' : '#EF4444',
        }}
      >
        {fps} FPS
      </div>
      
      {/* Shader info */}
      <div 
        className="absolute bottom-2 left-2 text-[7px] font-mono uppercase tracking-wider"
        style={{ color: 'rgba(139, 92, 246, 0.6)' }}
      >
        L² FRACTAL • GLSL
      </div>
    </div>
  );
}


/**
 * Compact L² Fractal Badge
 * Smaller version for inline use in cards/banners
 */
export function L2FractalBadge({ size = 60 }) {
  return (
    <L2FractalShader 
      size={size} 
      quality="low" 
      autoRotate={true} 
      pulseOnHover={false}
      className="rounded-lg overflow-hidden"
    />
  );
}
