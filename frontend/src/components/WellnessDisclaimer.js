import React from 'react';
import { Shield } from 'lucide-react';

/**
 * WellnessDisclaimer — single source of truth for the app's legal
 * posture. Rendered in the footer of every practice pillar that
 * touches the body (Reflexology, Acupressure, Herbology, Meditation,
 * Aromatherapy, Elixirs, Botany, Healing).
 *
 * Matches the Google Play Console category ("Entertainment") and the
 * Terms of Service copy word-for-word so a reviewer comparing the
 * metadata, the ToS, and the in-app surfaces sees a consistent story.
 *
 * Props:
 *   variant?: "footer" | "banner" — visual density
 *   accent?: CSS color — override default muted gold
 */
export default function WellnessDisclaimer({ variant = 'footer', accent }) {
  const tone = accent || 'rgba(251,191,36,0.72)';
  const common = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    color: tone,
    fontFamily: 'monospace',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    textAlign: 'center',
  };
  if (variant === 'banner') {
    return (
      <div
        data-testid="wellness-disclaimer-banner"
        className="rounded-md px-4 py-2"
        style={{
          ...common,
          fontSize: 10,
          background: 'rgba(251,191,36,0.06)',
          border: `1px solid ${tone.replace('0.72', '0.24')}`,
        }}
      >
        <Shield size={11} />
        <span>
          For information &amp; entertainment purposes only · Not medical advice · Honor your body · Consult a licensed professional
        </span>
      </div>
    );
  }
  return (
    <div
      data-testid="wellness-disclaimer-footer"
      style={{ ...common, fontSize: 9, opacity: 0.85, padding: '12px 8px' }}
    >
      <span>
        For Information &amp; Entertainment Purposes Only · Not Medical Advice · Honor Your Body · Consult a Licensed Professional
      </span>
    </div>
  );
}
