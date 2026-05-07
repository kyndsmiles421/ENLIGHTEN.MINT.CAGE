/**
 * RefractionGem.jsx — V1.1.12 Unified Sovereign Refraction Primitive
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * One in-canvas mesh that speaks the same procedural-PHI language
 * across the entire OS. Used by:
 *   • EvolutionGemStage3D (Lab — driven by crystal_system + stage)
 *   • TesseractVault Relic (Vault — driven by tier + claimed state)
 *
 * A gem polished in the Lab arrives in the Vault as the EXACT same
 * lattice it was forged from. That's the unification mandate from
 * the Architect's V1.1.12 brief.
 *
 * No GLB assets — pure platonic solids deformed by 9x9 gear ratios
 * (PHI / PHI_INV from SovereignMath). The shape comes from a
 * `solid` prop ('icosahedron' | 'octahedron' | 'dodecahedron') so
 * callers can derive it from crystal_system OR from a deterministic
 * hash of an asset id (Vault relics).
 *
 * Stage rank → emissive intensity, scale, spin rate. pulseKey change
 * fires a 1.5s ease-out cubic pulse (scale + emissive bell). This is
 * the same curve the Lab uses on Polish/Refine/Awaken AND the same
 * curve the Vault uses on relic claim — so the system reads as a
 * single living organism.
 */
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PHI, PHI_INV } from '../utils/SovereignMath';

// crystal_system → preferred platonic solid. Mirrors the mapping that
// shipped in EvolutionGemStage3D V1.1.11.
export const SOLID_FOR_CRYSTAL_SYSTEM = {
  isometric:    'octahedron',
  cubic:        'octahedron',
  hexagonal:    'icosahedron',
  trigonal:     'icosahedron',
  tetragonal:   'octahedron',
  orthorhombic: 'icosahedron',
  monoclinic:   'dodecahedron',
  triclinic:    'dodecahedron',
  amorphous:    'icosahedron',
};

// Deterministic shape pick from any string id — used by the Vault
// where relics have no crystal_system. Three solids cycle in a
// PHI-weighted hash so visually similar ids don't all land on the
// same shape.
export function solidForId(id) {
  if (!id) return 'icosahedron';
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const idx = Math.abs(Math.floor(h * PHI_INV)) % 3;
  return ['icosahedron', 'octahedron', 'dodecahedron'][idx];
}

// Stage rank → emissive intensity boost, scale boost, spin rate.
// raw < refined < transcendental < sovereign.
export const STAGE_PROPS = {
  raw:            { emit: 0.4, scale: 0.95, spin: 0.10 },
  refined:        { emit: 0.9, scale: 1.05, spin: 0.18 },
  transcendental: { emit: 1.6, scale: 1.18, spin: 0.30 },
  sovereign:      { emit: 2.4, scale: 1.30, spin: 0.45 },
};

/**
 * In-canvas component. Must be rendered INSIDE an existing <Canvas>.
 *
 * @param {Object}   props
 * @param {string}   [props.color]       — base + emissive color
 * @param {string}   [props.solid]       — 'icosahedron' | 'octahedron' | 'dodecahedron'
 * @param {string}   [props.stageId]     — 'raw' | 'refined' | 'transcendental' | 'sovereign'
 * @param {number}   [props.radius=1]    — scale of the gem
 * @param {*}        [props.pulseKey]    — change to fire pulse animation
 * @param {boolean}  [props.particleAura]
 * @param {THREE.Texture|null} [props.map] — optional texture (Vault uses AI-generated maps)
 * @param {Function} [props.onClick]
 * @param {Function} [props.onPointerOver]
 * @param {Function} [props.onPointerOut]
 */
export default function RefractionGem({
  color = '#A78BFA',
  solid = 'icosahedron',
  stageId = 'raw',
  radius = 1,
  pulseKey,
  particleAura = false,
  map = null,
  onClick,
  onPointerOver,
  onPointerOut,
}) {
  const meshRef = useRef();
  const matRef = useRef();
  const pulseStartRef = useRef(null);
  const stageProps = STAGE_PROPS[stageId] || STAGE_PROPS.raw;
  const baseScale = stageProps.scale * radius;
  const baseEmit = stageProps.emit;

  useEffect(() => {
    if (pulseKey == null) return;
    pulseStartRef.current = performance.now();
  }, [pulseKey]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // PHI-frequency idle bob + spin (rate from stage)
    meshRef.current.rotation.y = t * stageProps.spin;
    meshRef.current.rotation.x = Math.sin(t * PHI_INV) * 0.15;

    // Pulse: 1.5s ease-out cubic bell.
    let pulseK = 0;
    if (pulseStartRef.current) {
      const elapsed = (performance.now() - pulseStartRef.current) / 1500;
      if (elapsed >= 1) {
        pulseStartRef.current = null;
      } else {
        pulseK = 1 - Math.pow(1 - elapsed, 3);
      }
    }
    const pulseScaleBoost = pulseK > 0 ? Math.sin(pulseK * Math.PI) * 0.4 * radius : 0;
    const targetScale = baseScale + pulseScaleBoost;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale), 0.15,
    );

    if (matRef.current) {
      const pulseEmitBoost = pulseK > 0 ? Math.sin(pulseK * Math.PI) * 1.8 : 0;
      matRef.current.emissiveIntensity = baseEmit + pulseEmitBoost;
    }
  });

  const geom = useMemo(() => {
    if (solid === 'octahedron')   return <octahedronGeometry args={[1, 0]} />;
    if (solid === 'dodecahedron') return <dodecahedronGeometry args={[1, 0]} />;
    return <icosahedronGeometry args={[1, 0]} />;
  }, [solid]);

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        {geom}
        <meshStandardMaterial
          ref={matRef}
          color={map ? '#ffffff' : color}
          map={map || null}
          emissive={color}
          emissiveIntensity={baseEmit}
          metalness={map ? 0.45 : 0.7}
          roughness={map ? 0.4 : 0.18}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* Particle aura ring for transcendental+/sovereign or just-unlocked */}
      {particleAura && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6 * radius, 1.65 * radius, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// PHI re-export so callers don't need a separate import path.
export { PHI };
