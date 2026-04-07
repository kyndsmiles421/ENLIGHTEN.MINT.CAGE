/**
 * ENLIGHTENMENT ENGINE: METATRON-FLOWER-HELIX CORE
 * Structure: Flower of Life inside Metatron's Cube
 * Materials: Gold/Silver/Copper Microfiber Inlay
 * Physics: White Light Refraction & Sprocket Rotation
 */

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'

const CrystallineNode = ({ position, color, frequency }) => {
  const mesh = useRef()
  
  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.getElapsedTime()
    const rotationSpeed = ((frequency / 100) - 1 + 2) % 144 / 50
    mesh.current.rotation.z += rotationSpeed
    mesh.current.rotation.y += rotationSpeed * 0.5
    
    const scale = 1 + Math.sin(t * 2) * 0.05
    mesh.current.scale.set(scale, scale, scale)
  })

  return (
    <mesh ref={mesh} position={position}>
      <dodecahedronGeometry args={[0.12, 0]} />
      <meshPhysicalMaterial 
        color={color}
        metalness={1}
        roughness={0.05}
        transmission={0.9}
        thickness={2}
        emissive={color}
        emissiveIntensity={0.5}
        clearcoat={1}
      />
    </mesh>
  )
}

const ShieldRing = ({ radius, color }) => {
  const mesh = useRef()
  
  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.rotation.z += 0.002
  })

  return (
    <mesh ref={mesh}>
      <torusGeometry args={[radius, 0.02, 8, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </mesh>
  )
}

export default function CrystallineEngine() {
  const nodes = useMemo(() => {
    const temp = []
    const colors = ["#FFD700", "#C0C0C0", "#B87333"]
    
    for (let h = 0; h < 9; h++) {
      for (let p = 0; p < 9; p++) {
        const angle = (h / 9) * Math.PI * 2 + (p * 0.2)
        const radius = 2.5 * Math.sin((p / 9) * Math.PI) + 1
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
            <ShieldRing radius={4} color="#FFD700" />
            <ShieldRing radius={3} color="#C0C0C0" />
            <ShieldRing radius={2} color="#B87333" />
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
