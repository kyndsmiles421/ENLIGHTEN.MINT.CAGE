import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * EnlightenMintHub.js — Quantum Loom Interface
 * 
 * THE ARCHITECTURE:
 * 1. Matrix Substrate: 60fps mechanical drift
 * 2. Crystalline Web: Canvas lines connecting nodules to toolbars
 * 3. Nodule Extraction: 15 pulls = Critical Mass (Infinity Resonance)
 * 4. Stripe Integration: Architect/Seeker subscription tiers
 * 
 * Route: /ether-hub
 */

const API = process.env.REACT_APP_BACKEND_URL;

export default function EnlightenMintHub() {
  const navigate = useNavigate();
  const [nodules, setNodules] = useState(0);
  const [isResonating, setIsResonating] = useState(false);
  const [showActionOverlay, setShowActionOverlay] = useState(false);
  const matrixRef = useRef(null);
  const canvasRef = useRef(null);
  const frameIdRef = useRef(null);

  // 🌀 THE SUBSTRATE: 60FPS Mechanical Gears & Crystalline Web
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
      
      // Matrix Drift (Base Layer)
      if (matrixRef.current) {
        matrixRef.current.style.transform = `scale(${1 + Math.sin(time / 1000) * 0.02})`;
      }

      // 🕸️ Crystalline Web Rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = isResonating ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 255, 194, 0.2)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < nodules; i++) {
        const angle = (i / 15) * Math.PI * 2 + (time * 0.0005);
        const x = canvas.width / 2 + Math.cos(angle) * 180;
        const y = canvas.height / 2 + Math.sin(angle) * 180;

        // Entangle to Toolbars
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(canvas.width / 2, 60);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(canvas.width / 2, canvas.height - 60);
        ctx.stroke();
        
        // Draw nodule point
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = isResonating ? '#FFD700' : '#00FFC2';
        ctx.fill();
      }
      
      frameIdRef.current = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [nodules, isResonating]);

  const triggerExtraction = useCallback(() => {
    if (nodules < 15) {
      setNodules(n => n + 1);
      if (navigator.vibrate) navigator.vibrate([10, 30]);
      if (nodules === 14) {
        setIsResonating(true);
        setShowActionOverlay(true);
        if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
      }
    }
  }, [nodules]);

  const handleStripeCheckout = async (tier) => {
    try {
      // Call backend to create checkout session
      const res = await fetch(`${API}/api/subscriptions/checkout-subscription`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('zen_token')}`
        },
        body: JSON.stringify({ 
          tier,
          success_url: `${window.location.origin}/vr/celestial-dome?welcome=true`,
          cancel_url: window.location.href
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        }
      } else {
        console.error('Failed to create checkout session');
        // Navigate to membership page as fallback
        navigate('/membership');
      }
    } catch (err) {
      console.error('Stripe checkout error:', err);
      navigate('/membership');
    }
  };

  const handleTopToolbarClick = () => {
    if (isResonating) {
      handleStripeCheckout('architect');
    } else {
      // Hint to user
      if (navigator.vibrate) navigator.vibrate([5]);
    }
  };

  const handleBottomToolbarClick = () => {
    if (isResonating) {
      handleStripeCheckout('seeker');
    } else {
      // Navigate to oracle as preview
      navigate('/oracle');
    }
  };

  const resetHub = useCallback(() => {
    setNodules(0);
    setIsResonating(false);
    setShowActionOverlay(false);
  }, []);

  return (
    <div className="quantum-loom" data-testid="enlighten-mint-hub">
      {/* TOOLBARS: Top (System) & Bottom (Interaction) */}
      <nav 
        className={`toolbar top ${isResonating ? 'active' : ''}`}
        onClick={handleTopToolbarClick}
        data-testid="toolbar-top"
      >
        <span className="toolbar-text">
          CELESTIAL DOME : SANCTUARY : ARCHITECT ACCESS
        </span>
        {isResonating && <span className="toolbar-hint">CLICK TO ASCEND</span>}
      </nav>

      <div className="matrix-bg" ref={matrixRef} />
      <canvas 
        ref={canvasRef} 
        className="crystalline-canvas"
        aria-hidden="true"
      />

      <div 
        className="hub-core" 
        onClick={triggerExtraction}
        data-testid="hub-core"
      >
        <div 
          className="nodule-text" 
          style={{ filter: isResonating ? 'hue-rotate(270deg)' : 'none' }}
        >
          {nodules}
        </div>
        <div className="nodule-label">
          {isResonating ? "INFINITY RESONANCE" : "PULL FROM BASE"}
        </div>
        <div className="nodule-progress">
          {Array.from({ length: 15 }).map((_, i) => (
            <span 
              key={i} 
              className={`progress-dot ${i < nodules ? 'filled' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Action Overlay when Critical Mass reached */}
      {showActionOverlay && (
        <div className="action-overlay" data-testid="action-overlay">
          <div className="action-panel">
            <h2>CRITICAL MASS ACHIEVED</h2>
            <p>15 Nodules Extracted — The Matrix Resonates</p>
            <div className="action-buttons">
              <button onClick={() => navigate('/sanctuary')} className="action-btn sanctuary">
                SANCTUARY
              </button>
              <button onClick={() => navigate('/vr/celestial-dome')} className="action-btn vr">
                ENTER VR DOME
              </button>
              <button onClick={() => handleStripeCheckout('architect')} className="action-btn stripe">
                ARCHITECT KEY
              </button>
              <button onClick={resetHub} className="action-btn reset">
                RESET HUB
              </button>
            </div>
          </div>
        </div>
      )}

      <nav 
        className={`toolbar bottom ${isResonating ? 'active' : ''}`}
        onClick={handleBottomToolbarClick}
        data-testid="toolbar-bottom"
      >
        <span className="toolbar-text">
          ORACLE : TAROT : SEEKER ENTRANCE
        </span>
        {!isResonating && <span className="toolbar-hint">PREVIEW ORACLE</span>}
      </nav>

      <style>{`
        .quantum-loom {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: #000;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .matrix-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.4;
          background: 
            linear-gradient(rgba(0,255,194,0.1) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(0,255,194,0.1) 1px, transparent 1px);
          background-size: 40px 40px;
          transition: transform 0.1s ease-out;
        }
        
        .crystalline-canvas {
          position: absolute;
          inset: 0;
          z-index: 100;
          pointer-events: none;
        }
        
        .toolbar {
          position: fixed;
          left: 0;
          right: 0;
          height: 60px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(10px);
          color: #FFD700;
          letter-spacing: 3px;
          font-size: 0.7rem;
          transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          cursor: pointer;
        }
        
        .toolbar-text {
          transition: opacity 0.3s;
        }
        
        .toolbar-hint {
          font-size: 0.55rem;
          color: #00FFC2;
          margin-top: 2px;
          opacity: 0.7;
        }
        
        .top {
          top: 0;
          border-bottom: 1px solid #A855F7;
          transform: translateY(-10px);
        }
        
        .top:hover, .top.active {
          transform: translateY(0);
          background: rgba(168, 85, 247, 0.2);
        }
        
        .bottom {
          bottom: 0;
          border-top: 1px solid #00FFC2;
          transform: translateY(10px);
        }
        
        .bottom:hover, .bottom.active {
          transform: translateY(0);
          background: rgba(0, 255, 194, 0.1);
        }
        
        .hub-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 500;
          text-align: center;
          cursor: pointer;
          user-select: none;
        }
        
        .hub-core:active .nodule-text {
          transform: scale(0.95);
        }
        
        .nodule-text {
          font-size: 10rem;
          font-weight: 900;
          color: #FFF;
          text-shadow: 0 0 30px #00FFC2, 0 0 60px rgba(0, 255, 194, 0.5);
          line-height: 1;
          transition: filter 0.5s, transform 0.1s;
        }
        
        .nodule-label {
          color: #A855F7;
          margin-top: -20px;
          font-size: 0.8rem;
          letter-spacing: 0.2em;
        }
        
        .nodule-progress {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-top: 20px;
        }
        
        .progress-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
        }
        
        .progress-dot.filled {
          background: #00FFC2;
          box-shadow: 0 0 8px #00FFC2;
        }
        
        /* Action Overlay */
        .action-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.9);
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .action-panel {
          text-align: center;
          padding: 40px;
          border: 1px solid #A855F7;
          background: rgba(10, 10, 20, 0.95);
          max-width: 400px;
        }
        
        .action-panel h2 {
          color: #FFD700;
          font-size: 1.2rem;
          letter-spacing: 0.3em;
          margin-bottom: 10px;
        }
        
        .action-panel p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
          margin-bottom: 30px;
        }
        
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .action-btn {
          padding: 12px 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          color: white;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .action-btn.sanctuary:hover {
          border-color: #00FFC2;
          color: #00FFC2;
        }
        
        .action-btn.vr:hover {
          border-color: #A855F7;
          color: #A855F7;
        }
        
        .action-btn.stripe:hover {
          border-color: #FFD700;
          color: #FFD700;
        }
        
        .action-btn.reset {
          margin-top: 10px;
          opacity: 0.5;
        }
        
        .action-btn.reset:hover {
          opacity: 1;
          border-color: #EF4444;
          color: #EF4444;
        }
        
        /* Mobile adjustments */
        @media (max-width: 640px) {
          .nodule-text {
            font-size: 6rem;
          }
          
          .toolbar {
            font-size: 0.55rem;
            letter-spacing: 2px;
          }
          
          .action-panel {
            margin: 20px;
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
}
