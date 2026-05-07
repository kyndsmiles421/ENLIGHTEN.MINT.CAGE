/**
 * RefuelOffer.jsx — V1.1.7 The Sovereign Sample
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Two states:
 *   1. INACTIVE — surface the $7 / 2.5h offer with 30% discount.
 *      Renders as an inline pill (Flatland-clean, no overlay).
 *      Shown to non-Sovereign users after 60min of session time
 *      (when their "Power Hour" trial is up) OR perpetually on the
 *      Pricing page so they can opt in earlier.
 *   2. ACTIVE — render the live countdown so the user sees the
 *      benefit ticking. Auto-clears when the window expires.
 *
 * Backend wiring:
 *   GET  /api/economy/refuel/status — auth, returns active state
 *   POST /api/economy/refuel/start  — auth, creates Stripe session
 *   GET  /api/economy/refuel/info   — public, SKU details
 *
 * The UnlockBus fires automatically on Stripe success (V1.1.7
 * Universal Ripple in Pricing.js::pollStatus), so the helix lights
 * up the moment the refuel activates.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Zap, Clock, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function formatRemaining(seconds) {
  if (seconds <= 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * @param {Object} props
 * @param {'inline'|'card'|'banner'} [props.variant='inline']
 * @param {boolean} [props.compact=false] — minimal mode (just the pill)
 */
export default function RefuelOffer({ variant = 'inline', compact = false }) {
  const [status, setStatus] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [tick, setTick] = useState(0);

  const fetchStatus = useCallback(async () => {
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') return;
    try {
      const r = await fetch(`${API}/economy/refuel/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setStatus(await r.json());
    } catch {}
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Re-fetch when navigating back from Stripe success
  useEffect(() => {
    const onFocus = () => fetchStatus();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchStatus]);

  // Active-window countdown — tick every second
  useEffect(() => {
    if (!status?.active) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [status?.active]);

  // Auto-expire when timer hits 0
  const remaining = status?.active
    ? Math.max(0, (status.seconds_remaining || 0) - tick)
    : 0;
  useEffect(() => {
    if (status?.active && remaining <= 0) {
      // Window just expired — refresh state so we go back to offer mode
      setStatus({ active: false, expired_at: new Date().toISOString() });
      toast('Sovereign Sample expired · climb the ladder anytime');
    }
  }, [status?.active, remaining]);

  const handleStart = useCallback(async () => {
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') {
      toast('Sign in to unlock the Sovereign Sample');
      return;
    }
    setPurchasing(true);
    try {
      const r = await fetch(`${API}/economy/refuel/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ origin_url: window.location.origin }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        toast.error(j.detail || 'Could not start Refuel');
        return;
      }
      const j = await r.json();
      if (j.already_active) {
        toast('Sovereign Sample already active · enjoy');
        await fetchStatus();
        return;
      }
      if (j.url) {
        window.location.href = j.url;
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setPurchasing(false);
    }
  }, [fetchStatus]);

  if (status === null) return null;  // still loading first time

  // ── ACTIVE state — countdown pill ────────────────────────────
  if (status.active) {
    return (
      <div
        data-testid="refuel-active-pill"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 999,
          background: 'rgba(244,114,182,0.12)',
          border: '1px solid rgba(244,114,182,0.40)',
          fontFamily: 'monospace', fontSize: 9,
          letterSpacing: '0.10em', color: '#F472B6',
        }}
      >
        <Sparkles size={11} />
        <span>SOVEREIGN ACTIVE · {status.discount_pct || 30}% OFF</span>
        <Clock size={10} style={{ opacity: 0.7 }} />
        <span style={{ color: 'rgba(248,250,252,0.85)' }}>{formatRemaining(remaining)}</span>
      </div>
    );
  }

  // ── INACTIVE state — offer pill / card ────────────────────────
  if (compact) {
    return (
      <button
        type="button"
        onClick={handleStart}
        disabled={purchasing}
        data-testid="refuel-offer-compact"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 999,
          background: 'rgba(244,114,182,0.14)',
          border: '1px solid rgba(244,114,182,0.45)',
          color: '#F472B6',
          fontFamily: 'monospace', fontSize: 9,
          letterSpacing: '0.10em',
          cursor: purchasing ? 'wait' : 'pointer',
        }}
      >
        {purchasing ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
        REFUEL · $7 · 2.5H
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <div
        data-testid="refuel-offer-card"
        style={{
          padding: 14, borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(244,114,182,0.10) 0%, rgba(10,10,18,0.6) 100%)',
          border: '1px solid rgba(244,114,182,0.30)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={14} style={{ color: '#F472B6' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.18em', color: '#F472B6', fontFamily: 'monospace' }}>
            SOVEREIGN SAMPLE
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(248,250,252,0.92)', lineHeight: 1.5 }}>
          Feel the 30% Sovereign discount for 2.5 hours.
        </div>
        <div style={{ fontSize: 9, color: 'rgba(248,250,252,0.55)', letterSpacing: '0.05em' }}>
          Lowest-friction way to test the math of the ladder. No subscription.
        </div>
        <button
          type="button"
          onClick={handleStart}
          disabled={purchasing}
          data-testid="refuel-offer-start"
          style={{
            marginTop: 4, padding: '8px 14px', borderRadius: 999,
            background: '#F472B6', border: 'none', color: '#1F0A14',
            fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.12em',
            cursor: purchasing ? 'wait' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            alignSelf: 'flex-start',
          }}
        >
          {purchasing ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
          UNLOCK FOR $7
        </button>
      </div>
    );
  }

  // Default 'inline'
  return (
    <button
      type="button"
      onClick={handleStart}
      disabled={purchasing}
      data-testid="refuel-offer-inline"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 14px', borderRadius: 999,
        background: 'rgba(244,114,182,0.14)',
        border: '1px solid rgba(244,114,182,0.45)',
        color: '#F472B6',
        fontFamily: 'monospace', fontSize: 10,
        letterSpacing: '0.10em',
        cursor: purchasing ? 'wait' : 'pointer',
      }}
    >
      {purchasing ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
      <span style={{ fontWeight: 700 }}>SOVEREIGN SAMPLE</span>
      <span style={{ opacity: 0.85 }}>· $7 · 2.5h · 30% OFF</span>
    </button>
  );
}
