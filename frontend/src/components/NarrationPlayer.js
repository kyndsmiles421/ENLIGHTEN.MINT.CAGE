import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Volume2, VolumeX, Loader2, Pause, Play, ChevronDown, Settings2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const VOICES = [
  { id: 'nova', label: 'Nova', desc: 'Warm feminine', gender: 'female', accent: 'American' },
  { id: 'shimmer', label: 'Shimmer', desc: 'Soft feminine', gender: 'female', accent: 'American' },
  { id: 'coral', label: 'Coral', desc: 'Bright feminine', gender: 'female', accent: 'American' },
  { id: 'sage', label: 'Sage', desc: 'Wise masculine', gender: 'male', accent: 'American' },
  { id: 'ash', label: 'Ash', desc: 'Warm masculine', gender: 'male', accent: 'American' },
  { id: 'onyx', label: 'Onyx', desc: 'Deep masculine', gender: 'male', accent: 'American' },
  { id: 'echo', label: 'Echo', desc: 'Smooth masculine', gender: 'male', accent: 'American' },
  { id: 'fable', label: 'Fable', desc: 'Expressive storyteller', gender: 'male', accent: 'British' },
  { id: 'alloy', label: 'Alloy', desc: 'Balanced neutral', gender: 'neutral', accent: 'Neutral' },
];

const SPEEDS = [
  { value: 0.8, label: 'Slow' },
  { value: 1.0, label: 'Normal' },
  { value: 1.15, label: 'Brisk' },
];

const STORAGE_KEY = 'cosmiccollective_voice_prefs';

function loadPrefs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { voice: 'nova', speed: 1.0 };
}

function savePrefs(prefs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
}

