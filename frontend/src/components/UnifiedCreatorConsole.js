/**
 * V35.0 SYSTEM-WIDE MIXER — CONTROLS THE SCREEN
 * 
 * Tap a module label on the mixer → it loads in the monitor (top 2/3)
 * Slide a pillar fader → adjusts that pillar's weight in the economy
 * Mute a channel → stops dust accrual for that module
 * The mixer IS the navigation. The mixer IS the controller.
 */

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ChevronDown, ChevronUp, Lock, Sliders, ShoppingCart,
  Home, X, Check, Globe, BarChart3
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const PILLARS = [
  { key: 'practice', title: 'PRA', full: 'Practice', color: '#D8B4FE', modules: [
    { id: 'breathwork', label: 'Breath', route: '/breathing' }, { id: 'meditation', label: 'Medit', route: '/meditation' },
    { id: 'yoga', label: 'Yoga', route: '/yoga' }, { id: 'mudras', label: 'Mudra', route: '/mudras' },
    { id: 'mantras', label: 'Mantra', route: '/mantras' }, { id: 'light', label: 'Light', route: '/light-therapy' },
    { id: 'affirm', label: 'Affirm', route: '/affirmations' }, { id: 'ritual', label: 'Ritual', route: '/daily-ritual' },
    { id: 'mood', label: 'Mood', route: '/mood' },
  ]},
  { key: 'divination', title: 'DIV', full: 'Divination', color: '#E879F9', modules: [
    { id: 'oracle', label: 'Oracle', route: '/oracle' }, { id: 'akashic', label: 'Akashic', route: '/akashic-records' },
    { id: 'stars', label: 'Stars', route: '/star-chart' }, { id: 'numbers', label: 'Numer', route: '/numerology' },
    { id: 'dreams', label: 'Dreams', route: '/dreams' }, { id: 'mayan', label: 'Mayan', route: '/mayan' },
    { id: 'calendar', label: 'Calend', route: '/cosmic-calendar' }, { id: 'cards', label: 'Cards', route: '/cardology' },
    { id: 'totems', label: 'Totems', route: '/animal-totems' },
  ]},
  { key: 'sanctuary', title: 'SAN', full: 'Sanctuary', color: '#2DD4BF', modules: [
    { id: 'zen', label: 'Zen', route: '/zen-garden' }, { id: 'sound', label: 'Sound', route: '/soundscapes' },
    { id: 'music', label: 'Music', route: '/music-lounge' }, { id: 'freq', label: 'Freq', route: '/frequencies' },
    { id: 'vr', label: 'VR', route: '/vr' }, { id: 'journal', label: 'Journal', route: '/journal' },
    { id: 'wisdom', label: 'Wisdom', route: '/wisdom-journal' }, { id: 'green', label: 'Green', route: '/green-journal' },
  ]},
  { key: 'nourish', title: 'NOU', full: 'Nourish', color: '#22C55E', modules: [
    { id: 'nourish', label: 'Nourish', route: '/nourishment' }, { id: 'aroma', label: 'Aroma', route: '/aromatherapy' },
    { id: 'herbs', label: 'Herbs', route: '/herbology' }, { id: 'elixirs', label: 'Elixir', route: '/elixirs' },
    { id: 'acu', label: 'Acu', route: '/acupressure' }, { id: 'reiki', label: 'Reiki', route: '/reiki' },
    { id: 'meals', label: 'Meals', route: '/meal-planning' }, { id: 'reports', label: 'Report', route: '/wellness-reports' },
  ]},
  { key: 'explore', title: 'EXP', full: 'Explore', color: '#FB923C', modules: [
    { id: 'discover', label: 'Discov', route: '/discover' }, { id: 'encycl', label: 'Encycl', route: '/encyclopedia' },
    { id: 'reading', label: 'Read', route: '/reading-list' }, { id: 'stories', label: 'Stories', route: '/creation-stories' },
    { id: 'teach', label: 'Teach', route: '/teachings' }, { id: 'commun', label: 'Commun', route: '/community' },
    { id: 'bless', label: 'Bless', route: '/blessings' }, { id: 'sacred', label: 'Sacred', route: '/sacred-texts' },
    { id: 'profile', label: 'Profile', route: '/cosmic-profile' },
  ]},
  { key: 'sage', title: 'SAG', full: 'Sage AI', color: '#38BDF8', modules: [
    { id: 'coach', label: 'Coach', route: '/coach' }, { id: 'crystals', label: 'Crystal', route: '/crystals' },
    { id: 'briefing', label: 'Brief', route: '/daily-briefing' }, { id: 'forecast', label: 'Forcast', route: '/forecasts' },
  ]},
  { key: 'council', title: 'COU', full: 'Council', color: '#C084FC', modules: [
    { id: 'advisors', label: 'Council', route: '/sovereigns' }, { id: 'economy', label: 'Econ', route: '/economy' },
    { id: 'academy', label: 'Academ', route: '/academy' }, { id: 'trade', label: 'Trade', route: '/trade-circle' },
    { id: 'skins', label: 'Skins', route: '/crystal-skins' }, { id: 'vault', label: 'Vault', route: '/archives' },
    { id: 'ledger', label: 'Ledger', route: '/cosmic-ledger' }, { id: 'alchemy', label: 'Alchem', route: '/resource-alchemy' },
    { id: 'gravity', label: 'Gravty', route: '/gravity-well' }, { id: 'quest', label: 'Quest', route: '/cryptic-quest' },
    { id: 'games', label: 'Games', route: '/games' },
  ]},
];
const TOTAL = PILLARS.reduce((a, p) => a + p.modules.length, 0);

