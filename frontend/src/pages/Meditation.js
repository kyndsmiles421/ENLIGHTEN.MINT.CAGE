import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Play, Pause, RotateCcw, ChevronRight, ArrowLeft, Sparkles, Moon, Sun, Heart, Zap, Wind, Waves, Brain, Eye, Flame, PenTool, Loader2, Trash2, Save, Wand2, Star, Image, Headphones, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import { useSearchParams } from 'react-router-dom';
import CelebrationBurst from '../components/CelebrationBurst';
import NarrationPlayer from '../components/NarrationPlayer';
import SovereignViewport from '../components/SovereignViewport';
import FeaturedVideos from '../components/FeaturedVideos';
import useWorkAccrual from '../hooks/useWorkAccrual';
import { ProximityItem } from '../components/SpatialRoom';
import HolographicChamber from '../components/HolographicChamber';
import WellnessDisclaimer from '../components/WellnessDisclaimer';
import ChamberProp from '../components/ChamberProp';
import BreathPacerGame from '../components/games/BreathPacerGame';
import MandalaRitual from '../components/games/MandalaRitual';
import RippleBurst from '../components/RippleBurst';
import { Wind as WindIcon, Bell, Flower } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
  const [aiAmbient, setAiAmbient] = useState(null);
  const [soundOn, setSoundOn] = useState(false); // Sound OFF by default
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef([]);
  const rootRef = useRef(null);
  const { playCelebration } = useSensory();
  const totalDuration = meditation.duration * 60;

  // Auto-scroll the session into view on mount (mobile critical — the grid
  // used to stay above and the user thought the button was dead).
  useEffect(() => {
    if (rootRef.current && typeof rootRef.current.scrollIntoView === 'function') {
      rootRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
    }
  }, [meditation.id]);

  // Manual sound toggle function
  const toggleSound = useCallback(() => {
    if (soundOn) {
      // Stop sound
      nodesRef.current.forEach(n => { try { n.stop?.(); } catch {} });
      nodesRef.current = [];
      if (audioCtxRef.current) { 
        try { audioCtxRef.current.close(); } catch {} 
      }
      audioCtxRef.current = null;
      setSoundOn(false);
    } else {
      // Start sound
      if (meditation.sound !== 'silence') {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          audioCtxRef.current = ctx;
          nodesRef.current = startAmbientSound(ctx, meditation.sound);
          setSoundOn(true);
        } catch {}
      }
    }
  }, [soundOn, meditation.sound]);

  useEffect(() => {
    // AUDIO OFF BY DEFAULT - User must manually start sound
    // No auto-play on room entry (User-Centric Control policy)
    
    // Try to generate AI ambient visual only (no audio)
    const genAmbient = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const r = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/ai-visuals/meditation`, {
            theme: `${meditation.name} ${meditation.category || 'cosmic peace'}`,
          }, { headers: { Authorization: `Bearer ${token}` }, timeout: 90000 });
          setAiAmbient(r.data.image_b64);
        }
      } catch {}
    };
    genAmbient();
    
    // Cleanup on unmount - kill any audio that might be playing
    return () => {
      nodesRef.current.forEach(n => { try { n.stop?.(); } catch {} });
      try { audioCtxRef.current?.close(); } catch {}
    };
  }, [meditation.name, meditation.category]);

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
      ref={rootRef}
      className="relative w-full flex flex-col items-center justify-center p-6"
      style={{ background: 'transparent', minHeight: '70vh' }}
      data-testid="guided-session"
    >
      <CelebrationBurst active={celebrating} onComplete={() => { setCelebrating(false); onEnd(); }} />

      {/* AI Ambient Background */}
      {aiAmbient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 3 }}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(data:image/png;base64,${aiAmbient})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(12px) saturate(1.5)',
          }}
        />
      )}

      {/* Multi-layer ambient background — immersive portal */}
      <motion.div className="absolute inset-0"
        animate={{ background: [
          `radial-gradient(ellipse at 40% 40%, ${meditation.color}15 0%, transparent 55%)`,
          `radial-gradient(ellipse at 60% 60%, ${meditation.color}22 0%, transparent 55%)`,
          `radial-gradient(ellipse at 40% 40%, ${meditation.color}15 0%, transparent 55%)`,
        ] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      {/* Secondary aurora layer */}
      <motion.div className="absolute inset-0 opacity-40"
        animate={{ background: [
          `radial-gradient(ellipse at 70% 30%, rgba(6,182,212,0.08) 0%, transparent 50%)`,
          `radial-gradient(ellipse at 30% 70%, rgba(234,179,8,0.06) 0%, transparent 50%)`,
          `radial-gradient(ellipse at 70% 30%, rgba(6,182,212,0.08) 0%, transparent 50%)`,
        ] }}
        transition={{ duration: 18, repeat: Infinity }}
      />

      {/* Floating particles around the meditation circle */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            background: meditation.color,
            opacity: 0.15,
            top: `${35 + Math.sin(i * 0.5) * 20}%`,
            left: `${35 + Math.cos(i * 0.8) * 25}%`,
          }}
          animate={{
            y: [0, -20 - i * 3, 0],
            x: [0, (i % 2 === 0 ? 10 : -10), 0],
            opacity: [0.08, 0.25, 0.08],
          }}
          transition={{ duration: 5 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      {/* Progress ring — enhanced with multi-ring glow */}
      <div className="relative w-56 h-56 flex items-center justify-center mb-8">
        {/* Outer glow rings */}
        {[1.15, 1.3].map((s, i) => (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{
              width: `${s * 100}%`, height: `${s * 100}%`,
              border: `1px solid ${meditation.color}${i === 0 ? '10' : '06'}`,
            }}
            animate={{ scale: [1, 1.03, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4 + i * 2, repeat: Infinity }}
          />
        ))}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
          <circle cx="100" cy="100" r="90" fill="none" stroke={meditation.color} strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 90} strokeDashoffset={2 * Math.PI * 90 * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 8px ${meditation.color}40)` }} opacity="0.6" />
        </svg>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: `${meditation.color}12`,
            border: `1px solid ${meditation.color}20`,
            boxShadow: `0 0 30px ${meditation.color}15, inset 0 0 20px ${meditation.color}08`,
          }}>
          <Icon size={32} style={{ color: meditation.color, filter: `drop-shadow(0 0 16px ${meditation.color}80)` }} />
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
        {/* Sound Toggle - Manual control */}
        {meditation.sound !== 'silence' && (
          <button 
            onClick={toggleSound} 
            className="p-3 rounded-full transition-all" 
            style={{ 
              background: soundOn ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.06)', 
              color: soundOn ? '#2DD4BF' : '#fff',
              border: soundOn ? '1px solid rgba(45,212,191,0.3)' : '1px solid transparent',
            }} 
            data-testid="guided-sound-toggle"
            title={soundOn ? 'Sound On (tap to mute)' : 'Sound Off (tap to play)'}
          >
            {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        )}
        <button onClick={() => setPaused(!paused)} className="p-3 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }} data-testid="guided-pause">
          {paused ? <Play size={20} /> : <Pause size={20} />}
        </button>
        <button onClick={onEnd} className="px-5 py-2 rounded-full text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }} data-testid="guided-end">
          End Session
        </button>
      </div>

      {/* Narration */}
      <div className="mt-4 relative z-10">
        <NarrationPlayer text={narrationText} label="Voice Guide" color={meditation.color} context="meditation" />
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
                  className="w-full text-left p-4 flex items-center justify-between"
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
                  className="p-3 text-center text-sm"
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
              label="Guided Voice" color={preset.color} context="meditation" />
          </div>
        </div>
      </div>
    </>
  );
}

