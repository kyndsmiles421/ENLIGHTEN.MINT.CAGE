import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Save, User } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SYMBOL_PATHS = {
  lotus: 'M12 2C12 2 8 8 8 12C8 16 12 22 12 22C12 22 16 16 16 12C16 8 12 2 12 2Z',
  star: 'M12 2L14.5 9L22 9L16 14L18 22L12 17L6 22L8 14L2 9L9.5 9Z',
  moon: 'M12 2A10 10 0 0 0 12 22A8 8 0 0 1 12 2Z',
  sun: 'M12 2V4M12 20V22M4 12H2M22 12H20M6 6L4.5 4.5M19.5 19.5L18 18M18 6L19.5 4.5M4.5 19.5L6 18M12 8A4 4 0 1 0 12 16A4 4 0 1 0 12 8Z',
  flame: 'M12 2C12 2 6 10 6 14C6 18 9 22 12 22C15 22 18 18 18 14C18 10 12 2 12 2ZM12 18C10.5 18 9 16.5 9 14.5C9 12 12 8 12 8C12 8 15 12 15 14.5C15 16.5 13.5 18 12 18Z',
  leaf: 'M17 8C8 10 5.9 16.09 3.82 21.18L5.12 22C6 20 7.5 17 10 15C7 18 5 22 5 22L6.5 22.5C8 19 12 14 17 8Z',
  crystal: 'M12 2L20 10L12 22L4 10Z',
  feather: 'M20.39 3.61C18.39 1.61 12 4 12 4C12 4 4 12 4 18L6 20C8 16 12 12 16 10L14 14L18 10L16 8L20 6L20.39 3.61Z',
  spiral: 'M12 12C12 12 14 10 14 8C14 6 12 4 10 4C8 4 6 6 6 8C6 10 8 14 12 14C16 14 18 10 18 8C18 4 14 2 12 2C8 2 4 6 4 10C4 16 10 20 12 20',
  eye: 'M12 5C5 5 1 12 1 12C1 12 5 19 12 19C19 19 23 12 23 12C23 12 19 5 12 5ZM12 16A4 4 0 1 1 12 8A4 4 0 0 1 12 16Z',
  wave: 'M2 12C4 8 6 8 8 12C10 16 12 16 14 12C16 8 18 8 20 12C22 16 22 16 22 16',
  mountain: 'M2 20L8 8L12 14L16 6L22 20Z',
};

export default function AvatarCustomizer({ onSave }) {
  const { authHeaders } = useAuth();
  const [avatar, setAvatar] = useState({ color: '#FBBF24', symbol: 'star', display_name: '' });
  const [colors, setColors] = useState([]);
  const [symbols, setSymbols] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchAvatar = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/auth/avatar`, { headers: authHeaders });
      setAvatar(res.data.avatar);
      setColors(res.data.available_colors);
      setSymbols(res.data.available_symbols);
    } catch (e) { console.error('Avatar fetch failed', e); }
  }, [authHeaders]);

  useEffect(() => { fetchAvatar(); }, [fetchAvatar]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${API}/auth/avatar`, avatar, { headers: authHeaders });
      setAvatar(res.data.avatar);
      toast('Avatar updated');
      if (onSave) onSave(res.data.avatar);
    } catch (e) { toast.error('Failed to save avatar'); }
    setSaving(false);
  };

  return (
    <div className="space-y-3" data-testid="avatar-customizer">
      {/* Preview */}
      <div className="flex items-center justify-center py-3">
        <motion.div
          animate={{ boxShadow: [`0 0 0px ${avatar.color}00`, `0 0 20px ${avatar.color}30`, `0 0 0px ${avatar.color}00`] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: `${avatar.color}15`, border: `2px solid ${avatar.color}40` }}
          data-testid="avatar-preview">
          <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={avatar.color} strokeWidth={1.5}>
            <path d={SYMBOL_PATHS[avatar.symbol] || SYMBOL_PATHS.star} />
          </svg>
        </motion.div>
      </div>

      {/* Display Name */}
      <div>
        <p className="text-[7px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Display Name</p>
        <input value={avatar.display_name} onChange={e => setAvatar(a => ({ ...a, display_name: e.target.value.slice(0, 20) }))}
          className="w-full px-2 py-1.5 rounded text-[9px] outline-none"
          style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}
          data-testid="avatar-name-input" />
      </div>

      {/* Colors */}
      <div>
        <p className="text-[7px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Color</p>
        <div className="flex flex-wrap gap-1.5">
          {colors.map(c => (
            <button key={c} onClick={() => setAvatar(a => ({ ...a, color: c }))}
              className="w-6 h-6 rounded-full transition-all"
              style={{
                background: c,
                border: avatar.color === c ? '2px solid #F8FAFC' : '2px solid transparent',
                transform: avatar.color === c ? 'scale(1.15)' : 'scale(1)',
              }}
              data-testid={`avatar-color-${c}`} />
          ))}
        </div>
      </div>

      {/* Symbols */}
      <div>
        <p className="text-[7px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Symbol</p>
        <div className="grid grid-cols-6 gap-1.5">
          {symbols.map(s => (
            <button key={s} onClick={() => setAvatar(a => ({ ...a, symbol: s }))}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: avatar.symbol === s ? `${avatar.color}12` : 'rgba(248,250,252,0.03)',
                border: avatar.symbol === s ? `1px solid ${avatar.color}30` : '1px solid transparent',
              }}
              data-testid={`avatar-symbol-${s}`}>
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none"
                stroke={avatar.symbol === s ? avatar.color : 'rgba(255,255,255,0.6)'} strokeWidth={1.5}>
                <path d={SYMBOL_PATHS[s] || SYMBOL_PATHS.star} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving}
        className="w-full py-1.5 rounded-md text-[8px] flex items-center justify-center gap-1 font-medium transition-all"
        style={{ background: `${avatar.color}10`, color: avatar.color, border: `1px solid ${avatar.color}20` }}
        data-testid="save-avatar-btn">
        <Save size={9} /> {saving ? 'Saving...' : 'Save Avatar'}
      </button>
    </div>
  );
}

export { SYMBOL_PATHS };
