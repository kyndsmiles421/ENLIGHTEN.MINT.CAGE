import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Play, Pause, RotateCcw, Wand2, Save, Trash2, Loader2, Info, X } from 'lucide-react';
import { Slider } from '../components/ui/slider';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import NarrationPlayer from '../components/NarrationPlayer';
import DeepDive from '../components/DeepDive';
import GuidedExperience from '../components/GuidedExperience';
import CelebrationBurst from '../components/CelebrationBurst';
import FeaturedVideos from '../components/FeaturedVideos';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  { id: 'all', label: 'All Mantras' },
  { id: 'meditation', label: 'Meditation' },
  { id: 'compassion', label: 'Compassion' },
  { id: 'devotion', label: 'Devotion' },
  { id: 'healing', label: 'Healing' },
  { id: 'peace', label: 'Peace' },
  { id: 'illumination', label: 'Illumination' },
];

const AMBIENT_SOUNDS = [
  { name: 'Silence', id: 'silence' },
  { name: 'Singing Bowls', id: 'bowls' },
  { name: 'Ocean', id: 'ocean' },
  { name: 'Forest', id: 'forest' },
  { name: 'Wind', id: 'wind' },
];

const BUILD_COLORS = ['#FCD34D', '#D8B4FE', '#2DD4BF', '#FDA4AF', '#86EFAC', '#FB923C', '#3B82F6', '#E879F9'];
const REP_PRESETS = [11, 27, 54, 108, 216, 540, 1008];

