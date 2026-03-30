import React, { useState, useRef, useEffect } from 'react';

export function RealmStarMap({ players, onPlayerClick, reduceParticles }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const bgStars = Array.from({ length: reduceParticles ? 30 : 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      twinkle: Math.random() * 0.015 + 0.003,
      phase: Math.random() * Math.PI * 2,
    }));

    const playerPositions = players.map((p, i) => {
      const angle = (i / Math.max(1, players.length)) * Math.PI * 2 - Math.PI / 2;
      const radius = Math.min(W, H) * 0.3;
      return {
        ...p,
        x: W / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
        y: H / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    });

    const animate = (time) => {
      ctx.clearRect(0, 0, W, H);

      bgStars.forEach(s => {
        const opacity = 0.2 + Math.sin(time * s.twinkle + s.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, opacity)})`;
        ctx.fill();
      });

      if (playerPositions.length > 1) {
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < playerPositions.length; i++) {
          for (let j = i + 1; j < playerPositions.length; j++) {
            const dist = Math.hypot(playerPositions[i].x - playerPositions[j].x, playerPositions[i].y - playerPositions[j].y);
            if (dist < 250) {
              ctx.beginPath();
              ctx.moveTo(playerPositions[i].x, playerPositions[i].y);
              ctx.lineTo(playerPositions[j].x, playerPositions[j].y);
              ctx.stroke();
            }
          }
        }
      }

      playerPositions.forEach((p) => {
        const color = p.color || '#818CF8';
        const pulse = 1 + Math.sin(time * 0.003 + p.pulsePhase) * 0.15;
        const baseR = p.is_self ? 12 : 8;
        const r = baseR * pulse;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        grad.addColorStop(0, `${color}30`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(p.x - r * 3, p.y - r * 3, r * 6, r * 6);

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `${color}80`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.font = `${p.is_self ? 'bold' : ''} 10px system-ui`;
        ctx.fillStyle = `${color}CC`;
        ctx.textAlign = 'center';
        ctx.fillText(p.character_name || 'Traveler', p.x, p.y + r + 14);
        ctx.font = '8px system-ui';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(`Lvl ${p.level} ${p.origin_name}`, p.x, p.y + r + 26);
      });

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      for (const p of playerPositions) {
        if (Math.hypot(p.x - mx, p.y - my) < 20 && !p.is_self) {
          onPlayerClick?.(p);
          return;
        }
      }
    };
    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('click', handleClick);
    };
  }, [players, onPlayerClick, reduceParticles]);

  return (
    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden" data-testid="realm-star-map"
      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <canvas ref={canvasRef} className="w-full h-full" />
      {players.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No other adventurers in the realm right now</p>
        </div>
      )}
    </div>
  );
}
