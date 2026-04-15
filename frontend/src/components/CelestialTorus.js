/**
 * CelestialTorus.js — φ³ Orbital Planetary Canvas
 * Extracted from UnifiedCreatorConsole.js.
 * The 7 pillars orbit a phi core. Tap a planet to expand modules.
 */
import { useState, useEffect, useRef } from 'react';
import { PHI, PHI_CUBED, GOLDEN_ANGLE, TOTAL, calculateDustAccrual, inverseMultiplier, findModule } from './ConsoleConstants';

export function CelestialTorus({ pillars, pillarLevels, onNav, currentRoute, onPillarTap, expandedPillar }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const tickRef = useRef(0);
  const [dust, setDust] = useState(0);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width; const h = c.height;
    const cx = w / 2; const cy = h / 2;

    const draw = () => {
      tickRef.current++;
      const t = tickRef.current;
      const dustVal = calculateDustAccrual(t);
      if (t % 10 === 0) setDust(dustVal);

      const speed = 0.002 + (dustVal / PHI_CUBED) * 0.003;
      ctx.clearRect(0, 0, w, h);

      // Torus rings
      const rings = [PHI * 25, PHI * 40, PHI * 58, PHI * 72];
      rings.forEach((r, i) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(16,185,129,${0.03 + i * 0.015})`;
        ctx.lineWidth = 0.5;
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Central phi core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
      coreGrad.addColorStop(0, `rgba(16,185,129,${0.15 + Math.sin(t * 0.02) * 0.08})`);
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = `rgba(16,185,129,${0.3 + Math.sin(t * 0.03) * 0.1})`;
      ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('\u03C6\u00B3', cx, cy + 4);

      // 7 Pillar Planets
      pillars.forEach((p, i) => {
        const orbitR = 30 + i * PHI * 10;
        const angle = i * GOLDEN_ANGLE + t * speed * (1 + i * 0.15);
        const x = cx + Math.cos(angle) * orbitR;
        const y = cy + Math.sin(angle) * orbitR * 0.7;
        const level = pillarLevels[i] / 100;
        const size = 6 + level * 6;
        const isCurrent = findModule(currentRoute)?.pillar.key === p.key;
        const isExpanded = expandedPillar === i;

        ctx.beginPath();
        ctx.strokeStyle = p.color + Math.round(level * 40 + 10).toString(16).padStart(2, '0');
        ctx.lineWidth = isCurrent ? 1.5 : 0.5;
        ctx.setLineDash(isExpanded ? [] : [2, 4]);
        ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
        ctx.setLineDash([]);

        const planetGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
        planetGrad.addColorStop(0, p.color + (isCurrent || isExpanded ? 'FF' : 'AA'));
        planetGrad.addColorStop(1, p.color + '22');
        ctx.fillStyle = planetGrad;
        ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();

        if (isCurrent || isExpanded || level > 0.6) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
          glow.addColorStop(0, p.color + '18');
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.arc(x, y, size * 2.5, 0, Math.PI * 2); ctx.fill();
        }

        ctx.fillStyle = isCurrent ? '#fff' : isExpanded ? p.color : p.color + '88';
        ctx.font = `${isCurrent || isExpanded ? 'bold ' : ''}8px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(p.title, x, y + size + 10);
        ctx.fillStyle = p.color + '44';
        ctx.font = '6px monospace';
        ctx.fillText(`${p.modules.length}`, x, y + size + 17);

        if (isExpanded) {
          p.modules.forEach((m, mi) => {
            const subAngle = angle + (mi - p.modules.length / 2) * 0.3;
            const subR = orbitR + 22 + mi * 3;
            const mx = cx + Math.cos(subAngle) * subR;
            const my = cy + Math.sin(subAngle) * subR * 0.7;
            const isThisMod = m.route === currentRoute;

            ctx.beginPath();
            ctx.fillStyle = isThisMod ? p.color : p.color + '66';
            ctx.arc(mx, my, isThisMod ? 5 : 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = isThisMod ? '#fff' : p.color + '55';
            ctx.font = `${isThisMod ? 'bold ' : ''}6px monospace`;
            ctx.fillText(m.label, mx, my + 9);
          });
        }
      });

      ctx.fillStyle = 'rgba(16,185,129,0.4)';
      ctx.font = '7px monospace'; ctx.textAlign = 'left';
      ctx.fillText(`DUST ${dustVal.toFixed(3)} / ${PHI_CUBED.toFixed(3)}`, 6, 12);
      ctx.fillText(`INV ${inverseMultiplier(dustVal).toFixed(4)}`, 6, 21);

      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [pillars, pillarLevels, currentRoute, expandedPillar]);

  const handleTap = (e) => {
    const c = canvasRef.current; const rect = c.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (c.width / rect.width);
    const y = (e.clientY - rect.top) * (c.height / rect.height);
    const cx = c.width / 2; const cy = c.height / 2;
    const t = tickRef.current;
    const dustVal = calculateDustAccrual(t);
    const speed = 0.002 + (dustVal / PHI_CUBED) * 0.003;

    if (expandedPillar !== null) {
      const p = pillars[expandedPillar]; const i = expandedPillar;
      const orbitR = 30 + i * PHI * 10;
      const angle = i * GOLDEN_ANGLE + t * speed * (1 + i * 0.15);
      for (let mi = 0; mi < p.modules.length; mi++) {
        const subAngle = angle + (mi - p.modules.length / 2) * 0.3;
        const subR = orbitR + 22 + mi * 3;
        const mx = cx + Math.cos(subAngle) * subR;
        const my = cy + Math.sin(subAngle) * subR * 0.7;
        if (Math.sqrt((x - mx) ** 2 + (y - my) ** 2) < 15) {
          onNav(p.modules[mi].route);
          return;
        }
      }
    }

    pillars.forEach((p, i) => {
      const orbitR = 30 + i * PHI * 10;
      const angle = i * GOLDEN_ANGLE + t * speed * (1 + i * 0.15);
      const px = cx + Math.cos(angle) * orbitR;
      const py = cy + Math.sin(angle) * orbitR * 0.7;
      if (Math.sqrt((x - px) ** 2 + (y - py) ** 2) < 18) {
        onPillarTap(i);
      }
    });
  };

  return (
    <div data-testid="celestial-torus">
      <canvas ref={canvasRef} width={380} height={240} onClick={handleTap}
        className="w-full cursor-pointer" style={{ background: 'transparent', touchAction: 'manipulation' }} />
      <div className="flex items-center justify-between px-3 py-1" style={{ borderTop: '1px solid rgba(16,185,129,0.06)' }}>
        <span className="text-[7px] font-mono" style={{ color: 'rgba(16,185,129,0.4)' }}>
          DUST {dust.toFixed(3)} / {PHI_CUBED.toFixed(3)}
        </span>
        <span className="text-[7px] font-mono" style={{ color: 'rgba(16,185,129,0.3)' }}>
          INV {inverseMultiplier(dust).toFixed(4)}
        </span>
        <span className="text-[7px] font-mono" style={{ color: 'rgba(192,132,252,0.3)' }}>
          {TOTAL}ch
        </span>
      </div>
    </div>
  );
}
