/**
 * ENLIGHTEN.MINT.CAFE - APEX CREATOR CONSOLE V29.0
 * ApexCreatorConsole.js
 * 
 * 🎚️ MASTER CREATOR CONSOLE — QU-32 ARCHITECTURE + SOVEREIGN KERNEL V29.0
 * 
 * This is NOT a simple mixer widget. This is the flight deck of a
 * superconducting engine, designed to match the Allen & Heath Qu-32
 * professional digital mixing board.
 * 
 * V29.0 UPGRADES:
 * - Four-Tiered Ledger Intelligence (Escrow, Labor, Buffer, Expansion)
 * - Voice Command Integration ("Audit Treasury", "Emergency Stop", etc.)
 * - Vault Soft Key Hook (Flash Tier 4 Expansion)
 * - Terminal-Style Audit Feed in Right Panel
 * - Haptic Milestone Alerts ($1,000 increments @ 80% intensity)
 * 
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                        APEX CREATOR CONSOLE V29.0                          │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │  ┌─────────────────────────────────────────────────────────────────────┐   │
 * │  │                      LAYER SELECTOR [A] [B] [C]                      │   │
 * │  ├─────────────────────────────────────────────────────────────────────┤   │
 * │  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐  │  ┌────────────────┐  │   │
 * │  │  │01│ │02│ │03│ │04│ │05│ │06│ │07│ │08│  │  │ AUDIT TERMINAL │  │   │
 * │  │  │▓▓│ │▓▓│ │▓▓│ │▓▓│ │▓▓│ │▓▓│ │▓▓│ │▓▓│  │  │  [STREAMING]   │  │   │
 * │  │  │▓▓│ │▓▓│ │▓▓│ │▓▓│ │▓▓│ │▓▓│ │▓▓│ │▓▓│  │  │  T1: ESCROW    │  │   │
 * │  │  │  │ │  │ │  │ │  │ │  │ │  │ │  │ │  │  │  │  T4: KEYSTONE  │  │   │
 * │  │  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘  │  └────────────────┘  │   │
 * │  │   [M] [S]  [M] [S]  [M] [S]  [M] [S] ...  │                      │   │
 * │  ├─────────────────────────────────────────────┤  ┌────────────────┐  │   │
 * │  │  LOx COOLING: ═══════════════●══════ -183°C │  │  EQUITY SYNC   │  │   │
 * │  │  HAPTIC INTENSITY: ════════●════════ 80%   │  │  $49,018.24    │  │   │
 * │  └─────────────────────────────────────────────────────────────────────┘   │
 * │  ┌─────────────────────────────────────────────────────────────────────┐   │
 * │  │  🩸 MASTER_PRINT_ID: 708B8ED1E974D85585BBBD8E06E0291E [SYNC: -183°C] │   │
 * │  └─────────────────────────────────────────────────────────────────────┘   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * LAYERS (V29.0 Four-Tier Mapping):
 * - Layer A (Sovereign): Faders mapped to T1-T4 tiers
 *     • Fader 2 (Equity Gain) → T2 LABOR tracking
 *     • Fader 3 (Keystone) → T4 EXPANSION (Liquid 'Cause' Money)
 *     • Fader 7 (ESCROW) → T1 ESCROW (φ × 1.618%)
 * - Layer B (Resonance): Solfeggio Spectrum (432Hz to 963Hz)
 * - Layer C (GPU Shaders): L² Fractal refraction, bloom, obsidian depth
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import L2FractalShader from './L2FractalShader';
import {
  Sliders, Volume2, Waves, Thermometer, Zap, Eye, EyeOff,
  Layers, Settings, Play, Pause, SkipBack, SkipForward,
  Maximize2, Minimize2, Lock, Unlock, Radio, Cpu, Activity,
  Mic, Diamond, RotateCcw, Gauge, DollarSign, TrendingUp, 
  TrendingDown, AlertTriangle, QrCode, Printer, RefreshCw,
  Shield, StopCircle, Terminal, Wallet, MicOff
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ═══════════════════════════════════════════════════════════════════════════════
// SACRED CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const PHI = 1.618033988749895;
const RESONANCE = (PHI ** 2) / Math.PI;

// Master Authority Configuration - V29.2 GAMIFIED CREDIT SYSTEM
const SOVEREIGN_CONFIG = {
  master_email: 'SOVEREIGN_MASTER',
  master_print: '708B8ED1E974D85585BBBD8E06E0291E',
  // V29.2: GAMIFIED CREDITS — NO USD VALUES
  fans_per_hour: 10,              // Primary credit unit
  credits_per_hour: 5,            // Secondary credit unit
  credit_unit: 'Fans',
  sovereignty_discount: 0.90,     // 10% off Learning Packs
  equity: 49018.24,               // Internal tracking (Master only)
};

// V29.1 FINAL: Haptic Configuration
const HAPTIC_CONFIG = {
  threshold: 1000.00,
  intensity: 0.80,
  solfeggio_pulse: [174, 100, 528, 100, 174],
  success_pulse: [100, 50, 100],
  warning_pulse: [300, 100, 300, 100, 300],
  acknowledgment: [50],
};

// Solfeggio Frequency Stack
const SOLFEGGIO_FREQUENCIES = [
  { hz: 174, name: 'Foundation', color: '#EF4444' },
  { hz: 285, name: 'Quantum', color: '#F97316' },
  { hz: 396, name: 'Liberation', color: '#EAB308' },
  { hz: 417, name: 'Change', color: '#84CC16' },
  { hz: 432, name: 'Universal', color: '#22C55E', zone: 'Black Elk' },
  { hz: 528, name: 'Miracle', color: '#06B6D4', zone: 'Keystone' },
  { hz: 639, name: 'Connection', color: '#3B82F6', zone: 'Rapid City' },
  { hz: 741, name: 'Expression', color: '#8B5CF6' },
  { hz: 852, name: 'Intuition', color: '#A855F7' },
  { hz: 963, name: 'Transcendence', color: '#EC4899' },
];

// V29.0: Layer A with Four-Tier Mapping
const LAYERS = {
  A: {
    name: 'SOVEREIGN',
    color: '#8B5CF6',
    strips: [
      { id: 1, name: 'Aether Flow', value: 75 },
      { id: 2, name: 'EQUITY GAIN', value: 60, tier: 'T2_LABOR', color: '#3B82F6' },
      { id: 3, name: 'KEYSTONE', value: 80, tier: 'T4_EXPANSION', node: true, color: '#22C55E' },
      { id: 4, name: 'Rapid City', value: 65, node: true },
      { id: 5, name: 'Black Elk', value: 90, node: true },
      { id: 6, name: 'AUTO-PAY', value: 50, special: 'autopay', color: '#22C55E' },
      { id: 7, name: 'ESCROW', value: 0, tier: 'T1_ESCROW', special: 'escrow', color: '#F59E0B' },
      { id: 8, name: 'Master Out', value: 85 },
    ],
  },
  B: {
    name: 'RESONANCE',
    color: '#06B6D4',
    strips: SOLFEGGIO_FREQUENCIES.slice(0, 8).map((freq, i) => ({
      id: i + 1,
      name: `${freq.hz}Hz`,
      value: 50 + (i * 5),
      color: freq.color,
      freq: freq,
    })),
  },
  C: {
    name: 'GPU SHADER',
    color: '#22C55E',
    strips: [
      { id: 1, name: 'Refraction', value: 70 },
      { id: 2, name: 'Bloom', value: 60 },
      { id: 3, name: 'Obsidian', value: 85 },
      { id: 4, name: 'Prismatic', value: 55 },
      { id: 5, name: 'Crystal', value: 75 },
      { id: 6, name: 'Depth', value: 65 },
      { id: 7, name: 'Void Floor', value: 100 },
      { id: 8, name: 'GPU Out', value: 80 },
    ],
  },
  D: {
    name: 'QR/PRINT',
    color: '#F59E0B',
    strips: [
      { id: 1, name: 'QR Gen', value: 100, special: 'qr_generate' },
      { id: 2, name: 'Regen Math', value: 85, special: 'regenerate' },
      { id: 3, name: 'Print Drv', value: 70, special: 'print' },
      { id: 4, name: 'Verify', value: 100, special: 'verify' },
      { id: 5, name: 'Receipt', value: 90 },
      { id: 6, name: 'Cert Gen', value: 75 },
      { id: 7, name: 'NFT Mint', value: 60 },
      { id: 8, name: 'Output', value: 95 },
    ],
  },
};

// QU-32 Fader Bank Configuration
const FADER_BANKS = {
  INPUT: {
    name: 'INPUT',
    color: '#3B82F6',
    strips: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `IN ${i + 1}`,
      value: Math.round(50 + Math.random() * 30),
    })),
  },
  GROUP: {
    name: 'GROUP',
    color: '#8B5CF6',
    strips: [
      { id: 1, name: 'Wellness', value: 75 },
      { id: 2, name: 'Economy', value: 68 },
      { id: 3, name: 'Resonance', value: 82 },
      { id: 4, name: 'Advocacy', value: 60 },
      { id: 5, name: 'GPS Nodes', value: 70 },
      { id: 6, name: 'Fractal', value: 85 },
      { id: 7, name: 'Haptic', value: 55 },
      { id: 8, name: 'Sub Group', value: 78 },
    ],
  },
  MASTER: {
    name: 'MASTER',
    color: '#22C55E',
    strips: [
      { id: 1, name: 'L Main', value: 85 },
      { id: 2, name: 'R Main', value: 85 },
      { id: 3, name: 'AUX 1', value: 60 },
      { id: 4, name: 'AUX 2', value: 60 },
      { id: 5, name: 'FX Send', value: 45 },
      { id: 6, name: 'FX Ret', value: 50 },
      { id: 7, name: 'Matrix', value: 70 },
      { id: 8, name: 'MASTER', value: 90, isMaster: true },
    ],
  },
};

// Soft Keys Configuration (QU-32 Style) - V29.0 with Vault Hook
const SOFT_KEYS = [
  { id: 'VOICE_CMD', label: 'Voice', icon: 'mic', color: '#8B5CF6', active: false },
  { id: 'OBSIDIAN_VOID', label: 'Void', icon: 'eye', color: '#000000', active: true },
  { id: 'VAULT_SYNC', label: 'Vault', icon: 'wallet', color: '#22C55E', active: true },
  { id: 'GENESIS_MINT', label: 'Mint', icon: 'diamond', color: '#F59E0B', active: false },
  { id: 'AUDIT_FEED', label: 'Audit', icon: 'terminal', color: '#06B6D4', active: false },
];

/**
 * V29.0: Live Ledger Feed - Scrolling Transaction Ticker
 * Shows the "who" and "what" of money flow in real-time
 */
