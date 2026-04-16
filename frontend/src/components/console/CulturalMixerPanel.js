/**
 * CulturalMixerPanel.js — Sovereign Cultural Frequency Layer
 * 
 * Allows users to build frequency stacks from 10 traditions.
 * Layer 1 (Grounding): Low-frequency drums/drones (Lakota, Aboriginal, Yoruba)
 * Layer 2 (Spirit): Melodic instruments (Sufi ney, Celtic harp, Vedic tanpura)
 * Layer 3 (Earth): Environmental/ambient (Mayan ocarina, Taoist guqin, Egyptian sistrum)
 * 
 * Each layer can be mixed independently. The Monitor shows the active stack.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Music, Globe, Volume2, VolumeX, Compass } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

// Layer categories — what role each sound plays in the stack
const LAYER_ROLES = {
  grounding: { label: 'Grounding', desc: 'Low-frequency drums & drones', color: '#EF4444', icon: '1' },
  spirit: { label: 'Spirit', desc: 'Melodic instruments & chants', color: '#8B5CF6', icon: '2' },
  earth: { label: 'Earth', desc: 'Ambient & environmental tones', color: '#22C55E', icon: '3' },
};

// Map mixer tags to layers
const TAG_TO_LAYER = {
  // Grounding (drums, bass, drones)
  lakota_drum: 'grounding', heartbeat_60bpm: 'grounding',
  djembe_polyrhythm: 'grounding', bata_orisha: 'grounding', dundun_talking: 'grounding',
  didgeridoo_drone: 'grounding', clapstick_rhythm: 'grounding',
  bodhran_pulse: 'grounding', temple_drum_72: 'grounding',
  tun_drum: 'grounding', turtle_percussion: 'grounding',
  // Spirit (melody, voice, chant)
  plains_flute: 'spirit', ney_flute: 'spirit', sufi_daf: 'spirit',
  qawwali_vocal: 'spirit', dhikr_chant: 'spirit', whirling_rhythm: 'spirit',
  celtic_harp: 'spirit', uilleann_drone: 'spirit', tin_whistle: 'spirit',
  niggun_chant: 'spirit', shofar_blast: 'spirit', hebrew_prayer: 'spirit',
  vedic_chant: 'spirit', om_drone_136hz: 'spirit', singing_bowl: 'spirit',
  songline_vocal: 'spirit', african_chant: 'spirit', mayan_chant: 'spirit',
  gaelic_chant: 'spirit', taoist_chant: 'spirit',
  // Earth (ambient, environmental, meditative)
  tanpura_drone: 'earth', tabla_taal: 'earth',
  guqin_meditation: 'earth', temple_bell: 'earth', wooden_fish: 'earth',
  erhu_melody: 'earth', sistrum_rattle: 'earth', nile_harp: 'earth',
  pyramid_drone: 'earth', conch_call: 'earth', ocarina_flute: 'earth',
  earth_resonance: 'earth', shekere_rattle: 'earth',
  kabbalistic_drone: 'earth',
};

export default function CulturalMixerPanel() {
  const [traditions, setTraditions] = useState(null);
  const [activeLayers, setActiveLayers] = useState({
    grounding: null,
    spirit: null,
    earth: null,
  });
  const [layerVolumes, setLayerVolumes] = useState({ grounding: 70, spirit: 50, earth: 40 });
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch mixer tags from all traditions
  useEffect(() => {
    fetch(`${API}/api/omni-bridge/mixer-tags`)
      .then(r => r.json())
      .then(data => {
        setTraditions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Set a layer's active tag
  const setLayer = useCallback((layer, tag, traditionName) => {
    setActiveLayers(prev => ({
      ...prev,
      [layer]: prev[layer]?.tag === tag ? null : { tag, tradition: traditionName },
    }));
  }, []);

  // Get all tags for a specific layer role
  const getTagsForLayer = useCallback((layerRole) => {
    if (!traditions) return [];
    const result = [];
    for (const [tid, data] of Object.entries(traditions)) {
      for (const tag of data.tags) {
        if (TAG_TO_LAYER[tag] === layerRole) {
          result.push({ tag, tradition: tid, traditionName: data.name, tempo: data.tempo_bpm });
        }
      }
    }
    return result;
  }, [traditions]);

  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  if (loading) return <div className="p-3 text-center text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading traditions...</div>;

  return (
    <div className="p-2" data-testid="cultural-mixer-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <Globe size={10} style={{ color: '#D946EF' }} />
          <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#D946EF' }}>
            Cultural Frequency Stack
          </span>
        </div>
        <span className="text-[7px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {activeCount}/3 layers
        </span>
      </div>

      {/* Three Layer Strips */}
      {Object.entries(LAYER_ROLES).map(([layerKey, role]) => {
        const active = activeLayers[layerKey];
        const tags = getTagsForLayer(layerKey);
        const isExpanded = expanded === layerKey;

        return (
          <div key={layerKey} className="mb-1.5" data-testid={`mixer-layer-${layerKey}`}>
            {/* Layer strip */}
            <button
              onClick={() => setExpanded(isExpanded ? null : layerKey)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg"
              style={{
                background: active ? `${role.color}08` : 'rgba(255,255,255,0.015)',
                border: `1px solid ${active ? `${role.color}20` : 'rgba(255,255,255,0.04)'}`,
              }}
            >
              <div className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold"
                style={{ background: `${role.color}15`, color: role.color }}>
                {role.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="text-[8px] font-bold" style={{ color: active ? role.color : 'rgba(255,255,255,0.5)' }}>
                  {role.label}
                </div>
                <div className="text-[7px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {active ? `${active.tradition} — ${active.tag.replace(/_/g, ' ')}` : role.desc}
                </div>
              </div>
              {/* Volume slider */}
              <input
                type="range" min="0" max="100"
                value={layerVolumes[layerKey]}
                onChange={(e) => {
                  e.stopPropagation();
                  setLayerVolumes(prev => ({ ...prev, [layerKey]: Number(e.target.value) }));
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-14 h-1 rounded-full cursor-pointer"
                style={{ accentColor: role.color }}
                data-testid={`layer-vol-${layerKey}`}
              />
              <span className="text-[7px] font-mono w-6 text-right" style={{ color: `${role.color}80` }}>
                {layerVolumes[layerKey]}
              </span>
            </button>

            {/* Expanded tag picker */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-1 px-1 py-1.5">
                    {tags.map(t => (
                      <button
                        key={t.tag}
                        onClick={() => setLayer(layerKey, t.tag, t.traditionName)}
                        className="px-2 py-1 rounded-full text-[7px]"
                        style={{
                          background: active?.tag === t.tag ? `${role.color}20` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${active?.tag === t.tag ? `${role.color}40` : 'rgba(255,255,255,0.06)'}`,
                          color: active?.tag === t.tag ? role.color : 'rgba(255,255,255,0.45)',
                        }}
                        data-testid={`tag-${t.tag}`}
                      >
                        {t.tag.replace(/_/g, ' ')}
                        <span className="ml-1 opacity-50">({t.traditionName.split('/')[0].trim().split(' ')[0]})</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Active Stack Display */}
      {activeCount > 0 && (
        <div className="mt-2 px-1 py-1.5 rounded-lg" style={{ background: 'rgba(217,70,239,0.03)', border: '1px solid rgba(217,70,239,0.06)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color: '#D946EF' }}>Active Stack</span>
            <button onClick={() => setActiveLayers({ grounding: null, spirit: null, earth: null })}
              className="text-[7px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Clear</button>
          </div>
          <div className="flex gap-1 mt-1">
            {Object.entries(activeLayers).filter(([, v]) => v).map(([k, v]) => (
              <span key={k} className="text-[7px] px-1.5 py-0.5 rounded-full"
                style={{ background: `${LAYER_ROLES[k].color}10`, color: LAYER_ROLES[k].color, border: `1px solid ${LAYER_ROLES[k].color}20` }}>
                {v.tag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
