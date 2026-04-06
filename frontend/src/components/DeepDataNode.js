import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * DeepDataNode - 3D Interactive Data Visualization
 * The Enlightenment Cafe | Fractal Engine Component
 * 
 * Scales complexity based on user interaction and environmental variables.
 * Used for: Cosmic Map nodes, Achievement orbs, Wellness data points
 */
const DeepDataNode = ({ position, baseData, altitude = 0 }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  // High-altitude adjustment logic (e.g., for Rapid City ~1000m)
  const atmosphericPressure = useMemo(() => {
    // Standard physics formula for pressure based on altitude (meters)
    return 101325 * Math.pow(1 - 2.25577e-5 * altitude, 5.25588);
  }, [altitude]);

  // Fractal Engine animation loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Rotate based on data density
      meshRef.current.rotation.x = Math.sin(time / 2) * (active ? 2 : 0.5);
      meshRef.current.rotation.y += active ? 0.02 : 0.005;
      meshRef.current.position.y = position[1] + Math.sin(time) * 0.1;
      
      // Smooth scale transition on hover/active
      const scaleFactor = hovered ? 1.5 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(scaleFactor, scaleFactor, scaleFactor), 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* Geometry complexity increases as the user "dives" in.
          Inactive: Low-poly wireframe (detail: 2)
          Active: High-poly solid (detail: 15)
      */}
      <icosahedronGeometry args={[1, active ? 15 : 2]} />
      <meshStandardMaterial 
        color={active ? "#4deeea" : "#747474"} 
        wireframe={!active}
        metalness={0.8}
        roughness={0.2}
        emissive={active ? "#4deeea" : "#000000"}
        emissiveIntensity={active ? 0.3 : 0}
      />
      {active && (
        <DataLabel 
          text={`${baseData?.label || 'Node'} | Alt: ${altitude}m | Pres: ${(atmosphericPressure/1000).toFixed(1)}kPa`} 
        />
      )}
    </mesh>
  );
};

/**
 * DataLabel - 3D Text overlay for active nodes
 * Placeholder for spatial text rendering
 */
const DataLabel = ({ text }) => (
  <group position={[0, 1.5, 0]}>
    {/* Future: Implement 3D Text with @react-three/drei Text component */}
    {/* <Text fontSize={0.2} color="#ffffff">{text}</Text> */}
  </group>
);

export default DeepDataNode;
