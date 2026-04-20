import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Lock, Sparkles } from 'lucide-react';
import SovereignBridge from '../kernel/SovereignBridge';
import SovereignKernel from '../kernel/SovereignKernel';
import SovereignPreferences from '../kernel/SovereignPreferences';

/**
 * ToolDrawer — the Swiss Army Knife silhouette, rendered as SVG crystals.
 *
 * Groups all 243 SovereignBridge entries by BLADE:
 *   • Entertainment (Layer 4 · VR realms)
 *   • Educational   (Layer 2 · Workshops)
 *   • Utility       (Layer 3 · Quest Bridge) + (Layer 3 cosmic-ledger)
 *
 * Unlocked blades glow in the active Sovereign skin; locked blades stay in
 * dark charcoal with a cryptic hint ("A key from Geology — the frequency
 * is still closed to you.") when the Sovereign taps them.
 *
 * Click an unlocked blade → fires `SovereignKernel.interact(toolId)` which
 * ripples to the Hub via `sovereign:interact`.
 */

const BLADE_META = {
  entertainment: { label: 'Entertainment', subtitle: 'VR · Gamified Realms', icon: Sparkles, accent: '#F0ABFC' },
  educational:   { label: 'Educational',   subtitle: 'Workshops · Recursive Dives', icon: Swords, accent: '#22D3EE' },
  utility:       { label: 'Utility',       subtitle: 'Ledger · Sovereign Toolset', icon: Swords, accent: '#FBBF24' },
};

function bladeOf(tool) {
  if (tool.blade) return tool.blade;
  if (tool.layer === 4) return 'entertainment';
  if (tool.layer === 3) return 'utility';
  return 'educational';
}

// Build a reverse lookup: {unlock_key → tool_id that produces it}
// so locked tools can render a cryptic hint pointing at the domain that
// *produces* the required key — without revealing the exact prerequisite.
function buildUnlockIndex(tools) {
  const idx = {};
  for (const t of tools) for (const k of t.unlocks || []) idx[k] = t;
  return idx;
}

function crypticHint(tool, unlockIndex) {
  if (!tool.requires?.length) return null;
  const first = tool.requires[0];
  const producer = unlockIndex[first];
  if (!producer) {
    return `A lost frequency. The path to this blade has not yet been forged.`;
  }
  return `A key from ${producer.domain.replace(/-/g, ' ')} — the frequency is still closed to you.`;
}