function LiveLedgerFeed({ transactions, isActive }) {
  const scrollRef = useRef(null);
  
  // Auto-scroll animation
  useEffect(() => {
    if (!scrollRef.current || !isActive) return;
    
    const scroll = scrollRef.current;
    let animationId;
    let position = 0;
    
    const animate = () => {
      position += 0.5; // Scroll speed
      if (position >= scroll.scrollWidth / 2) {
        position = 0;
      }
      scroll.scrollLeft = position;
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isActive, transactions]);
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex items-center gap-2 text-[9px] text-white/30">
        <Activity size={10} className="animate-pulse" />
        <span>Awaiting ledger activity...</span>
      </div>
    );
  }
  
  // Duplicate transactions for seamless loop
  const displayTxns = [...transactions, ...transactions];
  
  return (
    <div 
      ref={scrollRef}
      className="flex items-center gap-6 overflow-hidden whitespace-nowrap"
      style={{ scrollBehavior: 'auto' }}
      data-testid="live-ledger-feed"
    >
      {displayTxns.map((txn, idx) => (
        <div 
          key={`${txn.id}-${idx}`}
          className="flex items-center gap-2 text-[9px]"
        >
          {/* Transaction Icon */}
          {txn.type === 'REVENUE' ? (
            <TrendingUp size={10} className="text-green-400" />
          ) : (
            <TrendingDown size={10} className="text-red-400" />
          )}
          
          {/* Amount */}
          <span 
            className="font-mono font-bold"
            style={{ color: txn.type === 'REVENUE' ? '#22C55E' : '#EF4444' }}
          >
            {txn.type === 'REVENUE' ? '+' : '-'}${txn.amount?.toFixed(2)}
          </span>
          
          {/* Source/Vendor */}
          <span className="text-white/60">
            {txn.source || txn.vendor || 'Unknown'}
          </span>
          
          {/* Node Attribution */}
          {txn.node && (
            <span 
              className="px-1.5 py-0.5 rounded text-[7px] uppercase"
              style={{ 
                background: 'rgba(139,92,246,0.2)', 
                color: '#A78BFA' 
              }}
            >
              {txn.node}
            </span>
          )}
          
          {/* Tier Impact */}
          {txn.tier_update?.T4_EXPANSION && (
            <span className="text-[8px] text-green-400/60">
              → T4: ${txn.tier_update.T4_EXPANSION.toLocaleString()}
            </span>
          )}
          
          {/* Divider */}
          <span className="text-white/10 mx-2">│</span>
        </div>
      ))}
    </div>
  );
}

/**
 * V29.0: Sovereign Ledger Terminal Feed
 * Scrolling terminal-style display of the Four-Tiered Audit
 */
