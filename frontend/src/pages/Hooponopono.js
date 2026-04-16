import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Heart, User, Users, Globe, Sparkles } from 'lucide-react';
import { useSensory } from '../context/SensoryContext';
import CelebrationBurst from '../components/CelebrationBurst';
import NarrationPlayer from '../components/NarrationPlayer';

const PHRASES = [
  { text: "I'm sorry", color: '#3B82F6', description: 'Acknowledge responsibility and the pain that exists' },
  { text: 'Please forgive me', color: '#D8B4FE', description: 'Ask for forgiveness from yourself and the divine' },
  { text: 'Thank you', color: '#22C55E', description: 'Express gratitude for the healing and the lesson' },
  { text: 'I love you', color: '#FDA4AF', description: 'Send unconditional love to dissolve all barriers' },
];

const TARGETS = [
  { id: 'self', label: 'Myself', icon: User, desc: 'Heal your relationship with yourself', color: '#D8B4FE' },
  { id: 'person', label: 'A Specific Person', icon: Heart, desc: 'Heal a relationship or conflict', color: '#FDA4AF' },
  { id: 'situation', label: 'A Situation', icon: Sparkles, desc: 'Release attachment to outcomes', color: '#FCD34D' },
  { id: 'world', label: 'The World', icon: Globe, desc: 'Send healing to all beings', color: '#2DD4BF' },
];

const DURATIONS = [
  { minutes: 5, label: '5 min' },
  { minutes: 10, label: '10 min' },
  { minutes: 15, label: '15 min' },
  { minutes: 20, label: '20 min' },
];

