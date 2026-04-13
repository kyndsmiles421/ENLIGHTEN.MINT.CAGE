import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Check, Loader2, ChevronRight, Sparkles, Wind, Flame, Target, Play, Pause, SkipForward, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { CosmicBanner } from '../components/CosmicBanner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STEP_ICONS = {
  breathing: Wind, yoga: Flame, meditation: Sun, aromatherapy: Sparkles,
  reiki: Sparkles, acupressure: Target, elixir: Sparkles, journal: ChevronRight,
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function RitualStep({ step, index, completed, activeIndex, onActivate, onComplete }) {
  const isCompleted = completed.includes(index);
  const isActive = activeIndex === index && !isCompleted;
  const Icon = STEP_ICONS[step.type] || Sparkles;

  const [timeLeft, setTimeLeft] = useState(step.duration * 60);
  const [running, setRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const intervalRef = useRef(null);

  // Reset timer when step becomes active
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('daily_ritual', 8); }, []);
  useEffect(() => {
    if (isActive) {
      setTimeLeft(step.duration * 60);
      setRunning(false);
      setTimerDone(false);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, step.duration]);

  // Countdown logic
  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setTimerDone(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, timeLeft]);

  const handleClick = () => {
    if (isCompleted) return;
    onActivate(isActive ? null : index);
  };

  const handleStartPause = () => {
    setRunning(prev => !prev);
  };

  const handleSkipTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(0);
    setRunning(false);
    setTimerDone(true);
  };

  const handleMarkComplete = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    onComplete(index);
  };

  const totalSec = step.duration * 60;
  const progress = totalSec > 0 ? ((totalSec - timeLeft) / totalSec) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, layout: { duration: 0.3 } }}
      data-testid={`ritual-step-${index}`}
      className="rounded-xl overflow-hidden transition-all cursor-pointer"
      style={{
        background: isCompleted ? 'rgba(34,197,94,0.06)' : isActive ? 'rgba(216,180,254,0.06)' : 'rgba(15,17,28,0.5)',
        border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.2)' : isActive ? 'rgba(216,180,254,0.25)' : 'rgba(248,250,252,0.06)'}`,
      }}>
      {/* Step Header - always visible */}
      <div
        onClick={handleClick}
        data-testid={`step-header-${index}`}
        className="flex items-start gap-4 p-4"
      >
        <div
          className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: isCompleted ? 'rgba(34,197,94,0.2)' : isActive ? 'rgba(216,180,254,0.15)' : 'rgba(248,250,252,0.05)',
            border: `2px solid ${isCompleted ? '#22C55E' : isActive ? '#D8B4FE' : 'rgba(248,250,252,0.12)'}`,
          }}>
          {isCompleted ? <Check size={14} style={{ color: '#22C55E' }} /> :
           isActive ? <Play size={12} style={{ color: '#D8B4FE' }} /> :
           <span className="text-[10px] font-bold" style={{ color: 'rgba(248,250,252,0.3)' }}>{index + 1}</span>}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon size={14} style={{ color: isCompleted ? '#22C55E' : isActive ? '#D8B4FE' : 'rgba(248,250,252,0.5)' }} />
            <p className={`text-sm font-medium ${isCompleted ? 'line-through' : ''}`}
              style={{ color: isCompleted ? 'rgba(248,250,252,0.35)' : isActive ? '#F8FAFC' : '#F8FAFC' }}>{step.name}</p>
            <span className="text-[10px] ml-auto px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(248,250,252,0.05)', color: isActive ? '#D8B4FE' : 'rgba(248,250,252,0.3)' }}>{step.duration} min</span>
          </div>
          {!isActive && (
            <p className="text-xs" style={{ color: isCompleted ? 'rgba(248,250,252,0.25)' : 'rgba(248,250,252,0.5)' }}>
              {step.instruction}
            </p>
          )}
        </div>
      </div>

      {/* Expanded Active State */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-0">
              {/* Instruction box */}
              <div className="rounded-lg p-3 mb-4"
                style={{ background: 'rgba(216,180,254,0.05)', border: '1px solid rgba(216,180,254,0.1)' }}>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,252,0.7)' }}>
                  {step.instruction}
                </p>
              </div>

              {/* Timer */}
              <div className="flex flex-col items-center gap-3 mb-4">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(248,250,252,0.06)" strokeWidth="5" />
                    <circle cx="50" cy="50" r="44" fill="none" stroke={timerDone ? '#22C55E' : '#D8B4FE'}
                      strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 44}`}
                      strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                      style={{ transition: 'stroke-dashoffset 1s linear' }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Timer size={14} style={{ color: timerDone ? '#22C55E' : '#D8B4FE', marginBottom: '2px' }} />
                    <span className="text-lg font-mono font-bold" data-testid={`timer-${index}`}
                      style={{ color: timerDone ? '#22C55E' : '#F8FAFC' }}>{formatTime(timeLeft)}</span>
                  </div>
                </div>

                {/* Timer controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleStartPause}
                    data-testid={`timer-toggle-${index}`}
                    disabled={timerDone}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: running ? 'rgba(248,250,252,0.08)' : 'rgba(216,180,254,0.15)',
                      border: `1px solid ${running ? 'rgba(248,250,252,0.12)' : 'rgba(216,180,254,0.3)'}`,
                      color: running ? '#F8FAFC' : '#D8B4FE',
                      opacity: timerDone ? 0.4 : 1,
                    }}>
                    {running ? <><Pause size={12} /> Pause</> : <><Play size={12} /> {timeLeft === step.duration * 60 ? 'Start' : 'Resume'}</>}
                  </button>
                  <button
                    onClick={handleSkipTimer}
                    data-testid={`skip-timer-${index}`}
                    disabled={timerDone}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all"
                    style={{
                      background: 'rgba(248,250,252,0.04)',
                      border: '1px solid rgba(248,250,252,0.08)',
                      color: 'rgba(248,250,252,0.4)',
                      opacity: timerDone ? 0.4 : 1,
                    }}>
                    <SkipForward size={12} /> Skip
                  </button>
                </div>
              </div>

              {/* Mark Complete Button */}
              <motion.button
                onClick={handleMarkComplete}
                data-testid={`complete-step-${index}`}
                animate={{ scale: timerDone ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 0.4, repeat: timerDone ? 2 : 0 }}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  background: timerDone ? 'linear-gradient(135deg, #22C55E, #16A34A)' : 'rgba(248,250,252,0.06)',
                  color: timerDone ? '#FFF' : 'rgba(248,250,252,0.4)',
                  border: `1px solid ${timerDone ? 'rgba(34,197,94,0.4)' : 'rgba(248,250,252,0.08)'}`,
                }}>
                <Check size={16} />
                {timerDone ? 'Mark Complete' : 'Complete Step'}
              </motion.button>
              {!timerDone && (
                <p className="text-center text-[10px] mt-2" style={{ color: 'rgba(248,250,252,0.25)' }}>
                  Start the timer or skip to mark this step complete
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DailyRitual() {
  const { token, authHeaders } = useAuth();
  const [ritual, setRitual] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState(() => {
    const h = new Date().getHours();
    return h < 14 ? 'morning' : 'evening';
  });
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const fetchRitual = useCallback(async (tod) => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await axios.get(`${API}/daily-ritual/generate?time_of_day=${tod}`, { headers: authHeaders });
      setRitual(r.data);
      setCompleted(r.data.completed_steps || []);
    } catch { toast.error('Failed to generate ritual'); }
    setLoading(false);
  }, [token, authHeaders]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const r = await axios.get(`${API}/daily-ritual/profile`, { headers: authHeaders });
      setProfile(r.data);
    } catch {}
  }, [token, authHeaders]);

  useEffect(() => {
    fetchRitual(timeOfDay);
    fetchProfile();
  }, [token, timeOfDay]);

  const completeStep = async (index) => {
    if (!ritual) return;
    if (completed.includes(index)) return;
    try {
      const r = await axios.post(`${API}/daily-ritual/complete-step`, {
        ritual_id: ritual.id, step_index: index,
      }, { headers: authHeaders });
      setCompleted(r.data.completed_steps);
      setActiveIndex(null);
      if (r.data.is_complete) {
        toast.success('Ritual complete! Namaste.');
      } else {
        // Auto-advance to next incomplete step
        const steps = ritual?.ritual?.steps || [];
        const nextIncomplete = steps.findIndex((_, i) => i > index && !r.data.completed_steps.includes(i));
        if (nextIncomplete !== -1) {
          setTimeout(() => setActiveIndex(nextIncomplete), 400);
        }
      }
    } catch { toast.error('Failed to save progress'); }
  };

  const steps = ritual?.ritual?.steps || [];
  const totalDuration = ritual?.ritual?.total_duration || 0;
  const progressPct = steps.length ? Math.round((completed.length / steps.length) * 100) : 0;

  return (
    <div className="min-h-screen immersive-page pt-24 pb-20 px-4 max-w-3xl mx-auto" data-testid="daily-ritual-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#D8B4FE' }}>
            <Sparkles size={12} className="inline mr-1" /> Personalized For You
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Your Daily Wellness Ritual
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {profile?.personalization_level === 'Deep' ? 'Deeply personalized to your journey' :
             profile?.personalization_level === 'Growing' ? 'Getting to know your practice' :
             'A ritual crafted just for you — it evolves as you do'}
          </p>
        </div>

        {/* Time of Day Toggle */}
        <div className="flex gap-3 justify-center mb-6">
          {[{ id: 'morning', label: 'Morning Ritual', icon: Sun, color: '#FCD34D' },
            { id: 'evening', label: 'Evening Ritual', icon: Moon, color: '#818CF8' }].map(t => (
            <button key={t.id} onClick={() => { setTimeOfDay(t.id); setActiveIndex(null); }}
              data-testid={`tod-${t.id}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: timeOfDay === t.id ? `${t.color}15` : 'rgba(15,17,28,0.4)',
                border: `1px solid ${timeOfDay === t.id ? `${t.color}35` : 'rgba(248,250,252,0.06)'}`,
                color: timeOfDay === t.id ? t.color : 'rgba(248,250,252,0.5)',
              }}><t.icon size={16} />{t.label}</button>
          ))}
        </div>

        {/* Cosmic Alignment Banner */}
        {token && <CosmicBanner filter={['yoga', 'aromatherapy', 'breathing', 'reiki', 'acupressure']} compact />}

        {!token ? (
          <p className="text-center text-sm py-12" style={{ color: 'rgba(248,250,252,0.4)' }}>Sign in to receive your personalized daily ritual</p>
        ) : loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin" size={28} style={{ color: '#D8B4FE' }} /></div>
        ) : ritual ? (
          <>
            {/* Progress Bar */}
            <div className="rounded-2xl p-5 mb-6"
              style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(216,180,254,0.1)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs" style={{ color: 'rgba(248,250,252,0.5)' }}>
                  {completed.length} of {steps.length} steps | ~{totalDuration} min total
                </p>
                <span className="text-xs font-bold" style={{ color: progressPct === 100 ? '#22C55E' : '#D8B4FE' }}>
                  {progressPct}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.06)' }}>
                <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: progressPct === 100 ? '#22C55E' : 'linear-gradient(90deg, #D8B4FE, #818CF8)' }} />
              </div>
              {profile && (
                <p className="text-[10px] mt-2" style={{ color: 'rgba(248,250,252,0.25)' }}>
                  Level: {profile.profile?.experience_level} | Streak: {profile.profile?.streak || 0} days |
                  Mood: {profile.profile?.dominant_mood}
                </p>
              )}
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step, i) => (
                <RitualStep key={i} step={step} index={i} completed={completed}
                  activeIndex={activeIndex} onActivate={setActiveIndex} onComplete={completeStep} />
              ))}
            </div>

            {progressPct === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-6 rounded-2xl p-6 text-center"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Check size={32} style={{ color: '#22C55E', margin: '0 auto 8px' }} />
                <h3 className="text-lg font-bold mb-1" style={{ color: '#22C55E' }}>Ritual Complete</h3>
                <p className="text-xs" style={{ color: 'rgba(248,250,252,0.5)' }}>
                  You've completed your {timeOfDay} ritual. Honor this moment of self-care.
                </p>
              </motion.div>
            )}
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
