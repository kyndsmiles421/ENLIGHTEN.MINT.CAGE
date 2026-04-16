import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSpatialAudio, SOLFEGGIO_FREQUENCIES } from '../engines/SpatialAudioEngine';

/**
 * CelestialDome.js — Refractal VR Entry Point
 * 
 * THREE.JS INTEGRATION:
 * - Icosahedron-based geodesic dome structure
 * - Nested inner rings for depth perception
 * - Bio-sync particle atmosphere
 * - Orbital light rings
 * 
 * SPATIAL AUDIO:
 * - HRTF positional audio
 * - Solfeggio frequency field
 * - Bio-sync modulation
 * 
 * VR FEATURES:
 * - WebXR detection and session management
 * - 2D fallback for non-VR devices
 * - Mouse/touch look controls
 */

const API = process.env.REACT_APP_BACKEND_URL;

export default function CelestialDome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const frameIdRef = useRef(null);
  const audioInitializedRef = useRef(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [vrSupported, setVrSupported] = useState(false);
  const [userKarma, setUserKarma] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [is3DActive, setIs3DActive] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [error, setError] = useState('');
  
  // Spatial Audio hook
  const spatialAudio = useSpatialAudio();

  // Check for welcome redirect from payment
  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true);
      // Clear the URL param
      window.history.replaceState({}, '', '/vr/celestial-dome');
    }
  }, [searchParams]);

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

  // Initialize Three.js scene
  const init3DScene = useCallback(async () => {
    if (!containerRef.current || is3DActive) return;

    try {
      // Dynamic import Three.js and scene utilities
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      
      setIs3DActive(true);
      const container = containerRef.current;

      // Scene setup
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050510, 0.015);

      // Camera - positioned at center looking out
      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 0.1);

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x050510, 1);
      container.appendChild(renderer.domElement);

      // Controls for 2D mode
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.rotateSpeed = 0.3;
      controls.dampingFactor = 0.05;
      controls.enableDamping = true;

      // ═══ REFRACTAL DOME (Outer) ═══
      const domeRadius = 10;
      const outerGeometry = new THREE.IcosahedronGeometry(domeRadius, 2);
      const outerMaterial = new THREE.MeshBasicMaterial({
        color: 0xA855F7,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
      });
      const outerDome = new THREE.Mesh(outerGeometry, outerMaterial);

      // Edges for crystalline structure
      const edgesGeometry = new THREE.EdgesGeometry(outerGeometry);
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: 0xA855F7,
        transparent: true,
        opacity: 0.2,
      });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      outerDome.add(edges);
      scene.add(outerDome);

      // ═══ INNER RINGS ═══
      const innerRings = [];
      for (let i = 0; i < 3; i++) {
        const ratio = 0.9 - i * 0.2;
        const innerRadius = domeRadius * ratio;
        const color = new THREE.Color(0x00FFC2).lerp(new THREE.Color(0xFFD700), i / 2);
        
        const innerGeometry = new THREE.IcosahedronGeometry(innerRadius, Math.max(1, 2 - i));
        const innerMaterial = new THREE.MeshBasicMaterial({
          color: color,
          wireframe: true,
          transparent: true,
          opacity: 0.08 + i * 0.02,
          blending: THREE.AdditiveBlending,
        });
        const innerDome = new THREE.Mesh(innerGeometry, innerMaterial);
        innerDome.rotation.x = (Math.PI / 6) * (i + 1);
        innerDome.rotation.y = (Math.PI / 4) * (i + 1);
        scene.add(innerDome);
        innerRings.push(innerDome);
      }

      // ═══ PARTICLE ATMOSPHERE ═══
      const particleCount = 2000;
      const particlesGeometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];
      const colorPalette = [
        new THREE.Color(0x00FFC2),
        new THREE.Color(0xA855F7),
        new THREE.Color(0xFFD700),
      ];

      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.pow(Math.random(), 0.5) * domeRadius * 0.95;

        positions.push(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors.push(color.r, color.g, color.b);
      }

      particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      particlesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      // ═══ ORBITAL LIGHT RINGS ═══
      const lightRings = [];
      for (let i = 0; i < 3; i++) {
        const ringGeometry = new THREE.TorusGeometry(domeRadius * (0.5 + i * 0.2), 0.02, 8, 100);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: i === 0 ? 0x00FFC2 : 0xA855F7,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = (Math.PI / 3) * i;
        ring.rotation.z = (Math.PI / 6) * i;
        scene.add(ring);
        lightRings.push({ mesh: ring, material: ringMaterial });
      }

      // ═══ AMBIENT LIGHT ═══
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
      scene.add(ambientLight);

      // Store scene reference
      sceneRef.current = {
        scene,
        camera,
        renderer,
        controls,
        outerDome,
        outerMaterial,
        edgesMaterial,
        innerRings,
        particles,
        lightRings,
      };

      // ═══ ANIMATION LOOP ═══
      const animate = () => {
        const time = Date.now();
        const breath = (Math.sin(time / 875) + 1) / 2;
        const breathScale = 0.8 + breath * 0.4;

        // Rotate outer dome
        outerDome.rotation.y += 0.0005 * breathScale;
        outerDome.rotation.x += 0.00015 * breathScale;

        // Counter-rotate inner rings
        innerRings.forEach((ring, i) => {
          ring.rotation.y -= 0.0005 * (0.5 + i * 0.3);
          ring.rotation.z += 0.0002;
        });

        // Animate light rings
        lightRings.forEach((ring, i) => {
          ring.mesh.rotation.z += 0.002 * (i + 1);
          ring.material.opacity = 0.2 + breath * 0.15;
        });

        // Pulse dome opacity
        outerMaterial.opacity = 0.05 + breath * 0.1;
        edgesMaterial.opacity = 0.15 + breath * 0.15;

        // Update spatial audio listener position
        if (audioInitializedRef.current) {
          spatialAudio.updateListener(camera);
          spatialAudio.applyBioSync(breath);
        }

        // Update controls
        controls.update();

        renderer.render(scene, camera);
        frameIdRef.current = requestAnimationFrame(animate);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      // Cleanup function stored for later
      sceneRef.current.cleanup = () => {
        cancelAnimationFrame(frameIdRef.current);
        window.removeEventListener('resize', handleResize);
        controls.dispose();
        renderer.dispose();
        spatialAudio.stopAll();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };

    } catch (err) {
      console.error('Failed to initialize 3D scene:', err);
      setError('Failed to load 3D experience. Showing 2D fallback.');
      setIs3DActive(false);
    }
  }, [is3DActive, spatialAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sceneRef.current?.cleanup) {
        sceneRef.current.cleanup();
      }
    };
  }, []);

  // Enter VR mode
  const enterVR = async () => {
    if (!vrSupported) {
      setError('VR not supported on this device.');
      return;
    }

    try {
      const session = await navigator.xr.requestSession('immersive-vr');
      console.log('VR session started:', session);
      // Future: Connect session to Three.js XR renderer
    } catch (e) {
      console.error('Failed to enter VR:', e);
      setError('Failed to start VR session.');
    }
  };

  // Initialize spatial audio (requires user gesture)
  const initSpatialAudio = useCallback(async () => {
    if (audioInitializedRef.current) return;
    
    try {
      const success = await spatialAudio.initAudio();
      if (success) {
        audioInitializedRef.current = true;
        setAudioEnabled(true);
        
        // Create Solfeggio frequency field around the dome
        spatialAudio.createSolfeggioField(10);
        
        // Start all Solfeggio tones
        Object.keys(SOLFEGGIO_FREQUENCIES).forEach((name) => {
          spatialAudio.play(`solfeggio-${name}`);
        });
        
        console.log('[CelestialDome] Spatial audio initialized');
        triggerHaptic([30, 20, 50]);
      }
    } catch (err) {
      console.error('Failed to initialize audio:', err);
    }
  }, [spatialAudio]);

  // Toggle spatial audio
  const toggleAudio = useCallback(() => {
    if (!audioInitializedRef.current) {
      initSpatialAudio();
    } else {
      const muted = spatialAudio.toggleMute();
      setAudioEnabled(!muted);
      triggerHaptic([15]);
    }
  }, [spatialAudio, initSpatialAudio]);

  // Haptic feedback
  const triggerHaptic = (pattern) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioInitializedRef.current) {
        spatialAudio.dispose();
      }
    };
  }, [spatialAudio]);

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
    <div className="celestial-dome-page" data-testid="celestial-dome">
      <style>{`
        .celestial-dome-page {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(180deg, #050510 0%, #0a0a1a 50%, #0f0f2a 100%);
          color: white;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        
        .three-container {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        
        .dome-overlay {
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding: 40px;
        }
        
        .dome-hud {
          pointer-events: auto;
          text-align: center;
          padding: 30px 50px;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: 20px;
          max-width: 500px;
        }
        
        .dome-title {
          font-size: 1.5rem;
          font-weight: 100;
          letter-spacing: 0.3em;
          background: linear-gradient(135deg, #A855F7, #00FFC2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }
        
        .dome-subtitle {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.1em;
          margin-bottom: 25px;
        }
        
        .vr-badge {
          display: inline-block;
          padding: 6px 16px;
          border: 1px solid;
          border-radius: 15px;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          margin-bottom: 20px;
        }
        .vr-badge.ready { border-color: #00FFC2; color: #00FFC2; }
        .vr-badge.fallback { border-color: #FFD700; color: #FFD700; }
        
        .dome-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .dome-btn {
          padding: 12px 24px;
          border: 1px solid;
          background: transparent;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          transition: all 0.3s;
          border-radius: 6px;
        }
        .dome-btn.primary { border-color: #A855F7; color: #A855F7; }
        .dome-btn.primary:hover { background: #A855F7; color: #000; }
        .dome-btn.secondary { border-color: rgba(255,255,255,0.6); color: rgba(255,255,255,0.6); }
        .dome-btn.secondary:hover { border-color: rgba(255,255,255,0.4); color: white; }
        
        .karma-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 12px 20px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 10px;
          text-align: center;
          z-index: 20;
        }
        .karma-value { font-size: 1.5rem; font-weight: 700; color: #FFD700; }
        .karma-label { font-size: 0.6rem; color: rgba(255,255,255,0.4); letter-spacing: 0.15em; }
        
        .back-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 20;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          padding: 10px 20px;
          cursor: pointer;
          border-radius: 6px;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          transition: all 0.3s;
        }
        .back-btn:hover { border-color: rgba(255,255,255,0.65); color: white; }
        
        .error-toast {
          position: absolute;
          bottom: 150px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 68, 68, 0.2);
          border: 1px solid rgba(255, 68, 68, 0.5);
          color: #ff6b6b;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 0.8rem;
          z-index: 30;
        }
        
        /* Welcome Modal */
        .welcome-modal {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(5, 5, 15, 0.95);
          backdrop-filter: blur(20px);
        }
        .welcome-card {
          text-align: center;
          padding: 50px;
          border: 1px solid #FFD700;
          border-radius: 20px;
          background: rgba(0, 0, 0, 0.5);
          box-shadow: 0 0 60px rgba(255, 215, 0, 0.2);
          max-width: 450px;
        }
        .welcome-title {
          font-size: 1.8rem;
          color: #FFD700;
          letter-spacing: 0.2em;
          margin-bottom: 15px;
        }
        .welcome-text {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .welcome-btn {
          padding: 14px 40px;
          background: linear-gradient(135deg, #A855F7, #00FFC2);
          border: none;
          color: #000;
          font-weight: 700;
          letter-spacing: 0.1em;
          cursor: pointer;
          border-radius: 8px;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .welcome-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.5);
        }
        
        /* Controls hint */
        .controls-hint {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 0.1em;
          z-index: 15;
        }
      `}</style>

      {/* Three.js Container */}
      <div ref={containerRef} className="three-container" />

      {/* Karma Badge */}
      <div className="karma-badge">
        <div className="karma-value">{userKarma}</div>
        <div className="karma-label">KARMA</div>
      </div>

      {/* Back Button */}
      <button 
        className="back-btn"
        onClick={() => {
          triggerHaptic([15, 10, 30]);
          navigate('/ether-hub');
        }}
      >
        ← RETURN TO HUB
      </button>

      {/* HUD Overlay */}
      <div className="dome-overlay">
        <div className="dome-hud">
          <h1 className="dome-title">CELESTIAL DOME</h1>
          <p className="dome-subtitle">SOVEREIGN VR SANCTUARY</p>
          
          <div className={`vr-badge ${vrSupported ? 'ready' : 'fallback'}`}>
            {vrSupported ? 'VR READY' : 'DRAG TO LOOK AROUND'}
          </div>
          
          <div className="dome-actions">
            {!is3DActive ? (
              <button 
                className="dome-btn primary"
                onClick={() => {
                  triggerHaptic([30, 20, 50]);
                  init3DScene();
                }}
                data-testid="activate-3d-btn"
              >
                ACTIVATE REFRACTAL VIEW
              </button>
            ) : vrSupported ? (
              <button 
                className="dome-btn primary"
                onClick={() => {
                  triggerHaptic([50, 30, 100]);
                  enterVR();
                }}
                data-testid="enter-vr-btn"
              >
                ENTER IMMERSIVE VR
              </button>
            ) : null}
            
            <button 
              className="dome-btn secondary"
              onClick={() => {
                triggerHaptic([15, 10, 30]);
                navigate('/membership');
              }}
            >
              UPGRADE RESONANCE
            </button>
          </div>
        </div>
      </div>

      {/* Controls Hint */}
      {is3DActive && (
        <div className="controls-hint">
          CLICK & DRAG TO EXPLORE • SCROLL DISABLED FOR IMMERSION
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="error-toast">{error}</div>
      )}

      {/* Welcome Modal (after payment) */}
      {showWelcome && (
        <div className="welcome-modal">
          <div className="welcome-card">
            <div className="welcome-title">WELCOME, SOVEREIGN</div>
            <p className="welcome-text">
              Your membership has been activated. You now have access to the 
              Celestial Dome and all the mystical tools within. May your journey 
              be filled with infinite resonance.
            </p>
            <button 
              className="welcome-btn"
              onClick={() => {
                triggerHaptic([100, 50, 100, 50, 200]);
                setShowWelcome(false);
                init3DScene();
              }}
            >
              ENTER THE DOME
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
