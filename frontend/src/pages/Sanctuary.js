import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Sanctuary.js — Deed Sealing & Karma Management
 * 
 * THE SANCTUARY ARCHITECTURE:
 * - Top Strip: Navigation
 * - Canvas Layer: Crystalline web visualization
 * - Content Layer: Deed form, Karma display, Donation portal
 * - Rubber Band Utility: Pull-up quick actions
 * 
 * DEEDS: Manual labor/service records that accumulate Karma
 * DONATIONS: Energy recycling to the collective (Global Grace)
 */

const API = process.env.REACT_APP_BACKEND_URL;

// Deed Types with Karma values
const DEED_TYPES = [
  { id: 'service', label: 'Service to Others', karma: 10, description: 'Helping someone in need' },
  { id: 'creation', label: 'Creative Contribution', karma: 15, description: 'Art, music, writing, code' },
  { id: 'teaching', label: 'Knowledge Sharing', karma: 20, description: 'Teaching or mentoring' },
  { id: 'environmental', label: 'Environmental Care', karma: 12, description: 'Sustainability actions' },
  { id: 'healing', label: 'Resonance Work', karma: 25, description: 'Physical, emotional, spiritual resonance' },
  { id: 'restoration', label: 'Restoration', karma: 30, description: 'Repairing or renewing something' },
];

