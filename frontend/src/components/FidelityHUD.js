import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useSensory } from '../context/SensoryContext';
import {
  Zap, Clock, Sparkles, X, Coins, Wind, ChevronRight, Timer, Shield, Crown
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function FidelityHUD({ authHeaders }) {
  const { prefs, updatePref } = useSensory();
  const [status, setStatus] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [buying, setBuying] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!authHeaders?.Authorization) return;
    try {
      const res = await axios.get(`${API}/fidelity/status`, { headers: authHeaders });
      setStatus(res.data);
      // Auto-switch to ultra if boost active
      if (res.data.fidelity_boost_active && prefs.immersionLevel !== 'full') {
        updatePref('immersionLevel', 'full');
      }
    } catch {}
    setLoading(false);
  }, [authHeaders, prefs.immersionLevel, updatePref]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);
  // Poll every 60s to update timer
  useEffect(() => {
    if (!authHeaders?.Authorization) return;
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, [authHeaders, fetchStatus]);

  const handleBuyBoost = async (packId, currency) => {
    setBuying(`${packId}_${currency}`);
    try {
      const res = await axios.post(`${API}/fidelity/boost`, {
        pack_id: packId, currency,
      }, { headers: authHeaders });
      toast.success(`${res.data.pack} activated! ${res.data.hours_remaining}h remaining`);
      updatePref('immersionLevel', 'full');
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Boost failed');
    }
    setBuying('');
  };

  const handleFreeTrial = async () => {
    setBuying('trial');
    try {
      await axios.post(`${API}/fidelity/activate-trial`, {}, { headers: authHeaders });
      toast.success('7-day Ultra trial activated!');
      updatePref('immersionLevel', 'full');
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Trial activation failed');
    }
    setBuying('');
  };

  if (loading || !status) return null;

  const tierColors = { Base: '#94A3B8', Premium: '#2DD4BF', Elite: '#EAB308' };
  const tierColor = tierColors[status.tier_label] || '#94A3B8';
  const boostActive = status.fidelity_boost_active;

  return (
    <>
      {/* HUD Icon — placed in navigation area */}
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 rounded-lg transition-all"
        style={{
          background: boostActive ? 'rgba(192,132,252,0.1)' : 'rgba(248,250,252,0.03)',
          border: `1px solid ${boostActive ? 'rgba(192,132,252,0.2)' : 'rgba(248,250,252,0.06)'}`,
        }}
        data-testid="fidelity-hud-btn"
      >
        <Zap size={14} style={{ color: boostActive ? '#C084FC' : 'var(--text-muted)' }} />
        {/* Glow ring when boost is active */}
        {boostActive && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{ border: '1px solid rgba(192,132,252,0.3)' }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {/* Timer badge */}
        {boostActive && status.fidelity_boost_hours_remaining > 0 && (
          <span className="absolute -top-1 -right-1 text-[7px] px-1 py-0.5 rounded-full font-mono font-bold"
            style={{ background: 'rgba(192,132,252,0.2)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.3)' }}>
            {status.fidelity_boost_hours_remaining}h
          </span>
        )}
      </motion.button>

      {/* Boost Panel Overlay */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'none'}}
            onClick={() => setShowPanel(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 right-4 w-80 max-h-[75vh] overflow-y-auto rounded-xl"
              style={{
                background: 'rgba(3,3,8,0.95)',
                backdropFilter: 'none',
                border: '1px solid rgba(192,132,252,0.15)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              }}
              onClick={e => e.stopPropagation()}
              data-testid="fidelity-panel"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
                <div className="flex items-center gap-2">
                  <Zap size={14} style={{ color: '#C084FC' }} />
                  <span className="text-xs font-semibold" style={{ color: '#F8FAFC' }}>Atmosphere Boost</span>
                </div>
                <button onClick={() => setShowPanel(false)} className="p-1 rounded hover:bg-white/5"
                  data-testid="fidelity-panel-close">
                  <X size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Current Status */}
                <div className="rounded-xl p-3 text-center"
                  style={{ background: `${tierColor}06`, border: `1px solid ${tierColor}12` }}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {status.tier_label === 'Elite' ? <Crown size={12} style={{ color: tierColor }} /> :
                     status.tier_label === 'Premium' ? <Shield size={12} style={{ color: tierColor }} /> :
                     <Sparkles size={12} style={{ color: tierColor }} />}
                    <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: tierColor }}>
                      {status.tier_label} Tier
                    </span>
                  </div>
                  {status.discount_pct > 0 && (
                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                      {status.discount_pct}% discount on all marketplace assets
                    </p>
                  )}
                </div>

                {/* Active Boost */}
                {boostActive && (
                  <div className="rounded-xl p-3"
                    style={{ background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.12)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Timer size={12} style={{ color: '#C084FC' }} />
                      <span className="text-xs font-medium" style={{ color: '#C084FC' }}>Ultra Active</span>
                    </div>
                    <p className="text-lg font-mono font-light" style={{ color: '#C084FC', fontFamily: 'Cormorant Garamond, serif' }}>
                      {status.fidelity_boost_hours_remaining}h remaining
                    </p>
                    <div className="w-full h-1 rounded-full mt-2" style={{ background: 'rgba(192,132,252,0.1)' }}>
                      <div className="h-full rounded-full transition-all" style={{
                        background: '#C084FC',
                        width: `${Math.min(100, (status.fidelity_boost_hours_remaining / 168) * 100)}%`,
                      }} />
                    </div>
                  </div>
                )}

                {/* Free Trial */}
                {status.free_trial_eligible && !boostActive && (
                  <motion.button
                    onClick={handleFreeTrial}
                    disabled={buying === 'trial'}
                    whileHover={{ scale: 1.02 }}
                    className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(192,132,252,0.15), rgba(234,179,8,0.1))',
                      color: '#C084FC',
                      border: '1px solid rgba(192,132,252,0.25)',
                    }}
                    data-testid="activate-trial-btn"
                  >
                    <Sparkles size={14} />
                    {buying === 'trial' ? 'Activating...' : 'Activate 7-Day Ultra Trial (FREE)'}
                  </motion.button>
                )}

                {/* Boost Packs */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
                    Quick Boost
                  </p>
                  <div className="space-y-2">
                    {(status.boost_packs || []).map(pack => {
                      const dustDiscount = status.discount_pct > 0 ? Math.max(1, pack.cost_dust - Math.floor(pack.cost_dust * status.discount_pct / 100)) : pack.cost_dust;
                      const creditDiscount = status.discount_pct > 0 ? Math.max(1, pack.cost_credits - Math.floor(pack.cost_credits * status.discount_pct / 100)) : pack.cost_credits;

                      return (
                        <div key={pack.id} className="rounded-xl p-3"
                          style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.06)' }}
                          data-testid={`boost-pack-${pack.id}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Clock size={12} style={{ color: '#C084FC' }} />
                              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{pack.name}</span>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(192,132,252,0.08)', color: '#C084FC' }}>
                              {pack.hours}h
                            </span>
                          </div>
                          <p className="text-[9px] mb-2" style={{ color: 'var(--text-muted)' }}>{pack.description}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBuyBoost(pack.id, 'dust')}
                              disabled={buying === `${pack.id}_dust`}
                              className="flex-1 py-1.5 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-all hover:scale-105"
                              style={{ background: 'rgba(192,132,252,0.06)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.12)' }}
                              data-testid={`boost-${pack.id}-dust`}
                            >
                              <Wind size={9} />
                              {status.discount_pct > 0 && <span className="line-through opacity-40">{pack.cost_dust}</span>}
                              {dustDiscount} Dust
                            </button>
                            <button
                              onClick={() => handleBuyBoost(pack.id, 'credits')}
                              disabled={buying === `${pack.id}_credits`}
                              className="flex-1 py-1.5 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-all hover:scale-105"
                              style={{ background: 'rgba(234,179,8,0.06)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.12)' }}
                              data-testid={`boost-${pack.id}-credits`}
                            >
                              <Coins size={9} />
                              {status.discount_pct > 0 && <span className="line-through opacity-40">{pack.cost_credits}</span>}
                              {creditDiscount} Cr
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Upsell note */}
                {status.tier_label === 'Base' && (
                  <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.08)' }}>
                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                      Upgrade to <span style={{ color: '#2DD4BF' }}>Premium</span> for 15% off all boosts and assets, or <span style={{ color: '#EAB308' }}>Elite</span> for 30% off
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
