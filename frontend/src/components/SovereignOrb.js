/**
 * SOVEREIGN ORB — Final High-Response Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Decoupled logic — single button with centered hitbox.
 * Uses translate(-50%, -50%) so the center is always clickable.
 */
import React from 'react';

/**
 * SovereignOrb — High-Response orb with position-locked hitbox
 * 
 * @param {string} label - Text label below orb
 * @param {string} icon - Emoji or icon character
 * @param {function} onClick - Click handler
 * @param {string} color - Glow color
 * @param {number} x - X offset from center in pixels
 * @param {number} y - Y offset from center in pixels
 * @param {string} testId - data-testid for testing
 */
const SovereignOrb = ({ label, icon, onClick, color, x, y, testId }) => (
  <button 
    onClick={onClick}
    data-testid={testId || `orb-${label?.toLowerCase()}`}
    style={{
      position: 'absolute',
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: 'translate(-50%, -50%)', // CENTER of orb is always the center of hitbox
      width: '75px',
      height: '75px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      zIndex: 100,
      pointerEvents: 'auto', // ONLY the button catches the tap
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.15s ease-out',
    }}
    onMouseDown={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.9)'}
    onMouseUp={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'}
    onTouchStart={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.9)'}
    onTouchEnd={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'}
  >
    {/* THE GLOW (Pointer Events Disabled) */}
    <div style={{
      width: '50px', 
      height: '50px', 
      borderRadius: '50%',
      background: color, 
      filter: 'blur(15px)', 
      opacity: 0.5,
      position: 'absolute', 
      pointerEvents: 'none',
    }} />
    
    {/* THE CORE */}
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: `radial-gradient(circle at 30% 30%, ${color}, rgba(0,0,0,0.15))`,
      border: `1px solid ${color}`,
      position: 'absolute',
      pointerEvents: 'none',
      boxShadow: `0 0 15px ${color}40`,
    }} />
    
    {/* THE ICON */}
    <div style={{ pointerEvents: 'none', fontSize: '1.4rem', zIndex: 1 }}>{icon}</div>
    
    {/* THE LABEL */}
    <span style={{ 
      pointerEvents: 'none', 
      fontSize: '0.55rem', 
      color: '#F0FFF0', 
      marginTop: '5px', 
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '600',
      textShadow: '0 1px 3px rgba(0,0,0,0.15)',
    }}>{label}</span>
  </button>
);

export default SovereignOrb;
