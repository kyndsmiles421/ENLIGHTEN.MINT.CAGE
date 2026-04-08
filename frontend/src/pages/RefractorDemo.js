import React, { useState, useEffect } from 'react';
import { CrystallineEngine } from '../components/CrystallineEngine';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RefractorDemo() {
  const [artifact, setArtifact] = useState(null);
  const [sampleId, setSampleId] = useState('BIO-CORE-001');
  const [sensorInput, setSensorInput] = useState(0.92);
  const [loading, setLoading] = useState(false);
  const [decrypted, setDecrypted] = useState(null);

  const executeScan = async () => {
    setLoading(true);
    setDecrypted(null);
    try {
      const res = await axios.post(`${API}/refractor/scan`, {
        sample_id: sampleId,
        sensor_input: sensorInput
      });
      setArtifact(res.data);
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const reuniteStreams = async () => {
    if (!artifact) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/refractor/reunite`, {
        sms_data: artifact.sms_data,
        email_body: artifact.email_body
      });
      setDecrypted(res.data);
    } catch (err) {
      console.error('Reunite failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const riValue = artifact?.sms_data?.refractive_index || 0.618;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
      padding: '2rem',
      color: '#fff'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          background: 'linear-gradient(90deg, #00f2ff, #ff00f2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Sovereign Refractor
        </h1>
        <p style={{ color: '#888', marginBottom: '2rem' }}>
          Dual-Channel Barrier Visualization System
        </p>

        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            value={sampleId}
            onChange={(e) => setSampleId(e.target.value)}
            placeholder="Sample ID"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#fff',
              width: '200px'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ color: '#888', fontSize: '0.875rem' }}>Sensor:</label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.01"
              value={sensorInput}
              onChange={(e) => setSensorInput(parseFloat(e.target.value))}
              style={{ width: '150px' }}
            />
            <span style={{ color: '#00f2ff', fontFamily: 'monospace' }}>{sensorInput.toFixed(2)}</span>
          </div>
          <button
            onClick={executeScan}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, rgba(0,242,255,0.2), rgba(255,0,242,0.2))',
              border: '1px solid rgba(0,242,255,0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              color: '#00f2ff',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? 'Scanning...' : 'Execute Scan'}
          </button>
        </div>

        {/* 3D Visualization */}
        <div style={{ 
          borderRadius: '16px', 
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '2rem'
        }}>
          <CrystallineEngine riValue={riValue} />
        </div>

        {/* Results Grid */}
        {artifact && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {/* SMS Channel */}
            <div style={{
              background: 'rgba(0,242,255,0.05)',
              border: '1px solid rgba(0,242,255,0.2)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ color: '#00f2ff', marginBottom: '1rem', fontSize: '0.875rem', letterSpacing: '0.1em' }}>
                📱 SMS CHANNEL (OUTER BARRIER)
              </h3>
              <p style={{ 
                fontFamily: 'monospace', 
                fontSize: '1rem',
                color: artifact.sms_data.status === 'STABLE' ? '#22c55e' : '#ef4444',
                marginBottom: '0.5rem'
              }}>
                {artifact.sms_summary}
              </p>
              <pre style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '1rem', 
                borderRadius: '8px',
                fontSize: '0.75rem',
                overflow: 'auto'
              }}>
                {JSON.stringify(artifact.sms_data, null, 2)}
              </pre>
            </div>

            {/* Email Channel */}
            <div style={{
              background: 'rgba(255,0,242,0.05)',
              border: '1px solid rgba(255,0,242,0.2)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ color: '#ff00f2', marginBottom: '1rem', fontSize: '0.875rem', letterSpacing: '0.1em' }}>
                📧 EMAIL CHANNEL (INNER CORE)
              </h3>
              <pre style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '1rem', 
                borderRadius: '8px',
                fontSize: '0.65rem',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify(artifact.email_body, null, 2)}
              </pre>
              <button
                onClick={reuniteStreams}
                disabled={loading}
                style={{
                  marginTop: '1rem',
                  background: 'linear-gradient(135deg, rgba(255,0,242,0.3), rgba(0,242,255,0.3))',
                  border: '1px solid rgba(255,0,242,0.4)',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  color: '#fff',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                🔓 Reunite Streams & Decrypt
              </button>
            </div>

            {/* Decrypted Result */}
            {decrypted && (
              <div style={{
                background: 'rgba(34,197,94,0.05)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                gridColumn: '1 / -1'
              }}>
                <h3 style={{ color: '#22c55e', marginBottom: '1rem', fontSize: '0.875rem', letterSpacing: '0.1em' }}>
                  ✅ STREAMS REUNITED - DECRYPTED REPORT
                </h3>
                <pre style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(decrypted, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
