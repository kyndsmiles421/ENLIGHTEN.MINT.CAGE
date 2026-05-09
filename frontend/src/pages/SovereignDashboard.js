import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Coins, Lock, Unlock, Eye, EyeOff, Download, AlertTriangle, TrendingUp, Users, FileText, Snowflake, ShieldAlert, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL;

export default function SovereignDashboard() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('sovereign_dash', 8); }, []);

  const navigate = useNavigate();
  const { token, authHeaders } = useAuth();
  const [config, setConfig] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [mirror, setMirror] = useState({ entries: [], total: 0 });
  const [escrow, setEscrow] = useState([]);
  const [skeleton, setSkeleton] = useState(null);
  const [trialAnalytics, setTrialAnalytics] = useState(null);
  const [sentinelStats, setSentinelStats] = useState(null);
  const [sentinelLog, setSentinelLog] = useState({ entries: [], total: 0 });
  const [sentinelMutes, setSentinelMutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeSliderValue, setFeeSliderValue] = useState(5);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [cfgRes, dashRes, mirrorRes, escrowRes, trialRes, sentStatsRes, sentLogRes, sentMutesRes] = await Promise.all([
        fetch(`${API}/api/treasury/sovereign/config`, { headers: authHeaders }),
        fetch(`${API}/api/treasury/sovereign/dashboard`, { headers: authHeaders }),
        fetch(`${API}/api/treasury/sovereign/mirror?limit=20`, { headers: authHeaders }),
        fetch(`${API}/api/treasury/sovereign/escrow?limit=20`, { headers: authHeaders }),
        fetch(`${API}/api/treasury/sovereign/trial-analytics`, { headers: authHeaders }),
        fetch(`${API}/api/sentinel/stats`, { headers: authHeaders }),
        fetch(`${API}/api/sentinel/log?limit=20`, { headers: authHeaders }),
        fetch(`${API}/api/sentinel/mutes`, { headers: authHeaders }),
      ]);
      const [cfg, dash, mir, esc, trial, sStats, sLog, sMutes] = await Promise.all([
        cfgRes.json(), dashRes.json(), mirrorRes.json(), escrowRes.json(), trialRes.json(),
        sentStatsRes.ok ? sentStatsRes.json() : null,
        sentLogRes.ok ? sentLogRes.json() : { entries: [], total: 0 },
        sentMutesRes.ok ? sentMutesRes.json() : [],
      ]);
      setConfig(cfg);
      setDashboard(dash);
      setMirror(mir);
      setEscrow(esc);
      setTrialAnalytics(trial);
      setSentinelStats(sStats);
      setSentinelLog(sLog);
      setSentinelMutes(Array.isArray(sMutes) ? sMutes : []);
      setFeeSliderValue(cfg.fee_percent || 5);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    setLoading(false);
  }, [token, authHeaders]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateConfig = async (updates) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/treasury/sovereign/config`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      setConfig(data);
      if (data.fee_percent != null) setFeeSliderValue(data.fee_percent);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    setSaving(false);
  };

  const fetchSkeleton = async () => {
    try {
      const res = await fetch(`${API}/api/treasury/skeleton/export`, { headers: authHeaders });
      const data = await res.json();
      setSkeleton(data);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  };

  const downloadSkeleton = () => {
    if (!skeleton) return;
    const blob = new Blob([JSON.stringify(skeleton, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usi-skeleton-v1.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>Authentication required</p>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'controls', label: 'Controls', icon: Shield },
    { id: 'sentinel', label: 'Sentinel', icon: ShieldAlert },
    { id: 'mirror', label: 'Mirror', icon: Eye },
    { id: 'escrow', label: 'Escrow', icon: Lock },
    { id: 'skeleton', label: 'Export', icon: Download },
  ];

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(180deg, #060610 0%, #0a0a18 100%)' }}>
      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <ArrowLeft size={16} style={{ color: 'rgba(255,255,255,0.75)' }} />
          </button>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: '#F8FAFC' }}>Sovereign Dashboard</h1>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>Treasury Control & Framework Administration</p>
          </div>
          {config && (
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: config.is_live ? '#22C55E' : '#EF4444' }} />
              <span className="text-[9px]" style={{ color: config.is_live ? '#22C55E' : '#EF4444' }}>
                {config.is_live ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto" data-testid="sovereign-tabs">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); if (t.id === 'skeleton' && !skeleton) fetchSkeleton(); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition-all"
                style={{
                  background: active ? 'rgba(192,132,252,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.04)'}`,
                  color: active ? '#C084FC' : 'rgba(255,255,255,0.65)',
                  fontSize: '11px',
                }}
                data-testid={`sovereign-tab-${t.id}`}
              >
                <Icon size={12} /> {t.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ═══ OVERVIEW ═══ */}
            {activeTab === 'overview' && dashboard && (
              <div className="space-y-4" data-testid="sovereign-overview">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: 'Treasury', value: dashboard.treasury_balance, icon: Coins, color: '#FBBF24' },
                    { label: 'Fees Collected', value: dashboard.total_fees_collected, icon: TrendingUp, color: '#22C55E' },
                    { label: 'Wallets', value: dashboard.total_wallets, icon: Users, color: '#3B82F6' },
                    { label: 'Escrow', value: dashboard.total_escrow_contracts, icon: Lock, color: '#C084FC' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <s.icon size={11} style={{ color: `${s.color}80` }} />
                        <span className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.label}</span>
                      </div>
                      <div className="text-lg font-semibold" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Fee + Status */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.65)' }}>Platform Status</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-sm font-semibold" style={{ color: '#FBBF24' }}>{dashboard.fee_percent}%</div>
                      <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Fee Rate</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: dashboard.mirror_active ? '#22C55E' : '#EF4444' }}>
                        {dashboard.mirror_active ? 'ON' : 'OFF'}
                      </div>
                      <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Mirror</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: dashboard.frozen_transactions ? '#EF4444' : '#22C55E' }}>
                        {dashboard.frozen_transactions ? 'FROZEN' : 'ACTIVE'}
                      </div>
                      <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Trades</div>
                    </div>
                  </div>
                </div>

                {/* Recent Fees */}
                {dashboard.recent_fees?.length > 0 && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <h3 className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Recent Fees</h3>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {dashboard.recent_fees.map((f, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] py-1 px-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span style={{ color: 'rgba(255,255,255,0.7)' }}>{f.description}</span>
                          <span style={{ color: '#FBBF24' }}>+{f.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ CONTROLS ═══ */}
            {activeTab === 'controls' && config && (
              <div className="space-y-4" data-testid="sovereign-controls">
                {/* Fee Slider */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium" style={{ color: '#F8FAFC' }}>Platform Fee</span>
                    <span className="text-sm font-semibold" style={{ color: '#FBBF24' }} data-testid="fee-display">{feeSliderValue}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    step={0.5}
                    value={feeSliderValue}
                    onChange={e => setFeeSliderValue(parseFloat(e.target.value))}
                    onMouseUp={() => updateConfig({ fee_percent: feeSliderValue })}
                    onTouchEnd={() => updateConfig({ fee_percent: feeSliderValue })}
                    className="w-full accent-purple-500"
                    style={{ height: 4 }}
                    data-testid="fee-slider"
                  />
                  <div className="flex justify-between text-[8px] mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span>0%</span>
                    <span>5% default</span>
                    <span>25%</span>
                  </div>
                </div>

                {/* Toggle Controls */}
                <div className="space-y-2">
                  {[
                    { key: 'is_live', label: 'System Live', desc: 'Platform operational status', icon: config.is_live ? Unlock : Lock, color: config.is_live ? '#22C55E' : '#EF4444', active: config.is_live },
                    { key: 'mirror_active', label: 'Mirror Hook', desc: 'Copy all blueprints to sovereign ledger', icon: config.mirror_active ? Eye : EyeOff, color: config.mirror_active ? '#3B82F6' : '#6B7280', active: config.mirror_active },
                    { key: 'frozen_transactions', label: 'Freeze All Trades', desc: 'Emergency kill-switch for all transactions', icon: Snowflake, color: config.frozen_transactions ? '#EF4444' : '#6B7280', active: config.frozen_transactions, danger: true },
                  ].map(toggle => (
                    <div key={toggle.key} className="flex items-center justify-between rounded-xl p-3"
                      style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${toggle.danger && toggle.active ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)'}` }}>
                      <div className="flex items-center gap-2.5">
                        <toggle.icon size={14} style={{ color: toggle.color }} />
                        <div>
                          <div className="text-[11px] font-medium" style={{ color: '#F8FAFC' }}>{toggle.label}</div>
                          <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{toggle.desc}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => updateConfig({ [toggle.key]: !toggle.active })}
                        disabled={saving}
                        className="relative w-10 h-5 rounded-full transition-all"
                        style={{
                          background: toggle.active ? `${toggle.color}25` : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${toggle.active ? `${toggle.color}40` : 'rgba(255,255,255,0.08)'}`,
                          cursor: 'pointer',
                        }}
                        data-testid={`toggle-${toggle.key}`}
                      >
                        <motion.div
                          className="absolute top-0.5 w-4 h-4 rounded-full"
                          animate={{ left: toggle.active ? 20 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          style={{ background: toggle.active ? toggle.color : 'rgba(255,255,255,0.6)' }}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {config.frozen_transactions && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                    <AlertTriangle size={12} style={{ color: '#EF4444' }} />
                    <span className="text-[10px]" style={{ color: '#EF4444' }}>All marketplace transactions are frozen</span>
                  </div>
                )}

                {/* Trial Analytics */}
                {trialAnalytics && (
                  <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium" style={{ color: '#F8FAFC' }}>Trial Conversion</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E' }} data-testid="trial-conversion-rate">
                        {trialAnalytics.conversion_rate}% conversion
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: 'Views', value: trialAnalytics.total_views, color: '#3B82F6' },
                        { label: 'Dismissed', value: trialAnalytics.total_dismissals, color: '#6B7280' },
                        { label: 'Upgrades', value: trialAnalytics.total_upgrade_clicks, color: '#22C55E' },
                      ].map(s => (
                        <div key={s.label} className="text-center rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <div className="text-sm font-semibold" style={{ color: s.color }}>{s.value}</div>
                          <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={async () => {
                        if (!window.confirm('Reset trial flag for all users? They will see the trial modal once more.')) return;
                        setSaving(true);
                        try {
                          await fetch(`${API}/api/treasury/sovereign/reset-trial`, {
                            method: 'POST',
                            headers: authHeaders,
                          });
                          fetchAll();
                        } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
                        setSaving(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] transition-all"
                      style={{
                        background: 'rgba(239,68,68,0.06)',
                        border: '1px solid rgba(239,68,68,0.12)',
                        color: '#EF4444',
                        cursor: 'pointer',
                      }}
                      data-testid="reset-trial-btn"
                    >
                      <AlertTriangle size={10} /> Reset Trial for All Users
                    </button>
                  </div>
                )}
              </div>
            )}


            {/* ═══ SENTINEL ═══ */}
            {activeTab === 'sentinel' && (
              <div className="space-y-4" data-testid="sovereign-sentinel">
                {/* Sentinel Stats */}
                {sentinelStats && (
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { label: 'Intercepted', value: sentinelStats.total_intercepted, color: '#FBBF24' },
                      { label: 'Blocked', value: sentinelStats.total_blocked, color: '#EF4444' },
                      { label: 'Shadow Mutes', value: sentinelStats.active_shadow_mutes, color: '#6B7280' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="text-lg font-semibold" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Category Breakdown */}
                {sentinelStats?.categories && Object.keys(sentinelStats.categories).length > 0 && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <h3 className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Violation Categories</h3>
                    <div className="space-y-1.5">
                      {Object.entries(sentinelStats.categories).map(([cat, count]) => (
                        <div key={cat} className="flex items-center justify-between px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="text-[10px] capitalize" style={{ color: 'rgba(255,255,255,0.75)' }}>{cat.replace('_', ' ')}</span>
                          <span className="text-[10px] font-semibold" style={{ color: '#EF4444' }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shadow-Muted Users */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <h3 className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Shadow-Muted Users ({sentinelMutes.length})</h3>
                  {sentinelMutes.length === 0 ? (
                    <p className="text-[10px] text-center py-3" style={{ color: 'rgba(255,255,255,0.6)' }}>No muted users</p>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {sentinelMutes.map((m, i) => (
                        <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <div>
                            <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.75)' }}>{m.user_id}</div>
                            <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{m.reason}</div>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await fetch(`${API}/api/sentinel/unmute/${m.user_id}`, {
                                  method: 'POST',
                                  headers: authHeaders,
                                });
                                fetchAll();
                              } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
                            }}
                            className="px-2 py-1 rounded text-[8px]"
                            style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E', cursor: 'pointer', border: '1px solid rgba(34,197,94,0.15)' }}
                            data-testid={`unmute-${m.user_id}`}
                          >
                            Unmute
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Violation Log */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <h3 className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    Violation Log ({sentinelLog.total} total)
                  </h3>
                  {sentinelLog.entries?.length === 0 ? (
                    <p className="text-[10px] text-center py-3" style={{ color: 'rgba(255,255,255,0.6)' }}>No violations logged</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {sentinelLog.entries?.map((entry, i) => (
                        <div key={i} className="rounded-lg px-2 py-2" style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.06)' }}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[9px] font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{entry.user_name || entry.user_id}</span>
                            <span className="text-[7px] px-1.5 py-0.5 rounded-full" style={{
                              background: entry.risk_score > 0.7 ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                              color: entry.risk_score > 0.7 ? '#EF4444' : '#FBBF24',
                            }}>
                              Risk: {(entry.risk_score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>
                            "{entry.content_preview}"
                          </p>
                          <div className="flex gap-1 mt-1">
                            {entry.violations?.map((v, vi) => (
                              <span key={vi} className="text-[7px] px-1 py-0.5 rounded" style={{
                                background: v.severity === 'critical' ? 'rgba(239,68,68,0.08)' : 'rgba(251,191,36,0.08)',
                                color: v.severity === 'critical' ? '#EF4444' : '#FBBF24',
                              }}>
                                {v.category}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ MIRROR ═══ */}
            {activeTab === 'mirror' && (
              <div className="space-y-2" data-testid="sovereign-mirror">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    Sovereign Mirror ({mirror.total} entries)
                  </span>
                </div>
                {mirror.entries.length === 0 ? (
                  <p className="text-[11px] text-center py-8" style={{ color: 'rgba(255,255,255,0.6)' }}>No mirror entries yet</p>
                ) : (
                  mirror.entries.map((entry, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-medium" style={{ color: entry.type === 'purchase' ? '#FBBF24' : '#C084FC' }}>
                          {entry.type === 'purchase' ? 'Purchase' : 'Created'}
                        </span>
                        <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-[11px]" style={{ color: '#F8FAFC' }}>
                        {entry.constellation?.name || 'Untitled'}
                      </div>
                      <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        by {entry.creator_name || entry.buyer_id || 'Unknown'} — {entry.constellation?.module_ids?.length || 0} modules
                      </div>
                      {entry.price > 0 && (
                        <div className="text-[9px] mt-1" style={{ color: '#FBBF24' }}>
                          {entry.price} credits {entry.sovereign_cut ? `(${entry.sovereign_cut} fee)` : ''}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ═══ ESCROW ═══ */}
            {activeTab === 'escrow' && (
              <div className="space-y-2" data-testid="sovereign-escrow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    Escrow Contracts
                  </span>
                </div>
                {escrow.length === 0 ? (
                  <p className="text-[11px] text-center py-8" style={{ color: 'rgba(255,255,255,0.6)' }}>No escrow contracts</p>
                ) : (
                  escrow.map((contract, i) => {
                    const statusColor = contract.status === 'completed' ? '#22C55E' : contract.status === 'frozen' ? '#EF4444' : '#FBBF24';
                    return (
                      <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-medium" style={{ color: '#F8FAFC' }}>{contract.item_name || contract.type}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${statusColor}15`, color: statusColor }}>
                            {contract.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                          <span>Total: {contract.total_price}</span>
                          <span>Fee: {contract.sovereign_cut}</span>
                          <span>Seller: {contract.seller_amount}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ═══ SKELETON EXPORT ═══ */}
            {activeTab === 'skeleton' && (
              <div className="space-y-3" data-testid="sovereign-skeleton">
                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <h3 className="text-xs font-medium mb-1" style={{ color: '#F8FAFC' }}>Framework Skeleton Export</h3>
                  <p className="text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    Download the Universal Synthesis Interface skeleton — stripped of cosmic paint, ready for white-label domain injection.
                  </p>
                  <button
                    onClick={skeleton ? downloadSkeleton : fetchSkeleton}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
                    style={{
                      background: skeleton ? 'rgba(34,197,94,0.08)' : 'rgba(192,132,252,0.08)',
                      border: `1px solid ${skeleton ? 'rgba(34,197,94,0.2)' : 'rgba(192,132,252,0.15)'}`,
                      color: skeleton ? '#22C55E' : '#C084FC',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                    data-testid="skeleton-download-btn"
                  >
                    <Download size={13} />
                    {skeleton ? 'Download usi-skeleton-v1.json' : 'Generate Skeleton'}
                  </button>
                </div>

                {skeleton && (
                  <div className="rounded-xl p-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Preview</div>
                    <pre className="text-[9px] overflow-x-auto max-h-60 overflow-y-auto" style={{ color: 'rgba(192,132,252,0.7)', fontFamily: 'monospace', lineHeight: '1.5' }}>
                      {JSON.stringify(skeleton, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
