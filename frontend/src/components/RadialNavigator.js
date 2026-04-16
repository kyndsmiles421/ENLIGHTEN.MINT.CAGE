/**
 * RADIAL NAVIGATOR — Final Responsive Loop
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Slow rotation animation with locked coordinates.
 * Hitboxes stay exactly where visuals are.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SovereignOrb from './SovereignOrb';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * Menu items with routes
 */
const MENU_ITEMS = [
  { label: 'Sanctuary', icon: '🌌', color: '#00fa9a', route: '/zen-garden' },
  { label: 'Practice', icon: '💎', color: '#00ffff', route: '/breathing' },
  { label: 'Divination', icon: '🔮', color: '#c084fc', route: '/oracle' },
  { label: 'Economy', icon: '⚖️', color: 'gold', route: '/economy' },
  { label: 'Journal', icon: '📜', color: '#ff69b4', route: '/journal' },
  { label: 'Dashboard', icon: '📊', color: '#60a5fa', route: '/dashboard' },
];

const RadialNavigator = ({ 
  items = MENU_ITEMS,
  radius = 110,
  enableRotation = true,
  rotationSpeed = 0.2,
  showCenter = true,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);

  // Slow, passive rotation to look "Sovereign" without breaking UI
  useEffect(() => {
    if (!enableRotation) return;
    
    const timer = setInterval(() => {
      setRotation(prev => prev + rotationSpeed);
    }, 30);
    
    return () => clearInterval(timer);
  }, [enableRotation, rotationSpeed]);

  // Handle orb click with ledger sync
  const handleOrbClick = useCallback(async (item) => {
    console.log(`Ω Entering ${item.label}...`);
    
    // Ledger sync (fire and forget)
    try {
      fetch(`${API}/sovereign/ledger/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { module: item.label, action: 'RADIAL_NAV_CLICK' },
          sig: Date.now().toString(16),
        }),
      });
    } catch (e) {
      console.warn('[RadialNavigator] Ledger sync failed:', e);
    }

    // Custom callback
    if (onNavigate) {
      onNavigate(item);
    }

    // Navigate
    navigate(item.route);
  }, [navigate, onNavigate]);

  return (
    <div 
      className="radial-navigator-container"
      data-testid="radial-navigator"
      style={{ 
        position: 'relative', 
        width: '300px', 
        height: '300px', 
        margin: '0 auto',
        background: 'transparent',
      }}
    >
      {/* Center hub */}
      {showCenter && (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(248, 250, 252, 0.15), rgba(0,0,0,0.15))',
          border: '1px solid rgba(248, 250, 252, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(248, 250, 252, 0.1)',
          zIndex: 50,
        }}>
          <span style={{ fontSize: '1.2rem' }}>✧</span>
        </div>
      )}

      {/* Orbs */}
      {items.map((item, i) => {
        // Calculate position based on rotation
        const angle = (i * (360 / items.length) + rotation - 90) * (Math.PI / 180);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <SovereignOrb 
            key={item.label}
            label={item.label}
            icon={item.icon}
            color={item.color}
            x={x} 
            y={y}
            testId={`orb-${item.label.toLowerCase()}`}
            onClick={() => handleOrbClick(item)}
          />
        );
      })}

      {/* Orbit ring (visual only) */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        borderRadius: '50%',
        border: '1px solid rgba(248, 250, 252, 0.05)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};

export default RadialNavigator;
