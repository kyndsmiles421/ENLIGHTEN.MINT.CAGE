import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import {
  ArrowLeft, Sparkles, Star, Shield, Heart, Eye, Flame,
  ChevronRight, Loader2, Trophy, Zap, Swords,
  Brain, ChevronDown, Globe, Package, User, Gem
} from 'lucide-react';
import { InventoryPanel, AvatarGenerator, AvatarBadge } from '../components/StarseedInventory';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STAT_CONFIG = {
  wisdom:     { icon: Brain,   color: '#A855F7', label: 'WIS' },
  courage:    { icon: Swords,  color: '#EF4444', label: 'CRG' },
  compassion: { icon: Heart,   color: '#EC4899', label: 'CMP' },
  intuition:  { icon: Eye,     color: '#38BDF8', label: 'INT' },
  resilience: { icon: Shield,  color: '#F59E0B', label: 'RES' },
};

const ATMOSPHERE_THEMES = {
  mystical:   { glow: '#818CF8', overlay: 'rgba(60,40,120,0.4)' },
  tense:      { glow: '#EF4444', overlay: 'rgba(100,20,20,0.4)' },
  peaceful:   { glow: '#2DD4BF', overlay: 'rgba(20,80,80,0.4)' },
  epic:       { glow: '#F59E0B', overlay: 'rgba(100,70,10,0.4)' },
  dark:       { glow: '#DC2626', overlay: 'rgba(40,10,10,0.5)' },
  ethereal:   { glow: '#C084FC', overlay: 'rgba(70,30,100,0.4)' },
  triumphant: { glow: '#FCD34D', overlay: 'rgba(90,80,20,0.35)' },
};

/* ─── Cosmic Canvas Background ─── */
function CosmicCanvas({ originColor, atmosphere, active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const { reduceParticles } = useSensory();

  useEffect(() => {
    if (reduceParticles || !active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
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

      // Nebula clouds
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

      // Stars with twinkle
      stars.forEach(s => {
        const opacity = 0.3 + Math.sin(time * s.twinkleSpeed + s.phase) * 0.4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, opacity)})`;
        ctx.fill();
      });

      // Shooting stars
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
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.7 }} />;
}

/* ─── Stat Bar ─── */
function StatBar({ statKey, value, prevValue, maxVal = 15, compact }) {
  const cfg = STAT_CONFIG[statKey];
  if (!cfg) return null;
  const Icon = cfg.icon;
  const pct = Math.min(100, (value / maxVal) * 100);
  const delta = (prevValue !== undefined && prevValue !== null) ? value - prevValue : 0;

  return (
    <div className={`flex items-center gap-1.5 ${compact ? '' : 'mb-1.5'}`} data-testid={`stat-${statKey}`}>
      <Icon size={compact ? 10 : 13} style={{ color: cfg.color, flexShrink: 0 }} />
      <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: cfg.color, minWidth: 22 }}>{cfg.label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`, boxShadow: `0 0 10px ${cfg.color}40` }} />
      </div>
      <span className="text-[10px] tabular-nums w-4 text-right" style={{ color: cfg.color }}>{value}</span>
      {delta !== 0 && (
        <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="text-[9px] font-bold"
          style={{ color: delta > 0 ? '#4ADE80' : '#EF4444' }}>
          {delta > 0 ? `+${delta}` : delta}
        </motion.span>
      )}
    </div>
  );
}

/* ─── XP Bar ─── */
function XPBar({ xp, xpToNext, level }) {
  const pct = xpToNext > 0 ? (xp / xpToNext) * 100 : 0;
  return (
    <div className="flex items-center gap-2.5" data-testid="xp-bar">
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.15)' }}>
        <Star size={10} style={{ color: '#FCD34D' }} />
        <span className="text-[10px] font-bold tabular-nums" style={{ color: '#FCD34D' }}>LVL {level}</span>
      </div>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
          style={{ background: 'linear-gradient(90deg, #FCD34D, #F59E0B)', boxShadow: '0 0 12px rgba(252,211,77,0.3)' }} />
      </div>
      <span className="text-[9px] tabular-nums font-medium" style={{ color: 'rgba(252,211,77,0.7)' }}>{xp}/{xpToNext}</span>
    </div>
  );
}

