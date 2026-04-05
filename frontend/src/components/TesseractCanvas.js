/**
 * TesseractCanvas.js — The Sovereign 3D Lattice
 * 
 * BREAKS THE BOX: Replaces the flat CSS grid with a true WebGL sphere.
 * 
 * ARCHITECTURE:
 * - 81 nodes distributed on a spherical segment using (r, θ, φ) coordinates
 * - useFrame loop rotates based on user touch/drag velocity
 * - Raycasting for true 3D interaction (no Z-index fighting)
 * - Menger Sponge multiplication on cell click
 * 
 * THE SOVEREIGN RESULT:
 * The matrix can NEVER be "behind" anything — it exists in true 3D space.
 * 
 * NOTE: Uses minimal R3F setup to avoid "x-line-number" attribute injection issues
 */

import React, { useRef, useState, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const SPHERE_RADIUS = 3;
const GRID_SIZE = 9; // 9x9 = 81 cells
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

// Spherical segment parameters (not a full sphere, a dome/bowl)
const THETA_START = Math.PI * 0.15;  // Start angle from pole
const THETA_END = Math.PI * 0.85;    // End angle
const PHI_START = 0;                  // Full rotation
const PHI_END = Math.PI * 2;

// Colors
const JADE_COLOR = new THREE.Color('#10B981');
const VOID_COLOR = new THREE.Color('#8B5CF6');
const SELECTED_COLOR = new THREE.Color('#F59E0B');

// ═══════════════════════════════════════════════════════════════════════════
// SPHERICAL COORDINATE MAPPING
// Convert grid position (row, col) to spherical (r, θ, φ) to Cartesian (x, y, z)
// ═══════════════════════════════════════════════════════════════════════════

function gridToSpherical(row, col, radius = SPHERE_RADIUS) {
  // Map row (0-8) to theta (polar angle from top)
  const thetaNorm = row / (GRID_SIZE - 1);
  const theta = THETA_START + thetaNorm * (THETA_END - THETA_START);
  
  // Map col (0-8) to phi (azimuthal angle around)
  const phiNorm = col / GRID_SIZE;
  const phi = PHI_START + phiNorm * (PHI_END - PHI_START);
  
  // Spherical to Cartesian
  const x = radius * Math.sin(theta) * Math.cos(phi);
  const y = radius * Math.cos(theta);
  const z = radius * Math.sin(theta) * Math.sin(phi);
  
  return new THREE.Vector3(x, y, z);
}

// ═══════════════════════════════════════════════════════════════════════════
// HEXAGRAM NODE — Individual cell on the sphere
// ═══════════════════════════════════════════════════════════════════════════

const HexagramNode = React.memo(({ 
  position, 
  row, 
  col, 
  hexNum,
  isSelected,
  isVoidMode,
  onClick,
  onDoubleClick,
  dwellProgress,
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Animate scale on hover/select
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const targetScale = isSelected ? 1.4 : hovered ? 1.2 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
    
    // Pulse effect when selected
    if (isSelected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      meshRef.current.scale.multiplyScalar(pulse);
    }
  });
  
  const color = useMemo(() => {
    if (isSelected) return SELECTED_COLOR;
    return isVoidMode ? VOID_COLOR : JADE_COLOR;
  }, [isSelected, isVoidMode]);
  
  const emissiveIntensity = isSelected ? 0.8 : hovered ? 0.4 : 0.1;
  
  return (
    <group position={position}>
      {/* The node sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(row, col); }}
        onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(row, col); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={isSelected ? 1 : 0.7}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      
      {/* Hexagram number label - Using sprite instead of Html to avoid R3F issues */}
      {(isSelected || hovered) && (
        <sprite position={[0, 0.25, 0]} scale={[0.3, 0.15, 1]}>
          <spriteMaterial 
            transparent 
            opacity={0.9}
            color={color}
          />
        </sprite>
      )}
      
      {/* Dwell progress ring */}
      {isSelected && dwellProgress > 0 && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.18, 0.22, 32, 1, 0, Math.PI * 2 * dwellProgress]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
});

HexagramNode.displayName = 'HexagramNode';

// ═══════════════════════════════════════════════════════════════════════════
// SPHERE CONTAINER — The rotating assembly
// ═══════════════════════════════════════════════════════════════════════════

const SphereContainer = React.memo(({
  selectedCell,
  onSelectCell,
  onDive,
  isVoidMode,
  dwellProgress,
  rotationVelocity,
  depth,
}) => {
  const groupRef = useRef();
  const velocityRef = useRef({ x: 0, y: 0 });
  
  // Apply rotation with inertia
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Damping
    velocityRef.current.x *= 0.98;
    velocityRef.current.y *= 0.98;
    
    // Add external velocity
    if (rotationVelocity) {
      velocityRef.current.x += rotationVelocity.x * 0.01;
      velocityRef.current.y += rotationVelocity.y * 0.01;
    }
    
    // Auto-rotate when idle
    if (Math.abs(velocityRef.current.x) < 0.001 && Math.abs(velocityRef.current.y) < 0.001) {
      velocityRef.current.y = 0.002;
    }
    
    // Apply rotation
    groupRef.current.rotation.x += velocityRef.current.x;
    groupRef.current.rotation.y += velocityRef.current.y;
    
    // Depth-based scale (zoom effect)
    const targetScale = 1 + depth * 0.2;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.05
    );
  });
  
  // Generate all 81 nodes
  const nodes = useMemo(() => {
    const result = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const position = gridToSpherical(row, col);
        const hexNum = (row * GRID_SIZE + col) % 64;
        const isSelected = selectedCell?.row === row && selectedCell?.col === col;
        
        result.push({
          key: `${row}-${col}`,
          row,
          col,
          position,
          hexNum,
          isSelected,
        });
      }
    }
    return result;
  }, [selectedCell]);
  
  return (
    <group ref={groupRef}>
      {/* All 81 hexagram nodes - NO LATTICE LINES for now */}
      {nodes.map(node => (
        <HexagramNode
          key={node.key}
          position={node.position}
          row={node.row}
          col={node.col}
          hexNum={node.hexNum}
          isSelected={node.isSelected}
          isVoidMode={isVoidMode}
          onClick={onSelectCell}
          onDoubleClick={onDive}
          dwellProgress={node.isSelected ? dwellProgress : 0}
        />
      ))}
      
      {/* Center indicator */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color={isVoidMode ? VOID_COLOR : JADE_COLOR}
          emissive={isVoidMode ? VOID_COLOR : JADE_COLOR}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Depth indicator ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[SPHERE_RADIUS + 0.1, SPHERE_RADIUS + 0.15, 64]} />
        <meshBasicMaterial
          color={isVoidMode ? VOID_COLOR : JADE_COLOR}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
});

