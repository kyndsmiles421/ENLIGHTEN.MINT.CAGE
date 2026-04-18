/**
 * WalletPills.js — V68.5 Sovereign Wallet (Dual Currency Firewall)
 *
 * Renders TWO clearly distinct pills in the Hub:
 *   ── RANK  (Sparks) — permanent merit, never spent, milestone-gated unlocks.
 *   ── DUST  (Balance) — spendable economy currency.
 *
 * The firewall is visual and linguistic: Sparks are "Rank / Merit" with a
 * rank label (CITIZEN → SEED → NAVIGATOR → ARTISAN → ORACLE → ARCHITECT → SOVEREIGN).
 * Dust is "Balance" with an inline expandable quick-glance panel showing
 * recent earnings and a link to the full Trade Ledger in the Passport.
 *
 * Inline only. No modals, no fixed overlays. Respects the Flatland rule.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, Coins, ChevronDown, ArrowRight, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSovereignUniverse } from '../context/SovereignUniverseContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ── Rank label color map (Merit tier) ──
const RANK_COLORS = {
  CITIZEN:   '#64748B',
  SEED:      '#A78BFA',
  NAVIGATOR: '#3B82F6',
  ARTISAN:   '#FBBF24',
  ORACLE:    '#22C55E',
  ARCHITECT: '#8B5CF6',
  SOVEREIGN: '#D4AF37',
};

export default function WalletPills() {
  const { user } = useAuth();
  const { sparkData } = useSovereignUniverse();
  const [wallet, setWallet] = useState(null);
  const [dustExpanded, setDustExpanded] = useState(false);
  const [ledger, setLedger] = useState(null);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') return;
    axios.get(`${API}/wallet/balance`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setWallet(r.data))
      .catch(() => {});
  }, [user, sparkData]); // re-pull when Sovereign Universe refreshes

  const handleDustToggle = async () => {
    const next = !dustExpanded;
    setDustExpanded(next);
    if (next && !ledger) {
      const token = localStorage.getItem('zen_token');
      if (!token || token === 'guest_token') return;
      try {
        const r = await axios.get(`${API}/wallet/dust-ledger?limit=5`, { headers: { Authorization: `Bearer ${token}` } });
        setLedger(r.data);
      } catch { setLedger({ dust: wallet?.balance?.dust || 0, transactions: [] }); }
    }
  };

  if (!wallet) return null;

  const rank = wallet.rank || {};
  const balance = wallet.balance || {};
  const rankColor = RANK_COLORS[rank.label] || '#A78BFA';

  return (
    <div className="flex flex-col items-center gap-1.5 px-4 pb-3" data-testid="wallet-pills">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* ── RANK PILL (Merit — Sparks) ── */}
        <Link
          to="/trade-passport"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all active:scale-[0.98]"
          style={{
            background: `${rankColor}0a`,
            border: `1px solid ${rankColor}28`,
          }}
          data-testid="wallet-rank-pill"
          title="Merit — permanent, never spent. Unlocks Gaming Cards at milestones."
        >
          <Award size={13} style={{ color: rankColor }} />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: rankColor }}>
              {rank.label || 'CITIZEN'}
            </span>
            <span className="text-[7px] uppercase tracking-wider" style={{ color: `${rankColor}80` }}>Rank</span>
          </div>
          <div className="flex items-center gap-1 pl-2.5" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-sm font-mono font-bold" style={{ color: rankColor }}>
              {(rank.sparks ?? 0).toLocaleString()}
            </span>
            <span className="text-[7px] uppercase" style={{ color: `${rankColor}80` }}>sparks</span>
          </div>
          {rank.next_card && (
            <div className="flex items-center gap-1.5 pl-2" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{
                  width: `${Math.min(100, (rank.sparks / rank.next_card.spark_threshold) * 100)}%`,
                  background: rank.next_card.color,
                }} />
              </div>
            </div>
          )}
          <span className="text-[7px] uppercase tracking-wider pl-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {rank.cards_count}/{rank.cards_total}
          </span>
        </Link>

        {/* ── DUST PILL (Economy — Balance) ── */}
        <button
          type="button"
          onClick={handleDustToggle}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all active:scale-[0.98]"
          style={{
            background: 'rgba(212,175,55,0.06)',
            border: '1px solid rgba(212,175,55,0.25)',
          }}
          data-testid="wallet-dust-pill"
          title="Spendable economy currency. Convert to Credits in the Marketplace."
        >
          <Coins size={13} style={{ color: '#D4AF37' }} />
          <span className="text-sm font-mono font-bold" style={{ color: '#D4AF37' }}>
            {(balance.dust ?? 0).toLocaleString()}
          </span>
          <div className="flex flex-col leading-tight items-start">
            <span className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: '#D4AF37' }}>
              Dust
            </span>
            <span className="text-[7px] uppercase tracking-wider" style={{ color: 'rgba(212,175,55,0.55)' }}>Balance</span>
          </div>
          <motion.div animate={{ rotate: dustExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={11} style={{ color: 'rgba(212,175,55,0.55)' }} />
          </motion.div>
        </button>
      </div>

      {/* ── DUST inline quick-glance panel (no modal) ── */}
      <AnimatePresence>
        {dustExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="w-full max-w-md overflow-hidden"
            data-testid="wallet-dust-panel"
          >
            <div className="mt-1 px-3.5 py-3 rounded-xl" style={{
              background: 'rgba(212,175,55,0.04)',
              border: '1px solid rgba(212,175,55,0.15)',
            }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={11} style={{ color: '#D4AF37' }} />
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: '#D4AF37' }}>
                  Trade Ledger
                </span>
                <span className="text-[9px] text-white/40">— Economy</span>
              </div>
              <p className="text-[10px] text-white/60 mb-2 leading-relaxed">
                Dust is earned through cosmic activity and <span style={{ color: '#D4AF37' }}>can be spent</span>.
                Convert to Credits, unlock tools, pay fees. Sparks (rank) remain untouched.
              </p>
              {ledger?.transactions?.length > 0 ? (
                <div className="space-y-1 mb-2.5 max-h-28 overflow-y-auto">
                  {ledger.transactions.slice(0, 5).map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px] py-1 px-1.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <span className="text-white/60 truncate flex-1">{t.source || t.kind || 'activity'}</span>
                      <span className={`font-mono ${t.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.amount >= 0 ? '+' : ''}{t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-white/35 italic mb-2.5">
                  No recent dust events on record. Explore Dimensions or complete Quantum quests to earn Dust.
                </div>
              )}
              <Link to="/trade-passport?tab=ledger"
                className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider"
                style={{ color: '#D4AF37' }}
                data-testid="wallet-dust-passport-link">
                Full Trade Ledger in Passport <ArrowRight size={10} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
