import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, Plus, Package, Wrench, Search, X, Send,
  Check, XCircle, RefreshCw, Filter, ChevronRight, User,
  ArrowRightLeft, Sparkles, Clock, Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  { id: 'all', label: 'All', icon: ArrowRightLeft, color: '#C084FC' },
  { id: 'goods', label: 'Goods', icon: Package, color: '#2DD4BF' },
  { id: 'services', label: 'Services', icon: Wrench, color: '#FB923C' },
  { id: 'both', label: 'Both', icon: Sparkles, color: '#E879F9' },
];

function CreateListingModal({ onClose, onCreated, authHeaders }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'goods', offering: '', seeking: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.offering.trim()) {
      toast.error('Title and what you\'re offering are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/trade-circle/listings`, form, { headers: authHeaders });
      toast.success('Listing created');
      onCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create listing');
    }
    setSubmitting(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-md rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(248,250,252,0.06)' }}
        onClick={e => e.stopPropagation()}
        data-testid="create-listing-modal">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>New Trade Listing</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5"><X size={14} style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="What's the trade about?"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
              data-testid="listing-title-input" />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Category</label>
            <div className="flex gap-2">
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <button key={c.id} type="button" onClick={() => setForm({ ...form, category: c.id })}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] transition-all"
                  style={{
                    background: form.category === c.id ? `${c.color}12` : 'rgba(248,250,252,0.02)',
                    color: form.category === c.id ? c.color : 'var(--text-muted)',
                    border: `1px solid ${form.category === c.id ? `${c.color}30` : 'rgba(248,250,252,0.06)'}`,
                  }}
                  data-testid={`listing-cat-${c.id}`}>
                  <c.icon size={12} /> {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>What I'm Offering</label>
            <input value={form.offering} onChange={e => setForm({ ...form, offering: e.target.value })}
              placeholder="e.g. Handmade crystal grid, Reiki session..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
              data-testid="listing-offering-input" />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>What I'm Seeking</label>
            <input value={form.seeking} onChange={e => setForm({ ...form, seeking: e.target.value })}
              placeholder="e.g. Tarot reading, Essential oils... (optional)"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
              data-testid="listing-seeking-input" />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Tell people more about what you're trading..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
              data-testid="listing-desc-input" />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'rgba(192,132,252,0.15)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.25)' }}
            data-testid="listing-submit-btn">
            {submitting ? 'Creating...' : 'Post Listing'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function OfferModal({ listing, onClose, authHeaders, onOffered }) {
  const [offerItems, setOfferItems] = useState('');
  const [offerText, setOfferText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offerItems.trim()) { toast.error('Describe what you\'re offering'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/trade-circle/offers`, {
        listing_id: listing.id, offer_items: offerItems, offer_text: offerText,
      }, { headers: authHeaders });
      toast.success('Offer sent!');
      onOffered();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send offer');
    }
    setSubmitting(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
        className="w-full max-w-md rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(248,250,252,0.06)' }}
        onClick={e => e.stopPropagation()}
        data-testid="offer-modal">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Make an Offer</h3>
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            For: <span style={{ color: '#C084FC' }}>{listing.title}</span> — {listing.offering}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>What I'm Offering in Return</label>
            <input value={offerItems} onChange={e => setOfferItems(e.target.value)}
              placeholder="e.g. 3 herb bundles, 1-hour coaching session..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
              data-testid="offer-items-input" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Message (optional)</label>
            <textarea value={offerText} onChange={e => setOfferText(e.target.value)}
              placeholder="Tell the trader a bit about yourself..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
              data-testid="offer-text-input" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm transition-all"
              style={{ color: 'var(--text-muted)', border: '1px solid rgba(248,250,252,0.06)' }}>Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'rgba(45,212,191,0.15)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.25)' }}
              data-testid="offer-submit-btn">
              {submitting ? 'Sending...' : 'Send Offer'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ListingCard({ listing, onSelect, isOwn }) {
  const catColor = CATEGORIES.find(c => c.id === listing.category)?.color || '#C084FC';
  const CatIcon = CATEGORIES.find(c => c.id === listing.category)?.icon || Package;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 cursor-pointer hover:scale-[1.01] transition-transform group"
      onClick={() => onSelect(listing)}
      data-testid={`trade-listing-${listing.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${catColor}10`, border: `1px solid ${catColor}20` }}>
            <CatIcon size={12} style={{ color: catColor }} />
          </div>
          <div>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{listing.title}</h3>
            <p className="text-[9px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <User size={8} /> {listing.user_name}
              {isOwn && <span className="px-1 py-0.5 rounded text-[7px]" style={{ background: 'rgba(192,132,252,0.1)', color: '#C084FC' }}>You</span>}
            </p>
          </div>
        </div>
        {listing.status === 'traded' ? (
          <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>Traded</span>
        ) : listing.offer_count > 0 ? (
          <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(251,146,60,0.1)', color: '#FB923C' }}>
            {listing.offer_count} offer{listing.offer_count > 1 ? 's' : ''}
          </span>
        ) : null}
      </div>

      <div className="space-y-1.5 mb-2">
        <div className="flex items-start gap-2">
          <Tag size={10} className="mt-0.5 flex-shrink-0" style={{ color: '#2DD4BF' }} />
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-medium" style={{ color: '#2DD4BF' }}>Offering:</span> {listing.offering}
          </p>
        </div>
        {listing.seeking && (
          <div className="flex items-start gap-2">
            <ArrowRightLeft size={10} className="mt-0.5 flex-shrink-0" style={{ color: '#E879F9' }} />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium" style={{ color: '#E879F9' }}>Seeking:</span> {listing.seeking}
            </p>
          </div>
        )}
      </div>

      {listing.description && (
        <p className="text-[11px] leading-relaxed mb-2" style={{ color: 'var(--text-muted)' }}>
          {listing.description.length > 100 ? listing.description.slice(0, 100) + '...' : listing.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[8px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <Clock size={8} /> {new Date(listing.created_at).toLocaleDateString()}
        </span>
        <ChevronRight size={12} style={{ color: 'var(--text-muted)' }}
          className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}

function ListingDetail({ listing, onClose, authHeaders, userId, onRefresh }) {
  const [offers, setOffers] = useState([]);
  const [showOffer, setShowOffer] = useState(false);
  const [loading, setLoading] = useState(true);
  const isOwn = listing.user_id === userId;

  useEffect(() => {
    axios.get(`${API}/trade-circle/listings/${listing.id}`, { headers: authHeaders })
      .then(r => { setOffers(r.data.offers); setLoading(false); })
      .catch(() => setLoading(false));
  }, [listing.id, authHeaders]);

  const respondOffer = async (offerId, action) => {
    try {
      await axios.post(`${API}/trade-circle/offers/${offerId}/respond`, { action }, { headers: authHeaders });
      toast.success(action === 'accept' ? 'Trade accepted!' : 'Offer declined');
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to respond');
    }
  };

  const catColor = CATEGORIES.find(c => c.id === listing.category)?.color || '#C084FC';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl"
        style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(248,250,252,0.06)' }}
        onClick={e => e.stopPropagation()}
        data-testid="listing-detail-modal">
        <div className="px-5 py-4 flex items-center justify-between sticky top-0" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid rgba(248,250,252,0.04)', zIndex: 1 }}>
          <div>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{listing.title}</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              by {listing.user_name} &middot; {listing.category} &middot; {new Date(listing.created_at).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5"><X size={14} style={{ color: 'var(--text-muted)' }} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.1)' }}>
              <p className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: '#2DD4BF' }}>Offering</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{listing.offering}</p>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'rgba(232,121,249,0.04)', border: '1px solid rgba(232,121,249,0.1)' }}>
              <p className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: '#E879F9' }}>Seeking</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{listing.seeking || 'Open to offers'}</p>
            </div>
          </div>

          {listing.description && (
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{listing.description}</p>
          )}

          {/* Make offer button */}
          {!isOwn && listing.status === 'active' && (
            <button onClick={() => setShowOffer(true)}
              className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' }}
              data-testid="make-offer-btn">
              <Send size={14} /> Make an Offer
            </button>
          )}

          {listing.status === 'traded' && (
            <div className="text-center py-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
              <Check size={16} className="mx-auto mb-1" style={{ color: '#22C55E' }} />
              <p className="text-xs" style={{ color: '#22C55E' }}>This trade has been completed</p>
            </div>
          )}

          {/* Offers section - visible to listing owner */}
          {isOwn && (
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--text-muted)' }}>
                Offers ({offers.length})
              </p>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(192,132,252,0.2)', borderTopColor: '#C084FC' }} />
                </div>
              ) : offers.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No offers yet</p>
              ) : (
                <div className="space-y-2">
                  {offers.map(o => (
                    <div key={o.id} className="rounded-lg p-3" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}
                      data-testid={`offer-${o.id}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                          <User size={10} /> {o.offerer_name}
                        </p>
                        <span className="text-[8px] px-1.5 py-0.5 rounded capitalize"
                          style={{
                            background: o.status === 'accepted' ? 'rgba(34,197,94,0.1)' : o.status === 'declined' ? 'rgba(239,68,68,0.1)' : 'rgba(251,146,60,0.1)',
                            color: o.status === 'accepted' ? '#22C55E' : o.status === 'declined' ? '#EF4444' : '#FB923C',
                          }}>{o.status}</span>
                      </div>
                      <p className="text-[11px] mb-1" style={{ color: '#2DD4BF' }}>Offers: {o.offer_items}</p>
                      {o.offer_text && <p className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>"{o.offer_text}"</p>}
                      {o.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => respondOffer(o.id, 'accept')}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] transition-all"
                            style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
                            data-testid={`accept-offer-${o.id}`}>
                            <Check size={10} /> Accept
                          </button>
                          <button onClick={() => respondOffer(o.id, 'decline')}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] transition-all"
                            style={{ background: 'rgba(239,68,68,0.05)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.12)' }}
                            data-testid={`decline-offer-${o.id}`}>
                            <XCircle size={10} /> Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showOffer && <OfferModal listing={listing} onClose={() => setShowOffer(false)} authHeaders={authHeaders} onOffered={() => {}} />}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function TradeCircle() {
  const { authHeaders, user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [tab, setTab] = useState('browse');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [myOffers, setMyOffers] = useState({ sent: [], received: [] });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (searchQ) params.set('search', searchQ);
      const [listRes, statsRes] = await Promise.all([
        axios.get(`${API}/trade-circle/listings?${params}`, { headers: authHeaders }),
        axios.get(`${API}/trade-circle/stats`, { headers: authHeaders }),
      ]);
      setListings(listRes.data.listings);
      setStats(statsRes.data);
    } catch {}
    setLoading(false);
  }, [authHeaders, category, searchQ]);

  const fetchMyOffers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/trade-circle/my-offers`, { headers: authHeaders });
      setMyOffers(res.data);
    } catch {}
  }, [authHeaders]);

  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => { if (tab === 'offers') fetchMyOffers(); }, [tab, fetchMyOffers]);

  return (
    <div className="min-h-screen pt-20 pb-24 px-4" style={{ background: 'var(--bg-primary)' }} data-testid="trade-circle-page">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-3 group">
              <ArrowLeft size={14} style={{ color: 'var(--text-muted)' }} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Back</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Trade Circle
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Barter goods and services with the collective</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all hover:scale-105"
            style={{ background: 'rgba(192,132,252,0.1)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.2)' }}
            data-testid="create-listing-btn">
            <Plus size={14} /> New Listing
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Active Listings', value: stats.total_active, color: '#2DD4BF' },
              { label: 'Trades Completed', value: stats.total_traded, color: '#22C55E' },
              { label: 'My Listings', value: stats.my_listings, color: '#C084FC' },
              { label: 'Pending Offers', value: stats.pending_offers, color: '#FB923C' },
            ].map(s => (
              <div key={s.label} className="glass-card p-3 text-center">
                <p className="text-xl font-light" style={{ color: s.color, fontFamily: 'Cormorant Garamond, serif' }}>{s.value}</p>
                <p className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'rgba(248,250,252,0.02)' }}>
          {[
            { id: 'browse', label: 'Browse' },
            { id: 'my', label: 'My Listings' },
            { id: 'offers', label: 'My Offers' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-2 rounded-lg text-xs transition-all"
              style={{
                background: tab === t.id ? 'rgba(192,132,252,0.08)' : 'transparent',
                color: tab === t.id ? '#C084FC' : 'var(--text-muted)',
                border: tab === t.id ? '1px solid rgba(192,132,252,0.15)' : '1px solid transparent',
              }}
              data-testid={`trade-tab-${t.id}`}>
              {t.label}
              {t.id === 'offers' && myOffers.received.filter(o => o.status === 'pending').length > 0 && (
                <span className="ml-1 w-4 h-4 inline-flex items-center justify-center rounded-full text-[8px]"
                  style={{ background: '#FB923C', color: '#fff' }}>
                  {myOffers.received.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        {tab === 'browse' && (
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search trades..."
                className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
                data-testid="trade-search-input" />
            </div>
            <div className="flex gap-1">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  className="px-3 py-2 rounded-lg text-[11px] flex items-center gap-1.5 transition-all"
                  style={{
                    background: category === c.id ? `${c.color}10` : 'transparent',
                    color: category === c.id ? c.color : 'var(--text-muted)',
                    border: `1px solid ${category === c.id ? `${c.color}25` : 'rgba(248,250,252,0.06)'}`,
                  }}
                  data-testid={`trade-filter-${c.id}`}>
                  <c.icon size={11} /> {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(192,132,252,0.2)', borderTopColor: '#C084FC' }} />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Browse Tab */}
            {tab === 'browse' && (
              <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {listings.length === 0 ? (
                  <div className="text-center py-16">
                    <ArrowRightLeft size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>No listings yet</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Be the first to post a trade!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="trade-listings-grid">
                    {listings.map(l => (
                      <ListingCard key={l.id} listing={l} onSelect={setSelectedListing} isOwn={l.user_id === user?.id} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* My Listings Tab */}
            {tab === 'my' && (
              <motion.div key="my" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {listings.filter(l => l.user_id === user?.id).length === 0 ? (
                  <div className="text-center py-16">
                    <Package size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>No listings yet</p>
                    <button onClick={() => setShowCreate(true)}
                      className="text-xs px-4 py-2 rounded-lg"
                      style={{ background: 'rgba(192,132,252,0.1)', color: '#C084FC' }}>
                      Create your first listing
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {listings.filter(l => l.user_id === user?.id).map(l => (
                      <ListingCard key={l.id} listing={l} onSelect={setSelectedListing} isOwn />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Offers Tab */}
            {tab === 'offers' && (
              <motion.div key="offers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Received */}
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--text-muted)' }}>Received Offers</p>
                  {myOffers.received.length === 0 ? (
                    <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>No offers received</p>
                  ) : (
                    <div className="space-y-2">
                      {myOffers.received.map(o => (
                        <div key={o.id} className="glass-card p-3" data-testid={`received-offer-${o.id}`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{o.offerer_name} on <span style={{ color: '#C084FC' }}>{o.listing_title}</span></p>
                            <span className="text-[8px] px-1.5 py-0.5 rounded capitalize"
                              style={{
                                background: o.status === 'accepted' ? 'rgba(34,197,94,0.1)' : o.status === 'declined' ? 'rgba(239,68,68,0.1)' : 'rgba(251,146,60,0.1)',
                                color: o.status === 'accepted' ? '#22C55E' : o.status === 'declined' ? '#EF4444' : '#FB923C',
                              }}>{o.status}</span>
                          </div>
                          <p className="text-[11px]" style={{ color: '#2DD4BF' }}>Offers: {o.offer_items}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sent */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--text-muted)' }}>Sent Offers</p>
                  {myOffers.sent.length === 0 ? (
                    <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>No offers sent</p>
                  ) : (
                    <div className="space-y-2">
                      {myOffers.sent.map(o => (
                        <div key={o.id} className="glass-card p-3" data-testid={`sent-offer-${o.id}`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs" style={{ color: 'var(--text-primary)' }}>You on <span style={{ color: '#C084FC' }}>{o.listing_title}</span></p>
                            <span className="text-[8px] px-1.5 py-0.5 rounded capitalize"
                              style={{
                                background: o.status === 'accepted' ? 'rgba(34,197,94,0.1)' : o.status === 'declined' ? 'rgba(239,68,68,0.1)' : 'rgba(251,146,60,0.1)',
                                color: o.status === 'accepted' ? '#22C55E' : o.status === 'declined' ? '#EF4444' : '#FB923C',
                              }}>{o.status}</span>
                          </div>
                          <p className="text-[11px]" style={{ color: '#2DD4BF' }}>Your offer: {o.offer_items}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && <CreateListingModal onClose={() => setShowCreate(false)} onCreated={() => fetchListings()} authHeaders={authHeaders} />}
        {selectedListing && <ListingDetail listing={selectedListing} onClose={() => setSelectedListing(null)} authHeaders={authHeaders} userId={user?.id} onRefresh={fetchListings} />}
      </AnimatePresence>
    </div>
  );
}
