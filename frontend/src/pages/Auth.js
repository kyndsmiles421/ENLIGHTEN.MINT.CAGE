import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('Welcome back, cosmic traveler');
      } else {
        await register(name, email, password);
        toast.success('Your journey begins now');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg-default)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8 text-sm"
          style={{ color: 'var(--text-secondary)' }}
          data-testid="back-to-home-btn"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <h1 className="text-4xl md:text-5xl font-light mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          {mode === 'login' ? 'Welcome Back' : 'Join the Light'}
        </h1>
        <p className="text-base mb-10" style={{ color: 'var(--text-secondary)' }}>
          {mode === 'login' ? 'Continue your conscious journey' : 'Create your sanctuary account'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.2em] mb-2 block" style={{ color: 'var(--text-muted)' }}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-glass w-full"
                placeholder="Your name"
                required
                data-testid="auth-name-input"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.2em] mb-2 block" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glass w-full"
              placeholder="your@email.com"
              required
              data-testid="auth-email-input"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.2em] mb-2 block" style={{ color: 'var(--text-muted)' }}>Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass w-full pr-10"
                placeholder="Your password"
                required
                data-testid="auth-password-input"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-glass w-full glow-primary mt-6"
            data-testid="auth-submit-btn"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Aligning energies...' : mode === 'login' ? 'Enter Sanctuary' : 'Begin Journey'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {mode === 'login' ? "New to the cosmos? " : "Already enlightened? "}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="underline"
            style={{ color: 'var(--primary)' }}
            data-testid="auth-toggle-mode-btn"
          >
            {mode === 'login' ? 'Create account' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
