/**
 * Forge3D.js — V1.0.17 Real Gear Ratio Mesh
 *
 * Renders 3 inter-meshing 3D gears in R3F. The angular velocity of
 * each gear is the LITERAL output of
 * engines/MechanicalSovereignty.calculateMechanicalAdvantage().
 *
 * ω₂ = ω₁ · (N₁ / N₂)   (Euler/Galileo gear-ratio law)
 *
 * Driver gear spins at constant ω₁. Each downstream gear's ω is
 * computed from the wheel/axle MA returned by the engine — so the
 * 3D rotation is the visible output of the math, not an animation
 * placeholder.
 *
 * Flatland: inline, no overlay. Sequential FOLD UP pill at bottom.
 */
import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import MechanicalSovereignty from '../engines/MechanicalSovereignty';
import { ChevronUp, Cog, Gauge } from 'lucide-react';

const { calculateMechanicalAdvantage } = MechanicalSovereignty;

// One gear with N teeth, computed radius
function buildGearGeometry(teeth, innerR = 0.5, outerR = 0.7) {
  const shape = new THREE.Shape();
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? outerR : outerR + 0.06;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  // Center hole
  const hole = new THREE.Path();
  hole.absarc(0, 0, innerR * 0.4, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  geo.center();
  return geo;
}

function Gear({ teeth, radius, position, color, omega, label }) {
  const ref = useRef();
  const geom = useMemo(() => buildGearGeometry(teeth, radius * 0.5, radius), [teeth, radius]);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.z += omega * dt;
  });
  return (
    <mesh ref={ref} position={position} geometry={geom}>
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} emissive={color} emissiveIntensity={0.15} />
    </mesh>
  );
}

export default function Forge3D({ onClose, color = '#FB7185', running = true }) {
  // Driver gear teeth + downstream — these become the math inputs
  const driverTeeth = 18;
  const middleTeeth = 12;
  const finalTeeth = 36;
  const omega1 = running ? 1.5 : 0;  // rad/s

  // Use calculateMechanicalAdvantage to derive ω for downstream gears.
  // The wheel_axle case fits gear ratios: ω₂ = ω₁ · (N₁/N₂)
  const advMid = useMemo(() => calculateMechanicalAdvantage('wheel_axle', { wheel_radius: driverTeeth, axle_radius: middleTeeth }), []);
  const advFinal = useMemo(() => calculateMechanicalAdvantage('wheel_axle', { wheel_radius: middleTeeth, axle_radius: finalTeeth }), []);

  // ω₂ = ω₁ × (N₁/N₂). Direction alternates because meshing gears spin opposite
  const omega2 = -omega1 * parseFloat(advMid.mechanical_advantage);
  const omega3 = -omega2 * parseFloat(advFinal.mechanical_advantage);

  // RPM display (60 / 2π × ω)
  const rpm = (w) => Math.round((60 / (Math.PI * 2)) * Math.abs(w) * 10) / 10;

  return (
    <div
      data-testid="forge-3d"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 460,
        borderRadius: 16,
        overflow: 'hidden',
        background: `radial-gradient(circle at 50% 30%, ${color}18 0%, transparent 60%), linear-gradient(180deg, rgba(8,4,10,0.96) 0%, rgba(2,3,10,0.98) 100%)`,
        border: `1px solid ${color}26`,
        marginBottom: 16,
      }}
    >
      <div style={{
        padding: '14px 16px 10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        borderBottom: `1px solid ${color}15`, gap: 8, flexWrap: 'wrap',
      }}>
        <div style={{ fontFamily: 'monospace', color }}>
          <div style={{ fontSize: 11, letterSpacing: 2 }}>THE FORGE · GEAR TRAIN</div>
          <div style={{ fontSize: 9, letterSpacing: 1.5, opacity: 0.6, marginTop: 2 }}>
            ω₂ = ω₁ · (N₁/N₂) · LIVE MATH → MESH
          </div>
        </div>
        <div style={{ display: 'inline-flex', gap: 6, fontFamily: 'monospace', fontSize: 9, color: `${color}cc` }}>
          <Cog size={10} /> {driverTeeth}T → {middleTeeth}T → {finalTeeth}T
        </div>
      </div>

      <div style={{ width: '100%', height: 360, position: 'relative' }}>
        <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} dpr={[1, 1.75]} data-testid="forge-3d-canvas">
          <ambientLight intensity={0.4} />
          <directionalLight position={[2, 3, 5]} intensity={0.9} castShadow />
          <pointLight position={[-2, 1, 1]} intensity={0.5} color={color} />
          <Suspense fallback={null}>
            <Environment preset="warehouse" />
          </Suspense>
          {/* Driver — large, top-left */}
          <Gear teeth={driverTeeth} radius={0.85} position={[-1.4, 0.5, 0]} color="#FCD34D" omega={omega1} label="ω₁" />
          {/* Middle — small, between (touches both) */}
          <Gear teeth={middleTeeth} radius={0.55} position={[0, -0.05, 0]} color={color} omega={omega2} label="ω₂" />
          {/* Final — large, bottom-right */}
          <Gear teeth={finalTeeth} radius={1.3} position={[1.7, -0.65, 0]} color="#A78BFA" omega={omega3} label="ω₃" />

          <OrbitControls enablePan={false} minDistance={3} maxDistance={8} enableDamping />
        </Canvas>

        {/* RPM HUD — inline overlay inside canvas (not a modal) */}
        <div data-testid="forge-3d-rpm-hud" style={{
          position: 'absolute', bottom: 10, left: 10, right: 10,
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'monospace', fontSize: 9, color: `${color}cc`,
          pointerEvents: 'none', letterSpacing: 1.5,
        }}>
          <span><Gauge size={10} style={{ verticalAlign: 'middle' }} /> ω₁: {rpm(omega1)} RPM</span>
          <span>ω₂: {rpm(omega2)} RPM</span>
          <span>ω₃: {rpm(omega3)} RPM</span>
        </div>
      </div>

      <div style={{ padding: '10px 16px', borderTop: `1px solid ${color}10`, fontFamily: 'monospace', fontSize: 9.5, color: `${color}cc`, lineHeight: 1.5 }}>
        <div>MID GEAR  → MA = {advMid.mechanical_advantage} · {advMid.resonance_status}</div>
        <div>FINAL GEAR → MA = {advFinal.mechanical_advantage} · {advFinal.resonance_status}</div>
      </div>

      {onClose && (
        <div style={{ padding: '8px 16px 12px', textAlign: 'center', borderTop: `1px solid ${color}10` }}>
          <button
            type="button"
            onClick={onClose}
            data-testid="forge-3d-fold"
            style={{
              background: 'transparent',
              border: `1px solid ${color}30`,
              color: `${color}cc`,
              padding: '5px 12px',
              borderRadius: 999,
              fontFamily: 'monospace',
              fontSize: 8.5,
              letterSpacing: 2,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            <ChevronUp size={10} /> FOLD UP
          </button>
        </div>
      )}
    </div>
  );
}
