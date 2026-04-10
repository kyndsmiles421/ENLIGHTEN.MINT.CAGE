import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ALL_SATELLITES, ZONE_AUDIO } from '../components/orbital/constants';
import { CosmicDust } from '../components/orbital/CosmicDust';
import { useHubAudio } from '../hooks/useHubAudio';
import { useSensoryResonance } from '../hooks/useSensoryResonance';
import { useDepth, Z_LAYERS } from '../hooks/useDepth';
import MissionControl from '../components/MissionControl';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * V25.0 — SOVEREIGN MACHINE: ONE SCRIPT / ONE PLANE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * ARCHITECT: Steven Michael | TERMINAL: kyndsmiles@gmail.com
 * 
 * SOLUTION: Separate the VIEW from the CONTROLLER
 * - VISUAL LAYER: 3D transforms, animations, effects (pointer-events: none)
 * - TOUCH PLANE: Flat hitboxes at Z=0, zIndex=10000 (pointer-events: auto)
 * 
 * The visual positions are calculated via physics. The hitboxes mirror those
 * positions but exist in a flat overlay that doesn't block or swallow events.
 * 
 * PHYSICS:
 * - Core: Scale 1.0
 * - Latent: (0,0,0), Scale 0, Opacity 0
 * - Bloom: 2.5x radius, Scale 0.3
 * - Extracted: 3.0x radius, Scale 1.0
 * - PHI Snap-Back Tension: 0.618
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══ V43.0 MASTER SOVEREIGN SOLDER — KINETIC INVERSION ENGINE ═══
const PHI = 1.61803398875;  // Golden Ratio / Toroidal Constant
const SOVEREIGN_RESONANCE = 7.3;  // Earth Grounding frequency
const RESONANCE_FORCE = Math.sqrt(SOVEREIGN_RESONANCE) * Math.PI; // 8.4881

// Solfeggio Frequencies for 9x9 Lattice Mapping
const SOLFEGGIO = [174, 285, 396, 417, 528, 639, 741, 852, 963];

const CORE_SCALE = 1.0;
const SUB_ORB_LATENT_SCALE = 0;
const SUB_ORB_BLOOM_SCALE = 0.3;
const SUB_ORB_EXTRACTED_SCALE = 1.0;

const BLOOM_RADIUS_MULTIPLIER = 2.5;
const EXTRACTION_THRESHOLD = 3.0;
const LERP_SPEED = 0.12;

// V43.0: HEAVY PHI TENSION (0.85 for mechanical weight)
const PHI_SNAP_TENSION = 0.85;

// V43.0: KINETIC INVERSION SCALES (z^xr2 formula)
const HEAVY_SCALE = 0.85 * (1 / PHI);  // 0.525 compression on press
const LIGHT_SCALE = 1.15 * (PHI / 2);  // 0.93 expansion on release (subtle)
const BOUNCE_SCALE = 1.08;              // Overshoot before settling

// V43.0: TOUCH PLANE — ONE LINE, NO GHOSTS
const TOUCH_PLANE_Z = 0;
const TOUCH_PLANE_Z_INDEX = 50000;
const STOP_BTN_Z_INDEX = 99999;
const VISUAL_LAYER_Z_INDEX = 5;

// V43.0: HAPTIC PATTERNS
const HAPTIC_HEAVY_SNAP = [80, 50, 120];  // Deep mechanical latch
const HAPTIC_LIGHT_RELEASE = [40];         // Light recoil

// Linear interpolation with Toroidal dampening
function lerp(a, b, t) {
  const dampened_t = Math.min(Math.max(t, 0), 1) * (RESONANCE_FORCE / 10);
  return a + (b - a) * Math.min(dampened_t, 1);
}

// Distance helper
function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// V43.0: WHITE LIGHT REFRACTION PULSE
function triggerWhiteLightPulse(element, intensity) {
  if (!element) return;
  element.style.filter = `drop-shadow(0 0 ${intensity}px #fff) brightness(1.5)`;
  element.style.boxShadow = `0 0 ${intensity * 2}px rgba(255,255,255,0.8)`;
}

