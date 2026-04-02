import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCosmicState } from '../context/CosmicStateContext';
import { OrbitalHubBase } from '../components/OrbitalHubBase';
import { HexagramBadge, HexagramGlitch } from '../components/ResonancePulse';
import axios from 'axios';
import {
  BookOpen, Leaf, Sparkles, Compass, Calculator, Star, Orbit,
  ArrowLeft, X, Lock, ChevronRight, Loader2,
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SECTION_ICONS = {
  botany: Leaf, elements: Sparkles, navigation: Compass,
  trade: Orbit, mechanics: Calculator, mastery: Star,
  mathematics: Calculator, resonance: Sparkles,
};
const SECTION_COLORS = {
  botany: '#22C55E', elements: '#EAB308', navigation: '#3B82F6',
  trade: '#C084FC', mechanics: '#94A3B8', mastery: '#FBBF24',
  mathematics: '#60A5FA', resonance: '#A78BFA',
};
const TIER_COLORS = {
  observer: '#60A5FA', synthesizer: '#2DD4BF', archivist: '#FBBF24',
  navigator: '#C084FC', sovereign: '#EF4444',
};

function generateCodexPlanets(entries, sections, tier) {
  const planets = [];
  (sections || []).forEach(sec => {
    const secEntries = entries.filter(e => e.section === sec);
    const unlocked = secEntries.filter(e => !e.locked).length;
    const total = secEntries.length;
    planets.push({
      id: `section-${sec}`,
      label: sec.charAt(0).toUpperCase() + sec.slice(1),
      icon: SECTION_ICONS[sec] || BookOpen,
      color: SECTION_COLORS[sec] || '#94A3B8',
      desc: `${unlocked}/${total} entries unlocked`,
      data: { type: 'section', section: sec, entries: secEntries },
      subPlanets: secEntries.map(e => ({
        id: `entry-${e.id}`,
        label: e.title,
        icon: e.locked ? Lock : (SECTION_ICONS[sec] || BookOpen),
        color: e.locked ? '#4B5563' : (SECTION_COLORS[sec] || '#94A3B8'),
        desc: e.locked ? `Requires ${e.min_tier}` : e.excerpt,
        data: { type: 'entry', entry: e },
        locked: e.locked,
      })),
    });
  });
  return planets;
}

function CodexDetailPanel({ planet, onClose, onDive }) {
  if (!planet) return null;
  const data = planet.data;
  const Icon = planet.icon;

  return (
    <motion.div
      className="absolute right-4 top-16 z-40 rounded-2xl overflow-hidden overflow-y-auto"
      style={{
        width: 340, maxHeight: 'calc(100vh - 120px)',
        background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(248,250,252,0.06)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }}
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      onClick={e => e.stopPropagation()}
      data-testid="codex-orbital-detail-panel"
    >
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: planet.color }} />
          <span className="text-xs font-medium" style={{ color: planet.color }}>{planet.label}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/5">
          <X size={14} style={{ color: 'rgba(248,250,252,0.3)' }} />
        </button>
      </div>
      <div className="p-4 space-y-2">
        {data?.type === 'section' && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
                {data.entries.length} entries in this section
              </span>
              {planet.subPlanets && (
                <button onClick={() => onDive(planet)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[8px]"
                  style={{ background: `${planet.color}10`, color: planet.color, border: `1px solid ${planet.color}20` }}
                  data-testid="codex-dive-btn">
                  Deep Dive <ChevronRight size={10} />
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
              {data.entries.map(e => (
                <div key={e.id} className="flex items-center gap-2 px-2 py-2 rounded-lg"
                  style={{
                    background: e.locked ? 'rgba(248,250,252,0.01)' : 'rgba(248,250,252,0.02)',
                    border: `1px solid ${e.locked ? 'rgba(248,250,252,0.02)' : 'rgba(248,250,252,0.04)'}`,
                    opacity: e.locked ? 0.5 : 1,
                  }}>
                  {e.locked ? <Lock size={10} style={{ color: 'rgba(248,250,252,0.15)' }} />
                    : <div className="w-2 h-2 rounded-full" style={{ background: planet.color }} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] truncate" style={{ color: e.locked ? 'rgba(248,250,252,0.2)' : 'rgba(248,250,252,0.5)' }}>
                      {e.title}
                    </p>
                    {e.min_tier && (
                      <p className="text-[7px]" style={{ color: TIER_COLORS[e.min_tier] || 'rgba(248,250,252,0.1)' }}>
                        {e.min_tier}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {data?.type === 'entry' && (
          <div>
            {data.entry.locked ? (
              <div className="text-center py-4">
                <Lock size={20} className="mx-auto mb-2" style={{ color: 'rgba(248,250,252,0.1)' }} />
                <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
                  Requires {data.entry.min_tier} tier to unlock
                </p>
              </div>
            ) : (
              <>
                <p className="text-[10px] mb-2" style={{ color: 'rgba(248,250,252,0.4)' }}>
                  {data.entry.excerpt || data.entry.content?.substring(0, 200)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[7px] px-1.5 py-0.5 rounded-full"
                    style={{ background: `${TIER_COLORS[data.entry.min_tier]}15`, color: TIER_COLORS[data.entry.min_tier] }}>
                    {data.entry.min_tier}
                  </span>
                  <span className="text-[7px]" style={{ color: 'rgba(248,250,252,0.15)' }}>
                    {data.entry.section}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function CodexOrbital() {
  const navigate = useNavigate();
  const { authHeaders, loading: authLoading, token } = useAuth();
  const { cosmicState, fetchCosmicState } = useCosmicState();

  const [entries, setEntries] = useState([]);
  const [sections, setSections] = useState([]);
  const [tier, setTier] = useState('observer');
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [diveStack, setDiveStack] = useState([]); // recursion stack
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      const res = await axios.get(`${API}/codex/entries`, { headers: authHeaders });
      setEntries(res.data.entries || []);
      setSections(res.data.sections || []);
      setTier(res.data.tier || 'observer');
    } catch {} finally {
      setLoading(false);
    }
  }, [authHeaders, authLoading, token]);

  useEffect(() => { loadEntries(); }, [loadEntries]);
  useEffect(() => { if (token) fetchCosmicState(); }, [token, fetchCosmicState]);

  const hexagram = cosmicState?.hexagram;

  // Current level — top-level sections or deep-dived sub-planets
  const currentDepth = diveStack.length;
  const currentParent = currentDepth > 0 ? diveStack[currentDepth - 1] : null;
  const currentPlanets = useMemo(() => {
    if (currentParent?.subPlanets) return currentParent.subPlanets;
    return generateCodexPlanets(entries, sections, tier);
  }, [entries, sections, tier, currentParent]);

  const sun = currentParent ? {
    id: currentParent.id,
    label: currentParent.label,
    subtitle: `${currentParent.subPlanets?.length || 0} entries`,
    icon: currentParent.icon,
    color: currentParent.color,
  } : {
    id: 'codex-center',
    label: 'Sovereign Codex',
    subtitle: `${entries.length} entries`,
    icon: BookOpen,
    color: '#A78BFA',
  };

  const handlePlanetSelect = (planet) => {
    if (planet.subPlanets) {
      // Deep-dive: push into recursion stack
      setDiveStack(prev => [...prev, planet]);
      setSelectedPlanet(null);
    } else {
      setSelectedPlanet(planet);
    }
  };

  const handleBack = () => {
    if (diveStack.length > 0) {
      setDiveStack(prev => prev.slice(0, -1));
      setSelectedPlanet(null);
    } else {
      navigate('/hub');
    }
  };

  const handleDeepDive = (planet) => {
    setSelectedPlanet(null);
    if (planet.subPlanets) {
      setDiveStack(prev => [...prev, planet]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#06060e' }}>
        <Loader2 className="animate-spin" size={28} style={{ color: '#A78BFA' }} />
      </div>
    );
  }

  return (
    <OrbitalHubBase
      sun={sun} planets={currentPlanets}
      onPlanetSelect={handlePlanetSelect}
      onBack={handleBack}
      depth={currentDepth} hexagram={hexagram} showSparkline={true}
    >
      {/* Header */}
      {currentDepth === 0 && (
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
          <button onClick={() => navigate('/hub')} className="p-2 rounded-full"
            style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }}
            data-testid="codex-orbital-back">
            <ArrowLeft size={14} style={{ color: 'rgba(248,250,252,0.4)' }} />
          </button>
          <span className="text-[9px] uppercase tracking-[0.15em]"
            style={{ color: 'rgba(248,250,252,0.2)', fontFamily: 'Cormorant Garamond, serif' }}>
            Codex Orbital
          </span>
          {cosmicState?.hexagram && (
            <HexagramGlitch active={cosmicState.hexagram.is_transitioning} intensity="low">
              <HexagramBadge hexagram={cosmicState.hexagram} compact />
            </HexagramGlitch>
          )}
        </div>
      )}

      {/* Tier indicator */}
      <div className="absolute bottom-16 left-4 z-30">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
          style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.05)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: TIER_COLORS[tier] }} />
          <span className="text-[8px] capitalize font-medium" style={{ color: TIER_COLORS[tier] }}>
            {tier}
          </span>
        </div>
      </div>

      {/* Full page link */}
      <div className="absolute bottom-20 right-14 z-30">
        <button onClick={() => navigate('/codex')}
          className="px-3 py-1.5 rounded-full text-[8px] font-medium uppercase tracking-wider"
          style={{
            background: 'rgba(248,250,252,0.04)', color: 'rgba(248,250,252,0.3)',
            border: '1px solid rgba(248,250,252,0.06)',
          }}
          data-testid="switch-to-full-codex">
          Full Codex View
        </button>
      </div>

      <AnimatePresence>
        {selectedPlanet && (
          <CodexDetailPanel
            planet={selectedPlanet}
            onClose={() => setSelectedPlanet(null)}
            onDive={handleDeepDive}
          />
        )}
      </AnimatePresence>
    </OrbitalHubBase>
  );
}
