/**
 * RecursiveLattice.js — The 9×9 Kinetic Grid Visualization
 * 
 * THE MATRIX-MANTLE SHIFT
 * 
 * Renders the nested 9×9 coordinate space with:
 * - Zoom-Snatch collapse/expand animations (GRAVITY-REACTIVE at 1.0 threshold)
 * - Ghost layers of parent coordinates (10-15% opacity, persisting during transitions)
 * - Cell selection with hexagram preview
 * - Depth-aware visual styling (Macro → Core)
 * - Sentient Registry state preservation during dives
 * 
 * VISUAL LAYERS:
 * - Background: Parent ghost hexagrams (faded 10-15%, scaled up)
 * - Mid-ground: Active 9×9 lattice grid
 * - Foreground: Selected cell expansion preview + implosion animation
 * 
 * ZOOM-SNATCH PROTOCOL (Gravity-Reactive):
 * - Dive: When gravity slider hits 1.0, grid IMPLODES to center point
 * - Surface: Grid explodes outward, parent grid materializes from ghost
 * - Ghost Persistence: Previous hexagram remains visible at 10-15% opacity
 */

import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HEXAGRAM_REGISTRY, HEXAGRAM_SEQUENCE } from '../config/hexagramRegistry';
import { LANGUAGE_REGISTRY } from '../config/languageRegistry';
import { useRDive36, RDIVE_CONFIG } from '../hooks/useRDive36';
import { usePolarity } from '../context/PolarityContext';
import { ChevronUp, Layers, Gem, AlertCircle } from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRAVITY THRESHOLDS FOR ZOOM-SNATCH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DIVE_GRAVITY_THRESHOLD = 0.95; // Gravity > 0.95 triggers dive
const SURFACE_GRAVITY_THRESHOLD = 0.05; // Gravity < 0.05 triggers surface
const GHOST_OPACITY_PERSISTENT = 0.12; // 10-15% opacity for ghost persistence

// Static language array for 9-column mapping
const LATTICE_LANGUAGES = ['en', 'es', 'ja', 'zh-cmn', 'zh-yue', 'sa', 'hi', 'lkt', 'dak'];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEPTH-BASED VISUAL STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEPTH_STYLES = {
  0: { // Surface / Macro
    background: 'rgba(20, 15, 10, 0.9)',
    cellBg: 'rgba(139, 69, 19, 0.15)', // Sienna
    cellBorder: 'rgba(139, 69, 19, 0.4)',
    activeBorder: '#C9A962',
    textColor: 'rgba(255, 255, 255, 0.8)',
    glowColor: '#8B4513',
    label: 'SURFACE',
  },
  1: { // Level 1 / Earth
    background: 'rgba(15, 20, 25, 0.9)',
    cellBg: 'rgba(65, 105, 225, 0.12)', // Royal blue
    cellBorder: 'rgba(65, 105, 225, 0.35)',
    activeBorder: '#4169E1',
    textColor: 'rgba(200, 220, 255, 0.8)',
    glowColor: '#4169E1',
    label: 'DEPTH 1',
  },
  2: { // Level 2 / Water
    background: 'rgba(10, 15, 25, 0.9)',
    cellBg: 'rgba(32, 178, 170, 0.1)', // Teal
    cellBorder: 'rgba(32, 178, 170, 0.3)',
    activeBorder: '#20B2AA',
    textColor: 'rgba(180, 255, 250, 0.8)',
    glowColor: '#20B2AA',
    label: 'DEPTH 2',
  },
  3: { // Level 3 / Wind
    background: 'rgba(5, 10, 20, 0.9)',
    cellBg: 'rgba(255, 215, 0, 0.08)', // Gold
    cellBorder: 'rgba(255, 215, 0, 0.25)',
    activeBorder: '#FFD700',
    textColor: 'rgba(255, 245, 200, 0.8)',
    glowColor: '#FFD700',
    label: 'DEPTH 3',
  },
  4: { // Level 4 / Fire
    background: 'rgba(15, 5, 10, 0.9)',
    cellBg: 'rgba(255, 99, 71, 0.08)', // Tomato
    cellBorder: 'rgba(255, 99, 71, 0.25)',
    activeBorder: '#FF6347',
    textColor: 'rgba(255, 200, 200, 0.8)',
    glowColor: '#FF6347',
    label: 'DEPTH 4',
  },
  5: { // Level 5 / Core (Light)
    background: 'rgba(10, 10, 15, 0.95)',
    cellBg: 'rgba(230, 230, 250, 0.05)', // Lavender
    cellBorder: 'rgba(230, 230, 250, 0.2)',
    activeBorder: '#E6E6FA',
    textColor: 'rgba(255, 255, 255, 0.9)',
    glowColor: '#FFFFFF',
    label: 'CORE',
  },
};

