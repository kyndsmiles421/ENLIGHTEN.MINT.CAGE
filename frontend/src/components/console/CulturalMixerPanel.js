/**
 * CulturalMixerPanel.js — Sovereign Cultural Frequency Layer
 * 
 * Allows users to build frequency stacks from 10 traditions.
 * Layer 1 (Grounding): Low-frequency drums/drones (Lakota, Aboriginal, Yoruba)
 * Layer 2 (Spirit): Melodic instruments (Sufi ney, Celtic harp, Vedic tanpura)
 * Layer 3 (Earth): Environmental/ambient (Mayan ocarina, Taoist guqin, Egyptian sistrum)
 * 
 * V56.3 — REAL AUDIO. Each layer has its own AudioContext + GainNode.
 * Tapping a pill starts a procedural sound matching the tag profile.
 * Tapping again, or tapping a different pill, swaps cleanly without clicks.
 * The volume slider live-modulates layer gain.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const LAYER_ROLES = {
  grounding: { label: 'Grounding', desc: 'Low-frequency drums & drones', color: '#EF4444', icon: '1' },
  spirit:    { label: 'Spirit',    desc: 'Melodic instruments & chants', color: '#8B5CF6', icon: '2' },
  earth:     { label: 'Earth',     desc: 'Ambient & environmental tones', color: '#22C55E', icon: '3' },
};

// Map tags to layers
const TAG_TO_LAYER = {
  lakota_drum: 'grounding', heartbeat_60bpm: 'grounding',
  djembe_polyrhythm: 'grounding', bata_orisha: 'grounding', dundun_talking: 'grounding',
  didgeridoo_drone: 'grounding', clapstick_rhythm: 'grounding',
  bodhran_pulse: 'grounding', temple_drum_72: 'grounding',
  tun_drum: 'grounding', turtle_percussion: 'grounding',
  plains_flute: 'spirit', ney_flute: 'spirit', sufi_daf: 'spirit',
  qawwali_vocal: 'spirit', dhikr_chant: 'spirit', whirling_rhythm: 'spirit',
  celtic_harp: 'spirit', uilleann_drone: 'spirit', tin_whistle: 'spirit',
  niggun_chant: 'spirit', shofar_blast: 'spirit', hebrew_prayer: 'spirit',
  vedic_chant: 'spirit', om_drone_136hz: 'spirit', singing_bowl: 'spirit',
  songline_vocal: 'spirit', african_chant: 'spirit', mayan_chant: 'spirit',
  gaelic_chant: 'spirit', taoist_chant: 'spirit',
  tanpura_drone: 'earth', tabla_taal: 'earth',
  guqin_meditation: 'earth', temple_bell: 'earth', wooden_fish: 'earth',
  erhu_melody: 'earth', sistrum_rattle: 'earth', nile_harp: 'earth',
  pyramid_drone: 'earth', conch_call: 'earth', ocarina_flute: 'earth',
  earth_resonance: 'earth', shekere_rattle: 'earth',
  kabbalistic_drone: 'earth',
};

/* ── Procedural audio profiles per tag ──
   Each tag picks one of three character classes (drum, chant, drone) plus
   tag-specific tuning. AudioContext lives per layer so volume slider can
   modulate just that one layer's gain in real time. */

