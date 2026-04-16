import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Droplets } from 'lucide-react';
import InteractiveModule from '../components/InteractiveModule';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Aromatherapy() {
  const [oils, setOils] = useState([]);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('aromatherapy', 8); }, []);
  useEffect(() => {
    axios.get(`${API}/aromatherapy/oils`).then(res => setOils(res.data.oils || [])).catch(() => toast.error('Could not load oils'));
  }, []);

  const elements = [...new Set(oils.map(o => o.element).filter(Boolean))];

  return (
    
      <InteractiveModule
        title="Sacred Aromatherapy"
        subtitle="Essential Oil Wisdom"
        icon={Droplets}
        color="#C084FC"
        category="aromatherapy"
        items={oils}
        filters={[
          { key: 'all', label: 'All', count: oils.length },
          ...elements.map(e => ({ key: e, label: e, count: oils.filter(o => o.element === e).length })),
        ]}
        filterFn={(item, filter) => item.element === filter}
      />
    
  );
}
