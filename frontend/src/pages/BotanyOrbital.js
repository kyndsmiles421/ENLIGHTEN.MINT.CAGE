import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCosmicState } from '../context/CosmicStateContext';
import { OrbitalHubBase } from '../components/OrbitalHubBase';
import { FiveElementsWheel } from '../components/FiveElementsWheel';
import { NanoGuide } from '../components/NanoGuide';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Leaf, Droplets, Sun, Flame, Mountain, Wind,
  Sprout, Activity, TrendingUp, Beaker, ArrowLeft,
  Search, Eye, X, Loader2,
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ELEMENT_ICONS = { Wood: Leaf, Fire: Flame, Earth: Mountain, Metal: Wind, Water: Droplets };
const ELEMENT_COLORS = { Wood: '#22C55E', Fire: '#EF4444', Earth: '#EAB308', Metal: '#94A3B8', Water: '#3B82F6' };

// Generate orbital planets from the botanical data
function generateBotanyPlanets(plants, garden, gardenSummary, resonanceData, hexagramBits) {
  const planets = [];

  // Plant catalog nodes — one per element that has plants
  const elementGroups = {};
  (plants || []).forEach(p => {
    if (!elementGroups[p.element]) elementGroups[p.element] = [];
    elementGroups[p.element].push(p);
  });
  Object.entries(elementGroups).forEach(([elem, pList]) => {
    planets.push({
      id: `element-${elem.toLowerCase()}`,
      label: `${elem} (${pList.length})`,
      icon: ELEMENT_ICONS[elem] || Leaf,
      color: ELEMENT_COLORS[elem] || '#22C55E',
      desc: `${pList.length} plants · ${pList.filter(p => !p.locked).length} unlocked`,
      data: { type: 'element', element: elem, plants: pList },
    });
  });

  // Garden node
  if (garden?.length > 0) {
    planets.push({
      id: 'garden',
      label: `Garden (${garden.length})`,
      icon: Sprout,
      color: '#34D399',
      desc: 'Your cultivated specimens',
      data: { type: 'garden', garden },
    });
  }

  // Resonance node
  if (resonanceData) {
    planets.push({
      id: 'resonance',
      label: 'Resonance',
      icon: Activity,
      color: '#A78BFA',
      desc: `Score: ${resonanceData.compatibility_score || 0}%`,
      data: { type: 'resonance', resonanceData },
    });
  }

  // Balance Score node
  if (gardenSummary?.balance_score != null) {
    planets.push({
      id: 'balance',
      label: 'Balance',
      icon: TrendingUp,
      color: '#FBBF24',
      desc: `Tier: ${gardenSummary.balance_tier || 'observer'}`,
      data: { type: 'balance', gardenSummary },
    });
  }

  // Identify node (always available)
  planets.push({
    id: 'identify',
    label: 'Identify',
    icon: Eye,
    color: '#60A5FA',
    desc: 'AI plant identification',
    data: { type: 'identify' },
  });

  // Alchemy node (locked behind hexagram bit 2 — element diversity)
  planets.push({
    id: 'alchemy',
    label: 'Alchemy',
    icon: Beaker,
    color: '#C084FC',
    desc: 'Element transmutation',
    data: { type: 'alchemy' },
    requiredBit: 2,
  });

  return planets;
}

