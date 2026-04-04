/**
 * RecursivePortal.js — The Dive Interface
 * 
 * Handles the pinch-to-zoom gesture and breadcrumb navigation overlay.
 * This is the "window" through which users dive into the recursive Hexagram layers.
 * 
 * FEATURES:
 * - Pinch-in (with line selected) = DIVE deeper
 * - Pinch-out = SURFACE one level
 * - Tap breadcrumb = Jump to that depth instantly
 * - Ghost trail shows full path through the recursion
 * 
 * VISUAL:
 * - Depth indicator bar (0-5 levels)
 * - Breadcrumb trail with line colors
 * - Dive/Surface animations
 * - Line-flavor tinting at each depth
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useDepth, LINE_FLAVORS, MAX_DEPTH } from '../context/DepthContext';
import { usePolarity } from '../context/PolarityContext';
import { ChevronUp, ChevronDown, Home, Layers } from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BREADCRUMB TRAIL COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BreadcrumbTrail = React.memo(({ breadcrumbs, onJumpTo, currentDepth }) => {
  if (breadcrumbs.length === 0) return null;
  
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Macro (Surface) button */}
      <motion.button
        onClick={() => onJumpTo(0)}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium"
        style={{
          background: currentDepth === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
          color: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        whileHover={{ background: 'rgba(255,255,255,0.15)' }}
        whileTap={{ scale: 0.95 }}
        data-testid="breadcrumb-macro"
      >
        <Home size={10} />
        <span>Macro</span>
      </motion.button>
      
      {/* Breadcrumb entries */}
      {breadcrumbs.map((crumb, index) => {
        const flavor = LINE_FLAVORS[crumb.line];
        const isActive = index === breadcrumbs.length - 1;
        
        return (
          <React.Fragment key={`${crumb.depth}-${crumb.timestamp}`}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
            <motion.button
              onClick={() => onJumpTo(crumb.depth + 1)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium"
              style={{
                background: isActive ? `${flavor?.color}20` : 'transparent',
                color: flavor?.color || 'rgba(255,255,255,0.7)',
                border: `1px solid ${isActive ? `${flavor?.color}40` : 'rgba(255,255,255,0.1)'}`,
              }}
              whileHover={{ 
                background: `${flavor?.color}30`,
                borderColor: `${flavor?.color}60`,
              }}
              whileTap={{ scale: 0.95 }}
              data-testid={`breadcrumb-${index}`}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ background: flavor?.color }}
              />
              <span>{crumb.lineName}</span>
              <span style={{ opacity: 0.5 }}>#{crumb.hexagram}</span>
            </motion.button>
          </React.Fragment>
        );
      })}
    </div>
  );
});

BreadcrumbTrail.displayName = 'BreadcrumbTrail';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEPTH INDICATOR BAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DepthBar = React.memo(({ depth, maxDepth, cumulativeFlavor }) => {
  const levels = Array.from({ length: maxDepth + 1 }, (_, i) => i);
  
  return (
    <div className="flex items-center gap-1">
      {levels.map((level) => {
        const flavor = LINE_FLAVORS[level];
        const isActive = level <= depth;
        const isCurrent = level === depth;
        
        return (
          <motion.div
            key={level}
            className="relative"
            style={{
              width: 6,
              height: isCurrent ? 16 : 12,
              borderRadius: 3,
              background: isActive 
                ? flavor?.color || 'rgba(255,255,255,0.5)'
                : 'rgba(255,255,255,0.1)',
              boxShadow: isCurrent ? `0 0 8px ${flavor?.color}` : 'none',
            }}
            animate={{
              scale: isCurrent ? 1.2 : 1,
              opacity: isActive ? 1 : 0.4,
            }}
            transition={{ duration: 0.2 }}
            title={`Level ${level}: ${flavor?.name || 'Surface'}`}
          />
        );
      })}
      
      {/* Current depth label */}
      <span 
        className="text-[9px] font-mono ml-2"
        style={{ 
          color: LINE_FLAVORS[depth]?.color || 'rgba(255,255,255,0.7)',
        }}
      >
        d={depth}
      </span>
    </div>
  );
});

