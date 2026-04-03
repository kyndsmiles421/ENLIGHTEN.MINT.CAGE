import { useRef, useCallback, useEffect } from 'react';

// ━━━ Organic Instrument Synthesizer ━━━
// Generates realistic-ish instrument tones using Web Audio:
//   - Singing Bowls: Multiple harmonics with long sustain + slow beating
//   - Bamboo Flute: Filtered noise + vibrato sine
//   - Tabla: Short burst with pitch sweep + noise attack
//   - Crystal Bowl: Pure sine with shimmer overtones

// Route → Instrument mapping
const ROUTE_INSTRUMENTS = {
  meditation: 'singing_bowl',
  breathing: 'singing_bowl',
  'zen-garden': 'singing_bowl',
  mantras: 'singing_bowl',
  frequencies: 'crystal_bowl',
  yoga: 'crystal_bowl',
  reiki: 'crystal_bowl',
  'star-chart': 'flute',
  oracle: 'flute',
  suanpan: 'synth',
  hub: 'synth',
  sovereign: 'synth',
  'mastery-path': 'synth',
  elixirs: 'tabla',
  herbology: 'tabla',
  'dance-music': 'tabla',
  spotless: 'synth',
  default: 'synth',
};

// ━━━ Instrument Voices ━━━
function createSingingBowl(ctx, freq, gain, duration = 4) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.connect(gain);

  // 4 harmonics with slight detuning for beating effect
  const harmonics = [1, 2.02, 3.01, 4.98];
  const amps = [1, 0.5, 0.3, 0.15];

  harmonics.forEach((h, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * h, ctx.currentTime);
    // Slow vibrato
    osc.frequency.linearRampToValueAtTime(freq * h * 1.002, ctx.currentTime + duration * 0.5);
    osc.frequency.linearRampToValueAtTime(freq * h * 0.998, ctx.currentTime + duration);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(amps[i] * 0.15, ctx.currentTime);
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.5);
  });

  // Envelope: slow attack, long sustain, gradual decay
  masterGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.8);
  masterGain.gain.setValueAtTime(0.04, ctx.currentTime + duration * 0.4);
  masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  return masterGain;
}

function createFlute(ctx, freq, gain, duration = 3) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.connect(gain);

  // Base tone — triangle wave for warmth
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  // Vibrato LFO
  const vibrato = ctx.createOscillator();
  vibrato.type = 'sine';
  vibrato.frequency.setValueAtTime(5.5, ctx.currentTime); // 5.5Hz vibrato
  const vibratoGain = ctx.createGain();
  vibratoGain.gain.setValueAtTime(freq * 0.008, ctx.currentTime); // Subtle
  vibrato.connect(vibratoGain);
  vibratoGain.connect(osc.frequency);
  vibrato.start(ctx.currentTime + 0.5); // Delayed vibrato onset
  vibrato.stop(ctx.currentTime + duration);

  // Breath noise — filtered white noise for airiness
  const bufferSize = ctx.sampleRate * duration;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const noise = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) noise[i] = (Math.random() * 2 - 1) * 0.02;

  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = noiseBuffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(freq * 2, ctx.currentTime);
  noiseFilter.Q.setValueAtTime(2, ctx.currentTime);
  noiseNode.connect(noiseFilter);
  noiseFilter.connect(masterGain);
  noiseNode.start(ctx.currentTime);

  osc.connect(masterGain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);

  // Envelope: breath attack
  masterGain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 0.15);
  masterGain.gain.setValueAtTime(0.03, ctx.currentTime + duration * 0.3);
  masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  return masterGain;
}

function createTabla(ctx, freq, gain, duration = 0.8) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.connect(gain);

  // Pitched body — sine with pitch sweep
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq * 1.5, ctx.currentTime); // Start higher
  osc.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + 0.05); // Quick drop
  osc.connect(masterGain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);

  // Attack noise — short burst
  const attackSize = ctx.sampleRate * 0.03;
  const attackBuf = ctx.createBuffer(1, attackSize, ctx.sampleRate);
  const attack = attackBuf.getChannelData(0);
  for (let i = 0; i < attackSize; i++) attack[i] = (Math.random() * 2 - 1) * Math.exp(-i / (attackSize * 0.3));

  const attackNode = ctx.createBufferSource();
  attackNode.buffer = attackBuf;
  const attackGain = ctx.createGain();
  attackGain.gain.setValueAtTime(0.04, ctx.currentTime);
  attackNode.connect(attackGain);
  attackGain.connect(masterGain);
  attackNode.start(ctx.currentTime);

  // Envelope: sharp attack, quick decay
  masterGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.005);
  masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  return masterGain;
}

function createCrystalBowl(ctx, freq, gain, duration = 5) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.connect(gain);

  // Pure sine + shimmer overtones
  const fundamentals = [1, 2.0, 3.0, 5.0];
  const amps = [1, 0.3, 0.15, 0.08];

  fundamentals.forEach((h, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * h, ctx.currentTime);
    // Shimmer: very slow pitch modulation
    osc.frequency.linearRampToValueAtTime(freq * h * 1.001, ctx.currentTime + duration * 0.7);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(amps[i] * 0.12, ctx.currentTime);
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 1);
  });

  // Very slow attack, extremely long sustain
  masterGain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 1.5);
  masterGain.gain.setValueAtTime(0.035, ctx.currentTime + duration * 0.6);
  masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  return masterGain;
}

const INSTRUMENT_CREATORS = {
  singing_bowl: createSingingBowl,
  flute: createFlute,
  tabla: createTabla,
  crystal_bowl: createCrystalBowl,
  synth: null, // Falls back to pure oscillator
};

// ━━━ Organic Audio Hook ━━━
export function useOrganicAudio(enabled = true) {
  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const activeVoicesRef = useRef([]);
  const initRef = useRef(false);

  // Initialize audio context
  const getCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.connect(ctx.destination);
      masterGainRef.current = gain;
      return ctx;
    } catch { return null; }
  }, []);

  // Play an organic instrument voice
  const playVoice = useCallback((instrument, frequency, duration) => {
    if (!enabled) return;
    const ctx = getCtx();
    if (!ctx || !masterGainRef.current) return;
    const creator = INSTRUMENT_CREATORS[instrument];
    if (!creator) return; // synth = no organic voice
    creator(ctx, frequency, masterGainRef.current, duration);
  }, [enabled, getCtx]);

  // Get instrument for a route
  const getInstrument = useCallback((routeKey) => {
    return ROUTE_INSTRUMENTS[routeKey] || ROUTE_INSTRUMENTS.default;
  }, []);

  // Play ambient texture for a route
  const playAmbientForRoute = useCallback((routeKey, baseFreq) => {
    const instrument = getInstrument(routeKey);
    if (instrument === 'synth') return; // Synth handled by usePhonicResonance
    const durations = { singing_bowl: 6, flute: 4, tabla: 1.2, crystal_bowl: 8 };
    playVoice(instrument, baseFreq, durations[instrument] || 4);
  }, [getInstrument, playVoice]);

  // Cleanup
  useEffect(() => {
    return () => {
      try { ctxRef.current?.close(); } catch {}
    };
  }, []);

  return { playVoice, getInstrument, playAmbientForRoute };
}

export { ROUTE_INSTRUMENTS };
