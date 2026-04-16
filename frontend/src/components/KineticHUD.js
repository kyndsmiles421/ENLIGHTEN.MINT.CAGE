/**
 * KineticHUD.js — The Unified Command Mantle
 * 
 * THE COCKPIT OF THE SPATIAL OS
 * 
 * A multiplexed overlay that consolidates:
 * - Registry Status (Top-Right: Deep Violet Silence indicator)
 * - Dust Wallet (Bottom-Right: Seed count + XP)
 * - Hexagram Tracker Ring (Center: 9×9 pulsing with haptics)
 * - Gravity Snap Indicator (Shows approaching Sacred Hexagrams)
 * - Depth Navigator (Visual depth breadcrumb)
 * 
 * FADE-AWAY MECHANIC:
 * If user is still for 9+ seconds, HUD fades to 10% opacity,
 * leaving only the Spatial Origami visible.
 * 
 * 15-PIXEL SPACER CONSTANT:
 * All widgets maintain 15px minimum spacing to prevent overlap,
 * even during Level 5 "Refraction" effects.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gem,
  Layers,
  Zap,
  Target,
  Eye,
  Moon,
  Sun,
  Compass,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// HUD CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const HUD_CONFIG = {
  SPACER: 15,  // 15-pixel constant
  WIDGET_RADIUS: 8,
  RING_SIZE: 180,  // Center ring diameter
  RING_STROKE: 3,
};

// Stability colors
const STABILITY_COLORS = {
  WILD: '#FF6B6B',
  FORMING: '#FFB347',
  STABLE: '#77DD77',
  HARDENED: '#87CEEB',
  CRYSTALLIZED: '#DDA0DD',
};

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRY STATUS WIDGET (Top-Right)
// ═══════════════════════════════════════════════════════════════════════════

const RegistryStatusWidget = React.memo(({ 
  dominantLattice, 
  isVoidMode, 
  tesseractGateOpen,
  opacity,
}) => {
  const statusColor = useMemo(() => {
    if (tesseractGateOpen) return '#FFD700';  // Gold for tesseract
    if (isVoidMode) return '#8B5CF6';  // Violet for void
    if (dominantLattice === 'EQUILIBRIUM') return '#10B981';  // Green for equilibrium
    return '#3B82F6';  // Blue for matter
  }, [tesseractGateOpen, isVoidMode, dominantLattice]);
  
  const statusText = useMemo(() => {
    if (tesseractGateOpen) return 'TESSERACT GATE OPEN';
    if (dominantLattice === 'EQUILIBRIUM') return 'SOURCE STATE';
    return isVoidMode ? 'VOID LATTICE' : 'MATTER LATTICE';
  }, [tesseractGateOpen, dominantLattice, isVoidMode]);
  
  const StatusIcon = isVoidMode ? Moon : (tesseractGateOpen ? Sparkles : Sun);
  
  return (
    <motion.div
      className="absolute flex items-center gap-2 px-3 py-2 rounded-lg"
      style={{
        top: HUD_CONFIG.SPACER,
        right: HUD_CONFIG.SPACER,
        // CLEAN SWEEP: Smart Glass effect instead of solid bg
        background: `rgba(0,0,0,0.3)`,
        backdropFilter: 'none',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        border: `1px solid rgba(255,255,255,0.1)`,
        boxShadow: `0 0 20px ${statusColor}20`,
        opacity,
      }}
      animate={{ 
        boxShadow: tesseractGateOpen 
          ? [`0 0 20px ${statusColor}30`, `0 0 40px ${statusColor}60`, `0 0 20px ${statusColor}30`]
          : `0 0 20px ${statusColor}20`,
      }}
      transition={{ duration: 2, repeat: tesseractGateOpen ? Infinity : 0 }}
      data-testid="hud-registry-status"
    >
      <StatusIcon size={16} style={{ color: statusColor }} />
      <div className="text-[10px] uppercase tracking-wider" style={{ color: statusColor }}>
        {statusText}
      </div>
      {tesseractGateOpen && (
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: statusColor }}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
});

RegistryStatusWidget.displayName = 'RegistryStatusWidget';

// ═══════════════════════════════════════════════════════════════════════════
// DUST WALLET WIDGET (Bottom-Right)
// ═══════════════════════════════════════════════════════════════════════════

const DustWalletWidget = React.memo(({ 
  seedCount, 
  totalStates,
  depth,
  opacity,
}) => {
  return (
    <motion.div
      className="absolute flex flex-col items-end gap-1 px-3 py-2 rounded-lg"
      style={{
        bottom: HUD_CONFIG.SPACER,
        right: HUD_CONFIG.SPACER,
        // CLEAN SWEEP: Smart Glass effect
        background: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        opacity,
      }}
      data-testid="hud-dust-wallet"
    >
      {/* Seed count */}
      <div className="flex items-center gap-2">
        <Gem size={14} className="text-amber-500" />
        <span className="text-amber-500 font-medium text-sm">{seedCount}</span>
        <span className="text-gray-500 text-[10px]">SEEDS</span>
      </div>
      
      {/* State count */}
      <div className="flex items-center gap-2">
        <Layers size={12} className="text-gray-400" />
        <span className="text-gray-300 text-[10px]">
          {totalStates.toLocaleString()} STATES
        </span>
      </div>
      
      {/* Depth indicator */}
      <div className="flex items-center gap-1 mt-1">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{
              background: i <= depth ? '#FFD700' : 'rgba(255,255,255,0.6)',
              boxShadow: i === depth ? '0 0 8px #FFD700' : 'none',
            }}
          />
        ))}
        <span className="text-[10px] text-gray-500 ml-1">L{depth}</span>
      </div>
    </motion.div>
  );
});

