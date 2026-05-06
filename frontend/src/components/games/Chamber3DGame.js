/**
 * Chamber3DGame.js — V1.0.14 True 3D Geology Workshop
 *
 * Real-time R3F replacement for ChamberMiniGame's "break" mode when
 * the user is in a rock/mineral workshop. Renders an actual 3D rock
 * crystal you can orbit, zoom, and strike. Each strike spawns
 * fragment shards that scatter with physics-style decay; the
 * crystal cracks, then shatters when hits-per-target is reached.
 *
 * Same props API as ChamberMiniGame so UniversalWorkshop can swap
 * in/out without other downstream consumers caring.
 *
 * Flatland: NO position:fixed, NO modal overlay, NO X-close in the
 * top-right corner. Renders inline in the workshop card. The user
 * folds it back up via a sequential "DONE" pill at the bottom.
 *
 * Backend hooks: same /api/sparks/immersion calls as the 2D version
 * so XP / Sparks accrual is identical.
 */
import React, { useEffect, useMemo, useRef, useState, useCallback, Suspense } from 'react';
import axios from 'axios';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PresentationControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Sparkles, ChevronUp } from 'lucide-react';
import { goldenSpiralPoints, GRID_SIZE, toroidalDisplacement } from '../../lib/SacredGeometry';
import { PHI, PHI_SQ } from '../../utils/SovereignMath';
import { getLoxIgnitionPulse } from '../../engines/LoxIgnitionPulse';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function creditSparks(zone, seconds) {
  const token = localStorage.getItem('zen_token');
  if (!token || token === 'guest_token') return;
  axios.post(
    `${API}/sparks/immersion`,
    { seconds, zone },
    { headers: { Authorization: `Bearer ${token}` } },
  ).catch(() => {});
  try { window.dispatchEvent(new CustomEvent('sovereign:immersion-tick')); } catch {}
}

function haptic() {
  try { if (navigator.vibrate) navigator.vibrate(15); } catch {}
}

// ── V1.0.15 Sage Voice Reaction Hook ────────────────────────────
// Listens to existing window event bus (no new Provider needed).
// When Sage speaks — `sage:narrate` is dispatched — the active 3D
// mesh receives a pulse (vertex displacement intensity spike + emissive
// flash). Decays over ~700ms.
function useSageReaction() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    let raf;
    const decay = () => {
      setPulse((p) => {
        const next = Math.max(0, p - 0.03);
        if (next > 0) raf = requestAnimationFrame(decay);
        return next;
      });
    };
    const onSage = () => {
      setPulse(1);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(decay);
    };
    window.addEventListener('sage:narrate', onSage);
    window.addEventListener('SOVEREIGN_XR_START', onSage);
    window.addEventListener('resonance-change', onSage);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('sage:narrate', onSage);
      window.removeEventListener('SOVEREIGN_XR_START', onSage);
      window.removeEventListener('resonance-change', onSage);
    };
  }, []);
  return pulse;
}

// ── V1.0.15 Tier-gated render fidelity ──────────────────────────
// Reads the user's tier from localStorage (set by economy/my-plan).
// Founder/Sovereign get high-poly + night HDRI + dpr 2.
// Seeker/Discovery get low-poly + matte + dpr 1.
function useTierFidelity() {
  return useMemo(() => {
    let raw = 'discovery';
    try {
      raw = (localStorage.getItem('zen_tier') || localStorage.getItem('zen_user_tier') || 'discovery').toLowerCase();
    } catch {}
    // Normalize legacy values (SOVEREIGN, FOUNDER, etc.) to canonical tier ids
    const tier = raw.replace(/\s+/g, '_');
    const high = ['sovereign_founder', 'sovereign', 'founder', 'architect'].some((k) => tier.includes(k));
    return {
      tier,
      polyDetail: high ? 3 : 2,
      shardCount: high ? [10, 14] : [6, 10],
      dprMax: high ? 2 : 1.25,
      envPreset: high ? 'night' : 'sunset',
      enableEnv: high,
    };
  }, []);
}

