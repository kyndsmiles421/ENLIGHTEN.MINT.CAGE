import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Waves, Heart, Zap, Eye, Sparkles, Play, Pause, Clock, ChevronLeft } from 'lucide-react';
import { useSensory } from '../context/SensoryContext';

// Light Therapy: NO realm skin. Pure black until user picks a color.
const LT_OVERRIDE_ID = 'light-therapy-override';
function useLightTherapyOverride() {
  useEffect(() => {
    let style = document.getElementById(LT_OVERRIDE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = LT_OVERRIDE_ID;
      document.head.appendChild(style);
    }
    // Kill the realm scene entirely — pure black canvas for chromotherapy
    style.textContent = `
      [data-testid="realm-scene-bg"] {
        opacity: 0 !important;
        pointer-events: none !important;
      }
      body.scene-active [data-testid="content-area"] > [data-testid="z-depth-container"] > [data-light-therapy] {
        background: #000 !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
    `;
    return () => { style.remove(); };
  }, []);
}

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
  useLightTherapyOverride();

  return (
    <div className="min-h-screen relative overflow-hidden" data-light-therapy="true"
      style={{ background: selected ? '#000' : '#000', transition: 'background 1s ease' }}>

      {/* FULL-SCREEN COLOR BATH — the room IS the color */}
      <AnimatePresence>
        {selected && !sessionActive && (
          <motion.div
            key={`bath-${selected.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
            style={{ zIndex: 0 }}>
            {/* Primary color wash */}
            <div className="absolute inset-0" style={{
              background: `radial-gradient(ellipse at 50% 40%, ${selected.hex}35 0%, ${selected.hex}12 40%, ${selected.hex}06 70%, #000 100%)`,
            }} />
            {/* Slow-moving secondary glow */}
            <motion.div className="absolute inset-0"
              animate={{
                background: [
                  `radial-gradient(ellipse at 30% 60%, ${selected.hex}20 0%, transparent 50%)`,
                  `radial-gradient(ellipse at 70% 30%, ${selected.hex}25 0%, transparent 50%)`,
                  `radial-gradient(ellipse at 40% 70%, ${selected.hex}20 0%, transparent 50%)`,
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Edge vignette */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)',
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENT — floats on the color room */}
      <div className="relative z-10 px-5 py-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: selected ? selected.hex : '#A855F7' }}>
            <Sun size={12} className="inline mr-1.5" /> Chromotherapy
          </p>
          <h1 className="text-3xl font-light tracking-tight mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: selected ? selected.hex + 'DD' : 'rgba(248,250,252,0.85)' }}>
            {selected ? selected.name : 'Light Therapy'}
          </h1>
          {selected && (
            <p className="text-[10px] mb-6" style={{ color: `${selected.hex}88` }}>
              {selected.chakra} &middot; {selected.frequency} &middot; {selected.wavelength}
            </p>
          )}
          {!selected && (
            <p className="text-xs mb-8" style={{ color: 'rgba(248,250,252,0.3)' }}>
              Select a healing color. The room will transform.
            </p>
          )}
        </motion.div>

        {/* Color Selector — always visible */}
        <ColorSelector colors={COLORS} selected={selected} onSelect={setSelected} />

        {/* Selected color deep info — part of the room, not a card */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="mt-8 space-y-6">

              {/* Description */}
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(248,250,252,0.5)' }}>
                {selected.description}
              </p>

              {/* Benefits */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${selected.hex}66` }}>Benefits</p>
                {selected.benefits.map((b, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: selected.hex, boxShadow: `0 0 8px ${selected.glow}` }} />
                    <span className="text-xs" style={{ color: 'rgba(248,250,252,0.45)' }}>{b}</span>
                  </motion.div>
                ))}
              </div>

              {/* Duration selector + Begin */}
              <div className="pt-4" style={{ borderTop: `1px solid ${selected.hex}15` }}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={12} style={{ color: `${selected.hex}66` }} />
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: `${selected.hex}44` }}>Session Duration</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {DURATIONS.map(d => (
                    <button key={d} onClick={() => setDuration(d)}
                      className="px-4 py-2 rounded-full text-xs active:scale-95 transition-all"
                      style={{
                        background: duration === d ? `${selected.hex}20` : 'rgba(255,255,255,0.02)',
                        color: duration === d ? selected.hex : 'rgba(255,255,255,0.3)',
                        border: `1px solid ${duration === d ? `${selected.hex}40` : 'rgba(255,255,255,0.06)'}`,
                      }}
                      data-testid={`light-duration-${d}`}>{d} min</button>
                  ))}
                </div>
                <button
                  onClick={() => setSessionActive(true)}
                  className="w-full mt-4 py-3 rounded-xl text-sm font-medium active:scale-95 transition-all flex items-center justify-center gap-2"
                  style={{
                    background: `${selected.hex}15`,
                    border: `1px solid ${selected.hex}30`,
                    color: selected.hex,
                    boxShadow: `0 0 30px ${selected.hex}10`,
                  }}
                  data-testid="light-start-session">
                  <Play size={14} fill={selected.hex} /> Immerse in {selected.id.charAt(0).toUpperCase() + selected.id.slice(1)}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FULL IMMERSIVE SESSION — takes over everything */}
      <AnimatePresence>
        {sessionActive && selected && (
          <ImmersiveSession color={selected} duration={duration} onEnd={() => setSessionActive(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
