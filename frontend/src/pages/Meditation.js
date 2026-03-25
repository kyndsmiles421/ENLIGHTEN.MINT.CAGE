import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronRight, ArrowLeft, Sparkles, Moon, Sun, Heart, Zap, Wind, Waves, Brain, Eye, Flame } from 'lucide-react';
import { useSensory } from '../context/SensoryContext';
import CelebrationBurst from '../components/CelebrationBurst';
import NarrationPlayer from '../components/NarrationPlayer';
import FeaturedVideos from '../components/FeaturedVideos';

/* ======== AMBIENT SOUND ENGINE ======== */
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
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.connect(audioCtx.destination);
  nodes.push(gain);

  if (soundId === 'rain') {
    const buf = createNoiseBuffer(audioCtx, 2);
    const src = audioCtx.createBufferSource(); src.buffer = buf; src.loop = true;
    const hp = audioCtx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000;
    const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 8000;
    src.connect(hp); hp.connect(lp); lp.connect(gain); gain.gain.value = 0.08;
    src.start(); nodes.push(src);
  } else if (soundId === 'ocean') {
    const buf = createNoiseBuffer(audioCtx, 4);
    const src = audioCtx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
    const lfo = audioCtx.createOscillator(); lfo.frequency.value = 0.1;
    const lg = audioCtx.createGain(); lg.gain.value = 0.06;
    lfo.connect(lg); lg.connect(gain.gain); lfo.start();
    src.connect(lp); lp.connect(gain); gain.gain.value = 0.12;
    src.start(); nodes.push(src, lfo);
  } else if (soundId === 'bowls') {
    [528, 396, 639].forEach((f, i) => {
      const osc = audioCtx.createOscillator(); osc.type = 'sine'; osc.frequency.value = f;
      const g = audioCtx.createGain(); g.gain.value = 0.04;
      const l = audioCtx.createOscillator(); l.frequency.value = 0.2 + i * 0.1;
      const lg = audioCtx.createGain(); lg.gain.value = 0.02;
      l.connect(lg); lg.connect(g.gain); osc.connect(g); g.connect(audioCtx.destination);
      osc.start(); l.start(); nodes.push(osc, l);
    });
  } else if (soundId === 'forest') {
    const buf = createNoiseBuffer(audioCtx, 2);
    const src = audioCtx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = audioCtx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3000; bp.Q.value = 2;
    src.connect(bp); bp.connect(gain); gain.gain.value = 0.04; src.start(); nodes.push(src);
  } else if (soundId === 'wind') {
    const buf = createNoiseBuffer(audioCtx, 3);
    const src = audioCtx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = audioCtx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 0.5;
    const l = audioCtx.createOscillator(); l.frequency.value = 0.15;
    const lg = audioCtx.createGain(); lg.gain.value = 400;
    l.connect(lg); lg.connect(bp.frequency); src.connect(bp); bp.connect(gain); gain.gain.value = 0.1;
    l.start(); src.start(); nodes.push(src, l);
  }
  return nodes;
}

