import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trash2, RotateCcw, Save, X, Share2 } from 'lucide-react';
import axios from 'axios';
import { generateShareCard, downloadShareCard } from './ShareCardService';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * AtmosphereJournal — Collectible gallery of saved Sage FX moods.
 * Decoupled module. Accepts `onApply` to push filters back to the mixer.
 */

function AtmosphereCard({ atm, onApply, onDelete, accent }) {
  const [sharing, setSharing] = useState(false);
  const f = atm.filters || {};
  const filterCSS = `blur(${f.blur || 0}px) brightness(${(f.brightness || 100) / 100}) contrast(${(f.contrast || 100) / 100}) hue-rotate(${f.hueRotate || 0}deg) saturate(${(f.saturate || 100) / 100}) sepia(${(f.sepia || 0) / 100})`;
  const ts = atm.created_at ? new Date(atm.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      className="relative group rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      data-testid={`atm-card-${atm.id}`}
    >
      {/* Filter preview thumbnail */}
      <div className="h-20 relative" style={{ filter: filterCSS }}>
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(59,130,246,0.2) 50%, rgba(34,197,94,0.15) 100%)`,
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 40% 40%, rgba(255,255,255,0.08) 0%, transparent 60%)',
        }} />
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-[11px] font-medium truncate" style={{ color: 'rgba(248,250,252,0.75)', fontFamily: 'Cormorant Garamond, serif' }}>
          {atm.name}
        </p>
        <p className="text-[8px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {atm.source_prompt || 'Manual'} &middot; {ts}
        </p>
      </div>

      {/* Hover actions */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(0,0,0,0.7)' }}>
        <button onClick={() => onApply(atm)}
          className="p-2 rounded-lg active:scale-90 transition-all"
          style={{ background: `${accent}20`, border: `1px solid ${accent}40` }}
          data-testid={`atm-apply-${atm.id}`}>
          <RotateCcw size={14} style={{ color: accent }} />
        </button>
        <button onClick={async () => {
          setSharing(true);
          try {
            const dataUrl = await generateShareCard(atm);
            downloadShareCard(dataUrl, atm.name);
          } catch {}
          setSharing(false);
        }}
          className="p-2 rounded-lg active:scale-90 transition-all"
          style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}
          data-testid={`atm-share-${atm.id}`}>
          <Share2 size={14} style={{ color: sharing ? '#93C5FD' : '#3B82F6' }} />
        </button>
        <button onClick={() => onDelete(atm.id)}
          className="p-2 rounded-lg active:scale-90 transition-all"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
          data-testid={`atm-delete-${atm.id}`}>
          <Trash2 size={14} style={{ color: '#EF4444' }} />
        </button>
      </div>
    </motion.div>
  );
}

export function AtmosphereJournal({ isOpen, onClose, onApply, accent = '#FB923C' }) {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('zen_token');
      if (token && token !== 'guest_token') {
        const res = await axios.get(`${API}/atmosphere/gallery`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGallery(res.data?.gallery || []);
      } else {
        const local = JSON.parse(localStorage.getItem('sage_fx_gallery') || '[]');
        setGallery(local);
      }
    } catch {
      const local = JSON.parse(localStorage.getItem('sage_fx_gallery') || '[]');
      setGallery(local);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchGallery();
  }, [isOpen, fetchGallery]);

  const handleDelete = useCallback(async (atmId) => {
    try {
      const token = localStorage.getItem('zen_token');
      if (token && token !== 'guest_token') {
        await axios.delete(`${API}/atmosphere/${atmId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        const local = JSON.parse(localStorage.getItem('sage_fx_gallery') || '[]');
        localStorage.setItem('sage_fx_gallery', JSON.stringify(local.filter(a => a.id !== atmId)));
      }
      setGallery(prev => prev.filter(a => a.id !== atmId));
    } catch {}
  }, []);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="space-y-2"
      data-testid="atmosphere-journal"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <BookOpen size={11} style={{ color: accent }} />
          <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: `${accent}99` }}>
            Atmosphere Journal
          </span>
          <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
            {gallery.length} saved
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded active:scale-90" data-testid="atm-journal-close">
          <X size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
        </button>
      </div>

      {loading ? (
        <p className="text-[9px] text-center py-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Loading...</p>
      ) : gallery.length === 0 ? (
        <p className="text-[9px] text-center py-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
          No atmospheres saved yet. Use Sage Prompt-to-FX and tap Save.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          <AnimatePresence>
            {gallery.map(atm => (
              <AtmosphereCard key={atm.id} atm={atm} onApply={onApply} onDelete={handleDelete} accent={accent} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

/**
 * saveAtmosphere — Save a mood snapshot to the journal.
 * Authenticated users persist to MongoDB; guests use localStorage.
 */
export async function saveAtmosphere(name, filters, sourcePrompt) {
  const token = localStorage.getItem('zen_token');

  // Always save to localStorage as fallback
  const localEntry = {
    id: `atm_${Date.now().toString(36)}`,
    name,
    filters: { ...filters },
    source_prompt: sourcePrompt || 'Manual Adjustment',
    created_at: new Date().toISOString(),
  };
  const local = JSON.parse(localStorage.getItem('sage_fx_gallery') || '[]');
  local.unshift(localEntry);
  if (local.length > 50) local.length = 50;
  localStorage.setItem('sage_fx_gallery', JSON.stringify(local));

  // Also persist to backend for authenticated users
  if (token && token !== 'guest_token') {
    try {
      const res = await axios.post(`${API}/atmosphere/save`, {
        name,
        filters,
        source_prompt: sourcePrompt,
      }, { headers: { Authorization: `Bearer ${token}` } });
      return res.data?.atmosphere || localEntry;
    } catch {
      return localEntry;
    }
  }
  return localEntry;
}
