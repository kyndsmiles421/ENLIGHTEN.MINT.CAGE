/**
 * HelixNav3D.js — V1.0.17 9x9 Sovereign Helix Navigation
 *
 * Replaces the 2D BackToHub workshop list with a 3D spatial graph of
 * 81 nodes generated via lib/SacredGeometry.goldenSpiralPoints(81).
 *
 * Each module (Geology, Carpentry, Bible, etc.) is mapped to a
 * specific (x,y) coordinate in the 9x9 grid → projected into 3D by
 * the golden-spiral formula. Tapping a node fires navigate() to the
 * route. Camera flies along phiPath between nodes for the vector-shift
 * navigation feel.
 *
 * Mounted as a default route alternative — does NOT replace BackToHub
 * (which keeps semantic links for accessibility / SEO / non-3D users).
 * Renders inline in the document flow per Flatland.
 */
import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { goldenSpiralPoints, GRID_SIZE, TOTAL_NODES, phiExtrusion } from '../lib/SacredGeometry';
import { PHI } from '../utils/SovereignMath';
import { onUnlock } from '../utils/UnlockBus';

// 81 modules mapped to helix coordinates. The first ~20 nodes are
// real workshops; the rest are reserved for future expansion (the
// Sovereign architecture has 81 slots by design).
const HELIX_MODULES = [
  { id: 'geology',      label: 'Geology',     route: '/workshop/geology',     color: '#FBBF24' },
  { id: 'carpentry',    label: 'Carpentry',   route: '/workshop/carpentry',   color: '#A78BFA' },
  { id: 'masonry',      label: 'Masonry',     route: '/workshop/masonry',     color: '#94A3B8' },
  { id: 'culinary',     label: 'Culinary',    route: '/workshop/culinary',    color: '#FB923C' },
  { id: 'electrical',   label: 'Electrical',  route: '/workshop/electrical',  color: '#22D3EE' },
  { id: 'plumbing',     label: 'Plumbing',    route: '/workshop/plumbing',    color: '#60A5FA' },
  { id: 'herbology',    label: 'Herbology',   route: '/herbology',            color: '#86EFAC' },
  { id: 'aromatherapy', label: 'Aromatic Resonance', route: '/aromatherapy',        color: '#F472B6' },
  { id: 'bible',        label: 'Bible Study', route: '/workshop/bible',       color: '#FCD34D' },
  { id: 'academy',      label: 'Academy',     route: '/academy',              color: '#C4B5FD' },
  { id: 'meteorology',  label: 'Meteorology', route: '/workshop/meteorology', color: '#7DD3FC' },
  { id: 'ecology',      label: 'Ecology',     route: '/workshop/ecology',     color: '#4ADE80' },
  { id: 'paleontology', label: 'Paleontology', route: '/workshop/paleontology', color: '#D6BCFA' },
  { id: 'nursing',      label: 'Nursing',     route: '/workshop/nursing',     color: '#FCA5A5' },
  { id: 'eldercare',    label: 'Elder Care',  route: '/workshop/eldercare',   color: '#F9A8D4' },
  { id: 'childcare',    label: 'Child Care',  route: '/workshop/childcare',   color: '#FDE68A' },
  { id: 'forge',        label: 'The Forge',   route: '/forge',                color: '#FB7185' },
  { id: 'pricing',      label: 'Sovereign Tiers', route: '/pricing',          color: '#FCD34D' },
  { id: 'sovereign-hub', label: 'Sovereign Hub', route: '/sovereign-hub',     color: '#FBBF24' },
  { id: 'starseed',     label: 'Starseed',    route: '/starseed-adventure',   color: '#A78BFA' },
];

