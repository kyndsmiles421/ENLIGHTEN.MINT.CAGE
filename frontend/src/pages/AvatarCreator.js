import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import { commit as busCommit } from '../state/ContextBus';
import { useResonance } from '../hooks/useResonance';
import {
  Save, Loader2, Sparkles, Activity, Zap, TrendingUp, ChevronRight,
  Heart, Wand2, Palette, Image, Layers, Star, Eye, Shield, Flame,
  Droplets, Wind, Sun, Moon, Crown, Diamond, Feather, CircleDot,
  ChevronDown, RotateCcw, Check, X
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

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

const AI_STYLES = [
  { id: 'ethereal', label: 'Ethereal', icon: Sparkles, color: '#D8B4FE', desc: 'Celestial being of light & cosmic energy' },
  { id: 'stylized', label: 'Stylized', icon: Palette, color: '#FDA4AF', desc: 'Vibrant anime-inspired cosmic character' },
  { id: 'realistic', label: 'Realistic', icon: Eye, color: '#2DD4BF', desc: 'Photorealistic portrait with mystical elements' },
  { id: 'abstract', label: 'Abstract', icon: Layers, color: '#FCD34D', desc: 'Pure energy form of sacred geometry' },
];

const ELEMENTS = [
  { id: 'fire', label: 'Fire', icon: Flame, color: '#EF4444' },
  { id: 'water', label: 'Water', icon: Droplets, color: '#3B82F6' },
  { id: 'air', label: 'Air', icon: Wind, color: '#06B6D4' },
  { id: 'earth', label: 'Earth', icon: Shield, color: '#22C55E' },
  { id: 'spirit', label: 'Spirit', icon: Star, color: '#C084FC' },
];

const SPIRIT_ANIMALS = [
  'Wolf', 'Eagle', 'Owl', 'Serpent', 'Dragon', 'Phoenix',
  'Deer', 'Bear', 'Hawk', 'Butterfly', 'Lion', 'Raven',
];

const SACRED_GEOMETRIES = [
  'Flower of Life', 'Metatrons Cube', 'Sri Yantra', 'Seed of Life',
  'Vesica Piscis', 'Torus', 'Merkaba', 'Golden Spiral',
];

const hexToRgb = (hex) => {
  const h = hex || '#D8B4FE';
  return { r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) };
};

/* ═══════════════════════════════════════════════
   CANVAS AVATAR PREVIEW (Manual Builder)
   ═══════════════════════════════════════════════ */

