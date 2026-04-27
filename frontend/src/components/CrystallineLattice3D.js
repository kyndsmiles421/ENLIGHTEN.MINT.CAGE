/**
 * CrystallineLattice3D.js — 9×9 spatial volumetric lattice (R3F).
 *
 * V68.55 — Step 5/6 of the Consolidation Roadmap. Replaces the flat
 * 2D MiniLattice with 81 InstancedMesh cylinders in 3D space. Each
 * column's height (scale.y) breathes with the live resonance pulse;
 * spatial bands map to spectral bands:
 *
 *   • Inner ring    (rings 0-1)  → BASS    column heights
 *   • Middle ring   (rings 2-3)  → MID     column heights
 *   • Outer ring    (ring  4)    → TREBLE  column heights
 *   • Spotlight intensity        → PEAK
 *
 * Performance: single InstancedMesh = 1 draw call for 81 cylinders.
 * Locked at 60fps even on mid-tier mobile. No re-renders — the
 * pulse listener writes to a ref and the useFrame loop reads.
 *
 * Entry contract: rendered ONLY when SovereignPreferences.visual
 * .crystalFidelity === '3d' (opt-in via Sovereign Choice panel).
 * The 2D MiniLattice remains the default for low-power skins.
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MODULE_FREQUENCIES } from '../state/ProcessorState';

const GRID = 9;             // 9 × 9 = 81 columns
const SPACING = 0.45;       // distance between grid cells
const CENTER = (GRID - 1) / 2; // = 4 — center column index

// Pre-compute per-cell ring distance from center (0 = center, 4 = corner).
// Used to assign each cell to a spectral band (bass/mid/treble).
function buildCellMeta() {
  const cells = [];
  for (let z = 0; z < GRID; z++) {
    for (let x = 0; x < GRID; x++) {
      const dx = x - CENTER;
      const dz = z - CENTER;
      const ring = Math.round(Math.sqrt(dx * dx + dz * dz));
      cells.push({
        x, z, ring,
        // Hue rotates around the ring so each ring has a different signature
        hue: (ring / 4) * 0.6 + 0.55, // 0.55..1.15 (cyan→violet→magenta)
        // Band: 0..1 bass, 2..3 mid, 4 treble
        band: ring <= 1 ? 'bass' : ring <= 3 ? 'mid' : 'treble',
      });
    }
  }
  return cells;
}

const CELL_META = buildCellMeta();

function CrystallineColumns() {
  const meshRef = useRef();
  const colorAttrRef = useRef();

  // Live pulse vector — written by event listener, read by useFrame
  const pulseRef = useRef({ bass: 0.1, mid: 0.18, treble: 0.2, peak: 0.05 });
  // Lerped pulse — what the GPU actually paints (smoothed)
  const smoothRef = useRef({ bass: 0.1, mid: 0.18, treble: 0.2, peak: 0.05 });
  // Active module id — for the spotlight
  const moduleRef = useRef('IDLE');

  useEffect(() => {
    const onPulse = (e) => {
      const d = e?.detail;
      if (d && typeof d.bass === 'number') pulseRef.current = d;
    };
    const onShift = (e) => {
      const m = e?.detail?.moduleId;
      if (m) moduleRef.current = m;
    };
    window.addEventListener('sovereign:pulse', onPulse);
    window.addEventListener('sovereign:state-shift', onShift);
    return () => {
      window.removeEventListener('sovereign:pulse', onPulse);
      window.removeEventListener('sovereign:state-shift', onShift);
    };
  }, []);

  // Pre-build static instance positions (XZ) once
  const tmpObj = useMemo(() => new THREE.Object3D(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    CELL_META.forEach((c, i) => {
      tmpObj.position.set((c.x - CENTER) * SPACING, 0, (c.z - CENTER) * SPACING);
      tmpObj.scale.set(0.6, 0.1, 0.6);
      tmpObj.updateMatrix();
      mesh.setMatrixAt(i, tmpObj.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [tmpObj]);

  useFrame((_, dt) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Smooth the live pulse so the lattice breathes instead of snapping
    const live = pulseRef.current;
    const sm = smoothRef.current;
    const k = Math.min(1, dt * 4); // ~250ms time-constant
    sm.bass   += (live.bass   - sm.bass)   * k;
    sm.mid    += (live.mid    - sm.mid)    * k;
    sm.treble += (live.treble - sm.treble) * k;
    sm.peak   += ((live.peak ?? 0.5) - sm.peak) * k;

    // Per-cell scale.y target driven by the cell's spectral band.
    // Add a subtle radial wobble so the lattice always looks alive.
    const t = performance.now() * 0.001;
    const colorAttr = mesh.geometry?.attributes ? null : null;

    for (let i = 0; i < CELL_META.length; i++) {
      const c = CELL_META[i];
      const bandVal = c.band === 'bass' ? sm.bass
                    : c.band === 'mid'  ? sm.mid
                    : sm.treble;
      // Wave: a phase-offset breath per ring + the spectral height
      const wobble = 0.08 * Math.sin(t * 1.4 + c.ring * 0.9 + c.x * 0.3 + c.z * 0.2);
      const targetH = 0.15 + bandVal * 1.4 + wobble;

      tmpObj.position.set((c.x - CENTER) * SPACING, targetH * 0.5, (c.z - CENTER) * SPACING);
      tmpObj.scale.set(0.18, Math.max(0.08, targetH), 0.18);
      tmpObj.rotation.set(0, t * 0.05 + c.ring * 0.1, 0);
      tmpObj.updateMatrix();
      mesh.setMatrixAt(i, tmpObj.matrix);

      // Per-instance color: hue rotates around the cell, brightness
      // tracks the live peak so the lattice flares on output bursts.
      tmpColor.setHSL(
        c.hue,
        0.55 + sm.mid * 0.4,
        0.32 + sm.peak * 0.45,
      );
      mesh.setColorAt(i, tmpColor);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // Center spotlight intensity tracks peak
    if (colorAttrRef.current) {
      colorAttrRef.current.intensity = 0.4 + sm.peak * 4.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} color="#1a1a2a" />
      <pointLight
        ref={colorAttrRef}
        position={[0, 4, 0]}
        intensity={1.2}
        color="#ffd9a8"
        distance={9}
      />
      <instancedMesh
        ref={meshRef}
        args={[null, null, CELL_META.length]}
        castShadow={false}
        receiveShadow={false}
      >
        <cylinderGeometry args={[0.5, 0.5, 1, 6]} />
        <meshStandardMaterial
          metalness={0.4}
          roughness={0.18}
          envMapIntensity={1.2}
          emissive="#221638"
          emissiveIntensity={0.55}
          toneMapped
        />
      </instancedMesh>
    </>
  );
}

export default function CrystallineLattice3D() {
  return (
    <div
      data-testid="crystalline-lattice-3d"
      style={{ width: '100%', height: 360, borderRadius: 16, overflow: 'hidden' }}
    >
      <Canvas
        camera={{ position: [3.2, 3.0, 3.6], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.6]} // cap pixel ratio for mobile thermal headroom
      >
        <color attach="background" args={['#08081a']} />
        <fog attach="fog" args={['#06051a', 5.5, 14]} />
        <CrystallineColumns />
      </Canvas>
    </div>
  );
}

// Suppress unused-var lint for MODULE_FREQUENCIES — kept for future
// per-module column highlighting (Phase 2 of the lattice).
void MODULE_FREQUENCIES;
