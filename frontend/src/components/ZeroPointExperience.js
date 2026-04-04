/**
 * ZeroPointExperience.js — Unified Zero Point Visual & Audio Controller
 * 
 * THE ARCHITECTURE OF AWE
 * 
 * This component orchestrates the three layers of the Zero Point experience:
 * 1. Visual "Strobe" (Matrix Layer) - HexagramGhostLayer with flickering geometry
 * 2. Haptic "Tuning Fork" (Somatic Layer) - 6-bit binary pulses synced to visuals
 * 3. "Source" State (Enlightenment Moment) - White-out and silence at 0.5000
 * 
 * Renders:
 * - HexagramGhostLayer (background geometry)
 * - Flickering language text overlay
 * - Source State white-out overlay
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HexagramGhostLayer from './HexagramGhostLayer';
import { useZeroPointFlicker } from '../hooks/useZeroPointFlicker';

export default function ZeroPointExperience() {
  const {
    isFlickering,
    isAtZeroPoint,
    isSourceState,
    currentFlickerLang,
    currentHexagram,
    flickerIndex,
    hexagramIndex,
    glitchIntensity,
    glitchStyle,
    currentGlyph,
    currentNative,
    currentHexagramSymbol,
  } = useZeroPointFlicker({
    enabled: true,
    hapticEnabled: true,
    audioEnabled: true,
    chineseDialect: 'zh-cmn', // Default to Mandarin for Zero Point
  });
  
  // Don't render anything if not at Zero Point
  if (!isAtZeroPoint && !isSourceState) return null;
  
  return (
    <>
      {/* Layer 1: Hexagram Ghost Geometry (behind text) */}
      <HexagramGhostLayer
        flickerIndex={hexagramIndex}
        glitchIntensity={glitchIntensity}
        isSourceState={isSourceState}
      />
      
      {/* Layer 2: Flickering Language Text Overlay */}
      <AnimatePresence>
        {isFlickering && !isSourceState && currentFlickerLang && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ 
              zIndex: 99990,
              ...glitchStyle,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.05 }}
          >
            {/* Central glyph */}
            <div className="text-center">
              {/* Hexagram symbol */}
              <motion.div
                className="text-6xl mb-4"
                style={{
                  color: currentHexagram?.glowColor || '#FFFFFF',
                  textShadow: `0 0 ${20 * glitchIntensity}px ${currentHexagram?.glowColor || '#FFFFFF'}`,
                  opacity: 0.8,
                }}
                key={currentHexagram?.number}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                transition={{ duration: 0.05 }}
              >
                {currentHexagramSymbol}
              </motion.div>
              
              {/* Flicker glyph (language symbol) */}
              <motion.div
                className="text-4xl mb-2"
                style={{
                  color: '#FFFFFF',
                  textShadow: `0 0 ${15 * glitchIntensity}px rgba(255,255,255,0.8)`,
                  fontFamily: 'serif',
                }}
                key={currentFlickerLang.code}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.03 }}
              >
                {currentGlyph}
              </motion.div>
              
              {/* Native language text */}
              <motion.div
                className="text-xl font-light tracking-widest"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '0.3em',
                }}
              >
                {currentNative}
              </motion.div>
              
              {/* Category indicator */}
              <div
                className="mt-4 text-xs uppercase tracking-[0.5em]"
                style={{
                  color: 'rgba(255,255,255,0.3)',
                }}
              >
                {currentFlickerLang.category}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Layer 3: Source State Indicator (when at exact 0.5000) */}
      <AnimatePresence>
        {isSourceState && (
          <motion.div
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none"
            style={{ zIndex: 99999 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div 
              className="text-xs uppercase tracking-[0.5em] px-6 py-2 rounded-full"
              style={{
                background: 'rgba(0,0,0,0.5)',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              Equilibrium Achieved
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { ZeroPointExperience };
