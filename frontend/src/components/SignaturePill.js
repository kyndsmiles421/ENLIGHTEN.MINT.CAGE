import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pin, PinOff } from 'lucide-react';
import SovereignPreferences from '../kernel/SovereignPreferences';
import { getSignature, pinSignature, unpinSignature } from '../kernel/BladeSignature';

/**
 * SignaturePill — shows the Sovereign's LIVE blade signature.
 * Tap the pin icon to lock the current title (defies further drift)
 * or unpin to return to auto-truth.
 */
export default function SignaturePill() {
  const [tick, setTick] = useState(0);
  const [sig, setSig] = useState(() => getSignature());

  useEffect(() => {
    const onChange = () => { setSig(getSignature()); setTick(t => t + 1); };
    const unsub = SovereignPreferences.subscribe(onChange);
    window.addEventListener('sovereign:mastery', onChange);
    return () => { unsub && unsub(); window.removeEventListener('sovereign:mastery', onChange); };
  }, []);

  const togglePin = (e) => {
    e.stopPropagation();
    if (sig.pinned) unpinSignature();
    else pinSignature(sig.derivedTitle);
  };

  return (
    <motion.div
      key={tick}
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-3 px-4 py-2 rounded-full"
      style={{
        background: 'rgba(192, 132, 252, 0.10)',
        border: '1px solid rgba(192, 132, 252, 0.32)',
        boxShadow: '0 0 22px rgba(192, 132, 252, 0.12)',
      }}
      data-testid="signature-pill"
    >
      <div>
        <div className="flex items-center gap-2">
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#C084FC' }}>
            Blade Signature
          </p>
          {sig.pinned && (
            <span className="text-[9px] uppercase tracking-[0.22em] px-1.5 py-0.5 rounded" style={{ background: 'rgba(251,191,36,0.18)', color: '#FCD34D' }}>
              Pinned
            </span>
          )}
        </div>
        <p
          className="text-[15px] leading-tight"
          style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}
          data-testid="signature-title"
        >
          {sig.title}
        </p>
        <p className="text-[10px] mt-0.5 sov-telemetry" style={{ color: 'var(--text-muted)' }}>
          {sig.subtitle}
        </p>
      </div>
      <button
        onClick={togglePin}
        className="p-2 rounded-full hover:bg-white/5 transition"
        title={sig.pinned ? 'Unpin — return to auto-truth' : 'Pin this title'}
        data-testid="signature-pin-toggle"
      >
        {sig.pinned
          ? <PinOff size={14} style={{ color: '#FCD34D' }} />
          : <Pin size={14} style={{ color: '#C084FC' }} />}
      </button>
    </motion.div>
  );
}
