import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Bike, CheckCircle, Gauge, Battery, ChevronDown, ChevronUp, Zap
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function TorqueSlider({ variable, value, onChange }) {
  const pct = ((value - variable.min) / (variable.max - variable.min)) * 100;
  const optPct = ((variable.optimal - variable.min) / (variable.max - variable.min)) * 100;

  return (
    <div className="space-y-1" data-testid={`ebike-slider-${variable.id}`}>
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {variable.name}
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(236,72,153,0.08)', color: '#EC4899' }}>
          {Math.round(value)} {variable.unit}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute h-3 w-0.5 rounded-full" style={{
          left: `${optPct}%`, background: '#2DD4BF', zIndex: 2,
          transform: 'translateX(-50%)',
        }} />
        <input
          type="range"
          min={variable.min}
          max={variable.max}
          step={1}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #EC4899 ${pct}%, rgba(248,250,252,0.06) ${pct}%)`,
            accentColor: '#EC4899',
          }}
        />
      </div>
      <div className="flex justify-between text-[7px]" style={{ color: 'var(--text-muted)' }}>
        <span>{variable.min}{variable.unit}</span>
        <span style={{ color: '#2DD4BF' }}>Optimal: {variable.optimal}</span>
        <span>{variable.max}{variable.unit}</span>
      </div>
    </div>
  );
}