// ── 3D Rock Mesh ────────────────────────────────────────────────
// Procedurally distorted icosahedron. Each strike adds noise to the
// vertex displacement scale so the rock visibly cracks.
function RockMesh({ hits, hitsPerTarget, color, onStrike, broken, sagePulse = 0, polyDetail = 2 }) {
  const meshRef = useRef();
  const geomRef = useRef();
  const [glow, setGlow] = useState(0);
  const [shake, setShake] = useState(0);
  const damage = Math.min(hits / hitsPerTarget, 1);

  // Build a distorted icosahedron once (poly detail driven by tier)
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, polyDetail);
    const pos = geo.attributes.position;
    const original = new Float32Array(pos.array);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const noise = 0.18 * (Math.sin(x * 4.1) + Math.cos(y * 3.7) + Math.sin(z * 5.2));
      pos.setXYZ(i, x + noise * x, y + noise * y, z + noise * z);
    }
    geo.computeVertexNormals();
    geo.userData.original = original;
    return geo;
  }, [polyDetail]);

  // Apply progressive cracking — each strike re-displaces vertices
  useEffect(() => {
    if (!geomRef.current) return;
    const pos = geomRef.current.attributes.position;
    const original = geometry.userData.original;
    if (!original) return;
    for (let i = 0; i < pos.count; i++) {
      const ox = original[i * 3], oy = original[i * 3 + 1], oz = original[i * 3 + 2];
      const baseNoise = 0.18 * (Math.sin(ox * 4.1) + Math.cos(oy * 3.7) + Math.sin(oz * 5.2));
      const crackNoise = damage * 0.35 * (Math.sin(ox * 11 + hits) + Math.cos(oy * 13 + hits));
      pos.setXYZ(i, ox + baseNoise * ox + crackNoise * ox, oy + baseNoise * oy + crackNoise * oy, oz + baseNoise * oz + crackNoise * oz);
    }
    pos.needsUpdate = true;
    geomRef.current.computeVertexNormals();
    setGlow(1);
    setShake(0.15);
  }, [hits, damage, geometry]);

  // Animate slow rotation, shake on strike, glow decay
  useFrame((state, dt) => {
    if (!meshRef.current) return;
    if (!broken) {
      meshRef.current.rotation.y += dt * 0.25;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
    }
    if (shake > 0) {
      const s = shake * 0.5;
      meshRef.current.position.x = (Math.random() - 0.5) * s;
      meshRef.current.position.y = (Math.random() - 0.5) * s;
      setShake(Math.max(0, shake - dt * 1.5));
    } else {
      meshRef.current.position.x *= 0.85;
      meshRef.current.position.y *= 0.85;
    }
    if (glow > 0) setGlow(Math.max(0, glow - dt * 1.8));
  });

  if (broken) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onClick={(e) => { e.stopPropagation(); onStrike(); haptic(); }}
      onPointerDown={(e) => { e.stopPropagation(); onStrike(); haptic(); }}
      castShadow
      receiveShadow
    >
      <bufferGeometry ref={geomRef} {...geometry} />
      <meshStandardMaterial
        color={color}
        roughness={0.55 + damage * 0.3}
        metalness={0.35}
        emissive={color}
        emissiveIntensity={0.1 + glow * 0.6 + sagePulse * 0.8}
        flatShading
      />
    </mesh>
  );
}

// ── Fragment Shards (post-strike particles) ─────────────────────
function Shard({ origin, direction, color, life }) {
  const ref = useRef();
  const startTime = useRef(performance.now());
  useFrame(() => {
    if (!ref.current) return;
    const t = (performance.now() - startTime.current) / 1000;
    const decay = Math.max(0, 1 - t / life);
    ref.current.position.x = origin[0] + direction[0] * t * 2;
    ref.current.position.y = origin[1] + direction[1] * t * 2 - 0.5 * 9.8 * t * t * 0.2;
    ref.current.position.z = origin[2] + direction[2] * t * 2;
    ref.current.rotation.x += 0.1;
    ref.current.rotation.y += 0.07;
    ref.current.material.opacity = decay;
  });
  return (
    <mesh ref={ref} position={origin}>
      <tetrahedronGeometry args={[0.08, 0]} />
      <meshStandardMaterial color={color} transparent opacity={1} emissive={color} emissiveIntensity={0.4} />
    </mesh>
  );
}

