import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useLatency } from '../hooks/useLatencyPulse';
import useGameController from '../hooks/useGameController';
import GameModuleWrapper from '../components/game/GameModuleWrapper';
import {
  ArrowLeft, Crown, Eye, Radio, Package, Zap, Key, Sparkles,
  Sun, Flame, Monitor, Film, Coins, ShoppingBag, ChevronRight,
  Star, Shield, Gem, Clock, Check, X, Lock, TrendingUp, Gift
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ICON_MAP = { eye: Eye, radio: Radio, package: Package, zap: Zap, key: Key, sparkles: Sparkles, sun: Sun, flame: Flame, monitor: Monitor, film: Film, coins: Coins, crown: Crown, shield: Shield };
const RARITY_COLORS = { common: '#9CA3AF', uncommon: '#22C55E', rare: '#3B82F6', epic: '#A855F7', legendary: '#FCD34D', mythic: '#EF4444' };

function StoreHeader({ credits, onBack }) {
  return (
    <div className="flex items-center justify-between px-4 py-3" data-testid="store-header">
      <button onClick={onBack} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} data-testid="store-back-btn">
        <ArrowLeft size={16} color="#F8FAFC" />
      </button>
      <h1 className="text-base font-bold" style={{ color: '#F8FAFC' }}>Cosmic Store</h1>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.15)' }}>
        <Coins size={12} color="#FCD34D" />
        <span className="text-xs font-bold" style={{ color: '#FCD34D' }} data-testid="store-credits-display">{credits.toLocaleString()}</span>
      </div>
    </div>
  );
}

