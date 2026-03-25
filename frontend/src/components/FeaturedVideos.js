import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Play, X, Clock, ChevronRight } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function FeaturedVideos({ category, color = '#2DD4BF', title = 'Related Videos' }) {
  const [videos, setVideos] = useState([]);
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    axios.get(`${API}/videos`).then(r => {
      const filtered = r.data.filter(v => v.category === category || (v.tags && v.tags.includes(category)));
      setVideos(filtered);
    }).catch(() => {});
  }, [category]);

  if (videos.length === 0) return null;

  return (
    <div className="mt-12" data-testid={`featured-videos-${category}`}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color }}>
        <Play size={12} className="inline mr-2" />
        {title}
      </p>

      <AnimatePresence>
        {playing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass-card overflow-hidden mb-6">
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color }}>Now Playing</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{playing.title}</p>
              </div>
              <button onClick={() => setPlaying(null)} className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }} data-testid="featured-video-close">
                <X size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="relative w-full" style={{ paddingBottom: '56.25%', background: '#000' }}>
              <iframe src={`${playing.video_url}?autoplay=1`} title={playing.title}
                className="absolute inset-0 w-full h-full" style={{ border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
        {videos.map(v => (
          <div key={v.id} onClick={() => setPlaying(v)}
            className="flex-shrink-0 w-64 glass-card overflow-hidden cursor-pointer group"
            style={{ borderColor: playing?.id === v.id ? `${color}40` : undefined }}
            data-testid={`featured-video-${v.id}`}>
            <div className="relative h-36 overflow-hidden">
              <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105"
                style={{ filter: 'brightness(0.65)', transition: 'transform 0.4s' }} loading="lazy" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110"
                  style={{ background: 'rgba(0,0,0,0.5)', border: `1.5px solid ${color}80`, transition: 'transform 0.3s' }}>
                  <Play size={18} fill="white" style={{ color: 'white', marginLeft: '2px' }} />
                </div>
              </div>
              <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(8px)' }}>
                <Clock size={9} className="inline mr-1" />{v.duration}
              </span>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium mb-1 truncate" style={{ color: 'var(--text-primary)' }}>{v.title}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{v.instructor}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
