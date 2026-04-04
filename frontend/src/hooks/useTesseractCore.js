/**
 * useTesseractCore.js — The Unified Spatial Engine
 * 
 * THE CONSOLIDATED ARCHITECTURE
 * 
 * Merges:
 * - useSentientRegistryV2 (Behavioral Memory)
 * - useRDive36 (36-bit Navigation)
 * - useInverseLattice (Void/Matter Duality)
 * 
 * Into a single, zero-latency hook that serves as the
 * ONE SOURCE OF TRUTH for the entire Spatial OS.
 * 
 * BENEFITS:
 * - Eliminates React infinite loop (refs instead of state deps)
 * - Single render cycle for all gravity/depth/address changes
 * - Unified haptic/visual/audio orchestration
 * - Snap-point gravity for Sacred Hexagrams
 * 
 * USAGE:
 * const core = useTesseractCore();
 * // Access: core.gravity, core.depth, core.address, core.isVoidMode, etc.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  INVERSE_CONFIG,
  calculateInverseGravity,
  isSourceState,
  calculateGravityTension,
  getDominantLattice,
  generateAntiAddress,
  isTesseractGateOpen,
  getHapticFrequency,
  getDepthColor,
  calculateTensionGradient,
  validateAddress,
  clampDepth,
} from '../config/InverseRegistry';
import { HEXAGRAM_REGISTRY, getHexagram, HEXAGRAM_SEQUENCE } from '../config/hexagramRegistry';
import { LANGUAGE_REGISTRY } from '../config/languageRegistry';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const TESSERACT_CONFIG = {
  // Depth limits
  MAX_DEPTH: 6,  // Level 6 = True Core (Tesseract)
  
  // Gravity snap points (Sacred Hexagrams)
  SNAP_THRESHOLD: 0.05,  // Snap within 5%
  SACRED_GRAVITY_POINTS: [
    { gravity: 0.000, hexagram: 2, name: 'Kūn (Receptive)' },
    { gravity: 0.111, hexagram: 29, name: 'Kǎn (Abysmal)' },
    { gravity: 0.222, hexagram: 15, name: 'Qiān (Modesty)' },
    { gravity: 0.333, hexagram: 11, name: 'Tài (Peace)' },
    { gravity: 0.500, hexagram: 63, name: 'Jì Jì (SOURCE STATE)' },
    { gravity: 0.556, hexagram: 12, name: 'Pǐ (Standstill)' },
    { gravity: 0.667, hexagram: 64, name: 'Wèi Jì (Potential)' },
    { gravity: 0.778, hexagram: 30, name: 'Lí (Clinging)' },
    { gravity: 0.889, hexagram: 1, name: 'Qián (Creative)' },
    { gravity: 1.000, hexagram: 1, name: 'Qián (Creative)' },
  ],
  
  // Animation durations
  SNATCH_DURATION: 800,
  SNAP_DURATION: 200,
  
  // Dwell thresholds (for behavioral memory)
  DWELL_THRESHOLDS: {
    WILD: 0,
    FORMING: 3,
    STABLE: 6,
    HARDENED: 11,
    CRYSTALLIZED: 16,
  },
  
  // HUD fade timing
  HUD_FADE_DWELL: 9000,  // 9 seconds of stillness
  HUD_FADE_OPACITY: 0.1,
  
  // Acoustic bloom threshold
  ACOUSTIC_BLOOM_MS: 200,  // Sound blooms after 200ms dwell
  
  // Haptic patterns
  HAPTIC_PATTERNS: {
    dive: [50, 30, 100],
    surface: [100, 30, 50],
    snap: [20, 10, 20],
    void_enter: [20, 100, 20, 300, 20],
    void_exit: [300, 20, 100, 20, 20],
    tesseract: [100, 50, 100, 50, 200, 100, 200],
    legendary: [50, 25, 50, 25, 50, 25, 150, 50, 150],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// THE TESSERACT CORE HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useTesseractCore(options = {}) {
  const {
    initialGravity = 0.5,
    enableHaptics = true,
    enableSnapPoints = true,
    enableAutoVoid = true,
    enablePersistence = true,  // MEM-01: Enable localStorage persistence
    onDepthChange = null,
    onModeChange = null,
    onSeedMinted = null,
  } = options;
  
  // ─────────────────────────────────────────────────────────────────────────
  // REFS (Prevent re-render loops)
  // ─────────────────────────────────────────────────────────────────────────
  
  const gravityRef = useRef(initialGravity);
  const depthRef = useRef(0);
  const pathRef = useRef([]);
  const dwellMapRef = useRef(new Map());  // coordinate -> { visits, totalMs, lastVisit }
  const lastActivityRef = useRef(Date.now());
  const animationFrameRef = useRef(null);
  const persistenceInitRef = useRef(false);  // MEM-01: Track init to avoid double-restore
  
  // ─────────────────────────────────────────────────────────────────────────
  // STATE (Minimal, only what triggers re-renders)
  // ─────────────────────────────────────────────────────────────────────────
  
  const [gravity, setGravity] = useState(initialGravity);
  const [depth, setDepth] = useState(0);
  const [address, setAddress] = useState('');
  const [selectedCell, setSelectedCell] = useState(null);
  const [isVoidMode, setIsVoidMode] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomDirection, setZoomDirection] = useState(null);
  const [hudOpacity, setHudOpacity] = useState(1);
  const [nearSnapPoint, setNearSnapPoint] = useState(null);
  const [seeds, setSeeds] = useState([]);
  const [isDwellStable, setIsDwellStable] = useState(false);  // Acoustic Bloom gate
  
  // ─────────────────────────────────────────────────────────────────────────
  // MEM-01: PERSISTENCE KEY
  // ─────────────────────────────────────────────────────────────────────────
  
  const PERSISTENCE_KEY = 'tesseract_anchor';
  const isRestoringRef = useRef(false);  // Block save during restore
  
  // ─────────────────────────────────────────────────────────────────────────
  // MEM-01: RESTORE FROM LOCALSTORAGE ON MOUNT
  // The "Recursive Anchor" - User returns to their exact place in the Void
  // ─────────────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    if (!enablePersistence || persistenceInitRef.current) return;
    persistenceInitRef.current = true;
    isRestoringRef.current = true;  // Block saves during restore
    
    try {
      const saved = localStorage.getItem(PERSISTENCE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        console.log('[MEM-01] Restoring Tesseract Anchor:', state);
        
        // Restore all navigation state
        if (state.depth !== undefined && state.depth > 0) {
          setDepth(state.depth);
          depthRef.current = state.depth;
        }
        if (state.address) {
          setAddress(state.address);
        }
        if (state.path && Array.isArray(state.path)) {
          pathRef.current = state.path;
        }
        if (state.isVoidMode) {
          setIsVoidMode(state.isVoidMode);
        }
        if (state.gravity !== undefined && state.gravity !== 0.5) {
          setGravity(state.gravity);
          gravityRef.current = state.gravity;
        }
        if (state.dwellMap && Array.isArray(state.dwellMap)) {
          dwellMapRef.current = new Map(state.dwellMap);
        }
      }
    } catch (err) {
      console.warn('[MEM-01] Failed to restore Tesseract Anchor:', err);
    }
    
    // Unblock saves after a short delay (let initial renders complete)
    setTimeout(() => {
      isRestoringRef.current = false;
      console.log('[MEM-01] Restore complete, saves enabled');
    }, 100);
  }, [enablePersistence]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // MEM-01: SAVE TO LOCALSTORAGE ON STATE CHANGE
  // Catches the user if they refresh or lose connection
  // ─────────────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    // Skip if persistence disabled, not initialized, or currently restoring
    if (!enablePersistence || !persistenceInitRef.current || isRestoringRef.current) return;
    
    // Debounce saves to avoid excessive writes
    const timeoutId = setTimeout(() => {
      const state = {
        depth,
        address,
        path: pathRef.current,
        isVoidMode,
        gravity,
        dwellMap: Array.from(dwellMapRef.current.entries()),
        savedAt: new Date().toISOString(),
      };
      
      try {
        localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
        console.log('[MEM-01] Tesseract Anchor saved at depth:', depth);
      } catch (err) {
        console.warn('[MEM-01] Failed to save Tesseract Anchor:', err);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [enablePersistence, depth, address, isVoidMode, gravity]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // DERIVED VALUES (Memoized)
  // ─────────────────────────────────────────────────────────────────────────
  
  const inverseGravity = useMemo(() => calculateInverseGravity(gravity), [gravity]);
  const gravityTension = useMemo(() => calculateGravityTension(gravity), [gravity]);
  const dominantLattice = useMemo(() => getDominantLattice(gravity), [gravity]);
  const atSourceState = useMemo(() => isSourceState(gravity), [gravity]);
  const antiAddress = useMemo(() => generateAntiAddress(address), [address]);
  const tesseractGateOpen = useMemo(() => isTesseractGateOpen(gravity, address), [gravity, address]);
  
  const hapticFrequency = useMemo(() => {
    return getHapticFrequency(depth, isVoidMode);
  }, [depth, isVoidMode]);
  
  const colors = useMemo(() => {
    const tensionGradient = calculateTensionGradient(gravity, depth);
    return {
      primary: isVoidMode ? getDepthColor(depth, true) : getDepthColor(depth, false),
      secondary: isVoidMode ? getDepthColor(depth, false) : getDepthColor(depth, true),
      gradient: tensionGradient.gradient,
      blendFactor: tensionGradient.blendFactor,
    };
  }, [depth, gravity, isVoidMode]);
  
  const totalStates = useMemo(() => Math.pow(9, depth + 2), [depth]);
  
  // Current coordinate stability (from dwell history)
  const currentStability = useMemo(() => {
    if (!selectedCell) return 'WILD';
    const key = `${selectedCell.row}-${selectedCell.col}`;
    const data = dwellMapRef.current.get(key);
    if (!data) return 'WILD';
    
    const visits = data.visits;
    if (visits >= TESSERACT_CONFIG.DWELL_THRESHOLDS.CRYSTALLIZED) return 'CRYSTALLIZED';
    if (visits >= TESSERACT_CONFIG.DWELL_THRESHOLDS.HARDENED) return 'HARDENED';
    if (visits >= TESSERACT_CONFIG.DWELL_THRESHOLDS.STABLE) return 'STABLE';
    if (visits >= TESSERACT_CONFIG.DWELL_THRESHOLDS.FORMING) return 'FORMING';
    return 'WILD';
  }, [selectedCell]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // SNAP-POINT GRAVITY (INT-04: Magnetic Snap)
  // ─────────────────────────────────────────────────────────────────────────
  
  const findNearestSnapPoint = useCallback((g) => {
    if (!enableSnapPoints) return null;
    
    for (const point of TESSERACT_CONFIG.SACRED_GRAVITY_POINTS) {
      if (Math.abs(g - point.gravity) <= TESSERACT_CONFIG.SNAP_THRESHOLD) {
        return point;
      }
    }
    return null;
  }, [enableSnapPoints]);
  
  const snapToPoint = useCallback((point) => {
    if (!point) return;
    
    setGravity(point.gravity);
    gravityRef.current = point.gravity;
    setNearSnapPoint(point);
    
    // Haptic feedback for snap
    if (enableHaptics && navigator.vibrate) {
      navigator.vibrate(TESSERACT_CONFIG.HAPTIC_PATTERNS.snap);
    }
  }, [enableHaptics]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // GRAVITY CONTROL
  // ─────────────────────────────────────────────────────────────────────────
  
  const updateGravity = useCallback((newGravity, skipSnap = false) => {
    const clamped = Math.max(0, Math.min(1, newGravity));
    
    // Check for snap point
    if (!skipSnap) {
      const snapPoint = findNearestSnapPoint(clamped);
      if (snapPoint && Math.abs(clamped - snapPoint.gravity) <= TESSERACT_CONFIG.SNAP_THRESHOLD / 2) {
        snapToPoint(snapPoint);
        return;
      }
      setNearSnapPoint(snapPoint);
    }
    
    setGravity(clamped);
    gravityRef.current = clamped;
    
    // Auto-void mode based on gravity
    if (enableAutoVoid) {
      if (clamped < 0.1 && !isVoidMode) {
        enterVoidMode();
      } else if (clamped > 0.9 && isVoidMode) {
        exitVoidMode();
      }
    }
    
    // Reset activity timer
    lastActivityRef.current = Date.now();
  }, [findNearestSnapPoint, snapToPoint, isVoidMode, enableAutoVoid]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // VOID MODE CONTROL
  // ─────────────────────────────────────────────────────────────────────────
  
  const enterVoidMode = useCallback(() => {
    setIsVoidMode(true);
    onModeChange?.('VOID');
    
    if (enableHaptics && navigator.vibrate) {
      navigator.vibrate(TESSERACT_CONFIG.HAPTIC_PATTERNS.void_enter);
    }
  }, [enableHaptics, onModeChange]);
  
  const exitVoidMode = useCallback(() => {
    setIsVoidMode(false);
    onModeChange?.('MATTER');
    
    if (enableHaptics && navigator.vibrate) {
      navigator.vibrate(TESSERACT_CONFIG.HAPTIC_PATTERNS.void_exit);
    }
  }, [enableHaptics, onModeChange]);
  
  const toggleVoidMode = useCallback(() => {
    if (isVoidMode) {
      exitVoidMode();
    } else {
      enterVoidMode();
    }
  }, [isVoidMode, enterVoidMode, exitVoidMode]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // DIVE / SURFACE (Zero-Latency)
  // ─────────────────────────────────────────────────────────────────────────
  
  const dive = useCallback((hexagramNumber, languageCode) => {
    if (isZooming || depth >= TESSERACT_CONFIG.MAX_DEPTH) return false;
    if (!selectedCell) return false;
    
    setIsZooming(true);
    setZoomDirection('dive');
    
    // Update refs immediately (no re-render lag)
    const newDepth = depth + 1;
    depthRef.current = newDepth;
    
    // Build address segment
    const hexBits = hexagramNumber.toString(2).padStart(6, '0');
    const langIndex = TESSERACT_CONFIG.SACRED_GRAVITY_POINTS.findIndex(p => p.hexagram === hexagramNumber) % 9;
    const langBits = langIndex.toString(2).padStart(4, '0');
    const segment = `${hexBits}|${langBits}`;
    
    // Update path
    const newPath = [...pathRef.current, {
      depth: newDepth - 1,
      hexagram_number: hexagramNumber,
      language_code: languageCode,
      row: selectedCell.row,
      col: selectedCell.col,
    }];
    pathRef.current = newPath;
    
    // Update address
    const newAddress = address ? `${address}|${segment}` : segment;
    
    // Haptic feedback
    if (enableHaptics && navigator.vibrate) {
      navigator.vibrate(TESSERACT_CONFIG.HAPTIC_PATTERNS.dive);
    }
    
    // Animate
    setTimeout(() => {
      setDepth(newDepth);
      setAddress(newAddress);
      setSelectedCell(null);
      setIsZooming(false);
      setZoomDirection(null);
      onDepthChange?.(newDepth);
    }, TESSERACT_CONFIG.SNATCH_DURATION);
    
    return true;
  }, [isZooming, depth, selectedCell, address, enableHaptics, onDepthChange]);
  
  const surface = useCallback(() => {
    if (isZooming || depth <= 0) return false;
    
    setIsZooming(true);
    setZoomDirection('surface');
    
    const newDepth = depth - 1;
    depthRef.current = newDepth;
    
    // Trim path and address
    const newPath = pathRef.current.slice(0, -1);
    pathRef.current = newPath;
    
    const addressSegments = address.split('|');
    const newAddress = addressSegments.slice(0, -2).join('|');
    
    // Haptic feedback
    if (enableHaptics && navigator.vibrate) {
      navigator.vibrate(TESSERACT_CONFIG.HAPTIC_PATTERNS.surface);
    }
    
    setTimeout(() => {
      setDepth(newDepth);
      setAddress(newAddress);
      setIsZooming(false);
      setZoomDirection(null);
      onDepthChange?.(newDepth);
    }, TESSERACT_CONFIG.SNATCH_DURATION);
    
    return true;
  }, [isZooming, depth, address, enableHaptics, onDepthChange]);
  
  const emergencySurface = useCallback(() => {
    // Instant reset - no animation
    pathRef.current = [];
    depthRef.current = 0;
    setDepth(0);
    setAddress('');
    setSelectedCell(null);
    setIsZooming(false);
    setZoomDirection(null);
    
    if (enableHaptics && navigator.vibrate) {
      navigator.vibrate([100, 30, 100, 30, 150]);
    }
    
    onDepthChange?.(0);
  }, [enableHaptics, onDepthChange]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // WARP-DRIVE NAVIGATION (INT-02: Coordinate Hot-Keying)
  // ─────────────────────────────────────────────────────────────────────────
  
  const warpToAddress = useCallback((targetAddress) => {
    const validation = validateAddress(targetAddress);
    if (!validation.valid) {
      console.warn('[TesseractCore] Invalid warp address:', validation.error);
      return false;
    }
    
    // Parse address to extract path
    const segments = targetAddress.split('|');
    const newPath = [];
    const newDepth = Math.floor(segments.length / 2);
    
    for (let i = 0; i < segments.length - 1; i += 2) {
      const hexBits = segments[i];
      const langBits = segments[i + 1];
      const hexNum = parseInt(hexBits, 2);
      const langIdx = parseInt(langBits, 2);
      
      newPath.push({
        depth: i / 2,
        hexagram_number: hexNum,
        language_code: ['en', 'es', 'ja', 'zh-cmn', 'zh-yue', 'sa', 'hi', 'lkt', 'dak'][langIdx % 9],
        row: Math.floor(hexNum / 9),
        col: hexNum % 9,
      });
    }
    
    // Trigger tesseract haptic for warp
    if (enableHaptics && navigator.vibrate) {
      navigator.vibrate(TESSERACT_CONFIG.HAPTIC_PATTERNS.tesseract);
    }
    
    // Set all state at once
    pathRef.current = newPath;
    depthRef.current = newDepth;
    setDepth(newDepth);
    setAddress(targetAddress);
    setSelectedCell(null);
    onDepthChange?.(newDepth);
    
    return true;
  }, [enableHaptics, onDepthChange]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // CELL SELECTION + DWELL TRACKING (with 200ms Acoustic Bloom)
  // ─────────────────────────────────────────────────────────────────────────
  
  // Dwell timer ref for acoustic bloom
  const dwellTimerRef = useRef(null);
  const currentDwellCellRef = useRef(null);
  
  const selectCell = useCallback((row, col) => {
    const cellKey = `${row}-${col}`;
    
    // Clear any existing dwell timer
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    
    // Reset dwell stable state on new selection
    setIsDwellStable(false);
    
    setSelectedCell({ row, col });
    lastActivityRef.current = Date.now();
    currentDwellCellRef.current = cellKey;
    
    // Update dwell map
    const existing = dwellMapRef.current.get(cellKey) || { visits: 0, totalMs: 0, lastVisit: null };
    dwellMapRef.current.set(cellKey, {
      ...existing,
      visits: existing.visits + 1,
      lastVisit: Date.now(),
    });
    
    // Light haptic on selection (immediate)
    if (enableHaptics && navigator.vibrate) {
      navigator.vibrate([10]);
    }
    
    // ACOUSTIC BLOOM: Start 200ms dwell timer
    // Sound will only "bloom" if coordinate is held for 200ms
    dwellTimerRef.current = setTimeout(() => {
      // Only trigger if still on same cell
      if (currentDwellCellRef.current === cellKey) {
        // Coordinate is stable - audio can bloom
        setIsDwellStable(true);
        console.log('[TesseractCore] Dwell threshold reached - audio bloom permitted');
      }
    }, TESSERACT_CONFIG.ACOUSTIC_BLOOM_MS);
    
  }, [enableHaptics]);
  
  // Cleanup dwell timer on unmount
  useEffect(() => {
    return () => {
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
      }
    };
  }, []);
  
  // ─────────────────────────────────────────────────────────────────────────
  // SEED MINTING (Unified)
  // ─────────────────────────────────────────────────────────────────────────
  
  const mintSeed = useCallback(async (constellationName = null) => {
    if (depth < 1 || !address) return null;
    
    const seedData = {
      address_36bit: address,
      path: pathRef.current,
      linguistic_state: pathRef.current[pathRef.current.length - 1]?.language_code || 'en',
      dwell_history: Array.from(dwellMapRef.current.entries()).map(([coord, data]) => ({
        coordinate: coord,
        visits: data.visits,
        total_dwell_ms: data.totalMs,
        stability: data.visits >= 16 ? 'CRYSTALLIZED' : 
                   data.visits >= 11 ? 'HARDENED' :
                   data.visits >= 6 ? 'STABLE' :
                   data.visits >= 3 ? 'FORMING' : 'WILD',
      })),
      minter_id: 'user', // Would come from auth
      constellation_name: constellationName,
      is_inverse: isVoidMode,
      anti_address: antiAddress,
      gravity_at_mint: gravity,
      is_tesseract_seed: tesseractGateOpen && depth >= 4,
    };
    
    // Legendary haptic if high rarity potential
    if ((isVoidMode || tesseractGateOpen || atSourceState) && enableHaptics && navigator.vibrate) {
      navigator.vibrate(TESSERACT_CONFIG.HAPTIC_PATTERNS.legendary);
    }
    
    // Save locally
    const localSeed = {
      ...seedData,
      seed_id: `local_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setSeeds(prev => [...prev, localSeed]);
    
    // API call
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/seeds/mint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seedData),
      });
      
      if (response.ok) {
        const result = await response.json();
        onSeedMinted?.(result);
        return result;
      }
    } catch (error) {
      console.error('[TesseractCore] Mint API error:', error);
    }
    
    onSeedMinted?.(localSeed);
    return localSeed;
  }, [depth, address, isVoidMode, antiAddress, gravity, tesseractGateOpen, atSourceState, enableHaptics, onSeedMinted]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // HUD FADE EFFECT (Stillness Detection)
  // ─────────────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    const checkStillness = () => {
      const elapsed = Date.now() - lastActivityRef.current;
      
      if (elapsed > TESSERACT_CONFIG.HUD_FADE_DWELL) {
        setHudOpacity(TESSERACT_CONFIG.HUD_FADE_OPACITY);
      } else {
        setHudOpacity(1);
      }
      
      animationFrameRef.current = requestAnimationFrame(checkStillness);
    };
    
    animationFrameRef.current = requestAnimationFrame(checkStillness);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Wake HUD on any state change
  useEffect(() => {
    lastActivityRef.current = Date.now();
    setHudOpacity(1);
  }, [gravity, depth, selectedCell, isVoidMode]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // MEM-01: CLEAR ANCHOR (Reset persistence)
  // ─────────────────────────────────────────────────────────────────────────
  
  const clearAnchor = useCallback(() => {
    try {
      localStorage.removeItem(PERSISTENCE_KEY);
      console.log('[MEM-01] Tesseract Anchor cleared');
    } catch (err) {
      console.warn('[MEM-01] Failed to clear Tesseract Anchor:', err);
    }
  }, []);
  
  // ─────────────────────────────────────────────────────────────────────────
  // RETURN VALUE
  // ─────────────────────────────────────────────────────────────────────────
  
  return {
    // Core state
    gravity,
    inverseGravity,
    depth,
    address,
    antiAddress,
    selectedCell,
    
    // Mode
    isVoidMode,
    dominantLattice,
    atSourceState,
    tesseractGateOpen,
    
    // Animation
    isZooming,
    zoomDirection,
    
    // Visual
    colors,
    hudOpacity,
    
    // Snap points
    nearSnapPoint,
    
    // Metrics
    totalStates,
    hapticFrequency,
    currentStability,
    gravityTension,
    
    // Acoustic Bloom
    isDwellStable,  // True after 200ms dwell - audio permitted
    
    // Path & seeds
    path: pathRef.current,
    seeds,
    
    // Actions - Gravity
    updateGravity,
    snapToPoint,
    
    // Actions - Mode
    enterVoidMode,
    exitVoidMode,
    toggleVoidMode,
    
    // Actions - Navigation
    dive,
    surface,
    emergencySurface,
    warpToAddress,
    selectCell,
    
    // Actions - Seeds
    mintSeed,
    
    // MEM-01: Persistence
    clearAnchor,
    
    // Config
    config: TESSERACT_CONFIG,
    maxDepth: TESSERACT_CONFIG.MAX_DEPTH,
  };
}

export default useTesseractCore;
export { TESSERACT_CONFIG };