function AvatarPreview({ config, energyState }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const particlesRef = useRef([]);

  const bodyType = BODY_TYPES.find(b => b.id === config.body_type) || BODY_TYPES[1];
  const energyLevel = energyState?.current_energy ?? 0.5;
  const auraOverride = energyState?.aura_state || {};
  const chakraOverride = energyState?.dominant_chakra || {};
  const effectiveIntensity = config.aura_intensity * 0.4 + (auraOverride.intensity || 0.55) * 0.6;
  const baseDensity = PARTICLE_DENSITIES.find(p => p.id === config.particle_density) || PARTICLE_DENSITIES[1];
  const energyParticleScale = 0.5 + energyLevel * 1.0;
  const effectiveParticleCount = Math.round(baseDensity.count * energyParticleScale);
  const effectiveGlow = auraOverride.glow || config.glow_style;
  const effectiveChakraEmphasis = chakraOverride.index !== undefined ? String(chakraOverride.index) : config.chakra_emphasis;
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

    if (energyLevel > 0.4) {
      const pulseRadius = bodyW * (1.3 + Math.sin(t * 0.002) * 0.3);
      const pulseAlpha = (energyLevel - 0.4) * 0.15;
      ctx.strokeStyle = `rgba(${chakraRgb.r}, ${chakraRgb.g}, ${chakraRgb.b}, ${pulseAlpha * breathCycle})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, pulseRadius * 1.2, pulseRadius * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

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

    const headGrad = ctx.createRadialGradient(cx, headY, 0, cx, headY, headR * 1.8);
    headGrad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.15 * intensity})`);
    headGrad.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`);
    headGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = headGrad;
    ctx.beginPath(); ctx.arc(cx, headY, headR * 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.2 * intensity})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, headY, headR, 0, Math.PI * 2); ctx.stroke();

    const chakraColors = ['#EF4444', '#FB923C', '#FCD34D', '#22C55E', '#3B82F6', '#6366F1', '#C084FC'];
    for (let i = 0; i < 7; i++) {
      const py = headY + headR * 0.5 + (bodyH * 0.42) * (i / 6);
      const isDominant = effectiveChakraEmphasis === String(i);
      const isAll = effectiveChakraEmphasis === 'all';
      const active = isAll || isDominant;
      let cr = active ? 3 + Math.sin(t * 0.003 + i) * 1.5 : 1.5;
      let ca = active ? 0.5 + Math.sin(t * 0.004 + i * 0.7) * 0.3 : 0.15;
      if (isDominant) { cr *= 1 + energyLevel * 0.5; ca = Math.min(1, ca + energyLevel * 0.3); }
      const cc = chakraColors[i];
      const cr1 = parseInt(cc.slice(1, 3), 16), cg1 = parseInt(cc.slice(3, 5), 16), cb1 = parseInt(cc.slice(5, 7), 16);
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
    <div className="rounded-2xl overflow-hidden relative" style={{ width: '100%', maxWidth: 400, aspectRatio: '4/5', background: 'rgba(0,0,0,0)', border: `1px solid ${config.aura_color}20` }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} data-testid="avatar-preview-canvas" />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   AI GENERATION LOADING ANIMATION
   ═══════════════════════════════════════════════ */

function GenerationLoadingOverlay({ style: aiStyle }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const styleObj = AI_STYLES.find(s => s.id === aiStyle) || AI_STYLES[0];
  const rgb = hexToRgb(styleObj.color);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 400; canvas.height = 400;
    let t = 0;
    const particles = Array.from({ length: 120 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 50 + Math.random() * 120,
      speed: 0.005 + Math.random() * 0.015,
      size: 1 + Math.random() * 2.5,
      opacity: 0.2 + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 0.3,
    }));

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 5, 12, 0.08)';
      ctx.fillRect(0, 0, 400, 400);
      const cx = 200, cy = 200;

      // Rotating sacred geometry
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.002);
      const sides = 6;
      for (let ring = 0; ring < 3; ring++) {
        const r = 60 + ring * 35;
        const a = 0.06 - ring * 0.015;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a + Math.sin(t * 0.003 + ring) * 0.03})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const angle = (i / sides) * Math.PI * 2;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();

      // Converging particles
      for (const p of particles) {
        p.angle += p.speed;
        const converge = 0.5 + Math.sin(t * 0.003) * 0.3;
        const r = p.radius * converge;
        const px = cx + Math.cos(p.angle) * r;
        const py = cy + Math.sin(p.angle) * r + p.drift * Math.sin(t * 0.005);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.opacity * (0.5 + Math.sin(t * 0.004 + p.angle) * 0.5)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central glow pulse
      const pulseR = 30 + Math.sin(t * 0.004) * 15;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
      grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx.fill();

      t += 16;
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [rgb]);

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ width: '100%', maxWidth: 400, aspectRatio: '1', background: 'rgba(0,0,0,0)', border: `1px solid ${styleObj.color}20` }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full"
          style={{ border: `2px solid ${styleObj.color}30`, borderTopColor: styleObj.color }}
        />
        <p className="text-sm font-light tracking-widest" style={{ color: styleObj.color, fontFamily: 'Cormorant Garamond, serif' }}>
          Manifesting your being...
        </p>
        <motion.div
          className="flex gap-1"
          initial="hidden"
          animate="visible"
        >
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: styleObj.color }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   AI AVATAR GALLERY CARD
   ═══════════════════════════════════════════════ */

function AvatarGalleryCard({ avatar, isActive, onSetActive }) {
  const styleObj = AI_STYLES.find(s => s.id === avatar.style) || AI_STYLES[0];

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative rounded-xl overflow-hidden cursor-pointer group"
      style={{
        border: isActive ? `2px solid ${styleObj.color}` : '2px solid rgba(255,255,255,0.06)',
        boxShadow: isActive ? `0 0 24px ${styleObj.color}20` : 'none',
      }}
      onClick={() => !isActive && onSetActive(avatar.created_at)}
      data-testid={`avatar-gallery-card-${avatar.created_at}`}
    >
      <img
        src={`data:image/png;base64,${avatar.image_b64}`}
        alt={avatar.description}
        className="w-full aspect-square object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <p className="text-[10px] line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{avatar.description}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: styleObj.color }} />
          <span className="text-[9px] uppercase tracking-widest" style={{ color: styleObj.color }}>{avatar.style}</span>
        </div>
      </div>
      {isActive && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"
          style={{ background: `${styleObj.color}20`, color: styleObj.color, border: `1px solid ${styleObj.color}40` }}>
          <Check size={10} /> Active
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   ENERGY METER (same as before)
   ═══════════════════════════════════════════════ */

function EnergyMeter({ energy, chakra, mood }) {
  const pct = Math.round(energy * 100);
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
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${barColor}40, ${barColor})`, boxShadow: `0 0 12px ${barColor}40` }} />
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