DustWalletWidget.displayName = 'DustWalletWidget';

// ═══════════════════════════════════════════════════════════════════════════
// GRAVITY INDICATOR WIDGET (Top-Left)
// ═══════════════════════════════════════════════════════════════════════════

const GravityIndicatorWidget = React.memo(({ 
  gravity, 
  inverseGravity,
  nearSnapPoint,
  atSourceState,
  opacity,
}) => {
  const gravityPercent = Math.round(gravity * 100);
  const barColor = atSourceState ? '#10B981' : (gravity > 0.5 ? '#3B82F6' : '#8B5CF6');
  
  return (
    <motion.div
      className="absolute flex flex-col gap-2 px-3 py-2 rounded-lg"
      style={{
        top: HUD_CONFIG.SPACER,
        left: HUD_CONFIG.SPACER,
        // CLEAN SWEEP: Smart Glass effect
        background: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        minWidth: 140,
        opacity,
      }}
      data-testid="hud-gravity-indicator"
    >
      {/* Gravity label */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400 uppercase">Gravity</span>
        <span className="text-sm font-mono" style={{ color: barColor }}>
          {gravity.toFixed(3)}
        </span>
      </div>
      
      {/* Gravity bar */}
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ background: barColor }}
          animate={{ width: `${gravityPercent}%` }}
          transition={{ duration: 0.1 }}
        />
        {/* Source state marker */}
        <div 
          className="absolute top-0 h-full w-0.5 bg-green-500"
          style={{ left: '50%' }}
        />
      </div>
      
      {/* Snap point indicator */}
      <AnimatePresence>
        {nearSnapPoint && (
          <motion.div
            className="flex items-center gap-1 text-[10px]"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            style={{ color: '#FFD700' }}
          >
            <Target size={10} />
            <span>Snap: {nearSnapPoint.name}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Source state badge */}
      {atSourceState && (
        <motion.div
          className="flex items-center gap-1 text-[10px] text-green-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Zap size={10} />
          SOURCE STATE ACTIVE
        </motion.div>
      )}
    </motion.div>
  );
});

GravityIndicatorWidget.displayName = 'GravityIndicatorWidget';

// ═══════════════════════════════════════════════════════════════════════════
// STABILITY INDICATOR (Bottom-Left)
// ═══════════════════════════════════════════════════════════════════════════

