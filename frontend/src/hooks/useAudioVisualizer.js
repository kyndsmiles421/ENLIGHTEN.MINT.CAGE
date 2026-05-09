/**
 * useAudioVisualizer.js — Audio-Visual Bridge Hook
 * 
 * Taps into MixerContext's existing AnalyserNode to extract real-time
 * audio data and map it to visual parameters for the ParticleField.
 * 
 * Three visualization channels:
 *   1. Amplitude-to-Scale: Peak amplitude → particle bloom intensity
 *   2. Frequency-to-Hue: Dominant frequency bin → spectral hue shift
 *   3. Transient Detection: Sharp amplitude spikes → radial burst trigger
 * 
 * Frequency-to-Hue mapping (Solfeggio):
 *   174 Hz → stone gray     285 Hz → amber
 *   396 Hz → red             417 Hz → orange
 *   432 Hz → emerald         528 Hz → green (Miracle tone)
 *   639 Hz → blue            741 Hz → violet
 *   852 Hz → lavender        963 Hz → magenta
 * 
 * Usage:
 *   const audio = useAudioVisualizer();
 *   <ParticleField audioData={audio} />
 */
import { useRef, useState, useEffect, useCallback } from 'react';

const PHI = 1.618033988749895;

// Solfeggio frequency → hue mapping
const FREQ_HUE_MAP = [
  { hz: 174, hue: 30,  label: 'Foundation' },
  { hz: 285, hue: 35,  label: 'Resonance' },
  { hz: 396, hue: 0,   label: 'Liberation' },
  { hz: 417, hue: 25,  label: 'Change' },
  { hz: 432, hue: 150, label: 'Harmony' },
  { hz: 528, hue: 130, label: 'Love' },
  { hz: 639, hue: 220, label: 'Connection' },
  { hz: 741, hue: 270, label: 'Intuition' },
  { hz: 852, hue: 290, label: 'Awakening' },
  { hz: 963, hue: 310, label: 'Divine' },
];

/**
 * Map a frequency (Hz) to a hue value (0-360).
 * Interpolates between Solfeggio landmarks.
 */
function frequencyToHue(hz) {
  if (hz <= 0) return 160; // default teal
  for (let i = 0; i < FREQ_HUE_MAP.length - 1; i++) {
    const a = FREQ_HUE_MAP[i];
    const b = FREQ_HUE_MAP[i + 1];
    if (hz >= a.hz && hz <= b.hz) {
      const t = (hz - a.hz) / (b.hz - a.hz);
      return a.hue + t * (b.hue - a.hue);
    }
  }
  if (hz < FREQ_HUE_MAP[0].hz) return FREQ_HUE_MAP[0].hue;
  return FREQ_HUE_MAP[FREQ_HUE_MAP.length - 1].hue;
}

/**
 * Find the dominant frequency from FFT data.
 * @param {Uint8Array} freqData - frequency domain data from AnalyserNode
 * @param {number} sampleRate - AudioContext sample rate
 * @param {number} fftSize - AnalyserNode fftSize
 */
function findDominantFrequency(freqData, sampleRate, fftSize) {
  let maxVal = 0;
  let maxIdx = 0;
  // Skip DC offset (bin 0) and very high frequencies
  const usableBins = Math.min(freqData.length, Math.floor(freqData.length * 0.75));
  for (let i = 1; i < usableBins; i++) {
    if (freqData[i] > maxVal) {
      maxVal = freqData[i];
      maxIdx = i;
    }
  }
  if (maxVal < 10) return 0; // noise floor
  return (maxIdx * sampleRate) / fftSize;
}

/**
 * Hook: useAudioVisualizer
 * @param {Object} analyserRef - ref to AnalyserNode (from MixerContext)
 * @param {Object} ctxRef - ref to AudioContext (from MixerContext)
 * @param {Object} options - { enabled, smoothing }
 */