/* ═══════════════════════════════════════════════
   MAIN AVATAR CREATOR PAGE
   ═══════════════════════════════════════════════ */

export default function AvatarCreator() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('avatar_creation', 8); }, []);

  const { authHeaders } = useAuth();
  const { refreshAvatar } = useAvatar();
  const avatarResonance = useResonance();

  // Tabs
  const [activeTab, setActiveTab] = useState('ai');

  // Manual builder state
  const [config, setConfig] = useState({
    body_type: 'balanced', aura_color: '#D8B4FE', aura_intensity: 0.6,
    silhouette: 'default', robe_style: 'flowing', robe_color: '#1E1B4B',
    chakra_emphasis: 'all', particle_density: 'medium', glow_style: 'soft', energy_trails: true,
  });

  // AI generator state
  const [aiDescription, setAiDescription] = useState('');
  const [aiStyle, setAiStyle] = useState('ethereal');
  const [aiElement, setAiElement] = useState('');
  const [aiSpiritAnimal, setAiSpiritAnimal] = useState('');
  const [aiSacredGeometry, setAiSacredGeometry] = useState('');
  const [aiAuraColor, setAiAuraColor] = useState('#D8B4FE');
  const [showExtras, setShowExtras] = useState(false);

  // Shared state
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [energyState, setEnergyState] = useState(null);
  const [generatedAvatar, setGeneratedAvatar] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [activeAvatarTimestamp, setActiveAvatarTimestamp] = useState(null);

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const [avatarRes, energyRes, galleryRes, activeRes] = await Promise.allSettled([
          axios.get(`${API}/avatar`, { headers: authHeaders }),
          axios.get(`${API}/avatar/energy-state`, { headers: authHeaders }),
          axios.get(`${API}/ai-visuals/my-avatars`, { headers: authHeaders }),
          axios.get(`${API}/ai-visuals/my-avatar`, { headers: authHeaders }),
        ]);
        if (avatarRes.status === 'fulfilled' && avatarRes.value.data.body_type) setConfig(avatarRes.value.data);
        if (energyRes.status === 'fulfilled') setEnergyState(energyRes.value.data);
        if (galleryRes.status === 'fulfilled') setGallery(galleryRes.value.data.avatars || []);
        if (activeRes.status === 'fulfilled' && activeRes.value.data.status === 'active') {
          setActiveAvatarTimestamp(activeRes.value.data.created_at);
          setGeneratedAvatar(activeRes.value.data);
        }
      } catch {}
      setLoaded(true);
    };
    load();
  }, [authHeaders]);

  const update = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  const saveManual = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/avatar`, config, { headers: authHeaders });
      toast.success('Avatar saved!');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const generateAIAvatar = async () => {
    if (!aiDescription.trim()) { toast.error('Describe your cosmic being first'); return; }
    setGenerating(true);
    setGeneratedAvatar(null);
    
    // HARD TIMEOUT GUARD: 30 seconds max — fail gracefully, don't freeze
    const HARD_TIMEOUT = 30000;
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('TIMEOUT: Manifestation taking too long. The cosmos needs a moment.'));
      }, HARD_TIMEOUT);
    });
    
    try {
      const extras = {};
      if (aiElement) extras.element = aiElement;
      if (aiSpiritAnimal) extras.spirit_animal = aiSpiritAnimal;
      if (aiSacredGeometry) extras.sacred_geometry = aiSacredGeometry;
      if (aiAuraColor) extras.aura_color = aiAuraColor;

      // Race between actual request and timeout
      const res = await Promise.race([
        axios.post(`${API}/ai-visuals/generate-avatar`, {
          description: aiDescription,
          style: aiStyle,
          extras,
        }, { headers: authHeaders, timeout: 30000 }),
        timeoutPromise
      ]);
      
      clearTimeout(timeoutId);

      setGeneratedAvatar(res.data);
      toast.success('Your cosmic avatar has manifested!');

      // V68.51 — Commit entity to ContextBus + paint the field.
      // Story / Forecast / Dream tools now inherit this avatar's
      // archetype as their "current sovereign entity" automatically.
      try {
        const entity = {
          description: aiDescription,
          style: aiStyle,
          element: aiElement || null,
          spirit_animal: aiSpiritAnimal || null,
          sacred_geometry: aiSacredGeometry || null,
          aura_color: aiAuraColor || null,
          created_at: res.data?.created_at || Date.now(),
        };
        busCommit('entityState', entity, { moduleId: 'AVATAR_GEN' });
        avatarResonance.triggerPulse(aiDescription, 'AVATAR_GEN');
      } catch { /* noop */ }

      // Refresh gallery and global avatar
      const galleryRes = await axios.get(`${API}/ai-visuals/my-avatars`, { headers: authHeaders });
      const avatars = galleryRes.data.avatars || [];
      setGallery(avatars);
      if (avatars.length > 0) setActiveAvatarTimestamp(avatars[0].created_at);
      refreshAvatar();
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = err.message?.includes('TIMEOUT') 
        ? err.message 
        : (err.response?.data?.detail || 'Generation failed. The cosmos needs a moment.');
      toast.error(msg);
      console.error('[AvatarCreator] Generation error:', err);
    } finally {
      // ALWAYS reset generating state — even if everything crashes
      setGenerating(false);
    }
  };

  const setActiveAvatar = async (createdAt) => {
    try {
      await axios.post(`${API}/ai-visuals/set-active-avatar`, { created_at: createdAt }, { headers: authHeaders });
      setActiveAvatarTimestamp(createdAt);
      const match = gallery.find(a => a.created_at === createdAt);
      if (match) setGeneratedAvatar(match);
      toast.success('Avatar activated!');
      refreshAvatar();
    } catch { toast.error('Failed to set avatar'); }
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

  const selectedAiStyle = AI_STYLES.find(s => s.id === aiStyle) || AI_STYLES[0];

  return (
    <div className="min-h-screen px-4 md:px-12 lg:px-24 py-12" data-testid="avatar-creator-page">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#C084FC' }}>
            <Sparkles size={14} className="inline mr-2" /> Avatar Creator
          </p>
          <h1 className="text-3xl md:text-3xl font-light tracking-tight mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Your Cosmic Identity
          </h1>
          <p className="text-sm mb-8 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            Forge the entity that represents your journey through the cosmos. Choose to manifest your being with AI or craft it by hand.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8"
          data-testid="avatar-mode-tabs"
        >
          {[
            { id: 'ai', label: 'AI Manifestation', icon: Wand2, desc: 'Generate with AI' },
            { id: 'manual', label: 'Energy Builder', icon: Palette, desc: 'Craft by hand' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300"
              style={{
                background: activeTab === tab.id ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${activeTab === tab.id ? 'rgba(192,132,252,0.25)' : 'rgba(255,255,255,0.06)'}`,
                color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
                boxShadow: activeTab === tab.id ? '0 0 30px rgba(192,132,252,0.08)' : 'none',
              }}
              data-testid={`avatar-tab-${tab.id}`}
            >
              <tab.icon size={16} style={activeTab === tab.id ? { color: '#C084FC' } : {}} />
              <div className="text-left">
                <span className="text-sm font-medium block">{tab.label}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{tab.desc}</span>
              </div>
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ═══ AI GENERATION TAB ═══ */}
          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              data-testid="avatar-ai-tab"
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Preview / Result */}
                <div className="flex-shrink-0 mx-auto lg:mx-0" style={{ width: 400, maxWidth: '100%' }}>
                  {generating ? (
                    <GenerationLoadingOverlay style={aiStyle} />
                  ) : generatedAvatar?.image_b64 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="relative rounded-2xl overflow-hidden group"
                      style={{ width: '100%', maxWidth: 400, border: `1px solid ${selectedAiStyle.color}25` }}
                      data-testid="ai-avatar-result"
                    >
                      <img
                        src={`data:image/png;base64,${generatedAvatar.image_b64}`}
                        alt="Your cosmic avatar"
                        className="w-full aspect-square object-cover"
                      />
                      {/* Glow border effect */}
                      <div className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{ boxShadow: `inset 0 0 40px ${selectedAiStyle.color}15, 0 0 60px ${selectedAiStyle.color}10` }} />
                      {/* Active badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                        style={{ background: 'rgba(0,0,0,0)', backdropFilter: 'none', color: selectedAiStyle.color, border: `1px solid ${selectedAiStyle.color}30` }}>
                        <Check size={10} /> Active Avatar
                      </div>
                    </motion.div>
                  ) : (
                    /* Empty state */
                    <div className="rounded-2xl flex flex-col items-center justify-center gap-4 aspect-square" data-testid="ai-avatar-empty"
                      style={{ width: '100%', maxWidth: 400, background: 'rgba(0,0,0,0)', border: '1px dashed rgba(192,132,252,0.15)' }}>
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                      >
                        <Wand2 size={40} style={{ color: 'rgba(192,132,252,0.2)' }} />
                      </motion.div>
                      <p className="text-sm text-center px-8" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}>
                        Describe the cosmic entity you wish to become and watch it manifest
                      </p>
                    </div>
                  )}

                  {/* Energy State Panel (compact) */}
                  {energyState && (
                    <div className="mt-4">
                      <EnergyMeter energy={energyState.current_energy} chakra={energyState.dominant_chakra} mood={energyState.current_mood} />
                    </div>
                  )}
                </div>

                {/* Right: AI Controls */}
                <div className="flex-1 min-w-0">
                  {/* Description Input */}
                  <div className="mb-6">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 block" style={{ color: 'var(--text-muted)' }}>
                      Describe Your Being
                    </label>
                    <textarea
                      value={aiDescription}
                      onChange={e => setAiDescription(e.target.value)}
                      placeholder="A luminous guardian of the astral plane, with wings of stardust and eyes that hold the light of dying stars..."
                      rows={4}
                      className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none transition-all duration-300"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-primary)',
                      }}
                      data-testid="ai-avatar-description"
                    />
                    <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                      Be vivid. The more detail you provide, the more unique your manifestation.
                    </p>
                  </div>

                  {/* Style Selector */}
                  <div className="mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--text-muted)' }}>
                      Manifestation Style
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {AI_STYLES.map(style => {
                        const Icon = style.icon;
                        const sel = aiStyle === style.id;
                        return (
                          <motion.button
                            key={style.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setAiStyle(style.id)}
                            className="flex items-start gap-3 p-3.5 rounded-xl text-left transition-all duration-300"
                            style={{
                              background: sel ? `${style.color}08` : 'rgba(255,255,255,0.015)',
                              border: `1px solid ${sel ? `${style.color}30` : 'rgba(255,255,255,0.05)'}`,
                              boxShadow: sel ? `0 0 20px ${style.color}08` : 'none',
                            }}
                            data-testid={`ai-style-${style.id}`}
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: sel ? `${style.color}15` : 'rgba(255,255,255,0.03)' }}>
                              <Icon size={16} style={{ color: sel ? style.color : 'var(--text-muted)' }} />
                            </div>
                            <div>
                              <span className="text-xs font-medium block" style={{ color: sel ? style.color : 'var(--text-secondary)' }}>
                                {style.label}
                              </span>
                              <span className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                {style.desc}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Extras Toggle */}
                  <button
                    onClick={() => setShowExtras(!showExtras)}
                    className="flex items-center gap-2 mb-4 text-xs transition-all"
                    style={{ color: 'var(--text-secondary)' }}
                    data-testid="ai-extras-toggle"
                  >
                    <Diamond size={12} style={{ color: '#C084FC' }} />
                    <span>Advanced Options</span>
                    <ChevronDown size={12} style={{ transform: showExtras ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
                  </button>

                  <AnimatePresence>
                    {showExtras && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mb-6"
                      >
                        {/* Element */}
                        <div className="mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5" style={{ color: 'var(--text-muted)' }}>
                            Elemental Affinity
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {ELEMENTS.map(el => {
                              const Icon = el.icon;
                              const sel = aiElement === el.id;
                              return (
                                <button key={el.id}
                                  onClick={() => setAiElement(sel ? '' : el.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all"
                                  style={{
                                    background: sel ? `${el.color}12` : 'rgba(255,255,255,0.02)',
                                    color: sel ? el.color : 'var(--text-muted)',
                                    border: `1px solid ${sel ? `${el.color}20` : 'rgba(255,255,255,0.06)'}`,
                                  }}
                                  data-testid={`ai-element-${el.id}`}
                                >
                                  <Icon size={12} /> {el.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Spirit Animal */}
                        <div className="mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5" style={{ color: 'var(--text-muted)' }}>
                            Spirit Animal Guardian
                          </p>
                          <div className="flex gap-1.5 flex-wrap">
                            {SPIRIT_ANIMALS.map(animal => {
                              const sel = aiSpiritAnimal === animal;
                              return (
                                <button key={animal}
                                  onClick={() => setAiSpiritAnimal(sel ? '' : animal)}
                                  className="px-2.5 py-1 rounded-lg text-[10px] transition-all"
                                  style={{
                                    background: sel ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.02)',
                                    color: sel ? '#C084FC' : 'var(--text-muted)',
                                    border: `1px solid ${sel ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.06)'}`,
                                  }}
                                  data-testid={`ai-animal-${animal}`}
                                >
                                  {animal}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Sacred Geometry */}
                        <div className="mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5" style={{ color: 'var(--text-muted)' }}>
                            Sacred Geometry
                          </p>
                          <div className="flex gap-1.5 flex-wrap">
                            {SACRED_GEOMETRIES.map(geo => {
                              const sel = aiSacredGeometry === geo;
                              return (
                                <button key={geo}
                                  onClick={() => setAiSacredGeometry(sel ? '' : geo)}
                                  className="px-2.5 py-1 rounded-lg text-[10px] transition-all"
                                  style={{
                                    background: sel ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.02)',
                                    color: sel ? '#C084FC' : 'var(--text-muted)',
                                    border: `1px solid ${sel ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.06)'}`,
                                  }}
                                  data-testid={`ai-geometry-${geo}`}
                                >
                                  {geo}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Aura Color for AI */}
                        <div className="mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5" style={{ color: 'var(--text-muted)' }}>
                            Aura Color
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {AURA_COLORS.map(color => (
                              <button key={color}
                                onClick={() => setAiAuraColor(color)}
                                className="w-7 h-7 rounded-full transition-all"
                                style={{ background: color, border: aiAuraColor === color ? '2px solid white' : '2px solid transparent', transform: aiAuraColor === color ? 'scale(1.15)' : 'scale(1)' }}
                                data-testid={`ai-aura-color-${color}`} />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Generate Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      if (!aiDescription.trim()) {
                        toast.error('Type a description above first — describe the cosmic being you want to create');
                        const el = document.querySelector('[data-testid="ai-avatar-description"]');
                        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus(); }
                        return;
                      }
                      generateAIAvatar();
                    }}
                    disabled={generating}
                    className="w-full py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-3 transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${selectedAiStyle.color}15, ${selectedAiStyle.color}08)`,
                      border: `1px solid ${selectedAiStyle.color}25`,
                      color: selectedAiStyle.color,
                      opacity: generating ? 0.4 : aiDescription.trim() ? 1 : 0.6,
                      boxShadow: !generating && aiDescription.trim() ? `0 0 30px ${selectedAiStyle.color}10` : 'none',
                    }}
                    data-testid="ai-generate-btn"
                  >
                    {generating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Manifesting...
                      </>
                    ) : (
                      <>
                        <Wand2 size={16} />
                        Manifest Avatar
                      </>
                    )}
                  </motion.button>

                  {generatedAvatar?.image_b64 && !generating && (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => { setGeneratedAvatar(null); setAiDescription(''); }}
                      className="w-full mt-3 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                      style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}
                      data-testid="ai-regenerate-btn"
                    >
                      <RotateCcw size={12} /> Start Fresh
                    </motion.button>
                  )}

                  {/* Gallery */}
                  {gallery.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-8"
                      data-testid="avatar-gallery"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <Image size={12} /> Your Manifestations ({gallery.length})
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {gallery.map((av, i) => (
                          <AvatarGalleryCard
                            key={av.created_at || i}
                            avatar={av}
                            isActive={av.created_at === activeAvatarTimestamp}
                            onSetActive={setActiveAvatar}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ MANUAL BUILDER TAB ═══ */}
          {activeTab === 'manual' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              data-testid="avatar-manual-tab"
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Avatar Preview */}
                <div className="flex-shrink-0 mx-auto lg:mx-0" style={{ width: 400, maxWidth: '100%' }}>
                  <AvatarPreview config={config} energyState={energyState} />
                  {energyState && (
                    <div className="mt-4">
                      <EnergyMeter energy={energyState.current_energy} chakra={energyState.dominant_chakra} mood={energyState.current_mood} />
                    </div>
                  )}
                  <button onClick={saveManual} disabled={saving}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
