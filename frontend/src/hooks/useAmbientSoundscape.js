import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/*
 * Celestial Ambient Soundscape — Auto-adapting background sounds per page
 * Uses Web Audio API to synthesize ambient loops (no audio files needed)
 * Toggle on/off via exported functions
 */

let audioCtx = null;
let masterGain = null;
let isEnabled = false; // Off by default — user opts in
let activeSources = [];
let currentScape = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.06;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return { ctx: audioCtx, master: masterGain };
}

function stopAll() {
  activeSources.forEach(s => {
    try { s.gain?.gain.linearRampToValueAtTime(0, (audioCtx?.currentTime || 0) + 1); } catch {}
    setTimeout(() => { try { s.source?.stop(); } catch {} }, 1200);
  });
  activeSources = [];
  currentScape = null;
}

// ── Soundscape Generators ──

function playDrone(freq, volume = 0.04, detune = 0) {
  const { ctx, master } = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = 'sine';
  osc.frequency.value = freq;
  osc.detune.value = detune;
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  filter.Q.value = 1;
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 3);
  osc.connect(filter).connect(gain).connect(master);
  osc.start();
  activeSources.push({ source: osc, gain });
  return { osc, gain };
}

function playWindNoise(volume = 0.02) {
  const { ctx, master } = getCtx();
  const bufSize = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 300;
  filter.Q.value = 0.5;
  // Modulate filter for wind effect
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.1;
  lfoGain.gain.value = 200;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 3);
  src.connect(filter).connect(gain).connect(master);
  src.start();
  activeSources.push({ source: src, gain }, { source: lfo, gain: lfoGain });
}

function playChimeLoop(baseFreq, interval, volume = 0.015) {
  const { ctx, master } = getCtx();
  const play = () => {
    if (!isEnabled || currentScape === null) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = baseFreq + (Math.random() - 0.5) * 100;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
    osc.connect(gain).connect(master);
    osc.start();
    osc.stop(ctx.currentTime + 2);
    setTimeout(play, interval + Math.random() * interval * 0.5);
  };
  setTimeout(play, 1000 + Math.random() * 2000);
}

function playWaterDrops(volume = 0.012) {
  const { ctx, master } = getCtx();
  const play = () => {
    if (!isEnabled || currentScape === null) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const freq = 800 + Math.random() * 600;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain).connect(master);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    setTimeout(play, 2000 + Math.random() * 4000);
  };
  setTimeout(play, 500 + Math.random() * 2000);
}

function playSingingBowl(freq, volume = 0.025) {
  const { ctx, master } = getCtx();
  const play = () => {
    if (!isEnabled || currentScape === null) return;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine'; osc2.type = 'sine';
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 2.01; // Slight beating
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6);
    osc1.connect(gain); osc2.connect(gain); gain.connect(master);
    osc1.start(); osc2.start();
    osc1.stop(ctx.currentTime + 6); osc2.stop(ctx.currentTime + 6);
    setTimeout(play, 8000 + Math.random() * 6000);
  };
  setTimeout(play, 2000);
}

// ── Soundscape Definitions ──

const SCAPES = {
  'star-chart': () => {
    playDrone(65, 0.03); playDrone(98, 0.02, 3);
    playChimeLoop(1200, 4000, 0.01);
    playChimeLoop(1600, 6000, 0.008);
    playWindNoise(0.008);
  },
  'meditation': () => {
    playDrone(55, 0.04); playDrone(110, 0.02);
    playSingingBowl(174, 0.02);
    playSingingBowl(262, 0.015);
  },
  'breathing': () => {
    playDrone(60, 0.03);
    playWaterDrops(0.01);
    playWindNoise(0.015);
  },
  'divination': () => {
    playDrone(73, 0.035, 5); playDrone(146, 0.015);
    playChimeLoop(900, 5000, 0.012);
    playChimeLoop(1400, 8000, 0.008);
  },
  'sanctuary': () => {
    playDrone(65, 0.03);
    playWaterDrops(0.008);
    playSingingBowl(196, 0.015);
  },
  'explore': () => {
    playDrone(82, 0.025); playDrone(123, 0.015);
    playChimeLoop(1000, 3500, 0.01);
    playWindNoise(0.01);
  },
  'default': () => {
    playDrone(65, 0.02);
    playChimeLoop(1200, 7000, 0.008);
  },
};

// Page -> soundscape mapping
function getScapeForPath(path) {
  if (path.includes('star-chart')) return 'star-chart';
  if (path.includes('meditation') || path.includes('yoga') || path.includes('daily-ritual')) return 'meditation';
  if (path.includes('breathing') || path.includes('exercises')) return 'breathing';
  if (path.includes('oracle') || path.includes('tarot') || path.includes('runes') ||
      path.includes('numerology') || path.includes('astrology') || path.includes('akashic') ||
      path.includes('divination')) return 'divination';
  if (path.includes('journal') || path.includes('blessings') || path.includes('soul-reports') ||
      path.includes('mood') || path.includes('dreams') || path.includes('sanctuary')) return 'sanctuary';
  if (path.includes('crystal') || path.includes('encyclopedia') || path.includes('reading') ||
      path.includes('explore') || path.includes('quantum')) return 'explore';
  return 'default';
}

export function setAmbientEnabled(val) {
  isEnabled = val;
  localStorage.setItem('zen_ambient_soundscape', val ? 'on' : 'off');
  if (!val) stopAll();
}

export function getAmbientEnabled() { return isEnabled; }

export function setAmbientVolume(val) {
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(0.15, val));
}

export function useAmbientSoundscape() {
  const location = useLocation();
  const prevScape = useRef(null);

  // Init from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zen_ambient_soundscape');
    isEnabled = saved === 'on';
  }, []);

  useEffect(() => {
    if (!isEnabled) return;
    const scape = getScapeForPath(location.pathname);
    if (scape === prevScape.current) return;
    prevScape.current = scape;
    stopAll();
    currentScape = scape;
    const gen = SCAPES[scape] || SCAPES['default'];
    // Small delay to let page transition happen first
    const t = setTimeout(() => { if (isEnabled) gen(); }, 800);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // Cleanup on unmount
  useEffect(() => () => stopAll(), []);
}
