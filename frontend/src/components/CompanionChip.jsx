/**
 * CompanionChip.jsx — V68.93 Cross-Tradition Bridge UI
 *
 * Surfaces the V68.92 ordained companion-pairings inline next to a
 * sacred text. When a reader opens "Surah Maryam," this chip fetches
 * /api/companions/maryam → Luke 1 + Bhagavad Gita 4 → renders them
 * as clickable cross-tradition pills.
 *
 * Why this lives separately from TranslateChip:
 *   • Different network call (/api/companions/{id} vs translator)
 *   • Different surface — companions are a *discovery* feature, not
 *     a *transformation* feature
 *   • Hides itself if no companions exist (graceful degradation)
 *
 * Flatland-compliant: inline span + inline expanded list, no portal.
 *
 * Usage:
 *   <CompanionChip textId="maryam" onCompanionClick={...} />
 */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CompanionChip({ textId, onCompanionClick, compact = false }) {
  const [companions, setCompanions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Fetch once per textId — backend is fast, no caching layer needed.
  useEffect(() => {
    if (!textId) return;
    let cancelled = false;
    setLoading(true);
    setCompanions(null);
    setExpanded(false);
    axios.get(`${API}/companions/${textId}`)
      .then(r => {
        if (!cancelled) {
          setCompanions(Array.isArray(r.data?.companions) ? r.data.companions : []);
        }
      })
      .catch(() => { if (!cancelled) setCompanions([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [textId]);

  const toggle = useCallback(() => setExpanded(e => !e), []);

  // Hide entirely when no companions exist for this text.
  if (loading) {
    return (
      <span data-testid="companion-chip-loading" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#94A3B8' }}>
        <Loader2 size={10} className="animate-spin" /> companions...
      </span>
    );
  }
  if (!companions || companions.length === 0) return null;

  const ChevronIcon = expanded ? ChevronUp : ChevronDown;

  return (
    <span data-testid="companion-chip" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, marginLeft: 6 }}>
      <button
        type="button"
        data-testid="companion-chip-toggle"
        onClick={toggle}
        title="View ordained cross-tradition companions"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: compact ? '2px 8px' : '4px 10px',
          borderRadius: 999,
          background: 'rgba(168,85,247,0.10)',
          border: '1px solid rgba(168,85,247,0.40)',
          color: '#C4B5FD',
          fontSize: compact ? 9 : 10,
          fontFamily: 'monospace',
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          verticalAlign: 'middle',
          transition: 'background-color 180ms ease',
        }}
      >
        <Link2 size={compact ? 9 : 10} />
        Cross-Tradition · {companions.length}
        <ChevronIcon size={compact ? 9 : 10} />
      </button>

      {expanded && (
        <ul
          data-testid="companion-chip-list"
          style={{
            listStyle: 'none', padding: 0, margin: 0,
            display: 'flex', flexDirection: 'column', gap: 6,
            maxWidth: 480,
          }}
        >
          {companions.map((c, i) => (
            <li
              key={`${c.id}-${i}`}
              data-testid={`companion-chip-item-${c.id}`}
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                background: 'rgba(168,85,247,0.06)',
                border: '1px solid rgba(168,85,247,0.20)',
                cursor: onCompanionClick ? 'pointer' : 'default',
              }}
              onClick={() => onCompanionClick?.(c)}
            >
              <div style={{ fontSize: 10, color: '#A78BFA', fontFamily: 'monospace', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>
                {c.tradition}
                {c.chapter && <span style={{ color: '#64748B', marginLeft: 6 }}>· {c.chapter}</span>}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontStyle: 'italic', lineHeight: 1.5 }}>
                {c.why}
              </div>
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}
