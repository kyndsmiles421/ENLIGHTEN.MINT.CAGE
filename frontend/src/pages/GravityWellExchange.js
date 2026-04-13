import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, TrendingUp, TrendingDown, ShoppingCart, DollarSign, Sparkles } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function GravityWellExchange() {
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [market, setMarket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [trading, setTrading] = useState(false);

  const fetchMarket = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/gaming/gravity-well/market`, { headers: authHeaders });
      setMarket(data.market);
    } catch { toast.error('Failed to load market'); }
    finally { setLoading(false); }
  }, [authHeaders]);

  useEffect(() => { fetchMarket(); }, [fetchMarket]);
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('trade_listing', 16); }, []);

  const handleTrade = async (action) => {
    if (!selected) return;
    setTrading(true);
    try {
      const { data } = await axios.post(`${API}/gaming/gravity-well/trade`, { action, element: selected.element, quantity }, { headers: authHeaders });
      toast.success(`${action === 'buy' ? 'Bought' : 'Sold'} ${quantity} ${selected.element} for ${data.total} Dust`);
      fetchMarket();
    } catch (e) { toast.error(e.response?.data?.detail || 'Trade failed'); }
    finally { setTrading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#030308' }}><Sparkles className="animate-spin" color="#2DD4BF" /></div>;

  return (
    <div className="min-h-screen pb-24" style={{ background: '#030308' }} data-testid="gravity-well-page">
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-40" style={{ background: 'rgba(3,3,8,0.9)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} data-testid="gravity-back-btn"><ArrowLeft size={16} color="#F8FAFC" /></button>
        <h1 className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Gravity Well Exchange</h1>
        <div />
      </div>
      <div className="px-4 pt-2">
        {/* Market Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {market.map(m => (
            <button key={m.element} onClick={() => setSelected(m)}
              className="rounded-xl p-3 text-left transition-all" style={{ background: selected?.element === m.element ? `${m.color}12` : 'rgba(255,255,255,0.03)', border: `1px solid ${selected?.element === m.element ? `${m.color}30` : 'rgba(255,255,255,0.06)'}` }}
              data-testid={`market-${m.element}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold capitalize" style={{ color: m.color }}>{m.element}</span>
                {m.trend === 'up' ? <TrendingUp size={10} color="#22C55E" /> : <TrendingDown size={10} color="#EF4444" />}
              </div>
              <div className="text-lg font-bold" style={{ color: '#F8FAFC' }}>{m.price_dust}</div>
              <div className="text-[9px]" style={{ color: 'rgba(248,250,252,0.4)' }}>Dust/unit | T{m.tier}</div>
            </button>
          ))}
        </div>
        {/* Trade Panel */}
        {selected && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${selected.color}20` }}>
            <div className="text-xs font-bold mb-2 capitalize" style={{ color: selected.color }}>{selected.element} — {selected.price_dust} Dust/unit</div>
            <div className="flex items-center gap-2 mb-3">
              <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={100}
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC' }} data-testid="trade-quantity" />
              <span className="text-xs" style={{ color: 'rgba(248,250,252,0.5)' }}>= {selected.price_dust * quantity} Dust</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleTrade('buy')} disabled={trading} className="flex-1 py-2.5 rounded-xl text-xs font-bold" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E' }} data-testid="buy-btn">{trading ? '...' : 'Buy'}</button>
              <button onClick={() => handleTrade('sell')} disabled={trading} className="flex-1 py-2.5 rounded-xl text-xs font-bold" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }} data-testid="sell-btn">{trading ? '...' : 'Sell'}</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