// Detail panel for a selected orbital node
function DetailPanel({ planet, onClose, authHeaders }) {
  if (!planet) return null;

  const data = planet.data;
  const Icon = planet.icon;

  return (
    <motion.div
      className="absolute right-4 top-16 z-40 rounded-2xl overflow-hidden overflow-y-auto"
      style={{
        width: 340, maxHeight: 'calc(100vh - 120px)',
        background: 'rgba(0,0,0,0)',
        backdropFilter: 'none',
        border: '1px solid rgba(248,250,252,0.06)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      onClick={e => e.stopPropagation()}
      data-testid="orbital-detail-panel"
    >
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: planet.color }} />
          <span className="text-xs font-medium" style={{ color: planet.color }}>
            {planet.label}
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/5">
          <X size={14} style={{ color: 'rgba(248,250,252,0.3)' }} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {data?.type === 'element' && (
          <>
            <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
              {data.plants.length} specimens in this element family
            </p>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {data.plants.map(p => (
                <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                  style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: p.locked ? 'rgba(248,250,252,0.1)' : planet.color }} />
                  <span className="text-[10px] flex-1" style={{ color: p.locked ? 'rgba(248,250,252,0.15)' : 'rgba(248,250,252,0.5)' }}>
                    {p.name}
                  </span>
                  <span className="text-[7px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
                    {p.rarity}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
        {data?.type === 'garden' && (
          <>
            <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
              {data.garden.length} plants in your garden
            </p>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {data.garden.map(g => (
                <div key={g.garden_id || g.plant_id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                  style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: ELEMENT_COLORS[g.element] || '#22C55E' }} />
                  <span className="text-[10px] flex-1" style={{ color: 'rgba(248,250,252,0.5)' }}>
                    {g.plant_name || g.name}
                  </span>
                  <span className="text-[7px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
                    Stage {g.growth_stage || 1}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
        {data?.type === 'resonance' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>Compatibility</span>
              <span className="text-xs font-mono" style={{ color: planet.color }}>
                {data.resonanceData.compatibility_score || 0}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(248,250,252,0.04)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${data.resonanceData.compatibility_score || 0}%`, background: planet.color }}
              />
            </div>
          </div>
        )}
        {data?.type === 'balance' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>Balance Score</span>
              <span className="text-xs font-mono" style={{ color: planet.color }}>
                {data.gardenSummary.balance_score?.toFixed(1) || 0}
              </span>
            </div>
            <p className="text-[8px] capitalize" style={{ color: 'rgba(248,250,252,0.2)' }}>
              Tier: {data.gardenSummary.balance_tier || 'observer'}
            </p>
          </div>
        )}
        {data?.type === 'identify' && (
          <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
            Use AI to identify any plant from a photo. Navigate to the full Botany page for the camera interface.
          </p>
        )}
        {data?.type === 'alchemy' && (
          <p className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
            Transmutation recipes unlock at Archivist tier with 3+ elements explored.
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  BOTANY ORBITAL — The Botanical garden as orbital 3D space
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function BotanyOrbital() {
  const navigate = useNavigate();
  const { authHeaders, loading: authLoading, token } = useAuth();
  const { cosmicState, fetchCosmicState } = useCosmicState();

  const [plants, setPlants] = useState([]);
  const [garden, setGarden] = useState([]);
  const [gardenSummary, setGardenSummary] = useState(null);
  const [resonanceData, setResonanceData] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      const [catRes, gardenRes] = await Promise.all([
        axios.get(`${API}/botany/catalog`, { headers: authHeaders }),
        axios.get(`${API}/botany/garden`, { headers: authHeaders }),
      ]);
      setPlants(catRes.data.plants || []);
      setGarden(gardenRes.data.garden || []);
      setGardenSummary(gardenRes.data.summary || null);
    } catch {
      toast.error('Failed to load botanical data');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, authLoading, token]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (token) fetchCosmicState(); }, [token, fetchCosmicState]);

  // Load resonance
  useEffect(() => {
    if (!authHeaders || !gardenSummary) return;
    const dominant = gardenSummary?.dominant_element;
    if (dominant) {
      axios.get(`${API}/botany/resonance/${dominant}`, { headers: authHeaders })
        .then(r => setResonanceData(r.data)).catch(() => {});
    }
  }, [authHeaders, gardenSummary]);

  const hexagram = cosmicState?.hexagram;
  const planets = useMemo(() =>
    generateBotanyPlanets(plants, garden, gardenSummary, resonanceData, hexagram?.bits),
    [plants, garden, gardenSummary, resonanceData, hexagram]
  );

  const sun = {
    id: 'botany-center',
    label: 'Botanical Codex',
    subtitle: `${plants.length} specimens`,
    icon: Leaf,
    color: '#22C55E',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#06060e' }}>
        <Loader2 className="animate-spin" size={28} style={{ color: '#22C55E' }} />
      </div>
    );
  }

  return (
    <OrbitalHubBase
      sun={sun}
      planets={planets}
      onPlanetSelect={setSelectedPlanet}
      onBack={() => navigate('/hub')}
      depth={0}
      hexagram={hexagram}
      showSparkline={true}
    >
      {/* Five Elements Wheel overlay — bottom-left */}
      <div className="absolute bottom-4 left-4 z-30" style={{ width: 220 }}>
        <FiveElementsWheel
          activeElement={null}
          onElementClick={() => {}}
          plants={plants}
          gardenSummary={gardenSummary}
          resonanceData={resonanceData}
          energies={cosmicState?.energies}
          stability={cosmicState?.stability}
        />
      </div>

      {/* NanoGuide */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <button onClick={() => navigate('/hub')} className="p-2 rounded-full"
          style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }}
          data-testid="botany-orbital-back">
          <ArrowLeft size={14} style={{ color: 'rgba(248,250,252,0.4)' }} />
        </button>
        <span className="text-[9px] uppercase tracking-[0.15em]"
          style={{ color: 'rgba(248,250,252,0.2)', fontFamily: 'Cormorant Garamond, serif' }}>
          Botanical Orbital
        </span>
        <NanoGuide guideId="botany" position="top-right" />
      </div>

      {/* Switch to full page view */}
      <div className="absolute bottom-24 right-20 z-30">
        <button onClick={() => navigate('/botany')}
          className="px-3 py-1.5 rounded-full text-[8px] font-medium uppercase tracking-wider"
          style={{
            background: 'rgba(248,250,252,0.04)',
            color: 'rgba(248,250,252,0.3)',
            border: '1px solid rgba(248,250,252,0.06)',
          }}
          data-testid="switch-to-full-botany">
          Full Codex View
        </button>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedPlanet && (
          <DetailPanel
            planet={selectedPlanet}
            onClose={() => setSelectedPlanet(null)}
            authHeaders={authHeaders}
          />
        )}
      </AnimatePresence>
    </OrbitalHubBase>
  );
}
