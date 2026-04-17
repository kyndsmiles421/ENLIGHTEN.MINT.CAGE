/**
 * V53.0 SOVEREIGN MIXER — DECOMPOSED ARCHITECTURE
 * 
 * Same-Plane flex organism, now with extracted panel modules.
 * Each tool tab lives in /components/console/ for maintainability.
 * 3D Visualization hooks (ParticleField) baked into TorusPanel.
 * 
 * One plane. One organism. Clean composition.
 */

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ShoppingCart, Maximize2 } from 'lucide-react';

import { ZDepthTransition } from './UnifiedFieldEngine';
import SpatialRouter from './SpatialRouter';
import { PILLARS, TOTAL, findModule, PHI, PHI_CUBED, DEFAULT_FILTERS, calculateDustAccrual, inverseMultiplier } from './ConsoleConstants';

// Extracted console modules
import {
  TorusPanel, MixPanel, RecordPanel, AudioPanel,
  TextPanel, OverlayPanel, EffectsPanel, AIPanel,
  ExportPanel, AccountPanel, StoreView, MixerNavBar,
  CulturalMixerPanel, ParticleField, ResonanceCamera, TOOL_TABS,
} from './console';
import { useMediaControls } from './console/useMediaControls';
import { useResonanceCapture } from './console/useResonanceCapture';
import { useAudioVisualizer } from '../hooks/useAudioVisualizer';
import { useMixer as useAudioMixer } from '../context/MixerContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const MixerContext = createContext(null);
export const useMixer = () => useContext(MixerContext);

// ═══════════════════════════════════════════════════════════════
// MIXER PROVIDER — SAME PLANE, NO PORTALS, NO FLOATING
// Flex column: [content | panel | nav]
// ═══════════════════════════════════════════════════════════════

