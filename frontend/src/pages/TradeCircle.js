import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, Plus, Package, Wrench, Search, X, Send,
  Check, XCircle, RefreshCw, Filter, ChevronRight, User,
  ArrowRightLeft, Sparkles, Clock, Tag, Star, Award, Trophy, MessageCircle,
  Handshake, Shield, Eye, Heart, Compass, Moon, Gem, Coins, Crown
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CosmicBroker from '../components/trade/CosmicBroker';
import EscrowDashboard from '../components/trade/EscrowDashboard';
import { MantraBanner } from '../components/MantraSystem';
import GameAvatarPanel from '../components/GameAvatar';
import ContentBroker from '../components/trade/ContentBroker';
import CosmicForge from '../components/CosmicForge';
import GodModeDashboard from '../components/GodModeDashboard';
import GenesisMint from '../components/GenesisMint';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  { id: 'all', label: 'All', icon: ArrowRightLeft, color: '#C084FC' },
  { id: 'readings', label: 'Readings', icon: Eye, color: '#C084FC' },
  { id: 'healing', label: 'Healing', icon: Heart, color: '#FDA4AF' },
  { id: 'guidance', label: 'Guidance', icon: Compass, color: '#2DD4BF' },
  { id: 'meditation', label: 'Meditation', icon: Moon, color: '#818CF8' },
  { id: 'crafted', label: 'Crafted', icon: Gem, color: '#FCD34D' },
  { id: 'goods', label: 'Goods', icon: Package, color: '#FB923C' },
  { id: 'services', label: 'Services', icon: Wrench, color: '#2DD4BF' },
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

