/**
 * V32.1 UNIFIED CREATOR CONSOLE
 * Every module = fader channel. Tier + à la carte purchases control depth.
 * Built-in Store for purchasing channel packs, effects, visuals.
 * Connected to every module via upsell hooks.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ChevronDown, Lock, Play, Pause, Zap, Activity,
  Eye, EyeOff, Volume2, Sliders, ArrowLeft, ShoppingCart, X, Check
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ═══ MODULE CHANNELS ═══
const PILLARS = [
  { key: 'practice', title: 'Practice', color: '#D8B4FE', modules: [
    { id: 'breathwork', label: 'Breath', route: '/breathing' },
    { id: 'meditation', label: 'Medit', route: '/meditation' },
    { id: 'yoga', label: 'Yoga', route: '/yoga' },
    { id: 'mudras', label: 'Mudra', route: '/mudras' },
    { id: 'mantras', label: 'Mantra', route: '/mantras' },
    { id: 'light', label: 'Light', route: '/light-therapy' },
    { id: 'affirm', label: 'Affirm', route: '/affirmations' },
    { id: 'ritual', label: 'Ritual', route: '/daily-ritual' },
    { id: 'mood', label: 'Mood', route: '/mood' },
  ]},
  { key: 'divination', title: 'Divination', color: '#E879F9', modules: [
    { id: 'oracle', label: 'Oracle', route: '/oracle' },
    { id: 'akashic', label: 'Akashic', route: '/akashic-records' },
    { id: 'stars', label: 'Stars', route: '/star-chart' },
    { id: 'numbers', label: 'Numer', route: '/numerology' },
    { id: 'dreams', label: 'Dreams', route: '/dreams' },
    { id: 'mayan', label: 'Mayan', route: '/mayan' },
    { id: 'calendar', label: 'Calend', route: '/cosmic-calendar' },
    { id: 'cards', label: 'Cards', route: '/cardology' },
    { id: 'totems', label: 'Totems', route: '/animal-totems' },
  ]},
  { key: 'sanctuary', title: 'Sanctuary', color: '#2DD4BF', modules: [
    { id: 'zen', label: 'Zen', route: '/zen-garden' },
    { id: 'sound', label: 'Sound', route: '/soundscapes' },
    { id: 'music', label: 'Music', route: '/music-lounge' },
    { id: 'freq', label: 'Freq', route: '/frequencies' },
    { id: 'vr', label: 'VR', route: '/vr' },
    { id: 'journal', label: 'Journal', route: '/journal' },
    { id: 'wisdom', label: 'Wisdom', route: '/wisdom-journal' },
    { id: 'green', label: 'Green', route: '/green-journal' },
  ]},
  { key: 'nourish', title: 'Nourish', color: '#22C55E', modules: [
    { id: 'nourish', label: 'Nourish', route: '/nourishment' },
    { id: 'aroma', label: 'Aroma', route: '/aromatherapy' },
    { id: 'herbs', label: 'Herbs', route: '/herbology' },
    { id: 'elixirs', label: 'Elixir', route: '/elixirs' },
    { id: 'acu', label: 'Acu', route: '/acupressure' },
    { id: 'reiki', label: 'Reiki', route: '/reiki' },
    { id: 'meals', label: 'Meals', route: '/meal-planning' },
    { id: 'reports', label: 'Report', route: '/wellness-reports' },
  ]},
  { key: 'explore', title: 'Explore', color: '#FB923C', modules: [
    { id: 'discover', label: 'Discov', route: '/discover' },
    { id: 'encycl', label: 'Encycl', route: '/encyclopedia' },
    { id: 'reading', label: 'Read', route: '/reading-list' },
    { id: 'stories', label: 'Stories', route: '/creation-stories' },
    { id: 'teach', label: 'Teach', route: '/teachings' },
    { id: 'commun', label: 'Commun', route: '/community' },
    { id: 'bless', label: 'Bless', route: '/blessings' },
    { id: 'sacred', label: 'Sacred', route: '/sacred-texts' },
    { id: 'profile', label: 'Profile', route: '/cosmic-profile' },
  ]},
  { key: 'sage', title: 'Sage AI', color: '#38BDF8', modules: [
    { id: 'coach', label: 'Coach', route: '/coach' },
    { id: 'crystals', label: 'Crystal', route: '/crystals' },
    { id: 'briefing', label: 'Brief', route: '/daily-briefing' },
    { id: 'forecast', label: 'Forcast', route: '/forecasts' },
  ]},
  { key: 'council', title: 'Council', color: '#C084FC', modules: [
    { id: 'advisors', label: 'Council', route: '/sovereigns' },
    { id: 'economy', label: 'Econ', route: '/economy' },
    { id: 'academy', label: 'Academ', route: '/academy' },
    { id: 'trade', label: 'Trade', route: '/trade-circle' },
    { id: 'skins', label: 'Skins', route: '/crystal-skins' },
    { id: 'vault', label: 'Vault', route: '/archives' },
    { id: 'ledger', label: 'Ledger', route: '/cosmic-ledger' },
    { id: 'alchemy', label: 'Alchem', route: '/resource-alchemy' },
    { id: 'gravity', label: 'Gravty', route: '/gravity-well' },
    { id: 'quest', label: 'Quest', route: '/cryptic-quest' },
    { id: 'games', label: 'Games', route: '/games' },
  ]},
];

const TOTAL_CHANNELS = PILLARS.reduce((a, p) => a + p.modules.length, 0);

// ═══ FADER STRIP ═══
function Fader({ value, onChange, color, muted, solo, onMute, onSolo, label, onNav, locked }) {
  return (
    <div className="flex flex-col items-center w-[42px] flex-shrink-0">
      {/* Value */}
      <div className="text-[7px] font-mono mb-0.5" style={{ color: locked ? 'rgba(255,255,255,0.1)' : color }}>{locked ? '—' : value}</div>
      {/* Slider */}
      {locked ? (
        <div className="w-full h-1.5 rounded-full mb-1 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <Lock size={6} className="text-white/10" />
        </div>
      ) : (
        <input type="range" min="0" max="100" value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full cursor-pointer mb-1" style={{ accentColor: color }} />
      )}
      {/* M/S */}
      <div className="flex gap-px mb-0.5">
        <button onClick={onMute} className="w-4 h-3 rounded-sm text-[5px] font-bold"
          style={{ background: muted ? '#EF4444' : 'rgba(255,255,255,0.05)', color: muted ? '#fff' : 'rgba(255,255,255,0.2)' }}>M</button>
        <button onClick={onSolo} className="w-4 h-3 rounded-sm text-[5px] font-bold"
          style={{ background: solo ? '#EAB308' : 'rgba(255,255,255,0.05)', color: solo ? '#000' : 'rgba(255,255,255,0.2)' }}>S</button>
      </div>
      {/* Label — tap to navigate */}
      <button onClick={onNav} className="text-[6px] leading-tight text-center w-full truncate active:scale-90"
        style={{ color: locked ? 'rgba(255,255,255,0.1)' : `${color}BB` }}>{label}</button>
    </div>
  );
}

