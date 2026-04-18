/**
 * ResonanceShare.js — V68.7 Public Resonance Pattern page
 *
 * Anyone with the /resonance/:share_id link can view another user's
 * Sovereign Lattice fingerprint. No auth required. Read-only.
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Layers, Radio, Users, Plus, X } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TYPE_COLOR = {
  CORE: '#FBBF24', ORACLE: '#C084FC', PORTAL: '#3B82F6', MIXER: '#F472B6',
  GENERATOR: '#A78BFA', LEDGER: '#D4AF37', SHIELD: '#22C55E', VAULT: '#64748B', RELAY: '#06B6D4',
};
const RANK_COLOR = {
  CITIZEN: '#64748B', SEED: '#A78BFA', NAVIGATOR: '#3B82F6', ARTISAN: '#FBBF24',
  ORACLE: '#22C55E', ARCHITECT: '#8B5CF6', SOVEREIGN: '#D4AF37',
};
const VIEWER_TINT = '#06B6D4';
const MAX_COUNCIL = 4; // up to 4 extra patterns (plus host + viewer = 6 total)
const RECENT_STORAGE = 'sovereign_recent_patterns';

// V68.8 — extract share_id from a full URL or raw id
function parseShareId(input) {
  if (!input) return null;
  const s = input.trim();
  const m = s.match(/\/resonance\/([a-f0-9]{6,24})/i);
  if (m) return m[1];
  if (/^[a-f0-9]{6,24}$/i.test(s)) return s;
  return null;
}

export default function ResonanceShare() {
  const { shareId } = useParams();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const [viewerPattern, setViewerPattern] = useState(null);
  const [syncOn, setSyncOn] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // V68.8 Council stack state
  const [councilMode, setCouncilMode] = useState(false);
  const [councilPatterns, setCouncilPatterns] = useState([]); // [{share_id, pattern}]
  const [councilInput, setCouncilInput] = useState('');
  const [councilAddErr, setCouncilAddErr] = useState(null);
  const [recentCache, setRecentCache] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_STORAGE) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    axios.get(`${API}/share/pattern/public/${shareId}`)
      .then(r => {
        setDoc(r.data);
        // Cache this pattern as "recently viewed"
        try {
          const existing = JSON.parse(localStorage.getItem(RECENT_STORAGE) || '[]');
          const entry = { share_id: shareId, display_name: r.data.display_name, rank: r.data.rank, ts: Date.now() };
          const next = [entry, ...existing.filter(e => e.share_id !== shareId)].slice(0, 8);
          localStorage.setItem(RECENT_STORAGE, JSON.stringify(next));
          setRecentCache(next);
        } catch {}
      })
      .catch(() => setError('Pattern not found'));
  }, [shareId]);

  // Toggle 1:1 Harmonic Interference
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

  // V68.8 — Add a pattern to the Council stack
  const addToCouncil = async (rawInput) => {
    setCouncilAddErr(null);
    const sid = parseShareId(rawInput);
    if (!sid) { setCouncilAddErr('Invalid share link or ID'); return; }
    if (sid === shareId) { setCouncilAddErr('Already viewing this pattern'); return; }
    if (councilPatterns.some(p => p.share_id === sid)) { setCouncilAddErr('Already in Council'); return; }
    if (councilPatterns.length >= MAX_COUNCIL) { setCouncilAddErr(`Council maxed at ${MAX_COUNCIL}`); return; }
    try {
      const r = await axios.get(`${API}/share/pattern/public/${sid}`);
      setCouncilPatterns(prev => [...prev, { share_id: sid, pattern: r.data }]);
      setCouncilInput('');
    } catch { setCouncilAddErr('Pattern not found'); }
  };
  const removeFromCouncil = (sid) => {
    setCouncilPatterns(prev => prev.filter(p => p.share_id !== sid));
  };

  // 1:1 Harmonic (host vs viewer)
  const harmonic = useMemo(() => {
    if (!doc || !viewerPattern || councilMode) return null;
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
  }, [doc, viewerPattern, councilMode]);

  // N-way Council stacking (frequency distribution across N patterns)
  const council = useMemo(() => {
    if (!councilMode || !doc) return null;
    const key = (c) => `${c.x},${c.y}`;
    const members = [{ id: 'host', name: doc.display_name, coords: doc.coords || [] }];
    if (viewerPattern) members.push({ id: 'viewer', name: viewerPattern.display_name || 'You', coords: viewerPattern.coords || [] });
    councilPatterns.forEach(cp => members.push({ id: cp.share_id, name: cp.pattern.display_name, coords: cp.pattern.coords || [] }));
    const N = members.length;
    // Count occurrences per node
    const freq = {};
    members.forEach(m => {
      const seen = new Set();
      m.coords.forEach(c => {
        const k = key(c);
        if (seen.has(k)) return;
        seen.add(k);
        freq[k] = (freq[k] || 0) + 1;
      });
    });
    // Categorize nodes by alignment
    const absolute = []; // N/N
    const strong = [];   // > N/2
    const emergent = []; // <= N/2 but > 0
    Object.entries(freq).forEach(([k, count]) => {
      const [x, y] = k.split(',').map(Number);
      const rec = { x, y, count, total: N };
      if (count === N) absolute.push(rec);
      else if (count > N / 2) strong.push(rec);
      else emergent.push(rec);
    });
    const ceiling = Math.round((absolute.length / Math.max(1, Object.keys(freq).length)) * 100);
    return { N, members, freq, absolute, strong, emergent, ceiling };
  }, [councilMode, doc, viewerPattern, councilPatterns]);

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
        {/* Host nodes (hidden in Council mode — Council renders its own stack below) */}
        {!councilMode && flat.map((row, y) => row.map((visited, x) => {
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
        {/* V68.8 — Viewer-only nodes rendered in cyan (only when 1:1 Sync is ON) */}
        {syncOn && !councilMode && harmonic && viewerPattern?.coords?.map((c) => {
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
        {/* V68.8 — COUNCIL STACK: frequency-weighted nodes (overrides 1:1 view) */}
        {councilMode && council && Object.entries(council.freq).map(([k, count]) => {
          const [x, y] = k.split(',').map(Number);
          const cx = pad + x * cell + cell / 2;
          const cy = pad + y * cell + cell / 2;
          const N = council.N;
          const isAbsolute = count === N;
          const isStrong = count > N / 2 && !isAbsolute;
          let fill, pulse, r, aura;
          if (isAbsolute) { fill = '#FFFFFF'; pulse = '#FBBF24'; r = 8; aura = 0.55; }
          else if (isStrong) { fill = '#FBBF24'; pulse = null; r = 6.5; aura = 0.4; }
          else { fill = '#A78BFA'; pulse = null; r = 5; aura = 0.22; }
          const tid = isAbsolute ? `council-absolute-${x}-${y}` : isStrong ? `council-strong-${x}-${y}` : `council-emergent-${x}-${y}`;
          return (
            <g key={`c-${x}-${y}`} data-testid={tid}>
              <circle cx={cx} cy={cy} r={r + 4} fill={fill} opacity={aura * 0.4} />
              {pulse && (
                <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={pulse} strokeWidth="0.7" opacity="0.7">
                  <animate attributeName="r" values={`${r + 4};${r + 7};${r + 4}`} dur="1.618s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.618s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={cx} cy={cy} r={r} fill={fill} opacity={isAbsolute ? 1 : 0.85}>
                <title>{count}/{N} members · {isAbsolute ? 'Absolute Center' : isStrong ? 'Strong Alignment' : 'Emergent Node'}</title>
              </circle>
              <text x={cx} y={cy + 2.5} textAnchor="middle" fontSize="7" fontWeight="bold"
                fill={isAbsolute ? '#000' : 'rgba(0,0,0,0.55)'} pointerEvents="none">{count}</text>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center gap-4 mt-5 text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
        <div><span className="font-mono" style={{ color: '#FBBF24' }}>{doc.sparks?.toLocaleString() ?? 0}</span> sparks</div>
        <div><span className="font-mono" style={{ color: '#C084FC' }}>{doc.unique_nodes}</span> / {size * size} nodes</div>
        <div><span className="font-mono" style={{ color: '#06B6D4' }}>{doc.total_activations}</span> activations</div>
      </div>

      {/* V68.8 — Harmonic Interference toggle (1:1 vs Council mode) */}
      {isAuthed && (
        <div className="mt-5 flex items-center gap-2 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => { setCouncilMode(false); toggleSync(); }}
            disabled={syncLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97]"
            style={{
              background: (syncOn && !councilMode) ? 'rgba(251,191,36,0.12)' : 'rgba(6,182,212,0.08)',
              border: `1px solid ${(syncOn && !councilMode) ? '#FBBF24' : VIEWER_TINT}55`,
              color: (syncOn && !councilMode) ? '#FBBF24' : VIEWER_TINT,
              cursor: syncLoading ? 'wait' : 'pointer',
            }}
            data-testid="harmonic-sync-btn"
          >
            {(syncOn && !councilMode) ? <Radio size={11} /> : <Layers size={11} />}
            {syncLoading ? 'Tuning…' : (syncOn && !councilMode) ? 'Harmonic Sync Active' : 'Sync Patterns'}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (councilMode) { setCouncilMode(false); return; }
              // Ensure viewer pattern is loaded for the stack
              if (!viewerPattern) {
                const token = localStorage.getItem('zen_token');
                if (token && token !== 'guest_token') {
                  try {
                    const r = await axios.get(`${API}/share/pattern`, { headers: { Authorization: `Bearer ${token}` } });
                    setViewerPattern(r.data?.pattern);
                  } catch {}
                }
              }
              setCouncilMode(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97]"
            style={{
              background: councilMode ? 'rgba(251,191,36,0.12)' : 'rgba(167,139,250,0.08)',
              border: `1px solid ${councilMode ? '#FBBF24' : '#A78BFA'}55`,
              color: councilMode ? '#FBBF24' : '#A78BFA',
            }}
            data-testid="council-mode-btn"
          >
            <Users size={11} />
            {councilMode ? 'Council Stack Active' : 'Stack Council'}
          </button>
        </div>
      )}

      {/* V68.8 — COUNCIL PANEL (inline, expands below when councilMode ON) */}
      {councilMode && isAuthed && (
        <div className="mt-3 w-full max-w-md px-4 py-3 rounded-xl"
          style={{ background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.18)' }}
          data-testid="council-panel">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: '#A78BFA' }}>
              Council · {council?.N ?? 1} member{(council?.N ?? 1) > 1 ? 's' : ''}
            </span>
            {council && (
              <span className="text-[9px] uppercase tracking-wider text-white/50">
                Ceiling <span className="font-mono font-bold" style={{ color: '#FBBF24' }}>{council.ceiling}%</span>
              </span>
            )}
          </div>

          {/* Active members */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <span className="px-2 py-1 rounded-full text-[9px]" style={{ background: `${rankColor}18`, color: rankColor, border: `1px solid ${rankColor}40` }}>
              {doc.display_name || 'Host'}
            </span>
            {viewerPattern && (
              <span className="px-2 py-1 rounded-full text-[9px]" style={{ background: `${VIEWER_TINT}18`, color: VIEWER_TINT, border: `1px solid ${VIEWER_TINT}40` }}>
                You
              </span>
            )}
            {councilPatterns.map(cp => (
              <span key={cp.share_id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px]"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.12)' }}
                data-testid={`council-member-${cp.share_id}`}>
                {cp.pattern?.display_name || cp.share_id}
                <X size={9} className="cursor-pointer opacity-50 hover:opacity-100" onClick={() => removeFromCouncil(cp.share_id)} />
              </span>
            ))}
          </div>

          {/* Recent-viewed quick-add */}
          {recentCache.filter(e => e.share_id !== shareId && !councilPatterns.some(cp => cp.share_id === e.share_id)).length > 0 && (
            <div className="mb-2">
              <span className="text-[8px] uppercase tracking-wider text-white/40 mb-1 block">Recently Viewed</span>
              <div className="flex flex-wrap gap-1">
                {recentCache.filter(e => e.share_id !== shareId && !councilPatterns.some(cp => cp.share_id === e.share_id)).slice(0, 5).map(e => (
                  <button key={e.share_id} type="button" onClick={() => addToCouncil(e.share_id)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                    data-testid={`council-recent-${e.share_id}`}>
                    <Plus size={8} /> {e.display_name || e.share_id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paste-share-id input */}
          {councilPatterns.length < MAX_COUNCIL && (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={councilInput}
                onChange={(e) => { setCouncilInput(e.target.value); setCouncilAddErr(null); }}
                placeholder="Paste /resonance/ link or share ID"
                className="flex-1 px-2.5 py-1.5 rounded-lg text-[11px] bg-transparent"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                data-testid="council-input"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToCouncil(councilInput); } }}
              />
              <button type="button" onClick={() => addToCouncil(councilInput)}
                className="px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider"
                style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', color: '#A78BFA' }}
                data-testid="council-add-btn">
                Add
              </button>
            </div>
          )}
          {councilAddErr && <p className="text-[9px] mt-1.5" style={{ color: '#F87171' }}>{councilAddErr}</p>}

          {/* Frequency legend */}
          {council && council.N > 1 && (
            <div className="flex items-center gap-3 mt-2.5 pt-2 text-[9px]" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: '#FFFFFF', boxShadow: '0 0 4px #FBBF24' }} /><span className="text-white/60">{council.absolute.length} absolute</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-white/55">{council.strong.length} strong</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: '#A78BFA' }} /><span className="text-white/55">{council.emergent.length} emergent</span></div>
            </div>
          )}
        </div>
      )}

      {/* V68.8 — Harmonic Interference summary row (1:1 mode only) */}
      {syncOn && !councilMode && harmonic && (
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
