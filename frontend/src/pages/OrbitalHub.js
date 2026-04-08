import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimationFrame } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ALL_SATELLITES, ZONE_AUDIO } from '../components/orbital/constants';
import { CosmicDust } from '../components/orbital/CosmicDust';
import { useHubAudio } from '../hooks/useHubAudio';
import { useSensoryResonance } from '../hooks/useSensoryResonance';
import { useDepth, Z_LAYERS } from '../hooks/useDepth';
import MissionControl from '../components/MissionControl';
import { useHarmonicResonance, SOLFEGGIO_FREQUENCIES } from '../utils/HarmonicResonance';
import GrandFinaleCoordinator from '../components/GrandFinaleCoordinator';
import V_ENGINE_P0 from '../engines/V_ENGINE_P0';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ZERO-SCALE PARENTAGE ORBITAL HUB — 3D DEPTH-ENHANCED
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Now with Z-axis depth layering:
 * - Front (+200px): Active modal, "Tap to Enter" prompts
 * - Mid-Front (+50px): Extracted orbs (selected)
 * - Center (0px): ENLIGHTEN.MINT.CAFE Hub with Color 2 radiance
 * - Mid-Back (-100px): Orbiting sub-orbs with subtle blur
 * - Deep-Back (-500px): Cosmic dust background
 * 
 * Features:
 * - CSS preserve-3d for true 3D transforms
 * - GPU-accelerated translate3d() movements
 * - Depth-based blur and opacity
 * - Optional gyroscope tilt (DeviceOrientation API)
 * - Device capability detection (progressive enhancement)
 * 
 * MATHEMATICAL PHYSICS MODEL:
 * - Core: Scale 1.0, Z = 0 (focal plane)
 * - Latent Sub-Orbs: Position (0,0,0), Scale 0, Opacity 0
 * - Bloomed Sub-Orbs: 2.5x radius, Scale 0.3, Z = -100
 * - Extracted Orb: 3.0x radius, Scale 1.0, Z = +50
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══ V_ENGINE_P0 PHYSICS CONSTANTS ═══
// Derived from V_ENGINE_P0: Core 1.0, Bloom √6.25 (2.5), Extract 3.0
const PHI = 1.618; // Harmonic Resistance constant
const ROTATION_BASE = 1155.0; // Degrees
const orbitalPhysics = V_ENGINE_P0.applyOrbitalPhysics(null);

const CORE_SCALE = orbitalPhysics.coreScale; // 1.0
const SUB_ORB_LATENT_SCALE = 0;
const SUB_ORB_BLOOM_SCALE = 0.3; // Bloom scale when visible
const SUB_ORB_EXTRACTED_SCALE = orbitalPhysics.extractScale; // 3.0 (absolute output)

const BLOOM_RADIUS_MULTIPLIER = orbitalPhysics.bloomScale; // √6.25 = 2.5 (radical root)
const EXTRACTION_THRESHOLD = 3.0;     // Drag beyond 3.0x radius to extract

const LERP_SPEED = 0.12;              // Lerp factor for smooth transitions (PHI-harmonic)

// Linear interpolation
function lerp(a, b, t) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

