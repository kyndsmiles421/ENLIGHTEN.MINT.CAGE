import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useCrystalEncryption, CRYSTAL_SKINS } from '../hooks/useCrystalEncryption';
import { ArrowLeft, Gem, Check, Lock, Sparkles } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CrystalMarketplace() {
  const { authHeaders, token } = useAuth();
  const navigate = useNavigate();
  const { activeSkin, equipSkin } = useCrystalEncryption();
  const [skins, setSkins] = useState([]);
  const [dust, setDust] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  const fetchSkins = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${API}/gaming/skins/available`, { headers: authHeaders });
      setSkins(data.skins);
      setDust(data.dust_balance);
      if (data.active_skin) equipSkin(data.active_skin);
    } catch { toast.error('Failed to load skins'); }
    finally { setLoading(false); }
  }, [authHeaders, token, equipSkin]);

  useEffect(() => { fetchSkins(); }, [fetchSkins]);
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('module_interaction', 10); }, []);

  const handlePurchase = async (skinKey) => {
    setPurchasing(skinKey);
    try {
      const { data } = await axios.post(`${API}/gaming/skins/purchase`, { skin_key: skinKey }, { headers: authHeaders });
      toast.success(`${data.name} unlocked! -${data.cost} Dust`);
      fetchSkins();
    } catch (e) { toast.error(e.response?.data?.detail || 'Purchase failed'); }
    finally { setPurchasing(null); }
  };

  const handleEquip = async (skinKey) => {
    try {
      await axios.post(`${API}/gaming/skins/equip`, { skin_key: skinKey }, { headers: authHeaders });
      equipSkin(skinKey);
      toast.success(`${CRYSTAL_SKINS[skinKey]?.name || skinKey} equipped`);
      fetchSkins();
    } catch (e) { toast.error(e.response?.data?.detail || 'Equip failed'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#030308' }}><Sparkles className="animate-spin" color="#9b59b6" /></div>;

  return (
    <div className="min-h-screen pb-24" style={{ background: '#030308' }} data-testid="crystal-marketplace-page">
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-40" style={{ background: 'rgba(3,3,8,0.9)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} data-testid="crystal-back-btn"><ArrowLeft size={16} color="#F8FAFC" /></button>
        <h1 className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Crystal Encryption Skins</h1>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
          <Sparkles size={10} color="#A855F7" />
          <span className="text-[10px] font-bold" style={{ color: '#A855F7' }}>{dust.toLocaleString()}</span>
        </div>
      </div>

      <div className="px-4 pt-2">
        <p className="text-xs mb-4" style={{ color: 'rgba(248,250,252,0.4)' }}>
          Each skin transforms the entire UI — buttons, glows, transitions, frequency. Equip to activate.
        </p>

        <div className="space-y-3">
          {skins.map((skin) => {
            const fullSkin = CRYSTAL_SKINS[skin.key] || {};
            const isActive = activeSkin?.id === fullSkin.id;
            const canAfford = dust >= skin.cost;

            return (
              <motion.div key={skin.key} layout
                className="rounded-2xl p-4 transition-all"
                style={{
                  background: isActive ? `${fullSkin.primary}12` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? `${fullSkin.primary}40` : skin.owned ? `${fullSkin.primary}20` : 'rgba(255,255,255,0.06)'}`,
                }}
                data-testid={`skin-${skin.key.toLowerCase()}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${fullSkin.primary}20`, boxShadow: isActive ? `0 0 12px ${fullSkin.glow}` : 'none' }}>
                      <Gem size={16} color={fullSkin.primary} />
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: fullSkin.primary || '#F8FAFC' }}>{skin.name}</div>
                      <div className="text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>Tier {skin.tier} {isActive ? '— ACTIVE' : ''}</div>
                    </div>
                  </div>
                  {isActive && <Check size={16} color={fullSkin.primary} />}
                </div>

                <p className="text-[11px] mb-3" style={{ color: 'rgba(248,250,252,0.5)' }}>{fullSkin.description}</p>

                {/* Preview bar */}
                <div className="flex gap-1 mb-3">
                  {[fullSkin.primary, fullSkin.secondary, fullSkin.primary + '80', fullSkin.secondary + '60'].map((c, i) => (
                    <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: c }} />
                  ))}
                </div>

                {skin.owned ? (
                  <button
                    onClick={() => handleEquip(skin.key)}
                    disabled={isActive}
                    className="w-full py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: isActive ? `${fullSkin.primary}10` : `${fullSkin.primary}15`,
                      border: `1px solid ${fullSkin.primary}30`,
                      color: isActive ? `${fullSkin.primary}60` : fullSkin.primary,
                    }}
                    data-testid={`equip-${skin.key.toLowerCase()}`}
                  >
                    {isActive ? 'Equipped' : 'Equip'}
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(skin.key)}
                    disabled={!canAfford || purchasing === skin.key}
                    className="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    style={{
                      background: canAfford ? `${fullSkin.primary}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${canAfford ? `${fullSkin.primary}30` : 'rgba(255,255,255,0.05)'}`,
                      color: canAfford ? fullSkin.primary : 'rgba(248,250,252,0.3)',
                    }}
                    data-testid={`buy-${skin.key.toLowerCase()}`}
                  >
                    {purchasing === skin.key ? 'Purchasing...' : (
                      <>
                        <Lock size={12} />
                        {skin.cost} Dust
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
