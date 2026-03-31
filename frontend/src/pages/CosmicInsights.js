import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { CosmicInlineLoader, CosmicError, getCosmicErrorMessage } from '../components/CosmicFeedback';
import {
  ArrowLeft, Sun, Moon, Wind, Droplets, Flame, Mountain,
  Brain, Music, BookOpen, Heart, Zap, Star, ChevronRight,
  Lock, Gem, Sparkles, Eye, Clock, TrendingUp, Award,
  Activity, PenLine, Compass
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ELEMENT_COLORS = {
  Fire: '#EF4444', Water: '#3B82F6', Earth: '#22C55E', Air: '#A855F7',
};
const ELEMENT_ICONS = {
  Fire: Flame, Water: Droplets, Earth: Mountain, Air: Wind,
};

// ── Highlight Card (Stories-style) ──
function HighlightCard({ highlight, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-shrink-0 w-40 rounded-xl p-3 text-left transition-all"
      style={{ background: `${highlight.color}08`, border: `1px solid ${highlight.color}15` }}
      data-testid={`highlight-${highlight.type}`}>
      <p className="text-[10px] font-semibold mb-0.5" style={{ color: highlight.color }}>{highlight.title}</p>
      <p className="text-[8px] mb-2" style={{ color: 'var(--text-muted)' }}>{highlight.subtitle}</p>
      <span className="text-[7px] px-2 py-0.5 rounded-full"
        style={{ background: `${highlight.color}12`, color: highlight.color }}>
        {highlight.action_label} <ChevronRight size={8} className="inline" />
      </span>
    </motion.button>
  );
}

// ── Cosmic Weather Card ──
function WeatherCard({ weather }) {
  const elColor = ELEMENT_COLORS[weather.element] || '#818CF8';
  const ElIcon = ELEMENT_ICONS[weather.element] || Sun;
  return (
    <div className="rounded-xl p-4 mb-4" style={{ background: `${elColor}05`, border: `1px solid ${elColor}12` }}
      data-testid="cosmic-weather-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${elColor}10` }}>
            <ElIcon size={16} style={{ color: elColor }} />
          </div>
          <div>
            <p className="text-[11px] font-semibold" style={{ color: elColor }}>
              {weather.zodiac.sign} Season
            </p>
            <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{weather.element} Element</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Moon size={11} style={{ color: '#F59E0B' }} />
            <p className="text-[9px]" style={{ color: '#F59E0B' }}>{weather.lunar.phase}</p>
          </div>
          <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
            {weather.lunar.energy}
          </p>
        </div>
      </div>

      {/* AI Forecast */}
      <p className="text-[10px] leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
        {weather.forecast}
      </p>

      {/* Tool Recommendations */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-1 mb-1">
            <Music size={9} style={{ color: '#22C55E' }} />
            <span className="text-[7px] uppercase tracking-wider" style={{ color: '#22C55E' }}>Mixer</span>
          </div>
          <p className="text-[9px] font-medium" style={{ color: 'var(--text-primary)' }}>
            {weather.tool_recommendations.mixer.freq}
          </p>
          <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
            {weather.tool_recommendations.mixer.sound}
          </p>
        </div>
        <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-1 mb-1">
            <BookOpen size={9} style={{ color: '#818CF8' }} />
            <span className="text-[7px] uppercase tracking-wider" style={{ color: '#818CF8' }}>Sacred Text</span>
          </div>
          <p className="text-[8px]" style={{ color: 'var(--text-primary)' }}>
            {weather.tool_recommendations.sacred_text.slice(0, 60)}
          </p>
        </div>
      </div>

      {/* RPG Bonuses */}
      <div className="mt-2 rounded-lg p-2 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-1.5">
          <Zap size={10} style={{ color: '#F59E0B' }} />
          <span className="text-[8px]" style={{ color: 'var(--text-primary)' }}>
            RPG Boost: {Object.entries(weather.rpg_bonuses.stat_boosts).map(([k,v]) => `+${v}% ${k}`).join(', ')}
          </span>
        </div>
        {weather.lunar.xp_bonus > 0 && (
          <span className="text-[7px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B' }}>
            +{weather.lunar.xp_bonus} XP Lunar
          </span>
        )}
      </div>

      {/* Reset Pulse */}
      {weather.tool_recommendations.reset_pulse && (
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-2 rounded-lg p-2 text-center"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
          <p className="text-[8px] font-medium" style={{ color: '#EF4444' }}>
            Quick Reset Pulse Active — {weather.tool_recommendations.reset_reason}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ── Stat Card ──
function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: `${color}04`, border: `1px solid ${color}10` }}>
      <Icon size={14} className="mx-auto mb-1" style={{ color }} />
      <p className="text-lg font-semibold" style={{ color }}>{value}</p>
      <p className="text-[7px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {sub && <p className="text-[7px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MAIN PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function CosmicInsights() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [weather, setWeather] = useState(null);
  const [insights, setInsights] = useState(null);
  const [deepDive, setDeepDive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scholarClaimed, setScholarClaimed] = useState(false);
  const headers = authHeaders;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [wRes, iRes, dRes] = await Promise.all([
        axios.get(`${API}/reports/cosmic-weather`, { headers }),
        axios.get(`${API}/reports/insights`, { headers }),
        axios.get(`${API}/reports/deep-dive`, { headers }),
      ]);
      setWeather(wRes.data);
      setInsights(iRes.data);
      setDeepDive(dRes.data);
    } catch (err) {
      setError(getCosmicErrorMessage(err));
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const claimScholarBonus = async () => {
    try {
      const res = await axios.post(`${API}/reports/scholar-bonus`, {}, { headers });
      toast(`Scholar's Bonus! +${res.data.xp_awarded} XP`);
      setScholarClaimed(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Already claimed');
      setScholarClaimed(true);
    }
  };

  const unlockDeepDive = async () => {
    try {
      await axios.post(`${API}/reports/unlock-deep-dive`, {}, { headers });
      toast('Deep-Dive Analysis unlocked!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Unlock failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <CosmicInlineLoader message="Reading the cosmos..." />
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <CosmicError title={error.title} message={error.message} onRetry={fetchData} />
    </div>
  );

  const i = insights;
  const moodData = i?.mood_report || {};
  const medData = i?.meditation_report || {};
  const soundData = i?.soundscape_report || {};
  const journalData = i?.journal_report || {};

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }} data-testid="cosmic-insights-page">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.03)' }} data-testid="insights-back-btn">
          <ArrowLeft size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Cosmic Insights
          </h1>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Your Wellness Intelligence</p>
        </div>
        {!scholarClaimed && (
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={claimScholarBonus}
            className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[8px] font-medium"
            style={{ background: 'rgba(129,140,248,0.08)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.12)' }}
            data-testid="scholar-bonus-btn">
            <Award size={10} /> +25 XP
          </motion.button>
        )}
      </div>

      <div className="px-4">
        {/* Stories-style Highlights Reel */}
        {i?.highlights?.length > 0 && (
          <div className="mb-4">
            <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
              This Week's Highlights
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" data-testid="highlights-reel">
              {i.highlights.map((h, idx) => (
                <HighlightCard key={idx} highlight={h} onClick={() => navigate(h.action)} />
              ))}
            </div>
          </div>
        )}

        {/* Cosmic Weather */}
        {weather && (
          <>
            <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
              Today's Cosmic Weather
            </p>
            <WeatherCard weather={weather} />
          </>
        )}

        {/* Weekly Stats Grid */}
        <p className="text-[8px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          Weekly Overview
        </p>
        <div className="grid grid-cols-4 gap-2 mb-4" data-testid="weekly-stats">
          <StatCard icon={Heart} label="Moods" value={moodData.total_checkins || 0}
            sub={moodData.top_mood ? `Top: ${moodData.top_mood}` : null} color="#EF4444" />
          <StatCard icon={Brain} label="Meditations" value={medData.session_count || 0}
            sub={medData.total_minutes ? `${medData.total_minutes} min` : null} color="#818CF8" />
          <StatCard icon={PenLine} label="Journal" value={journalData.entries || 0} color="#22C55E" />
          <StatCard icon={Music} label="Mixes" value={soundData.mixes_created || 0}
            sub={soundData.top_sounds?.[0] ? soundData.top_sounds[0].sound : null} color="#F59E0B" />
        </div>

        {/* Peak Spiritual Hours */}
        {moodData.peak_hours?.length > 0 && (
          <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
            data-testid="peak-hours">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock size={11} style={{ color: '#A855F7' }} />
              <p className="text-[9px] font-medium" style={{ color: '#A855F7' }}>Peak Spiritual Hours</p>
            </div>
            <div className="flex gap-2">
              {moodData.peak_hours.map((ph, idx) => (
                <div key={idx} className="flex-1 rounded-lg p-2 text-center"
                  style={{ background: idx === 0 ? 'rgba(168,85,247,0.06)' : 'rgba(255,255,255,0.02)' }}>
                  <p className="text-sm font-semibold" style={{ color: idx === 0 ? '#A855F7' : 'var(--text-primary)' }}>
                    {ph.hour}:00
                  </p>
                  <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{ph.count} activities</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Soundscape Synergy */}
        {soundData.top_sounds?.length > 0 && (
          <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.08)' }}
            data-testid="soundscape-synergy">
            <div className="flex items-center gap-1.5 mb-2">
              <Music size={11} style={{ color: '#22C55E' }} />
              <p className="text-[9px] font-medium" style={{ color: '#22C55E' }}>Soundscape Synergy</p>
            </div>
            <div className="space-y-1.5">
              {soundData.top_sounds.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-[9px]" style={{ color: 'var(--text-primary)' }}>{s.sound}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min(100, (s.count / (soundData.top_sounds[0]?.count || 1)) * 100)}%`,
                        background: '#22C55E',
                      }} />
                    </div>
                    <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{s.count}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deep Dive Section */}
        <div className="rounded-xl overflow-hidden mb-4"
          style={{ border: '1px solid rgba(168,85,247,0.1)' }}
          data-testid="deep-dive-section">
          <div className="p-3" style={{ background: 'rgba(168,85,247,0.04)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Eye size={11} style={{ color: '#A855F7' }} />
                <p className="text-[10px] font-semibold" style={{ color: '#A855F7' }}>
                  Deep-Dive Monthly Analysis
                </p>
              </div>
              {deepDive?.locked && (
                <span className="flex items-center gap-0.5 text-[7px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(168,85,247,0.08)', color: '#A855F7' }}>
                  <Lock size={8} /> Premium
                </span>
              )}
            </div>

            {deepDive?.locked ? (
              <div>
                <p className="text-[8px] mb-2" style={{ color: 'var(--text-muted)' }}>
                  Unlock AI-powered insights into your 30-day wellness patterns
                </p>
                <div className="space-y-1 mb-3">
                  {deepDive.preview.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Sparkles size={8} style={{ color: '#A855F7' }} />
                      <span className="text-[8px]" style={{ color: 'var(--text-primary)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={unlockDeepDive}
                  className="w-full py-2 rounded-lg text-[9px] font-medium flex items-center justify-center gap-1"
                  style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.15)' }}
                  data-testid="unlock-deep-dive-btn">
                  <Gem size={10} /> Unlock for {deepDive.cost} Gems
                </motion.button>
              </div>
            ) : (
              <div>
                {/* Mood Trends */}
                {deepDive?.mood_trends && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1.5">
                      <TrendingUp size={9} style={{ color: '#EF4444' }} />
                      <span className="text-[8px] font-medium" style={{ color: 'var(--text-primary)' }}>Mood Trends</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg p-2" style={{ background: 'rgba(34,197,94,0.04)' }}>
                        <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>Best Day</p>
                        <p className="text-[10px] font-semibold" style={{ color: '#22C55E' }}>{deepDive.mood_trends.best_day}</p>
                      </div>
                      <div className="rounded-lg p-2" style={{ background: 'rgba(239,68,68,0.04)' }}>
                        <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>Needs Care</p>
                        <p className="text-[10px] font-semibold" style={{ color: '#EF4444' }}>{deepDive.mood_trends.worst_day}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Synergy Correlations */}
                {deepDive?.soundscape_synergy?.correlations?.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1.5">
                      <Activity size={9} style={{ color: '#22C55E' }} />
                      <span className="text-[8px] font-medium" style={{ color: 'var(--text-primary)' }}>
                        Sound-Mood Correlations
                      </span>
                    </div>
                    <div className="space-y-1">
                      {deepDive.soundscape_synergy.correlations.map((c, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[8px]">
                          <span style={{ color: 'var(--text-primary)' }}>{c.sound}</span>
                          <span style={{ color: '#22C55E' }}>mood score: {c.avg_mood}/10</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Predictions */}
                {deepDive?.ai_predictions && (
                  <div className="rounded-lg p-3" style={{ background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.08)' }}>
                    <div className="flex items-center gap-1 mb-1.5">
                      <Compass size={9} style={{ color: '#818CF8' }} />
                      <span className="text-[8px] font-medium" style={{ color: '#818CF8' }}>Oracle Predictions</span>
                    </div>
                    <p className="text-[8px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                      {deepDive.ai_predictions}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scripture Progress */}
        {i?.scripture_report?.steps_completed > 0 && (
          <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(129,140,248,0.03)', border: '1px solid rgba(129,140,248,0.08)' }}
            data-testid="scripture-progress">
            <div className="flex items-center gap-1.5 mb-1">
              <BookOpen size={11} style={{ color: '#818CF8' }} />
              <p className="text-[9px] font-medium" style={{ color: '#818CF8' }}>Sacred Text Progress</p>
            </div>
            <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
              {i.scripture_report.steps_completed} steps across {i.scripture_report.active_journeys} journey{i.scripture_report.active_journeys !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
