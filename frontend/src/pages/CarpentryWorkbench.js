/**
 * CarpentryWorkbench.js — V57.0 3D Circular Workshop (Wood)
 * 
 * CLONE DNA FROM MASONRY — Same Circular Workshop engine, different material.
 * Center: Raw wood block (Oak, Walnut, Pine, Cherry, Maple, Cedar)
 * Ring: 9 primary woodworking tools in the sprocket
 * Dive: 6 layers from planed surface → molecular bonds
 * Every action fires __workAccrue(12, 'Carpentry_Skill')
 * 
 * UNIVERSAL ACCESS: Guests see tools + basic tutorials.
 * Sovereign tier: GPT-5.2 generative tutorials + RPG XP bridge.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Axe, ChevronDown, ChevronUp, Layers, Gem, Zap } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import BackToHub from '../components/BackToHub';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WOOD BLOCK CENTER — SVG Timber Renderer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function WoodBlock({ wood, isActive, onTap }) {
  if (!wood) return null;
  const baseColor = wood.color || '#92400E';

  return (
    <motion.div
      className="relative cursor-pointer"
      onClick={onTap}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      data-testid="wood-center-block"
    >
      <svg viewBox="0 0 200 200" width="180" height="180" className="mx-auto">
        <ellipse cx="100" cy="170" rx="60" ry="12" fill="rgba(0,0,0,0.3)" />
        {/* Top face — planed surface with grain lines */}
        <polygon points="100,40 160,70 100,100 40,70" fill={baseColor} stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        {/* Grain lines on top face */}
        {[...Array(5)].map((_, i) => (
          <line key={`grain-top-${i}`}
            x1={60 + i * 20} y1={55 + i * 3}
            x2={70 + i * 18} y2={85 + i * 2}
            stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
        ))}
        {/* Left face */}
        <polygon points="40,70 100,100 100,155 40,125" fill={`${baseColor}DD`} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        {/* Right face */}
        <polygon points="160,70 100,100 100,155 160,125" fill={`${baseColor}AA`} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        {/* Growth ring on end grain (right face) */}
        <ellipse cx="130" cy="112" rx="15" ry="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <ellipse cx="130" cy="112" rx="8" ry="12" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <circle cx="130" cy="112" r="2" fill="rgba(255,255,255,0.1)" />
        {/* Active glow */}
        {isActive && (
          <circle cx="100" cy="100" r="85" fill="none" stroke={baseColor} strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="80;90;80" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
      <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none">
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded"
          style={{ color: baseColor, background: 'rgba(0,0,0,0.6)' }}>
          {wood.name}
        </span>
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOOL RING — 9 tools orbiting center (shared DNA)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ToolRing({ tools, selectedTool, onSelectTool, ringRadius = 155 }) {
  const count = tools.length;
  return (
    <div className="absolute inset-0 pointer-events-none" data-testid="carpentry-tool-ring">
      {tools.map((tool, i) => {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * ringRadius;
        const y = Math.sin(angle) * ringRadius;
        const isSelected = selectedTool?.id === tool.id;
        return (
          <motion.button key={tool.id}
            className="absolute pointer-events-auto"
            style={{ left: `calc(50% + ${x}px - 22px)`, top: `calc(50% + ${y}px - 22px)`, width: 44, height: 44 }}
            onClick={() => onSelectTool(tool)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: isSelected ? 1.25 : 1,
              boxShadow: isSelected ? `0 0 20px ${tool.color}60, 0 0 40px ${tool.color}20` : `0 0 8px ${tool.color}20`,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            data-testid={`ctool-${tool.id}`}
          >
            <div className="w-full h-full rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: isSelected ? `${tool.color}30` : `${tool.color}12`,
                border: `2px solid ${isSelected ? tool.color : `${tool.color}40`}`,
                color: tool.color,
              }}>
              {tool.icon_symbol}
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] font-bold uppercase tracking-wider"
              style={{ color: isSelected ? tool.color : 'rgba(255,255,255,0.35)' }}>
              {tool.name.split(' ')[0]}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOOL SNAP ANIMATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ToolSnapEffect({ tool, onComplete }) {
  useEffect(() => { const t = setTimeout(onComplete, 1200); return () => clearTimeout(t); }, [onComplete]);
  if (!tool) return null;
  return (
    <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute rounded-full" style={{ border: `2px solid ${tool.color}` }}
        initial={{ width: 20, height: 20, opacity: 1 }} animate={{ width: 160, height: 160, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }} />
      <motion.div className="text-xl font-bold uppercase tracking-[0.3em]" style={{ color: tool.color }}
        initial={{ opacity: 0, scale: 0.5, y: 10 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.1, 1, 0.9], y: [10, -5, -10, -20] }}
        transition={{ duration: 1.2 }}>
        {tool.action_verb}
      </motion.div>
      <motion.div className="absolute text-[10px] font-bold" style={{ color: '#FBBF24', top: '35%', right: '30%' }}
        initial={{ opacity: 0, y: 0 }} animate={{ opacity: [0, 1, 0], y: [0, -30] }}
        transition={{ duration: 1, delay: 0.3 }}>
        +12 XP
      </motion.div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WOOD DIVE PANEL — Inline Recursive Dive into grain structure
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function WoodDivePanel({ wood, isOpen, onClose }) {
  const [diveDepth, setDiveDepth] = useState(0);
  useEffect(() => { setDiveDepth(0); }, [wood?.id]);
  if (!isOpen || !wood) return null;

  const layers = wood.dive_layers || [];
  const currentLayer = layers[diveDepth] || layers[0];
  const maxDepth = layers.length - 1;
  const DEPTH_COLORS = ['#92400E', '#22C55E', '#3B82F6', '#F59E0B', '#A78BFA', '#EC4899'];
  const depthColor = DEPTH_COLORS[diveDepth] || '#FBBF24';

  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4 }} className="overflow-hidden"
      data-testid="wood-dive-panel">
      <div className="rounded-2xl p-4 mt-4"
        style={{ background: `linear-gradient(135deg, ${depthColor}08, transparent)`, border: `1px solid ${depthColor}25` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers size={14} style={{ color: depthColor }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: depthColor }}>
              Grain Dive — L{diveDepth}
            </span>
          </div>
          <button onClick={onClose} className="text-[9px] px-2 py-1 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            data-testid="wood-dive-close">Surface</button>
        </div>

        <div className="flex gap-1 mb-3">
          {layers.map((_, i) => (
            <button key={i} onClick={() => setDiveDepth(i)}
              className="flex-1 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: diveDepth === i ? `${DEPTH_COLORS[i]}20` : 'rgba(255,255,255,0.02)',
                color: diveDepth === i ? DEPTH_COLORS[i] : 'rgba(255,255,255,0.3)',
                border: `1px solid ${diveDepth === i ? `${DEPTH_COLORS[i]}40` : 'transparent'}`,
              }}
              data-testid={`wood-dive-depth-${i}`}>
              L{i}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={diveDepth} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <div className="mb-3">
              <h4 className="text-sm font-medium mb-1" style={{ color: depthColor, fontFamily: 'Cormorant Garamond, serif' }}>
                {currentLayer.label}
              </h4>
              <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {currentLayer.desc}
              </p>
            </div>

            {/* Grain visualization — organic curves instead of geometric lattice */}
            <div className="relative h-24 rounded-xl overflow-hidden mb-3"
              style={{ background: `${depthColor}08`, border: `1px solid ${depthColor}15` }}>
              <svg viewBox="0 0 300 96" className="w-full h-full" preserveAspectRatio="none">
                {[...Array(6 + diveDepth * 2)].map((_, i) => {
                  const baseY = 10 + (i * 76) / (6 + diveDepth * 2);
                  return (
                    <path key={`grain-${i}`}
                      d={`M 0 ${baseY} Q 75 ${baseY + Math.sin(i * 1.5) * (8 - diveDepth)}, 150 ${baseY + Math.cos(i) * 4} T 300 ${baseY + Math.sin(i * 0.8) * 6}`}
                      fill="none" stroke={depthColor} strokeWidth={0.5 + diveDepth * 0.1} opacity={0.15 + diveDepth * 0.04} />
                  );
                })}
                {diveDepth >= 2 && [...Array(8)].map((_, i) => (
                  <circle key={`cell-${i}`} cx={20 + i * 35} cy={48 + Math.sin(i * 2) * 20}
                    r={4 - diveDepth * 0.4} fill="none" stroke={depthColor} strokeWidth="0.3" opacity="0.2" />
                ))}
                <text x="150" y="14" textAnchor="middle" fill={depthColor} fontSize="8" opacity="0.5" fontFamily="monospace">
                  DEPTH {diveDepth} — {wood.cell_structure?.split(' ')[0] || 'Cellular'}
                </text>
              </svg>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Janka', val: `${wood.janka_hardness}`, unit: 'lbf' },
                { label: 'Density', val: `${wood.density_kg_m3}`, unit: 'kg/m³' },
                { label: 'Bending', val: `${wood.bending_mpa}`, unit: 'MPa' },
              ].map(m => (
                <div key={m.label} className="px-2 py-1.5 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-[10px] font-mono" style={{ color: depthColor }}>{m.val}</p>
                  <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{m.unit}</p>
                  <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{m.label}</p>
                </div>
              ))}
            </div>

            {diveDepth >= 1 && wood.grain_composition && (
              <div className="mt-3">
                <p className="text-[8px] uppercase tracking-widest mb-1.5" style={{ color: depthColor }}>Grain Composition</p>
                <div className="flex flex-wrap gap-1.5">
                  {wood.grain_composition.map((g, i) => (
                    <span key={i} className="text-[8px] px-2 py-0.5 rounded-full"
                      style={{ background: `${depthColor}10`, color: depthColor, border: `1px solid ${depthColor}20` }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {diveDepth >= 2 && wood.cell_structure && (
              <div className="mt-2 p-2 rounded-lg" style={{ background: `${depthColor}06` }}>
                <p className="text-[8px] uppercase tracking-widest" style={{ color: depthColor }}>Cell Structure</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{wood.cell_structure}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mt-3">
          {diveDepth > 0 && (
            <button onClick={() => setDiveDepth(d => Math.max(0, d - 1))}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
              data-testid="wood-dive-up">
              <ChevronUp size={12} /> Surface One Level
            </button>
          )}
          {diveDepth < maxDepth && (
            <button onClick={() => {
              setDiveDepth(d => Math.min(maxDepth, d + 1));
              if (typeof window.__workAccrue === 'function') window.__workAccrue('carpentry_dive', 8);
            }}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ background: `${depthColor}12`, color: depthColor, border: `1px solid ${depthColor}30` }}
              data-testid="wood-dive-deeper">
              <ChevronDown size={12} /> Dive Deeper
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TUTORIAL PANEL — shared pattern
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function TutorialPanel({ tutorial, tool, wood, isLoading, onClose }) {
  if (!isLoading && !tutorial) return null;
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden"
      data-testid="carpentry-tutorial-panel">
      <div className="rounded-2xl p-4 mt-4"
        style={{ background: tool ? `${tool.color}06` : 'rgba(255,255,255,0.02)', border: `1px solid ${tool?.color || '#92400E'}20` }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap size={12} style={{ color: tool?.color || '#92400E' }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: tool?.color || '#92400E' }}>
              {tool?.name || 'Tool'} on {wood?.name || 'Wood'} — Generative Tutorial
            </span>
          </div>
          <button onClick={onClose} className="text-[8px] px-2 py-0.5 rounded"
            style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)' }}
            data-testid="carpentry-tutorial-close">Close</button>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 py-4">
            <div className="w-3 h-3 border border-amber-600/40 border-t-amber-600 rounded-full animate-spin" />
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Generating carpentry tutorial...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.7)' }}>{tutorial}</p>
            <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-[8px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(146,64,14,0.12)', color: '#92400E' }}>
                +12 XP Carpentry_Skill
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN CARPENTRY WORKBENCH PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function CarpentryWorkbench() {
  const { authHeaders, token } = useAuth();
  const [woods, setWoods] = useState([]);
  const [tools, setTools] = useState([]);
  const [selectedWood, setSelectedWood] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [diveOpen, setDiveOpen] = useState(false);
  const [snapTool, setSnapTool] = useState(null);
  const [tutorial, setTutorial] = useState(null);
  const [tutorialLoading, setTutorialLoading] = useState(false);
  const [actionCount, setActionCount] = useState(() => {
    try { return parseInt(localStorage.getItem('emcafe_carpentry_actions') || '0'); } catch { return 0; }
  });

  const isFullAuth = token && token !== 'guest_token';

  useEffect(() => {
    if (typeof window.__workAccrue === 'function') window.__workAccrue('module_interaction', 12);
  }, []);

  // Fetch data — universal access, no auth gate
  useEffect(() => {
    const headers = isFullAuth ? { headers: authHeaders } : {};
    Promise.all([
      axios.get(`${API}/workshop/carpentry/woods`, headers).catch(() => null),
      axios.get(`${API}/workshop/carpentry/tools`, headers).catch(() => null),
    ]).then(([woodsRes, toolsRes]) => {
      if (woodsRes?.data?.woods) {
        setWoods(woodsRes.data.woods);
        if (woodsRes.data.woods.length) setSelectedWood(woodsRes.data.woods[0]);
      }
      if (toolsRes?.data?.tools) setTools(toolsRes.data.tools);
    }).catch(() => {});
  }, [authHeaders, token, isFullAuth]);

  useEffect(() => {
    try { localStorage.setItem('emcafe_carpentry_actions', String(actionCount)); } catch {}
  }, [actionCount]);

  const handleWoodTap = useCallback(() => {
    if (diveOpen) { setDiveOpen(false); } else {
      setDiveOpen(true); setTutorial(null); setSelectedTool(null);
      if (typeof window.__workAccrue === 'function') window.__workAccrue('carpentry_inspect', 5);
    }
  }, [diveOpen]);

  const handleToolSelect = useCallback(async (tool) => {
    if (!selectedWood) return;
    setSelectedTool(tool); setDiveOpen(false); setSnapTool(tool);
    setTutorial(null); setActionCount(c => c + 1);
    if (typeof window.__workAccrue === 'function') window.__workAccrue('Carpentry_Skill', 12);

    try {
      setTutorialLoading(true);
      const actionHeaders = isFullAuth ? { headers: authHeaders } : {};
      const actionRes = await axios.post(`${API}/workshop/carpentry/tool-action`, {
        tool_id: tool.id, wood_id: selectedWood.id,
      }, actionHeaders);
      const context = actionRes.data?.tutorial_context;
      if (!context) { setTutorialLoading(false); return; }

      if (isFullAuth) {
        try {
          const tutorialRes = await axios.post(`${API}/knowledge/deep-dive`, {
            topic: `${tool.name} technique on ${selectedWood.name}`,
            category: 'carpentry', context,
          }, { headers: authHeaders, timeout: 90000 });
          setTutorial(tutorialRes.data?.content || 'Tutorial generation complete.');
          try {
            await axios.post(`${API}/rpg/character/gain-xp`, { amount: 12, source: `carpentry_${tool.id}_${selectedWood.id}` }, { headers: authHeaders });
          } catch {}
        } catch {
          setTutorial(`${tool.name} Technique:\n\n${tool.technique}\n\nWood: ${selectedWood.name} (${selectedWood.origin})\nJanka: ${selectedWood.janka_hardness} lbf\n\n${tool.description}.`);
        }
      } else {
        setTutorial(`${tool.name} Technique:\n\n${tool.technique}\n\nWood: ${selectedWood.name} (${selectedWood.origin})\nJanka: ${selectedWood.janka_hardness} lbf\n\n${tool.description}.`);
      }
    } catch {
      setTutorial(`${tool.name}: ${tool.description}\n\n${tool.technique}`);
    } finally { setTutorialLoading(false); }
  }, [selectedWood, authHeaders, isFullAuth]);

  const masteryLevel = useMemo(() => {
    if (actionCount >= 100) return { title: 'Master Carpenter', color: '#92400E' };
    if (actionCount >= 50) return { title: 'Journeyman', color: '#A78BFA' };
    if (actionCount >= 20) return { title: 'Apprentice', color: '#22C55E' };
    if (actionCount >= 5) return { title: 'Novice', color: '#D4A76A' };
    return { title: 'Initiate', color: '#94A3B8' };
  }, [actionCount]);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8" data-testid="carpentry-workbench-page">
      <BackToHub />
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Axe size={16} style={{ color: '#92400E' }} />
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Carpentry Workshop
            </h1>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Circular Workshop — Tap the wood to dive into its grain. Select a tool to learn the craft.
          </p>
        </div>

        {/* Mastery bar */}
        <div className="flex items-center justify-between mb-5 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          data-testid="carpentry-mastery-bar">
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

        {/* Wood selector */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1" data-testid="wood-selector">
          {woods.map(wood => (
            <button key={wood.id}
              onClick={() => { setSelectedWood(wood); setDiveOpen(false); setTutorial(null); setSelectedTool(null); }}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: selectedWood?.id === wood.id ? `${wood.color}15` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedWood?.id === wood.id ? `${wood.color}40` : 'rgba(255,255,255,0.06)'}`,
                color: selectedWood?.id === wood.id ? wood.color : 'rgba(255,255,255,0.4)',
              }}
              data-testid={`wood-select-${wood.id}`}>
              {wood.name}
            </button>
          ))}
        </div>

        {/* THE CIRCULAR WORKSHOP */}
        <div className="relative mx-auto mb-4" style={{ width: 360, height: 360 }} data-testid="carpentry-circular-workshop">
          <svg className="absolute inset-0" viewBox="0 0 360 360" style={{ pointerEvents: 'none' }}>
            <circle cx="180" cy="180" r="155" fill="none" stroke="rgba(146,64,14,0.08)" strokeWidth="1" strokeDasharray="4,4" />
            <circle cx="180" cy="180" r="90" fill="none" stroke="rgba(146,64,14,0.04)" strokeWidth="0.5" />
          </svg>
          <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            <WoodBlock wood={selectedWood} isActive={diveOpen} onTap={handleWoodTap} />
          </div>
          {tools.length > 0 && (
            <ToolRing tools={tools} selectedTool={selectedTool} onSelectTool={handleToolSelect} />
          )}
          <AnimatePresence>
            {snapTool && <ToolSnapEffect tool={snapTool} onComplete={() => setSnapTool(null)} />}
          </AnimatePresence>
        </div>

        {/* Tool info inline */}
        {selectedTool && !diveOpen && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl p-3"
            style={{ background: `${selectedTool.color}06`, border: `1px solid ${selectedTool.color}15` }}
            data-testid="carpentry-tool-info">
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
                  {selectedTool.action_verb} — {selectedWood?.name}
                </p>
              </div>
            </div>
            <p className="text-[10px] leading-relaxed mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{selectedTool.description}</p>
            <p className="text-[9px] leading-relaxed mt-1 italic" style={{ color: 'rgba(255,255,255,0.45)' }}>{selectedTool.technique}</p>
          </motion.div>
        )}

        {/* Wood Dive Panel */}
        <AnimatePresence>
          {diveOpen && <WoodDivePanel wood={selectedWood} isOpen={diveOpen} onClose={() => setDiveOpen(false)} />}
        </AnimatePresence>

        {/* Tutorial Panel */}
        <AnimatePresence>
          {(tutorialLoading || tutorial) && (
            <TutorialPanel tutorial={tutorial} tool={selectedTool} wood={selectedWood}
              isLoading={tutorialLoading} onClose={() => { setTutorial(null); setTutorialLoading(false); }} />
          )}
        </AnimatePresence>

        {/* Wood properties */}
        {selectedWood && !diveOpen && !tutorial && !tutorialLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-4 rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
            data-testid="wood-properties">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: selectedWood.color }}>
                {selectedWood.name} — Properties
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Janka', val: `${selectedWood.janka_hardness}`, unit: 'lbf' },
                { label: 'Density', val: `${selectedWood.density_kg_m3}`, unit: 'kg/m³' },
                { label: 'Bending', val: `${selectedWood.bending_mpa}`, unit: 'MPa' },
                { label: 'Type', val: selectedWood.origin?.split(' — ')[0] || '', unit: '' },
              ].map(p => (
                <div key={p.label} className="px-2 py-1.5 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-[10px] font-mono" style={{ color: selectedWood.color }}>{p.val}</p>
                  <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{p.unit}</p>
                  <p className="text-[7px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{p.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{selectedWood.uses}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
