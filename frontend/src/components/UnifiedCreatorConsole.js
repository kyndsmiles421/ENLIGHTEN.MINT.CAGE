/**
 * V38.0 SOVEREIGN MIXER — SAME PLANE ARCHITECTURE
 * 
 * Zero floating buttons. Zero overlays. Zero z-index.
 * Everything is a sibling in a flex column:
 *   [content]  ← flex: 1, scrollable
 *   [panel]    ← slides open when tab tapped
 *   [nav bar]  ← 44px, always at bottom
 * 
 * One plane. One organism. Pulled up as needed.
 */

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ChevronUp, Lock, Sliders, ShoppingCart,
  X, Check, Globe, ArrowLeft,
  Video, Music, Type, Layers, Wand2,
  Sparkles, Download, Maximize2, Minimize2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
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

const TOOL_TABS = [
  { key: 'mix', label: 'Mix', icon: Sliders, color: '#C084FC' },
  { key: 'record', label: 'Rec', icon: Video, color: '#EF4444' },
  { key: 'audio', label: 'Audio', icon: Music, color: '#38BDF8' },
  { key: 'text', label: 'Text', icon: Type, color: '#F8FAFC' },
  { key: 'overlay', label: 'Layer', icon: Layers, color: '#2DD4BF' },
  { key: 'effects', label: 'FX', icon: Wand2, color: '#E879F9' },
  { key: 'ai', label: 'AI', icon: Sparkles, color: '#FB923C' },
  { key: 'export', label: 'Out', icon: Download, color: '#22C55E' },
];

const DEFAULT_FILTERS = { blur: 0, brightness: 100, contrast: 100, hueRotate: 0, saturate: 100, sepia: 0, invert: 0 };

const MixerContext = createContext(null);
export const useMixer = () => useContext(MixerContext);

// ═══ MEDIA RECORDER ═══
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
    streamRef.current = null; recorderRef.current = null;
    setRecVideo(false); setRecAudio(false); setRecScreen(false);
  }, []);

  const startRecording = useCallback(async (type) => {
    try {
      stopAll();
      let stream;
      if (type === 'screen') stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      else if (type === 'video') stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } }, audio: true });
      else stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: { ideal: 44100 }, echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream; chunksRef.current = [];
      const mimeType = type === 'audio' ? 'audio/webm;codecs=opus' : 'video/webm;codecs=vp9,opus';
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: type === 'audio' ? 'audio/webm' : 'video/webm' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a');
        a.href = url; a.download = `enlighten_${type}_${Date.now()}.webm`; a.click();
        URL.revokeObjectURL(url);
        toast.success(`${type} saved (${(blob.size / 1024).toFixed(0)}KB)`);
        setRecVideo(false); setRecAudio(false); setRecScreen(false);
      };
      recorderRef.current = recorder; recorder.start(1000);
      if (type === 'video') setRecVideo(true); else if (type === 'audio') setRecAudio(true); else setRecScreen(true);
      toast.success(`${type} recording started`);
    } catch (e) { toast.error(`Permission denied: ${e.message}`); }
  }, [stopAll]);

  return { isRecVideo, isRecAudio, isRecScreen, startRecording, stopAll, isRecording: isRecVideo || isRecAudio || isRecScreen };
}

function findModule(route) {
  for (const p of PILLARS) for (const m of p.modules) if (m.route === route) return { ...m, pillar: p };
  return null;
}

// ═══════════════════════════════════════════════════════════════
// MIXER PROVIDER — SAME PLANE, NO PORTALS, NO FLOATING
// Flex column: [content | panel | nav]
// ═══════════════════════════════════════════════════════════════

