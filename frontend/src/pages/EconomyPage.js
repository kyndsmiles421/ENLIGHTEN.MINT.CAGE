import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Zap, Star, Check, ChevronRight, Package, BookOpen,
  Users, Shield, ArrowRight, Award, Sparkles, X, Loader2,
  Coffee, Code, Leaf, Briefcase, Eye, Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL;

const TIER_ICONS = { discovery: Eye, resonance: Zap, sovereign: Crown };
const DOMAIN_ICONS = { culinary: Coffee, engineering: Code, horticulture: Leaf, business: Briefcase };
const CAT_ICONS = { mini: Package, mastery: BookOpen, business: Briefcase };

/* ── Subscription Tier Card ── */
function TierCard({ tier, isCurrent, onSelect, loading }) {
  const Icon = TIER_ICONS[tier.id] || Star;
  const isFree = tier.price_monthly <= 0;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl overflow-hidden relative"
      style={{
        background: isCurrent ? `${tier.color}06` : 'rgba(255,255,255,0.015)',
        border: `1px solid ${isCurrent ? `${tier.color}20` : 'rgba(255,255,255,0.04)'}`,
      }}
      data-testid={`tier-${tier.id}`}
    >
      {isCurrent && (
        <div className="absolute top-2 right-2">
          <span className="text-[7px] uppercase px-2 py-0.5 rounded-full font-semibold" style={{
            background: `${tier.color}15`, color: tier.color,
          }}>Current</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
            background: `${tier.color}0A`, border: `1px solid ${tier.color}15`,
          }}>
            <Icon size={16} style={{ color: tier.color }} />
          </div>
          <div>
            <div className="text-xs font-semibold" style={{ color: tier.color }}>{tier.name}</div>
            <div className="text-[8px]" style={{ color: 'rgba(248,250,252,0.25)' }}>{tier.label} Tier</div>
          </div>
        </div>

        <div className="mb-3">
          {isFree ? (
            <span className="text-lg font-bold" style={{ color: '#F8FAFC' }}>Free</span>
          ) : (
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold" style={{ color: '#F8FAFC' }}>${tier.price_monthly}</span>
              <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>/mo</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5 mb-3">
          {tier.features.map((f, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <Check size={10} style={{ color: tier.color, marginTop: 2, flexShrink: 0 }} />
              <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.45)' }}>{f}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[8px] mb-3" style={{ color: 'rgba(248,250,252,0.2)' }}>
          <span>{tier.fidelity} visuals</span>
          <span>{tier.max_project_slots === -1 ? 'Unlimited' : tier.max_project_slots} projects</span>
          {tier.marketplace_discount > 0 && <span>{tier.marketplace_discount}% discount</span>}
        </div>

        {!isCurrent && (
          <button
            onClick={() => onSelect(tier.id)}
            disabled={loading}
            className="w-full py-2 rounded-lg text-[10px] font-medium transition-all"
            style={{
              background: `${tier.color}10`,
              color: tier.color,
              border: `1px solid ${tier.color}18`,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
            data-testid={`select-tier-${tier.id}`}
          >
            {loading ? 'Processing...' : isFree ? 'Switch to Free' : `Upgrade to ${tier.name}`}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── Learning Pack Card ── */
function PackCard({ pack, onPurchase, loading, hasPolymath }) {
  const DIcon = DOMAIN_ICONS[pack.domain] || Package;
  const purchased = pack.purchased || hasPolymath;
  return (
    <div className="rounded-xl p-3 flex items-start gap-3" style={{
      background: purchased ? 'rgba(34,197,94,0.03)' : 'rgba(255,255,255,0.015)',
      border: `1px solid ${purchased ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)'}`,
      opacity: purchased ? 0.7 : 1,
    }} data-testid={`pack-${pack.id}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
        background: `${pack.category_data?.color || '#818CF8'}08`,
      }}>
        <DIcon size={14} style={{ color: pack.category_data?.color || '#818CF8' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-semibold" style={{ color: purchased ? '#22C55E' : '#F8FAFC' }}>{pack.name}</div>
        <div className="text-[8px] mt-0.5" style={{ color: 'rgba(248,250,252,0.35)' }}>{pack.description}</div>
        <div className="flex items-center gap-2 mt-1.5 text-[8px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
          <span>{pack.modules_included} modules</span>
          <span>{pack.category_data?.name}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-xs font-semibold" style={{ color: purchased ? '#22C55E' : '#F8FAFC' }}>
          {purchased ? 'Owned' : `$${pack.price.toFixed(0)}`}
        </span>
        {!purchased && (
          <button
            onClick={() => onPurchase(pack.id)}
            disabled={loading}
            className="text-[8px] px-2.5 py-1 rounded-md font-medium"
            style={{
              background: `${pack.category_data?.color || '#818CF8'}10`,
              color: pack.category_data?.color || '#818CF8',
              border: `1px solid ${pack.category_data?.color || '#818CF8'}18`,
              cursor: loading ? 'wait' : 'pointer',
            }}
            data-testid={`buy-pack-${pack.id}`}
          >
            {loading ? '...' : 'Purchase'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Commission Tier Row ── */
function CommissionRow({ tier, isActive, isCapped }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{
      background: isActive ? `${tier.color}06` : 'transparent',
      border: `1px solid ${isActive ? `${tier.color}12` : 'rgba(255,255,255,0.02)'}`,
      opacity: isCapped ? 0.4 : 1,
    }} data-testid={`commission-level-${tier.level}`}>
      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{
        background: `${tier.color}0A`,
      }}>
        <span className="text-[9px] font-bold" style={{ color: tier.color }}>{tier.level}</span>
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-medium" style={{ color: isActive ? tier.color : 'rgba(248,250,252,0.4)' }}>
          {tier.name}
        </div>
        <div className="text-[7px]" style={{ color: 'rgba(248,250,252,0.2)' }}>{tier.status}</div>
      </div>
      <div className="text-right">
        <div className="text-xs font-bold" style={{ color: tier.color }}>
          {tier.commission_rate > 0 ? `${tier.commission_rate}%` : '—'}
        </div>
        {isCapped && <div className="text-[6px]" style={{ color: 'rgba(248,250,252,0.2)' }}>Upgrade to unlock</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN ECONOMY PAGE
   ═══════════════════════════════════════════ */
export default function EconomyPage() {
  const { token, authHeaders } = useAuth();
  const [tiers, setTiers] = useState([]);
  const [currentTier, setCurrentTier] = useState('discovery');
  const [packs, setPacks] = useState([]);
  const [hasPolymath, setHasPolymath] = useState(false);
  const [commissions, setCommissions] = useState(null);
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [loading, setLoading] = useState('');
  const [polling, setPolling] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const fetchTiers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/economy/tiers`, { headers: authHeaders });
      const data = await res.json();
      setTiers(data.tiers || []);
      setCurrentTier(data.current_tier || 'discovery');
    } catch {}
  }, [token, authHeaders]);

  const fetchPacks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/economy/packs`, { headers: authHeaders });
      const data = await res.json();
      setPacks(data.packs || []);
      setHasPolymath(data.has_polymath || false);
    } catch {}
  }, [token, authHeaders]);

  const fetchCommissions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/economy/commissions`, { headers: authHeaders });
      const data = await res.json();
      setCommissions(data);
    } catch {}
  }, [token, authHeaders]);

  useEffect(() => {
    fetchTiers(); fetchPacks(); fetchCommissions();
  }, [fetchTiers, fetchPacks, fetchCommissions]);

  // Handle return from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const type = params.get('type');
    if (sessionId && token) {
      pollPaymentStatus(sessionId, type, 0);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const pollPaymentStatus = async (sessionId, type, attempt) => {
    if (attempt >= 5) {
      setPaymentResult({ status: 'timeout', message: 'Payment verification timed out. Check your email for confirmation.' });
      setPolling(false);
      return;
    }
    setPolling(true);
    try {
      const res = await fetch(`${API}/api/economy/checkout-status/${sessionId}`, { headers: authHeaders });
      const data = await res.json();
      if (data.payment_status === 'paid') {
        setPaymentResult({ status: 'success', type: data.type, tier_id: data.tier_id, pack_id: data.pack_id });
        setPolling(false);
        fetchTiers(); fetchPacks(); fetchCommissions();
        return;
      }
      if (data.status === 'expired') {
        setPaymentResult({ status: 'expired', message: 'Payment session expired.' });
        setPolling(false);
        return;
      }
      setTimeout(() => pollPaymentStatus(sessionId, type, attempt + 1), 2000);
    } catch {
      setPaymentResult({ status: 'error', message: 'Error verifying payment.' });
      setPolling(false);
    }
  };

  const handleSubscribe = async (tierId) => {
    if (tierId === 'discovery') {
      setLoading('discovery');
      try {
        await fetch(`${API}/api/economy/downgrade`, {
          method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        fetchTiers();
      } catch {}
      setLoading('');
      return;
    }
    setLoading(tierId);
    try {
      const res = await fetch(`${API}/api/economy/subscribe`, {
        method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier_id: tierId, origin_url: window.location.origin }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
    setLoading('');
  };

  const handlePurchasePack = async (packId) => {
    setLoading(packId);
    try {
      const res = await fetch(`${API}/api/economy/purchase-pack`, {
        method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack_id: packId, origin_url: window.location.origin }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
    setLoading('');
  };

  const handlePurchasePolymath = async () => {
    setLoading('polymath');
    try {
      const res = await fetch(`${API}/api/economy/purchase-polymath`, {
        method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin_url: window.location.origin }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
    setLoading('polymath');
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0C15' }}>
        <p className="text-sm" style={{ color: 'rgba(248,250,252,0.3)' }}>Sign in to access the Economy</p>
      </div>
    );
  }

  const tabs = [
    { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
    { id: 'packs', label: 'Learning Packs', icon: Package },
    { id: 'commissions', label: 'Brokerage', icon: Users },
  ];

  return (
    <div className="min-h-screen pb-32" style={{ background: '#0B0C15' }}>
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-5" data-testid="economy-header">
          <h1 className="text-lg font-semibold tracking-tight" style={{ color: '#F8FAFC' }} data-testid="economy-title">
            Economy
          </h1>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(248,250,252,0.25)' }}>
            Dual-Track System — Utility + Learning & Brokerage
          </p>
        </div>

        {/* Payment Result Banner */}
        <AnimatePresence>
          {(polling || paymentResult) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-xl p-3 mb-4 flex items-center gap-2" style={{
                background: polling ? 'rgba(129,140,248,0.05)' : paymentResult?.status === 'success' ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
                border: `1px solid ${polling ? 'rgba(129,140,248,0.12)' : paymentResult?.status === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'}`,
              }} data-testid="payment-result"
            >
              {polling ? (
                <>
                  <Loader2 size={14} className="animate-spin" style={{ color: '#818CF8' }} />
                  <span className="text-xs" style={{ color: '#818CF8' }}>Verifying payment...</span>
                </>
              ) : paymentResult?.status === 'success' ? (
                <>
                  <Check size={14} style={{ color: '#22C55E' }} />
                  <span className="text-xs" style={{ color: '#22C55E' }}>Payment successful! Your account has been updated.</span>
                  <button onClick={() => setPaymentResult(null)} className="ml-auto p-1" style={{ cursor: 'pointer' }}>
                    <X size={12} style={{ color: 'rgba(248,250,252,0.3)' }} />
                  </button>
                </>
              ) : (
                <>
                  <X size={14} style={{ color: '#EF4444' }} />
                  <span className="text-xs" style={{ color: '#EF4444' }}>{paymentResult?.message || 'Payment failed'}</span>
                  <button onClick={() => setPaymentResult(null)} className="ml-auto p-1" style={{ cursor: 'pointer' }}>
                    <X size={12} style={{ color: 'rgba(248,250,252,0.3)' }} />
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Status */}
        <div className="grid grid-cols-3 gap-1.5 mb-4" data-testid="economy-stats">
          {[
            { label: 'Subscription', value: currentTier.charAt(0).toUpperCase() + currentTier.slice(1), color: tiers.find(t => t.id === currentTier)?.color || '#6B7280', icon: Crown },
            { label: 'Packs Owned', value: `${packs.filter(p => p.purchased).length}/${packs.length}`, color: '#22C55E', icon: Package },
            { label: 'Commission', value: commissions?.total_earned ? `$${commissions.total_earned}` : '$0', color: '#FBBF24', icon: Award },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl p-2 text-center" style={{
                background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)',
              }}>
                <Icon size={12} style={{ color: s.color, margin: '0 auto 4px', opacity: 0.6 }} />
                <div className="text-xs font-semibold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[7px] uppercase" style={{ color: 'rgba(248,250,252,0.2)' }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-4 rounded-xl p-1" style={{
          background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)',
        }} data-testid="economy-tabs">
          {tabs.map(tab => {
            const TIcon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[9px] font-medium transition-all"
                style={{
                  background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                  color: active ? '#F8FAFC' : 'rgba(248,250,252,0.3)',
                  cursor: 'pointer',
                }}
                data-testid={`tab-${tab.id}`}
              >
                <TIcon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ═══ Subscriptions Tab ═══ */}
        {activeTab === 'subscriptions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              {tiers.map(tier => (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  isCurrent={currentTier === tier.id}
                  onSelect={handleSubscribe}
                  loading={loading === tier.id}
                />
              ))}
            </div>

            {/* Polymath Pass */}
            {!hasPolymath && (
              <div className="rounded-xl overflow-hidden" style={{
                background: 'rgba(192,132,252,0.03)', border: '1px solid rgba(192,132,252,0.12)',
              }} data-testid="polymath-pass">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} style={{ color: '#C084FC' }} />
                    <span className="text-xs font-semibold" style={{ color: '#C084FC' }}>Polymath All-Access Pass</span>
                    <span className="ml-auto text-sm font-bold" style={{ color: '#F8FAFC' }}>$1,797<span className="text-[8px] font-normal" style={{ color: 'rgba(248,250,252,0.3)' }}>/year</span></span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {['Full Sovereign subscription included', 'All current & future Specialized Packs', 'Instant Level 4 Sovereign (27% Commission) everywhere'].map(f => (
                      <div key={f} className="flex items-start gap-1.5">
                        <Check size={10} style={{ color: '#C084FC', marginTop: 2 }} />
                        <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.45)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={handlePurchasePolymath} disabled={loading === 'polymath'}
                    className="w-full py-2 rounded-lg text-[10px] font-medium"
                    style={{
                      background: 'rgba(192,132,252,0.1)', color: '#C084FC',
                      border: '1px solid rgba(192,132,252,0.18)', cursor: loading === 'polymath' ? 'wait' : 'pointer',
                    }} data-testid="buy-polymath">
                    {loading === 'polymath' ? 'Processing...' : 'Get All-Access'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ Learning Packs Tab ═══ */}
        {activeTab === 'packs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {['mini', 'mastery', 'business'].map(cat => {
              const catPacks = packs.filter(p => p.category === cat);
              if (catPacks.length === 0) return null;
              const catData = catPacks[0]?.category_data || {};
              const CIcon = CAT_ICONS[cat] || Package;
              return (
                <div key={cat} className="mb-4" data-testid={`pack-category-${cat}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <CIcon size={13} style={{ color: catData.color || '#818CF8' }} />
                    <span className="text-xs font-medium" style={{ color: '#F8FAFC' }}>{catData.name}</span>
                    <span className="text-[8px]" style={{ color: 'rgba(248,250,252,0.2)' }}>{catData.range}</span>
                  </div>
                  <div className="space-y-1.5">
                    {catPacks.map(pack => (
                      <PackCard key={pack.id} pack={pack} onPurchase={handlePurchasePack}
                        loading={loading === pack.id} hasPolymath={hasPolymath} />
                    ))}
                  </div>
                </div>
              );
            })}
            {hasPolymath && (
              <div className="rounded-xl p-3 text-center" style={{
                background: 'rgba(192,132,252,0.04)', border: '1px solid rgba(192,132,252,0.1)',
              }}>
                <Sparkles size={16} style={{ color: '#C084FC', margin: '0 auto 4px' }} />
                <span className="text-[10px] font-medium" style={{ color: '#C084FC' }}>Polymath — All packs unlocked</span>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ Commissions Tab ═══ */}
        {activeTab === 'commissions' && commissions && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Earnings Summary */}
            <div className="rounded-xl p-3 mb-4 flex items-center justify-between" style={{
              background: 'rgba(251,191,36,0.03)', border: '1px solid rgba(251,191,36,0.08)',
            }} data-testid="earnings-summary">
              <div>
                <div className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.2)' }}>Total Earned</div>
                <div className="text-lg font-bold" style={{ color: '#FBBF24' }}>${commissions.total_earned.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.2)' }}>Max Level</div>
                <div className="text-xs font-semibold" style={{ color: '#818CF8' }}>
                  Level {commissions.max_allowed_level}
                  {commissions.has_polymath && <span className="text-[7px] ml-1" style={{ color: '#C084FC' }}>(Polymath)</span>}
                </div>
              </div>
            </div>

            {/* Commission Tiers */}
            <div className="mb-4">
              <div className="text-[8px] uppercase tracking-[2px] mb-2" style={{ color: 'rgba(248,250,252,0.18)' }}>
                Advancement Tiers
              </div>
              <div className="space-y-1">
                {commissions.tiers.map(tier => {
                  const isActive = tier.level <= commissions.max_allowed_level;
                  const isCapped = tier.level > commissions.max_allowed_level;
                  return <CommissionRow key={tier.level} tier={tier} isActive={isActive} isCapped={isCapped} />;
                })}
              </div>
            </div>

            {/* Domain Levels */}
            {Object.keys(commissions.domain_levels).length > 0 && (
              <div className="mb-4">
                <div className="text-[8px] uppercase tracking-[2px] mb-2" style={{ color: 'rgba(248,250,252,0.18)' }}>
                  Domain Mastery (Per-Field Levels)
                </div>
                <div className="space-y-1">
                  {Object.entries(commissions.domain_levels).map(([domain, level]) => {
                    const DIcon = DOMAIN_ICONS[domain] || Briefcase;
                    const tierData = commissions.tiers.find(t => t.level === level) || commissions.tiers[0];
                    return (
                      <div key={domain} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
                        background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)',
                      }} data-testid={`domain-${domain}`}>
                        <DIcon size={12} style={{ color: tierData.color }} />
                        <span className="text-[10px] font-medium capitalize flex-1" style={{ color: '#F8FAFC' }}>{domain}</span>
                        <span className="text-[9px] font-semibold" style={{ color: tierData.color }}>
                          Level {level} — {tierData.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Earnings */}
            {commissions.recent_earnings?.length > 0 && (
              <div>
                <div className="text-[8px] uppercase tracking-[2px] mb-2" style={{ color: 'rgba(248,250,252,0.18)' }}>
                  Recent Earnings
                </div>
                <div className="space-y-1">
                  {commissions.recent_earnings.map((e, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg" style={{
                      background: 'rgba(255,255,255,0.015)',
                    }}>
                      <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>{e.description || 'Commission'}</span>
                      <span className="text-[9px] font-semibold" style={{ color: '#22C55E' }}>+${e.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade Prompt */}
            {commissions.max_allowed_level < 4 && !commissions.has_polymath && (
              <div className="rounded-xl p-3 mt-4 text-center" style={{
                background: 'rgba(251,191,36,0.03)', border: '1px solid rgba(251,191,36,0.08)',
              }}>
                <div className="text-[9px] mb-1" style={{ color: 'rgba(248,250,252,0.35)' }}>
                  Upgrade to <span style={{ color: '#FBBF24' }}>Sovereign</span> to unlock 27% Master commissions
                </div>
                <button onClick={() => setActiveTab('subscriptions')}
                  className="text-[9px] px-3 py-1 rounded-lg font-medium"
                  style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24', cursor: 'pointer' }}
                  data-testid="upgrade-for-commission">
                  View Plans
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
