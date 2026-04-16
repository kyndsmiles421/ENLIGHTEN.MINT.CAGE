import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import InteractiveModule from '../components/InteractiveModule';
import { Hand } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Mudras() {
  const [mudras, setMudras] = useState([]);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('mudras', 8); }, []);
  useEffect(() => {
    axios.get(`${API}/mudras`).then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.mudras || [];
      setMudras(data);
    }).catch(() => toast.error('Could not load mudras'));
  }, []);

  const elements = [...new Set(mudras.map(m => m.element).filter(Boolean))];

  return (
    <InteractiveModule
      title="Sacred Mudras"
      subtitle="Gesture of Power"
      icon={Hand}
      color="#FDA4AF"
      category="mudras"
      items={mudras.map(m => ({
        ...m,
        properties: m.benefits || [],
        subtitle: m.sanskrit || '',
      }))}
      filters={[
        { key: 'all', label: 'All', count: mudras.length },
        ...elements.slice(0, 5).map(e => ({ key: e, label: e, count: mudras.filter(mu => mu.element === e).length })),
      ]}
      filterFn={(item, filter) => item.element === filter}
    />
  );
}