/* ======== GUIDED MEDITATION DATA ======== */
const GUIDED_MEDITATIONS = [
  {
    id: 'body-scan', name: 'Body Scan Relaxation', icon: Heart, color: '#FDA4AF',
    duration: 12, sound: 'ocean', category: 'relaxation',
    description: 'A progressive journey through your body, releasing tension from head to toes. Perfect for stress relief and before sleep.',
    steps: [
      { time: 0, text: 'Find a comfortable position lying down or seated. Close your eyes gently. Take three deep, cleansing breaths.', duration: 30 },
      { time: 30, text: 'Bring your awareness to the top of your head. Notice any sensation — warmth, tingling, or tightness. Breathe into this area and allow it to soften.', duration: 45 },
      { time: 75, text: 'Let your attention flow down to your forehead and temples. Release any tension you find here. Feel your brow smooth and relax.', duration: 40 },
      { time: 115, text: 'Notice your eyes, your cheeks, your jaw. So many of us hold tension in the jaw without realizing. Let it drop open slightly. Let go.', duration: 45 },
      { time: 160, text: 'Bring awareness to your neck and throat. This area carries the weight of your words, spoken and unspoken. Breathe into it and release.', duration: 40 },
      { time: 200, text: 'Feel your shoulders now. With each exhale, let them drop a little further from your ears. Release what you have been carrying.', duration: 45 },
      { time: 245, text: 'Scan down through your arms, your elbows, your wrists, your hands. Feel warmth and relaxation flowing like liquid light into your fingertips.', duration: 45 },
      { time: 290, text: 'Bring attention to your chest and heart center. Feel your heartbeat — steady, faithful, constant. Breathe love into your own heart.', duration: 50 },
      { time: 340, text: 'Move awareness to your belly. Let it be soft and unguarded. Allow your breath to deepen naturally into your abdomen.', duration: 40 },
      { time: 380, text: 'Notice your lower back, your hips, your sitting bones. These areas hold much of our emotional tension. Breathe warmth here and release.', duration: 45 },
      { time: 425, text: 'Scan down through your thighs, your knees, your calves. Feel them becoming heavy and relaxed, sinking into the surface beneath you.', duration: 45 },
      { time: 470, text: 'Finally, bring awareness to your feet — your ankles, your soles, your toes. Feel the connection to the earth. You are grounded. You are held.', duration: 45 },
      { time: 515, text: 'Now expand your awareness to your entire body as a whole. Feel the wave of relaxation from crown to feet. You are completely at peace.', duration: 45 },
      { time: 560, text: 'Rest here in this peaceful awareness. There is nothing to do, nowhere to go. Simply be. You are enough, exactly as you are.', duration: 60 },
      { time: 620, text: 'When you are ready, begin to gently wiggle your fingers and toes. Take a deep breath. Open your eyes slowly. Carry this peace with you.', duration: 30 },
    ],
  },
  {
    id: 'loving-kindness', name: 'Loving Kindness (Metta)', icon: Heart, color: '#E879F9',
    duration: 10, sound: 'bowls', category: 'compassion',
    description: 'An ancient Buddhist practice of radiating love and compassion — first to yourself, then expanding outward to all beings.',
    steps: [
      { time: 0, text: 'Sit comfortably and close your eyes. Place one hand on your heart. Feel its warmth. Feel its rhythm. You are alive.', duration: 30 },
      { time: 30, text: 'Begin with yourself. Silently repeat: May I be happy. May I be healthy. May I be safe. May I live with ease. Feel these wishes for yourself.', duration: 60 },
      { time: 90, text: 'Now bring to mind someone you love deeply. See their face. Feel your love for them. May you be happy. May you be healthy. May you be safe. May you live with ease.', duration: 60 },
      { time: 150, text: 'Think of a neutral person — perhaps someone you see regularly but do not know well. Extend the same wishes to them. May you be happy. May you be healthy. May you be safe.', duration: 60 },
      { time: 210, text: 'Now, if you are ready, bring to mind someone you find difficult. This is the hardest step. May you be happy. May you be healthy. May you be safe. May you live with ease.', duration: 60 },
      { time: 270, text: 'Finally, expand your loving kindness outward — to your neighborhood, your city, your country, the entire world. May all beings everywhere be happy. May all beings be free from suffering.', duration: 60 },
      { time: 330, text: 'Feel the warmth in your heart radiating outward in every direction, like a sun of compassion. You are connected to all beings through love.', duration: 50 },
      { time: 380, text: 'Rest in this expansive love. Know that every time you practice, you strengthen the capacity for kindness in yourself and in the world.', duration: 50 },
      { time: 430, text: 'Gently return your awareness to this room. Keep your hand on your heart. Take a deep breath. May you carry this love with you always.', duration: 30 },
    ],
  },
  {
    id: 'breath-awareness', name: 'Breath Awareness', icon: Wind, color: '#2DD4BF',
    duration: 8, sound: 'silence', category: 'focus',
    description: 'The foundational meditation — simply observing the breath. Builds concentration, calms the nervous system, and anchors you in the present.',
    steps: [
      { time: 0, text: 'Sit upright with dignity. Spine tall, shoulders relaxed, hands resting on your thighs. Close your eyes or soften your gaze downward.', duration: 25 },
      { time: 25, text: 'Take three intentional breaths. Inhale deeply through the nose. Exhale fully through the mouth. Let the third exhale bring you into stillness.', duration: 35 },
      { time: 60, text: 'Now let your breath return to its natural rhythm. Do not try to control it. Simply observe. Where do you feel the breath most strongly? The nostrils? The chest? The belly?', duration: 50 },
      { time: 110, text: 'Choose one point and rest your attention there. Feel the cool air entering. Feel the warm air leaving. This is your anchor.', duration: 45 },
      { time: 155, text: 'When thoughts arise — and they will — simply notice them without judgment. Label them gently: thinking. Then return to the breath.', duration: 50 },
      { time: 205, text: 'You are not trying to empty your mind. You are training your attention. Each return to the breath is a victory, not a failure.', duration: 45 },
      { time: 250, text: 'Notice the pause between the inhale and the exhale. This tiny gap is a window into pure stillness. Rest in those moments.', duration: 45 },
      { time: 295, text: 'Continue observing your natural breath. Thoughts will come and go like clouds across the sky. You are the sky — vast and unchanging.', duration: 60 },
      { time: 355, text: 'For the remaining time, simply be with your breath. There is nothing else to do. This simplicity is the heart of meditation.', duration: 60 },
      { time: 415, text: 'Gently deepen your breath. Wiggle your fingers and toes. When you are ready, open your eyes. Carry this centered awareness forward.', duration: 25 },
    ],
  },
  {
    id: 'chakra-journey', name: 'Chakra Energy Journey', icon: Zap, color: '#FCD34D',
    duration: 15, sound: 'bowls', category: 'energy',
    description: 'Travel through all seven energy centers from root to crown. Activate, balance, and align your entire chakra system.',
    steps: [
      { time: 0, text: 'Sit comfortably with your spine straight. Close your eyes. Take three grounding breaths. Set the intention to open and balance your energy centers.', duration: 30 },
      { time: 30, text: 'ROOT CHAKRA — Muladhara. Visualize a glowing red sphere at the base of your spine. Feel its warmth. Chant silently: LAM. You are safe. You are grounded. You belong here.', duration: 75 },
      { time: 105, text: 'SACRAL CHAKRA — Svadhisthana. Move your awareness to just below your navel. See an orange light blooming here. Chant: VAM. You are creative. You feel deeply. You allow pleasure.', duration: 75 },
      { time: 180, text: 'SOLAR PLEXUS — Manipura. Feel a golden yellow sun radiating at your stomach center. Chant: RAM. You are powerful. You are confident. Your will is strong.', duration: 75 },
      { time: 255, text: 'HEART CHAKRA — Anahata. A green light expands from your heart center. Chant: YAM. You give love freely. You receive love freely. You are love itself.', duration: 75 },
      { time: 330, text: 'THROAT CHAKRA — Vishuddha. A bright blue light fills your throat area. Chant: HAM. You speak your truth. Your voice matters. You express yourself clearly.', duration: 75 },
      { time: 405, text: 'THIRD EYE — Ajna. An indigo light glows between your eyebrows. Chant: OM. You see clearly. You trust your intuition. You are guided by inner wisdom.', duration: 75 },
      { time: 480, text: 'CROWN CHAKRA — Sahasrara. A violet light opens at the top of your head, connecting you to the infinite. Silence. You are divine consciousness. You are one with all.', duration: 75 },
      { time: 555, text: 'Now visualize all seven lights connected by a column of white light from base to crown. Feel the energy flowing freely through all centers. You are balanced and whole.', duration: 75 },
      { time: 630, text: 'Take three deep breaths, sealing this energy alignment within you. Gently return to the room. Open your eyes when ready. You are radiant.', duration: 30 },
    ],
  },
  {
    id: 'visualization', name: 'Sacred Garden Visualization', icon: Sparkles, color: '#86EFAC',
    duration: 10, sound: 'forest', category: 'visualization',
    description: 'Journey to your inner sacred garden — a personal sanctuary of peace and healing where you can rest and restore.',
    steps: [
      { time: 0, text: 'Close your eyes and take a few deep breaths. With each exhale, feel yourself becoming lighter, freer. You are about to journey inward.', duration: 30 },
      { time: 30, text: 'Imagine yourself standing at a beautiful garden gate. The gate is made of something precious to you — perhaps wood, crystal, or ancient stone. Reach out and open it.', duration: 45 },
      { time: 75, text: 'Step through into your sacred garden. Look around. What do you see? Flowers, trees, water, mountains? This garden is uniquely yours. Let it reveal itself to you.', duration: 60 },
      { time: 135, text: 'Walk slowly along a path. Feel the ground beneath your feet — soft grass, warm stone, cool moss. Notice the colors — they may be more vivid than anything you have seen in waking life.', duration: 50 },
      { time: 185, text: 'You hear the sound of water. Follow it to a pool, a stream, or a waterfall. The water here has healing properties. Cup it in your hands and drink if you wish.', duration: 50 },
      { time: 235, text: 'Find a place to sit — a bench, a rock, a bed of soft flowers. Sit down and feel the deep peace of this place. This is your sanctuary. No one can enter without your permission.', duration: 50 },
      { time: 285, text: 'A warm, golden light begins to surround you. It is the light of healing. It flows through your body, dissolving any pain, any worry, any sorrow. Let it fill you completely.', duration: 60 },
      { time: 345, text: 'If there is a message your garden has for you today, allow it to come. It may be a word, an image, a feeling, or a symbol. Receive it with gratitude.', duration: 50 },
      { time: 395, text: 'Take a final look around your garden. Know that you can return here anytime you need peace, healing, or guidance. This place lives within you always.', duration: 45 },
      { time: 440, text: 'Walk back through the gate. Close it gently behind you. Take a deep breath and return to this room. Open your eyes, carrying the peace of your garden with you.', duration: 30 },
    ],
  },
  {
    id: 'sleep', name: 'Sleep & Deep Rest', icon: Moon, color: '#6366F1',
    duration: 15, sound: 'rain', category: 'sleep',
    description: 'Designed to guide you gently into deep, restful sleep. Progressive relaxation combined with soothing imagery melts away the day.',
    steps: [
      { time: 0, text: 'Lie down comfortably. Pull the covers over you if you wish. Close your eyes. Tonight, you give yourself full permission to let go of everything.', duration: 30 },
      { time: 30, text: 'Begin with five slow breaths. Inhale for 4 counts. Hold for 4. Exhale for 8. Each exhale carries away the weight of the day. Four... hold... eight...', duration: 60 },
      { time: 90, text: 'Imagine your body is made of soft, warm light. Starting at your feet, feel this light growing heavier and warmer. Your feet are sinking into the bed, relaxing completely.', duration: 50 },
      { time: 140, text: 'The warm heaviness rises through your legs — calves, knees, thighs. Each muscle lets go. You could not move them if you tried. They are so beautifully relaxed.', duration: 50 },
      { time: 190, text: 'Your hips and lower back melt into the mattress. Your belly is soft. Your breathing slows naturally. The warm light continues rising through your chest and shoulders.', duration: 50 },
      { time: 240, text: 'Your arms grow heavy. Your hands open and soften. Your neck releases. Your jaw unclenches. Your face smooths. Your eyelids are so heavy.', duration: 50 },
      { time: 290, text: 'Your entire body is now a pool of warm, heavy, golden light. You are floating in perfect comfort. Nothing can disturb this peace.', duration: 50 },
      { time: 340, text: 'Imagine a gentle night sky above you. Stars slowly appear, one by one. Each star carries away one thought, one worry. The sky grows darker and more peaceful.', duration: 60 },
      { time: 400, text: 'A soft, cool breeze carries the scent of lavender. You hear distant, gentle rain on leaves. Everything is perfect. Everything is exactly as it should be.', duration: 60 },
      { time: 460, text: 'You are drifting now, gently, peacefully, like a leaf on a still pond. Let go. Let yourself float. There is nothing to do. Nothing to think about. Only rest.', duration: 60 },
      { time: 520, text: 'Sleep is coming now, like a warm tide. Welcome it. You are safe. You are loved. Tomorrow will take care of itself. For now, there is only this beautiful, deep rest...', duration: 60 },
      { time: 580, text: '...drifting... floating... resting... You are held by the universe itself. Sleep now. Deep, peaceful, restorative sleep...', duration: 60 },
    ],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'relaxation', label: 'Relaxation', icon: Waves },
  { id: 'compassion', label: 'Compassion', icon: Heart },
  { id: 'focus', label: 'Focus', icon: Brain },
  { id: 'energy', label: 'Energy', icon: Zap },
  { id: 'visualization', label: 'Visualization', icon: Eye },
  { id: 'sleep', label: 'Sleep', icon: Moon },
];