function TabBar({ active, onTab }) {
  const tabs = [
    { id: 'consumables', label: 'Consumables', icon: Zap },
    { id: 'cosmetics', label: 'Cosmetics', icon: Sparkles },
    { id: 'credits', label: 'Credits', icon: Coins },
    { id: 'nexus', label: 'Nexus Pass', icon: Crown },
  ];
  return (
    <div className="flex gap-1 px-4 mb-4 overflow-x-auto" data-testid="store-tab-bar">
      {tabs.map(t => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap text-xs font-medium transition-all"
            style={{
              background: isActive ? 'rgba(252,211,77,0.1)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isActive ? 'rgba(252,211,77,0.2)' : 'rgba(255,255,255,0.04)'}`,
              color: isActive ? '#FCD34D' : 'rgba(248,250,252,0.5)',
            }}
            data-testid={`store-tab-${t.id}`}>
            <Icon size={12} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function ConsumableCard({ item, onBuy, onUse }) {
  const Icon = ICON_MAP[item.icon] || Zap;
  const owned = item.owned_quantity > 0;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-3 mb-2" style={{ background: `${item.color}04`, border: `1px solid ${item.color}12` }}
      data-testid={`consumable-${item.id}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${item.color}12` }}>
          <Icon size={18} color={item.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>{item.name}</h3>
            <span className="text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase"
              style={{ background: `${RARITY_COLORS[item.rarity]}15`, color: RARITY_COLORS[item.rarity] }}>
              {item.rarity}
            </span>
          </div>
          <p className="text-[10px] mb-2" style={{ color: 'rgba(248,250,252,0.45)' }}>{item.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Coins size={10} color="#FCD34D" />
                <span className="text-[10px] font-bold" style={{ color: '#FCD34D' }}>{item.price_credits}</span>
              </div>
              <span className="text-[8px]" style={{ color: 'rgba(248,250,252,0.25)' }}>
                {item.quantity_per_purchase > 1 ? `×${item.quantity_per_purchase}` : ''} · {item.duration_minutes}min
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {owned && (
                <>
                  <span className="text-[9px] px-2 py-0.5 rounded-lg font-bold"
                    style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
                    ×{item.owned_quantity}
                  </span>
                  <button onClick={() => onUse(item.id)}
                    className="px-2.5 py-1 rounded-lg text-[9px] font-bold"
                    style={{ background: `${item.color}18`, color: item.color, border: `1px solid ${item.color}25` }}
                    data-testid={`use-${item.id}`}>
                    Use
                  </button>
                </>
              )}
              <button onClick={() => onBuy(item.id)}
                className="px-2.5 py-1 rounded-lg text-[9px] font-bold"
                disabled={!item.can_afford}
                style={{
                  background: item.can_afford ? 'rgba(252,211,77,0.12)' : 'rgba(255,255,255,0.03)',
                  color: item.can_afford ? '#FCD34D' : 'rgba(248,250,252,0.2)',
                  border: `1px solid ${item.can_afford ? 'rgba(252,211,77,0.2)' : 'rgba(255,255,255,0.05)'}`,
                  opacity: item.can_afford ? 1 : 0.5,
                }}
                data-testid={`buy-${item.id}`}>
                Buy
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CosmeticCard({ item, onBuy, onEquip }) {
  const Icon = ICON_MAP[item.icon] || Sparkles;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-3 mb-2" style={{ background: `${item.color}04`, border: `1px solid ${item.color}12` }}
      data-testid={`cosmetic-${item.id}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
          style={{ background: `${item.color}12` }}>
          <Icon size={18} color={item.color} />
          {item.effect === 'aura' && (
            <motion.div className="absolute inset-0 rounded-xl"
              animate={{ boxShadow: [`0 0 8px ${item.color}20`, `0 0 20px ${item.color}40`, `0 0 8px ${item.color}20`] }}
              transition={{ duration: 2, repeat: Infinity }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>{item.name}</h3>
            {item.owned && <Check size={10} color="#22C55E" />}
          </div>
          <p className="text-[10px] mb-2" style={{ color: 'rgba(248,250,252,0.45)' }}>{item.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Coins size={10} color="#FCD34D" />
              <span className="text-[10px] font-bold" style={{ color: '#FCD34D' }}>{item.price_credits}</span>
              <span className="text-[8px] ml-1" style={{ color: 'rgba(248,250,252,0.25)' }}>Permanent</span>
            </div>
            {item.owned ? (
              <button onClick={() => onEquip(item.id)}
                className="px-2.5 py-1 rounded-lg text-[9px] font-bold"
                style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}20` }}
                data-testid={`equip-${item.id}`}>
                Equip
              </button>
            ) : (
              <button onClick={() => onBuy(item.id)}
                disabled={!item.can_afford}
                className="px-2.5 py-1 rounded-lg text-[9px] font-bold"
                style={{
                  background: item.can_afford ? 'rgba(252,211,77,0.12)' : 'rgba(255,255,255,0.03)',
                  color: item.can_afford ? '#FCD34D' : 'rgba(248,250,252,0.2)',
                  opacity: item.can_afford ? 1 : 0.5,
                }}
                data-testid={`buy-cosmetic-${item.id}`}>
                Buy
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CreditPackageCard({ pkg, onBuy }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-3 mb-2 relative overflow-hidden"
      style={{
        background: pkg.popular ? 'rgba(252,211,77,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${pkg.popular ? 'rgba(252,211,77,0.2)' : 'rgba(255,255,255,0.05)'}`,
      }}
      data-testid={`credit-pkg-${pkg.id}`}>
      {pkg.popular && (
        <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[7px] font-bold uppercase"
          style={{ background: 'rgba(252,211,77,0.15)', color: '#FCD34D' }}>
          Best Value
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(252,211,77,0.08)' }}>
            <Coins size={18} color="#FCD34D" />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>{pkg.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>{pkg.price_display}</span>
              {pkg.bonus > 0 && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-md font-bold"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
                  +{pkg.bonus} BONUS
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => onBuy(pkg.id)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, rgba(252,211,77,0.15), rgba(245,158,11,0.15))',
            color: '#FCD34D',
            border: '1px solid rgba(252,211,77,0.2)',
          }}
          data-testid={`buy-credit-${pkg.id}`}>
          Buy
        </button>
      </div>
    </motion.div>
  );
}

function NexusPassSection({ nexus, onSubscribe }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="mx-4 rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(252,211,77,0.05), rgba(239,68,68,0.03))',
        border: '1px solid rgba(252,211,77,0.15)',
      }}
      data-testid="nexus-pass-section">
      {/* Glow effect */}
      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.02, 0.06, 0.02] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(252,211,77,0.08), transparent 70%)' }} />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(252,211,77,0.12)' }}>
            <Crown size={20} color="#FCD34D" />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: '#FCD34D' }}>{nexus.name}</h2>
            <span className="text-[10px]" style={{ color: 'rgba(248,250,252,0.5)' }}>{nexus.price_display}</span>
          </div>
          {nexus.is_subscribed && (
            <div className="ml-auto px-2 py-1 rounded-lg text-[9px] font-bold"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>
              Active
            </div>
          )}
        </div>

        <p className="text-[10px] mb-3" style={{ color: 'rgba(248,250,252,0.5)' }}>{nexus.description}</p>

        <div className="space-y-1.5 mb-4">
          {nexus.perks.map((perk, i) => (
            <div key={i} className="flex items-center gap-2">
              <Star size={8} color="#FCD34D" style={{ flexShrink: 0 }} />
              <span className="text-[10px]" style={{ color: 'rgba(248,250,252,0.6)' }}>{perk}</span>
            </div>
          ))}
        </div>

        {!nexus.is_subscribed ? (
          <button onClick={onSubscribe}
            className="w-full py-2.5 rounded-xl text-sm font-bold"
            style={{
              background: 'linear-gradient(135deg, rgba(252,211,77,0.2), rgba(245,158,11,0.15))',
              color: '#FCD34D',
              border: '1px solid rgba(252,211,77,0.25)',
            }}
            data-testid="subscribe-nexus-btn">
            Subscribe — {nexus.price_display}
          </button>
        ) : (
          <div className="text-center py-2 text-[10px]" style={{ color: 'rgba(34,197,94,0.8)' }}>
            Subscribed until {new Date(nexus.sub_expires).toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ActiveEffectsBanner({ effects }) {
  const effectList = Object.entries(effects);
  if (effectList.length === 0) return null;
  const LABELS = {
    disable_distortion: { name: 'Clear Vision', icon: Eye, color: '#22C55E' },
    rare_only_scanner: { name: '963Hz Tuner', icon: Radio, color: '#A855F7' },
    speed_boost_3x: { name: '3× Speed', icon: Zap, color: '#EF4444' },
    double_inventory: { name: '2× Payload', icon: Package, color: '#F59E0B' },
    layer_warp: { name: 'Warp Key', icon: Key, color: '#FCD34D' },
  };

  return (
    <div className="px-4 mb-3" data-testid="active-effects-banner">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {effectList.map(([etype, edata]) => {
          const meta = LABELS[etype] || { name: etype, icon: Zap, color: '#A855F7' };
          const Icon = meta.icon;
          const remaining = Math.max(0, Math.round((new Date(edata.expires_at) - Date.now()) / 60000));
          return (
            <div key={etype} className="flex items-center gap-1.5 px-2 py-1 rounded-lg whitespace-nowrap"
              style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}18` }}>
              <Icon size={10} color={meta.color} />
              <span className="text-[8px] font-bold" style={{ color: meta.color }}>{meta.name}</span>
              <span className="text-[7px]" style={{ color: 'rgba(248,250,252,0.3)' }}>{remaining}m</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CosmicStore() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const latency = useLatency();
  const headers = authHeaders;
  const controller = useGameController('marketplace');

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('consumables');
  const [purchasing, setPurchasing] = useState(false);

  const fetchStore = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/marketplace/store`, { headers });
      setStore(res.data);
    } catch (err) {
      toast.error('Failed to load store');
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => { fetchStore(); }, [fetchStore]);

  const handleBuyItem = async (itemId) => {
    setPurchasing(true);
    latency?.startPulse('store_buy');
    try {
      const res = await axios.post(`${API}/marketplace/buy-item`, { item_id: itemId }, { headers });
      latency?.endPulse('store_buy', true);
      toast.success(`Purchased ${res.data.item.name}!`);
      fetchStore();
      controller.refreshState();
    } catch (err) {
      latency?.endPulse('store_buy', false);
      toast.error(err.response?.data?.detail || 'Purchase failed');
    }
    setPurchasing(false);
  };

  const handleUseItem = async (itemId) => {
    try {
      const res = await axios.post(`${API}/marketplace/use-item`, { item_id: itemId }, { headers });
      toast.success(`${res.data.item_name} activated!`);
      fetchStore();
      controller.refreshState();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Activation failed');
    }
  };

  const handleEquipCosmetic = async (itemId) => {
    try {
      await axios.post(`${API}/marketplace/equip-cosmetic`, { item_id: itemId }, { headers });
      toast.success('Cosmetic equipped!');
      fetchStore();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Equip failed');
    }
  };

  const handleBuyCredits = async (packageId) => {
    setPurchasing(true);
    try {
      const baseUrl = window.location.origin;
      const res = await axios.post(`${API}/marketplace/buy-credits`, {
        package_id: packageId,
        success_url: `${baseUrl}/cosmic-store?payment=success`,
        cancel_url: `${baseUrl}/cosmic-store?payment=cancelled`,
        webhook_url: `${process.env.REACT_APP_BACKEND_URL}/api/webhook/stripe`,
      }, { headers });
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Checkout failed');
    }
    setPurchasing(false);
  };

  const handleSubscribeNexus = async () => {
    setPurchasing(true);
    try {
      const baseUrl = window.location.origin;
      const res = await axios.post(`${API}/marketplace/subscribe-nexus`, {
        success_url: `${baseUrl}/cosmic-store?nexus=subscribed`,
        cancel_url: `${baseUrl}/cosmic-store?nexus=cancelled`,
        webhook_url: `${process.env.REACT_APP_BACKEND_URL}/api/webhook/stripe`,
      }, { headers });
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Subscription checkout failed');
    }
    setPurchasing(false);
  };

  if (loading || controller.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Gem size={24} color="#FCD34D" />
        </motion.div>
      </div>
    );
  }

  const credits = store?.cosmic_credits || 0;

  return (
    <GameModuleWrapper
      harmonyScore={controller.harmonyScore}
      dominantElement={controller.dominantElement}
      dominantPercentage={controller.dominantPercentage}
      harmonyCycle={controller.harmonyCycle}
      decayActivity={controller.decayActivity}
      layerData={controller.layerData}
      activeLayer={controller.activeLayer}
      visualDirectives={controller.visualDirectives}
      biomeContext={controller.biomeContext}
      clearVisionActive={controller.clearVisionActive}
      moduleName="cosmic-store">

      <div className="min-h-screen pb-24" data-testid="cosmic-store-page">
        <StoreHeader credits={credits} onBack={() => navigate(-1)} />

        {/* Active Effects */}
        <ActiveEffectsBanner effects={store?.active_effects || {}} />

        <TabBar active={activeTab} onTab={setActiveTab} />

        <div className="px-4">
          <AnimatePresence mode="wait">
            {activeTab === 'consumables' && (
              <motion.div key="consumables" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} color="#F59E0B" />
                  <h2 className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Consumables</h2>
                  <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>Temporary boosts & tools</span>
                </div>
                {(store?.consumables || []).map(item => (
                  <ConsumableCard key={item.id} item={item} onBuy={handleBuyItem} onUse={handleUseItem} />
                ))}
              </motion.div>
            )}

            {activeTab === 'cosmetics' && (
              <motion.div key="cosmetics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} color="#A855F7" />
                  <h2 className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Cosmetics</h2>
                  <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>Auras & Premium Themes</span>
                </div>
                {(store?.cosmetics || []).map(item => (
                  <CosmeticCard key={item.id} item={item} onBuy={handleBuyItem} onEquip={handleEquipCosmetic} />
                ))}
              </motion.div>
            )}

            {activeTab === 'credits' && (
              <motion.div key="credits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-2 mb-3">
                  <Coins size={14} color="#FCD34D" />
                  <h2 className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Cosmic Credits</h2>
                  <span className="text-[9px]" style={{ color: 'rgba(248,250,252,0.3)' }}>Purchase premium currency</span>
                </div>

                {/* Dev: Grant test credits */}
                <button onClick={async () => {
                  try {
                    const res = await axios.post(`${API}/marketplace/grant-test-credits`, { amount: 500 }, { headers });
                    toast.success(`Granted ${res.data.granted} test credits!`);
                    fetchStore();
                    controller.refreshState();
                  } catch { toast.error('Failed to grant credits'); }
                }}
                  className="w-full mb-3 py-2 rounded-xl text-[10px] font-medium"
                  style={{ background: 'rgba(34,197,94,0.06)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.1)' }}
                  data-testid="grant-test-credits-btn">
                  Grant 500 Test Credits (Dev)
                </button>

                {(store?.credit_packages || []).map(pkg => (
                  <CreditPackageCard key={pkg.id} pkg={pkg} onBuy={handleBuyCredits} />
                ))}

                {/* Sell-back section */}
                <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={12} color="#F59E0B" />
                    <h3 className="text-xs font-bold" style={{ color: '#F8FAFC' }}>Mineral Exchange Rates</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { rarity: 'Common', value: 1, color: '#9CA3AF' },
                      { rarity: 'Uncommon', value: 3, color: '#22C55E' },
                      { rarity: 'Rare', value: 8, color: '#3B82F6' },
                      { rarity: 'Epic', value: 20, color: '#A855F7' },
                      { rarity: 'Legendary', value: 50, color: '#FCD34D' },
                      { rarity: 'Mythic', value: 150, color: '#EF4444' },
                    ].map(r => (
                      <div key={r.rarity} className="text-center p-2 rounded-lg"
                        style={{ background: `${r.color}06`, border: `1px solid ${r.color}10` }}>
                        <div className="text-[8px] font-bold uppercase" style={{ color: r.color }}>{r.rarity}</div>
                        <div className="flex items-center justify-center gap-0.5 mt-0.5">
                          <Coins size={8} color="#FCD34D" />
                          <span className="text-[10px] font-bold" style={{ color: '#FCD34D' }}>{r.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] mt-2 text-center" style={{ color: 'rgba(248,250,252,0.25)' }}>
                    Sell minerals from Rock Hounding to earn Cosmic Credits
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'nexus' && store?.nexus_subscription && (
              <motion.div key="nexus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <NexusPassSection nexus={store.nexus_subscription} onSubscribe={handleSubscribeNexus} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GameModuleWrapper>
  );
}
