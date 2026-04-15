/**
 * ParticleField.js — 3D Visualization Hooks
 * 
 * A canvas-based particle system driven by ChaosEngine's z/z feedback loop.
 * Maps module metadata (pillar colors, chaos state, dust accrual) into
 * real-time particle behaviors: drift, spawn, color intensity, orbital patterns.
 * 
 * Each pillar has a unique particle "signature":
 *   Practice  → slow, circular, warm purple
 *   Divination→ fast spirals, magenta trails
 *   Sanctuary → gentle float, teal mist
 *   Nourish   → upward bloom, green sparks
 *   Explore   → radial burst, orange embers
 *   Sage AI   → electric arcs, sky blue
 *   Council   → crystalline lattice, violet nodes
 * 
 * Usage: <ParticleField pillarKey="practice" chaosCoeff={1.0} intensity={0.7} />
 *   Or wrap in the TorusPanel as a living backdrop.
 */
import { useRef, useEffect, useCallback } from 'react';
import { chaosValue, chaosGlow } from '../../lib/ChaosEngine';
import { PHI, PHI_CUBED, calculateDustAccrual } from '../ConsoleConstants';

const PILLAR_SIGNATURES = {
  practice:   { hue: 280, spread: 0.6,  orbit: true,  trailLen: 8,  spawnRate: 1.0, drift: 0.3 },
  divination: { hue: 310, spread: 1.2,  orbit: true,  trailLen: 14, spawnRate: 1.4, drift: 0.8 },
  sanctuary:  { hue: 170, spread: 0.4,  orbit: false, trailLen: 5,  spawnRate: 0.7, drift: 0.15 },
  nourish:    { hue: 140, spread: 0.8,  orbit: false, trailLen: 6,  spawnRate: 0.9, drift: -0.5 },
  explore:    { hue: 30,  spread: 1.5,  orbit: false, trailLen: 10, spawnRate: 1.2, drift: 0.6 },
  sage:       { hue: 200, spread: 1.0,  orbit: true,  trailLen: 12, spawnRate: 1.1, drift: 0.5 },
  council:    { hue: 270, spread: 0.9,  orbit: true,  trailLen: 9,  spawnRate: 0.8, drift: 0.4 },
  cosmos:     { hue: 250, spread: 1.1,  orbit: true,  trailLen: 11, spawnRate: 1.0, drift: 0.45 },
  body:       { hue: 25,  spread: 0.7,  orbit: false, trailLen: 7,  spawnRate: 0.85, drift: -0.3 },
  wisdom:     { hue: 45,  spread: 0.5,  orbit: false, trailLen: 6,  spawnRate: 0.75, drift: 0.2 },
};
const DEFAULT_SIG = { hue: 160, spread: 0.8, orbit: false, trailLen: 8, spawnRate: 1.0, drift: 0.3 };

function createParticle(w, h, sig, chaos) {
  const cx = w / 2;
  const cy = h / 2;
  const angle = Math.random() * Math.PI * 2;
  const dist = 20 + Math.random() * Math.min(w, h) * 0.35;
  return {
    x: cx + Math.cos(angle) * dist * (0.5 + Math.random() * 0.5),
    y: cy + Math.sin(angle) * dist * (0.5 + Math.random() * 0.5),
    vx: (Math.random() - 0.5) * sig.spread * (1 + Math.abs(chaos) * 0.5),
    vy: sig.drift + (Math.random() - 0.5) * sig.spread * 0.5,
    size: 1 + Math.random() * 2.5,
    life: 1.0,
    decay: 0.003 + Math.random() * 0.006,
    hueShift: (Math.random() - 0.5) * 30,
    orbitR: sig.orbit ? dist : 0,
    orbitAngle: angle,
    orbitSpeed: (0.005 + Math.random() * 0.01) * (chaos > 0 ? 1 : -1),
    trail: [],
  };
}

