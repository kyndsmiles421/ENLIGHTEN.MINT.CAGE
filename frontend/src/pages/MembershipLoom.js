import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * MembershipLoom.js — Refractal Membership Selection
 * 
 * THE MYSTICAL TIERS:
 * - SEEKER ($11/mo): Entry-level spiritual seekers
 * - ALCHEMIST ($33/mo): Transformation practitioners
 * - ARCHITECT ($99/mo): Reality weavers
 * - INFINITE ($333/mo): Unlimited cosmic access
 * 
 * Integrates with existing /api/subscriptions/checkout-subscription endpoint
 */

const API = process.env.REACT_APP_BACKEND_URL;

// Mystical Tier Configuration (maps to backend tiers)
const MYSTICAL_TIERS = {
  SEEKER: {
    id: 'starter',
    name: 'SEEKER',
    price: 11,
    interval: 'month',
    color: '#00FFC2',
    glyph: '◇',
    essence: 'The path begins',
    perks: [
      'Access to Quantum Loom',
      '100 AI Resonance Credits',
      'Oracle & Tarot Readings',
      'Crystalline Web Visualization',
      'Basic Solfeggio Soundscapes',
    ],
  },
  ALCHEMIST: {
    id: 'plus',
    name: 'ALCHEMIST',
    price: 33,
    interval: 'month',
    color: '#A855F7',
    glyph: '◈',
    essence: 'Transmute reality',
    perks: [
      'Everything in SEEKER',
      '300 AI Resonance Credits',
      'Advanced Sovereign Council Access',
      'Harmonic Resonance Engine',
      'Deed Sealing (Sanctuary)',
      'VR Celestial Dome Preview',
      'Asset Decay Paused',
    ],
  },
  ARCHITECT: {
    id: 'premium',
    name: 'ARCHITECT',
    price: 99,
    interval: 'month',
    color: '#FFD700',
    glyph: '⬡',
    essence: 'Design existence',
    perks: [
      'Everything in ALCHEMIST',
      'Unlimited AI Resonance',
      'Full VR Celestial Dome Access',
      'Sora Video Generation',
      'AI Sage Voice Sessions',
      'Personal Cosmic Calendar',
      'Export All Creations',
      'Architect Badge + Golden Aura',
    ],
  },
  INFINITE: {
    id: 'super_user',
    name: 'INFINITE',
    price: 333,
    interval: 'month',
    color: '#FF6B6B',
    glyph: '∞',
    essence: 'Beyond boundaries',
    perks: [
      'Everything in ARCHITECT',
      'White-Label Cosmic Reports',
      'API Access for Developers',
      'Early Feature Access',
      'Direct Sage Consultations',
      'Founding Member Status',
      'Infinite Badge + Rainbow Aura',
    ],
  },
};

