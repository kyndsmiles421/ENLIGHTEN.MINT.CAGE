/**
 * TradePassport.js — V57.0 Sovereign Trade Passport
 * 
 * THE CENTRAL REGISTRY — The Brain's self-awareness.
 * Aggregates mastery across ALL 155 cells into a unified skill lattice.
 * Shows domain mastery, hybrid titles, dive clearance, and progress web.
 * 
 * NO MODALS. Inline expansion only. Bottom toolbar unobscured.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Layers, Star, Lock, ChevronDown, ChevronUp, Award, Coins, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SKILL LATTICE WEB — SVG radar chart of domain mastery
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// V1.2.3 Compliance Display Map — render Play-Store-safe labels while
// preserving the canonical domain keys ("Healing Arts") that the entire
// RPG ledger / quest requirements / skill mastery DB rows depend on.
const DOMAIN_DISPLAY_LABELS = {
  'Healing Arts': 'Resonant Arts',
};
const labelFor = (d) => DOMAIN_DISPLAY_LABELS[d] || d;

function SkillLatticeWeb({ domains }) {
  if (!domains || domains.length === 0) return null;

  const cx = 150, cy = 150, maxR = 120;
  const count = domains.length;
  const angleStep = (Math.PI * 2) / count;

  // Build polygon points from domain progress
  const points = domains.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (d.progress_pct / 100) * maxR;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });
  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative mx-auto" style={{ width: 300, height: 300 }} data-testid="skill-lattice-web">
      <svg viewBox="0 0 300 300" width="300" height="300">
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map(scale => (
          <polygon key={scale}
            points={domains.map((_, i) => {
              const a = i * angleStep - Math.PI / 2;
              return `${cx + Math.cos(a) * maxR * scale},${cy + Math.sin(a) * maxR * scale}`;
            }).join(' ')}
            fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        ))}

        {/* Axis lines */}
        {domains.map((d, i) => {
          const a = i * angleStep - Math.PI / 2;
          return (
            <line key={`axis-${i}`}
              x1={cx} y1={cy}
              x2={cx + Math.cos(a) * maxR}
              y2={cy + Math.sin(a) * maxR}
              stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          );
        })}

        {/* Filled mastery polygon */}
        <motion.polygon
          points={polyPoints}
          fill="rgba(251,191,36,0.08)"
          stroke="#FBBF24"
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Domain dots + labels */}
        {domains.map((d, i) => {
          const a = i * angleStep - Math.PI / 2;
          const labelR = maxR + 18;
          const dotR = (d.progress_pct / 100) * maxR;
          return (
            <g key={d.domain}>
              {/* Progress dot */}
              <circle
                cx={cx + Math.cos(a) * dotR}
                cy={cy + Math.sin(a) * dotR}
                r="4" fill={d.color} opacity="0.9"
              />
              {/* Label */}
              <text
                x={cx + Math.cos(a) * labelR}
                y={cy + Math.sin(a) * labelR}
                fill={d.color}
                fontSize="7"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {labelFor(d.domain).split(' ')[0]}
              </text>
            </g>
          );
        })}

        {/* Center level */}
        <circle cx={cx} cy={cy} r="16" fill="rgba(251,191,36,0.1)" stroke="#FBBF24" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOMAIN MASTERY ROW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function DomainRow({ domain }) {
  const displayName = labelFor(domain.domain);
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all"
      style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
      data-testid={`domain-${domain.domain.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="w-2 h-8 rounded-full" style={{ background: domain.color, opacity: 0.6 }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: domain.color }}>
            {displayName}
          </span>
          <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {domain.rank}
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div className="h-full rounded-full"
            style={{ background: domain.color }}
            initial={{ width: 0 }}
            animate={{ width: `${domain.progress_pct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {domain.actions} actions
          </span>
          <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {domain.xp} XP
          </span>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HYBRID TITLE CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function TitleCard({ title, unlocked }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden transition-all"
      style={{
        background: unlocked ? `${title.color}08` : 'rgba(255,255,255,0.01)',
        border: `1px solid ${unlocked ? `${title.color}25` : 'rgba(255,255,255,0.04)'}`,
      }}
      data-testid={`title-${title.id}`}>
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-3 text-left">
        {unlocked ? <Star size={14} style={{ color: title.color }} /> : <Lock size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />}
        <div className="flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: unlocked ? title.color : 'rgba(255,255,255,0.4)' }}>
            {title.title}
          </span>
        </div>
        {expanded ? <ChevronUp size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
          : <ChevronDown size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-1.5">
              <p className="text-[9px] italic" style={{ color: 'rgba(255,255,255,0.5)' }}>{title.desc}</p>
              {Object.entries(title.requirements).map(([dom, req]) => (
                <div key={dom} className="flex items-center gap-2">
                  <span className="text-[8px] flex-1" style={{ color: req.met ? '#22C55E' : 'rgba(255,255,255,0.35)' }}>
                    {dom}
                  </span>
                  <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min(100, (req.current / req.required) * 100)}%`,
                      background: req.met ? '#22C55E' : 'rgba(255,255,255,0.2)',
                    }} />
                  </div>
                  <span className="text-[7px] font-mono w-10 text-right"
                    style={{ color: req.met ? '#22C55E' : 'rgba(255,255,255,0.3)' }}>
                    {req.current}/{req.required}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN TRADE PASSPORT PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function TradePassport() {
  const { authHeaders, token } = useAuth();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'ledger' ? 'trade' : 'merit';
  const [tab, setTab] = useState(initialTab);

  const isFullAuth = token && token !== 'guest_token';

  const fetchPassport = useCallback(async () => {
    if (!isFullAuth) { setLoading(false); return; }
    try {
      const [p, w] = await Promise.all([
        axios.get(`${API}/rpg/passport`, { headers: authHeaders }).catch(() => null),
        axios.get(`${API}/wallet/balance`, { headers: authHeaders }).catch(() => null),
      ]);
      if (p?.data) setPassport(p.data);
      if (w?.data) setWallet(w.data);
    } catch { /* non-fatal */ }
    finally { setLoading(false); }
  }, [authHeaders, isFullAuth]);

  const fetchLedger = useCallback(async () => {
    if (!isFullAuth || ledger) return;
    try {
      const r = await axios.get(`${API}/wallet/dust-ledger?limit=50`, { headers: authHeaders });
      setLedger(r.data);
    } catch { setLedger({ dust: wallet?.balance?.dust || 0, transactions: [] }); }
  }, [authHeaders, isFullAuth, ledger, wallet]);

  useEffect(() => { fetchPassport(); }, [fetchPassport]);
  useEffect(() => { if (tab === 'trade') fetchLedger(); }, [tab, fetchLedger]);
  useEffect(() => {
    if (typeof window.__workAccrue === 'function') window.__workAccrue('module_interaction', 5);
  }, []);

  const switchTab = (t) => {
    setTab(t);
    setSearchParams(t === 'trade' ? { tab: 'ledger' } : {}, { replace: true });
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8" data-testid="trade-passport-page">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} style={{ color: '#FBBF24' }} />
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Sovereign Passport
            </h1>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Your unified mastery across the 176-nodule organism. Every action, every dive, every discovery — recorded.
          </p>
        </div>

        {/* V68.5 — Merit / Trade Ledger tabs (Sparks vs. Dust firewall) */}
        {isFullAuth && (
          <div className="flex gap-2 mb-5" data-testid="passport-tabs">
            <button
              onClick={() => switchTab('merit')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.18em] transition-all active:scale-[0.98]"
              style={{
                background: tab === 'merit' ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${tab === 'merit' ? 'rgba(167,139,250,0.35)' : 'rgba(255,255,255,0.06)'}`,
                color: tab === 'merit' ? '#A78BFA' : 'rgba(255,255,255,0.4)',
              }}
              data-testid="passport-tab-merit"
            >
              <Award size={12} /> Merit Ledger
            </button>
            <button
              onClick={() => switchTab('trade')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.18em] transition-all active:scale-[0.98]"
              style={{
                background: tab === 'trade' ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${tab === 'trade' ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.06)'}`,
                color: tab === 'trade' ? '#D4AF37' : 'rgba(255,255,255,0.4)',
              }}
              data-testid="passport-tab-trade"
            >
              <Coins size={12} /> Trade Ledger
            </button>
          </div>
        )}

        {!isFullAuth ? (
          /* Guest state */
          <div className="rounded-2xl p-6 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Shield size={32} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 12px' }} />
            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Cormorant Garamond, serif' }}>
              Sign in to activate your Sovereign Passport
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Your mastery across all 176 nodules will be tracked, synthesized, and visualized here.
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : passport ? (
          tab === 'trade' ? (
            /* ═══ TRADE LEDGER — Dust economy (spendable) ═══ */
            <div className="space-y-5" data-testid="trade-ledger">
              <div className="px-3.5 py-2 rounded-lg" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Coins size={12} style={{ color: '#D4AF37' }} />
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: '#D4AF37' }}>Economy Firewall</span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <span style={{ color: '#D4AF37' }}>Dust</span> is your <em>spendable</em> currency — convert to Credits, unlock tools, pay fees.
                  Your <span style={{ color: '#A78BFA' }}>Sparks (Rank)</span> are untouched by this ledger; they are permanent merit.
                </p>
              </div>

              <div className="rounded-2xl p-5 text-center" style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))',
                border: '1px solid rgba(212,175,55,0.25)',
              }}>
                <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>Dust Balance</div>
                <div className="text-4xl font-mono font-light" style={{ color: '#D4AF37', fontFamily: 'Cormorant Garamond, serif' }}>
                  {(ledger?.dust ?? wallet?.balance?.dust ?? 0).toLocaleString()}
                </div>
                <div className="text-[9px] mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Earned through Dimensions, Quantum quests, Cosmic Map encounters, and volunteer hours.
                </div>
              </div>

              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2 flex items-center gap-1.5"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <TrendingUp size={11} /> Recent Transactions
                </h2>
                {ledger?.transactions?.length > 0 ? (
                  <div className="space-y-1.5">
                    {ledger.transactions.map((t, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg text-[11px]"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                        data-testid={`dust-tx-${i}`}>
                        <div className="flex-1 min-w-0">
                          <div className="text-white/80 truncate">{t.source || t.kind || 'activity'}</div>
                          {t.ts && <div className="text-[9px] text-white/30">{new Date(t.ts).toLocaleDateString()}</div>}
                        </div>
                        <span className={`font-mono font-bold ${t.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.amount >= 0 ? '+' : ''}{(t.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)' }}>
                    <p className="text-[11px] text-white/40 italic">No dust transactions recorded yet.</p>
                    <p className="text-[10px] text-white/30 mt-1">Explore Dimensions, Quantum, or Cosmic Map zones to begin earning Dust.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
          /* ═══ MERIT LEDGER — Rank / Sparks (permanent, never spent) ═══ */
          <div className="space-y-6" data-testid="merit-ledger">
            {/* Overview bar */}
            <div className="grid grid-cols-4 gap-2" data-testid="passport-overview">
              {[
                { label: 'Level', val: passport.level, color: '#FBBF24' },
                { label: 'Total XP', val: passport.total_xp.toLocaleString(), color: '#A78BFA' },
                { label: 'Actions', val: passport.total_actions, color: '#3B82F6' },
                { label: 'Dive Clearance', val: `L${passport.dive_clearance.level}`, color: '#22C55E' },
              ].map(s => (
                <div key={s.label} className="px-3 py-2.5 rounded-xl text-center"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-lg font-mono" style={{ color: s.color }}>{s.val}</p>
                  <p className="text-[7px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Active title */}
            {passport.active_title && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}
                data-testid="active-title">
                <Star size={14} style={{ color: '#FBBF24' }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: '#FBBF24' }}>
                  {passport.active_title}
                </span>
              </div>
            )}

            {/* Dive clearance */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)' }}
              data-testid="dive-clearance">
              <Layers size={14} style={{ color: '#22C55E' }} />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#22C55E' }}>
                  {passport.dive_clearance.label}
                </span>
                <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {passport.dive_clearance.desc}
                </p>
              </div>
            </div>

            {/* Skill Lattice Web */}
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                Skill Lattice
              </h2>
              <SkillLatticeWeb domains={passport.domains} />
            </div>

            {/* Domain mastery list */}
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                Domain Mastery
              </h2>
              <div className="space-y-2">
                {passport.domains.map(d => <DomainRow key={d.domain} domain={d} />)}
              </div>
            </div>

            {/* Hybrid titles */}
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                Sovereign Titles {passport.unlocked_titles.length > 0 && (
                  <span style={{ color: '#FBBF24' }}> — {passport.unlocked_titles.length} Unlocked</span>
                )}
              </h2>
              <div className="space-y-2">
                {passport.unlocked_titles.map(t => <TitleCard key={t.id} title={t} unlocked />)}
                {passport.locked_titles.map(t => <TitleCard key={t.id} title={t} unlocked={false} />)}
              </div>
            </div>
          </div>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Begin exploring the 176 nodules to build your Sovereign Passport.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
