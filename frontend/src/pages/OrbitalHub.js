import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimationFrame } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ALL_SATELLITES, ZONE_AUDIO } from '../components/orbital/constants';
import { CosmicDust } from '../components/orbital/CosmicDust';
import { useHubAudio } from '../hooks/useHubAudio';
import MissionControl from '../components/MissionControl';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ZERO-SCALE PARENTAGE ORBITAL HUB
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MATHEMATICAL PHYSICS MODEL (User's Exact Specification):
 * 
 * 1. LATENT STATE (Default):
 *    - Core (Parent): Scale = 1.0
 *    - Sub-Orbs (Children): Position = (0, 0, 0) local coords
 *                           Scale = 0
 *                           Opacity = 0
 *    - Sub-orbs are mathematically zeroed inside the Core
 * 
 * 2. ACCESS TRIGGER / PULSE (Tap/Hold Core):
 *    - "Bloom" Effect: Sub-orbs animate outward to 2.5x Core radius
 *    - Scale during bloom: 0.3
 *    - Opacity: lerps from 0 to 1
 * 
 * 3. TAP AND PULL EXTRACTION (Drag beyond threshold):
 *    - When sub-orb is dragged beyond 3.0x Core radius:
 *      - Extracted orb: Scale = 1.0, breaks parent constraint
 *      - All OTHER orbs: lerp back to (0, 0, 0) with Scale = 0
 *    - Click extracted orb → Navigate to its destination
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══ PHYSICS CONSTANTS ═══
const CORE_SCALE = 1.0;
const SUB_ORB_LATENT_SCALE = 0;
const SUB_ORB_BLOOM_SCALE = 0.3;
const SUB_ORB_EXTRACTED_SCALE = 1.0;

const BLOOM_RADIUS_MULTIPLIER = 2.5;  // Sub-orbs bloom to 2.5x Core radius
const EXTRACTION_THRESHOLD = 3.0;     // Drag beyond 3.0x radius to extract

const LERP_SPEED = 0.12;              // Lerp factor for smooth transitions

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
  const orbitalAngle = useRef(0);

  // Initialize sub-orb states at (0,0) with scale 0
  useEffect(() => {
    ALL_SATELLITES.forEach(sat => {
      if (!subOrbPositions.current[sat.id]) {
        subOrbPositions.current[sat.id] = { x: 0, y: 0 };
        subOrbScales.current[sat.id] = SUB_ORB_LATENT_SCALE;
        subOrbOpacities.current[sat.id] = 0;
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
        let targetScale = SUB_ORB_LATENT_SCALE;
        let targetOpacity = 0;

        if (hubState === 'latent') {
          // All orbs at (0,0,0) with scale 0, opacity 0
          targetX = 0;
          targetY = 0;
          targetScale = SUB_ORB_LATENT_SCALE;
          targetOpacity = 0;
        } else if (hubState === 'bloom') {
          // Bloom: orbs at 2.5x radius with scale 0.3
          const angle = (idx / total) * Math.PI * 2 + orbitalAngle.current - Math.PI / 2;
          targetX = Math.cos(angle) * bloomRadius;
          targetY = Math.sin(angle) * bloomRadius;
          targetScale = SUB_ORB_BLOOM_SCALE;
          targetOpacity = 1;
        } else if (hubState === 'extracted') {
          if (sat.id === extractedId) {
            // Extracted orb: stays at extraction position with scale 1.0
            const angle = (idx / total) * Math.PI * 2 + orbitalAngle.current - Math.PI / 2;
            targetX = Math.cos(angle) * extractionRadius;
            targetY = Math.sin(angle) * extractionRadius;
            targetScale = SUB_ORB_EXTRACTED_SCALE;
            targetOpacity = 1;
          } else {
            // All other orbs: lerp back to (0,0,0) with scale 0
            targetX = 0;
            targetY = 0;
            targetScale = SUB_ORB_LATENT_SCALE;
            targetOpacity = 0;
          }
        }

        // Apply dragging offset if this orb is being dragged
        if (dragTarget === sat.id) {
          targetX = dragOffset.x;
          targetY = dragOffset.y;
          targetScale = Math.max(SUB_ORB_BLOOM_SCALE, targetScale);
          targetOpacity = 1;
        }

        // Lerp towards target
        subOrbPositions.current[sat.id] = {
          x: lerp(subOrbPositions.current[sat.id]?.x || 0, targetX, LERP_SPEED),
          y: lerp(subOrbPositions.current[sat.id]?.y || 0, targetY, LERP_SPEED),
        };
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
    if (hubState === 'latent') {
      // Trigger Bloom
      setHubState('bloom');
      if (navigator.vibrate) navigator.vibrate([15, 10, 25]);
      try { audio.playSatellite('bloom'); } catch {}
    } else if (hubState === 'bloom') {
      // Collapse back to latent
      setHubState('latent');
      setExtractedId(null);
      try { audio.collapseSound(); } catch {}
    } else if (hubState === 'extracted') {
      // Open Mission Control when extracted
      setMissionControlOpen(true);
    }
  }, [hubState, audio]);

  // ═══ SUB-ORB CLICK (simple tap to extract in bloom state) ═══
  const handleSubOrbClick = useCallback((e, sat) => {
    e.stopPropagation();
    
    if (hubState === 'bloom') {
      // Simple tap extracts the orb
      setHubState('extracted');
      setExtractedId(sat.id);
      if (navigator.vibrate) navigator.vibrate([30, 15, 50]);
      try { audio.playSatellite(sat.id); } catch {}
    } else if (hubState === 'extracted' && sat.id === extractedId) {
      // Tap extracted orb to navigate
      try { audio.stopSatellite(); } catch {}
      navigate(sat.path);
    }
  }, [hubState, extractedId, audio, navigate]);

  // ═══ SUB-ORB DRAG START ═══
  const handleSubOrbPointerDown = useCallback((e, satId) => {
    // Don't start drag if in extracted state - let click handler take over
    if (hubState === 'extracted') return;
    
    e.stopPropagation();
    e.preventDefault();
    
    if (hubState !== 'bloom') return;
    
    const rect = e.currentTarget.closest('[data-container]')?.getBoundingClientRect();
    if (!rect) return;
    
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    
    setDragTarget(satId);
    setDragOffset({
      x: (clientX - rect.left - center),
      y: (clientY - rect.top - center),
    });
    
    if (navigator.vibrate) navigator.vibrate(10);
  }, [hubState, center]);

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
      
      // Check if drag exceeded extraction threshold
      const currentPos = subOrbPositions.current[dragTarget];
      const distFromCenter = dist(0, 0, currentPos?.x || 0, currentPos?.y || 0);
      
      if (distFromCenter > extractionRadius * 0.8) {
        // EXTRACTION: Orb breaks free, all others collapse
        setHubState('extracted');
        setExtractedId(dragTarget);
        if (navigator.vibrate) navigator.vibrate([30, 15, 50]);
        try { audio.playSatellite(dragTarget); } catch {}
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
  }, [dragTarget, center, extractionRadius, audio]);

  // ═══ EXTRACTED ORB CLICK → NAVIGATE ═══
  const handleExtractedClick = useCallback((sat) => {
    if (hubState !== 'extracted' || sat.id !== extractedId) return;
    
    try { audio.stopSatellite(); } catch {}
    navigate(sat.path);
  }, [hubState, extractedId, navigate, audio]);

  // ═══ COLLAPSE BACK (X button on extracted orb) ═══
  const handleCollapse = useCallback((e) => {
    e.stopPropagation();
    setHubState('bloom');
    setExtractedId(null);
    try { audio.collapseSound(); } catch {}
    if (navigator.vibrate) navigator.vibrate([15, 10, 20]);
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

      {/* Title */}
      <motion.div 
        className="absolute top-4 sm:top-6 left-0 right-0 text-center z-10 pointer-events-none"
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }}
      >
        <h1 
          className="text-sm sm:text-lg font-light tracking-[0.25em] uppercase"
          style={{ color: 'rgba(248,250,252,0.2)', fontFamily: 'Cormorant Garamond, serif' }}
        >
          The Cosmic Collective
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

      {/* ═══ ORBITAL SYSTEM CONTAINER ═══ */}
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

        {/* ═══ SUB-ORBS ═══ */}
        {ALL_SATELLITES.map((sat, idx) => {
          const Icon = sat.icon;
          const pos = subOrbPositions.current[sat.id] || { x: 0, y: 0 };
          const scale = subOrbScales.current[sat.id] || 0;
          const opacity = subOrbOpacities.current[sat.id] || 0;
          
          // Don't render if invisible
          if (opacity < 0.01 && scale < 0.01) return null;
          
          const isExtracted = hubState === 'extracted' && sat.id === extractedId;
          const isHovered = hoveredSat === sat.id;
          const size = isExtracted ? subOrbSizeExtracted : subOrbSizeBloom;

          return (
            <motion.div
              key={sat.id}
              className="absolute cursor-pointer select-none"
              style={{
                left: center + pos.x - size / 2,
                top: center + pos.y - size / 2,
                width: size,
                height: size,
                opacity: opacity,
                transform: `scale(${scale / (isExtracted ? SUB_ORB_EXTRACTED_SCALE : SUB_ORB_BLOOM_SCALE)})`,
                zIndex: isExtracted ? 30 : (isHovered ? 25 : 20),
                transition: dragTarget === sat.id ? 'none' : 'transform 0.1s ease-out',
                touchAction: isExtracted ? 'auto' : 'none', // Allow touch on extracted orbs
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
                    : `0 0 ${R * 0.05}px ${sat.color}10`,
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
            Mission Control
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

      <MissionControl 
        isOpen={missionControlOpen} 
        onClose={() => setMissionControlOpen(false)} 
      />
    </div>
  );
}
