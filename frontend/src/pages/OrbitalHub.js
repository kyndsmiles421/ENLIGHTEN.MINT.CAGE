import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ENLIGHTEN.MINT.CAFE — V15.0 "The Last Script"
 * ARCHITECT: Steven Michael
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PHYSICS: Kinetic Core
 *   - Gravity: 9.81
 *   - Snap Tension: 0.618 (Golden Ratio Back-Boom)
 *   - Friction: 0.05
 *   - Resonance: 432Hz
 * 
 * VISUALS: Prismatic Internal Color V16
 *   - Background Bloom: PURGED (0)
 *   - Internal Color Only
 *   - Edge Refraction: Rainbow Chromatic
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// SOVEREIGN PHYSICS ENGINE
const PHYSICS = {
  gravity: 9.81,
  snapTension: 0.618,  // Golden Ratio
  friction: 0.05,
  resonance: 432
};

// THE INITIAL FIVE — Original Architecture
const NODULES = [
  { id: "PRACTICE",   label: "Practice",    path: "/oracle",      x: 0,    y: -120, color: "#FFD700", glow: "Gold_Core" },
  { id: "MODULE_02",  label: "Archives",    path: "/archives",    x: 90,   y: 75,   color: "#00E5FF", glow: "Cyan_Edge" },
  { id: "MODULE_03",  label: "Soundscape",  path: "/soundscape",  x: -90,  y: 75,   color: "#FF00FF", glow: "Magenta_Internal" },
  { id: "MODULE_04",  label: "Workshop",    path: "/workshop",    x: 120,  y: -40,  color: "#7FFF00", glow: "Lime_Refraction" },
  { id: "MODULE_05",  label: "Star Chart",  path: "/star-chart",  x: -120, y: -40,  color: "#FF4500", glow: "Orange_Pulse" }
];

