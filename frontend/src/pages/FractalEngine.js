/**
 * FractalEngine.js — V68.13 Seven Pillars Ritual Stage
 *
 * The 3D cosmology binding all 7 Classical Pillars to the Sovereign Lattice:
 *
 *   Wellness   — The Body           (#00FFC2)
 *   Culinary   — Nourishment        (#FFD700)
 *   Academy    — Sovereign Software (#A855F7)
 *   Oracle     — Ancient Philosophy (#C084FC)
 *   Craft      — Sacred Geometry    (#FB923C)
 *   Community  — Trade & Circle     (#22C55E)
 *   Sanctuary  — Digital Sovereignty(#D4AF37)
 *
 * Resonance state comes from `GET /api/pillars/resonance`:
 *   WIREFRAME — default                  (low opacity, no emissive)
 *   BLOOM     — ≥1 immersion visit       (bright emissive + gentle pulse)
 *   OBSIDIAN  — Teacher quest completed  (solid fill, bright aura, plays a
 *              Solfeggio resonance tone on hover — the "sound of mastery")
 *
 * Click a pillar → 1.2s camera fly-to → inline readout card expands →
 * "ENTER DOMAIN" button routes to the pillar's real sub-page.
 * Zero modals. Respects the Flatland rule.
 */
import React, { Suspense, useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Volume2, VolumeX } from 'lucide-react';
import * as THREE from 'three';
import axios from 'axios';
import SovereignStageHUD from '../components/SovereignStageHUD';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ── Rarity → hex color map (mirrors standard MMO palettes) ────────────
const RARITY_COLOR = {
  common:    '#9CA3AF',
  uncommon:  '#22C55E',
  rare:      '#3B82F6',
  epic:      '#A855F7',
  legendary: '#F59E0B',
  mythic:    '#EC4899',
};
const rarityToColor = (item) => {
  if (!item) return null;
  if (item.rarity_color) return item.rarity_color;
  if (item.color)        return item.color;
  const r = (item.rarity || item.base_rarity || '').toLowerCase();
  return RARITY_COLOR[r] || null;
};

// ── Solfeggio resonance tones per pillar (Hz) ─────────────────────────
const RESONANCE_TONE = {
  wellness:  528,  // Love / cell repair
  culinary:  417,  // Change / nourishment
  academy:   741,  // Awakening intuition
  oracle:    963,  // Pineal / divine consciousness
  craft:     639,  // Connection / geometry
  community: 396,  // Liberation from guilt
  sanctuary: 852,  // Return to spiritual order
};

// ── Seven nodes positioned on a hexagon with the user Avatar at center ─
// (Sanctuary sits at [0, 2.4, 0] instead of center — the user's silhouette
// now owns the central singularity.)
const PILLAR_POSITIONS = [
  { id: 'sanctuary', position: [ 0.0,  3.6, 0] },                  // top (moved up — avatar owns center)
  { id: 'wellness',  position: [ 3.4,  1.6, 0] },                  // upper right
  { id: 'culinary',  position: [ 3.4, -1.6, 0] },                  // lower right
  { id: 'academy',   position: [ 2.0, -3.2, 0] },                  // lower right-below
  { id: 'oracle',    position: [-2.0, -3.2, 0] },                  // lower left-below
  { id: 'craft',     position: [-3.4,  1.6, 0] },                  // upper left
  { id: 'community', position: [-3.4, -1.6, 0] },                  // lower left
];

// ── Web Audio helper — plays a brief Solfeggio pluck ──────────────────
function playResonanceTone(freq, audioCtxRef) {
  try {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtxRef.current = new Ctx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 1.25);
  } catch { /* audio unavailable — silent */ }
}

// ── Floating, clickable crystalline pillar node ───────────────────────
function PillarNode({ position, pillar, isActive, isHovered, onActivate, onHoverEnter, onHoverLeave }) {
  const meshRef = useRef();
  const floatPhase = useMemo(() => Math.random() * Math.PI * 2, []);

  const color = pillar.color;
  const state = pillar.state; // WIREFRAME | BLOOM | OBSIDIAN

  // Visual tuning per state
  const visual = useMemo(() => {
    switch (state) {
      case 'OBSIDIAN':
        return { wireframe: false, emissiveIntensity: 0.9, opacity: 1.0, scale: 1.1 };
      case 'BLOOM':
        return { wireframe: false, emissiveIntensity: 0.45, opacity: 0.78, scale: 1.0 };
      default:
        return { wireframe: true,  emissiveIntensity: 0.15, opacity: 0.55, scale: 0.9 };
    }
  }, [state]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * 1.2 + floatPhase) * 0.18;
    meshRef.current.rotation.x = t * 0.35;
    meshRef.current.rotation.y = t * 0.55;
    // Active node pulses slightly larger
    const target = (isActive ? 1.25 : (isHovered ? 1.12 : 1.0)) * visual.scale;
    meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      frustumCulled={false}
      onClick={(e) => { e.stopPropagation(); onActivate(pillar); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; onHoverEnter(pillar); }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; onHoverLeave(pillar); }}
    >
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial
        color={color}
        wireframe={visual.wireframe}
        emissive={color}
        emissiveIntensity={visual.emissiveIntensity}
        transparent
        opacity={visual.opacity}
      />
    </mesh>
  );
}

