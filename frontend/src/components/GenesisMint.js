import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  Star, Key, Eye, Cpu, Shield, Zap, Gem,
  Sparkles, Crown, Check
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MINT_TYPES = [
  { id: 'resonator_key', name: 'Genesis Resonator Key', icon: Key, desc: 'A master key to all frequency gates — 3 uses, 10x potency', color: '#FBBF24' },
  { id: 'focus_lens', name: 'Genesis Focus Lens', icon: Eye, desc: '72-hour Ultra fidelity extension — the ultimate lens', color: '#3B82F6' },
  { id: 'resource_harvester', name: 'Genesis Harvester', icon: Cpu, desc: '48 hours of 20 Dust/hr automated collection', color: '#22C55E' },
  { id: 'passive_buff', name: 'Genesis Buff', icon: Shield, desc: '+50% all stats for a full week', color: '#A855F7' },
  { id: 'active_mantra', name: 'Genesis Mantra', icon: Zap, desc: '10x power aura flash for 2 hours, no cooldown', color: '#EF4444' },
  { id: 'skill_bottle', name: 'Genesis Skill Bottle', icon: Gem, desc: '10 uses, 10x potency — the most valuable Trade Circle asset', color: '#F59E0B' },
];

export default function GenesisMint({ isFounder, genesisMinted, onMinted }) {
  const { authHeaders } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [context, setContext] = useState('');
  const [minting, setMinting] = useState(false);
  const [mintedItem, setMintedItem] = useState(null);

  const handleMint = useCallback(async () => {
    if (!selectedType) { toast.error('Select a Genesis type'); return; }
    setMinting(true);
    try {
      const res = await axios.post(`${API}/forge/genesis/mint`, {
        type: selectedType,
        context: context || 'Founding Architect Legacy',
      }, { headers: authHeaders });
      setMintedItem(res.data.item);
      toast.success(res.data.message);
      onMinted?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Minting failed');
    }
    setMinting(false);
  }, [selectedType, context, authHeaders, onMinted]);

  if (!isFounder) return null;

  if (genesisMinted || mintedItem) {
    return (
      <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(255,251,235,0.03))', border: '1px solid rgba(251,191,36,0.12)' }} data-testid="genesis-minted">
        <div className="flex items-center gap-2 mb-2">
          <Star size={14} style={{ color: '#FBBF24' }} />
          <span className="text-xs font-bold" style={{ color: '#FBBF24' }}>Genesis Minted</span>
          <Check size={12} style={{ color: '#22C55E' }} />
        </div>
        {mintedItem && (
          <div className="rounded-lg p-3" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{mintedItem.name}</p>
            <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{mintedItem.description}</p>
            <span className="inline-block mt-1 text-[8px] px-1.5 py-0.5 rounded uppercase font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>LEGENDARY • 1-of-1</span>
          </div>
        )}
        {!mintedItem && <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Your eternal Genesis artifact has been forged.</p>}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(255,251,235,0.03))', border: '1px solid rgba(251,191,36,0.12)' }}
      data-testid="genesis-mint-panel">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Crown size={14} style={{ color: '#FBBF24' }} />
          <h3 className="text-sm font-bold" style={{ color: '#FBBF24' }}>Founder's Minting</h3>
        </div>
        <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
          As a Founding Architect, forge ONE unique, 1-of-1 Genesis artifact. This is permanent and cannot be undone.
        </p>

        {/* Type Selection */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {MINT_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all"
              style={{
                background: selectedType === t.id ? `${t.color}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedType === t.id ? `${t.color}30` : 'rgba(255,255,255,0.05)'}`,
              }}
              data-testid={`genesis-type-${t.id}`}
            >
              <t.icon size={12} style={{ color: selectedType === t.id ? t.color : 'var(--text-muted)' }} />
              <div>
                <p className="text-[10px] font-medium" style={{ color: selectedType === t.id ? t.color : 'var(--text-secondary)' }}>{t.name}</p>
                <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Context Input */}
        <input
          type="text"
          value={context}
          onChange={e => setContext(e.target.value)}
          placeholder="Name your legacy (optional)"
          className="w-full px-3 py-2 rounded-lg text-xs outline-none mb-3"
          style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.06)' }}
          data-testid="genesis-context-input"
        />

        {/* Mint Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleMint}
          disabled={!selectedType || minting}
          className="w-full py-2.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15))',
            color: '#FBBF24',
            border: '1px solid rgba(251,191,36,0.25)',
          }}
          data-testid="genesis-mint-btn"
        >
          <Star size={12} className="inline mr-1.5" />
          {minting ? 'Forging your Genesis...' : 'Forge Genesis Artifact'}
        </motion.button>
      </div>
    </motion.div>
  );
}
