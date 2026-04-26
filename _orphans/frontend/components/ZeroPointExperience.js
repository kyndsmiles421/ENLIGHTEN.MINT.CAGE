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
 * THE SENTIENT ECOSYSTEM V2
 * - Behavioral Memory: Tracks coordinate visits, "hardens" familiar paths
 * - Ghosting: Breadcrumb trail of previous positions
 * - Haptic Pitch-Shifting: Bass→shimmer as depth increases
 * - Expanded Anomaly Pool: Language Bleed, Coordinate Resonance, Meta-Nest
 * 
 * Renders:
 * - HexagramGhostLayer (background geometry)
 * - Flickering language text overlay
 * - Source State white-out overlay
 * - Sentience indicator (dwell time progress)
 * - Ghosting breadcrumb trail
 * - Anomaly effects
 */

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HexagramGhostLayer from './HexagramGhostLayer';
import GhostingOverlay from './GhostingOverlay';
import { useZeroPointFlicker } from '../hooks/useZeroPointFlicker';
import { usePolarity } from '../context/PolarityContext';
import { useDepth } from '../context/DepthContext';
import { 
  useSentientRegistryV2,
  STABILITY_LEVELS,
  HAPTIC_DEPTH_PROFILES,
} from '../hooks/useSentientRegistryV2';

// Stability level colors
const STABILITY_COLORS = {
  WILD: '#FF4500',
  FORMING: '#FF8C00',
  STABLE: '#C9A962',
  HARDENED: '#90EE90',
  CRYSTALLIZED: '#FFFFFF',
};

export default function ZeroPointExperience() {
  const { gravity, isAtZeroPoint, isVoid, toggleHexagramLine, hexagram } = usePolarity();
  
  // Try to get depth context (may not exist if not wrapped)
  let depthLevel = 0;
  try {
    const depth = useDepth();
    depthLevel = depth?.currentDepth || 0;
  } catch {
    depthLevel = 0;
  }
  
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
    forceFlickerStop,
  } = useZeroPointFlicker({
    enabled: true,
    hapticEnabled: true,
    audioEnabled: true,
    chineseDialect: 'zh-cmn',
  });
  
  // Sentient Registry V2 — behavioral memory + expanded anomalies
  const {
    currentStability,
    stabilityLevel,
    flickerMultiplier,
    hapticStyle,
    breadcrumbs,
    depthHapticProfile,
    fireDepthHaptic,
    activeAnomaly,
    hasActiveAnomaly,
    triggerAnomaly,
    selectAnomaly,
    currentVisits,
  } = useSentientRegistryV2({
    gravity,
    currentLanguage: currentFlickerLang?.code || 'en',
    currentHexagram: currentHexagram?.number || 63,
    depthLevel,
    isAtZeroPoint,
    isVoid,
    onAnomaly: handleAnomaly,
  });
  
  // Anomaly effects state
  const [anomalyEffect, setAnomalyEffect] = useState(null);
  const [bleedLanguage, setBleedLanguage] = useState(null);
  const [showGhosting, setShowGhosting] = useState(false);
  const [temporalMultiplier, setTemporalMultiplier] = useState(1);
  
  // Handle anomaly events
  function handleAnomaly(anomaly) {
    setAnomalyEffect(anomaly.id);
    
    switch (anomaly.id) {
      case 'language_bleed':
        const languages = ['sa', 'lkt', 'ja', 'zh-cmn', 'es', 'hi'];
        const bleed = languages[Math.floor(Math.random() * languages.length)];
        setBleedLanguage(bleed);
        break;
        
      case 'ghosting':
        setShowGhosting(true);
        break;
        
      case 'hexagram_mutation':
        const randomLine = Math.floor(Math.random() * 6);
        toggleHexagramLine(randomLine);
        break;
        
      case 'temporal_stutter':
        setTemporalMultiplier(anomaly.rateMultiplier || 1);
        break;
        
      case 'void_whisper':
        forceFlickerStop();
        break;
        
      case 'haptic_shift':
        fireDepthHaptic();
        break;
        
      default:
        break;
    }
    
    // Clear effect after anomaly duration
    setTimeout(() => {
      setAnomalyEffect(null);
      setBleedLanguage(null);
      setShowGhosting(false);
      setTemporalMultiplier(1);
    }, anomaly.duration || 1000);
  }
  
  // Don't render anything if not at Zero Point
  if (!isAtZeroPoint && !isSourceState) return null;
  
  const stabilityColor = STABILITY_COLORS[stabilityLevel] || '#C9A962';
  
  return (
    <>
      {/* Layer 0: Ghosting Overlay (breadcrumb trail) */}
      <GhostingOverlay 
        breadcrumbs={breadcrumbs} 
        visible={showGhosting || anomalyEffect === 'ghosting'}
      />
      
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
              animationDuration: `${50 * temporalMultiplier * flickerMultiplier}ms`,
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
            
            {/* Convergence effect - flash all */}
            {anomalyEffect === 'convergence' && (
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                {currentFlickerLang.category}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Layer 3: Sentience & Stability Indicator */}
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
                background: 'transparent',
                backdropFilter: 'none',
                border: `1px solid ${stabilityColor}40`,
                boxShadow: `0 0 15px ${stabilityColor}30`,
              }}
            >
              {/* Stability level */}
              <div className="flex items-center gap-2">
                <span 
                  className="text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: stabilityColor }}
                >
                  {stabilityLevel}
                </span>
                
                {/* Visit counter */}
                <span 
                  className="text-[9px] px-1.5 py-0.5 rounded"
                  style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {currentVisits} visits
                </span>
              </div>
              
              {/* Haptic style indicator */}
              <div 
                className="text-[8px] uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                {hapticStyle} · Depth {depthLevel}
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
      
      {/* Layer 4: Source State Indicator */}
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
                background: 'transparent',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.6)',
                backdropFilter: 'none',
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