// ── Crystalline Silhouette — user's sovereign avatar at lattice center ─
// Procedural Three.js figure with Sparks-reactive aura, Dust-reactive eye
// glow, and an Inner Core that bright-pulses on every immersion tick.
//
// V68.16 "Metabolic Mirror": the user's RPG equipment (from
// /api/rpg/character `equipped.{slot}`) now binds to the silhouette:
//   • Body gear rarity color     → overrides the silhouette body palette
//   • Head gear presence         → spawns a Saturn-halo ring at the crown
//   • Trinket rarity             → accent ring around the core
//
// Priority rule: equipment ALWAYS wins for body/aura colour; Sparks tier
// layers on top as halo/eye-glow intensity (merit shows through without
// stealing the user's chosen palette).
function CrystallineSilhouette({ sparks, dust, equipment = null, avatarB64 = null, profileColor = null, onClick = null }) {
  const groupRef = useRef();
  const coreRef = useRef();
  const auraRef = useRef();
  const haloRef = useRef();
  const crownHaloRef = useRef();
  const trinketRingRef = useRef();
  const portraitRef = useRef();
  const pulseRef = useRef({ active: false, startT: 0 });
  const { camera } = useThree();

  const s = Number(sparks) || 0;
  const d = Number(dust) || 0;

  // --- Tier aura (Sparks-driven, merit fallback) ---
  const tierColor = useMemo(() => {
    if (s >= 100000) return new THREE.Color('#D4AF37');     // SOVEREIGN
    if (s >= 25000)  return new THREE.Color('#FBBF24');     // ORACLE / ARTISAN
    if (s >= 1000)   return new THREE.Color('#A78BFA');     // NAVIGATOR
    return new THREE.Color('#6D28D9');                      // SEED / CITIZEN
  }, [s]);

  // --- Profile identity (user's chosen theme colour, from /profile/me) ---
  // This is the user's *personal* palette — it should feel like THEM, not
  // a generic seed tier. Priority order:
  //   1. Equipment rarity colour (if equipped)  — in-game status
  //   2. Profile theme_color                    — personal identity
  //   3. Sparks tier colour                     — merit fallback
  const identityColor = useMemo(() => {
    if (profileColor) { try { return new THREE.Color(profileColor); } catch { /* invalid hex */ } }
    return tierColor;
  }, [profileColor, tierColor]);

  // --- Equipment-driven palette (Metabolic Mirror) ---
  const bodyGear  = equipment?.armor || equipment?.body  || equipment?.chest || null;
  const headGear  = equipment?.helm  || equipment?.head  || equipment?.crown || null;
  const trinket   = equipment?.trinket || equipment?.accessory || null;

  const bodyColor = useMemo(() => {
    const c = rarityToColor(bodyGear);
    return c ? new THREE.Color(c) : identityColor;
  }, [bodyGear, identityColor]);

  const crownColor = useMemo(() => {
    const c = rarityToColor(headGear);
    return c ? new THREE.Color(c) : identityColor;
  }, [headGear, identityColor]);

  const trinketColor = useMemo(() => {
    const c = rarityToColor(trinket);
    return c ? new THREE.Color(c) : identityColor;
  }, [trinket, identityColor]);

  // --- Portrait texture from /api/ai-visuals/my-avatar (real AI portrait) ---
  const portraitTexture = useMemo(() => {
    if (!avatarB64) return null;
    try {
      const img = new Image();
      img.src = avatarB64.startsWith('data:') ? avatarB64 : `data:image/png;base64,${avatarB64}`;
      const tex = new THREE.Texture(img);
      img.onload = () => { tex.needsUpdate = true; };
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    } catch { return null; }
  }, [avatarB64]);

  const auraRadius = useMemo(() => 1.3 + Math.min(1.6, Math.log10(Math.max(s, 1)) * 0.28), [s]);
  const eyeGlow    = useMemo(() => Math.min(1.0, 0.35 + d / 30000), [d]);
  // Halo intensity grows with tier — merit shows even if user picked a muted body color
  const haloIntensity = useMemo(() => {
    if (s >= 100000) return 1.0;
    if (s >= 25000)  return 0.65;
    if (s >= 1000)   return 0.4;
    return 0.2;
  }, [s]);

  // Immersion tick → flash core
  useEffect(() => {
    const onTick = () => {
      pulseRef.current.active = true;
      pulseRef.current.startT = performance.now();
    };
    window.addEventListener('sovereign:immersion-tick', onTick);
    return () => window.removeEventListener('sovereign:immersion-tick', onTick);
  }, []);

  // Second ref for the holo-tint overlay (same image, additive theme-colour glow)
  const holoTintRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle float only — no rotation, so the hologram reads as a stationary
      // projection the user is facing (true "sovereign form" presence).
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.12;
    }
    // Continuous gentle aura breath
    if (auraRef.current) {
      const breath = 1.0 + Math.sin(t * 1.3) * 0.04;
      auraRef.current.scale.set(breath, breath, breath);
      auraRef.current.material.opacity = 0.06 + Math.sin(t * 1.3) * 0.02;
    }
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.35;
      haloRef.current.material.opacity = 0.22 + Math.sin(t * 0.9) * 0.04;
    }
    // Saturn-halo crown ring — only present if head gear equipped, rotates faster at higher tiers
    if (crownHaloRef.current) {
      crownHaloRef.current.rotation.y = t * (0.25 + haloIntensity * 0.6);
      crownHaloRef.current.rotation.z = Math.sin(t * 0.4) * 0.08;
    }
    // Trinket accent ring — slow rotation around the heart
    if (trinketRingRef.current) {
      trinketRingRef.current.rotation.z = -t * 0.55;
    }
    // Core pulse on immersion-tick event (still shows as a faint heart light)
    if (coreRef.current) {
      let coreIntensity = 0.5 + Math.sin(t * 2.1) * 0.06;
      if (pulseRef.current.active) {
        const elapsed = performance.now() - pulseRef.current.startT;
        if (elapsed < 900) {
          const p = 1 - elapsed / 900;
          coreIntensity += p * 0.9;
        } else {
          pulseRef.current.active = false;
        }
      }
      coreRef.current.material.emissiveIntensity = coreIntensity;
    }
    // Billboard both the hologram plane AND the additive tint overlay so the
    // full figure always faces the camera — this is what makes it feel like
    // a true holographic projection of the user rather than a 3D model.
    if (portraitRef.current) portraitRef.current.lookAt(camera.position);
    if (holoTintRef.current) {
      holoTintRef.current.lookAt(camera.position);
      // Subtle hologram flicker — opacity wobble tied to sin waves at different frequencies
      const flicker = 0.28 + Math.sin(t * 3.1) * 0.06 + Math.sin(t * 11.7) * 0.03;
      holoTintRef.current.material.opacity = flicker;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      frustumCulled={false}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(); } : undefined}
      onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer'; } : undefined}
      onPointerOut={onClick ? () => { document.body.style.cursor = 'auto'; } : undefined}
    >
      {/* Outer aura sphere — merit halo (Sparks tier colour) */}
      <mesh ref={auraRef} frustumCulled={false}>
        <sphereGeometry args={[auraRadius * 1.2, 24, 24]} />
        <meshBasicMaterial color={identityColor} transparent opacity={0.08} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Outer crystalline halo ring — tilted, tier colour, encircles the hologram */}
      <mesh ref={haloRef} rotation={[Math.PI / 2.2, 0, 0]} frustumCulled={false}>
        <torusGeometry args={[auraRadius * 1.05, 0.015, 8, 64]} />
        <meshBasicMaterial color={tierColor} transparent opacity={0.25 + haloIntensity * 0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {portraitTexture ? (
        <>
          {/* HOLOGRAM — full AI avatar, billboarded, rendered twice:
              1) base image (sharp portrait)
              2) additive theme-tinted overlay (the "holo" glow) */}
          <mesh ref={portraitRef} position={[0, 0, 0]} frustumCulled={false} renderOrder={10}>
            <planeGeometry args={[2.0, 2.6]} />
            <meshBasicMaterial
              map={portraitTexture}
              transparent
              toneMapped={false}
              side={THREE.DoubleSide}
              depthTest={false}
              opacity={0.92}
            />
          </mesh>
          <mesh ref={holoTintRef} position={[0, 0, 0.001]} frustumCulled={false} renderOrder={11}>
            <planeGeometry args={[2.0, 2.6]} />
            <meshBasicMaterial
              map={portraitTexture}
              color={bodyGear ? bodyColor : identityColor}
              transparent
              toneMapped={false}
              side={THREE.DoubleSide}
              depthTest={false}
              blending={THREE.AdditiveBlending}
              opacity={0.28}
            />
          </mesh>

          {/* Containment field — faint wireframe icosahedron wrapping the hologram */}
          <mesh frustumCulled={false}>
            <icosahedronGeometry args={[1.55, 1]} />
            <meshBasicMaterial color={identityColor} wireframe transparent opacity={0.18} depthWrite={false} />
          </mesh>

          {/* Heart core — faint light pulse behind the hologram */}
          <mesh ref={coreRef} position={[0, -0.1, -0.4]} frustumCulled={false}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive={identityColor} emissiveIntensity={0.5} toneMapped={false} transparent opacity={0.6} />
          </mesh>
        </>
      ) : (
        // No AI avatar yet — show a prompt glyph + hint.
        <>
          <mesh position={[0, 0, 0]} frustumCulled={false}>
            <icosahedronGeometry args={[0.55, 1]} />
            <meshStandardMaterial color={identityColor} wireframe emissive={identityColor} emissiveIntensity={0.45} transparent opacity={0.7} />
          </mesh>
          <mesh ref={coreRef} position={[0, 0, 0]} frustumCulled={false}>
            <sphereGeometry args={[0.24, 18, 18]} />
            <meshStandardMaterial color="#ffffff" emissive={identityColor} emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
        </>
      )}

      {/* Saturn-halo crown — only if headGear equipped; rides above the hologram */}
      {headGear && (
        <mesh ref={crownHaloRef} position={[0, 1.55, 0]} rotation={[Math.PI / 2.4, 0, 0]} frustumCulled={false}>
          <torusGeometry args={[0.5, 0.02, 10, 48]} />
          <meshStandardMaterial color={crownColor} emissive={crownColor} emissiveIntensity={0.8 + haloIntensity} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      )}

      {/* Trinket ring — orbits the heart of the hologram */}
      {trinket && (
        <mesh ref={trinketRingRef} position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} frustumCulled={false}>
          <torusGeometry args={[0.58, 0.015, 8, 48]} />
          <meshStandardMaterial color={trinketColor} emissive={trinketColor} emissiveIntensity={0.6} transparent opacity={0.65} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

// ── 2000-star buffer-geometry starfield (replaces drei/Stars) ─────────
function Starfield({ count = 2000 }) {  const ref = useRef();
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

// ── Camera fly-to controller (1.2s lerp when activePillarId changes) ─
function CameraFlyController({ targetPos }) {
  const { camera } = useThree();
  const state = useRef({ from: new THREE.Vector3(), to: new THREE.Vector3(), startT: 0, active: false });

  useEffect(() => {
    if (!targetPos) return;
    state.current.from.copy(camera.position);
    // Camera should sit 3.5 units "behind" the node on the Z-axis
    state.current.to.set(targetPos[0] * 0.6, targetPos[1] * 0.6, 5.2);
    state.current.startT = performance.now();
    state.current.active = true;
  }, [targetPos, camera]);

  useFrame(() => {
    if (!state.current.active) return;
    const elapsed = performance.now() - state.current.startT;
    const p = Math.min(1, elapsed / 1200);
    const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // easeInOutQuad
    camera.position.lerpVectors(state.current.from, state.current.to, eased);
    camera.lookAt(0, 0, 0);
    if (p >= 1) state.current.active = false;
  });

  return null;
}

// ── Spark Orb (collectable floating credit) ──────────────────────────
function SparkOrb({ position, color = '#00ffcc' }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      // Gentle vertical bob + pulse
      ref.current.position.y = position[1] + Math.sin(t * 1.5 + position[0]) * 0.08;
      const s = 1 + Math.sin(t * 3 + position[0] * 2) * 0.15;
      ref.current.scale.set(s, s, s);
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── GameController — lifts the hologram into a playable character ────
// Handles: WASD/arrow movement, on-screen D-pad via moveDirRef, clamped
// to lattice bounds, proximity auto-activation of pillars, collision
// with collectable Spark orbs (+1 credit each).
function GameController({
  pillars,
  equipment,
  avatarB64,
  profileColor,
  sparks,
  dust,
  onActivate,
  onSparkCollect,
  onAvatarClick,
  moveDirRef,
}) {
  const posRef = useRef({ x: 0, y: 0, z: 0 });
  const keysRef = useRef({});
  const outerRef = useRef();
  const [orbs, setOrbs] = useState(() => seedOrbs(24));
  const lastActivateRef = useRef({ ts: 0, id: null });

  useEffect(() => {
    const down = (e) => {
      const k = (e.key || '').toLowerCase();
      keysRef.current[k] = true;
    };
    const up = (e) => { keysRef.current[(e.key || '').toLowerCase()] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame((_, rawDelta) => {
    // Cap delta to avoid tunnelling through orbs on pause/resume
    const delta = Math.min(rawDelta || 0.016, 0.05);
    const k = keysRef.current;
    const md = moveDirRef?.current || { x: 0, y: 0 };
    const speed = 3.4 * delta;
    let dx = 0, dy = 0, dz = 0;
    if (k.w || k.arrowup)    dy += 1;
    if (k.s || k.arrowdown)  dy -= 1;
    if (k.a || k.arrowleft)  dx -= 1;
    if (k.d || k.arrowright) dx += 1;
    if (k.q) dz -= 1;
    if (k.e) dz += 1;
    dx += md.x;
    dy += md.y;
    const len = Math.hypot(dx, dy);
    if (len > 1) { dx /= len; dy /= len; }
    posRef.current.x += dx * speed;
    posRef.current.y += dy * speed;
    posRef.current.z += dz * speed;
    // Clamp to lattice bounds (horizontal radius, vertical range)
    const maxR = 3.2;
    const r = Math.hypot(posRef.current.x, posRef.current.y);
    if (r > maxR) {
      posRef.current.x *= maxR / r;
      posRef.current.y *= maxR / r;
    }
    posRef.current.z = Math.max(-1.5, Math.min(2, posRef.current.z));
    if (outerRef.current) {
      outerRef.current.position.set(posRef.current.x, posRef.current.y, posRef.current.z);
    }
    // Proximity pillar activation (debounced — same pillar won't refire for 1.8s)
    const now = performance.now();
    for (const p of pillars) {
      const [px, py, pz] = p.position;
      const d = Math.hypot(posRef.current.x - px, posRef.current.y - py, posRef.current.z - pz);
      if (d < 0.65 && (lastActivateRef.current.id !== p.id || now - lastActivateRef.current.ts > 1800)) {
        lastActivateRef.current = { ts: now, id: p.id };
        onActivate(p);
        break;
      }
    }
    // Orb collection
    const collected = [];
    for (const o of orbs) {
      const d = Math.hypot(posRef.current.x - o.x, posRef.current.y - o.y, posRef.current.z - o.z);
      if (d < 0.38) collected.push(o);
    }
    if (collected.length > 0) {
      const ids = new Set(collected.map((c) => c.id));
      setOrbs((prev) => prev.filter((o) => !ids.has(o.id)));
      collected.forEach(() => onSparkCollect && onSparkCollect(1));
    }
  });

  return (
    <>
      <group ref={outerRef}>
        <CrystallineSilhouette
          sparks={sparks}
          dust={dust}
          equipment={equipment}
          avatarB64={avatarB64}
          profileColor={profileColor}
          onClick={onAvatarClick}
        />
      </group>
      {orbs.map((o) => (
        <SparkOrb key={o.id} position={[o.x, o.y, o.z]} />
      ))}
    </>
  );
}

// Random orb positions inside the lattice volume (avoiding dead-center where
// the hologram spawns). 24 orbs, respawn happens on page reload.
function seedOrbs(count) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    // Random in the lattice shell (radius 1.0 → 3.0, z ∈ -1 → 1.5)
    const theta = Math.random() * Math.PI * 2;
    const rr = 1.2 + Math.random() * 1.8;
    arr.push({
      id: `orb-${i}`,
      x: Math.cos(theta) * rr,
      y: Math.sin(theta) * rr,
      z: -0.8 + Math.random() * 2.0,
    });
  }
  return arr;
}

// ─────────────────────────────────────────────────────────────────────
export default function FractalEngine() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pillars, setPillars] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [avatarStats, setAvatarStats] = useState({ sparks: 0, dust: 0 });
  const [equipment, setEquipment] = useState(null);
  const [avatarB64, setAvatarB64] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sparksCollected, setSparksCollected] = useState(0);
  const moveDirRef = useRef({ x: 0, y: 0 });
  const audioCtxRef = useRef(null);
  const lastHoverToneRef = useRef(0);

  const displayName = profile?.display_name || user?.name || user?.email?.split('@')[0] || 'SOVEREIGN';
  const profileColor = profile?.theme_color || null;

  // Immersion tracking — pings /api/sparks/immersion every 60s and emits
  // a DOM event the SovereignStageHUD listens for to flash its accrual ring.
  useEffect(() => {
    if (typeof window.__workAccrue === 'function') window.__workAccrue('fractal', 8);
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') return;
    const interval = setInterval(() => {
      axios.post(
        `${API}/sparks/immersion`,
        { seconds: 60, zone: 'fractal_engine' },
        { headers: { Authorization: `Bearer ${token}` } },
      ).then(() => {
        window.dispatchEvent(new CustomEvent('sovereign:immersion-tick'));
      }).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch pillar resonance from backend (auth'd)
  useEffect(() => {
    const token = localStorage.getItem('zen_token');
    const h = token && token !== 'guest_token' ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API}/pillars${token && token !== 'guest_token' ? '/resonance' : ''}`, { headers: h })
      .then((r) => setPillars(r.data?.pillars || []))
      .catch(() => setPillars([]));
  }, []);

  // Fetch Sparks + Dust so the Crystalline Silhouette can react
  useEffect(() => {
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') return;
    const h = { Authorization: `Bearer ${token}` };
    const load = async () => {
      try {
        const [s, w] = await Promise.allSettled([
          axios.get(`${API}/sparks/wallet`, { headers: h }),
          axios.get(`${API}/treasury/balance`, { headers: h }),
        ]);
        setAvatarStats({
          sparks: s.status === 'fulfilled' ? (s.value.data?.sparks ?? 0) : 0,
          dust:   w.status === 'fulfilled' ? (w.value.data?.balance ?? w.value.data?.user_dust_balance ?? 0) : 0,
        });
      } catch { /* silent */ }
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  // Fetch RPG character equipment — Metabolic Mirror (binds gear → silhouette)
  useEffect(() => {
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') return;
    const h = { Authorization: `Bearer ${token}` };
    const loadGear = async () => {
      try {
        const r = await axios.get(`${API}/rpg/character`, { headers: h });
        setEquipment(r.data?.equipped || r.data?.equipment || null);
      } catch { /* silent — procedural defaults kick in */ }
    };
    loadGear();
    // Refresh on a custom event so other pages (RPG loadout screen) can trigger
    const onGearChange = () => loadGear();
    window.addEventListener('sovereign:gear-change', onGearChange);
    return () => window.removeEventListener('sovereign:gear-change', onGearChange);
  }, []);

  // Fetch the user's real AI portrait + profile (identity anchors the silhouette)
  useEffect(() => {
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') return;
    const h = { Authorization: `Bearer ${token}` };
    const loadIdentity = async () => {
      const [p, a] = await Promise.allSettled([
        axios.get(`${API}/profile/me`, { headers: h }),
        axios.get(`${API}/ai-visuals/my-avatar`, { headers: h }),
      ]);
      if (p.status === 'fulfilled') setProfile(p.value.data || null);
      if (a.status === 'fulfilled' && a.value.data?.status === 'active' && a.value.data?.image_b64) {
        setAvatarB64(a.value.data.image_b64);
      }
    };
    loadIdentity();
    const onProfileChange = () => loadIdentity();
    window.addEventListener('sovereign:profile-change', onProfileChange);
    return () => window.removeEventListener('sovereign:profile-change', onProfileChange);
  }, []);

  // Merge positions with pillar data (preserves declared order)
  const pillarNodes = useMemo(() => {
    return PILLAR_POSITIONS.map((pp) => {
      const p = pillars.find((x) => x.id === pp.id);
      return p ? { ...p, position: pp.position } : null;
    }).filter(Boolean);
  }, [pillars]);

  const active = pillarNodes.find((p) => p.id === activeId) || null;
  const hovered = pillarNodes.find((p) => p.id === hoveredId) || null;

  const onActivate = useCallback((pillar) => {
    setActiveId((cur) => (cur === pillar.id ? null : pillar.id));
    if (soundOn) playResonanceTone(RESONANCE_TONE[pillar.id] || 528, audioCtxRef);
  }, [soundOn]);

  const onHoverEnter = useCallback((pillar) => {
    setHoveredId(pillar.id);
    // OBSIDIAN nodes emit their resonance tone on hover (throttled to 1/sec)
    if (pillar.state === 'OBSIDIAN' && soundOn) {
      const now = performance.now();
      if (now - lastHoverToneRef.current > 1200) {
        lastHoverToneRef.current = now;
        playResonanceTone(RESONANCE_TONE[pillar.id] || 528, audioCtxRef);
      }
    }
  }, [soundOn]);

  const onHoverLeave = useCallback(() => setHoveredId(null), []);

  return (
    <div data-testid="fractal-engine-page" style={{ width: '100vw', height: '100vh', background: '#050505', position: 'relative', overflow: 'hidden' }}>
      {/* HUD — back button + title + sound toggle */}
      <div style={{
        position: 'absolute', top: 18, left: 18, zIndex: 5,
        color: '#00ffcc', fontFamily: 'monospace', fontSize: 12, letterSpacing: '2px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <button
          type="button"
          onClick={() => navigate('/sovereign-hub')}
          data-testid="fractal-engine-back"
          style={{ background: 'transparent', border: '1px solid rgba(0,255,204,0.4)', color: '#00ffcc', cursor: 'pointer', padding: '6px 10px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={14} /> HUB
        </button>
        <span>FRACTAL ENGINE · {displayName.toUpperCase()}</span>
        <button
          type="button"
          onClick={() => setSoundOn((s) => !s)}
          data-testid="fractal-engine-sound-toggle"
          title={soundOn ? 'Mute resonance tones' : 'Enable resonance tones'}
          style={{ background: 'transparent', border: '1px solid rgba(0,255,204,0.25)', color: soundOn ? '#00ffcc' : 'rgba(0,255,204,0.35)', cursor: 'pointer', padding: 6, borderRadius: 4, display: 'inline-flex', alignItems: 'center' }}
        >
          {soundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}
        </button>
      </div>

      {/* Persistent SovereignStageHUD (Sparks / Dust / Mission) */}
      <SovereignStageHUD anchor="top-right" />

      {/* Bottom hint */}
      <div style={{
        position: 'absolute', bottom: 140, left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(0,255,204,0.55)', fontFamily: 'monospace', fontSize: 10,
        letterSpacing: '3px', zIndex: 5, pointerEvents: 'none',
        whiteSpace: 'nowrap', textAlign: 'center',
      }}>
        <div style={{ color: profileColor || '#D4AF37', fontSize: 11, letterSpacing: '4px', marginBottom: 3, fontWeight: 700 }}>
          {displayName.toUpperCase()}
        </div>
        <div>WASD / ARROWS TO FLY · TAP YOUR FORM FOR SANCTUARY · FLY NEAR A PILLAR TO ENTER</div>
      </div>

      {/* Collected Sparks counter (top-center of the stage) */}
      {sparksCollected > 0 && (
        <div
          data-testid="fractal-sparks-collected"
          style={{
            position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,255,204,0.12)', border: '1px solid rgba(0,255,204,0.5)',
            borderRadius: 999, padding: '6px 14px', zIndex: 5,
            color: '#00ffcc', fontFamily: 'monospace', fontSize: 11, letterSpacing: '2px',
            backdropFilter: 'blur(10px)', pointerEvents: 'none',
          }}
        >
          +{sparksCollected} SPARKS COLLECTED
        </div>
      )}

      {/* Virtual D-pad (mobile + desktop convenience) */}
      <DPad moveDirRef={moveDirRef} />

      {/* Inline Pillar Readout Card (expands when a node is activated) */}
      {active && (
        <PillarReadout
          pillar={active}
          onClose={() => setActiveId(null)}
          onEnter={() => navigate(active.portal)}
        />
      )}
      {/* Subtle hover preview (no activation required) */}
      {!active && hovered && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) translateY(240px)',
          color: hovered.color, fontFamily: 'monospace', fontSize: 13, letterSpacing: '4px',
          textShadow: `0 0 20px ${hovered.color}aa`, zIndex: 4, pointerEvents: 'none',
          textAlign: 'center',
        }}>
          <div style={{ fontWeight: 700 }}>{hovered.label.toUpperCase()}</div>
          <div style={{ fontSize: 9, letterSpacing: '2px', opacity: 0.6, marginTop: 2 }}>
            {hovered.tagline.toUpperCase()} · {hovered.state}
          </div>
        </div>
      )}

      {/* 3D stage */}
      <Canvas
        camera={{ fov: 60, position: [0, 0, 9], near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050505']} />

        <ambientLight intensity={1.3} />
        <pointLight position={[10, 10, 10]} intensity={1.0} />
        <pointLight position={[-10, -10, 10]} intensity={0.55} color="#00ffcc" />

        <Suspense fallback={null}>
          <Starfield count={2000} />
          <GameController
            pillars={pillarNodes}
            equipment={equipment}
            avatarB64={avatarB64}
            profileColor={profileColor}
            sparks={avatarStats.sparks}
            dust={avatarStats.dust}
            onActivate={onActivate}
            onSparkCollect={(n) => {
              setSparksCollected((s) => s + n);
              // Optimistic client-side counter; background-credit it server-side
              const token = localStorage.getItem('zen_token');
              if (token && token !== 'guest_token') {
                axios.post(
                  `${API}/sparks/immersion`,
                  { seconds: 6 * n, zone: 'fractal_engine_orb' },
                  { headers: { Authorization: `Bearer ${token}` } },
                ).catch(() => {});
              }
              window.dispatchEvent(new CustomEvent('sovereign:immersion-tick'));
            }}
            onAvatarClick={() => navigate('/profile')}
            moveDirRef={moveDirRef}
          />
          {pillarNodes.map((p) => (
            <PillarNode
              key={p.id}
              pillar={p}
              position={p.position}
              isActive={activeId === p.id}
              isHovered={hoveredId === p.id}
              onActivate={onActivate}
              onHoverEnter={onHoverEnter}
              onHoverLeave={onHoverLeave}
            />
          ))}
          <CameraFlyController targetPos={active?.position || null} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// ── Inline readout card (expands on click, no modal — Flatland safe) ──
function PillarReadout({ pillar, onClose, onEnter }) {
  const stateBadge = (() => {
    switch (pillar.state) {
      case 'OBSIDIAN': return { label: 'OBSIDIAN', color: '#D4AF37' };
      case 'BLOOM':    return { label: 'BLOOM',    color: pillar.color };
      default:         return { label: 'WIREFRAME', color: 'rgba(255,255,255,0.5)' };
    }
  })();

  return (
    <div
      data-testid={`pillar-readout-${pillar.id}`}
      style={{
        position: 'absolute', top: 100, right: 20, zIndex: 6,
        width: 280, background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(14px)',
        border: `1px solid ${pillar.color}`,
        borderRadius: 12,
        padding: '18px 20px',
        color: '#fff', fontFamily: 'monospace',
        boxShadow: `0 0 36px ${pillar.color}44`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div>
          <div style={{ color: pillar.color, fontSize: 14, fontWeight: 700, letterSpacing: '2px' }}>
            {pillar.label.toUpperCase()}
          </div>
          <div style={{ fontSize: 10, letterSpacing: '1.5px', opacity: 0.55, marginTop: 2 }}>
            {pillar.tagline.toUpperCase()}
          </div>
        </div>
        <button
          onClick={onClose}
          data-testid={`pillar-readout-close-${pillar.id}`}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20, padding: 0, lineHeight: 1 }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', fontSize: 11, lineHeight: 1.6, marginBottom: 16 }}>
        <span style={{ opacity: 0.5 }}>STATE</span>
        <span style={{ color: stateBadge.color, fontWeight: 700 }}>{stateBadge.label}</span>
        <span style={{ opacity: 0.5 }}>IMMERSION</span>
        <span>{pillar.immersion_count ?? 0} visits</span>
        <span style={{ opacity: 0.5 }}>TEACHERS</span>
        <span>{pillar.teacher_quests_completed ?? 0} completed</span>
      </div>

      <button
        type="button"
        onClick={onEnter}
        data-testid={`pillar-enter-${pillar.id}`}
        style={{
          width: '100%',
          background: pillar.color,
          color: '#000',
          border: 'none',
          borderRadius: 6,
          padding: '10px 14px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: 11,
          letterSpacing: '2px',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        ENTER DOMAIN <ArrowRight size={14} />
      </button>
    </div>
  );
}

// ── Virtual D-pad — writes to moveDirRef so GameController picks it up ─
function DPad({ moveDirRef }) {
  const set = (x, y) => { if (moveDirRef.current) moveDirRef.current = { x, y }; };
  const clear = () => set(0, 0);
  const btn = (dx, dy, Icon, testid, style = {}) => (
    <button
      type="button"
      data-testid={testid}
      onPointerDown={(e) => { e.preventDefault(); set(dx, dy); }}
      onPointerUp={clear}
      onPointerCancel={clear}
      onPointerLeave={clear}
      onTouchStart={(e) => { e.preventDefault(); set(dx, dy); }}
      onTouchEnd={clear}
      style={{
        width: 46, height: 46,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(0,255,204,0.35)',
        borderRadius: 8,
        color: '#00ffcc',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        userSelect: 'none',
        touchAction: 'none',
        ...style,
      }}
    >
      <Icon size={16} />
    </button>
  );
  return (
    <div
      data-testid="fractal-dpad"
      style={{
        position: 'fixed', bottom: 280, left: 20, zIndex: 999,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 46px)',
        gridTemplateRows: 'repeat(3, 46px)',
        gap: 4,
        pointerEvents: 'auto',
      }}
    >
      <span />
      {btn(0,  1, ArrowUp,    'fractal-dpad-up')}
      <span />
      {btn(-1, 0, ArrowLeft,  'fractal-dpad-left')}
      <span />
      {btn( 1, 0, ArrowRight, 'fractal-dpad-right')}
      <span />
      {btn(0, -1, ArrowDown,  'fractal-dpad-down')}
      <span />
    </div>
  );
}