function createNoiseBuffer(ctx, seconds = 2) {
  const size = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/* ====== IMMERSIVE SESSION ====== */
function HooponoponoSession({ target, targetName, duration, onEnd }) {
  const [elapsed, setElapsed] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [paused, setPaused] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef([]);
  const { playCelebration } = useSensory();
  const totalSeconds = duration * 60;

  // Ambient: gentle singing bowl drone
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const nodes = [];
      [396, 528].forEach((f, i) => {
        const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = f;
        const g = ctx.createGain(); g.gain.value = 0.03;
        const l = ctx.createOscillator(); l.frequency.value = 0.15 + i * 0.08;
        const lg = ctx.createGain(); lg.gain.value = 0.015;
        l.connect(lg); lg.connect(g.gain); osc.connect(g); g.connect(ctx.destination);
        osc.start(); l.start(); nodes.push(osc, l);
      });
      nodesRef.current = nodes;
    } catch {}
    return () => {
      nodesRef.current.forEach(n => { try { n.stop?.(); } catch {} });
      try { audioCtxRef.current?.close(); } catch {};
    };
  }, []);

  // Cycle through phrases every ~6 seconds
  useEffect(() => {
    if (paused) return;
    const phraseInterval = setInterval(() => {
      setPhraseIdx(prev => {
        const next = (prev + 1) % 4;
        if (next === 0) setCycles(c => c + 1);
        return next;
      });
    }, 6000);
    return () => clearInterval(phraseInterval);
  }, [paused]);

  // Main timer
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= totalSeconds) {
          clearInterval(intervalRef.current);
          playCelebration();
          setCelebrating(true);
          return totalSeconds;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [paused, totalSeconds, playCelebration]);

  const phrase = PHRASES[phraseIdx];
  const progress = elapsed / totalSeconds;
  const mins = Math.floor((totalSeconds - elapsed) / 60);
  const secs = (totalSeconds - elapsed) % 60;
  const targetConfig = TARGETS.find(t => t.id === target);

  const narrationText = `Ho'oponopono practice for ${targetConfig?.label || 'healing'}. ${targetName ? `Holding ${targetName} in your heart. ` : ''}I'm sorry. Please forgive me. Thank you. I love you. Continue repeating these four sacred phrases. Let them flow like a gentle river through your consciousness.`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{ background: 'transparent' }}
      data-testid="hooponopono-session">
      <CelebrationBurst active={celebrating} onComplete={() => { setCelebrating(false); onEnd(); }} />

      {/* Shifting ambient gradient */}
      <motion.div className="absolute inset-0"
        animate={{
          background: [
            `radial-gradient(ellipse at 50% 50%, ${PHRASES[0].color}08 0%, transparent 50%)`,
            `radial-gradient(ellipse at 50% 50%, ${PHRASES[1].color}08 0%, transparent 50%)`,
            `radial-gradient(ellipse at 50% 50%, ${PHRASES[2].color}08 0%, transparent 50%)`,
            `radial-gradient(ellipse at 50% 50%, ${PHRASES[3].color}08 0%, transparent 50%)`,
          ]
        }}
        transition={{ duration: 24, repeat: Infinity }} />

      {/* Target indicator */}
      <div className="flex items-center gap-2 mb-4 relative z-10">
        {targetConfig && <targetConfig.icon size={14} style={{ color: targetConfig.color }} />}
        <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {targetConfig?.label}{targetName ? ` — ${targetName}` : ''}
        </p>
      </div>

      {/* Central breathing orb with phrase */}
      <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center mb-8">
        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
          <circle cx="150" cy="150" r="140" fill="none" stroke={phrase.color} strokeWidth="2" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 140} strokeDashoffset={2 * Math.PI * 140 * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear' }} opacity="0.4" />
        </svg>

        {/* Breathing glow */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-48 h-48 md:w-56 md:h-56 rounded-full"
          style={{ background: `radial-gradient(circle, ${phrase.color}15 0%, transparent 70%)` }} />

        {/* Phrase display */}
        <AnimatePresence mode="wait">
          <motion.div key={phraseIdx}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 text-center">
            <p className="text-3xl md:text-4xl font-light"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: phrase.color, textShadow: `0 0 30px ${phrase.color}30` }}
              data-testid="hooponopono-phrase-text">
              {phrase.text}
            </p>
            <p className="text-xs mt-3 max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {phrase.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Phrase dots */}
      <div className="flex gap-3 mb-6 relative z-10">
        {PHRASES.map((p, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full transition-all duration-500"
            style={{
              background: i === phraseIdx ? p.color : 'rgba(255,255,255,0.08)',
              boxShadow: i === phraseIdx ? `0 0 8px ${p.color}60` : 'none',
              transform: i === phraseIdx ? 'scale(1.3)' : 'scale(1)',
            }} />
        ))}
      </div>

      {/* Timer & cycles */}
      <p className="text-2xl font-light tabular-nums relative z-10" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Cormorant Garamond, serif' }}>
        {mins}:{secs.toString().padStart(2, '0')}
      </p>
      <p className="text-xs mt-1 relative z-10" style={{ color: 'rgba(255,255,255,0.15)' }}>
        {cycles} complete cycle{cycles !== 1 ? 's' : ''}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-6 relative z-10">
        <button onClick={() => setPaused(!paused)} className="p-3 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }} data-testid="hooponopono-pause">
          {paused ? <Play size={20} /> : <Pause size={20} />}
        </button>
        <button onClick={onEnd} className="px-5 py-2 rounded-full text-sm"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }} data-testid="hooponopono-end">
          End Session
        </button>
      </div>

      <div className="mt-4 relative z-10">
        <NarrationPlayer text={narrationText} label="Voice Guide" color={phrase.color} context="meditation" />
      </div>
    </motion.div>
  );
}

