import React, { useEffect, useState } from 'react';
import { Shield, Check } from 'lucide-react';

/**
 * MedicalDisclaimerSplash — Flatland-compliant inline banner.
 *
 * Renders INLINE at the top of the document flow (no portal, no fixed,
 * no overlay, no z-index). When visible it pushes the rest of the page
 * down. When acknowledged it unmounts and the page snaps back. This
 * preserves the "Reviewer Handshake" posture without ever blocking
 * a tap on the underlying UI.
 *
 * Storage keys (shared with public/landing.html static mirror):
 *   disclaimer_acknowledged       = "true" | missing
 *   disclaimer_acknowledged_at    = ISO timestamp
 *   disclaimer_version            = integer (bump to force re-ack)
 */

const DISCLAIMER_VERSION = 1;
const STORAGE_KEY = 'disclaimer_acknowledged';
const STORAGE_VERSION_KEY = 'disclaimer_version';
const STORAGE_DATE_KEY = 'disclaimer_acknowledged_at';

export default function MedicalDisclaimerSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const ack = localStorage.getItem(STORAGE_KEY);
      const ver = parseInt(localStorage.getItem(STORAGE_VERSION_KEY) || '0', 10);
      if (ack !== 'true' || ver < DISCLAIMER_VERSION) setVisible(true);
    } catch {
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

  if (!visible) return null;

  return (
    <section
      data-testid="medical-disclaimer-splash"
      style={{
        position: 'relative',          // INLINE — flows in document, pushes content down
        width: '100%',
        background: 'linear-gradient(135deg, rgba(22,18,10,0.96), rgba(10,8,14,0.96))',
        borderBottom: '1px solid rgba(251,191,36,0.28)',
        boxShadow: 'inset 0 -1px 0 rgba(251,191,36,0.10)',
        padding: '28px 22px',
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,191,36,0.18), rgba(251,191,36,0.02))',
            border: '1px solid rgba(251,191,36,0.36)',
            marginBottom: 14,
          }}
        >
          <Shield size={24} style={{ color: '#FCD34D' }} />
        </div>

        <p
          style={{
            color: '#FBBF24',
            fontFamily: 'monospace',
            fontSize: 10,
            letterSpacing: '0.34em',
            textTransform: 'uppercase',
            margin: '0 0 6px 0',
          }}
        >
          A Sovereign Entertainment Instrument
        </p>

        <h2
          style={{
            color: '#fff',
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 300,
            fontSize: 24,
            lineHeight: 1.2,
            margin: '0 0 14px 0',
          }}
        >
          For Information &amp; Entertainment Purposes Only.
        </h2>

        <p
          style={{
            color: 'rgba(226,232,240,0.86)',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 15,
            lineHeight: 1.55,
            margin: '0 0 8px 0',
          }}
        >
          ENLIGHTEN.MINT.CAFE is an entertainment, education, and gamification
          platform. It is <em>not</em> a medical device, diagnostic tool, or
          substitute for professional care.
        </p>

        <p
          style={{
            color: 'rgba(203,213,225,0.76)',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 14,
            lineHeight: 1.55,
            margin: '0 0 18px 0',
          }}
        >
          The Reflexology maps, herbology data, acupressure guides, and Sage AI
          interactions are provided for entertainment, education, and
          gamification purposes. Do not use this app to diagnose, treat, cure,
          or prevent any condition. For medical concerns, consult a licensed
          professional.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
            margin: '0 0 18px 0',
            opacity: 0.78,
          }}
        >
          {['INFORMATION', 'ENTERTAINMENT', 'NOT MEDICAL ADVICE'].map(tag => (
            <span
              key={tag}
              style={{
                background: 'rgba(251,191,36,0.08)',
                border: '1px solid rgba(251,191,36,0.24)',
                color: '#FCD34D',
                fontFamily: 'monospace',
                fontSize: 9,
                letterSpacing: '0.18em',
                padding: '5px 10px',
                borderRadius: 999,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={acknowledge}
          data-testid="medical-disclaimer-acknowledge"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.24), rgba(251,191,36,0.10))',
            border: '1px solid rgba(251,191,36,0.48)',
            color: '#FCD34D',
            fontFamily: 'monospace',
            fontSize: 12,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            padding: '12px 30px',
            borderRadius: 999,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 8px 32px rgba(251,191,36,0.14)',
          }}
        >
          <Check size={14} />
          I Understand · Proceed
        </button>

        <p
          style={{
            marginTop: 18,
            color: 'rgba(148,163,184,0.55)',
            fontFamily: 'monospace',
            fontSize: 9,
            letterSpacing: '0.18em',
          }}
        >
          Full terms at{' '}
          <a
            href="/terms"
            style={{ color: 'rgba(148,163,184,0.85)', textDecoration: 'underline' }}
          >
            /terms
          </a>{' '}
          · Honor your body · Consult a licensed professional
        </p>
      </div>
    </section>
  );
}
