import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Award, Castle, Flame, Microscope, Waves, CheckCircle, Clock,
  Zap, ChevronRight, Trophy, Beaker, X, Lock, Sparkles, Shield, MapPin,
  Coins, Dna, Eye, EyeOff, Compass, Users, Hammer, BookMarked, ArrowUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModality } from '../context/ModalityContext';
import { ProximityItem } from '../components/SpatialRoom';
import InteractiveMasonry from '../components/InteractiveMasonry';
import HolographicChamber from '../components/HolographicChamber';

const API = process.env.REACT_APP_BACKEND_URL;

const MODALITY_ICONS = { architect: Castle, chef: Flame, researcher: Microscope, voyager: Waves };
const TYPE_ICONS = { lesson: BookOpen, lab: Beaker, test: Trophy };
const CLUSTER_ICONS = { Security: Shield, Location: MapPin, Finance: Coins, Evolution: Dna };
const ZONE_ICONS = { foundation: BookMarked, forge: Hammer, collective: Users };

const INTENSITY_META = {
  focus: { icon: EyeOff, label: 'Focus', desc: 'Silent — background tracking only', color: '#6B7280' },
  guided: { icon: Eye, label: 'Guided', desc: 'Contextual micro-lessons', color: '#818CF8' },
  immersive: { icon: Compass, label: 'Immersive', desc: 'Full catalyst mode', color: '#FBBF24' },
};

/* ── Interaction Intensity Switch ── */
function IntensitySwitch({ intensity, onChange }) {
  const levels = ['focus', 'guided', 'immersive'];
  const idx = levels.indexOf(intensity);
  return (
    <div className="rounded-xl p-3" style={{
      background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)',
    }} data-testid="intensity-switch">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[8px] uppercase tracking-[2px]" style={{ color: 'rgba(248,250,252,0.18)' }}>
          Interaction Intensity
        </span>
        <span className="text-[8px] px-2 py-0.5 rounded-full" style={{
          background: `${INTENSITY_META[intensity]?.color || '#818CF8'}10`,
          color: INTENSITY_META[intensity]?.color || '#818CF8',
        }}>
          {INTENSITY_META[intensity]?.label}
        </span>
      </div>
      {/* 3-position slider */}
      <div className="relative h-1.5 rounded-full mb-2.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          className="absolute top-0 h-full rounded-full"
          animate={{ width: `${((idx + 1) / 3) * 100}%` }}
          transition={{ type: 'spring', damping: 20 }}
          style={{ background: INTENSITY_META[intensity]?.color || '#818CF8' }}
        />
      </div>
      <div className="grid grid-cols-3 gap-1">
        {levels.map(lv => {
          const meta = INTENSITY_META[lv];
          const Icon = meta.icon;
          const active = intensity === lv;
          return (
            <motion.button
              key={lv}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(lv)}
              className="flex flex-col items-center gap-1 py-2 rounded-lg transition-all"
              style={{
                background: active ? `${meta.color}0A` : 'transparent',
                border: `1px solid ${active ? `${meta.color}18` : 'rgba(255,255,255,0.02)'}`,
                cursor: 'pointer',
              }}
              data-testid={`intensity-${lv}`}
            >
              <Icon size={13} style={{ color: active ? meta.color : 'rgba(255,255,255,0.6)' }} />
              <span className="text-[8px] font-medium" style={{ color: active ? meta.color : 'rgba(255,255,255,0.6)' }}>
                {meta.label}
              </span>
              <span className="text-[6px]" style={{ color: active ? `${meta.color}80` : 'rgba(248,250,252,0.12)' }}>
                {meta.desc}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Auto-Scale Prompt ── */
function AutoScalePrompt({ data, onAccept, onDismiss }) {
  if (!data) return null;
  const targetMeta = INTENSITY_META[data.target] || INTENSITY_META.guided;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="rounded-xl p-3 mb-4" style={{
        background: `${targetMeta.color}06`,
        border: `1px solid ${targetMeta.color}15`,
      }}
      data-testid="auto-scale-prompt"
    >
      <div className="flex items-start gap-2">
        <ArrowUp size={14} style={{ color: targetMeta.color, marginTop: 2 }} />
        <div className="flex-1">
          <div className="text-[10px] font-semibold mb-0.5" style={{ color: targetMeta.color }}>
            Ready for {targetMeta.label} Mode?
          </div>
          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{data.reason}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={onAccept}
              className="text-[9px] px-3 py-1 rounded-lg font-medium"
              style={{ background: `${targetMeta.color}12`, color: targetMeta.color, border: `1px solid ${targetMeta.color}20`, cursor: 'pointer' }}
              data-testid="auto-scale-accept"
            >
              Unlock {targetMeta.label}
            </button>
            <button
              onClick={onDismiss}
              className="text-[9px] px-3 py-1 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}
              data-testid="auto-scale-dismiss"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Immersive Mode Overlay ── */
function ImmersiveOverlay({ active }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-30" data-testid="immersive-overlay">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.03) 0%, transparent 60%)',
      }} />
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.15), transparent)',
      }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.1), transparent)',
      }} />
    </div>
  );
}

