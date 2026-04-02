import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Compass, Ruler, Triangle, Box, Hexagon, Diamond, Waves, Calculator, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PHI = 1.6180339887;

// Platonic Solid SVG mini-renderers
function SolidIcon({ id, color, size = 40 }) {
  const s = size;
  const c = s / 2;
  if (id === 'tetrahedron') return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <polygon points={`${c},${s*0.1} ${s*0.15},${s*0.85} ${s*0.85},${s*0.85}`} fill="none" stroke={color} strokeWidth="1.5" />
      <line x1={c} y1={s*0.1} x2={c} y2={s*0.85} stroke={color} strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
  if (id === 'hexahedron') return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <rect x={s*0.2} y={s*0.2} width={s*0.6} height={s*0.6} fill="none" stroke={color} strokeWidth="1.5" />
      <line x1={s*0.2} y1={s*0.2} x2={s*0.35} y2={s*0.1} stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1={s*0.8} y1={s*0.2} x2={s*0.95} y2={s*0.1} stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1={s*0.35} y1={s*0.1} x2={s*0.95} y2={s*0.1} stroke={color} strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
  if (id === 'octahedron') return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <polygon points={`${c},${s*0.1} ${s*0.85},${c} ${c},${s*0.9} ${s*0.15},${c}`} fill="none" stroke={color} strokeWidth="1.5" />
      <line x1={s*0.15} y1={c} x2={s*0.85} y2={c} stroke={color} strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
  if (id === 'dodecahedron') return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {[0,1,2,3,4].map(i => {
        const a = (i * 72 - 90) * Math.PI / 180;
        const na = ((i+1) * 72 - 90) * Math.PI / 180;
        return <line key={i} x1={c + c*0.7*Math.cos(a)} y1={c + c*0.7*Math.sin(a)} x2={c + c*0.7*Math.cos(na)} y2={c + c*0.7*Math.sin(na)} stroke={color} strokeWidth="1.5" />;
      })}
      {[0,1,2,3,4].map(i => {
        const a = (i * 72 - 90) * Math.PI / 180;
        return <circle key={`d${i}`} cx={c + c*0.7*Math.cos(a)} cy={c + c*0.7*Math.sin(a)} r="2" fill={color} />;
      })}
    </svg>
  );
  if (id === 'icosahedron') return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {[0,1,2,3,4,5].map(i => {
        const a = (i * 60 - 90) * Math.PI / 180;
        const na = ((i+1) * 60 - 90) * Math.PI / 180;
        return <line key={i} x1={c + c*0.7*Math.cos(a)} y1={c + c*0.7*Math.sin(a)} x2={c + c*0.7*Math.cos(na)} y2={c + c*0.7*Math.sin(na)} stroke={color} strokeWidth="1.5" />;
      })}
      <circle cx={c} cy={c} r={c*0.3} fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
  return <Box size={size * 0.5} style={{ color }} />;
}

// Golden Ratio visual
function GoldenSpiralSVG({ dimension }) {
  const w = 260, h = 160;
  const major = dimension / PHI;
  const minor = dimension - major;
  const scale = Math.min(w / dimension, h / (dimension / PHI)) * 0.8;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 160 }}>
      {/* Major rectangle */}
      <rect x={10} y={10} width={major * scale} height={major * scale / PHI} fill="none" stroke="#FBBF24" strokeWidth="1" opacity="0.6" />
      {/* Minor rectangle */}
      <rect x={10 + major * scale} y={10} width={minor * scale} height={major * scale / PHI} fill="none" stroke="#A78BFA" strokeWidth="1" opacity="0.6" />
      {/* Division line */}
      <line x1={10 + major * scale} y1={10} x2={10 + major * scale} y2={10 + major * scale / PHI} stroke="#FBBF24" strokeWidth="0.5" strokeDasharray="3,3" />
      {/* Labels */}
      <text x={10 + major * scale / 2} y={h - 5} fill="#FBBF24" fontSize="8" textAnchor="middle">{major.toFixed(2)}</text>
      <text x={10 + major * scale + minor * scale / 2} y={h - 5} fill="#A78BFA" fontSize="8" textAnchor="middle">{minor.toFixed(2)}</text>
    </svg>
  );
}

