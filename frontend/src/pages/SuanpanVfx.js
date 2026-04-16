import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

// ━━━ Sacred Assembly Loader (Concentric Rings VFX) ━━━
export function SacredAssemblyLoader({ delay, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const phases = ['Aligning Frequencies', 'Weaving Harmonics', 'Assembling Resonance', 'Manifesting'];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + (100 / (delay * 10));
        if (next >= 100) { clearInterval(interval); setTimeout(onComplete, 300); return 100; }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [delay, onComplete]);

  useEffect(() => {
    setPhase(Math.min(3, Math.floor(progress / 25)));
  }, [progress]);

  return (
    <motion.div className="fixed inset-0 z-[10002] flex flex-col items-center justify-center"
      style={{ background: 'rgba(6,6,14,0.95)', backdropFilter: 'none'}}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      data-testid="sacred-assembly-loader"
    >
      <div className="relative w-40 h-40 mb-8">
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div key={i} className="absolute inset-0 rounded-full border"
            style={{
              borderColor: `rgba(192,132,252,${0.08 + i * 0.04})`,
              transform: `scale(${0.3 + i * 0.18})`,
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360, scale: [0.3 + i * 0.18, 0.35 + i * 0.18, 0.3 + i * 0.18] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'linear' }}
          />
        ))}
        <motion.div className="absolute inset-0 flex items-center justify-center">
          <p className="text-lg font-mono font-light" style={{ color: '#C084FC' }}>
            {Math.round(progress)}%
          </p>
        </motion.div>
      </div>

      <motion.p className="text-[10px] tracking-[0.25em] uppercase mb-2"
        style={{ color: 'rgba(248,250,252,0.2)' }}
        key={phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        Sacred Assembly
      </motion.p>
      <motion.p className="text-[11px] font-light"
        style={{ color: '#C084FC', fontFamily: 'Cormorant Garamond, serif' }}
        key={`phase-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {phases[phase]}...
      </motion.p>

      <div className="w-48 h-[2px] mt-6 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
        <motion.div className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #C084FC, #EAB308)', width: `${progress}%` }}
        />
      </div>

      <p className="text-[7px] mt-4 max-w-xs text-center" style={{ color: 'rgba(248,250,252,0.12)' }}>
        Complex renders require assembly time. Upgrade your tier for faster materialization.
      </p>
    </motion.div>
  );
}

// ━━━ Light Trail Renderer (GPU-isolated visual effect) ━━━
export function LightTrailCanvas({ active, color = '#C084FC', intensity = 0.6 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  const initParticles = useCallback(() => {
    const particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * 300,
        y: Math.random() * 300,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        trail: [],
      });
    }
    particlesRef.current = particles;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    particlesRef.current.forEach(p => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // Store trail
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 12) p.trail.shift();

      // Draw trail
      if (p.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let i = 1; i < p.trail.length; i++) {
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
        }
        ctx.strokeStyle = `${color}${Math.round(p.alpha * intensity * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = p.radius * 0.6;
        ctx.stroke();
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${color}${Math.round(p.alpha * intensity * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    });

    animRef.current = requestAnimationFrame(draw);
  }, [color, intensity]);

  useEffect(() => {
    if (!active) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    initParticles();
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active, initParticles, draw]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: intensity, mixBlendMode: 'screen' }}
      data-testid="light-trail-canvas"
    />
  );
}

// ━━━ Bloom Glow Effect Wrapper ━━━
export function BloomGlow({ children, color = '#C084FC', active = false, pulseSpeed = 3 }) {
  if (!active) return children;

  return (
    <div className="relative" data-testid="bloom-glow-wrapper">
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${color}08 0%, transparent 70%)`,
          filter: `blur(20px)`,
        }}
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.02, 1] }}
        transition={{ duration: pulseSpeed, repeat: Infinity, ease: 'easeInOut' }}
      />
      {children}
    </div>
  );
}
