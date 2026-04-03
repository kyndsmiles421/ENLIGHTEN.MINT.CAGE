import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  calcGravityPull, calcPerimeterForce, calcOrbitalDecay,
  calcRotationalMomentum, checkVacuumCatch, MODULE_MASS, FRICTION,
  getTieredFriction, getTieredTrailLength, calcPredictiveSnap,
} from '../pages/SuanpanPhysics';

const TWO_PI = Math.PI * 2;
const SPHERE_POINTS = 120;

// Generate sphere vertices with golden ratio distribution
function generateSpherePoints(count, radius) {
  const points = [];
  const phi = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const theta = Math.acos(1 - 2 * (i + 0.5) / count);
    const phiAngle = TWO_PI * i / phi;
    points.push({
      x: radius * Math.sin(theta) * Math.cos(phiAngle),
      y: radius * Math.sin(theta) * Math.sin(phiAngle),
      z: radius * Math.cos(theta),
      baseAlpha: 0.3 + Math.random() * 0.5,
    });
  }
  return points;
}

// 3D → 2D perspective projection with rotation
function project(point, cx, cy, fov, rotX, rotY) {
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  let x = point.x * cosY - point.z * sinY;
  let z = point.x * sinY + point.z * cosY;
  let y = point.y;
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const y2 = y * cosX - z * sinX;
  const z2 = y * sinX + z * cosX;
  y = y2; z = z2;
  const scale = fov / (fov + z);
  return { x: cx + x * scale, y: cy + y * scale, z, scale, alpha: point.baseAlpha * Math.max(0.2, (z + 80) / 160) };
}