const PRESETS = [
  { name: 'Quick Center', minutes: 5, color: '#2DD4BF' },
  { name: 'Morning Ritual', minutes: 10, color: '#D8B4FE' },
  { name: 'Deep Dive', minutes: 20, color: '#FCD34D' },
  { name: 'Extended Journey', minutes: 30, color: '#FDA4AF' },
  { name: 'Sacred Hour', minutes: 60, color: '#86EFAC' },
];

const AMBIENT_SOUNDS = [
  { name: 'Silence', id: 'silence' },
  { name: 'Rain', id: 'rain' },
  { name: 'Ocean Waves', id: 'ocean' },
  { name: 'Forest', id: 'forest' },
  { name: 'Singing Bowls', id: 'bowls' },
  { name: 'Wind', id: 'wind' },
];

/* ======== GUIDED SESSION COMPONENT ======== */
function GuidedSession({ meditation, onEnd }) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef([]);
  const { playCelebration } = useSensory();
  const totalDuration = meditation.duration * 60;

  useEffect(() => {
    if (meditation.sound !== 'silence') {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;
        nodesRef.current = startAmbientSound(ctx, meditation.sound);
      } catch {}
    }
    return () => {
      nodesRef.current.forEach(n => { try { n.stop?.(); } catch {} });
      try { audioCtxRef.current?.close(); } catch {}
    };
  }, [meditation.sound]);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (next >= totalDuration) {
          clearInterval(intervalRef.current);
          playCelebration();
          setCelebrating(true);
          return totalDuration;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [paused, totalDuration, playCelebration]);

  useEffect(() => {
    const steps = meditation.steps;
    for (let i = steps.length - 1; i >= 0; i--) {
      if (elapsed >= steps[i].time) { setCurrentStepIdx(i); break; }
    }
  }, [elapsed, meditation.steps]);

  const step = meditation.steps[currentStepIdx];
  const progress = elapsed / totalDuration;
  const mins = Math.floor((totalDuration - elapsed) / 60);
  const secs = (totalDuration - elapsed) % 60;
  const Icon = meditation.icon;

  const narrationText = meditation.steps.map(s => s.text).join(' ... ');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{ background: '#0B0C15' }}
      data-testid="guided-session"
    >
      <CelebrationBurst active={celebrating} onComplete={() => { setCelebrating(false); onEnd(); }} />

      {/* Ambient background */}
      <motion.div className="absolute inset-0"
        animate={{ background: [
          `radial-gradient(ellipse at 40% 40%, ${meditation.color}10 0%, transparent 60%)`,
          `radial-gradient(ellipse at 60% 60%, ${meditation.color}18 0%, transparent 60%)`,
          `radial-gradient(ellipse at 40% 40%, ${meditation.color}10 0%, transparent 60%)`,
        ] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* Progress ring */}
      <div className="relative w-56 h-56 flex items-center justify-center mb-8">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
          <circle cx="100" cy="100" r="90" fill="none" stroke={meditation.color} strokeWidth="2" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 90} strokeDashoffset={2 * Math.PI * 90 * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear' }} opacity="0.5" />
        </svg>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: `${meditation.color}12`, border: `1px solid ${meditation.color}20` }}>
          <Icon size={32} style={{ color: meditation.color, filter: `drop-shadow(0 0 12px ${meditation.color}60)` }} />
        </motion.div>
      </div>

      {/* Step text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentStepIdx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.6 }}
          className="text-center text-base md:text-lg leading-relaxed max-w-xl relative z-10"
          style={{ color: 'rgba(248,250,252,0.8)', fontFamily: 'Cormorant Garamond, serif' }}
          data-testid="guided-step-text"
        >
          {step.text}
        </motion.p>
      </AnimatePresence>

      {/* Step progress dots */}
      <div className="flex gap-1.5 mt-6 flex-wrap justify-center max-w-md">
        {meditation.steps.map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-500"
            style={{ background: i <= currentStepIdx ? meditation.color : 'rgba(255,255,255,0.08)', boxShadow: i === currentStepIdx ? `0 0 6px ${meditation.color}` : 'none' }} />
        ))}
      </div>

      {/* Timer */}
      <p className="text-2xl font-light mt-6 tabular-nums relative z-10" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Cormorant Garamond, serif' }}>
        {mins}:{secs.toString().padStart(2, '0')}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-6 relative z-10">
        <button onClick={() => setPaused(!paused)} className="p-3 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }} data-testid="guided-pause">
          {paused ? <Play size={20} /> : <Pause size={20} />}
        </button>
        <button onClick={onEnd} className="px-5 py-2 rounded-full text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }} data-testid="guided-end">
          End Session
        </button>
      </div>

      {/* Narration */}
      <div className="mt-4 relative z-10">
        <NarrationPlayer text={narrationText} label="Voice Guide" color={meditation.color} />
      </div>
    </motion.div>
  );
}

