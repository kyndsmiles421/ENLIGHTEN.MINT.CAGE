import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, Check, Sparkles, Crown, Zap, Star, Shield,
  CreditCard, ChevronRight, Loader2, Award, Gem, Lock, ArrowRight,
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ═══════════════════════════════════════════════════════════
// SOVEREIGN TIER VISUAL MAP — canonical 5 tiers from /api/economy/tiers
// ═══════════════════════════════════════════════════════════
const TIER_ICONS = {
  discovery: Sparkles,        // Seeker — Entry
  resonance: Zap,             // Artisan — Creator (5% off)
  architect: Star,            // Architect — Builder (15% off)
  sovereign: Crown,           // Sovereign Monthly — Apex ($89, 30% off)
  sovereign_founder: Award,   // Sovereign Founder — 2yr Lock ($1,777, 60% off)
};

const TIER_COLORS = {
  discovery: '#94A3B8',
  resonance: '#818CF8',
  architect: '#2DD4BF',
  sovereign: '#FBBF24',
  sovereign_founder: '#FCD34D',
};

const TIER_GRADIENTS = {
  discovery: 'rgba(148,163,184,0.06)',
  resonance: 'rgba(129,140,248,0.06)',
  architect: 'rgba(45,212,191,0.06)',
  sovereign: 'rgba(251,191,36,0.06)',
  sovereign_founder: 'rgba(252,211,77,0.10)',
};

// ═══════════════════════════════════════════════════════════
// Platform detection — Capacitor/Android shell vs Web Direct
// ═══════════════════════════════════════════════════════════
function detectPlatform() {
  try {
    if (typeof window === 'undefined') return 'web';
    if (window.Capacitor?.isNativePlatform?.()) return 'play_store';
    if (/Android.*Capacitor/i.test(navigator.userAgent || '')) return 'play_store';
    return 'web';
  } catch { return 'web'; }
}

