import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Save, Loader2, Check, Sparkles, RefreshCw } from 'lucide-react';
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

function AvatarPreview({ config }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const particlesRef = useRef([]);

  const bodyType = BODY_TYPES.find(b => b.id === config.body_type) || BODY_TYPES[1];
  const particleDensity = PARTICLE_DENSITIES.find(p => p.id === config.particle_density) || PARTICLE_DENSITIES[1];

  useEffect(() => {
    const pts = [];
    for (let i = 0; i < particleDensity.count; i++) {
      pts.push({ x: Math.random(), y: Math.random(), z: Math.random() * 0.8 + 0.2, vx: (Math.random() - 0.5) * 0.0008, vy: (Math.random() - 0.5) * 0.0008, size: Math.random() * 2.5 + 0.5, opacity: Math.random() * 0.6 + 0.2 });
    }
    particlesRef.current = pts;
  }, [particleDensity.count]);

  const hexToRgb = (hex) => ({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) });
  const robeRgb = hexToRgb(config.robe_color || '#1E1B4B');

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const t = timeRef.current;
    const rgb = hexToRgb(config.aura_color);
    const breathCycle = Math.sin(t * 0.0012) * 0.5 + 0.5;
    const intensity = config.aura_intensity || 0.6;

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
    const [layers, alpha] = auraModes[config.glow_style] || auraModes.soft;
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

    // Robe / body silhouette
    const drawBody = () => {
      ctx.fillStyle = `rgba(${robeRgb.r}, ${robeRgb.g}, ${robeRgb.b}, 0.7)`;
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.2 * intensity})`;
      ctx.lineWidth = 1.5;

      if (config.silhouette === 'lotus') {
        // Seated cross-legged
        ctx.beginPath();
        ctx.ellipse(cx, cy + bodyH * 0.15, bodyW * 0.7, bodyH * 0.12, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        // Torso
        ctx.beginPath();
        ctx.moveTo(cx - bodyW * 0.35, cy + bodyH * 0.08);
        ctx.quadraticCurveTo(cx - bodyW * 0.4, cy - bodyH * 0.1, cx - bodyW * 0.2, headY + headR);
        ctx.lineTo(cx + bodyW * 0.2, headY + headR);
        ctx.quadraticCurveTo(cx + bodyW * 0.4, cy - bodyH * 0.1, cx + bodyW * 0.35, cy + bodyH * 0.08);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      } else if (config.silhouette === 'warrior') {
        // Wide stance
        ctx.beginPath();
        ctx.moveTo(cx - bodyW * 0.5, cy + bodyH * 0.32);
        ctx.lineTo(cx - bodyW * 0.15, cy + bodyH * 0.08);
        ctx.quadraticCurveTo(cx - bodyW * 0.35, cy - bodyH * 0.08, cx - bodyW * 0.15, headY + headR);
        ctx.lineTo(cx + bodyW * 0.15, headY + headR);
        ctx.quadraticCurveTo(cx + bodyW * 0.35, cy - bodyH * 0.08, cx + bodyW * 0.15, cy + bodyH * 0.08);
        ctx.lineTo(cx + bodyW * 0.5, cy + bodyH * 0.32);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Arms extended
        ctx.beginPath();
        ctx.moveTo(cx - bodyW * 0.2, cy - bodyH * 0.05);
        ctx.lineTo(cx - bodyW * 0.85, cy - bodyH * 0.05);
        ctx.moveTo(cx + bodyW * 0.2, cy - bodyH * 0.05);
        ctx.lineTo(cx + bodyW * 0.85, cy - bodyH * 0.05);
        ctx.stroke();
      } else {
        // Standing / default
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
    };
    drawBody();

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

    // Chakras
    const chakraColors = ['#EF4444', '#FB923C', '#FCD34D', '#22C55E', '#3B82F6', '#6366F1', '#C084FC'];
    const emphasis = config.chakra_emphasis;
    for (let i = 0; i < 7; i++) {
      const py = headY + headR * 0.5 + (bodyH * 0.42) * (i / 6);
      const active = emphasis === 'all' || emphasis === String(i);
      const cr = active ? 3 + Math.sin(t * 0.003 + i) * 1.5 : 1.5;
      const ca = active ? 0.5 + Math.sin(t * 0.004 + i * 0.7) * 0.3 : 0.15;
      const cc = chakraColors[i];
      const cr1 = parseInt(cc.slice(1, 3), 16);
      const cg1 = parseInt(cc.slice(3, 5), 16);
      const cb1 = parseInt(cc.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${cr1}, ${cg1}, ${cb1}, ${ca})`;
      ctx.beginPath(); ctx.arc(cx, py, cr, 0, Math.PI * 2); ctx.fill();
      if (active) {
        const glow = ctx.createRadialGradient(cx, py, 0, cx, py, cr * 6);
        glow.addColorStop(0, `rgba(${cr1}, ${cg1}, ${cb1}, ${ca * 0.2})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(cx, py, cr * 8, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Energy trails
    if (config.energy_trails) {
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04)`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 8; i++) {
        const angle = (t * 0.0003 + i * Math.PI / 4) % (Math.PI * 2);
        const r1 = bodyW * 0.8; const r2 = bodyW * 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1 * 0.5);
        ctx.quadraticCurveTo(cx + Math.cos(angle + 0.3) * (r1 + r2) / 2, cy + Math.sin(angle + 0.3) * (r1 + r2) / 2 * 0.5, cx + Math.cos(angle + 0.5) * r2, cy + Math.sin(angle + 0.5) * r2 * 0.5);
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
  }, [config, bodyType, robeRgb, hexToRgb]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = 400; canvas.height = 500; };
    resize();
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ width: 400, height: 500, maxWidth: '100%', background: 'rgba(5,5,12,0.95)', border: `1px solid ${config.aura_color}20` }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} data-testid="avatar-preview-canvas" />
    </div>
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

  useEffect(() => {
    axios.get(`${API}/avatar`, { headers: authHeaders }).then(r => {
      const d = r.data;
      if (d.body_type) setConfig(d);
      setLoaded(true);
    }).catch(() => setLoaded(true));
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
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className={`flex gap-2 flex-wrap ${colorMode ? '' : ''}`}>
        {options.map(opt => {
          const sel = value === (opt.id || opt);
          const optId = opt.id || opt;
          const optLabel = opt.label || opt;
          return colorMode ? (
            <button key={optId} onClick={() => onChange(optId)}
              className="w-8 h-8 rounded-full transition-all"
              style={{ background: optId, border: sel ? '2px solid white' : '2px solid transparent', transform: sel ? 'scale(1.15)' : 'scale(1)' }}
              data-testid={`avatar-opt-${optId}`} />
          ) : (
            <button key={optId} onClick={() => onChange(optId)}
              className="px-3 py-1.5 rounded-lg text-xs transition-all"
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
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: config.aura_color }}>
            <Sparkles size={14} className="inline mr-2" /> Avatar Creator
          </p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Your Holographic Self
          </h1>
          <p className="text-sm mb-10" style={{ color: 'var(--text-secondary)' }}>
            Design your energy body avatar. This holographic form represents you in all guided meditations and yoga practices.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Preview */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <AvatarPreview config={config} />
            <button onClick={save} disabled={saving}
              className="w-full mt-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ background: `${config.aura_color}12`, color: config.aura_color, border: `1px solid ${config.aura_color}20` }}
              data-testid="save-avatar-btn">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Avatar'}
            </button>
          </div>

          {/* Controls */}
          <div className="flex-1">
            <OptionGroup label="Body Type" options={BODY_TYPES} value={config.body_type} onChange={v => update('body_type', v)} />
            <OptionGroup label="Aura Color" options={AURA_COLORS} value={config.aura_color} onChange={v => update('aura_color', v)} colorMode />
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--text-muted)' }}>Aura Intensity</p>
              <input type="range" min="0.2" max="1" step="0.1" value={config.aura_intensity}
                onChange={e => update('aura_intensity', parseFloat(e.target.value))}
                className="w-full accent-purple-400" data-testid="avatar-intensity-slider" />
            </div>
            <OptionGroup label="Pose" options={SILHOUETTES} value={config.silhouette} onChange={v => update('silhouette', v)} />
            <OptionGroup label="Robe Style" options={ROBE_STYLES} value={config.robe_style} onChange={v => update('robe_style', v)} />
            <OptionGroup label="Robe Color" options={ROBE_COLORS} value={config.robe_color} onChange={v => update('robe_color', v)} colorMode />
            <OptionGroup label="Glow Style" options={GLOW_STYLES} value={config.glow_style} onChange={v => update('glow_style', v)} />
            <OptionGroup label="Particle Density" options={PARTICLE_DENSITIES} value={config.particle_density} onChange={v => update('particle_density', v)} />
            <div className="mb-6">
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
