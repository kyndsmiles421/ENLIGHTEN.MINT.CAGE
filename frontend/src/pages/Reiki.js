import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Hand } from 'lucide-react';
import InteractiveModule from '../components/InteractiveModule';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Reiki() {
  const [positions, setPositions] = useState([]);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('reiki', 8); }, []);
  useEffect(() => {
    axios.get(`${API}/reiki/positions`).then(res => setPositions(res.data.positions || [])).catch(() => toast.error('Could not load reiki positions'));
  }, []);

  const chakras = [...new Set(positions.map(p => p.chakra).filter(Boolean))];

  return (
    <InteractiveModule
      title="Reiki Healing"
      subtitle="Universal Life Force"
      icon={Hand}
      color="#F472B6"
      category="reiki"
      items={positions.map(p => ({
        ...p,
        description: `${p.placement}. ${p.intention}`,
        properties: [p.duration, p.chakra, ...(p.sensations ? [p.sensations] : [])],
        element: p.chakra,
      }))}
      filters={[
        { key: 'all', label: 'All', count: positions.length },
        ...chakras.map(ch => ({ key: ch, label: ch.charAt(0).toUpperCase() + ch.slice(1), count: positions.filter(p => p.chakra === ch).length })),
      ]}
      filterFn={(item, filter) => item.chakra === filter}
    />
  );
}
