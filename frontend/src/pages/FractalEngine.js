/**
 * FractalEngine.js — V68.11 Black-Screen-Slayer Rebuild
 *
 * User diagnostic applied (Feb 20, 2026):
 *  - camera={{ fov: 75, position: [0, 0, 5] }}            → pull back, don't sit inside geometry
 *  - <color attach="background" args={['#050505']} />     → clear frame every tick (R3F v9 fix)
 *  - gl={{ antialias: true, alpha: true }}                 → let CSS bg not occlude canvas
 *  - <ambientLight intensity={1.5} /> + <pointLight>       → legacy-lights intensity boost
 *  - frustumCulled={false} on each mesh                    → stop nodes vanishing during orbit
 *
 * Previous crash root cause: <Text> from drei + <Stars> from drei tripped R3F v9's
 * stricter prop reconciler ("x-line-number" error). We now render with plain <mesh>
 * primitives only — no drei components that wrap <primitive object={...}>.
 */
import React, { Suspense, useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// --- Atmospheric intelligence (physics-accurate altitude pressure) ---
const useAtmosphericData = (altitude) => {
  return useMemo(() => {
    const pressure = 101.325 * Math.pow(1 - 2.25577e-5 * altitude, 5.25588);
    return { pressure: pressure.toFixed(2), boil: (100 - altitude / 300).toFixed(1) };
  }, [altitude]);
};

// --- Floating, clickable crystalline node (plain <mesh>, zero drei) ---
function SecureNode({ position, label, altitude, color, onActivate, isActive }) {
  const meshRef = useRef();
  const floatPhase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * 1.2 + floatPhase) * 0.25;
    meshRef.current.rotation.x = t * 0.4;
    meshRef.current.rotation.y = t * 0.6;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      frustumCulled={false}
      onClick={(e) => { e.stopPropagation(); onActivate(); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial
        color={isActive ? color : '#222'}
        wireframe={!isActive}
        emissive={isActive ? color : '#000'}
        emissiveIntensity={isActive ? 0.75 : 0}
      />
    </mesh>
  );
}

// --- HUD data card (plain DOM overlay, not drei/Html) ---
function NodeReadout({ active, nodes }) {
  if (!active) return null;
  const node = nodes.find((n) => n.id === active);
  if (!node) return null;
  const { pressure, boil } = atmos(node.altitude);
  return (
    <div style={{
      position: 'absolute', top: '50%', right: '32px', transform: 'translateY(-50%)',
      background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(14px)',
      border: `1px solid ${node.color}`, borderRadius: '10px',
      padding: '18px 22px', fontFamily: 'monospace', fontSize: '12px',
      letterSpacing: '1.5px', color: '#fff', zIndex: 6,
      minWidth: '220px', boxShadow: `0 0 40px ${node.color}44`,
    }}>
      <div style={{ color: node.color, fontWeight: 700, marginBottom: '10px', fontSize: '13px' }}>
        {node.label.toUpperCase()}
      </div>
      <div style={{ opacity: 0.65, marginBottom: '4px' }}>STATUS <span style={{ float: 'right', color: '#00ffcc' }}>ENCRYPTED</span></div>
      <div style={{ opacity: 0.65, marginBottom: '4px' }}>ALTITUDE <span style={{ float: 'right' }}>{node.altitude}m</span></div>
      <div style={{ opacity: 0.65, marginBottom: '4px' }}>PRESSURE <span style={{ float: 'right' }}>{pressure} kPa</span></div>
      <div style={{ opacity: 0.65 }}>BOIL POINT <span style={{ float: 'right' }}>{boil}°C</span></div>
    </div>
  );
}
// atmospheric helper shared with NodeReadout (so it stays pure & non-hook)
function atmos(altitude) {
  const pressure = 101.325 * Math.pow(1 - 2.25577e-5 * altitude, 5.25588);
  return { pressure: pressure.toFixed(2), boil: (100 - altitude / 300).toFixed(1) };
}

// --- 2000-star plain-BufferGeometry starfield (replaces drei/Stars) ---
function Starfield({ count = 2000 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 30 + Math.random() * 70;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.01;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#ffffff" sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

// --- SYSTEM ---
export default function FractalEngine() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (typeof window.__workAccrue === 'function') window.__workAccrue('fractal', 8);
  }, []);

  const displayName = user?.name || user?.email?.split('@')[0] || 'SOVEREIGN';

  const nodes = [
    { id: 'wellness', position: [-3.2, 0.8, 0], label: 'Wellness Engine', altitude: 1100, color: '#00ffcc' },
    { id: 'core', position: [0, -0.8, 0], label: 'Fractal Core', altitude: 1500, color: '#ff00ff' },
    { id: 'culinary', position: [3.2, 0.8, 0], label: 'Culinary Logic', altitude: 975, color: '#ffff00' },
  ];

  return (
    <div data-testid="fractal-engine-page" style={{ width: '100vw', height: '100vh', background: '#050505', position: 'relative', overflow: 'hidden' }}>
      {/* HUD */}
      <div style={{
        position: 'absolute', top: '18px', left: '18px', zIndex: 5,
        color: '#00ffcc', fontFamily: 'monospace', fontSize: '12px',
        letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <button
          type="button"
          onClick={() => navigate('/sovereign-hub')}
          data-testid="fractal-engine-back"
          style={{ background: 'transparent', border: '1px solid rgba(0,255,204,0.4)', color: '#00ffcc', cursor: 'pointer', padding: '6px 10px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={14} /> HUB
        </button>
        <span>FRACTAL ENGINE ACTIVE · {displayName.toUpperCase()}</span>
      </div>

      {/* Bottom hint */}
      <div style={{
        position: 'absolute', bottom: '140px', left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(0,255,204,0.6)', fontFamily: 'monospace', fontSize: '11px',
        letterSpacing: '3px', zIndex: 5, pointerEvents: 'none',
      }}>
        CLICK A NODE TO DECRYPT
      </div>

      {/* Readout */}
      <NodeReadout active={activeId} nodes={nodes} />

      {/* 3D Canvas — applied user's diagnostic: fov 75, z=5, alpha, bg, boosted lights */}
      <Canvas
        camera={{ fov: 75, position: [0, 0, 5], near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050505']} />

        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-10, -10, 10]} intensity={0.6} color="#00ffcc" />

        <Suspense fallback={null}>
          <Starfield count={2000} />
          {nodes.map((n) => (
            <SecureNode
              key={n.id}
              position={n.position}
              label={n.label}
              altitude={n.altitude}
              color={n.color}
              isActive={activeId === n.id}
              onActivate={() => setActiveId(activeId === n.id ? null : n.id)}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}
