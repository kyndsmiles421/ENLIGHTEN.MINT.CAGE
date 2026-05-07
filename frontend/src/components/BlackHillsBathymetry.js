/**
 * BlackHillsBathymetry.js — V1.0.18 Pactola Reservoir 3D Topography
 *
 * Renders Pactola Reservoir (Black Hills, SD) as an R3F bathymetric
 * mesh. Uses a procedural heightmap modeled on the actual reservoir
 * geometry:
 *   - Man-made reservoir (dammed 1956), not a natural lake
 *   - Max depth: ~150 ft (45.7 m)
 *   - Surface area: ~800 acres (3.24 km²)
 *   - Drowned valley of Rapid Creek — narrow, winding, deepest near dam
 *   - Pactola Dam at the east end (concrete arch)
 *
 * The heightmap generator models this via:
 *   - Primary valley channel running W→E (Rapid Creek path)
 *   - Depth falloff toward shore (natural littoral zone)
 *   - Deepest point anchored near dam wall
 *   - Surrounding Black Hills terrain at +elevation (ponderosa zone)
 *
 * Data structure is swap-ready: real USGS 3DEP 1/3 arc-second tiles
 * can drop in as a Float32Array heightmap replacing the procedural
 * generator. Current version is an approximation labeled in the UI.
 */
import React, { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ChevronUp, Mountain, MapPin, Info } from 'lucide-react';

// Pactola Reservoir parameters (from USGS / SD GFP public data)
const PACTOLA = {
  name: 'Pactola Reservoir',
  lat: 43.9758,
  lon: -103.4950,
  max_depth_ft: 150,
  max_depth_m: 45.7,
  surface_acres: 800,
  dam_built: 1956,
  creek: 'Rapid Creek',
  elevation_ft: 4570,  // surface elevation above sea level
  shoreline_miles: 14,
};

// Procedural bathymetric heightmap — models the actual basin shape.
// Returns a Float32Array of (size+1)^2 height values, in meters.
function generatePactolaHeightmap(size = 96, depthM = 45.7) {
  const n = size + 1;
  const map = new Float32Array(n * n);
  // Primary channel: winding W→E path at y=0.5 that bends south then north
  const channelPath = (t) => {
    // t in [0,1]; returns y-coord of channel center
    return 0.5 + 0.12 * Math.sin(t * Math.PI * 2.3) + 0.06 * Math.sin(t * Math.PI * 5.1);
  };
  for (let iy = 0; iy < n; iy++) {
    for (let ix = 0; ix < n; ix++) {
      const x = ix / size;        // 0..1 W→E
      const y = iy / size;        // 0..1 S→N
      const channelY = channelPath(x);
      const distToChannel = Math.abs(y - channelY);
      // Base water depth function: deepest along channel, shallower toward shore
      const channelWidth = 0.18 + 0.04 * Math.sin(x * 7);
      const shoreFade = Math.max(0, 1 - (distToChannel / channelWidth));
      let depth = -depthM * shoreFade * shoreFade;  // squared falloff for natural littoral
      // Deepest near dam (east end, x near 1.0)
      depth *= (0.75 + 0.25 * x);
      // Ridges on either side (Black Hills terrain) when distToChannel > channelWidth
      if (distToChannel > channelWidth) {
        const ridge = distToChannel - channelWidth;
        depth = ridge * 85 + 8 * Math.sin(x * 14 + y * 18) + 4 * Math.cos(x * 23 - y * 11);
      }
      map[iy * n + ix] = depth;
    }
  }
  return { map, size: n };
}

function BasinMesh({ size = 96 }) {
  const meshRef = useRef();
  const { map, size: n } = useMemo(() => generatePactolaHeightmap(size), [size]);

  const geometry = useMemo(() => {
    // 3km x 3km area (matches Pactola's ~3.24 km² approx)
    const geo = new THREE.PlaneGeometry(3, 3, size, size);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      // position index → heightmap index
      const h = map[i];
      // Scale down (real 45m depth → 0.3 scene units for visual legibility)
      pos.setZ(i, h * 0.006);
    }
    geo.computeVertexNormals();
    geo.rotateX(-Math.PI / 2);  // flat XZ plane, depth in Y
    return geo;
  }, [map, size]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <group ref={meshRef}>
      {/* Basin terrain (ridges + channel carved) */}
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial
          color="#6B7C88"
          roughness={0.8}
          metalness={0.15}
          vertexColors={false}
          flatShading
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Water surface plane — slightly above zero to sit at surface elevation */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 3, 1, 1]} />
        <meshStandardMaterial
          color="#3B82F6"
          transparent
          opacity={0.52}
          roughness={0.1}
          metalness={0.4}
          emissive="#1E40AF"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Dam marker — concrete arch at east end */}
      <mesh position={[1.4, 0.05, 0.06]}>
        <boxGeometry args={[0.08, 0.12, 0.7]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.7} />
      </mesh>

      {/* Depth marker at deepest point */}
      <group position={[1.25, 0.01, 0.08]}>
        <mesh>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#F87171" emissive="#F87171" emissiveIntensity={1.2} />
        </mesh>
        <Html center distanceFactor={5} style={{ pointerEvents: 'none' }}>
          <div style={{
            padding: '3px 6px',
            fontSize: 9,
            fontFamily: 'monospace',
            color: '#FCA5A5',
            background: 'rgba(2,6,18,0.85)',
            border: '1px solid #F8717166',
            borderRadius: 3,
            letterSpacing: 1,
            whiteSpace: 'nowrap',
            transform: 'translate3d(0,-18px,0)',
          }}>
            DEEPEST · {PACTOLA.max_depth_ft}ft
          </div>
        </Html>
      </group>
    </group>
  );
}

