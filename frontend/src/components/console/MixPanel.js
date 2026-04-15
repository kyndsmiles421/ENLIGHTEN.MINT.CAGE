/**
 * MixPanel.js — Channel fader strip panel
 * Extracted from UnifiedCreatorConsole.js
 * Shows master fader, pillar-level faders, and per-module mixer channels.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PILLARS, findModule } from '../ConsoleConstants';

export default function MixPanel({
  masterLevel, setMasterLevel, pillarLevels, setPillarLevels,
  expandedPillar, setExpandedPillar, modStates, setModStates,
  handleMuteChange, handleNav, currentRoute,
}) {
  const current = findModule(currentRoute);

  return (
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
                    const isCurrentMod = currentRoute === mod.route;
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
}
