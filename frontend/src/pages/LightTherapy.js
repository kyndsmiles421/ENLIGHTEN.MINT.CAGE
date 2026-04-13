import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Waves, Heart, Zap, Eye, Sparkles, Play, Pause, Clock, ChevronLeft } from 'lucide-react';
import { useSensory } from '../context/SensoryContext';

const COLORS = [
  {
    id: 'red', name: 'Red — Vitality', hex: '#EF4444', glow: 'rgba(239,68,68,0.4)',
    icon: Zap, chakra: 'Root Chakra (Muladhara)',
    benefits: ['Increases energy and vitality', 'Stimulates circulation', 'Grounds and stabilizes', 'Boosts courage and confidence'],
    description: 'Red light activates your root chakra, igniting primal life force energy. It stimulates blood flow, warms the body, and helps overcome lethargy and fatigue.',
    frequency: '430 THz', wavelength: '700 nm',
  },
  {
    id: 'orange', name: 'Orange — Creativity', hex: '#FB923C', glow: 'rgba(251,146,60,0.4)',
    icon: Sparkles, chakra: 'Sacral Chakra (Svadhisthana)',
    benefits: ['Sparks creativity and joy', 'Enhances emotional balance', 'Supports digestive health', 'Releases emotional blockages'],
    description: 'Orange light awakens your creative center. It dissolves emotional blocks, encourages playfulness, and helps process and release stored emotions.',
    frequency: '480 THz', wavelength: '620 nm',
  },
  {
    id: 'yellow', name: 'Yellow — Clarity', hex: '#FCD34D', glow: 'rgba(252,211,77,0.4)',
    icon: Sun, chakra: 'Solar Plexus Chakra (Manipura)',
    benefits: ['Sharpens mental clarity', 'Boosts self-confidence', 'Enhances learning and focus', 'Activates personal willpower'],
    description: 'Yellow light empowers your solar plexus, the seat of personal power and intellectual clarity. It aids concentration, dispels mental fog, and cultivates inner strength.',
    frequency: '510 THz', wavelength: '580 nm',
  },
  {
    id: 'green', name: 'Green — Healing', hex: '#22C55E', glow: 'rgba(34,197,94,0.4)',
    icon: Heart, chakra: 'Heart Chakra (Anahata)',
    benefits: ['Promotes deep healing', 'Balances the nervous system', 'Soothes and calms the heart', 'Harmonizes body and mind'],
    description: 'Green light is the color of nature and the heart chakra. It brings balance to all systems, encourages healing, soothes inflammation, and opens the heart to compassion.',
    frequency: '550 THz', wavelength: '540 nm',
  },
  {
    id: 'blue', name: 'Blue — Serenity', hex: '#3B82F6', glow: 'rgba(59,130,246,0.4)',
    icon: Waves, chakra: 'Throat Chakra (Vishuddha)',
    benefits: ['Deeply calms and relaxes', 'Reduces anxiety and stress', 'Lowers blood pressure', 'Promotes truthful expression'],
    description: 'Blue light activates the parasympathetic nervous system, inducing deep calm. It soothes the mind, eases tension, and opens the throat chakra for clear communication.',
    frequency: '610 THz', wavelength: '490 nm',
  },
  {
    id: 'indigo', name: 'Indigo — Intuition', hex: '#6366F1', glow: 'rgba(99,102,241,0.4)',
    icon: Eye, chakra: 'Third Eye Chakra (Ajna)',
    benefits: ['Heightens intuition', 'Enhances visualization', 'Supports lucid dreaming', 'Deepens meditation'],
    description: 'Indigo light stimulates the pineal gland and third eye chakra. It enhances inner vision, deepens meditative states, and strengthens your connection to intuitive wisdom.',
    frequency: '670 THz', wavelength: '450 nm',
  },
  {
    id: 'violet', name: 'Violet — Transcendence', hex: '#A855F7', glow: 'rgba(168,85,247,0.4)',
    icon: Moon, chakra: 'Crown Chakra (Sahasrara)',
    benefits: ['Expands consciousness', 'Purifies thoughts', 'Supports spiritual awakening', 'Promotes deep peace'],
    description: 'Violet light connects you to the crown chakra and higher consciousness. It purifies the mind, transmutes negative energy, and opens pathways to spiritual awareness.',
    frequency: '700 THz', wavelength: '400 nm',
  },
];

