import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

// CORE LOGIC: Environmental sensitivity (Altitude/Pressure)
const useAtmosphericData = (altitude) => {
  return useMemo(() => {
    // Calculus-based pressure curve: P = P0 * (1 - L*h/T0)^(gM/RL)
    const pressure = 101.325 * Math.pow(1 - 2.25577e-5 * altitude, 5.25588);
    return pressure.toFixed(2);
  }, [altitude]);
};

function DataNode({ position, label, altitude }) {
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const pressure = useAtmosphericData(altitude);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh
        position={position}
        onClick={() => setActive(!active)}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        {/* Fractal geometry: resolution increases when active */}
        <icosahedronGeometry args={[1, active ? 12 : 2]} />
        <meshStandardMaterial 
          color={active ? "#00ffcc" : hovered ? "#555555" : "#222222"} 
          wireframe={!active} 
        />
        
        {active && (
          <Text
            position={[0, 1.5, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {`${label}\nPressure: ${pressure} kPa\nAlt: ${altitude}m`}
          </Text>
        )}
      </mesh>
    </Float>
  );
}

export default function FractalEngine() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#050505" }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        
        {/* Established System Nodes */}
        <DataNode position={[-3, 0, 0]} label="Wellness Engine" altitude={1000} />
        <DataNode position={[0, 2, 0]} label="Fractal Core" altitude={1500} />
        <DataNode position={[3, 0, 0]} label="Recipe Logic" altitude={500} />

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
