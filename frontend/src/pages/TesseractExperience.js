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
 * AUD-01: ACOUSTIC BLOOM INTEGRATION
 * Sound ONLY plays after 200ms dwell stability ("Stillness-as-Input")
 * 
 * All powered by the unified useTesseractCore hook.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Compass, Gem, Target } from 'lucide-react';

// Consolidated hook
import { useTesseractCore } from '../hooks/useTesseractCore';

// AUD-01: Acoustic Bloom - Phonetic audio engine
import { usePhoneticSynthesizer } from '../hooks/usePhoneticSynthesizer';

// VOID-01: Global state for bloom persistence
import { useRecursiveRegistry } from '../stores/RecursiveRegistryStore';

// Components
import KineticHUD from '../components/KineticHUD';
import SeedHuntWidget from '../components/SeedHuntWidget';
import { DwellBloomIndicatorSimple } from '../components/DwellBloomIndicator';

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
  isDwellStable,
  dwellProgress,
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
        // Z-INDEX 9999: SOVEREIGN - Matrix Lattice is TOP interactive layer
        zIndex: 9999,
        position: 'relative',
      }}
    >
      {/* Grid background - NO backdrop-filter, pure translucent */}
      <div 
        className="absolute inset-0 rounded-2xl transition-all duration-500"
        style={{
          // SOVEREIGN: No backdrop-filter on core lattice
          background: `radial-gradient(circle at center, ${colors.primary}15, transparent 70%)`,
          border: `2px solid ${colors.primary}30`,
          boxShadow: `0 0 40px ${colors.primary}15`,
          pointerEvents: 'none',  // Background is decorative only
        }}
      />
      
      {/* 9×9 Grid - ALL pointer events enabled */}
      <div 
        className="absolute inset-4 grid grid-cols-9 gap-1"
        style={{ pointerEvents: 'auto' }}  // Grid is fully interactive
      >
        {[...Array(81)].map((_, i) => {
          const row = Math.floor(i / 9);
          const col = i % 9;
          const isSelected = selectedCell?.row === row && selectedCell?.col === col;
          const hexNum = (row * 9 + col) % 64;
          
          return (
            <motion.button
              key={i}
              className="relative rounded-md transition-all cursor-pointer"
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
                // Ensure each cell is clickable
                pointerEvents: isZooming ? 'none' : 'auto',
              }}
              whileHover={{ scale: 1.1, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCellClick(row, col)}
              onDoubleClick={() => handleCellDoubleClick(row, col)}
              disabled={isZooming}
              data-testid={`tesseract-cell-${row}-${col}`}
            >
              {/* Visual Bloom Indicator - shows dwell progress */}
              {isSelected && (
                <DwellBloomIndicatorSimple
                  isActive={isSelected}
                  isDwellStable={isDwellStable}
                  dwellProgress={dwellProgress}
                  isVoidMode={isVoidMode}
                />
              )}
              
              {/* Hexagram number (tiny) */}
              <span 
                className="absolute inset-0 flex items-center justify-center text-[8px] font-mono"
                style={{ 
                  color: isSelected ? colors.primary : 'rgba(255,255,255,0.3)',
                  pointerEvents: 'none',  // Text is decorative
                }}
              >
                {hexNum}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Center depth indicator - decorative only */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ pointerEvents: 'none' }}
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
      
      {/* Zooming overlay - decorative only */}
      {isZooming && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ 
            background: `${colors.primary}30`,
            pointerEvents: 'none',
          }}
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
  
  // VOID-01: Global state for bloom persistence (kept in registry for cross-component access)
  const registry = useRecursiveRegistry();
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LOOP-FIX: CSS Variable Injection (The "Muzzle")
  // Moves HUD scaling OUT of React state → into hardware-accelerated CSS
  // Result: Zero re-renders. HUD and Lattice stop "shouting at each other."
  // ═══════════════════════════════════════════════════════════════════════════
  
  const rafRef = useRef(null);
  const lastDepthRef = useRef(0);
  
  useEffect(() => {
    // Only update CSS variable if depth actually changed
    if (lastDepthRef.current === core.depth) return;
    lastDepthRef.current = core.depth;
    
    // Cancel any pending RAF to prevent stacking
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Inject CSS variable in next animation frame (hardware-accelerated)
    rafRef.current = requestAnimationFrame(() => {
      // Calculate lattice zoom factor (0 at L0, 0.33 at L1, 0.67 at L2, 1.0 at L3+)
      const zoomFactor = Math.min(core.depth / 3, 1);
      
      // Inject into document root for global CSS access
      document.documentElement.style.setProperty('--lattice-zoom', zoomFactor.toString());
      document.documentElement.style.setProperty('--lattice-depth', core.depth.toString());
      
      console.log(`[LOOP-FIX] CSS Variable injected: --lattice-zoom=${zoomFactor.toFixed(2)}, depth=${core.depth}`);
    });
    
    // Cleanup on unmount
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [core.depth]);
  
  // Initialize CSS variables on mount
  useEffect(() => {
    document.documentElement.style.setProperty('--lattice-zoom', '0');
    document.documentElement.style.setProperty('--lattice-depth', '0');
    
    return () => {
      // Clean up CSS variables on unmount
      document.documentElement.style.removeProperty('--lattice-zoom');
      document.documentElement.style.removeProperty('--lattice-depth');
    };
  }, []);
  
  // VOID-01: Persist bloom state during dive transitions (kept minimal)
  useEffect(() => {
    if (core.isZooming) {
      registry.setBloomState({
        exitVelocity: core.dwellProgress,
        depthAtActivation: core.depth,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [core.isZooming]);
  
  // VOID-01: Update bloom state on significant changes (not every frame)
  // Throttle: Only update when isActive or isVoidMode changes, or on completion
  const prevBloomRef = useRef({ isActive: false, opacity: 0 });
  useEffect(() => {
    const isActive = core.selectedCell !== null;
    const isComplete = core.dwellProgress >= 1;
    
    // Only update if: activation changed, mode changed, or just completed
    const shouldUpdate = 
      isActive !== prevBloomRef.current.isActive ||
      isComplete && prevBloomRef.current.opacity < 1;
    
    if (shouldUpdate) {
      registry.setBloomState({
        isActive,
        opacity: core.dwellProgress,
        color: core.isVoidMode ? 'void' : 'jade',
      });
      prevBloomRef.current = { isActive, opacity: core.dwellProgress };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [core.selectedCell, core.dwellProgress, core.isVoidMode]);
  
  // AUD-01: Acoustic Bloom - Dwell gate function
  // Returns true ONLY when user has been still for 200ms
  const isDwellStableRef = useRef(false);
  useEffect(() => {
    isDwellStableRef.current = core.isDwellStable;
  }, [core.isDwellStable]);
  
  const dwellGateFunction = useCallback(() => {
    return isDwellStableRef.current;
  }, []);
  
  // AUD-01: Phonetic synthesizer with dwell gate wired in
  // Sound will ONLY play after 200ms stillness on a coordinate
  const phonetic = usePhoneticSynthesizer({
    enabled: true,
    masterVolume: 0.15,
    dwellGate: dwellGateFunction,
  });
  
  // AUD-01: Effect to trigger audio bloom ONLY when dwell becomes stable
  const prevDwellStableRef = useRef(false);
  useEffect(() => {
    // Trigger audio bloom when transitioning from unstable -> stable
    if (core.isDwellStable && !prevDwellStableRef.current && core.selectedCell) {
      // Calculate language and hexagram from cell position
      const { row, col } = core.selectedCell;
      const hexNum = (row * 9 + col) % 64;
      const languages = ['en', 'es', 'ja', 'zh-cmn', 'zh-yue', 'sa', 'hi', 'lkt', 'dak'];
      const langCode = languages[col % 9];
      
      console.log('[AUD-01] Acoustic Bloom triggered - stillness achieved');
      
      // Play the phonetic burst + hexagram signature (with bypass since we know it's stable)
      phonetic.playPhoneticBurst(langCode, { bypassDwellGate: true });
      phonetic.playHexagramSignature(hexNum, { bypassDwellGate: true });
    }
    prevDwellStableRef.current = core.isDwellStable;
  }, [core.isDwellStable, core.selectedCell, phonetic]);
  
  const handleMintSeed = useCallback(async () => {
    const seed = await core.mintSeed();
    if (seed) {
      console.log('[TesseractExperience] Seed minted:', seed);
    }
  }, [core]);
  
  const handleNavigateToHunt = useCallback(() => {
    navigate('/seed-gallery');  // Or a dedicated hunt page
  }, [navigate]);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SEAL-01: LONG-PRESS ESCAPE (Emergency Surface)
  // Hold center of screen for 1.5s → Instant snap to L0
  // The psychological "come up for air" mechanism for deep dives
  // ═══════════════════════════════════════════════════════════════════════════
  
  const [escapeProgress, setEscapeProgress] = useState(0);
  const [isEscaping, setIsEscaping] = useState(false);
  const escapeTimerRef = useRef(null);
  const escapeStartRef = useRef(null);
  const escapeRafRef = useRef(null);
  
  const ESCAPE_DURATION = 1500; // 1.5 seconds to trigger escape
  
  const startEscapeSequence = useCallback(() => {
    if (core.depth === 0) return; // No need to escape at surface
    
    setIsEscaping(true);
    escapeStartRef.current = Date.now();
    
    // Start progress animation
    const updateProgress = () => {
      const elapsed = Date.now() - escapeStartRef.current;
      const progress = Math.min(1, elapsed / ESCAPE_DURATION);
      setEscapeProgress(progress);
      
      if (progress < 1) {
        escapeRafRef.current = requestAnimationFrame(updateProgress);
      }
    };
    escapeRafRef.current = requestAnimationFrame(updateProgress);
    
    // Set completion timer
    escapeTimerRef.current = setTimeout(() => {
      // Trigger emergency surface
      console.log('[SEAL-01] Long-Press Escape triggered - surfacing to L0');
      
      // Haptic "deep thunk" feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 100, 30, 150]);
      }
      
      // Flash effect (inverse bloom)
      setEscapeProgress(1);
      
      // Emergency surface
      core.emergencySurface();
      
      // Reset CSS variable immediately
      document.documentElement.style.setProperty('--lattice-zoom', '0');
      document.documentElement.style.setProperty('--lattice-depth', '0');
      
      // Cleanup
      setIsEscaping(false);
      setEscapeProgress(0);
    }, ESCAPE_DURATION);
  }, [core]);
  
  const cancelEscapeSequence = useCallback(() => {
    if (escapeTimerRef.current) {
      clearTimeout(escapeTimerRef.current);
      escapeTimerRef.current = null;
    }
    if (escapeRafRef.current) {
      cancelAnimationFrame(escapeRafRef.current);
      escapeRafRef.current = null;
    }
    setIsEscaping(false);
    setEscapeProgress(0);
    escapeStartRef.current = null;
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (escapeTimerRef.current) clearTimeout(escapeTimerRef.current);
      if (escapeRafRef.current) cancelAnimationFrame(escapeRafRef.current);
    };
  }, []);
  
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
      {/* Kinetic HUD Overlay - z-30 (BELOW lattice at z-999) */}
      {/* HUD-01: Pass widget scale for "breathing" effect */}
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
      
      {/* Main Lattice - Z-INDEX 999: Always top interactive layer */}
      <div className="relative flex items-center justify-center mt-8" style={{ zIndex: 999 }}>
        <TesseractLattice
          depth={core.depth}
          selectedCell={core.selectedCell}
          onSelectCell={core.selectCell}
          onDive={core.dive}
          isZooming={core.isZooming}
          colors={core.colors}
          isVoidMode={core.isVoidMode}
          isDwellStable={core.isDwellStable}
          dwellProgress={core.dwellProgress}
        />
        
        {/* SEAL-01: Long-Press Escape Zone (Center) - Only visible at depth > 0 */}
        {core.depth > 0 && (
          <div 
            className="absolute flex items-center justify-center"
            style={{ 
              zIndex: 10000,  // CRITICAL: Must be ABOVE lattice (z-9999)
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Escape trigger zone - centered button */}
            <button
              className="w-20 h-20 rounded-full flex items-center justify-center transition-all"
              style={{
                background: isEscaping 
                  ? `radial-gradient(circle, rgba(255,255,255,${escapeProgress * 0.6}) 0%, rgba(0,168,107,${escapeProgress * 0.3}) 50%, transparent 70%)`
                  : 'rgba(0,0,0,0.3)',
                border: isEscaping 
                  ? `2px solid rgba(255,255,255,${escapeProgress})` 
                  : '2px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(4px)',
              }}
              onMouseDown={startEscapeSequence}
              onMouseUp={cancelEscapeSequence}
              onMouseLeave={cancelEscapeSequence}
              onTouchStart={startEscapeSequence}
              onTouchEnd={cancelEscapeSequence}
              onTouchCancel={cancelEscapeSequence}
              data-testid="escape-zone"
            >
              {/* Escape progress ring */}
              <AnimatePresence>
                {isEscaping ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.3, opacity: 0 }}
                    className="absolute"
                  >
                    <svg width="80" height="80" className="transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="3"
                        fill="none"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        stroke={escapeProgress >= 1 ? '#fff' : core.isVoidMode ? '#a855f7' : '#00ff9f'}
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 35}`}
                        strokeDashoffset={`${2 * Math.PI * 35 * (1 - escapeProgress)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Escape text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <span className="text-[8px] uppercase tracking-wider opacity-70">
                        {escapeProgress >= 1 ? 'SURFACING' : 'HOLD'}
                      </span>
                      <span className="text-xs font-bold">
                        {Math.round(escapeProgress * 100)}%
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-white/50">
                    <span className="text-xs font-light">L{core.depth}</span>
                  </div>
                )}
              </AnimatePresence>
            </button>
          </div>
        )}
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
      
      {/* Seed Hunt Widget (sidebar) - LOOP-FIX: CSS Variable breathing */}
      <div 
        className="fixed right-4 top-1/2 -translate-y-1/2 w-64 z-30 origin-right hud-widget-breathing"
        style={{
          transform: 'scale(calc(1 - (var(--lattice-zoom, 0) * 0.15)))',
          opacity: 'calc(1 - (var(--lattice-zoom, 0) * 0.2))',
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
        }}
      >
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
