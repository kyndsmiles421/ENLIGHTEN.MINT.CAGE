import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NanoGuide } from './NanoGuide';

const ELEMENTS = [
  { id: 'Wood', angle: -90, color: '#22C55E', freq: 396, label: 'Liberation', weight: 10 },
  { id: 'Fire', angle: -18, color: '#EF4444', freq: 528, label: 'Transformation', weight: 15 },
  { id: 'Earth', angle: 54, color: '#F59E0B', freq: 639, label: 'Connection', weight: 12 },
  { id: 'Metal', angle: 126, color: '#94A3B8', freq: 741, label: 'Expression', weight: 8 },
  { id: 'Water', angle: 198, color: '#3B82F6', freq: 852, label: 'Intuition', weight: 14 },
];

const GENERATING = [
  ['Wood', 'Fire'], ['Fire', 'Earth'], ['Earth', 'Metal'], ['Metal', 'Water'], ['Water', 'Wood'],
];
const CONTROLLING = [
  ['Wood', 'Earth'], ['Fire', 'Metal'], ['Earth', 'Water'], ['Metal', 'Wood'], ['Water', 'Fire'],
];

const NATURE_WEIGHTS = { Hot: 15, Warm: 10, Neutral: 5, Cool: 10, Cold: 15 };

function getPos(angleDeg, radius, cx, cy) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function arrowPath(from, to, curvature = 0) {
  if (curvature === 0) return `M${from.x},${from.y} L${to.x},${to.y}`;
  const mx = (from.x + to.x) / 2 + curvature;
  const my = (from.y + to.y) / 2 + curvature;
  return `M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`;
}

