import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Sparkles, Heart, TrendingUp, TrendingDown, Minus, ChevronRight,
  Sun, Zap, Brain, Wind, Frown, Moon, Meh, Target
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const QUICK_MOODS = [
  { id: 'happy', name: 'Happy', icon: Sparkles, color: '#FCD34D' },
  { id: 'peaceful', name: 'Peaceful', icon: Sun, color: '#2DD4BF' },
  { id: 'energized', name: 'Energized', icon: Zap, color: '#FB923C' },
  { id: 'grateful', name: 'Grateful', icon: Heart, color: '#FDA4AF' },
  { id: 'stressed', name: 'Stressed', icon: Brain, color: '#EF4444' },
  { id: 'anxious', name: 'Anxious', icon: Wind, color: '#FB923C' },
  { id: 'sad', name: 'Sad', icon: Frown, color: '#3B82F6' },
  { id: 'tired', name: 'Tired', icon: Moon, color: '#8B5CF6' },
];

export default function CosmicMoodRing() {
  const { token, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [logging, setLogging] = useState(null);
  const [noData, setNoData] = useState(false);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    axios.get(`${API}/mood-ring`, { headers: authHeaders })
      .then(r => setData(r.data))
      .catch(() => setNoData(true));
  }, [token, authHeaders]);

  const quickLog = useCallback(async (mood) => {
    if (!token || logging) return;
    setLogging(mood.id);
    try {
      await axios.post(`${API}/moods`, { mood: mood.id, intensity: 5, note: '' }, { headers: authHeaders });
      toast.success(`Logged: ${mood.name}`, { description: 'Your mood ring is updating...' });
      setShowQuickLog(false);
      // Refresh ring data
      const r = await axios.get(`${API}/mood-ring`, { headers: authHeaders });
      setData(r.data);
      setNoData(false);
    } catch {
      toast.error('Could not log mood');
    }
    setLogging(null);
  }, [token, authHeaders, logging]);

  // Canvas orb animation
  useEffect(() => {
    if (!canvasRef.current) return;
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

    const colors = data?.colors || { primary: '#C084FC', secondary: '#8B5CF6', glow: '#C084FC' };
    const layers = data?.layers || [{ color: '#C084FC', opacity: 0.4, speed: 3 }];
    const pulseSpeed = data?.pulse_speed || 3;

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, size, size);

      const glowC = parseColor(colors.glow);
      const auraR = 80 + Math.sin(time * 0.8) * 8;
      const auraGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, auraR);
      auraGrad.addColorStop(0, `rgba(${glowC.r},${glowC.g},${glowC.b},0)`);
      auraGrad.addColorStop(0.6, `rgba(${glowC.r},${glowC.g},${glowC.b},0.04)`);
      auraGrad.addColorStop(1, `rgba(${glowC.r},${glowC.g},${glowC.b},0)`);
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, size, size);

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

      const pulse = 1 + Math.sin(time * pulseSpeed * 0.5) * 0.08;
      const coreR = 28 * pulse;
      const pC = parseColor(colors.primary);
      const sC = parseColor(colors.secondary);

      const coreGrad = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, coreR);
      coreGrad.addColorStop(0, `rgba(255,255,255,0.3)`);
      coreGrad.addColorStop(0.3, `rgba(${pC.r},${pC.g},${pC.b},0.7)`);
      coreGrad.addColorStop(0.7, `rgba(${sC.r},${sC.g},${sC.b},0.4)`);
      coreGrad.addColorStop(1, `rgba(${sC.r},${sC.g},${sC.b},0)`);
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      const gleamGrad = ctx.createRadialGradient(cx - 8, cy - 10, 0, cx - 8, cy - 10, 12);
      gleamGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
      gleamGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gleamGrad;
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 10, 12, 0, Math.PI * 2);
      ctx.fill();

      const ringAlpha = 0.15 + Math.sin(time * 2) * 0.08;
      ctx.strokeStyle = `rgba(${pC.r},${pC.g},${pC.b},${ringAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 38 + Math.sin(time * 1.5) * 3, 0, Math.PI * 2);
      ctx.stroke();

      const ring2Alpha = 0.08 + Math.sin(time * 1.2 + 1) * 0.04;
      ctx.strokeStyle = `rgba(${sC.r},${sC.g},${sC.b},${ring2Alpha})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 50 + Math.sin(time * 0.9) * 4, 0, Math.PI * 2);
      ctx.stroke();

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

  const primaryColor = data?.colors?.primary || '#C084FC';

  // Empty / no-data state — still show the ring with a CTA
  if (!data && !noData) return null;

  const TrendIcon = data?.trend === 'rising' ? TrendingUp : data?.trend === 'falling' ? TrendingDown : Minus;

  return (
    <div className="relative" data-testid="cosmic-mood-ring">
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="glass-card p-5 relative overflow-hidden cursor-pointer group transition-all"
        style={{ border: `1px solid transparent` }}
        onClick={() => {
          if (showQuickLog) return;
          navigate('/mood');
        }}
        data-testid="mood-ring-navigate">
        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 30% 50%, ${primaryColor}08, transparent 70%)` }} />

        {/* Background accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.06]"
          style={{ background: primaryColor, filter: 'blur(30px)' }} />

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
              <Sparkles size={12} style={{ color: primaryColor }} />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
                Cosmic Mood Ring
              </p>
            </div>

            {data ? (
              <>
                <p className="text-sm font-light leading-relaxed mb-2"
                  style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                  {data.message}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px]"
                    style={{ background: `${primaryColor}10`, border: `1px solid ${primaryColor}15`, color: primaryColor }}>
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
              </>
            ) : (
              <div>
                <p className="text-sm font-light leading-relaxed mb-2"
                  style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-secondary)' }}>
                  Your mood ring awaits its first reading...
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Tap to log your mood and watch the ring come alive
                </p>
              </div>
            )}

            {/* Action row */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); setShowQuickLog(!showQuickLog); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-105"
                style={{
                  background: showQuickLog ? `${primaryColor}15` : 'rgba(248,250,252,0.04)',
                  border: `1px solid ${showQuickLog ? `${primaryColor}25` : 'rgba(248,250,252,0.06)'}`,
                  color: showQuickLog ? primaryColor : 'var(--text-secondary)',
                }}
                data-testid="quick-mood-toggle">
                <Target size={10} /> Quick Log
              </button>
              <span className="flex items-center gap-1 text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-muted)' }}>
                Open Mood Tracker <ChevronRight size={9} />
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Mood Log Panel */}
      <AnimatePresence>
        {showQuickLog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="glass-card mt-2 p-4" data-testid="quick-mood-panel">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--text-muted)' }}>
                How are you feeling right now?
              </p>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_MOODS.map(mood => {
                  const Icon = mood.icon;
                  return (
                    <motion.button key={mood.id}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => quickLog(mood)}
                      disabled={!!logging}
                      className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all hover:scale-105"
                      style={{
                        background: logging === mood.id ? `${mood.color}15` : 'rgba(248,250,252,0.03)',
                        border: `1px solid ${logging === mood.id ? `${mood.color}30` : 'rgba(248,250,252,0.05)'}`,
                        opacity: logging && logging !== mood.id ? 0.4 : 1,
                      }}
                      data-testid={`quick-mood-${mood.id}`}>
                      <Icon size={16} style={{ color: mood.color }} />
                      <span className="text-[9px]" style={{ color: logging === mood.id ? mood.color : 'var(--text-secondary)' }}>
                        {mood.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              <button onClick={() => navigate('/mood')}
                className="w-full mt-3 py-2 rounded-lg text-[10px] font-medium transition-all hover:scale-[1.01]"
                style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: 'var(--text-secondary)' }}
                data-testid="full-mood-tracker-link">
                Open Full Mood Tracker <ChevronRight size={10} className="inline ml-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
