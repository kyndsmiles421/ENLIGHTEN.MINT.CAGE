import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Save, Loader2, Sparkles, Activity, Zap, TrendingUp, ChevronRight, Heart } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BODY_TYPES = [
  { id: 'slender', label: 'Slender', widthMul: 0.28, headMul: 0.42 },
  { id: 'balanced', label: 'Balanced', widthMul: 0.35, headMul: 0.45 },
  { id: 'broad', label: 'Broad', widthMul: 0.42, headMul: 0.48 },
];
const AURA_COLORS = ['#D8B4FE', '#FDA4AF', '#2DD4BF', '#3B82F6', '#FCD34D', '#FB923C', '#22C55E', '#C084FC', '#EF4444', '#06B6D4'];
const SILHOUETTES = [
  { id: 'default', label: 'Standard' },
  { id: 'lotus', label: 'Lotus Seated' },
  { id: 'standing', label: 'Standing Tall' },
  { id: 'warrior', label: 'Warrior' },
];
const ROBE_STYLES = [
  { id: 'flowing', label: 'Flowing Robes' },
  { id: 'fitted', label: 'Fitted' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'ceremonial', label: 'Ceremonial' },
];
const ROBE_COLORS = ['#1E1B4B', '#1C1917', '#0C4A6E', '#14532D', '#4C1D95', '#7C2D12', '#1E3A5F', '#2D1B4E'];
const GLOW_STYLES = [
  { id: 'soft', label: 'Soft Aura' },
  { id: 'radiant', label: 'Radiant Burst' },
  { id: 'crystalline', label: 'Crystalline' },
  { id: 'plasma', label: 'Plasma Field' },
];
const PARTICLE_DENSITIES = [
  { id: 'sparse', label: 'Sparse', count: 40 },
  { id: 'medium', label: 'Medium', count: 80 },
  { id: 'dense', label: 'Dense', count: 150 },
  { id: 'cosmic', label: 'Cosmic', count: 250 },
];

const hexToRgb = (hex) => {
  const h = hex || '#D8B4FE';
  return { r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) };
};

