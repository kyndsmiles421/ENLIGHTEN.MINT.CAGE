import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Volume2, VolumeX, Waves, Sun, BookOpen, Vibrate, Music, Radio, ChevronDown,
  Play, Pause, Square, Loader2, X, Sparkles, Sliders, ArrowRightLeft, Save, Download, Trash2, Globe, Heart,
  Wand2, Crown, Lock, Target
} from 'lucide-react';
import OrbitalMixer from '../components/OrbitalMixer';
import { useAuth } from '../context/AuthContext';
import { useTempo } from '../context/TempoContext';
import { useMixer, FREQUENCIES, SOUNDS, INSTRUMENT_DRONES, MANTRAS } from '../context/MixerContext';
import { useGatedFeature } from '../context/useGatedFeature';
import { useLanguage } from '../context/LanguageContext';
import { MantraBanner } from '../components/MantraSystem';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LIGHT_MODES = [
  { id: 'sunrise', label: 'Sunrise Glow', colors: ['#FCD34D', '#FB923C', '#EF4444'], speed: 4000 },
  { id: 'aurora', label: 'Aurora', colors: ['#22C55E', '#2DD4BF', '#3B82F6', '#8B5CF6'], speed: 3000 },
  { id: 'calm-blue', label: 'Calm Blue', colors: ['#1E3A5F', '#3B82F6', '#06B6D4'], speed: 5000 },
  { id: 'healing-green', label: 'Verdant Resonance', colors: ['#064E3B', '#22C55E', '#2DD4BF'], speed: 4500 },
  { id: 'violet-flame', label: 'Violet Flame', colors: ['#4C1D95', '#8B5CF6', '#C084FC', '#E879F9'], speed: 3500 },
  { id: 'golden', label: 'Golden Light', colors: ['#78350F', '#F59E0B', '#FCD34D'], speed: 5000 },
];

