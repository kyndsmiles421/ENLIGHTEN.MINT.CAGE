import React, { useState, useEffect } from 'react';

const ShambhalaFrontSide = () => {
  const [isAscended, setIsAscended] = useState(false);

  const toggleAscension = () => {
    const newState = !isAscended;
    setIsAscended(newState);
    
    // Dispatching to the Quadruple Helix Bridge (Script 2)
    const eventName = newState ? 'SHAMBHALA_ASCEND' : 'SHAMBHALA_STASIS';
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: { 
        frequency: 'Crystal White Light',
        refraction: 'Full Rainbow Spectrum',
        origin: 'Rapid City Hub'
      }
    }));
    
    console.log(`[ShambhalaFrontSide] ${eventName} dispatched from Rapid City Hub`);
  };

  return (
    <div id="shambhala-ui-container" style={{
      position: 'fixed',
      bottom: '85px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2147483647, // Max Int Protection
      pointerEvents: 'none', // Pass-through for background elements
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* The Refracted Glow Layer */}
      <div style={{
        width: '120px',
        height: '120px',
        position: 'absolute',
        top: '-27px',
        borderRadius: '50%',
        background: isAscended 
          ? 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,0,0,0.2) 20%, rgba(0,255,0,0.2) 40%, rgba(0,0,255,0.2) 60%, rgba(238,130,238,0.2) 80%)'
          : 'transparent',
        filter: 'blur(15px)',
        opacity: isAscended ? 1 : 0,
        transition: 'all 0.8s ease-in-out',
        animation: isAscended ? 'spin 10s linear infinite' : 'none'
      }} />

      {/* The Physical 66px Vessel */}
      <button 
        data-testid="shambhala-ascend"
        onClick={toggleAscension}
        style={{
          pointerEvents: 'auto', // Re-enables touch for this specific button
          width: '66px',
          height: '66px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          border: '3px solid rgba(255,255,255,0.8)',
          boxShadow: isAscended 
            ? '0 0 30px #fff, 0 0 50px rgba(255,255,255,0.5)' 
            : '0 4px 15px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <span style={{
          fontSize: '10px',
          fontWeight: '900',
          letterSpacing: '0.5px',
          color: '#000',
          textTransform: 'uppercase'
        }}>
          {isAscended ? 'ASCEND' : 'SHAMBHALA'}
        </span>
      </button>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ShambhalaFrontSide;