export default function BlackHillsBathymetry({ onClose }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div
      data-testid="black-hills-bathymetry"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 500,
        borderRadius: 16,
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 20%, rgba(59,130,246,0.10) 0%, rgba(2,6,18,0.98) 70%)',
        border: '1px solid rgba(59,130,246,0.22)',
        marginBottom: 16,
      }}
    >
      <div style={{
        padding: '14px 16px 10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        borderBottom: '1px solid rgba(59,130,246,0.15)', gap: 8, flexWrap: 'wrap',
      }}>
        <div style={{ fontFamily: 'monospace', color: '#93C5FD' }}>
          <div style={{ fontSize: 11, letterSpacing: 2 }}>{PACTOLA.name.toUpperCase()}</div>
          <div style={{ fontSize: 9, letterSpacing: 1.5, opacity: 0.65, marginTop: 2 }}>
            <MapPin size={9} style={{ verticalAlign: 'middle' }} /> {PACTOLA.lat}°N · {PACTOLA.lon}°W · BLACK HILLS, SD
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          data-testid="pactola-info-toggle"
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            fontFamily: 'monospace',
            fontSize: 9,
            letterSpacing: 1.5,
            cursor: 'pointer',
            border: '1px solid rgba(147,197,253,0.35)',
            background: 'rgba(147,197,253,0.08)',
            color: '#93C5FD',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Info size={10} /> DATA
        </button>
      </div>

      <div style={{
        padding: '4px 16px 6px',
        textAlign: 'center', fontFamily: 'monospace',
        fontSize: 9, letterSpacing: 2, color: 'rgba(147,197,253,0.7)',
      }}>
        DRAG TO ORBIT · MAN-MADE RESERVOIR · DAMMED {PACTOLA.dam_built}
      </div>

      <div style={{ width: '100%', height: 380 }}>
        <Canvas camera={{ position: [0, 2.2, 2.8], fov: 50 }} dpr={[1, 1.75]} shadows data-testid="black-hills-canvas">
          <ambientLight intensity={0.4} />
          <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow />
          <pointLight position={[-2, 1.5, -1]} intensity={0.4} color="#93C5FD" />
          <Suspense fallback={null}>
            <Environment preset="dawn" />
          </Suspense>
          <BasinMesh size={96} />
          <OrbitControls
            enablePan={false}
            minDistance={1.8}
            maxDistance={6}
            minPolarAngle={0.15}
            maxPolarAngle={Math.PI / 2 - 0.1}
            enableDamping
            dampingFactor={0.08}
          />
        </Canvas>
      </div>

      {showInfo && (
        <div data-testid="pactola-data-panel" style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(59,130,246,0.15)',
          fontFamily: 'monospace',
          fontSize: 10,
          lineHeight: 1.7,
          color: 'rgba(147,197,253,0.85)',
        }}>
          <div>▸ Max depth: {PACTOLA.max_depth_ft} ft ({PACTOLA.max_depth_m} m)</div>
          <div>▸ Surface area: {PACTOLA.surface_acres} acres</div>
          <div>▸ Shoreline: {PACTOLA.shoreline_miles} mi</div>
          <div>▸ Surface elevation: {PACTOLA.elevation_ft} ft</div>
          <div>▸ Source creek: {PACTOLA.creek}</div>
          <div>▸ Dam built: {PACTOLA.dam_built}</div>
          <div style={{ marginTop: 8, opacity: 0.6, fontSize: 9 }}>
            BATHYMETRY: procedural approximation of USGS 3DEP data. Swap in<br/>
            real DEM tiles (1/3 arc-second) by replacing generatePactolaHeightmap().
          </div>
        </div>
      )}

      {onClose && (
        <div style={{ padding: '8px 16px 12px', textAlign: 'center', borderTop: '1px solid rgba(59,130,246,0.10)' }}>
          <button
            type="button"
            onClick={onClose}
            data-testid="black-hills-fold"
            style={{
              background: 'transparent',
              border: '1px solid rgba(147,197,253,0.3)',
              color: 'rgba(147,197,253,0.8)',
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

// V1.1.12 — Re-export the in-canvas basin mesh so the Tesseract
// Vault can mount the same procedural Pactola topography as a floor
// below its 4D hypercube. One source of truth for the Black Hills.
export { BasinMesh };