function AvatarPreview({ config, energyState }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const particlesRef = useRef([]);

  const bodyType = BODY_TYPES.find(b => b.id === config.body_type) || BODY_TYPES[1];

  // Blend energy state into visual parameters
  const energyLevel = energyState?.current_energy ?? 0.5;
  const auraOverride = energyState?.aura_state || {};
  const chakraOverride = energyState?.dominant_chakra || {};

  // Dynamic intensity: blend user setting with energy-derived
  const effectiveIntensity = config.aura_intensity * 0.4 + (auraOverride.intensity || 0.55) * 0.6;

  // Dynamic particle density: scale with energy
  const baseDensity = PARTICLE_DENSITIES.find(p => p.id === config.particle_density) || PARTICLE_DENSITIES[1];
  const energyParticleScale = 0.5 + energyLevel * 1.0;
  const effectiveParticleCount = Math.round(baseDensity.count * energyParticleScale);

  // Dynamic glow: use energy aura glow if available
  const effectiveGlow = auraOverride.glow || config.glow_style;

  // Dominant chakra emphasis
  const effectiveChakraEmphasis = chakraOverride.index !== undefined ? String(chakraOverride.index) : config.chakra_emphasis;

  // Blend aura color with chakra color
  const userRgb = hexToRgb(config.aura_color);
  const chakraRgb = hexToRgb(chakraOverride.color || config.aura_color);
  const blendFactor = energyLevel > 0.3 ? 0.3 : 0.1;
  const effectiveRgb = {
    r: Math.round(userRgb.r * (1 - blendFactor) + chakraRgb.r * blendFactor),
    g: Math.round(userRgb.g * (1 - blendFactor) + chakraRgb.g * blendFactor),
    b: Math.round(userRgb.b * (1 - blendFactor) + chakraRgb.b * blendFactor),
  };

  useEffect(() => {
    const pts = [];
    for (let i = 0; i < effectiveParticleCount; i++) {
      pts.push({
        x: Math.random(), y: Math.random(), z: Math.random() * 0.8 + 0.2,
        vx: (Math.random() - 0.5) * 0.0008 * (0.6 + energyLevel * 0.8),
        vy: (Math.random() - 0.5) * 0.0008 * (0.6 + energyLevel * 0.8),
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }
    particlesRef.current = pts;
  }, [effectiveParticleCount, energyLevel]);

  const robeRgb = hexToRgb(config.robe_color || '#1E1B4B');

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const t = timeRef.current;
    const rgb = effectiveRgb;
    const breathSpeed = 0.0012 + energyLevel * 0.001;
    const breathCycle = Math.sin(t * breathSpeed) * 0.5 + 0.5;
    const intensity = effectiveIntensity;

    ctx.fillStyle = 'rgba(5, 5, 12, 0.12)';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h * 0.42;
    const bodyH = h * 0.55;
    const bodyW = bodyH * bodyType.widthMul;
    const headR = bodyW * bodyType.headMul;
    const headY = cy - bodyH * 0.32;
    const pulseScale = 0.85 + breathCycle * 0.15;

    // Aura glow layers
    const auraModes = { soft: [5, 0.12], radiant: [7, 0.18], crystalline: [4, 0.14], plasma: [8, 0.22] };
    const [layers, alpha] = auraModes[effectiveGlow] || auraModes.soft;
    for (let layer = layers; layer >= 0; layer--) {
      const spread = 1 + layer * 0.18;
      const a = alpha * (1 - layer / (layers + 1)) * intensity;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bodyH * spread * 0.55);
      grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a * pulseScale})`);
      grad.addColorStop(0.6, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a * 0.2})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, bodyW * spread * 1.2, bodyH * spread * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Energy pulse ring (driven by energy level)
    if (energyLevel > 0.4) {
      const pulseRadius = bodyW * (1.3 + Math.sin(t * 0.002) * 0.3);
      const pulseAlpha = (energyLevel - 0.4) * 0.15;
      ctx.strokeStyle = `rgba(${chakraRgb.r}, ${chakraRgb.g}, ${chakraRgb.b}, ${pulseAlpha * breathCycle})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, pulseRadius * 1.2, pulseRadius * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Robe / body silhouette
    ctx.fillStyle = `rgba(${robeRgb.r}, ${robeRgb.g}, ${robeRgb.b}, 0.7)`;
    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.2 * intensity})`;
    ctx.lineWidth = 1.5;

    if (config.silhouette === 'lotus') {
      ctx.beginPath();
      ctx.ellipse(cx, cy + bodyH * 0.15, bodyW * 0.7, bodyH * 0.12, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - bodyW * 0.35, cy + bodyH * 0.08);
      ctx.quadraticCurveTo(cx - bodyW * 0.4, cy - bodyH * 0.1, cx - bodyW * 0.2, headY + headR);
      ctx.lineTo(cx + bodyW * 0.2, headY + headR);
      ctx.quadraticCurveTo(cx + bodyW * 0.4, cy - bodyH * 0.1, cx + bodyW * 0.35, cy + bodyH * 0.08);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (config.silhouette === 'warrior') {
      ctx.beginPath();
      ctx.moveTo(cx - bodyW * 0.5, cy + bodyH * 0.32);
      ctx.lineTo(cx - bodyW * 0.15, cy + bodyH * 0.08);
      ctx.quadraticCurveTo(cx - bodyW * 0.35, cy - bodyH * 0.08, cx - bodyW * 0.15, headY + headR);
      ctx.lineTo(cx + bodyW * 0.15, headY + headR);
      ctx.quadraticCurveTo(cx + bodyW * 0.35, cy - bodyH * 0.08, cx + bodyW * 0.15, cy + bodyH * 0.08);
      ctx.lineTo(cx + bodyW * 0.5, cy + bodyH * 0.32);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - bodyW * 0.2, cy - bodyH * 0.05);
      ctx.lineTo(cx - bodyW * 0.85, cy - bodyH * 0.05);
      ctx.moveTo(cx + bodyW * 0.2, cy - bodyH * 0.05);
      ctx.lineTo(cx + bodyW * 0.85, cy - bodyH * 0.05);
      ctx.stroke();
    } else {
      const legSpread = config.silhouette === 'standing' ? 0.15 : 0.12;
      ctx.beginPath();
      ctx.moveTo(cx - bodyW * legSpread, cy + bodyH * 0.32);
      ctx.lineTo(cx - bodyW * 0.18, cy + bodyH * 0.08);
      ctx.quadraticCurveTo(cx - bodyW * 0.35, cy - bodyH * 0.08, cx - bodyW * 0.2, headY + headR);
      ctx.lineTo(cx + bodyW * 0.2, headY + headR);
      ctx.quadraticCurveTo(cx + bodyW * 0.35, cy - bodyH * 0.08, cx + bodyW * 0.18, cy + bodyH * 0.08);
      ctx.lineTo(cx + bodyW * legSpread, cy + bodyH * 0.32);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }

    // Head
    const headGrad = ctx.createRadialGradient(cx, headY, 0, cx, headY, headR * 1.8);
    headGrad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.15 * intensity})`);
    headGrad.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`);
    headGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = headGrad;
    ctx.beginPath(); ctx.arc(cx, headY, headR * 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.2 * intensity})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, headY, headR, 0, Math.PI * 2); ctx.stroke();

    // Chakras with energy-driven dominant highlight
    const chakraColors = ['#EF4444', '#FB923C', '#FCD34D', '#22C55E', '#3B82F6', '#6366F1', '#C084FC'];
    for (let i = 0; i < 7; i++) {
      const py = headY + headR * 0.5 + (bodyH * 0.42) * (i / 6);
      const isDominant = effectiveChakraEmphasis === String(i);
      const isAll = effectiveChakraEmphasis === 'all';
      const active = isAll || isDominant;
      let cr = active ? 3 + Math.sin(t * 0.003 + i) * 1.5 : 1.5;
      let ca = active ? 0.5 + Math.sin(t * 0.004 + i * 0.7) * 0.3 : 0.15;

      // Dominant chakra gets extra glow from energy
      if (isDominant) {
        cr *= 1 + energyLevel * 0.5;
        ca = Math.min(1, ca + energyLevel * 0.3);
      }

      const cc = chakraColors[i];
      const cr1 = parseInt(cc.slice(1, 3), 16);
      const cg1 = parseInt(cc.slice(3, 5), 16);
      const cb1 = parseInt(cc.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${cr1}, ${cg1}, ${cb1}, ${ca})`;
      ctx.beginPath(); ctx.arc(cx, py, cr, 0, Math.PI * 2); ctx.fill();
      if (active) {
        const glowRadius = isDominant ? cr * 10 : cr * 6;
        const glowAlpha = isDominant ? ca * 0.35 : ca * 0.2;
        const glow = ctx.createRadialGradient(cx, py, 0, cx, py, glowRadius);
        glow.addColorStop(0, `rgba(${cr1}, ${cg1}, ${cb1}, ${glowAlpha})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(cx, py, glowRadius, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Energy trails
    if (config.energy_trails) {
      const trailAlpha = 0.03 + energyLevel * 0.03;
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${trailAlpha})`;
      ctx.lineWidth = 0.5;
      const trailCount = Math.round(8 + energyLevel * 6);
      for (let i = 0; i < trailCount; i++) {
        const angle = (t * 0.0003 + i * Math.PI * 2 / trailCount) % (Math.PI * 2);
        const r1 = bodyW * 0.8; const r2 = bodyW * 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1 * 0.5);
        ctx.quadraticCurveTo(
          cx + Math.cos(angle + 0.3) * (r1 + r2) / 2,
          cy + Math.sin(angle + 0.3) * (r1 + r2) / 2 * 0.5,
          cx + Math.cos(angle + 0.5) * r2,
          cy + Math.sin(angle + 0.5) * r2 * 0.5
        );
        ctx.stroke();
      }
    }

    // Particles
    const pts = particlesRef.current;
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      const dx = 0.5 - p.x; const dy = 0.42 - p.y;
      p.vx += dx * 0.00008; p.vy += dy * 0.00008;
      if (p.x < -0.05) p.x = 1.05; if (p.x > 1.05) p.x = -0.05;
      if (p.y < -0.05) p.y = 1.05; if (p.y > 1.05) p.y = -0.05;
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.opacity * p.z * intensity * 0.6})`;
      ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.size * p.z, 0, Math.PI * 2); ctx.fill();
    }

    // Scan line
    const scanY = (t * 0.25 % h);
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.012)`;
    ctx.fillRect(0, scanY - 0.5, w, 1);

    timeRef.current += 16;
    animRef.current = requestAnimationFrame(draw);
  }, [config, bodyType, robeRgb, effectiveRgb, effectiveIntensity, effectiveGlow, effectiveChakraEmphasis, energyLevel, chakraRgb]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 400; canvas.height = 500;
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ width: 400, height: 500, maxWidth: '100%', background: 'rgba(5,5,12,0.95)', border: `1px solid ${config.aura_color}20` }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} data-testid="avatar-preview-canvas" />
    </div>
  );
}

