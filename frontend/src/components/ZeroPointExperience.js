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
 * THE SENTIENT ECOSYSTEM
 * Integrated with SentientRegistry to introduce controlled chaos based on dwell time.
 * The longer you stay at Zero Point, the more anomalies emerge.
 * 
 * Renders:
 * - HexagramGhostLayer (background geometry)
 * - Flickering language text overlay
 * - Source State white-out overlay
 * - Sentience indicator (dwell time progress)
 * - Anomaly effects
 */

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HexagramGhostLayer from './HexagramGhostLayer';
import { useZeroPointFlicker } from '../hooks/useZeroPointFlicker';
import { usePolarity } from '../context/PolarityContext';
import { 
  useSentientRegistry, 
  SENTIENCE_COLORS, 
  SENTIENCE_GLOWS 
} from '../hooks/useSentientRegistry';

export default function ZeroPointExperience() {
  const { gravity, isAtZeroPoint, isVoid, toggleHexagramLine } = usePolarity();
  
  const {
    isFlickering,
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
    currentInterval,
    forceFlickerStop,
  } = useZeroPointFlicker({
    enabled: true,
    hapticEnabled: true,
    audioEnabled: true,
    chineseDialect: 'zh-cmn',
  });
  
  // Sentient Registry — tracks dwell time and triggers anomalies
  const {
    dwellTimeSeconds,
    sentienceLevel,
    sentienceProgress,
    isAwake,
    isTranscendent,
    activeAnomaly,
    hasActiveAnomaly,
  } = useSentientRegistry({
    gravity,
    isAtZeroPoint,
    isVoid,
    onAnomaly: handleAnomaly,
  });
  
  // Anomaly effects state
  const [anomalyEffect, setAnomalyEffect] = useState(null);
  const [bleedLanguage, setBleedLanguage] = useState(null);
  const [temporalMultiplier, setTemporalMultiplier] = useState(1);
  
  // Handle anomaly events
  function handleAnomaly(anomaly) {
    setAnomalyEffect(anomaly.id);
    
    switch (anomaly.id) {
      case 'language_bleed':
        // Pick a random second language
        const languages = ['sa', 'lkt', 'ja', 'zh-cmn', 'es', 'hi'];
        const bleed = languages[Math.floor(Math.random() * languages.length)];
        setBleedLanguage(bleed);
        break;
        
      case 'hexagram_mutation':
        // Toggle a random line
        const randomLine = Math.floor(Math.random() * 6);
        toggleHexagramLine(randomLine);
        break;
        
      case 'temporal_stutter':
        setTemporalMultiplier(anomaly.rateMultiplier || 1);
        break;
        
      case 'void_whisper':
        forceFlickerStop();
        break;
        
      default:
        break;
    }
    
    // Clear effect after anomaly duration
    setTimeout(() => {
      setAnomalyEffect(null);
      setBleedLanguage(null);
      setTemporalMultiplier(1);
    }, anomaly.duration || 1000);
  }
  
  // Don't render anything if not at Zero Point
  if (!isAtZeroPoint && !isSourceState) return null;
  
  const sentienceColor = SENTIENCE_COLORS[sentienceLevel] || '#666666';
  const sentienceGlow = SENTIENCE_GLOWS[sentienceLevel] || 'none';
  
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
              // Apply temporal stutter effect
              animationDuration: `${50 * temporalMultiplier}ms`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.05 }}
          >
            {/* Void Whisper effect - darkness overlay */}
            {anomalyEffect === 'void_whisper' && (
              <motion.div
                className="absolute inset-0 bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                exit={{ opacity: 0 }}
              />
            )}
            
            {/* Central glyph */}
            <div className="text-center">
              {/* Hexagram symbol */}
              <motion.div
                className="text-6xl mb-4"
                style={{
                  color: currentHexagram?.glowColor || '#FFFFFF',
                  textShadow: `0 0 ${20 * glitchIntensity}px ${currentHexagram?.glowColor || '#FFFFFF'}`,
                  opacity: anomalyEffect === 'void_whisper' ? 0 : 0.8,
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
                className="text-4xl mb-2 relative"
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
                
                {/* Language Bleed effect - second language overlaid */}
                {anomalyEffect === 'language_bleed' && bleedLanguage && (
                  <motion.span
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      color: 'rgba(255, 200, 100, 0.6)',
                      transform: 'translate(5px, -5px)',
                      filter: 'blur(1px)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                  >
                    ◈
                  </motion.span>
                )}
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
      
      {/* Layer 3: Sentience Indicator (dwell time + awakening level) */}
      <AnimatePresence>
        {isAtZeroPoint && !isSourceState && (
          <motion.div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 pointer-events-none"
            style={{ zIndex: 99995 }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <div 
              className="flex flex-col items-center gap-2 px-4 py-2 rounded-lg"
              style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${sentienceColor}40`,
                boxShadow: sentienceGlow,
              }}
            >
              {/* Sentience level */}
              <div 
                className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: sentienceColor }}
              >
                {sentienceLevel}
              </div>
              
              {/* Progress bar */}
              <div 
                className="w-24 h-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: sentienceColor }}
                  animate={{ width: `${sentienceProgress * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              
              {/* Dwell time */}
              <div 
                className="text-[9px] tabular-nums"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {dwellTimeSeconds}s
              </div>
              
              {/* Active anomaly indicator */}
              {hasActiveAnomaly && activeAnomaly && (
                <motion.div
                  className="text-[8px] uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{
                    background: 'rgba(255, 100, 100, 0.2)',
                    color: '#FF6B6B',
                    border: '1px solid rgba(255, 100, 100, 0.3)',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {activeAnomaly.name}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Layer 4: Convergence Effect (all hexagrams flash) */}
      <AnimatePresence>
        {anomalyEffect === 'convergence' && (
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 99999 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Layer 5: Source State Indicator (when at exact 0.5000) */}
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
