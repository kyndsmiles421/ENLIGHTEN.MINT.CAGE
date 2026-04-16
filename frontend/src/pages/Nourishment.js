import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Leaf } from 'lucide-react';
import InteractiveModule from '../components/InteractiveModule';
import FeaturedVideos from '../components/FeaturedVideos';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Nourishment() {
  const [items, setItems] = useState([]);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('nourishment', 8); }, []);
  useEffect(() => {
    axios.get(`${API}/nourishment`).then(res => setItems(res.data)).catch(() => toast.error('Could not load nourishment data'));
  }, []);

  return (
    <InteractiveModule
      title="Sacred Nourishment"
      subtitle="Food for the Spirit"
      icon={Leaf}
      color="#22C55E"
      category="nourishment"
      items={items}
      filters={[
        { key: 'all', label: 'All', count: items.length },
        { key: 'drinks', label: 'Elixirs & Drinks', count: items.filter(i => i.category === 'drinks').length },
        { key: 'meals', label: 'Sacred Meals', count: items.filter(i => i.category === 'meals').length },
      ]}
      filterFn={(item, filter) => item.category === filter}
    >
      <FeaturedVideos category="nourishment" color="#22C55E" title="Mindful Eating Videos" />
    </InteractiveModule>
  );
}
