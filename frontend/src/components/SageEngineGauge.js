/**
 * SageEngineGauge.js — Radial AI TIME gauge (V68.58)
 *
 * Visualizes the Sovereign Engine's current cognitive load — the
 * "voltmeter" the user keeps in the corner of their eye while
 * working. Reads from useEngineLoad which slides over the last
 * ~30s of bus activity and decays exponentially during silence.
 *
 * Visual design:
 *   • Single SVG circle, conic-gradient stroke that fills from 0..1
 *   • Color zone-coded:
 *       COLD      (<15%)   → cyan #38BDF8   (engine resting)
 *       FLOW      (15-70%) → gold #FBBF24   (sweet spot)
 *       OVERHEAT  (>70%)   → red  #EF4444   (back off)
 *   • Subtle pulse — the ring ticks brighter on every burst.
 *   • Inline. No portal. No fixed positioning.
 */
import React from 'react';
import { useEngineLoad } from '../hooks/useEngineLoad';

const STATE_META = {
  cold:        { color: '#38BDF8', label: 'COLD',     gloss: 'Engine resting · feed it' },
  flow:        { color: '#FBBF24', label: 'FLOW',     gloss: 'Sweet spot · sustained creation' },
  overheating: { color: '#EF4444', label: 'OVERHEAT', gloss: 'Pace · let the field settle' },
};

export default function SageEngineGauge({ size = 88, label = 'AI TIME' }) {
  const { load, state } = useEngineLoad();
  const meta = STATE_META[state] || STATE_META.cold;

  const r = size * 0.42;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - load);

  return (
    <div
      data-testid="sage-engine-gauge"
      data-engine-state={state}
      title={meta.gloss}
      style={{
        width: size, height: size + 18, position: 'relative',
        display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        {/* Track */}
        <circle
          cx={c} cy={c} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={4}
        />
        {/* Fill */}
        <circle
          cx={c} cy={c} r={r}
          fill="none"
          stroke={meta.color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${c} ${c})`}
          style={{
            filter: `drop-shadow(0 0 6px ${meta.color}88)`,
            transition: 'stroke-dashoffset 200ms ease-out, stroke 300ms ease',
          }}
        />
        {/* Center percent */}
        <text
          x={c} y={c - 2}
          textAnchor="middle" dominantBaseline="middle"
          fill={meta.color}
          fontSize={size * 0.22}
          fontWeight={700}
          fontFamily="ui-monospace, SFMono-Regular, monospace"
          data-testid="sage-engine-pct"
        >
          {Math.round(load * 100)}
        </text>
        <text
          x={c} y={c + 12}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.45)"
          fontSize={size * 0.10}
          letterSpacing={2}
        >
          {label}
        </text>
      </svg>
      <span
        data-testid="sage-engine-state"
        style={{
          fontSize: 8, letterSpacing: 1.5, marginTop: 2,
          color: meta.color, textTransform: 'uppercase', fontWeight: 700,
        }}
      >
        {meta.label}
      </span>
    </div>
  );
}