export default function OrbitalHub() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  
  // Center coordinates
  const [center, setCenter] = useState({ x: 187, y: 400 });
  
  // Nodule state with physics
  const [nodes, setNodes] = useState(() => 
    NODULES.map(n => ({
      ...n,
      currentX: 0,
      currentY: 0,
      vx: 0,
      vy: 0,
      targetX: n.x,
      targetY: n.y,
      isLocked: false,
      isActive: false
    }))
  );
  
  const [dragging, setDragging] = useState(null);
  const [extracted, setExtracted] = useState(null);

  // Initialize positions on mount
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    setCenter({ x: cx, y: cy });
    
    setNodes(prev => prev.map(n => ({
      ...n,
      currentX: cx + n.x,
      currentY: cy + n.y,
      targetX: cx + n.x,
      targetY: cy + n.y
    })));
  }, []);

  // KINETIC PHYSICS LOOP — Golden Ratio Back-Boom
  useEffect(() => {
    const animate = () => {
      setNodes(prev => prev.map(node => {
        if (dragging === node.id) return node;
        
        // Calculate distance to target
        const dx = node.targetX - node.currentX;
        const dy = node.targetY - node.currentY;
        
        // Apply Golden Ratio Snap Tension
        let vx = node.vx + dx * PHYSICS.snapTension * 0.1;
        let vy = node.vy + dy * PHYSICS.snapTension * 0.1;
        
        // Apply Friction (damping)
        vx *= (1 - PHYSICS.friction);
        vy *= (1 - PHYSICS.friction);
        
        // Update position
        const newX = node.currentX + vx;
        const newY = node.currentY + vy;
        
        // Check lock state
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isLocked = dist < 2;
        
        return {
          ...node,
          currentX: newX,
          currentY: newY,
          vx,
          vy,
          isLocked
        };
      }));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [dragging]);

  // Touch/Mouse Handlers
  const handleStart = useCallback((e, nodeId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(nodeId);
    setExtracted(null);
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(20);
  }, []);

  const handleMove = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setNodes(prev => prev.map(node => {
      if (node.id !== dragging) return node;
      
      // Check extraction threshold
      const dx = clientX - node.targetX;
      const dy = clientY - node.targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 100) {
        setExtracted(dragging);
      }
      
      return {
        ...node,
        currentX: clientX,
        currentY: clientY,
        isActive: true
      };
    }));
  }, [dragging]);

  const handleEnd = useCallback(() => {
    if (!dragging) return;
    
    const node = nodes.find(n => n.id === dragging);
    if (!node) {
      setDragging(null);
      return;
    }
    
    // Check if extracted
    const dx = node.currentX - node.targetX;
    const dy = node.currentY - node.targetY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 100) {
      // TRIGGER BRIDGE PULSE
      console.log(`[y] Technical Bridge Pulse: ${node.id} ACTIVE.`);
      
      // Heavy snap haptic
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      
      // Navigate
      setTimeout(() => navigate(node.path), 150);
    } else {
      // Back-Boom: Reset velocity for snap-back
      setNodes(prev => prev.map(n => {
        if (n.id !== dragging) return n;
        return {
          ...n,
          vx: (n.targetX - n.currentX) * 0.5,
          vy: (n.targetY - n.currentY) * 0.5,
          isActive: false
        };
      }));
    }
    
    setDragging(null);
    setExtracted(null);
  }, [dragging, nodes, navigate]);

  // Direct tap handler
  const handleTap = useCallback((node) => {
    console.log(`[y] Direct Tap: ${node.id} ACTIVE.`);
    if (navigator.vibrate) navigator.vibrate(30);
    navigate(node.path);
  }, [navigate]);

  return (
    <div 
      ref={containerRef}
      className="sovereign-hub"
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {/* 3D World Grid - Sacred Geometry Orbital */}
      <svg className="world-grid" viewBox="0 0 375 812">
        {/* Orbital rings */}
        <circle cx={center.x} cy={center.y} r="60" className="orbital-ring" />
        <circle cx={center.x} cy={center.y} r="100" className="orbital-ring" />
        <circle cx={center.x} cy={center.y} r="150" className="orbital-ring" />
        
        {/* Connection lines */}
        {nodes.map(node => (
          <line
            key={`line-${node.id}`}
            x1={center.x}
            y1={center.y}
            x2={node.currentX}
            y2={node.currentY}
            className={`connection-line ${node.isLocked ? 'locked' : ''} ${dragging === node.id ? 'active' : ''}`}
            style={{ stroke: node.color }}
          />
        ))}
        
        {/* Center core */}
        <circle cx={center.x} cy={center.y} r="12" className="center-core" />
      </svg>

      {/* Title */}
      <div className="hub-title">ENLIGHTEN.MINT.CAFE</div>
      <div className="hub-subtitle">DRAG TO EXTRACT</div>

      {/* Prismatic Nodules - Internal Color Only, No Bloom */}
      {nodes.map(node => (
        <div
          key={node.id}
          className={`prismatic-nodule ${dragging === node.id ? 'dragging' : ''} ${extracted === node.id ? 'extracted' : ''} ${node.isLocked ? 'locked' : ''}`}
          style={{
            left: node.currentX,
            top: node.currentY,
            '--nodule-color': node.color
          }}
          onTouchStart={(e) => handleStart(e, node.id)}
          onMouseDown={(e) => handleStart(e, node.id)}
          onClick={() => !dragging && handleTap(node)}
        >
          {/* Crystal body - Internal color only */}
          <div className="crystal-body">
            <span className="nodule-label">{node.label}</span>
          </div>
          
          {/* Edge refraction ring - only on extraction */}
          {extracted === node.id && (
            <div className="refraction-ring" />
          )}
        </div>
      ))}

      {/* Extraction indicator */}
      {extracted && (
        <div className="extraction-indicator">RELEASE TO ENTER</div>
      )}

      {/* Physics display */}
      <div className="physics-display">
        <span>φ {PHYSICS.snapTension}</span>
        <span>{PHYSICS.resonance}Hz</span>
      </div>

      <style>{`
        .sovereign-hub {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(180deg, #050510 0%, #0a0a1a 50%, #050510 100%);
          overflow: hidden;
          touch-action: none;
          user-select: none;
          z-index: 9999;
        }

        .world-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .orbital-ring {
          fill: none;
          stroke: rgba(212, 175, 55, 0.1);
          stroke-width: 1;
        }

        .connection-line {
          stroke-width: 1;
          opacity: 0.3;
          transition: opacity 0.2s;
        }
        .connection-line.locked { opacity: 0.5; }
        .connection-line.active { opacity: 0.8; stroke-width: 2; }

        .center-core {
          fill: rgba(212, 175, 55, 0.6);
          filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5));
        }

        .hub-title {
          position: absolute;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(212, 175, 55, 0.9);
          font-size: 16px;
          font-weight: 300;
          letter-spacing: 0.4em;
          text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
          z-index: 10;
        }

        .hub-subtitle {
          position: absolute;
          top: 110px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(212, 175, 55, 0.4);
          font-size: 10px;
          letter-spacing: 0.3em;
          z-index: 10;
        }

        .prismatic-nodule {
          position: absolute;
          transform: translate(-50%, -50%);
          z-index: 100;
          cursor: grab;
          transition: transform 0.1s;
        }
        .prismatic-nodule.dragging {
          cursor: grabbing;
          z-index: 200;
        }
        .prismatic-nodule.extracted {
          z-index: 300;
          transform: translate(-50%, -50%) scale(1.2);
        }

        .crystal-body {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(10, 10, 20, 0.95);
          border: 2px solid var(--nodule-color);
          display: flex;
          align-items: center;
          justify-content: center;
          /* INTERNAL COLOR ONLY - NO BLOOM */
          box-shadow: inset 0 0 20px var(--nodule-color);
          transition: box-shadow 0.2s, border-width 0.2s;
        }

        .prismatic-nodule.dragging .crystal-body {
          border-width: 3px;
          box-shadow: inset 0 0 30px var(--nodule-color);
        }

        .prismatic-nodule.extracted .crystal-body {
          border-width: 4px;
          box-shadow: inset 0 0 40px var(--nodule-color), 0 0 20px var(--nodule-color);
        }

        .nodule-label {
          color: var(--nodule-color);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-align: center;
        }

        .refraction-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 90px;
          height: 90px;
          margin: -45px 0 0 -45px;
          border-radius: 50%;
          border: 2px solid;
          border-color: var(--nodule-color);
          animation: refractionPulse 0.4s ease-out infinite;
          pointer-events: none;
        }

        @keyframes refractionPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .extraction-indicator {
          position: absolute;
          bottom: 180px;
          left: 50%;
          transform: translateX(-50%);
          color: #00ff00;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-shadow: 0 0 10px #00ff00;
          animation: pulse 0.5s ease-in-out infinite;
          z-index: 500;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .physics-display {
          position: absolute;
          bottom: 120px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 20px;
          color: rgba(212, 175, 55, 0.3);
          font-size: 10px;
          letter-spacing: 0.15em;
          z-index: 10;
        }
      `}</style>
    </div>
  );
}
