import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Zap, Star, Check, ChevronRight, Package, BookOpen,
  Users, Shield, ArrowRight, Award, Sparkles, X, Loader2,
  Coffee, Code, Leaf, Briefcase, Eye, Compass, Wand2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { guardCheckoutForTWA } from '../utils/paymentGate';

const API = process.env.REACT_APP_BACKEND_URL;

const TIER_ICONS = { discovery: Eye, resonance: Zap, sovereign: Crown, architect: Compass };
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
            <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{tier.label}</div>
          </div>
        </div>

        <div className="mb-2">
          {isFree ? (
            <span className="text-lg font-bold" style={{ color: '#F8FAFC' }}>Free</span>
          ) : (
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold" style={{ color: '#F8FAFC' }}>${tier.price_monthly}</span>
              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>/mo</span>
            </div>
          )}
        </div>

        {/* Education & Monetization */}
        {tier.education_level && (
          <div className="mb-2 px-2 py-1.5 rounded-lg" style={{ background: `${tier.color}05` }}>
            <div className="text-[7px] uppercase tracking-wider mb-0.5" style={{ color: `${tier.color}80` }}>
              {tier.education_level} Education
            </div>
            <div className="text-[8px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {tier.education_desc}
            </div>
          </div>
        )}

        <div className="space-y-1.5 mb-2">
          {tier.features.map((f, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <Check size={10} style={{ color: tier.color, marginTop: 2, flexShrink: 0 }} />
              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.75)' }}>{f}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap text-[7px] mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
          <span>{tier.fidelity}</span>
          <span>{tier.max_project_slots === -1 ? 'Unlimited' : tier.max_project_slots} slots</span>
          {tier.marketplace_discount > 0 && (
            <span className="px-1.5 py-0.5 rounded" style={{ background: `${tier.color}08`, color: tier.color }}>
              {tier.marketplace_discount}% off
            </span>
          )}
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
        <div className="text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{pack.description}</div>
        <div className="flex items-center gap-2 mt-1.5 text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
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
        <div className="text-[10px] font-medium" style={{ color: isActive ? tier.color : 'rgba(255,255,255,0.7)' }}>
          {tier.name}
        </div>
        <div className="text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{tier.status}</div>
      </div>
      <div className="text-right">
        <div className="text-xs font-bold" style={{ color: tier.color }}>
          {tier.commission_rate > 0 ? `${tier.commission_rate}%` : '—'}
        </div>
        {isCapped && <div className="text-[6px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Upgrade to unlock</div>}
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
  const [genField, setGenField] = useState('');
  const [genExpertise, setGenExpertise] = useState('');
  const [genType, setGenType] = useState('mini');
  const [genResult, setGenResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [drafts, setDrafts] = useState([]);

  const fetchTiers = useCallback(async () => {
    try {
      const headers = token ? authHeaders : {};
      const res = await fetch(`${API}/api/economy/tiers`, { headers });
      const data = await res.json();
      setTiers(data.tiers || []);
      setCurrentTier(data.current_tier || 'discovery');
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [token, authHeaders]);

  const fetchPacks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/economy/packs`, { headers: authHeaders });
      const data = await res.json();
      setPacks(data.packs || []);
      setHasPolymath(data.has_polymath || false);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [token, authHeaders]);

  const fetchCommissions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/economy/commissions`, { headers: authHeaders });
      const data = await res.json();
      setCommissions(data);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [token, authHeaders]);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('economy', 8); }, []);
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
      } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      setLoading('');
      return;
    }
    if (guardCheckoutForTWA(`subscribe:${tierId}`)) return;
    setLoading(tierId);
    try {
      const res = await fetch(`${API}/api/economy/subscribe`, {
        method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier_id: tierId, origin_url: window.location.origin }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    setLoading('');
  };

  const handlePurchasePack = async (packId) => {
    if (guardCheckoutForTWA(`pack:${packId}`)) return;
    setLoading(packId);
    try {
      const res = await fetch(`${API}/api/economy/purchase-pack`, {
        method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack_id: packId, origin_url: window.location.origin }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    setLoading('');
  };

  const handlePurchasePolymath = async () => {
    if (guardCheckoutForTWA('polymath')) return;
    setLoading('polymath');
    try {
      const res = await fetch(`${API}/api/economy/purchase-polymath`, {
        method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin_url: window.location.origin }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    setLoading('polymath');
  };

  const fetchDrafts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/copilot/drafts`, { headers: authHeaders });
      const data = await res.json();
      setDrafts(data.drafts || []);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [token, authHeaders]);

  useEffect(() => { if (activeTab === 'generator') fetchDrafts(); }, [activeTab, fetchDrafts]);

  const handleGeneratePack = async () => {
    if (!genField.trim() || !genExpertise.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API}/api/copilot/generate-pack`, {
        method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: genField, expertise: genExpertise, pack_type: genType }),
      });
      const data = await res.json();
      if (data.outline) {
        setGenResult(data);
        fetchDrafts();
      }
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    setGenerating(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>Sign in to access the Economy</p>
      </div>
    );
  }

  const tabs = [
    { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
    { id: 'packs', label: 'Learning Packs', icon: Package },
    { id: 'commissions', label: 'Brokerage', icon: Users },
    { id: 'generator', label: 'Pack Studio', icon: Wand2 },
  ];

  return (
    <div className="min-h-screen pb-32" style={{ background: 'transparent' }}>
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-5" data-testid="economy-header">
          <h1 className="text-lg font-semibold tracking-tight" style={{ color: '#F8FAFC' }} data-testid="economy-title">
            Economy
          </h1>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
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
                    <X size={12} style={{ color: 'rgba(255,255,255,0.65)' }} />
                  </button>
                </>
              ) : (
                <>
                  <X size={14} style={{ color: '#EF4444' }} />
                  <span className="text-xs" style={{ color: '#EF4444' }}>{paymentResult?.message || 'Payment failed'}</span>
                  <button onClick={() => setPaymentResult(null)} className="ml-auto p-1" style={{ cursor: 'pointer' }}>
                    <X size={12} style={{ color: 'rgba(255,255,255,0.65)' }} />
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
                <div className="text-[7px] uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
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
                  color: active ? '#F8FAFC' : 'rgba(255,255,255,0.65)',
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
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
                    <span className="ml-auto text-sm font-bold" style={{ color: '#F8FAFC' }}>$1,797<span className="text-[8px] font-normal" style={{ color: 'rgba(255,255,255,0.65)' }}>/year</span></span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {['Full Architect subscription ($89/mo value)', 'All current & future Specialized Packs', 'Instant Level 4 Sovereign (27% Commission)', '30% member discount on all assets'].map(f => (
                      <div key={f} className="flex items-start gap-1.5">
                        <Check size={10} style={{ color: '#C084FC', marginTop: 2 }} />
                        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.75)' }}>{f}</span>
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
                    <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{catData.range}</span>
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
                <div className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Earned</div>
                <div className="text-lg font-bold" style={{ color: '#FBBF24' }}>${commissions.total_earned.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>Max Level</div>
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
                      <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{e.description || 'Commission'}</span>
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
                <div className="text-[9px] mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
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

        {/* ═══ Synthesis Forge Tab ═══ */}
        {activeTab === 'generator' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Step 1: Command Console */}
            <div className="rounded-xl p-4 mb-3" style={{
              background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)',
            }} data-testid="pack-generator">
              <div className="flex items-center gap-2 mb-1">
                <Wand2 size={14} style={{ color: '#C084FC' }} />
                <span className="text-xs font-semibold" style={{ color: '#F8FAFC' }}>Synthesis Forge</span>
              </div>
              <p className="text-[8px] mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Enter your niche. The AI sweeps global standards, builds the curriculum, assessment engine, and brokerage tags.
              </p>

              <div className="space-y-2 mb-3">
                <input type="text" value={genField} onChange={e => setGenField(e.target.value)}
                  placeholder="Niche field (e.g., Advanced Phonics for Vocal Resonance, E-Bike Thermal Management)"
                  className="w-full text-[10px] px-3 py-2.5 rounded-lg outline-none"
                  style={{ background: 'rgba(255,255,255,0.03)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.05)' }}
                  data-testid="gen-field-input" />
                <textarea value={genExpertise} onChange={e => setGenExpertise(e.target.value)}
                  placeholder="Your expertise & what the pack should teach (the AI uses this as the knowledge seed)..."
                  rows={3} className="w-full text-[10px] px-3 py-2 rounded-lg outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.03)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.05)' }}
                  data-testid="gen-expertise-input" />
                <div className="flex gap-1.5">
                  {['mini', 'mastery', 'business'].map(t => {
                    const labels = { mini: 'Mini ($87–177)', mastery: 'Deep-Dive ($447–897)', business: 'Biz-in-a-Box ($1,347+)' };
                    const colors = { mini: '#818CF8', mastery: '#22C55E', business: '#FBBF24' };
                    return (
                      <button key={t} onClick={() => setGenType(t)}
                        className="flex-1 text-[8px] py-1.5 rounded-lg font-medium transition-all"
                        style={{
                          background: genType === t ? `${colors[t]}0A` : 'rgba(255,255,255,0.015)',
                          color: genType === t ? colors[t] : 'rgba(255,255,255,0.65)',
                          border: `1px solid ${genType === t ? `${colors[t]}18` : 'rgba(255,255,255,0.03)'}`,
                          cursor: 'pointer',
                        }} data-testid={`gen-type-${t}`}>{labels[t]}</button>
                    );
                  })}
                </div>
              </div>

              <button onClick={handleGeneratePack} disabled={generating || !genField.trim() || !genExpertise.trim()}
                className="w-full py-2.5 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1.5"
                style={{
                  background: 'rgba(192,132,252,0.1)', color: '#C084FC',
                  border: '1px solid rgba(192,132,252,0.18)',
                  cursor: generating ? 'wait' : 'pointer',
                  opacity: (generating || !genField.trim() || !genExpertise.trim()) ? 0.5 : 1,
                }} data-testid="gen-submit-btn">
                {generating ? <><Loader2 size={12} className="animate-spin" /> Synthesizing Curriculum...</> : <><Wand2 size={12} /> Generate Pack</>}
              </button>
            </div>

            {/* Step 2-4: Result with Financials + Publish */}
            <AnimatePresence>
              {genResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {/* Curriculum Output */}
                  <div className="rounded-xl p-4 mb-3" style={{
                    background: 'rgba(192,132,252,0.03)', border: '1px solid rgba(192,132,252,0.1)',
                  }} data-testid="gen-result">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={12} style={{ color: '#C084FC' }} />
                        <span className="text-[10px] font-semibold" style={{ color: '#C084FC' }}>Generated Curriculum</span>
                      </div>
                      <button onClick={() => setGenResult(null)} className="p-1" style={{ cursor: 'pointer' }}>
                        <X size={10} style={{ color: 'rgba(255,255,255,0.65)' }} />
                      </button>
                    </div>
                    <div className="text-[9px] leading-relaxed whitespace-pre-wrap rounded-lg p-3" style={{
                      color: 'rgba(255,255,255,0.75)', background: 'rgba(0,0,0,0.2)', maxHeight: 300, overflowY: 'auto',
                    }}>
                      {genResult.outline}
                    </div>
                  </div>

                  {/* Financials Dashboard */}
                  {genResult.financials && (
                    <div className="rounded-xl p-4 mb-3" style={{
                      background: 'rgba(251,191,36,0.03)', border: '1px solid rgba(251,191,36,0.08)',
                    }} data-testid="gen-financials">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Award size={12} style={{ color: '#FBBF24' }} />
                        <span className="text-[10px] font-semibold" style={{ color: '#FBBF24' }}>Financial Projections</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {[
                          { label: 'Retail Price', value: `$${genResult.financials.suggested_retail}`, color: '#F8FAFC' },
                          { label: 'Your Revenue/Sale', value: `$${genResult.financials.creator_revenue_per_sale}`, color: '#22C55E' },
                          { label: 'Monthly Projection', value: `$${genResult.financials.projected_monthly_revenue}`, color: '#FBBF24' },
                        ].map(s => (
                          <div key={s.label} className="rounded-lg p-2 text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <div className="text-sm font-bold" style={{ color: s.color }}>{s.value}</div>
                            <div className="text-[7px] uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1 text-[8px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        <div className="flex justify-between"><span>Resonance subscriber price</span><span style={{ color: '#818CF8' }}>${genResult.financials.resonance_discount}</span></div>
                        <div className="flex justify-between"><span>Sovereign subscriber price</span><span style={{ color: '#FBBF24' }}>${genResult.financials.sovereign_discount}</span></div>
                        <div className="flex justify-between"><span>27% Master commission</span><span style={{ color: '#22C55E' }}>${genResult.financials.commission_27_pct}</span></div>
                        <div className="flex justify-between"><span>Projected monthly sales</span><span>{genResult.financials.projected_monthly_sales} units</span></div>
                        <div className="flex justify-between"><span>Active ecosystem users</span><span>{genResult.financials.active_users_in_ecosystem}</span></div>
                      </div>
                    </div>
                  )}

                  {/* Publish Gate */}
                  <div className="rounded-xl p-4 mb-3" style={{
                    background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.08)',
                  }} data-testid="gen-publish">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ArrowRight size={12} style={{ color: '#22C55E' }} />
                      <span className="text-[10px] font-semibold" style={{ color: '#22C55E' }}>Publishing Gate</span>
                    </div>
                    <p className="text-[8px] mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      One click deploys this pack to the Trade Circle Marketplace. Commission metadata (27%) is auto-tagged. Buyers can purchase a la carte without a subscription.
                    </p>
                    <button onClick={async () => {
                      try {
                        const res = await fetch(`${API}/api/copilot/publish-pack/${genResult.draft_id}`, {
                          method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json' },
                        });
                        const data = await res.json();
                        if (data.status === 'published') {
                          setGenResult(prev => ({ ...prev, published: true, pack_id: data.pack_id }));
                          fetchDrafts();
                        }
                      } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
                    }}
                      disabled={genResult.published}
                      className="w-full py-2 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1.5"
                      style={{
                        background: genResult.published ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.1)',
                        color: '#22C55E',
                        border: '1px solid rgba(34,197,94,0.15)',
                        cursor: genResult.published ? 'default' : 'pointer',
                      }} data-testid="gen-publish-btn">
                      {genResult.published ? <><Check size={12} /> Published to Trade Circle</> : <><ArrowRight size={12} /> Deploy to Marketplace</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Previous Drafts */}
            {drafts.length > 0 && (
              <div>
                <div className="text-[8px] uppercase tracking-[2px] mb-2" style={{ color: 'rgba(248,250,252,0.18)' }}>
                  Your Forge History
                </div>
                <div className="space-y-1.5">
                  {drafts.map(d => {
                    const statusColors = { draft: '#818CF8', published: '#22C55E' };
                    return (
                      <div key={d.id} className="rounded-lg px-3 py-2" style={{
                        background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)',
                      }} data-testid={`draft-${d.id}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium" style={{ color: '#F8FAFC' }}>{d.field}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[7px] capitalize px-1.5 py-0.5 rounded" style={{
                              background: `${statusColors[d.status] || '#818CF8'}08`,
                              color: statusColors[d.status] || '#818CF8',
                            }}>{d.status}</span>
                            <span className="text-[7px] capitalize px-1.5 py-0.5 rounded" style={{
                              background: 'rgba(192,132,252,0.06)', color: '#C084FC',
                            }}>{d.pack_type}</span>
                          </div>
                        </div>
                        {d.financials && (
                          <div className="flex gap-3 mt-1 text-[7px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            <span>Retail: ${d.financials.suggested_retail}</span>
                            <span>Revenue/sale: ${d.financials.creator_revenue_per_sale}</span>
                          </div>
                        )}
                        <div className="text-[7px] mt-0.5" style={{ color: 'rgba(248,250,252,0.15)' }}>
                          {new Date(d.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
