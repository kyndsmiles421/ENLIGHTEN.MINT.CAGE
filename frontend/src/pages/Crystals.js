import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Gem } from 'lucide-react';
import InteractiveModule from '../components/InteractiveModule';
import SpatialRoom from '../components/SpatialRoom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Crystals() {
  const [crystals, setCrystals] = useState([]);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('crystals', 8); }, []);
  useEffect(() => {
    axios.get(`${API}/crystals`).then(res => setCrystals(res.data.crystals || [])).catch(() => toast.error('Could not load crystals'));
  }, []);

  const chakras = [...new Set(crystals.map(c => c.chakra).filter(Boolean))];

  return (
    <SpatialRoom room="crystals">
      <InteractiveModule
        title="Crystal Encyclopedia"
        subtitle="Sacred Crystals"
        icon={Gem}
        color="#8B5CF6"
        category="crystals"
        items={crystals}
        filters={[
          { key: 'all', label: 'All', count: crystals.length },
          ...chakras.slice(0, 6).map(ch => ({ key: ch, label: ch, count: crystals.filter(c => c.chakra === ch).length })),
        ]}
        filterFn={(item, filter) => item.chakra === filter}
        searchFn={(item, q) => {
          const s = q.toLowerCase();
          return item.name?.toLowerCase().includes(s) || item.aka?.toLowerCase().includes(s) || item.chakra?.toLowerCase().includes(s);
        }}
      />
    </SpatialRoom>
  );
}