const BUILD_FOCUSES = [
  { id: 'stress', label: 'Stress Relief', icon: Waves, color: '#3B82F6' },
  { id: 'sleep', label: 'Deep Sleep', icon: Moon, color: '#6366F1' },
  { id: 'focus', label: 'Mental Clarity', icon: Brain, color: '#2DD4BF' },
  { id: 'healing', label: 'Healing', icon: Heart, color: '#FDA4AF' },
  { id: 'gratitude', label: 'Gratitude', icon: Sun, color: '#FCD34D' },
  { id: 'confidence', label: 'Confidence', icon: Flame, color: '#FB923C' },
  { id: 'letting-go', label: 'Letting Go', icon: Wind, color: '#C084FC' },
];

const BUILD_DURATIONS = [5, 8, 10, 15, 20];
const BUILD_COLORS = ['#D8B4FE', '#2DD4BF', '#FCD34D', '#FDA4AF', '#6366F1', '#22C55E', '#FB923C', '#3B82F6'];

function BuildYourOwn({ onPlay }) {
  const { user, authHeaders } = useAuth();
  const { playChime } = useSensory();
  const [step, setStep] = useState(1); // 1=intention, 2=settings, 3=generating, 4=review
  const [intention, setIntention] = useState('');
  const [focus, setFocus] = useState('stress');
  const [duration, setDuration] = useState(10);
  const [sound, setSound] = useState('ocean');
  const [color, setColor] = useState('#D8B4FE');
  const [name, setName] = useState('');
  const [generatedSteps, setGeneratedSteps] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [editText, setEditText] = useState('');
  const [saved, setSaved] = useState([]);
  const [saving, setSaving] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [meditationAudio, setMeditationAudio] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState('sage');

  const loadSaved = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/meditation/my-custom`, { headers: authHeaders });
      setSaved(res.data);
    } catch {}
  }, [user, authHeaders]);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  const generate = async () => {
    if (!intention.trim()) { toast.error('Please describe your intention'); return; }
    setGenerating(true);
    setStep(3);
    try {
      const res = await axios.post(`${API}/meditation/generate-guided`, {
        intention: intention.trim(), duration, focus, name: name || `My ${BUILD_FOCUSES.find(f => f.id === focus)?.label} Meditation`,
      }, { headers: authHeaders });
      setGeneratedSteps(res.data.steps);
      setStep(4);
      playChime();
    } catch (e) {
      toast.error('Generation failed. Please try again.');
      setStep(2);
    } finally {
      setGenerating(false);
    }
  };

  const saveAndPlay = async () => {
    const meditationName = name || `My ${BUILD_FOCUSES.find(f => f.id === focus)?.label} Meditation`;
    const med = {
      id: `custom-${Date.now()}`, name: meditationName, icon: Sparkles, color,
      duration, sound, category: 'custom', description: intention,
      steps: generatedSteps,
    };

    // Save to backend if logged in
    if (user) {
      setSaving(true);
      try {
        await axios.post(`${API}/meditation/save-custom`, {
          name: meditationName, intention, focus, duration, sound, color, steps: generatedSteps,
        }, { headers: authHeaders });
        loadSaved();
        toast.success('Meditation saved to your collection!');
      } catch { toast.error('Could not save, but you can still play it.'); }
      setSaving(false);
    }

    // Silent dust accrual for meditation creation
    if (typeof window.__workAccrue === 'function') window.__workAccrue('meditation_session', duration || 15);

    onPlay(med);
  };

  const playOnly = () => {
    const meditationName = name || `My ${BUILD_FOCUSES.find(f => f.id === focus)?.label} Meditation`;
    onPlay({
      id: `temp-${Date.now()}`, name: meditationName, icon: Sparkles, color,
      duration, sound, category: 'custom', description: intention,
      steps: generatedSteps,
    });
  };

  const playSaved = (s) => {
    onPlay({
      id: s.id, name: s.name, icon: Sparkles, color: s.color || '#D8B4FE',
      duration: s.duration, sound: s.sound || 'silence', category: 'custom',
      description: s.intention, steps: s.steps,
    });
  };

  const deleteSaved = async (id) => {
    try {
      await axios.delete(`${API}/meditation/custom/${id}`, { headers: authHeaders });
      setSaved(prev => prev.filter(s => s.id !== id));
      toast.success('Deleted');
    } catch {}
  };

  const generateAudio = async () => {
    if (!generatedSteps.length) return;
    setGeneratingAudio(true);
    try {
      const res = await axios.post(`${API}/meditation/generate-audio`, {
        steps: generatedSteps, voice: selectedVoice, speed: 0.85,
      }, { headers: authHeaders });
      setMeditationAudio(`data:audio/mp3;base64,${res.data.audio}`);
      toast.success('Meditation audio narration generated!');
    } catch (e) {
      toast.error('Could not generate audio. Please try again.');
    }
    setGeneratingAudio(false);
  };

  const startEdit = (i) => { setEditIdx(i); setEditText(generatedSteps[i].text); };
  const saveEdit = () => {
    if (editIdx === null) return;
    setGeneratedSteps(prev => prev.map((s, i) => i === editIdx ? { ...s, text: editText } : s));
    setEditIdx(null);
  };

  if (!user) return (
    <div className="p-12 text-center">
      <Wand2 size={32} style={{ color: 'rgba(216,180,254,0.3)', margin: '0 auto 12px' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to build personalized guided meditations with AI.</p>
    </div>
  );

  const focusConfig = BUILD_FOCUSES.find(f => f.id === focus);

  return (
    <div className="space-y-8">
      {/* Saved Custom Meditations */}
      {saved.length > 0 && step === 1 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Your Custom Meditations</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {saved.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="p-5 group" data-testid={`saved-meditation-${s.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</h4>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.duration} min &middot; {s.focus}</p>
                  </div>
                  <button onClick={() => deleteSaved(s.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    data-testid={`delete-custom-${s.id}`}>
                    <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
                <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>{s.intention}</p>
                <button onClick={() => playSaved(s)}
                  className="w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all"
                  style={{ background: `${s.color || '#D8B4FE'}12`, color: s.color || '#D8B4FE', border: `1px solid ${s.color || '#D8B4FE'}25` }}
                  data-testid={`play-custom-${s.id}`}>
                  <Play size={12} fill={s.color || '#D8B4FE'} /> Begin Session
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Builder */}
      <div className="p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full" style={{
          background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`, filter: 'blur(30px)',
        }} />

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8 relative z-10">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium transition-all"
                style={{
                  background: step >= s ? `${color}20` : 'rgba(255,255,255,0.03)',
                  color: step >= s ? color : 'var(--text-muted)',
                  border: `1px solid ${step >= s ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
                }}>
                {s}
              </div>
              {s < 4 && <div className="w-8 h-px" style={{ background: step > s ? `${color}30` : 'rgba(255,255,255,0.06)' }} />}
            </div>
          ))}
          <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
            {step === 1 && 'Set Intention'}{step === 2 && 'Configure'}{step === 3 && 'Generating...'}{step === 4 && 'Review & Play'}
          </span>
        </div>

        {/* Step 1: Intention */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative z-10">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>
                What do you need right now?
              </label>
              <textarea
                value={intention}
                onChange={e => setIntention(e.target.value)}
                placeholder="I want to release the stress from today and find deep inner calm... / I need to quiet my racing mind before sleep... / I want to heal from a painful experience..."
                className="input-glass w-full h-28 resize-none text-sm leading-relaxed"
                data-testid="build-intention-input"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>
                Focus Area
              </label>
              <div className="flex flex-wrap gap-2" data-testid="build-focus-selector">
                {BUILD_FOCUSES.map(f => {
                  const Icon = f.icon;
                  return (
                    <button key={f.id} onClick={() => setFocus(f.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all"
                      style={{
                        background: focus === f.id ? `${f.color}15` : 'rgba(255,255,255,0.02)',
                        color: focus === f.id ? f.color : 'var(--text-muted)',
                        border: `1px solid ${focus === f.id ? `${f.color}30` : 'rgba(255,255,255,0.06)'}`,
                      }}
                      data-testid={`build-focus-${f.id}`}>
                      <Icon size={13} /> {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => { if (!intention.trim()) { toast.error('Please describe your intention'); return; } setStep(2); }}
                className="btn-glass px-6 py-2.5 text-sm flex items-center gap-2"
                style={{ background: `${color}12`, borderColor: `${color}30`, color }}
                data-testid="build-next-step2">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Settings */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative z-10">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>
                Name your meditation (optional)
              </label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder={`My ${focusConfig?.label} Meditation`}
                className="input-glass w-full text-sm" data-testid="build-name-input" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>Duration</label>
              <div className="flex gap-2">
                {BUILD_DURATIONS.map(d => (
                  <button key={d} onClick={() => setDuration(d)}
                    className="px-4 py-2 rounded-xl text-xs transition-all"
                    style={{
                      background: duration === d ? `${color}15` : 'rgba(255,255,255,0.02)',
                      color: duration === d ? color : 'var(--text-muted)',
                      border: `1px solid ${duration === d ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
                    }}
                    data-testid={`build-duration-${d}`}>{d} min</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: 'var(--text-muted)' }}>Ambient Sound</label>
              <div className="flex flex-wrap gap-2">
                {AMBIENT_SOUNDS.map(s => (
                  <button key={s.id} onClick={() => setSound(s.id)}
                    className="px-3 py-2 rounded-xl text-xs transition-all"
                    style={{
                      background: sound === s.id ? `${color}15` : 'rgba(255,255,255,0.02)',
                      color: sound === s.id ? color : 'var(--text-muted)',
                      border: `1px solid ${sound === s.id ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
                    }}
                    data-testid={`build-sound-${s.id}`}>{s.name}</button>
                ))}
              </div>
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
                    data-testid={`build-color-${c}`} />
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={generate}
                className="btn-glass px-6 py-2.5 text-sm flex items-center gap-2"
                style={{ background: `${color}12`, borderColor: `${color}30`, color }}
                data-testid="build-generate-btn">
                <Wand2 size={14} /> Generate My Meditation
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Generating */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center relative z-10">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 mx-auto mb-6 rounded-full"
              style={{ border: `2px solid ${color}30`, borderTopColor: color }} />
            <p className="text-base" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-secondary)' }}>
              Crafting your personal meditation...
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              AI is weaving your intention into a unique guided journey
            </p>
          </motion.div>
        )}

        {/* Step 4: Review & Edit */}
        {step === 4 && generatedSteps.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles size={16} style={{ color }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {name || `My ${focusConfig?.label} Meditation`} — {duration} min, {generatedSteps.length} steps
              </p>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Review and edit any step to make it truly yours. Tap a step to edit.
            </p>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2" data-testid="build-steps-list">
              {generatedSteps.map((s, i) => (
                <div key={i} className="p-4 rounded-xl transition-all cursor-pointer group"
                  style={{ background: editIdx === i ? `${color}08` : 'rgba(255,255,255,0.02)', border: `1px solid ${editIdx === i ? `${color}20` : 'rgba(255,255,255,0.04)'}` }}
                  onClick={() => editIdx !== i && startEdit(i)}
                  data-testid={`build-step-${i}`}>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5"
                      style={{ background: `${color}15`, color }}>
                      {i + 1}
                    </span>
                    {editIdx === i ? (
                      <div className="flex-1">
                        <textarea value={editText} onChange={e => setEditText(e.target.value)}
                          className="input-glass w-full text-sm h-20 resize-none" autoFocus
                          data-testid={`build-step-edit-${i}`} />
                        <div className="flex gap-2 mt-2">
                          <button onClick={saveEdit} className="text-xs px-3 py-1 rounded-full"
                            style={{ background: `${color}15`, color }}>Save</button>
                          <button onClick={() => setEditIdx(null)} className="text-xs px-3 py-1 rounded-full"
                            style={{ color: 'var(--text-muted)' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
                        {s.text}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => { setStep(1); setGeneratedSteps([]); }}
                className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <ArrowLeft size={14} /> Start Over
              </button>
              <button onClick={generate}
                className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
                data-testid="build-regenerate">
                <RotateCcw size={12} /> Regenerate
              </button>
              <div className="ml-auto flex gap-3">
                <button onClick={playOnly}
                  className="btn-glass px-5 py-2 text-sm flex items-center gap-2"
                  data-testid="build-play-only">
                  <Play size={14} /> Play Now
                </button>
                <button onClick={saveAndPlay} disabled={saving}
                  className="btn-glass px-5 py-2 text-sm flex items-center gap-2"
                  style={{ background: `${color}15`, borderColor: `${color}30`, color }}
                  data-testid="build-save-play">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save & Play
                </button>
              </div>
            </div>

            {/* AI Audio Narration */}
            <div className="p-5 mt-2" data-testid="meditation-audio-section">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Headphones size={14} style={{ color }} />
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>AI Voice Narration</p>
                </div>
              </div>
              <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
                Generate a spoken audio narration of your meditation using AI voices
              </p>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Voice:</span>
                {['sage', 'shimmer', 'nova', 'alloy', 'echo', 'fable', 'onyx'].map(v => (
                  <button key={v} onClick={() => setSelectedVoice(v)}
                    className="px-2.5 py-1 rounded-lg text-[10px] capitalize transition-all"
                    style={{
                      background: selectedVoice === v ? `${color}15` : 'rgba(255,255,255,0.02)',
                      color: selectedVoice === v ? color : 'var(--text-muted)',
                      border: `1px solid ${selectedVoice === v ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
                    }}
                    data-testid={`voice-${v}`}>{v}</button>
                ))}
              </div>
              <button onClick={generateAudio} disabled={generatingAudio}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
                style={{ background: `${color}12`, border: `1px solid ${color}25`, color, opacity: generatingAudio ? 0.6 : 1 }}
                data-testid="generate-audio-btn">
                {generatingAudio ? <><Loader2 size={12} className="animate-spin" /> Generating Audio...</> : <><Headphones size={12} /> Generate Audio Narration</>}
              </button>
              {meditationAudio && (
                <div className="mt-3 flex items-center gap-3">
                  <audio controls src={meditationAudio} className="flex-1 h-10" style={{ filter: 'invert(1) hue-rotate(180deg)', opacity: 0.7 }} data-testid="meditation-audio-player" />
                  <a href={meditationAudio} download={`meditation_${name || 'custom'}.mp3`}
                    className="p-2 rounded-lg transition-all hover:scale-105"
                    style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)' }}
                    data-testid="download-meditation-audio">
                    <Save size={12} style={{ color: '#2DD4BF' }} />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ======== CONSTELLATION MEDITATIONS ======== */

const ELEMENT_SOUNDS = { Fire: 'bowls', Earth: 'forest', Air: 'wind', Water: 'ocean' };

function ConstellationMeditations({ onPlay, highlightId }) {
  const { user, authHeaders } = useAuth();
  const { playChime } = useSensory();
  const [themes, setThemes] = useState([]);
  const [userZodiac, setUserZodiac] = useState(null);
  const [saved, setSaved] = useState([]);
  const [generating, setGenerating] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [loading, setLoading] = useState(true);
  const highlightRef = useRef(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const [themesRes, savedRes] = await Promise.all([
        axios.get(`${API}/meditation/constellation-themes`, { headers: authHeaders }),
        axios.get(`${API}/meditation/my-constellation`, { headers: authHeaders }),
      ]);
      setThemes(themesRes.data.themes || []);
      setUserZodiac(themesRes.data.user_zodiac);
      setSaved(savedRes.data || []);
    } catch {}
    setLoading(false);
  }, [user, authHeaders]);

  useEffect(() => { load(); }, [load]);

  // Auto-scroll to highlighted constellation from Star Chart
  useEffect(() => {
    if (highlightId && !loading && highlightRef.current) {
      setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }
  }, [highlightId, loading]);

  const generate = async (constellationId) => {
    setGenerating(constellationId);
    try {
      const res = await axios.post(`${API}/meditation/generate-constellation`, {
        constellation_id: constellationId, duration: selectedDuration,
      }, { headers: authHeaders });
      const med = res.data.meditation;
      const constellation = res.data.constellation;
      playChime();
      setSaved(prev => [med, ...prev]);
      // Auto-play
      onPlay({
        id: med.id, name: `${constellation.name} Journey`, icon: Star,
        color: constellation.color, duration: med.duration,
        sound: ELEMENT_SOUNDS[constellation.element] || 'bowls',
        category: 'constellation', description: `A cosmic meditation through ${constellation.name} — ${constellation.theme}`,
        steps: med.steps,
      });
    } catch {
      toast.error('Could not generate constellation meditation. Please try again.');
    }
    setGenerating(null);
  };

  const playSavedMed = (med) => {
    const theme = themes.find(t => t.id === med.constellation_id);
    onPlay({
      id: med.id, name: `${med.constellation_name} Journey`, icon: Star,
      color: theme?.color || '#C084FC', duration: med.duration,
      sound: ELEMENT_SOUNDS[med.element] || 'bowls',
      category: 'constellation', description: `A cosmic meditation through ${med.constellation_name}`,
      steps: med.steps,
    });
  };

  const deleteMed = async (id) => {
    try {
      await axios.delete(`${API}/meditation/constellation/${id}`, { headers: authHeaders });
      setSaved(prev => prev.filter(s => s.id !== id));
      toast.success('Removed');
    } catch {}
  };

  if (!user) return (
    <div className="p-12 text-center">
      <Star size={32} style={{ color: 'rgba(252,211,77,0.3)', margin: '0 auto 12px' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to access constellation-linked meditations.</p>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin" size={24} style={{ color: 'var(--text-muted)' }} />
    </div>
  );

  // Sort: birth sign first, then by name
  const sortedThemes = [...themes].sort((a, b) => {
    if (a.is_birth_sign && !b.is_birth_sign) return -1;
    if (!a.is_birth_sign && b.is_birth_sign) return 1;
    return 0;
  });

  return (
    <div className="space-y-8" data-testid="constellation-meditations">
      {/* Duration selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Duration</span>
        {[5, 8, 10, 15].map(d => (
          <button key={d} onClick={() => setSelectedDuration(d)}
            className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              background: selectedDuration === d ? 'rgba(252,211,77,0.12)' : 'rgba(255,255,255,0.02)',
              color: selectedDuration === d ? '#FCD34D' : 'var(--text-muted)',
              border: `1px solid ${selectedDuration === d ? 'rgba(252,211,77,0.25)' : 'rgba(255,255,255,0.06)'}`,
            }}
            data-testid={`constellation-duration-${d}`}>{d} min</button>
        ))}
      </div>

      {/* Saved constellation meditations */}
      {saved.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Your Cosmic Journeys</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {saved.slice(0, 6).map((med, i) => {
              const theme = themes.find(t => t.id === med.constellation_id);
              return (
                <motion.div key={med.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="p-4 group" data-testid={`saved-constellation-${med.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: theme?.color || '#C084FC', boxShadow: `0 0 6px ${theme?.color || '#C084FC'}60` }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{med.constellation_name}</span>
                    </div>
                    <button onClick={() => deleteMed(med.id)} className="opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`del-constellation-${med.id}`}>
                      <Trash2 size={12} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                  <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>
                    {med.duration} min &middot; {med.element} &middot; {med.steps?.length} steps
                    {med.is_birth_sign && <span className="ml-1" style={{ color: '#FCD34D' }}>&middot; Birth Sign</span>}
                  </p>
                  <button onClick={() => playSavedMed(med)}
                    className="w-full py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                    style={{ background: `${theme?.color || '#C084FC'}10`, color: theme?.color || '#C084FC', border: `1px solid ${theme?.color || '#C084FC'}20` }}
                    data-testid={`play-constellation-${med.id}`}>
                    <Play size={11} fill={theme?.color || '#C084FC'} /> Journey Again
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Constellation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedThemes.map((c, i) => {
          const isHighlighted = c.id === highlightId;
          return (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            ref={isHighlighted ? highlightRef : null}
            className="p-6 relative overflow-hidden group"
            style={isHighlighted ? { border: `1px solid ${c.color}40`, boxShadow: `0 0 30px ${c.color}15` } : {}}
            data-testid={`constellation-card-${c.id}`}>
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full"
              style={{ background: `radial-gradient(circle, ${c.color}08 0%, transparent 70%)`, filter: 'blur(20px)' }} />

            {/* Birth sign badge */}
            {c.is_birth_sign && (
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                style={{ background: 'rgba(252,211,77,0.12)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.2)' }}
                data-testid={`birth-sign-badge-${c.id}`}>
                Your Sign
              </div>
            )}

            <div className="relative z-10">
              {/* Constellation header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${c.color}12`, border: `1px solid ${c.color}15` }}>
                  <Star size={18} style={{ color: c.color, filter: `drop-shadow(0 0 6px ${c.color}60)` }} />
                </div>
                <div>
                  <h3 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {c.figure} &middot; {c.element} &middot; {c.deity}
                  </p>
                </div>
              </div>

              {/* Theme description */}
              <p className="text-sm leading-relaxed mb-3 capitalize" style={{ color: 'var(--text-secondary)' }}>
                {c.theme}
              </p>

              {/* Cosmic lesson */}
              <p className="text-[11px] leading-relaxed mb-4 italic" style={{ color: `${c.color}AA` }}>
                &ldquo;{c.lesson}&rdquo;
              </p>

              {/* Generate button */}
              <button
                onClick={() => generate(c.id)}
                disabled={generating !== null}
                className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all group-hover:scale-[1.01]"
                style={{
                  background: `${c.color}10`,
                  color: c.color,
                  border: `1px solid ${c.color}20`,
                  opacity: generating && generating !== c.id ? 0.4 : 1,
                }}
                data-testid={`generate-constellation-${c.id}`}>
                {generating === c.id ? (
                  <><Loader2 size={13} className="animate-spin" /> Channeling {c.name} energy...</>
                ) : (
                  <><Star size={13} /> Begin {c.name} Meditation</>
                )}
              </button>
            </div>
          </motion.div>
        );
        })}
      </div>
    </div>
  );
}

/* ======== MAIN PAGE ======== */
export default function Meditation() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const constellationParam = searchParams.get('constellation');
  const [mode, setMode] = useState(constellationParam ? 'constellation' : 'guided');
  const [filter, setFilter] = useState('all');
  const [activeSession, setActiveSession] = useState(null);
  const [breathGameOpen, setBreathGameOpen] = useState(false);
  const [mandalaOpen, setMandalaOpen] = useState(false);
  const [ripples, setRipples] = useState([]); // [{id, x, y, color, xp}]
  const rippleIdRef = useRef(0);
  const { immersion = 'full' } = useSensory() || {};
  const simpleMode = immersion === 'calm';

  // Spawn a ripple at a chamber position with optional XP tag. Ripples
  // auto-clean themselves via their onDone callback.
  const spawnRipple = useCallback((x, y, color, xp) => {
    const id = ++rippleIdRef.current;
    setRipples((r) => [...r, { id, x, y, color, xp }]);
  }, []);
  const clearRipple = useCallback((id) => {
    setRipples((r) => r.filter((rp) => rp.id !== id));
  }, []);

  const filtered = filter === 'all' ? GUIDED_MEDITATIONS : GUIDED_MEDITATIONS.filter(m => m.category === filter);

  return (
    <HolographicChamber
      chamberId="meditation"
      title="The Still Chamber"
      subtitle="Holographic Meditation Sanctuary"
      presenceCanvas={!activeSession && !breathGameOpen}
      presenceColor="#D8B4FE"
      presenceCue="breathe"
      presencePlaying={true}
    >
    {/* Interactive chamber props — tap to enter live mini-games.
        Each prop enacts a distinct real action with visible chamber
        feedback (ripple + XP flyaway), so no prop is "just a button".
        Entirely hidden in Simple Mode (immersion=calm) — those users
        just want clean meditation controls without gamification. */}
    {!simpleMode && !activeSession && !breathGameOpen && !mandalaOpen && (
      <>
        <ChamberProp
          x={22} y={55} size={86}
          label="BREATHE"
          icon={WindIcon}
          color="#D8B4FE"
          onActivate={() => setBreathGameOpen(true)}
          testid="meditation-prop-cushion"
        />
        <ChamberProp
          x={82} y={22} size={58}
          label="RING BELL"
          icon={Bell}
          color="#FCD34D"
          onActivate={() => {
            // 528Hz resonance tone with 2.6s decay
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = ctx.createOscillator();
              const g = ctx.createGain();
              osc.frequency.value = 528;
              g.gain.value = 0.08;
              osc.connect(g).connect(ctx.destination);
              osc.start();
              g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.6);
              osc.stop(ctx.currentTime + 2.6);
            } catch { /* audio blocked */ }
            spawnRipple(82, 22, '#FCD34D', '+2 SPARKS');
            const token = localStorage.getItem('zen_token');
            if (token && token !== 'guest_token') {
              axios.post(
                `${API}/sparks/immersion`,
                { seconds: 6, zone: 'bell_ring' },
                { headers: { Authorization: `Bearer ${token}` } },
              ).catch(() => {});
            }
            window.dispatchEvent(new CustomEvent('sovereign:immersion-tick'));
          }}
          testid="meditation-prop-bell"
        />
        <ChamberProp
          x={82} y={78} size={58}
          label="MANDALA"
          icon={Flower}
          color="#F472B6"
          onActivate={() => {
            spawnRipple(82, 78, '#F472B6', 'RITUAL');
            setMandalaOpen(true);
          }}
          testid="meditation-prop-mandala"
        />
      </>
    )}

    {/* Ripples (chamber-relative expanding concentric rings + XP tag) */}
    {ripples.map((r) => (
      <RippleBurst
        key={r.id}
        x={r.x} y={r.y} color={r.color} xpLabel={r.xp}
        onDone={() => clearRipple(r.id)}
      />
    ))}

    <BreathPacerGame
      open={breathGameOpen}
      onClose={() => setBreathGameOpen(false)}
      color="#D8B4FE"
    />
    <MandalaRitual
      open={mandalaOpen}
      onClose={() => setMandalaOpen(false)}
      color="#F472B6"
    />

    <div className="pt-4 pb-2 px-1 max-w-3xl mx-auto" style={{ background: 'transparent' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Brain size={14} style={{ color: '#D8B4FE' }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#D8B4FE' }}>Meditation</p>
        </div>
        <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
          Stillness Within
        </h1>

        

        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Choose a guided journey or set your own timer. Enter the silence.
        </p>
      </motion.div>

        {/* Mode Toggle — hide while a guided session is active so the session owns the viewport on mobile */}
        {!activeSession && (
        <div className="flex gap-2 mb-8 flex-wrap" data-testid="meditation-mode-toggle">
          {[
            { id: 'guided', label: 'Guided Meditations', icon: Sparkles },
            { id: 'constellation', label: 'Cosmic Meditations', icon: Star },
            { id: 'build', label: 'Build Your Own', icon: Wand2 },
            { id: 'timer', label: 'Timer Mode', icon: RotateCcw },
          ].map(m => {
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
        )}

        {activeSession ? null : mode === 'guided' ? (
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
                    className="p-7 cursor-pointer group"
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
        ) : mode === 'constellation' ? (
          <ConstellationMeditations onPlay={setActiveSession} highlightId={constellationParam} />
        ) : mode === 'build' ? (
          <BuildYourOwn onPlay={setActiveSession} />
        ) : (
          <TimerMode />
        )}

        {!activeSession && (
          <div className="mt-16">
            <FeaturedVideos category="meditation" color="#D8B4FE" title="Meditation Practice Videos" />
          </div>
        )}

      {/* Guided Session — inline, grid hides while active so it owns the viewport */}
      <AnimatePresence>
        {activeSession && (
          <motion.div
            key="guided-session-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveSession(null)}
                data-testid="guided-session-back"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}
              >
                ← Back to Meditations
              </button>
              <span className="text-xs" style={{ color: activeSession.color }}>
                {activeSession.name}
              </span>
            </div>
            <GuidedSession meditation={activeSession} onEnd={async () => {
              // Log meditation completion and get plant growth
              try {
                const res = await axios.post(`${API}/meditation-history/log`, {
                  type: activeSession.category || 'guided',
                  duration_minutes: activeSession.duration,
                  focus: activeSession.name,
                  share_to_community: true,
                }, { headers: authHeaders });
                const pg = res.data?.plant_growth;
                if (pg) {
                  toast.success(`${pg.plant_name} received cosmic nourishment${pg.grew ? ` and grew to ${pg.new_stage}!` : '!'}`);
                }
                if (res.data?.shared) {
                  toast.success('Shared to community!');
                }
              } catch {}
              setActiveSession(null);
            }} />
          </motion.div>
        )}
      </AnimatePresence>
      <WellnessDisclaimer variant="footer" />
    </div>
    </HolographicChamber>
  );
}