export function MixerProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const media = useMediaControls();

  const [tier, setTier] = useState('SEED');
  const [unlocks, setUnlocks] = useState({ unlocked_pillars: [], unlocked_fx: [], has_full_unlock: false });
  const [pillarLevels, setPillarLevels] = useState(PILLARS.map(() => 75));
  const [expandedPillar, setExpandedPillar] = useState(null);
  const [modStates, setModStates] = useState({});
  const [masterLevel, setMasterLevel] = useState(80);
  const [showStore, setShowStore] = useState(false);
  const [storeItems, setStoreItems] = useState([]);
  const [credits, setCredits] = useState(0);
  const [viewMode, setViewMode] = useState('strip');
  const [mutedModules, setMutedModules] = useState(new Set());

  const [activePanel, setActivePanel] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [monitorFilters, setMonitorFilters] = useState({ ...DEFAULT_FILTERS });
  const [textOverlays, setTextOverlays] = useState([]);
  const [imageOverlays, setImageOverlays] = useState([]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');
  const textInputRef = useRef(null);

  const hideMixer = ['/', '/sovereign-hub', '/landing', '/auth', '/intro'].includes(location.pathname);
  const showMixer = !hideMixer && !isFullscreen;

  const togglePanel = useCallback((key) => {
    setActivePanel(prev => prev === key ? null : key);
  }, []);

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

  useEffect(() => {
    window.__mixerMuted = mutedModules;
    const origAccrue = window.__workAccrueOriginal || window.__workAccrue;
    if (origAccrue && !window.__workAccrueOriginal) window.__workAccrueOriginal = origAccrue;
    window.__workAccrue = (module, weight) => {
      if (mutedModules.has(module)) return;
      if (window.__workAccrueOriginal) window.__workAccrueOriginal(module, weight);
    };
  }, [mutedModules]);

  // REAL: CSS filters on content
  useEffect(() => {
    const stage = document.getElementById('app-stage');
    if (!stage) return;
    const { blur, brightness, contrast, hueRotate, saturate, sepia, invert } = monitorFilters;
    const hasFilter = blur > 0 || brightness !== 100 || contrast !== 100 || hueRotate > 0 || saturate !== 100 || sepia > 0 || invert > 0;
    stage.style.filter = hasFilter
      ? `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) hue-rotate(${hueRotate}deg) saturate(${saturate}%) sepia(${sepia}%) invert(${invert}%)`
      : 'none';
    stage.style.transition = 'filter 0.3s ease';
  }, [monitorFilters]);

  // REAL: Master volume
  useEffect(() => {
    const vol = masterLevel / 100;
    document.querySelectorAll('audio, video').forEach(el => { el.volume = Math.min(1, Math.max(0, vol)); });
  }, [masterLevel]);

  // Force #app-stage to NOT have minHeight: 100vh when mixer is inline
  useEffect(() => {
    const stage = document.getElementById('app-stage');
    if (stage) {
      stage.style.minHeight = showMixer ? '0' : '';
      stage.style.flex = showMixer ? '1' : '';
      stage.style.overflow = showMixer ? 'auto' : '';
    }
  }, [showMixer]);

  const handleMuteChange = useCallback((modId, muted) => {
    setMutedModules(prev => { const next = new Set(prev); if (muted) next.add(modId); else next.delete(modId); return next; });
  }, []);

  const loadStore = useCallback(() => {
    axios.get(`${API}/marketplace/mixer-store`, { headers: getHeaders() }).then(({ data }) => {
      setStoreItems(data.items); setCredits(data.credits); setShowStore(true);
    }).catch(() => toast.error('Login required'));
  }, []);

  const handleBuy = useCallback(async (itemId) => {
    try {
      const { data } = await axios.post(`${API}/marketplace/buy-item`, { item_id: itemId }, { headers: getHeaders() });
      toast.success(`Purchased ${data.item.name}`); setCredits(data.credits_remaining);
      setStoreItems(prev => prev.map(i => i.id === itemId ? { ...i, owned: true } : i));
      const { data: u } = await axios.get(`${API}/marketplace/mixer-unlocks`, { headers: getHeaders() });
      setUnlocks(u);
    } catch (e) { toast.error(e.response?.data?.detail || 'Purchase failed'); }
  }, []);

  const handleNav = useCallback((route) => {
    setExpandedPillar(null); setActivePanel(null); navigate(route);
  }, [navigate]);

  const current = findModule(location.pathname);

  const ctx = {
    tier, unlocks, pillarLevels, masterLevel, modStates, viewMode, setViewMode,
    loadStore, handleNav, mutedModules, activePanel, setActivePanel: togglePanel,
    isFullscreen, setIsFullscreen, monitorFilters, setMonitorFilters,
    textOverlays, setTextOverlays, imageOverlays, setImageOverlays,
    selectedAspectRatio, setSelectedAspectRatio,
    mixerState: activePanel ? 'expanded' : 'collapsed', setMixerState: () => {},
  };

  // ═══ PANEL CONTENT ═══

  const renderMixPanel = () => (
    <div style={{ background: '#080812' }}>
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px #22C55E' }} />
          <span className="text-[7px] font-mono text-green-400/60">LIVE</span>
          {current && <span className="text-[8px] font-bold" style={{ color: current.pillar.color }}>{current.label}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[6px] text-white/15">MST</span>
          <input type="range" min="0" max="100" value={masterLevel} onChange={(e) => setMasterLevel(Number(e.target.value))}
            className="w-12 h-1 rounded-full cursor-pointer" style={{ accentColor: '#F8FAFC' }} data-testid="master-fader" />
          <span className="text-[7px] font-mono text-white/20">{masterLevel}</span>
        </div>
      </div>
      <div className="flex gap-0.5 px-2 py-1.5 items-end">
        {PILLARS.map((p, i) => (
          <div key={p.key} className="flex-1 min-w-0 flex flex-col items-center">
            <div className="text-[6px] font-mono" style={{ color: p.color + (current?.pillar.key === p.key ? 'FF' : '66') }}>{pillarLevels[i]}</div>
            <input type="range" min="0" max="100" value={pillarLevels[i]}
              onChange={(e) => setPillarLevels(prev => { const n = [...prev]; n[i] = Number(e.target.value); return n; })}
              className="w-full h-1.5 rounded-full cursor-pointer" style={{ accentColor: p.color }} />
            <button onClick={() => setExpandedPillar(expandedPillar === i ? null : i)}
              className="text-[7px] font-bold uppercase active:scale-90 mt-0.5"
              style={{ color: expandedPillar === i ? p.color : current?.pillar.key === p.key ? p.color + 'CC' : p.color + '55' }}
              data-testid={`pillar-fader-${p.key}`}>{p.title}</button>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {expandedPillar !== null && (() => {
          const p = PILLARS[expandedPillar];
          return (
            <motion.div key={p.key} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }} className="overflow-hidden">
              <div className="px-2 pb-1.5">
                <span className="text-[6px] font-bold uppercase tracking-wider" style={{ color: p.color }}>{p.full} · {p.modules.length}ch</span>
                <div className="flex gap-0.5 overflow-x-auto pb-0.5 mt-1">
                  {p.modules.map(mod => {
                    const st = modStates[mod.id] || { value: 50, muted: false, solo: false };
                    const isCurrentMod = location.pathname === mod.route;
                    return (
                      <div key={mod.id} className="flex flex-col items-center w-[38px] flex-shrink-0" style={{ opacity: st.muted ? 0.3 : 1 }}>
                        <input type="range" min="0" max="100" value={st.value}
                          onChange={(e) => setModStates(prev => ({ ...prev, [mod.id]: { ...prev[mod.id], value: Number(e.target.value) } }))}
                          className="w-full h-1 rounded-full cursor-pointer mb-0.5" style={{ accentColor: p.color }} />
                        <div className="flex gap-px">
                          <button onClick={() => { setModStates(prev => ({ ...prev, [mod.id]: { ...prev[mod.id], muted: !st.muted } })); handleMuteChange(mod.id, !st.muted); }}
                            className="w-3 h-2.5 rounded-sm text-[4px] font-bold" style={{ background: st.muted ? '#EF4444' : 'rgba(255,255,255,0.04)', color: st.muted ? '#fff' : 'rgba(255,255,255,0.12)' }}>M</button>
                          <button onClick={() => setModStates(prev => ({ ...prev, [mod.id]: { ...prev[mod.id], solo: !st.solo } }))}
                            className="w-3 h-2.5 rounded-sm text-[4px] font-bold" style={{ background: st.solo ? '#EAB308' : 'rgba(255,255,255,0.04)', color: st.solo ? '#000' : 'rgba(255,255,255,0.12)' }}>S</button>
                        </div>
                        <button onClick={() => handleNav(mod.route)}
                          className="text-[6px] truncate w-full text-center active:scale-90 mt-px font-bold"
                          style={{ color: isCurrentMod ? '#000' : p.color + 'CC', background: isCurrentMod ? p.color : 'transparent', borderRadius: '2px', padding: isCurrentMod ? '1px 0' : 0 }}
                          data-testid={`mixer-nav-${mod.id}`}>{mod.label}</button>
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

  const renderRecordPanel = () => (
    <div className="p-3 space-y-2">
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
    </div>
  );

  const renderAudioPanel = () => (
    <div className="p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => media.isRecAudio ? media.stopAll() : media.startRecording('audio')}
          className="p-2.5 rounded-xl text-left active:scale-95"
          style={{ background: media.isRecAudio ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${media.isRecAudio ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}` }}
          data-testid="audio-record-voice">
          <div className="text-[10px] font-medium" style={{ color: media.isRecAudio ? '#EF4444' : 'rgba(255,255,255,0.6)' }}>{media.isRecAudio ? 'Stop Recording' : 'Record Voice'}</div>
        </button>
        <button onClick={() => document.getElementById('audio-import')?.click()}
          className="p-2.5 rounded-xl text-left active:scale-95" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          data-testid="audio-import-btn">
          <div className="text-[10px] font-medium text-white/60">Import Audio</div>
        </button>
      </div>
      <input type="file" id="audio-import" accept="audio/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) toast.success(`Audio: ${e.target.files[0].name}`); }} />
      <div className="flex items-center justify-between">
        <span className="text-[8px] text-white/30 uppercase">Master Volume</span>
        <span className="text-[8px] font-mono text-white/20">{masterLevel}%</span>
      </div>
      <input type="range" min="0" max="100" value={masterLevel} onChange={(e) => setMasterLevel(Number(e.target.value))}
        className="w-full h-1.5 rounded-full cursor-pointer" style={{ accentColor: '#38BDF8' }} data-testid="audio-master-volume" />
    </div>
  );

  const renderTextPanel = () => (
    <div className="p-3 space-y-2">
      <textarea ref={textInputRef} placeholder="Type your text, then tap a style..." rows={2}
        className="w-full p-2 rounded-lg text-[11px] text-white/70 resize-none"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }}
        data-testid="text-input" />
      <div className="grid grid-cols-3 gap-2">
        {[
          { type: 'Title', style: { fontSize: '32px', fontWeight: 'bold', fontFamily: 'Cormorant Garamond, serif' } },
          { type: 'Subtitle', style: { fontSize: '20px', fontWeight: '500', fontFamily: 'Cormorant Garamond, serif' } },
          { type: 'Caption', style: { fontSize: '14px', fontWeight: '400' } },
          { type: 'Quote', style: { fontSize: '18px', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' } },
          { type: 'Label', style: { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '3px' } },
          { type: 'Watermark', style: { fontSize: '48px', fontWeight: 'bold', opacity: 0.15 } },
        ].map(t => (
          <button key={t.type} onClick={() => {
            const text = textInputRef.current?.value?.trim() || t.type;
            setTextOverlays(prev => [...prev, { id: Date.now(), text, style: t.style, x: 10 + Math.random() * 60, y: 5 + Math.random() * 40 }]);
            toast.success(`${t.type} placed on screen`);
            if (textInputRef.current) textInputRef.current.value = '';
          }}
            className="p-2 rounded-xl text-center active:scale-95"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            data-testid={`text-${t.type.toLowerCase()}`}>
            <div className="text-[10px] font-medium text-white/60">{t.type}</div>
          </button>
        ))}
      </div>
      {textOverlays.length > 0 && (
        <div className="flex items-center justify-between p-1.5 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)' }}>
          <span className="text-[9px] text-white/40">{textOverlays.length} overlay(s)</span>
          <button onClick={() => setTextOverlays([])} className="text-[8px] text-red-400/70 font-bold px-2 py-0.5 rounded active:scale-95" style={{ background: 'rgba(239,68,68,0.06)' }} data-testid="text-clear-all">Clear All</button>
        </div>
      )}
    </div>
  );

  const renderOverlayPanel = () => (
    <div className="p-3 space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Image', desc: 'Add photo', action: () => document.getElementById('img-import')?.click() },
          { label: 'Logo', desc: 'Brand mark', action: () => document.getElementById('img-import')?.click() },
          { label: 'Frame', desc: 'Border', action: () => { setImageOverlays(prev => [...prev, { id: Date.now(), isFrame: true }]); toast.success('Frame added'); } },
        ].map(o => (
          <button key={o.label} onClick={o.action} className="p-2.5 rounded-xl text-center active:scale-95"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            data-testid={`overlay-${o.label.toLowerCase()}`}>
            <div className="text-[10px] font-medium text-white/60">{o.label}</div>
            <div className="text-[7px] text-white/25">{o.desc}</div>
          </button>
        ))}
      </div>
      <input type="file" id="img-import" accept="image/*" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          setImageOverlays(prev => [...prev, { id: Date.now(), url, name: file.name, x: 5 + Math.random() * 50, y: 5 + Math.random() * 30, width: 180, opacity: 0.85 }]);
          toast.success(`Overlay: ${file.name}`);
        }
      }} />
      {imageOverlays.length > 0 && (
        <div className="flex items-center justify-between p-1.5 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)' }}>
          <span className="text-[9px] text-white/40">{imageOverlays.length} layer(s)</span>
          <button onClick={() => { imageOverlays.forEach(o => o.url && URL.revokeObjectURL(o.url)); setImageOverlays([]); }}
            className="text-[8px] text-red-400/70 font-bold px-2 py-0.5 rounded active:scale-95" style={{ background: 'rgba(239,68,68,0.06)' }} data-testid="overlay-clear-all">Clear All</button>
        </div>
      )}
    </div>
  );

  const renderEffectsPanel = () => {
    const fxActive = (key) => {
      if (key === 'blur') return monitorFilters.blur > 0;
      if (key === 'brightness') return monitorFilters.brightness !== 100;
      if (key === 'contrast') return monitorFilters.contrast !== 100;
      if (key === 'hueRotate') return monitorFilters.hueRotate > 0;
      if (key === 'saturate') return monitorFilters.saturate !== 100;
      if (key === 'sepia') return monitorFilters.sepia > 0;
      if (key === 'invert') return monitorFilters.invert > 0;
      return false;
    };
    return (
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'Blur', color: '#8B5CF6', key: 'blur', toggle: () => setMonitorFilters(f => ({ ...f, blur: f.blur === 0 ? 4 : 0 })) },
            { label: 'Bright', color: '#3B82F6', key: 'brightness', toggle: () => setMonitorFilters(f => ({ ...f, brightness: f.brightness === 100 ? 150 : 100 })) },
            { label: 'Contrast', color: '#2DD4BF', key: 'contrast', toggle: () => setMonitorFilters(f => ({ ...f, contrast: f.contrast === 100 ? 150 : 100 })) },
            { label: 'Hue', color: '#E879F9', key: 'hueRotate', toggle: () => setMonitorFilters(f => ({ ...f, hueRotate: (f.hueRotate + 60) % 360 })) },
            { label: 'Saturate', color: '#FB923C', key: 'saturate', toggle: () => setMonitorFilters(f => ({ ...f, saturate: f.saturate === 100 ? 200 : 100 })) },
            { label: 'Sepia', color: '#22C55E', key: 'sepia', toggle: () => setMonitorFilters(f => ({ ...f, sepia: f.sepia === 0 ? 80 : 0 })) },
            { label: 'Invert', color: '#EAB308', key: 'invert', toggle: () => setMonitorFilters(f => ({ ...f, invert: f.invert === 0 ? 100 : 0 })) },
            { label: 'RESET', color: '#EF4444', key: 'reset', toggle: () => setMonitorFilters({ ...DEFAULT_FILTERS }) },
          ].map(fx => (
            <button key={fx.label} onClick={fx.toggle} className="p-2 rounded-xl text-center active:scale-95 transition-all"
              style={{ background: fxActive(fx.key) ? `${fx.color}18` : `${fx.color}06`, border: `1px solid ${fxActive(fx.key) ? `${fx.color}40` : `${fx.color}12`}` }}
              data-testid={`fx-${fx.key}`}>
              <div className="text-[9px] font-bold" style={{ color: fxActive(fx.key) ? fx.color : fx.color + '88' }}>{fx.label}</div>
            </button>
          ))}
        </div>
        <div className="space-y-1.5 mt-2">
          {[
            { label: 'Blur', key: 'blur', min: 0, max: 20, color: '#8B5CF6', unit: 'px' },
            { label: 'Brightness', key: 'brightness', min: 20, max: 200, color: '#3B82F6', unit: '%' },
            { label: 'Hue', key: 'hueRotate', min: 0, max: 360, color: '#E879F9', unit: 'deg' },
          ].map(s => (
            <div key={s.key}>
              <div className="flex items-center justify-between"><span className="text-[7px] text-white/25 uppercase">{s.label}</span><span className="text-[7px] font-mono text-white/15">{monitorFilters[s.key]}{s.unit}</span></div>
              <input type="range" min={s.min} max={s.max} value={monitorFilters[s.key]} onChange={(e) => setMonitorFilters(f => ({ ...f, [s.key]: Number(e.target.value) }))}
                className="w-full h-1 rounded-full cursor-pointer" style={{ accentColor: s.color }} data-testid={`fx-${s.key}-slider`} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAIPanel = () => (
    <div className="p-3 space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {[{ label: 'Image to Video', color: '#E879F9' }, { label: 'AI Art', color: '#8B5CF6' }, { label: 'Text to Image', color: '#3B82F6' },
          { label: 'Text to Speech', color: '#2DD4BF' }, { label: 'AI Music', color: '#22C55E' }, { label: 'AI Avatar', color: '#FB923C' }].map(ai => (
          <button key={ai.label} onClick={() => toast('Sage AI loading...')} className="p-2.5 rounded-xl text-center active:scale-95"
            style={{ background: `${ai.color}08`, border: `1px solid ${ai.color}18` }} data-testid={`ai-${ai.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="text-[9px] font-bold" style={{ color: ai.color }}>{ai.label}</div>
          </button>
        ))}
      </div>
      <textarea placeholder="Describe what to create..." rows={2} className="w-full mt-2 p-2 rounded-lg text-[11px] text-white/70 resize-none"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }} data-testid="ai-prompt-input" />
    </div>
  );

  const renderExportPanel = () => (
    <div className="p-3 space-y-3">
      <div>
        <div className="text-[8px] text-white/30 uppercase tracking-wider mb-1.5">Aspect Ratio</div>
        <div className="flex gap-1.5">
          {['16:9', '9:16', '1:1', '4:3', '4:5'].map(r => (
            <button key={r} onClick={() => setSelectedAspectRatio(r)} className="flex-1 py-2 rounded-lg text-center active:scale-95 transition-all"
              style={{ background: selectedAspectRatio === r ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selectedAspectRatio === r ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`, color: selectedAspectRatio === r ? '#22C55E' : 'rgba(255,255,255,0.4)' }}
              data-testid={`ratio-${r.replace(':', 'x')}`}>
              <div className="text-[10px] font-bold">{r}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => toast.success(`Export: ${selectedAspectRatio}`)} className="p-3 rounded-xl text-center active:scale-95"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }} data-testid="export-video">
          <div className="text-[10px] font-bold text-green-400">Export</div>
        </button>
        <button onClick={() => { navigator.share?.({ title: 'ENLIGHTEN.MINT.CAFE', text: 'Created with the Sovereign Engine', url: window.location.origin }).catch(() => {}); }}
          className="p-3 rounded-xl text-center active:scale-95" style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }} data-testid="broadcast-btn">
          <div className="text-[10px] font-bold text-sky-400">Broadcast</div>
        </button>
      </div>
    </div>
  );

  const PANEL_RENDERERS = {
    mix: renderMixPanel, record: renderRecordPanel, audio: renderAudioPanel,
    text: renderTextPanel, overlay: renderOverlayPanel, effects: renderEffectsPanel,
    ai: renderAIPanel, export: renderExportPanel,
  };

  // ═══ STORE (full-page takeover, same plane) ═══
  if (showStore) {
    return (
      <MixerContext.Provider value={ctx}>
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#060610' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
            <div><div className="text-sm font-bold text-white/90">Mixer Store</div><div className="text-[10px] text-white/40">{credits} Credits</div></div>
            <button onClick={() => setShowStore(false)} className="p-2 rounded-lg active:scale-90" style={{ background: 'rgba(255,255,255,0.05)' }}><X size={16} className="text-white/60" /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {[{ key: 'mixer', label: 'Channel Packs' }, { key: 'mixer_fx', label: 'Effects' }, { key: 'mixer_visual', label: 'Visuals' }, { key: 'mixer_bundle', label: 'Bundles' }].map(cat => {
              const ci = storeItems.filter(i => i.category === cat.key);
              if (!ci.length) return null;
              return (<div key={cat.key} className="mb-4">
                <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">{cat.label}</div>
                {ci.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl mb-1.5" style={{ background: item.owned ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${item.owned ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)'}` }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${item.color}12` }}>{item.owned ? <Check size={12} style={{ color: '#22C55E' }} /> : <Lock size={10} style={{ color: item.color }} />}</div>
                    <div className="flex-1 min-w-0"><div className="text-[11px] font-medium text-white/80">{item.name}</div><div className="text-[9px] text-white/30 truncate">{item.description}</div></div>
                    {item.owned ? <span className="text-[8px] text-green-400/50">OWNED</span> : <button onClick={() => handleBuy(item.id)} className="px-2.5 py-1 rounded-lg text-[9px] font-bold active:scale-95" style={{ background: `${item.color}12`, border: `1px solid ${item.color}25`, color: item.color }}>{item.price_credits}c</button>}
                  </div>
                ))}
              </div>);
            })}
          </div>
        </div>
      </MixerContext.Provider>
    );
  }

  // ═══ THE ORGANISM: SAME PLANE FLEX COLUMN ═══
  return (
    <MixerContext.Provider value={ctx}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#000' }} data-testid="sovereign-organism">
        {/* CONTENT — fills available space, scrollable */}
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }} data-testid="content-area">
          {children}

          {/* Text overlays — positioned within content area, not floating */}
          {textOverlays.map(overlay => (
            <div key={overlay.id}
              style={{ position: 'absolute', left: `${overlay.x}%`, top: `${overlay.y}%`, color: '#fff', ...overlay.style, textShadow: '0 2px 12px rgba(0,0,0,0.9)', userSelect: 'none', maxWidth: '80%', pointerEvents: 'auto' }}
              data-testid={`text-overlay-${overlay.id}`}>
              {overlay.text}
              <button onClick={() => setTextOverlays(prev => prev.filter(t => t.id !== overlay.id))}
                className="ml-2 text-[8px] text-red-400/70 align-top">x</button>
            </div>
          ))}

          {/* Image overlays — positioned within content area */}
          {imageOverlays.filter(o => !o.isFrame).map(overlay => (
            <div key={overlay.id}
              style={{ position: 'absolute', left: `${overlay.x}%`, top: `${overlay.y}%`, pointerEvents: 'auto' }}
              data-testid={`img-overlay-${overlay.id}`}>
              <img src={overlay.url} alt="overlay" style={{ width: overlay.width, opacity: overlay.opacity, borderRadius: '4px' }} />
              <button onClick={() => { URL.revokeObjectURL(overlay.url); setImageOverlays(prev => prev.filter(i => i.id !== overlay.id)); }}
                className="ml-1 text-[8px] text-red-400/70 align-top">x</button>
            </div>
          ))}
        </div>

        {/* TOOL PANEL — slides open between content and nav, same plane */}
        {showMixer && (
          <AnimatePresence>
            {activePanel && (
              <motion.div
                key="panel"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                style={{ overflow: 'hidden', background: '#080812', borderTop: '1px solid rgba(139,92,246,0.15)', maxHeight: '45vh' }}
                data-testid="tool-panel">
                <div style={{ overflowY: 'auto', maxHeight: '45vh' }}>
                  <div className="flex justify-center py-1" onClick={() => setActivePanel(null)} style={{ cursor: 'pointer' }}>
                    <div style={{ width: 32, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }} />
                  </div>
                  {PANEL_RENDERERS[activePanel]?.()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* NAV BAR — bottom of flex, same plane as content */}
        {showMixer && (
          <div data-testid="mixer-nav"
            style={{ height: 44, minHeight: 44, background: '#060610', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center' }}>
            {TOOL_TABS.map(tab => (
              <button key={tab.key} onClick={() => togglePanel(tab.key)}
                className="flex-1 flex flex-col items-center justify-center active:scale-95 transition-all"
                style={{ color: activePanel === tab.key ? tab.color : 'rgba(255,255,255,0.2)', height: '100%' }}
                data-testid={`tab-${tab.key}`}>
                <tab.icon size={14} />
                <span className="text-[6px] font-bold mt-0.5 uppercase">{tab.label}</span>
                {activePanel === tab.key && <div style={{ width: 3, height: 3, borderRadius: '50%', background: tab.color, marginTop: 1 }} />}
              </button>
            ))}
            {/* Inline recording indicator — not floating */}
            {media.isRecording && (
              <div className="flex items-center px-2">
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} className="animate-pulse" />
              </div>
            )}
            {/* Fullscreen toggle — inline, not floating */}
            <button onClick={() => setIsFullscreen(true)}
              className="flex flex-col items-center justify-center px-2 active:scale-95"
              style={{ color: 'rgba(255,255,255,0.12)', height: '100%' }} data-testid="go-fullscreen">
              <Maximize2 size={12} />
            </button>
          </div>
        )}

        {/* Fullscreen exit — inline thin strip at bottom, not floating */}
        {!hideMixer && isFullscreen && (
          <div onClick={() => setIsFullscreen(false)}
            style={{ height: 8, background: 'rgba(139,92,246,0.08)', cursor: 'pointer' }}
            data-testid="exit-fullscreen" />
        )}
      </div>
    </MixerContext.Provider>
  );
}

// Creator Console page
export default function UnifiedCreatorConsole({ onClose }) {
  const navigate = useNavigate();
  const mixer = useMixer();
  return (
    <div className="min-h-screen p-4" style={{ background: '#000' }}>
      <button onClick={() => onClose ? onClose() : navigate('/sovereign-hub')} className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl active:scale-95" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(248,250,252,0.5)' }} data-testid="creator-exit"><ArrowLeft size={14} /><span className="text-xs">Hub</span></button>
      <h1 className="text-lg font-bold text-white/80 mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Creator Console</h1>
      <p className="text-[10px] text-white/25 mb-4">Tap any tool tab below. Everything on the same plane — pulled up as needed.</p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[{ l: 'Channels', v: TOTAL, c: '#C084FC' }, { l: 'Tier', v: mixer?.tier || '-', c: '#8B5CF6' }, { l: 'Master', v: mixer?.masterLevel || 80, c: '#F8FAFC' }, { l: 'Muted', v: mixer?.mutedModules?.size || 0, c: '#EF4444' }].map(m => (
          <div key={m.l} className="p-2 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}><div className="text-sm font-mono font-bold" style={{ color: m.c }}>{m.v}</div><div className="text-[6px] text-white/25 uppercase">{m.l}</div></div>
        ))}
      </div>
      <button onClick={() => mixer?.loadStore?.()} className="flex items-center gap-2 px-4 py-2 rounded-xl active:scale-95 w-full justify-center" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)', color: '#EAB308' }} data-testid="store-btn"><ShoppingCart size={14} />Store</button>
    </div>
  );
}
