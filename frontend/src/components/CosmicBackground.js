import React, { useRef, useEffect, useCallback } from 'react';

export default function CosmicBackground() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const starsRef = useRef([]);
  const shootingRef = useRef([]);
  const nebulaRef = useRef([]);

  const init = useCallback((canvas) => {
    const w = canvas.width = window.innerWidth;
    const h = canvas.height = window.innerHeight;

    // Stars
    starsRef.current = Array.from({ length: 200 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      baseAlpha: Math.random() * 0.7 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: ['#fff', '#D8B4FE', '#2DD4BF', '#FCD34D', '#FDA4AF'][Math.floor(Math.random() * 5)],
    }));

    // Nebula blobs
    nebulaRef.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 300 + 150,
      color: ['rgba(192,132,252,', 'rgba(45,212,191,', 'rgba(139,92,246,', 'rgba(253,164,175,', 'rgba(252,211,77,'][Math.floor(Math.random() * 5)],
      drift: { x: (Math.random() - 0.5) * 0.15, y: (Math.random() - 0.5) * 0.1 },
      pulseSpeed: Math.random() * 0.003 + 0.001,
      pulseOffset: Math.random() * Math.PI * 2,
    }));
  }, []);

  const spawnShootingStar = useCallback((w, h) => {
    if (shootingRef.current.length < 2 && Math.random() < 0.003) {
      const startX = Math.random() * w;
      shootingRef.current.push({
        x: startX, y: 0,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 5 + 3,
        life: 1,
        decay: Math.random() * 0.015 + 0.008,
        len: Math.random() * 60 + 40,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    init(canvas);

    let time = 0;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      time += 1;

      ctx.clearRect(0, 0, w, h);

      // Nebula glow
      nebulaRef.current.forEach(n => {
        n.x += n.drift.x;
        n.y += n.drift.y;
        if (n.x < -n.r) n.x = w + n.r;
        if (n.x > w + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = h + n.r;
        if (n.y > h + n.r) n.y = -n.r;

        const pulse = 0.02 + 0.01 * Math.sin(time * n.pulseSpeed + n.pulseOffset);
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        grad.addColorStop(0, n.color + pulse + ')');
        grad.addColorStop(1, n.color + '0)');
        ctx.fillStyle = grad;
        ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
      });

      // Stars
      starsRef.current.forEach(s => {
        const alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        // Glow
        if (s.r > 1) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = alpha * 0.15;
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      // Shooting stars
      spawnShootingStar(w, h);
      shootingRef.current = shootingRef.current.filter(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        if (s.life <= 0) return false;

        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * s.len / 5, s.y - s.vy * s.len / 5);
        grad.addColorStop(0, `rgba(255,255,255,${s.life})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * s.len / 5, s.y - s.vy * s.len / 5);
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.life})`;
        ctx.fill();
        return true;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [init, spawnShootingStar]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.7 }}
      data-testid="cosmic-background"
    />
  );
}