function AuditTerminalFeed({ auditStream, isVisible, onClose }) {
  const terminalRef = useRef(null);
  
  useEffect(() => {
    // Auto-scroll to bottom on new data
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [auditStream]);
  
  if (!isVisible) return null;
  
  const stream = auditStream?.stream || [];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-lg overflow-hidden"
      style={{
        background: 'transparent',
        border: '1px solid rgba(6,182,212,0.3)',
        fontFamily: 'monospace',
      }}
      data-testid="audit-terminal-feed"
    >
      <div 
        className="flex items-center justify-between px-3 py-1.5"
        style={{ 
          background: 'linear-gradient(90deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))',
          borderBottom: '1px solid rgba(6,182,212,0.2)',
        }}
      >
        <span className="text-[9px] text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <Terminal size={10} />
          SOVEREIGN LEDGER V29.0
        </span>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white/80 text-xs"
        >
          ×
        </button>
      </div>
      
      <div 
        ref={terminalRef}
        className="p-2 overflow-y-auto max-h-48 text-[10px] space-y-0.5"
        style={{ scrollbarWidth: 'thin' }}
      >
        {stream.map((line, idx) => {
          if (line.type === 'header') {
            return (
              <div key={idx} className="text-cyan-400 font-bold">{line.text}</div>
            );
          }
          if (line.type === 'timestamp') {
            return (
              <div key={idx} className="text-white/40">{line.text}</div>
            );
          }
          if (line.type === 'separator') {
            return (
              <div key={idx} className="text-white/20">{line.text}</div>
            );
          }
          if (line.type === 'tier') {
            const color = line.tier === 'T4' ? '#22C55E' 
                        : line.tier === 'T3' ? '#EF4444'
                        : line.tier === 'T1' ? '#F59E0B'
                        : '#3B82F6';
            return (
              <div key={idx} className="flex justify-between">
                <span style={{ color }}>
                  {line.icon} {line.tier} {line.label}:
                </span>
                <span className="text-white/80">
                  ${line.amount?.toLocaleString()}{line.unit || ''}
                </span>
              </div>
            );
          }
          if (line.type === 'total') {
            return (
              <div key={idx} className="flex justify-between text-green-400 font-bold pt-1">
                <span>{line.label}:</span>
                <span>${line.amount?.toLocaleString()}</span>
              </div>
            );
          }
          if (line.type === 'status') {
            return (
              <div key={idx} className="text-purple-400">{line.text}</div>
            );
          }
          if (line.type === 'resonance') {
            return (
              <div key={idx} className="text-amber-400">RESONANCE: {line.value}</div>
            );
          }
          return null;
        })}
        
        {/* Blinking cursor */}
        <div className="text-cyan-400 animate-pulse">▊</div>
      </div>
    </motion.div>
  );
}

/**
 * V29.1: Four-Tiered Ledger Display Panel (Zero-Point + Gamified)
 */
