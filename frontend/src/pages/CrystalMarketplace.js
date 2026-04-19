import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useCrystalEncryption, CRYSTAL_SKINS } from '../hooks/useCrystalEncryption';
import { ArrowLeft, Gem, Check, Lock, Sparkles } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const SKIN_KEYS = Object.keys(CRYSTAL_SKINS);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}><Sparkles className="animate-spin" color="#9b59b6" /></div>;

  // Build skin list from backend + frontend config
  const skinList = SKIN_KEYS.map(key => {
    const backendSkin = skins.find(s => s.key === key);
    const config = CRYSTAL_SKINS[key];
    return {
      key,
      ...config,
      owned: backendSkin?.owned || key === 'AMETHYST',
      isActive: activeSkin?.id === config.id,
      cost: backendSkin?.cost || config.dust_cost,
    };
  });

  return (
    <div className="min-h-screen pb-40" style={{ background: 'transparent', color: '#fff', fontFamily: 'monospace' }} data-testid="crystal-marketplace-page">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-40" style={{ background: 'transparent', backdropFilter: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate(-1)} className="p-2" data-testid="crystal-back-btn"><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-xs font-bold uppercase tracking-[0.2em]">The Vault: Marketplace</h1>
          <p className="text-[9px] text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>Current: {activeSkin.name}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold" style={{ color: '#f1c40f' }}>{dust.toLocaleString()} DUST</span>
        </div>
      </header>

      {/* Skin Grid */}
      <div className="px-4 pt-4 space-y-4">
        {skinList.map((skin) => (
          <motion.div
            key={skin.key}
            whileHover={{ y: -2 }}
            className="relative p-5 rounded-2xl transition-all"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.04), transparent)',
              border: `1px solid ${skin.isActive ? skin.primary : 'rgba(255,255,255,0.08)'}`,
              boxShadow: skin.isActive ? `0 0 20px ${skin.glow}` : 'none',
            }}
            data-testid={`skin-${skin.key.toLowerCase()}`}
          >
            {/* Crystal Preview */}
            <div className="w-full h-24 mb-4 rounded-lg flex items-center justify-center"
              style={{ background: `radial-gradient(circle, ${skin.primary}44 0%, transparent 70%)` }}>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8 / (skin.speed || 1), repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 border-2"
                style={{
                  borderColor: skin.primary,
                  boxShadow: `0 0 15px ${skin.primary}`,
                  transform: 'rotate(45deg)',
                }}
              />
            </div>

            <h2 className="text-base font-bold mb-0.5" style={{ color: skin.primary }}>{skin.name}</h2>
            <p className="text-[10px] mb-1 font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
              FREQ_OSC: {skin.speed}Hz | TIER: {skin.tier}
            </p>
            <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{skin.description}</p>

            {skin.owned ? (
              <button
                onClick={() => handleEquip(skin.key)}
                disabled={skin.isActive}
                className="w-full py-3 rounded-full font-bold uppercase tracking-[0.15em] text-[10px] transition-all"
                style={{
                  background: skin.isActive ? 'rgba(255,255,255,0.03)' : '#fff',
                  color: skin.isActive ? 'rgba(255,255,255,0.6)' : '#000',
                }}
                data-testid={`equip-${skin.key.toLowerCase()}`}
              >
                {skin.isActive ? 'Active Encryption' : 'Equip'}
              </button>
            ) : (
              <button
                onClick={() => handlePurchase(skin.key)}
                disabled={dust < skin.cost || purchasing === skin.key}
                className="w-full py-3 rounded-full font-bold uppercase tracking-[0.15em] text-[10px] transition-all"
                style={{
                  background: dust >= skin.cost ? '#fff' : 'rgba(255,255,255,0.05)',
                  color: dust >= skin.cost ? '#000' : 'rgba(255,255,255,0.6)',
                }}
                data-testid={`buy-${skin.key.toLowerCase()}`}
              >
                {purchasing === skin.key ? 'Encrypting...' : `Equip (${skin.cost} Dust)`}
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* System Flow Preview */}
      <section className="px-4 mt-8 mb-8">
        <h3 className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>Active System Flow</h3>
        <div className="flex gap-2 flex-wrap">
          {['PRACTICE', 'DIVINATION', 'SANCTUARY', 'NOURISH', 'EXPLORE', 'SAGE', 'COUNCIL'].map((pillar) => (
            <motion.div
              key={pillar}
              animate={{ boxShadow: ['0 0 0px transparent', `0 0 12px var(--crystal-glow)`, '0 0 0px transparent'] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="px-3 py-1.5 rounded-md text-[9px] font-bold"
              style={{ color: 'var(--crystal-primary)', border: '1px solid var(--crystal-primary)' }}
            >
              {pillar}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