export function MixerProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const media = useMediaControls();
  const { user: authUser, token: authToken, logout: authLogout } = useAuth();

  // Audio-Visual Bridge: tap into MixerContext's AnalyserNode for particle visualization
  const audioMixer = useAudioMixer();
  const audioData = useAudioVisualizer(
    audioMixer?.analyserRef || { current: null },
    audioMixer?.ctxRef || { current: null },
    { enabled: true }
  );

  // Resonance Camera: canvas + audio capture pipeline
  const particleFieldRef = useRef(null);
  const resonanceCapture = useResonanceCapture(
    particleFieldRef,
    audioMixer?.ctxRef || { current: null },
    audioMixer?.masterGainRef || { current: null }
  );

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
  const [resonance, setResonance] = useState(0.5);
  const [bankBalance, setBankBalance] = useState(0);

  // USB Bank → Resonance Wiring
  useEffect(() => {
    const h = getHeaders();
    const fetchBank = () => {
      axios.get(`${API}/bank/wallet`, { headers: h }).then(({ data }) => {
        const bal = data.cosmic_dust || data.balance || 0;
        setBankBalance(bal);
        const bankResonance = Math.tanh(bal * (1 / PHI) / 100);
        setResonance(Math.max(0.1, bankResonance));
      }).catch(() => {});
    };
    fetchBank();
    const interval = setInterval(fetchBank, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // CSS filters on content
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

  // Master volume
  useEffect(() => {
    const vol = masterLevel / 100;
    document.querySelectorAll('audio, video').forEach(el => { el.volume = Math.min(1, Math.max(0, vol)); });
  }, [masterLevel]);

  // Force #app-stage flex behavior
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

  const handleBroadcast = useCallback(async () => {
    const shareData = { title: 'ENLIGHTEN.MINT.CAFE', text: 'Sovereign Wellness Engine', url: window.location.origin };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`); toast.success('Link copied'); }
    } catch {}
  }, []);

  const handleSever = useCallback(() => {
    const root = document.documentElement;
    root.style.transition = 'filter 1.5s ease-in-out';
    root.style.filter = 'brightness(0) blur(10px)';
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('zen_token');
      localStorage.removeItem('user');
      localStorage.removeItem('zen_user');
      sessionStorage.clear();
      window.location.href = '/landing';
    }, 1500);
  }, []);

  const handlePrintModule = useCallback(() => { window.print(); }, []);

  const handlePrintLedger = useCallback(() => {
    const now = new Date();
    const dustVal = calculateDustAccrual(Math.floor((Date.now() - performance.timeOrigin) / 100));
    const invMult = inverseMultiplier(dustVal);
    const currentMod = findModule(location.pathname);
    const activeFx = Object.entries(monitorFilters)
      .filter(([k, v]) => (k === 'brightness' || k === 'contrast' || k === 'saturate') ? v !== 100 : v !== 0)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ') || 'None';

    const ledgerHTML = `<!DOCTYPE html><html><head><title>Sovereign Ledger</title>
<style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Courier New', monospace; background: #fff; color: #000; padding: 32px; max-width: 600px; margin: 0 auto; } h1 { font-size: 18px; letter-spacing: 4px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 16px; } h2 { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #666; margin: 16px 0 8px; } .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #ccc; font-size: 12px; } .row .label { color: #666; } .row .value { font-weight: bold; } .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #000; font-size: 8px; color: #999; line-height: 1.4; } .phi { font-size: 14px; text-align: center; margin: 12px 0; color: #333; }</style></head><body>
<h1>Sovereign Ledger</h1><div class="phi">ENLIGHTEN.MINT.CAFE</div>
<h2>Timestamp</h2><div class="row"><span class="label">Date</span><span class="value">${now.toLocaleDateString()}</span></div><div class="row"><span class="label">Time</span><span class="value">${now.toLocaleTimeString()}</span></div>
<h2>Sacred Mathematics</h2><div class="row"><span class="label">Dust</span><span class="value">${dustVal.toFixed(6)} / ${PHI_CUBED.toFixed(6)}</span></div><div class="row"><span class="label">Inv Mult</span><span class="value">${invMult.toFixed(6)}</span></div><div class="row"><span class="label">Resonance</span><span class="value">${resonance.toFixed(4)}</span></div>
<h2>Account</h2><div class="row"><span class="label">Tier</span><span class="value">${tier}</span></div><div class="row"><span class="label">Bank</span><span class="value">${bankBalance}</span></div><div class="row"><span class="label">Master</span><span class="value">${masterLevel}%</span></div><div class="row"><span class="label">Muted</span><span class="value">${mutedModules.size}</span></div><div class="row"><span class="label">Channels</span><span class="value">${TOTAL}</span></div>
<h2>Current Module</h2><div class="row"><span class="label">Route</span><span class="value">${location.pathname}</span></div><div class="row"><span class="label">Module</span><span class="value">${currentMod?.label || 'Hub'}</span></div><div class="row"><span class="label">Pillar</span><span class="value">${currentMod?.pillar.full || 'N/A'}</span></div>
<h2>Effects</h2><div class="row"><span class="label">FX</span><span class="value">${activeFx}</span></div><div class="row"><span class="label">Ratio</span><span class="value">${selectedAspectRatio}</span></div>
<div class="footer">Sovereign Trust · Closed-loop · Educational · Not medical advice · SHA-256 · /terms</div>
</body></html>`;
    const printWindow = window.open('', '_blank', 'width=650,height=800');
    if (printWindow) { printWindow.document.write(ledgerHTML); printWindow.document.close(); printWindow.focus(); setTimeout(() => printWindow.print(), 300); }
    else toast.error('Popup blocked');
  }, [location.pathname, monitorFilters, resonance, tier, bankBalance, masterLevel, mutedModules, selectedAspectRatio]);

  const current = findModule(location.pathname);

  const ctx = {
    tier, unlocks, pillarLevels, masterLevel, modStates, viewMode, setViewMode,
    loadStore, handleNav, mutedModules, activePanel, setActivePanel: togglePanel,
    isFullscreen, setIsFullscreen, monitorFilters, setMonitorFilters,
    textOverlays, setTextOverlays, imageOverlays, setImageOverlays,
    selectedAspectRatio, setSelectedAspectRatio, resonance, bankBalance,
    mixerState: activePanel ? 'expanded' : 'collapsed', setMixerState: () => {},
  };

  // ═══ PANEL REGISTRY — maps tab keys to extracted components ═══
  const PANEL_RENDERERS = {
    torus: () => <TorusPanel expandedPillar={expandedPillar} setExpandedPillar={setExpandedPillar} pillarLevels={pillarLevels} setPillarLevels={setPillarLevels} modStates={modStates} handleNav={handleNav} currentRoute={location.pathname} />,
    mix: () => <MixPanel masterLevel={masterLevel} setMasterLevel={setMasterLevel} pillarLevels={pillarLevels} setPillarLevels={setPillarLevels} expandedPillar={expandedPillar} setExpandedPillar={setExpandedPillar} modStates={modStates} setModStates={setModStates} handleMuteChange={handleMuteChange} handleNav={handleNav} currentRoute={location.pathname} />,
    culture: () => <CulturalMixerPanel />,
    record: () => <RecordPanel media={media} />,
    audio: () => <AudioPanel media={media} masterLevel={masterLevel} setMasterLevel={setMasterLevel} />,
    text: () => <TextPanel textOverlays={textOverlays} setTextOverlays={setTextOverlays} />,
    overlay: () => <OverlayPanel imageOverlays={imageOverlays} setImageOverlays={setImageOverlays} />,
    effects: () => <EffectsPanel monitorFilters={monitorFilters} setMonitorFilters={setMonitorFilters} />,
    ai: () => <AIPanel monitorFilters={monitorFilters} setMonitorFilters={setMonitorFilters} handleNav={handleNav} currentRoute={location.pathname} />,
    export: () => <ExportPanel selectedAspectRatio={selectedAspectRatio} setSelectedAspectRatio={setSelectedAspectRatio} handlePrintModule={handlePrintModule} handlePrintLedger={handlePrintLedger} />,
    account: () => <AccountPanel authToken={authToken} authUser={authUser} tier={tier} handleBroadcast={handleBroadcast} handleSever={handleSever} handleNav={handleNav} loadStore={loadStore} />,
  };

  // ═══ STORE TAKEOVER ═══
  if (showStore) {
    return (
      <MixerContext.Provider value={ctx}>
        <StoreView storeItems={storeItems} credits={credits} onClose={() => setShowStore(false)} onBuy={handleBuy} />
      </MixerContext.Provider>
    );
  }

  // ═══ THE ORGANISM: SAME PLANE FLEX COLUMN ═══
  return (
    <MixerContext.Provider value={ctx}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'transparent', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} data-testid="sovereign-organism">
        {/* CONTENT */}
        <div style={{ flex: 1, overflow: 'auto', position: 'relative', WebkitOverflowScrolling: 'touch' }} data-testid="content-area">
          <SpatialRouter>
          {children}
          </SpatialRouter>

          {textOverlays.map(overlay => (
            <div key={overlay.id}
              style={{ position: 'absolute', left: `${overlay.x}%`, top: `${overlay.y}%`, color: '#fff', ...overlay.style, textShadow: '0 2px 12px rgba(0,0,0,0.15)', userSelect: 'none', maxWidth: '80%', pointerEvents: 'auto' }}
              data-testid={`text-overlay-${overlay.id}`}>
              {overlay.text}
              <button onClick={() => setTextOverlays(prev => prev.filter(t => t.id !== overlay.id))}
                className="ml-2 text-[8px] text-red-400/70 align-top">x</button>
            </div>
          ))}

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

        {/* TOOL PANEL — slides between content and nav */}
        {showMixer && (
          <AnimatePresence>
            {activePanel && (
              <motion.div
                key="panel"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                style={{ overflow: 'hidden', background: '#080812', borderTop: '1px solid rgba(139,92,246,0.15)', maxHeight: activePanel === 'torus' && expandedPillar !== null ? '55vh' : '35vh', flexShrink: 0 }}
                data-testid="tool-panel">
                <div style={{ overflowY: 'auto', maxHeight: activePanel === 'torus' && expandedPillar !== null ? '55vh' : '35vh' }}>
                  <div className="flex justify-center py-1" onClick={() => setActivePanel(null)} style={{ cursor: 'pointer' }}>
                    <div style={{ width: 32, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }} />
                  </div>
                  {/* 3D Particle Field — breathes with ChaosEngine + audio */}
                  {activePanel === 'torus' && (
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.6 }}>
                        <ParticleField
                          ref={particleFieldRef}
                          pillarKey={current?.pillar?.key}
                          chaosCoeff={1.0 + (resonance * 0.618)}
                          intensity={0.5 + resonance * 0.3}
                          audioData={audioData}
                          width={380}
                          height={200}
                        />
                      </div>
                    </div>
                  )}
                  {PANEL_RENDERERS[activePanel]?.()}
                  {/* Resonance Camera — capture ParticleField + audio */}
                  {activePanel === 'torus' && (
                    <ResonanceCamera capture={resonanceCapture} />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* NAV BAR */}
        {showMixer && (
          <MixerNavBar
            activePanel={activePanel}
            togglePanel={togglePanel}
            isRecording={media.isRecording}
            setIsFullscreen={setIsFullscreen}
          />
        )}

        {/* Fullscreen exit strip */}
        {!hideMixer && isFullscreen && (
          <div onClick={() => setIsFullscreen(false)}
            style={{ height: 8, background: 'rgba(139,92,246,0.08)', cursor: 'pointer' }}
            data-testid="exit-fullscreen" />
        )}

        {/* COMPLIANCE FOOTER */}
        {showMixer && !activePanel && (
          <div style={{ padding: '2px 12px', background: '#030306', borderTop: '1px solid rgba(255,255,255,0.02)', maxHeight: '16px', overflow: 'hidden' }} data-testid="compliance-footer">
            <p style={{ fontSize: '5px', lineHeight: '6px', color: 'rgba(255,255,255,0.08)', fontFamily: 'monospace', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Sovereign Trust · Closed-loop ecosystem · Educational only · Not medical advice · Crystal Seal (SHA-256) · See /terms
            </p>
          </div>
        )}
      </div>
    </MixerContext.Provider>
  );
}

// Creator Console page (standalone)
export default function UnifiedCreatorConsole({ onClose }) {
  const navigate = useNavigate();
  const mixer = useMixer();
  return (
    <div className="min-h-screen p-4" style={{ background: 'transparent' }}>
      <button onClick={() => onClose ? onClose() : navigate('/sovereign-hub')} className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl active:scale-95" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)' }} data-testid="creator-exit"><ArrowLeft size={14} /><span className="text-xs">Hub</span></button>
      <h1 className="text-lg font-bold text-white/80 mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Creator Console</h1>
      <p className="text-[10px] text-white/25 mb-4">Tap any tool tab below. Everything on the same plane.</p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[{ l: 'Channels', v: TOTAL, c: '#C084FC' }, { l: 'Tier', v: mixer?.tier || '-', c: '#8B5CF6' }, { l: 'Master', v: mixer?.masterLevel || 80, c: '#F8FAFC' }, { l: 'Muted', v: mixer?.mutedModules?.size || 0, c: '#EF4444' }].map(m => (
          <div key={m.l} className="p-2 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}><div className="text-sm font-mono font-bold" style={{ color: m.c }}>{m.v}</div><div className="text-[6px] text-white/25 uppercase">{m.l}</div></div>
        ))}
      </div>
      <button onClick={() => mixer?.loadStore?.()} className="flex items-center gap-2 px-4 py-2 rounded-xl active:scale-95 w-full justify-center" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)', color: '#EAB308' }} data-testid="store-btn"><ShoppingCart size={14} />Store</button>
    </div>
  );
}
