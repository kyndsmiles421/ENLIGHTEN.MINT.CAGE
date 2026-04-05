/**
 * SOVEREIGN CANVAS PAGE V1.0
 * Location: /sovereign-canvas, /replant
 * Action: Central Gravity / Shambhala Mixer
 * Identity: STEVEN_MICHAEL
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

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
  const mouseRef = useRef({ x: 0, y: 0 });

  // 1. Initialize Shambhala Aether (No Grid)
  const initAether = useCallback(() => {
    document.body.style.background = "#000";
    document.body.style.overflow = "hidden";
    document.title = "The Enlightenment Cafe | Sovereign Mode";
    
    // Clear any lingering 'Matrix' elements manually
    const ghosts = document.querySelectorAll('.matrix-layer, .finn-popup');
    ghosts.forEach(g => g.remove());
    
    console.log("[SOVEREIGN] Aether initialized — Matrix purged.");
  }, []);

  // 2. The Gravitational Pull Logic
  const applyGravity = useCallback((module) => {
    const G = 0.15;
    const RADIUS_LIMIT = 47.94;
    const dx = 0 - module.x;
    const dy = 0 - module.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Squeeze: Gravity pulls in
    const pull = G * (dist / RADIUS_LIMIT) * 0.01;
    module.vx += dx * pull;
    module.vy += dy * pull;
    
    // Damping
    module.vx *= 0.995;
    module.vy *= 0.995;
    
    // Update position
    module.x += module.vx;
    module.y += module.vy;
    
    // Modules drift to the absolute front as they hit center
    module.zIndex = Math.floor(10000 / (dist + 1));
    module.scale = 1 + (50 / (dist + 50));
    module.opacity = Math.max(0.4, 1 - (dist / 300));
    
    return module;
  }, []);

  // 3. Animation Loop
  useEffect(() => {
    initAether();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 53;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Mouse tracking
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left - centerX,
        y: e.clientY - rect.top - centerY
      };
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    
    // Config
    const CONFIG = {
      GOLD: '#fbc02d',
      COPPER: '#B87333',
      TEAL: '#00FFCC',
      R_LIMIT: 200
    };
    
    // 6 Hexagonal anchors
    const anchors = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      anchors.push({
        x: Math.cos(angle) * CONFIG.R_LIMIT * 0.7,
        y: Math.sin(angle) * CONFIG.R_LIMIT * 0.7
      });
    }
    
    const loop = () => {
      // Clear with fade trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw golden boundary
      ctx.beginPath();
      ctx.arc(centerX, centerY, CONFIG.R_LIMIT, 0, Math.PI * 2);
      ctx.strokeStyle = CONFIG.GOLD;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.stroke();
      
      // Draw inner silver web
      ctx.beginPath();
      ctx.arc(centerX, centerY, CONFIG.R_LIMIT * 0.95, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(192, 192, 192, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw copper conduits to anchors
      anchors.forEach(a => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(a.x + centerX, a.y + centerY);
        ctx.strokeStyle = CONFIG.COPPER;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Anchor nodes
        ctx.beginPath();
        ctx.arc(a.x + centerX, a.y + centerY, 6, 0, Math.PI * 2);
        ctx.fillStyle = CONFIG.COPPER;
        ctx.fill();
      });
      
      // Update and draw modules
      setModules(prevModules => {
        const updated = prevModules.map(m => applyGravity({ ...m }));
        
        // Sort by zIndex for proper layering
        const sorted = [...updated].sort((a, b) => a.zIndex - b.zIndex);
        
        sorted.forEach(module => {
          const scale = module.scale || 1;
          const size = 30 * scale;
          
          ctx.globalAlpha = module.opacity || 1;
          
          // Module circle
          ctx.beginPath();
          ctx.arc(module.x + centerX, module.y + centerY, size, 0, Math.PI * 2);
          ctx.fillStyle = module.color;
          ctx.fill();
          
          // Module border
          ctx.strokeStyle = CONFIG.GOLD;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Module label
          ctx.fillStyle = '#fff';
          ctx.font = `${10 * scale}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(module.name, module.x + centerX, module.y + centerY + 4);
          
          ctx.globalAlpha = 1;
        });
        
        return updated;
      });
      
      // Center source node
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
      ctx.fillText(`MODULES: ${modules.length}`, 15, 70);
      
      animationRef.current = requestAnimationFrame(loop);
    };
    
    loop();
    
    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 53;
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
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

  return (
    <div id="sovereign-root" style={{
      position: 'fixed',
      inset: 0,
      background: '#000',
      zIndex: 999999
    }}>
      {/* Shambhala Toolbar */}
      <div id="shambhala-toolbar" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '50px',
        borderBottom: '3px solid #fbc02d',
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 1000000,
        fontFamily: 'monospace'
      }}>
        <span className="gold-text" style={{ color: '#fbc02d', fontWeight: 'bold', fontSize: '14px' }}>
          ENLIGHTENMENT CAFE | SOVEREIGN MODE
        </span>
        <span style={{ color: '#00FFCC', fontSize: '12px' }}>
          IDENTITY: STEVEN_MICHAEL
        </span>
      </div>
      
      {/* Shambhala Flow Canvas */}
      <canvas 
        ref={canvasRef}
        id="shambhala-flow"
        style={{
          display: 'block',
          marginTop: '53px',
          cursor: 'crosshair',
          background: '#000'
        }}
      />
      
      {/* Download Button */}
      <button
        onClick={handleDownload}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          border: '2px solid #00FFCC',
          background: 'rgba(0, 255, 204, 0.1)',
          color: '#00FFCC',
          padding: '12px 24px',
          borderRadius: '47.94px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '12px',
          zIndex: 1000001,
          transition: 'all 0.2s'
        }}
      >
        DOWNLOAD BUILD
      </button>
      
      {/* Version Badge */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        color: '#00FFCC',
        fontSize: '10px',
        fontFamily: 'monospace',
        opacity: 0.7,
        zIndex: 1000001
      }}>
        V2.88_SHAMBHALA | AETHER_MIRRORLESS
      </div>
    </div>
  );
};

export default SovereignCanvas;
