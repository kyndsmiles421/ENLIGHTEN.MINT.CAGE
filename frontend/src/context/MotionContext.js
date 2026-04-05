/**
 * MotionContext.js — The Vibrational Physics Layer
 * 
 * SEPARATION OF CONCERNS:
 * - MixerContext: Audio DATA (frequencies, sounds, volumes)
 * - MotionContext: PHYSICS (position, velocity, rotation, expansion)
 * 
 * THE GOLDEN RATIO THROTTLE (φ = 1.618)
 * State only updates when values change by more than 1.618%
 * This prevents the "Box Logic vs Spherical Logic" fight that causes
 * the "Maximum update depth exceeded" cascade.
 * 
 * SPHERICAL MECHANICS:
 * - globalAnchor: Vector3 center point (the SageAvatar's position)
 * - viewMode: 'external' (orbiting) | 'internal' (inside the sphere)
 * - expansionFactor: Current zoom/multiplication level
 * - rotationTorque: Angular velocity from swipe gestures
 */

import React, { createContext, useContext, useRef, useCallback, useMemo } from 'react';
import { useSyncExternalStore } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895; // Golden Ratio
const THROTTLE_THRESHOLD = PHI / 100; // 1.618% change required for state update
const MAX_EXPANSION = 6; // Maximum fractal depth (matches MAX_DEPTH)

// ═══════════════════════════════════════════════════════════════════════════
// MOTION STATE (Singleton - bypasses React reconciliation)
// ═══════════════════════════════════════════════════════════════════════════

let motionState = {
  // Global Anchor — The Vector3 origin point
  anchor: { x: 0.5, y: 0.5, z: 0 }, // Normalized 0-1 (center of viewport)
  
  // View Mode — External (orbiting) vs Internal (inside sphere)
  viewMode: 'external', // 'external' | 'internal'
  isInverting: false,   // Animation flag during transition
  
  // Expansion — Fractal zoom level
  expansionFactor: 1.0,  // 1.0 = base, 2.0 = first multiplication
  targetExpansion: 1.0,  // For smooth interpolation
  
  // Rotation — Angular state
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  torqueX: 0, // Angular velocity
  torqueY: 0,
  torqueZ: 0,
  
  // Lens Distortion — Spherical warp intensity
  lensWarp: 0, // 0 = flat, 1 = full sphere
  
  // Velocity Gate — Touch/swipe tracking
  lastTouchX: 0,
  lastTouchY: 0,
  touchVelocityX: 0,
  touchVelocityY: 0,
  isTouching: false,
  
  // Version counter for atomic updates
  version: 0,
};

// Store previous values for Golden Ratio throttling
let prevMotionState = { ...motionState };

// ═══════════════════════════════════════════════════════════════════════════
// SUBSCRIBERS
// ═══════════════════════════════════════════════════════════════════════════

const subscribers = new Set();
let rafScheduled = false;

