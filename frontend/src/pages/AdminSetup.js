import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Shield, Loader2, Check } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminSetup() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('zen_token');

  const handleActivate = async () => {
    if (!token) {
      toast.error('You need to log in first');
      return;
    }
    if (!password.trim()) {
      toast.error('Please enter the creator password');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/set-admin`, 
        { setup_key: password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      toast.success('Creator role activated! You now have unlimited access.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Wrong password. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-xl p-8 text-center"
        style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(248,250,252,0.06)' }}>

        {success ? (
          <>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(234,179,8,0.12)', border: '2px solid rgba(234,179,8,0.3)' }}>
              <Check size={28} style={{ color: '#EAB308' }} />
            </div>
            <h1 className="text-2xl font-light mb-2" style={{ color: '#EAB308', fontFamily: 'Cormorant Garamond, serif' }}>
              Creator Activated
            </h1>
            <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
              You now have unlimited AI access and all features unlocked.
            </p>
            <a href="/dashboard"
              className="inline-block px-6 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(234,179,8,0.12)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.25)' }}>
              Go to Dashboard
            </a>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(192,132,252,0.12)', border: '2px solid rgba(192,132,252,0.3)' }}>
              <Shield size={28} style={{ color: '#C084FC' }} />
            </div>
            <h1 className="text-2xl font-light mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Creator Access
            </h1>
            <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
              Enter your creator password to unlock unlimited access.
            </p>

            {!token && (
              <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                You need to <a href="/auth" className="underline">log in</a> first before activating.
              </div>
            )}

            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleActivate()}
              placeholder="Enter creator password"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-4"
              style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-primary)', border: '1px solid rgba(248,250,252,0.08)' }}
              data-testid="admin-password-input"
            />

            <button
              onClick={handleActivate}
              disabled={loading || !token}
              className="w-full py-3 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-40"
              style={{ background: 'rgba(192,132,252,0.12)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.25)' }}
              data-testid="admin-activate-btn">
              {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Activate Creator Role'}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
