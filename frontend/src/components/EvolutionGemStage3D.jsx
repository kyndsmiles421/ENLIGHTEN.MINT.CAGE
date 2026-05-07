/**
 * EvolutionGemStage3D.jsx — V1.1.12 Procedural Gem Viewer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Thin Canvas wrapper around the shared <RefractionGem> primitive.
 * The gem itself now lives in /components/RefractionGem.jsx so the
 * Tesseract Vault speaks the EXACT same procedural-PHI language.
 *
 * crystal_system → solid (octahedron / dodecahedron / icosahedron)
 * stage rank     → emissive intensity, scale, spin rate
 * pulseKey bump  → 1.5s scale + emissive bell on every Polish/Refine/Awaken
 *
 * One Canvas, not one per list item — keeps mobile WebGL stable.
 */
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import RefractionGem, { SOLID_FOR_CRYSTAL_SYSTEM } from './RefractionGem';

/**
 * @param {Object} props
 * @param {Object} props.asset — backend evolution item shape
 * @param {string|number} [props.pulseKey] — change to fire pulse animation
 */
export default function EvolutionGemStage3D({ asset, pulseKey }) {
  if (!asset) return null;
  const color = asset.rarity_color || asset.color || '#A78BFA';
  const stageId = asset.stage?.id || 'raw';
  const crystalSystem = (asset.crystal_system || '').toLowerCase();
  const solid = SOLID_FOR_CRYSTAL_SYSTEM[crystalSystem] || 'icosahedron';
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
          <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
            <RefractionGem
              color={color}
              solid={solid}
              stageId={stageId}
              pulseKey={pulseKey}
              particleAura={particleAura}
            />
          </Float>
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
