/**
 * TradeCircleWidgets.js — Extracted modal/card components from TradeCircle.js
 * Includes: CreateListingModal, OfferModal, ReviewModal, KarmaProfileModal,
 *           ListingCard, ListingDetail, KarmaBadge, TrustScoreBadge, CosmicHandshakeButton
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import {
  X, Send, Check, XCircle, ChevronRight, User,
  ArrowRightLeft, Clock, Tag, Star, Award,
  Handshake, Shield, Package
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  { id: 'all', label: 'All', icon: ArrowRightLeft, color: '#C084FC' },
  { id: 'readings', label: 'Readings', icon: null, color: '#C084FC' },
  { id: 'healing', label: 'Resonance', icon: null, color: '#FDA4AF' },
  { id: 'guidance', label: 'Guidance', icon: null, color: '#2DD4BF' },
  { id: 'meditation', label: 'Meditation', icon: null, color: '#818CF8' },
  { id: 'crafted', label: 'Crafted', icon: null, color: '#FCD34D' },
  { id: 'botanical', label: 'Botanicals', icon: null, color: '#22C55E' },
  { id: 'frequency_recipe', label: 'Recipes', icon: null, color: '#EAB308' },
  { id: 'goods', label: 'Goods', icon: Package, color: '#FB923C' },
  { id: 'services', label: 'Services', icon: null, color: '#2DD4BF' },
];

export function CreateListingModal({ onClose, onCreated, authHeaders }) {
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
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
              data-testid="listing-category-select">
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id} style={{ background: '#1a1a2e' }}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>What I'm Offering</label>
            <input value={form.offering} onChange={e => setForm({ ...form, offering: e.target.value })}
              placeholder="e.g. 30-minute tarot reading"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
              data-testid="listing-offering-input" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>What I'm Seeking</label>
            <input value={form.seeking} onChange={e => setForm({ ...form, seeking: e.target.value })}
              placeholder="Open to offers, or specify..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
              data-testid="listing-seeking-input" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Any extra details..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
              data-testid="listing-desc-input" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'rgba(192,132,252,0.1)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.2)' }}
            data-testid="listing-submit-btn">
            {submitting ? 'Creating...' : 'Post Listing'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function OfferModal({ listing, onClose, authHeaders, onOffered }) {
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

export function KarmaBadge({ points, tier, size = 'sm' }) {
  if (!tier) return null;
  const s = size === 'sm' ? 'text-[8px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1';
  return (
    <span className={`${s} rounded-full inline-flex items-center gap-1`}
      style={{ background: `${tier.color}12`, color: tier.color, border: `1px solid ${tier.color}25` }}
      data-testid="karma-badge">
      <Award size={size === 'sm' ? 8 : 10} /> {tier.name} ({points})
    </span>
  );
}

export function TrustScoreBadge({ userId, authHeaders }) {
  const [trust, setTrust] = useState(null);
  useEffect(() => {
    if (!userId) return;
    axios.get(`${API}/trade-circle/trust-score/${userId}`, { headers: authHeaders })
      .then(r => setTrust(r.data))
      .catch(() => {});
  }, [userId, authHeaders]);

  if (!trust) return null;
  const tier = trust.trust_tier;
  return (
    <span className="text-[8px] px-1.5 py-0.5 rounded-full inline-flex items-center gap-1"
      style={{ background: `${tier.color}12`, color: tier.color, border: `1px solid ${tier.color}25` }}
      data-testid="trust-score-badge"
      title={`Trust: ${trust.trust_score}% — Coherence: ${trust.breakdown.coherence}%, Rating: ${trust.breakdown.rating}%, Volume: ${trust.breakdown.volume}%`}>
      <Shield size={8} /> {tier.name} ({trust.trust_score}%)
    </span>
  );
}

export function CosmicHandshakeButton({ offer, authHeaders, onComplete }) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const handleHandshake = async () => {
    setConfirming(true);
    try {
      const res = await axios.post(`${API}/trade-circle/offers/${offer.id}/handshake`, {}, { headers: authHeaders });
      if (res.data.status === 'completed') {
        toast.success('Cosmic Handshake complete — trade fulfilled!');
        setDone(true);
        onComplete?.();
      } else {
        toast.success('Your confirmation recorded. Waiting for the other party.');
        setDone(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Handshake failed');
    }
    setConfirming(false);
  };

  if (offer.status !== 'accepted') return null;
  if (done) return (
    <span className="text-[9px] px-2 py-1 rounded-lg inline-flex items-center gap-1"
      style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E' }}>
      <Check size={10} /> Confirmed
    </span>
  );

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleHandshake}
      disabled={confirming}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
      style={{
        background: 'linear-gradient(135deg, rgba(192,132,252,0.12), rgba(45,212,191,0.12))',
        color: '#C084FC',
        border: '1px solid rgba(192,132,252,0.2)',
      }}
      data-testid={`handshake-btn-${offer.id}`}
    >
      <Handshake size={12} />
      {confirming ? 'Confirming...' : 'Cosmic Handshake'}
    </motion.button>
  );
}

export function ReviewModal({ offer, onClose, authHeaders, onReviewed }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/trade-circle/reviews`, {
        offer_id: offer.id, rating, comment,
      }, { headers: authHeaders });
      toast.success('Review submitted! +3 karma');
      onReviewed();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
        className="w-full max-w-sm rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(248,250,252,0.06)' }}
        onClick={e => e.stopPropagation()}
        data-testid="review-modal">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Leave a Review</h3>
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Trade: <span style={{ color: '#C084FC' }}>{offer.listing_title}</span>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>Rating</label>
            <div className="flex gap-2 justify-center" data-testid="review-stars">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setRating(s)}
                  className="p-1 transition-transform hover:scale-110"
                  data-testid={`review-star-${s}`}>
                  <Star size={24} fill={s <= rating ? '#EAB308' : 'none'}
                    style={{ color: s <= rating ? '#EAB308' : 'rgba(248,250,252,0.15)' }} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Comment (optional)</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="How was the trade experience?"
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
              data-testid="review-comment-input" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm transition-all"
              style={{ color: 'var(--text-muted)', border: '1px solid rgba(248,250,252,0.06)' }}>Cancel</button>
            <button type="submit" disabled={submitting || rating < 1}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'rgba(234,179,8,0.12)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.2)' }}
              data-testid="review-submit-btn">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function KarmaProfileModal({ userId, onClose, authHeaders }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/trade-circle/karma/${userId}`, { headers: authHeaders })
      .then(r => { setProfile(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId, authHeaders]);

  if (loading || !profile) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm max-h-[70vh] overflow-y-auto rounded-xl"
        style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(248,250,252,0.06)' }}
        onClick={e => e.stopPropagation()}
        data-testid="karma-profile-modal">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Trade Karma</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5"><X size={14} style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center"
              style={{ background: `${profile.tier.color}15`, border: `2px solid ${profile.tier.color}40` }}>
              <Award size={24} style={{ color: profile.tier.color }} />
            </div>
            <p className="text-lg font-light" style={{ color: profile.tier.color, fontFamily: 'Cormorant Garamond, serif' }}>{profile.tier.name}</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{profile.points}</p>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Karma Points</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg p-2" style={{ background: 'rgba(248,250,252,0.02)' }}>
              <p className="text-sm font-medium" style={{ color: '#2DD4BF' }}>{profile.completed_trades}</p>
              <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Trades</p>
            </div>
            <div className="rounded-lg p-2" style={{ background: 'rgba(248,250,252,0.02)' }}>
              <p className="text-sm font-medium" style={{ color: '#EAB308' }}>{profile.avg_rating || '\u2014'}</p>
              <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Rating</p>
            </div>
            <div className="rounded-lg p-2" style={{ background: 'rgba(248,250,252,0.02)' }}>
              <p className="text-sm font-medium" style={{ color: '#C084FC' }}>{profile.review_count}</p>
              <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Reviews</p>
            </div>
          </div>

          {profile.reviews?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Recent Reviews</p>
              <div className="space-y-2">
                {profile.reviews.slice(0, 5).map(r => (
                  <div key={r.id} className="rounded-lg p-2.5" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{r.reviewer_name}</span>
                      <span className="text-[10px] flex items-center gap-0.5" style={{ color: '#EAB308' }}>
                        {Array.from({ length: r.rating }, (_, i) => <Star key={i} size={8} fill="#EAB308" />)}
                      </span>
                    </div>
                    {r.comment && <p className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>"{r.comment}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ListingCard({ listing, onSelect, isOwn }) {
  const catObj = CATEGORIES.find(c => c.id === listing.category);
  const catColor = catObj?.color || '#C084FC';
  const CatIcon = catObj?.icon || Package;

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
        {listing.status === 'in-trade' ? (
          <span className="text-[8px] px-1.5 py-0.5 rounded flex items-center gap-1" style={{ background: 'rgba(192,132,252,0.1)', color: '#C084FC' }}>
            <Handshake size={8} /> Handshake
          </span>
        ) : listing.status === 'traded' ? (
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
        <div className="flex items-center gap-2">
          <span className="text-[8px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Clock size={8} /> {new Date(listing.created_at).toLocaleDateString()}
          </span>
          {listing.gravity_mass && (
            <span className="text-[7px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: `${listing.element_color || catColor}10`, color: listing.element_color || catColor, border: `1px solid ${listing.element_color || catColor}20` }}
              data-testid={`listing-mass-${listing.id}`}>
              m{listing.gravity_mass} {listing.frequency ? `${listing.frequency}Hz` : ''}
            </span>
          )}
        </div>
        <ChevronRight size={12} style={{ color: 'var(--text-muted)' }}
          className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}

export function ListingDetail({ listing, onClose, authHeaders, userId, onRefresh }) {
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
      toast.success(action === 'accept' ? 'Trade accepted \u2014 awaiting Cosmic Handshake!' : 'Offer declined');
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to respond');
    }
  };

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
            <p className="text-[10px] flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              by {listing.user_name} &middot; {listing.category} &middot; {new Date(listing.created_at).toLocaleDateString()}
              {!isOwn && <TrustScoreBadge userId={listing.user_id} authHeaders={authHeaders} />}
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

          {!isOwn && listing.status === 'active' && (
            <button onClick={() => setShowOffer(true)}
              className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' }}
              data-testid="make-offer-btn">
              <Send size={14} /> Make an Offer
            </button>
          )}

          {listing.status === 'in-trade' && (
            <div className="text-center py-3 rounded-lg" style={{ background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.12)' }}>
              <Handshake size={16} className="mx-auto mb-1" style={{ color: '#C084FC' }} />
              <p className="text-xs" style={{ color: '#C084FC' }}>Awaiting Cosmic Handshake \u2014 both parties must confirm</p>
            </div>
          )}

          {listing.status === 'traded' && (
            <div className="text-center py-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
              <Check size={16} className="mx-auto mb-1" style={{ color: '#22C55E' }} />
              <p className="text-xs" style={{ color: '#22C55E' }}>This trade has been completed</p>
            </div>
          )}

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