// Get style for depth (clamped)
function getDepthStyle(depth) {
  const clamped = Math.min(5, Math.max(0, depth));
  return DEPTH_STYLES[clamped];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GHOST LAYER (Parent Hexagrams with 10-15% persistent opacity)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const GhostLayer = React.memo(({ ghosts, isZooming, zoomDirection }) => {
  if (!ghosts || ghosts.length === 0) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {ghosts.map((ghost, index) => (
        <motion.div
          key={`ghost-${ghost.depth}`}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            // Persistent ghost at 10-15% opacity (user requirement)
            opacity: Math.max(GHOST_OPACITY_PERSISTENT, ghost.opacity * 0.5),
            scale: ghost.scale,
            // During zoom, ghosts shift slightly for parallax
            y: isZooming && zoomDirection === 'dive' ? -20 * (index + 1) : 0,
          }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1,
            ease: 'easeInOut',
          }}
        >
          <div
            className="text-[150px] font-thin"
            style={{
              color: ghost.hexagram?.glowColor || '#FFFFFF',
              // Enforcing 10-15% opacity range for "Phenomenal Experience"
              opacity: GHOST_OPACITY_PERSISTENT,
              filter: `blur(${2 + index * 2}px)`,
              textShadow: `0 0 40px ${ghost.hexagram?.glowColor || '#FFFFFF'}30`,
            }}
          >
            {ghost.hexagram?.symbol || '☰'}
          </div>
        </motion.div>
      ))}
    </div>
  );
});

