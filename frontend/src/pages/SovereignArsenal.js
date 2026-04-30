/**
 * SovereignArsenal.js — The Owner's Arsenal Index (V68.80)
 *
 * Surfaces every generator (46) and every active engine (~73) as a single
 * unified grid with "Fire" buttons. Owner-gated — regular users never
 * see this page (backend 403s non-owners).
 *
 * Flatland-compliant: inline flex, no modals, results render INLINE below
 * each fired card. No overlays, no z-index portals.
 *
 * Mounted at /arsenal (see App.js route registration).
 */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useProcessorState, MODULE_REGISTRY } from '../state/ProcessorState';
import { Zap, Play, Search, ChevronDown, ChevronRight, Flame, Cpu } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CAT_COLOR = {
  storyline: '#F472B6',
  item:      '#FBBF24',
  avatar:    '#A78BFA',
  reading:   '#38BDF8',
  economy:   '#22C55E',
};

function fillPathParams(path, hint) {
  // Replace ":foo" segments with values from hint or a placeholder.
  let out = path;
  if (!hint) return out.replace(/:[a-zA-Z_]+/g, 'default');
  for (const [k, v] of Object.entries(hint)) {
    out = out.replace(`:${k}`, encodeURIComponent(String(v)));
  }
  return out.replace(/:[a-zA-Z_]+/g, 'default');
}