const DURATIONS = [3, 5, 10, 15, 20];

function ColorSelector({ colors, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-3 justify-center" data-testid="light-color-selector">
      {colors.map(c => {
        const active = selected?.id === c.id;
        return (
          <motion.button
            key={c.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(c)}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300"
            style={{
              background: active ? `${c.hex}15` : 'rgba(255,255,255,0.02)',
              border: `2px solid ${active ? c.hex : 'rgba(255,255,255,0.06)'}`,
              boxShadow: active ? `0 0 30px ${c.glow}` : 'none',
            }}
            data-testid={`light-color-${c.id}`}
          >
            <div className="w-10 h-10 rounded-full transition-all duration-300" style={{
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

function ImmersiveSession({ color, duration, onEnd }) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [paused, setPaused] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const intervalRef = useRef(null);
  const breathRef = useRef(null);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef([]);
  const { playChime } = useSensory();

  // Ambient tone for the color
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('light_therapy', 8); }, []);
  useEffect(() => {
    const freqMap = { red: 256, orange: 288, yellow: 320, green: 341, blue: 384, indigo: 426, violet: 480 };
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freqMap[color.id] || 340;
      const g = ctx.createGain();
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      nodesRef.current.push(osc, g);

      // Sub bass
      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.value = (freqMap[color.id] || 340) / 4;
      const sg = ctx.createGain();
      sg.gain.value = 0;
      sg.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 3);
      sub.connect(sg);
      sg.connect(ctx.destination);
      sub.start();
      nodesRef.current.push(sub, sg);
    } catch (e) {}

    return () => {
      nodesRef.current.forEach(n => { try { n.stop?.(); } catch(e) {} });
      try { audioCtxRef.current?.close(); } catch(e) {}
    };
  }, [color]);

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

  // Breathing cycle 4s in, 4s out
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
      {/* Color bath layers */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            `radial-gradient(ellipse at 50% 50%, ${color.hex}30 0%, ${color.hex}08 50%, #000 100%)`,
            `radial-gradient(ellipse at 50% 50%, ${color.hex}50 0%, ${color.hex}15 50%, #000 100%)`,
            `radial-gradient(ellipse at 50% 50%, ${color.hex}30 0%, ${color.hex}08 50%, #000 100%)`,
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Breathing orb */}
      <motion.div
        className="relative z-10"
        animate={{ scale: breathPhase === 'inhale' ? 1.4 : 0.8 }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      >
        <div className="w-40 h-40 md:w-56 md:h-56 rounded-full relative" style={{
          background: `radial-gradient(circle, ${color.hex}60 0%, ${color.hex}15 60%, transparent 100%)`,
          boxShadow: `0 0 80px ${color.glow}, 0 0 160px ${color.glow}`,
        }}>
          {/* Inner pulsing ring */}
          <motion.div
            className="absolute inset-4 rounded-full"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ border: `1px solid ${color.hex}40` }}
          />
        </div>
      </motion.div>

      {/* Breath instruction */}
      <motion.p
        key={breathPhase}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.7, y: 0 }}
        className="relative z-10 mt-10 text-lg font-light tracking-widest uppercase"
        style={{ color: color.hex, fontFamily: 'Cormorant Garamond, serif' }}
      >
        {breathPhase === 'inhale' ? 'Breathe In' : 'Breathe Out'}
      </motion.p>

      {/* Timer */}
      <p className="relative z-10 mt-6 text-3xl font-light tabular-nums" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Cormorant Garamond, serif' }}>
        {mins}:{secs.toString().padStart(2, '0')}
      </p>

      {/* Controls */}
      <div className="relative z-10 mt-8 flex items-center gap-4">
        <button onClick={() => setPaused(!paused)} className="p-3 rounded-full transition-all" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }} data-testid="light-pause-btn">
          {paused ? <Play size={20} /> : <Pause size={20} />}
        </button>
        <button onClick={onEnd} className="px-5 py-2 rounded-full text-sm transition-all" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }} data-testid="light-end-btn">
          End Session
        </button>
      </div>

      {/* Color info */}
      <p className="relative z-10 mt-8 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
        {color.chakra} &middot; {color.frequency}
      </p>
    </motion.div>
  );
}

