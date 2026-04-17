import React, { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSanctuary } from '../context/EnlightenmentContext';
import { useEnlightenmentUI, ManualModeIndicator } from '../utils/EnlightenmentUI';
import { ShieldStatus } from '../utils/SilenceShield';

/**
 * SilentSanctuary.js — The Void Interface
 * 
 * PHILOSOPHY:
 * - NO pop-ups, NO auto-play audio, NO intrusive elements
 * - User-triggered experience ONLY (enforced by EnlightenmentUI)
 * - Pure resonance through intentional interaction
 * - Uses EnlightenmentContext for state management
 * 
 * Route: /silent-sanctuary
 */

export default function SilentSanctuary() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('silent_sanctuary', 8); }, []);

  const navigate = useNavigate();
  const { handleAction, isManualMode } = useEnlightenmentUI();
  const { 
    nodules, 
    resonance, 
    extract, 
    seal, 
    reset,
    isMeditationActive,
    toggleMeditation 
  } = useSanctuary();
  
  const [isPulling, setIsPulling] = React.useState(false);
  const canvasRef = useRef(null);
  const frameIdRef = useRef(null);

  // Crystalline Web Animation (Silent, ref-based)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const animate = () => {
      const time = Date.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Only draw if nodules exist
      if (nodules > 0) {
        ctx.strokeStyle = resonance 
          ? 'rgba(255, 215, 0, 0.3)' 
          : 'rgba(0, 255, 194, 0.15)';
        ctx.lineWidth = 0.5;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        for (let i = 0; i < nodules; i++) {
          const angle = (i / 15) * Math.PI * 2 + (time * 0.0003);
          const radius = 150 + Math.sin(time * 0.001 + i) * 20;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          // Draw connection lines to center
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(centerX, centerY);
          ctx.stroke();

          // Draw nodule point
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = resonance ? '#FFD700' : '#00FFC2';
          ctx.fill();
        }

        // Central pulse
        const pulseSize = 10 + Math.sin(time * 0.002) * 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${0.3 + Math.sin(time * 0.002) * 0.2})`;
        ctx.fill();
      }

      frameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [nodules, resonance]);

  // Handle bar click - extract nodule via context
  const handleBarClick = useCallback(() => {
    setIsPulling(prev => !prev);
    
    if (nodules < 15) {
      extract(); // Use context action
      if (navigator.vibrate) navigator.vibrate([5, 10]);
      
      if (nodules === 14) {
        // Seal the deed when resonance achieved
        seal('VOID-RESONANCE', 'Silent Sanctuary Completion');
        if (navigator.vibrate) navigator.vibrate([30, 20, 30, 20, 50]);
      }
    }
  }, [nodules, extract, seal]);

  // Handle void click - collapse panel
  const handleVoidClick = useCallback(() => {
    if (isPulling) {
      setIsPulling(false);
    }
  }, [isPulling]);

  // Reset function - uses context
  const handleReset = useCallback(() => {
    reset();
    setIsPulling(false);
  }, [reset]);

  return (
    <div 
      className="sanctuary-frame" 
      data-testid="silent-sanctuary"
    >
      {/* THE MAIN VOID (Where the actual experience lives) */}
      <div 
        className="main-void" 
        onClick={handleVoidClick}
        data-testid="main-void"
      >
        {/* Crystalline Web Canvas */}
        <canvas 
          ref={canvasRef} 
          className="crystalline-canvas"
          aria-hidden="true"
        />
        
        {/* Central Status (Only visible when nodules exist) */}
        {nodules > 0 && (
          <div className="void-status">
            <div className={`void-counter ${resonance ? 'resonating' : ''}`}>{nodules}</div>
            <div className={`void-label ${resonance ? 'resonating' : ''}`}>
              {resonance ? 'RESONANCE ACHIEVED' : 'EXTRACTING'}
            </div>
          </div>
        )}

        {/* Navigation hint */}
        <div className="nav-hint" onClick={() => navigate('/ether-hub')}>
          ETHER HUB
        </div>
        
        {/* Manual Mode Indicator */}
        <div className="mode-indicator">
          <ManualModeIndicator compact />
        </div>
        
        {/* Shield Status */}
        <div className="shield-indicator">
          <ShieldStatus minimal />
        </div>
      </div>

      {/* THE PULL-UP INTERFACE */}
      <div 
        className={`ether-reveal ${isPulling ? 'expanded' : ''}`}
        data-testid="ether-reveal"
      >
        <h2 className="experience-node">ENLIGHTEN.MINT</h2>
        <div className="nodule-counter">{nodules}/15 NODULES EXTRACTED</div>
        
        {resonance && (
          <div className="resonance-actions">
            <button 
              className="action-btn"
              onClick={() => navigate('/sanctuary')}
            >
              ENTER SANCTUARY
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/vr/celestial-dome')}
            >
              CELESTIAL DOME
            </button>
            <button 
              className="action-btn reset"
              onClick={handleReset}
            >
              RESET
            </button>
          </div>
        )}
        
        <p className="philosophy-text">NO ADS. NO POP-UPS. ONLY RESONANCE.</p>
      </div>

      {/* THE MATRIX BAR (The Only Interaction Point) */}
      <div 
        className="matrix-anchor-bar" 
        onClick={handleBarClick}
        data-testid="matrix-bar"
      />

      <style>{`
        .sanctuary-frame {
          position: fixed;
          inset: 0;
          background: #000;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .main-void {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .crystalline-canvas {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .void-status {
          position: relative;
          z-index: 10;
          text-align: center;
          pointer-events: none;
        }

        .void-counter {
          font-size: 8rem;
          font-weight: 100;
          color: rgba(255,255,255,0.1);
          line-height: 1;
          transition: color 0.5s;
        }
        
        .void-counter.resonating {
          color: #FFD700;
        }

        .void-label {
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          color: rgba(255,255,255,0.65);
          margin-top: 10px;
        }
        
        .void-label.resonating {
          color: #FFD700;
        }

        .nav-hint {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: color 0.3s;
          z-index: 100;
        }

        .nav-hint:hover {
          color: #00FFC2;
        }

        .mode-indicator {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 100;
        }

        .shield-indicator {
          position: absolute;
          top: 20px;
          left: 50px;
          z-index: 100;
        }

        /* 📏 THE HORIZONTAL BASE BAR (Left to Right) */
        .matrix-anchor-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: #00FFC2;
          box-shadow: 0 -2px 10px rgba(0, 255, 194, 0.5);
          z-index: 10000;
          cursor: pointer;
          transition: height 0.3s, background 0.3s;
        }

        .matrix-anchor-bar:hover {
          height: 6px;
          background: #FFD700;
        }

        /* 🌫️ THE ETHER (User-Triggered Experience Only) */
        .ether-reveal {
          position: absolute;
          bottom: 4px;
          left: 0;
          width: 100%;
          height: 0;
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(20px);
          transition: height 0.6s cubic-bezier(0.19, 1, 0.22, 1);
          border-top: 1px solid rgba(0, 255, 194, 0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 9999;
        }

        .ether-reveal.expanded {
          height: 280px;
        }

        .experience-node {
          color: #FFF;
          letter-spacing: 10px;
          font-size: 1.2rem;
          font-weight: 300;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s, transform 0.8s;
          margin: 0;
        }

        .ether-reveal.expanded .experience-node {
          opacity: 1;
          transform: translateY(0);
        }

        .nodule-counter {
          color: #00FFC2;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          margin-top: 15px;
          opacity: 0;
          transition: opacity 0.8s 0.2s;
        }

        .ether-reveal.expanded .nodule-counter {
          opacity: 1;
        }

        .resonance-actions {
          display: flex;
          gap: 15px;
          margin-top: 20px;
          opacity: 0;
          transition: opacity 0.5s 0.3s;
        }

        .ether-reveal.expanded .resonance-actions {
          opacity: 1;
        }

        .action-btn {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.6);
          color: white;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          cursor: pointer;
          transition: all 0.3s;
        }

        .action-btn:hover {
          border-color: #00FFC2;
          color: #00FFC2;
        }

        .action-btn.reset {
          border-color: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
        }

        .action-btn.reset:hover {
          border-color: #EF4444;
          color: #EF4444;
        }

        .philosophy-text {
          color: #333;
          margin-top: 25px;
          font-size: 0.55rem;
          letter-spacing: 0.2em;
          opacity: 0;
          transition: opacity 0.8s 0.4s;
        }

        .ether-reveal.expanded .philosophy-text {
          opacity: 1;
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .void-counter {
            font-size: 5rem;
          }

          .experience-node {
            font-size: 1rem;
            letter-spacing: 5px;
          }

          .ether-reveal.expanded {
            height: 240px;
          }

          .resonance-actions {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}