function ShardField({ shards }) {
  return (
    <>
      {shards.map((s) => (
        <Shard key={s.id} origin={s.origin} direction={s.direction} color={s.color} life={s.life} />
      ))}
    </>
  );
}

// ── Scene Lighting + Environment ────────────────────────────────
function Stage({ color, children, envPreset = 'night', enableEnv = true }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.0} castShadow />
      <pointLight position={[-3, 2, -2]} intensity={0.6} color={color} />
      {enableEnv && (
        <Suspense fallback={null}>
          <Environment preset={envPreset} />
        </Suspense>
      )}
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
        {children}
      </Float>
    </>
  );
}

// ── Wave Mesh (rhythm mode — pulse to the beat) ──────────────────
function WaveMesh({ hits, hitsPerTarget, color, onStrike, broken, sagePulse = 0 }) {
  const meshRef = useRef();
  const damage = Math.min(hits / hitsPerTarget, 1);
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    // Pulse + breath — combines a base sine with sagePulse spike
    const breath = 1 + Math.sin(t * PHI) * 0.08 + sagePulse * 0.3;
    meshRef.current.scale.setScalar(breath);
    meshRef.current.rotation.y += 0.01;
  });
  if (broken) return null;
  return (
    <mesh
      ref={meshRef}
      onPointerDown={(e) => { e.stopPropagation(); onStrike(); haptic(); }}
    >
      <torusKnotGeometry args={[0.85, 0.28, 128, 16]} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.6}
        emissive={color}
        emissiveIntensity={0.25 + damage * 0.4 + sagePulse * 0.6}
      />
    </mesh>
  );
}

