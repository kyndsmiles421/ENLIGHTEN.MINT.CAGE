import React, { useState } from 'react';

const ShambhalaMissionCircle = () => {
  const [isAscended, setIsAscended] = useState(false);

  const handleToggle = () => {
    const newState = !isAscended;
    setIsAscended(newState);
    
    // Track state globally for visibility restoration
    window.__shambhalaAscended = newState;
    
    // Broadcast signal to the Logic Key (Script 2)
    const eventName = newState ? 'SHAMBHALA_ASCEND' : 'SHAMBHALA_STASIS';
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: { 
        frequency: 'Crystal White Light', 
        refraction: 'Full Rainbow Spectrum',
        origin: 'Rapid City Hub' 
      }
    }));
    
    console.log(`[MissionCircle] ${eventName} dispatched from Rapid City Hub`);
  };

  return (
    <div id="shambhala-mission-control" style={{
      position: 'fixed', bottom: '140px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 2147483647, pointerEvents: 'none', display: 'flex', justifyContent: 'center'
    }}>
      {/* 120px Refraction Glow */}
      <div style={{
        position: 'absolute', width: '120px', height: '120px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,0,0,0.3) 20%, rgba(0,255,0,0.3) 40%, rgba(0,0,255,0.3) 60%)',
        filter: 'blur(15px)', opacity: isAscended ? 1 : 0, transition: 'all 0.8s ease',
        animation: isAscended ? 'spin 8s linear infinite' : 'none'
      }} />

      {/* 66px White Vessel Button */}
      <button 
        data-testid="shambhala-ascend"
        onClick={handleToggle} 
        style={{
          pointerEvents: 'auto', width: '66px', height: '66px', borderRadius: '50%',
          backgroundColor: '#FFFFFF', boxShadow: isAscended ? '0 0 40px #FFF' : '0 4px 10px rgba(0,0,0,0.15)',
          cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none',
          transition: 'box-shadow 0.4s ease'
        }}
      >
        <span style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '1px', color: '#000' }}>
          {isAscended ? 'ASCEND' : 'SHAMBHALA'}
        </span>
      </button>
      <style>{` @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } `}</style>
    </div>
  );
};

// Export as both names for backwards compatibility
export { ShambhalaMissionCircle };
export default ShambhalaMissionCircle;
