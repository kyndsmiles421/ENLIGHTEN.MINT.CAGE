import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, Zap, Shield, MapPin, Coins, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL;

const CLUSTER_META = [
  { id: 'security', label: 'Security', icon: Shield, color: '#22C55E', range: [0, 6] },
  { id: 'location', label: 'Location', icon: MapPin, color: '#3B82F6', range: [6, 12] },
  { id: 'finance', label: 'Finance', icon: Coins, color: '#FBBF24', range: [12, 18] },
  { id: 'evolution', label: 'Evolution', icon: Flame, color: '#EF4444', range: [18, 24] },
];

function getIntensityColor(value, maxVal) {
  if (value <= 0) return 'rgba(255,255,255,0.01)';
  const t = Math.min(value / Math.max(maxVal, 1), 1);
  if (t < 0.3) return `rgba(99,102,241,${0.1 + t * 0.3})`;
  if (t < 0.6) return `rgba(192,132,252,${0.2 + t * 0.4})`;
  if (t < 0.85) return `rgba(251,191,36,${0.3 + t * 0.4})`;
  return `rgba(34,197,94,${0.5 + t * 0.4})`;
}

export default function HexagramGrid({ isOpen, onClose }) {
  const { token, authHeaders } = useAuth();
  const [h2Data, setH2Data] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const resolveH2 = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/quad-hex/resolve-h2`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setH2Data(data);
    } catch {}
    setLoading(false);
  }, [token, authHeaders]);

  useEffect(() => {
    if (isOpen && !h2Data) resolveH2();
  }, [isOpen, h2Data, resolveH2]);

  const maxCellValue = useMemo(() => {
    if (!h2Data?.h2_matrix) return 1;
    let max = 0;
    for (const row of h2Data.h2_matrix) {
      for (const cell of row) {
        if (cell > max) max = cell;
      }
    }
    return max;
  }, [h2Data]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(11,12,21,0.98)',
        border: '1px solid rgba(192,132,252,0.1)',
        maxHeight: '85vh',
      }}
      data-testid="hexagram-grid-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-2">
          <Grid3X3 size={14} style={{ color: '#C084FC' }} />
          <span className="text-xs font-medium" style={{ color: '#F8FAFC' }}>
            H² State Matrix
          </span>
          {h2Data && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{
              background: h2Data.determinant_positive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: h2Data.determinant_positive ? '#22C55E' : '#EF4444',
            }}>
              {h2Data.determinant_positive ? 'Additive' : 'Extractive'}
            </span>
          )}
        </div>
        <button onClick={resolveH2} className="px-2 py-1 rounded-lg text-[8px]" style={{
          background: 'rgba(192,132,252,0.08)', color: '#C084FC', cursor: 'pointer',
          border: '1px solid rgba(192,132,252,0.12)',
        }} data-testid="h2-refresh">
          {loading ? 'Resolving...' : 'Resolve'}
        </button>
      </div>

      {h2Data && (
        <div className="overflow-y-auto px-3 py-3" style={{ maxHeight: 'calc(85vh - 48px)' }}>
          {/* Phase + Alignment Summary */}
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="text-[10px] font-semibold" style={{ color: '#C084FC' }}>{h2Data.phase_mode}</div>
              <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.25)' }}>Phase</div>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="text-[10px] font-semibold" style={{ color: '#FBBF24' }}>{(h2Data.alignment_score * 100).toFixed(0)}%</div>
              <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.25)' }}>Alignment</div>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="text-[10px] font-semibold" style={{ color: '#818CF8' }}>{(h2Data.matrix_density * 100).toFixed(0)}%</div>
              <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.25)' }}>Density</div>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="text-[10px] font-semibold" style={{ color: h2Data.determinant_positive ? '#22C55E' : '#EF4444' }}>
                {h2Data.determinant_proxy > 0 ? '+' : ''}{h2Data.determinant_proxy.toFixed(3)}
              </div>
              <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.25)' }}>Determinant</div>
            </div>
          </div>

          {/* Hexagram Cluster Scores */}
          <div className="grid grid-cols-4 gap-1 mb-3">
            {CLUSTER_META.map(cluster => {
              const hexData = h2Data.hexagrams?.[cluster.id];
              const Icon = cluster.icon;
              return (
                <div key={cluster.id} className="rounded-lg p-2" style={{
                  background: `${cluster.color}06`,
                  border: `1px solid ${cluster.color}12`,
                }}>
                  <div className="flex items-center gap-1 mb-1">
                    <Icon size={9} style={{ color: cluster.color }} />
                    <span className="text-[7px] uppercase" style={{ color: `${cluster.color}80` }}>{cluster.label}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {hexData?.lines?.map((line, li) => (
                      <div key={li} className="flex-1 h-1.5 rounded-full" style={{
                        background: line === 1 ? cluster.color : 'rgba(255,255,255,0.05)',
                        opacity: line === 1 ? 0.8 : 0.3,
                      }} />
                    ))}
                  </div>
                  <div className="text-[8px] mt-1 text-right" style={{ color: cluster.color }}>
                    {((hexData?.score || 0) * 100).toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sacred Geometry: 24×24 Grid Visualization */}
          <div className="mb-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[8px] mb-1.5"
              style={{ color: 'rgba(248,250,252,0.3)', cursor: 'pointer' }}
              data-testid="h2-grid-toggle"
            >
              {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              <span>576-Cell Interference Grid {expanded ? '(collapse)' : '(expand)'}</span>
            </button>

            {expanded && h2Data.h2_matrix && (
              <div className="rounded-lg p-2 overflow-auto" style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.03)',
                maxHeight: '300px',
              }}>
                {/* Cluster labels along top */}
                <div className="flex mb-0.5" style={{ marginLeft: '20px' }}>
                  {CLUSTER_META.map(c => (
                    <div key={c.id} className="text-[5px] text-center" style={{ width: `${(6 / 24) * 100}%`, color: c.color }}>
                      {c.label.charAt(0)}
                    </div>
                  ))}
                </div>

                {/* The Matrix */}
                <div className="flex">
                  {/* Row labels */}
                  <div className="flex flex-col justify-between" style={{ width: '18px' }}>
                    {CLUSTER_META.map(c => (
                      <div key={c.id} className="text-[5px] flex items-center" style={{ height: `${(6 / 24) * 100}%`, color: c.color }}>
                        {c.label.charAt(0)}
                      </div>
                    ))}
                  </div>

                  {/* Grid cells */}
                  <div className="flex-1">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: '0.5px' }}>
                      {h2Data.h2_matrix.map((row, ri) =>
                        row.map((cell, ci) => (
                          <div
                            key={`${ri}-${ci}`}
                            style={{
                              width: '100%',
                              paddingBottom: '100%',
                              background: getIntensityColor(cell, maxCellValue),
                              borderRadius: '1px',
                            }}
                            title={`[${ri},${ci}] = ${cell}`}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cross-Cluster Resonance Map */}
          {h2Data.cross_cluster_resonance && (
            <div className="rounded-lg p-2.5 mb-3" style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div className="text-[8px] uppercase tracking-wider mb-2" style={{ color: 'rgba(248,250,252,0.25)' }}>
                Cross-Cluster Resonance
              </div>
              <div className="space-y-1">
                {Object.entries(h2Data.cross_cluster_resonance).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>{key}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full" style={{
                          width: `${Math.min(value * 100, 100)}%`,
                          background: value > 0.6 ? '#22C55E' : value > 0.3 ? '#FBBF24' : '#EF4444',
                        }} />
                      </div>
                      <span className="text-[8px] font-mono" style={{
                        color: value > 0.6 ? '#22C55E' : value > 0.3 ? '#FBBF24' : '#EF4444',
                      }}>{(value * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cross-Cluster Effects */}
          {h2Data.cross_cluster_effects && (
            <div className="rounded-lg p-2.5" style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div className="text-[8px] uppercase tracking-wider mb-2" style={{ color: 'rgba(248,250,252,0.25)' }}>
                Interference Effects
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.25)' }}>Transmute Modifier</div>
                  <div className="text-[10px] font-semibold" style={{ color: '#FBBF24' }}>
                    ×{h2Data.cross_cluster_effects.transmutation_modifier}
                  </div>
                </div>
                <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.25)' }}>Tax Modifier</div>
                  <div className="text-[10px] font-semibold" style={{ color: '#818CF8' }}>
                    ×{h2Data.cross_cluster_effects.tax_modifier}
                  </div>
                </div>
                <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.25)' }}>Variable Tax</div>
                  <div className="text-[10px] font-semibold" style={{ color: '#C084FC' }}>
                    {h2Data.variable_return_tax}%
                  </div>
                </div>
                <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.25)' }}>Economy</div>
                  <div className="text-[10px] font-semibold capitalize" style={{
                    color: h2Data.cross_cluster_effects.economy_health === 'stable' ? '#22C55E'
                      : h2Data.cross_cluster_effects.economy_health === 'cautious' ? '#FBBF24' : '#EF4444'
                  }}>
                    {h2Data.cross_cluster_effects.economy_health}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!h2Data && !loading && (
        <div className="px-4 py-8 text-center">
          <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
            Resolve your State Matrix to see the 576-intersection interference grid
          </p>
        </div>
      )}
    </motion.div>
  );
}
