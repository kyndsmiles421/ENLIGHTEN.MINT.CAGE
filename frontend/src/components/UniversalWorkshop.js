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
import { ChevronDown, ChevronUp, Layers, Gem, Zap } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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

export default function UniversalWorkshop({ moduleId, title, subtitle, icon: Icon, accentColor, skillKey, matLabel = 'Material', storageKey }) {
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
  const isFullAuth = token && token !== 'guest_token';

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('module_interaction', 12); }, []);

  useEffect(() => {
    const h = isFullAuth ? { headers: authHeaders } : {};
    Promise.all([
      axios.get(`${API}/workshop/${moduleId}/materials`, h).catch(() => null),
      axios.get(`${API}/workshop/${moduleId}/tools`, h).catch(() => null),
    ]).then(([mRes, tRes]) => {
      if (mRes?.data) { const vals = Object.values(mRes.data).find(v => Array.isArray(v)) || []; setMaterials(vals); if (vals.length) setSelMat(vals[0]); }
      if (tRes?.data?.tools) setTools(tRes.data.tools);
    });
  }, [moduleId, authHeaders, token, isFullAuth]);

  useEffect(() => { try { localStorage.setItem(storageKey, String(actions)); } catch {} }, [actions, storageKey]);

  const handleMatTap = useCallback(() => {
    if (diveOpen) setDiveOpen(false);
    else { setDiveOpen(true); setTutorial(null); setSelTool(null);
      if (typeof window.__workAccrue === 'function') window.__workAccrue(`${moduleId}_inspect`, 5);
      // V68.4: Fire Sovereign Universe signal — material identify
      try { if (selMat) window.SovereignUniverse?.checkQuestLogic(`${moduleId}:material:${selMat.id}`, moduleId); } catch {}
    }
  }, [diveOpen, moduleId, selMat]);

  const handleToolSelect = useCallback(async (tool) => {
    if (!selMat) return;
    setSelTool(tool); setDiveOpen(false); setTutorial(null); setActions(c => c + 1);
    if (typeof window.__workAccrue === 'function') window.__workAccrue(skillKey, 12);
    // Earn Sparks for tool use
    const t = localStorage.getItem('zen_token');
    if (t && t !== 'guest_token') axios.post(`${API}/sparks/earn`, { action: 'workshop_tool_use', context: `${moduleId}_${tool.id}` }, { headers: { Authorization: `Bearer ${t}` } }).catch(() => {});
    try {
      setTutLoading(true);
      const h = isFullAuth ? { headers: authHeaders } : {};
      const res = await axios.post(`${API}/workshop/${moduleId}/tool-action`, { tool_id: tool.id, material_id: selMat.id }, h);
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
    <div className="min-h-screen px-4 py-6 sm:px-8" data-testid={`${moduleId}-workbench-page`}>
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
          <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            <CenterBlock material={selMat} isActive={diveOpen} onTap={handleMatTap} accentColor={accentColor} />
          </div>
          {tools.length > 0 && <ToolRing tools={tools} selectedTool={selTool} onSelectTool={handleToolSelect} />}
        </div>

        {selTool && !diveOpen && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl p-3" style={{ background: `${selTool.color}06`, border: `1px solid ${selTool.color}15` }} data-testid="tool-info">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: `${selTool.color}20`, color: selTool.color }}>{selTool.icon_symbol}</div>
              <div>
                <h3 className="text-sm font-medium" style={{ color: selTool.color, fontFamily: 'Cormorant Garamond, serif' }}>{selTool.name}</h3>
                <p className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{selTool.action_verb} — {selMat?.name}</p>
              </div>
            </div>
            <p className="text-[10px] leading-relaxed mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{selTool.description}</p>
            <p className="text-[9px] leading-relaxed mt-1 italic" style={{ color: 'rgba(255,255,255,0.45)' }}>{selTool.technique}</p>
          </motion.div>
        )}

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
  );
}
