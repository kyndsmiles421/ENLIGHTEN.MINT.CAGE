/**
 * TesseractExperience.js — The Unified Spatial OS Interface
 * 
 * THE COCKPIT + ENGINE + DASHBOARD
 * 
 * This is the ONE PAGE that consolidates:
 * - RecursiveLattice (9×9 grid navigation)
 * - KineticHUD (command mantle overlay)
 * - SeedHuntWidget (daily challenges)
 * - Gravity control (with snap points)
 * - Void/Matter mode toggle
 * 
 * All powered by the unified useTesseractCore hook.
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Gem, Target } from 'lucide-react';

// Consolidated hook
import { useTesseractCore } from '../hooks/useTesseractCore';

// Components
import KineticHUD from '../components/KineticHUD';
import SeedHuntWidget from '../components/SeedHuntWidget';

// ═══════════════════════════════════════════════════════════════════════════
// GRAVITY SLIDER WITH SNAP POINTS
// ═══════════════════════════════════════════════════════════════════════════

const GravitySlider = React.memo(({ 
  gravity, 
  onGravityChange, 
  nearSnapPoint,
  atSourceState,
}) => {
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-64">
      <div className="relative">
        {/* Snap point markers */}
        <div className="absolute inset-0 flex justify-between pointer-events-none">
          {[0, 0.25, 0.5, 0.75, 1].map((point) => (
            <div
              key={point}
              className="w-1 h-3 rounded-full -mt-1"
              style={{
                background: point === 0.5 ? '#10B981' : 'rgba(255,255,255,0.3)',
                boxShadow: point === 0.5 && atSourceState ? '0 0 10px #10B981' : 'none',
              }}
            />
          ))}
        </div>
        
        {/* Slider track */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={gravity}
          onChange={(e) => onGravityChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(90deg, 
              #8B5CF6 0%, 
              #10B981 50%, 
              #3B82F6 100%)`,
          }}
          data-testid="gravity-slider"
        />
        
        {/* Labels */}
        <div className="flex justify-between mt-1 text-[10px]">
          <span className="text-purple-400">VOID</span>
          <span className={atSourceState ? 'text-green-400 font-bold' : 'text-gray-500'}>
            SOURCE
          </span>
          <span className="text-blue-400">MATTER</span>
        </div>
        
        {/* Snap indicator */}
        {nearSnapPoint && (
          <motion.div
            className="text-center mt-2 text-[10px] text-amber-500"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ⚡ Near: {nearSnapPoint.name}
          </motion.div>
        )}
      </div>
    </div>
  );
});

GravitySlider.displayName = 'GravitySlider';

// ═══════════════════════════════════════════════════════════════════════════
// TESSERACT LATTICE (Simplified 9×9 Grid)
// ═══════════════════════════════════════════════════════════════════════════

