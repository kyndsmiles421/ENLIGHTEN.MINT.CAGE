/**
 * SOVEREIGN ORB — Hyper-Responsive Interactive Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Fixes the "Dead Tap" issue by putting the glow INSIDE the button hitbox.
 * No more ghost clicking — hitbox is exactly where the glow is.
 */
import React, { useState, useCallback } from 'react';

/**
 * SovereignOrb — Individual orb with glow inside hitbox
 * 
 * @param {string} label - Text label below orb
 * @param {string} icon - Emoji or icon character
 * @param {function} onClick - Click handler
 * @param {string} color - Glow color (e.g., '#86efac', 'rgba(134, 239, 172, 0.8)')
 * @param {object} position - { top, left, right, bottom } for positioning
 * @param {number} size - Orb size in pixels (default 60)
 * @param {boolean} disabled - Disable interaction
 * @param {string} testId - data-testid for testing
 */
const SovereignOrb = ({ 
  label, 
  icon, 
  onClick, 
  color = 'rgba(134, 239, 172, 0.8)',
  position = {},
  size = 60,
  disabled = false,
  testId,
  className = '',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback((e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (!disabled && onClick) {
      // Visual feedback
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      
      // Execute handler
      onClick(e);
    }
  }, [onClick, disabled]);

  const glowSize = size * 0.75;
  const iconSize = size * 0.4;

  return (
    <button 
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      disabled={disabled}
      data-testid={testId || `orb-${label?.toLowerCase().replace(/\s/g, '-')}`}
      className={`sovereign-orb ${className}`}
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'transparent',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        zIndex: 10,
        pointerEvents: 'auto', // FORCES responsiveness
        transition: 'transform 0.15s ease-out',
        transform: isPressed ? 'scale(0.9)' : isHovered ? 'scale(1.1)' : 'scale(1)',
        opacity: disabled ? 0.5 : 1,
        ...position,
      }}
    >
      {/* THE GLOW: Now inside the button hitbox */}
      <div 
        className="orb-glow"
        style={{
          width: `${glowSize}px`,
          height: `${glowSize}px`,
          borderRadius: '50%',
          background: color,
          filter: `blur(${isHovered || isPressed ? '16px' : '12px'})`,
          opacity: isPressed ? 0.9 : isHovered ? 0.8 : 0.6,
          position: 'absolute',
          zIndex: -1,
          transition: 'all 0.2s ease-out',
          pointerEvents: 'none', // CRITICAL: Glow doesn't steal clicks
        }} 
      />
      
      {/* THE CORE: Solid inner circle */}
      <div 
        className="orb-core"
        style={{
          width: `${glowSize * 0.6}px`,
          height: `${glowSize * 0.6}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${color}, rgba(0,0,0,0.5))`,
          border: `1px solid ${color}`,
          position: 'absolute',
          zIndex: 0,
          boxShadow: isHovered ? `0 0 20px ${color}` : 'none',
          transition: 'all 0.2s ease-out',
          pointerEvents: 'none', // CRITICAL: Core doesn't steal clicks
        }}
      />
      
      {/* THE ICON */}
      <div 
        className="orb-icon"
        style={{ 
          fontSize: `${iconSize}px`, 
          zIndex: 1,
          textShadow: '0 0 10px rgba(0,0,0,0.5)',
          pointerEvents: 'none', // CRITICAL: Icon doesn't steal clicks
        }}
      >
        {icon}
      </div>
      
      {/* THE LABEL */}
      {label && (
        <span 
          className="orb-label"
          style={{ 
            fontSize: '0.6rem', 
            color: '#F0FFF0', 
            marginTop: '4px',
            zIndex: 1,
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            whiteSpace: 'nowrap',
            fontWeight: '600',
            letterSpacing: '0.05em',
            pointerEvents: 'none', // CRITICAL: Label doesn't steal clicks
          }}
        >
          {label}
        </span>
      )}
    </button>
  );
};

/**
 * SovereignOrbField — Container for multiple orbs in radial layout
 * Uses pointer-events: none so orbs receive all taps
 */
export const SovereignOrbField = ({ 
  children, 
  centerContent,
  radius = 120,
  style = {},
}) => {
  return (
    <div 
      className="sovereign-orb-field"
      style={{
        position: 'relative',
        width: `${radius * 2 + 80}px`,
        height: `${radius * 2 + 80}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none', // Field doesn't steal taps
        ...style,
      }}
    >
      {/* Center Content */}
      {centerContent && (
        <div 
          className="orb-field-center"
          style={{
            position: 'absolute',
            pointerEvents: 'auto',
            zIndex: 5,
          }}
        >
          {centerContent}
        </div>
      )}
      
      {/* Orbs */}
      {children}
    </div>
  );
};

/**
 * Helper: Calculate position for orb in radial layout
 * 
 * @param {number} index - Orb index (0-based)
 * @param {number} total - Total number of orbs
 * @param {number} radius - Radius from center in pixels
 * @param {number} offsetAngle - Starting angle offset in degrees (default -90 for top)
 */
export const getRadialPosition = (index, total, radius, offsetAngle = -90) => {
  const angleStep = 360 / total;
  const angle = (offsetAngle + (angleStep * index)) * (Math.PI / 180);
  
  return {
    left: `calc(50% + ${Math.cos(angle) * radius}px - 30px)`,
    top: `calc(50% + ${Math.sin(angle) * radius}px - 30px)`,
  };
};

/**
 * Preset color palette for orbs
 */
export const ORB_COLORS = {
  mint: 'rgba(134, 239, 172, 0.8)',
  gold: 'rgba(252, 211, 77, 0.8)',
  purple: 'rgba(192, 132, 252, 0.8)',
  teal: 'rgba(45, 212, 191, 0.8)',
  rose: 'rgba(244, 114, 182, 0.8)',
  blue: 'rgba(96, 165, 250, 0.8)',
  crimson: 'rgba(220, 20, 60, 0.8)',
  white: 'rgba(248, 250, 252, 0.8)',
};

export default SovereignOrb;