export default function ParticleField({
  pillarKey = null,
  chaosCoeff = 1.0,
  intensity = 0.7,
  width,
  height,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const tickRef = useRef(0);

  const getSig = useCallback(() => {
    return PILLAR_SIGNATURES[pillarKey] || DEFAULT_SIG;
  }, [pillarKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const sig = getSig();
    const maxParticles = Math.floor(60 * intensity);

    particlesRef.current = [];
    startTimeRef.current = Date.now();
    tickRef.current = 0;

    const animate = () => {
      tickRef.current++;
      const t = (Date.now() - startTimeRef.current) * 0.001;
      const chaos = chaosValue(t, chaosCoeff);
      const glow = chaosGlow(chaos);
      const dust = calculateDustAccrual(tickRef.current);
      const dustNorm = dust / PHI_CUBED; // 0 → 1

      // Fade previous frame (trail effect)
      ctx.fillStyle = `rgba(0,0,0,${0.08 + (1 - intensity) * 0.08})`;
      ctx.fillRect(0, 0, w, h);

      // Spawn new particles based on chaos state
      const spawnChance = sig.spawnRate * intensity * (0.5 + Math.abs(chaos) * 0.5);
      if (particlesRef.current.length < maxParticles && Math.random() < spawnChance * 0.3) {
        particlesRef.current.push(createParticle(w, h, sig, chaos));
      }

      // Chaos-driven central gravity pulse
      const gravityPulse = Math.sin(t * PHI) * 0.15 * chaos;

      // Update and draw particles
      const alive = [];
      for (const p of particlesRef.current) {
        // Orbital or linear motion
        if (p.orbitR > 0) {
          p.orbitAngle += p.orbitSpeed * (1 + chaos * 0.5);
          const chaosWobble = Math.sin(t * 3 + p.orbitAngle) * chaos * 4;
          p.x = cx + Math.cos(p.orbitAngle) * (p.orbitR + chaosWobble);
          p.y = cy + Math.sin(p.orbitAngle) * (p.orbitR * 0.65 + chaosWobble * 0.5);
        } else {
          // Gravity toward center, modulated by chaos
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          p.vx += (dx / dist) * gravityPulse;
          p.vy += (dy / dist) * gravityPulse;
          // Chaos drift
          p.vx += Math.sin(t * 2 + p.y * 0.01) * chaos * 0.08;
          p.vy += Math.cos(t * 2 + p.x * 0.01) * chaos * 0.06;
          p.x += p.vx;
          p.y += p.vy;
          // Damping
          p.vx *= 0.995;
          p.vy *= 0.995;
        }

        // Trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > sig.trailLen) p.trail.shift();

        // Decay
        p.life -= p.decay * (1 + dustNorm * 0.5);
        if (p.life <= 0) continue;

        // Draw trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          const trailAlpha = p.life * glow * 0.3;
          ctx.strokeStyle = `hsla(${sig.hue + p.hueShift + chaos * 20}, 80%, 65%, ${trailAlpha})`;
          ctx.lineWidth = p.size * 0.5;
          ctx.stroke();
        }

        // Draw particle
        const alpha = p.life * glow * intensity;
        const drawSize = p.size * (0.8 + Math.abs(chaos) * 0.4);
        const particleGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, drawSize * 2);
        particleGrad.addColorStop(0, `hsla(${sig.hue + p.hueShift + chaos * 15}, 85%, 70%, ${alpha})`);
        particleGrad.addColorStop(1, `hsla(${sig.hue + p.hueShift}, 60%, 40%, 0)`);
        ctx.fillStyle = particleGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, drawSize * 2, 0, Math.PI * 2);
        ctx.fill();

        alive.push(p);
      }
      particlesRef.current = alive;

      // Central glow — breathes with chaos
      const coreAlpha = 0.04 + glow * 0.06 * intensity;
      const coreR = 30 + dustNorm * 20 + Math.abs(chaos) * 15;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      coreGrad.addColorStop(0, `hsla(${sig.hue}, 70%, 60%, ${coreAlpha})`);
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      frameRef.current = requestAnimationFrame(animate);
    };

    // Initial clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [pillarKey, chaosCoeff, intensity, width, height, getSig]);

  return (
    <canvas
      ref={canvasRef}
      width={width || 380}
      height={height || 200}
      className={`w-full ${className}`}
      style={{ background: 'transparent', pointerEvents: 'none', ...style }}
      data-testid="particle-field"
    />
  );
}
