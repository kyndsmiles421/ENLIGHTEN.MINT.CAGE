/**
 * TOUCH NORMALIZATION SYSTEM (MOB-01)
 * Maps screen touch coordinates to 3D Matrix space
 * 
 * COORDINATE MAPPING:
 * Screen Space: (0, 0) to (screenWidth, screenHeight)
 * Matrix Space: (-1, -1) to (1, 1)
 * 
 * FORMULA: (val / max) * 2 - 1
 * - Input 0 → Output -1 (left/top edge)
 * - Input max/2 → Output 0 (center)
 * - Input max → Output 1 (right/bottom edge)
 * 
 * FEATURES:
 * - Fuzzy Logic: 15-20px touch radius for Sacred Snaps
 * - Velocity Gate: Disable magnetic pull if swipe > 0.5px/ms
 * - Haptic Crescendo: Trigger early within fuzzy radius
 * - Dead Zone: Ignore micro-movements < 3px
 */

import { useCallback, useRef, useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Fuzzy Logic - Touch radius for Sacred Snaps
  FUZZY_RADIUS: 18, // px (15-20px range)
  
  // Velocity Gate - Threshold to disable magnetic pull
  VELOCITY_THRESHOLD: 0.5, // px/ms
  
  // Dead Zone - Ignore micro-movements
  DEAD_ZONE: 3, // px
  
  // Haptic timing within fuzzy radius
  HAPTIC_EARLY_TRIGGER: 0.7, // 70% of way to target
  
  // Smoothing factor for position interpolation
  SMOOTHING: 0.15,
  
  // Momentum decay
  MOMENTUM_DECAY: 0.92,
  
  // Snap animation duration
  SNAP_DURATION: 200, // ms
};

// ═══════════════════════════════════════════════════════════════════════════
// CORE NORMALIZATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Normalize a value from screen space to matrix space (-1 to 1)
 * @param {number} val - Current value (e.g., touchX)
 * @param {number} max - Maximum value (e.g., screenWidth)
 * @returns {number} Normalized value between -1 and 1
 */
export function normalizeTouch(val, max) {
  if (max === 0) return 0;
  return (val / max) * 2 - 1;
}

/**
 * Denormalize from matrix space back to screen space
 * @param {number} normalized - Value between -1 and 1
 * @param {number} max - Maximum screen value
 * @returns {number} Screen coordinate
 */
export function denormalizeTouch(normalized, max) {
  return ((normalized + 1) / 2) * max;
}

/**
 * Normalize a 2D touch point
 * @param {number} x - Touch X coordinate
 * @param {number} y - Touch Y coordinate
 * @param {number} width - Screen/container width
 * @param {number} height - Screen/container height
 * @returns {{ x: number, y: number }} Normalized coordinates
 */
export function normalizePoint(x, y, width, height) {
  return {
    x: normalizeTouch(x, width),
    y: normalizeTouch(y, height),
  };
}

/**
 * Calculate velocity from two points and time delta
 * @param {Object} prev - Previous point { x, y, time }
 * @param {Object} curr - Current point { x, y, time }
 * @returns {{ vx: number, vy: number, speed: number }} Velocity in px/ms
 */
export function calculateVelocity(prev, curr) {
  const dt = curr.time - prev.time;
  if (dt === 0) return { vx: 0, vy: 0, speed: 0 };
  
  const vx = (curr.x - prev.x) / dt;
  const vy = (curr.y - prev.y) / dt;
  const speed = Math.sqrt(vx * vx + vy * vy);
  
  return { vx, vy, speed };
}

/**
 * Check if velocity exceeds the gate threshold
 * @param {number} speed - Current speed in px/ms
 * @returns {boolean} True if velocity is too high for magnetic snap
 */
export function isVelocityGated(speed) {
  return speed > CONFIG.VELOCITY_THRESHOLD;
}

/**
 * Check if a point is within fuzzy radius of a target
 * @param {Object} point - Current point { x, y }
 * @param {Object} target - Target point { x, y }
 * @param {number} radius - Fuzzy radius (default from config)
 * @returns {{ inRange: boolean, distance: number, progress: number }}
 */
export function checkFuzzyRadius(point, target, radius = CONFIG.FUZZY_RADIUS) {
  const dx = point.x - target.x;
  const dy = point.y - target.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const inRange = distance <= radius;
  const progress = inRange ? 1 - (distance / radius) : 0;
  
  return { inRange, distance, progress };
}