/* ======== TIMER-ONLY MODE ======== */
function TimerMode() {
  const [preset, setPreset] = useState(PRESETS[1]);
  const [timeLeft, setTimeLeft] = useState(PRESETS[1].minutes * 60);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState('silence');
  const [celebrating, setCelebrating] = useState(false);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef([]);
  const { playCelebration } = useSensory();

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const progress = 1 - timeLeft / (preset.minutes * 60);

  const stopAudio = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop?.(); } catch {} });
    nodesRef.current = [];
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} }
    audioCtxRef.current = null;
  }, []);

  const startAudio = useCallback((sid) => {
    stopAudio();
    if (sid === 'silence') return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    nodesRef.current = startAmbientSound(ctx, sid);
  }, [stopAudio]);

  useEffect(() => {
    if (running && sound !== 'silence') startAudio(sound); else stopAudio();
    return stopAudio;
  }, [running, sound, startAudio, stopAudio]);

  const toggle = useCallback(() => {
    if (running) { clearInterval(intervalRef.current); setRunning(false); }
    else {
      setRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current); setRunning(false);
            playCelebration(); setCelebrating(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [running, playCelebration]);

  const reset = () => { clearInterval(intervalRef.current); setRunning(false); setTimeLeft(preset.minutes * 60); };
  useEffect(() => { if (!running) setTimeLeft(preset.minutes * 60); }, [preset, running]);
  useEffect(() => () => { clearInterval(intervalRef.current); stopAudio(); }, [stopAudio]);

  const circumference = 2 * Math.PI * 140;

  return (
    <>
      <CelebrationBurst active={celebrating} onComplete={() => setCelebrating(false)} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Duration</p>
            <div className="space-y-2">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => { if (!running) setPreset(p); }}
                  className="glass-card w-full text-left p-4 flex items-center justify-between"
                  style={{ borderColor: preset.name === p.name ? `${p.color}40` : 'rgba(255,255,255,0.08)', opacity: running && preset.name !== p.name ? 0.3 : 1, transition: 'all 0.3s' }}
                  data-testid={`meditation-preset-${p.minutes}`}>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{p.minutes} min</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Ambient Sound</p>
            <div className="grid grid-cols-2 gap-2">
              {AMBIENT_SOUNDS.map(s => (
                <button key={s.id} onClick={() => setSound(s.id)}
                  className="glass-card p-3 text-center text-sm"
                  style={{ borderColor: sound === s.id ? 'rgba(216,180,254,0.3)' : 'rgba(255,255,255,0.08)', color: sound === s.id ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'all 0.3s' }}
                  data-testid={`sound-${s.id}`}>{s.name}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[500px]">
          <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center mb-12">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 300 300">
              <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
              <circle cx="150" cy="150" r="140" fill="none" stroke={preset.color} strokeWidth="2" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
                style={{ transition: 'stroke-dashoffset 1s linear' }} opacity="0.6" />
            </svg>
            <div className="text-center z-10">
              <p className="text-6xl md:text-7xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{formatTime(timeLeft)}</p>
              <p className="text-xs uppercase tracking-[0.2em] mt-3" style={{ color: 'var(--text-muted)' }}>
                {running ? 'In session' : timeLeft === 0 ? 'Complete' : preset.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggle} className="btn-glass px-8 py-4 flex items-center gap-3"
              style={{ boxShadow: running ? `0 0 40px ${preset.color}20` : undefined }} data-testid="meditation-toggle-btn">
              {running ? <Pause size={20} /> : <Play size={20} />}
              {running ? 'Pause' : timeLeft === 0 ? 'Restart' : 'Begin Session'}
            </button>
            {(running || timeLeft < preset.minutes * 60) && (
              <button onClick={reset} className="btn-glass px-4 py-4" data-testid="meditation-reset-btn"><RotateCcw size={20} /></button>
            )}
          </div>
          <div className="mt-6">
            <NarrationPlayer
              text={`Welcome to your ${preset.name} meditation. Find a comfortable position and gently close your eyes. Take a deep breath in. And slowly exhale. For the next ${preset.minutes} minutes, simply be present. Notice the sensations in your body without judgment. If thoughts arise, acknowledge them and gently return to your breath. You are safe. You are at peace.`}
              label="Guided Voice" color={preset.color} />
          </div>
        </div>
      </div>
    </>
  );
}

/* ======== MAIN PAGE ======== */
export default function Meditation() {
  const [mode, setMode] = useState('guided'); // 'guided' | 'timer'
  const [filter, setFilter] = useState('all');
  const [activeSession, setActiveSession] = useState(null);

  const filtered = filter === 'all' ? GUIDED_MEDITATIONS : GUIDED_MEDITATIONS.filter(m => m.category === filter);

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--primary)' }}>Meditation</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Stillness Within
          </h1>
          <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
            Choose a guided journey or set your own timer. Enter the silence. Emerge renewed.
          </p>
        </motion.div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-8" data-testid="meditation-mode-toggle">
          {[{ id: 'guided', label: 'Guided Meditations', icon: Sparkles }, { id: 'timer', label: 'Timer Mode', icon: RotateCcw }].map(m => {
            const Icon = m.icon;
            return (
              <button key={m.id} onClick={() => setMode(m.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
                style={{
                  background: mode === m.id ? 'rgba(216,180,254,0.12)' : 'rgba(255,255,255,0.02)',
                  color: mode === m.id ? '#D8B4FE' : 'var(--text-muted)',
                  border: `1px solid ${mode === m.id ? 'rgba(216,180,254,0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}
                data-testid={`meditation-mode-${m.id}`}>
                <Icon size={14} /> {m.label}
              </button>
            );
          })}
        </div>

        {mode === 'guided' ? (
          <>
            {/* Category filters */}
            <div className="flex gap-2 mb-8 flex-wrap" data-testid="meditation-category-filters">
              {CATEGORIES.map(c => {
                const Icon = c.icon;
                return (
                  <button key={c.id} onClick={() => setFilter(c.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
                    style={{
                      background: filter === c.id ? 'rgba(216,180,254,0.12)' : 'rgba(255,255,255,0.02)',
                      color: filter === c.id ? '#D8B4FE' : 'var(--text-muted)',
                      border: `1px solid ${filter === c.id ? 'rgba(216,180,254,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                    data-testid={`meditation-filter-${c.id}`}>
                    <Icon size={11} /> {c.label}
                  </button>
                );
              })}
            </div>

            {/* Guided meditation cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((m, i) => {
                const Icon = m.icon;
                return (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass-card glass-card-hover p-7 cursor-pointer group"
                    onClick={() => setActiveSession(m)}
                    data-testid={`meditation-card-${m.id}`}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ background: `${m.color}12` }}>
                        <Icon size={20} style={{ color: m.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{m.name}</h3>
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span>{m.duration} min</span>
                          <span>&middot;</span>
                          <span className="capitalize">{m.category}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{m.description}</p>
                    <div className="flex items-center gap-2 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <span className="text-xs flex items-center gap-1.5" style={{ color: m.color }}>
                        <Play size={12} fill={m.color} /> Begin Guided Session
                      </span>
                      <ChevronRight size={14} style={{ color: m.color, marginLeft: 'auto' }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <TimerMode />
        )}

        <div className="mt-16">
          <FeaturedVideos category="meditation" color="#D8B4FE" title="Meditation Practice Videos" />
        </div>
      </div>

      {/* Guided Session Overlay */}
      <AnimatePresence>
        {activeSession && (
          <GuidedSession meditation={activeSession} onEnd={() => setActiveSession(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
