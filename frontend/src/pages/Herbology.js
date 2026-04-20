import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Leaf, Flame, FlaskConical } from 'lucide-react';
import InteractiveModule from '../components/InteractiveModule';
import HolographicChamber from '../components/HolographicChamber';
import ChamberProp from '../components/ChamberProp';
import ChamberMiniGame from '../components/games/ChamberMiniGame';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ACCENT = '#84CC16';

export default function Herbology() {
  const [herbs, setHerbs] = useState([]);
  const [pluckOpen, setPluckOpen] = useState(false);
  const [brewOpen, setBrewOpen] = useState(false);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('herbology', 8); }, []);
  useEffect(() => {
    axios.get(`${API}/herbology/herbs`).then(res => setHerbs(res.data.herbs || [])).catch(() => toast.error('Could not load herbs'));
  }, []);

  const allSystems = [...new Set(herbs.flatMap(h => h.systems || []))];

  return (
    <HolographicChamber
      chamberId="herbology"
      title="The Apothecary Garden"
      subtitle="Sacred Herbology Sanctuary"
    >
      {/* Interactive chamber props — enter a live mini-game */}
      <ChamberProp
        x={18} y={54} size={78}
        label="PLUCK HERBS"
        icon={Leaf}
        color={ACCENT}
        onActivate={() => setPluckOpen(true)}
        testid="herbology-prop-pluck"
      />
      <ChamberProp
        x={82} y={62} size={70}
        label="BREW ELIXIR"
        icon={FlaskConical}
        color="#C084FC"
        onActivate={() => setBrewOpen(true)}
        testid="herbology-prop-brew"
      />

      <ChamberMiniGame
        open={pluckOpen}
        onClose={() => setPluckOpen(false)}
        mode="collect"
        color={ACCENT}
        title="PLUCK THE FLOATING HERBS"
        verb="HERB"
        icon={Leaf}
        targetCount={8}
        zone="herbology_pluck"
        completionMsg="HARVEST COMPLETE"
        completionXP={12}
      />
      <ChamberMiniGame
        open={brewOpen}
        onClose={() => setBrewOpen(false)}
        mode="break"
        color="#C084FC"
        title="GRIND HERBS INTO ELIXIR"
        verb="GRIND"
        icon={Flame}
        targetCount={4}
        hitsPerTarget={4}
        zone="herbology_brew"
        completionMsg="ELIXIR BREWED"
        completionXP={14}
      />

      <InteractiveModule
        title="The Healing Herb Garden"
        subtitle="Sacred Herbology"
        icon={Leaf}
        color={ACCENT}
        category="herbology"
        holographic={false}
        items={herbs}
        filters={[
          { key: 'all', label: 'All', count: herbs.length },
          ...allSystems.slice(0, 5).map(s => ({ key: s, label: s, count: herbs.filter(h => h.systems?.includes(s)).length })),
        ]}
        filterFn={(item, filter) => item.systems?.includes(filter)}
        searchFn={(item, q) => {
          const s = q.toLowerCase();
          return item.name?.toLowerCase().includes(s) || item.latin?.toLowerCase().includes(s) || item.properties?.some(p => p.toLowerCase().includes(s));
        }}
      />
    </HolographicChamber>
  );
}
