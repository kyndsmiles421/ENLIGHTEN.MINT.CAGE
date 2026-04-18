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
  const [newPassword, setNewPassword] = useState('');
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
        navigate('/sovereign-hub');
      } else if (mode === 'register') {
        await register(name, email, password);
        toast.success('Your journey begins now');
        navigate('/sovereign-hub');
      } else if (mode === 'reset') {
        const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
        const res = await fetch(`${API}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, new_password: newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Reset failed');
        toast.success('Password updated — you can now log in');
        setMode('login');
        setPassword(newPassword);
        setNewPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    display: 'block',
    width: '100%',
    height: '52px',
    padding: '14px 16px',
    fontSize: '16px',
    fontFamily: 'inherit',
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    outline: 'none',
    WebkitAppearance: 'none',
    appearance: 'none',
    position: 'relative',
    zIndex: 9999,
    pointerEvents: 'auto',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px',
      background: 'linear-gradient(180deg, #0a0a1a 0%, #000 100%)',
      position: 'relative',
      zIndex: 50
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          width: '100%', 
          maxWidth: '400px',
          position: 'relative',
          zIndex: 100
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '32px',
            color: 'rgba(255,255,255,0.7)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          data-testid="back-to-home-btn"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: '300', 
          marginBottom: '8px',
          color: '#fff',
          fontFamily: 'Cormorant Garamond, Georgia, serif'
        }}>
          {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join the Light' : 'Reset Password'}
        </h1>
        <p style={{ 
          fontSize: '16px', 
          marginBottom: '40px',
          color: 'rgba(255,255,255,0.6)'
        }}>
          {mode === 'login' ? 'Continue your cosmic journey' : mode === 'register' ? 'Create your sanctuary account' : 'Enter your email and a new password'}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block',
                fontSize: '11px', 
                fontWeight: '700', 
                textTransform: 'uppercase', 
                letterSpacing: '0.2em', 
                marginBottom: '8px',
                color: 'rgba(255,255,255,0.5)'
              }}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                data-testid="auth-name-input"
                style={inputStyle}
              />
            </div>
          )}
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '11px', 
              fontWeight: '700', 
              textTransform: 'uppercase', 
              letterSpacing: '0.2em', 
              marginBottom: '8px',
              color: 'rgba(255,255,255,0.5)'
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              data-testid="auth-email-input"
              style={inputStyle}
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '11px', 
              fontWeight: '700', 
              textTransform: 'uppercase', 
              letterSpacing: '0.2em', 
              marginBottom: '8px',
              color: 'rgba(255,255,255,0.5)'
            }}>{mode === 'reset' ? 'New Password' : 'Password'}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={mode === 'reset' ? newPassword : password}
                onChange={(e) => mode === 'reset' ? setNewPassword(e.target.value) : setPassword(e.target.value)}
                placeholder={mode === 'reset' ? 'Enter new password (min 6 chars)' : 'Your password'}
                required
                minLength={mode === 'reset' ? 6 : undefined}
                data-testid="auth-password-input"
                style={{...inputStyle, paddingRight: '48px'}}
              />
              <button 
                type="button" 
                onClick={() => setShowPw(!showPw)} 
                style={{ 
                  position: 'absolute', 
                  right: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.5)',
                  padding: '4px',
                  zIndex: 10000
                }}
              >
                {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setMode('reset')}
                data-testid="auth-forgot-password-btn"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(167,139,250,0.7)', fontSize: '13px', marginTop: '8px',
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            data-testid="auth-submit-btn"
            style={{
              width: '100%',
              height: '52px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#000',
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginTop: '8px'
            }}
          >
            {loading ? 'Aligning energies...' : mode === 'reset' ? 'Reset Password' : 'Begin Journey'}
          </button>
        </form>

        <p style={{ 
          textAlign: 'center', 
          marginTop: '32px', 
          fontSize: '14px',
          color: 'rgba(255,255,255,0.6)'
        }}>
          {mode === 'login' ? "New to the cosmos? " : mode === 'register' ? "Already a traveler? " : "Remember your password? "}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            data-testid="auth-toggle-mode-btn"
            style={{
              background: 'none',
              border: 'none',
              textDecoration: 'underline',
              color: '#a78bfa',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {mode === 'login' ? 'Create account' : 'Welcome back'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
