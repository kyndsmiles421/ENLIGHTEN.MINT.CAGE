/**
 * useInverseLattice.js — The Void Navigation Hook
 * 
 * INV-05: MIRROR-HAPTIC RESONANCE
 * INV-06: CHROMATIC INVERSION SHADER
 * INV-09: GENESIS "ANTI-SEED" MINTING
 * INV-10: TESSERACT-ALPHA FOLDING
 * 
 * This hook manages the "Negative Space" of the 9×9 lattice,
 * creating the Dark Matter layer that allows spatial origami.
 * 
 * USAGE:
 * const inverse = useInverseLattice({ gravity, depth, address });
 * 
 * PROVIDES:
 * - Inverse gravity calculation
 * - Chromatic inversion states
 * - Anti-seed minting capability
 * - Tesseract intersection detection
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  INVERSE_CONFIG,
  calculateInverseGravity,
  isSourceState,
  calculateGravityTension,
  getDominantLattice,
  generateAntiAddress,
  xorAddresses,
  isSymmetricIntersection,
  isTesseractGateOpen,
  calculateTesseractCoordinates,
  getHapticFrequency,
  generateInverseHapticPattern,
  getDepthColor,
  calculateTensionGradient,
  validateAddress,
  clampDepth,
} from '../config/InverseRegistry';

// ═══════════════════════════════════════════════════════════════════════════
// HOOK CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_OPTIONS = {
  enableHaptics: true,
  enableColorInversion: true,
  autoDetectTesseract: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// THE INVERSE LATTICE HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useInverseLattice(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────
  
  const [gravity, setGravity] = useState(0.5);
  const [depth, setDepth] = useState(0);
  const [address, setAddress] = useState('');
  const [isInverseMode, setIsInverseMode] = useState(false);
  const [tesseractActive, setTesseractActive] = useState(false);
  
  // ─────────────────────────────────────────────────────────────────────────
  // DERIVED VALUES (INV-02: Reciprocal Gravity)
  // ─────────────────────────────────────────────────────────────────────────
  
  const inverseGravity = useMemo(() => {
    return calculateInverseGravity(gravity);
  }, [gravity]);
  
  const gravityTension = useMemo(() => {
    return calculateGravityTension(gravity);
  }, [gravity]);
  
  const dominantLattice = useMemo(() => {
    return getDominantLattice(gravity);
  }, [gravity]);
  
  const atSourceState = useMemo(() => {
    return isSourceState(gravity);
  }, [gravity]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // ANTI-ADDRESS (INV-03: Parity Bit Logic)
  // ─────────────────────────────────────────────────────────────────────────
  
  const antiAddress = useMemo(() => {
    return generateAntiAddress(address);
  }, [address]);
  
  const addressXor = useMemo(() => {
    if (!address || !antiAddress) return null;
    return xorAddresses(address, antiAddress);
  }, [address, antiAddress]);
  
  const isSymmetric = useMemo(() => {
    return isSymmetricIntersection(addressXor);
  }, [addressXor]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // TESSERACT GATE (INV-04: 9^4 Intersection Filter)
  // ─────────────────────────────────────────────────────────────────────────
  
  const tesseractGateOpen = useMemo(() => {
    return isTesseractGateOpen(gravity, address);
  }, [gravity, address]);
  
  // Auto-detect tesseract activation
  useEffect(() => {
    if (opts.autoDetectTesseract && tesseractGateOpen && depth >= 4) {
      setTesseractActive(true);
    } else if (!tesseractGateOpen) {
      setTesseractActive(false);
    }
  }, [tesseractGateOpen, depth, opts.autoDetectTesseract]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // HAPTICS (INV-05: Mirror-Haptic Resonance)
  // ─────────────────────────────────────────────────────────────────────────
  
  const hapticFrequency = useMemo(() => {
    return getHapticFrequency(depth, isInverseMode);
  }, [depth, isInverseMode]);
  
  const triggerInverseHaptic = useCallback(() => {
    if (!opts.enableHaptics || !navigator.vibrate) return;
    
    const pattern = generateInverseHapticPattern(depth);
    navigator.vibrate(pattern);
  }, [depth, opts.enableHaptics]);
  
  const triggerVoidPulse = useCallback(() => {
    if (!opts.enableHaptics || !navigator.vibrate) return;
    
    // "Sensory Vacuum" - long pause surrounded by short pulses
    const voidPattern = [20, 100, 20, 300, 20, 100, 20];
    navigator.vibrate(voidPattern);
  }, [opts.enableHaptics]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // COLORS (INV-06: Chromatic Inversion Shader)
  // ─────────────────────────────────────────────────────────────────────────
  
  const colors = useMemo(() => {
    if (!opts.enableColorInversion) {
      return {
        primary: getDepthColor(depth, false),
        secondary: getDepthColor(depth, false),
        isInverted: false,
      };
    }
    
    const tensionGradient = calculateTensionGradient(gravity, depth);
    
    return {
      primary: isInverseMode ? getDepthColor(depth, true) : getDepthColor(depth, false),
      secondary: isInverseMode ? getDepthColor(depth, false) : getDepthColor(depth, true),
      gradient: tensionGradient.gradient,
      blendFactor: tensionGradient.blendFactor,
      isInverted: isInverseMode,
    };
  }, [depth, gravity, isInverseMode, opts.enableColorInversion]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // MODE CONTROL
  // ─────────────────────────────────────────────────────────────────────────
  
  const enterInverseMode = useCallback(() => {
    setIsInverseMode(true);
    triggerVoidPulse();
  }, [triggerVoidPulse]);
  
  const exitInverseMode = useCallback(() => {
    setIsInverseMode(false);
    triggerInverseHaptic();
  }, [triggerInverseHaptic]);
  
  const toggleInverseMode = useCallback(() => {
    if (isInverseMode) {
      exitInverseMode();
    } else {
      enterInverseMode();
    }
  }, [isInverseMode, enterInverseMode, exitInverseMode]);
  
  // Auto-flip to inverse when gravity crosses threshold
  useEffect(() => {
    if (gravity < 0.1 && !isInverseMode) {
      enterInverseMode();
    } else if (gravity > 0.9 && isInverseMode) {
      exitInverseMode();
    }
  }, [gravity, isInverseMode, enterInverseMode, exitInverseMode]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // ANTI-SEED MINTING (INV-09: Genesis Anti-Seed)
  // ─────────────────────────────────────────────────────────────────────────
  
  const canMintAntiSeed = useMemo(() => {
    // Can only mint anti-seed if:
    // 1. In inverse mode
    // 2. Have a valid address
    // 3. At depth >= 1
    return isInverseMode && address && depth >= 1;
  }, [isInverseMode, address, depth]);
  
  const prepareAntiSeedData = useCallback((path = []) => {
    if (!canMintAntiSeed) return null;
    
    const validation = validateAddress(address);
    if (!validation.valid) {
      console.warn('[InverseLattice] Invalid address:', validation.error);
      return null;
    }
    
    return {
      address_36bit: antiAddress,  // Use anti-address as the seed address
      original_address: address,   // Store original for reference
      path: path.map(node => ({
        ...node,
        row: -node.row,  // Invert coordinates
        col: -node.col,
        hexagram_number: 63 - node.hexagram_number,  // Inverse hexagram
      })),
      is_inverse: true,
      anti_address: address,  // The "anti" of the anti is the original
      gravity_at_mint: inverseGravity,
      is_tesseract_seed: tesseractActive,
    };
  }, [canMintAntiSeed, address, antiAddress, inverseGravity, tesseractActive]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // TESSERACT FOLDING (INV-10: Tesseract-Alpha)
  // ─────────────────────────────────────────────────────────────────────────
  
  const tesseractCoordinates = useMemo(() => {
    if (!tesseractActive || depth < 4) return null;
    
    // We need the path to calculate, but we don't have it in this hook
    // This will be populated when path is provided
    return null;
  }, [tesseractActive, depth]);
  
  const canFoldTesseract = useMemo(() => {
    // Requirements for Tesseract folding:
    // 1. At Source State
    // 2. Depth >= 4 (entering 9^4 space)
    // 3. Symmetric intersection
    // 4. Tesseract gate open
    return atSourceState && depth >= 4 && isSymmetric && tesseractGateOpen;
  }, [atSourceState, depth, isSymmetric, tesseractGateOpen]);
  
  const initiateTesseractFold = useCallback(() => {
    if (!canFoldTesseract) {
      console.warn('[InverseLattice] Tesseract fold requirements not met');
      return false;
    }
    
    // Trigger the fold
    setTesseractActive(true);
    
    // Heavy haptic feedback for tesseract entry
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200, 100, 200, 50, 100, 50, 100]);
    }
    
    console.log('[InverseLattice] TESSERACT FOLD INITIATED');
    return true;
  }, [canFoldTesseract]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────
  
  const updateGravity = useCallback((newGravity) => {
    const clamped = Math.max(0, Math.min(1, newGravity));
    setGravity(clamped);
  }, []);
  
  const updateDepth = useCallback((newDepth) => {
    setDepth(clampDepth(newDepth));
  }, []);
  
  const updateAddress = useCallback((newAddress) => {
    const validation = validateAddress(newAddress);
    if (validation.valid || !newAddress) {
      setAddress(newAddress || '');
    }
  }, []);
  
  // ─────────────────────────────────────────────────────────────────────────
  // RETURN VALUE
  // ─────────────────────────────────────────────────────────────────────────
  
  return {
    // State
    gravity,
    inverseGravity,
    depth,
    address,
    antiAddress,
    isInverseMode,
    
    // Derived values
    gravityTension,
    dominantLattice,
    atSourceState,
    isSymmetric,
    addressXor,
    
    // Haptics
    hapticFrequency,
    triggerInverseHaptic,
    triggerVoidPulse,
    
    // Colors
    colors,
    
    // Mode control
    enterInverseMode,
    exitInverseMode,
    toggleInverseMode,
    
    // Anti-seed minting
    canMintAntiSeed,
    prepareAntiSeedData,
    
    // Tesseract
    tesseractGateOpen,
    tesseractActive,
    tesseractCoordinates,
    canFoldTesseract,
    initiateTesseractFold,
    
    // Update functions
    updateGravity,
    updateDepth,
    updateAddress,
    
    // Config
    INVERSE_CONFIG,
  };
}

export default useInverseLattice;
