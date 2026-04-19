import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Zap, Sparkles, Loader2, Clock, BarChart3, ChevronDown, Play, BookOpen, Lightbulb, Heart } from 'lucide-react';
import NarrationPlayer from '../components/NarrationPlayer';
import DeepDive from '../components/DeepDive';
import GuidedExperience from '../components/GuidedExperience';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Exercises() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('exercises', 8); }, []);

  const [exercises, setExercises] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [showVideo, setShowVideo] = useState({});
  const [aiGuides, setAiGuides] = useState({});
  const [aiLoading, setAiLoading] = useState(null);

  useEffect(() => {
    axios.get(`${API}/exercises`)
      .then(res => setExercises(res.data))
      .catch(() => toast.error('Could not load exercises'));
  }, []);

  const filtered = filter === 'all' ? exercises : exercises.filter(e => e.category === filter);

  const getAIGuide = async (ex) => {
    if (aiGuides[ex.id]) return;
    setAiLoading(ex.id);
    try {
      const res = await axios.post(`${API}/exercises/ai-guide`, { topic: ex.name }, { timeout: 60000 });
      setAiGuides(prev => ({ ...prev, [ex.id]: res.data.guide }));
    } catch {
      toast.error('Could not generate guide');
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-40 px-5" style={{ background: 'transparent' }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#FCD34D' }}>
            <Zap size={14} className="inline mr-2" />
            Energy Practices
          </p>
          <h1 className="text-3xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Qigong & Tai Chi
          </h1>
          <p className="text-base mb-12" style={{ color: 'var(--text-secondary)' }}>
            Ancient movement arts for cultivating life force energy and harmonizing body, mind, and spirit.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-10">
          {[{ k: 'all', l: 'All Practices' }, { k: 'qigong', l: 'Qigong' }, { k: 'tai_chi', l: 'Tai Chi' }].map(f => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              className="px-5 py-2 rounded-full text-sm"
              style={{
                background: filter === f.k ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: `1px solid ${filter === f.k ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.06)'}`,
                color: filter === f.k ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
              data-testid={`exercise-filter-${f.k}`}
            >
              {f.l}
            </button>
          ))}
        </div>

        {/* Exercise Cards */}
        <div className="space-y-8">
          {filtered.map((ex, i) => {
            const isOpen = expandedId === ex.id;
            const videoOn = showVideo[ex.id];
            const guide = aiGuides[ex.id];

            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="overflow-hidden"
                data-testid={`exercise-${ex.id}`}
              >
                {/* Header */}
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: ex.color }} />
                        <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: ex.color }}>
                          {ex.category === 'qigong' ? 'Qigong' : 'Tai Chi'}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Clock size={10} /> {ex.duration}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <BarChart3 size={10} /> {ex.level}
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                        {ex.name}
                      </h2>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                    {ex.description}
                  </p>

                  {/* Philosophy quote */}
                  {ex.philosophy && (
                    <div className="mb-5 pl-4" style={{ borderLeft: `2px solid ${ex.color}40` }}>
                      <p className="text-xs italic leading-relaxed" style={{ color: `${ex.color}CC` }}>
                        <BookOpen size={11} className="inline mr-2" />
                        {ex.philosophy}
                      </p>
                    </div>
                  )}

                  {/* Benefits */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {ex.benefits.map(b => (
                      <span key={b} className="text-xs px-3 py-1.5 rounded-full"
                        style={{ background: `${ex.color}10`, color: ex.color, border: `1px solid ${ex.color}18` }}>
                        <Heart size={9} className="inline mr-1" />{b}
                      </span>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {ex.video_url && (
                      <button
                        onClick={() => setShowVideo(v => ({ ...v, [ex.id]: !v[ex.id] }))}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm"
                        style={{
                          background: videoOn ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${videoOn ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
                          color: videoOn ? '#EF4444' : 'var(--text-secondary)',
                        }}
                        data-testid={`exercise-video-${ex.id}`}
                      >
                        <Play size={13} />
                        {videoOn ? 'Hide Video' : 'Watch Video'}
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(isOpen ? null : ex.id)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm"
                      style={{
                        background: isOpen ? `${ex.color}12` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isOpen ? `${ex.color}25` : 'rgba(255,255,255,0.08)'}`,
                        color: isOpen ? ex.color : 'var(--text-secondary)',
                      }}
                      data-testid={`exercise-expand-${ex.id}`}
                    >
                      <Lightbulb size={13} />
                      {isOpen ? 'Hide Steps' : 'Detailed Steps'}
                      <ChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    <NarrationPlayer
                      text={`${ex.name}. ${ex.description}. ${ex.philosophy || ''} Let us begin the practice. ${ex.steps.join('. ')}. ${ex.tips || ''} Well done. Feel the energy flowing through your body.`}
                      label="Quick Narration"
                      color={ex.color}
                      context="yoga"
                    />
                    <GuidedExperience
                      practiceName={ex.name}
                      description={ex.description}
                      instructions={ex.steps}
                      category="exercise"
                      color={ex.color}
                      durationMinutes={parseInt(ex.duration) || 8}
                    />
                    <DeepDive topic={ex.name} category="exercise" color={ex.color} label="Deep Dive" />
                  </div>
                </div>

                {/* Video Embed */}
                <AnimatePresence>
                  {videoOn && ex.video_url && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-6">
                        <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%', background: 'transparent' }}>
                          <iframe
                            src={ex.video_url}
                            title={ex.name}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ border: 'none' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expandable Detailed Steps */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] mb-5 mt-6" style={{ color: 'var(--text-muted)' }}>
                          Step-by-Step Instructions
                        </p>
                        <div className="space-y-4 mb-8">
                          {ex.steps.map((step, si) => (
                            <div key={si} className="flex items-start gap-4 p-4 rounded-xl"
                              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: `${ex.color}12`, color: ex.color, fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${ex.color}20` }}>
                                {si + 1}
                              </div>
                              <p className="text-sm leading-relaxed pt-1.5" style={{ color: 'var(--text-secondary)' }}>{step}</p>
                            </div>
                          ))}
                        </div>

                        {/* Tips */}
                        {ex.tips && (
                          <div className="p-4 rounded-xl mb-8" style={{ background: 'rgba(252,211,77,0.04)', border: '1px solid rgba(252,211,77,0.12)' }}>
                            <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2" style={{ color: '#FCD34D' }}>
                              <Lightbulb size={11} className="inline mr-2" /> Practice Tip
                            </p>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{ex.tips}</p>
                          </div>
                        )}

                        {/* AI Guide */}
                        <div className="flex items-center gap-3 mb-4">
                          <button
                            onClick={() => getAIGuide(ex)}
                            disabled={aiLoading === ex.id || !!guide}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm"
                            style={{
                              background: guide ? 'rgba(252,211,77,0.08)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${guide ? 'rgba(252,211,77,0.2)' : 'rgba(255,255,255,0.08)'}`,
                              color: guide ? '#FCD34D' : 'var(--text-secondary)',
                              opacity: aiLoading === ex.id ? 0.6 : 1,
                            }}
                            data-testid="exercise-ai-guide-btn"
                          >
                            {aiLoading === ex.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            {aiLoading === ex.id ? 'Generating...' : guide ? 'AI Guide Ready' : 'Get Personalized AI Guide'}
                          </button>
                        </div>

                        {guide && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="rounded-xl p-6"
                            style={{ background: 'rgba(252,211,77,0.03)', border: '1px solid rgba(252,211,77,0.1)' }}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: '#FCD34D' }}>
                                <Sparkles size={12} className="inline mr-2" /> AI Practice Guide
                              </p>
                              <NarrationPlayer text={guide} label="Listen" color="#FCD34D" context="yoga" />
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }} data-testid="exercise-ai-guide-text">
                              {guide}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
