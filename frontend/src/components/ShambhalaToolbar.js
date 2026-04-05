/**
 * SHAMBHALA BOTTOM TOOLBAR - AUDITED & FIXED
 * Framework: React with useState for pull-up menu state
 * Fixes: 44x44px touch targets, fixed positioning, no overflow clipping
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Moon, Hexagon, Star, Award, Music, Home, Menu, X } from 'lucide-react';

const ShambhalaToolbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [mixerOpen, setMixerOpen] = useState(false);

  const navItems = [
    { id: 'home', path: '/', icon: Home, label: 'Home' },
    { id: 'oracle', path: '/oracle', icon: Eye, label: 'Oracle' },
    { id: 'tarot', path: '/tarot', icon: Moon, label: 'Tarot' },
    { id: 'iching', path: '/iching', icon: Hexagon, label: 'I Ching' },
    { id: 'stars', path: '/star-chart', icon: Star, label: 'Stars' },
    { id: 'legacy', path: '/achievements', icon: Award, label: 'Legacy' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* PULL-UP NAVIGATION PANEL - Fixed to viewport, not nested */}
      {navOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2147483645,
            background: 'transparent'
          }}
          onClick={() => setNavOpen(false)}
        >
          <div 
            style={{
              position: 'fixed',
              bottom: '80px',
              left: 0,
              right: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              borderTop: '1px solid rgba(212, 175, 55, 0.2)',
              padding: '16px',
              zIndex: 2147483646
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '8px', 
              flexWrap: 'wrap',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setNavOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    minWidth: '56px',      /* 44px minimum + padding */
                    minHeight: '56px',     /* 44px minimum + padding */
                    padding: '8px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isActive(item.path) ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                    color: isActive(item.path) ? '#d4af37' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <item.icon size={24} />
                  <span style={{ fontSize: '10px' }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PULL-UP MIXER PANEL - Fixed to viewport */}
      {mixerOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2147483645,
            background: 'transparent'
          }}
          onClick={() => setMixerOpen(false)}
        >
          <div 
            style={{
              position: 'fixed',
              bottom: '80px',
              left: 0,
              right: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              borderTop: '1px solid rgba(0, 128, 128, 0.3)',
              padding: '16px',
              zIndex: 2147483646
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <h3 style={{ 
                color: '#008080', 
                fontSize: '12px', 
                fontFamily: 'monospace',
                marginBottom: '12px',
                textAlign: 'center'
              }}>RESONANCE MIXER</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>GOLD</label>
                  <input type="range" style={{ width: '100%' }} min="0" max="100" defaultValue="71" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>COPPER</label>
                  <input type="range" style={{ width: '100%' }} min="0" max="100" defaultValue="50" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>TEAL</label>
                  <input type="range" style={{ width: '100%' }} min="0" max="100" defaultValue="80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN BOTTOM TOOLBAR - Fixed to viewport, above Emergent badge */}
      <div 
        style={{
          position: 'fixed',
          bottom: '70px',
          left: 0,
          right: 0,
          height: '56px',
          background: 'rgba(0, 0, 0, 0.9)',
          borderTop: '1px solid rgba(212, 175, 55, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 2147483647,
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Left: Navigation Toggle - 44x44px touch target */}
        <button
          onClick={() => {
            setNavOpen(!navOpen);
            setMixerOpen(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minWidth: '44px',
            minHeight: '44px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: navOpen ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
            color: navOpen ? '#d4af37' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer'
          }}
        >
          {navOpen ? <X size={20} /> : <Menu size={20} />}
          <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>NAV</span>
        </button>

        {/* Center: Title */}
        <div style={{ 
          color: '#d4af37', 
          fontFamily: 'Georgia, serif', 
          fontSize: '14px',
          letterSpacing: '2px'
        }}>
          RESONANCE
        </div>

        {/* Right: Mixer Toggle - 44x44px touch target */}
        <button
          onClick={() => {
            setMixerOpen(!mixerOpen);
            setNavOpen(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minWidth: '44px',
            minHeight: '44px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: mixerOpen ? 'rgba(0, 128, 128, 0.2)' : 'transparent',
            color: mixerOpen ? '#008080' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer'
          }}
        >
          <Music size={20} />
          <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>MIX</span>
        </button>
      </div>
    </>
  );
};

export default ShambhalaToolbar;
