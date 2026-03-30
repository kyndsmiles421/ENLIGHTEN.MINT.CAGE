import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import {
  ArrowLeft, ArrowRight, Loader2, Sparkles, Star, Check,
  Lock, ChevronRight, ChevronLeft, Wand2, Download, Share2,
  RotateCcw, Eye, Flame, Shield, Heart, Brain, Swords,
  Moon, Sun, Diamond, Globe, Crown, Gem, Zap, User
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STEP_ICONS = [Globe, Sparkles, Star, Wand2, Crown, Diamond];

/* ─── Evolution Stage Display ─── */
function EvolutionBar({ stages, currentLevel }) {
  return (
    <div className="flex items-center gap-1 w-full" data-testid="evolution-bar">
      {stages.map((stage, i) => {
        const reached = currentLevel >= stage.level;
        const isCurrent = i < stages.length - 1
          ? currentLevel >= stage.level && currentLevel < stages[i + 1].level
          : currentLevel >= stage.level;
        return (
          <div key={stage.level} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: reached ? '100%' : '0%' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ background: isCurrent
                  ? 'linear-gradient(90deg, #C084FC, #818CF8)'
                  : reached ? 'rgba(192,132,252,0.4)' : 'transparent' }} />
            </div>
            <span className="text-[7px] font-bold uppercase tracking-wider"
              style={{ color: reached ? '#C084FC' : 'var(--text-muted)', opacity: reached ? 1 : 0.4 }}>
              {stage.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Option Card ─── */
function OptionCard({ option, selected, onToggle, multiSelect }) {
  const isSelected = multiSelect
    ? (selected || []).includes(option.id)
    : selected === option.id;
  const locked = option.unlocked === false;

  return (
    <motion.button
      whileHover={locked ? {} : { scale: 1.02, y: -2 }}
      whileTap={locked ? {} : { scale: 0.98 }}
      onClick={() => !locked && onToggle(option.id)}
      disabled={locked}
      className="relative rounded-xl p-3 text-left transition-all border group"
      style={{
        background: isSelected ? `${option.color}12` : locked ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
        borderColor: isSelected ? `${option.color}35` : locked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
        opacity: locked ? 0.4 : 1,
        cursor: locked ? 'not-allowed' : 'pointer',
        boxShadow: isSelected ? `0 4px 20px ${option.color}10, inset 0 1px 0 ${option.color}08` : 'none',
      }}
      data-testid={`option-${option.id}`}>
      {/* Glow overlay for selected state */}
      {isSelected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 20% 30%, ${option.color}06, transparent 60%)` }} />
      )}
      {isSelected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: `${option.color}25`, border: `1px solid ${option.color}40` }}>
          <Check size={10} style={{ color: option.color }} />
        </motion.div>
      )}
      {locked && (
        <div className="absolute top-2 right-2">
          <Lock size={10} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
          style={{
            background: isSelected ? `${option.color}20` : `${option.color}15`,
            border: `1px solid ${isSelected ? `${option.color}35` : `${option.color}20`}`,
          }}>
          {isSelected ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="w-3 h-3 rounded-full"
              style={{ background: option.color, boxShadow: `0 0 12px ${option.color}60` }} />
          ) : (
            <div className="w-3 h-3 rounded-full transition-all group-hover:scale-110" style={{ background: option.color, boxShadow: `0 0 8px ${option.color}40` }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium mb-0.5" style={{ color: isSelected ? option.color : 'var(--text-primary)' }}>
            {option.name}
          </p>
          <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {option.desc}
          </p>
          {locked && option.level_req && (
            <span className="text-[7px] px-1.5 py-0.5 rounded-full mt-1 inline-block"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
              Unlocks at Lvl {option.level_req}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Cinematic Generation Animation ─── */
function CosmicGenerationAnim() {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const PHASES = [
    { text: 'Gathering stardust...', sub: 'Connecting to the cosmic forge', color: '#C084FC' },
    { text: 'Weaving your essence...', sub: 'Channeling dimensional frequencies', color: '#818CF8' },
    { text: 'Transmitting to the cosmos...', sub: 'Reality bending in progress', color: '#38BDF8' },
    { text: 'Crystallizing form...', sub: 'Your avatar is taking shape', color: '#34D399' },
    { text: 'Almost manifested...', sub: 'Final alignments in progress', color: '#FCD34D' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setPhase(p => (p + 1) % PHASES.length), 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const particles = Array.from({ length: 50 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W,
      y: H / 2 + (Math.random() - 0.5) * H,
      tx: W / 2 + (Math.random() - 0.5) * 60,
      ty: H / 2 + (Math.random() - 0.5) * 60,
      r: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.008 + 0.003,
      progress: Math.random(),
      hue: Math.random() * 60 + 250,
    }));

    const rings = Array.from({ length: 3 }, (_, i) => ({
      radius: 40 + i * 30, angle: Math.random() * Math.PI * 2, speed: (0.01 + i * 0.005) * (i % 2 ? 1 : -1),
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw convergence rings
      rings.forEach(ring => {
        ring.angle += ring.speed;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, ring.radius, ring.angle, ring.angle + Math.PI * 1.2);
        ctx.strokeStyle = `rgba(192,132,252,${0.06 + Math.sin(ring.angle) * 0.03})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Central glow
      const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 80);
      grad.addColorStop(0, 'rgba(192,132,252,0.12)');
      grad.addColorStop(0.5, 'rgba(129,140,248,0.04)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Particles converging toward center
      particles.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) {
          p.progress = 0;
          p.x = W / 2 + (Math.random() - 0.5) * W;
          p.y = H / 2 + (Math.random() - 0.5) * H;
          p.tx = W / 2 + (Math.random() - 0.5) * 40;
          p.ty = H / 2 + (Math.random() - 0.5) * 40;
        }
        const cx = p.x + (p.tx - p.x) * p.progress;
        const cy = p.y + (p.ty - p.y) * p.progress;
        const alpha = Math.sin(p.progress * Math.PI) * 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, p.r * (1 - p.progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
        ctx.fill();

        // Trail
        if (p.progress > 0.1) {
          ctx.beginPath();
          ctx.moveTo(p.x + (p.tx - p.x) * (p.progress - 0.1), p.y + (p.ty - p.y) * (p.progress - 0.1));
          ctx.lineTo(cx, cy);
          ctx.strokeStyle = `hsla(${p.hue}, 80%, 70%, ${alpha * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  const currentPhase = PHASES[phase];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" data-testid="generation-anim">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 flex flex-col items-center gap-4 px-6">
        {/* Pulsing core */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${currentPhase.color}30, transparent)`,
            boxShadow: `0 0 40px ${currentPhase.color}20, 0 0 80px ${currentPhase.color}10`,
          }}>
          <Sparkles size={24} style={{ color: currentPhase.color }} />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="text-center">
            <p className="text-sm font-medium mb-1"
              style={{ color: currentPhase.color, textShadow: `0 0 20px ${currentPhase.color}40` }}>
              {currentPhase.text}
            </p>
            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{currentPhase.sub}</p>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-40 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div className="h-full rounded-full"
            animate={{ width: ['0%', '85%'] }}
            transition={{ duration: 45, ease: 'easeOut' }}
            style={{ background: `linear-gradient(90deg, ${currentPhase.color}, #818CF8)` }} />
        </div>

        <p className="text-[8px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
          {elapsed}s elapsed
        </p>
      </div>
    </div>
  );
}

/* ─── Preview Panel (right side) ─── */
function PreviewPanel({ selections, categories, generatedAvatar, generating }) {
  const selectionSummary = [];

  for (const cat of categories) {
    const sel = selections[cat.id];
    if (!sel) continue;
    if (Array.isArray(sel)) {
      for (const sid of sel) {
        const opt = cat.options.find(o => o.id === sid);
        if (opt) selectionSummary.push({ category: cat.name, ...opt });
      }
    } else {
      const opt = cat.options.find(o => o.id === sel);
      if (opt) selectionSummary.push({ category: cat.name, ...opt });
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
      data-testid="avatar-preview-panel">
      {/* Avatar Image Area */}
      <div className="aspect-square flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(20,10,40,0.8), rgba(10,10,20,0.9))' }}>
        {generating ? (
          <CosmicGenerationAnim />
        ) : generatedAvatar ? (
          <motion.img initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            src={`data:image/png;base64,${generatedAvatar}`} alt="Spiritual Avatar"
            className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 3, repeat: Infinity }}>
              <User size={48} style={{ color: 'var(--text-muted)' }} />
            </motion.div>
            <p className="text-xs" style={{ color: 'var(--text-muted)', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              {selectionSummary.length > 0
                ? 'Your creation awaits. Click Generate to bring it to life.'
                : 'Select features to design your spiritual avatar'}
            </p>
          </div>
        )}

        {/* Floating selection indicators */}
        {!generatedAvatar && !generating && selectionSummary.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1 justify-center">
            {selectionSummary.slice(0, 8).map((s, i) => (
              <motion.span key={i} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="text-[7px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}25` }}>
                {s.name}
              </motion.span>
            ))}
            {selectionSummary.length > 8 && (
              <span className="text-[7px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                +{selectionSummary.length - 8} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      <div className="p-3">
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          Traits Selected ({selectionSummary.length})
        </p>
        {selectionSummary.length === 0 ? (
          <p className="text-[9px]" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>None yet</p>
        ) : (
          <div className="space-y-1">
            {selectionSummary.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-[8px]" style={{ color: s.color }}>{s.name}</span>
                <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>({s.category})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Cosmic Background Canvas ─── */
function CosmicBg({ reduceParticles }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduceParticles) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2, speed: Math.random() * 0.3 + 0.1,
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.y += s.speed;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(192,132,252,${0.1 + Math.random() * 0.15})`;
        ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [reduceParticles]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40" />;
}


/* ═══════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════ */
export default function SpiritualAvatarCreator() {
  const { user, authHeaders, loading: authLoading } = useAuth();
  const { reduceParticles } = useSensory();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [stages, setStages] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [customNotes, setCustomNotes] = useState('');
  const [generatedAvatar, setGeneratedAvatar] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedAvatar, setSavedAvatar] = useState(null);

  useEffect(() => {
    if (!authHeaders?.Authorization) return;
    const load = async () => {
      try {
        const [catalogRes, avatarRes] = await Promise.all([
          axios.get(`${API}/starseed/avatar-builder/catalog`, { headers: authHeaders }),
          axios.get(`${API}/starseed/avatar-builder/my-avatar`, { headers: authHeaders }),
        ]);
        setCategories(catalogRes.data.categories);
        setStages(catalogRes.data.evolution_stages);
        setCurrentLevel(catalogRes.data.current_level);

        if (avatarRes.data.avatar) {
          setSavedAvatar(avatarRes.data.avatar);
          if (avatarRes.data.avatar.selections) {
            setSelections(avatarRes.data.avatar.selections);
          }
          if (avatarRes.data.avatar.avatar_base64) {
            setGeneratedAvatar(avatarRes.data.avatar.avatar_base64);
          }
          if (avatarRes.data.avatar.custom_notes) {
            setCustomNotes(avatarRes.data.avatar.custom_notes);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authHeaders]);

  const currentCategory = categories[currentStep];

  const handleSelect = useCallback((optionId) => {
    if (!currentCategory) return;
    const isMulti = currentCategory.multi_select;
    const maxSel = currentCategory.max_selections || 99;

    setSelections(prev => {
      if (isMulti) {
        const current = prev[currentCategory.id] || [];
        if (current.includes(optionId)) {
          return { ...prev, [currentCategory.id]: current.filter(id => id !== optionId) };
        }
        if (current.length >= maxSel) {
          toast.error(`Maximum ${maxSel} selections for ${currentCategory.name}`);
          return prev;
        }
        return { ...prev, [currentCategory.id]: [...current, optionId] };
      }
      return { ...prev, [currentCategory.id]: prev[currentCategory.id] === optionId ? null : optionId };
    });
  }, [currentCategory]);

  const generateAvatar = useCallback(async () => {
    if (generating) return;
    if (!selections.base_form) {
      toast.error('Please select a base form first');
      return;
    }
    setGenerating(true);
    try {
      const res = await axios.post(`${API}/starseed/avatar-builder/generate`, {
        selections, custom_notes: customNotes.trim(),
      }, { headers: authHeaders });
      if (res.data.avatar_base64) {
        setGeneratedAvatar(res.data.avatar_base64);
        toast.success('Your spiritual avatar has been manifested!');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  }, [selections, customNotes, authHeaders, generating]);

  const resetSelections = () => {
    setSelections({});
    setGeneratedAvatar(null);
    setCustomNotes('');
    setCurrentStep(0);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={24} style={{ color: '#C084FC' }} />
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  const totalSteps = categories.length;
  const hasSelections = Object.values(selections).some(v => v && (Array.isArray(v) ? v.length > 0 : true));

  return (
    <div className="min-h-screen pb-24 relative" style={{ background: 'var(--bg-primary)' }}>
      <CosmicBg reduceParticles={reduceParticles} />

      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(10,10,15,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.04)' }} data-testid="avatar-builder-back">
          <ArrowLeft size={16} style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            Spiritual Avatar Creator
          </h1>
          <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Design Your Cosmic Being
          </p>
        </div>
        <button onClick={resetSelections}
          className="p-2 rounded-xl transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.04)' }} data-testid="avatar-reset">
          <RotateCcw size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
        <button onClick={() => navigate('/avatar-gallery')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.15)', color: '#FCD34D' }}
          data-testid="gallery-link">
          <Eye size={11} /> Gallery
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 relative z-10">
        {/* Evolution Bar */}
        <div className="mb-6">
          <EvolutionBar stages={stages} currentLevel={currentLevel} />
        </div>

        {/* Main Layout: Builder + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Builder Panel (2 cols) */}
          <div className="lg:col-span-2">
            {/* Step Navigation */}
            <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat, i) => {
                const StepIcon = STEP_ICONS[i] || Star;
                const hasSelection = selections[cat.id] && (Array.isArray(selections[cat.id]) ? selections[cat.id].length > 0 : true);
                const isActive = i === currentStep;
                return (
                  <button key={cat.id} onClick={() => setCurrentStep(i)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0"
                    style={{
                      background: isActive ? 'rgba(192,132,252,0.12)' : hasSelection ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.03)',
                      color: isActive ? '#C084FC' : hasSelection ? '#4ADE80' : 'var(--text-muted)',
                      border: `1px solid ${isActive ? 'rgba(192,132,252,0.2)' : hasSelection ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                    data-testid={`step-${cat.id}`}>
                    {hasSelection ? <Check size={10} /> : <StepIcon size={10} />}
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Category Content */}
            <AnimatePresence mode="wait">
              {currentCategory && (
                <motion.div key={currentCategory.id}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                        {currentCategory.name}
                      </h2>
                      <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        {currentCategory.description}
                        {currentCategory.multi_select && (
                          <span style={{ color: '#C084FC' }}> (Select up to {currentCategory.max_selections})</span>
                        )}
                      </p>
                    </div>
                    <span className="text-[9px] px-2 py-1 rounded-full"
                      style={{ background: 'rgba(192,132,252,0.08)', color: '#C084FC' }}>
                      Step {currentStep + 1}/{totalSteps}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                    {currentCategory.options.map((option, i) => (
                      <motion.div key={option.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}>
                        <OptionCard option={option}
                          selected={selections[currentCategory.id]}
                          onToggle={handleSelect}
                          multiSelect={currentCategory.multi_select} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Step Navigation Buttons */}
                  <div className="flex items-center justify-between">
                    <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-all hover:scale-105"
                      style={{
                        background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)',
                        opacity: currentStep === 0 ? 0.3 : 1,
                      }}
                      data-testid="prev-step">
                      <ChevronLeft size={14} /> Previous
                    </button>
                    {currentStep < totalSteps - 1 ? (
                      <button onClick={() => setCurrentStep(currentStep + 1)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
                        style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
                        data-testid="next-step">
                        Next <ChevronRight size={14} />
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Notes & Generate */}
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                Custom Description (Optional)
              </p>
              <textarea value={customNotes} onChange={e => setCustomNotes(e.target.value)}
                placeholder="Add any extra details about your avatar's appearance, personality, or energy..."
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl text-xs mb-4 resize-none"
                rows={3}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)', outline: 'none',
                }}
                data-testid="custom-notes" />

              <motion.button
                whileHover={!generating && hasSelections ? { scale: 1.02 } : {}}
                whileTap={!generating && hasSelections ? { scale: 0.98 } : {}}
                animate={hasSelections && !generating ? {
                  boxShadow: ['0 0 20px rgba(192,132,252,0.08)', '0 0 40px rgba(192,132,252,0.15)', '0 0 20px rgba(192,132,252,0.08)']
                } : {}}
                transition={{ duration: 2.5, repeat: Infinity }}
                onClick={generateAvatar}
                disabled={generating || !hasSelections}
                className="w-full py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2.5 transition-all relative overflow-hidden"
                style={{
                  background: hasSelections
                    ? 'linear-gradient(135deg, rgba(192,132,252,0.15), rgba(129,140,248,0.15))'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${hasSelections ? 'rgba(192,132,252,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  color: hasSelections ? '#C084FC' : 'var(--text-muted)',
                  opacity: generating ? 0.5 : 1,
                }}
                data-testid="generate-avatar-btn">
                {hasSelections && !generating && (
                  <motion.div className="absolute inset-0 opacity-30"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(192,132,252,0.15), transparent)', width: '50%' }} />
                )}
                {generating ? (
                  <><Loader2 size={16} className="animate-spin" /> Manifesting Your Avatar...</>
                ) : (
                  <><Sparkles size={16} /> Manifest Spiritual Avatar</>
                )}
              </motion.button>
            </div>
          </div>

          {/* Preview Panel (1 col) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <PreviewPanel selections={selections} categories={categories}
                generatedAvatar={generatedAvatar} generating={generating} />

              {generatedAvatar && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2">
                  <button onClick={generateAvatar} disabled={generating}
                    className="flex-1 py-2 rounded-xl text-[10px] font-medium flex items-center justify-center gap-1.5 transition-all hover:scale-105"
                    style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
                    data-testid="regenerate-btn">
                    <RotateCcw size={10} /> Regenerate
                  </button>
                  <button
                    className="flex-1 py-2 rounded-xl text-[10px] font-medium flex items-center justify-center gap-1.5 transition-all hover:scale-105"
                    style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ADE80' }}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:image/png;base64,${generatedAvatar}`;
                      link.download = 'spiritual-avatar.png';
                      link.click();
                      toast.success('Avatar downloaded!');
                    }}
                    data-testid="download-avatar">
                    <Download size={10} /> Download
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
