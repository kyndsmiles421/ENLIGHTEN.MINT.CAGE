import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  ChevronUp, ChevronDown, X, Volume2, VolumeX, Waves, Sun, BookOpen,
  Vibrate, Play, Pause, Square, Loader2, Music, Film, Sliders, Maximize2, Minimize2,
  Save, Heart, Globe, Lock, Trash2, Star, Users, Hexagon, Circle, Radio, Library,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import FractalVisualizer from './FractalVisualizer';
import { VisualLayersMixer, LIGHT_MODES, VIDEO_OVERLAYS, FRACTAL_TYPES, VISUAL_FILTERS } from './VisualLayersMixer';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ─── Layer Definitions ─── */
const FREQUENCIES = [
  { hz: 174, label: '174 Hz', desc: 'Foundation & Pain Relief', color: '#78716C' },
  { hz: 396, label: '396 Hz', desc: 'Liberation from Fear', color: '#EF4444' },
  { hz: 417, label: '417 Hz', desc: 'Undoing & Change', color: '#FB923C' },
  { hz: 528, label: '528 Hz', desc: 'Love & Transformation', color: '#22C55E' },
  { hz: 639, label: '639 Hz', desc: 'Connection & Harmony', color: '#3B82F6' },
  { hz: 741, label: '741 Hz', desc: 'Intuition & Expression', color: '#8B5CF6' },
  { hz: 852, label: '852 Hz', desc: 'Spiritual Awakening', color: '#C084FC' },
  { hz: 963, label: '963 Hz', desc: 'Divine Connection', color: '#E879F9' },
  { hz: 7.83, label: '7.83 Hz', desc: 'Schumann Resonance', color: '#2DD4BF' },
];

const SOUNDS = [
  { id: 'rain', label: 'Rain', color: '#3B82F6', gen: (ctx, g) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000;
    src.connect(hp); hp.connect(lp); lp.connect(g); src.start();
    return [src];
  }},
  { id: 'ocean', label: 'Ocean', color: '#06B6D4', gen: (ctx, g) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
    const lg = ctx.createGain(); lg.gain.value = 150;
    lfo.connect(lg); lg.connect(lp.frequency);
    src.connect(lp); lp.connect(g); lfo.start(); src.start();
    return [src, lfo];
  }},
  { id: 'wind', label: 'Wind', color: '#A78BFA', gen: (ctx, g) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 0.5;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
    const lg = ctx.createGain(); lg.gain.value = 400;
    lfo.connect(lg); lg.connect(bp.frequency);
    src.connect(bp); bp.connect(g); lfo.start(); src.start();
    return [src, lfo];
  }},
  { id: 'fire', label: 'Fire', color: '#F59E0B', gen: (ctx, g) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 1.5;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 3;
    const lg = ctx.createGain(); lg.gain.value = 200;
    lfo.connect(lg); lg.connect(bp.frequency);
    src.connect(bp); bp.connect(g); lfo.start(); src.start();
    return [src, lfo];
  }},
  { id: 'singing-bowl', label: 'Singing Bowl', color: '#FCD34D', gen: (ctx, g) => {
    const nodes = [];
    const play = () => {
      [293.66, 440, 587.33].forEach(f => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const eg = ctx.createGain(); eg.gain.setValueAtTime(0.06, ctx.currentTime);
        eg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6);
        o.connect(eg); eg.connect(g); o.start(); o.stop(ctx.currentTime + 6);
      });
    };
    play();
    const iv = setInterval(play, 5500);
    nodes._interval = iv;
    return nodes;
  }},
];

const MANTRAS = [
  { id: 'om', label: 'Om', text: 'Ommmmm. Ommmmm. Ommmmm.', tradition: 'Universal', color: '#C084FC' },
  { id: 'om-mani', label: 'Om Mani Padme Hum', text: 'Om Mani Padme Hum. Om Mani Padme Hum.', tradition: 'Tibetan Buddhist', color: '#2DD4BF' },
  { id: 'om-namah', label: 'Om Namah Shivaya', text: 'Om Namah Shivaya. Om Namah Shivaya.', tradition: 'Hindu', color: '#8B5CF6' },
  { id: 'so-hum', label: 'So Hum', text: 'So Hum... I am that I am', tradition: 'Vedic', color: '#3B82F6' },
  { id: 'ra-ma', label: 'Ra Ma Da Sa', text: 'Ra Ma Da Sa, Sa Say So Hung', tradition: 'Kundalini', color: '#FCD34D' },
  { id: 'peace', label: 'I Am Peace', text: 'I am peace. I am light. I am love.', tradition: 'Modern', color: '#22C55E' },
];

// World instrument drones for the mixer
const INSTRUMENT_DRONES = [
  { id: 'sitar-drone', label: 'Sitar', color: '#F59E0B', wave: 'sawtooth', freq: 146.83, filterFreq: 1200, filterQ: 8, vibratoRate: 5, vibratoDepth: 8 },
  { id: 'tanpura-drone', label: 'Tanpura', color: '#EA580C', wave: 'sawtooth', freq: 130.81, filterFreq: 600, filterQ: 3, vibratoRate: 2, vibratoDepth: 3 },
  { id: 'didgeridoo-drone', label: 'Didgeridoo', color: '#78350F', wave: 'sawtooth', freq: 65.41, filterFreq: 300, filterQ: 6, vibratoRate: 2, vibratoDepth: 5 },
  { id: 'bowl-drone', label: 'Singing Bowl', color: '#7C3AED', wave: 'sine', freq: 261.63, filterFreq: 800, filterQ: 12, vibratoRate: 1.5, vibratoDepth: 2 },
  { id: 'flute-drone', label: 'Cedar Flute', color: '#059669', wave: 'sine', freq: 329.63, filterFreq: 2000, filterQ: 1, vibratoRate: 4.5, vibratoDepth: 12 },
  { id: 'erhu-drone', label: 'Erhu', color: '#E11D48', wave: 'sawtooth', freq: 293.66, filterFreq: 2500, filterQ: 4, vibratoRate: 5.5, vibratoDepth: 15 },
];

