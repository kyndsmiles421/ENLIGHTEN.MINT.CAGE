import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Sprout, Flower2, Hammer, Crown, Check, X, Lock,
  Brain, Eye, Compass, Music, MapPin, Zap, ShoppingCart,
  ChevronRight, ArrowLeft, Loader2, Sparkles, Radio, Cpu,
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TIER_ICONS = { standard: Sprout, apprentice: Flower2, artisan: Hammer, sovereign: Crown };
const TIER_COLORS = { standard: '#22C55E', apprentice: '#60A5FA', artisan: '#A78BFA', sovereign: '#FBBF24' };
const AGENT_ICONS = { compass: Compass, music: Music, 'map-pin': MapPin };

export default function SovereignArchitecture() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('sovereign_arch', 8); }, []);

  const { authHeaders, authLoading, token } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [tiers, setTiers] = useState(null);
  const [units, setUnits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [thinkingQuery, setThinkingQuery] = useState('');
  const [thinkingResult, setThinkingResult] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const load = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      const [s, t, u] = await Promise.all([
        axios.get(`${API}/sovereign/status`, { headers: authHeaders }),
        axios.get(`${API}/sovereign/tiers`),
        axios.get(`${API}/sovereign/units`, { headers: authHeaders }),
      ]);
      setStatus(s.data);
      setTiers(t.data);
      setUnits(u.data);
    } catch {} finally { setLoading(false); }
  }, [authHeaders, authLoading, token]);

  useEffect(() => { load(); }, [load]);

  const handlePurchaseUnit = async (unitId) => {
    setPurchasing(unitId);
    try {
      const res = await axios.post(`${API}/sovereign/units/purchase`, { unit_id: unitId }, { headers: authHeaders });
      toast.success(`${res.data.unit_name} activated! Credits: ${res.data.remaining_balance}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Purchase failed');
    } finally { setPurchasing(null); }
  };

  const handleThinkingFeed = async () => {
    if (!thinkingQuery.trim()) return;
    setThinking(true);
    try {
      const res = await axios.post(`${API}/sovereign/thinking-feed`, { query: thinkingQuery }, { headers: authHeaders });
      setThinkingResult(res.data);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Thinking Feed unavailable');
    } finally { setThinking(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
      <Loader2 className="animate-spin" size={24} style={{ color: '#FBBF24' }} />
    </div>
  );

  const userTier = status?.tier || 'standard';
  const userColor = TIER_COLORS[userTier];
  const UserIcon = TIER_ICONS[userTier];

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0A0A0F', color: '#F8FAFC' }} data-testid="sovereign-architecture-page">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at 30% 20%, ${userColor}08 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.04) 0%, transparent 50%)`,
      }} />

      <div className="relative max-w-3xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5 transition-colors" data-testid="sovereign-back-btn">
              <ArrowLeft size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight" data-testid="sovereign-title">Sovereign Architecture</h1>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>4-Tier Subscription Model</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: `${userColor}10`, border: `1px solid ${userColor}25` }}
            data-testid="sovereign-current-tier">
            <UserIcon size={14} style={{ color: userColor }} />
            <span className="text-[10px] font-bold" style={{ color: userColor }}>{status?.tier_name} — {status?.codename}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'tiers', label: 'Compare Tiers', icon: Crown },
            { id: 'units', label: 'Cross-Tier Shop', icon: ShoppingCart },
            { id: 'thinking', label: 'Glass Box', icon: Brain },
          ].map(tab => (
            <button key={tab.id}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-medium transition-all"
              style={{
                background: activeTab === tab.id ? `${userColor}12` : 'transparent',
                color: activeTab === tab.id ? userColor : 'var(--text-muted)',
                border: `1px solid ${activeTab === tab.id ? userColor + '20' : 'transparent'}`,
              }}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.id}`}>
              <tab.icon size={11} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && status && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Brain size={14} style={{ color: userColor }} className="mb-2" />
                <p className="text-[10px] font-semibold mb-0.5">{status.ai_brain}</p>
                <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{status.ai_description}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Eye size={14} style={{ color: userColor }} className="mb-2" />
                <p className="text-[10px] font-semibold mb-0.5">{status.experience?.visuals}</p>
                <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{status.experience?.audio_label}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Cpu size={14} style={{ color: userColor }} className="mb-2" />
                <p className="text-[10px] font-semibold mb-0.5">{status.tool_label}</p>
                <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{status.persona}</p>
              </div>
            </div>

            {/* Effective Capabilities */}
            <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-[9px] uppercase tracking-wider font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Effective Capabilities</p>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(status.effective_capabilities || {}).map(([key, val]) => {
                  const isActive = val === true || (typeof val === 'number' && val > 0);
                  return (
                    <div key={key} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{
                      background: isActive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.04)',
                      border: `1px solid ${isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.08)'}`,
                    }}>
                      {isActive ? <Check size={9} style={{ color: '#22C55E' }} /> : <X size={9} style={{ color: '#EF4444' }} />}
                      <span className="text-[8px]" style={{ color: isActive ? '#22C55E' : '#EF4444' }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        {typeof val === 'number' && val > 0 ? ` (${val}%)` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Units */}
            {status.active_units?.length > 0 && (
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p className="text-[9px] uppercase tracking-wider font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Active Purchased Units</p>
                {status.active_units.map(u => (
                  <div key={u.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg mb-1"
                    style={{ background: `${TIER_COLORS[u.from_tier] || '#8B5CF6'}08` }}>
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={9} style={{ color: TIER_COLORS[u.from_tier] }} />
                      <span className="text-[8px] font-medium">{u.unit_name}</span>
                    </div>
                    <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
                      {u.expires_at ? `Expires ${new Date(u.expires_at).toLocaleDateString()}` : u.uses_remaining ? `${u.uses_remaining} uses` : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Perks */}
            <div className="mt-4 p-4 rounded-xl" style={{ background: `${userColor}05`, border: `1px solid ${userColor}10` }}>
              <p className="text-[9px] uppercase tracking-wider font-medium mb-2" style={{ color: userColor }}>Your {status.tier_name} Perks</p>
              <div className="grid grid-cols-2 gap-1">
                {status.perks?.map((perk, i) => (
                  <div key={i} className="flex items-start gap-1.5 py-1">
                    <Check size={8} className="mt-0.5 flex-shrink-0" style={{ color: userColor }} />
                    <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tiers Tab */}
        {activeTab === 'tiers' && tiers && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {tiers.tiers?.map(t => {
                const TIcon = TIER_ICONS[t.id];
                const c = TIER_COLORS[t.id];
                const isCurrent = t.id === userTier;
                return (
                  <motion.div key={t.id} className="p-3 rounded-xl relative overflow-hidden"
                    style={{
                      background: isCurrent ? `${c}10` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isCurrent ? c + '30' : 'rgba(255,255,255,0.04)'}`,
                    }}
                    whileHover={{ y: -2 }}
                    data-testid={`tier-card-${t.id}`}>
                    {isCurrent && (
                      <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[6px] font-bold" style={{ background: c, color: '#0A0A0F' }}>
                        CURRENT
                      </div>
                    )}
                    <TIcon size={18} style={{ color: c }} className="mb-2" />
                    <p className="text-[11px] font-bold" style={{ color: c }}>{t.name}</p>
                    <p className="text-[8px] mb-1" style={{ color: 'var(--text-muted)' }}>{t.codename}</p>
                    <p className="text-[14px] font-bold mb-1">{t.price_monthly === 0 ? 'Free' : `$${t.price_monthly}/mo`}</p>
                    <p className="text-[7px] mb-2" style={{ color: 'var(--text-muted)' }}>{t.ai_brain}</p>
                    <div className="space-y-0.5">
                      {t.perks?.slice(0, 4).map((p, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <Check size={7} className="mt-0.5 flex-shrink-0" style={{ color: c }} />
                          <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{p}</span>
                        </div>
                      ))}
                      {(t.perks?.length || 0) > 4 && (
                        <p className="text-[6px] pl-2.5" style={{ color: c }}>+{t.perks.length - 4} more perks</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Feature Comparison Table */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-[9px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>Feature Comparison</p>
              </div>
              {tiers.comparison?.map((row, i) => (
                <div key={i} className="grid grid-cols-5 text-[8px]" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                  <div className="px-3 py-2 font-medium" style={{ color: '#F8FAFC' }}>{row.feature}</div>
                  {['standard', 'apprentice', 'artisan', 'sovereign'].map(t => (
                    <div key={t} className="px-2 py-2" style={{
                      color: t === userTier ? TIER_COLORS[t] : 'var(--text-muted)',
                      background: t === userTier ? `${TIER_COLORS[t]}06` : 'transparent',
                      fontWeight: t === userTier ? 600 : 400,
                    }}>{row[t]}</div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cross-Tier Shop Tab */}
        {activeTab === 'units' && units && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>
              Buy individual features from higher tiers without upgrading. Credits or USD.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {units.units?.map(u => {
                const fromColor = TIER_COLORS[u.from_tier] || '#8B5CF6';
                const FromIcon = TIER_ICONS[u.from_tier] || Sparkles;
                return (
                  <motion.div key={u.id} className="p-3 rounded-xl relative"
                    style={{
                      background: u.already_active ? `${fromColor}08` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${u.already_active ? fromColor + '25' : 'rgba(255,255,255,0.04)'}`,
                    }}
                    whileHover={{ scale: 1.01 }}
                    data-testid={`unit-${u.id}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <FromIcon size={14} style={{ color: fromColor }} />
                      <div className="flex-1">
                        <p className="text-[9px] font-semibold">{u.name}</p>
                        <span className="text-[6px] px-1 py-0.5 rounded" style={{ background: `${fromColor}15`, color: fromColor }}>
                          {u.from_tier} feature
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold" style={{ color: fromColor }}>{u.price_credits}c</p>
                        <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>${u.price_usd}</p>
                      </div>
                    </div>
                    <p className="text-[7px] mb-2" style={{ color: 'var(--text-muted)' }}>{u.description}</p>
                    {u.already_active ? (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[8px]"
                        style={{ background: `${fromColor}10`, color: fromColor }}>
                        <Check size={9} /> Active
                      </div>
                    ) : (
                      <motion.button
                        className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[8px] cursor-pointer"
                        style={{ background: `${fromColor}10`, border: `1px solid ${fromColor}20`, color: fromColor }}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handlePurchaseUnit(u.id)}
                        disabled={purchasing === u.id}
                        data-testid={`buy-${u.id}`}>
                        {purchasing === u.id ? <Loader2 size={10} className="animate-spin" /> : <ShoppingCart size={10} />}
                        Buy with {u.price_credits} Credits
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Glass Box Thinking Feed Tab */}
        {activeTab === 'thinking' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.1)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Brain size={14} style={{ color: '#8B5CF6' }} />
                <p className="text-[10px] font-semibold" style={{ color: '#8B5CF6' }}>Glass Box Thinking Feed</p>
                {!status?.effective_capabilities?.thinking_feed && (
                  <span className="text-[7px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                    <Lock size={7} className="inline mr-0.5" /> Requires Apprentice+ or purchase
                  </span>
                )}
              </div>
              <p className="text-[8px] mb-3" style={{ color: 'var(--text-muted)' }}>
                See how the Master Orchestrator coordinates specialized agents to process your query. Watch the sacred geometry mapping, frequency alignment, and logistics calculation in real-time.
              </p>
              <div className="flex gap-2 mb-3">
                <input value={thinkingQuery} onChange={e => setThinkingQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleThinkingFeed()}
                  placeholder="e.g., Plan a high-vibration menu for the Mobile Cafe..."
                  className="flex-1 px-3 py-2 rounded-lg text-[9px] outline-none"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#F8FAFC' }}
                  data-testid="thinking-feed-input" />
                <motion.button
                  className="px-4 py-2 rounded-lg text-[9px] font-medium cursor-pointer"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8B5CF6' }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleThinkingFeed} disabled={thinking}
                  data-testid="thinking-feed-submit">
                  {thinking ? <Loader2 size={12} className="animate-spin" /> : 'Orchestrate'}
                </motion.button>
              </div>

              {/* Agent Grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {Object.values(tiers?.agents || {}).map(agent => {
                  const AgentIcon = AGENT_ICONS[agent.icon] || Compass;
                  const isActive = agent.role === 'Logistics'
                    ? status?.effective_capabilities?.agent_coordination
                    : status?.effective_capabilities?.thinking_feed;
                  return (
                    <div key={agent.role} className="p-2.5 rounded-xl" style={{
                      background: isActive ? `${agent.color}08` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isActive ? agent.color + '20' : 'rgba(255,255,255,0.04)'}`,
                      opacity: isActive ? 1 : 0.4,
                    }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <AgentIcon size={11} style={{ color: agent.color }} />
                        <span className="text-[8px] font-bold" style={{ color: agent.color }}>{agent.name}</span>
                      </div>
                      <p className="text-[7px] font-medium" style={{ color: agent.color }}>{agent.role}</p>
                      <p className="text-[6px]" style={{ color: 'var(--text-muted)' }}>{agent.description}</p>
                      {!isActive && <Lock size={8} className="mt-1" style={{ color: 'var(--text-muted)' }} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Thinking Result */}
            <AnimatePresence>
              {thinkingResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(139,92,246,0.15)' }}
                  data-testid="thinking-result">
                  <div className="p-3" style={{ background: 'rgba(139,92,246,0.05)' }}>
                    <p className="text-[8px] uppercase tracking-wider font-medium" style={{ color: '#8B5CF6' }}>
                      Thinking Chain — {thinkingResult.agent_count} Agents {thinkingResult.has_gamma ? '(α/β/γ)' : '(α/β)'}
                    </p>
                  </div>
                  {thinkingResult.thinking_chain?.map((agent, i) => (
                    <motion.div key={agent.agent}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.3 }}
                      className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${agent.color}20` }}>
                          {React.createElement(AGENT_ICONS[agent.agent === 'alpha' ? 'compass' : agent.agent === 'beta' ? 'music' : 'map-pin'], { size: 11, style: { color: agent.color } })}
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-bold" style={{ color: agent.color }}>{agent.name} ({agent.role})</p>
                          <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{agent.thought}</p>
                        </div>
                        <span className="text-[7px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
                          {agent.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 ml-8">
                        {agent.layers?.map((layer, j) => (
                          <div key={j} className="px-2 py-1.5 rounded-lg" style={{ background: `${agent.color}06`, border: `1px solid ${agent.color}10` }}>
                            <p className="text-[6px] uppercase tracking-wider mb-0.5" style={{ color: agent.color }}>{layer.type}</p>
                            <p className="text-[7px] font-medium">{layer.label}</p>
                            <p className="text-[7px]" style={{ color: agent.color }}>{layer.value}</p>
                            <div className="h-0.5 rounded-full mt-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
                              <div className="h-full rounded-full" style={{ width: `${layer.confidence * 100}%`, background: agent.color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                  {thinkingResult.ai_response && (
                    <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.02)' }}>
                      <p className="text-[8px] uppercase tracking-wider font-medium mb-1.5" style={{ color: '#FBBF24' }}>Master Orchestrator Response</p>
                      <p className="text-[9px] leading-relaxed whitespace-pre-wrap" style={{ color: '#F8FAFC' }}>{thinkingResult.ai_response}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
