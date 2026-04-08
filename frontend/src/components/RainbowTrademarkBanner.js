import React from 'react';

/**
 * Rainbow Refraction Trademark Banner
 * Displays the trademark image with animated rainbow light rays
 */
export const RainbowTrademarkBanner = () => {
  return (
    <div className="rainbow-trademark-container" style={{
      position: 'relative',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      borderRadius: '16px',
      overflow: 'hidden'
    }}>
      {/* Rainbow Light Rays Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          conic-gradient(
            from 0deg at 50% 50%,
            rgba(255, 0, 0, 0.15) 0deg,
            rgba(255, 127, 0, 0.15) 51deg,
            rgba(255, 255, 0, 0.15) 102deg,
            rgba(0, 255, 0, 0.15) 153deg,
            rgba(0, 0, 255, 0.15) 204deg,
            rgba(75, 0, 130, 0.15) 255deg,
            rgba(148, 0, 211, 0.15) 306deg,
            rgba(255, 0, 0, 0.15) 360deg
          )
        `,
        animation: 'rainbowRotate 8s linear infinite',
        opacity: 0.8
      }} />

      {/* Radial Glow Layers */}
      {['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet'].map((color, i) => (
        <div key={color} style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${200 + i * 60}px`,
          height: `${200 + i * 60}px`,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: 0.1,
          animation: `pulse${i} ${3 + i * 0.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.2}s`,
          mixBlendMode: 'screen'
        }} />
      ))}

      {/* Prism Light Beams */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(45deg)',
        width: '150%',
        height: '4px',
        background: 'linear-gradient(90deg, transparent, rgba(255,0,0,0.5), rgba(255,127,0,0.5), rgba(255,255,0,0.5), rgba(0,255,0,0.5), rgba(0,0,255,0.5), rgba(148,0,211,0.5), transparent)',
        filter: 'blur(3px)',
        animation: 'beamSweep 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        width: '150%',
        height: '4px',
        background: 'linear-gradient(90deg, transparent, rgba(148,0,211,0.5), rgba(0,0,255,0.5), rgba(0,255,0,0.5), rgba(255,255,0,0.5), rgba(255,127,0,0.5), rgba(255,0,0,0.5), transparent)',
        filter: 'blur(3px)',
        animation: 'beamSweep 6s ease-in-out infinite reverse'
      }} />

      {/* Main Trademark Image */}
      <img 
        src="/images/trademark-banner.png" 
        alt="ENLIGHTEN.MINT.CAFE - Copyright and Trademark - O.V.E. CORE 1.0 SECURE"
        style={{
          position: 'relative',
          width: '100%',
          display: 'block',
          zIndex: 10
        }}
      />

      {/* Rainbow Border Glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '16px',
        padding: '2px',
        background: `linear-gradient(
          45deg,
          #ff0000,
          #ff7f00,
          #ffff00,
          #00ff00,
          #0000ff,
          #4b0082,
          #9400d3,
          #ff0000
        )`,
        backgroundSize: '400% 400%',
        animation: 'rainbowBorder 4s linear infinite',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'xor',
        WebkitMaskComposite: 'xor',
        zIndex: 20,
        pointerEvents: 'none'
      }} />

      {/* Shimmer Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.1) 50%, transparent 80%)',
        animation: 'shimmer 3s ease-in-out infinite',
        zIndex: 15,
        pointerEvents: 'none'
      }} />

      {/* CSS Animations */}
      <style>{`
        @keyframes rainbowRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rainbowBorder {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes beamSweep {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) rotate(45deg) scaleX(0.8); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) rotate(45deg) scaleX(1.2); }
        }
        @keyframes pulse0 { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.1); } }
        @keyframes pulse1 { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.15); } }
        @keyframes pulse2 { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.1); } }
        @keyframes pulse3 { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.2); } }
        @keyframes pulse4 { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.1); } }
        @keyframes pulse5 { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.15); } }
        @keyframes pulse6 { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.1); } }
      `}</style>
    </div>
  );
};

export default RainbowTrademarkBanner;
