import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ENLIGHTEN_OS V10.1 — THE SOVEREIGN INTERFACE
 * ARCHITECT: Steven Michael
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const NODULES = [
  { id: "ORACLE",     path: "/oracle",     color: "#D4AF37", label: "Oracle" },
  { id: "ARCHIVES",   path: "/archives",   color: "#C0C0C0", label: "Archives" },
  { id: "WORKSHOP",   path: "/workshop",   color: "#B87333", label: "Workshop" },
  { id: "STAR_CHART", path: "/star-chart", color: "#a855f7", label: "Star Chart" },
  { id: "SOUNDSCAPE", path: "/soundscape", color: "#22d3ee", label: "Soundscape" }
];

export default function OrbitalHub() {
  const navigate = useNavigate();
  const [activeNodule, setActiveNodule] = useState(null);

  const handlePress = (nodule) => {
    setActiveNodule(nodule.id);
    if (navigator.vibrate) navigator.vibrate(30);
    console.log(`[SOVEREIGN] ${nodule.id} Active.`);
    setTimeout(() => navigate(nodule.path), 100);
  };

  // Calculate positions for 5 nodules in a circle
  const getPosition = (index, total, radius) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  };

  return (
    <div className="orbital-hub-container">
      {/* Title */}
      <div className="hub-title">ENLIGHTEN.MINT.CAFE</div>
      <div className="hub-version">V10.1 SOVEREIGN</div>

      {/* Flower of Life */}
      <svg className="flower-of-life" viewBox="-150 -150 300 300">
        {[0, 60, 120, 180, 240, 300].map(angle => (
          <circle
            key={angle}
            cx={Math.cos(angle * Math.PI / 180) * 45}
            cy={Math.sin(angle * Math.PI / 180) * 45}
            r="45"
            fill="none"
            stroke="rgba(212,175,55,0.15)"
            strokeWidth="1"
          />
        ))}
        <circle cx="0" cy="0" r="45" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
        <circle cx="0" cy="0" r="80" fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="1" />
      </svg>

      {/* Nodule Container - Centered */}
      <div className="nodules-container">
        {NODULES.map((nodule, index) => {
          const pos = getPosition(index, NODULES.length, 100);
          const isActive = activeNodule === nodule.id;
          
          return (
            <button
              key={nodule.id}
              onClick={() => handlePress(nodule)}
              className="nodule-button"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) ${isActive ? 'scale(1.1)' : 'scale(1)'}`,
                borderColor: nodule.color,
                background: isActive 
                  ? `radial-gradient(circle, ${nodule.color}40 0%, rgba(10,10,20,0.95) 70%)`
                  : 'rgba(10,10,20,0.95)',
                boxShadow: isActive
                  ? `0 0 30px ${nodule.color}, inset 0 0 20px ${nodule.color}50`
                  : `inset 0 0 15px ${nodule.color}30`,
              }}
            >
              <span style={{ color: nodule.color }}>{nodule.label}</span>
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <div className="hub-hint">tap crystal to enter</div>

      <style>{`
        .orbital-hub-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(ellipse at center, #0a0514 0%, #000005 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          overflow: hidden;
        }
        
        .hub-title {
          position: absolute;
          top: 80px;
          color: rgba(212,175,55,0.9);
          font-size: 16px;
          font-weight: 300;
          letter-spacing: 0.4em;
          text-shadow: 0 0 20px rgba(212,175,55,0.3);
        }
        
        .hub-version {
          position: absolute;
          top: 105px;
          color: rgba(212,175,55,0.4);
          font-size: 9px;
          letter-spacing: 0.3em;
        }
        
        .flower-of-life {
          position: absolute;
          width: 300px;
          height: 300px;
          opacity: 0.6;
          pointer-events: none;
        }
        
        .nodules-container {
          position: relative;
          width: 0;
          height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .nodule-button {
          position: absolute;
          width: 72px;
          height: 72px;
          margin-left: -36px;
          margin-top: -36px;
          border-radius: 50%;
          border: 2px solid;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          outline: none;
          z-index: 100;
        }
        
        .nodule-button span {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-align: center;
        }
        
        .nodule-button:hover {
          transform: scale(1.1) !important;
        }
        
        .nodule-button:active {
          transform: scale(0.95) !important;
        }
        
        .hub-hint {
          position: absolute;
          bottom: 100px;
          color: rgba(212,175,55,0.25);
          font-size: 10px;
          letter-spacing: 0.2em;
        }
      `}</style>
    </div>
  );
}
