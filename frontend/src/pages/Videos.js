import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Play, Clock, Filter, User, X, Film, Loader2, Globe, Sparkles, Video, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/* ─── Existing Practice Video Categories ─── */
const PRACTICE_CATEGORIES = [
  { id: 'all', label: 'All Videos' },
  { id: 'mudras', label: 'Mudras' },
  { id: 'yantra', label: 'Yantra' },
  { id: 'tantra', label: 'Tantra' },
  { id: 'breathwork', label: 'Breathwork' },
  { id: 'frequencies', label: 'Frequencies' },
  { id: 'mantra', label: 'Mantra' },
  { id: 'exercises', label: 'Exercises' },
];

/* ─── Culture metadata for Video Gallery ─── */
const CULTURE_META = {
  mayan: { name: 'Mayan', region: 'Central America', color: '#22C55E' },
  egyptian: { name: 'Egyptian', region: 'North Africa', color: '#FCD34D' },
  aboriginal: { name: 'Aboriginal', region: 'Australia', color: '#FB923C' },
  lakota: { name: 'Lakota Sioux', region: 'North America', color: '#EF4444' },
  hindu: { name: 'Hindu', region: 'South Asia', color: '#F97316' },
  norse: { name: 'Norse', region: 'Scandinavia', color: '#3B82F6' },
  greek: { name: 'Greek', region: 'Mediterranean', color: '#8B5CF6' },
  japanese: { name: 'Japanese', region: 'East Asia', color: '#EC4899' },
  yoruba: { name: 'Yoruba', region: 'West Africa', color: '#22C55E' },
  maori: { name: 'Maori', region: 'Polynesia', color: '#2DD4BF' },
  chinese: { name: 'Chinese', region: 'East Asia', color: '#EF4444' },
  celtic: { name: 'Celtic', region: 'Western Europe', color: '#22C55E' },
  inuit: { name: 'Inuit', region: 'Arctic', color: '#38BDF8' },
  aztec: { name: 'Aztec', region: 'Mesoamerica', color: '#F97316' },
  sumerian: { name: 'Sumerian', region: 'Mesopotamia', color: '#FCD34D' },
};

