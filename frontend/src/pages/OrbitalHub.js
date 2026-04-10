import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * KINETIC_GRAVITY_V11.0 — RESTORED PHYSICS ENGINE
 * ARCHITECT: Steven Michael
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PHYSICS: Active Tension / Spring-Back / Snap-to-Lattice
 * GRAVITY: 9.81
 * SPRING: 0.55
 * FRICTION: 0.08
 * HITBOX: Absolute (1:1 touch-to-logic)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// KINETIC ENGINE SETTINGS
const KINETIC = {
  gravityConstant: 9.81,
  springTension: 0.55,
  friction: 0.08,
  snapThreshold: 20,
  extractThreshold: 150
};

// NODULE DEFINITIONS
const NODULES_CONFIG = [
  { id: "oracle", label: "Oracle", path: "/oracle", color: "#D4AF37", icon: "✧" },
  { id: "archives", label: "Archives", path: "/archives", color: "#C0C0C0", icon: "📁" },
  { id: "soundscape", label: "Soundscape", path: "/soundscape", color: "#22d3ee", icon: "🎵" },
  { id: "workshop", label: "Workshop", path: "/workshop", color: "#B87333", icon: "⚒" },
  { id: "star-chart", label: "Star Chart", path: "/star-chart", color: "#a855f7", icon: "⭐" }
];

// Calculate lattice positions (pentagon formation)
const getLatticePositions = (centerX, centerY, radius) => {
  return NODULES_CONFIG.map((_, i) => {
    const angle = (i / NODULES_CONFIG.length) * Math.PI * 2 - Math.PI / 2;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  });
};