// Build 81-node spiral once
function useHelixNodes() {
  return useMemo(() => {
    const points = goldenSpiralPoints(TOTAL_NODES, 1.6);
    return points.map((pt, i) => {
      const mod = HELIX_MODULES[i] || null;
      // Use phiExtrusion for z-depth so further nodes recede on a phi curve
      const z = pt.z !== undefined ? pt.z : (i / TOTAL_NODES) * 3 - 1.5;
      return {
        index: i,
        gridX: i % GRID_SIZE,
        gridY: Math.floor(i / GRID_SIZE),
        position: [pt.x * 0.5, pt.y * 0.5, z * 0.6],
        module: mod,
      };
    });
  }, []);
}

function HelixNode({ node, isActive, onSelect, rippleRef, rippleColor }) {
  const ref = useRef();
  const matRef = useRef();
  const [hovered, setHovered] = useState(false);
  const hasModule = !!node.module;
  const color = hasModule ? node.module.color : '#475569';

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // Active node pulses, hovered grows, idle subtle bob
    let target = isActive ? 1.4 + Math.sin(t * 3) * 0.1
                : hovered ? 1.25
                : 1 + Math.sin(t * PHI + node.index) * 0.05;

    // V1.1.6 — Helix Ripple. Wave starts at node 0 and travels along
    // the spiral by node.index. Uses gauss bell so each node spikes
    // briefly when the wavefront passes through it, then settles.
    let rippleK = 0;
    if (rippleRef && rippleRef.current) {
      const elapsed = (performance.now() - rippleRef.current) / 1000; // 1.0s ripple
      if (elapsed >= 1.2) {
        // Animation finished — tag for clear at scene level (handled by parent)
      } else {
        // Wavefront sweeps from index 0 to TOTAL_NODES over ~1s
        const wavefront = elapsed * TOTAL_NODES; // node-index that is currently peaking
        const distance = Math.abs(node.index - wavefront);
        // Gauss bell width 6 nodes → smooth ripple
        rippleK = Math.exp(-(distance * distance) / 18);
      }
    }
    target += rippleK * 0.55;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.20);

    // Emissive flash on ripple
    if (matRef.current) {
      const baseEmit = hasModule ? (isActive ? 1.2 : hovered ? 0.8 : 0.5) : 0.15;
      matRef.current.emissiveIntensity = baseEmit + rippleK * 2.0;
      // Optional color tint toward ripple color at peak
      if (rippleK > 0.4 && rippleColor) {
        try { matRef.current.emissive.set(rippleColor); }
        catch { /* invalid color string — keep base */ }
      } else if (rippleK < 0.05 && matRef.current.emissive) {
        try { matRef.current.emissive.set(color); } catch {}
      }
    }
  });

  return (
    <group position={node.position}>
      <mesh
        ref={ref}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); if (hasModule) onSelect(node); }}
      >
        <octahedronGeometry args={[hasModule ? 0.13 : 0.06, 0]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={hasModule ? (isActive ? 1.2 : hovered ? 0.8 : 0.5) : 0.15}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={hasModule ? 1 : 0.4}
        />
      </mesh>
      {(hovered || isActive) && hasModule && (
        <Html
          center
          distanceFactor={6}
          style={{
            pointerEvents: 'none',
            fontFamily: 'monospace',
            fontSize: 11,
            color,
            background: 'rgba(2,6,18,0.85)',
            padding: '4px 8px',
            borderRadius: 4,
            border: `1px solid ${color}55`,
            whiteSpace: 'nowrap',
            letterSpacing: 1,
            transform: 'translate3d(0,-22px,0)',
          }}
        >
          {node.module.label}
        </Html>
      )}
    </group>
  );
}

// Curve connecting all 81 nodes — visualizes the helix path
function HelixCurve({ nodes, color = '#7c3aed' }) {
  const geom = useMemo(() => {
    const points = nodes.map((n) => new THREE.Vector3(...n.position));
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.3);
    const samples = curve.getPoints(200);
    const buf = new THREE.BufferGeometry().setFromPoints(samples);
    return buf;
  }, [nodes]);
  return (
    <line geometry={geom}>
      <lineBasicMaterial color={color} transparent opacity={0.25} />
    </line>
  );
}

