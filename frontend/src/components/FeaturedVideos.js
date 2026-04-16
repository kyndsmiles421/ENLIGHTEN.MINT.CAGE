import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Play, X, Clock } from 'lucide-react';

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
    <div className="mt-12" style={{ position: 'relative', zIndex: 15 }} data-testid={`featured-videos-${category}`}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color }}>
        <Play size={12} className="inline mr-2" />
        {title}
      </p>

      {/* Video Player — opens above everything when a video is tapped */}
      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'relative',
              zIndex: 50,
              marginBottom: '24px',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#000',
              border: `1px solid ${color}30`,
              boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 20px ${color}15`,
            }}
            data-testid="featured-video-player"
          >
            <div className="flex items-center justify-between p-3" style={{ background: 'rgba(0,0,0,0)', borderBottom: `1px solid ${color}20` }}>
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color }}>{title}</p>
                <p className="text-sm font-medium text-white/90">{playing.title}</p>
              </div>
              <button onClick={() => setPlaying(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}
                data-testid="featured-video-close">
                <X size={16} style={{ color: '#EF4444' }} />
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000' }}>
              <iframe
                src={`${playing.video_url}?autoplay=1&rel=0&modestbranding=1`}
                title={playing.title}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Cards — scrollable horizontal strip */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
        {videos.map(v => (
          <button key={v.id} onClick={() => setPlaying(v)}
            className="flex-shrink-0 w-64 text-left rounded-2xl overflow-hidden cursor-pointer group active:scale-[0.97] transition-transform"
            style={{
              background: 'rgba(0,0,0,0)',
              border: `1px solid ${playing?.id === v.id ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
            data-testid={`featured-video-${v.id}`}>
            <div className="relative h-36 overflow-hidden">
              <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105"
                style={{ transition: 'transform 0.4s' }} loading="lazy" />
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110"
                  style={{ background: `${color}30`, border: `2px solid ${color}80`, transition: 'transform 0.3s', backdropFilter: 'blur(8px)' }}>
                  <Play size={20} fill="white" style={{ color: 'white', marginLeft: '2px' }} />
                </div>
              </div>
              <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}>
                <Clock size={9} className="inline mr-1" />{v.duration}
              </span>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium mb-1 truncate text-white/85">{v.title}</p>
              <p className="text-xs truncate text-white/40">{v.instructor}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