export default function SovereignArsenal() {
  const { authHeaders, user } = useAuth();
  const { pull } = useProcessorState();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [results, setResults] = useState({}); // itemId -> {status, payload}
  const [firing, setFiring] = useState('');

  const fetchIndex = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/arsenal/index`, { headers: authHeaders });
      setData(r.data);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Arsenal is owner-only');
      } else {
        toast.error('Failed to load Arsenal');
      }
    }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchIndex(); }, [fetchIndex]);

  const fireGenerator = useCallback(async (gen) => {
    setFiring(gen.id);
    const realPath = fillPathParams(gen.path.replace(/^\/api/, ''), gen.body_hint);
    const url = `${API}${realPath}`;
    try {
      const method = gen.method.toLowerCase();
      const reqCfg = { headers: authHeaders, timeout: 45000 };
      let res;
      if (method === 'get') {
        res = await axios.get(url, reqCfg);
      } else {
        res = await axios.post(url, gen.body_hint || {}, reqCfg);
      }
      setResults(prev => ({ ...prev, [gen.id]: { status: 'ok', payload: res.data, at: Date.now() } }));
      axios.post(`${API}/arsenal/fire-log`, { item_id: gen.id, outcome: 'ok' }, { headers: authHeaders }).catch(() => {});
      toast.success(`Fired: ${gen.name}`);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      setResults(prev => ({ ...prev, [gen.id]: { status: 'error', payload: detail, at: Date.now() } }));
      axios.post(`${API}/arsenal/fire-log`, { item_id: gen.id, outcome: 'error' }, { headers: authHeaders }).catch(() => {});
      toast.error(`${gen.name}: ${String(detail).slice(0, 80)}`);
    }
    setFiring('');
  }, [authHeaders]);

  const fireEngine = useCallback((engine) => {
    if (engine.layer === 'frontend' && MODULE_REGISTRY[engine.id] !== undefined) {
      pull(engine.id);
      toast.success(`${engine.name} pulled into matrix`);
      axios.post(`${API}/arsenal/fire-log`, { item_id: engine.id, outcome: 'ok' }, { headers: authHeaders }).catch(() => {});
    } else {
      toast.info(`${engine.name} is backend-only (auto-wired)`);
      axios.post(`${API}/arsenal/fire-log`, { item_id: engine.id, outcome: 'ok' }, { headers: authHeaders }).catch(() => {});
    }
  }, [pull, authHeaders]);

  const filteredGens = useMemo(() => {
    if (!data) return [];
    let g = data.generators;
    if (activeCat !== 'all') g = g.filter(x => x.category === activeCat);
    if (q.trim()) {
      const qq = q.toLowerCase();
      g = g.filter(x =>
        x.name.toLowerCase().includes(qq) ||
        x.kind.toLowerCase().includes(qq) ||
        x.path.toLowerCase().includes(qq)
      );
    }
    return g;
  }, [data, activeCat, q]);

  const filteredEngines = useMemo(() => {
    if (!data) return [];
    if (!q.trim()) return data.engines;
    const qq = q.toLowerCase();
    return data.engines.filter(e => e.name.toLowerCase().includes(qq) || e.id.toLowerCase().includes(qq));
  }, [data, q]);

  if (loading) return <div style={{ padding: 40, color: '#64748B', fontFamily: 'monospace' }}>Loading arsenal…</div>;
  if (!data) return <div style={{ padding: 40, color: '#F87171' }}>Arsenal unavailable. Owner-only.</div>;

  return (
    <div data-testid="sovereign-arsenal" style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', color: 'var(--text-primary, #E2E8F0)' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Flame size={20} color="#EAB308" />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Sovereign Arsenal</h1>
        </div>
        <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
          {data.totals.generators} generators · {data.totals.engines} active engines · owner-only
        </p>
      </div>

      {/* Search + Category filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={14} color="#64748B" />
          <input
            data-testid="arsenal-search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by name, kind, path…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'inherit', fontSize: 13 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', ...data.categories].map(cat => (
            <button
              key={cat}
              data-testid={`arsenal-cat-${cat}`}
              onClick={() => setActiveCat(cat)}
              style={{
                padding: '8px 14px', borderRadius: 999, fontSize: 11,
                textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'monospace',
                background: activeCat === cat ? (CAT_COLOR[cat] || '#EAB308') + '25' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeCat === cat ? (CAT_COLOR[cat] || '#EAB308') + '66' : 'rgba(255,255,255,0.08)'}`,
                color: activeCat === cat ? (CAT_COLOR[cat] || '#EAB308') : '#94A3B8',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Most-Fired strip — self-organizing workshop dashboard */}
      {data.top_fired && data.top_fired.length > 0 && (
        <section data-testid="arsenal-top-fired" style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#EAB308', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'monospace' }}>
            <Flame size={12} /> Most Fired <span style={{ color: '#64748B', fontWeight: 400 }}>· your workshop remembers</span>
          </h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {data.top_fired.map(item => {
              const isGen = item.unit === 'generator';
              const color = isGen ? (CAT_COLOR[item.category] || '#EAB308') : '#A78BFA';
              const onClick = () => {
                if (isGen) fireGenerator(item);
                else fireEngine(item);
              };
              return (
                <button
                  key={`top-${item.id}`}
                  data-testid={`arsenal-top-${item.id}`}
                  onClick={onClick}
                  style={{
                    padding: '8px 12px', borderRadius: 999,
                    background: `${color}18`,
                    border: `1px solid ${color}55`,
                    color: 'inherit', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    fontSize: 12, fontWeight: 500,
                  }}
                >
                  <span style={{ color, fontFamily: 'monospace', fontSize: 10 }}>{item.fire_count}×</span>
                  <span>{item.name}</span>
                  <Play size={10} style={{ opacity: 0.6 }} />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Generators grid */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#CBD5E1', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={14} /> Generators <span style={{ color: '#64748B', fontWeight: 400 }}>({filteredGens.length})</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filteredGens.map(gen => {
            const color = CAT_COLOR[gen.category] || '#EAB308';
            const res = results[gen.id];
            return (
              <div
                key={gen.id}
                data-testid={`arsenal-gen-${gen.id}`}
                style={{
                  padding: 14, borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${color}33`,
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{gen.name}</div>
                  <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, background: `${color}22`, color, textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'monospace' }}>
                    {gen.kind}
                  </span>
                </div>
                <code style={{ fontSize: 10, color: '#64748B', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {gen.method} {gen.path}
                </code>
                {gen.fire_count > 0 && (
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>
                    Fired {gen.fire_count}× · last {new Date(gen.last_fired).toLocaleString()}
                  </div>
                )}
                <button
                  data-testid={`arsenal-fire-${gen.id}`}
                  onClick={() => fireGenerator(gen)}
                  disabled={firing === gen.id}
                  style={{
                    padding: '8px 12px', borderRadius: 8,
                    background: firing === gen.id ? '#334155' : `${color}22`,
                    border: `1px solid ${color}66`,
                    color, fontWeight: 600, fontSize: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                  }}
                >
                  <Play size={12} />
                  {firing === gen.id ? 'Firing…' : 'Fire'}
                </button>
                {/* Inline result panel — Flatland-compliant */}
                {res && (
                  <div
                    data-testid={`arsenal-result-${gen.id}`}
                    style={{
                      marginTop: 6, padding: 8, borderRadius: 6,
                      background: res.status === 'ok' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                      border: `1px solid ${res.status === 'ok' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                      fontSize: 11, color: '#CBD5E1', maxHeight: 200, overflow: 'auto',
                    }}
                  >
                    <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: res.status === 'ok' ? '#22C55E' : '#EF4444', marginBottom: 4 }}>
                      {res.status}
                    </div>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontFamily: 'monospace', fontSize: 10 }}>
                      {typeof res.payload === 'string' ? res.payload : JSON.stringify(res.payload, null, 2).slice(0, 1200)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Engines grid */}
      <section>
        <h2 style={{ fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#CBD5E1', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cpu size={14} /> Engines <span style={{ color: '#64748B', fontWeight: 400 }}>({filteredEngines.length})</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {filteredEngines.map(eng => {
            const isFE = eng.layer === 'frontend';
            const color = isFE ? '#A78BFA' : '#64748B';
            return (
              <button
                key={eng.id}
                data-testid={`arsenal-engine-${eng.id}`}
                onClick={() => fireEngine(eng)}
                style={{
                  padding: 12, borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${color}44`,
                  color: 'inherit', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{eng.name}</div>
                  <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, background: `${color}22`, color, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                    {eng.layer}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#64748B', fontFamily: 'monospace' }}>
                  {eng.id} · {eng.kind}
                </div>
                {eng.fire_count > 0 && (
                  <div style={{ fontSize: 9, color: '#94A3B8' }}>
                    Fired {eng.fire_count}×
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
