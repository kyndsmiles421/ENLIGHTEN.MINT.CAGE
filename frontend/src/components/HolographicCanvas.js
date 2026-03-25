import React, { useRef, useEffect, useCallback } from 'react';

const PARTICLE_COUNT = 120;

export default function HolographicCanvas({ color = '#D8B4FE', cue = 'breathe', intensity = 5, playing = false }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const timeRef = useRef(0);

  const initParticles = useCallback(() => {
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        z: Math.random() * 0.8 + 0.2,
        vx: (Math.random() - 0.5) * 0.001,
        vy: (Math.random() - 0.5) * 0.001,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() * 30 - 15,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => { initParticles(); }, [initParticles]);

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const t = timeRef.current;
    const rgb = hexToRgb(color);

    // Clear with fade trail
    ctx.fillStyle = 'rgba(5, 5, 12, 0.15)';
    ctx.fillRect(0, 0, w, h);

    // Breathing scale factor
    const breathCycle = Math.sin(t * 0.0008) * 0.5 + 0.5;
    const pulseScale = playing ? 0.7 + breathCycle * 0.3 : 0.85;

    // Draw energy body (avatar silhouette)
    const cx = w / 2;
    const cy = h * 0.45;
    const bodyH = h * 0.55 * pulseScale;
    const bodyW = bodyH * 0.35;

    // Aura layers
    for (let layer = 4; layer >= 0; layer--) {
      const spread = 1 + layer * 0.15;
      const alpha = 0.02 + (4 - layer) * 0.008;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bodyH * spread * 0.6);
      grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * (playing ? 1.5 : 0.6)})`);
      grad.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.3})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, bodyW * spread, bodyH * spread * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Head
    const headR = bodyW * 0.45;
    const headY = cy - bodyH * 0.32;
    const headGrad = ctx.createRadialGradient(cx, headY, 0, cx, headY, headR * 1.5);
    headGrad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.12 * pulseScale})`);
    headGrad.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04)`);
    headGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(cx, headY, headR * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Head outline
    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.15 * pulseScale})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.stroke();

    // Torso
    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.1 * pulseScale})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - bodyW * 0.3, headY + headR);
    ctx.quadraticCurveTo(cx - bodyW * 0.5, cy, cx - bodyW * 0.35, cy + bodyH * 0.25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + bodyW * 0.3, headY + headR);
    ctx.quadraticCurveTo(cx + bodyW * 0.5, cy, cx + bodyW * 0.35, cy + bodyH * 0.25);
    ctx.stroke();

    // Chakra points (7 along the spine)
    const chakraColors = ['#EF4444', '#FB923C', '#FCD34D', '#22C55E', '#3B82F6', '#6366F1', '#C084FC'];
    for (let i = 0; i < 7; i++) {
      const py = headY + headR * 0.5 + (bodyH * 0.45) * (i / 6);
      const cr = 2 + Math.sin(t * 0.002 + i) * 1;
      const ca = 0.3 + Math.sin(t * 0.003 + i * 0.5) * 0.2;
      ctx.fillStyle = `rgba(${parseInt(chakraColors[i].slice(1,3),16)}, ${parseInt(chakraColors[i].slice(3,5),16)}, ${parseInt(chakraColors[i].slice(5,7),16)}, ${ca * (playing ? 1.2 : 0.4)})`;
      ctx.beginPath();
      ctx.arc(cx, py, cr * pulseScale, 0, Math.PI * 2);
      ctx.fill();

      // Glow
      if (playing) {
        const glow = ctx.createRadialGradient(cx, py, 0, cx, py, cr * 4);
        glow.addColorStop(0, `rgba(${parseInt(chakraColors[i].slice(1,3),16)}, ${parseInt(chakraColors[i].slice(3,5),16)}, ${parseInt(chakraColors[i].slice(5,7),16)}, ${ca * 0.15})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, py, cr * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Particles
    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      if (playing) {
        // Move toward body center with slight spiral
        const dx = 0.5 - p.x;
        const dy = 0.45 - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const attract = cue === 'breathe' ? 0.0003 * breathCycle : 0.0001;
        p.vx += dx * attract + Math.cos(t * 0.001 + i) * 0.00005;
        p.vy += dy * attract + Math.sin(t * 0.001 + i) * 0.00005;

        // Repel from center when exhaling
        if (cue === 'breathe' && breathCycle < 0.3) {
          p.vx -= dx * 0.0002;
          p.vy -= dy * 0.0002;
        }
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.995;
      p.vy *= 0.995;

      // Wrap
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;
      if (p.y < -0.05) p.y = 1.05;
      if (p.y > 1.05) p.y = -0.05;

      const px = p.x * w;
      const py = p.y * h;
      const ps = p.size * p.z * (playing ? 1.2 : 0.8);
      const po = p.opacity * p.z * (playing ? 0.8 : 0.35);

      ctx.fillStyle = `rgba(${rgb.r + p.hue}, ${rgb.g + p.hue}, ${rgb.b + p.hue}, ${po})`;
      ctx.beginPath();
      ctx.arc(px, py, ps, 0, Math.PI * 2);
      ctx.fill();
    }

    // Energy lines (connect nearby particles when playing)
    if (playing && cue !== 'rest') {
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.03)`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < Math.min(particles.length, 60); i++) {
        for (let j = i + 1; j < Math.min(particles.length, 60); j++) {
          const dx = (particles[i].x - particles[j].x) * w;
          const dy = (particles[i].y - particles[j].y) * h;
          const d = dx * dx + dy * dy;
          if (d < 3000) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x * w, particles[i].y * h);
            ctx.lineTo(particles[j].x * w, particles[j].y * h);
            ctx.stroke();
          }
        }
      }
    }

    // Scan line effect (holographic)
    const scanY = (t * 0.3 % h);
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.015)`;
    ctx.fillRect(0, scanY - 1, w, 2);

    timeRef.current += 16;
    animRef.current = requestAnimationFrame(draw);
  }, [color, cue, playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };
    resize();
    window.addEventListener('resize', resize);
    animRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 rounded-2xl"
      style={{ background: 'rgba(5, 5, 12, 0.95)' }}
      data-testid="holographic-canvas"
    />
  );
}
