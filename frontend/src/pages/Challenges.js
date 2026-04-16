import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  Flame, Trophy, Users, ChevronRight, Check, Clock,
  Wind, Timer, Sunrise, BookOpen, Heart, Zap, Radio,
  Star, Crown, Loader2, X, Calendar, Target
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ICON_MAP = {
  timer: Timer, wind: Wind, sunrise: Sunrise, book: BookOpen,
  heart: Heart, zap: Zap, radio: Radio,
};

function StreakFlame({ streak, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-14 h-14 text-xl', lg: 'w-20 h-20 text-3xl' };
  const intensity = Math.min(1, streak / 21);
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center relative`}
      style={{
        background: `radial-gradient(circle, rgba(252,211,77,${0.1 + intensity * 0.2}) 0%, transparent 70%)`,
      }}>
      <Flame size={size === 'lg' ? 32 : size === 'md' ? 24 : 16}
        style={{ color: streak > 0 ? `hsl(${40 - intensity * 20}, 95%, ${55 + intensity * 10}%)` : 'var(--text-muted)' }}
        fill={streak > 0 ? `hsl(${40 - intensity * 20}, 95%, ${55 + intensity * 10}%)` : 'none'}
      />
      {streak > 0 && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 ${20 + intensity * 30}px rgba(252,211,77,${intensity * 0.3})` }}
        />
      )}
    </div>
  );
}

function StreakCalendar({ checkins, durationDays }) {
  const today = new Date();
  const days = [];
  for (let i = durationDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const checked = checkins?.some(c => c.date === dateStr);
    days.push({ date: dateStr, checked, day: date.getDate(), weekday: date.toLocaleDateString('en', { weekday: 'narrow' }) });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {days.map((d, i) => (
        <div
          key={d.date}
          className="w-7 h-7 rounded-md flex items-center justify-center text-xs relative"
          style={{
            background: d.checked ? 'rgba(45,212,191,0.25)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${d.checked ? 'rgba(45,212,191,0.4)' : 'rgba(255,255,255,0.06)'}`,
            color: d.checked ? '#2DD4BF' : 'var(--text-muted)',
          }}
          title={d.date}
        >
          {d.checked ? <Check size={12} /> : <span style={{ fontSize: '0.6rem' }}>{d.day}</span>}
        </div>
      ))}
    </div>
  );
}