GhostLayer.displayName = 'GhostLayer';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LATTICE CELL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LatticeCell = React.memo(({ 
  row, 
  col, 
  hexagram, 
  language,
  isSelected,
  depth,
  style,
  onSelect,
  onDive,
}) => {
  const hex = HEXAGRAM_REGISTRY[HEXAGRAM_SEQUENCE[hexagram % 9]];
  const lang = LANGUAGE_REGISTRY[language];
  
  const handleClick = useCallback(() => {
    onSelect(row, col);
  }, [row, col, onSelect]);
  
  const handleDoubleClick = useCallback(() => {
    onDive(hexagram, language);
  }, [hexagram, language, onDive]);
  
  return (
    <motion.div
      className="relative cursor-pointer"
      data-testid={`rdive-cell-${row}-${col}`}
      style={{
        background: isSelected ? `${style.activeBorder}20` : style.cellBg,
        border: `1px solid ${isSelected ? style.activeBorder : style.cellBorder}`,
        borderRadius: 6,
        aspectRatio: '1',
        boxShadow: isSelected 
          ? `0 0 15px ${style.glowColor}40, inset 0 0 10px ${style.glowColor}20`
          : 'none',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      whileHover={{ 
        scale: 1.05,
        borderColor: style.activeBorder,
        boxShadow: `0 0 10px ${style.glowColor}30`,
      }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
        {/* Hexagram symbol */}
        <span 
          className="text-lg leading-none"
          style={{ 
            color: hex?.glowColor || style.textColor,
            opacity: isSelected ? 1 : 0.7,
          }}
        >
          {hex?.symbol || '☰'}
        </span>
        
        {/* Language indicator (only show if selected or on surface) */}
        {(isSelected || depth === 0) && (
          <span 
            className="text-[8px] mt-0.5 uppercase tracking-wider"
            style={{ color: style.textColor, opacity: 0.5 }}
          >
            {lang?.flag || 'EN'}
          </span>
        )}
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
          style={{ background: style.activeBorder }}
          layoutId="cell-indicator"
        />
      )}
    </motion.div>
  );
});

LatticeCell.displayName = 'LatticeCell';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9×9 LATTICE GRID
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LatticeGrid = React.memo(({ 
  depth, 
  selectedCell, 
  onSelectCell, 
  onDive,
  isZooming,
  zoomDirection,
  zoomProgress,
}) => {
  const style = getDepthStyle(depth);
  
  // Generate 9×9 grid data
  const gridData = useMemo(() => {
    const grid = [];
    for (let row = 0; row < 9; row++) {
      const rowData = [];
      for (let col = 0; col < 9; col++) {
        rowData.push({
          row,
          col,
          hexagram: (row * 9 + col) % 64, // Map to hexagram number
          language: LATTICE_LANGUAGES[col],
        });
      }
      grid.push(rowData);
    }
    return grid;
  }, []);
  
  // Zoom animation scale
  const gridScale = useMemo(() => {
    if (!isZooming) return 1;
    if (zoomDirection === 'dive') {
      return 1 - (zoomProgress * 0.5); // Shrink to 0.5
    } else {
      return 0.5 + (zoomProgress * 0.5); // Expand from 0.5
    }
  }, [isZooming, zoomDirection, zoomProgress]);
  
  return (
    <motion.div
      className="grid gap-1 p-2"
      style={{
        gridTemplateColumns: 'repeat(9, 1fr)',
        maxWidth: '400px',
        margin: '0 auto',
      }}
      animate={{
        scale: gridScale,
        opacity: isZooming ? 0.5 : 1,
      }}
      transition={{ duration: 0.3 }}
    >
      {gridData.map((row, rowIdx) =>
        row.map((cell) => (
          <LatticeCell
            key={`${cell.row}-${cell.col}`}
            row={cell.row}
            col={cell.col}
            hexagram={cell.hexagram}
            language={cell.language}
            isSelected={
              selectedCell?.row === cell.row && 
              selectedCell?.col === cell.col
            }
            depth={depth}
            style={style}
            onSelect={onSelectCell}
            onDive={onDive}
          />
        ))
      )}
    </motion.div>
  );
});

LatticeGrid.displayName = 'LatticeGrid';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEPTH HUD (36-bit Address Display)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DepthHUD = React.memo(({ 
  depth, 
  address, 
  formattedAddress,
  totalStates,
  hapticFrequency,
  onSurface,
  onEmergencySurface,
  onMintSeed,
}) => {
  const style = getDepthStyle(depth);
  
  return (
    <div 
      className="p-3 rounded-xl"
      style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(15px)',
        border: `1px solid ${style.cellBorder}`,
      }}
    >
      {/* Depth label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Layers size={14} style={{ color: style.activeBorder }} />
          <span 
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: style.activeBorder }}
          >
            {style.label}
          </span>
        </div>
        
        <span 
          className="text-[10px] px-2 py-0.5 rounded"
          style={{ 
            background: `${style.activeBorder}20`,
            color: style.textColor,
          }}
        >
          {hapticFrequency}Hz
        </span>
      </div>
      
      {/* Address display */}
      <div 
        className="text-[9px] font-mono mb-2 p-2 rounded"
        style={{ 
          background: 'rgba(0,0,0,0.3)',
          color: 'rgba(255,255,255,0.5)',
          wordBreak: 'break-all',
        }}
      >
        {address || '(Surface)'}
      </div>
      
      {/* Formatted path */}
      <div 
        className="text-sm mb-2"
        style={{ color: style.textColor }}
      >
        {formattedAddress}
      </div>
      
      {/* Stats */}
      <div className="flex items-center justify-between text-[10px] mb-3">
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>
          Addressable States:
        </span>
        <span style={{ color: style.activeBorder }}>
          {totalStates.toLocaleString()}
        </span>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2">
        {depth > 0 && (
          <button
            onClick={onSurface}
            data-testid="rdive-surface-button"
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] uppercase tracking-wider transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <ChevronUp size={12} />
            Surface
          </button>
        )}
        
        {/* Emergency Surface - appears at L3+ for instant escape */}
        {depth >= 3 && onEmergencySurface && (
          <button
            onClick={onEmergencySurface}
            data-testid="rdive-emergency-surface-button"
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-[10px] uppercase tracking-wider transition-all animate-pulse"
            style={{
              background: 'rgba(255, 80, 80, 0.2)',
              color: '#FF6B6B',
              border: '1px solid rgba(255, 80, 80, 0.4)',
            }}
          >
            <AlertCircle size={12} />
            VOID ESCAPE
          </button>
        )}
        
        {depth > 0 && (
          <button
            onClick={onMintSeed}
            data-testid="rdive-mint-seed-button"
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] uppercase tracking-wider transition-all"
            style={{
              background: `${style.activeBorder}15`,
              color: style.activeBorder,
              border: `1px solid ${style.activeBorder}40`,
            }}
          >
            <Gem size={12} />
            Mint Seed
          </button>
        )}
      </div>
    </div>
  );
});

