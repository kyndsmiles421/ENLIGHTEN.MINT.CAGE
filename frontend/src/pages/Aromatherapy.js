import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Droplets, Flower2, Sparkles } from 'lucide-react';
import InteractiveModule from '../components/InteractiveModule';
import HolographicChamber from '../components/HolographicChamber';
import ChamberProp from '../components/ChamberProp';
import ChamberMiniGame from '../components/games/ChamberMiniGame';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ACCENT = '#C084FC';

export default function Aromatherapy() {
  const [oils, setOils] = useState([]);
  const [blendOpen, setBlendOpen] = useState(false);
  const [essenceOpen, setEssenceOpen] = useState(false);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('aromatherapy', 8); }, []);
  useEffect(() => {
    axios.get(`${API}/aromatherapy/oils`).then(res => setOils(res.data.oils || [])).catch(() => toast.error('Could not load oils'));
  }, []);

  const elements = [...new Set(oils.map(o => o.element).filter(Boolean))];

  return (
    <HolographicChamber
      chamberId="aromatherapy"
      title="The Essence Atelier"
      subtitle="Sacred Aromatherapy Sanctum"
    >
      <ChamberProp
        x={22} y={58} size={78}
        label="BLEND ESSENCES"
        icon={Flower2}
        color={ACCENT}
        onActivate={() => setBlendOpen(true)}
        testid="aromatherapy-prop-blend"
      />
      <ChamberProp
        x={80} y={34} size={64}
        label="CATCH ESSENCE"
        icon={Sparkles}
        color="#FCD34D"
        onActivate={() => setEssenceOpen(true)}
        testid="aromatherapy-prop-catch"
      />

      <ChamberMiniGame
        open={blendOpen}
        onClose={() => setBlendOpen(false)}
        mode="rhythm"
        color={ACCENT}
        title="ALIGN THE BLEND TO PHI"
        verb="POUR"
        icon={Droplets}
        targetCount={5}
        zone="aromatherapy_blend"
        completionMsg="ESSENCE PERFECTED"
        completionXP={15}
      />
      <ChamberMiniGame
        open={essenceOpen}
        onClose={() => setEssenceOpen(false)}
        mode="collect"
        color="#FCD34D"
        title="CATCH THE DRIFTING ESSENCES"
        verb="ESSENCE"
        icon={Sparkles}
        targetCount={8}
        zone="aromatherapy_essence"
        completionMsg="VIAL FULL"
        completionXP={12}
      />

      <InteractiveModule
        title="Sacred Aromatherapy"
        subtitle="Essential Oil Wisdom"
        icon={Droplets}
        color={ACCENT}
        category="aromatherapy"
        holographic={false}
        items={oils}
        filters={[
          { key: 'all', label: 'All', count: oils.length },
          ...elements.map(e => ({ key: e, label: e, count: oils.filter(o => o.element === e).length })),
        ]}
        filterFn={(item, filter) => item.element === filter}
      />
    </HolographicChamber>
  );
}
