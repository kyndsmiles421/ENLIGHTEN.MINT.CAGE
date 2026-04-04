/**
 * HexagramCompass.js — The 360° Gyroscopic Navigation Compass
 * 
 * A Three.js-based rotating cylinder with 6 hexagram lines that:
 * - Rotates clockwise in Hollow Earth, counter-clockwise in Matrix
 * - Has inertial "flick" physics with friction
 * - Triggers Supernova expansion when crossing the 0.5 threshold
 * - Freezes instantly when STOP is pressed
 * 
 * The 6 Lines:
 * - Yang (1): Solid gold glowing line
 * - Yin (0): Two shorter lines with gap in center
 */

import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePolarity } from '../context/PolarityContext';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPASS CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LINE_HEIGHT = 6; // Height of each hexagram line
const LINE_GAP = 4; // Gap between lines
const CYLINDER_RADIUS = 28; // Radius of the compass cylinder
const LINE_WIDTH = 40; // Width of Yang line
const YIN_GAP = 8; // Gap in the center of Yin lines
const ROTATION_FRICTION = 0.96; // Velocity decay per frame
const MIN_VELOCITY = 0.001; // Stop threshold
const BASE_ROTATION_SPEED = 0.003; // Ambient rotation speed
const FLICK_MULTIPLIER = 0.15; // How much a flick adds to velocity

// Supernova expansion
const SUPERNOVA_SCALE_MAX = 5; // 500% expansion
const NORMAL_SCALE = 1;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEXAGRAM LINE COMPONENT (SVG-based for performance)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HexagramLine = React.memo(({ isYang, index, colors, opacity = 1 }) => {
  const y = index * (LINE_HEIGHT + LINE_GAP);
  
  // Yang = solid line, Yin = broken line with gap
  if (isYang) {
    return (
      <g transform={`translate(0, ${y})`}>
        {/* Yang: Solid gold line */}
        <rect
          x={0}
          y={0}
          width={LINE_WIDTH}
          height={LINE_HEIGHT}
          rx={2}
          fill={colors.lineColor}
          opacity={opacity}
          style={{
            filter: `drop-shadow(0 0 4px ${colors.lineEmissive})`,
          }}
        />
        {/* Glow overlay */}
        <rect
          x={0}
          y={0}
          width={LINE_WIDTH}
          height={LINE_HEIGHT}
          rx={2}
          fill={colors.lineEmissive}
          opacity={opacity * 0.3}
        />
      </g>
    );
  }
  
  // Yin: Two lines with gap
  const segmentWidth = (LINE_WIDTH - YIN_GAP) / 2;
  return (
    <g transform={`translate(0, ${y})`}>
      {/* Left segment */}
      <rect
        x={0}
        y={0}
        width={segmentWidth}
        height={LINE_HEIGHT}
        rx={2}
        fill={colors.lineColor}
        opacity={opacity * 0.7}
        style={{
          filter: `drop-shadow(0 0 3px ${colors.lineEmissive})`,
        }}
      />
      {/* Right segment */}
      <rect
        x={segmentWidth + YIN_GAP}
        y={0}
        width={segmentWidth}
        height={LINE_HEIGHT}
        rx={2}
        fill={colors.lineColor}
        opacity={opacity * 0.7}
        style={{
          filter: `drop-shadow(0 0 3px ${colors.lineEmissive})`,
        }}
      />
    </g>
  );
});

