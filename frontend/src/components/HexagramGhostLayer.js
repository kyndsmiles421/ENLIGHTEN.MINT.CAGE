/**
 * HexagramGhostLayer.js — Background Geometry for Zero Point
 * 
 * THE VISUAL "STROBE" (Matrix Layer)
 * 
 * As the user enters Zero Point:
 * 1. Ghost hexagrams fade in behind the flickering text
 * 2. They follow the ritual sequence (descent and return)
 * 3. At Source State (0.5000), geometry converges to Hexagram 63
 * 4. "Persistence of Vision" effect creates Universal Pattern perception
 */

import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HEXAGRAM_REGISTRY, 
  HEXAGRAM_SEQUENCE, 
  getHexagramForGravity,
  getSourceHexagram,
} from '../config/hexagramRegistry';
import { usePolarity } from '../context/PolarityContext';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SVG HEXAGRAM RENDERER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HexagramSVG = React.memo(({ 
  binary, 
  size = 120, 
  color = '#FFFFFF', 
  opacity = 0.15,
  glowColor = '#FFD700',
  glowIntensity = 0,
}) => {
  const bits = binary.toString(2).padStart(6, '0').split('').reverse();
  
  const lineHeight = size * 0.06;
  const lineWidth = size * 0.7;
  const lineSpacing = size * 0.12;
  const yinGap = size * 0.1;
  const startY = (size - (6 * lineHeight + 5 * lineSpacing)) / 2;
  const startX = (size - lineWidth) / 2;
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`}
      style={{
        filter: glowIntensity > 0 
          ? `drop-shadow(0 0 ${glowIntensity * 20}px ${glowColor})`
          : 'none',
      }}
    >
      {bits.map((bit, index) => {
        const y = startY + (5 - index) * (lineHeight + lineSpacing);
        
        if (bit === '1') {
          // Yang: Solid line
          return (
            <rect
              key={index}
              x={startX}
              y={y}
              width={lineWidth}
              height={lineHeight}
              rx={lineHeight / 3}
              fill={color}
              opacity={opacity}
            />
          );
        } else {
          // Yin: Broken line
          const segWidth = (lineWidth - yinGap) / 2;
          return (
            <g key={index}>
              <rect
                x={startX}
                y={y}
                width={segWidth}
                height={lineHeight}
                rx={lineHeight / 3}
                fill={color}
                opacity={opacity * 0.7}
              />
              <rect
                x={startX + segWidth + yinGap}
                y={y}
                width={segWidth}
                height={lineHeight}
                rx={lineHeight / 3}
                fill={color}
                opacity={opacity * 0.7}
              />
            </g>
          );
        }
      })}
    </svg>
  );
});

HexagramSVG.displayName = 'HexagramSVG';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3x3 GRID LAYOUT (The Rule of Nines)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HexagramGrid = React.memo(({ 
  activeIndex = 0, 
  opacity = 0.1, 
  size = 80,
  glitchIntensity = 0,
}) => {
  // Map the 9 hexagrams to a 3x3 grid
  const gridPositions = [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
  ];
  
  const gap = 20;
  const totalWidth = 3 * size + 2 * gap;
  
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ opacity }}
    >
      <div
        className="relative"
        style={{ width: totalWidth, height: totalWidth }}
      >
        {HEXAGRAM_SEQUENCE.slice(0, 9).map((hexNum, index) => {
          const hex = HEXAGRAM_REGISTRY[hexNum];
          const pos = gridPositions[index];
          const isActive = index === (activeIndex % 9);
          
          return (
            <motion.div
              key={hex.number}
              className="absolute"
              style={{
                left: pos.x * (size + gap),
                top: pos.y * (size + gap),
                width: size,
                height: size,
              }}
              animate={{
                scale: isActive ? 1.2 : 1,
                opacity: isActive ? 1 : 0.4,
              }}
              transition={{ duration: 0.1 }}
            >
              <HexagramSVG
                binary={hex.binary}
                size={size}
                color={hex.glowColor}
                opacity={isActive ? hex.ghostOpacity * 2 : hex.ghostOpacity}
                glowColor={hex.glowColor}
                glowIntensity={isActive ? glitchIntensity : 0}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

HexagramGrid.displayName = 'HexagramGrid';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SOURCE STATE OVERLAY (White-Out at 0.5000)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SourceStateOverlay = React.memo(({ active, hexagram }) => {
  if (!active || !hexagram) return null;
  
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 99998 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* White-out gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0) 70%)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 2 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
      
      {/* Central hexagram 63 */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      >
        <HexagramSVG
          binary={hexagram.binary}
          size={200}
          color="#000000"
          opacity={0.8}
          glowColor={hexagram.glowColor}
          glowIntensity={0.5}
        />
      </motion.div>
      
      {/* "SOURCE" text */}
      <motion.div
        className="absolute text-center"
        style={{
          color: '#000000',
          fontSize: 12,
          letterSpacing: '0.5em',
          fontWeight: 300,
          marginTop: 280,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
      >
        SOURCE
      </motion.div>
    </motion.div>
  );
});

SourceStateOverlay.displayName = 'SourceStateOverlay';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN GHOST LAYER COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function HexagramGhostLayer({ 
  flickerIndex = 0,
  glitchIntensity = 0,
  isSourceState = false,
}) {
  const { gravity, isAtZeroPoint, isVoid } = usePolarity();
  const [activeHexagram, setActiveHexagram] = useState(null);
  
  // Get hexagram for current gravity
  useEffect(() => {
    if (isSourceState) {
      setActiveHexagram(getSourceHexagram());
    } else {
      setActiveHexagram(getHexagramForGravity(gravity));
    }
  }, [gravity, isSourceState]);
  
  // Calculate layer opacity based on gravity proximity to center
  // Must be called before any conditional returns (React hooks rule)
  const baseOpacity = useMemo(() => {
    if (isSourceState) return 0; // Source state uses its own overlay
    const distanceFromCenter = Math.abs(gravity - 0.5);
    const maxDistance = 0.02; // 0.48 to 0.52 range
    return 0.08 + (1 - distanceFromCenter / maxDistance) * 0.12;
  }, [gravity, isSourceState]);
  
  // Don't render if not at Zero Point or in Void
  if (!isAtZeroPoint && !isSourceState) return null;
  if (isVoid) return null;
  
  return (
    <>
      {/* Background grid (always visible in Zero Point) */}
      <AnimatePresence>
        {isAtZeroPoint && !isSourceState && (
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 99980 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HexagramGrid
              activeIndex={flickerIndex}
              opacity={baseOpacity}
              size={70}
              glitchIntensity={glitchIntensity}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Single focused hexagram (follows gravity position) */}
      <AnimatePresence>
        {activeHexagram && !isSourceState && isAtZeroPoint && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 99981 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: glitchIntensity * 0.5, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div
              style={{
                filter: `blur(${2 - glitchIntensity}px)`,
              }}
            >
              <HexagramSVG
                binary={activeHexagram.binary}
                size={300}
                color={activeHexagram.glowColor}
                opacity={activeHexagram.ghostOpacity}
                glowColor={activeHexagram.glowColor}
                glowIntensity={glitchIntensity * 0.3}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Source State overlay (white-out) */}
      <AnimatePresence>
        {isSourceState && (
          <SourceStateOverlay 
            active={isSourceState} 
            hexagram={getSourceHexagram()} 
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { HexagramSVG, HexagramGrid, SourceStateOverlay };
