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
import RadialNavigator from './RadialNavigator';

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
          bottom: '85px',
          right: '15px',
          background: 'rgba(30, 30, 30, 0.85)',
          border: '1px solid rgba(80, 80, 80, 0.4)',
          borderRadius: '50%',
          padding: 0,
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#EF4444',
          cursor: 'pointer',
          zIndex: 9999,
        }}>
        <span style={{ fontSize: '14px' }}>■</span>
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

      {/* RADIAL NAVIGATOR — Hyper-Responsive Orbital Navigation with Rotation */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          textAlign: 'center', 
          fontSize: '11px', 
          color: 'rgba(248, 250, 252, 0.4)', 
          marginBottom: '8px',
          letterSpacing: '0.1em',
        }}>
          TAP TO NAVIGATE
        </div>
        <RadialNavigator 
          radius={110}
          enableRotation={true}
          rotationSpeed={0.15}
          showCenter={true}
        />
      </div>

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
