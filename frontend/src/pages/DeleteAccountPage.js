import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Trash2, AlertTriangle, Mail, Loader2, CheckCircle2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DeleteAccountPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [busy, setBusy]         = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    if (confirm !== 'DELETE') { setError('Please type DELETE (all caps) to confirm'); return; }
    setBusy(true); setError('');
    try {
      const login = await axios.post(`${API}/auth/login`, { email, password });
      const token = login.data?.token;
      if (!token) throw new Error('Login failed');
      await axios.delete(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { confirm: 'DELETE' },
      });
      setDone(true);
      try { localStorage.clear(); sessionStorage.clear(); } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Deletion failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050210', color: 'rgba(248,250,252,0.82)', fontFamily: 'Georgia, serif', padding: '40px 20px' }} data-testid="delete-account-page">
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <button onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}
          data-testid="delete-back">
          <ArrowLeft size={14} /> Back
        </button>

        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 32, color: '#F0C470', margin: '24px 0 6px', letterSpacing: 0.5 }}>Delete Your Account</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '0 0 28px', letterSpacing: 1 }}>ENLIGHTEN.MINT.CAFE  ·  by INFINITY SOVEREIGN</p>

        {done ? (
          <div style={{ padding: 24, borderRadius: 14, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }} data-testid="delete-done">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <CheckCircle2 size={18} style={{ color: '#22C55E' }} />
              <h2 style={{ color: '#22C55E', fontSize: 18, margin: 0 }}>Account Deleted</h2>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: '0 0 10px' }}>Your account and all associated data have been permanently removed. Backup systems purge within 30 days.</p>
            <p style={{ fontSize: 11, color: 'rgba(248,250,252,0.5)', margin: 0 }}>Questions? <a href="mailto:sovereign@enlighten-mint-cafe.me" style={{ color: '#F0C470' }}>sovereign@enlighten-mint-cafe.me</a></p>
          </div>
        ) : (
          <>
            <section style={{ padding: 20, borderRadius: 14, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <AlertTriangle size={16} style={{ color: '#EF4444', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h2 style={{ color: '#EF4444', fontSize: 14, margin: '0 0 6px' }}>This is permanent</h2>
                  <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>Deleting your account will permanently remove:</p>
                </div>
              </div>
              <ul style={{ fontSize: 12, lineHeight: 1.9, color: 'rgba(248,250,252,0.72)', paddingLeft: 28, margin: '8px 0 0' }}>
                <li>Profile, display name, and authentication credentials</li>
                <li>Sparks, Dust, Gaming Cards, Trade Passport progress</li>
                <li>Quest log, inventory items, equipped gear</li>
                <li>Resonance Patterns and Crystalline Lattice history</li>
                <li>Journal entries, mood logs, oracle draws, meditation sessions</li>
                <li>Creator earnings and payout records (if applicable)</li>
              </ul>
              <p style={{ fontSize: 11, color: 'rgba(248,250,252,0.45)', margin: '14px 0 0' }}><b style={{ color: 'rgba(248,250,252,0.65)' }}>Timeline:</b> Active data removed immediately. Backups purge within 30 days.</p>
              <p style={{ fontSize: 11, color: 'rgba(248,250,252,0.45)', margin: '6px 0 0' }}><b style={{ color: 'rgba(248,250,252,0.65)' }}>Want your data first?</b> Settings → Your Data & Account → Download My Data, before you delete.</p>
            </section>

            <form onSubmit={handleDelete} style={{ padding: 20, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }} data-testid="delete-form">
              <h3 style={{ fontSize: 13, margin: '0 0 14px' }}>Confirm deletion</h3>

              <label style={{ fontSize: 11, color: 'rgba(248,250,252,0.55)', display: 'block', marginBottom: 4 }}>Account email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(248,250,252,0.9)', fontSize: 13, marginBottom: 14, outline: 'none', boxSizing: 'border-box' }}
                data-testid="delete-email-input" />

              <label style={{ fontSize: 11, color: 'rgba(248,250,252,0.55)', display: 'block', marginBottom: 4 }}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(248,250,252,0.9)', fontSize: 13, marginBottom: 14, outline: 'none', boxSizing: 'border-box' }}
                data-testid="delete-password-input" />

              <label style={{ fontSize: 11, color: 'rgba(248,250,252,0.55)', display: 'block', marginBottom: 4 }}>Type <span style={{ fontFamily: 'monospace', color: '#EF4444', fontWeight: 700 }}>DELETE</span> to confirm</label>
              <input type="text" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="DELETE" autoCapitalize="characters" spellCheck={false}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.06)', border: `1px solid ${confirm === 'DELETE' ? 'rgba(239,68,68,0.6)' : 'rgba(239,68,68,0.25)'}`, color: 'rgba(248,250,252,0.9)', fontSize: 13, marginBottom: 18, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                data-testid="delete-confirm-input" />

              {error && <p style={{ color: '#EF4444', fontSize: 12, margin: '0 0 12px' }} data-testid="delete-error">{error}</p>}

              <button type="submit" disabled={busy || confirm !== 'DELETE'}
                style={{ width: '100%', padding: '12px', borderRadius: 10, background: confirm === 'DELETE' ? '#EF4444' : 'rgba(239,68,68,0.2)', color: '#fff', border: '1px solid rgba(239,68,68,0.5)', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: busy || confirm !== 'DELETE' ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1 }}
                data-testid="delete-submit">
                {busy ? (<><Loader2 size={14} className="animate-spin" /> Deleting…</>) : (<><Trash2 size={14} /> Permanently Delete My Account</>)}
              </button>
            </form>

            <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Mail size={13} style={{ color: '#818CF8' }} />
                <h4 style={{ fontSize: 12, color: '#818CF8', margin: 0 }}>Can&apos;t sign in?</h4>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                Email <a href="mailto:sovereign@enlighten-mint-cafe.me?subject=Account%20Deletion%20Request" style={{ color: '#F0C470' }}>sovereign@enlighten-mint-cafe.me</a> from the address on your account with subject &quot;Account Deletion Request&quot;. We confirm and complete deletion within 7 business days.
              </p>
            </div>
          </>
        )}

        <p style={{ fontSize: 10, color: 'rgba(248,250,252,0.35)', margin: '32px 0 0', lineHeight: 1.6 }}>
          This page complies with Google Play&apos;s account deletion requirement. Full policy at <a href="/privacy.html" style={{ color: '#F0C470' }}>/privacy.html</a>.
        </p>
      </div>
    </div>
  );
}