function tagProfile(tag) {
  const t = tag.toLowerCase();
  // Drums / percussion: noise burst with bandpass + envelope, looped at tempo
  if (/drum|rattle|percussion|clapstick|bodhran|polyrhythm|orisha|talking|heartbeat|taal|wooden_fish/.test(t)) {
    const bpm = /heartbeat/.test(t) ? 60
              : /temple_drum_72/.test(t) ? 72
              : /clapstick|bodhran|tun_drum|turtle/.test(t) ? 80
              : /djembe|bata|dundun|wooden_fish|shekere|sistrum|tabla|rattle|polyrhythm|orisha|talking/.test(t) ? 96
              : 84;
    const lp = /heartbeat|lakota|temple_drum|tun_drum|bodhran/.test(t) ? 220 : 600;
    const hp = /sistrum|rattle|shekere|tabla/.test(t) ? 1500 : 80;
    return { kind: 'drum', bpm, lp, hp };
  }
  // Chant / vocal / wind instruments: slow oscillator with vibrato + harmonics
  if (/chant|vocal|prayer|niggun|shofar|qawwali|songline|dhikr|hebrew|vedic|gaelic|taoist|mayan_chant|african_chant/.test(t)) {
    const base = /shofar/.test(t) ? 196
               : /vedic|hebrew|niggun/.test(t) ? 220
               : /qawwali|sufi/.test(t) ? 246.94
               : /mayan|songline|gaelic|taoist|african_chant/.test(t) ? 174.61
               : 220;
    return { kind: 'chant', base, harmonics: [1, 1.5, 2], vibrato: 4.5 };
  }
  // Flutes / bells / harps fall under chant-like with brighter harmonics
  if (/flute|harp|bell|whirling|whistle/.test(t)) {
    const base = /whistle/.test(t) ? 587.33
               : /harp/.test(t) ? 392
               : /bell/.test(t) ? 523.25
               : /flute/.test(t) ? 349.23
               : 329.63;
    return { kind: 'chant', base, harmonics: [1, 2, 3], vibrato: 3 };
  }
  // Drones / sustained tones
  const base = /didgeridoo|tibetan|turtle/.test(t) ? 73.42
             : /tanpura|harmonium/.test(t) ? 130.81
             : /pyramid|earth_resonance/.test(t) ? 110
             : /guqin|ocarina|kabbalistic|nile_harp|om_drone/.test(t) ? 136.1
             : /conch/.test(t) ? 98
             : /erhu/.test(t) ? 293.66
             : /singing_bowl/.test(t) ? 261.63
             : 174.61;
  return { kind: 'drone', base, wave: /didgeridoo|tibetan|tanpura|tabla|conch/.test(t) ? 'sawtooth' : 'sine' };
}

function startTag(ctx, masterGain, tag) {
  const prof = tagProfile(tag);
  const nodes = [];

  if (prof.kind === 'drum') {
    const interval = 60.0 / prof.bpm;
    const tick = () => {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
      const src = ctx.createBufferSource(); src.buffer = buf;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = (prof.lp + prof.hp) / 2; bp.Q.value = 1.2;
      const eg = ctx.createGain();
      eg.gain.setValueAtTime(0.7, ctx.currentTime);
      eg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      src.connect(bp); bp.connect(eg); eg.connect(masterGain);
      src.start();
    };
    tick();
    const iv = setInterval(tick, interval * 1000);
    nodes.push({ kind: 'interval', id: iv });
    return nodes;
  }

  if (prof.kind === 'chant') {
    const oscs = prof.harmonics.map((h, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? 'sine' : 'triangle';
      o.frequency.value = prof.base * h;
      const g = ctx.createGain(); g.gain.value = 0.18 / (i + 1);
      // Vibrato
      const lfo = ctx.createOscillator(); lfo.frequency.value = prof.vibrato + i * 0.3;
      const lg = ctx.createGain(); lg.gain.value = 4 * h;
      lfo.connect(lg); lg.connect(o.frequency);
      o.connect(g); g.connect(masterGain);
      o.start(); lfo.start();
      return [o, lfo];
    }).flat();
    return oscs.map(n => ({ kind: 'osc', node: n }));
  }

  // drone
  const o = ctx.createOscillator();
  o.type = prof.wave; o.frequency.value = prof.base;
  const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = prof.base * 4 + 600; filt.Q.value = 4;
  const g = ctx.createGain(); g.gain.value = 0.22;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.6;
  const lg = ctx.createGain(); lg.gain.value = 3;
  lfo.connect(lg); lg.connect(o.frequency);
  o.connect(filt); filt.connect(g); g.connect(masterGain);
  o.start(); lfo.start();
  return [{ kind: 'osc', node: o }, { kind: 'osc', node: lfo }];
}

