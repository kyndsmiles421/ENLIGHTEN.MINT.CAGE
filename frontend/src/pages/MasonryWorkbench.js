/**
 * MasonryWorkbench.js — V57.0 3D Circular Workshop
 * 
 * THE TOOL-TO-TASK ENGINE
 * 
 * Center: Raw stone block (Granite, Marble, Slate, etc.)
 *   - Tap center → Recursive Dive into mineral lattice (36-bit coordinates)
 * Ring: 9 primary masonry tools rotating in a sprocket
 *   - Tap tool → Snaps to stone → Triggers GPT-5.2 tutorial via Global Bridge
 * Every action fires __workAccrue(12, 'Masonry_Skill')
 * 
 * NO MODALS. NO FIXED OVERLAYS. Everything inline.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Hammer, ChevronDown, ChevronUp, Layers, Gem, ArrowLeft, Zap } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import BackToHub from '../components/BackToHub';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STONE CENTER — SVG Mineral Block Renderer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function StoneBlock({ stone, isActive, onTap }) {
  if (!stone) return null;
  const baseColor = stone.color || '#94A3B8';

  return (
    <motion.div
      className="relative cursor-pointer"
      onClick={onTap}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      data-testid="stone-center-block"
    >
      <svg viewBox="0 0 200 200" width="180" height="180" className="mx-auto">
        {/* Shadow base */}
        <ellipse cx="100" cy="170" rx="60" ry="12" fill="rgba(0,0,0,0.3)" />

        {/* 3D block — isometric faces */}
        {/* Top face */}
        <polygon
          points="100,40 160,70 100,100 40,70"
          fill={baseColor}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
        />
        {/* Left face */}
        <polygon
          points="40,70 100,100 100,155 40,125"
          fill={`${baseColor}CC`}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.5"
        />
        {/* Right face */}
        <polygon
          points="160,70 100,100 100,155 160,125"
          fill={`${baseColor}99`}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.5"
        />

        {/* Mineral grain texture lines */}
        {[...Array(6)].map((_, i) => (
          <line
            key={`grain-${i}`}
            x1={55 + i * 15}
            y1={75 + i * 4}
            x2={65 + i * 12}
            y2={110 + i * 5}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.5"
          />
        ))}

        {/* Crystal highlight */}
        <polygon
          points="80,55 95,62 88,75 73,68"
          fill="rgba(255,255,255,0.12)"
        />

        {/* Active glow */}
        {isActive && (
          <circle cx="100" cy="100" r="85" fill="none" stroke={baseColor} strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="80;90;80" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>

      {/* Stone label */}
      <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none">
        <span
          className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded"
          style={{ color: baseColor, background: 'rgba(0,0,0,0.6)' }}
        >
          {stone.name}
        </span>
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SPROCKET TOOL RING — 9 tools orbiting the center
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ToolRing({ tools, selectedTool, onSelectTool, ringRadius = 155 }) {
  const count = tools.length;

  return (
    <div className="absolute inset-0 pointer-events-none" data-testid="tool-sprocket-ring">
      {tools.map((tool, i) => {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2; // Start from top
        const x = Math.cos(angle) * ringRadius;
        const y = Math.sin(angle) * ringRadius;
        const isSelected = selectedTool?.id === tool.id;

        return (
          <motion.button
            key={tool.id}
            className="absolute pointer-events-auto"
            style={{
              left: `calc(50% + ${x}px - 22px)`,
              top: `calc(50% + ${y}px - 22px)`,
              width: 44,
              height: 44,
            }}
            onClick={() => onSelectTool(tool)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: isSelected ? 1.25 : 1,
              boxShadow: isSelected
                ? `0 0 20px ${tool.color}60, 0 0 40px ${tool.color}20`
                : `0 0 8px ${tool.color}20`,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            data-testid={`tool-${tool.id}`}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: isSelected ? `${tool.color}30` : `${tool.color}12`,
                border: `2px solid ${isSelected ? tool.color : `${tool.color}40`}`,
                color: tool.color,
              }}
            >
              {tool.icon_symbol}
            </div>
            {/* Tool name label */}
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] font-bold uppercase tracking-wider"
              style={{ color: isSelected ? tool.color : 'rgba(255,255,255,0.35)' }}
            >
              {tool.name.split(' ')[0]}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOOL SNAP ANIMATION — Tool "attaches" to stone
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ToolSnapEffect({ tool, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!tool) return null;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Impact ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ border: `2px solid ${tool.color}` }}
        initial={{ width: 20, height: 20, opacity: 1 }}
        animate={{ width: 160, height: 160, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {/* Action verb flash */}
      <motion.div
        className="text-xl font-bold uppercase tracking-[0.3em]"
        style={{ color: tool.color }}
        initial={{ opacity: 0, scale: 0.5, y: 10 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.1, 1, 0.9], y: [10, -5, -10, -20] }}
        transition={{ duration: 1.2 }}
      >
        {tool.action_verb}
      </motion.div>
      {/* XP spark */}
      <motion.div
        className="absolute text-[10px] font-bold"
        style={{ color: '#FBBF24', top: '35%', right: '30%' }}
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: [0, 1, 0], y: [0, -30] }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        +12 XP
      </motion.div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MATERIAL DIVE PANEL — Inline Recursive Dive into stone lattice
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MaterialDivePanel({ stone, isOpen, onClose }) {
  const [diveDepth, setDiveDepth] = useState(0);

  useEffect(() => { setDiveDepth(0); }, [stone?.id]);

  if (!isOpen || !stone) return null;

  const layers = stone.dive_layers || [];
  const currentLayer = layers[diveDepth] || layers[0];
  const maxDepth = layers.length - 1;

  const DEPTH_COLORS = ['#8B6914', '#4169E1', '#20B2AA', '#FFD700', '#FF6347', '#E6E6FA'];
  const depthColor = DEPTH_COLORS[diveDepth] || '#FBBF24';

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden"
      data-testid="material-dive-panel"
    >
      <div
        className="rounded-2xl p-4 mt-4"
        style={{
          background: `linear-gradient(135deg, ${depthColor}08, transparent)`,
          border: `1px solid ${depthColor}25`,
        }}
      >
        {/* Dive header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers size={14} style={{ color: depthColor }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: depthColor }}>
              Recursive Dive — L{diveDepth}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[9px] px-2 py-1 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            data-testid="dive-close-btn"
          >
            Surface
          </button>
        </div>

        {/* Depth navigation */}
        <div className="flex gap-1 mb-3">
          {layers.map((layer, i) => (
            <button
              key={i}
              onClick={() => setDiveDepth(i)}
              className="flex-1 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: diveDepth === i ? `${DEPTH_COLORS[i]}20` : 'rgba(255,255,255,0.02)',
                color: diveDepth === i ? DEPTH_COLORS[i] : 'rgba(255,255,255,0.3)',
                border: `1px solid ${diveDepth === i ? `${DEPTH_COLORS[i]}40` : 'transparent'}`,
              }}
              data-testid={`dive-depth-${i}`}
            >
              L{i}
            </button>
          ))}
        </div>

        {/* Current layer visualization */}
        <AnimatePresence mode="wait">
          <motion.div
            key={diveDepth}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-3">
              <h4 className="text-sm font-medium mb-1" style={{ color: depthColor, fontFamily: 'Cormorant Garamond, serif' }}>
                {currentLayer.label}
              </h4>
              <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {currentLayer.desc}
              </p>
            </div>

            {/* Visual lattice representation */}
            <div className="relative h-24 rounded-xl overflow-hidden mb-3"
              style={{ background: `${depthColor}08`, border: `1px solid ${depthColor}15` }}>
              <svg viewBox="0 0 300 96" className="w-full h-full" preserveAspectRatio="none">
                {/* Lattice pattern — deeper = more complex */}
                {[...Array(4 + diveDepth * 3)].map((_, i) => {
                  const spacing = 300 / (4 + diveDepth * 3);
                  return (
                    <g key={`lattice-${i}`}>
                      <line
                        x1={i * spacing}
                        y1={0}
                        x2={i * spacing + (diveDepth * 5)}
                        y2={96}
                        stroke={depthColor}
                        strokeWidth="0.5"
                        opacity={0.15 + diveDepth * 0.05}
                      />
                      {diveDepth >= 2 && (
                        <circle
                          cx={i * spacing + spacing / 2}
                          cy={48 + Math.sin(i) * 20}
                          r={3 - diveDepth * 0.3}
                          fill={depthColor}
                          opacity={0.2}
                        />
                      )}
                      {diveDepth >= 4 && (
                        <line
                          x1={i * spacing}
                          y1={48}
                          x2={(i + 1) * spacing}
                          y2={48 + Math.cos(i * 2) * 15}
                          stroke={depthColor}
                          strokeWidth="0.3"
                          opacity="0.2"
                          strokeDasharray="2,2"
                        />
                      )}
                    </g>
                  );
                })}
                {/* Depth label */}
                <text x="150" y="16" textAnchor="middle" fill={depthColor} fontSize="8" opacity="0.5" fontFamily="monospace">
                  DEPTH {diveDepth} — {Math.pow(9, (diveDepth + 1) * 2).toLocaleString()} states
                </text>
              </svg>
            </div>

            {/* Stone properties at this depth */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Hardness', val: `${stone.mohs_hardness} Mohs`, col: depthColor },
                { label: 'Density', val: `${stone.density_kg_m3} kg/m³`, col: depthColor },
                { label: 'Strength', val: `${stone.compressive_mpa} MPa`, col: depthColor },
              ].map(m => (
                <div key={m.label} className="px-2 py-1.5 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-[10px] font-mono" style={{ color: m.col }}>{m.val}</p>
                  <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{m.label}</p>
                </div>
              ))}
            </div>

            {/* Mineral composition */}
            {diveDepth >= 1 && stone.mineral_composition && (
              <div className="mt-3">
                <p className="text-[8px] uppercase tracking-widest mb-1.5" style={{ color: depthColor }}>
                  Mineral Composition
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {stone.mineral_composition.map((m, i) => (
                    <span key={i} className="text-[8px] px-2 py-0.5 rounded-full"
                      style={{ background: `${depthColor}10`, color: depthColor, border: `1px solid ${depthColor}20` }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Crystal system at depth 2+ */}
            {diveDepth >= 2 && stone.crystal_system && (
              <div className="mt-2 p-2 rounded-lg" style={{ background: `${depthColor}06` }}>
                <p className="text-[8px] uppercase tracking-widest" style={{ color: depthColor }}>Crystal System</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{stone.crystal_system}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dive deeper / surface buttons */}
        <div className="flex gap-2 mt-3">
          {diveDepth > 0 && (
            <button
              onClick={() => setDiveDepth(d => Math.max(0, d - 1))}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
              data-testid="dive-surface-btn"
            >
              <ChevronUp size={12} /> Surface One Level
            </button>
          )}
          {diveDepth < maxDepth && (
            <button
              onClick={() => {
                setDiveDepth(d => Math.min(maxDepth, d + 1));
                if (typeof window.__workAccrue === 'function') window.__workAccrue('masonry_dive', 8);
              }}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ background: `${depthColor}12`, color: depthColor, border: `1px solid ${depthColor}30` }}
              data-testid="dive-deeper-btn"
            >
              <ChevronDown size={12} /> Dive Deeper
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TUTORIAL PANEL — GPT-5.2 generated tutorial from tool action
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function TutorialPanel({ tutorial, tool, stone, isLoading, onClose }) {
  if (!isLoading && !tutorial) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden"
      data-testid="tutorial-panel"
    >
      <div
        className="rounded-2xl p-4 mt-4"
        style={{
          background: tool ? `${tool.color}06` : 'rgba(255,255,255,0.02)',
          border: `1px solid ${tool?.color || '#FBBF24'}20`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap size={12} style={{ color: tool?.color || '#FBBF24' }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: tool?.color || '#FBBF24' }}>
              {tool?.name || 'Tool'} on {stone?.name || 'Stone'} — Generative Tutorial
            </span>
          </div>
          <button onClick={onClose} className="text-[8px] px-2 py-0.5 rounded"
            style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)' }}
            data-testid="tutorial-close-btn">
            Close
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-4">
            <div className="w-3 h-3 border border-yellow-500/40 border-t-yellow-500 rounded-full animate-spin" />
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Generating masonry tutorial...
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {tutorial}
            </p>
            <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-[8px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24' }}>
                +12 XP Masonry_Skill
              </span>
              <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Generated by Sovereign Workshop Engine
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN WORKSHOP PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function MasonryWorkbench() {
  const { authHeaders, token } = useAuth();
  const [stones, setStones] = useState([]);
  const [tools, setTools] = useState([]);
  const [selectedStone, setSelectedStone] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [diveOpen, setDiveOpen] = useState(false);
  const [snapTool, setSnapTool] = useState(null);
  const [tutorial, setTutorial] = useState(null);
  const [tutorialLoading, setTutorialLoading] = useState(false);
  const [actionCount, setActionCount] = useState(() => {
    try { return parseInt(localStorage.getItem('emcafe_masonry_actions') || '0'); } catch { return 0; }
  });

  // XP on page visit
  useEffect(() => {
    if (typeof window.__workAccrue === 'function') window.__workAccrue('module_interaction', 12);
  }, []);

  const isFullAuth = token && token !== 'guest_token';

  // Fetch data — Sovereign Handshake: guests get stone/tool data too
  useEffect(() => {
    const headers = isFullAuth ? { headers: authHeaders } : {};
    Promise.all([
      axios.get(`${API}/workshop/masonry/stones`, headers).catch(() => null),
      axios.get(`${API}/workshop/masonry/tools`, headers).catch(() => null),
    ]).then(([stonesRes, toolsRes]) => {
      if (stonesRes?.data?.stones) {
        setStones(stonesRes.data.stones);
        if (stonesRes.data.stones.length) setSelectedStone(stonesRes.data.stones[0]);
      }
      if (toolsRes?.data?.tools) setTools(toolsRes.data.tools);
    }).catch(() => {});
  }, [authHeaders, token, isFullAuth]);

  // Save action count
  useEffect(() => {
    try { localStorage.setItem('emcafe_masonry_actions', String(actionCount)); } catch {}
  }, [actionCount]);

  // Center stone tap → open Recursive Dive
  const handleStoneTap = useCallback(() => {
    if (diveOpen) {
      setDiveOpen(false);
    } else {
      setDiveOpen(true);
      setTutorial(null);
      setSelectedTool(null);
      if (typeof window.__workAccrue === 'function') window.__workAccrue('masonry_inspect', 5);
    }
  }, [diveOpen]);

  // Tool selection → snap to stone → generate tutorial
  const handleToolSelect = useCallback(async (tool) => {
    if (!selectedStone) return;

    setSelectedTool(tool);
    setDiveOpen(false);
    setSnapTool(tool);
    setTutorial(null);
    setActionCount(c => c + 1);

    // Fire XP accrual — Brain acknowledges the Cell
    if (typeof window.__workAccrue === 'function') {
      window.__workAccrue('Masonry_Skill', 12);
    }

    // Get tutorial context from backend + generate via Global Bridge
    try {
      setTutorialLoading(true);
      const actionHeaders = isFullAuth ? { headers: authHeaders } : {};
      const actionRes = await axios.post(`${API}/workshop/masonry/tool-action`, {
        tool_id: tool.id,
        stone_id: selectedStone.id,
      }, actionHeaders);

      const context = actionRes.data?.tutorial_context;
      if (!context) { setTutorialLoading(false); return; }

      // Full auth users get GPT-5.2 generated tutorial via Global Bridge
      if (isFullAuth) {
        try {
          const tutorialRes = await axios.post(`${API}/knowledge/deep-dive`, {
            topic: `${tool.name} technique on ${selectedStone.name}`,
            category: 'masonry',
            context: context,
          }, { headers: authHeaders, timeout: 90000 });

          setTutorial(tutorialRes.data?.content || 'Tutorial generation complete.');

          // Fire RPG XP — the pulse travels to the Brain
          try {
            await axios.post(`${API}/rpg/character/gain-xp`, {
              amount: 12,
              source: `masonry_${tool.id}_${selectedStone.id}`,
            }, { headers: authHeaders });
          } catch {} // Non-fatal
        } catch {
          // Fallback to technique description
          setTutorial(`${tool.name} Technique:\n\n${tool.technique}\n\nStone: ${selectedStone.name} (${selectedStone.origin})\nHardness: ${selectedStone.mohs_hardness} Mohs\n\nApply the ${tool.name.toLowerCase()} to the ${selectedStone.name.toLowerCase()} surface using the proper technique. ${tool.description}.`);
        }
      } else {
        // Guest mode — immediate technique tutorial (no GPT call)
        setTutorial(`${tool.name} Technique:\n\n${tool.technique}\n\nStone: ${selectedStone.name} (${selectedStone.origin})\nHardness: ${selectedStone.mohs_hardness} Mohs\n\nApply the ${tool.name.toLowerCase()} to the ${selectedStone.name.toLowerCase()} surface using the proper technique. ${tool.description}.`);
      }
    } catch {
      setTutorial(`${tool.name}: ${tool.description}\n\n${tool.technique}`);
    } finally {
      setTutorialLoading(false);
    }
  }, [selectedStone, authHeaders, isFullAuth]);

  const handleSnapComplete = useCallback(() => {
    setSnapTool(null);
  }, []);

  const masteryLevel = useMemo(() => {
    if (actionCount >= 100) return { title: 'Master Mason', color: '#FBBF24' };
    if (actionCount >= 50) return { title: 'Journeyman', color: '#A78BFA' };
    if (actionCount >= 20) return { title: 'Apprentice', color: '#3B82F6' };
    if (actionCount >= 5) return { title: 'Novice', color: '#22C55E' };
    return { title: 'Initiate', color: '#94A3B8' };
  }, [actionCount]);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8" data-testid="masonry-workbench-page">
      <BackToHub />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Hammer size={16} style={{ color: '#FBBF24' }} />
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Masonry Workshop
            </h1>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Circular Workshop — Tap the stone to dive into its structure. Select a tool to learn the craft.
          </p>
        </div>

        {/* Mastery bar */}
        <div className="flex items-center justify-between mb-5 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          data-testid="mastery-bar"
        >
          <div className="flex items-center gap-2">
            <Gem size={12} style={{ color: masteryLevel.color }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: masteryLevel.color }}>
              {masteryLevel.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {actionCount} actions
            </span>
            <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, actionCount)}%`, background: masteryLevel.color }} />
            </div>
          </div>
        </div>

        {/* Stone selector strip */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1" data-testid="stone-selector">
          {stones.map(stone => (
            <button
              key={stone.id}
              onClick={() => { setSelectedStone(stone); setDiveOpen(false); setTutorial(null); setSelectedTool(null); }}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: selectedStone?.id === stone.id ? `${stone.color}15` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedStone?.id === stone.id ? `${stone.color}40` : 'rgba(255,255,255,0.06)'}`,
                color: selectedStone?.id === stone.id ? stone.color : 'rgba(255,255,255,0.4)',
              }}
              data-testid={`stone-select-${stone.id}`}
            >
              {stone.name}
            </button>
          ))}
        </div>

        {/* ═══ THE CIRCULAR WORKSHOP ═══ */}
        <div className="relative mx-auto mb-4" style={{ width: 360, height: 360 }} data-testid="circular-workshop">
          {/* Orbit track rings */}
          <svg className="absolute inset-0" viewBox="0 0 360 360" style={{ pointerEvents: 'none' }}>
            <circle cx="180" cy="180" r="155" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4,4" />
            <circle cx="180" cy="180" r="90" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          </svg>

          {/* Center stone */}
          <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            <StoneBlock stone={selectedStone} isActive={diveOpen} onTap={handleStoneTap} />
          </div>

          {/* Tool sprocket ring */}
          {tools.length > 0 && (
            <ToolRing tools={tools} selectedTool={selectedTool} onSelectTool={handleToolSelect} />
          )}

          {/* Tool snap animation */}
          <AnimatePresence>
            {snapTool && (
              <ToolSnapEffect tool={snapTool} onComplete={handleSnapComplete} />
            )}
          </AnimatePresence>
        </div>

        {/* Selected tool info — inline, below the workshop */}
        {selectedTool && !diveOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl p-3"
            style={{ background: `${selectedTool.color}06`, border: `1px solid ${selectedTool.color}15` }}
            data-testid="tool-info-panel"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: `${selectedTool.color}20`, color: selectedTool.color }}>
                {selectedTool.icon_symbol}
              </div>
              <div>
                <h3 className="text-sm font-medium" style={{ color: selectedTool.color, fontFamily: 'Cormorant Garamond, serif' }}>
                  {selectedTool.name}
                </h3>
                <p className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {selectedTool.action_verb} — {selectedStone?.name}
                </p>
              </div>
            </div>
            <p className="text-[10px] leading-relaxed mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {selectedTool.description}
            </p>
            <p className="text-[9px] leading-relaxed mt-1 italic" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {selectedTool.technique}
            </p>
          </motion.div>
        )}

        {/* Material Dive — inline panel */}
        <AnimatePresence>
          {diveOpen && <MaterialDivePanel stone={selectedStone} isOpen={diveOpen} onClose={() => setDiveOpen(false)} />}
        </AnimatePresence>

        {/* Tutorial Panel — inline, generated by Global Bridge */}
        <AnimatePresence>
          {(tutorialLoading || tutorial) && (
            <TutorialPanel
              tutorial={tutorial}
              tool={selectedTool}
              stone={selectedStone}
              isLoading={tutorialLoading}
              onClose={() => { setTutorial(null); setTutorialLoading(false); }}
            />
          )}
        </AnimatePresence>

        {/* Stone properties summary */}
        {selectedStone && !diveOpen && !tutorial && !tutorialLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
            data-testid="stone-properties"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: selectedStone.color }}>
                {selectedStone.name} — Properties
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Hardness', val: `${selectedStone.mohs_hardness}`, unit: 'Mohs' },
                { label: 'Density', val: `${selectedStone.density_kg_m3}`, unit: 'kg/m³' },
                { label: 'Strength', val: `${selectedStone.compressive_mpa}`, unit: 'MPa' },
                { label: 'Origin', val: selectedStone.origin?.split(' — ')[0] || '', unit: '' },
              ].map(p => (
                <div key={p.label} className="px-2 py-1.5 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-[10px] font-mono" style={{ color: selectedStone.color }}>{p.val}</p>
                  <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{p.unit}</p>
                  <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{p.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {selectedStone.uses}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
