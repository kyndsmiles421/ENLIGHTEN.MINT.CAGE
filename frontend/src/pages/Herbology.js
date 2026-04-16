import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Leaf } from 'lucide-react';
import InteractiveModule from '../components/InteractiveModule';
import SpatialRoom from '../components/SpatialRoom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Herbology() {
  const [herbs, setHerbs] = useState([]);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('herbology', 8); }, []);
  useEffect(() => {
    axios.get(`${API}/herbology/herbs`).then(res => setHerbs(res.data.herbs || [])).catch(() => toast.error('Could not load herbs'));
  }, []);

  const allSystems = [...new Set(herbs.flatMap(h => h.systems || []))];

  return (
    <SpatialRoom room="herbology">
      <InteractiveModule
        title="The Healing Herb Garden"
        subtitle="Sacred Herbology"
        icon={Leaf}
        color="#84CC16"
        category="herbology"
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
    </SpatialRoom>
  );
}
