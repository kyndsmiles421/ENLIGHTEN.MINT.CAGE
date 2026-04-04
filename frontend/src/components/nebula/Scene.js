/**
 * Scene.js — The Three.js Canvas Wrapper for Nebula View
 * 
 * "Zen Garden in the Void" — A tranquil 3D space with floating crystal islands.
 * 
 * CRITICAL: This component fully unmounts when:
 * - User selects "Parchment" view
 * - Device fails hardware capability check
 * - Battery saver mode is active
 * 
 * This preserves battery life and ensures graceful degradation.
 */

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Stars, 
  Float,
  MeshDistortMaterial,
  GradientTexture,
} from '@react-three/drei';
import * as THREE from 'three';
import { useRenderTier } from '../../hooks/useRenderTier';
import { useEnlightenmentCafe } from '../../context/EnlightenmentCafeContext';
import Islands from './Islands';

// ─── Volumetric Fog Effect (Premium Tier Only) ───
function VolumetricFog({ features }) {
  const fogRef = useRef();
  const { scene } = useThree();
  
  useEffect(() => {
    if (features?.volumetricFog) {
      // Deep cosmic fog
      scene.fog = new THREE.FogExp2('#0a0a12', 0.015);
    }
    return () => {
      scene.fog = null;
    };
  }, [scene, features?.volumetricFog]);
  
  return null;
}

// ─── Ambient Particles (Dust Motes / Star Dust) ───
function AmbientParticles({ count = 200, features }) {
  const points = useRef();
  const geometry = useRef();
  
  // Generate random positions
  const particlePositions = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, [count]);
  
  // Set up geometry on mount
  React.useEffect(() => {
    if (geometry.current) {
      geometry.current.setAttribute(
        'position',
        new THREE.BufferAttribute(particlePositions, 3)
      );
    }
  }, [particlePositions]);
  
  useFrame((state) => {
    if (points.current) {
      // Gentle drift
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });
  
  if (!features?.particles) return null;
  
  return (
    <points ref={points}>
      <bufferGeometry ref={geometry} />
      <pointsMaterial
        size={0.02}
        color="#c9a962"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Central Nexus (Optional Hub Point) ───
function CentralNexus() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      // Gentle breathing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      meshRef.current.scale.setScalar(scale);
    }
  });
  
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.3, 2]} />
        <MeshDistortMaterial
          color="#c9a962"
          emissive="#c9a962"
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.8}
          distort={0.2}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

// ─── Scene Lighting ───
function SceneLighting({ features }) {
  return (
    <>
      {/* Ambient base */}
      <ambientLight intensity={0.15} color="#f5f2ed" />
      
      {/* Key light from above-right */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.4}
        color="#faf8f5"
        castShadow={features?.shadowMaps}
      />
      
      {/* Fill light from below-left (warm) */}
      <directionalLight
        position={[-3, -2, -3]}
        intensity={0.2}
        color="#c9a962"
      />
      
      {/* Rim light from behind */}
      <directionalLight
        position={[0, 0, -8]}
        intensity={0.1}
        color="#818cf8"
      />
      
      {/* Point light at center (nexus glow) */}
      <pointLight
        position={[0, 0, 0]}
        intensity={0.5}
        color="#c9a962"
        distance={10}
        decay={2}
      />
    </>
  );
}

// ─── Background Environment ───
function NebulaBackground({ features }) {
  return (
    <>
      {/* Star field */}
      <Stars
        radius={100}
        depth={50}
        count={features?.maxParticles > 100 ? 3000 : 1000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      
      {/* Deep space color */}
      <color attach="background" args={['#0a0a12']} />
    </>
  );
}

// ─── Camera Controller ───
function CameraController() {
  const { camera } = useThree();
  
  useEffect(() => {
    // Position camera to see pentagon formation
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={true}
      minDistance={4}
      maxDistance={15}
      maxPolarAngle={Math.PI / 2 + 0.3}
      minPolarAngle={Math.PI / 4}
      autoRotate
      autoRotateSpeed={0.3}
      dampingFactor={0.05}
      enableDamping
    />
  );
}

// ─── Loading Fallback ───
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#c9a962" wireframe />
    </mesh>
  );
}

// ─── Main Scene Component ───
export function NebulaScene({ onIslandClick, activeIsland }) {
  const { viewTier } = useEnlightenmentCafe();
  const { features, webglEnabled, isLoading } = useRenderTier(viewTier);
  const canvasRef = useRef();
  
  // Don't render if WebGL is disabled or still loading
  if (isLoading || !webglEnabled) {
    return null;
  }
  
  return (
    <div 
      className="nebula-scene-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'auto',
      }}
      data-testid="nebula-scene"
    >
      <Canvas
        ref={canvasRef}
        dpr={[1, features?.textureQuality === 'high' ? 2 : 1.5]}
        gl={{
          antialias: features?.textureQuality !== 'low',
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={{
          fov: 50,
          near: 0.1,
          far: 200,
        }}
        shadows={features?.shadowMaps}
        style={{ background: '#0a0a12' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Environment */}
          <NebulaBackground features={features} />
          <VolumetricFog features={features} />
          
          {/* Lighting */}
          <SceneLighting features={features} />
          
          {/* Central hub */}
          <CentralNexus />
          
          {/* Pentagon Islands */}
          <Islands 
            onIslandClick={onIslandClick} 
            activeIsland={activeIsland}
            features={features}
          />
          
          {/* Ambient particles */}
          <AmbientParticles 
            count={features?.maxParticles || 100} 
            features={features} 
          />
          
          {/* Camera controls */}
          <CameraController />
        </Suspense>
      </Canvas>
    </div>
  );
}

// ─── Wrapper with Unmount Logic ───
export default function Scene({ onIslandClick, activeIsland }) {
  const { viewTier } = useEnlightenmentCafe();
  const { webglEnabled, isLoading, batterySaverActive } = useRenderTier(viewTier);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Only mount if conditions are right
    if (!isLoading && webglEnabled && viewTier === 'nebula' && !batterySaverActive) {
      setMounted(true);
    } else {
      setMounted(false);
    }
  }, [isLoading, webglEnabled, viewTier, batterySaverActive]);
  
  // Clean unmount when switching to Parchment
  if (!mounted) {
    return null;
  }
  
  return <NebulaScene onIslandClick={onIslandClick} activeIsland={activeIsland} />;
}
