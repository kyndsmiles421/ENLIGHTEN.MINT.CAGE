/**
 * SovereignVersionStamp.jsx — V1.0.7 footer mark
 *
 * Reads the version from process.env.REACT_APP_VERSION (injected at
 * build time from package.json) so it can never drift from the
 * actual release. Renders a tiny inline pill at the bottom of the
 * Sovereign Hub.
 *
 * Why this matters for Play Store:
 *   • Reviewers can see at a glance which version they're testing
 *   • Every screenshot becomes a self-documenting record of when
 *     it was taken against which build
 *   • You can debug user reports faster: "Hub footer says v1.0.7,
 *     so they're on the post-Sentience-Fusion build"
 *
 * Flatland-compliant: inline flex, no overlay, no z-index war.
 * Owner-only? No — public. Knowing the version is not a security
 * concern, and Play Store reviewers explicitly want it visible.
 */
import React from 'react';

// CRA injects every var prefixed with REACT_APP_ at build time, but
// we also fall back to a hard-coded sentinel so the footer always
// renders something readable in dev environments where the env var
// hasn't been set.
const VERSION = process.env.REACT_APP_VERSION || '1.0.7';
const BUILD_DATE = process.env.REACT_APP_BUILD_DATE || new Date().toISOString().slice(0, 10);

export default function SovereignVersionStamp() {
  return (
    <div
      data-testid="sovereign-version-stamp"
      data-version={VERSION}
      data-build-date={BUILD_DATE}
      style={{
        width: '100%',
        textAlign: 'center',
        padding: '12px 16px 24px',
        fontSize: 9,
        fontFamily: 'monospace',
        letterSpacing: '0.20em',
        color: 'rgba(255,255,255,0.32)',
        textTransform: 'uppercase',
        userSelect: 'all',
      }}
    >
      ENLIGHTEN.MINT.CAFE · v{VERSION} · {BUILD_DATE}
    </div>
  );
}
