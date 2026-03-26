import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Check, Loader2, ChevronRight, Sparkles, Wind, Flame, Target } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STEP_ICONS = {
  breathing: Wind, yoga: Flame, meditation: Sun, aromatherapy: Sparkles,
  reiki: Sparkles, acupressure: Target, elixir: Sparkles, journal: ChevronRight,
};

function RitualStep({ step, index, completed, onComplete }) {
  const isCompleted = completed.includes(index);
  const Icon = STEP_ICONS[step.type] || Sparkles;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex items-start gap-4 p-4 rounded-xl transition-all"
      data-testid={`ritual-step-${index}`}
      style={{
        background: isCompleted ? 'rgba(34,197,94,0.06)' : 'rgba(15,17,28,0.5)',
        border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.2)' : 'rgba(248,250,252,0.06)'}`,
      }}>
      <button onClick={() => onComplete(index)} data-testid={`complete-step-${index}`}
        className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: isCompleted ? 'rgba(34,197,94,0.2)' : 'rgba(248,250,252,0.05)',
          border: `2px solid ${isCompleted ? '#22C55E' : 'rgba(248,250,252,0.12)'}`,
        }}>
        {isCompleted && <Check size={14} style={{ color: '#22C55E' }} />}
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Icon size={14} style={{ color: isCompleted ? '#22C55E' : 'rgba(248,250,252,0.5)' }} />
          <p className={`text-sm font-medium ${isCompleted ? 'line-through' : ''}`}
            style={{ color: isCompleted ? 'rgba(248,250,252,0.35)' : '#F8FAFC' }}>{step.name}</p>
          <span className="text-[10px] ml-auto px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(248,250,252,0.05)', color: 'rgba(248,250,252,0.3)' }}>{step.duration} min</span>
        </div>
        <p className="text-xs" style={{ color: isCompleted ? 'rgba(248,250,252,0.25)' : 'rgba(248,250,252,0.5)' }}>
          {step.instruction}
        </p>
      </div>
    </motion.div>
  );
}

export default function DailyRitual() {
  const { token, authHeaders } = useAuth();
  const [ritual, setRitual] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [timeOfDay, setTimeOfDay] = useState(() => {
    const h = new Date().getHours();
    return h < 14 ? 'morning' : 'evening';
  });
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const fetchRitual = async (tod) => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await axios.get(`${API}/daily-ritual/generate?time_of_day=${tod}`, { headers: authHeaders });
      setRitual(r.data);
      setCompleted(r.data.completed_steps || []);
    } catch { toast.error('Failed to generate ritual'); }
    setLoading(false);
  };

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const r = await axios.get(`${API}/daily-ritual/profile`, { headers: authHeaders });
      setProfile(r.data);
    } catch {}
  };

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
      if (r.data.is_complete) toast.success('Ritual complete! Namaste.');
    } catch { toast.error('Failed'); }
  };

  const steps = ritual?.ritual?.steps || [];
  const totalDuration = ritual?.ritual?.total_duration || 0;
  const progressPct = steps.length ? Math.round((completed.length / steps.length) * 100) : 0;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-3xl mx-auto" data-testid="daily-ritual-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#D8B4FE' }}>
            <Sparkles size={12} className="inline mr-1" /> Personalized For You
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F8FAFC' }}>
            Your Daily Wellness Ritual
          </h1>
          <p className="text-sm" style={{ color: 'rgba(248,250,252,0.45)' }}>
            {profile?.personalization_level === 'Deep' ? 'Deeply personalized to your journey' :
             profile?.personalization_level === 'Growing' ? 'Getting to know your practice' :
             'A ritual crafted just for you — it evolves as you do'}
          </p>
        </div>

        {/* Time of Day Toggle */}
        <div className="flex gap-3 justify-center mb-6">
          {[{ id: 'morning', label: 'Morning Ritual', icon: Sun, color: '#FCD34D' },
            { id: 'evening', label: 'Evening Ritual', icon: Moon, color: '#818CF8' }].map(t => (
            <button key={t.id} onClick={() => { setTimeOfDay(t.id); }}
              data-testid={`tod-${t.id}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: timeOfDay === t.id ? `${t.color}15` : 'rgba(15,17,28,0.4)',
                border: `1px solid ${timeOfDay === t.id ? `${t.color}35` : 'rgba(248,250,252,0.06)'}`,
                color: timeOfDay === t.id ? t.color : 'rgba(248,250,252,0.5)',
              }}><t.icon size={16} />{t.label}</button>
          ))}
        </div>

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
                <RitualStep key={i} step={step} index={i} completed={completed} onComplete={completeStep} />
              ))}
            </div>
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
