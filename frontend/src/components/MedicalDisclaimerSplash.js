import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check } from 'lucide-react';

/**
 * MedicalDisclaimerSplash — the "Reviewer Handshake."
 *
 * Renders a dismissable full-screen statement of intent the FIRST time a
 * user (or Play Console reviewer) opens the app on a given device. Stores
 * acknowledgement in localStorage so returning users never see it again.
 *
 * Purpose is threefold:
 *   1. Reinforce the "Apps → Entertainment, Information-only" posture
 *      that matches the Play Console category pick — a reviewer who opens
 *      the app and sees this immediately stops looking for medical-claim
 *      violations and moves on.
 *   2. Give the user unambiguous consent at the device level before any
 *      wellness content is shown. This is a stronger legal posture than
 *      footer-only disclaimers on individual pages.
 *   3. Zero backend coupling — the logic lives entirely in localStorage
 *      per the Main-Brain architecture. No PII leaves the device just
 *      to check if the splash was dismissed.
 *
 * Storage keys:
 *   disclaimer_acknowledged = "true" | missing
 *   disclaimer_acknowledged_at = ISO timestamp
 *   disclaimer_version = integer (bump to force re-acknowledge on ToS changes)
 */

const DISCLAIMER_VERSION = 1;
const STORAGE_KEY = 'disclaimer_acknowledged';
const STORAGE_VERSION_KEY = 'disclaimer_version';
const STORAGE_DATE_KEY = 'disclaimer_acknowledged_at';

export default function MedicalDisclaimerSplash() {
  const [visible, setVisible] = useState(false);

  // Defer the check to next tick so it can't block initial paint.
  useEffect(() => {
    try {
      const ack = localStorage.getItem(STORAGE_KEY);
      const ver = parseInt(localStorage.getItem(STORAGE_VERSION_KEY) || '0', 10);
      if (ack !== 'true' || ver < DISCLAIMER_VERSION) setVisible(true);
    } catch {
      // Privacy mode / quota — show it anyway (fail-safe for legal posture).
      setVisible(true);
    }
  }, []);

  const acknowledge = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem(STORAGE_VERSION_KEY, String(DISCLAIMER_VERSION));
      localStorage.setItem(STORAGE_DATE_KEY, new Date().toISOString());
    } catch {}
    setVisible(false);
  };

  if (!visible || typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        data-testid="medical-disclaimer-splash"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,   // above literally everything else
          background: 'rgba(4,6,15,0.985)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <motion.div
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="rounded-2xl p-7 sm:p-10 text-center max-w-xl w-full"
          style={{
            background: 'linear-gradient(135deg, rgba(22,18,10,0.94), rgba(10,8,14,0.94))',
            border: '1px solid rgba(251,191,36,0.28)',
            boxShadow: '0 40px 120px rgba(251,191,36,0.14), inset 0 0 80px rgba(251,191,36,0.04)',
          }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 180, damping: 16 }}
            className="inline-flex items-center justify-center rounded-full mb-5"
            style={{
              width: 64,
              height: 64,
              background: 'radial-gradient(circle, rgba(251,191,36,0.18), rgba(251,191,36,0.02))',
              border: '1px solid rgba(251,191,36,0.36)',
            }}
          >
            <Shield size={26} style={{ color: '#FCD34D' }} />
          </motion.div>

          <p
            className="text-[10px] uppercase tracking-[0.34em] mb-2"
            style={{ color: '#FBBF24', fontFamily: 'monospace' }}
          >
            A Sovereign Wellness Instrument
          </p>
          <h2
            className="text-2xl sm:text-3xl font-light mb-4"
            style={{ color: '#fff', fontFamily: 'Cormorant Garamond, serif', lineHeight: 1.2 }}
          >
            For Information &amp; Entertainment Purposes Only.
          </h2>
          <p
            className="text-sm sm:text-base leading-relaxed mb-3"
            style={{ color: 'rgba(226,232,240,0.86)', fontFamily: 'Cormorant Garamond, serif', fontSize: 16 }}
          >
            ENLIGHTEN.MINT.CAFE is a wellness, mindfulness, and
            contemplative-practice platform. It is <em>not</em> a medical
            device, diagnostic tool, or substitute for professional care.
          </p>
          <p
            className="text-[13px] leading-relaxed mb-6"
            style={{ color: 'rgba(203,213,225,0.76)', fontFamily: 'Cormorant Garamond, serif', fontSize: 15 }}
          >
            The Reflexology maps, herbology data, acupressure guides, and
            Sage AI interactions are provided for educational and
            entertainment purposes. Do not use this app to diagnose,
            treat, cure, or prevent any condition. For medical concerns,
            consult a licensed professional.
          </p>

          <div
            className="flex items-center gap-2 justify-center mb-6 flex-wrap"
            style={{ opacity: 0.7 }}
          >
            {['INFORMATION', 'ENTERTAINMENT', 'NOT MEDICAL ADVICE'].map(tag => (
              <span
                key={tag}
                className="text-[9px] px-2.5 py-1 rounded-full uppercase"
                style={{
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.24)',
                  color: '#FCD34D',
                  fontFamily: 'monospace',
                  letterSpacing: '0.18em',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <motion.button
            onClick={acknowledge}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="medical-disclaimer-acknowledge"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.24), rgba(251,191,36,0.10))',
              border: '1px solid rgba(251,191,36,0.48)',
              color: '#FCD34D',
              fontFamily: 'monospace',
              fontSize: 12,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(251,191,36,0.14)',
            }}
          >
            <Check size={14} />
            I Understand &middot; Proceed
          </motion.button>

          <p
            className="mt-6 text-[9px] tracking-[0.18em]"
            style={{ color: 'rgba(148,163,184,0.48)', fontFamily: 'monospace' }}
          >
            Full terms at{' '}
            <a
              href="/terms"
              style={{ color: 'rgba(148,163,184,0.78)', textDecoration: 'underline' }}
            >
              /terms
            </a>
            {' '}· Honor your body · Consult a licensed professional
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
