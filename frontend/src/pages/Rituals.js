import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  Sunrise, Moon, Zap, Plus, Play, Pause, SkipForward, Check,
  Wind, Timer, Sun, Radio, Trash2, Clock, Flame, ChevronRight,
  Loader2, X
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STEP_ICONS = {
  breathing: Wind,
  meditation: Timer,
  exercise: Zap,
  affirmation: Sun,
  frequency: Radio,
};

const STEP_COLORS = {
  breathing: '#2DD4BF',
  meditation: '#D8B4FE',
  exercise: '#FCD34D',
  affirmation: '#FDA4AF',
  frequency: '#8B5CF6',
};

const TIME_ICONS = {
  morning: Sunrise,
  evening: Moon,
  anytime: Zap,
};

const AVAILABLE_STEPS = [
  { type: 'breathing', name: 'Box Breathing', duration: 120 },
  { type: 'breathing', name: 'Energizing Breath', duration: 180 },
  { type: 'breathing', name: '4-7-8 Relaxation', duration: 240 },
  { type: 'breathing', name: 'Pranayama Flow', duration: 300 },
  { type: 'meditation', name: 'Quick Center (5 min)', duration: 300 },
  { type: 'meditation', name: 'Morning Ritual (10 min)', duration: 600 },
  { type: 'meditation', name: 'Deep Dive (20 min)', duration: 1200 },
  { type: 'exercise', name: 'Standing Like a Tree', duration: 300 },
  { type: 'exercise', name: 'Eight Brocades', duration: 600 },
  { type: 'exercise', name: 'Cloud Hands', duration: 300 },
  { type: 'exercise', name: 'Five Element Qigong', duration: 900 },
  { type: 'affirmation', name: 'Affirmation Moment', duration: 60 },
  { type: 'affirmation', name: 'Gratitude Reflection', duration: 120 },
  { type: 'frequency', name: '432Hz Harmony', duration: 180 },
  { type: 'frequency', name: '528Hz Miracle Tone', duration: 180 },
  { type: 'frequency', name: '963Hz Divine', duration: 180 },
];

function formatDuration(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

function StepBadge({ type }) {
  const Icon = STEP_ICONS[type] || Zap;
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
      style={{ background: `${STEP_COLORS[type]}15` }}>
      <Icon size={14} style={{ color: STEP_COLORS[type] }} />
    </div>
  );
}