export function useAudioVisualizer(analyserRef, ctxRef, { enabled = true, smoothing = 0.85 } = {}) {
  const rafRef = useRef(null);
  const prevAmplitudeRef = useRef(0);
  const transientCooldownRef = useRef(0);
  const freqDataRef = useRef(null);
  const timeDataRef = useRef(null);

  const [audioData, setAudioData] = useState({
    amplitude: 0,        // 0-1 normalized peak amplitude
    rms: 0,              // 0-1 RMS energy (smoother than peak)
    dominantHz: 0,       // dominant frequency in Hz
    hueShift: 160,       // mapped hue from dominant frequency
    bloomIntensity: 0,   // 0-1 bloom factor (amplitude * frequency weight)
    isTransient: false,   // true for ~120ms after a sharp attack
    spectralCentroid: 0, // weighted average frequency (brightness indicator)
    isActive: false,     // whether any audio is actually playing
  });

  const analyze = useCallback(() => {
    const analyser = analyserRef?.current;
    const ctx = ctxRef?.current;
    if (!analyser || !ctx || ctx.state !== 'running') {
      setAudioData(prev => prev.isActive ? { ...prev, isActive: false, amplitude: 0, rms: 0, isTransient: false } : prev);
      rafRef.current = requestAnimationFrame(analyze);
      return;
    }

    const bufLen = analyser.frequencyBinCount;
    if (!freqDataRef.current || freqDataRef.current.length !== bufLen) {
      freqDataRef.current = new Uint8Array(bufLen);
      timeDataRef.current = new Uint8Array(bufLen);
    }

    analyser.getByteFrequencyData(freqDataRef.current);
    analyser.getByteTimeDomainData(timeDataRef.current);

    const freqData = freqDataRef.current;
    const timeData = timeDataRef.current;

    // ── Amplitude (peak) ──
    let peak = 0;
    for (let i = 0; i < timeData.length; i++) {
      const v = Math.abs(timeData[i] - 128) / 128;
      if (v > peak) peak = v;
    }
    // Smooth with exponential decay
    const smoothedPeak = peak * (1 - smoothing) + prevAmplitudeRef.current * smoothing;
    prevAmplitudeRef.current = smoothedPeak;

    // ── RMS (average energy) ──
    let sumSq = 0;
    for (let i = 0; i < timeData.length; i++) {
      const v = (timeData[i] - 128) / 128;
      sumSq += v * v;
    }
    const rms = Math.sqrt(sumSq / timeData.length);

    // ── Dominant Frequency ──
    const domHz = findDominantFrequency(freqData, ctx.sampleRate, analyser.fftSize);
    const hue = frequencyToHue(domHz);

    // ── Spectral Centroid (brightness) ──
    let weightedSum = 0;
    let totalEnergy = 0;
    for (let i = 0; i < freqData.length; i++) {
      const freq = (i * ctx.sampleRate) / analyser.fftSize;
      weightedSum += freq * freqData[i];
      totalEnergy += freqData[i];
    }
    const centroid = totalEnergy > 0 ? weightedSum / totalEnergy : 0;

    // ── Transient Detection ──
    // A transient is a sharp amplitude increase (attack)
    const transientThreshold = 0.15;
    const ampDelta = peak - prevAmplitudeRef.current;
    let isTransient = false;
    if (transientCooldownRef.current > 0) {
      transientCooldownRef.current--;
    } else if (ampDelta > transientThreshold && peak > 0.1) {
      isTransient = true;
      transientCooldownRef.current = 8; // ~8 frames cooldown (~133ms at 60fps)
    }

    // ── Bloom Intensity ──
    // Combines amplitude with spectral richness (more harmonics = more bloom)
    const spectralRichness = totalEnergy > 0 ? Math.min(1, totalEnergy / (freqData.length * 80)) : 0;
    const bloom = smoothedPeak * (0.6 + spectralRichness * 0.4);

    const isActive = peak > 0.005 || rms > 0.002;

    setAudioData({
      amplitude: smoothedPeak,
      rms,
      dominantHz: domHz,
      hueShift: hue,
      bloomIntensity: bloom,
      isTransient,
      spectralCentroid: centroid,
      isActive,
    });

    rafRef.current = requestAnimationFrame(analyze);
  }, [analyserRef, ctxRef, smoothing]);

  useEffect(() => {
    if (!enabled) return;
    rafRef.current = requestAnimationFrame(analyze);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, analyze]);

  return audioData;
}
