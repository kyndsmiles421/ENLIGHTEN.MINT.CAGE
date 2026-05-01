import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Leaf, Flame, FlaskConical } from 'lucide-react';
import InteractiveModule from '../components/InteractiveModule';
import HolographicChamber from '../components/HolographicChamber';
import ChamberProp from '../components/ChamberProp';
import ChamberMiniGame from '../components/games/ChamberMiniGame';
import { commit as busCommit } from '../state/ContextBus';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ACCENT = '#84CC16';

export default function Herbology() {
  const [herbs, setHerbs] = useState([]);
  const [pluckOpen, setPluckOpen] = useState(false);
  const [brewOpen, setBrewOpen] = useState(false);

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('herbology', 8); }, []);

  // V68.62 — Source from the unified Entity Inlay, not the 15-herb silo.
  // The Inlay merges herbology + botany + aromatherapy + sovereign_library
  // tradition mentions into one searchable graph. "Mint" now resolves
  // through the alias map. Falls back to the legacy endpoint if the
  // Inlay isn't reachable so the page never goes blank.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API}/entity/index`);
        if (cancelled) return;
        const nodes = (res.data?.nodes || []).map(n => ({
          // Shape it for InteractiveModule's DiscoveryNode card.
          id:          n.id,
          name:        n.name,
          latin:       n.latin || '',
          color:       n.color || ACCENT,
          type:        n.type,
          traditions:  n.traditions || [],
          sources:     n.sources || [],
          systems:     n.traditions || [],   // filter pivot for tabs
          properties:  [],                   // hydrated on click via /entity/{id}
        }));
        setHerbs(nodes);
      } catch {
        // Fallback to the legacy 15-herb silo so the page never blanks.
        try {
          const res = await axios.get(`${API}/herbology/herbs`);
          if (!cancelled) setHerbs(res.data.herbs || []);
        } catch {
          if (!cancelled) toast.error('Could not load the herb encyclopedia');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // V68.62 — Build dynamic filters from the unified set's traditions
  // so the user can pivot the whole encyclopedia by Vedic / TCM /
  // Lakota / Yoruba / etc. without leaving the page.
  const allTraditions = [...new Set(herbs.flatMap(h => h.traditions || []))];
  const allTypes      = [...new Set(herbs.map(h => h.type).filter(Boolean))];

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
        teach={{
          topic: 'Sacred Herbalism — the ritual of plucking and honoring plant allies',
          category: 'herbology',
          context: 'Weave history, ethics of wildcrafting, and practical identification tips a real user can apply outdoors tomorrow.',
        }}
        nextGame={[
          {
            mode: 'break',
            color: '#C084FC',
            title: 'GRIND HERBS INTO ELIXIR',
            verb: 'GRIND',
            icon: Flame,
            targetCount: 4,
            hitsPerTarget: 4,
            zone: 'herbology_brew',
            completionMsg: 'ELIXIR BREWED',
            completionXP: 14,
            teach: {
              topic: 'Mortar and pestle technique — why grinding releases the plant\u2019s essence',
              category: 'herbology',
              context: 'Cover cellular rupture, volatile oils, and the golden-ratio rhythm that classical herbalists use to avoid oxidation.',
            },
          },
          {
            mode: 'rhythm',
            color: '#FCD34D',
            title: 'DOSE TO THE GOLDEN RATIO',
            verb: 'DOSE',
            icon: FlaskConical,
            targetCount: 5,
            zone: 'herbology_dose',
            completionMsg: 'APOTHECARY MASTERY',
            completionXP: 18,
            teach: {
              topic: 'Dose titration and the apothecary\u2019s principle of minimum effective dose',
              category: 'herbology',
              context: 'Explain bioavailability, contraindications, and how a modern practitioner builds a weekly tincture protocol.',
            },
          },
        ]}
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
        title="The Sovereign Herb Garden"
        subtitle="Sacred Herbology · Unified Inlay"
        icon={Leaf}
        color={ACCENT}
        category="herbology"
        holographic={false}
        items={herbs}
        filters={[
          { key: 'all', label: 'All', count: herbs.length },
          ...allTypes.slice(0, 4).map(t => ({
            key: `type:${t}`,
            label: t === 'oil' ? 'Oils' : t === 'plant' ? 'Plants' : t === 'tradition_plant' ? 'Tradition' : 'Herbs',
            count: herbs.filter(h => h.type === t).length,
          })),
          ...allTraditions.slice(0, 6).map(t => ({
            key: `trad:${t}`,
            label: t.charAt(0).toUpperCase() + t.slice(1),
            count: herbs.filter(h => (h.traditions || []).includes(t)).length,
          })),
        ]}
        filterFn={(item, filter) => {
          if (filter.startsWith('type:')) return item.type === filter.slice(5);
          if (filter.startsWith('trad:')) return (item.traditions || []).includes(filter.slice(5));
          return true;
        }}
        searchFn={(item, q) => {
          const s = q.toLowerCase();
          return (
            item.name?.toLowerCase().includes(s) ||
            item.latin?.toLowerCase().includes(s) ||
            (item.traditions || []).some(t => t.toLowerCase().includes(s)) ||
            (item.properties || []).some(p => p.toLowerCase().includes(s))
          );
        }}
        onItemOpen={async (item) => {
          // V68.62 + V68.65 — Entity Page resolution + Discovery economy.
          // Every opened herb broadcasts its full unified node to the
          // ContextBus so Tarot/Oracle/Story absorb it (V68.61
          // cross-pollination filter). On first-view, the backend
          // credits 6 sparks and we re-fire the surface-area refresh
          // so the Sage Gauge depth ring updates immediately.
          try {
            const token = localStorage.getItem('zen_token');
            const headers = token && token !== 'guest_token'
              ? { Authorization: `Bearer ${token}` } : {};
            const r = await axios.get(`${API}/entity/${item.id}`, { headers });
            const seed = r.data?.context_seed || { activeEntity: item.id, name: item.name };
            busCommit('entityState', seed, { moduleId: 'HERBOLOGY' });
            const discovery = r.data?.discovery;
            if (discovery?.is_first_view) {
              try {
                window.dispatchEvent(new CustomEvent('sovereign:entity-discovery', {
                  detail: {
                    id: item.id,
                    name: item.name,
                    sparks: discovery.sparks_credited || 0,
                  },
                }));
              } catch { /* noop */ }
              if (discovery.sparks_credited) {
                toast.success(`+${discovery.sparks_credited} Sparks \u2014 ${item.name} illuminated`);
              }
            }
          } catch { /* noop */ }
        }}
      />
    </HolographicChamber>
  );
}