export default function OrbitalHub() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 375, height: 700 });
  
  // Nodule physics state
  const [nodules, setNodules] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [extractedId, setExtractedId] = useState(null);
  const velocitiesRef = useRef({});
  
  // Initialize nodules at lattice positions
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setDimensions({ width: w, height: h });
    
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) * 0.25;
    const lattice = getLatticePositions(centerX, centerY, radius);
    
    const initialNodules = NODULES_CONFIG.map((config, i) => ({
      ...config,
      x: lattice[i].x,
      y: lattice[i].y,
      targetX: lattice[i].x,
      targetY: lattice[i].y,
      isLocked: true
    }));
    
    setNodules(initialNodules);
    
    // Initialize velocities
    const vels = {};
    NODULES_CONFIG.forEach(n => {
      vels[n.id] = { vx: 0, vy: 0 };
    });
    velocitiesRef.current = vels;
  }, []);

  // KINETIC PHYSICS LOOP
  useEffect(() => {
    if (nodules.length === 0) return;
    
    const animate = () => {
      setNodules(prev => prev.map(nodule => {
        if (draggingId === nodule.id || extractedId === nodule.id) {
          return nodule;
        }
        
        const vel = velocitiesRef.current[nodule.id] || { vx: 0, vy: 0 };
        
        // Calculate spring force toward target (lattice position)
        const dx = nodule.targetX - nodule.x;
        const dy = nodule.targetY - nodule.y;
        
        // Apply spring tension (the snap-back force)
        vel.vx += dx * KINETIC.springTension * 0.1;
        vel.vy += dy * KINETIC.springTension * 0.1;
        
        // Apply friction for stability
        vel.vx *= (1 - KINETIC.friction);
        vel.vy *= (1 - KINETIC.friction);
        
        // Update position
        const newX = nodule.x + vel.vx;
        const newY = nodule.y + vel.vy;
        
        // Check if locked to lattice
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isLocked = dist < KINETIC.snapThreshold;
        
        velocitiesRef.current[nodule.id] = vel;
        
        return {
          ...nodule,
          x: newX,
          y: newY,
          isLocked
        };
      }));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [nodules.length, draggingId, extractedId]);

  // TOUCH HANDLERS
  const handleTouchStart = useCallback((e, noduleId) => {
    e.preventDefault();
    setDraggingId(noduleId);
    setExtractedId(null);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!draggingId) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    
    setNodules(prev => prev.map(n => {
      if (n.id !== draggingId) return n;
      
      // Check extraction distance from target
      const dx = x - n.targetX;
      const dy = y - n.targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > KINETIC.extractThreshold) {
        setExtractedId(draggingId);
      }
      
      return { ...n, x, y };
    }));
  }, [draggingId]);

  const handleTouchEnd = useCallback((e) => {
    if (!draggingId) return;
    
    const nodule = nodules.find(n => n.id === draggingId);
    if (!nodule) {
      setDraggingId(null);
      return;
    }
    
    // Check if extracted (pulled far enough)
    const dx = nodule.x - nodule.targetX;
    const dy = nodule.y - nodule.targetY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > KINETIC.extractThreshold) {
      // TRIGGER NAVIGATION - Nodule is "hot"
      console.log(`Kinetic Lock Engaged: ${nodule.id} is Hot.`);
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
      
      // Navigate after brief delay for visual feedback
      setTimeout(() => {
        navigate(nodule.path);
      }, 200);
    } else {
      // Spring back to lattice (the "Back-Boom")
      velocitiesRef.current[draggingId] = {
        vx: (nodule.targetX - nodule.x) * 0.3,
        vy: (nodule.targetY - nodule.y) * 0.3
      };
    }
    
    setDraggingId(null);
    setExtractedId(null);
  }, [draggingId, nodules, navigate]);

  // Direct tap handler
  const handleTap = useCallback((nodule) => {
    if (navigator.vibrate) navigator.vibrate(30);
    console.log(`Direct Tap: ${nodule.id} Activated.`);
    navigate(nodule.path);
  }, [navigate]);

  return (
    <div 
      ref={containerRef}
      className="kinetic-hub"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={(e) => draggingId && handleTouchMove({ touches: [{ clientX: e.clientX, clientY: e.clientY }], preventDefault: () => {} })}
      onMouseUp={handleTouchEnd}
    >
      {/* Rainbow Refraction Background */}
      <div className="refraction-layer">
        {[0, 51, 102, 153, 204, 255, 306].map((angle, i) => (
          <div
            key={angle}
            className="refraction-ray"
            style={{
              transform: `rotate(${angle}deg)`,
              background: `linear-gradient(to bottom, transparent, ${
                ['rgba(255,0,0,0.15)', 'rgba(255,127,0,0.12)', 'rgba(255,255,0,0.1)', 
                 'rgba(0,255,0,0.12)', 'rgba(0,127,255,0.15)', 'rgba(75,0,130,0.12)', 
                 'rgba(148,0,211,0.1)'][i]
              }, transparent)`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>

      {/* Lattice Grid Visualization */}
      <svg className="lattice-grid" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
        {/* Connection lines to center */}
        {nodules.map(n => (
          <line
            key={`line-${n.id}`}
            x1={dimensions.width / 2}
            y1={dimensions.height / 2}
            x2={n.x}
            y2={n.y}
            stroke={n.isLocked ? n.color : 'rgba(212,175,55,0.3)'}
            strokeWidth={n.isLocked ? 1 : 2}
            strokeDasharray={n.isLocked ? "none" : "5,5"}
            opacity={draggingId === n.id ? 0.8 : 0.3}
          />
        ))}
        {/* Center point */}
        <circle
          cx={dimensions.width / 2}
          cy={dimensions.height / 2}
          r="8"
          fill="rgba(212,175,55,0.5)"
        />
      </svg>

      {/* Title */}
      <div className="hub-title">ENLIGHTEN.MINT.CAFE</div>
      <div className="hub-subtitle">DRAG TO EXTRACT</div>

      {/* Kinetic Nodules */}
      {nodules.map(nodule => {
        const isActive = draggingId === nodule.id;
        const isExtracted = extractedId === nodule.id;
        
        return (
          <div
            key={nodule.id}
            className={`kinetic-nodule ${isActive ? 'active' : ''} ${isExtracted ? 'extracted' : ''} ${nodule.isLocked ? 'locked' : ''}`}
            style={{
              left: nodule.x,
              top: nodule.y,
              borderColor: nodule.color,
              boxShadow: isExtracted 
                ? `0 0 40px ${nodule.color}, 0 0 80px ${nodule.color}50`
                : isActive 
                  ? `0 0 25px ${nodule.color}80`
                  : `inset 0 0 15px ${nodule.color}30`,
              transform: `translate(-50%, -50%) scale(${isExtracted ? 1.3 : isActive ? 1.1 : 1})`
            }}
            onTouchStart={(e) => handleTouchStart(e, nodule.id)}
            onMouseDown={(e) => { e.preventDefault(); setDraggingId(nodule.id); }}
            onClick={() => !draggingId && handleTap(nodule)}
          >
            <span className="nodule-icon">{nodule.icon}</span>
            <span className="nodule-label" style={{ color: nodule.color }}>{nodule.label}</span>
            
            {/* Prismatic pulse ring on extraction */}
            {isExtracted && (
              <div className="prismatic-pulse" style={{ borderColor: nodule.color }} />
            )}
          </div>
        );
      })}

      {/* Extraction indicator */}
      {extractedId && (
        <div className="extraction-hint">RELEASE TO ENTER</div>
      )}

      <style>{`
        .kinetic-hub {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(ellipse at center, #0a0514 0%, #000005 100%);
          overflow: hidden;
          touch-action: none;
          user-select: none;
          z-index: 9999;
        }
        
        .refraction-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }
        
        .refraction-ray {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2px;
          height: 200vh;
          transform-origin: center center;
          animation: rayPulse 6s ease-in-out infinite;
          filter: blur(1px);
        }
        
        @keyframes rayPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        
        .lattice-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
        }
        
        .hub-title {
          position: absolute;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(212,175,55,0.9);
          font-size: 16px;
          font-weight: 300;
          letter-spacing: 0.4em;
          text-shadow: 0 0 20px rgba(212,175,55,0.3);
          z-index: 10;
        }
        
        .hub-subtitle {
          position: absolute;
          top: 110px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(212,175,55,0.4);
          font-size: 10px;
          letter-spacing: 0.3em;
          z-index: 10;
        }
        
        .kinetic-nodule {
          position: absolute;
          width: 75px;
          height: 75px;
          border-radius: 50%;
          border: 2px solid;
          background: rgba(10,10,20,0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: grab;
          z-index: 100;
          transition: box-shadow 0.2s, transform 0.1s;
        }
        
        .kinetic-nodule.active {
          cursor: grabbing;
          z-index: 200;
        }
        
        .kinetic-nodule.extracted {
          z-index: 300;
        }
        
        .kinetic-nodule.locked::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid rgba(212,175,55,0.2);
        }
        
        .nodule-icon {
          font-size: 20px;
          margin-bottom: 2px;
        }
        
        .nodule-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        
        .prismatic-pulse {
          position: absolute;
          inset: -15px;
          border-radius: 50%;
          border: 2px solid;
          animation: pulseOut 0.5s ease-out infinite;
        }
        
        @keyframes pulseOut {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        .extraction-hint {
          position: absolute;
          bottom: 150px;
          left: 50%;
          transform: translateX(-50%);
          color: #00ff00;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-shadow: 0 0 10px #00ff00;
          animation: blink 0.5s ease-in-out infinite;
          z-index: 500;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