const MixerContext = createContext(null);
export const useMixer = () => useContext(MixerContext);

// ═══ MEDIA RECORDER HOOK ═══
function useMediaControls() {
  const [isRecVideo, setRecVideo] = useState(false);
  const [isRecAudio, setRecAudio] = useState(false);
  const [isRecScreen, setRecScreen] = useState(false);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const stopAll = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setRecVideo(false); setRecAudio(false); setRecScreen(false);
  }, []);

  const startRecording = useCallback(async (type) => {
    try {
      stopAll();
      let stream;
      if (type === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } else if (type === 'video') {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } }, audio: true });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: { ideal: 44100 }, echoCancellation: true, noiseSuppression: true } });
      }
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = type === 'audio' ? 'audio/webm;codecs=opus' : 'video/webm;codecs=vp9,opus';
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: type === 'audio' ? 'audio/webm' : 'video/webm' });
        // Auto-download the recording
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enlighten_${type}_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`${type} saved (${(blob.size / 1024).toFixed(0)}KB)`);
        setRecVideo(false); setRecAudio(false); setRecScreen(false);
      };

      recorderRef.current = recorder;
      recorder.start(1000);
      if (type === 'video') setRecVideo(true);
      else if (type === 'audio') setRecAudio(true);
      else setRecScreen(true);
      toast.success(`${type} recording started`);
    } catch (e) {
      toast.error(`Permission denied: ${e.message}`);
    }
  }, [stopAll]);

  return { isRecVideo, isRecAudio, isRecScreen, startRecording, stopAll, isRecording: isRecVideo || isRecAudio || isRecScreen };
}

// Find which module matches a route
function findModule(route) {
  for (const p of PILLARS) {
    for (const m of p.modules) {
      if (m.route === route) return { ...m, pillar: p };
    }
  }
  return null;
}

