import React, { Suspense, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. THE BRAIN: Environmental & Math Logic ---
const useSystemIntelligence = (altitude) => {
  return useMemo(() => {
    // Calculates atmospheric pressure (kPa) based on altitude (meters)
    // Essential for high-altitude culinary/wellness precision.
    const pressure = 101.325 * Math.pow(1 - 2.25577e-5 * altitude, 5.25588);
    return {
      pressure: pressure.toFixed(2),
      boilingPoint: (100 - (altitude / 300)).toFixed(1) // Rough estimation for cooking
    };
  }, [altitude]);
};

// --- 2. THE GEOMETRY: Fractal Data Node ---
function DataNode({ position, label, altitude, color }) {
  const meshRef = useRef();
  const [active, setActive] = useState(false);
  const { pressure, boilingPoint } = useSystemIntelligence(altitude);

  // Subtle fractal-like rotation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (active) {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
      }
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh
        ref={meshRef}
        position={position}
        onClick={() => setActive(!active)}
      >
        {/* Geometry becomes more complex (non-generic) when active */}
        <icosahedronGeometry args={[1, active ? 15 : 2]} />
        <meshStandardMaterial 
          color={active ? color : "#333333"} 
          wireframe={!active} 
          emissive={active ? color : "#000000"}
          emissiveIntensity={0.5}
        />
        
        {active && (
          <Text
            position={[0, 2, 0]}
            fontSize={0.25}
            color="white"
            font="https://fonts.gstatic.com/s/raleway/v22/1Ptxg8zYS_SKggPN4iEgvnxyumZJW6Sj5Xi-J6H9ksV_.woff"
          >
            {`${label.toUpperCase()}\nAltitude: ${altitude}m\nPressure: ${pressure}kPa\nBoil Pt: ${boilingPoint}°C`}
          </Text>
        )}
      </mesh>
    </Float>
  );
}

// --- 3. THE INTERFACE: The Main Application ---
export default function FractalEngine() {
  return (
    <div style={{ width: "100%", minHeight: "200vh", background: "#020202", color: "white" }}>
      
      {/* 3D BACKGROUND LAYER (Fixed so it doesn't move when you scroll) */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1} />
          
          <Suspense fallback={null}>
            {/* System Nodes mapped to your specific interests */}
            <DataNode position={[-4, 1, 0]} label="Wellness Engine" altitude={1100} color="#00ffcc" />
            <DataNode position={[0, -1, 0]} label="Fractal Core" altitude={1500} color="#ff00ff" />
            <DataNode position={[4, 1, 0]} label="Culinary Logic" altitude={975} color="#ffff00" />
          </Suspense>

          {/* OrbitControls modified to allow page scrolling */}
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      {/* CONTENT LAYER (This layer scrolls OVER the 3D world) */}
      <div style={{ position: "relative", zIndex: 1, padding: "50px", pointerEvents: "none" }}>
        <header style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ fontSize: "4rem", margin: 0 }}>ENLIGHTEN.MINT.CAFE</h1>
          <p style={{ fontSize: "1.2rem", maxWidth: "600px" }}>
            The page is now scrollable. The 3D nodes remain in the background as you move through 
            your "In-Depth" system. Click the geometric shapes to reveal environmental data.
          </p>
          <div style={{ marginTop: "20px", fontSize: "0.9rem", opacity: 0.6 }}>↓ Scroll for more depth</div>
        </header>

        <section style={{ height: "100vh", paddingTop: "100px", pointerEvents: "auto" }}>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "40px", borderRadius: "15px", backdropFilter: "blur(10px)", maxWidth: "800px" }}>
            <h2>System Established</h2>
            <p>This section is now interactable. You can add your recipes, business plans, or engineering formulas here.</p>
            <button style={{ padding: "10px 20px", cursor: "pointer", background: "#00ffcc", border: "none", borderRadius: "5px" }}>
              Push to Main System
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
