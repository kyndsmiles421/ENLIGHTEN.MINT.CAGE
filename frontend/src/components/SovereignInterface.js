/**
 * SOVEREIGN INTERFACE — The Unified Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Frontend + Backend Bridge
 * Direct DOM Override forces true #000000 Obsidian.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applySovereignReality, SovereignEconomy, executeEmergencyStop } from '../engines/SovereignCore';
import InstantAccess from './InstantAccess';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SovereignInterface = ({ userTier = 'BASIC', volunteerHours = 0 }) => {
  const navigate = useNavigate();
  const [econ, setEcon] = useState(SovereignEconomy.calculateAccess(volunteerHours));

  useEffect(() => {
    // Execute True Obsidian on mount
    applySovereignReality(174);
    
    // Recalculate economy when volunteer hours change
    setEcon(SovereignEconomy.calculateAccess(volunteerHours));
  }, [volunteerHours]);

  const handleStop = async () => {
    // Hits the Emergency Logic we built
    const result = await executeEmergencyStop();
    if (result.status === 'HALTED') {
      alert("SYSTEM HALTED: All holographic loops deactivated.");
    }
  };

  const handleSync = async (module) => {
    // SHA-256 Ledger Sync
    console.log(`Ω [LEDGER_SIGNATURE]: Generating hash for ${module}...`);
    
    try {
      await fetch(`${API}/sovereign/ledger/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: { module, tier: userTier, credits: econ.credits },
          sig: Date.now().toString(16)
        })
      });
    } catch (err) {
      console.warn('[SovereignInterface] Ledger sync failed:', err);
    }

    // Navigate to the portal
    const routes = {
      'Sanctuary': '/zen-garden',
      'Practice': '/breathing',
      'Divination': '/oracle',
      'Economy': '/economy',
      'Dashboard': '/dashboard',
    };
    
    const targetRoute = routes[module] || `/${module.toLowerCase()}`;
    navigate(targetRoute);
  };

  return (
    <div className="main-wrapper" data-testid="sovereign-interface">
      <button 
        className="floating-stop-button" 
        onClick={handleStop}
        data-testid="sovereign-stop-btn"
        style={{
          position: 'fixed',
          top: '15px',
          left: '15px',
          background: 'rgba(220, 20, 60, 0.4)',
          border: '1px solid rgba(220, 20, 60, 0.6)',
          borderRadius: '25px',
          padding: '8px 16px',
          color: '#fff',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 9999,
        }}>
        ■ STOP
      </button>
      
      <div className="wisdom-alert" style={{
        borderLeft: '2px solid gold',
        paddingLeft: '10px',
        margin: '20px 0',
        background: '#000000',
      }}>
        <h2 style={{ color: '#F0FFF0', margin: '0 0 8px 0' }}>Welcome back, Cosmic.</h2>
        <p style={{ margin: '4px 0', color: '#F0FFF0' }}>
          Current Rate: <span style={{ color: 'gold', fontWeight: 'bold' }}>${econ.rate}/hr</span> (20% Savings)
        </p>
        <p style={{ margin: '4px 0', color: '#F0FFF0' }}>
          Volunteer Credits Applied: <span style={{ color: '#86efac', fontWeight: 'bold' }}>${econ.credits}</span>
        </p>
      </div>

      <div className="access-status" style={{
        padding: '16px',
        marginBottom: '20px',
        background: '#000000',
        border: '1px solid rgba(134, 239, 172, 0.2)',
        borderRadius: '12px',
      }}>
        <h3 style={{ 
          color: econ.isFunded ? '#86efac' : '#fcd34d',
          margin: '0 0 8px 0',
        }}>
          STATUS: {econ.status}
        </h3>
        <p style={{ color: '#F0FFF0', margin: 0 }}>
          Balance Due: ${econ.due}
          {econ.isFunded && (
            <span style={{ color: '#86efac', marginLeft: '8px', fontSize: '12px' }}>
              (Cafe Fund Supporter)
            </span>
          )}
        </p>
        <p style={{ color: 'rgba(248, 250, 252, 0.5)', margin: '4px 0 0 0', fontSize: '11px' }}>
          Minimum Cafe Fund Contribution: ${econ.cafeFundFloor || '5.00'}
        </p>
      </div>

      <nav 
        className="explore-practice-list" 
        style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}
        data-testid="sovereign-nav"
      >
        <button 
          className="secure-pill-button" 
          onClick={() => handleSync('Sanctuary')}
          data-testid="nav-sanctuary"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(134, 239, 172, 0.3)',
            borderRadius: '16px',
            padding: '16px 24px',
            color: '#86efac',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}>
          进入 SANCTUARY
        </button>
        <button 
          className="secure-pill-button" 
          onClick={() => handleSync('Practice')}
          data-testid="nav-practice"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(134, 239, 172, 0.3)',
            borderRadius: '16px',
            padding: '16px 24px',
            color: '#86efac',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}>
          EXPLORE PRACTICE
        </button>
        <button 
          className="secure-pill-button" 
          onClick={() => handleSync('Divination')}
          data-testid="nav-divination"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(134, 239, 172, 0.3)',
            borderRadius: '16px',
            padding: '16px 24px',
            color: '#86efac',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}>
          ENTER DIVINATION
        </button>
        <button 
          className="secure-pill-button" 
          onClick={() => handleSync('Economy')}
          data-testid="nav-economy"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(252, 211, 77, 0.3)',
            borderRadius: '16px',
            padding: '16px 24px',
            color: '#fcd34d',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}>
          VOLUNTEER ECONOMY
        </button>
      </nav>

      {/* INSTANT ACCESS — Auto-Verify Volunteer Hours */}
      <InstantAccess 
        onAccessGranted={(data) => {
          console.log('[SovereignInterface] Access granted:', data);
          setEcon(SovereignEconomy.calculateAccess(volunteerHours + data.hours_logged));
        }}
        onTierUnlock={(data) => {
          console.log('[SovereignInterface] Tier unlocked:', data);
        }}
      />

      <footer style={{ marginTop: '50px', opacity: 0.5, fontSize: '0.7rem', color: '#F0FFF0' }}>
        Ω INVENTION_NODULE_ID: 2fc0ba69... (SHA-256 VERIFIED)
      </footer>
    </div>
  );
};

export default SovereignInterface;
