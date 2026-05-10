/**
 * NarrationPlayer — V1.2.7 unified-persona refactor.
 *
 * Previously this component carried its OWN voice/speed picker
 * (a 9-tile grid + 3 speed pills inside a popover) which collided
 * visually with the LanguageBar's translator panel. The architect
 * called this out as the "two overlapping floating panels" problem
 * (2026-02-10) and asked for a single Handshake protocol.
 *
 * This refactor:
 *   • Removes the inline picker entirely. Voice + speed now come from
 *     useVoicePersona() — the same hook the LanguageBar's Universal
 *     Translator panel writes to. Pick once, used everywhere.
 *   • Keeps the play / pause / stop controls and the waveform.
 *   • Shows a tiny read-only chip with the current voice label so the
 *     user knows which persona will play; tapping it scrolls to the
 *     LanguageBar pill (the picker's home) instead of opening a
 *     second panel.
 *
 * The narrationSystem.playVoice contract is unchanged; we just stop
 * tracking voice/speed locally.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Loader2, Pause, Play } from 'lucide-react';
import { narrationSystem } from '../engines/PerformanceManager';
import { useVoicePersona } from '../hooks/useVoicePersona';

export default function NarrationPlayer({ text, label = 'Listen', color = '#D8B4FE' }) {
  const [state, setState] = useState('idle');
  const { voice, speed, VOICES } = useVoicePersona();
  const textRef = useRef(text);
  const playbackTimeRef = useRef(0);

  // Keep textRef in sync without triggering re-renders.
  useEffect(() => { textRef.current = text; }, [text]);

  // Cleanup on unmount — stop audio.
  useEffect(() => () => { narrationSystem.stop(); }, []);

  // If the persona changes mid-playback, stop so the new pick takes
  // effect on the next play.
  useEffect(() => {
    if (state === 'playing' || state === 'paused') {
      narrationSystem.stop();
      setState('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice, speed]);

  const currentVoice = VOICES.find((v) => v.id === voice) || VOICES[0];
  const genderColor =
    currentVoice.gender === 'female' ? '#FDA4AF'
      : currentVoice.gender === 'male' ? '#93C5FD'
      : '#D8B4FE';

  const handlePlay = useCallback(async () => {
    if (state === 'playing') { narrationSystem.pause(); setState('paused'); return; }
    if (state === 'paused')  { narrationSystem.resume(); setState('playing'); return; }
    setState('loading');
    narrationSystem.playVoice(textRef.current, {
      voice,
      speed,
      onStart: () => setState('playing'),
      onEnd: () => { playbackTimeRef.current = 0; setState('idle'); },
      onError: (err) => {
        if (process.env.NODE_ENV !== 'production') console.warn('[NarrationPlayer]', err);
        setState('idle');
      },
    });
  }, [voice, speed, state]);

  const stop = useCallback(() => {
    narrationSystem.stop();
    playbackTimeRef.current = 0;
    setState('idle');
  }, []);

  // Tap the chip → bounce focus to the LanguageBar pill so the user
  // knows where to change their voice without opening a second panel.
  const focusPicker = useCallback(() => {
    const el = document.querySelector('[data-testid="language-bar-toggle"]');
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus?.(); }
  }, []);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Play / Pause / Resume */}
      <button
        onClick={handlePlay}
        disabled={state === 'loading'}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
        style={{
          background: state === 'playing' ? `${color}20` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${state === 'playing' ? `${color}40` : 'rgba(255,255,255,0.08)'}`,
          color: state === 'playing' ? color : 'var(--text-secondary)',
          transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
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

      {/* Stop */}
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

      {/* Read-only persona chip — tap routes user to the unified
          picker in the LanguageBar pill. NO second panel. */}
      <button
        onClick={focusPicker}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: 'var(--text-muted)',
          transition: 'background-color 0.2s, border-color 0.2s',
        }}
        data-testid="narration-persona-chip"
        title="Voice persona — change in the Translator pill"
      >
        <Volume2 size={11} />
        <span style={{ color: genderColor }}>{currentVoice.label}</span>
      </button>
    </div>
  );
}
