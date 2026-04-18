/**
 * ResonanceShare.js — V68.7 Public Resonance Pattern page
 *
 * Anyone with the /resonance/:share_id link can view another user's
 * Sovereign Lattice fingerprint. No auth required. Read-only.
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Layers, Radio } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TYPE_COLOR = {
  CORE: '#FBBF24', ORACLE: '#C084FC', PORTAL: '#3B82F6', MIXER: '#F472B6',
  GENERATOR: '#A78BFA', LEDGER: '#D4AF37', SHIELD: '#22C55E', VAULT: '#64748B', RELAY: '#06B6D4',
};
const RANK_COLOR = {
  CITIZEN: '#64748B', SEED: '#A78BFA', NAVIGATOR: '#3B82F6', ARTISAN: '#FBBF24',
  ORACLE: '#22C55E', ARCHITECT: '#8B5CF6', SOVEREIGN: '#D4AF37',
};
// V68.8 — Harmonic Interference: viewer's unique-nodes tint (cool counterpoint to host's warm)
const VIEWER_TINT = '#06B6D4'; // cyan — distinguishes from host without competing

export default function ResonanceShare() {
  const { shareId } = useParams();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const [viewerPattern, setViewerPattern] = useState(null);
  const [syncOn, setSyncOn] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/share/pattern/public/${shareId}`)
      .then(r => setDoc(r.data))
      .catch(() => setError('Pattern not found'));
  }, [shareId]);

  // V68.8 — Toggle Harmonic Interference: fetch viewer's own pattern once authed
  const toggleSync = async () => {
    if (syncOn) { setSyncOn(false); return; }
    const token = localStorage.getItem('zen_token');
    if (!token || token === 'guest_token') return;
    if (viewerPattern) { setSyncOn(true); return; }
    setSyncLoading(true);
    try {
      const r = await axios.get(`${API}/share/pattern`, { headers: { Authorization: `Bearer ${token}` } });
      setViewerPattern(r.data?.pattern);
      setSyncOn(true);
    } catch {}
    setSyncLoading(false);
  };

  // Compute intersection & union sets for overlay rendering
  const harmonic = useMemo(() => {
    if (!doc || !viewerPattern) return null;
    const key = (c) => `${c.x},${c.y}`;
    const hostSet = new Set((doc.coords || []).map(key));
    const viewerSet = new Set((viewerPattern.coords || []).map(key));
    const intersection = new Set([...hostSet].filter(k => viewerSet.has(k)));
    const hostOnly = new Set([...hostSet].filter(k => !viewerSet.has(k)));
    const viewerOnly = new Set([...viewerSet].filter(k => !hostSet.has(k)));
    const resonanceScore = hostSet.size > 0
      ? Math.round((intersection.size / Math.max(hostSet.size, viewerSet.size)) * 100)
      : 0;
    return { hostSet, viewerSet, intersection, hostOnly, viewerOnly, resonanceScore };
  }, [doc, viewerPattern]);

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
  const isAuthed = (() => {
    try { const t = localStorage.getItem('zen_token'); return Boolean(t && t !== 'guest_token'); } catch { return false; }
  })();

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
        {/* V68.8 — Viewer's resonance trace (cyan) when Sync Patterns is ON */}
        {syncOn && harmonic && viewerPattern?.coords?.length > 1 && (
          <polyline
            points={viewerPattern.coords.map(c => `${pad + c.x * cell + cell / 2},${pad + c.y * cell + cell / 2}`).join(' ')}
            fill="none" stroke={`${VIEWER_TINT}80`} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="3 3"
          />
        )}
        {/* Host nodes (with intersection highlighting when Sync is ON) */}
        {flat.map((row, y) => row.map((visited, x) => {
          if (!visited) return null;
          const type = visited.type || 'VAULT';
          const baseColor = TYPE_COLOR[type];
          const cx = pad + x * cell + cell / 2;
          const cy = pad + y * cell + cell / 2;
          const r = Math.min(8, 3 + visited.count * 0.5);
          const key = `${x},${y}`;
          const isIntersection = syncOn && harmonic?.intersection.has(key);
          const fill = isIntersection ? '#FFFFFF' : baseColor;
          const glowR = isIntersection ? r + 5 : r + 2;
          return (
            <g key={`n-${x}-${y}`} data-testid={isIntersection ? `harmonic-intersection-${x}-${y}` : undefined}>
              {isIntersection && (
                <circle cx={cx} cy={cy} r={glowR + 2} fill="none" stroke="#FBBF24" strokeWidth="0.6" opacity="0.6">
                  <animate attributeName="r" values={`${glowR + 2};${glowR + 4};${glowR + 2}`} dur="1.618s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.618s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={cx} cy={cy} r={glowR} fill={fill} opacity={isIntersection ? 0.3 : 0.2} />
              <circle cx={cx} cy={cy} r={r} fill={fill} opacity={isIntersection ? 1 : 0.9}>
                <title>{type} · {visited.count}x{isIntersection ? ' · SHARED' : ''}</title>
              </circle>
            </g>
          );
        }))}
        {/* V68.8 — Viewer-only nodes rendered in cyan (only when Sync is ON) */}
        {syncOn && harmonic && viewerPattern?.coords?.map((c) => {
          const key = `${c.x},${c.y}`;
          if (!harmonic.viewerOnly.has(key)) return null;
          const cx = pad + c.x * cell + cell / 2;
          const cy = pad + c.y * cell + cell / 2;
          const r = Math.min(7, 3 + (c.count || 1) * 0.4);
          return (
            <g key={`v-${c.x}-${c.y}`} data-testid={`viewer-only-${c.x}-${c.y}`}>
              <circle cx={cx} cy={cy} r={r + 2} fill={VIEWER_TINT} opacity="0.18" />
              <circle cx={cx} cy={cy} r={r} fill={VIEWER_TINT} opacity="0.7" strokeDasharray="2 1" stroke={VIEWER_TINT} strokeWidth="0.5">
                <title>Your node · {c.type || 'VAULT'}</title>
              </circle>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center gap-4 mt-5 text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
        <div><span className="font-mono" style={{ color: '#FBBF24' }}>{doc.sparks?.toLocaleString() ?? 0}</span> sparks</div>
        <div><span className="font-mono" style={{ color: '#C084FC' }}>{doc.unique_nodes}</span> / {size * size} nodes</div>
        <div><span className="font-mono" style={{ color: '#06B6D4' }}>{doc.total_activations}</span> activations</div>
      </div>

      {/* V68.8 — Harmonic Interference toggle */}
      {isAuthed && (
        <button
          type="button"
          onClick={toggleSync}
          disabled={syncLoading}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97]"
          style={{
            background: syncOn ? 'rgba(251,191,36,0.12)' : 'rgba(6,182,212,0.08)',
            border: `1px solid ${syncOn ? '#FBBF24' : VIEWER_TINT}55`,
            color: syncOn ? '#FBBF24' : VIEWER_TINT,
            cursor: syncLoading ? 'wait' : 'pointer',
          }}
          data-testid="harmonic-sync-btn"
        >
          {syncOn ? <Radio size={11} /> : <Layers size={11} />}
          {syncLoading ? 'Tuning…' : syncOn ? 'Harmonic Sync Active' : 'Sync Patterns'}
        </button>
      )}

      {/* V68.8 — Harmonic Interference summary row */}
      {syncOn && harmonic && (
        <div className="mt-3 px-4 py-2 rounded-xl flex items-center gap-4 text-[10px]"
          style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)' }}
          data-testid="harmonic-summary">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: '#FFFFFF', boxShadow: '0 0 6px #FBBF24' }} />
            <span className="text-white/80"><span className="font-mono font-bold text-white">{harmonic.intersection.size}</span> shared</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: rankColor }} />
            <span className="text-white/55">{harmonic.hostOnly.size} theirs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: VIEWER_TINT }} />
            <span className="text-white/55">{harmonic.viewerOnly.size} yours</span>
          </div>
          <div className="pl-2 ml-auto" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-[9px] uppercase tracking-wider text-white/40">Resonance</span>
            <span className="ml-1.5 font-mono font-bold" style={{ color: '#FBBF24' }}>{harmonic.resonanceScore}%</span>
          </div>
        </div>
      )}

      <Link to="/" className="mt-8 px-5 py-2 rounded-full text-[11px] uppercase tracking-[0.22em]"
        style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.25)', color: '#C084FC' }}
        data-testid="resonance-share-join">
        Begin Your Own Journey →
      </Link>
    </div>
  );
}
