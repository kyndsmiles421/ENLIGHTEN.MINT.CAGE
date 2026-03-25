import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Play, Clock, Filter, User, X } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  { id: 'all', label: 'All Videos' },
  { id: 'mudras', label: 'Mudras' },
  { id: 'yantra', label: 'Yantra' },
  { id: 'tantra', label: 'Tantra' },
  { id: 'breathwork', label: 'Breathwork' },
  { id: 'frequencies', label: 'Frequencies' },
  { id: 'mantra', label: 'Mantra' },
  { id: 'exercises', label: 'Exercises' },
];

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    axios.get(`${API}/videos`)
      .then(r => setVideos(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? videos : videos.filter(v => v.category === filter);

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#2DD4BF' }}>
            <Play size={14} className="inline mr-2" /> Video Library
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Videos
          </h1>
          <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
            Guided practices, teachings, and demonstrations from master practitioners.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 mb-10 flex-wrap">
          <Filter size={14} style={{ color: 'var(--text-muted)', marginTop: '8px' }} />
          {CATEGORIES.map(c => (
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
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card overflow-hidden mb-8"
            >
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#2DD4BF' }}>Now Playing</p>
                  <h3 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{playing.title}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{playing.instructor} &middot; {playing.duration} &middot; {playing.level}</p>
                </div>
                <button
                  onClick={() => setPlaying(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                  data-testid="video-close-player"
                >
                  <X size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
              <div className="relative w-full" style={{ paddingBottom: '56.25%', background: '#000' }}>
                <iframe
                  src={`${playing.video_url}?autoplay=1`}
                  title={playing.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 'none' }}
                />
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
              <motion.div key={video.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card overflow-hidden group cursor-pointer"
                onClick={() => setPlaying(video)}
                style={{
                  borderColor: playing?.id === video.id ? 'rgba(45,212,191,0.3)' : undefined,
                }}
                data-testid={`video-${video.id}`}>
                {/* Thumbnail */}
                <div className="relative h-44 overflow-hidden">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105"
                    style={{ filter: 'brightness(0.7)', transition: 'transform 0.5s' }}
                    loading="lazy" />
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

                {/* Info */}
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
      </div>
    </div>
  );
}
