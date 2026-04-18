import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Wand2, Save, Trash2, Play, ArrowLeft, Loader2, Wind, Flower2 } from 'lucide-react';
import { Slider } from '../components/ui/slider';
import { useAuth } from '../context/AuthContext';
import NarrationPlayer from '../components/NarrationPlayer';
import FeaturedVideos from '../components/FeaturedVideos';
import { ProximityItem } from '../components/SpatialRoom';
import { FlowerOfLife } from '../components/SacredGeometrySVG';
import { FIB_BREATH_CYCLE, FIB_BREATH_PHASES, FIB_BREATH_TOTAL, getFibBreathPhase } from '../lib/SacredGeometry';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PATTERNS = [
  { name: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4, color: '#2DD4BF', desc: 'Equal parts breathing for calm focus' },
  { name: '4-7-8 Relaxation', inhale: 4, hold1: 7, exhale: 8, hold2: 0, color: '#D8B4FE', desc: 'Deep relaxation and sleep preparation' },
  { name: 'Energizing Breath', inhale: 6, hold1: 0, exhale: 6, hold2: 0, color: '#FCD34D', desc: 'Rhythmic breathing for vitality' },
  { name: 'Wim Hof Style', inhale: 2, hold1: 0, exhale: 2, hold2: 0, color: '#FDA4AF', desc: 'Power breathing for energy activation' },
  { name: 'Pranayama Flow', inhale: 5, hold1: 5, exhale: 5, hold2: 5, color: '#86EFAC', desc: 'Yogic breathing for prana cultivation' },
];

const BUILD_COLORS = ['#2DD4BF', '#D8B4FE', '#FCD34D', '#FDA4AF', '#86EFAC', '#FB923C', '#3B82F6', '#E879F9'];

