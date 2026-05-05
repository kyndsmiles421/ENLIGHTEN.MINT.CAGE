import React, { useRef, useEffect } from 'react';
import { useSensory } from '../../context/SensoryContext';

export function CosmicCanvas({ originColor, atmosphere, active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const { reduceParticles } = useSensory();

  useEffect(() => {
    if (reduceParticles || !active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      // Flatland: size to parent container, not viewport
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    const nebulaClouds = Array.from({ length: 6 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 200 + 100,
      dx: (Math.random() - 0.5) * 0.15,
      dy: (Math.random() - 0.5) * 0.1,
      hue: parseInt(originColor?.slice(1) || 'A855F7', 16) % 360,
    }));

    const shootingStars = [];
    let lastShoot = 0;

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nebulaClouds.forEach(c => {
        c.x += c.dx;
        c.y += c.dy;
        if (c.x < -c.radius) c.x = canvas.width + c.radius;
        if (c.x > canvas.width + c.radius) c.x = -c.radius;
        if (c.y < -c.radius) c.y = canvas.height + c.radius;
        if (c.y > canvas.height + c.radius) c.y = -c.radius;

        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius);
        grad.addColorStop(0, `${originColor || '#A855F7'}12`);
        grad.addColorStop(0.5, `${originColor || '#A855F7'}06`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(c.x - c.radius, c.y - c.radius, c.radius * 2, c.radius * 2);
      });

      stars.forEach(s => {
        const opacity = 0.3 + Math.sin(time * s.twinkleSpeed + s.phase) * 0.4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, opacity)})`;
        ctx.fill();
      });

      if (time - lastShoot > 4000 && Math.random() > 0.97) {
        lastShoot = time;
        shootingStars.push({
          x: Math.random() * canvas.width * 0.8,
          y: Math.random() * canvas.height * 0.3,
          dx: 4 + Math.random() * 3,
          dy: 2 + Math.random() * 2,
          life: 60,
        });
      }
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.dx;
        ss.y += ss.dy;
        ss.life--;
        const a = ss.life / 60;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.dx * 8, ss.y - ss.dy * 8);
        ctx.strokeStyle = `rgba(255,255,255,${a * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (ss.life <= 0) shootingStars.splice(i, 1);
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [originColor, atmosphere, active, reduceParticles]);

  if (reduceParticles || !active) return null;
  // Flatland: absolute (contained to parent), not fixed (viewport overlay).
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" style={{ opacity: 0.7 }} />;
}
