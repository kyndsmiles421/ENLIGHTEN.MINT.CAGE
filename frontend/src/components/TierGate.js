/**
 * TierGate.js — V68.4 Phase D
 *
 * Route-level gate that requires a specific Gaming Card (Spark milestone)
 * to access premium immersive zones (Deep Sky NASA, Evolution Lab, etc.).
 *
 * Behavior:
 *  • If user not authed: show sign-in pathway inline.
 *  • If user missing required card: show locked-state full-page INLINE panel
 *    (no modal, no fixed overlay) with spark progress and path to earn it.
 *  • If user has card OR role is creator/admin: render children normally.
 *
 * Respects the "No Boxes on Boxes" rule — gate replaces page content inline.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Flame, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSovereignUniverse } from '../context/SovereignUniverseContext';

export default function TierGate({ card: requiredCard, label, children }) {
  const { user } = useAuth();
  const { sparkData, hasCard } = useSovereignUniverse();

  // Creators / admins / council / app owner always pass — no tier walls for the sovereign
  const role = user?.role;
  const bypass = user?.is_owner || role === 'creator' || role === 'admin' || role === 'council' || role === 'owner';

  const isGuest = !user || user?.id === 'guest' || user?.role === 'guest';

  if (bypass) return children;
  if (isGuest) {
    return (
      <GateShell label={label} requiredCard={requiredCard}>
        <div className="text-xs text-white/60 mb-4">Sign in with a Sovereign account to begin earning Sparks.</div>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium"
          style={{ background: 'rgba(192,132,252,0.14)', border: '1px solid rgba(192,132,252,0.3)', color: '#C084FC' }}
          data-testid="tier-gate-signin"
        >
          Sign In <ArrowRight size={12} />
        </Link>
      </GateShell>
    );
  }

  if (hasCard(requiredCard)) return children;

  // Find card info from next_card/cards_earned projections
  const sparks = sparkData?.sparks || 0;
  const nextCard = sparkData?.next_card;
  // Best-effort: use next_card if it matches requiredCard id, else generic
  const cardInfo = (nextCard && nextCard.id === requiredCard) ? nextCard : null;
  const threshold = cardInfo?.spark_threshold || null;
  const color = cardInfo?.color || '#3B82F6';
  const progressPct = threshold ? Math.min(100, Math.round((sparks / threshold) * 100)) : null;
  const sparksToGo = threshold ? Math.max(0, threshold - sparks) : null;

  return (
    <GateShell label={label} requiredCard={requiredCard}>
      <div className="text-xs text-white/70 mb-4 leading-relaxed">
        This realm is sealed behind the <span style={{ color }}>{cardInfo?.name || requiredCard.replace(/_/g, ' ')}</span> Gaming Card.
        {cardInfo?.desc && <div className="text-white/50 mt-1 text-[11px]">{cardInfo.desc}</div>}
      </div>

      {threshold ? (
        <div className="w-full max-w-md mb-5">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider mb-1.5">
            <span className="text-white/50 flex items-center gap-1.5">
              <Flame size={10} style={{ color: '#FBBF24' }} /> {sparks} / {threshold} Sparks
            </span>
            <span style={{ color }}>{progressPct}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: color }} />
          </div>
          <div className="text-[10px] text-white/40 mt-1.5">
            Earn {sparksToGo} more Sparks to unlock this zone.
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 justify-center">
        <Link
          to="/trade-passport"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-medium"
          style={{ background: `${color}16`, border: `1px solid ${color}40`, color }}
          data-testid="tier-gate-earn"
        >
          <Flame size={12} /> How to earn Sparks
        </Link>
        <Link
          to="/membership"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-medium"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}
          data-testid="tier-gate-membership"
        >
          View Membership Tiers <ArrowRight size={12} />
        </Link>
        <Link
          to="/sovereign-hub"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-medium text-white/60"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          data-testid="tier-gate-return"
        >
          Return to Hub
        </Link>
      </div>
    </GateShell>
  );
}

function GateShell({ label, requiredCard, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" data-testid="tier-gate-locked">
      <div className="w-full max-w-lg text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <Lock size={22} style={{ color: '#3B82F6' }} />
        </div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">Sealed Realm</div>
        <h2 className="text-xl font-bold text-white/90 mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          {label || 'Gated Experience'}
        </h2>
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-5">
          Requires · {requiredCard.replace(/_/g, ' ')}
        </div>
        {children}
      </div>
    </div>
  );
}
