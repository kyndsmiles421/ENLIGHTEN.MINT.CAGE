/**
 * GhostingOverlay.js — Breadcrumb Trail Visualization
 * 
 * THE GHOSTING EFFECT
 * 
 * Shows a faint trail of the user's last N positions through the 9×9 lattice.
 * Each ghost fades based on recency (older = more transparent).
 * 
 * Creates a visual "path through the garden" showing the user's journey.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HEXAGRAM_REGISTRY } from '../config/hexagramRegistry';
import { LANGUAGE_REGISTRY } from '../config/languageRegistry';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GHOST POSITION COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GhostPosition = React.memo(({ 
  coordinate, 
  index, 
  total, 
  gravity,
}) => {
  // Parse coordinate
  const [langCode, hexNum] = coordinate.split(':');
  const hex = HEXAGRAM_REGISTRY[parseInt(hexNum)];
  const lang = LANGUAGE_REGISTRY[langCode];
  
  if (!hex || !lang) return null;
  
  // Opacity based on recency (oldest = most faded)
  const recencyFactor = (index + 1) / total;
  const opacity = 0.1 + recencyFactor * 0.25; // 0.1 to 0.35
  
  // Position offset based on gravity at time of visit
  const offsetX = (gravity - 0.5) * 100; // -50 to +50 px
  
  return (
    <motion.div
      className="absolute flex items-center gap-2 pointer-events-none"
      style={{
        opacity,
        transform: `translateX(${offsetX}px)`,
        filter: `blur(${(1 - recencyFactor) * 2}px)`,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hexagram symbol */}
      <span 
        className="text-2xl"
        style={{ 
          color: hex.glowColor,
          textShadow: `0 0 ${10 * recencyFactor}px ${hex.glowColor}`,
        }}
      >
        {hex.symbol}
      </span>
      
      {/* Language glyph */}
      <span 
        className="text-lg"
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        {lang.zeroPoint?.flickerGlyph || '∿'}
      </span>
    </motion.div>
  );
});

GhostPosition.displayName = 'GhostPosition';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONNECTING LINES (Path visualization)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GhostPath = React.memo(({ breadcrumbs }) => {
  // Create SVG path
  const pathD = useMemo(() => {
    if (breadcrumbs.length < 2) return '';
    
    const points = breadcrumbs.map((crumb, i) => {
      const x = 50 + (crumb.gravity - 0.5) * 80 + i * 30;
      const y = 30 + i * 25;
      return { x, y };
    });
    
    if (points.length < 2) return '';
    
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Bezier curve for smooth path
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      d += ` Q ${cpX} ${prev.y} ${curr.x} ${curr.y}`;
    }
    
    return d;
  }, [breadcrumbs]);
  
  // Don't render if path is empty
  if (!pathD) return null;
  
  return (
    <svg 
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ opacity: 0.3 }}
    >
      <defs>
        <linearGradient id="ghostPathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,215,0,0.4)" />
        </linearGradient>
      </defs>
      
      <motion.path
        d={pathD}
        stroke="url(#ghostPathGradient)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="5,5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  );
});

GhostPath.displayName = 'GhostPath';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN GHOSTING OVERLAY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function GhostingOverlay({ 
  breadcrumbs = [], 
  visible = false,
  style = {},
}) {
  if (!visible || breadcrumbs.length === 0) return null;
  
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ 
        zIndex: 99970,
        ...style,
      }}
    >
      {/* Path connecting breadcrumbs */}
      <GhostPath breadcrumbs={breadcrumbs} />
      
      {/* Individual ghost positions */}
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2">
        <AnimatePresence>
          {breadcrumbs.map((crumb, index) => (
            <div
              key={`${crumb.coordinate}-${crumb.timestamp}`}
              style={{
                position: 'absolute',
                top: index * 30,
                left: (crumb.gravity - 0.5) * 80,
              }}
            >
              <GhostPosition
                coordinate={crumb.coordinate}
                index={index}
                total={breadcrumbs.length}
                gravity={crumb.gravity}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Trail label */}
      <motion.div
        className="absolute top-16 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.5 }}
      >
        <span 
          className="text-[10px] uppercase tracking-[0.3em]"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Your Path
        </span>
      </motion.div>
    </div>
  );
}

export { GhostPosition, GhostPath };
