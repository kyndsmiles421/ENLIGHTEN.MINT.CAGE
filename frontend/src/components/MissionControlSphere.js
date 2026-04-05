/**
 * MISSION CONTROL SPHERE
 * 
 * A fully 3D spherical command deck with:
 * - Fibonacci-distributed nodule positions
 * - Auto-rotating stage
 * - Harmonic resonance synchronization
 * - Depth-based opacity and z-indexing
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { projectToSphere, calculateDepthIndex } from '../utils/SphericalProjector';
import { useHarmonicResonance } from '../utils/HarmonicResonance';

const MissionControlSphere = ({ 
  nodules = [], 
  radius = 300,
  autoRotate = true,
  rotationSpeed = 60, // seconds per full rotation
  onNoduleClick,
}) => {
  const navigate = useNavigate();
  const { resonance, frequencyData, cycle } = useHarmonicResonance();
  const [hoveredId, setHoveredId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  // Project all nodules onto the sphere
  const projectedNodules = useMemo(() => 
    nodules.map((n, i) => ({
      ...n,
      coords: projectToSphere(i, nodules.length, radius)
    })), [nodules, radius]);

  // Handle nodule interaction
  const handleNoduleClick = (nodule) => {
    if (onNoduleClick) {
      onNoduleClick(nodule);
    } else if (nodule.path) {
      navigate(nodule.path);
    }
  };

  return (
    <div 
      className="mission-control-viewport"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div 
        className="spherical-stage"
        style={{
          animationPlayState: isPaused ? 'paused' : 'running',
          animationDuration: `${rotationSpeed}s`,
        }}
        initial={{ rotateY: 0 }}
      >
        {/* Projected Nodules */}
        {projectedNodules.map((nodule, idx) => {
          const isHovered = hoveredId === nodule.id;
          const zIndex = calculateDepthIndex(nodule.coords.z, radius);
          
          return (
            <motion.div
              key={nodule.id || idx}
              className="projected-nodule"
              style={{
                zIndex: isHovered ? 1000 : zIndex,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                x: nodule.coords.x, 
                y: nodule.coords.y, 
                z: nodule.coords.z,
                rotateY: nodule.coords.rotationY,
                rotateX: nodule.coords.rotationX,
                scale: isHovered ? 1.3 : 1, 
                opacity: nodule.coords.opacity,
              }}
              transition={{ 
                duration: 1.5, 
                ease: "circOut",
                delay: idx * 0.05,
              }}
              whileHover={{ scale: 1.3, opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setHoveredId(nodule.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleNoduleClick(nodule)}
              data-testid={`sphere-nodule-${nodule.id}`}
            >
              {/* The Interlocking Aura Layer */}
              <div 
                className="nodule-vibration" 
                style={{ 
                  '--pulse-speed': nodule.pulse || '4s',
                  background: `radial-gradient(circle, ${nodule.color || 'rgba(255,255,255,0.4)'} 0%, transparent 70%)`,
                }} 
              />
              
              {/* Nodule Content */}
              <div className="nodule-content">
                <span className="icon" style={{ color: nodule.color }}>
                  {nodule.icon}
                </span>
                <label className="label">{nodule.label}</label>
              </div>
            </motion.div>
          );
        })}
        
        {/* The Core Harmonic Indicator */}
        <motion.div 
          className="central-resonance-core"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <div 
            className="core-glow"
            style={{
              background: frequencyData?.color 
                ? `radial-gradient(circle, ${frequencyData.color} 0%, transparent 70%)`
                : 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)',
            }}
          />
          <div 
            className="hertz-display"
            onClick={() => cycle('up')}
          >
            <span className="hertz-value">{resonance || '∞'}</span>
            <span className="hertz-label">
              {frequencyData?.name || 'FREE'}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredId && (
          <motion.div
            className="sphere-tooltip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {projectedNodules.find(n => n.id === hoveredId)?.description || 
             projectedNodules.find(n => n.id === hoveredId)?.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resonance Status */}
      {resonance && (
        <div className="resonance-status">
          <span style={{ color: frequencyData?.color }}>
            {resonance}Hz · {frequencyData?.name}
          </span>
        </div>
      )}
    </div>
  );
};

export default MissionControlSphere;
