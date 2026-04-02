import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMixer } from '../context/MixerContext';
import { Music, Mic, MicOff, Target, Star, Volume2 } from 'lucide-react';

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
  const [activeKey, setActiveKey] = useState(null);
  const [tab, setTab] = useState('theory'); // 'theory' | 'practice' | 'voice'

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
