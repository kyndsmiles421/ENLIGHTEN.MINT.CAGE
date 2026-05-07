/**
 * ClimbLadderPill — V1.1.4 The Sovereign Bridge
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Context-aware "All-Time Upsell" that converts every tier-gated boundary
 * in the OS into a one-tap upgrade funnel. Single source of truth for:
 *   • Hub pillar cards (when min_tier > user)
 *   • Perplexity synthesis results (locked depths)
 *   • 9x9 node modifiers (high-end shader / link tools)
 *   • Tesseract Vault relic claims (V1.1.1 already wired)
 *
 * Wiring: pulls live differential price from /api/economy/buy-up-quote,
 * launches Stripe Checkout via /api/economy/subscribe. Founder anchor
 * always rendered as the "Master Key" jump option.
 *
 * Flatland-clean: inline pill, no overlays, no modals.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Lock, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Visual tier metadata. Mirrors backend SUBSCRIPTION_TIERS color/icon.
const TIER_META = {
  discovery:         { name: 'Discovery',         color: '#6B7280', accent: 'rgba(107,114,128,0.15)' },
  resonance:         { name: 'Artisan',           color: '#818CF8', accent: 'rgba(129,140,248,0.18)' },
  architect:         { name: 'Architect',         color: '#2DD4BF', accent: 'rgba(45,212,191,0.18)' },
  sovereign:         { name: 'Sovereign Monthly', color: '#FBBF24', accent: 'rgba(251,191,36,0.18)' },
  sovereign_founder: { name: 'Sovereign Founder', color: '#FCD34D', accent: 'rgba(252,211,77,0.22)' },
};

/**
 * @param {Object} props
 * @param {string} props.requiredTier — minimum tier to unlock the gated thing
 * @param {string} [props.context] — short label for analytics ("relic-claim", "synth-deep")
 * @param {string} [props.featureLabel] — what the user is trying to unlock ("Lilikoi Fudge", "Deep-Dive")
 * @param {boolean} [props.showFounderJump=true] — always render the $1,777 Master Key
 * @param {'inline'|'compact'|'card'} [props.variant='inline']
 */
