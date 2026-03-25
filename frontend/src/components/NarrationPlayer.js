import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Volume2, VolumeX, Loader2, Pause, Play } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function NarrationPlayer({ text, label = 'Listen', color = '#D8B4FE', speed = 0.9 }) {
  const [state, setState] = useState('idle'); // idle | loading | playing | paused
  const audioRef = useRef(null);
  const cacheRef = useRef({});

  const handlePlay = useCallback(async () => {
    if (state === 'playing') {
      audioRef.current?.pause();
      setState('paused');
      return;
    }
    if (state === 'paused' && audioRef.current) {
      audioRef.current.play();
      setState('playing');
      return;
    }

    // Check cache
    const cacheKey = text.substring(0, 100);
    if (cacheRef.current[cacheKey]) {
      playAudio(cacheRef.current[cacheKey]);
      return;
    }

    setState('loading');
    try {
      const res = await axios.post(`${API}/tts/narrate`, { text, speed });
      const b64 = res.data.audio;
      cacheRef.current[cacheKey] = b64;
      playAudio(b64);
    } catch {
      setState('idle');
    }
  }, [text, speed, state]);

  const playAudio = useCallback((b64) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(`data:audio/mp3;base64,${b64}`);
    audio.onended = () => setState('idle');
    audio.onerror = () => setState('idle');
    audio.play();
    audioRef.current = audio;
    setState('playing');
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setState('idle');
  }, []);

  return (
    <div className="flex items-center gap-2">
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
    </div>
  );
}
