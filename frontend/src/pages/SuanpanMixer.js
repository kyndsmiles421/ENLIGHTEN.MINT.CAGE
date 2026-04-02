import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSensory } from '../context/SensoryContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, Volume2, VolumeX, Send, Check, Loader2,
  Sliders, Lock, Zap, Waves, Sparkles, ChevronRight,
  ChevronLeft, ShoppingCart, ToggleLeft, ToggleRight, Crown,
} from 'lucide-react';
import { NanoGuide } from '../components/NanoGuide';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BEAD_SIZE = 28;
const COLUMN_WIDTH = 60;
const HEAVEN_COUNT = 2;
const EARTH_COUNT = 5;
const HEAVEN_VALUE = 5;

const COLUMNS = [
  { label: '100s', multiplier: 100 },
  { label: '10s', multiplier: 10 },
  { label: '1s', multiplier: 1 },
  { label: '.1s', multiplier: 0.1 },
];

const PRESETS = [
  { label: 'Schumann', hz: 7.83, desc: "Earth's heartbeat" },
  { label: 'OM', hz: 136.1, desc: 'Vedic year-tone' },
  { label: 'UT', hz: 174.0, desc: 'Pain reduction' },
  { label: 'RE', hz: 285.0, desc: 'Tissue healing' },
  { label: 'MI', hz: 528.0, desc: 'Transformation' },
  { label: 'FA', hz: 639.0, desc: 'Connection' },
  { label: 'SOL', hz: 741.0, desc: 'Expression' },
  { label: 'LA', hz: 852.0, desc: 'Intuition' },
  { label: 'SI', hz: 963.0, desc: 'Pineal activation' },
];

const TYPE_META = {
  sub_harmonic: { icon: Waves, color: '#60A5FA', label: 'Sub-Harmonic' },
  mantra_extension: { icon: Sparkles, color: '#C084FC', label: 'Mantra Extension' },
  ultra_lossless: { icon: Zap, color: '#EAB308', label: 'Ultra-Lossless' },
};

const TIER_COLORS = {
  observer: '#60A5FA', synthesizer: '#2DD4BF', archivist: '#FBBF24',
  navigator: '#C084FC', sovereign: '#EF4444',
};