function stopNodes(nodes) {
  for (const n of nodes) {
    try {
      if (n.kind === 'osc') n.node.stop();
      else if (n.kind === 'interval') clearInterval(n.id);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }
}

export default function CulturalMixerPanel() {
  const [traditions, setTraditions] = useState(null);
  const [activeLayers, setActiveLayers] = useState({ grounding: null, spirit: null, earth: null });
  const [layerVolumes, setLayerVolumes] = useState({ grounding: 70, spirit: 50, earth: 40 });
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  // Per-layer audio context + gain + active sound nodes
  const audioRefs = useRef({
    grounding: { ctx: null, gain: null, nodes: [], tag: null },
    spirit:    { ctx: null, gain: null, nodes: [], tag: null },
    earth:     { ctx: null, gain: null, nodes: [], tag: null },
  });

  useEffect(() => {
    fetch(`${API}/api/omni-bridge/mixer-tags`)
      .then(r => r.json())
      .then(data => { setTraditions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Live volume modulation
  useEffect(() => {
    Object.entries(layerVolumes).forEach(([layer, vol]) => {
      const slot = audioRefs.current[layer];
      if (slot.gain) slot.gain.gain.value = vol / 100;
    });
  }, [layerVolumes]);

  // Stop all audio on unmount
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(slot => {
        stopNodes(slot.nodes);
        try { slot.ctx?.close(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
      });
    };
  }, []);

  const setLayer = useCallback((layer, tag, traditionName) => {
    const slot = audioRefs.current[layer];
    // If tapping the same tag again, stop it
    if (slot.tag === tag) {
      stopNodes(slot.nodes);
      slot.nodes = []; slot.tag = null;
      setActiveLayers(prev => ({ ...prev, [layer]: null }));
      return;
    }
    // Stop any previous sound on this layer
    stopNodes(slot.nodes);
    slot.nodes = []; slot.tag = null;
    // Lazy-create AudioContext on first user interaction
    if (!slot.ctx) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        slot.ctx = new Ctx();
        slot.gain = slot.ctx.createGain();
        slot.gain.gain.value = layerVolumes[layer] / 100;
        slot.gain.connect(slot.ctx.destination);
      } catch (e) {
        console.warn('AudioContext failed:', e);
        return;
      }
    }
    // Resume context (Safari/Android)
    if (slot.ctx.state === 'suspended') slot.ctx.resume().catch(() => {});
    // Start new sound
    try {
      slot.nodes = startTag(slot.ctx, slot.gain, tag);
      slot.tag = tag;
    } catch (e) {
      console.warn('startTag failed:', e);
    }
    setActiveLayers(prev => ({ ...prev, [layer]: { tag, tradition: traditionName } }));
  }, [layerVolumes]);

  const clearAll = useCallback(() => {
    Object.entries(audioRefs.current).forEach(([, slot]) => {
      stopNodes(slot.nodes);
      slot.nodes = []; slot.tag = null;
    });
    setActiveLayers({ grounding: null, spirit: null, earth: null });
  }, []);

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

      {Object.entries(LAYER_ROLES).map(([layerKey, role]) => {
        const active = activeLayers[layerKey];
        const tags = getTagsForLayer(layerKey);
        const isExpanded = expanded === layerKey;

        return (
          <div key={layerKey} className="mb-1.5" data-testid={`mixer-layer-${layerKey}`}>
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

      {activeCount > 0 && (
        <div className="mt-2 px-1 py-1.5 rounded-lg" style={{ background: 'rgba(217,70,239,0.03)', border: '1px solid rgba(217,70,239,0.06)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color: '#D946EF' }}>Active Stack</span>
            <button onClick={clearAll}
              className="text-[7px]" style={{ color: 'rgba(255,255,255,0.3)' }} data-testid="culture-clear-stack">Clear</button>
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
