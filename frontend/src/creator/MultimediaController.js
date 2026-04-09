// /app/frontend/src/creator/MultimediaController.js
/**
 * ENLIGHTEN.MINT.CAFE - Creator Console Multimedia Controller
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Private interface connecting generator logic to multimedia player.
 * Broadcasts frequencies, visuals, or audio to the live app.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Radio, Zap, Volume2, Activity, Upload, RefreshCw } from 'lucide-react';

const MultimediaController = ({ 
  generatorOutput = null,
  onBroadcast,
  onStreamStart,
  onStreamStop,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [streamStatus, setStreamStatus] = useState('idle'); // idle, testing, live
  const [spectrumData, setSpectrumData] = useState(new Array(32).fill(0));
  const [machineTime, setMachineTime] = useState(0);
  const [heartbeatCount, setHeartbeatCount] = useState(0);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);

  // Spectrum visualization animation
  useEffect(() => {
    if (isPlaying || isBroadcasting) {
      const interval = setInterval(() => {
        setSpectrumData(prev => 
          prev.map(() => Math.random() * 100)
        );
      }, 100);
      return () => clearInterval(interval);
    } else {
      setSpectrumData(new Array(32).fill(0));
    }
  }, [isPlaying, isBroadcasting]);

  // Machine time tracker
  useEffect(() => {
    if (isBroadcasting) {
      timerRef.current = setInterval(() => {
        setMachineTime(prev => prev + 1);
        // Send heartbeat every 60 seconds
        if ((machineTime + 1) % 60 === 0) {
          sendHeartbeat();
        }
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [isBroadcasting, machineTime]);

  // Send heartbeat to backend
  const sendHeartbeat = useCallback(async () => {
    try {
      const API = process.env.REACT_APP_BACKEND_URL;
      await fetch(`${API}/api/creator/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine_time: machineTime,
          stream_status: streamStatus,
          output_type: generatorOutput?.type || 'frequency',
        }),
      });
      setHeartbeatCount(prev => prev + 1);
      console.log('[CreatorConsole] Heartbeat sent');
    } catch (err) {
      console.warn('[CreatorConsole] Heartbeat failed:', err);
    }
  }, [machineTime, streamStatus, generatorOutput]);

  // Push generated content to broadcast
  const pushToBroadcast = useCallback(() => {
    console.log("[CreatorConsole] Pushing generated stream to ENLIGHTEN.MINT.CAFE...");
    setIsBroadcasting(true);
    setStreamStatus('live');
    
    // Bridge to Media Engine
    if (window.MediaEngine && generatorOutput) {
      window.MediaEngine.load(generatorOutput);
    }
    
    // Notify parent component
    onBroadcast?.(generatorOutput);
    
    // Send initial heartbeat
    sendHeartbeat();
  }, [generatorOutput, onBroadcast, sendHeartbeat]);

  // Stop broadcast
  const stopBroadcast = useCallback(() => {
    setIsBroadcasting(false);
    setStreamStatus('idle');
    if (window.MediaEngine) {
      window.MediaEngine.stop?.();
    }
  }, []);

  // Toggle test stream
  const toggleTestStream = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      setStreamStatus('idle');
      onStreamStop?.();
    } else {
      setIsPlaying(true);
      setStreamStatus('testing');
      onStreamStart?.();
    }
  }, [isPlaying, onStreamStart, onStreamStop]);

  // Format time display
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="creator-card-green" style={{
      background: 'rgba(10, 15, 10, 0.95)',
      border: '1px solid rgba(134, 239, 172, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(134, 239, 172, 0.15)',
      }}>
        <h3 style={{
          color: '#86efac',
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: 0,
        }}>
          <Radio size={18} />
          Ω MULTIMEDIA MASTER
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            fontSize: '10px',
            color: streamStatus === 'live' ? '#22c55e' : streamStatus === 'testing' ? '#fbbf24' : '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            {streamStatus}
          </span>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: streamStatus === 'live' ? '#22c55e' : streamStatus === 'testing' ? '#fbbf24' : '#333',
            boxShadow: streamStatus === 'live' ? '0 0 10px #22c55e' : 'none',
          }} />
        </div>
      </div>

      {/* Spectrum Monitor */}
      <div className="spectrum-monitor" style={{
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        height: '120px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '2px',
      }}>
        {spectrumData.map((value, i) => (
          <motion.div
            key={i}
            animate={{ height: `${Math.max(4, value)}%` }}
            transition={{ duration: 0.1 }}
            style={{
              flex: 1,
              background: `linear-gradient(to top, 
                rgba(134, 239, 172, 0.8) 0%, 
                rgba(34, 197, 94, 0.6) 50%, 
                rgba(22, 163, 74, 0.4) 100%)`,
              borderRadius: '2px 2px 0 0',
              minHeight: '4px',
            }}
          />
        ))}
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>MACHINE TIME</div>
          <div style={{ fontSize: '16px', color: '#86efac', fontFamily: 'monospace' }}>
            {formatTime(machineTime)}
          </div>
        </div>
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>HEARTBEATS</div>
          <div style={{ fontSize: '16px', color: '#fbbf24', fontFamily: 'monospace' }}>
            {heartbeatCount}
          </div>
        </div>
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>OUTPUT</div>
          <div style={{ fontSize: '12px', color: '#a78bfa' }}>
            {generatorOutput?.type || 'READY'}
          </div>
        </div>
      </div>

      {/* Control Group */}
      <div className="control-group" style={{
        display: 'flex',
        gap: '12px',
      }}>
        <button
          onClick={isBroadcasting ? stopBroadcast : pushToBroadcast}
          disabled={!generatorOutput && !isBroadcasting}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 20px',
            borderRadius: '12px',
            border: 'none',
            background: isBroadcasting 
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            cursor: generatorOutput || isBroadcasting ? 'pointer' : 'not-allowed',
            opacity: generatorOutput || isBroadcasting ? 1 : 0.5,
            transition: 'all 0.2s ease',
          }}
        >
          {isBroadcasting ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              STOP BROADCAST
            </>
          ) : (
            <>
              <Upload size={16} />
              SYNC TO LIVE APP
            </>
          )}
        </button>
        
        <button
          onClick={toggleTestStream}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 20px',
            borderRadius: '12px',
            border: '1px solid rgba(134, 239, 172, 0.3)',
            background: isPlaying 
              ? 'rgba(251, 191, 36, 0.2)'
              : 'rgba(134, 239, 172, 0.1)',
            color: isPlaying ? '#fbbf24' : '#86efac',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isPlaying ? (
            <>
              <Pause size={16} />
              PAUSE STREAM
            </>
          ) : (
            <>
              <Play size={16} />
              START TEST
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MultimediaController;