function BreathingEngine({ pattern, active, onCycleComplete }) {
  const [phase, setPhase] = useState('ready');
  const [scale, setScale] = useState(1);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);
  const phaseRef = useRef({ phase: 'inhale', remaining: 0 });

  const stop = useCallback(() => {
    setPhase('ready');
    setScale(1);
    setTimer(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const start = useCallback(() => {
    phaseRef.current = { phase: 'inhale', remaining: pattern.inhale };
    setPhase('Inhale');
    setTimer(pattern.inhale);

    intervalRef.current = setInterval(() => {
      phaseRef.current.remaining -= 1;
      setTimer(phaseRef.current.remaining);

      if (phaseRef.current.remaining <= 0) {
        const p = phaseRef.current.phase;
        if (p === 'inhale') {
          if (pattern.hold1 > 0) {
            phaseRef.current = { phase: 'hold1', remaining: pattern.hold1 };
            setPhase('Hold'); setTimer(pattern.hold1);
          } else {
            phaseRef.current = { phase: 'exhale', remaining: pattern.exhale };
            setPhase('Exhale'); setTimer(pattern.exhale);
          }
        } else if (p === 'hold1') {
          phaseRef.current = { phase: 'exhale', remaining: pattern.exhale };
          setPhase('Exhale'); setTimer(pattern.exhale);
        } else if (p === 'exhale') {
          if (pattern.hold2 > 0) {
            phaseRef.current = { phase: 'hold2', remaining: pattern.hold2 };
            setPhase('Hold'); setTimer(pattern.hold2);
          } else {
            phaseRef.current = { phase: 'inhale', remaining: pattern.inhale };
            setPhase('Inhale'); setTimer(pattern.inhale);
            onCycleComplete?.();
          }
        } else {
          phaseRef.current = { phase: 'inhale', remaining: pattern.inhale };
          setPhase('Inhale'); setTimer(pattern.inhale);
          onCycleComplete?.();
        }
      }
    }, 1000);
  }, [pattern, onCycleComplete]);

  useEffect(() => {
    if (active) start(); else stop();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, start, stop]);

  useEffect(() => {
    if (!active) return;
    const p = phaseRef.current.phase;
    if (p === 'inhale') setScale(1.6);
    else if (p === 'exhale') setScale(1);
  }, [phase, active]);

  return { phase: active ? phase : 'ready', scale, timer, phaseRef };
}

function BuildYourOwn({ onSelectPattern }) {
  const { user, authHeaders } = useAuth();
  const [name, setName] = useState('');
  const [inhale, setInhale] = useState(4);
  const [hold1, setHold1] = useState(4);
  const [exhale, setExhale] = useState(4);
  const [hold2, setHold2] = useState(0);
  const [color, setColor] = useState('#2DD4BF');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState([]);

  const loadSaved = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/breathing/my-custom`, { headers: authHeaders });
      setSaved(res.data);
    } catch {}
  }, [user, authHeaders]);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  const savePattern = async () => {
    if (!user) { toast.error('Sign in to save patterns'); return; }
    setSaving(true);
    try {
      const res = await axios.post(`${API}/breathing/save-custom`, {
        name: name || `Custom ${inhale}-${hold1}-${exhale}-${hold2}`,
        inhale, hold1, exhale, hold2, color, description: desc,
      }, { headers: authHeaders });
      setSaved(prev => [res.data, ...prev]);
      toast.success('Breathing pattern saved!');
      setName(''); setDesc('');
    } catch { toast.error('Could not save pattern'); }
    setSaving(false);
  };

  const deletePattern = async (id) => {
    try {
      await axios.delete(`${API}/breathing/custom/${id}`, { headers: authHeaders });
      setSaved(prev => prev.filter(s => s.id !== id));
      toast.success('Deleted');
    } catch {}
  };

  const playCustom = (p) => {
    onSelectPattern({
      name: p.name, inhale: p.inhale, hold1: p.hold1, exhale: p.exhale, hold2: p.hold2,
      color: p.color || '#2DD4BF', desc: p.description || 'Custom pattern',
    });
  };

  if (!user) return (
    <div className="p-12 text-center">
      <Wand2 size={32} style={{ color: 'rgba(45,212,191,0.3)', margin: '0 auto 12px' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to create and save custom breathing patterns.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {saved.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Your Saved Patterns</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {saved.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="p-5 group" data-testid={`saved-breathing-${s.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</h4>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {s.inhale}-{s.hold1}-{s.exhale}-{s.hold2}s
                    </p>
                  </div>
                  <button onClick={() => deletePattern(s.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    data-testid={`delete-breathing-${s.id}`}>
                    <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
                {s.description && <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>{s.description}</p>}
                <button onClick={() => playCustom(s)}
                  className="w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all"
                  style={{ background: `${s.color || '#2DD4BF'}12`, color: s.color || '#2DD4BF', border: `1px solid ${s.color || '#2DD4BF'}25` }}
                  data-testid={`play-breathing-${s.id}`}>
                  <Play size={12} fill={s.color || '#2DD4BF'} /> Use This Pattern
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full" style={{
          background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`, filter: 'blur(30px)',
        }} />
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6 relative z-10" style={{ color: 'var(--text-muted)' }}>
          Design Your Breathing Rhythm
        </p>

        <div className="space-y-6 relative z-10">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>
              Pattern Name (optional)
            </label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g., My Calm Down Pattern"
              className="input-glass w-full text-sm" data-testid="build-breathing-name" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Inhale', value: inhale, setter: setInhale, min: 1 },
              { label: 'Hold (In)', value: hold1, setter: setHold1, min: 0 },
              { label: 'Exhale', value: exhale, setter: setExhale, min: 1 },
              { label: 'Hold (Out)', value: hold2, setter: setHold2, min: 0 },
            ].map(s => (
              <div key={s.label}>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>
                  {s.label}
                </label>
                <p className="text-3xl font-light mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', color }}>
                  {s.value}<span className="text-sm ml-1">s</span>
                </p>
                <Slider
                  value={[s.value]} min={s.min} max={15} step={1}
                  onValueChange={([v]) => s.setter(v)}
                  className="w-full"
                  data-testid={`build-breathing-${s.label.toLowerCase().replace(/\s+/g, '-')}`}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total cycle:</span>
            <span className="text-sm font-medium" style={{ color }}>{inhale + hold1 + exhale + hold2}s</span>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
              {inhale}-{hold1}-{exhale}-{hold2}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>
              Description (optional)
            </label>
            <input value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="What is this pattern for?"
              className="input-glass w-full text-sm" data-testid="build-breathing-desc" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>Theme Color</label>
            <div className="flex gap-2">
              {BUILD_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{
                    background: c,
                    border: color === c ? '2px solid #fff' : '2px solid transparent',
                    boxShadow: color === c ? `0 0 12px ${c}60` : 'none',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                  data-testid={`build-breathing-color-${c}`} />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => playCustom({ name: name || 'Custom Pattern', inhale, hold1, exhale, hold2, color, description: desc })}
              className="btn-glass px-5 py-2 text-sm flex items-center gap-2"
              data-testid="build-breathing-play">
              <Play size={14} /> Try Now
            </button>
            <button onClick={savePattern} disabled={saving}
              className="btn-glass px-5 py-2 text-sm flex items-center gap-2"
              style={{ background: `${color}15`, borderColor: `${color}30`, color }}
              data-testid="build-breathing-save">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Pattern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ SACRED BREATH MODE — Fibonacci Flower of Life ═══
function SacredBreath() {
  const [active, setActive] = useState(false);
  const [breathState, setBreathState] = useState({ phase: 'rest', intensity: 0, progress: 0 });
  const [cycles, setCycles] = useState(0);
  const startRef = useRef(null);
  const intervalRef = useRef(null);

  const start = () => {
    setActive(true);
    setCycles(0);
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const state = getFibBreathPhase(elapsed);
      setBreathState(state);
      // Count completed cycles
      const cycleNum = Math.floor(elapsed / (FIB_BREATH_TOTAL * 1000));
      setCycles(cycleNum);
      if (typeof window.__workAccrue === 'function' && state.phase === 'rest' && state.progress < 0.1) {
        window.__workAccrue('sacred_breathing', 10);
      }
    }, 80);
  };

  const stop = () => {
    setActive(false);
    clearInterval(intervalRef.current);
    setBreathState({ phase: 'rest', intensity: 0, progress: 0 });
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const phaseColors = {
    'inhale': '#2DD4BF', 'hold': '#FCD34D', 'exhale': '#D8B4FE',
    'deep-inhale': '#22C55E', 'rest': 'rgba(255,255,255,0.3)',
  };
  const currentColor = phaseColors[breathState.phase] || phaseColors.rest;

  return (
    <div className="text-center" data-testid="sacred-breath-mode">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#22C55E' }}>
          Sacred Fibonacci Breath
        </p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Breathe with the Golden Ratio: 1, 1, 2, 3, 5 second phases
        </p>
      </div>

      {/* Flower of Life visual guide */}
      <div className="relative w-64 h-64 mx-auto mb-6 flex items-center justify-center">
        <motion.div
          animate={{ scale: 0.8 + breathState.intensity * 0.4 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <FlowerOfLife
            size={240}
            color={currentColor}
            opacity={active ? 0.3 + breathState.intensity * 0.4 : 0.1}
            level={active ? Math.ceil(breathState.intensity * 3) + 1 : 1}
            breathProgress={breathState.intensity}
          />
        </motion.div>

        {/* Phase label in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={breathState.phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-light capitalize"
            style={{ color: currentColor, fontFamily: 'Cormorant Garamond, serif' }}
          >
            {active ? breathState.phase.replace('-', ' ') : 'Ready'}
          </motion.span>
          {active && (
            <span className="text-[10px] font-mono mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {FIB_BREATH_CYCLE[breathState.index || 0]}s phase
            </span>
          )}
        </div>
      </div>

      {/* Fibonacci sequence visualization */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {FIB_BREATH_CYCLE.map((dur, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: 8 + dur * 5,
              height: 8 + dur * 5,
              background: active && breathState.index === i
                ? `${phaseColors[FIB_BREATH_PHASES[i]] || '#2DD4BF'}40`
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${active && breathState.index === i
                ? phaseColors[FIB_BREATH_PHASES[i]] || '#2DD4BF'
                : 'rgba(255,255,255,0.08)'}`,
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={active ? stop : start}
          className="px-6 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2"
          style={{
            background: active ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            border: `1px solid ${active ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
            color: active ? '#EF4444' : '#22C55E',
          }}
          data-testid="sacred-breath-toggle"
        >
          <Flower2 size={14} />
          {active ? 'End Sacred Breath' : 'Begin Sacred Breath'}
        </button>
      </div>

      {cycles > 0 && (
        <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {cycles} sacred cycle{cycles > 1 ? 's' : ''} completed ({cycles * 19}s total)
        </p>
      )}
    </div>
  );
}


export default function Breathing() {
  const [mode, setMode] = useState('presets');
  const [pattern, setPattern] = useState(PATTERNS[0]);
  const [active, setActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const engineRef = useRef(null);
  const [phase, setPhase] = useState('ready');
  const [scale, setScale] = useState(1);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);
  const phaseRef = useRef({ phase: 'inhale', remaining: 0 });

  const stop = useCallback(() => {
    setActive(false);
    setPhase('ready');
    setScale(1);
    setTimer(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const start = useCallback(() => {
    setActive(true);
    setCycles(0);
    phaseRef.current = { phase: 'inhale', remaining: pattern.inhale };
    setPhase('Inhale');
    setTimer(pattern.inhale);

    intervalRef.current = setInterval(() => {
      phaseRef.current.remaining -= 1;
      setTimer(phaseRef.current.remaining);

      if (phaseRef.current.remaining <= 0) {
        const p = phaseRef.current.phase;
        if (p === 'inhale') {
          if (pattern.hold1 > 0) {
            phaseRef.current = { phase: 'hold1', remaining: pattern.hold1 };
            setPhase('Hold'); setTimer(pattern.hold1);
          } else {
            phaseRef.current = { phase: 'exhale', remaining: pattern.exhale };
            setPhase('Exhale'); setTimer(pattern.exhale);
          }
        } else if (p === 'hold1') {
          phaseRef.current = { phase: 'exhale', remaining: pattern.exhale };
          setPhase('Exhale'); setTimer(pattern.exhale);
        } else if (p === 'exhale') {
          if (pattern.hold2 > 0) {
            phaseRef.current = { phase: 'hold2', remaining: pattern.hold2 };
            setPhase('Hold'); setTimer(pattern.hold2);
          } else {
            phaseRef.current = { phase: 'inhale', remaining: pattern.inhale };
            setPhase('Inhale'); setTimer(pattern.inhale);
            setCycles(c => c + 1);
            // Silent dust accrual per breathing cycle
            if (typeof window.__workAccrue === 'function') window.__workAccrue('breathing_exercise', 7);
          }
        } else {
          phaseRef.current = { phase: 'inhale', remaining: pattern.inhale };
          setPhase('Inhale'); setTimer(pattern.inhale);
          setCycles(c => c + 1);
          if (typeof window.__workAccrue === 'function') window.__workAccrue('breathing_exercise', 7);
        }
      }
    }, 1000);
  }, [pattern]);

  useEffect(() => {
    if (!active) return;
    const p = phaseRef.current.phase;
    if (p === 'inhale') setScale(1.6);
    else if (p === 'exhale') setScale(1);
  }, [phase, active]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const handleSelectFromBuild = (p) => {
    stop();
    setPattern(p);
    setMode('presets');
  };

  return (
    <div className="min-h-screen pt-20 pb-24 px-5 max-w-3xl mx-auto" style={{ background: 'transparent' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Wind size={14} style={{ color: '#2DD4BF' }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#2DD4BF' }}>Breathwork</p>
        </div>
        <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
          Conscious Breathing
        </h1>

        

        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Follow the rhythm. Let each breath expand your awareness.
        </p>
      </motion.div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-8 flex-wrap" data-testid="breathing-mode-toggle">
          {[
            { id: 'presets', label: 'Breathing Patterns' },
            { id: 'sacred', label: 'Sacred Breath' },
            { id: 'build', label: 'Build Your Own' },
          ].map(m => (
            <button key={m.id} onClick={() => { if (active) stop(); setMode(m.id); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
              style={{
                background: mode === m.id ? (m.id === 'sacred' ? 'rgba(34,197,94,0.12)' : 'rgba(45,212,191,0.12)') : 'rgba(255,255,255,0.02)',
                color: mode === m.id ? (m.id === 'sacred' ? '#22C55E' : '#2DD4BF') : 'var(--text-muted)',
                border: `1px solid ${mode === m.id ? (m.id === 'sacred' ? 'rgba(34,197,94,0.3)' : 'rgba(45,212,191,0.3)') : 'rgba(255,255,255,0.06)'}`,
              }}
              data-testid={`breathing-mode-${m.id}`}>
              {m.id === 'build' && <Wand2 size={14} />}
              {m.id === 'sacred' && <Flower2 size={14} />}
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'sacred' ? (
          <SacredBreath />
        ) : mode === 'build' ? (
          <BuildYourOwn onSelectPattern={handleSelectFromBuild} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Pattern Selector */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Choose Pattern</p>
              {PATTERNS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => { if (!active) setPattern(p); }}
                  className="w-full text-left p-4 flex items-center gap-4"
                  style={{
                    borderColor: pattern.name === p.name ? `${p.color}40` : 'rgba(255,255,255,0.08)',
                    opacity: active && pattern.name !== p.name ? 0.4 : 1,
                    transition: 'opacity 0.3s, border-color 0.3s',
                  }}
                  data-testid={`breathing-pattern-${p.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
                  </div>
                </button>
              ))}
              <div className="p-4 mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Rhythm</p>
                <div className="flex gap-3 text-center">
                  {[{ l: 'In', v: pattern.inhale }, { l: 'Hold', v: pattern.hold1 }, { l: 'Out', v: pattern.exhale }, { l: 'Hold', v: pattern.hold2 }].map((s, i) => (
                    <div key={`${s.l}-${i}`} className="flex-1">
                      <p className="text-2xl font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>{s.v}s</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Breathing Circle — Enhanced Immersive */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[500px]">
              <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center mb-12">
                {/* Outer aura glow */}
                <motion.div className="absolute rounded-full" style={{ width: '130%', height: '130%' }}
                  animate={{ opacity: active ? [0.1, 0.2, 0.1] : 0.05, scale: active ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 5, repeat: Infinity }}>
                  <div className="w-full h-full rounded-full"
                    style={{ background: `radial-gradient(circle, ${pattern.color}08 0%, transparent 70%)`, filter: 'blur(30px)' }} />
                </motion.div>
                {/* Pulsing rings with color dynamics */}
                {[0.15, 0.25, 0.4, 0.6, 0.8].map((opacity, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: `${50 + i * 16}%`,
                      height: `${50 + i * 16}%`,
                      background: `radial-gradient(circle, ${pattern.color}${Math.round(opacity * 30).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
                      border: `1px solid ${pattern.color}${Math.round(opacity * 22).toString(16).padStart(2, '0')}`,
                      boxShadow: active ? `0 0 ${12 + i * 6}px ${pattern.color}${Math.round(opacity * 8).toString(16).padStart(2, '0')}` : 'none',
                      transform: `scale(${scale})`,
                      transition: `transform ${phaseRef.current.phase === 'inhale' ? pattern.inhale : phaseRef.current.phase === 'exhale' ? pattern.exhale : 0.3}s ease-in-out, box-shadow 0.5s ease`,
                    }}
                  />
                ))}
                {/* Orbital particles */}
                {active && Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const radius = 42;
                  return (
                    <motion.div key={i} className="absolute rounded-full"
                      style={{
                        width: 3, height: 3, background: pattern.color,
                        left: `calc(50% + ${Math.cos(angle) * radius}%)`,
                        top: `calc(50% + ${Math.sin(angle) * radius}%)`,
                        boxShadow: `0 0 6px ${pattern.color}60`,
                      }}
                      animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.6, 1.3, 0.6] }}
                      transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
                    />
                  );
                })}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={active ? stop : start}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (active ? stop : start)(); } }}
                  className="relative z-10 flex flex-col items-center justify-center cursor-pointer active:scale-[0.97] transition-transform"
                  style={{
                    width: '120px', height: '120px', borderRadius: '50%',
                    background: `radial-gradient(circle, ${pattern.color}50 0%, ${pattern.color}15 70%)`,
                    boxShadow: `0 0 60px ${pattern.color}30, inset 0 0 30px ${pattern.color}10`,
                    transform: `scale(${scale})`,
                    transition: `transform ${phaseRef.current.phase === 'inhale' ? pattern.inhale : phaseRef.current.phase === 'exhale' ? pattern.exhale : 0.3}s ease-in-out`,
                  }}
                  data-testid="breath-orb-tap"
                  aria-label={active ? 'Stop breathwork' : 'Start breathwork'}
                >
                  <p className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                    {active ? timer : ''}
                  </p>
                  <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                    {active ? phase : 'Tap to Begin'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button
                  onClick={active ? stop : start}
                  className="btn-glass px-10 py-4 text-lg"
                  style={{ boxShadow: active ? `0 0 40px ${pattern.color}20` : undefined }}
                  data-testid="breathing-toggle-btn"
                >
                  {active ? 'Stop' : 'Begin Breathwork'}
                </button>
              </div>
              <div className="mt-6">
                <NarrationPlayer
                  text={`Welcome to ${pattern.name} practice. ${pattern.desc}. When you're ready, inhale slowly through your nose for ${pattern.inhale} seconds. ${pattern.hold1 > 0 ? `Hold your breath gently for ${pattern.hold1} seconds.` : ''} Then exhale smoothly for ${pattern.exhale} seconds. ${pattern.hold2 > 0 ? `Hold empty for ${pattern.hold2} seconds.` : ''} Repeat this cycle, finding your natural rhythm. Let each breath draw you deeper into stillness. Your body knows how to breathe. Simply observe and follow.`}
                  label="Guided Voice"
                  color={pattern.color}
                  context="breathing"
                />
              </div>
              {cycles > 0 && (
                <p className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {cycles} cycle{cycles > 1 ? 's' : ''} completed
                </p>
              )}
            </div>
          </div>
        )}
        <FeaturedVideos category="breathwork" color="#2DD4BF" title="Breathing Practice Videos" />
    </div>
  );
}
