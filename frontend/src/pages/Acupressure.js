import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Hand } from 'lucide-react';
import InteractiveModule from '../components/InteractiveModule';
import { useSentience } from '../hooks/useSentience';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Acupressure() {
  const [points, setPoints] = useState([]);
  const sentience = useSentience('ACUPRESSURE');

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('acupressure', 8); }, []);
  useEffect(() => {
    axios.get(`${API}/acupressure/points`).then(res => setPoints(res.data.points || res.data || [])).catch(() => toast.error('Could not load acupressure points'));
  }, []);
  // V69.1 — Sentience commit on entry / on realm change.
  useEffect(() => {
    sentience.commit('narrativeContext', {
      practice: 'acupressure',
      realm_element: sentience.realm?.biome || null,
      intent: 'meridian study',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentience.realm?.biome]);

  const meridians = [...new Set(points.map(p => p.meridian).filter(Boolean))];

  return (
    
      <InteractiveModule
        title="Acupressure Points"
        subtitle="Energy Meridians"
        icon={Hand}
        color="#2DD4BF"
        category="acupressure"
        items={points}
        filters={[
          { key: 'all', label: 'All', count: points.length },
          ...meridians.slice(0, 6).map(m => ({ key: m, label: m, count: points.filter(p => p.meridian === m).length })),
        ]}
        filterFn={(item, filter) => item.meridian === filter}
      />
    
  );
}