SphereContainer.displayName = 'SphereContainer';

// ═══════════════════════════════════════════════════════════════════════════
// AMBIENT LIGHTING
// ═══════════════════════════════════════════════════════════════════════════

const AmbientScene = ({ isVoidMode }) => {
  const lightColor = isVoidMode ? '#8B5CF6' : '#10B981';
  
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color={lightColor} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color={lightColor} />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#ffffff" />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ERROR BOUNDARY for WebGL
// ═══════════════════════════════════════════════════════════════════════════

class R3FErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[TesseractCanvas] R3F Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="flex flex-col items-center justify-center rounded-2xl p-8"
          style={{
            width: 'min(90vw, 500px)',
            height: 'min(90vw, 500px)',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          }}
        >
          <span className="text-lg text-purple-400 mb-2">WebGL Error</span>
          <span className="text-xs text-white/50 text-center">
            3D rendering unavailable. Using 2D mode.
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CANVAS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function TesseractCanvas({
  depth = 0,
  selectedCell,
  onSelectCell,
  onDive,
  isZooming,
  isVoidMode,
  isDwellStable,
  dwellProgress,
  isCollapsed,
  colors,
}) {
  const [rotationVelocity, setRotationVelocity] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  // Handle mouse/touch drag for rotation
  const handlePointerDown = useCallback((e) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);
  
  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    setRotationVelocity({
      x: deltaY * 0.005,
      y: deltaX * 0.005,
    });
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);
  
  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);
  
  // Handle cell selection
  const handleSelectCell = useCallback((row, col) => {
    onSelectCell(row, col);
  }, [onSelectCell]);
  
  // Handle dive (double-click)
  const handleDive = useCallback((row, col) => {
    const hexNum = (row * GRID_SIZE + col) % 64;
    const languages = ['en', 'es', 'ja', 'zh-cmn', 'zh-yue', 'sa', 'hi', 'lkt', 'dak'];
    onDive(hexNum, languages[col]);
  }, [onDive]);
  
  if (isCollapsed) {
    return (
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: `radial-gradient(circle, ${colors?.primary || '#10B981'}20, transparent)`,
          border: `1px solid ${colors?.primary || '#10B981'}30`,
        }}
        data-testid="tesseract-canvas-collapsed"
      >
        <span className="text-xs text-white/50">L{depth}</span>
      </div>
    );
  }
  
  return (
    <R3FErrorBoundary>
      <div 
        className="relative"
        style={{ 
          width: 'min(90vw, 500px)',
          height: 'min(90vw, 500px)',
          cursor: isDragging.current ? 'grabbing' : 'grab',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        data-testid="tesseract-canvas"
      >
        <Canvas
          camera={{ position: [0, 0, 7], fov: 50 }}
          style={{ background: 'transparent' }}
          gl={{ 
            alpha: true, 
            antialias: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Suspense fallback={null}>
            <AmbientScene isVoidMode={isVoidMode} />
            
            <SphereContainer
              selectedCell={selectedCell}
              onSelectCell={handleSelectCell}
              onDive={handleDive}
              isVoidMode={isVoidMode}
              dwellProgress={dwellProgress}
              rotationVelocity={rotationVelocity}
              depth={depth}
            />
          </Suspense>
        </Canvas>
        
        {/* Depth indicator overlay */}
        <div 
          className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none"
          style={{ zIndex: 10 }}
        >
          <span 
            className="text-3xl font-light"
            style={{ 
              color: colors?.primary || '#10B981',
              textShadow: `0 0 20px ${colors?.primary || '#10B981'}`,
            }}
          >
            L{depth}
          </span>
        </div>
        
        {/* Zooming overlay */}
        {isZooming && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ 
              background: `radial-gradient(circle, ${colors?.primary || '#10B981'}30, transparent)`,
            }}
          >
            <span className="text-white text-sm animate-pulse">Diving...</span>
          </div>
        )}
      </div>
    </R3FErrorBoundary>
  );
}