DepthHUD.displayName = 'DepthHUD';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN RECURSIVE LATTICE COMPONENT (Gravity-Reactive)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function RecursiveLattice({ 
  onSeedMinted = null,
  className = '',
}) {
  const {
    path,
    currentDepth,
    selectedCell,
    address,
    formattedAddress,
    isZooming,
    zoomDirection,
    zoomProgress,
    ghostLayers,
    hapticFrequency,
    totalStates,
    dive,
    surface,
    emergencySurface,
    selectGridCell,
    mintSeed,
    MAX_DEPTH,
  } = useRDive36({
    onMintSeed: onSeedMinted,
  });
  
  // Connect to Polarity Context for Gravity-Reactive Zoom-Snatch
  const { 
    gravity, 
    manualGravityEnabled, 
    manualGravityValue,
    isVoid 
  } = usePolarity();
  
  // Track previous gravity to detect threshold crossing
  const prevGravityRef = useRef(gravity);
  const diveTriggeredRef = useRef(false);
  
  // GRAVITY-REACTIVE ZOOM-SNATCH
  // When gravity hits 1.0 (or 0.95+ threshold), automatically trigger dive
  useEffect(() => {
    const effectiveGravity = manualGravityEnabled ? manualGravityValue : gravity;
    const prevGravity = prevGravityRef.current;
    
    // Check for dive threshold (approaching 1.0 from below)
    if (
      effectiveGravity >= DIVE_GRAVITY_THRESHOLD && 
      prevGravity < DIVE_GRAVITY_THRESHOLD &&
      selectedCell && 
      !isZooming && 
      !isVoid &&
      currentDepth < MAX_DEPTH &&
      !diveTriggeredRef.current
    ) {
      // ZOOM-SNATCH DIVE TRIGGERED BY GRAVITY
      diveTriggeredRef.current = true;
      
      // Get hexagram from selected cell
      const hexNum = (selectedCell.row * 9 + selectedCell.col) % 64;
      const lang = LATTICE_LANGUAGES[selectedCell.col % 9];
      
      // Execute the implosion dive
      dive(hexNum, lang);
      
      // Reset trigger after animation completes
      setTimeout(() => {
        diveTriggeredRef.current = false;
      }, RDIVE_CONFIG.SNATCH_DURATION + 100);
    }
    
    // Check for surface threshold (approaching 0.0 from above)
    if (
      effectiveGravity <= SURFACE_GRAVITY_THRESHOLD && 
      prevGravity > SURFACE_GRAVITY_THRESHOLD &&
      !isZooming && 
      !isVoid &&
      currentDepth > 0 &&
      !diveTriggeredRef.current
    ) {
      // ZOOM-SNATCH SURFACE TRIGGERED BY GRAVITY
      diveTriggeredRef.current = true;
      surface();
      
      setTimeout(() => {
        diveTriggeredRef.current = false;
      }, RDIVE_CONFIG.SNATCH_DURATION + 100);
    }
    
    prevGravityRef.current = effectiveGravity;
  }, [gravity, manualGravityEnabled, manualGravityValue, selectedCell, isZooming, isVoid, currentDepth, dive, surface, MAX_DEPTH]);
  
  const style = getDepthStyle(currentDepth);
  
  const handleMintSeed = useCallback(() => {
    const seed = mintSeed();
    console.log('[RDive36] Crystalline Seed Minted:', seed);
  }, [mintSeed]);
  
  // Calculate gravity indicator (for visual feedback)
  const effectiveGravity = manualGravityEnabled ? manualGravityValue : gravity;
  const gravityNearDive = effectiveGravity >= 0.85;
  const gravityNearSurface = effectiveGravity <= 0.15;
  
  return (
    <div 
      className={`relative min-h-[500px] rounded-2xl overflow-hidden ${className}`}
      data-testid="rdive-lattice-container"
      style={{ background: style.background }}
    >
      {/* Ghost layers (parent hexagrams) - 10-15% opacity persistent */}
      <GhostLayer 
        ghosts={ghostLayers} 
        isZooming={isZooming}
        zoomDirection={zoomDirection}
      />
      
      {/* ZOOM-SNATCH IMPLOSION ANIMATION */}
      <AnimatePresence>
        {isZooming && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Implosion/Explosion Visual */}
            <motion.div
              className="relative"
              animate={{
                scale: zoomDirection === 'dive' 
                  ? [1, 0.1, 0.05] // Implode to near-nothing
                  : [0.05, 0.1, 1], // Explode outward
                rotate: zoomDirection === 'dive' ? [0, 360, 720] : [720, 360, 0],
              }}
              transition={{ 
                duration: RDIVE_CONFIG.SNATCH_DURATION / 1000,
                ease: 'easeInOut',
              }}
            >
              {/* Central implosion point */}
              <motion.div
                className="w-20 h-20 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${style.activeBorder} 0%, transparent 70%)`,
                  boxShadow: `0 0 40px ${style.glowColor}, 0 0 80px ${style.glowColor}50`,
                }}
                animate={{
                  scale: zoomDirection === 'dive' ? [1, 2, 0.3] : [0.3, 2, 1],
                  opacity: zoomDirection === 'dive' ? [0.5, 1, 0] : [0, 1, 0.5],
                }}
                transition={{ duration: RDIVE_CONFIG.SNATCH_DURATION / 1000 }}
              />
              
              {/* Depth indicator */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-2xl font-bold"
                style={{ color: style.activeBorder }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: RDIVE_CONFIG.SNATCH_DURATION / 1000 }}
              >
                {zoomDirection === 'dive' ? `L${currentDepth + 1}` : `L${currentDepth - 1}`}
              </motion.div>
            </motion.div>
            
            {/* Radial lines during implosion */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: RDIVE_CONFIG.SNATCH_DURATION / 1000 }}
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 h-px origin-left"
                  style={{
                    width: '50%',
                    background: `linear-gradient(90deg, ${style.activeBorder}, transparent)`,
                    transform: `rotate(${i * 30}deg)`,
                  }}
                  animate={{
                    scaleX: zoomDirection === 'dive' ? [1, 0] : [0, 1],
                  }}
                  transition={{ 
                    duration: RDIVE_CONFIG.SNATCH_DURATION / 1000,
                    delay: i * 0.02,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content */}
      <div className="relative z-10 p-4">
        {/* Header with Gravity indicator */}
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="text-lg font-light tracking-wider"
            style={{ color: style.textColor }}
          >
            Recursive Lattice
          </h2>
          
          <div className="flex items-center gap-2">
            {/* Gravity-reactive indicator */}
            {(gravityNearDive || gravityNearSurface) && selectedCell && (
              <motion.div
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px]"
                style={{
                  background: gravityNearDive ? 'rgba(255,100,100,0.2)' : 'rgba(100,200,255,0.2)',
                  color: gravityNearDive ? '#FF6B6B' : '#6BC5FF',
                  border: `1px solid ${gravityNearDive ? 'rgba(255,100,100,0.4)' : 'rgba(100,200,255,0.4)'}`,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <AlertCircle size={10} />
                {gravityNearDive ? 'DIVE READY' : 'SURFACE READY'}
              </motion.div>
            )}
            
            <div 
              className="text-[10px] px-3 py-1 rounded-full uppercase tracking-wider"
              style={{
                background: `${style.activeBorder}20`,
                color: style.activeBorder,
                border: `1px solid ${style.activeBorder}40`,
              }}
            >
              L{currentDepth} · {totalStates.toLocaleString()} states
            </div>
          </div>
        </div>
        
        {/* 9×9 Grid */}
        <LatticeGrid
          depth={currentDepth}
          selectedCell={selectedCell}
          onSelectCell={selectGridCell}
          onDive={dive}
          isZooming={isZooming}
          zoomDirection={zoomDirection}
          zoomProgress={zoomProgress}
        />
        
        {/* Dive instruction with gravity hint */}
        {selectedCell && !isZooming && (
          <motion.div
            className="text-center mt-3 text-[11px]"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {gravityNearDive ? (
              <span>
                Push gravity to <span style={{ color: '#FF6B6B' }}>1.0</span> to trigger <span style={{ color: style.activeBorder }}>IMPLOSION DIVE</span>
              </span>
            ) : (
              <span>
                Double-tap to <span style={{ color: style.activeBorder }}>DIVE</span> · or push gravity to 1.0
              </span>
            )}
          </motion.div>
        )}
        
        {/* Depth HUD */}
        <div className="mt-4">
          <DepthHUD
            depth={currentDepth}
            address={address}
            formattedAddress={formattedAddress}
            totalStates={totalStates}
            hapticFrequency={hapticFrequency}
            onSurface={surface}
            onEmergencySurface={emergencySurface}
            onMintSeed={handleMintSeed}
          />
        </div>
      </div>
    </div>
  );
}

export { LatticeGrid, LatticeCell, GhostLayer, DepthHUD };