// ━━━ Nebula Sphere — Canvas 2D with Squared Physics ━━━
export default function NebulaSphere({
  module, size = 120, position = { x: 0, y: 0 },
  priority = 1, onDrop, gravityWell = null,
  onPositionChange, onVacuumCatch,
  resonatingWith = null, launchVelocity = null,
  gravityMultiplier = 1.0, bloomMultiplier = 1.0,
  onBubbleActivate = null,
  masteryTier = 0,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const rotRef = useRef({ x: 0.3, y: 0 });
  const velRef = useRef({ x: launchVelocity?.launchVelocityX || 0, y: launchVelocity?.launchVelocityY || 5 });
  const posRef = useRef({ x: position.x, y: position.y });
  const pointsRef = useRef(generateSpherePoints(SPHERE_POINTS, size * 0.35));
  const isDragging = useRef(false);
  const launchTimeRef = useRef(Date.now()); // Track when sphere was created
  const [nearGravity, setNearGravity] = useState(false);
  const [gravIntensity, setGravIntensity] = useState(0);
  const [snapLocked, setSnapLocked] = useState(false);
  const snapTriggered = useRef(false);
  const lastTapRef = useRef(0);

  // Luminous Trail — position history buffer
  const trailRef = useRef([]);
  const trailLength = getTieredTrailLength(masteryTier);
  const tieredFriction = getTieredFriction(masteryTier);

  // Predictive snap haptic tracking
  const lastHapticRef = useRef(0);

  const motionX = useMotionValue(position.x);
  const motionY = useMotionValue(position.y);
  const springX = useSpring(motionX, { stiffness: 60, damping: 12, mass: MODULE_MASS[module.id] || 1.5 });
  const springY = useSpring(motionY, { stiffness: 60, damping: 12, mass: MODULE_MASS[module.id] || 1.5 });

  const bloomIntensity = priority === 0 ? 1.0 : priority === 1 ? 0.6 : 0.3;
  const color = module.color;
  const mass = MODULE_MASS[module.id] || 1.0;

  // Rotational momentum based on mass
  const rotMomentum = useRef(calcRotationalMomentum(module.id, 0.008));

  // ━━━ Canvas rendering + physics loop ━━━
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = size * 0.35;

    ctx.clearRect(0, 0, w, h);

    // ━ Physics tick (when not being dragged) ━
    if (!isDragging.current) {
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;

      // Gravity pull — amplified by mastery tier
      if (gravityWell) {
        const grav = calcGravityPull(posRef.current, gravityWell, gravityWell.radius, mass);
        velRef.current.x += (grav.fx / mass) * gravityMultiplier;
        velRef.current.y += (grav.fy / mass) * gravityMultiplier;
        setNearGravity(grav.inRange);
        setGravIntensity(grav.intensity || 0);

        // Magnetic snap lock — accelerate sharply in final zone
        if (grav.snapLock && !snapTriggered.current) {
          snapTriggered.current = true;
          setSnapLocked(true);
          if (navigator.vibrate) navigator.vibrate([30, 15, 50]);
          setTimeout(() => { if (onDrop) onDrop(module); }, 200);
        }
      }

      // Perimeter elastic walls
      const perim = calcPerimeterForce(posRef.current, size, viewW, viewH);
      velRef.current.x += perim.fx;
      velRef.current.y += perim.fy;

      // Orbital decay (centering when idle)
      const decay = calcOrbitalDecay(posRef.current, velRef.current, viewW, viewH);
      velRef.current.x += decay.fx;
      velRef.current.y += decay.fy;

      // Friction — tiered: higher mastery = lower friction = more momentum
      velRef.current.x *= tieredFriction;
      velRef.current.y *= tieredFriction;

      // Integrate
      posRef.current.x += velRef.current.x;
      posRef.current.y += velRef.current.y;

      // Record position into luminous trail buffer
      trailRef.current.push({ x: posRef.current.x + size / 2, y: posRef.current.y + size / 2 });
      if (trailRef.current.length > trailLength) trailRef.current.shift();

      // Predictive snap haptics — low-frequency pulse as sphere approaches well
      if (gravityWell) {
        const snap = calcPredictiveSnap(posRef.current, gravityWell, gravityWell.radius);
        if (snap.engaged && Date.now() - lastHapticRef.current > 150) {
          const pulseIntensity = Math.round(10 + snap.intensity * 40);
          if (navigator.vibrate) navigator.vibrate(pulseIntensity);
          lastHapticRef.current = Date.now();
        }
      }

      // Hard clamp
      posRef.current.x = Math.max(10, Math.min(viewW - size - 10, posRef.current.x));
      posRef.current.y = Math.max(55, Math.min(viewH - size - 10, posRef.current.y));

      // Update motion values
      motionX.set(posRef.current.x);
      motionY.set(posRef.current.y);

      // Report position
      if (onPositionChange) onPositionChange(posRef.current.x + size / 2, posRef.current.y + size / 2);

      // Vacuum catch check (with grace period)
      if (checkVacuumCatch(posRef.current, velRef.current, launchTimeRef.current)) {
        if (onVacuumCatch) onVacuumCatch(module);
        return; // Stop rendering
      }
    }

    // ━ Rotation with mass-based inertia ━
    const rm = rotMomentum.current;
    rotRef.current.y += rm.rotSpeed + velRef.current.x * (0.003 / mass);
    rotRef.current.x += velRef.current.y * (0.002 / mass);

    // ━ Luminous Trail — position ghost trail, longer for higher tiers ━
    const trail = trailRef.current;
    if (trail.length > 1) {
      for (let i = 1; i < trail.length; i++) {
        const t = i / trail.length; // 0→1 oldest→newest
        const alpha = t * 0.3 * bloomMultiplier;
        const trailR = (1 + t * 2) * bloomMultiplier;
        // Convert world coords to local canvas coords
        const localX = trail[i].x - posRef.current.x - size / 2 + cx;
        const localY = trail[i].y - posRef.current.y - size / 2 + cy;
        ctx.beginPath();
        ctx.arc(localX, localY, trailR, 0, TWO_PI);
        ctx.fillStyle = `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
      }
    }

    // ━ Draw bloom glow — intensifies near gravity well + mastery bloom ━
    const activeBloom = (bloomIntensity + gravIntensity * 0.4) * bloomMultiplier;
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * (1.8 + gravIntensity * 0.5));
    grad.addColorStop(0, `${color}${Math.round(activeBloom * 25).toString(16).padStart(2, '0')}`);
    grad.addColorStop(0.5, `${color}${Math.round(activeBloom * 10).toString(16).padStart(2, '0')}`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // ━ Resonance ring (when near compatible sphere) ━
    if (resonatingWith) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.4, 0, TWO_PI);
      ctx.strokeStyle = `${resonatingWith.color}${Math.round(resonatingWith.intensity * 100).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 1.5 + resonatingWith.intensity * 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ━ Atmosphere ring ━
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.1, 0, TWO_PI);
    ctx.strokeStyle = `${color}${Math.round(activeBloom * 30).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = snapLocked ? 3 : 1;
    ctx.stroke();

    // ━ Sphere points (painter's algorithm) ━
    const projected = pointsRef.current.map(p => project(p, cx, cy, 200, rotRef.current.x, rotRef.current.y));
    projected.sort((a, b) => a.z - b.z);

    projected.forEach(p => {
      const r = Math.max(0.5, 2 * p.scale * activeBloom);
      const alpha = p.alpha * activeBloom;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 1.5, 0, TWO_PI);
      ctx.fillStyle = `${color}${Math.round(alpha * 40).toString(16).padStart(2, '0')}`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, TWO_PI);
      ctx.fillStyle = `${color}${Math.round(alpha * 200).toString(16).padStart(2, '0')}`;
      ctx.fill();
    });

    // ━ Grid lines ━
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      const latRad = (lat * Math.PI) / 180;
      for (let lon = 0; lon <= 360; lon += 5) {
        const lonRad = (lon * Math.PI) / 180;
        const proj = project({
          x: radius * Math.cos(latRad) * Math.cos(lonRad),
          y: radius * Math.sin(latRad),
          z: radius * Math.cos(latRad) * Math.sin(lonRad),
          baseAlpha: 1,
        }, cx, cy, 200, rotRef.current.x, rotRef.current.y);
        if (lon === 0) ctx.moveTo(proj.x, proj.y); else ctx.lineTo(proj.x, proj.y);
      }
      ctx.strokeStyle = `${color}08`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // ━ Labels ━
    ctx.font = '600 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = `${color}${Math.round(activeBloom * 180).toString(16).padStart(2, '0')}`;
    ctx.fillText(module.label.toUpperCase(), cx, cy + 2);
    ctx.font = '500 6px monospace';
    ctx.fillStyle = `${color}60`;
    ctx.fillText(`${mass.toFixed(1)}m · P${priority + 1}`, cx, cy + 12);

    // ━ Gravity proximity indicator ━
    if (nearGravity) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * (1.3 + gravIntensity * 0.3), 0, TWO_PI);
      ctx.strokeStyle = `${color}${Math.round(gravIntensity * 120).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 1.5 + gravIntensity * 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ━ Snap lock ring (pulsing when locked) ━
    if (snapLocked) {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.5, 0, TWO_PI);
      ctx.strokeStyle = `${color}${Math.round(pulse * 200).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    animRef.current = requestAnimationFrame(draw);
  }, [size, color, bloomIntensity, module, priority, nearGravity, gravIntensity, snapLocked,
      gravityWell, mass, onDrop, onPositionChange, onVacuumCatch, resonatingWith, motionX, motionY,
      gravityMultiplier, bloomMultiplier, tieredFriction, trailLength, masteryTier]);

  useEffect(() => {
    posRef.current = { x: position.x, y: position.y };
    motionX.set(position.x);
    motionY.set(position.y);
  }, [position.x, position.y]);

  useEffect(() => {
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  return (
    <motion.div
      className="absolute pointer-events-auto cursor-grab active:cursor-grabbing"
      style={{ x: springX, y: springY, width: size, height: size }}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => { isDragging.current = true; }}
      onDrag={(_, info) => {
        posRef.current = { x: info.point.x - size / 2, y: info.point.y - size / 2 };
        velRef.current = { x: info.velocity.x * 0.05, y: info.velocity.y * 0.05 };
        motionX.set(posRef.current.x);
        motionY.set(posRef.current.y);
        if (onPositionChange) onPositionChange(info.point.x, info.point.y);
      }}
      onDragEnd={(_, info) => {
        isDragging.current = false;
        velRef.current = { x: info.velocity.x * 0.08, y: info.velocity.y * 0.08 };
        rotMomentum.current = calcRotationalMomentum(module.id, 0.008 + Math.abs(info.velocity.x) * 0.00005);
      }}
      onTap={() => {
        const now = Date.now();
        if (now - lastTapRef.current < 300 && onBubbleActivate) {
          onBubbleActivate(module, { x: posRef.current.x + size / 2, y: posRef.current.y + size / 2 });
        }
        lastTapRef.current = now;
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: snapLocked ? 0.5 : 1, opacity: snapLocked ? 0.6 : 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, mass: mass }}
      data-testid={`nebula-sphere-${module.id}`}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-full h-full"
        style={{ filter: `drop-shadow(0 0 ${8 * bloomIntensity + gravIntensity * 12}px ${color}40)` }}
      />
    </motion.div>
  );
}
