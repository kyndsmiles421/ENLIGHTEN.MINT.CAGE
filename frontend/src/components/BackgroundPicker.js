import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Image, X, Eye, Sparkles, Loader2, Layers } from 'lucide-react';
import { VIRTUAL_BACKGROUNDS, BLUR_LEVELS } from '../hooks/useVirtualBackground';

const CATEGORIES = ['Sacred Sites', 'Nature', 'Cosmic'];

export default function BackgroundPicker({ isOpen, onClose, onSelect, currentBg, isLoading }) {
  const [activeCategory, setActiveCategory] = useState('Sacred Sites');
  const filteredBgs = VIRTUAL_BACKGROUNDS.filter(bg => bg.category === activeCategory);

  if (!isOpen) return null;

  const modal = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
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
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            maxHeight: '80vh',
          }}
          data-testid="bg-picker-modal">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
            <div className="flex items-center gap-2">
              <Layers size={16} style={{ color: '#C084FC' }} />
              <h3 className="text-sm font-medium" style={{ color: '#F8FAFC' }}>Virtual Background</h3>
              {isLoading && <Loader2 size={12} className="animate-spin" style={{ color: '#C084FC' }} />}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5" data-testid="bg-picker-close">
              <X size={14} style={{ color: 'rgba(248,250,252,0.5)' }} />
            </button>
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
                {cat}
              </button>
            ))}
          </div>

          {/* Background Grid */}
          <div className="px-5 py-3 grid grid-cols-3 gap-2 overflow-y-auto" style={{ maxHeight: '45vh' }}>
            {filteredBgs.map(bg => (
              <motion.button key={bg.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect({ type: 'image', id: bg.id })}
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
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[8px] font-medium text-white truncate">{bg.name}</p>
                </div>
                {currentBg?.id === bg.id && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(192,132,252,0.9)' }}>
                    <Sparkles size={10} style={{ color: '#FFF' }} />
                  </div>
                )}
              </motion.button>
            ))}
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
