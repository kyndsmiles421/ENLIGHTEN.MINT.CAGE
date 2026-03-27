import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Globe, BookOpen, Volume2, VolumeX, Loader2, Pause, Play, Sparkles, Star, MapPin, Clock, ChevronRight, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const REGION_ICONS = {
  'Africa': '🌍', 'Americas': '🌎', 'Asia': '🌏', 'Europe': '🏰', 'Oceania': '🌊', 'Arctic & Middle East': '❄️'
};

function StoryNarrator({ storyId, color, storyTitle }) {
  const [state, setState] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [waveData, setWaveData] = useState(new Array(20).fill(0.3));
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const play = async () => {
    if (state === 'paused' && audioRef.current) {
      audioRef.current.play();
      setState('playing');
      return;
    }
    setState('loading');
    try {
      const res = await axios.post(`${API}/creation-stories/${storyId}/narrate`);
      const audio = new Audio(`data:audio/mp3;base64,${res.data.audio}`);
      audioRef.current = audio;

      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const source = actx.createMediaElementSource(audio);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser).connect(actx.destination);
      analyserRef.current = analyser;

      audio.onended = () => { setState('idle'); setProgress(0); };
      audio.ontimeupdate = () => { if (audio.duration) setProgress(audio.currentTime / audio.duration); };
      audio.play();
      setState('playing');

      const updateWave = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const bars = [];
        const step = Math.floor(data.length / 20);
        for (let i = 0; i < 20; i++) bars.push((data[i * step] || 0) / 255);
        setWaveData(bars);
        animFrameRef.current = requestAnimationFrame(updateWave);
      };
      updateWave();
    } catch {
      toast.error('Failed to generate narration');
      setState('idle');
    }
  };

  const pause = () => {
    if (audioRef.current) audioRef.current.pause();
    setState('paused');
  };

  const stop = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setState('idle');
    setProgress(0);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  useEffect(() => () => { stop(); }, []);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: `${color}06`, border: `1px solid ${color}12` }}
      data-testid={`narrator-${storyId}`}>
      {(state === 'playing' || state === 'paused') && (
        <div className="flex items-end justify-center gap-[2px] h-8 px-3 pt-2">
          {waveData.map((v, i) => (
            <motion.div key={i}
              animate={{ height: state === 'playing' ? `${Math.max(8, v * 100)}%` : '20%' }}
              transition={{ duration: 0.1 }}
              className="w-[3px] rounded-full"
              style={{ background: `${color}${state === 'playing' ? '80' : '30'}`, minHeight: 3 }}
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-2">
        {state === 'idle' ? (
          <button onClick={play} data-testid={`play-story-${storyId}`}
            className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Volume2 size={10} />
            </div>
            Listen to Story
          </button>
        ) : state === 'loading' ? (
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
            <Loader2 size={12} className="animate-spin" style={{ color }} />
            Channeling the ancient voices...
          </div>
        ) : (
          <>
            <button onClick={state === 'playing' ? pause : play}
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              {state === 'playing' ? <Pause size={10} style={{ color }} /> : <Play size={10} style={{ color }} />}
            </button>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${color}10` }}>
              <motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.2 }} />
            </div>
            <button onClick={stop} className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: 'rgba(248,250,252,0.3)' }}>
              <VolumeX size={10} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function StoryCard({ story, onSelect, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onSelect(story)}
      data-testid={`story-card-${story.id}`}
      className="rounded-2xl p-5 cursor-pointer group transition-all"
      style={{
        background: 'rgba(15,17,28,0.5)',
        border: `1px solid rgba(248,250,252,0.04)`,
        backdropFilter: 'blur(8px)',
      }}
      whileHover={{ y: -2, borderColor: `${story.color}25` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${story.color}10`, border: `1px solid ${story.color}15` }}>
            <Globe size={18} style={{ color: story.color }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>{story.culture}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(248,250,252,0.3)' }}>
                <MapPin size={8} /> {story.region}
              </span>
              <span className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(248,250,252,0.2)' }}>
                <Clock size={8} /> {story.era}
              </span>
            </div>
          </div>
        </div>
        <ChevronRight size={14} style={{ color: 'rgba(248,250,252,0.15)' }} className="group-hover:translate-x-0.5 transition-transform" />
      </div>

      <p className="text-xs font-medium mb-2" style={{ color: story.color, fontFamily: 'Cormorant Garamond, serif', fontSize: '14px' }}>
        {story.title}
      </p>

      <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'rgba(248,250,252,0.35)' }}>
        {story.story_preview}
      </p>

      <div className="flex items-center gap-2 mb-2">
        <Star size={9} style={{ color: story.color }} />
        <span className="text-[10px]" style={{ color: 'rgba(248,250,252,0.25)' }}>Deity: {story.deity}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {story.symbols?.slice(0, 3).map((s, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full text-[9px]"
            style={{ background: `${story.color}08`, border: `1px solid ${story.color}10`, color: `${story.color}90` }}>
            {s}
          </span>
        ))}
        {story.symbols?.length > 3 && (
          <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ color: 'rgba(248,250,252,0.2)' }}>
            +{story.symbols.length - 3}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function CreationStories() {
  const { token, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [regions, setRegions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [fullStory, setFullStory] = useState(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [activeRegion, setActiveRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios.get(`${API}/creation-stories`).then(r => {
      setStories(r.data.stories || []);
      setRegions(r.data.regions || {});
    }).catch(() => toast.error('Failed to load creation stories'))
      .finally(() => setLoading(false));
  }, []);

  const selectStory = useCallback(async (story) => {
    setSelected(story);
    setStoryLoading(true);
    try {
      const r = await axios.get(`${API}/creation-stories/${story.id}`);
      setFullStory(r.data);
    } catch {
      toast.error('Failed to load story');
    }
    setStoryLoading(false);
  }, []);

  const filtered = stories.filter(s => {
    if (activeRegion !== 'all') {
      const regionIds = regions[activeRegion] || [];
      if (!regionIds.includes(s.id)) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.culture.toLowerCase().includes(q) || s.title.toLowerCase().includes(q) || s.deity.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen pt-20 pb-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors"
              data-testid="back-btn">
              <ArrowLeft size={18} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
                Creation Stories
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Origin myths from {stories.length} world civilizations
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(192,132,252,0.05)', border: '1px solid rgba(192,132,252,0.1)' }}>
            <Sparkles size={12} style={{ color: '#C084FC' }} />
            <span className="text-[10px]" style={{ color: '#C084FC' }}>Each story includes voice narration</span>
          </div>
        </div>

        {/* Search + Region Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(248,250,252,0.2)' }} />
            <input
              type="text"
              placeholder="Search cultures, deities, stories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              data-testid="story-search"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs"
              style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(248,250,252,0.06)', color: '#F8FAFC', outline: 'none' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={12} style={{ color: 'rgba(248,250,252,0.3)' }} />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => setActiveRegion('all')}
              data-testid="region-all"
              className="flex-shrink-0 px-3 py-2 rounded-xl text-[10px] font-medium transition-all"
              style={{
                background: activeRegion === 'all' ? 'rgba(192,132,252,0.12)' : 'rgba(15,17,28,0.6)',
                border: `1px solid ${activeRegion === 'all' ? 'rgba(192,132,252,0.25)' : 'rgba(248,250,252,0.04)'}`,
                color: activeRegion === 'all' ? '#C084FC' : 'rgba(248,250,252,0.4)',
              }}>
              All Regions
            </button>
            {Object.keys(regions).map(region => (
              <button key={region} onClick={() => setActiveRegion(region)}
                data-testid={`region-${region.toLowerCase().replace(/[^a-z]/g, '-')}`}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-[10px] font-medium transition-all whitespace-nowrap"
                style={{
                  background: activeRegion === region ? 'rgba(192,132,252,0.12)' : 'rgba(15,17,28,0.6)',
                  border: `1px solid ${activeRegion === region ? 'rgba(192,132,252,0.25)' : 'rgba(248,250,252,0.04)'}`,
                  color: activeRegion === region ? '#C084FC' : 'rgba(248,250,252,0.4)',
                }}>
                {REGION_ICONS[region] || ''} {region}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin mr-3" size={20} style={{ color: '#C084FC' }} />
            <span className="text-sm" style={{ color: 'rgba(248,250,252,0.4)' }}>Loading creation stories from across the world...</span>
          </div>
        )}

        {/* Story grid + Detail view */}
        <div className="flex gap-6">
          {/* Grid */}
          <div className={`${selected ? 'hidden lg:block lg:w-1/2' : 'w-full'} transition-all`}>
            {!loading && filtered.length === 0 && (
              <div className="text-center py-16">
                <Globe size={28} className="mx-auto mb-3" style={{ color: 'rgba(248,250,252,0.15)' }} />
                <p className="text-sm" style={{ color: 'rgba(248,250,252,0.3)' }}>No stories match your search</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((story, i) => (
                <StoryCard key={story.id} story={story} onSelect={selectStory} index={i} />
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full lg:w-1/2 lg:sticky lg:top-24 lg:max-h-[80vh] lg:overflow-y-auto"
                data-testid="story-detail-panel"
              >
                <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(15,17,28,0.6)', border: `1px solid ${selected.color}15`, backdropFilter: 'blur(12px)' }}>
                  {/* Story header */}
                  <div className="p-6 pb-4" style={{ background: `linear-gradient(180deg, ${selected.color}08 0%, transparent 100%)` }}>
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={() => { setSelected(null); setFullStory(null); }}
                        data-testid="close-story-detail"
                        className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg lg:hidden"
                        style={{ background: 'rgba(248,250,252,0.04)', color: 'rgba(248,250,252,0.4)' }}>
                        <ArrowLeft size={10} /> Back
                      </button>
                      <button onClick={() => { setSelected(null); setFullStory(null); }}
                        data-testid="close-story-x"
                        className="hidden lg:block p-1 rounded hover:bg-white/5">
                        <X size={14} style={{ color: 'rgba(248,250,252,0.3)' }} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${selected.color}12`, border: `1px solid ${selected.color}20` }}>
                        <Globe size={22} style={{ color: selected.color }} />
                      </div>
                      <div>
                        <p className="text-lg font-bold" style={{ color: '#F8FAFC' }}>{selected.culture}</p>
                        <div className="flex items-center gap-3 text-[10px]" style={{ color: 'rgba(248,250,252,0.35)' }}>
                          <span className="flex items-center gap-1"><MapPin size={8} /> {selected.region}</span>
                          <span className="flex items-center gap-1"><Clock size={8} /> {selected.era}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-base font-semibold leading-snug" style={{ color: selected.color, fontFamily: 'Cormorant Garamond, serif', fontSize: '18px' }}>
                      {selected.title}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Star size={10} style={{ color: selected.color }} />
                      <span className="text-[11px]" style={{ color: 'rgba(248,250,252,0.4)' }}>Deity: {selected.deity}</span>
                    </div>
                  </div>

                  {/* Full story body */}
                  <div className="px-6 pb-6">
                    {storyLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin" size={16} style={{ color: selected.color }} />
                      </div>
                    ) : fullStory ? (
                      <>
                        {/* Voice narration */}
                        <div className="mb-4">
                          <StoryNarrator storyId={fullStory.id} color={fullStory.color} storyTitle={fullStory.title} />
                        </div>

                        {/* Story text */}
                        <div className="mb-5">
                          <p className="text-[9px] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"
                            style={{ color: 'rgba(248,250,252,0.25)' }}>
                            <BookOpen size={9} /> The Creation Story
                          </p>
                          {fullStory.story.split('\n\n').map((para, i) => (
                            <p key={i} className="text-[13px] leading-[1.8] mb-3"
                              style={{ color: 'rgba(248,250,252,0.6)', fontFamily: 'Cormorant Garamond, serif' }}>
                              {para}
                            </p>
                          ))}
                        </div>

                        {/* Cosmic lesson */}
                        <div className="rounded-xl p-4 mb-4" style={{ background: `${fullStory.color}06`, border: `1px solid ${fullStory.color}12` }}>
                          <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: fullStory.color }}>
                            Cosmic Lesson
                          </p>
                          <p className="text-sm leading-relaxed italic"
                            style={{ color: 'rgba(248,250,252,0.75)', fontFamily: 'Cormorant Garamond, serif' }}>
                            "{fullStory.lesson}"
                          </p>
                        </div>

                        {/* Symbols */}
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(248,250,252,0.25)' }}>
                            Sacred Symbols
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {fullStory.symbols?.map((s, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-lg text-[10px]"
                                style={{ background: `${fullStory.color}08`, border: `1px solid ${fullStory.color}12`, color: `${fullStory.color}` }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
