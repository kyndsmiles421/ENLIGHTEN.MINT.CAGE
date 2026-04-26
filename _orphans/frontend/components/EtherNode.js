/**
 * EtherNode.js — Gear-Driven Rotational Nodule System
 * 
 * THE WEB ARCHITECTURE:
 * Each node exists on a dual-layer system:
 * - Base Layer: translateZ(-500px), opacity 0.4, dim
 * - Ether Layer: translateZ(0px), opacity 1.0, bright
 * 
 * The CW/CCW Gear System drives rotation while the "Pull" mechanic
 * shifts nodes between layers with a satisfying haptic click.
 */

import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGearSystem } from '../utils/HarmonicResonance';

// ═══ ETHER NODE COMPONENT ═══
const EtherNode = memo(function EtherNode({ 
  id, 
  label, 
  icon: Icon,
  color = '#00FFC2',
  angle = 0,           // Position angle in radians
  radius = 200,        // Distance from center
  onExtract,           // Callback when extracted
  onNavigate,          // Callback when navigated to
  initialExtracted = false,
}) {
  const [isExtracted, setIsExtracted] = useState(initialExtracted);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get gear rotation (CW and CCW interlocking)
  const { getRotation, subscribeToGears, PHI } = useGearSystem(0.008);
  const [gearAngle, setGearAngle] = React.useState(0);
  
  // Subscribe to gear updates for rotation
  React.useEffect(() => {
    const unsubscribe = subscribeToGears((rotation) => {
      // Use the CW rotation for primary nodes
      setGearAngle(rotation.cw);
    });
    return unsubscribe;
  }, [subscribeToGears]);

  // Calculate position based on angle + gear rotation
  const currentAngle = angle + gearAngle;
  const x = Math.cos(currentAngle) * radius;
  const y = Math.sin(currentAngle) * radius;

  // Handle the "Pull" — shifts between base and ether layers
  const handleClick = useCallback(() => {
    const newState = !isExtracted;
    setIsExtracted(newState);
    
    // Haptic feedback: feels like a physical gear click
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(newState ? [10, 30, 10] : [5, 15, 5]);
    }
    
    // Notify parent
    if (newState && onExtract) {
      onExtract(id);
    }
  }, [isExtracted, id, onExtract]);

  // Handle navigation (tap when already extracted)
  const handleDoubleClick = useCallback(() => {
    if (isExtracted && onNavigate) {
      // Strong haptic for navigation
      if (window.navigator?.vibrate) {
        window.navigator.vibrate([30, 15, 50]);
      }
      onNavigate(id);
    }
  }, [isExtracted, id, onNavigate]);

  return (
    <motion.div 
      className="ether-node"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-node-id={id}
      data-extracted={isExtracted}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        cursor: 'pointer',
        mixBlendMode: 'screen',
        pointerEvents: 'auto',
        color: color,
        // GPU-accelerated 3D transforms
        transform: `
          translate(-50%, -50%)
          translate3d(${x}px, ${y}px, ${isExtracted ? '0px' : '-500px'})
          scale(${isExtracted ? 1 : 0.6})
        `,
        opacity: isExtracted ? 1 : 0.4,
        filter: isExtracted 
          ? `brightness(1.5) drop-shadow(0 0 12px ${color})` 
          : 'brightness(0.7)',
        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: isExtracted ? 30 : 10,
      }}
      animate={{
        scale: isHovered && isExtracted ? 1.15 : isExtracted ? 1 : 0.6,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Node Content */}
      <div 
        className="node-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          textShadow: isExtracted 
            ? `0 0 20px ${color}, 0 0 40px #A855F7` 
            : 'none',
        }}
      >
        {/* Icon */}
        {Icon && (
          <div
            style={{
              width: isExtracted ? 48 : 32,
              height: isExtracted ? 48 : 32,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${color}22, ${color}08)`,
              border: `1px solid ${color}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.5s ease',
            }}
          >
            <Icon 
              size={isExtracted ? 24 : 16} 
              style={{ color: color }}
            />
          </div>
        )}
        
        {/* Label */}
        <span
          style={{
            fontSize: isExtracted ? '12px' : '9px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            transition: 'all 0.5s ease',
            opacity: isExtracted ? 1 : 0.7,
          }}
        >
          {label}
        </span>
        
        {/* Tap to Enter hint (only when extracted) */}
        <AnimatePresence>
          {isExtracted && (
            <motion.span
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: [0.5, 1, 0.5], y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ 
                opacity: { duration: 1.5, repeat: Infinity },
                y: { duration: 0.3 }
              }}
              style={{
                fontSize: '8px',
                color: '#A855F7',
                letterSpacing: '0.1em',
              }}
            >
              TAP TO ENTER
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// ═══ ETHER WEB CONTAINER ═══
// Renders multiple EtherNodes in a circular arrangement
export function EtherWeb({ 
  nodes = [], 
  radius = 200,
  onNodeExtract,
  onNodeNavigate,
  gearSpeed = 0.008,
}) {
  const [extractedCount, setExtractedCount] = useState(0);
  
  const handleExtract = useCallback((nodeId) => {
    setExtractedCount(prev => prev + 1);
    onNodeExtract?.(nodeId);
  }, [onNodeExtract]);

  return (
    <div 
      className="ether-web"
      style={{
        position: 'relative',
        width: radius * 2 + 100,
        height: radius * 2 + 100,
        perspective: '1200px',
        perspectiveOrigin: 'center center',
      }}
    >
      {/* Global Styles */}
      <style>{`
        .ether-web {
          transform-style: preserve-3d;
        }
        
        /* Interlocking aura effect when nodes are close */
        .ether-node[data-extracted="true"] ~ .ether-node[data-extracted="true"] {
          filter: brightness(1.6) saturate(1.2);
        }
        
        /* Resonance pulse for all extracted nodes */
        @keyframes ether-pulse {
          0%, 100% { box-shadow: 0 0 20px currentColor; }
          50% { box-shadow: 0 0 40px currentColor, 0 0 60px #A855F7; }
        }
        
        .ether-node[data-extracted="true"] .node-content {
          animation: ether-pulse 3s ease-in-out infinite;
        }
      `}</style>
      
      {/* Render nodes */}
      {nodes.map((node, index) => {
        // Calculate angle based on position in array
        const angle = (index / nodes.length) * Math.PI * 2 - Math.PI / 2;
        
        return (
          <EtherNode
            key={node.id}
            id={node.id}
            label={node.name}
            icon={node.icon}
            color={node.color}
            angle={angle}
            radius={radius}
            onExtract={handleExtract}
            onNavigate={onNodeNavigate}
          />
        );
      })}
      
      {/* Extracted Count HUD */}
      {extractedCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#A855F7',
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        >
          {extractedCount}
        </div>
      )}
    </div>
  );
}

export default EtherNode;