function FourTierLedger({ tiers, isFlashing }) {
  if (!tiers) return null;
  
  const tierConfig = [
    { key: 'T1_ESCROW', label: 'ESCROW', icon: '🔒', color: '#F59E0B', formula: 'φ × 1.618%' },
    { key: 'T2_FANS', label: 'FANS', icon: '⭐', color: '#8B5CF6', formula: '10 Fans/hr', isFans: true },
    { key: 'T3_BUFFER', label: 'ZERO-POINT', icon: '⚫', color: '#6B7280', formula: '$0.00 BASE' },
    { key: 'T4_EXPANSION', label: 'KEYSTONE', icon: '🔓', color: '#22C55E', formula: 'LIQUID' },
  ];
  
  return (
    <div 
      className="p-3 rounded-lg space-y-2"
      style={{
        background: 'linear-gradient(135deg, rgba(10,10,30,0.9), rgba(20,10,40,0.8))',
        border: '1px solid rgba(139,92,246,0.2)',
      }}
      data-testid="four-tier-ledger"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] uppercase tracking-wider text-purple-400/80">
          Zero-Point Ledger + Fan System
        </span>
        <span className="text-[7px] text-white/30">V29.1</span>
      </div>
      
      {tierConfig.map((tier) => (
        <motion.div
          key={tier.key}
          animate={isFlashing && tier.key === 'T4_EXPANSION' ? { 
            boxShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 15px rgba(34,197,94,0.6)', '0 0 0px rgba(34,197,94,0)'] 
          } : {}}
          transition={{ duration: 0.5, repeat: isFlashing ? 3 : 0 }}
          className="flex items-center justify-between p-1.5 rounded"
          style={{
            background: `rgba(${tier.color === '#F59E0B' ? '245,158,11' : tier.color === '#8B5CF6' ? '139,92,246' : tier.color === '#6B7280' ? '107,114,128' : '34,197,94'},0.1)`,
            border: `1px solid ${tier.color}33`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{tier.icon}</span>
            <div>
              <div className="text-[9px] font-bold" style={{ color: tier.color }}>
                {tier.label}
              </div>
              <div className="text-[7px] text-white/30">{tier.formula}</div>
            </div>
          </div>
          <div 
            className="text-sm font-mono font-bold"
            style={{ color: tier.color }}
          >
            {tier.isFans ? (
              <span>{tiers[tier.key] || 0} Fans</span>
            ) : (
              <span>${(tiers[tier.key] || 0).toLocaleString()}</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Vertical Fader Strip Component
 */
function FaderStrip({ strip, layerColor, onValueChange, onMute, onSolo }) {
  const [muted, setMuted] = useState(false);
  const [soloed, setSoloed] = useState(false);
  const [localValue, setLocalValue] = useState(strip.value);
  
  const handleMute = () => {
    setMuted(!muted);
    onMute?.(strip.id, !muted);
  };
  
  const handleSolo = () => {
    setSoloed(!soloed);
    onSolo?.(strip.id, !soloed);
  };
  
  return (
    <div 
      className="flex flex-col items-center gap-1 p-1.5 rounded-lg"
      style={{
        background: 'linear-gradient(180deg, rgba(20,20,30,0.9), rgba(10,10,15,0.95))',
        border: '1px solid rgba(255,255,255,0.08)',
        minWidth: '48px',
      }}
    >
      {/* Channel Number */}
      <div 
        className="text-[8px] font-mono px-1.5 py-0.5 rounded"
        style={{ background: layerColor, color: '#000' }}
      >
        {String(strip.id).padStart(2, '0')}
      </div>
      
      {/* Channel Name */}
      <div className="text-[7px] text-white/60 text-center h-4 flex items-center">
        {strip.name}
      </div>
      
      {/* Fader Track */}
      <div 
        className="relative w-4 h-32 rounded-sm"
        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Meter */}
        <div 
          className="absolute bottom-0 left-0 right-0 rounded-sm transition-all"
          style={{
            height: `${localValue}%`,
            background: muted 
              ? 'rgba(100,100,100,0.5)' 
              : `linear-gradient(0deg, ${strip.color || layerColor}, ${strip.color || layerColor}88)`,
            boxShadow: muted ? 'none' : `0 0 8px ${strip.color || layerColor}44`,
          }}
        />
        
        {/* Fader Knob */}
        <input
          type="range"
          min="0"
          max="100"
          value={localValue}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setLocalValue(val);
            onValueChange?.(strip.id, val);
          }}
          className="absolute w-32 h-4"
          style={{
            transform: 'rotate(-90deg) translateX(-64px)',
            transformOrigin: '0 0',
            WebkitAppearance: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        />
        
        {/* Value Display */}
        <div 
          className="absolute top-1 left-0 right-0 text-[7px] font-mono text-center"
          style={{ color: muted ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)' }}
        >
          {localValue}
        </div>
      </div>
      
      {/* Mute / Solo Buttons */}
      <div className="flex gap-1 mt-1">
        <button
          onClick={handleMute}
          className="px-1.5 py-0.5 rounded text-[7px] font-bold transition-all"
          style={{
            background: muted ? '#EF4444' : 'rgba(255,255,255,0.05)',
            color: muted ? '#FFF' : 'rgba(255,255,255,0.4)',
          }}
        >
          M
        </button>
        <button
          onClick={handleSolo}
          className="px-1.5 py-0.5 rounded text-[7px] font-bold transition-all"
          style={{
            background: soloed ? '#EAB308' : 'rgba(255,255,255,0.05)',
            color: soloed ? '#000' : 'rgba(255,255,255,0.4)',
          }}
        >
          S
        </button>
      </div>
    </div>
  );
}

/**
 * Cash Flow Visualizer - Live Treasury Waveform
 */
function CashFlowVisualizer({ cashFlow, isMaster }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !cashFlow) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw center line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Draw waveform
    const peaks = cashFlow?.waveform?.peaks || [];
    const dips = cashFlow?.waveform?.dips || [];
    
    // Simulate waveform with peaks (revenue) going up, dips (expenses) going down
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    
    for (let i = 0; i < 50; i++) {
      const x = (i / 50) * width;
      const peakNoise = peaks.length > 0 ? Math.sin(i * 0.3) * 15 : 0;
      const dipNoise = dips.length > 0 ? Math.sin(i * 0.5 + 1) * 10 : 0;
      const y = (height / 2) - peakNoise + dipNoise + Math.random() * 5;
      ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Fill gradient
    ctx.lineTo(width, height / 2);
    ctx.lineTo(0, height / 2);
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
  }, [cashFlow]);
  
  return (
    <div 
      className="rounded-lg overflow-hidden"
      style={{
        background: 'rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="px-2 py-1 border-b border-white/5 flex items-center justify-between">
        <span className="text-[8px] text-white/40 uppercase tracking-wider">Cash Flow</span>
        <div className="flex items-center gap-2 text-[7px]">
          <span className="flex items-center gap-1 text-green-400">
            <TrendingUp size={8} /> +${cashFlow?.total_revenue?.toFixed(0) || 0}
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <TrendingDown size={8} /> -${cashFlow?.total_expenses?.toFixed(0) || 0}
          </span>
        </div>
      </div>
      <canvas ref={canvasRef} width={200} height={60} className="w-full" />
    </div>
  );
}

/**
 * Treasury Control Panel - Autonomous System Controls
 */
function TreasuryPanel({ treasury, onEmergencyStop, onResume, isMaster, authHeaders }) {
  const [autopayEnabled, setAutopayEnabled] = useState(true);
  
  const handleEmergencyStop = async () => {
    try {
      await axios.post(`${API}/treasury/emergency-stop`, {}, { headers: authHeaders });
      setAutopayEnabled(false);
      onEmergencyStop?.();
    } catch (err) {
      console.error('Emergency stop failed:', err);
    }
  };
  
  const handleResume = async () => {
    try {
      await axios.post(`${API}/treasury/resume`, {}, { headers: authHeaders });
      setAutopayEnabled(true);
      onResume?.();
    } catch (err) {
      console.error('Resume failed:', err);
    }
  };
  
  return (
    <div 
      className="p-3 rounded-lg"
      style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(245,158,11,0.05))',
        border: '1px solid rgba(34,197,94,0.2)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] uppercase tracking-wider text-green-400/80">
          Autonomous Treasury
        </span>
        <div 
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px]"
          style={{
            background: autopayEnabled ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
            color: autopayEnabled ? '#22C55E' : '#EF4444',
          }}
        >
          {autopayEnabled ? <Shield size={8} /> : <AlertTriangle size={8} />}
          {autopayEnabled ? 'AUTO-PAY ACTIVE' : 'STOPPED'}
        </div>
      </div>
      
      {/* φ Cap Display - MASTER ONLY */}
      <div className="flex items-center justify-between text-[9px] mb-2">
        <span className="text-white/50">φ Cap (1.618%)</span>
        <span className="font-mono text-amber-400">
          {isMaster ? `$${((treasury?.equity_reservoir || 49018.24) * 0.01618).toFixed(2)}` : '●●●●●●'}
        </span>
      </div>
      
      {/* Safety Buffer - MASTER ONLY */}
      <div className="flex items-center justify-between text-[9px] mb-3">
        <span className="text-white/50">Safety Buffer</span>
        <span className="font-mono text-cyan-400">{isMaster ? '$40,000.00' : '●●●●●●'}</span>
      </div>
      
      {/* Control Buttons (Master Only) */}
      {isMaster && (
        <div className="flex gap-2">
          {autopayEnabled ? (
            <button
              onClick={handleEmergencyStop}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[8px] font-bold uppercase tracking-wider transition-all hover:scale-105"
              style={{
                background: 'rgba(239,68,68,0.2)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#FCA5A5',
              }}
            >
              <StopCircle size={10} />
              Emergency Stop
            </button>
          ) : (
            <button
              onClick={handleResume}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[8px] font-bold uppercase tracking-wider transition-all hover:scale-105"
              style={{
                background: 'rgba(34,197,94,0.2)',
                border: '1px solid rgba(34,197,94,0.4)',
                color: '#86EFAC',
              }}
            >
              <Play size={10} />
              Resume Auto-Pay
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Unified QR/Print Strip - Generate, Regenerate, Print, Verify
 */
function QRPrintStrip({ onGenerate, onRegenerate, onPrint, onVerify }) {
  return (
    <div 
      className="p-2 rounded-lg flex items-center gap-2"
      style={{
        background: 'rgba(245,158,11,0.1)',
        border: '1px solid rgba(245,158,11,0.2)',
      }}
    >
      <button
        onClick={onGenerate}
        className="flex flex-col items-center gap-1 p-2 rounded transition-all hover:scale-105"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <QrCode size={14} className="text-amber-400" />
        <span className="text-[7px] text-white/50">GEN</span>
      </button>
      <button
        onClick={onRegenerate}
        className="flex flex-col items-center gap-1 p-2 rounded transition-all hover:scale-105"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <RefreshCw size={14} className="text-purple-400" />
        <span className="text-[7px] text-white/50">REGEN</span>
      </button>
      <button
        onClick={onPrint}
        className="flex flex-col items-center gap-1 p-2 rounded transition-all hover:scale-105"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <Printer size={14} className="text-cyan-400" />
        <span className="text-[7px] text-white/50">PRINT</span>
      </button>
      <button
        onClick={onVerify}
        className="flex flex-col items-center gap-1 p-2 rounded transition-all hover:scale-105"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <Shield size={14} className="text-green-400" />
        <span className="text-[7px] text-white/50">VERIFY</span>
      </button>
    </div>
  );
}

/**
 * SuperStrip Component - Deep Channel Control (QU-32 Style)
 */
function SuperStrip({ selectedStrip, layerColor, onUpdate }) {
  const [eq, setEq] = useState({ low: 50, mid: 50, high: 50 });
  const [comp, setComp] = useState({ threshold: -20, ratio: 4, attack: 10, release: 100 });
  const [gate, setGate] = useState({ enabled: false, threshold: -40 });
  
  return (
    <div 
      className="p-3 rounded-lg"
      style={{
        background: 'linear-gradient(135deg, rgba(10,10,20,0.95), rgba(20,10,30,0.9))',
        border: `1px solid ${layerColor}33`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: layerColor }}>
          SuperStrip • {selectedStrip?.name || 'No Selection'}
        </span>
        <Gauge size={12} style={{ color: layerColor }} />
      </div>
      
      {/* 3-Band EQ */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { key: 'high', label: 'HI', color: '#F59E0B' },
          { key: 'mid', label: 'MID', color: '#22C55E' },
          { key: 'low', label: 'LO', color: '#3B82F6' },
        ].map(({ key, label, color }) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <span className="text-[7px] text-white/40">{label}</span>
            <div 
              className="w-8 h-20 rounded relative"
              style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div 
                className="absolute bottom-0 left-0 right-0 rounded-b transition-all"
                style={{
                  height: `${eq[key]}%`,
                  background: `linear-gradient(0deg, ${color}88, ${color}44)`,
                }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={eq[key]}
                onChange={(e) => setEq({ ...eq, [key]: parseInt(e.target.value) })}
                className="absolute w-20 h-8 opacity-0 cursor-pointer"
                style={{
                  transform: 'rotate(-90deg) translateX(-40px)',
                  transformOrigin: '0 0',
                }}
              />
            </div>
            <span className="text-[8px] font-mono" style={{ color }}>{eq[key]}</span>
          </div>
        ))}
      </div>
      
      {/* Compressor Mini */}
      <div className="flex items-center gap-2 py-2 border-t border-white/5">
        <span className="text-[7px] text-white/30 w-8">COMP</span>
        <div className="flex-1 flex items-center gap-1">
          <span className="text-[7px] text-white/40">THR</span>
          <input
            type="range"
            min="-60"
            max="0"
            value={comp.threshold}
            onChange={(e) => setComp({ ...comp, threshold: parseInt(e.target.value) })}
            className="flex-1 h-1 rounded appearance-none cursor-pointer"
            style={{ background: 'linear-gradient(90deg, #8B5CF6, rgba(255,255,255,0.1))' }}
          />
          <span className="text-[7px] font-mono text-purple-400 w-8">{comp.threshold}dB</span>
        </div>
      </div>
      
      {/* Gate Toggle */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <button
          onClick={() => setGate({ ...gate, enabled: !gate.enabled })}
          className="px-2 py-1 rounded text-[7px] uppercase tracking-wider transition-all"
          style={{
            background: gate.enabled ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
            color: gate.enabled ? '#FCA5A5' : 'rgba(255,255,255,0.3)',
            border: `1px solid ${gate.enabled ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
          }}
        >
          Gate {gate.enabled ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
}

/**
 * Soft Keys Panel (QU-32 Style) - V29.0 Enhanced
 */
function SoftKeysPanel({ softKeys, onKeyPress, voiceActive }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'mic': return voiceActive ? Mic : MicOff;
      case 'eye': return Eye;
      case 'lock': return Lock;
      case 'wallet': return Wallet;
      case 'diamond': return Diamond;
      case 'terminal': return Terminal;
      default: return Zap;
    }
  };
  
  return (
    <div className="flex gap-2">
      {softKeys.map((key) => {
        const Icon = getIcon(key.icon);
        const isVoiceKey = key.id === 'VOICE_CMD';
        
        return (
          <button
            key={key.id}
            onClick={() => onKeyPress?.(key.id)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:scale-105"
            style={{
              background: key.active 
                ? `${key.color}22` 
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${key.active ? key.color + '44' : 'rgba(255,255,255,0.08)'}`,
              minWidth: '56px',
              animation: isVoiceKey && voiceActive ? 'pulse 1s infinite' : 'none',
            }}
            data-testid={`soft-key-${key.id.toLowerCase()}`}
          >
            <Icon 
              size={14} 
              style={{ color: key.active ? key.color : 'rgba(255,255,255,0.3)' }} 
            />
            <span 
              className="text-[7px] uppercase tracking-wider"
              style={{ color: key.active ? key.color : 'rgba(255,255,255,0.4)' }}
            >
              {key.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Horizontal Slider Control
 */
function HorizontalSlider({ label, value, onChange, min = 0, max = 100, unit = '', color = '#8B5CF6', icon: Icon }) {
  return (
    <div className="flex items-center gap-3">
      {Icon && <Icon size={14} style={{ color }} />}
      <span className="text-[9px] text-white/60 w-24 uppercase tracking-wider">{label}</span>
      <div className="flex-1 relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(90deg, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
      </div>
      <span className="text-[10px] font-mono text-white/80 w-16 text-right">
        {value.toFixed(unit === '°C' ? 0 : 0)}{unit}
      </span>
    </div>
  );
}

/**
 * Main Apex Creator Console Component - V29.0
 */
export default function ApexCreatorConsole({ onClose }) {
  const { user, authHeaders } = useAuth();
  const isMasterAuthority = user?.email === SOVEREIGN_CONFIG.master_email;
  
  // State
  const [activeLayer, setActiveLayer] = useState('A');
  const [activeBank, setActiveBank] = useState('INPUT');
  const [strips, setStrips] = useState(LAYERS.A.strips);
  const [bankStrips, setBankStrips] = useState(FADER_BANKS.INPUT.strips);
  const [selectedStrip, setSelectedStrip] = useState(null);
  const [loxTemp, setLoxTemp] = useState(-183);
  const [hapticIntensity, setHapticIntensity] = useState(80);
  const [gpuActive, setGpuActive] = useState(true);
  const [obsidianVoid, setObsidianVoid] = useState(true);
  const [vaultSync, setVaultSync] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [masterVolume, setMasterVolume] = useState(85);
  const [showSuperStrip, setShowSuperStrip] = useState(true);
  const [softKeys, setSoftKeys] = useState(SOFT_KEYS);
  
  // Treasury state
  const [treasury, setTreasury] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  
  // V29.0: New State for Four-Tiered Ledger
  const [fourTierLedger, setFourTierLedger] = useState(null);
  const [auditStream, setAuditStream] = useState(null);
  const [showAuditTerminal, setShowAuditTerminal] = useState(false);
  const [vaultFlashing, setVaultFlashing] = useState(false);
  const [voiceCommandActive, setVoiceCommandActive] = useState(false);
  const [voiceRecognition, setVoiceRecognition] = useState(null);
  const [hapticStatus, setHapticStatus] = useState(null);
  
  // V29.0: Live Ledger Feed State
  const [ledgerTransactions, setLedgerTransactions] = useState([]);
  const [liveLedgerEnabled, setLiveLedgerEnabled] = useState(true);
  
  // V29.0: Initialize Speech Recognition
  useEffect(() => {
    if (isMasterAuthority && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice command received:', transcript);
        await handleVoiceCommand(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setVoiceCommandActive(false);
      };
      
      recognition.onend = () => {
        setVoiceCommandActive(false);
      };
      
      setVoiceRecognition(recognition);
    }
  }, [isMasterAuthority]);
  
  // V29.0: Voice Command Handler
  const handleVoiceCommand = async (command) => {
    if (!authHeaders?.Authorization) return;
    
    try {
      const response = await axios.post(
        `${API}/treasury/voice-command`,
        { command },
        { headers: authHeaders }
      );
      
      if (response.data.status === 'success') {
        // Trigger haptic feedback
        if (window.navigator?.vibrate && response.data.haptic_pulse) {
          window.navigator.vibrate(response.data.haptic_pulse);
        }
        
        const cmdType = response.data.command_recognized;
        
        if (cmdType === 'AUDIT_TREASURY') {
          setAuditStream(response.data.response);
          setShowAuditTerminal(true);
        } else if (cmdType === 'VAULT_STATUS') {
          setVaultFlashing(true);
          setTimeout(() => setVaultFlashing(false), 2000);
        }
      }
    } catch (err) {
      console.error('Voice command failed:', err);
    }
  };
  
  // V29.0: Fetch Four-Tiered Audit Data
  const fetchAuditStream = async () => {
    if (!isMasterAuthority || !authHeaders?.Authorization) return;
    
    try {
      const response = await axios.get(`${API}/treasury/audit-stream`, { headers: authHeaders });
      if (response.data.status === 'success') {
        setAuditStream(response.data.audit_stream);
      }
    } catch (err) {
      console.warn('Audit stream fetch failed:', err);
    }
  };
  
  // V29.0: Fetch Haptic Status
  const fetchHapticStatus = async () => {
    try {
      const response = await axios.get(`${API}/treasury/haptic-status`);
      if (response.data.status === 'success') {
        setHapticStatus(response.data);
        
        // Check if haptic event pending
        if (response.data.recent_haptic_events?.length > 0) {
          const latestEvent = response.data.recent_haptic_events[response.data.recent_haptic_events.length - 1];
          const eventTime = new Date(latestEvent.timestamp);
          const now = new Date();
          
          // If event within last 30 seconds, trigger haptic
          if ((now - eventTime) < 30000 && window.navigator?.vibrate) {
            window.navigator.vibrate(HAPTIC_CONFIG.solfeggio_pulse);
          }
        }
      }
    } catch (err) {
      console.warn('Haptic status fetch failed:', err);
    }
  };
  
  // Fetch treasury data
  useEffect(() => {
    const fetchTreasury = async () => {
      try {
        const [statusRes, cashFlowRes] = await Promise.all([
          axios.get(`${API}/treasury/status`),
          axios.get(`${API}/treasury/cashflow?hours=24`),
        ]);
        
        if (statusRes.data.status === 'success') {
          setTreasury(statusRes.data.treasury);
        }
        if (cashFlowRes.data.status === 'success') {
          setCashFlow(cashFlowRes.data.cashflow);
        }
        
        // Fetch full audit if master
        if (isMasterAuthority && authHeaders?.Authorization) {
          const auditRes = await axios.get(`${API}/treasury/audit`, { headers: authHeaders });
          if (auditRes.data.status === 'success') {
            setTreasury(prev => ({ ...prev, ...auditRes.data.audit }));
            setFourTierLedger(auditRes.data.audit.four_tier_ledger);
            
            // V29.0: Extract recent transactions for Live Ledger Feed
            const recentTxns = auditRes.data.audit.recent_transactions || [];
            setLedgerTransactions(recentTxns.slice(-10)); // Last 10 transactions
          }
        }
        
        // V29.0: Fetch haptic status
        await fetchHapticStatus();
        
      } catch (err) {
        console.warn('Treasury fetch failed:', err);
      }
    };
    
    fetchTreasury();
    const interval = setInterval(fetchTreasury, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [isMasterAuthority, authHeaders]);
  
  // Layer switching
  useEffect(() => {
    setStrips(LAYERS[activeLayer].strips);
  }, [activeLayer]);
  
  // Bank switching
  useEffect(() => {
    setBankStrips(FADER_BANKS[activeBank].strips);
  }, [activeBank]);
  
  // 432Hz Haptic on mount for Master Authority
  useEffect(() => {
    if (isMasterAuthority && window.navigator?.vibrate) {
      window.navigator.vibrate([432, 100, 432]);
    }
  }, [isMasterAuthority]);
  
  const handleStripChange = useCallback((id, value) => {
    setStrips(prev => prev.map(s => s.id === id ? { ...s, value } : s));
  }, []);
  
  const handleBankStripChange = useCallback((id, value) => {
    setBankStrips(prev => prev.map(s => s.id === id ? { ...s, value } : s));
  }, []);
  
  // V29.0: Enhanced Soft Key Handler with Voice & Vault Integration
  const handleSoftKeyPress = useCallback(async (keyId) => {
    setSoftKeys(prev => prev.map(k => k.id === keyId ? { ...k, active: !k.active } : k));
    
    switch (keyId) {
      case 'OBSIDIAN_VOID':
        setObsidianVoid(prev => !prev);
        break;
        
      case 'VAULT_SYNC':
        // V29.0: Vault key flashes Tier 4 Expansion balance
        setVaultFlashing(true);
        if (window.navigator?.vibrate) {
          window.navigator.vibrate(HAPTIC_CONFIG.acknowledgment);
        }
        setTimeout(() => setVaultFlashing(false), 2000);
        setVaultSync(prev => !prev);
        break;
        
      case 'VOICE_CMD':
        // V29.0: Toggle voice recognition
        if (voiceRecognition) {
          if (voiceCommandActive) {
            voiceRecognition.stop();
            setVoiceCommandActive(false);
          } else {
            voiceRecognition.start();
            setVoiceCommandActive(true);
            if (window.navigator?.vibrate) {
              window.navigator.vibrate(HAPTIC_CONFIG.success_pulse);
            }
          }
        }
        break;
        
      case 'AUDIT_FEED':
        // V29.0: Toggle audit terminal
        if (!showAuditTerminal) {
          await fetchAuditStream();
        }
        setShowAuditTerminal(prev => !prev);
        break;
        
      case 'GENESIS_MINT':
        // Would open Genesis Mint panel
        break;
        
      default:
        break;
    }
  }, [voiceRecognition, voiceCommandActive, showAuditTerminal]);
  
  const layerConfig = LAYERS[activeLayer];
  const bankConfig = FADER_BANKS[activeBank];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{
        background: obsidianVoid 
          ? '#000000' 
          : 'linear-gradient(180deg, #0a0a14 0%, #050508 100%)',
        height: '100vh',
        width: '100vw',
      }}
      data-testid="apex-creator-console"
    >
      {/* Header Bar */}
      <div 
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: 'linear-gradient(90deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold tracking-wider text-white">
            APEX CREATOR CONSOLE
          </h1>
          <span 
            className="text-[9px] px-2 py-0.5 rounded"
            style={{ background: 'rgba(139,92,246,0.2)', color: '#C4B5FD' }}
          >
            V29.1 • QU-32 HYBRID + ZERO-POINT LEDGER
          </span>
          
          {/* Soft Keys - V29.0 Enhanced */}
          <SoftKeysPanel 
            softKeys={softKeys} 
            onKeyPress={handleSoftKeyPress}
            voiceActive={voiceCommandActive}
          />
          
          {/* V29.0: Voice Command Indicator */}
          {voiceCommandActive && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[8px]"
              style={{ background: 'rgba(139,92,246,0.3)', color: '#A78BFA' }}
            >
              <Mic size={10} className="animate-pulse" />
              LISTENING...
            </motion.div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Master Volume */}
          <div className="flex items-center gap-2">
            <Volume2 size={14} className="text-white/60" />
            <input
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseInt(e.target.value))}
              className="w-20 h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(90deg, #22C55E ${masterVolume}%, rgba(255,255,255,0.1) ${masterVolume}%)`,
              }}
            />
            <span className="text-[10px] font-mono text-green-400 w-8">{masterVolume}%</span>
          </div>
          
          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded transition-all hover:bg-white/10"
          >
            {isFullscreen ? <Minimize2 size={14} className="text-white/60" /> : <Maximize2 size={14} className="text-white/60" />}
          </button>
          
          {/* Close */}
          <button
            onClick={onClose}
            className="px-3 py-1 rounded text-[10px] font-medium transition-all"
            style={{
              background: 'rgba(239,68,68,0.2)',
              color: '#FCA5A5',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            EXIT
          </button>
        </div>
      </div>
      
      {/* Main Content — Mobile: stacked (visual top, mixer bottom). Desktop: side-by-side */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Visual Screen (Top on mobile, Right on desktop) */}
        <div 
          className="h-[35vh] lg:h-auto lg:w-80 flex flex-col p-3 border-b lg:border-b-0 lg:border-l overflow-y-auto order-first lg:order-last"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {/* V29.0: Audit Terminal Feed (Collapsible) */}
          <AnimatePresence>
            {showAuditTerminal && (
              <div className="mb-3">
                <AuditTerminalFeed 
                  auditStream={auditStream}
                  isVisible={showAuditTerminal}
                  onClose={() => setShowAuditTerminal(false)}
                />
              </div>
            )}
          </AnimatePresence>
          
          {/* L² Fractal GPU Preview */}
          <div 
            className="rounded-lg overflow-hidden mb-3"
            style={{
              background: 'rgba(10,10,20,0.8)',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <div className="p-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <span className="text-[9px] text-purple-400 uppercase tracking-wider">
                L² FRACTAL GPU • 120 FPS
              </span>
            </div>
            <div className="p-2">
              {gpuActive ? (
                <L2FractalShader size={256} quality="medium" autoRotate={true} />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-black/50 rounded">
                  <span className="text-[10px] text-white/30">GPU OFFLINE</span>
                </div>
              )}
            </div>
          </div>
          
          {/* V29.1: Four-Tiered Ledger Display (Master Only) */}
          {isMasterAuthority && fourTierLedger && (
            <div className="mb-3">
              <FourTierLedger 
                tiers={{
                  T1_ESCROW: fourTierLedger.T1_ESCROW?.amount || 0,
                  T2_FANS: fourTierLedger.T2_FANS?.amount || 0,  // V29.1: Fans not Labor
                  T3_BUFFER: fourTierLedger.T3_BUFFER?.amount || 0,  // V29.1: Zero-Point
                  T4_EXPANSION: fourTierLedger.T4_EXPANSION?.amount || 0,
                }}
                isFlashing={vaultFlashing}
              />
            </div>
          )}
          
          {/* V29.1: Equity Display - MASTER AUTHORITY GATED */}
          {isMasterAuthority ? (
            <motion.div 
              animate={vaultFlashing ? { 
                boxShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 20px rgba(34,197,94,0.8)', '0 0 0px rgba(34,197,94,0)'] 
              } : {}}
              transition={{ duration: 0.3, repeat: vaultFlashing ? 5 : 0 }}
              className="p-3 rounded-lg mb-3"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(6,182,212,0.1))',
                border: '1px solid rgba(34,197,94,0.2)',
              }}
              data-testid="equity-reservoir-display"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-green-400/80 uppercase tracking-wider">Equity Reservoir</span>
                <DollarSign size={12} className="text-green-400" />
              </div>
              <div className="text-2xl font-mono text-green-400" style={{ fontWeight: '600' }}>
                ${(treasury?.equity_reservoir ?? SOVEREIGN_CONFIG.equity).toLocaleString()}
              </div>
              <div className="text-[9px] text-white/40 mt-1">
                {/* V29.1: Gamified Fans System */}
                Fan Rate: {SOVEREIGN_CONFIG.fans_per_hour} Fans/hr
              </div>
              
              {/* V29.1: Tier 4 Expansion Highlight */}
              {fourTierLedger?.T4_EXPANSION && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-white/50">T4 KEYSTONE (Liquid)</span>
                    <span className="text-green-400 font-mono font-bold">
                      ${fourTierLedger.T4_EXPANSION.amount?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* Public View - Kernel Status */
            <motion.div 
              className="p-3 rounded-lg mb-3"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
              data-testid="kernel-status-display"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-indigo-400/80 uppercase tracking-wider">Singularity Kernel</span>
                <Zap size={12} className="text-indigo-400" />
              </div>
              <div className="text-xl font-mono text-indigo-400" style={{ fontWeight: '600' }}>
                V29.1 OPERATIONAL
              </div>
              <div className="text-[9px] text-white/40 mt-1">
                Obsidian Shield Active • 144Hz LOCKED
              </div>
            </motion.div>
          )}
          
          {/* V29.0: Haptic Status Indicator - Gated Values */}
          {hapticStatus && (
            <div 
              className="p-2 rounded-lg mb-3 flex items-center justify-between"
              style={{
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)',
              }}
            >
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-purple-400" />
                <span className="text-[8px] text-white/60 uppercase">Next Milestone</span>
              </div>
              <span className="text-[9px] font-mono text-purple-400">
                {isMasterAuthority 
                  ? `$${hapticStatus.distance_to_next?.toFixed(0)} to $${hapticStatus.next_milestone?.toLocaleString()}`
                  : 'SYNC ACTIVE'}
              </span>
            </div>
          )}
          
          {/* Cash Flow Visualizer */}
          <div className="mb-3">
            <CashFlowVisualizer cashFlow={cashFlow} isMaster={isMasterAuthority} />
          </div>
          
          {/* Treasury Control Panel */}
          <div className="mb-3">
            <TreasuryPanel 
              treasury={treasury}
              isMaster={isMasterAuthority}
              authHeaders={authHeaders}
              onEmergencyStop={() => console.log('Emergency stop triggered')}
              onResume={() => console.log('Auto-pay resumed')}
            />
          </div>
          
          {/* QR/Print Unified Strip */}
          <div className="mb-3">
            <QRPrintStrip 
              onGenerate={() => console.log('QR Generate')}
              onRegenerate={() => console.log('Math Regenerate')}
              onPrint={() => console.log('Print')}
              onVerify={() => console.log('Verify')}
            />
          </div>
          
          {/* System Status */}
          <div 
            className="p-3 rounded-lg mb-3"
            style={{
              background: 'rgba(10,10,20,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="text-[9px] text-white/40 uppercase tracking-wider mb-2">System Status</div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-white/60">LOx Temp</span>
                <span className="font-mono text-cyan-400">{loxTemp}°C</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/60">Resonance</span>
                <span className="font-mono text-purple-400">{RESONANCE.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/60">φ Constant</span>
                <span className="font-mono text-amber-400">{PHI.toFixed(6)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/60">Lattice</span>
                <span className="font-mono text-green-400">9×9 (81 nodes)</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/60">Kernel</span>
                <span className="font-mono text-cyan-400">V29.1</span>
              </div>
            </div>
          </div>
          
          {/* Solfeggio Quick Access */}
          <div 
            className="p-3 rounded-lg flex-1"
            style={{
              background: 'rgba(10,10,20,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="text-[9px] text-white/40 uppercase tracking-wider mb-2">Solfeggio Stack</div>
            <div className="grid grid-cols-5 gap-1">
              {SOLFEGGIO_FREQUENCIES.map((freq) => (
                <button
                  key={freq.hz}
                  className="p-1.5 rounded text-[8px] font-mono transition-all hover:scale-105"
                  style={{
                    background: freq.color + '22',
                    border: `1px solid ${freq.color}44`,
                    color: freq.color,
                  }}
                >
                  {freq.hz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mixer Panel (Bottom on mobile, Left on desktop) */}
        <div className="flex-1 flex flex-col p-3 overflow-y-auto order-last lg:order-first">
          {/* Layer + Bank Selectors */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {Object.entries(LAYERS).map(([key, layer]) => (
              <button
                key={key}
                onClick={() => setActiveLayer(key)}
                className="px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background: activeLayer === key ? layer.color : 'rgba(255,255,255,0.05)',
                  color: activeLayer === key ? '#000' : 'rgba(255,255,255,0.5)',
                  border: `1px solid ${activeLayer === key ? layer.color : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                [{key}] {layer.name}
              </button>
            ))}
            <div className="w-px h-5 bg-white/10 mx-1" />
            {Object.entries(FADER_BANKS).map(([key, bank]) => (
              <button
                key={key}
                onClick={() => setActiveBank(key)}
                className="px-2 py-1 rounded text-[8px] font-medium uppercase tracking-wider transition-all"
                style={{
                  background: activeBank === key ? bank.color + '33' : 'rgba(255,255,255,0.03)',
                  color: activeBank === key ? bank.color : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${activeBank === key ? bank.color + '44' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {bank.name}
              </button>
            ))}
          </div>

          {/* Primary Faders */}
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="text-[8px] text-white/30 uppercase tracking-wider mb-1">
                Layer {activeLayer}: {layerConfig.name}
              </div>
              <div className="flex gap-1 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                {strips.map((strip) => (
                  <FaderStrip key={strip.id} strip={strip} layerColor={layerConfig.color} onValueChange={handleStripChange} />
                ))}
              </div>
            </div>
            {showSuperStrip && (
              <div className="w-48 flex-shrink-0 hidden lg:block">
                <SuperStrip selectedStrip={selectedStrip || strips[0]} layerColor={layerConfig.color} />
              </div>
            )}
          </div>

          {/* Bank Faders */}
          <div className="mt-2 pt-2 border-t border-white/5">
            <div className="text-[8px] text-white/30 uppercase tracking-wider mb-1">Bank: {bankConfig.name}</div>
            <div className="flex gap-1 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
              {bankStrips.map((strip) => (
                <FaderStrip key={strip.id} strip={strip} layerColor={bankConfig.color} onValueChange={handleBankStripChange} />
              ))}
            </div>
          </div>

          {/* Controls Row */}
          <div className="mt-2 p-2 rounded-lg space-y-2" style={{ background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <HorizontalSlider label="LOx Cooling" value={loxTemp} onChange={setLoxTemp} min={-200} max={-100} unit="°C" color="#06B6D4" icon={Thermometer} />
            <HorizontalSlider label="Haptic Intensity" value={hapticIntensity} onChange={setHapticIntensity} unit="%" color="#8B5CF6" icon={Activity} />
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button onClick={() => setGpuActive(!gpuActive)}
                className="flex items-center gap-1 px-2 py-1 rounded text-[8px] uppercase tracking-wider transition-all"
                style={{ background: gpuActive ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${gpuActive ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`, color: gpuActive ? '#22C55E' : 'rgba(255,255,255,0.4)' }}>
                <Cpu size={9} /> GPU {gpuActive ? 'ON' : 'OFF'}
              </button>
              <button onClick={() => setObsidianVoid(!obsidianVoid)}
                className="flex items-center gap-1 px-2 py-1 rounded text-[8px] uppercase tracking-wider transition-all"
                style={{ background: obsidianVoid ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${obsidianVoid ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'}`, color: obsidianVoid ? '#A78BFA' : 'rgba(255,255,255,0.4)' }}>
                {obsidianVoid ? <Eye size={9} /> : <EyeOff size={9} />} Void
              </button>
              <div className="flex items-center gap-1 ml-auto">
                <button className="p-1 rounded hover:bg-white/10"><SkipBack size={12} className="text-white/60" /></button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 rounded" style={{ background: isPlaying ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)' }}>
                  {isPlaying ? <Pause size={14} className="text-green-400" /> : <Play size={14} className="text-white/80" />}
                </button>
                <button className="p-1 rounded hover:bg-white/10"><SkipForward size={12} className="text-white/60" /></button>
              </div>
            </div>
          </div>

          {/* Solfeggio Quick Access */}
          <div className="mt-2 p-2 rounded-lg" style={{ background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[8px] text-white/40 uppercase tracking-wider mb-1">Solfeggio Stack</div>
            <div className="grid grid-cols-5 gap-1">
              {SOLFEGGIO_FREQUENCIES.map((freq) => (
                <button key={freq.hz} className="p-1.5 rounded text-[8px] font-mono transition-all hover:scale-105"
                  style={{ background: freq.color + '22', border: `1px solid ${freq.color}44`, color: freq.color }}>
                  {freq.hz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Master Footer - Live Ledger Feed + Master Print */}
      <div 
        className="px-4 py-2"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.15), rgba(20,0,30,0.95))',
          borderTop: '1px solid rgba(139,92,246,0.2)',
        }}
        data-testid="apex-master-footer"
      >
        {isMasterAuthority ? (
          /* 💉 MASTER VIEW: Live Ledger Feed + Blood-Red Master Print */
          <div className="flex flex-col gap-1">
            {/* Row 1: Live Ledger Feed */}
            <div 
              className="flex items-center gap-3 py-1 px-2 rounded"
              style={{ 
                background: 'rgba(34,197,94,0.05)',
                border: '1px solid rgba(34,197,94,0.1)',
              }}
            >
              <button
                onClick={() => setLiveLedgerEnabled(prev => !prev)}
                className="flex items-center gap-1 text-[8px] uppercase tracking-wider"
                style={{ color: liveLedgerEnabled ? '#22C55E' : 'rgba(255,255,255,0.3)' }}
              >
                <Activity size={10} className={liveLedgerEnabled ? 'animate-pulse' : ''} />
                LIVE
              </button>
              <div className="flex-1 overflow-hidden">
                <LiveLedgerFeed 
                  transactions={ledgerTransactions} 
                  isActive={liveLedgerEnabled}
                />
              </div>
              <span className="text-[8px] text-white/20">
                {ledgerTransactions.length} TXN
              </span>
            </div>
            
            {/* Row 2: Master Clock + Print ID */}
            <div className="flex items-center justify-center gap-4">
              <Radio size={12} className="text-red-500 animate-pulse" />
              <span className="text-[8px] text-red-800/60 uppercase tracking-widest">MASTER CLOCK</span>
              <span 
                className="font-mono text-xs tracking-wider"
                style={{
                  color: '#8B0000',
                  textShadow: '0 0 10px rgba(255,0,0,0.4), 0 0 20px rgba(139,0,0,0.2)',
                  fontWeight: 'bold',
                }}
              >
                {SOVEREIGN_CONFIG.master_print}
              </span>
              <span className="text-[8px] text-white/30">[SYNC: {loxTemp}°C]</span>
              
              {/* V29.0: T4 Expansion Quick View */}
              {fourTierLedger?.T4_EXPANSION && (
                <motion.span
                  animate={vaultFlashing ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3, repeat: vaultFlashing ? 3 : 0 }}
                  className="text-[9px] font-mono px-2 py-0.5 rounded"
                  style={{ 
                    background: 'rgba(34,197,94,0.2)', 
                    color: '#22C55E',
                    border: '1px solid rgba(34,197,94,0.3)',
                  }}
                >
                  T4: ${fourTierLedger.T4_EXPANSION.amount?.toLocaleString()}
                </motion.span>
              )}
            </div>
          </div>
        ) : (
          /* 💎 PUBLIC VIEW: Prismatic Sovereign Seal */
          <div className="flex items-center justify-center gap-3">
            <span 
              className="text-xs font-medium tracking-wider"
              style={{
                background: 'linear-gradient(90deg, #00f2fe, #4facfe, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🛡️ SOVEREIGN_LEDGER_SYNC_ACTIVE
            </span>
            <span className="text-[9px] text-white/30">[72° REFRACTION]</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
