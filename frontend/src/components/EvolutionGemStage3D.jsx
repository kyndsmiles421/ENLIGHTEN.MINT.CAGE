/**
 * EvolutionGemStage3D.jsx — V1.1.11 Procedural Gem Viewer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * One R3F Canvas. Renders the currently-selected EvolutionLab gem
 * as a procedural platonic solid driven by:
 *   • crystal_system → platonic shape (5 solids in CrystallineCore)
 *   • rarity color  → material base + emissive
 *   • stage rank     → emissive intensity + scale + spin rate
 *   • PHI math       → idle bob frequency + scale damping
 *
 * No GLB assets, no static models. Pure math from /utils/SovereignMath
 * and /lib/SacredGeometry primitives that already shipped.
 *
 * One Canvas, not one per list item — keeps mobile WebGL stable.
 * Pulse animation fires on the `pulseKey` prop change so the parent
 * can re-trigger it on every Polish/Refine/Awaken without remount.
 */
import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { PHI, PHI_INV } from '../utils/SovereignMath';

// crystal_system from the backend asset → preferred platonic solid.
// Mirrors CrystallineCore.SACRED_GEOMETRIES element mapping. When the
// asset has no crystal_system or it's an unknown value, fall back to
// icosahedron (Water · Flowing) — the most universally pretty default.
const SOLID_FOR_SYSTEM = {
  isometric:    'octahedron',     // cubic but octahedron reads more gem-like
  cubic:        'octahedron',
  hexagonal:    'icosahedron',
  trigonal:     'icosahedron',
  tetragonal:   'octahedron',
  orthorhombic: 'icosahedron',
  monoclinic:   'dodecahedron',
  triclinic:    'dodecahedron',
  amorphous:    'icosahedron',
};

// Stage rank → emissive intensity boost, scale boost, spin rate.
// raw < refined < transcendental < sovereign. Mirrors the backend
// stages and CRYSTALLINE_STATES enum from CrystallineCore.
const STAGE_PROPS = {
  raw:            { emit: 0.4, scale: 0.95, spin: 0.10 },
  refined:        { emit: 0.9, scale: 1.05, spin: 0.18 },
  transcendental: { emit: 1.6, scale: 1.18, spin: 0.30 },
  sovereign:      { emit: 2.4, scale: 1.30, spin: 0.45 },
};

function Gem({ color, stageId, crystalSystem, pulseKey, particleAura }) {
  const meshRef = useRef();
  const matRef = useRef();
  const pulseStartRef = useRef(null);
  const stageProps = STAGE_PROPS[stageId] || STAGE_PROPS.raw;
  const baseScale = stageProps.scale;
  const baseEmit = stageProps.emit;

  // pulseKey changes → start a 1.5s pulse curve
  useEffect(() => {
    if (pulseKey == null) return;
    pulseStartRef.current = performance.now();
  }, [pulseKey]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Idle: PHI-frequency bob + slow spin (rate from stage)
    meshRef.current.rotation.y = t * stageProps.spin;
    meshRef.current.rotation.x = Math.sin(t * PHI_INV) * 0.15;

    // Pulse: 1.5s ease-out cubic bell. Scale 1 → 1.4 → 1; emissive +1.8 mid.
    let pulseK = 0;
    if (pulseStartRef.current) {
      const elapsed = (performance.now() - pulseStartRef.current) / 1500;
      if (elapsed >= 1) {
        pulseStartRef.current = null;
      } else {
        pulseK = 1 - Math.pow(1 - elapsed, 3); // ease-out cubic
      }
    }
    const pulseScaleBoost = pulseK > 0 ? Math.sin(pulseK * Math.PI) * 0.4 : 0;
    const targetScale = baseScale + pulseScaleBoost;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale), 0.15,
    );

    if (matRef.current) {
      const pulseEmitBoost = pulseK > 0 ? Math.sin(pulseK * Math.PI) * 1.8 : 0;
      matRef.current.emissiveIntensity = baseEmit + pulseEmitBoost;
    }
  });

  // Choose geometry from crystal_system. Memoised so we don't rebuild
  // every frame.
  const geom = useMemo(() => {
    const solid = SOLID_FOR_SYSTEM[(crystalSystem || '').toLowerCase()] || 'icosahedron';
    if (solid === 'octahedron')   return <octahedronGeometry args={[1, 0]} />;
    if (solid === 'dodecahedron') return <dodecahedronGeometry args={[1, 0]} />;
    return <icosahedronGeometry args={[1, 0]} />;
  }, [crystalSystem]);

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        {geom}
        <meshStandardMaterial
          ref={matRef}
          color={color || '#A78BFA'}
          emissive={color || '#A78BFA'}
          emissiveIntensity={baseEmit}
          metalness={0.7}
          roughness={0.18}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* Particle aura ring for transcendental+/sovereign stages */}
      {particleAura && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 1.65, 64]} />
          <meshBasicMaterial color={color || '#A78BFA'} transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      )}
    </Float>
  );
}

/**
 * @param {Object} props
 * @param {Object} props.asset — backend evolution item shape
 * @param {string|number} [props.pulseKey] — change to fire pulse animation
 */
export default function EvolutionGemStage3D({ asset, pulseKey }) {
  if (!asset) return null;
  const color = asset.rarity_color || asset.color || '#A78BFA';
  const stageId = asset.stage?.id || 'raw';
  const crystalSystem = asset.crystal_system;
  const particleAura = !!asset.stage?.particle_aura;

  return (
    <div
      data-testid="evo-gem-stage-3d"
      style={{
        height: 220,
        borderRadius: 14,
        overflow: 'hidden',
        background: `radial-gradient(circle at 50% 50%, ${color}10, rgba(10,10,18,0.6) 70%)`,
        border: `1px solid ${color}25`,
        marginBottom: 14,
        position: 'relative',
      }}
    >
      <Canvas camera={{ position: [0, 0, 3.4], fov: 38 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1.2} color={color} />
        <pointLight position={[-3, -2, 2]} intensity={0.6} color="#ffffff" />
        <Suspense fallback={null}>
          <Gem
            color={color}
            stageId={stageId}
            crystalSystem={crystalSystem}
            pulseKey={pulseKey}
            particleAura={particleAura}
          />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.6}
          rotateSpeed={0.5}
        />
      </Canvas>

      {/* Inline label — Flatland-clean, no overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 14,
          fontFamily: 'monospace',
          fontSize: 9,
          letterSpacing: '0.18em',
          color: 'rgba(248,250,252,0.85)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ color, fontSize: 10, marginBottom: 2 }}>
          {(asset.name || '').toUpperCase()}
        </div>
        <div style={{ opacity: 0.6, fontSize: 8 }}>
          {(asset.crystal_system || 'amorphous').toUpperCase()}
          {' · '}
          {(stageId || 'raw').toUpperCase()}
          {' · '}
          STAGE {asset.stage?.multiplier || 1}×
        </div>
      </div>
    </div>
  );
}
