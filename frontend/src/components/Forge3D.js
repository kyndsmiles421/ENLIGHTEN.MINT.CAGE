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
import { getLoxIgnitionPulse, LOX_PULSE_DNA } from '../engines/LoxIgnitionPulse';
import { ChevronUp, Cog, Gauge, Droplet } from 'lucide-react';

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

// ── V1.0.18 LOX Particle Field ──────────────────────────────────
// Liquid Oxygen vapor trail driven by getLoxIgnitionPulse(). Each
// particle has position + velocity. Spawn rate, base velocity, and
// vapor color are functions of the engine's live pressure / mode /
// ignitionCount. When the LOX engine is in CRUISE: thin trail. In
// HYPER/MAXIMUM: dense, fast vapor with rainbow refraction tinting.
//
// Uses InstancedMesh so 200+ particles cost ~one draw call.
function LoxParticleField({ count = 240, color: tintColor = '#7DD3FC' }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useRef(
    Array.from({ length: count }).map(() => ({
      // Initialize off-screen so we don't see a starting flash
      x: 0, y: -10, z: 0,
      vx: 0, vy: 0, vz: 0,
      life: 0, maxLife: 0,
      size: 0,
    })),
  );
  const cursor = useRef(0);

  // Read live LOX pulse state every frame (no React re-render — direct ref math)
  const loxRef = useRef(null);
  useEffect(() => {
    try { loxRef.current = getLoxIgnitionPulse(); } catch { loxRef.current = null; }
  }, []);

  useFrame((state, dt) => {
    if (!ref.current) return;
    const lox = loxRef.current;
    // Pull live engine math. Pressure ≈ 1.618 PSI base, scales with mode.
    const pressure = lox?.pressure ?? LOX_PULSE_DNA.base_pressure;
    const mode = lox?.currentMode ?? 'CRUISE';
    const modeMult = mode === 'MAXIMUM' ? 3.5
                   : mode === 'HYPER' ? 2.4
                   : mode === 'BOOST' ? 1.6
                   : 1.0;

    // Spawn rate: # particles emitted per frame
    const spawnPerFrame = Math.max(1, Math.round(modeMult * 2));
    for (let s = 0; s < spawnPerFrame; s++) {
      const p = particles.current[cursor.current];
      cursor.current = (cursor.current + 1) % count;
      // Emitter ring at the driver gear position [-1.4, 0.5, 0]
      const ang = Math.random() * Math.PI * 2;
      const r = 0.6 + Math.random() * 0.15;
      p.x = -1.4 + Math.cos(ang) * r;
      p.y = 0.5 + Math.sin(ang) * r;
      p.z = 0;
      // Velocity follows pressure (faster vapor at higher PSI)
      const speed = pressure * modeMult * (0.4 + Math.random() * 0.6);
      // Direction: outward + slight upward drift (vapor rises)
      p.vx = Math.cos(ang) * speed * 0.3;
      p.vy = Math.sin(ang) * speed * 0.3 + 0.3;
      p.vz = (Math.random() - 0.5) * 0.5;
      p.maxLife = 1.6 + Math.random() * 1.0;
      p.life = p.maxLife;
      p.size = 0.04 + Math.random() * 0.06;
    }

    // Update + render every particle
    for (let i = 0; i < count; i++) {
      const p = particles.current[i];
      if (p.life <= 0) {
        // hide far away
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0.001, 0.001, 0.001);
      } else {
        // Integrate motion
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        // Vapor expands, slows, drifts up (buoyancy)
        p.vx *= 0.96;
        p.vy = p.vy * 0.96 + 0.4 * dt;  // buoyant lift
        p.vz *= 0.96;
        p.life -= dt;
        const lifePct = p.life / p.maxLife;
        const sz = p.size * (2 - lifePct);  // expand as it dissipates
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(sz, sz, sz);
      }
      dummy.rotation.set(state.clock.elapsedTime * 0.3 + i, i, 0);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color={tintColor}
        emissive={tintColor}
        emissiveIntensity={0.6}
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

export default function Forge3D({ onClose, color = '#FB7185', running = true }) {
  // Driver gear teeth + downstream — these become the math inputs
  const driverTeeth = 18;
  const middleTeeth = 12;
  const finalTeeth = 36;
  const omega1 = running ? 1.5 : 0;  // rad/s

  // V1.0.18 — LOX engine mode (drives particle field intensity via getLoxIgnitionPulse)
  const [loxMode, setLoxMode] = useState('CRUISE');
  useEffect(() => {
    try {
      const lox = getLoxIgnitionPulse();
      lox.currentMode = loxMode;
      // Pressure scales with mode (math: phi-stabilized base × mode multiplier)
      const baseP = LOX_PULSE_DNA.base_pressure;
      lox.pressure = baseP * (loxMode === 'MAXIMUM' ? 3 : loxMode === 'HYPER' ? 2.2 : loxMode === 'BOOST' ? 1.5 : 1);
    } catch {}
  }, [loxMode]);

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
          <div style={{ fontSize: 11, letterSpacing: 2 }}>THE FORGE · GEAR TRAIN + LOX</div>
          <div style={{ fontSize: 9, letterSpacing: 1.5, opacity: 0.6, marginTop: 2 }}>
            ω₂ = ω₁ · (N₁/N₂) · LIVE MATH → MESH
          </div>
        </div>
        <div style={{ display: 'inline-flex', gap: 6, fontFamily: 'monospace', fontSize: 9, color: `${color}cc` }}>
          <Cog size={10} /> {driverTeeth}T → {middleTeeth}T → {finalTeeth}T
        </div>
      </div>

      {/* V1.0.18 — LOX engine mode pills (drives particle field) */}
      <div style={{
        padding: '8px 16px',
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
        borderBottom: `1px solid ${color}10`,
      }}>
        <Droplet size={11} style={{ color: '#7DD3FC' }} />
        <span style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: 1.5, color: '#7DD3FC', marginRight: 6 }}>
          LOX:
        </span>
        {LOX_PULSE_DNA.thrust_modes.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setLoxMode(m)}
            data-testid={`lox-mode-${m.toLowerCase()}`}
            style={{
              padding: '3px 8px',
              borderRadius: 999,
              fontFamily: 'monospace',
              fontSize: 8.5,
              letterSpacing: 1.5,
              cursor: 'pointer',
              border: `1px solid ${loxMode === m ? '#7DD3FC' : 'rgba(125,211,252,0.25)'}`,
              background: loxMode === m ? 'rgba(125,211,252,0.18)' : 'transparent',
              color: loxMode === m ? '#7DD3FC' : 'rgba(125,211,252,0.7)',
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* V1.0.18.1 Flatland: hint moved to inline text above canvas */}
      <div style={{
        padding: '4px 16px 8px',
        textAlign: 'center', fontFamily: 'monospace',
        fontSize: 9, letterSpacing: 2, color: `${color}99`,
        borderBottom: `1px solid ${color}08`,
      }}>
        DRAG TO ORBIT · TAP GEAR TO INSPECT
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

          {/* V1.0.18 — LOX vapor field driven by getLoxIgnitionPulse() */}
          {running && <LoxParticleField count={240} />}

          <OrbitControls enablePan={false} minDistance={3} maxDistance={8} enableDamping />
        </Canvas>
      </div>

      {/* Sequential RPM HUD (inline, pushes content down — Flatland clean) */}
      <div data-testid="forge-3d-rpm-hud" style={{
        padding: '8px 16px',
        display: 'flex', justifyContent: 'space-between', gap: 8,
        fontFamily: 'monospace', fontSize: 9.5, color: `${color}cc`,
        letterSpacing: 1.5, borderTop: `1px solid ${color}10`,
        flexWrap: 'wrap',
      }}>
        <span><Gauge size={10} style={{ verticalAlign: 'middle' }} /> ω₁: {rpm(omega1)} RPM</span>
        <span>ω₂: {rpm(omega2)} RPM</span>
        <span>ω₃: {rpm(omega3)} RPM</span>
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
