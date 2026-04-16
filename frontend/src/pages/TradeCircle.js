import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft, Plus, Package, Wrench, Search,
  ArrowRightLeft, Sparkles, Star, Award, Trophy,
  Shield, Eye, Heart, Compass, Moon, Gem, Coins, Crown, User, Zap, Leaf
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Extracted trade widgets
import {
  CreateListingModal, ListingCard, ListingDetail, ReviewModal,
  KarmaProfileModal, KarmaBadge, CosmicHandshakeButton
} from '../components/trade/TradeCircleWidgets';

// Sub-panels (already modular)
import CosmicBroker from '../components/trade/CosmicBroker';
import EscrowDashboard from '../components/trade/EscrowDashboard';
import ContentBroker from '../components/trade/ContentBroker';
import { MantraBanner } from '../components/MantraSystem';
import GameAvatarPanel from '../components/GameAvatar';
import CosmicForge from '../components/CosmicForge';
import GodModeDashboard from '../components/GodModeDashboard';
import GenesisMint from '../components/GenesisMint';
import EnergyGates from '../components/EnergyGates';
import ResonancePractice from '../components/ResonancePractice';
import { NanoGuide } from '../components/NanoGuide';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  { id: 'all', label: 'All', icon: ArrowRightLeft, color: '#C084FC' },
  { id: 'readings', label: 'Readings', icon: Eye, color: '#C084FC' },
  { id: 'healing', label: 'Healing', icon: Heart, color: '#FDA4AF' },
  { id: 'guidance', label: 'Guidance', icon: Compass, color: '#2DD4BF' },
  { id: 'meditation', label: 'Meditation', icon: Moon, color: '#818CF8' },
  { id: 'crafted', label: 'Crafted', icon: Gem, color: '#FCD34D' },
  { id: 'botanical', label: 'Botanicals', icon: Leaf, color: '#22C55E' },
  { id: 'frequency_recipe', label: 'Recipes', icon: Zap, color: '#EAB308' },
  { id: 'goods', label: 'Goods', icon: Package, color: '#FB923C' },
  { id: 'services', label: 'Services', icon: Wrench, color: '#2DD4BF' },
];

const TABS = [
  { id: 'browse', label: 'Browse' },
  { id: 'trader', label: 'Trader', icon: ArrowRightLeft, color: '#FCD34D' },
  { id: 'gates', label: 'Gates', icon: Zap, color: '#D97706' },
  { id: 'resonance', label: 'Resonance', icon: Sparkles, color: '#8B5CF6' },
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
];

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
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('trade_circle', 8); }, []);
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

  useEffect(() => {
    axios.get(`${API}/founding-architect/status`, { headers: authHeaders })
      .then(r => setFounderStatus(r.data))
      .catch(() => {});
  }, [authHeaders]);

  const pendingCount = myOffers.received.filter(o => o.status === 'pending').length;

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
            <h1 className="text-2xl md:text-3xl font-light flex items-center gap-2" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Trade Circle <NanoGuide guideId="trade-circle" position="top-right" />
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
              <div key={s.label} className="p-3 text-center cursor-pointer hover:scale-[1.02] transition-transform"
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
          {TABS.map(t => (
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
              {t.id === 'offers' && pendingCount > 0 && (
                <span className="ml-1 w-4 h-4 inline-flex items-center justify-center rounded-full text-[8px]"
                  style={{ background: '#FB923C', color: '#fff' }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Filters (browse only) */}
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
        {loading && tab === 'browse' ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(192,132,252,0.2)', borderTopColor: '#C084FC' }} />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Browse */}
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

            {/* Energy Gates */}
            {tab === 'gates' && (
              <motion.div key="gates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EnergyGates />
              </motion.div>
            )}

            {/* Liquidity Trader (Waste-to-Value) */}
            {tab === 'trader' && (
              <motion.div key="trader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center py-6">
                  <Sparkles size={32} color="#FCD34D" className="mx-auto mb-3" />
                  <h3 className="text-base font-bold mb-2" style={{ color: '#F8FAFC' }}>Marketplace Trader</h3>
                  <p className="text-xs mb-4" style={{ color: 'rgba(248,250,252,0.5)' }}>
                    The Liquidity Controller — convert Digital Dust into Fans via Phi Cap exchange.
                  </p>
                  <button onClick={() => navigate('/liquidity-trader')}
                    className="px-6 py-3 rounded-xl text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, rgba(252,211,77,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(252,211,77,0.25)', color: '#FCD34D' }}
                    data-testid="open-liquidity-trader-btn">
                    Open Liquidity Trader
                  </button>
                </div>
              </motion.div>
            )}

            {/* Resonance Practice */}
            {tab === 'resonance' && (
              <motion.div key="resonance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ResonancePractice />
              </motion.div>
            )}

            {/* Broker */}
            {tab === 'broker' && (
              <motion.div key="broker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CosmicBroker authHeaders={authHeaders} />
              </motion.div>
            )}

            {/* Content */}
            {tab === 'content' && (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ContentBroker authHeaders={authHeaders} />
              </motion.div>
            )}

            {/* Forge */}
            {tab === 'forge' && (
              <motion.div key="forge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CosmicForge />
              </motion.div>
            )}

            {/* Escrow */}
            {tab === 'escrow' && (
              <motion.div key="escrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EscrowDashboard authHeaders={authHeaders} userId={user?.id} />
              </motion.div>
            )}

            {/* Genesis */}
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

            {/* God Mode */}
            {tab === 'godmode' && (
              <motion.div key="godmode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GodModeDashboard />
              </motion.div>
            )}

            {/* Avatar */}
            {tab === 'avatar' && (
              <motion.div key="avatar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GameAvatarPanel authHeaders={authHeaders} />
              </motion.div>
            )}

            {/* My Listings */}
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

            {/* Offers */}
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
                        <div key={o.id} className="p-3" data-testid={`received-offer-${o.id}`}>
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
                        <div key={o.id} className="p-3" data-testid={`sent-offer-${o.id}`}>
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

            {/* Karma */}
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
                        className="p-3 flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition-transform"
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