// Harmonic wave visualizer
function HarmonicWaveSVG({ harmonic, nodes, antinodes, length }) {
  const w = 300, h = 80;
  const points = [];
  for (let i = 0; i <= 200; i++) {
    const x = (i / 200) * w;
    const y = h / 2 + Math.sin((i / 200) * Math.PI * harmonic) * (h / 2 - 8);
    points.push(`${x},${y}`);
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 80 }}>
      <line x1={0} y1={h/2} x2={w} y2={h/2} stroke="rgba(248,250,252,0.08)" strokeWidth="0.5" />
      <polyline points={points.join(' ')} fill="none" stroke="#3B82F6" strokeWidth="1.5" opacity="0.7" />
      {(nodes || []).map((n, i) => (
        <circle key={`n${i}`} cx={(n / length) * w} cy={h/2} r="3" fill="#EF4444" opacity="0.8" />
      ))}
      {(antinodes || []).map((a, i) => (
        <circle key={`a${i}`} cx={(a / length) * w} cy={h/2 - (h/2 - 8)} r="3" fill="#22C55E" opacity="0.8" />
      ))}
    </svg>
  );
}

export default function Workshop() {
  const { authHeaders } = useAuth();
  const [tab, setTab] = useState('solids');
  const [solids, setSolids] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedSolid, setSelectedSolid] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Golden ratio
  const [grDimension, setGrDimension] = useState(100);
  const [grResult, setGrResult] = useState(null);

  // Harmonic
  const [harmonicNum, setHarmonicNum] = useState(1);
  const [stringLength, setStringLength] = useState(1.0);
  const [harmonicResult, setHarmonicResult] = useState(null);

  // Inverse square
  const [isqPower, setIsqPower] = useState(1.0);
  const [isqDistance, setIsqDistance] = useState(2.0);
  const [isqResult, setIsqResult] = useState(null);

  useEffect(() => {
    if (!authHeaders) return;
    axios.get(`${API}/workshop/platonic-solids`, { headers: authHeaders })
      .then(r => { setSolids(r.data.solids); setSelectedSolid(r.data.solids[0]); })
      .catch(() => {});
    axios.get(`${API}/workshop/materials`, { headers: authHeaders })
      .then(r => { setMaterials(r.data.materials); setSelectedMaterial(r.data.materials[0]); })
      .catch(() => {});
  }, [authHeaders]);

  const calcGoldenRatio = useCallback(() => {
    if (!authHeaders || grDimension <= 0) return;
    axios.post(`${API}/workshop/golden-ratio`, { dimension: grDimension }, { headers: authHeaders })
      .then(r => setGrResult(r.data))
      .catch(() => {});
  }, [authHeaders, grDimension]);

  const calcHarmonics = useCallback(() => {
    if (!authHeaders) return;
    const speed = selectedMaterial?.speed_of_sound || 343;
    axios.post(`${API}/workshop/harmonic-nodes`, { length: stringLength, harmonic: harmonicNum, speed_of_sound: speed }, { headers: authHeaders })
      .then(r => setHarmonicResult(r.data))
      .catch(() => {});
  }, [authHeaders, stringLength, harmonicNum, selectedMaterial]);

  const calcInverseSquare = useCallback(() => {
    if (!authHeaders) return;
    axios.post(`${API}/workshop/inverse-square`, { power: isqPower, distance: isqDistance }, { headers: authHeaders })
      .then(r => setIsqResult(r.data))
      .catch(() => {});
  }, [authHeaders, isqPower, isqDistance]);

  useEffect(() => { calcGoldenRatio(); }, [calcGoldenRatio]);
  useEffect(() => { calcHarmonics(); }, [calcHarmonics]);
  useEffect(() => { calcInverseSquare(); }, [calcInverseSquare]);

  const TABS = [
    { id: 'solids', label: 'Sacred Geometry', icon: Triangle },
    { id: 'golden', label: 'Golden Ratio', icon: Ruler },
    { id: 'harmonics', label: 'Resonance', icon: Waves },
    { id: 'materials', label: 'Materials', icon: Diamond },
  ];

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8" data-testid="workshop-page">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            The Architect's Workshop
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Structural Physics, Sacred Architecture & Resonance Mechanics
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: tab === t.id ? 'rgba(251,191,36,0.08)' : 'rgba(248,250,252,0.03)',
                color: tab === t.id ? '#FBBF24' : 'var(--text-muted)',
                border: tab === t.id ? '1px solid rgba(251,191,36,0.15)' : '1px solid transparent',
              }}
              data-testid={`workshop-tab-${t.id}`}>
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </div>

        {/* Sacred Geometry / Platonic Solids */}
        {tab === 'solids' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {solids.map(s => (
                <button key={s.id} onClick={() => setSelectedSolid(s)}
                  className="glass-card p-3 rounded-xl text-center transition-all"
                  style={{
                    border: selectedSolid?.id === s.id ? `2px solid ${s.color}` : '1px solid rgba(248,250,252,0.06)',
                    background: selectedSolid?.id === s.id ? `${s.color}08` : undefined,
                  }}
                  data-testid={`solid-${s.id}`}>
                  <SolidIcon id={s.id} color={s.color} size={36} />
                  <p className="text-[9px] font-medium mt-1" style={{ color: s.color }}>{s.name.split(' ')[0]}</p>
                  <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{s.element}</p>
                </button>
              ))}
            </div>

            {selectedSolid && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-card p-5 rounded-2xl" style={{ border: `1px solid ${selectedSolid.color}15` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <SolidIcon id={selectedSolid.id} color={selectedSolid.color} size={48} />
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                        {selectedSolid.name}
                      </h3>
                      <p className="text-[9px]" style={{ color: selectedSolid.color }}>Element: {selectedSolid.element} | {selectedSolid.frequency_hz}Hz</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: 'Faces', val: selectedSolid.faces, sub: selectedSolid.face_shape },
                      { label: 'Edges', val: selectedSolid.edges },
                      { label: 'Vertices', val: selectedSolid.vertices },
                    ].map(m => (
                      <div key={m.label} className="px-2 py-1.5 rounded-lg text-center" style={{ background: 'rgba(248,250,252,0.03)' }}>
                        <p className="text-lg font-mono" style={{ color: selectedSolid.color }}>{m.val}</p>
                        <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{m.label}{m.sub ? ` (${m.sub})` : ''}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                    <strong style={{ color: '#FBBF24' }}>Euler's Formula:</strong> V - E + F = {selectedSolid.vertices} - {selectedSolid.edges} + {selectedSolid.faces} = 2
                  </p>
                </div>

                <div className="glass-card p-5 rounded-2xl space-y-3" style={{ border: '1px solid rgba(248,250,252,0.06)' }}>
                  <h4 className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Structural Analysis
                  </h4>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {selectedSolid.structural_note}
                  </p>
                  <div className="pt-2 border-t" style={{ borderColor: 'rgba(248,250,252,0.06)' }}>
                    <p className="text-[8px] uppercase tracking-widest mb-1" style={{ color: '#FBBF24' }}>Construction Applications</p>
                    <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {selectedSolid.construction_use}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Golden Ratio Calculator */}
        {tab === 'golden' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="glass-card p-5 rounded-2xl space-y-4" style={{ border: '1px solid rgba(251,191,36,0.1)' }}>
                <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                  Golden Ratio Calculator
                </h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Enter any dimension to find its divine proportions (φ = 1.618...)
                </p>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-[8px] uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>Dimension</label>
                    <input type="number" value={grDimension} onChange={e => setGrDimension(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
                      data-testid="golden-ratio-input" />
                  </div>
                  <button onClick={calcGoldenRatio}
                    className="px-4 py-2 rounded-lg text-[10px] font-medium"
                    style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.15)' }}
                    data-testid="golden-ratio-calc">
                    <Calculator size={12} />
                  </button>
                </div>

                {grResult && (
                  <div className="space-y-2" data-testid="golden-ratio-result">
                    <GoldenSpiralSVG dimension={grDimension} />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.05)' }}>
                        <p className="text-[7px] uppercase" style={{ color: 'var(--text-muted)' }}>Major (a)</p>
                        <p className="text-sm font-mono" style={{ color: '#FBBF24' }}>{grResult.golden_sections[0].value}</p>
                      </div>
                      <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(167,139,250,0.05)' }}>
                        <p className="text-[7px] uppercase" style={{ color: 'var(--text-muted)' }}>Minor (b)</p>
                        <p className="text-sm font-mono" style={{ color: '#A78BFA' }}>{grResult.golden_sections[1].value}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-[8px] uppercase tracking-widest mb-1.5" style={{ color: '#FBBF24' }}>Nested Divisions</p>
                      <div className="flex gap-1.5">
                        {grResult.nested.map((n, i) => (
                          <div key={i} className="flex-1 px-1.5 py-1 rounded text-center" style={{ background: 'rgba(248,250,252,0.03)' }}>
                            <p className="text-[8px] font-mono" style={{ color: 'var(--text-primary)' }}>{n.value}</p>
                            <p className="text-[6px]" style={{ color: 'var(--text-muted)' }}>φ^{n.depth}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="glass-card p-5 rounded-2xl space-y-3" style={{ border: '1px solid rgba(248,250,252,0.06)' }}>
                <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                  The Divine Proportion
                </h4>
                <div className="text-center py-4">
                  <p className="text-4xl font-light" style={{ color: '#FBBF24', fontFamily: 'Cormorant Garamond, serif' }}>
                    φ = 1.618...
                  </p>
                  <p className="text-[9px] mt-2" style={{ color: 'var(--text-muted)' }}>
                    (1 + √5) / 2
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { where: 'DNA Helix', detail: '34Å long, 21Å wide — 34/21 = 1.619' },
                    { where: 'Nautilus Shell', detail: 'Each chamber is φ times the previous' },
                    { where: 'Parthenon', detail: 'Width:Height ratio = φ' },
                    { where: 'Human Body', detail: 'Navel divides height at φ' },
                  ].map(ex => (
                    <div key={ex.where} className="flex items-start gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(248,250,252,0.03)' }}>
                      <ArrowRight size={8} className="mt-0.5 shrink-0" style={{ color: '#FBBF24' }} />
                      <div>
                        <p className="text-[9px] font-medium" style={{ color: 'var(--text-primary)' }}>{ex.where}</p>
                        <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{ex.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Resonance Mechanics */}
        {tab === 'harmonics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Harmonic Oscillation */}
              <div className="glass-card p-5 rounded-2xl space-y-3" style={{ border: '1px solid rgba(59,130,246,0.1)' }}>
                <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                  Harmonic Oscillation
                </h3>
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  Nodes (red) = zero amplitude. Antinodes (green) = max amplitude.
                </p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[7px] uppercase block mb-1" style={{ color: 'var(--text-muted)' }}>Harmonic</label>
                    <input type="range" min={1} max={8} value={harmonicNum} onChange={e => setHarmonicNum(parseInt(e.target.value))}
                      className="w-full" data-testid="harmonic-slider" />
                    <p className="text-[9px] text-center font-mono" style={{ color: '#3B82F6' }}>n = {harmonicNum}</p>
                  </div>
                  <div className="flex-1">
                    <label className="text-[7px] uppercase block mb-1" style={{ color: 'var(--text-muted)' }}>Length (m)</label>
                    <input type="number" step="0.1" min="0.1" max="10" value={stringLength}
                      onChange={e => setStringLength(parseFloat(e.target.value) || 1)}
                      className="w-full px-2 py-1 rounded text-[10px]"
                      style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
                      data-testid="string-length-input" />
                  </div>
                </div>

                {harmonicResult && (
                  <div data-testid="harmonic-result">
                    <HarmonicWaveSVG harmonic={harmonicNum} nodes={harmonicResult.nodes} antinodes={harmonicResult.antinodes} length={stringLength} />
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="px-2 py-1.5 rounded-lg text-center" style={{ background: 'rgba(248,250,252,0.03)' }}>
                        <p className="text-xs font-mono" style={{ color: '#3B82F6' }}>{harmonicResult.frequency}Hz</p>
                        <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>Frequency</p>
                      </div>
                      <div className="px-2 py-1.5 rounded-lg text-center" style={{ background: 'rgba(248,250,252,0.03)' }}>
                        <p className="text-xs font-mono" style={{ color: '#EF4444' }}>{harmonicResult.node_count}</p>
                        <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>Nodes</p>
                      </div>
                      <div className="px-2 py-1.5 rounded-lg text-center" style={{ background: 'rgba(248,250,252,0.03)' }}>
                        <p className="text-xs font-mono" style={{ color: '#22C55E' }}>{harmonicResult.antinode_count}</p>
                        <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>Antinodes</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Inverse Square Law */}
              <div className="glass-card p-5 rounded-2xl space-y-3" style={{ border: '1px solid rgba(239,68,68,0.1)' }}>
                <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                  Inverse Square Law
                </h3>
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  Sound intensity falls as 1/r². Double the distance = quarter the intensity.
                </p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[7px] uppercase block mb-1" style={{ color: 'var(--text-muted)' }}>Power (W)</label>
                    <input type="number" step="0.1" min="0.01" value={isqPower} onChange={e => setIsqPower(parseFloat(e.target.value) || 1)}
                      className="w-full px-2 py-1 rounded text-[10px]"
                      style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
                      data-testid="isq-power-input" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[7px] uppercase block mb-1" style={{ color: 'var(--text-muted)' }}>Distance (m)</label>
                    <input type="number" step="0.5" min="0.1" value={isqDistance} onChange={e => setIsqDistance(parseFloat(e.target.value) || 1)}
                      className="w-full px-2 py-1 rounded text-[10px]"
                      style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
                      data-testid="isq-distance-input" />
                  </div>
                </div>

                {isqResult && (
                  <div data-testid="isq-result">
                    <div className="px-3 py-2 rounded-lg mb-2" style={{ background: 'rgba(248,250,252,0.03)' }}>
                      <p className="text-lg font-mono" style={{ color: '#EF4444' }}>{isqResult.db_spl} dB SPL</p>
                      <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>at {isqResult.distance_m}m from {isqResult.source_power_watts}W source</p>
                    </div>
                    <div className="space-y-0.5">
                      {(isqResult.falloff_curve || []).slice(0, 6).map((pt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[7px] w-8 text-right font-mono" style={{ color: 'var(--text-muted)' }}>{pt.distance}m</span>
                          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.04)' }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.max(2, Math.min(100, (pt.db / (isqResult.falloff_curve[0]?.db || 1)) * 100))}%`, background: '#EF4444' }} />
                          </div>
                          <span className="text-[7px] w-10 font-mono" style={{ color: 'var(--text-muted)' }}>{pt.db}dB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Materials Library */}
        {tab === 'materials' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {materials.map(m => (
                <button key={m.id} onClick={() => setSelectedMaterial(m)}
                  className="glass-card p-3 rounded-xl text-left transition-all"
                  style={{
                    border: selectedMaterial?.id === m.id ? `2px solid ${m.color}` : '1px solid rgba(248,250,252,0.06)',
                    background: selectedMaterial?.id === m.id ? `${m.color}08` : undefined,
                  }}
                  data-testid={`material-${m.id}`}>
                  <p className="text-xs font-medium" style={{ color: m.color }}>{m.name}</p>
                  <p className="text-[7px] font-mono" style={{ color: 'var(--text-muted)' }}>{m.speed_of_sound} m/s</p>
                </button>
              ))}
            </div>

            {selectedMaterial && (
              <div className="glass-card p-5 rounded-2xl" style={{ border: `1px solid ${selectedMaterial.color}15` }}>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                  {selectedMaterial.name} — Resonance Profile
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.03)' }}>
                    <p className="text-[7px] uppercase" style={{ color: 'var(--text-muted)' }}>Density</p>
                    <p className="text-sm font-mono" style={{ color: selectedMaterial.color }}>{selectedMaterial.density} kg/m³</p>
                  </div>
                  <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.03)' }}>
                    <p className="text-[7px] uppercase" style={{ color: 'var(--text-muted)' }}>Speed of Sound</p>
                    <p className="text-sm font-mono" style={{ color: selectedMaterial.color }}>{selectedMaterial.speed_of_sound} m/s</p>
                  </div>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {selectedMaterial.resonance_note}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
