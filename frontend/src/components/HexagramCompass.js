/**
 * HexagramCompass.js — The 360° Gyroscopic Navigation Compass
 * 
 * A physics-based rotating compass with 6 hexagram lines that:
 * - Rotates clockwise in Hollow Earth, counter-clockwise in Matrix
 * - Has inertial "flick" physics with variable friction based on gravity
 * - Triggers Supernova expansion when crossing the 0.5 threshold
 * - The Supernova BREATHES based on gravity intensity (not static scale)
 * - Freezes instantly when STOP is pressed
 * 
 * The 6 Lines:
 * - Yang (1): Solid gold glowing line
 * - Yin (0): Two shorter lines with gap in center
 * 
 * SUPERNOVA MECHANICS:
 * - Trigger: Crossing gravity 0.5 threshold
 * - Scale: 100% + (gravity_delta * 400%) = up to 500% at max transition
 * - Glow: Intensity = |gravity - 0.5| * 2 (brightest at extremes)
 * - Duration: 2.5s full cycle (expand → peak → contract)
 */

import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePolarity } from '../context/PolarityContext';
import { useDepth, LINE_FLAVORS, MAX_DEPTH } from '../context/DepthContext';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPASS CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LINE_HEIGHT = 6;
const LINE_GAP = 4;
const LINE_WIDTH = 40;
const YIN_GAP = 8;

// Rotation physics - VARIABLE based on gravity
const MIN_VELOCITY = 0.0005;
const BASE_ROTATION_SPEED = 0.004;
const FLICK_MULTIPLIER = 0.2;

// Gravity-reactive friction:
// Hollow Earth (0.0) = 0.92 (heavy, slow decay)
// Matrix (1.0) = 0.98 (light, long spin)
const FRICTION_HOLLOW = 0.92;
const FRICTION_MATRIX = 0.985;

// Supernova - GRAVITY-REACTIVE
const SUPERNOVA_BASE_SCALE = 1;
const SUPERNOVA_MAX_SCALE = 5; // 500% at max intensity
const SUPERNOVA_DURATION = 2500; // ms

