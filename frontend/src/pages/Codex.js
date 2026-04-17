import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ArrowLeft, Search, BookOpen, Lock, ChevronRight, Star,
  Leaf, Compass, Calculator, Orbit, Sparkles, Loader2
} from 'lucide-react';
import { HexagramBadge, HexagramGlitch } from '../components/ResonancePulse';
import { useCosmicState } from '../context/CosmicStateContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SECTION_ICONS = {
  navigation: Compass, botany: Leaf, elements: Sparkles, trade: Orbit,
  mechanics: Calculator, mastery: Star, mathematics: Calculator, resonance: Sparkles,
};

const TIER_COLORS = {
  observer: '#60A5FA', synthesizer: '#2DD4BF', archivist: '#FBBF24',
  navigator: '#C084FC', sovereign: '#EF4444',
};

export default function Codex() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('codex', 8); }, []);

  const navigate = useNavigate();
  const { authHeaders, loading: authLoading, token } = useAuth();
  const { cosmicState, fetchCosmicState } = useCosmicState();
  const [entries, setEntries] = useState([]);
  const [sections, setSections] = useState([]);
  const [tier, setTier] = useState('observer');
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      const params = {};
      if (activeSection) params.section = activeSection;
      if (search.trim()) params.search = search.trim();
      const res = await axios.get(`${API}/codex/entries`, { headers: authHeaders, params });
      setEntries(res.data.entries || []);
      setSections(res.data.sections || []);
      setTier(res.data.tier || 'observer');
    } catch {
    } finally {
      setLoading(false);
    }
  }, [authHeaders, authLoading, token, activeSection, search]);

  useEffect(() => { loadEntries(); }, [loadEntries]);
  useEffect(() => { if (token) fetchCosmicState(); }, [token, fetchCosmicState]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#06060e' }}>
      <Loader2 className="animate-spin" size={28} style={{ color: '#C084FC' }} />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#06060e' }} data-testid="codex-page">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/hub')} className="p-2 rounded-full"
              style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }}
              data-testid="codex-back-btn">
              <ArrowLeft size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
            </button>
            <div>
              <h1 className="text-xl font-light tracking-[0.2em] uppercase"
                style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Cormorant Garamond, serif' }}>
                Sovereign Codex
              </h1>
              <p className="text-[9px] mt-0.5" style={{ color: 'rgba(248,250,252,0.15)' }}>
                Tier: <span style={{ color: TIER_COLORS[tier] }}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</span> &middot; {entries.length} entries
              </p>
            </div>
          </div>
          {/* Hexagram gate indicator */}
          {cosmicState?.hexagram && (
            <HexagramGlitch active={cosmicState.hexagram.is_transitioning} intensity="medium">
              <HexagramBadge hexagram={cosmicState.hexagram} />
            </HexagramGlitch>
          )}
        </div>

        {/* Search + Section Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.6)' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search the Codex..."
              className="w-full pl-8 pr-3 py-2 rounded-lg text-[10px]"
              style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC', outline: 'none' }}
              data-testid="codex-search" />
          </div>
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setActiveSection(null)}
              className="px-2 py-1 rounded-full text-[8px] font-medium"
              style={{
                background: !activeSection ? 'rgba(192,132,252,0.12)' : 'rgba(248,250,252,0.02)',
                color: !activeSection ? '#C084FC' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${!activeSection ? 'rgba(192,132,252,0.2)' : 'rgba(248,250,252,0.04)'}`,
              }}
              data-testid="codex-filter-all">All</button>
            {sections.map(s => {
              const SIcon = SECTION_ICONS[s] || BookOpen;
              return (
                <button key={s} onClick={() => setActiveSection(activeSection === s ? null : s)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-medium capitalize"
                  style={{
                    background: activeSection === s ? 'rgba(192,132,252,0.12)' : 'rgba(248,250,252,0.02)',
                    color: activeSection === s ? '#C084FC' : 'rgba(255,255,255,0.6)',
                    border: `1px solid ${activeSection === s ? 'rgba(192,132,252,0.2)' : 'rgba(248,250,252,0.04)'}`,
                  }}
                  data-testid={`codex-filter-${s}`}>
                  <SIcon size={9} /> {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Entries */}
        <div className="space-y-2">
          {entries.map(entry => {
            const tierColor = TIER_COLORS[entry.tier] || '#94A3B8';
            const SIcon = SECTION_ICONS[entry.section] || BookOpen;
            const isExpanded = expanded === entry.id;

            return (
              <motion.div key={entry.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: entry.locked ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0)',
                  border: `1px solid ${entry.locked ? 'rgba(248,250,252,0.03)' : `${tierColor}12`}`,
                  opacity: entry.locked ? 0.6 : 1,
                }}
                data-testid={`codex-entry-${entry.id}`}>
                <button
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                  onClick={() => !entry.locked && setExpanded(isExpanded ? null : entry.id)}
                  disabled={entry.locked}>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${tierColor}10`, border: `1px solid ${tierColor}20` }}>
                      {entry.locked ? <Lock size={12} style={{ color: 'rgba(248,250,252,0.15)' }} />
                        : <SIcon size={13} style={{ color: tierColor }} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-medium" style={{ color: entry.locked ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.85)' }}>
                        {entry.title}
                      </p>
                      <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{entry.summary}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full capitalize"
                      style={{ background: `${tierColor}10`, color: tierColor, border: `1px solid ${tierColor}20` }}>
                      {entry.tier}
                    </span>
                    {!entry.locked && (
                      <ChevronRight size={12} style={{ color: 'rgba(248,250,252,0.15)', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && !entry.locked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-4 pt-1"
                        style={{ borderTop: `1px solid ${tierColor}10` }}>
                        <p className="text-[10px] leading-relaxed whitespace-pre-line"
                          style={{ color: 'rgba(255,255,255,0.75)' }}>
                          {entry.body}
                        </p>
                        {entry.tags && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {entry.tags.map(tag => (
                              <span key={tag} className="text-[7px] px-1.5 py-0.5 rounded"
                                style={{ background: `${tierColor}08`, color: `${tierColor}88`, border: `1px solid ${tierColor}12` }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          {entries.length === 0 && (
            <p className="text-center text-[10px] py-8" style={{ color: 'rgba(248,250,252,0.15)' }}>No entries match</p>
          )}
        </div>
      </div>
    </div>
  );
}
