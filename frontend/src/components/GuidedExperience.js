import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Play, Pause, SkipForward, X, Volume2, Loader2, Wind, Eye, Ear, Hand, Heart, Moon, Music, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import HolographicCanvas from './HolographicCanvas';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CUE_ICONS = {
  breathe: Wind,
  feel: Hand,
  visualize: Eye,
  move: Hand,
  listen: Ear,
  rest: Moon,
  chant: Music,
};

const CUE_LABELS = {
  breathe: 'Breathe',
  feel: 'Feel',
  visualize: 'Visualize',
  move: 'Move',
  listen: 'Listen',
  rest: 'Rest',
  chant: 'Chant',
};

const VOICE_STORAGE_KEY = 'cosmiccollective_voice_prefs';

function loadVoicePrefs() {
  try {
    const saved = localStorage.getItem(VOICE_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { voice: 'nova', speed: 0.8 };
}

export default function GuidedExperience({ practiceName, description, instructions, category, color = '#D8B4FE', durationMinutes = 10 }) {
  const { authHeaders } = useAuth();
  const [mode, setMode] = useState('idle'); // idle, generating, ready, playing, paused, complete
  const [segments, setSegments] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const segmentTimerRef = useRef(null);
  const ttsQueueRef = useRef([]);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [holographic, setHolographic] = useState(false);
  const voicePrefs = loadVoicePrefs();

  // Generate the guided experience
  const generate = useCallback(async () => {
    setMode('generating');
    try {
      const res = await axios.post(`${API}/guided-experience/generate`, {
        practice_name: practiceName,
        description,
        instructions,
        category,
        duration_minutes: durationMinutes,
      }, { headers: authHeaders });
      setSegments(res.data.segments);
      setTotalDuration(res.data.total_duration);
      setCurrentIdx(0);
      setElapsed(0);
      setMode('ready');
    } catch {
      setMode('idle');
    }
  }, [practiceName, description, instructions, category, durationMinutes, authHeaders]);

  // Play TTS for a segment
  const playSegmentAudio = useCallback(async (text) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setTtsLoading(true);
    try {
      const res = await axios.post(`${API}/tts/narrate`, {
        text,
        voice: voicePrefs.voice,
        speed: voicePrefs.speed || 0.8,
        context: category || 'meditation',
      });
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      audioRef.current = audio;
      setTtsLoading(false);
      return new Promise((resolve) => {
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play().catch(resolve);
      });
    } catch {
      setTtsLoading(false);
    }
  }, [voicePrefs]);

  // Start the meditation flow
  const startPlaying = useCallback(async () => {
    setMode('playing');
    setCurrentIdx(0);
    setElapsed(0);

    // Tick elapsed every second
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    // Play segments sequentially
    for (let i = 0; i < segments.length; i++) {
      setCurrentIdx(i);
      const seg = segments[i];

      // Play TTS narration
      await playSegmentAudio(seg.text);

      // Wait the remaining duration (segment duration minus narration time)
      const waitMs = Math.max(2000, (seg.duration || 30) * 1000 - 5000);
      await new Promise(resolve => {
        segmentTimerRef.current = setTimeout(resolve, waitMs);
      });
    }

    clearInterval(timerRef.current);
    setMode('complete');
  }, [segments, playSegmentAudio]);

  const pause = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    clearInterval(timerRef.current);
    clearTimeout(segmentTimerRef.current);
    setMode('paused');
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) audioRef.current.play().catch(() => {});
    timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
    setMode('playing');
  }, []);

  const close = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    clearInterval(timerRef.current);
    clearTimeout(segmentTimerRef.current);
    setMode('idle');
    setSegments([]);
    setCurrentIdx(0);
    setElapsed(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      clearInterval(timerRef.current);
      clearTimeout(segmentTimerRef.current);
    };
  }, []);

  const currentSeg = segments[currentIdx];
  const CueIcon = currentSeg ? (CUE_ICONS[currentSeg.cue] || Heart) : Heart;
  const progress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Idle state — just the launch button
  if (mode === 'idle') {
    return (
      <button onClick={generate}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all hover:scale-[1.02]"
        style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}
        data-testid="launch-guided-experience">
        <Play size={13} /> Guided Meditation
      </button>
    );
  }

  // Generating state
  if (mode === 'generating') {
    return (
      <div className="p-8 text-center" data-testid="guided-generating">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          <Loader2 size={32} style={{ color }} />
        </motion.div>
        <p className="text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>Crafting your guided experience...</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Transforming instructions into an immersive meditation</p>
      </div>
    );
  }

  // Ready state — preview before starting
  if (mode === 'ready') {
    return (
      <div className="p-6" data-testid="guided-ready">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color }}>Guided Meditation Ready</p>
            <p className="text-lg font-light mt-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>{practiceName}</p>
          </div>
          <button onClick={close} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{segments.length} segments</span>
          <span>{formatTime(totalDuration)}</span>
          <span className="capitalize">{category}</span>
        </div>
        {/* Preview first 3 segment cues */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {segments.slice(0, 5).map((s, i) => {
            const Icon = CUE_ICONS[s.cue] || Heart;
            return (
              <span key={i} className="text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1"
                style={{ background: `${color}08`, color, border: `1px solid ${color}12` }}>
                <Icon size={9} /> {CUE_LABELS[s.cue] || s.cue}
              </span>
            );
          })}
          {segments.length > 5 && <span className="text-[10px] px-2 py-1" style={{ color: 'var(--text-muted)' }}>+{segments.length - 5} more</span>}
        </div>
        {/* Holographic mode toggle */}
        <button onClick={() => setHolographic(h => !h)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs mb-4 transition-all"
          style={{
            background: holographic ? `${color}12` : 'rgba(255,255,255,0.02)',
            border: `1px solid ${holographic ? `${color}20` : 'rgba(255,255,255,0.06)'}`,
            color: holographic ? color : 'var(--text-muted)',
          }}
          data-testid="holographic-toggle">
          <Maximize2 size={12} /> Holographic 3D Mode {holographic ? 'ON' : 'OFF'}
        </button>
        <button onClick={startPlaying}
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
          data-testid="start-guided-meditation">
          <Play size={14} /> Begin Meditation
        </button>
      </div>
    );
  }

  // Playing / Paused / Complete states — the immersive view
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`overflow-hidden relative ${holographic ? 'min-h-[500px]' : ''}`}
      style={{ borderColor: `${color}15` }}
      data-testid="guided-immersive-player"
    >
      {/* Holographic 3D Canvas */}
      {holographic && (
        <HolographicCanvas
          color={color}
          cue={currentSeg?.cue || 'breathe'}
          intensity={currentSeg?.intensity || 5}
          playing={mode === 'playing'}
        />
      )}

      {/* Ambient glow background (shown when holographic is off) */}
      {!holographic && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              opacity: mode === 'playing' ? [0.03, 0.08, 0.03] : 0.02,
              scale: mode === 'playing' ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
            style={{ background: `radial-gradient(circle, ${color}30, transparent 70%)` }}
          />
        </div>
      )}

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={mode === 'playing' ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: `${color}15`, border: `1px solid ${color}20` }}
            >
              <CueIcon size={18} style={{ color }} />
            </motion.div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color }}>
                {mode === 'complete' ? 'Complete' : CUE_LABELS[currentSeg?.cue] || 'Guided'}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {mode === 'complete' ? 'Namaste' : `Step ${currentIdx + 1} of ${segments.length}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setHolographic(h => !h)}
              className="p-1.5 rounded-lg transition-all"
              style={{ background: holographic ? `${color}15` : 'rgba(255,255,255,0.03)', color: holographic ? color : 'var(--text-muted)' }}
              data-testid="holographic-toggle-play">
              {holographic ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              {formatTime(elapsed)} / {formatTime(totalDuration)}
            </span>
            <button onClick={close} className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <X size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 rounded-full mb-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: color, width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Segment dots */}
        <div className="flex gap-1.5 mb-6 justify-center">
          {segments.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i < currentIdx ? color : i === currentIdx ? color : 'rgba(255,255,255,0.08)',
                opacity: i === currentIdx ? 1 : i < currentIdx ? 0.5 : 0.2,
                transform: i === currentIdx ? 'scale(1.5)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Current narration text */}
        <AnimatePresence mode="wait">
          {mode === 'complete' ? (
            <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <p className="text-2xl font-light mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                Meditation Complete
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Take a moment to honor this time you gave to yourself. Carry this peace with you.
              </p>
              <button onClick={close}
                className="px-6 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}
                data-testid="guided-close">
                Return
              </button>
            </motion.div>
          ) : currentSeg && (
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-4"
            >
              {/* Breathing animation for breathe cues */}
              {currentSeg.cue === 'breathe' && mode === 'playing' && (
                <motion.div
                  animate={{ scale: [1, 1.6, 1], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                  style={{ background: `radial-gradient(circle, ${color}40, transparent)` }}
                />
              )}

              {ttsLoading && (
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Loader2 size={12} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Preparing narration...</span>
                </div>
              )}

              <p className="text-base md:text-lg leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--text-secondary)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', lineHeight: 1.8 }}>
                {currentSeg.text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        {mode !== 'complete' && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={mode === 'playing' ? pause : resume}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
              style={{ background: `${color}15`, border: `1px solid ${color}25` }}
              data-testid="guided-play-pause">
              {mode === 'playing' ? <Pause size={18} style={{ color }} /> : <Play size={18} style={{ color }} />}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
