/**
 * SOVEREIGN CANVAS PAGE V3.0 - SHAMBHALA ROOT
 * The Enlightenment Cafe | Sovereign Mode
 * Structure: Refractive Grid + Resonance Balls + Teal Source
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/VoidShield.css';

const SovereignCanvas = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Resonance ball modules with gravity physics
  const [modules, setModules] = useState([
    { id: 'mod-oracle', name: 'Oracle', x: 150, y: 0, vx: 0, vy: 0.5, icon: '✨' },
    { id: 'mod-tarot', name: 'Tarot', x: -100, y: 100, vx: 0.3, vy: 0, icon: '🛡️' },
    { id: 'mod-iching', name: 'I Ching', x: -50, y: -120, vx: -0.2, vy: 0.3, icon: '🌐' },
    { id: 'mod-crystals', name: 'Crystals', x: 100, y: -80, vx: 0.1, vy: -0.2, icon: '🏆' },
    { id: 'mod-numerology', name: 'Numerology', x: -150, y: -50, vx: 0.4, vy: 0.1, icon: '☕' }
  ]);

  // Sidebar icons
  const sidebarIcons = ['✨', '🛡️', '🌐', '🏆', '☕'];

  // Initialize
  useEffect(() => {
    document.body.style.background = "#000";
    document.body.style.overflow = "hidden";
    document.title = "Sovereign Mode | ENLIGHTEN.MINT.CAFE";
    
    // Purge legacy elements
    const legacy = document.querySelectorAll(
      'header:not(.sovereign-header), [class*="Navigation"]:not(.sidebar-nav), ' +
      '[class*="SmartDock"], [class*="TieredNav"], [class*="UtilityDock"]'
    );
    legacy.forEach(el => {
      if (!el.closest('#shambhala-root')) {
        el.style.setProperty('display', 'none', 'important');
      }
    });
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Shambhala Gravity Physics
  const applyGravity = useCallback((module) => {
    const G = 0.15;
    const RADIUS_LIMIT = 47.94;
    const dx = 0 - module.x;
    const dy = 0 - module.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const pull = G * (dist / RADIUS_LIMIT) * 0.01;
    module.vx += dx * pull;
    module.vy += dy * pull;
    module.vx *= 0.995;
    module.vy *= 0.995;
    module.x += module.vx;
    module.y += module.vy;
    
    return module;
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setModules(prev => prev.map(m => applyGravity({ ...m })));
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [applyGravity]);

  // Calculate screen positions
  const getScreenPos = (module) => {
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;
    return {
      left: centerX + module.x - 30,
      top: centerY + module.y - 30
    };
  };

  const handleBeginJourney = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div id="shambhala-root">
      {/* PINNED SOVEREIGN HEADER */}
      <header className="sovereign-header">
        <div>ENLIGHTENMENT CAFE | SOVEREIGN MODE</div>
        <div style={{ fontWeight: 'bold' }}>IDENTITY: STEVEN_MICHAEL</div>
      </header>

      {/* THE REFRACTIVE GRID (60px Copper Lattice) */}
      <div id="refractive-grid" />

      {/* SIDEBAR: UN-BUNCHED (3.5rem Gap) */}
      <nav className="sidebar-nav">
        {sidebarIcons.map((icon, idx) => (
          <div key={idx} className="nav-icon">{icon}</div>
        ))}
      </nav>

      {/* GRAVITY FIELD RESONANCE BALLS */}
      {modules.map(module => {
        const pos = getScreenPos(module);
        return (
          <div
            key={module.id}
            id={module.id}
            className="resonance-ball"
            style={{
              left: pos.left,
              top: pos.top
            }}
            title={module.name}
          />
        );
      })}

      {/* TEAL SOURCE (Central Node) */}
      <div id="teal-source" />

      {/* SOVEREIGN ACTION BUTTON */}
      <button className="sovereign-action" onClick={handleBeginJourney}>
        Begin Shambhala Journey
      </button>

      {/* VERSION BADGE */}
      <div className="version-badge">
        V2.88_SHAMBHALA | AETHER_MIRRORLESS
      </div>

      {/* DOWNLOAD BUTTON — V1.2.7 wired to the admin-gated APK route */}
      <button
        className="download-btn"
        data-testid="sovereign-canvas-download"
        onClick={() => {
          const PROD = 'https://enlighten-mint-cafe.me';
          const origin = window.location.origin?.startsWith('http') ? window.location.origin : PROD;
          window.location.href = `${origin}/api/downloads/enlighten-v1.0.4.apk`;
        }}
      >
        Download Build
      </button>
    </div>
  );
};

export default SovereignCanvas;
