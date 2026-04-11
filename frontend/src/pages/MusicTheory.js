import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMixer } from '../context/MixerContext';
import { useAuth } from '../context/AuthContext';
import { Music, Mic, MicOff, Target, Star, Volume2, Languages, Award, Lock, Unlock, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Circle of Fifths — 12 keys mapped to sacred geometry
const CIRCLE_OF_FIFTHS = [
  { key: 'C', hz: 261.63, color: '#FBBF24', angle: 0 },
  { key: 'G', hz: 392.00, color: '#22C55E', angle: 30 },
  { key: 'D', hz: 293.66, color: '#3B82F6', angle: 60 },
  { key: 'A', hz: 440.00, color: '#A78BFA', angle: 90 },
  { key: 'E', hz: 329.63, color: '#F472B6', angle: 120 },
  { key: 'B', hz: 493.88, color: '#EC4899', angle: 150 },
  { key: 'F#', hz: 369.99, color: '#F59E0B', angle: 180 },
  { key: 'Db', hz: 277.18, color: '#06B6D4', angle: 210 },
  { key: 'Ab', hz: 415.30, color: '#8B5CF6', angle: 240 },
  { key: 'Eb', hz: 311.13, color: '#2DD4BF', angle: 270 },
  { key: 'Bb', hz: 466.16, color: '#FB923C', angle: 300 },
  { key: 'F', hz: 349.23, color: '#EF4444', angle: 330 },
];

// Target frequencies for practice mode (Solfeggio scale)
const PRACTICE_TARGETS = [
  { hz: 432, label: '432Hz — Harmony', color: '#22C55E', geometry: 'flower_of_life' },
  { hz: 528, label: '528Hz — Miracle', color: '#FBBF24', geometry: 'icosahedron' },
  { hz: 639, label: '639Hz — Connection', color: '#3B82F6', geometry: 'vesica_piscis' },
  { hz: 741, label: '741Hz — Expression', color: '#A78BFA', geometry: 'metatrons_cube' },
  { hz: 852, label: '852Hz — Intuition', color: '#F472B6', geometry: 'sri_yantra' },
  { hz: 963, label: '963Hz — Crown', color: '#EC4899', geometry: 'merkaba' },
];

// Vowel Formant Map — F1/F2 resonance peaks for phonetic detection
const VOWEL_MAP = [
  { vowel: 'A', label: 'Ah', f1: 850, f2: 1610, color: '#EF4444', geometry: 'seed_of_life', n: 3, m: 5, desc: 'Open throat, root resonance' },
  { vowel: 'E', label: 'Ee', f1: 270, f2: 2290, color: '#22C55E', geometry: 'flower_of_life', n: 7, m: 4, desc: 'Forward tongue, crown activation' },
  { vowel: 'I', label: 'Ih', f1: 400, f2: 1920, color: '#3B82F6', geometry: 'vesica_piscis', n: 5, m: 8, desc: 'Mid resonance, third-eye bridge' },
  { vowel: 'O', label: 'Oh', f1: 450, f2: 800, color: '#FBBF24', geometry: 'torus', n: 4, m: 3, desc: 'Rounded lips, heart center' },
  { vowel: 'U', label: 'Oo', f1: 325, f2: 700, color: '#A78BFA', geometry: 'merkaba', n: 6, m: 2, desc: 'Deep resonance, sacral energy' },
];

// Vowel-specific Chladni pattern with bloom animation
function VowelChladniCanvas({ detectedVowel, confidence, bloomed }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 240;
    canvas.height = 240;

    const vowelData = VOWEL_MAP.find(v => v.vowel === detectedVowel) || VOWEL_MAP[0];
    const { n, m, color } = vowelData;

    const draw = () => {
      ctx.clearRect(0, 0, 240, 240);
      const t = Date.now() * 0.001;
      const bloomScale = bloomed ? 1.0 + Math.sin(t * 3) * 0.05 : 1.0;
      const confAlpha = confidence > 0 ? Math.min(0.9, confidence / 100) : 0.2;

      for (let x = 0; x < 240; x += 2) {
        for (let y = 0; y < 240; y += 2) {
          const nx = ((x - 120) / 120) * bloomScale;
          const ny = ((y - 120) / 120) * bloomScale;
          const val = Math.sin(n * Math.PI * nx) * Math.sin(m * Math.PI * ny)
            - Math.sin(m * Math.PI * nx) * Math.sin(n * Math.PI * ny);
          const intensity = Math.abs(val);

          if (intensity < 0.18) {
            const alpha = bloomed ? 0.85 : confAlpha + Math.sin(t * 2 + x * 0.01) * 0.05;
            if (bloomed) {
              const hue = (t * 30 + x + y) % 360;
              ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
            } else {
              ctx.fillStyle = `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
            }
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }

      // Bloom ring effect
      if (bloomed) {
        const ringR = 80 + Math.sin(t * 4) * 15;
        ctx.beginPath();
        ctx.arc(120, 120, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.4 + Math.sin(t * 5) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [detectedVowel, confidence, bloomed]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: 'pixelated' }} />;
}

// Chladni pattern generator
function ChladniCanvas({ frequency, locked, color }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;

    const draw = () => {
      ctx.clearRect(0, 0, 200, 200);
      const t = Date.now() * 0.001;
      const n = Math.round(frequency / 100);
      const m = Math.round(frequency / 150);

      for (let x = 0; x < 200; x += 2) {
        for (let y = 0; y < 200; y += 2) {
          const nx = (x - 100) / 100;
          const ny = (y - 100) / 100;
          const val = Math.sin(n * Math.PI * nx) * Math.sin(m * Math.PI * ny)
            - Math.sin(m * Math.PI * nx) * Math.sin(n * Math.PI * ny);
          const intensity = Math.abs(val);

          if (intensity < 0.15) {
            const alpha = locked ? 0.8 : 0.3 + Math.sin(t * 2) * 0.1;
            ctx.fillStyle = locked
              ? `rgba(251,191,36,${alpha})`
              : `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [frequency, locked, color]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: 'pixelated' }} />;
}

export default function MusicTheory() {
  const { toggleFreq } = useMixer();
  const { authHeaders } = useAuth();
  const [activeKey, setActiveKey] = useState(null);
  const [tab, setTab] = useState('theory'); // 'theory' | 'practice' | 'voice' | 'phonics'

  // Voice/Pitch detection
  const [micActive, setMicActive] = useState(false);
  const [detectedHz, setDetectedHz] = useState(null);
  const [detectedNote, setDetectedNote] = useState('');
  const [practiceTarget, setPracticeTarget] = useState(PRACTICE_TARGETS[0]);
  const [locked, setLocked] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const pitchAnimRef = useRef(null);

  // Phonics state
  const [phonicsMicActive, setPhonicsMicActive] = useState(false);
  const [detectedVowel, setDetectedVowel] = useState(null);
  const [vowelConfidence, setVowelConfidence] = useState(0);
  const [vowelBloomed, setVowelBloomed] = useState(false);
  const [bloomHistory, setBloomHistory] = useState([]);
  const [masteryData, setMasteryData] = useState(null);
  const phonicsStreamRef = useRef(null);
  const phonicsCtxRef = useRef(null);
  const phonicsAnalyserRef = useRef(null);
  const phonicsAnimRef = useRef(null);
  const sustainTimerRef = useRef(null);
  const sustainStartRef = useRef(null);

  // Load mastery data
  useEffect(() => {
    if (!authHeaders?.Authorization) return;
    axios.get(`${API}/mastery/tier`, { headers: authHeaders })
      .then(r => setMasteryData(r.data))
      .catch(() => {});
  }, [authHeaders]);

  // Formant-based vowel detection from FFT
  const detectVowelFromFFT = useCallback((analyser, ctx) => {
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    const binHz = ctx.sampleRate / analyser.fftSize;

    const detect = () => {
      analyser.getByteFrequencyData(freqData);

      // Find F1 peak (200-1000 Hz range)
      let f1Peak = 0, f1Mag = 0;
      const f1Start = Math.floor(200 / binHz);
      const f1End = Math.floor(1000 / binHz);
      for (let i = f1Start; i < f1End && i < freqData.length; i++) {
        if (freqData[i] > f1Mag) { f1Mag = freqData[i]; f1Peak = i * binHz; }
      }

      // Find F2 peak (800-3000 Hz range)
      let f2Peak = 0, f2Mag = 0;
      const f2Start = Math.floor(800 / binHz);
      const f2End = Math.floor(3000 / binHz);
      for (let i = f2Start; i < f2End && i < freqData.length; i++) {
        if (freqData[i] > f2Mag) { f2Mag = freqData[i]; f2Peak = i * binHz; }
      }

      // Only proceed if signal is strong enough
      if (f1Mag < 40 || f2Mag < 30) {
        setDetectedVowel(null);
        setVowelConfidence(0);
        sustainStartRef.current = null;
        phonicsAnimRef.current = requestAnimationFrame(detect);
        return;
      }

      // Match against vowel formants
      let bestVowel = null;
      let bestScore = Infinity;
      for (const v of VOWEL_MAP) {
        const f1Diff = Math.abs(f1Peak - v.f1) / v.f1;
        const f2Diff = Math.abs(f2Peak - v.f2) / v.f2;
        const score = f1Diff + f2Diff;
        if (score < bestScore) { bestScore = score; bestVowel = v; }
      }

      const conf = Math.max(0, Math.round((1 - bestScore / 2) * 100));
      setDetectedVowel(bestVowel?.vowel || null);
      setVowelConfidence(conf);

      // Sustained detection for bloom
      if (conf > 90 && bestVowel) {
        if (!sustainStartRef.current) {
          sustainStartRef.current = Date.now();
        } else if (Date.now() - sustainStartRef.current > 1500 && !vowelBloomed) {
          // Bloomed! Sustained >90% for 1.5 seconds
          setVowelBloomed(true);
          setBloomHistory(prev => {
            if (prev.includes(bestVowel.vowel)) return prev;
            return [...prev, bestVowel.vowel];
          });

          // Record mastery progress
          if (authHeaders) {
            axios.post(`${API}/mastery/progress`, {
              type: 'vowel',
              vowel: bestVowel.vowel,
              confidence: conf,
              duration_ms: Date.now() - sustainStartRef.current,
            }, { headers: authHeaders }).then(r => {
              if (r.data.tier_advanced) {
                toast.success(`Tier ${r.data.current_tier} Unlocked: ${r.data.tier_info?.name}`, { duration: 5000 });
              }
              setMasteryData(prev => ({
                ...prev,
                vowels_mastered: r.data.vowels_mastered,
                bloom_count: r.data.bloom_count,
                current_tier: r.data.current_tier,
              }));
            }).catch(() => {});
          }

          // Auto-reset bloom after 3 seconds
          setTimeout(() => {
            setVowelBloomed(false);
            sustainStartRef.current = null;
          }, 3000);
        }
      } else {
        sustainStartRef.current = null;
      }

      phonicsAnimRef.current = requestAnimationFrame(detect);
    };
    detect();
  }, [authHeaders, vowelBloomed]);

  const togglePhonicsMic = useCallback(async () => {
    if (phonicsMicActive) {
      if (phonicsStreamRef.current) phonicsStreamRef.current.getTracks().forEach(t => t.stop());
      if (phonicsAnimRef.current) cancelAnimationFrame(phonicsAnimRef.current);
      setPhonicsMicActive(false);
      setDetectedVowel(null);
      setVowelConfidence(0);
      setVowelBloomed(false);
      sustainStartRef.current = null;
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      phonicsStreamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      phonicsCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      phonicsAnalyserRef.current = analyser;
      setPhonicsMicActive(true);
      setVowelBloomed(false);
      detectVowelFromFFT(analyser, ctx);
    } catch (e) {
      console.error('Mic access denied', e);
      toast.error('Microphone access denied');
    }
  }, [phonicsMicActive, detectVowelFromFFT]);

  const hzToNote = (hz) => {
    if (!hz || hz < 60) return '';
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const semitone = 12 * Math.log2(hz / 440) + 69;
    return notes[Math.round(semitone) % 12] + Math.floor(semitone / 12 - 1);
  };

  const detectPitch = useCallback((analyser, ctx) => {
    const buf = new Float32Array(analyser.fftSize);
    const detect = () => {
      analyser.getFloatTimeDomainData(buf);
      // Autocorrelation pitch detection
      let bestR = 0, bestLag = -1;
      for (let lag = Math.floor(ctx.sampleRate / 1000); lag < Math.floor(ctx.sampleRate / 60); lag++) {
        let sum = 0;
        for (let i = 0; i < buf.length - lag; i++) sum += buf[i] * buf[i + lag];
        if (sum > bestR) { bestR = sum; bestLag = lag; }
      }
      if (bestLag > 0 && bestR > 0.01) {
        const hz = ctx.sampleRate / bestLag;
        setDetectedHz(Math.round(hz * 10) / 10);
        setDetectedNote(hzToNote(hz));

        // Check accuracy against target
        const diff = Math.abs(hz - practiceTarget.hz);
        const acc = Math.max(0, 100 - (diff / practiceTarget.hz) * 100);
        setAccuracy(Math.round(acc));
        if (acc > 95 && !locked) setLocked(true);
      } else {
        setDetectedHz(null);
        setDetectedNote('');
        setAccuracy(0);
      }
      pitchAnimRef.current = requestAnimationFrame(detect);
    };
    detect();
  }, [practiceTarget, locked]);

  const toggleMic = useCallback(async () => {
    if (micActive) {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (pitchAnimRef.current) cancelAnimationFrame(pitchAnimRef.current);
      setMicActive(false);
      setDetectedHz(null);
      setLocked(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      analyserRef.current = analyser;
      setMicActive(true);
      setLocked(false);
      detectPitch(analyser, ctx);
    } catch (e) {
      console.error('Mic access denied', e);
    }
  }, [micActive, detectPitch]);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (pitchAnimRef.current) cancelAnimationFrame(pitchAnimRef.current);
      if (phonicsStreamRef.current) phonicsStreamRef.current.getTracks().forEach(t => t.stop());
      if (phonicsAnimRef.current) cancelAnimationFrame(phonicsAnimRef.current);
    };
  }, []);

  const playKey = (key) => {
    setActiveKey(key.key);
    toggleFreq({ hz: key.hz, label: key.key });
    setTimeout(() => setActiveKey(null), 200);
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8" data-testid="music-theory-page">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            The Conservatory
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Music Theory, Practice & Vocal Resonance — The Physics of Sound as Sacred Geometry
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'theory', label: 'Circle of Fifths', icon: Star },
            { id: 'practice', label: 'Practice', icon: Target },
            { id: 'phonics', label: 'Phonics', icon: Languages },
            { id: 'voice', label: 'Voice', icon: Mic },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: tab === t.id ? 'rgba(251,191,36,0.08)' : 'rgba(248,250,252,0.03)',
                color: tab === t.id ? '#FBBF24' : 'var(--text-muted)',
                border: tab === t.id ? '1px solid rgba(251,191,36,0.15)' : '1px solid transparent',
              }}
              data-testid={`tab-${t.id}`}>
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </div>

        {/* Theory Tab — Circle of Fifths */}
        {tab === 'theory' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Circle Visualization */}
            <div className="glass-card p-6 rounded-2xl flex items-center justify-center"
              style={{ border: '1px solid rgba(251,191,36,0.08)' }}>
              <div className="relative w-64 h-64">
                {/* Dodecahedron lines */}
                <svg viewBox="0 0 260 260" className="absolute inset-0 w-full h-full">
                  {CIRCLE_OF_FIFTHS.map((k, i) => {
                    const next = CIRCLE_OF_FIFTHS[(i + 1) % 12];
                    const x1 = 130 + 100 * Math.cos((k.angle - 90) * Math.PI / 180);
                    const y1 = 130 + 100 * Math.sin((k.angle - 90) * Math.PI / 180);
                    const x2 = 130 + 100 * Math.cos((next.angle - 90) * Math.PI / 180);
                    const y2 = 130 + 100 * Math.sin((next.angle - 90) * Math.PI / 180);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(248,250,252,0.06)" strokeWidth="0.5" />;
                  })}
                  {/* Inner pentagon connections */}
                  {CIRCLE_OF_FIFTHS.map((k, i) => {
                    const opp = CIRCLE_OF_FIFTHS[(i + 7) % 12];
                    const x1 = 130 + 100 * Math.cos((k.angle - 90) * Math.PI / 180);
                    const y1 = 130 + 100 * Math.sin((k.angle - 90) * Math.PI / 180);
                    const x2 = 130 + 100 * Math.cos((opp.angle - 90) * Math.PI / 180);
                    const y2 = 130 + 100 * Math.sin((opp.angle - 90) * Math.PI / 180);
                    return <line key={`inner-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(248,250,252,0.03)" strokeWidth="0.3" />;
                  })}
                </svg>

                {/* Key nodes */}
                {CIRCLE_OF_FIFTHS.map(k => {
                  const x = 50 + 40 * Math.cos((k.angle - 90) * Math.PI / 180);
                  const y = 50 + 40 * Math.sin((k.angle - 90) * Math.PI / 180);
                  const isActive = activeKey === k.key;
                  return (
                    <motion.button key={k.key}
                      whileTap={{ scale: 1.3 }}
                      onClick={() => playKey(k)}
                      className="absolute w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                      style={{
                        left: `${x}%`, top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                        background: isActive ? `${k.color}30` : `${k.color}08`,
                        border: `1.5px solid ${isActive ? k.color : `${k.color}30`}`,
                        color: k.color,
                        boxShadow: isActive ? `0 0 20px ${k.color}40` : 'none',
                      }}
                      data-testid={`key-${k.key}`}>
                      {k.key}
                    </motion.button>
                  );
                })}

                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Music size={16} style={{ color: 'rgba(248,250,252,0.15)', margin: '0 auto' }} />
                    <p className="text-[7px] mt-1" style={{ color: 'var(--text-muted)' }}>Circle of Fifths</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Theory Info */}
            <div className="glass-card p-5 rounded-2xl space-y-3"
              style={{ border: '1px solid rgba(248,250,252,0.06)' }}>
              <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                The Dodecahedron of Sound
              </h3>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                The Circle of Fifths maps all 12 musical keys into a dodecahedron — a 12-sided sacred geometry. Each key vibrates at a specific frequency, and moving clockwise adds a perfect fifth (3:2 ratio). Tesla's 3-6-9 pattern emerges naturally: every 3rd step creates a diminished chord, every 4th a major third.
              </p>
              <div className="space-y-1 mt-2">
                <p className="text-[8px] font-medium" style={{ color: '#FBBF24' }}>Tesla Intervals</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { int: '3rd', notes: 'C → E', ratio: '5:4' },
                    { int: '5th', notes: 'C → G', ratio: '3:2' },
                    { int: 'Octave', notes: 'C → C', ratio: '2:1' },
                  ].map(i => (
                    <div key={i.int} className="px-2 py-1.5 rounded-lg text-center"
                      style={{ background: 'rgba(248,250,252,0.03)' }}>
                      <p className="text-[9px] font-medium" style={{ color: 'var(--text-primary)' }}>{i.int}</p>
                      <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{i.notes} ({i.ratio})</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                Tap any key on the circle to hear its fundamental frequency with orchestral harmonics.
              </p>
            </div>
          </motion.div>
        )}

        {/* Practice Tab — Target Frequencies */}
        {tab === 'practice' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRACTICE_TARGETS.map(t => (
                <button key={t.hz} onClick={() => { setPracticeTarget(t); setLocked(false); }}
                  className="glass-card p-4 rounded-xl text-left transition-all"
                  style={{
                    border: practiceTarget.hz === t.hz ? `1px solid ${t.color}40` : '1px solid rgba(248,250,252,0.06)',
                    background: practiceTarget.hz === t.hz ? `${t.color}06` : undefined,
                  }}
                  data-testid={`target-${t.hz}`}>
                  <p className="text-sm font-mono" style={{ color: t.color }}>{t.hz}Hz</p>
                  <p className="text-[8px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.label.split(' — ')[1]}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Chladni Pattern */}
              <div className="glass-card p-4 rounded-2xl" style={{ border: `1px solid ${practiceTarget.color}15` }}>
                <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  Chladni Pattern — {practiceTarget.hz}Hz {locked ? '(LOCKED)' : ''}
                </p>
                <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden"
                  style={{ border: locked ? `2px solid #FBBF24` : `1px solid ${practiceTarget.color}20` }}
                  data-testid="chladni-canvas">
                  <ChladniCanvas frequency={detectedHz || practiceTarget.hz} locked={locked} color={practiceTarget.color} />
                </div>
                {locked && (
                  <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center text-[10px] font-medium mt-2" style={{ color: '#FBBF24' }}
                    data-testid="lock-indicator">
                    Geometry Locked — Perfect Resonance
                  </motion.p>
                )}
              </div>

              {/* Mic Control */}
              <div className="glass-card p-4 rounded-2xl space-y-3" style={{ border: '1px solid rgba(248,250,252,0.06)' }}>
                <p className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Vocal Resonance
                </p>
                <button onClick={toggleMic}
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-medium transition-all"
                  style={{
                    background: micActive ? 'rgba(239,68,68,0.08)' : 'rgba(45,212,191,0.08)',
                    color: micActive ? '#EF4444' : '#2DD4BF',
                    border: `1px solid ${micActive ? 'rgba(239,68,68,0.15)' : 'rgba(45,212,191,0.15)'}`,
                  }}
                  data-testid="mic-toggle">
                  {micActive ? <MicOff size={14} /> : <Mic size={14} />}
                  {micActive ? 'Stop Listening' : 'Start Singing'}
                </button>

                {micActive && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Detected</span>
                      <span className="text-lg font-mono" style={{ color: detectedHz ? practiceTarget.color : 'var(--text-muted)' }}>
                        {detectedHz ? `${detectedHz}Hz` : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Note</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {detectedNote || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Target Match</span>
                      <span className="text-sm font-mono" style={{ color: accuracy > 90 ? '#22C55E' : accuracy > 60 ? '#FBBF24' : '#EF4444' }}>
                        {accuracy}%
                      </span>
                    </div>
                    {/* Accuracy bar */}
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.06)' }}>
                      <motion.div
                        animate={{ width: `${accuracy}%` }}
                        className="h-full rounded-full"
                        style={{
                          background: accuracy > 90 ? '#22C55E' : accuracy > 60 ? '#FBBF24' : '#EF4444',
                        }} />
                    </div>
                  </div>
                )}

                {/* Reference tone */}
                <button onClick={() => toggleFreq({ hz: practiceTarget.hz, label: `${practiceTarget.hz}Hz` })}
                  className="w-full py-2 rounded-lg text-[9px] flex items-center justify-center gap-1.5"
                  style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-muted)', border: '1px solid rgba(248,250,252,0.06)' }}
                  data-testid="play-reference">
                  <Volume2 size={10} /> Play Reference Tone ({practiceTarget.hz}Hz)
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Phonics Tab — Vowel Formant Tracker */}
        {tab === 'phonics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Mastery Tier Banner */}
            {masteryData && (
              <div className="glass-card px-4 py-3 rounded-xl flex items-center justify-between"
                style={{ border: '1px solid rgba(248,250,252,0.06)' }}
                data-testid="mastery-tier-banner">
                <div className="flex items-center gap-3">
                  <Award size={16} style={{ color: masteryData.tier_info?.color || 'var(--text-muted)' }} />
                  <div>
                    <p className="text-[10px] font-medium" style={{ color: masteryData.tier_info?.color || 'var(--text-muted)' }}>
                      {masteryData.current_tier > 0 ? `Tier ${masteryData.current_tier}: ${masteryData.tier_info?.name}` : 'Unranked — Master vowels to begin'}
                    </p>
                    <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                      {masteryData.vowels_mastered?.length || 0}/5 vowels | {masteryData.bloom_count || 0} blooms
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {['A', 'E', 'I', 'O', 'U'].map(v => (
                    <div key={v} className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold"
                      data-testid={`mastery-vowel-${v}`}
                      style={{
                        background: masteryData.vowels_mastered?.includes(v) ? `${VOWEL_MAP.find(x => x.vowel === v)?.color}20` : 'rgba(248,250,252,0.04)',
                        color: masteryData.vowels_mastered?.includes(v) ? VOWEL_MAP.find(x => x.vowel === v)?.color : 'var(--text-muted)',
                        border: `1px solid ${masteryData.vowels_mastered?.includes(v) ? VOWEL_MAP.find(x => x.vowel === v)?.color + '40' : 'rgba(248,250,252,0.08)'}`,
                      }}>
                      {masteryData.vowels_mastered?.includes(v) ? <CheckCircle2 size={10} /> : v}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vowel Reference Grid */}
            <div className="grid grid-cols-5 gap-2">
              {VOWEL_MAP.map(v => {
                const isDetected = detectedVowel === v.vowel;
                const isMastered = masteryData?.vowels_mastered?.includes(v.vowel);
                return (
                  <div key={v.vowel}
                    className="glass-card p-3 rounded-xl text-center transition-all"
                    style={{
                      border: isDetected ? `2px solid ${v.color}` : isMastered ? `1px solid ${v.color}30` : '1px solid rgba(248,250,252,0.06)',
                      background: isDetected ? `${v.color}10` : undefined,
                      boxShadow: isDetected ? `0 0 24px ${v.color}25` : 'none',
                    }}
                    data-testid={`vowel-card-${v.vowel}`}>
                    <p className="text-xl font-bold" style={{ color: v.color, fontFamily: 'Cormorant Garamond, serif' }}>
                      {v.vowel}
                    </p>
                    <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{v.label}</p>
                    <p className="text-[7px] mt-0.5" style={{ color: v.color + '80' }}>
                      F1:{v.f1} F2:{v.f2}
                    </p>
                    {isMastered && <CheckCircle2 size={10} className="mx-auto mt-1" style={{ color: v.color }} />}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Vowel Chladni Canvas */}
              <div className="glass-card p-4 rounded-2xl" style={{ border: vowelBloomed ? '2px solid #FBBF24' : `1px solid ${detectedVowel ? VOWEL_MAP.find(v => v.vowel === detectedVowel)?.color + '15' : 'rgba(248,250,252,0.06)'}` }}>
                <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  Formant Geometry {detectedVowel ? `— "${VOWEL_MAP.find(v => v.vowel === detectedVowel)?.label}"` : ''} {vowelBloomed ? '(BLOOMED)' : ''}
                </p>
                <div className="w-56 h-56 mx-auto rounded-xl overflow-hidden"
                  style={{ border: vowelBloomed ? '2px solid #FBBF24' : '1px solid rgba(248,250,252,0.08)' }}
                  data-testid="vowel-chladni-canvas">
                  <VowelChladniCanvas detectedVowel={detectedVowel || 'A'} confidence={vowelConfidence} bloomed={vowelBloomed} />
                </div>
                <AnimatePresence>
                  {vowelBloomed && (
                    <motion.div initial={{ opacity: 0, scale: 0.7, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.7 }}
                      className="text-center mt-3" data-testid="bloom-indicator">
                      <p className="text-sm font-medium" style={{ color: '#FBBF24', fontFamily: 'Cormorant Garamond, serif' }}>
                        Geometric Bloom
                      </p>
                      <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                        Vowel "{detectedVowel}" resonance captured — mastery recorded
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Phonics Mic Control */}
              <div className="glass-card p-4 rounded-2xl space-y-3" style={{ border: '1px solid rgba(248,250,252,0.06)' }}>
                <p className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Vowel Formant Tracker
                </p>
                <button onClick={togglePhonicsMic}
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-medium transition-all"
                  style={{
                    background: phonicsMicActive ? 'rgba(239,68,68,0.08)' : 'rgba(45,212,191,0.08)',
                    color: phonicsMicActive ? '#EF4444' : '#2DD4BF',
                    border: `1px solid ${phonicsMicActive ? 'rgba(239,68,68,0.15)' : 'rgba(45,212,191,0.15)'}`,
                  }}
                  data-testid="phonics-mic-toggle">
                  {phonicsMicActive ? <MicOff size={14} /> : <Mic size={14} />}
                  {phonicsMicActive ? 'Stop Listening' : 'Begin Vowel Practice'}
                </button>

                {phonicsMicActive && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Detected Vowel</span>
                      <span className="text-2xl font-bold" style={{
                        color: detectedVowel ? VOWEL_MAP.find(v => v.vowel === detectedVowel)?.color : 'var(--text-muted)',
                        fontFamily: 'Cormorant Garamond, serif',
                      }}
                        data-testid="detected-vowel-display">
                        {detectedVowel || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Confidence</span>
                      <span className="text-sm font-mono" style={{ color: vowelConfidence > 90 ? '#22C55E' : vowelConfidence > 60 ? '#FBBF24' : '#EF4444' }}
                        data-testid="vowel-confidence">
                        {vowelConfidence}%
                      </span>
                    </div>
                    {/* Confidence bar */}
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.06)' }}>
                      <motion.div animate={{ width: `${vowelConfidence}%` }}
                        className="h-full rounded-full transition-all"
                        style={{ background: vowelConfidence > 90 ? '#22C55E' : vowelConfidence > 60 ? '#FBBF24' : '#EF4444' }} />
                    </div>
                    <p className="text-[8px] text-center" style={{ color: 'var(--text-muted)' }}>
                      {vowelConfidence > 90 ? 'Hold steady for bloom...' : vowelConfidence > 60 ? 'Getting closer...' : 'Speak a vowel clearly'}
                    </p>
                  </div>
                )}

                {/* Session Bloom History */}
                {bloomHistory.length > 0 && (
                  <div className="pt-2 border-t" style={{ borderColor: 'rgba(248,250,252,0.06)' }}>
                    <p className="text-[8px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Session Blooms
                    </p>
                    <div className="flex gap-1.5">
                      {bloomHistory.map(v => {
                        const vowelData = VOWEL_MAP.find(x => x.vowel === v);
                        return (
                          <div key={v} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                            data-testid={`bloom-${v}`}
                            style={{ background: `${vowelData.color}15`, color: vowelData.color, border: `1px solid ${vowelData.color}40` }}>
                            {v}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="pt-2 space-y-1">
                  <p className="text-[8px] font-medium" style={{ color: '#FBBF24' }}>How it works</p>
                  <p className="text-[8px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Speak or sing a vowel sound clearly. The tracker analyzes your voice's formant frequencies (F1 & F2) to identify the vowel and morphs the sacred geometry accordingly. Sustain a vowel at &gt;90% confidence for 1.5 seconds to trigger a Geometric Bloom.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Voice Tab — Real-time Voice to Geometry */}
        {tab === 'voice' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card p-6 rounded-2xl text-center space-y-4"
            style={{ border: '1px solid rgba(248,250,252,0.06)' }}>
            <Music size={24} style={{ color: 'rgba(248,250,252,0.15)', margin: '0 auto' }} />
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Voice of the Collective
            </h3>
            <p className="text-[10px] max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              Sing or hum into the microphone. Your voice becomes geometry — each pitch creates a unique Chladni pattern. Hit a Solfeggio frequency perfectly, and the pattern locks into gold.
            </p>

            <div className="w-56 h-56 mx-auto rounded-2xl overflow-hidden"
              style={{ border: locked ? '2px solid #FBBF24' : '1px solid rgba(248,250,252,0.08)' }}>
              <ChladniCanvas frequency={detectedHz || 432} locked={locked} color="#A78BFA" />
            </div>

            {detectedHz && (
              <p className="text-lg font-mono" style={{ color: locked ? '#FBBF24' : '#A78BFA' }}>
                {detectedHz}Hz — {detectedNote}
              </p>
            )}

            <button onClick={toggleMic}
              className="mx-auto py-3 px-8 rounded-xl flex items-center gap-2 text-xs font-medium transition-all"
              style={{
                background: micActive ? 'rgba(239,68,68,0.08)' : 'rgba(167,139,250,0.08)',
                color: micActive ? '#EF4444' : '#A78BFA',
                border: `1px solid ${micActive ? 'rgba(239,68,68,0.15)' : 'rgba(167,139,250,0.15)'}`,
              }}
              data-testid="voice-mic-toggle">
              {micActive ? <MicOff size={14} /> : <Mic size={14} />}
              {micActive ? 'Stop' : 'Begin Singing'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