/**
 * Apply dead zone filtering
 * @param {number} delta - Movement delta
 * @returns {number} Filtered delta (0 if within dead zone)
 */
export function applyDeadZone(delta) {
  return Math.abs(delta) < CONFIG.DEAD_ZONE ? 0 : delta;
}

/**
 * Smooth interpolation between values
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @param {number} factor - Smoothing factor (0-1)
 * @returns {number} Interpolated value
 */
export function smoothLerp(current, target, factor = CONFIG.SMOOTHING) {
  return current + (target - current) * factor;
}

// ═══════════════════════════════════════════════════════════════════════════
// TOUCH STATE MANAGER
// ═══════════════════════════════════════════════════════════════════════════

class TouchStateManager {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.isActive = false;
    this.startPoint = null;
    this.currentPoint = null;
    this.previousPoint = null;
    this.velocity = { vx: 0, vy: 0, speed: 0 };
    this.normalizedPosition = { x: 0, y: 0 };
    this.momentum = { x: 0, y: 0 };
    this.isVelocityGated = false;
    this.snapTarget = null;
    this.isSnapping = false;
  }
  
  start(x, y, containerWidth, containerHeight) {
    const time = performance.now();
    this.isActive = true;
    this.startPoint = { x, y, time };
    this.currentPoint = { x, y, time };
    this.previousPoint = { x, y, time };
    this.normalizedPosition = normalizePoint(x, y, containerWidth, containerHeight);
    this.velocity = { vx: 0, vy: 0, speed: 0 };
    this.isVelocityGated = false;
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;
  }
  
  move(x, y) {
    if (!this.isActive) return null;
    
    const time = performance.now();
    
    // Store previous
    this.previousPoint = { ...this.currentPoint };
    
    // Update current
    this.currentPoint = { x, y, time };
    
    // Calculate velocity
    this.velocity = calculateVelocity(this.previousPoint, this.currentPoint);
    this.isVelocityGated = isVelocityGated(this.velocity.speed);
    
    // Update normalized position
    this.normalizedPosition = normalizePoint(x, y, this.containerWidth, this.containerHeight);
    
    // Apply dead zone
    const dx = applyDeadZone(x - this.previousPoint.x);
    const dy = applyDeadZone(y - this.previousPoint.y);
    
    return {
      normalized: this.normalizedPosition,
      delta: { x: dx, y: dy },
      velocity: this.velocity,
      isVelocityGated: this.isVelocityGated,
    };
  }
  
  end() {
    if (!this.isActive) return null;
    
    // Capture final momentum
    this.momentum = {
      x: this.velocity.vx * 10,
      y: this.velocity.vy * 10,
    };
    
    this.isActive = false;
    
    return {
      momentum: this.momentum,
      finalPosition: this.normalizedPosition,
      totalDelta: {
        x: this.currentPoint.x - this.startPoint.x,
        y: this.currentPoint.y - this.startPoint.y,
      },
      duration: this.currentPoint.time - this.startPoint.time,
    };
  }
  
  applyMomentum() {
    if (Math.abs(this.momentum.x) < 0.01 && Math.abs(this.momentum.y) < 0.01) {
      return false;
    }
    
    this.normalizedPosition.x += this.momentum.x * 0.016; // Assuming 60fps
    this.normalizedPosition.y += this.momentum.y * 0.016;
    
    // Clamp to bounds
    this.normalizedPosition.x = Math.max(-1, Math.min(1, this.normalizedPosition.x));
    this.normalizedPosition.y = Math.max(-1, Math.min(1, this.normalizedPosition.y));
    
    // Decay momentum
    this.momentum.x *= CONFIG.MOMENTUM_DECAY;
    this.momentum.y *= CONFIG.MOMENTUM_DECAY;
    
    return true;
  }
  
  setSnapTarget(target) {
    this.snapTarget = target;
    this.isSnapping = true;
  }
  
  clearSnapTarget() {
    this.snapTarget = null;
    this.isSnapping = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REACT HOOK: useTouchNormalization
// ═══════════════════════════════════════════════════════════════════════════

export function useTouchNormalization(containerRef, options = {}) {
  const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMomentumTick,
    snapTargets = [],
    enableHaptics = true,
  } = options;
  
  const managerRef = useRef(new TouchStateManager());
  const rafRef = useRef(null);
  const [normalizedPosition, setNormalizedPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [isVelocityGated, setIsVelocityGated] = useState(false);
  
  // Get container bounds
  const getBounds = useCallback(() => {
    if (!containerRef?.current) return { width: window.innerWidth, height: window.innerHeight };
    const rect = containerRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height, left: rect.left, top: rect.top };
  }, [containerRef]);
  
  // Check for snap targets
  const checkSnapTargets = useCallback((screenX, screenY) => {
    const bounds = getBounds();
    
    for (const target of snapTargets) {
      const targetScreenX = denormalizeTouch(target.x, bounds.width);
      const targetScreenY = denormalizeTouch(target.y, bounds.height);
      
      const fuzzy = checkFuzzyRadius(
        { x: screenX, y: screenY },
        { x: targetScreenX, y: targetScreenY }
      );
      
      if (fuzzy.inRange) {
        // Trigger haptic at early threshold
        if (enableHaptics && fuzzy.progress >= CONFIG.HAPTIC_EARLY_TRIGGER) {
          if (navigator.vibrate) {
            navigator.vibrate(10);
          }
        }
        
        return { target, fuzzy };
      }
    }
    
    return null;
  }, [snapTargets, getBounds, enableHaptics]);
  
  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches?.[0] || e;
    const bounds = getBounds();
    const x = (touch.clientX || touch.pageX) - (bounds.left || 0);
    const y = (touch.clientY || touch.pageY) - (bounds.top || 0);
    
    managerRef.current.start(x, y, bounds.width, bounds.height);
    setIsActive(true);
    setNormalizedPosition(managerRef.current.normalizedPosition);
    
    onTouchStart?.({
      screen: { x, y },
      normalized: managerRef.current.normalizedPosition,
    });
  }, [getBounds, onTouchStart]);
  
  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    const touch = e.touches?.[0] || e;
    const bounds = getBounds();
    const x = (touch.clientX || touch.pageX) - (bounds.left || 0);
    const y = (touch.clientY || touch.pageY) - (bounds.top || 0);
    
    const result = managerRef.current.move(x, y);
    if (!result) return;
    
    setNormalizedPosition(result.normalized);
    setIsVelocityGated(result.isVelocityGated);
    
    // Check snap targets (only if not velocity gated)
    let snapInfo = null;
    if (!result.isVelocityGated) {
      snapInfo = checkSnapTargets(x, y);
    }
    
    onTouchMove?.({
      screen: { x, y },
      normalized: result.normalized,
      delta: result.delta,
      velocity: result.velocity,
      isVelocityGated: result.isVelocityGated,
      snapInfo,
    });
  }, [getBounds, checkSnapTargets, onTouchMove]);
  
  // Handle touch end
  const handleTouchEnd = useCallback((e) => {
    const result = managerRef.current.end();
    if (!result) return;
    
    setIsActive(false);
    
    onTouchEnd?.({
      momentum: result.momentum,
      finalPosition: result.finalPosition,
      totalDelta: result.totalDelta,
      duration: result.duration,
    });
    
    // Start momentum animation if significant
    if (Math.abs(result.momentum.x) > 0.1 || Math.abs(result.momentum.y) > 0.1) {
      const animateMomentum = () => {
        const hasMore = managerRef.current.applyMomentum();
        
        if (hasMore) {
          setNormalizedPosition({ ...managerRef.current.normalizedPosition });
          onMomentumTick?.(managerRef.current.normalizedPosition);
          rafRef.current = requestAnimationFrame(animateMomentum);
        }
      };
      
      rafRef.current = requestAnimationFrame(animateMomentum);
    }
  }, [onTouchEnd, onMomentumTick]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  // Bind events
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;
    
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);
    
    // Mouse support for desktop testing
    container.addEventListener('mousedown', handleTouchStart);
    container.addEventListener('mousemove', (e) => {
      if (managerRef.current.isActive) handleTouchMove(e);
    });
    container.addEventListener('mouseup', handleTouchEnd);
    container.addEventListener('mouseleave', handleTouchEnd);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
      container.removeEventListener('mousedown', handleTouchStart);
      container.removeEventListener('mousemove', handleTouchMove);
      container.removeEventListener('mouseup', handleTouchEnd);
      container.removeEventListener('mouseleave', handleTouchEnd);
    };
  }, [containerRef, handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  return {
    // State
    normalizedPosition,
    isActive,
    isVelocityGated,
    
    // Manual control
    reset: () => managerRef.current.reset(),
    
    // Utilities
    normalizeTouch,
    denormalizeTouch,
    normalizePoint,
    checkFuzzyRadius,
    
    // Config
    config: CONFIG,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export { TouchStateManager, CONFIG as TOUCH_CONFIG };
export default useTouchNormalization;
