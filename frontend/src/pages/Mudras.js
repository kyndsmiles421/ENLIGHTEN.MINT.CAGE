import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Hand, Clock, Sparkles, ChevronDown, ChevronUp, Play, X, Fingerprint, Zap, Heart, Brain, Flame, Wind, Droplets, Globe } from 'lucide-react';
import NarrationPlayer from '../components/NarrationPlayer';
import DeepDive from '../components/DeepDive';
import FeaturedVideos from '../components/FeaturedVideos';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categoryIcons = {
  meditation: Brain,
  healing: Heart,
  energy: Zap,
  devotional: Globe,
};

const categoryLabels = {
  meditation: 'Meditation',
  healing: 'Healing',
  energy: 'Energy',
  devotional: 'Devotional',
};

function MudraCard({ mudra, onSelect, index }) {
  const Icon = categoryIcons[mudra.category] || Hand;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      onClick={() => onSelect(mudra)}
      className="cursor-pointer group"
      data-testid={`mudra-card-${mudra.id}`}
    >
      <div className="relative rounded-2xl overflow-hidden border transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg"
        style={{ borderColor: `${mudra.color}20`, background: 'rgba(255,255,255,0.02)' }}>
        <div className="aspect-square overflow-hidden relative">
          <img
            src={mudra.image_url}
            alt={`${mudra.name} hand position`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0" style={{
            background: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)`
          }} />
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1"
              style={{ background: `${mudra.color}30`, color: mudra.color, border: `1px solid ${mudra.color}30` }}>
              <Icon size={10} /> {categoryLabels[mudra.category]}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-light tracking-wide" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff' }}>
              {mudra.name}
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: mudra.color }}>{mudra.sanskrit}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${mudra.color}20`, color: mudra.color }}>
                {mudra.chakra}
              </span>
              <span className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <Clock size={9} /> {mudra.duration}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MudraDetail({ mudra, onClose }) {
  const [showVideo, setShowVideo] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!mudra) return null;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'practice', label: 'How to Practice' },
    { key: 'video', label: 'Watch Video' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
      data-testid="mudra-detail-overlay"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border"
        style={{ background: 'var(--bg-card, #0a0a14)', borderColor: `${mudra.color}20` }}
        onClick={e => e.stopPropagation()}
        data-testid={`mudra-detail-${mudra.id}`}
      >
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{ background: 'rgba(255,255,255,0.1)' }}
          data-testid="mudra-detail-close">
          <X size={16} style={{ color: '#fff' }} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="relative">
            <div className="aspect-square md:sticky md:top-0">
              {activeTab === 'video' ? (
                <div className="w-full h-full flex items-center justify-center" style={{ background: '#000' }}>
                  <iframe
                    src={mudra.video_url}
                    title={mudra.video_title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    data-testid={`mudra-video-${mudra.id}`}
                  />
                </div>
              ) : (
                <>
                  <img
                    src={mudra.image_url}
                    alt={`${mudra.name} hand position`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{
                    background: `linear-gradient(135deg, transparent 50%, ${mudra.color}15 100%)`
                  }} />
                  <button onClick={() => setActiveTab('video')}
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
                    style={{ background: `${mudra.color}90`, color: '#fff', backdropFilter: 'blur(8px)' }}
                    data-testid={`mudra-play-video-${mudra.id}`}>
                    <Play size={14} fill="#fff" /> Watch Tutorial
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: `${mudra.color}15`, color: mudra.color }}>
                {mudra.chakra} Chakra
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                {mudra.element}
              </span>
            </div>
            <h2 className="text-3xl font-light tracking-tight mt-3" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              {mudra.name}
            </h2>
            <p className="text-sm mt-1" style={{ color: mudra.color }}>{mudra.sanskrit}</p>

            <div className="flex gap-1 mt-5 mb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className="px-3 py-2.5 text-xs font-medium transition-colors relative"
                  style={{ color: activeTab === t.key ? mudra.color : 'var(--text-muted)' }}
                  data-testid={`mudra-tab-${t.key}`}>
                  {t.label}
                  {activeTab === t.key && (
                    <motion.div layoutId="mudra-tab-indicator" className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: mudra.color }} />
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {mudra.description}
                </p>
                <div className="p-4 rounded-xl" style={{ background: `${mudra.color}08`, border: `1px solid ${mudra.color}15` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Fingerprint size={14} style={{ color: mudra.color }} />
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: mudra.color }}>Hand Position</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{mudra.hand_position}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Benefits</p>
                  <div className="grid grid-cols-1 gap-2">
                    {mudra.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: mudra.color }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs pt-2" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1"><Clock size={12} /> {mudra.duration}</span>
                  <span className="flex items-center gap-1"><Wind size={12} /> {mudra.element}</span>
                </div>
              </motion.div>
            )}

            {activeTab === 'practice' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="p-4 rounded-xl" style={{ background: `${mudra.color}08`, border: `1px solid ${mudra.color}15` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Fingerprint size={14} style={{ color: mudra.color }} />
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: mudra.color }}>Quick Position Guide</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{mudra.hand_position}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Detailed Instructions</p>
                  <p className="text-sm leading-[1.8]" style={{ color: 'var(--text-secondary)' }}>
                    {mudra.practice}
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: `${mudra.color}10`, color: mudra.color }}>
                    <Clock size={11} /> Hold for {mudra.duration}
                  </span>
                </div>
                <div className="pt-2">
                  <NarrationPlayer
                    text={`${mudra.name}. ${mudra.description}. Here is how to practice. ${mudra.practice}. Hold this mudra for ${mudra.duration}. The ${mudra.name} activates the ${mudra.chakra} chakra and is associated with the ${mudra.element} element. Benefits include ${mudra.benefits.join(', ')}.`}
                    label="Listen to Voice Guide"
                    color={mudra.color}
                  />
                </div>
                <DeepDive topic={mudra.name} category="mudra" color={mudra.color} label="AI Deep Dive" />
              </motion.div>
            )}

            {activeTab === 'video' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Now Playing</p>
                  <h4 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{mudra.video_title}</h4>
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Watch this guided tutorial to learn the correct hand position and technique for {mudra.name}. Pay attention to the finger placement and pressure described in the video.
                  </p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: `${mudra.color}08`, border: `1px solid ${mudra.color}15` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Fingerprint size={14} style={{ color: mudra.color }} />
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: mudra.color }}>Position Reminder</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{mudra.hand_position}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Mudras() {
  const [mudras, setMudras] = useState([]);
  const [selectedMudra, setSelectedMudra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get(`${API}/mudras`)
      .then(r => setMudras(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedMudra) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedMudra]);

  const categories = ['all', 'meditation', 'healing', 'energy', 'devotional'];
  const filtered = filter === 'all' ? mudras : mudras.filter(m => m.category === filter);

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#D8B4FE' }}>
            <Hand size={14} className="inline mr-2" /> Sacred Hand Gestures
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Mudras
          </h1>
          <p className="text-base mb-8 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            Ancient hand gestures that channel cosmic energy through your body, balancing the five elements within. Tap any mudra to see its hand position, tutorial video, and practice guide.
          </p>
        </motion.div>

        <div className="flex gap-2 mb-10 flex-wrap" data-testid="mudra-category-filters">
          {categories.map(cat => {
            const Icon = cat === 'all' ? Sparkles : categoryIcons[cat];
            return (
              <button key={cat} onClick={() => setFilter(cat)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5"
                style={{
                  background: filter === cat ? '#D8B4FE18' : 'rgba(255,255,255,0.03)',
                  color: filter === cat ? '#D8B4FE' : 'var(--text-muted)',
                  border: `1px solid ${filter === cat ? '#D8B4FE30' : 'rgba(255,255,255,0.06)'}`,
                }}
                data-testid={`mudra-filter-${cat}`}>
                <Icon size={12} />
                {cat === 'all' ? 'All Mudras' : categoryLabels[cat]}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <p style={{ color: 'var(--text-muted)' }}>Loading sacred gestures...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" data-testid="mudra-grid">
              {filtered.map((mudra, i) => (
                <MudraCard key={mudra.id} mudra={mudra} onSelect={setSelectedMudra} index={i} />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No mudras found in this category.</p>
            )}
          </>
        )}

        <AnimatePresence>
          {selectedMudra && (
            <MudraDetail mudra={selectedMudra} onClose={() => setSelectedMudra(null)} />
          )}
        </AnimatePresence>

        <div className="mt-16">
          <FeaturedVideos category="mudras" color="#FDA4AF" title="Mudra Practice Videos" />
        </div>
      </div>
    </div>
  );
}
