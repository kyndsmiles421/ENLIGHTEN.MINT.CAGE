/**
 * THE ENLIGHTENMENT CAFE: SOVEREIGN SYSTEM CORE
 * Feature: Full-Bleed Edge-to-Edge Visualization
 * Logic: Kinetic Anchors, HRTF Audio, and Witness Attestation
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL;

// --- SOVEREIGN SYSTEM COMPONENT ---
export default function EnlightenmentOS() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('enlightenment', 8); }, []);

  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [isBottomActive, setBottomActive] = useState(false);
  const [karmaBalance, setKarmaBalance] = useState(0);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const frameIdRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Fetch user karma
  useEffect(() => {
    const fetchKarma = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API}/api/sanctuary/karma?user_id=${user?.email || 'anonymous'}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setKarmaBalance(data.karma || 0);
        }
      } catch (e) {
        console.warn('Failed to fetch karma:', e);
      }
    };
    fetchKarma();
  }, [token, user?.email]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    let THREE;

    const initScene = async () => {
      try {
        THREE = await import('three');
        
        const container = mountRef.current;
        if (!container) return;

        // Scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          75, 
          window.innerWidth / window.innerHeight, 
          0.1, 
          1000
        );
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x05000a, 1);
        container.appendChild(renderer.domElement);

        // Crystalline Geometry (The Sanctuary)
        const geo = new THREE.IcosahedronGeometry(20, 2);
        const mat = new THREE.MeshBasicMaterial({ 
          color: 0x00FFC0, 
          wireframe: true, 
          transparent: true, 
          opacity: 0.1,
          blending: THREE.AdditiveBlending,
        });
        const dome = new THREE.Mesh(geo, mat);
        scene.add(dome);

        // Inner rotating crystalline structure
        const innerGeo = new THREE.IcosahedronGeometry(15, 1);
        const innerMat = new THREE.MeshBasicMaterial({
          color: 0xA855F7,
          wireframe: true,
          transparent: true,
          opacity: 0.08,
          blending: THREE.AdditiveBlending,
        });
        const innerDome = new THREE.Mesh(innerGeo, innerMat);
        scene.add(innerDome);

        // Particle field
        const particleCount = 1000;
        const particlesGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        const colorPalette = [
          new THREE.Color(0x00FFC0),
          new THREE.Color(0xA855F7),
          new THREE.Color(0xFFD700),
        ];

        for (let i = 0; i < particleCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = Math.pow(Math.random(), 0.5) * 18;

          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          positions[i * 3 + 2] = r * Math.cos(phi);

          const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        }

        particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particlesMat = new THREE.PointsMaterial({
          size: 0.08,
          transparent: true,
          opacity: 0.5,
          sizeAttenuation: true,
          vertexColors: true,
          blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(particlesGeo, particlesMat);
        scene.add(particles);

        camera.position.z = 5;

        // Store scene reference
        sceneRef.current = {
          scene,
          camera,
          renderer,
          dome,
          innerDome,
          particles,
          mat,
          innerMat,
        };

        // Animation
        const animate = () => {
          const time = Date.now();
          const breath = (Math.sin(time / 875) + 1) / 2;
          
          dome.rotation.y += 0.001;
          dome.rotation.x += 0.0003;
          innerDome.rotation.y -= 0.0015;
          innerDome.rotation.z += 0.0005;
          particles.rotation.y += 0.0002;
          
          // Pulse opacity
          mat.opacity = 0.06 + breath * 0.08;
          innerMat.opacity = 0.05 + breath * 0.05;
          
          renderer.render(scene, camera);
          frameIdRef.current = requestAnimationFrame(animate);
        };
        animate();

        // Handle resize
        const handleResize = () => {
          if (!container || !sceneRef.current) return;
          const { camera, renderer } = sceneRef.current;
          renderer.setSize(window.innerWidth, window.innerHeight);
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        sceneRef.current.cleanup = () => {
          cancelAnimationFrame(frameIdRef.current);
          window.removeEventListener('resize', handleResize);
          renderer.dispose();
          geo.dispose();
          mat.dispose();
          innerGeo.dispose();
          innerMat.dispose();
          particlesGeo.dispose();
          particlesMat.dispose();
          if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        };

      } catch (err) {
        console.error('Failed to initialize 3D scene:', err);
      }
    };

    initScene();

    return () => {
      if (sceneRef.current?.cleanup) {
        sceneRef.current.cleanup();
      }
    };
  }, []);

  // Initialize Audio Context (on user interaction)
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      setIsAudioReady(true);
    } catch (e) {
      console.warn('Audio context failed:', e);
    }
  }, []);

  // Handle navigation with haptic feedback
  const handleNavigate = useCallback((path) => {
    if (navigator.vibrate) {
      navigator.vibrate([15, 10, 30]);
    }
    navigate(path);
  }, [navigate]);

  // Navigation links
  const NAV_LINKS = [
    { key: 'HUB', path: '/ether-hub' },
    { key: 'ETHER', path: '/hub' },
    { key: 'LOOM', path: '/quantum-loom' },
    { key: 'DOME', path: '/vr/celestial-dome' },
    { key: 'EXIT', path: '/dashboard' },
  ];

  return (
    <div className="system-root" data-testid="enlightenment-os" onClick={initAudio}>
      {/* 3D VISUALIZATION LAYER (Behind the UI) */}
      <div ref={mountRef} className="full-bleed-canvas" />

      {/* TOP STRIP: THE SKY ANCHOR */}
      <header className="sanctuary-top-strip">
        <div className="status-item text-red-500 font-bold">● VOID</div>
        <div className="status-item font-orbitron text-white">SOVEREIGN_DIRECTOR</div>
        <div className="status-item text-mint-green">KARMA: {karmaBalance}</div>
      </header>

      {/* CENTER HOLLOW: MAIN INTERFACE */}
      <main className="main-sanctuary-area">
        {/* Cosmos AI Portal */}
        <div className="cosmos-portal" onClick={() => handleNavigate('/sovereigns')}>
          <div className="pulse-ring" />
          <div className="pulse-ring delay-1" />
          <div className="pulse-ring delay-2" />
          <span className="text-[10px] tracking-widest opacity-50 absolute">COSMOS_AI_ACTIVE</span>
        </div>

        {/* Quick Actions Grid */}
        <div className="quick-actions-grid">
          {[
            { icon: '◈', label: 'SANCTUARY', path: '/sanctuary' },
            { icon: '◇', label: 'MEMBERSHIP', path: '/membership' },
            { icon: '⬡', label: 'ORACLE', path: '/oracle' },
            { icon: '∞', label: 'JOURNAL', path: '/journal' },
          ].map(item => (
            <button 
              key={item.label}
              className="quick-action-btn"
              onClick={() => handleNavigate(item.path)}
              data-testid={`quick-action-${item.label.toLowerCase()}`}
            >
              <span className="quick-icon">{item.icon}</span>
              <span className="quick-label">{item.label}</span>
            </button>
          ))}
        </div>
      </main>

      {/* BOTTOM RUBBER BAND: THE EARTH ANCHOR */}
      <footer 
        className={`rubber-band-utility ${isBottomActive ? 'expanded' : 'collapsed'}`}
        onMouseEnter={() => setBottomActive(true)}
        onMouseLeave={() => setBottomActive(false)}
        onTouchStart={() => setBottomActive(true)}
      >
        {/* The Action Menu (Only visible when pulled up) */}
        {isBottomActive && (
          <nav className="action-hub animate-in fade-in slide-in-from-bottom-4">
            {NAV_LINKS.map(link => (
              <button 
                key={link.key} 
                className="nav-btn"
                onClick={() => handleNavigate(link.path)}
                data-testid={`nav-${link.key.toLowerCase()}`}
              >
                {link.key}
              </button>
            ))}
          </nav>
        )}
        {/* The 1px Kinetic Line */}
        <div className="kinetic-line" />
      </footer>

      {/* Audio Status Indicator */}
      {isAudioReady && (
        <div className="audio-indicator">
          <span className="audio-pulse" />
          HRTF
        </div>
      )}

      <style>{`
        :root {
          --mint: #00FFC0;
          --void: #05000a;
          --purple: #A855F7;
          --gold: #FFD700;
        }

        .system-root {
          width: 100vw;
          height: 100vh;
          position: relative;
          overflow: hidden;
          background: var(--void);
        }

        .full-bleed-canvas {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        /* Top Anchor - No Buffer */
        .sanctuary-top-strip {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 40px;
          z-index: 100;
          background: linear-gradient(to bottom, rgba(0,0,0,0.15), transparent);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1rem;
          font-size: 10px;
          letter-spacing: 2px;
          color: white;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .text-red-500 { color: #ef4444; }
        .text-mint-green { color: var(--mint); }
        .font-bold { font-weight: 700; }
        .font-orbitron { font-family: 'Orbitron', 'Inter', sans-serif; }

        /* Bottom Anchor - Kinetic Snap-Back */
        .rubber-band-utility {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          z-index: 100;
          transition: height 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          background: rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .rubber-band-utility.collapsed { height: 4px; }
        .rubber-band-utility.expanded { 
          height: 90px; 
          border-top: 1px solid var(--mint);
        }

        .kinetic-line {
          width: 100%;
          height: 2px;
          background: var(--mint);
          box-shadow: 0 0 10px var(--mint);
        }

        .action-hub {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding-bottom: 10px;
        }

        .nav-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          font-size: 9px;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.3s;
          letter-spacing: 0.15em;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .nav-btn:hover {
          border-color: var(--mint);
          color: var(--mint);
          text-shadow: 0 0 5px var(--mint);
        }

        /* Anti-Drift: Main Content Area */
        .main-sanctuary-area {
          position: relative;
          z-index: 50;
          height: 100vh;
          padding: 60px 20px 100px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 40px;
          pointer-events: none;
        }

        /* Cosmos Portal */
        .cosmos-portal {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          pointer-events: auto;
        }

        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 1px solid var(--purple);
          border-radius: 50%;
          animation: pulse-expand 3s ease-out infinite;
          opacity: 0.3;
        }

        .pulse-ring.delay-1 { animation-delay: 1s; }
        .pulse-ring.delay-2 { animation-delay: 2s; }

        @keyframes pulse-expand {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        /* Quick Actions */
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          max-width: 280px;
          pointer-events: auto;
        }

        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px 16px;
          background: rgba(0,0,0,0.1);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: all 0.3s;
          color: rgba(255,255,255,0.7);
        }

        .quick-action-btn:hover {
          border-color: var(--mint);
          background: rgba(0,255,192,0.05);
        }

        .quick-icon {
          font-size: 24px;
          color: var(--mint);
        }

        .quick-label {
          font-size: 9px;
          letter-spacing: 0.15em;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* Audio Indicator */
        .audio-indicator {
          position: fixed;
          top: 50px;
          right: 16px;
          z-index: 90;
          font-size: 8px;
          color: var(--mint);
          letter-spacing: 0.2em;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .audio-pulse {
          width: 6px;
          height: 6px;
          background: var(--mint);
          border-radius: 50%;
          animation: audio-blink 1.5s ease-in-out infinite;
        }

        @keyframes audio-blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        /* Animations */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-in {
          animation: fade-in 0.3s ease-out;
        }

        .slide-in-from-bottom-4 {
          animation: slide-up 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        }

        @keyframes slide-up {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .sanctuary-top-strip {
            font-size: 8px;
            padding: 0 0.75rem;
          }
          
          .quick-actions-grid {
            gap: 12px;
            max-width: 240px;
          }
          
          .quick-action-btn {
            padding: 16px 12px;
          }
          
          .cosmos-portal {
            width: 100px;
            height: 100px;
          }
        }
      `}</style>
    </div>
  );
}
