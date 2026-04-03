// ━━━ SuanpanPhysics.js — Squared Gravity & Bipolar Force Engine ━━━
// Handles: Inverse-square attraction, repulsion launch, perimeter buffer,
// orbital decay, rotational inertia, proximity resonance

const G_CONSTANT = 800;          // Gravitational constant for inverse-square
const REPULSION_FORCE = 2.5;     // Sling-shot repulsion multiplier
const PERIMETER_BUFFER = 60;     // Elastic wall margin (px)
const PERIMETER_STIFFNESS = 0.4; // Wall bounce force
const ORBITAL_DECAY = 0.002;     // Centering force per frame
const REST_HEIGHT_RATIO = 0.33;  // Spheres settle to top-third
const FRICTION = 0.985;          // Per-frame velocity damping (base — overridden by tier)

// ━━━ Tiered Variable Inertia ━━━
// Higher tiers = lower friction = longer momentum carry = "heavier" feel
const TIER_FRICTION = {
  0: 0.970,  // Unranked — high friction, very snappy
  1: 0.980,  // Novice/Seeker — standard
  2: 0.988,  // Practitioner — smoother
  3: 0.993,  // Specialist — cinematic weight
  4: 0.997,  // Sovereign — glacial momentum, planetary feel
};

// Tiered trail length (frames of position history to render)
const TIER_TRAIL_LENGTH = {
  0: 4,
  1: 6,
  2: 10,
  3: 16,
  4: 24,
};
const PROXIMITY_THRESHOLD = 180; // Distance for resonance glow (px)
const CLUSTER_THRESHOLD = 80;    // Distance to form cluster (px)
const VACUUM_CATCH_Y = 65;       // Y threshold to trigger vacuum reattach (px)
const VACUUM_STIFFNESS = 3.0;    // How hard crossbar pulls sphere back

// Module mass based on type (heavier = more inertia)
const MODULE_MASS = {
  mixer: 3.0,       // Heavy — Star of the system
  starchart: 2.2,   // Heavy — complex coordinate math
  trade: 1.8,       // Medium-heavy
  meditation: 1.2,  // Light
  wellness: 1.0,    // Lightest — snappy
};

// Resonance compatibility matrix (which modules glow together)
const RESONANCE_PAIRS = {
  starchart: ['mixer', 'meditation'],
  meditation: ['mixer', 'starchart', 'wellness'],
  wellness: ['mixer', 'meditation'],
  trade: ['mixer'],
  mixer: ['starchart', 'meditation', 'wellness', 'trade'],
};

// ━━━ Inverse-Square Gravitational Attraction ━━━
// F = G * m1 * m2 / r^2 — accelerates sharply in final 50px
export function calcGravityPull(spherePos, wellPos, wellRadius, moduleMass = 1) {
  const dx = wellPos.x - spherePos.x;
  const dy = wellPos.y - spherePos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > wellRadius * 1.5 || dist < 5) return { fx: 0, fy: 0, dist, inRange: false, snapLock: false };

  const inRange = dist < wellRadius;
  const snapLock = dist < wellRadius * 0.3; // Magnetic lock zone

  // Inverse-square force (clamped to prevent infinity)
  const r = Math.max(30, dist);
  const force = G_CONSTANT * moduleMass / (r * r);

  // Normalize direction
  const nx = dx / dist;
  const ny = dy / dist;

  return {
    fx: nx * force,
    fy: ny * force,
    dist,
    inRange,
    snapLock,
    intensity: Math.min(1, wellRadius / Math.max(1, dist)), // 0-1 proximity intensity
  };
}

// ━━━ Repulsion Launch (Inverted Gravity at Crossbar) ━━━
// Pushes module away from crossbar with 1/-r^2 force
export function calcRepulsionLaunch(dragY, crossbarY = 50) {
  const dist = Math.max(10, dragY - crossbarY);
  // Inverted — force increases as you pull away, then catapults
  const force = REPULSION_FORCE * (150 / (dist * dist)) * Math.min(1, dragY / 100);
  return {
    launchVelocityY: Math.min(25, force * 10), // Capped launch speed
    launchVelocityX: (Math.random() - 0.5) * 6, // Slight horizontal scatter
  };
}

// ━━━ Perimeter Buffer (Elastic Walls) ━━━
// Prevents spheres from going off-screen with soft bounce
export function calcPerimeterForce(pos, size, viewW, viewH) {
  let fx = 0, fy = 0;
  const halfSize = size / 2;

  // Left wall
  if (pos.x < PERIMETER_BUFFER) {
    fx += PERIMETER_STIFFNESS * (PERIMETER_BUFFER - pos.x);
  }
  // Right wall
  if (pos.x + size > viewW - PERIMETER_BUFFER) {
    fx -= PERIMETER_STIFFNESS * ((pos.x + size) - (viewW - PERIMETER_BUFFER));
  }
  // Top wall (below crossbar)
  if (pos.y < PERIMETER_BUFFER + 50) {
    fy += PERIMETER_STIFFNESS * (PERIMETER_BUFFER + 50 - pos.y);
  }
  // Bottom wall
  if (pos.y + size > viewH - PERIMETER_BUFFER) {
    fy -= PERIMETER_STIFFNESS * ((pos.y + size) - (viewH - PERIMETER_BUFFER));
  }

  return { fx, fy };
}

// ━━━ Orbital Decay (Centering Force) ━━━
// Untouched spheres gently drift to rest position (top-third)
export function calcOrbitalDecay(pos, velocity, viewW, viewH) {
  const restY = viewH * REST_HEIGHT_RATIO;
  const restX = viewW / 2;

  // Only apply if velocity is low (sphere is "idle")
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  if (speed > 2) return { fx: 0, fy: 0 };

  const dx = restX - pos.x;
  const dy = restY - pos.y;

  return {
    fx: dx * ORBITAL_DECAY,
    fy: dy * ORBITAL_DECAY,
  };
}

