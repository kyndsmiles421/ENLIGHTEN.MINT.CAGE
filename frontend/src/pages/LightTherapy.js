import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Waves, Heart, Zap, Eye, Sparkles, Play, Pause, Clock, Volume2, VolumeX, Image as ImageIcon, Loader } from 'lucide-react';
import { useSensory } from '../context/SensoryContext';
import SceneGenerator from '../components/SceneGenerator';

/* ── Scene Override: Pure black canvas, no realm tinting ── */
function useLightTherapyOverride() {
  useEffect(() => {
    const wasSceneActive = document.body.classList.contains('scene-active');
    document.body.classList.remove('scene-active');
    const sceneBg = document.querySelector('[data-testid="realm-scene-bg"]');
    if (sceneBg) sceneBg.style.display = 'none';
    const sceneOverride = document.getElementById('scene-override-styles');
    const savedCSS = sceneOverride?.textContent;
    if (sceneOverride) sceneOverride.textContent = '';
    return () => {
      if (wasSceneActive) document.body.classList.add('scene-active');
      if (sceneBg) sceneBg.style.display = '';
      if (sceneOverride && savedCSS) sceneOverride.textContent = savedCSS;
    };
  }, []);
}

/* ── Chromatic Spectrum ─────────────────────────────────── */
const COLORS = [
  {
    id: 'red', name: 'Red — Vitality', hex: '#EF4444', glow: 'rgba(239,68,68,0.4)',
    icon: Zap, chakra: 'Root Chakra (Muladhara)', hz: 256,
    benefits: ['Increases energy and vitality', 'Stimulates circulation', 'Grounds and stabilizes', 'Boosts courage and confidence'],
    description: 'Red light activates your root chakra, igniting primal life force energy. It stimulates blood flow, warms the body, and helps overcome lethargy and fatigue.',
    frequency: '430 THz', wavelength: '700 nm',
  },
  {
    id: 'orange', name: 'Orange — Creativity', hex: '#FB923C', glow: 'rgba(251,146,60,0.4)',
    icon: Sparkles, chakra: 'Sacral Chakra (Svadhisthana)', hz: 288,
    benefits: ['Sparks creativity and joy', 'Enhances emotional balance', 'Supports digestive health', 'Releases emotional blockages'],
    description: 'Orange light awakens your creative center. It dissolves emotional blocks, encourages playfulness, and helps process and release stored emotions.',
    frequency: '480 THz', wavelength: '620 nm',
  },
  {
    id: 'yellow', name: 'Yellow — Clarity', hex: '#FCD34D', glow: 'rgba(252,211,77,0.4)',
    icon: Sun, chakra: 'Solar Plexus Chakra (Manipura)', hz: 320,
    benefits: ['Sharpens mental clarity', 'Boosts self-confidence', 'Enhances learning and focus', 'Activates personal willpower'],
    description: 'Yellow light empowers your solar plexus, the seat of personal power and intellectual clarity. It aids concentration, dispels mental fog, and cultivates inner strength.',
    frequency: '510 THz', wavelength: '580 nm',
  },
  {
    id: 'green', name: 'Green — Healing', hex: '#22C55E', glow: 'rgba(34,197,94,0.4)',
    icon: Heart, chakra: 'Heart Chakra (Anahata)', hz: 341,
    benefits: ['Promotes deep healing', 'Balances the nervous system', 'Soothes and calms the heart', 'Harmonizes body and mind'],
    description: 'Green light is the color of nature and the heart chakra. It brings balance to all systems, encourages healing, soothes inflammation, and opens the heart to compassion.',
    frequency: '550 THz', wavelength: '540 nm',
  },
  {
    id: 'blue', name: 'Blue — Serenity', hex: '#3B82F6', glow: 'rgba(59,130,246,0.4)',
    icon: Waves, chakra: 'Throat Chakra (Vishuddha)', hz: 384,
    benefits: ['Deeply calms and relaxes', 'Reduces anxiety and stress', 'Lowers blood pressure', 'Promotes truthful expression'],
    description: 'Blue light activates the parasympathetic nervous system, inducing deep calm. It soothes the mind, eases tension, and opens the throat chakra for clear communication.',
    frequency: '610 THz', wavelength: '490 nm',
  },
  {
    id: 'indigo', name: 'Indigo — Intuition', hex: '#6366F1', glow: 'rgba(99,102,241,0.4)',
    icon: Eye, chakra: 'Third Eye Chakra (Ajna)', hz: 426,
    benefits: ['Heightens intuition', 'Enhances visualization', 'Supports lucid dreaming', 'Deepens meditation'],
    description: 'Indigo light stimulates the pineal gland and third eye chakra. It enhances inner vision, deepens meditative states, and strengthens your connection to intuitive wisdom.',
    frequency: '670 THz', wavelength: '450 nm',
  },
  {
    id: 'violet', name: 'Violet — Transcendence', hex: '#A855F7', glow: 'rgba(168,85,247,0.4)',
    icon: Moon, chakra: 'Crown Chakra (Sahasrara)', hz: 480,
    benefits: ['Expands consciousness', 'Purifies thoughts', 'Supports spiritual awakening', 'Promotes deep peace'],
    description: 'Violet light connects you to the crown chakra and higher consciousness. It purifies the mind, transmutes negative energy, and opens pathways to spiritual awareness.',
    frequency: '700 THz', wavelength: '400 nm',
  },
];

