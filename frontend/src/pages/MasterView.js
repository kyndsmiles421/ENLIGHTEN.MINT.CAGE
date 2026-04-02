import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Eye, Layers, Radio, Atom, Shield, Sparkles,
  Heart, Zap, Mountain, Droplets, Flame, MapPin, Users,
  CheckCircle, AlertCircle, Clock, Globe, Brain, Sun,
  ChevronRight, Lock, Compass, Grid3X3
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_STYLES = {
  nominal: { color: '#2DD4BF', icon: CheckCircle, label: 'Nominal' },
  active: { color: '#2DD4BF', icon: Activity, label: 'Active' },
  calibrated: { color: '#2DD4BF', icon: CheckCircle, label: 'Calibrated' },
  aligned: { color: '#2DD4BF', icon: CheckCircle, label: 'Aligned' },
  misaligned: { color: '#FBBF24', icon: AlertCircle, label: 'Misaligned' },
  idle: { color: '#94A3B8', icon: Clock, label: 'Idle' },
  dormant: { color: '#94A3B8', icon: Clock, label: 'Dormant' },
  passed: { color: '#2DD4BF', icon: CheckCircle, label: 'Passed' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.nominal;
  const Icon = s.icon;
  return (
    <span className="text-[7px] px-1.5 py-0.5 rounded-full flex items-center gap-1 w-fit"
      style={{ background: `${s.color}08`, color: s.color, border: `1px solid ${s.color}15` }}>
      <Icon size={7} /> {s.label}
    </span>
  );
}

function AuditSection({ title, icon: Icon, color, status, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-3 space-y-2"
      style={{ background: `${color}03`, border: `1px solid ${color}08` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={12} style={{ color }} />
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color }}>{title}</span>
        </div>
        <StatusBadge status={status} />
      </div>
      {children}
    </motion.div>
  );
}

function MetricRow({ label, value, color, sub }) {
  return (
    <div className="flex items-center justify-between py-1 border-b" style={{ borderColor: 'rgba(248,250,252,0.03)' }}>
      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <div className="text-right">
        <span className="text-[10px] font-medium" style={{ color: color || 'var(--text-primary)' }}>{value}</span>
        {sub && <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function MasterView() {
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/master-view/audit`, { headers: authHeaders });
      setAudit(res.data);
    } catch (e) { console.error('Master view fetch failed', e); }
    setLoading(false);
  }, [authHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !audit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          <Brain size={28} style={{ color: '#8B5CF6' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-20 pb-32 max-w-2xl mx-auto space-y-4" data-testid="master-view-page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
        <h1 className="text-xl font-light tracking-wide"
          style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
          Master View
        </h1>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Central Nervous System — Full Audit
        </p>
      </motion.div>

      {/* Player summary */}
      <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(244,114,182,0.04)', border: '1px solid rgba(244,114,182,0.08)' }}>
        <p className="text-sm font-light" style={{ color: '#F472B6', fontFamily: 'Cormorant Garamond, serif' }}>
          {audit.player.name}
        </p>
        <div className="flex justify-center gap-4 mt-1">
          <span className="text-[9px]" style={{ color: '#FBBF24' }}>Level {audit.player.consciousness_level}</span>
          <span className="text-[9px]" style={{ color: '#2DD4BF' }}>{audit.player.dust} Dust</span>
          <span className="text-[9px]" style={{ color: '#F472B6' }}>{audit.player.xp} XP</span>
          <span className="text-[9px] capitalize" style={{ color: '#8B5CF6' }}>{audit.player.tier} Tier</span>
        </div>
      </div>

      {/* Stratigraphy Audit */}
      <AuditSection title="Planetary Stratigraphy" icon={Layers} color="#D97706" status={audit.stratigraphy.status}>
        <MetricRow label="Current Layer" value={audit.stratigraphy.layer_name} color="#D97706" />
        <MetricRow label="Frequency" value={`${audit.stratigraphy.frequency_hz} Hz`} color="#FBBF24" />
        <MetricRow label="Gravity" value={`${audit.stratigraphy.gravity}x`} />
        <MetricRow label="Pressure" value={`${audit.stratigraphy.pressure}x`} />
        <MetricRow label="Total Descents" value={audit.stratigraphy.total_descents} />
        <MetricRow label="Unlocked Layers" value={audit.stratigraphy.unlocked_layers?.join(', ')} />
      </AuditSection>

      {/* Psyche Tracking */}
      <AuditSection title="Psyche Layer" icon={Brain} color="#F472B6" status={audit.psyche.status}>
        <MetricRow label="Current Archetype" value={audit.psyche.archetype_name} color="#F472B6" />
        <MetricRow label="State" value={audit.psyche.current_state} />
        <MetricRow label="Element" value={audit.psyche.element} />
        <MetricRow label="Depth Correspondence" value={audit.psyche.depth_correspondence} />
      </AuditSection>

      {/* Dimensional */}
      <AuditSection title="Dimensional Grid" icon={Atom} color="#8B5CF6" status={audit.dimensional.status}>
        <MetricRow label="Current Dimension" value={audit.dimensional.dimension_name} color="#8B5CF6" />
        <MetricRow label="Key Attribute" value={audit.dimensional.key_attribute} />
        <MetricRow label="Grid Position" value={audit.dimensional.grid_position} />
        <MetricRow label="Cell ID" value={audit.dimensional.cell_id} />
        <MetricRow label="Total Phase-Shifts" value={audit.dimensional.total_shifts} />
      </AuditSection>

      {/* Quantum */}
      <AuditSection title="Quantum Mechanics" icon={Eye} color="#EF4444" status={audit.quantum.status}>
        <MetricRow label="Shadows Collapsed" value={audit.quantum.shadows_collapsed} color="#EF4444" />
        <MetricRow label="Shadow Dust Earned" value={audit.quantum.shadow_dust_earned} color="#2DD4BF" />
        <MetricRow label="Entanglement Bonds" value={`${audit.quantum.entanglement_bonds}/${audit.quantum.entanglement_max}`} color="#C084FC" />
        <MetricRow label="Observation Radius" value={`${audit.quantum.observation_radius_m}m`} />
      </AuditSection>

      {/* Frequency Scaling */}
      <AuditSection title="Frequency Scaling" icon={Radio} color="#FBBF24" status={audit.frequency_scaling.status}>
        <MetricRow label="Current Frequency" value={`${audit.frequency_scaling.current_hz} Hz`} color="#FBBF24" />
        <MetricRow label="Schumann Base" value={`${audit.frequency_scaling.schumann_base} Hz`} />
        <div className="flex items-center gap-1 mt-1">
          {audit.frequency_scaling.scale?.map(s => (
            <div key={s.layer} className="flex-1 text-center p-1 rounded"
              style={{
                background: s.hz === audit.frequency_scaling.current_hz ? 'rgba(251,191,36,0.08)' : 'rgba(248,250,252,0.02)',
                border: s.hz === audit.frequency_scaling.current_hz ? '1px solid rgba(251,191,36,0.2)' : '1px solid transparent',
              }}>
              <p className="text-[8px] font-mono" style={{ color: '#FBBF24' }}>{s.hz}Hz</p>
              <p className="text-[6px] capitalize" style={{ color: 'var(--text-muted)' }}>{s.layer.replace('_',' ')}</p>
            </div>
          ))}
        </div>
      </AuditSection>

      {/* Subsystems */}
      <AuditSection title="Subsystem Status" icon={Activity} color="#2DD4BF" status="nominal">
        {Object.entries(audit.subsystems || {}).map(([key, sys]) => (
          <div key={key} className="flex items-center justify-between py-1 border-b" style={{ borderColor: 'rgba(248,250,252,0.03)' }}>
            <span className="text-[9px] capitalize" style={{ color: 'var(--text-muted)' }}>{key.replace('_', ' ')}</span>
            <div className="flex items-center gap-2">
              {Object.entries(sys).filter(([k]) => k !== 'status').map(([k, v]) => (
                <span key={k} className="text-[8px]" style={{ color: 'var(--text-secondary)' }}>
                  {k}: {v}
                </span>
              ))}
              <StatusBadge status={sys.status} />
            </div>
          </div>
        ))}
      </AuditSection>

      {/* Fractal Engine */}
      {audit.fractal_engine && (
        <AuditSection title="Fractal Engine (L²)" icon={Layers} color="#C084FC" status={audit.fractal_engine.status}>
          <MetricRow label="Total Sub-Layers" value={audit.fractal_engine.total_sublayers} color="#C084FC" />
          <MetricRow label="Explored" value={`${audit.fractal_engine.explored} (${audit.fractal_engine.exploration_pct}%)`} color="#2DD4BF" />
          <MetricRow label="Current Sub-Layer" value={audit.fractal_engine.current_sublayer || 'None'} />
          <MetricRow label="Fractal Law" value={audit.fractal_engine.fractal_law} />
          <div className="flex gap-1 mt-1">
            {Object.entries(audit.fractal_engine.by_depth || {}).map(([d, info]) => (
              <div key={d} className="flex-1 text-center p-1 rounded" style={{ background: 'rgba(248,250,252,0.02)' }}>
                <p className="text-[8px] font-mono" style={{ color: '#C084FC' }}>{info.explored}/{info.sub_count}</p>
                <p className="text-[6px] capitalize" style={{ color: 'var(--text-muted)' }}>{d.replace('_',' ')}</p>
              </div>
            ))}
          </div>
        </AuditSection>
      )}

      {/* Mastery Avenues */}
      {audit.mastery_avenues && (
        <AuditSection title="Mastery Avenues" icon={Sparkles} color="#06B6D4" status={audit.mastery_avenues.status}>
          {['mathematics', 'art', 'thought'].map(a => {
            const data = audit.mastery_avenues[a] || {};
            const labels = { mathematics: 'Architect', art: 'Visionary', thought: 'Philosopher' };
            return (
              <MetricRow key={a} label={`${labels[a]} (${a})`} value={`${data.resonance || 0} res (Tier ${data.tier || 0})`}
                color={a === 'mathematics' ? '#06B6D4' : a === 'art' ? '#F472B6' : '#FBBF24'} />
            );
          })}
          <MetricRow label="Total Resonance" value={audit.mastery_avenues.total_resonance} color="#FBBF24" />
        </AuditSection>
      )}

      {/* Taste Test */}
      {audit.taste_test && (
        <AuditSection title="Final Taste Test" icon={CheckCircle} color="#10B981" status="verified">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Geometric Integrity (L² verified)</span>
              <StatusBadge status={audit.taste_test.geometric_integrity?.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Quantum Handshake</span>
              <StatusBadge status={audit.taste_test.quantum_handshake?.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Dimensional Flow ({audit.taste_test.dimensional_flow?.sublayers} layers)</span>
              <StatusBadge status={audit.taste_test.dimensional_flow?.status} />
            </div>
          </div>
        </AuditSection>
      )}

      {/* System Health */}
      <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(45,212,191,0.03)', border: '1px solid rgba(45,212,191,0.08)' }}
        data-testid="system-health">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Shield size={12} style={{ color: '#2DD4BF' }} />
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#2DD4BF' }}>System Health</span>
        </div>
        <div className="flex justify-center gap-4">
          <span className="text-[9px]" style={{ color: '#2DD4BF' }}>Backend: {audit.system_health.backend}</span>
          <span className="text-[9px]" style={{ color: '#2DD4BF' }}>Frontend: {audit.system_health.frontend}</span>
          <span className="text-[9px]" style={{ color: '#2DD4BF' }}>Regression: {audit.system_health.regression}</span>
        </div>
        <p className="text-[7px] mt-1" style={{ color: 'var(--text-muted)' }}>
          Timestamp: {audit.timestamp}
        </p>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Depths', path: '/planetary-depths', color: '#D97706', icon: Layers },
          { label: 'Quantum', path: '/quantum-field', color: '#EF4444', icon: Eye },
          { label: 'Fractal', path: '/fractal-engine', color: '#C084FC', icon: Grid3X3 },
          { label: 'Avenues', path: '/mastery-avenues', color: '#06B6D4', icon: Sparkles },
        ].map(nav => (
          <button key={nav.label} onClick={() => navigate(nav.path)}
            className="py-2 rounded-lg text-[9px] flex items-center justify-center gap-1 transition-all hover:scale-[1.02]"
            style={{ background: `${nav.color}06`, color: nav.color, border: `1px solid ${nav.color}10` }}>
            <nav.icon size={10} /> {nav.label}
          </button>
        ))}
      </div>
    </div>
  );
}