export function FiveElementsWheel({ activeElement, onElementClick, plants = [], gardenSummary, resonanceData, energies, stability }) {
  const [hoveredElement, setHoveredElement] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const cx = 160, cy = 160, outerR = 120, nodeR = 24;

  const elementMap = useMemo(() => {
    const map = {};
    ELEMENTS.forEach(e => { map[e.id] = e; });
    return map;
  }, []);

  const plantsByElement = useMemo(() => {
    const groups = {};
    ELEMENTS.forEach(e => { groups[e.id] = []; });
    plants.forEach(p => {
      if (!p.locked && groups[p.element]) groups[p.element].push(p);
    });
    return groups;
  }, [plants]);

  const activeOrHovered = hoveredElement || activeElement;
  const activeData = activeOrHovered ? elementMap[activeOrHovered] : null;

  return (
    <div className="rounded-xl overflow-hidden" data-testid="five-elements-wheel"
      style={{ background: 'rgba(0,0,0,0)', border: '1px solid rgba(248,250,252,0.04)', backdropFilter: 'blur(20px)' }}>

      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <p className="text-[8px] uppercase tracking-[0.2em] font-medium" style={{ color: 'rgba(248,250,252,0.2)' }}>
            Five Elements Wheel
          </p>
          <NanoGuide guideId="five-elements-wheel" position="top-right" />
        </div>
        {activeElement && (
          <button onClick={() => onElementClick(null)} className="text-[8px] px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(248,250,252,0.04)', color: 'rgba(248,250,252,0.3)' }}
            data-testid="wheel-clear-filter">Clear</button>
        )}
      </div>

      <div className="flex justify-center px-2">
        <svg width={320} height={320} viewBox="0 0 320 320" data-testid="wheel-svg" ref={svgRef}
          onMouseMove={e => {
            if (!svgRef.current) return;
            const rect = svgRef.current.getBoundingClientRect();
            setMousePos({
              x: ((e.clientX - rect.left) / rect.width) * 320,
              y: ((e.clientY - rect.top) / rect.height) * 320,
            });
          }}
          onMouseLeave={() => setMousePos({ x: 0, y: 0 })}>
          <defs>
            {ELEMENTS.map(e => (
              <radialGradient key={`glow-${e.id}`} id={`glow-${e.id}`}>
                <stop offset="0%" stopColor={e.color} stopOpacity={activeOrHovered === e.id ? 0.4 : 0.1} />
                <stop offset="100%" stopColor={e.color} stopOpacity={0} />
              </radialGradient>
            ))}
            <marker id="arrow-gen" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="rgba(248,250,252,0.12)" />
            </marker>
            <marker id="arrow-ctrl" markerWidth="5" markerHeight="3" refX="4" refY="1.5" orient="auto">
              <polygon points="0 0, 5 1.5, 0 3" fill="rgba(239,68,68,0.2)" />
            </marker>
          </defs>

          {/* Center glow */}
          <circle cx={cx} cy={cy} r={8} fill="rgba(248,250,252,0.03)" />
          <circle cx={cx} cy={cy} r={3} fill="rgba(248,250,252,0.06)" />

          {/* Generating cycle (Sheng) — outer smooth arcs */}
          {GENERATING.map(([from, to]) => {
            const f = getPos(elementMap[from].angle, outerR - nodeR - 4, cx, cy);
            const t = getPos(elementMap[to].angle, outerR - nodeR - 4, cx, cy);
            const dimmed = activeOrHovered && activeOrHovered !== from && activeOrHovered !== to;
            return (
              <path key={`gen-${from}-${to}`}
                d={arrowPath(f, t)}
                fill="none" stroke="rgba(248,250,252,0.08)" strokeWidth={1.5}
                strokeDasharray="4 3" markerEnd="url(#arrow-gen)"
                opacity={dimmed ? 0.15 : 0.6}
                style={{ transition: 'opacity 0.3s' }} />
            );
          })}

          {/* Controlling cycle (Ke) — inner star lines */}
          {CONTROLLING.map(([from, to]) => {
            const f = getPos(elementMap[from].angle, outerR * 0.55, cx, cy);
            const t = getPos(elementMap[to].angle, outerR * 0.55, cx, cy);
            const dimmed = activeOrHovered && activeOrHovered !== from && activeOrHovered !== to;
            return (
              <path key={`ctrl-${from}-${to}`}
                d={`M${f.x},${f.y} L${t.x},${t.y}`}
                fill="none" stroke="rgba(239,68,68,0.12)" strokeWidth={1}
                strokeDasharray="2 4" markerEnd="url(#arrow-ctrl)"
                opacity={dimmed ? 0.08 : 0.4}
                style={{ transition: 'opacity 0.3s' }} />
            );
          })}

          {/* Element nodes with Proximity Scaling */}
          {ELEMENTS.map(e => {
            const pos = getPos(e.angle, outerR, cx, cy);
            const isActive = activeOrHovered === e.id;
            const dimmed = activeOrHovered && !isActive;
            const plantCount = plantsByElement[e.id]?.length || 0;

            // Proximity scaling — nodes pulse when cursor approaches
            const dist = mousePos.x > 0 ? Math.sqrt((mousePos.x - pos.x) ** 2 + (mousePos.y - pos.y) ** 2) : 999;
            const proximity = Math.max(0, 1 - dist / 80); // 0 at 80px, 1 at center
            const proximityScale = 1 + proximity * 0.15; // up to 15% larger

            return (
              <g key={e.id}
                onClick={() => onElementClick(activeElement === e.id ? null : e.id)}
                onMouseEnter={() => setHoveredElement(e.id)}
                onMouseLeave={() => setHoveredElement(null)}
                style={{ cursor: 'pointer', transform: `scale(${proximityScale})`, transformOrigin: `${pos.x}px ${pos.y}px`, transition: 'transform 0.15s ease-out' }}
                data-testid={`wheel-node-${e.id.toLowerCase()}`}>
                {/* Proximity glow ring */}
                {proximity > 0.2 && (
                  <circle cx={pos.x} cy={pos.y} r={nodeR + 8 + proximity * 12}
                    fill="none" stroke={e.color} strokeWidth={0.5}
                    opacity={proximity * 0.25}
                    style={{ transition: 'all 0.15s' }} />
                )}
                {/* Glow */}
                <circle cx={pos.x} cy={pos.y} r={isActive ? 38 : 30 + proximity * 8}
                  fill={`url(#glow-${e.id})`}
                  style={{ transition: 'r 0.2s' }} />
                {/* Outer ring */}
                <circle cx={pos.x} cy={pos.y} r={nodeR}
                  fill={isActive ? `${e.color}20` : 'rgba(0,0,0,0)'}
                  stroke={e.color} strokeWidth={isActive ? 2 : 1 + proximity * 0.5}
                  opacity={dimmed ? 0.3 : 1}
                  style={{ transition: 'all 0.2s' }} />
                {/* Inner fill */}
                <circle cx={pos.x} cy={pos.y} r={nodeR - 4}
                  fill={isActive ? `${e.color}35` : `${e.color}${proximity > 0.3 ? '18' : '10'}`}
                  opacity={dimmed ? 0.3 : 1}
                  style={{ transition: 'all 0.2s' }} />
                {/* Element label */}
                <text x={pos.x} y={pos.y - 3} textAnchor="middle" fill={dimmed ? 'rgba(248,250,252,0.15)' : e.color}
                  fontSize={9} fontWeight={600} fontFamily="system-ui"
                  style={{ transition: 'fill 0.2s' }}>
                  {e.id}
                </text>
                {/* Plant count */}
                <text x={pos.x} y={pos.y + 9} textAnchor="middle"
                  fill={dimmed ? 'rgba(248,250,252,0.08)' : 'rgba(248,250,252,0.35)'}
                  fontSize={7} fontFamily="monospace"
                  style={{ transition: 'fill 0.2s' }}>
                  {plantCount} plant{plantCount !== 1 ? 's' : ''}
                </text>
                {/* Proximity frequency hint */}
                {proximity > 0.5 && !isActive && (
                  <text x={pos.x} y={pos.y + 19} textAnchor="middle"
                    fill={`${e.color}88`} fontSize={6} fontFamily="monospace"
                    style={{ transition: 'opacity 0.15s' }}>
                    {e.freq}Hz
                  </text>
                )}
                {/* ODE energy arc — real-time decay/growth indicator */}
                {energies && energies[e.id] != null && (() => {
                  const energy = Math.min(3, Math.max(0, energies[e.id]));
                  const normalized = energy / 3; // 0-1 range
                  const arcLen = normalized * 270; // degrees of arc
                  const r = nodeR + 3;
                  const startAng = -135;
                  const endAng = startAng + arcLen;
                  const sRad = (startAng * Math.PI) / 180;
                  const eRad = (endAng * Math.PI) / 180;
                  const x1 = pos.x + r * Math.cos(sRad);
                  const y1 = pos.y + r * Math.sin(sRad);
                  const x2 = pos.x + r * Math.cos(eRad);
                  const y2 = pos.y + r * Math.sin(eRad);
                  const largeArc = arcLen > 180 ? 1 : 0;
                  return (
                    <path
                      d={`M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2}`}
                      fill="none" stroke={e.color} strokeWidth={2}
                      opacity={dimmed ? 0.15 : 0.6}
                      strokeLinecap="round"
                      style={{ transition: 'all 0.5s ease-out', filter: `drop-shadow(0 0 3px ${e.color}40)` }}
                    />
                  );
                })()}
              </g>
            );
          })}

          {/* Cycle labels */}
          <text x={cx} y={cy - 32} textAnchor="middle" fill="rgba(248,250,252,0.08)" fontSize={7}
            fontFamily="system-ui" letterSpacing="0.1em">SHENG</text>
          <text x={cx} y={cy + 38} textAnchor="middle" fill="rgba(239,68,68,0.08)" fontSize={7}
            fontFamily="system-ui" letterSpacing="0.1em">KE</text>

          {/* Formula display in center */}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="rgba(248,250,252,0.12)" fontSize={6.5}
            fontFamily="monospace">Mass = B + E + N + M + R</text>
          <text x={cx} y={cy + 6} textAnchor="middle" fill="rgba(248,250,252,0.08)" fontSize={5.5}
            fontFamily="monospace">60 + elem + nat + mer + rar</text>
        </svg>
      </div>

      {/* Stability indicator from ODE engine */}
      {stability && (
        <div className="mx-4 mb-2 flex items-center justify-between px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
          <span className="text-[7px] uppercase tracking-[0.15em]" style={{ color: 'rgba(248,250,252,0.2)' }}>
            Energy State
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full"
              style={{
                background: stability === 'stable' ? '#22C55E' : stability === 'shifting' ? '#FBBF24' : '#EF4444',
                boxShadow: `0 0 4px ${stability === 'stable' ? '#22C55E' : stability === 'shifting' ? '#FBBF24' : '#EF4444'}40`,
              }} />
            <span className="text-[8px] font-mono capitalize"
              style={{ color: stability === 'stable' ? '#22C55E' : stability === 'shifting' ? '#FBBF24' : '#EF4444' }}>
              {stability}
            </span>
          </div>
        </div>
      )}

      {/* Info panel below wheel */}
      <AnimatePresence mode="wait">
        {activeData && (
          <motion.div key={activeData.id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="mx-3 mb-3 rounded-lg p-3"
            style={{ background: `${activeData.color}08`, border: `1px solid ${activeData.color}15` }}>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: activeData.color }} />
                <span className="text-xs font-medium" style={{ color: activeData.color }}>{activeData.id}</span>
                <span className="text-[8px]" style={{ color: 'rgba(248,250,252,0.25)' }}>{activeData.label}</span>
              </div>
              <span className="text-[10px] font-mono" style={{ color: activeData.color }}>
                {activeData.freq}Hz
              </span>
            </div>

            {/* Gravity Mass Breakdown */}
            <div className="mb-2">
              <p className="text-[7px] uppercase tracking-[0.15em] mb-1" style={{ color: 'rgba(248,250,252,0.15)' }}>
                Gravity Contribution
              </p>
              <div className="flex gap-1 items-center">
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(248,250,252,0.03)', color: 'rgba(248,250,252,0.3)' }}>
                  Base: 60
                </span>
                <span className="text-[8px]" style={{ color: 'rgba(248,250,252,0.1)' }}>+</span>
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: `${activeData.color}12`, color: activeData.color }}>
                  Element: +{activeData.weight}
                </span>
                <span className="text-[8px]" style={{ color: 'rgba(248,250,252,0.1)' }}>+</span>
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(248,250,252,0.03)', color: 'rgba(248,250,252,0.3)' }}>
                  Nature + Meridian + Rarity
                </span>
              </div>
            </div>

            {/* Cycle relationships */}
            <div className="flex gap-3 text-[8px]">
              <span style={{ color: 'rgba(248,250,252,0.2)' }}>
                Generates: <span style={{ color: 'rgba(248,250,252,0.4)' }}>
                  {GENERATING.find(([f]) => f === activeData.id)?.[1]}
                </span>
              </span>
              <span style={{ color: 'rgba(248,250,252,0.2)' }}>
                Controls: <span style={{ color: 'rgba(239,68,68,0.5)' }}>
                  {CONTROLLING.find(([f]) => f === activeData.id)?.[1]}
                </span>
              </span>
            </div>

            {/* Plants in this element */}
            {plantsByElement[activeData.id]?.length > 0 && (
              <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${activeData.color}10` }}>
                <div className="flex flex-wrap gap-1">
                  {plantsByElement[activeData.id].map(p => (
                    <span key={p.id} className="text-[8px] px-1.5 py-0.5 rounded"
                      style={{ background: `${activeData.color}08`, color: `${activeData.color}cc`, border: `1px solid ${activeData.color}15` }}>
                      {p.name} <span className="font-mono" style={{ opacity: 0.6 }}>m{p.gravity_mass}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Garden balance indicator */}
      {gardenSummary && gardenSummary.total_plants > 0 && !activeData && (
        <div className="mx-3 mb-3 rounded-lg p-2.5"
          style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
          <p className="text-[7px] uppercase tracking-[0.15em] mb-1.5" style={{ color: 'rgba(248,250,252,0.15)' }}>
            Garden Balance
          </p>
          <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
            {ELEMENTS.map(e => {
              const count = gardenSummary.element_distribution?.[e.id] || 0;
              const pct = gardenSummary.total_plants > 0 ? (count / gardenSummary.total_plants) * 100 : 0;
              return pct > 0 ? (
                <div key={e.id} style={{ width: `${pct}%`, background: e.color, minWidth: pct > 0 ? 4 : 0 }}
                  title={`${e.id}: ${count}`} />
              ) : null;
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[7px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
              Total Mass: {gardenSummary.total_gravity_mass}
            </span>
            <span className="text-[7px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
              {gardenSummary.garden_frequency}Hz
            </span>
          </div>
        </div>
      )}

      {/* Resonance Compatibility — Predictive Energy Meter */}
      <AnimatePresence>
        {resonanceData && activeElement && (
          <motion.div key="resonance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-3 mb-3 rounded-lg overflow-hidden" data-testid="resonance-meter"
            style={{ border: `1px solid ${resonanceData.color}15` }}>

            {/* Forecast bar */}
            <div className="px-3 py-2 flex items-center justify-between"
              style={{ background: `${resonanceData.color}08` }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{
                  background: resonanceData.totals?.forecast === 'surge' ? '#22C55E'
                    : resonanceData.totals?.forecast === 'favorable' ? '#2DD4BF'
                    : resonanceData.totals?.forecast === 'strained' ? '#FB923C'
                    : resonanceData.totals?.forecast === 'depleted' ? '#EF4444' : '#A3A3A3'
                }} />
                <p className="text-[8px] uppercase tracking-[0.15em] font-medium" style={{ color: 'rgba(248,250,252,0.25)' }}>
                  Energy Forecast
                </p>
              </div>
              <span className="text-[9px] font-medium capitalize" style={{
                color: resonanceData.totals?.forecast === 'surge' ? '#22C55E'
                  : resonanceData.totals?.forecast === 'favorable' ? '#2DD4BF'
                  : resonanceData.totals?.forecast === 'strained' ? '#FB923C'
                  : resonanceData.totals?.forecast === 'depleted' ? '#EF4444' : '#A3A3A3'
              }}>
                {resonanceData.totals?.forecast || 'balanced'}
              </span>
            </div>

            {/* Flow meter */}
            <div className="px-3 py-2" style={{ background: 'rgba(0,0,0,0)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[7px] font-mono" style={{ color: '#22C55E' }}>+{resonanceData.totals?.boost || 0}</span>
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${Math.min(100, Math.max(5, 50 + (resonanceData.totals?.net_flow || 0)))}%`,
                    background: (resonanceData.totals?.net_flow || 0) >= 0
                      ? `linear-gradient(90deg, ${resonanceData.color}40, ${resonanceData.color})`
                      : `linear-gradient(90deg, #EF444440, #EF4444)`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <span className="text-[7px] font-mono" style={{ color: '#EF4444' }}>-{resonanceData.totals?.conflict || 0}</span>
              </div>
              <p className="text-[7px] text-center font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>
                Net: {(resonanceData.totals?.net_flow || 0) >= 0 ? '+' : ''}{resonanceData.totals?.net_flow || 0}
              </p>
            </div>

            {/* Synergy list */}
            {resonanceData.synergies?.length > 0 && (
              <div className="px-3 py-2 space-y-1" style={{ background: 'rgba(0,0,0,0)' }}>
                {resonanceData.synergies.slice(0, 6).map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[7px]" style={{
                        color: s.synergy_type === 'generating' || s.synergy_type === 'generated_by' ? '#22C55E'
                          : s.synergy_type === 'harmony' ? resonanceData.color
                          : s.synergy_type === 'controlled' || s.synergy_type === 'controlling' ? '#EF4444'
                          : '#A3A3A3',
                      }}>
                        {s.synergy_type === 'generating' || s.synergy_type === 'generated_by' ? '↑'
                          : s.synergy_type === 'harmony' ? '~'
                          : s.synergy_type === 'controlled' || s.synergy_type === 'controlling' ? '↓'
                          : '·'}
                      </span>
                      <span className="text-[8px]" style={{ color: 'rgba(248,250,252,0.4)' }}>{s.plant_name}</span>
                      <span className="text-[6px]" style={{ color: 'rgba(248,250,252,0.15)' }}>{s.stage}</span>
                    </div>
                    <span className="text-[8px] font-mono" style={{
                      color: s.synergy_score > 0 ? '#22C55E' : s.synergy_score < 0 ? '#EF4444' : '#A3A3A3',
                    }}>
                      {s.synergy_score > 0 ? '+' : ''}{s.synergy_score}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Projection */}
            {resonanceData.projection && (
              <div className="px-3 py-2" style={{ background: `${resonanceData.color}05`, borderTop: `1px solid ${resonanceData.color}08` }}>
                <p className="text-[8px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.3)' }}>
                  {resonanceData.projection.recommendation}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