// --- Ritual Player Component ---
function RitualPlayer({ ritual, onComplete, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ritual.steps[0].duration);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const step = ritual.steps[currentStep];
  const totalSteps = ritual.steps.length;
  const progress = timeLeft / step.duration;

  const tick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        // Move to next step
        if (currentStep < totalSteps - 1) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          return ritual.steps[nextStep].duration;
        } else {
          // All done
          clearInterval(intervalRef.current);
          setPlaying(false);
          setCompleted(true);
          const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
          onComplete(elapsed, totalSteps);
          return 0;
        }
      }
      return prev - 1;
    });
  }, [currentStep, totalSteps, ritual.steps, onComplete]);

  useEffect(() => {
    if (playing) {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, tick]);

  const skipStep = () => {
    if (currentStep < totalSteps - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setTimeLeft(ritual.steps[next].duration);
    } else {
      clearInterval(intervalRef.current);
      setPlaying(false);
      setCompleted(true);
      const elapsed = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000);
      onComplete(elapsed, currentStep + 1);
    }
  };

  const circumference = 2 * Math.PI * 120;
  const strokeOffset = circumference * progress;

  if (completed) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-12 text-center"
      >
        <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'rgba(45,212,191,0.15)', border: '2px solid rgba(45,212,191,0.3)' }}>
          <Check size={32} style={{ color: '#2DD4BF' }} />
        </div>
        <h2 className="text-3xl font-light mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Ritual Complete
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          You completed all {totalSteps} steps of {ritual.name}. Well done.
        </p>
        <button onClick={onClose} className="btn-glass glow-secondary" data-testid="ritual-done-btn">
          Return to Rituals
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 md:p-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
            Step {currentStep + 1} of {totalSteps}
          </p>
          <h2 className="text-2xl font-light mt-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {ritual.name}
          </h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--text-muted)' }} data-testid="ritual-close-btn">
          <X size={20} />
        </button>
      </div>

      {/* Step Progress Bar */}
      <div className="flex gap-1 mb-10">
        {ritual.steps.map((s, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full"
            style={{
              background: i < currentStep ? STEP_COLORS[s.type] : i === currentStep ? `${STEP_COLORS[s.type]}60` : 'rgba(255,255,255,0.06)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Current Step Display */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 260 260">
            <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
            <circle cx="130" cy="130" r="120" fill="none"
              stroke={STEP_COLORS[step.type]}
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
              opacity="0.7"
            />
          </svg>
          <div className="text-center z-10">
            <StepBadge type={step.type} />
            <p className="text-4xl font-light mt-4 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {formatDuration(timeLeft)}
            </p>
            <p className="text-sm" style={{ color: STEP_COLORS[step.type] }}>{step.name}</p>
            <p className="text-xs mt-1 capitalize" style={{ color: 'var(--text-muted)' }}>{step.type}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPlaying(!playing)}
            className="btn-glass px-8 py-4 flex items-center gap-3"
            style={{ boxShadow: playing ? `0 0 40px ${STEP_COLORS[step.type]}20` : undefined }}
            data-testid="ritual-play-btn"
          >
            {playing ? <Pause size={20} /> : <Play size={20} />}
            {playing ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={skipStep}
            className="btn-glass px-4 py-4"
            data-testid="ritual-skip-btn"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      {/* Upcoming Steps */}
      {currentStep < totalSteps - 1 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Coming Up</p>
          <div className="flex gap-2">
            {ritual.steps.slice(currentStep + 1).map((s, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-full"
                style={{ background: `${STEP_COLORS[s.type]}08`, border: `1px solid ${STEP_COLORS[s.type]}15` }}>
                <StepBadge type={s.type} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// --- Main Rituals Page ---
export default function Rituals() {
  const { user, authHeaders } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [myRituals, setMyRituals] = useState([]);
  const [history, setHistory] = useState(null);
  const [activeRitual, setActiveRitual] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderName, setBuilderName] = useState('');
  const [builderTime, setBuilderTime] = useState('morning');
  const [builderSteps, setBuilderSteps] = useState([]);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('templates');

  useEffect(() => {
    axios.get(`${API}/rituals/templates`).then(res => setTemplates(res.data)).catch(() => {});
    if (user) {
      axios.get(`${API}/rituals`, { headers: authHeaders }).then(res => setMyRituals(res.data)).catch(() => {});
      axios.get(`${API}/rituals/history`, { headers: authHeaders }).then(res => setHistory(res.data)).catch(() => {});
    }
  }, [user, authHeaders]);

  const startRitual = (ritual) => {
    setActiveRitual(ritual);
  };

  const handleComplete = async (duration, stepsCompleted) => {
    if (!user || !activeRitual?.id) return;
    try {
      await axios.post(`${API}/rituals/${activeRitual.id}/complete`, {
        duration_seconds: duration,
        steps_completed: stepsCompleted,
      }, { headers: authHeaders });
      toast.success('Ritual completed! Your energy is radiant.');
      // Refresh history
      const res = await axios.get(`${API}/rituals/history`, { headers: authHeaders });
      setHistory(res.data);
    } catch {
      // Template rituals don't have backend IDs, that's ok
      toast.success('Practice completed! Namaste.');
    }
  };

  const saveFromTemplate = async (template) => {
    if (!user) { toast.error('Sign in to save rituals'); return; }
    try {
      const res = await axios.post(`${API}/rituals`, {
        name: template.name,
        time_of_day: template.time_of_day,
        steps: template.steps,
      }, { headers: authHeaders });
      setMyRituals([res.data, ...myRituals]);
      toast.success(`${template.name} saved to your rituals`);
    } catch {
      toast.error('Could not save ritual');
    }
  };

  const saveCustom = async () => {
    if (!user) { toast.error('Sign in to save rituals'); return; }
    if (!builderName.trim()) { toast.error('Give your ritual a name'); return; }
    if (builderSteps.length === 0) { toast.error('Add at least one step'); return; }
    setSaving(true);
    try {
      const res = await axios.post(`${API}/rituals`, {
        name: builderName,
        time_of_day: builderTime,
        steps: builderSteps.map(s => ({ type: s.type, name: s.name, duration: s.duration, config: null })),
      }, { headers: authHeaders });
      setMyRituals([res.data, ...myRituals]);
      setShowBuilder(false);
      setBuilderName('');
      setBuilderSteps([]);
      toast.success('Custom ritual created!');
    } catch {
      toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  };

  const deleteRitual = async (id) => {
    try {
      await axios.delete(`${API}/rituals/${id}`, { headers: authHeaders });
      setMyRituals(myRituals.filter(r => r.id !== id));
      toast.success('Ritual released');
    } catch {
      toast.error('Could not delete');
    }
  };

  const addStep = (step) => {
    setBuilderSteps([...builderSteps, { ...step }]);
  };

  const removeStep = (index) => {
    setBuilderSteps(builderSteps.filter((_, i) => i !== index));
  };

  // Active ritual mode
  if (activeRitual) {
    return (
      <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }}>
        <div className="max-w-3xl mx-auto">
          <RitualPlayer
            ritual={activeRitual}
            onComplete={handleComplete}
            onClose={() => setActiveRitual(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-12" style={{ background: 'var(--bg-default)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#FCD34D' }}>
                <Sunrise size={14} className="inline mr-2" />
                Daily Rituals
              </p>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Ritual Builder
              </h1>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                Combine breathing, meditation, exercise, and more into your perfect daily practice.
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowBuilder(!showBuilder)}
                className="btn-glass flex items-center gap-2 mt-2"
                data-testid="ritual-create-btn"
              >
                <Plus size={16} />
                Create Ritual
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats Bar */}
        {history && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4 mb-10"
          >
            {[
              { label: 'Ritual Streak', value: history.ritual_streak, icon: Flame, color: '#FCD34D' },
              { label: 'Total Sessions', value: history.total_sessions, icon: Check, color: '#2DD4BF' },
              { label: 'Minutes Practiced', value: history.total_minutes, icon: Clock, color: '#D8B4FE' },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="glass-card p-5 flex items-center gap-4">
                  <Icon size={20} style={{ color: stat.color }} />
                  <div>
                    <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{stat.value}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Custom Builder */}
        <AnimatePresence>
          {showBuilder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-10"
            >
              <div className="glass-card p-8">
                <h3 className="text-xl font-light mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Design Your Ritual</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.2em] mb-2 block" style={{ color: 'var(--text-muted)' }}>Ritual Name</label>
                    <input
                      value={builderName}
                      onChange={(e) => setBuilderName(e.target.value)}
                      className="input-glass w-full"
                      placeholder="My Morning Practice"
                      data-testid="ritual-name-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.2em] mb-2 block" style={{ color: 'var(--text-muted)' }}>Time of Day</label>
                    <div className="flex gap-2">
                      {['morning', 'evening', 'anytime'].map(t => {
                        const Icon = TIME_ICONS[t];
                        return (
                          <button
                            key={t}
                            onClick={() => setBuilderTime(t)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm capitalize"
                            style={{
                              background: builderTime === t ? 'rgba(255,255,255,0.1)' : 'transparent',
                              border: `1px solid ${builderTime === t ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                              color: builderTime === t ? 'var(--text-primary)' : 'var(--text-muted)',
                              transition: 'background 0.3s, border-color 0.3s, color 0.3s',
                            }}
                            data-testid={`ritual-time-${t}`}
                          >
                            <Icon size={14} /> {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Added Steps */}
                {builderSteps.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>
                      Your Steps ({formatDuration(builderSteps.reduce((a, s) => a + s.duration, 0))} total)
                    </p>
                    <div className="space-y-2">
                      {builderSteps.map((step, i) => (
                        <div key={i} className="flex items-center gap-3 glass-card p-3">
                          <span className="text-xs w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: `${STEP_COLORS[step.type]}20`, color: STEP_COLORS[step.type] }}>
                            {i + 1}
                          </span>
                          <StepBadge type={step.type} />
                          <div className="flex-1">
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{step.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDuration(step.duration)}</p>
                          </div>
                          <button onClick={() => removeStep(i)} style={{ color: 'var(--text-muted)' }} data-testid={`ritual-remove-step-${i}`}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step Picker */}
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-muted)' }}>Add Steps</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-6 max-h-48 overflow-y-auto pr-1">
                  {AVAILABLE_STEPS.map((step, i) => (
                    <button
                      key={i}
                      onClick={() => addStep(step)}
                      className="glass-card p-3 text-left flex items-center gap-3 group"
                      style={{ transition: 'border-color 0.3s' }}
                      data-testid={`ritual-add-step-${i}`}
                    >
                      <StepBadge type={step.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{step.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDuration(step.duration)}</p>
                      </div>
                      <Plus size={12} className="opacity-0 group-hover:opacity-100" style={{ color: STEP_COLORS[step.type], transition: 'opacity 0.2s' }} />
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={saveCustom} disabled={saving} className="btn-glass glow-primary flex items-center gap-2" data-testid="ritual-save-btn"
                    style={{ opacity: saving ? 0.6 : 1 }}>
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    {saving ? 'Saving...' : 'Save Ritual'}
                  </button>
                  <button onClick={() => { setShowBuilder(false); setBuilderSteps([]); }} className="btn-glass" style={{ background: 'transparent' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[{ k: 'templates', l: 'Templates' }, { k: 'my-rituals', l: 'My Rituals' }, { k: 'history', l: 'History' }].map(t => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className="px-5 py-2 rounded-full text-sm"
              style={{
                background: tab === t.k ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: `1px solid ${tab === t.k ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                color: tab === t.k ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'background 0.3s, border-color 0.3s, color 0.3s',
              }}
              data-testid={`ritual-tab-${t.k}`}
            >
              {t.l}
            </button>
          ))}
        </div>

        {/* Templates */}
        {tab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((tmpl, i) => {
              const TimeIcon = TIME_ICONS[tmpl.time_of_day] || Zap;
              return (
                <motion.div
                  key={tmpl.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card p-6"
                  style={{ borderColor: `${tmpl.color}15` }}
                  data-testid={`template-${tmpl.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TimeIcon size={14} style={{ color: tmpl.color }} />
                        <span className="text-xs capitalize" style={{ color: tmpl.color }}>{tmpl.time_of_day}</span>
                      </div>
                      <h3 className="text-xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{tmpl.name}</h3>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{tmpl.description}</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                      {formatDuration(tmpl.total_duration)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {tmpl.steps.map((step, j) => (
                      <div key={j} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                        style={{ background: `${STEP_COLORS[step.type]}10`, color: STEP_COLORS[step.type], border: `1px solid ${STEP_COLORS[step.type]}20` }}>
                        <StepBadge type={step.type} />
                        <span>{step.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startRitual({ ...tmpl, steps: tmpl.steps })}
                      className="btn-glass flex items-center gap-2 text-sm"
                      data-testid={`template-start-${tmpl.id}`}
                    >
                      <Play size={14} /> Start Now
                    </button>
                    {user && (
                      <button
                        onClick={() => saveFromTemplate(tmpl)}
                        className="btn-glass text-sm flex items-center gap-2"
                        style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.08)' }}
                        data-testid={`template-save-${tmpl.id}`}
                      >
                        <Plus size={14} /> Save to My Rituals
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* My Rituals */}
        {tab === 'my-rituals' && (
          <div>
            {!user ? (
              <div className="glass-card p-12 text-center">
                <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>
                  Sign in to create and save your personal rituals.
                </p>
              </div>
            ) : myRituals.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-lg mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>
                  No rituals saved yet.
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Save a template or create your own custom ritual above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRituals.map((ritual, i) => {
                  const TimeIcon = TIME_ICONS[ritual.time_of_day] || Zap;
                  return (
                    <motion.div
                      key={ritual.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-6 flex items-center gap-6"
                      data-testid={`my-ritual-${i}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <TimeIcon size={14} style={{ color: 'var(--text-muted)' }} />
                          <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{ritual.time_of_day}</span>
                          {ritual.completions > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF' }}>
                              {ritual.completions}x completed
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{ritual.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {ritual.steps?.length || 0} steps &middot; {formatDuration(ritual.total_duration || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startRitual(ritual)}
                          className="btn-glass flex items-center gap-2 text-sm"
                          data-testid={`my-ritual-start-${i}`}
                        >
                          <Play size={14} /> Start
                        </button>
                        <button
                          onClick={() => deleteRitual(ritual.id)}
                          className="p-3 rounded-full"
                          style={{ color: 'var(--text-muted)' }}
                          data-testid={`my-ritual-delete-${i}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* History */}
        {tab === 'history' && (
          <div>
            {!user ? (
              <div className="glass-card p-12 text-center">
                <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>
                  Sign in to view your practice history.
                </p>
              </div>
            ) : !history?.completions?.length ? (
              <div className="glass-card p-12 text-center">
                <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>
                  No sessions completed yet. Start a ritual to begin tracking.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.completions.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-card p-5 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(45,212,191,0.1)' }}>
                      <Check size={16} style={{ color: '#2DD4BF' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.ritual_name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {c.steps_completed}/{c.total_steps} steps &middot; {formatDuration(c.duration_seconds)}
                      </p>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(c.completed_at).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