function clearWhiteLightPulse(element) {
  if (!element) return;
  element.style.filter = 'none';
  element.style.boxShadow = 'none';
}

// ═══ GHOST KILLER — Purge legacy elements ═══
function purgeGhostElements() {
  const legacyStop = document.getElementById('sovereign-emergency-reset');
  if (legacyStop) {
    legacyStop.remove();
    console.log('[V43.0] GHOST PURGED: sovereign-emergency-reset');
  }
  
  document.querySelectorAll('.VOID, .ghost-layer, .legacy-header').forEach(el => el.remove());
}

export default function OrbitalHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const audio = useHubAudio();
  const { orbitalResonance, haptic } = useSensoryResonance();
  const depth = useDepth({ enableGyro: false, focalPlaneZ: 0 });

  // ═══ STATE ═══
  const [hubState, setHubState] = useState('latent'); // 'latent' | 'bloom' | 'extracted'
  const [extractedId, setExtractedId] = useState(null);
  const [dragTarget, setDragTarget] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [missionControlOpen, setMissionControlOpen] = useState(false);
  const [hoveredSat, setHoveredSat] = useState(null);
  
  // Responsive sizing
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Core radius (R) - the fundamental unit
  const isMobile = dims.w < 640;
  const R = Math.min(dims.w * 0.18, dims.h * 0.22, 140);
  const coreDiameter = R * 2;
  
  // Derived radii
  const bloomRadius = R * BLOOM_RADIUS_MULTIPLIER;
  const extractionRadius = R * EXTRACTION_THRESHOLD;
  
  // Container size to hold everything
  const containerSize = extractionRadius * 2 + R + 40;
  const center = containerSize / 2;

  // Sub-orb visual size at different states
  const subOrbSizeBloom = Math.max(48, R * 0.55);  // Larger bloom size for visibility
  const subOrbSizeExtracted = Math.max(72, R * 0.85);  // Even larger when extracted

  // Animation frame ref for continuous lerping
  const animRef = useRef(null);
  const subOrbPositions = useRef({});
  const subOrbScales = useRef({});
  const subOrbOpacities = useRef({});
  const subOrbZPositions = useRef({}); // Z-axis depth
  const orbitalAngle = useRef(0);

  // Initialize sub-orb states at (0,0,0) with scale 0
  useEffect(() => {
    ALL_SATELLITES.forEach(sat => {
      if (!subOrbPositions.current[sat.id]) {
        subOrbPositions.current[sat.id] = { x: 0, y: 0 };
        subOrbScales.current[sat.id] = SUB_ORB_LATENT_SCALE;
        subOrbOpacities.current[sat.id] = 0;
        subOrbZPositions.current[sat.id] = 0; // Start at focal plane
      }
    });
    
    // V30.0: PURGE GHOST ELEMENTS on mount
    purgeGhostElements();
    console.log(`[V30.0] Toroidal Engine initialized. Resonance: √${SOVEREIGN_RESONANCE} * π = ${RESONANCE_FORCE.toFixed(4)}`);
    
    // Re-purge after short delay (for late-injecting scripts)
    const ghostKillTimer = setTimeout(purgeGhostElements, 1000);
    return () => clearTimeout(ghostKillTimer);
  }, []);

  // ═══ ANIMATION LOOP ═══
  useEffect(() => {
    let lastTime = performance.now();
    
    const tick = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      
      // Slow orbital rotation
      orbitalAngle.current += dt * 0.08;

      ALL_SATELLITES.forEach((sat, idx) => {
        const total = ALL_SATELLITES.length;
        
        // Calculate target position based on state
        let targetX = 0;
        let targetY = 0;
        let targetZ = 0; // Z-depth target
        let targetScale = SUB_ORB_LATENT_SCALE;
        let targetOpacity = 0;

        if (hubState === 'latent') {
          // All orbs at (0,0,0) with scale 0, opacity 0
          targetX = 0;
          targetY = 0;
          targetZ = 0;
          targetScale = SUB_ORB_LATENT_SCALE;
          targetOpacity = 0;
        } else if (hubState === 'bloom') {
          // Bloom: orbs at 2.5x radius with scale 0.3, Z = -100 (behind hub)
          const angle = (idx / total) * Math.PI * 2 + orbitalAngle.current - Math.PI / 2;
          targetX = Math.cos(angle) * bloomRadius;
          targetY = Math.sin(angle) * bloomRadius;
          targetZ = Z_LAYERS.MID_BACK; // -100px depth
          targetScale = SUB_ORB_BLOOM_SCALE;
          targetOpacity = 1;
        } else if (hubState === 'extracted') {
          if (sat.id === extractedId) {
            // Extracted orb: in front at Z = +50, scale 1.0
            const angle = (idx / total) * Math.PI * 2 + orbitalAngle.current - Math.PI / 2;
            targetX = Math.cos(angle) * extractionRadius;
            targetY = Math.sin(angle) * extractionRadius;
            targetZ = Z_LAYERS.MID_FRONT; // +50px (in front)
            targetScale = SUB_ORB_EXTRACTED_SCALE;
            targetOpacity = 1;
          } else {
            // All other orbs: lerp back to (0,0,0) with scale 0
            targetX = 0;
            targetY = 0;
            targetZ = 0;
            targetScale = SUB_ORB_LATENT_SCALE;
            targetOpacity = 0;
          }
        }

        // Apply dragging offset if this orb is being dragged
        if (dragTarget === sat.id) {
          targetX = dragOffset.x;
          targetY = dragOffset.y;
          targetZ = Z_LAYERS.MID_FRONT; // Bring to front while dragging
          targetScale = Math.max(SUB_ORB_BLOOM_SCALE, targetScale);
          targetOpacity = 1;
        }

        // Lerp towards target
        subOrbPositions.current[sat.id] = {
          x: lerp(subOrbPositions.current[sat.id]?.x || 0, targetX, LERP_SPEED),
          y: lerp(subOrbPositions.current[sat.id]?.y || 0, targetY, LERP_SPEED),
        };
        subOrbZPositions.current[sat.id] = lerp(
          subOrbZPositions.current[sat.id] || 0,
          targetZ,
          LERP_SPEED
        );
        subOrbScales.current[sat.id] = lerp(
          subOrbScales.current[sat.id] || 0,
          targetScale,
          LERP_SPEED
        );
        subOrbOpacities.current[sat.id] = lerp(
          subOrbOpacities.current[sat.id] || 0,
          targetOpacity,
          LERP_SPEED
        );
      });

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [hubState, extractedId, dragTarget, dragOffset, bloomRadius, extractionRadius]);

  // Force re-render for animation
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 16);
    return () => clearInterval(interval);
  }, []);

  // ═══ CORE INTERACTION: Tap/Hold to Bloom ═══
  const handleCoreClick = useCallback(() => {
    console.log(`[HUB] Core clicked, state: ${hubState}`);
    
    if (hubState === 'latent') {
      // Trigger Bloom with full sensory feedback
      setHubState('bloom');
      orbitalResonance.bloom(); // Haptic + Audio + Visual bloom
      try { audio.playSatellite('bloom'); } catch {}
    } else if (hubState === 'bloom') {
      // Collapse back to latent
      setHubState('latent');
      setExtractedId(null);
      orbitalResonance.collapse();
      try { audio.collapseSound(); } catch {}
    } else if (hubState === 'extracted') {
      // Tap core when extracted = navigate to extracted module
      if (extractedId) {
        const sat = ALL_SATELLITES.find(s => s.id === extractedId);
        if (sat) {
          console.log(`[HUB] Core tap in extracted state - navigating to: ${sat.path}`);
          navigate(sat.path);
          return;
        }
      }
      // Fallback: Open Mission Control
      haptic('orbTap');
      setMissionControlOpen(true);
    }
  }, [hubState, extractedId, audio, orbitalResonance, haptic, navigate]);

  // ═══ SUB-ORB CLICK (simple tap to extract in bloom state) ═══
  const handleSubOrbClick = useCallback((e, sat) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log(`[HUB] Orb clicked: ${sat.id}, state: ${hubState}, extractedId: ${extractedId}`);
    
    // DIRECT NAVIGATION - PHI-locked response
    if (hubState === 'bloom' || hubState === 'extracted') {
      // Any click in bloom/extracted state navigates directly
      console.log(`[HUB] PHI-Lock: Navigating to ${sat.path}`);
      try { orbitalResonance.navigate(e.currentTarget); } catch {}
      try { audio.stopSatellite(); } catch {}
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]); // Haptic snap
      navigate(sat.path);
    }
  }, [hubState, extractedId, audio, navigate, orbitalResonance]);

  // Tap/drag differentiation: track pointer down time
  const pointerDownTimeRef = useRef(0);
  const TAP_THRESHOLD_MS = 300; // Under 300ms = tap (increased from 200ms for reliability)
  
  // ═══ SUB-ORB POINTER DOWN ═══
  const handleSubOrbPointerDown = useCallback((e, satId) => {
    // Don't start drag if in extracted state - let click handler take over
    if (hubState === 'extracted') return;
    
    e.stopPropagation();
    
    if (hubState !== 'bloom') return;
    
    // Record pointer down time for tap detection
    pointerDownTimeRef.current = Date.now();
    
    const rect = e.currentTarget.closest('[data-container]')?.getBoundingClientRect();
    if (!rect) return;
    
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    
    setDragTarget(satId);
    setDragOffset({
      x: (clientX - rect.left - center),
      y: (clientY - rect.top - center),
    });
    
    haptic('orbTap'); // Subtle haptic for drag initiation
  }, [hubState, center, haptic]);

  // ═══ SUB-ORB DRAG MOVE ═══
  useEffect(() => {
    if (!dragTarget) return;

    const handleMove = (e) => {
      const container = document.querySelector('[data-container]');
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      
      if (clientX == null || clientY == null) return;
      
      setDragOffset({
        x: clientX - rect.left - center,
        y: clientY - rect.top - center,
      });
    };

    const handleUp = () => {
      if (!dragTarget) return;
      
      const currentTargetId = dragTarget;
      const pointerDownDuration = Date.now() - pointerDownTimeRef.current;
      
      // Quick tap detection (under 300ms = tap to extract)
      const isTap = pointerDownDuration < TAP_THRESHOLD_MS;
      
      // Get current distance from center
      const currentPos = subOrbPositions.current[currentTargetId];
      const distFromCenter = dist(0, 0, currentPos?.x || 0, currentPos?.y || 0);
      
      if (isTap || distFromCenter > extractionRadius * 0.8) {
        // EXTRACTION: Either quick tap OR drag past threshold
        setHubState('extracted');
        setExtractedId(currentTargetId);
        try { orbitalResonance.extract(); } catch {}
        try { audio.playSatellite(currentTargetId); } catch {}
      }
      
      setDragTarget(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [dragTarget, center, extractionRadius, audio, orbitalResonance]);

  // ═══ EXTRACTED ORB CLICK → NAVIGATE ═══
  const handleExtractedClick = useCallback((sat) => {
    if (hubState !== 'extracted' || sat.id !== extractedId) return;
    
    orbitalResonance.navigate();
    try { audio.stopSatellite(); } catch {}
    setTimeout(() => navigate(sat.path), 150);
  }, [hubState, extractedId, navigate, audio, orbitalResonance]);

  // ═══ COLLAPSE BACK (X button on extracted orb) ═══
  const handleCollapse = useCallback((e) => {
    e.stopPropagation();
    setHubState('bloom');
    setExtractedId(null);
    orbitalResonance.collapse();
    try { audio.collapseSound(); } catch {}
  }, [audio, orbitalResonance]);

  // ═══ EMERGENCY STOP HANDLER ═══
  const handleEmergencyStop = useCallback(() => {
    console.log('[V25.0] EMERGENCY STOP ACTIVATED');
    
    // Stop all audio
    try { audio.stopAll?.(); } catch {}
    try { audio.stopSatellite?.(); } catch {}
    try { audio.collapseSound?.(); } catch {}
    
    // Stop all HTML audio elements
    document.querySelectorAll('audio').forEach(a => {
      a.pause();
      a.currentTime = 0;
    });
    
    // Stop Web Audio contexts
    if (window.AudioContext || window.webkitAudioContext) {
      try {
        const contexts = window.__audioContexts || [];
        contexts.forEach(ctx => ctx.close());
      } catch {}
    }
    
    // Reset hub state
    setHubState('latent');
    setExtractedId(null);
    setDragTarget(null);
    setMissionControlOpen(false);
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    
    console.log('[V25.0] All systems halted');
  }, [audio]);

  // Get current hovered satellite data
  const hoveredData = ALL_SATELLITES.find(s => s.id === hoveredSat);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#06060e', position: 'relative' }}
      data-testid="orbital-hub-page"
    >
      <CosmicDust />

      {/* V31 STOP — Same plane as nodules, bottom corner, no interference */}
      <button
        onClick={handleEmergencyStop}
        data-testid="emergency-stop-btn-v31"
        aria-label="Stop"
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '36px',
          height: '36px',
          zIndex: 50000,
          background: 'rgba(60, 60, 60, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '8px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}
      >
        ■
      </button>

      {/* Title — V30.0: Shifted to avoid ghost overlap */}
      <motion.div 
        className="absolute top-4 sm:top-6 left-16 right-0 text-center z-10 pointer-events-none"
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }}
      >
        <h1 
          className="text-sm sm:text-lg font-light tracking-[0.25em] uppercase"
          style={{ color: 'rgba(248,250,252,0.2)', fontFamily: 'Cormorant Garamond, serif' }}
        >
          The Enlightenment Cafe
        </h1>
      </motion.div>

      {/* State indicator */}
      <motion.div 
        className="absolute top-16 left-0 right-0 text-center z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span 
          className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ 
            background: hubState === 'extracted' ? 'rgba(167,139,250,0.15)' : 'rgba(248,250,252,0.05)',
            color: hubState === 'extracted' ? '#A78BFA' : 'rgba(248,250,252,0.25)',
            border: `1px solid ${hubState === 'extracted' ? 'rgba(167,139,250,0.2)' : 'rgba(248,250,252,0.05)'}`,
          }}
        >
          {hubState === 'latent' && 'Tap Core to Bloom'}
          {hubState === 'bloom' && 'Drag to Extract'}
          {hubState === 'extracted' && 'Tap to Enter'}
        </span>
      </motion.div>

      {/* ═══ V25.0 ORBITAL SYSTEM — SEPARATED VIEW/CONTROLLER ═══ */}
      <div 
        className="relative" 
        style={{
          width: containerSize, 
          height: containerSize, 
          zIndex: 2,
          maxWidth: '100vw', 
          maxHeight: 'calc(100vh - 100px)',
        }}
        data-container
      >
        {/* ═══ LAYER 1: VISUAL ONLY (pointer-events: none) ═══ */}
        <div 
          className="absolute inset-0" 
          style={{ 
            pointerEvents: 'none',
            zIndex: VISUAL_LAYER_Z_INDEX,
          }}
        >
          {/* Orbital ring guides */}
          {hubState !== 'latent' && (
            <>
              <div 
                className="absolute rounded-full"
                style={{
                  left: center - bloomRadius,
                  top: center - bloomRadius,
                  width: bloomRadius * 2,
                  height: bloomRadius * 2,
                  border: '1px dashed rgba(167,139,250,0.08)',
                }}
              />
              <div 
                className="absolute rounded-full"
                style={{
                  left: center - extractionRadius,
                  top: center - extractionRadius,
                  width: extractionRadius * 2,
                  height: extractionRadius * 2,
                  border: '1px solid rgba(248,250,252,0.03)',
                }}
              />
            </>
          )}

          {/* Connection lines from center to sub-orbs */}
          <svg 
            className="absolute inset-0" 
            width={containerSize} 
            height={containerSize}
          >
            {ALL_SATELLITES.map((sat) => {
              const pos = subOrbPositions.current[sat.id] || { x: 0, y: 0 };
              const opacity = subOrbOpacities.current[sat.id] || 0;
              if (opacity < 0.1) return null;
              
              return (
                <line
                  key={sat.id}
                  x1={center}
                  y1={center}
                  x2={center + pos.x}
                  y2={center + pos.y}
                  stroke={sat.color}
                  strokeWidth={hoveredSat === sat.id ? 1.5 : 0.5}
                  strokeOpacity={opacity * (hoveredSat === sat.id ? 0.3 : 0.1)}
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {/* ═══ VISUAL SUB-ORBS (NO POINTER EVENTS) ═══ */}
          {ALL_SATELLITES.map((sat, idx) => {
            const Icon = sat.icon;
            const pos = subOrbPositions.current[sat.id] || { x: 0, y: 0 };
            const rawScale = subOrbScales.current[sat.id] || 0;
            const rawOpacity = subOrbOpacities.current[sat.id] || 0;
            
            const resonanceFloor = 0.1;
            const scale = Math.max(rawScale, resonanceFloor);
            const opacity = Math.max(rawOpacity, resonanceFloor);
            
            const isExtracted = hubState === 'extracted' && sat.id === extractedId;
            const isHovered = hoveredSat === sat.id;
            const size = isExtracted ? subOrbSizeExtracted : subOrbSizeBloom;
            
            return (
              <div
                key={`visual-${sat.id}`}
                className="absolute"
                style={{
                  left: center + pos.x - size / 2,
                  top: center + pos.y - size / 2,
                  width: size,
                  height: size,
                  opacity: opacity,
                  willChange: 'left, top, opacity, transform',
                  transform: `scale(${scale / (isExtracted ? SUB_ORB_EXTRACTED_SCALE : SUB_ORB_BLOOM_SCALE)})`,
                }}
              >
                <div
                  className="w-full h-full rounded-full flex flex-col items-center justify-center relative"
                  style={{
                    background: isHovered || isExtracted 
                      ? `${sat.color}1A` 
                      : 'rgba(10,10,18,0.6)',
                    border: `1.5px solid ${isHovered || isExtracted ? sat.color + '55' : sat.color + '20'}`,
                    boxShadow: isExtracted
                      ? `0 0 ${R * 0.2}px ${sat.color}40, inset 0 0 ${R * 0.1}px ${sat.color}15`
                      : isHovered
                      ? `0 0 ${R * 0.15}px ${sat.color}30`
                      : 'none',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Icon 
                    size={size * 0.3} 
                    style={{ color: sat.color }} 
                  />
                  <p 
                    className="text-center mt-0.5 font-medium leading-tight px-1"
                    style={{
                      fontSize: Math.max(6, size * 0.1),
                      color: isHovered || isExtracted ? sat.color : 'rgba(248,250,252,0.45)',
                    }}
                  >
                    {sat.label}
                  </p>
                </div>

                {/* Visual-only extracted orb decorations */}
                {isExtracted && (
                  <motion.p
                    className="absolute -bottom-5 left-0 right-0 text-center"
                    style={{
                      fontSize: 9,
                      color: sat.color,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textShadow: `0 0 8px ${sat.color}50`,
                    }}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: [0.6, 1, 0.6], y: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    TAP TO ENTER
                  </motion.p>
                )}
              </div>
            );
          })}

          {/* ═══ VISUAL CORE ORB (NO POINTER EVENTS) ═══ */}
          <div
            className="absolute"
            style={{
              left: center - R,
              top: center - R,
              width: coreDiameter,
              height: coreDiameter,
            }}
          >
            <motion.div
              className="w-full h-full rounded-full relative overflow-hidden"
              style={{
                background: `radial-gradient(circle at 38% 32%, rgba(167,139,250,0.22), rgba(167,139,250,0.06) 55%, rgba(10,10,18,0.95) 85%)`,
                border: '1.5px solid rgba(167,139,250,0.15)',
              }}
              animate={{
                boxShadow: hubState === 'latent'
                  ? [
                      `0 0 ${R * 0.3}px rgba(167,139,250,0.1)`,
                      `0 0 ${R * 0.5}px rgba(167,139,250,0.2)`,
                      `0 0 ${R * 0.3}px rgba(167,139,250,0.1)`,
                    ]
                  : `0 0 ${R * 0.6}px rgba(167,139,250,0.25)`,
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div 
                className="absolute rounded-full"
                style={{ inset: R * 0.06, border: '1px solid rgba(167,139,250,0.1)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div 
                className="absolute rounded-full"
                style={{ inset: R * 0.12, border: '1px dashed rgba(167,139,250,0.05)' }}
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              />

              <div
                className="absolute flex flex-col items-center justify-center"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: R * 0.6,
                  height: R * 0.6,
                }}
              >
                <p 
                  className="font-medium tracking-[0.1em] uppercase text-center"
                  style={{ 
                    fontSize: Math.max(7, R * 0.08), 
                    color: 'rgba(167,139,250,0.5)',
                    lineHeight: 1.2,
                  }}
                >
                  {hubState === 'latent' && 'Tap'}
                  {hubState === 'bloom' && ALL_SATELLITES.length}
                  {hubState === 'extracted' && 'Menu'}
                </p>
              </div>
            </motion.div>

            <p 
              className="text-center font-medium tracking-[0.12em] uppercase mt-2"
              style={{ 
                fontSize: Math.max(7, R * 0.06), 
                color: 'rgba(167,139,250,0.3)' 
              }}
            >
              Mission Control
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ═══ V31.0 TOUCH PLANE — FLAT, NO TRANSFORM, HIGH Z-INDEX ═══ */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div 
          style={{ 
            position: 'absolute',
            inset: 0,
            zIndex: 20000,
            transform: 'none',
            pointerEvents: 'none',
          }}
        >
          {/* ═══ V43.1 TOUCH HITBOXES — ZERO-LAG OCULAR SYNC ═══ */}
          {ALL_SATELLITES.map((sat, idx) => {
            const pos = subOrbPositions.current[sat.id] || { x: 0, y: 0 };
            const isExtracted = hubState === 'extracted' && sat.id === extractedId;
            const size = isExtracted ? subOrbSizeExtracted : subOrbSizeBloom;
            
            const isVisible = hubState === 'bloom' || (hubState === 'extracted' && sat.id === extractedId);
            if (!isVisible) return null;

            const solfeggioFreq = SOLFEGGIO[idx % SOLFEGGIO.length];
            
            return (
              <button
                key={`hitbox-${sat.id}`}
                id={`nodule-${sat.id}`}
                data-frequency={solfeggioFreq}
                style={{
                  position: 'absolute',
                  left: `${center + pos.x - size / 2}px`,
                  top: `${center + pos.y - size / 2}px`,
                  width: `${size}px`,
                  height: `${size}px`,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  outline: 'none',
                  transform: 'scale(1) translateZ(0px)',
                  zIndex: TOUCH_PLANE_Z_INDEX,
                  pointerEvents: 'auto',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const btn = document.getElementById(`nodule-${sat.id}`);
                  if (!btn) {
                    window.location.href = sat.path;
                    return;
                  }
                  
                  // V43.1: KILL TRANSITION — INSTANT DISCHARGE
                  btn.style.transition = 'none';
                  
                  // HAPTIC FIRE (Instant)
                  if (navigator.vibrate) navigator.vibrate(HAPTIC_HEAVY_SNAP);
                  
                  // VISUAL PULSE (Instant - Zero Lag)
                  btn.style.boxShadow = `0 0 40px rgba(255, 255, 255, 1)`;
                  btn.style.filter = 'brightness(2) contrast(1.5)';
                  btn.style.transform = `scale(${HEAVY_SCALE}) translateZ(0px)`;
                  
                  console.log(`[V43.1] OCULAR RECEIPT: ${sat.id} @ ${solfeggioFreq}Hz`);
                  
                  // RECOIL (Controlled Spring-Back)
                  setTimeout(() => {
                    // Restore transition only for organic settle
                    btn.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    btn.style.transform = `scale(${BOUNCE_SCALE}) translateZ(0px)`;
                    if (navigator.vibrate) navigator.vibrate(HAPTIC_LIGHT_RELEASE);
                    
                    setTimeout(() => {
                      btn.style.transform = 'scale(1) translateZ(0px)';
                      btn.style.boxShadow = 'none';
                      btn.style.filter = 'none';
                      console.log(`[V43.1] DOWNLOAD: ${sat.id} → ${sat.path}`);
                      window.location.href = sat.path;
                    }, 150);
                  }, 80);
                }}
                onMouseEnter={() => setHoveredSat(sat.id)}
                onMouseLeave={() => setHoveredSat(null)}
                data-testid={`hitbox-${sat.id}`}
                aria-label={`Navigate to ${sat.label}`}
              />
            );
          })}

          {/* ═══ V43.0 CORE HITBOX — KINETIC INVERSION ═══ */}
          <button
            id="nodule-core"
            style={{
              position: 'absolute',
              left: `${center - R}px`,
              top: `${center - R}px`,
              width: `${coreDiameter}px`,
              height: `${coreDiameter}px`,
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              outline: 'none',
              transform: 'scale(1) translateZ(0px)',
              zIndex: 25000,
              pointerEvents: 'auto',
              transition: 'transform 0.08s ease-out',
            }}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(HAPTIC_HEAVY_SNAP);
              handleCoreClick();
            }}
            data-testid="central-orb"
            aria-label="Mission Control"
          />

          {/* ═══ V31.0 COLLAPSE BUTTON ═══ */}
          {hubState === 'extracted' && extractedId && (() => {
            const sat = ALL_SATELLITES.find(s => s.id === extractedId);
            if (!sat) return null;
            const pos = subOrbPositions.current[sat.id] || { x: 0, y: 0 };
            const size = subOrbSizeExtracted;
            const btnSize = size * 0.25;
            
            return (
              <button
                style={{
                  position: 'absolute',
                  left: `${center + pos.x + size / 2 - btnSize / 2}px`,
                  top: `${center + pos.y - size / 2 - btnSize / 2}px`,
                  width: `${btnSize}px`,
                  height: `${btnSize}px`,
                  background: 'rgba(10,10,18,0.9)',
                  border: '1px solid rgba(248,250,252,0.3)',
                  borderRadius: '50%',
                  color: 'rgba(248,250,252,0.7)',
                  fontSize: `${btnSize * 0.6}px`,
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'none',
                  zIndex: 60000,
                  pointerEvents: 'auto',
                }}
                onClick={handleCollapse}
                data-testid={`snapback-${extractedId}`}
                aria-label="Collapse back"
              >
                ×
              </button>
            );
          })()}
        </div>
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredData && (
          <motion.div 
            className="absolute bottom-8 left-0 right-0 text-center pointer-events-none z-30 px-4"
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 8 }}
          >
            <p 
              className="text-sm font-medium" 
              style={{ color: hoveredData.color, fontFamily: 'Cormorant Garamond, serif' }}
            >
              {hoveredData.label}
            </p>
            <p 
              className="text-[10px]" 
              style={{ color: 'rgba(248,250,252,0.3)' }}
            >
              {hoveredData.desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom hint */}
      {!hoveredData && hubState === 'latent' && (
        <motion.p 
          className="absolute bottom-4 text-center z-10 pointer-events-none px-4"
          style={{ fontSize: 10, color: 'rgba(248,250,252,0.1)' }}
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 1 }}
        >
          tap the core to reveal modules
        </motion.p>
      )}

      <MissionControl 
        isOpen={missionControlOpen} 
        onClose={() => setMissionControlOpen(false)} 
      />
    </div>
  );
}
