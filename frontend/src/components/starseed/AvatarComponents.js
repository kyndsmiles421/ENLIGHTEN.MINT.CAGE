import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Lock, User } from 'lucide-react';

export function EvolutionBar({ stages, currentLevel }) {
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

export function OptionCard({ option, selected, onToggle, multiSelect }) {
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

export function CosmicGenerationAnim() {
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
      rings.forEach(ring => {
        ring.angle += ring.speed;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, ring.radius, ring.angle, ring.angle + Math.PI * 1.2);
        ctx.strokeStyle = `rgba(192,132,252,${0.06 + Math.sin(ring.angle) * 0.03})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 80);
      grad.addColorStop(0, 'rgba(192,132,252,0.12)');
      grad.addColorStop(0.5, 'rgba(129,140,248,0.04)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
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

export function AvatarPreviewPanel({ selections, categories, generatedAvatar, generating }) {
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