export default function LightTherapy() {
  const [selected, setSelected] = useState(null);
  const [duration, setDuration] = useState(5);
  const [sessionActive, setSessionActive] = useState(false);

  return (
    <div className="min-h-screen immersive-page px-6 md:px-12 lg:px-24 py-12 relative" style={{ background: 'transparent' }}>
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#A855F7' }}>
            <Sun size={14} className="inline mr-2" /> Chromotherapy
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Light Therapy
          </h1>
          <p className="text-base mb-12 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            Immerse yourself in healing colors. Each wavelength of light carries unique vibrational energy that resonates with your body's energy centers.
          </p>
        </motion.div>

        {/* Color Selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ColorSelector colors={COLORS} selected={selected} onSelect={setSelected} />
        </motion.div>

        {/* Selected color details */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-10 glass-card p-8 relative overflow-hidden"
              style={{ borderColor: `${selected.hex}20` }}
              data-testid="light-color-detail"
            >
              <div className="absolute top-0 right-0 w-60 h-60 rounded-full" style={{
                background: `radial-gradient(circle, ${selected.hex}10 0%, transparent 70%)`,
                filter: 'blur(40px)',
                transform: 'translate(30%, -30%)',
              }} />

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: selected.hex }}>
                    {selected.name}
                  </h2>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{selected.chakra}</p>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {selected.description}
                  </p>
                  <div className="flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{selected.frequency}</span>
                    <span>&middot;</span>
                    <span>{selected.wavelength}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Benefits</p>
                  <div className="space-y-2.5">
                    {selected.benefits.map((b, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: selected.hex, boxShadow: `0 0 6px ${selected.glow}` }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{b}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Duration + Start */}
              <div className="relative z-10 mt-8 pt-6 flex flex-wrap items-center gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Duration:</span>
                </div>
                {DURATIONS.map(d => (
                  <button key={d} onClick={() => setDuration(d)}
                    className="px-3 py-1.5 rounded-full text-xs transition-all"
                    style={{
                      background: duration === d ? `${selected.hex}20` : 'rgba(255,255,255,0.03)',
                      color: duration === d ? selected.hex : 'var(--text-muted)',
                      border: `1px solid ${duration === d ? `${selected.hex}40` : 'rgba(255,255,255,0.06)'}`,
                    }}
                    data-testid={`light-duration-${d}`}
                  >
                    {d} min
                  </button>
                ))}
                <button
                  onClick={() => setSessionActive(true)}
                  className="ml-auto btn-glass px-6 py-2.5 text-sm flex items-center gap-2"
                  style={{ background: `${selected.hex}15`, borderColor: `${selected.hex}30`, color: selected.hex }}
                  data-testid="light-start-session"
                >
                  <Play size={14} fill={selected.hex} /> Begin Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-16 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a healing color above to begin your light therapy session.</p>
          </motion.div>
        )}
      </div>

      {/* Immersive Session */}
      <AnimatePresence>
        {sessionActive && selected && (
          <ImmersiveSession color={selected} duration={duration} onEnd={() => setSessionActive(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
