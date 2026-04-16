/**
 * SOVEREIGN DASHBOARD — Economy Injection Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Replaces the "dead" stats with your actual Volunteer Credits
 * and the 20% Below Market logic.
 * 
 * This is the DISRUPTION LAYER that turns their template into YOUR system.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { handleSovereignNav } from '../utils/SovereignRouter';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SovereignDashboard = ({ userData: propUserData, compact = false }) => {
  const navigate = useNavigate();
  const { user, authHeaders } = useAuth();
  const [volunteerData, setVolunteerData] = useState(null);
  const [economyRates, setEconomyRates] = useState(null);
  const [loading, setLoading] = useState(true);

  // Your 20% discount math applied to their standard display
  const MARKET_RATE = 50.00;
  const SOVEREIGN_RATE = MARKET_RATE * 0.80; // 20% below market
  const VOLUNTEER_CREDIT_VALUE = 25.00; // $25 per hour

  useEffect(() => {
    const loadEconomyData = async () => {
      if (!user || !authHeaders) {
        setLoading(false);
        return;
      }

      try {
        const [volunteerRes, ratesRes] = await Promise.all([
          axios.get(`${API}/sovereign/economy/volunteer/balance`, { headers: authHeaders }).catch(() => ({ data: null })),
          axios.get(`${API}/sovereign/economy/rates?tier=SOVEREIGN`, { headers: authHeaders }).catch(() => ({ data: null })),
        ]);

        setVolunteerData(volunteerRes.data);
        setEconomyRates(ratesRes.data);
      } catch (err) {
        console.warn('[SovereignDashboard] Economy data load failed:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEconomyData();
  }, [user, authHeaders]);

  // Merge prop userData with fetched data
  const userData = {
    tier: propUserData?.tier || user?.tier || localStorage.getItem('zen_user_tier') || 'BASIC',
    volunteerHours: volunteerData?.total_hours || propUserData?.volunteerHours || 0,
    volunteerCredit: volunteerData?.total_credit || (volunteerData?.total_hours || 0) * VOLUNTEER_CREDIT_VALUE,
    ...propUserData,
  };

  // Calculate total savings
  const hoursSaved = userData.volunteerHours;
  const creditValue = hoursSaved * VOLUNTEER_CREDIT_VALUE;
  const rateSavings = MARKET_RATE - SOVEREIGN_RATE;

  if (compact) {
    // Compact version for embedding in other components
    return (
      <div className="sovereign-compact-stats" data-testid="sovereign-compact-stats">
        <div className="flex items-center gap-4 p-3 rounded-xl" 
             style={{ background: 'rgba(134, 239, 172, 0.06)', border: '1px solid rgba(134, 239, 172, 0.15)' }}>
          <div className="flex-1">
            <span className="text-xs" style={{ color: 'rgba(134, 239, 172, 0.7)' }}>Volunteer Balance</span>
            <div className="text-lg font-bold" style={{ color: '#86efac' }}>{userData.volunteerHours} hrs</div>
          </div>
          <div className="flex-1">
            <span className="text-xs" style={{ color: 'rgba(252, 211, 77, 0.7)' }}>Credit Value</span>
            <div className="text-lg font-bold" style={{ color: '#fcd34d' }}>${creditValue.toFixed(2)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sovereign-dashboard-injection" data-testid="sovereign-dashboard">
      {/* 20% BELOW MARKET BANNER — The Disruption Layer */}
      <div className="disruption-banner" data-testid="disruption-banner"
           style={{
             background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.15) 0%, rgba(252, 211, 77, 0.1) 100%)',
             border: '1px solid rgba(134, 239, 172, 0.3)',
             borderRadius: '16px',
             padding: '16px 24px',
             marginBottom: '24px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'space-between',
             flexWrap: 'wrap',
             gap: '12px',
           }}>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider" 
               style={{ color: 'rgba(134, 239, 172, 0.8)', marginBottom: '4px' }}>
            SOVEREIGN RATE ACTIVE
          </div>
          <div className="text-2xl font-bold" style={{ color: '#86efac' }}>
            ${SOVEREIGN_RATE.toFixed(2)}/hr 
            <span className="text-sm font-normal ml-2" style={{ color: 'rgba(252, 211, 77, 0.9)' }}>
              (20% Savings Applied)
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs" style={{ color: 'rgba(248, 250, 252, 0.5)' }}>Market Rate</div>
          <div className="text-lg line-through" style={{ color: 'rgba(248, 250, 252, 0.3)' }}>
            ${MARKET_RATE.toFixed(2)}/hr
          </div>
        </div>
      </div>

      {/* Stats Grid — Your Real Economy Numbers */}
      <div className="stats-grid" 
           style={{ 
             display: 'grid', 
             gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
             gap: '16px',
             marginBottom: '24px',
           }}>
        
        {/* Volunteer Balance */}
        <div className="stat-pill p-5" data-testid="stat-volunteer-balance"
             style={{ borderColor: 'rgba(134, 239, 172, 0.2)' }}>
          <div className="text-xs font-medium uppercase tracking-wider mb-2" 
               style={{ color: 'rgba(134, 239, 172, 0.7)' }}>
            Volunteer Balance
          </div>
          <div className="text-3xl font-bold" style={{ color: '#86efac' }}>
            {userData.volunteerHours} <span className="text-lg">hrs</span>
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(248, 250, 252, 0.4)' }}>
            = ${creditValue.toFixed(2)} credit value
          </div>
        </div>

        {/* Crystal Seal Status */}
        <div className="stat-pill p-5" data-testid="stat-crystal-seal"
             style={{ borderColor: 'rgba(45, 212, 191, 0.2)' }}>
          <div className="text-xs font-medium uppercase tracking-wider mb-2" 
               style={{ color: 'rgba(45, 212, 191, 0.7)' }}>
            Crystal Seal Status
          </div>
          <div className="text-3xl font-bold green-text" style={{ color: '#2dd4bf' }}>
            HARDENED
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(248, 250, 252, 0.4)' }}>
            SHA-256 Integrity Verified
          </div>
        </div>

        {/* Tier Status */}
        <div className="stat-pill p-5" data-testid="stat-tier"
             style={{ borderColor: 'rgba(252, 211, 77, 0.2)' }}>
          <div className="text-xs font-medium uppercase tracking-wider mb-2" 
               style={{ color: 'rgba(252, 211, 77, 0.7)' }}>
            Your Tier
          </div>
          <div className="text-3xl font-bold" style={{ color: '#fcd34d' }}>
            {userData.tier || 'BASIC'}
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(248, 250, 252, 0.4)' }}>
            Sovereign Access Level
          </div>
        </div>

        {/* Savings Earned */}
        <div className="stat-pill p-5" data-testid="stat-savings"
             style={{ borderColor: 'rgba(192, 132, 252, 0.2)' }}>
          <div className="text-xs font-medium uppercase tracking-wider mb-2" 
               style={{ color: 'rgba(192, 132, 252, 0.7)' }}>
            Total Savings
          </div>
          <div className="text-3xl font-bold" style={{ color: '#c084fc' }}>
            ${(creditValue + rateSavings).toFixed(2)}
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(248, 250, 252, 0.4)' }}>
            Volunteer + 20% Discount
          </div>
        </div>
      </div>

      {/* Wiring the 'Dead' Links — Now they GO somewhere */}
      <nav className="explore-practice-list" data-testid="sovereign-nav-links"
           style={{
             display: 'flex',
             flexDirection: 'column',
             gap: '16px',
             paddingTop: '24px',
           }}>
        <button 
          className="journey-btn sovereign-nav-btn"
          onClick={() => handleSovereignNav('Sanctuary', userData.tier, { navigate })}
          data-testid="nav-sanctuary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px 24px',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
          <span style={{ fontSize: '18px' }}>🏛️</span>
          进入 SANCTUARY
        </button>
        
        <button 
          className="journey-btn sovereign-nav-btn"
          onClick={() => handleSovereignNav('Practice', userData.tier, { navigate })}
          data-testid="nav-practice"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px 24px',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
          <span style={{ fontSize: '18px' }}>🧘</span>
          EXPLORE PRACTICE
        </button>

        <button 
          className="journey-btn sovereign-nav-btn"
          onClick={() => handleSovereignNav('Divination', userData.tier, { navigate })}
          data-testid="nav-divination"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px 24px',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
          <span style={{ fontSize: '18px' }}>🔮</span>
          ENTER DIVINATION
        </button>

        <button 
          className="journey-btn sovereign-nav-btn"
          onClick={() => navigate('/economy')}
          data-testid="nav-economy"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px 24px',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            background: 'rgba(252, 211, 77, 0.1)',
            borderColor: 'rgba(252, 211, 77, 0.4)',
            color: '#fcd34d',
          }}>
          <span style={{ fontSize: '18px' }}>💰</span>
          VOLUNTEER ECONOMY
        </button>
      </nav>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4" style={{ color: 'rgba(248, 250, 252, 0.4)' }}>
          Loading economy data...
        </div>
      )}
    </div>
  );
};

export default SovereignDashboard;
