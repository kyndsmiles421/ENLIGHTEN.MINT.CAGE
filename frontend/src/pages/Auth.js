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
          {mode === 'login' ? 'Welcome Back' : 'Join the Light'}
        </h1>
        <p style={{ 
          fontSize: '16px', 
          marginBottom: '40px',
          color: 'rgba(255,255,255,0.6)'
        }}>
          {mode === 'login' ? 'Continue your cosmic journey' : 'Create your sanctuary account'}
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
            }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
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
            {loading ? 'Aligning energies...' : 'Begin Journey'}
          </button>
        </form>

        <p style={{ 
          textAlign: 'center', 
          marginTop: '32px', 
          fontSize: '14px',
          color: 'rgba(255,255,255,0.6)'
        }}>
          {mode === 'login' ? "New to the cosmos? " : "Already a traveler? "}
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
