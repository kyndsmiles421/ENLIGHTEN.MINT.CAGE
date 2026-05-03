import React, { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';

const SensoryContext = createContext(null);

const THEMES = {
  cosmic: { label: 'Dark Cosmic', bg: '#0B0C15', bgSecondary: '#161826', primary: '#C084FC', textPrimary: '#F8FAFC', textSecondary: '#CBD5E1', textMuted: '#64748B' },
  midnight: { label: 'Deep Midnight', bg: '#070B14', bgSecondary: '#0F1525', primary: '#818CF8', textPrimary: '#E2E8F0', textSecondary: '#94A3B8', textMuted: '#475569' },
  earth: { label: 'Warm Earth', bg: '#1A1410', bgSecondary: '#231C15', primary: '#D97706', textPrimary: '#FEF3C7', textSecondary: '#D6C9A8', textMuted: '#78716C' },
  forest: { label: 'Sacred Forest', bg: '#0A1410', bgSecondary: '#12201A', primary: '#22C55E', textPrimary: '#ECFDF5', textSecondary: '#A7F3D0', textMuted: '#4B7A5C' },
  light: { label: 'Light Celestial', bg: '#F8F6F3', bgSecondary: '#FFFFFF', primary: '#7C3AED', textPrimary: '#1E1B2E', textSecondary: '#4A4458', textMuted: '#8E8A9A' },
};

const DEFAULT_PREFS = {
  theme: 'cosmic',
  immersionLevel: 'full',  // 'calm' | 'standard' | 'full'
  reduceMotion: false,
  reduceParticles: false,
  reduceFlashing: false,
  soundEffects: true,
  ambientVolume: 15,
  fontSize: 'default',
  highContrast: false,
  sovereignMute: false,  // Global master mute
  audioTier: 'standard', // 'standard' | 'apprentice' | 'artisan' | 'sovereign'
  // V1.0.8 — Auto-Visuals toggle. When ON, the app auto-generates AI
  // imagery (chamber souvenirs on completion, forecast cosmic art on
  // expand, etc.). When OFF, all auto-image fetches are suppressed
  // and the user only sees imagery they explicitly request via a
  // "Generate" button. Force-OFF when immersionLevel === 'calm' (the
  // calm immersion contract is "no surprise media"). Default true so
  // existing behaviour is preserved.
  autoVisuals: true,
  // V1.0.11 — Sage Voice mode. ElevenLabs TTS narration of ritual
  // step descriptions. Three modes:
  //   'off'    — no audio (default; respects user budget + privacy)
  //   'demand' — speaker icon in HUD; tap to play current step
  //   'auto'   — narrate every step automatically on ritual:step-active
  // Forced to 'off' when immersionLevel === 'calm' (no surprise media).
  sageVoiceMode: 'off',
};

// ━━━ 4-TIER AUDIO RESOLUTION SYSTEM ━━━
const AUDIO_TIERS = {
  standard:   { sampleRate: 44100, bitDepth: 16, label: 'Standard',  reverbDecay: 0.8, reverbMix: 0.1 },
  apprentice: { sampleRate: 48000, bitDepth: 16, label: 'Hi-Fi',     reverbDecay: 1.5, reverbMix: 0.2 },
  artisan:    { sampleRate: 88200, bitDepth: 24, label: 'Pro-Grade',  reverbDecay: 2.5, reverbMix: 0.3 },
  sovereign:  { sampleRate: 96000, bitDepth: 24, label: 'Lossless',   reverbDecay: 4.0, reverbMix: 0.4 },
};

// Map mastery tiers to audio tiers
const MASTERY_TO_AUDIO = {
  observer: 'standard', synthesizer: 'apprentice', archivist: 'artisan',
  navigator: 'sovereign', sovereign: 'sovereign',
};

function loadPrefs() {
  try {
    const stored = localStorage.getItem('cosmic_prefs');
    return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
  } catch { return DEFAULT_PREFS; }
}

export function SensoryProvider({ children }) {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [ambientOn, setAmbientOn] = useState(false);
  const [audioSources, setAudioSources] = useState([]); // Active audio source registry
  const volume = prefs.ambientVolume / 100;
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const nodesRef = useRef([]);
  const externalContextsRef = useRef(new Set()); // Track external AudioContexts

  // ━━━ GLOBAL AUDIO ENGINE: Sovereign Mute ━━━
  // Broadcast mute state via body attribute for cross-component awareness
  useEffect(() => {
    document.body.setAttribute('data-audio-muted', prefs.sovereignMute ? 'true' : 'false');
  }, [prefs.sovereignMute]);

  // Register an external AudioContext so the master switch can suspend it
  const registerAudioContext = useCallback((ctx) => {
    if (ctx && ctx instanceof AudioContext) {
      externalContextsRef.current.add(ctx);
      // If already muted, suspend immediately
      if (prefs.sovereignMute && ctx.state === 'running') {
        ctx.suspend().catch(() => {});
      }
    }
  }, [prefs.sovereignMute]);

  const unregisterAudioContext = useCallback((ctx) => {
    externalContextsRef.current.delete(ctx);
  }, []);

  // Register an audio source for visual breadcrumb tracking
  const registerAudioSource = useCallback((source) => {
    setAudioSources(prev => {
      if (prev.find(s => s.id === source.id)) return prev;
      return [...prev, source];
    });
  }, []);

  const unregisterAudioSource = useCallback((sourceId) => {
    setAudioSources(prev => prev.filter(s => s.id !== sourceId));
  }, []);

  // Logarithmic fade + context suspend
  const sovereignMuteToggle = useCallback(() => {
    setPrefs(prev => {
      const newMuted = !prev.sovereignMute;
      if (newMuted) {
        // MUTE: Logarithmic fade out over 500ms, then suspend all contexts
        if (gainRef.current && audioCtxRef.current && audioCtxRef.current.state === 'running') {
          const ctx = audioCtxRef.current;
          gainRef.current.gain.cancelScheduledValues(ctx.currentTime);
          gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, ctx.currentTime);
          gainRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
          setTimeout(() => {
            ctx.suspend().catch(() => {});
          }, 550);
        }
        // Suspend all registered external contexts with fade
        externalContextsRef.current.forEach(ctx => {
          if (ctx.state === 'running') {
            setTimeout(() => ctx.suspend().catch(() => {}), 550);
          }
        });
      } else {
        // UNMUTE: Resume all contexts, then fade in
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume().then(() => {
            if (gainRef.current) {
              gainRef.current.gain.cancelScheduledValues(audioCtxRef.current.currentTime);
              gainRef.current.gain.setValueAtTime(0.0001, audioCtxRef.current.currentTime);
              gainRef.current.gain.exponentialRampToValueAtTime(volume || 0.15, audioCtxRef.current.currentTime + 0.5);
            }
          }).catch(() => {});
        }
        externalContextsRef.current.forEach(ctx => {
          if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        });
      }
      return { ...prev, sovereignMute: newMuted };
    });
  }, [volume]);

  // Hard kill — long-press action: stop ALL oscillators, clear ALL sources
  const sovereignKillAll = useCallback(() => {
    // Stop internal ambient
    nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
    nodesRef.current = [];
    setAmbientOn(false);

    // Suspend internal context
    if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      if (gainRef.current) gainRef.current.gain.value = 0;
      audioCtxRef.current.suspend().catch(() => {});
    }

    // Suspend all external contexts
    externalContextsRef.current.forEach(ctx => {
      if (ctx.state === 'running') ctx.suspend().catch(() => {});
    });

    // Clear audio source registry
    setAudioSources([]);

    // Set sovereign mute
    setPrefs(prev => ({ ...prev, sovereignMute: true }));
  }, []);

  // Check sovereign mute before any sound action
  const isMuted = prefs.sovereignMute;

  // Persist prefs
  useEffect(() => {
    localStorage.setItem('cosmic_prefs', JSON.stringify(prefs));
    // Apply theme CSS variables
    const t = THEMES[prefs.theme] || THEMES.cosmic;
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', t.bg);
    root.style.setProperty('--bg-secondary', t.bgSecondary);
    root.style.setProperty('--primary', t.primary);
    root.style.setProperty('--text-primary', t.textPrimary);
    root.style.setProperty('--text-secondary', t.textSecondary);
    root.style.setProperty('--text-muted', t.textMuted);
    document.body.style.background = t.bg;
    document.body.setAttribute('data-theme', prefs.theme === 'light' ? 'light' : 'dark');
    // Font size
    const fontSizes = { small: '14px', default: '16px', large: '18px', xlarge: '20px' };
    root.style.setProperty('--base-font-size', fontSizes[prefs.fontSize] || '16px');
    root.style.fontSize = fontSizes[prefs.fontSize] || '16px';
    // High contrast
    if (prefs.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Global Fidelity / Atmosphere Switch CSS
    const il = prefs.immersionLevel || 'full';
    root.setAttribute('data-fidelity', il);
    if (il === 'calm') {
      root.style.setProperty('--glass-blur', '0px');
      root.style.setProperty('--glass-bg', 'rgba(248,250,252,0.04)');
      root.style.setProperty('--glass-border', 'rgba(248,250,252,0.08)');
      root.style.setProperty('--glow-opacity', '0');
      root.style.setProperty('--particle-opacity', '0');
      root.style.setProperty('--transition-speed', '0s');
      root.style.setProperty('--gradient-intensity', '0');
      root.style.setProperty('--shadow-depth', '0px 0px 0px');
    } else if (il === 'standard') {
      root.style.setProperty('--glass-blur', '8px');
      root.style.setProperty('--glass-bg', 'rgba(248,250,252,0.03)');
      root.style.setProperty('--glass-border', 'rgba(248,250,252,0.06)');
      root.style.setProperty('--glow-opacity', '0.4');
      root.style.setProperty('--particle-opacity', '0.5');
      root.style.setProperty('--transition-speed', '0.2s');
      root.style.setProperty('--gradient-intensity', '0.6');
      root.style.setProperty('--shadow-depth', '0 4px 16px');
    } else {
      root.style.setProperty('--glass-blur', '24px');
      root.style.setProperty('--glass-bg', 'rgba(248,250,252,0.02)');
      root.style.setProperty('--glass-border', 'rgba(248,250,252,0.06)');
      root.style.setProperty('--glow-opacity', '1');
      root.style.setProperty('--particle-opacity', '1');
      root.style.setProperty('--transition-speed', '0.3s');
      root.style.setProperty('--gradient-intensity', '1');
      root.style.setProperty('--shadow-depth', '0 8px 32px');
    }
  }, [prefs]);

  const updatePref = useCallback((key, value) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  }, []);

  const setVolume = useCallback((v) => {
    setPrefs(prev => ({ ...prev, ambientVolume: Math.round(v * 100) }));
  }, []);

  const getAudioCtx = useCallback(() => {
    if (prefs.sovereignMute) return null; // Block if muted
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AC();
      gainRef.current = audioCtxRef.current.createGain();
      gainRef.current.gain.value = 0;
      gainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, [prefs.sovereignMute]);

  const startAmbient = useCallback(() => {
    if (prefs.sovereignMute) return; // Block if muted
    const ctx = getAudioCtx();
    if (!ctx) return;
    // Stop any existing
    nodesRef.current.forEach(n => { try { n.stop(); } catch(e) {} try { n.disconnect(); } catch(e) {} });
    nodesRef.current = [];

    // Deep cosmic drone - layered oscillators
    const freqs = [55, 82.5, 110, 165];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.3 : 0.08;

      // Slow LFO for shimmer
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.05 + i * 0.02;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = f * 0.005;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(g);
      g.connect(gainRef.current);
      osc.start();
      nodesRef.current.push(osc, lfo);
    });

    // Filtered noise for atmosphere
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 200;
    noiseFilter.Q.value = 1;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.15;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gainRef.current);
    noiseSource.start();
    nodesRef.current.push(noiseSource);

    // Fade in
    gainRef.current.gain.cancelScheduledValues(ctx.currentTime);
    gainRef.current.gain.setValueAtTime(0, ctx.currentTime);
    gainRef.current.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);
  }, [getAudioCtx, volume]);

  const stopAmbient = useCallback(() => {
    if (gainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      gainRef.current.gain.cancelScheduledValues(ctx.currentTime);
      gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, ctx.currentTime);
      gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => {
        nodesRef.current.forEach(n => { try { n.stop(); } catch(e) {} });
        nodesRef.current = [];
      }, 1200);
    }
  }, []);

  const playClick = useCallback(() => {
    if (!prefs.soundEffects || prefs.sovereignMute) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 800 + Math.random() * 400;
      const g = ctx.createGain();
      g.gain.value = 0.06;
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  }, [getAudioCtx]);

  const playChime = useCallback(() => {
    if (!prefs.soundEffects || prefs.sovereignMute) return;
    try {
      const ctx = getAudioCtx();
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = 0;
        g.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
        g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + i * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.5);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.5);
      });
    } catch(e) {}
  }, [getAudioCtx]);

  const playCelebration = useCallback(() => {
    if (!prefs.soundEffects || prefs.sovereignMute) return;
    try {
      const ctx = getAudioCtx();
      // Rising arpeggio chime
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = 0;
        const t = ctx.currentTime + i * 0.12;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.07, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.8);
      });
      // Low resonant gong
      const gong = ctx.createOscillator();
      gong.type = 'sine';
      gong.frequency.value = 130.81;
      const gg = ctx.createGain();
      gg.gain.value = 0;
      gg.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.1);
      gg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
      gong.connect(gg);
      gg.connect(ctx.destination);
      gong.start();
      gong.stop(ctx.currentTime + 2);
    } catch(e) {}
  }, [getAudioCtx]);

  // ━━━ CONVOLUTION REVERB ENGINE ━━━
  // Generates synthetic impulse response for physical-space simulation
  const convolverRef = useRef(null);
  const reverbGainRef = useRef(null);

  const getConvolver = useCallback(() => {
    const ctx = getAudioCtx();
    if (!ctx) return null;
    if (convolverRef.current) return convolverRef.current;

    const audioTierKey = prefs.audioTier || 'standard';
    const tierConfig = AUDIO_TIERS[audioTierKey];
    const decay = tierConfig.reverbDecay;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * decay;
    const impulse = ctx.createBuffer(2, length, sampleRate);

    // Generate temple-like impulse response with early reflections
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        // Exponential decay envelope
        const envelope = Math.exp(-3.0 * t / decay);
        // Early reflections (sharp transients in first 50ms)
        const earlyReflection = t < 0.05 ? Math.exp(-t * 40) * 0.6 : 0;
        // Diffuse tail (filtered noise)
        const noise = (Math.random() * 2 - 1) * envelope;
        // Add subtle modal resonances (temple acoustics)
        const mode1 = Math.sin(2 * Math.PI * 62 * t) * envelope * 0.02;
        const mode2 = Math.sin(2 * Math.PI * 125 * t) * envelope * 0.01;
        data[i] = noise * 0.5 + earlyReflection * (Math.random() * 2 - 1) + mode1 + mode2;
      }
    }

    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    convolverRef.current = convolver;

    // Reverb send gain
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = tierConfig.reverbMix;
    reverbGainRef.current = reverbGain;

    convolver.connect(reverbGain);
    reverbGain.connect(ctx.destination);

    return convolver;
  }, [getAudioCtx, prefs.audioTier]);

  // ━━━ CONFIRMATION CHIME (universal node interaction feedback) ━━━
  const playConfirmation = useCallback((frequency = 880, intensity = 'medium') => {
    if (!prefs.soundEffects || prefs.sovereignMute) return;
    try {
      const ctx = getAudioCtx();
      const convolver = getConvolver();
      const audioTierKey = prefs.audioTier || 'standard';

      // Primary tone
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      const g = ctx.createGain();
      const vol = intensity === 'high' ? 0.08 : intensity === 'medium' ? 0.05 : 0.03;
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(g);
      g.connect(ctx.destination);

      // Route through convolution reverb if available (Artisan+ tier)
      if (convolver && (audioTierKey === 'artisan' || audioTierKey === 'sovereign')) {
        const sendGain = ctx.createGain();
        sendGain.gain.value = 0.3;
        osc.connect(sendGain);
        sendGain.connect(convolver);
      }

      // Harmonic overtone (multi-sampled synthesis simulation)
      if (audioTierKey !== 'standard') {
        const harm = ctx.createOscillator();
        harm.type = 'sine';
        harm.frequency.value = frequency * 2;
        const hg = ctx.createGain();
        hg.gain.setValueAtTime(vol * 0.3, ctx.currentTime);
        hg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        harm.connect(hg);
        hg.connect(ctx.destination);
        harm.start();
        harm.stop(ctx.currentTime + 0.2);
      }

      // Sub-harmonic resonance (Sovereign tier — sympathetic resonance)
      if (audioTierKey === 'sovereign') {
        const sub = ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.value = frequency * 0.5;
        const sg = ctx.createGain();
        sg.gain.setValueAtTime(vol * 0.15, ctx.currentTime + 0.05);
        sg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        sub.connect(sg);
        sg.connect(ctx.destination);
        if (convolver) {
          const subSend = ctx.createGain();
          subSend.gain.value = 0.2;
          sub.connect(subSend);
          subSend.connect(convolver);
        }
        sub.start(ctx.currentTime + 0.05);
        sub.stop(ctx.currentTime + 0.5);
      }

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  }, [getAudioCtx, getConvolver, prefs.soundEffects, prefs.sovereignMute, prefs.audioTier]);

  // ━━━ SINGING BOWL (multi-sampled synthesis for Artisan+) ━━━
  const playSingingBowl = useCallback((frequency = 396) => {
    if (!prefs.soundEffects || prefs.sovereignMute) return;
    try {
      const ctx = getAudioCtx();
      const convolver = getConvolver();
      const audioTierKey = prefs.audioTier || 'standard';
      const duration = audioTierKey === 'sovereign' ? 6 : audioTierKey === 'artisan' ? 4 : 2;

      // Fundamental
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(g);
      g.connect(ctx.destination);

      // Partials (singing bowl has inharmonic overtones)
      const partials = [2.71, 4.16, 5.43];
      partials.forEach((ratio, i) => {
        const p = ctx.createOscillator();
        p.type = 'sine';
        p.frequency.value = frequency * ratio;
        const pg = ctx.createGain();
        pg.gain.setValueAtTime(0.02 / (i + 1), ctx.currentTime);
        pg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.7);
        p.connect(pg);
        pg.connect(ctx.destination);
        if (convolver) {
          const ps = ctx.createGain();
          ps.gain.value = 0.15;
          p.connect(ps);
          ps.connect(convolver);
        }
        p.start();
        p.stop(ctx.currentTime + duration);
      });

      // Beating effect (slight detuning for realism)
      const beat = ctx.createOscillator();
      beat.type = 'sine';
      beat.frequency.value = frequency + 1.5;
      const bg = ctx.createGain();
      bg.gain.setValueAtTime(0.02, ctx.currentTime);
      bg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      beat.connect(bg);
      bg.connect(ctx.destination);
      beat.start();
      beat.stop(ctx.currentTime + duration);

      // Route fundamental through reverb
      if (convolver) {
        const sendG = ctx.createGain();
        sendG.gain.value = 0.4;
        osc.connect(sendG);
        sendG.connect(convolver);
      }

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch(e) {}
  }, [getAudioCtx, getConvolver, prefs.soundEffects, prefs.sovereignMute, prefs.audioTier]);

  // ━━━ SET AUDIO TIER FROM MASTERY ━━━
  const setAudioTierFromMastery = useCallback((masteryTier) => {
    const audioTier = MASTERY_TO_AUDIO[masteryTier] || 'standard';
    updatePref('audioTier', audioTier);
    // Reset convolver when tier changes
    convolverRef.current = null;
    reverbGainRef.current = null;
  }, [updatePref]);

  const toggleAmbient = useCallback(() => {
    setAmbientOn(prev => {
      if (!prev) { startAmbient(); } else { stopAmbient(); }
      return !prev;
    });
  }, [startAmbient, stopAmbient]);

  useEffect(() => {
    if (ambientOn && gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, [volume, ambientOn]);

  useEffect(() => {
    return () => {
      nodesRef.current.forEach(n => { try { n.stop(); } catch(e) {} });
      if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch(e) {} }
    };
  }, []);

  // Immersion level computed flags
  const immersion = prefs.immersionLevel || 'full';
  const showParticles = immersion !== 'calm' && !prefs.reduceParticles;
  const showAnimations = immersion !== 'calm' && !prefs.reduceMotion;
  const showFlashing = immersion === 'full' && !prefs.reduceFlashing;
  const showVisualEffects = immersion !== 'calm';
  const showVisionMode = immersion === 'full';
  const showFractals = immersion === 'full' && !prefs.reduceParticles;
  const animationSpeed = immersion === 'calm' ? 0 : immersion === 'standard' ? 0.5 : 1;
  // V1.0.8 — Auto-visuals computed flag. Both checks must be true:
  //   1) prefs.autoVisuals must NOT be explicitly disabled
  //   2) immersionLevel must NOT be 'calm' (calm = no surprise media)
  // Components reading this gate every auto-image fetch on it so the
  // user is never surprised by a generated image they didn't request.
  const autoVisualsEnabled = prefs.autoVisuals !== false && immersion !== 'calm';
  // V1.0.11 — Sage Voice computed mode. Calm immersion forces OFF so
  // a calm session never hears surprise audio.
  const sageVoiceMode = immersion === 'calm' ? 'off' : (prefs.sageVoiceMode || 'off');

  // Memoize context value to prevent infinite re-renders
  const contextValue = useMemo(() => ({
    ambientOn, volume, setVolume, toggleAmbient, playClick, playChime, playCelebration,
    playConfirmation, playSingingBowl, setAudioTierFromMastery,
    audioTierConfig: AUDIO_TIERS[prefs.audioTier || 'standard'],
    prefs, updatePref, themes: THEMES,
    immersion, showParticles, showAnimations, showFlashing, showVisualEffects,
    showVisionMode, showFractals, animationSpeed, autoVisualsEnabled, sageVoiceMode,
    // Global Audio Engine
    isMuted, sovereignMuteToggle, sovereignKillAll,
    audioSources, registerAudioSource, unregisterAudioSource,
    registerAudioContext, unregisterAudioContext,
  }), [
    ambientOn, volume, setVolume, toggleAmbient, playClick, playChime, playCelebration,
    playConfirmation, playSingingBowl, setAudioTierFromMastery, prefs, updatePref,
    immersion, showParticles, showAnimations, showFlashing, showVisualEffects,
    showVisionMode, showFractals, animationSpeed, autoVisualsEnabled, sageVoiceMode, isMuted, sovereignMuteToggle,
    sovereignKillAll, audioSources, registerAudioSource, unregisterAudioSource,
    registerAudioContext, unregisterAudioContext
  ]);

  return (
    <SensoryContext.Provider value={contextValue}>
      {children}
    </SensoryContext.Provider>
  );
}

export function useSensory() {
  const ctx = useContext(SensoryContext);
  if (!ctx) throw new Error('useSensory must be inside SensoryProvider');
  return ctx;
}
