/**
 * ResonanceShare.js — V68.7 Public Resonance Pattern page
 *
 * Anyone with the /resonance/:share_id link can view another user's
 * Sovereign Lattice fingerprint. No auth required. Read-only.
 */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TYPE_COLOR = {
  CORE: '#FBBF24', ORACLE: '#C084FC', PORTAL: '#3B82F6', MIXER: '#F472B6',
  GENERATOR: '#A78BFA', LEDGER: '#D4AF37', SHIELD: '#22C55E', VAULT: '#64748B', RELAY: '#06B6D4',
};
const RANK_COLOR = {
  CITIZEN: '#64748B', SEED: '#A78BFA', NAVIGATOR: '#3B82F6', ARTISAN: '#FBBF24',
  ORACLE: '#22C55E', ARCHITECT: '#8B5CF6', SOVEREIGN: '#D4AF37',
};

export default function ResonanceShare() {
  const { shareId } = useParams();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API}/share/pattern/public/${shareId}`)
      .then(r => setDoc(r.data))
      .catch(() => setError('Pattern not found'));
  }, [shareId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-sm text-white/60">{error}</p>
          <Link to="/" className="text-[11px] text-white/40 underline mt-3 inline-block">Return home</Link>
        </div>
      </div>
    );
  }
  if (!doc) return null;

  const size = doc.lattice_size || 9;
  const cell = 36;
  const pad = 16;
  const vb = size * cell + pad * 2;
  const rankColor = RANK_COLOR[doc.rank] || '#A78BFA';

  // Rebuild the user's activation map
  const flat = Array.from({ length: size }, () => Array(size).fill(null));
  (doc.coords || []).forEach(c => { flat[c.y][c.x] = c; });
  const chrono = (doc.coords || []).map(c => ({ x: c.x, y: c.y, type: c.type }));
  const pathPoints = chrono
    .map(p => `${pad + p.x * cell + cell / 2},${pad + p.y * cell + cell / 2}`)
    .join(' ');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, rgba(0,0,0,1) 70%)' }}
      data-testid="resonance-share-page">
      <div className="text-center mb-6">
        <div className="text-[10px] uppercase tracking-[0.28em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Sovereign Lattice · Resonance Pattern
        </div>
        <h1 className="text-3xl font-light mt-1" style={{ color: '#fff', fontFamily: 'Cormorant Garamond, serif' }}>
          {doc.display_name || 'Traveler'}
        </h1>
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.22em] font-bold"
          style={{ background: `${rankColor}18`, border: `1px solid ${rankColor}40`, color: rankColor }}>
          {doc.rank || 'CITIZEN'}
        </div>
      </div>

      <svg width={vb} height={vb} viewBox={`0 0 ${vb} ${vb}`}
        style={{ maxWidth: '92vw', height: 'auto', borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
        data-testid="resonance-share-svg">
        {Array.from({ length: size + 1 }).map((_, i) => (
          <React.Fragment key={`g-${i}`}>
            <line x1={pad + i * cell} y1={pad} x2={pad + i * cell} y2={pad + size * cell} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            <line x1={pad} y1={pad + i * cell} x2={pad + size * cell} y2={pad + i * cell} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          </React.Fragment>
        ))}
        {chrono.length > 1 && (
          <polyline points={pathPoints} fill="none" stroke="rgba(192,132,252,0.55)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4 3" />
        )}
        {flat.map((row, y) => row.map((visited, x) => {
          if (!visited) return null;
          const type = visited.type || 'VAULT';
          const color = TYPE_COLOR[type];
          const cx = pad + x * cell + cell / 2;
          const cy = pad + y * cell + cell / 2;
          const r = Math.min(8, 3 + visited.count * 0.5);
          return (
            <g key={`n-${x}-${y}`}>
              <circle cx={cx} cy={cy} r={r + 2} fill={color} opacity="0.2" />
              <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.9">
                <title>{type} · {visited.count}x</title>
              </circle>
            </g>
          );
        }))}
      </svg>

      <div className="flex items-center gap-4 mt-5 text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
        <div><span className="font-mono" style={{ color: '#FBBF24' }}>{doc.sparks?.toLocaleString() ?? 0}</span> sparks</div>
        <div><span className="font-mono" style={{ color: '#C084FC' }}>{doc.unique_nodes}</span> / {size * size} nodes</div>
        <div><span className="font-mono" style={{ color: '#06B6D4' }}>{doc.total_activations}</span> activations</div>
      </div>

      <Link to="/" className="mt-8 px-5 py-2 rounded-full text-[11px] uppercase tracking-[0.22em]"
        style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.25)', color: '#C084FC' }}
        data-testid="resonance-share-join">
        Begin Your Own Journey →
      </Link>
    </div>
  );
}
