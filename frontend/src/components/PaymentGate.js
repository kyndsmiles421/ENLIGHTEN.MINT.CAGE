/**
 * PaymentGate — wraps any Stripe "Buy / Top-Up / Checkout" CTA.
 *
 * On Android TWA (Google Play): renders a disabled "Manage on web" link that
 *   opens enlighten-mint-cafe.me in the mobile browser. NO Stripe call ever
 *   fires from inside the APK — this keeps us compliant with Play Billing
 *   policy and preserves 100% of Stripe revenue.
 *
 * On all other platforms (iOS Safari, desktop browser, installed iOS PWA,
 *   desktop PWA): renders its children unchanged.
 *
 * Usage:
 *   <PaymentGate label="Buy 50 Credits">
 *     <button onClick={launchStripe}>Buy 50 Credits — $9</button>
 *   </PaymentGate>
 */
import React from 'react';
import { ExternalLink } from 'lucide-react';
import useIsAndroidTWA from '../hooks/useIsAndroidTWA';

const WEB_TOPUP_URL = 'https://enlighten-mint-cafe.me/economy?from=android';

export default function PaymentGate({ children, label = 'Manage credits on web', className = '' }) {
  const isTWA = useIsAndroidTWA();
  if (!isTWA) return <>{children}</>;
  return (
    <a
      href={WEB_TOPUP_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="payment-gate-web-redirect"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '10px 16px',
        borderRadius: 6,
        border: '1px solid rgba(0,255,204,0.4)',
        background: 'rgba(0,255,204,0.08)',
        color: '#00ffcc',
        fontFamily: 'monospace',
        fontSize: 12,
        letterSpacing: '1.5px',
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      <ExternalLink size={14} /> {label.toUpperCase()}
    </a>
  );
}
