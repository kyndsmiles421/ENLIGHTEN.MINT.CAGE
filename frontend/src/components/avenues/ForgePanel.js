import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Hammer, Sparkles, Lock, CheckCircle, Zap, Clock, Target, Users
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function WaveformCanvas({ targetWave, userWave, setUserWave, active, tolerance }) {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const points = targetWave.length;
    const stepX = w / (points - 1);

    // Draw tolerance band
    ctx.fillStyle = 'rgba(251,191,36,0.04)';
    ctx.beginPath();
    targetWave.forEach((val, i) => {
      const x = i * stepX;
      const y = (1 - (val + tolerance)) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    for (let i = points - 1; i >= 0; i--) {
      const x = i * stepX;
      const y = (1 - (targetWave[i] - tolerance)) * h;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Target waveform
    ctx.strokeStyle = 'rgba(251,191,36,0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    targetWave.forEach((val, i) => {
      const x = i * stepX;
      const y = (1 - val) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // User waveform
    if (userWave.length > 0) {
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      userWave.forEach((val, i) => {
        const x = i * stepX;
        const y = (1 - val) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw points
      userWave.forEach((val, i) => {
        const x = i * stepX;
        const y = (1 - val) * h;
        const error = Math.abs(val - (targetWave[i] || 0));
        const match = error <= tolerance;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = match ? '#2DD4BF' : '#EF4444';
        ctx.fill();
      });
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(248,250,252,0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = (i / 4) * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }, [targetWave, userWave, tolerance]);

  useEffect(() => { drawWaveform(); }, [drawWaveform]);

  const handleInteraction = (e) => {
    if (!active) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const val = 1 - (y / rect.height);
    const clampedVal = Math.max(0, Math.min(1, val));

    const stepX = rect.width / (targetWave.length - 1);
    const pointIdx = Math.round(x / stepX);

    if (pointIdx >= 0 && pointIdx < targetWave.length) {
      setUserWave(prev => {
        const next = [...prev];
        while (next.length < targetWave.length) next.push(0.5);
        next[pointIdx] = Math.round(clampedVal * 100) / 100;
        return next;
      });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      className="w-full rounded-lg cursor-crosshair"
      style={{
        background: 'rgba(15,15,25,0.8)',
        border: '1px solid rgba(251,191,36,0.1)',
        touchAction: 'none',
      }}
      onMouseDown={() => setDragging(true)}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onMouseMove={e => dragging && handleInteraction(e)}
      onClick={handleInteraction}
      onTouchStart={() => setDragging(true)}
      onTouchEnd={() => setDragging(false)}
      onTouchMove={e => handleInteraction(e)}
      data-testid="forge-canvas"
    />
  );
}

export default function ForgePanel({ authHeaders, covenData }) {
  const [builds, setBuilds] = useState([]);
  const [activeForge, setActiveForge] = useState(null);
  const [pattern, setPattern] = useState(null);
  const [userWave, setUserWave] = useState([]);
  const [timer, setTimer] = useState(0);
  const [forging, setForging] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  const fetchBuilds = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/science-history/economy/builds`, { headers: authHeaders });
      setBuilds(res.data.builds || []);
    } catch (e) { console.error('Builds fetch failed', e); }
  }, [authHeaders]);

  useEffect(() => { fetchBuilds(); }, [fetchBuilds]);

  const startForge = async (buildId) => {
    try {
      const res = await axios.get(`${API}/cosmic-map/forge/pattern/${buildId}`, { headers: authHeaders });
      setPattern(res.data);
      setUserWave(new Array(res.data.points_count).fill(0.5));
      setActiveForge(buildId);
      setResult(null);
      setTimer(0);
      setForging(true);
      timerRef.current = setInterval(() => setTimer(t => t + 0.1), 100);
    } catch (e) { alert(e.response?.data?.detail || 'Failed to load forge'); }
  };

  const submitForge = async () => {
    if (!activeForge || !pattern) return;
    clearInterval(timerRef.current);
    setForging(false);
    try {
      const res = await axios.post(`${API}/cosmic-map/forge/attempt`, {
        build_id: activeForge,
        user_waveform: userWave,
        time_taken_seconds: timer,
      }, { headers: authHeaders });
      setResult(res.data);
      if (res.data.forged) fetchBuilds();
    } catch (e) {
      setResult({ forged: false, message: e.response?.data?.detail || 'Forge failed' });
    }
  };

  const submitGroupForge = async () => {
    if (!activeForge || !pattern) return;
    clearInterval(timerRef.current);
    setForging(false);
    try {
      const res = await axios.post(`${API}/sync/group-forge`, {
        build_id: activeForge,
        user_waveform: userWave,
        time_taken_seconds: timer,
      }, { headers: authHeaders });
      setResult({ ...res.data, groupForge: true });
      if (res.data.forged) fetchBuilds();
    } catch (e) {
      setResult({ forged: false, message: e.response?.data?.detail || 'Group forge failed', groupForge: true });
    }
  };

  const resetForge = () => {
    clearInterval(timerRef.current);
    setActiveForge(null);
    setPattern(null);
    setUserWave([]);
    setTimer(0);
    setForging(false);
    setResult(null);
  };

  useEffect(() => {
    if (forging && pattern && timer >= pattern.time_limit_seconds) {
      submitForge();
    }
  }, [timer, forging, pattern]);

  const forgeable = builds.filter(b => b.can_craft && !b.crafted);
  const crafted = builds.filter(b => b.crafted);

  return (
    <div className="rounded-2xl p-4"
      style={{
        background: 'rgba(15,15,25,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(251,191,36,0.08)',
        borderLeft: '2px solid rgba(251,191,36,0.25)',
      }}
      data-testid="forge-panel"
    >
      <div className="flex items-center gap-2 mb-3">
        <Hammer size={12} style={{ color: '#FBBF24' }} />
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#FBBF24' }}>
          Resonance Forge
        </span>
        <span className="text-[7px] ml-auto" style={{ color: 'var(--text-muted)' }}>
          Match the waveform to craft
        </span>
      </div>

      {/* Active forge */}
      <AnimatePresence>
        {activeForge && pattern && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-medium" style={{ color: '#FBBF24' }}>
                {pattern.name} — {pattern.frequency}Hz
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[8px] flex items-center gap-0.5" style={{
                  color: timer > pattern.time_limit_seconds * 0.7 ? '#EF4444' : '#2DD4BF'
                }}>
                  <Clock size={8} /> {timer.toFixed(1)}s / {pattern.time_limit_seconds}s
                </span>
              </div>
            </div>

            {/* Timer bar */}
            <div className="h-1 rounded-full" style={{ background: 'rgba(248,250,252,0.06)' }}>
              <motion.div className="h-full rounded-full" style={{
                width: `${Math.min(100, (timer / pattern.time_limit_seconds) * 100)}%`,
                background: timer > pattern.time_limit_seconds * 0.7 ? '#EF4444' : '#FBBF24',
              }} />
            </div>

            <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
              Click or drag on the canvas to match the dashed target waveform
            </p>

            <WaveformCanvas
              targetWave={pattern.waveform}
              userWave={userWave}
              setUserWave={setUserWave}
              active={forging}
              tolerance={pattern.tolerance}
            />

            <div className="flex gap-2">
              {forging ? (
                <>
                  <button onClick={submitForge}
                    className="flex-1 py-1.5 rounded-lg text-[9px] font-medium flex items-center justify-center gap-1"
                    style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}
                    data-testid="forge-submit-btn">
                    <Zap size={10} /> Forge Solo
                  </button>
                  {covenData && (
                    <button onClick={submitGroupForge}
                      className="flex-1 py-1.5 rounded-lg text-[9px] font-medium flex items-center justify-center gap-1"
                      style={{ background: 'rgba(45,212,191,0.08)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.15)' }}
                      data-testid="group-forge-btn">
                      <Users size={10} /> Group Forge
                    </button>
                  )}
                </>
              ) : null}
              <button onClick={resetForge}
                className="px-3 py-1.5 rounded-lg text-[8px]"
                style={{ background: 'rgba(248,250,252,0.04)', color: 'var(--text-muted)' }}
                data-testid="forge-cancel-btn">
                Cancel
              </button>
            </div>

            {/* Result */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg"
                style={{
                  background: result.forged ? 'rgba(45,212,191,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${result.forged ? 'rgba(45,212,191,0.15)' : 'rgba(239,68,68,0.15)'}`,
                }}
                data-testid="forge-result"
              >
                <div className="flex items-center gap-2 mb-1">
                  {result.forged ? <Sparkles size={12} style={{ color: '#FBBF24' }} /> : <Target size={12} style={{ color: '#EF4444' }} />}
                  <span className="text-[10px] font-medium" style={{ color: result.forged ? '#2DD4BF' : '#EF4444' }}>
                    {result.forged ? 'FORGED' : 'MISALIGNED'}
                    {result.groupForge && ' (Group)'}
                  </span>
                  <span className="text-[9px] font-mono ml-auto" style={{ color: '#FBBF24' }}>
                    {result.total_score}pts ({result.groupForge ? result.averaged_accuracy : result.accuracy}% accuracy)
                  </span>
                </div>
                <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{result.message}</p>
                {result.groupForge && result.lift > 0 && (
                  <p className="text-[8px] mt-0.5 flex items-center gap-1" style={{ color: '#2DD4BF' }}>
                    <Users size={8} /> Coven lifted your accuracy by +{result.lift}% ({result.contributors} members)
                  </p>
                )}
                {result.bonus && (
                  <p className="text-[8px] mt-1" style={{ color: '#FBBF24' }}>Bonus: {result.bonus}</p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Build list */}
      {!activeForge && (
        <div className="space-y-2">
          {forgeable.length > 0 && (
            <>
              <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Ready to Forge</p>
              {forgeable.map(b => (
                <div key={b.id} className="rounded-lg p-2.5 flex items-center gap-2"
                  style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.08)' }}
                  data-testid={`forge-ready-${b.id}`}>
                  <Hammer size={10} style={{ color: '#FBBF24' }} />
                  <div className="flex-1">
                    <p className="text-[9px] font-medium" style={{ color: 'var(--text-primary)' }}>{b.name}</p>
                    <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
                      {b.bonus_value}x {b.bonus_type.replace('_', ' ')} — {b.total_required} items required
                    </p>
                  </div>
                  <button onClick={() => startForge(b.id)}
                    className="px-2.5 py-1 rounded-md text-[8px] transition-all"
                    style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.15)' }}
                    data-testid={`start-forge-${b.id}`}>
                    Begin Forge
                  </button>
                </div>
              ))}
            </>
          )}

          {crafted.length > 0 && (
            <>
              <p className="text-[7px] uppercase tracking-widest mt-2" style={{ color: '#2DD4BF' }}>Active Builds</p>
              {crafted.map(b => (
                <div key={b.id} className="rounded-lg p-2 flex items-center gap-2"
                  style={{ background: 'rgba(45,212,191,0.03)', border: '1px solid rgba(45,212,191,0.08)' }}
                  data-testid={`forged-${b.id}`}>
                  <Sparkles size={9} style={{ color: '#FBBF24' }} />
                  <span className="text-[8px]" style={{ color: '#2DD4BF' }}>{b.name}</span>
                  <span className="text-[7px] ml-auto font-mono" style={{ color: '#FBBF24' }}>
                    {b.bonus_value}x
                  </span>
                </div>
              ))}
            </>
          )}

          {forgeable.length === 0 && crafted.length === 0 && (
            <div className="text-center py-4">
              <Lock size={16} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
              <p className="text-[8px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Acquire items from the Circular Economy to unlock Forge recipes
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