// ━━━ Vacuum Catch (Crossbar Reattachment) ━━━
// When sphere is tossed toward top of screen, crossbar catches it
// Requires: sphere must be moving UPWARD with deliberate velocity near the crossbar
export function checkVacuumCatch(pos, velocity, launchTime) {
  // Grace period — don't vacuum catch within 2s of launch
  if (launchTime && Date.now() - launchTime < 2000) return false;

  // Must be moving strongly upward AND near the top
  if (pos.y < VACUUM_CATCH_Y && velocity.y < -5) {
    return true;
  }
  return false;
}

// ━━━ Rotational Inertia ━━━
// Heavier modules spin slower but longer
export function calcRotationalMomentum(moduleId, spinVelocity) {
  const mass = MODULE_MASS[moduleId] || 1.0;
  const inertia = 1 / mass; // Lighter = faster response
  const dampedFriction = 1 - (0.01 * mass); // Heavier = less friction (spins longer)

  return {
    rotSpeed: spinVelocity * inertia,
    friction: dampedFriction,
    mass,
  };
}

// ━━━ Proximity Resonance Detection ━━━
// Detects when compatible spheres are near each other
export function detectResonance(spherePositions, moduleIds) {
  const resonances = [];

  for (let i = 0; i < moduleIds.length; i++) {
    for (let j = i + 1; j < moduleIds.length; j++) {
      const idA = moduleIds[i];
      const idB = moduleIds[j];
      const posA = spherePositions[idA];
      const posB = spherePositions[idB];

      if (!posA || !posB) continue;

      const dx = posA.x - posB.x;
      const dy = posA.y - posB.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check compatibility
      const compatible = (RESONANCE_PAIRS[idA] || []).includes(idB);
      const isCluster = dist < CLUSTER_THRESHOLD;
      const isResonant = compatible && dist < PROXIMITY_THRESHOLD;

      if (isResonant || isCluster) {
        resonances.push({
          a: idA,
          b: idB,
          distance: dist,
          compatible,
          isCluster,
          intensity: Math.max(0, 1 - dist / PROXIMITY_THRESHOLD),
          midpoint: { x: (posA.x + posB.x) / 2, y: (posA.y + posB.y) / 2 },
        });
      }
    }
  }

  return resonances;
}

// ━━━ Full Physics Step ━━━
// Integrates all forces for a single sphere per frame
export function physicsTick(sphere, gravityWell, viewW, viewH) {
  const mass = MODULE_MASS[sphere.moduleId] || 1.0;
  let { x, y, vx, vy } = sphere;

  // 1. Gravity well attraction (inverse-square)
  if (gravityWell) {
    const grav = calcGravityPull({ x, y }, gravityWell, gravityWell.radius, mass);
    vx += grav.fx / mass;
    vy += grav.fy / mass;
  }

  // 2. Perimeter elastic walls
  const perim = calcPerimeterForce({ x, y }, sphere.size || 120, viewW, viewH);
  vx += perim.fx;
  vy += perim.fy;

  // 3. Orbital decay (centering)
  const decay = calcOrbitalDecay({ x, y }, { x: vx, y: vy }, viewW, viewH);
  vx += decay.fx;
  vy += decay.fy;

  // 4. Friction
  vx *= FRICTION;
  vy *= FRICTION;

  // 5. Integrate position
  x += vx;
  y += vy;

  // 6. Hard clamp to viewport (safety net)
  x = Math.max(10, Math.min(viewW - (sphere.size || 120) - 10, x));
  y = Math.max(55, Math.min(viewH - (sphere.size || 120) - 10, y));

  return { x, y, vx, vy };
}

// ━━━ Tiered Friction Lookup ━━━
// Returns friction coefficient for a given mastery tier
export function getTieredFriction(masteryTier = 0) {
  return TIER_FRICTION[Math.min(4, Math.max(0, masteryTier))] || FRICTION;
}

// ━━━ Tiered Trail Length ━━━
// How many frames of position history to render as luminous trail
export function getTieredTrailLength(masteryTier = 0) {
  return TIER_TRAIL_LENGTH[Math.min(4, Math.max(0, masteryTier))] || 6;
}

// ━━━ Predictive Snap Distance ━━━
// Returns normalized proximity intensity (0-1) for haptic pre-pulse
export function calcPredictiveSnap(spherePos, wellPos, wellRadius) {
  const dx = wellPos.x - spherePos.x;
  const dy = wellPos.y - spherePos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > wellRadius * 1.2) return { intensity: 0, engaged: false };
  const intensity = Math.max(0, 1 - dist / (wellRadius * 1.2));
  // Engaged when inside 60% of well radius — strong pull zone
  const engaged = dist < wellRadius * 0.6;
  return { intensity, engaged, distance: dist };
}

// ━━━ Tiered Bubble Expansion Duration ━━━
// Returns duration in ms for Bubble Portal clip-path animation
export function getBubbleExpandDuration(masteryTier = 0) {
  // Tier 0/1: 300ms snap-open → Tier 4: 850ms cinematic
  const t = Math.min(4, Math.max(0, masteryTier)) / 4;
  return Math.round(300 + t * 550);
}

export {
  G_CONSTANT, REPULSION_FORCE, PERIMETER_BUFFER,
  ORBITAL_DECAY, FRICTION, PROXIMITY_THRESHOLD,
  CLUSTER_THRESHOLD, VACUUM_CATCH_Y, MODULE_MASS,
  RESONANCE_PAIRS, TIER_FRICTION, TIER_TRAIL_LENGTH,
};
