/**
 * ComplianceShieldPill — Flatland-compliant Google Play policy badge.
 *
 * Rules honored:
 *   • No position:fixed / z-index / portal / modal.
 *   • Inline flex element that expands IN PLACE when tapped.
 *   • Renders as scrolling page content — part of the header row beside
 *     the Sage Gauge. Collapsed = pill. Expanded = inline rule list.
 *
 * Reads /api/trade-circle/compliance (public — policy_manifest()).
 * Caches the manifest for 10 minutes to avoid hammering the endpoint.
 */
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Lock, ChevronDown } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
let _manifestCache = null;
let _manifestCachedAt = 0;

export function ComplianceShieldPill() {
  const [manifest, setManifest] = useState(_manifestCache);
  const [open, setOpen] = useState(false);

  const fetchManifest = useCallback(async () => {
    const now = Date.now();
    if (_manifestCache && now - _manifestCachedAt < 10 * 60 * 1000) {
      setManifest(_manifestCache);
      return;
    }
    try {
      const { data } = await axios.get(`${API}/trade-circle/compliance`);
      _manifestCache = data;
      _manifestCachedAt = now;
      setManifest(data);
    } catch {
      /* silent — pill just stays in collapsed state if API is down */
    }
  }, []);

  useEffect(() => { fetchManifest(); }, [fetchManifest]);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        data-testid="compliance-shield-pill"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 999,
          background: open ? 'rgba(34,197,94,0.20)' : 'rgba(34,197,94,0.10)',
          border: `1px solid rgba(34,197,94,${open ? 0.55 : 0.30})`,
          color: '#22C55E', fontFamily: 'monospace',
          fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
          cursor: 'pointer', flexShrink: 0,
        }}
      >
        <Lock size={10} />
        <span>Closed-Loop</span>
        <ChevronDown size={10} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 180ms' }} />
      </button>

      {/* Inline expansion — part of the document flow, not an overlay.
          Renders below the pill, pushes sibling content down. */}
      {open && manifest && (
        <div
          data-testid="compliance-shield-details"
          style={{
            marginTop: 8, padding: '10px 12px', borderRadius: 10,
            background: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.18)',
            color: 'rgba(255,255,255,0.82)', fontSize: 11, lineHeight: 1.5,
            maxWidth: 340,
          }}
        >
          <div style={{ color: '#22C55E', fontWeight: 600, marginBottom: 6, letterSpacing: '0.1em' }}>
            {manifest.compliance_reference}
          </div>
          <div style={{ marginBottom: 6, opacity: 0.7 }}>
            Monetary: {(manifest.monetary_assets || []).join(', ')} · Merit: {(manifest.merit_assets || []).join(', ')}
          </div>
          <ul style={{ listStyle: 'disc', paddingLeft: 18, margin: 0 }}>
            {(manifest.rules || []).map((r, i) => (
              <li key={i} style={{ marginBottom: 3 }}>{r}</li>
            ))}
          </ul>
          <div style={{ marginTop: 8, fontSize: 9, opacity: 0.5, letterSpacing: '0.15em' }}>
            Version {manifest.version}
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplianceShieldPill;
