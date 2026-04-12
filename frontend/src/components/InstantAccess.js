/**
 * INSTANT ACCESS — Frontend Auto-Verify Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * The user doesn't have to wait. The moment they hit "Submit,"
 * the math runs, the background stays True Obsidian, and the door opens.
 */
import React, { useState, useCallback } from 'react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Activity types that can be auto-approved
const ACTIVITY_TYPES = [
  { id: 'CONTENT_CREATION', label: 'Content Creation', icon: '✍️' },
  { id: 'BETA_TESTING', label: 'Beta Testing', icon: '🧪' },
  { id: 'COMMUNITY_MOD', label: 'Community Moderation', icon: '👥' },
  { id: 'TUTORIAL_COMPLETION', label: 'Tutorial Completion', icon: '📚' },
  { id: 'MEDITATION_PRACTICE', label: 'Meditation Practice', icon: '🧘' },
  { id: 'FEEDBACK_SUBMISSION', label: 'Feedback Submission', icon: '💬' },
  { id: 'BUG_REPORT', label: 'Bug Report', icon: '🐛' },
  { id: 'REFERRAL', label: 'Referral', icon: '🤝' },
];

const InstantAccess = ({ onAccessGranted, onTierUnlock }) => {
  const [hours, setHours] = useState(1);
  const [activityType, setActivityType] = useState('BETA_TESTING');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Handle auto-volunteer verification
  const handleAutoVolunteer = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Hit the Autonomous Verifier
      const response = await fetch(`${API}/sovereign/economy/auto-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('zen_token')}`,
        },
        body: JSON.stringify({ 
          hours: hours, 
          activity_type: activityType,
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.status === "VERIFIED") {
        // Immediately unlock the holographic math module
        if (window.SovereignState) {
          window.SovereignState.unlockTier('ENLIGHTENED');
        }
        
        // Update local storage tier
        localStorage.setItem('zen_user_tier', 'SOVEREIGN');
        
        // Callback if provided
        if (onAccessGranted) {
          onAccessGranted(data);
        }
        
        // Show success
        alert("Reciprocity Verified. Welcome to the Sanctuary.");
      } else if (data.status === "PENDING") {
        alert("Your submission is pending manual review. You'll be notified once approved.");
      }
    } catch (err) {
      console.error('[InstantAccess] Auto-verify failed:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [hours, activityType, onAccessGranted]);

  // Handle instant tier unlock check
  const handleTierUnlock = useCallback(async (targetTier) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API}/sovereign/economy/tier-unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('zen_token')}`,
        },
        body: JSON.stringify({ target_tier: targetTier }),
      });

      const data = await response.json();

      if (data.status === "UNLOCKED") {
        localStorage.setItem('zen_user_tier', targetTier);
        if (onTierUnlock) {
          onTierUnlock(data);
        }
        alert(`Welcome to ${targetTier}! Full access granted.`);
      } else {
        alert(data.message || `Need more volunteer hours for ${targetTier} access.`);
      }
    } catch (err) {
      console.error('[InstantAccess] Tier unlock failed:', err);
      setError('Tier unlock check failed.');
    } finally {
      setLoading(false);
    }
  }, [onTierUnlock]);

  return (
    <div 
      className="instant-access-panel" 
      data-testid="instant-access"
      style={{
        background: '#000000',
        border: '1px solid rgba(134, 239, 172, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <h3 style={{ 
        color: '#86efac', 
        margin: '0 0 16px 0',
        fontSize: '14px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        LOG RECIPROCITY (AUTO-VERIFY)
      </h3>

      {/* Activity Type Selector */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ 
          display: 'block', 
          color: 'rgba(248, 250, 252, 0.6)', 
          fontSize: '12px',
          marginBottom: '8px',
        }}>
          Activity Type
        </label>
        <select
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
          disabled={loading}
          style={{
            width: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(134, 239, 172, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            color: '#F0FFF0',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {ACTIVITY_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Hours Input */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ 
          display: 'block', 
          color: 'rgba(248, 250, 252, 0.6)', 
          fontSize: '12px',
          marginBottom: '8px',
        }}>
          Hours to Log (Max 4 for auto-approval)
        </label>
        <input
          type="number"
          min="0.5"
          max="10"
          step="0.5"
          value={hours}
          onChange={(e) => setHours(parseFloat(e.target.value) || 1)}
          disabled={loading}
          style={{
            width: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(134, 239, 172, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            color: '#F0FFF0',
            fontSize: '14px',
          }}
        />
        <div style={{ 
          marginTop: '4px', 
          fontSize: '11px', 
          color: 'rgba(252, 211, 77, 0.8)',
        }}>
          Credit Accrual: {(hours * 10).toFixed(0)} Fans (@ 10 Fans/hr)
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleAutoVolunteer}
        disabled={loading}
        data-testid="auto-verify-submit"
        style={{
          width: '100%',
          background: loading ? 'rgba(134, 239, 172, 0.2)' : 'rgba(134, 239, 172, 0.1)',
          border: '1px solid rgba(134, 239, 172, 0.4)',
          borderRadius: '12px',
          padding: '14px',
          color: '#86efac',
          fontSize: '14px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
        }}
      >
        {loading ? 'VERIFYING...' : 'SUBMIT FOR AUTO-VERIFICATION'}
      </button>

      {/* Result Display */}
      {result && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          borderRadius: '8px',
          background: result.status === 'VERIFIED' 
            ? 'rgba(45, 212, 191, 0.1)' 
            : result.status === 'PENDING'
            ? 'rgba(252, 211, 77, 0.1)'
            : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${
            result.status === 'VERIFIED' 
              ? 'rgba(45, 212, 191, 0.3)' 
              : result.status === 'PENDING'
              ? 'rgba(252, 211, 77, 0.3)'
              : 'rgba(239, 68, 68, 0.3)'
          }`,
        }}>
          <div style={{ 
            fontWeight: '600', 
            marginBottom: '4px',
            color: result.status === 'VERIFIED' ? '#2dd4bf' : result.status === 'PENDING' ? '#fcd34d' : '#ef4444',
          }}>
            STATUS: {result.status}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.7)' }}>
            {result.message}
          </div>
          {result.signature && (
            <div style={{ fontSize: '10px', color: 'rgba(248, 250, 252, 0.4)', marginTop: '8px' }}>
              Signature: {result.short_sig || result.signature.substring(0, 24)}...
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          fontSize: '12px',
        }}>
          {error}
        </div>
      )}

      {/* Quick Tier Unlock Buttons */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '11px', color: 'rgba(248, 250, 252, 0.4)', marginBottom: '12px' }}>
          CHECK TIER ACCESS
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleTierUnlock('SOVEREIGN')}
            disabled={loading}
            style={{
              flex: 1,
              background: 'rgba(252, 211, 77, 0.1)',
              border: '1px solid rgba(252, 211, 77, 0.3)',
              borderRadius: '8px',
              padding: '10px',
              color: '#fcd34d',
              fontSize: '11px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            SOVEREIGN
          </button>
          <button
            onClick={() => handleTierUnlock('ENLIGHTENED')}
            disabled={loading}
            style={{
              flex: 1,
              background: 'rgba(192, 132, 252, 0.1)',
              border: '1px solid rgba(192, 132, 252, 0.3)',
              borderRadius: '8px',
              padding: '10px',
              color: '#c084fc',
              fontSize: '11px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            ENLIGHTENED
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstantAccess;