function KarmaBadge({ points, tier, size = 'sm' }) {
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

function TrustScoreBadge({ userId, authHeaders }) {
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

function CosmicHandshakeButton({ offer, authHeaders, onComplete }) {
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

function ReviewModal({ offer, onClose, authHeaders, onReviewed }) {
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

function KarmaProfileModal({ userId, onClose, authHeaders }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/trade-circle/karma/${userId}`, { headers: authHeaders })
      .then(r => { setProfile(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId, authHeaders]);

  if (loading) return null;
  if (!profile) return null;

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
              <p className="text-sm font-medium" style={{ color: '#EAB308' }}>{profile.avg_rating || '—'}</p>
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
      toast.success(action === 'accept' ? 'Trade accepted — awaiting Cosmic Handshake!' : 'Offer declined');
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

          {/* Make offer button */}
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
              <p className="text-xs" style={{ color: '#C084FC' }}>Awaiting Cosmic Handshake — both parties must confirm</p>
            </div>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [tab, setTab] = useState('browse');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [myOffers, setMyOffers] = useState({ sent: [], received: [] });
  const [showReview, setShowReview] = useState(null);
  const [showKarmaProfile, setShowKarmaProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [founderStatus, setFounderStatus] = useState(null);

  // Handle Stripe payment redirect
  useEffect(() => {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    if (payment === 'success' && sessionId) {
      axios.post(`${API}/trade-circle/broker/verify-payment`, { session_id: sessionId }, { headers: authHeaders })
        .then(r => {
          if (r.data.status === 'credited') toast.success(`${r.data.credits} Resonance Credits added!`);
          else if (r.data.status === 'already_credited') toast.info('Credits already applied');
          else toast.info('Payment processing...');
        })
        .catch(() => toast.error('Payment verification failed'));
      setSearchParams({});
      setTab('broker');
    } else if (payment === 'cancelled') {
      toast.info('Payment cancelled');
      setSearchParams({});
      setTab('broker');
    }
  }, [searchParams, authHeaders, setSearchParams]);

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

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/trade-circle/karma-leaderboard`, { headers: authHeaders });
      setLeaderboard(res.data.leaderboard || []);
    } catch {}
  }, [authHeaders]);

  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => { if (tab === 'offers') fetchMyOffers(); }, [tab, fetchMyOffers]);
  useEffect(() => { if (tab === 'karma') fetchLeaderboard(); }, [tab, fetchLeaderboard]);

  // Fetch founder status for Genesis Mint and God Mode access
  useEffect(() => {
    axios.get(`${API}/founding-architect/status`, { headers: authHeaders })
      .then(r => setFounderStatus(r.data))
      .catch(() => {});
  }, [authHeaders]);

  return (
    <div className="min-h-screen immersive-page pt-20 pb-24 px-4" style={{ background: 'var(--bg-primary)' }} data-testid="trade-circle-page">
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
            <MantraBanner category="trade" className="mt-1" />
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Active Listings', value: stats.total_active, color: '#2DD4BF' },
              { label: 'Trades Completed', value: stats.total_traded, color: '#22C55E' },
              { label: 'My Listings', value: stats.my_listings, color: '#C084FC' },
              { label: 'Pending Offers', value: stats.pending_offers, color: '#FB923C' },
              { label: 'Trade Karma', value: stats.karma || 0, color: stats.karma_tier?.color || '#94A3B8', sub: stats.karma_tier?.name },
            ].map(s => (
              <div key={s.label} className="glass-card p-3 text-center cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={s.label === 'Trade Karma' ? () => setShowKarmaProfile(user?.id) : undefined}
                data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>
                <p className="text-xl font-light" style={{ color: s.color, fontFamily: 'Cormorant Garamond, serif' }}>{s.value}</p>
                <p className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                {s.sub && <p className="text-[7px] mt-0.5" style={{ color: s.color }}>{s.sub}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-4 overflow-x-auto" style={{ background: 'rgba(248,250,252,0.02)' }}>
          {[
            { id: 'browse', label: 'Browse' },
            { id: 'broker', label: 'Broker', icon: Sparkles, color: '#EAB308' },
            { id: 'forge', label: 'Forge', icon: Gem, color: '#D97706' },
            { id: 'content', label: 'Content', icon: Sparkles, color: '#C084FC' },
            { id: 'escrow', label: 'Escrow', icon: Shield, color: '#818CF8' },
            { id: 'genesis', label: 'Genesis', icon: Star, color: '#FBBF24' },
            { id: 'godmode', label: 'God Mode', icon: Crown, color: '#FBBF24' },
            { id: 'avatar', label: 'Avatar', icon: User, color: '#C084FC' },
            { id: 'my', label: 'My Listings' },
            { id: 'offers', label: 'Offers' },
            { id: 'karma', label: 'Karma' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-2 rounded-lg text-xs transition-all whitespace-nowrap flex items-center justify-center gap-1"
              style={{
                background: tab === t.id ? 'rgba(192,132,252,0.08)' : 'transparent',
                color: tab === t.id ? (t.color || '#C084FC') : 'var(--text-muted)',
                border: tab === t.id ? `1px solid ${(t.color || '#C084FC')}15` : '1px solid transparent',
              }}
              data-testid={`trade-tab-${t.id}`}>
              {t.icon && <t.icon size={11} />}
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

            {/* Cosmic Broker Tab */}
            {tab === 'broker' && (
              <motion.div key="broker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CosmicBroker authHeaders={authHeaders} />
              </motion.div>
            )}

            {/* AI Content Broker Tab */}
            {tab === 'content' && (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ContentBroker authHeaders={authHeaders} />
              </motion.div>
            )}

            {/* Cosmic Forge Tab */}
            {tab === 'forge' && (
              <motion.div key="forge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CosmicForge />
              </motion.div>
            )}

            {/* Escrow Tab */}
            {tab === 'escrow' && (
              <motion.div key="escrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EscrowDashboard authHeaders={authHeaders} userId={user?.id} />
              </motion.div>
            )}

            {/* Genesis Mint Tab */}
            {tab === 'genesis' && (
              <motion.div key="genesis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GenesisMint
                  isFounder={founderStatus?.is_founding_architect}
                  genesisMinted={founderStatus?.genesis_minted}
                  onMinted={() => setFounderStatus(prev => ({ ...prev, genesis_minted: true }))}
                />
                {!founderStatus?.is_founding_architect && (
                  <div className="text-center py-10 rounded-xl mt-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <Star size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Only Founding Architects can mint Genesis items.
                      {founderStatus && ` ${founderStatus.slots_remaining} of 144 slots remaining.`}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* God Mode Dashboard Tab */}
            {tab === 'godmode' && (
              <motion.div key="godmode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GodModeDashboard />
              </motion.div>
            )}

            {/* Avatar Tab */}
            {tab === 'avatar' && (
              <motion.div key="avatar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GameAvatarPanel authHeaders={authHeaders} />
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
                                background: o.status === 'completed' ? 'rgba(34,197,94,0.1)' : o.status === 'accepted' ? 'rgba(192,132,252,0.1)' : o.status === 'declined' ? 'rgba(239,68,68,0.1)' : 'rgba(251,146,60,0.1)',
                                color: o.status === 'completed' ? '#22C55E' : o.status === 'accepted' ? '#C084FC' : o.status === 'declined' ? '#EF4444' : '#FB923C',
                              }}>{o.status === 'accepted' ? 'awaiting handshake' : o.status}</span>
                          </div>
                          <p className="text-[11px]" style={{ color: '#2DD4BF' }}>Offers: {o.offer_items}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {o.status === 'accepted' && (
                              <CosmicHandshakeButton offer={o} authHeaders={authHeaders} onComplete={() => { fetchMyOffers(); fetchListings(); }} />
                            )}
                            {(o.status === 'accepted' || o.status === 'completed') && (
                              <button onClick={() => setShowReview(o)}
                                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all hover:scale-105"
                                style={{ background: 'rgba(234,179,8,0.08)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.15)' }}
                                data-testid={`review-btn-${o.id}`}>
                                <Star size={10} /> Review
                              </button>
                            )}
                          </div>
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
                                background: o.status === 'completed' ? 'rgba(34,197,94,0.1)' : o.status === 'accepted' ? 'rgba(192,132,252,0.1)' : o.status === 'declined' ? 'rgba(239,68,68,0.1)' : 'rgba(251,146,60,0.1)',
                                color: o.status === 'completed' ? '#22C55E' : o.status === 'accepted' ? '#C084FC' : o.status === 'declined' ? '#EF4444' : '#FB923C',
                              }}>{o.status === 'accepted' ? 'awaiting handshake' : o.status}</span>
                          </div>
                          <p className="text-[11px]" style={{ color: '#2DD4BF' }}>Your offer: {o.offer_items}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {o.status === 'accepted' && (
                              <CosmicHandshakeButton offer={o} authHeaders={authHeaders} onComplete={() => { fetchMyOffers(); fetchListings(); }} />
                            )}
                            {(o.status === 'accepted' || o.status === 'completed') && (
                              <button onClick={() => setShowReview(o)}
                                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all hover:scale-105"
                                style={{ background: 'rgba(234,179,8,0.08)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.15)' }}
                                data-testid={`review-btn-sent-${o.id}`}>
                                <Star size={10} /> Review
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Karma Board Tab */}
            {tab === 'karma' && (
              <motion.div key="karma" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-6">
                  <Trophy size={24} className="mx-auto mb-2" style={{ color: '#EAB308' }} />
                  <h2 className="text-lg font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>Karma Leaderboard</h2>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Top traders in the collective</p>
                </div>
                {leaderboard.length === 0 ? (
                  <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>No karma earned yet. Complete trades to earn points!</p>
                ) : (
                  <div className="space-y-2" data-testid="karma-leaderboard">
                    {leaderboard.map((entry, idx) => (
                      <div key={entry.user_id}
                        className="glass-card p-3 flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition-transform"
                        onClick={() => setShowKarmaProfile(entry.user_id)}
                        data-testid={`leaderboard-entry-${idx}`}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{
                            background: idx === 0 ? 'rgba(234,179,8,0.12)' : idx === 1 ? 'rgba(148,163,184,0.12)' : idx === 2 ? 'rgba(180,83,9,0.12)' : 'rgba(248,250,252,0.04)',
                            color: idx === 0 ? '#EAB308' : idx === 1 ? '#94A3B8' : idx === 2 ? '#B45309' : 'var(--text-muted)',
                            border: `1px solid ${idx === 0 ? 'rgba(234,179,8,0.25)' : idx === 1 ? 'rgba(148,163,184,0.2)' : idx === 2 ? 'rgba(180,83,9,0.2)' : 'rgba(248,250,252,0.06)'}`,
                          }}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{entry.name}</p>
                          <KarmaBadge points={entry.points} tier={entry.tier} />
                        </div>
                        <p className="text-lg font-light" style={{ color: entry.tier.color, fontFamily: 'Cormorant Garamond, serif' }}>{entry.points}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Karma Tier Guide */}
                <div className="mt-8">
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--text-muted)' }}>Karma Tiers</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { name: 'Seedling', min: 0, color: '#94A3B8' },
                      { name: 'Sprout', min: 10, color: '#22C55E' },
                      { name: 'Bloom', min: 30, color: '#2DD4BF' },
                      { name: 'Guardian', min: 60, color: '#818CF8' },
                      { name: 'Elder', min: 100, color: '#C084FC' },
                      { name: 'Luminary', min: 200, color: '#EAB308' },
                    ].map(t => (
                      <div key={t.name} className="rounded-lg p-2 text-center"
                        style={{ background: `${t.color}06`, border: `1px solid ${t.color}15` }}>
                        <Award size={14} className="mx-auto mb-1" style={{ color: t.color }} />
                        <p className="text-[10px] font-medium" style={{ color: t.color }}>{t.name}</p>
                        <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{t.min}+ pts</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* How to earn */}
                <div className="mt-6 rounded-lg p-4" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.04)' }}>
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-muted)' }}>How to Earn Karma</p>
                  <div className="space-y-1.5">
                    {[
                      { action: 'Complete a trade', pts: '+10', color: '#22C55E' },
                      { action: 'Leave a review', pts: '+3', color: '#EAB308' },
                      { action: 'Create a listing', pts: '+1', color: '#C084FC' },
                      { action: 'Make an offer', pts: '+1', color: '#2DD4BF' },
                    ].map(a => (
                      <div key={a.action} className="flex items-center justify-between text-[10px]">
                        <span style={{ color: 'var(--text-secondary)' }}>{a.action}</span>
                        <span className="font-medium" style={{ color: a.color }}>{a.pts}</span>
                      </div>
                    ))}
                  </div>
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
        {showReview && <ReviewModal offer={showReview} onClose={() => setShowReview(null)} authHeaders={authHeaders} onReviewed={() => { fetchMyOffers(); fetchListings(); }} />}
        {showKarmaProfile && <KarmaProfileModal userId={showKarmaProfile} onClose={() => setShowKarmaProfile(null)} authHeaders={authHeaders} />}
      </AnimatePresence>
    </div>
  );
}
