/**
 * MiniLattice.js — V68.6 Scout Visualization
 *
 * A 9x9 crystalline grid rendered as SVG. Nodes light up based on the user's
 * personal activation pattern (pulled from /api/main-brain/user-lattice).
 * The recent path is drawn as resonance lines connecting nodes the user has
 * traversed.
 *
 * This is not a breadcrumb — it's the GEOMETRY of the user's journey across
 * the Sovereign Grid. One-tap each node to navigate back to that route.
 *
 * Thin-client: single GET on mount + on route change. No new state, no deps.
 * Respects the Flatland rule: sits inline on the Hub, not fixed.
 */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ── Color per node type (matches the 9 Brain NODE_TYPES) ──
const TYPE_COLOR = {
  CORE:      '#FBBF24', // gold
  ORACLE:    '#C084FC',
  PORTAL:    '#3B82F6',
  MIXER:     '#F472B6',
  GENERATOR: '#A78BFA',
  LEDGER:    '#D4AF37',
  SHIELD:    '#22C55E',
  VAULT:     '#64748B',
  RELAY:     '#06B6D4',
};

export default function MiniLattice() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [typeGrid, setTypeGrid] = useState(null); // full 9x9 type map from brain

  // Load the brain's global lattice structure once (to know each node's TYPE)
  useEffect(() => {
    axios.get(`${API}/main-brain/lattice`)
      .then(r => {
        const nodes = r.data?.lattice_state?.nodes || r.data?.nodes || [];
        const size = r.data?.lattice_state?.lattice_size || r.data?.lattice_size || 9;
        const grid = Array.from({ length: size }, () => Array(size).fill(null));
        for (const n of nodes) grid[n.y][n.x] = n.type;
        setTypeGrid({ grid, size });
      })
      .catch(() => setTypeGrid({ grid: Array.from({ length: 9 }, () => Array(9).fill('VAULT')), size: 9 }));
  }, []);

  // Load the user's activation pattern — re-fetch on route change
  useEffect(() => {
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') { setData(null); return; }
    axios.get(`${API}/main-brain/user-lattice`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data))
      .catch(() => {});
  }, [location.pathname]);

  if (!typeGrid) return null;

  const size = typeGrid.size;
  const cellSize = 20;
  const padding = 8;
  const viewBox = size * cellSize + padding * 2;

  const userFlat = data?.flat;
  const lastPath = data?.last_path || [];

  // V68.7 — Share Resonance Pattern (native share or copy-to-clipboard fallback)
  const handleShare = async () => {
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') return;
    try {
      const res = await axios.get(`${API}/share/pattern`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { share_path, caption } = res.data || {};
      if (!share_path) return;
      const absoluteUrl = `${window.location.origin}${share_path}`;
      // Prefer native Web Share API
      if (navigator.share) {
        await navigator.share({ title: 'My Sovereign Lattice', text: caption, url: absoluteUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${caption}\n${absoluteUrl}`);
      }
    } catch {}
  };

  // Build the resonance line (SVG polyline) across last_path coords
  const pathPoints = lastPath
    .map(p => `${padding + p.x * cellSize + cellSize / 2},${padding + p.y * cellSize + cellSize / 2}`)
    .join(' ');

  // Determine which coordinate corresponds to the CURRENT route
  const currentPath = location.pathname;
  const currentCoord = (() => {
    if (!lastPath.length) return null;
    // The most recent entry in last_path matches the current route
    const last = lastPath[lastPath.length - 1];
    if (last?.path === currentPath) return last;
    return null;
  })();

  return (
    <div className="flex flex-col items-center px-4 py-3" data-testid="mini-lattice">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Sovereign Lattice
        </span>
        {data && (
          <span className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
            · {data.unique_nodes_visited}/{size * size} nodes
          </span>
        )}
      </div>
      <svg width={viewBox} height={viewBox} viewBox={`0 0 ${viewBox} ${viewBox}`}
        style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}
        data-testid="mini-lattice-svg">
        {/* Faint grid lines */}
        {Array.from({ length: size + 1 }).map((_, i) => (
          <React.Fragment key={`grid-${i}`}>
            <line x1={padding + i * cellSize} y1={padding}
              x2={padding + i * cellSize} y2={padding + size * cellSize}
              stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            <line x1={padding} y1={padding + i * cellSize}
              x2={padding + size * cellSize} y2={padding + i * cellSize}
              stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          </React.Fragment>
        ))}
        {/* Resonance path (user's journey) */}
        {lastPath.length > 1 && (
          <polyline
            points={pathPoints}
            fill="none"
            stroke="rgba(192,132,252,0.45)"
            strokeWidth="1"
            strokeDasharray="2 2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {/* Nodes */}
        {typeGrid.grid.map((row, y) => row.map((type, x) => {
          const visited = userFlat?.[y]?.[x];
          const color = TYPE_COLOR[type] || '#64748B';
          const cx = padding + x * cellSize + cellSize / 2;
          const cy = padding + y * cellSize + cellSize / 2;
          const isCenter = x === 4 && y === 4;
          const isCurrent = currentCoord && currentCoord.x === x && currentCoord.y === y;
          // V68.7 PHI-weighted opacity: inner-ring nodes (closer to center) burn brighter
          const dx = x - 4, dy = y - 4;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const phi = 1.618033988;
          const proximity = 1 / (1 + distance / phi); // 1.0 at center → ~0.28 at corners
          const r = isCenter ? 3.5 : (visited ? 2.2 + proximity * 1.2 : 1.4 + proximity * 0.6);
          const baseOpacity = visited ? (0.55 + proximity * 0.45) : 0.15 + proximity * 0.12;
          const clickable = Boolean(visited?.path);
          return (
            <g key={`node-${x}-${y}`}
              onClick={clickable ? () => navigate(visited.path) : undefined}
              style={{ cursor: clickable ? 'pointer' : 'default' }}
              data-testid={isCurrent ? 'lattice-current-node' : `lattice-node-${x}-${y}`}>
              {isCurrent && (
                <>
                  {/* V68.7 Resonance pulse — expanding ring + glow halo */}
                  <circle cx={cx} cy={cy} r={r + 3} fill="none"
                    stroke={color} strokeWidth="0.8" opacity="0.8">
                    <animate attributeName="r" values={`${r + 3};${r + 6};${r + 3}`} dur="1.618s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1.618s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={cx} cy={cy} r={r + 1.5} fill={color} opacity="0.25">
                    <animate attributeName="opacity" values="0.35;0.15;0.35" dur="1.618s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              <circle cx={cx} cy={cy} r={r} fill={color} opacity={baseOpacity}>
                {visited && (
                  <title>{visited.path} · {type} · {visited.count}x</title>
                )}
              </circle>
            </g>
          );
        }))}
      </svg>
      {/* V68.7 — Share Resonance Pattern */}
      {data && data.unique_nodes_visited > 0 && (
        <button
          type="button"
          onClick={handleShare}
          className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.18em] transition-all active:scale-[0.96]"
          style={{
            background: 'rgba(192,132,252,0.06)',
            border: '1px solid rgba(192,132,252,0.2)',
            color: 'rgba(192,132,252,0.75)',
          }}
          data-testid="lattice-share-btn"
        >
          Share Resonance Pattern
        </button>
      )}
    </div>
  );
}