export default function EBikePanel() {
  const { authHeaders } = useAuth();
  const [sims, setSims] = useState([]);
  const [expandedSim, setExpandedSim] = useState(null);
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [liveRange, setLiveRange] = useState(null);

  const fetchSims = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/science-history/ebike/sims`, { headers: authHeaders });
      setSims(res.data.simulations || []);
    } catch (e) { console.error('E-bike fetch failed', e); }
  }, [authHeaders]);

  useEffect(() => { fetchSims(); }, [fetchSims]);

  const initValues = (sim) => {
    const init = {};
    sim.variables.forEach(v => { init[v.id] = v.min + Math.round((v.max - v.min) / 2); });
    setValues(init);
    setResult(null);
    setLiveRange(null);
  };

  const handleExpand = (simId) => {
    if (expandedSim === simId) { setExpandedSim(null); return; }
    const sim = sims.find(s => s.id === simId);
    if (sim) { initValues(sim); setExpandedSim(simId); }
  };

  // Live range calculation (P = torque * omega)
  useEffect(() => {
    const battery = parseFloat(values.battery_wh || 1500);
    const motors = parseFloat(values.motor_watts || 2000);
    const speed = parseFloat(values.speed_mph || 20);
    const rider = parseFloat(values.rider_watts || 0);
    const frontPct = parseFloat(values.front_power || 40) / 100;
    const rearPct = parseFloat(values.rear_power || 60) / 100;
    const totalDraw = motors * 0.6 * (frontPct + rearPct) - rider * 0.3;
    const range = battery / Math.max(totalDraw, 100) * speed;
    setLiveRange(Math.round(range * 10) / 10);
  }, [values]);

  const runSimulation = async (simId) => {
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/science-history/ebike/simulate`,
        { simulation_id: simId, variables: values },
        { headers: authHeaders }
      );
      setResult(res.data);
      if (res.data.mastered) fetchSims();
    } catch (e) {
      setResult({ error: e.response?.data?.detail || 'Simulation failed' });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-2" data-testid="ebike-panel">
      <div className="flex items-center gap-2 mb-1">
        <Bike size={11} style={{ color: '#EC4899' }} />
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#EC4899' }}>
          E-Bike Engineering — Dual-Motor Lab
        </span>
      </div>

      {sims.map(sim => {
        const isExpanded = expandedSim === sim.id;
        const SimIcon = sim.id === 'torque_range' ? Gauge : Battery;

        return (
          <motion.div key={sim.id} layout className="rounded-lg overflow-hidden"
            style={{
              background: sim.completed ? 'rgba(45,212,191,0.03)' : 'rgba(248,250,252,0.015)',
              border: `1px solid ${sim.completed ? 'rgba(45,212,191,0.1)' : 'rgba(248,250,252,0.04)'}`,
            }}
            data-testid={`ebike-sim-${sim.id}`}
          >
            <div className="p-2.5 cursor-pointer" onClick={() => !sim.completed && handleExpand(sim.id)}>
              <div className="flex items-center gap-2">
                {sim.completed
                  ? <CheckCircle size={10} style={{ color: '#2DD4BF' }} />
                  : <SimIcon size={10} style={{ color: '#EC4899' }} />
                }
                <span className="text-[10px] font-medium flex-1"
                  style={{ color: sim.completed ? '#2DD4BF' : 'var(--text-primary)' }}>
                  {sim.name}
                </span>
                <span className="text-[7px]" style={{ color: '#EC4899' }}>+{sim.resonance} res</span>
                {!sim.completed && (isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
              </div>
              <p className="text-[8px] mt-0.5 ml-5" style={{ color: 'var(--text-muted)' }}>{sim.description}</p>
            </div>

            {isExpanded && !sim.completed && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                className="px-3 pb-3 space-y-3"
              >
                {/* Science note */}
                <div className="p-2 rounded-md" style={{ background: 'rgba(236,72,153,0.04)', border: '1px solid rgba(236,72,153,0.08)' }}>
                  <p className="text-[7px] uppercase tracking-widest mb-0.5" style={{ color: '#EC4899' }}>Engineering Note</p>
                  <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{sim.science_note}</p>
                </div>

                {/* Live range readout */}
                {liveRange !== null && (
                  <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.1)' }}>
                    <p className="text-[7px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Estimated Range</p>
                    <p className="text-lg font-light font-mono" style={{ color: '#EC4899' }}>
                      {liveRange} <span className="text-[9px]">miles</span>
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <Zap size={8} style={{ color: '#2DD4BF' }} />
                      <span className="text-[7px]" style={{ color: '#2DD4BF' }}>Updates in real-time</span>
                    </div>
                  </div>
                )}

                {/* Sliders */}
                {sim.variables.map(v => (
                  <TorqueSlider
                    key={v.id}
                    variable={v}
                    value={values[v.id] ?? v.min}
                    onChange={val => setValues(prev => ({ ...prev, [v.id]: val }))}
                  />
                ))}

                <button onClick={() => runSimulation(sim.id)} disabled={submitting}
                  className="w-full py-1.5 rounded-md text-[9px] font-medium transition-all"
                  style={{
                    background: submitting ? 'rgba(236,72,153,0.05)' : 'rgba(236,72,153,0.1)',
                    color: '#EC4899',
                    border: '1px solid rgba(236,72,153,0.15)',
                  }}
                  data-testid={`run-ebike-${sim.id}`}
                >
                  {submitting ? 'Computing...' : 'Run Engineering Test'}
                </button>

                {result && !result.error && expandedSim === sim.id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-2.5 rounded-md space-y-1.5"
                    style={{
                      background: result.mastered ? 'rgba(45,212,191,0.05)' : 'rgba(248,250,252,0.03)',
                      border: `1px solid ${result.mastered ? 'rgba(45,212,191,0.15)' : 'rgba(248,250,252,0.06)'}`,
                    }}
                    data-testid="ebike-result"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono" style={{ color: result.mastered ? '#2DD4BF' : '#EC4899' }}>
                        {result.score}%
                      </span>
                      <span className="text-[8px]" style={{ color: result.mastered ? '#2DD4BF' : 'var(--text-muted)' }}>
                        {result.mastered ? 'ENGINEERING MASTERED' : 'Recalibrate parameters'}
                      </span>
                    </div>
                    {result.feedback?.map((f, i) => (
                      <p key={i} className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{f}</p>
                    ))}
                    {result.calculated && (
                      <p className="text-[8px]" style={{ color: '#EC4899' }}>
                        Server Range: {result.calculated.estimated_range_miles} mi
                      </p>
                    )}
                  </motion.div>
                )}
                {result?.error && (
                  <p className="text-[8px] p-2 rounded" style={{ background: 'rgba(239,68,68,0.05)', color: '#EF4444' }}>
                    {result.error}
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
