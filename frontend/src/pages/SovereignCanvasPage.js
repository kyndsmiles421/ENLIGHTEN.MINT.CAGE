/**
 * SOVEREIGN CANVAS PAGE V2.0 - VOID SHIELD EDITION
 * Location: /sovereign-canvas, /replant
 * Structure: Sanctuary Root + Matrix Ghost Tank Burial
 * Identity: STEVEN_MICHAEL
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/VoidShield.css';

const SovereignCanvas = () => {
  const canvasRef = useRef(null);
  const [modules, setModules] = useState([
    { id: 'oracle', name: 'Oracle', x: 150, y: 0, vx: 0, vy: 0.5, color: '#9b59b6', zIndex: 1 },
    { id: 'tarot', name: 'Tarot', x: -100, y: 100, vx: 0.3, vy: 0, color: '#e74c3c', zIndex: 1 },
    { id: 'iching', name: 'I Ching', x: -50, y: -120, vx: -0.2, vy: 0.3, color: '#f1c40f', zIndex: 1 },
    { id: 'numerology', name: 'Numerology', x: 100, y: -80, vx: 0.1, vy: -0.2, color: '#00FFCC', zIndex: 1 },
    { id: 'crystals', name: 'Crystals', x: -150, y: -50, vx: 0.4, vy: 0.1, color: '#3498db', zIndex: 1 }
  ]);
  const animationRef = useRef(null);

  // Sidebar icons
  const sidebarItems = [
    { id: 'oracle', icon: '◎', label: 'Oracle' },
    { id: 'tarot', icon: '⚝', label: 'Tarot' },
    { id: 'iching', icon: '☰', label: 'I Ching' },
    { id: 'stars', icon: '✧', label: 'Stars' },
    { id: 'crystals', icon: '◇', label: 'Crystals' },
    { id: 'numerology', icon: '∞', label: 'Numerology' }
  ];

  // Initialize Aether
  const initAether = useCallback(() => {
    document.body.style.background = "#000";
    document.body.style.overflow = "hidden";
    document.title = "The Enlightenment Cafe | Sovereign Mode";
    
    // FINAL LEGACY PURGE - Hide all old navigation
    const legacyElements = document.querySelectorAll(
      'header, #navbar, .old-navigation, [role="navigation"]:not(.sidebar-nav), ' +
      '.cosmic-mesh, [class*="Navigation"]:not(.sidebar-nav), [class*="TopBar"], ' +
      '[class*="TieredNav"], [class*="SmartDock"], [class*="UtilityDock"]'
    );
    legacyElements.forEach(el => {
      if (!el.closest('.sanctuary-root') && !el.closest('.sidebar-nav')) {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('height', '0px', 'important');
        el.style.setProperty('opacity', '0', 'important');
      }
    });
    
    const ghosts = document.querySelectorAll('.matrix-layer, .finn-popup, .glass-molecule');
    ghosts.forEach(g => g.remove());
    
    console.log("[SOVEREIGN] Void Shield Active — Legacy Navigation Purged.");
  }, []);

  // Gravity Logic
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
    
    module.zIndex = Math.floor(10000 / (dist + 1));
    module.scale = 1 + (50 / (dist + 50));
    module.opacity = Math.max(0.4, 1 - (dist / 300));
    
    return module;
  }, []);

  // Animation Loop
  useEffect(() => {
    initAether();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth - 124;
    canvas.height = window.innerHeight - 53;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const CONFIG = {
      GOLD: '#d4af37',
      COPPER: '#B87333',
      TEAL: '#00FFCC',
      R_LIMIT: 200
    };
    
    const anchors = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      anchors.push({
        x: Math.cos(angle) * CONFIG.R_LIMIT * 0.7,
        y: Math.sin(angle) * CONFIG.R_LIMIT * 0.7
      });
    }
    
    const loop = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Golden boundary
      ctx.beginPath();
      ctx.arc(centerX, centerY, CONFIG.R_LIMIT, 0, Math.PI * 2);
      ctx.strokeStyle = CONFIG.GOLD;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.stroke();
      
      // Silver web
      ctx.beginPath();
      ctx.arc(centerX, centerY, CONFIG.R_LIMIT * 0.95, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(192, 192, 192, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Copper conduits
      anchors.forEach(a => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(a.x + centerX, a.y + centerY);
        ctx.strokeStyle = CONFIG.COPPER;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        ctx.beginPath();
        ctx.arc(a.x + centerX, a.y + centerY, 6, 0, Math.PI * 2);
        ctx.fillStyle = CONFIG.COPPER;
        ctx.fill();
      });
      
      // Update modules
      setModules(prev => {
        const updated = prev.map(m => applyGravity({ ...m }));
        const sorted = [...updated].sort((a, b) => a.zIndex - b.zIndex);
        
        sorted.forEach(module => {
          const scale = module.scale || 1;
          const size = 30 * scale;
          
          ctx.globalAlpha = module.opacity || 1;
          ctx.beginPath();
          ctx.arc(module.x + centerX, module.y + centerY, size, 0, Math.PI * 2);
          ctx.fillStyle = module.color;
          ctx.fill();
          ctx.strokeStyle = CONFIG.GOLD;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.fillStyle = '#fff';
          ctx.font = `${10 * scale}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(module.name, module.x + centerX, module.y + centerY + 4);
          ctx.globalAlpha = 1;
        });
        
        return updated;
      });
      
      // Center node
      ctx.beginPath();
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.TEAL;
      ctx.fill();
      ctx.strokeStyle = CONFIG.GOLD;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Stats
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('SHAMBHALA_G: 0.15', 15, 25);
      ctx.fillText('R_LIMIT: 47.94', 15, 40);
      ctx.fillText('PHYSICS: AETHER_MIRRORLESS', 15, 55);
      
      animationRef.current = requestAnimationFrame(loop);
    };
    
    loop();
    
    const handleResize = () => {
      canvas.width = window.innerWidth - 124;
      canvas.height = window.innerHeight - 53;
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
    };
  }, [initAether, applyGravity]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `sovereign-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleBeginJourney = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="sanctuary-root" style={{ position: 'fixed', inset: 0, zIndex: 999999 }}>
      {/* Inject style to force-hide legacy navigation */}
      <style>{`
        header, #navbar, .old-navigation, [role="navigation"]:not(.sidebar-nav),
        .cosmic-mesh, [class*="Navigation"]:not(.sidebar-nav):not(.sanctuary-root *),
        [class*="TopBar"], [class*="TieredNav"], [class*="SmartDock"]:not(.sanctuary-root *),
        [class*="UtilityDock"]:not(.sanctuary-root *), [class*="cosmic-"]:not(.sanctuary-root *) {
          display: none !important;
          visibility: hidden !important;
          height: 0px !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        .sanctuary-root { z-index: 999999 !important; }
      `}</style>
      
      {/* THE COPPER CONDUIT GRID */}
      <div id="shambhala-grid" />
      
      {/* SOVEREIGN UI LAYER */}
      <div className="sovereign-ui-layer">
        
        {/* Refined Sidebar (3.5rem gap) */}
        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <div 
              key={item.id}
              className="sidebar-nav-item"
              title={item.label}
            >
              {item.icon}
            </div>
          ))}
        </nav>
        
        {/* Main Content */}
        <main className="sanctuary-main">
          {/* Grid Refraction System */}
          <div className="grid-system" />
          
          <canvas 
            ref={canvasRef}
            className="sovereign-canvas"
          />
          
          {/* Sovereign Action Button */}
          <button 
            className="sovereign-action"
            onClick={handleBeginJourney}
            style={{ marginTop: '30px' }}
          >
            Begin Shambhala Journey
          </button>
        </main>
      </div>
      
      {/* THE BURIAL CHAMBER (Matrix Ghost Tank) */}
      <div id="matrix-ghost-tank">
        <div id="hardwired-matrix-core"></div>
        <div className="glass-molecule"></div>
      </div>
      
      {/* Shambhala Toolbar */}
      <div className="shambhala-toolbar">
        <span className="gold-text">ENLIGHTENMENT CAFE | SOVEREIGN MODE</span>
        <span className="teal-text">IDENTITY: STEVEN_MICHAEL</span>
      </div>
      
      {/* Download Button */}
      <button className="download-btn" onClick={handleDownload}>
        DOWNLOAD BUILD
      </button>
      
      {/* Version Badge */}
      <div className="version-badge">
        V2.88_SHAMBHALA | AETHER_MIRRORLESS
      </div>
    </div>
  );
};

export default SovereignCanvas;
