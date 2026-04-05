import React, { useState } from 'react';

const ShambhalaCrystalSystem = () => {
  const [isActive, setIsActive] = useState(false);

  // --- SCRIPT KEY: THE BACK SIDE (Layer 0: Rainbow Encryption & Pass-Through) ---
  const backSideKeyStyle = {
    position: 'fixed',
    bottom: '70px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100vw',
    height: '200px',
    zIndex: 2147483646, // One layer below the front buttons
    pointerEvents: 'none', // The "Key" logic: allows interaction to slip through to the back
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
    transition: 'all 0.8s ease-in-out',
  };

  // --- SCRIPT KEY: THE FRONT SIDE (Layer 1: White Light Interactive) ---
  const frontButtonStyle = {
    pointerEvents: 'auto', // Re-activates touch for the user
    width: '66px',
    height: '66px',
    borderRadius: '50%',
    background: 'white',
    // The Rainbow Encryption Effect:
    boxShadow: isActive 
      ? '0 0 20px #fff, 0 0 40px #ff0000, 0 0 60px #ff7f00, 0 0 80px #ffff00, 0 0 100px #00ff00' 
      : '0 0 15px rgba(255, 255, 255, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: '2px solid rgba(255, 255, 255, 1)',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const rainbowTextStyle = {
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    background: 'linear-gradient(to right, #ef5350, #f48fb1, #7e57c2, #2196f3, #26c6da, #43a047, #eeff41, #f9a825, #ff5722)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center'
  };

  return (
    <>
      {/* THE BACK SIDE KEY (The "Invisible" Logic Layer) */}
      <div id="back-script-key" style={backSideKeyStyle}>
        <div style={{
          width: '100%',
          height: '100%',
          opacity: isActive ? 1 : 0,
          filter: 'blur(30px)',
          background: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8f00ff)',
          transform: isActive ? 'scaleY(1)' : 'scaleY(0)',
          transition: 'all 1s ease'
        }} />
      </div>

      {/* THE FRONT SIDE (The Mission Circle) */}
      <div style={{
        position: 'fixed',
        bottom: '85px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2147483647,
        pointerEvents: 'none'
      }}>
        <div 
          style={frontButtonStyle} 
          onClick={() => setIsActive(!isActive)}
        >
          <div style={rainbowTextStyle}>
            {isActive ? "ASCEND" : "SHAMBHALA"}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShambhalaCrystalSystem;
