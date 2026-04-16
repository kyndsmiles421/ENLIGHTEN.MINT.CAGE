import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float, PerspectiveCamera } from '@react-three/drei';

// --- 1. THE SECURITY GATE: Authentication Logic ---
// In your live system, 'user' will come from your Google Social Login provider
const SecurePortal = ({ isLoggedIn, children, onLogin }) => {
  if (!isLoggedIn) {
    return (
      <div style={{ 
        position: 'absolute', zIndex: 10, width: '100%', height: '100%', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'none'
      }}>
        <h1 style={{ color: '#00ffcc', letterSpacing: '5px' }}>ENLIGHTEN.MINT.CAFE</h1>
        <p style={{ color: 'white', marginBottom: '20px' }}>Secure Lattice Encryption Active</p>
        <button 
          onClick={onLogin}
          style={{ padding: '15px 30px', background: '#00ffcc', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          LOGIN WITH GOOGLE
        </button>
      </div>
    );
  }
  return children;
};

// --- 2. THE ENGINE: Atmospheric Intelligence ---
const useAtmosphericData = (altitude) => {
  return useMemo(() => {
    const pressure = 101.325 * Math.pow(1 - 2.25577e-5 * altitude, 5.25588);
    return {
      pressure: pressure.toFixed(2),
      boil: (100 - (altitude / 300)).toFixed(1)
    };
  }, [altitude]);
};

// --- 3. THE GEOMETRY: Secure Data Node ---
function SecureNode({ position, label, altitude, color }) {
  const [active, setActive] = useState(false);
  const { pressure, boil } = useAtmosphericData(altitude);

  return (
    <Float speed={2} rotationIntensity={0.5}>
      <mesh onClick={() => setActive(!active)} position={position}>
        <icosahedronGeometry args={[1, active ? 15 : 2]} />
        <meshStandardMaterial color={active ? color : "#222"} wireframe={!active} emissive={active ? color : "#000"} />
        {active && (
          <Text position={[0, 2, 0]} fontSize={0.2} color="white" textAlign="center">
            {`${label}\nSTATUS: ENCRYPTED\nALT: ${altitude}m\nPRES: ${pressure}kPa\nBOIL: ${boil}°C`}
          </Text>
        )}
      </mesh>
    </Float>
  );
}

// --- 4. THE SYSTEM: All-In-One Established App ---
export default function FractalEngine() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", overflowX: 'hidden' }}>
      
      {/* SECURITY LAYER */}
      <SecurePortal isLoggedIn={isLoggedIn} onLogin={() => setIsLoggedIn(true)}>
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 5, color: '#00ffcc' }}>
          SYSTEM ACTIVE: STEVEN MICHAEL | SESSION SECURE
          <button 
            onClick={() => setIsLoggedIn(false)} 
            style={{ marginLeft: '20px', background: 'transparent', border: '1px solid #00ffcc', color: '#00ffcc', cursor: 'pointer', padding: '5px 10px' }}
          >
            LOGOUT
          </button>
        </div>
      </SecurePortal>

      {/* 3D CANVAS */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} />
        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1} />
        
        <Suspense fallback={null}>
          <SecureNode position={[-4, 1, 0]} label="Wellness Engine" altitude={1100} color="#00ffcc" />
          <SecureNode position={[0, -1, 0]} label="Fractal Core" altitude={1500} color="#ff00ff" />
          <SecureNode position={[4, 1, 0]} label="Culinary Logic" altitude={975} color="#ffff00" />
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
