import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Shield } from 'lucide-react';
import { TIERS, purchaseTier, getTier } from '../kernel/SovereignTiers';
import LabAudio from '../kernel/LabAudio';

/**
 * BuyTimePanel — luxury-styled tier upgrade portal.
 * Opens from the Arsenal header. On "purchase" (stub, no Stripe yet)
 * fires playGilded() — the 432+864Hz chord. Never 528Hz.
 */
export default function BuyTimePanel({ open, onClose }) {
  const [currentTier, setCurrentTier] = useState(getTier());
  const [justPurchased, setJustPurchased] = useState(null);

  useEffect(() => {
    const onT = () => setCurrentTier(getTier());
    window.addEventListener('sovereign:tier', onT);
    return () => window.removeEventListener('sovereign:tier', onT);
  }, []);

  if (!open || typeof document === 'undefined') return null;

  const buy = (t) => {
    // TODO: wire Stripe via integration_playbook_expert_v2 in a dedicated
    // Phase-3 session. For now this records intent and unlocks locally.
    purchaseTier(t.id);
    setJustPurchased(t.id);
    LabAudio.playGilded();
    setTimeout(() => setJustPurchased(null), 1800);
  };

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
              Buy Time · Gilded Path
            </p>
          </div>
          <h2 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
            Skip the forge. Keep the work optional.
          </h2>
          <p className="text-sm mt-1 mb-5" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif', fontSize: 16 }}>
            Earning every blade is always free. Gilded tiers unlock instantly — they do not replace the 528Hz
            Resonance Click, which stays exclusive to earned mastery.
          </p>

          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {TIERS.map(t => {
              const active = currentTier === t.id;
              return (
                <motion.button
                  key={t.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => buy(t)}
                  data-testid={`tier-${t.id}`}
                  className="rounded-xl px-4 py-4 text-left relative overflow-hidden"
                  style={{
                    background: active ? `${t.color}1f` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? t.color + '88' : t.color + '44'}`,
                    boxShadow: active ? `0 0 28px ${t.color}44` : 'none',
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
                  {justPurchased === t.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: `${t.color}88`, color: '#fff', fontFamily: 'Cormorant Garamond, serif', fontSize: 22 }}
                    >
                      Gilded
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Shield size={12} style={{ color: 'var(--text-muted)' }} />
            <p className="text-[10px] uppercase tracking-[0.22em] sov-telemetry" style={{ color: 'var(--text-muted)' }}>
              Stripe integration wired in G6 Phase 3 · purchases currently local-only
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
