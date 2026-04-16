import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Wine } from 'lucide-react';
import InteractiveModule from '../components/InteractiveModule';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Elixirs() {
  const [elixirs, setElixirs] = useState([]);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('elixirs', 8); }, []);
  useEffect(() => {
    axios.get(`${API}/elixirs/all`).then(res => setElixirs(res.data.elixirs || res.data || [])).catch(() => toast.error('Could not load elixirs'));
  }, []);

  const cats = [...new Set(elixirs.map(e => e.category).filter(Boolean))];

  return (
    
      <InteractiveModule
        title="Sacred Elixirs"
        subtitle="Alchemical Recipes"
        icon={Wine}
        color="#FCD34D"
        category="elixirs"
        items={elixirs}
        filters={[
          { key: 'all', label: 'All', count: elixirs.length },
          ...cats.map(c => ({ key: c, label: c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), count: elixirs.filter(e => e.category === c).length })),
        ]}
        filterFn={(item, filter) => item.category === filter}
      />
    
  );
}
