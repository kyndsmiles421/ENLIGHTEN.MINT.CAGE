import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, Volume2, VolumeX, Plus, Trash2, Save, FolderOpen,
  Sliders, Lock, Zap, Waves, Sparkles, ChevronDown, ChevronUp,
  Crown, Layers, Music, Eye, Radio, X, Loader2, Play, Square,
  ToggleLeft, ToggleRight, ArrowUpRight, Ghost, Star,
} from 'lucide-react';
import { NanoGuide } from '../components/NanoGuide';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ━━━ Constants ━━━ */
const BEAD_SIZE = 24;
const COLUMN_WIDTH = 50;
const HEAVEN_COUNT = 2;
const EARTH_COUNT = 5;
const HEAVEN_VALUE = 5;
const COLUMNS = [
  { label: '100s', multiplier: 100 },
  { label: '10s', multiplier: 10 },
  { label: '1s', multiplier: 1 },
  { label: '.1s', multiplier: 0.1 },
];

const TRACK_TYPE_META = {
  phonic_tone: { icon: Radio, color: '#60A5FA', label: 'Phonic' },
  mantra: { icon: Music, color: '#C084FC', label: 'Mantra' },
  ambience: { icon: Waves, color: '#22C55E', label: 'Ambient' },
  visual: { icon: Eye, color: '#A78BFA', label: 'Visual' },
  suanpan: { icon: Sliders, color: '#EAB308', label: 'Suanpan' },
  generator: { icon: Zap, color: '#FB923C', label: 'Generator' },
  custom: { icon: Sparkles, color: '#94A3B8', label: 'Custom' },
};

const SUB_COLORS = { discovery: '#94A3B8', resonance: '#C084FC', sovereign: '#EAB308' };

