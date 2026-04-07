/**
 * ENLIGHTENMENT ENGINE: METATRON-FLOWER-HELIX CORE
 * Structure: Flower of Life inside Metatron's Cube
 * Materials: Gold/Silver/Copper Microfiber Inlay
 * Physics: White Light Refraction & Sprocket Rotation
 */

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

const CrystallineNode = ({ position, color, frequency, metalType }) => {
  const mesh = useRef()
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    // Infinity -1 +2 Rotation Logic
    const rotationSpeed = ((frequency / 100) - 1 + 2) % 144 / 50
    mesh.current.rotation.z += rotationSpeed
    mesh.current.rotation.y += rotationSpeed * 0.5
    
    // Rainbow Refraction Pulse
    const scale = 1 + Math.sin(t * 2) * 0.05
    mesh.current.scale.set(scale, scale, scale)
  })

  return (
    <mesh ref={mesh} position={position}>
      {/* Microscopic Crystalline Geometry (Dodecahedron for the Cube Nodes) */}
      <dodecahedronGeometry args={[0.12, 0]} />
      <meshPhysicalMaterial 
        color={color}
        metalness={1}
        roughness={0.05}
        transmission={0.9} // Crystalline Transparency
        thickness={2}
        emissive={color}
        emissiveIntensity={0.5}
        clearcoat={1}
      />
    </mesh>
  )
}

const MetatronsShield = () => {
  // Creating the Gold, Silver, and Copper Inlay Lines
  const points = useMemo(() => {
    // Metatron's Cube Geometry Mapping (Simplified for the 9-Helix Flow)
    const pts = []
    for (let i = 0; i < 13; i++) {
      const angle = (i / 13) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(angle) * 4, Math.sin(angle) * 4, 0))
    }
    return pts
  }, [])

  return (
    <line>
      <bufferGeometry attach="geometry" setFromPoints={points} />
      <lineBasicMaterial attach="material" color="#FFD700" linewidth={2} transparent opacity={0.3} />
    </line>
  )
}

export default function CrystallineEngine() {
  const nodes = useMemo(() => {
    const temp = []
    const colors = ["#FFD700", "#C0C0C0", "#B87333"] // Gold, Silver, Copper
    
    // Building the 9-Helix Flower of Life
    for (let h = 0; h < 9; h++) { // 9 Helix Strands
      for (let p = 0; p < 9; p++) { // 9 Petals (Flower of Life logic)
        const angle = (h / 9) * Math.PI * 2 + (p * 0.2)
        const radius = 2.5 * Math.sin((p / 9) * Math.PI) + 1 // Toroidal Expansion
        const z = (p - 4) * 1.5
        
        temp.push({
          pos: [Math.cos(angle) * radius, Math.sin(angle) * radius, z],
          color: colors[h % 3],
          freq: 174 + (h * 100),
          id: `${h}-${p}`
        })
      }
    }
    return temp
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#030303' }}>
      <Canvas camera={{ position: [0, 0, 15] }}>
        <color attach="background" args={['#000']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <group>
            <MetatronsShield />
            {nodes.map(node => (
              <CrystallineNode 
                key={node.id} 
                position={node.pos} 
                color={node.color} 
                frequency={node.freq} 
              />
            ))}
          </group>
        </Float>
        
        <OrbitControls autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}