export default function CosmicMixer() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => { if (!fullScreen) setOpen(false); }, [location.pathname, fullScreen]);

  // Master
  const [masterVol, setMasterVol] = useState(60);
  const [muted, setMuted] = useState(false);

  // Active layers
  const [activeFreq, setActiveFreq] = useState(null);
  const [activeSound, setActiveSound] = useState(null);
  const [activeMantra, setActiveMantra] = useState(null);
  const [activeDrone, setActiveDrone] = useState(null);
  const [vibeOn, setVibeOn] = useState(false);

  // Visual layers (multi-stack)
  const [visualLayers, setVisualLayers] = useState([]);
  const analyserRef = useRef(null);
  const analyserDataRef = useRef(new Uint8Array(64));

  // Per-channel volumes (0-100)
  const [freqVol, setFreqVol] = useState(50);
  const [soundVol, setSoundVol] = useState(50);
  const [mantraVol, setMantraVol] = useState(70);
  const [droneVol, setDroneVol] = useState(40);

  // Audio refs
  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const freqGainRef = useRef(null);
  const soundGainRef = useRef(null);
  const droneGainRef = useRef(null);
  const freqNodesRef = useRef([]);
  const soundNodesRef = useRef([]);
  const droneNodesRef = useRef([]);
  const mantraAudioRef = useRef(null);
  const vibeIntervalRef = useRef(null);
  const [mantraLoading, setMantraLoading] = useState(false);

  // Presets
  const [presetsTab, setPresetsTab] = useState('featured'); // featured | community | mine
  const [showPresets, setShowPresets] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presets, setPresets] = useState([]);
  const [presetsLoading, setPresetsLoading] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [savePublic, setSavePublic] = useState(false);
  const authHeaders = user ? { Authorization: `Bearer ${localStorage.getItem('zen_token')}` } : {};

  // Session Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimeline, setRecordingTimeline] = useState([]);
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const [showSaveRecording, setShowSaveRecording] = useState(false);
  const [recordTitle, setRecordTitle] = useState('');
  const [recordDesc, setRecordDesc] = useState('');
  const [recordPublic, setRecordPublic] = useState(false);
  const recordTimerRef = useRef(null);
  const recordSnapshotRef = useRef(null);

  // Live Session Broadcast Mode
  const [broadcastMode, setBroadcastMode] = useState(false);
  const broadcastWsRef = useRef(null);

  // Playlists
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [playlistsTab, setPlaylistsTab] = useState('featured');
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  // Active playlist playback
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [playlistStepIdx, setPlaylistStepIdx] = useState(0);
  const [playlistElapsed, setPlaylistElapsed] = useState(0); // seconds elapsed in current step
  const [playlistPaused, setPlaylistPaused] = useState(false);
  const playlistTimerRef = useRef(null);

  const fetchPlaylists = useCallback(async (tab) => {
    setPlaylistsLoading(true);
    try {
      const endpoint = tab === 'mine' ? '/mine' : tab === 'community' ? '/community' : '/featured';
      const res = await axios.get(`${API}/mixer-presets/playlists${endpoint}`, { headers: authHeaders });
      setPlaylists(res.data);
    } catch { setPlaylists([]); }
    setPlaylistsLoading(false);
  }, [authHeaders]);

  useEffect(() => { if (showPlaylists) fetchPlaylists(playlistsTab); }, [showPlaylists, playlistsTab]);

  const fetchPresets = useCallback(async (tab) => {
    setPresetsLoading(true);
    try {
      const endpoint = tab === 'mine' ? '/mine' : tab === 'community' ? '/community' : '/featured';
      const res = await axios.get(`${API}/mixer-presets${endpoint}`, { headers: authHeaders });
      setPresets(res.data);
    } catch { setPresets([]); }
    setPresetsLoading(false);
  }, [authHeaders]);

  useEffect(() => { if (showPresets) fetchPresets(presetsTab); }, [showPresets, presetsTab]);

  const getCurrentLayers = useCallback(() => {
    const layers = {};
    if (activeFreq) layers.frequency = { hz: activeFreq.hz, label: activeFreq.label };
    if (activeSound) layers.sound = { id: activeSound.id };
    if (activeDrone) layers.drone = { id: activeDrone.id };
    if (activeMantra) layers.mantra = { id: activeMantra.id };
    // Store visual layers
    if (visualLayers.length > 0) layers.visualStack = visualLayers.map(l => ({ type: l.type, itemId: l.itemId, opacity: l.opacity }));
    // Backwards compat: also set light/video if single layer present
    const lightLayer = visualLayers.find(l => l.type === 'light');
    const videoLayer = visualLayers.find(l => l.type === 'video');
    if (lightLayer) layers.light = { id: lightLayer.itemId };
    if (videoLayer) layers.video = { id: videoLayer.itemId };
    const volumes = { freqVol, soundVol, mantraVol, droneVol, masterVol };
    return { layers, volumes };
  }, [activeFreq, activeSound, activeDrone, activeMantra, visualLayers, freqVol, soundVol, mantraVol, droneVol, masterVol]);

  const savePreset = useCallback(async () => {
    const { layers, volumes } = getCurrentLayers();
    try {
      await axios.post(`${API}/mixer-presets`, {
        name: saveName || 'Untitled Mix',
        description: saveDesc,
        layers, volumes,
        is_public: savePublic,
      }, { headers: authHeaders });
      setShowSaveModal(false);
      setSaveName(''); setSaveDesc(''); setSavePublic(false);
      if (showPresets && presetsTab === 'mine') fetchPresets('mine');
    } catch {}
  }, [saveName, saveDesc, savePublic, getCurrentLayers, authHeaders, showPresets, presetsTab, fetchPresets]);

  const loadPreset = useCallback(async (preset) => {
    // Placeholder - will be moved after toggle functions
  }, []);

  const toggleLike = useCallback(async (presetId) => {
    try {
      const res = await axios.post(`${API}/mixer-presets/${presetId}/like`, {}, { headers: authHeaders });
      setPresets(prev => prev.map(p => p.id === presetId ? { ...p, liked: res.data.liked, like_count: res.data.like_count, likes: res.data.liked ? [...(p.likes || []), user?.id] : (p.likes || []).filter(x => x !== user?.id) } : p));
    } catch {}
  }, [authHeaders, user]);

  const deletePreset = useCallback(async (presetId) => {
    try {
      await axios.delete(`${API}/mixer-presets/${presetId}`, { headers: authHeaders });
      setPresets(prev => prev.filter(p => p.id !== presetId));
    } catch {}
  }, [authHeaders]);

  const getCtx = useCallback(async () => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      masterGainRef.current = ctxRef.current.createGain();
      masterGainRef.current.connect(ctxRef.current.destination);
      // Per-channel gain nodes
      freqGainRef.current = ctxRef.current.createGain();
      freqGainRef.current.connect(masterGainRef.current);
      soundGainRef.current = ctxRef.current.createGain();
      soundGainRef.current.connect(masterGainRef.current);
      droneGainRef.current = ctxRef.current.createGain();
      droneGainRef.current.connect(masterGainRef.current);
      // Audio analyser for fractal reactivity
      analyserRef.current = ctxRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;
      analyserDataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      masterGainRef.current.connect(analyserRef.current);
    }
    if (ctxRef.current.state === 'suspended') await ctxRef.current.resume();
    masterGainRef.current.gain.value = muted ? 0 : masterVol / 100;
    return ctxRef.current;
  }, [masterVol, muted]);

  // Update gains in real time
  useEffect(() => {
    if (masterGainRef.current) masterGainRef.current.gain.value = muted ? 0 : masterVol / 100;
  }, [masterVol, muted]);
  useEffect(() => { if (freqGainRef.current) freqGainRef.current.gain.value = freqVol / 100; }, [freqVol]);
  useEffect(() => { if (soundGainRef.current) soundGainRef.current.gain.value = soundVol / 100; }, [soundVol]);
  useEffect(() => { if (droneGainRef.current) droneGainRef.current.gain.value = droneVol / 100; }, [droneVol]);
  useEffect(() => { if (mantraAudioRef.current) mantraAudioRef.current.volume = mantraVol / 100; }, [mantraVol]);

  const stopNodes = (nodesRef) => {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    if (nodesRef.current._interval) clearInterval(nodesRef.current._interval);
    nodesRef.current = [];
  };

  // ─── Frequency Layer ───
  const toggleFreq = useCallback(async (freq) => {
    stopNodes(freqNodesRef);
    if (activeFreq?.hz === freq.hz) { setActiveFreq(null); return; }
    const ctx = await getCtx();
    const channelGain = freqGainRef.current;

    if (freq.hz < 20) {
      const carrier = 200;
      const merger = ctx.createChannelMerger(2);
      const oscL = ctx.createOscillator(); oscL.type = 'sine'; oscL.frequency.value = carrier;
      const gL = ctx.createGain(); gL.gain.value = 1;
      oscL.connect(gL); gL.connect(merger, 0, 0);
      const oscR = ctx.createOscillator(); oscR.type = 'sine'; oscR.frequency.value = carrier + freq.hz;
      const gR = ctx.createGain(); gR.gain.value = 1;
      oscR.connect(gR); gR.connect(merger, 0, 1);
      const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = freq.hz * 16;
      const subG = ctx.createGain(); subG.gain.value = 0.06;
      sub.connect(subG); subG.connect(channelGain);
      merger.connect(channelGain);
      oscL.start(); oscR.start(); sub.start();
      freqNodesRef.current = [oscL, oscR, sub, merger];
    } else {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq.hz;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
      const lg = ctx.createGain(); lg.gain.value = 0.04;
      lfo.connect(lg); lg.connect(o.frequency);
      o.connect(channelGain);
      o.start(); lfo.start();
      freqNodesRef.current = [o, lfo];
    }
    setActiveFreq(freq);
  }, [activeFreq, getCtx]);

  // ─── Sound Layer ───
  const toggleSound = useCallback(async (sound) => {
    stopNodes(soundNodesRef);
    if (activeSound?.id === sound.id) { setActiveSound(null); return; }
    const ctx = await getCtx();
    const nodes = sound.gen(ctx, soundGainRef.current);
    soundNodesRef.current = nodes;
    setActiveSound(sound);
  }, [activeSound, getCtx]);

  // ─── Instrument Drone Layer ───
  const toggleDrone = useCallback(async (drone) => {
    stopNodes(droneNodesRef);
    if (activeDrone?.id === drone.id) { setActiveDrone(null); return; }
    const ctx = await getCtx();
    const channelGain = droneGainRef.current;

    const osc = ctx.createOscillator();
    osc.type = drone.wave;
    osc.frequency.value = drone.freq;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = drone.filterFreq;
    filter.Q.value = drone.filterQ;
    // Vibrato
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = drone.vibratoRate;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = drone.vibratoDepth;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    // Sub harmonic
    const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = drone.freq / 2;
    const subGain = ctx.createGain(); subGain.gain.value = 0.3;
    sub.connect(subGain); subGain.connect(filter);

    osc.connect(filter);
    filter.connect(channelGain);
    osc.start(); lfo.start(); sub.start();
    droneNodesRef.current = [osc, lfo, sub];
    setActiveDrone(drone);
  }, [activeDrone, getCtx]);

  // ─── Mantra Layer ───
  const toggleMantra = useCallback(async (mantra) => {
    if (mantraAudioRef.current) { mantraAudioRef.current.pause(); mantraAudioRef.current = null; }
    if (activeMantra?.id === mantra.id) { setActiveMantra(null); return; }
    setActiveMantra(mantra);
    setMantraLoading(true);
    try {
      const res = await axios.post(`${API}/tts/narrate`, { text: mantra.text, context: 'mixer' });
      if (!res.data.audio) { setMantraLoading(false); setActiveMantra(null); return; }
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      audio.volume = mantraVol / 100;
      audio.loop = true;
      mantraAudioRef.current = audio;
      audio.play().catch(() => {});
      setMantraLoading(false);
    } catch {
      setMantraLoading(false);
      setActiveMantra(null);
    }
  }, [activeMantra, mantraVol]);

  // ─── Vibration ───
  const toggleVibe = useCallback(() => {
    if (vibeOn) {
      if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
      try { navigator.vibrate(0); } catch {}
      setVibeOn(false);
    } else {
      const pattern = activeFreq ? Math.max(50, Math.round(1000 / activeFreq.hz * 10)) : 200;
      const pulse = () => { try { navigator.vibrate([pattern, pattern]); } catch {} };
      pulse();
      vibeIntervalRef.current = setInterval(pulse, pattern * 2 + 50);
      setVibeOn(true);
    }
  }, [vibeOn, activeFreq]);

  useEffect(() => {
    if (vibeOn && activeFreq) {
      if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
      const pattern = Math.max(50, Math.round(1000 / activeFreq.hz * 10));
      const pulse = () => { try { navigator.vibrate([pattern, pattern]); } catch {} };
      vibeIntervalRef.current = setInterval(pulse, pattern * 2 + 50);
    }
  }, [activeFreq, vibeOn]);

  // ─── Stop All ───
  const stopAll = useCallback(() => {
    stopNodes(freqNodesRef);
    stopNodes(soundNodesRef);
    stopNodes(droneNodesRef);
    if (mantraAudioRef.current) { mantraAudioRef.current.pause(); mantraAudioRef.current = null; }
    if (vibeIntervalRef.current) clearInterval(vibeIntervalRef.current);
    try { navigator.vibrate(0); } catch {}
    setActiveFreq(null); setActiveSound(null); setActiveMantra(null);
    setActiveDrone(null); setVibeOn(false);
    setVisualLayers([]);
  }, []);

  useEffect(() => () => { stopAll(); if (ctxRef.current) try { ctxRef.current.close(); } catch {} }, [stopAll]);

  // Feed audio analyser data for fractal reactivity
  useEffect(() => {
    const hasFractal = visualLayers.some(l => l.type === 'fractal' && l.visible);
    if (!hasFractal || !analyserRef.current) return;
    let running = true;
    const read = () => {
      if (!running || !analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(analyserDataRef.current);
      requestAnimationFrame(read);
    };
    read();
    return () => { running = false; };
  }, [visualLayers]);

  // ─── Load Preset (must be after toggle functions) ───
  const loadPresetFn = useCallback(async (preset) => {
    stopAll();
    await new Promise(r => setTimeout(r, 100));

    const v = preset.volumes || {};
    if (v.masterVol !== undefined) setMasterVol(v.masterVol);
    if (v.freqVol !== undefined) setFreqVol(v.freqVol);
    if (v.soundVol !== undefined) setSoundVol(v.soundVol);
    if (v.mantraVol !== undefined) setMantraVol(v.mantraVol);
    if (v.droneVol !== undefined) setDroneVol(v.droneVol);

    const l = preset.layers || {};
    if (l.frequency) {
      const freq = FREQUENCIES.find(f => f.hz === l.frequency.hz);
      if (freq) setTimeout(() => toggleFreq(freq), 150);
    }
    if (l.sound) {
      const sound = SOUNDS.find(s => s.id === l.sound.id);
      if (sound) setTimeout(() => toggleSound(sound), 250);
    }
    if (l.drone) {
      const drone = INSTRUMENT_DRONES.find(d => d.id === l.drone.id);
      if (drone) setTimeout(() => toggleDrone(drone), 350);
    }
    if (l.mantra) {
      const mantra = MANTRAS.find(m => m.id === l.mantra.id);
      if (mantra) setTimeout(() => toggleMantra(mantra), 450);
    }
    // Load visual layers
    const newVisuals = [];
    if (l.visualStack) {
      l.visualStack.forEach(vs => newVisuals.push({ uid: `vl-${Date.now()}-${Math.random()}`, type: vs.type, itemId: vs.itemId, opacity: vs.opacity || 60, visible: true }));
    } else {
      if (l.light) newVisuals.push({ uid: `vl-${Date.now()}-l`, type: 'light', itemId: l.light.id, opacity: v.lightOpacity || 60, visible: true });
      if (l.video) newVisuals.push({ uid: `vl-${Date.now()}-v`, type: 'video', itemId: l.video.id, opacity: v.videoOpacity || 40, visible: true });
    }
    if (newVisuals.length) setVisualLayers(newVisuals);
    setShowPresets(false);
  }, [stopAll, toggleFreq, toggleSound, toggleDrone, toggleMantra]);

  // ─── Playlist Playback Engine ───
  const loadPresetByData = useCallback(async (presetData) => {
    stopAll();
    await new Promise(r => setTimeout(r, 100));
    const v = presetData.volumes || {};
    if (v.masterVol !== undefined) setMasterVol(v.masterVol);
    if (v.freqVol !== undefined) setFreqVol(v.freqVol);
    if (v.soundVol !== undefined) setSoundVol(v.soundVol);
    if (v.droneVol !== undefined) setDroneVol(v.droneVol);
    const l = presetData.layers || {};
    if (l.frequency) { const f = FREQUENCIES.find(x => x.hz === l.frequency.hz); if (f) setTimeout(() => toggleFreq(f), 150); }
    if (l.sound) { const s = SOUNDS.find(x => x.id === l.sound.id); if (s) setTimeout(() => toggleSound(s), 250); }
    if (l.drone) { const d = INSTRUMENT_DRONES.find(x => x.id === l.drone.id); if (d) setTimeout(() => toggleDrone(d), 350); }
    // Load visual layers
    const newVisuals = [];
    if (l.visualStack) {
      l.visualStack.forEach(vs => newVisuals.push({ uid: `vl-${Date.now()}-${Math.random()}`, type: vs.type, itemId: vs.itemId, opacity: vs.opacity || 60, visible: true }));
    } else {
      if (l.light) newVisuals.push({ uid: `vl-${Date.now()}-l`, type: 'light', itemId: l.light.id, opacity: v.lightOpacity || 60, visible: true });
      if (l.video) newVisuals.push({ uid: `vl-${Date.now()}-v`, type: 'video', itemId: l.video.id, opacity: v.videoOpacity || 40, visible: true });
    }
    if (newVisuals.length) setVisualLayers(newVisuals);
  }, [stopAll, toggleFreq, toggleSound, toggleDrone]);

  const startPlaylist = useCallback(async (playlist) => {
    if (!playlist.steps?.length) return;
    setActivePlaylist(playlist);
    setPlaylistStepIdx(0);
    setPlaylistElapsed(0);
    setPlaylistPaused(false);
    setShowPlaylists(false);
    // Load first step's preset
    const firstStep = playlist.steps[0];
    try {
      const res = await axios.get(`${API}/mixer-presets/featured`, { headers: authHeaders });
      const allPresets = res.data;
      const communityRes = await axios.get(`${API}/mixer-presets/community`, { headers: authHeaders });
      const allCombined = [...allPresets, ...communityRes.data];
      const preset = allCombined.find(p => p.id === firstStep.preset_id || p.name === firstStep.preset_name);
      if (preset) await loadPresetByData(preset);
    } catch {}
  }, [authHeaders, loadPresetByData]);

  // Playlist timer — ticks every second
  useEffect(() => {
    if (!activePlaylist || playlistPaused) {
      if (playlistTimerRef.current) clearInterval(playlistTimerRef.current);
      return;
    }
    playlistTimerRef.current = setInterval(() => {
      setPlaylistElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(playlistTimerRef.current);
  }, [activePlaylist, playlistPaused]);

  // Auto-advance when step duration exceeded
  useEffect(() => {
    if (!activePlaylist) return;
    const currentStep = activePlaylist.steps[playlistStepIdx];
    if (!currentStep) return;
    const stepDurationSec = currentStep.duration * 60;
    if (playlistElapsed >= stepDurationSec) {
      const nextIdx = playlistStepIdx + 1;
      if (nextIdx < activePlaylist.steps.length) {
        setPlaylistStepIdx(nextIdx);
        setPlaylistElapsed(0);
        // Load next preset
        const nextStep = activePlaylist.steps[nextIdx];
        (async () => {
          try {
            const res = await axios.get(`${API}/mixer-presets/featured`, { headers: authHeaders });
            const communityRes = await axios.get(`${API}/mixer-presets/community`, { headers: authHeaders });
            const all = [...res.data, ...communityRes.data];
            const preset = all.find(p => p.id === nextStep.preset_id || p.name === nextStep.preset_name);
            if (preset) await loadPresetByData(preset);
          } catch {}
        })();
      } else {
        // Playlist complete
        setActivePlaylist(null);
        stopAll();
      }
    }
  }, [playlistElapsed, activePlaylist, playlistStepIdx, authHeaders, loadPresetByData, stopAll]);

  const skipPlaylistStep = useCallback(async (direction) => {
    if (!activePlaylist) return;
    const nextIdx = playlistStepIdx + direction;
    if (nextIdx < 0 || nextIdx >= activePlaylist.steps.length) return;
    setPlaylistStepIdx(nextIdx);
    setPlaylistElapsed(0);
    const step = activePlaylist.steps[nextIdx];
    try {
      const res = await axios.get(`${API}/mixer-presets/featured`, { headers: authHeaders });
      const communityRes = await axios.get(`${API}/mixer-presets/community`, { headers: authHeaders });
      const all = [...res.data, ...communityRes.data];
      const preset = all.find(p => p.id === step.preset_id || p.name === step.preset_name);
      if (preset) await loadPresetByData(preset);
    } catch {}
  }, [activePlaylist, playlistStepIdx, authHeaders, loadPresetByData]);

  const stopPlaylist = useCallback(() => {
    setActivePlaylist(null);
    setPlaylistStepIdx(0);
    setPlaylistElapsed(0);
    if (playlistTimerRef.current) clearInterval(playlistTimerRef.current);
    stopAll();
  }, [stopAll]);

  // ─── Recording Engine ───
  const getFullSnapshot = useCallback(() => {
    return {
      frequency: activeFreq ? { hz: activeFreq.hz, label: activeFreq.label } : null,
      sound: activeSound ? { id: activeSound.id } : null,
      drone: activeDrone ? { id: activeDrone.id } : null,
      mantra: activeMantra ? { id: activeMantra.id } : null,
      visualLayers: visualLayers.map(l => ({ type: l.type, itemId: l.itemId, opacity: l.opacity, visible: l.visible })),
      volumes: { masterVol, freqVol, soundVol, mantraVol, droneVol },
    };
  }, [activeFreq, activeSound, activeDrone, activeMantra, visualLayers, masterVol, freqVol, soundVol, mantraVol, droneVol]);

  const startRecording = useCallback(() => {
    const snapshot = getFullSnapshot();
    setRecordingTimeline([{ time_sec: 0, state: snapshot }]);
    setRecordingElapsed(0);
    setIsRecording(true);
  }, [getFullSnapshot]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (recordSnapshotRef.current) clearInterval(recordSnapshotRef.current);
    setShowSaveRecording(true);
  }, []);

  // Recording timer + periodic snapshot capture
  useEffect(() => {
    if (!isRecording) return;
    recordTimerRef.current = setInterval(() => {
      setRecordingElapsed(prev => prev + 1);
    }, 1000);
    recordSnapshotRef.current = setInterval(() => {
      const snapshot = getFullSnapshot();
      setRecordingTimeline(prev => [...prev, { time_sec: prev.length > 0 ? prev[prev.length - 1].time_sec + 2 : 0, state: snapshot }]);
    }, 2000); // Capture state every 2 seconds
    return () => {
      clearInterval(recordTimerRef.current);
      clearInterval(recordSnapshotRef.current);
    };
  }, [isRecording, getFullSnapshot]);

  const saveRecording = useCallback(async () => {
    try {
      await axios.post(`${API}/media-library`, {
        title: recordTitle || 'Untitled Session',
        description: recordDesc,
        media_type: 'mix_recording',
        duration_seconds: recordingElapsed,
        timeline: recordingTimeline,
        mixer_snapshot: recordingTimeline.length > 0 ? recordingTimeline[0].state : {},
        thumbnail_layers: visualLayers.map(l => ({ type: l.type, itemId: l.itemId })),
        is_public: recordPublic,
        tags: [],
      }, { headers: authHeaders });
      setShowSaveRecording(false);
      setRecordTitle('');
      setRecordDesc('');
      setRecordPublic(false);
      setRecordingTimeline([]);
    } catch {}
  }, [recordTitle, recordDesc, recordPublic, recordingElapsed, recordingTimeline, visualLayers, authHeaders]);

  // ─── Live Broadcast (send mixer state to live session participants) ───
  const broadcastMixerState = useCallback(() => {
    if (!broadcastMode || !broadcastWsRef.current) return;
    try {
      broadcastWsRef.current.send(JSON.stringify({
        type: 'mixer_sync',
        visual_layers: visualLayers.map(l => ({ type: l.type, itemId: l.itemId, opacity: l.opacity, visible: l.visible })),
        audio_state: {
          frequency: activeFreq ? { hz: activeFreq.hz, label: activeFreq.label } : null,
          sound: activeSound ? { id: activeSound.id } : null,
          drone: activeDrone ? { id: activeDrone.id } : null,
        },
      }));
    } catch {}
  }, [broadcastMode, visualLayers, activeFreq, activeSound, activeDrone]);

  // Auto-broadcast when mixer state changes in broadcast mode
  useEffect(() => {
    if (broadcastMode) broadcastMixerState();
  }, [broadcastMode, broadcastMixerState]);

  const hasActive = activeFreq || activeSound || activeMantra || activeDrone || vibeOn || visualLayers.length > 0;
  const activeCount = [activeFreq, activeSound, activeMantra, activeDrone, vibeOn].filter(Boolean).length + visualLayers.length;

  if (!user) return null;

  const panelMaxH = fullScreen ? '85vh' : expanded ? '70vh' : '380px';

  return (
    <>
      {/* Multi-Layer Visual Overlays */}
      {visualLayers.filter(l => l.visible).map((layer, i) => {
        if (layer.type === 'light') {
          const mode = LIGHT_MODES.find(m => m.id === layer.itemId);
          if (!mode) return null;
          return (
            <div key={layer.uid} className="fixed inset-0 pointer-events-none" style={{ zIndex: 30 + i, opacity: layer.opacity / 100 }} data-testid={`overlay-${layer.uid}`}>
              <LightOverlay mode={mode} />
            </div>
          );
        }
        if (layer.type === 'video') {
          const vid = VIDEO_OVERLAYS.find(v => v.id === layer.itemId);
          if (!vid) return null;
          return (
            <div key={layer.uid} className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 30 + i, opacity: layer.opacity / 100 }} data-testid={`overlay-${layer.uid}`}>
              <video src={vid.url} autoPlay loop muted playsInline className="w-full h-full object-cover" style={{ mixBlendMode: 'screen' }} />
            </div>
          );
        }
        if (layer.type === 'fractal') {
          return (
            <div key={layer.uid} style={{ zIndex: 30 + i }} data-testid={`overlay-${layer.uid}`}>
              <FractalVisualizer type={layer.itemId} opacity={layer.opacity / 100} audioData={analyserDataRef.current} colorShift={i} />
            </div>
          );
        }
        if (layer.type === 'filter') {
          const filter = VISUAL_FILTERS.find(f => f.id === layer.itemId);
          if (!filter) return null;
          const intensity = layer.opacity / 100;
          const cssFilter = filter.css(intensity);
          if (filter.hasCanvas) {
            return (
              <div key={layer.uid} className="fixed inset-0 pointer-events-none" style={{ zIndex: 30 + i, opacity: intensity * 0.6, mixBlendMode: 'overlay' }} data-testid={`overlay-${layer.uid}`}>
                {layer.itemId === 'film-grain' && <GrainOverlay intensity={intensity} />}
                {layer.itemId === 'vhs-retro' && <VHSOverlay intensity={intensity} />}
                {layer.itemId === 'chromatic' && <ChromaticOverlay intensity={intensity} />}
                {layer.itemId === 'kaleidoscope' && <KaleidoOverlay intensity={intensity} />}
              </div>
            );
          }
          return (
            <div key={layer.uid} className="fixed inset-0 pointer-events-none" style={{ zIndex: 30 + i, filter: cssFilter }} data-testid={`overlay-${layer.uid}`} />
          );
        }
        return null;
      })}

      {/* Floating Mixer Button */}
      {!open && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: hasActive ? 'rgba(192,132,252,0.2)' : 'rgba(22,24,38,0.9)',
            border: `1px solid ${hasActive ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.06)'}`,
            backdropFilter: 'blur(16px)',
            boxShadow: hasActive ? '0 0 20px rgba(192,132,252,0.15)' : '0 4px 20px rgba(0,0,0,0.3)',
          }}
          data-testid="mixer-toggle">
          <Sliders size={18} style={{ color: hasActive ? '#C084FC' : 'var(--text-muted)' }} />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center"
              style={{ background: '#C084FC', color: '#fff' }}>{activeCount}</span>
          )}
        </motion.button>
      )}

      {/* Mixer Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={() => { if (!fullScreen) setOpen(false); }}
              data-testid="mixer-backdrop" />
            <motion.div
              initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed z-50 rounded-t-2xl ${fullScreen ? 'inset-x-0 bottom-0' : 'bottom-0 left-0 right-0'}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(8,8,18,0.98)',
                border: '1px solid rgba(192,132,252,0.1)',
                borderBottom: 'none',
                backdropFilter: 'blur(32px)',
                maxHeight: panelMaxH,
                overflowY: 'auto',
                scrollbarWidth: 'none',
              }}
              data-testid="cosmic-mixer-panel">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 sticky top-0 z-10"
                style={{ background: 'rgba(8,8,18,0.98)', borderBottom: '1px solid rgba(192,132,252,0.06)' }}>
                <div className="flex items-center gap-2">
                  <Sliders size={14} style={{ color: '#C084FC' }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#C084FC' }}>
                    Production Console
                  </span>
                  {activeCount > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(192,132,252,0.15)', color: '#C084FC' }}>
                      {activeCount} active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {/* Record button */}
                  {hasActive && !isRecording && (
                    <button onClick={startRecording} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: 'var(--text-muted)' }} data-testid="mixer-record" title="Record Session">
                      <Circle size={12} />
                    </button>
                  )}
                  {isRecording && (
                    <button onClick={stopRecording} className="p-1.5 rounded-lg transition-colors flex items-center gap-1" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }} data-testid="mixer-stop-record" title="Stop Recording">
                      <Circle size={10} className="fill-current animate-pulse" />
                      <span className="text-[8px] tabular-nums">{Math.floor(recordingElapsed / 60)}:{String(recordingElapsed % 60).padStart(2, '0')}</span>
                    </button>
                  )}
                  {/* Broadcast mode */}
                  <button onClick={() => setBroadcastMode(b => !b)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ background: broadcastMode ? 'rgba(59,130,246,0.15)' : 'transparent', color: broadcastMode ? '#3B82F6' : 'var(--text-muted)' }}
                    data-testid="mixer-broadcast" title={broadcastMode ? 'Broadcasting to Live Session' : 'Enable Live Broadcast'}>
                    <Radio size={12} />
                  </button>
                  {hasActive && (
                    <button onClick={stopAll} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: '#EF4444' }} data-testid="mixer-stop-all" title="Stop All">
                      <Square size={12} />
                    </button>
                  )}
                  <button onClick={() => setFullScreen(!fullScreen)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }} title={fullScreen ? 'Minimize' : 'Maximize'}>
                    {fullScreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                  </button>
                  <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
                    {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
                  <button onClick={() => { setOpen(false); setFullScreen(false); }} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }} data-testid="mixer-close">
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="px-5 pb-5 space-y-4">
                {/* Presets & Journeys Toolbar */}
                {activePlaylist && (
                  <PlaylistNowPlaying
                    playlist={activePlaylist}
                    stepIdx={playlistStepIdx}
                    elapsed={playlistElapsed}
                    paused={playlistPaused}
                    onPause={() => setPlaylistPaused(p => !p)}
                    onSkip={skipPlaylistStep}
                    onStop={stopPlaylist}
                  />
                )}
                <div className="flex items-center gap-2 py-1">
                  <button onClick={() => { setShowPresets(!showPresets); setShowPlaylists(false); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-[1.02]"
                    style={{
                      background: showPresets ? 'rgba(192,132,252,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${showPresets ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.05)'}`,
                      color: showPresets ? '#C084FC' : 'var(--text-muted)',
                    }}
                    data-testid="presets-browse-btn">
                    <Star size={10} /> Presets
                  </button>
                  <button onClick={() => { setShowPlaylists(!showPlaylists); setShowPresets(false); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-[1.02]"
                    style={{
                      background: showPlaylists ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${showPlaylists ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)'}`,
                      color: showPlaylists ? '#3B82F6' : 'var(--text-muted)',
                    }}
                    data-testid="playlists-browse-btn">
                    <Play size={10} /> Journeys
                  </button>
                  {hasActive && (
                    <button onClick={() => setShowSaveModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-[1.02]"
                      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', color: '#22C55E' }}
                      data-testid="presets-save-btn">
                      <Save size={10} /> Save Mix
                    </button>
                  )}
                  <a href="/my-creations"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', textDecoration: 'none' }}
                    data-testid="library-link">
                    <Library size={10} /> My Library
                  </a>
                </div>

                {/* Presets Browser */}
                <AnimatePresence>
                  {showPresets && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="rounded-xl p-3 mb-2" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
                        {/* Tabs */}
                        <div className="flex gap-1 mb-3" data-testid="presets-tabs">
                          {[
                            { id: 'featured', label: 'Staff Picks', icon: Star },
                            { id: 'community', label: 'Community', icon: Users },
                            { id: 'mine', label: 'My Presets', icon: Lock },
                          ].map(t => (
                            <button key={t.id} onClick={() => setPresetsTab(t.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-medium transition-all"
                              style={{
                                background: presetsTab === t.id ? 'rgba(192,132,252,0.1)' : 'transparent',
                                color: presetsTab === t.id ? '#C084FC' : 'var(--text-muted)',
                              }}
                              data-testid={`presets-tab-${t.id}`}>
                              <t.icon size={9} /> {t.label}
                            </button>
                          ))}
                        </div>
                        {/* Preset Cards */}
                        {presetsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
                          </div>
                        ) : presets.length === 0 ? (
                          <p className="text-[10px] text-center py-4" style={{ color: 'var(--text-muted)' }}>
                            {presetsTab === 'mine' ? 'No saved presets yet. Activate layers and tap Save Mix!' : 'No presets found.'}
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                            {presets.map(p => (
                              <PresetCard key={p.id} preset={p} userId={user?.id}
                                onLoad={() => loadPresetFn(p)}
                                onLike={() => toggleLike(p.id)}
                                onDelete={presetsTab === 'mine' ? () => deletePreset(p.id) : null} />
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Save Modal */}
                <AnimatePresence>
                  {showSaveModal && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="rounded-xl p-4 mb-2" style={{ background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.1)' }}
                        data-testid="save-preset-form">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#22C55E' }}>Save Current Mix</p>
                        <input type="text" placeholder="Preset name..." value={saveName} onChange={e => setSaveName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-xs mb-2 outline-none"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}
                          data-testid="save-preset-name" />
                        <input type="text" placeholder="Description (optional)..." value={saveDesc} onChange={e => setSaveDesc(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-xs mb-3 outline-none"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}
                          data-testid="save-preset-desc" />
                        <div className="flex items-center justify-between">
                          <button onClick={() => setSavePublic(v => !v)}
                            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                            style={{
                              background: savePublic ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${savePublic ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)'}`,
                              color: savePublic ? '#3B82F6' : 'var(--text-muted)',
                            }}
                            data-testid="save-preset-public">
                            {savePublic ? <Globe size={10} /> : <Lock size={10} />}
                            {savePublic ? 'Share with Community' : 'Private'}
                          </button>
                          <div className="flex gap-1.5">
                            <button onClick={() => setShowSaveModal(false)}
                              className="px-3 py-1.5 rounded-lg text-[10px]"
                              style={{ color: 'var(--text-muted)' }}>Cancel</button>
                            <button onClick={savePreset}
                              className="px-4 py-1.5 rounded-lg text-[10px] font-medium"
                              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E' }}
                              data-testid="save-preset-submit">
                              <Save size={10} className="inline mr-1" /> Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Save Recording Modal */}
                <AnimatePresence>
                  {showSaveRecording && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="rounded-xl p-4 mb-2" style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)' }}
                        data-testid="save-recording-form">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#EF4444' }}>Save Recording to Library</p>
                        <p className="text-[8px] mb-3" style={{ color: 'var(--text-muted)' }}>
                          {Math.floor(recordingElapsed / 60)}:{String(recordingElapsed % 60).padStart(2, '0')} recorded
                          — {recordingTimeline.length} snapshots captured
                        </p>
                        <input type="text" placeholder="Title..." value={recordTitle} onChange={e => setRecordTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-xs mb-2 outline-none"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}
                          data-testid="record-title" />
                        <input type="text" placeholder="Description (optional)..." value={recordDesc} onChange={e => setRecordDesc(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-xs mb-3 outline-none"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}
                          data-testid="record-desc" />
                        <div className="flex items-center justify-between">
                          <button onClick={() => setRecordPublic(v => !v)}
                            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg transition-all"
                            style={{ background: recordPublic ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${recordPublic ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)'}`, color: recordPublic ? '#3B82F6' : 'var(--text-muted)' }}
                            data-testid="record-public-toggle">
                            {recordPublic ? <Globe size={10} /> : <Lock size={10} />}
                            {recordPublic ? 'Share with Community' : 'Private'}
                          </button>
                          <div className="flex gap-1.5">
                            <button onClick={() => { setShowSaveRecording(false); setRecordingTimeline([]); }}
                              className="px-3 py-1.5 rounded-lg text-[10px]" style={{ color: 'var(--text-muted)' }}>Discard</button>
                            <button onClick={saveRecording}
                              className="px-4 py-1.5 rounded-lg text-[10px] font-medium"
                              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }}
                              data-testid="record-save-submit">
                              <Save size={10} className="inline mr-1" /> Save to Library
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Playlists Browser */}
                <AnimatePresence>
                  {showPlaylists && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="rounded-xl p-3 mb-2" style={{ background: 'rgba(59,130,246,0.02)', border: '1px solid rgba(59,130,246,0.06)' }}>
                        <div className="flex gap-1 mb-3" data-testid="playlists-tabs">
                          {[
                            { id: 'featured', label: 'Curated', icon: Star },
                            { id: 'community', label: 'Community', icon: Users },
                            { id: 'mine', label: 'My Journeys', icon: Lock },
                          ].map(t => (
                            <button key={t.id} onClick={() => setPlaylistsTab(t.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-medium transition-all"
                              style={{
                                background: playlistsTab === t.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                                color: playlistsTab === t.id ? '#3B82F6' : 'var(--text-muted)',
                              }}
                              data-testid={`playlists-tab-${t.id}`}>
                              <t.icon size={9} /> {t.label}
                            </button>
                          ))}
                        </div>
                        {playlistsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
                          </div>
                        ) : playlists.length === 0 ? (
                          <p className="text-[10px] text-center py-4" style={{ color: 'var(--text-muted)' }}>No journeys found.</p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                            {playlists.map(pl => (
                              <PlaylistCard key={pl.id} playlist={pl} userId={user?.id}
                                isPlaying={activePlaylist?.id === pl.id}
                                onStart={() => startPlaylist(pl)}
                                onStop={stopPlaylist} />
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Master Fader */}
                <div className="flex items-center gap-3 py-1">
                  <button onClick={() => setMuted(m => !m)} className="p-1" data-testid="mixer-mute">
                    {muted ? <VolumeX size={14} style={{ color: 'var(--text-muted)' }} /> : <Volume2 size={14} style={{ color: '#C084FC' }} />}
                  </button>
                  <span className="text-[9px] uppercase tracking-wider w-14 font-bold" style={{ color: 'var(--text-muted)' }}>Master</span>
                  <Fader value={muted ? 0 : masterVol} onChange={v => { setMasterVol(v); setMuted(false); }} color="#C084FC" testId="mixer-volume" />
                  <span className="text-[9px] w-7 text-right tabular-nums" style={{ color: 'var(--text-muted)' }}>{masterVol}%</span>
                </div>

                {/* ── Channel Strips ── */}

                {/* Frequency */}
                <ChannelStrip title="Frequency" icon={Waves} active={activeFreq} color="#C084FC"
                  volume={freqVol} onVolumeChange={setFreqVol}>
                  <div className="flex flex-wrap gap-1.5">
                    {FREQUENCIES.map(f => (
                      <ChipButton key={f.hz} active={activeFreq?.hz === f.hz} color={f.color}
                        onClick={() => toggleFreq(f)} testId={`mixer-freq-${f.hz}`}>{f.label}</ChipButton>
                    ))}
                  </div>
                </ChannelStrip>

                {/* Ambient Sound */}
                <ChannelStrip title="Ambient" icon={Volume2} active={activeSound} color="#3B82F6"
                  volume={soundVol} onVolumeChange={setSoundVol}>
                  <div className="flex flex-wrap gap-1.5">
                    {SOUNDS.map(s => (
                      <ChipButton key={s.id} active={activeSound?.id === s.id} color={s.color}
                        onClick={() => toggleSound(s)} testId={`mixer-sound-${s.id}`}>{s.label}</ChipButton>
                    ))}
                  </div>
                </ChannelStrip>

                {/* Instrument Drones */}
                <ChannelStrip title="Instrument" icon={Music} active={activeDrone} color="#F59E0B"
                  volume={droneVol} onVolumeChange={setDroneVol}>
                  <div className="flex flex-wrap gap-1.5">
                    {INSTRUMENT_DRONES.map(d => (
                      <ChipButton key={d.id} active={activeDrone?.id === d.id} color={d.color}
                        onClick={() => toggleDrone(d)} testId={`mixer-drone-${d.id}`}>{d.label}</ChipButton>
                    ))}
                  </div>
                </ChannelStrip>

                {/* Mantra */}
                <ChannelStrip title="Mantra" icon={BookOpen} active={activeMantra} color="#2DD4BF"
                  volume={mantraVol} onVolumeChange={setMantraVol}>
                  <div className="flex flex-wrap gap-1.5">
                    {MANTRAS.map(m => (
                      <ChipButton key={m.id} active={activeMantra?.id === m.id} color={m.color}
                        onClick={() => toggleMantra(m)} testId={`mixer-mantra-${m.id}`}
                        disabled={mantraLoading && activeMantra?.id !== m.id}>
                        {mantraLoading && activeMantra?.id === m.id && <Loader2 size={8} className="animate-spin" />}
                        {m.label}
                      </ChipButton>
                    ))}
                  </div>
                  {activeMantra && <p className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{activeMantra.tradition} tradition</p>}
                </ChannelStrip>

                {/* ── Visual Layers Mixing Board ── */}
                <VisualLayersMixer layers={visualLayers} onLayersChange={setVisualLayers} />

                {/* Haptic / Vibration */}
                <ChannelStrip title="Haptic" icon={Vibrate} active={vibeOn} color="#FB923C" noFader>
                  <button onClick={toggleVibe}
                    className="text-[10px] px-3 py-2 rounded-full transition-all flex items-center gap-2"
                    style={{
                      background: vibeOn ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.03)',
                      color: vibeOn ? '#FB923C' : 'var(--text-muted)',
                      border: `1px solid ${vibeOn ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                    data-testid="mixer-vibe-toggle">
                    <Vibrate size={12} />
                    {vibeOn ? 'Active' : 'Enable Pulse'}
                  </button>
                  <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    {activeFreq ? `Synced to ${activeFreq.label}` : 'Pulses at a calm rhythm'}
                  </p>
                </ChannelStrip>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Channel Strip Component ─── */
function ChannelStrip({ title, icon: Icon, active, color, volume, onVolumeChange, faderLabel, noFader, children }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={12} style={{ color: active ? color : 'var(--text-muted)' }} />
          <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: active ? color : 'var(--text-muted)' }}>
            {title}
          </span>
          {active && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />}
        </div>
        {!noFader && active && (
          <div className="flex items-center gap-2">
            <span className="text-[8px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{faderLabel || 'Vol'}</span>
            <Fader value={volume} onChange={onVolumeChange} color={color} size="sm" />
            <span className="text-[8px] w-6 text-right tabular-nums" style={{ color: 'var(--text-muted)' }}>{volume}%</span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

/* ─── Fader / Slider ─── */
function Fader({ value, onChange, color, size, testId }) {
  const w = size === 'sm' ? 'w-20' : 'flex-1';
  return (
    <input type="range" min={0} max={100} value={value}
      onChange={e => onChange(parseInt(e.target.value))}
      className={`${w} h-1 rounded-full appearance-none cursor-pointer`}
      style={{ background: `linear-gradient(to right, ${color} ${value}%, rgba(255,255,255,0.06) ${value}%)`, accentColor: color }}
      data-testid={testId} />
  );
}

/* ─── Chip Button ─── */
function ChipButton({ active, color, onClick, testId, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="text-[10px] px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1"
      style={{
        background: active ? `${color}20` : 'rgba(255,255,255,0.03)',
        color: active ? color : 'var(--text-muted)',
        border: `1px solid ${active ? `${color}40` : 'rgba(255,255,255,0.05)'}`,
        opacity: disabled ? 0.5 : 1,
      }}
      data-testid={testId}>
      {children}
    </button>
  );
}

/* ─── Light Therapy Overlay ─── */
function LightOverlay({ mode }) {
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setColorIdx(i => (i + 1) % mode.colors.length);
    }, mode.speed);
    return () => clearInterval(iv);
  }, [mode]);

  const currentColor = mode.colors[colorIdx];
  const nextColor = mode.colors[(colorIdx + 1) % mode.colors.length];
  const prevColor = mode.colors[(colorIdx - 1 + mode.colors.length) % mode.colors.length];

  return (
    <div className="w-full h-full" style={{ position: 'relative' }}>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 90% 70% at 50% 40%, ${currentColor}55 0%, ${nextColor}30 40%, transparent 75%)`,
        transition: `background ${mode.speed / 1000}s ease-in-out`,
      }} />
      <div className="absolute inset-0" style={{
        background: `linear-gradient(135deg, ${prevColor}20 0%, transparent 40%, ${currentColor}25 70%, ${nextColor}15 100%)`,
        transition: `background ${mode.speed / 1200}s ease-in-out`,
      }} />
      <div className="absolute inset-0" style={{
        background: `radial-gradient(circle at 50% 50%, ${currentColor}35 0%, transparent 60%)`,
        animation: `lightPulse ${mode.speed / 1000 * 1.5}s ease-in-out infinite alternate`,
      }} />
      <style>{`
        @keyframes lightPulse {
          0% { opacity: 0.4; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

/* ─── Canvas Filter Overlays ─── */
function GrainOverlay({ intensity }) {
  const canvasRef = React.useRef(null);
  const frameRef = React.useRef(null);
  React.useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    c.width = window.innerWidth / 3; c.height = window.innerHeight / 3;
    const render = () => {
      const d = ctx.createImageData(c.width, c.height);
      const g = intensity * 80;
      for (let i = 0; i < d.data.length; i += 4) {
        const v = (Math.random() - 0.5) * g;
        d.data[i] = d.data[i+1] = d.data[i+2] = 128 + v;
        d.data[i+3] = Math.abs(v) * 1.5;
      }
      ctx.putImageData(d, 0, 0);
      frameRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frameRef.current);
  }, [intensity]);
  return <canvas ref={canvasRef} className="w-full h-full" style={{ mixBlendMode: 'overlay' }} />;
}

function VHSOverlay({ intensity }) {
  const [scan, setScan] = React.useState(0);
  React.useEffect(() => {
    const iv = setInterval(() => setScan(Math.random() * 100), 100);
    return () => clearInterval(iv);
  }, []);
  return (
    <>
      <div className="absolute inset-0" style={{ background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,${intensity * 0.08}) 2px, rgba(0,0,0,${intensity * 0.08}) 4px)` }} />
      <div className="absolute left-0 right-0 h-1" style={{ top: `${scan}%`, background: `rgba(255,255,255,${intensity * 0.15})`, filter: 'blur(1px)' }} />
    </>
  );
}

function ChromaticOverlay({ intensity }) {
  const offset = Math.round(intensity * 6);
  return (
    <>
      <div className="absolute inset-0" style={{ background: `rgba(255,0,0,${intensity * 0.05})`, transform: `translateX(${offset}px)`, mixBlendMode: 'screen' }} />
      <div className="absolute inset-0" style={{ background: `rgba(0,0,255,${intensity * 0.05})`, transform: `translateX(${-offset}px)`, mixBlendMode: 'screen' }} />
    </>
  );
}

function KaleidoOverlay({ intensity }) {
  const canvasRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const tRef = React.useRef(0);
  React.useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    c.width = 400; c.height = 400;
    const render = () => {
      tRef.current += 0.02;
      ctx.clearRect(0, 0, 400, 400);
      const segs = 8 + Math.floor(intensity * 8);
      for (let s = 0; s < segs; s++) {
        ctx.save();
        ctx.translate(200, 200);
        ctx.rotate((s / segs) * Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(180 * Math.cos(tRef.current + s * 0.5), 180 * Math.sin(tRef.current * 1.3 + s * 0.3));
        ctx.strokeStyle = `hsla(${s * (360 / segs) + tRef.current * 30}, 80%, 60%, ${0.3 + intensity * 0.3})`;
        ctx.lineWidth = 1 + intensity * 2;
        ctx.stroke();
        ctx.restore();
      }
      frameRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frameRef.current);
  }, [intensity]);
  return <canvas ref={canvasRef} className="w-full h-full" style={{ mixBlendMode: 'screen' }} />;
}



/* ─── Preset Card ─── */
function PresetCard({ preset, userId, onLoad, onLike, onDelete }) {
  const layerKeys = Object.keys(preset.layers || {});
  const isLiked = (preset.likes || []).includes(userId);

  return (
    <div className="rounded-xl p-2.5 transition-all hover:bg-white/[0.02] group"
      style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}
      data-testid={`preset-card-${preset.id}`}>
      <div className="flex items-start justify-between mb-1.5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{preset.name}</p>
          {preset.description && (
            <p className="text-[8px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{preset.description}</p>
          )}
        </div>
        {preset.is_featured && <Star size={8} className="flex-shrink-0 mt-0.5 fill-current" style={{ color: '#FCD34D' }} />}
      </div>
      {/* Layer indicators */}
      <div className="flex flex-wrap gap-1 mb-2">
        {layerKeys.map(k => (
          <span key={k} className="text-[7px] px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(192,132,252,0.06)', color: 'rgba(192,132,252,0.6)' }}>
            {k}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button onClick={onLoad}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)', color: '#C084FC' }}
          data-testid={`preset-load-${preset.id}`}>
          <Play size={8} /> Load
        </button>
        <div className="flex items-center gap-1.5">
          {onLike && (
            <button onClick={onLike} className="flex items-center gap-0.5 text-[8px] transition-all"
              style={{ color: isLiked ? '#EF4444' : 'var(--text-muted)' }}
              data-testid={`preset-like-${preset.id}`}>
              <Heart size={9} className={isLiked ? 'fill-current' : ''} />
              {preset.like_count || 0}
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-0.5 transition-all opacity-0 group-hover:opacity-100"
              style={{ color: 'var(--text-muted)' }}
              data-testid={`preset-delete-${preset.id}`}>
              <Trash2 size={9} />
            </button>
          )}
        </div>
      </div>
      {preset.creator_name && preset.creator_name !== 'Cosmic Collective' && (
        <p className="text-[7px] mt-1.5" style={{ color: 'rgba(255,255,255,0.15)' }}>by {preset.creator_name}</p>
      )}
    </div>
  );
}


/* ─── Playlist Card ─── */
function PlaylistCard({ playlist, userId, isPlaying, onStart, onStop }) {
  const totalMin = playlist.total_minutes || playlist.steps?.reduce((a, s) => a + s.duration, 0) || 0;

  return (
    <div className="rounded-xl p-3 transition-all"
      style={{
        background: isPlaying ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.01)',
        border: `1px solid ${isPlaying ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)'}`,
      }}
      data-testid={`playlist-card-${playlist.id}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>
            {playlist.name}
            {playlist.is_featured && <Star size={7} className="inline ml-1 fill-current" style={{ color: '#FCD34D' }} />}
          </p>
          {playlist.description && (
            <p className="text-[8px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{playlist.description}</p>
          )}
        </div>
        <span className="text-[8px] flex-shrink-0 px-1.5 py-0.5 rounded-full ml-2"
          style={{ background: 'rgba(59,130,246,0.06)', color: '#60A5FA' }}>
          {totalMin}min
        </span>
      </div>
      {/* Steps */}
      <div className="flex items-center gap-1 mb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {playlist.steps?.map((step, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="w-2 h-px flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />}
            <span className="text-[7px] px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap"
              style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.04)' }}>
              {step.preset_name} ({step.duration}m)
            </span>
          </React.Fragment>
        ))}
      </div>
      <button onClick={isPlaying ? onStop : onStart}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-medium transition-all hover:scale-105"
        style={{
          background: isPlaying ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.08)',
          border: `1px solid ${isPlaying ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.15)'}`,
          color: isPlaying ? '#EF4444' : '#3B82F6',
        }}
        data-testid={`playlist-${isPlaying ? 'stop' : 'start'}-${playlist.id}`}>
        {isPlaying ? <><Square size={8} /> Stop Journey</> : <><Play size={8} /> Begin Journey</>}
      </button>
      {playlist.creator_name && playlist.creator_name !== 'Cosmic Collective' && (
        <p className="text-[7px] mt-1.5" style={{ color: 'rgba(255,255,255,0.15)' }}>by {playlist.creator_name}</p>
      )}
    </div>
  );
}

/* ─── Now Playing Bar (Playlist Playback) ─── */
function PlaylistNowPlaying({ playlist, stepIdx, elapsed, paused, onPause, onSkip, onStop }) {
  const currentStep = playlist.steps?.[stepIdx];
  if (!currentStep) return null;

  const stepDurationSec = currentStep.duration * 60;
  const progress = Math.min((elapsed / stepDurationSec) * 100, 100);
  const totalSteps = playlist.steps.length;
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;

  return (
    <div className="rounded-xl p-3 mb-2" style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)' }}
      data-testid="playlist-now-playing">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: paused ? '#F59E0B' : '#3B82F6' }} />
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider truncate" style={{ color: '#3B82F6' }}>
              {paused ? 'Paused' : 'Now Playing'} — {playlist.name}
            </p>
            <p className="text-[8px] truncate" style={{ color: 'var(--text-muted)' }}>
              Step {stepIdx + 1}/{totalSteps}: {currentStep.preset_name}
            </p>
          </div>
        </div>
        <span className="text-[9px] tabular-nums flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
          {elapsedMin}:{String(elapsedSec).padStart(2, '0')} / {currentStep.duration}:00
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1 rounded-full mb-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, background: 'linear-gradient(to right, #3B82F6, #8B5CF6)' }} />
      </div>
      {/* Step dots */}
      <div className="flex items-center gap-1 mb-2">
        {playlist.steps.map((s, i) => (
          <div key={i} className="flex-1 h-1 rounded-full" style={{
            background: i < stepIdx ? '#22C55E' : i === stepIdx ? '#3B82F6' : 'rgba(255,255,255,0.06)',
          }} title={s.preset_name} />
        ))}
      </div>
      {/* Controls */}
      <div className="flex items-center gap-1.5">
        <button onClick={() => onSkip(-1)} disabled={stepIdx === 0}
          className="p-1.5 rounded-lg text-[9px] transition-all disabled:opacity-30"
          style={{ color: 'var(--text-muted)' }} data-testid="playlist-prev">
          <ChevronDown size={10} className="rotate-90" />
        </button>
        <button onClick={onPause}
          className="p-1.5 rounded-lg transition-all"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}
          data-testid="playlist-pause">
          {paused ? <Play size={12} /> : <Pause size={12} />}
        </button>
        <button onClick={() => onSkip(1)} disabled={stepIdx === totalSteps - 1}
          className="p-1.5 rounded-lg text-[9px] transition-all disabled:opacity-30"
          style={{ color: 'var(--text-muted)' }} data-testid="playlist-next">
          <ChevronUp size={10} className="rotate-90" />
        </button>
        <button onClick={onStop}
          className="ml-auto p-1.5 rounded-lg transition-all hover:bg-red-500/10"
          style={{ color: '#EF4444' }} data-testid="playlist-stop">
          <Square size={10} />
        </button>
      </div>
    </div>
  );
}