export default function ClimbLadderPill({
  requiredTier,
  context = 'generic',
  featureLabel = '',
  showFounderJump = true,
  variant = 'inline',
}) {
  const [quote, setQuote] = useState(null);
  const [founderQuote, setFounderQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(null);

  const fetchQuote = useCallback(async (tier) => {
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') return null;
    try {
      const r = await fetch(`${API}/economy/buy-up-quote?target_tier=${tier}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) return await r.json();
    } catch {}
    return null;
  }, []);

  useEffect(() => {
    if (!requiredTier) return;
    setLoading(true);
    Promise.all([
      fetchQuote(requiredTier),
      showFounderJump && requiredTier !== 'sovereign_founder'
        ? fetchQuote('sovereign_founder')
        : Promise.resolve(null),
    ]).then(([q, fq]) => {
      setQuote(q);
      setFounderQuote(fq);
      setLoading(false);
    });
  }, [requiredTier, showFounderJump, fetchQuote]);

  const handleClimb = useCallback(async (tierId) => {
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') {
      toast('Sign in to upgrade');
      return;
    }
    setPurchasing(tierId);
    try {
      // V1.1.5 — Stash a "pending unlock" marker so the post-Stripe
      // /pricing success handler can route the user back to the
      // originating surface (vault, hub, modifier panel) and trigger
      // the 3D unfold on the just-claimed thing. Cleaner than
      // threading a return_to URL through Stripe redirects.
      if (context && context.startsWith('vault-')) {
        const relicId = context.slice('vault-'.length);
        try {
          localStorage.setItem('sov_pending_unlock', JSON.stringify({
            kind: 'vault', relic_id: relicId, ts: Date.now(),
          }));
        } catch {}
      }
      const r = await fetch(`${API}/economy/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tier_id: tierId, origin_url: window.location.origin }),
      });
      if (r.ok) {
        const j = await r.json();
        if (j.url) {
          window.location.href = j.url;
          return;
        }
        if (j.status === 'activated') {
          toast.success(`Activated ${tierId}`);
          window.location.reload();
        }
      } else {
        const j = await r.json().catch(() => ({}));
        toast.error(j.detail || 'Upgrade failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setPurchasing(null);
    }
  }, [context]);

  // Guest or already at-or-above tier — render nothing
  if (loading) {
    return (
      <span data-testid="climb-ladder-loading" style={{
        fontSize: 9, color: 'rgba(248,250,252,0.4)', letterSpacing: '0.10em',
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        <Loader2 size={9} className="animate-spin" /> CHECKING...
      </span>
    );
  }
  if (!quote) return null;
  // Hide if differential is non-positive (user already above)
  if (typeof quote.differential === 'number' && quote.differential <= 0) return null;

  const targetMeta = TIER_META[quote.target_tier] || TIER_META.architect;
  const founderMeta = TIER_META.sovereign_founder;

  // ── COMPACT: tiny inline tag (used in Hub card grid) ────────────
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); handleClimb(quote.target_tier); }}
        disabled={purchasing === quote.target_tier}
        data-testid={`climb-ladder-compact-${context}`}
        title={quote.message}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 8px', borderRadius: 999,
          background: targetMeta.accent,
          border: `1px solid ${targetMeta.color}55`,
          color: targetMeta.color,
          fontSize: 8.5, letterSpacing: '0.10em', fontFamily: 'monospace',
          cursor: purchasing ? 'wait' : 'pointer',
        }}
      >
        <Lock size={8} />
        <span>${quote.differential?.toFixed(0)}{quote.kind === 'monthly_step_up' ? '/mo' : ''}</span>
        <ArrowRight size={8} />
      </button>
    );
  }

  // ── CARD: full footer block (synthesis, modifier panels) ─────────
  // ── INLINE: standard pill (default) ──────────────────────────────
  const isCard = variant === 'card';
  return (
    <div
      data-testid={`climb-ladder-${variant}-${context}`}
      style={{
        marginTop: isCard ? 12 : 8,
        padding: isCard ? '12px 14px' : '8px 12px',
        borderRadius: isCard ? 10 : 999,
        background: targetMeta.accent,
        border: `1px solid ${targetMeta.color}40`,
        display: isCard ? 'block' : 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'monospace',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Lock size={11} style={{ color: targetMeta.color }} />
        <span style={{ fontSize: 9, letterSpacing: '0.12em', color: 'rgba(248,250,252,0.7)' }}>
          {featureLabel ? `${featureLabel.toUpperCase()} · ` : ''}{targetMeta.name.toUpperCase()}+ ONLY
        </span>
      </div>
      <div style={{ marginTop: isCard ? 8 : 0, marginLeft: isCard ? 0 : 'auto', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => handleClimb(quote.target_tier)}
          disabled={purchasing === quote.target_tier}
          data-testid={`climb-ladder-target-${context}`}
          style={{
            padding: '5px 12px', borderRadius: 999,
            background: targetMeta.color,
            border: 'none', color: '#0F172A',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.10em',
            cursor: purchasing ? 'wait' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}
        >
          {purchasing === quote.target_tier ? <Loader2 size={10} className="animate-spin" /> : <ArrowRight size={10} />}
          CLIMB FOR ${quote.differential?.toFixed(quote.differential < 100 ? 2 : 0)}
          {quote.kind === 'monthly_step_up' ? '/MO' : ''}
        </button>

        {/* Master Key — direct $1,777 Founder jump */}
        {founderQuote && founderQuote.differential > 0 && (
          <button
            type="button"
            onClick={() => handleClimb('sovereign_founder')}
            disabled={purchasing === 'sovereign_founder'}
            data-testid={`climb-ladder-founder-${context}`}
            title="Master Key — bypass the ladder, lock 60% discount for 24 months"
            style={{
              padding: '5px 10px', borderRadius: 999,
              background: 'transparent',
              border: `1px solid ${founderMeta.color}80`,
              color: founderMeta.color,
              fontSize: 9, letterSpacing: '0.10em',
              cursor: purchasing ? 'wait' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}
          >
            <Crown size={9} />
            FOUNDER ${founderQuote.differential.toFixed(0)}
          </button>
        )}
      </div>
      {isCard && (
        <div style={{ marginTop: 8, fontSize: 8.5, color: 'rgba(248,250,252,0.5)', lineHeight: 1.5 }}>
          {quote.message}
          {quote.kind === 'monthly_step_up' && (
            <> · <span style={{ color: founderMeta.color }}>60% Founder discount</span> on all utility upgrades when you jump to Founder.</>
          )}
        </div>
      )}
    </div>
  );
}
