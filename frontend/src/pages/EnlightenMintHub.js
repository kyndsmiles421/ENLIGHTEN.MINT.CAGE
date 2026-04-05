import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * EnlightenMintHub.js — Streamlined Orbital Hub with Zero-Re-render Physics
 * 
 * THE ARCHITECTURE:
 * 1. Bio-Sync: 5.5s breath cycle drives all animations
 * 2. Webbed Gears: CW/CCW rotation at Golden Ratio (φ = 1.618)
 * 3. Ether Extraction: 15 nodules to unlock Critical Mass
 * 4. Action Portal: Sanctuary Deeds, Aether Fund, VR Entry
 * 
 * P0 FIX: All 60fps animations use refs, not setState
 * P1 FIX: pointer-events properly layered
 */

const API = process.env.REACT_APP_BACKEND_URL;

/**
 * 1. UNIFIED ACTION & API LAYER (Sanctuary, Aether, VR)
 */
const ActionOverlay = ({ active, noduleCount, onReset }) => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  if (!active) return null;

  const handleDeed = async () => {
    setLoading(true);
    setStatus("Sealing Restoration Deed...");
    try {
      const res = await fetch(`${API}/api/sanctuary/deed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          deed_type: 'MINT-01',
          description: 'Restoration Commemorative Seed',
          karma_value: 100
        })
      });
      if (res.ok) {
        setStatus("MINT-01 Seed Witnessed in the Matrix.");
        if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
      } else {
        setStatus("Deed alignment requires authentication.");
      }
    } catch (e) {
      setStatus("Connection to Sanctuary lost.");
    }
    setLoading(false);
  };

  const handleAether = async () => {
    setLoading(true);
    setStatus("Connecting to Aether Fund...");
    try {
      const res = await fetch(`${API}/api/aether/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1100 }) // $11.00 in cents
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setStatus("Aether contribution aligned. Global Grace +1.");
        if (navigator.vibrate) navigator.vibrate([30, 50, 30, 50, 100]);
      }
    } catch (e) {
      setStatus("Aether Fund requires Stripe integration.");
    }
    setLoading(false);
  };

  const handleVR = () => {
    setStatus("Initializing Celestial Dome...");
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    setTimeout(() => navigate('/vr/celestial-dome'), 800);
  };

  return (
    <div className="action-portal" data-testid="action-overlay">
      <style>{`
        .action-portal {
          position: fixed; inset: 0; z-index: 10000; display: flex;
          align-items: center; justify-content: center; 
          background: rgba(10,10,10,0.95);
          backdrop-filter: blur(20px) saturate(1.5);
          animation: portal-bloom 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes portal-bloom {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .action-card { 
          padding: 50px; border: 1px solid var(--cafe-gold, #FFD700); 
          border-radius: 30px; text-align: center; 
          background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(20,20,30,0.9));
          box-shadow: 0 0 60px rgba(168,85,247,0.3), 0 0 120px rgba(0,255,194,0.1);
          max-width: 400px;
        }
        .action-title { 
          color: var(--cafe-gold, #FFD700); font-size: 1.5rem; 
          letter-spacing: 0.15em; margin-bottom: 10px;
        }
        .action-subtitle { 
          color: var(--mint-primary, #00FFC2); font-size: 0.8rem; 
          opacity: 0.7; margin-bottom: 30px;
        }
        .eth-btn { 
          display: block; width: 100%; margin: 12px 0; padding: 16px 20px;
          background: transparent; border: 1px solid var(--mint-primary, #00FFC2); 
          color: var(--mint-primary, #00FFC2);
          cursor: pointer; font-weight: 600; font-size: 0.85rem;
          letter-spacing: 0.1em; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border-radius: 8px;
        }
        .eth-btn:hover:not(:disabled) { 
          background: var(--mint-primary, #00FFC2); color: #000; 
          box-shadow: 0 0 30px rgba(0,255,194,0.5);
          transform: translateY(-2px);
        }
        .eth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .eth-btn.gold { border-color: var(--cafe-gold, #FFD700); color: var(--cafe-gold, #FFD700); }
        .eth-btn.gold:hover:not(:disabled) { background: var(--cafe-gold, #FFD700); }
        .eth-btn.purple { border-color: #A855F7; color: #A855F7; }
        .eth-btn.purple:hover:not(:disabled) { background: #A855F7; }
        .status-text { 
          color: #A855F7; margin-top: 25px; font-size: 0.8rem; 
          min-height: 20px; letter-spacing: 0.05em;
        }
        .collapse-btn { 
          color: rgba(255,255,255,0.3); background: none; border: none; 
          cursor: pointer; margin-top: 15px; font-size: 0.7rem;
          letter-spacing: 0.1em; transition: color 0.3s;
        }
        .collapse-btn:hover { color: rgba(255,255,255,0.6); }
      `}</style>
      
      <div className="action-card">
        <h2 className="action-title">RESONANCE COMPLETE</h2>
        <p className="action-subtitle">15 Nodules Extracted — Critical Mass Achieved</p>
        
        <button 
          className="eth-btn gold" 
          onClick={handleDeed}
          disabled={loading}
          data-testid="seal-deed-btn"
        >
          SEAL RESTORATION DEED (MINT-01)
        </button>
        
        <button 
          className="eth-btn" 
          onClick={handleAether}
          disabled={loading}
          data-testid="aether-fund-btn"
        >
          CONTRIBUTE TO AETHER FUND ($11)
        </button>
        
        <button 
          className="eth-btn purple" 
          onClick={handleVR}
          disabled={loading}
          data-testid="vr-entry-btn"
        >
          ENTER CELESTIAL DOME (VR)
        </button>
        
        <p className="status-text">{status}</p>
        
        <button 
          className="collapse-btn" 
          onClick={onReset}
          data-testid="collapse-btn"
        >
          COLLAPSE ETHER
        </button>
      </div>
    </div>
  );
};

