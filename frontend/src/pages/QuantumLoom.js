import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * QuantumLoom.js — Quantum Entanglement Hub
 * 
 * THE VERTICAL AXIS METAPHOR:
 * - TOP (Purple): Higher Systems — Celestial Dome, Sanctuary, VR
 * - CENTER: The User as Conduit — 15 nodule extraction
 * - BOTTOM (Mint): Human Interaction — Oracle, Tarot, I Ching
 * 
 * Features:
 * - Crystalline Web Interlay (Canvas entanglement lines)
 * - Pull-Down / Pull-Up portal bars
 * - Zero re-render animation (canvas-based)
 */

export default function QuantumLoom() {
  const navigate = useNavigate();
  const [nodules, setNodules] = useState(0);
  const [activePortal, setActivePortal] = useState(null); // 'TOP' | 'BOTTOM' | null
  const [isComplete, setIsComplete] = useState(false);
  const canvasRef = useRef(null);
  const breathRef = useRef(1);

  // CRYSTALLINE WEB INTERLAY (The "Entanglement" Visuals)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let frameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drawWeb = () => {
      const time = Date.now();
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;
      
      // Breath sync (5.5s cycle)
      const breath = (Math.sin(time / 875) + 1) / 2;
      breathRef.current = 0.7 + (breath * 0.6);

      ctx.clearRect(0, 0, w, h);

      // Draw entanglement lines for each nodule position
      const noduleCount = 15;
      const radius = Math.min(w, h) * 0.2;

      for (let i = 0; i < noduleCount; i++) {
        const angle = (i / noduleCount) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Pulse based on breath
        const pulse = 0.1 + (Math.sin(time / 500 + i * 0.5) + 1) * 0.15 * breathRef.current;
        
        // Entanglement to TOP Bar (purple tint)
        const topGradient = ctx.createLinearGradient(x, y, centerX, 30);
        topGradient.addColorStop(0, `rgba(168, 85, 247, ${pulse})`);
        topGradient.addColorStop(1, `rgba(168, 85, 247, ${pulse * 0.3})`);
        
        ctx.beginPath();
        ctx.strokeStyle = topGradient;
        ctx.lineWidth = 0.5 + breathRef.current * 0.5;
        ctx.moveTo(x, y);
        ctx.lineTo(centerX, 30);
        ctx.stroke();

        // Entanglement to BOTTOM Bar (mint tint)
        const bottomGradient = ctx.createLinearGradient(x, y, centerX, h - 30);
        bottomGradient.addColorStop(0, `rgba(0, 255, 194, ${pulse})`);
        bottomGradient.addColorStop(1, `rgba(0, 255, 194, ${pulse * 0.3})`);
        
        ctx.beginPath();
        ctx.strokeStyle = bottomGradient;
        ctx.lineWidth = 0.5 + breathRef.current * 0.5;
        ctx.moveTo(x, y);
        ctx.lineTo(centerX, h - 30);
        ctx.stroke();

        // Draw nodule point
        const isExtracted = i < nodules;
        ctx.beginPath();
        ctx.arc(x, y, isExtracted ? 8 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isExtracted 
          ? `rgba(255, 215, 0, ${0.5 + pulse})` 
          : `rgba(255, 255, 255, ${0.2 + pulse * 0.3})`;
        ctx.fill();
        
        // Glow for extracted nodules
        if (isExtracted) {
          ctx.beginPath();
          ctx.arc(x, y, 12 + breathRef.current * 4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 215, 0, ${pulse * 0.5})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Draw center core
      const coreRadius = 30 + breathRef.current * 10;
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
      coreGradient.addColorStop(0, `rgba(255, 215, 0, ${0.3 + breathRef.current * 0.2})`);
      coreGradient.addColorStop(0.5, `rgba(168, 85, 247, ${0.2 + breathRef.current * 0.1})`);
      coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      frameId = requestAnimationFrame(drawWeb);
    };

    frameId = requestAnimationFrame(drawWeb);
    
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, [nodules]);

  // Nodule extraction
  const extractNodule = useCallback(() => {
    if (nodules < 15) {
      const next = nodules + 1;
      setNodules(next);
      
      // Haptic feedback with escalating intensity
      if (navigator.vibrate) {
        navigator.vibrate([20 + next * 3, 15, 10 + next * 2]);
      }
      
      if (next === 15) {
        setIsComplete(true);
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100, 50, 100, 50, 200]);
        }
      }
    }
  }, [nodules]);

  // Reset
  const collapse = useCallback(() => {
    setNodules(0);
    setIsComplete(false);
    if (navigator.vibrate) navigator.vibrate([20, 10, 20]);
  }, []);

  // Navigation handlers
  const handleTopNav = useCallback((destination) => {
    if (navigator.vibrate) navigator.vibrate([30, 15, 50]);
    switch (destination) {
      case 'celestial': navigate('/vr/celestial-dome'); break;
      case 'sanctuary': navigate('/sanctuary'); break;
      case 'sovereign': navigate('/sovereigns'); break;
      default: break;
    }
  }, [navigate]);

  const handleBottomNav = useCallback((destination) => {
    if (navigator.vibrate) navigator.vibrate([15, 10, 30]);
    switch (destination) {
      case 'oracle': navigate('/oracle'); break;
      case 'tarot': navigate('/tarot'); break;
      case 'iching': navigate('/iching'); break;
      case 'stars': navigate('/stars'); break;
      default: break;
    }
  }, [navigate]);

  return (
    <div className="quantum-container" data-testid="quantum-loom">
      <style>{`
        .quantum-container {
          position: relative; width: 100vw; height: 100vh;
          background: radial-gradient(ellipse at center, #0a0a15 0%, #050508 100%);
          overflow: hidden; color: var(--mint-primary, #00FFC2);
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* 🌩️ TOP BAR: Higher Systems (Purple) - PULLS DOWN */
        .pull-down-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 60px;
          background: linear-gradient(180deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid rgba(168, 85, 247, 0.3);
          z-index: 1000;
          display: flex; align-items: center; justify-content: center; gap: 40px;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform: translateY(${activePortal === 'TOP' ? '0' : '-40px'});
          opacity: ${activePortal === 'TOP' ? '1' : '0.6'};
        }
        .pull-down-bar:hover {
          transform: translateY(0);
          opacity: 1;
          box-shadow: 0 10px 40px rgba(168, 85, 247, 0.2);
        }

        /* 🌊 BOTTOM BAR: Human Interaction (Mint) - PULLS UP */
        .pull-up-bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 60px;
          background: linear-gradient(0deg, rgba(0, 255, 194, 0.15) 0%, rgba(0, 255, 194, 0.05) 100%);
          backdrop-filter: blur(15px);
          border-top: 1px solid rgba(0, 255, 194, 0.3);
          z-index: 1000;
          display: flex; align-items: center; justify-content: center; gap: 40px;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform: translateY(${activePortal === 'BOTTOM' ? '0' : '40px'});
          opacity: ${activePortal === 'BOTTOM' ? '1' : '0.6'};
        }
        .pull-up-bar:hover {
          transform: translateY(0);
          opacity: 1;
          box-shadow: 0 -10px 40px rgba(0, 255, 194, 0.2);
        }

        .bar-item { 
          cursor: pointer; 
          letter-spacing: 0.2em; 
          font-weight: 500;
          font-size: 0.75rem;
          padding: 8px 16px;
          border-radius: 4px;
          transition: all 0.3s;
        }
        .bar-item.top { color: #A855F7; }
        .bar-item.top:hover { 
          background: rgba(168, 85, 247, 0.2);
          transform: translateY(2px);
        }
        .bar-item.bottom { color: #00FFC2; }
        .bar-item.bottom:hover { 
          background: rgba(0, 255, 194, 0.2);
          transform: translateY(-2px);
        }

        /* Crystalline Web Canvas */
        .crystal-web { 
          position: absolute; inset: 0; z-index: 100; 
          pointer-events: none; 
        }

        /* 🔮 CENTRAL TRIGGER */
        .central-trigger {
          position: absolute; top: 50%; left: 50%; 
          transform: translate(-50%, -50%);
          z-index: 1100; cursor: pointer; text-align: center;
          pointer-events: auto;
        }
        .nodule-count {
          font-size: clamp(5rem, 20vw, 12rem);
          font-weight: 900;
          background: linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          transition: transform 0.2s;
        }
        .central-trigger:active .nodule-count {
          transform: scale(0.95);
        }
        .entanglement-label {
          font-size: 0.65rem;
          opacity: 0.4;
          letter-spacing: 0.2em;
          margin-top: 10px;
        }
        .progress-hint {
          font-size: 0.8rem;
          color: #FFD700;
          margin-top: 20px;
          letter-spacing: 0.1em;
        }

        /* Emergency Stop */
        .collapse-btn {
          position: absolute; top: 20px; left: 20px; z-index: 2000;
          background: rgba(255, 68, 68, 0.1);
          color: #ff4444;
          border: 1px solid rgba(255, 68, 68, 0.3);
          padding: 8px 16px;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s;
        }
        .collapse-btn:hover {
          background: #ff4444;
          color: #000;
        }

        /* Progress indicator */
        .progress-ring {
          position: absolute; top: 20px; right: 20px;
          width: 50px; height: 50px; z-index: 1100;
        }
        .progress-text {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 600;
          color: #FFD700;
        }

        /* Completion Overlay */
        .completion-overlay {
          position: fixed; inset: 0; z-index: 5000;
          background: rgba(5, 5, 10, 0.95);
          backdrop-filter: blur(20px);
          display: flex; align-items: center; justify-content: center;
          animation: fade-in 0.5s ease;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .completion-card {
          text-align: center;
          padding: 50px;
          border: 1px solid #FFD700;
          border-radius: 20px;
          background: rgba(0,0,0,0.5);
          box-shadow: 0 0 60px rgba(255, 215, 0, 0.2);
        }
        .completion-title {
          font-size: 1.5rem;
          color: #FFD700;
          letter-spacing: 0.2em;
          margin-bottom: 30px;
        }
        .completion-btn {
          display: block;
          width: 100%;
          margin: 10px 0;
          padding: 14px 28px;
          background: transparent;
          border: 1px solid;
          cursor: pointer;
          font-weight: 600;
          letter-spacing: 0.1em;
          transition: all 0.3s;
          border-radius: 6px;
        }
        .completion-btn.gold { border-color: #FFD700; color: #FFD700; }
        .completion-btn.gold:hover { background: #FFD700; color: #000; }
        .completion-btn.mint { border-color: #00FFC2; color: #00FFC2; }
        .completion-btn.mint:hover { background: #00FFC2; color: #000; }
        .completion-btn.purple { border-color: #A855F7; color: #A855F7; }
        .completion-btn.purple:hover { background: #A855F7; color: #000; }
        .dismiss-btn {
          margin-top: 20px;
          color: rgba(255,255,255,0.3);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
        }
      `}</style>

      {/* Crystalline Web Layer */}
      <canvas ref={canvasRef} className="crystal-web" />

      {/* TOP: Higher Systems (Purple) */}
      <nav 
        className="pull-down-bar" 
        onMouseEnter={() => setActivePortal('TOP')} 
        onMouseLeave={() => setActivePortal(null)}
        data-testid="top-portal"
      >
        <div className="bar-item top" onClick={() => handleTopNav('celestial')}>CELESTIAL DOME</div>
        <div className="bar-item top" onClick={() => handleTopNav('sanctuary')}>SANCTUARY</div>
        <div className="bar-item top" onClick={() => handleTopNav('sovereign')}>SOVEREIGN COUNCIL</div>
      </nav>

      {/* CENTER: The Co-Entanglement Core */}
      <div 
        className="central-trigger" 
        onClick={extractNodule}
        data-testid="quantum-core"
      >
        <div className="nodule-count">{nodules}</div>
        <div className="entanglement-label">QUANTUM ENTANGLEMENT ACTIVE</div>
        <div className="progress-hint">
          {nodules === 0 && 'TAP TO EXTRACT'}
          {nodules > 0 && nodules < 15 && `${15 - nodules} REMAINING`}
          {nodules === 15 && 'RESONANCE COMPLETE'}
        </div>
      </div>

      {/* BOTTOM: Human Interaction (Mint) */}
      <nav 
        className="pull-up-bar" 
        onMouseEnter={() => setActivePortal('BOTTOM')} 
        onMouseLeave={() => setActivePortal(null)}
        data-testid="bottom-portal"
      >
        <div className="bar-item bottom" onClick={() => handleBottomNav('oracle')}>ORACLE</div>
        <div className="bar-item bottom" onClick={() => handleBottomNav('tarot')}>TAROT</div>
        <div className="bar-item bottom" onClick={() => handleBottomNav('iching')}>I CHING</div>
        <div className="bar-item bottom" onClick={() => handleBottomNav('stars')}>STARS</div>
      </nav>

      {/* Progress Ring */}
      <div className="progress-ring">
        <svg viewBox="0 0 50 50">
          <circle
            cx="25" cy="25" r="22"
            fill="none"
            stroke="rgba(255, 215, 0, 0.1)"
            strokeWidth="3"
          />
          <circle
            cx="25" cy="25" r="22"
            fill="none"
            stroke="#FFD700"
            strokeWidth="3"
            strokeDasharray={`${(nodules / 15) * 138.2} 138.2`}
            strokeLinecap="round"
            transform="rotate(-90 25 25)"
            style={{ transition: 'stroke-dasharray 0.4s ease' }}
          />
        </svg>
        <div className="progress-text">{nodules}/15</div>
      </div>

      {/* Collapse/Reset Button */}
      <button 
        className="collapse-btn"
        onClick={collapse}
        data-testid="collapse-btn"
      >
        COLLAPSE
      </button>

      {/* Completion Overlay */}
      {isComplete && (
        <div className="completion-overlay" data-testid="completion-overlay">
          <div className="completion-card">
            <div className="completion-title">ENTANGLEMENT COMPLETE</div>
            <button className="completion-btn gold" onClick={() => navigate('/sanctuary')}>
              SEAL DEED (SANCTUARY)
            </button>
            <button className="completion-btn mint" onClick={() => navigate('/ether-hub')}>
              RETURN TO ETHER HUB
            </button>
            <button className="completion-btn purple" onClick={() => navigate('/vr/celestial-dome')}>
              ENTER CELESTIAL DOME
            </button>
            <button className="dismiss-btn" onClick={collapse}>
              COLLAPSE ENTANGLEMENT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
