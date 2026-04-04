import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Globe, Layers, Radio, X } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LANG_COLORS = {
  sanskrit: '#F59E0B', chinese: '#EF4444', aramaic: '#60A5FA',
  hebrew: '#818CF8', egyptian: '#FBBF24',
};

export function SatelliteInspector({ sat, onClose, authHeaders }) {
  const [archiveData, setArchiveData] = useState(null);
  const [activeTab, setActiveTab] = useState('origin');
  const audioRef = React.useRef(null);

  const Icon = sat.icon;

  useEffect(() => {
    if (!authHeaders) return;
    axios.get(`${API}/archives/entry/${sat.id}`, { headers: authHeaders })
      .then(r => { if (!r.data.error && !r.data.locked) setArchiveData(r.data); })
      .catch(() => {});
    axios.post(`${API}/gravity/interact`, { node_id: sat.id, dwell_seconds: 5 }, { headers: authHeaders }).catch(() => {});
  }, [sat.id, authHeaders]);

  const playHz = useCallback((hz) => {
    try {
      if (!audioRef.current) {
        audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
        // Register globally for EmergencyShutOff
        if (!window.__cosmicAudioContexts) window.__cosmicAudioContexts = [];
        window.__cosmicAudioContexts.push(audioRef.current);
      }
      const ctx = audioRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = hz;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.3);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 2.8);
    } catch {}
  }, []);

  const trinity = archiveData?.trinity;
  const scripts = archiveData?.scripts || {};
  const langKeys = Object.keys(scripts);

  return (
    <motion.div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 50 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      data-testid="satellite-inspector">

      <motion.div className="absolute inset-0" style={{ background: 'rgba(6,6,14,0.85)', backdropFilter: 'blur(12px)' }}
        onClick={onClose} />

      <motion.div className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(10,10,18,0.95)', border: `1px solid ${sat.color}20`, boxShadow: `0 0 60px ${sat.color}10` }}
        initial={{ scale: 0.5, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.3, y: 80 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}>

        {/* Header with orbiting icon */}
        <div className="p-5 flex items-center gap-4">
          <motion.div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `${sat.color}15`, border: `1.5px solid ${sat.color}35`, boxShadow: `0 0 30px ${sat.color}15` }}
            animate={{ boxShadow: [`0 0 20px ${sat.color}10`, `0 0 40px ${sat.color}25`, `0 0 20px ${sat.color}10`] }}
            transition={{ duration: 3, repeat: Infinity }}>
            <Icon size={22} style={{ color: sat.color }} />
          </motion.div>
          <div className="flex-1">
            <h2 className="text-base font-medium" style={{ color: sat.color, fontFamily: 'Cormorant Garamond, serif' }}>
              {sat.label}
            </h2>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(248,250,252,0.35)' }}>{sat.desc}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full" style={{ background: 'rgba(248,250,252,0.05)' }}
            data-testid="inspector-close">
            <X size={14} style={{ color: 'rgba(248,250,252,0.3)' }} />
          </button>
        </div>

        {/* Original scripts preview */}
        {langKeys.length > 0 && (
          <div className="px-5 pb-3 flex items-center gap-3 flex-wrap">
            {langKeys.map(lang => (
              <div key={lang} className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                style={{ background: `${LANG_COLORS[lang] || '#A78BFA'}08`, border: `1px solid ${LANG_COLORS[lang] || '#A78BFA'}15` }}>
                <span className="text-sm" style={{ color: LANG_COLORS[lang] || '#A78BFA', fontFamily: 'serif' }}>
                  {scripts[lang].original}
                </span>
                <span className="text-[8px] font-mono" style={{ color: `${LANG_COLORS[lang] || '#A78BFA'}80` }}>
                  {scripts[lang].transliteration}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Trinity View */}
        {trinity ? (
          <div className="px-5 pb-5">
            <div className="flex gap-1 mb-3">
              {[
                { id: 'origin', icon: Globe, label: 'Origin' },
                { id: 'synthesis', icon: Layers, label: 'Synthesis' },
                { id: 'frequency', icon: Radio, label: 'Frequency' },
              ].map(tab => (
                <button key={tab.id}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-medium tracking-wider uppercase"
                  style={{
                    background: activeTab === tab.id ? `${sat.color}12` : 'rgba(248,250,252,0.03)',
                    color: activeTab === tab.id ? sat.color : 'rgba(248,250,252,0.25)',
                    border: `1px solid ${activeTab === tab.id ? `${sat.color}25` : 'rgba(248,250,252,0.04)'}`,
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`inspect-tab-${tab.id}`}>
                  <tab.icon size={9} /> {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'origin' && (
                <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.6)' }}>
                    {trinity.origin?.text}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(248,250,252,0.04)', color: 'rgba(248,250,252,0.3)' }}>
                      {trinity.origin?.language} &middot; {trinity.origin?.script}
                    </span>
                  </div>
                </motion.div>
              )}
              {activeTab === 'synthesis' && (
                <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.6)' }}>
                    {trinity.synthesis?.text}
                  </p>
                  {trinity.synthesis?.connections?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {trinity.synthesis.connections.map(c => (
                        <span key={c} className="text-[7px] px-1.5 py-0.5 rounded-full"
                          style={{ background: `${sat.color}08`, color: `${sat.color}70`, border: `1px solid ${sat.color}15` }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab === 'frequency' && (
                <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { l: 'Hz', v: trinity.frequency?.hz },
                      { l: 'Solfeggio', v: trinity.frequency?.solfeggio_nearest },
                      { l: 'Chakra', v: trinity.frequency?.chakra },
                      { l: 'Element', v: trinity.frequency?.element },
                    ].map(item => (
                      <div key={item.l} className="p-2 rounded-lg" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.03)' }}>
                        <p className="text-[7px] uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.2)' }}>{item.l}</p>
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(248,250,252,0.5)' }}>{item.v}</p>
                      </div>
                    ))}
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: `${sat.color}10`, border: `1px solid ${sat.color}20` }}
                    onClick={() => playHz(trinity.frequency?.hz)}
                    data-testid="inspect-play-hz">
                    <Volume2 size={10} style={{ color: sat.color }} />
                    <span className="text-[9px] font-medium" style={{ color: sat.color }}>Emit {trinity.frequency?.hz}Hz</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="px-5 pb-5">
            <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
              Navigate to this module to explore its full depth.
            </p>
          </div>
        )}

        {/* Navigate button */}
        <div className="px-5 pb-4">
          <button className="w-full py-2.5 rounded-xl text-[10px] font-medium tracking-wider uppercase"
            style={{ background: `${sat.color}10`, color: sat.color, border: `1px solid ${sat.color}20` }}
            onClick={() => { onClose(); }}
            data-testid="inspect-navigate">
            Tap satellite to enter {sat.label}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
