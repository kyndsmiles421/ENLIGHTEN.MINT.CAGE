/**
 * TimeCapsuleDrawer.js — Resurrection UI (V68.60)
 *
 * Inline expanding drawer that lists the user's archived time
 * capsules and lets them resurrect one by re-committing the
 * snapshot to the ContextBus. Closes the save-game loop opened
 * in V68.59.
 *
 * Flatland: no portal, no fixed positioning. Renders directly into
 * the matrix slot below the dispatcher row when expanded.
 *
 * Resume sequence:
 *   1) Fetch the chosen capsule's snapshot
 *   2) For each populated key (worldMetadata, narrativeContext,
 *      entityState, sceneFrame), call ContextBus.commit(key, data)
 *   3) Each commit auto-pulses the field (existing behavior in
 *      ContextBus.js), so the lattice paints the resurrected mood
 *   4) Pull the saved active_module via ProcessorState if not IDLE
 *   5) Close the drawer
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { History, Loader2, Sparkles, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { commit as busCommit } from '../state/ContextBus';
import { useProcessorState } from '../state/ProcessorState';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATE_COLOR = {
  cold:        '#38BDF8',
  flow:        '#FBBF24',
  overheating: '#EF4444',
};

function timeAgo(iso) {
  if (!iso) return '';
  try {
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 60_000) return 'just now';
    if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
    if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h ago`;
    return `${Math.round(ms / 86_400_000)}d ago`;
  } catch { return ''; }
}

function summarize(snapshot) {
  if (!snapshot) return [];
  const out = [];
  const w = snapshot.worldMetadata;
  if (w) {
    out.push({
      key: 'World',
      text: w.origin_name || w.biome || w.scene_title || JSON.stringify(w).slice(0, 60),
    });
  }
  const n = snapshot.narrativeContext;
  if (n) {
    out.push({
      key: n.type === 'forecast' ? 'Forecast' : n.type === 'dream' ? 'Dream' : 'Narrative',
      text: n.title || (typeof n.body === 'string' ? n.body.slice(0, 60) : '') || JSON.stringify(n).slice(0, 60),
    });
  }
  const e = snapshot.entityState;
  if (e) {
    out.push({
      key: 'Entity',
      text: e.description || e.spirit_animal || e.zodiac || JSON.stringify(e).slice(0, 60),
    });
  }
  const s = snapshot.sceneFrame;
  if (s) {
    out.push({ key: 'Scene', text: s.resonance_name || s.mood || 'palette' });
  }
  return out;
}

export default function TimeCapsuleDrawer({ open, onClose }) {
  const { authHeaders } = useAuth();
  const { pull } = useProcessorState();
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [resumingId, setResumingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Read live token directly — useAuth's authHeaders may still be
      // bootstrapping when the drawer first opens. Falling back to
      // localStorage matches the AuthContext's own gatekeeper logic.
      let headers = authHeaders;
      if (!headers || !headers.Authorization) {
        const t = (typeof window !== 'undefined' && (localStorage.getItem('zen_token') || localStorage.getItem('token'))) || '';
        if (t && t !== 'guest_token') headers = { Authorization: `Bearer ${t}` };
      }
      if (!headers || !headers.Authorization) {
        setError('Sign in to view your time capsules');
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API}/time-capsules/recent?limit=12`, { headers });
      setCapsules(res.data?.capsules || []);
    } catch (e) {
      const detail = e?.response?.status
        ? `Could not load capsules (${e.response.status})`
        : 'Could not load capsules — check your connection';
      setError(detail);
    }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const resume = useCallback((capsule) => {
    setResumingId(capsule.session_id);
    try {
      const snap = capsule.snapshot || {};
      // Re-commit each populated key. ContextBus auto-pulses the
      // field after each, so the lattice repaints to the saved mood.
      ['worldMetadata', 'narrativeContext', 'entityState', 'sceneFrame'].forEach((k) => {
        if (snap[k]) busCommit(k, snap[k], { moduleId: capsule.active_module || null });
      });
      // Pull the saved active module if it was non-idle
      if (capsule.active_module && capsule.active_module !== 'IDLE') {
        try { pull(capsule.active_module); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      }
    } finally {
      setTimeout(() => {
        setResumingId(null);
        onClose?.();
      }, 600);
    }
  }, [pull, onClose]);

  const sorted = useMemo(
    () => [...capsules].sort((a, b) => (b.archived_at_ts || 0) - (a.archived_at_ts || 0)),
    [capsules],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          data-testid="time-capsule-drawer"
          className="overflow-hidden"
          style={{
            margin: '8px 12px',
            borderRadius: 14,
            background: 'linear-gradient(180deg, rgba(20,18,40,0.55) 0%, rgba(10,10,20,0.85) 100%)',
            border: '1px solid rgba(168, 139, 250, 0.22)',
          }}
        >
          <div className="flex items-center justify-between px-3 py-2"
               style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <History size={11} style={{ color: '#A78BFA' }} />
              <span className="text-[8px] font-bold uppercase tracking-[0.25em]" style={{ color: '#A78BFA' }}>
                Time Capsules · Resurrect
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              data-testid="capsule-close-btn"
              className="p-1 rounded-md hover:bg-white/5 active:scale-95"
              aria-label="Close"
            >
              <X size={12} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>
          </div>

          <div className="px-3 py-2">
            {loading && (
              <div className="flex items-center gap-2 py-3 text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <Loader2 size={11} className="animate-spin" />
                Reading capsules…
              </div>
            )}
            {error && !loading && (
              <p className="py-3 text-[10px]" style={{ color: '#EF4444' }}>{error}</p>
            )}
            {!loading && !error && sorted.length === 0 && (
              <p className="py-3 text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                No capsules yet. Generate something — your session will archive automatically when you close the tab.
              </p>
            )}
            {!loading && sorted.length > 0 && (
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto" data-testid="capsule-list">
                {sorted.map((c) => {
                  const sc = STATE_COLOR[c.gauge_state] || '#A78BFA';
                  const items = summarize(c.snapshot);
                  const resuming = resumingId === c.session_id;
                  return (
                    <div
                      key={c.session_id + (c.archived_at_ts || '')}
                      className="rounded-lg p-2.5"
                      style={{
                        background: 'rgba(255,255,255,0.025)',
                        border: `1px solid ${sc}33`,
                      }}
                      data-testid={`capsule-${c.session_id}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{ background: `${sc}22`, color: sc }}
                          >
                            {c.gauge_state || 'idle'}
                          </span>
                          {c.active_module && c.active_module !== 'IDLE' && (
                            <span className="text-[7px] uppercase tracking-wider opacity-70" style={{ color: 'rgba(255,255,255,0.55)' }}>
                              {c.active_module.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] opacity-50" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          {timeAgo(c.archived_at)}
                        </span>
                      </div>
                      {items.length > 0 ? (
                        <ul className="space-y-0.5 mb-2">
                          {items.map((it, i) => (
                            <li key={i} className="text-[9px] leading-snug truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
                              <span style={{ color: sc }}>{it.key}:</span> {it.text}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[9px] mb-2 italic" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          (empty snapshot)
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => resume(c)}
                        disabled={resuming}
                        data-testid={`capsule-resume-${c.session_id}`}
                        className="w-full px-2 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        style={{
                          background: `${sc}14`,
                          border: `1px solid ${sc}55`,
                          color: sc,
                          opacity: resuming ? 0.5 : 1,
                        }}
                      >
                        {resuming
                          ? <><Loader2 size={9} className="animate-spin" /> Resurrecting…</>
                          : <><Sparkles size={9} /> Resume · Resurrect</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
