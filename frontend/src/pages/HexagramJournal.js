import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCosmicState } from '../context/CosmicStateContext';
import { HexagramBadge, HexagramGlitch } from '../components/ResonancePulse';
import axios from 'axios';
import { ArrowLeft, BookOpen, Loader2, RefreshCw } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STABILITY_COLORS = { stable: '#22C55E', shifting: '#FBBF24', volatile: '#EF4444' };
const ELEMENT_COLORS = { Wood: '#22C55E', Fire: '#EF4444', Earth: '#EAB308', Metal: '#94A3B8', Water: '#3B82F6' };

function JournalEntry({ entry, isLatest }) {
  const [expanded, setExpanded] = useState(false);
  const stabColor = STABILITY_COLORS[entry.stability] || '#94A3B8';
  const date = new Date(entry.timestamp);
  const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const lineChars = (entry.bits || []).map(b => b ? '━' : '╍');

  return (
    <motion.div
      className="rounded-xl overflow-hidden"
      style={{
        background: isLatest ? 'rgba(167,139,250,0.04)' : 'rgba(248,250,252,0.015)',
        border: `1px solid ${isLatest ? 'rgba(167,139,250,0.12)' : 'rgba(248,250,252,0.04)'}`,
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      data-testid={`journal-entry-${entry.hexagram_number}`}
    >
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left">
        {/* Hexagram lines miniature */}
        <div className="flex flex-col gap-[1px] items-center flex-shrink-0" style={{ width: 16 }}>
          {lineChars.slice().reverse().map((ch, i) => (
            <div key={i} className="text-[6px] font-mono leading-none"
              style={{ color: entry.changing_lines?.some(cl => cl.line === 5 - i) ? '#FBBF24' : 'rgba(255,255,255,0.6)' }}>
              {ch}
            </div>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {entry.chinese} {entry.pinyin}
            </span>
            <span className="text-[8px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
              #{entry.hexagram_number}
            </span>
            {isLatest && (
              <span className="text-[6px] px-1.5 py-0.5 rounded-full uppercase font-medium"
                style={{ background: 'rgba(167,139,250,0.12)', color: '#A78BFA' }}>current</span>
            )}
          </div>
          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {entry.name}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {timeStr}
          </span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: stabColor }} />
            <span className="text-[7px] capitalize" style={{ color: stabColor }}>
              {entry.stability}
            </span>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div className="px-4 pb-3 space-y-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ borderTop: '1px solid rgba(248,250,252,0.03)' }}>

            {/* Trigrams */}
            <div className="flex gap-4 mt-2">
              <div>
                <p className="text-[7px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.12)' }}>Upper</p>
                <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{entry.trigrams?.upper}</p>
              </div>
              <div>
                <p className="text-[7px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.12)' }}>Lower</p>
                <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{entry.trigrams?.lower}</p>
              </div>
              <div>
                <p className="text-[7px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.12)' }}>Frequency</p>
                <p className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.65)' }}>{entry.solfeggio_hz}Hz</p>
              </div>
            </div>

            {/* Energy levels */}
            {entry.energies && (
              <div>
                <p className="text-[7px] uppercase tracking-wider mb-1" style={{ color: 'rgba(248,250,252,0.12)' }}>Element Energies</p>
                <div className="flex gap-1.5">
                  {Object.entries(entry.energies).map(([elem, val]) => (
                    <div key={elem} className="flex-1 rounded px-1.5 py-1 text-center"
                      style={{ background: `${ELEMENT_COLORS[elem]}08`, border: `1px solid ${ELEMENT_COLORS[elem]}15` }}>
                      <p className="text-[6px] uppercase" style={{ color: `${ELEMENT_COLORS[elem]}60` }}>{elem.charAt(0)}</p>
                      <p className="text-[9px] font-mono" style={{ color: ELEMENT_COLORS[elem] }}>{val.toFixed(1)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Changing lines */}
            {entry.changing_lines?.length > 0 && (
              <div>
                <p className="text-[7px] uppercase tracking-wider mb-1" style={{ color: '#FBBF24' }}>
                  Changing Lines
                </p>
                {entry.changing_lines.map((cl, i) => (
                  <p key={i} className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Line {cl.line}: {cl.label} ({cl.direction})
                  </p>
                ))}
              </div>
            )}

            {/* Previous hexagram */}
            {entry.previous_hexagram && (
              <p className="text-[8px]" style={{ color: 'rgba(248,250,252,0.15)' }}>
                Transitioned from #{entry.previous_hexagram}
              </p>
            )}

            {/* Equilibrium */}
            <div className="flex items-center gap-2">
              <span className="text-[7px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.12)' }}>Equilibrium</span>
              <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(248,250,252,0.04)' }}>
                <div className="h-full rounded-full" style={{
                  width: `${entry.equilibrium_score || 0}%`,
                  background: entry.equilibrium_score >= 60 ? '#22C55E' : entry.equilibrium_score >= 30 ? '#FBBF24' : '#EF4444',
                }} />
              </div>
              <span className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {entry.equilibrium_score?.toFixed(0) || 0}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HexagramJournal() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('hexagram_journal', 8); }, []);

  const navigate = useNavigate();
  const { authHeaders, loading: authLoading, token } = useAuth();
  const { cosmicState, fetchCosmicState } = useCosmicState();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);

  const loadJournal = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      const res = await axios.get(`${API}/hexagram/journal?limit=50`, { headers: authHeaders });
      setEntries(res.data.entries || []);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } finally {
      setLoading(false);
    }
  }, [authHeaders, authLoading, token]);

  useEffect(() => { loadJournal(); }, [loadJournal]);
  useEffect(() => { if (token) fetchCosmicState(); }, [token, fetchCosmicState]);

  const recordTransition = async () => {
    setRecording(true);
    try {
      const res = await axios.post(`${API}/hexagram/journal/record`, {}, { headers: authHeaders });
      if (res.data.recorded) {
        loadJournal();
      }
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); } finally {
      setRecording(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#06060e' }}>
        <Loader2 className="animate-spin" size={28} style={{ color: '#C084FC' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#06060e' }} data-testid="hexagram-journal-page">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/hub')} className="p-2 rounded-full"
              style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }}
              data-testid="journal-back-btn">
              <ArrowLeft size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
            </button>
            <div>
              <h1 className="text-xl font-light tracking-[0.2em] uppercase flex items-center gap-2"
                style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Cormorant Garamond, serif' }}>
                <BookOpen size={18} style={{ color: '#C084FC' }} />
                Book of Changes
              </h1>
              <p className="text-[9px] mt-0.5" style={{ color: 'rgba(248,250,252,0.15)' }}>
                {entries.length} transitions recorded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Current hexagram */}
            {cosmicState?.hexagram && (
              <HexagramGlitch active={cosmicState.hexagram.is_transitioning} intensity="low">
                <HexagramBadge hexagram={cosmicState.hexagram} compact />
              </HexagramGlitch>
            )}
            <button onClick={recordTransition} disabled={recording}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-medium"
              style={{
                background: 'rgba(192,132,252,0.08)',
                color: '#C084FC',
                border: '1px solid rgba(192,132,252,0.15)',
              }}
              data-testid="record-transition-btn">
              <RefreshCw size={10} className={recording ? 'animate-spin' : ''} />
              Record Now
            </button>
          </div>
        </div>

        {/* Timeline */}
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={32} className="mx-auto mb-3" style={{ color: 'rgba(248,250,252,0.08)' }} />
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              No transitions recorded yet
            </p>
            <p className="text-[9px] mt-1" style={{ color: 'rgba(248,250,252,0.1)' }}>
              Click "Record Now" to capture your current hexagram state
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <JournalEntry key={`${entry.timestamp}-${i}`} entry={entry} isLatest={i === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