/* ─── Cosmic Cinema Card ─── */
function CinemaCard({ storyId, videoInfo, onGenerate, onPlay, generating }) {
  const meta = CULTURE_META[storyId] || { name: storyId, region: '', color: '#D8B4FE' };
  const hasVideo = videoInfo?.has_video && videoInfo?.video_url;
  const isGenerating = generating === storyId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden group relative"
      data-testid={`cinema-card-${storyId}`}
    >
      {/* Visual area */}
      <div className="relative h-44 overflow-hidden" style={{
        background: `linear-gradient(135deg, ${meta.color}08, ${meta.color}03, rgba(15,17,28,0.95))`,
      }}>
        {/* Decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
          style={{ background: `${meta.color}10`, filter: 'blur(40px)' }} />

        {hasVideo ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={() => onPlay(storyId, videoInfo.video_url)}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all group-hover:scale-110 cursor-pointer"
              style={{ background: `${meta.color}20`, border: `2px solid ${meta.color}40`, backdropFilter: 'blur(10px)' }}
              data-testid={`play-cinema-${storyId}`}>
              <Play size={28} fill={meta.color} style={{ color: meta.color, marginLeft: 3 }} />
            </button>
          </div>
        ) : isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}>
              <Film size={28} style={{ color: meta.color }} />
            </motion.div>
            <p className="text-[10px] mt-3" style={{ color: 'rgba(248,250,252,0.4)' }}>Generating with Sora 2...</p>
            <div className="mt-2 w-24 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full" style={{ background: meta.color }}
                animate={{ width: ['0%', '80%'] }} transition={{ duration: 120, ease: 'linear' }} />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2"
              style={{ background: `${meta.color}08`, border: `1px solid ${meta.color}15` }}>
              <Globe size={24} style={{ color: meta.color, opacity: 0.5 }} />
            </div>
            <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.25)' }}>Not generated yet</p>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          {hasVideo ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold"
              style={{ background: `${meta.color}20`, color: meta.color }}>
              <Check size={8} /> SORA 2
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[8px]"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' }}>
              4s clip
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}60` }} />
          <h3 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{meta.name}</h3>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{meta.region} Creation Story</p>

        {hasVideo ? (
          <button onClick={() => onPlay(storyId, videoInfo.video_url)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
            style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}20`, color: meta.color }}
            data-testid={`watch-cinema-${storyId}`}>
            <Play size={13} /> Watch Cinematic
          </button>
        ) : (
          <button onClick={() => onGenerate(storyId)} disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
            style={{
              background: isGenerating ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: isGenerating ? 'var(--text-muted)' : 'var(--text-secondary)',
              opacity: isGenerating ? 0.6 : 1,
            }}
            data-testid={`generate-cinema-${storyId}`}>
            {isGenerating ? <><Loader2 size={13} className="animate-spin" /> Generating...</> : <><Sparkles size={13} /> Generate Video</>}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Video Player Modal ─── */
function VideoPlayerModal({ storyId, videoUrl, onClose }) {
  const meta = CULTURE_META[storyId] || { name: storyId, color: '#D8B4FE' };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="video-player-modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="w-full max-w-4xl relative"
      >
        <button onClick={onClose} className="absolute -top-10 right-0 p-2 rounded-full"
          style={{ color: 'var(--text-muted)' }} data-testid="close-video-modal">
          <X size={20} />
        </button>

        <div className="rounded-2xl overflow-hidden" style={{
          boxShadow: `0 0 80px ${meta.color}15, 0 24px 60px rgba(0,0,0,0.5)`,
          border: `1px solid ${meta.color}15`,
        }}>
          <video
            src={`${process.env.REACT_APP_BACKEND_URL}${videoUrl}`}
            className="w-full"
            style={{ aspectRatio: '16/9', background: '#000' }}
            autoPlay loop controls playsInline
            data-testid="cinema-video-element"
          />
          <div className="p-5" style={{ background: 'rgba(13,14,26,0.95)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: meta.color }}>{meta.name}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{meta.region} Creation Story — AI Cinematic</p>
              </div>
              <span className="text-[8px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${meta.color}15`, color: meta.color }}>
                SORA 2
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Videos Page ─── */
export default function Videos() {
  const { authHeaders } = useAuth();
  const [tab, setTab] = useState('cinema');
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);

  // Cinema state
  const [cinemaStories, setCinemaStories] = useState({});
  const [cinemaLoading, setCinemaLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const [playerModal, setPlayerModal] = useState(null);
  const pollRef = useRef(null);

  // Batch state
  const [batchId, setBatchId] = useState(null);
  const [batchStatus, setBatchStatus] = useState(null);
  const batchPollRef = useRef(null);

  // Load practice videos
  useEffect(() => {
    axios.get(`${API}/videos`)
      .then(r => setVideos(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load cinema stories
  useEffect(() => {
    if (!authHeaders?.Authorization) return;
    setCinemaLoading(true);
    axios.get(`${API}/ai-visuals/video-stories`, { headers: authHeaders })
      .then(r => {
        const map = {};
        r.data.stories.forEach(s => { map[s.story_id] = s; });
        setCinemaStories(map);
      })
      .catch(() => {})
      .finally(() => setCinemaLoading(false));

    return () => clearInterval(pollRef.current);
  }, [authHeaders]);

  const generateVideo = useCallback(async (storyId) => {
    setGeneratingId(storyId);
    try {
      const res = await axios.post(`${API}/ai-visuals/generate-video`, {
        story_id: storyId,
      }, { headers: authHeaders });

      if (res.data.status === 'complete' && res.data.video_url) {
        setCinemaStories(prev => ({ ...prev, [storyId]: { ...prev[storyId], has_video: true, video_url: res.data.video_url } }));
        setGeneratingId(null);
        toast.success(`${CULTURE_META[storyId]?.name || storyId} video ready!`);
        return;
      }

      if (res.data.job_id) {
        pollRef.current = setInterval(async () => {
          try {
            const poll = await axios.get(`${API}/ai-visuals/video-status/${res.data.job_id}`, { headers: authHeaders });
            if (poll.data.status === 'complete' && poll.data.video_url) {
              clearInterval(pollRef.current);
              setCinemaStories(prev => ({ ...prev, [storyId]: { ...prev[storyId], has_video: true, video_url: poll.data.video_url } }));
              setGeneratingId(null);
              toast.success(`${CULTURE_META[storyId]?.name || storyId} video ready!`);
            } else if (poll.data.status === 'failed') {
              clearInterval(pollRef.current);
              setGeneratingId(null);
              toast.error('Video generation failed');
            }
          } catch {}
        }, 5000);
      }
    } catch {
      setGeneratingId(null);
      toast.error('Could not start generation');
    }
  }, [authHeaders]);

  // Batch generation
  const startBatch = useCallback(async () => {
    try {
      const uncachedIds = Object.keys(CULTURE_META).filter(id => !cinemaStories[id]?.has_video);
      if (uncachedIds.length === 0) { toast.success('All videos already generated!'); return; }

      const res = await axios.post(`${API}/ai-visuals/generate-batch`, {
        story_ids: uncachedIds,
      }, { headers: authHeaders });

      if (res.data.batch_id) {
        setBatchId(res.data.batch_id);
        setBatchStatus({ status: 'generating', completed: 0, total: uncachedIds.length, current_story: uncachedIds[0] });
        toast.success(`Batch generation started for ${uncachedIds.length} videos`);

        // Start polling
        batchPollRef.current = setInterval(async () => {
          try {
            const poll = await axios.get(`${API}/ai-visuals/batch-status/${res.data.batch_id}`, { headers: authHeaders });
            setBatchStatus(poll.data);

            // Update completed stories in cinema map
            if (poll.data.completed_ids?.length > 0) {
              const refreshRes = await axios.get(`${API}/ai-visuals/video-stories`, { headers: authHeaders });
              const map = {};
              refreshRes.data.stories.forEach(s => { map[s.story_id] = s; });
              setCinemaStories(map);
            }

            if (poll.data.status === 'complete') {
              clearInterval(batchPollRef.current);
              toast.success(`Batch complete! ${poll.data.completed} videos generated.`);
              setBatchId(null);
            }
          } catch {}
        }, 8000);
      }
    } catch {
      toast.error('Could not start batch generation');
    }
  }, [authHeaders, cinemaStories]);

  useEffect(() => () => clearInterval(batchPollRef.current), []);

  const filtered = filter === 'all' ? videos : videos.filter(v => v.category === filter);
  const generatedCount = Object.values(cinemaStories).filter(s => s.has_video).length;

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#2DD4BF' }}>
            <Play size={14} className="inline mr-2" /> Video Library
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Videos
          </h1>
          <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
            AI-generated cosmic cinematics and guided practice demonstrations.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-8" data-testid="video-tabs">
          <button onClick={() => setTab('cinema')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: tab === 'cinema' ? 'rgba(232,121,249,0.1)' : 'transparent',
              border: `1px solid ${tab === 'cinema' ? 'rgba(232,121,249,0.25)' : 'rgba(255,255,255,0.06)'}`,
              color: tab === 'cinema' ? '#E879F9' : 'var(--text-muted)',
            }}
            data-testid="tab-cinema">
            <Film size={14} /> Cosmic Cinema
            {generatedCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(232,121,249,0.15)', color: '#E879F9' }}>
                {generatedCount}
              </span>
            )}
          </button>
          <button onClick={() => setTab('practice')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: tab === 'practice' ? 'rgba(45,212,191,0.1)' : 'transparent',
              border: `1px solid ${tab === 'practice' ? 'rgba(45,212,191,0.25)' : 'rgba(255,255,255,0.06)'}`,
              color: tab === 'practice' ? '#2DD4BF' : 'var(--text-muted)',
            }}
            data-testid="tab-practice">
            <Play size={14} /> Practice Videos
          </button>
        </div>

        {/* ═══ Cosmic Cinema Tab ═══ */}
        {tab === 'cinema' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-card p-5 mb-8" data-testid="cinema-info-bar">
              <div className="flex items-center gap-4">
                <Film size={20} style={{ color: '#E879F9', flexShrink: 0 }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    AI Cosmic Cinema — Powered by Sora 2
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    4-second cinematic video clips of 15 world creation stories. Each video takes 2-5 minutes to generate and is cached for instant replay.
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#E879F9' }}>
                    {generatedCount}<span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>/15</span>
                  </p>
                  <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>generated</p>
                </div>
                {generatedCount < 15 && !batchId && (
                  <button onClick={startBatch}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02] flex-shrink-0"
                    style={{ background: 'rgba(232,121,249,0.1)', border: '1px solid rgba(232,121,249,0.2)', color: '#E879F9' }}
                    data-testid="generate-all-btn">
                    <Sparkles size={13} /> Generate All
                  </button>
                )}
              </div>

              {/* Batch progress bar */}
              {batchStatus && batchStatus.status === 'generating' && (
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" style={{ color: '#E879F9' }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Generating: <strong style={{ color: '#E879F9' }}>{CULTURE_META[batchStatus.current_story]?.name || batchStatus.current_story}</strong>
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {batchStatus.completed}/{batchStatus.total}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #E879F9, #C084FC)' }}
                      animate={{ width: `${batchStatus.total > 0 ? (batchStatus.completed / batchStatus.total) * 100 : 0}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-[9px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    Each video takes 2-5 minutes. You can leave this page and come back.
                  </p>
                </div>
              )}
            </div>

            {cinemaLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin" size={24} style={{ color: 'var(--text-muted)' }} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Object.keys(CULTURE_META).map((storyId, i) => (
                  <motion.div key={storyId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <CinemaCard
                      storyId={storyId}
                      videoInfo={cinemaStories[storyId]}
                      onGenerate={generateVideo}
                      onPlay={(id, url) => setPlayerModal({ storyId: id, videoUrl: url })}
                      generating={generatingId}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ Practice Videos Tab ═══ */}
        {tab === 'practice' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Filters */}
            <div className="flex gap-2 mb-10 flex-wrap">
              <Filter size={14} style={{ color: 'var(--text-muted)', marginTop: '8px' }} />
              {PRACTICE_CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setFilter(c.id)}
                  className="px-4 py-2 rounded-full text-sm"
                  style={{
                    background: filter === c.id ? 'rgba(45,212,191,0.1)' : 'transparent',
                    border: `1px solid ${filter === c.id ? 'rgba(45,212,191,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    color: filter === c.id ? '#2DD4BF' : 'var(--text-muted)',
                  }}
                  data-testid={`video-filter-${c.id}`}>
                  {c.label}
                </button>
              ))}
            </div>

            {/* Now Playing */}
            <AnimatePresence>
              {playing && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="glass-card overflow-hidden mb-8">
                  <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#2DD4BF' }}>Now Playing</p>
                      <h3 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{playing.title}</h3>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{playing.instructor} &middot; {playing.duration} &middot; {playing.level}</p>
                    </div>
                    <button onClick={() => setPlaying(null)} className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.06)' }} data-testid="video-close-player">
                      <X size={16} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%', background: '#000' }}>
                    <iframe src={`${playing.video_url}?autoplay=1`} title={playing.title}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen style={{ border: 'none' }} />
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{playing.description}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="flex justify-center py-20"><p style={{ color: 'var(--text-muted)' }}>Loading video library...</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((video, i) => (
                  <motion.div key={video.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card overflow-hidden group cursor-pointer"
                    onClick={() => setPlaying(video)}
                    style={{ borderColor: playing?.id === video.id ? 'rgba(45,212,191,0.3)' : undefined }}
                    data-testid={`video-${video.id}`}>
                    <div className="relative h-44 overflow-hidden">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105"
                        style={{ filter: 'brightness(0.7)', transition: 'transform 0.5s' }} loading="lazy" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110"
                          style={{ background: 'rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)', transition: 'transform 0.3s' }}>
                          <Play size={24} fill="white" style={{ color: 'white', marginLeft: '2px' }} />
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        style={{ background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(10px)' }}>
                        <Clock size={10} /> {video.duration}
                      </div>
                      <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs"
                        style={{ background: 'rgba(0,0,0,0.6)', color: '#2DD4BF', backdropFilter: 'blur(10px)' }}>
                        {video.level}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{video.title}</h3>
                      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{video.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User size={12} style={{ color: 'var(--text-muted)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{video.instructor}</span>
                        </div>
                        <div className="flex gap-1.5">
                          {video.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {filtered.length === 0 && !loading && (
              <div className="text-center py-20">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No videos in this category yet.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {playerModal && (
          <VideoPlayerModal
            storyId={playerModal.storyId}
            videoUrl={playerModal.videoUrl}
            onClose={() => setPlayerModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