function ChallengeCard({ challenge, joined, participation, onJoin, onCheckin, onViewLeaderboard }) {
  const Icon = ICON_MAP[challenge.icon] || Zap;
  const progress = participation?.progress || 0;
  const todayChecked = participation?.checkins?.some(
    c => c.date === new Date().toISOString().split('T')[0]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden"
      data-testid={`challenge-${challenge.id}`}
    >
      {/* Progress bar at top */}
      {joined && (
        <div className="h-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-r-full"
            style={{ background: `linear-gradient(90deg, ${challenge.color}60, ${challenge.color})` }}
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: `${challenge.color}15`, border: `1px solid ${challenge.color}20` }}>
              <Icon size={20} style={{ color: challenge.color }} />
            </div>
            <div>
              <h3 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{challenge.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{challenge.duration_days} days</span>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                  {challenge.difficulty}
                </span>
              </div>
            </div>
          </div>
          {participation?.completed && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)' }}>
              <Trophy size={12} style={{ color: '#2DD4BF' }} />
              <span className="text-xs font-medium" style={{ color: '#2DD4BF' }}>Complete</span>
            </div>
          )}
        </div>

        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
          {challenge.description}
        </p>

        {/* Rewards */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {challenge.rewards?.map(r => (
            <span key={r} className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: `${challenge.color}10`, color: challenge.color, border: `1px solid ${challenge.color}15` }}>
              <Star size={10} /> {r}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><Users size={12} /> {challenge.participant_count || 0} joined</span>
          {challenge.completion_count > 0 && (
            <span className="flex items-center gap-1"><Trophy size={12} /> {challenge.completion_count} completed</span>
          )}
        </div>

        {/* Joined State */}
        {joined && participation && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <StreakFlame streak={participation.current_streak} size="sm" />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {participation.current_streak} day streak
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {participation.total_checkins}/{challenge.duration_days} days &middot; Best: {participation.best_streak}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium" style={{ color: challenge.color }}>{progress}%</span>
            </div>

            <StreakCalendar checkins={participation.checkins} durationDays={challenge.duration_days} />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {!joined ? (
            <button
              onClick={() => onJoin(challenge.id)}
              className="btn-glass flex items-center gap-2 text-sm"
              data-testid={`join-challenge-${challenge.id}`}
            >
              <Target size={14} /> Join Challenge
            </button>
          ) : !participation?.completed && !todayChecked ? (
            <button
              onClick={() => onCheckin(challenge.id)}
              className="btn-glass flex items-center gap-2 text-sm"
              style={{ boxShadow: `0 0 30px ${challenge.color}15` }}
              data-testid={`checkin-challenge-${challenge.id}`}
            >
              <Check size={14} /> Check In Today
            </button>
          ) : todayChecked && !participation?.completed ? (
            <span className="flex items-center gap-2 text-xs px-4 py-2 rounded-full"
              style={{ background: 'rgba(45,212,191,0.08)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.15)' }}>
              <Check size={14} /> Checked in today
            </span>
          ) : null}
          <button
            onClick={() => onViewLeaderboard(challenge.id)}
            className="btn-glass text-sm flex items-center gap-2"
            style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.08)' }}
            data-testid={`leaderboard-${challenge.id}`}
          >
            <Crown size={14} /> Leaderboard
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- Leaderboard Modal ---
function LeaderboardModal({ challengeId, challenges, onClose }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const challenge = challenges.find(c => c.id === challengeId);

  useEffect(() => {
    axios.get(`${API}/challenges/${challengeId}/leaderboard`)
      .then(res => setLeaders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [challengeId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'none'}}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="p-8 w-full max-w-md max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        data-testid="leaderboard-modal"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: challenge?.color || 'var(--text-muted)' }}>
              <Crown size={12} className="inline mr-1" /> Leaderboard
            </p>
            <h3 className="text-xl font-light mt-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {challenge?.name}
            </h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }} data-testid="close-leaderboard">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 size={24} className="animate-spin mx-auto" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : leaders.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
            No participants yet. Be the first!
          </p>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader, i) => (
              <div key={leader.user_id}
                className="flex items-center gap-4 p-3 rounded-xl"
                style={{
                  background: i < 3 ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border: `1px solid ${i < 3 ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
                }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: i === 0 ? 'rgba(252,211,77,0.2)' : i === 1 ? 'rgba(192,192,192,0.15)' : i === 2 ? 'rgba(205,127,50,0.15)' : 'rgba(255,255,255,0.05)',
                    color: i === 0 ? '#FCD34D' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-muted)',
                  }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {leader.user_name}
                    {leader.completed && <Trophy size={12} className="inline ml-1.5" style={{ color: '#2DD4BF' }} />}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {leader.total_checkins} check-ins &middot; Best streak: {leader.best_streak}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Flame size={14} style={{ color: leader.current_streak > 0 ? '#FCD34D' : 'var(--text-muted)' }}
                      fill={leader.current_streak > 0 ? '#FCD34D' : 'none'} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{leader.current_streak}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// --- Main Challenges Page ---
export default function Challenges() {
  const { user, authHeaders } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [tab, setTab] = useState('all');
  const [leaderboardId, setLeaderboardId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/challenges`)
      .then(res => setChallenges(res.data))
      .catch(() => toast.error('Could not load challenges'))
      .finally(() => setLoading(false));
    if (user) {
      axios.get(`${API}/challenges/my`, { headers: authHeaders })
        .then(res => setMyChallenges(res.data))
        .catch(() => {});
    }
  }, [user, authHeaders]);

  const joinedIds = myChallenges.map(m => m.challenge_id);

  const handleJoin = async (challengeId) => {
    if (!user) { toast.error('Sign in to join challenges'); return; }
    try {
      await axios.post(`${API}/challenges/${challengeId}/join`, {}, { headers: authHeaders });
      toast.success('Challenge accepted! Your journey begins.');
      const res = await axios.get(`${API}/challenges/my`, { headers: authHeaders });
      setMyChallenges(res.data);
      const cRes = await axios.get(`${API}/challenges`);
      setChallenges(cRes.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not join');
    }
  };

  const handleCheckin = async (challengeId) => {
    if (!user) return;
    try {
      const res = await axios.post(`${API}/challenges/${challengeId}/checkin`, { note: null }, { headers: authHeaders });
      if (res.data.completed) {
        toast.success(`Challenge complete! You achieved ${res.data.challenge_name}!`);
      } else {
        toast.success(`Day ${res.data.total_checkins} checked in! Streak: ${res.data.current_streak}`);
      }
      const myRes = await axios.get(`${API}/challenges/my`, { headers: authHeaders });
      setMyChallenges(myRes.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not check in');
    }
  };

  const activeChallenges = myChallenges.filter(m => !m.completed);
  const completedChallenges = myChallenges.filter(m => m.completed);
  const totalStreakDays = myChallenges.reduce((a, m) => a + (m.current_streak || 0), 0);
  const totalCheckins = myChallenges.reduce((a, m) => a + (m.total_checkins || 0), 0);

  return (
    <div className="min-h-screen immersive-page px-6 md:px-12 lg:px-24 py-12" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#FCD34D' }}>
            <Flame size={14} className="inline mr-2" />
            Community Challenges
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Rise Together
          </h1>
          <p className="text-base mb-12" style={{ color: 'var(--text-secondary)' }}>
            Join group challenges, build streaks, and grow your practice with the community.
          </p>
        </motion.div>

        {/* Stats Overview */}
        {user && myChallenges.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          >
            <div className="p-5 flex items-center gap-4">
              <StreakFlame streak={totalStreakDays} size="sm" />
              <div>
                <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{totalStreakDays}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Streaks</p>
              </div>
            </div>
            <div className="p-5 flex items-center gap-4">
              <Target size={20} style={{ color: '#2DD4BF' }} />
              <div>
                <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{activeChallenges.length}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Challenges</p>
              </div>
            </div>
            <div className="p-5 flex items-center gap-4">
              <Calendar size={20} style={{ color: '#D8B4FE' }} />
              <div>
                <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{totalCheckins}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Check-ins</p>
              </div>
            </div>
            <div className="p-5 flex items-center gap-4">
              <Trophy size={20} style={{ color: '#FCD34D' }} />
              <div>
                <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{completedChallenges.length}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Completed</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { k: 'all', l: 'All Challenges' },
            { k: 'active', l: `Active (${activeChallenges.length})` },
            { k: 'completed', l: `Completed (${completedChallenges.length})` },
          ].map(t => (
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
              data-testid={`challenge-tab-${t.k}`}
            >
              {t.l}
            </button>
          ))}
        </div>

        {/* Challenge Grid */}
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="animate-spin mx-auto" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tab === 'all' && challenges.map(c => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                joined={joinedIds.includes(c.id)}
                participation={myChallenges.find(m => m.challenge_id === c.id)}
                onJoin={handleJoin}
                onCheckin={handleCheckin}
                onViewLeaderboard={setLeaderboardId}
              />
            ))}
            {tab === 'active' && (activeChallenges.length === 0 ? (
              <div className="p-12 text-center md:col-span-2">
                <Target size={32} className="mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>
                  No active challenges. Browse the All tab to join one.
                </p>
              </div>
            ) : activeChallenges.map(m => (
              <ChallengeCard
                key={m.challenge_id}
                challenge={m.challenge}
                joined={true}
                participation={m}
                onJoin={handleJoin}
                onCheckin={handleCheckin}
                onViewLeaderboard={setLeaderboardId}
              />
            )))}
            {tab === 'completed' && (completedChallenges.length === 0 ? (
              <div className="p-12 text-center md:col-span-2">
                <Trophy size={32} className="mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p className="text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-muted)' }}>
                  No completed challenges yet. Keep going!
                </p>
              </div>
            ) : completedChallenges.map(m => (
              <ChallengeCard
                key={m.challenge_id}
                challenge={m.challenge}
                joined={true}
                participation={m}
                onJoin={handleJoin}
                onCheckin={handleCheckin}
                onViewLeaderboard={setLeaderboardId}
              />
            )))}
          </div>
        )}

        {/* Leaderboard Modal */}
        <AnimatePresence>
          {leaderboardId && (
            <LeaderboardModal
              challengeId={leaderboardId}
              challenges={challenges}
              onClose={() => setLeaderboardId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