export default function NarrationPlayer({ text, label = 'Listen', color = '#D8B4FE' }) {
  const [state, setState] = useState('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [voice, setVoice] = useState(() => loadPrefs().voice);
  const [speed, setSpeed] = useState(() => loadPrefs().speed);
  const audioRef = useRef(null);
  const cacheRef = useRef({});
  const settingsRef = useRef(null);
  const textRef = useRef(text);
  const playbackTimeRef = useRef(0);

  // Keep textRef in sync without triggering re-renders
  useEffect(() => { textRef.current = text; }, [text]);

  // Persist preferences
  useEffect(() => { savePrefs({ voice, speed }); }, [voice, speed]);

  // Close settings dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettings(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cleanup on unmount - stop audio but don't lose cache
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlay = useCallback(async () => {
    // Pause currently playing audio
    if (state === 'playing' && audioRef.current) {
      playbackTimeRef.current = audioRef.current.currentTime;
      audioRef.current.pause();
      setState('paused');
      return;
    }

    // Resume from where we left off
    if (state === 'paused' && audioRef.current) {
      try {
        await audioRef.current.play();
        setState('playing');
      } catch {
        // If resume fails, reset and try from cache
        playbackTimeRef.current = 0;
        setState('idle');
      }
      return;
    }

    const currentText = textRef.current;
    const cacheKey = `${voice}:${speed}:${currentText.substring(0, 80)}`;

    // Try cache first
    if (cacheRef.current[cacheKey]) {
      playAudio(cacheRef.current[cacheKey], 0);
      return;
    }

    // Fetch new TTS audio
    setState('loading');
    try {
      const res = await axios.post(`${API}/tts/narrate`, { text: currentText, speed, voice });
      const b64 = res.data.audio;
      cacheRef.current[cacheKey] = b64;
      playAudio(b64, 0);
    } catch {
      setState('idle');
    }
  }, [voice, speed, state]);

  const playAudio = useCallback((b64, startTime) => {
    // Clean up any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current = null;
    }

    const audio = new Audio(`data:audio/mp3;base64,${b64}`);

    audio.oncanplaythrough = () => {
      if (startTime > 0 && startTime < audio.duration) {
        audio.currentTime = startTime;
      }
      audio.play().catch(() => {
        setState('idle');
      });
    };

    audio.onplay = () => setState('playing');

    audio.onended = () => {
      playbackTimeRef.current = 0;
      setState('idle');
    };

    audio.onerror = () => {
      // Don't reset on transient errors - allow resume
      if (audioRef.current && audioRef.current.currentTime > 0) {
        playbackTimeRef.current = audioRef.current.currentTime;
        setState('paused');
      } else {
        setState('idle');
      }
    };

    // Handle browser-initiated pauses (e.g., tab switch, autoplay policy)
    audio.onpause = () => {
      if (audio.currentTime < audio.duration && audio.currentTime > 0) {
        playbackTimeRef.current = audio.currentTime;
        // Only set paused if we didn't explicitly stop
        setState(prev => prev === 'idle' ? 'idle' : 'paused');
      }
    };

    audioRef.current = audio;
    audio.load();
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current = null;
    }
    playbackTimeRef.current = 0;
    setState('idle');
  }, []);

  const currentVoice = VOICES.find(v => v.id === voice) || VOICES[0];
  const genderColor = currentVoice.gender === 'female' ? '#FDA4AF' : currentVoice.gender === 'male' ? '#93C5FD' : '#D8B4FE';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Play Button */}
      <button
        onClick={handlePlay}
        disabled={state === 'loading'}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
        style={{
          background: state === 'playing' ? `${color}20` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${state === 'playing' ? `${color}40` : 'rgba(255,255,255,0.08)'}`,
          color: state === 'playing' ? color : 'var(--text-secondary)',
          transition: 'all 0.3s',
          opacity: state === 'loading' ? 0.6 : 1,
        }}
        data-testid="narration-play-btn"
      >
        {state === 'loading' ? (
          <><Loader2 size={12} className="animate-spin" /> Generating...</>
        ) : state === 'playing' ? (
          <><Pause size={12} /> Pause</>
        ) : state === 'paused' ? (
          <><Play size={12} /> Resume</>
        ) : (
          <><Volume2 size={12} /> {label}</>
        )}
      </button>

      {/* Stop Button */}
      <AnimatePresence>
        {(state === 'playing' || state === 'paused') && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={stop}
            className="p-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
            data-testid="narration-stop-btn"
          >
            <VolumeX size={12} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Waveform */}
      {state === 'playing' && (
        <div className="flex gap-0.5 ml-1">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: [3, 10, 3] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              className="w-0.5 rounded-full"
              style={{ background: color }}
            />
          ))}
        </div>
      )}

      {/* Voice Settings */}
      <div className="relative" ref={settingsRef}>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs"
          style={{
            background: showSettings ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${showSettings ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
            color: 'var(--text-muted)',
            transition: 'all 0.3s',
          }}
          data-testid="voice-settings-btn"
        >
          <Settings2 size={11} />
          <span style={{ color: genderColor }}>{currentVoice.label}</span>
          <ChevronDown size={10} style={{ transform: showSettings ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute bottom-full left-0 mb-2 w-72 rounded-xl overflow-hidden z-50"
              style={{
                background: 'rgba(18, 20, 32, 0.98)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--text-muted)' }}>Voice</p>
                <div className="grid grid-cols-3 gap-1.5 mb-4">
                  {VOICES.map(v => {
                    const gc = v.gender === 'female' ? '#FDA4AF' : v.gender === 'male' ? '#93C5FD' : '#D8B4FE';
                    const selected = voice === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => { setVoice(v.id); if (state !== 'idle') stop(); }}
                        className="p-2 rounded-lg text-center"
                        style={{
                          background: selected ? `${gc}15` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${selected ? `${gc}30` : 'rgba(255,255,255,0.06)'}`,
                          transition: 'all 0.2s',
                        }}
                        data-testid={`voice-${v.id}`}
                      >
                        <p className="text-xs font-medium" style={{ color: selected ? gc : 'var(--text-secondary)' }}>{v.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{v.desc}</p>
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--text-muted)' }}>Speed</p>
                <div className="flex gap-2">
                  {SPEEDS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => { setSpeed(s.value); if (state !== 'idle') stop(); }}
                      className="flex-1 py-2 rounded-lg text-xs text-center"
                      style={{
                        background: speed === s.value ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${speed === s.value ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                        color: speed === s.value ? 'var(--text-primary)' : 'var(--text-muted)',
                        transition: 'all 0.2s',
                      }}
                      data-testid={`speed-${s.value}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
