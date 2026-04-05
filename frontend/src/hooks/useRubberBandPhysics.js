/**
 * useRubberBandPhysics.js — Hooke's Law Spring Physics Hook
 * 
 * THE MATHEMATICS:
 * F = -k * x (Hooke's Law)
 * Where:
 *   F = restoration force
 *   k = spring constant (tension)
 *   x = displacement from equilibrium
 * 
 * Combined with velocity damping for "snap-back" behavior.
 * 
 * USE CASES:
 * - Nodule extraction/release animation
 * - Pull-to-reveal UI elements
 * - Elastic scroll boundaries
 * - Interactive orb positioning
 */

import { useRef, useCallback, useEffect } from 'react';

/**
 * 3D Vector class for physics calculations
 * (Standalone - no Three.js dependency)
 */
class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  multiplyScalar(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize() {
    const len = this.length();
    if (len > 0) {
      this.multiplyScalar(1 / len);
    }
    return this;
  }

  distanceTo(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  lerp(v, alpha) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;
    return this;
  }
}

/**
 * Creates a rubber band anchor physics system
 * 
 * @param {Object} options - Configuration
 * @param {number} options.tension - Spring stiffness (0.05-0.3 recommended)
 * @param {number} options.damping - Velocity decay (0.8-0.95 recommended)
 * @param {number} options.maxStretch - Maximum displacement before force cap
 * @param {Object} options.basePosition - Anchor point {x, y, z}
 * @returns {Object} - Physics controller
 */
export function createRubberBandAnchor(options = {}) {
  const {
    tension = 0.15,
    damping = 0.85,
    maxStretch = 200,
    basePosition = { x: 0, y: 0, z: 0 },
  } = options;

  const physics = {
    basePosition: new Vector3(basePosition.x, basePosition.y, basePosition.z),
    currentPosition: new Vector3(basePosition.x, basePosition.y, basePosition.z),
    velocity: new Vector3(0, 0, 0),
    tension,
    damping,
    maxStretch,
    isSettled: true,
    settlementThreshold: 0.1,
  };

  /**
   * Update physics simulation (call each frame)
   * @param {Object} externalForce - Optional external force {x, y, z}
   * @returns {Object} - Current position {x, y, z}
   */
  function update(externalForce = null) {
    // 1. Calculate displacement from anchor
    const stretch = new Vector3()
      .copy(physics.basePosition)
      .sub(physics.currentPosition);

    const stretchLength = stretch.length();

    // 2. Apply Hooke's Law: F = k * x
    // Clamp stretch to prevent extreme forces
    const clampedStretch = Math.min(stretchLength, physics.maxStretch);
    const normalizedStretch = stretch.clone().normalize();
    const restorationForce = normalizedStretch.multiplyScalar(
      physics.tension * clampedStretch
    );

    // 3. Apply restoration force to velocity
    physics.velocity.add(restorationForce);

    // 4. Apply external force (user input, gravity, etc.)
    if (externalForce) {
      physics.velocity.add(new Vector3(
        externalForce.x || 0,
        externalForce.y || 0,
        externalForce.z || 0
      ));
    }

    // 5. Apply damping (friction/air resistance)
    physics.velocity.multiplyScalar(physics.damping);

    // 6. Update position
    physics.currentPosition.add(physics.velocity);

    // 7. Check if settled (for optimization)
    const velocityMagnitude = physics.velocity.length();
    const distanceFromBase = physics.currentPosition.distanceTo(physics.basePosition);
    physics.isSettled = 
      velocityMagnitude < physics.settlementThreshold &&
      distanceFromBase < physics.settlementThreshold;

    return {
      x: physics.currentPosition.x,
      y: physics.currentPosition.y,
      z: physics.currentPosition.z,
      velocity: velocityMagnitude,
      stretch: distanceFromBase,
      isSettled: physics.isSettled,
    };
  }

  /**
   * Apply an impulse (instantaneous force)
   */
  function applyImpulse(force) {
    physics.velocity.add(new Vector3(force.x || 0, force.y || 0, force.z || 0));
    physics.isSettled = false;
  }

  /**
   * Set position directly (teleport)
   */
  function setPosition(pos) {
    physics.currentPosition.set(pos.x || 0, pos.y || 0, pos.z || 0);
    physics.velocity.set(0, 0, 0);
    physics.isSettled = false;
  }

  /**
   * Move anchor point
   */
  function setAnchor(pos) {
    physics.basePosition.set(pos.x || 0, pos.y || 0, pos.z || 0);
    physics.isSettled = false;
  }

  /**
   * Reset to anchor
   */
  function reset() {
    physics.currentPosition.copy(physics.basePosition);
    physics.velocity.set(0, 0, 0);
    physics.isSettled = true;
  }

  /**
   * Get current state
   */
  function getState() {
    return {
      position: { ...physics.currentPosition },
      velocity: { ...physics.velocity },
      anchor: { ...physics.basePosition },
      isSettled: physics.isSettled,
    };
  }

  return {
    update,
    applyImpulse,
    setPosition,
    setAnchor,
    reset,
    getState,
  };
}