// ═══ WAVEFORM ═══
function Waveform({ levels, colors }) {
  const ref = useRef(null);
  const frame = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); const w = c.width; const h = c.height; let t = 0;
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0, 0, w, h);
      colors.forEach((col, i) => {
        const v = levels[i] || 50; ctx.beginPath(); ctx.strokeStyle = col + '55'; ctx.lineWidth = 1;
        for (let x = 0; x < w; x++) {
          const y = h/2 + Math.sin((x + t*(i+1)) * 0.02) * (v/100) * (h/3) * Math.sin(x*0.005+i);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        } ctx.stroke();
      }); t++; frame.current = requestAnimationFrame(draw);
    }; draw();
    return () => cancelAnimationFrame(frame.current);
  }, [levels, colors]);
  return <canvas ref={ref} width={400} height={80} className="w-full h-[70px] rounded-lg" style={{ background: '#030308' }} />;
}

// ═══ STORE PANEL ═══
function StorePanel({ items, credits, onBuy, onClose }) {
  const categories = [
    { key: 'mixer', label: 'Channel Packs' },
    { key: 'mixer_fx', label: 'Effects' },
    { key: 'mixer_visual', label: 'Visuals' },
    { key: 'mixer_bundle', label: 'Bundles' },
  ];
  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
      className="fixed inset-0 z-[10000] flex flex-col" style={{ background: '#060610' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
        <div>
          <div className="text-sm font-bold text-white/90">Mixer Store</div>
          <div className="text-[10px] text-white/40">{credits} Credits available</div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg active:scale-90" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <X size={16} className="text-white/60" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {categories.map(cat => {
          const catItems = items.filter(i => i.category === cat.key);
          if (!catItems.length) return null;
          return (
            <div key={cat.key} className="mb-4">
              <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">{cat.label}</div>
              <div className="space-y-1.5">
                {catItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl" 
                    style={{ background: item.owned ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${item.owned ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                      {item.owned ? <Check size={14} style={{ color: '#22C55E' }} /> : <Lock size={12} style={{ color: item.color }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white/80">{item.name}</div>
                      <div className="text-[10px] text-white/30 truncate">{item.description}</div>
                    </div>
                    {item.owned ? (
                      <div className="text-[9px] text-green-400/60 font-bold">OWNED</div>
                    ) : (
                      <button onClick={() => onBuy(item.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold active:scale-95 flex-shrink-0"
                        style={{ background: `${item.color}15`, border: `1px solid ${item.color}30`, color: item.color }}>
                        {item.price_credits}c
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ═══ MAIN CONSOLE ═══
export default function UnifiedCreatorConsole({ onClose }) {
  const navigate = useNavigate();
  const [tier, setTier] = useState('SEED');
  const [unlocks, setUnlocks] = useState({ unlocked_pillars: [], unlocked_fx: [], has_gpu: false, has_waveform: false, has_superstrip: false, has_full_unlock: false });
  const [pillarLevels, setPillarLevels] = useState(PILLARS.map(() => 75));
  const [expandedPillar, setExpandedPillar] = useState(null);
  const [modStates, setModStates] = useState({});
  const [masterLevel, setMasterLevel] = useState(80);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showStore, setShowStore] = useState(false);
  const [storeItems, setStoreItems] = useState([]);
  const [credits, setCredits] = useState(0);

  // Init module states
  useEffect(() => {
    const s = {};
    PILLARS.forEach(p => p.modules.forEach(m => { s[m.id] = { value: 40 + Math.floor(Math.random() * 40), muted: false, solo: false }; }));
    setModStates(s);
  }, []);

  // Load tier + unlocks
  useEffect(() => {
    const h = getHeaders();
    axios.get(`${API}/transmuter/status`, { headers: h }).then(({ data }) => {
      const t = (data.tier_name || 'SEED').toUpperCase();
      if (['BASE', 'SEED', 'ARTISAN', 'SOVEREIGN'].includes(t)) setTier(t);
    }).catch(() => {});
    axios.get(`${API}/marketplace/mixer-unlocks`, { headers: h }).then(({ data }) => setUnlocks(data)).catch(() => {});
    if (typeof window.__workAccrue === 'function') window.__workAccrue('creator_console', 15);
  }, []);

  const loadStore = useCallback(() => {
    axios.get(`${API}/marketplace/mixer-store`, { headers: getHeaders() }).then(({ data }) => {
      setStoreItems(data.items); setCredits(data.credits); setShowStore(true);
    }).catch(() => toast.error('Could not load store'));
  }, []);

  const handleBuy = useCallback(async (itemId) => {
    try {
      const { data } = await axios.post(`${API}/marketplace/buy-item`, { item_id: itemId }, { headers: getHeaders() });
      toast.success(`Purchased ${data.item.name}`);
      setCredits(data.credits_remaining);
      setStoreItems(prev => prev.map(i => i.id === itemId ? { ...i, owned: true } : i));
      // Refresh unlocks
      const { data: u } = await axios.get(`${API}/marketplace/mixer-unlocks`, { headers: getHeaders() });
      setUnlocks(u);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Purchase failed');
    }
  }, []);

  const isPillarUnlocked = (key) => unlocks.has_full_unlock || unlocks.unlocked_pillars.includes(key) || tier === 'SOVEREIGN' || tier === 'ARTISAN';
  const hasWaveform = unlocks.has_waveform || tier === 'ARTISAN' || tier === 'SOVEREIGN';
  const hasEffects = unlocks.unlocked_fx.length > 0 || tier === 'ARTISAN' || tier === 'SOVEREIGN';

  const handleModChange = useCallback((id, v) => setModStates(p => ({ ...p, [id]: { ...p[id], value: v } })), []);
  const toggleMute = useCallback((id) => setModStates(p => ({ ...p, [id]: { ...p[id], muted: !p[id]?.muted } })), []);
  const toggleSolo = useCallback((id) => setModStates(p => ({ ...p, [id]: { ...p[id], solo: !p[id]?.solo } })), []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      id="creator-console-overlay" data-testid="unified-creator-console">

      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(139,92,246,0.15)', zIndex: 2 }}>
        <div className="flex items-center gap-2">
          <button onClick={() => onClose ? onClose() : navigate('/sovereign-hub')}
            className="p-1.5 rounded-lg active:scale-95" style={{ background: 'rgba(255,255,255,0.05)' }} data-testid="creator-exit">
            <ArrowLeft size={14} className="text-white/60" />
          </button>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/80">Creator Console</div>
            <div className="text-[8px] uppercase tracking-wider text-purple-400/60">{tier} — {TOTAL_CHANNELS} ch</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: isPlaying ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isPlaying ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: isPlaying ? '#22C55E' : '#444', boxShadow: isPlaying ? '0 0 4px #22C55E' : 'none' }} />
            <span className="text-[7px] font-mono" style={{ color: isPlaying ? '#22C55E' : '#666' }}>LIVE</span>
          </div>
          <button onClick={() => setIsPlaying(!isPlaying)} className="p-1 rounded" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {isPlaying ? <Pause size={11} className="text-green-400" /> : <Play size={11} className="text-white/50" />}
          </button>
          <button onClick={loadStore} className="p-1.5 rounded-lg active:scale-95" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.15)' }} data-testid="open-store">
            <ShoppingCart size={12} className="text-yellow-400/70" />
          </button>
        </div>
      </div>

      {/* Visual Screen */}
      <div style={{ position: 'absolute', top: '44px', left: 0, right: 0, height: hasWaveform ? '18vh' : '10vh', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {hasWaveform ? (
          <div className="h-full flex flex-col">
            <div className="text-[7px] text-white/25 uppercase tracking-wider mb-1">Live Waveform — {TOTAL_CHANNELS} Channels</div>
            <Waveform levels={pillarLevels} colors={PILLARS.map(p => p.color)} />
            <div className="flex justify-between mt-1 px-0.5">
              {PILLARS.map((p, i) => (
                <div key={p.key} className="flex flex-col items-center">
                  <div className="w-5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pillarLevels[i]}%`, background: p.color }} />
                  </div>
                  <span className="text-[5px] mt-0.5" style={{ color: p.color + '77' }}>{p.title.substring(0, 3)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center gap-3 px-4">
            <Sliders size={18} className="text-purple-400/20" />
            <div>
              <div className="text-[10px] font-bold text-white/50">{TOTAL_CHANNELS} Channels — 7 Pillars</div>
              <button onClick={loadStore} className="flex items-center gap-1 mt-1 text-[8px] text-yellow-400/50">
                <ShoppingCart size={8} /> Unlock Waveform
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ MIXER BOARD ═══ */}
      <div style={{ position: 'absolute', top: hasWaveform ? 'calc(44px + 18vh)' : 'calc(44px + 10vh)', left: 0, right: 0, bottom: 0, overflowY: 'auto' }}>
        {/* Master + Pillar Faders */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] text-white/30 uppercase tracking-wider">Pillar Masters</span>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-white/20">MST</span>
              <input type="range" min="0" max="100" value={masterLevel} onChange={(e) => setMasterLevel(Number(e.target.value))}
                className="w-14 h-1.5 rounded-full cursor-pointer" style={{ accentColor: '#F8FAFC' }} />
              <span className="text-[8px] font-mono text-white/40">{masterLevel}</span>
            </div>
          </div>
          <div className="flex gap-2 justify-between">
            {PILLARS.map((p, idx) => (
              <div key={p.key} className="flex flex-col items-center flex-1 min-w-0">
                {/* Fader value */}
                <div className="text-[8px] font-mono mb-1" style={{ color: p.color }}>{pillarLevels[idx]}</div>
                {/* Horizontal slider for reliability on mobile */}
                <input type="range" min="0" max="100" value={pillarLevels[idx]}
                  onChange={(e) => setPillarLevels(prev => { const n = [...prev]; n[idx] = Number(e.target.value); return n; })}
                  className="w-full h-2 rounded-full cursor-pointer mb-1"
                  style={{ accentColor: p.color }} />
                {/* Pillar label + expand */}
                <button onClick={() => setExpandedPillar(expandedPillar === idx ? null : idx)}
                  className="text-[7px] font-bold uppercase tracking-wider active:scale-90 flex items-center gap-0.5"
                  style={{ color: expandedPillar === idx ? p.color : `${p.color}77` }}
                  data-testid={`pillar-fader-${p.key}`}>
                  {p.title.substring(0, 3)}
                  <ChevronDown size={7} style={{ transform: expandedPillar === idx ? 'rotate(180deg)' : 'none', transition: '0.15s' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Expanded Module Strips */}
        <AnimatePresence>
          {expandedPillar !== null && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden px-2">
              {(() => {
                const p = PILLARS[expandedPillar];
                const unlocked = isPillarUnlocked(p.key);
                return (
                  <div className="p-2 rounded-xl mb-2" style={{ background: `${p.color}05`, border: `1px solid ${p.color}12` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: p.color }}>{p.title} — {p.modules.length} ch</span>
                      {!unlocked && (
                        <button onClick={loadStore} className="flex items-center gap-1 px-2 py-0.5 rounded text-[7px] active:scale-95"
                          style={{ background: `${p.color}10`, border: `1px solid ${p.color}20`, color: p.color }}>
                          <Lock size={7} /> Unlock
                        </button>
                      )}
                    </div>
                    <div className="flex gap-0.5 overflow-x-auto pb-1">
                      {p.modules.map(mod => {
                        const st = modStates[mod.id] || { value: 50, muted: false, solo: false };
                        return (
                          <Fader key={mod.id} value={st.value} onChange={(v) => handleModChange(mod.id, v)}
                            color={p.color} muted={st.muted} solo={st.solo}
                            onMute={() => toggleMute(mod.id)} onSolo={() => toggleSolo(mod.id)}
                            label={mod.label} onNav={() => navigate(mod.route)} locked={!unlocked} />
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Effects Routing (if unlocked) */}
        {hasEffects && (
          <div className="mx-2 mb-2 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-[7px] text-white/25 uppercase tracking-wider mb-1.5">Effects Sends</div>
            <div className="grid grid-cols-4 gap-2">
              {['Reverb', 'Delay', 'Harmonic', 'Sidechain'].map(fx => {
                const fxKey = fx.toLowerCase();
                const owned = unlocks.has_full_unlock || unlocks.unlocked_fx.includes(fxKey) || tier === 'SOVEREIGN';
                return (
                  <div key={fx} className="flex flex-col items-center">
                    <span className="text-[6px] text-white/30 mb-1">{fx}</span>
                    {owned ? (
                      <input type="range" min="0" max="100" defaultValue={35}
                        className="w-full h-0.5 appearance-none rounded-full cursor-pointer"
                        style={{ background: 'linear-gradient(to right, #8B5CF6 35%, rgba(255,255,255,0.05) 35%)' }} />
                    ) : (
                      <button onClick={loadStore} className="text-[6px] text-white/15 flex items-center gap-0.5"><Lock size={6} />Buy</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-4 gap-1 mx-2 mb-2">
          {[
            { label: 'Channels', val: TOTAL_CHANNELS, color: '#C084FC' },
            { label: 'Active', val: Object.values(modStates).filter(s => s.value > 20 && !s.muted).length, color: '#22C55E' },
            { label: 'Muted', val: Object.values(modStates).filter(s => s.muted).length, color: '#EF4444' },
            { label: 'Credits', val: credits || '—', color: '#EAB308' },
          ].map(m => (
            <div key={m.label} className="p-1.5 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="text-[12px] font-mono font-bold" style={{ color: m.color }}>{m.val}</div>
              <div className="text-[6px] text-white/20 uppercase">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Tier + Store CTA */}
        <div className="mx-2 mb-2 p-2.5 rounded-xl" style={{ background: 'rgba(234,179,8,0.03)', border: '1px solid rgba(234,179,8,0.08)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[8px] text-yellow-400/50 uppercase tracking-wider">Tier & Upgrades</span>
            <button onClick={loadStore} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold active:scale-95"
              style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', color: '#EAB308' }} data-testid="store-btn">
              <ShoppingCart size={10} /> Store
            </button>
          </div>
          <div className="flex gap-1">
            {['BASE', 'SEED', 'ARTISAN', 'SOVEREIGN'].map(t => (
              <div key={t} className="flex-1 p-1 rounded-lg text-center" style={{
                background: t === tier ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.015)',
                border: `1px solid ${t === tier ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.03)'}`,
              }}>
                <div className="text-[7px] font-bold" style={{ color: t === tier ? '#C084FC' : 'rgba(255,255,255,0.2)' }}>{t}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launch */}
        <div className="mx-2 mb-4">
          <div className="text-[7px] text-white/20 uppercase tracking-wider mb-1">Quick Launch</div>
          <div className="grid grid-cols-7 gap-0.5">
            {PILLARS.map(p => p.modules.slice(0, 2).map(m => (
              <button key={m.id} onClick={() => navigate(m.route)}
                className="p-1 rounded text-[5px] text-center active:scale-90 truncate"
                style={{ background: `${p.color}06`, border: `1px solid ${p.color}10`, color: `${p.color}99` }}
                data-testid={`quick-${m.id}`}>{m.label}</button>
            )))}
          </div>
        </div>
      </div>

      {/* Store Panel */}
      <AnimatePresence>
        {showStore && <StorePanel items={storeItems} credits={credits} onBuy={handleBuy} onClose={() => setShowStore(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