/**
 * 2. MASTER ENLIGHTEN.MINT HUB
 */
export default function EnlightenMintHub() {
  const [nodules, setNodules] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  
  // REFS: P0 Physics & Gear Logic (Zero-re-render loop)
  const gearRef = useRef(null);
  const coreRef = useRef(null);
  const breathRef = useRef(1);
  const nodulesRef = useRef(0); // Track nodules without re-render

  // BIO-SYNC & GEAR ANIMATION (60FPS Substrate)
  useEffect(() => {
    let frameId;
    const phi = 1.618033988749895; // Golden Ratio for Webbed Gears
    
    const animate = () => {
      const time = Date.now();
      
      // Breath Sync (5.5s Cycle) — drives all organic motion
      const breath = (Math.sin(time / 875) + 1) / 2; 
      breathRef.current = 0.8 + (breath * 0.4);

      if (gearRef.current) {
        // CW/CCW Rotational Logic with Golden Ratio
        const rotationCW = (time * 0.001 * breathRef.current) % (Math.PI * 2);
        const rotationCCW = (time * 0.001 * phi * -1) % (Math.PI * 2);
        gearRef.current.style.setProperty('--cw', `${rotationCW}rad`);
        gearRef.current.style.setProperty('--ccw', `${rotationCCW}rad`);
      }

      if (coreRef.current) {
        // Core pulse synced to breath
        const pulse = 1 + (Math.sin(time / 500) * 0.05 * breathRef.current);
        coreRef.current.style.transform = `scale(${pulse})`;
        
        // Update glow based on nodule count
        const glowIntensity = 20 + (nodulesRef.current * 3);
        coreRef.current.style.filter = `drop-shadow(0 0 ${glowIntensity}px var(--mint-primary, #00FFC2))`;
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const extractNodule = useCallback(() => {
    if (nodules < 15) {
      const next = nodules + 1;
      setNodules(next);
      nodulesRef.current = next;
      
      // Haptic feedback: escalating intensity
      if (navigator.vibrate) {
        const intensity = 30 + (next * 5);
        navigator.vibrate([intensity, 20, intensity / 2]);
      }
      
      // Critical Mass achieved
      if (next === 15) {
        setIsComplete(true);
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100, 50, 100, 50, 200]);
        }
      }
    }
  }, [nodules]);

  const resetHub = useCallback(() => {
    setNodules(0);
    nodulesRef.current = 0;
    setIsComplete(false);
    if (navigator.vibrate) navigator.vibrate([20, 10, 20]);
  }, []);

  const handleNavigation = useCallback((path) => {
    if (navigator.vibrate) navigator.vibrate([15, 10, 30]);
    navigate(path);
  }, [navigate]);

  // Navigation items with paths
  const navItems = [
    { label: 'Matrix', path: '/matrix' },
    { label: 'Oracle', path: '/oracle' },
    { label: 'Tarot', path: '/tarot' },
    { label: 'I Ching', path: '/iching' },
    { label: 'Stars', path: '/stars' },
    { label: 'Legacy', path: '/legacy' },
  ];

  return (
    <div className="ether-container" data-testid="enlighten-mint-hub">
      <style>{`
        .ether-container { 
          position: relative; width: 100vw; height: 100vh; overflow: hidden;
          background: var(--bg-dark-roast, #0a0a0f); 
          color: var(--mint-primary, #00FFC2); 
          font-family: 'Inter', -apple-system, sans-serif;
          perspective: 1200px;
        }
        
        /* THE SUBSTRATE: Webbed Gears */
        .gear-substrate { 
          position: absolute; inset: 0; pointer-events: none; 
          display: flex; align-items: center; justify-content: center;
          opacity: 0.2;
        }
        .gear { 
          position: absolute;
          border: 2px dashed;
          border-radius: 50%; 
          transition: border-color 0.5s;
        }
        .gear-cw { 
          width: 600px; height: 600px; 
          border-color: var(--enlighten-purple, #A855F7);
          transform: rotate(var(--cw, 0rad));
        }
        .gear-ccw { 
          width: 400px; height: 400px; 
          border-color: var(--mint-primary, #00FFC2);
          transform: rotate(var(--ccw, 0rad));
        }
        .gear-inner {
          width: 200px; height: 200px;
          border-color: var(--cafe-gold, #FFD700);
          transform: rotate(var(--cw, 0rad));
          opacity: 0.5;
        }
        
        /* P1 FIX: Pointer interception */
        .aura-visuals, .gear-substrate, .cosmic-bg { 
          pointer-events: none !important; 
          z-index: 1; 
        }
        
        /* Central Core */
        .central-core {
          position: absolute; top: 50%; left: 50%; 
          transform: translate(-50%, -50%);
          z-index: 100; cursor: pointer; text-align: center;
          pointer-events: auto;
        }
        .nodule-count { 
          font-size: clamp(4rem, 15vw, 10rem); 
          font-weight: 900; 
          background: linear-gradient(135deg, var(--mint-primary, #00FFC2), var(--enlighten-purple, #A855F7));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        .brand-name { 
          color: var(--cafe-gold, #FFD700); 
          letter-spacing: 0.3em; 
          font-size: clamp(0.6rem, 2vw, 1rem);
          font-weight: 600;
          margin-top: 10px;
        }
        .hint-text { 
          font-size: 0.65rem; 
          opacity: 0.5; 
          margin-top: 15px;
          letter-spacing: 0.1em;
        }
        
        /* SmartDock Navigation */
        .smart-dock {
          position: absolute; left: 30px; top: 50%; transform: translateY(-50%);
          display: flex; flex-direction: column; gap: 12px; z-index: 500;
          pointer-events: auto;
        }
        .nav-link { 
          background: rgba(0,255,194,0.03); 
          border: 1px solid rgba(0,255,194,0.2);
          padding: 12px 24px; cursor: pointer; 
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          font-weight: 500;
          border-radius: 4px;
        }
        .nav-link:hover { 
          background: var(--mint-primary, #00FFC2); 
          color: #000; 
          transform: translateX(8px);
          box-shadow: 0 0 20px rgba(0,255,194,0.4);
        }
        
        /* Emergency Stop */
        .emergency-stop {
          position: absolute; top: 20px; left: 20px; z-index: 10001;
          background: rgba(255,0,0,0.1); border: 1px solid #ff4444; 
          color: #ff4444; cursor: pointer; padding: 8px 16px;
          font-size: 0.7rem; letter-spacing: 0.1em; font-weight: 600;
          transition: all 0.3s;
          border-radius: 4px;
          pointer-events: auto;
        }
        .emergency-stop:hover {
          background: #ff4444; color: #000;
        }
        
        /* Progress Ring */
        .progress-ring {
          position: absolute; top: 20px; right: 20px;
          width: 60px; height: 60px; z-index: 500;
        }
        .progress-text {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 600;
          color: var(--mint-primary, #00FFC2);
        }
      `}</style>

      {/* BASE LAYER: Webbed Gears */}
      <div className="gear-substrate" ref={gearRef} aria-hidden="true">
        <div className="gear gear-cw" />
        <div className="gear gear-ccw" />
        <div className="gear gear-inner" />
      </div>

      {/* ETHER: Central Core */}
      <div 
        className="central-core" 
        ref={coreRef} 
        onClick={extractNodule}
        data-testid="central-core"
      >
        <div className="nodule-count">{nodules}</div>
        <div className="brand-name">ENLIGHTEN.MINT.CAFE</div>
        <p className="hint-text">
          {nodules === 0 && 'TAP TO EXTRACT FROM BASE LAYER'}
          {nodules > 0 && nodules < 15 && `${15 - nodules} NODULES REMAINING`}
          {nodules === 15 && 'CRITICAL MASS ACHIEVED'}
        </p>
      </div>

      {/* INTERFACE: SmartDock */}
      <nav className="smart-dock" data-testid="smart-dock">
        {navItems.map(item => (
          <div 
            key={item.label} 
            className="nav-link"
            onClick={() => handleNavigation(item.path)}
            data-testid={`nav-${item.label.toLowerCase()}`}
          >
            {item.label.toUpperCase()}
          </div>
        ))}
      </nav>

      {/* Progress Ring */}
      <div className="progress-ring" data-testid="progress-ring">
        <svg viewBox="0 0 60 60">
          <circle
            cx="30" cy="30" r="26"
            fill="none"
            stroke="rgba(0,255,194,0.1)"
            strokeWidth="4"
          />
          <circle
            cx="30" cy="30" r="26"
            fill="none"
            stroke="var(--mint-primary, #00FFC2)"
            strokeWidth="4"
            strokeDasharray={`${(nodules / 15) * 163.36} 163.36`}
            strokeLinecap="round"
            transform="rotate(-90 30 30)"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        </svg>
        <div className="progress-text">{nodules}/15</div>
      </div>

      {/* ACTION OVERLAY */}
      <ActionOverlay 
        active={isComplete} 
        noduleCount={nodules} 
        onReset={resetHub} 
      />

      {/* EMERGENCY STOP */}
      <button 
        className="emergency-stop"
        onClick={resetHub}
        data-testid="emergency-stop"
      >
        STOP
      </button>
    </div>
  );
}
