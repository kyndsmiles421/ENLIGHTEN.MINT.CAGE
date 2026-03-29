import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CosmicMoodRing() {
  const { token, authHeaders } = useAuth();
  const [data, setData] = useState(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    axios.get(`${API}/mood-ring`, { headers: authHeaders })
      .then(r => setData(r.data))
      .catch(() => {});
  }, [token, authHeaders]);

  // Canvas orb animation
  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size; canvas.height = size;
    const cx = size / 2, cy = size / 2;
    let time = 0;

    const parseColor = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const colors = data.colors;
    const layers = data.layers;
    const pulseSpeed = data.pulse_speed || 3;

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, size, size);

      // Outer aura glow
      const glowC = parseColor(colors.glow);
      const auraR = 80 + Math.sin(time * 0.8) * 8;
      const auraGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, auraR);
      auraGrad.addColorStop(0, `rgba(${glowC.r},${glowC.g},${glowC.b},0)`);
      auraGrad.addColorStop(0.6, `rgba(${glowC.r},${glowC.g},${glowC.b},0.04)`);
      auraGrad.addColorStop(1, `rgba(${glowC.r},${glowC.g},${glowC.b},0)`);
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, size, size);

      // Dynamic layers — orbiting color fields
      layers.forEach((layer, i) => {
        const lc = parseColor(layer.color);
        const angle = time * (0.3 + i * 0.15) + i * 1.5;
        const offsetR = 15 + Math.sin(time * 0.5 + i) * 5;
        const lx = cx + Math.cos(angle) * offsetR;
        const ly = cy + Math.sin(angle) * offsetR;
        const lr = 30 + Math.sin(time * layer.speed * 0.3) * 8;
        const layerGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
        layerGrad.addColorStop(0, `rgba(${lc.r},${lc.g},${lc.b},${layer.opacity})`);
        layerGrad.addColorStop(0.5, `rgba(${lc.r},${lc.g},${lc.b},${layer.opacity * 0.4})`);
        layerGrad.addColorStop(1, `rgba(${lc.r},${lc.g},${lc.b},0)`);
        ctx.fillStyle = layerGrad;
        ctx.beginPath();
        ctx.arc(lx, ly, lr, 0, Math.PI * 2);
        ctx.fill();
      });

      // Core orb with breathing pulse
      const pulse = 1 + Math.sin(time * pulseSpeed * 0.5) * 0.08;
      const coreR = 28 * pulse;
      const pC = parseColor(colors.primary);
      const sC = parseColor(colors.secondary);

      // Inner gradient sphere
      const coreGrad = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, coreR);
      coreGrad.addColorStop(0, `rgba(255,255,255,0.3)`);
      coreGrad.addColorStop(0.3, `rgba(${pC.r},${pC.g},${pC.b},0.7)`);
      coreGrad.addColorStop(0.7, `rgba(${sC.r},${sC.g},${sC.b},0.4)`);
      coreGrad.addColorStop(1, `rgba(${sC.r},${sC.g},${sC.b},0)`);
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Highlight gleam
      const gleamGrad = ctx.createRadialGradient(cx - 8, cy - 10, 0, cx - 8, cy - 10, 12);
      gleamGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
      gleamGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gleamGrad;
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 10, 12, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring shimmer
      const ringAlpha = 0.15 + Math.sin(time * 2) * 0.08;
      ctx.strokeStyle = `rgba(${pC.r},${pC.g},${pC.b},${ringAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 38 + Math.sin(time * 1.5) * 3, 0, Math.PI * 2);
      ctx.stroke();

      // Second ring
      const ring2Alpha = 0.08 + Math.sin(time * 1.2 + 1) * 0.04;
      ctx.strokeStyle = `rgba(${sC.r},${sC.g},${sC.b},${ring2Alpha})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 50 + Math.sin(time * 0.9) * 4, 0, Math.PI * 2);
      ctx.stroke();

      // Floating particles
      for (let i = 0; i < 8; i++) {
        const pa = time * 0.5 + i * 0.785;
        const pr = 35 + Math.sin(time * 0.8 + i * 2) * 12;
        const px = cx + Math.cos(pa) * pr;
        const py = cy + Math.sin(pa) * pr;
        const pAlpha = 0.3 + Math.sin(time * 2 + i) * 0.2;
        ctx.fillStyle = `rgba(${pC.r},${pC.g},${pC.b},${pAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [data]);

  if (!data) return null;

  const TrendIcon = data.trend === 'rising' ? TrendingUp : data.trend === 'falling' ? TrendingDown : Minus;

  return (
    <div className="glass-card p-5 relative overflow-hidden" data-testid="cosmic-mood-ring">
      {/* Background accent */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.06]"
        style={{ background: data.colors.primary, filter: 'blur(30px)' }} />

      <div className="flex items-center gap-5">
        {/* Animated Orb */}
        <div className="flex-shrink-0 relative">
          <canvas ref={canvasRef} width={200} height={200}
            className="w-[120px] h-[120px] md:w-[140px] md:h-[140px]"
            data-testid="mood-ring-canvas" />
        </div>

        {/* Mood Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={12} style={{ color: data.colors.primary }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: data.colors.primary }}>
              Cosmic Mood Ring
            </p>
          </div>

          <p className="text-sm font-light leading-relaxed mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            {data.message}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px]"
              style={{ background: `${data.colors.primary}10`, border: `1px solid ${data.colors.primary}15`, color: data.colors.primary }}>
              <Heart size={10} /> {data.dominant_mood}
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px]"
              style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-muted)' }}>
              <TrendIcon size={10} /> Energy {data.trend}
            </div>
            {data.mood_count > 0 && (
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {data.mood_count} entries this week
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
