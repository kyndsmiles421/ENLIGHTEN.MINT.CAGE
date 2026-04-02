import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  FlaskConical, CheckCircle, Beaker, ThermometerSun,
  Droplets, Wind, Coffee, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SIM_ICONS = {
  aquafaba_meringue: Wind,
  monk_fruit_pectin: Droplets,
  coconut_hemp_emulsion: Coffee,
  kona_extraction: Coffee,
  lychee_crumb: Sparkles,
};

function VariableSlider({ variable, value, onChange }) {
  const pct = ((value - variable.min) / (variable.max - variable.min)) * 100;
  const optPct = ((variable.optimal - variable.min) / (variable.max - variable.min)) * 100;

  return (
    <div className="space-y-1" data-testid={`slider-${variable.id}`}>
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {variable.name}
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B' }}>
          {typeof value === 'number' ? (Number.isInteger(variable.min) ? value : value.toFixed(1)) : value} {variable.unit}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        {/* Optimal marker */}
        <div className="absolute h-3 w-0.5 rounded-full" style={{
          left: `${optPct}%`, background: '#2DD4BF', zIndex: 2,
          transform: 'translateX(-50%)',
        }} />
        <input
          type="range"
          min={variable.min}
          max={variable.max}
          step={variable.max <= 10 ? 0.1 : 1}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #F59E0B ${pct}%, rgba(248,250,252,0.06) ${pct}%)`,
            accentColor: '#F59E0B',
          }}
        />
      </div>
      <div className="flex justify-between text-[7px]" style={{ color: 'var(--text-muted)' }}>
        <span>{variable.min} {variable.unit}</span>
        <span style={{ color: '#2DD4BF' }}>Optimal: {variable.optimal}</span>
        <span>{variable.max} {variable.unit}</span>
      </div>
    </div>
  );
}

export default function BotanicalLabPanel() {
  const { authHeaders } = useAuth();
  const [sims, setSims] = useState([]);
  const [expandedSim, setExpandedSim] = useState(null);
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSims = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/science-history/botanical-lab`, { headers: authHeaders });
      setSims(res.data.simulations || []);
    } catch (e) { console.error('Botanical fetch failed', e); }
  }, [authHeaders]);

  useEffect(() => { fetchSims(); }, [fetchSims]);

  const initValues = (sim) => {
    const init = {};
    sim.variables.forEach(v => { init[v.id] = v.min + (v.max - v.min) / 2; });
    setValues(init);
    setResult(null);
  };

  const handleExpand = (simId) => {
    if (expandedSim === simId) { setExpandedSim(null); return; }
    const sim = sims.find(s => s.id === simId);
    if (sim) { initValues(sim); setExpandedSim(simId); }
  };

  const runSimulation = async (simId) => {
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/science-history/botanical-lab/simulate`,
        { simulation_id: simId, variables: values },
        { headers: authHeaders }
      );
      setResult(res.data);
      if (res.data.mastered) fetchSims();
    } catch (e) {
      const msg = e.response?.data?.detail || 'Simulation failed';
      setResult({ error: msg });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-2" data-testid="botanical-lab-panel">
      <div className="flex items-center gap-2 mb-1">
        <FlaskConical size={11} style={{ color: '#F59E0B' }} />
        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#F59E0B' }}>
          Botanical Lab — Chemistry Simulations
        </span>
      </div>

      {sims.map(sim => {
        const Icon = SIM_ICONS[sim.id] || Beaker;
        const isExpanded = expandedSim === sim.id;

        return (
          <motion.div key={sim.id}
            layout
            className="rounded-lg overflow-hidden"
            style={{
              background: sim.completed ? 'rgba(45,212,191,0.03)' : 'rgba(248,250,252,0.015)',
              border: `1px solid ${sim.completed ? 'rgba(45,212,191,0.1)' : 'rgba(248,250,252,0.04)'}`,
            }}
            data-testid={`sim-${sim.id}`}
          >
            <div className="p-2.5 cursor-pointer" onClick={() => !sim.completed && handleExpand(sim.id)}>
              <div className="flex items-center gap-2">
                {sim.completed
                  ? <CheckCircle size={10} style={{ color: '#2DD4BF' }} />
                  : <Icon size={10} style={{ color: '#F59E0B' }} />
                }
                <span className="text-[10px] font-medium flex-1"
                  style={{ color: sim.completed ? '#2DD4BF' : 'var(--text-primary)' }}>
                  {sim.name}
                </span>
                <span className="text-[7px] px-1 rounded"
                  style={{ background: 'rgba(245,158,11,0.06)', color: '#F59E0B' }}>
                  {sim.category}
                </span>
                <span className="text-[7px]" style={{ color: '#F59E0B' }}>+{sim.resonance} res</span>
                {!sim.completed && (isExpanded ? <ChevronUp size={10} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={10} style={{ color: 'var(--text-muted)' }} />)}
              </div>
              <p className="text-[8px] mt-0.5 ml-5" style={{ color: 'var(--text-muted)' }}>{sim.description}</p>
            </div>

            {isExpanded && !sim.completed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="px-3 pb-3 space-y-3"
              >
                {/* Science note */}
                <div className="p-2 rounded-md" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.08)' }}>
                  <p className="text-[7px] uppercase tracking-widest mb-0.5" style={{ color: '#F59E0B' }}>Science Note</p>
                  <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{sim.science_note}</p>
                </div>

                {/* Variable sliders */}
                {sim.variables.map(v => (
                  <VariableSlider
                    key={v.id}
                    variable={v}
                    value={values[v.id] ?? v.min}
                    onChange={val => setValues(prev => ({ ...prev, [v.id]: val }))}
                  />
                ))}

                {/* Run button */}
                <button
                  onClick={() => runSimulation(sim.id)}
                  disabled={submitting}
                  className="w-full py-1.5 rounded-md text-[9px] font-medium transition-all"
                  style={{
                    background: submitting ? 'rgba(245,158,11,0.05)' : 'rgba(245,158,11,0.1)',
                    color: '#F59E0B',
                    border: '1px solid rgba(245,158,11,0.15)',
                  }}
                  data-testid={`run-sim-${sim.id}`}
                >
                  {submitting ? 'Analyzing...' : 'Run Simulation'}
                </button>

                {/* Result */}
                {result && !result.error && expandedSim === sim.id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-2.5 rounded-md space-y-1.5"
                    style={{
                      background: result.mastered ? 'rgba(45,212,191,0.05)' : 'rgba(248,250,252,0.03)',
                      border: `1px solid ${result.mastered ? 'rgba(45,212,191,0.15)' : 'rgba(248,250,252,0.06)'}`,
                    }}
                    data-testid="sim-result"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono" style={{ color: result.mastered ? '#2DD4BF' : '#F59E0B' }}>
                        {result.score}%
                      </span>
                      <span className="text-[8px]" style={{ color: result.mastered ? '#2DD4BF' : 'var(--text-muted)' }}>
                        {result.mastered ? 'MASTERED' : 'Adjust and retry'}
                      </span>
                    </div>
                    {result.feedback?.map((f, i) => (
                      <p key={i} className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{f}</p>
                    ))}
                    {result.mastery_product && (
                      <p className="text-[8px] pt-1" style={{ color: '#2DD4BF' }}>
                        Unlocked: {result.mastery_product}
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
