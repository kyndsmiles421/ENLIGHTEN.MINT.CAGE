/**
 * CRYSTAL RADIANCE VISUALIZER
 * ============================
 * 
 * Visual representation of the Central Crystal with:
 * - Infinite Radiance Buffer glow effect
 * - Torque-driven 3D rotation
 * - Frequency-responsive intensity
 * - Lead Shed effect on GROUNDED signals
 * - 72-bit seed display
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCrystalResonance } from '../hooks/useCrystalResonance';

// Frequency to intensity mapping
const getIntensity = (freq) => {
  if (freq === 0) return 0.5;
  if (freq < 200) return 1.0;
  if (freq < 500) return 1.5;
  if (freq < 700) return 2.0;
  if (freq < 900) return 2.5;
  return 3.0;
};

// Source to CSS class mapping
const getSourceClass = (source) => {
  const normalized = source?.toLowerCase().replace(/\s+/g, '_') || 'void';
  return `crystal-source-${normalized}`;
};

export default function CrystalRadianceVisualizer({ 
  size = 120,
  showSeed = true,
  showFrequency = true,
  showRings = true,
  className = '',
}) {
  const {
    freq,
    torque,
    activeSource,
    isTransitioning,
    sourceInfo,
    lastSeed,
    guardrailResult,
    latticeStyle,
  } = useCrystalResonance({ pollInterval: 100 });

  const [isGrounded, setIsGrounded] = useState(false);
  const [isElevated, setIsElevated] = useState(false);
  const containerRef = useRef(null);

  // Listen for grounded events
  useEffect(() => {
    const handleGrounded = (e) => {
      setIsGrounded(true);
      setTimeout(() => setIsGrounded(false), 800);
    };

    window.addEventListener('crystal-grounded', handleGrounded);
    return () => window.removeEventListener('crystal-grounded', handleGrounded);
  }, []);

  // Detect elevated state from guardrail
  useEffect(() => {
    if (guardrailResult?.state === 'elevated') {
      setIsElevated(true);
      setTimeout(() => setIsElevated(false), 2000);
    }
  }, [guardrailResult]);

  // Update CSS variables for torque
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--crystal-torque', `${torque}deg`);
      containerRef.current.style.setProperty('--tesseract-intensity', getIntensity(freq));
      containerRef.current.style.setProperty('--crystal-frequency', freq);
    }
  }, [torque, freq]);

  const sourceClass = getSourceClass(activeSource);
  const intensity = getIntensity(freq);

  return (
    <div 
      ref={containerRef}
      className={`crystal-radiance-container ${className}`}
      data-testid="crystal-radiance-visualizer"
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Frequency Rings */}
      {showRings && (
        <div className={`absolute inset-0 ${sourceClass}`}>
          <div className="frequency-ring" />
          <div className="frequency-ring" />
          <div className="frequency-ring" />
          <div className="frequency-ring" />
        </div>
      )}

      {/* Main Crystal Core with Torque */}
      <motion.div
        className={`
          crystal-core 
          ${sourceClass}
          ${isTransitioning ? 'tesseract-glow' : ''}
          ${isGrounded ? 'crystal-grounded' : ''}
          ${isElevated ? 'crystal-elevated' : ''}
        `}
        style={{
          width: size * 0.6,
          height: size * 0.6,
          ...latticeStyle,
        }}
        animate={{
          rotateY: torque,
          scale: isTransitioning ? [1, 1.05, 1] : 1,
        }}
        transition={{
          rotateY: { duration: 0.1, ease: 'easeOut' },
          scale: { duration: 0.5, repeat: isTransitioning ? Infinity : 0 },
        }}
      >
        {/* Inner Glow Layer */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at center, ${sourceInfo?.color || '#fff'}44 0%, transparent 70%)`,
            animation: isTransitioning ? 'radiance-pulse 4s infinite ease-in-out' : 'none',
          }}
        />
      </motion.div>

      {/* Frequency Display */}
      {showFrequency && (
        <motion.div
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: sourceInfo?.color || '#fff',
            textShadow: `0 0 10px ${sourceInfo?.color || '#fff'}66`,
            whiteSpace: 'nowrap',
          }}
        >
          {freq.toFixed(1)} Hz
        </motion.div>
      )}

      {/* Seed Display */}
      <AnimatePresence>
        {showSeed && lastSeed && (
          <motion.div
            className="seed-display absolute -top-6 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {lastSeed}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Source Label */}
      <div 
        className="absolute top-full mt-8 text-center"
        style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {sourceInfo?.emoji} {activeSource}
      </div>

      {/* Transitioning Indicator */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="absolute -bottom-10 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              fontSize: 10,
              color: sourceInfo?.color || '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}
          >
            Harmonizing...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact inline version for toolbars
export function CrystalRadianceBadge({ size = 32 }) {
  const { freq, torque, sourceInfo, isTransitioning } = useCrystalResonance({ 
    pollInterval: 150 
  });

  return (
    <div 
      className="crystal-radiance-badge flex items-center gap-2"
      data-testid="crystal-radiance-badge"
    >
      <motion.div
        className={`crystal-core ${isTransitioning ? 'tesseract-glow' : ''}`}
        style={{
          width: size,
          height: size,
          transform: `rotateY(${torque}deg)`,
        }}
        animate={{
          scale: isTransitioning ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 0.5, repeat: isTransitioning ? Infinity : 0 }}
      />
      <span 
        className="text-xs font-medium"
        style={{ color: sourceInfo?.color || '#fff' }}
      >
        {freq.toFixed(0)} Hz
      </span>
    </div>
  );
}
