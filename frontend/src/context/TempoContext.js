import React, { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';

const TempoContext = createContext(null);

const TEMPO_PRESETS = [
  { id: 'deep-sleep', label: 'Deep Sleep', bpm: 40, color: '#312E81', desc: 'Delta wave rhythm' },
  { id: 'resting', label: 'Resting Heart', bpm: 60, color: '#3B82F6', desc: 'Calm heartbeat pace' },
  { id: 'breathing', label: 'Breathing', bpm: 72, color: '#2DD4BF', desc: '4-count breath cycle' },
  { id: 'walking', label: 'Walking Meditation', bpm: 80, color: '#22C55E', desc: 'Gentle walking pace' },
  { id: 'active', label: 'Active Flow', bpm: 100, color: '#F59E0B', desc: 'Energized movement' },
  { id: 'ecstatic', label: 'Ecstatic Dance', bpm: 120, color: '#EF4444', desc: 'Full-body activation' },
  { id: 'trance', label: 'Shamanic Trance', bpm: 140, color: '#C084FC', desc: 'Deep trance drumming' },
];

export function TempoProvider({ children }) {
  const [bpm, setBpm] = useState(0); // 0 = off
  const [activePreset, setActivePreset] = useState(null);
  const [tapTimes, setTapTimes] = useState([]);
  const [beatPulse, setBeatPulse] = useState(false);

  // Audio context refs for tempo LFO
  const tempoLfoRef = useRef(null);
  const tempoGainRef = useRef(null);
  const beatIntervalRef = useRef(null);

  // Connect to an external AudioContext's gain nodes
  const connectToGains = useCallback((audioCtx, gainNodes) => {
    if (bpm <= 0 || !audioCtx) return () => {};

    const lfoFreq = bpm / 60; // BPM -> Hz
    const depth = 0.15; // 15% volume modulation depth

    const connectedLfos = [];
    gainNodes.forEach(gainNode => {
      if (!gainNode) return;
      const lfo = audioCtx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = lfoFreq;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = depth;
      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);
      lfo.start();
      connectedLfos.push({ lfo, lfoGain });
    });

    return () => {
      connectedLfos.forEach(({ lfo, lfoGain }) => {
        try { lfo.stop(); lfo.disconnect(); lfoGain.disconnect(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      });
    };
  }, [bpm]);

  // Haptic pulse synced to BPM
  const hapticIntervalRef = useRef(null);

  useEffect(() => {
    if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);
    if (bpm <= 0) return;

    let Hap;
    try { Hap = require('@capacitor/haptics').Haptics; } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    const doHaptic = () => {
      try { Hap?.impact({ style: 'Light' }); } catch { navigator.vibrate?.([8]); }
    };

    const interval = 60000 / bpm;
    // Double-pulse heartbeat pattern: thump-thump-(pause)
    hapticIntervalRef.current = setInterval(() => {
      doHaptic();
      setTimeout(doHaptic, Math.min(120, interval * 0.18));
    }, interval);

    return () => { if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current); };
  }, [bpm]);

  // Visual beat pulse
  useEffect(() => {
    if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
    if (bpm <= 0) { setBeatPulse(false); return; }

    const interval = 60000 / bpm;
    beatIntervalRef.current = setInterval(() => {
      setBeatPulse(true);
      setTimeout(() => setBeatPulse(false), Math.min(100, interval * 0.3));
    }, interval);

    return () => { if (beatIntervalRef.current) clearInterval(beatIntervalRef.current); };
  }, [bpm]);

  const setTempoFromPreset = useCallback((preset) => {
    if (activePreset?.id === preset.id) {
      setActivePreset(null);
      setBpm(0);
    } else {
      setActivePreset(preset);
      setBpm(preset.bpm);
    }
  }, [activePreset]);

  const tapTempo = useCallback(() => {
    const now = Date.now();
    setTapTimes(prev => {
      const recent = [...prev, now].filter(t => now - t < 4000); // Keep last 4 seconds
      if (recent.length >= 2) {
        const intervals = [];
        for (let i = 1; i < recent.length; i++) {
          intervals.push(recent[i] - recent[i - 1]);
        }
        const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const detected = Math.round(60000 / avgMs);
        const clamped = Math.max(30, Math.min(200, detected));
        setBpm(clamped);
        setActivePreset(null); // Custom tempo via tap
      }
      return recent;
    });
  }, []);

  const setTempoBpm = useCallback((val) => {
    setBpm(val);
    setActivePreset(null);
  }, []);

  const stopTempo = useCallback(() => {
    setBpm(0);
    setActivePreset(null);
    setTapTimes([]);
  }, []);

  const contextValue = useMemo(() => ({
    bpm, setBpm: setTempoBpm, activePreset, setTempoFromPreset,
    tapTempo, stopTempo, beatPulse, connectToGains,
    TEMPO_PRESETS,
  }), [bpm, setTempoBpm, activePreset, setTempoFromPreset, tapTempo, stopTempo, beatPulse, connectToGains]);

  return (
    <TempoContext.Provider value={contextValue}>
      {children}
    </TempoContext.Provider>
  );
}

export function useTempo() {
  const ctx = useContext(TempoContext);
  if (!ctx) return { bpm: 0, setBpm: () => {}, TEMPO_PRESETS: [], beatPulse: false, tapTempo: () => {}, stopTempo: () => {}, connectToGains: () => () => {} };
  return ctx;
}