/* Voice Morph Slider */
function VoiceSlider({ label, value, min, max, color, unit, center, compact, onChange, testId }) {
  const pct = center
    ? 50 + ((value - (min + max) / 2) / ((max - min) / 2)) * 50
    : ((value - min) / (max - min)) * 100;
  return (
    <div className={compact ? '' : 'flex items-center gap-2'} data-testid={testId}>
      <span className={`text-[9px] ${compact ? 'block mb-0.5 text-center' : 'w-16 flex-shrink-0'}`} style={{ color: `${color}80` }}>{label}</span>
      <input type="range" min={min} max={max} step={max - min > 100 ? 10 : 1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
        style={{
          background: center
            ? `linear-gradient(to right, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.06) ${Math.min(pct, 50)}%, ${color} ${Math.min(pct, 50)}%, ${color} ${Math.max(pct, 50)}%, rgba(255,255,255,0.06) ${Math.max(pct, 50)}%)`
            : `linear-gradient(to right, ${color} ${pct}%, rgba(255,255,255,0.06) ${pct}%)`,
          accentColor: color,
        }} />
      <span className={`text-[9px] tabular-nums ${compact ? 'block text-center' : 'w-10 text-right'}`} style={{ color: `${color}60` }}>{value}{unit}</span>
    </div>
  );
}

/* Waveform Type Selector */
const WAVEFORMS = ['sine', 'triangle', 'sawtooth', 'square'];
const WAVE_LABELS = { sine: '~', triangle: '/\\', sawtooth: '/|', square: '[]' };

function WaveformSelector({ value, onChange, color }) {
  return (
    <div className="flex gap-0.5">
      {WAVEFORMS.map(w => (
        <button key={w} onClick={() => onChange(w)}
          className="px-1 py-0.5 rounded text-[8px] font-mono transition-all"
          style={{
            background: value === w ? `${color}18` : 'rgba(255,255,255,0.02)',
            color: value === w ? color : 'rgba(255,255,255,0.6)',
            border: `1px solid ${value === w ? `${color}30` : 'rgba(255,255,255,0.04)'}`,
          }}
          data-testid={`waveform-${w}`}
          title={w}
        >{WAVE_LABELS[w]}</button>
      ))}
    </div>
  );
}

/* Channel Strip — per-channel fader + controls inline */
function ChannelStrip({ label, volKey, vol, onVolChange, color, isActive, children }) {
  if (!isActive) return null;
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-2 py-1 px-1" data-testid={`channel-${volKey}`}>
        <input type="range" min={0} max={100} value={vol ?? 75}
          onChange={e => onVolChange(volKey, Number(e.target.value))}
          className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} ${vol ?? 75}%, rgba(255,255,255,0.06) ${vol ?? 75}%)`,
            accentColor: color,
          }}
          data-testid={`fader-${volKey}`} />
        <span className="text-[8px] w-8 text-right tabular-nums" style={{ color: `${color}60` }}>{vol ?? 75}%</span>
        {children}
      </div>
    </motion.div>
  );
}

/* Live Waveform Visualizer */
function WaveformVisualizer({ analyserRef, isActive }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!isActive || !analyserRef?.current || !canvasRef.current) return;
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx2d = canvas.getContext('2d');
    const bufLen = analyser.frequencyBinCount;
    const dataArr = new Uint8Array(bufLen);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArr);
      const w = canvas.width;
      const h = canvas.height;
      ctx2d.clearRect(0, 0, w, h);

      // Gradient background
      const grad = ctx2d.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(192,132,252,0.03)');
      grad.addColorStop(0.5, 'rgba(45,212,191,0.03)');
      grad.addColorStop(1, 'rgba(129,140,248,0.03)');
      ctx2d.fillStyle = grad;
      ctx2d.fillRect(0, 0, w, h);

      // Center line
      ctx2d.beginPath();
      ctx2d.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx2d.lineWidth = 0.5;
      ctx2d.moveTo(0, h / 2);
      ctx2d.lineTo(w, h / 2);
      ctx2d.stroke();

      // Waveform
      ctx2d.beginPath();
      const gd = ctx2d.createLinearGradient(0, 0, w, 0);
      gd.addColorStop(0, '#C084FC');
      gd.addColorStop(0.4, '#2DD4BF');
      gd.addColorStop(0.7, '#818CF8');
      gd.addColorStop(1, '#E879F9');
      ctx2d.strokeStyle = gd;
      ctx2d.lineWidth = 1.5;
      ctx2d.shadowColor = '#C084FC';
      ctx2d.shadowBlur = 4;

      const sliceW = w / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = dataArr[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
        x += sliceW;
      }
      ctx2d.stroke();
      ctx2d.shadowBlur = 0;
    };
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isActive, analyserRef]);

  return (
    <div className="rounded-xl overflow-hidden" data-testid="waveform-visualizer"
      style={{ background: 'rgba(10,10,20,0.3)', border: '1px solid rgba(255,255,255,0.04)', height: 48 }}>
      <canvas ref={canvasRef} width={600} height={48} className="w-full h-full" />
    </div>
  );
}

export default function CosmicMixerPage() {
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  const { bpm, setBpm, activePreset, setTempoFromPreset, tapTempo, stopTempo, beatPulse, connectToGains, TEMPO_PRESETS } = useTempo();
  const { t } = useLanguage();

  // ─── Global audio state from MixerContext ───
  const {
    masterVol, setMasterVol, muted, setMuted,
    activeFreqs, activeSounds, activeDrones, activeMantra,
    channelVols, setChannelVols, setChannelVolume,
    voiceMorph, setVoiceMorph, mantraLoading,
    getCtx, toggleFreq: ctxToggleFreq, toggleSound: ctxToggleSound,
    toggleDrone: ctxToggleDrone, toggleMantra: ctxToggleMantra,
    stopAll: ctxStopAll, getSnapshot, restoreSnapshot,
    analyserRef, masterGainRef, ctxRef,
    freqNodesMapRef, freqGainMapRef,
    soundNodesMapRef, soundGainMapRef, soundFilterMapRef,
    droneNodesMapRef, droneGainMapRef, droneFilterMapRef,
    mantraAudioRef, mantraSourceRef, voiceChainRef,
  } = useMixer();

  // ─── Page-local state ───
  const [founderFreq, setFounderFreq] = useState(null);
  const [seasonalFreqs, setSeasonalFreqs] = useState([]);

  useEffect(() => {
    if (authHeaders?.Authorization) {
      axios.get(`${API}/starseed/realm/founder-status`, { headers: authHeaders })
        .then(r => { if (r.data.is_founder && r.data.exclusive_frequency) setFounderFreq(r.data.exclusive_frequency); })
        .catch(() => {});
      axios.get(`${API}/seasonal/active`, { headers: authHeaders })
        .then(r => {
          const unlocked = [];
          for (const f of (r.data.active || [])) {
            if (f.available) unlocked.push({ hz: f.hz, label: f.name, desc: f.desc, color: f.color, isSeasonal: true, seasonId: f.id, collected: f.collected, lore: f.lore, icon: f.icon });
          }
          for (const c of (r.data.collected || [])) {
            if (!unlocked.find(u => u.seasonId === c.frequency_id)) {
              unlocked.push({ hz: c.hz, label: c.frequency_name, desc: `Collected ${c.season} frequency`, color: c.color, isSeasonal: true, seasonId: c.frequency_id, collected: true });
            }
          }
          setSeasonalFreqs(unlocked);
        })
        .catch(() => {});
    }
  }, [authHeaders]);

  const collectSeasonal = async (seasonId) => {
    try {
      const res = await axios.post(`${API}/seasonal/collect`, { frequency_id: seasonId }, { headers: authHeaders });
      if (res.data.status === 'collected') {
        toast('Sonic Crystal Collected!', {
          description: `${res.data.frequency.name} (${res.data.frequency.hz}Hz) is now permanently yours`,
          style: {
            background: `linear-gradient(135deg, ${res.data.frequency.color}15, rgba(0,0,0,0))`,
            border: `1px solid ${res.data.frequency.color}40`,
            color: res.data.frequency.color,
            boxShadow: `0 0 24px ${res.data.frequency.color}15`,
          },
        });
        setSeasonalFreqs(prev => prev.map(f => f.seasonId === seasonId ? { ...f, collected: true } : f));
      }
    } catch {}
  };

  const allFrequencies = [
    ...FREQUENCIES,
    ...(founderFreq ? [{ hz: founderFreq.hz, label: founderFreq.label, desc: founderFreq.desc, color: founderFreq.color, isFounder: true }] : []),
    ...seasonalFreqs,
  ];

  const [activeLight, setActiveLight] = useState(null);
  const [vibeOn, setVibeOn] = useState(false);

  // Per-channel UI parameters (page-local)
  const [freqWaveforms, setFreqWaveforms] = useState({});
  const [soundFilters, setSoundFilters] = useState({});
  const [droneFilters, setDroneFilters] = useState({});
  const [masterFx, setMasterFx] = useState({
    reverb: 0, delay: 0, delayTime: 400, chorus: 0, compressor: true,
  });
  const vibeIntervalRef = useRef(null);
  const [showVoiceEngine, setShowVoiceEngine] = useState(false);

  // ─── Page-local wrapper functions (shadow context names for seamless JSX) ───
  const toggleFreq = useCallback(async (freq) => {
    const waveform = freqWaveforms[freq.hz] || 'sine';
    await ctxToggleFreq(freq, { waveform });
  }, [ctxToggleFreq, freqWaveforms]);

  const toggleSound = useCallback(async (sound) => {
    const filter = soundFilters[sound.id];
    await ctxToggleSound(sound, { filter });
  }, [ctxToggleSound, soundFilters]);

  const toggleDrone = useCallback(async (drone) => {
    const filter = droneFilters[drone.id];
    await ctxToggleDrone(drone, { filter });
  }, [ctxToggleDrone, droneFilters]);

  const toggleMantra = useCallback(async (mantra) => {
    await ctxToggleMantra(mantra, authHeaders);
  }, [ctxToggleMantra, authHeaders]);

  const stopAll = useCallback(() => {
    ctxStopAll();
    setActiveLight(null);
    setVibeOn(false);
    if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
    try { navigator.vibrate(0); } catch {}
  }, [ctxStopAll]);

  // Update per-channel filter in real time
  const setChannelFilter = useCallback((mapRef, stateSet, id, cutoff, resonance) => {
    stateSet(prev => ({...prev, [id]: { cutoff, resonance }}));
    const filter = mapRef.current[id];
    if (filter) {
      filter.frequency.value = cutoff;
      filter.Q.value = resonance;
    }
  }, []);

  const firstActiveFreq = activeFreqs.size > 0 ? allFrequencies.find(f => activeFreqs.has(f.hz)) : null;

  const toggleVibe = useCallback(() => {
    if (vibeOn) {
      if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
      try { navigator.vibrate(0); } catch {}
      setVibeOn(false);
    } else {
      const pattern = firstActiveFreq ? Math.max(50, Math.round(1000 / firstActiveFreq.hz * 10)) : 200;
      const pulse = () => { try { navigator.vibrate([pattern, pattern]); } catch {} };
      pulse();
      vibeIntervalRef.current = setInterval(pulse, pattern * 2 + 50);
      setVibeOn(true);
    }
  }, [vibeOn, firstActiveFreq]);

  useEffect(() => {
    if (vibeOn && firstActiveFreq) {
      if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
      const pattern = Math.max(50, Math.round(1000 / firstActiveFreq.hz * 10));
      const pulse = () => { try { navigator.vibrate([pattern, pattern]); } catch {} };
      vibeIntervalRef.current = setInterval(pulse, pattern * 2 + 50);
    }
  }, [firstActiveFreq, vibeOn]);

  const toggleLight = useCallback((mode) => {
    if (activeLight?.id === mode.id) { setActiveLight(null); return; }
    setActiveLight(mode);
  }, [activeLight]);

  // Tempo LFO: modulate master gain to the beat
  const tempoCleanupRef = useRef(null);
  useEffect(() => {
    if (tempoCleanupRef.current) { tempoCleanupRef.current(); tempoCleanupRef.current = null; }
    if (bpm > 0 && ctxRef.current && masterGainRef.current) {
      tempoCleanupRef.current = connectToGains(ctxRef.current, [masterGainRef.current]);
    }
    return () => { if (tempoCleanupRef.current) { tempoCleanupRef.current(); tempoCleanupRef.current = null; } };
  }, [bpm, connectToGains]);

  // ─── Session Mode ───
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [sessionPhaseIdx, setSessionPhaseIdx] = useState(0);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
  const [sessionPhaseTimeLeft, setSessionPhaseTimeLeft] = useState(0);
  const sessionIntervalRef = useRef(null);

  const SESSIONS = [
    { id: 'morning', label: 'Morning Awakening', duration: 900, icon: '☀', color: '#F59E0B',
      phases: [
        { dur: 180, bpm: 40, freq: [7.83], sound: ['ocean'], drone: [], mantra: null, light: 'calm-blue', desc: 'Gentle Awakening' },
        { dur: 180, bpm: 60, freq: [432], sound: ['stream'], drone: ['bowl-drone'], mantra: null, light: 'sunrise', desc: 'Rising Energy' },
        { dur: 180, bpm: 72, freq: [528], sound: ['forest'], drone: ['flute-drone'], mantra: 'om', light: 'healing-green', desc: 'Heart Opening' },
        { dur: 180, bpm: 80, freq: [639, 741], sound: ['singing-bowl'], drone: ['tanpura-drone'], mantra: 'gayatri', light: 'golden', desc: 'Full Radiance' },
        { dur: 180, bpm: 60, freq: [528], sound: ['stream'], drone: [], mantra: 'peace', light: 'sunrise', desc: 'Gentle Integration' },
      ]},
    { id: 'deep-sleep', label: 'Deep Sleep Descent', duration: 1200, icon: '🌙', color: '#6366F1',
      phases: [
        { dur: 240, bpm: 60, freq: [432], sound: ['rain'], drone: ['harmonium-drone'], mantra: 'so-hum', light: 'calm-blue', desc: 'Settling In' },
        { dur: 240, bpm: 50, freq: [174, 285], sound: ['ocean'], drone: ['cello-drone'], mantra: null, light: 'calm-blue', desc: 'Deepening' },
        { dur: 240, bpm: 40, freq: [7.83], sound: ['cave'], drone: ['tibetan-horn'], mantra: null, light: 'violet', desc: 'Delta Descent' },
        { dur: 240, bpm: 40, freq: [7.83], sound: ['night'], drone: [], mantra: null, light: null, desc: 'Deep Rest' },
        { dur: 240, bpm: 0, freq: [], sound: ['rain'], drone: [], mantra: null, light: null, desc: 'Silence' },
      ]},
    { id: 'chakra', label: 'Chakra Activation', duration: 840, icon: '🔮', color: '#C084FC',
      phases: [
        { dur: 120, bpm: 60, freq: [396], sound: ['thunder'], drone: ['didgeridoo-drone'], mantra: 'om', light: null, desc: 'Root — Grounding' },
        { dur: 120, bpm: 65, freq: [417], sound: ['ocean'], drone: ['oud-drone'], mantra: null, light: null, desc: 'Sacral — Flow' },
        { dur: 120, bpm: 70, freq: [528], sound: ['fire'], drone: ['sitar-drone'], mantra: 'ra-ma', light: 'golden', desc: 'Solar Plexus — Power' },
        { dur: 120, bpm: 72, freq: [639], sound: ['forest'], drone: ['harp-drone'], mantra: 'lokah', light: 'healing-green', desc: 'Heart — Love' },
        { dur: 120, bpm: 75, freq: [741], sound: ['wind'], drone: ['flute-drone'], mantra: 'ham-sa', light: 'calm-blue', desc: 'Throat — Expression' },
        { dur: 120, bpm: 72, freq: [852], sound: ['singing-bowl'], drone: ['bowl-drone'], mantra: 'om-mani', light: 'violet', desc: 'Third Eye — Insight' },
        { dur: 120, bpm: 60, freq: [963], sound: ['singing-bowl'], drone: ['kalimba-drone'], mantra: 'gate-gate', light: 'aurora', desc: 'Crown — Connection' },
      ]},
    { id: 'shamanic', label: 'Shamanic Journey', duration: 900, icon: '🦅', color: '#78350F',
      phases: [
        { dur: 180, bpm: 80, freq: [111], sound: ['fire'], drone: ['didgeridoo-drone'], mantra: 'hu', light: null, desc: 'Calling In' },
        { dur: 180, bpm: 120, freq: [7.83, 40], sound: ['thunder'], drone: ['didgeridoo-drone', 'tibetan-horn'], mantra: null, light: null, desc: 'Descent' },
        { dur: 180, bpm: 140, freq: [40], sound: ['wind'], drone: ['bagpipe-drone', 'didgeridoo-drone'], mantra: null, light: 'violet', desc: 'Deep Trance' },
        { dur: 180, bpm: 100, freq: [528], sound: ['forest'], drone: ['flute-drone'], mantra: 'om-tare', light: 'healing-green', desc: 'Return Journey' },
        { dur: 180, bpm: 60, freq: [432], sound: ['stream'], drone: [], mantra: 'peace', light: 'golden', desc: 'Integration' },
      ]},
    { id: 'ocean-calm', label: 'Ocean Calm', duration: 600, icon: '🌊', color: '#06B6D4',
      phases: [
        { dur: 150, bpm: 60, freq: [432], sound: ['ocean'], drone: ['hang-drum-drone'], mantra: null, light: 'calm-blue', desc: 'Arrival' },
        { dur: 150, bpm: 50, freq: [528, 639], sound: ['ocean', 'stream'], drone: ['harp-drone'], mantra: 'hooponopono', light: 'calm-blue', desc: 'Immersion' },
        { dur: 150, bpm: 40, freq: [174], sound: ['ocean', 'waterfall'], drone: [], mantra: null, light: 'calm-blue', desc: 'Deep Calm' },
        { dur: 150, bpm: 50, freq: [432], sound: ['ocean'], drone: [], mantra: 'peace', light: 'calm-blue', desc: 'Gentle Return' },
      ]},
  ];

  const startSession = useCallback((session) => {
    stopAll();
    setSessionData(session);
    setSessionPhaseIdx(0);
    setSessionTimeLeft(session.duration);
    setSessionPhaseTimeLeft(session.phases[0].dur);
    setSessionActive(true);
  }, [stopAll]);

  const stopSession = useCallback(() => {
    if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    setSessionActive(false);
    setSessionData(null);
    stopAll();
  }, [stopAll]);

  // Load phase layers
  const loadPhase = useCallback((phase) => {
    stopAll();
    setTimeout(() => {
      if (phase.bpm > 0) setBpm(phase.bpm);
      else stopTempo();
      phase.freq.forEach((hz, i) => {
        const f = allFrequencies.find(x => x.hz === hz);
        if (f) setTimeout(() => toggleFreq(f), 100 + i * 60);
      });
      (phase.sound || []).forEach((id, i) => {
        const s = SOUNDS.find(x => x.id === id);
        if (s) setTimeout(() => toggleSound(s), 200 + i * 60);
      });
      (phase.drone || []).forEach((id, i) => {
        const d = INSTRUMENT_DRONES.find(x => x.id === id);
        if (d) setTimeout(() => toggleDrone(d), 300 + i * 60);
      });
      if (phase.mantra) {
        const m = MANTRAS.find(x => x.id === phase.mantra);
        if (m) setTimeout(() => toggleMantra(m), 500);
      }
      if (phase.light) {
        const l = LIGHT_MODES.find(x => x.id === phase.light);
        if (l) setActiveLight(l);
      } else {
        setActiveLight(null);
      }
    }, 200);
  }, [stopAll, setBpm, stopTempo, toggleFreq, toggleSound, toggleDrone, toggleMantra]);

  // Session timer
  useEffect(() => {
    if (!sessionActive || !sessionData) return;
    loadPhase(sessionData.phases[0]);

    sessionIntervalRef.current = setInterval(() => {
      setSessionTimeLeft(prev => {
        if (prev <= 1) { stopSession(); return 0; }
        return prev - 1;
      });
      setSessionPhaseTimeLeft(prev => {
        if (prev <= 1) {
          setSessionPhaseIdx(idx => {
            const nextIdx = idx + 1;
            if (nextIdx >= sessionData.phases.length) { stopSession(); return idx; }
            loadPhase(sessionData.phases[nextIdx]);
            setSessionPhaseTimeLeft(sessionData.phases[nextIdx].dur);
            return nextIdx;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current); };
  }, [sessionActive, sessionData]);

  // ─── Haptic intensity ───
  const [hapticIntensity, setHapticIntensity] = useState(70);

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ─── Collapsible accordion state ───
  const [mixerMode, setMixerMode] = useState('console'); // 'console' | 'playground'
  const [openSections, setOpenSections] = useState({ freq: true, mood: false, sound: false, drone: false, mantra: false, voice: false, masterFx: false, crossfade: false, light: false, haptic: false, tempo: false, session: false, soundscapes: false, aiblend: false });
  const toggleSection = (key) => setOpenSections(p => ({ ...p, [key]: !p[key] }));

  const hasActive = activeFreqs.size > 0 || activeSounds.size > 0 || activeDrones.size > 0 || activeMantra || activeLight || vibeOn;
  const activeCount = activeFreqs.size + activeSounds.size + activeDrones.size + (activeMantra ? 1 : 0) + (activeLight ? 1 : 0) + (vibeOn ? 1 : 0);

  const [activeMoodPreset, setActiveMoodPreset] = useState(null);
  const MOOD_PRESETS = [
    { id: 'deep-sleep', label: 'Deep Sleep', desc: '174Hz + Ocean Waves', color: '#6366F1', freq: 174, sound: 'ocean', bpm: 50, light: 'calm-blue' },
    { id: 'focus-flow', label: 'Focus Flow', desc: '396Hz + Rain', color: '#22C55E', freq: 396, sound: 'rain', bpm: 72, light: 'healing-green' },
    { id: 'active-refinement', label: 'Active Refinement', desc: '417Hz + Forest', color: '#2DD4BF', freq: 417, sound: 'forest', bpm: 90, light: 'aurora' },
    { id: 'heart-opening', label: 'Heart Opening', desc: '528Hz + Singing Bowl', color: '#EC4899', freq: 528, sound: 'singing-bowl', bpm: 60, light: 'violet-flame' },
    { id: 'cosmic-download', label: 'Cosmic Download', desc: '963Hz + Night Sky', color: '#A855F7', freq: 963, sound: 'night', bpm: 40, light: 'golden' },
  ];

  const activateMoodPreset = useCallback(async (preset) => {
    if (activeMoodPreset?.id === preset.id) {
      stopAll();
      stopTempo();
      setActiveMoodPreset(null);
      return;
    }
    stopAll();
    setActiveMoodPreset(preset);

    // Activate frequency
    const freqObj = allFrequencies.find(f => f.hz === preset.freq) || { hz: preset.freq };
    await toggleFreq(freqObj);

    // Activate sound
    const soundObj = SOUNDS.find(s => s.id === preset.sound);
    if (soundObj) await toggleSound(soundObj);

    // Set BPM
    setBpm(preset.bpm);

    // Set light mode
    const lightObj = LIGHT_MODES.find(l => l.id === preset.light);
    if (lightObj) setActiveLight(lightObj);
  }, [activeMoodPreset, allFrequencies, stopAll, stopTempo, toggleFreq, toggleSound, setBpm]);

  // ─── Soundscape Save/Load ───
  const [savedSoundscapes, setSavedSoundscapes] = useState([]);
  const [communitySoundscapes, setCommunitySoundscapes] = useState([]);
  const [soundscapeName, setSoundscapeName] = useState('');
  const [soundscapeSaving, setSoundscapeSaving] = useState(false);
  const [soundscapeTab, setSoundscapeTab] = useState('mine');

  // ─── AI Blend ───
  const { checkAccess, checking: gateChecking } = useGatedFeature();
  const [aiBlend, setAiBlend] = useState(null);
  const [aiBlendLoading, setAiBlendLoading] = useState(false);

  const requestAiBlend = useCallback(async () => {
    setAiBlendLoading(true);
    try {
      const res = await axios.post(`${API}/mixer/ai-blend`, {}, { headers: authHeaders });
      const data = res.data;
      setAiBlend(data);

      // Auto-load the blend
      stopAll();
      for (const hz of (data.blend?.primary || [])) {
        const f = FREQUENCIES.find(x => x.hz === hz);
        if (f) await toggleFreq(f);
      }
      for (const id of (data.blend?.sounds || [])) {
        const s = SOUNDS.find(x => x.id === id);
        if (s) await toggleSound(s);
      }
      if (data.blend?.drone) {
        const d = INSTRUMENT_DRONES.find(x => x.id === data.blend.drone);
        if (d) await toggleDrone(d);
      }

      toast(data.blend_name || 'Blend Activated', {
        description: data.summary || data.blend?.desc || 'Your personalized blend is playing',
      });
    } catch {
      toast.error('Could not generate blend');
    }
    setAiBlendLoading(false);
  }, [authHeaders, stopAll, toggleFreq, toggleSound, toggleDrone]);

  const handleAiBlend = useCallback(() => {
    checkAccess('ai_frequency_blend', requestAiBlend);
  }, [checkAccess, requestAiBlend]);

  const fetchSoundscapes = useCallback(async () => {
    if (!authHeaders?.Authorization) return;
    try {
      const [mine, community] = await Promise.all([
        axios.get(`${API}/mixer-presets/sessions`, { headers: authHeaders }),
        axios.get(`${API}/mixer-presets/sessions/community`),
      ]);
      setSavedSoundscapes(mine.data);
      setCommunitySoundscapes(community.data);
    } catch {}
  }, [authHeaders]);

  useEffect(() => { fetchSoundscapes(); }, [fetchSoundscapes]);

  const saveSoundscape = useCallback(async (isPublic = false) => {
    if (!hasActive) return;
    setSoundscapeSaving(true);
    try {
      const snapshot = getSnapshot();
      const res = await axios.post(`${API}/mixer-presets/sessions`, {
        name: soundscapeName || `Soundscape ${new Date().toLocaleTimeString()}`,
        snapshot,
        is_public: isPublic,
      }, { headers: authHeaders });
      setSoundscapeName('');
      toast('Soundscape Saved', { description: isPublic ? 'Shared with the community' : 'Saved to your collection' });
      if (typeof window.__workAccrue === 'function') window.__workAccrue('frequency_mix', 18);
      if (res.data?.generated_asset) {
        setTimeout(() => {
          toast.success(`New asset generated: ${res.data.generated_asset.name}`, { description: 'Listed in the Trade Circle marketplace' });
        }, 1500);
      }
      fetchSoundscapes();
    } catch {}
    setSoundscapeSaving(false);
  }, [hasActive, getSnapshot, soundscapeName, authHeaders, fetchSoundscapes]);

  const loadSoundscape = useCallback(async (session) => {
    if (session.snapshot) {
      await restoreSnapshot(session.snapshot, authHeaders);
      toast('Soundscape Loaded', { description: session.name });
    }
  }, [restoreSnapshot, authHeaders]);

  const deleteSoundscape = useCallback(async (id) => {
    try {
      await axios.delete(`${API}/mixer-presets/sessions/${id}`, { headers: authHeaders });
      fetchSoundscapes();
    } catch {}
  }, [authHeaders, fetchSoundscapes]);

  return (
    <div className="min-h-screen relative" data-testid="cosmic-mixer-page">
      {activeLight && <div className="fixed inset-0 pointer-events-none z-10"><LightOverlay mode={activeLight} /></div>}

      {/* Session progress bar */}
      {sessionActive && sessionData && (
        <div className="fixed top-0 left-0 right-0 z-40" style={{ background: 'rgba(0,0,0,0)', backdropFilter: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-6xl mx-auto px-4 py-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{sessionData.icon}</span>
                <span className="text-xs font-medium" style={{ color: sessionData.color }}>{sessionData.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.75)' }}>{fmtTime(sessionTimeLeft)}</span>
                <button onClick={stopSession} className="text-[10px] px-2.5 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }} data-testid="session-stop">End</button>
              </div>
            </div>
            <div className="flex gap-1 mb-1">
              {sessionData.phases.map((p, i) => (
                <div key={i} className="h-1 rounded-full flex-1 transition-all" style={{ background: i < sessionPhaseIdx ? sessionData.color : i === sessionPhaseIdx ? `${sessionData.color}80` : 'rgba(255,255,255,0.06)' }} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: sessionData.color }}>Phase {sessionPhaseIdx + 1}/{sessionData.phases.length}: {sessionData.phases[sessionPhaseIdx]?.desc}</span>
              <span className="text-[9px] tabular-nums" style={{ color: 'rgba(255,255,255,0.65)' }}>{fmtTime(sessionPhaseTimeLeft)} left</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Sticky Master Controls Footer ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50" data-testid="mixer-sticky-footer"
        style={{ background: 'rgba(0,0,0,0)', backdropFilter: 'none', borderTop: `1px solid ${hasActive ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.05)'}` }}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setMuted(m => !m)} className="p-1.5 rounded-lg flex-shrink-0 transition-all active:scale-90"
              style={{ background: muted ? 'rgba(239,68,68,0.1)' : 'transparent' }} data-testid="sticky-mute">
              {muted ? <VolumeX size={18} style={{ color: '#EF4444' }} /> : <Volume2 size={18} style={{ color: '#C084FC' }} />}
            </button>
            <input type="range" min={0} max={100} value={muted ? 0 : masterVol}
              onChange={e => { setMasterVol(parseInt(e.target.value)); setMuted(false); }}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #C084FC ${muted ? 0 : masterVol}%, rgba(255,255,255,0.08) ${muted ? 0 : masterVol}%)` }}
              data-testid="sticky-volume" />
            <span className="text-[11px] w-8 text-right tabular-nums flex-shrink-0" style={{ color: 'rgba(255,255,255,0.75)' }}>{muted ? 0 : masterVol}%</span>
            <button onClick={stopAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl flex-shrink-0 transition-all active:scale-95"
              style={{
                background: hasActive ? 'rgba(239,68,68,0.15)' : 'rgba(248,250,252,0.04)',
                border: `1px solid ${hasActive ? 'rgba(239,68,68,0.3)' : 'rgba(248,250,252,0.06)'}`,
              }}
              data-testid="sticky-stop-all">
              <Square size={12} style={{ color: hasActive ? '#EF4444' : 'rgba(255,255,255,0.65)' }} />
              <span className="text-[11px] font-medium" style={{ color: hasActive ? '#EF4444' : 'rgba(255,255,255,0.65)' }}>{t('mixer.stopAll', 'Stop All')}</span>
            </button>
          </div>
          {hasActive && (
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#C084FC' }} />
              <span className="text-[9px]" style={{ color: 'rgba(192,132,252,0.6)' }}>{activeCount} layer{activeCount !== 1 ? 's' : ''} active</span>
            </div>
          )}
        </div>
      </div>

      <div className={`max-w-6xl mx-auto px-4 pb-32 relative z-20 ${sessionActive ? 'pt-24' : 'pt-6'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => { stopAll(); stopSession(); navigate(-1); }} className="p-2 rounded-xl transition-all hover:scale-105" style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }} data-testid="mixer-back">
            <ArrowLeft size={18} style={{ color: 'rgba(255,255,255,0.85)' }} />
          </button>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <Waves size={16} style={{ color: '#C084FC' }} />
              <h1 className="text-lg font-semibold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>Cosmic Mixer</h1>
            </div>
            <MantraBanner category="mixer" />
          </div>
          <div className="w-10" /> {/* spacer for alignment */}
        </div>

        {/* Live Waveform Visualizer */}
        <WaveformVisualizer analyserRef={analyserRef} isActive={activeFreqs.size > 0 || activeSounds.size > 0 || activeDrones.size > 0 || !!activeMantra} />

        {/* Mode Toggle: Console vs Playground */}
        <div className="flex items-center gap-1.5 mb-4 mt-3" data-testid="mixer-mode-toggle">
          {[
            { id: 'console', label: 'Console', icon: Sliders },
            { id: 'playground', label: 'Playground', icon: Target },
          ].map(mode => {
            const active = mixerMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setMixerMode(mode.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all"
                style={{
                  background: active ? 'rgba(192,132,252,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.04)'}`,
                  color: active ? '#C084FC' : 'rgba(255,255,255,0.65)',
                }}
                data-testid={`mixer-mode-${mode.id}`}
              >
                <Icon size={14} />
                <span className="text-[11px] font-medium">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Playground Mode: Orbital Mixer ── */}
        {mixerMode === 'playground' && (
          <div className="mb-4">
            <OrbitalMixer />
          </div>
        )}

        {/* Accordion Sections (Console Mode) */}
        <div className="space-y-2" style={{ display: mixerMode === 'console' ? 'block' : 'none' }}>
          <AccordionSection title={t("mixer.sessionMode", "Session Mode")} icon={Play} color="#EC4899" open={openSections.session} onToggle={() => toggleSection('session')} badge={sessionActive ? sessionData?.label : null}>
            {sessionActive ? (
              <div className="text-center py-3">
                <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>Session in progress</p>
                <button onClick={stopSession} className="text-xs px-5 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }} data-testid="session-stop-inner">End Session</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SESSIONS.map(s => (
                  <button key={s.id} onClick={() => startSession(s)} className="text-left px-4 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.color}20` }} data-testid={`session-${s.id}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{s.icon}</span>
                      <span className="text-xs font-medium" style={{ color: s.color }}>{s.label}</span>
                    </div>
                    <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{fmtTime(s.duration)} — {s.phases.length} phases</span>
                  </button>
                ))}
              </div>
            )}
          </AccordionSection>

          {/* ── Soundscapes (Save/Load) ── */}
          <AccordionSection title={t("mixer.soundscapes", "Soundscapes")} icon={Save} color="#818CF8" open={openSections.soundscapes} onToggle={() => toggleSection('soundscapes')} badge={savedSoundscapes.length > 0 ? `${savedSoundscapes.length} saved` : null}>
            {/* Save current state */}
            <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.1)' }}>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(129,140,248,0.5)' }}>Capture Current Mix</div>
              <input
                type="text" placeholder="Name your soundscape..." value={soundscapeName}
                onChange={e => setSoundscapeName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs mb-2"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#F8FAFC', outline: 'none' }}
                data-testid="soundscape-name-input"
              />
              <div className="flex gap-2">
                <button onClick={() => saveSoundscape(false)} disabled={!hasActive || soundscapeSaving}
                  className="flex-1 py-2 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all disabled:opacity-30"
                  style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.15)', color: '#818CF8' }}
                  data-testid="save-soundscape-private">
                  {soundscapeSaving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />} Save
                </button>
                <button onClick={() => saveSoundscape(true)} disabled={!hasActive || soundscapeSaving}
                  className="flex-1 py-2 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all disabled:opacity-30"
                  style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)', color: '#2DD4BF' }}
                  data-testid="save-soundscape-public">
                  {soundscapeSaving ? <Loader2 size={10} className="animate-spin" /> : <Globe size={10} />} Share
                </button>
              </div>
              {!hasActive && <p className="text-[9px] mt-1.5 text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>Activate layers to capture a soundscape</p>}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-2">
              {[{ id: 'mine', label: 'My Soundscapes' }, { id: 'community', label: 'Community' }].map(t => (
                <button key={t.id} onClick={() => setSoundscapeTab(t.id)}
                  className="flex-1 py-1.5 rounded-lg text-[10px] transition-all"
                  style={{ background: soundscapeTab === t.id ? 'rgba(129,140,248,0.1)' : 'transparent', border: `1px solid ${soundscapeTab === t.id ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.04)'}`, color: soundscapeTab === t.id ? '#818CF8' : 'rgba(255,255,255,0.65)' }}
                  data-testid={`soundscape-tab-${t.id}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Soundscape list */}
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {(soundscapeTab === 'mine' ? savedSoundscapes : communitySoundscapes).length === 0 ? (
                <p className="text-[10px] text-center py-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {soundscapeTab === 'mine' ? 'No saved soundscapes yet' : 'No community soundscapes yet'}
                </p>
              ) : (
                (soundscapeTab === 'mine' ? savedSoundscapes : communitySoundscapes).map(s => (
                  <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/[0.02]"
                    style={{ border: '1px solid rgba(255,255,255,0.04)' }} data-testid={`soundscape-${s.id}`}>
                    <button onClick={() => loadSoundscape(s)} className="flex-1 text-left">
                      <div className="text-xs font-medium" style={{ color: '#F8FAFC' }}>{s.name}</div>
                      <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        {s.creator_name && soundscapeTab === 'community' ? `by ${s.creator_name} · ` : ''}
                        {new Date(s.created_at).toLocaleDateString()}
                      </div>
                    </button>
                    <button onClick={() => loadSoundscape(s)} className="p-1.5 rounded-lg hover:bg-white/5" data-testid={`load-soundscape-${s.id}`}>
                      <Download size={12} style={{ color: '#818CF8' }} />
                    </button>
                    {soundscapeTab === 'community' && (
                      <span className="text-[9px] flex items-center gap-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        <Heart size={9} /> {s.like_count || 0}
                      </span>
                    )}
                    {soundscapeTab === 'mine' && (
                      <button onClick={() => deleteSoundscape(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/10" data-testid={`delete-soundscape-${s.id}`}>
                        <Trash2 size={11} style={{ color: 'rgba(239,68,68,0.5)' }} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </AccordionSection>

          {/* ── AI Frequency Blend ── */}
          <AccordionSection title={t("mixer.aiblend", "AI Frequency Blend")} icon={Wand2} color="#C084FC" open={openSections.aiblend} onToggle={() => toggleSection('aiblend')} badge={aiBlend ? (aiBlend.type === 'ai_enhanced' ? 'AI' : 'Auto') : null}>
            <div className="space-y-3">
              <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Analyzes your mood journal patterns and creates a personalized resonant frequency blend just for you.
              </p>
              <button
                onClick={handleAiBlend}
                disabled={aiBlendLoading || gateChecking}
                className="w-full py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, rgba(192,132,252,0.12), rgba(129,140,248,0.08))',
                  border: '1px solid rgba(192,132,252,0.2)',
                  color: '#C084FC',
                }}
                data-testid="ai-blend-button"
              >
                {aiBlendLoading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                {aiBlendLoading ? 'Analyzing Your Moods...' : 'Generate My Blend'}
              </button>
              <div className="flex items-center gap-2 text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <Crown size={9} style={{ color: '#C084FC' }} />
                <span>Free: Algorithmic blend | Plus+: AI-enhanced with deep mood analysis</span>
              </div>

              {aiBlend && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl space-y-2"
                  style={{ background: 'rgba(192,132,252,0.04)', border: '1px solid rgba(192,132,252,0.1)' }}
                  data-testid="ai-blend-result">
                  <div className="flex items-center gap-2">
                    {aiBlend.type === 'ai_enhanced' ? (
                      <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(192,132,252,0.15)', color: '#C084FC' }}>AI Enhanced</span>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,212,191,0.15)', color: '#2DD4BF' }}>Algorithmic</span>
                    )}
                    {aiBlend.blend_name && <span className="text-xs font-medium" style={{ color: '#F8FAFC' }}>{aiBlend.blend_name}</span>}
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{aiBlend.summary}</p>
                  {aiBlend.insight && (
                    <p className="text-[10px] leading-relaxed italic" style={{ color: 'rgba(192,132,252,0.5)' }}>{aiBlend.insight}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(aiBlend.blend?.primary || []).map(hz => (
                      <span key={hz} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(192,132,252,0.08)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.12)' }}>{hz} Hz</span>
                    ))}
                    {(aiBlend.blend?.sounds || []).map(s => (
                      <span key={s} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.08)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.12)' }}>{s}</span>
                    ))}
                    {aiBlend.blend?.drone && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.12)' }}>{aiBlend.blend.drone}</span>
                    )}
                  </div>
                  {aiBlend.upgrade_hint && (
                    <button onClick={() => navigate('/pricing')} className="w-full mt-2 py-2 rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition-all hover:bg-purple-500/10"
                      style={{ border: '1px solid rgba(192,132,252,0.15)', color: '#C084FC' }}>
                      <Lock size={10} /> {aiBlend.upgrade_hint}
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </AccordionSection>

          {/* ── Mood Presets ── */}
          <AccordionSection title={t("mixer.moodPresets", "Mood Presets")} icon={Sparkles} color="#2DD4BF" open={openSections.mood} onToggle={() => toggleSection('mood')} badge={activeMoodPreset ? activeMoodPreset.label : null}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MOOD_PRESETS.map(p => {
                const isActive = activeMoodPreset?.id === p.id;
                return (
                  <button key={p.id} onClick={() => activateMoodPreset(p)}
                    className="text-left px-4 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: isActive ? `${p.color}15` : `${p.color}05`,
                      border: `1px solid ${isActive ? `${p.color}40` : `${p.color}15`}`,
                      boxShadow: isActive ? `0 0 20px ${p.color}15` : 'none',
                    }}
                    data-testid={`mood-${p.id}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: isActive ? p.color : `${p.color}CC` }}>{p.label}</span>
                      {isActive && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${p.color}20`, color: p.color }}>ACTIVE</span>
                      )}
                    </div>
                    <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{p.desc} — {p.bpm} BPM</span>
                  </button>
                );
              })}
            </div>
          </AccordionSection>

          <AccordionSection title={t("mixer.frequencies", "Solfeggio Frequency")} icon={Waves} color="#C084FC" open={openSections.freq} onToggle={() => toggleSection('freq')} badge={activeFreqs.size > 0 ? `${activeFreqs.size} active` : null}>
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1.5">
                {allFrequencies.map(f => {
                  const special = f.isFounder || f.isSeasonal;
                  const badgeLabel = f.isFounder ? 'FOUNDER' : f.isSeasonal ? (f.collected ? f.icon?.toUpperCase() || 'SEASONAL' : 'COLLECT') : null;
                  const badgeColor = f.isFounder ? '#FCD34D' : f.color;
                  const key = f.isFounder ? `founder-${f.hz}` : f.isSeasonal ? `seasonal-${f.seasonId}` : `freq-${f.hz}`;
                  const isActive = activeFreqs.has(f.hz);
                  return (
                    <div key={key} className="flex-shrink-0">
                      <button onClick={() => {
                        if (f.isSeasonal && !f.collected) { collectSeasonal(f.seasonId); return; }
                        toggleFreq(f);
                      }} className="text-left px-3 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97] relative"
                        style={{
                          background: isActive ? `${f.color}15` : special ? `${badgeColor}06` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isActive ? `${f.color}35` : special ? `${badgeColor}18` : 'rgba(255,255,255,0.04)'}`,
                          boxShadow: special ? `0 0 12px ${badgeColor}08` : 'none',
                        }}
                        data-testid={`mixer-freq-${f.hz}`}>
                        {badgeLabel && <span className="absolute -top-1.5 -right-1.5 text-[6px] px-1 py-0.5 rounded-full font-bold" style={{ background: `${badgeColor}18`, color: badgeColor, border: `1px solid ${badgeColor}35` }}>{badgeLabel}</span>}
                        <span className="text-[11px] font-medium block" style={{ color: isActive ? f.color : special ? badgeColor : 'rgba(255,255,255,0.9)' }}>{f.label}</span>
                        <span className="text-[8px] block" style={{ color: special ? `${badgeColor}60` : 'rgba(255,255,255,0.6)' }}>{f.desc}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
              {/* Per-channel faders for active frequencies */}
              <AnimatePresence>
                {Array.from(activeFreqs).map(hz => {
                  const f = allFrequencies.find(x => x.hz === hz);
                  if (!f) return null;
                  return (
                    <ChannelStrip key={`ch-${hz}`} label={f.label} volKey={`freq-${hz}`}
                      vol={channelVols[`freq-${hz}`]} onVolChange={setChannelVolume}
                      color={f.color} isActive={true}>
                      <WaveformSelector value={freqWaveforms[hz] || 'sine'} color={f.color}
                        onChange={w => {
                          setFreqWaveforms(prev => ({...prev, [hz]: w}));
                          // Update live oscillator waveform
                          const nodes = freqNodesMapRef.current[hz];
                          if (nodes) nodes.forEach(n => { if (n.type !== undefined && n.frequency) { try { n.type = w; } catch {} } });
                        }} />
                    </ChannelStrip>
                  );
                })}
              </AnimatePresence>
            </div>
          </AccordionSection>

          <AccordionSection title={t("mixer.sounds", "Ambient Sound")} icon={Volume2} color="#3B82F6" open={openSections.sound} onToggle={() => toggleSection('sound')} badge={activeSounds.size > 0 ? `${activeSounds.size} active` : null}>
            <div className="space-y-1">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {SOUNDS.map(s => (
                  <button key={s.id} onClick={() => toggleSound(s)} className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97]"
                    style={{ background: activeSounds.has(s.id) ? `${s.color}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${activeSounds.has(s.id) ? `${s.color}35` : 'rgba(255,255,255,0.04)'}` }}
                    data-testid={`mixer-sound-${s.id}`}>
                    {activeSounds.has(s.id) ? <Pause size={10} style={{ color: s.color }} /> : <Play size={10} style={{ color: 'rgba(255,255,255,0.6)' }} />}
                    <span className="text-[11px]" style={{ color: activeSounds.has(s.id) ? s.color : 'rgba(255,255,255,0.8)' }}>{s.label}</span>
                  </button>
                ))}
              </div>
              {/* Per-channel faders + filter for active sounds */}
              <AnimatePresence>
                {Array.from(activeSounds).map(id => {
                  const s = SOUNDS.find(x => x.id === id);
                  if (!s) return null;
                  const sf = soundFilters[id] || { cutoff: 20000, resonance: 1 };
                  return (
                    <motion.div key={`ch-sound-${id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div className="px-1 py-1 space-y-1" data-testid={`channel-sound-${id}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] w-10 flex-shrink-0" style={{ color: `${s.color}70` }}>{s.label}</span>
                          <input type="range" min={0} max={100} value={channelVols[`sound-${id}`] ?? 75}
                            onChange={e => setChannelVolume(`sound-${id}`, Number(e.target.value))}
                            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                            style={{ background: `linear-gradient(to right, ${s.color} ${channelVols[`sound-${id}`] ?? 75}%, rgba(255,255,255,0.06) ${channelVols[`sound-${id}`] ?? 75}%)`, accentColor: s.color }}
                            data-testid={`fader-sound-${id}`} />
                          <span className="text-[8px] w-8 text-right tabular-nums" style={{ color: `${s.color}50` }}>{channelVols[`sound-${id}`] ?? 75}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[7px] w-10 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.6)' }}>Filter</span>
                          <input type="range" min={100} max={20000} value={sf.cutoff} step={100}
                            onChange={e => setChannelFilter(soundFilterMapRef, setSoundFilters, id, Number(e.target.value), sf.resonance)}
                            className="flex-1 h-0.5 rounded-full appearance-none cursor-pointer"
                            style={{ background: `linear-gradient(to right, ${s.color}60 ${(sf.cutoff / 20000) * 100}%, rgba(255,255,255,0.04) ${(sf.cutoff / 20000) * 100}%)` }}
                            data-testid={`filter-sound-${id}`} />
                          <input type="range" min={0.1} max={20} value={sf.resonance} step={0.5}
                            onChange={e => setChannelFilter(soundFilterMapRef, setSoundFilters, id, sf.cutoff, Number(e.target.value))}
                            className="w-12 h-0.5 rounded-full appearance-none cursor-pointer"
                            style={{ background: `linear-gradient(to right, #F97316 ${(sf.resonance / 20) * 100}%, rgba(255,255,255,0.04) ${(sf.resonance / 20) * 100}%)` }}
                            data-testid={`resonance-sound-${id}`} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </AccordionSection>

          <AccordionSection title={t("mixer.instruments", "World Instruments")} icon={Music} color="#F59E0B" open={openSections.drone} onToggle={() => toggleSection('drone')} badge={activeDrones.size > 0 ? `${activeDrones.size} active` : null}>
            <div className="space-y-1">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {INSTRUMENT_DRONES.map(d => (
                  <button key={d.id} onClick={() => toggleDrone(d)} className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97]"
                    style={{ background: activeDrones.has(d.id) ? `${d.color}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${activeDrones.has(d.id) ? `${d.color}35` : 'rgba(255,255,255,0.04)'}` }}
                    data-testid={`mixer-drone-${d.id}`}>
                    {activeDrones.has(d.id) ? <Pause size={10} style={{ color: d.color }} /> : <Play size={10} style={{ color: 'rgba(255,255,255,0.6)' }} />}
                    <span className="text-[11px]" style={{ color: activeDrones.has(d.id) ? d.color : 'rgba(255,255,255,0.8)' }}>{d.label}</span>
                  </button>
                ))}
              </div>
              {/* Per-channel faders + filter for active drones */}
              <AnimatePresence>
                {Array.from(activeDrones).map(id => {
                  const d = INSTRUMENT_DRONES.find(x => x.id === id);
                  if (!d) return null;
                  const df = droneFilters[id] || { cutoff: d.filterFreq, resonance: d.filterQ };
                  return (
                    <motion.div key={`ch-drone-${id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div className="px-1 py-1 space-y-1" data-testid={`channel-drone-${id}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] w-10 flex-shrink-0" style={{ color: `${d.color}70` }}>{d.label}</span>
                          <input type="range" min={0} max={100} value={channelVols[`drone-${id}`] ?? 75}
                            onChange={e => setChannelVolume(`drone-${id}`, Number(e.target.value))}
                            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                            style={{ background: `linear-gradient(to right, ${d.color} ${channelVols[`drone-${id}`] ?? 75}%, rgba(255,255,255,0.06) ${channelVols[`drone-${id}`] ?? 75}%)`, accentColor: d.color }}
                            data-testid={`fader-drone-${id}`} />
                          <span className="text-[8px] w-8 text-right tabular-nums" style={{ color: `${d.color}50` }}>{channelVols[`drone-${id}`] ?? 75}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[7px] w-10 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.6)' }}>Filter</span>
                          <input type="range" min={80} max={8000} value={df.cutoff} step={50}
                            onChange={e => setChannelFilter(droneFilterMapRef, setDroneFilters, id, Number(e.target.value), df.resonance)}
                            className="flex-1 h-0.5 rounded-full appearance-none cursor-pointer"
                            style={{ background: `linear-gradient(to right, ${d.color}60 ${(df.cutoff / 8000) * 100}%, rgba(255,255,255,0.04) ${(df.cutoff / 8000) * 100}%)` }}
                            data-testid={`filter-drone-${id}`} />
                          <input type="range" min={0.1} max={20} value={df.resonance} step={0.5}
                            onChange={e => setChannelFilter(droneFilterMapRef, setDroneFilters, id, df.cutoff, Number(e.target.value))}
                            className="w-12 h-0.5 rounded-full appearance-none cursor-pointer"
                            style={{ background: `linear-gradient(to right, #F97316 ${(df.resonance / 20) * 100}%, rgba(255,255,255,0.04) ${(df.resonance / 20) * 100}%)` }}
                            data-testid={`resonance-drone-${id}`} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </AccordionSection>

          <AccordionSection title={t("mixer.mantras", "Mantra")} icon={BookOpen} color="#2DD4BF" open={openSections.mantra} onToggle={() => toggleSection('mantra')} badge={activeMantra ? activeMantra.label : null}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {MANTRAS.map(m => (
                <button key={m.id} onClick={() => toggleMantra(m)} disabled={mantraLoading && activeMantra?.id !== m.id}
                  className="text-left px-2.5 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97] flex items-center gap-1.5"
                  style={{ background: activeMantra?.id === m.id ? `${m.color}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${activeMantra?.id === m.id ? `${m.color}35` : 'rgba(255,255,255,0.04)'}`, opacity: mantraLoading && activeMantra?.id !== m.id ? 0.4 : 1 }}
                  data-testid={`mixer-mantra-${m.id}`}>
                  {mantraLoading && activeMantra?.id === m.id && <Loader2 size={9} className="animate-spin flex-shrink-0" style={{ color: m.color }} />}
                  <div>
                    <span className="text-[11px] font-medium block" style={{ color: activeMantra?.id === m.id ? m.color : 'rgba(255,255,255,0.85)' }}>{m.label}</span>
                    <span className="text-[8px] block" style={{ color: 'rgba(255,255,255,0.6)' }}>{m.tradition}</span>
                  </div>
                </button>
              ))}
            </div>
          </AccordionSection>

          {/* Voice Morphing Engine */}
          <AccordionSection title={t("mixer.voiceEngine", "Voice Engine")} icon={Sparkles} color="#E879F9" open={openSections.voice || showVoiceEngine} onToggle={() => { toggleSection('voice'); setShowVoiceEngine(s => !s); }} badge={activeMantra ? 'Active' : null}>
            <div className="space-y-3" data-testid="voice-morph-engine">
              {!activeMantra && (
                <p className="text-[10px] text-center py-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Select a mantra above to activate the Voice Engine</p>
              )}

              {/* Voice Gain (Volume Boost) */}
              <VoiceSlider label="Voice Gain" value={voiceMorph.gain} min={0} max={200} color="#E879F9" unit="%"
                onChange={v => { setVoiceMorph(m => ({...m, gain: v})); }} testId="voice-gain" />

              {/* Pitch */}
              <VoiceSlider label="Pitch Shift" value={voiceMorph.pitch} min={-24} max={24} color="#C084FC" unit="st" center
                onChange={v => {
                  setVoiceMorph(m => ({...m, pitch: v}));
                  if (mantraAudioRef.current) mantraAudioRef.current.playbackRate = Math.pow(2, v / 12) * (voiceMorph.speed / 100);
                }} testId="voice-pitch" />

              {/* Formant */}
              <VoiceSlider label="Formant" value={voiceMorph.formant} min={-100} max={100} color="#F97316" unit="" center
                onChange={v => setVoiceMorph(m => ({...m, formant: v}))} testId="voice-formant" />

              {/* Speed */}
              <VoiceSlider label="Speed" value={voiceMorph.speed} min={50} max={200} color="#2DD4BF" unit="%"
                onChange={v => {
                  setVoiceMorph(m => ({...m, speed: v}));
                  if (mantraAudioRef.current) mantraAudioRef.current.playbackRate = Math.pow(2, voiceMorph.pitch / 12) * (v / 100);
                }} testId="voice-speed" />

              {/* Reverb */}
              <VoiceSlider label="Reverb" value={voiceMorph.reverb} min={0} max={100} color="#3B82F6" unit="%"
                onChange={v => setVoiceMorph(m => ({...m, reverb: v}))} testId="voice-reverb" />

              {/* Echo */}
              <div className="grid grid-cols-2 gap-2">
                <VoiceSlider label="Echo" value={voiceMorph.delay} min={0} max={100} color="#818CF8" unit="%"
                  onChange={v => setVoiceMorph(m => ({...m, delay: v}))} testId="voice-delay" />
                <VoiceSlider label="Echo Time" value={voiceMorph.delayTime} min={50} max={2000} color="#818CF8" unit="ms"
                  onChange={v => setVoiceMorph(m => ({...m, delayTime: v}))} testId="voice-delay-time" />
              </div>

              {/* Chorus */}
              <VoiceSlider label="Chorus" value={voiceMorph.chorus} min={0} max={100} color="#22C55E" unit="%"
                onChange={v => setVoiceMorph(m => ({...m, chorus: v}))} testId="voice-chorus" />

              {/* Distortion */}
              <VoiceSlider label="Distortion" value={voiceMorph.distortion} min={0} max={100} color="#EF4444" unit="%"
                onChange={v => setVoiceMorph(m => ({...m, distortion: v}))} testId="voice-distortion" />

              {/* EQ */}
              <div className="grid grid-cols-3 gap-1.5">
                <VoiceSlider label="Low" value={voiceMorph.eqLow} min={-12} max={12} color="#FB923C" unit="dB" center compact
                  onChange={v => setVoiceMorph(m => ({...m, eqLow: v}))} testId="voice-eq-low" />
                <VoiceSlider label="Mid" value={voiceMorph.eqMid} min={-12} max={12} color="#FCD34D" unit="dB" center compact
                  onChange={v => setVoiceMorph(m => ({...m, eqMid: v}))} testId="voice-eq-mid" />
                <VoiceSlider label="High" value={voiceMorph.eqHigh} min={-12} max={12} color="#06B6D4" unit="dB" center compact
                  onChange={v => setVoiceMorph(m => ({...m, eqHigh: v}))} testId="voice-eq-high" />
              </div>

              {/* Stereo Width */}
              <VoiceSlider label="Stereo Width" value={voiceMorph.width} min={0} max={100} color="#A855F7" unit="%"
                onChange={v => setVoiceMorph(m => ({...m, width: v}))} testId="voice-width" />

              {/* Presets */}
              <div className="pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <p className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Voice Presets</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Clean', preset: { pitch: 0, formant: 0, reverb: 20, delay: 0, delayTime: 300, chorus: 0, distortion: 0, eqLow: 0, eqMid: 0, eqHigh: 0, speed: 100, width: 0, gain: 100 }, color: '#94A3B8' },
                    { label: 'Deep Elder', preset: { pitch: -12, formant: -60, reverb: 40, delay: 15, delayTime: 500, chorus: 10, distortion: 5, eqLow: 6, eqMid: -3, eqHigh: -6, speed: 85, width: 20, gain: 140 }, color: '#78716C' },
                    { label: 'Celestial', preset: { pitch: 7, formant: 40, reverb: 70, delay: 25, delayTime: 800, chorus: 45, distortion: 0, eqLow: -4, eqMid: 0, eqHigh: 8, speed: 95, width: 70, gain: 120 }, color: '#C084FC' },
                    { label: 'Whisper', preset: { pitch: 3, formant: 20, reverb: 50, delay: 10, delayTime: 400, chorus: 0, distortion: 0, eqLow: -8, eqMid: 4, eqHigh: 10, speed: 90, width: 30, gain: 180 }, color: '#2DD4BF' },
                    { label: 'Cosmic Echo', preset: { pitch: 0, formant: 0, reverb: 30, delay: 60, delayTime: 600, chorus: 20, distortion: 0, eqLow: 2, eqMid: 0, eqHigh: 3, speed: 100, width: 50, gain: 130 }, color: '#818CF8' },
                    { label: 'Dark Oracle', preset: { pitch: -18, formant: -80, reverb: 55, delay: 30, delayTime: 700, chorus: 15, distortion: 20, eqLow: 10, eqMid: -6, eqHigh: -10, speed: 75, width: 40, gain: 160 }, color: '#DC2626' },
                    { label: 'Angelic', preset: { pitch: 12, formant: 50, reverb: 80, delay: 20, delayTime: 1000, chorus: 60, distortion: 0, eqLow: -6, eqMid: 2, eqHigh: 12, speed: 110, width: 80, gain: 110 }, color: '#FCD34D' },
                    { label: 'Glitch', preset: { pitch: -5, formant: -30, reverb: 10, delay: 80, delayTime: 120, chorus: 70, distortion: 60, eqLow: 4, eqMid: 8, eqHigh: -4, speed: 130, width: 90, gain: 150 }, color: '#EF4444' },
                  ].map(p => (
                    <button key={p.label} onClick={() => {
                      setVoiceMorph(p.preset);
                      if (mantraAudioRef.current) mantraAudioRef.current.playbackRate = Math.pow(2, p.preset.pitch / 12) * (p.preset.speed / 100);
                    }}
                      className="px-2 py-1 rounded-lg text-[9px] transition-all hover:scale-105"
                      style={{ background: `${p.color}10`, color: p.color, border: `1px solid ${p.color}20` }}
                      data-testid={`voice-preset-${p.label.toLowerCase().replace(/\s/g,'-')}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* Master Effects Bus */}
          <AccordionSection title={t("mixer.masterFx", "Master FX Bus")} icon={Sliders} color="#06B6D4" open={openSections.masterFx} onToggle={() => toggleSection('masterFx')} badge={masterFx.reverb > 5 || masterFx.delay > 5 || masterFx.chorus > 5 ? 'Active' : null}>
            <div className="space-y-2" data-testid="master-fx-bus">
              <p className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Global effects on master output</p>

              <VoiceSlider label="Reverb" value={masterFx.reverb} min={0} max={60} color="#3B82F6" unit="%"
                onChange={v => setMasterFx(m => ({...m, reverb: v}))} testId="master-reverb" />
              <p className="text-[7px] -mt-1 pl-[72px]" style={{ color: 'rgba(59,130,246,0.3)' }}>Ceiling: 60% to prevent muddiness</p>

              <div className="grid grid-cols-2 gap-2">
                <VoiceSlider label="Delay" value={masterFx.delay} min={0} max={70} color="#818CF8" unit="%"
                  onChange={v => setMasterFx(m => ({...m, delay: v}))} testId="master-delay" />
                <VoiceSlider label="Time" value={masterFx.delayTime} min={50} max={1500} color="#818CF8" unit="ms"
                  onChange={v => setMasterFx(m => ({...m, delayTime: v}))} testId="master-delay-time" />
              </div>

              <VoiceSlider label="Chorus" value={masterFx.chorus} min={0} max={60} color="#22C55E" unit="%"
                onChange={v => setMasterFx(m => ({...m, chorus: v}))} testId="master-chorus" />

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>Compressor</span>
                <button onClick={() => setMasterFx(m => ({...m, compressor: !m.compressor}))}
                  className="px-2 py-0.5 rounded text-[8px] transition-all"
                  style={{
                    background: masterFx.compressor ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.03)',
                    color: masterFx.compressor ? '#06B6D4' : 'rgba(255,255,255,0.6)',
                    border: `1px solid ${masterFx.compressor ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                  data-testid="master-compressor-toggle"
                >{masterFx.compressor ? 'On' : 'Off'}</button>
                <span className="text-[7px]" style={{ color: 'rgba(248,250,252,0.15)' }}>Glues layers, prevents clipping</span>
              </div>
            </div>
          </AccordionSection>

          {/* Layer Crossfade */}
          <AccordionSection title="Layer Crossfade" icon={ArrowRightLeft} open={openSections.crossfade} onToggle={() => toggleSection('crossfade')} color="#A855F7" badge={null}>
            <div className="space-y-2" data-testid="layer-crossfade">
              <p className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Balance between layer groups</p>

              {/* Freq vs Ambient crossfade */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] w-14 flex-shrink-0 text-right" style={{ color: '#C084FC' }}>Freq</span>
                <input type="range" min={0} max={100} value={channelVols['xfade-freq-sound'] ?? 50}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setChannelVols(prev => ({...prev, 'xfade-freq-sound': v}));
                    // Apply: freq gets (100-v)%, sound gets v%
                    Object.keys(freqGainMapRef.current).forEach(k => {
                      if (freqGainMapRef.current[k]) freqGainMapRef.current[k].gain.value = ((100 - v) / 100) * ((channelVols[`freq-${k}`] ?? 75) / 100) * 0.15;
                    });
                    Object.keys(soundGainMapRef.current).forEach(k => {
                      if (soundGainMapRef.current[k]) soundGainMapRef.current[k].gain.value = (v / 100) * ((channelVols[`sound-${k}`] ?? 75) / 100) * 0.15;
                    });
                  }}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C084FC ${channelVols['xfade-freq-sound'] ?? 50}%, #3B82F6 ${channelVols['xfade-freq-sound'] ?? 50}%)`,
                  }}
                  data-testid="xfade-freq-sound" />
                <span className="text-[9px] w-14 flex-shrink-0" style={{ color: '#3B82F6' }}>Ambient</span>
              </div>

              {/* Drone vs Voice crossfade */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] w-14 flex-shrink-0 text-right" style={{ color: '#F59E0B' }}>Instru</span>
                <input type="range" min={0} max={100} value={channelVols['xfade-drone-voice'] ?? 50}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setChannelVols(prev => ({...prev, 'xfade-drone-voice': v}));
                    Object.keys(droneGainMapRef.current).forEach(k => {
                      if (droneGainMapRef.current[k]) droneGainMapRef.current[k].gain.value = ((100 - v) / 100) * ((channelVols[`drone-${k}`] ?? 75) / 100) * 0.15;
                    });
                    if (voiceChainRef.current?.input) {
                      voiceChainRef.current.input.gain.value = (v / 100) * (voiceMorph.gain / 100) * 1.5;
                    }
                  }}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #F59E0B ${channelVols['xfade-drone-voice'] ?? 50}%, #E879F9 ${channelVols['xfade-drone-voice'] ?? 50}%)`,
                  }}
                  data-testid="xfade-drone-voice" />
                <span className="text-[9px] w-14 flex-shrink-0" style={{ color: '#E879F9' }}>Voice</span>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Light Resonance" icon={Sun} color="#FCD34D" open={openSections.light} onToggle={() => toggleSection('light')} badge={activeLight ? activeLight.label : null}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {LIGHT_MODES.map(l => (
                <button key={l.id} onClick={() => toggleLight(l)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: activeLight?.id === l.id ? `${l.colors[0]}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${activeLight?.id === l.id ? `${l.colors[1]}35` : 'rgba(255,255,255,0.04)'}` }}
                  data-testid={`mixer-light-${l.id}`}>
                  <div className="flex gap-0.5 flex-shrink-0">{l.colors.slice(0, 3).map((c, i) => <div key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />)}</div>
                  <span className="text-[11px]" style={{ color: activeLight?.id === l.id ? l.colors[1] : 'rgba(255,255,255,0.8)' }}>{l.label}</span>
                </button>
              ))}
            </div>
          </AccordionSection>

          <AccordionSection title="Haptic Vibration" icon={Vibrate} color="#FB923C" open={openSections.haptic} onToggle={() => toggleSection('haptic')} badge={vibeOn ? `${hapticIntensity}%` : null}>
            <div className="space-y-2.5">
              <button onClick={toggleVibe} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01] w-full"
                style={{ background: vibeOn ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.02)', border: `1px solid ${vibeOn ? 'rgba(251,146,60,0.25)' : 'rgba(255,255,255,0.04)'}` }}
                data-testid="mixer-vibe-toggle">
                <Vibrate size={16} style={{ color: vibeOn ? '#FB923C' : 'rgba(255,255,255,0.7)' }} />
                <div className="text-left">
                  <span className="text-xs block" style={{ color: vibeOn ? '#FB923C' : 'rgba(255,255,255,0.85)' }}>{vibeOn ? 'Vibrating — Tap to Stop' : 'Enable Haptic Pulse'}</span>
                  <span className="text-[9px] block" style={{ color: 'rgba(255,255,255,0.65)' }}>{firstActiveFreq ? `Synced to ${firstActiveFreq.label}` : 'Pulses at a calm rhythm'}</span>
                </div>
              </button>
              {vibeOn && (
                <div className="flex items-center gap-3 px-2">
                  <span className="text-[10px] w-14" style={{ color: 'rgba(251,146,60,0.6)' }}>Intensity</span>
                  <input type="range" min={10} max={100} value={hapticIntensity} onChange={e => setHapticIntensity(Number(e.target.value))}
                    className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #FB923C ${hapticIntensity}%, rgba(255,255,255,0.06) ${hapticIntensity}%)`, accentColor: '#FB923C' }}
                    data-testid="haptic-intensity" />
                  <span className="text-[10px] w-8 text-right tabular-nums" style={{ color: 'rgba(251,146,60,0.5)' }}>{hapticIntensity}%</span>
                </div>
              )}
            </div>
          </AccordionSection>

          <AccordionSection title="Tempo & Beat" icon={Radio} color="#EC4899" open={openSections.tempo} onToggle={() => toggleSection('tempo')} badge={bpm > 0 ? `${bpm} BPM` : null}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold tabular-nums w-16" style={{ color: bpm > 0 ? '#EC4899' : 'rgba(255,255,255,0.65)' }}>{bpm > 0 ? `${bpm} BPM` : 'Off'}</span>
                <input type="range" min="0" max="200" step="1" value={bpm} onChange={e => setBpm(Number(e.target.value))}
                  className="flex-1 h-1.5 appearance-none rounded-full cursor-pointer" style={{ background: `linear-gradient(to right, #EC4899 ${bpm / 2}%, rgba(255,255,255,0.06) ${bpm / 2}%)`, accentColor: '#EC4899' }}
                  data-testid="tempo-slider-page" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={tapTempo} className="text-xs px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', color: '#EC4899' }} data-testid="tap-tempo-page">Tap Tempo</button>
                {bpm > 0 && (
                  <>
                    <button onClick={stopTempo} className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }} data-testid="tempo-stop-page">Stop</button>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full transition-all" style={{ background: beatPulse ? '#EC4899' : 'rgba(236,72,153,0.15)', boxShadow: beatPulse ? '0 0 12px rgba(236,72,153,0.5)' : 'none', transform: beatPulse ? 'scale(1.4)' : 'scale(1)' }} />
                      <span className="text-[10px]" style={{ color: 'rgba(236,72,153,0.5)' }}>Breathing</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TEMPO_PRESETS.map(p => (
                  <button key={p.id} onClick={() => setTempoFromPreset(p)} className="text-[10px] px-2.5 py-1.5 rounded-xl transition-all hover:scale-[1.03]"
                    style={{ background: activePreset?.id === p.id ? `${p.color}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${activePreset?.id === p.id ? `${p.color}35` : 'rgba(255,255,255,0.04)'}`, color: activePreset?.id === p.id ? p.color : 'rgba(255,255,255,0.75)' }}
                    data-testid={`tempo-preset-page-${p.id}`}>{p.label}</button>
                ))}
              </div>
            </div>
          </AccordionSection>
        </div>
      </div>
    </div>
  );
}

