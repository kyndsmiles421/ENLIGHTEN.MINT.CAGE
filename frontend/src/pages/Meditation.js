import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

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
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const hp = audioCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(4000, audioCtx.currentTime);
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(8000, audioCtx.currentTime);
    src.connect(hp);
    hp.connect(lp);
    lp.connect(gain);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    src.start();
    nodes.push(src);
  } else if (soundId === 'ocean') {
    const buf = createNoiseBuffer(audioCtx, 4);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(500, audioCtx.currentTime);
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.1, audioCtx.currentTime);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
    src.connect(lp);
    lp.connect(gain);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    src.start();
    nodes.push(src, lfo);
  } else if (soundId === 'forest') {
    const buf = createNoiseBuffer(audioCtx, 2);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(3000, audioCtx.currentTime);
    bp.Q.setValueAtTime(2, audioCtx.currentTime);
    src.connect(bp);
    bp.connect(gain);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    src.start();
    nodes.push(src);
    // Birdsong: intermittent high sine tones
    const bird = audioCtx.createOscillator();
    bird.type = 'sine';
    bird.frequency.setValueAtTime(2200, audioCtx.currentTime);
    const birdGain = audioCtx.createGain();
    birdGain.gain.setValueAtTime(0, audioCtx.currentTime);
    const birdLfo = audioCtx.createOscillator();
    birdLfo.frequency.setValueAtTime(3, audioCtx.currentTime);
    const birdLfoGain = audioCtx.createGain();
    birdLfoGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    birdLfo.connect(birdLfoGain);
    birdLfoGain.connect(birdGain.gain);
    bird.connect(birdGain);
    birdGain.connect(audioCtx.destination);
    bird.start();
    birdLfo.start();
    nodes.push(bird, birdLfo);
  } else if (soundId === 'bowls') {
    [528, 396, 639].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      const oscGain = audioCtx.createGain();
      oscGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      const lfo = audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.2 + i * 0.1, audioCtx.currentTime);
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      osc.connect(oscGain);
      oscGain.connect(audioCtx.destination);
      osc.start();
      lfo.start();
      nodes.push(osc, lfo);
    });
  } else if (soundId === 'wind') {
    const buf = createNoiseBuffer(audioCtx, 3);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(800, audioCtx.currentTime);
    bp.Q.setValueAtTime(0.5, audioCtx.currentTime);
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, audioCtx.currentTime);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(400, audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(bp.frequency);
    src.connect(bp);
    bp.connect(gain);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    lfo.start();
    src.start();
    nodes.push(src, lfo);
  }

  return nodes;
}

export default function Meditation() {
  const [preset, setPreset] = useState(PRESETS[1]);
  const [timeLeft, setTimeLeft] = useState(PRESETS[1].minutes * 60);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState('silence');
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const nodesRef = useRef([]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = 1 - timeLeft / (preset.minutes * 60);

  // Audio management
  const stopAudio = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop?.(); } catch {} });
    nodesRef.current = [];
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} }
    audioCtxRef.current = null;
  }, []);

  const startAudio = useCallback((soundId) => {
    stopAudio();
    if (soundId === 'silence') return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    nodesRef.current = startAmbientSound(ctx, soundId);
  }, [stopAudio]);

  // Start/stop audio when sound selection or running state changes
  useEffect(() => {
    if (running && sound !== 'silence') {
      startAudio(sound);
    } else {
      stopAudio();
    }
    return stopAudio;
  }, [running, sound, startAudio, stopAudio]);

  const toggle = useCallback(() => {
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      setRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [running]);

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setTimeLeft(preset.minutes * 60);
  };

  useEffect(() => {
    if (!running) setTimeLeft(preset.minutes * 60);
  }, [preset, running]);

  useEffect(() => () => { clearInterval(intervalRef.current); stopAudio(); }, [stopAudio]);

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--primary)' }}>Meditation</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Stillness Within
          </h1>
          <p className="text-base mb-12" style={{ color: 'var(--text-secondary)' }}>
            Set your intention. Enter the silence. Emerge renewed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Duration</p>
              <div className="space-y-2">
                {PRESETS.map(p => (
                  <button
                    key={p.name}
                    onClick={() => { if (!running) setPreset(p); }}
                    className="glass-card w-full text-left p-4 flex items-center justify-between"
                    style={{
                      borderColor: preset.name === p.name ? `${p.color}40` : 'rgba(255,255,255,0.08)',
                      opacity: running && preset.name !== p.name ? 0.3 : 1,
                      transition: 'opacity 0.3s, border-color 0.3s',
                    }}
                    data-testid={`meditation-preset-${p.minutes}`}
                  >
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
                  <button
                    key={s.id}
                    onClick={() => setSound(s.id)}
                    className="glass-card p-3 text-center text-sm"
                    style={{
                      borderColor: sound === s.id ? 'rgba(216,180,254,0.3)' : 'rgba(255,255,255,0.08)',
                      color: sound === s.id ? 'var(--text-primary)' : 'var(--text-muted)',
                      transition: 'border-color 0.3s, color 0.3s',
                    }}
                    data-testid={`sound-${s.id}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              {running && sound !== 'silence' && (
                <p className="text-xs mt-3 text-center" style={{ color: '#2DD4BF' }}>
                  Playing: {AMBIENT_SOUNDS.find(s => s.id === sound)?.name}
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[500px]">
            <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center mb-12">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 300 300">
                <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
                <circle
                  cx="150" cy="150" r="140"
                  fill="none"
                  stroke={preset.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                  opacity="0.6"
                />
              </svg>
              <div className="text-center z-10">
                <p className="text-6xl md:text-7xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                  {formatTime(timeLeft)}
                </p>
                <p className="text-xs uppercase tracking-[0.2em] mt-3" style={{ color: 'var(--text-muted)' }}>
                  {running ? 'In session' : timeLeft === 0 ? 'Complete' : preset.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggle}
                className="btn-glass px-8 py-4 flex items-center gap-3"
                style={{ boxShadow: running ? `0 0 40px ${preset.color}20` : undefined }}
                data-testid="meditation-toggle-btn"
              >
                {running ? <Pause size={20} /> : <Play size={20} />}
                {running ? 'Pause' : timeLeft === 0 ? 'Restart' : 'Begin Session'}
              </button>
              {(running || timeLeft < preset.minutes * 60) && (
                <button onClick={reset} className="btn-glass px-4 py-4" data-testid="meditation-reset-btn">
                  <RotateCcw size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