// ── Field Mesh (collect mode — pluck items from a 3x3 grid) ──────
function FieldMesh({ hits, hitsPerTarget, color, onStrike, broken, sagePulse = 0 }) {
  const groupRef = useRef();
  const itemCount = 9;  // 3x3 grid — maps to GRID_SIZE/3 sub-region of helix
  const [picked, setPicked] = useState([]);
  const damage = Math.min(hits / hitsPerTarget, 1);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
  });

  if (broken) return null;
  return (
    <group ref={groupRef}>
      {Array.from({ length: itemCount }).map((_, i) => {
        if (picked.includes(i)) return null;
        const row = Math.floor(i / 3) - 1;
        const col = (i % 3) - 1;
        // Use toroidal helix positioning for 3x3 sub-grid
        const tor = toroidalDisplacement(col + 1, row + 1, 0);
        const px = (col * 0.9) + tor.x * 0.05;
        const pz = (row * 0.9) + tor.z * 0.05;
        const py = Math.sin(i * PHI) * 0.15;
        return (
          <mesh
            key={i}
            position={[px, py, pz]}
            onPointerDown={(e) => {
              e.stopPropagation();
              setPicked((p) => [...p, i]);
              onStrike();
              haptic();
            }}
          >
            <octahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial
              color={color}
              roughness={0.4}
              metalness={0.5}
              emissive={color}
              emissiveIntensity={0.3 + damage * 0.4 + sagePulse * 0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ── Main Component ──────────────────────────────────────────────
export default function Chamber3DGame({
  open,
  onClose,
  color = '#FBBF24',
  mode = 'break',
  title = 'STRIKE THE FORMATION',
  verb = 'STRIKE',
  targetCount = 5,
  hitsPerTarget = 3,
  zone = 'geology_break',
  completionMsg = 'CRYSTAL REVEALED',
  completionXP = 12,
  onComplete,
  teach,
}) {
  const [hits, setHits] = useState(0);
  const [cleared, setCleared] = useState(0);
  const [shards, setShards] = useState([]);
  const [broken, setBroken] = useState(false);
  const [done, setDone] = useState(false);
  const totalHits = hitsPerTarget * targetCount;
  const progress = Math.min((cleared * hitsPerTarget + hits) / totalHits, 1);
  const shardId = useRef(0);

  // V1.0.15 — Wire global state into the 3D world (no new Provider needed)
  const sagePulse = useSageReaction();          // Sage Voice → mesh pulse
  const fidelity = useTierFidelity();           // Tier → poly count + HDRI

  // Reset on open toggle
  useEffect(() => {
    if (open) {
      setHits(0);
      setCleared(0);
      setBroken(false);
      setDone(false);
      setShards([]);
    }
  }, [open]);

  const spawnShards = useCallback(() => {
    // V1.0.15 — Math-driven: shards eject along golden-spiral vectors
    // (lib/SacredGeometry.goldenSpiralPoints) modulated by current LOX
    // ignition pulse. Founders get more shards (PHI_SQ multiplier).
    const lox = (() => { try { return getLoxIgnitionPulse(); } catch { return { intensity: 1 }; } })();
    const baseCount = fidelity.shardCount[0] + Math.floor(Math.random() * (fidelity.shardCount[1] - fidelity.shardCount[0]));
    const count = Math.round(baseCount * (lox?.intensity || 1));
    const spiral = goldenSpiralPoints(count, 1.4);
    const newShards = spiral.map((pt, i) => ({
      id: shardId.current++,
      origin: [0, 0, 0],
      direction: [
        pt.x * (0.6 + Math.random() * 0.5),
        Math.abs(pt.y) * 0.6 + 0.4,
        (pt.z || Math.cos(i * PHI)) * (0.6 + Math.random() * 0.5),
      ],
      color,
      life: 0.9,
    }));
    setShards((prev) => [...prev, ...newShards]);
    setTimeout(() => {
      setShards((prev) => prev.filter((s) => !newShards.find((n) => n.id === s.id)));
    }, 1100);
  }, [color, fidelity]);

  const onStrike = useCallback(() => {
    if (done || broken) return;
    creditSparks(zone, 1);
    spawnShards();
    setHits((h) => {
      const next = h + 1;
      if (next >= hitsPerTarget) {
        setBroken(true);
        setCleared((c) => c + 1);
        setTimeout(() => {
          setBroken(false);
          setHits(0);
        }, 900);
      }
      return next >= hitsPerTarget ? 0 : next;
    });
  }, [done, broken, zone, hitsPerTarget, spawnShards]);

  // Completion — V1.0.15 squared XP multiplier for Sovereign tiers
  useEffect(() => {
    if (cleared >= targetCount && !done) {
      setDone(true);
      const mult = ['sovereign_founder', 'sovereign'].includes(fidelity.tier) ? PHI_SQ : 1;
      const xpAward = Math.round(completionXP * mult);
      creditSparks(zone, xpAward);
      onComplete && onComplete(xpAward);
    }
  }, [cleared, targetCount, done, zone, completionXP, onComplete, fidelity.tier]);

  if (!open) return null;

  return (
    <div
      data-testid={`chamber-3d-${zone}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 420,
        borderRadius: 16,
        overflow: 'hidden',
        background: `radial-gradient(circle at 50% 30%, ${color}18 0%, transparent 60%), linear-gradient(180deg, rgba(6,8,16,0.96) 0%, rgba(2,3,10,0.98) 100%)`,
        border: `1px solid ${color}26`,
        marginBottom: 16,
      }}
    >
      {/* Inline header — no floating overlay, no X close */}
      <div style={{
        padding: '14px 16px 10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        borderBottom: `1px solid ${color}15`, flexWrap: 'wrap', gap: 6,
      }}>
        <div style={{ fontFamily: 'monospace', color }}>
          <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.85 }}>{title}</div>
          <div style={{ fontSize: 9, letterSpacing: 1.5, opacity: 0.55, marginTop: 2 }}>
            +{cleared * hitsPerTarget + hits} SPARKS · {Math.round(progress * 100)}%
          </div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'monospace', fontSize: 9, color: `${color}cc` }}>
          <Hammer size={10} /> {verb} · {cleared}/{targetCount}
        </div>
      </div>

      {/* The actual 3D canvas */}
      <div style={{ width: '100%', height: 360, position: 'relative' }}>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 45 }}
          shadows
          dpr={[1, fidelity.dprMax]}
          data-testid={`chamber-3d-canvas-${zone}`}
        >
          {/* V1.0.15 — Hollow Earth shell. Inverted sphere with BackSide
              so the user is INSIDE the chamber, not outside looking at it.
              Sovereign tier sees the textured/emissive shell. */}
          <mesh>
            <sphereGeometry args={[14, 32, 32]} />
            <meshBasicMaterial
              color={color}
              side={THREE.BackSide}
              transparent
              opacity={fidelity.tier === 'discovery' ? 0.04 : 0.10}
            />
          </mesh>

          <Stage color={color} envPreset={fidelity.envPreset} enableEnv={fidelity.enableEnv}>
            <PresentationControls
              global
              snap
              polar={[-Math.PI / 4, Math.PI / 4]}
              azimuth={[-Math.PI / 3, Math.PI / 3]}
            >
              {mode === 'rhythm' ? (
                <WaveMesh
                  hits={hits}
                  hitsPerTarget={hitsPerTarget}
                  color={color}
                  onStrike={onStrike}
                  broken={broken}
                  sagePulse={sagePulse}
                />
              ) : mode === 'collect' ? (
                <FieldMesh
                  hits={hits}
                  hitsPerTarget={hitsPerTarget}
                  color={color}
                  onStrike={onStrike}
                  broken={broken}
                  sagePulse={sagePulse}
                />
              ) : (
                <RockMesh
                  hits={hits}
                  hitsPerTarget={hitsPerTarget}
                  color={color}
                  onStrike={onStrike}
                  broken={broken}
                  sagePulse={sagePulse}
                  polyDetail={fidelity.polyDetail}
                />
              )}
            </PresentationControls>
            <ShardField shards={shards} />
          </Stage>
          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={2.5}
            maxDistance={6}
            enableDamping
            dampingFactor={0.08}
          />
        </Canvas>

        {/* Inline strike hint (NOT an overlay — sits inside canvas frame) */}
        <div style={{
          position: 'absolute', bottom: 10, left: 0, right: 0,
          textAlign: 'center', fontFamily: 'monospace',
          fontSize: 9, letterSpacing: 2, color: `${color}aa`,
          pointerEvents: 'none',
        }}>
          DRAG TO ORBIT · TAP CRYSTAL TO {verb}
        </div>
      </div>

      {/* Teach panel — sequential, inline */}
      {teach && (
        <div style={{
          padding: '10px 16px',
          fontFamily: 'monospace',
          fontSize: 10,
          color: `${color}cc`,
          borderTop: `1px solid ${color}10`,
          opacity: 0.85,
        }}>
          <span style={{ letterSpacing: 1.5, opacity: 0.55 }}>TEACH ·</span> {teach.topic || teach}
        </div>
      )}

      {/* Completion + Done pill — sequential fold, NOT a floating X */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '12px 16px',
              borderTop: `1px solid ${color}30`,
              background: `${color}10`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 8,
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color, fontFamily: 'monospace' }}>
              <Sparkles size={14} />
              <span style={{ fontSize: 11, letterSpacing: 2 }}>{completionMsg}</span>
              <span style={{ fontSize: 9, opacity: 0.7 }}>+{completionXP} XP</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              data-testid={`chamber-3d-done-${zone}`}
              style={{
                background: `${color}20`,
                border: `1px solid ${color}55`,
                color,
                padding: '6px 14px',
                borderRadius: 999,
                fontFamily: 'monospace',
                fontSize: 9,
                letterSpacing: 2,
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <ChevronUp size={11} /> FOLD WORKSHOP
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom fold pill — always available, no X */}
      {!done && (
        <div style={{ padding: '8px 16px 12px', textAlign: 'center', borderTop: `1px solid ${color}10` }}>
          <button
            type="button"
            onClick={onClose}
            data-testid={`chamber-3d-fold-${zone}`}
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
