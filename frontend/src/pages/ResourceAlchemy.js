import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Gem, Pickaxe, FlaskConical, Sparkles, ChevronRight, Lock } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TIER_COLORS = ['#94A3B8', '#F97316', '#E2E8F0', '#FCD34D', '#A855F7', '#1E293B', '#2DD4BF'];

export default function ResourceAlchemy() {
  const { authHeaders, token } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forging, setForging] = useState(false);
  const [mining, setMining] = useState(false);

  const fetchState = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${API}/gaming/alchemy/state`, { headers: authHeaders });
      setState(data);
    } catch { toast.error('Failed to load alchemy state'); }
    finally { setLoading(false); }
  }, [authHeaders, token]);

  useEffect(() => { fetchState(); }, [fetchState]);
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('forge_creation', 20); }, []);

  const handleMine = async () => {
    setMining(true);
    try {
      const { data } = await axios.post(`${API}/gaming/alchemy/mine`, {}, { headers: authHeaders });
      toast.success(`Mined: ${Object.entries(data.mined).map(([k, v]) => `${v} ${k}`).join(', ')} (+${data.dust_earned} Dust)`);
      fetchState();
    } catch (e) { toast.error(e.response?.data?.detail || 'Mining failed'); }
    finally { setMining(false); }
  };

  const handleForge = async (idx) => {
    setForging(true);
    try {
      const { data } = await axios.post(`${API}/gaming/alchemy/forge`, { recipe_index: idx }, { headers: authHeaders });
      toast.success(`Forged ${data.forged}! +${data.dust_earned} Dust`);
      fetchState();
    } catch (e) { toast.error(e.response?.data?.detail || 'Forge failed'); }
    finally { setForging(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}><Sparkles className="animate-spin" color="#A855F7" /></div>;

  const inv = state?.inventory || {};
  const recipes = state?.recipes || [];
  const elements = state?.elements || {};

  return (
    <div className="min-h-screen pb-40" style={{ background: 'transparent' }} data-testid="resource-alchemy-page">
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-40" style={{ background: 'rgba(3,3,8,0.9)', backdropFilter: 'none'}}>
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} data-testid="alchemy-back-btn"><ArrowLeft size={16} color="#F8FAFC" /></button>
        <h1 className="text-sm font-bold" style={{ color: '#F8FAFC' }}>Resource Alchemy</h1>
        <div className="text-[10px]" style={{ color: '#A855F7' }}>Forged: {state?.forged_count || 0}</div>
      </div>
      <div className="px-4 pt-2">
        {/* Inventory */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold" style={{ color: '#F8FAFC' }}>Inventory</span>
            <button onClick={handleMine} disabled={mining} className="px-3 py-1.5 rounded-lg text-[10px] font-bold" style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: '#F97316' }} data-testid="mine-btn">{mining ? 'Mining...' : 'Mine Resources'}</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(elements).map(([name, el]) => (
              <div key={name} className="rounded-lg px-3 py-2 text-center" style={{ background: `${el.color}10`, border: `1px solid ${el.color}25`, minWidth: 70 }}>
                <div className="text-lg font-bold" style={{ color: el.color }}>{inv[name] || 0}</div>
                <div className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>{name}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Recipes */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-xs font-bold mb-3" style={{ color: '#F8FAFC' }}>Forge Recipes</div>
          <div className="space-y-2">
            {recipes.map((r, i) => {
              const needed = {};
              r.inputs.forEach(item => { needed[item] = (needed[item] || 0) + 1; });
              const canForge = Object.entries(needed).every(([item, count]) => (inv[item] || 0) >= count);
              const outEl = elements[r.output] || {};
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: canForge ? `${outEl.color}08` : 'rgba(255,255,255,0.02)', border: `1px solid ${canForge ? `${outEl.color}20` : 'rgba(255,255,255,0.04)'}` }}>
                  <div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>{r.inputs.join(' + ')}</div>
                    <div className="text-sm font-bold flex items-center gap-1" style={{ color: outEl.color || '#F8FAFC' }}>
                      <ChevronRight size={10} /> {r.output} <span className="text-[9px] font-normal" style={{ color: '#A855F7' }}>+{r.dust_reward} Dust</span>
                    </div>
                  </div>
                  <button onClick={() => handleForge(i)} disabled={!canForge || forging} className="px-3 py-1.5 rounded-lg text-[10px] font-bold" style={{ background: canForge ? `${outEl.color}15` : 'rgba(255,255,255,0.03)', border: `1px solid ${canForge ? `${outEl.color}30` : 'rgba(255,255,255,0.05)'}`, color: canForge ? outEl.color : 'rgba(255,255,255,0.6)' }} data-testid={`forge-btn-${i}`}>{forging ? '...' : 'Forge'}</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