function createNoiseBuffer(ctx, seconds = 2) {
  const size = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function startAmbientSound(audioCtx, soundId) {
  const nodes = [];
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.connect(audioCtx.destination);
  nodes.push(gain);
  if (soundId === 'bowls') {
    [528, 396, 639].forEach((f, i) => {
      const osc = audioCtx.createOscillator(); osc.type = 'sine'; osc.frequency.value = f;
      const g = audioCtx.createGain(); g.gain.value = 0.04;
      const l = audioCtx.createOscillator(); l.frequency.value = 0.2 + i * 0.1;
      const lg = audioCtx.createGain(); lg.gain.value = 0.02;
      l.connect(lg); lg.connect(g.gain); osc.connect(g); g.connect(audioCtx.destination);
      osc.start(); l.start(); nodes.push(osc, l);
    });
  } else if (soundId === 'ocean') {
    const buf = createNoiseBuffer(audioCtx, 4);
    const src = audioCtx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
    src.connect(lp); lp.connect(gain); gain.gain.value = 0.1;
    src.start(); nodes.push(src);
  } else if (soundId === 'forest') {
    const buf = createNoiseBuffer(audioCtx, 2);
    const src = audioCtx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = audioCtx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3000; bp.Q.value = 2;
    src.connect(bp); bp.connect(gain); gain.gain.value = 0.04; src.start(); nodes.push(src);
  } else if (soundId === 'wind') {
    const buf = createNoiseBuffer(audioCtx, 3);
    const src = audioCtx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = audioCtx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 0.5;
    src.connect(bp); bp.connect(gain); gain.gain.value = 0.08; src.start(); nodes.push(src);
  }
  return nodes;
}

/* ====== MANTRA PRACTICE SESSION ====== */
function MantraSession({ mantra, targetReps, soundId, onEnd }) {
  const [count, setCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef([]);
  const { playCelebration } = useSensory();

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('mantras', 8); }, []);
  useEffect(() => {
    if (soundId && soundId !== 'silence') {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;
        nodesRef.current = startAmbientSound(ctx, soundId);
      } catch {}
    }
    return () => {
      nodesRef.current.forEach(n => { try { n.stop?.(); } catch {} });
      try { audioCtxRef.current?.close(); } catch {};
    };
  }, [soundId]);

  const increment = () => {
    if (paused) return;
    const next = count + 1;
    setCount(next);
    if (targetReps > 0 && next >= targetReps) {
      playCelebration();
      setCelebrating(true);
    }
  };

  const progress = targetReps > 0 ? Math.min(1, count / targetReps) : 0;
  const circumference = 2 * Math.PI * 120;
  const color = mantra.color || '#FCD34D';

  // Mala bead positions — 27 beads in a quarter
  const beadCount = Math.min(108, targetReps || 108);
  const beadsCompleted = count % beadCount;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{ background: 'transparent' }}
      data-testid="mantra-session">
      <CelebrationBurst active={celebrating} onComplete={() => { setCelebrating(false); onEnd(); }} />

      <motion.div className="absolute inset-0"
        animate={{ background: [
          `radial-gradient(ellipse at 40% 40%, ${color}08 0%, transparent 60%)`,
          `radial-gradient(ellipse at 60% 60%, ${color}12 0%, transparent 60%)`,
          `radial-gradient(ellipse at 40% 40%, ${color}08 0%, transparent 60%)`,
        ] }}
        transition={{ duration: 10, repeat: Infinity }} />

      {/* Progress ring */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-6">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 260 260">
          <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
          {targetReps > 0 && (
            <circle cx="130" cy="130" r="120" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }} opacity="0.6" />
          )}
        </svg>
        {/* Clickable center */}
        <button
          onClick={increment}
          className="relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center transition-transform active:scale-95"
          style={{ background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`, border: `1px solid ${color}15` }}
          data-testid="mantra-tap-btn">
          <p className="text-5xl font-light tabular-nums" style={{ fontFamily: 'Cormorant Garamond, serif', color }}>
            {count}
          </p>
          <p className="text-xs uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {targetReps > 0 ? `of ${targetReps}` : 'repetitions'}
          </p>
        </button>
      </div>

      {/* Sanskrit */}
      {mantra.sanskrit && (
        <p className="text-3xl mb-2 relative z-10" style={{ color: `${color}80`, fontFamily: 'serif' }}>
          {mantra.sanskrit}
        </p>
      )}

      {/* Mantra text */}
      <motion.p
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="text-xl md:text-2xl font-light text-center max-w-lg relative z-10 mb-2"
        style={{ fontFamily: 'Cormorant Garamond, serif', color: 'rgba(248,250,252,0.8)' }}
        data-testid="mantra-session-text">
        {mantra.text}
      </motion.p>
      <p className="text-xs mb-6 relative z-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Tap the circle with each repetition
      </p>

      {/* Mala beads visualization */}
      <div className="flex flex-wrap justify-center gap-1 max-w-xs mb-6 relative z-10">
        {Array.from({ length: Math.min(27, targetReps || 27) }).map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i < (beadsCompleted % 27) ? color : 'rgba(255,255,255,0.06)',
              boxShadow: i < (beadsCompleted % 27) ? `0 0 4px ${color}60` : 'none',
            }} />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 relative z-10">
        <button onClick={() => setPaused(!paused)} className="p-3 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }} data-testid="mantra-pause">
          {paused ? <Play size={20} /> : <Pause size={20} />}
        </button>
        <button onClick={() => setCount(0)} className="p-3 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }} data-testid="mantra-reset">
          <RotateCcw size={18} />
        </button>
        <button onClick={onEnd} className="px-5 py-2 rounded-full text-sm"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }} data-testid="mantra-end">
          End Session
        </button>
      </div>

      {/* Narration */}
      <div className="mt-4 relative z-10">
        <NarrationPlayer
          text={`${mantra.text}. ${mantra.meaning || ''}`}
          label="Chant Guide" color={color} context="mantras" />
      </div>
    </motion.div>
  );
}

/* ====== BUILD YOUR OWN ====== */
function BuildYourOwn({ onStartPractice }) {
  const { user, authHeaders } = useAuth();
  const [mantraText, setMantraText] = useState('');
  const [meaning, setMeaning] = useState('');
  const [name, setName] = useState('');
  const [reps, setReps] = useState(108);
  const [sound, setSound] = useState('bowls');
  const [color, setColor] = useState('#FCD34D');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState([]);

  const loadSaved = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/mantras/my-custom`, { headers: authHeaders });
      setSaved(res.data);
    } catch {}
  }, [user, authHeaders]);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  const saveMantra = async () => {
    if (!mantraText.trim()) { toast.error('Enter your mantra text'); return; }
    if (!user) { toast.error('Sign in to save'); return; }
    setSaving(true);
    try {
      const res = await axios.post(`${API}/mantras/save-custom`, {
        name: name || mantraText.substring(0, 30),
        mantra_text: mantraText, meaning, repetitions: reps, sound, color,
      }, { headers: authHeaders });
      setSaved(prev => [res.data, ...prev]);
      toast.success('Mantra practice saved!');
      setName(''); setMantraText(''); setMeaning('');
    } catch { toast.error('Could not save'); }
    setSaving(false);
  };

  const deleteMantra = async (id) => {
    try {
      await axios.delete(`${API}/mantras/custom/${id}`, { headers: authHeaders });
      setSaved(prev => prev.filter(s => s.id !== id));
      toast.success('Deleted');
    } catch {}
  };

  const playSaved = (s) => {
    onStartPractice({
      text: s.mantra_text, name: s.name, meaning: s.meaning,
      color: s.color || '#FCD34D', sanskrit: '',
    }, s.repetitions, s.sound);
  };

  if (!user) return (
    <div className="glass-card p-12 text-center">
      <Wand2 size={32} style={{ color: 'rgba(252,211,77,0.3)', margin: '0 auto 12px' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to create custom mantra practices.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {saved.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Your Custom Mantras</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {saved.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="glass-card p-5 group" data-testid={`saved-mantra-${s.id}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</h4>
                  <button onClick={() => deleteMantra(s.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
                <p className="text-xs mb-1" style={{ color: s.color || '#FCD34D' }}>{s.mantra_text}</p>
                <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>{s.repetitions} reps</p>
                <button onClick={() => playSaved(s)}
                  className="w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2"
                  style={{ background: `${s.color || '#FCD34D'}12`, color: s.color || '#FCD34D', border: `1px solid ${s.color || '#FCD34D'}25` }}
                  data-testid={`play-custom-mantra-${s.id}`}>
                  <Play size={12} fill={s.color || '#FCD34D'} /> Begin Practice
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full" style={{
          background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`, filter: 'blur(30px)',
        }} />
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6 relative z-10" style={{ color: 'var(--text-muted)' }}>
          Create Your Mantra Practice
        </p>
        <div className="space-y-5 relative z-10">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--text-muted)' }}>Mantra Text</label>
            <input value={mantraText} onChange={e => setMantraText(e.target.value)}
              placeholder="e.g., Om Namah Shivaya, I am peace, I am light..."
              className="input-glass w-full text-sm" data-testid="build-mantra-text" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--text-muted)' }}>Name (optional)</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="My Mantra"
                className="input-glass w-full text-sm" data-testid="build-mantra-name" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--text-muted)' }}>Meaning (optional)</label>
              <input value={meaning} onChange={e => setMeaning(e.target.value)} placeholder="What it means to you..."
                className="input-glass w-full text-sm" data-testid="build-mantra-meaning" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>Repetitions</label>
            <div className="flex flex-wrap gap-2">
              {REP_PRESETS.map(r => (
                <button key={r} onClick={() => setReps(r)}
                  className="px-3 py-1.5 rounded-xl text-xs transition-all"
                  style={{
                    background: reps === r ? `${color}15` : 'rgba(255,255,255,0.02)',
                    color: reps === r ? color : 'var(--text-muted)',
                    border: `1px solid ${reps === r ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
                  }}
                  data-testid={`build-mantra-reps-${r}`}>{r}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>Ambient Sound</label>
            <div className="flex flex-wrap gap-2">
              {AMBIENT_SOUNDS.map(s => (
                <button key={s.id} onClick={() => setSound(s.id)}
                  className="px-3 py-1.5 rounded-xl text-xs transition-all"
                  style={{
                    background: sound === s.id ? `${color}15` : 'rgba(255,255,255,0.02)',
                    color: sound === s.id ? color : 'var(--text-muted)',
                    border: `1px solid ${sound === s.id ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
                  }}>{s.name}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>Theme Color</label>
            <div className="flex gap-2">
              {BUILD_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-full transition-all"
                  style={{ background: c, border: color === c ? '2px solid #fff' : '2px solid transparent', transform: color === c ? 'scale(1.15)' : 'scale(1)' }} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={() => { if (!mantraText.trim()) { toast.error('Enter mantra text'); return; } onStartPractice({ text: mantraText, name: name || mantraText.substring(0, 30), meaning, color, sanskrit: '' }, reps, sound); }}
              className="btn-glass px-5 py-2 text-sm flex items-center gap-2" data-testid="build-mantra-play">
              <Play size={14} /> Practice Now
            </button>
            <button onClick={saveMantra} disabled={saving}
              className="btn-glass px-5 py-2 text-sm flex items-center gap-2"
              style={{ background: `${color}15`, borderColor: `${color}30`, color }}
              data-testid="build-mantra-save">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== MAIN PAGE ====== */
export default function Mantras() {
  const [mode, setMode] = useState('library');
  const [mantras, setMantras] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionReps, setSessionReps] = useState(108);
  const [sessionSound, setSessionSound] = useState('bowls');

  useEffect(() => {
    axios.get(`${API}/mantras/library`)
      .then(res => setMantras(res.data))
      .catch(() => toast.error('Could not load mantras'));
  }, []);

  const filtered = filter === 'all' ? mantras : mantras.filter(m => m.category === filter);

  const startPractice = (mantra, reps, sound) => {
    setSessionReps(reps || mantra.recommended_reps || 108);
    setSessionSound(sound || 'bowls');
    setActiveSession(mantra);
  };

  return (
    <div className="min-h-screen immersive-page px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#FCD34D' }}>Sacred Mantras</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            The Power of Sound
          </h1>
          <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
            Ancient vibrations that transform consciousness. Chant, listen, and let the mantra carry you inward.
          </p>
        </motion.div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-8 flex-wrap" data-testid="mantra-mode-toggle">
          {[
            { id: 'library', label: 'Mantra Library' },
            { id: 'build', label: 'Build Your Own' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
              style={{
                background: mode === m.id ? 'rgba(252,211,77,0.12)' : 'rgba(255,255,255,0.02)',
                color: mode === m.id ? '#FCD34D' : 'var(--text-muted)',
                border: `1px solid ${mode === m.id ? 'rgba(252,211,77,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}
              data-testid={`mantra-mode-${m.id}`}>
              {m.id === 'build' && <Wand2 size={14} />} {m.label}
            </button>
          ))}
        </div>

        {mode === 'build' ? (
          <BuildYourOwn onStartPractice={startPractice} />
        ) : (
          <>
            {/* Category Filters */}
            <div className="flex gap-2 mb-8 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => { setFilter(c.id); setSelected(null); }}
                  className="px-4 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    background: filter === c.id ? 'rgba(252,211,77,0.1)' : 'rgba(255,255,255,0.02)',
                    color: filter === c.id ? '#FCD34D' : 'var(--text-muted)',
                    border: `1px solid ${filter === c.id ? 'rgba(252,211,77,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                  data-testid={`mantra-filter-${c.id}`}>
                  {c.label}
                </button>
              ))}
            </div>

            {/* Mantra Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
              {filtered.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="glass-card glass-card-hover p-6 cursor-pointer group"
                  onClick={() => setSelected(selected?.id === m.id ? null : m)}
                  data-testid={`mantra-card-${m.id}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ background: `${m.color}12` }}>
                      <span className="text-lg" style={{ fontFamily: 'serif', color: m.color }}>{m.sanskrit?.substring(0, 2) || 'ॐ'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{m.name}</h3>
                      <p className="text-sm mb-2" style={{ color: m.color, fontFamily: 'Cormorant Garamond, serif' }}>{m.text}</p>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{m.meaning}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full capitalize" style={{ background: `${m.color}10`, color: m.color }}>{m.category}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>{m.chakra}</span>
                        {m.recommended_reps > 0 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>{m.recommended_reps} reps</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Selected Detail Panel */}
            <AnimatePresence>
              {selected && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-8 md:p-10 mb-12">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{selected.name}</h2>
                      {selected.sanskrit && <p className="text-xl mb-2" style={{ color: `${selected.color}80`, fontFamily: 'serif' }}>{selected.sanskrit}</p>}
                      <p className="text-base font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: selected.color }}>{selected.text}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="p-2 rounded-full" style={{ color: 'var(--text-muted)' }}>
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Pronunciation</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selected.pronunciation}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Tradition</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selected.tradition}</p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{selected.meaning}</p>

                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Practice Tips</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selected.practice_tips}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selected.benefits.map(b => (
                      <span key={b} className="text-xs px-3 py-1 rounded-full" style={{ background: `${selected.color}10`, color: selected.color, border: `1px solid ${selected.color}20` }}>
                        {b}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={() => startPractice(selected, selected.recommended_reps, 'bowls')}
                      className="btn-glass px-6 py-3 text-sm flex items-center gap-2"
                      style={{ background: `${selected.color}12`, borderColor: `${selected.color}30`, color: selected.color }}
                      data-testid="mantra-begin-practice">
                      <Play size={14} fill={selected.color} /> Begin Practice ({selected.recommended_reps || '∞'} reps)
                    </button>
                    <NarrationPlayer
                      text={`${selected.name}. ${selected.pronunciation}. ${selected.meaning}. ${selected.practice_tips}`}
                      label="Learn Pronunciation" color={selected.color} context="mantras" />
                    <GuidedExperience
                      practiceName={selected.name}
                      description={`${selected.meaning}. ${selected.practice_tips}`}
                      instructions={[
                        `Sit comfortably. Close your eyes and take three deep breaths.`,
                        `The mantra is: ${selected.name}, pronounced as ${selected.pronunciation}.`,
                        `Begin chanting slowly. Feel the vibration of each syllable.`,
                        `Continue for ${selected.recommended_reps || 108} repetitions, deepening with each round.`,
                        `Let the mantra become effortless. It chants itself through you.`,
                      ]}
                      category="mantra"
                      color={selected.color}
                      durationMinutes={8}
                    />
                    <DeepDive topic={`${selected.name} mantra`} category="general" color={selected.color} label="AI Deep Dive" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <FeaturedVideos category="mantra" color="#FCD34D" title="Mantra Chanting Videos" />
      </div>

      {/* Practice Session Overlay */}
      <AnimatePresence>
        {activeSession && (
          <MantraSession
            mantra={activeSession}
            targetReps={sessionReps}
            soundId={sessionSound}
            onEnd={() => setActiveSession(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