/* ━━━ Suanpan Mini-Abacus (Frequency Source Panel) ━━━ */
function SuanpanSource({ onFrequencySet, color }) {
  const [values, setValues] = useState([5, 2, 8, 0]);
  const totalHz = COLUMNS.reduce((sum, col, i) => sum + values[i] * col.multiplier, 0);

  const handleChange = (colIdx, newVal) => {
    setValues(prev => { const next = [...prev]; next[colIdx] = Math.min(newVal, 9); return next; });
  };

  return (
    <div className="p-3" data-testid="suanpan-source-panel">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] font-medium tracking-wider uppercase" style={{ color: 'rgba(248,250,252,0.3)' }}>
          Frequency Source
        </p>
        <p className="text-sm font-mono font-light" style={{ color }}>{totalHz.toFixed(1)} Hz</p>
      </div>
      <div className="flex items-start justify-center gap-1 mb-2">
        {COLUMNS.map((col, i) => (
          <div key={i} className="flex flex-col items-center" style={{ width: COLUMN_WIDTH }}>
            <p className="text-[7px] font-mono mb-1" style={{ color: 'rgba(248,250,252,0.15)' }}>{col.label}</p>
            <div className="flex flex-col items-center gap-0.5 mb-0.5">
              {Array.from({ length: HEAVEN_COUNT }).map((_, bi) => {
                const heavenActive = Math.floor(values[i] / HEAVEN_VALUE);
                const active = bi < heavenActive;
                return (
                  <button key={`h-${bi}`} className="rounded-full" style={{
                    width: BEAD_SIZE, height: BEAD_SIZE,
                    background: active ? color : 'rgba(248,250,252,0.05)',
                    border: `1.5px solid ${active ? color : 'rgba(248,250,252,0.08)'}`,
                    boxShadow: active ? `0 0 8px ${color}30` : 'none',
                    transform: active ? 'translateY(4px)' : 'none',
                    transition: 'all 0.2s',
                  }} onClick={() => {
                    const earthActive = values[i] % HEAVEN_VALUE;
                    const targetActive = bi + 1;
                    const newHeavenVal = heavenActive === targetActive ? targetActive - 1 : targetActive;
                    handleChange(i, newHeavenVal * HEAVEN_VALUE + earthActive);
                  }} data-testid={`src-heaven-${i}-${bi}`} />
                );
              })}
            </div>
            <div className="w-full h-[1px] my-0.5" style={{ background: `${color}25` }} />
            <div className="flex flex-col items-center gap-0.5 mt-0.5">
              {Array.from({ length: EARTH_COUNT }).map((_, bi) => {
                const earthActive = values[i] % HEAVEN_VALUE;
                const active = bi < earthActive;
                return (
                  <button key={`e-${bi}`} className="rounded-full" style={{
                    width: BEAD_SIZE - 4, height: BEAD_SIZE - 4,
                    background: active ? `${color}80` : 'rgba(248,250,252,0.03)',
                    border: `1px solid ${active ? `${color}50` : 'rgba(248,250,252,0.06)'}`,
                    transform: active ? 'translateY(-3px)' : 'none',
                    transition: 'all 0.2s',
                  }} onClick={() => {
                    const heavenActive = Math.floor(values[i] / HEAVEN_VALUE);
                    const targetActive = bi + 1;
                    const newEarthVal = earthActive === targetActive ? targetActive - 1 : targetActive;
                    handleChange(i, heavenActive * HEAVEN_VALUE + newEarthVal);
                  }} data-testid={`src-earth-${i}-${bi}`} />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <motion.button
        className="w-full py-1.5 rounded-lg text-[9px] font-medium tracking-wider uppercase"
        style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => onFrequencySet(totalHz)}
        data-testid="add-suanpan-track-btn"
      >
        Add as Track ({totalHz.toFixed(1)} Hz)
      </motion.button>
    </div>
  );
}

/* ━━━ Single Track Row ━━━ */
function TrackRow({ track, index, onUpdate, onRemove, isGhost }) {
  const meta = TRACK_TYPE_META[track.type] || TRACK_TYPE_META.custom;
  const Icon = meta.icon;

  if (isGhost) {
    return (
      <motion.div
        className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 relative overflow-hidden"
        style={{
          background: 'rgba(248,250,252,0.01)',
          border: '1px dashed rgba(248,250,252,0.06)',
          opacity: 0.4,
        }}
        initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
        data-testid={`ghost-track-${index}`}
      >
        <Ghost size={12} style={{ color: 'rgba(248,250,252,0.2)' }} />
        <div className="flex-1">
          <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
            {track.source_label || 'Locked Layer'}
          </p>
        </div>
        <Lock size={10} style={{ color: 'rgba(248,250,252,0.15)' }} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 relative group"
      style={{
        background: track.muted ? 'rgba(248,250,252,0.01)' : `${meta.color}06`,
        border: `1px solid ${track.muted ? 'rgba(248,250,252,0.04)' : `${meta.color}15`}`,
      }}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      data-testid={`track-row-${index}`}
    >
      {/* Track type icon */}
      <div className="p-1 rounded" style={{ background: `${meta.color}12` }}>
        <Icon size={11} style={{ color: track.muted ? 'rgba(248,250,252,0.2)' : meta.color }} />
      </div>

      {/* Track label + info */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium truncate" style={{
          color: track.muted ? 'rgba(248,250,252,0.25)' : 'rgba(248,250,252,0.7)',
        }}>
          {track.source_label}
        </p>
        {track.frequency && (
          <p className="text-[7px] font-mono" style={{ color: `${meta.color}60` }}>
            {track.frequency} Hz
          </p>
        )}
      </div>

      {/* Volume bar */}
      <div className="w-16 h-1.5 rounded-full overflow-hidden cursor-pointer relative"
        style={{ background: 'rgba(248,250,252,0.06)' }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const vol = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          onUpdate(index, { volume: vol });
        }}
        data-testid={`track-volume-${index}`}
      >
        <div className="absolute inset-y-0 left-0 rounded-full" style={{
          width: `${(track.volume || 0.8) * 100}%`,
          background: track.muted ? 'rgba(248,250,252,0.1)' : meta.color,
        }} />
      </div>

      {/* Mute */}
      <button className="p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity"
        onClick={() => onUpdate(index, { muted: !track.muted })}
        data-testid={`track-mute-${index}`}
      >
        {track.muted
          ? <VolumeX size={11} style={{ color: 'rgba(248,250,252,0.3)' }} />
          : <Volume2 size={11} style={{ color: meta.color }} />
        }
      </button>

      {/* Solo */}
      <button className="text-[7px] font-bold px-1 py-0.5 rounded opacity-60 hover:opacity-100 transition-opacity"
        style={{
          color: track.solo ? '#EAB308' : 'rgba(248,250,252,0.25)',
          background: track.solo ? 'rgba(234,179,8,0.12)' : 'transparent',
        }}
        onClick={() => onUpdate(index, { solo: !track.solo })}
        data-testid={`track-solo-${index}`}
      >
        S
      </button>

      {/* Remove */}
      <button className="p-0.5 rounded opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
        onClick={() => onRemove(index)}
        data-testid={`track-remove-${index}`}
      >
        <Trash2 size={10} style={{ color: '#EF4444' }} />
      </button>
    </motion.div>
  );
}

/* ━━━ Speed Bridge Upsell Modal ━━━ */
function SpeedBridgeModal({ currentTier, onUpgrade, onClose }) {
  const tiers = [
    { key: 'discovery', name: 'Discovery', price: 'Free', color: '#94A3B8', features: ['3 Static Tracks', '5 AI Credits/mo', 'Basic Tones', 'Standard Stereo'] },
    { key: 'resonance', name: 'Resonance', price: '$14.99/mo', color: '#C084FC', features: ['10 Tracks + Keyframes', '100 AI Credits/mo', '3,000+ Sound Effects', 'HD Lossless'] },
    { key: 'sovereign', name: 'Sovereign', price: '$49.99/mo', color: '#EAB308', features: ['Unlimited + Nested', '200+ Credits + NPU', 'Full Phonic Library', 'Ultra-Lossless Spatial'] },
  ];
  const tierOrder = ['discovery', 'resonance', 'sovereign'];
  const currentIdx = tierOrder.indexOf(currentTier);

  return (
    <motion.div className="fixed inset-0 z-[10001] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      data-testid="speed-bridge-modal"
    >
      <motion.div className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(10,10,18,0.95)', border: '1px solid rgba(248,250,252,0.08)' }}
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
      >
        {/* Header */}
        <div className="p-5 text-center border-b" style={{ borderColor: 'rgba(248,250,252,0.06)' }}>
          <p className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: '#EAB308' }}>
            Speed Bridge
          </p>
          <p className="text-lg font-light" style={{ color: 'rgba(248,250,252,0.6)', fontFamily: 'Cormorant Garamond, serif' }}>
            Your composition has reached Divine Complexity
          </p>
          <p className="text-[9px] mt-1" style={{ color: 'rgba(248,250,252,0.25)' }}>
            Upgrade to unlock more layers, faster rendering, and unlimited architecture
          </p>
        </div>

        {/* Tier comparison */}
        <div className="p-4 grid grid-cols-3 gap-2">
          {tiers.map((t, i) => {
            const isCurrent = t.key === currentTier;
            const isUpgrade = i > currentIdx;
            return (
              <div key={t.key} className="rounded-xl p-3 text-center" style={{
                background: isCurrent ? `${t.color}08` : 'rgba(248,250,252,0.02)',
                border: `1px solid ${isCurrent ? `${t.color}30` : 'rgba(248,250,252,0.05)'}`,
              }} data-testid={`tier-card-${t.key}`}>
                <p className="text-[10px] font-medium tracking-wider" style={{ color: t.color }}>
                  {t.name}
                </p>
                <p className="text-[12px] font-light mt-0.5" style={{ color: 'rgba(248,250,252,0.5)' }}>
                  {t.price}
                </p>
                <div className="mt-2 space-y-1">
                  {t.features.map((f, fi) => (
                    <p key={fi} className="text-[8px]" style={{ color: 'rgba(248,250,252,0.3)' }}>{f}</p>
                  ))}
                </div>
                {isCurrent && (
                  <p className="text-[7px] mt-2 px-2 py-0.5 rounded-full inline-block"
                    style={{ background: `${t.color}15`, color: t.color }}>
                    Current
                  </p>
                )}
                {isUpgrade && (
                  <motion.button className="mt-2 px-3 py-1 rounded-full text-[8px] font-medium cursor-pointer"
                    style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}30` }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => onUpgrade(t.key)}
                    data-testid={`upgrade-to-${t.key}`}
                  >
                    Upgrade
                  </motion.button>
                )}
              </div>
            );
          })}
        </div>

        {/* Close */}
        <div className="p-3 text-center border-t" style={{ borderColor: 'rgba(248,250,252,0.06)' }}>
          <button className="text-[9px] px-4 py-1.5 rounded-full"
            style={{ color: 'rgba(248,250,252,0.3)', background: 'rgba(248,250,252,0.03)' }}
            onClick={onClose} data-testid="close-speed-bridge"
          >
            Continue with {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ━━━ DIVINE DIRECTOR — Main Component ━━━ */
export default function SuanpanMixer() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const { playConfirmation, isMuted } = useSensory();

  // Subscription state
  const [subTier, setSubTier] = useState('discovery');
  const [tierConfig, setTierConfig] = useState(null);
  const [aiCredits, setAiCredits] = useState(0);

  // Track state
  const [tracks, setTracks] = useState([]);
  const [projectName, setProjectName] = useState('Untitled Session');
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);

  // UI state
  const [suanpanOpen, setSuanpanOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [sources, setSources] = useState([]);
  const [showSpeedBridge, setShowSpeedBridge] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [loading, setLoading] = useState(true);

  // Audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);

  const layerCap = tierConfig?.layer_cap || 3;
  const atCap = layerCap > 0 && tracks.length >= layerCap;
  const tierColor = SUB_COLORS[subTier] || '#94A3B8';

  // Ghost tracks — show locked sources as translucent layers
  const ghostTracks = sources
    .filter(s => s.locked)
    .slice(0, 3)
    .map((s, i) => ({
      type: s.type,
      source_label: s.label,
      volume: 0.5,
      locked: true,
      frequency: s.frequency,
    }));

  // Load subscription + sources
  useEffect(() => {
    const load = async () => {
      try {
        const [subRes, srcRes, projRes] = await Promise.all([
          axios.get(`${API}/mixer/subscription`, { headers: authHeaders }),
          axios.get(`${API}/mixer/sources`, { headers: authHeaders }),
          axios.get(`${API}/mixer/projects`, { headers: authHeaders }),
        ]);
        setSubTier(subRes.data.tier);
        setTierConfig(subRes.data.tier_config);
        setAiCredits(subRes.data.ai_credits_remaining);
        setSources(srcRes.data.sources || []);
        setProjects(projRes.data.projects || []);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [authHeaders]);

  // Add track
  const addTrack = useCallback((source) => {
    if (source.locked) {
      setShowSpeedBridge(true);
      return;
    }
    if (atCap) {
      setShowSpeedBridge(true);
      return;
    }
    const newTrack = {
      type: source.type || 'custom',
      source_id: source.id || '',
      source_label: source.label || source.source_label || 'New Track',
      volume: 0.8,
      muted: false,
      solo: false,
      start_time: 0,
      duration: 60,
      frequency: source.frequency || null,
      color: source.color || '#94A3B8',
      locked: false,
    };
    setTracks(prev => [...prev, newTrack]);
    if (!isMuted) playConfirmation(660, 'medium');
    setSourcesOpen(false);
  }, [atCap, isMuted, playConfirmation]);

  // Add suanpan frequency as track
  const addSuanpanTrack = useCallback((hz) => {
    if (atCap) { setShowSpeedBridge(true); return; }
    setTracks(prev => [...prev, {
      type: 'suanpan',
      source_id: `suanpan-${hz}`,
      source_label: `Suanpan ${hz.toFixed(1)} Hz`,
      volume: 0.8,
      muted: false,
      solo: false,
      start_time: 0,
      duration: 60,
      frequency: hz,
      color: '#EAB308',
      locked: false,
    }]);
    if (!isMuted) playConfirmation(hz > 500 ? 880 : 440, 'medium');
    setSuanpanOpen(false);
  }, [atCap, isMuted, playConfirmation]);

  // Update track
  const updateTrack = useCallback((index, updates) => {
    setTracks(prev => prev.map((t, i) => i === index ? { ...t, ...updates } : t));
  }, []);

  // Remove track
  const removeTrack = useCallback((index) => {
    setTracks(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Save project
  const saveProject = useCallback(async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/mixer/projects`, {
        name: projectName,
        tracks,
      }, { headers: authHeaders });
      toast.success(`Project "${projectName}" saved`);
      const projRes = await axios.get(`${API}/mixer/projects`, { headers: authHeaders });
      setProjects(projRes.data.projects || []);
    } catch (e) {
      const detail = e.response?.data?.detail || 'Save failed';
      if (detail.includes('Layer cap')) setShowSpeedBridge(true);
      toast.error(detail);
    } finally { setSaving(false); }
  }, [projectName, tracks, authHeaders]);

  // Load project
  const loadProject = useCallback(async (projectId) => {
    try {
      const res = await axios.get(`${API}/mixer/projects/${projectId}`, { headers: authHeaders });
      setTracks(res.data.tracks || []);
      setProjectName(res.data.name || 'Loaded Session');
      setShowProjects(false);
      toast.success(`Loaded: ${res.data.name}`);
    } catch { toast.error('Failed to load project'); }
  }, [authHeaders]);

  // Upgrade tier
  const handleUpgrade = useCallback(async (tier) => {
    try {
      const res = await axios.post(`${API}/mixer/subscription/upgrade`, { tier }, { headers: authHeaders });
      setSubTier(res.data.tier);
      setTierConfig(res.data.tier_config);
      setShowSpeedBridge(false);
      toast.success(res.data.message);
    } catch (e) { toast.error(e.response?.data?.detail || 'Upgrade failed'); }
  }, [authHeaders]);

  // Play all tracks
  const togglePlayAll = useCallback(() => {
    if (isPlaying) {
      nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
      nodesRef.current = [];
      setIsPlaying(false);
      return;
    }
    if (tracks.length === 0) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const activeTracks = tracks.filter(t => !t.muted && t.frequency);
      const hasSolo = tracks.some(t => t.solo);
      const playable = hasSolo ? activeTracks.filter(t => t.solo) : activeTracks;

      playable.forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = t.frequency;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(t.volume * 0.04, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        nodesRef.current.push(osc);
      });
      setIsPlaying(true);
    } catch {}
  }, [isPlaying, tracks]);

  useEffect(() => {
    return () => { nodesRef.current.forEach(n => { try { n.stop(); } catch {} }); };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#06060e' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'rgba(248,250,252,0.2)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#06060e' }} data-testid="divine-director-page">
      {/* ━━━ HEADER BAR ━━━ */}
      <div className="flex items-center justify-between px-4 py-3 border-b z-[10000]"
        style={{ borderColor: 'rgba(248,250,252,0.06)', background: 'rgba(6,6,14,0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/hub')} className="p-1.5 rounded-lg"
            style={{ background: 'rgba(248,250,252,0.04)' }}
            data-testid="director-back-btn">
            <ArrowLeft size={14} style={{ color: 'rgba(248,250,252,0.4)' }} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-light tracking-[0.15em] uppercase"
                style={{ color: 'rgba(248,250,252,0.4)', fontFamily: 'Cormorant Garamond, serif' }}>
                Divine Director
              </h1>
              <NanoGuide guideId="divine-director" position="top-right" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-medium"
                style={{ background: `${tierColor}15`, color: tierColor, border: `1px solid ${tierColor}25` }}>
                {subTier}
              </span>
              <span className="text-[7px] font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>
                {aiCredits} AI credits
              </span>
            </div>
          </div>
        </div>

        {/* Project controls */}
        <div className="flex items-center gap-2">
          <input type="text" value={projectName}
            onChange={e => setProjectName(e.target.value)}
            className="text-[10px] px-2 py-1 rounded-lg w-36 text-right"
            style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC', outline: 'none' }}
            data-testid="project-name-input"
          />
          <motion.button className="p-1.5 rounded-lg cursor-pointer"
            style={{ background: 'rgba(248,250,252,0.04)' }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setShowProjects(!showProjects)}
            data-testid="open-projects-btn"
          >
            <FolderOpen size={13} style={{ color: 'rgba(248,250,252,0.4)' }} />
          </motion.button>
          <motion.button className="p-1.5 rounded-lg cursor-pointer"
            style={{ background: saving ? `${tierColor}15` : 'rgba(248,250,252,0.04)' }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={saveProject} disabled={saving}
            data-testid="save-project-btn"
          >
            {saving ? <Loader2 size={13} className="animate-spin" style={{ color: tierColor }} />
              : <Save size={13} style={{ color: 'rgba(248,250,252,0.4)' }} />}
          </motion.button>
          <motion.button className="p-1.5 rounded-lg cursor-pointer"
            style={{ background: showSpeedBridge ? `${tierColor}15` : 'rgba(248,250,252,0.04)' }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setShowSpeedBridge(true)}
            data-testid="tier-info-btn"
          >
            <Crown size={13} style={{ color: tierColor }} />
          </motion.button>
        </div>
      </div>

      {/* ━━━ MAIN CONTENT ━━━ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ━━━ TRACK STACK (left panel) ━━━ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Transport bar */}
          <div className="flex items-center gap-3 px-4 py-2 border-b"
            style={{ borderColor: 'rgba(248,250,252,0.04)' }}>
            <motion.button className="p-2 rounded-lg cursor-pointer"
              style={{
                background: isPlaying ? 'rgba(239,68,68,0.12)' : `${tierColor}12`,
                border: `1px solid ${isPlaying ? 'rgba(239,68,68,0.25)' : `${tierColor}20`}`,
              }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={togglePlayAll}
              data-testid="play-all-btn"
            >
              {isPlaying
                ? <Square size={12} style={{ color: '#EF4444' }} />
                : <Play size={12} style={{ color: tierColor }} />}
            </motion.button>
            <div className="flex-1 flex items-center gap-2">
              <Layers size={11} style={{ color: 'rgba(248,250,252,0.2)' }} />
              <p className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.3)' }}>
                {tracks.length}{layerCap > 0 ? `/${layerCap}` : ''} tracks
              </p>
              {atCap && (
                <span className="text-[7px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
                  LAYER CAP
                </span>
              )}
            </div>
            {/* Add track buttons */}
            <div className="flex items-center gap-1.5">
              <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-[8px]"
                style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)', color: 'rgba(248,250,252,0.4)' }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSourcesOpen(!sourcesOpen)}
                data-testid="add-source-btn"
              >
                <Plus size={10} /> Source
              </motion.button>
              <motion.button className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-[8px]"
                style={{ background: `${TRACK_TYPE_META.suanpan.color}08`, border: `1px solid ${TRACK_TYPE_META.suanpan.color}15`, color: TRACK_TYPE_META.suanpan.color }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSuanpanOpen(!suanpanOpen)}
                data-testid="add-suanpan-btn"
              >
                <Sliders size={10} /> Suanpan
              </motion.button>
            </div>
          </div>

          {/* Suanpan collapsible panel */}
          <AnimatePresence>
            {suanpanOpen && (
              <motion.div className="border-b overflow-hidden"
                style={{ borderColor: 'rgba(248,250,252,0.04)', background: 'rgba(234,179,8,0.02)' }}
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              >
                <SuanpanSource onFrequencySet={addSuanpanTrack} color="#EAB308" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Source library dropdown */}
          <AnimatePresence>
            {sourcesOpen && (
              <motion.div className="border-b overflow-hidden"
                style={{ borderColor: 'rgba(248,250,252,0.04)', background: 'rgba(248,250,252,0.01)' }}
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              >
                <div className="p-3 max-h-48 overflow-y-auto">
                  <p className="text-[8px] tracking-wider uppercase mb-2" style={{ color: 'rgba(248,250,252,0.2)' }}>
                    Track Sources
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {sources.map(s => {
                      const meta = TRACK_TYPE_META[s.type] || TRACK_TYPE_META.custom;
                      return (
                        <motion.button key={s.id}
                          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left cursor-pointer"
                          style={{
                            background: s.locked ? 'rgba(248,250,252,0.01)' : `${meta.color}06`,
                            border: `1px solid ${s.locked ? 'rgba(248,250,252,0.04)' : `${meta.color}12`}`,
                            opacity: s.locked ? 0.5 : 1,
                          }}
                          whileHover={s.locked ? {} : { scale: 1.02 }}
                          whileTap={s.locked ? {} : { scale: 0.98 }}
                          onClick={() => addTrack(s)}
                          data-testid={`source-${s.id}`}
                        >
                          {s.locked ? <Lock size={9} style={{ color: 'rgba(248,250,252,0.2)' }} />
                            : <meta.icon size={9} style={{ color: meta.color }} />}
                          <span className="text-[8px] truncate" style={{ color: s.locked ? 'rgba(248,250,252,0.2)' : 'rgba(248,250,252,0.5)' }}>
                            {s.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Track list */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <AnimatePresence>
              {tracks.map((track, i) => (
                <TrackRow key={`track-${i}-${track.source_label}`}
                  track={track} index={i}
                  onUpdate={updateTrack} onRemove={removeTrack}
                  isGhost={false}
                />
              ))}
            </AnimatePresence>

            {/* Ghost/Shadow Tracks */}
            {tierConfig?.shadow_tracks && ghostTracks.length > 0 && (
              <div className="mt-3">
                <p className="text-[7px] tracking-wider uppercase mb-1.5" style={{ color: 'rgba(248,250,252,0.12)' }}>
                  Unlock with upgrade
                </p>
                {ghostTracks.map((gt, i) => (
                  <div key={`ghost-${i}`} className="cursor-pointer" onClick={() => setShowSpeedBridge(true)}>
                    <TrackRow track={gt} index={tracks.length + i}
                      onUpdate={() => {}} onRemove={() => {}} isGhost={true} />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {tracks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Layers size={28} style={{ color: 'rgba(248,250,252,0.08)' }} />
                <p className="text-[11px] mt-3" style={{ color: 'rgba(248,250,252,0.2)' }}>
                  No tracks yet
                </p>
                <p className="text-[9px] mt-1 max-w-xs" style={{ color: 'rgba(248,250,252,0.12)' }}>
                  Add phonic tones, mantras, and ambience from the Source library, or dial in a custom frequency with the Suanpan abacus.
                </p>
                <div className="flex gap-2 mt-4">
                  <motion.button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] cursor-pointer"
                    style={{ background: `${tierColor}10`, border: `1px solid ${tierColor}20`, color: tierColor }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setSourcesOpen(true)}
                  >
                    <Plus size={10} /> Add Source
                  </motion.button>
                  <motion.button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] cursor-pointer"
                    style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.15)', color: '#EAB308' }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setSuanpanOpen(true)}
                  >
                    <Sliders size={10} /> Open Suanpan
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ━━━ Projects List Panel ━━━ */}
      <AnimatePresence>
        {showProjects && (
          <motion.div className="fixed top-0 right-0 h-full z-[10001] w-72 flex flex-col"
            style={{ background: 'rgba(6,6,14,0.97)', backdropFilter: 'blur(24px)', borderLeft: '1px solid rgba(248,250,252,0.06)' }}
            initial={{ x: 288 }} animate={{ x: 0 }} exit={{ x: 288 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            data-testid="projects-panel"
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(248,250,252,0.06)' }}>
              <p className="text-[10px] font-medium tracking-wider uppercase" style={{ color: 'rgba(248,250,252,0.4)' }}>
                Saved Projects
              </p>
              <button className="p-1 rounded" onClick={() => setShowProjects(false)} data-testid="close-projects-btn">
                <X size={12} style={{ color: 'rgba(248,250,252,0.3)' }} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {projects.map(p => (
                <motion.button key={p.id}
                  className="w-full text-left px-3 py-2.5 rounded-lg cursor-pointer"
                  style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.05)' }}
                  whileHover={{ scale: 1.02, background: 'rgba(248,250,252,0.04)' }}
                  onClick={() => loadProject(p.id)}
                  data-testid={`project-item-${p.id}`}
                >
                  <p className="text-[10px] font-medium" style={{ color: 'rgba(248,250,252,0.6)' }}>{p.name}</p>
                  <p className="text-[8px] mt-0.5" style={{ color: 'rgba(248,250,252,0.2)' }}>
                    {p.track_count} tracks &middot; {new Date(p.updated_at).toLocaleDateString()}
                  </p>
                </motion.button>
              ))}
              {projects.length === 0 && (
                <p className="text-[9px] text-center py-8" style={{ color: 'rgba(248,250,252,0.15)' }}>
                  No saved projects yet
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ━━━ Speed Bridge Modal ━━━ */}
      <AnimatePresence>
        {showSpeedBridge && (
          <SpeedBridgeModal
            currentTier={subTier}
            onUpgrade={handleUpgrade}
            onClose={() => setShowSpeedBridge(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
