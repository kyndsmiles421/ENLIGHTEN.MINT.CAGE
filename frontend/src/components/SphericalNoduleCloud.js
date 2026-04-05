/**
 * SphericalNoduleCloud — React Component
 * 
 * Renders a 3D sphere of vibrating nodules using the NoduleGenerator utilities.
 * Integrates with the Cosmic Collective's orbital navigation system.
 */

import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { calculateSphericalPosition, calculateZIndex } from '../utils/NoduleGenerator';

const SphericalNoduleCloud = ({ 
  nodules = [], 
  radius = 200,
  centerContent = null,
  onNoduleClick,
  className = '',
}) => {
  const navigate = useNavigate();

  // Calculate positions for all nodules
  const positionedNodules = useMemo(() => {
    return nodules.map((nodule, index) => {
      const position = calculateSphericalPosition(index, nodules.length, radius);
      return {
        ...nodule,
        position,
        zIndex: calculateZIndex(position.z, radius),
      };
    });
  }, [nodules, radius]);

  // Handle nodule interaction
  const handleClick = useCallback((nodule) => {
    if (onNoduleClick) {
      onNoduleClick(nodule);
    } else if (nodule.path) {
      navigate(nodule.path);
    }
  }, [onNoduleClick, navigate]);

  return (
    <div 
      className={`sphere-container ${className}`}
      style={{
        width: radius * 2.5,
        height: radius * 2.5,
        position: 'relative',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {/* Central content (optional) */}
      {centerContent && (
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ zIndex: 100 }}
        >
          {centerContent}
        </div>
      )}

      {/* Render all nodules */}
      {positionedNodules.map((nodule, idx) => (
        <motion.div
          key={nodule.id || idx}
          className="rotation-point absolute cursor-pointer"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate3d(${nodule.position.x}px, ${nodule.position.y}px, ${nodule.position.z}px)`,
            zIndex: nodule.zIndex,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: idx * 0.05, 
            duration: 0.4,
            type: 'spring',
            stiffness: 200,
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleClick(nodule)}
          data-testid={`nodule-${nodule.id || nodule.label}`}
        >
          {/* Vibration Glow Layer */}
          <div 
            className="nodule-vibration"
            style={{
              background: `radial-gradient(circle, ${nodule.color || 'rgba(255,255,255,0.4)'} 0%, transparent 75%)`,
              animationDelay: `${idx * 0.15}s`,
            }}
          />
          
          {/* Content Layer */}
          <div className="nodule-content">
            <span className="icon" style={{ color: nodule.color }}>
              {nodule.icon}
            </span>
            <span className="label">{nodule.label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SphericalNoduleCloud;
