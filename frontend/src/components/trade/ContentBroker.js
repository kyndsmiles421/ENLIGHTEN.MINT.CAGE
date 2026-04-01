import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Sparkles, Music, MessageSquare, Users, ShoppingBag,
  Coins, Crown, Shield, ChevronRight, Filter, Star, User
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TYPE_CONFIG = {
  recovery_frequency: { label: 'Recovery Frequency', icon: Music, color: '#2DD4BF', source: 'Wellness' },
  victory_mantra: { label: 'Victory Mantra', icon: MessageSquare, color: '#EAB308', source: 'RPG' },
  group_immersion: { label: 'Group Immersion', icon: Users, color: '#818CF8', source: 'Community' },
  cosmic_blend: { label: 'Cosmic Blend', icon: Sparkles, color: '#C084FC', source: 'AI Mixer' },
};

function ContentAssetCard({ asset, onPurchase, purchasing }) {
  const cfg = TYPE_CONFIG[asset.type] || TYPE_CONFIG.cosmic_blend;
  const Icon = cfg.icon;
  const pricing = asset.pricing || {};

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="rounded-xl p-4"
      style={{ background: 'rgba(248,250,252,0.02)', border: `1px solid ${cfg.color}10` }}
      data-testid={`content-asset-${asset.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}18` }}>
          <Icon size={18} style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {asset.name}
            </p>
            <span className="text-[7px] px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: `${cfg.color}08`, color: cfg.color }}>
              {cfg.source}
            </span>
          </div>
          <p className="text-[10px] line-clamp-2 mb-2" style={{ color: 'var(--text-muted)' }}>
            {asset.description}
          </p>
          {/* Content preview */}
          {asset.content?.mantra && (
            <p className="text-[10px] italic mb-2 px-2 py-1 rounded-lg"
              style={{ background: `${cfg.color}04`, color: cfg.color, fontFamily: 'Cormorant Garamond, serif' }}>
              "{asset.content.mantra}"
            </p>
          )}
          {asset.content?.primary_hz && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[8px] px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(45,212,191,0.06)', color: '#2DD4BF' }}>
                {asset.content.primary_hz}Hz
              </span>
              <span className="text-[8px] px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(129,140,248,0.06)', color: '#818CF8' }}>
                {asset.content.binaural_preset?.replace('_', ' ')}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {asset.purchases || 0} purchased
              </span>
              {asset.purchases > 5 && (
                <Star size={8} style={{ color: '#EAB308' }} />
              )}
            </div>
            <div className="flex items-center gap-2">
              {pricing.discount_pct > 0 && (
                <span className="text-[9px] line-through" style={{ color: 'var(--text-muted)' }}>
                  {pricing.base_price}
                </span>
              )}
              {asset.is_own ? (
                <span className="text-[9px] px-2 py-1 rounded-lg" style={{ color: '#22C55E' }}>Your creation</span>
              ) : (
                <button
                  onClick={() => onPurchase(asset.id)}
                  disabled={purchasing === asset.id}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-medium transition-all hover:scale-105"
                  style={{ background: `${cfg.color}08`, color: cfg.color, border: `1px solid ${cfg.color}15` }}
                  data-testid={`buy-content-${asset.id}`}
                >
                  <Coins size={9} />
                  {purchasing === asset.id ? '...' : `${pricing.final_price || pricing.base_price} Cr`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ContentBroker({ authHeaders }) {
  const [catalog, setCatalog] = useState([]);
  const [myContent, setMyContent] = useState({ created: [], purchased: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [purchasing, setPurchasing] = useState('');
  const [tab, setTab] = useState('browse');
  const [generating, setGenerating] = useState('');
  const [userTier, setUserTier] = useState('Base');
  const [discountPct, setDiscountPct] = useState(0);

  const fetchCatalog = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/content-broker/catalog${filter ? `?asset_type=${filter}` : ''}`, { headers: authHeaders });
      setCatalog(res.data.assets || []);
      setUserTier(res.data.user_tier);
      setDiscountPct(res.data.discount_pct);
    } catch {}
    setLoading(false);
  }, [authHeaders, filter]);

  const fetchMyContent = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/content-broker/my-content`, { headers: authHeaders });
      setMyContent(res.data);
    } catch {}
  }, [authHeaders]);

  useEffect(() => { fetchCatalog(); fetchMyContent(); }, [fetchCatalog, fetchMyContent]);

  const handlePurchase = async (assetId) => {
    setPurchasing(assetId);
    try {
      const res = await axios.post(`${API}/content-broker/purchase`, { asset_id: assetId }, { headers: authHeaders });
      toast.success(`${res.data.purchased} acquired! ${res.data.discount_applied > 0 ? `(${res.data.discount_applied}% tier discount)` : ''}`);
      fetchCatalog();
      fetchMyContent();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Purchase failed');
    }
    setPurchasing('');
  };

  const handleGenerate = async (type, context) => {
    setGenerating(type);
    try {
      const res = await axios.post(`${API}/content-broker/generate`, {
        type, context, source: 'manual',
      }, { headers: authHeaders });
      toast.success(`${res.data.asset.name} created and listed!`);
      fetchCatalog();
      fetchMyContent();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Generation failed');
    }
    setGenerating('');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(192,132,252,0.2)', borderTopColor: '#C084FC' }} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="content-broker-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-light flex items-center gap-2" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            <Sparkles size={18} style={{ color: '#C084FC' }} />
            AI Content Broker
          </h2>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            AI-generated frequencies, mantras, and immersions from the collective
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {discountPct > 0 && (
            <span className="text-[8px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(234,179,8,0.08)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.15)' }}>
              {discountPct}% {userTier} Discount
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'rgba(248,250,252,0.02)' }}>
        {[
          { id: 'browse', label: 'Marketplace', icon: ShoppingBag },
          { id: 'create', label: 'Generate', icon: Sparkles },
          { id: 'mine', label: 'My Content', icon: User },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-all"
            style={{
              background: tab === t.id ? 'rgba(192,132,252,0.08)' : 'transparent',
              color: tab === t.id ? '#C084FC' : 'var(--text-muted)',
              border: tab === t.id ? '1px solid rgba(192,132,252,0.12)' : '1px solid transparent',
            }}
            data-testid={`content-tab-${t.id}`}>
            <t.icon size={11} /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Marketplace */}
        {tab === 'browse' && (
          <motion.div key="browse" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Type Filters */}
            <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
              <button onClick={() => setFilter('')}
                className="px-3 py-1.5 rounded-lg text-[10px] whitespace-nowrap transition-all"
                style={{
                  background: !filter ? 'rgba(192,132,252,0.08)' : 'transparent',
                  color: !filter ? '#C084FC' : 'var(--text-muted)',
                  border: `1px solid ${!filter ? 'rgba(192,132,252,0.15)' : 'rgba(248,250,252,0.06)'}`,
                }}
                data-testid="content-filter-all">All</button>
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setFilter(key)}
                  className="px-3 py-1.5 rounded-lg text-[10px] whitespace-nowrap transition-all flex items-center gap-1"
                  style={{
                    background: filter === key ? `${cfg.color}08` : 'transparent',
                    color: filter === key ? cfg.color : 'var(--text-muted)',
                    border: `1px solid ${filter === key ? `${cfg.color}15` : 'rgba(248,250,252,0.06)'}`,
                  }}
                  data-testid={`content-filter-${key}`}>
                  <cfg.icon size={10} /> {cfg.label}
                </button>
              ))}
            </div>

            {catalog.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>No content yet</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Generate the first AI content asset!</p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="content-catalog">
                {catalog.map(a => (
                  <ContentAssetCard key={a.id} asset={a} onPurchase={handlePurchase} purchasing={purchasing} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Generate */}
        {tab === 'create' && (
          <motion.div key="create" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-[10px] mb-4 px-1" style={{ color: 'var(--text-muted)' }}>
              Generate unique AI content to sell on the marketplace. Every section of the app produces its own unique assets.
            </p>
            <div className="space-y-3">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <div key={key} className="rounded-xl p-4"
                    style={{ background: 'rgba(248,250,252,0.02)', border: `1px solid ${cfg.color}10` }}
                    data-testid={`generate-${key}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}18` }}>
                        <Icon size={16} style={{ color: cfg.color }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{cfg.label}</p>
                        <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Source: {cfg.source} Section</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleGenerate(key, `${cfg.source} session completion`)}
                      disabled={generating === key}
                      className="w-full py-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                      style={{ background: `${cfg.color}08`, color: cfg.color, border: `1px solid ${cfg.color}15` }}
                      data-testid={`generate-btn-${key}`}
                    >
                      <Sparkles size={11} />
                      {generating === key ? 'Generating...' : `Generate ${cfg.label}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* My Content */}
        {tab === 'mine' && (
          <motion.div key="mine" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="space-y-5">
              {/* Created */}
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
                  Created ({myContent.total_created || 0})
                </p>
                {(myContent.created || []).length === 0 ? (
                  <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>No content created yet</p>
                ) : (
                  <div className="space-y-2">
                    {myContent.created.map(a => {
                      const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.cosmic_blend;
                      return (
                        <div key={a.id} className="rounded-lg p-3 flex items-center gap-3"
                          style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.06)' }}>
                          <cfg.icon size={14} style={{ color: cfg.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{a.name}</p>
                            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                              {a.purchases || 0} sales &middot; {a.base_price} Cr
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Purchased */}
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
                  Purchased ({myContent.total_purchased || 0})
                </p>
                {(myContent.purchased || []).length === 0 ? (
                  <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>No content purchased yet</p>
                ) : (
                  <div className="space-y-2">
                    {myContent.purchased.map(a => {
                      const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.cosmic_blend;
                      return (
                        <div key={a.id} className="rounded-lg p-3 flex items-center gap-3"
                          style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.06)' }}>
                          <cfg.icon size={14} style={{ color: cfg.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{a.name}</p>
                            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{cfg.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