DepthBar.displayName = 'DepthBar';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN RECURSIVE PORTAL COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function RecursivePortal({ children }) {
  const {
    depth,
    breadcrumbs,
    selectedLine,
    isDiving,
    isSurfacing,
    canDive,
    canSurface,
    cumulativeFlavor,
    currentLineFlavor,
    handlePinchStart,
    handlePinchMove,
    handlePinchEnd,
    surfaceTo,
    surfaceToMacro,
    dive,
    surface,
  } = useDepth();
  
  const { isVoid, supernovaActive } = usePolarity();
  const location = useLocation();
  
  // Only show portal controls on relevant pages (not on dashboard/home)
  const portalPages = ['/recursive', '/portal', '/tesseract', '/dive'];
  const isPortalPage = portalPages.some(p => location.pathname.startsWith(p)) || depth > 0;
  
  const containerRef = useRef(null);
  const touchesRef = useRef([]);
  const [showControls, setShowControls] = useState(true);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PINCH GESTURE DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const getDistance = (touches) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      touchesRef.current = Array.from(e.touches);
      const distance = getDistance(touchesRef.current);
      handlePinchStart(distance);
    }
  }, [handlePinchStart]);
  
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      const distance = getDistance(Array.from(e.touches));
      handlePinchMove(distance);
    }
  }, [handlePinchMove]);
  
  const handleTouchEnd = useCallback(() => {
    touchesRef.current = [];
    handlePinchEnd();
  }, [handlePinchEnd]);
  
  // Mouse wheel as alternative to pinch (for desktop)
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY > 0 && canSurface) {
        // Scroll down + ctrl = surface
        surface();
      } else if (e.deltaY < 0 && canDive) {
        // Scroll up + ctrl = dive
        dive();
      }
    }
  }, [canDive, canSurface, dive, surface]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && canSurface) {
        surfaceToMacro();
      } else if (e.key === 'Enter' && canDive) {
        dive();
      } else if (e.key === 'Backspace' && canSurface) {
        surface();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canDive, canSurface, dive, surface, surfaceToMacro]);
  
  // Jump to breadcrumb
  const handleJumpTo = useCallback((targetDepth) => {
    if (targetDepth === 0) {
      surfaceToMacro();
    } else {
      surfaceTo(targetDepth);
    }
  }, [surfaceTo, surfaceToMacro]);
  
  // Determine portal overlay color based on depth
  const portalColor = cumulativeFlavor?.primaryColor || 'transparent';
  const portalOpacity = depth > 0 ? 0.05 + (depth / MAX_DEPTH) * 0.1 : 0;
  
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      data-testid="recursive-portal"
    >
      {/* Depth overlay tint */}
      <AnimatePresence>
        {depth > 0 && (
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${portalColor}${Math.round(portalOpacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
              zIndex: 9970,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      
      {/* Dive/Surface animation overlay */}
      <AnimatePresence>
        {(isDiving || isSurfacing) && (
          <motion.div
            className="fixed inset-0 pointer-events-none flex items-center justify-center"
            style={{ zIndex: 9971 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-32 h-32 rounded-full"
              style={{
                background: `radial-gradient(circle, ${currentLineFlavor?.color || '#FFD700'}40 0%, transparent 70%)`,
                border: `2px solid ${currentLineFlavor?.color || '#FFD700'}60`,
              }}
              animate={{
                scale: isDiving ? [1, 0.5, 0] : [0, 0.5, 1],
                opacity: [1, 0.8, 0],
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
            
            {/* Direction indicator */}
            <motion.div
              className="absolute text-center"
              style={{ color: currentLineFlavor?.color || '#FFD700' }}
              initial={{ opacity: 0, y: isDiving ? -20 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {isDiving ? (
                <ChevronDown size={32} />
              ) : (
                <ChevronUp size={32} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Breadcrumb & Controls HUD - Only show on portal pages or when at depth */}
      {showControls && isPortalPage && !isVoid && !supernovaActive && (
        <motion.div
          className="fixed top-12 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 rounded-xl"
          style={{
            background: 'rgba(20, 20, 30, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          data-testid="depth-hud"
        >
          <div className="flex flex-col gap-2">
            {/* Depth bar */}
            <DepthBar 
              depth={depth} 
              maxDepth={MAX_DEPTH}
              cumulativeFlavor={cumulativeFlavor}
            />
            
            {/* Breadcrumb trail */}
            {breadcrumbs.length > 0 && (
              <BreadcrumbTrail
                breadcrumbs={breadcrumbs}
                onJumpTo={handleJumpTo}
                currentDepth={depth}
              />
            )}
            
            {/* Action hints */}
            <div className="flex items-center gap-3 text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {selectedLine !== null ? (
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-white/10">Pinch in</kbd> to dive into {LINE_FLAVORS[selectedLine]?.name}
                </span>
              ) : depth > 0 ? (
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-white/10">Pinch out</kbd> to surface
                </span>
              ) : (
                <span>Tap a hexagram line to select, then pinch to dive</span>
              )}
              
              {/* Keyboard shortcuts hint */}
              <span className="opacity-50">
                [Enter: dive | Backspace: surface | Esc: macro]
              </span>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Quick surface button (visible at depth > 0) */}
      <AnimatePresence>
        {depth > 0 && !isVoid && (
          <motion.button
            onClick={surfaceToMacro}
            className="fixed bottom-40 left-4 z-[80] flex items-center gap-2 px-3 py-2 rounded-full"
            style={{
              background: 'rgba(8, 8, 15, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
            whileTap={{ scale: 0.95 }}
            data-testid="surface-macro-btn"
          >
            <Layers size={14} style={{ color: LINE_FLAVORS[0].color }} />
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Surface (d=0)
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Children (the actual app content) */}
      {children}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEPTH INDICATOR BADGE (Compact version for toolbars)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function DepthBadge() {
  const { depth, currentLineFlavor, canDive, canSurface } = useDepth();
  
  if (depth === 0) return null;
  
  return (
    <motion.div
      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium"
      style={{
        background: `${currentLineFlavor?.color}20`,
        color: currentLineFlavor?.color,
        border: `1px solid ${currentLineFlavor?.color}40`,
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      data-testid="depth-badge"
    >
      <Layers size={10} />
      <span>d={depth}</span>
    </motion.div>
  );
}
