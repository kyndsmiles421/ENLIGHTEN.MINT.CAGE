import React, { useState } from 'react';
import { CrystallineEngine } from './CrystallineEngine';

const API = process.env.REACT_APP_BACKEND_URL;

export const SovereignConsole = () => {
  const [payload, setPayload] = useState('');
  const [barrierKey, setBarrierKey] = useState('');
  const [nonce, setNonce] = useState('');
  const [authTag, setAuthTag] = useState('');
  const [scaleN, setScaleN] = useState(10);
  const [scaleZ, setScaleZ] = useState(2);
  const [decryptedData, setDecryptedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  const stripArmor = (armored) => {
    return armored
      .replace(/-----BEGIN PGP [A-Z ]+-----/g, '')
      .replace(/-----END PGP [A-Z ]+-----/g, '')
      .replace(/Version:.*\n/g, '')
      .replace(/Comment:.*\n/g, '')
      .replace(/\n/g, '')
      .trim();
  };

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/api/n-refractor/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sample_id: `CONSOLE-${Date.now()}`,
          sensor_feed: 0.998,
          N: parseInt(scaleN),
          z: parseInt(scaleZ),
          armored: true
        })
      });
      const result = await response.json();
      setScanResult(result);
      
      // Auto-populate fields from scan
      if (result.email_armored) {
        setPayload(result.email_armored.shielded_data);
        setBarrierKey(result.email_armored.barrier_key);
        setNonce(result.email_armored.nonce);
        setAuthTag(result.email_armored.auth_tag);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReunite = async () => {
    setLoading(true);
    setError(null);
    setDecryptedData(null);
    
    try {
      const response = await fetch(`${API}/api/n-refractor/decrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          p: stripArmor(payload),
          k: stripArmor(barrierKey),
          n: stripArmor(nonce),
          t: stripArmor(authTag),
          N: parseInt(scaleN),
          z: parseInt(scaleZ),
          armored: false
        })
      });
      
      const result = await response.json();
      if (response.ok) {
        setDecryptedData(result);
      } else {
        setError(result.detail?.error || 'Decryption failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const riValue = scanResult?.sms_data?.scaled_ri || (0.618 * scaleN);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #000 0%, #0a0a1a 100%)',
      color: '#00f2ff',
      padding: '2rem',
      minHeight: '100vh',
      fontFamily: 'monospace'
    }}>
      <h1 style={{
        fontSize: '1.5rem',
        borderBottom: '1px solid rgba(0, 242, 255, 0.2)',
        paddingBottom: '1rem',
        marginBottom: '1.5rem',
        letterSpacing: '0.1em'
      }}>
        ENLIGHTEN.MINT.CAFE // SOVEREIGN_CONSOLE
      </h1>
      
      {/* VISUALIZER */}
      <div style={{
        border: '1px solid rgba(0, 242, 255, 0.2)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        <CrystallineEngine riValue={riValue} />
      </div>

      {/* SCAN CONTROLS */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', opacity: 0.6 }}>N:</label>
          <input 
            type="number" 
            value={scaleN} 
            onChange={(e) => setScaleN(e.target.value)}
            style={{
              background: 'rgba(0, 242, 255, 0.05)',
              border: '1px solid rgba(0, 242, 255, 0.2)',
              borderRadius: '4px',
              padding: '0.5rem',
              width: '80px',
              color: '#00f2ff',
              fontFamily: 'monospace'
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', opacity: 0.6 }}>z:</label>
          <input 
            type="number" 
            value={scaleZ} 
            onChange={(e) => setScaleZ(e.target.value)}
            style={{
              background: 'rgba(0, 242, 255, 0.05)',
              border: '1px solid rgba(0, 242, 255, 0.2)',
              borderRadius: '4px',
              padding: '0.5rem',
              width: '80px',
              color: '#00f2ff',
              fontFamily: 'monospace'
            }}
          />
        </div>
        <button 
          onClick={handleScan}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 242, 255, 0.2), rgba(255, 0, 242, 0.2))',
            border: '1px solid rgba(0, 242, 255, 0.3)',
            borderRadius: '6px',
            padding: '0.5rem 1.5rem',
            color: '#00f2ff',
            cursor: 'pointer',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.1em'
          }}
        >
          {loading ? 'Processing...' : 'Execute Scan'}
        </button>
        
        {scanResult && (
          <span style={{ 
            color: scanResult.sms_data?.status === 'STABLE' ? '#22c55e' : '#ef4444',
            fontSize: '0.875rem'
          }}>
            {scanResult.sms}
          </span>
        )}
      </div>

      {/* MAIN GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        {/* INPUT PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.65rem', 
              textTransform: 'uppercase', 
              opacity: 0.5,
              marginBottom: '0.5rem',
              letterSpacing: '0.1em'
            }}>
              Shielded Data (PGP Message)
            </label>
            <textarea 
              style={{
                width: '100%',
                height: '120px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(0, 242, 255, 0.2)',
                borderRadius: '6px',
                padding: '0.75rem',
                color: '#00f2ff',
                fontFamily: 'monospace',
                fontSize: '0.65rem',
                resize: 'vertical'
              }}
              placeholder="-----BEGIN PGP MESSAGE-----"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.65rem', 
              textTransform: 'uppercase', 
              opacity: 0.5,
              marginBottom: '0.5rem',
              letterSpacing: '0.1em'
            }}>
              Barrier Key (Session Key)
            </label>
            <textarea 
              style={{
                width: '100%',
                height: '80px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 0, 242, 0.2)',
                borderRadius: '6px',
                padding: '0.75rem',
                color: '#ff00f2',
                fontFamily: 'monospace',
                fontSize: '0.65rem',
                resize: 'vertical'
              }}
              placeholder="-----BEGIN PGP SESSION KEY-----"
              value={barrierKey}
              onChange={(e) => setBarrierKey(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.65rem', 
                textTransform: 'uppercase', 
                opacity: 0.5,
                marginBottom: '0.5rem'
              }}>
                Nonce
              </label>
              <textarea 
                style={{
                  width: '100%',
                  height: '60px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(0, 242, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  color: '#00f2ff',
                  fontFamily: 'monospace',
                  fontSize: '0.6rem',
                  resize: 'vertical'
                }}
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.65rem', 
                textTransform: 'uppercase', 
                opacity: 0.5,
                marginBottom: '0.5rem'
              }}>
                Auth Tag
              </label>
              <textarea 
                style={{
                  width: '100%',
                  height: '60px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(0, 242, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  color: '#00f2ff',
                  fontFamily: 'monospace',
                  fontSize: '0.6rem',
                  resize: 'vertical'
                }}
                value={authTag}
                onChange={(e) => setAuthTag(e.target.value)}
              />
            </div>
          </div>
          
          <button 
            onClick={handleReunite}
            disabled={loading || !payload}
            style={{
              background: payload ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(0, 242, 255, 0.2))' : 'rgba(50,50,50,0.3)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              color: payload ? '#22c55e' : '#666',
              cursor: payload ? 'pointer' : 'not-allowed',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.1em'
            }}
          >
            🔓 Reunite Streams & Decrypt
          </button>
        </div>

        {/* OUTPUT PANEL */}
        <div style={{
          border: '1px solid rgba(0, 242, 255, 0.2)',
          borderRadius: '8px',
          padding: '1.5rem',
          background: 'rgba(0, 0, 0, 0.4)'
        }}>
          <h2 style={{ 
            fontSize: '0.75rem', 
            marginBottom: '1rem', 
            opacity: 0.6,
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}>
            Decrypted Artifact
          </h2>
          
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              padding: '1rem',
              color: '#ef4444',
              fontSize: '0.75rem',
              marginBottom: '1rem'
            }}>
              ⚠ {error}
            </div>
          )}
          
          {decryptedData ? (
            <pre style={{
              color: '#22c55e',
              fontSize: '0.7rem',
              lineHeight: 1.6,
              overflow: 'auto',
              maxHeight: '400px',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '1rem',
              borderRadius: '6px'
            }}>
              {JSON.stringify(decryptedData, null, 2)}
            </pre>
          ) : (
            <p style={{ 
              color: 'rgba(255,255,255,0.65)', 
              fontStyle: 'italic', 
              fontSize: '0.75rem' 
            }}>
              Awaiting dual-channel reunification...
            </p>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        marginTop: '2rem',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(0, 242, 255, 0.1)',
        fontSize: '0.65rem',
        opacity: 0.4,
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>φ = 1.618033 | N×z×N×z Protocol</span>
        <span>Sovereign Refractor v2.0</span>
      </div>
    </div>
  );
};

export default SovereignConsole;
