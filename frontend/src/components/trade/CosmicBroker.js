import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Coins, ShoppingBag, ArrowDownUp, Gem, Wind, Cpu,
  ChevronRight, Minus, Plus, Sparkles, CreditCard, Lock
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function CreditPackCard({ pack, onBuy, buying }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      className="relative rounded-xl overflow-hidden cursor-pointer group"
      style={{
        background: 'rgba(248,250,252,0.02)',
        border: '1px solid rgba(234,179,8,0.12)',
      }}
      onClick={() => onBuy(pack.id)}
      data-testid={`broker-pack-${pack.id}`}
    >
      {pack.bonus > 0 && (
        <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[8px] font-bold"
          style={{ background: 'rgba(234,179,8,0.15)', color: '#EAB308' }}>
          +{pack.bonus} BONUS
        </div>
      )}
      <div className="p-4 text-center">
        <Coins size={20} className="mx-auto mb-2" style={{ color: '#EAB308' }} />
        <p className="text-lg font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          {pack.credits + pack.bonus}
        </p>
        <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          {pack.name}
        </p>
        <div className="py-1.5 rounded-lg text-xs font-medium transition-all group-hover:scale-105"
          style={{
            background: 'rgba(234,179,8,0.1)',
            color: '#EAB308',
            border: '1px solid rgba(234,179,8,0.2)',
          }}>
          {buying ? 'Processing...' : pack.price_display}
        </div>
      </div>
    </motion.div>
  );
}

function MerchantItem({ item, credits, onBuy }) {
  const iconMap = { dust: Wind, gems: Gem, component: Cpu };
  const Icon = iconMap[item.type] || ShoppingBag;
  const canAfford = credits >= item.price_credits;
  const tierColors = { base: '#94A3B8', medium: '#2DD4BF', premium: '#EAB308' };
  const tierColor = tierColors[item.tier] || '#94A3B8';

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="rounded-xl p-3 flex items-center gap-3 group"
      style={{
        background: 'rgba(248,250,252,0.02)',
        border: `1px solid rgba(248,250,252,0.06)`,
      }}
      data-testid={`merchant-item-${item.id}`}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)' }}>
        <Icon size={16} style={{ color: '#C084FC' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
          {item.discount > 0 && (
            <span className="text-[7px] px-1 py-0.5 rounded-full font-bold flex-shrink-0"
              style={{ background: `${tierColor}15`, color: tierColor, border: `1px solid ${tierColor}25` }}>
              {item.discount}% OFF
            </span>
          )}
        </div>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
      </div>
      <button
        onClick={() => onBuy(item.id)}
        disabled={!canAfford}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
        style={{
          background: canAfford ? 'rgba(234,179,8,0.1)' : 'rgba(248,250,252,0.02)',
          color: canAfford ? '#EAB308' : 'var(--text-muted)',
          border: `1px solid ${canAfford ? 'rgba(234,179,8,0.2)' : 'rgba(248,250,252,0.06)'}`,
          opacity: canAfford ? 1 : 0.5,
        }}
        data-testid={`buy-item-${item.id}`}
      >
        <Coins size={10} /> {item.price_credits}
      </button>
    </motion.div>
  );
}

function SellPanel({ wallet, authHeaders, onRefresh }) {
  const [resource, setResource] = useState('dust');
  const [amount, setAmount] = useState(100);
  const [selling, setSelling] = useState(false);

  const rates = { dust: { per: 200, label: '200 Dust = 1 Credit (base)' }, gems: { per: 15, label: '15 Gems = 1 Credit (base)' } };
  const max = resource === 'dust' ? wallet.dust : wallet.gems;
  const rawCredits = Math.max(1, Math.floor(amount / rates[resource].per));
  const penalty = Math.max(1, Math.floor(rawCredits * 0.30));
  const creditsEarned = Math.max(1, rawCredits - penalty);

  const handleSell = async () => {
    if (amount <= 0 || amount > max) return;
    setSelling(true);
    try {
      const res = await axios.post(`${API}/trade-circle/ai-merchant/sell`, { resource, amount }, { headers: authHeaders });
      toast.success(`Sold ${amount} ${resource} for ${res.data.credits_earned} credits (${res.data.processing_fee_pct}% fee applied)`);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Sale failed');
    }
    setSelling(false);
  };

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.06)' }}>
      <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--text-muted)' }}>Sell Back to Broker</p>
      <div className="flex gap-2 mb-3">
        {['dust', 'gems'].map(r => (
          <button key={r} onClick={() => { setResource(r); setAmount(100); }}
            className="flex-1 py-2 rounded-lg text-xs capitalize transition-all"
            style={{
              background: resource === r ? 'rgba(192,132,252,0.08)' : 'transparent',
              color: resource === r ? '#C084FC' : 'var(--text-muted)',
              border: `1px solid ${resource === r ? 'rgba(192,132,252,0.15)' : 'rgba(248,250,252,0.06)'}`,
            }}
            data-testid={`sell-${r}-tab`}>
            {r === 'dust' ? <Wind size={12} className="inline mr-1" /> : <Gem size={12} className="inline mr-1" />}
            {r} ({r === 'dust' ? wallet.dust : wallet.gems})
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => setAmount(Math.max(1, amount - 50))} className="p-1.5 rounded-lg hover:bg-white/5">
          <Minus size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
        <input type="number" value={amount} onChange={e => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
          className="flex-1 text-center py-1.5 rounded-lg text-sm outline-none"
          style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
          data-testid="sell-amount-input" />
        <button onClick={() => setAmount(Math.min(max, amount + 50))} className="p-1.5 rounded-lg hover:bg-white/5">
          <Plus size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>
      <p className="text-[10px] text-center mb-1" style={{ color: 'var(--text-muted)' }}>
        {rates[resource].label}
      </p>
      {/* 30% Penalty Breakdown */}
      <div className="rounded-lg p-2 mb-3 text-center" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.08)' }}>
        <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
          Base: <span style={{ color: '#818CF8' }}>{rawCredits}</span>
          &nbsp;&middot;&nbsp;
          <span style={{ color: '#EF4444' }}>30% Processing Fee: -{penalty}</span>
          &nbsp;&middot;&nbsp;
          You receive: <span style={{ color: '#22C55E' }}>{creditsEarned} Credits</span>
        </p>
      </div>
      <button onClick={handleSell} disabled={selling || amount <= 0 || amount > max}
        className="w-full py-2 rounded-lg text-xs font-medium transition-all"
        style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' }}
        data-testid="sell-confirm-btn">
        {selling ? 'Selling...' : `Sell ${amount} ${resource}`}
      </button>
    </div>
  );
}