/**
 * React hook for rubber band physics
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} - { position, applyForce, applyImpulse, reset, isSettled }
 */
export function useRubberBandPhysics(options = {}) {
  const physicsRef = useRef(null);
  const frameIdRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0, z: 0 });
  const callbacksRef = useRef(new Set());

  // Initialize physics
  if (!physicsRef.current) {
    physicsRef.current = createRubberBandAnchor(options);
  }

  // Animation loop
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const state = physicsRef.current.update();
      positionRef.current = { x: state.x, y: state.y, z: state.z };

      // Notify subscribers
      callbacksRef.current.forEach(cb => cb(state));

      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, []);

  // Subscribe to position updates
  const subscribe = useCallback((callback) => {
    callbacksRef.current.add(callback);
    return () => callbacksRef.current.delete(callback);
  }, []);

  // Apply continuous force
  const applyForce = useCallback((force) => {
    // Force is applied in the next update cycle
    // Store it for the physics update
    physicsRef.current._pendingForce = force;
  }, []);

  // Apply impulse
  const applyImpulse = useCallback((impulse) => {
    physicsRef.current.applyImpulse(impulse);
  }, []);

  // Set position directly
  const setPosition = useCallback((pos) => {
    physicsRef.current.setPosition(pos);
  }, []);

  // Reset to anchor
  const reset = useCallback(() => {
    physicsRef.current.reset();
  }, []);

  // Get current position
  const getPosition = useCallback(() => {
    return { ...positionRef.current };
  }, []);

  return {
    getPosition,
    applyForce,
    applyImpulse,
    setPosition,
    reset,
    subscribe,
    physics: physicsRef.current,
  };
}

/**
 * 2D Rubber Band Hook (simpler for UI elements)
 * 
 * @param {Object} options - { tension, damping, anchor: {x, y} }
 * @returns {Object} - { x, y, pull, release, reset }
 */
export function useRubberBand2D(options = {}) {
  const {
    tension = 0.12,
    damping = 0.82,
    anchor = { x: 0, y: 0 },
    onSnap,
  } = options;

  const stateRef = useRef({
    position: { ...anchor },
    velocity: { x: 0, y: 0 },
    isDragging: false,
    anchor: { ...anchor },
  });

  const frameIdRef = useRef(null);
  const callbacksRef = useRef(new Set());

  useEffect(() => {
    const animate = () => {
      const state = stateRef.current;

      if (!state.isDragging) {
        // Calculate restoration force (Hooke's Law)
        const dx = state.anchor.x - state.position.x;
        const dy = state.anchor.y - state.position.y;

        // Apply spring force
        state.velocity.x += dx * tension;
        state.velocity.y += dy * tension;

        // Apply damping
        state.velocity.x *= damping;
        state.velocity.y *= damping;

        // Update position
        state.position.x += state.velocity.x;
        state.position.y += state.velocity.y;

        // Check for snap (velocity near zero and close to anchor)
        const speed = Math.sqrt(
          state.velocity.x ** 2 + state.velocity.y ** 2
        );
        const distance = Math.sqrt(dx ** 2 + dy ** 2);

        if (speed < 0.5 && distance < 1) {
          state.position.x = state.anchor.x;
          state.position.y = state.anchor.y;
          state.velocity.x = 0;
          state.velocity.y = 0;

          if (onSnap) onSnap();
        }
      }

      // Notify subscribers
      callbacksRef.current.forEach(cb => cb({
        x: state.position.x,
        y: state.position.y,
        vx: state.velocity.x,
        vy: state.velocity.y,
      }));

      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [tension, damping, onSnap]);

  // Start dragging (disables physics)
  const pull = useCallback((x, y) => {
    stateRef.current.isDragging = true;
    stateRef.current.position.x = x;
    stateRef.current.position.y = y;
    stateRef.current.velocity.x = 0;
    stateRef.current.velocity.y = 0;
  }, []);

  // Release (enables physics snap-back)
  const release = useCallback(() => {
    stateRef.current.isDragging = false;
  }, []);

  // Reset to anchor
  const reset = useCallback(() => {
    stateRef.current.position = { ...stateRef.current.anchor };
    stateRef.current.velocity = { x: 0, y: 0 };
    stateRef.current.isDragging = false;
  }, []);

  // Subscribe to updates
  const subscribe = useCallback((callback) => {
    callbacksRef.current.add(callback);
    // Immediate callback with current state
    callback({
      x: stateRef.current.position.x,
      y: stateRef.current.position.y,
      vx: stateRef.current.velocity.x,
      vy: stateRef.current.velocity.y,
    });
    return () => callbacksRef.current.delete(callback);
  }, []);

  // Set anchor position
  const setAnchor = useCallback((x, y) => {
    stateRef.current.anchor = { x, y };
  }, []);

  return {
    pull,
    release,
    reset,
    subscribe,
    setAnchor,
    getPosition: () => ({ ...stateRef.current.position }),
  };
}

export default {
  createRubberBandAnchor,
  useRubberBandPhysics,
  useRubberBand2D,
  Vector3,
};