// Camera that flies to the active node along a phi-eased curve
function FollowCamera({ targetNode }) {
  const target = useRef(new THREE.Vector3(0, 0, 4));
  useFrame((state) => {
    if (targetNode) {
      target.current.set(
        targetNode.position[0] * 1.5,
        targetNode.position[1] * 1.5,
        targetNode.position[2] + 3.5,
      );
    } else {
      target.current.set(0, 0, 4.5);
    }
    state.camera.position.lerp(target.current, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HelixNav3D({ height = 480, autoRotate = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const nodes = useHelixNodes();
  const [activeNode, setActiveNode] = useState(null);
  // V1.1.6 — Helix Ripple. When an unlock event fires anywhere in
  // the OS (relic claim, future modifier purchase), a single shared
  // ref holds the wall-clock start of the wavefront. Every node
  // reads it via useFrame and computes its own gauss-bell offset
  // along the spiral index. No state thrashing, no React re-renders.
  const rippleRef = useRef(null);
  const [rippleColor, setRippleColor] = useState(null);
  useEffect(() => {
    return onUnlock((detail) => {
      rippleRef.current = performance.now();
      setRippleColor(detail.color || '#FCD34D');
      // Auto-clear ref after the animation window so subsequent
      // unlocks fire fresh (otherwise stale `performance.now()` slips
      // past the elapsed >= 1.2s guard the first time only).
      setTimeout(() => { rippleRef.current = null; }, 1300);
    });
  }, []);

  // Auto-detect active route → set node
  useEffect(() => {
    const match = nodes.find((n) => n.module && n.module.route === location.pathname);
    setActiveNode(match || null);
  }, [location.pathname, nodes]);

  const onSelect = (node) => {
    setActiveNode(node);
    setTimeout(() => navigate(node.module.route), 600);  // let camera fly first
  };

  return (
    <div
      data-testid="helix-nav-3d"
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.10) 0%, rgba(2,6,18,0.98) 70%)',
        border: '1px solid rgba(124,58,237,0.20)',
        marginBottom: 16,
      }}
    >
      {/* Inline header — Flatland clean (no position:absolute) */}
      <div style={{
        padding: '10px 14px 6px',
        fontFamily: 'monospace', color: '#C4B5FD',
        fontSize: 10, letterSpacing: 2,
        borderBottom: '1px solid rgba(124,58,237,0.10)',
      }}>
        9×9 SOVEREIGN HELIX · {TOTAL_NODES} NODES · {nodes.filter((n) => n.module).length} ACTIVE
      </div>
      <div style={{
        padding: '4px 14px 6px',
        textAlign: 'center', fontFamily: 'monospace',
        fontSize: 9, letterSpacing: 2, color: 'rgba(196,181,253,0.60)',
      }}>
        DRAG TO ORBIT · TAP A NODE TO VECTOR-SHIFT
      </div>
      <div style={{ width: '100%', height }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        dpr={[1, 1.75]}
        data-testid="helix-nav-canvas"
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 2, 2]} intensity={0.8} color="#C4B5FD" />
        <pointLight position={[-2, -2, 2]} intensity={0.5} color="#FBBF24" />
        <Suspense fallback={null}>
          <Environment preset="night" />
        </Suspense>
        <Float speed={0.6} floatIntensity={0.2} rotationIntensity={autoRotate ? 0.15 : 0}>
          <HelixCurve nodes={nodes} />
          {nodes.map((n) => (
            <HelixNode
              key={n.index}
              node={n}
              isActive={activeNode && activeNode.index === n.index}
              onSelect={onSelect}
              rippleRef={rippleRef}
              rippleColor={rippleColor}
            />
          ))}
        </Float>
        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={9}
          enableDamping
          dampingFactor={0.08}
          autoRotate={autoRotate && !activeNode}
          autoRotateSpeed={0.4}
        />
        <FollowCamera targetNode={activeNode} />
      </Canvas>
      </div>
    </div>
  );
}