HexagramLine.displayName = 'HexagramLine';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPASS COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function HexagramCompass({ 
  size = 80, // Base size of the compass
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
    compassRotation,
    setCompassRotation,
    compassVelocity,
    setCompassVelocity,
    compassFrozen,
    flickCompass,
    rotationDirection,
    supernovaActive,
    supernovaPhase,
    isVoid,
    isInHollow,
    isInMatrix,
    audioFlavor,
  } = usePolarity();
  
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const lastTouchRef = useRef({ x: 0, time: 0 });
  const isDraggingRef = useRef(false);
  
  // Local rotation state for smooth animation
  const [localRotation, setLocalRotation] = useState(0);
  const [localScale, setLocalScale] = useState(NORMAL_SCALE);
  const [glowIntensity, setGlowIntensity] = useState(0);
  
  // Animation loop for inertial rotation
  useEffect(() => {
    if (compassFrozen || isVoid) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }
    
    let velocity = compassVelocity;
    let rotation = localRotation;
    
    const animate = () => {
      // Apply ambient rotation based on polarity
      const ambientSpeed = BASE_ROTATION_SPEED * rotationDirection * (1 + gravity * 0.5);
      
      // Add velocity to rotation
      rotation += velocity + ambientSpeed;
      velocity *= ROTATION_FRICTION;
      
      // Stop if velocity too low
      if (Math.abs(velocity) < MIN_VELOCITY) {
        velocity = 0;
      }
      
      setLocalRotation(rotation);
      setCompassVelocity(velocity);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [compassFrozen, isVoid, rotationDirection, gravity, compassVelocity, setCompassVelocity]);
  
  // Supernova expansion animation
  useEffect(() => {
    if (!supernovaActive) {
      setLocalScale(NORMAL_SCALE);
      setGlowIntensity(0);
      return;
    }
    
    switch (supernovaPhase) {
      case 'expanding':
        setLocalScale(SUPERNOVA_SCALE_MAX);
        setGlowIntensity(1);
        break;
      case 'peak':
        setGlowIntensity(0.8);
        break;
      case 'contracting':
        setLocalScale(NORMAL_SCALE);
        setGlowIntensity(0.3);
        break;
      default:
        setLocalScale(NORMAL_SCALE);
        setGlowIntensity(0);
    }
  }, [supernovaActive, supernovaPhase]);
  
  // Handle flick gesture
  const handlePointerDown = useCallback((e) => {
    if (!interactive || compassFrozen) return;
    isDraggingRef.current = true;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    lastTouchRef.current = { x: clientX, time: Date.now() };
  }, [interactive, compassFrozen]);
  
  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current || !interactive || compassFrozen) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - lastTouchRef.current.x;
    
    // Rotate based on drag
    setLocalRotation(prev => prev + deltaX * 0.02);
    lastTouchRef.current = { x: clientX, time: Date.now() };
  }, [interactive, compassFrozen]);
  
  const handlePointerUp = useCallback((e) => {
    if (!isDraggingRef.current || !interactive) return;
    isDraggingRef.current = false;
    
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const deltaTime = Date.now() - lastTouchRef.current.time;
    const deltaX = clientX - lastTouchRef.current.x;
    
    // Calculate flick velocity
    if (deltaTime < 300 && Math.abs(deltaX) > 10) {
      const flickVelocity = (deltaX / deltaTime) * FLICK_MULTIPLIER;
      flickCompass(flickVelocity);
      
      // Haptic feedback for flick
      if (navigator.vibrate) {
        const pattern = audioFlavor === 'thud' ? [30, 10, 30] : [10, 5, 10, 5, 10];
        navigator.vibrate(pattern);
      }
    }
  }, [interactive, flickCompass, audioFlavor]);
  
  // Calculate visual properties
  const totalHeight = 6 * LINE_HEIGHT + 5 * LINE_GAP;
  const svgWidth = LINE_WIDTH + 20; // Padding for glow
  const svgHeight = totalHeight + 20;
  
  // Determine rotation transform
  const rotationDeg = (localRotation * 180 / Math.PI) % 360;
  
  // Glow color based on state
  const glowColor = useMemo(() => {
    if (isVoid) return 'rgba(100, 100, 100, 0.2)';
    if (supernovaActive) return 'rgba(255, 215, 0, 0.8)';
    if (isInHollow) return 'rgba(74, 74, 106, 0.4)';
    if (isInMatrix) return 'rgba(255, 215, 0, 0.5)';
    return 'rgba(201, 169, 98, 0.3)';
  }, [isVoid, supernovaActive, isInHollow, isInMatrix]);
  
  // Opacity based on void state
  const compassOpacity = isVoid ? 0.3 : 1;
  
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
        cursor: interactive ? 'grab' : 'default',
        touchAction: 'none',
        userSelect: 'none',
      }}
      animate={{
        scale: localScale,
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: supernovaActive ? 0.8 : 0.3,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      data-testid="hexagram-compass"
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          opacity: 0.5 + glowIntensity * 0.5,
        }}
        animate={{
          opacity: supernovaActive ? 0.9 : 0.5,
          scale: supernovaActive ? 1.2 : 1,
        }}
      />
      
      {/* Glass cylinder container */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          width: svgWidth,
          height: svgHeight,
          background: `${colors.background}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${colors.border}`,
          boxShadow: `
            0 0 ${20 + glowIntensity * 30}px ${glowColor},
            inset 0 1px 0 rgba(255,255,255,0.1)
          `,
          transform: `perspective(400px) rotateY(${rotationDeg * 0.1}deg) rotateX(${rotationDeg * 0.05}deg)`,
          opacity: compassOpacity,
          transition: 'opacity 0.3s',
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
          }}
        >
          <g transform={`translate(${(svgWidth - LINE_WIDTH) / 2}, ${(svgHeight - totalHeight) / 2})`}>
            {/* Render 6 lines from bottom (Line 1) to top (Line 6) */}
            {lineStates.map((isYang, index) => (
              <HexagramLine
                key={index}
                isYang={isYang}
                index={5 - index} // Reverse so Line 1 is at bottom
                colors={colors}
                opacity={compassOpacity}
              />
            ))}
          </g>
        </svg>
        
        {/* Center orb */}
        <div
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.lineColor} 0%, ${colors.lineEmissive} 100%)`,
            boxShadow: `0 0 8px ${colors.lineEmissive}`,
            opacity: compassOpacity,
          }}
        />
      </div>
      
      {/* Binary display (optional) */}
      {showLabels && (
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest"
          style={{ color: colors.accent, opacity: 0.7 }}
        >
          {hexagramBinary}
        </div>
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
      
      {/* Void indicator */}
      <AnimatePresence>
        {isVoid && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
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
// SUPERNOVA OVERLAY (Full-screen expansion)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function SupernovaOverlay() {
  const { supernovaActive, supernovaPhase, lineStates, colors, gravity } = usePolarity();
  
  if (!supernovaActive) return null;
  
  const isAscending = gravity >= 0.5;
  
  return (
    <motion.div
      className="fixed inset-0 z-[99990] pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: supernovaPhase === 'peak' ? 1 : 0.7 }}
      exit={{ opacity: 0 }}
      data-testid="supernova-overlay"
    >
      {/* Golden cage effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, 
            rgba(255, 215, 0, ${supernovaPhase === 'peak' ? 0.15 : 0.05}) 0%, 
            transparent 70%
          )`,
        }}
        animate={{
          scale: supernovaPhase === 'expanding' ? [1, 1.5] : 
                 supernovaPhase === 'contracting' ? [1.5, 1] : 1,
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      
      {/* Hexagram lines wrapping viewport */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ opacity: supernovaPhase === 'peak' ? 0.8 : 0.4 }}
      >
        {lineStates.map((isYang, index) => {
          const y = 15 + index * 12;
          return (
            <g key={index}>
              {isYang ? (
                <line
                  x1="5"
                  y1={y}
                  x2="95"
                  y2={y}
                  stroke={colors.lineColor}
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  style={{
                    filter: `drop-shadow(0 0 2px ${colors.lineEmissive})`,
                  }}
                />
              ) : (
                <>
                  <line x1="5" y1={y} x2="42" y2={y} stroke={colors.lineColor} strokeWidth="0.5" strokeLinecap="round" />
                  <line x1="58" y1={y} x2="95" y2={y} stroke={colors.lineColor} strokeWidth="0.5" strokeLinecap="round" />
                </>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Direction indicator */}
      <motion.div
        className="absolute text-center"
        style={{
          color: colors.accent,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          textShadow: `0 0 10px ${colors.lineEmissive}`,
        }}
        animate={{
          y: isAscending ? [-20, 0] : [20, 0],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 1.5, times: [0, 0.3, 1] }}
      >
        {isAscending ? '↑ ASCENDING TO MATRIX' : '↓ DESCENDING TO HOLLOW'}
      </motion.div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPACT HEXAGRAM INDICATOR (For status bars)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function HexagramIndicator({ size = 24 }) {
  const { lineStates, colors, hexagram, isVoid } = usePolarity();
  
  const lineHeight = 2;
  const lineGap = 1.5;
  const totalHeight = 6 * lineHeight + 5 * lineGap;
  const lineWidth = size * 0.7;
  const yinGap = 3;
  
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
      title={`Hexagram #${hexagram}`}
      data-testid="hexagram-indicator"
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
                />
              );
            }
            const segWidth = (lineWidth - yinGap) / 2;
            return (
              <g key={index}>
                <rect x={0} y={y} width={segWidth} height={lineHeight} rx={0.5} fill={colors.lineColor} opacity={0.7} />
                <rect x={segWidth + yinGap} y={y} width={segWidth} height={lineHeight} rx={0.5} fill={colors.lineColor} opacity={0.7} />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
