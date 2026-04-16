/**
 * ENLIGHTEN.MINT.CAFE - WEBXR AR PORTAL
 * WebXRPortalSync.js
 * 
 * THE SPATIAL MANIFESTATION ENGINE
 * 
 * This component bridges the L² Fractal GPU Shader with the WebXR Device API,
 * enabling the Sovereign Prism to manifest in physical space through AR.
 * 
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                        WEBXR AR PORTAL                                      │
 * │                                                                             │
 * │  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
 * │  │   GPS API   │────▶│  Geospatial │────▶│   WebXR    │                   │
 * │  │  (Browser)  │     │    Nexus    │     │  Session   │                   │
 * │  └─────────────┘     └─────────────┘     └─────────────┘                   │
 * │                             │                   │                          │
 * │                             ▼                   ▼                          │
 * │                    ┌─────────────┐     ┌─────────────┐                    │
 * │                    │   Zone AR   │     │  Three.js   │                    │
 * │                    │   Config    │────▶│   Renderer  │                    │
 * │                    └─────────────┘     └─────────────┘                    │
 * │                                               │                           │
 * │                                               ▼                           │
 * │                                    ┌─────────────────────┐               │
 * │                                    │  SOVEREIGN PRISM AR │               │
 * │                                    │  (Physical Space)   │               │
 * │                                    └─────────────────────┘               │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * FEATURES:
 * - Horizontal plane detection for stable crystal placement
 * - Flower of Life reticle for surface tracking visualization
 * - 432Hz haptic pulse on crystal interaction
 * - GPS-triggered auto-activation within Wellness Zone radius
 * - Main Brain shader params integration (u_phi, u_resonance, etc.)
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, MapPin, Compass, Wifi, WifiOff, 
  Circle, Hexagon, Sparkles, Navigation, Eye, EyeOff,
  Volume2, VolumeX, Vibrate
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ═══════════════════════════════════════════════════════════════════════════════
// SACRED CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const PHI = 1.618033988749895;
const RESONANCE = (PHI ** 2) / Math.PI;

// WebXR Session Configuration
const XR_CONFIG = {
  mode: 'immersive-ar',
  requiredFeatures: ['hit-test', 'local-floor'],
  optionalFeatures: ['dom-overlay', 'light-estimation', 'plane-detection'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GLSL SHADERS FOR AR CRYSTAL
// ═══════════════════════════════════════════════════════════════════════════════
const AR_VERTEX_SHADER = `
  uniform float u_time;
  uniform float u_phi;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalMatrix * normal;
    vPosition = position;
    
    // Subtle breathing animation
    float breath = sin(u_time * u_phi) * 0.05;
    vec3 newPosition = position * (1.0 + breath);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const AR_FRAGMENT_SHADER = `
  uniform float u_time;
  uniform float u_phi;
  uniform float u_resonance;
  uniform float u_zone_frequency;
  uniform vec3 u_zone_color;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Prismatic refraction based on view angle
    float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    
    // Zone-specific color with PHI modulation
    vec3 baseColor = u_zone_color;
    baseColor += vec3(sin(u_time * u_phi) * 0.2, cos(u_time * u_resonance) * 0.2, sin(u_time) * 0.1);
    
    // Add crystalline highlight
    float highlight = pow(fresnel, 3.0) * 0.5;
    baseColor += vec3(highlight);
    
    // Edge glow
    float edge = smoothstep(0.0, 0.3, fresnel) * 0.3;
    baseColor += vec3(0.5, 0.3, 1.0) * edge;
    
    // Alpha with edge transparency
    float alpha = 0.7 + fresnel * 0.3;
    
    gl_FragColor = vec4(baseColor, alpha);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// FLOWER OF LIFE RETICLE SHADER
// ═══════════════════════════════════════════════════════════════════════════════
const RETICLE_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RETICLE_FRAGMENT_SHADER = `
  uniform float u_time;
  varying vec2 vUv;
  
  // Flower of Life pattern
  float circle(vec2 uv, vec2 center, float radius) {
    return smoothstep(radius + 0.02, radius - 0.02, length(uv - center));
  }
  
  void main() {
    vec2 uv = vUv - 0.5;
    float r = 0.15;
    
    // Center circle
    float pattern = circle(uv, vec2(0.0), r);
    
    // Six surrounding circles (Flower of Life)
    for (int i = 0; i < 6; i++) {
      float angle = float(i) * 3.14159 / 3.0;
      vec2 offset = vec2(cos(angle), sin(angle)) * r;
      pattern += circle(uv, offset, r) * 0.5;
    }
    
    // Pulsing glow
    float pulse = 0.5 + 0.5 * sin(u_time * 2.0);
    
    vec3 color = vec3(0.5, 0.3, 1.0) * pattern * pulse;
    float alpha = pattern * 0.6 * pulse;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * Zone color mapping based on type
 */
