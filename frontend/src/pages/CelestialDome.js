import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CelestialDome.js — VR Entry Point for Sovereign Key Holders
 * 
 * This is the destination for users who achieve Critical Mass (15 nodules)
 * or accumulate sufficient Karma/Resonance to unlock VR access.
 * 
 * Future Integration:
 * - WebXR for immersive VR experience
 * - A-Frame or Three.js for 3D dome environment
 * - Spatial audio with HRTF positioning
 */

const API = process.env.REACT_APP_BACKEND_URL;

export default function CelestialDome() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vrSupported, setVrSupported] = useState(false);
  const [userKarma, setUserKarma] = useState(0);

  // Check VR support and user eligibility
  useEffect(() => {
    const checkVRSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-vr');
          setVrSupported(supported);
        } catch {
          setVrSupported(false);
        }
      }
    };

    const fetchUserKarma = async () => {
      try {
        const token = localStorage.getItem('zen_token');
        if (token) {
          const res = await fetch(`${API}/api/sanctuary/karma`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUserKarma(data.karma || 0);
          }
        }
      } catch {
        // Karma check optional
      }
      setIsLoading(false);
    };

    checkVRSupport();
    fetchUserKarma();
  }, []);

  // Starfield animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Stars
    const stars = Array.from({ length: 400 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      brightness: Math.random(),
    }));

    let frameId;
    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 10, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        // Twinkle effect
        const twinkle = 0.5 + Math.sin(Date.now() * 0.002 * star.speed + star.x) * 0.5;
        const alpha = star.brightness * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        // Move towards center (zoom effect)
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dx = star.x - centerX;
        const dy = star.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 10) {
          star.x += (dx / dist) * star.speed * 0.5;
          star.y += (dy / dist) * star.speed * 0.5;
        } else {
          // Reset star to edge
          const angle = Math.random() * Math.PI * 2;
          const edgeDist = Math.max(canvas.width, canvas.height);
          star.x = centerX + Math.cos(angle) * edgeDist;
          star.y = centerY + Math.sin(angle) * edgeDist;
        }
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const enterVR = async () => {
    if (!vrSupported) {
      alert('VR not supported on this device. Displaying in 2D mode.');
      return;
    }

    try {
      const session = await navigator.xr.requestSession('immersive-vr');
      console.log('VR session started:', session);
      // Future: Initialize Three.js/A-Frame VR scene
    } catch (e) {
      console.error('Failed to enter VR:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-purple-400 mt-4 animate-pulse">Calibrating Celestial Coordinates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="celestial-dome" data-testid="celestial-dome">
      <style>{`
        .celestial-dome {
          position: relative; min-height: 100vh; overflow: hidden;
          background: linear-gradient(180deg, #050510 0%, #0a0a1a 50%, #0f0f2a 100%);
          color: white; font-family: 'Inter', sans-serif;
        }
        .star-canvas {
          position: absolute; inset: 0; z-index: 0;
        }
        .dome-content {
          position: relative; z-index: 10;
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 20px; text-align: center;
        }
        .dome-title {
          font-size: clamp(2rem, 8vw, 4rem);
          font-weight: 100;
          letter-spacing: 0.3em;
          background: linear-gradient(135deg, #A855F7, #00FFC2, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px;
        }
        .dome-subtitle {
          color: rgba(168, 85, 247, 0.7);
          font-size: 0.9rem;
          letter-spacing: 0.2em;
          margin-bottom: 50px;
        }
        .status-badge {
          display: inline-block;
          padding: 8px 20px;
          border: 1px solid;
          border-radius: 20px;
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          margin-bottom: 40px;
        }
        .status-badge.unlocked {
          border-color: #00FFC2;
          color: #00FFC2;
          box-shadow: 0 0 20px rgba(0, 255, 194, 0.2);
        }
        .status-badge.locked {
          border-color: #FFD700;
          color: #FFD700;
        }
        .dome-actions {
          display: flex; flex-direction: column; gap: 15px;
          width: 100%; max-width: 300px;
        }
        .dome-btn {
          padding: 16px 32px;
          border: 1px solid;
          background: transparent;
          cursor: pointer;
          font-weight: 600;
          letter-spacing: 0.1em;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border-radius: 8px;
        }
        .dome-btn.primary {
          border-color: #A855F7;
          color: #A855F7;
        }
        .dome-btn.primary:hover {
          background: #A855F7;
          color: #000;
          box-shadow: 0 0 40px rgba(168, 85, 247, 0.5);
        }
        .dome-btn.secondary {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.5);
        }
        .dome-btn.secondary:hover {
          border-color: rgba(255,255,255,0.5);
          color: white;
        }
        .karma-display {
          margin-top: 40px;
          padding: 20px;
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: 15px;
          background: rgba(0,0,0,0.3);
        }
        .karma-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #FFD700;
        }
        .karma-label {
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.5);
          margin-top: 5px;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 60px;
          max-width: 800px;
          width: 100%;
        }
        .feature-card {
          padding: 25px;
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: 12px;
          background: rgba(0,0,0,0.2);
          text-align: left;
        }
        .feature-card h4 {
          color: #00FFC2;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          margin-bottom: 10px;
        }
        .feature-card p {
          color: rgba(255,255,255,0.5);
          font-size: 0.75rem;
          line-height: 1.6;
        }
        .coming-soon {
          display: inline-block;
          padding: 3px 8px;
          background: rgba(168, 85, 247, 0.2);
          border-radius: 4px;
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          color: #A855F7;
          margin-left: 8px;
        }
      `}</style>

      {/* Starfield Background */}
      <canvas ref={canvasRef} className="star-canvas" />

      {/* Main Content */}
      <div className="dome-content">
        <h1 className="dome-title">CELESTIAL DOME</h1>
        <p className="dome-subtitle">SOVEREIGN VR SANCTUARY</p>

        {/* VR Support Badge */}
        <div className={`status-badge ${vrSupported ? 'unlocked' : 'locked'}`}>
          {vrSupported ? 'VR READY' : 'VR NOT DETECTED — 2D MODE'}
        </div>

        {/* Action Buttons */}
        <div className="dome-actions">
          <button 
            className="dome-btn primary"
            onClick={enterVR}
            data-testid="enter-vr-btn"
          >
            {vrSupported ? 'ENTER IMMERSIVE VR' : 'VIEW 2D EXPERIENCE'}
          </button>
          
          <button 
            className="dome-btn secondary"
            onClick={() => navigate('/ether-hub')}
            data-testid="return-hub-btn"
          >
            RETURN TO HUB
          </button>
        </div>

        {/* Karma Display */}
        <div className="karma-display">
          <div className="karma-value">{userKarma}</div>
          <div className="karma-label">ACCUMULATED KARMA</div>
        </div>

        {/* Feature Cards */}
        <div className="feature-grid">
          <div className="feature-card">
            <h4>SPATIAL MEDITATION <span className="coming-soon">COMING SOON</span></h4>
            <p>Guided meditation in an immersive celestial environment with spatial audio.</p>
          </div>
          <div className="feature-card">
            <h4>SOVEREIGN COUNCIL <span className="coming-soon">COMING SOON</span></h4>
            <p>Meet the 10-member AI council in a virtual throne room.</p>
          </div>
          <div className="feature-card">
            <h4>SEED GARDEN <span className="coming-soon">COMING SOON</span></h4>
            <p>Plant and nurture your collected seeds in a virtual botanical sanctuary.</p>
          </div>
          <div className="feature-card">
            <h4>COSMIC OBSERVATORY <span className="coming-soon">COMING SOON</span></h4>
            <p>Explore star charts and planetary alignments in 360° VR.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