const MAX_BLEND = 3;
const DURATIONS = [3, 5, 10, 15, 20];
const GRAD_ORIGINS = ['50% 35%', '28% 65%', '72% 60%'];

/* ── Utilities ──────────────────────────────────────────── */
function blendHex(colors) {
  if (!colors.length) return '#000000';
  if (colors.length === 1) return colors[0].hex;
  let r = 0, g = 0, b = 0;
  colors.forEach(c => {
    const h = c.hex.replace('#', '');
    r += parseInt(h.substring(0, 2), 16);
    g += parseInt(h.substring(2, 4), 16);
    b += parseInt(h.substring(4, 6), 16);
  });
  const n = colors.length;
  const toH = v => Math.round(v / n).toString(16).padStart(2, '0');
  return `#${toH(r)}${toH(g)}${toH(b)}`;
}

function hexToGlow(hex, alpha = 0.4) {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.substring(0,2),16)},${parseInt(h.substring(2,4),16)},${parseInt(h.substring(4,6),16)},${alpha})`;
}

/* ── Resonance Name Engine (φ-Seeded) ───────────────────── */
const PHI = 1.618033988749895;
const RESONANCE_STYLES = {
  lakota: {
    label: 'Lakota Sky',
    first: ['Cansasa', 'Keya', 'Wicapi', 'Tatanka', 'Maka', 'Wakan', 'Takoja', 'Anpo', 'Mahpiya', 'Canku', 'Wanbli', 'Zitkala', 'Hanwi', 'Tunkasila', 'Sinte'],
    second: ['Ember', 'Jade', 'Aurora', 'Stone', 'Horizon', 'Bloom', 'Drift', 'Echo', 'Flame', 'Crown', 'Pulse', 'Veil', 'Dawn', 'Root', 'Spiral'],
  },
  mineral: {
    label: 'Mineral',
    first: ['Obsidian', 'Solar', 'Lunar', 'Crystal', 'Amber', 'Opal', 'Quartz', 'Onyx', 'Pearl', 'Sapphire', 'Garnet', 'Citrine', 'Topaz', 'Agate', 'Beryl'],
    second: ['Pulse', 'Flare', 'Mist', 'Tide', 'Glow', 'Frost', 'Bloom', 'Storm', 'Haze', 'Shard', 'Core', 'Drift', 'Flame', 'Ridge', 'Vein'],
  },
  wellness: {
    label: 'Wellness',
    first: ['Kinetic', 'Ethereal', 'Radiant', 'Primal', 'Harmonic', 'Zenith', 'Subtle', 'Infinite', 'Serene', 'Lucid', 'Quantum', 'Vital', 'Cosmic', 'Neural', 'Sacred'],
    second: ['Calm', 'Focus', 'Flow', 'Surge', 'Balance', 'Drift', 'Bloom', 'Depth', 'Peak', 'Pulse', 'Rise', 'Wave', 'Shield', 'Anchor', 'Breath'],
  },
};
const STYLE_KEYS = Object.keys(RESONANCE_STYLES);

function getResonanceName(colors, style) {
  if (colors.length < 2) return null;
  const key = [...colors].sort((a, b) => a.id.localeCompare(b.id)).map(c => c.id).join('+');
  const hash = [...key].reduce((sum, ch, i) => sum + ch.charCodeAt(0) * Math.pow(PHI, i + 1), 0);
  const pool = RESONANCE_STYLES[style];
  if (!pool) return null;
  const fi = Math.floor(hash) % pool.first.length;
  const si = Math.floor(hash * PHI) % pool.second.length;
  return `${pool.first[fi]} ${pool.second[si]}`;
}

/* ── Audio Engine: Layered Oscillators per Color ────────── */
function useColorAudio(colors, muted) {
  const ctxRef = useRef(null);
  const nodesRef = useRef({});

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  useEffect(() => {
    if (muted || !colors.length) {
      const ctx = ctxRef.current;
      if (ctx && ctx.state !== 'closed') {
        Object.values(nodesRef.current).forEach(({ g, sg }) => {
          try { g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5); } catch(e){}
          try { sg.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5); } catch(e){}
        });
      }
      const snap = { ...nodesRef.current };
      nodesRef.current = {};
      const t = setTimeout(() => {
        Object.values(snap).forEach(({ o, s }) => {
          try { o.stop(); } catch(e){} try { s.stop(); } catch(e){}
        });
      }, 600);
      return () => clearTimeout(t);
    }

    let ctx;
    try { ctx = ensureCtx(); } catch(e) { return; }

    const vol = 0.04 / colors.length;
    const subVol = 0.018 / colors.length;
    const activeSet = new Set(colors.map(c => c.id));

    // Fade out deselected
    Object.keys(nodesRef.current).forEach(id => {
      if (!activeSet.has(id)) {
        const n = nodesRef.current[id];
        try { n.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4); } catch(e){}
        try { n.sg.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4); } catch(e){}
        const captured = n;
        delete nodesRef.current[id];
        setTimeout(() => {
          try { captured.o.stop(); } catch(e){} try { captured.s.stop(); } catch(e){}
        }, 500);
      }
    });

    // Add new, rebalance existing
    colors.forEach(c => {
      if (!nodesRef.current[c.id]) {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = c.hz;
        const g = ctx.createGain(); g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.5);
        o.connect(g); g.connect(ctx.destination); o.start();

        const s = ctx.createOscillator(); s.type = 'sine'; s.frequency.value = c.hz / 4;
        const sg = ctx.createGain(); sg.gain.setValueAtTime(0, ctx.currentTime);
        sg.gain.linearRampToValueAtTime(subVol, ctx.currentTime + 2);
        s.connect(sg); sg.connect(ctx.destination); s.start();

        nodesRef.current[c.id] = { o, s, g, sg };
      } else {
        try { nodesRef.current[c.id].g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.3); } catch(e){}
        try { nodesRef.current[c.id].sg.gain.linearRampToValueAtTime(subVol, ctx.currentTime + 0.3); } catch(e){}
      }
    });
  }, [colors, muted, ensureCtx]);

  useEffect(() => () => {
    Object.values(nodesRef.current).forEach(({ o, s }) => {
      try { o.stop(); } catch(e){} try { s.stop(); } catch(e){}
    });
    nodesRef.current = {};
    try { ctxRef.current?.close(); } catch(e){}
  }, []);
}

/* ── Color Selector (Multi-Toggle) ──────────────────────── */
function ColorSelector({ colors, selected, onToggle, max }) {
  return (
    <div className="flex flex-wrap gap-3 justify-center" data-testid="light-color-selector">
      {colors.map(c => {
        const active = selected.some(s => s.id === c.id);
        const atMax = selected.length >= max && !active;
        return (
          <motion.button
            key={c.id}
            whileHover={{ scale: atMax ? 1 : 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => !atMax && onToggle(c)}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300"
            style={{
              background: active ? `${c.hex}15` : 'rgba(255,255,255,0.02)',
              border: `2px solid ${active ? c.hex : 'rgba(255,255,255,0.06)'}`,
              boxShadow: active ? `0 0 30px ${c.glow}` : 'none',
              opacity: atMax ? 0.3 : 1,
              cursor: atMax ? 'default' : 'pointer',
            }}
            data-testid={`light-color-${c.id}`}
          >
            <div className="w-10 h-10 rounded-full light-color-circle transition-all duration-300" style={{
              background: c.hex,
              boxShadow: active ? `0 0 25px ${c.glow}, 0 0 50px ${c.glow}` : `0 0 10px ${c.glow}`,
            }} />
            <span className="text-[10px] font-medium" style={{ color: active ? c.hex : 'var(--text-muted)' }}>
              {c.id.charAt(0).toUpperCase() + c.id.slice(1)}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Blend Indicator + Resonance Name ───────────────────── */
function BlendIndicator({ colors, nameStyle, onStyleChange }) {
  if (colors.length < 2) return null;
  const blended = blendHex(colors);
  const rName = getResonanceName(colors, nameStyle);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-5 flex flex-col items-center gap-3"
      data-testid="light-blend-indicator"
    >
      <div className="flex items-center gap-2.5">
        {colors.map((c, i) => (
          <React.Fragment key={c.id}>
            <div className="w-4 h-4 rounded-full" style={{ background: c.hex, boxShadow: `0 0 10px ${c.glow}` }} />
            {i < colors.length - 1 && (
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>+</span>
            )}
          </React.Fragment>
        ))}
        <span className="text-[10px] mx-1" style={{ color: 'rgba(255,255,255,0.15)' }}>=</span>
        <motion.div
          animate={{ boxShadow: [`0 0 12px ${blended}55`, `0 0 28px ${blended}35`, `0 0 12px ${blended}55`] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-6 h-6 rounded-full"
          style={{ background: blended }}
        />
      </div>
      {rName && (
        <motion.p
          key={rName}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-light tracking-wide"
          style={{ color: `${blended}CC`, fontFamily: 'Cormorant Garamond, serif' }}
          data-testid="light-resonance-name"
        >
          {rName}
        </motion.p>
      )}
      <div className="flex items-center gap-1.5" data-testid="light-name-style-selector">
        {STYLE_KEYS.map(sk => (
          <button
            key={sk}
            onClick={() => onStyleChange(sk)}
            className="px-2.5 py-1 rounded-full text-[9px] transition-all"
            style={{
              background: nameStyle === sk ? `${blended}18` : 'transparent',
              border: `1px solid ${nameStyle === sk ? `${blended}40` : 'rgba(255,255,255,0.06)'}`,
              color: nameStyle === sk ? `${blended}CC` : 'rgba(255,255,255,0.2)',
            }}
            data-testid={`light-style-${sk}`}
          >
            {RESONANCE_STYLES[sk].label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Immersive Session (Multi-Frequency) ────────────────── */
function ImmersiveSession({ colors, duration, onEnd, resonanceName, sceneUrl }) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [paused, setPaused] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const intervalRef = useRef(null);
  const breathRef = useRef(null);
  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef([]);
  const { playChime } = useSensory();

  const blended = useMemo(() => blendHex(colors), [colors]);
  const blendedGlow = useMemo(() => hexToGlow(blended), [blended]);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('light_therapy', 8); }, []);

  // Session audio: all selected frequencies layered at higher volume
  useEffect(() => {
    const perVol = 0.06 / colors.length;
    const subVol = 0.03 / colors.length;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;
      colors.forEach(c => {
        const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = c.hz;
        const g = ctx.createGain(); g.gain.value = 0;
        g.gain.linearRampToValueAtTime(perVol, ctx.currentTime + 3);
        osc.connect(g); g.connect(ctx.destination); osc.start();
        audioNodesRef.current.push(osc, g);

        const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = c.hz / 4;
        const sg = ctx.createGain(); sg.gain.value = 0;
        sg.gain.linearRampToValueAtTime(subVol, ctx.currentTime + 3);
        sub.connect(sg); sg.connect(ctx.destination); sub.start();
        audioNodesRef.current.push(sub, sg);
      });
    } catch(e){}
    return () => {
      audioNodesRef.current.forEach(n => { try { n.stop?.(); } catch(e){} });
      audioNodesRef.current = [];
      try { audioCtxRef.current?.close(); } catch(e){}
    };
  }, [colors]);

  // Timer
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(intervalRef.current); playChime(); onEnd(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [paused, onEnd, playChime]);

  // Breathing 4s in / 4s out
  useEffect(() => {
    if (paused) return;
    const cycle = () => {
      setBreathPhase('inhale');
      breathRef.current = setTimeout(() => {
        setBreathPhase('exhale');
        breathRef.current = setTimeout(cycle, 4000);
      }, 4000);
    };
    cycle();
    return () => clearTimeout(breathRef.current);
  }, [paused]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#000' }}
      data-testid="light-therapy-session"
    >
      {/* AI-generated scene background */}
      {sceneUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 3 }}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${sceneUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          data-testid="light-session-scene-bg"
        />
      )}
      {/* Multi-color gradient layers */}
      {colors.map((c, i) => (
        <motion.div
          key={c.id}
          className="absolute inset-0"
          animate={{
            background: [
              `radial-gradient(ellipse at ${GRAD_ORIGINS[i] || '50% 50%'}, ${c.hex}30 0%, ${c.hex}08 50%, transparent 100%)`,
              `radial-gradient(ellipse at ${GRAD_ORIGINS[i] || '50% 50%'}, ${c.hex}50 0%, ${c.hex}15 50%, transparent 100%)`,
              `radial-gradient(ellipse at ${GRAD_ORIGINS[i] || '50% 50%'}, ${c.hex}30 0%, ${c.hex}08 50%, transparent 100%)`,
            ],
          }}
          transition={{ duration: 6 + i * 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Breathing orb — blended color */}
      <motion.div
        className="relative z-10"
        animate={{ scale: breathPhase === 'inhale' ? 1.4 : 0.8 }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      >
        <div className="w-40 h-40 md:w-56 md:h-56 rounded-full relative" style={{
          background: `radial-gradient(circle, ${blended}60 0%, ${blended}15 60%, transparent 100%)`,
          boxShadow: `0 0 80px ${blendedGlow}, 0 0 160px ${blendedGlow}`,
        }}>
          <motion.div
            className="absolute inset-4 rounded-full"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ border: `1px solid ${blended}40` }}
          />
          {colors.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              {colors.map((c, idx) => (
                <motion.div key={c.id} className="w-3 h-3 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, delay: idx * 0.6 }}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <motion.p
        key={breathPhase}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.7, y: 0 }}
        className="relative z-10 mt-10 text-lg font-light tracking-widest uppercase"
        style={{ color: blended, fontFamily: 'Cormorant Garamond, serif' }}
      >
        {breathPhase === 'inhale' ? 'Breathe In' : 'Breathe Out'}
      </motion.p>

      {resonanceName && (
        <p className="relative z-10 mt-3 text-xs tracking-wider" style={{ color: `${blended}66`, fontFamily: 'Cormorant Garamond, serif' }}
          data-testid="light-session-resonance-name">
          {resonanceName}
        </p>
      )}

      <p className="relative z-10 mt-6 text-3xl font-light tabular-nums" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Cormorant Garamond, serif' }}>
        {mins}:{secs.toString().padStart(2, '0')}
      </p>

      <div className="relative z-10 mt-8 flex items-center gap-4">
        <button onClick={() => setPaused(!paused)} className="p-3 rounded-full transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }} data-testid="light-pause-btn">
          {paused ? <Play size={20} /> : <Pause size={20} />}
        </button>
        <button onClick={onEnd} className="px-5 py-2 rounded-full text-sm transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }} data-testid="light-end-btn">
          End Session
        </button>
      </div>

      <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {colors.map(c => (
          <span key={c.id} className="text-[10px]" style={{ color: `${c.hex}77` }}>
            {c.hz}Hz &middot; {c.chakra}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function LightTherapy() {
  const [selected, setSelected] = useState([]);
  const [duration, setDuration] = useState(5);
  const [sessionActive, setSessionActive] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [nameStyle, setNameStyle] = useState('lakota');
  const [sceneUrl, setSceneUrl] = useState(null);
  const [sceneLoading, setSceneLoading] = useState(false);
  useLightTherapyOverride();
  useColorAudio(selected, !audioOn);

  const toggleColor = useCallback((color) => {
    setSelected(prev => {
      if (prev.find(c => c.id === color.id)) return prev.filter(c => c.id !== color.id);
      if (prev.length >= MAX_BLEND) return prev;
      return [...prev, color];
    });
    setAudioOn(true);
    setSceneUrl(null);
  }, []);

  const handleGenerateScene = useCallback(async () => {
    if (selected.length < 2 || sceneLoading) return;
    setSceneLoading(true);
    const hexes = selected.map(c => c.hex);
    const rn = getResonanceName(selected, nameStyle);
    const result = await SceneGenerator.generateScene(rn, hexes, null, null);
    if (result?.imageUrl) setSceneUrl(result.imageUrl);
    setSceneLoading(false);
  }, [selected, nameStyle, sceneLoading]);

  const primary = selected[0];
  const blended = useMemo(() => blendHex(selected), [selected]);
  const accent = selected.length ? blended : '#A855F7';
  const resonanceName = useMemo(() => getResonanceName(selected, nameStyle), [selected, nameStyle]);

  return (
    <div className="min-h-screen relative overflow-hidden" data-light-therapy="true"
      style={{ background: '#000', transition: 'background 1s ease' }}>

      {/* Multi-color bath layers */}
      <AnimatePresence>
        {selected.length > 0 && !sessionActive && selected.map((c, i) => (
          <motion.div
            key={`bath-${c.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
            style={{ zIndex: 0 }}>
            <div className="absolute inset-0" style={{
              background: `radial-gradient(ellipse at ${GRAD_ORIGINS[i] || '50% 50%'}, ${c.hex}30 0%, ${c.hex}10 40%, transparent 80%)`,
            }} />
            <motion.div className="absolute inset-0"
              animate={{
                background: [
                  `radial-gradient(ellipse at ${i % 2 === 0 ? '30% 60%' : '70% 30%'}, ${c.hex}20 0%, transparent 50%)`,
                  `radial-gradient(ellipse at ${i % 2 === 0 ? '65% 35%' : '35% 70%'}, ${c.hex}25 0%, transparent 50%)`,
                  `radial-gradient(ellipse at ${i % 2 === 0 ? '30% 60%' : '70% 30%'}, ${c.hex}20 0%, transparent 50%)`,
                ],
              }}
              transition={{ duration: 8 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      {selected.length > 0 && !sessionActive && (
        <div className="absolute inset-0" style={{
          zIndex: 0,
          background: 'radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(0,0,0,0.55) 100%)',
        }} />
      )}
      {/* AI-generated scene preview */}
      {sceneUrl && !sessionActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          className="absolute inset-0"
          style={{ zIndex: 0, backgroundImage: `url(${sceneUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          data-testid="light-scene-preview"
        />
      )}

      {/* Content */}
      <div className="relative z-10 px-5 py-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accent }}>
              <Sun size={12} className="inline mr-1.5" /> Chromotherapy
            </p>
            {selected.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setAudioOn(p => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] transition-all"
                style={{
                  background: audioOn ? `${accent}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${audioOn ? `${accent}40` : 'rgba(255,255,255,0.06)'}`,
                  color: audioOn ? accent : 'rgba(255,255,255,0.3)',
                }}
                data-testid="light-audio-toggle"
              >
                {audioOn ? <Volume2 size={11} /> : <VolumeX size={11} />}
                {audioOn ? 'Sound On' : 'Sound Off'}
              </motion.button>
            )}
          </div>
          <h1 className="text-3xl font-light tracking-tight mb-1" style={{
            fontFamily: 'Cormorant Garamond, serif',
            color: selected.length ? `${blended}DD` : 'rgba(248,250,252,0.85)',
          }}>
            {selected.length > 1 && resonanceName ? resonanceName : selected.length === 1 ? primary.name : 'Light Therapy'}
          </h1>
          {selected.length > 0 ? (
            <p className="text-[10px] mb-4" style={{ color: `${accent}88` }}>
              {selected.map(c => `${c.hz}Hz`).join(' + ')}{selected.length > 1 ? ' — Harmonic Blend' : ` — ${primary.chakra}`}
            </p>
          ) : (
            <p className="text-xs mb-6" style={{ color: 'rgba(248,250,252,0.3)' }}>
              Select up to {MAX_BLEND} colors to blend. The room transforms.
            </p>
          )}
        </motion.div>

        <ColorSelector colors={COLORS} selected={selected} onToggle={toggleColor} max={MAX_BLEND} />
        <BlendIndicator colors={selected} nameStyle={nameStyle} onStyleChange={setNameStyle} />

        <AnimatePresence mode="wait">
          {selected.length > 0 && (
            <motion.div
              key={selected.map(c => c.id).join('-')}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="mt-6 space-y-5">

              {selected.length === 1 ? (
                <>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(248,250,252,0.5)' }}>
                    {primary.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${primary.hex}66` }}>Benefits</p>
                    {primary.benefits.map((b, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: primary.hex, boxShadow: `0 0 8px ${primary.glow}` }} />
                        <span className="text-xs" style={{ color: 'rgba(248,250,252,0.45)' }}>{b}</span>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${blended}66` }}>
                    Harmonic Blend — {selected.length} Frequencies
                  </p>
                  {selected.map(c => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: c.hex, boxShadow: `0 0 8px ${c.glow}` }} />
                      <div>
                        <span className="text-xs font-medium" style={{ color: `${c.hex}CC` }}>{c.name}</span>
                        <span className="text-[10px] ml-2" style={{ color: 'rgba(255,255,255,0.25)' }}>{c.hz}Hz &middot; {c.chakra}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4" style={{ borderTop: `1px solid ${accent}15` }}>
                {/* Generate Scene button for blends */}
                {selected.length > 1 && (
                  <button
                    onClick={handleGenerateScene}
                    disabled={sceneLoading}
                    className="w-full mb-4 py-2.5 rounded-xl text-xs font-medium active:scale-95 transition-all flex items-center justify-center gap-2"
                    style={{
                      background: sceneUrl ? `${accent}10` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${sceneUrl ? `${accent}30` : 'rgba(255,255,255,0.08)'}`,
                      color: sceneUrl ? accent : 'rgba(255,255,255,0.35)',
                      opacity: sceneLoading ? 0.5 : 1,
                    }}
                    data-testid="light-generate-scene">
                    {sceneLoading ? <Loader size={12} className="animate-spin" /> : <ImageIcon size={12} />}
                    {sceneLoading ? 'Generating Scene...' : sceneUrl ? 'Regenerate Scene' : 'Generate AI Scene'}
                  </button>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={12} style={{ color: `${accent}66` }} />
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: `${accent}44` }}>Session Duration</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {DURATIONS.map(d => (
                    <button key={d} onClick={() => setDuration(d)}
                      className="px-4 py-2 rounded-full text-xs active:scale-95 transition-all"
                      style={{
                        background: duration === d ? `${accent}20` : 'rgba(255,255,255,0.02)',
                        color: duration === d ? accent : 'rgba(255,255,255,0.3)',
                        border: `1px solid ${duration === d ? `${accent}40` : 'rgba(255,255,255,0.06)'}`,
                      }}
                      data-testid={`light-duration-${d}`}>{d} min</button>
                  ))}
                </div>
                <button
                  onClick={() => setSessionActive(true)}
                  className="w-full mt-4 py-3 rounded-xl text-sm font-medium active:scale-95 transition-all flex items-center justify-center gap-2"
                  style={{
                    background: `${accent}15`,
                    border: `1px solid ${accent}30`,
                    color: accent,
                    boxShadow: `0 0 30px ${accent}10`,
                  }}
                  data-testid="light-start-session">
                  <Play size={14} fill={accent} />
                  {selected.length > 1 && resonanceName
                    ? `Immerse in ${resonanceName}`
                    : selected.length > 1
                    ? `Immerse in ${selected.length}-Color Blend`
                    : `Immerse in ${primary.id.charAt(0).toUpperCase() + primary.id.slice(1)}`}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {sessionActive && selected.length > 0 && (
          <ImmersiveSession colors={selected} duration={duration} onEnd={() => setSessionActive(false)} resonanceName={resonanceName} sceneUrl={sceneUrl} />
        )}
      </AnimatePresence>
    </div>
  );
}
