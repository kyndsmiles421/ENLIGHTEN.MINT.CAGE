import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, Sparkles, Star, Eye, Loader2, Filter, X, ChevronDown,
  Zap, Heart, Crown, Globe, Diamond, Moon, Sun, Flame, Shield,
  Swords, Brain, User, Share2, ChevronLeft, ChevronRight, Search,
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FORM_LABELS = {
  humanoid: { name: 'Humanoid', color: '#818CF8' },
  ethereal: { name: 'Ethereal', color: '#C084FC' },
  crystalline: { name: 'Crystalline', color: '#A855F7' },
  aquatic: { name: 'Aquatic', color: '#38BDF8' },
  flame_being: { name: 'Flame Being', color: '#F59E0B' },
  void_entity: { name: 'Void Entity', color: '#6366F1' },
  nature_spirit: { name: 'Nature Spirit', color: '#34D399' },
  chimera: { name: 'Cosmic Chimera', color: '#EC4899' },
};

const AURA_LABELS = {
  radiant_gold: { name: 'Radiant Gold', color: '#FCD34D' },
  violet_flame: { name: 'Violet Flame', color: '#A855F7' },
  aurora_borealis: { name: 'Aurora Borealis', color: '#34D399' },
  nebula_cloud: { name: 'Nebula Cloud', color: '#EC4899' },
  electric_plasma: { name: 'Electric Plasma', color: '#38BDF8' },
  shadow_mist: { name: 'Shadow Mist', color: '#6366F1' },
  crystalline_matrix: { name: 'Crystalline Matrix', color: '#F0ABFC' },
  chakra_rainbow: { name: 'Chakra Rainbow', color: '#EF4444' },
};

const TRAIT_CATEGORY_META = {
  base_form: { label: 'Base Form', color: '#818CF8', icon: Globe },
  aura: { label: 'Aura', color: '#C084FC', icon: Sparkles },
  cosmic_features: { label: 'Cosmic Features', color: '#38BDF8', icon: Star },
  markings: { label: 'Markings', color: '#A855F7', icon: Diamond },
  accessories: { label: 'Accessories', color: '#F59E0B', icon: Crown },
  background: { label: 'Background', color: '#34D399', icon: Moon },
};

/* ─── Radiate Button ─── */
function RadiateButton({ count, radiated, onRadiate, disabled }) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.08 }}
      whileTap={disabled ? {} : { scale: 0.92 }}
      onClick={onRadiate}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all"
      style={{
        background: radiated ? 'rgba(252,211,77,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${radiated ? 'rgba(252,211,77,0.25)' : 'rgba(255,255,255,0.08)'}`,
        color: radiated ? '#FCD34D' : 'var(--text-secondary)',
        boxShadow: radiated ? '0 0 16px rgba(252,211,77,0.1)' : 'none',
      }}
      data-testid="radiate-btn">
      <motion.div animate={radiated ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.4 }}>
        <Zap size={12} style={{ color: radiated ? '#FCD34D' : 'var(--text-muted)' }} />
      </motion.div>
      <span>{count}</span>
      <span className="opacity-60">{radiated ? 'Radiated' : 'Radiate'}</span>
    </motion.button>
  );
}

