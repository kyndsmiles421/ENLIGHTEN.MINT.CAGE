import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Shield, Loader2, ExternalLink } from 'lucide-react';
import { TIERS, getTier, setLocalTierFromServer } from '../kernel/SovereignTiers';
import LabAudio from '../kernel/LabAudio';
import useIsAndroidTWA from '../hooks/useIsAndroidTWA';

/**
 * BuyTimePanel — Gilded Path marketplace-service upgrade portal.
 *
 * Flow:
 *   1. User taps a tier button on web/desktop/iOS
 *   2. POST /api/purchase/one-time { tier_id, origin_url }
 *   3. Redirect to Stripe Checkout (session.url)
 *   4. On return, Arsenal mounts with ?session_id=…&type=gilded_path
 *   5. This panel, if mounted, polls GET /api/purchase/one-time/status/{id}
 *      every 2s (max 8 attempts) until payment_status === 'paid'
 *   6. On paid → setLocalTierFromServer(tier_id) → dispatches 'sovereign:tier'
 *
 * On Android TWA (Google Play), the tier buttons are replaced with a
 * <PaymentGate> banner that sends users to the web to complete checkout.
 * No Stripe call ever fires inside the APK — policy-compliant.
 */

const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';
const WEB_BUY_URL = 'https://enlighten-mint-cafe.me/arsenal?from=android';

function authHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function BuyTimePanel({ open, onClose }) {
  const [currentTier, setCurrentTier] = useState(getTier());
  const [busyTier, setBusyTier] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [justPurchased, setJustPurchased] = useState(null);
  const isTWA = useIsAndroidTWA();

  // Mirror tier changes from elsewhere in the app.
  useEffect(() => {
    const onT = () => setCurrentTier(getTier());
    window.addEventListener('sovereign:tier', onT);
    return () => window.removeEventListener('sovereign:tier', onT);
  }, []);

  // Poll after returning from Stripe. We do this regardless of open state
  // so fulfillment lands even if the user closes the panel during redirect.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const type = params.get('type');
    if (!sessionId || type !== 'gilded_path') return;

    let cancelled = false;
    let attempt = 0;
    const maxAttempts = 8;

    const clean = () => {
      // Strip the session params so a refresh doesn't re-poll.
      const url = new URL(window.location.href);
      url.searchParams.delete('session_id');
      url.searchParams.delete('type');
      window.history.replaceState({}, '', url.toString());
    };

    const poll = async () => {
      if (cancelled || attempt >= maxAttempts) {
        if (attempt >= maxAttempts) setStatusMsg('Checkout timed out — your account will update automatically once payment clears.');
        return;
      }
      attempt += 1;
      try {
        const res = await axios.get(
          `${API_BASE}/purchase/one-time/status/${sessionId}`,
          { headers: authHeader(), timeout: 12000 },
        );
        const { payment_status, tier_id } = res.data || {};
        if (payment_status === 'paid' && tier_id) {
          setLocalTierFromServer(tier_id, 'stripe');
          setCurrentTier(tier_id);
          setJustPurchased(tier_id);
          setStatusMsg(null);
          LabAudio.playGilded && LabAudio.playGilded();
          setTimeout(() => setJustPurchased(null), 2200);
          clean();
          return;
        }
        if (payment_status === 'expired') {
          setStatusMsg('Checkout session expired — please try again.');
          clean();
          return;
        }
        setStatusMsg('Confirming payment with Stripe…');
        setTimeout(poll, 2000);
      } catch (err) {
        if (attempt >= maxAttempts) {
          setStatusMsg('Could not confirm payment. Refresh the page in a moment.');
          clean();
          return;
        }
        setTimeout(poll, 2500);
      }
    };

    setStatusMsg('Confirming payment with Stripe…');
    poll();
    return () => { cancelled = true; };
  }, []);

  const buy = useCallback(async (t) => {
    if (busyTier) return;
    setBusyTier(t.id);
    setStatusMsg(null);
    try {
      const res = await axios.post(
        `${API_BASE}/purchase/one-time`,
        { tier_id: t.id, origin_url: window.location.origin },
        { headers: authHeader(), timeout: 15000 },
      );
      const { url } = res.data || {};
      if (!url) throw new Error('Stripe did not return a checkout URL');
      // Hand off to Stripe — full-page redirect, not popup.
      window.location.href = url;
    } catch (err) {
      setBusyTier(null);
      const detail = err?.response?.data?.detail || err?.message || 'Checkout failed';
      setStatusMsg(`Checkout failed: ${detail}`);
    }
  }, [busyTier]);

  const headline = useMemo(() => (
    isTWA
      ? 'Manage your Gilded Path on the web.'
      : 'Marketplace access. One-time service fee.'
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

          <div className="flex items-center gap-2 mb-1">
            <Crown size={14} style={{ color: '#FBBF24' }} />
            <p className="text-[10px] uppercase tracking-[0.36em] sov-telemetry" style={{ color: '#FBBF24' }}>
              Gilded Path · Premium Marketplace Access
            </p>
          </div>
          <h2 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
            {headline}
          </h2>
          <p className="text-sm mt-1 mb-5" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif', fontSize: 16 }}>
            Earning every blade is always free. Gilded tiers are a one-time
            service fee for accelerated marketplace access — non-recurring,
            not redeemable for cash. The 528 Hz Resonance Click remains
            exclusive to earned mastery.
          </p>

          {isTWA ? (
            <TWAGateCard />
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {TIERS.map(t => {
                const active = currentTier === t.id;
                const busy = busyTier === t.id;
                return (
                  <motion.button
                    key={t.id}
                    whileHover={busy ? {} : { y: -3 }}
                    whileTap={busy ? {} : { scale: 0.97 }}
                    onClick={() => buy(t)}
                    disabled={!!busyTier}
                    data-testid={`tier-${t.id}`}
                    className="rounded-xl px-4 py-4 text-left relative overflow-hidden disabled:opacity-60"
                    style={{
                      background: active ? `${t.color}1f` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${active ? t.color + '88' : t.color + '44'}`,
                      boxShadow: active ? `0 0 28px ${t.color}44` : 'none',
                      cursor: busyTier ? 'wait' : 'pointer',
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.28em] sov-telemetry" style={{ color: t.color }}>
                      {t.label} · {t.price}
                    </p>
                    <p className="text-[13px] mt-2" style={{ color: '#e2e8f0', fontFamily: 'Cormorant Garamond, serif', fontSize: 15, lineHeight: 1.4 }}>
                      {t.blurb}
                    </p>
                    {active && (
                      <p className="text-[9px] uppercase tracking-[0.2em] mt-2 sov-telemetry" style={{ color: '#FCD34D' }}>
                        Active · Gilded
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
              Secure Stripe checkout · one-time service fee · non-refundable digital service
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
 * arsenal in the user's default browser (Chrome Custom Tab). NO Stripe
 * call ever fires from inside the APK. This is the Spotify / Netflix /
 * Kindle pattern — policy-compliant and preserves 100% of Stripe revenue.
 */
function TWAGateCard() {
  return (
    <a
      href={WEB_BUY_URL}
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
      MANAGE ON WEB · ENLIGHTEN-MINT-CAFE.ME
    </a>
  );
}
