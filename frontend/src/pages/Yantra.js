import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Triangle, Eye, Volume2 } from 'lucide-react';
import NarrationPlayer from '../components/NarrationPlayer';
import DeepDive from '../components/DeepDive';
import GuidedExperience from '../components/GuidedExperience';
import FeaturedVideos from '../components/FeaturedVideos';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function YantraVisual({ yantra }) {
  const patterns = {
    'sri-yantra': (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {[0,1,2,3].map(i => <polygon key={`u${i}`} points={`60,${18+i*6} ${28+i*4},${90-i*6} ${92-i*4},${90-i*6}`} fill="none" stroke={yantra.color} strokeWidth="0.6" opacity={0.8-i*0.1}/>)}
        {[0,1,2,3,4].map(i => <polygon key={`d${i}`} points={`60,${102-i*6} ${34+i*3},${34+i*6} ${86-i*3},${34+i*6}`} fill="none" stroke="#FDA4AF" strokeWidth="0.6" opacity={0.8-i*0.1}/>)}
        <circle cx="60" cy="60" r="45" fill="none" stroke={yantra.color} strokeWidth="0.4" opacity="0.3"/>
        <circle cx="60" cy="60" r="2" fill={yantra.color} opacity="0.8"/>
      </svg>
    ),
    'ganesh-yantra': (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <polygon points="60,20 95,85 25,85" fill="none" stroke={yantra.color} strokeWidth="0.8" opacity="0.7"/>
        {[0,1,2,3,4,5].map(i => <ellipse key={i} cx={60+35*Math.cos(i*Math.PI/3)} cy={60+35*Math.sin(i*Math.PI/3)} rx="12" ry="6" transform={`rotate(${i*60},${60+35*Math.cos(i*Math.PI/3)},${60+35*Math.sin(i*Math.PI/3)})`} fill="none" stroke={yantra.color} strokeWidth="0.4" opacity="0.5"/>)}
        <circle cx="60" cy="60" r="3" fill={yantra.color} opacity="0.6"/>
      </svg>
    ),
    'kali-yantra': (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {[0,1,2,3,4].map(i => <polygon key={i} points={`60,${100-i*8} ${30+i*3},${30+i*8} ${90-i*3},${30+i*8}`} fill="none" stroke={yantra.color} strokeWidth="0.5" opacity={0.7-i*0.08}/>)}
        <circle cx="60" cy="60" r="48" fill="none" stroke="#EF4444" strokeWidth="0.5" opacity="0.3" strokeDasharray="3 2"/>
        <circle cx="60" cy="60" r="2" fill={yantra.color} opacity="0.9"/>
      </svg>
    ),
  };
  return patterns[yantra.pattern] || (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <polygon points="60,15 100,80 20,80" fill="none" stroke={yantra.color} strokeWidth="0.8" opacity="0.6"/>
      <polygon points="60,105 20,40 100,40" fill="none" stroke={yantra.color} strokeWidth="0.8" opacity="0.4"/>
      <circle cx="60" cy="60" r="40" fill="none" stroke={yantra.color} strokeWidth="0.4" opacity="0.3"/>
      {[0,1,2,3,4,5,6,7].map(i => <ellipse key={i} cx={60+32*Math.cos(i*Math.PI/4)} cy={60+32*Math.sin(i*Math.PI/4)} rx="10" ry="5" transform={`rotate(${i*45},${60+32*Math.cos(i*Math.PI/4)},${60+32*Math.sin(i*Math.PI/4)})`} fill="none" stroke={yantra.color} strokeWidth="0.3" opacity="0.4"/>)}
      <circle cx="60" cy="60" r="2" fill={yantra.color} opacity="0.8"/>
    </svg>
  );
}

