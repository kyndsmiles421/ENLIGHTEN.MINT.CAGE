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
import { useAuth } from '../context/AuthContext';
import { Shield, Layers, Star, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import BackToHub from '../components/BackToHub';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SKILL LATTICE WEB — SVG radar chart of domain mastery
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
                {d.domain.split(' ')[0]}
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
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all"
      style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
      data-testid={`domain-${domain.domain.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="w-2 h-8 rounded-full" style={{ background: domain.color, opacity: 0.6 }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: domain.color }}>
            {domain.domain}
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

  const isFullAuth = token && token !== 'guest_token';

  const fetchPassport = useCallback(async () => {
    if (!isFullAuth) { setLoading(false); return; }
    try {
      const res = await axios.get(`${API}/rpg/passport`, { headers: authHeaders });
      setPassport(res.data);
    } catch {
      // Non-fatal
    } finally { setLoading(false); }
  }, [authHeaders, isFullAuth]);

  useEffect(() => { fetchPassport(); }, [fetchPassport]);
  useEffect(() => {
    if (typeof window.__workAccrue === 'function') window.__workAccrue('module_interaction', 5);
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8" data-testid="trade-passport-page">
      <BackToHub />
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
            Your unified mastery across the 155-cell organism. Every action, every dive, every discovery — recorded.
          </p>
        </div>

        {!isFullAuth ? (
          /* Guest state */
          <div className="rounded-2xl p-6 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Shield size={32} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 12px' }} />
            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Cormorant Garamond, serif' }}>
              Sign in to activate your Sovereign Passport
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Your mastery across all 155 cells will be tracked, synthesized, and visualized here.
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : passport ? (
          <div className="space-y-6">
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
        ) : (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Begin exploring the 155 cells to build your Sovereign Passport.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
