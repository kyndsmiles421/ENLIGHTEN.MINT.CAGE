/**
 * SOVEREIGN MASTER ENGINE — ENLIGHTEN.MINT.CAFE
 * The unified 32-strip fader console with Silent Heartbeat,
 * all 20 modules organized by Utility, and hardware mixing aesthetic.
 * 
 * One script. No fragments. No error loops.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import useWorkAccrual, { subscribeBuffer, getBufferState } from '../hooks/useWorkAccrual';
import {
  ArrowLeft, Activity, Zap, BarChart3, Compass, ArrowRightLeft,
  PenTool, Brain, Wind, Heart, BookOpen, Archive, Star, Wrench,
  Music, Calculator, Map, Telescope, Hexagon, Flame, Sparkles,
  Gem, Crown, Radio, Share2
} from 'lucide-react';

const PHI = 1.61803398875;

// 20 Modules mapped to 5 Utility Clusters (4 per cluster) + 12 hardware spacers = 32 strips
const MODULE_GROUPS = {
  CORE_ENGINE: [
    { id: 'journal', label: 'Journal', icon: PenTool, color: '#818CF8', route: '/journal', dust: 8 },
    { id: 'meditation', label: 'Meditation', icon: Brain, color: '#A855F7', route: '/meditation', dust: 15 },
    { id: 'breathing', label: 'Breathing', icon: Wind, color: '#2DD4BF', route: '/breathing', dust: 7 },
    { id: 'mood', label: 'Mood', icon: Heart, color: '#F472B6', route: '/mood', dust: 5 },
  ],
  ANALYTICS: [
    { id: 'ledger', label: 'Ledger', icon: BarChart3, color: '#22C55E', route: '/cosmic-ledger', dust: 10 },
    { id: 'archives', label: 'Archives', icon: Archive, color: '#6366F1', route: '/archives', dust: 6 },
    { id: 'star-chart', label: 'Star Chart', icon: Star, color: '#FCD34D', route: '/star-chart', dust: 14 },
    { id: 'observatory', label: 'Observatory', icon: Telescope, color: '#3B82F6', route: '/observatory', dust: 10 },
  ],
  CREATION: [
    { id: 'workshop', label: 'Workshop', icon: Wrench, color: '#F97316', route: '/workshop', dust: 12 },
    { id: 'theory', label: 'Theory', icon: Music, color: '#EC4899', route: '/theory', dust: 10 },
    { id: 'suanpan', label: 'Suanpan', icon: Calculator, color: '#EAB308', route: '/suanpan', dust: 8 },
    { id: 'cosmic-map', label: 'Cosmic Map', icon: Map, color: '#14B8A6', route: '/cosmic-map', dust: 10 },
  ],
  OBSERVATION: [
    { id: 'oracle', label: 'Oracle', icon: Hexagon, color: '#06B6D4', route: '/oracle', dust: 12 },
    { id: 'rituals', label: 'Rituals', icon: Flame, color: '#EF4444', route: '/rituals', dust: 15 },
    { id: 'cosmic-mixer', label: 'Mixer', icon: Radio, color: '#D946EF', route: '/cosmic-mixer', dust: 18 },
    { id: 'games', label: 'Games', icon: Sparkles, color: '#FBBF24', route: '/games', dust: 10 },
  ],
  EXCHANGE: [
    { id: 'trade', label: 'Trade', icon: ArrowRightLeft, color: '#F97316', route: '/trade-circle', dust: 16 },
    { id: 'discover', label: 'Discover', icon: Compass, color: '#EC4899', route: '/discover', dust: 10 },
    { id: 'transmuter', label: 'Transmuter', icon: Gem, color: '#A855F7', route: '/liquidity-trader', dust: 0 },
    { id: 'sovereign', label: 'Sovereign', icon: Crown, color: '#FCD34D', route: '/sovereign-hub', dust: 0 },
  ],
};

const ALL_MODULES = Object.values(MODULE_GROUPS).flat();
const GROUP_NAMES = Object.keys(MODULE_GROUPS);
const GROUP_COLORS = {
  CORE_ENGINE: '#818CF8',
  ANALYTICS: '#22C55E',
  CREATION: '#F97316',
  OBSERVATION: '#06B6D4',
  EXCHANGE: '#FCD34D',
};

// Pad to 32 strips (20 modules + 12 spacers)
function getStrips() {
  const strips = [];
  GROUP_NAMES.forEach(group => {
    MODULE_GROUPS[group].forEach(mod => strips.push({ ...mod, group }));
  });
  while (strips.length < 32) {
    strips.push({ id: `spacer-${strips.length}`, label: `CH-${strips.length + 1}`, icon: null, color: '#333', route: null, dust: 0, group: 'SPACER' });
  }
  return strips;
}

const STRIPS = getStrips();

function FaderStrip({ strip, index, isActive, faderPos, onSelect, onFaderChange }) {
  const Icon = strip.icon;
  const isModule = strip.group !== 'SPACER';
  const groupColor = GROUP_COLORS[strip.group] || '#333';

  return (
    <div
      className="flex flex-col items-center justify-end pb-2 transition-all cursor-pointer"
      style={{
        flex: '1 0 0',
        minWidth: 28,
        background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
        borderLeft: index > 0 && STRIPS[index - 1]?.group !== strip.group ? `1px solid ${groupColor}30` : '1px solid rgba(255,255,255,0.03)',
      }}
      onClick={() => isModule && onSelect(strip)}
      data-testid={`fader-strip-${strip.id}`}
    >
      {/* EQ Ring */}
      <div
        className="w-3.5 h-3.5 rounded-full border transition-colors mb-2"
        style={{
          borderColor: isActive ? strip.color : 'rgba(255,255,255,0.08)',
          boxShadow: isActive ? `0 0 6px ${strip.color}40` : 'none',
        }}
      />

      {/* Fader Track */}
      <div className="w-[2px] relative" style={{ height: 80, background: 'rgba(255,255,255,0.06)' }}>
        {/* Fader Knob */}
        <div
          className="absolute w-5 h-6 left-1/2 -translate-x-1/2 flex flex-col justify-center items-center gap-0.5 transition-all"
          style={{
            bottom: `${faderPos}%`,
            background: isActive ? '#1a1a1a' : '#111',
            border: `1px solid ${isActive ? strip.color + '60' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 2,
          }}
        >
          <div className="w-3 h-[1px]" style={{ background: isActive ? strip.color + '40' : 'rgba(255,255,255,0.15)' }} />
          <div className="w-3 h-[1px]" style={{ background: isActive ? strip.color + '40' : 'rgba(255,255,255,0.15)' }} />
        </div>
      </div>

      {/* Channel Label */}
      <div className="mt-2 flex flex-col items-center gap-0.5">
        {Icon && <Icon size={8} color={isActive ? strip.color : 'rgba(255,255,255,0.6)'} />}
        <span
          className="text-[6px] uppercase tracking-wider whitespace-nowrap"
          style={{ color: isActive ? strip.color : 'rgba(255,255,255,0.15)' }}
        >
          {strip.label}
        </span>
      </div>
    </div>
  );
}

export default function SovereignMasterEngine() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('sovereign_engine', 8); }, []);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { accrue } = useWorkAccrual();
  const [activeStrip, setActiveStrip] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [heartbeatBuffer, setHeartbeatBuffer] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [faderPositions] = useState(() => STRIPS.map((_, i) => 30 + Math.sin(i * 0.8) * 25));

  // Subscribe to heartbeat buffer
  useEffect(() => {
    setHeartbeatBuffer(getBufferState().buffer);
    return subscribeBuffer(val => setHeartbeatBuffer(val));
  }, []);

  // Detect sync pulse
  useEffect(() => {
    if (heartbeatBuffer === 0 && isSyncing) {
      setTimeout(() => setIsSyncing(false), 2000);
    }
    if (heartbeatBuffer > 0) setIsSyncing(true);
  }, [heartbeatBuffer, isSyncing]);

  const handleStripSelect = (strip) => {
    setActiveStrip(strip.id);
    setSelectedModule(strip);
    // Accrue dust for console interaction
    if (strip.dust > 0) accrue('module_interaction', 3);
  };

  const handleLaunchModule = () => {
    if (selectedModule?.route) {
      navigate(selectedModule.route);
    }
  };

  const handleManualCalibration = () => {
    accrue('module_interaction', PHI);
  };

  const handleShare = async () => {
    const text = `Operating the Sovereign Master Engine on ENLIGHTEN.MINT.CAFE — ${ALL_MODULES.length} modules, ${STRIPS.length} channels, PHI-locked economy.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Sovereign Master Engine', text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      }
    } catch {}
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#0a0a0a', color: '#e0e0e0', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }} data-testid="sovereign-master-engine">
      {/* HEADER — Liquidity Trader Strip */}
      <header className="h-10 flex items-center justify-between px-4 shrink-0" style={{ background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="opacity-40 hover:opacity-100 transition-opacity" data-testid="engine-back-btn">
            <ArrowLeft size={14} />
          </button>
          <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.65)' }}>
            ENLIGHTEN.MINT.CAFE // APEX V2.1
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Heartbeat Dot — alpha oscillation (2s, anti-seizure) */}
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: isSyncing ? '#22D3EE' : 'rgba(255,255,255,0.08)' }}
            animate={isSyncing ? { opacity: [0.3, 0.8, 0.3] } : { opacity: 0.2 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            BUFFER: {heartbeatBuffer.toFixed(0)}
          </span>
          <button onClick={handleShare} className="opacity-30 hover:opacity-80 transition-opacity" data-testid="engine-share-btn">
            <Share2 size={12} />
          </button>
        </div>
      </header>

      {/* MAIN DECK — Interchangeable Module Display */}
      <main className="flex-1 relative flex items-center justify-center p-4 overflow-hidden"
        style={{ background: 'radial-gradient(circle at center, #111 0%, #000 100%)' }}>

        {/* Sacred Geometry Underlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.025 }}>
          <svg width="500" height="500" viewBox="0 0 100 100" stroke="currentColor" fill="none" strokeWidth="0.3">
            <circle cx="50" cy="50" r="45" />
            <circle cx="50" cy="50" r="28" />
            <circle cx="50" cy="22" r="28" />
            <circle cx="74" cy="64" r="28" />
            <circle cx="26" cy="64" r="28" />
            <path d="M50 5 L95 80 L5 80 Z" />
            <path d="M50 95 L5 20 L95 20 Z" />
          </svg>
        </div>

        {/* Module Content */}
        <section className="z-10 w-full max-w-3xl rounded-xl p-6 sm:p-8"
          style={{ background: 'rgba(0,0,0,0.1)', backdropFilter: 'none', border: '1px solid rgba(255,255,255,0.04)' }}>

          <AnimatePresence mode="wait">
            {selectedModule ? (
              <motion.div key={selectedModule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {selectedModule.icon && <selectedModule.icon size={20} color={selectedModule.color} />}
                    <div>
                      <h1 className="text-lg font-light tracking-tight uppercase" style={{ color: '#F8FAFC' }}>{selectedModule.label}</h1>
                      <span className="text-[9px] uppercase tracking-wider" style={{ color: selectedModule.color }}>{selectedModule.group}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedModule(null)} className="text-[9px] uppercase tracking-wider px-3 py-1 rounded" style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }} data-testid="close-module-btn">
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Channel active. Dust accrual: +{selectedModule.dust} per interaction. Resonance flowing through the scavenger loop.
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    <button onClick={handleLaunchModule}
                      className="px-4 py-2 text-[10px] uppercase tracking-wider transition-all"
                      style={{ border: `1px solid ${selectedModule.color}40`, color: selectedModule.color, background: `${selectedModule.color}08` }}
                      data-testid="launch-module-btn">
                      Launch {selectedModule.label}
                    </button>
                    <button onClick={handleManualCalibration}
                      className="px-4 py-2 text-[10px] uppercase tracking-wider transition-all"
                      style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
                      data-testid="calibrate-btn">
                      Calibrate (+{PHI.toFixed(2)})
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-2xl sm:text-3xl font-thin tracking-tighter uppercase mb-6" style={{ color: '#F8FAFC' }}>
                  Sovereign Console
                </h1>
                <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Select a channel strip below. {ALL_MODULES.length} modules across {GROUP_NAMES.length} utility clusters.
                </p>
                {/* Cluster Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GROUP_NAMES.map(group => (
                    <div key={group} className="rounded-lg p-3" style={{ background: `${GROUP_COLORS[group]}06`, border: `1px solid ${GROUP_COLORS[group]}15` }}>
                      <div className="text-[9px] uppercase tracking-wider mb-1.5" style={{ color: GROUP_COLORS[group] }}>
                        {group.replace('_', ' ')}
                      </div>
                      <div className="space-y-0.5">
                        {MODULE_GROUPS[group].map(m => (
                          <div key={m.id} className="text-[10px] flex items-center gap-1 cursor-pointer hover:opacity-100 transition-opacity"
                            style={{ color: 'rgba(255,255,255,0.4)' }}
                            onClick={() => { setActiveStrip(m.id); setSelectedModule({ ...m, group }); }}>
                            <m.icon size={8} color={m.color} />
                            <span>{m.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* APEX CREATOR CONSOLE — 32-Strip Fader Bank */}
      <footer className="shrink-0 flex overflow-x-auto overflow-y-hidden" style={{ height: 160, background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)' }} data-testid="fader-bank">
        {STRIPS.map((strip, i) => (
          <FaderStrip
            key={strip.id}
            strip={strip}
            index={i}
            isActive={activeStrip === strip.id}
            faderPos={faderPositions[i]}
            onSelect={handleStripSelect}
            onFaderChange={() => {}}
          />
        ))}
      </footer>
    </div>
  );
}
