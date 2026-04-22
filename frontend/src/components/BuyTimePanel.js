import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Shield, Loader2, ExternalLink, Coins } from 'lucide-react';
import { TIERS, setLocalTierFromServer } from '../kernel/SovereignTiers';
import LabAudio from '../kernel/LabAudio';
import useIsAndroidTWA from '../hooks/useIsAndroidTWA';

/**
 * BuyTimePanel — Gilded Path tier unlock via the existing AI Merchant.
 *
 * This panel does NOT open Stripe directly. Stripe is used upstream to
 * buy Resonance Credits (via /trade-circle/broker/buy-credits). Here,
 * we spend those Credits inside the closed-loop economy through the
 * canonical storefront at /api/trade-circle/ai-merchant/buy. This is
 * the same endpoint every other in-app purchase (Dust, Gems, Starseed
 * components) already uses — zero duplication.
 *
 * Flow:
 *   1. On mount: fetch /ai-merchant to get catalog, current Credit
 *      balance, and current gilded_tier (so we can block downgrades).
 *   2. User picks a tier → POST /ai-merchant/buy { item_id, quantity:1 }.
 *   3. Backend atomically deducts credits, flips users.gilded_tier,
 *      writes merchant_transactions row, returns new balance.
 *   4. We mirror gilded_tier into localStorage (sovereign:tier event).
 *
 * On Android TWA (Google Play): the entire flow stays in the APK
 * because no Stripe call fires here — Credits were already in the
 * user's balance. Fully compliant. If the user's balance is too low
 * we surface a "Top up on web" CTA that opens enlighten-mint-cafe.me
 * in a Chrome Custom Tab, never a Play Billing violation.
 */

const API = process.env.REACT_APP_BACKEND_URL + '/api';
const WEB_TOPUP_URL = 'https://enlighten-mint-cafe.me/economy?from=android';

// UI tier.id ("seed", "artisan", ...) → AI Merchant catalog item_id
const ITEM_ID_FOR_TIER = {
  seed: 'gilded_path_seed',
  artisan: 'gilded_path_artisan',
  sovereign: 'gilded_path_sovereign',
  gilded: 'gilded_path_gilded',
};

function authHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function BuyTimePanel({ open, onClose }) {
  const isTWA = useIsAndroidTWA();
  const [credits, setCredits] = useState(null);
  const [currentTier, setCurrentTier] = useState(null);
  const [catalog, setCatalog] = useState([]);   // raw AI merchant items
  const [tierOrder, setTierOrder] = useState({ seed: 1, artisan: 2, sovereign: 3, gilded: 4 });
  const [busyTier, setBusyTier] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [justPurchased, setJustPurchased] = useState(null);

  // Hydrate merchant state on open.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API}/trade-circle/ai-merchant`, { headers: authHeader(), timeout: 10000 });
        if (cancelled) return;
        setCredits(res.data?.your_credits ?? 0);
        setCurrentTier(res.data?.your_gilded_tier || null);
        setCatalog(res.data?.catalog || []);
        if (res.data?.gilded_tier_order) setTierOrder(res.data.gilded_tier_order);
      } catch (err) {
        if (!cancelled) setStatusMsg('Could not reach the AI Merchant. Try again in a moment.');
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  // Map catalog items back onto the display TIERS array so we can show
  // the actual credit price pulled from the server.
  const tierItems = useMemo(() => {
    return TIERS.map(t => {
      const itemId = ITEM_ID_FOR_TIER[t.id];
      const item = catalog.find(i => i.id === itemId);
      return {
        ...t,
        price_credits: item?.price_credits,
        tier_rank: item?.tier_rank,
        item_id: itemId,
        available: !!item,
      };
    });
  }, [catalog]);

  const currentRank = currentTier ? (tierOrder[currentTier] || 0) : 0;

  const buy = useCallback(async (t) => {
    if (busyTier || !t.item_id) return;
    if (credits !== null && t.price_credits !== undefined && credits < t.price_credits) {
      setStatusMsg(`Need ${t.price_credits} Credits. You have ${credits}. Top up first.`);
      return;
    }
    if (t.tier_rank && currentRank >= t.tier_rank) {
      setStatusMsg(`You already hold the '${currentTier}' tier.`);
      return;
    }
    setBusyTier(t.id);
    setStatusMsg('Consulting the Merchant…');
    try {
      const res = await axios.post(
        `${API}/trade-circle/ai-merchant/buy`,
        { item_id: t.item_id, quantity: 1 },
        { headers: authHeader(), timeout: 15000 },
      );
      const { remaining_credits, delivered } = res.data || {};
      const grantedTier = delivered?.tier_id || t.id;
      setLocalTierFromServer(grantedTier, 'ai_merchant');
      setCurrentTier(grantedTier);
      setCredits(remaining_credits ?? credits);
      setJustPurchased(grantedTier);
      setStatusMsg(null);
      LabAudio.playGilded && LabAudio.playGilded();
      setTimeout(() => setJustPurchased(null), 2200);
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.message || 'Purchase failed';
      setStatusMsg(detail);
    } finally {
      setBusyTier(null);
    }
  }, [busyTier, credits, currentRank, currentTier]);

  const headline = useMemo(() => (
    isTWA
      ? 'Manage your Credits on the web.'
      : 'Spend earned Credits for one-time tier access.'
  ), [isTWA]);

  if (!open || typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(4,6,15,0.94)', backdropFilter: 'blur(18px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
        data-testid="buy-time-panel"
      >
        <motion.div
          initial={{ y: 30 }} animate={{ y: 0 }} exit={{ y: 30 }}
          className="relative rounded-2xl max-w-3xl w-full p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(22,18,10,0.95), rgba(10,8,14,0.95))',
            border: '1px solid rgba(251,191,36,0.25)',
            boxShadow: '0 40px 120px rgba(251,191,36,0.12)',
          }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5" data-testid="buy-time-close">
            <X size={18} style={{ color: '#cbd5e1' }} />
          </button>

          <div className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <Crown size={14} style={{ color: '#FBBF24' }} />
              <p className="text-[10px] uppercase tracking-[0.36em] sov-telemetry" style={{ color: '#FBBF24' }}>
                Gilded Path · Marketplace Access
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.22)' }}>
              <Coins size={12} style={{ color: '#FCD34D' }} />
              <span className="text-[11px] sov-telemetry" style={{ color: '#FCD34D', letterSpacing: '0.14em' }} data-testid="buy-time-credits-balance">
                {credits === null ? '—' : credits} CREDITS
              </span>
            </div>
          </div>
          <h2 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
            {headline}
          </h2>
          <p className="text-sm mt-1 mb-5" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif', fontSize: 16 }}>
            Tiers are one-time unlocks paid in Resonance Credits you earned
            or acquired from the Cosmic Broker. Non-recurring. Not
            redeemable for cash. The 528 Hz Resonance Click stays exclusive
            to earned mastery.
          </p>

          {isTWA ? (
            <TWAGateCard />
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {tierItems.map(t => {
                const active = currentTier === t.id;
                const owned = t.tier_rank && currentRank >= t.tier_rank;
                const busy = busyTier === t.id;
                const afford = credits !== null && t.price_credits !== undefined
                  ? credits >= t.price_credits
                  : true;
                const disabled = !!busyTier || owned || !afford || !t.available;
                return (
                  <motion.button
                    key={t.id}
                    whileHover={disabled ? {} : { y: -3 }}
                    whileTap={disabled ? {} : { scale: 0.97 }}
                    onClick={() => buy(t)}
                    disabled={disabled}
                    data-testid={`tier-${t.id}`}
                    className="rounded-xl px-4 py-4 text-left relative overflow-hidden disabled:opacity-55"
                    style={{
                      background: active ? `${t.color}1f` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${active ? t.color + '88' : t.color + '44'}`,
                      boxShadow: active ? `0 0 28px ${t.color}44` : 'none',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.28em] sov-telemetry" style={{ color: t.color }}>
                      {t.label}
                    </p>
                    <p className="text-[11px] mt-1 sov-telemetry" style={{ color: '#FCD34D', letterSpacing: '0.12em' }}>
                      {t.price_credits !== undefined ? `${t.price_credits} ✦ CREDITS` : t.price}
                    </p>
                    <p className="text-[13px] mt-2" style={{ color: '#e2e8f0', fontFamily: 'Cormorant Garamond, serif', fontSize: 15, lineHeight: 1.4 }}>
                      {t.blurb}
                    </p>
                    {owned && (
                      <p className="text-[9px] uppercase tracking-[0.2em] mt-2 sov-telemetry" style={{ color: '#FCD34D' }}>
                        {active ? 'Active · Gilded' : 'Covered by higher tier'}
                      </p>
                    )}
                    {!afford && !owned && credits !== null && (
                      <p className="text-[9px] uppercase tracking-[0.2em] mt-2 sov-telemetry" style={{ color: '#F87171' }}>
                        Need {(t.price_credits ?? 0) - credits} more
                      </p>
                    )}
                    {busy && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(4,6,15,0.72)' }}>
                        <Loader2 size={20} className="animate-spin" style={{ color: t.color }} />
                      </div>
                    )}
                    {justPurchased === t.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: `${t.color}cc`, color: '#fff', fontFamily: 'Cormorant Garamond, serif', fontSize: 22 }}
                        data-testid={`tier-${t.id}-granted`}
                      >
                        Gilded
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {statusMsg && (
            <p
              className="text-[11px] mt-4"
              data-testid="buy-time-status"
              style={{ color: '#FCD34D', fontFamily: 'monospace', letterSpacing: '0.08em' }}
            >
              {statusMsg}
            </p>
          )}

          <div className="flex items-center gap-2 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Shield size={12} style={{ color: 'var(--text-muted)' }} />
            <p className="text-[10px] uppercase tracking-[0.22em] sov-telemetry" style={{ color: 'var(--text-muted)' }}>
              Closed-loop purchase · Credits earned or broker-purchased · Ledger: merchant_transactions
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

/**
 * Android-TWA presentation — renders a single CTA that opens the web
 * economy page in the user's default browser (Chrome Custom Tab).
 * Policy-safe: no Stripe call ever fires inside the APK.
 */
function TWAGateCard() {
  return (
    <a
      href={WEB_TOPUP_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="buy-time-twa-gate"
      className="flex items-center justify-center gap-3 rounded-xl px-5 py-6 w-full"
      style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(192,132,252,0.12))',
        border: '1px solid rgba(251,191,36,0.38)',
        color: '#FCD34D',
        fontFamily: 'monospace',
        fontSize: 13,
        letterSpacing: '0.16em',
        textDecoration: 'none',
      }}
    >
      <ExternalLink size={18} />
      MANAGE CREDITS ON WEB · ENLIGHTEN-MINT-CAFE.ME
    </a>
  );
}
