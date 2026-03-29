import { useCallback, useRef, useEffect } from 'react';

/*
 * Cosmic Sound Engine — Web Audio API based interaction sounds
 * Provides ambient, click, hover, success, error, whoosh, and chime sounds
 * All sounds are synthesized (no external files needed)
 */

let audioCtx = null;
let masterGain = null;
let isEnabled = true;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.15;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return { ctx: audioCtx, master: masterGain };
}

// Soft click — subtle percussive tick
function playClick() {
  if (!isEnabled) return;
  const { ctx, master } = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(2200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.04);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
  osc.connect(gain).connect(master);
  osc.start(); osc.stop(ctx.currentTime + 0.06);
}

// Hover — whisper-light brush
function playHover() {
  if (!isEnabled) return;
  const { ctx, master } = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.connect(gain).connect(master);
  osc.start(); osc.stop(ctx.currentTime + 0.08);
}

// Success — ascending two-tone chime
function playSuccess() {
  if (!isEnabled) return;
  const { ctx, master } = getCtx();
  [523.25, 659.25].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
    osc.connect(gain).connect(master);
    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + i * 0.12 + 0.3);
  });
}

// Error — descending buzz
function playError() {
  if (!isEnabled) return;
  const { ctx, master } = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain).connect(master);
  osc.start(); osc.stop(ctx.currentTime + 0.2);
}

// Whoosh — smooth transition sweep
function playWhoosh() {
  if (!isEnabled) return;
  const { ctx, master } = getCtx();
  const bufSize = ctx.sampleRate * 0.15;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.1);
  filter.Q.value = 2;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  src.connect(filter).connect(gain).connect(master);
  src.start(); src.stop(ctx.currentTime + 0.15);
}

// Celestial chime — ethereal bell tone for special moments
function playChime() {
  if (!isEnabled) return;
  const { ctx, master } = getCtx();
  const freqs = [523.25, 783.99, 1046.50];
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.08 - i * 0.02, ctx.currentTime + i * 0.08 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.6);
    osc.connect(gain).connect(master);
    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.6);
  });
}

// Open/expand — rising harmonic
function playOpen() {
  if (!isEnabled) return;
  const { ctx, master } = getCtx();
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine'; osc2.type = 'sine';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
  osc2.frequency.setValueAtTime(450, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain); osc2.connect(gain); gain.connect(master);
  osc.start(); osc2.start();
  osc.stop(ctx.currentTime + 0.2); osc2.stop(ctx.currentTime + 0.2);
}

// Close — descending harmonic
function playClose() {
  if (!isEnabled) return;
  const { ctx, master } = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.connect(gain).connect(master);
  osc.start(); osc.stop(ctx.currentTime + 0.15);
}

// Toggle sound on/off
function setEnabled(val) { isEnabled = val; }
function getEnabled() { return isEnabled; }

// Set master volume (0-1)
function setVolume(val) {
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, val));
}

export function useSoundEngine() {
  return {
    click: useCallback(playClick, []),
    hover: useCallback(playHover, []),
    success: useCallback(playSuccess, []),
    error: useCallback(playError, []),
    whoosh: useCallback(playWhoosh, []),
    chime: useCallback(playChime, []),
    open: useCallback(playOpen, []),
    close: useCallback(playClose, []),
    setEnabled: useCallback(setEnabled, []),
    getEnabled: useCallback(getEnabled, []),
    setVolume: useCallback(setVolume, []),
  };
}

// Auto-attach sounds to common interactive elements
export function useGlobalSounds() {
  const lastHover = useRef(0);

  useEffect(() => {
    const handleClick = (e) => {
      if (!isEnabled) return;
      const el = e.target?.closest?.('button, a, [role="button"], .glass-card-hover, [data-sound="click"]');
      if (el) playClick();
    };
    const handleHover = (e) => {
      if (!isEnabled) return;
      const now = Date.now();
      if (now - lastHover.current < 80) return; // Throttle
      if (!e.target?.closest) return; // Skip non-Element targets (SVG text, etc.)
      const el = e.target.closest('.glass-card-hover, [data-sound="hover"]');
      if (el) { lastHover.current = now; playHover(); }
    };

    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('mouseenter', handleHover, { passive: true, capture: true });
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseenter', handleHover, { capture: true });
    };
  }, []);
}

export { playClick, playHover, playSuccess, playError, playWhoosh, playChime, playOpen, playClose, setEnabled, getEnabled, setVolume };
