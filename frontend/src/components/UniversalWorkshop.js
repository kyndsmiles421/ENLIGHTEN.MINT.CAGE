/**
 * UniversalWorkshop.js — V60.0 Universal Sovereign Interaction Cell
 *
 * ONE ENGINE, INFINITE MODULES.
 * This component powers ALL workshop-type cells in the organism.
 * It reads its identity (materials, tools, dive data) from the backend
 * based on the moduleId prop. The DNA is identical for every cell.
 *
 * Props:
 *   moduleId    — 'electrical' | 'plumbing' | 'landscaping' | 'nursing' | 'bible'
 *   title       — Display title
 *   subtitle    — Subtitle text
 *   icon        — Lucide icon component
 *   accentColor — Theme color for the workshop
 *   skillKey    — XP source key (e.g. 'Electrical_Skill')
 *   matLabel    — Label for materials ('Material' / 'Scenario' / 'Text')
 *   storageKey  — localStorage key for action count
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useMixer } from '../context/MixerContext';
import {
  ChevronDown, ChevronUp, Layers, Gem, Zap,
  Hammer, Axe, Flame, Wrench, Droplets, Leaf, BookOpen, Heart, Sparkles,
  Wind, Search, Compass, Map, Eye, Activity, Cog, Mountain, Pickaxe,
  Telescope, FlaskConical, Bone, Trees, Scissors, Shovel, Ruler, Thermometer,
  Stethoscope, Syringe, Microscope, Cpu, Pencil, Feather, Cross,
} from 'lucide-react';
import axios from 'axios';
import HolographicChamber from './HolographicChamber';
import ChamberProp from './ChamberProp';
import ChamberMiniGame from './games/ChamberMiniGame';
import Chamber3DGame from './games/Chamber3DGame';
import { phiStaggerDelay, PHI_EASE_BEZIER } from '../utils/SovereignMath';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Map workshop moduleId → holographic chamber backdrop. Trades that share
// a vibe reuse the same backdrop. Unknown modules fall back to "academy".
const MODULE_TO_CHAMBER = {
  masonry: 'masonry',
  carpentry: 'carpentry',
  culinary: 'culinary',
  cooking: 'culinary',
  baking: 'culinary',
  nursing: 'academy',
  childcare: 'academy',
  eldercare: 'academy',
  bible: 'academy',
  electrical: 'physics',
  plumbing: 'carpentry',
  landscaping: 'herbology',
  gardening: 'herbology',
  herbalism: 'herbology',
  geology: 'crystals',
  meteorology: 'physics',
  ecology: 'herbology',
  paleontology: 'crystals',
};

// Gameplay theme per module: which verb, which icon, which mode. This
// turns the generic "tap the SVG" loop into a real themed action —
// masonry = strike stone, carpentry = saw wood, culinary = knead dough,
// electrical = align the current, plumbing = match the flow, and so on.
const MODULE_GAME_THEME = {
  masonry:      { mode: 'break',   verb: 'STRIKE',  icon: Hammer,   title: 'STRIKE THE STONE',    msg: 'STONE SHAPED' },
  carpentry:    { mode: 'break',   verb: 'SAW',     icon: Axe,      title: 'SAW THE TIMBER',      msg: 'BEAM CUT' },
  culinary:     { mode: 'break',   verb: 'KNEAD',   icon: Flame,    title: 'KNEAD THE DOUGH',     msg: 'DOUGH READY' },
  cooking:      { mode: 'break',   verb: 'STIR',    icon: Flame,    title: 'STIR THE POT',        msg: 'MEAL READY' },
  baking:       { mode: 'break',   verb: 'KNEAD',   icon: Flame,    title: 'SHAPE THE LOAF',      msg: 'LOAF BAKED' },
  electrical:   { mode: 'rhythm',  verb: 'ALIGN',   icon: Zap,      title: 'ALIGN THE CURRENT',   msg: 'CIRCUIT SET' },
  plumbing:     { mode: 'rhythm',  verb: 'MATCH',   icon: Droplets, title: 'MATCH THE FLOW',      msg: 'FLOW BALANCED' },
  landscaping:  { mode: 'collect', verb: 'PLANT',   icon: Leaf,     title: 'PLANT THE SEEDLINGS', msg: 'GARDEN GROWN' },
  gardening:    { mode: 'collect', verb: 'PLANT',   icon: Leaf,     title: 'PLANT THE SEEDLINGS', msg: 'GARDEN GROWN' },
  herbalism:    { mode: 'collect', verb: 'HARVEST', icon: Leaf,     title: 'HARVEST THE HERBS',   msg: 'HARVEST COMPLETE' },
  nursing:      { mode: 'rhythm',  verb: 'CARE',    icon: Heart,    title: 'PULSE · STEADY CARE', msg: 'CARE DELIVERED' },
  childcare:    { mode: 'rhythm',  verb: 'SOOTHE',  icon: Heart,    title: 'MATCH THE RHYTHM',    msg: 'CHILD SOOTHED' },
  eldercare:    { mode: 'rhythm',  verb: 'TEND',    icon: Heart,    title: 'STEADY PRESENCE',    msg: 'DIGNITY HELD' },
  bible:        { mode: 'collect', verb: 'VERSE',   icon: BookOpen, title: 'GATHER THE VERSES',   msg: 'VERSES SEALED' },
  // V57.11 — Science pillar: real subject-specific gameplay instead of
  // generic wrench-tap. Geology = strike rock with Hammer; Meteorology
  // = align frequencies with Wind; Ecology = harvest with Leaf;
  // Paleontology = excavate with Pickaxe.
  geology:      { mode: 'break',   verb: 'STRIKE',  icon: Hammer,   title: 'STRIKE THE FORMATION', msg: 'ROCK FRACTURED' },
  meteorology:  { mode: 'rhythm',  verb: 'TUNE',    icon: Wind,     title: 'READ THE PRESSURE',    msg: 'FRONT MAPPED' },
  ecology:      { mode: 'collect', verb: 'OBSERVE', icon: Leaf,     title: 'SAMPLE THE BIOME',    msg: 'SPECIMEN LOGGED' },
  paleontology: { mode: 'collect', verb: 'EXCAVATE', icon: Hammer,  title: 'EXCAVATE THE FOSSIL', msg: 'SPECIMEN RECOVERED' },
};

// Tool symbol → themed icon glyph. Two paths:
//  1) If the backend ships a full Lucide component name in `icon_symbol`
//     (e.g. "Hammer", "Search", "Compass", "Cog") we render that exact
//     icon. The Geology / Science modules use this style.
//  2) If the backend ships a single-letter glyph (legacy modules:
//     masonry/carpentry/electrical/plumbing/nursing/etc.), we look up a
//     trade-specific fallback so the user sees a Hammer for masonry, a
//     Stethoscope for nursing, etc., instead of the generic Wrench.
const LUCIDE_ICON_MAP = {
  Hammer, Axe, Flame, Wrench, Droplets, Leaf, BookOpen, Heart, Sparkles,
  Wind, Search, Compass, Map, Eye, Activity, Cog, Mountain, Pickaxe,
  Telescope, FlaskConical, Bone, Trees, Scissors, Shovel, Ruler, Thermometer,
  Stethoscope, Syringe, Microscope, Cpu, Pencil, Feather, Cross, Gem, Zap, Layers,
};

// Per-module fallback when the backend only ships a letter-glyph.
const MODULE_TOOL_FALLBACK = {
  masonry: Hammer,
  carpentry: Axe,
  culinary: Flame, cooking: Flame, baking: Flame,
  electrical: Zap,
  plumbing: Droplets,
  landscaping: Leaf, gardening: Leaf, herbalism: Leaf,
  nursing: Stethoscope,
  childcare: Heart,
  eldercare: Heart,
  bible: BookOpen,
  geology: Hammer,
  meteorology: Wind,
  ecology: Leaf,
  paleontology: Pickaxe,
  forestry: Trees,
  welding: Flame,
  automotive: Cog,
  nutrition: Leaf,
  meditation: Sparkles,
  hvac: Wind,
  robotics: Cpu,
  first_aid: Heart,
  hermetics: Sparkles,
  speaking: Feather,
  philosophy: BookOpen,
  pedagogy: BookOpen,
  anatomy: Heart,
  machining: Cog,
};

const TOOL_ICON_FALLBACK = Wrench;

// Resolve a tool's display icon. Prefers a Lucide component name shipped
// by the backend; otherwise picks the per-module fallback so each trade
// has its own visual signature instead of every tool looking like a wrench.
function resolveToolIcon(tool, moduleId) {
  const sym = tool?.icon_symbol;
  if (sym && LUCIDE_ICON_MAP[sym]) return LUCIDE_ICON_MAP[sym];
  return MODULE_TOOL_FALLBACK[moduleId] || TOOL_ICON_FALLBACK;
}

// Whether the icon_symbol is just a letter glyph (legacy modules) — we
// keep it as a small corner badge when so, and hide it when the backend
// already shipped a full icon name.
function isGlyphSymbol(sym) {
  if (!sym) return false;
  if (LUCIDE_ICON_MAP[sym]) return false;
  return sym.length <= 2;
}

// Per-module + per-material icon resolver. Science modules ship rich
// material identities (igneous rock, fossils, biome samples) — render
// a material-themed icon in the center block instead of the verb-tool.
// Falls back to the module game-theme icon when no specific map applies.
const MATERIAL_ICON_BY_ID = {
  // GEOLOGY rocks
  igneous: Flame, sedimentary: Layers, metamorphic: Sparkles,
  minerals: Gem, plate_tectonics: Mountain, hydrogeology: Droplets,
  // PALEONTOLOGY (if added later)
  fossil: Bone, dinosaur: Bone,
  // ECOLOGY
  forest: Trees, biome: Leaf,
};

const MATERIAL_ICON_BY_MODULE = {
  geology: Mountain,
  paleontology: Bone,
  ecology: Leaf,
  meteorology: Wind,
  forestry: Trees,
  masonry: Mountain,
  carpentry: Trees,
  herbalism: Leaf,
  landscaping: Leaf,
  gardening: Leaf,
  nursing: Heart,
  childcare: Heart,
  eldercare: Heart,
  bible: BookOpen,
  philosophy: BookOpen,
  hermetics: Sparkles,
};

function resolveMaterialIcon(material, moduleId, themeFallback) {
  if (!material) return themeFallback;
  if (MATERIAL_ICON_BY_ID[material.id]) return MATERIAL_ICON_BY_ID[material.id];
  if (MATERIAL_ICON_BY_MODULE[moduleId]) return MATERIAL_ICON_BY_MODULE[moduleId];
  return themeFallback || Gem;
}

function CenterBlock({ material, isActive, onTap, accentColor }) {
  if (!material) return null;
  const c = material.color || accentColor;
  return (
    <motion.div className="relative cursor-pointer" onClick={onTap}
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} data-testid="center-block">
      <svg viewBox="0 0 200 200" width="180" height="180" className="mx-auto">
        <ellipse cx="100" cy="170" rx="60" ry="12" fill="rgba(0,0,0,0.3)" />
        <polygon points="100,40 160,70 100,100 40,70" fill={c} stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        <polygon points="40,70 100,100 100,155 40,125" fill={`${c}DD`} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <polygon points="160,70 100,100 100,155 160,125" fill={`${c}AA`} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        {[...Array(5)].map((_, i) => (
          <line key={i} x1={55+i*18} y1={55+i*4} x2={65+i*14} y2={100+i*5}
            stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        ))}
        {isActive && (
          <circle cx="100" cy="100" r="85" fill="none" stroke={c} strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="80;90;80" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
      <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none">
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded"
          style={{ color: c, background: 'rgba(0,0,0,0.6)' }}>{material.name}</span>
      </div>
    </motion.div>
  );
}

function ToolRing({ tools, selectedTool, onSelectTool, ringRadius = 155 }) {
  const count = tools.length;
  return (
    <div className="absolute inset-0 pointer-events-none" data-testid="tool-ring">
      {tools.map((tool, i) => {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * ringRadius, y = Math.sin(angle) * ringRadius;
        const sel = selectedTool?.id === tool.id;
        return (
          <motion.button key={tool.id} className="absolute pointer-events-auto"
            style={{ left: `calc(50% + ${x}px - 22px)`, top: `calc(50% + ${y}px - 22px)`, width: 44, height: 44 }}
            onClick={() => onSelectTool(tool)} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
            animate={{ scale: sel ? 1.25 : 1, boxShadow: sel ? `0 0 20px ${tool.color}60` : `0 0 8px ${tool.color}20` }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            data-testid={`wtool-${tool.id}`}>
            <div className="w-full h-full rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: sel ? `${tool.color}30` : `${tool.color}12`,
                border: `2px solid ${sel ? tool.color : `${tool.color}40`}`, color: tool.color }}>
              {tool.icon_symbol}
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] font-bold uppercase tracking-wider"
              style={{ color: sel ? tool.color : 'rgba(255,255,255,0.35)' }}>
              {tool.name.split(' ')[0]}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function DivePanel({ material, isOpen, onClose, accentColor, moduleId }) {
  const [depth, setDepth] = useState(0);
  useEffect(() => { setDepth(0); }, [material?.id]);
  if (!isOpen || !material) return null;
  const layers = material.dive_layers || [];
  const cur = layers[depth] || layers[0];
  const maxD = layers.length - 1;
  const COLORS = ['#8B6914', '#4169E1', '#20B2AA', '#FFD700', '#FF6347', '#E6E6FA'];
  const dc = COLORS[depth] || accentColor;

  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4 }} className="overflow-hidden" data-testid="dive-panel">
      <div className="rounded-2xl p-4 mt-4" style={{ background: `linear-gradient(135deg, ${dc}08, transparent)`, border: `1px solid ${dc}25` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers size={14} style={{ color: dc }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: dc }}>Recursive Dive — L{depth}</span>
          </div>
          <button onClick={onClose} className="text-[9px] px-2 py-1 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }} data-testid="dive-close">Surface</button>
        </div>
        <div className="flex gap-1 mb-3">
          {layers.map((_, i) => (
            <button key={i} onClick={() => setDepth(i)}
              className="flex-1 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wider"
              style={{ background: depth === i ? `${COLORS[i]}20` : 'rgba(255,255,255,0.02)',
                color: depth === i ? COLORS[i] : 'rgba(255,255,255,0.3)',
                border: `1px solid ${depth === i ? `${COLORS[i]}40` : 'transparent'}` }}
              data-testid={`dive-l${i}`}>L{i}</button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={depth} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <h4 className="text-sm font-medium mb-1" style={{ color: dc, fontFamily: 'Cormorant Garamond, serif' }}>{cur.label}</h4>
            <p className="text-[10px] leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>{cur.desc}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-2 mt-2">
          {depth > 0 && (
            <button onClick={() => setDepth(d => Math.max(0, d - 1))}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)' }}>
              <ChevronUp size={12} /> Surface
            </button>
          )}
          {depth < maxD && (
            <button onClick={() => { const newDepth = Math.min(maxD, depth + 1); setDepth(newDepth);
              if (typeof window.__workAccrue === 'function') window.__workAccrue(`${material.id}_dive`, 8);
              // Earn Sparks for material dive
              const t = localStorage.getItem('zen_token');
              if (t && t !== 'guest_token') axios.post(`${API}/sparks/earn`, { action: 'workshop_material_dive', context: material.id }, { headers: { Authorization: `Bearer ${t}` } }).catch(() => {});
              // V68.4: Fire Sovereign Universe signal for quest auto-detect
              try { window.SovereignUniverse?.checkQuestLogic(`${moduleId}:dive:${material.id}:${newDepth}`, moduleId); } catch {}
            }}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] uppercase tracking-wider"
              style={{ background: `${dc}12`, color: dc, border: `1px solid ${dc}30` }} data-testid="dive-deeper">
              <ChevronDown size={12} /> Dive Deeper
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function UniversalWorkshop({ moduleId, dataModuleId, title, subtitle, icon: Icon, accentColor, skillKey, matLabel = 'Material', storageKey }) {
  const apiModuleId = dataModuleId || moduleId;
  const { authHeaders, token } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [tools, setTools] = useState([]);
  const [selMat, setSelMat] = useState(null);
  const [selTool, setSelTool] = useState(null);
  const [diveOpen, setDiveOpen] = useState(false);
  const [tutorial, setTutorial] = useState(null);
  const [tutLoading, setTutLoading] = useState(false);
  const [actions, setActions] = useState(() => {
    try { return parseInt(localStorage.getItem(storageKey) || '0'); } catch { return 0; }
  });
  // V68.26 — Chamber mini-game state. Tapping the material or a tool
  // opens a themed game (strike stone, saw beam, knead dough, match
  // current flow, etc.) instead of the old flat letter-circle tap.
  const [gameKey, setGameKey] = useState(null); // null | "material" | "tool:<id>"
  const isFullAuth = token && token !== 'guest_token';
  const mixer = useMixer();

  // V68.32 — Resonance presets are OPT-IN only. Auto-prime on chamber
  // entry was invasive (bombed users with biometric frequencies the
  // moment they walked in). Now a pill appears offering the preset;
  // nothing activates unless the user taps it. Decision is remembered
  // per-chamber-per-session so we never pester them again.
  const chamberKey = MODULE_TO_CHAMBER[moduleId] || moduleId;
  const presetKey = `emcafe_resonance_choice_${chamberKey}`;
  const [resonanceOffer, setResonanceOffer] = useState(null);
  useEffect(() => {
    if (!mixer?.RESONANCE_PRESETS) return;
    try {
      // Clear legacy auto-primed flags from V68.27 so users who already
      // got bombed don't stay stuck; the choice pill will reappear.
      const legacyKey = `emcafe_resonance_primed_${chamberKey}`;
      if (sessionStorage.getItem(legacyKey) && !sessionStorage.getItem(presetKey)) {
        sessionStorage.removeItem(legacyKey);
      }
      if (sessionStorage.getItem(presetKey)) return; // already answered
      const preset = mixer.RESONANCE_PRESETS[chamberKey];
      if (!preset) return;
      setResonanceOffer(preset);
    } catch { /* noop */ }
  }, [chamberKey, mixer, presetKey]);
  const acceptResonance = useCallback(() => {
    try { sessionStorage.setItem(presetKey, 'accepted'); } catch {}
    try { mixer?.applyResonancePreset?.(chamberKey); } catch {}
    setResonanceOffer(null);
  }, [chamberKey, mixer, presetKey]);
  const declineResonance = useCallback(() => {
    try { sessionStorage.setItem(presetKey, 'declined'); } catch {}
    setResonanceOffer(null);
  }, [presetKey]);

  // Bridge: the bottom Cosmic Mixer nodules broadcast sovereign:mixer-*
  // events. Any chamber mini-game that is currently open listens via
  // ChamberMiniGame; here we surface the most recent mixer intensity so
  // the workshop prop glow reacts too (mixer integration the user asked
  // for: nodules have a FUNCTION inside the module, not decoration).
  const [mixerPulse, setMixerPulse] = useState(0);
  useEffect(() => {
    const onMix = () => setMixerPulse((k) => k + 1);
    window.addEventListener('sovereign:mixer-tick', onMix);
    return () => window.removeEventListener('sovereign:mixer-tick', onMix);
  }, []);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('module_interaction', 12); }, []);

  useEffect(() => {
    const h = isFullAuth ? { headers: authHeaders } : {};
    Promise.all([
      axios.get(`${API}/workshop/${apiModuleId}/materials`, h).catch(() => null),
      axios.get(`${API}/workshop/${apiModuleId}/tools`, h).catch(() => null),
    ]).then(([mRes, tRes]) => {
      if (mRes?.data) { const vals = Object.values(mRes.data).find(v => Array.isArray(v)) || []; setMaterials(vals); if (vals.length) setSelMat(vals[0]); }
      if (tRes?.data?.tools) setTools(tRes.data.tools);
    });
  }, [apiModuleId, authHeaders, token, isFullAuth]);

  useEffect(() => { try { localStorage.setItem(storageKey, String(actions)); } catch {} }, [actions, storageKey]);

  const handleMatTap = useCallback(() => {
    if (!selMat) return;
    // V68.26: tapping the material now opens a real themed chamber game.
    setGameKey('material');
    if (typeof window.__workAccrue === 'function') window.__workAccrue(`${moduleId}_inspect`, 5);
    try { if (selMat) window.SovereignUniverse?.checkQuestLogic(`${moduleId}:material:${selMat.id}`, moduleId); } catch {}
  }, [moduleId, selMat]);

  const handleToolSelect = useCallback(async (tool) => {
    if (!selMat) return;
    setSelTool(tool); setDiveOpen(false); setTutorial(null); setActions(c => c + 1);
    if (typeof window.__workAccrue === 'function') window.__workAccrue(skillKey, 12);
    // Open the tool's themed chamber mini-game (strike/saw/knead/etc).
    setGameKey(`tool:${tool.id}`);
    // Earn Sparks for tool use
    const t = localStorage.getItem('zen_token');
    if (t && t !== 'guest_token') axios.post(`${API}/sparks/earn`, { action: 'workshop_tool_use', context: `${moduleId}_${tool.id}` }, { headers: { Authorization: `Bearer ${t}` } }).catch(() => {});
    try {
      setTutLoading(true);
      const h = isFullAuth ? { headers: authHeaders } : {};
      const res = await axios.post(`${API}/workshop/${apiModuleId}/tool-action`, { tool_id: tool.id, material_id: selMat.id }, h);
      const ctx = res.data?.tutorial_context;
      if (isFullAuth && ctx) {
        try {
          const tut = await axios.post(`${API}/knowledge/deep-dive`, { topic: `${tool.name} on ${selMat.name}`, category: moduleId, context: ctx }, { headers: authHeaders, timeout: 90000 });
          setTutorial(tut.data?.content || 'Tutorial complete.');
          try { await axios.post(`${API}/rpg/character/gain-xp`, { amount: 12, source: `${moduleId}_${tool.id}` }, { headers: authHeaders }); } catch {}
        } catch { setTutorial(`${tool.name} Technique:\n\n${tool.technique}\n\n${matLabel}: ${selMat.name}\n${selMat.origin || ''}\n\n${tool.description}`); }
      } else {
        setTutorial(`${tool.name} Technique:\n\n${tool.technique}\n\n${matLabel}: ${selMat.name}\n${selMat.origin || ''}\n\n${tool.description}`);
      }
    } catch { setTutorial(`${tool.name}: ${tool.description}\n\n${tool.technique}`); }
    finally { setTutLoading(false); }
  }, [selMat, authHeaders, isFullAuth, moduleId, skillKey, matLabel]);

  const mastery = useMemo(() => {
    if (actions >= 100) return { title: 'Master', color: accentColor };
    if (actions >= 50) return { title: 'Journeyman', color: '#A78BFA' };
    if (actions >= 20) return { title: 'Apprentice', color: '#22C55E' };
    if (actions >= 5) return { title: 'Novice', color: '#D4A76A' };
    return { title: 'Initiate', color: '#94A3B8' };
  }, [actions, accentColor]);

  return (
    <HolographicChamber
      chamberId={MODULE_TO_CHAMBER[moduleId] || 'academy'}
      title={title}
      subtitle={subtitle || 'Holographic Workbench'}
      fullBleed
    >
    <div className="min-h-screen px-4 py-6 sm:px-8" data-testid={`${moduleId}-workbench-page`}>
      {resonanceOffer && (
        <div
          data-testid={`resonance-offer-${chamberKey}`}
          style={{
            maxWidth: 360, margin: '0 auto 12px',
            background: 'rgba(16,12,24,0.72)',
            border: '1px solid rgba(192,132,252,0.35)',
            borderRadius: 14, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: resonanceOffer.color || '#C084FC',
            flex: '0 0 auto',
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>
              RESONANCE RECIPE · OPTIONAL
            </div>
            <div style={{ fontSize: 12, color: '#fff', fontFamily: 'monospace', marginTop: 2 }}>
              {resonanceOffer.label}
            </div>
          </div>
          <button
            type="button"
            onClick={declineResonance}
            data-testid={`resonance-decline-${chamberKey}`}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.55)', fontSize: 9, letterSpacing: 2,
              padding: '6px 10px', borderRadius: 999, cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            NO THANKS
          </button>
          <button
            type="button"
            onClick={acceptResonance}
            data-testid={`resonance-accept-${chamberKey}`}
            style={{
              background: resonanceOffer.color || '#C084FC',
              border: 'none',
              color: '#000', fontWeight: 700, fontSize: 9, letterSpacing: 2,
              padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            PLAY
          </button>
        </div>
      )}
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon size={16} style={{ color: accentColor }} />}
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>{title}</h1>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        </div>

        <div className="flex items-center justify-between mb-5 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} data-testid="mastery-bar">
          <div className="flex items-center gap-2">
            <Gem size={12} style={{ color: mastery.color }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: mastery.color }}>{mastery.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{actions} actions</span>
            <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, actions)}%`, background: mastery.color }} />
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1" data-testid="material-selector">
          {materials.map(m => (
            <button key={m.id} onClick={() => { setSelMat(m); setDiveOpen(false); setTutorial(null); setSelTool(null); }}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all"
              style={{ background: selMat?.id === m.id ? `${m.color || accentColor}15` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selMat?.id === m.id ? `${m.color || accentColor}40` : 'rgba(255,255,255,0.06)'}`,
                color: selMat?.id === m.id ? (m.color || accentColor) : 'rgba(255,255,255,0.4)' }}
              data-testid={`mat-${m.id}`}>{m.name}</button>
          ))}
        </div>

        <div className="relative mx-auto mb-4" style={{ width: 360, height: 360 }} data-testid="circular-workshop">
          <svg className="absolute inset-0" viewBox="0 0 360 360" style={{ pointerEvents: 'none' }}>
            <circle cx="180" cy="180" r="155" fill="none" stroke={`${accentColor}15`} strokeWidth="1" strokeDasharray="4,4" />
            <circle cx="180" cy="180" r="90" fill="none" stroke={`${accentColor}08`} strokeWidth="0.5" />
          </svg>
          {/* Center holographic material prop — tap to open the themed
              break-game (strike stone / saw beam / knead dough / etc.).
              No more flat SVG cube with a letter. */}
          {selMat && (() => {
            const theme = MODULE_GAME_THEME[moduleId] || MODULE_GAME_THEME.masonry;
            const matColor = selMat.color || accentColor;
            const MatIcon = resolveMaterialIcon(selMat, moduleId, theme.icon || Gem);
            return (
              <motion.button
                type="button"
                onClick={handleMatTap}
                data-testid="center-block"
                whileTap={{ scale: 0.94 }}
                animate={{ scale: mixerPulse % 2 === 1 ? 1.06 : 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                style={{
                  position: 'absolute',
                  left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                  width: 170, height: 170, borderRadius: '50%',
                  border: `2px solid ${matColor}`,
                  background: `radial-gradient(circle at 35% 30%, ${matColor}66 0%, ${matColor}22 45%, rgba(0,0,0,0.35) 95%)`,
                  boxShadow: `0 0 42px ${matColor}66, inset 0 0 28px ${matColor}55`,
                  color: '#fff', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: 0,
                }}
              >
                <MatIcon size={54} style={{ color: matColor, filter: `drop-shadow(0 0 18px ${matColor})` }} />
                <span style={{
                  marginTop: 8, fontSize: 10, letterSpacing: 3,
                  fontFamily: 'monospace', color: matColor,
                }}>
                  {selMat.name?.toUpperCase()}
                </span>
                <span style={{
                  fontSize: 8, letterSpacing: 2,
                  fontFamily: 'monospace', color: 'rgba(255,255,255,0.55)', marginTop: 2,
                }}>
                  TAP TO {theme.verb}
                </span>
              </motion.button>
            );
          })()}
          {/* Tool ring — each tool is a ChamberProp-style hotspot.
              Tapping a tool opens its themed mini-game in the chamber. */}
          {tools.length > 0 && (
            <div className="absolute inset-0" data-testid="tool-ring">
              {tools.map((tool, i) => {
                const count = tools.length;
                const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
                const ringRadius = 150;
                const x = Math.cos(angle) * ringRadius, y = Math.sin(angle) * ringRadius;
                const sel = selTool?.id === tool.id;
                const c = tool.color || accentColor;
                const glyph = tool.icon_symbol;
                const ToolIcon = resolveToolIcon(tool, moduleId);
                const showGlyphBadge = isGlyphSymbol(glyph);
                return (
                  <motion.button
                    key={tool.id}
                    type="button"
                    onClick={() => handleToolSelect(tool)}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.15 }}
                    animate={{ scale: sel ? 1.2 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    data-testid={`wtool-${tool.id}`}
                    style={{
                      position: 'absolute',
                      left: `calc(50% + ${x}px - 28px)`,
                      top: `calc(50% + ${y}px - 28px)`,
                      width: 56, height: 56, borderRadius: '50%',
                      border: `2px solid ${c}`,
                      background: `radial-gradient(circle, ${c}44 0%, ${c}11 55%, transparent 90%)`,
                      boxShadow: `0 0 22px ${c}66, inset 0 0 10px ${c}55`,
                      color: c, cursor: 'pointer', padding: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <ToolIcon size={22} style={{ color: c, filter: `drop-shadow(0 0 6px ${c}88)` }} />
                    {/* Glyph watermark only for legacy single-letter modules */}
                    {showGlyphBadge && (
                      <span style={{
                        position: 'absolute', top: -4, right: -4,
                        fontSize: 9, fontFamily: 'monospace',
                        color: c, background: 'rgba(0,0,0,0.6)',
                        padding: '1px 4px', borderRadius: 6,
                      }}>{glyph}</span>
                    )}
                    <span style={{
                      position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)',
                      fontSize: 7, letterSpacing: 2, fontFamily: 'monospace',
                      color: sel ? c : 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap',
                      textShadow: '0 2px 6px rgba(0,0,0,0.8)',
                    }}>
                      {String(tool.name || '').split(' ')[0]?.toUpperCase()}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* V68.26 Chamber mini-game — opens when a tool or the material
            is tapped. Mode / verb / icon are themed per module. The game
            machine is progressive (scales with each completion) and
            signals the SovereignUniverse brain. */}
        {(() => {
          const theme = MODULE_GAME_THEME[moduleId] || MODULE_GAME_THEME.masonry;
          const isMat = gameKey === 'material';
          const isTool = gameKey && gameKey.startsWith('tool:');
          const gcolor = isTool ? (selTool?.color || accentColor) : (selMat?.color || accentColor);
          const zoneBase = `${moduleId}_${isMat ? 'material' : (selTool?.id || 'tool')}`;

          // V68.29 — Drill-down chain. After the current stage the
          // user can "CONTINUE DEEPER →" through the remaining tools
          // of this trade. Each next tool pre-configures its theme
          // using the same MODULE_GAME_THEME, so carpentry chains
          // through every saw/chisel/hammer, masonry through every
          // mallet/chisel, etc. No duplicated components.
          const currentToolId = isTool ? selTool?.id : null;
          const remaining = tools.filter(t => t.id !== currentToolId);
          const nextGame = remaining.slice(0, 4).map((t) => ({
            mode: theme.mode,
            color: t.color || accentColor,
            title: `${String(t.name || '').toUpperCase()} · ${selMat?.name?.toUpperCase() || ''}`,
            verb: theme.verb,
            icon: theme.icon,
            targetCount: theme.mode === 'rhythm' ? 5 : (theme.mode === 'break' ? 5 : 7),
            hitsPerTarget: 3,
            zone: `${moduleId}_${t.id}`,
            completionMsg: theme.msg,
            completionXP: 12,
            teach: {
              topic: `${t.name} — ${t.action_verb || theme.verb.toLowerCase()} on ${selMat?.name || matLabel}`,
              category: apiModuleId,
              context: `Trade: ${moduleId}. Tool description: ${t.description || ''}. Classical technique: ${t.technique || ''}. Teach the user the actual craft concept, safety, and a specific progressive exercise they can do today.`,
            },
          }));

          // Teach payload for the current stage (material intro or current tool)
          const currentTeach = isTool && selTool
            ? {
                topic: `${selTool.name} — ${selTool.action_verb || theme.verb.toLowerCase()} on ${selMat?.name || matLabel}`,
                category: apiModuleId,
                context: `Trade: ${moduleId}. Tool: ${selTool.description || ''}. Technique: ${selTool.technique || ''}. Teach the craft concept and a progressive drill.`,
              }
            : (selMat ? {
                topic: `${selMat.name} — properties and how a ${moduleId} practitioner chooses it`,
                category: apiModuleId,
                context: `Material: ${selMat.origin || ''}. Teach geological/botanical/culinary context, grain/structure considerations, and why this material rewards the ${theme.verb.toLowerCase()} action.`,
              } : null);

          // V1.0.14 — Geology workshop swaps to true 3D R3F chamber
          // (rock mesh, OrbitControls, strike fractures). Other modules
          // keep the existing 2D ChamberMiniGame for now.
          const Use3D = moduleId === 'geology' && theme.mode === 'break';
          const ChamberComp = Use3D ? Chamber3DGame : ChamberMiniGame;

          return (
            <ChamberComp
              open={!!gameKey}
              onClose={() => setGameKey(null)}
              mode={theme.mode}
              color={gcolor}
              title={isTool && selTool ? `${String(selTool.name || '').toUpperCase()} · ${selMat?.name?.toUpperCase() || ''}` : theme.title}
              verb={theme.verb}
              icon={theme.icon}
              targetCount={theme.mode === 'rhythm' ? 5 : (theme.mode === 'break' ? 5 : 7)}
              hitsPerTarget={3}
              zone={zoneBase}
              completionMsg={theme.msg}
              completionXP={12}
              teach={currentTeach}
              nextGame={nextGame}
              onGoDeeper={(next) => {
                const matching = tools.find(t => t.id === (next.zone || '').replace(`${moduleId}_`, ''));
                if (matching) setSelTool(matching);
              }}
            />
          );
        })()}

        {selTool && !diveOpen && (() => {
          const SelToolIcon = resolveToolIcon(selTool, moduleId);
          const selGlyph = selTool.icon_symbol;
          const showSelGlyph = isGlyphSymbol(selGlyph);
          return (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl p-3" style={{ background: `${selTool.color}06`, border: `1px solid ${selTool.color}15` }} data-testid="tool-info">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: `${selTool.color}20`, color: selTool.color }}>
                {showSelGlyph
                  ? <span className="text-xs font-bold">{selGlyph}</span>
                  : <SelToolIcon size={14} style={{ color: selTool.color }} />}
              </div>
              <div>
                <h3 className="text-sm font-medium" style={{ color: selTool.color, fontFamily: 'Cormorant Garamond, serif' }}>{selTool.name}</h3>
                <p className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{selTool.action_verb} — {selMat?.name}</p>
              </div>
            </div>
            <p className="text-[10px] leading-relaxed mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{selTool.description}</p>
            <p className="text-[9px] leading-relaxed mt-1 italic" style={{ color: 'rgba(255,255,255,0.45)' }}>{selTool.technique}</p>
          </motion.div>
          );
        })()}

        <AnimatePresence>
          {diveOpen && <DivePanel material={selMat} isOpen={diveOpen} onClose={() => setDiveOpen(false)} accentColor={accentColor} moduleId={moduleId} />}
        </AnimatePresence>

        <AnimatePresence>
          {(tutLoading || tutorial) && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden" data-testid="tutorial-panel">
              <div className="rounded-2xl p-4 mt-4" style={{ background: `${selTool?.color || accentColor}06`, border: `1px solid ${selTool?.color || accentColor}20` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap size={12} style={{ color: selTool?.color || accentColor }} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: selTool?.color || accentColor }}>
                      {selTool?.name} — Generative Tutorial</span>
                  </div>
                  <button onClick={() => { setTutorial(null); setTutLoading(false); }} className="text-[8px] px-2 py-0.5 rounded"
                    style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)' }}>Close</button>
                </div>
                {tutLoading ? (
                  <div className="flex items-center gap-2 py-4">
                    <div className="w-3 h-3 border border-current/40 border-t-current rounded-full animate-spin" style={{ color: accentColor }} />
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Generating tutorial...</span>
                  </div>
                ) : (
                  <p className="text-[10px] leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.7)' }}>{tutorial}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </HolographicChamber>
  );
}
