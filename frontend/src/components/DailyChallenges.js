/**
 * DailyChallenges.js — V56.1 Cross-Module Daily Challenges UI
 * 
 * Displays the 4 elemental daily challenges with real-time task progress.
 * Can be embedded in the Sovereign Hub or any page.
 * Each challenge has multi-room tasks that span the entire app.
 * 
 * V56.2 — task rows are now tap-to-navigate. Tapping "Complete 3 breathing
 * sessions" routes to /breathing where the user can actually do the activity.
 * The progress counters increment when xp_log records the source-event.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Droplets, Wind, Mountain, Award, Check, ChevronRight, Zap, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ELEMENT_ICONS = {
  Earth: Mountain,
  Air: Wind,
  Fire: Flame,
  Water: Droplets,
};

// Map backend xp_log source slugs → frontend route a user should visit to
// progress that task. This is the *tap target* for each task row.
const TASK_SOURCE_TO_ROUTE = {
  // Air Temple
  breathing_exercise: '/breathing',
  oracle_reading: '/oracle',
  frequencies: '/soundscapes',
  // Fire of Transformation
  meditation_session: '/meditation',
  elixirs: '/elixirs',
  mantras: '/mantras',
  // Waters of Healing
  herbology: '/herbology',
  reiki: '/reiki',
  mood_log: '/mood',
  // Earth Element
  crystals: '/crystals',
  yoga_practice: '/yoga',
  dream_journal: '/dreams',
};

function ChallengeCard({ challenge, onClaim }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const Icon = ELEMENT_ICONS[challenge.element] || Zap;
  const allDone = challenge.all_tasks_done;
  const claimed = challenge.claimed;
  const tasksComplete = challenge.tasks.filter(t => t.done).length;
  const totalTasks = challenge.tasks.length;

  const handleClaim = async () => {
    if (!allDone || claimed || claiming) return;
    setClaiming(true);
    try {
      await onClaim(challenge.id);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: claimed ? 'rgba(255,255,255,0.01)' : `${challenge.color}04`,
        border: `1px solid ${allDone && !claimed ? `${challenge.color}40` : claimed ? 'rgba(255,255,255,0.04)' : `${challenge.color}15`}`,
        boxShadow: allDone && !claimed ? `0 0 20px ${challenge.color}15` : 'none',
        opacity: claimed ? 0.5 : 1,
      }}
      data-testid={`challenge-${challenge.id}`}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: `${challenge.color}12`,
            border: `1px solid ${challenge.color}25`,
          }}>
          <Icon size={16} style={{ color: challenge.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold truncate" style={{ color: claimed ? 'rgba(255,255,255,0.4)' : '#fff' }}>
              {challenge.name}
            </p>
            {claimed && <Check size={12} style={{ color: '#22C55E' }} />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px]" style={{ color: `${challenge.color}80` }}>
              {tasksComplete}/{totalTasks} tasks
            </span>
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {challenge.xp_reward} XP x{challenge.xp_multiplier}
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="h-1 rounded-full mt-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(tasksComplete / totalTasks) * 100}%`,
                background: claimed ? '#22C55E' : challenge.color,
              }} />
          </div>
        </div>
        <ChevronRight size={14} style={{
          color: 'rgba(255,255,255,0.2)',
          transform: expanded ? 'rotate(90deg)' : 'none',
          transition: 'transform 0.2s',
        }} />
      </button>

      {/* Expanded tasks */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2">
              <p className="text-[10px] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {challenge.description}
              </p>
              {challenge.tasks.map((task, i) => {
                const route = TASK_SOURCE_TO_ROUTE[task.source];
                const tappable = !!route && !task.done;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { if (tappable) navigate(route); }}
                    disabled={!tappable}
                    className="w-full flex items-center gap-2.5 py-1.5 px-1 -mx-1 rounded-md text-left active:scale-[0.98] transition-all"
                    style={{
                      borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      cursor: tappable ? 'pointer' : 'default',
                      background: 'transparent',
                    }}
                    data-testid={`task-${challenge.id}-${i}`}>
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{
                        background: task.done ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${task.done ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      {task.done ? (
                        <Check size={10} style={{ color: '#22C55E' }} />
                      ) : (
                        <span className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {task.current}
                        </span>
                      )}
                    </div>
                    <span className="text-xs flex-1" style={{
                      color: task.done ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)',
                      textDecoration: task.done ? 'line-through' : 'none',
                    }}>
                      {task.label}
                    </span>
                    <span className="text-[9px] font-mono" style={{ color: task.done ? '#22C55E' : 'rgba(255,255,255,0.3)' }}>
                      {task.current}/{task.count}
                    </span>
                    {tappable && (
                      <ArrowRight size={11} style={{ color: challenge.color, opacity: 0.7 }} />
                    )}
                  </button>
                );
              })}

              {/* Claim button */}
              {allDone && !claimed && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold mt-2"
                  style={{
                    background: `${challenge.color}15`,
                    border: `1px solid ${challenge.color}30`,
                    color: challenge.color,
                    boxShadow: `0 0 15px ${challenge.color}15`,
                  }}
                  data-testid={`claim-${challenge.id}`}
                >
                  <Award size={14} />
                  {claiming ? 'Claiming...' : `Claim ${Math.round(challenge.xp_reward * challenge.xp_multiplier)} XP`}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DailyChallenges({ compact = false }) {
  const { user, authHeaders } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/challenges/daily-cross-module`, { headers: authHeaders });
      setChallenges(res.data?.challenges || []);
    } catch (e) {
      // Non-critical - challenges are optional
      console.log('Daily challenges fetch:', e?.response?.status || e?.message);
    }
    setLoading(false);
  }, [user, authHeaders]);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const handleClaim = async (challengeId) => {
    try {
      const res = await axios.post(`${API}/challenges/daily-cross-module/claim`, {
        challenge_id: challengeId,
      }, { headers: authHeaders });
      if (res.data?.claimed) {
        toast.success(`Challenge complete! +${res.data.xp_earned} XP earned`);
        fetchChallenges();
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not claim challenge');
    }
  };

  if (!user || (loading && challenges.length === 0)) return null;

  return (
    <div data-testid="daily-challenges">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={12} style={{ color: '#FBBF24' }} />
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#FBBF24' }}>
          Daily Elemental Challenges
        </span>
      </div>
      <div className={compact ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-2'}>
        {challenges.map(ch => (
          <ChallengeCard key={ch.id} challenge={ch} onClaim={handleClaim} />
        ))}
      </div>
    </div>
  );
}