// ═══ STRIP VIEW ═══
function StripView({ pillars, pillarLevels, setPillarLevels, masterLevel, setMasterLevel, expandedPillar, setExpandedPillar, modStates, setModStates, onNav, currentRoute, onMuteChange }) {
  const current = findModule(currentRoute);

  return (
    <div style={{ background: '#080812' }}>
      {/* Status + Master */}
      <div className="flex items-center justify-between px-3 py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px #22C55E' }} />
          <span className="text-[7px] font-mono text-green-400/60">LIVE</span>
          {current && <span className="text-[7px] font-bold" style={{ color: current.pillar.color }}>{current.label}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[6px] text-white/15">MST</span>
          <input type="range" min="0" max="100" value={masterLevel} onChange={(e) => setMasterLevel(Number(e.target.value))}
            className="w-10 h-1 rounded-full cursor-pointer" style={{ accentColor: '#F8FAFC' }} />
        </div>
      </div>

      {/* Pillar faders — tap label to expand, drag to control weight */}
      <div className="flex gap-0.5 px-2 py-1.5 items-end">
        {pillars.map((p, i) => {
          const isActive = current?.pillar.key === p.key;
          return (
            <div key={p.key} className="flex-1 min-w-0 flex flex-col items-center">
              <div className="text-[6px] font-mono" style={{ color: p.color + (isActive ? 'FF' : '66') }}>{pillarLevels[i]}</div>
              <input type="range" min="0" max="100" value={pillarLevels[i]}
                onChange={(e) => setPillarLevels(prev => { const n = [...prev]; n[i] = Number(e.target.value); return n; })}
                className="w-full h-1.5 rounded-full cursor-pointer" style={{ accentColor: p.color }} />
              <button onClick={() => setExpandedPillar(expandedPillar === i ? null : i)}
                className="text-[6px] font-bold uppercase active:scale-90 mt-0.5"
                style={{ color: expandedPillar === i ? p.color : isActive ? p.color + 'CC' : p.color + '44' }}
                data-testid={`pillar-fader-${p.key}`}>
                {p.title}
                <ChevronUp size={5} className="inline ml-px" style={{ transform: expandedPillar === i ? 'rotate(180deg)' : 'none', transition: '.15s' }} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Expanded channels — tap label = NAVIGATE to that module */}
      <AnimatePresence>
        {expandedPillar !== null && (() => {
          const p = pillars[expandedPillar];
          return (
            <motion.div key={p.key} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }} className="overflow-hidden">
              <div className="px-2 pb-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[6px] font-bold uppercase tracking-wider" style={{ color: p.color }}>{p.full} · {p.modules.length}ch</span>
                </div>
                <div className="flex gap-0.5 overflow-x-auto pb-0.5">
                  {p.modules.map(mod => {
                    const st = modStates[mod.id] || { value: 50, muted: false, solo: false };
                    const isCurrentMod = currentRoute === mod.route;
                    return (
                      <div key={mod.id} className="flex flex-col items-center w-[36px] flex-shrink-0" style={{ opacity: st.muted ? 0.3 : 1 }}>
                        <input type="range" min="0" max="100" value={st.value}
                          onChange={(e) => setModStates(prev => ({ ...prev, [mod.id]: { ...prev[mod.id], value: Number(e.target.value) } }))}
                          className="w-full h-1 rounded-full cursor-pointer mb-0.5" style={{ accentColor: p.color }} />
                        <div className="flex gap-px">
                          <button onClick={() => {
                            const newMuted = !st.muted;
                            setModStates(prev => ({ ...prev, [mod.id]: { ...prev[mod.id], muted: newMuted } }));
                            onMuteChange(mod.id, newMuted);
                          }}
                            className="w-3 h-2 rounded-sm text-[4px] font-bold" style={{ background: st.muted ? '#EF4444' : 'rgba(255,255,255,0.04)', color: st.muted ? '#fff' : 'rgba(255,255,255,0.12)' }}>M</button>
                          <button onClick={() => setModStates(prev => ({ ...prev, [mod.id]: { ...prev[mod.id], solo: !st.solo } }))}
                            className="w-3 h-2 rounded-sm text-[4px] font-bold" style={{ background: st.solo ? '#EAB308' : 'rgba(255,255,255,0.04)', color: st.solo ? '#000' : 'rgba(255,255,255,0.12)' }}>S</button>
                        </div>
                        {/* TAP LABEL = LOAD THIS MODULE ON SCREEN */}
                        <button onClick={() => onNav(mod.route)}
                          className="text-[5px] truncate w-full text-center active:scale-90 mt-px font-bold"
                          style={{
                            color: isCurrentMod ? '#000' : p.color + 'CC',
                            background: isCurrentMod ? p.color : 'transparent',
                            borderRadius: '2px',
                            padding: isCurrentMod ? '1px 0' : 0,
                          }}
                          data-testid={`mixer-nav-${mod.id}`}>
                          {mod.label}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

// ═══ ORBITAL SPHERE ═══
function OrbitalSphere({ pillars, pillarLevels, onNav, currentRoute }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const [hoveredPillar, setHoveredPillar] = useState(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width; const h = c.height;
    const cx = w / 2; const cy = h / 2;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // Central phi core
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35);
      grad.addColorStop(0, 'rgba(139,92,246,0.25)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, 35, 0, Math.PI * 2); ctx.fill();

      // Orbital rings
      [34, 55, 89].forEach((r, i) => {
        ctx.beginPath(); ctx.strokeStyle = `rgba(139,92,246,${0.03 + i * 0.02})`; ctx.lineWidth = 0.5;
        ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      });

      // Pillar nodes
      pillars.forEach((p, i) => {
        const r = 28 + i * 12;
        const angle = i * GOLDEN_ANGLE + t * 0.003;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const level = pillarLevels[i] / 100;
        const size = 4 + level * 7;
        const isCurrent = findModule(currentRoute)?.pillar.key === p.key;

        // Connection line
        ctx.beginPath(); ctx.strokeStyle = p.color + Math.round(level * 50 + 10).toString(16).padStart(2, '0');
        ctx.lineWidth = isCurrent ? 2 : level * 1.2; ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();

        // Node
        ctx.beginPath(); ctx.fillStyle = p.color + (isCurrent ? 'FF' : Math.round(level * 180 + 40).toString(16).padStart(2, '0'));
        ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();

        if (isCurrent || level > 0.6) {
          ctx.beginPath();
          const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
          glow.addColorStop(0, p.color + '25'); glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow; ctx.arc(x, y, size * 2.5, 0, Math.PI * 2); ctx.fill();
        }

        ctx.fillStyle = isCurrent ? '#fff' : p.color + '88';
        ctx.font = `${isCurrent ? 'bold ' : ''}7px monospace`; ctx.textAlign = 'center';
        ctx.fillText(p.title, x, y + size + 9);

        // Sub-nodes when hovered
        if (hoveredPillar === i) {
          p.modules.forEach((m, mi) => {
            const subAngle = angle + (mi - p.modules.length / 2) * 0.28;
            const subR = r + 18 + mi * 2.5;
            const mx = cx + Math.cos(subAngle) * subR;
            const my = cy + Math.sin(subAngle) * subR;
            const isThisMod = m.route === currentRoute;
            ctx.beginPath(); ctx.fillStyle = isThisMod ? p.color : p.color + '55';
            ctx.arc(mx, my, isThisMod ? 4 : 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = isThisMod ? '#fff' : p.color + '44';
            ctx.font = '5px monospace'; ctx.fillText(m.label, mx, my + 8);
          });
        }
      });

      ctx.fillStyle = 'rgba(248,250,252,0.35)'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('\u03C6', cx, cy + 3);
      t++; frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [pillars, pillarLevels, hoveredPillar, currentRoute]);

  const handleTap = (e) => {
    const c = canvasRef.current; const rect = c.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (c.width / rect.width);
    const y = (e.clientY - rect.top) * (c.height / rect.height);
    const cx = c.width / 2; const cy = c.height / 2;

    // Check sub-nodes first (if a pillar is hovered/expanded)
    if (hoveredPillar !== null) {
      const p = pillars[hoveredPillar]; const i = hoveredPillar;
      const r = 28 + i * 12; const angle = i * GOLDEN_ANGLE;
      for (let mi = 0; mi < p.modules.length; mi++) {
        const subAngle = angle + (mi - p.modules.length / 2) * 0.28;
        const subR = r + 18 + mi * 2.5;
        const mx = cx + Math.cos(subAngle) * subR;
        const my = cy + Math.sin(subAngle) * subR;
        if (Math.sqrt((x - mx) ** 2 + (y - my) ** 2) < 12) {
          onNav(p.modules[mi].route);
          return;
        }
      }
    }

    // Check pillar nodes
    pillars.forEach((p, i) => {
      const r = 28 + i * 12; const angle = i * GOLDEN_ANGLE;
      const px = cx + Math.cos(angle) * r; const py = cy + Math.sin(angle) * r;
      if (Math.sqrt((x - px) ** 2 + (y - py) ** 2) < 15) {
        setHoveredPillar(hoveredPillar === i ? null : i);
      }
    });
  };

  return <canvas ref={canvasRef} width={300} height={200} onClick={handleTap} className="w-full h-full cursor-pointer" style={{ background: 'transparent' }} />;
}

// ═══ STORE ═══
function StorePanel({ items, credits, onBuy, onClose }) {
  return (
    <div id="mixer-store-overlay" style={{ position: 'fixed', inset: 0, zIndex: 2147483647, background: '#060610' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
        <div><div className="text-sm font-bold text-white/90">Mixer Store</div><div className="text-[10px] text-white/40">{credits} Credits</div></div>
        <button onClick={onClose} className="p-2 rounded-lg active:scale-90" style={{ background: 'rgba(255,255,255,0.05)' }}><X size={16} className="text-white/60" /></button>
      </div>
      <div style={{ height: 'calc(100vh - 52px)', overflowY: 'auto', padding: '12px' }}>
        {[{ key: 'mixer', label: 'Channel Packs' }, { key: 'mixer_fx', label: 'Effects' }, { key: 'mixer_visual', label: 'Visuals' }, { key: 'mixer_bundle', label: 'Bundles' }].map(cat => {
          const ci = items.filter(i => i.category === cat.key);
          if (!ci.length) return null;
          return (<div key={cat.key} className="mb-4">
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">{cat.label}</div>
            {ci.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl mb-1.5" style={{ background: item.owned ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${item.owned ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)'}` }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${item.color}12` }}>{item.owned ? <Check size={12} style={{ color: '#22C55E' }} /> : <Lock size={10} style={{ color: item.color }} />}</div>
                <div className="flex-1 min-w-0"><div className="text-[11px] font-medium text-white/80">{item.name}</div><div className="text-[9px] text-white/30 truncate">{item.description}</div></div>
                {item.owned ? <span className="text-[8px] text-green-400/50">OWNED</span> : <button onClick={() => onBuy(item.id)} className="px-2.5 py-1 rounded-lg text-[9px] font-bold active:scale-95" style={{ background: `${item.color}12`, border: `1px solid ${item.color}25`, color: item.color }}>{item.price_credits}c</button>}
              </div>
            ))}
          </div>);
        })}
      </div>
    </div>
  );
}

// ═══ MAIN PROVIDER — Wraps entire app ═══
export function MixerProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [tier, setTier] = useState('SEED');
  const [unlocks, setUnlocks] = useState({ unlocked_pillars: [], unlocked_fx: [], has_full_unlock: false });
  const [pillarLevels, setPillarLevels] = useState(PILLARS.map(() => 75));
  const [expandedPillar, setExpandedPillar] = useState(null);
  const [modStates, setModStates] = useState({});
  const [masterLevel, setMasterLevel] = useState(80);
  const [showStore, setShowStore] = useState(false);
  const [storeItems, setStoreItems] = useState([]);
  const [credits, setCredits] = useState(0);
  const [mixerState, setMixerState] = useState('expanded');
  const [viewMode, setViewMode] = useState('strip');
  const [mutedModules, setMutedModules] = useState(new Set());
  const media = useMediaControls();

  const hideMixer = ['/', '/landing', '/auth', '/intro', '/sovereign-hub'].includes(location.pathname);

  useEffect(() => {
    const s = {};
    PILLARS.forEach(p => p.modules.forEach(m => { s[m.id] = { value: 50, muted: false, solo: false }; }));
    setModStates(s);
  }, []);

  useEffect(() => {
    const h = getHeaders();
    axios.get(`${API}/transmuter/status`, { headers: h }).then(({ data }) => {
      const t = (data.tier_name || 'SEED').toUpperCase();
      if (['BASE', 'SEED', 'ARTISAN', 'SOVEREIGN'].includes(t)) setTier(t);
    }).catch(() => {});
    axios.get(`${API}/marketplace/mixer-unlocks`, { headers: h }).then(({ data }) => setUnlocks(data)).catch(() => {});
  }, []);

  // Mute/unmute controls dust accrual — expose to global window
  useEffect(() => {
    window.__mixerMuted = mutedModules;
    // Override workAccrue to respect muted channels
    const origAccrue = window.__workAccrueOriginal || window.__workAccrue;
    if (origAccrue && !window.__workAccrueOriginal) {
      window.__workAccrueOriginal = origAccrue;
    }
    window.__workAccrue = (module, weight) => {
      if (mutedModules.has(module)) return; // MUTED — no dust
      if (window.__workAccrueOriginal) window.__workAccrueOriginal(module, weight);
    };
  }, [mutedModules]);

  const handleMuteChange = useCallback((modId, muted) => {
    setMutedModules(prev => {
      const next = new Set(prev);
      if (muted) next.add(modId); else next.delete(modId);
      return next;
    });
  }, []);

  const loadStore = useCallback(() => {
    axios.get(`${API}/marketplace/mixer-store`, { headers: getHeaders() }).then(({ data }) => {
      setStoreItems(data.items); setCredits(data.credits); setShowStore(true);
    }).catch(() => toast.error('Login required'));
  }, []);

  const handleBuy = useCallback(async (itemId) => {
    try {
      const { data } = await axios.post(`${API}/marketplace/buy-item`, { item_id: itemId }, { headers: getHeaders() });
      toast.success(`Purchased ${data.item.name}`);
      setCredits(data.credits_remaining);
      setStoreItems(prev => prev.map(i => i.id === itemId ? { ...i, owned: true } : i));
      const { data: u } = await axios.get(`${API}/marketplace/mixer-unlocks`, { headers: getHeaders() });
      setUnlocks(u);
    } catch (e) { toast.error(e.response?.data?.detail || 'Purchase failed'); }
  }, []);

  // THIS IS THE KEY: tapping a module label navigates the SCREEN
  const handleNav = useCallback((route) => {
    setExpandedPillar(null);
    navigate(route);
  }, [navigate]);

  const mixerHeight = mixerState === 'expanded' ? '33.34vh' : mixerState === 'collapsed' ? '36px' : '0px';
  const monitorHeight = hideMixer || mixerState === 'hidden' ? '100vh' : mixerState === 'expanded' ? '66.66vh' : 'calc(100vh - 36px)';

  useEffect(() => {
    document.documentElement.style.setProperty('--mixer-height', hideMixer ? '0px' : mixerHeight);
    document.documentElement.style.setProperty('--monitor-height', monitorHeight);
  }, [mixerState, hideMixer, mixerHeight, monitorHeight]);

  const ctx = { tier, unlocks, pillarLevels, masterLevel, modStates, mixerState, setMixerState, viewMode, setViewMode, loadStore, handleNav, mutedModules };

  return (
    <MixerContext.Provider value={ctx}>
      {children}

      {createPortal(
        <>
          {!hideMixer && mixerState !== 'hidden' && (
            <div data-testid="mixer-strip">
              {mixerState === 'collapsed' ? (
                <div className="h-full flex items-center justify-between px-3" style={{ background: '#080812', borderTop: '1px solid rgba(139,92,246,0.1)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 3px #22C55E' }} />
                    <span className="text-[7px] font-mono text-white/30">{TOTAL}ch</span>
                    {findModule(location.pathname) && <span className="text-[7px] font-bold" style={{ color: findModule(location.pathname).pillar.color }}>{findModule(location.pathname).label}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {PILLARS.map((p, i) => <div key={p.key} className="w-1 h-3 rounded-full" style={{ background: p.color + Math.round(pillarLevels[i] * 2.55).toString(16).padStart(2, '0') }} />)}
                  </div>
                  <button onClick={() => setMixerState('expanded')} className="p-1 rounded active:scale-90" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <ChevronUp size={10} className="text-white/40" />
                  </button>
                </div>
              ) : (
                <>
                  {/* TOOL CONTENT AREA — swaps based on active tab */}
                  <div style={{ height: 'calc(var(--mixer-height, 33.34vh) - 40px)', overflowY: 'auto', background: '#080812', borderTop: '1px solid rgba(139,92,246,0.12)' }}>
                    {activeTab === 'mix' && (
                      viewMode === 'strip' ? (
                        <StripView pillars={PILLARS} pillarLevels={pillarLevels} setPillarLevels={setPillarLevels}
                          masterLevel={masterLevel} setMasterLevel={setMasterLevel} expandedPillar={expandedPillar}
                          setExpandedPillar={setExpandedPillar} modStates={modStates} setModStates={setModStates}
                          onNav={handleNav} currentRoute={location.pathname} onMuteChange={handleMuteChange} />
                      ) : (
                        <div className="h-full" style={{ background: '#050508' }}>
                          <OrbitalSphere pillars={PILLARS} pillarLevels={pillarLevels} onNav={handleNav} currentRoute={location.pathname} />
                        </div>
                      )
                    )}

                    {activeTab === 'record' && (
                      <div className="p-3 space-y-2">
                        <div className="text-[8px] text-white/30 uppercase tracking-wider mb-2">Capture</div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: 'video', label: 'Video', desc: 'Camera + Mic', active: media.isRecVideo, color: '#EF4444' },
                            { key: 'audio', label: 'Audio', desc: 'Mic Only', active: media.isRecAudio, color: '#F59E0B' },
                            { key: 'screen', label: 'Screen', desc: 'Screen Capture', active: media.isRecScreen, color: '#8B5CF6' },
                          ].map(r => (
                            <button key={r.key} onClick={() => r.active ? media.stopAll() : media.startRecording(r.key)}
                              className="p-3 rounded-xl text-center active:scale-95"
                              style={{ background: r.active ? `${r.color}20` : 'rgba(255,255,255,0.02)', border: `1px solid ${r.active ? `${r.color}40` : 'rgba(255,255,255,0.06)'}` }}
                              data-testid={`rec-${r.key}`}>
                              {r.active && <div className="w-3 h-3 rounded-full mx-auto mb-1 animate-pulse" style={{ background: r.color }} />}
                              <div className="text-[10px] font-bold" style={{ color: r.active ? r.color : 'rgba(255,255,255,0.6)' }}>{r.active ? 'STOP' : r.label}</div>
                              <div className="text-[7px] text-white/25">{r.desc}</div>
                            </button>
                          ))}
                        </div>
                        {media.isRecording && (
                          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[9px] text-red-400/70">Recording — tap STOP to save</span>
                          </div>
                        )}
                        <div className="text-[8px] text-white/30 uppercase tracking-wider mt-3 mb-2">Timeline</div>
                        <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span className="text-[9px] font-mono text-white/40">00:00 / 00:00</span>
                          <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                          <button className="text-[8px] text-white/30 px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>+Intro</button>
                          <button className="text-[8px] text-white/30 px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>+Outro</button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'audio' && (
                      <div className="p-3 space-y-2">
                        <div className="text-[8px] text-white/30 uppercase tracking-wider mb-2">Audio Mixing</div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Record Voice', desc: 'Mic capture', action: () => media.startRecording('audio') },
                            { label: 'Import Audio', desc: 'From device', action: () => document.getElementById('audio-import')?.click() },
                            { label: 'Mute Track', desc: 'Silence audio', action: () => toast('Track muted') },
                            { label: 'Volume', desc: 'Adjust levels', action: null },
                          ].map(a => (
                            <button key={a.label} onClick={a.action} className="p-2.5 rounded-xl text-left active:scale-95" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div className="text-[10px] font-medium text-white/60">{a.label}</div>
                              <div className="text-[7px] text-white/25">{a.desc}</div>
                            </button>
                          ))}
                        </div>
                        <input type="file" id="audio-import" accept="audio/*" className="hidden" onChange={(e) => { if (e.target.files[0]) toast.success(`Audio loaded: ${e.target.files[0].name}`); }} />
                        <div className="text-[8px] text-white/30 uppercase tracking-wider mt-3 mb-1">Master Volume</div>
                        <input type="range" min="0" max="100" defaultValue={80} className="w-full h-1.5 rounded-full cursor-pointer" style={{ accentColor: '#38BDF8' }} />
                      </div>
                    )}

                    {activeTab === 'text' && (
                      <div className="p-3 space-y-2">
                        <div className="text-[8px] text-white/30 uppercase tracking-wider mb-2">Text & Titles</div>
                        <div className="grid grid-cols-3 gap-2">
                          {['Title', 'Subtitle', 'Caption', 'Quote', 'Label', 'Watermark'].map(t => (
                            <button key={t} className="p-2.5 rounded-xl text-center active:scale-95" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div className="text-[10px] font-medium text-white/60">{t}</div>
                            </button>
                          ))}
                        </div>
                        <textarea placeholder="Enter text..." rows={2} className="w-full mt-2 p-2 rounded-lg text-[11px] text-white/70 resize-none" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }} />
                      </div>
                    )}

                    {activeTab === 'overlay' && (
                      <div className="p-3 space-y-2">
                        <div className="text-[8px] text-white/30 uppercase tracking-wider mb-2">Overlay & Layers</div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Image', desc: 'Add photo' },
                            { label: 'Video', desc: 'Layer video' },
                            { label: 'Sticker', desc: 'Add sticker' },
                            { label: 'Logo', desc: 'Brand mark' },
                            { label: 'Frame', desc: 'Border frame' },
                            { label: 'Shape', desc: 'Geometric' },
                          ].map(o => (
                            <button key={o.label} onClick={() => { if (o.label === 'Image') document.getElementById('img-import')?.click(); }}
                              className="p-2.5 rounded-xl text-center active:scale-95" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div className="text-[10px] font-medium text-white/60">{o.label}</div>
                              <div className="text-[7px] text-white/25">{o.desc}</div>
                            </button>
                          ))}
                        </div>
                        <input type="file" id="img-import" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files[0]) toast.success(`Image loaded: ${e.target.files[0].name}`); }} />
                      </div>
                    )}

                    {activeTab === 'effects' && (
                      <div className="p-3 space-y-2">
                        <div className="text-[8px] text-white/30 uppercase tracking-wider mb-2">Effects & Filters</div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { label: 'Blur', color: '#8B5CF6' }, { label: 'Adjust', color: '#3B82F6' },
                            { label: 'Filter', color: '#2DD4BF' }, { label: 'Video FX', color: '#E879F9' },
                            { label: 'Overlay FX', color: '#FB923C' }, { label: 'Body FX', color: '#22C55E' },
                            { label: 'Highlight', color: '#EAB308' }, { label: 'Mosaic', color: '#EF4444' },
                          ].map(fx => (
                            <button key={fx.label} className="p-2 rounded-xl text-center active:scale-95" style={{ background: `${fx.color}08`, border: `1px solid ${fx.color}15` }}>
                              <div className="text-[9px] font-medium" style={{ color: fx.color }}>{fx.label}</div>
                            </button>
                          ))}
                        </div>
                        <div className="text-[8px] text-white/30 uppercase tracking-wider mt-3 mb-1">Intensity</div>
                        <input type="range" min="0" max="100" defaultValue={50} className="w-full h-1.5 rounded-full cursor-pointer" style={{ accentColor: '#8B5CF6' }} />
                      </div>
                    )}

                    {activeTab === 'ai' && (
                      <div className="p-3 space-y-2">
                        <div className="text-[8px] text-white/30 uppercase tracking-wider mb-2">AI Creation Tools</div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Image to Video', color: '#E879F9' },
                            { label: 'AI Art', color: '#8B5CF6' },
                            { label: 'Text to Image', color: '#3B82F6' },
                            { label: 'Text to Speech', color: '#2DD4BF' },
                            { label: 'AI Music', color: '#22C55E' },
                            { label: 'AI Avatar', color: '#FB923C' },
                          ].map(ai => (
                            <button key={ai.label} className="p-2.5 rounded-xl text-center active:scale-95" style={{ background: `${ai.color}08`, border: `1px solid ${ai.color}18` }}>
                              <div className="text-[9px] font-bold" style={{ color: ai.color }}>{ai.label}</div>
                            </button>
                          ))}
                        </div>
                        <textarea placeholder="Describe what to create..." rows={2} className="w-full mt-2 p-2 rounded-lg text-[11px] text-white/70 resize-none" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }} />
                      </div>
                    )}

                    {activeTab === 'export' && (
                      <div className="p-3 space-y-2">
                        <div className="text-[8px] text-white/30 uppercase tracking-wider mb-2">Export & Share</div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Aspect Ratio', desc: '16:9 / 9:16 / 1:1 / 4:3' },
                            { label: 'Quality', desc: 'HD / Full HD / 4K' },
                            { label: 'Export Video', desc: 'Save to device' },
                            { label: 'Broadcast', desc: 'Share to platform' },
                          ].map(ex => (
                            <button key={ex.label} onClick={() => {
                              if (ex.label === 'Broadcast') {
                                navigator.share?.({ title: 'ENLIGHTEN.MINT.CAFE', text: 'Created with the Sovereign Engine', url: window.location.origin }).catch(() => {});
                              }
                            }}
                              className="p-3 rounded-xl text-left active:scale-95" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div className="text-[10px] font-medium text-white/60">{ex.label}</div>
                              <div className="text-[7px] text-white/25">{ex.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TOOL TAB BAR — bottom of mixer */}
                  <div className="flex items-center justify-between px-1" style={{ height: '40px', background: '#060610', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    {TOOL_TABS.map(tab => (
                      <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className="flex-1 flex flex-col items-center justify-center py-1 active:scale-95 transition-all"
                        style={{ color: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.2)' }}
                        data-testid={`tab-${tab.key}`}>
                        <tab.icon size={12} />
                        <span className="text-[6px] font-bold mt-0.5 uppercase">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {!hideMixer && mixerState === 'hidden' && (
            <button onClick={() => setMixerState('collapsed')} style={{ position: 'fixed', bottom: 6, right: 6, zIndex: 10, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', padding: '5px 8px' }} className="active:scale-95" data-testid="mixer-show">
              <Sliders size={12} className="text-purple-400/50" />
            </button>
          )}

          {!hideMixer && mixerState !== 'hidden' && (
            <button onClick={() => setMixerState('hidden')} style={{ position: 'fixed', bottom: `calc(var(--mixer-height, 0px) + 3px)`, right: 6, zIndex: 11, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '5px', padding: '2px 5px' }} className="active:scale-95" data-testid="mixer-hide">
              <X size={8} className="text-white/30" />
            </button>
          )}

          <AnimatePresence>
            {showStore && <StorePanel items={storeItems} credits={credits} onBuy={handleBuy} onClose={() => setShowStore(false)} />}
          </AnimatePresence>
        </>,
        document.body
      )}
    </MixerContext.Provider>
  );
}

// Creator Console page
export default function UnifiedCreatorConsole({ onClose }) {
  const navigate = useNavigate();
  const mixer = useMixer();
  useEffect(() => { mixer?.setMixerState?.('expanded'); }, []);
  return (
    <div className="min-h-screen p-4" style={{ background: '#000' }}>
      <button onClick={() => onClose ? onClose() : navigate('/sovereign-hub')} className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl active:scale-95" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(248,250,252,0.5)' }} data-testid="creator-exit"><ArrowLeft size={14} /><span className="text-xs">Hub</span></button>
      <h1 className="text-lg font-bold text-white/80 mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Creator Console</h1>
      <p className="text-[10px] text-white/25 mb-4">The mixer below controls the screen. Tap any module name to load it in the monitor. Mute a channel to stop its dust accrual. Switch between Strip and Orbital modes.</p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[{ l: 'Channels', v: TOTAL, c: '#C084FC' }, { l: 'Tier', v: mixer?.tier || '—', c: '#8B5CF6' }, { l: 'Master', v: mixer?.masterLevel || 80, c: '#F8FAFC' }, { l: 'Muted', v: mixer?.mutedModules?.size || 0, c: '#EF4444' }].map(m => (
          <div key={m.l} className="p-2 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}><div className="text-sm font-mono font-bold" style={{ color: m.c }}>{m.v}</div><div className="text-[6px] text-white/25 uppercase">{m.l}</div></div>
        ))}
      </div>
      <button onClick={() => mixer?.loadStore?.()} className="flex items-center gap-2 px-4 py-2 rounded-xl active:scale-95 w-full justify-center" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)', color: '#EAB308' }} data-testid="store-btn"><ShoppingCart size={14} />Mixer Store</button>
    </div>
  );
}