/* ─── Character Select ─── */
function CharacterSelect({ origins, existingCharacters, onSelect, onResume, loading, authHeaders }) {
  const [selected, setSelected] = useState(null);
  const [charName, setCharName] = useState('');
  const [expandedChar, setExpandedChar] = useState(null);
  const { reduceMotion } = useSensory();

  return (
    <div data-testid="character-select" className="relative z-10">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.8 }}
        className="text-center mb-12">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block mb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.15) 0%, rgba(129,140,248,0.05) 70%)', border: '1px solid rgba(192,132,252,0.2)' }}>
            <Sparkles size={32} style={{ color: '#C084FC' }} />
          </div>
        </motion.div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#C084FC' }}>
          Choose Your Cosmic Origin
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-4"
          style={{ fontFamily: 'Cormorant Garamond, serif', background: 'linear-gradient(135deg, #E0E7FF, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Starseed Adventure
        </h1>
        <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          An AI-powered cosmic RPG. Select your starseed origin and embark on a branching journey through the stars. Every choice shapes your destiny.
        </p>
        {existingCharacters.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              onClick={() => window.location.href = '/starseed-realm'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
              data-testid="enter-realm-btn">
              <Globe size={13} /> Cosmic Realm
              <ChevronRight size={11} className="opacity-60" />
            </motion.button>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              onClick={() => window.location.href = '/starseed-worlds'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: '#38BDF8' }}
              data-testid="enter-multiverse-btn">
              <Star size={13} /> Multiverse
              <ChevronRight size={11} className="opacity-60" />
            </motion.button>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              onClick={() => window.location.href = '/spiritual-avatar'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', color: '#EC4899' }}
              data-testid="avatar-creator-btn">
              <User size={13} /> Avatar Creator
              <ChevronRight size={11} className="opacity-60" />
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Continue existing adventures */}
      {existingCharacters.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-3 flex items-center gap-2" style={{ color: '#FCD34D' }}>
            <Flame size={11} /> Continue Your Journey
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {existingCharacters.map((ch, i) => {
              const origin = origins.find(o => o.id === ch.origin_id);
              if (!origin) return null;
              const isExpanded = expandedChar === ch.origin_id;
              return (
                <motion.div key={ch.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.06 }}
                  className="relative overflow-hidden rounded-2xl border transition-all"
                  style={{ background: `linear-gradient(135deg, ${origin.color}08, rgba(0,0,0,0.3))`, borderColor: `${origin.color}20` }}>
                  <button
                    onClick={() => setExpandedChar(isExpanded ? null : ch.origin_id)}
                    className="w-full p-4 text-left flex items-center gap-3"
                    data-testid={`continue-${ch.origin_id}`}>
                    <AvatarBadge originId={ch.origin_id} authHeaders={authHeaders} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: origin.color }}>{ch.character_name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{origin.name} &middot; {origin.star_system}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(252,211,77,0.08)', color: '#FCD34D' }}>
                          Lvl {ch.level}
                        </span>
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Ch.{ch.chapter} &middot; Scene {ch.scene}</span>
                        {(ch.inventory?.length || 0) > 0 && (
                          <span className="text-[9px] flex items-center gap-0.5" style={{ color: '#A855F7' }}>
                            <Package size={8} /> {ch.inventory.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); onResume(ch.origin_id); }}
                        className="text-[9px] px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                        style={{ background: `${origin.color}15`, color: origin.color, border: `1px solid ${origin.color}25` }}>
                        Play
                      </button>
                      <ChevronDown size={14} style={{ color: origin.color, opacity: 0.5, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-4" style={{ borderTop: `1px solid ${origin.color}10` }}>
                          <div className="pt-3">
                            <AvatarGenerator originId={ch.origin_id} authHeaders={authHeaders} />
                          </div>
                          <InventoryPanel originId={ch.origin_id} authHeaders={authHeaders} compact />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Origin Grid */}
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <Star size={10} /> {existingCharacters.length > 0 ? 'Begin New Adventure' : 'Select Your Starseed Origin'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {origins.map((origin, i) => {
            const isSelected = selected?.id === origin.id;
            return (
              <motion.button key={origin.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
                onClick={() => setSelected(isSelected ? null : origin)}
                className="relative overflow-hidden rounded-2xl p-5 text-left transition-all hover:scale-[1.02] border"
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${origin.color}15, rgba(0,0,0,0.4))`
                    : 'rgba(255,255,255,0.02)',
                  borderColor: isSelected ? `${origin.color}40` : 'rgba(255,255,255,0.05)',
                  boxShadow: isSelected ? `0 0 40px ${origin.color}10, inset 0 0 30px ${origin.color}05` : 'none',
                }}
                data-testid={`origin-${origin.id}`}>
                {/* Glow */}
                <div className="absolute inset-0 opacity-[0.05]"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${origin.color}, transparent 70%)` }} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: `${origin.color}12`, border: `1px solid ${origin.color}20` }}>
                      <Star size={20} style={{ color: origin.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: origin.color }}>{origin.name}</p>
                      <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{origin.star_system}</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{origin.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {origin.traits.map(t => (
                      <span key={t} className="text-[8px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${origin.color}10`, color: origin.color, border: `1px solid ${origin.color}15` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Flame size={9} style={{ color: origin.color, opacity: 0.5 }} />
                    <span className="text-[8px]" style={{ color: `${origin.color}80` }}>Element: {origin.element}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Origin Detail + Start */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden">
            <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-6 border"
              style={{ background: `linear-gradient(135deg, ${selected.color}08, rgba(0,0,0,0.3))`, borderColor: `${selected.color}20` }}
              data-testid="origin-detail-panel">
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ background: `radial-gradient(ellipse at 20% 30%, ${selected.color}, transparent 60%)` }} />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: selected.color }}>
                  {selected.name} Lore
                </p>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)', fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', lineHeight: '1.8' }}>
                  {selected.lore}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" placeholder="Name your character..." maxLength={24}
                    value={charName} onChange={e => setCharName(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl text-sm transition-all focus:ring-2"
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: `1px solid ${selected.color}20`,
                      color: 'var(--text-primary)', outline: 'none',
                      focusRingColor: selected.color,
                    }}
                    data-testid="character-name-input" />
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={() => !loading && onSelect(selected.id, charName || 'Traveler')}
                    disabled={loading}
                    className="px-8 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 justify-center transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${selected.gradient[0]}, ${selected.gradient[1]})`,
                      color: '#fff',
                      boxShadow: `0 4px 20px ${selected.color}30`,
                      opacity: loading ? 0.6 : 1,
                    }}
                    data-testid="start-adventure-btn">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {loading ? 'Channeling...' : 'Begin Adventure'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Scene Image with Loading ─── */
function SceneImage({ imageUrl, loading, atmosphere, originColor }) {
  const theme = ATMOSPHERE_THEMES[atmosphere] || ATMOSPHERE_THEMES.mystical;

  return (
    <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-6" data-testid="scene-image"
      style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${originColor}15` }}>
      {/* Atmospheric overlay */}
      <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(180deg, transparent 30%, ${theme.overlay} 100%)` }} />

      {imageUrl ? (
        <motion.img key={imageUrl} src={imageUrl} alt="Scene" className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }}
          style={{ filter: 'brightness(0.8) contrast(1.1)' }} />
      ) : (
        <div className="w-full h-full flex items-center justify-center"
          style={{ background: `radial-gradient(ellipse at 50% 50%, ${originColor}15, rgba(0,0,0,0.5))` }}>
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <Sparkles size={24} style={{ color: originColor }} />
            </motion.div>
          ) : (
            <Star size={28} style={{ color: originColor, opacity: 0.3 }} />
          )}
        </div>
      )}

      {/* Corner glow */}
      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${theme.glow}20, transparent 70%)` }} />
    </div>
  );
}

/* ─── Game Scene (Cinematic) ─── */
function GameScene({ scene, character, origin, onChoice, loading, onBack, sceneImage, imageLoading }) {
  const { reduceParticles, reduceMotion } = useSensory();
  const [revealed, setRevealed] = useState(false);
  const [choiceHover, setChoiceHover] = useState(null);
  const [prevStats, setPrevStats] = useState(null);
  const theme = ATMOSPHERE_THEMES[scene?.atmosphere] || ATMOSPHERE_THEMES.mystical;

  useEffect(() => {
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), reduceMotion ? 0 : 800);
    return () => clearTimeout(t);
  }, [scene?.narrative, reduceMotion]);

  useEffect(() => {
    if (character?.stats) {
      const t = setTimeout(() => setPrevStats({ ...character.stats }), 2000);
      return () => clearTimeout(t);
    }
  }, [character?.stats]);

  if (!scene) return null;

  const stats = character?.stats || {};

  return (
    <div className="relative z-10" data-testid="game-scene">
      {/* Top Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs transition-all hover:gap-2.5 group"
          style={{ color: 'var(--text-muted)' }} data-testid="scene-back-btn">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Exit
        </button>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={{ background: `${origin.color}10`, color: origin.color, border: `1px solid ${origin.color}20` }}>
            {origin.name}
          </div>
          <div className="px-3 py-1 rounded-full text-[10px] font-medium"
            style={{ background: `${theme.glow}10`, color: theme.glow, border: `1px solid ${theme.glow}20` }}>
            Ch.{character.chapter} &middot; Scene {character.scene_num}
          </div>
        </div>
      </motion.div>

      {/* XP Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-4">
        <XPBar xp={character.xp} xpToNext={character.xp_to_next} level={character.level} />
      </motion.div>

      {/* Stats Row */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-5 gap-1 mb-5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        {Object.entries(stats).map(([key, val]) => (
          <StatBar key={key} statKey={key} value={val} prevValue={prevStats?.[key]} compact />
        ))}
      </motion.div>

      {/* Scene Image */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SceneImage imageUrl={sceneImage} loading={imageLoading} atmosphere={scene.atmosphere} originColor={origin.color} />
      </motion.div>

      {/* Scene Title */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: revealed ? 1 : 0 }} transition={{ duration: 0.6 }}
        className="text-center mb-3">
        <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: theme.glow }}>
          {scene.scene_title}
        </p>
      </motion.div>

      {/* Narrative */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: revealed ? 1 : 0.15, y: 0 }}
        transition={{ duration: 1 }}
        className="relative rounded-2xl p-6 md:p-8 mb-8 overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${theme.glow}12`, backdropFilter: 'blur(12px)' }}
        data-testid="scene-narrative">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${theme.glow}10, transparent)` }} />
        <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${origin.color}08, transparent)` }} />
        <div className="relative">
          <p className="text-base md:text-lg leading-loose" style={{
            fontFamily: 'Cormorant Garamond, serif',
            color: 'var(--text-primary)',
            fontSize: '18px',
            lineHeight: '2',
          }}>
            {scene.narrative}
          </p>
        </div>
      </motion.div>

      {/* Choices */}
      <AnimatePresence>
        {revealed && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="space-y-3 mb-8" data-testid="scene-choices">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${theme.glow}30, transparent)` }} />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] px-3" style={{ color: theme.glow }}>
                What do you do?
              </p>
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${theme.glow}30, transparent)` }} />
            </div>
            {scene.choices?.map((choice, i) => {
              const statKey = Object.keys(choice.stat_effect || {})[0];
              const statCfg = STAT_CONFIG[statKey];
              const statDelta = choice.stat_effect?.[statKey] || 0;
              const isHovered = choiceHover === i;
              const isResonance = !!(choice.resonance_element || (choice.text && choice.text.includes('(Resonance)')));

              return (
                <motion.button key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.12 }}
                  onClick={() => !loading && onChoice(i)}
                  onMouseEnter={() => setChoiceHover(i)}
                  onMouseLeave={() => setChoiceHover(null)}
                  disabled={loading}
                  className="w-full relative overflow-hidden rounded-xl p-4 md:p-5 text-left transition-all group border"
                  style={{
                    background: isResonance
                      ? `linear-gradient(135deg, rgba(192,132,252,0.06), rgba(0,0,0,0.3))`
                      : isHovered
                        ? `linear-gradient(135deg, ${statCfg?.color || theme.glow}10, rgba(0,0,0,0.3))`
                        : 'rgba(255,255,255,0.02)',
                    borderColor: isResonance ? 'rgba(192,132,252,0.2)' : isHovered ? `${statCfg?.color || theme.glow}30` : 'rgba(255,255,255,0.05)',
                    transform: isHovered ? 'scale(1.01)' : 'scale(1)',
                    boxShadow: isResonance ? '0 0 20px rgba(192,132,252,0.06)' : isHovered ? `0 0 25px ${statCfg?.color || theme.glow}10` : 'none',
                  }}
                  data-testid={`choice-${i}`}>
                  {/* Resonance shimmer */}
                  {isResonance && (
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(192,132,252,0.15), transparent)', width: '40%' }} />
                  )}
                  {/* Glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `radial-gradient(ellipse at 0% 50%, ${statCfg?.color || '#fff'}08, transparent 60%)` }} />
                  <div className="relative flex items-start gap-4">
                    {/* Letter badge */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: isResonance ? 'rgba(192,132,252,0.12)' : isHovered ? `${statCfg?.color || '#fff'}15` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isResonance ? 'rgba(192,132,252,0.3)' : isHovered ? (statCfg?.color || '#fff') + '30' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      {isResonance ? (
                        <Gem size={14} style={{ color: '#C084FC' }} />
                      ) : (
                        <span className="text-sm font-bold" style={{ color: statCfg?.color || '#fff' }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1.5 leading-relaxed" style={{ color: isResonance ? '#D8C5F5' : 'var(--text-primary)' }}>
                        {choice.text}
                      </p>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {isResonance && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"
                            style={{ background: 'rgba(192,132,252,0.1)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.15)' }}>
                            <Gem size={8} /> Gem Resonance
                          </span>
                        )}
                        {statCfg && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"
                            style={{ background: `${statCfg.color}12`, color: statCfg.color, border: `1px solid ${statCfg.color}15` }}>
                            {React.createElement(statCfg.icon, { size: 9 })} +{statDelta} {statCfg.label}
                          </span>
                        )}
                        <AnimatePresence>
                          {isHovered && choice.preview && (
                            <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                              className="text-[9px] italic" style={{ color: 'var(--text-muted)' }}>
                              {choice.preview}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <ChevronRight size={16} className="flex-shrink-0 mt-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                      style={{ color: isResonance ? '#C084FC' : statCfg?.color || 'var(--text-muted)' }} />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state (generating next scene) */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: `radial-gradient(circle, ${origin.color}20, transparent)`, border: `1px solid ${origin.color}20` }}>
              <Sparkles size={24} style={{ color: origin.color }} />
            </div>
          </motion.div>
          <p className="text-sm font-medium" style={{ color: origin.color }}>The cosmos reshapes around you...</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Generating your next scene with AI</p>
        </motion.div>
      )}

      {/* Level Up */}
      <AnimatePresence>
        {character.leveled_up && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-2xl p-6 text-center"
            style={{
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(252,211,77,0.3)', boxShadow: '0 0 60px rgba(252,211,77,0.15)',
            }}
            data-testid="level-up-toast">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
              <Zap size={28} className="mx-auto mb-2" style={{ color: '#FCD34D' }} />
            </motion.div>
            <p className="text-lg font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FCD34D' }}>Level Up!</p>
            <p className="text-sm" style={{ color: 'rgba(252,211,77,0.8)' }}>You reached Level {character.level}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement */}
      <AnimatePresence>
        {character.new_achievements?.map(ach => (
          <motion.div key={ach.id} initial={{ opacity: 0, y: 30, x: '-50%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-8 left-1/2 z-50 rounded-xl p-4 flex items-center gap-3"
            style={{
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(192,132,252,0.2)',
            }}>
            <Trophy size={20} style={{ color: '#C084FC' }} />
            <div>
              <p className="text-xs font-bold" style={{ color: '#C084FC' }}>{ach.title}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{ach.desc}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Page ─── */
export default function StarseedAdventure() {
  const { user, authHeaders, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { reduceParticles } = useSensory();

  const [origins, setOrigins] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [activeOrigin, setActiveOrigin] = useState(null);
  const [currentScene, setCurrentScene] = useState(null);
  const [characterState, setCharacterState] = useState(null);
  const [sceneImage, setSceneImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [view, setView] = useState('select');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    Promise.all([
      axios.get(`${API}/starseed/origins`).then(r => setOrigins(r.data.origins)).catch(() => {}),
      axios.get(`${API}/starseed/my-characters`, { headers: authHeaders }).then(r => setCharacters(r.data.characters)).catch(() => {}),
    ]).finally(() => setInitialLoading(false));
  }, [user, authLoading, authHeaders, navigate]);

  // Generate scene image in background
  const generateSceneImage = useCallback(async (imagePrompt, originId) => {
    if (!imagePrompt) return;
    setImageLoading(true);
    try {
      const res = await axios.post(`${API}/starseed/generate-scene-image`, {
        image_prompt: imagePrompt,
        origin_id: originId,
      }, { headers: authHeaders });
      if (res.data.image_base64) {
        setSceneImage(`data:image/png;base64,${res.data.image_base64}`);
      } else if (res.data.image_url) {
        setSceneImage(res.data.image_url);
      }
    } catch {
      // Fallback to stock backgrounds
      try {
        const bgRes = await axios.get(`${API}/starseed/backgrounds/${originId}`);
        if (bgRes.data.backgrounds?.length) {
          setSceneImage(bgRes.data.backgrounds[Math.floor(Math.random() * bgRes.data.backgrounds.length)]);
        }
      } catch {}
    } finally {
      setImageLoading(false);
    }
  }, [authHeaders]);

  const startNewAdventure = useCallback(async (originId, characterName) => {
    setLoading(true);
    setSceneImage(null);
    try {
      await axios.post(`${API}/starseed/create-character`, {
        origin_id: originId, character_name: characterName,
      }, { headers: authHeaders });

      const origin = origins.find(o => o.id === originId);
      setActiveOrigin(origin);

      const sceneRes = await axios.post(`${API}/starseed/generate-scene`, {
        origin_id: originId, choice_index: null,
      }, { headers: authHeaders });

      setCurrentScene(sceneRes.data.scene);
      setCharacterState(sceneRes.data.character);
      setView('game');
      toast.success(`${origin.name} adventure begins!`);

      // Generate image in background
      generateSceneImage(sceneRes.data.scene.image_prompt, originId);
    } catch {
      toast.error('Could not start adventure');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, origins, generateSceneImage]);

  const resumeAdventure = useCallback(async (originId) => {
    setLoading(true);
    setSceneImage(null);
    try {
      const origin = origins.find(o => o.id === originId);
      setActiveOrigin(origin);

      const charRes = await axios.get(`${API}/starseed/character/${originId}`, { headers: authHeaders });
      setCharacterState(charRes.data);

      const sceneRes = await axios.post(`${API}/starseed/generate-scene`, {
        origin_id: originId, choice_index: null,
      }, { headers: authHeaders });

      setCurrentScene(sceneRes.data.scene);
      setCharacterState(sceneRes.data.character);
      setView('game');

      generateSceneImage(sceneRes.data.scene.image_prompt, originId);
    } catch {
      toast.error('Could not resume adventure');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, origins, generateSceneImage]);

  const makeChoice = useCallback(async (choiceIndex) => {
    if (!activeOrigin || loading) return;
    setLoading(true);
    setSceneImage(null);
    try {
      const res = await axios.post(`${API}/starseed/generate-scene`, {
        origin_id: activeOrigin.id, choice_index: choiceIndex,
      }, { headers: authHeaders });

      setCurrentScene(res.data.scene);
      setCharacterState(res.data.character);

      generateSceneImage(res.data.scene.image_prompt, activeOrigin.id);
    } catch {
      toast.error('The cosmos falters... try again');
    } finally {
      setLoading(false);
    }
  }, [activeOrigin, authHeaders, loading, generateSceneImage]);

  const goBack = () => {
    setView('select');
    setCurrentScene(null);
    setCharacterState(null);
    setActiveOrigin(null);
    setSceneImage(null);
    axios.get(`${API}/starseed/my-characters`, { headers: authHeaders })
      .then(r => setCharacters(r.data.characters)).catch(() => {});
  };

  if (authLoading || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          <Sparkles size={28} style={{ color: '#C084FC' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" data-testid="starseed-adventure-page">
      {/* Cosmic canvas background */}
      <CosmicCanvas
        originColor={activeOrigin?.color || '#C084FC'}
        atmosphere={currentScene?.atmosphere || 'mystical'}
        active={view === 'game' || !activeOrigin}
      />

      {/* Content */}
      <div className="relative z-10 px-4 md:px-12 lg:px-24 py-10">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {view === 'select' ? (
              <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }}>
                <CharacterSelect
                  origins={origins}
                  existingCharacters={characters}
                  onSelect={startNewAdventure}
                  onResume={resumeAdventure}
                  loading={loading}
                  authHeaders={authHeaders}
                />
              </motion.div>
            ) : (
              <motion.div key="game" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                {activeOrigin && (
                  <GameScene
                    scene={currentScene}
                    character={characterState}
                    origin={activeOrigin}
                    onChoice={makeChoice}
                    loading={loading}
                    onBack={goBack}
                    sceneImage={sceneImage}
                    imageLoading={imageLoading}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Full-screen loading overlay for adventure start */}
      <AnimatePresence>
        {loading && view === 'select' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                transition={{ rotate: { duration: 4, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: `radial-gradient(circle, ${activeOrigin?.color || '#C084FC'}20, transparent)`, border: `1px solid ${activeOrigin?.color || '#C084FC'}30` }}>
                  <Star size={32} style={{ color: activeOrigin?.color || '#C084FC' }} />
                </div>
              </motion.div>
              <p className="text-lg mt-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: activeOrigin?.color || '#C084FC' }}>
                Channeling cosmic frequencies...
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Your adventure is being woven by AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