const StabilityIndicatorWidget = React.memo(({ 
  stability, 
  selectedCell,
  opacity,
}) => {
  const stabilityColor = STABILITY_COLORS[stability] || STABILITY_COLORS.WILD;
  
  return (
    <motion.div
      className="absolute flex flex-col gap-1 px-3 py-2 rounded-lg"
      style={{
        bottom: HUD_CONFIG.SPACER,
        left: HUD_CONFIG.SPACER,
        // CLEAN SWEEP: Smart Glass effect
        background: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        opacity,
      }}
      data-testid="hud-stability-indicator"
    >
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ 
            background: stabilityColor,
            boxShadow: `0 0 10px ${stabilityColor}`,
          }}
        />
        <span className="text-[10px] uppercase tracking-wider" style={{ color: stabilityColor }}>
          {stability}
        </span>
      </div>
      
      {selectedCell && (
        <div className="text-[10px] text-gray-500">
          Cell [{selectedCell.row}, {selectedCell.col}]
        </div>
      )}
    </motion.div>
  );
});

StabilityIndicatorWidget.displayName = 'StabilityIndicatorWidget';

// ═══════════════════════════════════════════════════════════════════════════
// CENTER RING (Hexagram Tracker)
// ═══════════════════════════════════════════════════════════════════════════