const ZONE_COLORS = {
  GATEWAY: new THREE.Color(0x60A5FA),   // Blue - Welcome
  ADVOCACY: new THREE.Color(0x22C55E),  // Green - Community
  RESONANCE: new THREE.Color(0x8B5CF6), // Purple - Deep meditation
};

/**
 * WebXR AR Portal Component
 */
export default function WebXRPortalSync({ 
  onZoneEnter,
  onARSessionStart,
  onARSessionEnd,
  autoActivate = false,
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const xrSessionRef = useRef(null);
  const reticleRef = useRef(null);
  const crystalRef = useRef(null);
  const hitTestSourceRef = useRef(null);
  
  // State
  const [xrSupported, setXrSupported] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [nearestZone, setNearestZone] = useState(null);
  const [arTrigger, setArTrigger] = useState(null);
  const [crystalPlaced, setCrystalPlaced] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Check WebXR support
  useEffect(() => {
    const checkXR = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          setXrSupported(supported);
        } catch (e) {
          console.warn('[WebXR] AR not supported:', e);
          setXrSupported(false);
        }
      }
    };
    checkXR();
  }, []);
  
  // GPS monitoring
  useEffect(() => {
    if (!autoActivate) return;
    
    let watchId = null;
    
    const startGPS = () => {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserPosition({ lat: latitude, lon: longitude });
            setGpsEnabled(true);
            
            // Check proximity to zones
            checkZoneProximity(latitude, longitude);
          },
          (error) => {
            console.warn('[GPS] Error:', error.message);
            setGpsEnabled(false);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000,
          }
        );
      }
    };
    
    startGPS();
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [autoActivate]);
  
  // Check zone proximity via API
  const checkZoneProximity = useCallback(async (lat, lon) => {
    try {
      const res = await axios.post(`${API}/wellness-zones/proximity`, { lat, lon });
      
      if (res.data.status === 'success') {
        const { nearest_zone, ar_trigger, in_resonance_field } = res.data.proximity;
        
        setNearestZone(nearest_zone);
        setArTrigger(ar_trigger);
        
        // Auto-trigger AR if in resonance field
        if (in_resonance_field && ar_trigger?.active && autoActivate) {
          if (!sessionActive) {
            toast.success(`Entering ${ar_trigger.zone}`, {
              description: 'AR Portal activating...',
            });
            onZoneEnter?.(ar_trigger);
          }
        }
      }
    } catch (err) {
      console.warn('[Proximity] Check failed:', err);
    }
  }, [autoActivate, sessionActive, onZoneEnter]);
  
  // Start AR session
  const startARSession = useCallback(async (zoneId = null) => {
    if (!xrSupported || sessionActive) return;
    
    setLoading(true);
    
    try {
      // Get AR config from backend if zone specified
      let arConfig = null;
      if (zoneId) {
        const res = await axios.get(`${API}/wellness-zones/${zoneId}/ar`);
        arConfig = res.data.ar_config;
      }
      
      // Create Three.js scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
      cameraRef.current = camera;
      
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      rendererRef.current = renderer;
      
      // Add renderer to container
      if (containerRef.current) {
        containerRef.current.appendChild(renderer.domElement);
      }
      
      // Create reticle (Flower of Life)
      const reticleGeometry = new THREE.RingGeometry(0.1, 0.15, 32).rotateX(-Math.PI / 2);
      const reticleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          u_time: { value: 0 },
        },
        vertexShader: RETICLE_VERTEX_SHADER,
        fragmentShader: RETICLE_FRAGMENT_SHADER,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
      reticle.visible = false;
      scene.add(reticle);
      reticleRef.current = reticle;
      
      // Request XR session
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'local-floor'],
        optionalFeatures: ['dom-overlay'],
      });
      
      xrSessionRef.current = session;
      renderer.xr.setReferenceSpaceType('local-floor');
      await renderer.xr.setSession(session);
      
      // Set up hit test source
      const viewerSpace = await session.requestReferenceSpace('viewer');
      hitTestSourceRef.current = await session.requestHitTestSource({ space: viewerSpace });
      
      // Session end handler
      session.addEventListener('end', () => {
        setSessionActive(false);
        setCrystalPlaced(false);
        hitTestSourceRef.current = null;
        onARSessionEnd?.();
      });
      
      // Select handler (tap to place crystal)
      session.addEventListener('select', () => {
        if (reticleRef.current?.visible && !crystalPlaced) {
          placeCrystal(arConfig);
        } else if (crystalPlaced && crystalRef.current) {
          // Tap crystal for haptic pulse
          triggerHapticPulse(arConfig?.haptic_config?.pattern || [100, 50, 100]);
        }
      });
      
      setSessionActive(true);
      onARSessionStart?.(arConfig);
      
      // Animation loop
      const animate = (timestamp, frame) => {
        if (!frame) return;
        
        // Update reticle material
        if (reticleRef.current?.material?.uniforms) {
          reticleRef.current.material.uniforms.u_time.value = timestamp * 0.001;
        }
        
        // Update crystal shader
        if (crystalRef.current?.material?.uniforms) {
          crystalRef.current.material.uniforms.u_time.value = timestamp * 0.001;
          crystalRef.current.rotation.y += 0.01 * PHI;
        }
        
        // Hit test for reticle positioning
        if (hitTestSourceRef.current && !crystalPlaced) {
          const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);
          
          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(renderer.xr.getReferenceSpace());
            
            if (pose) {
              reticle.visible = true;
              reticle.matrix.fromArray(pose.transform.matrix);
              reticle.matrix.decompose(reticle.position, reticle.quaternion, reticle.scale);
            }
          } else {
            reticle.visible = false;
          }
        }
        
        renderer.render(scene, camera);
      };
      
      renderer.setAnimationLoop(animate);
      
      toast.success('AR Portal Active', {
        description: 'Point at a flat surface and tap to place the Sovereign Prism',
      });
      
    } catch (err) {
      console.error('[WebXR] Session start failed:', err);
      toast.error('AR Failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [xrSupported, sessionActive, crystalPlaced, onARSessionStart, onARSessionEnd]);
  
  // Place crystal at reticle position
  const placeCrystal = useCallback((arConfig) => {
    if (!sceneRef.current || !reticleRef.current) return;
    
    const zoneType = arConfig?.zone?.type || 'RESONANCE';
    const zoneColor = ZONE_COLORS[zoneType] || ZONE_COLORS.RESONANCE;
    const frequency = arConfig?.audio_config?.frequency_hz || 432;
    
    // Create crystal geometry (dual-sphere)
    const geometry = new THREE.IcosahedronGeometry(0.15, 4);
    
    // Get shader params
    const shaderUniforms = arConfig?.shader_uniforms || {};
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_phi: { value: shaderUniforms.u_phi || PHI },
        u_resonance: { value: shaderUniforms.u_resonance || RESONANCE },
        u_zone_frequency: { value: frequency },
        u_zone_color: { value: zoneColor },
      },
      vertexShader: AR_VERTEX_SHADER,
      fragmentShader: AR_FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    
    const crystal = new THREE.Mesh(geometry, material);
    
    // Position at reticle
    crystal.position.copy(reticleRef.current.position);
    crystal.position.y += 0.15; // Float above surface
    
    sceneRef.current.add(crystal);
    crystalRef.current = crystal;
    
    // Hide reticle
    reticleRef.current.visible = false;
    
    setCrystalPlaced(true);
    
    // Trigger haptic on placement
    triggerHapticPulse(arConfig?.haptic_config?.pattern || [200, 100, 200]);
    
    toast.success('Sovereign Prism Manifested', {
      description: `${zoneType} Crystal placed in physical space`,
    });
    
  }, []);
  
  // Haptic feedback
  const triggerHapticPulse = useCallback((pattern) => {
    if (!hapticEnabled) return;
    
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, [hapticEnabled]);
  
  // End AR session
  const endARSession = useCallback(() => {
    if (xrSessionRef.current) {
      xrSessionRef.current.end();
    }
    
    if (rendererRef.current && containerRef.current) {
      containerRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }
    
    sceneRef.current = null;
    cameraRef.current = null;
    crystalRef.current = null;
    reticleRef.current = null;
    
    setSessionActive(false);
    setCrystalPlaced(false);
  }, []);
  
  // Manual proximity check
  const manualProximityCheck = useCallback(() => {
    if (userPosition) {
      checkZoneProximity(userPosition.lat, userPosition.lon);
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          checkZoneProximity(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => toast.error('GPS Error', { description: err.message })
      );
    }
  }, [userPosition, checkZoneProximity]);
  
  return (
    <div className="relative" data-testid="webxr-portal-sync">
      {/* AR Canvas Container */}
      <div 
        ref={containerRef} 
        className="relative w-full pointer-events-none"
        style={{ display: sessionActive ? 'block' : 'none' }}
      />
      
      {/* Control Panel */}
      <div 
        className="p-4 rounded-xl space-y-4"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.95), rgba(30, 10, 40, 0.9))',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hexagon size={18} className="text-purple-400" />
            <span className="text-sm font-medium text-white">WebXR AR Portal</span>
          </div>
          <div className="flex items-center gap-2">
            {gpsEnabled ? (
              <Wifi size={14} className="text-green-400" />
            ) : (
              <WifiOff size={14} className="text-red-400" />
            )}
            <span className="text-[9px] text-white/50">
              {xrSupported ? 'AR Ready' : 'AR Unavailable'}
            </span>
          </div>
        </div>
        
        {/* GPS Status */}
        {userPosition && (
          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-2 text-[10px]">
              <MapPin size={12} className="text-blue-400" />
              <span className="text-white/60">
                {userPosition.lat.toFixed(4)}°N, {Math.abs(userPosition.lon).toFixed(4)}°W
              </span>
            </div>
          </div>
        )}
        
        {/* Nearest Zone */}
        {nearestZone && (
          <div 
            className="p-3 rounded-lg"
            style={{ 
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-purple-300">
                {nearestZone.name}
              </span>
              <span className="text-[9px] text-white/50">
                {nearestZone.distance_m.toFixed(0)}m
              </span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-white/40">
              <Compass size={10} />
              <span>Bearing: {nearestZone.bearing}°</span>
            </div>
          </div>
        )}
        
        {/* AR Trigger Status */}
        {arTrigger?.active && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-lg"
            style={{ 
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(139, 92, 246, 0.1))',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-green-400" />
              <span className="text-xs font-medium text-green-300">
                In Resonance Field!
              </span>
            </div>
            <p className="text-[9px] text-white/50 mt-1">
              {arTrigger.zone} • {arTrigger.frequency}Hz
            </p>
          </motion.div>
        )}
        
        {/* Toggle Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHapticEnabled(!hapticEnabled)}
            className="flex-1 py-2 px-3 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all"
            style={{
              background: hapticEnabled ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${hapticEnabled ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: hapticEnabled ? '#C4B5FD' : 'rgba(255,255,255,0.4)',
            }}
          >
            <Vibrate size={12} />
            Haptic
          </button>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="flex-1 py-2 px-3 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all"
            style={{
              background: audioEnabled ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${audioEnabled ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: audioEnabled ? '#93C5FD' : 'rgba(255,255,255,0.4)',
            }}
          >
            {audioEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
            Audio
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {!sessionActive ? (
            <>
              <button
                onClick={manualProximityCheck}
                className="w-full py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#93C5FD',
                }}
                data-testid="check-proximity-btn"
              >
                <Navigation size={14} />
                Check Zone Proximity
              </button>
              
              <button
                onClick={() => startARSession(arTrigger?.zone_id || 'black_elk_sanctuary')}
                disabled={!xrSupported || loading}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: xrSupported 
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.3))'
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${xrSupported ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                  color: xrSupported ? '#C4B5FD' : 'rgba(255,255,255,0.65)',
                  boxShadow: xrSupported ? '0 0 30px rgba(139, 92, 246, 0.2)' : 'none',
                }}
                data-testid="start-ar-btn"
              >
                {loading ? (
                  <span className="animate-spin">◐</span>
                ) : (
                  <Eye size={16} />
                )}
                {loading ? 'Initializing...' : 'Launch AR Portal'}
              </button>
            </>
          ) : (
            <button
              onClick={endARSession}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#FCA5A5',
              }}
              data-testid="end-ar-btn"
            >
              <EyeOff size={16} />
              Exit AR Portal
            </button>
          )}
        </div>
        
        {/* Instructions */}
        {sessionActive && !crystalPlaced && (
          <p className="text-[9px] text-white/40 text-center">
            Point your device at a flat surface. Tap the Flower of Life reticle to place the Sovereign Prism.
          </p>
        )}
        
        {crystalPlaced && (
          <p className="text-[9px] text-green-400/60 text-center">
            Crystal manifested! Walk around to view from all angles. Tap to trigger 432Hz pulse.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Compact AR trigger button for embedding in other components
 */
export function ARPortalTrigger({ zoneId, zoneName, onActivate }) {
  const [xrSupported, setXrSupported] = useState(false);
  
  useEffect(() => {
    const checkXR = async () => {
      if ('xr' in navigator) {
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        setXrSupported(supported);
      }
    };
    checkXR();
  }, []);
  
  if (!xrSupported) return null;
  
  return (
    <button
      onClick={() => onActivate?.(zoneId)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-105"
      style={{
        background: 'rgba(139, 92, 246, 0.15)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        color: '#C4B5FD',
      }}
      data-testid={`ar-trigger-${zoneId}`}
    >
      <Hexagon size={10} />
      View in AR
    </button>
  );
}
