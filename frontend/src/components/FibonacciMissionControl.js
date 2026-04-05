/**
 * FIBONACCI MISSION CONTROL
 * 
 * A Golden Spiral web layout for nodules with animated tether connections.
 * Creates organic, nature-inspired distributions (like sunflower seeds).
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  calculateFibonacciWeb, 
  generateSmoothSpiralPath,
  generateGalaxyArms 
} from '../utils/FibonacciWeb';
import { useHarmonicResonance } from '../utils/HarmonicResonance';

const FibonacciMissionControl = ({ 
  nodules = [], 
  scale = 60,
  size = 1000,
  showTethers = true,
  galaxyMode = false,
  onNoduleClick,
}) => {
  const navigate = useNavigate();
  const { resonance, frequencyData, cycle } = useHarmonicResonance();
  const [hoveredId, setHoveredId] = useState(null);
  const center = size / 2;

  // Calculate positions using Fibonacci spiral
  const points = useMemo(() => 
    calculateFibonacciWeb(nodules.length, scale), 
    [nodules.length, scale]
  );

  // Generate galaxy arms if in galaxy mode
  const galaxyArms = useMemo(() => 
    galaxyMode ? generateGalaxyArms(Math.ceil(nodules.length / 3), 3, scale) : null,
    [galaxyMode, nodules.length, scale]
  );

  // Generate spiral path for tethers
  const spiralPath = useMemo(() => 
    generateSmoothSpiralPath(points, center, center),
    [points, center]
  );

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
      className="web-container"
      style={{ width: size, height: size }}
    >
      {/* SVG Tether Connections */}
      {showTethers && (
        <svg className="web-tethers" viewBox={`0 0 ${size} ${size}`}>
          {/* Main spiral path */}
          <path 
            d={spiralPath}
            className="spiral-path"
          />
          
          {/* Secondary spiral (offset for depth) */}
          <path 
            d={spiralPath}
            className="spiral-path"
            style={{ 
              stroke: 'rgba(167, 139, 250, 0.15)',
              strokeDasharray: '3, 20',
              transform: 'rotate(30deg)',
              transformOrigin: 'center',
            }}
          />

          {/* Connection lines to center */}
          {points.map((point, i) => (
            <line
              key={`tether-${i}`}
              x1={center}
              y1={center}
              x2={point.x + center}
              y2={point.y + center}
              stroke={`rgba(251, 192, 45, ${0.05 + (i / points.length) * 0.1})`}
              strokeWidth="0.5"
              className="tether-line"
            />
          ))}
        </svg>
      )}

      {/* Central Core */}
      <motion.div
        className="web-core"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
        }}
      >
        <div 
          className="core-aura"
          style={{
            background: frequencyData?.color 
              ? `radial-gradient(circle, ${frequencyData.color}40 0%, transparent 70%)`
              : 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)',
          }}
        />
        <div 
          className="core-display"
          onClick={() => cycle('up')}
        >
          <span className="hz-value">{resonance || '∞'}</span>
          <span className="hz-name">{frequencyData?.name || 'FREE'}</span>
        </div>
      </motion.div>

      {/* Fibonacci Nodules */}
      {nodules.map((nodule, i) => {
        const point = points[i];
        if (!point) return null;
        
        const isHovered = hoveredId === nodule.id;

        return (
          <motion.div 
            key={nodule.id || i}
            className="web-nodule"
            style={{
              left: center,
              top: center,
              zIndex: isHovered ? 50 : 10 + i,
              '--nodule-color': nodule.color,
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 0, 
              opacity: 0 
            }}
            animate={{ 
              x: point.x, 
              y: point.y, 
              scale: isHovered ? 1.2 : 1, 
              opacity: 1,
            }}
            transition={{ 
              duration: 0.8,
              delay: i * 0.03,
              type: 'spring',
              stiffness: 100,
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setHoveredId(nodule.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleNoduleClick(nodule)}
            data-testid={`fib-nodule-${nodule.id}`}
          >
            {/* Vibration Aura */}
            <div 
              className="nodule-vibration"
              style={{
                '--pulse-speed': nodule.pulse || `${3 + (i % 3)}s`,
                background: `radial-gradient(circle, ${nodule.color || 'rgba(255,255,255,0.4)'} 0%, transparent 70%)`,
              }}
            />
            
            {/* Nodule Core */}
            <div className="nodule-core">
              <span className="icon" style={{ color: nodule.color }}>
                {nodule.icon}
              </span>
              <span className="label">{nodule.label}</span>
            </div>
          </motion.div>
        );
      })}

      {/* Hover Info */}
      {hoveredId && (
        <motion.div
          className="web-tooltip"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {nodules.find(n => n.id === hoveredId)?.description || 
           nodules.find(n => n.id === hoveredId)?.label}
        </motion.div>
      )}
    </div>
  );
};

export default FibonacciMissionControl;