function EnergyMeter({ energy, chakra, mood }) {
  const pct = Math.round(energy * 100);
  const chakraRgb = hexToRgb(chakra?.color || '#C084FC');
  const barColor = chakra?.color || '#C084FC';

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} data-testid="energy-meter">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={14} style={{ color: barColor }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Energy Field</span>
        </div>
        <span className="text-lg font-light" style={{ color: barColor, fontFamily: 'Cormorant Garamond, serif' }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${barColor}40, ${barColor})`, boxShadow: `0 0 12px ${barColor}40` }}
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: barColor, boxShadow: `0 0 8px ${barColor}60` }} />
          <span className="text-[11px] capitalize" style={{ color: 'var(--text-secondary)' }}>{mood}</span>
        </div>
        <span className="text-[11px]" style={{ color: barColor }}>{chakra?.name} Chakra</span>
      </div>
    </div>
  );
}

function EnergyStatePanel({ energyState }) {
  if (!energyState) return null;
  const { current_energy, energy_shift, dominant_chakra, aura_state, activity_boosts, recommendation, current_mood, trend } = energyState;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-3 mt-4"
      data-testid="energy-state-panel"
    >
      <EnergyMeter energy={current_energy} chakra={dominant_chakra} mood={current_mood} />

      {/* Chakra message */}
      <div className="rounded-xl p-3" style={{ background: `${dominant_chakra.color}08`, border: `1px solid ${dominant_chakra.color}15` }}>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{dominant_chakra.message}</p>
      </div>

      {/* Aura description */}
      <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <Sparkles size={12} className="mt-0.5 flex-shrink-0" style={{ color: dominant_chakra.color }} />
        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{aura_state.description}</p>
      </div>

      {/* Activity boosts */}
      {activity_boosts.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            <Zap size={10} className="inline mr-1" /> Recent Boosts
          </p>
          {activity_boosts.slice(0, 4).map((b, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <span className="text-[11px] capitalize" style={{ color: 'var(--text-secondary)' }}>{b.type}</span>
              <span className="text-[11px] font-medium" style={{ color: '#22C55E' }}>+{Math.round(b.boost * 100)}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Energy shift */}
      {energy_shift !== 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: energy_shift > 0 ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
          <TrendingUp size={12} style={{ color: energy_shift > 0 ? '#22C55E' : '#EF4444', transform: energy_shift < 0 ? 'scaleY(-1)' : 'none' }} />
          <span className="text-[11px]" style={{ color: energy_shift > 0 ? '#22C55E' : '#EF4444' }}>
            {energy_shift > 0 ? '+' : ''}{Math.round(energy_shift * 100)}% from activities today
          </span>
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div className="rounded-xl p-3" style={{ background: 'rgba(192,132,252,0.04)', border: '1px solid rgba(192,132,252,0.1)' }}>
          <div className="flex items-center gap-2">
            <Heart size={12} style={{ color: '#C084FC' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#C084FC' }}>Suggestion</span>
          </div>
          <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{recommendation.message}</p>
        </div>
      )}

      {/* Mini trend */}
      {trend && trend.length > 2 && (
        <div className="flex items-center gap-1 px-1">
          <span className="text-[9px] uppercase tracking-widest mr-1" style={{ color: 'var(--text-muted)' }}>7d</span>
          {trend.slice(0, 10).reverse().map((t, i) => (
            <div key={i} className="flex-1 rounded-full" style={{ height: `${Math.max(4, t.energy * 20)}px`, background: `${dominant_chakra.color}${Math.round(30 + t.energy * 70).toString(16)}`, maxWidth: 12 }} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function AvatarCreator() {
  const { authHeaders } = useAuth();
  const [config, setConfig] = useState({
    body_type: 'balanced', aura_color: '#D8B4FE', aura_intensity: 0.6,
    silhouette: 'default', robe_style: 'flowing', robe_color: '#1E1B4B',
    chakra_emphasis: 'all', particle_density: 'medium', glow_style: 'soft', energy_trails: true,
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [energyState, setEnergyState] = useState(null);

  useEffect(() => {
    const loadAvatar = axios.get(`${API}/avatar`, { headers: authHeaders }).then(r => {
      if (r.data.body_type) setConfig(r.data);
    }).catch(() => {});
    const loadEnergy = axios.get(`${API}/avatar/energy-state`, { headers: authHeaders }).then(r => {
      setEnergyState(r.data);
    }).catch(() => {});
    Promise.all([loadAvatar, loadEnergy]).finally(() => setLoaded(true));
  }, [authHeaders]);

  const update = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  const save = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/avatar`, config, { headers: authHeaders });
      toast.success('Avatar saved!');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const OptionGroup = ({ label, options, value, onChange, colorMode }) => (
    <div className="mb-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => {
          const sel = value === (opt.id || opt);
          const optId = opt.id || opt;
          const optLabel = opt.label || opt;
          return colorMode ? (
            <button key={optId} onClick={() => onChange(optId)}
              className="w-7 h-7 rounded-full transition-all"
              style={{ background: optId, border: sel ? '2px solid white' : '2px solid transparent', transform: sel ? 'scale(1.15)' : 'scale(1)' }}
              data-testid={`avatar-opt-${optId}`} />
          ) : (
            <button key={optId} onClick={() => onChange(optId)}
              className="px-3 py-1.5 rounded-lg text-[11px] transition-all"
              style={{ background: sel ? `${config.aura_color}12` : 'rgba(255,255,255,0.02)', color: sel ? config.aura_color : 'var(--text-muted)', border: `1px solid ${sel ? `${config.aura_color}20` : 'rgba(255,255,255,0.06)'}` }}
              data-testid={`avatar-opt-${optId}`}>
              {optLabel}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (!loaded) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" style={{ color: 'var(--text-muted)' }} /></div>;

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" data-testid="avatar-creator-page">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: config.aura_color }}>
            <Sparkles size={14} className="inline mr-2" /> Avatar Creator
          </p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Your Holographic Self
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Your energy body reflects your wellness journey. As you meditate, practice yoga, and cultivate awareness, your avatar transforms.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Avatar Preview + Energy State */}
          <div className="flex-shrink-0 mx-auto lg:mx-0" style={{ width: 400, maxWidth: '100%' }}>
            <AvatarPreview config={config} energyState={energyState} />
            <EnergyStatePanel energyState={energyState} />
            <button onClick={save} disabled={saving}
              className="w-full mt-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ background: `${config.aura_color}12`, color: config.aura_color, border: `1px solid ${config.aura_color}20` }}
              data-testid="save-avatar-btn">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Avatar'}
            </button>
          </div>

          {/* Right: Controls */}
          <div className="flex-1">
            <OptionGroup label="Body Type" options={BODY_TYPES} value={config.body_type} onChange={v => update('body_type', v)} />
            <OptionGroup label="Aura Color" options={AURA_COLORS} value={config.aura_color} onChange={v => update('aura_color', v)} colorMode />
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5" style={{ color: 'var(--text-muted)' }}>Aura Intensity</p>
              <input type="range" min="0.2" max="1" step="0.1" value={config.aura_intensity}
                onChange={e => update('aura_intensity', parseFloat(e.target.value))}
                className="w-full accent-purple-400" data-testid="avatar-intensity-slider" />
            </div>
            <OptionGroup label="Pose" options={SILHOUETTES} value={config.silhouette} onChange={v => update('silhouette', v)} />
            <OptionGroup label="Robe Style" options={ROBE_STYLES} value={config.robe_style} onChange={v => update('robe_style', v)} />
            <OptionGroup label="Robe Color" options={ROBE_COLORS} value={config.robe_color} onChange={v => update('robe_color', v)} colorMode />
            <OptionGroup label="Glow Style" options={GLOW_STYLES} value={config.glow_style} onChange={v => update('glow_style', v)} />
            <OptionGroup label="Particle Density" options={PARTICLE_DENSITIES} value={config.particle_density} onChange={v => update('particle_density', v)} />
            <div className="mb-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={config.energy_trails} onChange={e => update('energy_trails', e.target.checked)}
                  className="accent-purple-400" data-testid="avatar-trails-toggle" />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Energy Trails</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
