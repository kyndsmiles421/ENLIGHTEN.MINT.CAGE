import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Flame, Sparkles } from 'lucide-react';
import SovereignTrial from '../kernel/SovereignTrial';

/**
 * TrialCountdown — the top-of-Hub 24h countdown + expiration banner.
 * Starts the trial on first mount; re-renders every second to tick.
 */
export default function TrialCountdown() {
  const [trial, setTrial] = useState(() => SovereignTrial.ensureTrial());
  const [remaining, setRemaining] = useState(() => SovereignTrial.msRemaining());
  const [justExpired, setJustExpired] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const next = SovereignTrial.getTrial();
      setTrial(next);
      setRemaining(SovereignTrial.msRemaining());
    };
    window.addEventListener('sovereign:trial', onChange);
    const interval = setInterval(() => {
      const r = SovereignTrial.msRemaining();
      const wasActive = trial?.status === 'active';
      setRemaining(r);
      if (wasActive && r <= 0) {
        setJustExpired(true);
        SovereignTrial.getTrial(); // forces status → 'expired' + event
        setTimeout(() => setJustExpired(false), 4500);
      }
    }, 1000);
    return () => { clearInterval(interval); window.removeEventListener('sovereign:trial', onChange); };
  }, [trial?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!trial) return null;

  const fmt = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${ss}`;
  };

  if (trial.status === 'active') {
    return (
      <motion.div
        initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="mx-auto mb-3 inline-flex items-center gap-3 px-4 py-2 rounded-full"
        style={{
          background: 'linear-gradient(90deg, rgba(251,191,36,0.14), rgba(192,132,252,0.14))',
          border: '1px solid rgba(251,191,36,0.4)',
          boxShadow: '0 0 22px rgba(251,191,36,0.15)',
        }}
        data-testid="trial-countdown"
      >
        <Sparkles size={14} style={{ color: '#FBBF24' }} />
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] sov-telemetry" style={{ color: '#FBBF24' }}>
            Sovereign Access · 24-Hour Trial
          </p>
          <p className="text-[14px] font-bold sov-telemetry" style={{ color: '#FEF3C7' }}>
            {fmt(remaining)}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="mx-auto mb-3 inline-flex items-center gap-3 px-4 py-2 rounded-full"
        style={{
          background: 'rgba(15,15,25,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        data-testid="trial-expired-pill"
      >
        <Flame size={12} style={{ color: 'var(--text-muted)' }} />
        <p className="text-[10px] uppercase tracking-[0.28em] sov-telemetry" style={{ color: 'var(--text-muted)' }}>
          Trial ended · Choose: Forge or Gilded
        </p>
      </motion.div>

      <AnimatePresence>
        {justExpired && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9997,
              background: 'radial-gradient(circle at center, rgba(251,191,36,0.22), rgba(5,5,12,0.95))',
              backdropFilter: 'blur(14px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            data-testid="fractal-reset"
          >
            <motion.div
              initial={{ scale: 0.9, filter: 'hue-rotate(0deg)' }}
              animate={{ scale: 1, filter: ['hue-rotate(0deg)', 'hue-rotate(30deg)', 'hue-rotate(0deg)'] }}
              transition={{ duration: 2.2 }}
              className="text-center px-6"
            >
              <Clock size={28} style={{ color: '#FBBF24', margin: '0 auto 16px' }} />
              <p className="text-[10px] uppercase tracking-[0.38em] mb-2 sov-telemetry" style={{ color: '#FBBF24' }}>
                Fractal Reset
              </p>
              <h2 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
                The glimpse of the Sovereign ends.
              </h2>
              <p className="text-lg mt-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#E9D5FF', fontStyle: 'italic' }}>
                Choose your path: Forge your mastery or Gilded your journey.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