const HexagramTrackerRing = React.memo(({ 
  gravity,
  depth,
  colors,
  nearSnapPoint,
  isZooming,
  opacity,
}) => {
  const ringGlow = nearSnapPoint ? '#FFD700' : colors.primary;
  
  // Generate 9 segments for the ring
  const segments = useMemo(() => {
    return [...Array(9)].map((_, i) => {
      const angle = (i / 9) * 360 - 90;
      const isActive = Math.floor(gravity * 9) === i;
      return { angle, isActive, index: i };
    });
  }, [gravity]);
  
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ opacity: opacity * 0.5 }}  // Ring is more subtle
      data-testid="hud-hexagram-ring"
    >
      <svg 
        width={HUD_CONFIG.RING_SIZE} 
        height={HUD_CONFIG.RING_SIZE}
        viewBox="0 0 100 100"
      >
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={HUD_CONFIG.RING_STROKE}
        />
        
        {/* Gravity arc */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={ringGlow}
          strokeWidth={HUD_CONFIG.RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${gravity * 283} 283`}
          style={{
            filter: nearSnapPoint ? `drop-shadow(0 0 8px ${ringGlow})` : 'none',
          }}
          animate={{
            strokeDasharray: `${gravity * 283} 283`,
          }}
          transition={{ duration: 0.1 }}
        />
        
        {/* Segment markers */}
        {segments.map(({ angle, isActive, index }) => (
          <motion.circle
            key={index}
            cx={50 + 45 * Math.cos((angle * Math.PI) / 180)}
            cy={50 + 45 * Math.sin((angle * Math.PI) / 180)}
            r={isActive ? 4 : 2}
            fill={isActive ? ringGlow : 'rgba(255,255,255,0.65)'}
            animate={{
              scale: isActive ? [1, 1.3, 1] : 1,
            }}
            transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
          />
        ))}
        
        {/* Center depth indicator */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fontWeight="bold"
          fill={colors.primary}
        >
          L{depth}
        </text>
        
        {/* Zooming indicator */}
        <AnimatePresence>
          {isZooming && (
            <motion.circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke={colors.primary}
              strokeWidth="2"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      </svg>
    </motion.div>
  );
});

HexagramTrackerRing.displayName = 'HexagramTrackerRing';

// ═══════════════════════════════════════════════════════════════════════════
// VOID MODE TOGGLE BUTTON
// ═══════════════════════════════════════════════════════════════════════════

const VoidModeToggle = React.memo(({ 
  isVoidMode, 
  onToggle,
  opacity,
}) => {
  return (
    <motion.button
      className="absolute flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
      style={{
        top: HUD_CONFIG.SPACER + 60,
        right: HUD_CONFIG.SPACER,
        background: isVoidMode ? 'rgba(139,92,246,0.2)' : 'rgba(59,130,246,0.2)',
        border: `1px solid ${isVoidMode ? 'rgba(139,92,246,0.5)' : 'rgba(59,130,246,0.5)'}`,
        opacity,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      data-testid="hud-void-toggle"
    >
      {isVoidMode ? (
        <>
          <Moon size={14} className="text-purple-400" />
          <span className="text-[10px] text-purple-400 uppercase">Exit Void</span>
        </>
      ) : (
        <>
          <Eye size={14} className="text-blue-400" />
          <span className="text-[10px] text-blue-400 uppercase">Enter Void</span>
        </>
      )}
    </motion.button>
  );
});

VoidModeToggle.displayName = 'VoidModeToggle';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN KINETIC HUD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function KineticHUD({
  // From useTesseractCore
  gravity,
  inverseGravity,
  depth,
  totalStates,
  selectedCell,
  isVoidMode,
  dominantLattice,
  atSourceState,
  tesseractGateOpen,
  isZooming,
  colors,
  hudOpacity,
  nearSnapPoint,
  currentStability,
  seeds,
  
  // Callbacks
  onToggleVoidMode,
}) {
  // ═══════════════════════════════════════════════════════════════════════════
  // LOOP-FIX: CSS Variable-based breathing (no React state, no re-renders)
  // The --lattice-zoom variable is injected by TesseractExperience via RAF
  // Widgets use CSS calc() for hardware-accelerated transforms
  // ═══════════════════════════════════════════════════════════════════════════
  
  const breathingStyle = {
    // LOOP-FIX: Use CSS variable instead of React prop
    // calc(1 - (var(--lattice-zoom) * 0.15)) gives: L0=1.0, L3+=0.85
    transform: 'scale(calc(1 - (var(--lattice-zoom, 0) * 0.15)))',
    opacity: 'calc(1 - (var(--lattice-zoom, 0) * 0.2))',  // Subtle fade at depth
    transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
  };
  
  return (
    <div 
      className="fixed inset-0"
      style={{ pointerEvents: 'none', zIndex: 30 }}  // z-30: Below lattice (z-999)
      data-testid="kinetic-hud"
    >
      {/* Registry Status (Top-Right) - LOOP-FIX: CSS breathing */}
      <div style={{ ...breathingStyle, transformOrigin: 'top right', pointerEvents: 'none' }}>
        <RegistryStatusWidget
          dominantLattice={dominantLattice}
          isVoidMode={isVoidMode}
          tesseractGateOpen={tesseractGateOpen}
          opacity={hudOpacity}
        />
      </div>
      
      {/* Gravity Indicator (Top-Left) - LOOP-FIX: CSS breathing */}
      <div style={{ ...breathingStyle, transformOrigin: 'top left', pointerEvents: 'none' }}>
        <GravityIndicatorWidget
          gravity={gravity}
          inverseGravity={inverseGravity}
          nearSnapPoint={nearSnapPoint}
          atSourceState={atSourceState}
          opacity={hudOpacity}
        />
      </div>
      
      {/* Dust Wallet (Bottom-Right) - LOOP-FIX: CSS breathing */}
      <div style={{ ...breathingStyle, transformOrigin: 'bottom right', pointerEvents: 'none' }}>
        <DustWalletWidget
          seedCount={seeds?.length || 0}
          totalStates={totalStates}
          depth={depth}
          opacity={hudOpacity}
        />
      </div>
      
      {/* Stability Indicator (Bottom-Left) - LOOP-FIX: CSS breathing */}
      <div style={{ ...breathingStyle, transformOrigin: 'bottom left', pointerEvents: 'none' }}>
        <StabilityIndicatorWidget
          stability={currentStability}
          selectedCell={selectedCell}
          opacity={hudOpacity}
        />
      </div>
      
      {/* Center Hexagram Ring - Display Only (behind lattice) */}
      <div style={{ pointerEvents: 'none' }}>
        <HexagramTrackerRing
          gravity={gravity}
          depth={depth}
          colors={colors}
          nearSnapPoint={nearSnapPoint}
          isZooming={isZooming}
          opacity={hudOpacity}
        />
      </div>
      
      {/* Void Mode Toggle - INTERACTIVE (pointer-events: auto) */}
      <div style={{ pointerEvents: 'auto' }}>
        <VoidModeToggle
          isVoidMode={isVoidMode}
          onToggle={onToggleVoidMode}
          opacity={hudOpacity}
        />
      </div>
    </div>
  );
}
