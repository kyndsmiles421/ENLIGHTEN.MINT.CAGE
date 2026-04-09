/**
 * RADIAL NAVIGATOR — Hyper-Responsive Orbital Navigation
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Fixed radial layout with locked coordinates — always tappable.
 * Uses SovereignOrb for hitbox alignment.
 */
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SovereignOrb, { SovereignOrbField, getRadialPosition, ORB_COLORS } from './SovereignOrb';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * Navigation destinations with icons and colors
 */
const NAV_DESTINATIONS = [
  { id: 'sanctuary', label: 'SANCTUARY', icon: '🏛️', color: ORB_COLORS.gold, route: '/zen-garden' },
  { id: 'practice', label: 'PRACTICE', icon: '🧘', color: ORB_COLORS.mint, route: '/breathing' },
  { id: 'divination', label: 'DIVINATION', icon: '🔮', color: ORB_COLORS.purple, route: '/oracle' },
  { id: 'economy', label: 'ECONOMY', icon: '💎', color: ORB_COLORS.teal, route: '/economy' },
  { id: 'dashboard', label: 'DASHBOARD', icon: '📊', color: ORB_COLORS.blue, route: '/dashboard' },
  { id: 'journal', label: 'JOURNAL', icon: '📝', color: ORB_COLORS.rose, route: '/journal' },
];

const RadialNavigator = ({ 
  destinations = NAV_DESTINATIONS,
  radius = 100,
  centerLabel = 'COSMIC',
  centerIcon = '✧',
  showCenter = true,
  onNavigate,
}) => {
  const navigate = useNavigate();

  // Handle navigation with ledger sync
  const handleOrbClick = useCallback(async (destination) => {
    console.log(`Ω [RADIAL_NAV]: Navigating to ${destination.label}`);
    
    // Ledger sync (fire and forget)
    try {
      fetch(`${API}/sovereign/ledger/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { module: destination.id, action: 'RADIAL_NAV' },
          sig: Date.now().toString(16),
        }),
      });
    } catch (e) {
      console.warn('[RadialNavigator] Ledger sync failed:', e);
    }

    // Custom callback
    if (onNavigate) {
      onNavigate(destination);
    }

    // Navigate
    navigate(destination.route);
  }, [navigate, onNavigate]);

  return (
    <div 
      className="radial-navigator"
      data-testid="radial-navigator"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: '#000000',
      }}
    >
      <SovereignOrbField 
        radius={radius}
        centerContent={showCenter && (
          <div 
            className="radial-center"
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, rgba(248, 250, 252, 0.15), rgba(0,0,0,0.8))',
              border: '1px solid rgba(248, 250, 252, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(248, 250, 252, 0.1)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{centerIcon}</span>
            <span style={{ fontSize: '0.5rem', color: '#F0FFF0', opacity: 0.7 }}>{centerLabel}</span>
          </div>
        )}
      >
        {destinations.map((dest, index) => {
          const position = getRadialPosition(index, destinations.length, radius);
          
          return (
            <SovereignOrb
              key={dest.id}
              label={dest.label}
              icon={dest.icon}
              color={dest.color}
              position={position}
              onClick={() => handleOrbClick(dest)}
              testId={`nav-orb-${dest.id}`}
              size={60}
            />
          );
        })}
      </SovereignOrbField>
    </div>
  );
};

/**
 * Compact version for embedding
 */
export const RadialNavigatorCompact = ({ destinations = NAV_DESTINATIONS.slice(0, 4) }) => {
  return (
    <RadialNavigator 
      destinations={destinations}
      radius={70}
      showCenter={false}
    />
  );
};

export default RadialNavigator;