function notifySubscribers() {
  // Batch notifications in animation frame to prevent React spam
  if (rafScheduled) return;
  
  rafScheduled = true;
  requestAnimationFrame(() => {
    rafScheduled = false;
    subscribers.forEach(callback => callback());
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN RATIO THROTTLE — Only update if change > 1.618%
// ═══════════════════════════════════════════════════════════════════════════

function shouldUpdate(prevValue, newValue) {
  if (typeof prevValue !== 'number' || typeof newValue !== 'number') {
    return prevValue !== newValue;
  }
  
  // Avoid division by zero
  if (prevValue === 0) return Math.abs(newValue) > THROTTLE_THRESHOLD;
  
  const percentChange = Math.abs((newValue - prevValue) / prevValue);
  return percentChange > THROTTLE_THRESHOLD;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOTION STORE API
// ═══════════════════════════════════════════════════════════════════════════

export const MotionStore = {
  getSnapshot() {
    return motionState;
  },
  
  getServerSnapshot() {
    return motionState;
  },
  
  subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // ANCHOR UPDATES (With Golden Ratio Throttle)
  // ─────────────────────────────────────────────────────────────────────────
  
  setAnchor(x, y, z = 0) {
    const shouldUpdateX = shouldUpdate(prevMotionState.anchor.x, x);
    const shouldUpdateY = shouldUpdate(prevMotionState.anchor.y, y);
    const shouldUpdateZ = shouldUpdate(prevMotionState.anchor.z, z);
    
    if (!shouldUpdateX && !shouldUpdateY && !shouldUpdateZ) return;
    
    motionState = {
      ...motionState,
      anchor: { x, y, z },
      version: motionState.version + 1,
    };
    prevMotionState.anchor = { x, y, z };
    notifySubscribers();
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // VIEW MODE (Nadir/Zenith Inversion)
  // ─────────────────────────────────────────────────────────────────────────
  
  setViewMode(mode) {
    if (mode !== 'external' && mode !== 'internal') return;
    if (mode === motionState.viewMode) return;
    
    motionState = {
      ...motionState,
      viewMode: mode,
      isInverting: true,
      version: motionState.version + 1,
    };
    notifySubscribers();
    
    // Animation complete after 800ms
    setTimeout(() => {
      motionState = {
        ...motionState,
        isInverting: false,
        version: motionState.version + 1,
      };
      notifySubscribers();
    }, 800);
    
    console.log(`[MotionContext] View mode: ${mode.toUpperCase()}`);
  },
  
  toggleViewMode() {
    const newMode = motionState.viewMode === 'external' ? 'internal' : 'external';
    MotionStore.setViewMode(newMode);
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // EXPANSION (Fractal Multiplication)
  // ─────────────────────────────────────────────────────────────────────────
  
  setExpansion(factor) {
    const clamped = Math.max(1, Math.min(MAX_EXPANSION, factor));
    if (!shouldUpdate(prevMotionState.expansionFactor, clamped)) return;
    
    motionState = {
      ...motionState,
      expansionFactor: clamped,
      version: motionState.version + 1,
    };
    prevMotionState.expansionFactor = clamped;
    notifySubscribers();
  },
  
  multiplyExpansion() {
    // Each multiplication doubles the fractal depth
    const newFactor = Math.min(motionState.expansionFactor * 2, MAX_EXPANSION);
    MotionStore.setExpansion(newFactor);
    console.log(`[MotionContext] Expansion multiplied: ${newFactor}x`);
  },
  
  collapseExpansion() {
    // Inverse multiplication
    const newFactor = Math.max(motionState.expansionFactor / 2, 1);
    MotionStore.setExpansion(newFactor);
    console.log(`[MotionContext] Expansion collapsed: ${newFactor}x`);
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // ROTATION (Torque-based Angular Momentum)
  // ─────────────────────────────────────────────────────────────────────────
  
  setRotation(x, y, z) {
    const shouldUpdateX = shouldUpdate(prevMotionState.rotationX, x);
    const shouldUpdateY = shouldUpdate(prevMotionState.rotationY, y);
    const shouldUpdateZ = shouldUpdate(prevMotionState.rotationZ, z);
    
    if (!shouldUpdateX && !shouldUpdateY && !shouldUpdateZ) return;
    
    motionState = {
      ...motionState,
      rotationX: x,
      rotationY: y,
      rotationZ: z,
      version: motionState.version + 1,
    };
    prevMotionState.rotationX = x;
    prevMotionState.rotationY = y;
    prevMotionState.rotationZ = z;
    notifySubscribers();
  },
  
  applyTorque(tx, ty, tz = 0) {
    motionState = {
      ...motionState,
      torqueX: motionState.torqueX + tx,
      torqueY: motionState.torqueY + ty,
      torqueZ: motionState.torqueZ + tz,
      version: motionState.version + 1,
    };
    notifySubscribers();
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // LENS WARP (Spherical Distortion)
  // ─────────────────────────────────────────────────────────────────────────
  
  setLensWarp(intensity) {
    const clamped = Math.max(0, Math.min(1, intensity));
    if (!shouldUpdate(prevMotionState.lensWarp, clamped)) return;
    
    motionState = {
      ...motionState,
      lensWarp: clamped,
      version: motionState.version + 1,
    };
    prevMotionState.lensWarp = clamped;
    notifySubscribers();
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // VELOCITY GATE (Touch/Swipe Tracking)
  // ─────────────────────────────────────────────────────────────────────────
  
  startTouch(x, y) {
    motionState = {
      ...motionState,
      lastTouchX: x,
      lastTouchY: y,
      touchVelocityX: 0,
      touchVelocityY: 0,
      isTouching: true,
      version: motionState.version + 1,
    };
    notifySubscribers();
  },
  
  updateTouch(x, y) {
    if (!motionState.isTouching) return;
    
    const vx = x - motionState.lastTouchX;
    const vy = y - motionState.lastTouchY;
    
    // Apply torque based on swipe velocity
    MotionStore.applyTorque(vy * 0.01, vx * 0.01);
    
    motionState = {
      ...motionState,
      lastTouchX: x,
      lastTouchY: y,
      touchVelocityX: vx,
      touchVelocityY: vy,
      version: motionState.version + 1,
    };
    notifySubscribers();
  },
  
  endTouch() {
    motionState = {
      ...motionState,
      isTouching: false,
      version: motionState.version + 1,
    };
    notifySubscribers();
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // PHYSICS TICK (Called from useFrame / RAF loop)
  // ─────────────────────────────────────────────────────────────────────────
  
  tick(deltaTime = 0.016) {
    // Apply torque to rotation (with damping)
    const damping = 0.95;
    const newRotationX = motionState.rotationX + motionState.torqueX;
    const newRotationY = motionState.rotationY + motionState.torqueY;
    const newRotationZ = motionState.rotationZ + motionState.torqueZ;
    
    const newTorqueX = motionState.torqueX * damping;
    const newTorqueY = motionState.torqueY * damping;
    const newTorqueZ = motionState.torqueZ * damping;
    
    // Only update if significant change (Golden Ratio throttle)
    const rotationChanged = 
      shouldUpdate(prevMotionState.rotationX, newRotationX) ||
      shouldUpdate(prevMotionState.rotationY, newRotationY) ||
      shouldUpdate(prevMotionState.rotationZ, newRotationZ);
    
    if (rotationChanged || Math.abs(newTorqueX) > 0.001 || Math.abs(newTorqueY) > 0.001) {
      motionState = {
        ...motionState,
        rotationX: newRotationX,
        rotationY: newRotationY,
        rotationZ: newRotationZ,
        torqueX: Math.abs(newTorqueX) > 0.001 ? newTorqueX : 0,
        torqueY: Math.abs(newTorqueY) > 0.001 ? newTorqueY : 0,
        torqueZ: Math.abs(newTorqueZ) > 0.001 ? newTorqueZ : 0,
        version: motionState.version + 1,
      };
      prevMotionState.rotationX = newRotationX;
      prevMotionState.rotationY = newRotationY;
      prevMotionState.rotationZ = newRotationZ;
      notifySubscribers();
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────────────────────────────────
  
  reset() {
    motionState = {
      anchor: { x: 0.5, y: 0.5, z: 0 },
      viewMode: 'external',
      isInverting: false,
      expansionFactor: 1.0,
      targetExpansion: 1.0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      torqueX: 0,
      torqueY: 0,
      torqueZ: 0,
      lensWarp: 0,
      lastTouchX: 0,
      lastTouchY: 0,
      touchVelocityX: 0,
      touchVelocityY: 0,
      isTouching: false,
      version: motionState.version + 1,
    };
    prevMotionState = { ...motionState };
    notifySubscribers();
    console.log('[MotionContext] Reset to origin');
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useMotion() {
  const state = useSyncExternalStore(
    MotionStore.subscribe,
    MotionStore.getSnapshot,
    MotionStore.getServerSnapshot
  );
  
  // Memoized actions
  const actions = useMemo(() => ({
    setAnchor: MotionStore.setAnchor,
    setViewMode: MotionStore.setViewMode,
    toggleViewMode: MotionStore.toggleViewMode,
    setExpansion: MotionStore.setExpansion,
    multiplyExpansion: MotionStore.multiplyExpansion,
    collapseExpansion: MotionStore.collapseExpansion,
    setRotation: MotionStore.setRotation,
    applyTorque: MotionStore.applyTorque,
    setLensWarp: MotionStore.setLensWarp,
    startTouch: MotionStore.startTouch,
    updateTouch: MotionStore.updateTouch,
    endTouch: MotionStore.endTouch,
    tick: MotionStore.tick,
    reset: MotionStore.reset,
  }), []);
  
  return {
    // State
    anchor: state.anchor,
    viewMode: state.viewMode,
    isInverting: state.isInverting,
    expansionFactor: state.expansionFactor,
    rotationX: state.rotationX,
    rotationY: state.rotationY,
    rotationZ: state.rotationZ,
    torqueX: state.torqueX,
    torqueY: state.torqueY,
    lensWarp: state.lensWarp,
    isTouching: state.isTouching,
    touchVelocityX: state.touchVelocityX,
    touchVelocityY: state.touchVelocityY,
    
    // Computed
    isExpanded: state.expansionFactor > 1,
    isInternal: state.viewMode === 'internal',
    
    // Actions
    ...actions,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SELECTOR HOOK (For performance-critical components)
// ═══════════════════════════════════════════════════════════════════════════

export function useMotionSelector(selector) {
  return useSyncExternalStore(
    MotionStore.subscribe,
    () => selector(MotionStore.getSnapshot()),
    () => selector(MotionStore.getServerSnapshot())
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT PROVIDER (Optional - for React tree compatibility)
// ═══════════════════════════════════════════════════════════════════════════

const MotionContext = createContext(null);

export function MotionProvider({ children }) {
  const motion = useMotion();
  return (
    <MotionContext.Provider value={motion}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotionContext() {
  const ctx = useContext(MotionContext);
  const motionStore = useMotion();
  
  // Return context if available, otherwise fallback to direct store
  return ctx || motionStore;
}

export default MotionStore;