/* ====== MAIN PAGE ====== */
export default function Hooponopono() {
  const [target, setTarget] = useState('self');
  const [targetName, setTargetName] = useState('');
  const [duration, setDuration] = useState(10);
  const [activeSession, setActiveSession] = useState(false);

  return (
    <div className="min-h-screen immersive-page px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#FDA4AF' }}>Ho'oponopono</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            The Art of Forgiveness
          </h1>
          <p className="text-base mb-12" style={{ color: 'var(--text-secondary)' }}>
            An ancient Hawaiian practice of reconciliation and self-healing through four sacred phrases.
          </p>
        </motion.div>

        {/* The Four Phrases */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          {PHRASES.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-6 text-center" data-testid={`phrase-card-${i}`}>
              <div className="w-10 h-10 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: `${p.color}12`, border: `1px solid ${p.color}20` }}>
                <span className="text-sm font-bold" style={{ color: p.color }}>{i + 1}</span>
              </div>
              <p className="text-lg font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: p.color }}>
                {p.text}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.description}</p>
            </motion.div>
          ))}
        </div>

        {/* About Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="p-8 md:p-10 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5"
            style={{ background: 'radial-gradient(circle at 30% 50%, #FDA4AF 0%, transparent 50%), radial-gradient(circle at 70% 50%, #D8B4FE 0%, transparent 50%)' }} />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>About This Practice</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Ho'oponopono (ho-oh-po-no-po-no) is an ancient Hawaiian practice of reconciliation and forgiveness. The word translates to "to make right" or "to correct."
                </p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  The modern practice, popularized by Dr. Ihaleakala Hew Len, uses four simple phrases as a mantra to clear subconscious memories and programs that create suffering. By taking 100% responsibility for everything in your experience, you open the door to profound healing.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>How It Works</p>
                <div className="space-y-3">
                  {[
                    'Choose who or what you direct the practice toward',
                    'Repeat the four phrases silently or aloud in a cycle',
                    'Feel each phrase genuinely — not just as words, but as energy',
                    'Allow whatever arises — tears, memories, peace — to simply be',
                    'Trust the process. Healing happens beneath conscious awareness',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5"
                        style={{ background: 'rgba(253,164,175,0.1)', color: '#FDA4AF' }}>{i + 1}</span>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Session Setup */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="p-8 md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-muted)' }}>Begin Your Practice</p>

          {/* Target Selection */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
              Who is this practice for?
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TARGETS.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setTarget(t.id)}
                    className="p-4 text-center transition-all"
                    style={{
                      borderColor: target === t.id ? `${t.color}40` : 'rgba(255,255,255,0.08)',
                      background: target === t.id ? `${t.color}06` : 'transparent',
                    }}
                    data-testid={`target-${t.id}`}>
                    <Icon size={20} className="mx-auto mb-2" style={{ color: target === t.id ? t.color : 'var(--text-muted)' }} />
                    <p className="text-sm font-medium mb-1" style={{ color: target === t.id ? t.color : 'var(--text-primary)' }}>{t.label}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name input for person/situation */}
          {(target === 'person' || target === 'situation') && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                {target === 'person' ? 'Name the person (optional — hold them in your heart)' : 'Describe the situation briefly (optional)'}
              </p>
              <input value={targetName} onChange={e => setTargetName(e.target.value)}
                placeholder={target === 'person' ? 'Their name or how you know them...' : 'The situation you want to heal...'}
                className="input-glass w-full text-sm" data-testid="target-name-input" />
            </motion.div>
          )}

          {/* Duration */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Duration</p>
            <div className="flex gap-3">
              {DURATIONS.map(d => (
                <button key={d.minutes} onClick={() => setDuration(d.minutes)}
                  className="px-5 py-2 rounded-xl text-sm transition-all"
                  style={{
                    background: duration === d.minutes ? 'rgba(253,164,175,0.12)' : 'rgba(255,255,255,0.02)',
                    color: duration === d.minutes ? '#FDA4AF' : 'var(--text-muted)',
                    border: `1px solid ${duration === d.minutes ? 'rgba(253,164,175,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                  data-testid={`duration-${d.minutes}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={() => setActiveSession(true)}
              className="btn-glass px-8 py-4 text-base flex items-center gap-3"
              style={{ background: 'rgba(253,164,175,0.1)', borderColor: 'rgba(253,164,175,0.25)', color: '#FDA4AF', boxShadow: '0 0 30px rgba(253,164,175,0.08)' }}
              data-testid="hooponopono-start-btn">
              <Heart size={18} fill="#FDA4AF" /> Begin Ho'oponopono
            </button>
            <NarrationPlayer
              text="Ho'oponopono is an ancient Hawaiian practice of forgiveness. It uses four simple yet powerful phrases: I'm sorry. Please forgive me. Thank you. I love you. By repeating these phrases with sincerity, you clear subconscious patterns, heal relationships, and restore harmony within yourself and with others. The practice teaches that by taking responsibility for your inner world, you transform your outer world."
              label="Learn About Practice" color="#FDA4AF" context="meditation" />
          </div>
        </motion.div>
      </div>

      {/* Session Overlay */}
      <AnimatePresence>
        {activeSession && (
          <HooponoponoSession
            target={target}
            targetName={targetName}
            duration={duration}
            onEnd={() => setActiveSession(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