/* ── Fractal Certificate SVG ── */
function FractalCertificate({ seed, fingerprint, programName, tier, issuedAt }) {
  const canvasRef = useRef(null);
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('academy', 8); }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !seed) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const arms = seed.arms || 6, depth = seed.depth || 3;
    const hue = seed.hue_base || 270, sf = seed.scale_factor || 0.65;
    const comp = seed.complexity || 0.5;
    const drawBranch = (x, y, len, angle, d) => {
      if (d <= 0 || len < 2) return;
      const ex = x + Math.cos(angle) * len, ey = y + Math.sin(angle) * len;
      const alpha = 0.3 + (d / depth) * 0.6;
      ctx.strokeStyle = `hsla(${(hue + d * 40) % 360}, 70%, ${55 + d * 5}%, ${alpha})`;
      ctx.lineWidth = 0.5 + d * 0.8;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
      if (d > 1) {
        ctx.fillStyle = `hsla(${(hue + d * 40) % 360}, 60%, 60%, ${alpha * 0.5})`;
        ctx.beginPath(); ctx.arc(ex, ey, ctx.lineWidth * 1.5, 0, Math.PI * 2); ctx.fill();
      }
      const spread = Math.PI / (3 + comp * 4);
      drawBranch(ex, ey, len * sf, angle - spread, d - 1);
      drawBranch(ex, ey, len * sf, angle + spread, d - 1);
    };
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 100);
    grad.addColorStop(0, `hsla(${hue}, 50%, 40%, 0.08)`); grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < arms; i++) drawBranch(cx, cy, 30 + comp * 30, (i * 2 * Math.PI) / arms + (seed.rotation || 0) * Math.PI / 180, depth);
    ctx.fillStyle = `hsla(${hue}, 70%, 65%, 0.6)`; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
  }, [seed]);

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{
      background: 'linear-gradient(135deg, rgba(15,15,25,0.95), rgba(10,10,20,0.98))',
      border: '1px solid rgba(251,191,36,0.2)',
    }} data-testid="fractal-certificate">
      <div className="absolute inset-0 opacity-30">
        <canvas ref={canvasRef} width={280} height={200} className="w-full h-full" />
      </div>
      <div className="relative z-10 p-5 text-center">
        <Award size={20} style={{ color: '#FBBF24', margin: '0 auto 6px' }} />
        <div className="text-[8px] uppercase tracking-[3px] mb-1" style={{ color: 'rgba(251,191,36,0.5)' }}>Fractal Certificate</div>
        <div className="text-sm font-semibold mb-0.5" style={{ color: '#FBBF24' }}>{programName}</div>
        <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>Tier: {tier}</div>
        <div className="font-mono text-[10px] mt-2 px-3 py-1 rounded-lg inline-block" style={{
          background: 'rgba(251,191,36,0.06)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.1)',
        }}>{fingerprint}</div>
        {issuedAt && <div className="text-[8px] mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Issued {new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>}
      </div>
    </div>
  );
}

