/**
 * Islands.js — Crystal/Gem-like Wellness Islands in Pentagon Formation
 * 
 * Each of the 5 islands represents a core wellness module:
 * - Top (North): Oracle — Eye/Vision crystal
 * - Upper Right: Journal — Quill/Script crystal  
 * - Lower Right: Breathing — Wind/Air crystal
 * - Lower Left: Harmonics — Sound wave crystal
 * - Upper Left: Dashboard — Compass/Core crystal
 * 
 * Geometry: Faceted crystal formations using IcosahedronGeometry
 * arranged in a perfect pentagon formation around the central nexus.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html, MeshTransmissionMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

// ─── Pentagon Island Configuration ───
// Golden ratio for harmonious spacing
const PHI = (1 + Math.sqrt(5)) / 2; // 1.618...
const PENTAGON_RADIUS = 3.5; // Distance from center

// Calculate pentagon vertices (5 points, starting from top)
const getPentagonPosition = (index) => {
  // Start from top (90 degrees / π/2) and go clockwise
  const angle = (Math.PI / 2) - (index * (2 * Math.PI / 5));
  const x = Math.cos(angle) * PENTAGON_RADIUS;
  const z = Math.sin(angle) * PENTAGON_RADIUS;
  // Slight Y variation for visual interest
  const y = Math.sin(index * PHI) * 0.3;
  return [x, y, z];
};

// ─── Island Definitions ───
export const ISLAND_CONFIG = [
  {
    id: 'oracle',
    label: 'Oracle',
    path: '/oracle',
    color: '#E879F9',        // Fuchsia/violet
    emissive: '#9333ea',
    symbol: 'eye',
    description: 'Divine Guidance',
    position: 0,             // Top (North)
  },
  {
    id: 'journal',
    label: 'Journal',
    path: '/journal',
    color: '#86EFAC',        // Mint green
    emissive: '#22c55e',
    symbol: 'quill',
    description: 'Sacred Writing',
    position: 1,             // Upper Right
  },
  {
    id: 'breathing',
    label: 'Breathing',
    path: '/breathing',
    color: '#2DD4BF',        // Teal
    emissive: '#14b8a6',
    symbol: 'wind',
    description: 'Life Force',
    position: 2,             // Lower Right
  },
  {
    id: 'harmonics',
    label: 'Harmonics',
    path: '/frequencies',
    color: '#818CF8',        // Indigo
    emissive: '#6366f1',
    symbol: 'wave',
    description: 'Sound Healing',
    position: 3,             // Lower Left
  },
  {
    id: 'dashboard',
    label: 'Sanctuary',
    path: '/dashboard',
    color: '#C9A962',        // Gold
    emissive: '#a08a4a',
    symbol: 'compass',
    description: 'Home Base',
    position: 4,             // Upper Left
  },
];

// ─── Crystal Geometry Component ───
function CrystalIsland({ 
  config, 
  isActive, 
  onClick, 
  features,
}) {
  const meshRef = useRef();
  const glowRef = useRef();
  const navigate = useNavigate();
  const position = useMemo(() => getPentagonPosition(config.position), [config.position]);
  
  // Unique animation offset per island
  const animOffset = useMemo(() => config.position * PHI, [config.position]);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15 + animOffset;
      
      // Breathing scale effect
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.5 + animOffset) * 0.03;
      meshRef.current.scale.setScalar(isActive ? 1.15 : breathe);
      
      // Active state glow pulse
      if (glowRef.current && isActive) {
        const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
        glowRef.current.material.opacity = pulse;
      }
    }
  });
  
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(config.id);
    }
    // Navigate after brief delay for visual feedback
    setTimeout(() => navigate(config.path), 300);
  };
  
  // Crystal detail level based on features
  const detail = features?.geometryDetail === 'high' ? 2 : 1;
  
  return (
    <Float
      speed={1.5}
      rotationIntensity={0.15}
      floatIntensity={0.25}
      position={position}
    >
      <group>
        {/* Main crystal body */}
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
          }}
        >
          {/* Faceted crystal geometry */}
          <icosahedronGeometry args={[0.6, detail]} />
          
          {features?.complexShaders ? (
            <MeshTransmissionMaterial
              color={config.color}
              transmission={0.6}
              thickness={0.5}
              roughness={0.1}
              metalness={0.2}
              chromaticAberration={0.02}
              anisotropicBlur={0.1}
              distortion={0.1}
              distortionScale={0.2}
              temporalDistortion={0.1}
            />
          ) : (
            <meshStandardMaterial
              color={config.color}
              emissive={config.emissive}
              emissiveIntensity={isActive ? 0.5 : 0.2}
              roughness={0.2}
              metalness={0.6}
              transparent
              opacity={0.9}
            />
          )}
        </mesh>
        
        {/* Outer glow ring (active state) */}
        {isActive && (
          <mesh ref={glowRef} scale={1.3}>
            <torusGeometry args={[0.7, 0.05, 8, 32]} />
            <meshBasicMaterial
              color={config.color}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        
        {/* Base platform */}
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.4, 6]} />
          <meshStandardMaterial
            color={config.color}
            emissive={config.emissive}
            emissiveIntensity={0.1}
            transparent
            opacity={0.3}
          />
        </mesh>
        
        {/* Label (HTML overlay) */}
        <Html
          position={[0, -0.9, 0]}
          center
          distanceFactor={8}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(10, 10, 18, 0.8)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '20px',
              border: `1px solid ${config.color}40`,
              color: config.color,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              boxShadow: `0 0 20px ${config.color}20`,
            }}
          >
            {config.label}
            <div style={{ 
              fontSize: '9px', 
              opacity: 0.7, 
              fontWeight: 400,
              marginTop: '2px',
              letterSpacing: '0.3px',
            }}>
              {config.description}
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

// ─── Gold Thread Connections ───
function GoldThreadMesh({ features }) {
  // Generate line points for connections
  const lines = useMemo(() => {
    const result = [];
    const center = [0, 0, 0];
    
    // Connect each island to center
    ISLAND_CONFIG.forEach((island) => {
      const pos = getPentagonPosition(island.position);
      result.push({
        points: [center, pos],
        key: `center-${island.id}`,
      });
    });
    
    // Connect adjacent islands (pentagon edges)
    for (let i = 0; i < 5; i++) {
      const pos1 = getPentagonPosition(i);
      const pos2 = getPentagonPosition((i + 1) % 5);
      result.push({
        points: [pos1, pos2],
        key: `edge-${i}`,
      });
    }
    
    return result;
  }, []);
  
  if (!features?.webgl) return null;
  
  return (
    <group>
      {lines.map(({ points, key }) => (
        <Line
          key={key}
          points={points}
          color="#c9a962"
          lineWidth={1}
          transparent
          opacity={0.2}
        />
      ))}
    </group>
  );
}

// ─── Main Islands Component ───
export default function Islands({ onIslandClick, activeIsland, features }) {
  return (
    <group>
      {/* Gold thread connections */}
      <GoldThreadMesh features={features} />
      
      {/* Crystal islands */}
      {ISLAND_CONFIG.map((island) => (
        <CrystalIsland
          key={island.id}
          config={island}
          isActive={activeIsland === island.id}
          onClick={onIslandClick}
          features={features}
        />
      ))}
    </group>
  );
}

// Export configuration for external use
export { getPentagonPosition, PENTAGON_RADIUS };
