/**
 * DailyCrossTraditionPairing.jsx — V68.94 Sovereign Hub Daily Surface
 *
 * Pulls today's deterministic concept-bridge from /api/companions/daily
 * and renders it as a single inline card on the Sovereign Hub. Every
 * visitor sees the SAME pairing on a given UTC day, refreshing at
 * midnight UTC. Rotation cycles through every concept before repeating.
 *
 * Why this lives on the Hub:
 *   • Re-engagement seed — gives users a daily reason to open the app
 *   • Showcase — surfaces the V68.92/V68.93 cross-tradition engine
 *     so users understand it exists without hunting for it
 *   • Zero new endpoints from the user-build perspective; the daily
 *     pick is a server-side concern
 *
 * Flatland rules:
 *   • Inline flex card. No overlay, no modal, no z-index war.
 *   • Empty state → return null (component disappears entirely).
 *   • Failure state → return null (no toast, no error UI; the Hub
 *     does not need to apologize for a soft feature).
 *
 * Forward-compat hooks already wired:
 *   • Each tradition pill carries `data-companion-id` so a future
 *     "Open this scripture" handler can be attached without prop
 *     surgery (e.g., when the V68.95 Tesseract Relic awards a
 *     Cross-Tradition Mastery trophy on study completion).
 *   • `concept` is rendered as a stable data attribute for the same
 *     gamification consumer.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Link2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Pretty-print a snake_case concept like "sacred_sound" → "Sacred Sound".
const prettify = (s = '') =>
  s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function DailyCrossTraditionPairing({ onCompanionClick }) {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API}/companions/daily`)
      .then((r) => { if (!cancelled) setData(r.data); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  // Graceful empty: render nothing until loaded; render nothing if API
  // gave us no concept or no companions (Flatland — no apology UI).
  if (!loaded) return null;
  if (!data || !data.concept || !Array.isArray(data.companions) || data.companions.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="daily-cross-tradition-pairing"
      data-concept={data.concept}
      data-date-utc={data.date_utc}
      style={{
        width: '100%',
        padding: '14px 16px',
        borderRadius: 14,
        background: 'rgba(168,85,247,0.06)',
        border: '1px solid rgba(168,85,247,0.22)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Sparkles size={12} style={{ color: '#C4B5FD' }} />
        <span
          data-testid="daily-pairing-label"
          style={{
            fontSize: 9,
            fontFamily: 'monospace',
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: '#C4B5FD',
          }}
        >
          Today’s Cross-Tradition Pairing
        </span>
      </div>

      <div
        data-testid="daily-pairing-concept"
        style={{
          fontSize: 18,
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.92)',
          letterSpacing: '0.02em',
        }}
      >
        {prettify(data.concept)}
      </div>

      <ul
        data-testid="daily-pairing-list"
        style={{
          listStyle: 'none', padding: 0, margin: 0,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}
      >
        {data.companions.map((c, i) => (
          <li
            key={`${c.id}-${i}`}
            data-testid={`daily-pairing-item-${c.id}`}
            data-companion-id={c.id}
            onClick={() => onCompanionClick?.(c)}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              background: 'rgba(168,85,247,0.05)',
              border: '1px solid rgba(168,85,247,0.18)',
              cursor: onCompanionClick ? 'pointer' : 'default',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 10, color: '#A78BFA', fontFamily: 'monospace',
                letterSpacing: '0.10em', textTransform: 'uppercase',
              }}
            >
              <Link2 size={10} />
              {c.tradition}
              {c.chapter && (
                <span style={{ color: '#64748B', marginLeft: 4 }}>· {c.chapter}</span>
              )}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.82)',
                fontStyle: 'italic',
                lineHeight: 1.5,
              }}
            >
              {c.why}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