export default function Sanctuary() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('sanctuary', 8); }, []);

  const navigate = useNavigate();
  const { user, token } = useAuth();
  const canvasRef = useRef(null);
  
  // State
  const [karma, setKarma] = useState(0);
  const [deeds, setDeeds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [utilityExpanded, setUtilityExpanded] = useState(false);
  
  // Deed form state
  const [deedForm, setDeedForm] = useState({
    type: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Fetch user karma and deeds
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch karma
        const karmaRes = await fetch(`${API}/api/sanctuary/karma?user_id=${user?.email || 'anonymous'}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (karmaRes.ok) {
          const karmaData = await karmaRes.json();
          setKarma(karmaData.karma || 0);
        }

        // Fetch recent deeds
        const deedsRes = await fetch(`${API}/api/sanctuary/deeds?user_id=${user?.email || 'anonymous'}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (deedsRes.ok) {
          const deedsData = await deedsRes.json();
          setDeeds(deedsData.deeds || []);
        }
      } catch (e) {
        console.error('Failed to fetch sanctuary data:', e);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [token]);

  // Crystalline web canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let frameId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Web nodes
    const nodes = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Move
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Draw connections to nearby nodes
        nodes.forEach((other, j) => {
          if (i >= j) return;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.15;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(0, 255, 194, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 194, 0.3)';
        ctx.fill();
      });

      frameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Submit deed
  const handleSubmitDeed = useCallback(async (e) => {
    e.preventDefault();
    
    if (!token) {
      setMessage({ type: 'error', text: 'Please login to seal deeds' });
      return;
    }

    if (!deedForm.type || !deedForm.description) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const selectedType = DEED_TYPES.find(t => t.id === deedForm.type);
      
      const res = await fetch(`${API}/api/sanctuary/deed-simple?user_id=${user?.email || 'anonymous'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          deed_type: deedForm.type,
          description: deedForm.description,
          karma_value: selectedType?.karma || 10,
          date: deedForm.date,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setKarma(prev => prev + (selectedType?.karma || 10));
        setDeeds(prev => [data.deed, ...prev].slice(0, 10));
        setDeedForm({ type: '', description: '', date: new Date().toISOString().split('T')[0] });
        setMessage({ type: 'success', text: `Deed sealed! +${selectedType?.karma || 10} Karma` });
        
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([30, 20, 50, 20, 100]);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: errData.detail || 'Failed to seal deed' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    }

    setIsSubmitting(false);
  }, [token, deedForm]);

  // Donate to Aether Fund
  const handleDonate = useCallback(async () => {
    if (!token) {
      navigate('/auth?redirect=/sanctuary');
      return;
    }

    try {
      const res = await fetch(`${API}/api/aether/donate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 1100 }), // $11.00
      });

      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setMessage({ type: 'info', text: 'Aether Fund contribution processed. Global Grace +1' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to initiate donation' });
    }
  }, [token, navigate]);

  if (!token) {
    return (
      <div className="sanctuary-layout">
        <div className="sanctuary-top-strip">
          <span className="brand">ENLIGHTEN.MINT.CAFE</span>
        </div>
        <div className="sanctuary-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="sanctuary-card" style={{ maxWidth: 400, textAlign: 'center' }}>
            <h2 className="card-title">SANCTUARY ACCESS</h2>
            <p className="card-body" style={{ marginBottom: 20 }}>
              Login to seal deeds, accumulate karma, and access the Sovereign VR Sanctuary.
            </p>
            <button 
              onClick={() => navigate('/auth?redirect=/sanctuary')}
              style={{
                padding: '12px 30px',
                background: 'transparent',
                border: '1px solid var(--mint-primary, #00FFC2)',
                color: 'var(--mint-primary, #00FFC2)',
                cursor: 'pointer',
                borderRadius: 6,
                fontWeight: 600,
                letterSpacing: '0.1em',
              }}
            >
              LOGIN / REGISTER
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sanctuary-layout" data-testid="sanctuary-page">
      {/* Top Navigation Strip */}
      <div className="sanctuary-top-strip">
        <span className="brand">SANCTUARY</span>
        <div className="nav-items">
          <span className="nav-item" onClick={() => navigate('/ether-hub')}>HUB</span>
          <span className="nav-item" onClick={() => navigate('/vr/celestial-dome')}>VR DOME</span>
          <span className="nav-item" onClick={() => navigate('/membership')}>MEMBERSHIP</span>
        </div>
      </div>

      {/* Crystalline Web Canvas */}
      <div className="sanctuary-canvas-container">
        <canvas ref={canvasRef} />
      </div>

      {/* Main Content */}
      <div className="sanctuary-content">
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gap: 24 }}>
          
          {/* Karma Display */}
          <div className="karma-display">
            <div className="karma-value">{karma}</div>
            <div className="karma-info">
              <span className="karma-label">Accumulated Karma</span>
              <span className="karma-desc">
                {karma >= 100 ? 'Sovereign Key Unlocked' : `${100 - karma} more to unlock VR`}
              </span>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 8,
              background: message.type === 'error' ? 'rgba(255,68,68,0.1)' : 
                         message.type === 'success' ? 'rgba(0,255,194,0.1)' : 
                         'rgba(255,215,0,0.1)',
              border: `1px solid ${
                message.type === 'error' ? 'rgba(255,68,68,0.3)' : 
                message.type === 'success' ? 'rgba(0,255,194,0.3)' : 
                'rgba(255,215,0,0.3)'
              }`,
              color: message.type === 'error' ? '#ff6b6b' : 
                     message.type === 'success' ? '#00FFC2' : 
                     '#FFD700',
              fontSize: '0.8rem',
            }}>
              {message.text}
            </div>
          )}

          {/* Deed Form */}
          <div className="sanctuary-card">
            <h3 className="card-title">SEAL A DEED</h3>
            <p className="card-body" style={{ marginBottom: 20 }}>
              Record your acts of service, creation, or resonance to accumulate Karma.
            </p>
            
            <form className="deed-form" onSubmit={handleSubmitDeed}>
              <div className="form-group">
                <label>Deed Type</label>
                <select 
                  value={deedForm.type}
                  onChange={e => setDeedForm(prev => ({ ...prev, type: e.target.value }))}
                  required
                >
                  <option value="">Select a deed type...</option>
                  {DEED_TYPES.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label} (+{type.karma} Karma)
                    </option>
                  ))}
                </select>
              </div>

              {deedForm.type && (
                <div style={{ 
                  padding: '10px 14px', 
                  background: 'rgba(0,255,194,0.05)', 
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.6)',
                }}>
                  {DEED_TYPES.find(t => t.id === deedForm.type)?.description}
                </div>
              )}

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={deedForm.description}
                  onChange={e => setDeedForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your deed..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={deedForm.date}
                  onChange={e => setDeedForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'SEALING...' : 'SEAL DEED'}
              </button>
            </form>
          </div>

          {/* Recent Deeds */}
          {deeds.length > 0 && (
            <div className="sanctuary-card">
              <h3 className="card-title">RECENT DEEDS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {deeds.slice(0, 5).map((deed, i) => (
                  <div key={i} style={{
                    padding: '12px 16px',
                    background: 'transparent',
                    borderRadius: 8,
                    borderLeft: '3px solid var(--mint-primary, #00FFC2)',
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        color: 'var(--cafe-gold, #FFD700)',
                        letterSpacing: '0.05em',
                      }}>
                        {deed.deed_type?.toUpperCase() || 'DEED'}
                      </span>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        color: 'var(--mint-primary, #00FFC2)',
                      }}>
                        +{deed.karma_value || 10} Karma
                      </span>
                    </div>
                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: 'rgba(255,255,255,0.6)',
                      margin: 0,
                    }}>
                      {deed.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aether Fund */}
          <div className="sanctuary-card" style={{ borderColor: 'rgba(168, 85, 247, 0.2)' }}>
            <h3 className="card-title" style={{ color: '#A855F7' }}>AETHER PERPETUAL FUND</h3>
            <p className="card-body" style={{ marginBottom: 16 }}>
              Contribute to the collective. Your donation lowers the VR threshold barrier 
              for all seekers, spreading Global Grace.
            </p>
            <button 
              onClick={handleDonate}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '1px solid #A855F7',
                color: '#A855F7',
                cursor: 'pointer',
                borderRadius: 6,
                fontWeight: 600,
                letterSpacing: '0.1em',
                transition: 'all 0.3s',
              }}
              onMouseOver={e => {
                e.target.style.background = '#A855F7';
                e.target.style.color = '#000';
              }}
              onMouseOut={e => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#A855F7';
              }}
            >
              CONTRIBUTE $11 TO AETHER
            </button>
          </div>
        </div>
      </div>

      {/* Rubber Band Utility Bar */}
      <div 
        className={`rubber-band-utility ${utilityExpanded ? 'expanded' : ''}`}
        onMouseEnter={() => setUtilityExpanded(true)}
        onMouseLeave={() => setUtilityExpanded(false)}
      >
        <div className="utility-content">
          <button className="util-btn" onClick={() => navigate('/ether-hub')}>
            <span className="icon">◈</span>
            <span className="label">Hub</span>
          </button>
          <button className="util-btn" onClick={() => navigate('/quantum-loom')}>
            <span className="icon">◇</span>
            <span className="label">Loom</span>
          </button>
          <button className="util-btn" onClick={() => navigate('/vr/celestial-dome')}>
            <span className="icon">⬡</span>
            <span className="label">VR</span>
          </button>
          <button className="util-btn" onClick={() => navigate('/membership')}>
            <span className="icon">∞</span>
            <span className="label">Upgrade</span>
          </button>
        </div>
      </div>
    </div>
  );
}
