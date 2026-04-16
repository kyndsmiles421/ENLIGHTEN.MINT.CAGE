import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Terminal, X, Activity, Server, Clock, Zap,
  Shield, Database, Wifi, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function MetricCard({ label, value, color, icon: Icon, sub }) {
  return (
    <div className="rounded-lg p-2.5 text-center"
      style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.06)' }}
      data-testid={`dev-metric-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <Icon size={12} className="mx-auto mb-1" style={{ color }} />
      <p className="text-base font-mono font-bold" style={{ color }}>{value}</p>
      <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {sub && <p className="text-[8px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

export function useTripleTap(callback, delay = 500) {
  const tapCount = useRef(0);
  const timer = useRef(null);

  const handleTap = useCallback(() => {
    tapCount.current += 1;
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      clearTimeout(timer.current);
      callback();
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { tapCount.current = 0; }, delay);
  }, [callback, delay]);

  return handleTap;
}

export default function DevConsole({ isOpen, onClose, authHeaders }) {
  const [health, setHealth] = useState(null);
  const [escrowStats, setEscrowStats] = useState(null);
  const [apiCalls, setApiCalls] = useState([]);
  const [collapsed, setCollapsed] = useState({});
  const intervalRef = useRef(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const [healthRes] = await Promise.all([
        axios.get(`${API}/health`).catch(() => ({ data: { status: 'error' } })),
      ]);
      setHealth(healthRes.data);
    } catch {}

    if (authHeaders) {
      try {
        const escrowRes = await axios.get(`${API}/trade-circle/escrows`, { headers: authHeaders });
        const escrows = escrowRes.data.escrows || [];
        setEscrowStats({
          total: escrows.length,
          committed: escrows.filter(e => e.state === 'committed').length,
          shipped: escrows.filter(e => e.state === 'shipped').length,
          released: escrows.filter(e => e.state === 'released').length,
          disputed: escrows.filter(e => e.state === 'disputed').length,
        });
      } catch {}
    }
  }, [authHeaders]);

  // Track API calls via performance observer
  useEffect(() => {
    if (!isOpen) return;
    fetchMetrics();
    intervalRef.current = setInterval(fetchMetrics, 10000);

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries().filter(e => e.name.includes('/api/'));
      if (entries.length > 0) {
        setApiCalls(prev => {
          const updated = [...entries.map(e => ({
            url: e.name.split('/api/')[1]?.split('?')[0] || e.name,
            duration: Math.round(e.duration),
            timestamp: Date.now(),
          })), ...prev].slice(0, 30);
          return updated;
        });
      }
    });

    try { observer.observe({ entryTypes: ['resource'] }); } catch {}

    return () => {
      clearInterval(intervalRef.current);
      try { observer.disconnect(); } catch {}
    };
  }, [isOpen, fetchMetrics]);

  if (!isOpen) return null;

  const perfGrade = (() => {
    if (apiCalls.length === 0) return { grade: 'A', color: '#22C55E' };
    const avg = apiCalls.reduce((s, c) => s + c.duration, 0) / apiCalls.length;
    if (avg < 200) return { grade: 'A', color: '#22C55E' };
    if (avg < 500) return { grade: 'B', color: '#2DD4BF' };
    if (avg < 1000) return { grade: 'C', color: '#EAB308' };
    return { grade: 'D', color: '#EF4444' };
  })();

  const avgLatency = apiCalls.length > 0
    ? Math.round(apiCalls.reduce((s, c) => s + c.duration, 0) / apiCalls.length)
    : 0;

  const toggle = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-16 right-4 z-[300] w-80 max-h-[70vh] overflow-y-auto rounded-xl"
        style={{
          background: 'rgba(3,3,8,0.95)',
          backdropFilter: 'none',
          border: '1px solid rgba(34,197,94,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
        data-testid="dev-console"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
          style={{ background: 'rgba(3,3,8,0.95)', borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
          <div className="flex items-center gap-2">
            <Terminal size={14} style={{ color: '#22C55E' }} />
            <span className="text-xs font-mono font-bold" style={{ color: '#22C55E' }}>DEV CONSOLE</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded font-mono"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
              v1.0
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5" data-testid="dev-console-close">
            <X size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Performance Grade */}
          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="Perf Grade" value={perfGrade.grade} color={perfGrade.color} icon={Zap} />
            <MetricCard label="Avg Latency" value={`${avgLatency}ms`} color={avgLatency < 300 ? '#22C55E' : avgLatency < 800 ? '#EAB308' : '#EF4444'} icon={Clock} />
            <MetricCard label="API Calls" value={apiCalls.length} color="#818CF8" icon={Activity} />
          </div>

          {/* System Status */}
          <div>
            <button onClick={() => toggle('system')} className="flex items-center justify-between w-full mb-2">
              <span className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Server size={10} /> System Status
              </span>
              {collapsed.system ? <ChevronDown size={10} style={{ color: 'var(--text-muted)' }} /> : <ChevronUp size={10} style={{ color: 'var(--text-muted)' }} />}
            </button>
            {!collapsed.system && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)' }}>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>API Health</span>
                  <span className="text-[10px] font-mono flex items-center gap-1"
                    style={{ color: health?.status === 'ok' ? '#22C55E' : '#EF4444' }}>
                    <Wifi size={8} /> {health?.status || 'checking...'}
                  </span>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)' }}>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Service</span>
                  <span className="text-[10px] font-mono" style={{ color: '#2DD4BF' }}>{health?.service || '—'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Escrow Stats */}
          {escrowStats && (
            <div>
              <button onClick={() => toggle('escrow')} className="flex items-center justify-between w-full mb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Shield size={10} /> Escrow Pipeline
                </span>
                {collapsed.escrow ? <ChevronDown size={10} style={{ color: 'var(--text-muted)' }} /> : <ChevronUp size={10} style={{ color: 'var(--text-muted)' }} />}
              </button>
              {!collapsed.escrow && (
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { label: 'Total', value: escrowStats.total, color: '#818CF8' },
                    { label: 'Locked', value: escrowStats.committed, color: '#EAB308' },
                    { label: 'Transit', value: escrowStats.shipped, color: '#FB923C' },
                    { label: 'Done', value: escrowStats.released, color: '#22C55E' },
                    { label: 'Disputed', value: escrowStats.disputed, color: '#EF4444' },
                  ].map(s => (
                    <div key={s.label} className="text-center py-1.5 rounded" style={{ background: `${s.color}08` }}>
                      <p className="text-sm font-mono font-bold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent API Calls */}
          <div>
            <button onClick={() => toggle('calls')} className="flex items-center justify-between w-full mb-2">
              <span className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Database size={10} /> Recent API Calls ({apiCalls.length})
              </span>
              {collapsed.calls ? <ChevronDown size={10} style={{ color: 'var(--text-muted)' }} /> : <ChevronUp size={10} style={{ color: 'var(--text-muted)' }} />}
            </button>
            {!collapsed.calls && (
              <div className="space-y-0.5 max-h-40 overflow-y-auto">
                {apiCalls.length === 0 ? (
                  <p className="text-[10px] text-center py-3 font-mono" style={{ color: 'var(--text-muted)' }}>No calls tracked yet</p>
                ) : (
                  apiCalls.slice(0, 15).map((c, i) => (
                    <div key={i} className="flex items-center justify-between px-2 py-1 rounded text-[9px] font-mono"
                      style={{ background: 'rgba(248,250,252,0.02)' }}>
                      <span style={{ color: 'var(--text-secondary)' }} className="truncate max-w-[180px]">{c.url}</span>
                      <span style={{
                        color: c.duration < 200 ? '#22C55E' : c.duration < 500 ? '#2DD4BF' : c.duration < 1000 ? '#EAB308' : '#EF4444'
                      }}>
                        {c.duration}ms
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Memory */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)' }}>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>JS Heap</span>
            <span className="text-[10px] font-mono" style={{ color: '#2DD4BF' }}>
              {typeof performance !== 'undefined' && performance.memory
                ? `${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB`
                : 'N/A'}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
