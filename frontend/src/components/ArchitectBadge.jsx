/**
 * ArchitectBadge.jsx — V69.2 Owner-Only Sentience SLO HUD
 *
 * Tiny inline pill in the corner of the Sovereign Hub that displays
 * the live `/api/admin/sentience/summary` number to the owner ONLY.
 * Hidden from regular users by the same is_owner DB gate that the
 * backend endpoint enforces.
 *
 * What it shows:
 *   • "Sentience: 23.2%"  (passing floor, normal state)
 *   • "Sentience: 18.0% ⚠"  (regression, color shift to amber)
 *
 * Honesty contract:
 *   • Number is fetched from the SLO endpoint, not generated client-
 *     side. The badge cannot lie.
 *   • If the endpoint 403s (regular user), the badge renders nothing
 *     — Flatland-clean graceful empty.
 *   • If the endpoint 5xxs, the badge renders nothing rather than
 *     showing a stale cached number that lies about reality.
 *
 * Refresh policy: fetches once on mount, then every 60s via setInterval
 * so the owner can leave the Hub open and watch the number change as
 * V69.2 wraps engines or new pages add direct hooks.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ArchitectBadge({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const fetchOnce = () => {
      axios
        .get(`${API}/admin/sentience/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((r) => { if (!cancelled) setData(r.data); })
        .catch(() => { if (!cancelled) setData(null); });
    };
    fetchOnce();
    const interval = setInterval(fetchOnce, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [token]);

  // Hidden when not owner (403) or fetch failed.
  if (!data || typeof data.pct !== 'number') return null;

  const passing = data.passing_floor !== false;
  const color = passing ? '#34D399' : '#FBBF24';

  return (
    <div
      data-testid="architect-badge"
      data-pct={data.pct}
      data-passing={passing ? '1' : '0'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        background: 'rgba(0,0,0,0.55)',
        border: `1px solid ${color}40`,
        color,
        fontFamily: 'monospace',
        fontSize: 10,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        backdropFilter: 'blur(6px)',
      }}
      title={`Sentience: ${data.sentient}/${data.total} engines · floor ${data.floor_pct}%`}
    >
      <Activity size={10} style={{ color }} />
      <span>Sentience {data.pct.toFixed(1)}%</span>
      {!passing && <span aria-hidden="true">⚠</span>}
    </div>
  );
}