/* ─── Gallery Card ─── */
function GalleryCard({ entry, onClick, onRadiate }) {
  const formMeta = FORM_LABELS[entry.selections?.base_form] || { name: 'Unknown', color: '#9CA3AF' };
  const auraMeta = AURA_LABELS[entry.selections?.aura] || null;
  const glowIntensity = Math.min(0.25, (entry.radiate_count || 0) * 0.02);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="rounded-2xl overflow-hidden cursor-pointer group relative"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: entry.radiate_count > 0 ? `0 0 ${20 + entry.radiate_count * 2}px rgba(252,211,77,${glowIntensity})` : 'none',
      }}
      data-testid={`gallery-card-${entry.id}`}>
      {/* Avatar Image Placeholder */}
      <div className="aspect-square relative overflow-hidden"
        onClick={() => onClick(entry)}
        style={{ background: `linear-gradient(135deg, ${formMeta.color}08, rgba(10,10,20,0.8))` }}>
        {/* Glow overlay from radiations */}
        {entry.radiate_count > 0 && (
          <motion.div
            animate={{ opacity: [glowIntensity * 0.5, glowIntensity, glowIntensity * 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(252,211,77,${glowIntensity}), transparent 70%)` }} />
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: `${formMeta.color}15`, border: `2px solid ${formMeta.color}20` }}>
            <User size={32} style={{ color: formMeta.color, opacity: 0.5 }} />
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'transparent', backdropFilter: 'none'}}>
          <div className="flex items-center gap-2">
            <Eye size={16} style={{ color: '#C084FC' }} />
            <span className="text-xs font-medium" style={{ color: '#C084FC' }}>View Avatar</span>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3">
        <p className="text-xs font-medium mb-0.5 truncate" style={{ color: 'var(--text-primary)' }}>
          {entry.title}
        </p>
        <p className="text-[9px] mb-2 truncate" style={{ color: 'var(--text-muted)' }}>
          by {entry.user_name}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
          <span className="text-[7px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: `${formMeta.color}12`, color: formMeta.color, border: `1px solid ${formMeta.color}15` }}>
            {formMeta.name}
          </span>
          {auraMeta && (
            <span className="text-[7px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: `${auraMeta.color}12`, color: auraMeta.color, border: `1px solid ${auraMeta.color}15` }}>
              {auraMeta.name}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <RadiateButton count={entry.radiate_count || 0} radiated={entry.user_radiated}
            onRadiate={(e) => { e?.stopPropagation?.(); onRadiate(entry.id); }}
            disabled={false} />
          <button onClick={(e) => { e.stopPropagation(); onClick({ ...entry, showTraits: true }); }}
            className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-full transition-all hover:scale-105"
            style={{ background: 'rgba(192,132,252,0.06)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.1)' }}
            data-testid={`view-traits-${entry.id}`}>
            <Eye size={9} /> Traits
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Full Avatar View Modal ─── */
function AvatarViewModal({ entry, onClose, onRadiate, authHeaders }) {
  const [avatarData, setAvatarData] = useState(null);
  const [traits, setTraits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTraits, setShowTraits] = useState(entry?.showTraits || false);

  useEffect(() => {
    if (!entry) return;
    const load = async () => {
      try {
        const [avatarRes, traitsRes] = await Promise.all([
          axios.get(`${API}/starseed/gallery/${entry.id}`, { headers: authHeaders }),
          axios.get(`${API}/starseed/gallery/${entry.id}/traits`, { headers: authHeaders }),
        ]);
        setAvatarData(avatarRes.data.entry);
        setTraits(traitsRes.data.traits);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [entry, authHeaders]);

  if (!entry) return null;

  const formMeta = FORM_LABELS[entry.selections?.base_form] || { name: 'Unknown', color: '#9CA3AF' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative w-full flex flex-col p-4"
      style={{ background: 'transparent', backdropFilter: 'none'}}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="rounded-2xl overflow-hidden max-w-lg w-full max-h-[90vh] overflow-y-auto relative"
        style={{ background: 'rgba(16,14,28,0.97)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 80px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
        data-testid="avatar-view-modal">

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 z-20 p-1.5 rounded-lg transition-all hover:scale-110"
          style={{ background: 'transparent', backdropFilter: 'none'}}>
          <X size={14} style={{ color: 'var(--text-muted)' }} />
        </button>

        {/* Avatar Image */}
        <div className="aspect-square relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${formMeta.color}08, rgba(10,10,20,0.9))` }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin" size={24} style={{ color: '#C084FC' }} />
            </div>
          ) : avatarData?.avatar_base64 ? (
            <motion.img initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              src={`data:image/png;base64,${avatarData.avatar_base64}`}
              alt={entry.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <User size={64} style={{ color: formMeta.color, opacity: 0.2 }} />
            </div>
          )}

          {/* Radiate glow effect */}
          {(avatarData?.radiate_count || entry.radiate_count || 0) > 0 && (
            <motion.div
              animate={{ opacity: [0.05, 0.12, 0.05] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(252,211,77,0.1), transparent 70%)' }} />
          )}
        </div>

        {/* Info Section */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-base font-light mb-0.5" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
                {entry.title}
              </h3>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Created by {entry.user_name}</p>
            </div>
            <RadiateButton
              count={avatarData?.radiate_count ?? entry.radiate_count ?? 0}
              radiated={avatarData?.user_radiated ?? entry.user_radiated}
              onRadiate={() => onRadiate(entry.id)}
              disabled={false} />
          </div>

          {entry.description && (
            <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {entry.description}
            </p>
          )}

          {/* Toggle Traits View */}
          <button onClick={() => setShowTraits(!showTraits)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl mb-3 transition-all hover:scale-[1.01]"
            style={{ background: showTraits ? 'rgba(192,132,252,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${showTraits ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.06)'}` }}
            data-testid="toggle-traits">
            <div className="flex items-center gap-2">
              <Eye size={12} style={{ color: '#C084FC' }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#C084FC' }}>View Build Traits</span>
            </div>
            <ChevronDown size={12} style={{ color: '#C084FC', transform: showTraits ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          <AnimatePresence>
            {showTraits && traits && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden">
                <TraitDisplay selections={traits.selections} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Trait Display (One-Tap Inspiration) ─── */
function TraitDisplay({ selections }) {
  if (!selections) return null;

  const categories = ['base_form', 'aura', 'cosmic_features', 'markings', 'accessories', 'background'];

  return (
    <div className="space-y-2" data-testid="trait-display">
      {categories.map(catId => {
        const meta = TRAIT_CATEGORY_META[catId];
        const sel = selections[catId];
        if (!sel || (Array.isArray(sel) && sel.length === 0)) return null;

        const CatIcon = meta?.icon || Star;
        const values = Array.isArray(sel) ? sel : [sel];

        return (
          <motion.div key={catId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="rounded-lg p-2.5 flex items-start gap-2.5"
            style={{ background: `${meta.color}06`, border: `1px solid ${meta.color}10` }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: `${meta.color}12` }}>
              <CatIcon size={10} style={{ color: meta.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: meta.color }}>
                {meta.label}
              </p>
              <div className="flex flex-wrap gap-1">
                {values.map(v => {
                  const formLabel = FORM_LABELS[v]?.name || AURA_LABELS[v]?.name || v.replace(/_/g, ' ');
                  const formColor = FORM_LABELS[v]?.color || AURA_LABELS[v]?.color || meta.color;
                  return (
                    <span key={v} className="text-[8px] px-1.5 py-0.5 rounded-full capitalize"
                      style={{ background: `${formColor}12`, color: formColor, border: `1px solid ${formColor}15` }}>
                      {formLabel}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Publish Modal ─── */
function PublishModal({ onPublish, onClose, publishing }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative w-full flex flex-col p-4"
      style={{ background: 'transparent', backdropFilter: 'none'}}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl p-6 max-w-sm w-full"
        style={{ background: 'rgba(16,14,28,0.97)', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
          Publish to Gallery
        </h3>
        <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>
          Share your spiritual creation with the cosmic community
        </p>

        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Give your avatar a name..." maxLength={80}
          className="w-full px-3 py-2 rounded-xl text-xs mb-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', outline: 'none' }}
          data-testid="publish-title" />

        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Describe your creation's essence..." maxLength={200} rows={3}
          className="w-full px-3 py-2 rounded-xl text-xs mb-4 resize-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', outline: 'none' }}
          data-testid="publish-description" />

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl text-xs transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
            Cancel
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => onPublish({ title, description })}
            disabled={publishing}
            className="flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
            data-testid="publish-submit">
            {publishing ? <Loader2 size={12} className="animate-spin" /> : <Share2 size={12} />}
            {publishing ? 'Publishing...' : 'Publish'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}


/* ═══════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════ */
export default function AvatarGallery() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('avatar_gallery', 8); }, []);

  const { user, authHeaders, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ base_forms: [], auras: [] });
  const [activeForm, setActiveForm] = useState(null);
  const [activeAura, setActiveAura] = useState(null);
  const [sort, setSort] = useState('popular');
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasAvatar, setHasAvatar] = useState(false);

  const loadGallery = useCallback(async (p = 1) => {
    if (!authHeaders?.Authorization) return;
    setLoading(true);
    try {
      let url = `${API}/starseed/gallery?page=${p}&sort=${sort}`;
      if (activeForm) url += `&base_form=${activeForm}`;
      if (activeAura) url += `&aura=${activeAura}`;
      const res = await axios.get(url, { headers: authHeaders });
      setEntries(res.data.entries);
      setTotal(res.data.total);
      setPage(res.data.page);
      setPages(res.data.pages);
      setFilters(res.data.filters);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, sort, activeForm, activeAura]);

  useEffect(() => {
    loadGallery(1);
  }, [loadGallery]);

  useEffect(() => {
    if (!authHeaders?.Authorization) return;
    axios.get(`${API}/starseed/avatar-builder/my-avatar`, { headers: authHeaders })
      .then(res => setHasAvatar(!!res.data.avatar?.avatar_base64))
      .catch(() => {});
  }, [authHeaders]);

  const handleRadiate = useCallback(async (galleryId) => {
    try {
      const res = await axios.post(`${API}/starseed/gallery/${galleryId}/radiate`, {}, { headers: authHeaders });
      setEntries(prev => prev.map(e =>
        e.id === galleryId ? { ...e, radiate_count: res.data.radiate_count, user_radiated: res.data.user_radiated } : e
      ));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to radiate');
    }
  }, [authHeaders]);

  const handlePublish = useCallback(async ({ title, description }) => {
    setPublishing(true);
    try {
      await axios.post(`${API}/starseed/gallery/publish`, { title, description }, { headers: authHeaders });
      toast.success('Avatar published to the gallery!');
      setShowPublish(false);
      loadGallery(1);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  }, [authHeaders, loadGallery]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={24} style={{ color: '#C084FC' }} />
      </div>
    );
  }

  if (!user) { navigate('/'); return null; }

  const sortOptions = [
    { id: 'popular', label: 'Most Radiated', icon: Zap },
    { id: 'recent', label: 'Most Recent', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(10,10,15,0.88)', backdropFilter: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.04)' }} data-testid="gallery-back">
          <ArrowLeft size={16} style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            Avatar Showcase
          </h1>
          <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {total} Cosmic Creations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-xl transition-all hover:scale-105"
            style={{ background: (activeForm || activeAura) ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${(activeForm || activeAura) ? 'rgba(192,132,252,0.2)' : 'transparent'}` }}
            data-testid="toggle-filters">
            <Filter size={14} style={{ color: (activeForm || activeAura) ? '#C084FC' : 'var(--text-muted)' }} />
          </button>
          {hasAvatar && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowPublish(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-medium"
              style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
              data-testid="publish-btn">
              <Share2 size={11} /> Publish Yours
            </motion.button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4">
        {/* Filter Bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4">
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Base Form Filters */}
                <p className="text-[8px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Base Form</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <button onClick={() => setActiveForm(null)}
                    className="text-[9px] px-2.5 py-1 rounded-full transition-all"
                    style={{ background: !activeForm ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', color: !activeForm ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    All
                  </button>
                  {filters.base_forms.map(f => {
                    const meta = FORM_LABELS[f] || { name: f, color: '#9CA3AF' };
                    const active = activeForm === f;
                    return (
                      <button key={f} onClick={() => setActiveForm(active ? null : f)}
                        className="text-[9px] px-2.5 py-1 rounded-full transition-all capitalize"
                        style={{
                          background: active ? `${meta.color}15` : 'rgba(255,255,255,0.03)',
                          color: active ? meta.color : 'var(--text-muted)',
                          border: `1px solid ${active ? `${meta.color}25` : 'transparent'}`,
                        }}
                        data-testid={`filter-form-${f}`}>
                        {meta.name}
                      </button>
                    );
                  })}
                </div>

                {/* Aura Filters */}
                <p className="text-[8px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Aura</p>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setActiveAura(null)}
                    className="text-[9px] px-2.5 py-1 rounded-full transition-all"
                    style={{ background: !activeAura ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', color: !activeAura ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    All
                  </button>
                  {filters.auras.map(a => {
                    const meta = AURA_LABELS[a] || { name: a, color: '#9CA3AF' };
                    const active = activeAura === a;
                    return (
                      <button key={a} onClick={() => setActiveAura(active ? null : a)}
                        className="text-[9px] px-2.5 py-1 rounded-full transition-all capitalize"
                        style={{
                          background: active ? `${meta.color}15` : 'rgba(255,255,255,0.03)',
                          color: active ? meta.color : 'var(--text-muted)',
                          border: `1px solid ${active ? `${meta.color}25` : 'transparent'}`,
                        }}
                        data-testid={`filter-aura-${a}`}>
                        {meta.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sort Tabs */}
        <div className="flex items-center gap-1.5 mb-5">
          {sortOptions.map(s => {
            const SortIcon = s.icon;
            const active = sort === s.id;
            return (
              <button key={s.id} onClick={() => setSort(s.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background: active ? 'rgba(192,132,252,0.1)' : 'rgba(255,255,255,0.03)',
                  color: active ? '#C084FC' : 'var(--text-muted)',
                  border: `1px solid ${active ? 'rgba(192,132,252,0.15)' : 'transparent'}`,
                }}
                data-testid={`sort-${s.id}`}>
                <SortIcon size={10} /> {s.label}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin" size={24} style={{ color: '#C084FC' }} />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Sparkles size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.2 }} />
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              {(activeForm || activeAura) ? 'No avatars match these filters' : 'The gallery awaits its first creation'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {hasAvatar ? 'Be the first to publish!' : 'Create your avatar first, then share it here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {entries.map((entry, i) => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <GalleryCard entry={entry}
                  onClick={setSelectedEntry}
                  onRadiate={handleRadiate} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => loadGallery(page - 1)} disabled={page <= 1}
              className="p-2 rounded-lg transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.04)', opacity: page <= 1 ? 0.3 : 1 }}>
              <ChevronLeft size={14} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Page {page} of {pages}
            </span>
            <button onClick={() => loadGallery(page + 1)} disabled={page >= pages}
              className="p-2 rounded-lg transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.04)', opacity: page >= pages ? 0.3 : 1 }}>
              <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedEntry && (
          <AvatarViewModal entry={selectedEntry} onClose={() => setSelectedEntry(null)}
            onRadiate={handleRadiate} authHeaders={authHeaders} />
        )}
        {showPublish && (
          <PublishModal onPublish={handlePublish} onClose={() => setShowPublish(false)} publishing={publishing} />
        )}
      </AnimatePresence>
    </div>
  );
}
