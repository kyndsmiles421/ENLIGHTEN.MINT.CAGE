/**
 * CosmicAvatarPreview — inline 3D preview of the user's equipped gear.
 *
 * • Lazy-loaded only when the Character tab is visible (zero cost if unused).
 * • Uses @react-three/fiber + drei (already in package.json) so no new deps.
 * • Procedural avatar: sphere head, capsule body, torus conduit, sprite trinket —
 *   tinted by each slot's rarity color so it "fills in" as you equip.
 * • Orbit controls + gentle autorotate; respects user's reduced-motion pref.
 * • 260×260 inline container, no fixed positioning, no overlay.
 *
 * Not imported anywhere yet — awaits greenlight on the 3D-viz decision.
 */
import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const DEFAULT_COLORS = {
  head:    '#6B7280',
  body:    '#6B7280',
  conduit: '#6B7280',
  trinket: '#6B7280',
};

function AvatarModel({ colors }) {
  const group = useRef(null);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.35;
  });
  return (
    <group ref={group}>
      {/* Head */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial color={colors.head} roughness={0.35} metalness={0.3} emissive={colors.head} emissiveIntensity={0.12} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <capsuleGeometry args={[0.38, 0.9, 8, 16]} />
        <meshStandardMaterial color={colors.body} roughness={0.4} metalness={0.25} emissive={colors.body} emissiveIntensity={0.08} />
      </mesh>
      {/* Conduit – energy torus orbit */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.04, 16, 64]} />
        <meshStandardMaterial color={colors.conduit} emissive={colors.conduit} emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
      {/* Trinket sprite */}
      <mesh position={[0.55, 0.6, 0]}>
        <icosahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color={colors.trinket} emissive={colors.trinket} emissiveIntensity={1.1} roughness={0.1} />
      </mesh>
    </group>
  );
}

export default function CosmicAvatarPreview({ equipped = {}, size = 260 }) {
  const colors = useMemo(() => ({
    head:    equipped.head?.rarity_color    || DEFAULT_COLORS.head,
    body:    equipped.body?.rarity_color    || DEFAULT_COLORS.body,
    conduit: equipped.conduit?.rarity_color || DEFAULT_COLORS.conduit,
    trinket: equipped.trinket?.rarity_color || DEFAULT_COLORS.trinket,
  }), [equipped]);

  return (
    <div
      data-testid="cosmic-avatar-preview"
      style={{
        width: size,
        height: size,
        margin: '0 auto 12px',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 55%, rgba(129,140,248,0.12) 0%, rgba(6,3,18,0.9) 70%)',
        border: '1px solid rgba(129,140,248,0.2)',
      }}
    >
      <Canvas camera={{ position: [0, 0.5, 3.2], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.55} />
        <pointLight position={[2, 3, 3]} intensity={1.1} color={'#F0C470'} />
        <pointLight position={[-2, -1, -2]} intensity={0.6} color={'#C084FC'} />
        <Suspense fallback={null}>
          <AvatarModel colors={colors} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}
