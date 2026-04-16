import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Image, X, Eye, Sparkles, Loader2, Layers, Upload, Trash2, Plus } from 'lucide-react';
import { VIRTUAL_BACKGROUNDS, BLUR_LEVELS } from '../hooks/useVirtualBackground';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CATEGORIES = ['Sacred Sites', 'Nature', 'Cosmic', 'My Backgrounds'];

export default function BackgroundPicker({ isOpen, onClose, onSelect, currentBg, isLoading }) {
  const { authHeaders } = useAuth();
  const [activeCategory, setActiveCategory] = useState('Sacred Sites');
  const [myBackgrounds, setMyBackgrounds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const filteredBgs = activeCategory === 'My Backgrounds'
    ? myBackgrounds.map(bg => ({ ...bg, url: `${process.env.REACT_APP_BACKEND_URL}${bg.url}`, category: 'My Backgrounds' }))
    : VIRTUAL_BACKGROUNDS.filter(bg => bg.category === activeCategory);

  useEffect(() => {
    if (isOpen && authHeaders) {
      axios.get(`${API}/backgrounds/my`, { headers: authHeaders })
        .then(r => setMyBackgrounds(r.data.backgrounds || []))
        .catch(() => {});
    }
  }, [isOpen, authHeaders]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const r = await axios.post(`${API}/backgrounds/upload`, formData, {
        headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' },
      });
      setMyBackgrounds(prev => [{ id: r.data.id, url: r.data.url, name: r.data.name }, ...prev]);
      setActiveCategory('My Backgrounds');
    } catch { }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (bgId) => {
    try {
      await axios.delete(`${API}/backgrounds/${bgId}`, { headers: authHeaders });
      setMyBackgrounds(prev => prev.filter(b => b.id !== bgId));
    } catch { }
  };

  if (!isOpen) return null;

  const modal = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center"
        style={{ background: 'transparent', backdropFilter: 'none'}}
        onClick={onClose}
        data-testid="bg-picker-overlay">
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-xl mx-4 mb-4 md:mb-0 rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(16,18,34,0.98)',
            border: '1px solid rgba(248,250,252,0.06)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
            maxHeight: '80vh',
          }}
          data-testid="bg-picker-modal">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
            <div className="flex items-center gap-2">
              <Layers size={16} style={{ color: '#C084FC' }} />
              <h3 className="text-sm font-medium" style={{ color: '#F8FAFC' }}>Virtual Background</h3>
              {(isLoading || uploading) && <Loader2 size={12} className="animate-spin" style={{ color: '#C084FC' }} />}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium hover:scale-105 transition-all"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}
                data-testid="bg-upload-btn">
                <Upload size={10} /> Upload
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5" data-testid="bg-picker-close">
                <X size={14} style={{ color: 'rgba(255,255,255,0.75)' }} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-5 py-3 flex items-center gap-2 flex-wrap" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
            <button
              onClick={() => onSelect(null)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-105"
              style={{
                background: !currentBg ? 'rgba(239,68,68,0.12)' : 'rgba(248,250,252,0.03)',
                border: `1px solid ${!currentBg ? 'rgba(239,68,68,0.2)' : 'rgba(248,250,252,0.06)'}`,
                color: !currentBg ? '#EF4444' : 'var(--text-muted)',
              }}
              data-testid="bg-none">
              None
            </button>
            {BLUR_LEVELS.map(blur => (
              <button key={blur.id}
                onClick={() => onSelect({ type: 'blur', id: blur.id, value: blur.value })}
                className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:scale-105"
                style={{
                  background: currentBg?.id === blur.id ? 'rgba(59,130,246,0.12)' : 'rgba(248,250,252,0.03)',
                  border: `1px solid ${currentBg?.id === blur.id ? 'rgba(59,130,246,0.2)' : 'rgba(248,250,252,0.06)'}`,
                  color: currentBg?.id === blur.id ? '#3B82F6' : 'var(--text-muted)',
                }}
                data-testid={`bg-blur-${blur.id}`}>
                <Eye size={9} className="inline mr-1" /> {blur.name}
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="px-5 pt-3 flex items-center gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                style={{
                  background: activeCategory === cat ? 'rgba(192,132,252,0.1)' : 'transparent',
                  border: `1px solid ${activeCategory === cat ? 'rgba(192,132,252,0.2)' : 'transparent'}`,
                  color: activeCategory === cat ? '#C084FC' : 'var(--text-muted)',
                }}
                data-testid={`bg-cat-${cat.replace(/\s/g, '-')}`}>
                {cat === 'My Backgrounds' ? `My (${myBackgrounds.length})` : cat}
              </button>
            ))}
          </div>

          {/* Background Grid */}
          <div className="px-5 py-3 grid grid-cols-3 gap-2 overflow-y-auto" style={{ maxHeight: '45vh' }}>
            {activeCategory === 'My Backgrounds' && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                onClick={() => fileInputRef.current?.click()}
                className="relative rounded-xl overflow-hidden aspect-video flex items-center justify-center"
                style={{ background: 'rgba(248,250,252,0.02)', border: '2px dashed rgba(248,250,252,0.1)' }}
                data-testid="bg-upload-tile">
                <div className="text-center">
                  <Plus size={20} style={{ color: 'var(--text-muted)', margin: '0 auto 4px' }} />
                  <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Upload</p>
                </div>
              </motion.button>
            )}
            {filteredBgs.map(bg => (
              <motion.button key={bg.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect({ type: 'image', id: bg.id, url: bg.url })}
                className="relative rounded-xl overflow-hidden aspect-video group"
                style={{
                  border: currentBg?.id === bg.id
                    ? '2px solid rgba(192,132,252,0.5)'
                    : '2px solid rgba(248,250,252,0.06)',
                  boxShadow: currentBg?.id === bg.id ? '0 0 15px rgba(192,132,252,0.2)' : 'none',
                }}
                data-testid={`bg-${bg.id}`}>
                <img src={bg.url} alt={bg.name}
                  className="w-full h-full object-cover"
                  loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                  <p className="text-[8px] font-medium text-white truncate">{bg.name}</p>
                  {activeCategory === 'My Backgrounds' && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(bg.id); }}
                      className="p-1 rounded hover:bg-red-500/20" data-testid={`bg-delete-${bg.id}`}>
                      <Trash2 size={8} style={{ color: '#EF4444' }} />
                    </button>
                  )}
                </div>
                {currentBg?.id === bg.id && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(192,132,252,0.9)' }}>
                    <Sparkles size={10} style={{ color: '#FFF' }} />
                  </div>
                )}
              </motion.button>
            ))}
            {activeCategory === 'My Backgrounds' && myBackgrounds.length === 0 && (
              <div className="col-span-2 flex items-center justify-center py-8">
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Upload your sacred spaces, gardens, or personal retreats</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="px-5 py-2.5" style={{ borderTop: '1px solid rgba(248,250,252,0.04)' }}>
            <p className="text-[9px] text-center" style={{ color: 'var(--text-muted)' }}>
              Virtual backgrounds use AI-powered body segmentation for a natural look
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