/* One crystalline blade render */
function CrystalBlade({ tool, unlocked, accent, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      data-testid={`blade-${tool.id}`}
      className="relative rounded-xl px-3 py-3 text-left overflow-hidden"
      style={{
        background: unlocked ? `${accent}14` : 'rgba(15,15,20,0.65)',
        border: `1px solid ${unlocked ? accent + '66' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: unlocked ? `0 0 18px ${accent}33 inset` : 'none',
        opacity: unlocked ? 1 : 0.62,
        aspectRatio: '1 / 1',
        minHeight: 76,
      }}
    >
      {/* Crystal facet SVG */}
      <svg viewBox="0 0 48 48" className="absolute top-1.5 right-1.5 opacity-80" width="22" height="22" aria-hidden>
        <defs>
          <linearGradient id={`g-${tool.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={unlocked ? '#ffffff' : '#44444a'} stopOpacity="0.9" />
            <stop offset="100%" stopColor={unlocked ? accent : '#222228'} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <polygon points="24,3 42,18 36,42 12,42 6,18" fill={`url(#g-${tool.id})`} stroke={unlocked ? accent : '#2a2a30'} strokeWidth="1" />
        <polyline points="24,3 24,42" stroke={unlocked ? accent : '#333338'} strokeWidth="0.4" opacity="0.5" />
        <polyline points="6,18 42,18" stroke={unlocked ? accent : '#333338'} strokeWidth="0.4" opacity="0.5" />
      </svg>

      {!unlocked && (
        <Lock size={11} className="absolute top-2 left-2" style={{ color: '#5a5a65' }} />
      )}

      <div className="mt-6 text-[11px] font-bold leading-tight sov-telemetry" style={{ color: unlocked ? '#fff' : '#9097a6' }}>
        {tool.id.split('.')[1]?.replace(/-/g, ' ') || tool.id}
      </div>
      <div className="text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: unlocked ? accent : '#52525b' }}>
        {tool.domain}
      </div>
      <div className="text-[9px] mt-1.5 sov-telemetry" style={{ color: unlocked ? '#cbd5e1' : '#71717a' }}>
        +{tool.sparks}◆
      </div>
    </motion.button>
  );
}

export default function ToolDrawer({ open, onClose }) {
  const [ticker, setTicker] = useState(0); // re-render on preference changes
  const [earnedKeys] = useState(() => new Set()); // TODO: wire to quest state
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    return SovereignPreferences.subscribe(() => setTicker(t => t + 1));
  }, []);

  const allTools = useMemo(() => SovereignBridge.allTools(), []);
  const unlockIndex = useMemo(() => buildUnlockIndex(allTools), [allTools]);
  const prefs = SovereignPreferences.get();
  const accentMap = prefs.visual.skin === 'refracted-crystal'
    ? { entertainment: '#FBBF24', educational: '#FFFFFF', utility: '#F59E0B' }
    : { entertainment: '#F0ABFC', educational: '#22D3EE', utility: '#FBBF24' };

  const grouped = useMemo(() => {
    const g = { entertainment: [], educational: [], utility: [] };
    for (const t of allTools) g[bladeOf(t)].push(t);
    // Within each blade, sort by domain then tool id
    for (const k of Object.keys(g)) {
      g[k].sort((a, b) => (a.domain === b.domain ? a.id.localeCompare(b.id) : a.domain.localeCompare(b.domain)));
    }
    return g;
  }, [allTools, ticker]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalCount = allTools.length;
  const unlockedCount = allTools.filter(t => t.requires.every(k => earnedKeys.has(k))).length;

  const handleClick = (tool) => {
    const unlocked = tool.requires.every(k => earnedKeys.has(k));
    if (!unlocked) {
      setSelected(tool);
      return;
    }
    try {
      SovereignKernel.interact(tool.id, { context: 'tool-drawer', resonance: 'crystal' });
    } catch (e) {
      /* assertRegistered throws in dev — UI keeps working */
      console.warn(e);
    }
    onClose?.();
  };

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(5,5,12,0.92)', backdropFilter: 'blur(18px)',
          display: 'flex', flexDirection: 'column',
        }}
        data-testid="tool-drawer"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.36em]" style={{ color: '#C084FC' }}>Sovereign Arsenal</p>
            <h2 className="text-2xl font-light mt-0.5" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
              The Swiss Army Knife
            </h2>
            <p className="text-[11px] sov-telemetry" style={{ color: 'var(--text-muted)' }}>
              {unlockedCount} of {totalCount} blades earned · {Math.round((unlockedCount / totalCount) * 100)}% of the knife forged
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition" data-testid="tool-drawer-close">
            <X size={18} style={{ color: '#cbd5e1' }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5" style={{ WebkitOverflowScrolling: 'touch' }}>
          {['entertainment', 'educational', 'utility'].map(blade => {
            const meta = BLADE_META[blade];
            const accent = accentMap[blade];
            const list = grouped[blade];
            if (!list.length) return null;
            return (
              <section key={blade} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <meta.icon size={14} style={{ color: accent }} />
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: accent }}>
                    {meta.label}
                  </p>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    — {meta.subtitle} · {list.length} blades
                  </span>
                </div>
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}
                >
                  {list.map(tool => {
                    const unlocked = tool.requires.every(k => earnedKeys.has(k));
                    return (
                      <CrystalBlade
                        key={tool.id}
                        tool={tool}
                        unlocked={unlocked}
                        accent={accent}
                        onClick={() => handleClick(tool)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Cryptic-hint overlay (small inline card, NOT a modal — Flatland OK because it is inside the drawer stack) */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="px-5 py-4 border-t"
              style={{
                background: 'rgba(15,15,25,0.96)',
                borderColor: 'rgba(255,255,255,0.08)',
                color: '#cbd5e1',
              }}
              data-testid="blade-hint"
            >
              <div className="flex items-start gap-3">
                <Lock size={16} style={{ color: '#F0ABFC', marginTop: 2 }} />
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-[0.3em] mb-1" style={{ color: '#F0ABFC' }}>
                    Blade Locked · {selected.domain}
                  </p>
                  <p className="text-[13px]" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, lineHeight: 1.5 }}>
                    {crypticHint(selected, unlockIndex) || 'No hint. You must discover this path.'}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-[10px] uppercase tracking-[0.2em] hover:text-white transition"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