const TierCard = ({ tier, isSelected, onSelect, isLoading }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`tier-card ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(tier)}
      style={{
        '--tier-color': tier.color,
      }}
      data-testid={`tier-${tier.name.toLowerCase()}`}
    >
      <style>{`
        .tier-card {
          position: relative;
          padding: 30px 25px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          background: rgba(10, 10, 20, 0.8);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }
        .tier-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--tier-color, #00FFC2)08, transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .tier-card.hovered::before,
        .tier-card.selected::before {
          opacity: 1;
        }
        .tier-card.selected {
          border-color: var(--tier-color, #00FFC2);
          box-shadow: 0 0 30px color-mix(in srgb, var(--tier-color) 30%, transparent);
        }
        .tier-card.hovered {
          transform: translateY(-5px);
          border-color: rgba(255,255,255,0.6);
        }
        .tier-glyph {
          font-size: 2.5rem;
          margin-bottom: 10px;
          color: var(--tier-color, #00FFC2);
          filter: drop-shadow(0 0 10px var(--tier-color));
        }
        .tier-name {
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--tier-color, #00FFC2);
          margin-bottom: 5px;
        }
        .tier-essence {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.1em;
          margin-bottom: 20px;
        }
        .tier-price {
          font-size: 2.5rem;
          font-weight: 900;
          color: white;
          margin-bottom: 5px;
        }
        .tier-price span {
          font-size: 0.8rem;
          font-weight: 400;
          color: rgba(255,255,255,0.5);
        }
        .tier-perks {
          list-style: none;
          padding: 0;
          margin: 20px 0 0 0;
          text-align: left;
        }
        .tier-perks li {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.7);
          padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tier-perks li::before {
          content: '✦';
          color: var(--tier-color, #00FFC2);
          font-size: 0.6rem;
        }
        .select-btn {
          width: 100%;
          margin-top: 20px;
          padding: 12px;
          background: transparent;
          border: 1px solid var(--tier-color, #00FFC2);
          color: var(--tier-color, #00FFC2);
          font-weight: 600;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s;
          border-radius: 6px;
        }
        .select-btn:hover:not(:disabled) {
          background: var(--tier-color, #00FFC2);
          color: #000;
        }
        .select-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="tier-glyph">{tier.glyph}</div>
      <div className="tier-name">{tier.name}</div>
      <div className="tier-essence">{tier.essence}</div>
      <div className="tier-price">
        ${tier.price}<span>/mo</span>
      </div>
      <ul className="tier-perks">
        {tier.perks.slice(0, 5).map((perk, i) => (
          <li key={i}>{perk}</li>
        ))}
        {tier.perks.length > 5 && (
          <li style={{ opacity: 0.5 }}>+{tier.perks.length - 5} more...</li>
        )}
      </ul>
      <button 
        className="select-btn" 
        disabled={isLoading}
      >
        {isLoading ? 'ALIGNING...' : 'SELECT'}
      </button>
    </div>
  );
};

export default function MembershipLoom() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [selectedTier, setSelectedTier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPlan, setCurrentPlan] = useState(null);

  // Fetch current plan on mount
  useEffect(() => {
    const fetchPlan = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API}/api/subscriptions/my-plan`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentPlan(data);
        }
      } catch (e) {
        console.error('Failed to fetch plan:', e);
      }
    };
    fetchPlan();
  }, [token]);

  // Check for session_id in URL (returning from Stripe)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId && token) {
      pollPaymentStatus(sessionId);
    }
  }, [token]);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setError('Payment verification timed out. Check your email for confirmation.');
      return;
    }

    try {
      const res = await fetch(`${API}/api/subscriptions/checkout-status/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to check status');
      
      const data = await res.json();
      
      if (data.payment_status === 'paid' || data.payment_status === 'complete') {
        // Success! Navigate to VR dome
        navigate('/vr/celestial-dome?welcome=true');
        return;
      } else if (data.status === 'expired') {
        setError('Payment session expired. Please try again.');
        return;
      }
      
      // Continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (e) {
      console.error('Status check error:', e);
      setError('Error verifying payment. Please contact support.');
    }
  };

  const handleTierSelect = useCallback(async (tier) => {
    setSelectedTier(tier);
    setError('');
    
    // If not logged in, redirect to auth
    if (!user || !token) {
      navigate('/auth?redirect=/membership');
      return;
    }

    setIsLoading(true);

    try {
      const originUrl = window.location.origin;
      
      const res = await fetch(`${API}/api/subscriptions/checkout-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier_id: tier.id,
          origin_url: originUrl,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to create checkout');
      }

      const data = await res.json();
      
      // Haptic feedback before redirect
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 100]);
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (e) {
      console.error('Checkout error:', e);
      setError(e.message || 'Failed to initiate checkout');
      setIsLoading(false);
    }
  }, [user, token, navigate]);

  return (
    <div className="membership-loom" data-testid="membership-loom">
      <style>{`
        .membership-loom {
          min-height: 100vh;
          background: radial-gradient(ellipse at top, #0f0f1a 0%, #050508 100%);
          color: white;
          padding: 60px 20px;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .loom-header {
          text-align: center;
          margin-bottom: 50px;
        }
        .loom-title {
          font-size: clamp(1.5rem, 5vw, 2.5rem);
          font-weight: 100;
          letter-spacing: 0.3em;
          background: linear-gradient(135deg, #00FFC2, #A855F7, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 15px;
        }
        .loom-subtitle {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.1em;
        }
        .tier-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .error-message {
          text-align: center;
          color: #ff4444;
          margin-bottom: 20px;
          padding: 10px;
          border: 1px solid rgba(255, 68, 68, 0.3);
          border-radius: 8px;
          background: rgba(255, 68, 68, 0.1);
        }
        .current-plan-badge {
          text-align: center;
          margin-bottom: 30px;
          padding: 15px;
          border: 1px solid rgba(0, 255, 194, 0.3);
          border-radius: 8px;
          background: rgba(0, 255, 194, 0.05);
        }
        .current-plan-badge span {
          color: #00FFC2;
          font-weight: 600;
        }
        .back-btn {
          position: fixed;
          top: 20px;
          left: 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          padding: 10px 20px;
          cursor: pointer;
          border-radius: 6px;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          transition: all 0.3s;
          z-index: 100;
        }
        .back-btn:hover {
          border-color: rgba(255,255,255,0.65);
          color: white;
        }
      `}</style>

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← RETURN
      </button>

      <div className="loom-header">
        <h1 className="loom-title">REFRACTAL MEMBERSHIP</h1>
        <p className="loom-subtitle">Choose your resonance tier</p>
      </div>

      {currentPlan && currentPlan.tier !== 'free' && (
        <div className="current-plan-badge">
          Current Plan: <span>{currentPlan.tier_name}</span> 
          ({currentPlan.credits_per_month === -1 ? 'Unlimited' : currentPlan.credits_per_month} credits/mo)
        </div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="tier-grid">
        {Object.values(MYSTICAL_TIERS).map((tier) => (
          <TierCard
            key={tier.name}
            tier={tier}
            isSelected={selectedTier?.name === tier.name}
            onSelect={handleTierSelect}
            isLoading={isLoading && selectedTier?.name === tier.name}
          />
        ))}
      </div>
    </div>
  );
}
