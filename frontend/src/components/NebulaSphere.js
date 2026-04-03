import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const TWO_PI = Math.PI * 2;
const SPHERE_POINTS = 120;
const ROTATION_SPEED = 0.008;

// Generate sphere vertices with UV mapping
function generateSpherePoints(count, radius) {
  const points = [];
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
  for (let i = 0; i < count; i++) {
    const theta = Math.acos(1 - 2 * (i + 0.5) / count);
    const phiAngle = TWO_PI * i / phi;
    points.push({
      x: radius * Math.sin(theta) * Math.cos(phiAngle),
      y: radius * Math.sin(theta) * Math.sin(phiAngle),
      z: radius * Math.cos(theta),
      u: phiAngle / TWO_PI,
      v: theta / Math.PI,
      baseAlpha: 0.3 + Math.random() * 0.5,
    });
  }
  return points;
}

// Project 3D point to 2D screen coordinates
function project(point, cx, cy, fov, rotX, rotY) {
  // Rotate Y-axis
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  let x = point.x * cosY - point.z * sinY;
  let z = point.x * sinY + point.z * cosY;
  let y = point.y;

  // Rotate X-axis
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const y2 = y * cosX - z * sinX;
  const z2 = y * sinX + z * cosX;
  y = y2;
  z = z2;

  // Perspective projection
  const scale = fov / (fov + z);
  return {
    x: cx + x * scale,
    y: cy + y * scale,
    z,
    scale,
    alpha: point.baseAlpha * Math.max(0.2, (z + 80) / 160),
  };
}

// ━━━ Nebula Sphere — Canvas 2D with Projection Math ━━━
export default function NebulaSphere({
  module,
  size = 120,
  position = { x: 0, y: 0 },
  priority = 1,
  onDrop,
  gravityWell = null,
  onPositionChange,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const rotRef = useRef({ x: 0.3, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const pointsRef = useRef(generateSpherePoints(SPHERE_POINTS, size * 0.35));
  const [nearGravity, setNearGravity] = useState(false);

  const motionX = useMotionValue(position.x);
  const motionY = useMotionValue(position.y);
  const springX = useSpring(motionX, { stiffness: 80, damping: 15, mass: 1.5 });
  const springY = useSpring(motionY, { stiffness: 80, damping: 15, mass: 1.5 });

  // Priority-based bloom intensity
  const bloomIntensity = priority === 0 ? 1.0 : priority === 1 ? 0.6 : 0.3;
  const color = module.color;

  // Canvas rendering loop
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

    // Update rotation with zero-G drift
    rotRef.current.y += ROTATION_SPEED + velocityRef.current.x * 0.01;
    rotRef.current.x += velocityRef.current.y * 0.005;

    // Apply friction to velocity
    velocityRef.current.x *= 0.98;
    velocityRef.current.y *= 0.98;

    // Draw outer bloom glow
    const gradient = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 1.8);
    gradient.addColorStop(0, `${color}${Math.round(bloomIntensity * 20).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(0.5, `${color}${Math.round(bloomIntensity * 8).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Draw atmosphere ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.1, 0, TWO_PI);
    ctx.strokeStyle = `${color}${Math.round(bloomIntensity * 30).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Sort and draw sphere points (painter's algorithm)
    const projected = pointsRef.current.map(p => project(p, cx, cy, 200, rotRef.current.x, rotRef.current.y));
    projected.sort((a, b) => a.z - b.z);

    projected.forEach(p => {
      const r = Math.max(0.5, 2 * p.scale * bloomIntensity);
      const alpha = p.alpha * bloomIntensity;

      // Point glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 1.5, 0, TWO_PI);
      ctx.fillStyle = `${color}${Math.round(alpha * 40).toString(16).padStart(2, '0')}`;
      ctx.fill();

      // Point core
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, TWO_PI);
      ctx.fillStyle = `${color}${Math.round(alpha * 200).toString(16).padStart(2, '0')}`;
      ctx.fill();
    });

    // Draw latitude/longitude grid lines (subtle)
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      const latRad = (lat * Math.PI) / 180;
      for (let lon = 0; lon <= 360; lon += 5) {
        const lonRad = (lon * Math.PI) / 180;
        const px = radius * Math.cos(latRad) * Math.cos(lonRad);
        const py = radius * Math.sin(latRad);
        const pz = radius * Math.cos(latRad) * Math.sin(lonRad);
        const proj = project({ x: px, y: py, z: pz, baseAlpha: 1 }, cx, cy, 200, rotRef.current.x, rotRef.current.y);
        if (lon === 0) ctx.moveTo(proj.x, proj.y);
        else ctx.lineTo(proj.x, proj.y);
      }
      ctx.strokeStyle = `${color}08`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Module label on sphere surface
    ctx.font = '600 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = `${color}${Math.round(bloomIntensity * 180).toString(16).padStart(2, '0')}`;
    ctx.fillText(module.label.toUpperCase(), cx, cy + 2);
    ctx.font = '500 6px monospace';
    ctx.fillStyle = `${color}60`;
    ctx.fillText(`P${priority + 1}`, cx, cy + 12);

    // Gravity proximity indicator
    if (nearGravity) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.3, 0, TWO_PI);
      ctx.strokeStyle = `${color}40`;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    animRef.current = requestAnimationFrame(draw);
  }, [size, color, bloomIntensity, module.label, priority, nearGravity]);

  useEffect(() => {
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  // Check gravity well proximity
  const checkGravity = useCallback((x, y) => {
    if (!gravityWell) return;
    const dx = x - gravityWell.x;
    const dy = y - gravityWell.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const inRange = dist < gravityWell.radius;
    setNearGravity(inRange);

    if (inRange && dist < gravityWell.radius * 0.4) {
      if (onDrop) onDrop(module);
    }
  }, [gravityWell, onDrop, module]);

  return (
    <motion.div
      className="absolute cursor-grab active:cursor-grabbing"
      style={{
        x: springX,
        y: springY,
        width: size,
        height: size,
      }}
      drag
      dragMomentum
      dragElastic={0.3}
      onDrag={(_, info) => {
        velocityRef.current = { x: info.velocity.x, y: info.velocity.y };
        if (onPositionChange) onPositionChange(info.point.x, info.point.y);
        checkGravity(info.point.x, info.point.y);
      }}
      onDragEnd={(_, info) => {
        velocityRef.current = {
          x: info.velocity.x * 0.1,
          y: info.velocity.y * 0.1,
        };
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 1.2 }}
      data-testid={`nebula-sphere-${module.id}`}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-full h-full"
        style={{ filter: `drop-shadow(0 0 ${8 * bloomIntensity}px ${color}40)` }}
      />
    </motion.div>
  );
}
