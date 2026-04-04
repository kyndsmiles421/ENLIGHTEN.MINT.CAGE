/**
 * DwellBloomIndicator.js — Visual Stillness Indicator
 * 
 * THE "FOCUS-TO-BLOOM" LOOP
 * 
 * A Jade-colored radial gradient that grows from the center of a cell
 * during the 200ms dwell threshold. At the moment the threshold is met,
 * the bloom reaches 100% opacity and "pops" slightly as the audio triggers.
 * 
 * PURPOSE:
 * This transforms the "Stillness-as-Input" mechanic from a hidden feature
 * into an intuitive teaching moment. The user learns that patience/focus
 * unlocks the sound of the lattice.
 * 
 * PROPS:
 * - isActive: Whether the user is hovering/dwelling on a cell
 * - isDwellStable: Whether the 200ms threshold has been reached
 * - dwellProgress: 0-1 progress through the dwell threshold
 * - size: Size of the bloom (usually cell size)
 * - color: Base color for the bloom (default: Jade)
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Jade color palette for the bloom
const BLOOM_COLORS = {
  // Base jade tones
  jade: 'rgba(0, 168, 107, 0.4)',        // Primary jade
  jadeGlow: 'rgba(0, 168, 107, 0.7)',     // Bright jade
  jadePop: 'rgba(0, 255, 159, 0.9)',      // Pop highlight
  
  // Void mode (inverse)
  void: 'rgba(107, 0, 168, 0.4)',         // Purple inverse
  voidGlow: 'rgba(168, 0, 255, 0.7)',
  voidPop: 'rgba(200, 0, 255, 0.9)',
};

export default function DwellBloomIndicator({
  isActive = false,
  isDwellStable = false,
  dwellProgress = 0,
  size = 60,
  isVoidMode = false,
  className = '',
}) {
  // Select color palette based on mode
  const colors = isVoidMode ? {
    base: BLOOM_COLORS.void,
    glow: BLOOM_COLORS.voidGlow,
    pop: BLOOM_COLORS.voidPop,
  } : {
    base: BLOOM_COLORS.jade,
    glow: BLOOM_COLORS.jadeGlow,
    pop: BLOOM_COLORS.jadePop,
  };
  
  // Calculate bloom scale based on dwell progress
  const bloomScale = useMemo(() => {
    if (!isActive) return 0;
    if (isDwellStable) return 1.15; // Pop effect
    // Ease-out for natural growth feel
    return Math.pow(dwellProgress, 0.7);
  }, [isActive, isDwellStable, dwellProgress]);
  
  // Calculate bloom opacity
  const bloomOpacity = useMemo(() => {
    if (!isActive) return 0;
    if (isDwellStable) return 1;
    // Ramp up opacity as we approach threshold
    return Math.min(1, dwellProgress * 1.2);
  }, [isActive, isDwellStable, dwellProgress]);
  
  // Dynamic gradient based on progress
  const gradient = useMemo(() => {
    const innerColor = isDwellStable ? colors.pop : colors.glow;
    const outerColor = colors.base;
    return `radial-gradient(circle, ${innerColor} 0%, ${outerColor} 50%, transparent 70%)`;
  }, [isDwellStable, colors]);
  
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          data-testid="dwell-bloom-indicator"
          className={`absolute inset-0 pointer-events-none ${className}`}
          style={{
            width: size,
            height: size,
          }}
          initial={{ 
            opacity: 0, 
            scale: 0.3,
          }}
          animate={{
            opacity: bloomOpacity,
            scale: bloomScale,
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.8,
            transition: { duration: 0.15 }
          }}
          transition={{
            type: 'spring',
            stiffness: isDwellStable ? 400 : 200,
            damping: isDwellStable ? 10 : 25,
            mass: 0.5,
          }}
        >
          {/* Main bloom gradient */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: gradient,
              filter: isDwellStable ? 'blur(2px)' : 'blur(4px)',
            }}
            animate={{
              filter: isDwellStable ? 'blur(1px)' : 'blur(4px)',
            }}
          />
          
          {/* Inner glow ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              top: '20%',
              left: '20%',
              right: '20%',
              bottom: '20%',
              border: `2px solid ${colors.glow}`,
              opacity: bloomOpacity * 0.6,
            }}
            animate={{
              scale: isDwellStable ? [1, 1.1, 1] : 1,
              borderWidth: isDwellStable ? '3px' : '2px',
            }}
            transition={{
              scale: { repeat: Infinity, duration: 0.8 },
            }}
          />
          
          {/* Pop effect on threshold reached */}
          {isDwellStable && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${colors.pop} 0%, transparent 60%)`,
              }}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Minimal version for performance-critical rendering
export function DwellBloomIndicatorSimple({
  isActive = false,
  isDwellStable = false,
  dwellProgress = 0,
  isVoidMode = false,
}) {
  if (!isActive) return null;
  
  const baseColor = isVoidMode ? '168, 0, 255' : '0, 168, 107';
  const opacity = isDwellStable ? 0.9 : dwellProgress * 0.7;
  const scale = isDwellStable ? 1 : dwellProgress;
  
  return (
    <div
      className="absolute inset-0 pointer-events-none rounded-full transition-all duration-100"
      style={{
        background: `radial-gradient(circle, rgba(${baseColor}, ${opacity}) 0%, transparent 60%)`,
        transform: `scale(${scale})`,
        opacity: isActive ? 1 : 0,
      }}
    />
  );
}