/* ── Forge Simulation Matrix ── */
function ForgeMatrix({ clusterMatrix, clusterScores, determinantPositive, density }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const labels = ['SEC', 'LOC', 'FIN', 'EVO'];
    const cellSize = 38, pad = 36;
    const animate = () => {
      timeRef.current += 0.02;
      const t = timeRef.current;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          const val = clusterMatrix[i]?.[j] || 0;
          const x = pad + j * cellSize, y = pad + i * cellSize;
          const pulse = Math.sin(t * 2 + i * 0.7 + j * 0.5) * 0.15;
          const intensity = Math.min(1, Math.max(0, val + pulse));
          const r = Math.floor(30 + intensity * 60), g = Math.floor(20 + intensity * 180), b = Math.floor(80 + intensity * 120);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + intensity * 0.5})`;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(0.3 + intensity * 0.5) * 0.6})`;
          ctx.lineWidth = 1;
          ctx.fillRect(x, y, cellSize - 2, cellSize - 2);
          ctx.strokeRect(x, y, cellSize - 2, cellSize - 2);
          ctx.fillStyle = `rgba(248, 250, 252, ${0.4 + intensity * 0.4})`;
          ctx.font = '9px monospace'; ctx.textAlign = 'center';
          ctx.fillText(val.toFixed(2), x + cellSize / 2, y + cellSize / 2 + 3);
        }
      }
      ctx.fillStyle = 'rgba(248, 250, 252, 0.3)'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center';
      for (let j = 0; j < 4; j++) ctx.fillText(labels[j], pad + j * cellSize + cellSize / 2, pad - 8);
      ctx.textAlign = 'right';
      for (let i = 0; i < 4; i++) ctx.fillText(labels[i], pad - 6, pad + i * cellSize + cellSize / 2 + 3);
      const detPulse = Math.sin(t * 3) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(${determinantPositive ? '34,197,94' : '239,68,68'}, ${detPulse * 0.2})`;
      ctx.beginPath(); ctx.arc(w - 20, h - 20, 8 + Math.sin(t * 2) * 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = determinantPositive ? '#22C55E' : '#EF4444';
      ctx.beginPath(); ctx.arc(w - 20, h - 20, 4, 0, Math.PI * 2); ctx.fill();
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [clusterMatrix, determinantPositive, density]);
  return <canvas ref={canvasRef} width={220} height={210} className="w-full" style={{ maxWidth: 220 }} />;
}

/* ── Mastery Progress Ring ── */
function MasteryRing({ level, resonanceScore }) {
  if (!level) return null;
  const progress = level.progress_to_next || 0;
  const radius = 28, circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  return (
    <div className="flex items-center gap-3" data-testid="mastery-ring">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg width="64" height="64" viewBox="0 0 64 64" className="absolute">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
          <circle cx="32" cy="32" r={radius} fill="none" stroke={level.color} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 32 32)"
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <Award size={16} style={{ color: level.color }} />
      </div>
      <div>
        <div className="text-xs font-semibold" style={{ color: level.color }}>{level.tier}</div>
        <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {resonanceScore} RP{level.next_tier && <> / {level.next_threshold} for {level.next_tier}</>}
        </div>
      </div>
    </div>
  );
}

/* ── Lesson Viewer ── */
function LessonViewer({ content, modality, onClose, onComplete, completing }) {
  const [currentSection, setCurrentSection] = useState(0);
  if (!content) return null;
  const sections = content.sections || [];
  const isLast = currentSection >= sections.length - 1;
  const section = sections[currentSection];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative w-full flex flex-col px-4"
      style={{ background: 'transparent' }} data-testid="lesson-viewer">
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="rounded-2xl max-w-md w-full overflow-hidden"
        style={{ background: 'transparent', border: `1px solid ${modality?.color || '#C084FC'}18` }}>
        <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${modality?.color || '#C084FC'}10` }}>
          <div className="flex items-center gap-2">
            <BookOpen size={14} style={{ color: modality?.color || '#C084FC' }} />
            <span className="text-xs font-medium" style={{ color: modality?.color || '#C084FC' }}>{modality?.lesson_label || 'Lesson'}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}>
            <X size={14} style={{ color: 'rgba(255,255,255,0.65)' }} />
          </button>
        </div>
        <div className="px-5 pt-3 flex gap-1.5">
          {sections.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full transition-all" style={{
              background: i <= currentSection ? (modality?.color || '#C084FC') : 'rgba(255,255,255,0.06)',
            }} />
          ))}
        </div>
        <div className="px-5 py-4">
          <AnimatePresence mode="wait">
            <motion.div key={currentSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h3 className="text-base font-semibold mb-3" style={{ color: '#F8FAFC' }}>{section?.heading}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{section?.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        {isLast && content.key_concepts && (
          <div className="px-5 pb-3">
            <div className="text-[8px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Key Concepts</div>
            <div className="flex flex-wrap gap-1.5">
              {content.key_concepts.map(kc => (
                <span key={kc} className="text-[9px] px-2 py-0.5 rounded-full" style={{
                  background: `${modality?.color || '#C084FC'}08`, color: modality?.color || '#C084FC',
                  border: `1px solid ${modality?.color || '#C084FC'}15`,
                }}>{kc}</span>
              ))}
            </div>
          </div>
        )}
        <div className="px-5 pb-4 flex gap-2">
          {currentSection > 0 && (
            <button onClick={() => setCurrentSection(p => p - 1)} className="px-4 py-2.5 rounded-xl text-xs"
              style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
              data-testid="lesson-prev-btn">Back</button>
          )}
          <button onClick={() => { if (isLast) onComplete(); else setCurrentSection(p => p + 1); }}
            disabled={completing} className="flex-1 py-2.5 rounded-xl text-xs font-medium"
            style={{
              background: `${modality?.color || '#C084FC'}12`, color: modality?.color || '#C084FC',
              border: `1px solid ${modality?.color || '#C084FC'}20`,
              cursor: completing ? 'wait' : 'pointer', opacity: completing ? 0.5 : 1,
            }} data-testid="lesson-next-btn">
            {completing ? 'Completing...' : isLast ? 'Complete Lesson' : 'Continue'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Forge Lab Modal ── */
function ForgeLab({ forgeData, modality, onClose, onComplete, completing, result }) {
  if (!forgeData) return null;
  const sim = forgeData.simulation || {};
  const challenge = forgeData.challenge || {};
  const tasks = challenge.tasks || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative w-full flex flex-col px-4"
      style={{ background: 'transparent' }} data-testid="forge-lab-modal">
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        style={{ background: 'transparent', border: `1px solid ${modality?.color || '#C084FC'}15` }}>
        {!result ? (
          <>
            <div className="px-5 pt-4 pb-3 flex items-center justify-between sticky top-0 z-10"
              style={{ background: 'transparent', borderBottom: `1px solid ${modality?.color || '#C084FC'}10` }}>
              <div className="flex items-center gap-2">
                <Beaker size={16} style={{ color: modality?.color || '#C084FC' }} />
                <div>
                  <span className="text-xs font-semibold" style={{ color: '#F8FAFC' }}>{sim.display_label || 'Forge Lab'}</span>
                  <span className="text-[9px] ml-2" style={{ color: 'rgba(255,255,255,0.65)' }}>{sim.duration_min}m | {(sim.complexity * 100).toFixed(0)}%</span>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}>
                <X size={14} style={{ color: 'rgba(255,255,255,0.65)' }} />
              </button>
            </div>
            <div className="px-5 py-4">
              <h3 className="text-sm font-semibold mb-1" style={{ color: '#F8FAFC' }}>{forgeData.module?.title}</h3>
              {challenge.objective && <p className="text-[10px] mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>{challenge.objective}</p>}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-shrink-0 rounded-xl p-3 flex items-center justify-center" style={{
                  background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <ForgeMatrix clusterMatrix={sim.cluster_matrix || []} clusterScores={sim.cluster_scores || []}
                    determinantPositive={sim.h2_state?.determinant_positive} density={sim.h2_state?.density || 0} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Cluster State</div>
                  {(sim.cluster_scores || []).map(cs => {
                    const Icon = CLUSTER_ICONS[cs.name] || Shield;
                    const pct = (cs.score / cs.max) * 100;
                    return (
                      <div key={cs.name} className="flex items-center gap-2">
                        <Icon size={10} style={{ color: 'rgba(255,255,255,0.65)' }} />
                        <span className="text-[9px] w-14" style={{ color: 'rgba(255,255,255,0.7)' }}>{cs.name}</span>
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${pct}%`, background: pct > 66 ? '#22C55E' : pct > 33 ? '#FBBF24' : '#EF4444',
                          }} />
                        </div>
                        <span className="text-[9px] font-mono w-8 text-right" style={{ color: 'rgba(255,255,255,0.65)' }}>{cs.score}/{cs.max}</span>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-2 mt-3 px-2 py-1.5 rounded-lg" style={{
                    background: sim.h2_state?.determinant_positive ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)',
                    border: `1px solid ${sim.h2_state?.determinant_positive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}`,
                  }}>
                    <div className="w-2 h-2 rounded-full" style={{
                      background: sim.h2_state?.determinant_positive ? '#22C55E' : '#EF4444',
                      boxShadow: `0 0 6px ${sim.h2_state?.determinant_positive ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                    }} />
                    <span className="text-[9px] font-medium" style={{
                      color: sim.h2_state?.determinant_positive ? '#22C55E' : '#EF4444',
                    }} data-testid="determinant-status">
                      Det: {sim.h2_state?.determinant_positive ? 'Positive' : 'Negative'}
                    </span>
                    <span className="text-[8px] ml-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Density: {((sim.h2_state?.density || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              {tasks.length > 0 && (
                <div className="mb-4">
                  <div className="text-[8px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Simulation Tasks</div>
                  <div className="space-y-1.5">
                    {tasks.map((task, i) => (
                      <div key={task.id} className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)',
                      }} data-testid={`forge-task-${task.id}`}>
                        <div className="w-4 h-4 rounded flex items-center justify-center mt-0.5 flex-shrink-0" style={{
                          background: `${modality?.color || '#C084FC'}10` }}>
                          <span className="text-[8px] font-mono" style={{ color: modality?.color || '#C084FC' }}>{i + 1}</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.8)' }}>{task.desc}</span>
                          <div className="text-[7px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Weight: {(task.weight * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="px-3 py-2 rounded-lg mb-4" style={{ background: 'rgba(251,191,36,0.03)', border: '1px solid rgba(251,191,36,0.08)' }}>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={10} style={{ color: '#FBBF24' }} />
                  <span className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(251,191,36,0.5)' }}>Validation Rule</span>
                </div>
                <p className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{sim.validation_rule}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs"
                  style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                  data-testid="forge-cancel-btn">Cancel</button>
                <button onClick={onComplete} disabled={completing} className="flex-1 py-2.5 rounded-xl text-xs font-medium"
                  style={{
                    background: `${modality?.color || '#C084FC'}12`, color: modality?.color || '#C084FC',
                    border: `1px solid ${modality?.color || '#C084FC'}20`,
                    cursor: completing ? 'wait' : 'pointer', opacity: completing ? 0.5 : 1,
                  }} data-testid="forge-complete-btn">
                  {completing ? 'Validating H² Determinant...' : 'Submit for Validation'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            {result.status === 'completed' ? (
              <>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
                  <CheckCircle size={36} style={{ color: '#22C55E', margin: '0 auto 12px' }} />
                </motion.div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: '#22C55E' }}>
                  {forgeData.module?.type === 'test' ? 'Assessment Passed' : 'Lab Complete'}
                </h3>
                <div className="grid grid-cols-3 gap-2 my-4">
                  {[
                    { label: 'Resonance', value: result.resonance_points, color: '#C084FC' },
                    { label: 'Dust', value: `+${result.dust_earned}`, color: '#FBBF24' },
                    { label: 'Focus', value: `${result.weighted_focus_time}m`, color: '#3B82F6' },
                  ].map(s => (
                    <div key={s.label} className="rounded-lg p-2.5" style={{ background: `${s.color}06` }}>
                      <div className="text-sm font-semibold" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-[7px] uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {result.certification && (
                  <div className="mt-3 mb-4">
                    <FractalCertificate seed={result.certification.fractal_seed} fingerprint={result.certification.fractal_fingerprint}
                      programName={result.certification.program_name} tier={result.certification.program_tier} issuedAt={result.certification.issued_at} />
                  </div>
                )}
              </>
            ) : (
              <>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
                  <Lock size={36} style={{ color: '#EF4444', margin: '0 auto 12px' }} />
                </motion.div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: '#EF4444' }}>Validation Failed</h3>
                <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{result.reason}</p>
                {result.hint && <p className="text-[9px] px-3 py-2 rounded-lg mb-3" style={{
                  background: 'rgba(251,191,36,0.05)', color: '#FBBF24',
                }}>{result.hint}</p>}
              </>
            )}
            <button onClick={onClose} className="mt-2 px-6 py-2 rounded-xl text-xs"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
              data-testid="forge-result-close-btn">Continue</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN ACADEMY PAGE
   ═══════════════════════════════════════════ */
export default function AcademyPage() {
  const { token, authHeaders } = useAuth();
  const { modality, modalityData, switchModality, intensity, switchIntensity, autoScaleCheck, dismissAutoScale } = useModality();
  const [programs, setPrograms] = useState([]);
  const [zones, setZones] = useState([]);
  const [accreditation, setAccreditation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeForgeLab, setActiveForgeLab] = useState(null);
  const [forgeResult, setForgeResult] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [expandedProgram, setExpandedProgram] = useState(null);
  const [activeZone, setActiveZone] = useState(null); // null = all zones

  const fetchPrograms = useCallback(async () => {
    if (!token || token === 'guest_token') return;
    try {
      const res = await fetch(`${API}/api/academy/programs`, { headers: authHeaders });
      const data = await res.json();
      setPrograms(data.programs || []);
      if (data.zones) setZones(data.zones);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [token, authHeaders]);

  const fetchAccreditation = useCallback(async () => {
    if (!token || token === 'guest_token') return;
    try {
      const res = await fetch(`${API}/api/academy/accreditation`, { headers: authHeaders });
      const data = await res.json();
      setAccreditation(data);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [token, authHeaders]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPrograms(), fetchAccreditation()]).then(() => setLoading(false));
  }, [fetchPrograms, fetchAccreditation]);

  useEffect(() => { fetchPrograms(); }, [modality, fetchPrograms]);

  const beginModule = async (programId, module) => {
    try {
      const res = await fetch(`${API}/api/academy/begin`, {
        method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ program_id: programId, module_id: module.id }),
      });
      const data = await res.json();
      if (data.status === 'completed') return;
      if (module.type === 'lesson') {
        try {
          const lessonRes = await fetch(`${API}/api/academy/lesson/${module.id}`, { headers: authHeaders });
          const lessonData = await lessonRes.json();
          setActiveLesson({ programId, moduleId: module.id, content: lessonData.content, module, modality: lessonData.modality });
        } catch {
          setActiveLesson({ programId, moduleId: module.id, content: null, module });
        }
      } else {
        const forgeRes = await fetch(`${API}/api/academy/forge/${programId}/${module.id}`, { headers: authHeaders });
        const fd = await forgeRes.json();
        setActiveForgeLab({ programId, moduleId: module.id, forgeData: fd, module });
        setForgeResult(null);
      }
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  };

  const completeLesson = async () => {
    if (!activeLesson) return;
    setCompleting(true);
    try {
      const res = await fetch(`${API}/api/academy/complete`, {
        method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ program_id: activeLesson.programId, module_id: activeLesson.moduleId, focus_minutes: activeLesson.module?.duration_min || 15 }),
      });
      const data = await res.json();
      if (data.status === 'completed' && data.certification) {
        setActiveLesson(null);
        setActiveForgeLab({ programId: activeLesson.programId, moduleId: activeLesson.moduleId, forgeData: { module: activeLesson.module }, module: activeLesson.module });
        setForgeResult(data);
      } else { setActiveLesson(null); }
      fetchPrograms(); fetchAccreditation();
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    setCompleting(false);
  };

  const completeForge = async () => {
    if (!activeForgeLab) return;
    setCompleting(true);
    try {
      const res = await fetch(`${API}/api/academy/complete`, {
        method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ program_id: activeForgeLab.programId, module_id: activeForgeLab.moduleId, focus_minutes: activeForgeLab.module?.duration_min || 20 }),
      });
      const data = await res.json();
      setForgeResult(data);
      fetchPrograms(); fetchAccreditation();
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    setCompleting(false);
  };

  const closeModals = () => { setActiveLesson(null); setActiveForgeLab(null); setForgeResult(null); };

  const handleAutoScaleAccept = () => {
    if (autoScaleCheck?.target) switchIntensity(autoScaleCheck.target);
    dismissAutoScale();
  };

  if (!token || token === 'guest_token') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: 'transparent' }}>
        <h2 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Cormorant Garamond, serif' }}>Academy</h2>
        <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.65)' }}>Sign in to access the Academy — lessons, certifications, and mastery paths.</p>
        <button 
          onClick={() => window.location.href = '/auth'}
          className="px-6 py-3 rounded-xl text-sm font-medium active:scale-95"
          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E' }}
          data-testid="academy-login-btn"
        >
          Sign In to Begin
        </button>
      </div>
    );
  }

  const skinColor = modalityData?.color || '#C084FC';
  const filteredPrograms = activeZone ? programs.filter(p => p.zone === activeZone) : programs;

  return (
    <HolographicChamber chamberId="academy" title="Sovereign Academy" subtitle="Holographic Lecture Hall" fullBleed>
    <div className="min-h-screen pt-20 pb-40 px-5 max-w-3xl mx-auto" style={{ background: 'transparent' }}>
      <ImmersiveOverlay active={intensity === 'immersive'} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={14} style={{ color: skinColor }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: skinColor }}>Academy</p>
        </div>
        <div className="flex items-start justify-between mb-2" data-testid="academy-header">
          <div>
            <h1 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }} data-testid="academy-title">Academy</h1>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {modalityData?.name || 'Omni-Modality'} | {INTENSITY_META[intensity]?.label || 'Guided'} Mode
            </p>
          </div>
          {accreditation?.mastery_level && (
            <MasteryRing level={accreditation.mastery_level} resonanceScore={accreditation.resonance_score} />
          )}
        </div>

        

        {/* V55.0 — Interactive Masonry Module */}
        <div className="my-6 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <InteractiveMasonry room="academy" authHeaders={authHeaders} userId={token ? 'user' : ''} />
        </div>

        {/* Auto-Scale Prompt */}
        <AnimatePresence>
          {autoScaleCheck && <AutoScalePrompt data={autoScaleCheck} onAccept={handleAutoScaleAccept} onDismiss={dismissAutoScale} />}
        </AnimatePresence>

        {/* Interaction Intensity Switch */}
        <div className="mb-4">
          <IntensitySwitch intensity={intensity} onChange={switchIntensity} />
        </div>

        {/* Modality Toggle */}
        <div className="mb-4" data-testid="modality-switch">
          <div className="text-[8px] uppercase tracking-[2px] mb-2" style={{ color: 'rgba(248,250,252,0.18)' }}>Learning Mode</div>
          <div className="grid grid-cols-4 gap-1.5">
            {['architect', 'chef', 'researcher', 'voyager'].map(mid => {
              const Icon = MODALITY_ICONS[mid];
              const active = modality === mid;
              const colors = { architect: '#FBBF24', chef: '#EF4444', researcher: '#3B82F6', voyager: '#C084FC' };
              const labels = { architect: 'Architect', chef: 'Chef', researcher: 'Researcher', voyager: 'Voyager' };
              const frameworks = { architect: 'Gaming', chef: 'Applied', researcher: 'Analytical', voyager: 'Sensory' };
              return (
                <motion.button key={mid} whileTap={{ scale: 0.95 }} onClick={() => switchModality(mid)}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all"
                  style={{
                    background: active ? `${colors[mid]}08` : 'rgba(255,255,255,0.015)',
                    border: `1px solid ${active ? `${colors[mid]}20` : 'rgba(255,255,255,0.03)'}`,
                    cursor: 'pointer',
                  }} data-testid={`modality-${mid}`}>
                  <Icon size={16} style={{ color: active ? colors[mid] : 'rgba(255,255,255,0.6)' }} />
                  <span className="text-[9px] font-medium" style={{ color: active ? colors[mid] : 'rgba(255,255,255,0.65)' }}>{labels[mid]}</span>
                  <span className="text-[7px]" style={{ color: active ? `${colors[mid]}80` : 'rgba(248,250,252,0.15)' }}>{frameworks[mid]}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Accreditation Stats */}
        {accreditation && (
          <div className="grid grid-cols-4 gap-1.5 mb-4" data-testid="accreditation-stats">
            {[
              { label: 'Resonance', value: accreditation.resonance_score, color: '#C084FC', icon: Zap },
              { label: 'Focus', value: `${accreditation.total_focus_minutes}m`, color: '#3B82F6', icon: Clock },
              { label: 'Modules', value: `${accreditation.modules_completed}/${accreditation.modules_total}`, color: '#22C55E', icon: CheckCircle },
              { label: 'Certs', value: accreditation.programs_completed, color: '#FBBF24', icon: Award },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl p-2 text-center" style={{
                  background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)',
                }}>
                  <Icon size={12} style={{ color: s.color, margin: '0 auto 4px', opacity: 0.6 }} />
                  <div className="text-xs font-semibold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[7px] uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Zone Tabs */}
        <div className="flex gap-1.5 mb-4" data-testid="zone-tabs">
          <button onClick={() => setActiveZone(null)}
            className="text-[9px] px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{
              background: !activeZone ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.015)',
              color: !activeZone ? '#F8FAFC' : 'rgba(255,255,255,0.65)',
              border: `1px solid ${!activeZone ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}`,
              cursor: 'pointer',
            }} data-testid="zone-all">All</button>
          {zones.map(z => {
            const ZIcon = ZONE_ICONS[z.id] || BookMarked;
            const active = activeZone === z.id;
            return (
              <button key={z.id} onClick={() => setActiveZone(active ? null : z.id)}
                className="flex items-center gap-1.5 text-[9px] px-3 py-1.5 rounded-lg font-medium transition-all"
                style={{
                  background: active ? `${z.color}0A` : 'rgba(255,255,255,0.015)',
                  color: active ? z.color : 'rgba(255,255,255,0.65)',
                  border: `1px solid ${active ? `${z.color}18` : 'rgba(255,255,255,0.03)'}`,
                  cursor: 'pointer',
                }} data-testid={`zone-${z.id}`}>
                <ZIcon size={11} />
                {z.name}
              </button>
            );
          })}
        </div>

        {/* Programs — proximity-revealed */}
        <div className="space-y-3">
          {filteredPrograms.map((prog, pi) => {
            const isExpanded = expandedProgram === prog.id || expandedProgram === null;
            const zoneColor = prog.zone_data?.color || '#818CF8';
            return (
              <ProximityItem key={prog.id} index={pi} totalItems={filteredPrograms.length}>
                <div className="rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.015)',
                  border: `1px solid ${prog.completed ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.03)'}`,
                }} data-testid={`program-${prog.id}`}>
                <button className="w-full px-4 py-3 flex items-center justify-between text-left"
                  onClick={() => setExpandedProgram(expandedProgram === prog.id ? null : prog.id)}
                  style={{ cursor: 'pointer', borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 rounded-full" style={{ background: zoneColor, opacity: 0.6 }} />
                      <h3 className="text-xs font-semibold" style={{ color: prog.completed ? '#22C55E' : '#F8FAFC' }}>{prog.name}</h3>
                      {prog.completed && <CheckCircle size={12} style={{ color: '#22C55E' }} />}
                    </div>
                    <p className="text-[9px] mt-0.5 ml-3.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{prog.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <div className="text-right">
                      <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${prog.progress * 100}%`, background: prog.completed ? '#22C55E' : skinColor,
                        }} />
                      </div>
                      <span className="text-[8px]" style={{ color: prog.completed ? '#22C55E' : 'rgba(255,255,255,0.6)' }}>
                        {(prog.progress * 100).toFixed(0)}%
                      </span>
                    </div>
                    <ChevronRight size={14} style={{
                      color: 'rgba(248,250,252,0.15)',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }} />
                  </div>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-3 py-2 space-y-1">
                        {prog.modules.map((mod) => {
                          const Icon = TYPE_ICONS[mod.type] || BookOpen;
                          const typeColors = { lesson: skinColor, lab: '#22C55E', test: '#FBBF24' };
                          const typeColor = typeColors[mod.type] || skinColor;
                          return (
                            <motion.button key={mod.id} whileTap={{ scale: 0.98 }}
                              onClick={() => !mod.completed && beginModule(prog.id, mod)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left"
                              style={{
                                background: mod.completed ? 'rgba(34,197,94,0.03)' : mod.in_progress ? `${skinColor}05` : 'transparent',
                                border: `1px solid ${mod.completed ? 'rgba(34,197,94,0.06)' : mod.in_progress ? `${skinColor}10` : 'rgba(255,255,255,0.02)'}`,
                                cursor: mod.completed ? 'default' : 'pointer',
                                opacity: mod.completed ? 0.65 : 1,
                              }} data-testid={`module-${mod.id}`}>
                              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{
                                background: mod.completed ? 'rgba(34,197,94,0.08)' : `${typeColor}08`,
                              }}>
                                {mod.completed ? <CheckCircle size={11} style={{ color: '#22C55E' }} /> : <Icon size={11} style={{ color: typeColor }} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-medium truncate" style={{ color: mod.completed ? '#22C55E' : '#F8FAFC' }}>{mod.title}</div>
                                <div className="text-[8px] flex items-center gap-1.5 mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                  <span style={{ color: typeColor }}>{mod.display_label}</span>
                                  <span>{mod.duration_min}m</span>
                                  <span>{(mod.complexity * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                              {!mod.completed && <ChevronRight size={11} style={{ color: 'rgba(248,250,252,0.12)' }} />}
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </ProximityItem>
            );
          })}
        </div>

        {/* Certifications */}
        {accreditation?.certifications?.length > 0 && (
          <div className="mt-6" data-testid="cert-gallery">
            <div className="flex items-center gap-2 mb-3">
              <Award size={13} style={{ color: '#FBBF24' }} />
              <span className="text-xs font-medium" style={{ color: '#F8FAFC' }}>Fractal Certifications</span>
            </div>
            <div className="space-y-3">
              {accreditation.certifications.map(cert => (
                <FractalCertificate key={cert.id} seed={cert.fractal_seed} fingerprint={cert.fractal_fingerprint}
                  programName={cert.program_name} tier={cert.program_tier} issuedAt={cert.issued_at} />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {activeLesson && <LessonViewer content={activeLesson.content} modality={activeLesson.modality || modalityData}
          onClose={closeModals} onComplete={completeLesson} completing={completing} />}
      </AnimatePresence>
      <AnimatePresence>
        {activeForgeLab && <ForgeLab forgeData={activeForgeLab.forgeData} modality={modalityData}
          onClose={closeModals} onComplete={completeForge} completing={completing} result={forgeResult} />}
      </AnimatePresence>
    </div>
    </HolographicChamber>
  );
}