export default function CosmicBroker({ authHeaders }) {
  const [catalog, setCatalog] = useState(null);
  const [wallet, setWallet] = useState({ credits: 0, dust: 0, gems: 0 });
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState('');
  const [section, setSection] = useState('buy');

  const fetchData = useCallback(async () => {
    try {
      const [catRes, walletRes, packsRes] = await Promise.all([
        axios.get(`${API}/trade-circle/ai-merchant`, { headers: authHeaders }),
        axios.get(`${API}/trade-circle/wallet`, { headers: authHeaders }),
        axios.get(`${API}/trade-circle/broker/packs`, { headers: authHeaders }),
      ]);
      setCatalog(catRes.data);
      setWallet(walletRes.data);
      setPacks(packsRes.data.packs || []);
    } catch {}
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBuyCredits = async (packId) => {
    setBuying(packId);
    try {
      const baseUrl = window.location.origin;
      const res = await axios.post(`${API}/trade-circle/broker/buy-credits`, {
        pack_id: packId,
        success_url: `${baseUrl}/trade-circle?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/trade-circle?payment=cancelled`,
        webhook_url: `${process.env.REACT_APP_BACKEND_URL}/api/webhook/stripe`,
      }, { headers: authHeaders });
      window.location.href = res.data.checkout_url;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Payment failed');
      setBuying('');
    }
  };

  const handleBuyItem = async (itemId) => {
    try {
      const res = await axios.post(`${API}/trade-circle/ai-merchant/buy`, {
        item_id: itemId, quantity: 1,
      }, { headers: authHeaders });
      toast.success(`Purchased ${res.data.purchased}! -${res.data.credits_spent} Credits`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Purchase failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(234,179,8,0.2)', borderTopColor: '#EAB308' }} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="cosmic-broker-panel">
      {/* Broker Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(192,132,252,0.08))',
            border: '1px solid rgba(234,179,8,0.2)',
          }}>
          <Sparkles size={28} style={{ color: '#EAB308' }} />
        </div>
        <h2 className="text-lg font-light" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          The Cosmic Broker
        </h2>
        <p className="text-[10px] mt-1 italic" style={{ color: 'var(--text-muted)' }}>
          {catalog?.merchant_message || "Welcome, Traveler. I trade in certainties."}
        </p>
      </div>

      {/* Wallet Strip */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { label: 'Credits', value: wallet.credits, icon: Coins, color: '#EAB308' },
          { label: 'Dust', value: wallet.dust, icon: Wind, color: '#C084FC' },
          { label: 'Gems', value: wallet.gems, icon: Gem, color: '#2DD4BF' },
        ].map(w => (
          <div key={w.label} className="glass-card p-3 text-center" data-testid={`wallet-${w.label.toLowerCase()}`}>
            <w.icon size={14} className="mx-auto mb-1" style={{ color: w.color }} />
            <p className="text-base font-light" style={{ color: w.color, fontFamily: 'Cormorant Garamond, serif' }}>{w.value}</p>
            <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{w.label}</p>
          </div>
        ))}
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: 'rgba(248,250,252,0.02)' }}>
        {[
          { id: 'buy', label: 'Buy Credits', icon: CreditCard },
          { id: 'catalog', label: 'Merchant Goods', icon: ShoppingBag },
          { id: 'sell', label: 'Sell Back', icon: ArrowDownUp },
        ].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="flex-1 py-2 rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-all"
            style={{
              background: section === s.id ? 'rgba(234,179,8,0.08)' : 'transparent',
              color: section === s.id ? '#EAB308' : 'var(--text-muted)',
              border: section === s.id ? '1px solid rgba(234,179,8,0.12)' : '1px solid transparent',
            }}
            data-testid={`broker-section-${s.id}`}>
            <s.icon size={12} /> {s.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Buy Credits */}
        {section === 'buy' && (
          <motion.div key="buy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Lock size={12} style={{ color: 'var(--text-muted)' }} />
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Secure Stripe checkout. Credits are added instantly upon payment.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="credit-packs-grid">
              {packs.map(p => (
                <CreditPackCard key={p.id} pack={p} onBuy={handleBuyCredits} buying={buying === p.id} />
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                Resonance Fee: <span style={{ color: '#EAB308' }}>{catalog?.resonance_fee_pct || 5}%</span> on all P2P escrow trades
              </p>
            </div>
          </motion.div>
        )}

        {/* Merchant Catalog */}
        {section === 'catalog' && (
          <motion.div key="catalog" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="space-y-2" data-testid="merchant-catalog">
              {(catalog?.catalog || []).map(item => (
                <MerchantItem key={item.id} item={item} credits={wallet.credits} onBuy={handleBuyItem} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Sell Back */}
        {section === 'sell' && (
          <motion.div key="sell" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <SellPanel wallet={wallet} authHeaders={authHeaders} onRefresh={fetchData} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
