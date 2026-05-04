import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, Check, Sparkles, Crown, Zap, Star, Shield,
  CreditCard, Plus, ChevronRight, Loader2, X, Award, Gem, Rocket
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TIER_ICONS = {
  free: Sparkles,
  starter: Zap,
  plus: Star,
  premium: Crown,
  super_user: Gem,
};

const TIER_COLORS = {
  free: '#94A3B8',
  starter: '#2DD4BF',
  plus: '#818CF8',
  premium: '#C084FC',
  super_user: '#EAB308',
};

const TIER_GRADIENTS = {
  free: 'rgba(148,163,184,0.06)',
  starter: 'rgba(45,212,191,0.06)',
  plus: 'rgba(129,140,248,0.06)',
  premium: 'rgba(192,132,252,0.06)',
  super_user: 'rgba(234,179,8,0.06)',
};

export default function Pricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tiers, setTiers] = useState({});
  const [creditPacks, setCreditPacks] = useState({});
  const [aiCosts, setAiCosts] = useState({});
  const [tierOrder, setTierOrder] = useState([]);
  const [myPlan, setMyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [showCredits, setShowCredits] = useState(false);
  const [polling, setPolling] = useState(false);

  const token = localStorage.getItem('zen_token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchData = useCallback(async () => {
    try {
      const [tiersRes, planRes] = await Promise.all([
        axios.get(`${API}/subscriptions/tiers`),
        token ? axios.get(`${API}/subscriptions/my-plan`, { headers: authHeaders }) : null,
      ]);
      setTiers(tiersRes.data.tiers);
      setCreditPacks(tiersRes.data.credit_packs);
      setAiCosts(tiersRes.data.ai_costs);
      setTierOrder(tiersRes.data.tier_order);
      if (planRes) setMyPlan(planRes.data);
    } catch (err) {
      toast.error('Failed to load pricing');
    }
    setLoading(false);
  }, [token]);

  // Poll for payment completion
  const pollStatus = useCallback(async (sessionId, type, attempts = 0) => {
    if (attempts >= 8) {
      setPolling(false);
      toast.error('Payment status check timed out. Please refresh the page.');
      return;
    }

    try {
      const res = await axios.get(`${API}/subscriptions/checkout-status/${sessionId}`, { headers: authHeaders });
      if (res.data.payment_status === 'paid') {
        setPolling(false);
        if (type === 'subscription') {
          toast.success(`Upgraded to ${res.data.tier}! Welcome to the next level.`);
        } else {
          toast.success(`${res.data.credits_added} credits added to your balance!`);
        }
        fetchData();
        // Clean URL
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
  }, [authHeaders, fetchData]);

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
      const res = await axios.post(`${API}/subscriptions/checkout`, {
        tier_id: tierId,
        origin_url: window.location.origin,
      }, { headers: authHeaders });
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start checkout');
      setPurchasing(null);
    }
  };

  const handleBuyCredits = async (packId) => {
    if (!token) { navigate('/auth'); return; }
    setPurchasing(packId);
    try {
      const res = await axios.post(`${API}/subscriptions/checkout-credits`, {
        pack_id: packId,
        origin_url: window.location.origin,
      }, { headers: authHeaders });
      window.location.href = res.data.url;
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
  const isTrialUser = myPlan?.trial?.active;
  const highlightTier = searchParams.get('highlight');
  const fromTrial = searchParams.get('from') === 'trial';

  return (
    <div className="min-h-screen pb-40" style={{ background: 'var(--bg-primary)' }}>
      {/* Polling overlay */}
      <AnimatePresence>
        {polling && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center"
            style={{ background: 'transparent', backdropFilter: 'none'}}
            data-testid="payment-polling-overlay">
            <div className="text-center">
              <Loader2 className="animate-spin mx-auto mb-4" size={32} style={{ color: '#C084FC' }} />
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Processing your payment...</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>This may take a moment</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-4 pt-4 pb-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg transition-all hover:bg-white/5"
            data-testid="pricing-back-btn">
            <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Choose Your Path
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Unlock the full cosmic experience</p>
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
              style={{ background: `${TIER_COLORS[myPlan.tier]}12`, color: TIER_COLORS[myPlan.tier], border: `1px solid ${TIER_COLORS[myPlan.tier]}25` }}>
              {(() => { const Icon = TIER_ICONS[myPlan.tier]; return <Icon size={12} />; })()}
              {myPlan.tier_name} Plan
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
              style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-secondary)', border: '1px solid rgba(248,250,252,0.06)' }}>
              <CreditCard size={12} />
              {myPlan.is_admin || (myPlan.credits_per_month === -1 && myPlan.subscription_active) ? 'Unlimited' : `${myPlan.balance} credits`}
            </div>
          </div>
        )}

        {/* Trial Upgrade Banner */}
        {isTrialUser && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl p-4"
            style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.08), rgba(192,132,252,0.06))', border: '1px solid rgba(129,140,248,0.15)' }}
            data-testid="trial-upgrade-banner">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(129,140,248,0.12)' }}>
                <Rocket size={18} style={{ color: '#818CF8' }} />
              </div>
              <div>
                <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  You're on a free Plus trial — {myPlan.trial.days_left} day{myPlan.trial.days_left !== 1 ? 's' : ''} left
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Lock in your Plus access now so you don't lose AI Frequency Blends, Translation, and your 300 monthly credits when the trial ends.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Subscription Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
          {tierOrder.map((id, idx) => {
            const tier = tiers[id];
            if (!tier) return null;
            const Icon = TIER_ICONS[id];
            const color = TIER_COLORS[id];
            const isCurrent = myPlan?.tier === id;
            const isUpgrade = idx > currentTierIdx;
            const isPopular = id === 'premium';
            const isTrialHighlight = (fromTrial || highlightTier === id) && id === 'plus' && isTrialUser;

            return (
              <motion.div key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`relative rounded-xl overflow-hidden transition-all ${isPopular || isTrialHighlight ? 'ring-1' : ''}`}
                style={{
                  background: TIER_GRADIENTS[id],
                  border: `1px solid ${color}${isPopular || isTrialHighlight ? '40' : '15'}`,
                  ...(isPopular || isTrialHighlight ? { ringColor: `${color}30`, boxShadow: isTrialHighlight ? `0 0 24px ${color}15` : undefined } : {}),
                }}
                data-testid={`tier-card-${id}`}>

                {isTrialHighlight && (
                  <div className="absolute top-0 left-0 right-0 py-1 text-center text-[8px] uppercase tracking-widest font-bold"
                    style={{ background: `${color}20`, color }}>
                    Keep Your Trial Features
                  </div>
                )}

                {isPopular && !isTrialHighlight && (
                  <div className="absolute top-0 left-0 right-0 py-1 text-center text-[8px] uppercase tracking-widest font-bold"
                    style={{ background: `${color}15`, color }}>
                    Most Popular
                  </div>
                )}

                <div className={`p-4 ${isPopular || isTrialHighlight ? 'pt-7' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tier.name}</p>
                      <p className="text-lg font-light" style={{ color, fontFamily: 'Cormorant Garamond, serif' }}>
                        {tier.price === 0 ? 'Free' : `$${tier.price}`}
                        {tier.price > 0 && <span className="text-[10px]" style={{ color: 'var(--text-mute