const TesseractLattice = React.memo(({
  depth,
  selectedCell,
  onSelectCell,
  onDive,
  isZooming,
  colors,
  isVoidMode,
}) => {
  const handleCellClick = useCallback((row, col) => {
    onSelectCell(row, col);
  }, [onSelectCell]);
  
  const handleCellDoubleClick = useCallback((row, col) => {
    // Calculate hexagram from cell position
    const hexNum = (row * 9 + col) % 64;
    const languages = ['en', 'es', 'ja', 'zh-cmn', 'zh-yue', 'sa', 'hi', 'lkt', 'dak'];
    onDive(hexNum, languages[col]);
  }, [onDive]);
  
  return (
    <div 
      className="relative mx-auto"
      style={{ 
        width: 'min(90vw, 400px)',
        aspectRatio: '1',
      }}
    >
      {/* Grid background */}
      <div 
        className="absolute inset-0 rounded-2xl transition-all duration-500"
        style={{
          background: `radial-gradient(circle at center, ${colors.primary}20, transparent 70%)`,
          border: `2px solid ${colors.primary}40`,
          boxShadow: `0 0 40px ${colors.primary}20`,
        }}
      />
      
      {/* 9×9 Grid */}
      <div className="absolute inset-4 grid grid-cols-9 gap-1">
        {[...Array(81)].map((_, i) => {
          const row = Math.floor(i / 9);
          const col = i % 9;
          const isSelected = selectedCell?.row === row && selectedCell?.col === col;
          const hexNum = (row * 9 + col) % 64;
          
          return (
            <motion.button
              key={i}
              className="relative rounded-md transition-all"
              style={{
                background: isSelected 
                  ? `${colors.primary}60`
                  : isVoidMode 
                    ? 'rgba(139,92,246,0.1)' 
                    : 'rgba(59,130,246,0.1)',
                border: isSelected 
                  ? `2px solid ${colors.primary}` 
                  : '1px solid rgba(255,255,255,0.1)',
                boxShadow: isSelected ? `0 0 15px ${colors.primary}50` : 'none',
              }}
              whileHover={{ scale: 1.1, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCellClick(row, col)}
              onDoubleClick={() => handleCellDoubleClick(row, col)}
              disabled={isZooming}
              data-testid={`tesseract-cell-${row}-${col}`}
            >
              {/* Hexagram number (tiny) */}
              <span 
                className="absolute inset-0 flex items-center justify-center text-[8px] font-mono"
                style={{ 
                  color: isSelected ? colors.primary : 'rgba(255,255,255,0.3)',
                }}
              >
                {hexNum}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Center depth indicator */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <motion.div
          className="text-4xl font-light"
          style={{ 
            color: colors.primary,
            textShadow: `0 0 20px ${colors.primary}`,
          }}
          animate={isZooming ? { scale: [1, 0.5, 1.5, 1], rotate: [0, 180, 360] } : {}}
          transition={{ duration: 0.8 }}
        >
          L{depth}
        </motion.div>
      </div>
      
      {/* Zooming overlay */}
      {isZooming && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ background: `${colors.primary}30` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.8 }}
        />
      )}
    </div>
  );
});

TesseractLattice.displayName = 'TesseractLattice';

// ═══════════════════════════════════════════════════════════════════════════
// ACTION BUTTONS
// ═══════════════════════════════════════════════════════════════════════════

const ActionButtons = React.memo(({
  depth,
  selectedCell,
  onSurface,
  onEmergencySurface,
  onMintSeed,
  canMint,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
      {/* Surface button */}
      {depth > 0 && (
        <button
          onClick={onSurface}
          className="px-4 py-2 rounded-lg text-[11px] uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white transition-all"
          data-testid="action-surface"
        >
          Surface
        </button>
      )}
      
      {/* Emergency surface */}
      {depth >= 3 && (
        <button
          onClick={onEmergencySurface}
          className="px-4 py-2 rounded-lg text-[11px] uppercase tracking-wider bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 transition-all animate-pulse"
          data-testid="action-void-escape"
        >
          VOID ESCAPE
        </button>
      )}
      
      {/* Mint seed */}
      {canMint && (
        <button
          onClick={onMintSeed}
          className="px-4 py-2 rounded-lg text-[11px] uppercase tracking-wider bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/40 transition-all"
          data-testid="action-mint-seed"
        >
          <Gem size={14} className="inline mr-1" />
          Mint Seed
        </button>
      )}
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN TESSERACT EXPERIENCE PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function TesseractExperience() {
  const navigate = useNavigate();
  
  // The ONE hook that controls everything
  const core = useTesseractCore({
    enableHaptics: true,
    enableSnapPoints: true,
    enableAutoVoid: true,
  });
  
  const handleMintSeed = useCallback(async () => {
    const seed = await core.mintSeed();
    if (seed) {
      console.log('[TesseractExperience] Seed minted:', seed);
    }
  }, [core]);
  
  const handleNavigateToHunt = useCallback(() => {
    navigate('/seed-gallery');  // Or a dedicated hunt page
  }, [navigate]);
  
  return (
    <div 
      className="relative min-h-screen overflow-hidden"
      style={{
        background: core.isVoidMode 
          ? 'linear-gradient(180deg, #0a0510 0%, #1a0a2e 50%, #0a0510 100%)'
          : 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)',
      }}
      data-testid="tesseract-experience"
    >
      {/* Kinetic HUD Overlay */}
      <KineticHUD
        gravity={core.gravity}
        inverseGravity={core.inverseGravity}
        depth={core.depth}
        totalStates={core.totalStates}
        selectedCell={core.selectedCell}
        isVoidMode={core.isVoidMode}
        dominantLattice={core.dominantLattice}
        atSourceState={core.atSourceState}
        tesseractGateOpen={core.tesseractGateOpen}
        isZooming={core.isZooming}
        colors={core.colors}
        hudOpacity={core.hudOpacity}
        nearSnapPoint={core.nearSnapPoint}
        currentStability={core.currentStability}
        seeds={core.seeds}
        onToggleVoidMode={core.toggleVoidMode}
      />
      
      {/* Header */}
      <div className="relative z-50 flex items-center justify-between p-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          data-testid="back-button"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        
        <div className="text-center">
          <h1 className="text-lg font-light text-white tracking-wider">
            TESSERACT CORE
          </h1>
          <p className="text-[10px] text-gray-500 uppercase">
            Unified Spatial Engine
          </p>
        </div>
        
        <button
          onClick={() => navigate('/seed-gallery')}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          data-testid="gallery-button"
        >
          <Gem size={20} className="text-amber-500" />
        </button>
      </div>
      
      {/* Main Lattice */}
      <div className="relative z-10 flex items-center justify-center mt-8">
        <TesseractLattice
          depth={core.depth}
          selectedCell={core.selectedCell}
          onSelectCell={core.selectCell}
          onDive={core.dive}
          isZooming={core.isZooming}
          colors={core.colors}
          isVoidMode={core.isVoidMode}
        />
      </div>
      
      {/* Gravity Slider */}
      <GravitySlider
        gravity={core.gravity}
        onGravityChange={core.updateGravity}
        nearSnapPoint={core.nearSnapPoint}
        atSourceState={core.atSourceState}
      />
      
      {/* Action Buttons */}
      <ActionButtons
        depth={core.depth}
        selectedCell={core.selectedCell}
        onSurface={core.surface}
        onEmergencySurface={core.emergencySurface}
        onMintSeed={handleMintSeed}
        canMint={core.depth >= 1 && core.address}
      />
      
      {/* Seed Hunt Widget (sidebar) */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 w-64 z-30">
        <SeedHuntWidget
          currentAddress={core.address}
          onNavigateToHunt={handleNavigateToHunt}
          compact={true}
        />
      </div>
      
      {/* Address display */}
      {core.address && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center">
          <div className="text-[10px] text-gray-500 mb-1">36-BIT ADDRESS</div>
          <div 
            className="font-mono text-[11px] px-4 py-2 rounded-lg"
            style={{ 
              background: 'rgba(0,0,0,0.5)',
              color: core.colors.primary,
              border: `1px solid ${core.colors.primary}40`,
            }}
          >
            {core.address}
          </div>
        </div>
      )}
    </div>
  );
}
