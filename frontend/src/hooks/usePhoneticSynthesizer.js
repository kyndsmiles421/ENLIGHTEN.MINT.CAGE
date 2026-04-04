/**
 * usePhoneticSynthesizer.js — Web Audio API Generative Phonetic Engine
 * 
 * PHASE 3: Lightweight, procedural audio synthesis
 * 
 * Instead of pre-loading samples, we generate "phonetic textures" in real-time:
 * - Granular noise for Lakota stops / Sanskrit resonance
 * - Sine-wave glides for Mandarin tones
 * - Square waves for Japanese precision
 * 
 * Each language category has a unique synthesis profile that creates
 * the "feel" of that language without actual speech samples.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { PHONETIC_PROFILES, LANGUAGE_REGISTRY } from '../config/languageRegistry';
import { HEXAGRAM_REGISTRY, getHexagramForLanguage } from '../config/hexagramRegistry';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUDIO CONTEXT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let sharedAudioContext = null;

function getAudioContext() {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return sharedAudioContext;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRANULAR NOISE GENERATOR (For Ancient Languages)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function createGranularNoise(ctx, profile, duration = 0.1) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  const grainDensity = profile.grainDensity || 0.5;
  const resonantPeaks = profile.resonantPeaks || [];
  
  // Generate base noise with grain density
  for (let i = 0; i < bufferSize; i++) {
    if (Math.random() < grainDensity) {
      // Generate grain
      const grainLength = Math.floor(Math.random() * 50) + 10;
      const grainFreq = resonantPeaks.length > 0 
        ? resonantPeaks[Math.floor(Math.random() * resonantPeaks.length)]
        : profile.baseFrequency;
      
      for (let j = 0; j < grainLength && i + j < bufferSize; j++) {
        const t = j / ctx.sampleRate;
        const envelope = Math.sin(Math.PI * j / grainLength); // Hanning window
        data[i + j] += envelope * Math.sin(2 * Math.PI * grainFreq * t) * 0.3;
      }
      i += grainLength;
    } else {
      data[i] = (Math.random() * 2 - 1) * 0.05; // Light background noise
    }
  }
  
  return buffer;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TONAL GLIDE GENERATOR (For Mandarin/Cantonese)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function createTonalGlide(ctx, profile, duration = 0.15) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  const baseFreq = profile.baseFrequency;
  const peaks = profile.resonantPeaks || [baseFreq * 0.5, baseFreq, baseFreq * 1.5];
  
  // Create frequency glide
  const startFreq = peaks[Math.floor(Math.random() * peaks.length)];
  const endFreq = peaks[Math.floor(Math.random() * peaks.length)];
  
  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate;
    const progress = i / bufferSize;
    
    // Linear frequency interpolation (creates glide)
    const freq = startFreq + (endFreq - startFreq) * progress;
    
    // ADSR envelope
    let envelope;
    if (progress < 0.1) {
      envelope = progress / 0.1; // Attack
    } else if (progress < 0.3) {
      envelope = 1; // Sustain
    } else {
      envelope = 1 - (progress - 0.3) / 0.7; // Release
    }
    
    // Sawtooth wave for richness
    const phase = (freq * t) % 1;
    const saw = 2 * phase - 1;
    
    data[i] = saw * envelope * 0.25;
  }
  
  return buffer;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRECISE STACCATO GENERATOR (For Japanese)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function createPreciseStaccato(ctx, profile, duration = 0.08) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  const freq = profile.baseFrequency;
  const attack = profile.attackTime * ctx.sampleRate;
  const release = profile.releaseTime * ctx.sampleRate;
  
  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate;
    
    // Square wave for digital precision
    const phase = (freq * t) % 1;
    const square = phase < 0.5 ? 1 : -1;
    
    // Sharp ADSR
    let envelope;
    if (i < attack) {
      envelope = i / attack;
    } else if (i < bufferSize - release) {
      envelope = 1;
    } else {
      envelope = (bufferSize - i) / release;
    }
    
    data[i] = square * envelope * 0.2;
  }
  
  return buffer;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BALANCED SINE GENERATOR (For Modern Languages)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function createBalancedSine(ctx, profile, duration = 0.12) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  const freq = profile.baseFrequency;
  
  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate;
    const progress = i / bufferSize;
    
    // Smooth envelope
    const envelope = Math.sin(Math.PI * progress);
    
    // Pure sine
    data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
  }
  
  return buffer;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SOURCE STATE RESONANT HUM (For Hexagram 63)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function createResonantHum(ctx, duration = 2.0) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  // Om frequency: 136.1 Hz
  const omFreq = 136.1;
  const harmonics = [1, 2, 3, 4]; // Fundamental + overtones
  const harmonicAmps = [1, 0.5, 0.25, 0.125];
  
  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate;
    const progress = i / bufferSize;
    
    // Slow fade in, sustain, slow fade out
    let envelope;
    if (progress < 0.2) {
      envelope = progress / 0.2;
    } else if (progress > 0.8) {
      envelope = (1 - progress) / 0.2;
    } else {
      envelope = 1;
    }
    
    // Sum harmonics
    let sample = 0;
    harmonics.forEach((h, idx) => {
      sample += Math.sin(2 * Math.PI * omFreq * h * t) * harmonicAmps[idx];
    });
    
    data[i] = sample * envelope * 0.15;
  }
  
  return buffer;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function usePhoneticSynthesizer(options = {}) {
  const { enabled = true, masterVolume = 0.15 } = options;
  
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLang, setCurrentLang] = useState(null);
  
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const activeSourcesRef = useRef([]);
  const resonantHumRef = useRef(null);
  
  // Initialize audio context
  useEffect(() => {
    if (!enabled) return;
    
    try {
      ctxRef.current = getAudioContext();
      
      // Create master gain
      gainRef.current = ctxRef.current.createGain();
      gainRef.current.gain.value = masterVolume;
      gainRef.current.connect(ctxRef.current.destination);
      
      setIsReady(true);
      
      // Register with global audio registry
      if (!window.__cosmicAudioContexts) {
        window.__cosmicAudioContexts = [];
      }
      window.__cosmicAudioContexts.push(ctxRef.current);
      
    } catch (err) {
      console.warn('PhoneticSynthesizer: Audio context unavailable', err);
      setIsReady(false);
    }
    
    return () => {
      stopAll();
    };
  }, [enabled, masterVolume]);
  
  // Generate buffer based on language profile
  const generateBuffer = useCallback((langCode) => {
    if (!ctxRef.current) return null;
    
    const lang = LANGUAGE_REGISTRY[langCode];
    if (!lang) return null;
    
    const profile = PHONETIC_PROFILES[lang.phonetic] || PHONETIC_PROFILES.english;
    const ctx = ctxRef.current;
    
    switch (profile.character) {
      case 'guttural_stops':
      case 'flowing_vowels':
      case 'resonant_chant':
        return createGranularNoise(ctx, profile);
        
      case 'tonal_glide':
      case 'tonal_complex':
        return createTonalGlide(ctx, profile);
        
      case 'precise_staccato':
        return createPreciseStaccato(ctx, profile);
        
      case 'nasal_resonance':
      case 'rhythmic_flow':
      case 'balanced':
      default:
        return createBalancedSine(ctx, profile);
    }
  }, []);
  
  // Play a phonetic burst for a language
  const playPhoneticBurst = useCallback((langCode) => {
    if (!isReady || !ctxRef.current || !gainRef.current) return;
    
    const ctx = ctxRef.current;
    
    // Resume context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const buffer = generateBuffer(langCode);
    if (!buffer) return;
    
    // Create source
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainRef.current);
    source.start();
    
    setIsPlaying(true);
    setCurrentLang(langCode);
    
    // Track active source
    activeSourcesRef.current.push(source);
    
    // Cleanup when done
    source.onended = () => {
      const idx = activeSourcesRef.current.indexOf(source);
      if (idx > -1) {
        activeSourcesRef.current.splice(idx, 1);
      }
      if (activeSourcesRef.current.length === 0) {
        setIsPlaying(false);
      }
    };
  }, [isReady, generateBuffer]);
  
  // Play the Source State resonant hum (Hexagram 63)
  const playResonantHum = useCallback(() => {
    if (!isReady || !ctxRef.current || !gainRef.current) return;
    
    const ctx = ctxRef.current;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // Stop any existing hum
    if (resonantHumRef.current) {
      try {
        resonantHumRef.current.stop();
      } catch (e) {}
    }
    
    const buffer = createResonantHum(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true; // Continuous hum
    source.connect(gainRef.current);
    source.start();
    
    resonantHumRef.current = source;
    setIsPlaying(true);
    setCurrentLang('source');
    
  }, [isReady]);
  
  // Stop the resonant hum
  const stopResonantHum = useCallback(() => {
    if (resonantHumRef.current) {
      try {
        resonantHumRef.current.stop();
      } catch (e) {}
      resonantHumRef.current = null;
    }
  }, []);
  
  // Stop all audio
  const stopAll = useCallback(() => {
    // Stop all active sources
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    
    // Stop resonant hum
    stopResonantHum();
    
    setIsPlaying(false);
    setCurrentLang(null);
  }, [stopResonantHum]);
  
  // Set master volume
  const setVolume = useCallback((vol) => {
    if (gainRef.current) {
      gainRef.current.gain.setValueAtTime(vol, ctxRef.current?.currentTime || 0);
    }
  }, []);
  
  // Play hexagram signature (based on frequency)
  const playHexagramSignature = useCallback((hexNumber) => {
    if (!isReady || !ctxRef.current || !gainRef.current) return;
    
    const hex = HEXAGRAM_REGISTRY[hexNumber];
    if (!hex) return;
    
    const ctx = ctxRef.current;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // Create oscillator at hexagram's frequency
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = hex.baseFrequency;
    
    oscGain.gain.setValueAtTime(0, ctx.currentTime);
    oscGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    oscGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    
    osc.connect(oscGain);
    oscGain.connect(gainRef.current);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    
  }, [isReady]);
  
  return {
    isReady,
    isPlaying,
    currentLang,
    
    // Main actions
    playPhoneticBurst,
    playResonantHum,
    stopResonantHum,
    playHexagramSignature,
    stopAll,
    
    // Volume control
    setVolume,
    
    // Audio context access
    getContext: () => ctxRef.current,
  };
}

export default usePhoneticSynthesizer;