// Distance helper
function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
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
  const [extractedCount, setExtractedCount] = useState(0); // Track extracted nodules for Grand Finale
  
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
  
  // Harmonic Resonance System
  const { resonance, frequencyData, setFrequency, cycle } = useHarmonicResonance();
  
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

  // P0 FIX: Use requestAnimationFrame with DOM manipulation instead of React state
  // This prevents triggering render cascades through the context providers
  const orbContainerRef = useRef(null);
  
  useEffect(() => {
    let frameId;
    
    const updateOrbVisuals = () => {
      if (!orbContainerRef.current) {
        frameId = requestAnimationFrame(updateOrbVisuals);
        return;
      }
      
      // Direct DOM manipulation for sub-orb positions (no React re-renders)
      ALL_SATELLITES.forEach((sat) => {
        const el = orbContainerRef.current.querySelector(`[data-orb-id="${sat.id}"]`);
        if (!el) return;
        
        const pos = subOrbPositions.current[sat.id] || { x: 0, y: 0 };
        const z = subOrbZPositions.current[sat.id] || 0;
        const scale = subOrbScales.current[sat.id] || 0;
        const opacity = subOrbOpacities.current[sat.id] || 0;
        
        // Apply transforms directly to DOM
        el.style.transform = `translate3d(${center + pos.x - (hubState === 'extracted' && sat.id === extractedId ? subOrbSizeExtracted : subOrbSizeBloom) / 2}px, ${center + pos.y - (hubState === 'extracted' && sat.id === extractedId ? subOrbSizeExtracted : subOrbSizeBloom) / 2}px, ${z}px)`;
        el.style.opacity = opacity;
        
        // Update inner content scale
        const innerEl = el.querySelector('.orb-inner');
        if (innerEl) {
          const targetScale = hubState === 'extracted' && sat.id === extractedId 
            ? SUB_ORB_EXTRACTED_SCALE 
            : SUB_ORB_BLOOM_SCALE;
          innerEl.style.transform = `scale(${scale / (targetScale || 1)})`;
        }
      });
      
      frameId = requestAnimationFrame(updateOrbVisuals);
    };
    
    frameId = requestAnimationFrame(updateOrbVisuals);
    return () => cancelAnimationFrame(frameId);
  }, [hubState, extractedId, center, subOrbSizeBloom, subOrbSizeExtracted]);

  // ═══ CORE INTERACTION: Tap/Hold to Bloom ═══
  const handleCoreClick = useCallback(() => {
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
      // Open ENLIGHTEN.MINT.CAFE when extracted
      haptic('orbTap');
      setMissionControlOpen(true);
    }
  }, [hubState, audio, orbitalResonance, haptic]);

  // ═══ SUB-ORB CLICK (simple tap to extract in bloom state) ═══
  const handleSubOrbClick = useCallback((e, sat) => {
    e.stopPropagation();
    
    if (hubState === 'bloom') {
      // Simple tap extracts the orb with extraction resonance
      setHubState('extracted');
      setExtractedId(sat.id);
      setExtractedCount(prev => prev + 1); // Track for Grand Finale
      try { orbitalResonance.extract(e.currentTarget); } catch {}
      try { audio.playSatellite(sat.id); } catch {}
    } else if (hubState === 'extracted' && sat.id === extractedId) {
      // Tap extracted orb to navigate with navigation resonance
      try { orbitalResonance.navigate(e.currentTarget); } catch {}
      try { audio.stopSatellite(); } catch {}
      // Small delay to let resonance play before navigation
      setTimeout(() => navigate(sat.path), 150);
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

  // Get current hovered satellite data
  const hoveredData = ALL_SATELLITES.find(s => s.id === hoveredSat);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#06060e', position: 'relative' }}
      data-testid="orbital-hub-page"
    >
      <CosmicDust />

      {/* Title */}
      <motion.div 
        className="absolute top-4 sm:top-6 left-0 right-0 text-center z-10 pointer-events-none"
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }}
      >
        <h1 
          className="brand-logo-large"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.2em',
          }}
        >
          ENLIGHTEN.MINT.CAFE
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
            background: hubState === 'extracted' ? 'rgba(0,255,195,0.15)' : 'rgba(248,250,252,0.05)',
            color: hubState === 'extracted' ? 'var(--mint-primary)' : 'rgba(248,250,252,0.25)',
            border: `1px solid ${hubState === 'extracted' ? 'rgba(0,255,195,0.3)' : 'rgba(248,250,252,0.05)'}`,
          }}
        >
          {hubState === 'latent' && 'Tap Core to Bloom'}
          {hubState === 'bloom' && 'Drag to Extract'}
          {hubState === 'extracted' && 'Tap to Enter'}
        </span>
      </motion.div>

      {/* ═══ ORBITAL SYSTEM CONTAINER — 3D Stage ═══ */}
      <div 
        ref={orbContainerRef}
        className="relative" 
        style={{
          width: containerSize, 
          height: containerSize, 
          zIndex: 2,
          maxWidth: '100vw', 
          maxHeight: 'calc(100vh - 100px)',
          pointerEvents: 'none', // Let events pass through to children
          ...depth.getContainerStyle(1200), // 3D perspective + optional gyro
        }}
        data-container
      >
        {/* Orbital ring guides */}
        {hubState !== 'latent' && (
          <>
            {/* Bloom radius guide */}
            <div 
              className="absolute rounded-full pointer-events-none"
              style={{
                left: center - bloomRadius,
                top: center - bloomRadius,
                width: bloomRadius * 2,
                height: bloomRadius * 2,
                border: '1px dashed rgba(167,139,250,0.08)',
              }}
            />
            {/* Extraction threshold guide */}
            <div 
              className="absolute rounded-full pointer-events-none"
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
          className="absolute inset-0 pointer-events-none" 
          width={containerSize} 
          height={containerSize}
          style={{ zIndex: 5 }}
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

        {/* ═══ SUB-ORBS — 3D Depth-Aware ═══ */}
        {ALL_SATELLITES.map((sat, idx) => {
          const Icon = sat.icon;
          const pos = subOrbPositions.current[sat.id] || { x: 0, y: 0 };
          const z = subOrbZPositions.current[sat.id] || 0;
          const rawScale = subOrbScales.current[sat.id] || 0;
          const rawOpacity = subOrbOpacities.current[sat.id] || 0;
          
          // --- SOVEREIGN CRYSTALLINE SEED STATE ---
          // We never return null. Maintain a resonance floor (0.1) so the 
          // satellite is always ready to bloom and receive pointer events.
          // This prevents the 'flicker' or 'extraction' glitch seen in the tour.
          const resonanceFloor = 0.1;
          const scale = Math.max(rawScale, resonanceFloor);
          const opacity = Math.max(rawOpacity, resonanceFloor);
          
          const isExtracted = hubState === 'extracted' && sat.id === extractedId;
          const isHovered = hoveredSat === sat.id;
          const size = isExtracted ? subOrbSizeExtracted : subOrbSizeBloom;
          
          // Get depth-based visual effects
          const depthStyle = depth.getDepthStyle(z);
          const rimLight = depth.getRimLight(z, sat.color);
          
          // Calculate haptic intensity based on depth
          const hapticIntensity = depth.calculateHapticIntensity(z);

          // Determine if satellite is effectively in latent state (at resonance floor)
          // In bloom state: rawOpacity→1.0, rawScale→0.3, so both > 0.15
          const isAtResonanceFloor = rawOpacity < 0.15 && rawScale < 0.15;
          
          return (
            <motion.div
              key={sat.id}
              data-orb-id={sat.id}
              className="absolute cursor-pointer select-none"
              style={{
                pointerEvents: 'auto', // Enable clicks on sub-orbs
                // GPU-accelerated 3D transform
                ...depth.getTransform3D(
                  center + pos.x - size / 2,
                  center + pos.y - size / 2,
                  z
                ),
                width: size,
                height: size,
                opacity: opacity * depthStyle.opacity,
                filter: depthStyle.filter,
                zIndex: isExtracted ? 30 : (isHovered ? 25 : 20),
                touchAction: isExtracted ? 'auto' : 'none',
                willChange: 'transform, opacity, filter',
                // Disable pointer events when at resonance floor to prevent blocking core
                pointerEvents: isAtResonanceFloor ? 'none' : 'auto',
              }}
              onPointerDown={(e) => !isExtracted && handleSubOrbPointerDown(e, sat.id)}
              onClick={(e) => handleSubOrbClick(e, sat)}
              onTouchEnd={(e) => {
                // Ensure touch taps work on extracted orbs
                if (isExtracted) {
                  e.stopPropagation();
                  handleSubOrbClick(e, sat);
                }
              }}
              onMouseEnter={() => setHoveredSat(sat.id)}
              onMouseLeave={() => setHoveredSat(null)}
              data-testid={isExtracted ? `satellite-${sat.id}` : `dormant-${sat.id}`}
            >
              {/* Nodule Vibration Glow Layer - behind content */}
              {(isHovered || isExtracted || hubState === 'bloom') && (
                <div 
                  className="nodule-vibration"
                  style={{
                    width: size * 1.6,
                    height: size * 1.6,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, ${sat.color}40 0%, ${sat.color}10 70%, transparent 100%)`,
                    animationDelay: `${idx * 0.2}s`,
                    '--pulse-speed': `${3 + (idx % 3)}s`, // Varied pulse speeds: 3s, 4s, 5s
                  }}
                />
              )}
              
              <div
                className="orb-inner w-full h-full rounded-full flex flex-col items-center justify-center relative rotation-point"
                style={{
                  pointerEvents: 'none', // Let events bubble to parent motion.div
                  background: isHovered || isExtracted 
                    ? `${sat.color}1A` 
                    : 'rgba(10,10,18,0.6)',
                  border: `1.5px solid ${isHovered || isExtracted ? sat.color + '55' : sat.color + '20'}`,
                  boxShadow: isExtracted
                    ? `${depthStyle.boxShadow}, 0 0 ${R * 0.2}px ${sat.color}40, inset 0 0 ${R * 0.1}px ${sat.color}15`
                    : isHovered
                    ? `${depthStyle.boxShadow}, 0 0 ${R * 0.15}px ${sat.color}30`
                    : depthStyle.boxShadow,
                  ...rimLight, // Add rim light when in front
                  backdropFilter: 'blur(8px)',
                  transform: `scale(${scale / (isExtracted ? SUB_ORB_EXTRACTED_SCALE : SUB_ORB_BLOOM_SCALE)})`,
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

              {/* Collapse button on extracted orb */}
              {isExtracted && (
                <>
                  <motion.button
                    className="absolute -top-1 -right-1 rounded-full flex items-center justify-center"
                    style={{
                      width: size * 0.2,
                      height: size * 0.2,
                      background: 'rgba(10,10,18,0.9)',
                      border: '1px solid rgba(248,250,252,0.2)',
                      zIndex: 35,
                      fontSize: size * 0.1,
                      color: 'rgba(248,250,252,0.6)',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={handleCollapse}
                    data-testid={`snapback-${sat.id}`}
                  >
                    ×
                  </motion.button>
                  {/* Tap to Enter hint */}
                  <motion.p
                    className="absolute -bottom-5 left-0 right-0 text-center pointer-events-none"
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
                </>
              )}
            </motion.div>
          );
        })}

        {/* ═══ CORE ORB (Parent) ═══ */}
        <div
          className="absolute cursor-pointer"
          style={{
            left: center - R,
            top: center - R,
            width: coreDiameter,
            height: coreDiameter,
            zIndex: 15,
            pointerEvents: 'auto', // Explicitly enable pointer events for the core
          }}
          onClick={handleCoreClick}
          data-testid="central-orb"
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
            {/* Inner decorative rings */}
            <motion.div 
              className="absolute rounded-full pointer-events-none"
              style={{ inset: R * 0.06, border: '1px solid rgba(167,139,250,0.1)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div 
              className="absolute rounded-full pointer-events-none"
              style={{ inset: R * 0.12, border: '1px dashed rgba(167,139,250,0.05)' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            />

            {/* Center label */}
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

          {/* Core label below */}
          <p 
            className="text-center font-medium tracking-[0.12em] uppercase mt-2"
            style={{ 
              fontSize: Math.max(7, R * 0.06), 
              color: 'rgba(167,139,250,0.3)' 
            }}
            data-testid="mission-control-label"
          >
            ENLIGHTEN.MINT.CAFE
          </p>
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

      {/* Harmonic Resonance Indicator */}
      {resonance && frequencyData && (
        <motion.div
          className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full backdrop-blur-md cursor-pointer"
          style={{
            background: 'rgba(10,10,18,0.7)',
            border: `1px solid ${frequencyData.color}`,
            boxShadow: `0 0 15px ${frequencyData.color}40`,
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => cycle('up')}
          data-testid="resonance-indicator"
        >
          <p className="text-[10px] font-semibold tracking-wider" style={{ color: frequencyData.color }}>
            {resonance}Hz · {frequencyData.name}
          </p>
        </motion.div>
      )}

      {/* Grand Finale Coordinator — Triggers when all nodules extracted */}
      <GrandFinaleCoordinator 
        noduleCount={extractedCount}
        totalNodules={ALL_SATELLITES.length}
        onAlignmentComplete={() => {
          console.log('🌌 Universal Alignment Complete!');
          // Could trigger special navigation or unlock here
        }}
      />

      <MissionControl 
        isOpen={missionControlOpen} 
        onClose={() => setMissionControlOpen(false)} 
      />
    </div>
  );
}
