import React from 'react';

/**
 * CrystallineEngine - CSS-based Dual Barrier Visualization
 * Displays animated refractive barriers based on RI value
 */
export const CrystallineEngine = ({ riValue = 0.618 }) => {
  const isStable = riValue > 0.615;
  const pulseSpeed = riValue * 3;
  
  return (
    <div style={{ 
      width: '100%', 
      height: '500px', 
      background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #050505 100%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Ambient particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            borderRadius: '50%',
            background: i % 2 === 0 ? '#00f2ff' : '#ff00f2',
            opacity: 0.3 + Math.random() * 0.4,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}

      {/* OUTER BARRIER (R_o) - PHI Speed */}
      <div style={{
        position: 'absolute',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        border: '2px solid rgba(255, 0, 242, 0.3)',
        boxShadow: `
          0 0 60px rgba(255, 0, 242, 0.2),
          inset 0 0 60px rgba(255, 0, 242, 0.1)
        `,
        animation: `pulse 1.618s ease-in-out infinite, rotate 20s linear infinite`
      }}>
        {/* Outer barrier glow rings */}
        <div style={{
          position: 'absolute',
          inset: '-10px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 0, 242, 0.15)',
          animation: `pulse 1.618s ease-in-out infinite reverse`
        }} />
      </div>

      {/* INNER BARRIER (R_i) - RI-Based Speed */}
      <div style={{
        position: 'absolute',
        width: '220px',
        height: '220px',
        borderRadius: '50%',
        border: '2px solid rgba(0, 242, 255, 0.4)',
        boxShadow: `
          0 0 50px rgba(0, 242, 255, 0.3),
          inset 0 0 50px rgba(0, 242, 255, 0.15)
        `,
        animation: `pulse ${pulseSpeed}s ease-in-out infinite, rotate 15s linear infinite reverse`
      }}>
        {/* Inner barrier glow rings */}
        <div style={{
          position: 'absolute',
          inset: '-8px',
          borderRadius: '50%',
          border: '1px solid rgba(0, 242, 255, 0.2)',
          animation: `pulse ${pulseSpeed}s ease-in-out infinite reverse`
        }} />
      </div>

      {/* INNER CORE */}
      <div style={{
        position: 'relative',
        width: '80px',
        height: '80px',
        animation: `coreRotate 8s linear infinite`
      }}>
        {/* Diamond shape using rotated square */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, 
            rgba(0, 242, 255, 0.8) 0%, 
            rgba(255, 255, 255, 0.9) 50%, 
            rgba(255, 0, 242, 0.8) 100%)`,
          transform: 'rotate(45deg)',
          boxShadow: `
            0 0 40px rgba(0, 242, 255, 0.6),
            0 0 80px rgba(255, 0, 242, 0.4),
            inset 0 0 20px rgba(255, 255, 255, 0.5)
          `,
          animation: `corePulse ${pulseSpeed * 0.5}s ease-in-out infinite`
        }} />
        
        {/* Core status indicator */}
        <div style={{
          position: 'absolute',
          inset: '50%',
          transform: 'translate(-50%, -50%)',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: isStable ? '#22c55e' : '#ef4444',
          boxShadow: `0 0 20px ${isStable ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'}`,
          animation: `statusPulse 1s ease-in-out infinite`
        }} />
      </div>

      {/* RI Value Display */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center'
      }}>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: isStable ? '#00f2ff' : '#ef4444',
          textShadow: `0 0 20px ${isStable ? 'rgba(0, 242, 255, 0.8)' : 'rgba(239, 68, 68, 0.8)'}`
        }}>
          RI: {riValue.toFixed(6)}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: isStable ? '#22c55e' : '#ef4444',
          letterSpacing: '0.2em',
          marginTop: '0.5rem'
        }}>
          {isStable ? '● STABLE' : '◉ PATHOGENIC SHIFT'}
        </div>
      </div>

      {/* PHI Constant Reference */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        color: 'rgba(255, 255, 255, 0.4)'
      }}>
        φ = 1.618033
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes coreRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes corePulse {
          0%, 100% { transform: rotate(45deg) scale(1); }
          50% { transform: rotate(45deg) scale(1.1); }
        }
        @keyframes statusPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.3); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default CrystallineEngine;