function BeadColumn({ index, value, onChange, multiplier, label, color }) {
  const heavenActive = Math.floor(value / HEAVEN_VALUE);
  const earthActive = value % HEAVEN_VALUE;

  const toggleHeaven = (beadIdx) => {
    const targetActive = beadIdx + 1;
    const newHeavenVal = heavenActive === targetActive ? targetActive - 1 : targetActive;
    onChange(index, newHeavenVal * HEAVEN_VALUE + earthActive);
  };

  const toggleEarth = (beadIdx) => {
    const targetActive = beadIdx + 1;
    const newEarthVal = earthActive === targetActive ? targetActive - 1 : targetActive;
    onChange(index, heavenActive * HEAVEN_VALUE + newEarthVal);
  };

  return (
    <div className="flex flex-col items-center" style={{ width: COLUMN_WIDTH }} data-testid={`suanpan-col-${index}`}>
      <p className="text-[8px] font-mono mb-2" style={{ color: 'rgba(248,250,252,0.2)' }}>{label}</p>
      <div className="flex flex-col items-center gap-1 mb-1">
        {Array.from({ length: HEAVEN_COUNT }).map((_, i) => {
          const active = i < heavenActive;
          return (
            <motion.button key={`h-${i}`}
              className="rounded-full cursor-pointer"
              style={{
                width: BEAD_SIZE, height: BEAD_SIZE,
                background: active ? `${color}` : 'rgba(248,250,252,0.06)',
                border: `2px solid ${active ? color : 'rgba(248,250,252,0.08)'}`,
                boxShadow: active ? `0 0 12px ${color}40` : 'none',
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              animate={{ y: active ? 8 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => toggleHeaven(i)}
              data-testid={`heaven-bead-${index}-${i}`}
            />
          );
        })}
      </div>
      <div className="w-full h-[2px] my-1" style={{ background: `${color}30` }} />
      <div className="flex flex-col items-center gap-1 mt-1">
        {Array.from({ length: EARTH_COUNT }).map((_, i) => {
          const active = i < earthActive;
          return (
            <motion.button key={`e-${i}`}
              className="rounded-full cursor-pointer"
              style={{
                width: BEAD_SIZE - 4, height: BEAD_SIZE - 4,
                background: active ? `${color}90` : 'rgba(248,250,252,0.04)',
                border: `1.5px solid ${active ? `${color}60` : 'rgba(248,250,252,0.06)'}`,
                boxShadow: active ? `0 0 8px ${color}25` : 'none',
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              animate={{ y: active ? -6 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => toggleEarth(i)}
              data-testid={`earth-bead-${index}-${i}`}
            />
          );
        })}
      </div>
      <p className="text-[10px] font-mono mt-2" style={{ color: `${color}80` }}>
        {(value * multiplier).toFixed(multiplier < 1 ? 1 : 0)}
      </p>
    </div>
  );
}

function GeneratorCard({ gen, onPurchase, onToggle, purchasing }) {
  const meta = TYPE_META[gen.type] || TYPE_META.sub_harmonic;
  const Icon = meta.icon;
  const tierColor = TIER_COLORS[gen.tier_required] || '#94A3B8';
  const isLocked = gen.tier_locked;
  const isOwned = gen.owned;

  return (
    <motion.div
      className="rounded-xl p-3 mb-2 relative overflow-hidden"
      style={{
        background: isOwned
          ? `linear-gradient(135deg, ${meta.color}08, ${meta.color}04)`
          : 'rgba(248,250,252,0.02)',
        border: `1px solid ${isOwned ? `${meta.color}30` : isLocked ? 'rgba(248,250,252,0.04)' : 'rgba(248,250,252,0.08)'}`,
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      data-testid={`generator-card-${gen.id}`}
    >
      {/* Bloom glow for owned + active generators */}
      {isOwned && gen.active && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: `inset 0 0 20px ${meta.color}15, 0 0 30px ${meta.color}08` }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="flex items-start gap-2.5 relative z-10">
        <div className="p-1.5 rounded-lg" style={{ background: `${meta.color}15` }}>
          <Icon size={14} style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-medium truncate" style={{ color: '#F8FAFC' }}>
              {gen.name}
            </p>
            {isLocked && <Lock size={10} style={{ color: 'rgba(248,250,252,0.3)' }} />}
          </div>
          <p className="text-[8px] mt-0.5 line-clamp-2" style={{ color: 'rgba(248,250,252,0.35)' }}>
            {gen.description}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-medium"
              style={{ background: `${tierColor}15`, color: tierColor, border: `1px solid ${tierColor}25` }}>
              {gen.tier_required}
            </span>
            <span className="text-[8px] font-mono" style={{ color: meta.color }}>
              {meta.label}
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex-shrink-0">
          {isLocked ? (
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(248,250,252,0.03)' }}>
              <Crown size={12} style={{ color: tierColor }} />
            </div>
          ) : isOwned ? (
            <motion.button
              className="p-1.5 rounded-lg cursor-pointer"
              style={{
                background: gen.active ? `${meta.color}20` : 'rgba(248,250,252,0.04)',
                border: `1px solid ${gen.active ? `${meta.color}40` : 'rgba(248,250,252,0.06)'}`,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggle(gen.id)}
              data-testid={`toggle-generator-${gen.id}`}
            >
              {gen.active
                ? <ToggleRight size={14} style={{ color: meta.color }} />
                : <ToggleLeft size={14} style={{ color: 'rgba(248,250,252,0.3)' }} />
              }
            </motion.button>
          ) : (
            <motion.button
              className="flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer"
              style={{
                background: gen.can_afford ? `${meta.color}12` : 'rgba(248,250,252,0.03)',
                border: `1px solid ${gen.can_afford ? `${meta.color}25` : 'rgba(248,250,252,0.06)'}`,
                opacity: gen.can_afford ? 1 : 0.5,
              }}
              whileHover={gen.can_afford ? { scale: 1.05 } : {}}
              whileTap={gen.can_afford ? { scale: 0.95 } : {}}
              onClick={() => gen.can_afford && onPurchase(gen.id)}
              disabled={purchasing || !gen.can_afford}
              data-testid={`buy-generator-${gen.id}`}
            >
              {purchasing ? (
                <Loader2 size={10} className="animate-spin" style={{ color: meta.color }} />
              ) : (
                <ShoppingCart size={10} style={{ color: gen.can_afford ? meta.color : 'rgba(248,250,252,0.3)' }} />
              )}
              <span className="text-[8px] font-mono font-medium"
                style={{ color: gen.can_afford ? meta.color : 'rgba(248,250,252,0.3)' }}>
                {gen.price_credits}c
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function SuanpanMixer() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const { playConfirmation, playSingingBowl, isMuted } = useSensory();
  const [values, setValues] = useState([5, 2, 8, 0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [userTier, setUserTier] = useState('observer');
  const [userCredits, setUserCredits] = useState(0);
  const [purchasing, setPurchasing] = useState(null);
  const [activeGenerators, setActiveGenerators] = useState([]);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const ctxRef = useRef(null);

  const totalHz = COLUMNS.reduce((sum, col, i) => sum + values[i] * col.multiplier, 0);
  const color = totalHz > 700 ? '#C084FC' : totalHz > 400 ? '#A78BFA' : totalHz > 200 ? '#2DD4BF' : '#60A5FA';

  // Load generator catalog
  const loadCatalog = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/trade-circle/generators/catalog`, { headers: authHeaders });
      setCatalog(res.data.catalog || []);
      setUserTier(res.data.user_tier || 'observer');
      setUserCredits(res.data.user_credits || 0);
      setActiveGenerators(
        (res.data.catalog || []).filter(g => g.owned && g.active !== false).map(g => g.id)
      );
    } catch {}
  }, [authHeaders]);

  // Load vault (owned generators with bloom)
  const loadVault = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/vault/generators`, { headers: authHeaders });
      const gens = res.data.generators || [];
      setActiveGenerators(gens.filter(g => g.active).map(g => g.id));
    } catch {}
  }, [authHeaders]);

  useEffect(() => {
    if (consoleOpen) {
      loadCatalog();
    }
  }, [consoleOpen, loadCatalog]);

  const handlePurchase = useCallback(async (generatorId) => {
    setPurchasing(generatorId);
    try {
      const res = await axios.post(`${API}/trade-circle/purchase`, {
        generatorId,
      }, { headers: authHeaders });
      toast.success(`Unlocked: ${res.data.purchased}`);
      setUserCredits(res.data.credits_remaining);
      if (!isMuted) playConfirmation(1046.5, 'high');
      loadCatalog();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  }, [authHeaders, loadCatalog, isMuted, playConfirmation]);

  const handleToggle = useCallback(async (generatorId) => {
    try {
      const res = await axios.post(`${API}/vault/generators/toggle`, {
        generatorId,
      }, { headers: authHeaders });
      if (res.data.active) {
        setActiveGenerators(prev => [...prev, generatorId]);
        if (!isMuted) playConfirmation(880, 'medium');
      } else {
        setActiveGenerators(prev => prev.filter(id => id !== generatorId));
      }
      loadCatalog();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Toggle failed');
    }
  }, [authHeaders, loadCatalog, isMuted, playConfirmation]);

  const handleChange = useCallback((colIdx, newVal) => {
    setValues(prev => { const next = [...prev]; next[colIdx] = Math.min(newVal, 9); return next; });
  }, []);

  const setPreset = useCallback((hz) => {
    const h = Math.floor(hz / 100);
    const t = Math.floor((hz % 100) / 10);
    const o = Math.floor(hz % 10);
    const d = Math.round((hz * 10) % 10);
    setValues([Math.min(h, 9), Math.min(t, 9), Math.min(o, 9), Math.min(d, 9)]);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (gainRef.current && ctxRef.current) {
        gainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.5);
        const osc = oscRef.current;
        setTimeout(() => { try { osc?.stop(); } catch {} }, 600);
      }
      oscRef.current = null;
      gainRef.current = null;
      setIsPlaying(false);
      return;
    }

    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = totalHz;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      oscRef.current = osc;
      gainRef.current = gain;
      setIsPlaying(true);
    } catch {}
  }, [isPlaying, totalHz]);

  useEffect(() => {
    if (isPlaying && oscRef.current) {
      oscRef.current.frequency.linearRampToValueAtTime(totalHz, (ctxRef.current?.currentTime || 0) + 0.1);
    }
  }, [totalHz, isPlaying]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      await axios.post(`${API}/trade-circle/suanpan-export`, {
        frequency: totalHz,
        recipe_name: recipeName.trim() || `Frequency Recipe ${totalHz}Hz`,
      }, { headers: authHeaders });
      setExported(true);
      setShowExport(false);
      toast.success(`Recipe exported to Trade Circle at ${totalHz}Hz`);
      setTimeout(() => setExported(false), 3000);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Export failed');
    } finally {
      setExporting(false);
    }
  }, [totalHz, recipeName, authHeaders]);

  useEffect(() => {
    return () => { try { oscRef.current?.stop(); } catch {} };
  }, []);

  const hasActiveGenerators = activeGenerators.length > 0;

  // Merge catalog entries with active state for display
  const catalogWithActive = catalog.map(g => ({
    ...g,
    active: activeGenerators.includes(g.id),
  }));

  const groupedCatalog = {
    sub_harmonic: catalogWithActive.filter(g => g.type === 'sub_harmonic'),
    mantra_extension: catalogWithActive.filter(g => g.type === 'mantra_extension'),
    ultra_lossless: catalogWithActive.filter(g => g.type === 'ultra_lossless'),
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative" style={{ background: '#06060e' }} data-testid="suanpan-page">
      {/* Active generator bloom overlay */}
      {hasActiveGenerators && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${color}06 0%, transparent 70%)`,
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Header */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
        <button onClick={() => navigate('/hub')} className="p-2 rounded-full"
          style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }}
          data-testid="suanpan-back-btn">
          <ArrowLeft size={16} style={{ color: 'rgba(248,250,252,0.4)' }} />
        </button>
        <div>
          <h1 className="text-lg font-light tracking-[0.2em] uppercase"
            style={{ color: 'rgba(248,250,252,0.3)', fontFamily: 'Cormorant Garamond, serif' }}>
            The Suanpan
          </h1>
          <div className="flex items-center gap-1.5">
            <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.15)' }}>
              Ancient Abacus Frequency Mixer
            </p>
            <NanoGuide guideId="suanpan-mixer" position="top-right" />
          </div>
        </div>
      </div>

      {/* Generator Console Toggle Button */}
      <motion.button
        className="absolute top-6 right-6 z-20 flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer"
        style={{
          background: consoleOpen ? `${color}12` : 'rgba(248,250,252,0.04)',
          border: `1px solid ${consoleOpen ? `${color}30` : 'rgba(248,250,252,0.08)'}`,
          boxShadow: hasActiveGenerators ? `0 0 16px ${color}15` : 'none',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setConsoleOpen(!consoleOpen)}
        data-testid="console-toggle-btn"
      >
        <Sliders size={14} style={{ color: consoleOpen ? color : 'rgba(248,250,252,0.4)' }} />
        <span className="text-[9px] font-medium tracking-wider uppercase"
          style={{ color: consoleOpen ? color : 'rgba(248,250,252,0.4)' }}>
          Console
        </span>
        {hasActiveGenerators && (
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        )}
      </motion.button>

      {/* Frequency display */}
      <motion.div className="text-center mb-8 relative z-10"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <p className="text-5xl font-light font-mono" style={{ color, fontFamily: 'Cormorant Garamond, serif' }}>
          {totalHz.toFixed(1)}
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(248,250,252,0.2)' }}>Hertz</p>
        {hasActiveGenerators && (
          <motion.p className="text-[8px] mt-1 tracking-wider uppercase"
            style={{ color: `${color}80` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}>
            {activeGenerators.length} generator{activeGenerators.length > 1 ? 's' : ''} active
          </motion.p>
        )}
      </motion.div>

      {/* Abacus frame */}
      <div className="rounded-2xl p-6 relative z-10" style={{
        background: 'rgba(10,10,18,0.6)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${color}15`,
        boxShadow: isPlaying ? `0 0 40px ${color}10` : 'none',
      }}>
        <div className="flex items-start gap-2">
          {COLUMNS.map((col, i) => (
            <BeadColumn key={i} index={i} value={values[i]}
              onChange={handleChange} multiplier={col.multiplier}
              label={col.label} color={color} />
          ))}
        </div>

        {/* Play button */}
        <div className="flex justify-center mt-6 gap-3">
          <motion.button
            className="flex items-center gap-2 px-6 py-2.5 rounded-full"
            style={{
              background: isPlaying ? `${color}20` : 'rgba(248,250,252,0.04)',
              border: `1px solid ${isPlaying ? color : 'rgba(248,250,252,0.08)'}`,
              boxShadow: isPlaying ? `0 0 20px ${color}20` : 'none',
            }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            data-testid="suanpan-play-btn"
          >
            {isPlaying ? <VolumeX size={14} style={{ color }} /> : <Volume2 size={14} style={{ color: 'rgba(248,250,252,0.4)' }} />}
            <span className="text-[10px] font-medium tracking-wider uppercase"
              style={{ color: isPlaying ? color : 'rgba(248,250,252,0.4)' }}>
              {isPlaying ? 'Stop' : 'Emit Frequency'}
            </span>
          </motion.button>

          <motion.button
            className="flex items-center gap-2 px-4 py-2.5 rounded-full"
            style={{
              background: exported ? 'rgba(34,197,94,0.12)' : 'rgba(234,179,8,0.08)',
              border: `1px solid ${exported ? 'rgba(34,197,94,0.25)' : 'rgba(234,179,8,0.15)'}`,
            }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowExport(!showExport)}
            data-testid="suanpan-export-toggle"
          >
            {exported ? <Check size={14} style={{ color: '#22C55E' }} /> : <Send size={14} style={{ color: '#EAB308' }} />}
            <span className="text-[10px] font-medium tracking-wider uppercase"
              style={{ color: exported ? '#22C55E' : '#EAB308' }}>
              {exported ? 'Exported' : 'Trade'}
            </span>
          </motion.button>
        </div>

        {/* Export panel */}
        <AnimatePresence>
          {showExport && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mt-4 rounded-lg p-3 overflow-hidden" data-testid="suanpan-export-panel"
              style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.12)' }}>
              <p className="text-[8px] uppercase tracking-[0.15em] mb-2" style={{ color: '#EAB308' }}>
                Export to Trade Circle
              </p>
              <input type="text" value={recipeName}
                onChange={e => setRecipeName(e.target.value)}
                placeholder={`Frequency Recipe ${totalHz}Hz`}
                className="w-full px-3 py-1.5 rounded-lg text-[10px] mb-2"
                style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC', outline: 'none' }}
                data-testid="recipe-name-input" />
              <div className="flex items-center justify-between">
                <div className="text-[8px] space-y-0.5" style={{ color: 'rgba(248,250,252,0.3)' }}>
                  <p>Frequency: <span className="font-mono" style={{ color }}>{totalHz}Hz</span></p>
                  <p>Auto-derived: Element, Nature, Mass</p>
                </div>
                <button onClick={handleExport} disabled={exporting}
                  className="px-3 py-1.5 rounded-full text-[9px] font-medium"
                  style={{ background: 'rgba(234,179,8,0.15)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.25)' }}
                  data-testid="export-recipe-btn">
                  {exporting ? <Loader2 size={12} className="animate-spin" /> : 'Export Now'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Presets */}
      <div className="mt-8 relative z-10">
        <p className="text-[9px] text-center font-medium tracking-[0.15em] uppercase mb-3"
          style={{ color: 'rgba(248,250,252,0.15)' }}>Solfeggio Presets</p>
        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {PRESETS.map(p => (
            <motion.button key={p.label}
              className="px-3 py-1.5 rounded-full"
              style={{
                background: Math.abs(totalHz - p.hz) < 1 ? 'rgba(192,132,252,0.12)' : 'rgba(248,250,252,0.03)',
                border: `1px solid ${Math.abs(totalHz - p.hz) < 1 ? 'rgba(192,132,252,0.25)' : 'rgba(248,250,252,0.05)'}`,
              }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setPreset(p.hz)}
              data-testid={`preset-${p.label}`}
            >
              <span className="text-[9px] font-medium" style={{ color: 'rgba(248,250,252,0.4)' }}>{p.label}</span>
              <span className="text-[8px] ml-1 font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>{p.hz}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <p className="absolute bottom-6 text-[8px] tracking-wider z-10"
        style={{ color: 'rgba(248,250,252,0.1)' }}>
        Slide heaven beads (worth 5) and earth beads (worth 1) to set frequencies
      </p>

      {/* ━━━ GENERATOR CONSOLE SLIDE-OVER ━━━ */}
      <AnimatePresence>
        {consoleOpen && (
          <motion.div
            className="fixed top-0 right-0 h-full z-50 flex flex-col"
            style={{
              width: 320,
              background: 'rgba(6,6,14,0.95)',
              backdropFilter: 'blur(24px)',
              borderLeft: `1px solid ${color}15`,
              boxShadow: `-8px 0 40px rgba(0,0,0,0.5)`,
            }}
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            data-testid="generator-console"
          >
            {/* Console Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(248,250,252,0.06)' }}>
              <div className="flex items-center gap-2">
                <Sliders size={14} style={{ color }} />
                <div>
                  <p className="text-[11px] font-medium tracking-wider uppercase" style={{ color: 'rgba(248,250,252,0.5)' }}>
                    Generator Console
                  </p>
                  <p className="text-[8px] font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>
                    {userTier.toUpperCase()} &middot; {userCredits} credits
                  </p>
                </div>
              </div>
              <motion.button
                className="p-1.5 rounded-lg cursor-pointer"
                style={{ background: 'rgba(248,250,252,0.04)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setConsoleOpen(false)}
                data-testid="close-console-btn"
              >
                <ChevronRight size={14} style={{ color: 'rgba(248,250,252,0.4)' }} />
              </motion.button>
            </div>

            {/* Console Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Object.entries(groupedCatalog).map(([type, gens]) => {
                const meta = TYPE_META[type];
                if (!gens.length) return null;
                return (
                  <div key={type}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <meta.icon size={10} style={{ color: meta.color }} />
                      <p className="text-[9px] font-medium tracking-wider uppercase"
                        style={{ color: meta.color }}>
                        {meta.label}
                      </p>
                    </div>
                    {gens.map(g => (
                      <GeneratorCard
                        key={g.id}
                        gen={g}
                        onPurchase={handlePurchase}
                        onToggle={handleToggle}
                        purchasing={purchasing === g.id}
                      />
                    ))}
                  </div>
                );
              })}

              {catalog.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={16} className="animate-spin" style={{ color: 'rgba(248,250,252,0.2)' }} />
                </div>
              )}
            </div>

            {/* Console Footer — active summary */}
            <div className="p-4 border-t" style={{ borderColor: 'rgba(248,250,252,0.06)' }}>
              <div className="flex items-center justify-between">
                <p className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.2)' }}>
                  Active Generators
                </p>
                <span className="text-[9px] font-mono" style={{ color }}>
                  {activeGenerators.length}/{catalog.filter(g => g.owned).length}
                </span>
              </div>
              {activeGenerators.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {activeGenerators.map(id => {
                    const gen = catalog.find(g => g.id === id);
                    const meta = TYPE_META[gen?.type] || TYPE_META.sub_harmonic;
                    return (
                      <motion.span key={id}
                        className="text-[7px] px-1.5 py-0.5 rounded-full"
                        style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}25` }}
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {gen?.name?.split(' ')[0] || id}
                      </motion.span>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