function AccordionSection({ title, icon: Icon, color, open, onToggle, badge, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(248,250,252,0.015)', border: `1px solid ${badge ? `${color}18` : 'rgba(248,250,252,0.03)'}` }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]"
        data-testid={`accordion-${title.toLowerCase().replace(/[^a-z]/g, '-')}`}>
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: badge ? color : 'rgba(255,255,255,0.7)' }} />
          <span className="text-[11px] uppercase tracking-[0.12em] font-semibold" style={{ color: badge ? color : 'rgba(255,255,255,0.75)' }}>{title}</span>
          {badge && <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>{badge}</span>}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.65)' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LightOverlay({ mode }) {
  const [colorIdx, setColorIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setColorIdx(i => (i + 1) % mode.colors.length), mode.speed);
    return () => clearInterval(iv);
  }, [mode]);
  const cur = mode.colors[colorIdx];
  const next = mode.colors[(colorIdx + 1) % mode.colors.length];
  const prev = mode.colors[(colorIdx - 1 + mode.colors.length) % mode.colors.length];
  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 90% 70% at 50% 40%, ${cur}55 0%, ${next}30 40%, transparent 75%)`,
        transition: `background ${mode.speed / 1000}s ease-in-out`,
      }} />
      <div className="absolute inset-0" style={{
        background: `linear-gradient(135deg, ${prev}20 0%, transparent 40%, ${cur}25 70%, ${next}15 100%)`,
        transition: `background ${mode.speed / 1200}s ease-in-out`,
      }} />
    </div>
  );
}
