/**
 * TorusPanel.js — Orbital navigation panel
 * Extracted from UnifiedCreatorConsole.js
 * Shows CelestialTorus + pillar buttons, or expanded module grid.
 */
import React from 'react';
import { ChevronUp } from 'lucide-react';
import { CelestialTorus } from '../CelestialTorus';
import { PILLARS, findModule } from '../ConsoleConstants';

export default function TorusPanel({ expandedPillar, setExpandedPillar, pillarLevels, setPillarLevels, modStates, handleNav, currentRoute }) {
  const current = findModule(currentRoute);

  if (expandedPillar !== null) {
    const p = PILLARS[expandedPillar];
    return (
      <div style={{ background: '#050508' }} data-testid="torus-expanded">
        <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${p.color}20` }}>
          <button onClick={() => setExpandedPillar(null)}
            className="flex items-center gap-1.5 active:scale-95"
            style={{ color: p.color }} data-testid="torus-back">
            <ChevronUp size={14} style={{ transform: 'rotate(-90deg)' }} />
            <span className="text-[10px] font-bold">Orbit</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold" style={{ color: p.color }}>{p.full}</span>
            <span className="text-[9px] font-mono" style={{ color: p.color + '66' }}>{p.modules.length} modules</span>
          </div>
          <div className="flex items-center gap-1">
            <input type="range" min="0" max="100" value={pillarLevels[expandedPillar]}
              onChange={(e) => setPillarLevels(prev => { const n = [...prev]; n[expandedPillar] = Number(e.target.value); return n; })}
              className="w-10 h-1 rounded-full cursor-pointer" style={{ accentColor: p.color }} />
            <span className="text-[7px] font-mono" style={{ color: p.color + '66' }}>{pillarLevels[expandedPillar]}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
          {p.modules.map(mod => {
            const st = modStates[mod.id] || { value: 50, muted: false };
            const isCurrentMod = currentRoute === mod.route;
            return (
              <button key={mod.id} onClick={() => handleNav(mod.route)}
                className="p-3 rounded-xl text-center active:scale-95 transition-all"
                style={{
                  background: isCurrentMod ? `${p.color}20` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isCurrentMod ? `${p.color}40` : 'rgba(255,255,255,0.06)'}`,
                  opacity: st.muted ? 0.3 : 1,
                }}
                data-testid={`torus-mod-${mod.id}`}>
                <div className="text-[11px] font-bold" style={{ color: isCurrentMod ? p.color : 'rgba(255,255,255,0.6)' }}>{mod.label}</div>
                {isCurrentMod && <div className="w-1.5 h-1.5 rounded-full mx-auto mt-1" style={{ background: p.color }} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#050508' }}>
      <CelestialTorus
        pillars={PILLARS}
        pillarLevels={pillarLevels}
        onNav={handleNav}
        currentRoute={currentRoute}
        onPillarTap={(i) => setExpandedPillar(i)}
        expandedPillar={null}
      />
      <div className="flex gap-1 px-2 py-1.5" style={{ borderTop: '1px solid rgba(16,185,129,0.06)' }}>
        {PILLARS.map((p, i) => (
          <button key={p.key} onClick={() => setExpandedPillar(i)}
            className="flex-1 py-1.5 rounded-lg text-center active:scale-95 transition-all"
            style={{
              background: current?.pillar.key === p.key ? `${p.color}15` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${current?.pillar.key === p.key ? `${p.color}30` : 'rgba(255,255,255,0.04)'}`,
            }}
            data-testid={`torus-pillar-${p.key}`}>
            <div className="text-[7px] font-bold" style={{ color: current?.pillar.key === p.key ? p.color : p.color + '55' }}>{p.title}</div>
            <div className="text-[5px]" style={{ color: p.color + '33' }}>{p.modules.length}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