// Haptic patterns
const HAPTIC_PATTERNS = {
  hollow: {
    flick: [40, 20, 40], // Heavy thud
    tap: [30],
    supernova: [80, 40, 80, 40, 120], // Deep rumble
  },
  core: {
    flick: [20, 10, 20],
    tap: [15],
    supernova: [50, 30, 50],
  },
  matrix: {
    flick: [10, 5, 10, 5, 10], // Light shimmer
    tap: [8],
    supernova: [20, 10, 20, 10, 20, 10, 30], // Crystalline burst
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEXAGRAM LINE COMPONENT (Now tappable for recursive dive)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HexagramLine = React.memo(({ 
  isYang, 
  index, 
  colors, 
  opacity = 1, 
  glowMultiplier = 1,
  isSelected = false,
  onSelect,
  selectionColor,
}) => {
  const y = index * (LINE_HEIGHT + LINE_GAP);
  const glowSize = 4 * glowMultiplier;
  const selectedGlow = isSelected ? 8 : 0;
  const lineColor = isSelected ? (selectionColor || colors.lineColor) : colors.lineColor;
  const lineOpacity = isSelected ? 1 : opacity;
  
  // Tappable hit area (larger than visual)
  const hitAreaPadding = 4;
  
  if (isYang) {
    return (
      <g 
        transform={`translate(0, ${y})`}
        onClick={() => onSelect?.(index)}
        style={{ cursor: onSelect ? 'pointer' : 'default' }}
        data-testid={`hexagram-line-${index}`}
      >
        {/* Hit area (invisible, larger) */}
        <rect
          x={-hitAreaPadding}
          y={-hitAreaPadding}
          width={LINE_WIDTH + hitAreaPadding * 2}
          height={LINE_HEIGHT + hitAreaPadding * 2}
          fill="transparent"
        />
        {/* Visual line */}
        <rect
          x={0}
          y={0}
          width={LINE_WIDTH}
          height={LINE_HEIGHT}
          rx={2}
          fill={lineColor}
          opacity={lineOpacity}
          style={{
            filter: `drop-shadow(0 0 ${glowSize + selectedGlow}px ${isSelected ? selectionColor : colors.lineEmissive})`,
            transition: 'filter 0.2s, fill 0.2s',
          }}
        />
        {/* Glow overlay */}
        <rect
          x={0}
          y={0}
          width={LINE_WIDTH}
          height={LINE_HEIGHT}
          rx={2}
          fill={isSelected ? selectionColor : colors.lineEmissive}
          opacity={(lineOpacity * 0.3 * glowMultiplier) + (isSelected ? 0.3 : 0)}
        />
        {/* Selection indicator */}
        {isSelected && (
          <rect
            x={-2}
            y={-2}
            width={LINE_WIDTH + 4}
            height={LINE_HEIGHT + 4}
            rx={3}
            fill="none"
            stroke={selectionColor}
            strokeWidth={1}
            opacity={0.8}
          />
        )}
      </g>
    );
  }
  
  const segmentWidth = (LINE_WIDTH - YIN_GAP) / 2;
  return (
    <g 
      transform={`translate(0, ${y})`}
      onClick={() => onSelect?.(index)}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
      data-testid={`hexagram-line-${index}`}
    >
      {/* Hit area */}
      <rect
        x={-hitAreaPadding}
        y={-hitAreaPadding}
        width={LINE_WIDTH + hitAreaPadding * 2}
        height={LINE_HEIGHT + hitAreaPadding * 2}
        fill="transparent"
      />
      {/* Left segment */}
      <rect
        x={0}
        y={0}
        width={segmentWidth}
        height={LINE_HEIGHT}
        rx={2}
        fill={lineColor}
        opacity={lineOpacity * 0.7}
        style={{
          filter: `drop-shadow(0 0 ${(glowSize + selectedGlow) * 0.75}px ${isSelected ? selectionColor : colors.lineEmissive})`,
          transition: 'filter 0.2s, fill 0.2s',
        }}
      />
      {/* Right segment */}
      <rect
        x={segmentWidth + YIN_GAP}
        y={0}
        width={segmentWidth}
        height={LINE_HEIGHT}
        rx={2}
        fill={lineColor}
        opacity={lineOpacity * 0.7}
        style={{
          filter: `drop-shadow(0 0 ${(glowSize + selectedGlow) * 0.75}px ${isSelected ? selectionColor : colors.lineEmissive})`,
          transition: 'filter 0.2s, fill 0.2s',
        }}
      />
      {/* Selection indicator */}
      {isSelected && (
        <rect
          x={-2}
          y={-2}
          width={LINE_WIDTH + 4}
          height={LINE_HEIGHT + 4}
          rx={3}
          fill="none"
          stroke={selectionColor}
          strokeWidth={1}
          opacity={0.8}
        />
      )}
    </g>
  );
});

HexagramLine.displayName = 'HexagramLine';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPASS COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function HexagramCompass({ 
  size = 80,
  showLabels = false,
  interactive = true,
  className = '',
}) {
  const {
    lineStates,
    hexagramBinary,
    hexagram,
    gravity,
    colors,
    physics,
    compassVelocity,
    setCompassVelocity,
    compassFrozen,
    flickCompass,
    rotationDirection,
    supernovaActive,
    supernovaPhase,
    supernovaIntensity,
    supernovaVelocity,
    isVoid,
    isInHollow,
    isInCore,
    isInMatrix,
    audioFlavor,
    transitionDirection,
  } = usePolarity();
  
  // Depth context for recursive dive
  const { 
    selectedLine, 
    selectLine, 
    canDive, 
    depth,
    currentLineFlavor,
  } = useDepth();
  
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const lastTouchRef = useRef({ x: 0, y: 0, time: 0 });
  const isDraggingRef = useRef(false);
  const velocityRef = useRef(0);
  
  // Local state for smooth animation
  const [localRotation, setLocalRotation] = useState(0);
  const [localScale, setLocalScale] = useState(SUPERNOVA_BASE_SCALE);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [rotationSpeed, setRotationSpeed] = useState(0);
  
  // Calculate gravity-reactive friction
  const friction = useMemo(() => {
    return FRICTION_HOLLOW + (FRICTION_MATRIX - FRICTION_HOLLOW) * gravity;
  }, [gravity]);
  
  // Calculate glow based on distance from center (0.5)
  const gravityGlow = useMemo(() => {
    const distanceFromCenter = Math.abs(gravity - 0.5) * 2; // 0 at center, 1 at extremes
    return 1 + distanceFromCenter * 0.5; // 1.0 to 1.5
  }, [gravity]);
  
  // Get haptic pattern for current layer
  const hapticPattern = useMemo(() => {
    if (isInHollow) return HAPTIC_PATTERNS.hollow;
    if (isInMatrix) return HAPTIC_PATTERNS.matrix;
    return HAPTIC_PATTERNS.core;
  }, [isInHollow, isInMatrix]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANIMATION LOOP — 360° Rotation with Variable Physics
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  useEffect(() => {
    if (compassFrozen || isVoid) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      velocityRef.current = 0;
      return;
    }
    
    let lastTime = performance.now();
    
    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to 60fps
      lastTime = currentTime;
      
      // Ambient rotation - speed varies with gravity
      // Hollow = slow (0.002), Matrix = fast (0.006)
      const ambientSpeed = BASE_ROTATION_SPEED * (0.5 + gravity) * rotationDirection;
      
      // Apply velocity with gravity-reactive friction
      velocityRef.current *= Math.pow(friction, deltaTime);
      
      // Add ambient rotation
      const totalRotation = velocityRef.current + ambientSpeed;
      
      // Stop if velocity negligible
      if (Math.abs(velocityRef.current) < MIN_VELOCITY) {
        velocityRef.current = 0;
      }
      
      setLocalRotation(prev => prev + totalRotation * deltaTime);
      setRotationSpeed(Math.abs(totalRotation) * 100);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [compassFrozen, isVoid, rotationDirection, gravity, friction]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SUPERNOVA — Velocity-Reactive Expansion (uses supernovaIntensity from context)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  useEffect(() => {
    if (!supernovaActive) {
      // Smooth return to normal
      setLocalScale(prev => prev + (SUPERNOVA_BASE_SCALE - prev) * 0.1);
      setGlowIntensity(prev => prev * 0.9);
      return;
    }
    
    // Use the velocity-reactive intensity from PolarityContext
    const targetScale = supernovaIntensity || SUPERNOVA_BASE_SCALE;
    
    switch (supernovaPhase) {
      case 'expanding':
        // Scale to the calculated intensity
        setLocalScale(targetScale);
        setGlowIntensity(1);
        
        // Haptic burst (already handled in PolarityContext, but add compass-specific feedback)
        if (navigator.vibrate && supernovaVelocity > 0.5) {
          // Extra "snap" for fast transitions
          setTimeout(() => navigator.vibrate(hapticPattern.supernova), 200);
        }
        break;
        
      case 'peak':
        // Pulse at peak - intensity determines pulse range
        const pulseRange = 0.2 + (supernovaIntensity / 5) * 0.3; // More intense = bigger pulse
        setGlowIntensity(0.6 + Math.sin(Date.now() / 80) * pulseRange);
        break;
        
      case 'contracting':
        // Smooth contraction - faster for less intense supernovas
        const contractionSpeed = 0.1 + (1 - supernovaIntensity / 5) * 0.1;
        setLocalScale(prev => prev + (SUPERNOVA_BASE_SCALE - prev) * contractionSpeed);
        setGlowIntensity(prev => prev * (0.8 + (1 - supernovaIntensity / 5) * 0.1));
        break;
        
      default:
        setLocalScale(SUPERNOVA_BASE_SCALE);
        setGlowIntensity(0);
    }
  }, [supernovaActive, supernovaPhase, supernovaIntensity, supernovaVelocity, hapticPattern]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GESTURE HANDLING — Flick to Spin
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const handlePointerDown = useCallback((e) => {
    if (!interactive || compassFrozen) return;
    e.preventDefault();
    isDraggingRef.current = true;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastTouchRef.current = { x: clientX, y: clientY, time: Date.now() };
    
    // Tap haptic
    if (navigator.vibrate) {
      navigator.vibrate(hapticPattern.tap);
    }
  }, [interactive, compassFrozen, hapticPattern]);
  
  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current || !interactive || compassFrozen) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - lastTouchRef.current.x;
    
    // Direct rotation while dragging
    setLocalRotation(prev => prev + deltaX * 0.015);
    lastTouchRef.current.x = clientX;
    lastTouchRef.current.time = Date.now();
  }, [interactive, compassFrozen]);
  
  const handlePointerUp = useCallback((e) => {
    if (!isDraggingRef.current || !interactive) return;
    isDraggingRef.current = false;
    
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const deltaTime = Date.now() - lastTouchRef.current.time;
    const deltaX = clientX - lastTouchRef.current.x;
    
    // Calculate flick velocity if gesture was fast enough
    if (deltaTime < 200 && Math.abs(deltaX) > 5) {
      const flickVelocity = (deltaX / Math.max(deltaTime, 16)) * FLICK_MULTIPLIER;
      velocityRef.current += flickVelocity;
      
      // Flick haptic
      if (navigator.vibrate) {
        navigator.vibrate(hapticPattern.flick);
      }
    }
  }, [interactive, hapticPattern]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const totalHeight = 6 * LINE_HEIGHT + 5 * LINE_GAP;
  const svgWidth = LINE_WIDTH + 20;
  const svgHeight = totalHeight + 20;
  
  const rotationDeg = (localRotation * 180 / Math.PI) % 360;
  
  // Glow color based on state
  const glowColor = useMemo(() => {
    if (isVoid) return 'rgba(100, 100, 100, 0.2)';
    if (supernovaActive) return `rgba(255, 215, 0, ${0.4 + glowIntensity * 0.6})`;
    if (isInHollow) return `rgba(74, 74, 106, ${0.3 + gravityGlow * 0.2})`;
    if (isInMatrix) return `rgba(255, 215, 0, ${0.3 + gravityGlow * 0.3})`;
    return `rgba(201, 169, 98, ${0.2 + gravityGlow * 0.15})`;
  }, [isVoid, supernovaActive, isInHollow, isInMatrix, glowIntensity, gravityGlow]);
  
  const compassOpacity = isVoid ? 0.3 : 1;
  
  // 3D rotation based on current rotation
  const tiltX = Math.sin(localRotation * 0.3) * 8;
  const tiltY = Math.cos(localRotation * 0.5) * 12;
  
  return (
    <motion.div
      ref={containerRef}
      className={`hexagram-compass ${className}`}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: interactive && !compassFrozen ? 'grab' : 'default',
        touchAction: 'none',
        userSelect: 'none',
        position: 'relative',
      }}
      animate={{
        scale: localScale,
      }}
      transition={{
        type: 'spring',
        stiffness: supernovaActive ? 80 : 150,
        damping: supernovaActive ? 12 : 20,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      data-testid="hexagram-compass"
    >
      {/* Outer glow ring - breathes with gravity */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        }}
        animate={{
          opacity: 0.4 + glowIntensity * 0.6,
          scale: 1 + glowIntensity * 0.3,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Speed indicator ring */}
      {rotationSpeed > 5 && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: `1px solid ${colors.lineColor}`,
            opacity: Math.min(rotationSpeed / 50, 0.5),
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
          }}
        />
      )}
      
      {/* Glass cylinder container */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          width: svgWidth,
          height: svgHeight,
          background: colors.background,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${colors.border}`,
          boxShadow: `
            0 0 ${20 + glowIntensity * 40}px ${glowColor},
            inset 0 1px 0 rgba(255,255,255,0.1)
          `,
          transform: `
            perspective(400px) 
            rotateX(${tiltX}deg) 
            rotateY(${tiltY}deg)
          `,
          opacity: compassOpacity,
          transition: 'opacity 0.3s, box-shadow 0.3s',
        }}
      >
        {/* SVG Hexagram Lines */}
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{
            transform: `rotate(${rotationDeg}deg)`,
            transformOrigin: 'center',
            transition: supernovaActive ? 'none' : 'transform 0.05s linear',
          }}
        >
          <g transform={`translate(${(svgWidth - LINE_WIDTH) / 2}, ${(svgHeight - totalHeight) / 2})`}>
            {lineStates.map((isYang, index) => {
              const actualLineIndex = 5 - index; // Convert visual to logical index
              const isLineSelected = selectedLine === actualLineIndex;
              const lineFlavor = currentLineFlavor && isLineSelected ? currentLineFlavor : null;
              
              return (
                <HexagramLine
                  key={index}
                  isYang={isYang}
                  index={actualLineIndex}
                  colors={colors}
                  opacity={compassOpacity}
                  glowMultiplier={gravityGlow + glowIntensity}
                  isSelected={isLineSelected}
                  onSelect={interactive && depth < MAX_DEPTH && !isVoid ? selectLine : undefined}
                  selectionColor={lineFlavor?.color || LINE_FLAVORS[actualLineIndex]?.color}
                />
              );
            })}
          </g>
        </svg>
        
        {/* Center orb - pulses during supernova */}
        <motion.div
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.lineColor} 0%, ${colors.lineEmissive} 100%)`,
            boxShadow: `0 0 ${8 + glowIntensity * 12}px ${colors.lineEmissive}`,
            opacity: compassOpacity,
          }}
          animate={{
            scale: supernovaActive ? [1, 1.5, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: supernovaActive ? Infinity : 0,
          }}
        />
      </div>
      
      {/* Binary display */}
      {showLabels && (
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest"
          style={{ color: colors.accent, opacity: 0.7 }}
          animate={{ opacity: supernovaActive ? 1 : 0.7 }}
        >
          {hexagramBinary}
        </motion.div>
      )}
      
      {/* Hexagram number */}
      {showLabels && (
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono"
          style={{ color: colors.accent, opacity: 0.5 }}
        >
          #{hexagram}
        </div>
      )}
      
      {/* Rotation direction indicator */}
      {!isVoid && !isInCore && rotationSpeed > 2 && (
        <motion.div
          className="absolute -right-3 top-1/2 -translate-y-1/2 text-[8px]"
          style={{ color: colors.accent, opacity: 0.6 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {rotationDirection > 0 ? '↻' : '↺'}
        </motion.div>
      )}
      
      {/* Void indicator */}
      <AnimatePresence>
        {isVoid && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="text-[8px] font-bold tracking-wider uppercase"
              style={{ color: '#EF4444' }}
            >
              VOID
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPERNOVA OVERLAY — Full-Screen Expansion Effect
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function SupernovaOverlay() {
  const { 
    supernovaActive, 
    supernovaPhase, 
    supernovaIntensity,
    supernovaVelocity,
    lineStates, 
    colors, 
    gravity,
    transitionDirection,
    isInHollow,
    isInMatrix,
  } = usePolarity();
  
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (supernovaActive) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [supernovaActive]);
  
  if (!visible) return null;
  
  const isAscending = transitionDirection === 'ascending';
  // Use the calculated intensity from context (1.5 to 5.0)
  const intensity = (supernovaIntensity - 1) / 4; // Normalize to 0-1 range for opacity/effects
  
  return (
    <motion.div
      className="fixed inset-0 z-[99990] pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: supernovaPhase === 'peak' ? 0.9 : supernovaActive ? 0.6 : 0,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="supernova-overlay"
    >
      {/* Golden cage radial gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, 
            rgba(255, 215, 0, ${intensity * 0.2}) 0%, 
            rgba(255, 215, 0, ${intensity * 0.1}) 30%,
            transparent 70%
          )`,
        }}
        animate={{
          scale: supernovaPhase === 'expanding' ? [1, 1.8] : 
                 supernovaPhase === 'contracting' ? [1.8, 1] : 1,
        }}
        transition={{ 
          duration: 0.8, 
          ease: [0.34, 1.56, 0.64, 1], // Spring-like
        }}
      />
      
      {/* Hexagram lines wrapping viewport */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ opacity: supernovaPhase === 'peak' ? 0.7 : 0.3 }}
      >
        {lineStates.map((isYang, index) => {
          const y = 15 + index * 12;
          const strokeWidth = 0.3 + intensity * 0.3;
          const delay = index * 0.05;
          
          return (
            <motion.g 
              key={index}
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ 
                opacity: supernovaActive ? 1 : 0,
                pathLength: supernovaActive ? 1 : 0,
              }}
              transition={{ duration: 0.5, delay }}
            >
              {isYang ? (
                <motion.line
                  x1="5"
                  y1={y}
                  x2="95"
                  y2={y}
                  stroke={colors.lineColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  style={{
                    filter: `drop-shadow(0 0 3px ${colors.lineEmissive})`,
                  }}
                  animate={{
                    y1: [y, y - 1, y],
                    y2: [y, y - 1, y],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.1,
                  }}
                />
              ) : (
                <>
                  <line 
                    x1="5" 
                    y1={y} 
                    x2="42" 
                    y2={y} 
                    stroke={colors.lineColor} 
                    strokeWidth={strokeWidth} 
                    strokeLinecap="round"
                    style={{
                      filter: `drop-shadow(0 0 2px ${colors.lineEmissive})`,
                    }}
                  />
                  <line 
                    x1="58" 
                    y1={y} 
                    x2="95" 
                    y2={y} 
                    stroke={colors.lineColor} 
                    strokeWidth={strokeWidth} 
                    strokeLinecap="round"
                    style={{
                      filter: `drop-shadow(0 0 2px ${colors.lineEmissive})`,
                    }}
                  />
                </>
              )}
            </motion.g>
          );
        })}
      </svg>
      
      {/* Direction indicator */}
      <motion.div
        className="absolute text-center"
        style={{
          color: colors.accent,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          textShadow: `0 0 20px ${colors.lineEmissive}`,
        }}
        initial={{ opacity: 0, y: isAscending ? 30 : -30 }}
        animate={{
          opacity: supernovaPhase === 'peak' ? 1 : 0,
          y: 0,
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isAscending ? '↑ ASCENDING TO MATRIX ↑' : '↓ DESCENDING TO HOLLOW ↓'}
      </motion.div>
      
      {/* Layer destination badge */}
      <motion.div
        className="absolute bottom-20 text-center"
        style={{
          color: isAscending ? '#FFD700' : '#4a4a6a',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.15em',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: supernovaActive ? 0.8 : 0 }}
        transition={{ delay: 0.3 }}
      >
        {isAscending ? 'Entering Celestial Layer' : 'Entering Foundational Layer'}
      </motion.div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPACT HEXAGRAM INDICATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function HexagramIndicator({ size = 24 }) {
  const { lineStates, colors, hexagram, isVoid, gravity, supernovaActive } = usePolarity();
  
  const lineHeight = 2;
  const lineGap = 1.5;
  const totalHeight = 6 * lineHeight + 5 * lineGap;
  const lineWidth = size * 0.7;
  const yinGap = 3;
  
  const glowIntensity = supernovaActive ? 2 : 1 + Math.abs(gravity - 0.5);
  
  return (
    <motion.div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
      title={`Hexagram #${hexagram}`}
      data-testid="hexagram-indicator"
      animate={{
        scale: supernovaActive ? [1, 1.1, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        repeat: supernovaActive ? Infinity : 0,
      }}
    >
      <svg
        width={lineWidth + 4}
        height={totalHeight + 4}
        viewBox={`0 0 ${lineWidth + 4} ${totalHeight + 4}`}
        style={{ opacity: isVoid ? 0.3 : 1 }}
      >
        <g transform="translate(2, 2)">
          {lineStates.map((isYang, index) => {
            const y = (5 - index) * (lineHeight + lineGap);
            if (isYang) {
              return (
                <rect
                  key={index}
                  x={0}
                  y={y}
                  width={lineWidth}
                  height={lineHeight}
                  rx={0.5}
                  fill={colors.lineColor}
                  style={{
                    filter: `drop-shadow(0 0 ${glowIntensity}px ${colors.lineEmissive})`,
                  }}
                />
              );
            }
            const segWidth = (lineWidth - yinGap) / 2;
            return (
              <g key={index}>
                <rect 
                  x={0} 
                  y={y} 
                  width={segWidth} 
                  height={lineHeight} 
                  rx={0.5} 
                  fill={colors.lineColor} 
                  opacity={0.7}
                  style={{
                    filter: `drop-shadow(0 0 ${glowIntensity * 0.7}px ${colors.lineEmissive})`,
                  }}
                />
                <rect 
                  x={segWidth + yinGap} 
                  y={y} 
                  width={segWidth} 
                  height={lineHeight} 
                  rx={0.5} 
                  fill={colors.lineColor} 
                  opacity={0.7}
                  style={{
                    filter: `drop-shadow(0 0 ${glowIntensity * 0.7}px ${colors.lineEmissive})`,
                  }}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </motion.div>
  );
}
