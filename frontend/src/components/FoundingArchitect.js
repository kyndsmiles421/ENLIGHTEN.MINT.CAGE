import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Award, Crown, Shield, ChevronRight, Copy, X, Check } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function FoundingArchitectBadge({ authHeaders, compact = false }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!authHeaders) return;
    axios.get(`${API}/founding-architect/status`, { headers: authHeaders })
      .then(r => setStatus(r.data))
      .catch(() => {});
  }, [authHeaders]);

  if (!status || !status.is_founding_architect) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider"
        style={{ background: 'rgba(234,179,8,0.12)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.25)' }}
        data-testid="founding-badge-compact">
        <Award size={8} /> Founder
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
      style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.12)' }}
      data-testid="founding-badge">
      <Award size={14} style={{ color: '#EAB308' }} />
      <div>
        <p className="text-[10px] font-bold" style={{ color: '#EAB308' }}>Founding Architect</p>
        <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Lifetime Elite &middot; 30% Off</p>
      </div>
    </div>
  );
}

export default function FoundingArchitectPanel({ authHeaders }) {
  const [status, setStatus] = useState(null);
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authHeaders) return;
    axios.get(`${API}/founding-architect/status`, { headers: authHeaders })
      .then(r => setStatus(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authHeaders]);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setRedeeming(true);
    try {
      const res = await axios.post(`${API}/founding-architect/redeem`, { code: code.trim() }, { headers: authHeaders });
      toast.success(res.data.message || 'Founding Architect status granted!');
      setStatus({ is_founding_architect: true, badge: 'founding_architect', perks: { lifetime_elite_discount: 30, badge_visible: true } });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid code');
    }
    setRedeeming(false);
  };

  if (loading) return null;

  // Already a founder
  if (status?.is_founding_architect) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="rounded-xl p-5 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(234,179,8,0.06), rgba(192,132,252,0.04))',
          border: '1px solid rgba(234,179,8,0.15)',
        }}
        data-testid="founding-architect-panel">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(192,132,252,0.1))',
            border: '1px solid rgba(234,179,8,0.25)',
          }}>
          <Award size={28} style={{ color: '#EAB308' }} />
        </div>
        <h3 className="text-lg font-light mb-1" style={{ color: '#EAB308', fontFamily: 'Cormorant Garamond, serif' }}>
          Founding Architect
        </h3>
        <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
          Your legacy is etched into the cosmos
        </p>
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.15)' }}>
            <Crown size={10} style={{ color: '#EAB308' }} />
            <span className="text-[10px] font-medium" style={{ color: '#EAB308' }}>Lifetime Elite</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <Shield size={10} style={{ color: '#22C55E' }} />
            <span className="text-[10px] font-medium" style={{ color: '#22C55E' }}>30% Off Everything</span>
          </div>
        </div>
        {status.granted_at && (
          <p className="text-[8px] mt-3" style={{ color: 'var(--text-muted)' }}>
            Granted {new Date(status.granted_at).toLocaleDateString()}
          </p>
        )}
      </motion.div>
    );
  }

  // Not a founder — show redeem option
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="rounded-xl p-4"
      style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.06)' }}
      data-testid="founding-architect-redeem">
      <div className="flex items-center gap-2 mb-3">
        <Award size={14} style={{ color: '#EAB308' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Founding Architect Program</span>
      </div>
      <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
        Have an invite code? Redeem it for a permanent Founding Architect badge and lifetime Elite status (30% discount).
      </p>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="ENTER INVITE CODE"
          className="flex-1 px-3 py-2 rounded-lg text-xs font-mono outline-none"
          style={{ background: 'rgba(248,250,252,0.03)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
          data-testid="founding-code-input"
        />
        <button
          onClick={handleRedeem}
          disabled={redeeming || !code.trim()}
          className="px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105"
          style={{ background: 'rgba(234,179,8,0.1)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.2)' }}
          data-testid="founding-redeem-btn"
        >
          {redeeming ? '...' : 'Redeem'}
        </button>
      </div>
    </motion.div>
  );
}