export default function Yantra() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('yantra', 8); }, []);

  const [yantras, setYantras] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/yantras`)
      .then(r => setYantras(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = selected ? yantras.find(y => y.id === selected) : null;

  return (
    <div className="min-h-screen pt-20 pb-40 px-5" style={{ background: 'transparent' }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#EF4444' }}>
            <Triangle size={14} className="inline mr-2" /> Sacred Diagrams
          </p>
          <h1 className="text-3xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Yantras
          </h1>
          <p className="text-base mb-12" style={{ color: 'var(--text-secondary)' }}>
            Sacred geometric diagrams that serve as instruments for meditation, worship, and the manifestation of divine energy.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><p style={{ color: 'var(--text-muted)' }}>Manifesting sacred forms...</p></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Yantra Grid */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Select a Yantra</p>
              {yantras.map(y => (
                <button key={y.id} onClick={() => setSelected(y.id)}
                  className="p-4 w-full text-left flex items-center gap-4"
                  style={{ borderColor: selected === y.id ? `${y.color}30` : 'rgba(255,255,255,0.06)', transition: 'border-color 0.3s' }}
                  data-testid={`yantra-${y.id}`}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `${y.color}10` }}>
                    <div className="w-10 h-10"><YantraVisual yantra={y} /></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: selected === y.id ? y.color : 'var(--text-primary)' }}>{y.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{y.meaning}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {active ? (
                  <motion.div key={active.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-8 md:p-10">
                    <div className="flex flex-col items-center mb-8">
                      <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                        className="w-48 h-48 md:w-64 md:h-64 mb-6" style={{ filter: `drop-shadow(0 0 20px ${active.color}20)` }}>
                        <YantraVisual yantra={active} />
                      </motion.div>
                      <h2 className="text-3xl font-light text-center" style={{ fontFamily: 'Cormorant Garamond, serif', color: active.color }}>
                        {active.name}
                      </h2>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{active.sanskrit}</p>
                      <p className="text-sm mt-1" style={{ color: active.color }}>{active.meaning}</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>Deity</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{active.deity}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>Description</p>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{active.description}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>
                          <Volume2 size={12} className="inline mr-1" /> Mantra
                        </p>
                        <p className="text-lg font-light italic" style={{ fontFamily: 'Cormorant Garamond, serif', color: active.color }}>
                          {active.mantra}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>
                          <Eye size={12} className="inline mr-1" /> Meditation Practice
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{active.meditation}</p>
                        <div className="mt-3">
                          <GuidedExperience
                            practiceName={active.name}
                            description={active.description}
                            instructions={[
                              `Gaze softly at the ${active.name} yantra. Let your eyes relax.`,
                              active.meditation,
                              `Silently repeat the mantra: ${active.mantra}`,
                              `Let the geometric pattern dissolve into pure awareness.`,
                            ]}
                            category="yantra"
                            color={active.color}
                            durationMinutes={8}
                          />
                        </div>
                        <div className="mt-3">
                          <NarrationPlayer
                            text={`${active.name}. ${active.description}. The mantra for this yantra is: ${active.mantra}. Now, let us meditate. ${active.meditation}. Rest in this sacred space as long as you need. ${active.mantra}.`}
                            label="Quick Narration"
                            color={active.color}
                            context="meditation"
                          />
                        </div>
                        <div className="mt-3">
                          <DeepDive topic={active.name} category="yantra" color={active.color} label="AI Deep Dive" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-12 flex flex-col items-center justify-center min-h-[500px] text-center">
                    <div className="w-32 h-32 mb-6 opacity-20">
                      <svg viewBox="0 0 120 120">
                        <polygon points="60,15 100,80 20,80" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                        <polygon points="60,105 20,40 100,40" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                        <circle cx="60" cy="60" r="2" fill="currentColor"/>
                      </svg>
                    </div>
                    <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>
                      Select a yantra to begin your meditation
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
        <FeaturedVideos category="yantra" color="#EF4444" title="Yantra & Sacred Geometry Videos" />
      </div>
    </div>
  );
}