// ═══════════════════════════════════════════════════════════
// TRANSPARENCY GRAPH — shows 30% Google Play markup vs Web Direct
// ═══════════════════════════════════════════════════════════
function TransparencyGraph({ tier, platformFees }) {
  if (!tier) return null;
  const isFounder = tier.is_founder;
  const web = isFounder ? tier.price_total : tier.price_monthly;
  const play = tier.price_play_store ?? web * 1.30;
  const markup = play - web;
  const savePct = Math.round((markup / play) * 100);
  const monthlyEq = isFounder ? tier.price_monthly_equivalent : tier.price_monthly;
  const monthlyPlayEq = isFounder ? (tier.price_play_store / (tier.term_months || 24)) : tier.price_play_store;

  // Bar widths — web at 100% of web price, play at proportional total
  const playPctWidth = Math.min(100, (play / play) * 100); // 100%
  const webPctWidth = (web / play) * 100;
  const feePctWidth = (markup / play) * 100;

  return (
    <div className="mb-8 rounded-xl overflow-hidden"
      style={{ background: 'rgba(252,211,77,0.04)', border: '1px solid rgba(252,211,77,0.18)' }}
      data-testid="transparency-graph">
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(252,211,77,0.10)' }}>
        <div className="flex items-center gap-2">
          <Shield size={14} style={{ color: '#FCD34D' }} />
          <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: '#FCD34D' }}>
            Why The Price Is The Price
          </p>
        </div>
        <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {tier.name}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* WEB DIRECT bar */}
        <div data-testid="bar-web-direct">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#86EFAC' }}>
              {platformFees?.label_web || 'Sovereign Web Direct'}
            </p>
            <p className="text-xs font-mono font-bold" style={{ color: '#86EFAC' }}>
              ${web.toFixed(2)}{isFounder ? '' : '/mo'}
            </p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${webPctWidth}%` }} transition={{ duration: 0.8, delay: 0.1 }}
              className="h-full" style={{ background: 'linear-gradient(90deg, #86EFAC, #2DD4BF)' }} />
          </div>
        </div>

        {/* PLAY STORE bar (web base + fee stacked) */}
        <div data-testid="bar-play-store">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#FB923C' }}>
              {platformFees?.label_play || 'Google Play Platform Fee'}
            </p>
            <p className="text-xs font-mono font-bold" style={{ color: '#FB923C' }}>
              ${play.toFixed(2)}{isFounder ? '' : '/mo'}
            </p>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${webPctWidth}%` }} transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full" style={{ background: '#2DD4BF' }} />
            <motion.div initial={{ width: 0 }} animate={{ width: `${feePctWidth}%` }} transition={{ duration: 0.8, delay: 0.4 }}
              className="h-full" style={{ background: 'repeating-linear-gradient(45deg, #FB923C, #FB923C 4px, #EA580C 4px, #EA580C 8px)' }} />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
              ${web.toFixed(0)} dev support
            </span>
            <span className="text-[9px]" style={{ color: '#FB923C' }}>
              + ${markup.toFixed(2)} platform fee ({platformFees?.google_play_pct || 30}%)
            </span>
          </div>
        </div>

        {/* Savings line */}
        <div className="rounded-lg p-3"
          style={{ background: 'rgba(134,239,172,0.06)', border: '1px solid rgba(134,239,172,0.15)' }}
          data-testid="savings-line">
          <div className="flex items-start gap-2">
            <ArrowRight size={12} className="mt-0.5 flex-shrink-0" style={{ color: '#86EFAC' }} />
            <div>
              <p className="text-[11px] font-medium" style={{ color: '#86EFAC' }}>
                You save ${markup.toFixed(2)}{isFounder ? '' : '/mo'} ({savePct}%) by subscribing via Web Direct
              </p>
              {isFounder && (
                <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  ${monthlyEq?.toFixed(2)}/mo equivalent vs ${monthlyPlayEq?.toFixed(2)}/mo on Play Store · 24-month lock-in · paid once · no renewal trap
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN PRICING PAGE
// ═══════════════════════════════════════════════════════════
export default function Pricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tiers, setTiers] = useState({});
  const [creditPacks, setCreditPacks] = useState({});
  const [aiCosts, setAiCosts] = useState({});
  const [tierOrder, setTierOrder] = useState([]);
  const [platformFees, setPlatformFees] = useState(null);
  const [myPlan, setMyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [showCredits, setShowCredits] = useState(false);
  const [polling, setPolling] = useState(false);

  const platform = useMemo(() => detectPlatform(), []);
  const token = localStorage.getItem('zen_token') || localStorage.getItem('token');
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchData = useCallback(async () => {
    try {
      const [tiersRes, planRes] = await Promise.all([
        axios.get(`${API}/economy/tiers`),
        token ? axios.get(`${API}/economy/my-plan`, { headers: authHeaders }) : Promise.resolve(null),
      ]);
      setTiers(tiersRes.data.tiers || {});
      setCreditPacks(tiersRes.data.credit_packs || {});
      setAiCosts(tiersRes.data.ai_costs || {});
      setTierOrder(tiersRes.data.tier_order || []);
      setPlatformFees(tiersRes.data.platform_fees || null);
      if (planRes) setMyPlan(planRes.data);
    } catch (err) {
      toast.error('Failed to load pricing');
    }
    setLoading(false);
  }, [token, authHeaders]);

  // Poll for payment completion
  const pollStatus = useCallback(async (sessionId, type, attempts = 0) => {
    if (attempts >= 8) {
      setPolling(false);
      toast.error('Payment status check timed out. Please refresh the page.');
      return;
    }
    try {
      const res = await axios.get(`${API}/economy/checkout-status/${sessionId}`, { headers: authHeaders });
      if (res.data.payment_status === 'paid') {
        setPolling(false);
        toast.success(`Activated ${res.data.tier || 'subscription'}!`);
        fetchData();
        // V1.1.5 — Sovereign Bridge: if a ClimbLadderPill stashed a
        // pending unlock target before redirecting to Stripe, route
        // the user back there now so the 3D unfold animation fires
        // on the originating surface (vault relic, hub pillar, etc.).
        try {
          const pendingRaw = localStorage.getItem('sov_pending_unlock');
          if (pendingRaw) {
            const pending = JSON.parse(pendingRaw);
            localStorage.removeItem('sov_pending_unlock');
            // Stale markers (>30 min) are ignored — likely a stranded
            // session, do not surprise the user with a random unfold.
            if (pending && Date.now() - (pending.ts || 0) < 30 * 60 * 1000) {
              if (pending.kind === 'vault' && pending.relic_id) {
                navigate(`/vault?just_claimed=${encodeURIComponent(pending.relic_id)}`, { replace: true });
                return;
              }
            }
          }
        } catch {}
        window.history.replaceState({}, '', '/pricing');
        return;
      }
      if (res.data.status === 'expired') {
        setPolling(false);
        toast.error('Payment session expired.');
        window.history.replaceState({}, '', '/pricing');
        return;
      }
      setTimeout(() => pollStatus(sessionId, type, attempts + 1), 2500);
    } catch {
      setTimeout(() => pollStatus(sessionId, type, attempts + 1), 2500);
    }
  }, [authHeaders, fetchData, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const type = searchParams.get('type');
    if (sessionId && token) {
      setPolling(true);
      pollStatus(sessionId, type || 'subscription');
    }
  }, [searchParams, token, pollStatus]);

  const handleSubscribe = async (tierId) => {
    if (!token) { navigate('/auth'); return; }
    setPurchasing(tierId);
    try {
      const res = await axios.post(`${API}/economy/subscribe`, {
        tier_id: tierId,
        origin_url: window.location.origin,
        platform, // 'web' or 'play_store' — backend applies +30% gross-up if play_store
      }, { headers: authHeaders });
      if (res.data.url) {
        window.location.href = res.data.url;
      } else if (res.data.status === 'activated') {
        toast.success('Activated');
        fetchData();
        setPurchasing(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start checkout');
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={24} style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  const currentTierIdx = myPlan ? tierOrder.indexOf(myPlan.tier) : 0;
  const founderTier = tiers.sovereign_founder;
  const monthlyTier = tiers.sovereign;
  const featuredTier = founderTier || monthlyTier;

  const tierPriceLabel = (tier) => {
    if (!tier) return '';
    if (tier.is_founder) return `$${tier.price_total?.toFixed(0)}`;
    if (!tier.price_monthly || tier.price_monthly === 0) return 'Free';
    return `$${tier.price_monthly?.toFixed(0)}`;
  };

  const tierPriceSuffix = (tier) => {
    if (!tier) return '';
    if (tier.is_founder) return ` / ${tier.term_months}mo`;
    if (!tier.price_monthly || tier.price_monthly === 0) return '';
    return '/mo';
  };

  return (
    <div className="min-h-screen pb-40" style={{ background: 'var(--bg-primary)' }}>
      {/* Polling overlay */}
      <AnimatePresence>
        {polling && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center"
            style={{ background: 'transparent' }}
            data-testid="payment-polling-overlay">
            <div className="text-center">
              <Loader2 className="animate-spin mx-auto mb-4" size={32} style={{ color: '#C084FC' }} />
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Processing your payment...</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>This may take a moment</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 pt-4 pb-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg transition-all hover:bg-white/5"
            data-testid="pricing-back-btn">
            <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Sovereign Tiers
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Discount Power for Dust upgrades · Sparks (XP) trade peer-to-peer · No refunds
            </p>
          </div>
        </div>

        {/* Current plan badge */}
        {myPlan && (
          <div className="mb-6 flex items-center gap-3 flex-wrap" data-testid="current-plan-badge">
            {myPlan.is_admin && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                style={{ background: 'rgba(234,179,8,0.12)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.25)' }}>
                <Shield size={12} /> Creator / Admin
              </div>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{ background: `${TIER_COLORS[myPlan.tier] || '#94A3B8'}12`, color: TIER_COLORS[myPlan.tier] || '#94A3B8', border: `1px solid ${TIER_COLORS[myPlan.tier] || '#94A3B8'}25` }}>
              {(() => { const Icon = TIER_ICONS[myPlan.tier] || Sparkles; return <Icon size={12} />; })()}
              {myPlan.tier_name}
            </div>
            {myPlan.is_founder && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                style={{ background: 'rgba(252,211,77,0.10)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.25)' }}>
                <Award size={12} /> 2-Year Founder
              </div>
            )}
          </div>
        )}

        {/* Featured Founder hero */}
        {founderTier && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(252,211,77,0.10), rgba(251,191,36,0.06))', border: '1px solid rgba(252,211,77,0.25)' }}
            data-testid="founder-hero">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#FCD34D' }}>
                    Apex · 2-Year Lock · 60% off
                  </p>
                  <h2 className="text-2xl font-light mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                    {founderTier.name}
                  </h2>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {founderTier.education_desc}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-light" style={{ color: '#FCD34D', fontFamily: 'Cormorant Garamond, serif' }}>
                    ${founderTier.price_total?.toFixed(0)}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    ≈ ${founderTier.price_monthly_equivalent?.toFixed(2)}/mo · {founderTier.term_months}mo lock
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
                {founderTier.features?.slice(0, 6).map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <Check size={11} className="mt-0.5 flex-shrink-0" style={{ color: '#FCD34D' }} />
                    <span className="text-[10px] leading-tight" style={{ color: 'var(--text-secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => handleSubscribe('sovereign_founder')}
                disabled={!!purchasing || myPlan?.tier === 'sovereign_founder'}
                className="w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.01]"
                style={{ background: 'linear-gradient(135deg, #FCD34D, #FBBF24)', color: '#1a1208', border: 'none' }}
                data-testid="subscribe-btn-sovereign_founder">
                {purchasing === 'sovereign_founder' ? <Loader2 size={14} className="animate-spin mx-auto" /> :
                  myPlan?.tier === 'sovereign_founder' ? 'Active · Founder Locked' : `Claim Founder · $${founderTier.price_total?.toFixed(0)} once`}
              </button>
            </div>
          </motion.div>
        )}

        {/* Transparency Graph moved to checkout flow only — not persistent on /pricing */}

        {/* Tier grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {tierOrder.filter(id => id !== 'sovereign_founder').map((id, idx) => {
            const tier = tiers[id];
            if (!tier) return null;
            const Icon = TIER_ICONS[id] || Sparkles;
            const color = TIER_COLORS[id] || '#94A3B8';
            const isCurrent = myPlan?.tier === id;
            const isUpgrade = idx > currentTierIdx;
            const isApex = id === 'sovereign';

            return (
              <motion.div key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className={`relative rounded-xl overflow-hidden transition-all ${isApex ? 'ring-1' : ''}`}
                style={{
                  background: TIER_GRADIENTS[id],
                  border: `1px solid ${color}${isApex ? '40' : '15'}`,
                }}
                data-testid={`tier-card-${id}`}>

                {isApex && (
                  <div className="absolute top-0 left-0 right-0 py-1 text-center text-[8px] uppercase tracking-widest font-bold"
                    style={{ background: `${color}15`, color }}>
                    Most Popular · 30% Off
                  </div>
                )}

                <div className={`p-4 ${isApex ? 'pt-7' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tier.name}</p>
                      <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {tier.label}
                      </p>
                    </div>
                  </div>

                  <p className="text-lg font-light mb-1" style={{ color, fontFamily: 'Cormorant Garamond, serif' }}>
                    {tierPriceLabel(tier)}<span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{tierPriceSuffix(tier)}</span>
                  </p>

                  <p className="text-[10px] mb-3 font-medium" style={{ color }}>
                    {tier.marketplace_discount}% Discount Power
                  </p>

                  <div className="space-y-1.5 mb-4">
                    {(tier.features || []).slice(0, 4).map((perk, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <Check size={10} className="mt-0.5 flex-shrink-0" style={{ color }} />
                        <span className="text-[9px] leading-tight" style={{ color: 'var(--text-secondary)' }}>{perk}</span>
                      </div>
                    ))}
                    {(tier.features || []).length > 4 && (
                      <p className="text-[8px] pl-4" style={{ color: 'var(--text-muted)' }}>+{tier.features.length - 4} more</p>
                    )}
                  </div>

                  {isCurrent ? (
                    <div className="w-full py-2 rounded-lg text-center text-[10px] font-medium uppercase tracking-wider"
                      style={{ background: `${color}08`, color, border: `1px solid ${color}20` }}>
                      Current
                    </div>
                  ) : id === 'discovery' ? (
                    <div className="w-full py-2 rounded-lg text-center text-[10px]"
                      style={{ color: 'var(--text-muted)' }}>
                      Default Entry
                    </div>
                  ) : isUpgrade ? (
                    <button onClick={() => handleSubscribe(id)}
                      disabled={!!purchasing}
                      className="w-full py-2 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-all hover:scale-[1.02]"
                      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                      data-testid={`subscribe-btn-${id}`}>
                      {purchasing === id ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Upgrade'}
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-lg text-center text-[10px]"
                      style={{ color: 'var(--text-muted)' }}>
                      Included
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Compliance / Policy block */}
        <div className="mb-10 rounded-xl p-4"
          style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.06)' }}
          data-testid="policy-block">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--text-muted)' }}>
            Sovereign Trust Policy
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-start gap-1.5">
              <Lock size={10} className="mt-0.5 flex-shrink-0" style={{ color: '#FB923C' }} />
              <span><strong style={{ color: '#FB923C' }}>No Refunds.</strong> All Dust acquisitions, tier upgrades & tool enhancements are permanent.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Gem size={10} className="mt-0.5 flex-shrink-0" style={{ color: '#86EFAC' }} />
              <span><strong style={{ color: '#86EFAC' }}>Dust = Hard Currency.</strong> Buys system-wide professional upgrades.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Sparkles size={10} className="mt-0.5 flex-shrink-0" style={{ color: '#C084FC' }} />
              <span><strong style={{ color: '#C084FC' }}>Sparks = XP, not currency.</strong> Trade Circle peer-to-peer creations.</span>
            </div>
          </div>
        </div>

        {/* Credit Packs */}
        {Object.keys(creditPacks).length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                  Credit Packs
                </h2>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Top up Dust anytime · all tiers</p>
              </div>
              <button onClick={() => setShowCredits(!showCredits)}
                className="text-[10px] px-2 py-1 rounded-lg transition-all"
                style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-secondary)', border: '1px solid rgba(248,250,252,0.06)' }}
                data-testid="toggle-credit-costs-btn">
                {showCredits ? 'Hide' : 'Show'} AI Costs
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(creditPacks).map(([id, pack], idx) => {
                const colors = ['#2DD4BF', '#818CF8', '#C084FC'];
                const color = colors[idx % colors.length];
                return (
                  <motion.div key={id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.08 }}
                    className="rounded-xl p-4 flex items-center justify-between"
                    style={{ background: `${color}06`, border: `1px solid ${color}15` }}
                    data-testid={`credit-pack-${id}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-light" style={{ color, fontFamily: 'Cormorant Garamond, serif' }}>{pack.credits}</p>
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>credits</span>
                      </div>
                      <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{pack.label}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>
                      ${pack.price?.toFixed(0)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Cost Breakdown */}
        <AnimatePresence>
          {showCredits && Object.keys(aiCosts).length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-10 overflow-hidden">
              <div className="rounded-xl p-4" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}
                data-testid="ai-cost-breakdown">
                <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--text-muted)' }}>Credit Usage Per AI Action</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(aiCosts).map(([action, cost]) => (
                    <div key={action} className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ background: 'rgba(248,250,252,0.02)' }}>
                      <span className="text-[10px] capitalize" style={{ color: 'var(--text-secondary)' }}>
                        {action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-medium" style={{ color: cost >= 10 ? '#C084FC' : cost >= 3 ? '#818CF8' : '#2DD4BF' }}>
                        {cost}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full perk comparison */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
            <h2 className="text-lg font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Full Tier Comparison
            </h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(248,250,252,0.04)' }}>
            {tierOrder.map(id => {
              const tier = tiers[id];
              if (!tier) return null;
              const color = TIER_COLORS[id] || '#94A3B8';
              const Icon = TIER_ICONS[id] || Sparkles;
              return (
                <details key={id} className="group" data-testid={`tier-details-${id}`}>
                  <summary className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-all">
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{tier.name}</span>
                      <span className="text-[10px]" style={{ color }}>
                        {tierPriceLabel(tier)}{tierPriceSuffix(tier)} · {tier.marketplace_discount}% off
                      </span>
                    </div>
                    <ChevronRight size={12} className="transition-transform group-open:rotate-90" style={{ color: 'var(--text-muted)' }} />
                  </summary>
                  <div className="px-4 pb-3 space-y-1.5">
                    {(tier.features || []).map((perk, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check size={10} className="mt-0.5 flex-shrink-0" style={{ color }} />
                        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{perk}</span>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
