/**
 * StoreView.js — Mixer Store full-page takeover
 * Extracted from UnifiedCreatorConsole.js
 */
import React from 'react';
import { X, Check, Lock } from 'lucide-react';

export default function StoreView({ storeItems, credits, onClose, onBuy }) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#060610' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
        <div>
          <div className="text-sm font-bold text-white/90">Mixer Store</div>
          <div className="text-[10px] text-white/40">{credits} Credits</div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg active:scale-90" style={{ background: 'rgba(255,255,255,0.05)' }} data-testid="store-close">
          <X size={16} className="text-white/60" />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {[{ key: 'mixer', label: 'Channel Packs' }, { key: 'mixer_fx', label: 'Effects' }, { key: 'mixer_visual', label: 'Visuals' }, { key: 'mixer_bundle', label: 'Bundles' }].map(cat => {
          const ci = storeItems.filter(i => i.category === cat.key);
          if (!ci.length) return null;
          return (
            <div key={cat.key} className="mb-4">
              <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">{cat.label}</div>
              {ci.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl mb-1.5"
                  style={{ background: item.owned ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${item.owned ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)'}` }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${item.color}12` }}>
                    {item.owned ? <Check size={12} style={{ color: '#22C55E' }} /> : <Lock size={10} style={{ color: item.color }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-white/80">{item.name}</div>
                    <div className="text-[9px] text-white/30 truncate">{item.description}</div>
                  </div>
                  {item.owned
                    ? <span className="text-[8px] text-green-400/50">OWNED</span>
                    : <button onClick={() => onBuy(item.id)} className="px-2.5 py-1 rounded-lg text-[9px] font-bold active:scale-95"
                        style={{ background: `${item.color}12`, border: `1px solid ${item.color}25`, color: item.color }}>{item.price_credits}c</button>}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
